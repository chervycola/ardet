// ═══════════════════════════════════════
// PLAYER sprite — the wanderer, cloaked, chest-fire
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
  boneHand: '#c8b8a8',
  // Chest fire palette (from core to halo)
  fireCore: '#fff4c8',
  fireHot:  '#ffb040',
  fireMid:  '#e06018',
  fireDim:  '#7a1410',
  ember:    '#ff8030',
  gold:     '#b8860b',
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
  const sway = Math.sin(t * 0.02) * 0.6;  // gentle cloak sway
  const firePulse = 0.7 + 0.3 * Math.sin(t * 0.18);
  const fireFlicker = 0.85 + 0.15 * Math.sin(t * 0.45 + Math.sin(t * 0.1) * 2);

  // ═══ SHADOW ═══
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x + 7, y + 22, 7 + (moving ? 1 : 0), 2.2, 0, 0, Math.PI * 2);
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

  // ═══ LEGS (peek from under cloak) ═══
  const legL = moving ? walkPhase * 2 : 0;
  const legR = moving ? -walkPhase * 2 : 0;
  rect(ctx, x + 4, y + 18 - bob, 2, 4 + legL, P.shadow);
  rect(ctx, x + 7, y + 18 - bob, 2, 4 + legR, P.shadow);
  // Boots
  rect(ctx, x + 3, y + 21 + legL - bob, 3, 2, P.void);
  rect(ctx, x + 7, y + 21 + legR - bob, 3, 2, P.void);

  // ═══ CLOAK BODY — flares outward at hem ═══
  // Narrow at shoulders, wider at hem; gentle sway
  const cbx = x + sway;
  // Upper torso
  rect(ctx, cbx + 1, y + 5 - bob + breath, 11, 6, P.cloakMid);
  rect(ctx, cbx + 2, y + 6 - bob + breath, 9, 5, P.cloakDark);
  // Lower cloak (flared hem)
  rect(ctx, cbx + 0, y + 11 - bob, 13, 7, P.cloakMid);
  rect(ctx, cbx + 1, y + 12 - bob, 11, 6, P.cloakDark);
  // Hem ripple (edge highlights suggesting folds)
  const hemPh = Math.sin(t * 0.06) * 0.5;
  px(ctx, cbx + 0, y + 17 - bob + hemPh, P.cloakEdge);
  px(ctx, cbx + 4, y + 18 - bob, P.cloakEdge);
  px(ctx, cbx + 8, y + 18 - bob - hemPh, P.cloakEdge);
  px(ctx, cbx + 12, y + 17 - bob + hemPh, P.cloakEdge);
  // Vertical cloak fold line
  rect(ctx, cbx + 6, y + 7 - bob, 1, 11, P.void);

  // ═══ ARMS (hands peek from cloak) ═══
  const armSwing = moving ? Math.sin(t * 0.22 + 0.5) * 1.2 : 0;
  // Arms are mostly hidden under cloak; only hands visible
  px(ctx, cbx + 0 - armSwing * 0.4, y + 13 - bob, P.boneHand);
  px(ctx, cbx + 12 + armSwing * 0.4, y + 13 - bob, P.boneHand);

  // ═══ CHEST FIRE — pulsing ember in the heart of the cloak ═══
  const fx_ = cbx + 5;
  const fy_ = y + 9 - bob;
  // Outer halo (additive-like via alpha)
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
  // Outer hood silhouette
  rect(ctx, hx - 1, hy + 1, 11, 6, P.void);
  rect(ctx, hx, hy, 9, 6, P.cloakDark);
  // Hood shoulders/drape
  rect(ctx, hx - 1, hy + 5, 11, 3, P.cloakMid);
  px(ctx, hx - 1, hy + 4, P.cloakMid);
  px(ctx, hx + 9, hy + 4, P.cloakMid);
  // Hood inner shadow — completely dark face
  rect(ctx, hx + 1, hy + 2, 7, 5, P.void);

  // ═══ FACE VOID with glowing eyes — two faint embers inside the hood ═══
  const eyeY = hy + 4;
  const eyePulse = 0.55 + 0.25 * Math.sin(t * 0.12);
  ctx.globalAlpha = eyePulse;
  if (dir > 0) {
    px(ctx, hx + 3, eyeY, P.ember);
    px(ctx, hx + 5, eyeY, P.ember);
  } else {
    px(ctx, hx + 3, eyeY, P.ember);
    px(ctx, hx + 5, eyeY, P.ember);
  }
  // Eye inner glow (brighter core)
  ctx.globalAlpha = eyePulse * 0.7;
  ctx.fillStyle = P.fireHot;
  ctx.fillRect(hx + 3, eyeY, 1, 1);
  ctx.fillRect(hx + 5, eyeY, 1, 1);
  ctx.globalAlpha = 1;

  // Occasional blink (embers briefly darken)
  if (t % 260 < 5) {
    ctx.fillStyle = P.void;
    ctx.fillRect(hx + 2, eyeY, 5, 1);
  }

  // Dust trail when walking
  if (moving && t % 6 === 0) {
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#8a8d8f';
    ctx.fillRect(x + 5 + Math.random() * 4 - 2, y + 22, 1, 1);
    ctx.globalAlpha = 1;
  }
}
