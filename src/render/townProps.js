// ═══════════════════════════════════════
// МОСТ ГОРОДКА (world/town.js) — деревянный, через высохшее русло: настил
// поперёк, перила, каменные упоры на берегах. Кусками по глубине, как утварь:
// дальние перила с настилом — за странником, ближние — перед ним (на мосту
// стоят). Свет слева, кромка пеплом справа.
// ═══════════════════════════════════════
import { BRIDGE, FOUNDATIONS, LAMPS, CARS, BUFFER } from '../world/town.js';
import { thing, wearOf } from './things.js';
import { quarterLamp, quarterRuin } from '../sprites/quarter.js';
import { carWreck, bufferStop } from '../sprites/highway.js';

const NI = '#0D0B0A', AS = '#8A8D8F';
const K0 = '#15100c', K1 = '#241c14', K3 = '#34302a', K4 = '#3a3328', BR2 = '#3a2818', L2 = '#b0a284';
const R = (c, col, x, y, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const posts = (half, step) => { const o = []; for (let dx = -(half - 3); dx <= half - 3; dx += step) o.push(dx); if (o[o.length - 1] !== half - 3) o.push(half - 3); return o; };
const rise = dx => (Math.abs(dx) <= 3 ? 2 : Math.abs(dx) <= 9 ? 1 : 0);   // настил горбом

function far(c, X, g, half, deep) {
  R(c, NI, X - half + 4, g, half * 2 - 7, 1); c.globalAlpha = 0.45;   // тень под настилом — на дне русла
  R(c, NI, X - half + 3, g + 1, half * 2 - 5, 1); c.globalAlpha = 1;
  for (const s of [-1, 1]) {                                          // упоры — камнем на берегах
    const x0 = s < 0 ? X - half : X + half - 3;
    R(c, K3, x0, g - deep - 1, 4, deep + 1); R(c, L2, x0, g - deep - 1, 4, 1); R(c, AS, x0 + 3, g - deep, 1, deep);
    R(c, K1, x0, g - 2, 4, 1);
  }
  for (let dx = -half + 3; dx <= half - 4; dx++) {                    // доски поперёк, через одну темнее
    const x = X + dx, top = g - deep - rise(dx);
    R(c, (dx & 1) ? K4 : BR2, x, top, 1, deep - 1 + rise(dx));
    if (dx % 3 === 0) R(c, K1, x, top + 1, 1, deep - 2);
    R(c, L2, x, top, 1, 1);
  }
  R(c, K0, X + 4, g - deep + 1, 1, deep - 3);                          // доска выпала — щель
  R(c, K1, X - half + 3, g - 1, half * 2 - 6, 1);                      // брус по ближнему краю
  for (const dx of posts(half, 5)) R(c, K1, X + dx, g - deep - 6 - rise(dx), 1, 6);   // дальние перила
  for (let dx = -half + 3; dx <= half - 3; dx++) { R(c, K4, X + dx, g - deep - 6 - rise(dx), 1, 1); if (dx < 0) R(c, L2, X + dx, g - deep - 7 - rise(dx), 1, 1); }
}
function near(c, X, g, half) {
  for (const dx of posts(half, 10)) R(c, K1, X + dx, g - 6 - rise(dx), 1, 6 + rise(dx));   // ближние перила — реже
  for (let dx = -half + 3; dx <= half - 3; dx++) { R(c, K4, X + dx, g - 6 - rise(dx), 1, 1); if (dx < 0) R(c, L2, X + dx, g - 7 - rise(dx), 1, 1); }
  R(c, AS, X + half - 3, g - 6, 1, 1);
}

// куски моста: { x, gy, w, h, draw } — дальний (с настилом) и ближний
let pieces = null;
export function bridgePieces() {
  if (pieces) return pieces;
  const B = BRIDGE, X = Math.round(B.x), g = B.gy, w = B.half * 2 + 2;
  const piece = (k, h, fn) => {
    let cv = null;
    const x0 = X - B.half - 1, y0 = g - h;
    return { x: X, gy: k, w, h: k - y0, kind: 'bridge', draw(ctx) {
      if (!cv) { cv = document.createElement('canvas'); cv.width = w + 2; cv.height = h + 3; const q = cv.getContext('2d'); q.translate(-x0, -y0); fn(q); }
      ctx.drawImage(cv, x0, y0);
    } };
  };
  pieces = [piece(g - B.deep, B.deep + 11, q => far(q, X, g, B.half, B.deep)), piece(g + 1, 10, q => near(q, X, g, B.half))];
  return pieces;
}

// ── квартал и шоссе (world/town.js): на фундаментах — огрызки стен, трубы,
// арки; вдоль главных — мёртвые фонари; вдоль трассы — брошенные машины, за
// поездом — тупик. Вещи в земле (render/things.js): тень касания, щебень у
// подошвы, сколы, мох старого камня; фонарь не кренится — гнётся
let things = null;
function buildThings() {
  const out = [];
  for (const f of FOUNDATIONS) {
    const R = f.ruin;
    if (!R) continue;
    const K = quarterRuin(R.kind, f.seed, R.w);
    out.push(thing({ x: R.x, gy: R.gy, w: K.w, h: K.h, draw: K.draw, name: K.name, kind: 'town',
      wear: wearOf({ ring: 1, era: 3, side: 'plain', d: 0, seed: f.seed, foot: 'grit' }) }));
  }
  for (const m of LAMPS) {
    const K = quarterLamp(m.v), wear = wearOf({ ring: 1, era: 5, side: 'plain', d: 0, seed: m.x * 7 + m.gy, foot: 'grit' });
    wear.lean = 0;
    out.push(thing({ x: m.x, gy: m.gy, w: K.w, h: K.h, draw: K.draw, name: K.name, kind: 'town', wear }));
  }
  for (const m of CARS) {
    const K = carWreck(m.v);
    out.push(thing({ x: m.x, gy: m.gy, w: K.w, h: K.h, draw: K.draw, name: K.name, kind: 'town',
      wear: wearOf({ ring: 1, era: 8, side: 'plain', d: 0, seed: m.x * 3 + m.gy * 5, foot: 'grit' }) }));
  }
  const B = bufferStop;
  out.push(thing({ x: BUFFER.x, gy: BUFFER.gy, w: B.w, h: B.h, draw: B.draw, name: B.name, kind: 'town',
    wear: wearOf({ ring: 1, era: 6, side: 'plain', d: 0, seed: 77, foot: 'grit' }) }));
  return out;
}
export function townThingsIn(x0, y0, x1, y1) {
  if (!things) things = buildThings();
  return things.filter(T => T.x + T.w / 2 + 6 > x0 && T.x - T.w / 2 - 6 < x1 && T.gy + 3 > y0 && T.gy - T.h - 6 < y1);
}
