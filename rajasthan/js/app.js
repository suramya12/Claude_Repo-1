/* Engine: scene graph, router, camera transitions, HUD and input.
   Country-specific content comes from window.RJ (data.js); scene layouts from window.ARCH. */
(function () {
  'use strict';
  const { h, store } = U;
  const D = window.RJ;
  const app = document.getElementById('app');
  const stage = document.getElementById('main');
  const live = document.getElementById('live');

  // ---------------- scene graph ----------------
  const nodes = new Map();
  for (const n of D.nodes) nodes.set(n.id, { ...n, children: [] });
  for (const n of nodes.values()) {
    if (n.parent) {
      const p = nodes.get(n.parent);
      if (!p) { console.warn('Missing parent', n.parent, 'for', n.id); continue; }
      p.children.push(n.id);
    }
  }
  const rootId = D.nodes[0].id;
  const viewer = [D.meta.viewer.lat, D.meta.viewer.lon];
  const depthOf = (id) => { let d = 1, n = nodes.get(id); while (n && n.parent) { d++; n = nodes.get(n.parent); } return d; };
  const pathOf = (id) => { const p = []; let n = nodes.get(id); while (n) { p.unshift(n.id); n = n.parent ? nodes.get(n.parent) : null; } return p; };
  const maxDepthUnder = (id) => { const n = nodes.get(id); return n.children.length ? Math.max(...n.children.map(maxDepthUnder)) : depthOf(id); };
  const treeMax = maxDepthUnder(rootId);
  const coordsOf = (id) => { let n = nodes.get(id); while (n) { if (n.coords) return n.coords; n = n.parent ? nodes.get(n.parent) : null; } return null; };
  // Horizon geometry is computed from real coordinates, so the compass tells the truth.
  for (const n of nodes.values()) {
    if (n.band === 'horizon' && n.coords) { n.bearing = U.bearing(viewer, n.coords); n.distance = U.distance(viewer, n.coords); }
  }
  /** Depth gauge: current depth against the deepest point of this branch (the child of the panorama it hangs from). */
  function branchInfo(id) {
    const p = pathOf(id); const d = p.length;
    if (d <= 2) return { d, max: treeMax };
    return { d, max: maxDepthUnder(p[2]) };
  }
  const siblingsOf = (id) => {
    const n = nodes.get(id); if (!n || !n.parent) return [];
    return nodes.get(n.parent).children.filter((c) => nodes.get(c).archetype === n.archetype && !nodes.get(c).noSibling);
  };

  // ---------------- state ----------------
  const cam = { nodeId: null, yaw: {}, zoom: {} };
  let cur = null; // { id, el, inst }
  let busy = false; let queued = null;
  const saved = new Set(store.get('rj.saved', []));

  const ctx = {
    D, nodes, viewer, depthOf, pathOf, coordsOf, siblingsOf, cam,
    get: (id) => nodes.get(id),
    go: (id, o) => go(id, o),
    out: () => zoomOut(),
    isSaved: (id) => saved.has(id),
    toggleSave(id) {
      saved.has(id) ? saved.delete(id) : saved.add(id);
      store.set('rj.saved', [...saved]); updateSaved();
      const on = saved.has(id); announce(`${nodes.get(id).title} ${on ? 'saved' : 'removed from saved places'}`);
      return on;
    },
    saved: () => [...saved].filter((id) => nodes.has(id)),
    announce: (t) => announce(t),
    toast: (t, o) => toast(t, o),
    preload(id) { const n = nodes.get(id); if (n) (n.photos || [n.photo]).forEach(U.preload); },
  };
  window.RJ_CTX = ctx;

  // ---------------- mounting ----------------
  function mount(id) {
    const n = nodes.get(id);
    const el = h('section.scene', { 'data-empty': '', 'data-id': id, 'aria-label': n.title });
    el.classList.add(n.archetype);
    const make = window.ARCH[n.archetype] || window.ARCH.fallback;
    let inst;
    try { inst = make(n, el, ctx) || {}; }
    catch (e) { console.error('Scene failed', id, e); el.replaceChildren(); inst = window.ARCH.fallback(n, el, ctx); }
    inst.el = el;
    return inst;
  }

  // ---------------- transitions ----------------
  const DUR = 850, EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
  function anim(el, frames, dur) { return el.animate(frames, { duration: dur, easing: EASE, fill: 'both' }).finished.catch(() => {}); }
  function center() { return { x: innerWidth / 2, y: innerHeight * 0.5 }; }

  async function transition(oldEl, newEl, kind, pt, dir) {
    pt = pt || center();
    const origin = `${Math.round(pt.x)}px ${Math.round(pt.y)}px`;
    newEl.style.transformOrigin = origin; if (oldEl) oldEl.style.transformOrigin = origin;
    if (!oldEl) { await anim(newEl, [{ opacity: 0 }, { opacity: 1 }], U.reduced() ? 200 : 700); return; }
    oldEl.classList.add('leaving');
    if (U.reduced()) {
      await Promise.all([anim(oldEl, [{ opacity: 1 }, { opacity: 0 }], 200), anim(newEl, [{ opacity: 0 }, { opacity: 1 }], 200)]);
      return;
    }
    if (kind === 'in') {
      stage.append(newEl);
      await Promise.all([
        anim(oldEl, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(3.2)', opacity: 0.4, offset: 0.6 }, { transform: 'scale(5)', opacity: 0 }], DUR),
        anim(newEl, [{ transform: 'scale(0.16)', opacity: 0 }, { transform: 'scale(0.45)', opacity: 0.55, offset: 0.45 }, { transform: 'scale(1)', opacity: 1 }], DUR),
      ]);
    } else if (kind === 'out' || kind === 'up') {
      const k = kind === 'up' ? 7 : 5;
      stage.prepend(newEl);
      await Promise.all([
        anim(oldEl, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0.45)', opacity: 0.55, offset: 0.55 }, { transform: 'scale(0.16)', opacity: 0 }], DUR + (kind === 'up' ? 150 : 0)),
        anim(newEl, [{ transform: `scale(${k})`, opacity: 0 }, { transform: `scale(${k * 0.45})`, opacity: 0.4, offset: 0.4 }, { transform: 'scale(1)', opacity: 1 }], DUR + (kind === 'up' ? 150 : 0)),
      ]);
    } else if (kind === 'side') {
      const s = dir > 0 ? 1 : -1;
      await Promise.all([
        anim(oldEl, [{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${-22 * s}%)`, opacity: 0 }], 650),
        anim(newEl, [{ transform: `translateX(${22 * s}%)`, opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], 650),
      ]);
    } else { // jump: up through the tree and down again, as one move
      newEl.style.transformOrigin = '50% 50%'; oldEl.style.transformOrigin = '50% 50%';
      await Promise.all([
        anim(oldEl, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0.3)', opacity: 0 }], 520),
        anim(newEl, [{ transform: 'scale(0.3)', opacity: 0, offset: 0 }, { transform: 'scale(0.3)', opacity: 0, offset: 0.35 }, { transform: 'scale(1)', opacity: 1 }], 1000),
      ]);
    }
  }

  function relation(from, to) {
    const a = nodes.get(from), b = nodes.get(to);
    if (b.parent === from) return 'child';
    if (a.parent === to) return 'parent';
    if (a.parent && a.parent === b.parent && a.archetype === b.archetype) return 'sibling';
    const pb = pathOf(to); if (pb.includes(from)) return 'down';
    const pa = pathOf(from); if (pa.includes(to)) return 'up';
    return 'jump';
  }

  /** Navigate. opts: { from: Element|point, push: bool, focus: 'start'|'child' } */
  async function navigate(id, opts = {}) {
    if (!nodes.has(id)) id = rootId;
    if (busy) { queued = [id, opts]; return; }
    if (cur && cur.id === id) return;
    busy = true;
    try {
      const prev = cur;
      const rel = prev ? relation(prev.id, id) : 'first';
      if (opts.push !== false && prev) history.pushState({ id }, '', '#' + id);
      cam.nodeId = id;
      const inst = mount(id);
      const el = inst.el;
      let kind = 'in', pt = null, dir = 0;
      if (rel === 'child' || rel === 'down') {
        kind = 'in';
        const step = pathOf(id)[depthOf(prev.id)];
        pt = pointOf(opts.from) || (prev.inst.pointFor && prev.inst.pointFor(step, true)) || null;
      } else if (rel === 'parent' || rel === 'up') {
        kind = rel === 'parent' ? 'out' : 'up';
        const childOnPath = pathOf(prev.id)[depthOf(id)];
        stage.prepend(el); // must be laid out before asking where the child sits
        pt = (inst.pointFor && inst.pointFor(childOnPath, false)) || null;
      } else if (rel === 'sibling') {
        kind = 'side';
        const sib = siblingsOf(prev.id); dir = opts.dir || (sib.indexOf(id) > sib.indexOf(prev.id) ? 1 : -1);
        stage.append(el);
      } else if (rel === 'jump') { kind = 'jump'; stage.append(el); }
      if (!el.isConnected) stage.append(el);
      if (inst.enter) inst.enter();
      cur = { id, el, inst };
      updateHUD(id);
      await transition(prev && prev.el, el, kind, pt, dir);
      el.getAnimations().forEach((a) => a.cancel());
      el.style.transform = ''; el.style.opacity = '';
      if (prev) { try { prev.inst.destroy && prev.inst.destroy(); } catch (e) { console.error(e); } prev.el.remove(); }
      // focus + announce
      const { d, max } = branchInfo(id);
      const verb = { child: 'Zoomed into', down: 'Flew down to', parent: 'Zoomed out to', up: 'Climbed up to', sibling: 'Moved to', jump: 'Flew to', first: 'Opened' }[rel];
      announce(`${verb} ${nodes.get(id).title}, depth ${d} of ${max}`);
      if ((rel === 'parent' || rel === 'up') && inst.focusChild) inst.focusChild(pathOf(prev.id)[depthOf(id)]);
      else if (inst.focusStart) inst.focusStart(); else stage.focus({ preventScroll: true });
      // preload children photos
      nodes.get(id).children.forEach((c) => ctx.preload(c));
    } finally {
      busy = false;
      if (queued) { const q = queued; queued = null; navigate(q[0], q[1]); }
    }
  }
  function pointOf(from) {
    if (!from) return null;
    if (from.x != null) return from;
    if (from.getBoundingClientRect) { const r = from.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
    return null;
  }
  const go = (id, o = {}) => navigate(id, o);
  function zoomOut() { if (!cur) return; const n = nodes.get(cur.id); if (n.parent) navigate(n.parent); }
  function home() { const pano = D.nodes[1].id; if (cur && cur.id !== pano) navigate(pano); }
  function sibling(dir) {
    if (!cur) return false;
    const s = siblingsOf(cur.id); if (s.length < 2) return false;
    const i = s.indexOf(cur.id); const j = i + dir;
    if (j < 0 || j >= s.length) return false;
    navigate(s[j], { dir }); return true;
  }

  // ---------------- HUD ----------------
  const crumbs = document.getElementById('crumbs');
  function updateHUD(id) {
    const n = nodes.get(id);
    app.dataset.archetype = n.archetype;
    document.title = id === rootId ? `${D.meta.name} Panorama` : `${n.title} · ${D.meta.name}`;
    // breadcrumb
    const p = pathOf(id);
    const item = (pid, last) => last
      ? h('li', { 'aria-current': 'page' }, h('span', { text: nodes.get(pid).title }))
      : h('li', null, h('button', { type: 'button', text: nodes.get(pid).crumb || nodes.get(pid).title, onclick: () => navigate(pid) }));
    crumbs.replaceChildren();
    if (p.length >= 5) {
      const mid = p.slice(1, -2);
      const list = h('ol.more-list', { hidden: true, id: 'crumb-more' }, mid.map((pid) => h('li', null, h('button', { type: 'button', text: nodes.get(pid).title, onclick: () => navigate(pid) }))));
      const btn = h('button', { type: 'button', 'aria-expanded': 'false', 'aria-controls': 'crumb-more', 'aria-label': `Show ${mid.length} hidden levels`, text: '…' });
      btn.addEventListener('click', (e) => { e.stopPropagation(); const o = list.hidden; list.hidden = !o; btn.setAttribute('aria-expanded', String(o)); });
      crumbs.append(item(p[0]), h('li.more', null, btn, list), item(p[p.length - 2]), item(p[p.length - 1], true));
    } else p.forEach((pid, i) => crumbs.append(item(pid, i === p.length - 1)));
    // gauge
    const { d, max } = branchInfo(id);
    const pct = max > 1 ? ((d - 1) / (max - 1)) * 100 : 0;
    document.getElementById('gauge-fill').style.height = pct + '%';
    document.getElementById('gauge-mark').style.top = pct + '%';
    document.getElementById('gauge-label').textContent = `depth ${d} of ${max}`;
    // minimap
    const c = id === D.nodes[1].id ? viewer : coordsOf(id);
    const dot = document.getElementById('mm-dot'), ring = document.getElementById('mm-ring');
    if (c && mm) { const [x, y] = mm(c); dot.setAttribute('cx', x); dot.setAttribute('cy', y); ring.setAttribute('cx', x); ring.setAttribute('cy', y); dot.style.display = ring.style.display = ''; }
    else { dot.style.display = ring.style.display = 'none'; }
    // siblings
    const s = siblingsOf(id); const i = s.indexOf(id);
    const prev = document.getElementById('sib-prev'), next = document.getElementById('sib-next');
    const set = (b, tid, label) => {
      b.disabled = !tid; b.onclick = tid ? () => sibling(label === 'Previous' ? -1 : 1) : null;
      b.querySelector('.sib-name').textContent = tid ? nodes.get(tid).title : '';
      b.setAttribute('aria-label', tid ? `${label}: ${nodes.get(tid).title} (${label === 'Previous' ? 'left' : 'right'} arrow)` : `No ${label.toLowerCase()} place`);
    };
    set(prev, s.length > 1 && i > 0 ? s[i - 1] : null, 'Previous');
    set(next, s.length > 1 && i < s.length - 1 ? s[i + 1] : null, 'Next');
  }
  let mm = null;
  (function minimap() {
    const g = window.RJ_GEO && window.RJ_GEO[D.meta.geoKey];
    if (!g) return;
    const rings = g.type === 'Polygon' ? [g.coordinates[0]] : g.coordinates.map((p) => p[0]);
    const pts = rings.flat();
    const lat0 = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    const k = Math.cos(lat0 * U.RAD);
    const xs = pts.map((p) => p[0] * k), ys = pts.map((p) => -p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const s = 92 / Math.max(x1 - x0, y1 - y0), ox = (100 - (x1 - x0) * s) / 2, oy = (100 - (y1 - y0) * s) / 2;
    mm = ([lat, lon]) => [ox + (lon * k - x0) * s, oy + (-lat - y0) * s];
    document.getElementById('mm-outline').setAttribute('d', rings.map((r) => 'M' + r.map(([lo, la]) => mm([la, lo]).map((v) => v.toFixed(1)).join(',')).join('L') + 'Z').join(''));
  })();
  function updateSaved() {
    const n = ctx.saved().length; const c = document.getElementById('saved-count'); const b = document.getElementById('btn-saved');
    c.textContent = n; c.hidden = !n; b.classList.toggle('has', n > 0);
    b.setAttribute('aria-label', n ? `Saved places (${n})` : 'Saved places');
  }
  function announce(t) { live.textContent = ''; setTimeout(() => (live.textContent = t), 30); }
  let toastT = 0;
  function toast(text, o = {}) {
    const t = document.getElementById('toast'); t.replaceChildren(h('div', { text }));
    if (o.select) { const inp = h('input', { type: 'text', value: o.select, readonly: true, 'aria-label': 'Link to this view' }); t.append(inp); setTimeout(() => { inp.focus(); inp.select(); }, 30); }
    t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), o.select ? 7000 : 2600);
  }

  // ---------------- input ----------------
  let down = null, moved = false;
  const pointers = new Map(); let pinch0 = 0, pinchRatio = 1;
  stage.addEventListener('pointerdown', (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) { down = { x: e.clientX, y: e.clientY, t: performance.now(), edge: e.pointerType === 'touch' && (e.clientX < 28 || e.clientX > innerWidth - 28) }; moved = false; }
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); pinchRatio = 1; }
  });
  window.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) moved = true;
    if (pointers.size === 2 && pinch0) {
      const [a, b] = [...pointers.values()]; pinchRatio = Math.hypot(a.x - b.x, a.y - b.y) / pinch0;
      if (cur && cur.inst.pinch) cur.inst.pinch(pinchRatio, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, false);
    }
  });
  const endPointer = (e) => {
    if (!pointers.has(e.pointerId)) return;
    if (pointers.size === 2 && pinch0) {
      const consumed = cur && cur.inst.pinch && cur.inst.pinch(pinchRatio, null, true);
      if (!consumed && pinchRatio < 0.72) zoomOut();
      pinch0 = 0; moved = true;
    } else if (pointers.size === 1 && down && down.edge) {
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (Math.abs(dx) > 60 && Math.abs(dy) < 60) { if (sibling(dx < 0 ? 1 : -1)) moved = true; }
    }
    pointers.delete(e.pointerId);
  };
  window.addEventListener('pointerup', endPointer);
  window.addEventListener('pointercancel', endPointer);
  // A press that moved more than 6 px is a drag, never a click.
  stage.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  stage.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('button, a, input, select, textarea, label, summary, [data-inert], [data-go]')) return;
    if (t.closest('[data-empty]')) zoomOut();
  });
  stage.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (b) { e.preventDefault(); navigate(b.dataset.go, { from: b }); }
  });

  let wheelAcc = 0, wheelT = 0, wheelLock = 0, wheelGate = false;
  stage.addEventListener('wheel', (e) => {
    // One gesture moves one level: after a zoom, wait for the wheel (or trackpad momentum) to pause.
    const now = performance.now();
    if (now - wheelT > 300) { wheelAcc = 0; wheelGate = false; }
    wheelT = now;
    if (!cur || busy) { e.preventDefault(); return; }
    const sc = e.target.closest('.page, .scroll, .cu-list, .search-results');
    if (sc && sc.scrollHeight > sc.clientHeight + 2) {
      const atTop = sc.scrollTop <= 0, atEnd = sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 1;
      if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atEnd)) return; // let the card scroll itself
    }
    e.preventDefault();
    if (wheelGate) return;
    const hs = e.target.closest('[data-go]');
    if (e.deltaY < -4 && hs && now > wheelLock) { wheelLock = now + 900; wheelGate = true; navigate(hs.dataset.go, { from: hs }); return; }
    if (cur.inst.wheel && cur.inst.wheel(e)) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && cur.inst.panBy) { cur.inst.panBy(e.deltaX); return; }
    if (e.deltaY > 0) { wheelAcc += e.deltaY; if (wheelAcc > 240 && now > wheelLock) { wheelAcc = 0; wheelLock = now + 900; wheelGate = true; zoomOut(); } }
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    const typing = e.target.closest && e.target.closest('input, textarea, select, [contenteditable]');
    const overlay = document.querySelector('.overlay:not([hidden])');
    if (overlay) {
      if (e.key === 'Escape') { e.preventDefault(); closeOverlay(overlay); }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); e.shiftKey ? home() : zoomOut(); return; }
    if (typing) return;
    if (e.key === 'Backspace') { e.preventDefault(); zoomOut(); return; }
    if (e.key === '/') { e.preventDefault(); openSearch(); return; }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const dir = e.key === 'ArrowLeft' ? -1 : 1;
      if (e.target.closest && e.target.closest('input[type="range"]')) return;
      if (cur && cur.inst.arrow && cur.inst.arrow(dir, e)) { e.preventDefault(); return; }
      if (sibling(dir)) e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => { if (cur && cur.inst.arrowUp && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) cur.inst.arrowUp(); });

  window.addEventListener('popstate', () => {
    const id = decodeURIComponent(location.hash.slice(1)) || rootId;
    if (!cur || id !== cur.id) navigate(nodes.has(id) ? id : rootId, { push: false });
  });
  window.addEventListener('hashchange', () => {
    const id = decodeURIComponent(location.hash.slice(1)) || rootId;
    if (cur && id !== cur.id && !busy) navigate(nodes.has(id) ? id : rootId, { push: false });
  });
  document.addEventListener('visibilitychange', () => {
    if (!cur) return;
    if (document.hidden) { cur.inst.pause && cur.inst.pause(); window.SND && SND.suspend(); }
    else { cur.inst.resume && cur.inst.resume(); window.SND && SND.resume(); }
  });
  let rz = 0;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => cur && cur.inst.resize && cur.inst.resize()); });
  document.addEventListener('click', (e) => { const m = document.getElementById('crumb-more'); if (m && !m.hidden && !e.target.closest('.more')) m.hidden = true; });

  // ---------------- HUD buttons ----------------
  document.getElementById('btn-out').addEventListener('click', zoomOut);
  document.getElementById('btn-home').addEventListener('click', home);
  document.getElementById('btn-saved').addEventListener('click', () => navigate(D.meta.savedNode));
  document.getElementById('btn-help').addEventListener('click', () => openOverlay(document.getElementById('hint')));
  document.getElementById('btn-link').addEventListener('click', async () => {
    const url = location.href;
    try { await navigator.clipboard.writeText(url); toast('Link copied. It opens this exact view.'); }
    catch (e) { toast('Copy this link:', { select: url }); }
  });
  const sndBtn = document.getElementById('btn-sound');
  sndBtn.addEventListener('click', () => {
    if (!window.SND) return;
    const on = SND.toggle();
    sndBtn.setAttribute('aria-pressed', String(on));
    sndBtn.setAttribute('aria-label', on ? `Ambient sound on: ${D.meta.soundName}` : 'Ambient sound off');
    toast(on ? `Sound on: ${D.meta.soundName}` : 'Sound off');
  });

  // ---------------- overlays: search & hint ----------------
  let lastFocus = null;
  function openOverlay(o) { lastFocus = document.activeElement; o.hidden = false; const f = o.querySelector('input, button'); f && f.focus(); }
  function closeOverlay(o) {
    o.hidden = true;
    if (o.id === 'hint') store.set('rj.hint', 1);
    (lastFocus && lastFocus.isConnected ? lastFocus : stage).focus({ preventScroll: true });
  }
  document.querySelectorAll('.overlay').forEach((o) => o.addEventListener('click', (e) => { if (e.target === o) closeOverlay(o); }));
  document.getElementById('hint-ok').addEventListener('click', () => closeOverlay(document.getElementById('hint')));
  // focus trap
  document.querySelectorAll('.overlay').forEach((o) => o.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = [...o.querySelectorAll('input, button, [tabindex="0"]')].filter((x) => !x.hidden && x.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }));

  const sOv = document.getElementById('search'), sIn = document.getElementById('search-input'), sRes = document.getElementById('search-results');
  const index = [...nodes.values()].filter((n) => !n.noSearch).map((n) => ({ id: n.id, text: [n.title, n.native, ...(n.aliases || []), n.big, n.cat].filter(Boolean).join(' '), title: n.title }));
  let sel = 0, results = [];
  function openSearch() { openOverlay(sOv); sIn.value = ''; renderResults(); }
  function renderResults() {
    const q = sIn.value.trim();
    results = q ? index.map((r) => ({ ...r, s: Math.max(U.score(q, r.title) * 1.3, U.score(q, r.text)) })).filter((r) => r.s > 0).sort((a, b) => b.s - a.s).slice(0, 9)
      : D.meta.searchSuggest.map((id) => index.find((r) => r.id === id)).filter(Boolean);
    sel = 0;
    sRes.replaceChildren(...results.map((r, i) => h('li', { role: 'option', id: 'sr-' + i, 'aria-selected': String(i === sel), onclick: () => pick(i), onmousemove: () => mark(i) },
      h('span.r-title', { text: r.title }), h('span.r-path', { text: pathOf(r.id).slice(1, -1).map((p) => nodes.get(p).crumb || nodes.get(p).title).join(' › ') || 'Rajasthan' }))));
    sIn.setAttribute('aria-activedescendant', results.length ? 'sr-0' : '');
    if (!results.length) sRes.append(h('li.empty', { text: 'Nothing matches. Try a city, a fort or a theme.' }));
  }
  function mark(i) { sel = i; [...sRes.children].forEach((li, j) => li.setAttribute('aria-selected', String(j === i))); sIn.setAttribute('aria-activedescendant', 'sr-' + i); }
  function pick(i) { const r = results[i]; if (!r) return; sOv.hidden = true; lastFocus = null; navigate(r.id); }
  sIn.addEventListener('input', renderResults);
  sIn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); mark(Math.min(results.length - 1, sel + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); mark(Math.max(0, sel - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(sel); }
  });
  document.getElementById('btn-search').addEventListener('click', openSearch);

  // ---------------- boot ----------------
  function boot() {
    updateSaved();
    const id = decodeURIComponent(location.hash.slice(1));
    const start = nodes.has(id) ? id : rootId;
    history.replaceState({ id: start }, '', '#' + start);
    navigate(start, { push: false });
    if (!store.get('rj.hint', 0)) setTimeout(() => openOverlay(document.getElementById('hint')), 900);
  }
  window.RJ_APP = { navigate, zoomOut, home, sibling, nodes, get current() { return cur && cur.id; }, branchInfo };
  boot();
})();
