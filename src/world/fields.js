// ═══════════════════════════════════════
// ПОЛЯ — пашня там, где жили: у дворов и вдоль дорог, в тех кольцах и на тех
// сторонах, где пахали (канон world_cells: грядка Пифагора и нивы у арыка на
// юге, поля виллы рустика на западе, рисовые чеки и чайные ряды востока,
// чересполосица равнины и колхозные поля её шестого–седьмого колец). Поле
// ложится в землю бороздами (render/etchPaths.js) — штрихом: по полю видно,
// куда шёл плуг. К краю диска поля заброшены: борозды тают, межа зарастает.
// ═══════════════════════════════════════
import { RING_W, RINGS, WORLD_W, WORLD_H, warpedDist } from './disc.js';
import { sideAt } from './relief.js';
import { lines, onArtery, artBlock } from './arteries.js';
import { blockedAt } from './routes.js';

// что сеют: сторона → кольцо (1…9) → вид поля и сколько их у жилья
const CROP = {
  plain: [null, null, ['strip', 3], ['strip', 3], ['plow', 3], ['kolkhoz', 2], ['kolkhoz', 2], ['fallow', 2], null],
  west: [null, ['plow', 2], ['strip', 3], ['strip', 3], ['plow', 2], ['plow', 1], ['fallow', 1], null, null],
  east: [['paddy', 3], ['paddy', 3], ['tea', 3], ['paddy', 3], ['tea', 2], ['paddy', 1], ['fallow', 1], null, null],
  south: [['garden', 3], ['garden', 3], ['garden', 2], ['garden', 1], null, null, null, null, null],
  north: [['plot', 1], ['plot', 1], null, null, null, null, null, null, null],
};
// размер поля по виду: полудлина вдоль борозд, полуширина поперёк
const DIM = { plow: [70, 30], strip: [80, 34], kolkhoz: [150, 60], fallow: [70, 30], paddy: [46, 24], tea: [50, 22], garden: [34, 18], plot: [30, 16] };

export const fields = [];         // { kind, cx, cy, ux, uy, a, b, P: [4 угла], ring, side, x0, y0, x1, y1 }

function h01(x, y, s) { let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

// поле — неровный четырёхугольник: прямоугольник по своей оси, углы сбиты
function makeField(kind, cx, cy, ang, seed, ring, side) {
  const [A, B] = DIM[kind], s = 0.8 + 0.4 * h01(seed, 1, 3);
  const a = A * s, b = B * s, ux = Math.cos(ang), uy = Math.sin(ang) * 0.6, ul = Math.hypot(ux, uy);
  const dx = ux / ul, dy = uy / ul, nx = -dy, ny = dx;
  const P = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j], k) => {
    const ja = 1 + (h01(seed, k, 5) - 0.5) * 0.24, jb = 1 + (h01(seed, k, 7) - 0.5) * 0.3;
    return { x: cx + dx * a * i * ja + nx * b * j * jb, y: cy + dy * a * i * ja + ny * b * j * jb };
  });
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of P) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  return { kind, cx, cy, ux: dx, uy: dy, nx, ny, a, b, P, ring, side, seed, x0, y0, x1, y1 };
}
// расстояние до края выпуклого четырёхугольника: ≥ 0 — внутри (до межи),
// < 0 — снаружи (примерно на столько от края)
export function inField(f, x, y) {
  let edge = Infinity;
  for (let i = 0; i < 4; i++) {
    const a = f.P[i], b = f.P[(i + 1) % 4], ex = b.x - a.x, ey = b.y - a.y, L = Math.hypot(ex, ey) || 1;
    edge = Math.min(edge, (ex * (y - a.y) - ey * (x - a.x)) / L);   // > 0 — внутри (обход по часовой в экранных осях)
  }
  return edge;
}
function fieldFree(f, own) {
  // по сетке внутри: не постройка, не двор, не дорога, не река, не другое поле;
  // шов эпох поле может задеть краем (не больше шестой части)
  let off = 0, n = 0;
  for (let u = -0.9; u <= 0.91; u += 0.3) for (let w = -0.9; w <= 0.91; w += 0.45) {
    const x = f.cx + f.ux * f.a * u + f.nx * f.b * w, y = f.cy + f.uy * f.a * u + f.ny * f.b * w, d = warpedDist(x, y);
    n++;
    if (d <= 20 || d > RINGS * RING_W) return false;
    if (Math.ceil(d / RING_W) !== f.ring) off++;
    if (artBlock && blockedAt(artBlock, x, y)) return false;
    if (onArtery(x, y, 6)) return false;
    for (const g of own) if (inField(g, x, y) >= -8) return false;
  }
  return off <= n / 6;
}

// ── сборка: у дворов (yards: { x0, y0, x1, y1 }) и вдоль дорог ──
export function buildFields(yards = []) {
  fields.length = 0; grid.clear();
  const tryAt = (cx, cy, ang, seed) => {
    const d = warpedDist(cx, cy);
    if (d <= 30 || d > RINGS * RING_W - 20) return false;
    const ring = Math.ceil(d / RING_W), side = sideAt(cx, cy), c = CROP[side]?.[ring - 1];
    if (!c) return false;
    const f = makeField(c[0], cx, cy, ang, seed, ring, side);
    if (!fieldFree(f, fields)) return false;
    fields.push(f);
    return true;
  };
  // у дворов: за двором и по бокам, по оси двора или поперёк
  let k = 0;
  for (const y of yards) {
    k++;
    const cx = (y.x0 + y.x1) / 2, cy = (y.y0 + y.y1) / 2, d = warpedDist(cx, cy);
    if (d <= 30) continue;
    const ring = Math.ceil(d / RING_W), side = sideAt(cx, cy), c = CROP[side]?.[ring - 1];
    if (!c || h01(k, 0, 1) > 0.3 * c[1]) continue;
    for (let t = 0; t < 14; t++) {
      const a = h01(k, t, 2) * Math.PI * 2, r = 70 + h01(k, t, 3) * 200;
      if (tryAt(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.6, h01(k, t, 4) < 0.6 ? 0 : (h01(k, t, 6) - 0.5) * 1.2, k * 13 + t)) break;
    }
  }
  // вдоль дорог: полосы бороздами поперёк дороги (за поясом дворов — подальше)
  for (const L of lines) {
    if (L.kind !== 'road') continue;
    for (let i = 10; i < L.pts.length - 10; i += 5) {
      const p = L.pts[i], n = Math.ceil(p.d / RING_W), side = sideAt(p.x, p.y), c = CROP[side]?.[n - 1];
      if (!c || h01(i, L.pts.length, 9) > 0.14 * c[1]) continue;
      const a = L.pts[i - 3], b = L.pts[i + 3], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
      for (let t = 0; t < 4; t++) {
        const sgn = h01(i, t, 11) < 0.5 ? -1 : 1, off = p.hw + 14 + DIM[c[0]][1] * 1.1 + h01(i, t, 15) * 160;
        if (tryAt(p.x - dy / l * off * sgn, p.y + dx / l * off * sgn * 0.8, Math.atan2(-dx, dy) + (h01(i, t, 13) - 0.5) * 0.3, i * 7 + t)) break;
      }
    }
  }
  // в чистом поле: там, где пашут широко (колхоз, чеки, чересполосица) — изредка и без жилья
  for (let gy = 0; gy < WORLD_H / 170; gy++) for (let gx = 0; gx < WORLD_W / 170; gx++) {
    const x = (gx + 0.5) * 170 + (h01(gx, gy, 21) - 0.5) * 120, y = (gy + 0.5) * 170 + (h01(gx, gy, 22) - 0.5) * 120;
    const d = warpedDist(x, y);
    if (d <= 30 || d > RINGS * RING_W) continue;
    const ring = Math.ceil(d / RING_W), c = CROP[sideAt(x, y)]?.[ring - 1];
    if (!c || !['kolkhoz', 'paddy', 'strip', 'tea'].includes(c[0]) || h01(gx, gy, 23) > 0.09 * c[1]) continue;
    tryAt(x, y, (h01(gx, gy, 24) - 0.5) * 0.8, gx * 31 + gy);
  }
  for (const f of fields) {
    for (let gx = Math.floor(f.x0 / G); gx <= Math.floor(f.x1 / G); gx++) for (let gy = Math.floor(f.y0 / G); gy <= Math.floor(f.y1 / G); gy++) {
      const key = gx * 100000 + gy;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push(f);
    }
  }
  return fields;
}

const G = 128, grid = new Map();
export function fieldsIn(x0, y0, x1, y1) {
  const out = new Set();
  for (let gx = Math.floor(x0 / G); gx <= Math.floor(x1 / G); gx++) for (let gy = Math.floor(y0 / G); gy <= Math.floor(y1 / G); gy++) {
    const L = grid.get(gx * 100000 + gy);
    if (L) for (const f of L) if (f.x1 > x0 && f.x0 < x1 && f.y1 > y0 && f.y0 < y1) out.add(f);
  }
  return [...out];
}
// поле в точке (или null)
export function fieldAt(x, y) {
  const L = grid.get(Math.floor(x / G) * 100000 + Math.floor(y / G));
  if (L) for (const f of L) if (x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1 && inField(f, x, y) >= 0) return f;
  return null;
}
