// ═══════════════════════════════════════
// LIGHTING — additive multi-layer lights
// ═══════════════════════════════════════
import { scaler } from './scaler.js';

// Light source: {x, y, r, color, flicker, intensity}
export const lighting = {
  sources: [],

  // Add a persistent light
  add(light) {
    this.sources.push({
      flicker: 0.1,
      intensity: 1,
      ...light,
    });
  },

  clear() {
    this.sources = [];
  },

  // Render all lights onto lighting layer
  render(ctx, cam, t, ambient = 0.85) {
    const vw = scaler.vw, vh = scaler.vh;

    // Fill with ambient darkness (multiply blend will darken)
    // ambient: 0 = pitch black, 1 = full bright
    const a = Math.floor(255 * ambient);
    ctx.fillStyle = `rgb(${a},${a},${a})`;
    ctx.fillRect(0, 0, vw, vh);

    // Each light: 3 layers — core (hot), halo (soft), ambient (very soft)
    for (const L of this.sources) {
      const sx = L.x - cam.x;
      const sy = L.y - cam.y;

      // Cull off-screen
      const maxR = L.r * 2;
      if (sx < -maxR || sx > vw + maxR || sy < -maxR || sy > vh + maxR) continue;

      // Flicker
      const f = L.flicker ? (1 - L.flicker + Math.random() * L.flicker) : 1;
      const intensity = (L.intensity || 1) * f;

      const [r, g, b] = L.color || [255, 200, 100];

      // Ambient glow (largest, subtlest)
      drawRadial(ctx, sx, sy, L.r * 2, `rgba(${r},${g},${b},${0.05 * intensity})`);

      // Halo (medium, soft)
      drawRadial(ctx, sx, sy, L.r * 1.2, `rgba(${r},${g},${b},${0.18 * intensity})`);

      // Core (small, bright)
      drawRadial(ctx, sx, sy, L.r * 0.6, `rgba(${r},${g},${b},${0.45 * intensity})`);
    }
  },
};

function drawRadial(ctx, cx, cy, radius, colorStop) {
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grd.addColorStop(0, colorStop);
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
}
