document.addEventListener('DOMContentLoaded', function () {
  const drawer = document.getElementById('cart-drawer');
  const openBtn = document.getElementById('cart-drawer-open');
  const closeBtn = document.getElementById('cart-drawer-close');
  const body = document.getElementById('cart-drawer-body');
  const footer = document.getElementById('cart-drawer-footer');
  const badge = document.getElementById('cart-count-badge');

  function openDrawer() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    fetchCart();
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }
  openBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  drawer.addEventListener('click', function (e) {
    if (e.target === drawer) closeDrawer();
  });

  function fetchCart() {
    fetch('/cart.js')
      .then(res => res.json())
      .then(cart => {
        updateBadge(cart.item_count);
        renderCart(cart);
      });
  }

  function updateBadge(count) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }

  function renderCart(cart) {
    if (cart.items.length === 0) {
      body.innerHTML = '<p>Your cart is empty.</p>';
      footer.innerHTML = '';
      return;
    }
    body.innerHTML = cart.items.map((item, idx) => `
      <div class="cart-item" data-key="${item.key}">
        <div style="display:flex;align-items:center;gap:1rem;">
          <img src="${item.image ? item.image : ''}" alt="${item.title}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">
          <div style="flex:1;">
            <div><a href="${item.url}">${item.product_title}</a></div>
            <div>${item.variant_title !== 'Default Title' ? item.variant_title : ''}</div>
            <div>Qty: <button class="cart-qty-btn" data-action="decrease" data-key="${item.key}">-</button>
              <input type="number" min="1" value="${item.quantity}" data-key="${item.key}" class="cart-qty-input" style="width:40px;text-align:center;">
              <button class="cart-qty-btn" data-action="increase" data-key="${item.key}">+</button>
            </div>
            <div>${(item.final_line_price / 100).toLocaleString('en-IN', { style: 'currency', currency: cart.currency })}</div>
            <button class="cart-remove-btn" data-key="${item.key}">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
    footer.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div><strong>Subtotal:</strong> ${(cart.total_price / 100).toLocaleString('en-IN', { style: 'currency', currency: cart.currency })}</div>
        <a href="/cart" class="button">View Cart</a>
        <a href="/checkout" class="button">Checkout</a>
      </div>
    `;
    addCartListeners();
  }

  function addCartListeners() {
    body.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const key = this.getAttribute('data-key');
        const input = body.querySelector(`.cart-qty-input[data-key="${key}"]`);
        let qty = parseInt(input.value, 10);
        if (this.getAttribute('data-action') === 'increase') qty++;
        else if (qty > 1) qty--;
        updateCart(key, qty);
      });
    });
    body.querySelectorAll('.cart-qty-input').forEach(input => {
      input.addEventListener('change', function () {
        const key = this.getAttribute('data-key');
        let qty = parseInt(this.value, 10);
        if (qty < 1) qty = 1;
        updateCart(key, qty);
      });
    });
    body.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const key = this.getAttribute('data-key');
        updateCart(key, 0);
      });
    });
  }

  function updateCart(key, qty) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: qty })
    })
      .then(res => res.json())
      .then(cart => {
        updateBadge(cart.item_count);
        renderCart(cart);
      });
  }

  // Initial badge update
  fetch('/cart.js')
    .then(res => res.json())
    .then(cart => updateBadge(cart.item_count));
}); 