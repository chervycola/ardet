// ═══════════════════════════════════════
// PET CROSSINGS — random cat/raven/rat cameos
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { X } from '../render/context.js';
import { scaler } from '../render/scaler.js';

const pets = [];
let lastSpawn = 0;

const P = {
  cat: '#050404',
  raven: '#0a0a0a',
  rat: '#3a2418',
  amber: '#daa520',
};

function spawn() {
  const types = ['cat', 'raven', 'rat', 'rat', 'cat'];
  const type = types[Math.floor(Math.random() * types.length)];
  const fromLeft = Math.random() > 0.5;
  const y = 200 + Math.random() * 1400;
  pets.push({
    type,
    x: fromLeft ? -20 : 3020,
    y,
    vx: fromLeft ? (type === 'raven' ? 1.8 : type === 'cat' ? 0.9 : 1.2)
                 : (type === 'raven' ? -1.8 : type === 'cat' ? -0.9 : -1.2),
    life: 600,
    bobPhase: Math.random() * Math.PI * 2,
  });
}

export function update() {
  // Spawn rate: every 5-15 seconds
  if (t - lastSpawn > 300 + Math.random() * 600 && pets.length < 3) {
    lastSpawn = t;
    spawn();
  }
  for (let i = pets.length - 1; i >= 0; i--) {
    const p = pets[i];
    p.x += p.vx;
    p.life--;
    if (p.life <= 0 || p.x < -50 || p.x > 3050) {
      pets.splice(i, 1);
    }
  }
}

export function draw(camera) {
  const ctx = X;
  for (const p of pets) {
    const sx = Math.floor(p.x - camera.x);
    const sy = Math.floor(p.y - camera.y);
    if (sx < -20 || sx > scaler.vw + 20) continue;

    if (p.type === 'cat') {
      // Small black cat silhouette
      ctx.fillStyle = P.cat;
      ctx.fillRect(sx, sy + 1, 5, 3);
      ctx.fillRect(sx + 4, sy, 2, 1);
      ctx.fillRect(sx + 1, sy, 3, 1);
      ctx.fillRect(sx + 5, sy + 2, 1, 1);
      // Eye
      if (t % 60 < 55) ctx.fillStyle = P.amber, ctx.fillRect(sx + 5, sy + 1, 1, 1);
    } else if (p.type === 'raven') {
      // Flying raven with wing flap
      const wingUp = (t + p.bobPhase * 10) % 20 < 10;
      ctx.fillStyle = P.raven;
      ctx.fillRect(sx, sy, 4, 2);
      ctx.fillRect(sx - 1, sy - (wingUp ? 1 : 0), 6, 1);
      ctx.fillRect(sx + 3, sy + 2, 2, 1); // tail
    } else if (p.type === 'rat') {
      ctx.fillStyle = P.rat;
      ctx.fillRect(sx, sy, 4, 2);
      ctx.fillRect(sx + 4, sy + 1, 2, 1); // tail start
      ctx.fillStyle = '#1a0e06';
      ctx.fillRect(sx + 1, sy, 2, 1); // head
    }
  }
}
