// ═══════════════════════════════════════
// CAMERA — viewport into the world
// ═══════════════════════════════════════
import { scaler } from './scaler.js';

export const camera = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  shakeT: 0,
  smoothing: 0.055,
  // «Сел — кадр встал» (разбор KRZ, weave/KRZ_2026-11-21.md): сидящему кадр ставится вручную —
  // камера за 2–3 с переезжает в точку и стоит, пока он сидит; встал — снова следит
  held: null,
  holdSmoothing: 0.025,
  hold(worldX, worldY) { this.held = { x: worldX, y: worldY }; },
  // встал — камера возвращается к фигуре так же плавно, как вставала в кадр (полторы секунды разгона)
  ease: 0,
  release() { if (this.held) this.ease = 90; this.held = null; },

  follow(worldX, worldY) {
    const p = this.held || { x: worldX, y: worldY };
    this.targetX = p.x - scaler.vw / 2;
    this.targetY = p.y - scaler.vh / 2;
  },

  // взгляд вверх у доминанты (слово автора 25.11: «сделай объекты больше»): доминанта выше кадра, и
  // у подножия кадр поднимается — насколько можно, не выпуская странника из нижней части кадра;
  // отошёл вбок или вглубь — опускается. boxes — { archX, archGy, w, h }; ноги — feetX, feetY
  lookUp(boxes, feetX, feetY) {
    if (this.held) return;
    const vh = scaler.vh;
    let best = this.targetY;
    for (const b of boxes) {
      const d = feetY - b.archGy;                                   // >0 — странник перед подножием
      if (d < -6 || d > 220) continue;
      const side = Math.abs(feetX - b.archX) - b.w / 2;
      const k = side <= 0 ? 1 : side >= 120 ? 0 : 1 - side / 120;   // вбок — плавно на нет
      const k2 = d <= 60 ? 1 : 1 - (d - 60) / 160;                  // вглубь — тоже
      const want = Math.max(feetY - vh + 34, Math.min(this.targetY, b.archGy - b.h - 10));
      best = Math.min(best, this.targetY + (want - this.targetY) * k * k2);
    }
    this.targetY = best;
  },

  update() {
    // Smooth follow
    const k = this.held ? this.holdSmoothing
      : this.ease > 0 ? this.smoothing - (this.smoothing - this.holdSmoothing) * (this.ease-- / 90) : this.smoothing;
    this.x += (this.targetX - this.x) * k;
    this.y += (this.targetY - this.y) * k;

    // Screen shake
    if (this.shakeT > 0) {
      const intensity = this.shakeT / 12;
      this.x += Math.sin(this.shakeT * 1.5) * 3 * intensity;
      this.y += Math.cos(this.shakeT * 2) * 2 * intensity;
      this.shakeT--;
    }
  },

  shake(frames = 12) {
    this.shakeT = frames;
  },

  // Clamp camera to world bounds
  clampToWorld(worldW, worldH) {
    this.x = Math.max(0, Math.min(this.x, worldW - scaler.vw));
    this.y = Math.max(0, Math.min(this.y, worldH - scaler.vh));
  },

  // Apply camera transform to a canvas context
  applyTransform(ctx) {
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  },

  // Check if a world rect is visible
  isVisible(x, y, w, h) {
    return x + w > this.x && x < this.x + scaler.vw &&
           y + h > this.y && y < this.y + scaler.vh;
  },
};
