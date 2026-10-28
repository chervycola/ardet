// ═══════════════════════════════════════
// МЕСТА КЛЕТОК — куда в клетке «кольцо × сторона» встают таблички и постройки
// (раскладка по истории, world/geoplace.js; данные — content/places.js):
//  1. цель вещи — год (радиус) и место прототипа (азимут);
//  2. соседи по смыслу — одно место: табличка на стене постройки, два здания
//     одной площади, один прототип;
//  3. место — к своей местности: у реки, у пути, у дороги (заставы), на холме,
//     у шва;
//  4. места клетки расходятся: «громкие места клетки — не ближе кадра», пустой
//     перегон между ними (SCALE §3); у одиноких — шире;
//  5. неопознанное — в пустые углы клетки, не к дороге.
// Серии, читаемые подряд (стенды эвфемизма), вёрсты, заставы на тракте — у дороги.
// Таблички места — сценой перед постройками; постройки — за ней (architecture.js).
// ═══════════════════════════════════════
import { SEGMENTS } from '../content/ulitsa_db.js';
import { ARCH_BY_RING } from '../sprites/arch/index.js';
import { ARCH_IDS } from '../content/arch_ids.js';
import { PLACES, SIGN_PLACES } from '../content/places.js';
import { TOWN, warpedDist, townDist, trailPoint } from './disc.js';
import { SIDE_ORDER, sectorSpan, sectorPoint, sectorPointFast, sectorFrac, geoA, yearR, ringDepth, features, nearestIn, summitNear, cellAt, RING_YEARS, A_MIN, A_MAX, R_MIN, R_MAX } from './geoplace.js';

export const SERIES = new Set(['стенд эвфемизма']);           // анфилада по кольцам — читается подряд вдоль дороги
export const signKey = (seg, sign) => `${seg.id}:${sign.side || 'south'}:${sign.name}:${sign.x}`;
const hs = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 100003) / 100003; };

// ── что стоит: постройки — по реестру номеров (копии #2/#3 со своими текстами), новые виды — по одной
const landmarksOf = arch => [].concat(arch.landmark || [], arch.landmarks || []).filter(L => L && L.side);
function kindOf(arch, side, name) {
  const L = landmarksOf(arch).find(k => k.side === side && k.name === name);
  if (L) return { ...L, landmark: true };
  return (arch[side] || []).find(k => k.name === name) || null;
}
export function archManifest() {
  const out = [], seen = new Set(), segById = Object.fromEntries(SEGMENTS.map(s => [s.id, s]));
  for (const key of Object.keys(ARCH_IDS).sort((a, b) => ARCH_IDS[a] - ARCH_IDS[b])) {
    const m = key.match(/^([^:]+):([^:]+):(.+?)(?:#(\d+))?$/);
    const seg = m && segById[m[1]], arch = m && ARCH_BY_RING[m[1]], kind = arch && kindOf(arch, m[2], m[3]);
    if (!seg || !kind) continue;                                   // вид снят из модуля — номер остаётся за ним
    out.push({ key, ring: seg.n, ringId: seg.id, side: m[2], name: m[3], nth: +(m[4] || 1), kind });
    seen.add(`${m[1]}:${m[2]}:${m[3]}`);
  }
  for (const seg of SEGMENTS) {
    const arch = ARCH_BY_RING[seg.id];
    if (!arch) continue;
    for (const side of SIDE_ORDER) for (const k of [...(arch[side] || []), ...landmarksOf(arch).filter(L => L.side === side)]) {
      const base = `${seg.id}:${side}:${k.name}`;
      if (seen.has(base)) continue;
      seen.add(base);
      out.push({ key: base, ring: seg.n, ringId: seg.id, side, name: k.name, nth: 1, kind: kindOf(arch, side, k.name) });
    }
  }
  return out;
}
const recOf = (table, key) => table[key] || table[key.replace(/#\d+$/, '')] || null;

function allItems() {
  const out = [];
  for (const seg of SEGMENTS) for (const sign of seg.signs) {
    const side = sign.side || 'south', key = signKey(seg, sign), rec = SIGN_PLACES[key] || null;
    out.push({ key, sign: true, ring: seg.n, side, name: sign.name, rec, road: SERIES.has(sign.name) || !!(rec && rec.road) });
  }
  for (const b of archManifest()) {
    const rec = recOf(PLACES, b.key);
    out.push({ ...b, sign: false, rec, road: !!(rec && rec.road) });
  }
  return out;
}

// ── места ──
const MIN_GAP = 300, ALONE_GAP = 480, OFF_ROAD = 190;
const TWIN_W = 720, TWIN_H = 420;          // кадр 640×360 с полями: одинаковые постройки — не в один
// fast — по ровному обходу (итерации разлёта); в конце место встаёт на рваную кромку
const toAR = (side, x, y, n, fast = false) => ({ a: sectorFrac(side, x, y, fast), r: ((fast ? townDist(x, y) : warpedDist(x, y)) - ringDepth(n, 0)) / (ringDepth(n, 1) - ringDepth(n, 0)) });
const clampAR = ({ a, r }) => ({ a: Math.max(A_MIN, Math.min(A_MAX, a)), r: Math.max(R_MIN, Math.min(R_MAX, r)) });
function putAR(S, a, r, fast = false) {
  const q = clampAR({ a, r }), p = (fast ? sectorPointFast : sectorPoint)(S.side, q.a, ringDepth(S.ring, q.r));
  S.a = q.a; S.r = q.r; S.x = p.x; S.y = p.y; S.nx = p.nx; S.ny = p.ny;
}
// точка в своей клетке: рваные швы — шагом к середине сектора и кольца
function keepIn(S) {
  for (let k = 0; k < 12 && cellAt(S.x, S.y) !== S.cell; k++) putAR(S, S.a + (0.5 - S.a) * 0.18, S.r + (0.5 - S.r) * 0.18);
}
const roadPt = (side, x, y) => {
  if (side === 'plain') return null;
  const d = side === 'south' ? y - TOWN.y1 : side === 'north' ? TOWN.y0 - y : side === 'east' ? x - TOWN.x1 : TOWN.x0 - x;
  return d > 0 ? trailPoint(side, d) : null;
};
const roadDist = (side, x, y) => { const p = roadPt(side, x, y); return p ? Math.hypot(p.x - x, p.y - y) : Infinity; };

// местность места: что тянет его к себе (первое, что нашлось)
function snap(S) {
  const T = S.tags, F = features();
  const bank = (q, off) => {
    let dx = S.x - q.x, dy = S.y - q.y, L = Math.hypot(dx, dy);
    if (L < 1) { dx = S.nx; dy = S.ny; L = 1; }
    const p = { x: q.x + dx / L * off, y: q.y + dy / L * off };
    const ar = toAR(S.side, p.x, p.y, S.ring); putAR(S, ar.a, ar.r);
  };
  if (T.has('river') || T.has('shore')) { const q = nearestIn(F.river, S.cell, S.x, S.y, 1200); if (q) { bank(q, 125); S.by = 'river'; return; } }
  if (T.has('rail') || T.has('arc')) { const q = nearestIn(F.arcs, S.cell, S.x, S.y, 1000); if (q) { bank(q, 95); S.by = 'arc'; return; } }
  if (T.has('pass') || T.has('frontier') || T.has('crossroads')) {
    const p = roadPt(S.side, S.x, S.y);
    if (p && Math.hypot(p.x - S.x, p.y - S.y) < 1100) { bank(p, 150); S.by = 'road'; return; }
  }
  if (T.has('hill')) { const s = summitNear(S.x, S.y, 260, S.cell); const ar = toAR(S.side, s.x, s.y, S.ring); putAR(S, ar.a, ar.r); S.by = 'hill'; return; }
  if (T.has('seam')) { putAR(S, S.a < 0.5 ? A_MIN + 0.02 : A_MAX - 0.02, S.r); S.by = 'seam'; }
}

let SITES = null;
export function buildSites() {
  if (SITES) return SITES;
  const items = allItems(), byKey = new Map(items.map(it => [it.key, it]));
  const cells = new Map();
  for (const it of items) { const c = it.ring + ':' + it.side; if (!cells.has(c)) cells.set(c, []); cells.get(c).push(it); }
  const sites = [];
  for (const [c, list] of cells) {
    const [n, side] = [+c.split(':')[0], c.split(':')[1]];
    // цели: азимут — по месту прототипа, радиус — по году (вне эпохи — к своей кромке, с разбросом,
    // чтобы ровесники не вставали в ряд: SCALE §3 — «± четверть кольца»)
    for (const it of list) {
      const R = it.rec;
      it.ka = R ? geoA(side, R.lat, R.lon) : null;
      it.kr = R ? yearR(n, R.y) : null;
      if (it.kr != null) {
        const [y0, y1] = RING_YEARS[n - 1], j = hs(it.key + ':r');
        it.kr = R.y < y0 ? R_MIN + 0.12 * j : R.y > y1 ? R_MAX - 0.12 * j : Math.max(R_MIN, Math.min(R_MAX, it.kr + (j - 0.5) * 0.1));
      }
      it.cl = R && R.c;
    }
    // у дороги — своё: серии и заставы
    // вторая застава того же вида на дорогу не встаёт (одинаковое — не в один кадр): уходит местом в поле
    const onRoad = new Set();
    const road = list.filter(it => it.road && side !== 'plain').sort((p, q) => (p.nth || 1) - (q.nth || 1)).filter(it => it.sign || !onRoad.has(it.name) && onRoad.add(it.name));
    const rest = list.filter(it => !road.includes(it));
    // соседи по смыслу — одним местом: напарник, один прототип, близкие места на карте;
    // копии одной постройки — разные места (свой осмотр — своё место), только по прямому напарнику
    const par = new Map(rest.map(it => [it, it])), find = x => (par.get(x) === x ? x : (par.set(x, find(par.get(x))), par.get(x)));
    const size = new Map(rest.map(it => [it, it.sign ? [1, 0] : [0, 1]]));
    const names = new Map(rest.map(it => [it, new Set(it.sign ? [] : [it.name])]));
    const join = (p, q, force = false) => {
      const a = find(p), b = find(q);
      if (a === b) return;
      const [sa, ba] = size.get(a), [sb, bb] = size.get(b);
      if (!force && ([...names.get(b)].some(x => names.get(a).has(x)) || ba + bb > 4 || sa + sb > 6)) return;
      par.set(b, a); size.set(a, [sa + sb, ba + bb]); for (const x of names.get(b)) names.get(a).add(x);
    };
    for (const it of rest) {
      const w = it.rec && it.rec.with && byKey.get(it.rec.with);
      if (w && par.has(w)) join(w, it, true);
    }
    for (const it of rest) {
      it.proto = it.rec && it.rec.p && !/вымысел|серия|обобщ/i.test(it.rec.p) ? it.rec.p.toLowerCase().split(/[,(:;«]/)[0].trim() : null;
      it.pt = it.ka != null ? sectorPoint(side, it.ka, ringDepth(n, it.kr ?? 0.5)) : null;
    }
    for (let i = 0; i < rest.length; i++) for (let j = i + 1; j < rest.length; j++) {
      const A = rest[i], B = rest[j];
      if (A.proto && A.proto === B.proto) { join(A, B); continue; }
      if (A.pt && B.pt && Math.hypot(A.pt.x - B.pt.x, A.pt.y - B.pt.y) < 170) join(A, B);
    }
    // без места на карте (обобщение, вымысел) — посёлком своего склада: деревня к деревне, стойбище к стойбищу
    for (const cl of ['village', 'camp', 'town']) {
      const gen = rest.filter(it => it.ka == null && it.cl === cl);
      for (let i = 1; i < gen.length; i++) join(gen[0], gen[i]);
    }
    const groups = new Map();
    for (const it of rest) { const g = find(it); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(it); }
    const mine = [];
    for (const g of groups.values()) {
      const S = { cell: c, ring: n, side, signs: g.filter(it => it.sign), builds: g.filter(it => !it.sign), tags: new Set(), road: false };
      for (const it of g) for (const t of (it.rec && it.rec.t) || []) S.tags.add(t);
      const wa = g.filter(it => it.ka != null), wr = g.filter(it => it.kr != null), wt = it => (it.sign ? 1 : 2);
      const avg = (arr, f) => arr.reduce((s, it) => s + f(it) * wt(it), 0) / arr.reduce((s, it) => s + wt(it), 0);
      S.known = wa.length > 0;
      S.fixR = wr.length > 0;
      putAR(S, S.known ? avg(wa, it => it.ka) : 0.5, S.fixR ? avg(wr, it => it.kr) : 0.26 + 0.48 * hs(g[0].key + ':r'));
      S.alone = g.every(it => !it.cl || it.cl === 'solo') || S.tags.has('isolated');
      mine.push(S);
    }
    // у дороги: каждое — у тропы на своей глубине, по очереди с обеих обочин; близкие по глубине — одно место
    for (const it of road) it.r = it.kr ?? 0.2 + 0.6 * hs(it.key + ':r');
    road.sort((p, q) => p.r - q.r);
    let last = null;
    for (const it of road) {
      const d = ringDepth(n, it.r), p = trailPoint(side, d);
      if (last && Math.abs(d - last.d) < 140 && last.builds.length + last.signs.length < 4) { (it.sign ? last.signs : last.builds).push(it); continue; }
      const S = { cell: c, ring: n, side, signs: it.sign ? [it] : [], builds: it.sign ? [] : [it], tags: new Set((it.rec && it.rec.t) || []), road: true, known: it.ka != null,
        x: p.x, y: p.y, d, a: sectorFrac(side, p.x, p.y), r: it.r, by: 'road', fixed: true };
      mine.push(S); last = S;
    }
    // неопознанное — в самые пустые места клетки (дальше всего от уже стоящих и от дороги); год, если
    // известен, держит радиус
    const known = mine.filter(S => S.known || S.fixed), unknown = mine.filter(S => !S.known && !S.fixed).sort((p, q) => hs(p.signs.concat(p.builds)[0].key) - hs(q.signs.concat(q.builds)[0].key));
    for (const S of unknown) {
      let best = null, bv = -1;
      const rs = S.fixR ? [S.r - 0.1, S.r, S.r + 0.1] : [0.28, 0.5, 0.72];
      for (let a = 0.1; a <= 0.901; a += 0.04) for (const r of rs) {
        const p = sectorPointFast(side, a, ringDepth(n, Math.max(R_MIN, Math.min(R_MAX, r))));
        if (cellAt(p.x, p.y) !== c) continue;
        let m = Math.min(1600, roadDist(side, p.x, p.y) * 1.4);
        for (const o of known) m = Math.min(m, Math.hypot(o.x - p.x, o.y - p.y));
        const v = m + hs(S.cell + a + r) * 30;
        if (v > bv) { bv = v; best = { a, r }; }
      }
      if (best) putAR(S, best.a, best.r);
      known.push(S);
    }
    for (const S of mine) if (!S.fixed) snap(S);
    // места клетки расходятся: не ближе MIN_GAP (одинокие — ALONE_GAP), и не на своей дороге
    for (const S of mine) if (!S.fixed) putAR(S, S.a, S.r, true);
    for (let it = 0; it < 40; it++) {
      let moved = false;
      for (let i = 0; i < mine.length; i++) for (let j = i + 1; j < mine.length; j++) {
        const A = mine[i], B = mine[j];
        const twin = A.builds.some(a => B.builds.some(b => b.name === a.name));
        if (twin) {
          // одинаковые постройки — не в один кадр (рамка 640×360 мира с полями): расходятся вдоль кольца
          // ровно настолько, чтобы выйти из кадра, — каждая остаётся у своего прототипа
          const fx = Math.abs(B.x - A.x), fy = Math.abs(B.y - A.y);
          if (fx >= TWIN_W || fy >= TWIN_H) continue;
          if (A.fixed && B.fixed) continue;
          const len = sectorSpan(side, ringDepth(n, 0.5))[1];
          const short = side === 'south' || side === 'north' ? TWIN_W - fx : side === 'plain' ? Math.min(TWIN_W - fx, TWIN_H - fy) * 1.4 : TWIN_H - fy;
          const da = (short + 20) / len * (A.fixed || B.fixed ? 1 : 0.5), sg = B.a >= A.a ? 1 : -1;
          if (!A.fixed) putAR(A, A.a - sg * da, A.r, true);
          if (!B.fixed) putAR(B, B.a + sg * da, B.r, true);
          moved = true;
          continue;
        }
        const need = (A.alone || B.alone ? ALONE_GAP : MIN_GAP) + 30 * (A.builds.length + B.builds.length) - (A.builds.length || B.builds.length ? 0 : 100);
        let dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
        if (d >= need) continue;
        if (d < 1) { dx = hs(A.cell + i) - 0.5; dy = hs(A.cell + j) - 0.5; d = Math.hypot(dx, dy) || 1; }
        if (A.fixed && B.fixed) continue;
        const k = (need - d) / d * (A.fixed || B.fixed ? 0.5 : 0.25);
        for (const [S, s] of [[A, -1], [B, 1]]) { if (S.fixed) continue; const ar = toAR(side, S.x + s * dx * k, S.y + s * dy * k, n, true); putAR(S, ar.a, ar.r, true); }
        moved = true;
      }
      for (const S of mine) {
        if (S.by === 'road') continue;
        const p = roadPt(side, S.x, S.y);
        if (!p) continue;
        const d = Math.hypot(p.x - S.x, p.y - S.y);
        if (d >= OFF_ROAD) continue;
        let dx = S.x - p.x, dy = S.y - p.y; const L = Math.hypot(dx, dy) || 1;
        if (L < 2) { dx = side === 'south' || side === 'north' ? 1 : 0; dy = 1 - Math.abs(dx); }
        const ar = toAR(side, p.x + dx / L * OFF_ROAD, p.y + dy / L * OFF_ROAD, n, true); putAR(S, ar.a, ar.r, true); moved = true;
      }
      if (!moved) break;
    }
    for (const S of mine) if (!S.fixed) { putAR(S, S.a, S.r); keepIn(S); }
    sites.push(...mine);
  }
  sites.forEach((S, i) => { S.id = i; const m = sectorPoint(S.side, 0.5, ringDepth(S.ring, 0.5)); S.mx = m.x; S.my = m.y; });
  SITES = sites;
  return sites;
}

// ── таблички места: сценой перед постройками (в поле — кучкой вокруг места); у дороги — по обочинам
// табличка целиком в своей клетке: подножие (по нему кольцо пишет штамп) и середина
const inCell = (S, x, gy) => cellAt(x, gy) === S.cell && cellAt(x, gy - 13) === S.cell && cellAt(x - 7, gy) === S.cell && cellAt(x + 7, gy) === S.cell;
export function signSpots() {
  const out = new Map(), F = features(), sites = buildSites();
  const taken = [];
  const clash = (x, gy) => taken.some(t => Math.abs(t.x - x) < 24 && Math.abs(t.gy - gy) < 34);
  const onLine = (S, x, gy) => roadDist(S.side, x, gy) < 34 || !!nearestIn(F.river, S.cell, x, gy, 40);
  for (const S of sites) {
    if (!S.signs.length) continue;
    if (S.road) {
      S.signs.forEach((it, k) => {
        const ns = S.side === 'south' || S.side === 'north';
        let spot = null;
        for (let step = 0; step < 14 && !spot; step++) {
          const d = S.d + (k * 64) + step * 22 * (step % 2 ? 1 : -1);
          const p = trailPoint(S.side, d), verge = (hs(it.key) > 0.5 ? 1 : -1) * (k % 2 ? -1 : 1);
          const x = ns ? p.x + verge * (34 + hs(it.key + 'v') * 18) : p.x, gy = ns ? p.y : p.y - 22 - hs(it.key + 'v') * 16;
          if (inCell(S, x, gy) && !clash(x, gy)) spot = { x: Math.round(x), gy: Math.round(gy) };
        }
        if (!spot) { const p = trailPoint(S.side, S.d); spot = { x: Math.round(p.x + 40), gy: Math.round(p.y) }; }
        taken.push(spot); out.set(it.key, { ...spot, site: S.id });
      });
      continue;
    }
    const cx = S.x, cy = S.y + (S.builds.length ? 30 : 0);
    const cands = [];
    for (const dx of [0, -34, 34, -68, 68, -102, 102, -136, 136, -170, 170]) for (const dy of [0, 26, -26, 52, -52, 78]) cands.push({ dx, dy, s: Math.abs(dx) + Math.abs(dy) * 1.4 + hs(S.id + ':' + dx + ':' + dy) * 6 });
    cands.sort((p, q) => p.s - q.s);
    for (const it of S.signs) {
      let spot = null;
      for (const c of cands) {
        const x = Math.round(cx + c.dx), gy = Math.round(cy + c.dy);
        if (clash(x, gy) || onLine(S, x, gy) || !inCell(S, x, gy)) continue;
        spot = { x, gy }; break;
      }
      // тесно — шире, к середине клетки
      for (let k = 1; !spot && k <= 12; k++) {
        const t = k / 12, x = Math.round(cx + (S.mx - cx) * t), gy = Math.round(cy + (S.my - cy) * t);
        if (!clash(x, gy) && inCell(S, x, gy)) spot = { x, gy };
      }
      if (!spot) spot = { x: Math.round(S.mx), gy: Math.round(S.my) };
      taken.push(spot); out.set(it.key, { ...spot, site: S.id });
    }
  }
  return out;
}
