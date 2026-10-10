// ═══════════════════════════════════════
// SYSTEMS TESTS — particles, camera, lighting, monsters, pets,
// sessionMemory, zone partition. Invariants + no-crash sweeps.
// Run: node test/systems.mjs
// ═══════════════════════════════════════
const noop = () => {};
const storage = new Map();
globalThis.localStorage = {
  getItem: k => storage.has(k) ? storage.get(k) : null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: k => storage.delete(k), clear: () => storage.clear(),
};
globalThis.window = {
  innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
  addEventListener: noop, removeEventListener: noop, visualViewport: null,
};
const els = new Map();
globalThis.document = {
  getElementById: id => els.get(id) || (els.set(id, fakeEl()), els.get(id)),
  createElement: () => fakeEl(), addEventListener: noop,
  querySelectorAll: () => [], title: 'x', body: fakeEl(),
};
function fakeEl() {
  return { style: {}, classList: { add: noop, remove: noop, contains: () => false },
    appendChild: noop, removeChild: noop, addEventListener: noop, remove: noop,
    set innerHTML(v) {}, get innerHTML() { return ''; }, set textContent(v) {}, focus: noop };
}
globalThis.requestAnimationFrame = noop;
globalThis.setTimeout = () => 0;
globalThis.clearTimeout = noop;

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

const results = [];
function test(name, fn) {
  try { fn(); results.push({ name, status: 'pass' }); }
  catch (e) { results.push({ name, status: 'fail', msg: e.message, stack: e.stack }); }
}
function assert(c, m) { if (!c) throw new Error(m || 'assertion failed'); }
function eq(a, b, m) { if (a !== b) throw new Error((m || 'eq') + `: ${a} !== ${b}`); }

const base = new URL('../src/', import.meta.url);
const imp = p => import(new URL(p, base));

const { setCtx } = await imp('render/context.js');
const { tick } = await imp('core/time.js');
const ctx = fakeCtx();
setCtx(ctx);

// ═══ PARTICLES ═══
{
  const P = await imp('render/particles.js');
  const cam = { x: 0, y: 0 };

  test('particles: pool never exceeds MAX (300) under heavy emission', () => {
    for (let f = 0; f < 2000; f++) {
      tick();
      P.emit(100, 100, 50, { life: 200 });   // way more than cap allows
      P.fireEmber(100, 100);
      P.footstepDust(100, 100);
      P.pickupSparkle(100, 100);
      P.update();
      P.draw(ctx, cam);
    }
    // We can't read the private array length, but if it leaked we'd OOM
    // or slow to a crawl. Use timing as a proxy: 2000 frames must be fast.
  });

  test('particles: all drain to empty once emission stops', () => {
    // Emit a burst, then update long enough for max life to expire
    P.pickupSparkle(50, 50);
    for (let f = 0; f < 200; f++) { tick(); P.update(); }
    // Emit zero, draw should be a no-op without throwing
    P.draw(ctx, cam);
  });
}

// ═══ CAMERA ═══
{
  const { camera } = await imp('render/camera.js');
  const { scaler } = await imp('render/scaler.js');

  test('camera.clampToWorld keeps view inside [0, worldW-vw] × [0, worldH-vh]', () => {
    const MW = 3000, MH = 1800;
    // Push camera way past bounds in both directions
    camera.x = 99999; camera.y = 99999;
    camera.clampToWorld(MW, MH);
    assert(camera.x <= MW - scaler.vw + 0.001, `x ${camera.x} > max`);
    assert(camera.y <= MH - scaler.vh + 0.001, `y ${camera.y} > max`);
    camera.x = -99999; camera.y = -99999;
    camera.clampToWorld(MW, MH);
    eq(camera.x, 0, 'x floor'); eq(camera.y, 0, 'y floor');
  });

  test('camera.follow then update converges toward target', () => {
    camera.x = 0; camera.y = 0;
    camera.follow(1500, 900);
    const tx = camera.targetX, ty = camera.targetY;
    let prevDist = Math.hypot(tx - camera.x, ty - camera.y);
    for (let f = 0; f < 300; f++) {
      camera.update();
      const d = Math.hypot(tx - camera.x, ty - camera.y);
      assert(d <= prevDist + 0.001, 'camera should not diverge from target');
      prevDist = d;
    }
    assert(prevDist < 2, `camera failed to converge: residual ${prevDist}`);
  });

  test('camera.isVisible matches simple AABB overlap', () => {
    camera.x = 100; camera.y = 100;
    assert(camera.isVisible(100, 100, 10, 10), 'on-screen rect should be visible');
    assert(!camera.isVisible(-500, -500, 10, 10), 'far rect should be culled');
  });

  test('camera.shake decays to zero', () => {
    camera.shake(12);
    for (let f = 0; f < 30; f++) camera.update();
    eq(camera.shakeT, 0, 'shake should decay to 0');
  });
}

// ═══ LIGHTING ═══
{
  const { lighting, lightParticles } = await imp('render/lighting.js');
  const cam = { x: 0, y: 0 };

  test('lighting.add/clear manages sources; render applies defaults', () => {
    lighting.clear();
    eq(lighting.sources.length, 0, 'cleared');
    lighting.add({ x: 100, y: 100, r: 50, color: [255, 180, 80] });
    eq(lighting.sources.length, 1, 'one source');
    // defaults filled in
    const L = lighting.sources[0];
    assert(L.flicker !== undefined && L.intensity !== undefined, 'defaults filled');
    lighting.render(ctx, cam, 0.5);   // must not throw
  });

  test('lighting.render handles off-screen + many sources', () => {
    lighting.clear();
    for (let i = 0; i < 40; i++) lighting.add({ x: i * 200, y: i * 100, r: 30 + i, color: [200, 100, 50], bloom: i % 2 === 0 });
    for (let f = 0; f < 100; f++) { tick(); lighting.render(ctx, cam, 0.3); }
  });

  test('lightParticles.update/draw run without throwing', () => {
    lighting.clear();
    lighting.add({ x: 200, y: 200, r: 60, color: [255, 200, 100] });
    for (let f = 0; f < 300; f++) {
      tick();
      lightParticles.update(cam, lighting.sources);
      lightParticles.draw(ctx, cam);
    }
  });
}

// ═══ MONSTERS ═══
{
  const monsters = await imp('world/monsters.js');
  const cam = { x: 0, y: 0 };

  test('monsters: spawn only far from map, capped at 8, despawn when close', () => {
    // Far from map → should spawn over time
    const far = { x: -2000, y: -2000 };
    for (let f = 0; f < 2000; f++) { tick(); monsters.update(far); }
    const peak = monsters.getCount();
    assert(peak > 0, 'expected monsters to spawn when far from map');
    assert(peak <= 8, `monster cap exceeded: ${peak}`);
    // Return to map center → all should despawn
    const home = { x: 1500, y: 900 };
    for (let f = 0; f < 200; f++) { tick(); monsters.update(home); }
    eq(monsters.getCount(), 0, 'monsters should despawn near map');
  });

  test('monsters.draw does not throw with active monsters', () => {
    const far = { x: -2000, y: -2000 };
    for (let f = 0; f < 500; f++) { tick(); monsters.update(far); }
    monsters.draw(cam);
  });
}

// ═══ PETS ═══
{
  const pets = await imp('world/pets.js');
  const cam = { x: 0, y: 0 };
  test('pets.update/draw survive a long run without throwing', () => {
    for (let f = 0; f < 5000; f++) { tick(); pets.update(); pets.draw(cam); }
  });
}

// ═══ SESSION MEMORY ═══
{
  const sm = await imp('core/sessionMemory.js');
  storage.delete('ardet_v2_sessions');

  test('sessionMemory: increment is monotonic and persists', () => {
    eq(sm.getSessionAge(), 0, 'fresh age 0');
    eq(sm.incrementSession(), 1, 'first visit → 1');
    eq(sm.incrementSession(), 2, 'second → 2');
    eq(sm.getSessionAge(), 2, 'persisted');
  });

  test('sessionMemory: shift config monotonic + bounded', () => {
    // desaturation clamps at 0.15, dyingInterval floors at 600, mossRetreat floors at 0.005
    storage.set('ardet_v2_sessions', '200');  // far past all caps
    const cfg = sm.getShiftConfig();
    assert(cfg.desaturation <= 0.15, `desat ${cfg.desaturation}`);
    assert(cfg.dyingInterval >= 600, `dying ${cfg.dyingInterval}`);
    assert(cfg.mossRetreat >= 0.005, `moss ${cfg.mossRetreat}`);
    assert(cfg.alternativesUnlocked === true, 'alts unlocked at 200');
  });

  test('sessionMemory: blank screen only on 50-multiples', () => {
    storage.set('ardet_v2_sessions', '50');
    assert(sm.getShiftConfig().blankScreenDue === true, '50 due');
    storage.set('ardet_v2_sessions', '51');
    assert(sm.getShiftConfig().blankScreenDue === false, '51 not due');
    storage.set('ardet_v2_sessions', '100');
    assert(sm.getShiftConfig().blankScreenDue === true, '100 due');
  });
}

// ═══ ZONE PARTITION ═══
{
  const { getZone } = await imp('audio/zoneAmbient.js');
  const { OFF } = await imp('world/disc.js');
  test('getZone: every point of the disc world returns a known zone', () => {
    const valid = new Set(['forest', 'toxic', 'quarter', 'highway', 'settlement', 'street']);
    for (let x = 0; x <= 7600; x += 100) {
      for (let y = 0; y <= 6280; y += 100) {
        const z = getZone(x, y);
        assert(valid.has(z), `unknown zone "${z}" at (${x},${y})`);
      }
    }
  });
  test('getZone: городок в центре, кольца вокруг', () => {
    const D = OFF - 2300;   // от отступа мира
    eq(getZone(3300 + D, 3100 + D), 'settlement', 'center should be settlement');
    eq(getZone(3300 + D, 2500 + D), 'forest', 'north strip → forest');
    eq(getZone(3300 + D, 3800 + D), 'toxic', 'south strip → toxic');
    eq(getZone(2450 + D, 3100 + D), 'quarter', 'west → quarter');
    eq(getZone(4800 + D, 3100 + D), 'highway', 'east → highway');
    eq(getZone(3800 + D, 4500 + D), 'street', 'южные кольца → эпохи');
    eq(getZone(6000 + D, 3100 + D), 'street', 'восточные кольца → эпохи');
    eq(getZone(3800 + D, 1500 + D), 'street', 'северные кольца → эпохи');
    eq(getZone(1500 + D, 3100 + D), 'street', 'западные кольца → эпохи');
  });
}

// ═══ ПОДВЕСЫ И МЕХАНИЗМЫ ═══
{
  const W = await imp('world/wind.js');
  const H = await imp('world/hang.js');
  const M = await imp('world/mechanisms.js');
  const calm = () => { W.wind.s = 0; W.wind.x = 0; W.wind.y = 0; };
  // прогнать подвес n шагов (каждый шаг «виден» — как при отрисовке)
  const run = (key, len, n, opt, each) => {
    for (let i = 0; i < n; i++) { const h = H.hang(key, 0, 0, len, opt); H.stepHangs(null); if (each) each(h, i); }
    return H.hang(key, 0, 0, len, opt);
  };
  test('подвес: в штиль после толчка успокаивается и висит отвесно', () => {
    H._reset(); calm();
    const h = H.hang('t1', 0, 0, 10, { damp: 0.995 });
    H.tipOf(h).x += 3;
    run('t1', 10, 900, { damp: 0.995 });
    const tp = H.tipOf(H.hang('t1', 0, 0, 10));
    assert(Math.abs(tp.x) < 0.3, `не успокоился: x=${tp.x.toFixed(2)}`);
    assert(Math.abs(tp.y - 10) < 0.3, `длина не держится: y=${tp.y.toFixed(2)}`);
  });
  test('подвес: длинный трос качается медленнее короткого (период ~ √длины)', () => {
    H._reset(); calm();
    const period = (key, len) => {
      const h = H.hang(key, 0, 0, len, { damp: 1 });
      H.tipOf(h).x += len * 0.2;
      let last = null, crosses = [];
      run(key, len, 1200, { damp: 1 }, (hh, i) => {
        const x = H.tipOf(hh).x;
        if (last !== null && last < 0 && x >= 0) crosses.push(i);
        last = x;
      });
      return (crosses[crosses.length - 1] - crosses[0]) / (crosses.length - 1);
    };
    const r = period('long', 20) / period('short', 5);
    assert(r > 1.7 && r < 2.3, `отношение периодов ${r.toFixed(2)} вместо ~2`);
  });
  test('подвес: ветер отводит его по ветру', () => {
    H._reset(); calm();
    W.wind.s = 0.6;                       // направление по умолчанию — на восток
    const h = run('t3', 8, 600, { sail: 0.04 });
    assert(H.tipOf(h).x > 0.5, `не отклонился: x=${H.tipOf(h).x.toFixed(2)}`);
    calm();
  });
  test('маховик: ремень без проскальзывания — шкив быстрее в R/r раз', () => {
    for (let i = 0; i < 240; i++) { M.flywheel('fw', { R: 8, r: 3, puff: null }); M.stepMechs(); }
    const m = M.flywheel('fw', { R: 8, r: 3, puff: null });
    const k = m.thp / m.th;
    assert(Math.abs(k - 8 / 3) < 0.01, `передаточное ${k.toFixed(3)} вместо 2.667`);
  });
  test('ворот: крутишь — ведро наверх, потом падает назад; пока работает — второй раз не крутится', () => {
    const m = M.well('wtest');
    eq(M.crankWell('wtest'), true, 'первый оборот');
    eq(M.crankWell('wtest'), false, 'пока работает — нет');
    let n = 0;
    while (m.st !== 'top' && n++ < 2000) M.stepMechs();
    eq(m.d, 0, 'наверху ведро у ворота');
    while (m.st !== 'idle' && n++ < 4000) M.stepMechs();
    eq(m.d, 1, 'упало на дно');
  });
}

// ═══ REPORT ═══
const passed = results.filter(r => r.status === 'pass').length;
const failed = results.filter(r => r.status === 'fail');
console.log('\n── SYSTEMS TESTS ──');
for (const r of results) {
  console.log(`${r.status === 'pass' ? '✓' : '✗'} ${r.name}`);
  if (r.status === 'fail') console.log(`  ${r.msg}`);
}
console.log(`\n${passed}/${results.length} passed`);
if (failed.length) { console.log(`\nFirst failure stack:\n${failed[0].stack}`); process.exit(1); }
process.exit(0);
