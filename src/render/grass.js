// ═══════════════════════════════════════
// ТРАВА — пучки по земле колец. Гнутся по ветру: полоса порыва бежит
// по полю волной, в бурю трава дрожит чаще и ложится ниже. Перед
// странником расступается и выпрямляется не сразу — за ним остаётся
// примятый след. Нет травы на снегу севера, в гари, за краем, в
// городке и на постройках; гуще всего — в саду света (кольцо 3),
// у западного озера выше, на юге суше и реже.
// ═══════════════════════════════════════
import { wind } from '../world/wind.js';
import { warpedDist, RING_W, RINGS, TOWN } from '../world/disc.js';
import { hash } from './draw.js';
import { groundBlocked } from './ground.js';
import { SEGMENTS } from '../content/ulitsa_db.js';
import { t } from '../core/time.js';

const CELL = 10;
// доля клеток с пучком по кольцу (индекс — номер кольца)
const DENS = [0, 0.16, 0.12, 0.30, 0.22, 0.14, 0.10, 0.07, 0.05, 0.03];
const MIST = [61, 74, 58], DRY = [122, 106, 64], DARK = [20, 18, 14];

function rgb(h) { const v = parseInt(h.slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; }
function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
function css(c) { return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`; }

// цвета по кольцу и стороне: мгла, разбавленная землёй кольца; верхушка светлее
const PAL = {};
function palette(n, side) {
  const key = n * 10 + ({ south: 1, north: 2, west: 3, east: 4 }[side] || 0);
  if (PAL[key]) return PAL[key];
  const g = rgb(SEGMENTS[n - 1].palette.ground);
  // стебель светлее земли (иначе тонет под светом), верхушка — к кости
  let base = mix(mix(g, MIST, 0.5), [190, 190, 150], 0.16);
  if (side === 'south') base = mix(base, DRY, 0.5);
  if (side === 'east') base = mix(base, DARK, 0.25);
  const tip = mix(base, side === 'south' ? [200, 180, 120] : [217, 207, 184], 0.38);
  return (PAL[key] = { base: css(base), tip: css(tip) });
}

function sector(x, y) {
  const dn = TOWN.y0 - y, ds = y - TOWN.y1, dw = TOWN.x0 - x, de = x - TOWN.x1;
  const m = Math.max(dn, ds, dw, de);
  return m === dn ? 'north' : m === ds ? 'south' : m === dw ? 'west' : 'east';
}

// пучок в клетке — детерминированно, с кэшем
const cache = new Map();
function tuft(gx, gy) {
  const key = gx * 100003 + gy;
  let c = cache.get(key);
  if (c !== undefined) return c;
  if (cache.size > 30000) cache.clear();
  c = null;
  const x = gx * CELL + ((hash(gx, gy, 13) * CELL) | 0), y = gy * CELL + ((hash(gx, gy, 17) * CELL) | 0);
  const d = warpedDist(x, y);
  if (d > 0 && d <= RINGS * RING_W - 10) {
    const n = Math.ceil(d / RING_W), side = sector(x, y);
    const dens = DENS[n] * (side === 'south' ? 0.6 : side === 'west' ? 1.3 : side === 'north' ? 0.5 : 1);
    if (!(side === 'north' && n >= 3) && hash(gx, gy, 91) < dens && !groundBlocked(x - 4, y - 9, x + 4, y + 1)) {
      const h = hash(gx, gy, 29), k = 3 + ((h * 7) | 0) % 3, tall = side === 'west' ? 2 : 0;
      const blades = [];
      for (let i = 0; i < k; i++) {
        const r = hash(gx * 3 + i, gy, 41);
        blades.push({ dx: Math.round((i - (k - 1) / 2) * 1.4 + (r - 0.5)), h: 3 + ((r * 4) | 0) + tall, b: 0.7 + r * 0.6 });
      }
      c = { x, y, blades, ph: h * 6.28, pal: palette(n, side) };
    }
  }
  cache.set(key, c);
  return c;
}

// след странника: где ступал недавно — трава ещё примята
const trail = [];
export function stepGrass(player) {
  for (const p of trail) p.age++;
  while (trail.length && trail[0].age > 42) trail.shift();
  if (player.moving && (t & 1) === 0) trail.push({ x: player.x + 6, y: player.y + 23, age: 0 });
  if (trail.length > 24) trail.shift();
}

export function drawGrass(ctx, cam, player) {
  const gx0 = Math.floor((cam.x - 8) / CELL), gy0 = Math.floor((cam.y - 4) / CELL);
  const gx1 = Math.ceil((cam.x + 648) / CELL), gy1 = Math.ceil((cam.y + 372) / CELL);
  const fx = player.x + 6, fy = player.y + 23;
  const live = [...trail, { x: fx, y: fy, age: 0 }];
  for (let gy = gy0; gy <= gy1; gy++) {
    for (let gx = gx0; gx <= gx1; gx++) {
      const c = tuft(gx, gy);
      if (!c) continue;
      const w = wind.at(c.x, c.y);
      // ветер клонит, порыв качает; в бурю дрожь чаще и шире
      let lean = w.x * 4.2 + Math.sin(t * (0.05 + w.s * 0.22) + c.ph) * (0.25 + w.s * 0.9);
      // странник: пучок отклоняется от него и приминается; выпрямляется не сразу
      let flat = 0;
      if (Math.abs(c.x - fx) < 70 && Math.abs(c.y - fy) < 70) {
        for (const p of live) {
          const dx = c.x - p.x, dy = (c.y - p.y) * 1.6, d2 = dx * dx + dy * dy;
          if (d2 >= 196) continue;
          const k = (1 - Math.sqrt(d2) / 14) * (1 - p.age / 42);
          lean += (dx >= 0 ? 1 : -1) * k * 4;
          if (k > flat) flat = k;
        }
      }
      lean = Math.max(-5, Math.min(5, lean));
      // стебли: основание — тёмным, верхушка — светлее
      ctx.fillStyle = c.pal.base;
      for (const b of c.blades) {
        const hh = Math.max(2, Math.round(b.h * (1 - flat * 0.5)));
        for (let j = 0; j < hh - 1; j++) {
          const f = (j + 1) / hh;
          ctx.fillRect(c.x + b.dx + Math.round(lean * b.b * f * f), c.y - j, 1, 1);
        }
      }
      ctx.fillStyle = c.pal.tip;
      for (const b of c.blades) {
        const hh = Math.max(2, Math.round(b.h * (1 - flat * 0.5)));
        ctx.fillRect(c.x + b.dx + Math.round(lean * b.b), c.y - hh + 1, 1, 1);
      }
    }
  }
}
