class ProductPage {
  constructor() {
    this.selectors = {
      optionSelect: '[data-option-selector]',
      addToCart: '[data-add-to-cart]'
    };
    
    this.variants = JSON.parse(document.querySelector('[data-variant-json]').innerHTML);
    this.init();
  }
  
  init() {
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    document.querySelectorAll(this.selectors.optionSelect).forEach(select => {
      select.addEventListener('change', this.onOptionChange.bind(this));
    });
    
    document.querySelector(this.selectors.addToCart).addEventListener('click', this.onAddToCart.bind(this));
  }
  
  onOptionChange() {
    const selectedOptions = Array.from(document.querySelectorAll(this.selectors.optionSelect))
      .map(select => select.value);
    
    const matchedVariant = this.variants.find(variant => {
      return variant.options.every((option, index) => option === selectedOptions[index]);
    });
    
    if (matchedVariant) {
      this.updateVariant(matchedVariant);
    }
  }
  
  updateVariant(variant) {
    // Update price
    document.querySelector('.product__price .price').textContent = Shopify.formatMoney(variant.price);
    
    // Update compare at price if available
    const compareAtPriceEl = document.querySelector('.product__price .compare-at-price');
    if (variant.compare_at_price > variant.price) {
      compareAtPriceEl.textContent = Shopify.formatMoney(variant.compare_at_price);
      compareAtPriceEl.style.display = 'inline';
    } else {
      compareAtPriceEl.style.display = 'none';
    }
    
    // Update add to cart button
    document.querySelector(this.selectors.addToCart).textContent = `Add to Cart - ${Shopify.formatMoney(variant.price)}`;
  }
  
  onAddToCart() {
    // Implement add to cart functionality
    console.log('Add to cart clicked');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.product')) {
    new ProductPage();
  }
});