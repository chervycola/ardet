// ═══════════════════════════════════════
// ПОВЕРХНОСТЬ ПОД НОГАМИ — одна таблица: материал → разгон, торможение,
// предел скорости, след. Материал берётся там же, где его рисует земля
// (render/ground.js): кольца, снег севера, гарь огня, стихии за краем.
//   accel — на сколько точек/шаг² растёт скорость, когда идёшь;
//   decel — как быстро гаснет, когда отпустил (или поворачиваешь против хода);
//   max   — доля обычной скорости; print — какой след остаётся.
// Лёд держит плохо: отпустил — едешь. Песок за краем и болото вязнут.
// Тропа чуть быстрее: по ней ходили.
// ═══════════════════════════════════════
import { TOWN, RING_W, RINGS, FIRE_W, warpedDist, trailPoint } from './disc.js';

export const SURF = {
  ground: { name: 'земля',   accel: 0.30, decel: 0.40, max: 1.00, print: 'soft' },
  path:   { name: 'тропа',   accel: 0.32, decel: 0.44, max: 1.08, print: 'soft' },
  snow:   { name: 'снег',    accel: 0.12, decel: 0.09, max: 0.90, print: 'snow' },
  ice:    { name: 'лёд',     accel: 0.045, decel: 0.03, max: 1.05, print: null },
  sand:   { name: 'зыбучий песок', accel: 0.10, decel: 0.50, max: 0.60, print: 'deep' },
  mud:    { name: 'грязь',   accel: 0.14, decel: 0.55, max: 0.72, print: 'mud' },
  swamp:  { name: 'болото',  accel: 0.09, decel: 0.60, max: 0.62, print: null },
  rubble: { name: 'мусор',   accel: 0.22, decel: 0.45, max: 0.82, print: null },
  ash:    { name: 'гарь',    accel: 0.26, decel: 0.40, max: 0.92, print: 'ash' },
};

const OUTER = RINGS * RING_W + FIRE_W;
const MUD_IDS = new Set(['lake', 'pipeline', 'basement', 'pit', 'dumpster']);
let mudSrc = null;

// сектор диска — как у земли: чья кромка городка ближе
function sector(x, y) {
  const dn = TOWN.y0 - y, ds = y - TOWN.y1, dw = TOWN.x0 - x, de = x - TOWN.x1;
  const m = Math.max(dn, ds, dw, de);
  return m === dn ? 'north' : m === ds ? 'south' : m === dw ? 'west' : 'east';
}

// на тропе ли: тропа вьётся от кромки городка на четыре стороны
function onTrail(x, y, side) {
  let d, along, across;
  if (side === 'south') { d = y - TOWN.y1; across = x; }
  else if (side === 'north') { d = TOWN.y0 - y; across = x; }
  else if (side === 'east') { d = x - TOWN.x1; across = y; }
  else { d = TOWN.x0 - x; across = y; }
  if (d < 0 || d > RINGS * RING_W) return false;
  const p = trailPoint(side, d);
  along = side === 'south' || side === 'north' ? p.x : p.y;
  return Math.abs(across - along) < 6;
}

// имя материала в точке мира (ноги странника — x+6, y+24)
export function surfaceAt(x, y, locations) {
  const d = warpedDist(x, y);
  if (d <= 0) {
    // городок: у ядовитых мест земля раскисла
    if (!mudSrc && locations) mudSrc = locations.filter(l => MUD_IDS.has(l.id));
    for (const l of mudSrc || []) {
      const dx = Math.max(l.x - x, 0, x - (l.x + l.w)), dy = Math.max(l.y - y, 0, y - (l.y + l.h));
      if (dx * dx + dy * dy < 50 * 50) return 'mud';
    }
    return 'ground';
  }
  const side = sector(x, y);
  if (d > OUTER) return { south: 'sand', north: 'ice', west: 'swamp', east: 'rubble' }[side];
  if (d > RINGS * RING_W) return 'ash';
  const n = Math.ceil(d / RING_W);
  if (side === 'north' && n >= 3) return 'snow';            // земля севера белая — см. ground.js
  if (onTrail(x, y, side)) return 'path';
  return 'ground';
}
