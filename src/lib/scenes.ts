/* Procedural scene painter. Every landscape on the site is drawn here on <canvas>,
   so pages work without photography and stay sharp at any size. */

export type Ctx = CanvasRenderingContext2D;
type Bump = { x: number; h: number; w: number; p?: number };
type Snow = { line: number; c: string; lit?: string | null; shade?: string };
type LayerSpec = { base: number; amp: number; rough?: number; c: string; c2?: string; bumps?: Bump[]; snow?: Snow; depth?: number };
export type SceneSpec = {
  seed: number;
  sky: string[];
  stars?: number;
  starAlpha?: number;
  glow?: { x: number; y: number; r: number; c: string; disc?: string; dr?: number };
  fog?: string;
  fogAfter?: number[];
  layers: LayerSpec[];
  featureAt?: number;
  feature?: string;
  after?: string;
  flash?: { v: number };
  k?: { x?: number; w?: number; night?: boolean };
};
type Layer = LayerSpec & { pts: number[] };
export type Scene = { spec: SceneSpec; layers: Layer[]; stars: { x: number; y: number; r: number; p: number; s: number }[]; extra: number[] };
type Feature = (ctx: Ctx, W: number, H: number, t: number, o: number, sc: Scene) => void;

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export function rng(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

function ridge(rnd: () => number, n: number, base: number, amp: number, rough: number, bumps?: Bump[]) {
  const waves: { f: number; p: number; a: number }[] = [];
  for (let k = 0; k < 6; k++) waves.push({ f: (k + 1) * (1.1 + rnd() * 1.6), p: rnd() * 6.283, a: Math.pow(rough, k) });
  const out: number[] = [];
  for (let i = 0; i <= n; i++) {
    const x = i / n;
    let v = 0, s = 0;
    for (const w of waves) { v += w.a * Math.sin(x * w.f * 6.283 + w.p); s += w.a; }
    let y = base - amp * ((v / s) * 0.5 + 0.5);
    let bt = 0;
    for (const b of bumps || []) {
      const d = (x - b.x) / b.w;
      const bv = b.h * Math.pow(Math.max(0, 1 - Math.abs(d)), b.p || 1.5);
      y -= bv; bt += bv;
    }
    if (bt) y += bt * (0.035 * Math.sin(x * 97 + waves[0].p) + 0.025 * Math.sin(x * 211 + waves[1].p) + (rnd() - 0.5) * 0.03);
    y += (rnd() - 0.5) * amp * 0.05;
    out.push(y);
  }
  return out;
}

export function buildScene(spec: SceneSpec): Scene {
  const rnd = rng(spec.seed || 1);
  const layers = spec.layers.map((L) => ({ ...L, pts: ridge(rnd, 220, L.base, L.amp, L.rough ?? 0.5, L.bumps) }));
  const stars = [];
  for (let i = 0; i < (spec.stars || 0); i++) stars.push({ x: rnd(), y: rnd() * rnd() * 0.75, r: rnd() * rnd() * 1.6 + 0.3, p: rnd() * 6.28, s: 0.5 + rnd() * 2 });
  const extra: number[] = [];
  for (let i = 0; i < 400; i++) extra.push(rnd());
  return { spec, layers, stars, extra };
}

export function ridgePath(ctx: Ctx, pts: number[], W: number, H: number, off: number) {
  ctx.beginPath();
  const n = pts.length - 1, x0 = -0.06 * W + off, span = 1.12 * W;
  ctx.moveTo(x0, H + 2);
  for (let i = 0; i <= n; i++) ctx.lineTo(x0 + (span * i) / n, pts[i] * H);
  ctx.lineTo(x0 + span, H + 2);
  ctx.closePath();
}
function ridgeY(pts: number[], W: number, x: number, off: number) {
  const n = pts.length - 1;
  const u = ((x - (-0.06 * W + off)) / (1.12 * W)) * n;
  const i = clamp(Math.floor(u), 0, n - 1);
  return lerp(pts[i], pts[i + 1], u - i);
}

export function paintScene(ctx: Ctx, W: number, H: number, sc: Scene, t: number, px = 0, _py = 0) {
  const S = sc.spec;
  let g = ctx.createLinearGradient(0, 0, 0, H);
  S.sky.forEach((c, i) => g.addColorStop(i / (S.sky.length - 1), c));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (sc.stars.length) {
    for (const s of sc.stars) {
      const a = 0.35 + 0.65 * Math.abs(Math.sin(t * s.s * 0.6 + s.p));
      ctx.globalAlpha = a * (S.starAlpha ?? 1); ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(s.x * W - px * W * 0.004, s.y * H, s.r * (W / 1400 + 0.4), 0, 6.28); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  if (S.glow) {
    const o = S.glow, gx = o.x * W - px * W * 0.01, gy = o.y * H;
    g = ctx.createRadialGradient(gx, gy, 0, gx, gy, o.r * W);
    g.addColorStop(0, o.c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (o.disc) { ctx.fillStyle = o.disc; ctx.beginPath(); ctx.arc(gx, gy, (o.dr || 0.01) * W, 0, 6.28); ctx.fill(); }
  }
  if (S.flash && S.flash.v > 0) { ctx.fillStyle = `rgba(190,205,230,${S.flash.v * 0.35})`; ctx.fillRect(0, 0, W, H); }
  sc.layers.forEach((L, i) => {
    const off = px * W * (L.depth ?? 0.004 + i * 0.012);
    const top = Math.min(...L.pts) * H;
    g = ctx.createLinearGradient(0, top, 0, H); g.addColorStop(0, L.c); g.addColorStop(1, L.c2 || L.c);
    ctx.fillStyle = g; ridgePath(ctx, L.pts, W, H, off); ctx.fill();
    if (L.snow) {
      ctx.save(); ridgePath(ctx, L.pts, W, H, off); ctx.clip();
      const sl = L.snow.line * H;
      g = ctx.createLinearGradient(0, top, 0, sl); g.addColorStop(0, L.snow.c); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, top - 2, W, sl - top + 2);
      ctx.globalAlpha = 0.16; ctx.strokeStyle = L.snow.shade || 'rgba(20,30,40,.8)'; ctx.lineWidth = Math.max(1, W / 900);
      for (let k = 0; k < 45; k++) {
        const x = sc.extra[k] * W * 1.1 - W * 0.05 + off;
        const y0 = ridgeY(L.pts, W, x, off) * H;
        ctx.beginPath(); ctx.moveTo(x, y0);
        ctx.lineTo(x + (sc.extra[k + 70] - 0.5) * W * 0.03, y0 + (sl - y0) * (0.4 + sc.extra[k + 140] * 0.8)); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (L.snow.lit) {
        g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, L.snow.lit); g.addColorStop(0.6, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0, top, W, sl - top);
      }
      ctx.restore();
    }
    if (S.fogAfter && S.fogAfter.includes(i) && S.fog) {
      const fy = (L.base + 0.02) * H, dr = Math.sin(t * 0.12 + i) * W * 0.03;
      g = ctx.createLinearGradient(0, fy - H * 0.1, 0, fy + H * 0.12);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, S.fog); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.save(); ctx.translate(dr, 0); ctx.fillRect(-W * 0.1, fy - H * 0.1, W * 1.2, H * 0.22); ctx.restore();
    }
    if (S.featureAt === i && S.feature && FEATURES[S.feature]) FEATURES[S.feature](ctx, W, H, t, px * W * 0.03, sc);
  });
  if (S.after && FEATURES[S.after]) FEATURES[S.after](ctx, W, H, t, px * W * 0.045, sc);
  g = ctx.createRadialGradient(W * 0.5, H * 0.45, Math.min(W, H) * 0.3, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

/* ---------- drawn objects ---------- */
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = (v: number) => clamp(Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt), 0, 255);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
function wallGrad(ctx: Ctx, x: number, w: number, base: string) {
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, base); g.addColorStop(1, shade(base, -0.28));
  return g;
}
export function dzong(ctx: Ctx, cx: number, by: number, w: number, o: { night?: boolean } = {}) {
  const wall = '#d9d3c3', red = '#8a2f22', roof = '#2c2723', gold = '#c99a3f', night = o.night;
  const h = w * 0.2, ins = w * 0.018;
  ctx.fillStyle = '#4a4640'; ctx.fillRect(cx - w / 2 - w * 0.01, by - h * 0.12, w * 1.02, h * 0.14);
  ctx.fillStyle = wallGrad(ctx, cx - w / 2, w, wall);
  ctx.beginPath(); ctx.moveTo(cx - w / 2, by - h * 0.1); ctx.lineTo(cx + w / 2, by - h * 0.1); ctx.lineTo(cx + w / 2 - ins, by - h); ctx.lineTo(cx - w / 2 + ins, by - h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = red; ctx.fillRect(cx - w / 2 + ins, by - h, w - 2 * ins, h * 0.13);
  ctx.fillStyle = roof; ctx.fillRect(cx - w / 2 + ins - w * 0.012, by - h - h * 0.09, w - 2 * ins + w * 0.024, h * 0.09);
  const r2 = rng(Math.round(w)), cols = Math.floor(w / (h * 0.3));
  for (const yy of [0.38, 0.62]) for (let i = 1; i < cols; i++) {
    const x = cx - w / 2 + (i * w) / cols;
    if (Math.abs(x - cx) < w * 0.11) continue;
    const lit = night && r2() < 0.45;
    ctx.fillStyle = lit ? '#f4c46a' : '#2a2522'; ctx.fillRect(x - h * 0.035, by - h * yy - h * 0.05, h * 0.07, h * 0.1);
  }
  for (const s of [-1, 1]) {
    const tx = cx + s * w * 0.38, tw = w * 0.12, th = h * 0.42, ty = by - h - h * 0.09 - th;
    ctx.fillStyle = wallGrad(ctx, tx - tw / 2, tw, wall); ctx.fillRect(tx - tw / 2, ty, tw, th);
    ctx.fillStyle = red; ctx.fillRect(tx - tw / 2, ty, tw, th * 0.2);
    ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(tx - tw * 0.62, ty); ctx.lineTo(tx + tw * 0.62, ty); ctx.lineTo(tx + tw * 0.4, ty - h * 0.12); ctx.lineTo(tx - tw * 0.4, ty - h * 0.12); ctx.fill();
  }
  const uw = w * 0.2, uh = h * 1.05, ub = by - h - h * 0.09;
  ctx.fillStyle = wallGrad(ctx, cx - uw / 2, uw, wall); ctx.fillRect(cx - uw / 2, ub - uh, uw, uh);
  ctx.fillStyle = red; ctx.fillRect(cx - uw / 2, ub - uh, uw, uh * 0.14);
  for (const yy of [0.35, 0.62]) for (let i = 1; i < 4; i++) {
    const x = cx - uw / 2 + (i * uw) / 4, lit = night && r2() < 0.5;
    ctx.fillStyle = lit ? '#f4c46a' : '#2a2522'; ctx.fillRect(x - h * 0.03, ub - uh * yy - h * 0.05, h * 0.06, h * 0.1);
  }
  const tier = (y: number, ww: number, hh: number) => { ctx.fillStyle = gold; ctx.beginPath(); ctx.moveTo(cx - ww / 2, y); ctx.lineTo(cx + ww / 2, y); ctx.lineTo(cx + ww * 0.32, y - hh); ctx.lineTo(cx - ww * 0.32, y - hh); ctx.fill(); };
  let y = ub - uh;
  tier(y, uw * 1.35, h * 0.16); y -= h * 0.16;
  ctx.fillStyle = wallGrad(ctx, cx - uw * 0.3, uw * 0.6, wall); ctx.fillRect(cx - uw * 0.28, y - h * 0.18, uw * 0.56, h * 0.18); y -= h * 0.18;
  tier(y, uw * 0.85, h * 0.14); y -= h * 0.14;
  ctx.strokeStyle = gold; ctx.lineWidth = Math.max(1, w * 0.004); ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx, y - h * 0.2); ctx.stroke();
  ctx.fillStyle = gold; ctx.beginPath(); ctx.arc(cx, y - h * 0.22, w * 0.006, 0, 6.28); ctx.fill();
}
export function chorten(ctx: Ctx, x: number, y: number, s: number, lit?: string) {
  const wcol = '#ddd7c8', dark = '#8d877b';
  const g = ctx.createLinearGradient(x - s / 2, 0, x + s / 2, 0);
  g.addColorStop(0, lit || wcol); g.addColorStop(0.55, wcol); g.addColorStop(1, dark);
  ctx.fillStyle = g; ctx.fillRect(x - s / 2, y - s * 0.28, s, s * 0.28);
  ctx.fillStyle = '#8a2f22'; ctx.fillRect(x - s / 2, y - s * 0.33, s, s * 0.05);
  ctx.fillStyle = g; ctx.fillRect(x - s * 0.38, y - s * 0.42, s * 0.76, s * 0.09);
  ctx.beginPath(); ctx.ellipse(x, y - s * 0.42, s * 0.32, s * 0.3, 0, Math.PI, 0); ctx.fill();
  ctx.fillRect(x - s * 0.1, y - s * 0.84, s * 0.2, s * 0.14);
  ctx.fillStyle = '#c99a3f'; ctx.beginPath(); ctx.moveTo(x - s * 0.08, y - s * 0.84); ctx.lineTo(x + s * 0.08, y - s * 0.84); ctx.lineTo(x, y - s * 1.25); ctx.fill();
}
export function pine(ctx: Ctx, x: number, y: number, h: number, c: string) {
  ctx.fillStyle = c; ctx.beginPath();
  const w = h * 0.32; ctx.moveTo(x, y - h);
  for (let i = 1; i <= 5; i++) { const yy = y - h + (h * i) / 5.4, ww = (w * i) / 5; ctx.lineTo(x + ww, yy); ctx.lineTo(x + ww * 0.45, yy); }
  ctx.lineTo(x + w * 0.1, y); ctx.lineTo(x - w * 0.1, y);
  for (let i = 5; i >= 1; i--) { const yy = y - h + (h * i) / 5.4, ww = (w * i) / 5; ctx.lineTo(x - ww * 0.45, yy); ctx.lineTo(x - ww, yy); }
  ctx.closePath(); ctx.fill();
}
export function crane(ctx: Ctx, x: number, y: number, s: number, t: number, ph: number, c: string) {
  const f = Math.sin(t * 5 + ph);
  ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = Math.max(1, s * 0.06); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.ellipse(x, y, s * 0.35, s * 0.09, 0, 0, 6.28); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + s * 0.3, y); ctx.lineTo(x + s * 0.75, y - s * 0.05); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - s * 0.3, y); ctx.lineTo(x - s * 0.85, y + s * 0.04); ctx.stroke();
  ctx.lineWidth = Math.max(1, s * 0.08);
  ctx.beginPath(); ctx.moveTo(x - s * 0.05, y); ctx.quadraticCurveTo(x - s * 0.25, y - s * 0.5 * f, x - s * 0.55, y - s * 0.75 * f); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + s * 0.05, y); ctx.quadraticCurveTo(x - s * 0.1, y - s * 0.45 * f, x - s * 0.35, y - s * 0.62 * f); ctx.stroke();
}
export const FLAG_COLORS = ['#3a6db5', '#e9e6dc', '#b8392b', '#3f8a55', '#d8ad38'];
export function flagLine(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, sag: number, n: number, s: number, t: number, wind: number, ph: number) {
  ctx.strokeStyle = 'rgba(220,220,210,.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + sag, x2, y2); ctx.stroke();
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const x = (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * ((x1 + x2) / 2) + u * u * x2;
    const y = (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * ((y1 + y2) / 2 + sag) + u * u * y2;
    const a = Math.sin(t * (2 + wind * 4) + i * 0.7 + ph) * (0.12 + wind * 0.5) + wind * 0.35;
    ctx.save(); ctx.translate(x, y); ctx.rotate(-a * 0.9); ctx.transform(1, 0, Math.sin(t * 3 + i) * 0.15 * wind, 1, 0, 0);
    ctx.globalAlpha = 0.88; ctx.fillStyle = FLAG_COLORS[i % 5]; ctx.fillRect(-s * 0.45, 0, s * 0.9, s * 1.15 * (1 - wind * 0.25));
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
function yak(ctx: Ctx, x: number, y: number, s: number, c: string, flip?: boolean) {
  ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1); ctx.fillStyle = c;
  ctx.beginPath(); ctx.ellipse(0, -s * 0.45, s * 0.55, s * 0.3, 0, 0, 6.28); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s * 0.12, -s * 0.68, s * 0.25, s * 0.18, 0, 0, 6.28); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s * 0.6, -s * 0.42, s * 0.16, s * 0.13, 0.4, 0, 6.28); ctx.fill();
  for (const lx of [-0.4, -0.2, 0.2, 0.34]) ctx.fillRect(s * lx, -s * 0.3, s * 0.08, s * 0.3);
  ctx.strokeStyle = c; ctx.lineWidth = s * 0.04; ctx.beginPath(); ctx.moveTo(s * 0.62, -s * 0.52); ctx.quadraticCurveTo(s * 0.78, -s * 0.7, s * 0.7, -s * 0.78); ctx.stroke();
  ctx.restore();
}
function ground(ctx: Ctx, _W: number, H: number, top: number, c1: string, c2: string) {
  const g = ctx.createLinearGradient(0, H * top, 0, H); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g;
}

const FEATURES: Record<string, Feature> = {
  taktsang(ctx, W, H, t, o) {
    const s = Math.min(W, H * 1.4), cx = W * 0.6 + o;
    let g = ctx.createLinearGradient(cx, 0, W, 0);
    g.addColorStop(0, '#2b3133'); g.addColorStop(0.25, '#171c1e'); g.addColorStop(1, '#0d1112');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - W * 0.02, H); ctx.lineTo(cx + W * 0.01, H * 0.78); ctx.lineTo(cx - W * 0.015, H * 0.62); ctx.lineTo(cx + W * 0.005, H * 0.5); ctx.lineTo(cx - W * 0.01, H * 0.36); ctx.lineTo(cx + W * 0.03, H * 0.2); ctx.lineTo(cx + W * 0.02, H * 0.05); ctx.lineTo(cx + W * 0.06, -5); ctx.lineTo(W + 20, -5); ctx.lineTo(W + 20, H); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = Math.max(1, W / 700);
    for (let i = 0; i < 26; i++) { const x = cx + W * 0.03 + i * W * 0.016; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + Math.sin(i) * W * 0.01, H); ctx.stroke(); }
    const ax = cx + W * 0.012, ay = H * 0.47, u = s * 0.026;
    const B: [number, number, number, number][] = [[-1.9, -1.2, 1.3, 1.1], [-0.7, -2.1, 1.4, 1.7], [-2.6, -0.1, 1.2, 0.9], [0.2, -1.0, 1.2, 1.2], [-1.4, 0.7, 1.2, 0.8]];
    for (const [bx, by, bw, bh] of B) {
      const x = ax + bx * u, y = ay + by * u, w = bw * u, h = bh * u;
      ctx.fillStyle = wallGrad(ctx, x, w, '#e3dccb'); ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#8a2f22'; ctx.fillRect(x, y, w, h * 0.16);
      ctx.fillStyle = '#2a2522'; for (let k = 1; k < 3; k++) ctx.fillRect(x + (w * k) / 3 - u * 0.06, y + h * 0.45, u * 0.12, u * 0.18);
      ctx.fillStyle = bx === -0.7 ? '#d0a243' : '#3a332d';
      ctx.beginPath(); ctx.moveTo(x - u * 0.15, y); ctx.lineTo(x + w + u * 0.15, y); ctx.lineTo(x + w * 0.8, y - u * 0.32); ctx.lineTo(x + w * 0.2, y - u * 0.32); ctx.fill();
    }
    ctx.strokeStyle = '#d0a243'; ctx.lineWidth = Math.max(1, u * 0.06); ctx.beginPath(); ctx.moveTo(ax, ay - 2.45 * u); ctx.lineTo(ax, ay - 2.8 * u); ctx.stroke();
    ground(ctx, W, H, 0.7, '#141c1a', '#0a0f0e');
    ctx.beginPath(); ctx.moveTo(-10, H * 0.82); ctx.quadraticCurveTo(W * 0.3, H * 0.72, W * 0.58 + o, H * 0.86); ctx.lineTo(W * 0.6 + o, H + 5); ctx.lineTo(-10, H + 5); ctx.fill();
    const r = rng(7);
    for (let i = 0; i < 46; i++) { const x = r() * W * 0.6, y = H * 0.8 + r() * H * 0.2 + (x / W) * H * 0.04; pine(ctx, x + o * 1.4, y, H * (0.06 + r() * 0.09), '#0b1110'); }
    g = ctx.createLinearGradient(0, H * 0.6, 0, H * 0.8);
    g.addColorStop(0, 'rgba(170,180,185,0)'); g.addColorStop(0.5, 'rgba(170,180,185,.16)'); g.addColorStop(1, 'rgba(170,180,185,0)');
    ctx.fillStyle = g; ctx.fillRect(Math.sin(t * 0.15) * W * 0.05 - W * 0.1, H * 0.6, W * 1.2, H * 0.2);
  },
  punakha(ctx, W, H, _t, o) {
    ground(ctx, W, H, 0.7, '#1d2a24', '#0c120f'); ctx.fillRect(0, H * 0.72, W, H * 0.3);
    const rv = (x1: number, y1: number, cx1: number, cy1: number, x2: number, y2: number) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx1, cy1, x2, y2); ctx.stroke(); };
    ctx.lineCap = 'round';
    for (const [lw, c] of [[H * 0.05, '#2b4a52'], [H * 0.025, '#4e7880'], [H * 0.006, 'rgba(220,230,225,.5)']] as [number, string][]) {
      ctx.lineWidth = lw; ctx.strokeStyle = c;
      rv(-20 + o, H * 0.79, W * 0.25 + o, H * 0.78, W * 0.47 + o, H * 0.86);
      rv(W + 20 + o, H * 0.8, W * 0.75 + o, H * 0.8, W * 0.47 + o, H * 0.86);
      rv(W * 0.47 + o, H * 0.86, W * 0.45 + o, H * 0.95, W * 0.38 + o, H + 20);
    }
    dzong(ctx, W * 0.58 + o, H * 0.79, Math.min(W * 0.36, H * 0.7));
    const r = rng(11);
    for (let i = 0; i < 34; i++) {
      const side = i % 2, x = side ? W * (0.78 + r() * 0.25) : W * (r() * 0.25), y = H * (0.8 + r() * 0.16), R = H * (0.016 + r() * 0.022);
      ctx.fillStyle = '#1a1512'; ctx.fillRect(x + o * 1.4 - R * 0.08, y, R * 0.16, R * 1.2);
      for (let k = 0; k < 5; k++) { ctx.fillStyle = ['#6b4c8f', '#7e5ca6', '#5a3f7a', '#8f6cb8'][k % 4]; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(x + o * 1.4 + (r() - 0.5) * R * 1.4, y - R * 0.3 + (r() - 0.5) * R * 0.8, R * (0.55 + r() * 0.4), 0, 6.28); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
  },
  gangkhar(ctx, W, H, t) {
    const p = (t % 9) / 9;
    if (p < 0.12) {
      const q = p / 0.12, x = W * (0.15 + q * 0.3), y = H * (0.08 + q * 0.12);
      const g = ctx.createLinearGradient(x, y, x - W * 0.08, y - H * 0.05); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - W * 0.08, y - H * 0.05); ctx.stroke();
    }
  },
  gangkharFront(ctx, W, H, _t, o) {
    const x = W * 0.3 + o, y = H * 0.93;
    ctx.fillStyle = '#e8a13c'; ctx.beginPath(); ctx.moveTo(x - H * 0.012, y); ctx.lineTo(x + H * 0.012, y); ctx.lineTo(x, y - H * 0.016); ctx.fill();
    const g = ctx.createRadialGradient(x, y, 0, x, y, H * 0.05); g.addColorStop(0, 'rgba(232,161,60,.35)'); g.addColorStop(1, 'rgba(232,161,60,0)');
    ctx.fillStyle = g; ctx.fillRect(x - H * 0.05, y - H * 0.05, H * 0.1, H * 0.1);
  },
  dochula(ctx, W, H, t, o) {
    const mx = W * 0.62 + o, my = H * 0.66;
    ground(ctx, W, H, 0.66, '#26312b', '#0e1411');
    ctx.beginPath(); ctx.moveTo(-10, H * 0.86); ctx.quadraticCurveTo(W * 0.3, H * 0.82, mx - W * 0.28, H * 0.74); ctx.quadraticCurveTo(mx, my - H * 0.05, mx + W * 0.3, H * 0.76); ctx.quadraticCurveTo(W * 0.95, H * 0.84, W + 10, H * 0.88); ctx.lineTo(W + 10, H + 5); ctx.lineTo(-10, H + 5); ctx.fill();
    const s = Math.min(W, H * 1.5);
    const rings: [number, number, number, number][] = [[27, 0.13, 0.035, 0], [36, 0.2, 0.06, 0.04], [45, 0.27, 0.085, 0.085]];
    for (const [n, rx, ry, dy] of rings) for (let i = 0; i < n; i++) {
      const a = Math.PI * (i / (n - 1));
      chorten(ctx, mx - Math.cos(a) * rx * W, my + H * 0.02 + dy * H + Math.sin(a) * ry * H * 0.25 - Math.sin(a) * H * 0.03, s * (0.016 + dy * 0.07), '#f2e3cf');
    }
    dzong(ctx, mx, my - H * 0.035, W * 0.075);
    flagLine(ctx, -10, H * 0.55, W * 0.38 + o, H * 0.7, H * 0.06, 16, H * 0.022, t, 0.3, 0);
  },
  buddha(ctx, W, H, t, o) {
    const cx = W * 0.64 + o, base = H * 0.7, h = Math.min(H * 0.5, W * 0.4);
    ground(ctx, W, H, 0.7, '#1b2120', '#0b0f0f');
    ctx.beginPath(); ctx.moveTo(W * 0.35 + o, H); ctx.quadraticCurveTo(cx - h * 0.6, base - h * 0.02, cx, base); ctx.quadraticCurveTo(cx + h * 0.8, base + h * 0.02, W + 10, H * 0.82); ctx.lineTo(W + 10, H + 5); ctx.fill();
    let g = ctx.createRadialGradient(cx, base - h * 0.55, 0, cx, base - h * 0.55, h * 0.9);
    g.addColorStop(0, 'rgba(240,190,90,.28)'); g.addColorStop(1, 'rgba(240,190,90,0)'); ctx.fillStyle = g; ctx.fillRect(cx - h, base - h * 1.5, h * 2, h * 1.6);
    const gold = ctx.createLinearGradient(cx - h * 0.4, 0, cx + h * 0.4, 0);
    gold.addColorStop(0, '#f6d27d'); gold.addColorStop(0.45, '#c98f2e'); gold.addColorStop(1, '#6d4512');
    ctx.fillStyle = '#3e3a33'; ctx.fillRect(cx - h * 0.42, base - h * 0.08, h * 0.84, h * 0.08);
    ctx.fillStyle = '#5a534a'; ctx.fillRect(cx - h * 0.38, base - h * 0.14, h * 0.76, h * 0.06);
    ctx.fillStyle = gold;
    for (let i = 0; i < 9; i++) { const x = cx - h * 0.34 + i * h * 0.085; ctx.beginPath(); ctx.ellipse(x, base - h * 0.15, h * 0.045, h * 0.035, 0, Math.PI, 0); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(cx - h * 0.17, base - h * 0.24); ctx.bezierCurveTo(cx - h * 0.2, base - h * 0.42, cx - h * 0.2, base - h * 0.56, cx - h * 0.09, base - h * 0.61); ctx.lineTo(cx + h * 0.09, base - h * 0.61); ctx.bezierCurveTo(cx + h * 0.2, base - h * 0.56, cx + h * 0.2, base - h * 0.42, cx + h * 0.17, base - h * 0.24); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx, base - h * 0.235, h * 0.3, h * 0.085, 0, 0, 6.28); ctx.fill();
    ctx.strokeStyle = 'rgba(90,55,15,.55)'; ctx.lineWidth = Math.max(1, h * 0.005); ctx.beginPath(); ctx.ellipse(cx, base - h * 0.25, h * 0.2, h * 0.04, 0, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.fillRect(cx - h * 0.03, base - h * 0.65, h * 0.06, h * 0.05);
    ctx.beginPath(); ctx.ellipse(cx, base - h * 0.71, h * 0.062, h * 0.078, 0, 0, 6.28); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, base - h * 0.79, h * 0.03, 0, 6.28); ctx.fill();
    ctx.fillRect(cx - h * 0.075, base - h * 0.73, h * 0.02, h * 0.06); ctx.fillRect(cx + h * 0.055, base - h * 0.73, h * 0.02, h * 0.06);
    ctx.strokeStyle = 'rgba(80,50,15,.6)'; ctx.lineWidth = Math.max(1, h * 0.006); ctx.beginPath(); ctx.moveTo(cx - h * 0.14, base - h * 0.5); ctx.quadraticCurveTo(cx, base - h * 0.36, cx + h * 0.15, base - h * 0.55); ctx.stroke();
    const r = rng(3), px = 1.6 * (W / 1400 + 0.5);
    for (let i = 0; i < 220; i++) { const x = r() * W * 0.6 + o * 1.2, y = H * (0.84 + r() * 0.14), a = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.5 + r()) + i)); ctx.fillStyle = `rgba(${r() < 0.7 ? '250,200,120' : '200,220,255'},${a * 0.8})`; ctx.fillRect(x, y, px, px); }
  },
  phobjikha(ctx, W, H, t, o) {
    ground(ctx, W, H, 0.76, '#3b3a2d', '#14140f'); ctx.fillRect(0, H * 0.78, W, H * 0.24);
    ctx.strokeStyle = 'rgba(180,190,200,.25)'; ctx.lineWidth = H * 0.004; ctx.beginPath(); ctx.moveTo(W * 0.1 + o, H * 0.95); ctx.bezierCurveTo(W * 0.3 + o, H * 0.84, W * 0.5 + o, H * 0.92, W * 0.9 + o, H * 0.82); ctx.stroke();
    ctx.fillStyle = '#232a26'; ctx.beginPath(); ctx.ellipse(W * 0.32 + o, H * 0.79, W * 0.12, H * 0.05, 0, Math.PI, 0); ctx.fill();
    dzong(ctx, W * 0.32 + o, H * 0.75, W * 0.12);
    for (let i = 0; i < 9; i++) { const x = (((t * 0.018 + 0.12 + i * 0.035) % 1.4) - 0.2) * W, y = H * (0.3 + Math.abs(i - 4) * 0.025 + Math.sin(t * 0.4 + i) * 0.01) + i * H * 0.006; crane(ctx, x, y, H * 0.04, t, i * 0.8, 'rgba(16,20,24,.85)'); }
  },
  jomolhari(ctx, W, H, _t, o) {
    ground(ctx, W, H, 0.78, '#2b3226', '#10140e');
    ctx.beginPath(); ctx.moveTo(-10, H * 0.82); ctx.quadraticCurveTo(W * 0.5, H * 0.76, W + 10, H * 0.84); ctx.lineTo(W + 10, H + 5); ctx.lineTo(-10, H + 5); ctx.fill();
    ctx.strokeStyle = 'rgba(200,220,230,.35)'; ctx.lineWidth = H * 0.006; ctx.beginPath(); ctx.moveTo(W * 0.55 + o, H * 0.8); ctx.bezierCurveTo(W * 0.5 + o, H * 0.86, W * 0.7 + o, H * 0.9, W * 0.6 + o, H + 5); ctx.stroke();
    for (const [x, c] of [[0.18, '#d9a43f'], [0.22, '#e3ded0'], [0.255, '#d9a43f']] as [number, string][]) {
      const X = W * x + o * 1.3, Y = H * 0.86;
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(X - H * 0.03, Y); ctx.lineTo(X + H * 0.03, Y); ctx.lineTo(X, Y - H * 0.04); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X + H * 0.03, Y); ctx.lineTo(X, Y - H * 0.04); ctx.fill();
    }
    yak(ctx, W * 0.72 + o * 1.5, H * 0.93, H * 0.08, '#0d0f0c'); yak(ctx, W * 0.84 + o * 1.5, H * 0.95, H * 0.1, '#0b0d0a', true); yak(ctx, W * 0.4 + o * 1.5, H * 0.9, H * 0.055, '#11140f');
  },
  dzongSmall(ctx, W, H, _t, o, sc) {
    const k = sc.spec.k || {};
    ground(ctx, W, H, 0.7, '#1f2722', '#0c100e');
    ctx.beginPath(); ctx.moveTo(-10, H * 0.86); ctx.quadraticCurveTo(W * 0.5, H * 0.7, W + 10, H * 0.86); ctx.lineTo(W + 10, H + 5); ctx.lineTo(-10, H + 5); ctx.fill();
    dzong(ctx, W * (k.x || 0.5) + o, H * 0.79, W * (k.w || 0.42), { night: k.night });
  },
  temple(ctx, W, H, t, o) {
    ground(ctx, W, H, 0.7, '#1f2722', '#0c100e'); ctx.fillRect(0, H * 0.8, W, H * 0.2);
    dzong(ctx, W * 0.5 + o, H * 0.82, W * 0.24);
    const r = rng(5); for (let i = 0; i < 24; i++) pine(ctx, r() * W, H * (0.84 + r() * 0.16), H * (0.08 + r() * 0.1), '#0a0f0d');
    flagLine(ctx, W * 0.05, H * 0.6, W * 0.36, H * 0.72, H * 0.05, 12, H * 0.03, t, 0.3, 1);
  },
  chortenScene(ctx, W, H, _t, o) {
    ground(ctx, W, H, 0.7, '#232a26', '#0c100e'); ctx.fillRect(0, H * 0.8, W, H * 0.2);
    chorten(ctx, W * 0.5 + o, H * 0.86, H * 0.5, '#f5ead8');
    const r = rng(8); for (let i = 0; i < 16; i++) pine(ctx, (i < 8 ? r() * 0.3 : 0.7 + r() * 0.3) * W, H * (0.86 + r() * 0.12), H * (0.1 + r() * 0.1), '#0a0f0d');
  },
  lake(ctx, W, H, t, o) {
    ground(ctx, W, H, 0.68, '#14211f', '#071010'); ctx.fillRect(0, H * 0.7, W, H * 0.3);
    ctx.fillStyle = '#0d1715'; ctx.beginPath(); ctx.ellipse(W * 0.5 + o, H * 0.86, W * 0.32, H * 0.07, 0, 0, 6.28); ctx.fill();
    const r = rng(9);
    for (let i = 0; i < 30; i++) { const x = W * 0.5 + o + (r() - 0.5) * W * 0.5, y = H * (0.84 + r() * 0.05), a = 0.3 + 0.7 * Math.abs(Math.sin(t * 1.7 + i)); ctx.fillStyle = `rgba(244,180,90,${a * 0.7})`; ctx.beginPath(); ctx.arc(x, y, H * 0.004, 0, 6.28); ctx.fill(); }
    for (let i = 0; i < 30; i++) pine(ctx, (i < 15 ? r() * 0.25 : 0.75 + r() * 0.25) * W + o * 1.3, H * (0.8 + r() * 0.2), H * (0.12 + r() * 0.15), '#070c0b');
    flagLine(ctx, W * 0.2, H * 0.62, W * 0.8, H * 0.6, H * 0.06, 20, H * 0.025, t, 0.25, 2);
  },
  jungle(ctx, W, H, t, o) {
    const r = rng(13);
    for (let L = 0; L < 3; L++) {
      ctx.fillStyle = ['#122019', '#0d1812', '#08100c'][L];
      for (let i = 0; i < 40; i++) { const x = r() * W * 1.1 - W * 0.05 + o * (L + 1) * 0.5, y = H * (0.62 + L * 0.1 + r() * 0.08); ctx.beginPath(); ctx.arc(x, y, H * (0.05 + r() * 0.07), 0, 6.28); ctx.fill(); }
      ctx.fillRect(0, H * (0.66 + L * 0.1), W, H);
    }
    const blink = Math.sin(t * 0.7) > 0.92 ? 0 : 1;
    ctx.fillStyle = `rgba(240,200,90,${0.9 * blink})`;
    for (const dx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(W * 0.62 + o * 2 + dx * H * 0.018, H * 0.86, H * 0.008, H * 0.005, 0, 0, 6.28); ctx.fill(); }
  },
  town(ctx, W, H, t) {
    const r = rng(17);
    ground(ctx, W, H, 0.7, '#141a1a', '#080b0b'); ctx.fillRect(0, H * 0.74, W, H * 0.26);
    for (let i = 0; i < 34; i++) {
      const x = r() * W, w = W * (0.03 + r() * 0.04), h = H * (0.05 + r() * 0.07), y = H * (0.78 + r() * 0.14);
      ctx.fillStyle = '#1d2221'; ctx.fillRect(x, y - h, w, h);
      ctx.fillStyle = '#8a2f22'; ctx.fillRect(x, y - h, w, h * 0.15);
      ctx.fillStyle = '#2f2924'; ctx.beginPath(); ctx.moveTo(x - w * 0.1, y - h); ctx.lineTo(x + w * 1.1, y - h); ctx.lineTo(x + w * 0.85, y - h - h * 0.25); ctx.lineTo(x + w * 0.15, y - h - h * 0.25); ctx.fill();
      for (let k = 0; k < 3; k++) if (r() < 0.6) { ctx.fillStyle = `rgba(245,196,106,${0.6 + 0.4 * Math.sin(t + i + k)})`; ctx.fillRect(x + w * (0.2 + k * 0.25), y - h * 0.6, w * 0.1, h * 0.15); }
    }
  },
  airport(ctx, W, H, t) {
    ground(ctx, W, H, 0.75, '#1a2420', '#0a0f0d'); ctx.fillRect(0, H * 0.76, W, H * 0.24);
    ctx.fillStyle = '#2b2f30'; ctx.beginPath(); ctx.moveTo(W * 0.1, H * 0.97); ctx.lineTo(W * 0.9, H * 0.97); ctx.lineTo(W * 0.62, H * 0.8); ctx.lineTo(W * 0.4, H * 0.8); ctx.fill();
    for (let i = 0; i < 12; i++) { const u = i / 11, y = lerp(H * 0.8, H * 0.97, u), xl = lerp(W * 0.4, W * 0.1, u), xr = lerp(W * 0.62, W * 0.9, u), a = 0.5 + 0.5 * Math.sin(t * 3 - i * 0.6); ctx.fillStyle = `rgba(255,210,120,${a})`; ctx.fillRect(xl, y, 3, 2); ctx.fillRect(xr, y, 3, 2); }
    const p = (t * 0.08) % 1, x = lerp(W * 1.05, W * 0.45, p), y = lerp(H * 0.3, H * 0.72, p);
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.18 + Math.sin(t * 0.8) * 0.08); ctx.fillStyle = '#d9dcd8';
    ctx.beginPath(); ctx.ellipse(0, 0, H * 0.05, H * 0.008, 0, 0, 6.28); ctx.fill(); ctx.fillRect(-H * 0.012, -H * 0.003, H * 0.024, H * 0.032); ctx.fillRect(H * 0.035, -H * 0.02, H * 0.008, H * 0.02);
    ctx.restore();
  },
  village(ctx, W, H, _t, o) {
    ground(ctx, W, H, 0.7, '#26302a', '#0e120f');
    ctx.beginPath(); ctx.moveTo(-10, H * 0.84); ctx.quadraticCurveTo(W * 0.5, H * 0.74, W + 10, H * 0.86); ctx.lineTo(W + 10, H + 5); ctx.lineTo(-10, H + 5); ctx.fill();
    const r = rng(23);
    for (let i = 0; i < 9; i++) {
      const x = W * (0.15 + i * 0.08 + r() * 0.03) + o, w = W * 0.05, h = H * 0.06, y = H * (0.84 + r() * 0.06);
      ctx.fillStyle = wallGrad(ctx, x, w, '#d8d0bd'); ctx.fillRect(x, y - h, w, h);
      ctx.fillStyle = '#5b3a26'; ctx.fillRect(x, y - h, w, h * 0.35);
      ctx.fillStyle = '#3a3530'; ctx.beginPath(); ctx.moveTo(x - w * 0.15, y - h); ctx.lineTo(x + w * 1.15, y - h); ctx.lineTo(x + w * 0.9, y - h - h * 0.3); ctx.lineTo(x + w * 0.1, y - h - h * 0.3); ctx.fill();
    }
    yak(ctx, W * 0.8 + o, H * 0.95, H * 0.08, '#0b0d0a');
  },
  pass(ctx, W, H, t, o) {
    ground(ctx, W, H, 0.7, '#2a2f2a', '#0e110f');
    ctx.beginPath(); ctx.moveTo(-10, H * 0.9); ctx.quadraticCurveTo(W * 0.5, H * 0.7, W + 10, H * 0.9); ctx.lineTo(W + 10, H + 5); ctx.lineTo(-10, H + 5); ctx.fill();
    for (let k = 0; k < 4; k++) flagLine(ctx, W * (0.05 + k * 0.05), H * (0.5 + k * 0.04), W * (0.95 - k * 0.06), H * (0.55 + k * 0.05), H * 0.08, 26, H * 0.024, t, 0.45, k);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = '#e9e6dc'; ctx.fillRect(W * (0.3 + i * 0.1) + o, H * 0.68, 2, H * 0.15); }
  },
  river(ctx, W, H, t, o) {
    ground(ctx, W, H, 0.72, '#1a2722', '#0b110e'); ctx.fillRect(0, H * 0.74, W, H * 0.26);
    ctx.lineCap = 'round';
    for (const [lw, c] of [[H * 0.09, '#24414a'], [H * 0.05, '#3e6872'], [H * 0.008, 'rgba(225,235,230,.6)']] as [number, string][]) {
      ctx.lineWidth = lw; ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(W * 0.4 + o, H * 0.74); ctx.bezierCurveTo(W * 0.3 + o, H * 0.82, W * 0.75 + o, H * 0.86, W * 0.55 + o, H + 20); ctx.stroke();
    }
    const r = rng(29); for (let i = 0; i < 18; i++) pine(ctx, (i < 9 ? r() * 0.28 : 0.75 + r() * 0.25) * W, H * (0.8 + r() * 0.18), H * (0.1 + r() * 0.12), '#08100c');
    const bx = W * (0.35 + 0.3 * ((t * 0.04) % 1)) + o; ctx.fillStyle = '#e7a33e'; ctx.beginPath(); ctx.ellipse(bx, H * 0.86, H * 0.02, H * 0.006, 0.2, 0, 6.28); ctx.fill();
  },
  peakFront(ctx, W, H, t, o) { flagLine(ctx, -10, H * 0.7, W * 0.4 + o, H * 0.82, H * 0.05, 14, H * 0.026, t, 0.35, 3); },
};

/* ---------- scene specs ---------- */
const P = (x: number, h: number, w: number, p?: number): Bump => ({ x, h, w, p });
export const SPECS: Record<string, SceneSpec> = {
  taktsang: { seed: 21, sky: ['#0f1720', '#2b3746', '#6e7176', '#8f8174'], glow: { x: 0.3, y: 0.32, r: 0.5, c: 'rgba(250,215,170,.22)' }, fog: 'rgba(150,160,170,.28)', fogAfter: [0, 1],
    layers: [{ base: 0.42, amp: 0.16, rough: 0.55, c: '#5d6670', c2: '#4a535c', snow: { line: 0.38, c: 'rgba(230,235,240,.75)' }, bumps: [P(0.2, 0.12, 0.12)] }, { base: 0.58, amp: 0.14, c: '#353e44', c2: '#262d32' }, { base: 0.72, amp: 0.1, c: '#1c2427', c2: '#131a1c' }], featureAt: 2, feature: 'taktsang' },
  punakha: { seed: 5, sky: ['#141a26', '#3a3e52', '#8a6e6a', '#c9926a'], glow: { x: 0.82, y: 0.44, r: 0.5, c: 'rgba(255,170,110,.35)', disc: 'rgba(255,214,170,.85)', dr: 0.012 }, fog: 'rgba(190,150,140,.18)', fogAfter: [1],
    layers: [{ base: 0.42, amp: 0.14, c: '#4b4a58', c2: '#3d3e4a' }, { base: 0.55, amp: 0.14, c: '#2e3438', c2: '#22292b' }, { base: 0.68, amp: 0.08, c: '#1a2421', c2: '#141c19' }], featureAt: 2, feature: 'punakha' },
  gangkhar: { seed: 77, sky: ['#03060c', '#0a1222', '#1a2840', '#2c3a52'], stars: 420, glow: { x: 0.18, y: 0.16, r: 0.45, c: 'rgba(180,200,240,.22)', disc: 'rgba(235,240,250,.95)', dr: 0.014 }, fog: 'rgba(120,140,170,.18)', fogAfter: [1],
    layers: [{ base: 0.62, amp: 0.1, c: '#cfd8e6', c2: '#4b5a70', rough: 0.6, bumps: [P(0.56, 0.3, 0.3, 1.25), P(0.48, 0.2, 0.12, 1.4), P(0.64, 0.22, 0.12, 1.4)], snow: { line: 0.7, c: 'rgba(240,246,255,1)', lit: 'rgba(200,215,245,.35)', shade: 'rgba(30,45,70,.9)' }, depth: 0.004 }, { base: 0.74, amp: 0.1, c: '#1a2434', c2: '#111827' }, { base: 0.86, amp: 0.07, c: '#0b1019', c2: '#070a10' }], featureAt: 0, feature: 'gangkhar', after: 'gangkharFront' },
  dochula: { seed: 41, sky: ['#1a1f33', '#5a4a63', '#c27e6d', '#efb682'], glow: { x: 0.5, y: 0.5, r: 0.6, c: 'rgba(255,190,140,.35)' }, fog: 'rgba(240,190,170,.18)', fogAfter: [0],
    layers: [{ base: 0.5, amp: 0.1, c: '#f0d6c8', c2: '#8f7a86', rough: 0.65, bumps: [P(0.2, 0.08, 0.08), P(0.35, 0.1, 0.06), P(0.62, 0.12, 0.07), P(0.8, 0.07, 0.06)], snow: { line: 0.52, c: 'rgba(255,235,220,1)', lit: 'rgba(255,170,130,.35)' } }, { base: 0.62, amp: 0.08, c: '#4c4655', c2: '#3a3644' }], featureAt: 1, feature: 'dochula' },
  buddha: { seed: 13, sky: ['#0c1020', '#252a45', '#5a4660', '#a5685a'], stars: 90, starAlpha: 0.6, glow: { x: 0.66, y: 0.4, r: 0.4, c: 'rgba(240,180,90,.18)' }, fog: 'rgba(160,120,140,.2)', fogAfter: [0],
    layers: [{ base: 0.5, amp: 0.14, c: '#3b3a52', c2: '#2c2c40' }, { base: 0.66, amp: 0.1, c: '#20232e', c2: '#171a22' }], featureAt: 1, feature: 'buddha' },
  phobjikha: { seed: 91, sky: ['#2a3646', '#59677a', '#9aa2a6', '#c9c3b4'], glow: { x: 0.7, y: 0.3, r: 0.5, c: 'rgba(255,240,220,.25)' }, fog: 'rgba(210,215,215,.3)', fogAfter: [0, 1],
    layers: [{ base: 0.48, amp: 0.12, c: '#7d8790', c2: '#6a737b', snow: { line: 0.44, c: 'rgba(245,248,250,.8)' } }, { base: 0.6, amp: 0.16, c: '#4c5652', c2: '#3d4642', bumps: [P(0.05, 0.1, 0.2, 1), P(0.95, 0.1, 0.2, 1)] }, { base: 0.74, amp: 0.06, c: '#38402f', c2: '#2d3427' }], featureAt: 2, feature: 'phobjikha' },
  jomolhari: { seed: 56, sky: ['#162036', '#3f4a6a', '#c98a73', '#f2c08a'], glow: { x: 0.5, y: 0.2, r: 0.5, c: 'rgba(255,190,140,.25)' }, fog: 'rgba(230,180,150,.18)', fogAfter: [1],
    layers: [{ base: 0.62, amp: 0.08, c: '#f6dccb', c2: '#7e6e7e', rough: 0.6, bumps: [P(0.5, 0.42, 0.2, 1.15), P(0.62, 0.18, 0.1, 1.3)], snow: { line: 0.6, c: 'rgba(255,236,222,1)', lit: 'rgba(255,150,110,.45)', shade: 'rgba(70,60,90,.8)' }, depth: 0.004 }, { base: 0.74, amp: 0.08, c: '#3a3d40', c2: '#2a2d2f' }], featureAt: 1, feature: 'jomolhari' },
  sky: { seed: 8, sky: ['#04070d', '#0a1424', '#16233a', '#24314a'], stars: 520, glow: { x: 0.8, y: 0.18, r: 0.35, c: 'rgba(170,190,230,.16)', disc: 'rgba(230,235,245,.9)', dr: 0.01 }, fog: 'rgba(80,100,130,.25)', fogAfter: [0], flash: { v: 0 },
    layers: [{ base: 0.8, amp: 0.14, c: '#6f7c92', c2: '#1c2536', rough: 0.6, bumps: [P(0.42, 0.12, 0.12), P(0.78, 0.16, 0.1)], snow: { line: 0.8, c: 'rgba(200,212,232,.75)', shade: 'rgba(15,22,40,.9)' }, depth: 0.003 }, { base: 0.92, amp: 0.06, c: '#0d131c', c2: '#080c12' }] },
  dawn: { seed: 3, sky: ['#0a0e11', '#121a24', '#3b2f3a', '#8a5a48'], stars: 200, starAlpha: 0.6, glow: { x: 0.5, y: 1, r: 0.7, c: 'rgba(231,163,62,.28)' }, fog: 'rgba(231,163,62,.1)', fogAfter: [0],
    layers: [{ base: 0.72, amp: 0.18, c: '#5b4e58', c2: '#2a2630', rough: 0.6, bumps: [P(0.7, 0.2, 0.12, 1.3), P(0.2, 0.12, 0.1)], snow: { line: 0.68, c: 'rgba(255,214,190,.8)' }, depth: 0.004 }, { base: 0.88, amp: 0.08, c: '#14181d', c2: '#0a0e11' }], featureAt: 1, feature: 'peakFront' },
  range: { seed: 61, sky: ['#05080e', '#0d1626', '#22304a', '#4a4f66'], stars: 260, glow: { x: 0.3, y: 0.2, r: 0.5, c: 'rgba(200,210,240,.16)' }, fog: 'rgba(120,135,160,.2)', fogAfter: [0],
    layers: [{ base: 0.62, amp: 0.12, c: '#d8e0ea', c2: '#56627a', rough: 0.6, bumps: [P(0.2, 0.18, 0.14, 1.2), P(0.45, 0.24, 0.15, 1.2), P(0.72, 0.2, 0.14, 1.2)], snow: { line: 0.66, c: 'rgba(240,245,250,.95)', lit: 'rgba(210,220,250,.3)' }, depth: 0.004 }, { base: 0.76, amp: 0.1, c: '#1d2633', c2: '#131a24' }, { base: 0.88, amp: 0.06, c: '#0a0f15', c2: '#06090d' }], featureAt: 2, feature: 'peakFront' },
};

export type SceneKind = 'peak' | 'dzong' | 'temple' | 'chorten' | 'lake' | 'jungle' | 'town' | 'airport' | 'village' | 'pass' | 'river';
export function genericSpec(id: string, kind: SceneKind, night = false, k?: SceneSpec['k']): SceneSpec {
  const r = rng(hash(id));
  const palettes = [['#0f1720', '#2b3746', '#6e7176', '#a08775'], ['#0b1020', '#1f2a44', '#4b5872', '#8a8fa0'], ['#141a26', '#3a3e52', '#8a6e6a', '#c9926a'], ['#03060c', '#0a1222', '#1a2840', '#33425c']];
  const pal = night ? palettes[3] : palettes[Math.floor(r() * 3)];
  const peak = kind === 'peak';
  const layers: LayerSpec[] = [
    { base: peak ? 0.6 : 0.45, amp: peak ? 0.08 : 0.14, c: peak ? '#d8e0ea' : '#5d6670', c2: peak ? '#56627a' : '#4a535c', rough: 0.6, bumps: peak ? [P(0.3 + r() * 0.4, 0.34, 0.22, 1.2)] : [P(r(), 0.1, 0.1)], snow: { line: peak ? 0.66 : 0.42, c: 'rgba(240,245,250,.9)', lit: peak ? 'rgba(255,200,170,.3)' : null }, depth: 0.004 },
    { base: 0.62, amp: 0.12, c: '#30393f', c2: '#232a2e' },
    { base: 0.74, amp: 0.08, c: '#1a2226', c2: '#121819' },
  ];
  const map: Record<SceneKind, string> = { peak: 'peakFront', dzong: 'dzongSmall', temple: 'temple', chorten: 'chortenScene', lake: 'lake', jungle: 'jungle', town: 'town', airport: 'airport', village: 'village', pass: 'pass', river: 'river' };
  return { seed: hash(id), sky: pal, stars: night || peak ? 220 : 0, glow: { x: 0.25 + r() * 0.5, y: 0.3, r: 0.5, c: night ? 'rgba(180,200,240,.15)' : 'rgba(255,200,150,.22)' }, fog: 'rgba(170,175,180,.2)', fogAfter: [0], layers, featureAt: 2, feature: map[kind], k };
}

/* ---------- runtime: paint every canvas[data-scene] on the page ---------- */
export function fitCanvas(cv: HTMLCanvasElement, maxDpr = 1.5) {
  const r = cv.getBoundingClientRect();
  const d = Math.min(window.devicePixelRatio || 1, maxDpr);
  const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  return { W: w, H: h, d };
}
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Animation starts once the page has loaded and gone idle, so painting never competes with first render. */
let readyP: Promise<void> | undefined;
const ready = () => (readyP ??= new Promise<void>((res) => {
  const go = () => setTimeout(() => ('requestIdleCallback' in window ? requestIdleCallback(() => res(), { timeout: 2000 }) : res()), 1200);
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
}));
const FRAME = 1000 / 30;

/** Paint fn once immediately, then at up to 30 fps while el is on screen (after the page is idle). */
export function whileVisible(el: Element, fn: (t: number) => void) {
  let on = false, raf = 0, lastPaint = 0, started = false;
  const tick = (now: number) => {
    if (!on) { raf = 0; return; }
    if (now - lastPaint >= FRAME - 2) { lastPaint = now; fn(now / 1000); }
    raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (on && started && !raf && !reducedMotion()) raf = requestAnimationFrame(tick); };
  new IntersectionObserver((es) => {
    on = es[0].isIntersecting;
    if (on && !started) fn(performance.now() / 1000);
    kick();
  }, { rootMargin: '120px' }).observe(el);
  ready().then(() => { started = true; kick(); });
  addEventListener('resize', () => { if (on && !raf) fn(performance.now() / 1000); }, { passive: true });
}

export function specFromDataset(ds: DOMStringMap): SceneSpec {
  const key = ds.scene || 'range';
  if (SPECS[key]) return SPECS[key];
  return genericSpec(ds.seed || key, (ds.kind as SceneKind) || 'temple', ds.night === 'true', ds.w ? { w: +ds.w, night: ds.night === 'true' } : { night: ds.night === 'true' });
}

export function mountScenes(root: ParentNode = document) {
  root.querySelectorAll<HTMLCanvasElement>('canvas[data-scene]:not([data-mounted])').forEach((cv) => {
    cv.dataset.mounted = '1';
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const sc = buildScene(specFromDataset(cv.dataset));
    const paint = (t: number) => { const { W, H } = fitCanvas(cv); paintScene(ctx, W, H, sc, t); };
    if (cv.dataset.static === 'true') {
      // Thumbnails: paint once when first seen, and again if resized. Keeps grids of many cards cheap.
      const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { paint(4); io.disconnect(); } }, { rootMargin: '200px' });
      io.observe(cv);
      new ResizeObserver(() => { if (cv.width > 1) paint(4); }).observe(cv);
    } else whileVisible(cv, paint);
  });
}
