// ═══════════════════════════════════════
// ARDET V2 — main entry point
// ═══════════════════════════════════════
import { scaler } from './render/scaler.js';
import { layers } from './render/layers.js';
import { camera } from './render/camera.js';
import { lighting } from './render/lighting.js';
import { postfx } from './render/postfx.js';
import { rect, clamp } from './render/draw.js';
import { buildTerrain, MW, MH } from './world/terrain.js';
import { locations } from './world/locations.js';
import { tryMove, findLocationAt } from './world/physics.js';
import { state } from './core/state.js';
import { events, E } from './core/events.js';
import { input } from './core/input.js';
import { t as _t, tick } from './core/time.js';
import { drawPlayer } from './sprites/player.js';
import { setCtx } from './render/context.js';
import { drawNPC_jester } from './sprites/npcs/jester.js';
import { drawNPC_sol } from './sprites/npcs/sol.js';
import { drawNPC_elder } from './sprites/npcs/elder.js';
import { drawNPC_nocturnal } from './sprites/npcs/nocturnal.js';
import { drawDumpsterDemon } from './sprites/npcs/dumpster.js';
import * as locSprites from './sprites/locations/index.js';

// ═══ INIT ═══
const mainCanvas = document.getElementById('game');
layers.init(mainCanvas);
input.init(mainCanvas);

// Terrain (cached offscreen)
const terrainCanvas = buildTerrain();

// ═══ GAME OBJECTS ═══
const player = {
  x: 800, y: 900, tx: 800, ty: 900,
  dir: 1, moving: false, walkFrame: 0,
};

// Game flags
const flags = {
  talkedTo: new Set(),  // NPC ids
  visited: new Set(),   // location ids
  collectedLore: new Set(),
};

// Check if player can leave settlement
function canLeaveSettlement() {
  return flags.talkedTo.has('jester');
}

// ═══ LIGHTING SETUP from locations ═══
lighting.clear();
// Player lantern — follows player
lighting.add({ x: 800, y: 900, r: 55, color: [255, 180, 80], flicker: 0.1 });
// Location lights
for (const loc of locations) {
  if (!loc.light) continue;
  lighting.add({
    x: loc.x + loc.w / 2,
    y: loc.y + loc.h / 2,
    r: loc.light.r,
    color: loc.light.color,
    flicker: loc.light.flicker,
  });
}

// ═══ TIME ═══
import { t } from './core/time.js';
let dayCycle = 0.35; // 0 = night, 1 = day (for now: permanent dusk)

// NPC draw dispatch
const npcDrawFn = {
  jester: drawNPC_jester,
  sol: drawNPC_sol,
  elder: drawNPC_elder,
  nocturnal: drawNPC_nocturnal,
  dumpster: drawDumpsterDemon,
};

// ═══ RENDER ═══
function render() {
  const vw = scaler.vw, vh = scaler.vh;
  layers.clearAll();

  const bgCtx = layers.ctx('bg');
  const worldCtx = layers.ctx('world');
  const lightCtx = layers.ctx('light');
  const uiCtx = layers.ctx('ui');
  const postCtx = layers.ctx('post');

  // ── BG: terrain slice ──
  const camX = Math.round(camera.x);
  const camY = Math.round(camera.y);
  const srcX = clamp(camX, 0, MW - vw);
  const srcY = clamp(camY, 0, MH - vh);
  const srcW = Math.min(vw, MW - srcX);
  const srcH = Math.min(vh, MH - srcY);
  if (srcW > 0 && srcH > 0) {
    bgCtx.drawImage(terrainCanvas, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
  }

  // ── WORLD: locations + player ──
  worldCtx.save();
  worldCtx.translate(-camX, -camY);
  setCtx(worldCtx);

  const sortedLocs = [...locations].sort((a, b) => (a.y + a.h) - (b.y + b.h));
  for (const loc of sortedLocs) {
    if (!camera.isVisible(loc.x, loc.y, loc.w, loc.h)) continue;
    drawLocation(worldCtx, loc);
    if (loc.npc && npcDrawFn[loc.npc]) {
      npcDrawFn[loc.npc](loc.x, loc.y);
    }
  }

  drawPlayer(player);

  worldCtx.restore();

  // ── LIGHT: additive lighting ──
  lighting.sources[0].x = player.x + 6;
  lighting.sources[0].y = player.y + 10;
  const ambient = 0.28 + dayCycle * 0.45;
  lighting.render(lightCtx, { x: camX, y: camY }, t, ambient);

  // ── UI: HUD ──
  drawHUD(uiCtx);

  // ── POST: grading + vignette ──
  postfx.apply(postCtx);

  // ── COMPOSITE ──
  layers.composite();
}

// Placeholder draw function — will be replaced with proper sprites
function drawLocationPlaceholder(ctx, loc) {
  const colors = {
    campfire: '#6b0f1a', terminal: '#1a8c1a', vending: '#b8860b',
    library: '#2a2418', tent: '#3a2418', ruins: '#2a2a2a',
    watchtower: '#3a3020', posterwall: '#8a7020', graffiti: '#4a2a2a',
    crater: '#1a1a1a', riverbed: '#4a6070',
    radio: '#ff3030', cross: '#a89080', raven: '#1a0a0a',
    theater: '#c8b890', altar: '#3a6a2a',
    lake: '#2a5a1a', basement: '#40a050', pipeline: '#5a6030',
    pit: '#0a0a00', nocturnal: '#4a4a7a',
    exit: '#2a2a4a', train: '#604030', bus: '#a88018',
    junkyard: '#3a3a3a', dumpster: '#ff4400',
    overpass: '#6a5a4a', billboard: '#a03030', powerline: '#2a2a2a',
    banner: '#8a6a2a', pizzeria: '#c83030',
    church: '#1a0a24', fountain: '#3a6040', crypt: '#0a0a0a',
    jester_home: '#6b0f1a', sol_home: '#b8860b', elder_home: '#3a2418',
    nocturnal_home: '#4a4a7a',
  };
  const color = colors[loc.id] || '#444';
  rect(ctx, loc.x, loc.y, loc.w, loc.h, color);

  // Small label when camera is close
  ctx.fillStyle = '#e8dcc8';
  ctx.font = '6px "Press Start 2P"';
  ctx.globalAlpha = 0.5;
  ctx.fillText(loc.name.slice(0, 20), loc.x, loc.y - 4);
  ctx.globalAlpha = 1;
}

// Location draw: real sprite if migrated, placeholder otherwise
function drawLocation(ctx, loc) {
  const fn = locSprites['draw_' + loc.id];
  if (fn) {
    fn(loc.x, loc.y);
  } else {
    drawLocationPlaceholder(ctx, loc);
  }
}

function drawHUD(ctx) {
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = '#8a8d8f';
  ctx.font = '6px "Press Start 2P"';
  ctx.fillText(`ARDET V2 · ${scaler.vw}×${scaler.vh} @${scaler.scale}x`, 8, scaler.vh - 8);
  ctx.globalAlpha = 1;
}

// ═══ GAME LOGIC ═══
function updateGame() {
  if (!state.is('game')) return;

  const move = input.getMove();
  if (move.active) {
    const spd = input.isDown('sprint') ? 4 : 2.4;
    tryMove(player, move.x * spd, move.y * spd, locations, {
      canLeaveSettlement: canLeaveSettlement(),
    });
    player.moving = true;
    if (move.x > 0) player.dir = 1;
    else if (move.x < 0) player.dir = -1;
    events.emit(E.PLAYER_MOVE, player);
  } else {
    player.moving = false;
  }

  camera.follow(player.x + 6, player.y + 10);
  camera.update();
  camera.clampToWorld(MW, MH);
}

// ═══ LOOP ═══
function loop() {
  tick();
  updateGame();
  render();
  requestAnimationFrame(loop);
}

// ═══ ENTRY ═══
document.getElementById('entry-btn').addEventListener('click', () => {
  document.getElementById('entry').style.display = 'none';
  document.getElementById('gw').classList.add('on');
  state.transition('game');
});

// Touch: walk toward clicked point
input.onClick(({ clientX, clientY }) => {
  if (!state.is('game')) return;
  const pos = input.screenToWorld(clientX, clientY, camera);
  const loc = findLocationAt(pos.x, pos.y, locations);
  if (loc) {
    // Clicked a location — mark visited
    flags.visited.add(loc.id);
    events.emit(E.LOCATION_VISIT, loc);
    // For now just walk toward it (menu system comes later)
    player.tx = loc.x + loc.w / 2 - 6;
    player.ty = loc.y + loc.h + 5;
  } else {
    player.tx = pos.x;
    player.ty = pos.y;
  }
});

// ═══ DEBUG ═══
events.on(E.LOCATION_VISIT, loc => console.log(`[visit] ${loc.name}`));
events.on(E.PLAYER_MOVE, () => {}); // noop

console.log(`ARDET V2 | viewport ${scaler.vw}×${scaler.vh} | scale ${scaler.scale}x | ${locations.length} locations`);
requestAnimationFrame(loop);
