class ProductPage {
  constructor() {
    this.form = document.getElementById('product-form');
    this.addToCartBtn = document.getElementById('add-to-cart-btn');
    this.addToCartText = this.addToCartBtn?.querySelector('.product-page__add-cart-text');
    this.addToCartLoading = this.addToCartBtn?.querySelector('.product-page__add-cart-loading');
    this.mainImage = document.getElementById('main-product-img');
    this.thumbnails = document.querySelectorAll('.product-page__thumb-btn');
    this.thumbnailsContainer = document.getElementById('thumbnails-container');
    this.thumbnailsNext = document.getElementById('thumbnails-next');
    this.thumbnailsPrev = document.getElementById('thumbnails-prev');
    this.galleryNext = document.getElementById('gallery-next');
    this.galleryPrev = document.getElementById('gallery-prev');
    this.scrollToTopBtn = document.getElementById('scroll-to-top');
    this.variantId = document.getElementById('variant-id');
    this.quantitySelect = document.getElementById('quantity');
    this.compareCheckbox = document.querySelector('.product-page__compare-checkbox');
    
    this.currentImageIndex = 0;
    this.totalImages = this.thumbnails.length;
    
    this.init();
  }

  init() {
    if (this.form) {
      this.initFormSubmission();
      this.initVariantSelection();
      this.initImageGallery();
      this.initThumbnailNavigation();
      this.initScrollToTop();
      this.initCompareFeature();
    }
  }

  initFormSubmission() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.addToCart();
    });
  }

  async addToCart() {
    if (!this.addToCartBtn) return;
    
    this.setLoadingState(true);
    
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
        
        // Open cart drawer if it exists
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
      this.setLoadingState(false);
    }
  }

  setLoadingState(loading) {
    if (loading) {
      this.addToCartBtn.classList.add('loading');
      this.addToCartBtn.disabled = true;
      this.addToCartText.style.display = 'none';
      this.addToCartLoading.style.display = 'inline';
    } else {
      this.addToCartBtn.classList.remove('loading');
      this.addToCartBtn.disabled = false;
      this.addToCartText.style.display = 'inline';
      this.addToCartLoading.style.display = 'none';
    }
  }

  initVariantSelection() {
    const optionButtons = document.querySelectorAll('.product-page__option-btn');
    
    optionButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.selectVariant(button);
      });
    });
  }

  selectVariant(selectedButton) {
    const optionGroup = selectedButton.closest('.product-page__option-group');
    const optionName = selectedButton.dataset.option;
    const optionValue = selectedButton.dataset.value;
    
    // Update button states
    optionGroup.querySelectorAll('.product-page__option-btn').forEach(btn => {
      btn.classList.remove('product-page__option-btn--selected');
    });
    selectedButton.classList.add('product-page__option-btn--selected');
    
    // Find the matching variant
    const variant = this.findVariant(optionName, optionValue);
    if (variant) {
      this.variantId.value = variant.id;
      this.updateProductInfo(variant);
    }
  }

  findVariant(optionName, optionValue) {
    // This would need to be implemented based on your variant data structure
    // For now, we'll use a simplified approach
    const variants = window.productVariants || [];
    return variants.find(variant => {
      return variant.options.some((option, index) => {
        const optionKey = `option${index + 1}`;
        return option.toLowerCase() === optionValue.toLowerCase();
      });
    });
  }

  updateProductInfo(variant) {
    // Update price
    const priceElement = document.querySelector('.product-page__price-main');
    if (priceElement && variant.price) {
      priceElement.textContent = this.formatMoney(variant.price);
    }
    
    // Update availability
    const availabilityElement = document.querySelector('.product-page__availability');
    if (availabilityElement) {
      if (variant.available) {
        availabilityElement.innerHTML = '<span class="product-page__in-stock">IN STOCK</span>';
      } else {
        availabilityElement.innerHTML = '<span class="product-page__out-of-stock">OUT OF STOCK</span>';
      }
    }
    
    // Update add to cart button
    if (this.addToCartBtn) {
      if (variant.available) {
        this.addToCartBtn.disabled = false;
        this.addToCartBtn.textContent = 'ADD TO CART';
      } else {
        this.addToCartBtn.disabled = true;
        this.addToCartBtn.textContent = 'OUT OF STOCK';
      }
    }
  }

  formatMoney(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  }

  initImageGallery() {
    this.thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', () => {
        this.switchImage(index);
      });
    });

    // Gallery navigation
    if (this.galleryNext) {
      this.galleryNext.addEventListener('click', () => {
        this.nextImage();
      });
    }

    if (this.galleryPrev) {
      this.galleryPrev.addEventListener('click', () => {
        this.previousImage();
      });
    }
  }

  switchImage(index) {
    if (index < 0 || index >= this.totalImages) return;
    
    this.currentImageIndex = index;
    const thumbnail = this.thumbnails[index];
    const imageUrl = thumbnail.dataset.img;
    const imageAlt = thumbnail.dataset.alt;
    
    // Update main image
    if (this.mainImage) {
      this.mainImage.src = imageUrl;
      this.mainImage.alt = imageAlt;
    }
    
    // Update thumbnail states
    this.thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('product-page__thumb-btn--active', i === index);
    });
    
    // Scroll thumbnail into view
    this.scrollThumbnailIntoView(thumbnail);
  }

  nextImage() {
    const nextIndex = (this.currentImageIndex + 1) % this.totalImages;
    this.switchImage(nextIndex);
  }

  previousImage() {
    const prevIndex = this.currentImageIndex === 0 ? this.totalImages - 1 : this.currentImageIndex - 1;
    this.switchImage(prevIndex);
  }

  initThumbnailNavigation() {
    if (this.thumbnailsNext) {
      this.thumbnailsNext.addEventListener('click', () => {
        this.scrollThumbnails('next');
      });
    }

    if (this.thumbnailsPrev) {
      this.thumbnailsPrev.addEventListener('click', () => {
        this.scrollThumbnails('prev');
      });
    }
  }

  scrollThumbnails(direction) {
    if (!this.thumbnailsContainer) return;
    
    const scrollAmount = 300;
    const currentScroll = this.thumbnailsContainer.scrollLeft;
    
    if (direction === 'next') {
      this.thumbnailsContainer.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    } else {
      this.thumbnailsContainer.scrollTo({
        left: currentScroll - scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  scrollThumbnailIntoView(thumbnail) {
    if (!this.thumbnailsContainer) return;
    
    const containerRect = this.thumbnailsContainer.getBoundingClientRect();
    const thumbnailRect = thumbnail.getBoundingClientRect();
    
    if (thumbnailRect.right > containerRect.right) {
      this.thumbnailsContainer.scrollTo({
        left: this.thumbnailsContainer.scrollLeft + (thumbnailRect.right - containerRect.right) + 20,
        behavior: 'smooth'
      });
    } else if (thumbnailRect.left < containerRect.left) {
      this.thumbnailsContainer.scrollTo({
        left: this.thumbnailsContainer.scrollLeft - (containerRect.left - thumbnailRect.left) - 20,
        behavior: 'smooth'
      });
    }
  }

  initScrollToTop() {
    if (!this.scrollToTopBtn) return;
    
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        this.scrollToTopBtn.classList.add('visible');
      } else {
        this.scrollToTopBtn.classList.remove('visible');
      }
    });
    
    this.scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  initCompareFeature() {
    if (!this.compareCheckbox) return;
    
    this.compareCheckbox.addEventListener('change', () => {
      if (this.compareCheckbox.checked) {
        this.addToCompare();
      } else {
        this.removeFromCompare();
      }
    });
  }

  addToCompare() {
    const productId = this.variantId.value;
    const productData = {
      id: productId,
      title: document.querySelector('.product-page__title')?.textContent,
      price: document.querySelector('.product-page__price-main')?.textContent,
      image: this.mainImage?.src
    };
    
    let compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
    compareList.push(productData);
    localStorage.setItem('compareList', JSON.stringify(compareList));
    
    this.showMessage('Product added to compare list', 'success');
  }

  removeFromCompare() {
    const productId = this.variantId.value;
    let compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
    compareList = compareList.filter(item => item.id !== productId);
    localStorage.setItem('compareList', JSON.stringify(compareList));
    
    this.showMessage('Product removed from compare list', 'info');
  }

  updateCartCount() {
    // Update cart count in header if it exists
    const cartCountElements = document.querySelectorAll('.cart-count, .cart-count-badge');
    cartCountElements.forEach(element => {
      // This would typically fetch the current cart count from Shopify
      // For now, we'll just increment the existing count
      const currentCount = parseInt(element.textContent) || 0;
      element.textContent = currentCount + parseInt(this.quantitySelect.value);
    });
  }

  showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `product-page__message product-page__message--${type}`;
    messageEl.textContent = message;
    
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
      ${type === 'success' ? 'background: #10B981;' : ''}
      ${type === 'error' ? 'background: #EF4444;' : ''}
      ${type === 'info' ? 'background: #3B82F6;' : ''}
    `;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      messageEl.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (messageEl.parentNode) {
          document.body.removeChild(messageEl);
        }
      }, 300);
    }, 4000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ProductPage();
}); 