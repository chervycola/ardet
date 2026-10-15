// ═══════════════════════════════════════
// РЕЛЬЕФ — высота земли на всём диске. По ней земля рисуется штрихом
// (render/etch.js): горизонтали и штриховка ложатся на склоны, которые
// смотрят от света. Формы — по клеткам канона (content/world_cells.js):
//   равнина — степь ровнее, курганы;   юг — дюны, к краю выше;
//   восток — сады-террасы, у ступени обрыв;   запад — высокие холмы;
//   север — морены, гребни острые.
// Вид сверху-сбоку: по глубине экран сжат вдвое — формы вытянуты по x.
// Городок почти ровный («соразмерен человеку»), его обводит вал со рвом;
// у выходов четырёх троп вал разрыт. Под дворами построек земля выровнена.
// Стороны света сходятся неровным швом, а не прямой под 45°. Эпохи — по
// рельефу: в низинах внешняя заходит внутрь языками, гребни держат прежнюю;
// граница резкая, без растра («швы по кромкам без фейдов»).
// Только для рисунка: логика колец (ringAt) прежняя — постройки стоят там же.
// ═══════════════════════════════════════
import { TOWN, RING_W, RINGS, FIRE_W, townDist, warpedDist, trailPoint } from './disc.js';

export const OUTER = RINGS * RING_W + FIRE_W;
export const SIDES = ['north', 'south', 'west', 'east', 'plain'];

const sm = (a, b, v) => { const k = Math.max(0, Math.min(1, (v - a) / (b - a))); return k * k * (3 - 2 * k); };

function gh(ix, iy, s) { const n = Math.sin(ix * 127.1 + iy * 311.7 + s * 74.7) * 43758.5453; return n - Math.floor(n); }
function vn(x, y, s) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = gh(ix, iy, s), b = gh(ix + 1, iy, s), c = gh(ix, iy + 1, s), d = gh(ix + 1, iy + 1, s);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

// ── стороны света: точку уводит шумом, прежде чем решить, чья она ──
const SW = 150;                                // насколько гуляет шов сторон
export function sideWarp(x, y) {
  return [(vn(x / 310, y / 310, 3) - 0.5) * SW, (vn(x / 310, y / 310, 8) - 0.5) * SW];
}
// сторона по уже уведённой точке: 0 север, 1 юг, 2 запад, 3 восток, 4 равнина (дуга СВ)
export function sideOf(wx, wy) {
  if (wx > TOWN.x1 && wy < TOWN.y0) {
    const a = Math.atan2(TOWN.y0 - wy, wx - TOWN.x1) / (Math.PI / 2);
    if (a > 0.2 && a < 0.8) return 4;
  }
  const dn = TOWN.y0 - wy, ds = wy - TOWN.y1, dw = TOWN.x0 - wx, de = wx - TOWN.x1;
  const m = Math.max(dn, ds, dw, de);
  return m === dn ? 0 : m === ds ? 1 : m === dw ? 2 : 3;
}
export function sideAt(x, y) { const [ox, oy] = sideWarp(x, y); return SIDES[sideOf(x + ox, y + oy)]; }

// веса сторон для форм — плавно (формы перетекают, краски сторон — нет)
const Wt = { n: 0, s: 0, w: 0, e: 0, p: 0 };
function weights(wx, wy) {
  const dn = TOWN.y0 - wy, ds = wy - TOWN.y1, dw = TOWN.x0 - wx, de = wx - TOWN.x1;
  const m = Math.max(dn, ds, dw, de), T = 70;
  let n = Math.exp((dn - m) / T), s = Math.exp((ds - m) / T), w = Math.exp((dw - m) / T), e = Math.exp((de - m) / T);
  const sum = n + s + w + e;
  let p = 0;
  if (wx > TOWN.x1 && wy < TOWN.y0) {
    const a = Math.atan2(TOWN.y0 - wy, wx - TOWN.x1) / (Math.PI / 2);
    p = sm(0.1, 0.3, a) * (1 - sm(0.7, 0.9, a));
  }
  Wt.n = n / sum * (1 - p); Wt.s = s / sum * (1 - p); Wt.w = w / sum * (1 - p); Wt.e = e / sum * (1 - p); Wt.p = p;
  return Wt;
}

// курганы равнины: купола на редкой сетке (круглые на земле — на экране приплюснуты)
const KC = 230;
function kurgans(x, y) {
  const yg = y * 2, gx = Math.floor(x / KC), gy = Math.floor(yg / KC);
  let s = 0;
  for (let j = gy - 1; j <= gy + 1; j++) for (let i = gx - 1; i <= gx + 1; i++) {
    if (gh(i, j, 11) < 0.55) continue;
    const cx = (i + 0.2 + 0.6 * gh(i, j, 12)) * KC, cy = (j + 0.2 + 0.6 * gh(i, j, 13)) * KC;
    const R = 16 + 14 * gh(i, j, 14), H = 14 + 12 * gh(i, j, 15);
    const dd = Math.hypot(x - cx, yg - cy) / R;
    if (dd < 1) { const u = 1 - dd * dd; s += H * u * u; }
  }
  return s;
}

// вал со рвом вокруг городка; у выходов троп — проход
const EXITS = [...['south', 'north', 'east', 'west'].map(s => trailPoint(s, 0)), { x: TOWN.x1, y: TOWN.y0 }];   // и угол равнины
export function rampartAt(x, y, d) {
  if (d <= 0 || d > 48) return 0;
  let gate = 1;
  for (const e of EXITS) {
    const g = Math.hypot(x - e.x, y - e.y);
    if (g < 34) gate = Math.min(gate, sm(14, 30, g));
  }
  if (gate <= 0) return 0;
  const bank = 16 * Math.exp(-(((d - 10) / 6.5) ** 2)), ditch = 9 * Math.exp(-(((d - 24) / 5) ** 2));
  return gate * (bank - ditch);
}

// высота без выравнивания под дворами
export function heightRaw(x, y) {
  const base = 0.66 * vn(x / 240, y / 120, 1) + 0.29 * vn(x / 95, y / 48, 2) + 0.05 * vn(x / 34, y / 17, 5);
  let h = 60 * base;
  const d = townDist(x, y);
  if (d <= 0) return 30 + (h - 30) * 0.4;                         // городок почти ровный
  const [ox, oy] = sideWarp(x, y);
  const W = weights(x + ox, y + oy);
  const k = sm(0, 220, d), ring = d / RING_W;                      // от кромки городка формы набирают силу
  if (W.s > 0.01) {                                                // юг: дюны — гребни вдоль, ветвятся; полями
    const r = 1 - Math.abs(2 * vn(x / 130, y / 16, 6) - 1);         // острый гребень, вытянут по x
    const r2 = 1 - Math.abs(2 * vn(x / 60, y / 9, 16) - 1);
    const field = sm(0.3, 0.62, vn(x / 420, y / 210, 26));          // дюны полями, между ними — ровный песок
    h += W.s * k * field * (6 + 2.2 * Math.min(9, ring)) * (r * r * 0.8 + r2 * r2 * 0.25);
  }
  if (W.n > 0.01) {                                                // север: морены, гребни острые
    const r = 1 - Math.abs(2 * vn(x / 150, y / 75, 7) - 1);
    h += W.n * k * 34 * r * r * r;
  }
  if (W.e > 0.01) {                                                // восток: террасы, у ступени обрыв
    const st = 11, q = h / st, f = q - Math.floor(q);
    h += W.e * k * ((Math.floor(q) + sm(0.72, 1, f)) * st - h);
  }
  if (W.w > 0.01) h += W.w * k * 34 * vn(x / 300, y / 150, 9);    // запад: высокие холмы
  if (W.p > 0.01) h += W.p * k * (-0.55 * (h - 30) + kurgans(x, y));   // равнина: степь и курганы
  return h + rampartAt(x, y, d) - (carve ? carve(x, y) : 0);         // река промыла себе долину
}
// долина реки (world/arteries.js: riverCarve) — когда река проложена
let carve = null;
export function setReliefCarve(fn) { carve = fn; }

// ── под дворами построек земля выровнена: высота тянется к высоте середины двора ──
const FG = 256, FALL = 22;
let flats = null;
export function setReliefFlats(rects) {
  flats = new Map();
  for (const r of rects) {
    const f = { x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1, h: heightRaw((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2) };
    for (let gx = Math.floor((r.x0 - FALL) / FG); gx <= Math.floor((r.x1 + FALL) / FG); gx++) {
      for (let gy = Math.floor((r.y0 - FALL) / FG); gy <= Math.floor((r.y1 + FALL) / FG); gy++) {
        const key = gx * 100000 + gy;
        if (!flats.has(key)) flats.set(key, []);
        flats.get(key).push(f);
      }
    }
  }
}
export function heightAt(x, y) {
  let h = heightRaw(x, y);
  if (!flats) return h;
  const list = flats.get(Math.floor(x / FG) * 100000 + Math.floor(y / FG));
  if (!list) return h;
  let best = 0, bh = 0;
  for (const f of list) {
    const dx = Math.max(f.x0 - x, 0, x - f.x1), dy = Math.max(f.y0 - y, 0, y - f.y1);
    const w = 1 - sm(0, FALL, Math.hypot(dx, dy * 2));
    if (w > best) { best = w; bh = f.h; }
  }
  return best > 0 ? h + (bh - h) * best : h;
}

// ── эпоха земли (для красок): расстояние с языками по низинам ──
// та же граница, что у ringAt, но в низинах (h мала) внешняя эпоха заходит
// внутрь, на гребнях держится прежняя — до ±26 точек; у городка языков нет
export const TONGUE = 52;
export function landDist(d, h) {
  if (d <= 0) return 0;
  const lo = Math.max(0, Math.min(1, (h - 10) / 70));
  return Math.max(0.5, d + TONGUE * sm(0, 60, d) * (0.5 - lo));
}
// какая земля: 0 — городок, 1..9 — эпохи, 10 — огонь, 11 — за краем
export function landRing(ld) {
  if (ld <= 0) return 0;
  if (ld <= RINGS * RING_W) return Math.ceil(ld / RING_W);
  return ld <= OUTER ? RINGS + 1 : RINGS + 2;
}
export function landAt(x, y) { return landRing(landDist(warpedDist(x, y), heightAt(x, y))); }

// ── зоны городка (как у звука, audio/zoneAmbient), но с неровными кромками ──
export function townWarp(x, y) {
  return [(vn(x / 150, y / 150, 21) - 0.5) * 130 + (vn(x / 55, y / 55, 23) - 0.5) * 36,
    (vn(x / 150, y / 150, 22) - 0.5) * 100 + (vn(x / 55, y / 55, 24) - 0.5) * 28];
}
export const TOWN_ZONES = ['forest', 'toxic', 'quarter', 'highway', 'settlement'];
export function townZoneOf(wx, wy) {
  if (wy < TOWN.y0 + 340) return 0;
  if (wy > TOWN.y0 + 1140) return 1;
  if (wx < TOWN.x0 + 400) return 2;
  if (wx > TOWN.x0 + 1800) return 3;
  return 4;
}
