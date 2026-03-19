// DataMesh Platform - Orders View
const OrdersView = (() => {
  let filterStatus = '';

  function render(container) {
    const statuses = ['pending', 'processing', 'active', 'cancelled'];
    const counts = {};
    statuses.forEach(s => { counts[s] = DataMesh.state.orders.filter(o => o.status === s).length; });

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="view-title">My Orders</h1>
          <p class="view-subtitle">Track and manage your data product subscriptions.</p>
        </div>
        <div class="view-actions">
          <a href="#/marketplace" class="btn btn-primary" onclick="location.hash='#/marketplace'">Browse Marketplace</a>
        </div>
      </div>

      <div class="order-status-tabs">
        <button class="status-tab ${filterStatus === '' ? 'active' : ''}" data-status="">
          All <span class="tab-count">${DataMesh.state.orders.length}</span>
        </button>
        ${statuses.map(s => `
          <button class="status-tab ${filterStatus === s ? 'active' : ''}" data-status="${s}">
            ${s.charAt(0).toUpperCase() + s.slice(1)} <span class="tab-count">${counts[s]}</span>
          </button>
        `).join('')}
      </div>

      <div id="orders-list" class="orders-list"></div>
    `;

    renderOrders(container);
    bindEvents(container);
  }

  function renderOrders(container) {
    const list = container.querySelector('#orders-list') || document.getElementById('orders-list');
    const orders = [...DataMesh.state.orders]
      .filter(o => !filterStatus || o.status === filterStatus)
      .reverse();

    if (orders.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>
          <p>${filterStatus ? `No ${filterStatus} orders.` : 'No orders yet. Browse the marketplace to get started.'}</p>
          <a href="#/marketplace" class="btn btn-primary" onclick="location.hash='#/marketplace'">Browse Marketplace</a>
        </div>
      `;
      return;
    }

    list.innerHTML = orders.map(order => orderCard(order)).join('');

    list.querySelectorAll('.btn-advance').forEach(btn => {
      btn.addEventListener('click', () => {
        DataMesh.advanceOrderStatus(btn.dataset.id);
        renderOrders(container);
        App.notify('Order status updated.', 'success');
      });
    });
    list.querySelectorAll('.btn-cancel-order').forEach(btn => {
      btn.addEventListener('click', () => {
        DataMesh.cancelOrder(btn.dataset.id);
        renderOrders(container);
        App.notify('Order cancelled.', 'info');
      });
    });
  }

  function orderCard(order) {
    const product  = DataMesh.getProduct(order.productId);
    const port     = DataMesh.getPortById(order.productId, order.outputPortId);
    const domColor = product ? DataMesh.getDomainColor(product.domain) : '#64748b';
    const statusClass = { active: 'success', pending: 'warning', processing: 'info', cancelled: 'danger' }[order.status] || 'neutral';
    const canAdvance  = ['pending', 'processing'].includes(order.status);
    const canCancel   = ['pending', 'processing'].includes(order.status);

    const steps = ['pending', 'processing', 'active'];
    const currentStep = steps.indexOf(order.status);

    return `
      <div class="order-card ${order.status === 'cancelled' ? 'order-card--cancelled' : ''}">
        <div class="order-card-stripe" style="background:${domColor}"></div>
        <div class="order-card-content">
          <div class="order-card-header">
            <div class="order-card-title-area">
              <h3 class="order-card-product">${product ? product.name : 'Unknown Product'}</h3>
              <span class="badge badge--${statusClass}">${order.status}</span>
            </div>
            <div class="order-card-id text-muted">Order ${order.id}</div>
          </div>

          <div class="order-card-meta">
            ${product ? `<span class="domain-tag" style="background:${domColor}20;color:${domColor}">${product.domain}</span>` : ''}
            ${port ? `<span class="meta-item">
              <span class="port-type-dot" style="background:${DataMesh.getPortTypeColor(port.type)}"></span>
              ${port.name} · ${port.format}
            </span>` : ''}
            <span class="meta-item">Team: ${order.team}</span>
          </div>

          <div class="order-purpose">
            <span class="text-muted" style="font-size:13px">Purpose: </span>
            <span style="font-size:13px">${order.purpose}</span>
          </div>

          ${order.status !== 'cancelled' ? `
            <div class="order-timeline">
              ${steps.map((step, i) => `
                <div class="timeline-step ${i <= currentStep ? 'timeline-step--done' : ''} ${i === currentStep ? 'timeline-step--current' : ''}">
                  <div class="timeline-dot">
                    ${i < currentStep ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
                  </div>
                  <span class="timeline-label">${step.charAt(0).toUpperCase() + step.slice(1)}</span>
                </div>
                ${i < steps.length - 1 ? `<div class="timeline-connector ${i < currentStep ? 'timeline-connector--done' : ''}"></div>` : ''}
              `).join('')}
            </div>
          ` : ''}

          <div class="order-card-footer">
            <div class="order-dates text-muted" style="font-size:12px">
              <span>Requested: ${formatDate(order.requestedAt)}</span>
              ${order.deliveredAt ? `<span> · Active since: ${formatDate(order.deliveredAt)}</span>` : ''}
            </div>
            <div class="order-actions">
              ${canAdvance ? `<button class="btn btn-primary btn-sm btn-advance" data-id="${order.id}" title="Simulate delivery step">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                ${order.status === 'pending' ? 'Start Processing' : 'Mark Active'}
              </button>` : ''}
              ${canCancel ? `<button class="btn btn-ghost btn-sm btn-cancel-order" data-id="${order.id}" style="color:var(--color-red)">Cancel</button>` : ''}
              ${product ? `<button class="btn btn-ghost btn-sm" onclick="App.hideModal(); location.hash='#/catalog'" title="View product in catalog">View Product</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function bindEvents(container) {
    container.querySelectorAll('.status-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        filterStatus = tab.dataset.status;
        container.querySelectorAll('.status-tab').forEach(t => t.classList.toggle('active', t.dataset.status === filterStatus));
        renderOrders(container);
      });
    });
  }

  return { render };
})();
