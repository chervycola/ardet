// ═══════════════════════════════════════
// RENDER LAYERS — composited canvas stack
// ═══════════════════════════════════════
import { scaler } from './scaler.js';

// Layer order (bottom to top):
//   bg    → terrain, sky (cached, redrawn rarely)
//   world → locations, NPCs, player, lore items
//   light → additive lighting
//   fx    → particles, glitch, screen moss, cracks
//   ui    → HUD, popups, menus (screen coords, no camera)
//   post  → color grading, vignette, CRT

const LAYER_NAMES = ['bg', 'world', 'light', 'fx', 'ui', 'post'];

export const layers = {
  _layers: {},
  main: null,   // final composited canvas
  mainCtx: null,

  init(mainCanvas) {
    this.main = mainCanvas;
    this.mainCtx = scaler.applyToCanvas(mainCanvas);

    // CSS: fill screen
    mainCanvas.style.width = '100vw';
    mainCanvas.style.height = '100vh';
    mainCanvas.style.objectFit = 'fill';
    mainCanvas.style.imageRendering = 'pixelated';

    for (const name of LAYER_NAMES) {
      this._layers[name] = scaler.createLayer();
    }
  },

  // Get a layer's context for drawing
  ctx(name) {
    return this._layers[name]?.ctx;
  },

  // Get a layer's canvas (for compositing)
  canvas(name) {
    return this._layers[name]?.canvas;
  },

  // Clear a specific layer
  clear(name) {
    const l = this._layers[name];
    if (!l) return;
    l.ctx.save();
    l.ctx.setTransform(1, 0, 0, 1, 0, 0);
    l.ctx.clearRect(0, 0, l.canvas.width, l.canvas.height);
    l.ctx.restore();
  },

  // Clear all layers
  clearAll() {
    for (const name of LAYER_NAMES) this.clear(name);
  },

  // Composite all layers onto main canvas
  composite() {
    const ctx = this.mainCtx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.main.width, this.main.height);

    // bg + world: normal blending
    ctx.drawImage(this.canvas('bg'), 0, 0);
    ctx.drawImage(this.canvas('world'), 0, 0);

    // light: multiply or screen blend
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(this.canvas('light'), 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    // fx: additive
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(this.canvas('fx'), 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    // ui: normal, on top
    ctx.drawImage(this.canvas('ui'), 0, 0);

    // post: final pass (color grading, vignette)
    ctx.drawImage(this.canvas('post'), 0, 0);

    ctx.restore();
  },

  // Resize all layers (call after scaler.recalc)
  resize() {
    scaler.applyToCanvas(this.main);
    this.main.style.width = '100vw';
    this.main.style.height = '100vh';
    this.main.style.objectFit = 'fill';

    for (const name of LAYER_NAMES) {
      const l = this._layers[name];
      l.canvas.width = scaler.physW;
      l.canvas.height = scaler.physH;
      l.ctx.setTransform(scaler.scale, 0, 0, scaler.scale, 0, 0);
      l.ctx.imageSmoothingEnabled = false;
    }
  },
};

// Resize handler
window.addEventListener('resize', () => {
  scaler.recalc();
  layers.resize();
});
