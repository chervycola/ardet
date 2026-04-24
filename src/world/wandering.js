// ═══════════════════════════════════════
// WANDERING — roaming NPCs and pets
// Jester wanders the map and leaves graffiti
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { X } from '../render/context.js';
import { drawNPC_jester } from '../sprites/npcs/jester.js';
import { MW, MH } from './terrain.js';

const jesterPos = { x: 1500, y: 400 };
const jesterTarget = { x: 1500, y: 400 };
let jesterWait = 0;
const jesterGraffiti = [];

const JESTER_PHRASES = [
  'ардет',
  '…',
  'tam?',
  'нет',
  'всё',
  'смеюсь',
  '☠',
];

export function updateJester(camera) {
  if (jesterWait > 0) { jesterWait--; return; }
  const dx = jesterTarget.x - jesterPos.x;
  const dy = jesterTarget.y - jesterPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 10) {
    jesterWait = 180 + Math.floor(Math.random() * 300);
    if (Math.random() > 0.6 && jesterGraffiti.length < 15) {
      jesterGraffiti.push({
        x: jesterPos.x,
        y: jesterPos.y + 15,
        text: JESTER_PHRASES[Math.floor(Math.random() * JESTER_PHRASES.length)],
      });
    }
    jesterTarget.x = 100 + Math.random() * (MW - 200);
    jesterTarget.y = 200 + Math.random() * (MH - 400);
  } else {
    const spd = 0.8;
    jesterPos.x += (dx / dist) * spd;
    jesterPos.y += (dy / dist) * spd;
  }
}

export function drawJesterWandering(camera, locations) {
  const sx = Math.floor(jesterPos.x - camera.x);
  const sy = Math.floor(jesterPos.y - camera.y);
  // Cull off-screen
  if (sx < -40 || sx > 800 || sy < -50 || sy > 600) return;
  // Don't double-draw near home
  const home = locations.find(l => l.id === 'jester_home');
  if (home && Math.abs(jesterPos.x - (home.x + home.w / 2)) < 60 &&
      Math.abs(jesterPos.y - (home.y + home.h / 2)) < 60) return;

  drawNPC_jester(jesterPos.x, jesterPos.y);
}

export function drawJesterGraffiti(camera) {
  const ctx = X;
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  for (const g of jesterGraffiti) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#6b0f1a';
    ctx.fillText(g.text, g.x, g.y);
  }
  ctx.globalAlpha = 1;
}

export function getGraffiti() { return jesterGraffiti.slice(0, 15); }
export function setGraffiti(list) {
  jesterGraffiti.length = 0;
  list.forEach(g => jesterGraffiti.push(g));
}
