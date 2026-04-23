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

  follow(worldX, worldY) {
    this.targetX = worldX - scaler.vw / 2;
    this.targetY = worldY - scaler.vh / 2;
  },

  update() {
    // Smooth follow
    this.x += (this.targetX - this.x) * this.smoothing;
    this.y += (this.targetY - this.y) * this.smoothing;

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
