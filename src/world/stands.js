// ═══════════════════════════════════════
// СТОЯНКА НА ДВОИХ (weave/DEPTH_GAMES_2026-11-16.md, механика 6; с правкой суда).
// За кольцом огня, где лента тянет к падению, след двух видов:
//  · простоял до покоя и шагнул назад — две вмятины от подошв. Кладётся только там,
//    где лента правда тянула (распад за стоянку ≥ 50), и только если шаг назад —
//    после покоя (calmOf до половины). Встал в вмятину так же — её срок заново;
//    никто не встал — заносит. Счёта шагов и стояний нет.
//  · ушёл вперёд до конца (упал) — цепочка: обрывается раньше края, где растр съел
//    след (60–150 точек пути до падения). Тем же пером и с тем же сроком.
//  · вмятина — окно в растре распада шириной в подошвы (как кадр позёмки:
//    brainrot.js setClearings). Видна, где нужна; это же и плата: видно дальше.
//  · в вмятине лента тянет стоящего, как стоящего спиной к краю (feedPull.js);
//    покой (brainrot.js calmOf) прежний.
//  · чем дальше, тем срок короче: 30 суток у ближней кромки натянутой ленты (там, где
//    распад впервые доходит до 50, — с рельефом это до 0,63 без него), полтора — к 0,9;
//    глубже 0,9 свободно не устоять — там не кладётся и не рисуется.
//  · у столба горизонта вмятина впереди даёт черте один срок сверху (beyond.js HOR_GONE).
// Без сети — свои прошлые заходы (сохранение); с сетью — и чужие: net.js кладёт их
// сюда (putNetStands), своё уходит через setStandNet (база — server/stands.sql).
// ═══════════════════════════════════════
import { TOWN, RINGS_D, FIRE_W, EDGE_BAND, warpedDist } from './disc.js';
import { outward } from './feedPull.js';

const OUTER = RINGS_D + FIRE_W, BAND = EDGE_BAND - 80, DAY = 86400e3;
export const PULLED = 50, CALM = 0.5, DEEP = 0.9;      // распад «правда тянула»; покой; глубже — не держит
export const IN_R = 8, BACK = 6, LOOK_W = 160;         // стоишь в вмятине; шаг назад; столб видит полосу впереди
export const MERGE = { dent: 16, chain: 40 }, CAP = { dent: 3, chain: 2 }, CELL = 320;   // ближе — та же; на отрезок
export const STRIDE = 9, CUT0 = 60, CUT1 = 150, PRINTS = 12;   // шаг следа; сколько съел растр; отпечатков
export const TERM0 = 30 * DAY, TERM1 = 1.5 * DAY;
// срок держит 30 суток до NEAR (без рельефа): ближайшая стоянка, где распад впервые 50
// (глубина с рельефом 0,55; рельеф ±0,07, ноги и макушка ±0,02), — везде месяц (ревью 17.11)
export const NEAR = 0.63, FAR = 0.9;
export const FALL_HALVES = true;                       // предложение суда: падение вдвое короче своим на той стороне
const MINE_MAX = 24;

// глубина за огнём с рельефом (как edges.js), по ногам; не за огнём — -1
export function depthAt(x, y) { const d = warpedDist(x, y); return d <= OUTER ? -1 : Math.min(1, (d - OUTER) / BAND); }
// глубина без рельефа — как в базе (stand_depth): срок у клиента и базы — одно число
export function rectDepth(x, y) {
  return (Math.hypot(Math.max(0, TOWN.x0 - x, x - TOWN.x1), Math.max(0, TOWN.y0 - y, y - TOWN.y1)) - OUTER) / BAND;
}
export const termOf = (x, y) => TERM0 * Math.pow(TERM1 / TERM0, Math.min(1, Math.max(0, (rectDepth(x, y) - NEAR) / (FAR - NEAR))));
// сколько не занесло 0..1: заносит последнюю четверть срока — вмятины и цепочки одинаково
export const keptOf = (s, now = Date.now()) => Math.max(0, Math.min(1, (s.exp - now) / (0.25 * termOf(s.x, s.y))));
// сторона края — как edges.js: по наибольшему вылету за городок
export const sideOf = (x, y) => { const v = [y - TOWN.y1, x - TOWN.x1, TOWN.y0 - y, TOWN.x0 - x]; return 'SENW'[v.indexOf(Math.max(...v))]; };

export const stands = { mine: [], net: new Map(), st: null, trail: [] };
let netOut = null;                                     // { leave(s), fall(x, y) } — сеть, если есть
export function setStandNet(o) { netOut = o; }

const near = (a, x, y, r) => (a.x - x) ** 2 + (a.y - y) ** 2 <= r * r;
const shown = s => s.kind !== 'dent' || depthAt(s.x, s.y) <= DEEP;
// что лежит в рамке: из базы и свои (своя рядом с той же из базы — одна)
export function standsIn(x0, y0, x1, y1, now = Date.now()) {
  const ok = s => s.exp > now && s.x > x0 && s.x < x1 && s.y > y0 && s.y < y1 && shown(s);
  const out = [...stands.net.values()].filter(ok), n = out.length;
  for (const s of stands.mine) if (ok(s) && !out.slice(0, n).some(o => o.kind === s.kind && near(o, s.x, s.y, MERGE[s.kind]))) out.push(s);
  return out;
}
export function dentAt(x, y, r = IN_R, now = Date.now()) {
  return standsIn(x - r, y - r, x + r, y + r, now).find(s => s.kind === 'dent' && near(s, x, y, r)) || null;
}
// стоит в вмятине — для ленты он спиной к краю (одна из четырёх сторон, против «наружу»); нет — null
export function standBack(x, y, now) {
  if (!dentAt(x, y, IN_R, now)) return null;
  const [ux, uy] = outward(x, y);
  return Math.abs(ux) > Math.abs(uy) ? (ux > 0 ? 'W' : 'E') : (uy > 0 ? 'N' : 'S');
}

// оставить своё: рядом своя или из базы — продлить (срок по месту той, в которую встал), иначе положить,
// если на отрезке не полно. В базу — всё равно: база решает за всех. Встал в чужую — у себя её
// копия (own: false): своей она от этого не стала, падение её не трогает
function leave(kind, x, y, path, now) {
  const hit = s => s.kind === kind && s.exp > now && near(s, x, y, MERGE[kind]);
  const renew = s => { s.exp = Math.max(s.exp, now + termOf(s.x, s.y)); };
  const n = [...stands.net.values()].find(hit), m = stands.mine.find(hit);
  if (n) renew(n);
  if (m) renew(m);
  else {
    const at = n || { x, y, path }, cell = s => s.kind === kind && s.exp > now && Math.floor(s.x / CELL) === Math.floor(at.x / CELL) && Math.floor(s.y / CELL) === Math.floor(at.y / CELL);
    if (stands.mine.filter(cell).length < CAP[kind]) stands.mine.push({ kind, x: at.x, y: at.y, path: at.path || null, exp: now + termOf(at.x, at.y), own: !n });
  }
  stands.mine = stands.mine.filter(s => s.exp > now).sort((a, b) => b.exp - a.exp).slice(0, MINE_MAX);
  if (netOut) netOut.leave({ kind, x, y, path });
  return true;
}

// шаг: ноги (fx, fy); o — { active, still, moving, level, calm, now }. active — за изгородью, наверху,
// не падает, не в петле СКРОЛЛ; moving — ещё идёт своим ходом (скольжение по льду с разгона — ход,
// снос лентой — нет). true — легло новое или продлено (main сохранит).
// Стоянка — там, где встал (докатился и лента одна понесла): x0, y0. Пока покой не набрался,
// лента сносит и из вмятины; продлевается та, в которую встал, а не та, куда снесло (ревью 17.11)
export function stepStands(fx, fy, o) {
  const now = o.now ?? Date.now();
  if (!(o.active && depthAt(fx, fy) > 0)) { stands.st = null; stands.trail.length = 0; return false; }
  // свой след за огнём — через STRIDE; прыжок — заново
  const T = stands.trail, L = T[T.length - 1], dl = L ? Math.hypot(fx - L[0], fy - L[1]) : Infinity;
  if (L && dl > 40) T.length = 0;
  if (!T.length || dl >= STRIDE) { T.push([Math.round(fx), Math.round(fy)]); if (T.length > 48) T.shift(); }
  let st = stands.st;
  // стоит: лента ещё несёт, пока покой не набрался. Шагнул и отпустил, а лёд докатывает —
  // это ещё шаг: меряем до конца хода (ревью 17.11: тап назад на льду терял стоянку)
  if (o.still && !(st && st.going && o.moving)) {
    if (!st || st.going) st = stands.st = { x: fx, y: fy, x0: fx, y0: fy, rest: false, peak: 0, calm: false, going: false };
    if (!st.rest) { st.x0 = fx; st.y0 = fy; st.rest = !o.moving; }   // докатился — тут и встал
    st.x = fx; st.y = fy; st.peak = Math.max(st.peak, o.level || 0);
    if ((o.calm || 0) >= CALM) st.calm = true;
    return false;
  }
  if (!st) return false;
  st.going = true;
  const dx = fx - st.x, dy = fy - st.y, l = Math.hypot(dx, dy);
  if (l < BACK) return false;                       // ещё не ясно, куда шагнул
  stands.st = null;
  if (!st.calm || st.peak < PULLED || depthAt(st.x0, st.y0) > DEEP) return false;
  const [ux, uy] = outward(st.x, st.y);
  if ((dx * ux + dy * uy) / l > -0.5) return false; // вперёд или вбок — не стоянка
  return leave('dent', Math.round(st.x0), Math.round(st.y0), null, now);
}

// упал за огнём: цепочка по своему следу; последние CUT0–CUT1 точек пути съел растр
export function onStandFall(fx, fy, rnd = Math.random, now = Date.now()) {
  const T = stands.trail.slice();
  stands.trail.length = 0; stands.st = null;
  if (FALL_HALVES) {
    const side = sideOf(fx, fy);
    for (const s of stands.mine) if (s.own !== false && s.exp > now && sideOf(s.x, s.y) === side) s.exp = now + (s.exp - now) / 2;
    if (netOut) netOut.fall(Math.round(fx), Math.round(fy));
  }
  const cut = CUT0 + rnd() * (CUT1 - CUT0);
  let i = T.length - 1, acc = i >= 0 ? Math.hypot(fx - T[i][0], fy - T[i][1]) : 0;
  while (i > 0 && acc < cut) { acc += Math.hypot(T[i][0] - T[i - 1][0], T[i][1] - T[i - 1][1]); i--; }
  const keep = acc >= cut ? T.slice(Math.max(0, i - PRINTS + 1), i + 1) : [];
  if (keep.length < 4) return false;
  const [x, y] = keep[keep.length - 1], path = [];
  for (let j = keep.length - 2; j >= 0; j--) path.push(keep[j][0] - keep[j + 1][0], keep[j][1] - keep[j + 1][1]);
  return leave('chain', x, y, path, now);
}

// одно перо: подошвы 3×2 в точках мира. Вмятина — две рядом, под сапогами стоящего
// (sprites/wardrobe.js: x+3..5 и x+8..10); цепочка — по одной, левая-правая поперёк хода,
// у обрыва бледнее (a): растр съедает с конца
export function soles(s) {
  if (s.kind === 'dent') return [{ x: s.x - 3, y: s.y - 1, w: 3, h: 2, a: 1 }, { x: s.x + 2, y: s.y - 1, w: 3, h: 2, a: 1 }];
  const out = [], P = s.path || [];
  let x = s.x, y = s.y;
  for (let i = 0; i <= P.length; i += 2) {
    const dx = P[i] ?? P[i - 2] ?? 0, dy = P[i + 1] ?? P[i - 1] ?? 1, l = Math.hypot(dx, dy) || 1, side = (i / 2) % 2 ? 2 : -2;
    out.push({ x: Math.round(x - dy / l * side) - 1, y: Math.round(y + dx / l * side) - 1, w: 3, h: 2, a: Math.min(1, (i / 2 + 1) / 4) });
    if (i < P.length) { x += P[i]; y += P[i + 1]; }
  }
  return out;
}
// окна в растре (точки кадра): вмятина — в ширину подошв; заносит — окно сжимается; цепочка окна не даёт
export function standClearings(camX, camY, vw, vh, now = Date.now()) {
  const out = [];
  for (const s of standsIn(camX - 8, camY - 8, camX + vw + 8, camY + vh + 8, now)) {
    if (s.kind !== 'dent') continue;
    const k = keptOf(s, now), w = Math.round(10 * k), h = Math.round(4 * k);
    if (w >= 2 && h >= 1) out.push({ x: Math.round(s.x + 1 - w / 2 - camX), y: Math.round(s.y - h / 2 - camY), w, h });
  }
  return out;
}
// база ответила, чья стоянка (mine — положил ли её сам): копия у себя — так же. Встал в свою,
// а копия истекла, — снова своя; встал в чужую, о которой не знал, — чужая (ревью 17.11)
export function markOwn(r) {
  if (!r || typeof r.mine !== 'boolean' || !MERGE[r.kind]) return;
  for (const s of stands.mine) if (s.kind === r.kind && near(s, r.x, r.y, MERGE[r.kind])) s.own = r.mine;
}
// рамка подгрузки из базы вокруг (x, y): r во все стороны и ещё AHEAD наружу — столб у 0,3
// смотрит до 0,9 (≈ 700 точек вперёд), а подгрузка бывает и за 350 точек до столба (ревью 17.11)
export const AHEAD = 500;
export function standsBox(x, y, r) {
  const [ux, uy] = outward(x, y);
  return { x0: Math.round(x - r + Math.min(0, ux * AHEAD)), x1: Math.round(x + r + Math.max(0, ux * AHEAD)),
    y0: Math.round(y - r + Math.min(0, uy * AHEAD)), y1: Math.round(y + r + Math.max(0, uy * AHEAD)) };
}
// у столба: живая вмятина впереди, в полосе взгляда — второй стоял дальше и убыл
export function dentAhead(x, y, now = Date.now()) {
  const [ux, uy] = outward(x, y);
  return standsIn(x - 1200, y - 1200, x + 1200, y + 1200, now)
    .some(s => s.kind === 'dent' && (s.x - x) * ux + (s.y - y) * uy > IN_R && Math.abs((s.x - x) * uy - (s.y - y) * ux) <= LOOK_W);
}

// из базы: положить пришедшие; далёкие — забыть (вернёшься — подгрузятся)
export function putNetStands(list, me = null, far = 1400) {
  if (me) for (const [id, s] of stands.net) if (Math.abs(s.x - me.x) > far || Math.abs(s.y - me.y) > far) stands.net.delete(id);
  for (const s of list || []) if (s && s.id != null && Number.isFinite(s.x) && Number.isFinite(s.y) && Number.isFinite(s.exp) && MERGE[s.kind])
    stands.net.set(s.id, { id: s.id, kind: s.kind, x: s.x, y: s.y, exp: s.exp, path: Array.isArray(s.path) ? s.path : null });
}
// сохранение: свои и живые
export function saveStands(now = Date.now()) {
  return stands.mine.filter(s => s.exp > now).map(s => ({ k: s.kind === 'chain' ? 'c' : 'd', x: s.x, y: s.y, e: s.exp, ...(s.path ? { p: s.path } : {}), ...(s.own === false ? { n: 1 } : {}) }));
}
export function loadStands(list, now = Date.now()) {
  stands.mine = (Array.isArray(list) ? list : []).filter(q => q && Number.isFinite(q.x) && Number.isFinite(q.y) && Number.isFinite(q.e) && q.e > now)
    .map(q => ({ kind: q.k === 'c' ? 'chain' : 'dent', x: q.x, y: q.y, exp: q.e, path: q.k === 'c' && Array.isArray(q.p) ? q.p.filter(Number.isFinite) : null, own: q.n !== 1 }))
    .slice(0, MINE_MAX);
}
export function _resetStands() { stands.mine = []; stands.net.clear(); stands.st = null; stands.trail = []; netOut = null; }
