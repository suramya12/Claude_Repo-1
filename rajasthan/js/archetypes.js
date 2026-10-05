/* Scene archetypes. Each takes (node, el, ctx) and returns an instance:
   { destroy, pointFor(childId, current), focusChild(id), focusStart(), arrow(dir), wheel(e), pinch(r, c, end), pause, resume, resize } */
(function () {
  'use strict';
  const { h, svg, fill, add } = U;
  const ARCH = (window.ARCH = window.ARCH || {});

  // ---------- shared pieces ----------
  function head(node, ctx, opts = {}) {
    const eyebrow = h('p.eyebrow.mono-label', null,
      node.native ? h('span.deva', { lang: 'hi', text: node.native }) : null,
      h('span', { text: node.eyebrow || '' }));
    const h1 = h(`h1.${opts.display ? 'display' : 'title'}`, { tabindex: '-1', text: node.title });
    const big = node.big && !opts.noBig ? h('p.display', { style: { fontSize: 'clamp(22px, 3vw, 40px)', margin: '0 0 10px', color: 'var(--accent-ink)' }, text: node.big }) : null;
    const line = node.line ? h('p.line', { text: node.line }) : null;
    const wrap = h('div.scene-head', { 'data-inert': '' }, eyebrow, h1, big, line, opts.extra || null);
    return { wrap, h1 };
  }
  function heart(node, ctx) {
    const b = h('button.heart', { type: 'button', 'aria-pressed': String(ctx.isSaved(node.id)) });
    const set = (on) => { b.setAttribute('aria-pressed', String(on)); b.replaceChildren(heartIcon(), h('span', { text: on ? 'Saved' : 'Save' })); b.setAttribute('aria-label', on ? `Remove ${node.title} from saved places` : `Save ${node.title}`); };
    set(ctx.isSaved(node.id));
    b.addEventListener('click', () => set(ctx.toggleSave(node.id)));
    return b;
  }
  function heartIcon() { return svg('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, svg('path', { d: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z' })); }
  function enterButtons(node, ctx) {
    return node.children.filter((c) => !ctx.get(c).hiddenEnter).map((c) => h('button.btn', { type: 'button', 'data-go': c, text: `Enter · ${ctx.get(c).title}` }));
  }
  /** Rectangle of an image drawn like object-fit: cover with a focal point. */
  function cover(iw, ih, W, H, fx = 50, fy = 50) {
    const s = Math.max(W / iw, H / ih), w = iw * s, hh = ih * s;
    return { x: (W - w) * (fx / 100), y: (H - hh) * (fy / 100), w, h: hh, s };
  }
  function focusEl(el) { if (el) el.focus({ preventScroll: true }); }
  function pulse(el) { if (!el) return; el.classList.add('pulse'); setTimeout(() => el.classList.remove('pulse'), 2600); }
  ARCH._head = head; ARCH._heart = heart; ARCH._cover = cover;

  // ---------- fallback ----------
  ARCH.fallback = function (node, el, ctx) {
    const { wrap, h1 } = head(node, ctx);
    add(el, U.fallback(node.native, node.coords), h('div.vignette'), wrap);
    return { focusStart: () => focusEl(h1) };
  };

  // ---------- ORBIT ----------
  ARCH.orbit = function (node, el, ctx) {
    const D = ctx.D, geo = window.RJ_GEO;
    const canvas = h('canvas.fill', { 'data-empty': '', 'aria-hidden': 'true' });
    const target = h('button.hs', { type: 'button', 'data-go': node.children[0], 'aria-label': `Zoom into ${ctx.get(node.children[0]).title}`, style: { opacity: 0 } }, h('span.dot'), h('span.lbl', { text: D.meta.name }));
    const enter = h('button.btn.enter', { type: 'button', 'data-go': node.children[0] }, `Enter ${D.meta.name}`);
    const stats = h('div.stats', null, node.stats.map(([b, s]) => h('div.stat', null, h('b', { text: b }), h('span', { text: s }))));
    const h1 = h('h1.display', { tabindex: '-1', text: D.meta.name });
    const wrap = h('div.scene-head', { 'data-inert': '' },
      h('p.mono-label', { text: node.eyebrow }), h1, h('div.native', { lang: 'hi', text: D.meta.native }),
      h('p.line', { text: node.line }), stats, enter);
    el.append(canvas, h('div.vignette'), target, wrap, h('p.note', { 'data-inert': '', text: node.note }));
    const d3 = window.d3;
    let raf = 0, paused = false;
    const center = [D.meta.viewer.lon, D.meta.viewer.lat];
    if (!d3 || !geo) {
      canvas.remove(); el.prepend(h('div.fallback-globe', { 'data-empty': '' }));
      const place = () => { const r = el.querySelector('.fallback-globe').getBoundingClientRect(); target.style.left = r.left + r.width * 0.47 + 9 + 'px'; target.style.top = r.top + r.height * 0.41 + 9 + 'px'; target.style.opacity = 1; };
      requestAnimationFrame(place);
      return { focusStart: () => focusEl(h1), pointFor: () => { const r = target.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, resize: place };
    }
    const g = canvas.getContext('2d');
    let W, H, dpr, R, cx, cy;
    const proj = d3.geoOrthographic().clipAngle(90);
    const path = d3.geoPath(proj, g);
    const grat = d3.geoGraticule10();
    const land = { type: 'Feature', geometry: geo.land };
    const state = { type: 'Feature', geometry: geo.rajasthan };
    let rot = [-(center[0]) + 95, -10, 0];
    const goal = [-(center[0]), -(center[1]) + 6, 0];
    let drag = null, t0 = performance.now(), userRot = false;
    function resize() {
      W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight; dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const mobile = W < 760;
      R = mobile ? Math.min(W * 0.48, H * 0.3) : Math.min(H * 0.42, W * 0.3);
      cx = mobile ? W / 2 : W * 0.64; cy = mobile ? H * 0.3 : H * 0.48;
      proj.scale(R).translate([cx, cy]);
    }
    function draw(t) {
      raf = requestAnimationFrame(draw);
      if (paused) return;
      if (!userRot && !drag) {
        const k = U.reduced() ? 1 : U.ease(U.clamp((t - t0) / 3200, 0, 1));
        proj.rotate([U.lerp(rot[0], goal[0], k), U.lerp(rot[1], goal[1], k), 0]);
      }
      g.clearRect(0, 0, W, H);
      // atmosphere
      const atm = g.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.25);
      atm.addColorStop(0, 'rgba(228,138,46,0.16)'); atm.addColorStop(1, 'rgba(228,138,46,0)');
      g.fillStyle = atm; g.beginPath(); g.arc(cx, cy, R * 1.25, 0, 7); g.fill();
      const ocean = g.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.1, cx, cy, R);
      ocean.addColorStop(0, '#16131a'); ocean.addColorStop(1, '#07070b');
      g.fillStyle = ocean; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
      g.beginPath(); path(grat); g.strokeStyle = 'rgba(242,233,216,0.06)'; g.lineWidth = 0.6; g.stroke();
      g.beginPath(); path(land); g.fillStyle = '#2a2119'; g.fill(); g.strokeStyle = 'rgba(242,233,216,0.16)'; g.lineWidth = 0.6; g.stroke();
      // Rajasthan glows
      const pulseA = U.reduced() ? 0.9 : 0.75 + 0.25 * Math.sin(t / 700);
      g.save(); g.shadowColor = 'rgba(228,138,46,0.9)'; g.shadowBlur = 24 * pulseA;
      g.beginPath(); path(state); g.fillStyle = `rgba(228,138,46,${0.85 * pulseA})`; g.fill(); g.restore();
      g.beginPath(); path(state); g.strokeStyle = '#f7c58a'; g.lineWidth = 1; g.stroke();
      // terminator shading
      const sh = g.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.65, 'rgba(0,0,0,0.25)'); sh.addColorStop(1, 'rgba(0,0,0,0.7)');
      g.fillStyle = sh; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
      const p = proj(center);
      if (p && d3.geoDistance(center, proj.invert([cx, cy])) < 1.4) { target.style.left = p[0] + 'px'; target.style.top = p[1] + 'px'; target.style.opacity = 1; target.style.visibility = ''; }
      else target.style.visibility = 'hidden';
    }
    canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, r: proj.rotate() }; userRot = true; });
    const mv = (e) => { if (!drag) return; const k = 0.25; proj.rotate([drag.r[0] + (e.clientX - drag.x) * k, U.clamp(drag.r[1] - (e.clientY - drag.y) * k, -80, 80), 0]); };
    const upd = () => { drag = null; };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', upd);
    resize(); raf = requestAnimationFrame((t) => { t0 = t; draw(t); });
    return {
      destroy() { cancelAnimationFrame(raf); window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', upd); },
      pause() { paused = true; }, resume() { paused = false; }, resize,
      focusStart: () => focusEl(h1),
      focusChild: () => { focusEl(enter); pulse(target); },
      pointFor() { proj.rotate(goal); userRot = true; const p = proj(center); return p ? { x: p[0], y: p[1] } : null; },
    };
  };

  // ---------- RING ----------
  ARCH.ring = function (node, el, ctx) {
    const kids = node.children.map(ctx.get);
    const n = kids.length;
    const { wrap, h1 } = head(node, ctx);
    const ringEl = h('div.ring3d');
    const portals = kids.map((k, i) => {
      const img = U.img(k.photo, k.alt, { sizes: '320px', fx: k.fx, fy: k.fy, native: k.native, coords: k.coords }) || U.fallback(k.native, k.coords);
      const p = h('button.portal', { type: 'button', 'data-go': k.id, 'aria-label': `${U.roman(i + 1)}. ${k.title}: ${k.kind}. ${k.teaser || ''}`, onfocus: () => { rotateTo(i); ctx.preload(k.id); } },
        img, h('span.cap', null, h('span.roman', { text: U.roman(i + 1) }), h('span.name', { text: k.title }), h('span.kind', { text: k.kind })));
      ringEl.append(p); return p;
    });
    const rail = h('div.rail', { 'data-inert': '', role: 'group', 'aria-label': 'Choose a wonder' },
      kids.map((k, i) => h('button', { type: 'button', 'aria-label': `Turn to ${U.roman(i + 1)}, ${k.title}`, onclick: () => rotateTo(i) }, h('span', { text: U.roman(i + 1) }))));
    const note = h('p.ring-note.mono-label', { 'data-inert': '', text: node.note || '' });
    el.append(h('div.scene-bg', { 'data-empty': '' }), h('div.ring-wrap', { 'data-empty': '' }, ringEl), h('div.vignette'), wrap, rail, note);
    let angle = 0, targetA = 0, raf = 0, idx = 0, R = 420, pw = 300;
    function size() {
      const W = el.clientWidth || innerWidth, H = el.clientHeight || innerHeight;
      const tablet = W >= 760 && W <= 1100;
      pw = U.clamp(Math.min(W * 0.24, H * (tablet ? 0.3 : 0.36)), 170, 300); R = Math.max(pw * 1.25, (pw * 1.15) / (2 * Math.tan(Math.PI / n)));
      ringEl.style.setProperty('--pw', pw + 'px'); ringEl.style.top = W < 760 ? '52%' : tablet ? '62%' : '56%';
      portals.forEach((p) => p.style.setProperty('--pw', pw + 'px'));
    }
    function render() {
      angle += (targetA - angle) * (U.reduced() ? 1 : 0.12);
      ringEl.style.transform = `translateZ(${-R}px) rotateY(${-angle}deg)`;
      portals.forEach((p, i) => {
        const a = i * (360 / n);
        p.style.transform = `rotateY(${a}deg) translateZ(${R}px)`;
        const rel = Math.abs(U.angDiff(a, angle));
        p.classList.toggle('front', rel < 180 / n); p.classList.toggle('back', rel > 100);
      });
      [...rail.children].forEach((b, i) => b.setAttribute('aria-current', String(i === idx)));
      if (Math.abs(targetA - angle) > 0.05) raf = requestAnimationFrame(render);
    }
    function rotateTo(i) { idx = (i + n) % n; let a = idx * (360 / n); a = angle + U.angDiff(a, angle); targetA = a; cancelAnimationFrame(raf); raf = requestAnimationFrame(render); }
    let drag = null;
    el.addEventListener('pointerdown', (e) => { if (e.target.closest('.rail, .scene-head')) return; drag = { x: e.clientX, a: targetA }; });
    const mv = (e) => { if (!drag) return; targetA = drag.a - (e.clientX - drag.x) * 0.25; idx = ((Math.round(targetA / (360 / n)) % n) + n) % n; cancelAnimationFrame(raf); raf = requestAnimationFrame(render); };
    const upd = () => { if (drag) { drag = null; rotateTo(idx); } };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', upd);
    size(); render();
    return {
      destroy() { cancelAnimationFrame(raf); window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', upd); },
      resize() { size(); render(); },
      focusStart: () => focusEl(h1),
      focusChild(id) { const i = node.children.indexOf(id); rotateTo(i); angle = targetA; render(); focusEl(portals[i]); },
      pointFor(id, current) {
        const i = node.children.indexOf(id); if (i < 0) return null;
        if (!current) { idx = i; targetA = angle = i * (360 / n); render(); }
        const r = portals[i].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      },
      arrow(dir) { rotateTo(idx + dir); focusEl(portals[idx]); return true; },
    };
  };

  // Greedy label placement around anchored dots (.hs.anch): try below, above,
  // right and left of each dot and keep the first spot that hits no dot, no
  // other label and no panel. Items carry _x/_y in scene layout pixels.
  function layoutBox(n, root) { let l = 0, t = 0, m = n; while (m && m !== root) { l += m.offsetLeft; t += m.offsetTop; m = m.offsetParent; } return { l, t, r: l + n.offsetWidth, b: t + n.offsetHeight }; }
  function placeLabels(root, items, panels, W) {
    // layout boxes, not client rects: the scene may be mid-zoom (scaled)
    const blocks = panels.filter((n) => n && !n.hidden).map((n) => layoutBox(n, root)).filter((r) => r.r > r.l);
    const dots = items.map((b2) => ({ l: b2._x - 10, t: b2._y - 10, r: b2._x + 10, b: b2._y + 10 }));
    const taken = [];
    const hit = (a, z) => Math.max(0, Math.min(a.r, z.r) - Math.max(a.l, z.l)) * Math.max(0, Math.min(a.b, z.b) - Math.max(a.t, z.t));
    const minX = 8, maxX = W - (W < 760 ? 30 : 56);
    for (const b2 of items.slice().sort((a, z) => a._y - z._y)) {
      const lb = b2.querySelector('.lbl'); const w = lb.offsetWidth, hh = lb.offsetHeight, x = b2._x, y = b2._y;
      // centred labels may slide sideways (up to the dot) to stay on screen
      const slide = U.clamp(Math.max(0, minX - (x - w / 2)) - Math.max(0, x + w / 2 - maxX), -w / 2 + 6, w / 2 - 6);
      const opts = { b: { l: x - w / 2 + slide, t: y + 12, r: x + w / 2 + slide, b: y + 12 + hh, dx: slide }, t: { l: x - w / 2 + slide, t: y - 12 - hh, r: x + w / 2 + slide, b: y - 12, dx: slide }, r: { l: x + 14, t: y - hh / 2, r: x + 14 + w, b: y + hh / 2 }, l: { l: x - 14 - w, t: y - hh / 2, r: x - 14, b: y + hh / 2 },
        tr: { l: x + 8, t: y - 8 - hh, r: x + 8 + w, b: y - 8 }, br: { l: x + 8, t: y + 8, r: x + 8 + w, b: y + 8 + hh }, tl: { l: x - 8 - w, t: y - 8 - hh, r: x - 8, b: y - 8 }, bl: { l: x - 8 - w, t: y + 8, r: x - 8, b: y + 8 + hh } };
      let best = 'b', bestCost = Infinity, bestClash = 0;
      for (const [m, R] of Object.entries(opts)) {
        let cost = 0, clash = 0;
        for (const d of dots) cost += hit(R, d) * 3;
        for (const z of taken) clash += hit(R, z);
        cost += clash * 2;
        for (const z of blocks) cost += hit(R, z);
        if (R.l < minX || R.r > maxX) cost += 5000 + 50 * Math.max(minX - R.l, R.r - maxX);
        if (cost < bestCost) { best = m; bestCost = cost; bestClash = clash; }
        if (cost === 0) break;
      }
      // a label that would still sit on another label is shown only on hover or focus (zoom in to separate them)
      const tuck = bestClash > w * hh * 0.25;
      b2.dataset.lbl = best; b2.classList.toggle('tucked', tuck);
      if (!tuck) taken.push(opts[best]);
      lb.style.setProperty('--dx', (opts[best].dx || 0) + 'px');
    }
  }

  // ---------- MAP ----------
  ARCH.map = function (node, ctx_el, ctx) { return mapScene(node, ctx_el, ctx); };
  function mapScene(node, el, ctx) {
    const D = ctx.D, geo = window.RJ_GEO, d3 = window.d3;
    const { wrap, h1 } = head(node, ctx);
    const pins = node.children.map(ctx.get).filter((k) => k.coords);
    const jumps = (node.jumps || []).map(ctx.get).filter(Boolean);
    const all = [...pins, ...jumps];
    const svgEl = svg('svg', { class: 'map-svg', 'data-empty': '', role: 'img', 'aria-label': `Map of ${node.title}` });
    const gWorld = svg('g');
    svgEl.append(svg('defs', null, svg('filter', { id: 'blob-' + node.id, x: '-50%', y: '-50%', width: '200%', height: '200%' }, svg('feGaussianBlur', { stdDeviation: 18 }))), gWorld);
    const layerPins = h('div.layer-pins');
    const leaders = svg('svg', { class: 'leaders', 'aria-hidden': 'true' });
    const cats = [...new Set(pins.map((p) => p.cat).filter(Boolean))];
    const active = new Set(cats);
    const filters = cats.length > 1 ? h('div.filters', { 'data-inert': '', role: 'group', 'aria-label': 'Filter places' }, cats.map((c) => {
      const b = h('button.chip', { type: 'button', 'aria-pressed': 'true', text: c });
      b.addEventListener('click', () => { active.has(c) ? active.delete(c) : active.add(c); if (!active.size) cats.forEach((x) => active.add(x)); syncChips(); place(); });
      return b;
    })) : null;
    function syncChips() { filters && [...filters.children].forEach((b) => b.setAttribute('aria-pressed', String(active.has(b.textContent)))); }
    const legend = node.legend ? h('div.legend', { 'data-inert': '' }, node.legend.map((t) => h('p.mono-label', { text: t }))) : null;
    const scale = h('div.scalebar.mono-label', { 'data-inert': '' }, h('i'), h('span'));
    add(el, svgEl, h('div.vignette'), layerPins, wrap, filters, legend, scale);
    if (node.note) add(wrap, h('p.mono-label.dim', { style: { marginTop: '12px' }, text: node.note }));
    if (node.children.some((c) => !ctx.get(c).coords)) add(wrap, h('div.head-actions', null, enterButtons({ children: node.children.filter((c) => !ctx.get(c).coords) }, ctx)));

    // projection: d3 Mercator when available, else equirectangular
    let W, H, proj, k = 1, tx = 0, ty = 0, minK = 1;
    const b = node.bounds || bounds(all.map((p) => p.coords));
    function bounds(cs) { const la = cs.map((c) => c[0]), lo = cs.map((c) => c[1]); const pad = 0.35; return [[Math.min(...lo) - pad, Math.min(...la) - pad], [Math.max(...lo) + pad, Math.max(...la) + pad]]; }
    function setup() {
      W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight;
      const mobile = W < 760;
      const box = mobile ? [[24, Math.min(H * 0.5, layoutBox(wrap, el).b + 36)], [W - 34, (filters ? layoutBox(filters, el).t : H - 70) - 44]] : [[W * 0.36, 90], [W - 90, H - 110]];
      // MultiPoint, not a polygon: d3 reads polygon winding on the sphere, a box could mean "everything but the box"
      const feat = { type: 'Feature', geometry: { type: 'MultiPoint', coordinates: [[b[0][0], b[0][1]], [b[1][0], b[1][1]]] } };
      if (mobile) Object.assign(scale.style, { top: Math.max(0, box[0][1] - 30) + 'px', bottom: 'auto', left: 'auto', right: '30px', transform: 'none' });
      else ['top', 'bottom', 'left', 'right', 'transform'].forEach((k) => scale.style.removeProperty(k));
      if (d3) proj = d3.geoMercator().fitExtent(box, feat);
      else {
        const lat0 = (b[0][1] + b[1][1]) / 2, c = Math.cos(lat0 * U.RAD);
        const sx = (box[1][0] - box[0][0]) / ((b[1][0] - b[0][0]) * c), sy = (box[1][1] - box[0][1]) / (b[1][1] - b[0][1]), s = Math.min(sx, sy);
        const ox = (box[0][0] + box[1][0]) / 2 - ((b[0][0] + b[1][0]) / 2) * c * s, oy = (box[0][1] + box[1][1]) / 2 + ((b[0][1] + b[1][1]) / 2) * s;
        proj = ([lon, lat]) => [ox + lon * c * s, oy - lat * s];
      }
      draw();
    }
    const P = ([lat, lon]) => proj([lon, lat]);
    function pathD(geom) {
      const rings = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : geom.type === 'LineString' ? [[geom.coordinates]] : geom.type === 'MultiLineString' ? [geom.coordinates] : [];
      const close = geom.type.includes('Polygon');
      return rings.map((poly) => poly.map((r) => 'M' + r.map((p) => proj(p).map((v) => v.toFixed(1)).join(',')).join('L') + (close ? 'Z' : '')).join('')).join('');
    }
    function draw() {
      gWorld.replaceChildren();
      const grid = svg('g', { class: 'grid' });
      for (let lo = Math.floor(b[0][0]) - 2; lo <= b[1][0] + 2; lo += (b[1][0] - b[0][0] > 3 ? 1 : 0.1)) { const a = proj([lo, b[0][1] - 4]), c = proj([lo, b[1][1] + 4]); grid.append(svg('line', { x1: a[0], y1: a[1], x2: c[0], y2: c[1] })); }
      for (let la = Math.floor(b[0][1]) - 2; la <= b[1][1] + 2; la += (b[1][1] - b[0][1] > 3 ? 1 : 0.1)) { const a = proj([b[0][0] - 4, la]), c = proj([b[1][0] + 4, la]); grid.append(svg('line', { x1: a[0], y1: a[1], x2: c[0], y2: c[1] })); }
      gWorld.append(grid);
      if (geo) {
        for (const nb of geo.neighbours) {
          gWorld.append(svg('path', { class: 'neigh', d: pathD(nb.geometry) }));
        }
        gWorld.append(svg('path', { class: 'state', d: pathD(geo.rajasthan) }));
        for (const r of geo.rivers) gWorld.append(svg('path', { class: 'river', d: pathD(r.geometry) }));
      }
      if (D.geo.aravalli && !node.city) gWorld.append(svg('path', { class: 'aravalli', d: 'M' + D.geo.aravalli.map((c) => P(c).map((v) => v.toFixed(1)).join(',')).join('L') }));
      // region glow from its places
      const blob = svg('g', { filter: `url(#blob-${node.id})`, opacity: 0.55 });
      for (const p of pins) { const [x, y] = P(p.coords); blob.append(svg('circle', { cx: x, cy: y, r: node.city ? 26 : 46, fill: 'rgba(228,138,46,0.35)' })); }
      gWorld.append(blob);
      // labels
      for (const L of D.geo.labels || []) {
        if (node.city) continue;
        const [x, y] = P(L.at); gWorld.append(svg('text', { class: L.kind === 'river' ? 'river-label' : L.kind === 'aravalli' ? 'aravalli-label' : 'neigh-label', x, y, 'text-anchor': 'middle' }, L.text));
      }
      // pins
      layerPins.replaceChildren(leaders);
      for (const p of all) {
        const jump = !pins.includes(p);
        const btn = h(`button.hs.anch${jump ? '.jump' : ''}`, { type: 'button', 'data-go': p.id, 'data-cat': p.cat || '', 'aria-label': `${p.title}${jump ? ' (one of the seven wonders)' : ''}. ${p.teaser || ''}`, onmouseenter: () => ctx.preload(p.id), onfocus: () => ctx.preload(p.id) },
          h('span.dot', { 'aria-hidden': 'true' }), h('span.lbl', { 'aria-hidden': 'true', text: (jump ? '◆ ' : '') + p.title }),
          h('span.teaser', { 'aria-hidden': 'true', text: p.teaser || '' }));
        btn._p = p; layerPins.append(btn);
      }
      place();
      scaleBar();
      if (!el.isConnected) requestAnimationFrame(() => el.isConnected && setup());
    }
    function place() {
      const shown = [];
      for (const btn of layerPins.querySelectorAll('.hs')) {
        const [x, y] = P(btn._p.coords);
        btn._x = x * k + tx; btn._y = y * k + ty;
        btn.hidden = btn.dataset.cat && !active.has(btn.dataset.cat) && !btn.classList.contains('jump');
        if (!btn.hidden) shown.push(btn);
      }
      gWorld.setAttribute('transform', `translate(${tx},${ty}) scale(${k})`);
      // Places closer than a dot's width fan out around their centre, with a leader line back to it.
      leaders.replaceChildren();
      const seen = new Set();
      for (const a of shown) {
        if (seen.has(a)) continue;
        const group = [a]; seen.add(a);
        for (let gi = 0; gi < group.length; gi++) for (const z of shown) if (!seen.has(z) && Math.hypot(z._x - group[gi]._x, z._y - group[gi]._y) < 20) { group.push(z); seen.add(z); }
        if (group.length < 2) continue;
        const cx = group.reduce((t, z) => t + z._x, 0) / group.length, cy = group.reduce((t, z) => t + z._y, 0) / group.length;
        const r = Math.max(18, group.length * 9);
        group.sort((m, n) => Math.atan2(m._y - cy, m._x - cx) - Math.atan2(n._y - cy, n._x - cx));
        group.forEach((z, gi) => {
          const ang = -Math.PI / 2 + (gi * 2 * Math.PI) / group.length;
          z._x = cx + r * Math.cos(ang); z._y = cy + r * Math.sin(ang);
          leaders.append(svg('line', { x1: cx, y1: cy, x2: z._x, y2: z._y }));
        });
        leaders.append(svg('circle', { cx, cy, r: 2.5 }));
      }
      for (const btn of shown) { btn.style.left = btn._x + 'px'; btn.style.top = btn._y + 'px'; }
      placeLabels(el, shown, [wrap, filters, legend], W);
    }
    function scaleBar() {
      // a round distance that is about 120 px long at the current zoom
      const c = [(b[0][1] + b[1][1]) / 2, (b[0][0] + b[1][0]) / 2];
      const p1 = P(c), p2 = P([c[0], c[1] + 1]); const kmPerPx = U.distance(c, [c[0], c[1] + 1]) / (Math.abs(p2[0] - p1[0]) * k);
      const nice = [0.5, 1, 2, 5, 10, 20, 50, 100, 200].find((v) => v / kmPerPx > 70) || 200;
      scale.querySelector('i').style.width = (nice / kmPerPx).toFixed(0) + 'px'; scale.querySelector('span').textContent = `${nice} km`;
    }
    function zoomAt(f, cx, cy) {
      const nk = U.clamp(k * f, minK, 6); if (nk === k) return false;
      tx = cx - (cx - tx) * (nk / k); ty = cy - (cy - ty) * (nk / k); k = nk; place(); scaleBar(); return true;
    }
    let drag = null;
    svgEl.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, tx, ty }; el.classList.add('dragging'); });
    const mv = (e) => { if (!drag || k <= 1.001 && !node.pan) return; tx = drag.tx + e.clientX - drag.x; ty = drag.ty + e.clientY - drag.y; place(); };
    const upd = () => { drag = null; el.classList.remove('dragging'); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', upd);
    let pinchK = 1;
    setup();
    return {
      destroy() { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', upd); },
      resize() { k = 1; tx = ty = 0; setup(); },
      focusStart: () => focusEl(h1),
      focusChild(id) { const b2 = layerPins.querySelector(`[data-go="${id}"]`); focusEl(b2); pulse(b2); },
      pointFor(id) { const b2 = layerPins.querySelector(`[data-go="${id}"]`); if (!b2) return null; const r = b2.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; },
      wheel(e) {
        if (e.deltaY < 0) return zoomAt(1.18, e.clientX, e.clientY) || true;
        if (k > minK + 0.001) { zoomAt(1 / 1.18, e.clientX, e.clientY); if (k <= minK + 0.001) { k = minK; tx = ty = 0; place(); scaleBar(); } return true; }
        return false;
      },
      pinch(r, c, end) {
        if (end) { const consumed = pinchK > 1.02 || r > 1; pinchK = k; return consumed && !(k <= minK + 0.01 && r < 0.72); }
        if (c) { const f = (pinchK * r) / k; if (pinchK * r >= minK) zoomAt(f, c.x, c.y); }
        return true;
      },
    };
  }

  // ---------- PHOTO-EXPLORE (place) ----------
  ARCH.photo = function (node, el, ctx) {
    el.classList.add('place');
    const pdata = U.photo(node.photo);
    const stageEl = h('div.photo-bg', { 'data-empty': '' });
    const inner = h('div', { style: { position: 'absolute', inset: '0', transformOrigin: '50% 50%', transition: 'transform .5s var(--ease)' } });
    const img = pdata ? U.img(node.photo, node.alt, { eager: true }) : null;
    if (img) { img.style.position = 'absolute'; img.style.maxWidth = 'none'; img.setAttribute('data-empty', ''); inner.append(img); }
    else inner.append(U.fallback(node.native, node.coords));
    stageEl.append(inner);
    const spots = h('div', { style: { position: 'absolute', inset: '0', pointerEvents: 'none' } });
    inner.append(spots);
    const extra = h('div.head-actions', null, heart(node, ctx), enterButtons(node, ctx));
    const { wrap, h1 } = head(node, ctx, { extra });
    const panel = placePanel(node, ctx);
    add(el, stageEl, h('div.vignette'), wrap, panel.el, U.credit(node.photo, node.photoNote));
    // hotspots on the photo
    const pinEls = [];
    (node.spots || []).forEach((s, i) => {
      const isEnter = !!s.go;
      const card = isEnter ? null : h('div.pin-card', { hidden: true, role: 'note' }, h('b', { text: s.label }), s.text);
      const b = h(`button${isEnter ? '.enter' : ''}`, { type: 'button', 'aria-expanded': isEnter ? null : 'false', 'data-go': isEnter ? s.go : null, 'aria-label': isEnter ? `Enter: ${s.label}` : `${s.label}: show detail` }, h('i', { text: isEnter ? '+' : String(i + 1) }));
      const wrapS = h('div.pin-spot', { 'data-inert': '' }, b, card, isEnter ? h('span.pin-label', { text: s.label }) : null);
      wrapS.style.pointerEvents = 'auto';
      if (!isEnter) b.addEventListener('click', () => { const open = card.hidden; pinEls.forEach((p) => { if (p.card) { p.card.hidden = true; p.b.setAttribute('aria-expanded', 'false'); } }); card.hidden = !open; b.setAttribute('aria-expanded', String(open)); });
      spots.append(wrapS); pinEls.push({ s, el: wrapS, b, card });
    });
    let zoom = 1, origin = '50% 50%';
    function layout() {
      const W = el.clientWidth || innerWidth, H = el.clientHeight || innerHeight;
      const mobile = W < 760;
      const fx = mobile ? node.fxm ?? node.fx ?? 50 : node.fx ?? 50, fy = node.fy ?? 50;
      if (img && pdata) {
        const r = cover(pdata.w, pdata.h, W, mobile ? H * 0.6 : H, fx, fy);
        Object.assign(img.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
        // layout boxes (not transformed rects) of the overlays a pin must not sit under
        const box = (n) => n && n.offsetParent !== null ? { l: n.offsetLeft, t: n.offsetTop, r: n.offsetLeft + n.offsetWidth, b: n.offsetTop + n.offsetHeight } : null;
        const blocks = [box(wrap), box(panel.el), box(el.querySelector('.credit'))].filter(Boolean);
        pinEls.forEach((p) => {
          const x = r.x + (p.s.x / 100) * r.w, y = r.y + (p.s.y / 100) * r.h;
          p.el.style.left = x + 'px'; p.el.style.top = y + 'px';
          const under = blocks.some((b) => x > b.l - 16 && x < b.r + 16 && y > b.t - 16 && y < b.b + 16);
          p.el.style.display = x < 10 || x > W - 10 || y < 60 || y > H - 20 || under ? 'none' : '';
          p.el.classList.toggle('flip', y > H * 0.6);
        });
      } else pinEls.forEach((p) => (p.el.style.display = 'none'));
    }
    layout(); requestAnimationFrame(layout);
    return {
      resize: layout,
      focusStart: () => focusEl(h1),
      focusChild(id) { const p = pinEls.find((x) => x.s.go === id); const b = p ? p.b : el.querySelector(`.head-actions [data-go="${id}"]`); focusEl(b); pulse(p ? p.el : b); },
      pointFor(id) { const p = pinEls.find((x) => x.s.go === id); const b = p ? p.b : el.querySelector(`[data-go="${id}"]`); if (!b) return null; const r = b.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; },
      wheel(e) {
        if (e.target.closest('.panel')) return false;
        if (e.deltaY < 0 && zoom < 1.6) { zoom = Math.min(1.6, zoom + 0.15); origin = `${e.clientX}px ${e.clientY}px`; }
        else if (e.deltaY > 0 && zoom > 1) zoom = Math.max(1, zoom - 0.15);
        else return e.deltaY < 0;
        inner.style.transformOrigin = origin; inner.style.transform = `scale(${zoom})`; return true;
      },
      arrow(dir, e) { return panel.arrow(dir, e); },
    };
  };

  function placePanel(node, ctx) {
    const tabs = [];
    const story = node.story || [];
    if (story.length) tabs.push(['Story', story.map((p) => h('div.page', null, h('p', { text: p })))]);
    if (node.facts) tabs.push(['Facts', [h('div.page', null, h('dl.facts', null, node.facts.flatMap(([k, v, small]) => [h('dt', { text: k }), h('dd', null, v, small ? h('small', { text: small }) : null)])),
      node.coords ? h('p.mono-label.dim', { style: { marginTop: '14px' }, text: U.fmtCoord(node.coords) }) : null)]]);
    if (node.tips) tabs.push(['Tips', [h('div.page', null, h('ol.tips', null, node.tips.map((t) => h('li', { text: t }))))]]);
    if (node.nearby) tabs.push(['Nearby', [h('div.page', null, h('ul.nearby', null, node.nearby.map((id) => ctx.get(id)).filter(Boolean).map((n) => {
      const km = node.coords && n.coords ? `${Math.round(U.distance(node.coords, n.coords))} km ${U.compass(U.bearing(node.coords, n.coords))}` : '';
      return h('li', null, h('button', { type: 'button', onclick: () => ctx.go(n.id) }, h('span.nb-name', { text: n.title }), h('span.nb-meta', { text: km })));
    })))]]);
    const el = h('div.panel', { 'data-inert': '', role: 'region', 'aria-label': `${node.title}: details` });
    if (!tabs.length) { el.hidden = true; return { el, arrow: () => false }; }
    const tabBar = h('div.tabs', { role: 'tablist' });
    const pagesEl = h('div.pages');
    const prev = h('button.pbtn', { type: 'button', 'aria-label': 'Previous page', text: '‹' });
    const next = h('button.pbtn', { type: 'button', 'aria-label': 'Next page', text: '›' });
    const dots = h('div.dots', { 'aria-hidden': 'true' });
    const pageLbl = h('span.mono-label.dim');
    el.append(tabBar, pagesEl, h('div.pager', null, prev, h('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } }, dots, pageLbl), next));
    let ti = 0, pi = 0;
    const tabBtns = tabs.map(([name], i) => {
      const b = h('button', { type: 'button', role: 'tab', id: `tab-${node.id}-${i}`, 'aria-selected': 'false', 'aria-controls': `tp-${node.id}`, text: name });
      b.addEventListener('click', () => { ti = i; pi = 0; render(); });
      b.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); ti = (ti + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; pi = 0; render(); tabBtns[ti].focus(); } });
      tabBar.append(b); return b;
    });
    pagesEl.id = `tp-${node.id}`; pagesEl.setAttribute('role', 'tabpanel');
    function render() {
      tabBtns.forEach((b, i) => { b.setAttribute('aria-selected', String(i === ti)); b.tabIndex = i === ti ? 0 : -1; });
      pagesEl.setAttribute('aria-labelledby', `tab-${node.id}-${ti}`);
      const pages = tabs[ti][1];
      pagesEl.replaceChildren(pages[pi]);
      prev.disabled = pi === 0 && ti === 0; next.disabled = pi === pages.length - 1 && ti === tabs.length - 1;
      dots.replaceChildren(...pages.map((_, i) => h('i', { class: i === pi ? 'on' : '' })));
      pageLbl.textContent = pages.length > 1 ? `${pi + 1} / ${pages.length}` : tabs[ti][0];
    }
    function step(d) {
      const pages = tabs[ti][1];
      if (pi + d >= 0 && pi + d < pages.length) pi += d;
      else if (ti + d >= 0 && ti + d < tabs.length) { ti += d; pi = d > 0 ? 0 : tabs[ti][1].length - 1; }
      else return false;
      render(); return true;
    }
    prev.addEventListener('click', () => step(-1)); next.addEventListener('click', () => step(1));
    render();
    return { el, arrow: (dir, e) => (e && e.target.closest && e.target.closest('.panel') ? step(dir) : false) };
  }
  ARCH._panel = placePanel;

  // ---------- INSIDE ----------
  ARCH.inside = function (node, el, ctx) {
    const rooms = node.rooms;
    const roomsEl = h('div.rooms', { 'data-empty': '' });
    const roomEls = rooms.map((r) => {
      const im = U.img(r.photo, r.alt, { fx: r.fx, fy: r.fy }) || U.fallback(node.native, node.coords);
      const d = h('div.room', { 'data-empty': '' }, im); im.setAttribute && im.setAttribute('data-empty', ''); roomsEl.append(d); return d;
    });
    const text = h('div.room-text', { 'data-inert': '', 'aria-live': 'polite' });
    const plan = h('div.plan', { 'data-inert': '', role: 'group', 'aria-label': 'Rooms, in walking order' });
    const planBtns = rooms.map((r, i) => {
      const b = h('button', { type: 'button', onclick: () => show(i) }, h('i', { 'aria-hidden': 'true' }), r.name);
      if (i) plan.append(h('span.seg', { 'aria-hidden': 'true' }));
      plan.append(b); return b;
    });
    const h1 = h('h1.title.sr-only', { tabindex: '-1', text: node.title });
    const credit = h('div');
    el.append(roomsEl, h('div.vignette'), h('div.scene-head', { 'data-inert': '' }, h('p.mono-label', { text: node.eyebrow }), h1, h('p.display', { style: { fontSize: 'clamp(22px,3vw,40px)', margin: '6px 0 0', color: 'var(--accent-ink)' }, text: node.big }), h('p.line', { text: node.line })), text, plan, credit);
    let cur = node.start || 0;
    function show(i) {
      cur = U.clamp(i, 0, rooms.length - 1);
      roomEls.forEach((r, j) => r.classList.toggle('on', j === cur));
      planBtns.forEach((b, j) => b.setAttribute('aria-current', String(j === cur)));
      const r = rooms[cur];
      fill(text, h('p.mono-label', { text: `Room ${cur + 1} of ${rooms.length}${r.where ? ' · ' + r.where : ''}` }), h('h2.title', { text: r.name }), ...r.text.map((t) => h('p', { text: t })),
        r.go ? h('div.head-actions', null, h('button.btn', { type: 'button', 'data-go': r.go, text: `Enter · ${ctx.get(r.go).title}` })) : null);
      fill(credit, U.credit(r.photo));
    }
    show(cur);
    return {
      focusStart: () => focusEl(h1),
      focusChild(id) { const i = rooms.findIndex((r) => r.go === id); show(i); const b = text.querySelector(`[data-go="${id}"]`); focusEl(b); pulse(b); },
      pointFor(id) { const i = rooms.findIndex((r) => r.go === id); if (i < 0) return null; show(i); const b = text.querySelector(`[data-go="${id}"]`); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; },
      arrow(dir) { if (cur + dir < 0 || cur + dir >= rooms.length) return false; show(cur + dir); return true; },
    };
  };

  // ---------- CLOSE-UP ----------
  ARCH.closeup = function (node, el, ctx) {
    const pd = U.photo(node.photo);
    const frame = h('div.cu-frame');
    const img = U.img(node.photo, node.alt, { eager: true, sizes: '70vw' });
    if (img) frame.append(img); else frame.append(U.fallback(node.native, node.coords));
    const pins = h('div', { style: { position: 'absolute', inset: '0' } }); frame.append(pins);
    const list = h('div.cu-list', { 'data-inert': '', role: 'list' });
    const { wrap, h1 } = head(node, ctx, { extra: h('div.head-actions', null, node.noHeart ? null : heart(node, ctx), enterButtons(node, ctx)) });
    add(el, h('div.scene-bg', { 'data-empty': '' }), h('div.cu-img', { 'data-empty': '' }, frame), h('div.vignette'), wrap, list, U.credit(node.photo));
    let sel = -1;
    const items = node.notes.map((n, i) => {
      // Notes without a position are list-only (e.g. "Also try" dishes).
      const placed = n.x != null && n.y != null && !!img;
      let pin = null;
      if (placed) {
        pin = h('div.pin-spot', { 'data-inert': '' }, h('button', { type: 'button', 'aria-label': `${i + 1}. ${n.title}`, onclick: () => choose(i) }, h('i', { text: String(i + 1) })));
        pin.style.left = n.x + '%'; pin.style.top = n.y + '%'; pins.append(pin);
      }
      const li = h('button', { type: 'button', role: 'listitem', 'aria-pressed': 'false', class: placed ? null : 'plain', onclick: () => choose(i) }, h('i', { text: placed ? String(i + 1) : '·', 'aria-hidden': 'true' }), h('div', null, h('b', { text: n.title }), h('span', { text: n.text })));
      list.append(li); return { pin, li };
    });
    function choose(i) { sel = i; items.forEach((it, j) => { it.li.setAttribute('aria-pressed', String(j === i)); if (it.pin) it.pin.classList.toggle('pulse', j === i); }); }
    function size() {
      if (!img || !pd) return;
      const ratio = pd.w / pd.h; const box = frame.parentElement;
      const mobile = innerWidth < 760;
      if (mobile) { box.style.paddingTop = (layoutBox(wrap, el).b + 10) + 'px'; box.style.paddingBottom = ((el.clientHeight || innerHeight) - layoutBox(list, el).t + 10) + 'px'; }
      else { box.style.paddingTop = ''; box.style.paddingBottom = ''; }
      const cs = getComputedStyle(box);
      const avail = (box.clientHeight || innerHeight) - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const maxW = mobile ? innerWidth * 0.92 : Math.max(240, box.clientWidth * 0.94), maxH = avail * 0.94;
      let w = maxW, hh = w / ratio; if (hh > maxH) { hh = maxH; w = hh * ratio; }
      Object.assign(frame.style, { width: w + 'px', height: hh + 'px', maxWidth: 'none' }); img.style.width = '100%'; img.style.height = '100%';
    }
    size(); requestAnimationFrame(size);
    return {
      resize: size, focusStart: () => focusEl(h1),
      focusChild(id) { const b = el.querySelector(`[data-go="${id}"]`); focusEl(b); pulse(b); },
      pointFor(id) { const b = el.querySelector(`[data-go="${id}"]`); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; },
      arrow(dir) { const j = sel + dir; if (j < 0 || j >= items.length) return false; choose(j); focusEl(items[j].li); return true; },
    };
  };

  // ---------- STORY ----------
  ARCH.story = function (node, el, ctx) {
    const pages = node.pages;
    const pageEls = pages.map((p, i) => {
      const im = p.photo ? U.img(p.photo, p.alt, { fx: p.fx, fy: p.fy }) : null;
      return h('div.st-page', { 'data-empty': '', 'aria-hidden': 'true' },
        im ? h('div.st-img', { 'data-empty': '' }, im) : null,
        h('div.st-text', { 'data-inert': '' },
          h('p.mono-label', { text: `${node.eyebrow || node.title} · ${i + 1} / ${pages.length}` }),
          p.num ? h('div.big-num', { text: p.num }) : null,
          h('h2.title', { text: p.title }),
          ...p.text.map((t) => h('p', { text: t })),
          p.go ? h('div.head-actions', null, h('button.btn.ghost', { type: 'button', onclick: () => ctx.go(p.go), text: p.goLabel || `Go to ${ctx.get(p.go).title}` })) : null,
          p.photo ? U.credit(p.photo) : null));
    });
    const h1 = h('h1.sr-only', { tabindex: '-1', text: node.title });
    const prev = h('button.pbtn', { type: 'button', 'aria-label': 'Previous page', text: '‹' });
    const next = h('button.pbtn', { type: 'button', 'aria-label': 'Next page', text: '›' });
    const dots = h('div.dots', null, pages.map((p, i) => h('button', { type: 'button', 'aria-label': `Page ${i + 1}: ${p.title}`, onclick: () => show(i) }, h('i'))));
    el.append(h('div.scene-bg', { 'data-empty': '' }), ...pageEls, h('div.vignette'), h1, h('div.st-nav', { 'data-inert': '' }, prev, dots, next));
    let i = 0;
    function show(k) {
      i = U.clamp(k, 0, pages.length - 1);
      pageEls.forEach((p, j) => { p.classList.toggle('on', j === i); p.setAttribute('aria-hidden', String(j !== i)); p.inert = j !== i; });
      [...dots.children].forEach((d, j) => d.setAttribute('aria-current', String(j === i)));
      prev.disabled = i === 0; next.disabled = i === pages.length - 1;
      ctx.announce(`Page ${i + 1} of ${pages.length}: ${pages[i].title}`);
    }
    prev.addEventListener('click', () => show(i - 1)); next.addEventListener('click', () => show(i + 1));
    let sx = null;
    el.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch' && e.clientX > 28 && e.clientX < innerWidth - 28) sx = e.clientX; });
    el.addEventListener('pointerup', (e) => { if (sx != null) { const dx = e.clientX - sx; if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1)); sx = null; } });
    show(0);
    return {
      focusStart: () => focusEl(h1),
      arrow(dir) { if (i + dir < 0 || i + dir >= pages.length) return false; show(i + dir); return true; },
      focusChild(id) { const b = el.querySelector(`[data-go="${id}"]`); focusEl(b || h1); },
      pointFor(id) { const k = pages.findIndex((p) => p.child === id); if (k >= 0) show(k); return null; },
    };
  };

  // ---------- DIAL ----------
  ARCH.dial = function (node, el, ctx) {
    const D = ctx.D;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const end = new Date(today); end.setFullYear(end.getFullYear() + 1);
    const fests = D.festivals.map((f) => ({ ...f, s: new Date(f.start + 'T00:00:00'), e: new Date((f.end || f.start) + 'T23:59:59') }))
      .filter((f) => f.e >= today && f.s < end).sort((a, b) => a.s - b.s);
    const { wrap, h1 } = head(node, ctx);
    const S = 600, C = S / 2, R1 = 270, R0 = 200;
    const sv = svg('svg', { class: 'dial-svg', viewBox: `0 0 ${S} ${S}`, role: 'img', 'aria-label': 'Twelve-month festival wheel starting this month' });
    const ang = (d) => { const t = (d - today) / (end - today); return -90 + t * 360; };
    const pol = (a, r) => [C + r * Math.cos(a * U.RAD), C + r * Math.sin(a * U.RAD)];
    const arc = (a0, a1, r0, r1) => { const [x0, y0] = pol(a0, r1), [x1, y1] = pol(a1, r1), [x2, y2] = pol(a1, r0), [x3, y3] = pol(a0, r0); const L = a1 - a0 > 180 ? 1 : 0; return `M${x0},${y0}A${r1},${r1} 0 ${L} 1 ${x1},${y1}L${x2},${y2}A${r0},${r0} 0 ${L} 0 ${x3},${y3}Z`; };
    const SEASON = { best: ['rgba(228,138,46,0.55)', 'Best: dry and mild'], hot: ['rgba(160,70,40,0.5)', 'Hot: 40 °C and up in the desert'], monsoon: ['rgba(74,101,133,0.65)', 'Monsoon: green, humid, lakes fill'], shoulder: ['rgba(168,134,90,0.5)', 'Warm shoulder months'] };
    for (let m = 0; m < 12; m++) {
      const d0 = new Date(today.getFullYear(), today.getMonth() + m, 1), d1 = new Date(today.getFullYear(), today.getMonth() + m + 1, 1);
      const a0 = Math.max(-90, ang(d0)), a1 = Math.min(270, ang(d1));
      const season = D.seasons[d0.getMonth()];
      sv.append(svg('path', { class: 'month-arc', d: arc(a0, a1 - 0.6, R1 - 14, R1), fill: SEASON[season][0] }));
      sv.append(svg('path', { d: arc(a0, a1 - 0.6, R0, R1 - 18), fill: m % 2 ? 'rgba(242,233,216,0.03)' : 'rgba(242,233,216,0.06)' }));
      const [lx, ly] = pol((a0 + a1) / 2, R1 + 22);
      sv.append(svg('text', { class: 'month-label' + (m === 0 ? ' now' : ''), x: lx, y: ly + 5, 'text-anchor': 'middle' }, d0.toLocaleString('en', { month: 'short' })));
    }
    sv.append(svg('line', { class: 'hand', x1: C, y1: C, x2: C, y2: C - R1 - 8 }));
    sv.append(svg('circle', { cx: C, cy: C, r: R0 - 10, fill: 'rgba(13,10,8,0.6)', stroke: 'rgba(242,233,216,0.1)' }));
    const centerT = svg('text', { x: C, y: C - 6, 'text-anchor': 'middle', class: 'month-label', style: 'font-size:13px' }, 'Next up');
    const centerN = svg('text', { x: C, y: C + 24, 'text-anchor': 'middle', style: 'font: 800 22px var(--f-display); font-stretch:125%; fill: var(--ink)' }, '');
    sv.append(centerT, centerN);
    const card = h('div.dial-card', { 'data-inert': '', 'aria-live': 'polite' });
    const festBtns = [];
    const lanes = [];
    fests.forEach((f, i) => {
      const a = ang(f.s < today ? today : f.s);
      let lane = 0; while (lanes[lane] != null && a - lanes[lane] < 7) lane++; lanes[lane] = a;
      const r = R0 + 22 + (lane % 3) * 15;
      const [x, y] = pol(a, r);
      const g = svg('g', { class: 'fest', tabindex: '0', role: 'button', 'aria-label': `${f.name}, ${fmt(f)}, ${f.place}` });
      g.append(svg('circle', { cx: x, cy: y, r: 7 }));
      g.addEventListener('click', () => choose(i)); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(i); } });
      sv.append(g); festBtns.push(g);
    });
    const key = h('div.season-key', null, Object.values(SEASON).map(([c, t]) => { const [a, b] = t.split(':'); return h('span', null, h('i', { style: { background: c } }), h('b', { text: a }), b ? h('em', { text: ':' + b }) : null); }));
    wrap.append(key);
    el.append(h('div.scene-bg', { 'data-empty': '' }), sv, h('div.vignette'), wrap, card);
    function fmt(f) {
      const o = { day: 'numeric', month: 'short', year: 'numeric' };
      return f.end && f.end !== f.start ? `${f.s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${f.e.toLocaleDateString('en-GB', o)}` : f.s.toLocaleDateString('en-GB', o);
    }
    let sel = 0;
    function choose(i) {
      sel = i; const f = fests[i]; if (!f) return;
      festBtns.forEach((g, j) => g.classList.toggle('sel', j === i));
      const days = Math.ceil((f.s - new Date()) / 86400000);
      const im = f.photo ? U.img(f.photo, f.alt) : null;
      fill(card,
        im ? h('div.dc-img', null, im) : null,
        h('p.countdown', { text: days > 0 ? `In ${days} day${days === 1 ? '' : 's'}` : 'On now' }),
        h('h2.title', { text: f.name }),
        h('p.mono-label', { text: `${fmt(f)} · ${f.place}${f.approx ? ' · approx., confirm locally' : ''}` }),
        h('p', { text: f.text }),
        f.go ? h('button.btn.ghost.small', { type: 'button', onclick: () => ctx.go(f.go), text: `Go to ${ctx.get(f.go).title}` }) : null,
        f.photo ? U.credit(f.photo) : null);
      if (card.querySelector('.credit')) Object.assign(card.querySelector('.credit').style, { position: 'static', textAlign: 'left', maxWidth: 'none', marginTop: '8px' });
    }
    function layout() {
      const W = el.clientWidth || innerWidth, H = el.clientHeight || innerHeight;
      if (W >= 760) { sv.style.removeProperty('width'); sv.style.removeProperty('height'); sv.style.removeProperty('top'); return; }
      const top = layoutBox(wrap, el).b + 14, bottom = layoutBox(card, el).t - 12;
      const size = Math.max(150, Math.min(W * 0.9, bottom - top));
      Object.assign(sv.style, { width: size + 'px', height: size + 'px', top: (top + Math.max(size, bottom - top) / 2) + 'px' });
    }
    const nextI = fests.findIndex((f) => f.e >= new Date());
    if (fests[nextI]) centerN.textContent = fests[nextI].name.length > 18 ? fests[nextI].name.split(' ')[0] : fests[nextI].name;
    choose(Math.max(0, nextI));
    layout(); requestAnimationFrame(layout);
    return {
      resize: layout,
      focusStart: () => focusEl(h1),
      arrow(dir) { const j = sel + dir; if (j < 0 || j >= fests.length) return false; choose(j); focusEl(festBtns[j]); return true; },
    };
  };

  // ---------- SKY ----------
  ARCH.sky = function (node, el, ctx) {
    const D = ctx.D; const [lat, lon] = node.coords; const tz = D.meta.tz;
    const canvas = h('canvas.fill', { 'data-empty': '', 'aria-hidden': 'true' });
    const { wrap, h1 } = head(node, ctx);
    const presets = h('div.sky-presets', { 'data-inert': '', role: 'group', 'aria-label': 'Time of day' });
    const facts = h('div.sky-facts', { 'data-inert': '' }, node.facts.map(([b, s]) => h('div', null, h('b', { text: b }), h('span', { text: s }))));
    el.append(canvas, h('div.vignette'), wrap, presets, facts);
    // find today's local times for each preset by scanning the sun's altitude
    const base = new Date();
    const scan = (pred) => { for (let m = 0; m < 1440; m += 5) { const d = SKY.atLocalHour(m / 60, tz, base); const s = SKY.sun(d, lat, lon); if (pred(s, m)) return d; } return SKY.atLocalHour(12, tz, base); };
    const P = {
      Dawn: scan((s, m) => m < 720 && s.alt > -5),
      'Golden hour': scan((s, m) => m > 720 && s.alt < 6),
      Night: SKY.atLocalHour(23.5, tz, base),
    };
    let when = P.Night;
    Object.keys(P).forEach((k) => presets.append(h('button.chip', { type: 'button', 'aria-pressed': String(k === 'Night'), text: k, onclick: (e) => { when = P[k]; [...presets.children].forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget))); } })));
    const g = canvas.getContext('2d'); let W, H, dpr, raf = 0, paused = false;
    const stars = SKY.stars(1100, 21);
    const rnd = U.rng(5); const mw = Array.from({ length: 1600 }, () => ({ t: rnd(), o: (rnd() - 0.5) * (rnd() * 0.18), m: rnd() }));
    function resize() { W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight; dpr = Math.min(devicePixelRatio || 1, 1.75); canvas.width = W * dpr; canvas.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function draw(t) {
      raf = requestAnimationFrame(draw); if (paused) return;
      const sun = SKY.sun(when, lat, lon), moon = SKY.moon(when, lat, lon), [cz, cm, chz] = SKY.colors(sun.alt);
      const hy = H * 0.72;
      const gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, cz); gr.addColorStop(0.6, cm); gr.addColorStop(1, chz);
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      const sa = SKY.starAlpha(sun.alt);
      if (sa > 0.02) {
        for (const p of mw) { const x = p.t * W, y = hy * (0.95 - p.t * 0.85) + p.o * H; g.fillStyle = `rgba(255,240,220,${sa * 0.05 * p.m})`; g.fillRect(x, y, 3, 3); }
        for (const s of stars) { const x = (s.b / 360) * W, y = hy - (s.a / 82) * hy; const a = sa * (0.2 + 0.8 * s.m) * (U.reduced() ? 1 : 0.85 + 0.15 * Math.sin(t / 700 + s.tw)); g.fillStyle = `rgba(255,248,235,${a})`; g.fillRect(x, y, s.m > 0.95 ? 2.2 : 1.1, s.m > 0.95 ? 2.2 : 1.1); }
      }
      const glow = SKY.glow(sun.alt);
      if (glow > 0.01) { const x = sun.az > 180 ? W * 0.78 : W * 0.22; const rg = g.createRadialGradient(x, hy, 0, x, hy, W * 0.5); rg.addColorStop(0, `rgba(235,135,60,${0.6 * glow})`); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, hy); }
      if (moon.alt > 0) SKY.drawMoon(g, W * (0.15 + 0.7 * ((moon.az - 60) / 240)), hy - (moon.alt / 90) * hy * 0.9, 14, moon.phase);
      // dunes
      [['#120d0a', 0.0, 26, 0.004], ['#0b0806', 0.06, 40, 0.0028], ['#060403', 0.14, 60, 0.0018]].forEach(([c, off, amp, f], i) => {
        g.fillStyle = c; g.beginPath(); g.moveTo(0, H);
        for (let x = 0; x <= W + 6; x += 6) g.lineTo(x, hy + off * H - amp * (0.6 + 0.4 * Math.sin(x * f + i * 2) + 0.25 * Math.sin(x * f * 2.7 + i)));
        g.lineTo(W, H); g.fill();
      });
    }
    resize(); raf = requestAnimationFrame(draw);
    return { destroy() { cancelAnimationFrame(raf); }, resize, pause() { paused = true; }, resume() { paused = false; }, focusStart: () => focusEl(h1) };
  };

  // ---------- CONSTELLATION ----------
  ARCH.constellation = function (node, el, ctx) {
    const { wrap, h1 } = head(node, ctx);
    const sv = svg('svg', { class: 'const-svg', 'data-empty': '', 'aria-hidden': 'true' });
    const layer = h('div', { style: { position: 'absolute', inset: '0', zIndex: 5, pointerEvents: 'none' } });
    const card = h('div.const-card', { hidden: true, 'data-inert': '', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': `cc-${node.id}` });
    el.append(h('canvas.fill', { 'data-empty': '' }), sv, h('div.vignette'), layer, wrap, card);
    const canvas = el.querySelector('canvas'); const g = canvas.getContext('2d');
    const stars = SKY.stars(500, 33);
    const btns = node.stars.map((s, i) => {
      const lbl = s.num ? h('span.lbl.two', { 'aria-hidden': 'true' }, h('b', { text: s.num }), h('span', { text: s.label })) : h('span.lbl', { text: s.name, 'aria-hidden': 'true' });
      const b = h('button.hs.theme.anch', { type: 'button', 'aria-label': `${s.name}: ${s.group}`, 'aria-haspopup': 'dialog', onclick: () => open(i) }, h('span.dot', { 'aria-hidden': 'true' }), lbl);
      b.style.pointerEvents = 'auto'; layer.append(b); return b;
    });
    let W, H, sel = -1;
    function layout() {
      W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight; const dpr = Math.min(devicePixelRatio || 1, 1.75);
      canvas.width = W * dpr; canvas.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#05060c'); gr.addColorStop(1, '#120c0a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (const s of stars) { g.fillStyle = `rgba(255,246,228,${0.15 + 0.6 * s.m})`; g.fillRect((s.b / 360) * W, (s.a / 82) * H, s.m > 0.95 ? 2 : 1, s.m > 0.95 ? 2 : 1); }
      const mobile = W < 760;
      const top = mobile ? Math.min(H * 0.45, layoutBox(wrap, el).b + 56) : 0;
      const pos = (s) => [mobile ? 0.12 * W + (s.mx ?? s.x) * 0.72 * W : 0.36 * W + s.x * 0.56 * W, mobile ? top + (s.my ?? s.y) * (H - 110 - top) : 0.2 * H + s.y * 0.66 * H];
      sv.replaceChildren();
      for (const [a, b] of node.links) { const A = pos(node.stars[a]), B = pos(node.stars[b]); sv.append(svg('line', { class: 'link', x1: A[0], y1: A[1], x2: B[0], y2: B[1] })); }
      for (const grp of node.groups) { const ss = node.stars.filter((s) => s.group === grp.name).map(pos); const cx = ss.reduce((a, p) => a + p[0], 0) / ss.length, top = Math.min(...ss.map((p) => p[1])); sv.append(svg('text', { class: 'group-label', x: cx, y: top - 34, 'text-anchor': 'middle' }, grp.name)); }
      node.stars.forEach((s, i) => { const [x, y] = pos(s); btns[i].style.left = x + 'px'; btns[i].style.top = y + 'px'; btns[i]._xy = [x, y]; btns[i]._x = x; btns[i]._y = y; });
      if (el.isConnected) placeLabels(el, btns, [wrap], W); else requestAnimationFrame(() => el.isConnected && layout());
      if (sel >= 0) placeCard();
    }
    function placeCard() {
      const [x, y] = btns[sel]._xy; const cw = Math.min(380, W * 0.86), ch = card.offsetHeight || 380;
      if (W < 760) { Object.assign(card.style, { left: '50%', top: 'auto', bottom: '66px', transform: 'translateX(-50%)' }); return; }
      Object.assign(card.style, { left: U.clamp(x + (x > W * 0.6 ? -cw - 30 : 30), 20, W - cw - 60) + 'px', top: U.clamp(y - ch / 2, 80, H - ch - 90) + 'px', bottom: 'auto', transform: 'none' });
    }
    function open(i) {
      sel = i; const s = node.stars[i];
      btns.forEach((b, j) => b.classList.toggle('pulse', j === i));
      const close = h('button.hbtn.close', { type: 'button', 'aria-label': 'Close', onclick: () => { card.hidden = true; btns[i].classList.remove('pulse'); focusEl(btns[i]); } }, svg('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, svg('path', { d: 'M6 6l12 12M18 6 6 18' })));
      const im = s.photo ? U.img(s.photo, s.alt) : null;
      fill(card, close, im ? h('div.cc-img', null, im) : null, h('div.cc-body', null,
        h('p.mono-label', { text: s.group }), h('h2.title', { id: `cc-${node.id}`, text: s.name }), ...s.text.map((t) => h('p', { text: t })),
        s.where ? h('p.mono-label', { text: `Where: ${s.whereText || ctx.get(s.where).title}` }) : null,
        s.where ? h('button.btn.ghost.small', { type: 'button', onclick: () => ctx.go(s.where), text: `Go to ${ctx.get(s.where).title}` }) : null,
        s.photo && U.photo(s.photo) ? h('div.cc-credit', null, U.credit(s.photo)) : null));
      card.hidden = false; placeCard(); requestAnimationFrame(placeCard);
    }
    layout();
    return {
      resize: layout, focusStart: () => focusEl(h1),
      arrow(dir) { const j = (sel < 0 ? (dir > 0 ? -1 : 0) : sel) + dir; if (j < 0 || j >= btns.length) return false; open(j); focusEl(btns[j]); return true; },
    };
  };

  // ---------- PROFILE ----------
  ARCH.profile = function (node, el, ctx) {
    const pf = node.profile; const { wrap, h1 } = head(node, ctx);
    const sv = svg('svg', { class: 'profile-svg', role: 'img', 'aria-labelledby': `pf-t-${node.id}`, preserveAspectRatio: 'none' });
    const ctl = h('div.profile-ctl', { 'data-inert': '', role: 'group', 'aria-label': 'Vertical scale' });
    let ex = pf.exaggeration;
    [[pf.exaggeration, `Stretched ×${pf.exaggeration}`], [1, 'True scale']].forEach(([v, t]) => ctl.append(h('button.chip', { type: 'button', 'aria-pressed': String(v === ex), text: t, onclick: (e) => { ex = v; [...ctl.children].forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget))); draw(); } })));
    const desc = h('p.sr-only', { id: `pf-t-${node.id}`, text: `Cross-section: ${pf.stops.map((s) => `${s.name} ${s.elev} m`).join(', ')}.` });
    el.append(h('div.scene-bg', { 'data-empty': '' }), sv, h('div.vignette'), wrap, ctl, desc);
    function draw() {
      const W = el.clientWidth || innerWidth, H = el.clientHeight || innerHeight;
      const mobile = W < 760;
      const top = mobile ? Math.min(H * 0.5, layoutBox(wrap, el).b + 30) : H * 0.42, bottom = H - (mobile ? 120 : 110), ph = Math.max(140, bottom - top);
      sv.setAttribute('viewBox', `0 0 ${W} ${ph}`); sv.style.height = ph + 'px'; sv.style.top = top + 'px';
      const x0 = W < 760 ? 18 : 60, x1 = W - (W < 760 ? 36 : 90), km = pf.stops[pf.stops.length - 1].km;
      const kmPx = (x1 - x0) / km;
      const maxE = 1800; const base = ph - 34;
      // the stretched view fills the height; the button states the factor that results
      const fit = Math.max(10, Math.floor(((base - 40) / maxE) / (kmPx / 1000) / 10) * 10);
      const vScale = ex === 1 ? kmPx / 1000 : (kmPx / 1000) * Math.min(fit, mobile ? 300 : pf.exaggeration);
      ctl.firstChild.textContent = `Stretched ×${Math.min(fit, mobile ? 300 : pf.exaggeration)}`;
      const X = (k) => x0 + k * kmPx, Y = (m) => base - m * vScale;
      sv.replaceChildren(svg('defs', null, svg('linearGradient', { id: 'pf-grad', x1: 0, y1: 0, x2: 0, y2: 1 }, svg('stop', { offset: 0, 'stop-color': 'rgba(228,138,46,0.5)' }), svg('stop', { offset: 1, 'stop-color': 'rgba(228,138,46,0.02)' }))));
      const pts = pf.terrain.map(([k, m]) => `${X(k).toFixed(1)},${Y(m).toFixed(1)}`);
      sv.append(svg('path', { class: 'terrain', d: `M${X(0)},${base} L${pts.join(' L')} L${X(km)},${base} Z` }));
      const ax = svg('g', { class: 'axis' });
      ax.append(svg('line', { x1: x0, x2: x1, y1: base, y2: base }));
      [0, 500, 1000, 1500].forEach((m) => { if (Y(m) < 0) return; ax.append(svg('line', { x1: x0, x2: x1, y1: Y(m), y2: Y(m), 'stroke-dasharray': '2 6' })); if (m !== 500) ax.append(svg('text', { x: mobile ? x0 : x1, y: Y(m) - 4, 'text-anchor': mobile ? 'start' : 'end' }, `${m} m`)); });
      for (let k = 0; k <= km; k += 100) ax.append(svg('text', { x: X(k), y: base + 16, 'text-anchor': 'middle' }, `${k} km`));
      sv.append(ax);
      const placed = [];
      pf.stops.forEach((s, i) => {
        const g2 = svg('g', { class: 'stop' }); const x = X(s.km), y = Y(s.elev);
        // lift each label until it clears the ones already placed
        const lw = Math.max(s.name.length, 9) * (mobile ? 6.6 : 7.4) + 10;
        const lx0 = mobile && i === 0 ? x - 4 : mobile && i === pf.stops.length - 1 ? x - lw + 4 : x - lw / 2;
        let ly = Math.max(24, y - 30);
        for (let tries = 0; tries < 12 && placed.some((q) => lx0 < q.r && lx0 + lw > q.l && Math.abs(q.y - ly) < 26); tries++) ly -= 26;
        ly = Math.max(24, ly); placed.push({ l: lx0, r: lx0 + lw, y: ly });
        const anchor = mobile && i === 0 ? 'start' : mobile && i === pf.stops.length - 1 ? 'end' : 'middle';
        const tx = anchor === 'start' ? x - 4 : anchor === 'end' ? x + 4 : x;
        g2.append(svg('line', { x1: x, x2: x, y1: y, y2: ly + 4 }), svg('circle', { cx: x, cy: y, r: 3.5 }),
          svg('text', { x: tx, y: ly - 10, 'text-anchor': anchor }, mobile ? s.name.replace(' (Chambal)', '') : s.name), svg('text', { class: 'sub', x: tx, y: ly + 2, 'text-anchor': anchor }, `${s.elev.toLocaleString('en')} m${s.approx ? (mobile ? '~' : ' approx.') : ''}`));
        sv.append(g2);
      });
      // reference: a familiar height for comparison, drawn at the same vertical scale
      pf.refs.forEach((r, i) => {
        const x = r.km != null ? X(r.km) : x1 - 24 - i * 34, hpx = r.h * vScale;
        const g3 = svg('g', { class: 'ref' }); g3.append(svg('rect', { x: x - 6, y: base - hpx, width: 12, height: hpx }));
        // on phones the label runs up the bar, so the two never collide
        g3.append(mobile ? svg('text', { x: x + 10, y: base - 4, transform: `rotate(-90 ${x + 10} ${base - 4})` }, r.name) : svg('text', { x: x, y: base - hpx - 6, 'text-anchor': 'middle' }, r.name));
        sv.append(g3);
      });
    }
    draw(); requestAnimationFrame(draw);
    return { resize: draw, focusStart: () => focusEl(h1) };
  };

  // ---------- LIGHTBOX ----------
  ARCH.lightbox = function (node, el, ctx) {
    const items = ctx.D.gallery().filter((it) => U.photo(it.slot));
    const imgBox = h('div.lb-img', { 'data-empty': '' });
    const cap = h('div.lb-cap', { 'data-inert': '', 'aria-live': 'polite' });
    const h1 = h('h1.sr-only', { tabindex: '-1', text: node.title });
    const prev = h('button.hbtn.big.lb-nav.prev', { type: 'button', 'aria-label': 'Previous photo', onclick: () => show(i - 1) }, svg('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, svg('path', { d: 'M15 5 8 12l7 7' })));
    const next = h('button.hbtn.big.lb-nav.next', { type: 'button', 'aria-label': 'Next photo', onclick: () => show(i + 1) }, svg('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, svg('path', { d: 'M9 5l7 7-7 7' })));
    const { wrap } = head(node, ctx);
    wrap.querySelector('h1').remove(); wrap.prepend(h1);
    el.append(h('div.scene-bg', { 'data-empty': '' }), imgBox, h('div.vignette'), cap, prev, next);
    let i = 0;
    function show(k) {
      if (!items.length) { imgBox.replaceChildren(h('p.empty', { text: 'Photos are on their way.' })); return; }
      i = (k + items.length) % items.length; const it = items[i]; const p = U.photo(it.slot);
      const im = U.img(it.slot, it.alt || p.alt, { eager: true, sizes: '90vw' }); fill(imgBox, im);
      U.preload(items[(i + 1) % items.length].slot);
      fill(cap, h('p.lb-count', { text: `${i + 1} / ${items.length}` }), h('p.title', { style: { fontSize: '20px', margin: '4px 0' }, text: it.caption }),
        U.credit(it.slot) || '', it.go ? h('button.btn.ghost.small', { type: 'button', onclick: () => ctx.go(it.go), text: `Go to ${ctx.get(it.go).title}` }) : null);
      const cr = cap.querySelector('.credit'); if (cr) Object.assign(cr.style, { position: 'static', textAlign: 'center', maxWidth: 'none', margin: '0 0 8px' });
    }
    let sx = null;
    imgBox.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    imgBox.addEventListener('pointerup', (e) => { if (sx != null && Math.abs(e.clientX - sx) > 50) { show(i + (e.clientX < sx ? 1 : -1)); } sx = null; });
    show(0);
    return { focusStart: () => focusEl(h1), arrow(dir) { show(i + dir); return true; } };
  };
})();
