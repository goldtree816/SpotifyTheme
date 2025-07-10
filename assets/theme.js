// function handleProductClick(event, productHandle) {
//   event.preventDefault();
  
//   // Fetch product data
//   fetch(`/products/${productHandle}.js`)
//     .then(response => response.json())
//     .then(product => {
//       // Update URL without reload
//       history.pushState({}, '', `/products/${productHandle}`);
      
//       // Update page content
//       document.querySelector('.product-title').innerText = product.title;
//       document.querySelector('.product-price').innerHTML = 
//         Shopify.formatMoney(product.price, '{{ shop.money_format }}');
      
//       // Update variant selector
//       const variantSelector = document.querySelector('variant-selector');
//       if (variantSelector) {
//         variantSelector.updateOptions(product);
//       }
//     })
//     .catch(error => console.error('Error:', error));
// }

// // Initialize product click handlers
// document.addEventListener('DOMContentLoaded', () => {
//   document.querySelectorAll('.product-link').forEach(link => {
//     link.addEventListener('click', (e) => {
//       const productHandle = e.currentTarget.dataset.productHandle;
//       handleProductClick(e, productHandle);
//     });
//   });
// });