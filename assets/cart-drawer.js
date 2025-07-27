document.addEventListener('DOMContentLoaded', function () {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartDrawerOpen = document.getElementById('cart-drawer-open');
  const cartDrawerContent = document.getElementById('cart-drawer-content');
  
  // Track if event listeners are already attached
  let eventListenersAttached = false;

  function openCartDrawer() {
    if (!cartDrawer) return;
    
    // Add a small delay for smoother opening
    setTimeout(() => {
      cartDrawer.setAttribute('aria-hidden', 'false');
      loadCartDrawerContent();
      document.body.style.overflow = 'hidden';
    }, 50);
  }

  function closeCartDrawer() {
    if (!cartDrawer) return;
    
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function attachDrawerEventListeners() {
    // Prevent duplicate event listeners
    if (eventListenersAttached) return;
    eventListenersAttached = true;

    // Close button and overlay
    const cartDrawerClose = document.getElementById('cart-drawer-close');
    const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
    
    if (cartDrawerClose) {
      cartDrawerClose.addEventListener('click', closeCartDrawer);
    }
    if (cartDrawerOverlay) {
      cartDrawerOverlay.addEventListener('click', closeCartDrawer);
    }

    // Update Cart
    const updateForm = document.getElementById('cart-drawer-update-form');
    if (updateForm) {
      updateForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        // Add loading state to update button
        const updateBtn = updateForm.querySelector('.cart-drawer__update');
        const originalText = updateBtn.textContent;
        updateBtn.textContent = 'Updating...';
        updateBtn.disabled = true;
        
        try {
          const updates = {};
          updateForm.querySelectorAll('input[type="number"][name^="updates["]').forEach(input => {
            const match = input.name.match(/updates\[(\d+)\]/);
            if (match) {
              updates[match[1]] = parseInt(input.value, 10);
            }
          });
          
          const response = await fetch('/cart/update.js', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json', 
              'Accept': 'application/json' 
            },
            body: JSON.stringify({ updates })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          // Show success feedback
          updateBtn.textContent = 'Updated!';
          updateBtn.style.background = '#1976d2';
          updateBtn.style.color = '#fff';
          
          setTimeout(async () => {
            await loadCartDrawerContent();
            await updateCartCount();
          }, 500);
        } catch (error) {
          console.error('Error updating cart:', error);
          showCartMessage('Failed to update cart. Please try again.', 'error');
          
          // Reset button state
          updateBtn.textContent = originalText;
          updateBtn.disabled = false;
          updateBtn.style.background = '';
          updateBtn.style.color = '';
        }
      });

      // Quantity controls
      updateForm.querySelectorAll('.quantity-control').forEach(control => {
        const input = control.querySelector('input[type="number"]');
        const decreaseBtn = control.querySelector('.quantity-decrease');
        const increaseBtn = control.querySelector('.quantity-increase');
        
        if (decreaseBtn) {
          decreaseBtn.addEventListener('click', function() {
            const currentValue = parseInt(input.value, 10);
            if (currentValue > 1) {
              input.value = currentValue - 1;
              input.dispatchEvent(new Event('change'));
              
              // Add visual feedback
              this.style.transform = 'scale(0.9)';
              setTimeout(() => {
                this.style.transform = '';
              }, 150);
            }
          });
        }
        
        if (increaseBtn) {
          increaseBtn.addEventListener('click', function() {
            const currentValue = parseInt(input.value, 10);
            input.value = currentValue + 1;
            input.dispatchEvent(new Event('change'));
            
            // Add visual feedback
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
              this.style.transform = '';
            }, 150);
          });
        }
      });
    }

    // Remove item buttons
    const removeButtons = document.querySelectorAll('.cart-drawer__remove');
    removeButtons.forEach(button => {
      button.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const itemElement = this.closest('.cart-drawer__item');
        const originalText = this.textContent;
        
        // Add loading state
        this.textContent = 'Removing...';
        this.disabled = true;
        
        try {
          const itemId = this.getAttribute('data-item-id');
          if (!itemId) {
            throw new Error('Item ID not found');
          }
          
          // Start removal animation
          itemElement.classList.add('removing');
          
          const response = await fetch('/cart/change.js', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json', 
              'Accept': 'application/json' 
            },
            body: JSON.stringify({ id: itemId, quantity: 0 })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          // Wait for animation to complete
          setTimeout(async () => {
            await loadCartDrawerContent();
            await updateCartCount();
          }, 300);
        } catch (error) {
          console.error('Error removing item:', error);
          showCartMessage('Failed to remove item. Please try again.', 'error');
          
          // Reset button state
          this.textContent = originalText;
          this.disabled = false;
          itemElement.classList.remove('removing');
        }
      });
    });

    // Proceed to Checkout
    const checkoutBtn = document.getElementById('cart-drawer-checkout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Add loading state
        const originalText = this.textContent;
        this.textContent = 'Redirecting...';
        this.disabled = true;
        
        setTimeout(() => {
          window.location.href = '/checkout';
        }, 300);
      });
    }
  }

  async function updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const cart = await response.json();
      const cartCountBadge = document.getElementById('cart-count-badge');
      
      if (cartCountBadge) {
        if (cart.item_count > 0) {
          cartCountBadge.textContent = cart.item_count;
          cartCountBadge.style.display = 'block';
          
          // Add animation to cart badge
          cartCountBadge.style.transform = 'scale(1.2)';
          setTimeout(() => {
            cartCountBadge.style.transform = 'scale(1)';
          }, 200);
        } else {
          cartCountBadge.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }

  async function loadCartDrawerContent() {
    try {
      const response = await fetch('/cart.js');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const cart = await response.json();
      
      if (!cartDrawerContent) {
        console.error('Cart drawer content element not found');
        return;
      }
      
      if (cart.items.length === 0) {
        cartDrawerContent.innerHTML = '<div class="cart-drawer__empty">Your cart is empty.</div>';
        eventListenersAttached = false; // Reset for next time
        attachDrawerEventListeners();
        return;
      }
      
      let html = '<form id="cart-drawer-update-form" action="/cart" method="post">';
      html += '<div class="cart-drawer__items">';
      
      cart.items.forEach((item, index) => {
        const imageUrl = item.image || '/assets/no-image.png';
        const variantTitle = item.variant_title && item.variant_title !== 'Default Title' ? item.variant_title : '';
        
        html += `<div class="cart-drawer__item" style="animation-delay: ${0.1 + (index * 0.05)}s">
          <img src="${imageUrl}" alt="${item.title}" class="cart-drawer__item-image" onerror="this.src='/assets/no-image.png'" />
          <div class="cart-drawer__item-info">
            <div class="cart-drawer__item-title">${item.product_title}</div>
            ${variantTitle ? `<div class="cart-drawer__item-variant">${variantTitle}</div>` : ''}
            <div class="cart-drawer__item-qty">
              <span>Qty:</span>
              <div class="quantity-control">
                <button type="button" class="quantity-decrease">-</button>
                <input type="number" name="updates[${item.id}]" value="${item.quantity}" min="1" />
                <button type="button" class="quantity-increase">+</button>
              </div>
            </div>
            <div class="cart-drawer__item-price">${(item.price / 100).toLocaleString('en-US', { style: 'currency', currency: cart.currency })}</div>
            <button type="button" class="cart-drawer__remove" data-item-id="${item.id}">Remove</button>
          </div>
        </div>`;
      });
      
      html += '</div>';
      html += `<div class="cart-drawer__subtotal"><strong>Subtotal:</strong> ${(cart.total_price / 100).toLocaleString('en-US', { style: 'currency', currency: cart.currency })}</div>`;
      html += '<button type="submit" class="cart-drawer__update">Update Cart</button>';
      html += '</form>';
      html += '<button id="cart-drawer-checkout" class="cart-drawer__checkout">Proceed to Checkout</button>';
      
      cartDrawerContent.innerHTML = html;
      eventListenersAttached = false; // Reset for next time
      attachDrawerEventListeners();
    } catch (error) {
      console.error('Error loading cart content:', error);
      if (cartDrawerContent) {
        cartDrawerContent.innerHTML = '<div class="cart-drawer__empty">Error loading cart. Please refresh the page.</div>';
      }
    }
  }

  function showCartMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `cart-message cart-message--${type}`;
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
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      max-width: 300px;
      word-wrap: break-word;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
        if (document.body.contains(messageEl)) {
          document.body.removeChild(messageEl);
        }
      }, 400);
    }, 3000);
  }

  if (cartDrawerOpen) {
    cartDrawerOpen.addEventListener('click', openCartDrawer);
  }
  
  // Initialize cart count on page load
  updateCartCount();
}); 