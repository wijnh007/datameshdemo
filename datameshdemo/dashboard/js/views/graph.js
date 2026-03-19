// DataMesh Platform - Interactive Graph View
const GraphView = (() => {
  const NODE_W      = 240;
  const PORT_H      = 30;
  const HEADER_H    = 58;
  const FOOTER_PAD  = 12;
  const PORT_R      = 7;

  let svg, contentGroup;
  let transform     = { x: 60, y: 60, scale: 0.85 };
  let isPanning     = false;
  let panStart      = { x: 0, y: 0 };
  let isDragging    = false;
  let dragProduct   = null;
  let dragOffset    = { x: 0, y: 0 };
  let selectedId    = null;
  let hoveredId     = null;

  function getNodeH(p) {
    return HEADER_H + Math.max(p.inputPorts.length, p.outputPorts.length) * PORT_H + FOOTER_PAD;
  }

  function getPortPos(productId, portId, type) {
    const p = DataMesh.getProduct(productId);
    if (!p) return null;
    const ports = type === 'output' ? p.outputPorts : p.inputPorts;
    const idx = ports.findIndex(port => port.id === portId);
    if (idx === -1) return null;
    const y = p.y + HEADER_H + idx * PORT_H + PORT_H / 2;
    const x = type === 'output' ? p.x + NODE_W : p.x;
    return { x, y };
  }

  function render(container) {
    container.innerHTML = `
      <div class="graph-view">
        <div class="graph-toolbar">
          <div class="graph-toolbar-left">
            <h1 class="view-title" style="margin:0">Data Product Graph</h1>
            <span class="text-muted" style="font-size:13px">${DataMesh.state.products.length} products · ${DataMesh.state.connections.length} connections</span>
          </div>
          <div class="graph-controls">
            <button class="btn btn-ghost btn-sm" id="btn-fit-view" title="Fit to screen">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>
              Fit View
            </button>
            <button class="btn btn-ghost btn-sm" id="btn-zoom-in" title="Zoom in">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm" id="btn-zoom-out" title="Zoom out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </button>
            <span class="graph-zoom-label" id="zoom-label">85%</span>
          </div>
        </div>

        <div class="graph-container" id="graph-container">
          <svg id="graph-svg" style="width:100%;height:100%">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#475569"/>
              </marker>
              <marker id="arrowhead-highlight" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6"/>
              </marker>
              <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.4"/>
              </filter>
              <filter id="node-shadow-selected" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#3b82f6" flood-opacity="0.5"/>
              </filter>
            </defs>
            <rect id="graph-bg" width="100%" height="100%" fill="transparent"/>
            <g id="graph-content"></g>
          </svg>
        </div>

        <div class="graph-legend">
          <div class="legend-title">Port Types</div>
          ${Object.entries(DataMesh.PORT_TYPE_COLORS).map(([type, color]) => `
            <div class="legend-item">
              <span class="legend-dot" style="background:${color}"></span>
              <span>${type}</span>
            </div>
          `).join('')}
          <div class="legend-sep"></div>
          <div class="legend-title">Domains</div>
          ${Object.entries(DataMesh.DOMAIN_COLORS).map(([domain, color]) => `
            <div class="legend-item">
              <span class="legend-dot" style="background:${color}"></span>
              <span>${domain}</span>
            </div>
          `).join('')}
        </div>

        <div class="graph-detail-panel" id="graph-detail" style="display:none"></div>

        <div class="graph-hint">Drag nodes to reposition · Scroll to zoom · Drag background to pan · Click node to inspect</div>
      </div>
    `;

    svg          = document.getElementById('graph-svg');
    contentGroup = document.getElementById('graph-content');

    initInteraction();
    renderGraph();
    fitView();

    document.getElementById('btn-fit-view').addEventListener('click', fitView);
    document.getElementById('btn-zoom-in').addEventListener('click',  () => zoom(1.2));
    document.getElementById('btn-zoom-out').addEventListener('click', () => zoom(0.8));
  }

  // ==================== Rendering ====================

  function renderGraph() {
    contentGroup.innerHTML = '';

    // Draw edges first (below nodes)
    const edgesGroup = svgEl('g', { id: 'edges-group' });
    contentGroup.appendChild(edgesGroup);

    // Draw nodes
    const nodesGroup = svgEl('g', { id: 'nodes-group' });
    contentGroup.appendChild(nodesGroup);

    DataMesh.state.connections.forEach(conn => edgesGroup.appendChild(renderEdge(conn)));
    DataMesh.state.products.forEach(prod => nodesGroup.appendChild(renderNode(prod)));

    updateTransform();
  }

  function renderEdge(conn) {
    const from = getPortPos(conn.fromProductId, conn.fromPortId, 'output');
    const to   = getPortPos(conn.toProductId,   conn.toPortId,   'input');
    if (!from || !to) return svgEl('g', {});

    const g = svgEl('g', { 'data-conn-id': conn.id, class: 'edge-group' });

    const dx = Math.max(60, (to.x - from.x) * 0.45);
    const pathD = `M${from.x},${from.y} C${from.x + dx},${from.y} ${to.x - dx},${to.y} ${to.x},${to.y}`;

    // Shadow path (wider, transparent - for hover)
    const hitPath = svgEl('path', {
      d: pathD, fill: 'none', stroke: 'transparent', 'stroke-width': '12',
      class: 'edge-hit',
    });

    const path = svgEl('path', {
      d: pathD, fill: 'none', stroke: '#475569', 'stroke-width': '2',
      'stroke-dasharray': conn._highlighted ? 'none' : 'none',
      'marker-end': 'url(#arrowhead)',
      class: 'edge-path',
    });

    g.appendChild(hitPath);
    g.appendChild(path);

    g.addEventListener('mouseenter', () => {
      path.setAttribute('stroke', '#3b82f6');
      path.setAttribute('stroke-width', '3');
      path.setAttribute('marker-end', 'url(#arrowhead-highlight)');
      showEdgeTooltip(conn, g);
    });
    g.addEventListener('mouseleave', () => {
      path.setAttribute('stroke', selectedId ? getEdgeColor(conn) : '#475569');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('marker-end', 'url(#arrowhead)');
      hideEdgeTooltip();
    });

    return g;
  }

  function getEdgeColor(conn) {
    if (conn.fromProductId === selectedId || conn.toProductId === selectedId) return '#3b82f6';
    return '#334155';
  }

  function renderNode(product) {
    const h     = getNodeH(product);
    const color = DataMesh.getDomainColor(product.domain);
    const isSelected = product.id === selectedId;

    const g = svgEl('g', {
      transform: `translate(${product.x}, ${product.y})`,
      'data-product-id': product.id,
      class: 'node-group',
      style: 'cursor:grab',
    });

    // Background
    const bg = svgEl('rect', {
      width: NODE_W, height: h, rx: '10', ry: '10',
      fill: '#1e293b', stroke: isSelected ? '#3b82f6' : '#334155',
      'stroke-width': isSelected ? '2' : '1',
      filter: isSelected ? 'url(#node-shadow-selected)' : 'url(#node-shadow)',
    });
    g.appendChild(bg);

    // Domain color top bar
    g.appendChild(svgEl('rect', { x: '0', y: '0', width: NODE_W, height: '4', rx: '10', ry: '10', fill: color }));
    g.appendChild(svgEl('rect', { x: '0', y: '2', width: NODE_W, height: '2', fill: color }));

    // Title
    const title = svgEl('text', { x: '14', y: '26', class: 'node-title', fill: '#f1f5f9', 'font-size': '13', 'font-weight': '600' });
    title.textContent = truncate(product.name, 24);
    g.appendChild(title);

    // Domain + status
    const sub = svgEl('text', { x: '14', y: '44', fill: color, 'font-size': '11', 'font-weight': '500' });
    sub.textContent = product.domain;
    g.appendChild(sub);

    const statusX = NODE_W - 14;
    const statusText = svgEl('text', { x: statusX, y: '44', 'text-anchor': 'end', 'font-size': '10', fill: product.status === 'active' ? '#22c55e' : product.status === 'draft' ? '#f59e0b' : '#ef4444' });
    statusText.textContent = product.status.toUpperCase();
    g.appendChild(statusText);

    // Divider
    g.appendChild(svgEl('line', { x1: '0', y1: HEADER_H - 2, x2: NODE_W, y2: HEADER_H - 2, stroke: '#334155', 'stroke-width': '1' }));

    // Port column headers
    const inHeader = svgEl('text', { x: '14', y: HEADER_H + 10, fill: '#64748b', 'font-size': '9', 'font-weight': '600', 'letter-spacing': '0.5' });
    inHeader.textContent = 'INPUTS';
    g.appendChild(inHeader);
    const outHeader = svgEl('text', { x: NODE_W - 14, y: HEADER_H + 10, 'text-anchor': 'end', fill: '#64748b', 'font-size': '9', 'font-weight': '600', 'letter-spacing': '0.5' });
    outHeader.textContent = 'OUTPUTS';
    g.appendChild(outHeader);

    // Input ports
    product.inputPorts.forEach((port, i) => {
      const cy = HEADER_H + PORT_H / 2 + i * PORT_H + PORT_H * 0.4;
      const portColor = DataMesh.getPortTypeColor(port.type);
      const hasConn   = DataMesh.state.connections.some(c => c.toProductId === product.id && c.toPortId === port.id);

      const pg = svgEl('g', { class: 'port-group', 'data-port-id': port.id });

      // Port circle
      const circle = svgEl('circle', { cx: '0', cy: cy, r: PORT_R, fill: hasConn ? portColor : '#1e293b', stroke: portColor, 'stroke-width': '2' });
      pg.appendChild(circle);

      // Port label
      const label = svgEl('text', { x: '14', y: cy + 4, fill: '#94a3b8', 'font-size': '10.5' });
      label.textContent = truncate(port.name, 18);
      pg.appendChild(label);

      // Type indicator
      const typeLabel = svgEl('text', { x: NODE_W / 2 - 4, y: cy + 4, fill: portColor, 'font-size': '9', opacity: '0.7' });
      typeLabel.textContent = port.type;
      pg.appendChild(typeLabel);

      pg.addEventListener('mouseenter', e => showPortTooltip(port, e));
      pg.addEventListener('mouseleave', hidePortTooltip);

      g.appendChild(pg);
    });

    // Output ports
    product.outputPorts.forEach((port, i) => {
      const cy = HEADER_H + PORT_H / 2 + i * PORT_H + PORT_H * 0.4;
      const portColor = DataMesh.getPortTypeColor(port.type);
      const hasConn   = DataMesh.state.connections.some(c => c.fromProductId === product.id && c.fromPortId === port.id);

      const pg = svgEl('g', { class: 'port-group', 'data-port-id': port.id });

      // Port label (right-aligned)
      const label = svgEl('text', { x: NODE_W - 14, y: cy + 4, 'text-anchor': 'end', fill: '#94a3b8', 'font-size': '10.5' });
      label.textContent = truncate(port.name, 18);
      pg.appendChild(label);

      // Port circle
      const circle = svgEl('circle', { cx: NODE_W, cy: cy, r: PORT_R, fill: hasConn ? portColor : '#1e293b', stroke: portColor, 'stroke-width': '2' });
      pg.appendChild(circle);

      pg.addEventListener('mouseenter', e => showPortTooltip(port, e));
      pg.addEventListener('mouseleave', hidePortTooltip);

      g.appendChild(pg);
    });

    // Node interaction
    g.addEventListener('mousedown', e => startNodeDrag(e, product));
    g.addEventListener('click', e => {
      if (!isDragging) selectNode(product.id);
      e.stopPropagation();
    });
    g.addEventListener('mouseenter', () => {
      if (!isSelected) bg.setAttribute('stroke', '#475569');
      g.style.cursor = 'grab';
    });
    g.addEventListener('mouseleave', () => {
      if (!isSelected) bg.setAttribute('stroke', '#334155');
    });

    return g;
  }

  // ==================== Interaction ====================

  function initInteraction() {
    const bg = document.getElementById('graph-bg');

    // Pan on background
    bg.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      isPanning = true;
      panStart  = { x: e.clientX - transform.x, y: e.clientY - transform.y };
      svg.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup',   onMouseUp);

    // Click on background → deselect
    bg.addEventListener('click', () => {
      if (!isDragging) selectNode(null);
    });

    // Zoom
    svg.addEventListener('wheel', e => {
      e.preventDefault();
      const delta  = e.deltaY < 0 ? 1.12 : 0.88;
      const rect   = svg.getBoundingClientRect();
      const mx     = (e.clientX - rect.left - transform.x) / transform.scale;
      const my     = (e.clientY - rect.top  - transform.y) / transform.scale;
      transform.scale = Math.min(3, Math.max(0.15, transform.scale * delta));
      transform.x = e.clientX - rect.left - mx * transform.scale;
      transform.y = e.clientY - rect.top  - my * transform.scale;
      updateTransform();
    }, { passive: false });
  }

  function onMouseMove(e) {
    if (isPanning) {
      transform.x = e.clientX - panStart.x;
      transform.y = e.clientY - panStart.y;
      updateTransform();
    }
    if (isDragging && dragProduct) {
      const svgPt  = screenToSVG(e);
      dragProduct.x = svgPt.x - dragOffset.x;
      dragProduct.y = svgPt.y - dragOffset.y;
      // Update node position
      const nodeEl = contentGroup.querySelector(`[data-product-id="${dragProduct.id}"]`);
      if (nodeEl) nodeEl.setAttribute('transform', `translate(${dragProduct.x}, ${dragProduct.y})`);
      // Redraw all edges
      redrawEdges();
    }
  }

  function onMouseUp() {
    isPanning  = false;
    isDragging = false;
    dragProduct = null;
    svg.style.cursor = 'default';
  }

  function startNodeDrag(e, product) {
    if (e.button !== 0) return;
    e.stopPropagation();
    isDragging  = true;
    dragProduct = product;
    const svgPt = screenToSVG(e);
    dragOffset  = { x: svgPt.x - product.x, y: svgPt.y - product.y };
    svg.style.cursor = 'grabbing';
  }

  function screenToSVG(e) {
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - transform.x) / transform.scale,
      y: (e.clientY - rect.top  - transform.y) / transform.scale,
    };
  }

  function redrawEdges() {
    const edgesGroup = document.getElementById('edges-group');
    if (!edgesGroup) return;
    edgesGroup.innerHTML = '';
    DataMesh.state.connections.forEach(conn => edgesGroup.appendChild(renderEdge(conn)));
  }

  function updateTransform() {
    contentGroup.setAttribute('transform', `translate(${transform.x}, ${transform.y}) scale(${transform.scale})`);
    const label = document.getElementById('zoom-label');
    if (label) label.textContent = Math.round(transform.scale * 100) + '%';
  }

  function zoom(factor) {
    const rect  = svg.getBoundingClientRect();
    const cx    = rect.width  / 2;
    const cy    = rect.height / 2;
    const mx    = (cx - transform.x) / transform.scale;
    const my    = (cy - transform.y) / transform.scale;
    transform.scale = Math.min(3, Math.max(0.15, transform.scale * factor));
    transform.x = cx - mx * transform.scale;
    transform.y = cy - my * transform.scale;
    updateTransform();
  }

  function fitView() {
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      setTimeout(fitView, 100);
      return;
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    DataMesh.state.products.forEach(p => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x + NODE_W);
      maxY = Math.max(maxY, p.y + getNodeH(p));
    });
    const pad = 60;
    const bw  = maxX - minX + pad * 2;
    const bh  = maxY - minY + pad * 2;
    const s   = Math.min(rect.width / bw, rect.height / bh, 1.0);
    transform.scale = s;
    transform.x = (rect.width  - bw * s) / 2 - (minX - pad) * s;
    transform.y = (rect.height - bh * s) / 2 - (minY - pad) * s;
    updateTransform();
  }

  // ==================== Selection & Details ====================

  function selectNode(id) {
    selectedId = id;

    // Update node visuals
    contentGroup.querySelectorAll('.node-group').forEach(el => {
      const pid   = el.dataset.productId;
      const bg    = el.querySelector('rect');
      const isSelected = pid === id;
      bg.setAttribute('stroke', isSelected ? '#3b82f6' : '#334155');
      bg.setAttribute('stroke-width', isSelected ? '2' : '1');
      bg.setAttribute('filter', isSelected ? 'url(#node-shadow-selected)' : 'url(#node-shadow)');
    });

    // Highlight connected edges
    contentGroup.querySelectorAll('.edge-group .edge-path').forEach(path => {
      const conn = DataMesh.state.connections.find(c => c.id === path.closest('.edge-group').dataset.connId);
      if (conn && id && (conn.fromProductId === id || conn.toProductId === id)) {
        path.setAttribute('stroke', '#3b82f6');
        path.setAttribute('stroke-width', '2.5');
      } else {
        path.setAttribute('stroke', '#475569');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('marker-end', 'url(#arrowhead)');
      }
    });

    const panel = document.getElementById('graph-detail');
    if (!id || !panel) { panel && (panel.style.display = 'none'); return; }

    const p = DataMesh.getProduct(id);
    if (!p) return;
    const color = DataMesh.getDomainColor(p.domain);
    const incoming = DataMesh.state.connections.filter(c => c.toProductId === id);
    const outgoing  = DataMesh.state.connections.filter(c => c.fromProductId === id);

    panel.style.display = 'block';
    panel.innerHTML = `
      <div class="detail-panel-header" style="border-left:4px solid ${color}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div class="domain-tag" style="background:${color}20;color:${color};margin-bottom:6px">${p.domain}</div>
            <h3 style="margin:0 0 4px;font-size:14px">${p.name}</h3>
            <div style="font-size:12px;color:var(--color-text-secondary)">v${p.version} · ${p.owner}</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('graph-detail').style.display='none'; GraphView._deselect()">✕</button>
        </div>
        <div style="margin-top:10px;display:flex;gap:8px">
          <span class="badge badge--${p.status === 'active' ? 'success' : p.status === 'draft' ? 'warning' : 'danger'}">${p.status}</span>
          <span style="font-size:11px;color:var(--color-text-muted)">SLA ${p.sla} · ${p.updateFrequency}</span>
        </div>
      </div>
      <div class="detail-panel-body">
        <p style="font-size:12px;color:var(--color-text-secondary);margin:0 0 12px">${p.description.slice(0, 140)}${p.description.length > 140 ? '…' : ''}</p>
        ${incoming.length ? `
          <div class="detail-mini-section">
            <div class="detail-mini-title">Receives from (${incoming.length})</div>
            ${incoming.map(c => {
              const src = DataMesh.getProduct(c.fromProductId);
              const srcColor = src ? DataMesh.getDomainColor(src.domain) : '#64748b';
              return src ? `<div class="conn-mini-item" onclick="GraphView._select('${src.id}')"><span class="legend-dot" style="background:${srcColor}"></span>${src.name}</div>` : '';
            }).join('')}
          </div>
        ` : ''}
        ${outgoing.length ? `
          <div class="detail-mini-section">
            <div class="detail-mini-title">Sends to (${outgoing.length})</div>
            ${outgoing.map(c => {
              const tgt = DataMesh.getProduct(c.toProductId);
              const tgtColor = tgt ? DataMesh.getDomainColor(tgt.domain) : '#64748b';
              return tgt ? `<div class="conn-mini-item" onclick="GraphView._select('${tgt.id}')"><span class="legend-dot" style="background:${tgtColor}"></span>${tgt.name}</div>` : '';
            }).join('')}
          </div>
        ` : ''}
        <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px">
          <button class="btn btn-primary btn-sm" onclick="App.hideModal(); location.hash='#/marketplace'" style="width:100%">Subscribe via Marketplace</button>
          <button class="btn btn-ghost btn-sm" onclick="CatalogView._openEdit('${p.id}')" style="width:100%">Edit in Catalog</button>
        </div>
      </div>
    `;
  }

  // ==================== Tooltips ====================

  let tooltip = null;

  function showPortTooltip(port, e) {
    removeTooltip();
    tooltip = document.createElement('div');
    tooltip.className = 'graph-tooltip';
    tooltip.innerHTML = `
      <div style="font-weight:600;margin-bottom:3px">${port.name}</div>
      <div style="color:${DataMesh.getPortTypeColor(port.type)};font-size:11px">${port.type} · ${port.format}</div>
      <div style="color:var(--color-text-muted);font-size:11px;margin-top:3px">${port.description}</div>
    `;
    document.body.appendChild(tooltip);
    positionTooltip(e);
  }

  function showEdgeTooltip(conn, el) {
    removeTooltip();
    const from = DataMesh.getProduct(conn.fromProductId);
    const to   = DataMesh.getProduct(conn.toProductId);
    const fromPort = DataMesh.getPortById(conn.fromProductId, conn.fromPortId);
    const toPort   = DataMesh.getPortById(conn.toProductId,   conn.toPortId);
    if (!from || !to) return;
    tooltip = document.createElement('div');
    tooltip.className = 'graph-tooltip';
    tooltip.innerHTML = `
      <div style="font-size:11px;color:var(--color-text-muted)">Connection</div>
      <div style="font-weight:600;margin:3px 0">${from.name}</div>
      <div style="font-size:11px;color:${DataMesh.getPortTypeColor(fromPort?.type || 'api')}">${fromPort?.name || conn.fromPortId}</div>
      <div style="color:var(--color-text-muted);padding:3px 0">↓</div>
      <div style="font-weight:600;margin-bottom:3px">${to.name}</div>
      <div style="font-size:11px;color:${DataMesh.getPortTypeColor(toPort?.type || 'api')}">${toPort?.name || conn.toPortId}</div>
    `;
    document.body.appendChild(tooltip);
  }

  function hidePortTooltip()  { removeTooltip(); }
  function hideEdgeTooltip()  { removeTooltip(); }

  function removeTooltip() {
    if (tooltip) { tooltip.remove(); tooltip = null; }
  }

  function positionTooltip(e) {
    if (!tooltip) return;
    const x = e.clientX + 16;
    const y = e.clientY - 10;
    tooltip.style.left = x + 'px';
    tooltip.style.top  = y + 'px';
  }

  // ==================== Helpers ====================

  function svgEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  }

  function truncate(str, n) {
    return str.length > n ? str.slice(0, n - 1) + '…' : str;
  }

  return {
    render,
    _select:   (id) => selectNode(id),
    _deselect: ()   => selectNode(null),
  };
})();
