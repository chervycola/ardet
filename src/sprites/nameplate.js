// ═══════════════════════════════════════
// NAMEPLATE — small label drawn above a figure
// ═══════════════════════════════════════
import { X } from '../render/context.js';

// Draws a tiny pixel-font name above a figure, with subtle fade-in based on
// proximity (or always-on if `prox` omitted).
//   x,y   — top-left of the figure's bounding box
//   w     — width of the figure (label is centered horizontally on x + w/2)
//   name  — text to draw
//   color — text color
//   prox  — 0..1 visibility multiplier (default 1)
export function drawNameplate(x, y, w, name, color = '#e8dcc8', prox = 1) {
  if (prox <= 0.02) return;
  const cx = Math.floor(x + w / 2);
  const ly = Math.floor(y) - 4;
  X.save();
  X.font = '5px "Press Start 2P","VT323",monospace';
  X.textAlign = 'center';
  // Soft dark drop-shadow for legibility on any background
  X.globalAlpha = 0.5 * prox;
  X.fillStyle = '#000';
  X.fillText(name, cx + 1, ly + 1);
  // Foreground
  X.globalAlpha = 0.85 * prox;
  X.fillStyle = color;
  X.fillText(name, cx, ly);
  X.restore();
  X.textAlign = 'left';
  X.globalAlpha = 1;
}
