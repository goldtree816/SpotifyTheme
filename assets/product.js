class ProductPage {
  constructor() {
    this.product = window.productData || {};
    this.variants = this.product.variants || [];
    this.currentVariant = this.product.selected_or_first_available_variant;
    this.form = document.getElementById('product-form');
    this.variantInput = document.getElementById('variant-id');
    this.quantityInput = document.getElementById('quantity-input');
    this.addToCartBtn = document.getElementById('add-to-cart-btn');
    this.mainImage = document.getElementById('product-main-image');
    
    this.init();
  }

  init() {
    this.initImageGallery();
    this.initVariantSelection();
    this.initQuantityControls();
    this.initAddToCart();
  }

  initImageGallery() {
    const thumbnails = document.querySelectorAll('.product__thumbnail');
    
    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', () => {
        const imageUrl = thumbnail.dataset.image;
        const imageAlt = thumbnail.dataset.alt;
        
        // Update main image
        if (this.mainImage) {
          this.mainImage.src = imageUrl;
          this.mainImage.alt = imageAlt;
        }
        
        // Update active thumbnail
        thumbnails.forEach(thumb => thumb.classList.remove('product__thumbnail--active'));
        thumbnail.classList.add('product__thumbnail--active');
      });
    });
  }

  initVariantSelection() {
    const optionButtons = document.querySelectorAll('.product__option-value');
    
    optionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const optionName = button.dataset.option;
        const optionValue = button.dataset.value;
        
        // Update selected state
        const optionGroup = button.closest('.product__option-values');
        optionGroup.querySelectorAll('.product__option-value').forEach(btn => {
          btn.classList.remove('product__option-value--selected');
        });
        button.classList.add('product__option-value--selected');
        
        // Find matching variant
        this.updateVariantSelection();
      });
    });
  }

  updateVariantSelection() {
    const selectedOptions = {};
    
    // Get all selected option values
    document.querySelectorAll('.product__option-value--selected').forEach(button => {
      const optionName = button.dataset.option;
      const optionValue = button.dataset.value;
      selectedOptions[optionName] = optionValue;
    });
    
    // Find matching variant
    const matchingVariant = this.findMatchingVariant(selectedOptions);
    
    if (matchingVariant) {
      this.currentVariant = matchingVariant;
      this.variantInput.value = matchingVariant.id;
      
      // Update price
      this.updatePrice(matchingVariant);
      
      // Update availability
      this.updateAvailability(matchingVariant);
      
      // Update variant image if available
      if (matchingVariant.featured_image) {
        this.updateVariantImage(matchingVariant.featured_image);
      }
    }
  }

  findMatchingVariant(selectedOptions) {
    return this.variants.find(variant => {
      return Object.keys(selectedOptions).every(optionName => {
        const variantOptionValue = variant.options.find(option => 
          option.name.toLowerCase().replace(/\s+/g, '-') === optionName
        );
        return variantOptionValue && 
               variantOptionValue.value.toLowerCase().replace(/\s+/g, '-') === selectedOptions[optionName];
      });
    });
  }

  updatePrice(variant) {
    const priceContainer = document.querySelector('.product__price');
    if (!priceContainer) return;
    
    const currentPrice = priceContainer.querySelector('.product__current-price');
    const oldPrice = priceContainer.querySelector('.product__old-price');
    const discount = priceContainer.querySelector('.product__discount');
    
    if (currentPrice) {
      currentPrice.textContent = this.formatMoney(variant.price);
    }
    
    if (variant.compare_at_price && variant.compare_at_price > variant.price) {
      if (oldPrice) {
        oldPrice.textContent = this.formatMoney(variant.compare_at_price);
        oldPrice.style.display = 'inline';
      }
      if (discount) {
        const savings = variant.compare_at_price - variant.price;
        discount.textContent = `Save ${this.formatMoney(savings)}`;
        discount.style.display = 'inline';
      }
    } else {
      if (oldPrice) oldPrice.style.display = 'none';
      if (discount) discount.style.display = 'none';
    }
  }

  updateAvailability(variant) {
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const soldOutBtn = document.querySelector('.product__sold-out');
    
    if (variant.available) {
      if (addToCartBtn) {
        addToCartBtn.disabled = false;
        addToCartBtn.style.display = 'block';
      }
      if (soldOutBtn) {
        soldOutBtn.style.display = 'none';
      }
    } else {
      if (addToCartBtn) {
        addToCartBtn.disabled = true;
        addToCartBtn.style.display = 'none';
      }
      if (soldOutBtn) {
        soldOutBtn.style.display = 'block';
      }
    }
  }

  updateVariantImage(image) {
    if (this.mainImage) {
      this.mainImage.src = image.src;
      this.mainImage.alt = image.alt || this.product.title;
    }
  }

  initQuantityControls() {
    const decreaseBtn = document.querySelector('[data-action="decrease"]');
    const increaseBtn = document.querySelector('[data-action="increase"]');
    
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(this.quantityInput.value) || 1;
        if (currentValue > 1) {
          this.quantityInput.value = currentValue - 1;
        }
      });
    }
    
    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(this.quantityInput.value) || 1;
        this.quantityInput.value = currentValue + 1;
      });
    }
    
    // Ensure quantity is always at least 1
    if (this.quantityInput) {
      this.quantityInput.addEventListener('change', () => {
        const value = parseInt(this.quantityInput.value) || 1;
        if (value < 1) {
          this.quantityInput.value = 1;
        }
      });
    }
  }

  initAddToCart() {
    if (this.form) {
      this.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!this.currentVariant || !this.currentVariant.available) {
          this.showMessage('Product is not available', 'error');
          return;
        }
        
        await this.addToCart();
      });
    }
  }

  async addToCart() {
    if (!this.addToCartBtn) return;
    
    // Show loading state
    this.addToCartBtn.classList.add('loading');
    
    try {
      const formData = new FormData(this.form);
      
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        this.showMessage('Product added to cart successfully!', 'success');
        this.updateCartCount();
        
        // Trigger cart drawer open if it exists
        const cartDrawerOpen = document.getElementById('cart-drawer-open');
        if (cartDrawerOpen) {
          cartDrawerOpen.click();
        }
      } else {
        const error = await response.json();
        this.showMessage(error.description || 'Failed to add product to cart', 'error');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      this.showMessage('Failed to add product to cart', 'error');
    } finally {
      // Remove loading state
      this.addToCartBtn.classList.remove('loading');
    }
  }

  updateCartCount() {
    // Update cart count badge if it exists
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        const cartBadge = document.getElementById('cart-count-badge');
        if (cartBadge) {
          cartBadge.textContent = cart.item_count;
        }
      })
      .catch(error => {
        console.error('Failed to update cart count:', error);
      });
  }

  showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `product__message product__message--${type}`;
    messageEl.textContent = message;
    
    // Add styles
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      ${type === 'success' ? 'background: #27ae60;' : ''}
      ${type === 'error' ? 'background: #e74c3c;' : ''}
      ${type === 'info' ? 'background: #3498db;' : ''}
    `;
    
    document.body.appendChild(messageEl);
    
    // Animate in
    setTimeout(() => {
      messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      messageEl.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(messageEl);
      }, 300);
    }, 3000);
  }

  formatMoney(cents) {
    // Simple money formatting - you might want to use Shopify's money format
    return `$${(cents / 100).toFixed(2)}`;
  }
}

// Initialize product page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProductPage();
}); 