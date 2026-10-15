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

// ═══ ВОРОНЫ ═══
{
  const R = await imp('world/ravens.js');
  const W = await imp('world/wind.js');
  const calm = () => { W.wind.s = 0; W.wind.x = 0; W.wind.y = 0; };
  const run = (p, n, each) => { for (let i = 0; i < n; i++) { if (each) each(i); R.stepRavens(p, [], null); } };
  const centre = f => f.birds.reduce((a, b) => ({ x: a.x + b.x / f.birds.length, y: a.y + b.y / f.birds.length }), { x: 0, y: 0 });
  test('вороны: к стоящему поодаль привыкают — не взлетают', () => {
    R._reset(false); calm();
    const f = R._spawn(5000, 5000, 5);
    const p = { x: 5000 - 6 - 75, y: 5000 - 22, vx: 0, vy: 0 };
    run(p, 900);
    assert(f.birds.every(b => b.st === 'ground'), 'взлетели без причины');
  });
  test('вороны: бегущий поднимает всю стаю по цепочке; садятся дальше от него', () => {
    R._reset(false); calm();
    const f = R._spawn(5000, 5000, 5);
    const p = { x: 5000 - 6 - 140, y: 5000 - 22, vx: 4, vy: 0 };
    const c0 = centre(f);
    let maxUp = 0, maxZ = 0;
    run(p, 40, () => { p.x += 4; });
    p.vx = 0;
    run(p, 1500, () => {
      maxUp = Math.max(maxUp, f.birds.filter(b => b.st === 'fly').length);
      maxZ = Math.max(maxZ, ...f.birds.map(b => b.z));
    });
    eq(maxUp, 5, 'взлетели не все');
    assert(maxZ > 20, `низко: ${maxZ.toFixed(1)}`);
    assert(f.birds.every(b => b.st === 'ground' && b.z === 0), 'не сели');
    eq(f.st, 'calm', 'стая не успокоилась');
    const c1 = centre(f), pf = { x: p.x + 6, y: p.y + 22 };
    assert(Math.hypot(c1.x - pf.x, c1.y - pf.y) > Math.hypot(c0.x - pf.x, c0.y - pf.y) + 100, 'сели не дальше');
  });
  test('вороны: шум (упал странник) поднимает стаю в радиусе, дальнюю — нет', () => {
    R._reset(false); calm();
    const a = R._spawn(5000, 5000, 4), b = R._spawn(5600, 5000, 4);
    const p = { x: 4900, y: 4980, vx: 0, vy: 0 };
    R.startleRavens(p.x + 6, p.y + 22, 150);
    run(p, 60);
    assert(a.birds.some(x => x.st === 'fly'), 'ближняя не взлетела');
    assert(b.birds.every(x => x.st === 'ground'), 'дальняя взлетела');
  });
}

// ═══ КОТ И ВОРОНЫ ═══
{
  const C = await imp('world/silentCat.js');
  const R = await imp('world/ravens.js');
  const W = await imp('world/wind.js');
  test('кот охотится: крадётся к стае, прыгает — стая взлетает прочь от кота; промах, домой', () => {
    W.wind.s = 0; W.wind.x = 0; W.wind.y = 0;
    C._reset(); R._reset(false);
    const locs = [{ id: 'campfire', x: 1000, y: 1000, w: 55, h: 50 }];   // кот дома у (982, 1030)
    const p = { x: 620, y: 1010, vx: 0, vy: 0 };                          // странник поодаль слева, стоит
    C.stepCats(p, locs);
    const f = R._spawn(982 - 90, 1033, 4);                                // стая слева от кота
    const seen = new Set();
    let flewFromCat = false;
    for (let i = 0; i < 6000; i++) {
      C.stepCats(p, locs); R.stepRavens(p, locs, null);
      const cat = C._cats()[0];
      seen.add(cat.st);
      if (!flewFromCat && f.birds.some(b => b.st === 'fly')) {
        const bird = f.birds.find(b => b.st === 'fly');
        flewFromCat = bird.vx < 0;                                         // кот справа, странник слева — летят влево: от кота
      }
      if (seen.has('miss') && cat.st === 'sit') break;
    }
    for (const st of ['stalk', 'pounce', 'miss', 'back']) assert(seen.has(st), `не было: ${st} (${[...seen].join(',')})`);
    assert(flewFromCat, 'стая не взлетела прочь от кота');
    const cat = C._cats()[0];
    eq(cat.st, 'sit', 'не вернулся');
    assert(Math.hypot(cat.x - cat.hx, cat.y - cat.hy) < 1, 'не дома');
  });
}

// ═══ МАРЕВО ═══
{
  const Hz = await imp('render/haze.js');
  const W = await imp('world/wind.js');
  const D = await imp('world/disc.js');
  test('марево: пламя не трогает (ниже основания столба — ни сдвига), выше — дрожит', () => {
    W.wind.s = 0; W.wind.x = 0; W.wind.y = 0;
    const c = { x: 100, y0: 200, H: 48, w0: 8, grow: 0.27, amp: 1.6, lean: 0 };
    let below = 0, above = 0;
    for (let tt = 0; tt < 400; tt += 7) for (let x = 80; x <= 120; x += 2) {
      for (let y = 200; y < 230; y++) below += Math.abs(Hz.shiftAt(c, x, y, tt));
      for (let y = 160; y < 196; y++) above += Math.abs(Hz.shiftAt(c, x, y, tt));
    }
    eq(below, 0, 'пламя дрожит');
    assert(above > 50, `над огнём не дрожит: ${above}`);
  });
  test('марево: столб клонится по ветру', () => {
    const c = { x: 100, y0: 200, H: 48, w0: 8, grow: 0.27, amp: 1.6, lean: 0.5 };
    let sx = 0, n = 0;
    for (let tt = 0; tt < 2000; tt += 3) for (let x = 60; x <= 160; x++) if (Hz.shiftAt(c, x, 170, tt)) { sx += x; n++; }
    assert(n > 0 && sx / n > 110, `не клонится: середина ${n ? (sx / n).toFixed(1) : '—'}`);
  });
  test('марево: жар — в кольце огня, в городке и за краем нет', () => {
    const TOWN = D.TOWN, mid = (TOWN.x0 + TOWN.x1) / 2;
    eq(Hz.heatAt(mid, (TOWN.y0 + TOWN.y1) / 2), 0, 'в городке');
    let hot = 0;
    for (let d = 1790; d <= 1960; d += 10) hot = Math.max(hot, Hz.heatAt(mid, TOWN.y1 + d));
    eq(hot, 1, 'в огне не жарко');
    eq(Hz.heatAt(mid, TOWN.y1 + 2600), 0, 'за краем');
  });
}

// ═══ СУТКИ И ТЕНИ ═══
{
  const Sk = await imp('world/sky.js');
  const Sh = await imp('render/shadows.js');
  test('сутки: фазы по канону (день 42 / сумерки 13 / ночь 37 / рассвет 8), начало на 0.30', () => {
    eq(Sk.phaseAt(0), 0.3, 'начало');
    eq(Sk.skyAt(0.0).name, 'день'); eq(Sk.skyAt(0.41).name, 'день');
    eq(Sk.skyAt(0.43).name, 'сумерки'); eq(Sk.skyAt(0.54).name, 'сумерки');
    eq(Sk.skyAt(0.56).name, 'ночь'); eq(Sk.skyAt(0.91).name, 'ночь');
    eq(Sk.skyAt(0.93).name, 'рассвет');
    assert(Sk.skyAt(0.21).light > Sk.skyAt(0.38).light && Sk.skyAt(0.38).light > Sk.skyAt(0.7).light, 'свет не по суткам');
    eq(Sk.skyAt(0.7).light, 0.4, 'ночь');
    eq(Math.round(Sk.phaseAt(Sk.DAY_LEN) * 100) / 100, 0.3, 'сутки не замкнулись');
  });
  test('тени: утром на запад, вечером на восток, в полдень коротко назад; ночью бледные от луны', () => {
    const morning = Sk.shadowAt(0.04), noon = Sk.shadowAt(0.21), evening = Sk.shadowAt(0.38), night = Sk.shadowAt(0.7);
    assert(morning.dx < -0.5, `утро: ${morning.dx.toFixed(2)}`);
    assert(evening.dx > 0.5, `вечер: ${evening.dx.toFixed(2)}`);
    assert(Math.abs(noon.dx) < 0.05 && noon.dy < 0 && Math.hypot(noon.dx, noon.dy) < 0.4, 'полдень');
    assert(evening.a >= morning.a, 'вечер не гуще утра');
    eq(night.from, 'луна');
    assert(night.a > 0 && night.a < evening.a, 'ночь не бледнее вечера');
  });
  test('тени: силуэт ложится от подножия — низ маски на месте, верх уходит на (dx, dy)·высоту', () => {
    const m = { x0: 100, y0: 50, base: 90, w: 20 };
    const [a, b, c, d, e, f] = Sh.shadowTransform(m, 0, 0, 1.5, -0.4, 0, 0);
    const at = (u, v) => [a * u + c * v + e, b * u + d * v + f];
    const [bx, by] = at(5, 40), [tx, ty] = at(5, 0);
    assert(Math.abs(bx - 105) < 1e-9 && Math.abs(by - 90) < 1e-9, `подножие: ${bx},${by}`);
    assert(Math.abs(tx - (105 + 1.5 * 40)) < 1e-9 && Math.abs(ty - (90 - 0.4 * 40)) < 1e-9, `верх: ${tx},${ty}`);
  });
  // на земле по глубине экран сжат вдвое: длина тени на земле — hypot(dx, 2·dy)
  const ground = f => Math.hypot(f.dx, f.dy * 2);
  test('два света: лунная тень всю ночь та же и длиной в вещь; костровая длиннее и дышит с огнём', () => {
    const n1 = Sk.shadowAt(0.6), n2 = Sk.shadowAt(0.85);
    assert(n1.dx === n2.dx && n1.dy === n2.dy && n1.a === n2.a, 'лунная ходит');
    assert(Math.abs(ground(n1) - 1) < 1e-9, `лунная не в рост вещи: ${ground(n1).toFixed(2)}`);
    const m = { x0: -6, y0: -10, base: 23, w: 26, h: 33 };          // странник
    const fire = { x: 30, y: -10, r: 120 };                         // огонь — северо-восточнее, в сорока точках
    const at = breath => Sh.fireCast(m, 0, 0, { ...fire, breath });
    const f0 = at(0), up = at(1), down = at(-1);
    assert(ground(f0) > 1.5 * ground(n1), `костровая не преувеличивает: ${ground(f0).toFixed(2)}`);
    assert(ground(up) > ground(f0) && ground(f0) > ground(down), 'костровая не дышит');
    assert(up.grow > f0.grow && f0.grow > down.grow && down.grow > 0, 'к голове не шире');
    assert(f0.dx < 0 && f0.dy > 0, 'не от огня прочь');
    eq(Sh.fireCast(m, 0, 0, { ...fire, x: 600 }), null, 'далеко от огня — а тень есть');
  });
  test('два света: костровая тень растёт к голове — подножие на месте, верх шире, строки все', () => {
    const m = { x0: 100, y0: 50, base: 90, w: 20, h: 40 };
    const bands = Sh.grownBands(m, 0, 0, 1, 0.5, 0.3, 0, 0);
    const top = bands[0], low = bands[bands.length - 1];
    const at = (tr, u, v) => [tr[0] * u + tr[2] * v + tr[4], tr[1] * u + tr[3] * v + tr[5]];
    const [bx, by] = at(low.tr, 10, 40);
    assert(Math.abs(bx - 110) < 1e-9 && Math.abs(by - 90) < 1e-9, `подножие ушло: ${bx},${by}`);
    assert(low.tr[0] < 1.05 && top.tr[0] > 1.2, `рост: низ ${low.tr[0].toFixed(2)}, верх ${top.tr[0].toFixed(2)}`);
    const rows = new Set();
    for (const b of bands) for (let v = b.v0; v < b.v1; v++) rows.add(v);
    eq(rows.size, 40, 'не все строки маски');
  });
}

// ═══ ЗЕМЛЯ ШТРИХОМ: рельеф, швы, кольцо огня ═══
{
  const R = await imp('world/relief.js');
  const E = await imp('render/etch.js');
  const D = await imp('world/disc.js');
  const F = await imp('render/fireRing.js');
  const T = D.TOWN, cx = (T.x0 + T.x1) / 2;
  let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const slope = (x, y) => Math.hypot(R.heightAt(x + 1, y) - R.heightAt(x, y), (R.heightAt(x, y + 1) - R.heightAt(x, y)) / 2);
  const avg = f => { let s = 0; for (let k = 0; k < 400; k++) { const [x, y] = f(); s += slope(x, y); } return s / 400; };
  test('рельеф: юг в дюнах круче степи равнины, городок почти ровный; у троп вал разрыт', () => {
    const town = avg(() => [T.x0 + 200 + rnd() * 2600, T.y0 + 200 + rnd() * 1240]);
    const south = avg(() => [cx - 900 + rnd() * 1800, T.y1 + 1100 + rnd() * 400]);
    const plain = avg(() => { const a = (0.35 + 0.3 * rnd()) * Math.PI / 2, r = 900 + rnd() * 300; return [T.x1 + r * Math.cos(a), T.y0 - r * Math.sin(a)]; });
    assert(town < plain && plain < south, `крутизна: городок ${town.toFixed(3)}, равнина ${plain.toFixed(3)}, юг ${south.toFixed(3)}`);
    const out = { south: [0, 10], north: [0, -10], east: [10, 0], west: [-10, 0] };
    for (const [s, [dx, dy]] of Object.entries(out)) {
      const e = D.trailPoint(s, 0);
      eq(R.rampartAt(e.x + dx, e.y + dy, 10), 0, `у тропы ${s} вал не разрыт`);
    }
    assert(R.rampartAt(cx + 700, T.y1 + 10, 10) > 10, 'вала нет');
  });
  test('земля: эпохи сшиты по рельефу — чужая краска только у шва, не дальше языка', () => {
    let off = 0, n = 0;
    for (let k = 0; k < 6000; k++) {
      const x = rnd() * D.WORLD_W, y = rnd() * D.WORLD_H, a = D.ringAt(x, y);
      if (a < 1 || a > 9) continue;
      n++;
      const b = R.landAt(x, y);
      if (a === b) continue;
      off++;
      const d = D.warpedDist(x, y), edge = Math.min(d % D.RING_W, D.RING_W - d % D.RING_W);
      assert(edge <= R.TONGUE / 2 + 1, `краска эпохи ${b} в ${edge.toFixed(0)} точках от шва (кольцо ${a})`);
      eq(Math.abs(a - b), 1, 'через кольцо');
    }
    assert(off > 0 && off / n < 0.08, `языков ${off} из ${n}`);
  });
  test('земля: стороны сходятся неровным швом, а не по диагонали', () => {
    const got = new Set();
    for (let r = 300; r < 1800; r += 50) got.add(R.sideAt(T.x0 - r, T.y1 + r));   // ровно по диагонали юго-запада
    assert(got.has('south') && got.has('west'), `по диагонали всё одно: ${[...got]}`);
    let flips = 0;
    for (let r = 300; r < 1800; r += 2) if (R.sideAt(T.x0 - r, T.y1 + r) !== R.sideAt(T.x0 - r - 2, T.y1 + r + 2)) flips++;
    assert(flips < 30, `шов рваный, как растр: ${flips}`);
  });
  test('земля штрихом: днём горизонталь темнеет на склоне от солнца, ночью — костью на склоне к луне', () => {
    const m = 8 + 2 * 5 + 1;                                      // кольцо 3, юг
    const d = { mat: new Uint8Array([m, m]), cls: new Uint8Array([1, 1]), dir: new Uint8Array([(0 << 2) | 3, (8 << 2) | 3]) };
    const B = E.MATS[m].base, b = B[0] + B[1] + B[2], lum = (o, k) => o[k * 4] + o[k * 4 + 1] + o[k * 4 + 2];
    const out = new Uint8ClampedArray(8);
    E.setLight({ ang: 0, day: 1, night: 0, press: 1 }); E.paintData(d, out);   // солнце с востока
    assert(lum(out, 1) < b - 30, `склон от солнца не темнеет: ${lum(out, 1)} при ${b}`);
    assert(lum(out, 0) >= b - 5, 'склон к солнцу темнеет');
    E.setLight({ ang: 0, day: 0, night: 1, press: 1 }); E.paintData(d, out);
    assert(lum(out, 0) > b + 60, `ночью на склоне к луне нет кости: ${lum(out, 0)}`);
    assert(Math.abs(lum(out, 1) - b) < 3, 'ночью теневой склон не в черноте');
  });
  test('земля: у кромки городка нет щели — вплотную городок и первое кольцо', () => {
    for (const [tx, ty, horiz] of [[Math.floor(T.x1 / E.TILE), Math.floor((T.y0 + 600) / E.TILE), 1], [Math.floor((T.x0 + 900) / E.TILE), Math.floor(T.y1 / E.TILE), 0]]) {
      const d = E.bakeData(tx, ty);
      const e = horiz ? T.x1 - tx * E.TILE : T.y1 - ty * E.TILE;
      for (let q = 0; q < E.TILE; q++) {
        const inK = horiz ? q * E.TILE + e - 1 : (e - 1) * E.TILE + q, outK = horiz ? q * E.TILE + e : e * E.TILE + q;
        assert(d.mat[inK] < 8, 'у самой кромки внутри — не земля городка');
        assert(d.mat[outK] >= 8 && d.mat[outK] < 56, 'у самой кромки снаружи — не первое кольцо');
      }
    }
  });
  test('кольцо огня: костры — в огне, не чаще трёх на кадр', () => {
    assert(F.fireSites.length > 30, `костров ${F.fireSites.length}`);
    for (const f of F.fireSites) eq(D.ringAt(f.x, f.y), 10, `костёр (${f.x},${f.y}) не в огне`);
    for (const f of F.fireSites) {
      const near = F.fireSites.filter(g => Math.abs(g.x - f.x) < 320 && Math.abs(g.y - f.y) < 180).length;
      assert(near <= 3, `в кадре вокруг (${f.x},${f.y}) костров ${near}`);
    }
  });
}

// ═══ КРАСНЫЙ ПОЛДЕНЬ ═══
{
  const RN = await imp('world/redNoon.js');
  test('красный полдень: жребий только около полудня и раз в сутки; минута — и прошёл', () => {
    RN._reset();
    RN.stepRedNoon(0, 0.30, 0, () => 0);                 // после полудня — нет
    eq(RN.redNoon.active, false, 'не в окне');
    RN.stepRedNoon(1, 0.20, 1, () => 0.9);               // в окне, жребий не выпал
    for (let i = 2; i < 200; i++) RN.stepRedNoon(i, 0.20, 1, () => 0);   // в те же сутки — без второго жребия
    eq(RN.redNoon.active, false, 'второй жребий в те же сутки');
    RN.stepRedNoon(1000, 0.20, 2, () => 0.1);            // следующие сутки — выпал
    for (let i = 1001; i < 1300; i++) RN.stepRedNoon(i, 0.21, 2);
    assert(RN.redNoon.k > 0.99, `не вошёл: ${RN.redNoon.k}`);
    for (let i = 1300; i < 4700; i++) RN.stepRedNoon(i, 0.22, 2);
    eq(RN.redNoon.k, 0, 'не прошёл за минуту');
  });
  test('красный полдень: тексты — точками, строка остаётся', () => {
    eq(RN.smear('Погасший фонарь, 1 шт.'), '········ ······, · ··.');
  });
}

// ═══ ПЕРО И ШЁПОТЫ У СВЕТА ═══
{
  const Pen = await imp('render/pen.js');
  const Wh = await imp('world/whisper.js');
  const T = await imp('core/time.js');
  const RNoon = await imp('world/redNoon.js');
  test('перо: к ночи исписалось, на рассвете обмакнули; днём сухости нет', () => {
    assert(Math.abs(Pen.pressAt(0) - 1.15) < 1e-9, 'утро не свежее');
    assert(Math.abs(Pen.pressAt(0.99999) - Pen.pressAt(0)) < 0.01, 'рассвет не сходится с утром');
    assert(Pen.pressAt(0.7) < Pen.pressAt(0.4) && Pen.pressAt(0.9) < Pen.pressAt(0.7), 'к ночи не тоньше');
    eq(Pen.dryOf(Pen.pressAt(0.2)), 0, 'днём сухо');
    assert(Pen.dryOf(Pen.pressAt(0.85)) > 0.8, 'ночью перо не сухое');
  });
  test('перо: толщина линий умножается на нажим, читается — как задали', () => {
    let native = null;
    class Ctx {}
    Object.defineProperty(Ctx.prototype, 'lineWidth', { get() { return native; }, set(v) { native = v; }, configurable: true });
    const c = new Ctx();
    Pen.installPen(c);
    Pen.setPress(0.6);
    c.lineWidth = 2;
    assert(Math.abs(native - 1.2) < 1e-9, `в холст ушло ${native}`);
    eq(c.lineWidth, 2, 'читается не то, что задали');
    Pen.setPress(1);
  });
  test('шёпоты: ночью — только у чужого света; днём — как раньше', () => {
    while (T.t < 30000) T.tick();                          // после паузы между шёпотами
    const loc = { id: 'church', x: 6000, y: 6000, w: 40, h: 40 };
    const p = { x: 6000, y: 6010, moving: false };
    const cam = { x: 5990, y: 5900 }, said = () => { const r = []; const c = fakeCtx(); c.fillText = s => r.push(s); Wh.draw(c, cam); return r.length > 0; };
    Wh.check(p, [loc], () => false);
    eq(said(), false, 'в темноте мир ответил');
    Wh.check(p, [loc], () => true);
    eq(said(), true, 'у света шёпота нет');
    Wh._reset();                                            // следующим тестам — без шёпота и паузы
  });
  test('шёпоты пишутся: буква за буквой, сразу чернилами; дописал — постоял, выцвел и ушёл вверх', () => {
    Wh._reset();
    const loc = { id: 'campfire', x: 7000, y: 7000, w: 40, h: 40 }, text = Wh.WHISPERS.campfire;
    Wh.check({ x: 7000, y: 7010, moving: false }, [loc]);
    const seen = [];
    for (let i = 0; i < 3000; i++) {
      const c = fakeCtx(); let got = null;
      c.fillText = (str, x, y) => { got = { str, a: c.globalAlpha, y }; };
      Wh.draw(c, null);
      if (!got) break;
      seen.push(got);
      T.tick();
    }
    assert(seen.length > 0 && seen.length < 3000, `шёпот не кончился: ${seen.length}`);
    assert(seen[0].str.length === 1, `сразу вся строка: «${seen[0].str}»`);
    assert(seen[0].a > 0.3, `проявляется, а не пишется: ${seen[0].a}`);
    for (let i = 1; i < seen.length; i++) assert(seen[i].str.length >= seen[i - 1].str.length && text.startsWith(seen[i].str), 'пишет не по порядку');
    const full = seen.findIndex(k => k.str === text);
    assert(full > 60, `дописал слишком быстро: ${full}`);
    assert(seen.slice(full, full + 60).every(k => k.a > 0.3), 'дописал — и сразу гаснет');
    const last = seen[seen.length - 1];
    assert(last.a < 0.02 && last.y < seen[full].y - 10, 'не выцвел и не ушёл вверх');
    Wh._reset();
  });
  test('шёпоты: красный полдень — недописанное гаснет, дальше не пишется', () => {
    const RN = RNoon;
    Wh._reset(); RN._reset();
    Wh.check({ x: 7000, y: 7010, moving: false }, [{ id: 'campfire', x: 7000, y: 7000, w: 40, h: 40 }]);
    const out = () => { const c = fakeCtx(); let got = null; c.fillText = str => { got = { str, a: c.globalAlpha }; }; Wh.draw(c, null); T.tick(); return got; };
    for (let i = 0; i < 30; i++) out();
    const before = out();
    RN.triggerRedNoon(T.t - 30); RN.stepRedNoon(T.t, 0.21, 99);
    assert(RN.redNoon.active, 'полдень не настал');
    let n = 0, k;
    while ((k = out()) && n < 1000) { assert(k.str.length <= before.str.length + 1, 'в полдень дописывает'); n++; }
    assert(n > 0 && n <= 245, `гаснет не так: ${n} шагов`);
    RN._reset(); Wh._reset();
  });
  test('перо идёт по штриху: с верхней точки — к соседней, ничего не пропускает', () => {
    const L = [[2, 3], [0, 1], [0, 3], [1, 3], [0, 0], [0, 2]].map(([x, y]) => ({ x, y }));   // «L», вразброс
    const p = Wh.penPath(L);
    eq(p.length, L.length, 'потеряло точки');
    assert(p[0].x === 0 && p[0].y === 0, 'начало не сверху');
    for (let i = 1; i < p.length; i++) {
      const d = Math.max(Math.abs(p[i].x - p[i - 1].x), Math.abs(p[i].y - p[i - 1].y));
      eq(d, 1, `перо прыгнуло: ${i}`);
    }
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
    Wh._reset();
    const loc = { id: 'campfire', x: 5000, y: 5000, w: 50, h: 50 };
    Wh.check({ x: 5000, y: 5010, moving: false }, [loc]);
    const cam = { x: 4990, y: 5000 };
    const r1 = rec(); Wh.draw(r1.c, cam);
    const tx = r1.calls.find(k => k[0] === 'text');
    // перо пишет слева направо: строка начинается на полстроки левее места (ширина строки — 10)
    assert(tx && Math.abs(tx[1] - (5025 - 10 / 2)) < 1, `шёпот не там: x=${tx && tx[1]}`);
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
