document.addEventListener('DOMContentLoaded', function () {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartDrawerOpen = document.getElementById('cart-drawer-open');
  const cartDrawerClose = document.getElementById('cart-drawer-close');
  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const cartDrawerContent = document.getElementById('cart-drawer-content');

  function openCartDrawer() {
    cartDrawer.setAttribute('aria-hidden', 'false');
    loadCartDrawerContent();
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function loadCartDrawerContent() {
    fetch('/cart.js')
      .then(res => res.json())
      .then(cart => {
        if (cart.items.length === 0) {
          cartDrawerContent.innerHTML = '<div class="cart-drawer__empty">Your cart is empty.</div>';
          return;
        }
        let html = '<form id="cart-drawer-update-form" action="/cart" method="post">';
        html += '<div class="cart-drawer__items">';
        cart.items.forEach(item => {
          html += `<div class="cart-drawer__item">
            <img src="${item.image}" alt="${item.title}" class="cart-drawer__item-image" />
            <div class="cart-drawer__item-info">
              <div class="cart-drawer__item-title">${item.product_title}</div>
              <div class="cart-drawer__item-variant">${item.variant_title !== 'Default Title' ? item.variant_title : ''}</div>
              <div class="cart-drawer__item-qty">Qty: <input type="number" name="updates[]" value="${item.quantity}" min="0" data-line="${item.key}" /></div>
              <div class="cart-drawer__item-price">${(item.price / 100).toLocaleString('en-US', { style: 'currency', currency: cart.currency })}</div>
            </div>
          </div>`;
        });
        html += '</div>';
        html += `<div class="cart-drawer__subtotal"><strong>Subtotal:</strong> ${(cart.total_price / 100).toLocaleString('en-US', { style: 'currency', currency: cart.currency })}</div>`;
        html += '<button type="submit" class="cart-drawer__update">Update Cart</button>';
        html += '</form>';
        html += '<form action="/checkout" method="post"><button type="submit" class="cart-drawer__checkout">Proceed to Checkout</button></form>';
        cartDrawerContent.innerHTML = html;
        attachUpdateFormHandler();
      });
  }

  function attachUpdateFormHandler() {
    const updateForm = document.getElementById('cart-drawer-update-form');
    if (updateForm) {
      updateForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(updateForm);
        fetch('/cart/update.js', {
          method: 'POST',
          body: formData
        })
        .then(res => res.json())
        .then(() => {
          loadCartDrawerContent();
        });
      });
    }
  }

  // AJAX Add to Cart for product page
  const productForm = document.querySelector('.product-form');
  if (productForm) {
    productForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(productForm);
      fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(() => {
        openCartDrawer();
      });
    });
  }

  // AJAX Add to Cart for collection page
  document.querySelectorAll('.collections-product-form').forEach(function(form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(form);
      fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(() => {
        openCartDrawer();
      });
    });
  });

  if (cartDrawerOpen) {
    cartDrawerOpen.addEventListener('click', openCartDrawer);
  }
  if (cartDrawerClose) {
    cartDrawerClose.addEventListener('click', closeCartDrawer);
  }
  if (cartDrawerOverlay) {
    cartDrawerOverlay.addEventListener('click', closeCartDrawer);
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && cartDrawer.getAttribute('aria-hidden') === 'false') {
      closeCartDrawer();
    }
  });

  // Wishlist Heart Button Logic
  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem('wishlist')) || [];
    } catch {
      return [];
    }
  }
  function setWishlist(ids) {
    localStorage.setItem('wishlist', JSON.stringify(ids));
  }
  function updateHeartIcons() {
    const wishlist = getWishlist();
    document.querySelectorAll('.wishlist-heart-btn').forEach(btn => {
      const handle = btn.getAttribute('data-handle');
      if (wishlist.includes(handle)) {
        btn.classList.add('active');
        btn.setAttribute('aria-label', 'Remove from Wishlist');
        btn.setAttribute('title', 'Remove from Wishlist');
        btn.querySelector('.wishlist-heart-icon').innerHTML = '&#9829;'; // filled black heart
        btn.querySelector('.wishlist-heart-icon').style.color = '#000'; // black color
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-label', 'Add to Wishlist');
        btn.setAttribute('title', 'Add to Wishlist');
        btn.querySelector('.wishlist-heart-icon').innerHTML = '&#9825;'; // outline black heart
        btn.querySelector('.wishlist-heart-icon').style.color = '#000'; // black color
      }
    });
  }
  function setupHeartButtons() {
    document.querySelectorAll('.wishlist-heart-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const handle = btn.getAttribute('data-handle');
        let wishlist = getWishlist();
        if (wishlist.includes(handle)) {
          wishlist = wishlist.filter(h => h !== handle);
        } else {
          wishlist.push(handle);
        }
        setWishlist(wishlist);
        updateHeartIcons();
      });
    });
  }
  // Call directly, not in nested DOMContentLoaded
  updateHeartIcons();
  setupHeartButtons();
}); 