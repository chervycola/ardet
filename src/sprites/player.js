// ═══════════════════════════════════════
// PLAYER sprite — the wanderer
// ═══════════════════════════════════════
import { rect, px } from '../render/draw.js';

const P = {
  d1: '#0a0a0a', dgrey: '#2a2a2a', ash: '#8a8d8f',
  bone: '#e8dcc8', dbone: '#c8b8a8',
  dwood: '#1a0e06', crimson: '#6b0f1a', gold: '#b8860b',
};

export function drawPlayer(ctx, player, t) {
  const x = Math.floor(player.x);
  const y = Math.floor(player.y);
  const dir = player.dir || 1;
  const walkPhase = player.moving ? Math.sin(t * 0.25) : 0;
  const bob = player.moving ? Math.abs(Math.sin(t * 0.25)) * 1 : 0;

  // Shadow
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x + 6, y + 22, 6, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Legs (walk cycle)
  const legOffset = player.moving ? walkPhase * 1.5 : 0;
  rect(ctx, x + 3, y + 14 - bob, 2, 6 + legOffset, P.d1);
  rect(ctx, x + 7, y + 14 - bob, 2, 6 - legOffset, P.d1);

  // Body — dark cloak
  rect(ctx, x + 2, y + 6 - bob, 8, 10, P.dgrey);
  rect(ctx, x + 3, y + 7 - bob, 6, 8, P.d1);

  // Head — pale skull
  rect(ctx, x + 3, y - bob, 6, 6, P.bone);
  rect(ctx, x + 4, y + 1 - bob, 4, 4, P.dbone);

  // Eyes — two dark dots
  px(ctx, x + 4 + (dir > 0 ? 0 : 0), y + 2 - bob, P.d1);
  px(ctx, x + 7, y + 2 - bob, P.d1);

  // Mouth line
  if (t % 180 < 5) {
    rect(ctx, x + 5, y + 4 - bob, 2, 1, P.d1);
  }

  // Hood shadow
  rect(ctx, x + 2, y - 1 - bob, 8, 2, P.d1);
}
