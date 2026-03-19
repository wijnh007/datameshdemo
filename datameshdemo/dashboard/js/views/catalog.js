// DataMesh Platform - Catalog View
const CatalogView = (() => {
  let searchQuery = '';
  let filterDomain = '';
  let filterStatus = '';

  function render(container) {
    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="view-title">Data Product Catalog</h1>
          <p class="view-subtitle">Browse, manage, and edit all registered data products.</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" id="btn-add-product">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Product
          </button>
        </div>
      </div>

      <div class="toolbar">
        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="search-input" id="catalog-search" placeholder="Search products..." value="${searchQuery}">
        </div>
        <div class="filter-group">
          <select class="select" id="filter-domain">
            <option value="">All Domains</option>
            ${[...new Set(DataMesh.state.products.map(p => p.domain))].map(d => `<option value="${d}" ${filterDomain === d ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
          <select class="select" id="filter-status">
            <option value="">All Statuses</option>
            <option value="active" ${filterStatus === 'active' ? 'selected' : ''}>Active</option>
            <option value="draft" ${filterStatus === 'draft' ? 'selected' : ''}>Draft</option>
            <option value="deprecated" ${filterStatus === 'deprecated' ? 'selected' : ''}>Deprecated</option>
          </select>
        </div>
      </div>

      <div id="catalog-list"></div>
    `;

    renderList(container);
    bindEvents(container);
  }

  function renderList(container) {
    const list = container.querySelector('#catalog-list') || document.getElementById('catalog-list');
    const products = DataMesh.state.products.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
      const matchDomain = !filterDomain || p.domain === filterDomain;
      const matchStatus = !filterStatus || p.status === filterStatus;
      return matchSearch && matchDomain && matchStatus;
    });

    if (products.length === 0) {
      list.innerHTML = `<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg><p>No data products match your filters.</p></div>`;
      return;
    }

    list.innerHTML = products.map(p => productRow(p)).join('');

    list.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    list.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
    });
    list.querySelectorAll('.btn-view-details').forEach(btn => {
      btn.addEventListener('click', () => openDetailsModal(btn.dataset.id));
    });
  }

  function productRow(p) {
    const statusClass = { active: 'success', draft: 'warning', deprecated: 'danger' }[p.status] || 'neutral';
    const tierClass   = { free: 'success', standard: 'info', premium: 'warning' }[p.accessTier] || 'neutral';
    const connections = DataMesh.state.connections.filter(c => c.fromProductId === p.id || c.toProductId === p.id).length;

    return `
      <div class="product-card" data-id="${p.id}">
        <div class="product-card-stripe" style="background:${DataMesh.getDomainColor(p.domain)}"></div>
        <div class="product-card-main">
          <div class="product-card-header">
            <div class="product-card-title-row">
              <h3 class="product-card-name">${p.name}</h3>
              <div class="product-card-badges">
                <span class="badge badge--${statusClass}">${p.status}</span>
                <span class="badge badge--${tierClass}">${p.accessTier}</span>
              </div>
            </div>
            <div class="product-card-meta">
              <span class="domain-tag" style="background:${DataMesh.getDomainColor(p.domain)}20; color:${DataMesh.getDomainColor(p.domain)}">${p.domain}</span>
              <span class="meta-item">v${p.version}</span>
              <span class="meta-item">${p.owner}</span>
              <span class="meta-item">${p.updateFrequency}</span>
              <span class="meta-item">SLA ${p.sla}</span>
            </div>
          </div>
          <p class="product-card-desc">${p.description}</p>
          <div class="product-card-ports">
            <div class="ports-column">
              <div class="ports-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                ${p.inputPorts.length} Input${p.inputPorts.length !== 1 ? 's' : ''}
              </div>
              <div class="port-chips">
                ${p.inputPorts.map(port => `<span class="port-chip" style="border-color:${DataMesh.getPortTypeColor(port.type)}" title="${port.description}">${port.name}</span>`).join('')}
              </div>
            </div>
            <div class="ports-divider"></div>
            <div class="ports-column">
              <div class="ports-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                ${p.outputPorts.length} Output${p.outputPorts.length !== 1 ? 's' : ''}
              </div>
              <div class="port-chips">
                ${p.outputPorts.map(port => `<span class="port-chip" style="border-color:${DataMesh.getPortTypeColor(port.type)}" title="${port.description}">${port.name}</span>`).join('')}
              </div>
            </div>
          </div>
          <div class="product-card-tags">
            ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            <span class="meta-item" style="margin-left:auto">${connections} connection${connections !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div class="product-card-actions">
          <button class="btn btn-ghost btn-sm btn-view-details" data-id="${p.id}" title="View details">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm btn-edit" data-id="${p.id}" title="Edit product">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm btn-delete" data-id="${p.id}" title="Delete product" style="color:var(--color-red)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        </div>
      </div>
    `;
  }

  function openDetailsModal(id) {
    const p = DataMesh.getProduct(id);
    if (!p) return;
    const incoming = DataMesh.state.connections.filter(c => c.toProductId === id);
    const outgoing = DataMesh.state.connections.filter(c => c.fromProductId === id);
    const dm = (typeof TMFDataModels !== 'undefined') ? TMFDataModels.get(id) : null;

    App.showModal(`${p.name}`, `
      <div class="detail-tabs">
        <button class="detail-tab active" data-tab="overview">Overview</button>
        <button class="detail-tab" data-tab="datamodel">Data Model</button>
        <button class="detail-tab" data-tab="ports">Ports</button>
        <button class="detail-tab" data-tab="lineage">Lineage</button>
      </div>

      <div class="detail-tab-panel active" data-panel="overview">
        <div class="detail-grid">
          <div class="detail-section">
            <p class="detail-desc">${p.description}</p>
            <div class="detail-props">
              <div class="detail-prop"><span class="detail-prop-label">Domain</span><span class="domain-tag" style="background:${DataMesh.getDomainColor(p.domain)}20;color:${DataMesh.getDomainColor(p.domain)}">${p.domain}</span></div>
              <div class="detail-prop"><span class="detail-prop-label">Owner</span><span>${p.owner}</span></div>
              <div class="detail-prop"><span class="detail-prop-label">Version</span><span>v${p.version}</span></div>
              <div class="detail-prop"><span class="detail-prop-label">Status</span><span class="badge badge--${p.status === 'active' ? 'success' : p.status === 'draft' ? 'warning' : 'danger'}">${p.status}</span></div>
              <div class="detail-prop"><span class="detail-prop-label">SLA</span><span>${p.sla}</span></div>
              <div class="detail-prop"><span class="detail-prop-label">Update Frequency</span><span>${p.updateFrequency}</span></div>
              <div class="detail-prop"><span class="detail-prop-label">Access Tier</span><span>${p.accessTier}</span></div>
            </div>
          </div>
          <div class="detail-section">
            <h3 class="detail-section-title">Tags</h3>
            <div class="product-card-tags" style="flex-wrap:wrap;gap:6px">
              ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="detail-tab-panel" data-panel="datamodel">
        ${dm ? dataModelPanel(dm) : '<div class="empty-state"><p>No data model defined for this product.</p></div>'}
      </div>

      <div class="detail-tab-panel" data-panel="ports">
        <div class="detail-grid">
          <div class="detail-section">
            <h3 class="detail-section-title">Input Ports (${p.inputPorts.length})</h3>
            ${p.inputPorts.map(port => portDetailCard(port, 'input')).join('')}
          </div>
          <div class="detail-section">
            <h3 class="detail-section-title">Output Ports (${p.outputPorts.length})</h3>
            ${p.outputPorts.map(port => portDetailCard(port, 'output')).join('')}
          </div>
        </div>
      </div>

      <div class="detail-tab-panel" data-panel="lineage">
        <div class="detail-grid">
          ${incoming.length > 0 ? `<div class="detail-section">
            <h3 class="detail-section-title">Receives From</h3>
            ${incoming.map(c => {
              const src = DataMesh.getProduct(c.fromProductId);
              const port = DataMesh.getPortById(c.fromProductId, c.fromPortId);
              return src ? `<div class="conn-item"><span class="conn-dot" style="background:${DataMesh.getDomainColor(src.domain)}"></span><span>${src.name}</span><span class="text-muted">→ ${port ? port.name : c.fromPortId}</span></div>` : '';
            }).join('')}
          </div>` : '<div class="detail-section"><p class="text-muted">No upstream sources connected.</p></div>'}
          ${outgoing.length > 0 ? `<div class="detail-section">
            <h3 class="detail-section-title">Sends To</h3>
            ${outgoing.map(c => {
              const tgt = DataMesh.getProduct(c.toProductId);
              const port = DataMesh.getPortById(c.toProductId, c.toPortId);
              return tgt ? `<div class="conn-item"><span class="conn-dot" style="background:${DataMesh.getDomainColor(tgt.domain)}"></span><span>${tgt.name}</span><span class="text-muted">← ${port ? port.name : c.toPortId}</span></div>` : '';
            }).join('')}
          </div>` : '<div class="detail-section"><p class="text-muted">No downstream consumers connected.</p></div>'}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-primary" onclick="App.hideModal(); location.hash='#/marketplace'">Subscribe via Marketplace</button>
        <button class="btn btn-secondary" onclick="CatalogView._openEdit('${id}')">Edit Product</button>
      </div>
    `, { wide: true });

    // Tab switching
    document.querySelectorAll('.detail-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.detail-tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.querySelector(`.detail-tab-panel[data-panel="${tab.dataset.tab}"]`).classList.add('active');
      });
    });

    // Data model sub-view toggle (Attributes ↔ ERD)
    document.querySelectorAll('.dm-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.dm-view-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.dm-view-panel').forEach(panel => panel.style.display = 'none');
        btn.classList.add('active');
        document.querySelector(`.dm-view-panel[data-dm-panel="${btn.dataset.dmView}"]`).style.display = 'block';
      });
    });
  }

  function dataModelPanel(dm) {
    const reqBadge = req => req
      ? '<span class="dm-req dm-req--yes">required</span>'
      : '<span class="dm-req dm-req--no">optional</span>';

    return `
      <div class="dm-header">
        <div class="dm-meta-row">
          <div class="dm-meta-item">
            <span class="dm-meta-label">Standard</span>
            <span class="dm-meta-value">${dm.standard}</span>
          </div>
          <div class="dm-meta-item">
            <span class="dm-meta-label">SID Module</span>
            <span class="dm-meta-value">${dm.module}</span>
          </div>
          <div class="dm-meta-item">
            <span class="dm-meta-label">Primary Entity</span>
            <span class="dm-meta-value dm-entity">${dm.entity}</span>
          </div>
          <div class="dm-meta-item">
            <span class="dm-meta-label">Spec Reference</span>
            <span class="dm-meta-value">${dm.specRef}</span>
          </div>
          ${dm.openApiRef ? `<div class="dm-meta-item">
            <span class="dm-meta-label">Open API</span>
            <span class="dm-meta-value dm-api-ref">${dm.openApiRef}</span>
          </div>` : ''}
        </div>
        ${dm.note ? `<p class="dm-note">${dm.note}</p>` : ''}
      </div>

      <div class="dm-view-toggle">
        <button class="dm-view-btn active" data-dm-view="attrs">Attributes</button>
        <button class="dm-view-btn" data-dm-view="erd">ERD</button>
      </div>

      <div class="dm-view-panel" data-dm-panel="attrs">
        <div class="dm-table-wrap">
          <table class="dm-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Type</th>
                <th>Mult.</th>
                <th>Required</th>
                <th>SID Reference</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${dm.attributes.map(a => `
                <tr class="${a.req ? 'dm-row--req' : ''}">
                  <td class="dm-attr-name">${a.name}</td>
                  <td class="dm-attr-type">${a.type}</td>
                  <td class="dm-attr-mult">${a.mult}</td>
                  <td>${reqBadge(a.req)}</td>
                  <td class="dm-attr-ref">${a.sidRef}</td>
                  <td class="dm-attr-desc">${a.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="dm-view-panel" data-dm-panel="erd" style="display:none">
        <div class="dm-erd-wrap">
          ${buildErdSvg(dm)}
        </div>
      </div>
    `;
  }

  function buildErdSvg(dm) {
    // SID / IETF primitive & enum types — excluded from relationship boxes
    const PRIMITIVES = new Set([
      'String','Integer','Boolean','DateTime','Date','Decimal','Long',
      'Duration','Object','Any','Enum','Number',
      'AccountStateType','FinancialAccountStateType','PaymentStatusType',
      'TroubleTicketStatusType','ServiceStateType','ServiceProblemStateType',
      'ResourceAdministrativeStateType','ResourceLifecycleStateType',
      'ResourceOperationalStateType','ResourceUsageStateType',
      'UsageStatusType','ProductOrderStateType','PromotionStatusType',
      'AgreementStatusType','InvoiceStateType','WorkOrderStateType',
      'CIStatusType','PolicyStateType','GenderType',
    ]);

    // Main SID entities (purple) vs value objects (teal)
    const SID_MAIN = new Set([
      'CustomerAccount','Individual','ProductOffering','ProductOrder','Promotion',
      'Service','ServiceLevelAgreement','Resource','NetworkElement','Usage',
      'Invoice','Payment','TroubleTicket','PartyInteraction','Agreement',
      'FinancialAccount','ServiceProblem','ConfigurationItem','WorkOrder',
      'Event','PolicyCondition',
    ]);

    function extractRef(type) {
      const base = type.replace(/\[\]$/, '').replace(/Ref$/, '');
      if (PRIMITIVES.has(base) || base === dm.entity) return null;
      return base;
    }

    const trunc = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
    const e = s => String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    // Collect unique refs, preserving first attribute index per ref
    const seen = new Map();
    dm.attributes.forEach((a, i) => {
      const ref = extractRef(a.type);
      if (ref && !seen.has(ref)) seen.set(ref, { attrIdx: i, mult: a.mult });
    });
    const refs = [...seen.entries()].map(([name, info]) => ({ name, ...info }));

    // ── Layout constants ──────────────────────────────────────
    const PX = 20, PY = 24;
    const PW = 310;
    const ATTR_H = 22;
    const HDR_H  = 44;
    const BOT_PAD = 10;
    const PH = HDR_H + dm.attributes.length * ATTR_H + BOT_PAD;

    const GUTTER = 90;
    const RX = PX + PW + GUTTER;
    const RW = 196;
    const RH = 44;
    const RGAP = 10;

    const totalRefH = refs.length > 0
      ? refs.length * RH + (refs.length - 1) * RGAP
      : 0;

    const LEGEND_H = refs.length > 0 ? 28 : 0;
    const SVG_H = Math.max(PH, totalRefH) + PY * 2 + LEGEND_H;
    const SVG_W = refs.length > 0 ? RX + RW + PX : PX + PW + PX;

    const refStartY = refs.length > 0 ? (SVG_H - LEGEND_H - totalRefH) / 2 : 0;
    const elbowX   = PX + PW + GUTTER / 2;

    // ── Colours ───────────────────────────────────────────────
    const C = {
      bg:      '#0f172a', surface: '#1e293b', surface2: '#253045',
      border:  '#334155', text:    '#f1f5f9', sec:      '#94a3b8',
      muted:   '#64748b', blue:    '#3b82f6', purple:   '#a855f7',
      orange:  '#f59e0b', teal:    '#14b8a6',
    };

    const parts = [];

    // clip path so attribute rows don't bleed outside rounded rect
    const clipId = `erd-clip-${dm.entity}`;
    parts.push(`<defs>
      <clipPath id="${clipId}">
        <rect x="${PX + 1}" y="${PY + HDR_H}" width="${PW - 2}"
              height="${dm.attributes.length * ATTR_H + BOT_PAD}"/>
      </clipPath>
    </defs>`);

    parts.push(`<rect width="${SVG_W}" height="${SVG_H}" fill="${C.bg}"/>`);

    // ── Connector lines (drawn behind boxes) ─────────────────
    refs.forEach(({ name, attrIdx, mult }, ri) => {
      const ry       = refStartY + ri * (RH + RGAP);
      const refMidY  = ry + RH / 2;
      const attrMidY = PY + HDR_H + attrIdx * ATTR_H + ATTR_H / 2;
      const dashed   = mult.startsWith('0') || mult.includes('*');
      const dash     = dashed ? 'stroke-dasharray="5 3"' : '';
      const straight = Math.abs(attrMidY - refMidY) < 3;
      const path     = straight
        ? `M ${PX + PW} ${attrMidY} H ${RX}`
        : `M ${PX + PW} ${attrMidY} H ${elbowX} V ${refMidY} H ${RX}`;
      const tipX = RX, tipY = refMidY;
      const lx = elbowX + 6, ly = refMidY - 5;

      parts.push(`
        <path d="${path}" stroke="${C.border}" stroke-width="1.5" fill="none" ${dash} opacity="0.75"/>
        <polygon points="${tipX},${tipY} ${tipX - 8},${tipY - 4} ${tipX - 8},${tipY + 4}"
                 fill="${C.border}" opacity="0.75"/>
        <text x="${lx}" y="${ly}" fill="${C.muted}" font-size="10"
              font-family="monospace">${e(mult)}</text>
      `);
    });

    // ── Primary entity box ────────────────────────────────────
    // Drop shadow
    parts.push(`<rect x="${PX + 3}" y="${PY + 3}" width="${PW}" height="${PH}"
                      rx="8" fill="black" opacity="0.25"/>`);
    // Body
    parts.push(`<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"
                      rx="8" fill="${C.surface}" stroke="${C.purple}" stroke-width="1.5" stroke-opacity="0.55"/>`);
    // Header fill
    parts.push(`<rect x="${PX}" y="${PY}" width="${PW}" height="${HDR_H}"
                      rx="8" fill="${C.purple}" fill-opacity="0.18"/>`);
    parts.push(`<rect x="${PX}" y="${PY + HDR_H - 8}" width="${PW}" height="8"
                      fill="${C.purple}" fill-opacity="0.18"/>`);
    // Stereotype + entity name
    parts.push(`<text x="${PX + PW / 2}" y="${PY + 15}" text-anchor="middle"
                      fill="${C.purple}" font-size="9" font-family="monospace"
                      font-weight="700" letter-spacing="1">«SID entity»</text>`);
    parts.push(`<text x="${PX + PW / 2}" y="${PY + 33}" text-anchor="middle"
                      fill="${C.text}" font-size="14" font-family="monospace"
                      font-weight="700">${e(dm.entity)}</text>`);
    parts.push(`<line x1="${PX + 1}" y1="${PY + HDR_H}" x2="${PX + PW - 1}" y2="${PY + HDR_H}"
                      stroke="${C.purple}" stroke-width="1" stroke-opacity="0.4"/>`);

    // Attribute rows (clipped inside box)
    parts.push(`<g clip-path="url(#${clipId})">`);
    dm.attributes.forEach((a, i) => {
      const ay  = PY + HDR_H + i * ATTR_H;
      const isR = extractRef(a.type) !== null;
      const tc  = isR ? C.teal : C.orange;
      if (i % 2 === 1) {
        parts.push(`<rect x="${PX}" y="${ay}" width="${PW}" height="${ATTR_H}"
                          fill="${C.surface2}"/>`);
      }
      if (a.req) {
        parts.push(`<circle cx="${PX + 9}" cy="${ay + ATTR_H / 2}" r="2.5"
                            fill="${C.blue}" opacity="0.85"/>`);
      }
      const nameStr = trunc(a.name, 22);
      const typeStr = trunc(`${a.type} [${a.mult}]`, 24);
      parts.push(`<text x="${PX + 18}" y="${ay + 15}"
                        fill="${a.req ? C.text : C.sec}"
                        font-size="11" font-family="monospace"
                        font-weight="${a.req ? '600' : '400'}">${e(nameStr)}</text>`);
      parts.push(`<text x="${PX + PW - 10}" y="${ay + 15}" text-anchor="end"
                        fill="${tc}" font-size="10"
                        font-family="monospace">${e(typeStr)}</text>`);
      if (i < dm.attributes.length - 1) {
        parts.push(`<line x1="${PX + 1}" y1="${ay + ATTR_H}" x2="${PX + PW - 1}" y2="${ay + ATTR_H}"
                          stroke="${C.border}" stroke-width="0.5" opacity="0.5"/>`);
      }
    });
    parts.push('</g>');

    // Re-draw border on top so clip edges look clean
    parts.push(`<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"
                      rx="8" fill="none" stroke="${C.purple}" stroke-width="1.5" stroke-opacity="0.55"/>`);

    // ── Referenced entity boxes ───────────────────────────────
    refs.forEach(({ name }, ri) => {
      const ry        = refStartY + ri * (RH + RGAP);
      const isMain    = SID_MAIN.has(name);
      const bc        = isMain ? C.purple : C.teal;
      const stereo    = isMain ? '«entity»' : '«value object»';
      parts.push(`<rect x="${RX + 2}" y="${ry + 2}" width="${RW}" height="${RH}"
                        rx="6" fill="black" opacity="0.2"/>`);
      parts.push(`<rect x="${RX}" y="${ry}" width="${RW}" height="${RH}"
                        rx="6" fill="${C.surface}" stroke="${bc}" stroke-width="1.5" stroke-opacity="0.55"/>`);
      parts.push(`<rect x="${RX}" y="${ry}" width="${RW}" height="19"
                        rx="6" fill="${bc}" fill-opacity="0.15"/>`);
      parts.push(`<rect x="${RX}" y="${ry + 13}" width="${RW}" height="6"
                        fill="${bc}" fill-opacity="0.15"/>`);
      parts.push(`<text x="${RX + RW / 2}" y="${ry + 13}" text-anchor="middle"
                        fill="${bc}" font-size="8" font-family="monospace"
                        font-weight="700" letter-spacing="0.5">${stereo}</text>`);
      parts.push(`<text x="${RX + RW / 2}" y="${ry + 33}" text-anchor="middle"
                        fill="${C.text}" font-size="12" font-family="monospace"
                        font-weight="700">${e(trunc(name, 20))}</text>`);
    });

    // ── Legend ────────────────────────────────────────────────
    if (refs.length > 0) {
      const LY = SVG_H - 14;
      parts.push(`
        <circle cx="${PX + 6}" cy="${LY}" r="2.5" fill="${C.blue}" opacity="0.85"/>
        <text x="${PX + 13}" y="${LY + 4}" fill="${C.muted}" font-size="9" font-family="monospace">required</text>
        <line x1="${PX + 74}" y1="${LY}" x2="${PX + 90}" y2="${LY}"
              stroke="${C.border}" stroke-width="1.5" opacity="0.7"/>
        <text x="${PX + 94}" y="${LY + 4}" fill="${C.muted}" font-size="9" font-family="monospace">1 relation</text>
        <line x1="${PX + 160}" y1="${LY}" x2="${PX + 176}" y2="${LY}"
              stroke="${C.border}" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.7"/>
        <text x="${PX + 180}" y="${LY + 4}" fill="${C.muted}" font-size="9" font-family="monospace">0..* relation</text>
        <rect x="${RX}" y="${LY - 6}" width="10" height="10" rx="2"
              fill="${C.purple}" fill-opacity="0.2" stroke="${C.purple}" stroke-width="1" stroke-opacity="0.6"/>
        <text x="${RX + 14}" y="${LY + 4}" fill="${C.muted}" font-size="9" font-family="monospace">SID entity</text>
        <rect x="${RX + 80}" y="${LY - 6}" width="10" height="10" rx="2"
              fill="${C.teal}" fill-opacity="0.2" stroke="${C.teal}" stroke-width="1" stroke-opacity="0.6"/>
        <text x="${RX + 94}" y="${LY + 4}" fill="${C.muted}" font-size="9" font-family="monospace">value object</text>
      `);
    }

    return `<svg viewBox="0 0 ${SVG_W} ${SVG_H}" xmlns="http://www.w3.org/2000/svg"
                 style="width:100%;display:block;border-radius:8px">
      ${parts.join('\n')}
    </svg>`;
  }

  function portDetailCard(port, direction) {
    const color = DataMesh.getPortTypeColor(port.type);
    return `
      <div class="port-detail-card">
        <div class="port-detail-header">
          <span class="port-detail-type" style="background:${color}20;color:${color}">${port.type}</span>
          <span class="port-detail-name">${port.name}</span>
          <span class="port-detail-format">${port.format}</span>
        </div>
        <p class="port-detail-desc">${port.description}</p>
      </div>
    `;
  }

  function openEditModal(id) {
    const p = DataMesh.getProduct(id);
    if (!p) return;
    showProductForm(p);
  }

  function openAddModal() {
    showProductForm(null);
  }

  function showProductForm(p) {
    const isEdit = !!p;
    const domains = Object.keys(DataMesh.DOMAIN_COLORS);
    const portTypes = Object.keys(DataMesh.PORT_TYPE_COLORS);

    App.showModal(isEdit ? `Edit: ${p.name}` : 'Add Data Product', `
      <form id="product-form" class="product-form">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Product Name *</label>
            <input type="text" class="form-input" name="name" value="${p ? p.name : ''}" required placeholder="e.g. Customer Master Data">
          </div>
          <div class="form-group">
            <label class="form-label">Domain *</label>
            <select class="select" name="domain" required>
              ${domains.map(d => `<option value="${d}" ${p && p.domain === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Owner</label>
            <input type="text" class="form-input" name="owner" value="${p ? p.owner : ''}" placeholder="e.g. Platform Team">
          </div>
          <div class="form-group">
            <label class="form-label">Version</label>
            <input type="text" class="form-input" name="version" value="${p ? p.version : '1.0.0'}" placeholder="1.0.0">
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="select" name="status">
              <option value="draft" ${p && p.status === 'draft' ? 'selected' : ''}>Draft</option>
              <option value="active" ${p && p.status === 'active' ? 'selected' : ''}>Active</option>
              <option value="deprecated" ${p && p.status === 'deprecated' ? 'selected' : ''}>Deprecated</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Access Tier</label>
            <select class="select" name="accessTier">
              <option value="free" ${p && p.accessTier === 'free' ? 'selected' : ''}>Free</option>
              <option value="standard" ${p && p.accessTier === 'standard' ? 'selected' : ''}>Standard</option>
              <option value="premium" ${p && p.accessTier === 'premium' ? 'selected' : ''}>Premium</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">SLA</label>
            <input type="text" class="form-input" name="sla" value="${p ? p.sla : '99.0%'}" placeholder="99.9%">
          </div>
          <div class="form-group">
            <label class="form-label">Update Frequency</label>
            <input type="text" class="form-input" name="updateFrequency" value="${p ? p.updateFrequency : 'Daily'}" placeholder="e.g. Real-time">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input form-textarea" name="description" placeholder="Describe this data product...">${p ? p.description : ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Tags (comma-separated)</label>
          <input type="text" class="form-input" name="tags" value="${p ? p.tags.join(', ') : ''}" placeholder="e.g. customer, analytics, gdpr">
        </div>

        <div class="ports-section">
          <div class="ports-section-header">
            <h3 class="ports-section-title">Input Ports</h3>
            <button type="button" class="btn btn-ghost btn-sm" id="add-input-port">+ Add Input Port</button>
          </div>
          <div id="input-ports-list">
            ${(p ? p.inputPorts : []).map((port, i) => portFormRow(port, 'input', i, portTypes)).join('')}
          </div>
        </div>

        <div class="ports-section">
          <div class="ports-section-header">
            <h3 class="ports-section-title">Output Ports</h3>
            <button type="button" class="btn btn-ghost btn-sm" id="add-output-port">+ Add Output Port</button>
          </div>
          <div id="output-ports-list">
            ${(p ? p.outputPorts : []).map((port, i) => portFormRow(port, 'output', i, portTypes)).join('')}
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="App.hideModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Product'}</button>
        </div>
      </form>
    `, { wide: true });

    const form = document.getElementById('product-form');
    const portTypes2 = portTypes;

    document.getElementById('add-input-port').addEventListener('click', () => {
      const list = document.getElementById('input-ports-list');
      const idx = list.children.length;
      const div = document.createElement('div');
      div.innerHTML = portFormRow({ id: '', name: '', type: 'api', format: '', description: '' }, 'input', idx, portTypes2);
      list.appendChild(div.firstElementChild);
      bindPortRemove(div.firstElementChild);
    });

    document.getElementById('add-output-port').addEventListener('click', () => {
      const list = document.getElementById('output-ports-list');
      const idx = list.children.length;
      const div = document.createElement('div');
      div.innerHTML = portFormRow({ id: '', name: '', type: 'api', format: '', description: '' }, 'output', idx, portTypes2);
      list.appendChild(div.firstElementChild);
      bindPortRemove(div.firstElementChild);
    });

    form.querySelectorAll('.btn-remove-port').forEach(btn => bindPortRemove(btn.closest('.port-form-row')));

    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form);
      const collectPorts = (direction) => {
        const rows = document.querySelectorAll(`#${direction}-ports-list .port-form-row`);
        return Array.from(rows).map((row, i) => ({
          id: row.dataset.portId || `${direction[0]}p-${Date.now()}-${i}`,
          name: row.querySelector('[data-field="name"]').value,
          type: row.querySelector('[data-field="type"]').value,
          format: row.querySelector('[data-field="format"]').value,
          description: row.querySelector('[data-field="description"]').value,
        })).filter(port => port.name);
      };

      const data = {
        name: fd.get('name'),
        domain: fd.get('domain'),
        owner: fd.get('owner'),
        version: fd.get('version'),
        status: fd.get('status'),
        accessTier: fd.get('accessTier'),
        sla: fd.get('sla'),
        updateFrequency: fd.get('updateFrequency'),
        description: fd.get('description'),
        tags: fd.get('tags').split(',').map(t => t.trim()).filter(Boolean),
        inputPorts: collectPorts('input'),
        outputPorts: collectPorts('output'),
      };

      if (isEdit) {
        DataMesh.updateProduct(p.id, data);
        App.notify(`"${data.name}" updated successfully.`, 'success');
      } else {
        DataMesh.addProduct(data);
        App.notify(`"${data.name}" added to catalog.`, 'success');
      }

      App.hideModal();
      const main = document.getElementById('main-content');
      CatalogView.render(main);
    });
  }

  function portFormRow(port, direction, idx, portTypes) {
    const types = portTypes || ['api', 'streaming', 'batch', 'database', 'event'];
    return `
      <div class="port-form-row" data-port-id="${port.id}">
        <input type="text" class="form-input" data-field="name" value="${port.name}" placeholder="Port name">
        <select class="select" data-field="type">
          ${types.map(t => `<option value="${t}" ${port.type === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
        <input type="text" class="form-input" data-field="format" value="${port.format}" placeholder="Format (e.g. JSON)">
        <input type="text" class="form-input" data-field="description" value="${port.description}" placeholder="Description">
        <button type="button" class="btn btn-ghost btn-sm btn-remove-port" title="Remove port">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `;
  }

  function bindPortRemove(rowEl) {
    if (!rowEl) return;
    const btn = rowEl.querySelector('.btn-remove-port');
    if (btn) btn.addEventListener('click', () => rowEl.remove());
  }

  function openDeleteModal(id) {
    const p = DataMesh.getProduct(id);
    if (!p) return;
    const connCount = DataMesh.state.connections.filter(c => c.fromProductId === id || c.toProductId === id).length;
    App.showModal('Delete Data Product', `
      <div class="confirm-dialog">
        <div class="confirm-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <h3>Delete "${p.name}"?</h3>
        <p>This action cannot be undone. The product will be removed from the catalog.</p>
        ${connCount > 0 ? `<p class="warn-text"><strong>Warning:</strong> This product has ${connCount} connection${connCount !== 1 ? 's' : ''} that will also be removed.</p>` : ''}
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="App.hideModal()">Cancel</button>
          <button class="btn btn-danger" id="confirm-delete">Delete</button>
        </div>
      </div>
    `);
    document.getElementById('confirm-delete').addEventListener('click', () => {
      DataMesh.deleteProduct(id);
      App.notify(`"${p.name}" deleted.`, 'info');
      App.hideModal();
      const main = document.getElementById('main-content');
      CatalogView.render(main);
    });
  }

  function bindEvents(container) {
    container.querySelector('#btn-add-product').addEventListener('click', openAddModal);
    container.querySelector('#catalog-search').addEventListener('input', e => {
      searchQuery = e.target.value;
      renderList(container);
    });
    container.querySelector('#filter-domain').addEventListener('change', e => {
      filterDomain = e.target.value;
      renderList(container);
    });
    container.querySelector('#filter-status').addEventListener('change', e => {
      filterStatus = e.target.value;
      renderList(container);
    });
  }

  return { render, _openEdit: openEditModal, openProduct: openDetailsModal };
})();
