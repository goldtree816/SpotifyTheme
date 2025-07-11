document.addEventListener('DOMContentLoaded', function () {
  const sizeInputs = document.querySelectorAll('#size-options .option-btn-input');
  const colorInputs = document.querySelectorAll('#color-options .option-btn-input');
  const quantityInput = document.getElementById('quantity');
  const priceElement = document.getElementById('product-price');
  const variantIdInput = document.getElementById('variant-id');
  const form = document.getElementById('product-form');
  const clearButton = document.querySelector('.clear-selection-btn');
  const selectedVariantPrice = document.getElementById('selected-variant-price');

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
    const selectedSize = Array.from(sizeInputs).find(input => input.checked)?.value;
    const selectedColor = Array.from(colorInputs).find(input => input.checked)?.value;
    toggleClearButton(); // Toggle visibility based on selection
    if (!selectedSize || !selectedColor) {
      selectedVariantPrice.textContent = '';
      return;
    }

    const productVariants = JSON.parse(document.querySelector('#product-form').dataset.variants);
    const selectedVariant = productVariants.find(v => v.option1 === selectedSize && v.option2 === selectedColor);

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
    // Uncheck all radio buttons
    sizeInputs.forEach(input => input.checked = false);
    colorInputs.forEach(input => input.checked = false);
    // Reset to first variant
    const productVariants = JSON.parse(document.querySelector('#product-form').dataset.variants);
    const firstVariant = productVariants[0];
    currentVariantId = firstVariant.id;
    currentPrice = firstVariant.price / 100;
    variantIdInput.value = currentVariantId;
    // Reset quantity
    quantityInput.value = 1;
    // Reset price display
    selectedVariantPrice.textContent = '';
    priceElement.textContent = Shopify.formatMoney(currentPrice * 100, window.theme.moneyFormat);
    // Reset button styles
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.style.background = '#fff';
      btn.style.color = '#1a1a1a';
    });
    // Re-check the first size and color to match the first variant
    if (sizeInputs.length > 0) sizeInputs[0].checked = true;
    if (colorInputs.length > 0) colorInputs[0].checked = true;
    updateVariant(); // Update after reset
  });

  function updatePrice() {
    const quantity = parseInt(quantityInput.value) || 1;
    const totalPrice = currentPrice * quantity;
    priceElement.textContent = Shopify.formatMoney(totalPrice * 100, window.theme.moneyFormat);
  }

  // Submit handler to ensure correct variant and quantity
  form.addEventListener('submit', function (e) {
    variantIdInput.value = currentVariantId;
    quantityInput.name = 'quantity'; // Ensure quantity is sent with the form
  });

  // Initial call to set up the price and toggle clear button
  updateVariant();
});