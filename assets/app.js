(function () {
  'use strict';

  const root = document.querySelector('[data-dashboard]');
  if (!root) return;

  const cards = Array.from(root.querySelectorAll('.product-card[data-category]'));
  const categoryTabs = Array.from(root.querySelectorAll('[data-category]'));
  const status = root.querySelector('[data-status]');
  const empty = root.querySelector('[data-empty]');
  const toast = document.querySelector('[data-toast-region]');
  let category = 'all';
  let cartCount = 0;
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove('is-visible'); }, 2300);
  }

  function applyFilter() {
    const query = (root.querySelector('[data-search]')?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach(function (card) {
      const matchesCategory = category === 'all' || card.dataset.category === category;
      const matchesQuery = !query || (card.dataset.name || '').toLowerCase().includes(query);
      const shouldShow = matchesCategory && matchesQuery;
      card.hidden = !shouldShow;
      if (shouldShow) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
    if (status) status.textContent = visible + ' products shown';
  }

  categoryTabs.forEach(function (tab) {
    if (!tab.matches('button')) return;
    tab.addEventListener('click', function () {
      category = tab.dataset.category;
      root.querySelectorAll('[data-category].category-tab').forEach(function (item) { item.classList.toggle('is-active', item === tab); });
      const indicator = root.querySelector('.active-indicator');
      if (indicator) indicator.style.left = (tab.offsetLeft + tab.offsetWidth / 2 - 7) + 'px';
      applyFilter();
    });
  });

  root.querySelector('[data-search]')?.addEventListener('input', applyFilter);
  root.querySelector('[data-filter-toggle]')?.addEventListener('click', function () {
    const panel = root.querySelector('[data-filter-panel]');
    if (panel) panel.hidden = !panel.hidden;
  });

  root.querySelectorAll('[data-sort]').forEach(function (button) {
    button.addEventListener('click', function () {
      const sorted = cards.slice().sort(function (a, b) {
        return button.dataset.sort === 'low' ? Number(a.dataset.price) - Number(b.dataset.price) : Number(b.dataset.price) - Number(a.dataset.price);
      });
      const productRow = root.querySelector('.product-row');
      sorted.slice(0, 2).forEach(function (card) { if (productRow && card.parentElement === productRow) productRow.appendChild(card); });
      showToast(button.textContent + ' applied');
    });
  });

  root.querySelectorAll('[data-favourite]').forEach(function (button) {
    button.addEventListener('click', function () {
      button.classList.toggle('is-favourite');
      button.textContent = button.classList.contains('is-favourite') ? '♥' : '♡';
      showToast(button.classList.contains('is-favourite') ? 'Added to favourites' : 'Removed from favourites');
    });
  });

  root.querySelectorAll('[data-add]').forEach(function (button) {
    button.addEventListener('click', function () {
      cartCount += 1;
      const count = root.querySelector('[data-cart] b');
      if (count) count.textContent = cartCount;
      showToast((button.dataset.product || 'Product') + ' added to cart');
    });
  });

  root.querySelectorAll('[data-toast]').forEach(function (button) {
    button.addEventListener('click', function () { showToast(button.dataset.toast); });
  });

  root.querySelectorAll('[data-view-tab]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      root.querySelectorAll('[data-view-tab]').forEach(function (item) { item.classList.toggle('is-active', item === tab); item.setAttribute('aria-selected', item === tab ? 'true' : 'false'); });
      showToast(tab.dataset.viewTab === 'website' ? 'Website preview selected' : 'Dashboard selected');
    });
  });

  applyFilter();
}());
