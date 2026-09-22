(function () {
  'use strict';

  const root = document.querySelector('[data-dashboard]');
  if (!root) return;
  const storageKey = 'buymore-dashboard-state';
  const cards = Array.from(root.querySelectorAll('.product-card[data-category]'));
  const categoryTabs = Array.from(root.querySelectorAll('.category-tabs .category-tab'));
  const toast = document.querySelector('[data-toast-region]');
  const status = root.querySelector('[data-status]');
  const empty = root.querySelector('[data-empty]');
  let category = 'all'; let toastTimer;
  let state;
  try { state = Object.assign({ cart: [], account: 'Ryana' }, JSON.parse(localStorage.getItem(storageKey) || '{}')); } catch (error) { state = { cart: [], account: 'Ryana' }; }
  const catalogue = {
    'Warm knit outfit': { price: 119, image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&q=80' },
    'WMX Rubber Zebra sandal': { price: 36, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&q=80' },
    'Super Skinny jogger in brown': { price: 89, image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=300&q=80' }
  };
  function saveState() { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (error) {} }
  function showToast(message) { if (!toast) return; toast.textContent = message; toast.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2300); }
  function money(value) { return '$' + Number(value).toFixed(0); }
  function applyFilter() {
    const query = (root.querySelector('[data-search]')?.value || '').trim().toLowerCase(); let visible = 0;
    cards.forEach(function (card) { const show = (category === 'all' || card.dataset.category === category) && (!query || (card.dataset.name || '').toLowerCase().includes(query)); card.hidden = !show; if (show) visible += 1; });
    if (empty) empty.hidden = visible !== 0; if (status) status.textContent = visible + ' products shown';
  }
  function renderCart() {
    const count = state.cart.reduce(function (n, item) { return n + item.quantity; }, 0); const subtotal = state.cart.reduce(function (n, item) { return n + item.price * item.quantity; }, 0);
    root.querySelectorAll('[data-cart-count]').forEach(function (node) { node.textContent = count; }); const total = document.querySelector('[data-cart-subtotal]'); const list = document.querySelector('[data-cart-items]'); if (total) total.textContent = money(subtotal); if (!list) return;
    list.innerHTML = state.cart.length ? '' : '<div class="cart-empty">Your cart is waiting for a great find.</div>';
    state.cart.forEach(function (item) { const row = document.createElement('div'); row.className = 'cart-item'; row.innerHTML = '<div class="cart-item-image"></div><div><strong>' + item.name + '</strong><small>' + item.quantity + ' × ' + money(item.price) + '</small></div><button class="cart-item-remove" type="button" data-remove="' + item.name + '">×</button>'; row.querySelector('.cart-item-image').style.backgroundImage = "url('" + item.image + "')"; list.appendChild(row); });
    list.querySelectorAll('[data-remove]').forEach(function (button) { button.addEventListener('click', function () { state.cart = state.cart.filter(function (item) { return item.name !== button.dataset.remove; }); saveState(); renderCart(); showToast('Removed from cart'); }); });
  }
  function openCart() { document.querySelector('[data-cart-drawer]')?.classList.add('is-open'); document.querySelector('[data-cart-drawer]')?.setAttribute('aria-hidden', 'false'); document.querySelector('[data-cart-backdrop]')?.classList.add('is-open'); }
  function closeCart() { document.querySelector('[data-cart-drawer]')?.classList.remove('is-open'); document.querySelector('[data-cart-drawer]')?.setAttribute('aria-hidden', 'true'); document.querySelector('[data-cart-backdrop]')?.classList.remove('is-open'); }
  categoryTabs.forEach(function (tab) { tab.addEventListener('click', function () { category = tab.dataset.category; categoryTabs.forEach(function (item) { item.classList.toggle('is-active', item === tab); }); applyFilter(); }); });
  root.querySelector('[data-search]')?.addEventListener('input', applyFilter);
  root.querySelector('[data-filter-toggle]')?.addEventListener('click', function () { const panel = root.querySelector('[data-filter-panel]'); if (panel) panel.hidden = !panel.hidden; });
  root.querySelectorAll('[data-sort]').forEach(function (button) { button.addEventListener('click', function () { const row = root.querySelector('.product-row'); cards.slice().sort(function (a, b) { return button.dataset.sort === 'low' ? Number(a.dataset.price) - Number(b.dataset.price) : Number(b.dataset.price) - Number(a.dataset.price); }).forEach(function (card) { if (card.parentElement === row) row.appendChild(card); }); showToast(button.textContent + ' applied'); }); });
  root.querySelectorAll('[data-favourite]').forEach(function (button) { button.addEventListener('click', function () { button.classList.toggle('is-favourite'); button.textContent = button.classList.contains('is-favourite') ? '♥' : '♡'; showToast(button.classList.contains('is-favourite') ? 'Added to favourites' : 'Removed from favourites'); }); });
  root.querySelectorAll('[data-add]').forEach(function (button) { button.addEventListener('click', function () { const name = button.dataset.product || 'Product'; const details = catalogue[name] || { price: Number(button.textContent.replace(/[^0-9.]/g, '')) || 0, image: '' }; const current = state.cart.find(function (item) { return item.name === name; }); if (current) current.quantity += 1; else state.cart.push({ name: name, price: details.price, image: details.image, quantity: 1 }); saveState(); renderCart(); showToast(name + ' added to cart'); }); });
  root.querySelectorAll('[data-toast]').forEach(function (button) { button.addEventListener('click', function () { showToast(button.dataset.toast); }); });
  root.querySelector('[data-cart]')?.addEventListener('click', openCart); document.querySelector('[data-cart-close]')?.addEventListener('click', closeCart); document.querySelector('[data-cart-backdrop]')?.addEventListener('click', closeCart); document.querySelector('[data-checkout]')?.addEventListener('click', function () { showToast(state.cart.length ? 'Checkout is ready for review' : 'Add a product first'); });
  const toggle = root.querySelector('[data-account-toggle]'); const menu = root.querySelector('[data-account-menu]'); toggle?.addEventListener('click', function () { const open = menu.hidden; menu.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); toggle.classList.toggle('is-open', open); });
  root.querySelectorAll('[data-account]').forEach(function (option) { option.addEventListener('click', function () { root.querySelector('[data-account-name]').textContent = option.dataset.account; root.querySelector('.profile-avatar').style.backgroundImage = "url('" + option.dataset.avatar + "')"; root.querySelectorAll('[data-account]').forEach(function (item) { item.classList.toggle('is-current', item === option); }); menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.classList.remove('is-open'); state.account = option.dataset.account; saveState(); showToast('Switched to ' + option.dataset.account); }); });
  root.querySelectorAll('[data-view-tab]').forEach(function (tab) { tab.addEventListener('click', function () { root.querySelectorAll('[data-view-tab]').forEach(function (item) { item.classList.toggle('is-active', item === tab); item.setAttribute('aria-selected', item === tab ? 'true' : 'false'); }); showToast(tab.dataset.viewTab === 'website' ? 'Website preview selected' : 'Dashboard selected'); }); });
  renderCart(); applyFilter();
}());
