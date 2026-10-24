// ═══════════════════════════════════════
// DISC — открытый мир по форме world-map: городок в центре,
// эпохи — кольца-рамки вокруг него (расстояние до границы городка =
// время), идти можно в любую сторону: наружу — вперёд по эпохам,
// вдоль кольца — вдоль эпохи, внутрь — назад к вне-временью.
// Все четыре стороны открыты; за кольцом огня — стихии краёв.
// ═══════════════════════════════════════
import { SEGMENTS } from '../content/ulitsa_db.js';

// Кольца — по длительности эпохи (weave/SCALE.md, вариант Б): ширина — по
// логарифму лет эпохи (600, 800, 1100, трижды по 100, 60, 40, 25), в сумме
// 3150. Долгие древние шире и пустее, короткие новые уже и гуще: «просветы
// часты» в начале, «шум нарастает к краю». Внутри кольца — по дате: начало
// эпохи у внутренней кромки, конец у внешней.
export const RINGS = SEGMENTS.length;   // 9 эпох
export const RING_WS = [449, 469, 491, 323, 323, 323, 287, 259, 226];
export const RING_EDGE = RING_WS.reduce((a, w) => (a.push(a[a.length - 1] + w), a), [0]);   // кромки колец: 0 … 3150
export const RINGS_D = RING_EDGE[RINGS];   // 3150 — где начинается огонь
export const FIRE_W = 150;              // край — кольцо огня
export const EDGE_BAND = 1200;          // пустыня брейнрота за огнём: широкая, распад нарастает
export const OFF = RINGS_D + FIRE_W + EDGE_BAND;   // 4500 — поля вокруг

// кольцо по расстоянию от кромки городка: 0 — городок, 1..9 — эпохи, 10 — огонь, 11 — за краем
export function ringOfD(d) {
  if (d <= 0) return 0;
  for (let n = 1; n <= RINGS; n++) if (d <= RING_EDGE[n]) return n;
  return d <= RINGS_D + FIRE_W ? RINGS + 1 : RINGS + 2;
}
// ── прежняя мера: кольца по 200 точек. Раскладка колец писалась в ней: отступ D
// от внутренней кромки кольца n (0…200) встаёт на ту же долю нынешнего кольца;
// огонь и пустыня за ним — те же точки
export const OLD_RW = 200;
export function newD(od) {
  if (od <= 0) return od;
  const R = RINGS * OLD_RW;
  if (od >= R) return RINGS_D + od - R;
  const n = Math.ceil(od / OLD_RW);
  return RING_EDGE[n - 1] + (od - (n - 1) * OLD_RW) * RING_WS[n - 1] / OLD_RW;
}
export function oldD(d) {
  if (d <= 0) return d;
  if (d >= RINGS_D) return RINGS * OLD_RW + d - RINGS_D;
  const n = ringOfD(d);
  return (n - 1) * OLD_RW + (d - RING_EDGE[n - 1]) * OLD_RW / RING_WS[n - 1];
}
export const ringD = (n, D) => RING_EDGE[n - 1] + D * RING_WS[n - 1] / OLD_RW;   // отступ D прежней меры — в кольце n
export const ringFrac = d => oldD(d) / OLD_RW;   // мера колец сплошь: 0 у городка, n — на внешней кромке кольца n

// Прямоугольник городка (вне-время, кольцо 0) — в центре полного диска.
// Городок ×1,25 (вариант Б): прежняя раскладка растягивается от угла,
// размеры вещей прежние. Контент мест исторически — 0..3000 × 160..1800;
// линии, проложенные руками, — в мировых точках прежнего поля (3150)
export const TS = 1.25;
export const TOWN = { x0: OFF, y0: OFF, x1: OFF + 3000 * TS, y1: OFF + 1640 * TS };
export const townX = x => TOWN.x0 + x * TS;             // контент городка → мир
export const townY = y => TOWN.y0 + (y - 160) * TS;
export const OLD_OFF = 3150;
export const oldX = x => TOWN.x0 + (x - OLD_OFF) * TS;  // прежний мир (городок) → нынешний
export const oldY = y => TOWN.y0 + (y - OLD_OFF) * TS;
export const oldPt = ([x, y]) => [oldX(x), oldY(y)];

// Ядро вне времени — круг вокруг места пробуждения (костёр).
// Остальной городок временем уже тронут: ранние и средние века
// живут прямо в его локациях (см. ERA_HINT в world_frame).
export const CORE = { x: townX(800), y: townY(900), r: 430 * TS };
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
  return ringOfD(warpedDist(x, y));
}

export function epochAt(x, y) {
  const n = ringAt(x, y);
  if (n < 1 || n > RINGS) return null;
  return SEGMENTS[n - 1];
}

// тропы из городка на четыре стороны: вьются — дорога помнит, что её
// протаптывали, а не чертили. d — расстояние от кромки городка.
const TRAIL_PH = { south: 0.7, north: 2.3, east: 4.1, west: 5.6 };
export function trailWind(d, ph) {
  return Math.sin(d * 0.011 + ph) * (26 + d * 0.03) + Math.sin(d * 0.037 + ph * 2.1) * 9;   // к огню размах ~120, как до просторных колец
}
export function trailPoint(side, d) {
  const cx = (TOWN.x0 + TOWN.x1) / 2, cy = (TOWN.y0 + TOWN.y1) / 2;
  const w = trailWind(d, TRAIL_PH[side] ?? 0);
  if (side === 'south') return { x: cx + w, y: TOWN.y1 + d };
  if (side === 'north') return { x: cx + w, y: TOWN.y0 - d };
  if (side === 'east') return { x: TOWN.x1 + d, y: cy + w };
  return { x: TOWN.x0 - d, y: cy + w };
}

// раскладка южной стороны: полоса эпохи n по нижней кромке
export function southBand(n) {
  return { y0: TOWN.y1 + RING_EDGE[n - 1], y1: TOWN.y1 + RING_EDGE[n] };
}
// восточная сторона: полоса эпохи n по правой кромке
export function eastBand(n) {
  return { x0: TOWN.x1 + RING_EDGE[n - 1], x1: TOWN.x1 + RING_EDGE[n] };
}

// прогресс vx (виртуальная координата старой улицы 220..3000) →
// точка на юге: эпоха его сегмента, поперёк — распределение по x
export function southPoint(vx) {
  let seg = SEGMENTS[SEGMENTS.length - 1];
  for (const s of SEGMENTS) if (vx >= s.range[0] && vx < s.range[1]) { seg = s; break; }
  const t = (vx - seg.range[0]) / (seg.range[1] - seg.range[0]);
  return {
    x: townX(340 + t * 2320),
    y: TOWN.y1 + ringD(seg.n, 58 + ((vx * 37) % 84)),   // детерминированный разброс в кольце
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
  const sideN = { south: 1, north: 2, west: 3, east: 4, plain: 5 }[side] || 1;
  const K = 2 + (Math.floor(h01(seg.n * 13 + sideN * 7) * 2));       // 2-3 сцены
  const ci = Math.floor(h01(vx * 7.3 + sideN) * K);                  // своя сцена
  const center = 0.14 + (ci + 0.5) / K * 0.72
    + (h01(seg.n * 31 + ci * 17 + sideN) - 0.5) * 0.16;              // сцены гуляют
  const along = Math.max(0.03, Math.min(0.97,
    center + (t - 0.5) * 0.16 + (h01(vx * 3.7) - 0.5) * 0.06));      // кучно внутри
  const depth = 36 + h01(vx * 11 + ci) * 128                          // глубина в кольце (прежняя мера)
    + (h01(seg.n + ci * 29 + sideN * 3) - 0.5) * 40;                  // сцены на разной глубине
  const r = ringD(seg.n, depth);
  if (side === 'plain') {
    // равнина — дуга у северо-восточного угла городка
    const a = (0.2 + along * 0.6) * Math.PI / 2;
    return { x: TOWN.x1 + r * Math.cos(a), y: TOWN.y0 - r * Math.sin(a) - 13, ring: seg.n };
  }
  const ax = TOWN.x0 + (300 + along * 2400) * TS, ay = TOWN.y0 + (140 + along * 1360) * TS;
  if (side === 'north') return { x: ax, y: TOWN.y0 - r - 26, ring: seg.n };
  if (side === 'west')  return { x: TOWN.x0 - r - 14, y: ay, ring: seg.n };
  if (side === 'east')  return { x: TOWN.x1 + r,      y: ay, ring: seg.n };
  return { x: ax, y: TOWN.y1 + r, ring: seg.n };
}

// ── обход вокруг городка на расстоянии D (скруглённые углы), по часовой
// стрелке от левого конца северной кромки: точка по длине s, длина обхода,
// и где на обходе точка (доля 0…1)
export const rimPerim = D => 2 * (TOWN.x1 - TOWN.x0) + 2 * (TOWN.y1 - TOWN.y0) + 2 * Math.PI * D;
export function rimPoint(s, D) {
  const W = TOWN.x1 - TOWN.x0, H = TOWN.y1 - TOWN.y0, Q = Math.PI * D / 2;
  s = ((s % rimPerim(D)) + rimPerim(D)) % rimPerim(D);
  const arc = (cx, cy, a) => ({ x: cx + D * Math.cos(a), y: cy - D * Math.sin(a), nx: Math.cos(a), ny: -Math.sin(a) });
  if (s <= W) return { x: TOWN.x0 + s, y: TOWN.y0 - D, nx: 0, ny: -1 };
  s -= W; if (s <= Q) return arc(TOWN.x1, TOWN.y0, Math.PI / 2 - s / D);
  s -= Q; if (s <= H) return { x: TOWN.x1 + D, y: TOWN.y0 + s, nx: 1, ny: 0 };
  s -= H; if (s <= Q) return arc(TOWN.x1, TOWN.y1, -s / D);
  s -= Q; if (s <= W) return { x: TOWN.x1 - s, y: TOWN.y1 + D, nx: 0, ny: 1 };
  s -= W; if (s <= Q) return arc(TOWN.x0, TOWN.y1, -Math.PI / 2 - s / D);
  s -= Q; if (s <= H) return { x: TOWN.x0 - D, y: TOWN.y1 - s, nx: -1, ny: 0 };
  s -= H; return arc(TOWN.x0, TOWN.y0, Math.PI - s / D);
}
export function rimFrac(x, y, D) {
  const W = TOWN.x1 - TOWN.x0, H = TOWN.y1 - TOWN.y0, Q = Math.PI * D / 2, P = rimPerim(D);
  let s;
  if (y < TOWN.y0 && x >= TOWN.x0 && x <= TOWN.x1) s = x - TOWN.x0;
  else if (x > TOWN.x1 && y < TOWN.y0) s = W + (Math.PI / 2 - Math.atan2(TOWN.y0 - y, x - TOWN.x1)) * D;
  else if (x > TOWN.x1 && y <= TOWN.y1) s = W + Q + (y - TOWN.y0);
  else if (x > TOWN.x1) s = W + Q + H - Math.atan2(TOWN.y1 - y, x - TOWN.x1) * D;
  else if (y > TOWN.y1 && x >= TOWN.x0) s = W + 2 * Q + H + (TOWN.x1 - x);
  else if (y > TOWN.y1) s = 2 * W + 2 * Q + H + (-Math.PI / 2 - Math.atan2(TOWN.y1 - y, x - TOWN.x0)) * D;
  else if (y >= TOWN.y0) s = 2 * W + 3 * Q + H + (TOWN.y1 - y);
  else s = 2 * W + 3 * Q + 2 * H + (Math.PI - Math.atan2(TOWN.y0 - y, x - TOWN.x0)) * D;
  return (((s / P) % 1) + 1) % 1;
}

// полный мир: кольца и стихии со всех четырёх сторон
export const WORLD_W = TOWN.x1 + OFF;   // 12750
export const WORLD_H = TOWN.y1 + OFF;   // 11050

// ── перенос точки прежней геометрии (кольца по 200, городок 3000×1640 при поле
// off) в нынешнюю: в городке — от угла ×1,25; снаружи — от ближайшей точки
// кромки городка по той же прямой, расстояние — по долям колец. Им живут
// сохранения и записки странников, оставленные до просторных колец
export const GEO = 2;
const OLD_TW = 3000, OLD_TH = 1640;
export function fromOldGeo(x, y, off = OLD_OFF) {
  const X = x + OLD_OFF - off, Y = y + OLD_OFF - off;
  const cx = Math.max(OLD_OFF, Math.min(OLD_OFF + OLD_TW, X)), cy = Math.max(OLD_OFF, Math.min(OLD_OFF + OLD_TH, Y));
  const vx = X - cx, vy = Y - cy, d = Math.hypot(vx, vy);
  const k = d > 0 ? newD(d) / d : 1;
  return { x: oldX(cx) + vx * k, y: oldY(cy) + vy * k };
}
export function toOldGeo(x, y) {
  const cx = Math.max(TOWN.x0, Math.min(TOWN.x1, x)), cy = Math.max(TOWN.y0, Math.min(TOWN.y1, y));
  const vx = x - cx, vy = y - cy, d = Math.hypot(vx, vy);
  const k = d > 0 ? oldD(d) / d : 1;
  return { x: OLD_OFF + (cx - TOWN.x0) / TS + vx * k, y: OLD_OFF + (cy - TOWN.y0) / TS + vy * k };
}

// площадь кольца n (скруглённый прямоугольник вокруг городка) и во сколько раз
// она больше прежней: заполнение по площади (рощи, поля, ткань) редеет во
// столько же раз — чисел столько же, пустоты между ними больше
const ringArea = (W, H, d0, d1) => 2 * (W + H) * (d1 - d0) + Math.PI * (d1 * d1 - d0 * d0);
export const RING_GROW = RING_WS.map((w, i) => ringArea(TOWN.x1 - TOWN.x0, TOWN.y1 - TOWN.y0, RING_EDGE[i], RING_EDGE[i + 1])
  / ringArea(OLD_TW, OLD_TH, i * OLD_RW, (i + 1) * OLD_RW));
export const thinAt = n => (n >= 1 && n <= RINGS ? 1 / RING_GROW[n - 1] : 1);
// во сколько раз кольцо n шире прежнего: линия поперёк кольца (дорога, река) длиннее во столько же
export const stretchAt = n => (n >= 1 && n <= RINGS ? RING_WS[n - 1] / OLD_RW : 1);
