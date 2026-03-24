// DataMesh Platform - SID ERD Browser View
const ErdBrowserView = (() => {

  // ── SID entity positions (canvas coords) ───────────────────────────────────
  const NODE_W = 220, NODE_H = 44, CHIP_H = 28, CHIP_PAD = 6;
  const MAX_CHIPS = 5;

  const POSITIONS = {
    CustomerAccount:       { x:  60, y:  80 },
    Individual:            { x:  60, y: 280 },
    PartyInteraction:      { x:  60, y: 480 },
    Agreement:             { x:  60, y: 680 },
    FinancialAccount:      { x:  60, y: 880 },
    Invoice:               { x: 360, y: 880 },
    Payment:               { x: 360, y: 1080 },
    ProductOffering:       { x: 720, y:  80 },
    Promotion:             { x:1020, y:  80 },
    ProductOrder:          { x: 720, y: 340 },
    PolicyCondition:       { x:1020, y: 340 },
    Usage:                 { x: 720, y: 600 },
    TroubleTicket:         { x:1020, y: 600 },
    Event:                 { x: 720, y: 860 },
    Service:               { x:1380, y:  80 },
    ServiceLevelAgreement: { x:1380, y: 340 },
    ServiceProblem:        { x:1380, y: 600 },
    Resource:              { x:1700, y:  80 },
    NetworkElement:        { x:1700, y: 340 },
    ConfigurationItem:     { x:1700, y: 600 },
    WorkOrder:             { x:1700, y: 860 },
  };

  // Domain colour mapping for entity headers
  const ENTITY_DOMAIN = {
    CustomerAccount:       'Subscriber',
    Individual:            'Subscriber',
    PartyInteraction:      'Subscriber',
    Agreement:             'Partner',
    FinancialAccount:      'Finance',
    Invoice:               'Finance',
    Payment:               'Finance',
    ProductOffering:       'Product',
    Promotion:             'Product',
    ProductOrder:          'Product',
    PolicyCondition:       'Operations',
    Usage:                 'Analytics',
    TroubleTicket:         'Operations',
    Event:                 'Analytics',
    Service:               'Service',
    ServiceLevelAgreement: 'Service',
    ServiceProblem:        'Service',
    Resource:              'Network',
    NetworkElement:        'Network',
    ConfigurationItem:     'Network',
    WorkOrder:             'Operations',
  };

  const DOMAIN_COLORS = {
    Subscriber:  '#6366f1',
    Product:     '#8b5cf6',
    Service:     '#06b6d4',
    Network:     '#10b981',
    Analytics:   '#f59e0b',
    Finance:     '#ef4444',
    Partner:     '#ec4899',
    Operations:  '#64748b',
  };

  // 27 SID relationships  [from, to, label, cardinality]
  const EDGES = [
    ['CustomerAccount','Individual','has','1..*'],
    ['CustomerAccount','FinancialAccount','linked to','0..*'],
    ['CustomerAccount','Agreement','holds','0..*'],
    ['CustomerAccount','ProductOrder','places','0..*'],
    ['CustomerAccount','TroubleTicket','raises','0..*'],
    ['CustomerAccount','PartyInteraction','records','0..*'],
    ['Individual','PartyInteraction','participates','0..*'],
    ['ProductOffering','Promotion','associated with','0..*'],
    ['ProductOffering','ProductOrder','ordered via','0..*'],
    ['ProductOffering','PolicyCondition','governed by','0..*'],
    ['ProductOffering','Service','realized by','1..*'],
    ['ProductOrder','Usage','generates','0..*'],
    ['ProductOrder','Invoice','billed on','0..*'],
    ['Invoice','Payment','settled by','0..*'],
    ['Invoice','FinancialAccount','charged to','1'],
    ['Service','ServiceLevelAgreement','governed by','1'],
    ['Service','ServiceProblem','tracked in','0..*'],
    ['Service','Resource','depends on','1..*'],
    ['Service','Usage','generates','0..*'],
    ['ServiceLevelAgreement','Agreement','part of','0..1'],
    ['ServiceProblem','TroubleTicket','linked to','0..*'],
    ['ServiceProblem','WorkOrder','resolved via','0..*'],
    ['Resource','NetworkElement','hosted on','0..*'],
    ['Resource','ConfigurationItem','managed by','1'],
    ['NetworkElement','ConfigurationItem','has config','1'],
    ['Event','TroubleTicket','triggers','0..*'],
    ['WorkOrder','ConfigurationItem','updates','0..*'],
  ];

  // ── State ────────────────────────────────────────────────────────────────────
  let svgEl = null;
  let groupEl = null;      // <g> that pan/zoom transforms
  let selectedEntity = null;
  let filterDomain = '';

  // Pan/zoom state
  let isPanning = false;
  let panStart = { x: 0, y: 0 };
  let translate = { x: 60, y: 60 };
  let scale = 0.65;

  // ── Build entity→products map ─────────────────────────────────────────────
  function buildEntityMap() {
    const map = {}; // entityName → [product, ...]
    DataMesh.state.products.forEach(p => {
      const dm = (typeof TMFDataModels !== 'undefined') ? TMFDataModels.get(p.id) : null;
      const entity = dm ? dm.entity : null;
      if (entity) {
        if (!map[entity]) map[entity] = [];
        map[entity].push(p);
      }
    });
    return map;
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  function render(container) {
    // Reset state
    selectedEntity = null;
    translate = { x: 60, y: 60 };
    scale = 0.65;

    container.innerHTML = `
      <div class="erd-browser-view">
        <div class="view-header" style="padding-bottom:12px">
          <div>
            <h1 class="view-title">SID ERD Browser</h1>
            <p class="view-subtitle">TM Forum Shared Information/Data Model R22 — 21 entities, 27 relationships</p>
          </div>
          <div class="view-actions">
            <select class="select" id="erd-filter-domain">
              <option value="">All Domains</option>
              ${Object.keys(DOMAIN_COLORS).map(d => `<option value="${d}" ${filterDomain===d?'selected':''}>${d}</option>`).join('')}
            </select>
            <button class="btn btn-secondary" id="erd-fit-btn">Fit View</button>
          </div>
        </div>

        <div class="erd-canvas-wrap" id="erd-canvas-wrap">
          <svg id="erd-svg" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="arrow-default" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 Z" fill="#475569"/>
              </marker>
              <marker id="arrow-hl" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 Z" fill="#6366f1"/>
              </marker>
            </defs>
            <g id="erd-root"></g>
          </svg>
        </div>

        <div class="erd-legend" id="erd-legend">
          ${Object.entries(DOMAIN_COLORS).map(([d,c]) => `
            <span class="erd-legend-item">
              <span class="erd-legend-dot" style="background:${c}"></span>${d}
            </span>`).join('')}
        </div>
      </div>
    `;

    svgEl = container.querySelector('#erd-svg');
    groupEl = container.querySelector('#erd-root');

    drawAll();
    bindEvents(container);
    applyTransform();
  }

  function applyTransform() {
    if (groupEl) {
      groupEl.setAttribute('transform', `translate(${translate.x},${translate.y}) scale(${scale})`);
    }
  }

  // ── Draw everything ──────────────────────────────────────────────────────────
  function drawAll() {
    const entityMap = buildEntityMap();
    const activeDomains = new Set(filterDomain ? [filterDomain] : Object.keys(DOMAIN_COLORS));

    // Determine which entities to show
    const visibleEntities = Object.keys(POSITIONS).filter(e =>
      !filterDomain || ENTITY_DOMAIN[e] === filterDomain
    );
    const visibleSet = new Set(visibleEntities);

    // Domain background regions
    const domainRegions = computeDomainRegions(visibleSet);

    let html = '';

    // Domain background rects
    Object.entries(domainRegions).forEach(([domain, bounds]) => {
      const color = DOMAIN_COLORS[domain] || '#64748b';
      const pad = 24;
      html += `<rect
        x="${bounds.x - pad}" y="${bounds.y - pad}"
        width="${bounds.w + pad*2}" height="${bounds.h + pad*2}"
        rx="16"
        fill="${color}11"
        stroke="${color}44"
        stroke-width="1.5"
        stroke-dasharray="6 4"
        class="erd-domain-region"
        data-domain="${domain}"
      />
      <text x="${bounds.x - pad + 10}" y="${bounds.y - pad + 18}"
        font-size="11" fill="${color}" opacity="0.8" font-weight="600"
        font-family="Inter, sans-serif"
      >${domain}</text>`;
    });

    // Edges
    EDGES.forEach(([from, to, label, card]) => {
      if (!visibleSet.has(from) || !visibleSet.has(to)) return;
      const pf = POSITIONS[from];
      const pt = POSITIONS[to];
      const x1 = pf.x + NODE_W;
      const y1 = pf.y + NODE_H / 2;
      const x2 = pt.x;
      const y2 = pt.y + NODE_H / 2;

      // Simple bezier
      const mx = (x1 + x2) / 2;
      const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
      const isDashed = card.startsWith('0..*');
      const edgeId = `edge-${from}-${to}`.replace(/\s/g,'_');

      html += `<g class="erd-edge" id="${edgeId}" data-from="${from}" data-to="${to}">
        <path d="${d}"
          fill="none"
          stroke="#475569"
          stroke-width="1.5"
          ${isDashed ? 'stroke-dasharray="5 3"' : ''}
          marker-end="url(#arrow-default)"
          class="erd-edge-path"
        />
        <text font-size="9" fill="#94a3b8" font-family="Inter,sans-serif" text-anchor="middle">
          <textPath href="#${edgeId}-path" startOffset="50%">${label}</textPath>
        </text>
      </g>`;
    });

    // Entity nodes
    Object.keys(POSITIONS).forEach(entity => {
      if (!visibleSet.has(entity)) return;
      const { x, y } = POSITIONS[entity];
      const domain = ENTITY_DOMAIN[entity] || 'Operations';
      const color = DOMAIN_COLORS[domain] || '#64748b';
      const products = entityMap[entity] || [];
      const shown = products.slice(0, MAX_CHIPS);
      const extra = products.length - shown.length;

      // Node height = header + chips
      const chipRows = shown.length;
      const nodeH = NODE_H + chipRows * (CHIP_H + CHIP_PAD) + (chipRows > 0 ? CHIP_PAD : 0) + (extra > 0 ? CHIP_H + CHIP_PAD : 0);

      const entitySlug = entity.replace(/\s/g, '_');
      html += `<g class="erd-node" id="node-${entitySlug}" data-entity="${entity}" style="cursor:pointer">
        <!-- Node shadow -->
        <rect x="${x+2}" y="${y+2}" width="${NODE_W}" height="${nodeH}" rx="10" fill="#00000033"/>
        <!-- Node body -->
        <rect x="${x}" y="${y}" width="${NODE_W}" height="${nodeH}" rx="10" fill="#1e293b" stroke="${color}" stroke-width="2" class="erd-node-body"/>
        <!-- Header -->
        <rect x="${x}" y="${y}" width="${NODE_W}" height="${NODE_H}" rx="10" fill="${color}"/>
        <rect x="${x}" y="${y + NODE_H - 10}" width="${NODE_W}" height="10" fill="${color}"/>
        <!-- Entity name -->
        <text x="${x + NODE_W/2}" y="${y + 27}"
          font-size="12" font-weight="700" fill="white"
          text-anchor="middle" font-family="Inter,sans-serif"
          class="erd-node-title"
        >${entity}</text>
        <!-- SID label -->
        <text x="${x + NODE_W - 8}" y="${y + 15}"
          font-size="8" fill="rgba(255,255,255,0.7)"
          text-anchor="end" font-family="Inter,sans-serif"
        >«SID entity»</text>`;

      // Product chips
      shown.forEach((p, i) => {
        const cy = y + NODE_H + CHIP_PAD + i * (CHIP_H + CHIP_PAD);
        const chipLabel = p.name.length > 22 ? p.name.slice(0, 21) + '…' : p.name;
        const chipColor = DOMAIN_COLORS[p.domain] || '#6366f1';
        html += `<g class="erd-chip" data-product-id="${p.id}" style="cursor:pointer">
          <rect x="${x + 8}" y="${cy}" width="${NODE_W - 16}" height="${CHIP_H}" rx="6"
            fill="${chipColor}22" stroke="${chipColor}77" stroke-width="1"/>
          <circle cx="${x + 20}" cy="${cy + CHIP_H/2}" r="4" fill="${chipColor}"/>
          <text x="${x + 30}" y="${cy + CHIP_H/2 + 4}"
            font-size="10" fill="#cbd5e1" font-family="Inter,sans-serif"
          >${chipLabel}</text>
        </g>`;
      });

      if (extra > 0) {
        const cy = y + NODE_H + CHIP_PAD + shown.length * (CHIP_H + CHIP_PAD);
        html += `<text x="${x + NODE_W/2}" y="${cy + 18}"
          font-size="10" fill="#64748b" text-anchor="middle" font-family="Inter,sans-serif"
        >+${extra} more</text>`;
      }

      html += `</g>`;
    });

    groupEl.innerHTML = html;
  }

  // ── Domain bounding regions ──────────────────────────────────────────────────
  function computeDomainRegions(visibleSet) {
    const regions = {};
    Object.entries(POSITIONS).forEach(([entity, pos]) => {
      if (!visibleSet.has(entity)) return;
      const domain = ENTITY_DOMAIN[entity];
      if (!regions[domain]) {
        regions[domain] = { x: pos.x, y: pos.y, x2: pos.x + NODE_W, y2: pos.y + NODE_H };
      } else {
        const r = regions[domain];
        r.x = Math.min(r.x, pos.x);
        r.y = Math.min(r.y, pos.y);
        r.x2 = Math.max(r.x2, pos.x + NODE_W);
        r.y2 = Math.max(r.y2, pos.y + 200); // include chip area
      }
    });
    const out = {};
    Object.entries(regions).forEach(([d, r]) => {
      out[d] = { x: r.x, y: r.y, w: r.x2 - r.x, h: r.y2 - r.y };
    });
    return out;
  }

  // ── Highlight / dim ──────────────────────────────────────────────────────────
  function applySelection(entity) {
    if (!groupEl) return;
    selectedEntity = entity;

    // Connected entities via edges
    const connected = new Set();
    const connectedEdges = new Set();
    if (entity) {
      EDGES.forEach(([from, to]) => {
        if (from === entity || to === entity) {
          connected.add(from);
          connected.add(to);
          connectedEdges.add(`${from}-${to}`);
        }
      });
    }

    // Nodes
    groupEl.querySelectorAll('.erd-node').forEach(node => {
      const e = node.dataset.entity;
      if (!entity) {
        node.classList.remove('erd-selected', 'erd-connected', 'erd-dimmed');
      } else if (e === entity) {
        node.classList.add('erd-selected');
        node.classList.remove('erd-connected', 'erd-dimmed');
      } else if (connected.has(e)) {
        node.classList.add('erd-connected');
        node.classList.remove('erd-selected', 'erd-dimmed');
      } else {
        node.classList.add('erd-dimmed');
        node.classList.remove('erd-selected', 'erd-connected');
      }
    });

    // Edges
    groupEl.querySelectorAll('.erd-edge').forEach(edge => {
      const key = `${edge.dataset.from}-${edge.dataset.to}`;
      const path = edge.querySelector('.erd-edge-path');
      if (!entity) {
        edge.classList.remove('erd-edge-hl', 'erd-edge-dim');
        if (path) { path.setAttribute('stroke', '#475569'); path.setAttribute('marker-end', 'url(#arrow-default)'); }
      } else if (connectedEdges.has(key)) {
        edge.classList.add('erd-edge-hl');
        edge.classList.remove('erd-edge-dim');
        if (path) { path.setAttribute('stroke', '#6366f1'); path.setAttribute('marker-end', 'url(#arrow-hl)'); }
      } else {
        edge.classList.add('erd-edge-dim');
        edge.classList.remove('erd-edge-hl');
        if (path) { path.setAttribute('stroke', '#1e293b'); path.setAttribute('marker-end', 'url(#arrow-default)'); }
      }
    });
  }

  // ── Fit view ─────────────────────────────────────────────────────────────────
  function fitView() {
    const wrap = document.getElementById('erd-canvas-wrap');
    if (!wrap || !svgEl) return;
    const ww = wrap.clientWidth;
    const wh = wrap.clientHeight;

    // Compute bounds of all visible nodes
    const visibleEntities = Object.keys(POSITIONS).filter(e =>
      !filterDomain || ENTITY_DOMAIN[e] === filterDomain
    );
    if (!visibleEntities.length) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    visibleEntities.forEach(e => {
      const { x, y } = POSITIONS[e];
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + NODE_W);
      maxY = Math.max(maxY, y + 300); // account for chips
    });

    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const pad = 60;
    scale = Math.min((ww - pad*2) / contentW, (wh - pad*2) / contentH, 1.2);
    translate.x = (ww - contentW * scale) / 2 - minX * scale;
    translate.y = (wh - contentH * scale) / 2 - minY * scale;
    applyTransform();
  }

  // ── Events ───────────────────────────────────────────────────────────────────
  function bindEvents(container) {
    // Domain filter
    container.querySelector('#erd-filter-domain').addEventListener('change', e => {
      filterDomain = e.target.value;
      selectedEntity = null;
      drawAll();
      bindCanvasEvents();
      fitView();
    });

    // Fit button
    container.querySelector('#erd-fit-btn').addEventListener('click', fitView);

    bindCanvasEvents();

    // Initial fit after brief layout settle
    setTimeout(fitView, 50);
  }

  function bindCanvasEvents() {
    if (!svgEl) return;

    // Remove old listeners by cloning
    const newSvg = svgEl.cloneNode(true);
    svgEl.parentNode.replaceChild(newSvg, svgEl);
    svgEl = newSvg;
    groupEl = svgEl.querySelector('#erd-root');

    // Pan
    svgEl.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      // Don't pan if clicking a node/chip
      if (e.target.closest('.erd-node') || e.target.closest('.erd-chip')) return;
      isPanning = true;
      panStart = { x: e.clientX - translate.x, y: e.clientY - translate.y };
      svgEl.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Zoom
    svgEl.addEventListener('wheel', e => {
      e.preventDefault();
      const rect = svgEl.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const delta = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.max(0.15, Math.min(3, scale * delta));
      translate.x = mx - (mx - translate.x) * (newScale / scale);
      translate.y = my - (my - translate.y) * (newScale / scale);
      scale = newScale;
      applyTransform();
    }, { passive: false });

    // Click delegation
    svgEl.addEventListener('click', e => {
      // Chip click → open product detail
      const chip = e.target.closest('.erd-chip');
      if (chip) {
        const pid = chip.dataset.productId;
        if (pid && typeof CatalogView !== 'undefined' && CatalogView.openProduct) {
          CatalogView.openProduct(pid);
        }
        return;
      }

      // Node click → select / deselect
      const node = e.target.closest('.erd-node');
      if (node) {
        const entity = node.dataset.entity;
        applySelection(entity === selectedEntity ? null : entity);
        return;
      }

      // Click on canvas → deselect
      if (e.target === svgEl || e.target.closest('.erd-domain-region')) {
        applySelection(null);
      }
    });
  }

  function onMouseMove(e) {
    if (!isPanning) return;
    translate.x = e.clientX - panStart.x;
    translate.y = e.clientY - panStart.y;
    applyTransform();
  }

  function onMouseUp() {
    if (isPanning) {
      isPanning = false;
      if (svgEl) svgEl.style.cursor = 'grab';
    }
  }

  return { render };
})();
