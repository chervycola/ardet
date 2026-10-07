// ═══════════════════════════════════════
// ЛОУ-ФАЙ — кадр иногда сбоит, как дешёвая копия с дешёвой копии:
//   стоп-кадр  — картинка залипает на несколько кадров
//   крупа      — разрешение проседает втрое
//   разрыв     — полосы строк съезжают вбок
//   разрядность— цвета сжимаются до восьми ступеней на канал (полосы вместо переходов)
// Сбои редкие; чаще в шторм, в яде и в экранных эпохах.
// ═══════════════════════════════════════
import { scaler } from './scaler.js';

const KINDS = ['hold', 'crush', 'tear', 'bits'];
let ev = null;                       // { kind, left, ... }
let next = 2400 + Math.random() * 2400;
let snap = null, snapCtx = null, cyc = -1;
export const LOFI_NAMES = { hold: 'стоп-кадр', crush: 'крупа', tear: 'разрыв', bits: 'разрядность' };

function buf() {
  const W = scaler.vw, H = scaler.vh;
  if (!snap || snap.width !== W || snap.height !== H) {
    snap = document.createElement('canvas'); snap.width = W; snap.height = H;
    snapCtx = snap.getContext('2d', { willReadFrequently: true });
    snapCtx.imageSmoothingEnabled = false;
  }
}

function start(kind) {
  kind = kind || KINDS[(Math.random() * KINDS.length) | 0];
  const len = { hold: 4 + Math.random() * 7, crush: 8 + Math.random() * 18, tear: 3 + Math.random() * 6, bits: 8 + Math.random() * 14 }[kind];
  ev = { kind, left: Math.round(len), fresh: true, bands: [] };
  if (kind === 'tear') {
    const n = 2 + (Math.random() * 3 | 0);
    for (let i = 0; i < n; i++) ev.bands.push({ y: Math.random() * scaler.vh | 0, h: 3 + (Math.random() * 22 | 0), dx: ((Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 12)) | 0 });
  }
}

export const lofi = {
  // pressure: 0..1 — шторм, яд, экранная эпоха поднимают частоту
  update(pressure) {
    if (ev) { if (--ev.left <= 0) ev = null; return; }
    next -= 1 + pressure * 6;
    if (next <= 0) {
      start();
      next = 2700 + Math.random() * 3600;          // база: раз в 45–105 с
    }
  },
  trigger(kind) { start(kind); return ev.kind; },
  // по очереди — для проверки руками
  cycle() { cyc = (cyc + 1) % KINDS.length; start(KINDS[cyc]); ev.left += 30; return KINDS[cyc]; },
  active() { return ev ? ev.kind : null; },

  // поверх отпечатанного кадра, до интерфейса (физические координаты)
  composite(ctx, main) {
    if (!ev) return;
    const s = scaler.scale, W = scaler.vw, H = scaler.vh;
    buf();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    if (ev.kind === 'hold') {
      if (ev.fresh) { snapCtx.drawImage(main, 0, 0, main.width, main.height, 0, 0, W, H); ev.fresh = false; }
      ctx.drawImage(snap, 0, 0, W, H, 0, 0, W * s, H * s);
    } else if (ev.kind === 'crush') {
      const k = 3, w = Math.ceil(W / k), h = Math.ceil(H / k);
      snapCtx.clearRect(0, 0, W, H);
      snapCtx.drawImage(main, 0, 0, main.width, main.height, 0, 0, w, h);
      ctx.drawImage(snap, 0, 0, w, h, 0, 0, w * k * s, h * k * s);
    } else if (ev.kind === 'tear') {
      snapCtx.drawImage(main, 0, 0, main.width, main.height, 0, 0, W, H);
      for (const b of ev.bands) {
        ctx.drawImage(snap, 0, b.y, W, b.h, b.dx * s, b.y * s, W * s, b.h * s);
      }
    } else if (ev.kind === 'bits') {
      snapCtx.drawImage(main, 0, 0, main.width, main.height, 0, 0, W, H);
      const img = snapCtx.getImageData(0, 0, W, H), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = (d[i] & 0xE0) | 16; d[i + 1] = (d[i + 1] & 0xE0) | 16; d[i + 2] = (d[i + 2] & 0xE0) | 16;   // 8 ступеней
      }
      snapCtx.putImageData(img, 0, 0);
      ctx.drawImage(snap, 0, 0, W, H, 0, 0, W * s, H * s);
    }
    ctx.restore();
  },
};
