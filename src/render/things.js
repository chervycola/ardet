// ═══════════════════════════════════════
// ВЕЩЬ В ЗЕМЛЕ — утварь дворов и ткань поля стоят в земле, а не лежат на ней
// картинкой. Под вещью — тень касания (днём и ночью: земле под вещью не
// видно неба), у подошвы — земля своей стороны: сугроб севера, песок юга,
// дёрн с кочкой травы в поле, щебень и сор позднего времени, утоптанное во
// дворе. Старое уходит в землю — культурный слой: чем древнее кольцо, тем
// глубже подошва; обломок прошлой эпохи на шве — глубже своих.
// Вещь — не копия: у каждой своё зерно — крен, сколы углов, мох и снег на
// своих местах. Износ — по эпохе, стороне и огню: мох и лишайник в старых
// кольцах, снег на верхах севера, выбеленное солнцем на юге, копоть снизу и
// пепел на верхах у кольца огня, подпалины катастроф. Свет у вещей — слева,
// как у построек, поэтому вещь не зеркалят.
// Запекается один раз, при первом показе. Живое (огонь, лампа, вода, подвес)
// рисуется каждый кадр — запекается только земля под ним и у подошвы.
// ═══════════════════════════════════════
import { RINGS, RINGS_D } from '../world/disc.js';
import { SEGMENTS } from '../content/ulitsa_db.js';
import { grassPalette } from './grass.js';
import { t as now } from '../core/time.js';

const NI = [13, 11, 10], BO = [217, 207, 184], AS = [138, 141, 143], MG = [61, 74, 58];
const L1 = [200, 184, 154], L2 = [176, 162, 132], K0 = [21, 16, 12], K1 = [36, 28, 20], K2 = [42, 38, 32], K4 = [58, 51, 40];
const EDGE = RINGS_D;                 // где начинается кольцо огня
const SOOT = 150;                     // копоть — на столько точек до огня
const PX = 5, PT = 6, PB = 3;         // поля холста: вбок (крен, сугроб), сверху (снег), снизу (тень)
const css = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k | 0, a[1] + (b[1] - a[1]) * k | 0, a[2] + (b[2] - a[2]) * k | 0];
const GROUND = {};
function ground(ring) {
  if (GROUND[ring]) return GROUND[ring];
  const v = parseInt(SEGMENTS[Math.max(0, Math.min(RINGS - 1, ring - 1))].palette.ground.slice(1), 16);
  return (GROUND[ring] = [v >> 16 & 255, v >> 8 & 255, v & 255]);
}

// зерно вещи → поток чисел (одна вещь — всегда одна и та же)
export function rng(seed) {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── износ: что время, сторона и огонь сделали с вещью ──
// ring — кольцо, где стоит (1…9); era — эпоха самой вещи (обломок прошлой —
// на кольцо раньше); side; d — от городка (огонь — с EDGE); yard — во дворе
// (вещью пользуются: в землю не уходит); old — обломок прошлой эпохи на шве;
// foot — земля у подошвы, если её знает двор (сугроб, нанос, утоптанное)
const BURY = [0.3, 0.2, 0.12, 0.06, 0.03, 0, 0, 0, 0];      // доля высоты в земле, по эпохе
const DAMP = { west: 1.25, east: 1, plain: 0.8, north: 0.45, south: 0 };   // где растёт мох
export function wearOf({ ring, era = ring, side, d, seed, yard = false, old = false, foot = null }) {
  const R = rng(seed * 7 + 3), age = Math.max(0, (6 - era) / 5);   // 1 у осевого, 0 с шестого
  const fire = Math.max(0, Math.min(1, (d - (EDGE - SOOT)) / SOOT));
  const late = era >= 8;
  return {
    bury: yard ? 0 : BURY[era - 1] * (0.55 + 0.5 * R()) + (old ? 0.12 : 0),
    lean: R() < (yard ? 0.25 : 0.55) ? (R() < 0.5 ? -1 : 1) * (1 + (R() < age * 0.6 ? 1 : 0)) : 0,
    chips: Math.round((age * 3 + (era === 7 ? 2 : 0) + fire * 2 + (old ? 1 : 0)) * (0.5 + R())),
    moss: (DAMP[side] ?? 0.8) * (0.008 + 0.045 * age) * (yard ? 0.4 : 1) * (1 - fire),
    snow: side === 'north' ? 0.45 + 0.3 * R() : 0,
    bleach: side === 'south' ? 0.05 + 0.05 * R() : 0,
    soot: fire,
    scorch: era === 7 ? 1 + (R() < 0.5 ? 1 : 0) : 0,
    fade: old ? 0.24 : 0,
    foot: foot || (side === 'north' ? 'snow' : side === 'south' ? 'sand' : yard ? 'yard' : late || fire > 0.3 || ring === 7 ? 'grit' : 'turf'),
    ring, era, side, seed,
  };
}

function canvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  return c;
}

// ── запекание ──
// spec: { x, gy, w, h, draw(ctx, x, gy, t), live, wear, fine, float }
// x — середина, gy — линия земли; рисунок вещи — в w×h над землёй;
// fine — мелочь, чей смысл в одной-двух точках (царапина на черепке, ямка на скале): без крена,
// сколов, снежных шапок и мха, нанос у подошвы её не заносит — тень касания остаётся
// float — на воде (буй у затопленной библиотеки): ни тени касания, ни подошвы — под ним не земля
// тёплое ли у вида рисунок (огонь, свеча, лампа): брошенным в поле тёплое не лежит, у ворот
// и во дворе вперёд очереди не встаёт — тёплых пятен в кадре не больше трёх (render/ground.js,
// render/archground.js). Узнаю по краскам рисунка (без холста)
const WARM = new Map();
export function warmKind(K) {
  if (WARM.has(K.draw)) return WARM.get(K.draw);
  let hot = false;
  const look = v => {
    if (typeof v !== 'string') return;
    let c = null;
    const m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (m) { const h = m[1].length === 3 ? m[1].replace(/./g, ch => ch + ch) : m[1]; const n = parseInt(h, 16); c = [n >> 16 & 255, n >> 8 & 255, n & 255]; }
    const r = v.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/i);
    if (r) c = [+r[1], +r[2], +r[3]];
    if (c && c[0] > 200 && c[2] < 90) hot = true;          // та же мерка, что у теней: огонь
  };
  const ctx = new Proxy({}, {
    get: (t, k) => k === 'canvas' ? { width: 1, height: 1 } : k in t ? t[k]
      : k === 'createLinearGradient' || k === 'createRadialGradient' ? () => ({ addColorStop: (o, c) => look(c) })
      : k === 'measureText' ? () => ({ width: 1 }) : () => {},
    set: (t, k, v) => { if (k === 'fillStyle' || k === 'strokeStyle') look(v); t[k] = v; return true; },
  });
  for (const t of [0, 37, 70, 211, 997]) {                  // огонь мигает: проба в разные мгновения
    try { K.draw(ctx, 0, 0, t); } catch (e) { /* рисунок без холста не обязан работать */ }
  }
  WARM.set(K.draw, hot);
  return hot;
}

const baked = new Map();

export function thing(spec) {
  const T = {
    x: spec.x, gy: spec.gy, w: spec.w, h: spec.h, live: !!spec.live, fine: !!spec.fine || !!spec.float, float: !!spec.float, src: spec.draw, wear: spec.wear,
    name: spec.name, kind: spec.kind,
    draw(ctx) { (baked.get(T) || bake(T)).draw(ctx); },
  };
  return T;
}

function bake(T) {
  const W0 = T.wear, b = Math.min(7, Math.round(T.h * W0.bury));
  const X0 = Math.floor(T.x - T.w / 2) - PX, Y0 = T.gy - T.h - PT;
  const W = Math.ceil(T.w) + 2 * PX + 1, H = T.h + PT + PB, G = T.gy - Y0;     // G — строка земли
  // вещь — в своей точке мира (подвес и механизм узнают себя по месту), опущенная в землю
  const a = canvas(W, H), g = a.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingEnabled = false;
  g.translate(-X0, -Y0);
  T.src(g, T.x, T.gy + (T.live ? 0 : b), 0);
  const im = g.getImageData(0, 0, W, H), d = im.data;
  if (b > 0 && !T.live) for (let i = G * W * 4; i < d.length; i += 4) d[i + 3] = 0;   // ниже земли — в земле
  let out;
  if (T.live) {
    // живое: запекаю землю под ним и у подошвы, саму вещь рисую каждый кадр
    const foot = footOf(d, W, H, G);
    const U = canvas(W, H), O = canvas(W, H);
    if (!T.float) contact(U.getContext('2d'), foot, G);
    if (!T.fine) footing(O.getContext('2d'), foot, G, W0, 0, rng(W0.seed * 13 + 5));
    out = { U, O, draw(ctx) { ctx.drawImage(U, X0, Y0); T.src(ctx, T.x, T.gy, now); ctx.drawImage(O, X0, Y0); } };
  } else {
    const R = rng(W0.seed * 31 + 17);
    let buf = d;
    if (W0.lean && !T.fine) buf = lean(buf, W, H, G, W0.lean);
    chip(buf, W, H, G, T.fine ? 0 : W0.chips, R);
    wear(buf, W, H, G, T.fine ? { ...W0, snow: 0, moss: 0, scorch: 0 } : W0, R);
    const foot = footOf(buf, W, H, G);
    const F = canvas(W, H), f = F.getContext('2d');
    if (!T.float) contact(f, foot, G);
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (buf !== d) d.set(buf);
    g.putImageData(im, 0, 0);
    f.drawImage(a, 0, 0);
    if (!T.fine) footing(f, foot, G, W0, b, R);
    out = { F, draw(ctx) { ctx.drawImage(F, X0, Y0); } };
  }
  out.x0 = X0; out.y0 = Y0; out.w = W; out.h = H;
  if (baked.size > 900) baked.delete(baked.keys().next().value);   // не копится без меры
  baked.set(T, out);
  return out;
}

// маска тени по солнцу: силуэт запечённой вещи (тень касания прозрачна — в маску не идёт)
export function thingCaster(T, maskFrom) {
  return T.caster || (T.caster = { key: T, ox: 0, oy: 0, build: () => {
    const B = baked.get(T) || bake(T);
    if (T.live) return maskFrom(g => { T.src(g, T.x, T.gy, 0); }, B.x0, B.y0, B.w, T.gy);
    return maskFrom(g => g.drawImage(B.F, B.x0, B.y0), B.x0, B.y0, B.w, T.gy);
  } });
}

const solid = (d, i) => d[i * 4 + 3] >= 128;

// крен: строка сдвигается тем дальше, чем выше над землёй (подошва на месте)
function lean(d, W, H, G, k) {
  let top = G;
  for (let y = 0; y < G && top === G; y++) for (let x = 0; x < W; x++) if (solid(d, y * W + x)) { top = y; break; }
  const hgt = Math.max(1, G - top), o = new Uint8ClampedArray(d.length);
  for (let y = 0; y < H; y++) {
    const s = y >= G ? 0 : Math.round(k * (G - y) / hgt);
    for (let x = 0; x < W; x++) {
      const sx = x - s;
      if (sx < 0 || sx >= W) continue;
      const i = (y * W + x) * 4, j = (y * W + sx) * 4;
      o[i] = d[j]; o[i + 1] = d[j + 1]; o[i + 2] = d[j + 2]; o[i + 3] = d[j + 3];
    }
  }
  return o;
}

// сколы: отбитые углы — верхние уголки силуэта (подошву не трогаю, тонкое не рву)
function chip(d, W, H, G, n, R) {
  if (n <= 0) return;
  const C = [];
  for (let y = 1; y < G - 2; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    if (!solid(d, i) || solid(d, i - W)) continue;
    if (!solid(d, i - 1) || !solid(d, i + 1)) C.push(i);
  }
  for (let k = 0; k < n && C.length; k++) {
    const j = (R() * C.length) | 0, i = C[j];
    C.splice(j, 1);
    d[i * 4 + 3] = 0;
  }
}

const mixPx = (d, i, c, k) => { const p = i * 4; d[p] += (c[0] - d[p]) * k; d[p + 1] += (c[1] - d[p + 1]) * k; d[p + 2] += (c[2] - d[p + 2]) * k; };
const setPx = (d, i, c) => { const p = i * 4; d[p] = c[0]; d[p + 1] = c[1]; d[p + 2] = c[2]; d[p + 3] = 255; };

// износ по зерну: мох пятнами снизу и по верхам, снег на верхах, выбеленность,
// копоть снизу и пепел сверху, подпалины, выцветание обломка
function wear(d, W, H, G, w, R) {
  let top = G;
  const S = [];
  for (let y = 0; y < G; y++) for (let x = 0; x < W; x++) if (solid(d, y * W + x)) { S.push(y * W + x); if (y < top) top = y; }
  if (!S.length) return;
  const hgt = Math.max(1, G - top);
  const up = i => i >= W && !solid(d, i - W);              // верх: над пикселем пусто
  if (w.fade) for (const i of S) mixPx(d, i, K2, w.fade);
  if (w.bleach) for (const i of S) mixPx(d, i, L1, up(i) ? w.bleach * 2.2 : w.bleach);   // выгорело: верхи — сильнее
  if (w.soot) for (const i of S) {
    const low = 1 - Math.min(1, (G - ((i / W) | 0)) / hgt);   // 1 у подошвы
    mixPx(d, i, NI, w.soot * (0.25 + 0.45 * low));
  }
  for (let k = 0; k < w.scorch; k++) {                      // подпалина — пятно
    const c = S[(R() * S.length) | 0], cx = c % W, cy = (c / W) | 0, r = 1 + ((R() * 2) | 0);
    for (const i of S) { const x = i % W, y = (i / W) | 0; if (Math.abs(x - cx) <= r && Math.abs(y - cy) <= r - (Math.abs(x - cx) === r ? 1 : 0)) mixPx(d, i, K0, 0.6); }
  }
  if (w.moss > 0) {                                         // мох — пятнами по 1–4 точки, ниже и по верхам
    const n = Math.round(S.length * w.moss);
    for (let k = 0; k < n; k++) {
      let i = S[(R() * S.length) | 0];
      const y = (i / W) | 0, low = (G - y) / hgt;
      if (low > 0.45 && !up(i) && R() < 0.7) continue;      // выше середины — только на верхах
      for (let s = 0, m = 1 + ((R() * 3) | 0); s < m; s++) {
        if (solid(d, i)) mixPx(d, i, MG, 0.75);
        const nb = [i - 1, i + 1, i - W, i + W][(R() * 4) | 0];
        if (nb >= 0 && nb < W * G && solid(d, nb)) i = nb;
      }
    }
  }
  if (w.snow || w.soot > 0.25) {                            // снег на верхах севера; у огня — пепел
    const cap = w.snow ? BO : AS, p = w.snow || w.soot * 0.55;
    const tops = S.filter(up);
    for (const i of tops) {
      if (R() > p) continue;
      setPx(d, i, cap);
      if (w.snow && R() < 0.2 && i - W >= 0) setPx(d, i - W, BO);    // шапка в две точки
    }
  }
}

// где вещь касается земли: столбцы с телом в двух нижних строках над землёй
function footOf(d, W, H, G) {
  const on = new Uint8Array(W);
  let x0 = W, x1 = -1;
  for (let x = 0; x < W; x++) for (let y = Math.max(0, G - 2); y <= Math.min(H - 1, G); y++) {
    if (solid(d, y * W + x)) { on[x] = 1; if (x < x0) x0 = x; if (x > x1) x1 = x; break; }
  }
  return { on, x0, x1, W };
}
// расширить столбцы касания на r в обе стороны
function grow(on, r) {
  const o = new Uint8Array(on.length);
  for (let x = 0; x < on.length; x++) if (on[x]) for (let k = -r; k <= r; k++) if (x + k >= 0 && x + k < on.length) o[x + k] = 1;
  return o;
}

// тень касания: под каждой опорой и под сплошной подошвой — тёмное пятно
// (как у построек: «тень у подножия — вещь стоит на земле»)
function contact(c, foot, G) {
  if (foot.x1 < 0) return;
  const rows = [[G - 1, grow(foot.on, 2), 0.42], [G, grow(foot.on, 1), 0.36], [G + 1, foot.on, 0.2]];
  for (const [y, on, a] of rows) {
    c.fillStyle = css(NI, a);
    for (let x = 0; x < on.length; x++) {
      if (!on[x]) continue;
      let e = x;
      while (e + 1 < on.length && on[e + 1]) e++;
      c.fillRect(x, y, e - x + 1, 1);
      x = e;
    }
  }
}

// подножие: земля стороны у подошвы; у ушедшего в землю — валик земли по срезу
function footing(c, foot, G, w, b, R) {
  if (foot.x1 < 0) return;
  const R2 = (col, x, y, ww = 1, hh = 1) => { c.fillStyle = col; c.fillRect(x, y, ww, hh); };
  const x0 = foot.x0, x1 = foot.x1, span = x1 - x0 + 1;
  if (w.foot === 'snow' || w.foot === 'sand') {
    // намёт: горбом у подошвы, с наветренного края выше, за края — на нет
    // цвет — от земли кольца: нанос — та же земля, только легла горбом и светлее сверху
    const gr = ground(w.ring), snow = w.foot === 'snow';
    const top = mix(gr, snow ? BO : L1, snow ? 0.85 : 0.5), body = mix(gr, snow ? BO : L2, snow ? 0.55 : 0.28);
    const peak = x0 + R() * span, hmax = Math.min(snow ? 2 : 3, 1 + Math.round(span / 14) + (b > 0 ? 1 : 0) + (R() < 0.3 ? 1 : 0));
    const reach = 2 + ((R() * 2) | 0);
    for (let x = Math.max(0, x0 - reach); x <= Math.min(foot.W - 1, x1 + reach); x++) {
      const out = x < x0 ? x0 - x : x > x1 ? x - x1 : 0;
      const k = 1 - Math.abs(x - peak) / (span / 2 + reach + 1);
      const hh = Math.max(out ? 0 : 1, Math.round(hmax * k - out * 0.7));
      if (hh <= 0) continue;
      R2(css(body), x, G - hh + 1, 1, hh);
      R2(css(top), x, G - hh, 1, 1);
    }
    return;
  }
  // валик земли по срезу у ушедшего в землю
  if (b > 0) {
    const on = grow(foot.on, 1);
    for (let x = 0; x < on.length; x++) {
      if (!on[x]) continue;
      R2(css(K2), x, G - 1, 1, 1);
      if (R() < 0.45) R2(css(K4), x, G - 2, 1, 1);
    }
  }
  if (w.foot === 'turf') {
    // кочки травы у подошвы — цветом травы своего кольца
    const pal = grassPalette(w.ring, w.side);
    const n = 1 + Math.round(span / 9 + R());
    for (let k = 0; k < n; k++) {
      const x = Math.round(x0 - 2 + R() * (span + 3)), blades = 2 + ((R() * 2) | 0);
      for (let s = 0; s < blades; s++) {
        const bx = x + s - (blades >> 1), hh = 2 + ((R() * 2) | 0);
        if (bx < 0 || bx >= foot.W) continue;
        R2(pal.base, bx, G - hh + 1, 1, hh - 1);
        R2(pal.tip, bx, G - hh, 1, 1);
      }
    }
    R2(css(K1), x0 - 1, G - 1); R2(css(K1), x1 + 1, G - 1);
  } else if (w.foot === 'grit') {
    // щебень и сор у подошвы
    const n = 2 + Math.round(span / 8 + R() * 2);
    for (let k = 0; k < n; k++) {
      const x = Math.round(x0 - 3 + R() * (span + 5)), y = G - 1 + ((R() * 3) | 0);
      R2(css(R() < 0.5 ? AS : K4, R() < 0.5 ? 0.9 : 0.6), x, y, R() < 0.3 ? 2 : 1, 1);
    }
  } else {
    // двор: утоптано, крошки у краёв
    R2(css(K1, 0.9), x0 - 1, G - 1); R2(css(K1, 0.9), x1 + 1, G);
  }
}
