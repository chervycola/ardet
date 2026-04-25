// ═══════════════════════════════════════
// THE JESTER — half-Shiva: three arms (one from behind), juggles daggers
// ═══════════════════════════════════════
import { rect, px, dither } from '../../render/draw.js';
import { t } from '../../core/time.js';
import { X } from '../../render/context.js';

const P = {
  d1: '#0a0a0a',
  dgrey: '#2a2a2a',
  ash: '#8a8d8f',
  bone: '#e8dcc8',
  dbone: '#c8b8a8',
  crimson: '#6b0f1a',
  dcrimson: '#3a0810',
  gold: '#b8860b',
  amber: '#daa520',
  sunflower: '#f4d03f',
  steel: '#b8b8c8',
  bladeEdge: '#ffffff',
};

let npcProximity = 0;
export function setProximity(v) { npcProximity = v; }

// ── Juggling pattern ──
// Three daggers in a 3-ball cascade. Each dagger has a phase 120° apart.
// Hands cycle: L → R → BACK → L → R → BACK ...
// We compute the world position of a dagger as it travels along the parabolic
// throw arc between two hands.
const TOSS_PERIOD = 120; // frames per half-cycle (one toss)
const ARMS = 3;

// Returns { x, y, angle } for a dagger at frame f given index i (0..2).
function daggerPos(f, i, hands) {
  const phase = (f + (i * TOSS_PERIOD * 2 / ARMS)) % (TOSS_PERIOD * ARMS);
  const handIdx = Math.floor(phase / TOSS_PERIOD);
  const localT = (phase % TOSS_PERIOD) / TOSS_PERIOD; // 0..1
  const fromHand = hands[handIdx % ARMS];
  const toHand = hands[(handIdx + 1) % ARMS];
  // Parabolic toss
  const x = fromHand.x + (toHand.x - fromHand.x) * localT;
  const y = fromHand.y + (toHand.y - fromHand.y) * localT - Math.sin(localT * Math.PI) * 18;
  // Spinning blade — full revolution per toss
  const angle = localT * Math.PI * 2 + i * Math.PI * 0.7;
  return { x, y, angle };
}

function drawDagger(cx, cy, angle) {
  // Pixel-art dagger ~7px long, drawn rotated.
  const cosA = Math.cos(angle), sinA = Math.sin(angle);
  // Length 0..6 along blade axis (0 = pommel, 6 = tip)
  // -1..1 perpendicular
  const segments = [
    // pos along, perp, color
    [-1, 0, P.gold],         // pommel
    [0, 0, P.dgrey],          // hilt
    [1, 0, P.dgrey],          // hilt
    [2, 0, P.gold],           // crossguard center
    [2, -1, P.gold],          // crossguard left
    [2, 1, P.gold],           // crossguard right
    [3, 0, P.steel],          // blade
    [4, 0, P.steel],
    [5, 0, P.bladeEdge],
    [6, 0, P.bladeEdge],      // tip
  ];
  for (const [along, perp, color] of segments) {
    const x = Math.round(cx + along * cosA - perp * sinA);
    const y = Math.round(cy + along * sinA + perp * cosA);
    px(X, x, y, color);
  }
}

export function drawNPC_jester(jx, jy) {
  // Sprite anchor: ~24px wide centered on jx+12.
  const bob = Math.sin(t * 0.007) * 1.2;
  const breath = Math.sin(t * 0.01) * 0.7;
  const lean = Math.sin(t * 0.004) * 0.8;
  const by = jy + bob;
  const bx = jx + lean;
  const cx = bx + 12;

  // ═══ SHADOW ═══
  X.globalAlpha = 0.3;
  X.fillStyle = '#000';
  X.beginPath();
  X.ellipse(cx, jy + 50, 11 + Math.abs(lean), 2.5, 0, 0, Math.PI * 2);
  X.fill();
  X.globalAlpha = 1;

  // ═══ LEGS — long, thin, harlequin diamonds, one slightly bent ═══
  const llBend = Math.sin(t * 0.005) * 0.6;
  const rlBend = -llBend;
  // Left leg
  rect(X, bx + 7, by + 28 + llBend, 3, 16 - llBend, P.d1);
  for (let i = 0; i < 6; i++) {
    const dc = i % 2 === 0 ? P.crimson : P.bone;
    px(X, bx + 8, by + 30 + i * 2 + llBend, dc);
  }
  // Right leg
  rect(X, bx + 14, by + 28 + rlBend, 3, 16 - rlBend, P.d1);
  for (let i = 0; i < 6; i++) {
    const dc = i % 2 === 0 ? P.bone : P.crimson;
    px(X, bx + 15, by + 30 + i * 2 + rlBend, dc);
  }

  // ═══ POINTED CURLED SHOES with bells ═══
  // Left shoe
  rect(X, bx + 5, by + 44, 5, 2, P.d1);
  rect(X, bx + 3, by + 43, 3, 2, P.d1);
  px(X, bx + 2, by + 42, P.d1);
  const bellL = Math.sin(t * 0.012) * 1;
  px(X, bx + 1, by + 41 + bellL, P.gold);
  px(X, bx + 2, by + 41 + bellL, P.sunflower);
  // Right shoe
  rect(X, bx + 14, by + 44, 5, 2, P.d1);
  rect(X, bx + 18, by + 43, 3, 2, P.d1);
  px(X, bx + 21, by + 42, P.d1);
  const bellR = Math.sin(t * 0.011 + 1.5) * 1;
  px(X, bx + 22, by + 41 + bellR, P.gold);
  px(X, bx + 23, by + 41 + bellR, P.sunflower);

  // ═══ TORSO — narrow harlequin doublet ═══
  // Main body block
  rect(X, bx + 7, by + 14 - breath, 11, 14 + breath, P.d1);
  dither(X, bx + 8, by + 15 - breath, 9, 12 + breath, P.crimson, P.d1, 0.45);
  // Center diamond stripe
  for (let i = 0; i < 6; i++) {
    px(X, bx + 12, by + 15 + i * 2 - breath, P.bone);
    px(X, bx + 12, by + 16 + i * 2 - breath, P.crimson);
  }
  // Belt
  rect(X, bx + 7, by + 26, 11, 1, P.dgrey);
  px(X, bx + 12, by + 26, P.gold);

  // ═══ THREE-ARM SHIVA SETUP ═══
  // Hand positions form a triangle in screen space; daggers cycle between them.
  const armSway = Math.sin(t * 0.008) * 0.5;
  const armSway2 = Math.cos(t * 0.011) * 0.5;
  // Left front hand — held high to the left
  const handL = { x: cx - 9 + armSway, y: by + 10 - armSway2 };
  // Right front hand — held high to the right
  const handR = { x: cx + 9 - armSway, y: by + 10 + armSway2 };
  // Back hand — emerges from BEHIND the head/torso, reaches up over the shoulder
  const handB = { x: cx + Math.sin(t * 0.01) * 2, y: by - 4 + Math.cos(t * 0.01) * 1.5 };
  const hands = [handL, handR, handB];

  // Draw shoulders
  rect(X, bx + 5, by + 14 - breath, 3, 3, P.d1);
  rect(X, bx + 16, by + 14 - breath, 3, 3, P.d1);

  // ── BACK ARM (drawn FIRST so it sits behind torso/head) ──
  // Curves up from behind the body and reaches over
  X.strokeStyle = P.dcrimson;
  X.lineWidth = 2;
  X.beginPath();
  // Origin: behind the spine, just below the head
  const backOrigin = { x: cx + 1, y: by + 12 - breath };
  // Control point arcs up and behind
  X.moveTo(backOrigin.x, backOrigin.y);
  X.bezierCurveTo(
    backOrigin.x + 4, backOrigin.y - 6,
    handB.x + 3, handB.y - 4,
    handB.x, handB.y,
  );
  X.stroke();
  X.lineWidth = 1;
  // Stripe along the back arm (suggests harlequin sleeve)
  X.strokeStyle = P.bone;
  X.globalAlpha = 0.6;
  X.beginPath();
  X.moveTo(backOrigin.x, backOrigin.y);
  X.bezierCurveTo(
    backOrigin.x + 4, backOrigin.y - 6,
    handB.x + 3, handB.y - 4,
    handB.x, handB.y,
  );
  X.stroke();
  X.globalAlpha = 1;
  // Hand
  px(X, handB.x, handB.y, P.bone);
  px(X, handB.x - 1, handB.y, P.dbone);

  // ═══ HEAD — narrow skull, jester mask ═══
  const headTilt = Math.sin(t * 0.006) * 1.2;
  const hx = bx + 7 + headTilt * 0.2;
  const hy = by + 1;
  rect(X, hx, hy, 10, 11, P.bone);
  rect(X, hx + 1, hy + 1, 8, 9, '#2a2018');
  // Sunken cheeks
  px(X, hx, hy + 5, '#c8b8a0');
  px(X, hx + 9, hy + 5, '#c8b8a0');
  // Eyes — crimson embers
  px(X, hx + 2, hy + 4, P.crimson);
  px(X, hx + 3, hy + 4, P.crimson);
  px(X, hx + 6, hy + 4, P.crimson);
  px(X, hx + 7, hy + 4, P.crimson);
  X.globalAlpha = 0.25 + 0.1 * Math.sin(t * 0.01);
  px(X, hx + 2, hy + 3, P.crimson);
  px(X, hx + 7, hy + 3, P.crimson);
  X.globalAlpha = 1;
  // Painted tear (jester makeup)
  px(X, hx + 3, hy + 5, P.crimson);
  // Nose hole
  px(X, hx + 4, hy + 7, P.d1);
  px(X, hx + 5, hy + 7, P.d1);
  // Grin
  for (let i = 0; i < 6; i++) px(X, hx + 2 + i, hy + 9, i % 2 ? P.bone : P.d1);
  rect(X, hx + 2, hy + 10, 6, 1, '#2a2018');

  // ═══ JESTER CAP — three horns with bells ═══
  rect(X, hx - 1, hy - 1, 12, 3, P.crimson);
  dither(X, hx, hy - 1, 10, 2, P.d1, P.crimson, 0.3);
  // Horn 1 — left
  const h1s = Math.sin(t * 0.009) * 2;
  rect(X, hx - 3 + h1s * 0.2, hy - 3, 4, 3, P.crimson);
  rect(X, hx - 5 + h1s * 0.4, hy - 6, 3, 4, P.crimson);
  rect(X, hx - 7 + h1s * 0.6, hy - 9, 2, 4, P.crimson);
  const bell1Bob = Math.sin(t * 0.012 + 0.3) * 1.3;
  px(X, hx - 8 + h1s * 0.7, hy - 10 + bell1Bob, P.gold);
  px(X, hx - 7 + h1s * 0.7, hy - 10 + bell1Bob, P.gold);
  px(X, hx - 8 + h1s * 0.7, hy - 9 + bell1Bob, P.sunflower);
  // Horn 2 — center, tallest
  const h2s = Math.sin(t * 0.011 + 1) * 1.5;
  rect(X, hx + 3, hy - 4, 4, 3, P.crimson);
  rect(X, hx + 3 + h2s * 0.15, hy - 8, 3, 5, P.crimson);
  rect(X, hx + 3 + h2s * 0.25, hy - 12, 3, 5, P.crimson);
  const bell2Bob = Math.sin(t * 0.01 + 1.5) * 1.2;
  px(X, hx + 4 + h2s * 0.3, hy - 13 + bell2Bob, P.gold);
  px(X, hx + 5 + h2s * 0.3, hy - 13 + bell2Bob, P.gold);
  px(X, hx + 4 + h2s * 0.3, hy - 12 + bell2Bob, P.sunflower);
  // Horn 3 — right
  const h3s = Math.sin(t * 0.008 + 2.5) * 2;
  rect(X, hx + 9 + h3s * 0.2, hy - 3, 4, 3, P.crimson);
  rect(X, hx + 12 + h3s * 0.4, hy - 6, 3, 4, P.crimson);
  rect(X, hx + 14 + h3s * 0.6, hy - 9, 2, 4, P.crimson);
  const bell3Bob = Math.sin(t * 0.013 + 2) * 1.3;
  px(X, hx + 16 + h3s * 0.7, hy - 10 + bell3Bob, P.gold);
  px(X, hx + 15 + h3s * 0.7, hy - 10 + bell3Bob, P.gold);
  px(X, hx + 16 + h3s * 0.7, hy - 9 + bell3Bob, P.sunflower);

  // ── TWO FRONT ARMS — drawn AFTER head so they sit on top ──
  // Left arm
  X.strokeStyle = P.d1;
  X.lineWidth = 2;
  const lShoulder = { x: bx + 6, y: by + 16 - breath };
  X.beginPath();
  X.moveTo(lShoulder.x, lShoulder.y);
  X.quadraticCurveTo(lShoulder.x - 3, by + 12, handL.x, handL.y);
  X.stroke();
  // Sleeve diamonds
  X.lineWidth = 1;
  X.strokeStyle = P.crimson;
  X.beginPath();
  X.moveTo(lShoulder.x, lShoulder.y);
  X.quadraticCurveTo(lShoulder.x - 3, by + 12, handL.x, handL.y);
  X.stroke();
  px(X, handL.x, handL.y, P.bone);
  // Right arm
  X.lineWidth = 2;
  X.strokeStyle = P.d1;
  const rShoulder = { x: bx + 18, y: by + 16 - breath };
  X.beginPath();
  X.moveTo(rShoulder.x, rShoulder.y);
  X.quadraticCurveTo(rShoulder.x + 3, by + 12, handR.x, handR.y);
  X.stroke();
  X.lineWidth = 1;
  X.strokeStyle = P.bone;
  X.beginPath();
  X.moveTo(rShoulder.x, rShoulder.y);
  X.quadraticCurveTo(rShoulder.x + 3, by + 12, handR.x, handR.y);
  X.stroke();
  px(X, handR.x, handR.y, P.bone);

  // ═══ DAGGERS — three of them, in cascade ═══
  for (let i = 0; i < 3; i++) {
    const d = daggerPos(t, i, hands);
    drawDagger(d.x, d.y, d.angle);
    // Faint motion blur trail
    if (i === 0) {
      X.globalAlpha = 0.18;
      const prev = daggerPos(t - 2, i, hands);
      drawDagger(prev.x, prev.y, prev.angle);
      X.globalAlpha = 1;
    }
  }

  // ═══ MENACING AURA on proximity ═══
  X.globalAlpha = 0.08 + 0.05 * Math.sin(t * 0.007) + npcProximity * 0.1;
  X.strokeStyle = P.crimson;
  X.lineWidth = 1;
  X.beginPath();
  X.arc(cx, by + 18, 20 + npcProximity * 4, 0, Math.PI * 2);
  X.stroke();
  X.globalAlpha = 1;

  // ═══ "ХА!" laugh on proximity ═══
  if (npcProximity > 0.3 && t % 80 < 20) {
    const laughPh = (t % 80) / 20;
    X.globalAlpha = (1 - laughPh) * npcProximity * 0.7;
    X.fillStyle = P.crimson;
    X.font = '6px "Press Start 2P"';
    X.fillText('ХА!', cx + 12 - laughPh * 2, hy - 10 - laughPh * 4);
    X.globalAlpha = 1;
  }
}
