// ═══════════════════════════════════════
// BRAINROT — cognitive decay in the wasteland
// Increases when player goes too far from map. Freezes at 100%.
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { X } from '../render/context.js';
import { scaler } from '../render/scaler.js';
import { MW, MH } from './terrain.js';
import { events } from '../core/events.js';
import { crackedGlass } from '../render/metaFx.js';

let brainrot = 0;
let brainrotFreeze = false;
let brainrotFreezeTimer = 0;

function getDistFromMap(player) {
  let d = 0;
  if (player.x < 0) d += Math.abs(player.x);
  if (player.x > MW) d += (player.x - MW);
  if (player.y < 160) d += Math.abs(player.y - 160);
  if (player.y > MH) d += (player.y - MH);
  return d;
}

export function update(player) {
  if (brainrotFreeze) {
    brainrotFreezeTimer++;
    // Recovery after 5 seconds (300 frames)
    if (brainrotFreezeTimer > 300) {
      brainrotFreeze = false;
      brainrotFreezeTimer = 0;
      brainrot = 50;
      // Respawn at campfire
      player.x = 800;
      player.y = 900;
      events.emit('brainrot.recover');
    }
    return;
  }

  const dist = getDistFromMap(player);
  if (dist > 600) {
    brainrot = Math.min(100, (dist - 600) / 30);
  } else {
    brainrot = Math.max(0, brainrot - 0.5);
  }

  if (brainrot >= 100 && !brainrotFreeze) {
    brainrotFreeze = true;
    brainrotFreezeTimer = 0;
    crackedGlass.add(scaler.vw / 2 | 0, scaler.vh / 2 | 0);
    events.emit('brainrot.freeze');
  }
}

export function draw(ctx) {
  if (brainrot <= 0 && !brainrotFreeze) return;
  const vw = scaler.vw, vh = scaler.vh;

  if (brainrotFreeze) {
    // Full screen static/noise
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 200; i++) {
      const rx = Math.random() * vw | 0;
      const ry = Math.random() * vh | 0;
      const gray = Math.random() * 80 | 0;
      ctx.fillStyle = `rgb(${gray},${gray + 10},${gray})`;
      ctx.fillRect(rx, ry, 2, 2);
    }
    // Center text
    ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 0.05);
    ctx.fillStyle = '#6b0f1a';
    ctx.font = '12px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('КОГНИТИВНЫЙ РАСПАД', vw / 2, vh / 2 - 10);
    ctx.font = '7px "Press Start 2P"';
    ctx.fillText('мох вытаскивает тебя обратно...', vw / 2, vh / 2 + 10);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
    return;
  }

  // Progressive noise/distortion overlay
  const intensity = brainrot / 100;
  ctx.globalAlpha = intensity * 0.3;
  for (let i = 0; i < Math.floor(intensity * 50); i++) {
    const rx = Math.random() * vw | 0;
    const ry = Math.random() * vh | 0;
    const gray = Math.random() * 60 | 0;
    ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
    ctx.fillRect(rx, ry, 1, 1);
  }

  // Vignette intensifies
  if (intensity > 0.3) {
    ctx.globalAlpha = (intensity - 0.3) * 0.4;
    const grd = ctx.createRadialGradient(vw / 2, vh / 2, vw * 0.2, vw / 2, vh / 2, vw * 0.7);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(107,15,26,1)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, vw, vh);
  }
  ctx.globalAlpha = 1;
}

export function isFrozen() { return brainrotFreeze; }
export function getLevel() { return brainrot; }
