// ═══════════════════════════════════════
// SPRITE CACHE — offscreen canvas for expensive sprites
// ═══════════════════════════════════════
// Draw a sprite once to an offscreen canvas, then blit it each frame.
// Re-draw only when animation frame changes.

const cache = new Map();

export function createCachedSprite(id, width, height, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  return {
    id,
    canvas,
    ctx,
    width,
    height,
    drawFn,
    lastFrame: -1,

    // Redraw if frame changed
    update(frame) {
      if (frame === this.lastFrame) return;
      this.lastFrame = frame;
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.drawFn(this.ctx, 0, 0, frame);
    },

    // Blit to target context
    draw(targetCtx, x, y) {
      targetCtx.drawImage(this.canvas, Math.floor(x), Math.floor(y));
    },
  };
}

// Simple cache manager
export const spriteCache = {
  get(id) { return cache.get(id); },

  set(id, sprite) { cache.set(id, sprite); },

  getOrCreate(id, width, height, drawFn) {
    if (cache.has(id)) return cache.get(id);
    const sprite = createCachedSprite(id, width, height, drawFn);
    cache.set(id, sprite);
    return sprite;
  },
};
