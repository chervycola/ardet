// ═══════════════════════════════════════
// ПРОБУЖДЕНИЕ В МИРЕ ЦИФРЫ — канон DRAMATURGY: «Журнал пуст — ботинки стоптаны:
// цифровое стираемо, биологическое нет; мир помнит тело». Тело просыпается — его
// шатает и трясёт: шатание маятником — у #gw (style.css, wakesway), дрожь — здесь,
// целыми точками кадра. Мир — цифра после сбоя: собирается заново, сперва крупными
// блоками, потом мельче; строки срывает и сдвигает вбок; на миг проступает двоичный
// код; по кадру — битые точки, гаснут не сразу. Каждый раз, как веки открываются,
// мир чуть заново подгружается. Пятнадцать секунд, как муть и веки (style.css).
// Краски свои: дробится и рвётся сам кадр, сверху — только кость, пепел и редкая
// киноварь. Вспышек не больше трёх в секунду; «меньше движения» в системе — только
// сборка блоками и битые точки, без дрожи и рывков.
// Проход — по готовому кадру, до интерфейса (render/layers.js: wakePass).
// ═══════════════════════════════════════
import { t } from '../core/time.js';

export const LEN = 900;                                    // пятнадцать секунд
export const OPEN = [72, 252, 522, 756];                   // веки открываются (lidBlink: 8%, 28%, 58%, 84%)
const BO = '#D9CFB8', AS = '#8A8D8F', KV = '#C23B2B';
const FONT = '6px "Press Start 2P","VT323",monospace';
function hh(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const reducedNow = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const wakefx = {
  t0: -1, seed: 1, reduced: false, stuck: null,
  start() { this.t0 = t; this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff; this.reduced = reducedNow(); this.stuck = null; },
  age() { return this.t0 < 0 ? -1 : t - this.t0; },
  active() { const a = this.age(); return a >= 0 && a < LEN; },
};

// ── сколько точек в блоке (точки кадра): первая сборка 24 → 1 за пять с половиной
//    секунд ступенями, как прогрессивная картинка: каждая ступень проходит кадр
//    сверху вниз строкой развёртки — выше строки уже мельче (b), ниже ещё крупно
//    (prev), k — где строка (0..1). Веки открылись — короткая подгрузка всем кадром ──
const FIRST = [[40, 16], [80, 12], [120, 8], [170, 6], [220, 4], [270, 3], [330, 2]];
const AGAIN = [6, 6, 4, 4, 3, 3, 2, 2];
export function decodeAt(a) {
  if (a < 0 || a >= LEN) return { b: 1, prev: 1, k: 1 };
  let D = { b: 1, prev: 1, k: 1 }, start = 0, prev = 24;
  for (const [end, s] of FIRST) {
    if (a < end) { D = { b: s, prev, k: (a - start) / (end - start) }; break; }
    start = end; prev = s;
  }
  for (const o of OPEN) {
    const d = a - o;
    if (d >= 0 && d < 16) { const g = AGAIN[d >> 1]; if (g > D.b) D = { b: g, prev: g, k: 1 }; }
  }
  return D;
}
export const blockAt = a => decodeAt(a).b;
// ── дрожь: всплесками, вначале крупнее и дольше, к концу реже и мельче; меняется
//    через кадр — тридцать раз в секунду, как рука ──
const BURSTS = [[0, 150, 2], [240, 300, 2], [400, 440, 1], [510, 560, 2], [620, 650, 1], [750, 790, 1]];
export function tremorAt(a, seed = 1, reduced = false) {
  if (reduced || a < 0 || a >= LEN) return [0, 0];
  for (const [s, e, A] of BURSTS) {
    if (a < s || a >= e) continue;
    const k = a >> 1, fade = 1 - (a - s) / (e - s) * 0.5;
    const amp = Math.max(1, Math.round(A * fade));
    return [Math.round((hh(k, 1, seed) * 2 - 1) * amp), Math.round((hh(k, 2, seed) * 2 - 1) * amp)];
  }
  return [0, 0];
}
// ── рывки строк: полосы кадра уезжают вбок; густо в первые две секунды и на каждом
//    открытии век ──
export function slicesAt(a, vh, seed = 1, reduced = false) {
  if (reduced || a < 0 || a >= LEN) return [];
  let n = 0;
  if (a < 120) n = 2 + Math.floor(hh(a >> 2, 3, seed) * 4);
  for (const o of OPEN) { const d = a - o; if (d >= 0 && d < 20) n = Math.max(n, 1 + Math.floor(hh(a >> 2, 4, seed) * 3)); }
  const out = [];
  for (let i = 0; i < n; i++) {
    const k = (a >> 2) * 7 + i;                                   // полоса держится четыре кадра
    const h = 2 + Math.floor(hh(k, 5, seed) * 12), y = Math.floor(hh(k, 6, seed) * Math.max(1, vh - h));
    const dx = Math.round((hh(k, 7, seed) * 2 - 1) * (a < 120 ? 16 : 8));
    if (dx) out.push({ y, h, dx });
  }
  return out;
}
// ── двоичный код проступает строкой: не чаще раза в восемь кадров ──
export function codeAt(a, vw, vh, seed = 1, reduced = false) {
  if (reduced || a < 0 || a >= LEN) return [];
  let on = a >= 10 && a < 100;
  for (const o of OPEN) { const d = a - o; if (d >= 2 && d < 14) on = true; }
  if (!on) return [];
  const k = a >> 3, n = 1 + Math.floor(hh(k, 8, seed) * 3), out = [];
  for (let i = 0; i < n; i++) {
    const len = 12 + Math.floor(hh(k + i, 9, seed) * 40);
    let s = '';
    for (let j = 0; j < len; j++) s += hh(k * 31 + i, j, seed) < 0.5 ? '0' : '1';
    out.push({ s, x: Math.floor(hh(k + i, 10, seed) * Math.max(1, vw - 60)), y: 8 + Math.floor(hh(k + i, 11, seed) * Math.max(1, vh - 16)), a: 0.4 + 0.3 * hh(k + i, 12, seed) });
  }
  return out;
}
// ── битые точки: двадцать с небольшим, гаснут каждая в свой срок ──
function stuckOf(vw, vh, seed) {
  const out = [];
  for (let i = 0; i < 26; i++) out.push({ x: Math.floor(hh(i, 13, seed) * vw), y: Math.floor(hh(i, 14, seed) * vh), life: 90 + Math.floor(hh(i, 15, seed) * 520), c: i % 9 === 4 ? KV : i % 3 ? BO : AS });
  return out;
}

// ── проход по готовому кадру (точки экрана: вся картинка в масштабе scale) ──
let small = null, snap = null;
function canvas(w, h, old) {
  if (old && old.width === w && old.height === h) return old;
  if (typeof document === 'undefined' || !document.createElement) return null;
  const c = old || document.createElement('canvas');
  if (!c || !c.getContext) return null;
  c.width = w; c.height = h;
  return c;
}
// кадр блоками по p точек экрана — только полоса строк y0..y1
function blocks(ctx, src, W, H, p, y0, y1) {
  const bw = Math.ceil(W / p), bh = Math.ceil(H / p);
  small = canvas(bw, bh, small);
  if (!small) return;
  const g = small.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, bw, bh);
  g.drawImage(src, 0, 0, W, H, 0, 0, bw, bh);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, y0, W, y1 - y0); ctx.clip();
  ctx.drawImage(small, 0, 0, bw, bh, 0, 0, bw * p, bh * p);
  ctx.restore();
}
export function wakePass(ctx, main, scale = 1) {
  const a = wakefx.age();
  if (a < 0 || a >= LEN || !main) return;
  const W = main.width, H = main.height, s = Math.max(1, scale), vw = Math.round(W / s), vh = Math.round(H / s);
  const seed = wakefx.seed, red = wakefx.reduced;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  // 1. дрожь и рывки строк — по снимку кадра (один снимок на кадр)
  const [jx, jy] = tremorAt(a, seed, red), sl = slicesAt(a, vh, seed, red);
  if (jx || jy || sl.length) {
    snap = canvas(W, H, snap);
    if (snap) {
      const g = snap.getContext('2d');
      g.clearRect(0, 0, W, H);
      g.drawImage(main, 0, 0);
      if (jx || jy) ctx.drawImage(snap, jx * s, jy * s);
      for (const q of sl) ctx.drawImage(snap, 0, q.y * s, W, q.h * s, q.dx * s, q.y * s, W, q.h * s);
    }
  }
  // 2. мир собирается блоками — прямо с кадра: выше строки развёртки мельче, ниже ещё крупно
  const D = decodeAt(a);
  if (D.b > 1 || D.prev > 1) {
    const sy = D.prev > D.b ? Math.round(D.k * vh) * s : H;
    if (D.b > 1) blocks(ctx, main, W, H, D.b * s, 0, sy);
    if (sy < H) blocks(ctx, main, W, H, D.prev * s, sy, H);
    if (sy < H) { ctx.globalAlpha = 0.35; ctx.fillStyle = BO; ctx.fillRect(0, sy, W, s); ctx.globalAlpha = 1; }   // строка развёртки
  }
  // 3. двоичный код и битые точки — в точках кадра
  ctx.setTransform(s, 0, 0, s, 0, 0);
  const code = codeAt(a, vw, vh, seed, red);
  if (code.length) {
    ctx.font = FONT; ctx.textBaseline = 'top'; ctx.fillStyle = BO;
    for (const c of code) { ctx.globalAlpha = c.a; ctx.fillText(c.s, c.x, c.y); }
  }
  if (!wakefx.stuck) wakefx.stuck = stuckOf(vw, vh, seed);
  for (const p of wakefx.stuck) {
    if (a >= p.life) continue;
    ctx.globalAlpha = a > p.life - 30 ? (p.life - a) / 30 * 0.85 : 0.85;   // гаснет не сразу
    ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 1, 1);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
