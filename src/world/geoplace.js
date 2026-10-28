// ═══════════════════════════════════════
// ГЕОГРАФИЯ ВНУТРИ КОЛЕЦ — где в клетке «кольцо × сторона» стоит вещь.
// Слово автора (28.10): «большинство объектов сгруппировано по четырём линиям —
// надо расположить их более живо и исторически соответствующе». Канон: «лучи —
// традиции; география живёт внутри колец» (ARDET_PHILOSOPHY_v3); «внутри кольца
// место стоит по дате: начало эпохи — у внутренней кромки, конец — у внешней;
// одновременное на разных сторонах — на одном радиусе» (weave/SCALE.md §4).
//  · радиус — год изображённого (content/places.js: пирамида в лесах — 1798, не
//    постройка пирамиды);
//  · азимут — место прототипа на карте своей стороны: сектор стороны от шва до шва
//    — та же земля, что в атласе (юг — от Персии у шва с востоком до Магриба у шва
//    с западом; запад — с юга на север; север — с запада на восток; восток — от
//    Японии у равнины до Индии у юга; равнина — от Пскова у севера до Урала у
//    востока). «Мысль — азимуту традиции, тело — азимуту почвы» (VECTORS);
//  · потом — к своей местности: у реки, у пути (кольцевые дуги, рельсы), у дороги
//    (заставы, серии стендов), на холме, у шва; кто с кем рядом (один город, одна
//    стена) — одним местом. Неопознанное — в пустые углы клетки, не к дороге.
// Всё детерминированно; места — до дорог: трассировщик обходит их потом (arteries).
// ═══════════════════════════════════════
import { TOWN, RINGS, RING_EDGE, RING_WS, ringAt, trailPoint, warpedDist, townDist, rimPerim, rimPoint } from './disc.js';
import { sideAt, heightRaw } from './relief.js';
import { rimAt, idealRiver, idealArcs } from './arteries.js';

export const SIDE_ORDER = ['north', 'plain', 'east', 'south', 'west'];   // по часовой: закон смежности

// ── сектор стороны на обходе D: [начало, длина] в точках обхода (rimPoint: от левого конца
// северной кромки по часовой). Швы: углы городка под 45°, клин равнины — 18°…72° дуги СВ
export function sectorSpan(side, D) {
  const W = TOWN.x1 - TOWN.x0, H = TOWN.y1 - TOWN.y0, Q = Math.PI * D / 2, P = rimPerim(D);
  if (side === 'north') return [P - 0.5 * Q, W + 0.7 * Q];
  if (side === 'plain') return [W + 0.2 * Q, 0.6 * Q];
  if (side === 'east') return [W + 0.8 * Q, H + 0.7 * Q];
  if (side === 'south') return [W + 1.5 * Q + H, W + Q];
  return [2 * W + 2.5 * Q + H, H + Q];
}
// точка сектора: a — доля от шва до шва по часовой, d — расстояние от кромки городка (рваной)
export function sectorPoint(side, a, d) {
  const [s0, len] = sectorSpan(side, d);
  return rimAt((s0 + a * len) / rimPerim(d), d);
}
// то же по ровному обходу (без рваной кромки) — для итераций разлёта мест: дёшево
export function sectorPointFast(side, a, d) {
  const [s0, len] = sectorSpan(side, d);
  return rimPoint(s0 + a * len, d);
}
// доля сектора для точки (обратное — для проверок и карт)
export function sectorFrac(side, x, y, fast = false) {
  const D = Math.max(1, fast ? townDist(x, y) : warpedDist(x, y)), P = rimPerim(D), [s0, len] = sectorSpan(side, D);
  const f = rimFracOf(x, y, D);
  let s = f * P - s0;
  s = ((s % P) + P) % P;
  if (s > len + (P - len) / 2) s -= P;
  return s / len;
}
function rimFracOf(x, y, D) {
  // как disc.rimFrac, но без опоры на внешние кромки: по ближайшему сегменту обхода
  const W = TOWN.x1 - TOWN.x0, H = TOWN.y1 - TOWN.y0, Q = Math.PI * D / 2, P = rimPerim(D);
  let s;
  // внутри городка (место задели разлётом) — по ближайшей кромке, а не по западной
  if (x >= TOWN.x0 && x <= TOWN.x1 && y >= TOWN.y0 && y <= TOWN.y1) {
    const e = Math.min(y - TOWN.y0, TOWN.x1 - x, TOWN.y1 - y, x - TOWN.x0);
    s = e === y - TOWN.y0 ? x - TOWN.x0 : e === TOWN.x1 - x ? W + Q + (y - TOWN.y0) : e === TOWN.y1 - y ? W + 2 * Q + H + (TOWN.x1 - x) : 2 * W + 3 * Q + H + (TOWN.y1 - y);
  } else if (y < TOWN.y0 && x >= TOWN.x0 && x <= TOWN.x1) s = x - TOWN.x0;
  else if (x > TOWN.x1 && y < TOWN.y0) s = W + (Math.PI / 2 - Math.atan2(TOWN.y0 - y, x - TOWN.x1)) * D;
  else if (x > TOWN.x1 && y <= TOWN.y1) s = W + Q + (y - TOWN.y0);
  else if (x > TOWN.x1) s = W + Q + H - Math.atan2(TOWN.y1 - y, x - TOWN.x1) * D;
  else if (y > TOWN.y1 && x >= TOWN.x0) s = W + 2 * Q + H + (TOWN.x1 - x);
  else if (y > TOWN.y1) s = 2 * W + 2 * Q + H + (-Math.PI / 2 - Math.atan2(TOWN.y1 - y, x - TOWN.x0)) * D;
  else if (y >= TOWN.y0) s = 2 * W + 3 * Q + H + (TOWN.y1 - y);
  else s = 2 * W + 3 * Q + 2 * H + (Math.PI - Math.atan2(TOWN.y0 - y, x - TOWN.x0)) * D;
  return (((s / P) % 1) + 1) % 1;
}

// ── карта стороны: место прототипа (широта, долгота) → доля сектора. Сектор идёт по
// часовой от шва с соседом слева к шву с соседом справа; земля ложится так, чтобы у шва
// стояло то, что ближе к соседней традиции
export const GEO_AXES = {
  north: { from: 'Исландия, Ирландия (у запада)', to: 'Кола, Поморье (у равнины)', a: (lat, lon) => (lon + 22) / 66 },
  plain: { from: 'Псков, Петербург (у севера)', to: 'Урал, Сибирь (у востока)', a: (lat, lon) => (lon - 28) / 34 },
  east: { from: 'Япония (у равнины)', to: 'Индия (у юга)', a: (lat, lon) => ((lat - 45) * -27 + (lon - 135) * -65) / (27 * 27 + 65 * 65) },
  south: { from: 'Персия, Залив (у востока)', to: 'Иберия, Магриб (у запада)', a: (lat, lon) => (60 - lon) / 70 },
  west: { from: 'Италия, Иберия (у юга)', to: 'Британия, Голландия (у севера)', a: (lat, lon) => (lat - 37) / 23 },
};
export const A_MIN = 0.08, A_MAX = 0.92;
export const clampA = a => Math.max(A_MIN, Math.min(A_MAX, a));
export function geoA(side, lat, lon) {
  if (lat == null || lon == null) return null;
  const ax = GEO_AXES[side];
  return ax ? clampA(ax.a(lat, lon)) : null;
}
// ── годы колец: начало — у внутренней кромки, конец — у внешней (диапазоны — WORLD_WEAVE, SCALE)
export const RING_YEARS = [[-800, -200], [-300, 500], [500, 1600], [1600, 1700], [1700, 1800], [1800, 1900], [1900, 1945], [1945, 1991], [1991, 2026]];
export const R_MIN = 0.16, R_MAX = 0.84;
export function yearR(n, year) {
  if (year == null || !RING_YEARS[n - 1]) return null;
  const [y0, y1] = RING_YEARS[n - 1];
  return Math.max(R_MIN, Math.min(R_MAX, R_MIN + (R_MAX - R_MIN) * (year - y0) / (y1 - y0)));
}
export const ringDepth = (n, r) => RING_EDGE[n - 1] + r * RING_WS[n - 1];

// ── замыслы местности: река и дуги — точками с клеткой
let FEAT = null;
export function features() {
  if (FEAT) return FEAT;
  const cell = p => { const n = ringAt(p.x, p.y); return n >= 1 && n <= RINGS ? n + ':' + sideAt(p.x, p.y) : null; };
  const river = idealRiver().filter((p, i) => i % 3 === 0).map(p => ({ x: p.x, y: p.y, c: cell(p) })).filter(p => p.c);
  const arcs = [];
  for (const A of idealArcs()) for (const p of A.pts) { const c = cell(p); if (c) arcs.push({ x: p.x, y: p.y, c, arc: A.id }); }
  FEAT = { river, arcs };
  return FEAT;
}
// ближайшая точка замысла в той же клетке, не дальше R (точки — по клеткам, один раз на список)
const BY_CELL = new WeakMap();
export function nearestIn(list, c, x, y, R) {
  let idx = BY_CELL.get(list);
  if (!idx) { idx = new Map(); for (const p of list) { if (!idx.has(p.c)) idx.set(p.c, []); idx.get(p.c).push(p); } BY_CELL.set(list, idx); }
  let best = null, bd = R;
  for (const p of idx.get(c) || []) { const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; } }
  return best ? { ...best, d: bd } : null;
}
// местная вершина: самое высокое в радиусе R (рельеф до дорог и дворов)
export function summitNear(x, y, R, c) {
  let best = { x, y, h: heightRaw(x, y) };
  for (let dy = -R; dy <= R; dy += 40) for (let dx = -R; dx <= R; dx += 40) {
    if (dx * dx + dy * dy > R * R) continue;
    const px = x + dx, py = y + dy, h = heightRaw(px, py);
    if (h > best.h + 0.5 && cellAt(px, py) === c) best = { x: px, y: py, h };
  }
  return best;
}
export const cellAt = (x, y) => { const n = ringAt(x, y); return n >= 1 && n <= RINGS ? n + ':' + sideAt(x, y) : null; };
// дорога своей стороны на расстоянии d от городка (равнину ведёт трассировщик — её здесь нет)
export const roadAt = (side, d) => side === 'plain' ? null : trailPoint(side, d);
