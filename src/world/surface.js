// ═══════════════════════════════════════
// ПОВЕРХНОСТЬ ПОД НОГАМИ — одна таблица: материал → разгон, торможение,
// предел скорости, след. Материал берётся там же, где его рисует земля
// (render/ground.js): кольца, снег севера, гарь огня, стихии за краем.
//   accel — на сколько точек/шаг² растёт скорость, когда идёшь;
//   decel — как быстро гаснет, когда отпустил (или поворачиваешь против хода);
//   max   — доля обычной скорости; print — какой след остаётся.
// Лёд держит плохо: отпустил — едешь. Песок за краем и болото вязнут.
// Дорога чуть быстрее: по ней ходили (артерии — world/arteries.js: дороги,
// дуги, мосты, броды); ручей и канал переходят вброд — медленно, по колено.
// ═══════════════════════════════════════
import { TOWN, RINGS_D, FIRE_W, warpedDist, ringOfD } from './disc.js';
import { surfaceOf } from './arteries.js';
import { waterAt } from './landforms.js';

// Ход вязкий (слово автора 22.11: «чуть медленнее и вязкая»): шаг набирается
// и гаснет не сразу — на земле и тропе разгон вдвое дольше прежнего, остановка мягче.
// WALK — обычный шаг в точках за тик, RUN — бег (Shift); доля поверхности — поле max.
// Слово автора 23.11: «ещё медленнее и более относительно к местности» — шаг тише (2,1 → 1,7),
// разброс по земле шире: тропа заметно легче, песок, топь, брод и снег — заметно тяжелее.
// Уклон — в main.js (slopeK): в гору медленнее, под гору чуть легче.
export const WALK = 1.7, RUN = 3.3;
export const SURF = {
  ground: { name: 'земля',   accel: 0.13, decel: 0.22, max: 1.00, print: 'soft' },
  path:   { name: 'тропа',   accel: 0.15, decel: 0.26, max: 1.14, print: 'soft' },
  snow:   { name: 'снег',    accel: 0.12, decel: 0.09, max: 0.80, print: 'snow' },
  ice:    { name: 'лёд',     accel: 0.045, decel: 0.03, max: 1.05, print: null },
  sand:   { name: 'зыбучий песок', accel: 0.10, decel: 0.50, max: 0.50, print: 'deep' },
  mud:    { name: 'грязь',   accel: 0.14, decel: 0.55, max: 0.62, print: 'mud' },
  swamp:  { name: 'болото',  accel: 0.09, decel: 0.60, max: 0.52, print: null },
  rubble: { name: 'мусор',   accel: 0.11, decel: 0.28, max: 0.76, print: null },
  ash:    { name: 'гарь',    accel: 0.12, decel: 0.22, max: 0.88, print: 'ash' },
  water:  { name: 'вброд',   accel: 0.11, decel: 0.62, max: 0.45, print: null },
  moss:   { name: 'мох',     accel: 0.20, decel: 0.55, max: 0.85, print: null },   // ход мха: мягко, нога вязнет и встаёт сразу
};

const OUTER = RINGS_D + FIRE_W;
const MUD_IDS = new Set(['lake', 'pipeline', 'basement', 'pit', 'dumpster']);
let mudSrc = null;

// сектор диска — как у земли: чья кромка городка ближе
function sector(x, y) {
  const dn = TOWN.y0 - y, ds = y - TOWN.y1, dw = TOWN.x0 - x, de = x - TOWN.x1;
  const m = Math.max(dn, ds, dw, de);
  return m === dn ? 'north' : m === ds ? 'south' : m === dw ? 'west' : 'east';
}

// имя материала в точке мира (ноги странника — x+6, y+24)
export function surfaceAt(x, y, locations) {
  if (waterAt(x, y) === 1) return 'water';                 // у берега пруда — вброд (world/landforms.js)
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
  const art = surfaceOf(x, y);                              // дорога, мост, брод, вода реки
  if (art) return art;
  if (d > RINGS_D) return 'ash';
  const n = ringOfD(d);
  if (side === 'north' && n >= 3) return 'snow';            // земля севера белая — см. ground.js
  return 'ground';
}
