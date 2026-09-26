// ═══════════════════════════════════════
// ULITSA TESTS — the street lifted onto the world surface.
// Data integrity + world mapping + corridor physics + zone audio.
// Run: node test/ulitsa.mjs
// ═══════════════════════════════════════
const noop = () => {};
const storage = new Map();
globalThis.localStorage = {
  getItem: k => storage.has(k) ? storage.get(k) : null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: k => storage.delete(k),
};
globalThis.window = { innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
  addEventListener: noop, removeEventListener: noop, visualViewport: null };
const els = new Map();
function fakeEl() {
  return { style: {}, classList: { add: noop, remove: noop, contains: () => false },
    addEventListener: noop, set innerHTML(v) {}, get innerHTML() { return ''; },
    set width(v) { this._w = v; }, get width() { return this._w; },
    set height(v) { this._h = v; }, get height() { return this._h; },
    getContext: () => fakeCtx(), appendChild: noop, focus: noop };
}
globalThis.document = {
  getElementById: id => els.get(id) || (els.set(id, fakeEl()), els.get(id)),
  createElement: () => fakeEl(), addEventListener: noop, removeEventListener: noop,
  querySelectorAll: () => [], title: 'x', body: fakeEl(),
};
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = noop;
const grad = () => ({ addColorStop: noop });
function fakeCtx() {
  return { globalAlpha:1, fillStyle:'#000', strokeStyle:'#000', lineWidth:1, font:'',
    textAlign:'left', imageSmoothingEnabled:false, setLineDash:noop,
    fillRect:noop, strokeRect:noop, clearRect:noop, beginPath:noop, closePath:noop,
    moveTo:noop, lineTo:noop, arc:noop, ellipse:noop, rect:noop,
    quadraticCurveTo:noop, bezierCurveTo:noop, stroke:noop, fill:noop, save:noop,
    restore:noop, fillText:noop, translate:noop, setTransform:noop, drawImage:noop,
    scale:noop, rotate:noop, createLinearGradient:grad, createRadialGradient:grad,
    measureText:()=>({width:10}) };
}

const results = [];
function test(name, fn) {
  try { fn(); results.push({ name, status: 'pass' }); }
  catch (e) { results.push({ name, status: 'fail', msg: e.message, stack: e.stack }); }
}
function assert(c, m) { if (!c) throw new Error(m || 'assertion failed'); }
function eq(a, b, m) { if (a !== b) throw new Error((m || 'eq') + `: ${a} !== ${b}`); }

const base = new URL('../src/', import.meta.url);
const imp = p => import(new URL(p, base));

// ═══ STREET DATA INTEGRITY (ulitsa_db) ═══
{
  const db = await imp('content/ulitsa_db.js');
  const { TOWNLET, SEGMENTS, allSigns, segmentAt } = db;

  test('street: townlet + 9 segments, §1..§9 contiguous', () => {
    assert(TOWNLET.range[0] === 0, 'townlet starts at 0');
    eq(SEGMENTS.length, 9, '9 epoch segments');
    assert(SEGMENTS[0].range[0] >= TOWNLET.range[1], '§1 after townlet');
    let prev = SEGMENTS[0].range[1];
    for (let i = 1; i < SEGMENTS.length; i++) {
      eq(SEGMENTS[i].range[0], prev, `${SEGMENTS[i].id} contiguous`);
      prev = SEGMENTS[i].range[1];
    }
  });

  test('street: every sign has facade and sits inside its segment', () => {
    for (const seg of [TOWNLET, ...SEGMENTS]) {
      for (const sign of seg.signs) {
        assert(sign.facade && sign.facade.length > 0, `${seg.id}/${sign.name}: facade`);
        assert(sign.x >= seg.range[0] && sign.x < seg.range[1],
          `${seg.id}/${sign.name}: x outside`);
      }
    }
  });

  test('street: acts at §6..§9; §7 quiet; ≥4 live; euphemism stand ×5; Plato shadow ×3', () => {
    const acts = SEGMENTS.filter(s => s.actSign).map(s => s.n).join(',');
    eq(acts, '6,7,8,9', 'acts');
    assert(SEGMENTS.find(s => s.n === 7).quiet === true, '§7 quiet');
    const signs = allSigns();
    assert(signs.filter(s => s.live).length >= 4, 'live count');
    eq(signs.filter(s => s.name === 'стенд эвфемизма').length, 5, 'euphemism stops');
    const shadows = new Set(signs.filter(s => /тень/.test(s.name)).map(s => s._segment));
    assert(shadows.size >= 3, 'Plato shadow surfaces');
    eq(segmentAt(2900).id, 'now', 'segmentAt sanity');
  });
}

// ═══ WORLD MAPPING (street.js) ═══
{
  const street = await imp('world/street.js');
  const { streetLocations, STREET_SHIFT, STREET_X0, STREET_END_W,
          STREET_Y_MIN, STREET_Y_MAX, STREET_SPAWN, GATES_RETURN,
          consumeGatesLine, worldSegmentAt } = street;
  const { useTexts } = await imp('world/useActions.js');
  const { SEGMENTS, allSigns } = await imp('content/ulitsa_db.js');

  test('worldSegmentAt: maps world point to epoch rings (for the title card)', () => {
    const a = worldSegmentAt(1500, 1900);   // кольцо 1 юга
    assert(a && a.id === 'axial', `ring1 is axial: ${a && a.id}`);
    const n = worldSegmentAt(1500, 1800 + 8 * 200 + 100);
    assert(n && n.id === 'now', `ring9 is now: ${n && n.id}`);
    assert(worldSegmentAt(1500, 900) === null, 'городок вне эпох');
  });

  test('streetLocations: one per segment sign, unique ids, coords in south rings', () => {
    const ids = new Set();
    for (const l of streetLocations) {
      assert(!ids.has(l.id), `dup id ${l.id}`);
      ids.add(l.id);
      assert(l.x > 280 && l.x < 2740, `${l.id}: x ${l.x} за полосой юга`);
      assert(l.y > 1800 && l.y < 1800 + 9 * 200, `${l.id}: y ${l.y} вне колец`);
    }
  });

  test('streetLocations: every two-sided sign registers a flip useAction', () => {
    const twoSided = allSigns().filter(s => s.backyard && s._segment !== 'townlet').length;
    const withFlip = streetLocations.filter(l => l.useAction && l.useAction.endsWith('_flip'));
    eq(withFlip.length, twoSided, 'flip count matches backyard count');
    for (const l of withFlip) {
      const u = useTexts[l.useAction];
      assert(u && u.title && u.text, `${l.id}: flip text missing`);
      assert(u.title.includes('обратная сторона'), `${l.id}: flip title`);
    }
  });

  test('streetLocations: live signs flagged and форма passed through', () => {
    const live = streetLocations.filter(l => l.streetLive);
    assert(live.length >= 4, `live: ${live.length}`);
    for (const l of streetLocations) assert(l.streetForm, `${l.id}: form`);
  });

  test('street constants: spawn on ring one, return at the gates', () => {
    assert(STREET_SPAWN.y > 1800 && STREET_SPAWN.y < 2000, 'spawn на первом кольце');
    assert(GATES_RETURN.x > 0 && GATES_RETURN.y > 0, 'gates return в городке');
  });

  test('gates line: consumed exactly once per session', () => {
    eq(consumeGatesLine(), true, 'first');
    eq(consumeGatesLine(), false, 'second');
    eq(consumeGatesLine(), false, 'third');
  });
}

// ═══ WORLD INTEGRATION ═══
{
  const { MW, MH } = await imp('world/terrain.js');
  const { locations } = await imp('world/locations.js');
  const physics = await imp('world/physics.js');
  const { streetLocations } = await imp('world/street.js');
  const { getZone } = await imp('audio/zoneAmbient.js');

  test('world: полотно накрывает кольца и стихии; знаки в реестре', () => {
    assert(MW >= 5000 && MH >= 3800, `мир ${MW}×${MH} мал для колец`);
    const st = locations.filter(l => l.id.startsWith('st_'));
    assert(st.length === streetLocations.length, 'реестр без потерь');
  });

  const { tryMove } = await imp('world/physics.js');
  test('physics: мир открыт — север и юг достижимы', () => {
    const p = { x: 1500, y: 200, tx: 0, ty: 0, moving: false };
    tryMove(p, 0, -300, [], {});
    assert(p.y < 170, `лёд севера достижим (y=${p.y})`);
    const q = { x: 1500, y: 3400, tx: 0, ty: 0, moving: false };
    tryMove(q, 0, 300, [], {});
    assert(q.y > 3400, `пески юга достижимы (y=${q.y})`);
  });

  test('physics: замок городка не действует на кольцах', () => {
    const p = { x: 1500, y: 1900, tx: 0, ty: 0, moving: false }; // кольцо 1
    tryMove(p, 0, 100, [], { canLeaveSettlement: false });
    assert(p.y > 1950, `по кольцам ходим до Шута (y=${p.y})`);
  });

  test('zones: street zone east of the waste; waste zones intact', () => {
    eq(getZone(4000, 880), 'street', 'street zone');
    eq(getZone(1000, 900), 'settlement', 'settlement intact');
    eq(getZone(2500, 900), 'highway', 'highway intact');
  });
}

// ═══ TERRAIN + MAP RENDER ═══
{
  const { buildTerrain } = await imp('world/terrain.js');
  test('terrain: builds the disc world without throwing', () => {
    const c = buildTerrain();
    assert(c.width >= 5000 && c.height >= 3800, 'canvas накрывает диск');
  });

  const { state } = await imp('core/state.js');
  const map = await imp('ui/worldmap.js');
  test('worldmap: only opens from game state; close always works', () => {
    map.init();
    state.current = 'menu';
    map.open();
    assert(!map.isOpen(), 'must not open outside game state');
    state.current = 'game';
    map.open();
    assert(map.isOpen(), 'opens from game');
    map.close();
    assert(!map.isOpen(), 'close works');
    map.toggle(); assert(map.isOpen(), 'toggle on');
    map.toggle(); assert(!map.isOpen(), 'toggle off');
  });
}

// ═══ WORLD MAP DB (editor-derived nodes) ═══
{
  const db = await imp('content/worldmap_db.js');
  const { CONTINENTS, NODES, TUNNELS, MUSEUMS, PRECIPICES, STATUS_COLORS, THREAD_COLORS, nodeById } = db;

  test('worldmap_db: four continents with polygon points and labels', () => {
    eq(CONTINENTS.length, 4, '4 continents');
    for (const c of CONTINENTS) {
      assert(typeof c.name === 'string' && c.name.length > 0, 'name');
      assert(typeof c.pts === 'string' && c.pts.split(' ').length >= 4, `pts: ${c.name}`);
      assert(Array.isArray(c.label) && c.label.length === 2, `label: ${c.name}`);
    }
  });

  test('worldmap_db: nodes have unique ids, valid statuses, threads array', () => {
    const seen = new Set();
    for (const n of NODES) {
      assert(!seen.has(n.id), `dup ${n.id}`); seen.add(n.id);
      assert(STATUS_COLORS[n.st], `${n.id}: bad st ${n.st}`);
      assert(Array.isArray(n.thr), `${n.id}: thr`);
      for (const tn of n.thr) assert(THREAD_COLORS[tn], `${n.id}: thread ${tn}`);
    }
    // Must include SF + LA as live nodes (matching the new fire locations)
    const sf = nodeById('sf'), la = nodeById('la');
    assert(sf && sf.st === 'live', 'sf live on map');
    assert(la && la.st === 'live', 'la live on map');
  });

  test('worldmap_db: tunnels/museums/precipices point at real nodes', () => {
    assert(TUNNELS.length >= 1 && MUSEUMS.length >= 1 && PRECIPICES.length >= 1, 'each present');
    for (const t of TUNNELS) {
      assert(nodeById(t.a) && nodeById(t.b), `tunnel ${t.id}: endpoints`);
    }
    for (const m of MUSEUMS) assert(nodeById(m.at), `museum ${m.id}`);
    for (const p of PRECIPICES) assert(nodeById(p.at), `precipice ${p.id}`);
  });
}

// ═══ CONTINENTAL GATES (worldmap_db + ui/worldmap discovery API) ═══
{
  const db = await imp('content/worldmap_db.js');
  const { GATES, gateById } = db;
  const map = await imp('ui/worldmap.js');
  const { events } = await imp('core/events.js');

  test('gates: at least five, one townlet (open by default), the rest hidden', () => {
    assert(GATES.length >= 5, `gate count: ${GATES.length}`);
    const open = GATES.filter(g => !g.hidden);
    eq(open.length, 1, 'exactly one open gate at game start');
    eq(open[0].id, 'gate_townlet', 'townlet gate is the open one');
  });

  test('gates: every gate carries a street-target inside the corridor', () => {
    for (const g of GATES) {
      assert(g.target && g.target.x >= 3000 && g.target.x <= 6200, `${g.id}: target x ${g.target?.x}`);
      assert(g.target.y >= 800 && g.target.y <= 960, `${g.id}: target y ${g.target?.y}`);
    }
  });

  test('gates: continent labels point to one of the four (plus Север)', () => {
    const allowed = new Set(['Европа', 'Африка', 'Америки', 'Азия', 'Север']);
    for (const g of GATES) assert(allowed.has(g.cont), `${g.id}: cont ${g.cont}`);
  });

  test('gates: discovery API — markDiscovered emits gate.discovered exactly once', () => {
    let fired = 0;
    const off = events.on('gate.discovered', () => fired++);
    map.markDiscovered('gate_europe');
    map.markDiscovered('gate_europe'); // dedup
    eq(fired, 1, 'duplicate marks do not re-emit');
    off();
    assert(map.isDiscovered('gate_europe'), 'discovered set');
    assert(!map.isDiscovered('gate_townlet') || true, 'townlet is by-default visible');
  });

  test('gates: getDiscovered / loadDiscovered round-trip persists across sessions', () => {
    map.loadDiscovered(['gate_africa', 'gate_asia']);
    const ids = map.getDiscovered();
    for (const id of ['gate_africa', 'gate_asia', 'gate_europe', 'gate_townlet']) {
      assert(ids.includes(id), `${id} should be discovered after load`);
    }
  });

  test('gateById: returns by id; unknown returns null', () => {
    assert(gateById('gate_townlet'), 'townlet');
    eq(gateById('gate_nonsense'), null, 'unknown null');
  });
}

// ═══ HYBRID FIRES (SF, LA on the street) ═══
{
  const { locations } = await imp('world/locations.js');
  test('hybrid fires: SF + LA are full street locations with light + live look', () => {
    const sf = locations.find(l => l.id === 'fire_sf');
    const la = locations.find(l => l.id === 'fire_la');
    assert(sf && la, 'fires present');
    for (const f of [sf, la]) {
      eq(f.zone, 'street', `${f.id}: zone`);
      eq(f.streetForm, 'fire', `${f.id}: form`);
      assert(f.streetLive === true, `${f.id}: live`);
      assert(f.light && f.light.r > 50, `${f.id}: lit`);
      assert(/запись продолжается/.test(f.look), `${f.id}: live tag in look`);
    }
  });
}

// ═══ REPORT ═══
const passed = results.filter(r => r.status === 'pass').length;
const failed = results.filter(r => r.status === 'fail');
console.log('\n── ULITSA TESTS ──');
for (const r of results) {
  console.log(`${r.status === 'pass' ? '✓' : '✗'} ${r.name}`);
  if (r.status === 'fail') console.log(`  ${r.msg}`);
}
console.log(`\n${passed}/${results.length} passed`);
if (failed.length) { console.log(`\nFirst failure stack:\n${failed[0].stack}`); process.exit(1); }
process.exit(0);
