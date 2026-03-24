// DataMesh Platform — Domain View (list + interactive graph)
const DomainsView = (() => {

  let mode          = 'list';   // 'list' | 'graph'
  let svg, contentGroup;
  let transform     = { x: 0, y: 0, scale: 1 };
  let isPanning     = false, panStart = { x: 0, y: 0 };
  let isDragging    = false, dragDomain = null, dragOffset = { x: 0, y: 0 };
  let selectedDomain = null;
  let domainPositions = {};     // { name: {x,y} } — persists across navigations
  let _domainData    = null;    // kept for re-renders during drag
  let _container     = null;
  let _tooltip       = null;

  const NODE_R = 58;            // domain node radius

  // ─── Data helpers ────────────────────────────────────────────

  function computeDomainData() {
    const domains = {};
    DataMesh.state.products.forEach(p => {
      if (!domains[p.domain]) {
        domains[p.domain] = {
          name: p.domain,
          color: DataMesh.getDomainColor(p.domain),
          products: [],
          outEdges: {},   // toDomain → count
          inEdges:  {},   // fromDomain → count
          internalEdges: 0,
        };
      }
      domains[p.domain].products.push(p);
    });
    DataMesh.state.connections.forEach(c => {
      const fp = DataMesh.getProduct(c.fromProductId);
      const tp = DataMesh.getProduct(c.toProductId);
      if (!fp || !tp) return;
      if (fp.domain === tp.domain) {
        domains[fp.domain].internalEdges++;
      } else {
        domains[fp.domain].outEdges[tp.domain] = (domains[fp.domain].outEdges[tp.domain] || 0) + 1;
        domains[tp.domain].inEdges[fp.domain]  = (domains[tp.domain].inEdges[fp.domain]  || 0) + 1;
      }
    });
    return domains;
  }

  function getInterDomainEdges() {
    const edges = {};
    DataMesh.state.connections.forEach(c => {
      const fp = DataMesh.getProduct(c.fromProductId);
      const tp = DataMesh.getProduct(c.toProductId);
      if (!fp || !tp || fp.domain === tp.domain) return;
      const key = fp.domain + '|' + tp.domain;
      if (!edges[key]) edges[key] = { from: fp.domain, to: tp.domain, count: 0, products: [] };
      edges[key].count++;
      edges[key].products.push({ from: fp.name, to: tp.name });
    });
    return edges;
  }

  // ─── Main entry ──────────────────────────────────────────────

  function render(container) {
    _container = container;
    _domainData = computeDomainData();
    if (mode === 'list') renderListView(container, _domainData);
    else                 renderGraphView(container, _domainData);
  }

  function switchMode(newMode, container, domainData) {
    mode = newMode;
    if (mode === 'list') renderListView(container, domainData);
    else                 renderGraphView(container, domainData);
  }

  // ─── Toggle HTML ─────────────────────────────────────────────

  function modeToggleHTML() {
    return `
      <div class="toggle-group" id="dv-mode-toggle">
        <button class="toggle-btn ${mode === 'list' ? 'active' : ''}" data-mode="list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          List
        </button>
        <button class="toggle-btn ${mode === 'graph' ? 'active' : ''}" data-mode="graph">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Graph
        </button>
      </div>
    `;
  }

  function bindToggle(container, domainData) {
    const tog = document.getElementById('dv-mode-toggle');
    if (!tog) return;
    tog.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => switchMode(btn.dataset.mode, container, domainData));
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  LIST VIEW
  // ═══════════════════════════════════════════════════════════

  function renderListView(container, domainData) {
    const domains      = Object.values(domainData);
    const crossDomConn = domains.reduce((s, d) =>
      s + Object.values(d.outEdges).reduce((a, v) => a + v, 0), 0);
    const mostConn = [...domains].sort((a, b) => {
      const score = d => Object.values(d.outEdges).reduce((s,v)=>s+v,0) + Object.values(d.inEdges).reduce((s,v)=>s+v,0);
      return score(b) - score(a);
    })[0];

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="view-title">Domain Overview</h1>
          <p class="view-subtitle">${domains.length} domains · ${DataMesh.state.products.length} data products · ${DataMesh.state.connections.length} connections</p>
        </div>
        <div class="view-actions">
          ${modeToggleHTML()}
        </div>
      </div>

      <div class="domain-list-wrap">
        <div class="domain-summary-bar">
          ${summaryStatHTML(domains.length,      'Domains')}
          ${summaryStatHTML(DataMesh.state.products.length, 'Data Products')}
          ${summaryStatHTML(DataMesh.state.connections.length, 'Total Connections')}
          ${summaryStatHTML(crossDomConn,        'Cross-domain Links')}
          <div class="summary-stat">
            <span class="summary-stat-value" style="color:${mostConn.color}">${mostConn.name}</span>
            <span class="summary-stat-label">Most Connected</span>
          </div>
        </div>

        <div class="domain-cards-grid">
          ${domains.map(d => domainCardHTML(d)).join('')}
        </div>
      </div>
    `;

    bindToggle(container, domainData);
  }

  function summaryStatHTML(value, label) {
    return `
      <div class="summary-stat">
        <span class="summary-stat-value">${value}</span>
        <span class="summary-stat-label">${label}</span>
      </div>
    `;
  }

  function domainCardHTML(d) {
    const active     = d.products.filter(p => p.status === 'active').length;
    const draft      = d.products.filter(p => p.status === 'draft').length;
    const deprecated = d.products.filter(p => p.status === 'deprecated').length;
    const sendsTo    = Object.entries(d.outEdges).sort((a, b) => b[1] - a[1]);
    const recvFrom   = Object.entries(d.inEdges).sort((a, b) => b[1] - a[1]);
    const outTotal   = sendsTo.reduce((s, [, v]) => s + v, 0);
    const inTotal    = recvFrom.reduce((s, [, v]) => s + v, 0);

    return `
      <div class="domain-card">
        <div class="domain-card-top" style="background:linear-gradient(135deg,${d.color}18,${d.color}05); border-top: 3px solid ${d.color}">
          <div class="domain-card-heading">
            <div class="domain-card-name">
              <span class="domain-initial" style="background:${d.color}22; border:2px solid ${d.color}; color:${d.color}">${d.name[0]}</span>
              <span style="color:${d.color}; font-weight:700; font-size:16px">${d.name}</span>
            </div>
            <div class="domain-card-pills">
              ${active     ? `<span class="badge badge--success">${active} active</span>`     : ''}
              ${draft      ? `<span class="badge badge--warning">${draft} draft</span>`       : ''}
              ${deprecated ? `<span class="badge badge--danger">${deprecated} depr.</span>`  : ''}
            </div>
          </div>

          <div class="domain-conn-summary">
            <span class="domain-conn-badge" title="Outbound connections">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              ${outTotal} out
            </span>
            <span class="domain-conn-badge" title="Inbound connections">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              ${inTotal} in
            </span>
            ${d.internalEdges ? `<span class="domain-conn-badge" title="Internal connections">⟳ ${d.internalEdges} internal</span>` : ''}
          </div>
        </div>

        <div class="domain-card-body">
          <div class="domain-product-list">
            ${d.products.map(p => `
              <div class="domain-product-row">
                <span class="domain-product-status" style="background:${p.status === 'active' ? '#22c55e' : p.status === 'draft' ? '#f59e0b' : '#ef4444'}"></span>
                <span class="domain-product-name">${p.name}</span>
                <span class="text-muted" style="font-size:10px; flex-shrink:0">v${p.version}</span>
              </div>
            `).join('')}
          </div>

          ${sendsTo.length || recvFrom.length ? `<div class="domain-flow-section">` : ''}
          ${sendsTo.length ? `
            <div class="domain-flow-row">
              <span class="domain-flow-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                Sends to
              </span>
              <div class="domain-flow-chips">
                ${sendsTo.map(([dom, cnt]) => `
                  <span class="domain-flow-chip" style="border-color:${DataMesh.getDomainColor(dom)};color:${DataMesh.getDomainColor(dom)}">
                    ${dom} <span class="flow-chip-count">${cnt}</span>
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          ${recvFrom.length ? `
            <div class="domain-flow-row">
              <span class="domain-flow-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Receives from
              </span>
              <div class="domain-flow-chips">
                ${recvFrom.map(([dom, cnt]) => `
                  <span class="domain-flow-chip" style="border-color:${DataMesh.getDomainColor(dom)};color:${DataMesh.getDomainColor(dom)}">
                    ${dom} <span class="flow-chip-count">${cnt}</span>
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          ${sendsTo.length || recvFrom.length ? `</div>` : ''}
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════
  //  GRAPH VIEW
  // ═══════════════════════════════════════════════════════════

  function renderGraphView(container, domainData) {
    container.innerHTML = `
      <div class="graph-view">
        <div class="graph-toolbar">
          <div class="graph-toolbar-left">
            <h1 class="view-title" style="margin:0">Domain Graph</h1>
            <span class="text-muted" style="font-size:13px">
              ${Object.keys(domainData).length} domains · ${Object.keys(getInterDomainEdges()).length} inter-domain links
            </span>
          </div>
          <div class="graph-controls">
            ${modeToggleHTML()}
            <div style="width:1px;height:20px;background:var(--color-border);margin:0 4px"></div>
            <button class="btn btn-ghost btn-sm" id="dg-fit" title="Fit to screen">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
              </svg>
              Fit
            </button>
            <button class="btn btn-ghost btn-sm" id="dg-zoom-in" title="Zoom in">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>
            <button class="btn btn-ghost btn-sm" id="dg-zoom-out" title="Zoom out">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>
            <span class="graph-zoom-label" id="dg-zoom-label">100%</span>
          </div>
        </div>

        <div class="graph-container" id="dg-container">
          <svg id="domain-svg" style="width:100%;height:100%">
            <defs>
              <marker id="dom-arrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 9 3.5, 0 7" fill="#475569"/>
              </marker>
              <marker id="dom-arrow-hi" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 9 3.5, 0 7" fill="#94a3b8"/>
              </marker>
              <filter id="dom-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000" flood-opacity="0.45"/>
              </filter>
              <filter id="dom-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="14" flood-color="#3b82f6" flood-opacity="0.55"/>
              </filter>
            </defs>
            <rect id="dg-bg" width="100%" height="100%" fill="transparent"/>
            <g id="dg-content"></g>
          </svg>

          <div class="graph-detail-panel" id="dg-detail" style="display:none"></div>
        </div>

        <div class="graph-hint">Drag nodes to reposition · Scroll to zoom · Drag background to pan · Click domain to inspect</div>
      </div>
    `;

    svg          = document.getElementById('domain-svg');
    contentGroup = document.getElementById('dg-content');
    selectedDomain = null;

    initDomainPositions(domainData);
    drawDomainGraph(domainData);
    fitDomainView();
    initDomainInteraction(domainData);

    bindToggle(container, domainData);
    document.getElementById('dg-fit').addEventListener('click', fitDomainView);
    document.getElementById('dg-zoom-in').addEventListener('click',  () => zoomDomain(1.2));
    document.getElementById('dg-zoom-out').addEventListener('click', () => zoomDomain(0.85));
  }

  // ─── Circular layout ─────────────────────────────────────────

  function initDomainPositions(domainData) {
    const names = Object.keys(domainData);
    const n  = names.length;
    const cx = 540, cy = 400, radius = 270;
    names.forEach((name, i) => {
      if (!domainPositions[name]) {
        const angle = (2 * Math.PI / n) * i - Math.PI / 2;
        domainPositions[name] = {
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        };
      }
    });
  }

  // ─── Full graph render ────────────────────────────────────────

  function drawDomainGraph(domainData) {
    contentGroup.innerHTML = '';

    const edges = getInterDomainEdges();

    const edgeGroup = svgEl('g', { id: 'dg-edges' });
    const nodeGroup = svgEl('g', { id: 'dg-nodes' });
    contentGroup.appendChild(edgeGroup);
    contentGroup.appendChild(nodeGroup);

    Object.values(edges).forEach(e  => edgeGroup.appendChild(buildEdge(e, domainData)));
    Object.values(domainData).forEach(d => nodeGroup.appendChild(buildNode(d)));

    updateDomainTransform();
  }

  function redrawEdges(domainData) {
    const eg = document.getElementById('dg-edges');
    if (!eg) return;
    eg.innerHTML = '';
    const edges = getInterDomainEdges();
    Object.values(edges).forEach(e => eg.appendChild(buildEdge(e, domainData)));
  }

  // ─── Node ─────────────────────────────────────────────────────

  function buildNode(d) {
    const pos = domainPositions[d.name];
    if (!pos) return svgEl('g', {});

    const isSelected  = selectedDomain === d.name;
    const totalConns  = Object.values(d.outEdges).reduce((s, v) => s + v, 0) +
                        Object.values(d.inEdges).reduce((s, v)  => s + v, 0);

    const g = svgEl('g', {
      transform: `translate(${pos.x},${pos.y})`,
      'data-domain': d.name,
      class: 'dg-node',
      style: 'cursor:grab',
    });

    // Outer pulse ring when selected
    if (isSelected) {
      g.appendChild(svgEl('circle', {
        cx: 0, cy: 0, r: NODE_R + 14,
        fill: 'none', stroke: d.color, 'stroke-width': '2', opacity: '0.25',
      }));
      g.appendChild(svgEl('circle', {
        cx: 0, cy: 0, r: NODE_R + 8,
        fill: 'none', stroke: d.color, 'stroke-width': '1.5', opacity: '0.4',
      }));
    }

    // Shadow/glow base
    const base = svgEl('circle', {
      cx: 0, cy: 0, r: NODE_R,
      fill: '#0f172a',
      filter: isSelected ? 'url(#dom-glow)' : 'url(#dom-shadow)',
    });
    g.appendChild(base);

    // Filled ring background
    const bg = svgEl('circle', {
      cx: 0, cy: 0, r: NODE_R,
      fill: d.color + (isSelected ? '30' : '1a'),
      stroke: d.color,
      'stroke-width': isSelected ? '3' : '2',
    });
    g.appendChild(bg);

    // Dashed inner ring
    g.appendChild(svgEl('circle', {
      cx: 0, cy: 0, r: NODE_R - 14,
      fill: 'none', stroke: d.color + '50', 'stroke-width': '1', 'stroke-dasharray': '4 3',
    }));

    // Big initial letter
    const letter = svgEl('text', {
      x: 0, y: -6, 'text-anchor': 'middle',
      fill: d.color, 'font-size': '26', 'font-weight': '800', 'font-family': 'inherit',
    });
    letter.textContent = d.name[0].toUpperCase();
    g.appendChild(letter);

    // Product count
    const ct = svgEl('text', {
      x: 0, y: 12, 'text-anchor': 'middle',
      fill: d.color, 'font-size': '10', 'font-weight': '600',
    });
    ct.textContent = `${d.products.length} product${d.products.length !== 1 ? 's' : ''}`;
    g.appendChild(ct);

    // Domain name below
    const label = svgEl('text', {
      x: 0, y: NODE_R + 22, 'text-anchor': 'middle',
      fill: '#f1f5f9', 'font-size': '13', 'font-weight': '700', 'font-family': 'inherit',
    });
    label.textContent = d.name;
    g.appendChild(label);

    // Connection count badge (top-right)
    if (totalConns > 0) {
      g.appendChild(svgEl('circle', { cx: NODE_R - 6, cy: -(NODE_R - 6), r: 13, fill: d.color }));
      const bt = svgEl('text', {
        x: NODE_R - 6, y: -(NODE_R - 10), 'text-anchor': 'middle',
        fill: '#fff', 'font-size': '9', 'font-weight': '700',
      });
      bt.textContent = totalConns;
      g.appendChild(bt);
    }

    // Interactions
    g.addEventListener('mousedown', e => startDomainDrag(e, d.name));
    g.addEventListener('click', e => {
      if (!isDragging) selectDomain(d.name);
      e.stopPropagation();
    });
    g.addEventListener('mouseenter', () => {
      bg.setAttribute('fill', d.color + '33');
      bg.setAttribute('stroke-width', '2.5');
    });
    g.addEventListener('mouseleave', () => {
      if (selectedDomain !== d.name) {
        bg.setAttribute('fill', d.color + '1a');
        bg.setAttribute('stroke-width', '2');
      }
    });

    return g;
  }

  // ─── Edge ─────────────────────────────────────────────────────

  function buildEdge(edge, domainData) {
    const fromPos = domainPositions[edge.from];
    const toPos   = domainPositions[edge.to];
    if (!fromPos || !toPos) return svgEl('g', {});

    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len, uy = dy / len;

    const gap = NODE_R + 8;
    const sx  = fromPos.x + ux * gap,  sy = fromPos.y + uy * gap;
    const ex  = toPos.x   - ux * gap,  ey = toPos.y   - uy * gap;

    // Perpendicular (curve right of travel)
    const px = -uy, py = ux;
    const curv = len * 0.20;
    const cpx  = (sx + ex) / 2 + px * curv;
    const cpy  = (sy + ey) / 2 + py * curv;

    const pathD = `M${sx},${sy} Q${cpx},${cpy} ${ex},${ey}`;
    const sw    = 1.5 + Math.min(edge.count - 1, 4) * 0.8;

    // Highlight if selected domain is on either end
    const isHighlighted = selectedDomain &&
      (edge.from === selectedDomain || edge.to === selectedDomain);
    const strokeColor  = isHighlighted ? DataMesh.getDomainColor(edge.from) : '#334155';
    const strokeOpacity = isHighlighted ? '1' : '0.7';

    const g = svgEl('g', {
      class: 'dg-edge',
      'data-from': edge.from,
      'data-to': edge.to,
    });

    // Hit area
    g.appendChild(svgEl('path', {
      d: pathD, fill: 'none', stroke: 'transparent', 'stroke-width': '18',
    }));

    // Visible path
    const path = svgEl('path', {
      d: pathD, fill: 'none',
      stroke: strokeColor,
      'stroke-width': sw,
      'stroke-opacity': strokeOpacity,
      'marker-end': 'url(#dom-arrow)',
      class: 'dg-edge-path',
    });
    g.appendChild(path);

    // Count badge at curve mid-point
    const labelT = 0.55;
    const midX = (1-labelT)*(1-labelT)*sx + 2*(1-labelT)*labelT*cpx + labelT*labelT*ex;
    const midY = (1-labelT)*(1-labelT)*sy + 2*(1-labelT)*labelT*cpy + labelT*labelT*ey;

    g.appendChild(svgEl('circle', { cx: midX, cy: midY, r: 10, fill: '#1e293b', stroke: '#334155', 'stroke-width': '1' }));
    const lt = svgEl('text', {
      x: midX, y: midY + 4, 'text-anchor': 'middle',
      fill: '#94a3b8', 'font-size': '9', 'font-weight': '700',
    });
    lt.textContent = edge.count;
    g.appendChild(lt);

    // Hover
    g.addEventListener('mouseenter', e => {
      path.setAttribute('stroke', '#94a3b8');
      path.setAttribute('stroke-width', sw + 2);
      path.setAttribute('stroke-opacity', '1');
      path.setAttribute('marker-end', 'url(#dom-arrow-hi)');
      showEdgeTooltip(edge, e);
    });
    g.addEventListener('mouseleave', () => {
      path.setAttribute('stroke', strokeColor);
      path.setAttribute('stroke-width', sw);
      path.setAttribute('stroke-opacity', strokeOpacity);
      path.setAttribute('marker-end', 'url(#dom-arrow)');
      removeTooltip();
    });

    return g;
  }

  // ─── Selection / detail panel ────────────────────────────────

  function selectDomain(name) {
    selectedDomain = name;
    if (_domainData) drawDomainGraph(_domainData);

    const panel = document.getElementById('dg-detail');
    if (!panel) return;
    if (!name) { panel.style.display = 'none'; return; }

    const d = _domainData && _domainData[name];
    if (!d) return;

    const sendsTo  = Object.entries(d.outEdges).sort((a, b) => b[1] - a[1]);
    const recvFrom = Object.entries(d.inEdges).sort((a, b) => b[1] - a[1]);

    panel.style.display = 'block';
    panel.innerHTML = `
      <div class="detail-panel-header" style="border-left:4px solid ${d.color}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-size:20px;font-weight:800;color:${d.color};margin-bottom:4px">${d.name}</div>
            <div style="font-size:12px;color:var(--color-text-secondary)">${d.products.length} data products</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="DomainsView._deselect()">✕</button>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
          ${d.products.filter(p=>p.status==='active').length ? `<span class="badge badge--success">${d.products.filter(p=>p.status==='active').length} active</span>` : ''}
          ${d.products.filter(p=>p.status==='draft').length  ? `<span class="badge badge--warning">${d.products.filter(p=>p.status==='draft').length} draft</span>`    : ''}
          ${d.internalEdges ? `<span class="badge badge--neutral">⟳ ${d.internalEdges} internal</span>` : ''}
        </div>
      </div>
      <div class="detail-panel-body">
        <div class="detail-mini-section">
          <div class="detail-mini-title">Products in this domain</div>
          ${d.products.map(p => `
            <div class="conn-mini-item">
              <span class="legend-dot" style="background:${p.status==='active'?'#22c55e':p.status==='draft'?'#f59e0b':'#ef4444'}"></span>
              <span>${p.name}</span>
              <span class="text-muted" style="margin-left:auto;font-size:10px">v${p.version}</span>
            </div>
          `).join('')}
        </div>
        ${sendsTo.length ? `
          <div class="detail-mini-section">
            <div class="detail-mini-title">Sends data to</div>
            ${sendsTo.map(([dom, cnt]) => `
              <div class="conn-mini-item" onclick="DomainsView._selectDomain('${dom}')">
                <span class="legend-dot" style="background:${DataMesh.getDomainColor(dom)}"></span>
                <span>${dom}</span>
                <span class="text-muted" style="margin-left:auto;font-size:11px">${cnt} link${cnt!==1?'s':''}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${recvFrom.length ? `
          <div class="detail-mini-section">
            <div class="detail-mini-title">Receives from</div>
            ${recvFrom.map(([dom, cnt]) => `
              <div class="conn-mini-item" onclick="DomainsView._selectDomain('${dom}')">
                <span class="legend-dot" style="background:${DataMesh.getDomainColor(dom)}"></span>
                <span>${dom}</span>
                <span class="text-muted" style="margin-left:auto;font-size:11px">${cnt} link${cnt!==1?'s':''}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px">
          <button class="btn btn-primary btn-sm" onclick="location.hash='#/catalog'" style="width:100%">View in Catalog</button>
          <button class="btn btn-ghost btn-sm" onclick="location.hash='#/graph'" style="width:100%">Open Product Graph</button>
        </div>
      </div>
    `;
  }

  // ─── Pan / zoom / drag ────────────────────────────────────────

  function initDomainInteraction(domainData) {
    const bg = document.getElementById('dg-bg');

    bg.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      isPanning = true;
      panStart  = { x: e.clientX - transform.x, y: e.clientY - transform.y };
      svg.style.cursor = 'grabbing';
    });
    bg.addEventListener('click', e => { if (!isDragging) selectDomain(null); });

    svg.addEventListener('wheel', e => {
      e.preventDefault();
      const rect  = svg.getBoundingClientRect();
      const delta = e.deltaY < 0 ? 1.12 : 0.88;
      const mx    = (e.clientX - rect.left - transform.x) / transform.scale;
      const my    = (e.clientY - rect.top  - transform.y) / transform.scale;
      transform.scale = Math.min(3, Math.max(0.1, transform.scale * delta));
      transform.x = e.clientX - rect.left - mx * transform.scale;
      transform.y = e.clientY - rect.top  - my * transform.scale;
      updateDomainTransform();
    }, { passive: false });
  }

  // Global move/up — checked for svg alive
  document.addEventListener('mousemove', e => {
    if (!svg || !document.body.contains(svg)) { isPanning = false; isDragging = false; return; }
    if (isPanning) {
      transform.x = e.clientX - panStart.x;
      transform.y = e.clientY - panStart.y;
      updateDomainTransform();
    }
    if (isDragging && dragDomain) {
      const pt = screenToSVG(e);
      domainPositions[dragDomain].x = pt.x - dragOffset.x;
      domainPositions[dragDomain].y = pt.y - dragOffset.y;
      const el = contentGroup && contentGroup.querySelector(`[data-domain="${dragDomain}"]`);
      if (el) el.setAttribute('transform', `translate(${domainPositions[dragDomain].x},${domainPositions[dragDomain].y})`);
      if (_domainData) redrawEdges(_domainData);
    }
  });

  document.addEventListener('mouseup', () => {
    isPanning  = false;
    isDragging = false;
    dragDomain = null;
    if (svg && document.body.contains(svg)) svg.style.cursor = 'default';
  });

  function startDomainDrag(e, name) {
    if (e.button !== 0) return;
    e.stopPropagation();
    isDragging = true;
    dragDomain = name;
    const pt   = screenToSVG(e);
    dragOffset = { x: pt.x - domainPositions[name].x, y: pt.y - domainPositions[name].y };
    svg.style.cursor = 'grabbing';
  }

  function screenToSVG(e) {
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - transform.x) / transform.scale,
      y: (e.clientY - rect.top  - transform.y) / transform.scale,
    };
  }

  function updateDomainTransform() {
    contentGroup.setAttribute('transform', `translate(${transform.x},${transform.y}) scale(${transform.scale})`);
    const lbl = document.getElementById('dg-zoom-label');
    if (lbl) lbl.textContent = Math.round(transform.scale * 100) + '%';
  }

  function zoomDomain(factor) {
    const rect = svg.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const mx = (cx - transform.x) / transform.scale;
    const my = (cy - transform.y) / transform.scale;
    transform.scale = Math.min(3, Math.max(0.1, transform.scale * factor));
    transform.x = cx - mx * transform.scale;
    transform.y = cy - my * transform.scale;
    updateDomainTransform();
  }

  function fitDomainView() {
    if (!svg || !document.body.contains(svg)) return;
    const rect = svg.getBoundingClientRect();
    if (!rect.width) { setTimeout(fitDomainView, 80); return; }
    const pts = Object.values(domainPositions);
    if (!pts.length) return;
    const pad  = 110;
    const minX = Math.min(...pts.map(p => p.x)) - NODE_R;
    const minY = Math.min(...pts.map(p => p.y)) - NODE_R;
    const maxX = Math.max(...pts.map(p => p.x)) + NODE_R;
    const maxY = Math.max(...pts.map(p => p.y)) + NODE_R;
    const bw   = maxX - minX + pad * 2;
    const bh   = maxY - minY + pad * 2;
    const s    = Math.min(rect.width / bw, rect.height / bh, 1.4);
    transform.scale = s;
    transform.x = (rect.width  - bw * s) / 2 - (minX - pad) * s;
    transform.y = (rect.height - bh * s) / 2 - (minY - pad) * s;
    updateDomainTransform();
  }

  // ─── Tooltip ─────────────────────────────────────────────────

  function showEdgeTooltip(edge, e) {
    removeTooltip();
    _tooltip = document.createElement('div');
    _tooltip.className = 'graph-tooltip';
    const sample = edge.products.slice(0, 5);
    _tooltip.innerHTML = `
      <div style="font-weight:700;margin-bottom:6px;font-size:12px">
        <span style="color:${DataMesh.getDomainColor(edge.from)}">${edge.from}</span>
        <span style="color:var(--color-text-muted)"> → </span>
        <span style="color:${DataMesh.getDomainColor(edge.to)}">${edge.to}</span>
      </div>
      <div style="font-size:11px;color:var(--color-text-muted);margin-bottom:8px">${edge.count} connection${edge.count!==1?'s':''}</div>
      ${sample.map(p => `
        <div style="font-size:11px;color:var(--color-text-secondary);padding:2px 0;border-top:1px solid var(--color-border)">
          ${p.from} <span style="color:var(--color-text-muted)">→</span> ${p.to}
        </div>
      `).join('')}
      ${edge.products.length > 5 ? `<div style="font-size:11px;color:var(--color-text-muted);margin-top:4px">+${edge.products.length-5} more</div>` : ''}
    `;
    document.body.appendChild(_tooltip);
    _tooltip.style.left = (e.clientX + 14) + 'px';
    _tooltip.style.top  = (e.clientY - 10) + 'px';
  }

  function removeTooltip() {
    if (_tooltip) { _tooltip.remove(); _tooltip = null; }
  }

  // ─── SVG helper ──────────────────────────────────────────────

  function svgEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    return el;
  }

  // ─── Public API ──────────────────────────────────────────────

  return {
    render,
    _selectDomain: name  => selectDomain(name),
    _deselect:     ()    => selectDomain(null),
  };
})();
