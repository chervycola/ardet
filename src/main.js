// ═══════════════════════════════════════
// ARDET V2 — main entry point
// ═══════════════════════════════════════
import { scaler } from './render/scaler.js';
import { layers } from './render/layers.js';
import { camera } from './render/camera.js';
import { postfx } from './render/postfx.js';
import { rect, px, hash, lerp, clamp } from './render/draw.js';

// ═══ PALETTE ═══
const P = {
  crimson: '#6b0f1a', gold: '#b8860b', bone: '#e8dcc8',
  amber: '#d4a017', ash: '#8a8d8f', d1: '#0a0a0a',
  dgrey: '#2a2a2a', term: '#1a8c1a', toxic: '#2a5a1a',
  dwood: '#1a0e06', dbone: '#c8b8a8', dstone: '#3a3a2a',
  f1: '#ff6600', f2: '#ff4400',
  // Zone ground colors
  g1: '#1a1810', g2: '#141208', g3: '#0e0c06', g4: '#1e1a12',
};

// ═══ INIT ═══
const mainCanvas = document.getElementById('game');
layers.init(mainCanvas);

// ═══ GAME STATE ═══
let t = 0;
let state = 'entry'; // entry | game | menu | look | dialogue | terminal | shop | ending

// Player
const player = {
  x: 800, y: 900, tx: 800, ty: 900,
  dir: 1, moving: false, walkFrame: 0,
};

// ═══ RENDER ═══
function render() {
  layers.clearAll();

  const worldCtx = layers.ctx('world');
  const uiCtx = layers.ctx('ui');
  const postCtx = layers.ctx('post');

  // World layer — apply camera transform
  worldCtx.save();
  camera.applyTransform(worldCtx);

  // Draw ground (placeholder)
  worldCtx.fillStyle = P.g1;
  worldCtx.fillRect(0, 0, 3000, 1800);

  // Draw player (placeholder)
  const pColor = t % 60 < 30 ? P.bone : P.gold;
  rect(worldCtx, player.x, player.y, 12, 20, pColor);
  rect(worldCtx, player.x + 2, player.y - 4, 8, 5, P.bone);

  worldCtx.restore();

  // Post-processing
  postfx.apply(postCtx);

  // Composite all layers
  layers.composite();
}

// ═══ GAME LOOP ═══
function loop() {
  t++;

  if (state === 'game') {
    handleKeys();
    camera.follow(player.x + 6, player.y + 10);
    camera.update();
  }

  render();
  requestAnimationFrame(loop);
}

// ═══ INPUT (basic — will be replaced by unified input module) ═══
const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

function handleKeys() {
  let dx = 0, dy = 0;
  if (keys['w'] || keys['arrowup']) dy = -1;
  if (keys['s'] || keys['arrowdown']) dy = 1;
  if (keys['a'] || keys['arrowleft']) dx = -1;
  if (keys['d'] || keys['arrowright']) dx = 1;
  if (dx || dy) {
    const spd = keys['shift'] ? 4 : 2.4;
    const len = Math.sqrt(dx * dx + dy * dy);
    player.x += dx / len * spd;
    player.y += dy / len * spd;
    player.moving = true;
    if (dx > 0) player.dir = 1;
    else if (dx < 0) player.dir = -1;
  } else {
    player.moving = false;
  }
}

// ═══ ENTRY SCREEN ═══
document.getElementById('entry-btn').addEventListener('click', () => {
  document.getElementById('entry').style.display = 'none';
  document.getElementById('gw').classList.add('on');
  state = 'game';
});

// Touch support
mainCanvas.addEventListener('touchend', e => {
  e.preventDefault();
  const touch = e.changedTouches[0];
  const pos = scaler.screenToGame(touch.clientX, touch.clientY, camera.x, camera.y);
  player.tx = pos.x;
  player.ty = pos.y;
  player.moving = true;
});

// ═══ START ═══
console.log(`ARDET V2 | viewport ${scaler.vw}×${scaler.vh} | scale ${scaler.scale}x`);
requestAnimationFrame(loop);
