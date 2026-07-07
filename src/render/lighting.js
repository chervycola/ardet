// ═══════════════════════════════════════
// LIGHTING — additive multi-layer lights + bloom + particles
// ═══════════════════════════════════════
import { scaler } from './scaler.js';
import { t } from '../core/time.js';

export const lighting = {
  sources: [],

  add(light) {
    this.sources.push({
      flicker: 0.1,
      intensity: 1,
      bloom: false,
      ...light,
    });
  },

  clear() {
    this.sources = [];
  },

  render(ctx, cam, ambient = 0.82) {
    const vw = scaler.vw, vh = scaler.vh;

    // Ambient darkness — slightly tinted (not pure grey → subtle purple for night mood)
    const a = ambient;
    const ar = Math.floor(255 * a * 0.92);
    const ag = Math.floor(255 * a * 0.9);
    const ab = Math.floor(255 * a * 0.95);
    ctx.fillStyle = `rgb(${ar},${ag},${ab})`;
    ctx.fillRect(0, 0, vw, vh);

    for (const L of this.sources) {
      const sx = L.x - cam.x;
      const sy = L.y - cam.y;

      const maxR = L.r * 2.5;
      if (sx < -maxR || sx > vw + maxR || sy < -maxR || sy > vh + maxR) continue;

      const flick = L.flicker ? (1 - L.flicker * 0.5 + Math.sin(t * 0.07 + L.x * 0.1) * L.flicker * 0.5) : 1;
      const intensity = (L.intensity || 1) * flick;
      const [r, g, b] = L.color || [255, 200, 100];

      // Layer 1: distant ambient (very large, very faint)
      drawRadial(ctx, sx, sy, L.r * 2.5, r, g, b, 0.03 * intensity);

      // Layer 2: wide halo (soft glow)
      drawRadial(ctx, sx, sy, L.r * 1.5, r, g, b, 0.12 * intensity);

      // Layer 3: core (bright center)
      drawRadial(ctx, sx, sy, L.r * 0.7, r, g, b, 0.35 * intensity);

      // Layer 4: hot core (tiny, white-shifted)
      const wr = Math.min(255, r + 60);
      const wg = Math.min(255, g + 40);
      const wb = Math.min(255, b + 30);
      drawRadial(ctx, sx, sy, L.r * 0.3, wr, wg, wb, 0.2 * intensity);

      // Bloom: secondary glow with larger radius, pulsing
      if (L.bloom || L.r > 60) {
        const bloomPulse = 0.8 + 0.2 * Math.sin(t * 0.01 + L.y * 0.05);
        drawRadial(ctx, sx, sy, L.r * 3, r, g, b, 0.015 * intensity * bloomPulse);
      }
    }
  },
};

// Atmospheric particles in lit areas
export const lightParticles = {
  particles: [],
  maxCount: 80,

  update(cam, lightSources) {
    const vw = scaler.vw, vh = scaler.vh;

    // Spawn near light sources
    if (this.particles.length < this.maxCount && t % 4 === 0) {
      // Pick a random visible light source
      const visible = lightSources.filter(L => {
        const sx = L.x - cam.x, sy = L.y - cam.y;
        return sx > -L.r && sx < vw + L.r && sy > -L.r && sy < vh + L.r;
      });
      if (visible.length > 0) {
        const L = visible[Math.floor(Math.random() * visible.length)];
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * L.r * 0.8;
        this.particles.push({
          x: L.x + Math.cos(angle) * dist,
          y: L.y + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -0.05 - Math.random() * 0.1,
          life: 120 + Math.random() * 120,
          maxLife: 0,
          size: Math.random() > 0.7 ? 2 : 1,
          color: L.color || [255, 200, 100],
        });
        this.particles[this.particles.length - 1].maxLife = this.particles[this.particles.length - 1].life;
      }
    }

    // Update
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx + Math.sin(t * 0.005 + i * 0.3) * 0.05;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  },

  draw(ctx, cam) {
    for (const p of this.particles) {
      const sx = Math.floor(p.x - cam.x);
      const sy = Math.floor(p.y - cam.y);
      const fade = Math.min(1, Math.min(p.life / 30, (p.maxLife - p.life) / 30));
      ctx.globalAlpha = fade * 0.35;
      const [r, g, b] = p.color;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(sx, sy, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  },
};

function drawRadial(ctx, cx, cy, radius, r, g, b, alpha) {
  if (alpha < 0.005) return;
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grd.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
  grd.addColorStop(0.4, `rgba(${r},${g},${b},${alpha * 0.5})`);
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
}
