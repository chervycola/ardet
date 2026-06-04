// ═══════════════════════════════════════
// SMOKE TEST — exercise every NPC + player draw fn across frames.
// Catches runtime errors (ReferenceError, undefined access, bad % math)
// without a browser. Run: node test/smoke-sprites.mjs
// ═══════════════════════════════════════
const noop = () => {};
globalThis.window = {
  innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
  addEventListener: noop, removeEventListener: noop, visualViewport: null,
};
globalThis.document = {
  getElementById: () => null, createElement: () => fakeCanvas(),
  addEventListener: noop, querySelectorAll: () => [], title: 'x',
};
globalThis.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
globalThis.requestAnimationFrame = noop;

const grad = () => ({ addColorStop: noop });
function fakeCtx() {
  return {
    globalAlpha: 1, fillStyle: '#000', strokeStyle: '#000', lineWidth: 1,
    font: '', textAlign: 'left', globalCompositeOperation: 'source-over',
    imageSmoothingEnabled: false,
    fillRect: noop, strokeRect: noop, clearRect: noop, beginPath: noop,
    closePath: noop, moveTo: noop, lineTo: noop, arc: noop, ellipse: noop,
    rect: noop, quadraticCurveTo: noop, bezierCurveTo: noop, stroke: noop,
    fill: noop, save: noop, restore: noop, fillText: noop, strokeText: noop,
    translate: noop, setTransform: noop, drawImage: noop, scale: noop,
    rotate: noop, createLinearGradient: grad, createRadialGradient: grad,
    measureText: () => ({ width: 10 }),
  };
}
function fakeCanvas() {
  return { width: 1280, height: 720, getContext: fakeCtx, style: {},
    addEventListener: noop,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) };
}

const base = new URL('../src/', import.meta.url);
const imp = (p) => import(new URL(p, base));

const { setCtx } = await imp('render/context.js');
const { tick } = await imp('core/time.js');
const { update: updateWeather } = await imp('render/weather.js');
setCtx(fakeCtx());

const elder = await imp('sprites/npcs/elder.js');
const sol   = await imp('sprites/npcs/sol.js');
const jest  = await imp('sprites/npcs/jester.js');
const noct  = await imp('sprites/npcs/nocturnal.js');
const dump  = await imp('sprites/npcs/dumpster.js');
const plyr  = await imp('sprites/player.js');
const locsMod  = await imp('sprites/locations/index.js');
const { locations } = await imp('world/locations.js');
const { setPlayer } = await imp('core/playerRef.js');

// NPC cases — exercise each draw fn with realistic args/states
const npcCases = [
  ['elder',        () => elder.drawNPC_elder(100, 100)],
  ['sol',          () => sol.drawNPC_sol(100, 100)],
  ['jester(idle)', () => jest.drawNPC_jester(100, 100)],
  ['jester(walkR)',() => jest.drawNPC_jester(100, 100, { moving: true, dir: 1 })],
  ['jester(walkL)',() => jest.drawNPC_jester(100, 100, { moving: true, dir: -1 })],
  ['nocturnal',    () => noct.drawNPC_nocturnal(100, 100)],
  ['dumpster',     () => dump.drawDumpsterDemon(100, 100)],
  ['player',       () => plyr.drawPlayer({ x: 100, y: 100, dir: 1, moving: false })],
  ['player(mv)',   () => plyr.drawPlayer({ x: 100, y: 100, dir: 1, moving: true })],
];

// Location cases — for each registered location id, build a case that
// invokes the matching draw_<id> function at the location's real coords.
// Skip locations whose sprite isn't migrated yet (no draw_<id> export).
const locCases = [];
const missingDraws = [];
for (const loc of locations) {
  const fn = locsMod['draw_' + loc.id];
  if (!fn) { missingDraws.push(loc.id); continue; }
  locCases.push([`loc:${loc.id}`, () => fn(loc.x, loc.y)]);
}

// Run both groups across 400 frames. Player is teleported between
// "far" and "near" each iteration to exercise both playerNearLoc
// branches inside location sprites (some draw extra detail up close).
const farPlayer  = { x: -9999, y: -9999 };
const nearPlayer = { x: 0, y: 0 };
setPlayer(farPlayer);

let errors = 0, runs = 0;
const seenErrors = new Set();
const FRAMES = 400;
for (let f = 0; f < FRAMES; f++) {
  tick();
  updateWeather('highway');
  const prox = (f % 100) / 100;
  [elder, sol, jest, noct, dump].forEach(m => m.setProximity(prox));

  for (const [name, fn] of npcCases) {
    runs++;
    try { fn(); }
    catch (e) {
      errors++;
      const key = `${name}: ${e.message}`;
      if (!seenErrors.has(key)) { seenErrors.add(key); console.log(`✗ frame ${f} [${name}]: ${e.message}`); }
    }
  }

  // Alternate player position so both branches of playerNearLoc fire.
  const useNear = (f % 2) === 0;
  for (const [name, fn] of locCases) {
    if (useNear) {
      // Park the player on top of this location's center
      const loc = locations.find(l => 'loc:' + l.id === name);
      nearPlayer.x = loc.x + (loc.w || 0) / 2;
      nearPlayer.y = loc.y + (loc.h || 0) / 2;
      setPlayer(nearPlayer);
    } else {
      setPlayer(farPlayer);
    }
    runs++;
    try { fn(); }
    catch (e) {
      errors++;
      const key = `${name}: ${e.message}`;
      if (!seenErrors.has(key)) { seenErrors.add(key); console.log(`✗ frame ${f} [${name}]: ${e.message}`); }
    }
  }
}

if (missingDraws.length) {
  console.log(`\nℹ ${missingDraws.length} locations still on placeholder (no draw_ sprite): ${missingDraws.join(', ')}`);
}
console.log(`\n${runs} draw calls over ${FRAMES} frames (${npcCases.length} NPCs + ${locCases.length} locations × 2 player states)`);
console.log(errors === 0 ? '✓ ALL CLEAN — no runtime errors' : `✗ ${errors} errors (${seenErrors.size} unique)`);
process.exit(errors === 0 ? 0 : 1);
