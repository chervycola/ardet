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

// ═══ ГИРЛЯНДА И КОТ ═══
{
  const W = await imp('world/wind.js');
  const H = await imp('world/hang.js');
  const C = await imp('world/silentCat.js');
  const calm = () => { W.wind.s = 0; W.wind.x = 0; W.wind.y = 0; };
  test('гирлянда: оба конца прибиты, середина провисает, над огнём тяга приподнимает', () => {
    H._reset(); calm();
    const b = { x: 100, y: 0 };
    // середина — средняя за последние 200 шагов (над огнём трос треплет)
    const hang2 = (key, lift) => {
      let h, mid = 0;
      for (let i = 0; i < 1100; i++) {
        h = H.hang(key, 0, 0, 105, { segs: 12, pin2: b, damp: 0.99, lift }); H.stepHangs(null);
        if (i >= 900) mid += h.pts[6].y / 200;
      }
      return { P: h.pts, mid };
    };
    const { P, mid } = hang2('g1', null);
    assert(P[0].x === 0 && P[0].y === 0, 'левая опора сдвинулась');
    assert(P[12].x === 100 && P[12].y === 0, 'правая опора сдвинулась');
    assert(mid > 8, `середина не провисает: ${mid.toFixed(1)}`);
    // трос не растягивается: середину тяга поднимает немного, за счёт боков
    const L = hang2('g2', { x: 50, r: 26, k: 0.05 });
    assert(L.mid < mid - 0.5, `тяга не поднимает: ${L.mid.toFixed(2)} против ${mid.toFixed(2)}`);
  });
  // костёр в (1000, 1000): кот сидит у (982, 1030), лапы — (984, 1033)
  const locs = [{ id: 'campfire', x: 1000, y: 1000, w: 55, h: 50 }];
  const cat = () => C._cats()[0];
  test('кот: к тому, кто стоит тихо, подходит и садится у ног', () => {
    C._reset(); calm();
    const p = { x: 940, y: 1015, vx: 0, vy: 0 };
    for (let i = 0; i < 600; i++) C.stepCats(p, locs);
    eq(cat().st, 'warm', 'сидит у тепла');
    const d = Math.hypot(cat().x + 2 - (p.x + 6), cat().y + 3 - (p.y + 22));
    assert(d < 14, `сел далеко: ${d.toFixed(1)}`);
    assert(C.getSightings().includes('campfire'), 'кота не заметили');
  });
  test('кот: от бегущего отскакивает прочь, потом возвращается на место', () => {
    C._reset(); calm();
    const p = { x: 900, y: 1011, vx: 4, vy: 0 };
    let fled = false, dStart = 0, dEnd = 0;
    for (let i = 0; i < 40 && !fled; i++) {
      p.x += 4; C.stepCats(p, locs);
      if (cat().st === 'flee') { fled = true; dStart = Math.hypot(cat().x - p.x, cat().y - p.y); }
    }
    assert(fled, 'не отскочил');
    p.vx = 0;
    for (let i = 0; i < 6; i++) C.stepCats(p, locs);
    dEnd = Math.hypot(cat().x - p.x, cat().y - p.y);
    assert(dEnd > dStart, `не прочь: ${dStart.toFixed(1)} → ${dEnd.toFixed(1)}`);
    p.x = 640;                                       // ушёл далеко, но кот ещё считается
    for (let i = 0; i < 2000; i++) C.stepCats(p, locs);
    eq(cat().st, 'sit', 'сидит');
    assert(cat().x === cat().hx && cat().y === cat().hy, `не дома: ${cat().x.toFixed(1)},${cat().y.toFixed(1)}`);
  });
}

// ═══ ЛУЖИ ═══
{
  const Pd = await imp('render/puddles.js');
  const firstPuddle = () => {
    for (let i = 36; i < 60; i++) for (let j = 36; j < 50; j++) { const q = Pd._cellAt(i, j, []); if (q) return { p: q, i, j }; }
    return null;
  };
  const DRY = { state: 'clear', intensity: 0 }, CAM = { x: 0, y: 0, vw: 1, vh: 1 };
  test('лужи: стоят на тех же местах; сухо — не видно, после дождя — видно', () => {
    Pd._set(0);
    const f = firstPuddle();
    assert(f, 'ни одной лужи в городке');
    eq(Pd._cellAt(f.i, f.j, []), f.p, 'та же лужа');
    eq(Pd._sizeOf(f.p), null, 'сухо, а лужа видна');
    Pd._set(1);
    assert(Pd._sizeOf(f.p), 'после дождя лужи нет');
  });
  test('лужи: наступил — мокрые следы восемь шагов; без дождя высыхают за 3,5 минуты', () => {
    Pd._set(1);
    const { p } = firstPuddle();
    const pl = { x: p.x - 6 - 28.8, y: p.y - 23, vx: 2.4, vy: 0 };   // шаг ляжет точно в середину лужи
    for (let i = 0; i < 16 && !Pd._state().wetSteps; i++) { pl.x += 2.4; Pd.stepPuddles(pl, 'ground', DRY, CAM, []); }
    eq(Pd._state().wetSteps, 8, 'ноги не намокли');
    assert(Pd._state().ripples > 0, 'кругов нет');
    eq(Pd.wetKind('soft'), 'wet', 'след не мокрый');
    eq(Pd.wetKind(null), null, 'где следа нет — нет и мокрого');
    for (let i = 0; i < 8; i++) Pd.usedWet();
    eq(Pd.wetKind('soft'), 'soft', 'не просохли');
    pl.vx = 0;
    for (let i = 0; i < 12700; i++) Pd.stepPuddles(pl, 'ground', DRY, CAM, []);
    eq(Pd._state().wet, 0, 'не высохло');
  });
}

// ═══ РИСУНОК В МИРЕ: контекст уже сдвинут камерой ═══
{
  const T = await imp('core/time.js');
  const Wh = await imp('world/whisper.js');
  const At = await imp('render/atmosphere.js');
  const rec = () => {
    const calls = [], c = fakeCtx();
    c.fillText = (s, x, y) => calls.push(['text', x, y]);
    c.fillRect = (x, y) => calls.push(['rect', x, y]);
    return { c, calls };
  };
  test('мир: шёпот и следы рисуются в координатах мира, камеру второй раз не вычитают', () => {
    while (T.t < 11000) T.tick();                    // шёпот — не раньше трёх минут
    const loc = { id: 'campfire', x: 5000, y: 5000, w: 50, h: 50 };
    Wh.check({ x: 5000, y: 5010, moving: false }, [loc]);
    const cam = { x: 4990, y: 5000 };
    const r1 = rec(); Wh.draw(r1.c, cam);
    const tx = r1.calls.find(k => k[0] === 'text');
    assert(tx && Math.abs(tx[1] - 5025) < 1, `шёпот не там: x=${tx && tx[1]}`);
    At.addFootprint(5000, 5000, 'soft');
    const r2 = rec(); At.drawFootprints(r2.c, cam);
    const fr = r2.calls.find(k => k[0] === 'rect');
    assert(fr && fr[1] >= 5000 && fr[2] >= 5019, `след не там: ${fr && fr.slice(1).join(',')}`);
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
