// ═══════════════════════════════════════
// АРТЕРИИ НА ЗЕМЛЕ — дороги, дуги, река и тень под поднятым ложатся в
// плитку земли (render/etch.js) поверх штриха, раз и навсегда:
//   дороги по эпохе — утоптанная тропа, плиты мостовой, брусчатка, асфальт
//     с осевой, трасса с полосами; в кольце огня — рвань и прорехи;
//   дуги — песчаный шёлковый путь со следами, караванная колея, санный
//     зимник, волок на катках, рельсы на шпалах по щебню, асфальт сети;
//   река — вода с бликами неба и камыш по берегу, канал в каменной
//     набережной, сухое русло в трещинах; под акведуком и трубой — тень;
//   линия неба — тень на земле под пролётами (руины — без тени).
// Свет суток штрих меняет, а мощёное — нет: это краска, а не рельеф.
// ═══════════════════════════════════════
import { segmentsIn, segDist, nodes, skyRun, RAISED, fordAt } from '../world/arteries.js';
import { fieldsIn, inField } from '../world/fields.js';
import { RING_W, RINGS } from '../world/disc.js';

const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const NIGHT = hex('#0D0B0A'), BONE = hex('#D9CFB8'), ASH = hex('#8A8D8F'), MGLA = hex('#3D4A3A');

// накладки: col — краска; a — доля (1 — краской поверх, меньше — смешать с землёй)
export const OV = [null];
const ov = (col, a) => { OV.push({ col: typeof col === 'string' ? hex(col) : col, a }); return OV.length - 1; };
const mixc = (a, b, k) => [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * k));
const O = {
  trail: ov(BONE, 0.3), trailEdge: ov(NIGHT, 0.2), pebble: ov(NIGHT, 0.4),
  flag1: ov('#8a8374', 1), flag2: ov('#7b7466', 1), joint: ov('#2a2622', 0.85), kerb: ov('#4c463d', 1),
  cob1: ov('#7a7468', 1), cob2: ov('#6a645a', 1), mortar: ov('#2a2622', 1),
  asph: ov('#2c2b2a', 1), crack: ov('#1a1918', 1), mark: ov('#a8a090', 0.85), shoulder: ov('#3a3836', 1),
  hwy: ov('#262526', 1),
  sand: ov(BONE, 0.32), hoof: ov(NIGHT, 0.45),
  earth: ov(BONE, 0.3), rut: ov(NIGHT, 0.5),
  snowroad: ov(BONE, 0.5), runner: ov(BONE, 0.9),
  mud: ov(NIGHT, 0.36), log: ov('#5c4229', 1), logEdge: ov('#2a1c10', 1),
  ballast: ov(ASH, 0.42), sleeper: ov('#2a1e14', 1), rail: ov('#8A8D8F', 1),
  water: ov(mixc(MGLA, NIGHT, 0.55), 1), glint: ov(mixc(MGLA, BONE, 0.45), 1), bank: ov(NIGHT, 0.34), reed: ov('#2c3626', 1),
  wetEdge: ov(mixc(MGLA, BONE, 0.3), 1),
  cwater: ov(mixc(MGLA, NIGHT, 0.62), 1), cwall: ov('#57534c', 1), ctop: ov('#6e6a60', 1),
  dry: ov(BONE, 0.2), dcrack: ov(NIGHT, 0.45), dbank: ov(NIGHT, 0.28),
  shade: ov(NIGHT, 0.33), deck: ov('#4a463f', 1), deckEdge: ov('#2a2622', 1),
  ice: ov(mixc(MGLA, ASH, 0.42), 1), iceDeep: ov(mixc(MGLA, NIGHT, 0.3), 1), iceCrack: ov(mixc(ASH, BONE, 0.6), 1), iceShine: ov(BONE, 1),
  stone: ov('#8a8477', 1), stoneTop: ov('#bdb5a4', 1), stoneWet: ov(NIGHT, 0.5), ripple: ov(mixc(MGLA, BONE, 0.55), 1),
  // поля: смешиваются с землёй — горизонтали склона под ними видны
  furrow: ov(NIGHT, 0.36), furrowFaint: ov(NIGHT, 0.14), ridge: ov(BONE, 0.14), meza: ov(MGLA, 0.5), stub: ov(BONE, 0.26),
  track: ov(NIGHT, 0.42), weed: ov(MGLA, 0.45),
  paddy: ov(mixc(MGLA, BONE, 0.22), 1), paddyGlint: ov(mixc(MGLA, BONE, 0.55), 1), dike: ov(NIGHT, 0.4), rice: ov(mixc(MGLA, NIGHT, 0.25), 1),
  tea: ov(mixc(MGLA, NIGHT, 0.3), 1), teaLit: ov(mixc(MGLA, BONE, 0.28), 1), aryk: ov(mixc(MGLA, NIGHT, 0.6), 1), plant: ov(MGLA, 0.85),
  pad: ov(BONE, 0.2), padEdge: ov(NIGHT, 0.3), platform: ov('#5a5650', 1),
};

function ih(x, y, s) {
  let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const fract = v => v - Math.floor(v);

// дорога по стадии: u — вдоль, v — поперёк (со знаком), hw — полуширина; fire — в кольце огня (рвань)
function road(st, u, v, hw, x, y, fire) {
  const av = Math.abs(v);
  if (fire && ih(x >> 1, y >> 1, 41) < 0.32) return 0;              // у огня дорога рвётся
  switch (st) {
    case 'trail':
      if (ih(x, y, 7) < 0.06) return O.pebble;
      return av > hw - 0.8 ? O.trailEdge : O.trail;
    case 'paved': {
      if (av > hw - 0.8) return O.kerb;
      const row = Math.floor((v + hw) / 3.6), uu = u / 5.2 + (row & 1) * 0.5, cell = Math.floor(uu);
      if (ih(cell, row, 9) < 0.09) return 0;                          // плиты нет — земля
      if (fract(uu) < 0.16 || fract((v + hw) / 3.6) < 0.24) return O.joint;
      return ih(cell, row, 3) < 0.5 ? O.flag1 : O.flag2;
    }
    case 'cobble': {
      if (av > hw - 0.7) return O.kerb;
      const row = Math.floor((v + hw) / 2), uu = u / 3 + (row & 1) * 0.5;
      if (fract(uu) < 0.3 || fract((v + hw) / 2) < 0.3) return O.mortar;
      return ih(Math.floor(uu), row, 5) < 0.5 ? O.cob1 : O.cob2;
    }
    case 'asphalt':
      if (av > hw - 0.9) return O.shoulder;
      if (av < 0.6 && (u % 12) < 6 && !fire) return O.mark;
      if (ih(Math.floor(u / 7), Math.floor(v), 13) < 0.08 && ih(x, y, 17) < 0.5) return O.crack;
      return O.asph;
    case 'highway':
      if (av > hw - 0.8) return O.shoulder;
      if (av > hw - 1.9) return O.mark;                                // сплошная по краю
      if (av < 0.6 && (u % 14) < 8) return O.mark;                     // прерывистая
      return O.hwy;
  }
  return 0;
}
function arc(st, u, v, hw, x, y) {
  const av = Math.abs(v);
  switch (st) {
    case 'silk': return (u % 5) < 1 && Math.abs(av - 1.5) < 0.6 ? O.hoof : O.sand;
    case 'caravan': return av > 1.1 && av < 2.2 ? O.rut : O.earth;
    case 'winter': return Math.abs(av - 1.2) < 0.5 ? O.runner : O.snowroad;
    case 'portage': { const f = u % 6; return f < 1.6 ? O.log : f < 2.2 ? O.logEdge : O.mud; }
    case 'rail':
      if (Math.abs(av - 2) < 0.55) return O.rail;
      if ((u % 4) < 1.6 && av < hw - 0.5) return O.sleeper;
      return O.ballast;
    case 'net': return av > hw - 0.9 ? O.shoulder : av < 0.6 && (u % 12) < 6 ? O.mark : O.asph;
  }
  return 0;
}
// лёд: тёмное стекло над водой, к середине темнее; редкие белые трещины
// наискось, кое-где блик
function iceAt(u, v, hw, x, y) {
  const a = u * 0.8 + v * 1.7, b = u * 0.55 - v * 2.1;
  const ca = fract(a / 31 + 0.4 * ih(Math.floor(a / 31), 5, 43)), cb = fract(b / 47 + 0.4 * ih(Math.floor(b / 47), 6, 47));
  if (ca < 0.035 || cb < 0.025) return O.iceCrack;
  if (ih(x, y, 53) < 0.012) return O.iceShine;
  return Math.abs(v) < hw * 0.45 ? O.iceDeep : O.ice;
}
// брод: камни поперёк ручья, по ним — посуху; вода обтекает (светлая
// струйка ниже по течению), у камня мокрая кромка
function fordStone(u, v, hw) {
  const f = fordAt(u);
  if (!f) return 0;
  const du = u - f.s;
  for (let vc = -hw + 1.3; vc <= hw - 0.8; vc += 3.4) {
    const e = (du / 2.6) ** 2 + ((v - vc) / 1.5) ** 2;
    if (e < 1) return e < 0.4 && v < vc ? O.stoneTop : O.stone;
    if (e < 1.7) return O.stoneWet;
    if (du > 2.6 && du < 6 && Math.abs(v - vc) < 0.6) return O.ripple;
  }
  return 0;
}
function river(st, u, v, hw, x, y, ice) {
  const av = Math.abs(v);
  switch (st) {
    case 'stream':
      if (av <= hw) {
        const st = fordStone(u, v, hw);
        if (st) return st;
        if (ice) return iceAt(u, v, hw, x, y);
        if (av > hw - 1 && ih(x >> 1, y >> 1, 59) < 0.5) return O.wetEdge;   // мокрая кромка — по ней ручей и читается
        return ih(x, y >> 1, 23) < 0.035 ? O.glint : O.water;
      }
      if (av <= hw + 2) return ih(x, (y >> 1), 29) < 0.14 ? O.reed : O.bank;
      return 0;
    case 'canal':
      if (av <= hw - 1.5) return ice ? iceAt(u, v, hw - 1.5, x, y) : ih(x >> 1, y, 31) < 0.012 ? O.glint : O.cwater;
      if (av <= hw) return O.cwall;
      if (av <= hw + 1) return O.ctop;
      return 0;
    case 'dry': {
      if (av > hw) return av <= hw + 1.5 ? O.dbank : 0;
      const cu = u / 6, cv = (v + hw) / 4;
      const ju = fract(cu + 0.4 * ih(Math.floor(cv), 0, 37)), jv = fract(cv + 0.3 * ih(Math.floor(cu), 1, 39));
      return ju < 0.13 || jv < 0.16 ? O.dcrack : O.dry;
    }
    case 'aqueduct': case 'pipe': return av <= hw + 1 ? O.shade : 0;   // поднятое — на земле тень
  }
  return 0;
}

// край поля гуляет на пару точек (плавно, по шуму)
function wob(x, y, s) {
  const a = Math.floor(x / 9), b = Math.floor(y / 6), fx = x / 9 - a, fy = y / 6 - b;
  const v00 = ih(a, b, s), v10 = ih(a + 1, b, s), v01 = ih(a, b + 1, s), v11 = ih(a + 1, b + 1, s);
  const v = v00 + (v10 - v00) * fx + (v01 - v00) * fy + (v00 - v10 - v01 + v11) * fx * fy;
  return (v - 0.5) * 5;
}
// поле по виду: u — вдоль борозд, w — поперёк; edge — до края (межа, вал чека)
function field(f, x, y, edge) {
  const rx = x - f.cx, ry = y - f.cy, u = rx * f.ux + ry * f.uy, w = rx * f.nx + ry * f.ny;
  if (edge < 1.5) return f.kind === 'paddy' ? O.dike : f.kind === 'fallow' ? (ih(x, y, 71) < 0.5 ? O.weed : 0) : O.meza;
  switch (f.kind) {
    case 'plow': case 'plot': { const k = fract(w / 3); return k < 0.33 ? O.furrow : k < 0.5 ? O.ridge : 0; }
    case 'strip': {                                                    // чересполосица: полосы через межу — пашня и жнивьё
      const sw = (w + 400) / 12;
      if (fract(sw) < 0.09) return O.meza;
      if (Math.floor(sw) & 1) { const k = fract(w / 3); return k < 0.33 ? O.furrow : 0; }
      return fract(u / 4) < 0.25 && fract(w / 2.5) < 0.4 ? O.stub : 0;
    }
    case 'kolkhoz': {                                                  // поле до горизонта, по нему колея трактора
      if (Math.abs(fract((w + 600) / 40) - 0.5) < 0.05) return O.track;
      const k = fract(w / 3.4); return k < 0.3 ? O.furrow : k < 0.45 ? O.ridge : 0;
    }
    case 'fallow':                                                     // заброшено: борозды тают, лезет сорняк
      if (ih(x, y, 61) < 0.07) return O.weed;
      return fract(w / 3) < 0.22 && ih(x >> 1, y, 63) < 0.55 ? O.furrowFaint : 0;
    case 'paddy':                                                      // рисовый чек: вода, валы, ряды ростков
      if (fract((w + 200) / 22) < 0.08 || fract((u + 400) / 44) < 0.045) return O.dike;
      if (fract(u / 3) < 0.34 && fract(w / 4) < 0.25) return O.rice;
      return ih(x, y >> 1, 67) < 0.03 ? O.paddyGlint : O.paddy;
    case 'tea': { const rw = fract(w / 7); return rw < 0.55 ? (rw < 0.16 ? O.teaLit : O.tea) : 0; }   // ряды стриженых кустов
    case 'garden':                                                     // делянка у арыка: вода вдоль края, ростки рядами
      if (w > f.b * 0.72) return O.aryk;
      return fract(w / 4) < 0.3 && fract(u / 3) < 0.5 ? O.plant : 0;
  }
  return 0;
}

// буферы плитки: ближайшая линия своего слоя (числами — без мусора на каждую точку)
const STAGES = [null, 'trail', 'paved', 'cobble', 'asphalt', 'highway', 'silk', 'caravan', 'winter', 'portage', 'rail', 'net',
  'stream', 'aqueduct', 'canal', 'pipe', 'dry', 'arcade', 'poles', 'pylons', 'flyover'];
const SCODE = Object.fromEntries(STAGES.map((s, i) => [s, i]));
let N = 0, bD, bU, bV, bH, bF, bS;
const LAYER = { river: 0, sky: 1, arc: 2, road: 3 };

// штамп: x0, y0 — угол плитки; T — сторона; out — накладки (Uint8Array), cls — биты штриха (снимаем на мощёном)
export function stampPaths(x0, y0, T, out, cls) {
  const segs = segmentsIn(x0 - 12, y0 - 12, x0 + T + 12, y0 + T + 12);
  const pads = nodes.filter(n => n.x > x0 - 20 && n.x < x0 + T + 20 && n.y > y0 - 14 && n.y < y0 + T + 14);
  const flds = fieldsIn(x0, y0, x0 + T, y0 + T);
  if (!segs.length && !pads.length && !flds.length) return false;
  if (N !== T * T) {
    N = T * T;
    bD = new Float32Array(N * 4); bU = new Float32Array(N * 4); bV = new Float32Array(N * 4);
    bH = new Float32Array(N * 4); bF = new Uint8Array(N * 4); bS = new Uint8Array(N * 4);
  }
  bD.fill(Infinity);
  for (const { line, i } of segs) {
    const a = line.pts[i], b = line.pts[i + 1];
    if (!a.st && !b.st) continue;
    if (line.kind === 'sky' && (a.st === 'poles' || a.st === 'pylons' || !a.ok || !b.ok)) continue;   // у опор тени нет; обрушенное — без тени
    const L = LAYER[line.kind], ext = Math.max(a.hw, b.hw) + (line.kind === 'river' ? 3 : 1.5);
    const px0 = Math.max(0, Math.floor(Math.min(a.x, b.x) - ext) - x0), px1 = Math.min(T - 1, Math.ceil(Math.max(a.x, b.x) + ext) - x0);
    const py0 = Math.max(0, Math.floor(Math.min(a.y, b.y) - ext) - y0), py1 = Math.min(T - 1, Math.ceil(Math.max(a.y, b.y) + ext) - y0);
    if (px0 > px1 || py0 > py1) continue;
    const lx = b.x - a.x, ly = b.y - a.y, len = Math.hypot(lx, ly) || 1, L2 = len * len, ext2 = ext * ext;
    const fireA = a.d > RINGS * RING_W, fireB = b.d > RINGS * RING_W, iceA = a.ice ? 2 : 0, iceB = b.ice ? 2 : 0;
    const sA = SCODE[a.st || b.st] || 0, sB = SCODE[b.st || a.st] || 0, base = L * N;
    for (let py = py0; py <= py1; py++) {
      const y = y0 + py, ry = y - a.y;
      for (let px = px0; px <= px1; px++) {
        const rx = x0 + px - a.x;
        let t = (rx * lx + ry * ly) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const ex = rx - lx * t, ey = ry - ly * t, d2 = ex * ex + ey * ey;
        if (d2 > ext2) continue;
        const q = base + py * T + px;
        if (d2 >= bD[q]) continue;                                    // ближайшая линия слоя (в квадратах)
        bD[q] = d2;
        bU[q] = a.s + t * len;
        bV[q] = (rx * ly - ry * lx) / len;                            // со знаком
        bH[q] = a.hw + (b.hw - a.hw) * t;
        const near = t < 0.5;
        bF[q] = ((near ? fireA : fireB) ? 1 : 0) | (near ? iceA : iceB);   // в кольце огня · лёд
        bS[q] = near ? sA : sB;
      }
    }
  }
  let any = false;
  for (let k = 0; k < N; k++) {
    const x = x0 + (k % T), y = y0 + ((k / T) | 0);
    let o = 0, fo = 0;
    for (const f of flds) {                                           // поле — под дорогами и рекой
      if (x < f.x0 || x > f.x1 || y < f.y0 || y > f.y1) continue;
      const e = inField(f, x, y) + wob(x, y, f.seed);                  // межа гуляет: поле не по линейке
      if (e >= 0) { fo = field(f, x, y, e); break; }
    }
    if (bD[k] < Infinity && bS[k]) o = river(STAGES[bS[k]], bU[k], bV[k], bH[k], x, y, (bF[k] & 2) !== 0) || o;
    const st0 = bD[k] < Infinity ? STAGES[bS[k]] : null;
    const wet = (st0 === 'stream' || st0 === 'canal') && Math.abs(bV[k]) <= bH[k] + 1;
    let q = N + k;
    if (bD[q] < Infinity && bS[q] && RAISED.has(STAGES[bS[q]]) && skyRun(bU[q], STAGES[bS[q]]) && Math.abs(bV[q]) <= bH[q] + 0.5) o = O.shade;
    q = 2 * N + k;
    if (bD[q] < Infinity && bS[q] && Math.abs(bV[q]) <= bH[q]) {
      const st = STAGES[bS[q]];
      if (wet && st === 'rail') { const r = arc(st, bU[q], bV[q], bH[q], x, y); if (r !== O.ballast) o = r; }   // рельсы на шпалах над водой
      else if (wet) o = Math.abs(bV[q]) > bH[q] - 1 ? O.deckEdge : O.deck;                                       // мост дуги
      else o = arc(st, bU[q], bV[q], bH[q], x, y) || o;
    }
    q = 3 * N + k;
    if (bD[q] < Infinity && bS[q] && Math.abs(bV[q]) <= bH[q]) {
      if (wet) o = Math.abs(bV[q]) > bH[q] - 1 ? O.deckEdge : O.deck;   // мост: настил над водой
      else o = road(STAGES[bS[q]], bU[q], bV[q], bH[q], x, y, (bF[q] & 1) === 1) || o;
    }
    for (const n of pads) {                                           // площадка узла на шве сторон
      const e = ((x - n.x) / 13) ** 2 + ((y - n.y) / 7) ** 2;
      if (e <= 1) o = e > 0.72 ? O.padEdge : n.road === 'железная дорога' ? O.platform : O.pad;
    }
    if (o) { out[k] = o; cls[k] = 0; any = true; }                    // на мощёном и в воде — без горизонталей
    else if (fo) { out[k] = fo; any = true; if (OV[fo].a >= 1) cls[k] = 0; }   // поле: борозды поверх штриха склона
  }
  return any;
}
