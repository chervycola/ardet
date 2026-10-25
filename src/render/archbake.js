// ═══════════════════════════════════════
// ЗАПЕКАНИЕ ПОСТРОЕК КОЛЕЦ — неподвижное рисуется один раз в свой холст и
// дальше ложится картинкой (по образцу bake в canon.js и things.js); живое
// рисуется, как прежде, каждый кадр. Что живое, узнаётся само: рисунок
// прогоняется вхолостую при разных t — разошлись записи, тронут подвес
// (world/hang.js) или механизм (world/mechanisms.js) — живое. Тот же вид в
// другой точке мира берёт тот же холст, если рисунок от места не зависит.
// Запекается не больше трёх за кадр (до запекания — рисуется живым), холстов
// держится сотня — давние уходят. Нет холста (тесты) — рисуется живым.
// weave/ARCH_PLAN.md, этап 1.
// ═══════════════════════════════════════
import { hangTouches } from '../world/hang.js';
import { mechTouches } from '../world/mechanisms.js';

const TS = [0, 37, 100, 211, 997];               // мгновения пробы: мигающее и бегущее разойдётся
const SHIFT = 1000;                              // проба на другом месте: целый сдвиг
const PAD = 2;                                   // поле холста (контракт — всё внутри w×h над землёй)
const BAKE_PER_FRAME = 3;
const MS_PER_FRAME = 4;                          // и не дольше этого за кадр: набор материалов печётся миллисекундами
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const MAX = 96;
const KIND = new Map();                          // draw → { live, shared }
const BAKED = new Map();                         // ключ → { c, cx, gy } | null (холста нет)
const IDS = new WeakMap();
let nid = 0, budget = BAKE_PER_FRAME, spent = 0, frameT = null;
const idOf = f => { let n = IDS.get(f); if (n === undefined) IDS.set(f, n = ++nid); return n; };

// запись рисунка: каждый вызов и каждая установка свойства — строкой; координаты
// fillRect/drawImage/translate — со сдвигом (dx, dy), чтобы сравнить два места
function record(draw, x, gy, t, dx = 0, dy = 0) {
  const log = [], st = {};
  const nx = v => typeof v === 'number' ? v - dx : v, ny = v => typeof v === 'number' ? v - dy : v;
  const val = v => (v && typeof v === 'object') ? 'obj' : v;
  const NORM = {
    fillRect: a => [nx(a[0]), ny(a[1]), a[2], a[3]], clearRect: a => [nx(a[0]), ny(a[1]), a[2], a[3]],
    strokeRect: a => [nx(a[0]), ny(a[1]), a[2], a[3]], rect: a => [nx(a[0]), ny(a[1]), a[2], a[3]],
    translate: a => [nx(a[0]), ny(a[1])], moveTo: a => [nx(a[0]), ny(a[1])], lineTo: a => [nx(a[0]), ny(a[1])],
    drawImage: a => a.length >= 9 ? [val(a[0]), a[1], a[2], a[3], a[4], nx(a[5]), ny(a[6]), a[7], a[8]] : [val(a[0]), nx(a[1]), ny(a[2]), ...a.slice(3)],
  };
  const ctx = new Proxy(st, {
    get(o, k) {
      if (k in o) return o[k];
      if (k === 'measureText') return () => ({ width: 0 });
      if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (k === 'getImageData') return (a, b, w, h) => ({ data: new Uint8ClampedArray(Math.max(0, w * h * 4)) });
      if (k === 'canvas') return { width: 0, height: 0 };
      return (...a) => { log.push(String(k) + '(' + (NORM[k] ? NORM[k](a) : a.map(val)).join(',') + ')'); };
    },
    set(o, k, v) { o[k] = v; log.push(String(k) + '=' + val(v)); return true; },
  });
  const h0 = hangTouches(), m0 = mechTouches();
  try { draw(ctx, x, gy, t); } catch (e) { log.push('error'); }
  return { log: log.join(';'), touched: hangTouches() !== h0 || mechTouches() !== m0 };
}

// живое ли и одинаков ли рисунок на разных местах. Рисунок набора (kit.js) объявляет себя
// сам — draw.static: неподвижен и от места не зависит; пробу (тысячи вызовов) пропускаем
export function kindOf(draw, x, gy) {
  let k = KIND.get(draw);
  if (k) return k;
  if (draw.static === true) { KIND.set(draw, k = { live: false, shared: true }); return k; }
  KIND.set(draw, k = probeKind(draw, x, gy));
  return k;
}
// проба без доверия к draw.static (для тестов: объявленное неподвижным и правда неподвижно)
export function probeKind(draw, x, gy) {
  let live = false, base = null;
  for (const t of TS) {
    const r = record(draw, x, gy, t);
    if (r.touched || (base !== null && r.log !== base)) { live = true; break; }
    base = r.log;
  }
  const shared = !live && record(draw, x + SHIFT, gy + SHIFT, 0, SHIFT, SHIFT).log === base;
  return { live, shared };
}

function bake(loc) {
  const doc = typeof document !== 'undefined' ? document : null;
  const c = doc && doc.createElement ? doc.createElement('canvas') : null;
  const g = c && c.getContext ? c.getContext('2d') : null;
  if (!g) return null;
  const W = Math.ceil(loc.w) + 2 * PAD + 1, H = Math.ceil(loc.h) + PAD + 2;
  c.width = W; c.height = H;
  const cx = W >> 1, gy = H - 2;                         // где в холсте x и земля
  g.imageSmoothingEnabled = false;
  g.translate(cx - Math.round(loc.archX), gy - Math.round(loc.archGy));   // рисуем на настоящем месте — сдвигом холста
  loc.archDraw(g, loc.archX, loc.archGy, 0);
  return { c, cx, gy };
}

// нарисовать постройку: запечённой — если неподвижна и холст есть, иначе живой
export function drawArch(ctx, loc, t) {
  if (t !== frameT) { frameT = t; budget = BAKE_PER_FRAME; spent = 0; }
  const draw = loc.archDraw;
  let k = KIND.get(draw);
  if (!k) {
    if (budget <= 0 || spent > MS_PER_FRAME) { draw(ctx, loc.archX, loc.archGy, t); return false; }
    budget--;
    const t0 = now();
    k = kindOf(draw, loc.archX, loc.archGy);
    spent += now() - t0;
  }
  if (k.live) { draw(ctx, loc.archX, loc.archGy, t); return false; }
  // общий холст — на вид, размер и дробную долю места (округление в рисунке); свой — на постройку
  const key = k.shared ? `${idOf(draw)}|${loc.w}|${loc.h}|${loc.archX % 1}|${loc.archGy % 1}` : loc;
  let b = BAKED.get(key);
  if (b === undefined) {
    if (budget <= 0 || spent > MS_PER_FRAME) { draw(ctx, loc.archX, loc.archGy, t); return false; }
    budget--;
    const t0 = now();
    b = bake(loc);
    spent += now() - t0;
    BAKED.set(key, b);
    if (BAKED.size > MAX) BAKED.delete(BAKED.keys().next().value);
  } else { BAKED.delete(key); BAKED.set(key, b); }      // освежить
  if (!b) { draw(ctx, loc.archX, loc.archGy, t); return false; }
  ctx.drawImage(b.c, Math.round(loc.archX) - b.cx, Math.round(loc.archGy) - b.gy);
  return true;
}

export const _bakeStats = () => ({ kinds: KIND.size, live: [...KIND.values()].filter(k => k.live).length, baked: BAKED.size });
export function _resetBake() { KIND.clear(); BAKED.clear(); frameT = null; budget = BAKE_PER_FRAME; spent = 0; }
