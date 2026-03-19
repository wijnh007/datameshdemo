// DataMesh Platform - App Router & Shell
const App = (() => {
  const views = {};
  let currentRoute = null;

  function registerView(name, module) { views[name] = module; }

  function navigate(route) {
    if (currentRoute === route) return;
    currentRoute = route;

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.route === route);
    });

    // Render view
    const main = document.getElementById('main-content');
    main.innerHTML = '';
    if (views[route]) {
      views[route].render(main);
    } else {
      main.innerHTML = `<div class="empty-state"><p>View not found: ${route}</p></div>`;
    }

    // Close any open modal
    hideModal();
  }

  function handleRoute() {
    const hash = location.hash.replace('#/', '') || 'home';
    navigate(hash);
  }

  // ---------- Modal ----------
  function showModal(title, bodyHTML, { wide = false } = {}) {
    const overlay = document.getElementById('modal-overlay');
    const modal   = document.getElementById('modal');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    modal.classList.toggle('modal--wide', wide);
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('modal-overlay--visible'), 10);
  }

  function hideModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('modal-overlay--visible');
    setTimeout(() => { overlay.style.display = 'none'; }, 200);
  }

  // ---------- Notifications ----------
  function notify(message, type = 'info') {
    const container = document.getElementById('notifications');
    const el = document.createElement('div');
    el.className = `notification notification--${type}`;
    el.innerHTML = `
      <span class="notification-icon">${{ success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }[type] || 'ℹ'}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(el);
    setTimeout(() => el.classList.add('notification--visible'), 10);
    setTimeout(() => {
      el.classList.remove('notification--visible');
      setTimeout(() => el.remove(), 300);
    }, 4000);
  }

  function updateOrderBadge() {
    const badge = document.getElementById('order-badge');
    if (!badge) return;
    const count = DataMesh.state.orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }

  function init() {
    // Wire modal close
    document.getElementById('modal-close').addEventListener('click', hideModal);
    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target === document.getElementById('modal-overlay')) hideModal();
    });

    // Register views
    registerView('home',        HomeView);
    registerView('domains',     DomainsView);
    registerView('catalog',     CatalogView);
    registerView('graph',       GraphView);
    registerView('marketplace', MarketplaceView);
    registerView('orders',      OrdersView);
    registerView('erd',         ErdBrowserView);

    // Nav clicks
    document.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        location.hash = '#/' + el.dataset.route;
      });
    });

    // Hash routing
    window.addEventListener('hashchange', handleRoute);

    // Order badge updates
    DataMesh.on('orders:change', updateOrderBadge);
    updateOrderBadge();

    handleRoute();
  }

  return { init, navigate, showModal, hideModal, notify, registerView };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
