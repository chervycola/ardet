// ═══════════════════════════════════════
// POST-FX — color grading, vignette, CRT, cinematic
// ═══════════════════════════════════════
import { scaler } from './scaler.js';
import { t } from '../core/time.js';

export const postfx = {
  // Color grading: crimson shadows, gold highlights, indigo mids
  colorGrade(ctx) {
    const vw = scaler.vw, vh = scaler.vh;

    // Layer 1: warm crimson in shadows
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#6b1a1a';
    ctx.fillRect(0, 0, vw, vh);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // Layer 2: subtle indigo push in midtones
    ctx.globalAlpha = 0.025;
    ctx.fillStyle = '#1b1464';
    ctx.fillRect(0, 0, vw, vh);
    ctx.globalAlpha = 1;

    // Layer 3: gold highlights (additive, very subtle)
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.015;
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(0, 0, vw, vh);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  },

  // Vignette — dark edges with subtle color
  vignette(ctx) {
    const vw = scaler.vw, vh = scaler.vh;
    // Dark vignette
    const grd = ctx.createRadialGradient(vw / 2, vh / 2, vw * 0.25, vw / 2, vh / 2, vw * 0.85);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(0.7, 'rgba(0,0,0,0.15)');
    grd.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, vw, vh);

    // Slight crimson edge (inner ring)
    const grd2 = ctx.createRadialGradient(vw / 2, vh / 2, vw * 0.5, vw / 2, vh / 2, vw * 0.9);
    grd2.addColorStop(0, 'rgba(0,0,0,0)');
    grd2.addColorStop(1, 'rgba(107,15,26,0.08)');
    ctx.fillStyle = grd2;
    ctx.fillRect(0, 0, vw, vh);
  },

  // CRT scanlines — subtle retro feel
  scanlines(ctx) {
    const vw = scaler.vw, vh = scaler.vh;
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#000';
    for (let y = 0; y < vh; y += 3) {
      ctx.fillRect(0, y, vw, 1);
    }
    ctx.globalAlpha = 1;
  },

  // Film grain — organic texture
  grain(ctx) {
    const vw = scaler.vw, vh = scaler.vh;
    ctx.globalAlpha = 0.025;
    for (let i = 0; i < 80; i++) {
      const gx = Math.random() * vw | 0;
      const gy = Math.random() * vh | 0;
      const v = 60 + Math.random() * 40 | 0;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(gx, gy, 1, 1);
    }
    ctx.globalAlpha = 1;
  },

  // Chromatic aberration — very subtle RGB shift
  chromaticAberration(ctx) {
    // Only when moving or brainrot
    const vw = scaler.vw, vh = scaler.vh;
    const shift = 0.5 + Math.sin(t * 0.005) * 0.3;
    ctx.globalAlpha = 0.03;
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-shift, 0, vw, vh);
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(shift, 0, vw, vh);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  },

  // Full post-processing pass
  apply(ctx) {
    this.colorGrade(ctx);
    this.vignette(ctx);
    this.scanlines(ctx);
    this.grain(ctx);
    this.chromaticAberration(ctx);
  },
};
