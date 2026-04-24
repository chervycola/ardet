// ═══════════════════════════════════════
// LORE POPUP — shows collected fragment text with typing + burn animation
// ═══════════════════════════════════════
import { scaler } from '../render/scaler.js';
import { t } from '../core/time.js';

// Per-character pacing (in frames @ 60fps)
const TYPE_SPEED = 3;    // time to type one char
const READ_SPEED = 4.5;  // extra dwell time per char after typing finishes
const BURN_SPEED = 2;    // time per char during burn animation
const MIN_HOLD = 360;    // floor on read dwell — ~6s even for tiny fragments
const TAIL_FADE = 80;    // fade-out after burn

const state = {
  text: '',
  life: 0,
  totalLife: 0,
  startFrame: 0,
};

function computeLife(text) {
  const n = text.length;
  const typeTime = n * TYPE_SPEED;
  const hold = Math.max(MIN_HOLD, Math.floor(n * READ_SPEED));
  const burnTime = n * BURN_SPEED;
  return typeTime + hold + burnTime + TAIL_FADE;
}

export function showLore(text) {
  state.text = text;
  state.totalLife = computeLife(text);
  state.life = state.totalLife;
  state.startFrame = t;
}

export function draw(ctx) {
  if (state.life <= 0) return;
  const elapsed = t - state.startFrame;
  const totalLen = state.text.length;
  const typeDone = Math.floor(elapsed / TYPE_SPEED);
  const charCount = Math.min(totalLen, typeDone);
  const fullyTyped = charCount >= totalLen;

  // Hold the fully-typed text for a while before burning so it can be read.
  const burnDelay = Math.max(MIN_HOLD, Math.floor(totalLen * READ_SPEED));
  let burnCount = 0;
  if (fullyTyped) {
    const burnElapsed = elapsed - totalLen * TYPE_SPEED - burnDelay;
    if (burnElapsed > 0) burnCount = Math.min(totalLen, Math.floor(burnElapsed / BURN_SPEED));
  }

  const visStart = burnCount;
  const visEnd = charCount;
  const visible = state.text.substring(visStart, visEnd);

  // Panel
  const vw = scaler.vw, vh = scaler.vh;
  const w = Math.min(vw - 16, 360);
  const FONT_SIZE = 9, CHAR_W = 9, LINE_H = 14;
  const maxChars = Math.floor((w - 20) / CHAR_W);
  const estLines = Math.max(3, Math.ceil(visible.length / maxChars) + 1);
  const boxH = Math.min(vh - 30, Math.max(60, estLines * LINE_H + 16));
  const x_ = (vw - w) / 2;
  const y_ = vh - boxH - 8;

  const a = state.life > TAIL_FADE ? Math.min(1, (state.totalLife - state.life) / 60) : state.life / TAIL_FADE;
  ctx.globalAlpha = a * 0.95;

  ctx.fillStyle = 'rgba(5,5,16,0.96)';
  ctx.fillRect(x_, y_, w, boxH);
  ctx.strokeStyle = '#6b0f1a';
  ctx.lineWidth = 1;
  ctx.strokeRect(x_, y_, w, boxH);
  ctx.fillStyle = '#b8860b';
  ctx.fillRect(x_ + 1, y_ + 1, w - 2, 1);

  ctx.font = FONT_SIZE + 'px "Press Start 2P","VT323",monospace';

  // Burning edge (ember glow)
  if (burnCount > 0) {
    const burnFrac = burnCount / totalLen;
    const emberR = Math.floor(180 + burnFrac * 75);
    const emberChars = Math.min(3, totalLen - burnCount);
    const emberTxt = state.text.substring(Math.max(0, visStart - emberChars), visStart);
    if (emberTxt) {
      ctx.fillStyle = `rgba(${emberR},60,10,${0.6 - burnFrac * 0.3})`;
      ctx.fillText(emberTxt, x_ + 10, y_ + 18);
    }
  }

  // Main text
  ctx.fillStyle = '#e8dcc8';
  const words = visible.split(' ');
  let line = '';
  let ly = y_ + 18;
  for (let word of words) {
    while (word.length > maxChars) {
      if (line.trim()) { ctx.fillText(line, x_ + 10, ly); ly += LINE_H; line = ''; }
      ctx.fillText(word.substring(0, maxChars), x_ + 10, ly); ly += LINE_H;
      word = word.substring(maxChars);
    }
    if ((line + word).length > maxChars) {
      ctx.fillText(line, x_ + 10, ly); ly += LINE_H; line = word + ' ';
    } else line += word + ' ';
  }
  if (line.trim()) ctx.fillText(line, x_ + 10, ly);

  // Cursor
  if (!fullyTyped && t % 40 < 20) {
    const cursorX = x_ + 10 + line.length * CHAR_W;
    ctx.fillStyle = '#1a8c1a';
    ctx.fillRect(cursorX, ly - FONT_SIZE, 5, FONT_SIZE + 1);
  }

  // When fully burned, collapse to the tail fade
  if (burnCount >= totalLen && state.life > TAIL_FADE) state.life = TAIL_FADE;

  ctx.globalAlpha = 1;
  state.life--;
}
