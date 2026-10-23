// ═══════════════════════════════════════
// КОЛОДЕЦ У ПЛОЩАДИ — «Ведро общего дна» (канон v3.5, src/assets/CONTENT_POOL.md):
// колодец городка, тот самый, куда выходит метро изнанки (билет «до колодца.
// туда.» — world/underside.js). Ворот сам поскрипывает на пол-оборота, когда
// проходишь мимо, — как собака, поднявшая голову; цепь мокрая всегда, хотя
// дождя в мире почти не бывает; ведро приходит снизу тяжёлым, воды в нём нет.
// Покрутишь ворот — в ведре чья-то давняя потеря с биркой канцелярии
// «ВОЗВРАЩЕНО. ВЛАДЕЛЕЦ ВЫБЫЛ». Очередь общая: в порядке потери, не в порядке
// нужды. Ворот и ведро — world/mechanisms.js, цепь — подвес (world/hang.js),
// осмотр — content/looks.js.
// Своё можно отдать (канон): «положи в ведро, опусти; наутро в описи строка
// «принято на дно. очередь общая»». Поднятое ведро ждёт, пока странник рядом;
// второе действие — отдать своё, не глядя; ведро уходит вниз. Строка в описи на
// стойке ворота появляется со следующим утром (сутки — world/sky.js); вышел из
// игры — утро прошло без тебя. До утра отдать второй раз нечего.
// Рисунок: каменный сруб кольцом (свет слева, кромка пеплом справа), на нём
// две стойки под двускатной крышей, между ними ворот, справа ручка.
// ═══════════════════════════════════════
import { well, crankWell, nodWell, dropWell } from './mechanisms.js';
import { hang, tipOf } from './hang.js';
import { looks } from '../content/looks.js';
import { dayIndex } from './sky.js';
import { t as clock } from '../core/time.js';
import { TS } from './disc.js';

const NI = '#0D0B0A', BO = '#D9CFB8', AS = '#8A8D8F', MG = '#3D4A3A', KV = '#C23B2B';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K3 = '#34302a', K4 = '#3a3328';
const BR2 = '#3a2818', L1 = '#c8b89a', S0 = '#474442', S1 = '#5e5e5d', S2 = '#33302e';
const KEY = 'well:town_well';
const q = Math.round;
const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
function hh(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// очередь общая: что поднимается — в порядке потери
export const LOST = [
  'В ведре — ключ от дома, которого нет. На нём бирка канцелярии: «ВОЗВРАЩЕНО. ВЛАДЕЛЕЦ ВЫБЫЛ».',
  'В ведре — варежка на левую руку. На ней бирка канцелярии: «ВОЗВРАЩЕНО. ВЛАДЕЛЕЦ ВЫБЫЛ».',
  'В ведре — оловянный солдатик без ружья. На нём бирка канцелярии: «ВОЗВРАЩЕНО. ВЛАДЕЛЕЦ ВЫБЫЛ».',
];
let queue = 0;                                    // сколько уже поднято
export const OPIS_LINE = 'принято на дно. очередь общая';
let given = 0, logged = 0, pending = -1;          // отдано своего; строк в описи; сутки последнего (ждёт утра; -1 — не ждёт)

// ── рисунок ── сруб: эллипс верха с центром на gy-11 (полуоси 10 и 3), проём
// внутри (7 и 2), стенка высотой 8; цепь и ведро ниже переднего края проёма не
// видно — они в шахте. Неподвижное запекается двумя слоями: дальняя половина
// сруба со стойками, воротом и крышей — и ближняя (венец и стенка); между ними
// живое: цепь, ведро, капля; поверх — ручка ворота
function col(gy, i) {
  const ey = gy - 11, u = (i + 0.5) / 10, e = Math.sqrt(1 - u * u), ui = (i + 0.5) / 7, ei = Math.abs(ui) < 1 ? Math.sqrt(1 - ui * ui) : 0;
  return { yb: q(ey - 3 * e), yf: q(ey + 3 * e), ybt: q(gy - 3 + 3 * e), yib: ei ? q(ey - 2 * ei) : 0, yif: ei ? q(ey + 2 * ei) : 0, ei };
}
function backPart(ctx, x, gy) {
  ctx.globalAlpha = 0.45; R(ctx, x - 10, gy, 21, 1, K0); R(ctx, x + 9, gy - 3, 4, 4, K0); ctx.globalAlpha = 1;   // тень — вправо
  // верх сруба — дальняя половина и проём: за проёмом видна стенка шахты
  for (let i = -10; i < 10; i++) {
    const c = col(gy, i), xx = x + i, top = i === 9 ? AS : (i + 10) % 5 === 0 ? S2 : S1;
    const to = c.ei ? c.yib - 1 : c.yf;
    if (to >= c.yb) R(ctx, xx, c.yb, 1, to - c.yb + 1, top);
    if (c.ei) { R(ctx, xx, c.yib, 1, 1, K2); R(ctx, xx, c.yib + 1, 1, 1, K1); if (c.yif > c.yib + 2) R(ctx, xx, c.yib + 2, 1, c.yif - c.yib - 2, NI); }
  }
  // стойки — на концах сруба
  const py = gy - 33, ph = 23;
  R(ctx, x - 10, py, 1, ph, K4); R(ctx, x - 9, py, 1, ph, BR2); R(ctx, x + 8, py, 1, ph, BR2); R(ctx, x + 9, py, 1, ph, K1);
  // ворот: бревно между стойками, на нём намотана цепь
  R(ctx, x - 8, gy - 27, 16, 1, K4); R(ctx, x - 8, gy - 26, 16, 1, BR2); R(ctx, x - 8, gy - 25, 16, 1, K1);
  for (let k = -3; k < 3; k++) R(ctx, x + k, gy - 26, 1, 1, k & 1 ? S2 : AS);
  // крыша двускатная: конёк, левый скат к свету (тёс полосами), правый в тени, кромка пеплом
  for (let k = 0; k < 5; k++) {
    const y = gy - 38 + k, x0 = x - 1 - 3 * k, x1 = x + 3 * k;
    for (let xx = x0; xx <= x1; xx++) {
      R(ctx, xx, y, 1, 1, k === 4 ? K1 : xx === x1 ? AS : k === 0 ? S1 : xx < x ? ((xx - k) % 3 === 0 ? K4 : S0) : K3);
    }
  }
}
// передний край сруба и стенка: камень рядами, швы вразбежку, мох понизу
function frontPart(ctx, x, gy) {
  for (let i = -10; i < 10; i++) {
    const c = col(gy, i), xx = x + i;
    if (c.ei) R(ctx, xx, c.yif, 1, c.yf - c.yif + 1, i === 9 ? AS : S1);
    for (let y = c.yf + 1; y <= c.ybt; y++) {
      const v = c.ybt - y, crs = (v / 3) | 0;
      let k = i <= -9 ? S1 : i >= 7 ? S2 : S0;
      if (i === 9) k = AS;
      if (y === c.yf + 1) k = S2;                                    // тень под венцом
      else if (v % 3 === 2 || (i + 10 + (crs & 1) * 2) % 5 === 0) k = K1;
      else if (v < 2 && hh(i, v, 31) < 0.35) k = MG;
      R(ctx, xx, y, 1, 1, k);
    }
  }
}
// запечённый слой: холст по рамке рисунка от (x, gy); нет холста (тесты) — рисует прямо
const BX = -14, BY = -39, BW = 28, BH = 42, LAYERS = {};
function layer(ctx, key, x, gy, fn) {
  let c = LAYERS[key];
  if (c === undefined) {
    c = typeof document !== 'undefined' && document.createElement ? document.createElement('canvas') : null;
    if (c && typeof c.getContext === 'function') { c.width = BW; c.height = BH; fn(c.getContext('2d'), -BX, -BY); }
    else c = null;
    LAYERS[key] = c;
  }
  if (c) ctx.drawImage(c, x + BX, gy + BY); else fn(ctx, x, gy);
}
function drawTownWell(ctx, loc, t) {
  const x = loc.x + loc.w / 2, gy = loc.y + loc.h, clip = gy - 9;   // clip — передний край проёма
  const m = well(KEY, true);
  layer(ctx, 'back', x, gy, backPart);
  const mk = ((q(m.crank * 1.6) % 16) + 16) % 16;                    // метка на вороте: барабан крутится
  if (mk < 5 || mk > 10) R(ctx, x - 8 + mk, gy - 26, 1, 1, K0);
  // цепь — до ведра; мокрая: звенья блестят, по ней сбегает капля
  const top = gy - 24, len = 1 + m.d * 30;
  const b = hang('wellb:town_well', x + 0.5, top, len, { sail: 0.008, damp: 0.99, gy, r: 2 });
  b.len = len;
  if (m.kick) { tipOf(b).x += 1; m.kick = false; }
  const tp = tipOf(b), bx = q(tp.x), by = q(tp.y), n = Math.max(1, by - top), drop = top + ((t >> 2) % 20);
  for (let i = 0; i < n; i++) {
    const cy = top + i;
    if (cy >= clip) break;
    R(ctx, q(x + (bx - x) * i / n), cy, 1, 1, cy === drop ? BO : cy & 1 ? S2 : AS);
  }
  // ведро: дужка, обручи, клёпки; наверху — бирка канцелярии на нитке; с днища капает
  const B = [[0, 0, 1, AS], [-1, 1, 1, AS], [1, 1, 1, AS], [-2, 2, 5, S1], [-2, 3, 5, BR2], [-2, 4, 5, BR2], [-2, 5, 5, BR2], [-2, 6, 4, S1]];
  for (const [dx, dy, w, c] of B) if (by + dy < clip) R(ctx, bx + dx, by + dy, w, 1, c);
  for (let dy = 3; dy < 6; dy++) if (by + dy < clip) { R(ctx, bx - 2, by + dy, 1, 1, K4); R(ctx, bx + 2, by + dy, 1, 1, K1); }
  if (m.st === 'top' && by + 6 < clip) {
    R(ctx, bx - 3, by + 2, 1, 1, KV); R(ctx, bx - 4, by + 3, 2, 3, L1); R(ctx, bx - 4, by + 4, 1, 1, K2);
    const f = t % 150;
    if (f < 24) { const dy = q(f * f * 0.03); if (by + 8 + dy < clip) R(ctx, bx, by + 8 + dy, 1, 1, BO); }
  }
  layer(ctx, 'front', x, gy, frontPart);
  if (logged) { R(ctx, x + 7, gy - 20, 4, 5, L1); R(ctx, x + 7, gy - 20, 4, 1, BO); R(ctx, x + 8, gy - 18, 2, 1, S2); R(ctx, x + 8, gy - 16, 2, 1, S2); R(ctx, x + 9, gy - 20, 1, 1, K1); }   // опись канцелярии на стойке
  // ручка ворота: ось через правую стойку, колено ходит по кругу
  const ax = x + 10, ay = gy - 26, ex = ax + 1 + q(Math.cos(m.crank)), eyy = ay + q(Math.sin(m.crank) * 3);
  R(ctx, ax, ay, 1, 1, K1);
  const steps = Math.max(1, Math.abs(eyy - ay));
  for (let s = 0; s <= steps; s++) R(ctx, q(ax + (ex - ax) * s / steps), q(ay + (eyy - ay) * s / steps), 1, 1, K4);
  R(ctx, ex, eyy, 2, 1, S1);
}

// ── место ── у круга костра, восточный край площади: в стороне от троп
let loc = null;
export function buildTownWell(locations) {
  const fire = locations.find(l => l.id === 'campfire');
  if (!fire) return;
  const x = Math.round(fire.x + 168 * TS), gy = Math.round(fire.y + fire.h + 30 * TS);   // площадь растянута с городком
  loc = {
    id: 'town_well', name: 'Колодец у площади', zone: 'settlement',
    x, y: gy - 36, w: 24, h: 36, solidBox: { x: x + 2, y: gy - 7, w: 20, h: 7 },
    drawSelf: drawTownWell, useAction: 'town_well_crank',
  };
  let base = looks.town_well;                      // осмотр переписывают из словаря (locations.attachContent) — опись дописывается к нему
  Object.defineProperty(loc, 'look', { get: () => base + opisText(), set: v => { base = v; }, enumerable: true, configurable: true });
  Object.defineProperty(loc, 'useLabel', { get: () => (well(KEY, true).st === 'top' ? '<i>↓</i>ОПУСТИТЬ ВЕДРО' : '<i>↻</i>КРУТИТЬ ВОРОТ'), enumerable: true, configurable: true });
  loc.altNow = () => (canGive() ? { key: 'town_well_give', label: '<i>↓</i>ОТДАТЬ СВОЁ' } : null);
  locations.push(loc);
}
const lines = n => (n % 10 === 1 && n % 100 !== 11 ? 'строка' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'строки' : 'строк');
function opisText() {
  if (!logged) return '';
  return logged === 1 ? `\n\nНа стойке ворота — опись канцелярии, в ней одна строка: «${OPIS_LINE}».`
    : `\n\nНа стойке ворота — опись канцелярии: ${logged} ${lines(logged)}, все одинаковые: «${OPIS_LINE}».`;
}
// отдать своё: только в поднятое ведро и не чаще, чем приходит утро
export const canGive = () => well(KEY, true).st === 'top' && pending < 0;
export function giveTownWell() {
  if (!canGive()) return false;
  given++; pending = dayIndex(clock);
  dropWell(KEY);
  return true;
}
export const townWell = () => loc;
// где встать у колодца — точка героя (как у всякого места: под ним)
export const wellAccess = () => (loc ? { x: loc.x + loc.w / 2 - 6, y: loc.y + loc.h + 5 } : null);

// крутишь ворот: тяжёлое ведро приходит наверх — в нём следующая потеря из очереди
export function crankTownWell(say) {
  if (dropWell(KEY)) return true;                  // ведро наверху — ворот отпускает его вниз
  well(KEY, true);
  return crankWell(KEY, () => { say(LOST[queue % LOST.length]); queue++; });
}
// прошёл мимо — ворот поскрипел на пол-оборота; не чаще раза в десять секунд
let near = false, quiet = 0;
export function stepTownWell(p) {
  if (!loc) return;
  if (quiet > 0) quiet--;
  const d = Math.hypot(p.x + 6 - (loc.x + loc.w / 2), p.y + 23 - (loc.y + loc.h));
  const was = near;
  near = d < 46;
  if (near && !was && p.moving && !quiet) { well(KEY, true); if (nodWell(KEY)) quiet = 600; }
  well(KEY, true).hold = near;                     // поднятое ведро ждёт, пока ты рядом
  if (pending >= 0 && dayIndex(clock) > pending) { logged = given; pending = -1; }   // наутро — строка в описи
}
// кто-то вышел из колодца (метро изнанки): ворот поскрипел, ведро качнулось
export function stirTownWell() {
  const m = well(KEY, true);
  nodWell(KEY);
  m.kick = true;
  quiet = 600;
}
export const saveTownWell = () => ({ q: queue, g: given, l: logged, p: pending >= 0 });
export function loadTownWell(d) {
  if (!d) return;
  if (Number.isFinite(d.q)) queue = Math.max(0, d.q | 0);
  given = Number.isFinite(d.g) ? Math.max(0, d.g | 0) : 0;
  logged = Number.isFinite(d.l) ? Math.min(given, Math.max(0, d.l | 0)) : 0;
  if (d.p) logged = given;                         // отдал и вышел — утро прошло без тебя
  pending = -1;
}
