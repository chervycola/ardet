// ═══════════════════════════════════════
// ГОРЫ, КАНЬОНЫ, ПРУД — слово автора 23.11: «кажется, нам надо добавить горы и каньоны.
// посчитай подходящие места / давай сделаем ещё озеро и механику покататься до острова,
// где-нибудь у завода».
// Места посчитаны по раскладке мира (сетка 60×40 минус места, дворы и артерии): пустые
// углы колец — «три угла каждого кольца пусты всегда» (weave/LAND.md). Туда — массивы:
//   северо-запад, кольца 4–8 — стык севера и запада (Исландия, Шотландия, Норвегия по осям
//     сторон): самый пустой угол, большой массив с острыми гребнями;
//   юго-запад, кольца 5–7 — стык юга и запада (Атлас, Иберия): массив пониже.
// Каньоны — где канон уже говорит о пропасти и ущелье:
//   «Бездна» — у гранд-отеля «Бездна», кольцо 7, запад («номера с видом на пропасть»);
//   ущелье востока — кольца 2–3, восток («камень и тушь»: свитки гор и ущелий), в пустом
//     месте за заставой на перевале.
// Вода — большое Тёплое озеро с островами, ручьями и лодками: world/lake.js (слово автора 24.11;
// прежде — пруд-охладитель у градирни, 23.11).
// Всё это — поздний крючок рельефа (world/relief.js setReliefCarve): раскладка мест не
// сдвигается, горизонтали и штриховка ложатся на новые склоны сами (render/etch.js). Высота — та же, что берёт шаг
// (main.js slopeK): в гору медленнее.
// ═══════════════════════════════════════
import { lakeCarve } from './lake.js';

function gh(ix, iy, s) { const n = Math.sin(ix * 127.1 + iy * 311.7 + s * 74.7) * 43758.5453; return n - Math.floor(n); }
function vn(x, y, s) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = gh(ix, iy, s), b = gh(ix + 1, iy, s), c = gh(ix, iy + 1, s), d = gh(ix + 1, iy + 1, s);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
const sm = (a, b, v) => { const k = Math.max(0, Math.min(1, (v - a) / (b - a))); return k * k * (3 - 2 * k); };

// ── массивы: эллипс по земле (по глубине вдвое уже), гребни острые, край рваный ──
export const MASSIFS = [
  { id: 'nw', name: 'северо-западный массив', cx: 3380, cy: 2860, rx: 1000, ry: 500, H: 170, seed: 31 },
  { id: 'sw', name: 'юго-западный массив', cx: 3140, cy: 8280, rx: 900, ry: 450, H: 125, seed: 37 },
];
export function massifH(m, x, y) {
  const u = (x - m.cx) / m.rx, v = (y - m.cy) / m.ry, d = u * u + v * v;
  if (d >= 1.3) return 0;
  const dd = d * (0.78 + 0.44 * vn(x / 190, y / 95, m.seed));     // край рваный
  if (dd >= 1) return 0;
  const e = 1 - dd, env = e * e * (3 - 2 * e);
  const r1 = 1 - Math.abs(2 * vn(x / 170, y / 85, m.seed + 1) - 1);   // гребни
  const r2 = 1 - Math.abs(2 * vn(x / 64, y / 32, m.seed + 2) - 1);
  return m.H * env * (0.3 + 0.55 * r1 * r1 * r1 + 0.15 * r2 * r2);
}

// ── каньоны: ломаная по дну; дно ровное, стены круто (по земле: глубина вдвое) ──
export const CANYONS = [
  { id: 'abyss', name: 'Бездна', depth: 70, floor: 20, wall: 32,
    pts: [[1660, 4196], [1740, 4206], [1810, 4246], [1880, 4250], [1950, 4290], [2030, 4296], [2100, 4334], [2180, 4352], [2250, 4384], [2330, 4396], [2400, 4430]] },
  { id: 'gorge', name: 'ущелье востока', depth: 76, floor: 14, wall: 26,
    pts: [[8930, 5996], [9000, 6018], [9060, 6060], [9130, 6070], [9200, 6128], [9270, 6150], [9340, 6198], [9420, 6214], [9490, 6266], [9560, 6296]] },
];
for (const c of CANYONS) {
  const W = c.floor + c.wall + 4;
  c.x0 = Math.min(...c.pts.map(p => p[0])) - W; c.x1 = Math.max(...c.pts.map(p => p[0])) + W;
  c.y0 = Math.min(...c.pts.map(p => p[1])) - W / 2; c.y1 = Math.max(...c.pts.map(p => p[1])) + W / 2;
}
// расстояние по земле (по глубине вдвое) до ломаной; u — где ближайшая точка по длине (0..1)
export function canyonNear(c, x, y) {
  let best = Infinity, bu = 0, acc = 0;
  if (!c.len) { c.len = 0; for (let i = 0; i < c.pts.length - 1; i++) c.len += Math.hypot(c.pts[i + 1][0] - c.pts[i][0], (c.pts[i + 1][1] - c.pts[i][1]) * 2); }
  for (let i = 0; i < c.pts.length - 1; i++) {
    const [ax, ay] = c.pts[i], [bx, by] = c.pts[i + 1];
    const lx = bx - ax, ly = (by - ay) * 2, rx = x - ax, ry = (y - ay) * 2, L2 = lx * lx + ly * ly || 1, L = Math.sqrt(L2);
    let t = (rx * lx + ry * ly) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
    const d = Math.hypot(rx - lx * t, ry - ly * t);
    if (d < best) { best = d; bu = (acc + t * L) / c.len; }
    acc += L;
  }
  return { d: best, u: bu };
}
export const canyonDist = (c, x, y) => canyonNear(c, x, y).d;
export function canyonC(c, x, y) {
  if (x < c.x0 || x > c.x1 || y < c.y0 || y > c.y1) return 0;
  const { d, u } = canyonNear(c, x + 8 * (vn(x / 40, y / 20, 61) - 0.5), y + 3 * (vn(x / 30, y / 15, 62) - 0.5));   // кромка неровная
  const taper = sm(0, 0.16, u) * sm(1, 0.84, u);                    // к концам — мельче и уже: сходит на нет
  const fl = c.floor * (0.4 + 0.6 * taper), w = fl + c.wall * (0.6 + 0.4 * taper), D = c.depth * taper;
  if (d >= w || D <= 0) return 0;
  if (d <= fl) return D;
  const k = 1 - (d - fl) / (w - fl);
  // стена уступами: полки через треть, между ними — обрыв
  const st = k * 3, f = st - Math.floor(st);
  return D * ((Math.floor(st) + sm(0.55, 1, f)) / 3);
}

// ── поздний крючок рельефа: что вычесть из высоты (каньон — вниз, гора — вверх; озеро — чаша,
//    острова, русла ручьёв — world/lake.js) ──
export function landCarve(x, y) {
  let c = lakeCarve(x, y);
  for (const m of MASSIFS) if (Math.abs(x - m.cx) < m.rx * 1.15 && Math.abs(y - m.cy) < m.ry * 1.15) c -= massifH(m, x, y);
  for (const k of CANYONS) c += canyonC(k, x, y);
  return c;
}
