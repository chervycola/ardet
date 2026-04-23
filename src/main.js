// ═══════════════════════════════════════
// ARDET V2 — main entry point
// ═══════════════════════════════════════
import { scaler } from './render/scaler.js';
import { layers } from './render/layers.js';
import { camera } from './render/camera.js';
import { lighting } from './render/lighting.js';
import { postfx } from './render/postfx.js';
import { rect, px, hash, lerp, clamp } from './render/draw.js';
import { buildTerrain, MW, MH } from './world/terrain.js';
import { drawPlayer } from './sprites/player.js';

// ═══ INIT ═══
const mainCanvas = document.getElementById('game');
layers.init(mainCanvas);

// Build terrain once (large offscreen canvas)
const terrainCanvas = buildTerrain();
const terrainReady = true;

// ═══ GAME STATE ═══
let t = 0;
let state = 'entry';

const player = {
  x: 800, y: 900, tx: 800, ty: 900,
  dir: 1, moving: false, walkFrame: 0,
};

// Starting lights — will be replaced by location-based lights
lighting.add({ x: 800, y: 900, r: 60, color: [255, 180, 80], flicker: 0.15, intensity: 1 });  // player lantern
lighting.add({ x: 750, y: 780, r: 95, color: [255, 100, 20], flicker: 0.15 });  // campfire
lighting.add({ x: 1000, y: 920, r: 50, color: [30, 200, 30], flicker: 0.08 }); // terminal
lighting.add({ x: 1250, y: 1080, r: 30, color: [140, 100, 50], flicker: 0.05 }); // tent
lighting.add({ x: 900, y: 1480, r: 60, color: [50, 180, 30], flicker: 0.1 }); // lake

// ═══ RENDER ═══
function render() {
  const vw = scaler.vw, vh = scaler.vh;
  layers.clearAll();

  const bgCtx = layers.ctx('bg');
  const worldCtx = layers.ctx('world');
  const lightCtx = layers.ctx('light');
  const postCtx = layers.ctx('post');

  // ── BG: terrain slice ──
  const camX = Math.round(camera.x);
  const camY = Math.round(camera.y);
  const srcX = clamp(camX, 0, MW - vw);
  const srcY = clamp(camY, 0, MH - vh);
  const srcW = Math.min(vw, MW - srcX);
  const srcH = Math.min(vh, MH - srcY);
  if (terrainReady && srcW > 0 && srcH > 0) {
    bgCtx.drawImage(terrainCanvas, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
  }

  // ── WORLD: player + locations ──
  worldCtx.save();
  worldCtx.translate(-camX, -camY);

  // Placeholder location markers (will be replaced by proper sprite system)
  const locMarkers = [
    { x: 750, y: 780, w: 55, h: 50, color: '#6b0f1a', label: 'костёр' },
    { x: 1000, y: 920, w: 50, h: 48, color: '#1a8c1a', label: 'терминал' },
    { x: 1250, y: 1080, w: 65, h: 55, color: '#3a2418', label: 'палатка' },
    { x: 400, y: 680, w: 105, h: 82, color: '#2a2418', label: 'библиотека' },
    { x: 900, y: 1480, w: 100, h: 60, color: '#2a5a1a', label: 'озеро' },
  ];
  for (const l of locMarkers) {
    if (!camera.isVisible(l.x, l.y, l.w, l.h)) continue;
    rect(worldCtx, l.x, l.y, l.w, l.h, l.color);
    worldCtx.fillStyle = '#e8dcc8';
    worldCtx.font = '6px "Press Start 2P"';
    worldCtx.fillText(l.label, l.x, l.y - 4);
  }

  // Player
  drawPlayer(worldCtx, player, t);
  worldCtx.restore();

  // ── LIGHT: additive glow layer ──
  // Update player lantern position
  lighting.sources[0].x = player.x + 6;
  lighting.sources[0].y = player.y + 10;
  const dayCycle = 0; // 0 = night, 1 = day
  const ambient = 0.35 + dayCycle * 0.4;
  lighting.render(lightCtx, { x: camX, y: camY }, t, ambient);

  // ── POST: color grading, vignette ──
  postfx.apply(postCtx);

  // ── COMPOSITE ──
  layers.composite();
}

// ═══ INPUT ═══
const keys = {};
document.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

function handleKeys() {
  let dx = 0, dy = 0;
  if (keys['w'] || keys['arrowup']) dy = -1;
  if (keys['s'] || keys['arrowdown']) dy = 1;
  if (keys['a'] || keys['arrowleft']) dx = -1;
  if (keys['d'] || keys['arrowright']) dx = 1;

  if (dx || dy) {
    const spd = keys['shift'] ? 4 : 2.4;
    const len = Math.sqrt(dx * dx + dy * dy);
    player.x = clamp(player.x + dx / len * spd, 10, MW - 22);
    player.y = clamp(player.y + dy / len * spd, 170, MH - 30);
    player.moving = true;
    if (dx > 0) player.dir = 1;
    else if (dx < 0) player.dir = -1;
  } else {
    player.moving = false;
  }
}

// ═══ LOOP ═══
function loop() {
  t++;

  if (state === 'game') {
    handleKeys();
    camera.follow(player.x + 6, player.y + 10);
    camera.update();
    camera.clampToWorld(MW, MH);
  }

  render();
  requestAnimationFrame(loop);
}

// ═══ ENTRY SCREEN ═══
document.getElementById('entry-btn').addEventListener('click', () => {
  document.getElementById('entry').style.display = 'none';
  document.getElementById('gw').classList.add('on');
  state = 'game';
});

// Touch
mainCanvas.addEventListener('touchend', e => {
  e.preventDefault();
  if (state !== 'game') return;
  const touch = e.changedTouches[0];
  const pos = scaler.screenToGame(touch.clientX, touch.clientY, camera.x, camera.y);
  player.tx = pos.x;
  player.ty = pos.y;
});

console.log(`ARDET V2 | viewport ${scaler.vw}×${scaler.vh} | scale ${scaler.scale}x`);
requestAnimationFrame(loop);
