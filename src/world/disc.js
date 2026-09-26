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
export const EDGE_BAND = 350;           // стихии за огнём
export const OFF = RINGS * RING_W + FIRE_W + EDGE_BAND;   // 2300 — поля вокруг

// Прямоугольник городка (вне-время, кольцо 0) — в центре полного диска.
// Контент городка исторически 0..3000 × 160..1800: сдвиг на чтении.
export const SHIFT_X = OFF;             // 2300
export const SHIFT_Y = OFF - 160;       // 2140
export const TOWN = { x0: OFF, y0: OFF, x1: OFF + 3000, y1: OFF + 1640 };

// расстояние от точки до границы городка (0 внутри)
export function townDist(x, y) {
  const dx = Math.max(0, TOWN.x0 - x, x - TOWN.x1);
  const dy = Math.max(0, TOWN.y0 - y, y - TOWN.y1);
  return Math.hypot(dx, dy);
}

// номер кольца эпохи (1..9), 0 — городок, 10 — огонь, 11 — за краем
export function ringAt(x, y) {
  const d = townDist(x, y);
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

// полный мир: кольца и стихии со всех четырёх сторон
export const WORLD_W = TOWN.x1 + OFF;   // 7600
export const WORLD_H = TOWN.y1 + OFF;   // 6280
