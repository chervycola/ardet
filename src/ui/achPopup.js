// ═══════════════════════════════════════
// ACHIEVEMENT POPUP — unlock notification
// ═══════════════════════════════════════
import { scaler } from '../render/scaler.js';
import { t } from '../core/time.js';
import { events, E } from '../core/events.js';

const popup = { name: '', desc: '', life: 0, total: 280 };

events.on(E.ACHIEVEMENT, (ach) => {
  popup.name = ach.name;
  popup.desc = ach.desc;
  popup.life = popup.total;
});

export function draw(ctx) {
  if (popup.life <= 0) return;
  const vw = scaler.vw;
  const w = 240, h = 40;
  const x = (vw - w) / 2;
  const y = 16;

  const age = popup.total - popup.life;
  const slideIn = Math.min(1, age / 18);
  const slideOut = popup.life < 30 ? popup.life / 30 : 1;
  const alpha = slideIn * slideOut;
  const yOff = (1 - slideIn) * -20 + (1 - slideOut) * -20;

  ctx.globalAlpha = alpha * 0.96;
  ctx.fillStyle = 'rgba(5,5,16,0.98)';
  ctx.fillRect(x, y + yOff, w, h);
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y + yOff, w, h);

  // Star
  ctx.fillStyle = '#b8860b';
  ctx.font = '10px "Press Start 2P"';
  ctx.fillText('★', x + 8, y + yOff + 16);

  // Name
  ctx.fillStyle = '#e8dcc8';
  ctx.font = '7px "Press Start 2P"';
  ctx.fillText(popup.name, x + 24, y + yOff + 15);

  // Desc
  ctx.fillStyle = '#8a8d8f';
  ctx.font = '5px "Press Start 2P"';
  ctx.fillText(popup.desc, x + 24, y + yOff + 28);

  ctx.globalAlpha = 1;
  popup.life--;
}
