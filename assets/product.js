document.addEventListener('DOMContentLoaded', function () {
  const sizeInputs = document.querySelectorAll('#size-options .product-card-option-btn-input');
  const colorInputs = document.querySelectorAll('#color-options .product-card-option-btn-input');
  const quantityInput = document.getElementById('quantity');
  const priceElement = document.getElementById('product-price');
  const variantIdInput = document.getElementById('variant-id');
  const form = document.getElementById('product-form');
  const clearButton = document.querySelector('.product-card-clear-selection-btn');
  const selectedVariantPrice = document.getElementById('selected-variant-price');

  // Map non-standard color names to CSS-compatible colors
  const colorMap = {
    'royal blue': 'royalblue',
    'light blue': 'lightblue',
    'dark green': 'darkgreen',
    'brown': '#8B4513',
    'black': '#000000',
    'white': '#FFFFFF'
    // Add more mappings as needed
  };

  // Dynamically set swatch colors
  document.querySelectorAll('.product-card-option-swatch').forEach(swatch => {
    const colorName = swatch.dataset.color;
    console.log('Color name:', colorName); // Debug: Log color name
    const cssColor = colorMap[colorName] || colorName;
    console.log('CSS color:', cssColor); // Debug: Log CSS color
    swatch.style.setProperty('--color', cssColor);
  });

  // Initial price and variant setup
  let currentVariantId = variantIdInput.value;
  let currentPrice = parseFloat(priceElement.textContent.replace(/[^0-9.-]+/g, ''));

  // Function to toggle clear button visibility
  function toggleClearButton() {
    const selectedSize = Array.from(sizeInputs).find(input => input.checked);
    const selectedColor = Array.from(colorInputs).find(input => input.checked);
    clearButton.classList.toggle('hidden', !(selectedSize && selectedColor));
  }

  // Update price and variant ID based on size and color selection
  function updateVariant() {
    const selectedSize = Array.from(sizeInputs).find(input => input.checked)?.value.trim().toLowerCase();
    const selectedColor = Array.from(colorInputs).find(input => input.checked)?.value.trim().toLowerCase();
    toggleClearButton();

    // Update size selection display
    if (selectedSize) {
      console.log('Selected Size:', selectedSize);
      document.querySelectorAll('#size-options .product-card-option-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent.toLowerCase() === selectedSize) {
          btn.classList.add('selected');
        }
      });
    }

    // Update color selection display
    if (selectedColor) {
      console.log('Selected Color:', selectedColor);
      // All swatches remain visible, selected one is highlighted via CSS
    }

    if (!selectedSize || !selectedColor) {
      selectedVariantPrice.textContent = '';
      return;
    }

    const productVariants = JSON.parse(document.querySelector('#product-form').dataset.variants);
    const selectedVariant = productVariants.find(v => v.option1.trim().toLowerCase() === selectedSize && v.option2.trim().toLowerCase() === selectedColor);

    if (!selectedVariant) {
      console.error('Variant not found:', { size: selectedSize, color: selectedColor });
      selectedVariantPrice.textContent = '';
      return;
    }

    currentVariantId = selectedVariant.id;
    currentPrice = selectedVariant.price / 100; // Convert cents to dollars
    variantIdInput.value = currentVariantId;
    selectedVariantPrice.textContent = `Selected Price: ${Shopify.formatMoney(currentPrice * 100, window.theme.moneyFormat)}`;
    updatePrice();
  }

  // Add event listeners for size and color changes
  sizeInputs.forEach(input => {
    input.addEventListener('change', updateVariant);
  });
  colorInputs.forEach(input => {
    input.addEventListener('change', updateVariant);
  });

  // Update price based on quantity
  quantityInput.addEventListener('change', function () {
    updatePrice();
  });

  // Clear selection and reset
  clearButton.addEventListener('click', function () {
    sizeInputs.forEach(input => input.checked = false);
    colorInputs.forEach(input => input.checked = false);
    const productVariants = JSON.parse(document.querySelector('#product-form').dataset.variants);
    const firstVariant = productVariants[0];
    currentVariantId = firstVariant.id;
    currentPrice = firstVariant.price / 100;
    variantIdInput.value = currentVariantId;
    quantityInput.value = 1;
    selectedVariantPrice.textContent = '';
    priceElement.textContent = Shopify.formatMoney(currentPrice * 100, window.theme.moneyFormat);
    document.querySelectorAll('.product-card-option-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    if (sizeInputs.length > 0) sizeInputs[0].checked = true;
    if (colorInputs.length > 0) colorInputs[0].checked = true;
    updateVariant();
  });

  function updatePrice() {
    const quantity = parseInt(quantityInput.value) || 1;
    const totalPrice = currentPrice * quantity;
    priceElement.textContent = Shopify.formatMoney(totalPrice * 100, window.theme.moneyFormat);
  }

  // Submit handler to ensure correct variant and quantity
  form.addEventListener('submit', function (e) {
    variantIdInput.value = currentVariantId;
    quantityInput.name = 'quantity';
  });

  // Initial call to set up the price and toggle clear button
  updateVariant();
});