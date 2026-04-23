// ═══════════════════════════════════════
// PARTICLES — versatile particle system
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { scaler } from './scaler.js';

const particles = [];
const MAX = 300;

export function emit(x, y, count, config = {}) {
  const {
    color = '#8a8d8f',
    speed = 0.5,
    life = 40,
    size = 1,
    gravity = 0,
    spread = Math.PI * 2,
    angle = -Math.PI / 2,
    fadeOut = true,
  } = config;

  for (let i = 0; i < count && particles.length < MAX; i++) {
    const a = angle + (Math.random() - 0.5) * spread;
    const s = speed * (0.5 + Math.random() * 0.5);
    particles.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: life + Math.floor(Math.random() * life * 0.3),
      maxLife: 0,
      size: size + (Math.random() > 0.5 ? 1 : 0),
      color,
      gravity,
      fadeOut,
    });
    particles[particles.length - 1].maxLife = particles[particles.length - 1].life;
  }
}

export function update() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

export function draw(ctx, camera) {
  for (const p of particles) {
    const sx = Math.floor(p.x - camera.x);
    const sy = Math.floor(p.y - camera.y);
    if (sx < -10 || sx > scaler.vw + 10 || sy < -10 || sy > scaler.vh + 10) continue;

    const alpha = p.fadeOut ? Math.min(1, p.life / (p.maxLife * 0.3)) : 1;
    ctx.globalAlpha = alpha * 0.6;
    ctx.fillStyle = p.color;
    ctx.fillRect(sx, sy, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

// Convenience: footstep dust
export function footstepDust(x, y) {
  emit(x + 7, y + 22, 1, {
    color: '#3a3a2a',
    speed: 0.3,
    life: 25,
    size: 1,
    spread: Math.PI,
    angle: -Math.PI / 2,
  });
}

// Convenience: lore pickup sparkle
export function pickupSparkle(x, y) {
  emit(x, y, 8, {
    color: '#b8860b',
    speed: 1.2,
    life: 30,
    size: 1,
    spread: Math.PI * 2,
    gravity: 0.02,
  });
}

// Convenience: fire embers
export function fireEmber(x, y) {
  emit(x, y, 1, {
    color: Math.random() > 0.5 ? '#ff6600' : '#ff3300',
    speed: 0.7,
    life: 60,
    size: 1,
    spread: Math.PI * 0.5,
    angle: -Math.PI / 2,
    gravity: -0.005,
  });
}
