// ═══════════════════════════════════════
// CONTENT TESTS — locations registry, looks/dialogues/useTexts/termDb
// coverage, achievements/state/events/silentCat/brainrot state machines.
// Run: node test/content.mjs
// ═══════════════════════════════════════
const noop = () => {};
const storage = new Map();
globalThis.localStorage = {
  getItem: k => storage.has(k) ? storage.get(k) : null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: k => storage.delete(k), clear: () => storage.clear(),
};
globalThis.window = { innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
  addEventListener: noop, removeEventListener: noop, visualViewport: null };
const els = new Map();
globalThis.document = {
  getElementById: id => els.get(id) || (els.set(id, fakeEl()), els.get(id)),
  createElement: () => fakeEl(), addEventListener: noop,
  querySelectorAll: () => [], title: 'x', body: fakeEl(),
};
function fakeEl() {
  return { style: {}, classList: { add: noop, remove: noop, contains: () => false },
    appendChild: noop, removeChild: noop, addEventListener: noop, remove: noop,
    set innerHTML(v){} , get innerHTML(){return ''}, set textContent(v){}, focus: noop };
}
globalThis.requestAnimationFrame = noop;
globalThis.setTimeout = () => 0;

const grad = () => ({ addColorStop: noop });
function fakeCtx() {
  return { globalAlpha:1, fillStyle:'#000', strokeStyle:'#000', lineWidth:1,
    font:'', textAlign:'left', globalCompositeOperation:'source-over',
    imageSmoothingEnabled:false, fillRect:noop, strokeRect:noop, clearRect:noop,
    beginPath:noop, closePath:noop, moveTo:noop, lineTo:noop, arc:noop, ellipse:noop,
    rect:noop, quadraticCurveTo:noop, bezierCurveTo:noop, stroke:noop, fill:noop,
    save:noop, restore:noop, fillText:noop, strokeText:noop, translate:noop,
    setTransform:noop, drawImage:noop, scale:noop, rotate:noop,
    createLinearGradient:grad, createRadialGradient:grad, measureText:()=>({width:10}) };
}

const results = [];
function test(name, fn) {
  try { fn(); results.push({ name, status: 'pass' }); }
  catch (e) { results.push({ name, status: 'fail', msg: e.message, stack: e.stack }); }
}
function assert(c, m) { if (!c) throw new Error(m || 'assertion failed'); }
function eq(a, b, m) { if (a !== b) throw new Error((m||'eq')+`: ${a} !== ${b}`); }

const base = new URL('../src/', import.meta.url);
const imp = p => import(new URL(p, base));

const { setCtx } = await imp('render/context.js');
setCtx(fakeCtx());

// ═══ LOCATIONS REGISTRY INTEGRITY ═══
{
  const { locations } = await imp('world/locations.js');

  test('locations: ids are unique', () => {
    const seen = new Set();
    for (const l of locations) {
      assert(!seen.has(l.id), `duplicate location id: ${l.id}`);
      seen.add(l.id);
    }
  });

  test('locations: every entry has required fields', () => {
    for (const l of locations) {
      for (const k of ['id','name','x','y','w','h','zone']) {
        assert(l[k] !== undefined, `loc ${l.id}: missing ${k}`);
      }
      assert(['settlement','forest','toxic','highway','quarter'].includes(l.zone),
        `loc ${l.id}: unknown zone ${l.zone}`);
      assert(l.w > 0 && l.h > 0, `loc ${l.id}: non-positive size`);
    }
  });

  test('locations: light spec when present has valid color/r', () => {
    for (const l of locations) {
      if (!l.light) continue;
      assert(typeof l.light.r === 'number' && l.light.r > 0, `loc ${l.id}: bad light.r`);
      assert(Array.isArray(l.light.color) && l.light.color.length === 3,
        `loc ${l.id}: bad light.color`);
    }
  });
}

// ═══ LOOKS / DIALOGUES / USE-ACTIONS COVERAGE ═══
{
  const { locations } = await imp('world/locations.js');
  const { looks } = await imp('content/looks.js');
  const { dialogues } = await imp('content/dialogues.js');
  const { useTexts } = await imp('world/useActions.js');

  // Locations that aren't ordinary "places" — they're NPC slots:
  const npcSlots = new Set(['jester_home','sol_home','elder_home','nocturnal_home']);

  test('looks: every non-NPC location has an entry', () => {
    const missing = [];
    for (const l of locations) {
      if (npcSlots.has(l.id)) continue;
      if (!looks[l.id]) missing.push(l.id);
    }
    assert(missing.length === 0, `missing looks: ${missing.join(', ')}`);
  });

  test('looks: every entry is a non-empty string', () => {
    for (const [k, v] of Object.entries(looks)) {
      assert(typeof v === 'string' && v.trim().length > 0, `looks.${k} empty`);
    }
  });

  test('dialogues: every NPC-bearing location has a dialogue array', () => {
    // Dialogues are keyed by location id (attachContent does
    // `if (dialogues[loc.id]) loc.talkLines = dialogues[loc.id]`).
    const missing = [];
    for (const l of locations) {
      if (!l.npc) continue;
      if (!Array.isArray(dialogues[l.id]) || dialogues[l.id].length === 0) {
        missing.push(`${l.id} (npc: ${l.npc})`);
      }
    }
    assert(missing.length === 0, `missing dialogues for: ${missing.join(', ')}`);
  });

  test('dialogues: every line is a non-empty string', () => {
    for (const [k, lines] of Object.entries(dialogues)) {
      assert(Array.isArray(lines), `dialogues.${k} not an array`);
      for (const line of lines) {
        assert(typeof line === 'string' && line.length > 0, `dialogues.${k}: empty line`);
      }
    }
  });

  test('useActions: every useAction resolves to a handler or known special', () => {
    const specials = new Set(['terminal','shop1','shop2','shop3']);
    const missing = [];
    for (const l of locations) {
      if (!l.useAction) continue;
      if (specials.has(l.useAction)) continue;
      if (!useTexts[l.useAction]) missing.push(`${l.id}→${l.useAction}`);
    }
    assert(missing.length === 0, `unresolved useActions: ${missing.join(', ')}`);
  });

  test('useActions: every entry has title + text', () => {
    for (const [k, v] of Object.entries(useTexts)) {
      assert(v.title && typeof v.title === 'string', `useTexts.${k}: bad title`);
      assert(v.text && typeof v.text === 'string', `useTexts.${k}: bad text`);
    }
  });
}

// ═══ TERMINAL DB ═══
{
  const { termDb } = await imp('content/terminal_db.js');
  test('termDb: every entry has text + color', () => {
    for (const [k, v] of Object.entries(termDb)) {
      assert(typeof v.text === 'string' && v.text.length > 0, `termDb.${k}: empty text`);
      assert(typeof v.color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(v.color),
        `termDb.${k}: bad color ${v.color}`);
    }
  });

  test('termDb: Package-C files present; .demon alias does not clobber art prompt', () => {
    for (const k of ['fire','demon_descartes','hatata','ishraq','timbuktu','agbogbloshie','indra']) {
      assert(termDb[k], `missing Package-C file: ${k}`);
    }
    // The art-generation "demon" prompt must remain intact and distinct
    assert(termDb.demon && /ПРОМТ/.test(termDb.demon.text), 'art-prompt demon clobbered');
    assert(termDb.demon_descartes.text !== termDb.demon.text, 'demon files must be distinct');
  });
}

// ═══ LORE IDS ═══
{
  const { loreItems } = await imp('content/lore.js');
  test('lore: ids are unique', () => {
    const seen = new Set();
    for (const it of loreItems) {
      assert(!seen.has(it.id), `duplicate lore id: ${it.id}`);
      seen.add(it.id);
    }
  });
  test('lore: every item has x,y,id,text', () => {
    for (const it of loreItems) {
      for (const k of ['x','y','id','text']) {
        assert(it[k] !== undefined, `lore ${it.id}: missing ${k}`);
      }
      assert(typeof it.text === 'string' && it.text.length > 0, `lore ${it.id}: empty text`);
    }
  });
  test('lore: live flag (Package F) is boolean and present on the live set', () => {
    const liveIds = loreItems.filter(it => it.live).map(it => it.id).sort();
    // Handoff designates exactly l91/l92/l99/l102 as live in Phase 1.
    for (const id of ['l91','l92','l99','l102']) {
      assert(liveIds.includes(id), `expected ${id} to be live`);
    }
    for (const it of loreItems) {
      if ('live' in it) assert(typeof it.live === 'boolean', `lore ${it.id}: live not boolean`);
    }
  });
}

// ═══ STATE MACHINE ═══
{
  const { state } = await imp('core/state.js');

  test('state.transition: rejects unknown destination', () => {
    state.current = 'game';
    eq(state.transition('nonsense'), false, 'unknown state rejected');
    eq(state.current, 'game', 'state unchanged');
  });

  test('state.transition: rejects illegal transition', () => {
    state.current = 'entry';
    // entry → only 'game' allowed; 'menu' should be rejected
    eq(state.transition('menu'), false, 'entry→menu rejected');
    eq(state.current, 'entry');
    eq(state.transition('game'), true, 'entry→game ok');
    eq(state.current, 'game');
  });

  test('state.transition: all declared transitions actually work', () => {
    const TRANSITIONS = {
      entry: ['game'],
      game: ['menu','look','dialogue','terminal','shop','ending','ulitsa'],
      menu: ['game','look','dialogue','terminal','shop','ulitsa'],
      look: ['game','menu'], dialogue: ['game'], terminal: ['game'],
      shop: ['game'], ending: ['game'], ulitsa: ['game'],
    };
    for (const [from, tos] of Object.entries(TRANSITIONS)) {
      for (const to of tos) {
        state.current = from;
        eq(state.transition(to), true, `${from}→${to} should succeed`);
        eq(state.current, to, `state should be ${to}`);
      }
    }
  });

  test('state.transition: enter/exit hooks fire in order', () => {
    state.current = 'game';
    const log = [];
    state.onExit('game', () => log.push('exit:game'));
    state.onEnter('menu', (prev) => log.push(`enter:menu(from ${prev})`));
    state.transition('menu');
    assert(log[0] === 'exit:game', 'exit fires first');
    assert(log[1] === 'enter:menu(from game)', 'enter fires with prev arg');
    // Cleanup
    state.onExit('game', null); state.onEnter('menu', null);
  });

  test('state.is / isIn match current', () => {
    state.current = 'shop';
    assert(state.is('shop'), 'is');
    assert(state.isIn('menu','shop','game'), 'isIn');
    assert(!state.isIn('look','dialogue'), 'isIn negative');
  });
}

// ═══ EVENT BUS ═══
{
  const { events, E } = await imp('core/events.js');

  test('events: on/emit + off cleanup', () => {
    let n = 0;
    const off = events.on('test.a', () => n++);
    events.emit('test.a'); events.emit('test.a');
    eq(n, 2, 'two emits → two calls');
    off(); events.emit('test.a');
    eq(n, 2, 'no calls after off');
  });

  test('events: once fires exactly once', () => {
    let n = 0;
    events.once('test.b', () => n++);
    events.emit('test.b'); events.emit('test.b'); events.emit('test.b');
    eq(n, 1, 'once → 1 call across 3 emits');
  });

  test('events: handler error does not stop other listeners', () => {
    let a = 0, c = 0;
    events.on('test.c', () => a++);
    events.on('test.c', () => { throw new Error('boom'); });
    events.on('test.c', () => c++);
    // console.error gets called but emit must not throw
    const origErr = console.error; console.error = noop;
    events.emit('test.c');
    console.error = origErr;
    eq(a, 1, 'first handler ran');
    eq(c, 1, 'third handler ran despite middle throw');
  });

  test('events: E constants are non-empty strings', () => {
    for (const [k, v] of Object.entries(E)) {
      assert(typeof v === 'string' && v.length > 0, `E.${k} bad`);
    }
  });
}

// ═══ ACHIEVEMENTS ═══
{
  const ach = await imp('core/achievements.js');
  const { events, E } = await imp('core/events.js');

  test('achievements: init wires LORE_COLLECT → collector at 20', () => {
    ach.loadUnlocked([]);
    const flags = { talkedTo: new Set(), visited: new Set(), observersSeen: new Set() };
    let loreCount = 0;
    ach.init(flags, () => loreCount, () => 0);
    for (let i = 0; i < 19; i++) { loreCount++; events.emit(E.LORE_COLLECT); }
    assert(!ach.getUnlocked().includes('collector'), 'not yet at 19');
    loreCount++; events.emit(E.LORE_COLLECT);
    assert(ach.getUnlocked().includes('collector'), 'unlocked at 20');
  });

  test('achievements: listener fires when talkedTo reaches 5', () => {
    ach.loadUnlocked([]);
    const flags = { talkedTo: new Set(), visited: new Set(), observersSeen: new Set() };
    ach.init(flags, () => 0, () => 0);
    for (let i = 0; i < 4; i++) {
      flags.talkedTo.add(`npc${i}`);
      events.emit(E.NPC_TALK, `npc${i}`);
    }
    assert(!ach.getUnlocked().includes('listener'), 'not yet at 4');
    flags.talkedTo.add('npc4');
    events.emit(E.NPC_TALK, 'npc4');
    assert(ach.getUnlocked().includes('listener'), 'unlocked at 5');
  });

  test('achievements: loadUnlocked/getUnlocked round-trip', () => {
    ach.loadUnlocked(['collector','observers','fire']);
    const back = ach.getUnlocked().sort();
    assert(back.length === 3, `len ${back.length}`);
    for (const id of ['collector','observers','fire']) {
      assert(back.includes(id), `missing: ${id}`);
    }
  });

  test('achievements: defs include all unlock targets', () => {
    const defs = ach.getDefs();
    for (const id of ['collector','archivist','listener','observers','fire','moss','terminal']) {
      assert(defs[id], `def missing: ${id}`);
      assert(typeof defs[id].name === 'string', `def.${id}.name bad`);
    }
  });
}

// ═══ BRAINROT FREEZE + RECOVERY ═══
{
  const brainrot = await imp('world/brainrot.js');
  const { events } = await imp('core/events.js');

  test('brainrot: full cycle — far off-map → freeze at 100 → recover after ~300 frames', () => {
    // Single test because brainrot state is module-level and the recovery
    // path teleports the same player object back to (800,900) and drains.
    const player = { x: -10000, y: -10000 };

    // Phase A: a few frames at extreme distance must freeze immediately.
    for (let i = 0; i < 5; i++) brainrot.update(player);
    assert(brainrot.isFrozen(), 'expected freeze after going off-map');
    eq(brainrot.getLevel(), 100, 'level pinned at 100 during freeze');

    // Phase B: tick past the 300-frame recovery threshold and SNAPSHOT
    // the level at the moment of recovery (after that the level drains
    // naturally each frame because the player is now back on the map).
    let recovered = false;
    let levelAtRecover = -1;
    const off = events.on('brainrot.recover', () => {
      recovered = true;
      levelAtRecover = brainrot.getLevel();
    });
    for (let i = 0; i < 320; i++) {
      brainrot.update(player);
      if (recovered) break;
    }
    off();

    assert(recovered, 'brainrot.recover event fired');
    assert(!brainrot.isFrozen(), 'no longer frozen after recovery');
    eq(levelAtRecover, 50, 'level reset to 50 at the moment of recovery');
    eq(player.x, 800, 'respawned at campfire x');
    eq(player.y, 900, 'respawned at campfire y');
  });
}

// ═══ SILENT CAT ═══
{
  const cat = await imp('world/silentCat.js');
  const { events } = await imp('core/events.js');
  const { locations } = await imp('world/locations.js');

  test('silentCat: 4 sightings → fifth-watcher unlock event', () => {
    cat.loadSightings([]);
    cat.setUnlocked(false);
    let unlocked = false;
    const off = events.on('cat.unlocked', () => { unlocked = true; });

    const spots = ['campfire','terminal','tent','nocturnal','raven'];
    // Visit 4 cat spots — must NOT unlock yet for first 3
    for (let i = 0; i < 4; i++) {
      const l = locations.find(ll => ll.id === spots[i]);
      // Use the spot offsets from silentCat.js (the cat sits at l.x+ox, l.y+oy)
      const offs = [
        { ox: -8, oy: 28 },{ ox: 44, oy: 0 },{ ox: 52, oy: 40 },
        { ox: 48, oy: 85 },{ ox: 8, oy: 18 },
      ];
      const player = { x: l.x + offs[i].ox, y: l.y + offs[i].oy };
      cat.draw(player, { x: 0, y: 0 }, locations);
    }
    off();
    assert(unlocked, 'expected cat.unlocked after 4 sightings');
    assert(cat.isUnlocked(), 'isUnlocked true');
    eq(cat.getSightings().length, 4, '4 sightings recorded');
  });

  test('silentCat: load/getSightings round-trip', () => {
    cat.loadSightings(['campfire','terminal']);
    const back = cat.getSightings().sort();
    eq(back.length, 2);
    assert(back.includes('campfire') && back.includes('terminal'));
  });
}

// ═══ REPORT ═══
const passed = results.filter(r => r.status === 'pass').length;
const failed = results.filter(r => r.status === 'fail');
console.log('\n── CONTENT TESTS ──');
for (const r of results) {
  console.log(`${r.status === 'pass' ? '✓' : '✗'} ${r.name}`);
  if (r.status === 'fail') console.log(`  ${r.msg}`);
}
console.log(`\n${passed}/${results.length} passed`);
if (failed.length) { console.log(`\nFirst failure stack:\n${failed[0].stack}`); process.exit(1); }
process.exit(0);
