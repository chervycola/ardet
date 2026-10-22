// ═══════════════════════════════════════
// ARDET V2 — main entry point
// ═══════════════════════════════════════
import { scaler } from './render/scaler.js';
import { layers } from './render/layers.js';
import { camera } from './render/camera.js';
import { lighting, lightParticles } from './render/lighting.js';
import { postfx } from './render/postfx.js';
import { ink } from './render/ink.js';
import { plate } from './render/plate.js';
import { lofi, LOFI_NAMES } from './render/lofi.js';
import { toxic } from './world/toxic.js';
import { stumble } from './world/stumble.js';
import { updateGeiger } from './audio/geiger.js';
import { wind } from './world/wind.js';
import { SURF, surfaceAt } from './world/surface.js';
import { drawGrass, stepGrass } from './render/grass.js';
import { initBunting, drawBunting, buntingPasses } from './render/bunting.js';
import { hazeView, hazeComposite, hazeOff } from './render/haze.js';
import { castShadows, maskFrom } from './render/shadows.js';
import { phaseAt, skyAt, shadowAt, dayIndex } from './world/sky.js';
import { redNoon, stepRedNoon, triggerRedNoon, muteRedNoon } from './world/redNoon.js';
import { pressAt, setPress, getPress, installPen, penComposite } from './render/pen.js';
import { drawEtchedGround } from './render/etch.js';
import { setReliefFlats, setReliefCarve } from './world/relief.js';
import { fireLights, fireSitesInView, drawFireSite, fireSitesAvoid } from './render/fireRing.js';
import { buildArteries, riverCarve, onArtery } from './world/arteries.js';
import { buildArteryProps, arteryPropsIn } from './render/arteryProps.js';
import { buildFlora, floraIn } from './world/flora.js';
import { buildFields } from './world/fields.js';
import { buildLandmarks, landmarks, landmarkBoxes } from './world/landmarks.js';
import { buildLandmarkProps, landmarkPropsIn } from './render/landmarkProps.js';
import { drawTree, treeCaster } from './render/floraProps.js';
import { updateWindSound } from './audio/windSound.js';
import { stepHangs } from './world/hang.js';
import { stepMechs, crankWell } from './world/mechanisms.js';
import { rect, clamp } from './render/draw.js';
import { MW, MH } from './world/terrain.js';
import { locations, attachContent, archEnsembles } from './world/locations.js';
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
import { showMenu, hideMenu, initUI, getActiveLoc, showLook, closeLook, menuInscriptions } from './ui/ui.js';
import { looks } from './content/looks.js';
import { dialogues } from './content/dialogues.js';
import { checkLorePickup, drawLoreItems, getCollectedCount, getTotalCount, loadCollected, getCollectedIds } from './world/lore.js';
import { saveGame, loadGame, startAutoSave } from './core/save.js';
import { setPlayer, setPosOverride } from './core/playerRef.js';
import { screenMoss, crackedGlass, dyingPixels, initMetaFx } from './render/metaFx.js';
import { showLore, draw as drawLorePopup, skipOrDismiss as dismissLore, isActive as loreActive } from './ui/lorepopup.js';
import { init as initTerminal, open as openTerminal } from './terminal/terminal.js';
import { initShop, openShop } from './ui/shop.js';
import { STREET_SPAWN, GATES_RETURN, STREET_X0, STREET_END_W, STREET_SHIFT, STREET_ROAD_Y, BRANCH_PLAIN, consumeGatesLine, worldSegmentAt } from './world/street.js';
import {
  init as initWorldMap, toggle as toggleWorldMap, isOpen as isMapOpen,
  markDiscovered as discoverGate,
  getDiscovered as getDiscoveredGates,
  loadDiscovered as loadDiscoveredGates,
} from './ui/worldmap.js';
import { initAudio, resumeAudio, startAmbient, playPickup, playClick, playDistantSound, playHeart, playMossGrow, playTick, playBlow, playInhale, playCrackle, playPour, playMurmur, playSigh } from './audio/audio.js';
import { beyond, stepPozemka, drawBeyondWorld, clearings as beyondClearings, drawHorizon } from './world/beyond.js';
import { initEditor } from './ui/editor.js';
import { drawEggObject } from './sprites/eggObjects.js';
import { TOWN, RING_W, RINGS, OFF, trailPoint, ringAt, inCore } from './world/disc.js';
import { SEGMENTS as EPOCHS } from './content/ulitsa_db.js';
import { drawGroundMarks, setTissueBlockers, buildTissue, tissueThingsIn } from './render/ground.js';
import { thingCaster } from './render/things.js';
import { buildTown, onBridge } from './world/town.js';
import { bridgePieces, townThingsIn } from './render/townProps.js';
import { drawCastle, stepCastle, castleSeen } from './render/castle.js';
import { drawArchLife } from './render/archlife.js';
import { STREAM, initStream } from './ui/stream.js';
import { prepareArchGround, drawArchGround, drawArchFoot, drawArchChar, archProps, archGroundRects } from './render/archground.js';
import { archWindowLights } from './render/archlights.js';
import { update as updateEdges, draw as drawEdges, slowFactor } from './world/edges.js';
import { updateZone, getZone } from './audio/zoneAmbient.js';
import { updateJester, drawJesterWandering, drawJesterGraffiti, getGraffiti, setGraffiti } from './world/wandering.js';
import { updateProximity, draw as drawInscriptions } from './world/inscriptions.js';
import { update as updateIdle, draw as drawIdle } from './world/idle.js';
import { check as checkWhisper, draw as drawWhisper, sayAt, quench as quenchWhisper, clear as clearWhisper, stepWhisper, drift as driftWhisper, whisperText } from './world/whisper.js';
import { update as updateParticles, draw as drawParticles, footstepDust, ashPuff, pickupSparkle, fireEmber } from './render/particles.js';
import { stepPuddles, drawPuddles, wetKind, usedWet } from './render/puddles.js';
import { addFootprint, drawFootprints, drawSmokeClouds, drawBloodMoon } from './render/atmosphere.js';
import { weather, update as updateWeather, drawAdditive as drawWeatherAdditive, drawOverlay as drawWeatherOverlay } from './render/weather.js';
import { init as initCursor, show as showCursor } from './ui/cursor.js';
import { update as updatePets, draw as drawPets } from './world/pets.js';
// Achievements removed entirely by design law #1 («глубина не геймифицируется»):
// no toasts, no counters, no ledger. The only permitted trace is the walk itself.
import { stepRavens, startleRavens, ravensOnGround, ravenDepth, drawRaven, drawRavenShadows, drawRavensAir } from './world/ravens.js';
import { stepCats, catsInView, catDepth, drawCat, drawCatEyes, getSightings, loadSightings, isUnlocked as catUnlocked, setUnlocked as setCatUnlocked } from './world/silentCat.js';
import { incrementSession, getShiftConfig, maybeShowBlankScreen } from './core/sessionMemory.js';
import { useTexts } from './world/useActions.js';
import { update as updateBrainrot, draw as drawBrainrot, isFrozen, enterLoop as enterBrainrotLoop, inLoop as inBrainrotLoop, setClearings, dampBrainrot } from './world/brainrot.js';
import { trigger as triggerEnding, isActive as isEndingActive, draw as drawEnding } from './world/ending.js';
import { update as updateMonsters, draw as drawMonsters } from './world/monsters.js';
import { update as updatePotemkin, revealOf, drawRevealed } from './world/potemkin.js';
import { signFacade } from './world/architecture.js';
import { under, moss, UW, UH, thingsNow, DESCENTS, thingById, accessOf, underMove, pathTo, surfaceUnder, underLights, UNDER_AMBIENT, wallSpot, FLEET_TEXT, JOURNAL_TEXT, FROST_FOREIGN } from './world/underside.js';
import { stepMossway } from './world/mossway.js';
import { crankTownWell, stepTownWell, stirTownWell, wellAccess, saveTownWell, loadTownWell } from './world/townWell.js';
import { drawUnderWorld, drawUnderThing, drawUnderFx, stepUnderLife, resetUnderLife, inhaleDust } from './render/underside.js';
import { UNDER_INSC } from './content/underside.js';

// ═══ INIT ═══
const mainCanvas = document.getElementById('game');
layers.init(mainCanvas);
installPen(layers.ctx('world')); installPen(layers.ctx('bg'));   // перо: толщина штриха — по нажиму суток
input.init(mainCanvas);
attachContent(looks, dialogues);
prepareArchGround(archEnsembles, locations);   // земля под постройками эпох
// артерии — дороги, река, дуги, линия неба — в обход построек, дворов, табличек и утвари
buildArteries([
  ...locations.map(l => ({ x0: l.x - 4, y0: l.y - 12, x1: l.x + l.w + 4, y1: l.y + l.h + 6 })),
  ...archGroundRects(),
  ...archProps.map(p => ({ x0: p.x - p.w / 2 - 2, y0: p.gy - 8, x1: p.x + p.w / 2 + 2, y1: p.gy + 3 })),
], [...locations, ...archProps.filter(p => p.name).map(p => ({ x: p.x - p.w / 2, y: p.gy - p.h, w: p.w, h: p.h }))]
  .map(l => ({ x0: l.x + 1, x1: l.x + l.w - 1, y: l.y + l.h })));   // подножия у тропы: дорога их обходит
buildTown();                                   // городок по канону: высохшее русло через посёлок, мост над ним
setReliefCarve(riverCarve);                    // река промыла себе долину
setReliefFlats(archGroundRects());             // под дворами и водой земля выровнена
buildArteryProps();                            // поднятое: акведуки, аркады, ЛЭП, эстакада, мосты
buildFields(archGroundRects());                // поля у дворов и вдоль дорог — бороздами в землю
buildLandmarks(); buildLandmarkProps();        // приметы: у реки, на вершинах, где дуга примыкает к дороге
buildFlora([...landmarkBoxes(), ...locations.map(l => ({ x0: l.x - 10, y0: l.y - 8, x1: l.x + l.w + 10, y1: l.y + l.h + 10 }))],
  landmarks.filter(l => l.kind === 'oasis'));   // рощи, аллеи, камыш, пальмы оазисов; у мест — поляны
fireSitesAvoid((x, y) => onArtery(x, y, 18));  // дорога проходит огонь насквозь
// ткань застройки не ложится на локации (с запасом над крышей) и дворы
setTissueBlockers([
  ...locations.map(l => ({ x0: l.x - 4, y0: l.y - 20, x1: l.x + l.w + 4, y1: l.y + l.h + 6 })),
  ...archGroundRects(),
]);
buildTissue(archProps.filter(p => p.name));    // утварь эпох в поле: не повторяет соседей и ближние дворы
initBunting(locations);                        // флаги Шута: гирлянда от фонаря к шесту
initUI();
initMetaFx();
initTerminal();
initShop();
initWorldMap({ getVisited: () => flags.visited, getLocked: () => !canLeaveSettlement() });

initCursor();
initAudio();
initEditor();

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
  x: TOWN.x0 + 800, y: TOWN.y0 + 740, tx: TOWN.x0 + 800, ty: TOWN.y0 + 740,
  dir: 1, moving: false, walkFrame: 0,
  vx: 0, vy: 0,          // скорость: догоняет желаемую с инерцией поверхности
  auto: false,           // идёт сам к точке клика (tx, ty)
};
setPlayer(player);
const flags = {
  talkedTo: new Set(),
  visited: new Set(),
  collectedLore: new Set(),
  observersSeen: new Set(),
};

// Session memory
const sessionAge = incrementSession();
const shiftCfg = getShiftConfig();
maybeShowBlankScreen();
console.log(`[session] visit #${sessionAge} | desat ${(shiftCfg.desaturation * 100).toFixed(1)}%`);

// Load saved progress
try {
  if (localStorage.getItem('ardet_save')) localStorage.removeItem('ardet_save');
} catch (e) {} // хранилище может быть закрыто (Brave и т.п.)
const savedData = STREAM ? null : loadGame();   // стрим — чистый забег
if (savedData) {
  if (savedData.player) {
    // поля мира могли стать шире: сдвиг по разнице отступов (старые сейвы — 2300)
    const dOff = OFF - (savedData.off || 2300);
    player.x = savedData.player.x + dOff; player.y = savedData.player.y + dOff;
  }
  if (savedData.talkedTo) savedData.talkedTo.forEach(n => flags.talkedTo.add(n));
  if (savedData.visited) savedData.visited.forEach(id => flags.visited.add(id));
  if (savedData.collectedLore) loadCollected(savedData.collectedLore);
  if (savedData.observersSeen) savedData.observersSeen.forEach(n => flags.observersSeen.add(n));
  if (savedData.graffiti) setGraffiti(savedData.graffiti);
  if (savedData.catSightings) loadSightings(savedData.catSightings);
  if (savedData.catUnlocked) setCatUnlocked(true);
  if (savedData.discoveredGates) loadDiscoveredGates(savedData.discoveredGates);
  if (savedData.under) under.load(savedData.under);
  if (savedData.well) loadTownWell(savedData.well);
}

if (!STREAM) startAutoSave(() => ({
  // из-под земли сохраняемся там, где спустился: заново спуститься — два шага
  player: under.active && under.ret ? { x: under.ret.x, y: under.ret.y } : { x: player.x, y: player.y }, off: OFF,
  talkedTo: Array.from(flags.talkedTo),
  visited: Array.from(flags.visited),
  observersSeen: Array.from(flags.observersSeen),
  collectedLore: getCollectedIds(),
  graffiti: getGraffiti(),
  catSightings: getSightings(),
  catUnlocked: catUnlocked(),
  discoveredGates: getDiscoveredGates(),
  under: under.save(),
  well: saveTownWell(),
}));
setPosOverride(() => (under.active ? under.ret : null));   // карта мира: странник там, где спустился
Object.assign(menuInscriptions, UNDER_INSC);

initStream({ locations, getVisited: () => flags.visited, getFrames: () => _t });

// Замок городка объясняет себя голосом мира — не чаще раза в полминуты
let lockHintAt = -99999;
function lockHint() {
  if (_t - lockHintAt < 1800) return;
  lockHintAt = _t;
  showLore('Табличка на столбе: «Выход из городка — по пропуску. Пропуска выдаёт Шут. Шут у костра».');
}

// Check if player can leave settlement
function canLeaveSettlement() {
  return flags.talkedTo.has('jester');
}

// ═══ LIGHTING SETUP from locations ═══
lighting.clear();
// Player lantern — follows player
lighting.add({ x: TOWN.x0 + 800, y: TOWN.y0 + 740, r: 55, color: [255, 180, 80], flicker: 0.1 });
// Location lights
for (const loc of locations) {
  if (!loc.light) continue;
  lighting.add({
    x: loc.x + (loc.light.dx ?? loc.w / 2),          // свет — откуда светит (окно), иначе — середина
    y: loc.y + (loc.light.dy ?? loc.h / 2),
    r: loc.light.r,
    color: loc.light.color,
    flicker: loc.light.flicker,
    bloom: loc.light.r > 50,
  });
}

// Огни доминант колец — видны из соседнего кольца
for (const loc of locations) {
  const L = loc.archLight;
  if (!L) continue;
  lighting.add({
    x: loc.archX + (L.dx || 0), y: loc.archGy + (L.dy || 0),
    r: L.r || 70, color: L.color || [226, 138, 58],
    flicker: L.flicker ?? 0.12, bloom: true,
  });
}

// Свет окон: где в постройке или утвари нарисована свеча — там и светит
for (const L of archWindowLights(locations, archProps)) lighting.add(L);
// костры кольца огня
for (const L of fireLights()) lighting.add(L);

// ═══ TIME ═══
import { t } from './core/time.js';
// Сутки — по канону v3.3 (world/sky.js): день 42% → сумерки 13% → ночь 37% →
// рассвет 8%, 12 минут, начало на 0.30 — «день клонится к вечеру».

// ═══ ТЕНИ ═══
// кто отбрасывает: локации (кроме плоского), утварь эпох, странник. Маска —
// один раз из рисунка вещи (render/shadows.js); здесь — как её нарисовать.
const FLAT = new Set(['riverbed', 'crater', 'lake', 'pit', 'basement', 'nocturnal', 'billboard', 'trap_puddle']);
// лежат в земле — рисуются под всем, что стоит (иначе песок равнины Лунного
// ложится поверх самого Лунного: его место ниже по глубине, чем край равнины)
const GROUND = new Set(['riverbed', 'crater', 'lake', 'pit', 'nocturnal', 'trap_puddle']);
// сидят внутри другого места — рисуются сразу после него (Старец — в палатке;
// кот на стопке книг — ещё позже: сидящий на вещи берёт её глубину +0,5, world/silentCat.js)
const INSIDE = { elder_home: 'tent' }, insideHost = new Map();
function depthOf(loc) {
  if (GROUND.has(loc.id)) return loc.y - 1e6;
  const hid = INSIDE[loc.id];
  if (hid) {
    let h = insideHost.get(hid);
    if (!h) { h = locations.find(l => l.id === hid); insideHost.set(hid, h); }
    if (h) return Math.max(loc.y + loc.h, h.y + h.h + 0.25);
  }
  return loc.y + loc.h;
}
const LIGHTS = new Set(['campfire', 'sol_home']);   // сами светят — тени не отбрасывают (Sol горит с основания)
const casterOf = new Map();
function locCaster(loc) {
  let c = casterOf.get(loc);
  if (!c) {
    c = { key: loc, ox: 0, oy: 0,
      build: () => maskFrom(g => {
        setCtx(g); drawLocation(g, loc);
        if (loc.npc && npcDrawFn[loc.npc]) npcDrawFn[loc.npc](loc.x, loc.y);
        setCtx(layers.ctx('world'));
      }, loc.x - 30, loc.y - 70, loc.w + 60, loc.y + loc.h) };
    casterOf.set(loc, c);
  }
  return c;
}
function propCaster(p) {
  let c = casterOf.get(p);
  if (!c) {
    c = { key: p, ox: 0, oy: 0, build: () => maskFrom(g => { setCtx(g); p.draw(g); setCtx(layers.ctx('world')); },
      Math.floor(p.x - p.w / 2 - 8), Math.floor(p.gy - p.h - 24), Math.ceil(p.w + 16), p.gy) };
    casterOf.set(p, c);
  }
  return c;
}
const heroCaster = { key: 'странник', ox: 0, oy: 0, build: () => maskFrom(g => {
  setCtx(g); drawPlayer({ x: 0, y: 0, dir: 1, moving: false, vx: 0, vy: 0 }); setCtx(layers.ctx('world'));
}, -6, -10, 26, 23) };
const heroSitCaster = { key: 'странник сидя', ox: 0, oy: 0, build: () => maskFrom(g => {
  setCtx(g); drawPlayer({ x: 0, y: 0, dir: 1, moving: false, vx: 0, vy: 0, sit: 1 }); setCtx(layers.ctx('world'));
}, -8, -10, 30, 23) };
const LOW = new Set(['reed', 'bush', 'stump', 'log', 'snag', 'deadreed']);   // низкое тени по солнцу не кладёт (трава и камни — тоже)
const FLATLM = new Set(['iceHole', 'boat', 'oasis']);   // приметы вровень с землёй
function shadowCasters(camX, camY, vw, vh) {
  const pad = 170, out = [];
  for (const loc of locations) {
    if (loc.x + loc.w < camX - pad || loc.x > camX + vw + pad || loc.y + loc.h < camY - 40 || loc.y - 80 > camY + vh + pad) continue;
    if (FLAT.has(loc.id) || LIGHTS.has(loc.id)) continue;
    out.push(locCaster(loc));
  }
  for (const p of archProps) {
    if (p.x + p.w < camX - pad || p.x - p.w > camX + vw + pad || p.gy < camY - 40 || p.gy - p.h > camY + vh + pad) continue;
    out.push(propCaster(p));
  }
  for (const p of arteryPropsIn(camX - pad, camY - 40, camX + vw + pad, camY + vh + pad)) if (!p.noShadow) out.push(propCaster(p));
  for (const tr of floraIn(camX - pad, camY - 40, camX + vw + pad, camY + vh + pad)) if (!LOW.has(tr.sp)) out.push(treeCaster(tr, maskFrom));
  for (const p of landmarkPropsIn(camX - pad, camY - 40, camX + vw + pad, camY + vh + pad, t)) if (!FLATLM.has(p.kind)) out.push(propCaster(p));
  for (const T of tissueThingsIn(camX - pad, camY - 40, camX + vw + pad, camY + vh + pad)) out.push(thingCaster(T, maskFrom));   // ткань поля
  for (const T of townThingsIn(camX - pad, camY - 40, camX + vw + pad, camY + vh + pad)) out.push(thingCaster(T, maskFrom));     // квартал: стены, фонари
  for (const p of bridgePieces()) if (p.x + p.w > camX - pad && p.x - p.w < camX + vw + pad && p.gy > camY - 40 && p.gy - p.h < camY + vh + pad) out.push(propCaster(p));
  const hero = (player.sit || 0) > 0.5 ? heroSitCaster : heroCaster;   // сел — и тень села
  hero.ox = player.x; hero.oy = player.y;
  out.push(hero);
  return out;
}
// тёплые огни в кадре (точки кадра) — для пера: огонь всегда сплошной
let warmSpots = [];
function warmIn(camX, camY, vw, vh) {
  const out = [];
  for (const L of lighting.sources) {
    const c = L.color || [255, 180, 80];
    if (c[0] < c[1] + 30) continue;                 // не тёплый (экран терминала, луна)
    const x = L.x - camX, y = L.y - camY, r = Math.max(6, L.r * 0.5);
    if (x + r < 0 || x - r > vw || y + r < 0 || y - r > vh) continue;
    out.push({ x, y, r });
  }
  return out;
}
// светит ли в точке чужой свет (не уголь в груди — он источник номер ноль)
function litAt(x, y) {
  const S = lighting.sources;
  for (let i = 1; i < S.length; i++) {
    const L = S[i], R = L.r * 1.2;
    if (Math.abs(L.x - x) < R && Math.abs(L.y - y) < R && Math.hypot(L.x - x, L.y - y) < R) return true;
  }
  return false;
}
let fireLocS;
function fireShadow(sk, camX, camY, vw, vh) {
  if (fireLocS === undefined) fireLocS = locations.find(l => l.id === 'campfire') || null;
  if (!fireLocS) return null;
  const x = fireLocS.x + 18, y = fireLocS.y + 20, r = 120;
  if (x + r < camX || x - r > camX + vw || y + r < camY || y - r > camY + vh) return null;
  const sun = sk.sun ? Math.min(1, sk.sun.elev / 0.35) : 0;     // днём тени от огня съедает солнце
  // огонь дышит (канон Г-10): вспыхивает и опадает в такт своему свечению — та же
  // волна, что у света (render/lighting.js), — и клонится то вправо, то влево, как пламя
  const breath = Math.sin(t * 0.07 + (fireLocS.x + fireLocS.w / 2) * 0.1);
  const sway = Math.sin(t * 0.025 + 2.2) * 3;
  const k = (1 - sun) * (1 + 0.1 * breath);
  return { x: x + sway, y, r, a: 0.62 * k, wash: 0.24 * k, breath };
}

// свет для земли штрихом: откуда светит (угол на земле — против тени, по глубине
// вдвое), сила дня (низкое солнце — резче; у горизонта гаснет), сила луны, нажим пера.
// Красный полдень — час без теней: штрих теряет свет вместе с тенями
function groundLight() {
  const p = phaseAt(t), sk = skyAt(p), sh = shadowAt(p), fade = 1 - redNoon.k;
  let day = 0;
  if (sk.sun) { const e = sk.sun.elev, k = Math.min(1, e / 0.12); day = k * k * (3 - 2 * k) * (1.25 - 0.55 * e) * fade; }
  return { ang: Math.atan2(-sh.dy * 2, -sh.dx), day, night: sk.moon * fade, press: getPress() };
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
  if (under.active) { renderUnder(); return; }
  const vw = scaler.vw, vh = scaler.vh;
  layers.clearAll();

  const bgCtx = layers.ctx('bg');
  const worldCtx = layers.ctx('world');
  const lightCtx = layers.ctx('light');
  const uiCtx = layers.ctx('ui');
  const postCtx = layers.ctx('post');

  // ── BG: земля штрихом по рельефу — весь диск и городок ──
  const shk = stumble.shake();             // телефон жужжит — кадр подрагивает
  const camX = Math.round(camera.x) + shk.x;
  const camY = Math.round(camera.y) + shk.y;
  drawEtchedGround(bgCtx, camX, camY, vw, vh, groundLight());
  // замок-погода: над городком, в полосе неба; буря и красный полдень его прячут
  if (!NO_CASTLE) drawCastle(bgCtx, { x: camX, y: camY }, vw, vh, castleSeen(weather.state !== 'clear' ? weather.intensity : 0, redNoon.k));

  // ── BG: atmosphere ──
  ink.drawMoon(bgCtx, { x: camX, y: camY });
  drawSmokeClouds(bgCtx, { x: camX, y: camY });

  // ── WORLD: locations + player ──
  worldCtx.save();
  worldCtx.translate(-camX, -camY);
  setCtx(worldCtx);

  drawArchGround(worldCtx, camX, camY, vw, vh);   // дворы, тени, тропинки под постройками
  drawGroundMarks(worldCtx, { x: camX, y: camY });
  drawPuddles(worldCtx, camX, camY, vw, vh, locations, player);   // лужи после дождя, круги
  drawFootprints(worldCtx, { x: camX, y: camY });
  drawRavenShadows(worldCtx, camX, camY, vw, vh);   // тени летящих ворон — на земле
  stumble.drawStones(worldCtx);
  if (!NO_GRASS) drawGrass(worldCtx, { x: camX, y: camY }, player);   // трава гнётся по ветру и расступается
  if (!NO_SHADOW) {                                 // тени по времени суток и от костра
    const sk = skyAt(phaseAt(t)), fade = 1 - redNoon.k;     // красный полдень — час без теней
    const sun = shadowAt(phaseAt(t)), fs = fireShadow(sk, camX, camY, vw, vh);
    sun.a *= fade; sun.wash *= fade; if (fs) { fs.a *= fade; fs.wash *= fade; }
    castShadows(worldCtx, camX, camY, vw, vh, shadowCasters(camX, camY, vw, vh), sun, fs);
  }

  // локации (с постройками эпох), заборы дворов и странник — по глубине:
  // за домом странника не видно, перед домом — видно
  const drawList = [];
  for (const loc of locations) {             // с запасом: столбы, флаги, пар выходят за рамку места
    if (camera.isVisible(loc.x - 32, loc.y - 64, loc.w + 64, loc.h + 72)) drawList.push({ k: depthOf(loc), loc });
  }
  for (const p of archProps) {
    if (camera.isVisible(p.x - p.w / 2 - 2, p.gy - p.h, p.w + 4, p.h + 2)) drawList.push({ k: p.gy, prop: p });
  }
  for (const p of arteryPropsIn(camX - 4, camY - 4, camX + vw + 4, camY + vh + 80)) drawList.push({ k: p.gy, prop: p });   // акведуки, ЛЭП, мосты
  for (const tr of floraIn(camX - 18, camY - 4, camX + vw + 18, camY + vh + 46)) drawList.push({ k: tr.gy, tree: tr });   // рощи и камыш
  for (const p of landmarkPropsIn(camX - 20, camY - 4, camX + vw + 20, camY + vh + 40, t)) drawList.push({ k: p.gy, prop: p });   // приметы
  for (const T of tissueThingsIn(camX - 4, camY - 4, camX + vw + 4, camY + vh + 40)) drawList.push({ k: T.gy, prop: T });   // ткань поля — стоит в земле
  for (const T of townThingsIn(camX - 4, camY - 4, camX + vw + 4, camY + vh + 40)) drawList.push({ k: T.gy, prop: T });     // квартал городка
  for (const p of bridgePieces()) if (camera.isVisible(p.x - p.w / 2, p.gy - p.h, p.w, p.h + 4)) drawList.push({ k: p.gy, prop: p });   // мост: дальние перила — за странником, ближние — перед
  for (const b of buntingPasses()) drawList.push({ k: b.k, bunting: b.pass });   // флаги Шута: перед костром, за Шутом
  for (const c of catsInView(camX, camY, vw, vh)) drawList.push({ k: catDepth(c), cat: c });
  for (const b of ravensOnGround(camX, camY, vw, vh)) drawList.push({ k: ravenDepth(b), raven: b });
  for (const f of fireSitesInView(camX, camY, vw, vh)) drawList.push({ k: f.y, fire: f });   // костры кольца огня
  drawList.push({ k: player.y + 24, player: true });
  drawList.sort((p, q) => p.k - q.k);
  for (const it of drawList) {
    if (it.bunting) { drawBunting(worldCtx, { x: camX, y: camY }, vw, vh, it.bunting); continue; }
    if (it.cat) { drawCat(worldCtx, it.cat, player); continue; }
    if (it.raven) { drawRaven(worldCtx, it.raven); continue; }
    if (it.fire) { drawFireSite(worldCtx, it.fire, t); continue; }
    if (it.tree) { drawTree(worldCtx, it.tree, t); continue; }
    if (it.player) {
      const so = stumble.offset();
      worldCtx.save(); worldCtx.translate(so.x, so.y);
      drawPlayer(player);
      worldCtx.restore();
      stumble.drawFront(worldCtx);
      continue;
    }
    if (it.prop) { it.prop.draw(worldCtx); continue; }
    const loc = it.loc;
    drawLocation(worldCtx, loc);
    if (loc.npc && npcDrawFn[loc.npc]) {
      npcDrawFn[loc.npc](loc.x, loc.y);
    }
  }

  if (!redNoon.active) {                            // красный полдень: пасхалки прячутся
    drawLoreItems({ x: camX, y: camY });
    drawInscriptions({ x: camX, y: camY }, locations);
  }
  drawJesterGraffiti({ x: camX, y: camY });
  drawJesterWandering({ x: camX, y: camY }, locations);
  drawPets({ x: camX, y: camY });
  drawMonsters({ x: camX, y: camY });
  drawParticles(worldCtx, { x: camX, y: camY });
  drawBeyondWorld(worldCtx, camX, camY, vw, vh);    // за кольцом: позёмка растра, собранный кадр
  drawRavensAir(worldCtx, camX, camY, vw, vh);      // летящие вороны — в воздухе, над всем
  toxic.drawWorld(worldCtx);

  drawWorldWhisper({ x: camX, y: camY });

  worldCtx.restore();
  hazeView(camX, camY, vw, vh, locations, redNoon.k);   // марево: над костром, над Sol, в гари, в полдень — везде
  warmSpots = warmIn(camX, camY, vw, vh);           // тёплые огни кадра — перо их не трогает

  // группа второй краски — те же вещи, отдельным прогоном
  ink.drawGroup((c, loc) => { setCtx(c); drawLocation(c, loc); }, camX, camY);
  setCtx(worldCtx);

  // ── LIGHT: additive lighting ──
  if (lighting.sources[0]) {
    lighting.sources[0].x = player.x + 6;
    lighting.sources[0].y = player.y + 10;
  }
  // Readability floor: night was 0.28 (28% brightness through the
  // multiply layer) — dramatic on a desk, near-black on a phone in
  // daylight. 0.40 keeps lamps/campfire meaningful but terrain legible.
  const ambient = skyAt(phaseAt(t)).light;      // сутки по канону: 0.40 ночь … 0.82 полдень
  lighting.render(lightCtx, { x: camX, y: camY }, ambient);

  // Atmospheric particles in lit areas (render on world layer for depth)
  const camObj = { x: camX, y: camY };
  lightParticles.draw(worldCtx, camObj);

  // ── FX (additive): rain streaks, lightning, cracks, dying pixels ──
  const fxCtx = layers.ctx('fx');
  crackedGlass.draw(fxCtx);
  dyingPixels.draw(fxCtx);
  drawCatEyes(fxCtx, camX, camY, player);   // глаза кота отражают огонь странника
  drawWeatherAdditive(fxCtx);
  drawEdges(fxCtx);

  // ── UI (normal blend): weather overlay + moss, then HUD on top ──
  drawWeatherOverlay(uiCtx);
  setClearings(beyondClearings(camX, camY));        // собранный кадр позёмки — без растра распада
  dampBrainrot(beyond.hK);                          // горизонт виден — распад редеет
  drawBrainrot(uiCtx);
  drawHorizon(uiCtx, vw, vh);                       // столб за кольцом: черта далеко впереди, над ней вечер
  screenMoss.draw(uiCtx);
  drawHUD(uiCtx);
  ink.drawLabel(uiCtx);

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

// ═══ ВТОРАЯ КРАСКА: острые моменты ═══
// норма — луна и полоса неба; осмотр печатает вещь (и её родню в кадре)
// красным; огонь и брейнрот заливают воздух; за краем красное гаснет.
let jesterFirstTalk = false;          // первая встреча с Шутом — острый момент
const NO_PLATE = /[?&]noplate\b/.test(location.search);
const NO_GRASS = /[?&]nograss\b/.test(location.search);   // для сравнения и слабых машин
const NO_SHADOW = /[?&]noshadow\b/.test(location.search); // тени по времени суток — выключить (сравнить)
const NO_CASTLE = /[?&]nocastle\b/.test(location.search); // замок-погода и крыши — выключить (сравнить)
layers.inkPass = (ctx, main) => {
  hazeComposite(ctx, main);              // марево — в мире, до печати (зерно и краска на бумаге)
  ink.composite(ctx, main);
  penComposite(ctx, main, warmSpots);    // перо к ночи сухое: светлый штрих рвётся, огонь — сплошной
  if (!NO_PLATE) plate.composite(ctx);
  ctx.save(); ctx.setTransform(scaler.scale, 0, 0, scaler.scale, 0, 0);
  toxic.drawScreen(ctx);                 // код сочится сквозь кадр
  ctx.restore();
  lofi.composite(ctx, main);             // сбой копии — последним, ловит всё под интерфейсом
};
// шторм пластины: непогода, молния, брейнрот; O (Щ) — проверка руками
let stormTest = /[?&]storm\b/.test(location.search);
function plateStorm() {
  let st = 0;
  if (weather.state !== 'clear') st += weather.intensity * (weather.state === 'sandstorm' ? 0.9 : 0.6);
  if (weather.lightning > 28) st += 1;
  if (isFrozen() || inBrainrotLoop()) st += 0.6;
  if (stormTest) st += 1;
  return Math.min(1, st);
}
// ═══ ШАГ ЭФФЕКТОВ ═══
// Всё, что живёт во времени помимо updateGame: ветер, вторая краска,
// пластина, яд, счётчик, сбои, трава, частицы света. Идёт и в меню, и в
// разговоре — ровно 60 раз в секунду (см. loop); render только рисует.
function stepFx() {
  if (under.active) { stepFxUnder(); return; }
  const camX = Math.round(camera.x), camY = Math.round(camera.y);
  const ring = ringAt(player.x + 6, player.y + 24);
  wind.update(weather.state, weather.intensity, ring, inCore(player.x + 6, player.y + 24));
  updateWindSound(wind.at(player.x + 6, player.y + 10).s * (1 - 0.8 * redNoon.k) * (1 - 0.75 * beyond.hK));   // в полдень в ушах тихо; при горизонте — тоже
  stepGrass(player);
  stepHangs(player);                      // подвесы: колокола, вывески, плита на кране
  stepMechs();                            // механизмы: флюгер, ветряк, маховик, ворот
  stepTownWell(player);                   // колодец у площади: мимо прошёл — ворот поскрипел
  stepMossway(player, skyAt(phaseAt(t)).moon > 0.5, dayIndex(t));   // пифос ночью шепчет тому, кто задержался
  // за кольцом, на северной равнине: позёмка растра метёт и бормочет; неподвижный взгляд собирает кадр
  beyond.step(player.x + 6, player.y + 23, player.moving, !state.is('game'));
  player.sit = player.moving ? 0 : (player.sit || 0) + ((beyond.seated ? 1 : 0) - (player.sit || 0)) * 0.12;   // садится смотреть; шагнул — встал
  player.visor = beyond.visor;                       // у столба: ладонь козырьком, пока черта видна
  stepPozemka(camX, camY, scaler.vw, scaler.vh);
  if (beyond.murmur) playMurmur(beyond.murmur);
  if (beyond.sighSnd) { playSigh(); beyond.sighSnd = false; }
  if (beyond.say) { showLore(beyond.say); beyond.say = null; }
  if (under.shadow && skyAt(phaseAt(t)).sun) under.shadow = false;   // тень цветка держится до первого дневного света
  stepCastle(!player.moving && onBridge(player.x + 6, player.y + 23));   // кто стоит на мосту, тому туман расходится
  stepCats(player, locations);            // кот: пугается бегущего, к стоящему идёт греться
  stepRavens(player, locations, weather); // вороны: стаи взлетают от шагов, падения, грома
  stepPuddles(player, surfName, weather, { x: camX, y: camY, vw: scaler.vw, vh: scaler.vh }, locations);
  setPress(pressAt(phaseAt(t)));          // перо: к ночи исписалось, на рассвете обмакнули
  // красный полдень: очень редкий, около полудня; юг (у него киноварь всегда) почти не видит его глазом
  stepRedNoon(t, phaseAt(t), dayIndex(t));
  {
    const sx = player.x + 6, sy = player.y + 24, ds = sy - TOWN.y1;
    const south = ds > 0 && ds >= Math.max(TOWN.y0 - sy, TOWN.x0 - sx, sx - TOWN.x1);
    ink.noon(redNoon.k * (south ? 0.25 : 1));
  }
  ink.sky(true);
  ink.beginFrame();
  if (ring === RINGS + 2) ink.want(0, 'за краем');
  if (ring === RINGS + 1) ink.want(3, 'кольцо огня');
  if (isFrozen() || inBrainrotLoop()) ink.want(3, 'брейнрот');
  if (jesterFirstTalk && !state.is('dialogue') && !state.is('menu')) jesterFirstTalk = false;
  if (jesterFirstTalk) ink.want(3, 'первый разговор с Шутом');
  if (isEndingActive()) ink.want(3, 'финал');
  const focus = getActiveLoc();
  if (focus) ink.want(2, 'осмотр');
  // группа: вещь в фокусе (или, при ручной проверке, ближайшая постройка) и её родня в кадре
  let anchor = focus;
  if (!anchor && ink.isOverride() && ink.level === 2) {
    let bd = 1e9;
    for (const l of locations) {
      if (!l.archDraw) continue;
      const d = Math.hypot(l.archX - player.x, l.archGy - player.y);
      if (d < bd) { bd = d; anchor = l; }
    }
  }
  if (anchor && ink.level === 2) {
    const inView = l => l.x + l.w > camX && l.x < camX + scaler.vw && l.y + l.h > camY - 60 && l.y < camY + scaler.vh;
    ink.setGroup(locations.filter(l => l === anchor || (inView(l) && (anchor.archDraw
      ? l.archDraw && l.archRing === anchor.archRing && l.archSide === anchor.archSide
      : l.name === anchor.name))));
  } else if (ink.level !== 2) ink.setGroup([]);
  ink.update();
  const st = plateStorm();
  plate.update(player.x + 6, player.y + 24, st);
  // токсичная окраина городка — фон для прибора; брейнрот — почти предел
  const toxBase = (isFrozen() || inBrainrotLoop()) ? 0.9 : getZone(player.x + 6, player.y + 24) === 'toxic' ? 0.18 : 0;
  const tx = toxic.update(player.x + 6, player.y + 24, locations, toxBase);
  updateGeiger(tx);
  lofi.update(Math.min(1, Math.max(st, tx * 0.6, ring >= 8 && ring <= RINGS ? 0.25 : 0)));
  toxic.step(camX, camY, locations, wind);
  // частицы света, умирающие пиксели, мох по краям экрана
  if (lighting.sources[0]) { lighting.sources[0].x = player.x + 6; lighting.sources[0].y = player.y + 10; }
  lightParticles.update({ x: camX, y: camY }, lighting.sources);
  dyingPixels.update();
  screenMoss.update(player.moving);
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

// Location draw: real sprite if migrated, placeholder otherwise.
// Подделка под неподвижным взглядом проявляется (потёмкинская скорость).
function drawLocation(ctx, loc) {
  const k = revealOf(loc);
  if (k > 0.01) {
    const gy = loc.y + loc.h;
    const box = loc.streetForm
      ? { x: loc.x + 7 - 20, y: gy - 44, w: 40, h: 44 }
      : { x: loc.x - 10, y: loc.y - 24, w: loc.w + 20, h: loc.h + 24 };
    drawRevealed(ctx, loc, k, c => drawLocationPlain(c, loc), box);
    return;
  }
  drawLocationPlain(ctx, loc);
}

function drawLocationPlain(ctx, loc) {
  if (loc.archDraw) {
    if (loc.archFlip) {                     // повтор вида — зеркально
      ctx.save(); ctx.translate(2 * loc.archX, 0); ctx.scale(-1, 1);
      loc.archDraw(ctx, loc.archX, loc.archGy, t);
      ctx.restore();
    } else loc.archDraw(ctx, loc.archX, loc.archGy, t);
    if (loc.archMirror) drawMirrorCandle(ctx, loc);
    drawArchLife(ctx, loc, t, { x: player.x + 6, y: player.y + 24 });
    drawArchChar(ctx, loc);
    drawArchFoot(ctx, loc);
    return;
  }
  if (loc.streetForm) { drawStreetSign(ctx, loc); return; }
  if (loc.drawSelf) { loc.drawSelf(ctx, loc, t); return; }
  const fn = locSprites['draw_' + loc.id];
  if (fn) {
    fn(loc.x, loc.y);
  } else if (!loc.npc) {                     // дом фигуры — сама фигура: без цветной заглушки и подписи
    drawLocationPlaceholder(ctx, loc);
  }
}

// Зеркальная стена отражает единственный тёплый свет рядом — свечу странника
function drawMirrorCandle(ctx, loc) {
  const M = loc.archMirror;
  const px = player.x + 6, feet = player.y + 24;
  const d = feet - loc.archGy;
  if (d < -4 || d > 160 || Math.abs(px - loc.archX) > loc.w / 2 + 40) return;
  const x0 = loc.archX + M.x0, x1 = loc.archX + M.x1;
  if (px < x0 + 1 || px > x1 - 2) return;
  const top = loc.archGy + M.y0, bot = loc.archGy + M.y1;
  const ry = Math.round(Math.max(top + 2, Math.min(bot - 6, bot - 8 - d * 0.25)));
  const rx = Math.round(px);
  ctx.globalAlpha = 0.85 - Math.min(0.5, d / 320);
  ctx.fillStyle = '#3a3026'; ctx.fillRect(rx - 1, ry, 3, 7);       // силуэт, тусклый
  ctx.fillStyle = '#E28A3A'; ctx.fillRect(rx, ry + 3, 1, 2);       // свеча
  ctx.globalAlpha = 1;
}

// ═══ ТАБЛИЧКИ ПО ЭПОХАМ ═══
// Форма та же (табличка, стойка, ларёк, стена), материал — века:
// древность — камень, средние века и XVII — дерево, XVIII–XIX — чугун и
// крашеная доска, XX — эмаль, неон — эмаль и жесть, «сейчас» — табло.
function eraOf(n) {
  if (n <= 2) return 'stone';
  if (n <= 4) return 'wood';
  if (n <= 6) return 'iron';
  if (n <= 8) return 'enamel';
  if (n === 9) return 'led';
  return null;
}
function drawEraSign(ctx, form, ring, x, gy, loc) {
  const era = eraOf(ring);
  if (!era || form === 'fire') return false;
  const R = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(a, b, w, h); };
  const STONE = '#3a3328', STONE2 = '#34302a', EDGE = '#8A8D8F', BONE = '#D9CFB8', NIGHT = '#0D0B0A';
  const WOOD = '#3a2818', WOOD2 = '#241c14', IRON = '#15100c', SEP = '#3A3026', CIN = '#C23B2B';
  const plaque = form === 'plaque' || !form;
  if (era === 'stone') {
    if (plaque) {          // стела на цоколе, строки вырезаны
      R(x - 6, gy - 3, 13, 3, STONE2); R(x - 4, gy - 21, 9, 18, STONE);
      R(x - 4, gy - 21, 1, 18, EDGE); R(x - 3, gy - 22, 7, 1, STONE);
      for (let i = 0; i < 4; i++) R(x - 2, gy - 18 + i * 3, 5, 1, NIGHT);
    } else if (form === 'stand') {   // каменный стол-жертвенник
      R(x - 7, gy - 10, 14, 3, STONE); R(x - 7, gy - 10, 14, 1, EDGE);
      R(x - 5, gy - 7, 3, 7, STONE2); R(x + 2, gy - 7, 3, 7, STONE2);
    } else if (form === 'kiosk') {   // прилавок под холстом
      R(x - 8, gy - 17, 16, 3, SEP); R(x - 8, gy - 17, 16, 1, EDGE); R(x - 7, gy - 14, 1, 14, WOOD2); R(x + 6, gy - 14, 1, 14, WOOD2);
      R(x - 6, gy - 7, 12, 3, STONE); R(x - 6, gy - 7, 12, 1, EDGE);
    } else if (form === 'surface') { // кладка из блоков
      R(x - 8, gy - 16, 16, 16, STONE);
      for (let r = 0; r < 4; r++) R(x - 8, gy - 16 + r * 4, 16, 1, STONE2);
      R(x - 8, gy - 16, 16, 1, EDGE);
    } else return false;
    return true;
  }
  if (era === 'wood') {
    if (plaque) {          // доска на столбе, гвозди
      R(x, gy - 14, 2, 14, WOOD2); R(x - 5, gy - 19, 12, 7, WOOD);
      R(x - 5, gy - 19, 12, 1, EDGE); R(x - 4, gy - 17, 1, 1, EDGE); R(x + 5, gy - 17, 1, 1, EDGE);
      R(x - 3, gy - 16, 8, 1, SEP);
    } else if (form === 'stand') {   // пюпитр
      R(x - 6, gy - 15, 12, 4, WOOD); R(x - 6, gy - 15, 12, 1, EDGE);
      R(x - 1, gy - 11, 2, 11, WOOD2); R(x - 4, gy - 1, 8, 1, WOOD2);
    } else if (form === 'kiosk') {   // лавка со ставней
      R(x - 7, gy - 14, 14, 14, WOOD2); R(x - 8, gy - 16, 16, 2, WOOD); R(x - 8, gy - 16, 16, 1, EDGE);
      R(x - 5, gy - 10, 10, 5, NIGHT); R(x - 5, gy - 5, 10, 1, WOOD);
    } else if (form === 'surface') { // тёсаная стена
      R(x - 8, gy - 16, 16, 16, WOOD2);
      for (let c = 0; c < 4; c++) R(x - 8 + c * 4, gy - 16, 1, 16, WOOD);
      R(x - 8, gy - 16, 16, 1, EDGE);
    } else return false;
    return true;
  }
  if (era === 'iron') {
    if (plaque) {          // чугунный столб, крашеная доска в раме
      R(x, gy - 15, 2, 15, IRON); R(x - 1, gy - 2, 4, 2, IRON);
      R(x - 6, gy - 21, 14, 7, IRON); R(x - 5, gy - 20, 12, 5, '#c8b89a');
      R(x - 4, gy - 18, 10, 1, SEP); R(x + 1, gy - 23, 1, 2, IRON);
    } else if (form === 'stand') {   // мольберт с афишей
      R(x - 5, gy - 18, 10, 10, '#c8b89a'); R(x - 5, gy - 18, 10, 1, IRON);
      R(x - 4, gy - 15, 8, 1, SEP); R(x - 4, gy - 12, 6, 1, SEP);
      R(x - 5, gy - 8, 1, 8, IRON); R(x + 4, gy - 8, 1, 8, IRON);
    } else if (form === 'kiosk') {   // тумба с куполком
      R(x - 5, gy - 16, 10, 16, IRON); R(x - 4, gy - 14, 8, 9, '#c8b89a');
      R(x - 6, gy - 18, 12, 2, IRON); R(x - 1, gy - 20, 2, 2, IRON);
      R(x - 3, gy - 12, 6, 1, SEP); R(x - 3, gy - 9, 5, 1, SEP);
    } else if (form === 'surface') { // кирпич
      R(x - 8, gy - 16, 16, 16, '#3a2418');
      for (let r = 0; r < 5; r++) R(x - 8, gy - 16 + r * 3 + 2, 16, 1, '#2a1a12');
    } else return false;
    return true;
  }
  if (era === 'enamel') {
    if (plaque) {          // эмалевая табличка: светлое поле, тёмный кант, сколы
      R(x, gy - 14, 2, 14, '#2a2620'); R(x - 6, gy - 20, 14, 8, NIGHT);
      R(x - 5, gy - 19, 12, 6, BONE); R(x - 4, gy - 17, 10, 1, NIGHT); R(x - 4, gy - 15, 7, 1, NIGHT);
      R(x + 4, gy - 19, 2, 2, NIGHT);
    } else if (form === 'stand') {   // доска объявлений, листки
      R(x - 7, gy - 17, 14, 11, '#2a2620'); R(x - 6, gy - 16, 5, 4, BONE); R(x, gy - 15, 5, 5, '#c8b89a');
      R(x - 5, gy - 10, 4, 3, BONE); R(x - 6, gy - 6, 1, 6, '#2a2620'); R(x + 5, gy - 6, 1, 6, '#2a2620');
    } else if (form === 'kiosk') {   // ларёк со стеклом
      R(x - 7, gy - 15, 14, 15, '#2a2620'); R(x - 6, gy - 13, 12, 6, '#34302a');
      R(x - 6, gy - 13, 12, 1, EDGE); R(x - 8, gy - 16, 16, 1, CIN); R(x - 2, gy - 6, 4, 6, NIGHT);
    } else if (form === 'surface') { // бетонная стена
      R(x - 8, gy - 16, 16, 16, '#34302a'); R(x - 8, gy - 16, 16, 1, EDGE);
      R(x, gy - 16, 1, 16, NIGHT);
    } else return false;
    return true;
  }
  // led: табло — тёмное стекло, строки пепла, бегущая точка
  const tick = Math.floor(t / 12);
  if (plaque || form === 'stand') {
    const top = plaque ? gy - 21 : gy - 17;
    if (plaque) R(x, gy - 13, 2, 13, '#2a2620'); else { R(x - 6, gy - 6, 1, 6, '#2a2620'); R(x + 5, gy - 6, 1, 6, '#2a2620'); }
    R(x - 7, top, 15, 9, NIGHT); R(x - 7, top, 15, 1, '#2a2620');
    for (let i = 0; i < 3; i++) R(x - 5, top + 2 + i * 2, 11 - ((i * 3 + tick) % 5), 1, EDGE);
    R(x - 5 + (tick % 11), top + 7, 1, 1, BONE);
  } else if (form === 'kiosk') {   // стеклянный куб, экран заказа
    R(x - 7, gy - 15, 14, 15, '#1a2030'); R(x - 7, gy - 15, 14, 1, EDGE); R(x - 7, gy - 15, 1, 15, EDGE);
    R(x - 4, gy - 11, 8, 5, NIGHT); R(x - 3, gy - 10, (tick % 6) + 1, 1, EDGE);
  } else if (form === 'surface') {
    R(x - 8, gy - 16, 16, 16, NIGHT); R(x - 8, gy - 16, 16, 1, EDGE);
    for (let i = 0; i < 4; i++) R(x - 6, gy - 13 + i * 3, 12 - ((i + tick) % 4) * 2, 1, '#34302a');
  } else return false;
  return true;
}

// ═══ STREET SIGNS — small pixel landmarks by form ═══
function drawStreetSign(ctx, loc) {
  const x = loc.x + 7;            // anchor center
  const gy = loc.y + loc.h;       // ground line
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x - 5, gy, 10, 2);

  // Именная вещь фонда — свой спрайт вместо типовой формы
  if (loc.streetSprite && drawEggObject(ctx, loc.streetSprite, x, gy, t)) {
    if (loc.streetLive) drawLiveScaffold(ctx, loc, x, gy);
    return;
  }

  const form = loc.streetForm;
  // дом табличек — в архитектуре своего кольца и стороны света
  if (form === 'building') {
    const facade = signFacade(loc.streetSeg, loc.streetSide);
    if (facade) {
      facade(ctx, x, gy, t);
      if (loc.streetLive) drawLiveScaffold(ctx, loc, x, gy);
      return;
    }
  }
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

  // табличка в материале своей эпохи: стела → доска → чугун → эмаль → табло
  if (form !== 'building' && drawEraSign(ctx, form, loc.streetSeg, x, gy, loc)) {
    if (loc.streetLive) drawLiveScaffold(ctx, loc, x, gy);
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
  if (loc.streetLive) drawLiveScaffold(ctx, loc, x, gy);
}

function drawLiveScaffold(ctx, loc, x, gy) {
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

// Dev overlay only with ?debug in the URL — players shouldn't see
// coordinates and state internals.
const DEBUG_HUD = typeof location !== 'undefined' && /[?&]debug\b/.test(location.search);

function drawHUD(ctx) {
  drawLorePopup(ctx);
  if (!redNoon.active) drawIdle(ctx);             // в полдень мир молчит

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
  // Других трещин нет: экран бьётся только от молнии и от падения
  // в брейнрот (brainrot.js) — решение автора.
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
      player.moving = false; player.auto = false; player.vx = 0; player.vy = 0;
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

// ═══ ИЗНАНКА: спуск, подъём, ходьба, кадр ═══
// Отдельная карта под городком (world/underside.js). Спуск — повторное
// «использовать» после сцены места; подъём — лестница своей комнаты, обычно
// далеко от входа, или поезд метро по билету — к колодцу у площади. Пока
// внизу — мира сверху нет: ни неба, ни погоды, ни ворон; свет — уголёк
// странника; время идёт, как шло.
let surfaceLights = null;
function goUnder(stairId) {
  const th = thingById(stairId);
  if (!th) return;
  const a = accessOf(th), retX = player.x, retY = player.y;
  teleportWithFade(a.x, a.y, () => {
    under.enter(retX, retY);
    clearWhisper();                                 // шёпот сверху остался наверху
    muteRedNoon(true);
    if (!surfaceLights) surfaceLights = lighting.sources;
    lighting.sources = underLights(player.x + 6, player.y + 10);
    resetUnderLife();
    player.path = null; player.walkTo = null;
    camera.clampToWorld(UW, UH);
  });
}
function goUp(th) {
  const loc = locations.find(l => l.id === th.up || l.upKey === th.up);   // постройки колец — по своему ключу (world/oldways.js)
  if (!loc) return;
  const px_ = loc.x + loc.w / 2 - 6, py_ = loc.y + loc.h + 5;
  if (!canLeaveSettlement() && !isInSettlement(px_, py_)) { lockHint(); return; }
  teleportWithFade(px_, py_, surface);
}
// наверх: свет и звук мира возвращаются
function surface() {
  under.leave();
  clearWhisper();
  muteRedNoon(false);
  if (surfaceLights) lighting.sources = surfaceLights;
  surfaceLights = null;
  player.path = null; player.walkTo = null; player.cold = 0; player.ember = undefined; player.pulse = 0;
  player.flare = 0; player.tug = null; player.steady = false; player.gust = 0;
}
// поезд метро забрал (билет «до колодца. туда.»): выход — у колодца у площади, билет погашен
function rideToWell() {
  const a = wellAccess();
  if (!a) { under.ride = false; return; }
  under.arrive();
  teleportWithFade(a.x, a.y, () => {
    const f = getActiveLoc();                       // поезд забрал посреди осмотра — окно вещи изнанки закрыть
    if (f && f.under) { if (state.is('menu')) hideMenu(); else if (state.is('look')) closeLook(); }
    surface();
    stirTownWell();                                 // ворот поскрипел: кто-то вышел
    showLore('Обратных не выдаём. Обратно все и так доезжают.');
  });
}
// клик под землёй: к вещи — по трубам до её места; в пустоту — к ближайшему, куда можно встать
function walkUnder(gx, gy) {
  const th = findLocationAt(gx, gy, thingsNow(), 6);
  const path = th ? pathTo(player.x + 6, player.y + 23, th.at[0], th.at[1]) : pathTo(player.x + 6, player.y + 23, gx, gy);
  if (!path || !path.length) return;
  const w = path.shift();
  player.path = path;
  player.tx = w.x - 6; player.ty = w.y - 23;
  player.moving = true; player.auto = true;
  player.walkTo = th || null;
}
// шаг эффектов под землёй: неба нет (луна и полоса гаснут), яда нет, полдня не видно
function stepFxUnder() {
  const camX = Math.round(camera.x), camY = Math.round(camera.y);
  wind.update('clear', 0, 0, true);                 // сквозняк вместо ветра
  updateWindSound(0.04);
  setPress(pressAt(phaseAt(t)));                    // перо устаёт по-прежнему: оно не от неба
  stepRedNoon(t, phaseAt(t), dayIndex(t));
  ink.noon(0);
  ink.sky(false);
  ink.beginFrame();
  ink.want(0, 'изнанка');
  if (isEndingActive()) ink.want(3, 'финал');
  const focus = getActiveLoc();
  if (focus) ink.want(2, 'осмотр');
  ink.setGroup(focus && focus.under && ink.level === 2 ? [focus] : []);
  ink.update();
  plate.update(under.ret ? under.ret.x + 6 : player.x, under.ret ? under.ret.y + 24 : player.y, 0);   // зерно — городка: тут вне времени
  toxic.hush();
  updateGeiger(toxic.level());
  lofi.update(0);
  under.step(player.x + 6, player.y + 23);
  // разрез эпох: голоса старых слоёв — бумажкой внизу; поезд за спиной гудит и трясёт кадр
  if (under.say) { showLore(under.say); under.say = null; }
  if (under.after && state.is('game')) { showLore(under.after); under.after = null; }   // строка после сцены
  if (under.train === 1) playDistantSound();
  if (under.train > 40 && under.train < 200 && under.train % 24 === 0) camera.shake(8);
  if (under.ride) rideToWell();
  // шёпоты изнанки: перо пишет их рядом; у уха — идут следом; тишина гасит недописанный
  if (under.quench) { quenchWhisper(); under.quench = false; }
  const w = under.whisper;
  if (w) {
    // своё (keep — ниша шепчет имя) важнее: недописанное гаснет, перо ждёт
    if (w.keep && whisperText() && !w.asked) { quenchWhisper(); w.asked = true; }
    const ear = w.ear ? () => [player.x + 6 + w.ox, player.y + 23 + w.oy] : null, [sx, sy] = ear ? ear() : [w.x, w.y];
    if (sayAt(w.text, sx, sy, w.faint, ear) || !(w.keep || w.wait-- > 0)) under.whisper = null;
  }
  stepWhisper();
  // вдох на пороге: тоннель ответил — долгий вдох, пыль уходит внутрь, шёпот у уха отходит к стене
  if (under.inhale) {
    const h = under.inhale;
    playInhale();
    inhaleDust(h.x, h.y, h.dx, h.dy);
    const [wx, wy] = wallSpot(player.x + 6, player.y + 23, player.x + 6 + (Math.random() < 0.5 ? -64 : 64));
    driftWhisper(wx, wy);
    under.inhale = null;
  }
  // ход мха: сердце стучит раз в секунду; стоишь — слышно, как растёт мох
  if (moss.beat && moss.k > 0.5) playHeart();
  if (moss.grow) playMossGrow();
  if (under.tick) playTick(under.tick);
  if (under.crackle) playCrackle(under.crackle);                    // печка Дежурного трещит
  if (under.pourSnd) playPour();                                    // кипяток — в гранёный стакан
  stepUnderLife(player);
  const skyNow = skyAt(phaseAt(t));                                 // из сухой цистерны нилометра видно небо
  lighting.sources = underLights(player.x + 6, player.y + 10, { day: skyNow.sun ? Math.min(1, 0.3 + skyNow.sun.elev) : 0, moon: skyNow.moon });
  lightParticles.update({ x: camX, y: camY }, lighting.sources);
  dyingPixels.update();
  screenMoss.update(player.moving);
}
function renderUnder() {
  const vw = scaler.vw, vh = scaler.vh;
  layers.clearAll();
  const bgCtx = layers.ctx('bg'), worldCtx = layers.ctx('world'), lightCtx = layers.ctx('light');
  const fxCtx = layers.ctx('fx'), uiCtx = layers.ctx('ui'), postCtx = layers.ctx('post');
  const camX = Math.round(camera.x), camY = Math.round(camera.y);
  bgCtx.fillStyle = '#0D0B0A';
  bgCtx.fillRect(0, 0, vw, vh);
  worldCtx.save();
  worldCtx.translate(-camX, -camY);
  setCtx(worldCtx);
  player.cold = under.cold; player.ember = under.ember; player.pulse = moss.k > 0.5 ? moss.pulse : 0;
  player.flare = under.flare; player.tug = under.tug; player.steady = under.greeted; player.gust = under.draft;
  drawUnderWorld(worldCtx, camX, camY, vw, vh, player, () => { setCtx(worldCtx); drawPlayer(player); });
  drawParticles(worldCtx, { x: camX, y: camY });
  drawWhisper(worldCtx, { x: camX, y: camY });
  worldCtx.restore();
  hazeOff();
  warmSpots = warmIn(camX, camY, vw, vh);           // в криосклепе огонёк холодный — беречь перу нечего
  ink.drawGroup((c, th) => drawUnderThing(c, th), camX, camY);
  setCtx(worldCtx);
  lighting.render(lightCtx, { x: camX, y: camY }, UNDER_AMBIENT * (1 - 0.6 * moss.k));   // в ходе мха видно только то, что светит
  lightParticles.draw(worldCtx, { x: camX, y: camY });
  crackedGlass.draw(fxCtx);
  dyingPixels.draw(fxCtx);
  drawUnderFx(fxCtx, vw, vh);                       // иней на стекле — в криосклепе
  screenMoss.draw(uiCtx);
  drawHUD(uiCtx);
  ink.drawLabel(uiCtx);
  postfx.apply(postCtx);
  drawTeleportFade(postCtx);
  if (isEndingActive()) drawEnding(postCtx);
  layers.composite();
}
// ?under — проверка руками: сразу вниз (подвал «Вавилона»; ?under=crypt|church|pit|basement|wd|godot|station|onkalo|kola|bunker|cloud|metro|moss|burrow|kapt|stave|nilometer|colonnade|cathedral)
{
  const m = /[?&]under(?:=(\w+))?/.exec(location.search);
  if (m) {
    const spot = { crypt: 'u_up_crypt', church: 'u_up_church', pit: 'u_up_pit', basement: 'u_up_basement', wd: 'u_capsule',
      godot: 'u_godot', station: 'u_car', onkalo: 'u_spiral', kola: 'u_kola', bunker: 'u_screen', cloud: 'u_racks', metro: 'u_cut_metro',
      moss: 'u_up_pithos', burrow: 'u_up_burrow', kapt: 'u_watchman', stave: 'u_up_stave', nilometer: 'u_up_nilometer', colonnade: 'u_up_colonnade', cathedral: 'u_up_cathedral' }[m[1]] || 'u_up_pizzeria';
    setTimeout(() => goUnder(spot), 0);
  }
}

// ═══ ХОД С ИНЕРЦИЕЙ ═══
// Клавиши, палец или автоход задают желаемую скорость; настоящая догоняет
// её с разгоном и торможением поверхности под ногами (world/surface.js):
// на льду отпустил — едешь, в песке за краем вязнешь, по тропе чуть быстрее.
let surfName = 'ground', stumbling = false;
function stopHero() { player.vx = 0; player.vy = 0; }
// у костра земля в золе: ближе 40 точек к огню
let fireLoc;
function nearFire() {
  if (fireLoc === undefined) fireLoc = locations.find(l => l.id === 'campfire') || null;
  return !!fireLoc && Math.hypot(player.x + 6 - (fireLoc.x + 18), player.y + 23 - (fireLoc.y + 20)) < 40;
}
function heroStep(dvx, dvy) {
  const S = SURF[surfName];
  const cur = Math.hypot(player.vx, player.vy), want = Math.hypot(dvx, dvy);
  const rate = want > 0.01 && want >= cur - 0.01 ? S.accel : S.decel;
  const ex = dvx - player.vx, ey = dvy - player.vy, el = Math.hypot(ex, ey);
  if (el <= rate) { player.vx = dvx; player.vy = dvy; }
  else { player.vx += ex / el * rate; player.vy += ey / el * rate; }
  if (want < 0.01 && Math.hypot(player.vx, player.vy) < 0.03) { stopHero(); return 0; }
  const ox = player.x, oy = player.y;
  if (under.active) underMove(player, player.vx, player.vy);
  else tryMove(player, player.vx, player.vy, locations, {
    canLeaveSettlement: canLeaveSettlement(), onLock: lockHint,
  });
  // упёрся — скорость по этой оси гаснет до того, что вышло на деле
  const mx = player.x - ox, my = player.y - oy;
  if (Math.abs(mx - player.vx) > 0.01) player.vx = mx;
  if (Math.abs(my - player.vy) > 0.01) player.vy = my;
  const sp = Math.hypot(mx, my);
  if (sp > 0.05) {
    if (mx > 0.15) player.dir = 1; else if (mx < -0.15) player.dir = -1;
    events.emit(E.PLAYER_MOVE, player);
    if (t % 8 === 0 && surfName !== 'ice' && surfName !== 'swamp' && surfName !== 'water' && surfName !== 'moss') footstepDust(player.x, player.y);
    // след: из лужи — мокрый; в гари и у костра из-под ноги встаёт пепел
    // (под землёй следы остаются в пыли — render/underside.js)
    const kind = under.active ? null : wetKind(S.print);
    if (kind !== null && addFootprint(player.x, player.y, kind)) {
      if (kind === 'wet') usedWet();
      if (surfName === 'ash' || nearFire()) ashPuff(player.x + 6, player.y + 23, sp);
    }
  }
  return sp;
}

// ═══ EPOCH TITLE CARD ═══
function updateGame() {
  updateTeleportFade();
  if (isFrozen()) { stopHero(); updateBrainrot(player); return; }
  if (!state.is('game')) { stopHero(); return; }
  if (isMapOpen()) { stopHero(); return; }                    // карта открыта — стрелки двигают лист, не героя
  const fell = under.active ? false : stumble.update(player);   // полотно ровное — под землёй не оступишься
  if (fell && !stumbling) startleRavens(player.x + 6, player.y + 22, 150);   // упал — вороны в округе взлетают
  stumbling = fell;
  if (fell) { stopHero(); updateWorldSystems(); return; }   // оступился — шаг пропал
  surfName = under.active ? surfaceUnder(player.x + 6, player.y + 23) : surfaceAt(player.x + 6, player.y + 24, locations);
  const S = SURF[surfName];

  // желаемая скорость: палец (держат), клавиши, автоход к цели
  const held = input.getHeldTouch();
  const move = input.getMove();
  let dvx = 0, dvy = 0, steering = false;
  if (held) {
    const pos = input.screenToWorld(held.x, held.y, camera);
    const hdx = pos.x - (player.x + 6), hdy = pos.y - (player.y + 10), hd = Math.hypot(hdx, hdy);
    player.auto = false; player.walkTo = null;
    if (hd > 8) { const spd = 2.4 * S.max; dvx = hdx / hd * spd; dvy = hdy / hd * spd; steering = true; }
  } else if (move.active) {
    const spd = (input.isDown('sprint') ? 4 : 2.4) * S.max;
    dvx = move.x * spd; dvy = move.y * spd; steering = true;
    player.auto = false; player.walkTo = null;
  } else if (player.auto) {
    // путь с поворотами (изнанка): дошёл до поворота — бери следующий
    while (player.path && player.path.length && Math.hypot(player.tx - player.x, player.ty - player.y) < 3) {
      const w = player.path.shift(); player.tx = w.x - 6; player.ty = w.y - 23;
    }
    const last = !(player.path && player.path.length);
    const dx = player.tx - player.x, dy = player.ty - player.y, dist = Math.hypot(dx, dy);
    if (dist < 2 && last) {
      player.auto = false;
      stopHero();
      // Check if we arrived at a location: та, к которой шли, — если
      // дошли до её порога; иначе ближайшая. Шли просто по земле — меню
      // не открываем: мимо вещи можно пройти, не останавливаясь.
      const want = player.walkTo;
      player.walkTo = null;
      if (want && want.under) showMenu(want);                 // вещь изнанки: путь вёл к ней
      else {
        const atWant = want && Math.abs(player.x - (want.x + want.w / 2 - 6)) < 4
          && Math.abs(player.y - (want.y + want.h + 5)) < 4;
        const loc = atWant ? want : (want ? findLocationAt(player.x, player.y, locations) : null);
        if (loc) {
          flags.visited.add(loc.id);
          events.emit(E.LOCATION_VISIT, loc);
          showMenu(loc);
        }
      }
    } else {
      // подход с торможением: успеть встать там, куда шли (v² = 2·a·s), и на льду тоже;
      // на повороте пути не тормозим
      const spd = last ? Math.min(2.4 * S.max, Math.sqrt(2 * S.decel * Math.max(0, dist - 1)) + 0.15) : 2.4 * S.max;
      dvx = dx / dist * spd; dvy = dy / dist * spd; steering = true;
    }
  }
  const sp = heroStep(dvx, dvy);
  player.moving = steering || sp > 0.05;

  updateWorldSystems();
}

// Camera + all per-frame world systems. Shared by the normal movement
// path and the held-finger walk branch above.
function updateWorldSystems() {
  if (under.active) {                       // изнанка: своя карта, мира сверху здесь нет
    camera.follow(player.x + 6, player.y + 10);
    camera.update();
    camera.clampToWorld(UW, UH);
    updateZone('under');
    if (!redNoon.active) updateIdle(player.moving);
    updateParticles();
    return;
  }
  // СКРОЛЛ: лента замкнута — кольцо девять повторяется по вертикали
  if (inBrainrotLoop()) {
    const L0 = TOWN.y1 + 8 * RING_W + 24, L1 = TOWN.y1 + 9 * RING_W - 16;
    if (player.y > L1) { player.y -= (L1 - L0); player.ty = player.y; }
    else if (player.y < L0) { player.y += (L1 - L0); player.ty = player.y; }
  }
  camera.follow(player.x + 6, player.y + 10);
  camera.update();
  camera.clampToWorld(MW, MH);

  // Check for lore pickup
  if (!redNoon.active) checkLorePickup(player);

  // Update world-level systems
  updateJester(camera);
  updateProximity(player, locations);
  updatePets();
  updateEdges(player);
  updateBrainrot(player);
  updateMonsters(player);
  updateZone(getZone(player.x, player.y));
  if (!redNoon.active) updateIdle(player.moving);
  checkWhisper(player, locations, skyAt(phaseAt(t)).moon > 0.5 ? litAt : null);   // ночью — только у света
  updateParticles();
  updateWeather(getZone(player.x, player.y));
  updateCrackTriggers(player);
  updatePotemkin(player, locations, isFrozen());

  if (t % 3 === 0) fireEmber(TOWN.x0 + 775, TOWN.y0 + 635);
}

// ═══ LOOP: ровный шаг ═══
// Мир считается шагами по 1/60 с, сколько бы кадров ни давал экран: на 120 Гц
// он не бежит вдвое быстрее, на 30 Гц не ползёт вдвое медленнее, и «не чаще
// раза в 120 с» остаётся 120 секундами. Кадр рисуется, когда прошёл хотя бы
// один шаг; вкладка спала — долг не копим (не больше 4 шагов за кадр).
const STEP = 1000 / 60, SLACK = 2, MAX_STEPS = 4;
let lastNow = 0, acc = 0;
function loop(now) {
  requestAnimationFrame(loop);
  if (typeof now !== 'number') now = performance.now();
  if (!lastNow) lastNow = now;
  acc += Math.min(250, Math.max(0, now - lastNow));
  lastNow = now;
  if (acc < STEP - SLACK) return;              // экран чаще 60 Гц — этот кадр пропускаем
  let n = 0;
  while (acc >= STEP - SLACK && n < MAX_STEPS) {
    tick();
    updateGame();
    stepFx();
    acc -= STEP;
    n++;
  }
  if (n === MAX_STEPS && acc > STEP) acc = 0;
  render();
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
  // треки (ardet-tracks.js подключается страницей до бандла):
  // жест входа разблокирует звук, заставка играет целиком,
  // затем эфир — трек текущей зоны.
  if (window.ArdetAudio) {
    window.ArdetAudio.unlock();
    window.ArdetAudio.playOnce('title');
  }
  // похмельная прогрузка: 15 с мир всплывает в фокус, веки моргают
  gw.classList.add('wake');
  const lids = document.createElement('div');
  lids.id = 'wakelids';
  // без подписи: пробуждение говорит само
  document.body.appendChild(lids);
  setTimeout(() => { gw.classList.remove('wake'); lids.remove(); }, 15600);
  // Touch devices have no M key — give them an on-screen map button.
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    const mb = document.getElementById('map-btn');
    if (mb) {
      mb.classList.add('on');
      mb.addEventListener('click', () => toggleWorldMap());
    }
  }
}

let entryDone = false;
{ // оттиск сборки на заставке — сверка «что реально задеплоено»
  const bs = document.getElementById('build-stamp');
  if (bs) bs.textContent = 'оттиск ' + (window.ARDET_BUILD || 'локальный');
}

const entryEnter = () => {
  if (entryDone) return; entryDone = true;
  document.getElementById('entry').style.display = 'none';
  // мобильная версия: жест входа — единственный шанс на фуллскрин
  const mob = !!window.ARDET_MOBILE || 'ontouchstart' in window ||
    (navigator.maxTouchPoints || 0) > 0;
  if (mob && window.ArdetFS) window.ArdetFS.enter();
  if (mob) document.documentElement.classList.add('m');
  const howto = document.getElementById('howto');
  if (!howto) { startGame(); return; }
  // Swap the key list for touch devices
  const isMobile = mob || window.innerWidth <= 768;
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
  // Отложить и клик, и клавиши: жест, открывший howto, не должен
  // тем же синтетическим click тут же его закрыть (мобильный тап).
  setTimeout(() => howto.addEventListener('click', go, { once: true }), 400);
  setTimeout(() => document.addEventListener('keydown', go, { once: true }), 50);
};
// pointerdown + click: в некоторых webview тап не рождает click
document.getElementById('entry-btn').addEventListener('pointerdown', entryEnter);
document.getElementById('entry-btn').addEventListener('click', entryEnter);

// Fallback removed: canvas click handler already dispatches. Keeping #gw
// click listener caused double-dispatch (canvas → #gw bubble), which
// flashed the menu open+closed on the same click.

// Бумажка внизу: пробел / enter / esc — допечатать, потом убрать
document.addEventListener('keydown', e => {
  if (!loreActive() || !state.is('game')) return;
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') dismissLore();
});

// Touch: walk toward clicked point
input.onClick(({ clientX, clientY, originalEvent }) => {
  if (originalEvent) originalEvent.stopPropagation();
  if (state.is('menu')) { hideMenu(); return; }
  if (state.is('look') || state.is('dialogue')) return;
  if (!state.is('game')) return;
  // Lore popup eats the first click: dismiss, don't walk
  if (loreActive()) { dismissLore(); return; }   // первый клик допечатывает, второй убирает

  const pos = input.screenToWorld(clientX, clientY, camera);
  if (under.active) { walkUnder(pos.x, pos.y); return; }
  player.path = null;
  const loc = findLocationAt(pos.x, pos.y, locations);
  if (loc) {
    const px_ = loc.x + loc.w / 2 - 6;
    const py_ = loc.y + loc.h + 5;
    // Block click-routing to locations whose access point is outside the
    // locked starting area (e.g. Pizzeria sits at the highway border).
    // Otherwise a near-click would teleport the player out of the zone
    // and movement would jam against the boundary.
    if (!canLeaveSettlement() && !isInSettlement(px_, py_)) { lockHint(); return; }
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
      player.auto = true;
      player.walkTo = loc;
    }
  } else {
    player.tx = pos.x;
    player.ty = pos.y;
    player.moving = true;
    player.auto = true;
    player.walkTo = null;
  }
});

// ═══ EVENT HANDLERS ═══
// падение в брейнрот открывает трек «брейнрот» (assets/music/brainrot.mp3)
events.on('brainrot.freeze', () => { if (window.ArdetAudio && window.ArdetAudio.open) window.ArdetAudio.open('brainrot'); });
events.on('brainrot.hook', () => { if (window.ArdetAudio && window.ArdetAudio.open) window.ArdetAudio.open('brainrot'); });
events.on(E.NPC_TALK, (npcId) => {
  if (npcId === 'jester' && !flags.talkedTo.has('jester')) jesterFirstTalk = true;
  flags.talkedTo.add(npcId);
  if (npcId === 'jester') discoverGate('gate_europe');
});
// Дежурный криосклепа: что скажет — решает изнанка (строка описи дошла до него — назовёт её)
events.on(E.NPC_TALK, (npcId, loc) => {
  if (npcId === 'watchman' && loc && state.is('menu')) loc.talkLines = under.talk();
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
  if (!canLeaveSettlement()) { lockHint(); return; }
  // цели врат записаны в координатах старой улицы: x → эпоха → южная тропа её кольца
  const vx = gate.target.x - STREET_SHIFT;
  const seg = EPOCHS.find(sg => vx >= sg.range[0] && vx < sg.range[1]) || EPOCHS[EPOCHS.length - 1];
  const p = trailPoint('south', (Math.max(1, seg.n) - 0.5) * RING_W);
  teleportWithFade(p.x, p.y);
});
events.on(E.LORE_COLLECT, (item) => {
  showLore(item.text, item.live);
  playPickup();
  pickupSparkle(item.x, item.y);
});
// второе действие вещи: изнанка — у лестницы подуть на уголёк (ритуал «Вдох на пороге»);
// с тенью цветка в кармане — положить её на вещь («Гербарий темноты»)
events.on('location.alt', (loc) => {
  const a = loc.altNow && loc.altNow();
  if (!a) return;
  if (a.key === 'under_greet' && under.greet()) playBlow();
  if (a.key === 'under_lay') under.lay(loc);
  if (DESCENTS[a.key]) sceneOrDown(a.key);           // ходы с колец: спуск на втором действии постройки (за алтарь, в крипту)
});
events.on('location.use', (loc) => {
  if (loc.id === 'terminal') { openTerminal(); return; }
  const actionKey = loc.useAction || loc.id;
  if (actionKey === 'under_up') { goUp(loc); return; }      // изнанка: лестница своей комнаты
  // изнанка: дочитать чужую строку инея над дверью криосклепа, не выдохнув
  if (actionKey === 'under_read') { under.readFrost(loc.x + loc.w / 2, loc.y + 12, FROST_FOREIGN); return; }
  // изнанка: поднести уголёк к белой стене катакомб — тень цветка; ещё раз — снять её
  if (actionKey === 'under_herb') { under.herb(player.x + 6); return; }
  // изнанка: расписаться в журнале учений убежища
  if (actionKey === 'under_sign') { if (under.sign()) showLook({ name: 'Журнал учений', look: JOURNAL_TEXT }); return; }
  // изнанка: выловить кораблик из канала и прочитать заявление вслух
  if (actionKey === 'under_fish') { if (under.fishBoat()) showLook({ name: 'Кораблик', look: FLEET_TEXT }); return; }
  // изнанка: повторить имя проснувшейся ниши — её вызвали по списку
  if (actionKey === 'under_call') { under.callNiche(); return; }
  // изнанка: билет со скамьи метро — в карман
  if (actionKey === 'under_ticket') {
    if (under.takeTicket()) { showLore('«до колодца. туда.»'); playPickup(); pickupSparkle(loc.x + 7, loc.y + 6); }
    return;
  }
  // колодец у котлована: крутить ворот (world/mechanisms.js)
  if (actionKey === 'well_crank') { crankWell(`well:${loc.id}`); return; }
  // колодец у площади: тяжёлое ведро — в нём чья-то давняя потеря (world/townWell.js)
  if (actionKey === 'town_well_crank') { crankTownWell(showLore); return; }
  // столб за кольцом: посмотреть из-под ладони — черта горизонта на несколько секунд (world/beyond.js)
  if (actionKey === 'horizon_look') { beyond.lookHorizon(); return; }
  // The gates teleport onto the street: one road, gradient of epochs
  if (actionKey === 'gates_pass') {
    if (!canLeaveSettlement()) { lockHint(); return; }
    ink.pulse(1600, 3);                      // выход из вне-времени — острый момент
    teleportWithFade(STREET_SPAWN.x, STREET_SPAWN.y, () => {
      // First-pass quiet line via the lore popup (dismissable, can't trap).
      if (consumeGatesLine()) {
        showLore('Эти врата были предназначены для тебя одного. Обычно это узнают позже.');
      }
    });
    return;
  }
  // Каркас: кольцевая равнины и СКРОЛЛ
  if (actionKey === 'branch_plain') {
    teleportWithFade(BRANCH_PLAIN.x0 + 96, BRANCH_PLAIN.y0 + 80);
    return;
  }
  if (actionKey === 'branch_back') {
    teleportWithFade(TOWN.x0 + 2560, TOWN.y1 + RING_W + 80);
    return;
  }
  if (actionKey === 'brainrot_enter') {
    teleportWithFade(TOWN.x0 + 2540, TOWN.y1 + 8 * RING_W + 90, () => {
      enterBrainrotLoop(() => {
        teleportWithFade(TOWN.x0 + 2540, TOWN.y1 + 7 * RING_W + 100, () => {
          showLore('Лента продолжает без тебя. Ничего не потеряно: терять было нечего.');
        });
      });
    });
    return;
  }
  // Shop actions
  if (actionKey === 'shop1') { openShop('shop1'); return; }
  if (actionKey === 'shop2') { openShop('shop2'); return; }
  if (actionKey === 'shop3') { openShop('shop3'); return; }
  // Look-based actions
  sceneOrDown(actionKey);
});
// спуск — пасхалка, не кнопка: сцена места уже показана — повторное «использовать» ведёт вниз
function sceneOrDown(actionKey) {
  const action = useTexts[actionKey], down = DESCENTS[actionKey];
  if (down && under.seen.has(actionKey)) { goUnder(down); return; }
  if (action) {
    showLook({ name: action.title, look: action.text });
    if (down) under.seen.add(actionKey);
  }
}

console.log(`ARDET V2 | viewport ${scaler.vw}×${scaler.vh} | scale ${scaler.scale}x | ${locations.length} locations`);
requestAnimationFrame(loop);

// Global error handler — shows crash on screen
window.onerror = (msg, src, line, col, err) => {
  document.body.innerHTML = '<pre style="color:red;padding:20px;font-size:14px">ARDET ERROR:\n' + msg + '\nLine: ' + line + '\n\n' + (err && err.stack || '') + '</pre>';
};
// build 1776974120

// Проверка эффектов руками: I (Ш) — вторая краска авто → 0..3; O (Щ) — шторм пластины;
// L (Д) — сбой лоу-фай; T (Е) — токсик (код и счётчик); K (Л) — оступиться;
// N (Т) — красный полдень
document.addEventListener('keydown', e => {
  if (!state.is('game') || e.repeat) return;
  if (e.key === 'i' || e.key === 'I' || e.key === 'ш' || e.key === 'Ш') ink.cycle();
  if (e.key === 'l' || e.key === 'L' || e.key === 'д' || e.key === 'Д') ink.note('ЛОУ-ФАЙ · ' + LOFI_NAMES[lofi.cycle()]);
  if (e.key === 't' || e.key === 'T' || e.key === 'е' || e.key === 'Е') {
    toxic.setTest(!toxic.isTest()); ink.note(toxic.isTest() ? 'ТОКСИК · ПРОВЕРКА · ВКЛ' : 'ТОКСИК · ПРОВЕРКА · ВЫКЛ');
  }
  if (e.key === 'k' || e.key === 'K' || e.key === 'л' || e.key === 'Л') ink.note('ОСТУПИЛСЯ · ' + stumble.cycle(player));
  if (e.key === 'o' || e.key === 'O' || e.key === 'щ' || e.key === 'Щ') { stormTest = !stormTest; ink.note(stormTest ? 'ШТОРМ ПЛАСТИНЫ · ВКЛ' : 'ШТОРМ ПЛАСТИНЫ · ВЫКЛ'); }
  if (e.key === 'n' || e.key === 'N' || e.key === 'т' || e.key === 'Т') { triggerRedNoon(t); ink.note('КРАСНЫЙ ПОЛДЕНЬ'); }
});
