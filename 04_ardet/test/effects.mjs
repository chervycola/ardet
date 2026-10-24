// ═══════════════════════════════════════
// EFFECTS TESTS — screenMoss/dyingPixels/crackedGlass evolution,
// web audio (audio + zoneAmbient), ending sequence, zone transitions.
// Run: node test/effects.mjs
// ═══════════════════════════════════════
const noop = () => {};
globalThis.window = {
  innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
  addEventListener: noop, removeEventListener: noop, visualViewport: null,
};
const els = new Map();
globalThis.document = {
  getElementById: id => els.get(id) || (els.set(id, fakeEl()), els.get(id)),
  createElement: () => fakeEl(), addEventListener: noop,
  querySelectorAll: () => [], title: 'x', hidden: false, body: fakeEl(),
};
function fakeEl() {
  return { style: {}, classList: { add: noop, remove: noop, contains: () => false },
    appendChild: noop, removeChild: noop, addEventListener: noop, remove: noop,
    set innerHTML(v){}, get innerHTML(){return ''}, set textContent(v){}, focus: noop };
}
globalThis.requestAnimationFrame = noop;
globalThis.setInterval = () => 0;
globalThis.clearInterval = noop;
globalThis.setTimeout = (fn) => { try { fn(); } catch {} return 0; };
const storage = new Map();
globalThis.localStorage = {
  getItem: k => storage.has(k) ? storage.get(k) : null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: k => storage.delete(k),
};

// ── Web Audio API stub with call counters ──
const audioCounts = {
  contexts: 0, oscillators: 0, gains: 0, filters: 0,
  oscStarts: 0, oscStops: 0, resumes: 0,
};
function fakeAudioParam() {
  return {
    value: 0,
    setValueAtTime: noop, linearRampToValueAtTime: noop,
    exponentialRampToValueAtTime: noop, setTargetAtTime: noop,
  };
}
function fakeOsc() {
  audioCounts.oscillators++;
  return {
    type: 'sine', frequency: fakeAudioParam(), detune: fakeAudioParam(),
    connect: noop, disconnect: noop,
    start() { audioCounts.oscStarts++; },
    stop() { audioCounts.oscStops++; },
  };
}
function fakeGain() {
  audioCounts.gains++;
  return { gain: fakeAudioParam(), connect: noop, disconnect: noop };
}
function fakeFilter() {
  audioCounts.filters++;
  return {
    type: 'lowpass', frequency: fakeAudioParam(), Q: fakeAudioParam(),
    connect: noop, disconnect: noop,
  };
}
function fakeBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
function fakeAudioContext() {
  audioCounts.contexts++;
  const c = {
    state: 'running',
    currentTime: 0,
    destination: { connect: noop },
    createOscillator: fakeOsc,
    createGain: fakeGain,
    createBiquadFilter: fakeFilter,
    createBuffer: () => fakeBuffer(),
    createBufferSource: () => ({ buffer: null, connect: noop, start: noop, stop: noop }),
    resume() { this.state = 'running'; audioCounts.resumes++; },
    suspend() { this.state = 'suspended'; },
  };
  return c;
}
window.AudioContext = fakeAudioContext;

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
const { tick } = await imp('core/time.js');
setCtx(fakeCtx());

// ═══ SCREEN MOSS EVOLUTION ═══
{
  const { screenMoss } = await imp('render/metaFx.js');

  test('screenMoss: stays empty during constant movement', () => {
    screenMoss.cells = []; screenMoss.idleGrowth = 0;
    for (let i = 0; i < 5000; i++) { tick(); screenMoss.update(/*isMoving*/ true); }
    assert(screenMoss.cells.length === 0, `expected empty, got ${screenMoss.cells.length} cells`);
    assert(screenMoss.idleGrowth <= 0.01, `growth should hit floor, got ${screenMoss.idleGrowth}`);
  });

  test('screenMoss: idle long enough → growth crosses 0.08 → cells spawn', () => {
    screenMoss.cells = []; screenMoss.idleGrowth = 0;
    // Need at least 0.08 / 0.0002 = 400 frames to start spawning
    for (let i = 0; i < 800; i++) { tick(); screenMoss.update(false); }
    assert(screenMoss.idleGrowth > 0.08, `growth should pass 0.08, got ${screenMoss.idleGrowth}`);
    assert(screenMoss.cells.length > 0, 'expected cells after long idle');
  });

  test('screenMoss: cell count never exceeds maxCells (800)', () => {
    screenMoss.cells = []; screenMoss.idleGrowth = 0;
    for (let i = 0; i < 50_000; i++) { tick(); screenMoss.update(false); }
    assert(screenMoss.cells.length <= 800, `overgrew: ${screenMoss.cells.length}`);
  });

  test('screenMoss: movement after growth retreats cells back toward 0', () => {
    // Build up cells
    screenMoss.cells = []; screenMoss.idleGrowth = 0;
    for (let i = 0; i < 5000; i++) { tick(); screenMoss.update(false); }
    const peak = screenMoss.cells.length;
    assert(peak > 0, `precondition: cells should exist, got ${peak}`);
    // Now move long enough — should drain
    for (let i = 0; i < 20_000; i++) { tick(); screenMoss.update(true); }
    assert(screenMoss.cells.length === 0, `expected empty after retreat, got ${screenMoss.cells.length}`);
  });
}

// ═══ DYING PIXELS EVOLUTION ═══
{
  const { dyingPixels } = await imp('render/metaFx.js');
  const { scaler } = await imp('render/scaler.js');

  test('dyingPixels: monotonic — pool only grows, never shrinks', () => {
    dyingPixels.dead.length = 0; dyingPixels.lastDeath = 0;
    let prev = 0;
    // Tick more than 1 interval to force a death
    for (let i = 0; i < 12 * 3600; i++) {
      tick();
      dyingPixels.update();
      const n = dyingPixels.dead.length;
      assert(n >= prev, `pool shrank: ${prev} → ${n}`);
      prev = n;
    }
    assert(prev > 0, 'expected at least one death in 12 intervals');
  });

  test('dyingPixels: pool capped at 200', () => {
    dyingPixels.dead.length = 0; dyingPixels.lastDeath = 0;
    dyingPixels.interval = 1;  // accelerate
    for (let i = 0; i < 1000; i++) { tick(); dyingPixels.update(); }
    dyingPixels.interval = 3600;  // restore
    assert(dyingPixels.dead.length === 200, `expected 200, got ${dyingPixels.dead.length}`);
  });

  test('dyingPixels: all coordinates inside the viewport', () => {
    for (const p of dyingPixels.dead) {
      assert(p.x >= 0 && p.x < scaler.vw, `bad x ${p.x}`);
      assert(p.y >= 0 && p.y < scaler.vh, `bad y ${p.y}`);
    }
  });
}

// ═══ CRACKED GLASS ═══
{
  const { crackedGlass } = await imp('render/metaFx.js');

  test('crackedGlass: add accumulates up to maxCracks then ignores further adds', () => {
    crackedGlass.clear();
    for (let i = 0; i < 20; i++) crackedGlass.add(i * 30, i * 20);
    eq(crackedGlass.cracks.length, crackedGlass.maxCracks,
      `expected cap ${crackedGlass.maxCracks}, got ${crackedGlass.cracks.length}`);
  });

  test('crackedGlass: each crack has at least one line with finite numbers', () => {
    for (const c of crackedGlass.cracks) {
      assert(c.lines.length > 0, 'no lines');
      for (const line of c.lines) {
        assert(Number.isFinite(line.angle), 'bad angle');
        assert(Number.isFinite(line.len) && line.len > 0, 'bad len');
      }
      assert(Number.isFinite(c.origin.x) && Number.isFinite(c.origin.y), 'bad origin');
    }
  });

  test('crackedGlass: clear removes everything', () => {
    crackedGlass.clear();
    eq(crackedGlass.cracks.length, 0);
  });

  test('crackedGlass: draw with no cracks is a no-op', () => {
    crackedGlass.clear();
    crackedGlass.draw(fakeCtx());
  });
}

// ═══ AUDIO MODULE ═══
{
  // Reset counters for this section
  Object.keys(audioCounts).forEach(k => audioCounts[k] = 0);
  const audio = await imp('audio/audio.js');

  test('audio: initAudio idempotent (single AudioContext)', () => {
    audio.initAudio(); audio.initAudio(); audio.initAudio();
    eq(audioCounts.contexts, 1, 'should create context exactly once');
    assert(audio.getCtx() !== null, 'ctx should be available');
  });

  test('audio: resumeAudio resumes a suspended context', () => {
    audio.getCtx().suspend();
    eq(audio.getCtx().state, 'suspended');
    const before = audioCounts.resumes;
    audio.resumeAudio();
    assert(audioCounts.resumes === before + 1, 'resume call should have fired');
    eq(audio.getCtx().state, 'running');
  });

  test('audio: convenience players (tone/pickup/click/distant) do not throw', () => {
    audio.playTone(440, 0.1);
    audio.playPickup();
    audio.playClick();
    audio.playDistantSound();
    // Each created at least one oscillator
    assert(audioCounts.oscillators > 0, 'no oscillators created');
    assert(audioCounts.oscStarts > 0, 'no oscillators started');
  });

  test('audio: start/stopAmbient creates and drains nodes', () => {
    const oscBefore = audioCounts.oscillators;
    audio.startAmbient();
    assert(audioCounts.oscillators === oscBefore + 2, 'expected 2 new oscillators (osc+osc2)');
    // Second start should be a no-op (already running)
    const oscMid = audioCounts.oscillators;
    audio.startAmbient();
    eq(audioCounts.oscillators, oscMid, 'second startAmbient must not re-create');
    audio.stopAmbient();
    // Our fake setTimeout fires synchronously, so the stops should have run
    assert(audioCounts.oscStops >= 2, `expected ≥2 stops, got ${audioCounts.oscStops}`);
  });
}

// ═══ ZONE AMBIENT TRANSITIONS ═══
{
  // Need audio initialized — share context. Reset counters first.
  Object.keys(audioCounts).forEach(k => audioCounts[k] = 0);
  const audio = await imp('audio/audio.js');
  audio.initAudio();  // already initialized but idempotent
  const zone = await imp('audio/zoneAmbient.js');

  test('zoneAmbient: first updateZone creates a new node set', () => {
    Object.keys(audioCounts).forEach(k => audioCounts[k] = 0);
    zone.updateZone('forest');
    assert(audioCounts.oscillators === 2, `expected 2 oscillators, got ${audioCounts.oscillators}`);
    assert(audioCounts.oscStarts === 2, 'oscs should have started');
  });

  test('zoneAmbient: same zone again is a no-op (no re-create)', () => {
    const before = audioCounts.oscillators;
    zone.updateZone('forest');
    eq(audioCounts.oscillators, before, 'must not re-create on same zone');
  });

  test('zoneAmbient: switching zones stops old and starts new', () => {
    const oscBefore = audioCounts.oscillators;
    const stopBefore = audioCounts.oscStops;
    zone.updateZone('toxic');
    assert(audioCounts.oscillators === oscBefore + 2, 'two new oscs for new zone');
    // Old nodes' stop() scheduled via setTimeout — our shim runs it sync
    assert(audioCounts.oscStops >= stopBefore + 2, 'old oscs should be stopped');
  });

  test('zoneAmbient: unknown zone falls back to settlement (no crash)', () => {
    zone.updateZone('nonexistent_zone');  // must not throw
  });

  test('zoneAmbient: rapid transitions across many zones do not throw', () => {
    const zones = ['settlement','forest','toxic','highway','quarter'];
    for (let i = 0; i < 30; i++) zone.updateZone(zones[i % zones.length]);
  });
}

// ═══ ENDING SEQUENCE ═══
{
  const ending = await imp('world/ending.js');
  const ctx = fakeCtx();

  test('ending: inactive by default; draw is a no-op', () => {
    assert(!ending.isActive(), 'should be inactive');
    ending.draw(ctx);  // no-op
  });

  test('ending: trigger activates and draw runs through all text phases', () => {
    ending.trigger();
    assert(ending.isActive(), 'should be active');
    // 9 TEXTS × 180 frames each + 60 frame intro = 1680 frames; run past
    for (let i = 0; i < 2500; i++) ending.draw(ctx);
    // Still active (no auto-deactivation), but didn't crash past the last text
    assert(ending.isActive(), 'no auto-deactivation');
  });

  test('ending: trigger resets timer (re-trigger restarts sequence)', () => {
    // Just check trigger() called again doesn't throw
    ending.trigger();
    ending.draw(ctx);
    assert(ending.isActive());
  });
}

// ═══ REPORT ═══
const passed = results.filter(r => r.status === 'pass').length;
const failed = results.filter(r => r.status === 'fail');
console.log('\n── EFFECTS TESTS ──');
for (const r of results) {
  console.log(`${r.status === 'pass' ? '✓' : '✗'} ${r.name}`);
  if (r.status === 'fail') console.log(`  ${r.msg}`);
}
console.log(`\n${passed}/${results.length} passed`);
if (failed.length) { console.log(`\nFirst failure stack:\n${failed[0].stack}`); process.exit(1); }
process.exit(0);
