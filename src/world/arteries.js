// ═══════════════════════════════════════
// АРТЕРИИ — то, что сшивает диск (канон WORLD_WEAVE §2, world_weave.js).
//   Дороги — по одной на сторону, стареют с эпохой: тропа → мостовая →
//     брусчатка → асфальт → трасса; все пять упираются в кольцо огня и в нём
//     умирают в обратном порядке. Пятая — на равнину, из северо-восточного
//     угла городка.
//   Река Гераклита — спираль от родника у городка к сухому руслу у края:
//     каждое кольцо и каждую сторону — по разу. Стареет по ходу: ручей →
//     акведук → канал → труба → сухое русло. Где её переходит дорога — мост
//     своей эпохи; под акведуком и трубой дорога проходит понизу.
//   Кольцевые — дуги, не круги: шёлковый путь (осевое, восток → юг);
//     караваны (свет и сад, юг → запад), зимник (север → равнина), волок
//     (равнина → восток); железная дорога (пар и тени, север → равнина →
//     восток); сеть — полное кольцо «сейчас». На швах сторон — площадки
//     узлов (сцены узлов — world_cells: RING_NODES; ставит автор).
//   Линия неба — вдоль каждой дороги, по правую руку от идущего наружу:
//     акведук → аркады → столбы → ЛЭП → эстакада.
// Прокладывается при запуске в обход построек, дворов и табличек
// (world/routes.js): прежняя раскладка не сдвигается.
// ═══════════════════════════════════════
import { TOWN, RINGS, RINGS_D, RING_EDGE, FIRE_W, WORLD_W, WORLD_H, warpedDist, townDist, trailPoint, trailWind, rimPoint, rimPerim, rimFrac, ringOfD, ringD } from './disc.js';
import { makeBlock, route, resample, freeNear, blockedAt } from './routes.js';
import { sideAt } from './relief.js';

export const OUTER = RINGS_D + FIRE_W;
const CX = (TOWN.x0 + TOWN.x1) / 2;

// ── стадии по эпохе (расстояние d — то же, что у колец) ──
export function roadStage(d) {
  if (d > RINGS_D) {                                          // кольцо огня: умирает в обратном порядке
    const f = (d - RINGS_D) / FIRE_W;
    return f < 0.3 ? 'asphalt' : f < 0.6 ? 'cobble' : f < 0.9 ? 'trail' : null;
  }
  const n = Math.max(1, ringOfD(d));
  return n === 1 ? 'trail' : n <= 3 ? 'paved' : n <= 6 ? 'cobble' : n <= 8 ? 'asphalt' : 'highway';
}
export function riverStage(d) {
  const n = Math.max(1, ringOfD(d));
  return n === 1 || n === 3 ? 'stream' : n === 2 ? 'aqueduct' : n <= 6 ? 'canal' : n <= 8 ? 'pipe' : 'dry';
}
export function skyStage(d) {
  const n = Math.max(1, ringOfD(d));
  return n <= 2 ? 'aqueduct' : n <= 5 ? 'arcade' : n === 6 ? 'poles' : n <= 8 ? 'pylons' : 'flyover';
}
// полуширина на земле
export const HW = {
  trail: 2.5, paved: 4, cobble: 5, asphalt: 6, highway: 7,
  stream: 4, aqueduct: 3, canal: 7, pipe: 2.5, dry: 6, bed: 7,
  silk: 3.5, caravan: 3.5, winter: 3, portage: 3.5, rail: 4, net: 6,
  arcade: 3, poles: 0, pylons: 0, flyover: 5,
  street: 5, lane: 4,                                         // улицы квартала городка: главные и переулки
  motorway: 7,                                                // брошенная трасса городка
  path: 2,                                                    // тропинка городка — к дальним местам
};
// на земле — по ней ходят; поднятое — проходишь понизу (на земле только тень)
export const RAISED = new Set(['aqueduct', 'pipe', 'arcade', 'poles', 'pylons', 'flyover']);
const WATER = new Set(['stream', 'canal']);

// руины линии неба: акведук и аркады стоят пролётами с прорехами (по длине u)
export function skyRun(u, st) {
  if (st === 'aqueduct') { const k = Math.floor(u / 96), f = (u % 96) / 96; return f < 0.55 + 0.35 * fr(k * 3.1); }
  if (st === 'arcade') { const k = Math.floor(u / 120), f = (u % 120) / 120; return f < 0.25 + 0.3 * fr(k * 5.7); }
  return st === 'flyover';
}
const fr = n => { const v = Math.sin(n * 127.13 + 3.1) * 43758.5453; return v - Math.floor(v); };

export const lines = [];        // { kind, id, pts: [{x, y, s, d, st, hw}] }
export const bridges = [];      // { x, y, ax, ay (вдоль дороги), len, hw, style }
export const nodes = [];        // площадки узлов { x, y, road, pair }
export const fords = [];        // броды ручья: камни поперёк { x, y, s }
export let artBlock = null;     // сетка занятости после прокладки (постройки, дворы, утварь; дороги — проходимы)

// ── сетка отрезков для поиска рядом; у реки — своя (долина: каждая точка рельефа) ──
const G = 128, grid = new Map(), rgrid = new Map(), CARVE_R = 42;
function index(line) {
  const P = line.pts;
  for (let i = 0; i < P.length - 1; i++) {
    const a = P[i], b = P[i + 1], r = Math.max(a.hw, b.hw) + 3;
    const i0 = Math.floor((Math.min(a.x, b.x) - r) / G), i1 = Math.floor((Math.max(a.x, b.x) + r) / G);
    const j0 = Math.floor((Math.min(a.y, b.y) - r) / G), j1 = Math.floor((Math.max(a.y, b.y) + r) / G);
    for (let gi = i0; gi <= i1; gi++) for (let gj = j0; gj <= j1; gj++) {
      const k = gi * 100000 + gj;
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push({ line, i });
    }
    if (line.kind !== 'river' || a.st === 'aqueduct' || a.st === 'pipe' || !a.st) continue;
    // долина: отрезки русла на земле — в свою сетку, с запасом на ширину долины
    const ri0 = Math.floor((Math.min(a.x, b.x) - CARVE_R) / G), ri1 = Math.floor((Math.max(a.x, b.x) + CARVE_R) / G);
    const rj0 = Math.floor((Math.min(a.y, b.y) - CARVE_R) / G), rj1 = Math.floor((Math.max(a.y, b.y) + CARVE_R) / G);
    for (let gi = ri0; gi <= ri1; gi++) for (let gj = rj0; gj <= rj1; gj++) {
      const k = gi * 100000 + gj;
      if (!rgrid.has(k)) rgrid.set(k, []);
      rgrid.get(k).push(a, b);
    }
  }
}
// отрезки, задевающие прямоугольник
export function segmentsIn(x0, y0, x1, y1) {
  const out = [], seen = new Set();
  for (let gi = Math.floor(x0 / G); gi <= Math.floor(x1 / G); gi++) for (let gj = Math.floor(y0 / G); gj <= Math.floor(y1 / G); gj++) {
    const L = grid.get(gi * 100000 + gj);
    if (!L) continue;
    for (const sg of L) {
      const key = sg.line.id + ':' + sg.i;
      if (!seen.has(key)) { seen.add(key); out.push(sg); }
    }
  }
  return out;
}
// расстояние от точки до отрезка: { d, t }
export function segDist(x, y, a, b) {
  const lx = b.x - a.x, ly = b.y - a.y, L2 = lx * lx + ly * ly || 1;
  const t = Math.max(0, Math.min(1, ((x - a.x) * lx + (y - a.y) * ly) / L2));
  return { d: Math.hypot(x - a.x - lx * t, y - a.y - ly * t), t };
}
// что под ногами: 'water' — вброд, 'ice' — вода севера замёрзла, 'path' —
// дорога (мост и брод — тоже), null — земля
export function surfaceOf(x, y) {
  let res = null;
  const L = grid.get(Math.floor(x / G) * 100000 + Math.floor(y / G));
  if (!L) return null;
  for (const { line, i } of L) {
    const a = line.pts[i], b = line.pts[i + 1], { d, t } = segDist(x, y, a, b);
    const st = t < 0.5 ? a.st : b.st, hw = a.hw + (b.hw - a.hw) * t;
    if (!st || RAISED.has(st) || d > hw) continue;
    if (line.kind === 'river') {
      if (WATER.has(st) && !res) res = fordAt(a.s + t * Math.hypot(b.x - a.x, b.y - a.y)) ? 'path' : (t < 0.5 ? a : b).ice ? 'ice' : 'water';
      continue;
    }
    return 'path';                                            // дорога (и мост) — поверх воды
  }
  return res;
}
// брод: по камням — посуху (u — длина вдоль реки)
const FORD_W = 7;
export function fordAt(u) {
  for (const f of fords) if (Math.abs(u - f.s) < FORD_W) return f;
  return null;
}
// на артерии ли (трава и утварь не ложатся); margin — запас
export function onArtery(x, y, margin = 0, skip = null) {
  for (let gi = Math.floor((x - margin) / G); gi <= Math.floor((x + margin) / G); gi++) {
    for (let gj = Math.floor((y - margin) / G); gj <= Math.floor((y + margin) / G); gj++) {
      const L = grid.get(gi * 100000 + gj);
      if (!L) continue;
      for (const { line, i } of L) {
        if (line === skip) continue;
        const a = line.pts[i], b = line.pts[i + 1], { d, t } = segDist(x, y, a, b);
        const st = t < 0.5 ? a.st : b.st;
        if (!st || st === 'poles' || st === 'pylons') continue;
        if (d <= (a.hw + (b.hw - a.hw) * t) + margin) return true;
      }
    }
  }
  return false;
}
// у дороги ли (дорога или кольцевая дуга в r точках) — жильё тянется к дорогам
export function nearRoad(x, y, r) {
  for (let gi = Math.floor((x - r) / G); gi <= Math.floor((x + r) / G); gi++) {
    for (let gj = Math.floor((y - r) / G); gj <= Math.floor((y + r) / G); gj++) {
      const L = grid.get(gi * 100000 + gj);
      if (!L) continue;
      for (const { line, i } of L) {
        if (line.kind !== 'road' && line.kind !== 'arc') continue;
        const a = line.pts[i];
        if (!a.st) continue;
        if (segDist(x, y, a, line.pts[i + 1]).d <= r) return true;
      }
    }
  }
  return false;
}
// долина реки: насколько опустить землю (рельеф — world/relief.js; зовётся
// на каждую точку высот — без выделения памяти)
export function riverCarve(x, y) {
  const L = rgrid.get(Math.floor(x / G) * 100000 + Math.floor(y / G));
  if (!L) return 0;
  let m2 = CARVE_R * CARVE_R;
  for (let k = 0; k < L.length; k += 2) {
    const a = L[k], b = L[k + 1], lx = b.x - a.x, ly = b.y - a.y, rx = x - a.x, ry = y - a.y;
    let t = (rx * lx + ry * ly) / (lx * lx + ly * ly || 1);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const ex = rx - lx * t, ey = ry - ly * t, d2 = ex * ex + ey * ey;
    if (d2 < m2) m2 = d2;
  }
  const k = 1 - m2 / (CARVE_R * CARVE_R);
  return 11 * k * k;
}

// ── замыслы ──
// точка обхода на кольцевом расстоянии D (догоняем рваную границу по нормали)
export function rimAt(f, D) {
  const p = rimPoint(f * rimPerim(D), D);
  let x = p.x, y = p.y;
  for (let k = 0; k < 5; k++) { const e = D - warpedDist(x, y); x += p.nx * e; y += p.ny * e; }
  return { x, y, nx: p.nx, ny: p.ny };
}
// дорога равнины — из северо-восточного угла городка наружу, по дуге СВ;
// постройки равнины ставились без дороги цепочкой по диагонали, так что
// угол — где свободнее (a — доля четверти от востока)
function plainIdeal(a = 0.5) {
  const A = a * Math.PI / 2, out = [];
  for (let d = 0; d <= OUTER; d += 6) {
    const w = trailWind(d, 3.3) * 0.8;
    out.push({ x: TOWN.x1 + d * Math.cos(A) + w * Math.sin(A), y: TOWN.y0 - d * Math.sin(A) + w * Math.cos(A) });
  }
  return out;
}
function plainAngle(B) {
  let best = 0.5, bv = Infinity;
  for (let a = 0.3; a <= 0.701; a += 0.025) {
    const P = plainIdeal(a);
    let busy = 0;
    for (const p of P) if (blockedAt(B, p.x, p.y)) busy++;
    const v = busy / P.length + Math.abs(a - 0.5) * 0.1;
    if (v < bv) { bv = v; best = a; }
  }
  return best;
}
// кольцевые дуги (канон WORLD_WEAVE §2): кольцо, от дороги какой стороны
// к какой по часовой, D — где по кольцу (середина; рельсы — к внешней
// кромке, сеть — чуть наружу)
const ARCS = [
  { id: 'silk', n: 1, from: 'east', to: 'south', name: 'шёлковый путь', seams: [['east', 'south']] },
  { id: 'caravan', n: 3, from: 'south', to: 'west', name: 'караваны', seams: [['south', 'west']] },
  { id: 'winter', n: 3, from: 'north', to: 'plain', name: 'зимник', seams: [['north', 'plain']] },
  { id: 'portage', n: 3, from: 'plain', to: 'east', name: 'волок', seams: [['plain', 'east']] },
  { id: 'rail', n: 6, from: 'north', to: 'east', name: 'железная дорога', seams: [['north', 'plain'], ['plain', 'east']] },
  { id: 'net', n: 9, from: 'south', to: 'south', name: 'сеть', full: true, seams: [] },
].map(A => ({ ...A, D: ringD(A.n, 100 + (A.id === 'net' ? 30 : A.id === 'rail' ? 62 : 0)) }));

// спираль реки: родник — у юго-западного угла городка, на западной стороне
// шва; по часовой: запад → север → равнина → восток → юг, к сухому руслу
// в кольце огня — не доходя до шва, откуда начала: каждая сторона по разу.
// Наружу река уходит неровно: у кольцевых дуг — круто (дугу переходит
// один раз и поперёк), между ними — полого.
const R0 = 50, R1 = RINGS_D + FIRE_W * 0.6, SPAN = 0.85;           // углы колец теперь длинны: шов юг|запад у огня — на 0,70 оборота
function riverD() {
  // доля оборота на каждую точку расстояния: у дуг мало
  const n = Math.ceil(R1 - R0), F = new Float32Array(n + 1);
  for (let k = 1; k <= n; k++) {
    const D = R0 + k;
    let w = 1;
    for (const A of ARCS) { const x = (D - A.D) / 70; if (Math.abs(x) < 1) w = Math.min(w, 1 - 0.85 * (1 - x * x)); }
    // кромку эпохи и огня — тоже круто и поперёк: кромка рваная (±80), полого её не перейти по разу
    for (let k = 1; k <= RINGS; k++) { const x = (D - RING_EDGE[k]) / 130; if (Math.abs(x) < 1) w = Math.min(w, 1 - 0.85 * (1 - x * x)); }
    F[k] = F[k - 1] + w;
  }
  for (let k = 0; k <= n; k++) F[k] /= F[n];
  return t => {                                                    // обратная: доля оборота → расстояние
    let lo = 0, hi = n;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (F[m] < t) lo = m; else hi = m; }
    const f = F[hi] > F[lo] ? (t - F[lo]) / (F[hi] - F[lo]) : 0;
    return R0 + lo + f;
  };
}
// замысел реки — от постоянных диска: считается раз (им пользуются и места клеток, и трассировщик)
let RIVER_IDEAL = null;
function riverIdeal() {
  if (!RIVER_IDEAL) RIVER_IDEAL = riverIdealCalc();
  return RIVER_IDEAL.map(p => ({ x: p.x, y: p.y }));
}
function riverIdealCalc() {
  const f0 = seamFrac(['south', 'west'], R0) + 0.012, Dof = riverD(), out = [];
  const N = 2000, LEN = 9000 * rimPerim((R0 + R1) / 2) / 15375;       // меандр — в точках земли, а не в долях оборота
  for (let k = 0; k <= N; k++) {
    const t = k / N, D = Dof(t), f = (f0 + SPAN * t) % 1;
    const p = rimAt(f, D);
    // меандр: ручей и сухое русло вьются, канал и труба — прямее
    const st = riverStage(D), m = st === 'stream' || st === 'dry' ? 1 : 0.25;
    const s = t * LEN, off = m * (22 * Math.sin(s / 95) + 9 * Math.sin(s / 41 + 1.3));
    out.push({ x: p.x + p.nx * off, y: p.y + p.ny * off * 0.6 });
  }
  return out;
}
// дуга на кольце n от дороги стороны A до дороги стороны B по часовой
function arcIdeal(D, from, to, full, step = 6) {
  const fs = rimFrac(from.x, from.y, D);
  let fe = full ? fs + 1 : rimFrac(to.x, to.y, D);
  if (fe <= fs) fe += 1;
  const out = [], n = Math.ceil((fe - fs) * rimPerim(D) / step);
  for (let k = 0; k <= n; k++) { const p = rimAt(fs + (fe - fs) * k / n, D); out.push({ x: p.x, y: p.y }); }
  out[0] = { x: from.x, y: from.y };
  if (!full) out[out.length - 1] = { x: to.x, y: to.y };
  return out;
}
// замыслы реки и дуг — до построек (world/geoplace.js: что стоит у воды и у пути, встаёт к ним;
// трассировщик потом обходит постройки рядом, не уходя далеко). Дуга примыкает к тропе стороны
// на своём D; у равнины — к середине её возможных углов
export const idealRiver = () => riverIdeal();
export function idealArcs() {
  const at = (side, D) => side === 'plain' ? plainIdeal(0.5)[Math.round(D / 6)] : trailPoint(side, D);
  return ARCS.map(A => ({ id: A.id, n: A.n, name: A.name, D: A.D, pts: arcIdeal(A.D, at(A.from, A.D), at(A.to, A.D), A.full, 24) }));   // замысел — точкой через 24
}
// линия неба: вдоль дороги, сбоку, в off точках (по глубине — сжато)
function skyIdeal(road, off) {
  const P = road.pts, out = [];
  for (let i = 0; i < P.length; i += 2) {
    const a = P[Math.max(0, i - 2)], b = P[Math.min(P.length - 1, i + 2)];
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
    if (P[i].d < 40 || P[i].d > RINGS_D) continue;
    out.push({ x: P[i].x - dy / L * off, y: P[i].y + dx / L * off * 0.6 });   // off > 0 — по правую руку от идущего наружу
  }
  return out;
}
// скользящее среднее ±R точек; у концов окно сужается (концы на месте)
function smoothPts(P, R) {
  return P.map((p, i) => {
    const r = Math.min(R, i, P.length - 1 - i);
    let sx = 0, sy = 0;
    for (let k = -r; k <= r; k++) { sx += P[i + k].x; sy += P[i + k].y; }
    return { ...p, x: sx / (2 * r + 1), y: sy / (2 * r + 1) };
  });
}
// линия неба прямая: акведук и ЛЭП не петляют за каждым изгибом дороги —
// сбоку от выпрямленной дороги (сначала дорогу сгладить: иначе на изгибах
// сдвинутая линия идёт петлями), и ещё раз сгладить
function skyLine(road, off) {
  const straight = { pts: smoothPts(road.pts, 30) };
  return resample(smoothPts(skyIdeal(straight, off), 6), 6);
}
// по какую руку и как далеко: где пояс дворов вдоль дороги кончается и
// линия не уходит в чужую сторону света
function skyOffset(B, road) {
  let best = 260, bv = Infinity;
  for (const off of [160, -160, 260, -260, 360, -360, 460, -460]) {
    const P = skyIdeal(road, off);
    let busy = 0, away = 0;
    for (const p of P) { if (blockedAt(B, p.x, p.y)) busy++; if (sideAt(p.x, p.y) !== road.side) away++; }
    const v = (busy + 3 * away) / P.length + Math.abs(off) / 5000;
    if (v < bv) { bv = v; best = off; }
  }
  return best;
}

// дорога стороны идёт по прежней тропе, но если на тропе стоит табличка
// или столб — полотно плавно обходит подножие (feet: { x0, x1, y }); обход
// ищет тот же трассировщик: подножия (с запасом в полдороги) — препятствия,
// тропа — замысел, где свободно — она и остаётся
function feetBlock(feet) {
  const boxes = [];
  for (const f of feet) {
    const st = roadStage(warpedDist((f.x0 + f.x1) / 2, f.y));
    if (!st) continue;
    const c = HW[st] + 3;
    boxes.push({ x0: f.x0 - c, x1: f.x1 + c, y0: f.y - 3 - c, y1: f.y + 1 + c });
  }
  return makeBlock(WORLD_W, WORLD_H, boxes, 0);
}
const aside = (FB, pts) => route(FB, pts, { every: 48, pad: 48, smooth: 2, step: 6 });

// линия: точки с расстоянием d (по рваным кольцам) и стадией; у идущих наружу
// стадия — по наибольшему d от начала: на рваном шве колец она не мигает
function finish(kind, id, pts, stageOf, extra = {}) {
  let far = 0;
  const line = { kind, id, ...extra, pts: pts.map(p => {
    const d = warpedDist(p.x, p.y);
    far = Math.max(far, d);
    const st = stageOf(kind === 'arc' ? d : far, p);
    return { x: p.x, y: p.y, s: p.s, d, st, hw: st ? HW[st] : 0 };
  }) };
  lines.push(line);
  index(line);
  return line;
}

// линия городка, проложенная руками, а не трассировщиком (русло, тропы, улицы):
// точки — [x, y], стадия на всю длину одна; ложится в землю и в поиск рядом, как
// прочие; town — чтобы приметы, поля и аллеи колец её не считали своей дорогой
export const shapeLine = pts => resample(smoothPts(resample(pts.map(([x, y]) => ({ x, y })), 6), 4), 6);   // точки линии — как ляжет
export function addLine(kind, id, pts, st) {
  return finish(kind, id, shapeLine(pts), () => st, { town: true });
}

const SIDE4 = ['south', 'north', 'east', 'west'], SIDE5 = [...SIDE4, 'plain'];

// ── сборка: boxes — занятое (постройки, дворы, таблички, утварь) { x0, y0, x1, y1 };
// feet — подножия того, что стоит у тропы { x0, x1, y }
export function buildArteries(boxes, feet = []) {
  lines.length = 0; bridges.length = 0; nodes.length = 0; fords.length = 0; grid.clear(); rgrid.clear();
  const busy = [...boxes, { x0: TOWN.x0 + 4, y0: TOWN.y0 + 4, x1: TOWN.x1 - 4, y1: TOWN.y1 - 4 }];
  // дороги сторон: тропы прежние (по ним стоят ворота) — без перекладки
  const roads = {}, FB = feetBlock(feet);
  for (const side of SIDE4) {
    const pts = [];
    for (let d = 0; d <= OUTER; d += 6) pts.push(trailPoint(side, d));
    roads[side] = finish('road', 'road:' + side, aside(FB, resample(pts, 6)), d => roadStage(d), { side });
  }
  let B = makeBlock(WORLD_W, WORLD_H, busy, 10, SIDE4.map(s => roads[s].pts), 12);
  const pa = plainAngle(B);
  roads.plain = finish('road', 'road:plain', route(B, plainIdeal(pa), { every: 200, pad: 110 }), d => roadStage(d), { side: 'plain', angle: pa });
  B = makeBlock(WORLD_W, WORLD_H, busy, 10, SIDE5.map(s => roads[s].pts), 12);
  // река: родник — на свободном месте у кромки городка
  const rIdeal = riverIdeal();
  rIdeal[0] = freeNear(B, rIdeal[0]);
  const river = finish('river', 'river', route(B, rIdeal, { every: 240, pad: 130, smooth: 3, wide: false, dist: townDist, slack: 60 }), d => d > OUTER ? null : riverStage(d));
  for (const p of river.pts) p.ice = WATER.has(p.st) && p.d > RING_EDGE[2] && sideAt(p.x, p.y) === 'north';   // на севере вода стоит льдом
  // кольцевые дуги: D — середина кольца
  for (const A of ARCS) {
    const D = A.D, ideal = arcIdeal(D, joint(B, roads[A.from], D, 1), joint(B, roads[A.to], D, -1), A.full);
    const L = finish('arc', 'arc:' + A.id, route(B, ideal, { every: 220, pad: 90, smooth: 3, dist: townDist, slack: 70 }), () => A.id, { name: A.name });
    for (const pair of A.seams) {
      const f = seamFrac(pair, D), p = rimAt(f, D), q = nearestXY(L, p.x, p.y);
      if (q) nodes.push({ x: q.x, y: q.y, road: A.name, pair });
    }
  }
  // линия неба — вдоль каждой дороги, по ту руку, где свободнее; не обходит:
  // где под ней постройка или двор, пролёт обрушен (ok — опора стоит)
  for (const side of SIDE5) {
    const off = skyOffset(B, { side, pts: smoothPts(roads[side].pts, 30) }), pts = skyLine(roads[side], off);
    if (pts.length < 3) continue;
    const L = finish('sky', 'sky:' + side, pts, d => d > RINGS_D ? null : skyStage(d), { side, off });
    // опора не встаёт на постройку, двор и на поднятое русло (два акведука не скрещиваются — один обрушен)
    for (const p of L.pts) p.ok = !blockedAt(B, p.x, p.y) && !raisedRiverNear(river, p.x, p.y, 26);
  }
  // мосты: дорога (или дуга) переходит воду реки — мост своей эпохи
  for (const L of lines) {
    if (L.kind !== 'road' && L.kind !== 'arc') continue;
    for (let i = 0; i < L.pts.length - 1; i++) {
      const a = L.pts[i], b = L.pts[i + 1];
      if (!a.st) continue;
      for (const { line, i: j } of segmentsIn(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.max(a.x, b.x), Math.max(a.y, b.y))) {
        if (line !== river) continue;
        const c = river.pts[j], e = river.pts[j + 1];
        if (!WATER.has(c.st) || !cross(a, b, c, e)) continue;
        const ax = b.x - a.x, ay = b.y - a.y, al = Math.hypot(ax, ay) || 1;
        if (bridges.some(br => Math.hypot(br.x - a.x, br.y - a.y) < 30)) continue;
        const n = ringOfD(a.d);
        bridges.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, ax: ax / al, ay: ay / al, len: c.hw * 2 + 10, hw: a.hw + 1,
          style: L.id === 'arc:rail' ? 'rail' : n <= 5 ? 'stone' : n === 6 ? 'iron' : 'concrete', ring: n, by: L.id, s: c.s });
      }
    }
  }
  // броды: камни поперёк ручья — через ~380 точек течения, не у моста и не у дороги
  let last = -1e9;
  for (const p of river.pts) {
    if (p.st !== 'stream' || p.ice || p.s - last < 380) continue;                 // по льду и так посуху
    if (bridges.some(b => Math.hypot(b.x - p.x, b.y - p.y) < 160)) continue;
    if (onArtery(p.x, p.y, 40, river)) continue;
    if (blockedAt(B, p.x, p.y)) continue;
    fords.push({ x: p.x, y: p.y, s: p.s });
    last = p.s;
  }
  artBlock = B;
  return { lines, bridges, nodes, fords };
}

function raisedRiverNear(river, x, y, r) {
  for (const { line, i } of segmentsIn(x - r, y - r, x + r, y + r)) {
    if (line !== river) continue;
    const a = line.pts[i];
    if ((a.st === 'aqueduct' || a.st === 'pipe') && segDist(x, y, a, line.pts[i + 1]).d < r) return true;
  }
  return false;
}
function cross(a, b, c, d) {
  const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b);
}
// где дуга примыкает к дороге: у кольцевого D, но там, где от дороги по ходу
// дуги (dir: 1 — уходит по часовой, −1 — приходит) свободно, а не дворы
function joint(B, road, D, dir) {
  let best = null, bv = Infinity;
  for (const p of road.pts) {
    const e = Math.abs(p.d - D);
    if (e > 90) continue;
    const r = rimPoint(rimFrac(p.x, p.y, D) * rimPerim(D), D), tx = -r.ny * dir, ty = r.nx * dir;
    let busy = 0;
    for (let k = 12; k <= 72; k += 12) if (blockedAt(B, p.x + tx * k, p.y + ty * k)) busy++;
    const v = busy + e / 60;
    if (v < bv) { bv = v; best = p; }
  }
  return best ? { x: best.x, y: best.y } : nearestByD(road, D);
}
function nearestByD(L, D) {
  let best = L.pts[0], bd = Infinity;
  for (const p of L.pts) { const e = Math.abs(p.d - D); if (e < bd) { bd = e; best = p; } }
  return { x: best.x, y: best.y };
}
function nearestXY(L, x, y) {
  let best = null, bd = Infinity;
  for (const p of L.pts) { const e = Math.hypot(p.x - x, p.y - y); if (e < bd) { bd = e; best = p; } }
  return bd < 120 ? best : null;
}
// шов двух сторон на обходе D (доля): В|Ю — середина угла ЮВ, Ю|З — угол ЮЗ,
// С|Р и Р|В — края дуги равнины на углу СВ (0.8 и 0.2 четверти от востока)
function seamFrac([a, b], D) {
  const W = TOWN.x1 - TOWN.x0, H = TOWN.y1 - TOWN.y0, Q = Math.PI * D / 2, P = rimPerim(D);
  const key = a + '|' + b;
  const at = s => s / P;
  if (key === 'east|south') return at(W + Q + H + Q / 2);
  if (key === 'south|west') return at(2 * W + Q * 2 + H + Q / 2);
  if (key === 'north|plain') return at(W + Q * 0.2);
  if (key === 'plain|east') return at(W + Q * 0.8);
  return 0;
}
