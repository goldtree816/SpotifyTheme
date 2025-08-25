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
    this.initScrollReveal();
    this.initRipple();
  }

  initImageGallery() {
    const thumbnails = document.querySelectorAll('.product-section__thumbnail');
    
    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', () => {
        const imageUrl = thumbnail.dataset.image;
        const imageAlt = thumbnail.dataset.alt;
        
        // Update main image with smooth transition
        if (this.mainImage) {
          this.mainImage.style.opacity = '0';
          setTimeout(() => {
            this.mainImage.src = imageUrl;
            this.mainImage.alt = imageAlt;
            this.mainImage.style.opacity = '1';
          }, 150);
        }
        
        // Update active thumbnail
        thumbnails.forEach(thumb => thumb.classList.remove('product-section__thumbnail--active'));
        thumbnail.classList.add('product-section__thumbnail--active');
      });
    });
  }

  initVariantSelection() {
    const optionButtons = document.querySelectorAll('.product-section__option-btn');
    
    optionButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove selected from all in this group
        const optionGroup = button.closest('.product-section__option-values');
        optionGroup.querySelectorAll('.product-section__option-btn').forEach(btn => {
          btn.classList.remove('product-section__option-btn--selected');
        });
        button.classList.add('product-section__option-btn--selected');
        
        // Add click animation
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
          button.style.transform = '';
        }, 150);
        
        // Update variant selection
        this.updateVariantSelection();
      });
    });
  }

  updateVariantSelection() {
    const selectedOptions = {};
    document.querySelectorAll('.product-section__option-btn--selected').forEach(button => {
      const optionGroup = button.closest('.product-section__option-values');
      const optionIndex = optionGroup.dataset.optionIndex;
      const optionName = this.product.options[optionIndex].name;
      const optionValue = button.getAttribute('data-value');
      selectedOptions[optionName] = optionValue;
    });
    
    // Find matching variant
    const matchingVariant = this.findMatchingVariant(selectedOptions);
    if (matchingVariant) {
      this.currentVariant = matchingVariant;
      this.variantInput.value = matchingVariant.id;
      this.updatePrice(matchingVariant);
      this.updateAvailability(matchingVariant);
      if (matchingVariant.featured_image) {
        this.updateVariantImage(matchingVariant.featured_image);
      }
    }
  }

  findMatchingVariant(selectedOptions) {
    return this.variants.find(variant => {
      return Object.keys(selectedOptions).every(optionName => {
        const variantOptionValue = this.getVariantOptionValue(variant, optionName);
        return variantOptionValue && variantOptionValue === selectedOptions[optionName];
      });
    });
  }

  getVariantOptionValue(variant, optionName) {
    // Map option names to variant properties
    const optionMap = {
      [this.product.options[0]?.name]: variant.option1,
      [this.product.options[1]?.name]: variant.option2,
      [this.product.options[2]?.name]: variant.option3
    };
    return optionMap[optionName];
  }

  updatePrice(variant) {
    const priceContainer = document.querySelector('.product-section__price');
    if (!priceContainer) return;
    
    const currentPrice = priceContainer.querySelector('.product-section__current-price');
    const oldPrice = priceContainer.querySelector('.product-section__old-price');
    const discount = priceContainer.querySelector('.product-section__discount');
    
    // Add price update animation
    if (currentPrice) {
      currentPrice.style.transform = 'scale(1.1)';
      currentPrice.textContent = this.formatMoney(variant.price);
      setTimeout(() => {
        currentPrice.style.transform = 'scale(1)';
      }, 200);
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
    const soldOutBtn = document.querySelector('.product-section__sold-out');
    
    if (variant.available) {
      if (addToCartBtn) {
        addToCartBtn.disabled = false;
        addToCartBtn.style.display = 'block';
        addToCartBtn.style.opacity = '0';
        setTimeout(() => {
          addToCartBtn.style.opacity = '1';
        }, 100);
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
      this.mainImage.style.opacity = '0';
      setTimeout(() => {
        this.mainImage.src = image.src;
        this.mainImage.alt = image.alt || this.product.title;
        this.mainImage.style.opacity = '1';
      }, 150);
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
          
          // Add button animation
          decreaseBtn.style.transform = 'scale(0.9)';
          setTimeout(() => {
            decreaseBtn.style.transform = '';
          }, 150);
        }
      });
    }
    
    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(this.quantityInput.value) || 1;
        this.quantityInput.value = currentValue + 1;
        
        // Add button animation
        increaseBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
          increaseBtn.style.transform = '';
        }, 150);
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
        
        // Check if current variant exists and is available
        if (!this.currentVariant) {
          this.showMessage('Please select a product variant', 'error');
          return;
        }
        
        if (!this.currentVariant.available) {
          this.showMessage('This variant is not available', 'error');
          return;
        }
        
        await this.addToCart();
      });
    }
  }

  initScrollReveal() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const revealEls = document.querySelectorAll('.collection-product-card, .similar-products__card, .hero-poster, .featured-collection');
    const onIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    };
    const observer = new IntersectionObserver(onIntersect, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
    revealEls.forEach(el => { el.classList.add('reveal'); observer.observe(el); });
  }

  initRipple() {
    const rippleTargets = document.querySelectorAll('.collection-add-to-cart-btn, .featured-collection__cta, .product-section__add-to-cart');
    rippleTargets.forEach(target => {
      target.classList.add('btn-ripple');
      target.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  async addToCart() {
    if (!this.addToCartBtn) return;
    
    // Show loading state with animation
    this.addToCartBtn.classList.add('loading');
    this.addToCartBtn.style.transform = 'scale(0.95)';
    this.addToCartBtn.style.background = '#f8f9fa';
    
    const originalText = this.addToCartBtn.querySelector('.product-section__add-to-cart-text');
    const loadingText = this.addToCartBtn.querySelector('.product-section__add-to-cart-loading');
    
    if (originalText) originalText.style.display = 'none';
    if (loadingText) loadingText.style.display = 'inline';
    
    try {
      const formData = new FormData(this.form);
      
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.description || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Success animation
      this.addToCartBtn.style.background = 'var(--color-primary, #1976d2)';
      this.addToCartBtn.style.color = 'var(--color-on-primary, #fff)';
      this.addToCartBtn.style.transform = 'scale(1.05)';
      
      this.showMessage('Product added to cart successfully!', 'success');
      await this.updateCartCount();
      
      // Trigger cart drawer open if it exists
      const cartDrawerOpen = document.getElementById('cart-drawer-open');
      if (cartDrawerOpen) {
        // Small delay to ensure cart is updated
        setTimeout(() => {
          cartDrawerOpen.click();
        }, 200);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      
      // Error animation
      this.addToCartBtn.style.background = 'var(--color-error, #e74c3c)';
      this.addToCartBtn.style.color = 'var(--color-on-primary, #fff)';
      this.addToCartBtn.style.transform = 'scale(0.95)';
      
      this.showMessage(error.message || 'Failed to add product to cart', 'error');
    } finally {
      // Remove loading state after delay
      setTimeout(() => {
        this.addToCartBtn.classList.remove('loading');
        this.addToCartBtn.style.transform = '';
        this.addToCartBtn.style.background = '';
        this.addToCartBtn.style.color = '';
        if (originalText) originalText.style.display = 'inline';
        if (loadingText) loadingText.style.display = 'none';
      }, 2000);
    }
  }

  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const cart = await response.json();
      const cartBadge = document.getElementById('cart-count-badge');
      
      if (cartBadge) {
        if (cart.item_count > 0) {
          cartBadge.textContent = cart.item_count;
          cartBadge.style.display = 'block';
          
          // Add bounce animation
          cartBadge.style.transform = 'scale(1.3)';
          setTimeout(() => {
            cartBadge.style.transform = 'scale(1)';
          }, 200);
        } else {
          cartBadge.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Failed to update cart count:', error);
    }
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
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      max-width: 300px;
      word-wrap: break-word;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      ${type === 'success' ? 'background: var(--color-primary, #1976d2);' : ''}
      ${type === 'error' ? 'background: var(--color-error, #e74c3c);' : ''}
      ${type === 'info' ? 'background: var(--color-info, #3498db);' : ''}
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
        if (document.body.contains(messageEl)) {
          document.body.removeChild(messageEl);
        }
      }, 400);
    }, 3000);
  }

  formatMoney(cents) {
    // Simple money formatting - you might want to use Shopify's money format
    return `$${(cents / 100).toFixed(2)}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('product-form')) {
    new ProductPage();
  }
});