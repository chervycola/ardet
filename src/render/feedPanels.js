// ═══════════════════════════════════════
// ПОЛОСЫ ЛЕНТЫ — на глубоком распаде кадр делится на вертикальные полосы
// 9:16, и в соседних идёт тот же мир, только с задержкой: две секунды,
// четыре, шесть, восемь. Камера держит странника посередине — поэтому в
// ленте он видит себя, того, кем был только что. Середина остаётся живой.
// Полосы прокручиваются, каждая сама по себе, как лента; при «меньше
// движения» стоят. Без вспышек: полоса входит плавно, раз и насовсем.
// Запись — середина кадра (фон, мир, свет, сложение) раз в 12 кадров, пока распад есть.
// Лента ложится поверх рвущейся реальности, но под растр: распад рвёт мир,
// а лента гладкая — и растр одинаково ест обоих.
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { scaler } from './scaler.js';
import { layers } from './layers.js';
import { reducedMotion } from '../core/prefs.js';

export const PANEL_FROM = 0.55;          // доля распада, с которой лента делит кадр
const REC_FROM = 0.3;                    // писать прошлое начинаем раньше, чтобы было что показать
const EVERY = 12;                        // кадр записи раз в 12 (5 в секунду)
const KEEP = 44;                         // ≈ 8,8 секунды прошлого
const GAP = 3;                           // шов между «постами» прокрутки
const NIGHT = '#0D0B0A';
// полоса: s — сколько ширин от середины; delay — секунд назад; at — с какой доли распада
export const SLOTS = [
  { s: 1, delay: 2, at: 0.55 },
  { s: -1, delay: 4, at: 0.65 },
  { s: 2, delay: 8, at: 0.78 },
  { s: -2, delay: 6, at: 0.78 },
];

// ширина полосы: 9:16 от высоты кадра, но на узком экране — не шире половины
export function panelWidth(vw, vh) {
  return Math.max(24, Math.round(Math.min(vh * 9 / 16, vw / 2.2)));
}

// раскладка полос для доли распада k: где каждая лежит на экране и какой частью записи
export function layout(k, vw, vh) {
  const pw = panelWidth(vw, vh), cx0 = Math.floor((vw - pw) / 2), out = [];
  for (const sl of SLOTS) {
    const alpha = Math.max(0, Math.min(1, (k - sl.at) / 0.08));
    if (alpha <= 0) continue;
    const x = cx0 + sl.s * pw, x0 = Math.max(0, x), x1 = Math.min(vw, x + pw);
    if (x1 - x0 < 4) continue;
    out.push({ s: sl.s, delay: sl.delay, x: x0, w: x1 - x0, src: x0 - x, alpha });
  }
  return { pw, cx0, panels: out };
}

// какую запись показать: последнюю, что не моложе задержки; нет такой — самую старую
export function pickIndex(frames, now, delay) {
  if (!frames.length) return -1;
  const want = now - delay * 60;
  let best = 0;
  for (let i = 0; i < frames.length; i++) if (frames[i] <= want) best = i;
  return best;
}

// ── запись прошлого ──
let hist = [];                           // { c, f } от старых к новым
let pool = [];
let lastRec = -1e9;                      // кадр последней записи (по времени, не по остатку: рендер бывает реже)
let scroll = 0, lastT = -1;              // прокрутка копится по шагам — смена скорости не дёргает ленту
let stills = {};                         // «меньше движения»: по полосе — один застывший кадр
export function reset() { pool = pool.concat(hist.map(h => h.c)); hist = []; lastRec = -1e9; scroll = 0; lastT = -1; stills = {}; }
// прошлое старше записи не показываем: «две секунды назад» не должны быть минутами
function dropStale() { while (hist.length && t - hist[0].f > (KEEP + 1) * EVERY) pool.push(hist.shift().c); }
export function historyLength() { return hist.length; }

function snap(pw, cx0, vh) {
  const bg = layers.canvas('bg'), world = layers.canvas('world'), light = layers.canvas('light'), fx = layers.canvas('fx');
  if (!bg || !bg.width || typeof document === 'undefined') return;
  let c = pool.pop();
  if (!c) { c = document.createElement('canvas'); if (!c.getContext) return; }
  if (c.width !== pw || c.height !== vh) { c.width = pw; c.height = vh; }
  const g = c.getContext('2d'), sc = scaler.scale || 1;
  g.imageSmoothingEnabled = false;
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = NIGHT; g.fillRect(0, 0, pw, vh);
  g.drawImage(bg, cx0 * sc, 0, pw * sc, vh * sc, 0, 0, pw, vh);
  if (world && world.width) g.drawImage(world, cx0 * sc, 0, pw * sc, vh * sc, 0, 0, pw, vh);
  if (light && light.width) {
    g.globalCompositeOperation = 'multiply';
    g.drawImage(light, cx0 * sc, 0, pw * sc, vh * sc, 0, 0, pw, vh);
    g.globalCompositeOperation = 'source-over';
  }
  if (fx && fx.width) {                                   // стихия края и прочее сложение — как в кадре
    g.globalCompositeOperation = 'lighter';
    g.drawImage(fx, cx0 * sc, 0, pw * sc, vh * sc, 0, 0, pw, vh);
    g.globalCompositeOperation = 'source-over';
  }
  hist.push({ c, f: t });
  while (hist.length > KEEP) pool.push(hist.shift().c);
}

export function record(k) {
  if (k < REC_FROM) { if (hist.length) reset(); return; }
  if (t - lastRec < EVERY && t >= lastRec) return;
  lastRec = t;
  const vw = scaler.vw, vh = scaler.vh, { pw, cx0 } = layout(0, vw, vh);
  if (hist.length && (hist[0].c.width !== pw || hist[0].c.height !== vh)) reset();   // экран сменился
  dropStale();
  snap(pw, cx0, vh);
}

const reducedNow = reducedMotion;   // система или «меньше движения» в форме 0 (core/prefs.js)

// ctx — в точках кадра (vw×vh); в сборке рисуется до печати и растра (main.js: layers.feedPass)
export function draw(ctx, k) {
  if (k < PANEL_FROM || !hist.length) return;
  dropStale();
  const vw = scaler.vw, vh = scaler.vh, { pw, panels } = layout(k, vw, vh);
  if (!panels.length || !hist.length) return;
  if (hist[0].c.width !== pw || hist[0].c.height !== vh) { reset(); return; }   // экран сменился — запись не та
  const still = reducedNow(), frames = hist.map(h => h.f);
  if (!still) {
    stills = {};
    const dt = lastT < 0 ? 1 : Math.min(4, Math.max(0, t - lastT));
    scroll = (scroll + dt * (0.3 + 0.45 * k)) % (vh + GAP);                 // лента едет вверх
  }
  lastT = t;
  for (const p of panels) {
    let img = null;
    if (still && stills[p.s]) img = stills[p.s];
    else {
      const h = hist[pickIndex(frames, t, p.delay)];
      if (!h) continue;
      img = h.c;
      if (still && typeof document !== 'undefined') {             // застыть: свой холст — запись переиспользуется
        const c = document.createElement('canvas'); c.width = h.c.width; c.height = h.c.height;
        c.getContext('2d').drawImage(h.c, 0, 0); stills[p.s] = img = c;
      }
    }
    const seed = (p.s * 97 + 400) % (vh + GAP);
    const off = still ? seed : (scroll + seed) % (vh + GAP);
    ctx.save();
    ctx.beginPath(); ctx.rect(p.x, 0, p.w, vh); ctx.clip();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = NIGHT; ctx.fillRect(p.x, 0, p.w, vh);
    ctx.drawImage(img, p.src, 0, p.w, vh, p.x, -off, p.w, vh);
    ctx.drawImage(img, p.src, 0, p.w, vh, p.x, vh + GAP - off, p.w, vh);
    ctx.globalAlpha = 1;
    ctx.fillStyle = NIGHT;                                   // края полосы — ночь
    ctx.fillRect(p.s > 0 ? p.x : p.x + p.w - 1, 0, 1, vh);
    ctx.restore();
  }
}
