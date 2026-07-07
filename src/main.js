// ═══════════════════════════════════════
// ARDET V2 — main entry point
// ═══════════════════════════════════════
import { scaler } from './render/scaler.js';
import { layers } from './render/layers.js';
import { camera } from './render/camera.js';
import { lighting, lightParticles } from './render/lighting.js';
import { postfx } from './render/postfx.js';
import { rect, clamp } from './render/draw.js';
import { buildTerrain, MW, MH } from './world/terrain.js';
import { locations, attachContent } from './world/locations.js';
import { tryMove, findLocationAt, isInSettlement } from './world/physics.js';
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
import { showMenu, hideMenu, initUI, getActiveLoc, showLook } from './ui/ui.js';
import { looks } from './content/looks.js';
import { dialogues } from './content/dialogues.js';
import { checkLorePickup, drawLoreItems, getCollectedCount, getTotalCount, loadCollected, getCollectedIds } from './world/lore.js';
import { saveGame, loadGame, startAutoSave } from './core/save.js';
import { setPlayer } from './core/playerRef.js';
import { screenMoss, crackedGlass, dyingPixels, initMetaFx } from './render/metaFx.js';
import { showLore, draw as drawLorePopup, dismiss as dismissLore, isActive as loreActive } from './ui/lorepopup.js';
import { init as initTerminal, open as openTerminal } from './terminal/terminal.js';
import { initShop, openShop } from './ui/shop.js';
import { STREET_SPAWN, GATES_RETURN, STREET_X0, consumeGatesLine, worldSegmentAt } from './world/street.js';
import {
  init as initWorldMap, toggle as toggleWorldMap,
  markDiscovered as discoverGate,
  getDiscovered as getDiscoveredGates,
  loadDiscovered as loadDiscoveredGates,
} from './ui/worldmap.js';
import { initAudio, resumeAudio, startAmbient, playPickup, playClick, playDistantSound } from './audio/audio.js';
import { updateZone, getZone } from './audio/zoneAmbient.js';
import { updateJester, drawJesterWandering, drawJesterGraffiti, getGraffiti, setGraffiti } from './world/wandering.js';
import { init as initAchievements, getUnlocked, loadUnlocked } from './core/achievements.js';
import { updateProximity, draw as drawInscriptions } from './world/inscriptions.js';
import { update as updateIdle, draw as drawIdle } from './world/idle.js';
import { check as checkWhisper, draw as drawWhisper } from './world/whisper.js';
import { update as updateParticles, draw as drawParticles, footstepDust, pickupSparkle, fireEmber } from './render/particles.js';
import { addFootprint, drawFootprints, drawSmokeClouds, drawBloodMoon } from './render/atmosphere.js';
import { weather, update as updateWeather, drawAdditive as drawWeatherAdditive, drawOverlay as drawWeatherOverlay } from './render/weather.js';
import { init as initCursor, show as showCursor } from './ui/cursor.js';
import { update as updatePets, draw as drawPets } from './world/pets.js';
import { draw as drawAchPopup } from './ui/achPopup.js';
import { draw as drawSilentCat, getSightings, loadSightings, isUnlocked as catUnlocked, setUnlocked as setCatUnlocked } from './world/silentCat.js';
import { incrementSession, getShiftConfig, maybeShowBlankScreen } from './core/sessionMemory.js';
import { useTexts } from './world/useActions.js';
import { update as updateBrainrot, draw as drawBrainrot, isFrozen } from './world/brainrot.js';
import { trigger as triggerEnding, isActive as isEndingActive, draw as drawEnding } from './world/ending.js';
import { update as updateMonsters, draw as drawMonsters } from './world/monsters.js';

// ═══ INIT ═══
const mainCanvas = document.getElementById('game');
layers.init(mainCanvas);
input.init(mainCanvas);
attachContent(looks, dialogues);
initUI();
initMetaFx();
initTerminal();
initShop();
initWorldMap();
initCursor();
initAudio();

// Painted assets (portraits + entry/ending scenes) — fire-and-forget
// preload; UI code asks for them when it needs them and falls back to
// empty frames if they're not on disk yet.
import { preloadAll, getScene } from './assets/loader.js';
preloadAll().then(() => {
  // Once the entry painting is in cache, mount it as the #entry
  // background; the existing logo + button markup stays on top.
  const entry = getScene('entry');
  if (entry) {
    const el = document.getElementById('entry');
    if (el) {
      el.style.backgroundImage = `url('${entry.src}')`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      // Slight darken so the logo + button stay readable
      el.style.boxShadow = 'inset 0 0 0 100vmax rgba(5,4,8,0.55)';
    }
  }
});

// ═══ GAME OBJECTS (must be before loadGame!) ═══
const player = {
  x: 800, y: 900, tx: 800, ty: 900,
  dir: 1, moving: false, walkFrame: 0,
};
setPlayer(player);
const flags = {
  talkedTo: new Set(),
  visited: new Set(),
  collectedLore: new Set(),
  observersSeen: new Set(),
};

// Terrain (cached offscreen)
const terrainCanvas = buildTerrain();

// Session memory
const sessionAge = incrementSession();
const shiftCfg = getShiftConfig();
maybeShowBlankScreen();
console.log(`[session] visit #${sessionAge} | desat ${(shiftCfg.desaturation * 100).toFixed(1)}%`);

// Load saved progress
if (localStorage.getItem('ardet_save')) {
  localStorage.removeItem('ardet_save');
}
const savedData = loadGame();
if (savedData) {
  if (savedData.player) { player.x = savedData.player.x; player.y = savedData.player.y; }
  if (savedData.talkedTo) savedData.talkedTo.forEach(n => flags.talkedTo.add(n));
  if (savedData.visited) savedData.visited.forEach(id => flags.visited.add(id));
  if (savedData.collectedLore) loadCollected(savedData.collectedLore);
  if (savedData.observersSeen) savedData.observersSeen.forEach(n => flags.observersSeen.add(n));
  if (savedData.achievements) loadUnlocked(savedData.achievements);
  if (savedData.graffiti) setGraffiti(savedData.graffiti);
  if (savedData.catSightings) loadSightings(savedData.catSightings);
  if (savedData.catUnlocked) setCatUnlocked(true);
  if (savedData.discoveredGates) loadDiscoveredGates(savedData.discoveredGates);
}

initAchievements(flags, () => getCollectedCount());

startAutoSave(() => ({
  player: { x: player.x, y: player.y },
  talkedTo: Array.from(flags.talkedTo),
  visited: Array.from(flags.visited),
  observersSeen: Array.from(flags.observersSeen),
  collectedLore: getCollectedIds(),
  achievements: getUnlocked(),
  graffiti: getGraffiti(),
  catSightings: getSightings(),
  catUnlocked: catUnlocked(),
  discoveredGates: getDiscoveredGates(),
}));

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
    bloom: loc.light.r > 50,
  });
}

// ═══ TIME ═══
import { t } from './core/time.js';
// Day cycle: 0 = midnight, 0.5 = noon, 1 = midnight again
// Full cycle = 43200 frames @ 60fps = 12 min (6 min day + 6 min night)
const DAY_LENGTH = 43200;

function getDayCycle() {
  const phase = (t % DAY_LENGTH) / DAY_LENGTH;
  // Sinusoidal: 0 at midnight, 1 at noon
  return 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
}

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

  // ── BG: atmosphere ──
  drawBloodMoon(bgCtx, { x: camX, y: camY });
  drawSmokeClouds(bgCtx, { x: camX, y: camY });

  // ── WORLD: locations + player ──
  worldCtx.save();
  worldCtx.translate(-camX, -camY);
  setCtx(worldCtx);

  drawFootprints(worldCtx, { x: camX, y: camY });

  const sortedLocs = [...locations].sort((a, b) => (a.y + a.h) - (b.y + b.h));
  for (const loc of sortedLocs) {
    if (!camera.isVisible(loc.x, loc.y, loc.w, loc.h)) continue;
    drawLocation(worldCtx, loc);
    if (loc.npc && npcDrawFn[loc.npc]) {
      npcDrawFn[loc.npc](loc.x, loc.y);
    }
  }

  drawLoreItems({ x: camX, y: camY });
  drawInscriptions({ x: camX, y: camY }, locations);
  drawJesterGraffiti({ x: camX, y: camY });
  drawJesterWandering({ x: camX, y: camY }, locations);
  drawPets({ x: camX, y: camY });
  drawSilentCat(player, { x: camX, y: camY }, locations);
  drawMonsters({ x: camX, y: camY });
  drawParticles(worldCtx, { x: camX, y: camY });

  drawPlayer(player);
  drawWorldWhisper({ x: camX, y: camY });

  worldCtx.restore();

  // ── LIGHT: additive lighting ──
  if (lighting.sources[0]) {
    lighting.sources[0].x = player.x + 6;
    lighting.sources[0].y = player.y + 10;
  }
  const dayCycle = getDayCycle();
  const ambient = 0.28 + dayCycle * 0.45;
  lighting.render(lightCtx, { x: camX, y: camY }, ambient);

  // Atmospheric particles in lit areas (render on world layer for depth)
  const camObj = { x: camX, y: camY };
  lightParticles.update(camObj, lighting.sources);
  lightParticles.draw(worldCtx, camObj);

  // ── FX (additive): rain streaks, lightning, cracks, dying pixels ──
  const fxCtx = layers.ctx('fx');
  crackedGlass.draw(fxCtx);
  dyingPixels.update();
  dyingPixels.draw(fxCtx);
  drawWeatherAdditive(fxCtx);
  drawBrainrot(fxCtx);

  // ── UI (normal blend): weather overlay + moss, then HUD on top ──
  drawWeatherOverlay(uiCtx);
  screenMoss.update(player.moving);
  screenMoss.draw(uiCtx);
  drawHUD(uiCtx);

  // ── POST: grading + vignette ──
  postfx.apply(postCtx);

  // Teleport blink — above everything except the ending
  drawTeleportFade(postCtx);

  // ── COMPOSITE ──
  // Ending overlay (on top of everything)
  if (isEndingActive()) {
    drawEnding(postCtx);
  }

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
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  ctx.globalAlpha = 0.5;
  ctx.fillText(loc.name.slice(0, 20), loc.x, loc.y - 4);
  ctx.globalAlpha = 1;
}

// Location draw: real sprite if migrated, placeholder otherwise
function drawLocation(ctx, loc) {
  if (loc.streetForm) { drawStreetSign(ctx, loc); return; }
  const fn = locSprites['draw_' + loc.id];
  if (fn) {
    fn(loc.x, loc.y);
  } else {
    drawLocationPlaceholder(ctx, loc);
  }
}

// ═══ STREET SIGNS — small pixel landmarks by form ═══
function drawStreetSign(ctx, loc) {
  const x = loc.x + 7;            // anchor center
  const gy = loc.y + loc.h;       // ground line
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x - 5, gy, 10, 2);

  const form = loc.streetForm;
  if (form === 'fire') {
    // Charred mound + 5 flame tongues with independent flicker.
    ctx.fillStyle = '#1a0a08';
    ctx.fillRect(x - 11, gy - 4, 22, 4);
    ctx.fillStyle = '#3a1408';
    ctx.fillRect(x - 9, gy - 6, 18, 3);
    // Embers
    for (let i = 0; i < 4; i++) {
      const ex = x - 7 + i * 4;
      ctx.fillStyle = (t * 0.04 + i) % 1 < 0.5 ? '#ff7020' : '#aa3008';
      ctx.fillRect(ex, gy - 4, 1, 1);
    }
    // Flame body (layered)
    const flick = Math.sin(t * 0.18) * 1.4;
    const flick2 = Math.sin(t * 0.27 + 1.6) * 0.9;
    // Outer dim
    ctx.fillStyle = '#6b0f1a';
    ctx.fillRect(x - 7, gy - 12 + flick * 0.5, 14, 6);
    // Mid
    ctx.fillStyle = '#c83018';
    ctx.fillRect(x - 5, gy - 16 + flick, 10, 8);
    // Hot
    ctx.fillStyle = '#ff7020';
    ctx.fillRect(x - 3, gy - 21 + flick * 1.2, 6, 10);
    // Wick / core white
    ctx.fillStyle = '#ffd060';
    ctx.fillRect(x - 1, gy - 24 + flick2, 2, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, gy - 26 + flick2, 1, 4);
    // Rising sparks
    for (let i = 0; i < 6; i++) {
      const sp = ((t * 0.04 + i * 0.18) % 1);
      if (sp < 0.92) {
        const sx = x + Math.sin(t * 0.05 + i) * 4;
        const sy = gy - 24 - sp * 24;
        ctx.globalAlpha = (1 - sp) * 0.85;
        ctx.fillStyle = i % 2 ? '#ff7020' : '#ffb040';
        ctx.fillRect(sx | 0, sy | 0, 1, 1);
        ctx.globalAlpha = 1;
      }
    }
    // Heat shimmer / hot ground
    const grad = ctx.createRadialGradient(x, gy - 12, 2, x, gy - 12, 30);
    grad.addColorStop(0, 'rgba(255,120,40,0.18)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - 30, gy - 30, 60, 36);
    // Live status scaffolding outline (already drawn below for live signs)
    return;
  }

  if (form === 'building') {
    ctx.fillStyle = '#15100c';
    ctx.fillRect(x - 9, gy - 30, 18, 30);
    ctx.fillStyle = '#241c14';
    ctx.fillRect(x - 8, gy - 29, 16, 28);
    ctx.fillStyle = '#0a0808';
    ctx.fillRect(x - 2, gy - 14, 5, 14);          // door
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(x + 1, gy - 9, 1, 1);            // handle
    ctx.fillStyle = loc.streetLive ? '#daa520' : '#3a3022';
    ctx.fillRect(x - 6, gy - 24, 4, 4);           // windows
    ctx.fillRect(x + 3, gy - 24, 4, 4);
  } else if (form === 'kiosk') {
    ctx.fillStyle = '#3a2418';
    ctx.fillRect(x - 7, gy - 13, 14, 13);
    ctx.fillStyle = '#6b0f1a';
    ctx.fillRect(x - 8, gy - 16, 16, 3);          // awning
    ctx.fillStyle = '#daa520';
    ctx.fillRect(x - 5, gy - 9, 2, 1);            // counter glint
    ctx.fillStyle = '#0a0808';
    ctx.fillRect(x - 3, gy - 8, 7, 5);            // window
  } else if (form === 'stand') {
    ctx.fillStyle = '#3a2818';
    ctx.fillRect(x - 6, gy - 16, 12, 12);
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(x - 5, gy - 4, 2, 4);
    ctx.fillRect(x + 3, gy - 4, 2, 4);
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(x - 5, gy - 15, 10, 1);
  } else if (form === 'surface') {
    ctx.fillStyle = '#3a3328';
    ctx.fillRect(x - 8, gy - 18, 16, 18);
    ctx.fillStyle = '#1a1a16';
    ctx.fillRect(x - 7, gy - 17, 14, 3);
    if (/тень/.test(loc.name)) {
      ctx.fillStyle = '#0a0a0e';
      ctx.fillRect(x - 4, gy - 13, 8, 11);        // the recurring shadow
    }
  } else {
    // plaque: post + placard
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(x, gy - 14, 2, 14);
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(x - 5, gy - 18, 12, 6);
    ctx.fillStyle = '#3a2818';
    ctx.fillRect(x - 4, gy - 17, 10, 4);
  }

  // Live signs: flickering scaffolding + occasional static pip
  if (loc.streetLive) {
    ctx.strokeStyle = '#aa7818';
    ctx.lineWidth = 1;
    const flick = 0.5 + 0.45 * Math.sin(t * 0.05 + loc.x);
    ctx.globalAlpha = 0.5 + flick * 0.4;
    ctx.strokeRect(x - 11, gy - 34, 22, 34);
    ctx.beginPath();
    ctx.moveTo(x - 11, gy - 34);
    ctx.lineTo(x + 11, gy);
    ctx.stroke();
    ctx.globalAlpha = 1;
    if (t % 90 < 6) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 12 + ((t * 7) % 24), gy - 36, 1, 1);
    }
  }
}

// Dev overlay only with ?debug in the URL — players shouldn't see
// coordinates and state internals.
const DEBUG_HUD = typeof location !== 'undefined' && /[?&]debug\b/.test(location.search);

function drawHUD(ctx) {
  drawLorePopup(ctx);
  drawAchPopup(ctx);
  drawIdle(ctx);
  drawEpochTitle(ctx);

  if (DEBUG_HUD) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#1a8c1a';
    ctx.font = '6px "Press Start 2P","VT323",monospace';
    ctx.fillText(`[${state.current}] ${Math.floor(player.x)},${Math.floor(player.y)}`, 4, scaler.vh - 4);
    ctx.globalAlpha = 1;
  }
}

// Whisper is on world layer (positioned in world coords)
function drawWorldWhisper(camObj) {
  const worldCtx = layers.ctx('world');
  drawWhisper(worldCtx, camObj);
}

// ═══ CRACKED GLASS TRIGGERS ═══
// Occasional screen fractures from: lightning, wandering far
let lastCrackFrame = -9999;
let lastLightning = 0;
function updateCrackTriggers(player) {
  if (t - lastCrackFrame < 240) return; // cooldown 4s min between cracks

  // Lightning strike → rare glass crack
  if (weather.lightning > 34 && lastLightning < 34 && Math.random() < 0.35) {
    crackedGlass.add(
      20 + Math.floor(Math.random() * (scaler.vw - 40)),
      20 + Math.floor(Math.random() * (scaler.vh - 40)),
    );
    lastCrackFrame = t;
  }
  lastLightning = weather.lightning;

  // Wandering beyond map — tension crack
  const offmap = (player.x < 0 || player.x > MW || player.y < 160 || player.y > MH);
  if (offmap && t % 600 === 0 && Math.random() < 0.4) {
    crackedGlass.add(
      30 + Math.floor(Math.random() * (scaler.vw - 60)),
      30 + Math.floor(Math.random() * (scaler.vh - 60)),
    );
    lastCrackFrame = t;
  }
}

// ═══ GAME LOGIC ═══
// ═══ TELEPORT WITH FADE ═══
// Every instant relocation (click-approach, gates, map fast-travel,
// street return) goes through a short black blink so it reads as an
// intentional step, not a glitch. The move happens at the black
// midpoint; `after` (e.g. opening the menu) fires right after it.
const FADE_HALF = 10; // frames each way (~330 ms total @60fps)
const teleportFade = { phase: 0, dir: 0, target: null, after: null };

function teleportWithFade(x, y, after = null) {
  // If a fade is already running, just retarget it.
  teleportFade.target = { x, y };
  teleportFade.after = after;
  if (teleportFade.dir === 0) {
    teleportFade.dir = 1;
    teleportFade.phase = 0;
  }
}

function updateTeleportFade() {
  if (teleportFade.dir === 0) return;
  teleportFade.phase += teleportFade.dir;
  if (teleportFade.dir === 1 && teleportFade.phase >= FADE_HALF) {
    // Black midpoint — move now.
    const tgt = teleportFade.target;
    if (tgt) {
      player.x = tgt.x; player.y = tgt.y;
      player.tx = tgt.x; player.ty = tgt.y;
      player.moving = false;
      camera.x = player.x - scaler.vw / 2;
      camera.y = player.y - scaler.vh / 2;
      camera.targetX = camera.x; camera.targetY = camera.y;
    }
    const cb = teleportFade.after;
    teleportFade.target = null;
    teleportFade.after = null;
    teleportFade.dir = -1;
    if (cb) cb();
  } else if (teleportFade.dir === -1 && teleportFade.phase <= 0) {
    teleportFade.dir = 0;
    teleportFade.phase = 0;
  }
}

function drawTeleportFade(ctx) {
  if (teleportFade.dir === 0 && teleportFade.phase <= 0) return;
  ctx.globalAlpha = Math.min(1, teleportFade.phase / FADE_HALF);
  ctx.fillStyle = '#050408';
  ctx.fillRect(0, 0, scaler.vw, scaler.vh);
  ctx.globalAlpha = 1;
}

// ═══ EPOCH TITLE CARD ═══
// Crossing into a street segment shows a large translucent title for a
// couple of seconds — «§2 · ПОРТИКИ И САДЫ» — like zone cards in
// action games. Re-shown every re-entry (the street is long; the
// reminder is the point).
const EPOCH_TITLE_LIFE = 160; // ~2.7 s
const epochTitle = { text: '', era: '', life: 0, lastSegId: null };

function updateEpochTitle() {
  const seg = worldSegmentAt(player.x);
  const id = seg ? seg.id : null;
  if (id !== epochTitle.lastSegId) {
    epochTitle.lastSegId = id;
    if (seg) {
      epochTitle.text = `§${seg.n} · ${seg.name.toUpperCase()}`;
      epochTitle.era = seg.era;
      epochTitle.life = EPOCH_TITLE_LIFE;
    }
  }
  if (epochTitle.life > 0) epochTitle.life--;
}

function drawEpochTitle(ctx) {
  if (epochTitle.life <= 0) return;
  const total = EPOCH_TITLE_LIFE;
  const age = total - epochTitle.life;
  // Envelope: quick fade-in, hold, slow fade-out
  const a = age < 20 ? age / 20 : (epochTitle.life < 50 ? epochTitle.life / 50 : 1);
  const vw = scaler.vw;
  const y = 54 - (age < 20 ? (20 - age) * 0.35 : 0); // slight settle-down
  ctx.textAlign = 'center';
  // Underline flourish
  ctx.globalAlpha = a * 0.35;
  ctx.fillStyle = '#b8860b';
  ctx.fillRect(vw / 2 - 70, y + 8, 140, 1);
  // Title
  ctx.globalAlpha = a * 0.85;
  ctx.fillStyle = '#e8dcc8';
  ctx.font = '11px "Press Start 2P","VT323",monospace';
  ctx.fillText(epochTitle.text, vw / 2, y);
  // Era subtitle
  ctx.globalAlpha = a * 0.5;
  ctx.fillStyle = '#8a8d8f';
  ctx.font = '7px "Press Start 2P","VT323",monospace';
  ctx.fillText(epochTitle.era, vw / 2, y + 20);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

function updateGame() {
  updateTeleportFade();
  updateEpochTitle();
  if (isFrozen()) { updateBrainrot(player); return; }
  if (!state.is('game')) return;

  // Held-finger walk (mobile): while a finger stays down, walk toward
  // it continuously. A short tap still dispatches as a click.
  const held = input.getHeldTouch();
  if (held) {
    const pos = input.screenToWorld(held.x, held.y, camera);
    const hdx = pos.x - (player.x + 6);
    const hdy = pos.y - (player.y + 10);
    const hd = Math.sqrt(hdx * hdx + hdy * hdy);
    if (hd > 8) {
      const spd = 2.4;
      tryMove(player, (hdx / hd) * spd, (hdy / hd) * spd, locations, {
        canLeaveSettlement: canLeaveSettlement(),
      });
      player.tx = player.x;
      player.ty = player.y;
      player.moving = true;
      if (hdx > 1) player.dir = 1;
      else if (hdx < -1) player.dir = -1;
      events.emit(E.PLAYER_MOVE, player);
      if (t % 8 === 0) footstepDust(player.x, player.y);
      addFootprint(player.x, player.y);
    } else {
      player.moving = false;
    }
    // Skip keyboard/auto-walk branches while the finger is down.
    updateWorldSystems();
    return;
  }

  const move = input.getMove();
  if (move.active) {
    const spd = input.isDown('sprint') ? 4 : 2.4;
    tryMove(player, move.x * spd, move.y * spd, locations, {
      canLeaveSettlement: canLeaveSettlement(),
    });
    player.tx = player.x;
    player.ty = player.y;
    player.moving = true;
    if (move.x > 0) player.dir = 1;
    else if (move.x < 0) player.dir = -1;
    events.emit(E.PLAYER_MOVE, player);
    if (t % 8 === 0) footstepDust(player.x, player.y);
    addFootprint(player.x, player.y);
  } else if (player.moving) {
    // Auto-walk toward target
    const dx = player.tx - player.x;
    const dy = player.ty - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 2) {
      player.moving = false;
      // Check if we arrived at a location
      const loc = findLocationAt(player.x, player.y, locations);
      if (loc) {
        flags.visited.add(loc.id);
        events.emit(E.LOCATION_VISIT, loc);
        showMenu(loc);
      }
    } else {
      const spd = 2.4;
      if (dx > 1) player.dir = 1;
      else if (dx < -1) player.dir = -1;
      tryMove(player, dx / dist * spd, dy / dist * spd, locations, {
        canLeaveSettlement: canLeaveSettlement(),
      });
    }
  } else {
    player.moving = false;
  }

  // Walking west past the street's edge returns through the gates
  if (player.x > STREET_X0 - 100 && player.x < STREET_X0 + 8 && teleportFade.dir === 0) {
    teleportWithFade(GATES_RETURN.x, GATES_RETURN.y);
  }

  updateWorldSystems();
}

// Camera + all per-frame world systems. Shared by the normal movement
// path and the held-finger walk branch above.
function updateWorldSystems() {
  camera.follow(player.x + 6, player.y + 10);
  camera.update();
  camera.clampToWorld(MW, MH);

  // Check for lore pickup
  checkLorePickup(player);

  // Update world-level systems
  updateJester(camera);
  updateProximity(player, locations);
  updatePets();
  updateBrainrot(player);
  updateMonsters(player);
  updateZone(getZone(player.x, player.y));
  updateIdle(player.moving);
  checkWhisper(player, locations);
  updateParticles();
  updateWeather(getZone(player.x, player.y));
  updateCrackTriggers(player);

  if (t % 3 === 0) fireEmber(775, 795);
}

// ═══ LOOP ═══
function loop() {
  tick();
  updateGame();
  render();
  requestAnimationFrame(loop);
}

// ═══ ENTRY → HOW-TO → GAME ═══
// «В ПУСТОТУ» first shows a one-plate controls card; any key/click on
// it drops into the game. Both interactions are user gestures, so
// resumeAudio() stays autoplay-policy-safe.
function startGame() {
  const howto = document.getElementById('howto');
  if (howto) howto.classList.remove('on');
  const gw = document.getElementById('gw');
  gw.classList.add('on');
  gw.style.opacity = '1'; // force visible
  state.transition('game');
  showCursor();
  resumeAudio();
  startAmbient();
}

document.getElementById('entry-btn').addEventListener('click', () => {
  document.getElementById('entry').style.display = 'none';
  const howto = document.getElementById('howto');
  if (!howto) { startGame(); return; }
  // Swap the key list for touch devices
  const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
  if (isMobile) {
    const d = document.getElementById('howto-desktop');
    const m = document.getElementById('howto-mobile');
    if (d) d.style.display = 'none';
    if (m) m.style.display = 'grid';
  }
  howto.classList.add('on');
  const go = () => {
    document.removeEventListener('keydown', go);
    startGame();
  };
  howto.addEventListener('click', go, { once: true });
  // Delay the key listener a tick so the entry click doesn't self-trigger
  setTimeout(() => document.addEventListener('keydown', go, { once: true }), 50);
});

// Fallback removed: canvas click handler already dispatches. Keeping #gw
// click listener caused double-dispatch (canvas → #gw bubble), which
// flashed the menu open+closed on the same click.

// Touch: walk toward clicked point
input.onClick(({ clientX, clientY, originalEvent }) => {
  if (originalEvent) originalEvent.stopPropagation();
  if (state.is('menu')) { hideMenu(); return; }
  if (state.is('look') || state.is('dialogue')) return;
  if (!state.is('game')) return;
  // Lore popup eats the first click: dismiss, don't walk
  if (loreActive()) { dismissLore(); return; }

  const pos = input.screenToWorld(clientX, clientY, camera);
  const loc = findLocationAt(pos.x, pos.y, locations);
  if (loc) {
    const px_ = loc.x + loc.w / 2 - 6;
    const py_ = loc.y + loc.h + 5;
    // Block click-routing to locations whose access point is outside the
    // locked starting area (e.g. Pizzeria sits at the highway border).
    // Otherwise a near-click would teleport the player out of the zone
    // and movement would jam against the boundary.
    if (!canLeaveSettlement() && !isInSettlement(px_, py_)) return;
    const dist = Math.sqrt((player.x - px_) ** 2 + (player.y - py_) ** 2);

    if (dist < 85) {
      // Close enough — blink-step to the location, then open the menu
      teleportWithFade(px_, py_, () => {
        flags.visited.add(loc.id);
        events.emit(E.LOCATION_VISIT, loc);
        showMenu(loc);
      });
    } else {
      // Walk toward it
      player.tx = px_;
      player.ty = py_;
      player.moving = true;
    }
  } else {
    player.tx = pos.x;
    player.ty = pos.y;
    player.moving = true;
  }
});

// ═══ EVENT HANDLERS ═══
events.on(E.NPC_TALK, (npcId) => {
  flags.talkedTo.add(npcId);
  if (npcId === 'jester') discoverGate('gate_europe');
});
events.on(E.OBSERVER_MET, (npcId) => {
  flags.observersSeen.add(npcId);
});

// Gates open on milestones: thresholds match content/worldmap_db.GATES.reveal.
events.on(E.LORE_COLLECT, () => {
  const n = getCollectedCount();
  if (n >= 30) discoverGate('gate_americas');
  if (n >= 60) discoverGate('gate_north');
});
// Terminal-driven discoveries — fired from inside terminal.exec via the
// 'terminal.read' bus event below.
events.on('terminal.read', (key) => {
  if (key === 'timbuktu') discoverGate('gate_africa');
  if (key === 'ishraq')   discoverGate('gate_asia');
});

// Fast-travel through a gate: teleport to its world target.
events.on('gate.use', (gate) => {
  if (!gate || !gate.target) return;
  teleportWithFade(gate.target.x, gate.target.y);
});
events.on(E.LORE_COLLECT, (item) => {
  showLore(item.text, item.live);
  playPickup();
  pickupSparkle(item.x, item.y);
});
events.on('location.use', (loc) => {
  if (loc.id === 'terminal') { openTerminal(); return; }
  const actionKey = loc.useAction || loc.id;
  // The gates teleport onto the street: one road, gradient of epochs
  if (actionKey === 'gates_pass') {
    teleportWithFade(STREET_SPAWN.x, STREET_SPAWN.y, () => {
      // First-pass quiet line via the lore popup (dismissable, can't trap).
      if (consumeGatesLine()) {
        showLore('Эти врата были предназначены для тебя одного. Обычно это узнают позже.');
      }
    });
    return;
  }
  // Shop actions
  if (actionKey === 'shop1') { openShop('shop1'); return; }
  if (actionKey === 'shop2') { openShop('shop2'); return; }
  if (actionKey === 'shop3') { openShop('shop3'); return; }
  // Look-based actions
  const action = useTexts[actionKey];
  if (action) {
    showLook({ name: action.title, look: action.text });
  }
});

console.log(`ARDET V2 | viewport ${scaler.vw}×${scaler.vh} | scale ${scaler.scale}x | ${locations.length} locations`);
requestAnimationFrame(loop);

// Global error handler — shows crash on screen
window.onerror = (msg, src, line, col, err) => {
  document.body.innerHTML = '<pre style="color:red;padding:20px;font-size:14px">ARDET ERROR:\n' + msg + '\nLine: ' + line + '\n\n' + (err && err.stack || '') + '</pre>';
};
// build 1776974120
