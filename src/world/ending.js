// ═══════════════════════════════════════
// ENDING — final sequence
// ═══════════════════════════════════════
import { scaler } from '../render/scaler.js';
import { t } from '../core/time.js';

let active = false;
let phase = 0;
let timer = 0;

const TEXTS = [
  'Ardet.',
  'Латынь. «Горит».',
  'Ты прошёл сквозь огонь.',
  'Ты не потушил его.',
  'Никто не тушил.',
  'Мох запишет.',
  'Мох всегда записывал.',
  '',
  'Спасибо, что дочитал.',
];

export function trigger() {
  active = true;
  phase = 0;
  timer = 0;
}

export function isActive() { return active; }

export function draw(ctx) {
  if (!active) return;
  const vw = scaler.vw, vh = scaler.vh;
  timer++;

  // Fade to black
  const fadeIn = Math.min(1, timer / 120);
  ctx.globalAlpha = fadeIn;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, vw, vh);

  // Show texts sequentially
  if (timer > 60) {
    const textIdx = Math.min(TEXTS.length - 1, Math.floor((timer - 60) / 180));
    const text = TEXTS[textIdx];
    if (text) {
      const localT = (timer - 60) % 180;
      const textFade = localT < 30 ? localT / 30 : (localT > 150 ? (180 - localT) / 30 : 1);
      ctx.globalAlpha = fadeIn * textFade * 0.9;
      ctx.fillStyle = '#e8dcc8';
      ctx.font = '10px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText(text, vw / 2, vh / 2);
      ctx.textAlign = 'left';
    }
  }

  ctx.globalAlpha = 1;
}
