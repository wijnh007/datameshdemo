// DataMesh Platform - Marketplace View
const MarketplaceView = (() => {
  let filterDomain = '';
  let filterTier = '';
  let searchQuery = '';

  function render(container) {
    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="view-title">Data Product Marketplace</h1>
          <p class="view-subtitle">Discover, evaluate, and subscribe to data products for your use case.</p>
        </div>
        <div class="view-actions">
          <a href="#/orders" class="btn btn-secondary" onclick="location.hash='#/orders'">My Orders (${DataMesh.state.orders.length})</a>
        </div>
      </div>

      <div class="toolbar">
        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="search-input" id="mp-search" placeholder="Search products..." value="${searchQuery}">
        </div>
        <div class="filter-group">
          <select class="select" id="mp-filter-domain">
            <option value="">All Domains</option>
            ${[...new Set(DataMesh.state.products.map(p => p.domain))].map(d => `<option value="${d}" ${filterDomain === d ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
          <select class="select" id="mp-filter-tier">
            <option value="">All Tiers</option>
            <option value="free" ${filterTier === 'free' ? 'selected' : ''}>Free</option>
            <option value="standard" ${filterTier === 'standard' ? 'selected' : ''}>Standard</option>
            <option value="premium" ${filterTier === 'premium' ? 'selected' : ''}>Premium</option>
          </select>
        </div>
      </div>

      <div class="marketplace-grid" id="marketplace-grid"></div>
    `;

    renderGrid(container);
    bindEvents(container);
  }

  function renderGrid(container) {
    const grid = container.querySelector('#marketplace-grid') || document.getElementById('marketplace-grid');
    const products = DataMesh.state.products.filter(p => {
      if (p.status === 'deprecated') return false;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.domain.toLowerCase().includes(q);
      const matchDomain = !filterDomain || p.domain === filterDomain;
      const matchTier   = !filterTier   || p.accessTier === filterTier;
      return matchSearch && matchDomain && matchTier;
    });

    if (products.length === 0) {
      grid.innerHTML = `<div class="empty-state"><p>No products match your search.</p></div>`;
      return;
    }

    grid.innerHTML = products.map(p => productCard(p)).join('');
    grid.querySelectorAll('.btn-subscribe').forEach(btn => {
      btn.addEventListener('click', () => openOrderModal(btn.dataset.id));
    });
    grid.querySelectorAll('.btn-card-details').forEach(btn => {
      btn.addEventListener('click', () => openProductDetails(btn.dataset.id));
    });
  }

  function productCard(p) {
    const tierColors   = { free: '#22c55e', standard: '#3b82f6', premium: '#a855f7' };
    const statusLabel  = { active: 'Live', draft: 'Preview' }[p.status] || p.status;
    const isSubscribed = DataMesh.state.orders.some(o => o.productId === p.id && (o.status === 'active' || o.status === 'processing' || o.status === 'pending'));
    const domColor     = DataMesh.getDomainColor(p.domain);

    return `
      <div class="mp-card">
        <div class="mp-card-header" style="background: linear-gradient(135deg, ${domColor}22, ${domColor}08)">
          <div class="mp-card-domain">
            <span class="domain-dot-lg" style="background:${domColor}"></span>
            <span style="color:${domColor}; font-weight:600">${p.domain}</span>
          </div>
          <div class="mp-card-tier" style="color:${tierColors[p.accessTier]}; background:${tierColors[p.accessTier]}15">
            ${tierIcon(p.accessTier)} ${p.accessTier.charAt(0).toUpperCase() + p.accessTier.slice(1)}
          </div>
          ${p.status === 'draft' ? `<span class="mp-card-preview-badge">Preview</span>` : ''}
        </div>
        <div class="mp-card-body">
          <h3 class="mp-card-title">${p.name}</h3>
          <p class="mp-card-desc">${p.description.length > 120 ? p.description.slice(0, 120) + '…' : p.description}</p>
          <div class="mp-card-meta">
            <div class="mp-meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${p.updateFrequency}
            </div>
            <div class="mp-meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              SLA ${p.sla}
            </div>
            <div class="mp-meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              ${p.owner}
            </div>
          </div>
          <div class="mp-card-ports">
            ${p.outputPorts.map(port => `
              <div class="mp-port-item">
                <span class="mp-port-type-dot" style="background:${DataMesh.getPortTypeColor(port.type)}" title="${port.type}"></span>
                <span class="mp-port-name">${port.name}</span>
                <span class="mp-port-format">${port.format}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="mp-card-footer">
          <button class="btn btn-ghost btn-sm btn-card-details" data-id="${p.id}">Details</button>
          ${isSubscribed
            ? `<button class="btn btn-secondary btn-sm" disabled>✓ Subscribed</button>`
            : `<button class="btn btn-primary btn-sm btn-subscribe" data-id="${p.id}">Subscribe</button>`
          }
        </div>
      </div>
    `;
  }

  function tierIcon(tier) {
    if (tier === 'free')     return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    if (tier === 'standard') return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    if (tier === 'premium')  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    return '';
  }

  function openProductDetails(id) {
    const p = DataMesh.getProduct(id);
    if (!p) return;
    const domColor = DataMesh.getDomainColor(p.domain);
    App.showModal(p.name, `
      <div class="mp-detail-header" style="background:linear-gradient(135deg, ${domColor}22, transparent); border-left: 4px solid ${domColor}; padding: 16px; margin-bottom: 20px; border-radius: 8px;">
        <p style="margin:0 0 8px; color:var(--color-text-secondary)">${p.domain} · v${p.version} · ${p.updateFrequency}</p>
        <p style="margin:0">${p.description}</p>
      </div>
      <div class="detail-grid">
        <div class="detail-section">
          <h3 class="detail-section-title">Available Output Ports</h3>
          <p class="text-muted" style="margin-bottom:12px; font-size:13px">Subscribe to access any of these outputs:</p>
          ${p.outputPorts.map(port => `
            <div class="mp-output-option">
              <div>
                <span class="port-detail-type" style="background:${DataMesh.getPortTypeColor(port.type)}20;color:${DataMesh.getPortTypeColor(port.type)}">${port.type}</span>
                <strong>${port.name}</strong>
                <span class="text-muted"> · ${port.format}</span>
              </div>
              <p class="text-muted" style="margin:4px 0 0; font-size:13px">${port.description}</p>
            </div>
          `).join('')}
        </div>
        <div class="detail-section">
          <h3 class="detail-section-title">Service Level Agreement</h3>
          <div class="detail-props">
            <div class="detail-prop"><span class="detail-prop-label">Availability</span><span>${p.sla}</span></div>
            <div class="detail-prop"><span class="detail-prop-label">Update Frequency</span><span>${p.updateFrequency}</span></div>
            <div class="detail-prop"><span class="detail-prop-label">Access Tier</span><span>${p.accessTier}</span></div>
            <div class="detail-prop"><span class="detail-prop-label">Owner</span><span>${p.owner}</span></div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="App.hideModal()">Close</button>
        <button class="btn btn-primary" onclick="App.hideModal(); MarketplaceView._openOrder('${id}')">Subscribe Now</button>
      </div>
    `, { wide: true });
  }

  function openOrderModal(id) {
    const p = DataMesh.getProduct(id);
    if (!p) return;
    App.showModal(`Subscribe: ${p.name}`, `
      <form id="order-form" class="product-form">
        <p class="form-desc" style="margin-bottom:16px">Complete this form to subscribe to <strong>${p.name}</strong>. Your request will be processed by the data product owner.</p>

        <div class="form-group">
          <label class="form-label">Select Output Port *</label>
          <select class="select" name="outputPortId" required>
            ${p.outputPorts.map(port => `<option value="${port.id}">${port.name} (${port.type} · ${port.format})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Your Team / Project *</label>
          <input type="text" class="form-input" name="team" required placeholder="e.g. ML Engineering">
        </div>
        <div class="form-group">
          <label class="form-label">Purpose / Use Case *</label>
          <textarea class="form-input form-textarea" name="purpose" required placeholder="Describe how you intend to use this data product..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Expected Volume</label>
          <select class="select" name="volume">
            <option>Low (&lt; 1k requests/day)</option>
            <option>Medium (1k–100k requests/day)</option>
            <option>High (&gt; 100k requests/day)</option>
          </select>
        </div>

        <div class="sla-preview" style="background:var(--color-surface-2);border-radius:8px;padding:12px;margin-bottom:16px">
          <div style="font-size:13px;color:var(--color-text-secondary);margin-bottom:8px">You are subscribing under the <strong>${p.accessTier}</strong> tier</div>
          <div style="display:flex;gap:24px;font-size:13px">
            <span>SLA: <strong>${p.sla}</strong></span>
            <span>Update: <strong>${p.updateFrequency}</strong></span>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="App.hideModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Place Order</button>
        </div>
      </form>
    `);

    document.getElementById('order-form').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      DataMesh.placeOrder({
        productId: id,
        outputPortId: fd.get('outputPortId'),
        team: fd.get('team'),
        purpose: fd.get('purpose'),
      });
      App.hideModal();
      App.notify(`Order placed for "${p.name}". Processing will begin shortly.`, 'success');
    });
  }

  function bindEvents(container) {
    container.querySelector('#mp-search').addEventListener('input', e => {
      searchQuery = e.target.value;
      renderGrid(container);
    });
    container.querySelector('#mp-filter-domain').addEventListener('change', e => {
      filterDomain = e.target.value;
      renderGrid(container);
    });
    container.querySelector('#mp-filter-tier').addEventListener('change', e => {
      filterTier = e.target.value;
      renderGrid(container);
    });
  }

  return { render, _openOrder: openOrderModal };
})();
