// DataMesh Platform - Home Dashboard View
const HomeView = (() => {
  function render(container) {
    const stats = DataMesh.getStats();
    const recentOrders = [...DataMesh.state.orders].reverse().slice(0, 5);

    const domainBreakdown = {};
    DataMesh.state.products.forEach(p => {
      domainBreakdown[p.domain] = (domainBreakdown[p.domain] || 0) + 1;
    });
    const maxDomain = Math.max(...Object.values(domainBreakdown));

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="view-title">Platform Overview</h1>
          <p class="view-subtitle">Welcome to the DataMesh Platform — your central hub for data products.</p>
        </div>
        <div class="view-actions">
          <a href="#/graph" class="btn btn-secondary" onclick="location.hash='#/graph'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            View Graph
          </a>
          <a href="#/marketplace" class="btn btn-primary" onclick="location.hash='#/marketplace'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Browse Marketplace
          </a>
        </div>
      </div>

      <div class="kpi-grid">
        ${kpiCard('Total Data Products', stats.totalProducts, 'All registered products', '#3b82f6', iconGrid())}
        ${kpiCard('Active Products', stats.activeProducts, `${stats.draftProducts} in draft`, '#22c55e', iconCheck())}
        ${kpiCard('Active Subscriptions', stats.activeOrders, `${stats.pendingOrders} pending`, '#a855f7', iconOrders())}
        ${kpiCard('Data Connections', stats.totalConnections, 'Product chain links', '#f59e0b', iconLink())}
      </div>

      <div class="home-grid">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Products by Domain</h2>
          </div>
          <div class="card-body domain-chart">
            ${Object.entries(domainBreakdown).map(([domain, count]) => `
              <div class="domain-bar-row">
                <span class="domain-bar-label">
                  <span class="domain-dot" style="background:${DataMesh.getDomainColor(domain)}"></span>
                  ${domain}
                </span>
                <div class="domain-bar-track">
                  <div class="domain-bar-fill" style="width:${(count / maxDomain) * 100}%; background:${DataMesh.getDomainColor(domain)}"></div>
                </div>
                <span class="domain-bar-count">${count}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Recent Orders</h2>
            <a href="#/orders" class="card-link" onclick="location.hash='#/orders'">View all</a>
          </div>
          <div class="card-body p0">
            ${recentOrders.length === 0 ? '<div class="empty-state-small">No orders yet.</div>' :
              `<table class="table">
                <thead><tr><th>Product</th><th>Team</th><th>Status</th></tr></thead>
                <tbody>
                  ${recentOrders.map(order => {
                    const product = DataMesh.getProduct(order.productId);
                    return `<tr>
                      <td><span class="text-primary">${product ? product.name : 'Unknown'}</span></td>
                      <td><span class="text-muted">${order.team}</span></td>
                      <td>${statusBadge(order.status)}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>`
            }
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Data Product Chain</h2>
            <a href="#/graph" class="card-link" onclick="location.hash='#/graph'">Open graph</a>
          </div>
          <div class="card-body">
            <div class="chain-preview">
              ${renderChainPreview()}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Product Statuses</h2>
          </div>
          <div class="card-body">
            <div class="status-summary">
              <div class="status-item">
                <div class="status-circle status-circle--active"></div>
                <div class="status-info">
                  <span class="status-count">${stats.activeProducts}</span>
                  <span class="status-name">Active</span>
                </div>
              </div>
              <div class="status-item">
                <div class="status-circle status-circle--draft"></div>
                <div class="status-info">
                  <span class="status-count">${stats.draftProducts}</span>
                  <span class="status-name">Draft</span>
                </div>
              </div>
              <div class="status-item">
                <div class="status-circle status-circle--deprecated"></div>
                <div class="status-info">
                  <span class="status-count">${stats.deprecatedProducts}</span>
                  <span class="status-name">Deprecated</span>
                </div>
              </div>
            </div>
            <div class="product-mini-list">
              ${DataMesh.state.products.slice(0, 5).map(p => `
                <div class="product-mini-item">
                  <span class="product-mini-dot" style="background:${DataMesh.getDomainColor(p.domain)}"></span>
                  <span class="product-mini-name">${p.name}</span>
                  <span class="product-mini-version">v${p.version}</span>
                </div>
              `).join('')}
              ${DataMesh.state.products.length > 5 ? `<div class="text-muted" style="font-size:12px;padding:8px 0">+${DataMesh.state.products.length - 5} more products</div>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function kpiCard(title, value, subtitle, color, icon) {
    return `
      <div class="kpi-card">
        <div class="kpi-icon" style="background:${color}20; color:${color}">${icon}</div>
        <div class="kpi-content">
          <div class="kpi-value" style="color:${color}">${value}</div>
          <div class="kpi-title">${title}</div>
          <div class="kpi-subtitle">${subtitle}</div>
        </div>
      </div>
    `;
  }

  function statusBadge(status) {
    const map = { active: 'success', pending: 'warning', processing: 'info', cancelled: 'danger', draft: 'neutral', deprecated: 'danger' };
    return `<span class="badge badge--${map[status] || 'neutral'}">${status}</span>`;
  }

  function renderChainPreview() {
    // Show a simplified linear chain: source → ... → sink
    const connected = new Set();
    const hasIncoming = new Set();
    DataMesh.state.connections.forEach(c => {
      connected.add(c.fromProductId);
      connected.add(c.toProductId);
      hasIncoming.add(c.toProductId);
    });
    const sources = DataMesh.state.products.filter(p => connected.has(p.id) && !hasIncoming.has(p.id));
    const sinks   = DataMesh.state.products.filter(p => connected.has(p.id) && !DataMesh.state.connections.some(c => c.fromProductId === p.id));

    return `
      <div class="chain-flow">
        <div class="chain-column">
          <div class="chain-label">Sources</div>
          ${sources.map(p => `
            <div class="chain-node" style="border-color:${DataMesh.getDomainColor(p.domain)}">
              <span class="chain-node-dot" style="background:${DataMesh.getDomainColor(p.domain)}"></span>
              <span>${p.name}</span>
            </div>
          `).join('')}
        </div>
        <div class="chain-arrow">→</div>
        <div class="chain-column">
          <div class="chain-label">Intermediary</div>
          ${DataMesh.state.products.filter(p => connected.has(p.id) && hasIncoming.has(p.id) && DataMesh.state.connections.some(c => c.fromProductId === p.id)).map(p => `
            <div class="chain-node" style="border-color:${DataMesh.getDomainColor(p.domain)}">
              <span class="chain-node-dot" style="background:${DataMesh.getDomainColor(p.domain)}"></span>
              <span>${p.name}</span>
            </div>
          `).join('')}
        </div>
        <div class="chain-arrow">→</div>
        <div class="chain-column">
          <div class="chain-label">Consumers</div>
          ${sinks.map(p => `
            <div class="chain-node" style="border-color:${DataMesh.getDomainColor(p.domain)}">
              <span class="chain-node-dot" style="background:${DataMesh.getDomainColor(p.domain)}"></span>
              <span>${p.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function iconGrid() { return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`; }
  function iconCheck() { return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`; }
  function iconOrders() { return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>`; }
  function iconLink() { return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`; }

  return { render };
})();
