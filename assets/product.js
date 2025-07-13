document.addEventListener('DOMContentLoaded', function () {
  const sizeInputs = document.querySelectorAll('#size-options .product-card-option-btn-input');
  const colorInputs = document.querySelectorAll('#color-options .product-card-option-btn-input');
  const quantityInput = document.getElementById('quantity');
  const priceElement = document.getElementById('product-price');
  const variantIdInput = document.getElementById('variant-id');
  const form = document.getElementById('product-form');
  const clearButton = document.querySelector('.product-card-clear-selection-btn');
  const selectedVariantPrice = document.getElementById('selected-variant-price');
  const mainImage = document.getElementById('main-product-image');
  const thumbnails = document.querySelectorAll('.product-card-thumbnail');

  // Optional color mapping
  const colorMap = {
    'royal blue': 'royalblue',
    'light blue': 'lightblue',
    'dark green': 'darkgreen',
    'brown': '#8B4513',
    'black': '#000000',
    'white': '#FFFFFF'
  };

  // Apply color swatches
  document.querySelectorAll('.product-card-option-swatch').forEach(swatch => {
    const colorName = swatch.dataset.color;
    const cssColor = colorMap[colorName] || colorName;
    swatch.style.setProperty('--color', cssColor);
  });

  // Thumbnail click
  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const fullImageUrl = thumb.getAttribute('data-full');
      mainImage.src = fullImageUrl;
      thumbnails.forEach(t => t.classList.remove('active-thumbnail'));
      thumb.classList.add('active-thumbnail');
    });
  });

  let currentVariantId = variantIdInput.value;
  let currentPrice = parseFloat(priceElement.textContent.replace(/[^0-9.-]+/g, ''));

  function toggleClearButton() {
    const selectedSize = Array.from(sizeInputs).find(input => input.checked);
    const selectedColor = Array.from(colorInputs).find(input => input.checked);
    clearButton.classList.toggle('hidden', !(selectedSize && selectedColor));
  }

  function updateVariant() {
    const selectedSizeInput = Array.from(sizeInputs).find(input => input.checked);
    const selectedColorInput = Array.from(colorInputs).find(input => input.checked);
    const selectedSize = selectedSizeInput?.value.trim().toLowerCase();
    const selectedColor = selectedColorInput?.value.trim().toLowerCase();

    toggleClearButton();

    if (!selectedSize || !selectedColor) {
      selectedVariantPrice.style.display = 'none';
      selectedVariantPrice.textContent = '';
      return;
    }

    const productVariants = JSON.parse(document.querySelector('#product-form').dataset.variants);

    const selectedVariant = productVariants.find(v =>
      v.option1.trim().toLowerCase() === selectedSize &&
      v.option2.trim().toLowerCase() === selectedColor
    );

    if (!selectedVariant) {
      console.warn('No matching variant for size:', selectedSize, 'and color:', selectedColor);
      selectedVariantPrice.style.display = 'none';
      selectedVariantPrice.textContent = '';
      return;
    }

    currentVariantId = selectedVariant.id;
    currentPrice = selectedVariant.price / 100;
    variantIdInput.value = currentVariantId;

    const formatted = Shopify.formatMoney(selectedVariant.price, window.theme.moneyFormat);
    selectedVariantPrice.textContent = `Selected Price: ${formatted}`;
    selectedVariantPrice.style.display = 'block';

    updatePrice();
  }


  function updatePrice() {
    const quantity = parseInt(quantityInput.value) || 1;
    const totalPrice = currentPrice * quantity;
    priceElement.textContent = Shopify.formatMoney(totalPrice * 100, window.theme?.moneyFormat || "${{amount}}");
  }

  // Event listeners
  sizeInputs.forEach(input => input.addEventListener('change', updateVariant));
  colorInputs.forEach(input => input.addEventListener('change', updateVariant));

  quantityInput.addEventListener('change', updatePrice);

  clearButton.addEventListener('click', () => {
    sizeInputs.forEach(input => input.checked = false);
    colorInputs.forEach(input => input.checked = false);

    const productVariants = JSON.parse(form.dataset.variants);
    const firstVariant = productVariants[0];
    currentVariantId = firstVariant.id;
    currentPrice = firstVariant.price / 100;
    variantIdInput.value = currentVariantId;

    quantityInput.value = 1;
    selectedVariantPrice.style.display = 'none';
    selectedVariantPrice.textContent = '';
    priceElement.textContent = Shopify.formatMoney(currentPrice * 100, window.theme?.moneyFormat || "${{amount}}");
    priceElement.style.display = 'block';

    document.querySelectorAll('.product-card-option-btn').forEach(btn => btn.classList.remove('selected'));
    updateVariant();
  });

  form.addEventListener('submit', function () {
    variantIdInput.value = currentVariantId;
    quantityInput.name = 'quantity';
  });

  // Initial setup
  updateVariant();
});
