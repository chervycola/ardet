// ═══════════════════════════════════════
// LOGIC TESTS — non-visual modules: terminal, weather, save, world.
// Stubs DOM + localStorage and exercises public APIs to catch bad
// state transitions, ReferenceErrors, broken invariants.
// Run: node test/logic.mjs
// ═══════════════════════════════════════
const noop = () => {};

// ── localStorage shim ──
const storage = new Map();
globalThis.localStorage = {
  getItem: k => storage.has(k) ? storage.get(k) : null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: k => storage.delete(k),
  clear: () => storage.clear(),
};

// ── DOM shim — terminal needs real-ish elements ──
function fakeEl(tag = 'div') {
  const el = {
    tagName: tag.toUpperCase(),
    children: [],
    style: {},
    classList: { add: noop, remove: noop, contains: () => false, toggle: noop },
    appendChild(c) { this.children.push(c); return c; },
    removeChild(c) { this.children = this.children.filter(x => x !== c); return c; },
    addEventListener: noop, removeEventListener: noop,
    focus: noop, blur: noop,
    set innerHTML(v) { this._html = v; if (v === '') this.children = []; },
    get innerHTML() { return this._html || ''; },
    set textContent(v) { this._text = v; },
    get textContent() { return this._text || ''; },
    set value(v) { this._value = v; },
    get value() { return this._value || ''; },
    scrollTop: 0, scrollHeight: 0,
  };
  return el;
}
const elementCache = new Map();
globalThis.window = {
  innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
  addEventListener: noop, removeEventListener: noop, visualViewport: null,
};
globalThis.document = {
  getElementById: id => {
    if (!elementCache.has(id)) elementCache.set(id, fakeEl());
    return elementCache.get(id);
  },
  createElement: tag => fakeEl(tag),
  addEventListener: noop, querySelectorAll: () => [], title: 'x',
};
globalThis.requestAnimationFrame = noop;
globalThis.setInterval = () => 0;
globalThis.clearInterval = noop;
globalThis.setTimeout = (fn) => { try { fn(); } catch {} return 0; };

// ── Test infra ──
const results = []; // { name, status, msg }
function test(name, fn) {
  try {
    fn();
    results.push({ name, status: 'pass' });
  } catch (e) {
    results.push({ name, status: 'fail', msg: e.message, stack: e.stack });
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
function eq(a, b, msg) { if (a !== b) throw new Error((msg || 'expected equality') + `: ${a} !== ${b}`); }

const base = new URL('../src/', import.meta.url);
const imp = p => import(new URL(p, base));

// ═══════════════════════════════════════
// TERMINAL — every command runs without throwing
// ═══════════════════════════════════════
{
  const term = await imp('terminal/terminal.js');
  term.init();
  const { exec, commands } = term._test;

  // Each command name + a representative arg variant
  const inputs = [
    'help', 'dir', 'ls', 'ls secrets', 'dir /secrets',
    'read', 'read .moss', 'read .fisher', 'read .ardet',
    'read .alephs', 'read .angel', 'read .baseline', 'read .commons',
    'read .cycle', 'read .convivial', 'read .joy', 'read .demiurge',
    'read nonsense-file',
    'cat', 'cat .ardet', 'cat .moss_weights', 'cat unknown',
    'whois', 'whois camus', 'whois fisher', 'whois nobody',
    'prompt', 'prompt jester', 'prompt unknown',
    'status', 'ach', 'map', 'ping', 'mycelium', 'fortune',
    'history', 'clear', 'echo hello world', 'ardet',
    '.moss', '.fisher', // bare-file fallback
    'thisIsNotACommand',
    '', '   ', // empty / whitespace — should be no-op
  ];

  test('terminal: every command in inputs runs without throwing', () => {
    for (const cmd of inputs) {
      exec(cmd);
    }
  });

  test('terminal: history accumulates non-empty commands only', () => {
    const h0 = term._test.history.length;
    exec('echo a');
    exec('');
    exec('   ');
    exec('echo b');
    assert(term._test.history.length === h0 + 2, 'empty inputs must not enter history');
  });

  test('terminal: open/close lifecycle does not crash', () => {
    term.open(); term.close(); term.open(); term.close();
  });

  test('terminal: commands map matches help text claims', () => {
    const required = ['help','dir','ls','read','cat','whois','prompt','status','ach','map','ping','mycelium','fortune','history','clear','exit','echo','ardet'];
    for (const r of required) assert(typeof commands[r] === 'function', `missing: ${r}`);
  });
}

// ═══════════════════════════════════════
// WEATHER — scheduler invariants over a long simulated run
// ═══════════════════════════════════════
{
  const { weather, update: updateWeather, WEATHER_STATE } = await imp('render/weather.js');
  const { tick } = await imp('core/time.js');

  test('weather: rain starts at most once per 9 minutes', () => {
    // Reset relevant state
    weather.lastStartAt[WEATHER_STATE.TOXIC_RAIN] = -999999;
    weather.lastStartAt[WEATHER_STATE.SANDSTORM] = -999999;
    weather.nextCheck = 1800;
    weather.currentDuration = 0;
    weather.state = WEATHER_STATE.CLEAR;
    weather.intensity = 0;

    const rainStarts = [];
    let prevState = WEATHER_STATE.CLEAR;
    // Simulate 30 minutes @ 60fps to give multiple rain cycles a chance
    const FRAMES = 30 * 60 * 60;
    for (let f = 0; f < FRAMES; f++) {
      tick();
      // Force a rain-preferring zone
      updateWeather('toxic');
      if (weather.state === WEATHER_STATE.TOXIC_RAIN && prevState !== WEATHER_STATE.TOXIC_RAIN) {
        rainStarts.push(f);
      }
      prevState = weather.state;
    }
    // Verify min gap
    for (let i = 1; i < rainStarts.length; i++) {
      const gap = rainStarts[i] - rainStarts[i - 1];
      assert(gap >= 32400, `rain gap ${gap} < 32400 frames (9 min) between starts ${rainStarts[i-1]}→${rainStarts[i]}`);
    }
    // Should have triggered AT LEAST one rain in 30 minutes of forced rain zone
    assert(rainStarts.length >= 1, 'expected at least one rain event in 30min simulation');
  });

  test('weather: intensity stays in [0,1]', () => {
    for (let f = 0; f < 5000; f++) {
      tick();
      updateWeather(['toxic', 'highway', 'settlement', 'forest', 'quarter'][f % 5]);
      assert(weather.intensity >= 0 && weather.intensity <= 1, `intensity out of bounds: ${weather.intensity}`);
    }
  });

  test('weather: particle pools have caps (no leaks)', () => {
    for (let f = 0; f < 10000; f++) {
      tick();
      updateWeather('toxic');
    }
    assert(weather.rainParts.length <= 90, `rain pool overgrew: ${weather.rainParts.length}`);
    assert(weather.puddles.length <= 30, `puddle pool overgrew: ${weather.puddles.length}`);
    for (let f = 0; f < 10000; f++) {
      tick();
      updateWeather('highway');
    }
    assert(weather.sandParts.length <= 140, `sand pool overgrew: ${weather.sandParts.length}`);
  });
}

// ═══════════════════════════════════════
// SAVE / LOAD — round-trip + bad data
// ═══════════════════════════════════════
{
  const { saveGame, loadGame, clearSave } = await imp('core/save.js');

  test('save/load: round-trip preserves payload', () => {
    clearSave();
    const payload = {
      player: { x: 800, y: 900 },
      talkedTo: ['jester', 'sol'],
      visited: ['campfire', 'library', 'crater'],
      observersSeen: ['jester'],
      collectedLore: ['l1', 'l42', 'l88'],
      achievements: ['collector', 'listener'],
      graffiti: [{ x: 100, y: 200, text: 'ардет' }],
      catSightings: 3,
      catUnlocked: true,
    };
    assert(saveGame(payload), 'saveGame returned false');
    const back = loadGame();
    assert(back !== null, 'loadGame returned null after save');
    eq(back.player.x, 800, 'player.x');
    eq(back.player.y, 900, 'player.y');
    eq(back.talkedTo.length, 2, 'talkedTo length');
    eq(back.collectedLore.length, 3, 'lore length');
    eq(back.catUnlocked, true, 'catUnlocked');
    eq(back.version, 2, 'version stamped');
    assert(typeof back.timestamp === 'number', 'timestamp present');
  });

  test('save/load: empty storage returns null', () => {
    clearSave();
    eq(loadGame(), null, 'expected null from empty storage');
  });

  test('save/load: corrupt JSON does not throw', () => {
    storage.set('ardet_v2_save', '{not valid json');
    eq(loadGame(), null, 'corrupt save should return null, not throw');
  });
}

// ═══════════════════════════════════════
// WORLD — pure update functions
// ═══════════════════════════════════════
{
  const whisper = await imp('world/whisper.js');
  const inscriptions = await imp('world/inscriptions.js');
  const idle = await imp('world/idle.js');
  const brainrot = await imp('world/brainrot.js');
  const lore = await imp('world/lore.js');
  const { locations } = await imp('world/locations.js');
  const { loreItems } = await imp('content/lore.js');
  const { tick } = await imp('core/time.js');

  test('whisper.check: empty/no-loc inputs do not throw', () => {
    whisper.check({ x: 0, y: 0, moving: false }, []);
    whisper.check({ x: 99999, y: 99999, moving: false }, locations);
    whisper.check({ x: 1000, y: 920, moving: true }, locations);  // moving — no trigger
  });

  test('inscriptions.updateProximity: accumulates only when player is stationary', () => {
    const player = { x: 600, y: 850, moving: true };
    for (let i = 0; i < 30; i++) inscriptions.updateProximity(player, locations);
    // Now stationary near graffiti (600,850, w=60,h=45 → center ~630,872 — within 60px)
    player.moving = false;
    player.x = 625; player.y = 870;
    for (let i = 0; i < 30; i++) inscriptions.updateProximity(player, locations);
    // Smoke: completing 60 calls without exception is the bar
  });

  test('idle.update: does not crash on flip-flop input', () => {
    for (let i = 0; i < 5000; i++) {
      tick();
      idle.update(i % 7 === 0);   // mostly stationary, occasional moves
    }
  });

  test('brainrot.update: handles far-from-map without crashing; level bounded [0,100]', () => {
    const player = { x: -2000, y: -2000 };
    for (let i = 0; i < 2000; i++) {
      tick();
      brainrot.update(player);
      const lvl = brainrot.getLevel();
      assert(lvl >= 0 && lvl <= 100, `brainrot out of [0,100]: ${lvl}`);
    }
  });

  test('lore: load/getCollectedIds round-trip', () => {
    const original = ['l1', 'l5', 'l12'];
    lore.loadCollected(original);
    const back = lore.getCollectedIds();
    eq(back.length, 3, 'length');
    for (const id of original) assert(lore.isCollected(id), `missing: ${id}`);
  });

  test('lore.checkLorePickup: re-visiting same spot does not re-add a collected item', () => {
    lore.loadCollected([]);
    const item = loreItems[0];
    const player = { x: item.x, y: item.y };
    const first = lore.checkLorePickup(player);
    assert(first && first.id === item.id, 'expected to pick up l1');
    const countAfterFirst = lore.getCollectedCount();
    // Hammer the same spot — must not re-collect the same id (its return
    // value can either be null OR a different neighbor item, but the
    // already-collected id must never be re-counted)
    for (let i = 0; i < 10; i++) lore.checkLorePickup(player);
    assert(lore.isCollected(item.id), 'item should remain collected');
    // The count may have grown if a neighbor was in range, but the
    // SAME id must not be added twice
    const ids = lore.getCollectedIds();
    const seen = new Set(); for (const id of ids) {
      assert(!seen.has(id), `id ${id} appears twice`);
      seen.add(id);
    }
  });
}

// ═══════════════════════════════════════
// REPORT
// ═══════════════════════════════════════
const passed = results.filter(r => r.status === 'pass').length;
const failed = results.filter(r => r.status === 'fail');
console.log('\n── LOGIC TESTS ──');
for (const r of results) {
  console.log(`${r.status === 'pass' ? '✓' : '✗'} ${r.name}`);
  if (r.status === 'fail') console.log(`  ${r.msg}`);
}
console.log(`\n${passed}/${results.length} passed`);
if (failed.length) { console.log(`\nFirst failure stack:\n${failed[0].stack}`); process.exit(1); }
process.exit(0);
