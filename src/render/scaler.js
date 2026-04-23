// ═══════════════════════════════════════
// SCALER — integer-scale pixel-perfect rendering
// ═══════════════════════════════════════
// Base game resolution — all game logic works in these coords.
// Higher = more detail per sprite, more visible world.
const BASE_W = 640;
const BASE_H = 360;

export const scaler = {
  // Logical game resolution (what the game "thinks" the screen is)
  vw: BASE_W,
  vh: BASE_H,
  // Pixel scale factor (1 game pixel = N screen pixels)
  scale: 1,
  // Physical canvas dimensions
  physW: BASE_W,
  physH: BASE_H,
  // Offset for centering (if letterboxing needed)
  offsetX: 0,
  offsetY: 0,

  recalc() {
    const sw = window.innerWidth;
    const sh = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    // Find largest integer scale that fits
    const maxScaleX = Math.floor(sw * dpr / BASE_W);
    const maxScaleY = Math.floor(sh * dpr / BASE_H);
    let s = Math.max(1, Math.min(maxScaleX, maxScaleY));

    // On mobile: if integer scale leaves >20% of screen blank, adapt viewport
    const isMobile = sw <= 768;
    if (isMobile) {
      // Adaptive viewport: fill screen, keep pixel size consistent
      const pixelSize = Math.max(1, Math.floor(Math.min(sw * dpr / 320, sh * dpr / 180)));
      this.vw = Math.floor(sw * dpr / pixelSize);
      this.vh = Math.floor(sh * dpr / pixelSize);
      this.scale = pixelSize;
      this.physW = this.vw * pixelSize;
      this.physH = this.vh * pixelSize;
      this.offsetX = 0;
      this.offsetY = 0;
    } else {
      // Desktop: fixed base resolution, integer scaled, centered
      this.vw = BASE_W;
      this.vh = BASE_H;
      this.scale = s;
      this.physW = BASE_W * s;
      this.physH = BASE_H * s;
      this.offsetX = Math.floor((sw * dpr - this.physW) / 2);
      this.offsetY = Math.floor((sh * dpr - this.physH) / 2);
    }
  },

  // Apply to a canvas element
  applyToCanvas(canvas) {
    canvas.width = this.physW;
    canvas.height = this.physH;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    return ctx;
  },

  // Create an offscreen canvas at logical resolution
  createLayer() {
    const c = document.createElement('canvas');
    c.width = this.physW;
    c.height = this.physH;
    const ctx = c.getContext('2d');
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx };
  },

  // Screen CSS coords → game world coords (for clicks)
  screenToGame(screenX, screenY, camX, camY) {
    const rect = document.getElementById('game').getBoundingClientRect();
    const gx = (screenX - rect.left) * (this.vw / rect.width) + camX;
    const gy = (screenY - rect.top) * (this.vh / rect.height) + camY;
    return { x: gx, y: gy };
  },
};

// Init on load + resize
scaler.recalc();
window.addEventListener('resize', () => scaler.recalc());
