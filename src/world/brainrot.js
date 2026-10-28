// ═══════════════════════════════════════
// BRAINROT — cognitive decay in the wasteland
// Растёт с глубиной в пустыню за огнём; падение — у дальнего края.
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { X } from '../render/context.js';
import { scaler } from '../render/scaler.js';
import { MW, MH } from './terrain.js';
import { events } from '../core/events.js';
import { crackedGlass } from '../render/metaFx.js';
import { edgeDepth, edgeState } from './edges.js';
import { CORE } from './disc.js';
import { layers } from '../render/layers.js';
import * as feedPanels from '../render/feedPanels.js';

export const FALL_AT = 0.97;   // падение — только у дальнего края пустыни

let brainrot = 0;
let brainrotFreeze = false;
let brainrotFreezeTimer = 0;
let fallKind = 'void';        // какое падение: sand · ice · lake · junk · void
const FALL_LEN = 300;

// ── Петля «СКРОЛЛ»: добровольное падение. Лента крутит, растр растёт;
// выход не подписан — остановиться. Падения милосердны.
let loopMode = false;
let stillFrames = 0;
// ── Покой лечит: кто стоит, не подыгрывая ленте, тому распад отпускает — с секунды
// до половины за пять (лента при этом тянет едва-едва: world/feedPull.js)
let calmFrames = 0;
const isStill = p => (p.still !== undefined ? p.still : !p.moving);
export function calmOf() { return Math.min(0.5, Math.max(0, calmFrames - 60) / 240 * 0.5); }
let loopExitCb = null;
export function enterLoop(exitCb) {
  loopMode = true; stillFrames = 0; loopExitCb = exitCb || null;
  brainrot = Math.max(brainrot, 20);
  events.emit('brainrot.hook');
}
export function inLoop() { return loopMode; }
export function _dbg() { return { loopMode, stillFrames, brainrot: brainrot | 0 }; }
export function _fallFrame(ctx, kind, f) { drawFall(ctx, kind, f); }   // проверки и лист кадров

function getDistFromMap(player) {
  let d = 0;
  if (player.x < 0) d += Math.abs(player.x);
  if (player.x > MW) d += (player.x - MW);
  if (player.y < 160) d += Math.abs(player.y - 160);
  if (player.y > MH) d += (player.y - MH);
  return d;
}

export function update(player) {
  if (loopMode) {
    brainrot = Math.min(96, brainrot + 0.16);   // растёт, но фриза нет
    if (isStill(player)) stillFrames++; else stillFrames = 0;
    if (stillFrames > 240) {                    // 4 секунды покоя — отпустило
      loopMode = false; stillFrames = 0;
      brainrot = Math.min(brainrot, 55);
      const cb = loopExitCb; loopExitCb = null;
      events.emit('brainrot.unhook');
      if (cb) cb();
    }
    return;
  }
  if (brainrotFreeze) {
    brainrotFreezeTimer++;
    // Recovery after 5 seconds (300 frames)
    if (brainrotFreezeTimer > FALL_LEN) {
      brainrotFreeze = false;
      brainrotFreezeTimer = 0;
      brainrot = 50;
      // Respawn at campfire
      player.x = CORE.x;
      player.y = CORE.y;
      events.emit('brainrot.recover');
    }
    return;
  }

  // Пустыня брейнрота: распад идёт за глубиной, а не копится —
  // шаг назад ослабляет его сразу. Выйти можно до последнего: падение
  // только у дальнего края пояса.
  const dist = getDistFromMap(player);
  const edge = edgeDepth();
  let target = 0;
  if (edge > 0.04) target = Math.pow((edge - 0.04) / 0.93, 1.15) * 100;
  else if (dist > 600) target = Math.min(100, (dist - 600) / 30);
  calmFrames = player.still === true ? Math.min(600, calmFrames + 1) : 0;   // покой — только когда точно известно, что стоит
  target *= 1 - calmOf();
  brainrot += (Math.min(100, target) - brainrot) * (target > brainrot ? 0.05 : 0.08);
  if (brainrot < 0.2) { if (brainrot > 0) feedPanels.reset(); brainrot = 0; }   // отпустило — прошлое ленты не храним

  if ((edge >= FALL_AT || (edge > 0.85 && brainrot >= 99) || (dist > 600 && brainrot >= 99.5)) && !brainrotFreeze) {
    const st = edgeState();
    fallKind = st ? ({ quicksand: 'sand', ice: 'ice', lake: 'lake', junk: 'junk' }[st.elem] || 'void') : 'void';
    brainrotFreeze = true;
    brainrotFreezeTimer = 0;
    brainrot = 100;
    feedPanels.reset();
    if (fallKind !== 'sand' && fallKind !== 'lake') crackedGlass.add(scaler.vw / 2 | 0, scaler.vh / 2 | 0);   // экран бьётся при падении
    if (fallKind === 'ice') for (let i = 0; i < 4; i++) crackedGlass.add(Math.random() * scaler.vw | 0, Math.random() * scaler.vh | 0);
    events.emit('brainrot.freeze');
  }
}

// ── Распад картинки (обычный слой поверх мира) ──
// 0.15+ растр (брейнрот = растр), 0.35+ строки рвутся и съезжают,
// 0.6+ мир крошится макроблоками, 0.8+ провалы кадра.
const NIGHT = '#0D0B0A';
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const patterns = new Map();
function rasterPattern(ctx, level) {
  if (patterns.has(level)) return patterns.get(level);
  if (typeof document === 'undefined' || !document.createElement) return null;
  const c = document.createElement('canvas');
  if (!c.getContext) return null;
  c.width = 4; c.height = 4;
  const g = c.getContext('2d');
  g.fillStyle = NIGHT;
  for (let i = 0; i < 16; i++) if (BAYER[i] < level) g.fillRect(i % 4, i >> 2, 1, 1);
  const p = ctx.createPattern(c, 'repeat');
  patterns.set(level, p);
  return p;
}
function rnd(n) { const v = Math.sin(n * 91.7 + 13.1) * 43758.5453; return v - Math.floor(v); }
// окна без распада: где картинку собрали обратно (позёмка за кольцом), растр и пепел
// расступаются. Прямоугольники в точках кадра; кладутся заново каждый кадр.
let holes = [];
export function setClearings(list) { holes = list || []; }
// горизонт виден (столб за кольцом) — пустыня на миг просто вечер в поле: распад редеет
let damp = 0;
export function dampBrainrot(v) { damp = Math.max(0, Math.min(1, v || 0)); }
function fillAround(ctx, vw, vh) {
  if (!holes.length) { ctx.fillRect(0, 0, vw, vh); return; }
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, vw, vh);
  for (const h of holes) { ctx.moveTo(h.x, h.y); ctx.lineTo(h.x, h.y + h.h); ctx.lineTo(h.x + h.w, h.y + h.h); ctx.lineTo(h.x + h.w, h.y); ctx.closePath(); }
  ctx.clip(); ctx.fillRect(0, 0, vw, vh);
  ctx.restore();
}
function copyStrip(ctx, src, sy, h, dx) {
  if (!src || !src.width) return;
  const sc = scaler.scale || 1;
  ctx.drawImage(src, 0, sy * sc, src.width, h * sc, dx, sy, scaler.vw, h);
}

// строки рвутся и съезжают, мир крошится макроблоками
function tearAndCrumble(ctx, k, bg, world, tick, vw, vh) {
  if (k > 0.35) {
    const n = Math.floor((k - 0.35) * 22);
    for (let i = 0; i < n; i++) {
      const y = rnd(tick * 7 + i) * vh | 0;
      const h = 1 + (rnd(tick * 3 + i * 5) * (2 + k * 9) | 0);
      const dx = ((rnd(tick + i * 11) - 0.5) * k * 46) | 0;
      copyStrip(ctx, bg, y, h, dx);
      copyStrip(ctx, world, y, h, dx);
    }
  }
  if (k > 0.6 && bg && bg.width) {
    const n = Math.floor((k - 0.6) * 70);
    const sc = scaler.scale || 1;
    for (let i = 0; i < n; i++) {
      const sx = rnd(tick * 13 + i) * vw | 0, sy = rnd(tick * 17 + i) * vh | 0;
      const b = 4 + (rnd(i * 3 + tick) * 10 | 0);
      ctx.drawImage(bg, sx * sc, sy * sc, sc, sc, (sx - b / 2) | 0, (sy - b / 2) | 0, b, b);
    }
  }
}
// нарисовать мимо полос ленты; проявляющаяся полоса заслоняет распад по мере проявления
function aroundFeed(ctx, vw, vh, fn) {
  const ps = feedPanels.drawn();
  if (!ps.length) { fn(); return; }
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, vw, vh);
  for (const p of ps) ctx.rect(p.x, 0, p.w, vh);
  ctx.clip('evenodd');
  fn();
  ctx.restore();
  for (const p of ps) if (p.alpha < 1) {
    ctx.save();
    ctx.beginPath(); ctx.rect(p.x, 0, p.w, vh); ctx.clip();
    ctx.globalAlpha = 1 - p.alpha;
    fn();
    ctx.restore();
  }
}

export function draw(ctx) {
  lastK = 0;
  if (brainrot <= 0 && !brainrotFreeze) return;
  const vw = scaler.vw, vh = scaler.vh;

  if (brainrotFreeze) { drawFall(ctx, fallKind, brainrotFreezeTimer / FALL_LEN); return; }

  const k = brainrot / 100 * (1 - 0.85 * damp);
  lastK = Math.max(0, k);
  if (k <= 0) return;
  const bg = layers.canvas('bg'), world = layers.canvas('world');
  const tick = t >> 2;                       // распад дёргается рывками, не плывёт

  feedPanels.record(k);                      // прошлое для полос ленты (render/feedPanels.js)

  // распад рвёт мир, а ленту — нет: разрывы и макроблоки идут мимо полос (render/feedPanels.js)
  aroundFeed(ctx, vw, vh, () => tearAndCrumble(ctx, k, bg, world, tick, vw, vh));
  // полосы ленты рисуются в сборке, до печати и растра (feedK; main.js: layers.feedPass)
  // растр: брейнрот = растр
  if (k > 0.15) {
    const level = Math.min(14, Math.round((k - 0.15) / 0.85 * 14));
    const p = level > 0 && rasterPattern(ctx, level);
    if (p) { ctx.globalAlpha = 0.7; ctx.fillStyle = p; fillAround(ctx, vw, vh); }
  }
  // цвет уходит в пепел
  ctx.globalAlpha = k * 0.22;
  ctx.fillStyle = '#8A8D8F';
  fillAround(ctx, vw, vh);
  // провалы кадра
  if (k > 0.8) {
    const n = Math.floor((k - 0.8) * 25);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = NIGHT;
    for (let i = 0; i < n; i++) {
      ctx.fillRect(0, rnd(tick * 29 + i) * vh | 0, vw, 1 + (rnd(i + tick) * 6 | 0));
    }
  }
  // по краям — киноварь
  if (k > 0.3) {
    ctx.globalAlpha = (k - 0.3) * 0.45;
    const grd = ctx.createRadialGradient(vw / 2, vh / 2, vw * 0.2, vw / 2, vh / 2, vw * 0.7);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, '#C23B2B');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, vw, vh);
  }
  ctx.globalAlpha = 1;
}

// ── Падения: у каждой стихии своё. f — 0..1 за время падения; к концу у всех один
// конец — экран гаснет, как телефон: кадр сходится в черту, черта в точку (дальше —
// пробуждение, render/wakefx.js). Текста в падении нет — ни подписи, ни цифр, ни слов
// в окнах (слово автора 28.10): батарейка — рисунком, строки окон — штрихами.
const BONE = '#D9CFB8', PAPER = '#E8DCC3', SEPIA = '#3A3026', CINNABAR = '#C23B2B';
// батарейка в чёрном стекле: контур, носик, остаток заряда (q — 0..1)
function battery(ctx, cx, y, q) {
  const x = cx - 12;
  ctx.fillStyle = q > 0 ? PAPER : SEPIA;
  ctx.fillRect(x, y, 22, 1); ctx.fillRect(x, y + 8, 22, 1);
  ctx.fillRect(x, y, 1, 9); ctx.fillRect(x + 21, y, 1, 9);
  ctx.fillRect(x + 22, y + 3, 2, 3);
  if (q > 0) { ctx.fillStyle = CINNABAR; ctx.fillRect(x + 2, y + 2, Math.max(1, 18 * q | 0), 5); }
}
// отражение странника: капюшон и плащ до земли — ног из-под подола не видно
function reflection(ctx, cx, cy) {
  const rows = [[2, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [5, 6], [5, 7], [5, 8], [5, 9], [5, 10], [5, 11],
    [5, 12], [6, 13], [6, 14], [6, 15], [6, 16], [6, 17], [7, 18], [7, 19], [7, 20], [7, 21], [7, 22], [8, 23]];
  for (const [w, dy] of rows) ctx.fillRect(cx - w, cy - 14 + dy, w * 2, 1);
  for (let i = 0; i < 8; i++) if (i % 3 !== 1) ctx.fillRect(cx - 8 + i * 2, cy + 10, 2, 1);   // рваный подол
}
// окно хлама: шапка, крестик, строки-штрихи, кнопка — без слов
function popup(ctx, i, x, y, w, h) {
  ctx.fillStyle = PAPER; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = i % 4 ? SEPIA : CINNABAR; ctx.fillRect(x, y, w, 6);
  ctx.fillStyle = PAPER;                                         // крестик — две косые
  for (let k = 0; k < 3; k++) { ctx.fillRect(x + w - 6 + k, y + 1 + k, 1, 1); ctx.fillRect(x + w - 4 - k, y + 1 + k, 1, 1); }
  ctx.fillStyle = SEPIA;
  const n = 1 + (rnd(i * 11) * 3 | 0);
  for (let k = 0; k < n && 10 + k * 4 < h - 7; k++) {
    const lw = (w - 8) * (0.45 + 0.5 * rnd(i * 13 + k)) | 0;
    ctx.globalAlpha = k ? 0.45 : 0.8;
    ctx.fillRect(x + 4, y + 10 + k * 4, lw, k ? 1 : 2);
  }
  ctx.globalAlpha = 1;
  if (i % 3 === 0) { ctx.fillStyle = i % 2 ? CINNABAR : SEPIA; ctx.fillRect(x + w - 18, y + h - 7, 14, 4); }
}
// экран гаснет: шторки сверху и снизу сходятся в черту, черта — в точку, точка тухнет
function screenOff(ctx, vw, vh, k) {
  const cy = vh / 2 | 0;
  const half = Math.max(0, (1 - k / 0.5)) * cy | 0;
  ctx.globalAlpha = 1; ctx.fillStyle = NIGHT;
  ctx.fillRect(0, 0, vw, cy - half); ctx.fillRect(0, cy + half + 1, vw, vh - cy - half);
  if (k < 0.5) return;
  if (half <= 0) { ctx.fillRect(0, cy - 1, vw, 3); }
  const m = (k - 0.5) / 0.35, len = Math.max(1, (1 - Math.min(1, m)) * vw) | 0;
  ctx.globalAlpha = m > 1 ? Math.max(0, 1 - (m - 1) / 0.43) : 0.9;
  ctx.fillStyle = BONE;
  ctx.fillRect(vw / 2 - len / 2 | 0, cy, len, 1);
  ctx.globalAlpha = 1;
}
function drawFall(ctx, kind, f) {
  const vw = scaler.vw, vh = scaler.vh;
  const a = Math.min(1, f / 0.62);                 // анимация; потом — экран гаснет
  if (kind === 'sand') {
    // песок поднимается растром и засыпает кадр; сверху — последняя песчинка
    const h = vh * Math.min(1, a * 1.08);
    for (let i = 0; i < 900; i++) {
      const x = rnd(i * 3.1) * vw | 0;
      const y = vh - rnd(i * 7.7 + (t >> 3)) * h | 0;
      ctx.fillStyle = i % 3 ? BONE : SEPIA;
      ctx.globalAlpha = 0.5 + 0.5 * rnd(i);
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = Math.min(1, a * 1.2) * 0.9;
    ctx.fillStyle = '#7a6034';
    ctx.fillRect(0, vh - h * 0.85, vw, h * 0.85);
    if (f > 0.5) {                                  // одна песчинка
      ctx.globalAlpha = 1; ctx.fillStyle = BONE;
      ctx.fillRect(vw / 2 | 0, ((f - 0.5) * 2.2 * vh) % vh | 0, 1, 1);
    }
  } else if (kind === 'ice') {
    // телефон садится: заряд стекает, экран гаснет, в чёрном стекле — ты сам
    ctx.globalAlpha = Math.min(1, a * 1.4);
    ctx.fillStyle = NIGHT; ctx.fillRect(0, 0, vw, vh);
    ctx.globalAlpha = 1;
    battery(ctx, vw / 2 | 0, 16, Math.max(0, 0.25 - a * 0.3));
    if (a > 0.7) {                                  // отражение странника
      ctx.globalAlpha = Math.min(0.6, (a - 0.7) * 2);
      ctx.fillStyle = '#3a332c';
      reflection(ctx, vw / 2 | 0, vh / 2 + 10 | 0);
    }
  } else if (kind === 'lake') {
    // жижа поднимается, мир плывёт волнами и тонет
    const world = layers.canvas('world'), bg = layers.canvas('bg');
    const sc = scaler.scale || 1;
    for (let y = 0; y < vh; y += 3) {
      const dx = Math.sin(y * 0.09 + t * 0.12) * (2 + a * 10);
      if (bg && bg.width) ctx.drawImage(bg, 0, y * sc, bg.width, 3 * sc, dx, y, vw, 3);
      if (world && world.width) ctx.drawImage(world, 0, y * sc, world.width, 3 * sc, dx, y, vw, 3);
    }
    ctx.globalAlpha = 0.25 + a * 0.6;
    ctx.fillStyle = '#1e5a14';
    const h = vh * Math.min(1, a * 1.1);
    ctx.fillRect(0, vh - h, vw, h);
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 30; i++) {
      const ph = (t * 0.015 + rnd(i)) % 1;
      ctx.fillStyle = '#5aa83a';
      ctx.fillRect(rnd(i * 5) * vw | 0, vh - ph * h | 0, 2, 2);
    }
  } else if (kind === 'junk') {
    // цифровой хлам: окна сыплются, пока не завалят кадр
    const n = Math.floor(a * 70);
    ctx.globalAlpha = 1;
    for (let i = 0; i < n; i++) {
      const w = 46 + (rnd(i * 2) * 50 | 0), h = 22 + (rnd(i * 3) * 24 | 0);
      const x = (rnd(i * 5) * (vw + 20) - 20) | 0, y = (rnd(i * 7) * (vh + 10) - 10) | 0;
      popup(ctx, i, x, y, w, h);
    }
  } else {
    ctx.globalAlpha = 0.88; ctx.fillStyle = NIGHT; ctx.fillRect(0, 0, vw, vh);
    for (let i = 0; i < 260; i++) {
      const g = Math.random() * 90 | 0;
      ctx.fillStyle = `rgb(${g},${g},${g})`;
      ctx.fillRect(Math.random() * vw | 0, Math.random() * vh | 0, 2, 2);
    }
  }
  // конец — один на все падения: экран гаснет
  if (f > 0.66) screenOff(ctx, vw, vh, Math.min(1, (f - 0.66) / 0.34));
  ctx.globalAlpha = 1;
}

// доля распада для полос ленты в этом кадре (0 — нет; в падении, петле с потопом и в красный полдень — main решает)
let lastK = 0;
export function feedK() { return brainrotFreeze ? 0 : lastK; }
export function fallKindOf() { return fallKind; }
export function isFrozen() { return brainrotFreeze; }
export function getLevel() { return brainrot; }
