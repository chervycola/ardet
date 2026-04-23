// ═══════════════════════════════════════
// MONSTERS — wasteland creatures that spawn at distance
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { X } from '../render/context.js';
import { MW, MH } from './terrain.js';

const monsters = [];
let lastSpawn = 0;

function getDistFromMap(player) {
  let d = 0;
  if (player.x < 0) d += Math.abs(player.x);
  if (player.x > MW) d += (player.x - MW);
  if (player.y < 160) d += Math.abs(player.y - 160);
  if (player.y > MH) d += (player.y - MH);
  return d;
}

export function update(player) {
  const dist = getDistFromMap(player);

  // Spawn monsters when far from map
  if (dist > 300 && t - lastSpawn > 120 && monsters.length < 8) {
    lastSpawn = t;
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 100 + Math.random() * 60;
    monsters.push({
      x: player.x + Math.cos(angle) * spawnDist,
      y: player.y + Math.sin(angle) * spawnDist,
      speed: 0.3 + Math.random() * 0.4,
      size: 3 + Math.floor(Math.random() * 4),
      life: 600,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // Update — move toward player
  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters[i];
    const dx = player.x - m.x;
    const dy = player.y - m.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 3) {
      m.x += (dx / d) * m.speed;
      m.y += (dy / d) * m.speed;
    }
    m.life--;
    if (m.life <= 0 || dist < 100) {
      monsters.splice(i, 1);
    }
  }
}

export function draw(camera) {
  const ctx = X;
  for (const m of monsters) {
    const sx = Math.floor(m.x - camera.x);
    const sy = Math.floor(m.y - camera.y);
    const pulse = Math.sin(t * 0.03 + m.phase) * 0.3;

    // Shadow
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(sx + m.size / 2, sy + m.size * 1.5 + 5, m.size * 0.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body — dark, shifting shape
    ctx.globalAlpha = 0.6 + pulse * 0.2;
    ctx.fillStyle = '#1a0508';
    ctx.fillRect(sx, sy, m.size, m.size * 1.5);
    ctx.fillStyle = '#3a0a10';
    ctx.fillRect(sx + 1, sy + 1, m.size - 2, m.size - 1);

    // Eyes — red
    if (m.size > 3) {
      ctx.fillStyle = '#ff2020';
      ctx.fillRect(sx + 1, sy + 2, 1, 1);
      ctx.fillRect(sx + m.size - 2, sy + 2, 1, 1);
    }

    ctx.globalAlpha = 1;
  }
}

export function getCount() { return monsters.length; }
