// ═══════════════════════════════════════
// PLAYER sprite — the wanderer (enhanced)
// ═══════════════════════════════════════
import { rect, px } from '../render/draw.js';
import { X } from '../render/context.js';
import { t } from '../core/time.js';

const P = {
  d1: '#0a0a0a', dgrey: '#2a2a2a', ash: '#8a8d8f',
  bone: '#e8dcc8', dbone: '#c8b8a8',
  dwood: '#1a0e06', crimson: '#6b0f1a', gold: '#b8860b',
  cloak: '#1a1418', cloakLight: '#2a2028',
};

export function drawPlayer(player) {
  const ctx = X;
  const x = Math.floor(player.x);
  const y = Math.floor(player.y);
  const dir = player.dir || 1;
  const moving = player.moving;
  const walkPhase = moving ? Math.sin(t * 0.22) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.22)) * 1.2 : 0;
  const breath = Math.sin(t * 0.015) * 0.5;
  const headTilt = Math.sin(t * 0.008) * 0.3;

  // Shadow
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x + 7, y + 22, 7 + (moving ? 1 : 0), 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Legs (walk cycle with knee bend)
  const legL = moving ? walkPhase * 2 : 0;
  const legR = moving ? -walkPhase * 2 : 0;
  // Left leg
  rect(ctx, x + 3, y + 15 - bob, 2, 6 + legL, P.d1);
  px(ctx, x + 3, y + 20 + legL - bob, P.dgrey); // knee highlight
  // Right leg
  rect(ctx, x + 8, y + 15 - bob, 2, 6 + legR, P.d1);
  px(ctx, x + 8, y + 20 + legR - bob, P.dgrey);
  // Boots
  rect(ctx, x + 2, y + 21 + legL - bob, 3, 2, P.dwood);
  rect(ctx, x + 7, y + 21 + legR - bob, 3, 2, P.dwood);

  // Body — layered cloak
  rect(ctx, x + 1, y + 6 - bob + breath, 11, 11 - breath, P.cloak);
  rect(ctx, x + 2, y + 7 - bob + breath, 9, 9 - breath, P.d1);
  // Cloak collar
  rect(ctx, x + 2, y + 5 - bob, 9, 2, P.cloakLight);
  // Belt
  rect(ctx, x + 2, y + 13 - bob, 9, 1, P.dgrey);
  px(ctx, x + 6, y + 13 - bob, P.gold); // buckle

  // Arms
  const armSwing = moving ? Math.sin(t * 0.22 + 0.5) * 1.5 : 0;
  // Left arm
  rect(ctx, x + 0 - armSwing * 0.5, y + 8 - bob, 2, 7, P.d1);
  px(ctx, x + 0 - armSwing * 0.5, y + 15 - bob, P.bone); // hand
  // Right arm
  rect(ctx, x + 11 + armSwing * 0.5, y + 8 - bob, 2, 7, P.d1);
  px(ctx, x + 11 + armSwing * 0.5, y + 15 - bob, P.bone);

  // Head
  const hx = x + 3 + headTilt;
  rect(ctx, hx, y - 1 - bob, 7, 7, P.bone);
  rect(ctx, hx + 1, y - bob, 5, 5, P.dbone);

  // Hood
  rect(ctx, hx - 1, y - 2 - bob, 9, 3, P.d1);
  rect(ctx, hx, y - 3 - bob, 7, 2, P.cloak);
  // Hood shadow over face
  ctx.globalAlpha = 0.4;
  rect(ctx, hx + 1, y - bob, 5, 2, P.d1);
  ctx.globalAlpha = 1;

  // Eyes — glow in hood shadow
  const eyeY = y + 2 - bob;
  if (dir > 0) {
    px(ctx, hx + 2, eyeY, P.crimson); // left eye
    px(ctx, hx + 4, eyeY, P.crimson); // right eye
  } else {
    px(ctx, hx + 3, eyeY, P.crimson);
    px(ctx, hx + 5, eyeY, P.crimson);
  }

  // Occasional blink
  if (t % 240 < 4) {
    ctx.fillStyle = P.d1;
    ctx.fillRect(hx + 1, eyeY, 5, 1);
  }

  // Dust trail when walking
  if (moving && t % 6 === 0) {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = P.ash;
    ctx.fillRect(x + 5 + Math.random() * 4 - 2, y + 22, 1, 1);
    ctx.globalAlpha = 1;
  }
}
