/* Sun, moon and sky colour for a viewer on the ground. Low-precision astronomy (about 1° accuracy),
   good enough for a sky that follows real local time. */
(function () {
  'use strict';
  const R = Math.PI / 180;
  const SKY = {};
  const jd = (date) => date.getTime() / 86400000 + 2440587.5;

  function altAz(raDeg, decDeg, date, lat, lon) {
    const d = jd(date) - 2451545.0;
    const gmst = (18.697374558 + 24.06570982441908 * d) % 24;
    const lst = (gmst * 15 + lon + 360) % 360;
    const ha = (lst - raDeg) * R, dec = decDeg * R, la = lat * R;
    const alt = Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(ha));
    const az = Math.atan2(-Math.sin(ha), Math.tan(dec) * Math.cos(la) - Math.sin(la) * Math.cos(ha));
    return { alt: alt / R, az: ((az / R) + 360) % 360 };
  }
  function eclToEq(lambda, beta, d) {
    const e = (23.439 - 0.0000004 * d) * R, l = lambda * R, b = beta * R;
    const ra = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
    const dec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
    return { ra: ((ra / R) + 360) % 360, dec: dec / R };
  }
  SKY.sun = function (date, lat, lon) {
    const d = jd(date) - 2451545.0;
    const g = (357.529 + 0.98560028 * d) * R;
    const q = 280.459 + 0.98564736 * d;
    const L = q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);
    const { ra, dec } = eclToEq(L, 0, d);
    return { ...altAz(ra, dec, date, lat, lon), lambda: L };
  };
  SKY.moon = function (date, lat, lon) {
    const d = jd(date) - 2451545.0;
    const L = 218.316 + 13.176396 * d, M = (134.963 + 13.064993 * d) * R, F = (93.272 + 13.22935 * d) * R;
    const lambda = L + 6.289 * Math.sin(M), beta = 5.128 * Math.sin(F);
    const { ra, dec } = eclToEq(lambda, beta, d);
    const sunL = SKY.sun(date, lat, lon).lambda;
    const elong = (((lambda - sunL) % 360) + 360) % 360; // 0 new, 180 full
    return { ...altAz(ra, dec, date, lat, lon), phase: elong / 360, illum: (1 - Math.cos(elong * R)) / 2 };
  };

  /** Local time in the destination, given its UTC offset in hours. */
  SKY.localParts = function (date, tz) {
    const t = new Date(date.getTime() + tz * 3600000);
    return { h: t.getUTCHours(), m: t.getUTCMinutes(), day: t.getUTCDate(), month: t.getUTCMonth(), year: t.getUTCFullYear() };
  };
  /** A Date for a given local hour today in the destination. */
  SKY.atLocalHour = function (hour, tz, base = new Date()) {
    const p = SKY.localParts(base, tz);
    return new Date(Date.UTC(p.year, p.month, p.day, 0, 0) - tz * 3600000 + hour * 3600000);
  };

  // Always dark, never bright: even noon is a dim, dusty sky.
  const STOPS = [ // sun altitude → [zenith, mid, horizon]
    [-18, ['#04050a', '#070812', '#0c0b14']],
    [-10, ['#05070f', '#0b0e1c', '#1d1520']],
    [-4, ['#090c1a', '#1b1a2c', '#5a2f22']],
    [0, ['#0d1122', '#2b2333', '#a24d1e']],
    [6, ['#121a2c', '#33303a', '#b8692c']],
    [16, ['#15212f', '#2b3640', '#7b6248']],
    [40, ['#172431', '#26343e', '#5a5448']],
  ];
  const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
  SKY.colors = function (alt) {
    if (alt <= STOPS[0][0]) return STOPS[0][1];
    for (let i = 1; i < STOPS.length; i++) {
      if (alt <= STOPS[i][0]) {
        const t = (alt - STOPS[i - 1][0]) / (STOPS[i][0] - STOPS[i - 1][0]);
        return STOPS[i][1].map((c, j) => mix(STOPS[i - 1][1][j], c, t));
      }
    }
    return STOPS[STOPS.length - 1][1];
  };
  SKY.starAlpha = (alt) => U.clamp((-alt - 3) / 9, 0, 1);
  SKY.glow = (alt) => U.clamp(1 - Math.abs(alt + 1) / 9, 0, 1);

  /** Stable star field. */
  SKY.stars = function (n, seed) {
    const r = U.rng(seed); const s = [];
    for (let i = 0; i < n; i++) s.push({ b: r() * 360, a: Math.pow(r(), 0.8) * 80 + 2, m: r(), tw: r() * 6.28 });
    return s;
  };

  /** Draw a moon disc with the right phase. */
  SKY.drawMoon = function (g, x, y, r, phase) {
    g.save();
    g.fillStyle = 'rgba(242,233,216,0.08)'; g.beginPath(); g.arc(x, y, r * 2.6, 0, 7); g.fill();
    g.fillStyle = '#26242a'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    // lit part: half disc on the lit side, closed by the terminator ellipse
    const waxing = phase < 0.5; const k = Math.cos(phase * 2 * Math.PI);
    g.fillStyle = '#e9dfc9'; g.beginPath();
    g.arc(x, y, r, -Math.PI / 2, Math.PI / 2, !waxing);
    g.ellipse(x, y, Math.max(0.01, Math.abs(k) * r), r, 0, Math.PI / 2, -Math.PI / 2, waxing ? k > 0 : k <= 0);
    g.fill();
    g.restore();
  };

  window.SKY = SKY;
})();
