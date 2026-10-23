// ═══════════════════════════════════════
// ТИХОЕ — глубина II (world/depth.js): вещь стоит в тени, без своего света;
// подойдёшь — проступает. Тень ложится только на саму вещь (рисунок — в
// отдельный холст, сверху — ночь по его же пикселям), земля вокруг прежняя.
// ═══════════════════════════════════════
import { setCtx } from './context.js';

const NEAR = 70, FAR = 230, DEEP = 0.62, SEEN = 0.1;   // в двух шагах — почти как есть; издали — силуэт в тени
let off = null, oc = null;

// сколько тени: по расстоянию от ног странника до подножия вещи
export function quietShade(d) {
  const k = Math.max(0, Math.min(1, (d - NEAR) / (FAR - NEAR)));
  return SEEN + (DEEP - SEEN) * k * k * (3 - 2 * k);
}

// drawFn(ctx) рисует вещь в мировых координатах; box — её рамка с запасом
export function drawQuiet(ctx, box, shade, drawFn) {
  if (shade <= 0.01) { drawFn(ctx); return; }
  const doc = typeof document !== 'undefined' ? document : null;
  if (!off && doc && doc.createElement) {
    off = doc.createElement('canvas');
    oc = off.getContext ? off.getContext('2d') : null;
  }
  if (!oc) { drawFn(ctx); return; }
  const pad = 8, W = Math.ceil(box.w + pad * 2), H = Math.ceil(box.h + pad * 2);
  if (off.width < W) off.width = W;
  if (off.height < H) off.height = H;
  const ox = Math.floor(box.x - pad), oy = Math.floor(box.y - pad);
  oc.setTransform(1, 0, 0, 1, 0, 0);
  oc.globalCompositeOperation = 'source-over';
  oc.globalAlpha = 1;
  oc.clearRect(0, 0, W, H);
  oc.setTransform(1, 0, 0, 1, -ox, -oy);
  oc.imageSmoothingEnabled = false;
  setCtx(oc);
  try { drawFn(oc); } finally { setCtx(ctx); }
  oc.setTransform(1, 0, 0, 1, 0, 0);
  oc.globalCompositeOperation = 'source-atop';          // ночь — только по пикселям вещи
  oc.globalAlpha = shade;
  oc.fillStyle = '#0D0B0A';
  oc.fillRect(0, 0, W, H);
  oc.globalCompositeOperation = 'source-over';
  oc.globalAlpha = 1;
  ctx.drawImage(off, 0, 0, W, H, ox, oy, W, H);
}
