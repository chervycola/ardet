// ═══════════════════════════════════════
// POST-FX — color grading, vignette, CRT
// ═══════════════════════════════════════
import { scaler } from './scaler.js';

export const postfx = {
  // Color grading: crimson shadows, gold highlights
  colorGrade(ctx) {
    const vw = scaler.vw, vh = scaler.vh;

    // Warm crimson overlay — very subtle
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#6b1a1a';
    ctx.fillRect(0, 0, vw, vh);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  },

  // Vignette — dark edges
  vignette(ctx) {
    const vw = scaler.vw, vh = scaler.vh;
    const grd = ctx.createRadialGradient(vw/2, vh/2, vw*0.3, vw/2, vh/2, vw*0.8);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, vw, vh);
  },

  // CRT scanlines — subtle
  scanlines(ctx) {
    const vw = scaler.vw, vh = scaler.vh;
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#000';
    for (let y = 0; y < vh; y += 2) {
      ctx.fillRect(0, y, vw, 1);
    }
    ctx.globalAlpha = 1;
  },

  // Full post-processing pass
  apply(ctx) {
    this.colorGrade(ctx);
    this.vignette(ctx);
    // scanlines optional — enable if desired
    // this.scanlines(ctx);
  },
};
