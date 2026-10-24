// ═══════════════════════════════════════
// PET CROSSINGS — random cat/rat cameos (вороны — своим модулем, world/ravens.js)
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { TOWN } from './disc.js';
import { X } from '../render/context.js';
import { scaler } from '../render/scaler.js';

const pets = [];
let lastSpawn = 0;

const P = {
  cat: '#050404',
  rat: '#3a2418',
  amber: '#daa520',
};

function spawn() {
  const types = ['cat', 'rat', 'rat', 'cat'];
  const type = types[Math.floor(Math.random() * types.length)];
  const fromLeft = Math.random() > 0.5;
  const y = TOWN.y0 + 40 + Math.random() * (TOWN.y1 - TOWN.y0 - 240);
  pets.push({
    type,
    x: fromLeft ? TOWN.x0 - 20 : TOWN.x1 + 20,
    y,
    vx: (fromLeft ? 1 : -1) * (type === 'cat' ? 0.9 : 1.2),
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
    // границы — городка (старые 0…3000 остались от мира до сдвига и убивали зверя сразу)
    if (p.life <= 0 || p.x < TOWN.x0 - 60 || p.x > TOWN.x1 + 60) {
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
    const wx = Math.floor(p.x), wy = Math.floor(p.y);   // контекст мира уже сдвинут камерой

    if (p.type === 'cat') {
      // Small black cat silhouette
      ctx.fillStyle = P.cat;
      ctx.fillRect(wx, wy + 1, 5, 3);
      ctx.fillRect(wx + 4, wy, 2, 1);
      ctx.fillRect(wx + 1, wy, 3, 1);
      ctx.fillRect(wx + 5, wy + 2, 1, 1);
      // Eye
      if (t % 60 < 55) ctx.fillStyle = P.amber, ctx.fillRect(wx + 5, wy + 1, 1, 1);
    } else if (p.type === 'rat') {
      ctx.fillStyle = P.rat;
      ctx.fillRect(wx, wy, 4, 2);
      ctx.fillRect(wx + 4, wy + 1, 2, 1); // tail start
      ctx.fillStyle = '#1a0e06';
      ctx.fillRect(wx + 1, wy, 2, 1); // head
    }
  }
}
