// ═══════════════════════════════════════
// ГЛУБИНА (weave/SCALE.md, проход глубины). Канон: «10–15 позиций на картину,
// не больше трёх глубины I — остальное глубже» (EASTER_FUND, DRAMATURGY §5);
// картина — клетка диска, кольцо × сторона. Глубина I видна с прогулки, II —
// вторым взглядом.
//  · Громкое — постройка эпохи. На клетку остаются три: доминанта, застава у
//    дороги, двор побольше — ансамблем целиком; громкие клетки не в одном кадре
//    («громкие места клетки — не ближе кадра», SCALE §3); прочие ансамбли уходят
//    в глубину II.
//  · Позиций на клетку на виду — не больше пятнадцати. Юг — наследство улицы
//    эпох — гуще прочих сторон: таблички сверх того уходят в глубину II, дальние
//    от дороги первыми. Живые, входы, подделки со швом и серии стендов — нет.
// Глубина II — в тени и без своего света; подойдёшь — проступает
// (render/quiet.js). Ничего не убрано: осмотр, обход и меню те же.
// ═══════════════════════════════════════
import { RINGS, ringAt, trailPoint, TOWN } from './disc.js';
import { sideAt } from './relief.js';

export const LOUD_PER_CELL = 3, SEEN_PER_CELL = 15;
const SERIES = new Set(['стенд эвфемизма']);         // анфилада по кольцам: читается подряд

const footOf = l => (l.archDraw ? { x: l.archX, y: l.archGy } : { x: l.x + l.w / 2, y: l.y + l.h });
export function cellOf(l) {
  if (l.archDraw) return l.archRing + ':' + l.archSide;
  const f = footOf(l), r = l.streetSeg && l.streetSeg <= RINGS ? l.streetSeg : ringAt(f.x, f.y);
  if (r < 1 || r > RINGS) return null;
  return r + ':' + (l.streetSide || sideAt(f.x, f.y));
}
// как далеко от дороги своей стороны (равнина — от диагонали угла)
function offRoad(l, side) {
  const f = footOf(l);
  if (side === 'south' || side === 'north') return Math.abs(trailPoint(side, Math.abs(side === 'south' ? f.y - TOWN.y1 : TOWN.y0 - f.y)).x - f.x);
  if (side === 'east' || side === 'west') return Math.abs(trailPoint(side, Math.abs(side === 'east' ? f.x - TOWN.x1 : TOWN.x0 - f.x)).y - f.y);
  const a = Math.atan2(TOWN.y0 - f.y, f.x - TOWN.x1);
  return Math.abs(a - Math.PI / 4) * Math.hypot(f.x - TOWN.x1, TOWN.y0 - f.y);
}
export const positional = l => !!(l.look || l.useAction || l.archDraw || l.streetForm) && !l.npc;

export function passDepth(locations, ensembles) {
  const cells = new Map();
  for (const l of locations) {
    if (!positional(l)) continue;
    const c = cellOf(l);
    if (!c) continue;
    if (!cells.has(c)) cells.set(c, []);
    cells.get(c).push(l);
  }
  let quietB = 0, quietS = 0;
  for (const [c, list] of cells) {
    const side = c.split(':')[1];
    // постройки — ансамблями: доминанта, ворота, потом ближе к дороге
    const ens = new Map();
    for (const l of list) if (l.archDraw) { if (!ens.has(l.archEns)) ens.set(l.archEns, []); ens.get(l.archEns).push(l); }
    const rank = e => { const k = ensembles[e[0]]?.kind; return k === 'landmark' ? 0 : k === 'gate' ? 1 : 2; };
    const near = e => Math.min(...e[1].map(l => offRoad(l, side)));
    const order = [...ens.entries()].sort((a, b) => (rank(a) - rank(b)) || (b[1].length - a[1].length) || (near(a) - near(b)));
    const lit = [];
    const apart = ms => lit.every(o => ms.every(l => { const p = footOf(l), q = footOf(o); return Math.abs(p.x - q.x) >= 640 || Math.abs(p.y - q.y) >= 360; }));
    let loud = 0;
    for (const e of order) {
      const members = e[1];
      // первый ансамбль клетки на виду всегда: посёлок равнины в четыре дома — одна находка;
      // двор — если не в одном кадре с уже громким
      if (loud === 0 || (loud + members.length <= LOUD_PER_CELL && (rank(e) < 2 || apart(members)))) { loud += members.length; lit.push(...members); continue; }
      for (const l of members) { l.depth = 2; l.quiet = true; quietB++; }
    }
    // на виду — не больше пятнадцати: таблички, дальние от дороги, — в тень
    let seen = list.filter(l => !l.quiet).length;
    if (seen <= SEEN_PER_CELL) continue;
    const cand = list.filter(l => !l.quiet && l.streetForm && l.streetForm !== 'fire' && !l.streetLive && !l.streetEnter && !l.potemkinSign && !SERIES.has(l.name))
      .sort((a, b) => offRoad(b, side) - offRoad(a, side));
    for (const l of cand) {
      if (seen <= SEEN_PER_CELL) break;
      l.depth = 2; l.quiet = true; quietS++; seen--;
    }
  }
  return { quietB, quietS };
}
