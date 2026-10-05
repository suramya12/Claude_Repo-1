/* Shared helpers. No country-specific content lives here. */
(function () {
  'use strict';
  const U = {};

  /** Create an element: h('div.cls#id', {attrs}, children...) */
  U.h = function h(sel, attrs, ...kids) {
    const m = sel.match(/^([a-z0-9-]+)?((?:[.#][\w-]+)*)$/i);
    const el = document.createElement((m && m[1]) || 'div');
    if (m && m[2]) m[2].replace(/([.#])([\w-]+)/g, (_, t, v) => (t === '.' ? el.classList.add(v) : (el.id = v)));
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) el.append(k.nodeType ? k : document.createTextNode(String(k)));
    return el;
  };
  U.svg = function svg(tag, attrs, ...kids) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
    for (const k of kids.flat()) if (k != null) el.append(k.nodeType ? k : document.createTextNode(String(k)));
    return el;
  };
  U.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  /** localStorage, wrapped: the site must work when storage is blocked. */
  U.store = {
    get(k, d) { try { const v = window.localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  };

  const RAD = Math.PI / 180;
  U.RAD = RAD;
  U.bearing = function ([lat1, lon1], [lat2, lon2]) {
    const y = Math.sin((lon2 - lon1) * RAD) * Math.cos(lat2 * RAD);
    const x = Math.cos(lat1 * RAD) * Math.sin(lat2 * RAD) - Math.sin(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.cos((lon2 - lon1) * RAD);
    return (Math.atan2(y, x) / RAD + 360) % 360;
  };
  U.distance = function ([lat1, lon1], [lat2, lon2]) {
    const a = Math.sin(((lat2 - lat1) * RAD) / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(((lon2 - lon1) * RAD) / 2) ** 2;
    return 2 * 6371.0088 * Math.asin(Math.sqrt(a));
  };
  U.angDiff = (a, b) => ((((a - b) % 360) + 540) % 360) - 180;
  U.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  U.compass = (b) => ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'][Math.round(b / 22.5) % 16];
  U.roman = (n) => ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n] || String(n);
  U.fmtCoord = ([lat, lon]) => `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`;
  U.rng = function (seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  U.norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ऀ-ॿ ]+/g, ' ').trim();
  U.reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  U.isMobile = () => window.innerWidth <= 760;
  U.money = (n, cur = '₹') => `${cur}${Math.round(n).toLocaleString('en-IN')}`;

  /** Photos: <img> with two widths, or a designed fallback. */
  U.photo = function (slot) { return (window.RJ_PHOTOS || {})[slot] || null; };
  U.img = function (slot, alt, opts = {}) {
    const p = U.photo(slot);
    if (!p) return null;
    const img = U.h('img', {
      src: `img/${slot}-800.jpg`,
      srcset: `img/${slot}-800.jpg 800w, img/${slot}-1600.jpg 1600w`,
      sizes: opts.sizes || '100vw',
      alt: alt || p.alt || '',
      width: p.w, height: p.h,
      loading: opts.eager ? 'eager' : 'lazy',
      decoding: 'async',
      draggable: 'false',
    });
    if (opts.fx != null) img.style.objectPosition = `${opts.fx}% ${opts.fy ?? 50}%`;
    img.addEventListener('error', () => { const fb = U.fallback(opts.native || '', opts.coords); img.replaceWith(fb); }, { once: true });
    return img;
  };
  U.fallback = function (native, coords) {
    return U.h('div.fallback-art', { 'aria-hidden': 'true' },
      U.h('div.fb-deva', { lang: 'hi', text: native || 'राजस्थान' }),
      coords ? U.h('div.fb-coords', { text: U.fmtCoord(coords) }) : null);
  };
  U.preload = function (slot) {
    if (!slot || !U.photo(slot)) return;
    const i = new Image(); i.decoding = 'async';
    i.srcset = `img/${slot}-800.jpg 800w, img/${slot}-1600.jpg 1600w`; i.sizes = '100vw'; i.src = `img/${slot}-800.jpg`;
  };
  U.credit = function (slot, place) {
    const p = U.photo(slot);
    if (!p) return null;
    const lic = p.licenseUrl ? U.h('a', { href: p.licenseUrl, target: '_blank', rel: 'noopener', text: p.license }) : p.license;
    return U.h('p.credit', null, 'Photo: ', U.h('a', { href: p.source, target: '_blank', rel: 'noopener', text: p.author }), ' · ', lic, place ? ` · ${place}` : '');
  };

  /** Tiny fuzzy score: substring hits beat in-order letter hits. */
  U.score = function (q, text) {
    q = U.norm(q); text = U.norm(text);
    if (!q) return 0;
    const i = text.indexOf(q);
    if (i === 0) return 100 - text.length * 0.01;
    if (i > 0) return (text[i - 1] === ' ' ? 80 : 60) - i * 0.1;
    let ti = 0, hits = 0;
    for (const c of q) { const j = text.indexOf(c, ti); if (j < 0) return 0; hits += j === ti ? 2 : 1; ti = j + 1; }
    return hits * 2;
  };

  window.U = U;
})();
