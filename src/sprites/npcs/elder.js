// ═══════════════════════════════════════
// ELDER / СТАРЕЦ — the Archivist who sits and writes.
// Hooded figure seated on a stone, scroll across the lap, quill that
// dips into an inkwell and writes. Breath is shallow. Pages drift
// around him. He is Ecclesiastes — what was, will be.
// ═══════════════════════════════════════
import { rect, px, dither } from '../../render/draw.js';
import { t } from '../../core/time.js';
import { X } from '../../render/context.js';

const P = {
  void: '#050408',
  d1: '#0a0a0a',
  cloakDark: '#1a1410',
  cloakMid: '#2a2018',
  cloakEdge: '#3a2a1a',
  bone: '#e8dcc8',
  dbone: '#a89878',
  parchment: '#d8c898',
  parchDim: '#a08868',
  parchDark: '#5a4828',
  inkBlack: '#0a0a0a',
  inkBlue:  '#1a1838',
  goldDim:  '#7a5a14',
  gold:     '#b8860b',
  emberRed: '#6b0f1a',
};

let npcProximity = 0;
export function setProximity(v) { npcProximity = v; }

// Pre-baked stack of dropped pages around the elder, scattered with
// hash-style determinism so they don't shimmer across frames.
function hashr(i, k) { return ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5) % 1 + 1) % 1; }

export function drawNPC_elder(ex, ey) {
  // Anchor: a 24×32 figure sitting on a low stone. ex,ey is top-left.
  const breath = Math.sin(t * 0.005) * 0.4;          // very slow
  const sway = Math.sin(t * 0.0035) * 0.3;
  const cx = ex + 12 + sway;
  // Quill animation cycle: 0..1, period ~6s. Phase 0..0.6 = writing,
  // 0.6..0.85 = lifting back to inkwell, 0.85..1 = dipping.
  const QUILL_PERIOD = 360;
  const qp = (t % QUILL_PERIOD) / QUILL_PERIOD;
  // Quill x position: travels from x=15 (far right of scroll) leftward
  // to x=8 while writing, then snaps back up to inkwell.
  let quillX, quillY, quillTilt;
  if (qp < 0.6) {
    // Writing across the page (slight wave for hand tremor)
    const w = qp / 0.6;
    quillX = ex + 8 + (1 - w) * 7;
    quillY = ey + 22 + Math.sin(t * 0.06) * 0.3;
    quillTilt = -0.6;
  } else if (qp < 0.85) {
    // Lift back toward inkwell
    const w = (qp - 0.6) / 0.25;
    quillX = ex + 8 + w * 12;
    quillY = ey + 22 - w * 6;
    quillTilt = -0.6 + w * 0.4;
  } else {
    // Dip
    const w = (qp - 0.85) / 0.15;
    const dipY = Math.sin(w * Math.PI) * 1.5;
    quillX = ex + 20;
    quillY = ey + 16 + dipY;
    quillTilt = -0.2;
  }
  const writing = qp < 0.6;
  // How far across the line we are (0..1) when writing — used to grow ink trail
  const writeProgress = writing ? qp / 0.6 : 1;

  // ═══ SHADOW ═══
  X.globalAlpha = 0.32;
  X.fillStyle = '#000';
  X.beginPath();
  X.ellipse(cx, ey + 36, 14, 2.4, 0, 0, Math.PI * 2);
  X.fill();
  X.globalAlpha = 1;

  // ═══ STONE / SITTING SEAT ═══
  // Low rough block under him
  rect(X, cx - 11, ey + 30, 22, 5, '#3a3028');
  rect(X, cx - 10, ey + 30, 20, 2, '#4a3e30');
  // Cracks
  px(X, cx - 5, ey + 32, '#1a1408');
  px(X, cx + 3, ey + 33, '#1a1408');
  // Edge moss tufts
  px(X, cx - 10, ey + 30, '#2a3a14');
  px(X, cx + 9, ey + 31, '#2a3a14');

  // ═══ DROPPED PAGES — scattered around the seat ═══
  for (let i = 0; i < 6; i++) {
    const px_ = cx - 14 + hashr(i, 11) * 28;
    const py_ = ey + 33 + hashr(i, 22) * 4;
    const pw_ = 4 + Math.floor(hashr(i, 33) * 3);
    const pal = hashr(i, 44) > 0.5 ? P.parchment : P.parchDim;
    rect(X, px_, py_, pw_, 3, pal);
    // Hint of writing
    px(X, px_ + 1, py_ + 1, P.parchDark);
    if (pw_ >= 5) px(X, px_ + 3, py_ + 1, P.parchDark);
  }

  // ═══ BODY — seated, knees up, cloak drapes over ═══
  // Lower cloak (covering folded legs)
  rect(X, cx - 9, ey + 22, 18, 10, P.cloakDark);
  rect(X, cx - 8, ey + 23, 16, 9, P.cloakMid);
  dither(X, cx - 7, ey + 24, 14, 7, P.cloakEdge, P.cloakMid, 0.25);
  // Knees pushing through the cloak (two soft bumps)
  rect(X, cx - 7, ey + 22, 4, 3, P.cloakMid);
  rect(X, cx + 3, ey + 22, 4, 3, P.cloakMid);
  px(X, cx - 6, ey + 22, P.cloakEdge);
  px(X, cx + 4, ey + 22, P.cloakEdge);
  // Cloak edge folds
  for (let i = 0; i < 4; i++) {
    const fx = cx - 7 + i * 5;
    px(X, fx, ey + 31, P.cloakEdge);
  }

  // Torso (slumped, leaning slightly toward the page)
  const torsoLean = -1; // forward lean
  rect(X, cx - 6 + torsoLean, ey + 12 - breath, 12, 11 + breath, P.cloakDark);
  rect(X, cx - 5 + torsoLean, ey + 13 - breath, 10, 10 + breath, P.cloakMid);
  // Chest fold
  rect(X, cx + torsoLean, ey + 14 - breath, 1, 8, P.cloakDark);

  // ═══ HOOD ═══
  const hx = cx - 5 + torsoLean;
  const hy = ey + 4;
  // Outer hood
  rect(X, hx - 2, hy + 1, 14, 8, P.cloakDark);
  rect(X, hx - 1, hy, 12, 7, P.cloakMid);
  rect(X, hx, hy - 1, 10, 6, P.cloakDark);
  // Inner shadow (face is mostly dark)
  rect(X, hx + 1, hy + 1, 8, 6, P.void);

  // Beard hanging out of hood — long, white, twitching gently
  const beardSway = Math.sin(t * 0.006) * 0.3;
  for (let i = 0; i < 5; i++) {
    const bw = 7 - i;
    rect(X, hx + 2 + Math.floor(beardSway), hy + 6 + i, bw, 1, i < 2 ? P.bone : P.dbone);
  }
  // Beard tail tip
  px(X, hx + 4 + Math.floor(beardSway), hy + 11, P.dbone);

  // ═══ FACE — only nose ridge and one tired eye visible in shadow ═══
  // Subtle nose
  px(X, hx + 5, hy + 4, P.dbone);
  px(X, hx + 5, hy + 5, P.dbone);
  // Eyes — usually closed (concentration), occasionally peek
  const eyesOpen = (Math.sin(t * 0.002) > 0.92) ? 1 : 0;
  if (eyesOpen) {
    px(X, hx + 3, hy + 3, P.emberRed);
    px(X, hx + 7, hy + 3, P.emberRed);
  } else {
    // Closed eyelids — thin dim line
    rect(X, hx + 3, hy + 3, 2, 1, P.cloakEdge);
    rect(X, hx + 6, hy + 3, 2, 1, P.cloakEdge);
  }

  // ═══ SCROLL across the lap ═══
  // Scroll body
  const scrollY = ey + 21;
  rect(X, cx - 9, scrollY, 18, 5, P.parchment);
  // Top edge (older shading)
  rect(X, cx - 9, scrollY, 18, 1, P.parchDim);
  // Curled ends — left
  rect(X, cx - 11, scrollY - 1, 2, 6, P.parchDim);
  px(X, cx - 11, scrollY + 5, P.parchDark);
  // Curled ends — right
  rect(X, cx + 9, scrollY - 1, 2, 6, P.parchDim);
  px(X, cx + 10, scrollY + 5, P.parchDark);
  // ── Written ink so far ──
  // The current line being written (animated, grows with writeProgress)
  const lineLen = Math.floor(writeProgress * 7);
  for (let i = 0; i < lineLen; i++) {
    px(X, cx - 8 + i, scrollY + 3, P.inkBlack);
    if (i % 2 === 0) px(X, cx - 8 + i, scrollY + 2, P.inkBlue);
  }
  // Older lines (always present)
  for (let i = 0; i < 14; i++) px(X, cx - 8 + i * 1, scrollY + 1, i % 3 === 0 ? P.inkBlue : P.inkBlack);

  // ═══ HANDS ═══
  // Left hand (rests on the scroll, holding it open)
  rect(X, cx - 9, scrollY + 1, 2, 2, P.dbone);
  px(X, cx - 9, scrollY, P.dbone);
  // Right hand (holds the quill — follows quill base)
  const rhx = quillX - 1;
  const rhy = quillY + 1;
  rect(X, rhx, rhy, 2, 2, P.dbone);

  // ═══ INKWELL beside him on the stone ═══
  rect(X, cx + 12, ey + 23, 4, 4, '#2a1a08');
  rect(X, cx + 13, ey + 22, 2, 1, '#4a3018');
  px(X, cx + 14, ey + 24, P.inkBlue);
  // Inkwell rim shine
  px(X, cx + 13, ey + 23, '#5a4028');

  // ═══ QUILL ═══
  // Drawn rotated using the tilt angle
  const cosA = Math.cos(quillTilt), sinA = Math.sin(quillTilt);
  // Feather (segment 0..-7 along axis from quill base going up-right)
  for (let s = 0; s < 8; s++) {
    const px_ = Math.round(quillX - s * cosA + 0);
    const py_ = Math.round(quillY - s * sinA);
    const col = s < 2 ? P.bone : (s < 5 ? P.dbone : '#7a6850');
    px(X, px_, py_, col);
    // Vane fringe
    if (s > 1 && s < 6) {
      px(X, Math.round(quillX - s * cosA - 1 * sinA), Math.round(quillY - s * sinA + 1 * cosA), '#5a4828');
    }
  }
  // Tip touches the page when writing — nib
  if (writing) {
    px(X, Math.round(quillX), Math.round(quillY), P.inkBlack);
  } else {
    // Drop of ink hangs at the tip when lifting/dipping
    px(X, Math.round(quillX), Math.round(quillY), P.inkBlue);
  }

  // ═══ INK SPLATTERS — occasional ═══
  if (writing && t % 200 < 4) {
    px(X, cx - 5 + Math.floor(Math.random() * 4), scrollY + 4, P.inkBlue);
  }

  // ═══ FLOATING PAGE — occasionally one drifts up off the seat ═══
  const driftPh = (t * 0.0025) % 1;
  if (driftPh < 0.7) {
    const dx_ = cx + 6 + Math.sin(driftPh * 8) * 4;
    const dy_ = ey + 28 - driftPh * 22;
    X.globalAlpha = 0.55 * (1 - driftPh / 0.7);
    rect(X, dx_, dy_, 4, 3, P.parchment);
    px(X, dx_ + 1, dy_ + 1, P.parchDark);
    X.globalAlpha = 1;
  }

  // ═══ PROXIMITY — soft warm halo from the page ═══
  if (npcProximity > 0.15) {
    X.globalAlpha = npcProximity * 0.18;
    const halo = X.createRadialGradient(cx, scrollY + 2, 4, cx, scrollY + 2, 26);
    halo.addColorStop(0, '#b8860b');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    X.fillStyle = halo;
    X.fillRect(cx - 26, scrollY - 14, 52, 32);
    X.globalAlpha = 1;
  }
}
