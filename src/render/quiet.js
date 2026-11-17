// ═══════════════════════════════════════
// ТИХОЕ — глубина II (world/depth.js): вещь стоит в тени, без своего света;
// подойдёшь — проступает. Тень ложится только на саму вещь (рисунок — в
// отдельный холст, сверху — ночь по его же пикселям), земля вокруг прежняя.
// ═══════════════════════════════════════
import { setCtx } from './context.js';

const NEAR = 70, FAR = 230, DEEP = 0.62, SEEN = 0.1;   // в двух шагах — почти как есть; издали — силуэт в тени
const HAIR = 0.12;                                     // неподвижному взгляду ближняя тихая вещь прибавляет на волос: тени меньше на 0.12 (вблизи — до нуля)
let off = null, oc0 = null, offP = null, ocP = null;   // холст заливки (на видеокарте) и холст попиксельного прохода (читается)

// сколько тени: по расстоянию от ног странника до подножия вещи; g — неподвижный взгляд
// (world/potemkin.js gaze, 0..1) для ближней тихой вещи: один закон на две стороны —
// подделка под взглядом теряет, настоящее набирает на волос
export function quietShade(d, g = 0) {
  const k = Math.max(0, Math.min(1, (d - NEAR) / (FAR - NEAR)));
  return Math.max(0, SEEN + (DEEP - SEEN) * k * k * (3 - 2 * k) - HAIR * Math.max(0, Math.min(1, g)));
}

// drawFn(ctx) рисует вещь в мировых координатах; box — её рамка с запасом;
// fade — выцветание по заходам ({ a, col, rgb }, world/opis.js): к земле кольца, до ночи, по тем же пикселям;
// key — имя вещи: где в рисунке есть СВЕЧА (окна, фонари), выцветание идёт попиксельно мимо неё —
// тепло не выцветает (канон: огонь всегда сплошной); есть ли свеча — узнаётся раз на вещь
const CANDLE = [226, 138, 58];
const candleIn = new Map();
export function drawQuiet(ctx, box, shade, drawFn, fade = null, key = null) {
  if (shade <= 0.01 && !fade) { drawFn(ctx); return; }
  const doc = typeof document !== 'undefined' ? document : null;
  // холст вуали — в разрешении слоя мира (иначе дуги и обводки грубеют, когда кольцо бледнеет);
  // вещь со свечой (или ещё не проверенная) выцветает попиксельно — в 1×: так дёшево каждый кадр
  const pixel = !!fade && (!key || candleIn.get(key) !== false);
  if (doc && doc.createElement) {
    if (!pixel && !off) { off = doc.createElement('canvas'); oc0 = off.getContext ? off.getContext('2d') : null; }
    if (pixel && !offP) { offP = doc.createElement('canvas'); ocP = offP.getContext ? offP.getContext('2d', { willReadFrequently: true }) : null; }
  }
  const cv = pixel ? offP : off, oc = pixel ? ocP : oc0;
  if (!oc) { drawFn(ctx); return; }
  const tf = !pixel && ctx.getTransform ? ctx.getTransform() : null;
  const s = tf ? Math.max(1, Math.round(Math.hypot(tf.a, tf.b))) : 1;
  const pad = 8, W = Math.ceil(box.w + pad * 2), H = Math.ceil(box.h + pad * 2), SW = W * s, SH = H * s;
  if (cv.width < SW) cv.width = SW;
  if (cv.height < SH) cv.height = SH;
  const ox = Math.floor(box.x - pad), oy = Math.floor(box.y - pad);
  oc.setTransform(1, 0, 0, 1, 0, 0);
  oc.globalCompositeOperation = 'source-over';
  oc.globalAlpha = 1;
  oc.clearRect(0, 0, SW, SH);
  oc.setTransform(s, 0, 0, s, -ox * s, -oy * s);
  oc.imageSmoothingEnabled = false;
  setCtx(oc);
  try { drawFn(oc); } finally { setCtx(ctx); }
  oc.setTransform(1, 0, 0, 1, 0, 0);
  if (fade) {
    if (pixel) {
      const img = oc.getImageData(0, 0, SW, SH), d = img.data, [fr, fg, fb] = fade.rgb, fa = fade.a;
      let seen = false;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue;
        if (d[i] === CANDLE[0] && d[i + 1] === CANDLE[1] && d[i + 2] === CANDLE[2]) { seen = true; continue; }
        d[i] += (fr - d[i]) * fa; d[i + 1] += (fg - d[i + 1]) * fa; d[i + 2] += (fb - d[i + 2]) * fa;
      }
      oc.putImageData(img, 0, 0);
      if (key) candleIn.set(key, seen);
    } else {
      oc.globalCompositeOperation = 'source-atop';      // к земле — только по пикселям вещи
      oc.globalAlpha = fade.a; oc.fillStyle = fade.col; oc.fillRect(0, 0, SW, SH);
    }
  }
  oc.globalCompositeOperation = 'source-atop';          // ночь — только по пикселям вещи
  if (shade > 0.01) { oc.globalAlpha = shade; oc.fillStyle = '#0D0B0A'; oc.fillRect(0, 0, SW, SH); }
  oc.globalCompositeOperation = 'source-over';
  oc.globalAlpha = 1;
  ctx.drawImage(cv, 0, 0, SW, SH, ox, oy, W, H);
}
