// ═══════════════════════════════════════
// DISC — открытый мир по форме world-map: городок в центре,
// эпохи — кольца-рамки вокруг него (расстояние до границы городка =
// время), идти можно в любую сторону: наружу — вперёд по эпохам,
// вдоль кольца — вдоль эпохи, внутрь — назад к вне-временью.
// Все четыре стороны открыты; за кольцом огня — стихии краёв.
// ═══════════════════════════════════════
import { SEGMENTS } from '../content/ulitsa_db.js';

export const RING_W = 200;              // ширина кольца-эпохи
export const RINGS = SEGMENTS.length;   // 9 эпох
export const FIRE_W = 150;              // край — кольцо огня
export const EDGE_BAND = 1200;          // пустыня брейнрота за огнём: широкая, распад нарастает
export const OFF = RINGS * RING_W + FIRE_W + EDGE_BAND;   // 3150 — поля вокруг

// Прямоугольник городка (вне-время, кольцо 0) — в центре полного диска.
// Контент городка исторически 0..3000 × 160..1800: сдвиг на чтении.
export const SHIFT_X = OFF;             // 2300
export const SHIFT_Y = OFF - 160;       // 2140
export const TOWN = { x0: OFF, y0: OFF, x1: OFF + 3000, y1: OFF + 1640 };

// Ядро вне времени — круг вокруг места пробуждения (костёр).
// Остальной городок временем уже тронут: ранние и средние века
// живут прямо в его локациях (см. ERA_HINT в world_frame).
export const CORE = { x: OFF + 800, y: OFF + 740, r: 430 };
export function inCore(x, y) {
  return Math.hypot(x - CORE.x, y - CORE.y) <= CORE.r;
}

// расстояние от точки до границы городка (0 внутри)
export function townDist(x, y) {
  const dx = Math.max(0, TOWN.x0 - x, x - TOWN.x1);
  const dy = Math.max(0, TOWN.y0 - y, y - TOWN.y1);
  return Math.hypot(dx, dy);
}

// ── пространственный шум: границы эпох рваные, как береговая линия ──
function gh(ix, iy) {
  const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
function vnoise(x, y, cell) {
  const gx = Math.floor(x / cell), gy = Math.floor(y / cell);
  const fx = x / cell - gx, fy = y / cell - gy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = gh(gx, gy), b = gh(gx + 1, gy), c = gh(gx, gy + 1), d = gh(gx + 1, gy + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
// расстояние с рельефом: им живут визуал, титры и стихии
export function warpedDist(x, y) {
  const d = townDist(x, y);
  if (d <= 0) return 0;
  const w = (vnoise(x, y, 260) - 0.5) * 110 + (vnoise(x * 2.17, y * 2.17, 260) - 0.5) * 44;
  // у самой кромки городка рельеф стихает, чтобы город не рвало
  const k = Math.min(1, d / 160);
  return Math.max(0.001, d + w * k);
}

// номер кольца эпохи (1..9), 0 — городок, 10 — огонь, 11 — за краем
export function ringAt(x, y) {
  const d = warpedDist(x, y);
  if (d <= 0) return 0;
  const n = Math.ceil(d / RING_W);
  if (n <= RINGS) return n;
  if (d <= RINGS * RING_W + FIRE_W) return RINGS + 1;
  return RINGS + 2;
}

export function epochAt(x, y) {
  const n = ringAt(x, y);
  if (n < 1 || n > RINGS) return null;
  return SEGMENTS[n - 1];
}

// раскладка южной стороны: полоса эпохи n по нижней кромке
export function southBand(n) {
  const d0 = (n - 1) * RING_W, d1 = n * RING_W;
  return { y0: TOWN.y1 + d0, y1: TOWN.y1 + d1 };
}
// восточная сторона: полоса эпохи n по правой кромке
export function eastBand(n) {
  const d0 = (n - 1) * RING_W, d1 = n * RING_W;
  return { x0: TOWN.x1 + d0, x1: TOWN.x1 + d1 };
}

// прогресс vx (виртуальная координата старой улицы 220..3000) →
// точка на юге: эпоха его сегмента, поперёк — распределение по x
export function southPoint(vx) {
  let seg = SEGMENTS[SEGMENTS.length - 1];
  for (const s of SEGMENTS) if (vx >= s.range[0] && vx < s.range[1]) { seg = s; break; }
  const t = (vx - seg.range[0]) / (seg.range[1] - seg.range[0]);
  const band = southBand(seg.n);
  return {
    x: TOWN.x0 + 340 + t * 2320,
    y: band.y0 + 58 + ((vx * 37) % 84),   // детерминированный разброс в кольце
    ring: seg.n,
  };
}

// точка знака на любой стороне. Раскладка кластерная: знаки кольца
// сходятся в 2-3 «сцены» (двор, площадь, перекрёсток) с пустотами
// между — против линейной сетки.
function h01(n) { const v = Math.sin(n * 127.13) * 43758.5453; return v - Math.floor(v); }
export function sidePoint(vx, side = 'south') {
  let seg = SEGMENTS[SEGMENTS.length - 1];
  for (const s of SEGMENTS) if (vx >= s.range[0] && vx < s.range[1]) { seg = s; break; }
  const t = (vx - seg.range[0]) / (seg.range[1] - seg.range[0]);
  const sideN = { south: 1, north: 2, west: 3, east: 4 }[side] || 1;
  const K = 2 + (Math.floor(h01(seg.n * 13 + sideN * 7) * 2));       // 2-3 сцены
  const ci = Math.floor(h01(vx * 7.3 + sideN) * K);                  // своя сцена
  const center = 0.14 + (ci + 0.5) / K * 0.72
    + (h01(seg.n * 31 + ci * 17 + sideN) - 0.5) * 0.16;              // сцены гуляют
  const along = Math.max(0.03, Math.min(0.97,
    center + (t - 0.5) * 0.16 + (h01(vx * 3.7) - 0.5) * 0.06));      // кучно внутри
  const depth = 36 + h01(vx * 11 + ci) * 128                          // глубина в кольце
    + (h01(seg.n + ci * 29 + sideN * 3) - 0.5) * 40;                  // сцены на разной глубине
  const b0 = (seg.n - 1) * RING_W;
  if (side === 'north') return { x: TOWN.x0 + 300 + along * 2400, y: TOWN.y0 - b0 - depth - 26, ring: seg.n };
  if (side === 'west')  return { x: TOWN.x0 - b0 - depth - 14, y: TOWN.y0 + 140 + along * 1360, ring: seg.n };
  if (side === 'east')  return { x: TOWN.x1 + b0 + depth,      y: TOWN.y0 + 140 + along * 1360, ring: seg.n };
  return { x: TOWN.x0 + 300 + along * 2400, y: TOWN.y1 + b0 + depth, ring: seg.n };
}

// полный мир: кольца и стихии со всех четырёх сторон
export const WORLD_W = TOWN.x1 + OFF;   // 7600
export const WORLD_H = TOWN.y1 + OFF;   // 6280
