// ═══════════════════════════════════════
// POTEMKIN — потёмкинская скорость. Декорация рассчитана на скорость
// зрителя: на ходу подделка цела; постоишь рядом неподвижно — тёплая
// краска сереет, фасад редеет растром до подпорок, осыпается побелка,
// а осмотр получает шов. Пошёл — снова цело. Ни подсветки, ни счёта.
// Подделка = табличка с полем potemkin (строка-шов) или локация
// городка из POTEMKIN_LOOKS.
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { setCtx } from '../render/context.js';
import { POTEMKIN_LOOKS } from '../content/potemkin.js';

export const STILL_DELAY = 150;   // кадров неподвижности до первого шва (~2.5 с)
export const RISE = 1 / 90;       // проявление — полторы секунды
export const FALL = 1 / 40;       // на ходу декорация собирается быстрее
export const RADIUS = 72;         // досягаемость взгляда, px мира
export const SEAM_AT = 0.5;       // с какой проявленности шов попадает в осмотр
export const SEAM_MEMORY = 120;   // шов помнится ~2 с: подойти к проявленному и осмотреть

const reveal = new Map();         // loc.id → 0..1
const seenAt = new Map();         // loc.id → кадр, когда шов был виден
let stillFrames = 0;
let fakes = null;

// Строка-шов подделки (живое чтение: правка в редакторе сразу в мире)
export function seamOf(loc) {
  if (!loc) return null;
  if (loc.potemkinSign) return loc.potemkinSign.potemkin || null;
  return loc.potemkin || POTEMKIN_LOOKS[loc.id] || null;
}

function anchor(loc) {
  return { x: loc.x + loc.w / 2, y: loc.y + loc.h };
}

export function update(player, locations, frozen = false) {
  if (!fakes) fakes = locations.filter(l => seamOf(l));
  stillFrames = (player.moving || frozen) ? 0 : stillFrames + 1;
  const px = player.x + 6, py = player.y + 10;
  for (const loc of fakes) {
    const a = anchor(loc);
    const near = Math.hypot(a.x - px, a.y - py) <= RADIUS;
    const target = near && stillFrames > STILL_DELAY ? 1 : 0;
    const k = reveal.get(loc.id) || 0;
    const nk = k < target ? Math.min(target, k + RISE) : k > target ? Math.max(target, k - FALL) : k;
    if (nk > 0) reveal.set(loc.id, nk); else reveal.delete(loc.id);
    if (nk >= SEAM_AT) seenAt.set(loc.id, t);
  }
}

export function revealOf(loc) { return reveal.get(loc.id) || 0; }

export function seamVisible(loc) {
  if (revealOf(loc) >= SEAM_AT) return true;
  const at = seenAt.get(loc.id);
  return at !== undefined && t - at <= SEAM_MEMORY;
}

// Текст осмотра: шов — только терпеливому взгляду; подсказка «обойти»
// остаётся последней строкой.
export function lookText(loc) {
  const base = loc.look || loc.name;
  const seam = seamOf(loc);
  if (!seam || !seamVisible(loc)) return base;
  const HINT = '\n\n— обойти:';
  const i = base.indexOf(HINT);
  if (i < 0) return `${base}\n\n${seam}`;
  return `${base.slice(0, i)}\n\n${seam}${base.slice(i)}`;
}

// ── Рендер проявления ──
// Объект рисуется в маленький холст, там перекрашивается в канон
// (тёплое → пепел/кость) и прореживается растром Байера; сквозь дыры
// видны подпорки, нарисованные позади.
const NIGHT = [13, 11, 10], SEPIA = [58, 48, 38], ASH = [138, 141, 143], BONE = [217, 207, 184];
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
let off = null, offCtx = null;

function ramp(l) {
  // яркость → НОЧЬ · СЕПИЯ · ПЕПЕЛ · КОСТЬ
  const stops = [[0, NIGHT], [0.22, SEPIA], [0.55, ASH], [0.85, BONE]];
  for (let i = 1; i < stops.length; i++) {
    if (l <= stops[i][0]) {
      const [l0, c0] = stops[i - 1], [l1, c1] = stops[i];
      const f = (l - l0) / (l1 - l0);
      return [c0[0] + (c1[0] - c0[0]) * f, c0[1] + (c1[1] - c0[1]) * f, c0[2] + (c1[2] - c0[2]) * f];
    }
  }
  return BONE;
}

function h01(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  const v = Math.sin(h) * 43758.5453;
  return v - Math.floor(v);
}

// Подкосы театрального щита: за фасадом, к земле, по обе стороны
function drawBraces(ctx, cx, gy, w, h, k) {
  w *= 0.5; h *= 0.75;                       // подкосы по телу вещи, не по рамке
  ctx.globalAlpha = Math.min(0.75, k);
  ctx.fillStyle = '#8A8D8F';                 // ПЕПЕЛ: сырой брус в оттиске
  const top = gy - Math.max(10, h * 0.8), reach = Math.max(8, w * 0.55);
  for (const s of [-1, 1]) {
    const x0 = cx + s * (w * 0.3), x1 = cx + s * (w * 0.3 + reach);
    const n = Math.max(1, Math.round(gy - top));
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      ctx.fillRect(Math.round(x0 + (x1 - x0) * f), Math.round(top + (gy - top) * f), 1, 1);
    }
    ctx.fillRect(Math.round(x1) - 1, gy - 1, 3, 1);          // башмак подкоса
  }
  ctx.globalAlpha = 1;
}

// Осыпь: побелка сходит хлопьями, кость гаснет у земли
function drawFlakes(ctx, loc, cx, gy, w, h, k) {
  if (k < 0.3) return;
  const seed = h01(loc.id);
  ctx.fillStyle = '#D9CFB8';
  for (let i = 0; i < 4; i++) {
    const ph = (t * 0.012 + i * 0.27 + seed) % 1;
    const x = cx - w / 2 + ((seed * 97 + i * 13.7) % 1) * w;
    ctx.globalAlpha = k * (1 - ph) * 0.8;
    ctx.fillRect(Math.round(x + Math.sin(t * 0.03 + i) * 1.5), Math.round(gy - h + ph * h), 1, 1);
  }
  ctx.globalAlpha = 1;
}

// drawFn(ctx) рисует объект в мировых координатах в переданный контекст
export function drawRevealed(ctx, loc, k, drawFn, box) {
  const doc = typeof document !== 'undefined' ? document : null;
  if (!off && doc && doc.createElement) {
    off = doc.createElement('canvas');
    offCtx = off.getContext ? off.getContext('2d', { willReadFrequently: true }) : null;
  }
  if (!offCtx) { drawFn(ctx); return; }

  const pad = 6;
  const W = Math.ceil(box.w + pad * 2), H = Math.ceil(box.h + pad * 2);
  if (off.width < W) off.width = W;
  if (off.height < H) off.height = H;
  const ox = Math.floor(box.x - pad), oy = Math.floor(box.y - pad);
  offCtx.setTransform(1, 0, 0, 1, 0, 0);
  offCtx.clearRect(0, 0, off.width, off.height);
  offCtx.setTransform(1, 0, 0, 1, -ox, -oy);
  offCtx.imageSmoothingEnabled = false;
  setCtx(offCtx);
  drawFn(offCtx);
  setCtx(ctx);
  offCtx.setTransform(1, 0, 0, 1, 0, 0);

  const img = offCtx.getImageData(0, 0, W, H);
  const d = img.data;
  const holes = k * 0.4;                     // вещь редеет растром, но не исчезает
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (d[i + 3] === 0) continue;
      const wx = x + ox, wy = y + oy;          // растр привязан к миру, не к кадру
      if (BAYER[(wy & 3) * 4 + (wx & 3)] / 16 < holes) { d[i + 3] = 0; continue; }
      const l = (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255;
      const c = ramp(0.3 + 0.62 * l);         // краска сошла — бледная некрашеная фанера
      d[i] += (c[0] - d[i]) * k;
      d[i + 1] += (c[1] - d[i + 1]) * k;
      d[i + 2] += (c[2] - d[i + 2]) * k;
    }
  }
  offCtx.putImageData(img, 0, 0);

  const cx = box.x + box.w / 2, gy = box.y + box.h;
  drawBraces(ctx, cx, gy, box.w, box.h, k);
  ctx.drawImage(off, 0, 0, W, H, ox, oy, W, H);
  drawFlakes(ctx, loc, cx, gy, box.w, box.h, k);
}

// для тестов и перезапуска мира
export function _reset() { reveal.clear(); seenAt.clear(); stillFrames = 0; fakes = null; }
