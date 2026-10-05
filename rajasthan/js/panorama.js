/* PANORAMA archetype: a cylindrical 360° world drawn on canvas, with the reader at the centre.
   Horizon hotspots sit at their real compass bearing from the viewer; distance sets size and paleness.
   The sky follows the destination's real local time. */
(function () {
  'use strict';
  const { h } = U;
  const ARCH = (window.ARCH = window.ARCH || {});

  // Smooth circular interpolation through [bearing, value] control points.
  function profile(points) {
    const pts = points.slice().sort((a, b) => a[0] - b[0]);
    return (b) => {
      b = ((b % 360) + 360) % 360;
      let i = pts.findIndex((p) => p[0] > b);
      if (i === -1) i = 0;
      const p1 = pts[i], p0 = pts[(i - 1 + pts.length) % pts.length];
      let span = p1[0] - p0[0]; if (span <= 0) span += 360;
      let t = b - p0[0]; if (t < 0) t += 360;
      const u = (1 - Math.cos((t / span) * Math.PI)) / 2;
      return p0[1] + (p1[1] - p0[1]) * u;
    };
  }
  function noise1(seed) {
    const r = U.rng(seed), v = Array.from({ length: 720 }, () => r() * 2 - 1);
    // f = noise cycles per 10° of bearing; wraps cleanly every 360°
    return (b, f) => { const x = ((((b / 10) * f) % (36 * f)) + 36 * f) % (36 * f), i = Math.floor(x), t = x - i, u = t * t * (3 - 2 * t), n = 36 * f; return v[i % 720] + (v[(i + 1) % n % 720] - v[i % 720]) * u; };
  }

  // Simple landmark silhouettes, drawn upward from (x, y) at scale s.
  const SIL = {
    fort(g, x, y, s) { g.beginPath(); g.moveTo(x - 34 * s, y); g.lineTo(x - 30 * s, y - 14 * s); for (let i = -30; i < 26; i += 6) { g.lineTo(x + i * s, y - 16 * s); g.lineTo(x + (i + 3) * s, y - 16 * s); g.lineTo(x + (i + 3) * s, y - 14 * s); g.lineTo(x + (i + 6) * s, y - 14 * s); } g.lineTo(x + 22 * s, y - 24 * s); g.lineTo(x + 30 * s, y - 24 * s); g.lineTo(x + 30 * s, y - 14 * s); g.lineTo(x + 36 * s, y); g.fill(); },
    palace(g, x, y, s) { g.beginPath(); g.rect(x - 26 * s, y - 14 * s, 52 * s, 14 * s); g.fill(); [-18, 0, 18].forEach((o, i) => { g.beginPath(); g.arc(x + o * s, y - 14 * s, (i === 1 ? 8 : 5) * s, Math.PI, 0); g.fill(); g.fillRect(x + o * s - 0.6 * s, y - (i === 1 ? 26 : 22) * s, 1.2 * s, 4 * s); }); },
    temple(g, x, y, s) { g.beginPath(); g.moveTo(x - 22 * s, y); g.lineTo(x - 18 * s, y - 10 * s); g.lineTo(x - 8 * s, y - 10 * s); g.quadraticCurveTo(x - 6 * s, y - 30 * s, x, y - 36 * s); g.quadraticCurveTo(x + 6 * s, y - 30 * s, x + 8 * s, y - 10 * s); g.lineTo(x + 18 * s, y - 10 * s); g.lineTo(x + 22 * s, y); g.fill(); },
    tower(g, x, y, s) { g.beginPath(); g.moveTo(x - 6 * s, y); g.lineTo(x - 4.5 * s, y - 34 * s); g.lineTo(x + 4.5 * s, y - 34 * s); g.lineTo(x + 6 * s, y); g.fill(); g.beginPath(); g.arc(x, y - 34 * s, 5 * s, Math.PI, 0); g.fill(); },
    lake(g, x, y, s, glint) { g.save(); g.fillStyle = glint; g.beginPath(); g.ellipse(x, y + 2 * s, 30 * s, 3 * s, 0, 0, 7); g.fill(); g.restore(); },
    khejri(g, x, y, s) { g.beginPath(); g.moveTo(x - 1.6 * s, y); g.lineTo(x - 0.9 * s, y - 16 * s); g.lineTo(x - 7 * s, y - 22 * s); g.lineTo(x - 0.4 * s, y - 19 * s); g.lineTo(x + 0.6 * s, y - 24 * s); g.lineTo(x + 6 * s, y - 21 * s); g.lineTo(x + 1.2 * s, y - 16 * s); g.lineTo(x + 1.8 * s, y); g.fill(); g.beginPath(); g.ellipse(x, y - 26 * s, 16 * s, 6 * s, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x - 8 * s, y - 24 * s, 9 * s, 4 * s, 0, 0, 7); g.ellipse(x + 9 * s, y - 24.5 * s, 9 * s, 4 * s, 0, 0, 7); g.fill(); },
    tree(g, x, y, s) { g.fillRect(x - 0.8 * s, y - 12 * s, 1.6 * s, 12 * s); g.beginPath(); g.ellipse(x, y - 14 * s, 9 * s, 5 * s, 0, 0, 7); g.fill(); },
    dome(g, x, y, s) { g.beginPath(); g.rect(x - 14 * s, y - 8 * s, 28 * s, 8 * s); g.fill(); g.beginPath(); g.arc(x, y - 8 * s, 10 * s, Math.PI, 0); g.fill(); g.fillRect(x - 0.6 * s, y - 22 * s, 1.2 * s, 5 * s); },
    marsh(g, x, y, s) { for (let i = -3; i <= 3; i++) { g.fillRect(x + i * 6 * s, y - (5 + (i % 2 ? 3 : 0)) * s, 1 * s, (5 + (i % 2 ? 3 : 0)) * s); } },
  };

  ARCH.panorama = function (node, el, ctx) {
    const D = ctx.D, P = D.panorama, tz = D.meta.tz;
    const [vlat, vlon] = ctx.viewer;
    el.classList.add('pano');
    const canvas = h('canvas.fill', { 'data-empty': '', 'aria-hidden': 'true' });
    const layerHs = h('div.layer-hs');
    const title = h('div.pano-title', { 'data-inert': '' },
      h('p.mono-label', { text: P.eyebrow }),
      h('h1.title', { tabindex: '-1', text: node.big || node.title }),
      h('p', { text: node.line }));
    const cmpCanvas = h('canvas', { 'aria-hidden': 'true' });
    const compass = h('div.compass', { 'data-inert': '', role: 'img', 'aria-label': 'Compass' }, cmpCanvas);
    const range = h('input', { type: 'range', min: '-12', max: '12', step: '0.25', value: '0', id: 'pano-time', 'aria-describedby': 'pano-time-l' });
    const tLabel = h('label', { for: 'pano-time', id: 'pano-time-l' });
    const nowBtn = h('button.btn.ghost.small', { type: 'button', text: 'Now' });
    const timebar = h('div.timebar', { 'data-inert': '' }, tLabel, range, nowBtn);
    el.append(canvas, h('div.vignette'), layerHs, title, compass, timebar);

    // ---------- geometry ----------
    let W = 0, H = 0, dpr = 1, ppd = 10, hy = 0;
    const g = canvas.getContext('2d'), cg = cmpCanvas.getContext('2d');
    function resize() {
      W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = W * dpr; canvas.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const fov = U.clamp(W / 13, 62, 112); ppd = W / fov; hy = H * 0.6;
      cmpCanvas.width = cmpCanvas.clientWidth * dpr || 560 * dpr; cmpCanvas.height = cmpCanvas.clientHeight * dpr || 40 * dpr;
      layout();
    }
    const xOf = (b) => W / 2 + U.angDiff(b, yaw) * ppd;

    // ---------- terrain ----------
    const layers = P.layers.map((L, i) => ({ ...L, f: profile(L.points), n: noise1(97 + i * 13) }));
    const stars = SKY.stars(420, 7);
    function terrainY(L, b) { return hy + L.base * H - (L.f(b) + L.n(b, L.freq || 2) * (L.rough || 0.05)) * L.amp * H; }

    // ---------- hotspots ----------
    // Children of the panorama, plus the wonders inside the ring, which also sit on the horizon at their bearing.
    const kidIds = [...node.children, ...node.children.flatMap((c) => (ctx.get(c).archetype === 'ring' ? ctx.get(c).children : []))];
    const kids = kidIds.map((id) => ctx.get(id)).filter((n) => n.band);
    const maxDist = Math.max(...kids.filter((k) => k.distance).map((k) => k.distance), 1);
    const sorted = kids.slice().sort((a, b) => (a.bearing ?? 0) - (b.bearing ?? 0));
    const items = sorted.map((k) => {
      const kind = k.band === 'horizon' ? (k.archetype === 'map' ? 'region' : 'wonder') : k.band === 'sky' ? 'theme' : 'tool';
      const dist = k.distance ? `${Math.round(k.distance)} km ${U.compass(k.bearing)}` : '';
      const label = kind === 'wonder' ? `${U.roman(k.order)} · ${k.title}` : k.title;
      const b = h(`button.hs.${kind}`, {
        type: 'button', 'data-go': k.id,
        'aria-label': `${label}${dist ? ', ' + dist : ''}. ${k.teaser || ''}`,
        onfocus: () => { target = k.bearing; idleT = performance.now(); ctx.preload(k.id); },
        onmouseenter: () => ctx.preload(k.id),
      },
      kind === 'wonder' ? h('span.num', { text: U.roman(k.order), 'aria-hidden': 'true' }) : null,
      h('span.dot', { 'aria-hidden': 'true' }),
      h('span.lbl', { text: kind === 'wonder' ? k.title : k.title, 'aria-hidden': 'true' }),
      h('span.teaser', { 'aria-hidden': 'true' }, dist ? h('b.mono-label', { text: dist }) : null, dist ? h('br') : null, k.teaser || ''));
      const lead = h('div.lead', { 'aria-hidden': 'true' });
      layerHs.append(lead, b);
      return { k, kind, b, lead, lane: 0, w: 0 };
    });
    // vertical placement per band
    function anchor(it) {
      const k = it.k;
      if (it.kind === 'theme') return H * (0.24 + ((36 - (k.alt ?? 30)) / 12) * 0.16);
      if (it.kind === 'tool') return Math.min(H - 150, hy + H * (0.14 + ((k.drop ?? 0.25) - 0.24) * 1.2));
      const dn = (k.distance || 0) / maxDist;
      return it.kind === 'region' ? hy + 58 - dn * 34 : hy - 6 - dn * 26;
    }
    function layout() { items.forEach((it) => { it.w = it.b.offsetWidth || 120; }); }

    // ---------- camera ----------
    let yaw = ctx.cam.yaw[node.id] ?? P.startYaw, vel = 0, target = null, keyVel = 0, idleT = performance.now();
    let dragging = false, lastX = 0, lastT = 0;
    canvas.addEventListener('pointerdown', (e) => {
      dragging = true; lastX = e.clientX; lastT = performance.now(); vel = 0; target = null; el.classList.add('dragging');
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or already-released pointer */ }
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const now = performance.now(), dx = e.clientX - lastX;
      yaw -= dx / ppd; vel = (-dx / ppd) / Math.max(1, now - lastT) * 1000; lastX = e.clientX; lastT = now; idleT = now;
    });
    const up = () => { dragging = false; el.classList.remove('dragging'); idleT = performance.now(); };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    // hotspots are buttons; dragging across them still turns the view
    layerHs.addEventListener('pointerdown', (e) => { if (e.target.closest('.hs')) { dragging = true; lastX = e.clientX; lastT = performance.now(); vel = 0; target = null; } });
    window.addEventListener('pointermove', onWinMove);
    window.addEventListener('pointerup', up);
    function onWinMove(e) { if (dragging && e.target !== canvas) { const now = performance.now(), dx = e.clientX - lastX; yaw -= dx / ppd; vel = (-dx / ppd) / Math.max(1, now - lastT) * 1000; lastX = e.clientX; lastT = now; idleT = now; } }

    // ---------- time ----------
    let offsetH = 0, sun = null, moon = null, colors = null, lastSky = 0;
    function updateSky(force) {
      const now = Date.now(); if (!force && now - lastSky < 1000) return; lastSky = now;
      const d = new Date(now + offsetH * 3600000);
      sun = SKY.sun(d, vlat, vlon); moon = SKY.moon(d, vlat, vlon); colors = SKY.colors(sun.alt);
      const p = SKY.localParts(d, tz);
      const state = sun.alt > 10 ? 'day' : sun.alt > -1 ? (p.h < 12 ? 'sunrise' : 'golden hour') : sun.alt > -12 ? 'twilight' : 'night';
      tLabel.textContent = `${String(p.h).padStart(2, '0')}:${String(p.m).padStart(2, '0')} ${D.meta.tzName} · ${state}`;
      range.setAttribute('aria-valuetext', `${tLabel.textContent}${offsetH ? `, ${offsetH > 0 ? '+' : ''}${offsetH} h from now` : ', now'}`);
    }
    range.addEventListener('input', () => { offsetH = Number(range.value); updateSky(true); });
    nowBtn.addEventListener('click', () => { offsetH = 0; range.value = '0'; updateSky(true); });

    // ---------- render ----------
    let raf = 0, paused = false, last = performance.now();
    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (paused) return;
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      // motion
      if (target != null) { const d = U.angDiff(target, yaw); yaw += d * Math.min(1, dt * 6); if (Math.abs(d) < 0.05) target = null; }
      else if (keyVel) yaw += keyVel * dt;
      else if (!dragging && Math.abs(vel) > 0.5) { yaw += vel * dt; vel *= Math.pow(0.04, dt); }
      else if (!dragging && !U.reduced() && t - idleT > 6000 && !el.contains(document.activeElement && document.activeElement.closest ? document.activeElement.closest('.hs') : null)) yaw += 1.1 * dt;
      yaw = ((yaw % 360) + 360) % 360;
      ctx.cam.yaw[node.id] = yaw;
      updateSky(false);
      draw(t);
      place();
      drawCompass();
    }
    function draw(t) {
      const [cz, cm, chz] = colors;
      const sky = g.createLinearGradient(0, 0, 0, hy);
      sky.addColorStop(0, cz); sky.addColorStop(0.62, cm); sky.addColorStop(1, chz);
      g.fillStyle = sky; g.fillRect(0, 0, W, hy + 2);
      // glow toward the sun's bearing near the horizon
      const glow = SKY.glow(sun.alt);
      if (glow > 0.01) {
        const sx = xOf(sun.az); const rg = g.createRadialGradient(sx, hy, 0, sx, hy, ppd * 70);
        rg.addColorStop(0, `rgba(232,128,52,${0.55 * glow})`); rg.addColorStop(0.4, `rgba(190,80,40,${0.22 * glow})`); rg.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = rg; g.fillRect(0, 0, W, hy + 4);
      }
      // stars
      const sa = SKY.starAlpha(sun.alt);
      if (sa > 0.02) {
        for (const s of stars) {
          const x = xOf(s.b); if (x < -4 || x > W + 4) continue;
          const y = hy - s.a * ppd * 0.9; if (y < 0) continue;
          const a = sa * (0.25 + 0.75 * s.m) * (U.reduced() ? 1 : 0.8 + 0.2 * Math.sin(t / 900 + s.tw));
          g.fillStyle = `rgba(255,246,228,${a})`; g.fillRect(x, y, s.m > 0.93 ? 2 : 1.2, s.m > 0.93 ? 2 : 1.2);
        }
      }
      // sun and moon
      if (sun.alt > -3) {
        const x = xOf(sun.az), y = hy - sun.alt * ppd * 0.9;
        if (x > -80 && x < W + 80) { g.fillStyle = 'rgba(255,190,120,0.16)'; g.beginPath(); g.arc(x, y, 34, 0, 7); g.fill(); g.fillStyle = '#f4c27c'; g.beginPath(); g.arc(x, y, 11, 0, 7); g.fill(); }
      }
      if (moon.alt > -2) {
        const x = xOf(moon.az), y = hy - moon.alt * ppd * 0.9;
        if (x > -40 && x < W + 40) SKY.drawMoon(g, x, y, 9, moon.phase);
      }
      // mist band
      const mist = g.createLinearGradient(0, hy - 40, 0, hy + 30);
      mist.addColorStop(0, 'rgba(0,0,0,0)'); mist.addColorStop(0.6, chz.replace('rgb', 'rgba').replace(')', ',0.35)')); mist.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = mist; g.fillRect(0, hy - 40, W, 70);
      // terrain layers, far to near, with landmark silhouettes on the layer that matches their distance
      const b0 = yaw - W / 2 / ppd;
      layers.forEach((L, li) => {
        g.fillStyle = L.color;
        g.beginPath(); g.moveTo(-2, H);
        for (let x = -2; x <= W + 4; x += 4) g.lineTo(x, terrainY(L, b0 + x / ppd));
        g.lineTo(W + 4, H); g.closePath(); g.fill();
        for (const it of items) {
          const k = it.k; if (!k.sil || it.kind === 'theme' || it.kind === 'tool') continue;
          const layerFor = k.distance > 240 ? 0 : k.distance > 120 ? 1 : 2;
          if (layerFor !== li) continue;
          const x = xOf(k.bearing); if (x < -80 || x > W + 80) continue;
          const s = (1.25 - (k.distance / maxDist) * 0.7) * (W < 700 ? 0.7 : 1);
          g.fillStyle = L.color; (SIL[k.sil] || SIL.fort)(g, x, terrainY(L, k.bearing) + 2, s, 'rgba(240,190,130,0.35)');
        }
      });
      // near ground: warm sand fading to the bottom
      const gr = g.createLinearGradient(0, hy + H * 0.12, 0, H);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(6,4,3,0.92)');
      g.fillStyle = gr; g.fillRect(0, hy, W, H - hy);
      // khejri trees in the foreground, fixed in the world
      g.fillStyle = '#060403';
      const near = layers[layers.length - 1];
      for (const fb of P.foreground) { const x = xOf(fb[0]); if (x < -80 || x > W + 80) continue; SIL.khejri(g, x, terrainY(near, fb[0]) + 6, fb[2] * (W < 700 ? 0.7 : 1)); }
    }
    function place() {
      // anchors and simple lane-based collision avoidance for labels
      const vis = [];
      for (const it of items) {
        const x = xOf(it.k.bearing ?? 0), y = anchor(it);
        it.x = x; it.y = y;
        it.on = x > -150 && x < W + 150;
        if (it.on) vis.push(it);
      }
      vis.sort((a, b) => a.x - b.x);
      const lanes = {};
      for (const it of vis) {
        const band = it.kind === 'region' || it.kind === 'wonder' ? it.kind : it.kind;
        const L = (lanes[band] = lanes[band] || []);
        let lane = 0; while (L[lane] != null && L[lane] > it.x - (it.w * 0.55 + 70)) lane++;
        L[lane] = it.x + it.w * 0.45; it.lane = Math.min(lane, 3);
      }
      for (const it of items) {
        const dn = it.k.distance ? it.k.distance / maxDist : 0;
        const dy = it.kind === 'wonder' ? -it.lane * 46 : it.kind === 'region' ? it.lane * 40 : it.kind === 'theme' ? it.lane * 36 : -it.lane * 40;
        const sc = it.kind === 'wonder' ? 1.08 - dn * 0.32 : 1;
        // Off-screen hotspots stay in the tab order (focus turns the view to them), parked
        // transparent inside the frame so focusing them never scrolls the stage.
        const px = it.on ? it.x : U.clamp(it.x, 30, W - 30);
        it.b.style.transform = `translate(${px}px, ${it.y + dy}px) translate(-50%, -50%) scale(${sc.toFixed(3)})`;
        it.b.style.left = '0px'; it.b.style.top = '0px';
        it.b.style.opacity = it.kind === 'wonder' ? (1 - dn * 0.35).toFixed(2) : '';
        it.b.classList.toggle('off', !it.on);
        if (it.lane && it.on && (it.kind === 'wonder' || it.kind === 'region')) {
          const top = Math.min(it.y, it.y + dy), hgt = Math.abs(dy);
          it.lead.style.cssText = `left:${it.x}px;top:${top}px;height:${hgt}px;display:block`;
        } else it.lead.style.display = 'none';
      }
    }
    function drawCompass() {
      const w = cmpCanvas.width, hh = cmpCanvas.height, s = dpr, pp = (w / s) / 80; // 80° across the strip
      cg.setTransform(1, 0, 0, 1, 0, 0); cg.clearRect(0, 0, w, hh); cg.setTransform(s, 0, 0, s, 0, 0);
      const cw = w / s, mid = cw / 2;
      cg.font = '500 10px "JetBrains Mono", monospace'; cg.textAlign = 'center';
      for (let b = Math.floor(yaw - 45); b <= yaw + 45; b++) {
        const x = mid + (b - yaw) * pp; const bb = ((b % 360) + 360) % 360;
        if (bb % 5) continue;
        const major = bb % 45 === 0;
        cg.fillStyle = major ? 'rgba(242,233,216,0.9)' : 'rgba(242,233,216,0.35)';
        cg.fillRect(x, 24, 1, major ? 10 : bb % 15 ? 4 : 7);
        if (major) cg.fillText(U.compass(bb), x, 18);
        else if (bb % 15 === 0) { cg.fillStyle = 'rgba(242,233,216,0.45)'; cg.fillText(String(bb), x, 18); }
      }
      cg.fillStyle = '#e48a2e';
      for (const it of items) if (it.kind !== 'theme' && it.kind !== 'tool') { const d = U.angDiff(it.k.bearing, yaw); if (Math.abs(d) < 42) { cg.beginPath(); cg.arc(mid + d * pp, 35, 1.8, 0, 7); cg.fill(); } }
      compass.setAttribute('aria-label', `Facing ${Math.round(yaw)}° ${U.compass(yaw)}`);
    }

    resize(); updateSky(true);
    requestAnimationFrame((t) => { last = t; frame(t); });

    return {
      enter() { requestAnimationFrame(() => { resize(); }); },
      destroy() { cancelAnimationFrame(raf); window.removeEventListener('pointermove', onWinMove); window.removeEventListener('pointerup', up); },
      pause() { paused = true; }, resume() { paused = false; last = performance.now(); },
      resize,
      pointFor(id, current) {
        const it = items.find((i) => i.k.id === id); if (!it) return null;
        if (!current) { yaw = it.k.bearing ?? yaw; ctx.cam.yaw[node.id] = yaw; target = null; vel = 0; }
        resize(); place();
        return { x: xOf(it.k.bearing ?? yaw), y: anchor(it) };
      },
      focusChild(id) { const it = items.find((i) => i.k.id === id); if (it) { it.b.focus({ preventScroll: true }); it.b.classList.add('pulse'); setTimeout(() => it.b.classList.remove('pulse'), 2600); } },
      focusStart() { title.querySelector('h1').focus({ preventScroll: true }); },
      arrow(dir) { keyVel = dir * 70; target = null; idleT = performance.now(); return true; },
      arrowUp() { keyVel = 0; idleT = performance.now(); },
      panBy(dx) { yaw += dx / ppd; idleT = performance.now(); target = null; },
    };
  };
})();
