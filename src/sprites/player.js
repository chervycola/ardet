// ═══════════════════════════════════════
// PLAYER sprite — the wanderer: floating cloaked figure with chest-fire
// No visible arms or legs — just a robed silhouette glowing from within.
// ═══════════════════════════════════════
import { rect, px } from '../render/draw.js';
import { X } from '../render/context.js';
import { t } from '../core/time.js';

const P = {
  void: '#050408',
  shadow: '#0a0a0a',
  cloakDark: '#12101a',
  cloakMid: '#1e1a28',
  cloakEdge: '#2a2032',
  // Chest fire palette (from core to halo)
  fireCore: '#fff4c8',
  fireHot:  '#ffb040',
  fireMid:  '#e06018',
  fireDim:  '#7a1410',
  ember:    '#ff8030',
};

export function drawPlayer(player) {
  const ctx = X;
  const x = Math.floor(player.x);
  const y = Math.floor(player.y);
  const dir = player.dir || 1;
  const moving = player.moving;
  // Float bob — gentler than walking, since there are no legs to animate
  const bob = Math.sin(t * 0.04) * 1.2 + (moving ? Math.abs(Math.sin(t * 0.18)) * 0.6 : 0);
  const breath = Math.sin(t * 0.015) * 0.5;
  const sway = Math.sin(t * 0.02) * 0.6;
  const firePulse = 0.7 + 0.3 * Math.sin(t * 0.18);
  const fireFlicker = 0.85 + 0.15 * Math.sin(t * 0.45 + Math.sin(t * 0.1) * 2);

  // ═══ SHADOW (oval below the floating figure) ═══
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x + 7, y + 23, 7, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Chest fire warms the ground
  ctx.globalAlpha = 0.18 * firePulse;
  const fireGlow = ctx.createRadialGradient(x + 6, y + 11, 1, x + 6, y + 11, 22);
  fireGlow.addColorStop(0, P.fireHot);
  fireGlow.addColorStop(0.5, 'rgba(224,96,24,0.4)');
  fireGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fireGlow;
  ctx.fillRect(x - 16, y - 6, 44, 34);
  ctx.globalAlpha = 1;

  // ═══ CLOAK BODY — narrow at top, flared, tapers to a hem above the ground ═══
  const cbx = x + sway;
  // Upper torso
  rect(ctx, cbx + 1, y + 5 - bob + breath, 11, 6, P.cloakMid);
  rect(ctx, cbx + 2, y + 6 - bob + breath, 9, 5, P.cloakDark);
  // Mid cloak
  rect(ctx, cbx + 0, y + 11 - bob, 13, 7, P.cloakMid);
  rect(ctx, cbx + 1, y + 12 - bob, 11, 6, P.cloakDark);
  // Lower hem — uneven, flares, drifts in the wind
  const hemPh = Math.sin(t * 0.06) * 0.5;
  rect(ctx, cbx - 1, y + 18 - bob, 15, 4, P.cloakMid);
  rect(ctx, cbx + 0, y + 19 - bob, 13, 3, P.cloakDark);
  // Hem ripple (edge highlights suggesting folds)
  px(ctx, cbx - 1, y + 21 - bob + hemPh, P.cloakEdge);
  px(ctx, cbx + 4, y + 22 - bob, P.cloakEdge);
  px(ctx, cbx + 8, y + 22 - bob - hemPh, P.cloakEdge);
  px(ctx, cbx + 13, y + 21 - bob + hemPh, P.cloakEdge);
  // Vertical cloak fold line
  rect(ctx, cbx + 6, y + 7 - bob, 1, 14, P.void);

  // ═══ CHEST FIRE — pulsing ember in the heart of the cloak ═══
  const fx_ = cbx + 5;
  const fy_ = y + 9 - bob;
  ctx.globalAlpha = 0.55 * firePulse;
  rect(ctx, fx_ - 1, fy_, 5, 4, P.fireDim);
  ctx.globalAlpha = 0.75 * firePulse;
  rect(ctx, fx_, fy_, 3, 3, P.fireMid);
  ctx.globalAlpha = 0.9 * fireFlicker;
  rect(ctx, fx_ + 1, fy_, 1, 3, P.fireHot);
  px(ctx, fx_ + 1, fy_ - 1, P.fireCore);
  px(ctx, fx_ + 1, fy_ + 1, P.fireCore);
  ctx.globalAlpha = 1;

  // Rising ember sparks from chest — occasional
  if (t % 8 === 0 && Math.random() > 0.4) {
    const sp = (t / 8) % 3;
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = P.ember;
    ctx.fillRect(fx_ + 1 + Math.sin(t * 0.1) * 2, fy_ - 2 - sp, 1, 1);
    ctx.globalAlpha = 1;
  }

  // ═══ HOOD — dramatic, deep shadow, obscures face ═══
  const hx = cbx + 2;
  const hy = y - 3 - bob;
  rect(ctx, hx - 1, hy + 1, 11, 6, P.void);
  rect(ctx, hx, hy, 9, 6, P.cloakDark);
  rect(ctx, hx - 1, hy + 5, 11, 3, P.cloakMid);
  px(ctx, hx - 1, hy + 4, P.cloakMid);
  px(ctx, hx + 9, hy + 4, P.cloakMid);
  rect(ctx, hx + 1, hy + 2, 7, 5, P.void);

  // ═══ FACE VOID with two faint ember eyes ═══
  const eyeY = hy + 4;
  const eyePulse = 0.55 + 0.25 * Math.sin(t * 0.12);
  ctx.globalAlpha = eyePulse;
  px(ctx, hx + 3, eyeY, P.ember);
  px(ctx, hx + 5, eyeY, P.ember);
  ctx.globalAlpha = eyePulse * 0.7;
  ctx.fillStyle = P.fireHot;
  ctx.fillRect(hx + 3, eyeY, 1, 1);
  ctx.fillRect(hx + 5, eyeY, 1, 1);
  ctx.globalAlpha = 1;
  if (t % 260 < 5) {
    ctx.fillStyle = P.void;
    ctx.fillRect(hx + 2, eyeY, 5, 1);
  }
  // dir is intentionally unused — the face is a void, no asymmetry
  void dir;
}

