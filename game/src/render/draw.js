// ═══════════════════════════════════════
// DRAWING PRIMITIVES — shared across all modules
// ═══════════════════════════════════════

// Pixel-perfect rectangle
export function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

// Single pixel
export function px(ctx, x, y, color) {
  rect(ctx, x, y, 1, 1, color);
}

// Dithered fill
export function dither(ctx, x, y, w, h, c1, c2, density) {
  for (let py = 0; py < h; py++) {
    for (let px_ = 0; px_ < w; px_++) {
      rect(ctx, x + px_, y + py, 1, 1, hash(x + px_, y + py, 77) < density ? c1 : c2);
    }
  }
}

// Deterministic hash (for procedural placement)
export function hash(x, y, seed) {
  return ((Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453) % 1 + 1) % 1;
}

// Linear interpolation
export function lerp(a, b, t) { return a + (b - a) * t; }

// Clamp
export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
