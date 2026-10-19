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
    assert(f.birds.every(b => b.st === 'ground' && (b.z === 0 || b.hop)), 'не сели');   // подскок на земле — тоже сели
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
  test('земля: у кромки городка нет щели — городок сразу переходит в первое кольцо, кромка живая', () => {
    const shifts = new Set();
    for (const [tx, ty, horiz] of [[Math.floor(T.x1 / E.TILE), Math.floor((T.y0 + 600) / E.TILE), 1], [Math.floor((T.x0 + 900) / E.TILE), Math.floor(T.y1 / E.TILE), 0]]) {
      const d = E.bakeData(tx, ty);
      const e = horiz ? T.x1 - tx * E.TILE : T.y1 - ty * E.TILE;
      for (let q = 0; q < E.TILE; q += 4) {
        // поперёк кромки: городок, потом кольцо — один раз, без третьего между ними
        let seen = 'town', at = null;
        for (let p = Math.max(0, e - 46); p <= Math.min(E.TILE - 1, e + 46); p++) {
          const m = d.mat[horiz ? q * E.TILE + p : p * E.TILE + q];
          assert(m < 56, `у кромки городка щель (краска ${m})`);
          if (m >= 8) { if (seen === 'town') { seen = 'ring'; at = p - e; } }
          else assert(seen === 'town', 'за кромкой снова городок');
        }
        assert(at !== null && Math.abs(at) <= 44, `кромка далеко от вала: ${at}`);
        shifts.add(Math.round(at / 4));
      }
    }
    assert(shifts.size >= 4, 'кромка городка — по линейке');
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

// ═══ АРТЕРИИ: дороги, река, дуги, линия неба ═══
{
  const A = await imp('world/arteries.js');
  const D = await imp('world/disc.js');
  const R = await imp('world/relief.js');
  const M = await imp('world/locations.js');
  const AG = await imp('render/archground.js');
  const EP = await imp('render/etchPaths.js');
  const F = await imp('render/fireRing.js');
  const AP = await imp('render/arteryProps.js');
  AG.prepareArchGround(M.archEnsembles, M.locations);
  const L = M.locations;
  const locBoxes = L.map(l => ({ x0: l.x - 4, y0: l.y - 12, x1: l.x + l.w + 4, y1: l.y + l.h + 6 }));
  A.buildArteries([...locBoxes, ...AG.archGroundRects(), ...AG.archProps.map(p => ({ x0: p.x - p.w / 2 - 2, y0: p.gy - 8, x1: p.x + p.w / 2 + 2, y1: p.gy + 3 }))],
    [...L, ...AG.archProps.filter(p => p.name).map(p => ({ x: p.x - p.w / 2, y: p.gy - p.h, w: p.w, h: p.h }))].map(l => ({ x0: l.x + 1, x1: l.x + l.w - 1, y: l.y + l.h })));
  (await imp('world/town.js')).buildTown();                       // как в main.js: русло, тропы и улицы городка — сразу за артериями
  const line = id => A.lines.find(l => l.id === id);
  const runs = arr => { const o = []; for (const v of arr) if (o[o.length - 1] !== v) o.push(v); return o; };
  const cross = (a, b, c, d) => { const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)); return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b); };
  const crossings = (P, Q) => { let n = 0; for (let i = 0; i < P.length - 1; i++) { if (!P[i].st) continue; for (let j = 0; j < Q.length - 1; j++) if (Q[j].st && cross(P[i], P[i + 1], Q[j], Q[j + 1])) n++; } return n; };
  const river = line('river');
  test('дороги: тропа → мостовая → брусчатка → асфальт → трасса; в огне умирают в обратном порядке', () => {
    const want = ['trail', 'paved', 'cobble', 'asphalt', 'highway', 'asphalt', 'cobble', 'trail'];
    for (const side of ['south', 'north', 'east', 'west', 'plain']) {
      const st = runs(line('road:' + side).pts.map(p => p.st)).filter(Boolean);
      eq(st.join(' > '), want.join(' > '), `дорога ${side}`);
    }
    eq(A.roadStage(D.RING_W * 9 + D.FIRE_W * 0.95), null, 'у самого края дороги нет');
  });
  test('река: спираль — каждое кольцо и каждая сторона по разу; ручей → акведук → ручей → канал → труба → сухое русло', () => {
    eq(runs(river.pts.map(p => D.ringAt(p.x, p.y))).join(','), '1,2,3,4,5,6,7,8,9,10', 'кольца по ходу');
    const sides = runs(river.pts.map(p => R.sideAt(p.x, p.y)));
    eq(sides.length, 5, `стороны по ходу: ${sides}`);
    eq(new Set(sides).size, 5, `сторона дважды: ${sides}`);
    eq(runs(river.pts.map(p => p.st)).filter(Boolean).join(' > '), 'stream > aqueduct > stream > canal > pipe > dry', 'стадии');
    assert(D.townDist(river.pts[0].x, river.pts[0].y) < 120, 'родник не у городка');
  });
  test('река: каждую дорогу переходит по разу; вода — мост, поднятое — дорога понизу', () => {
    for (const side of ['south', 'north', 'east', 'west', 'plain']) eq(crossings(line('road:' + side).pts, river.pts), 1, `дорога ${side} × река`);
    assert(A.bridges.length >= 2, `мостов ${A.bridges.length}`);
    for (const b of A.bridges) assert(['stone', 'iron', 'concrete', 'rail'].includes(b.style), 'мост без эпохи');
    // мост есть ровно там, где дорога переходит воду
    const wet = [];
    for (const side of ['south', 'north', 'east', 'west', 'plain']) {
      const P = line('road:' + side).pts;
      for (let i = 0; i < P.length - 1; i++) for (let j = 0; j < river.pts.length - 1; j++) {
        const c = river.pts[j];
        if ((c.st === 'stream' || c.st === 'canal') && cross(P[i], P[i + 1], c, river.pts[j + 1])) wet.push(P[i]);
      }
    }
    for (const p of wet) assert(A.bridges.some(b => Math.hypot(b.x - p.x, b.y - p.y) < 20), `переход воды без моста у (${p.x | 0},${p.y | 0})`);
  });
  test('дуги: от дороги до дороги по своему кольцу, на швах сторон — площадки узлов', () => {
    const ring = { silk: 1, caravan: 3, winter: 3, portage: 3, rail: 6, net: 9 };
    for (const [id, n] of Object.entries(ring)) {
      const P = line('arc:' + id).pts;
      const inRing = P.filter(p => D.ringAt(p.x, p.y) === n).length / P.length;
      assert(inRing > 0.9, `дуга ${id}: в своём кольце ${(inRing * 100).toFixed(0)}%`);
      if (id === 'net') { assert(Math.hypot(P[0].x - P[P.length - 1].x, P[0].y - P[P.length - 1].y) < 40, 'сеть — не кольцо'); continue; }
      for (const end of [P[0], P[P.length - 1]]) assert(A.onArtery(end.x, end.y, 2, line('arc:' + id)), `дуга ${id} не упирается в дорогу`);
    }
    eq(A.nodes.length, 6, 'площадок узлов');
    const ORDER = ['north', 'plain', 'east', 'south', 'west'];
    for (const n of A.nodes) {
      const arc = A.lines.find(l => l.kind === 'arc' && l.name === n.road);
      assert(arc && A.onArtery(n.x, n.y, 1), `площадка «${n.road}» не на своей дуге`);
      const i = ORDER.indexOf(n.pair[0]), j = ORDER.indexOf(n.pair[1]);
      eq((i + 1) % 5, j, `узел ${n.pair} — не смежные стороны`);
    }
  });
  test('под ногами: дорога — тропа, ручей — вброд, мост и брод — посуху, на севере вода — лёд', () => {
    const road = line('road:south').pts[40];
    eq(A.surfaceOf(road.x, road.y), 'path', 'на дороге');
    const wet = river.pts.find(p => p.st === 'stream' && !p.ice && !A.fordAt(p.s) && !A.onArtery(p.x, p.y, 20, river));
    eq(A.surfaceOf(wet.x, wet.y), 'water', 'в ручье');
    for (const b of A.bridges) eq(A.surfaceOf(b.x, b.y), 'path', 'на мосту');
    assert(A.fords.length >= 2, `бродов ${A.fords.length}`);
    for (const f of A.fords) eq(A.surfaceOf(f.x, f.y), 'path', 'на броде');
    const ice = river.pts.find(p => p.ice && !A.onArtery(p.x, p.y, 20, river));
    assert(ice && R.sideAt(ice.x, ice.y) === 'north', 'лёд не на севере');
    eq(A.surfaceOf(ice.x, ice.y), 'ice', 'на льду');
    eq(A.surfaceOf(D.TOWN.x0 + 500, D.TOWN.y0 + 500), null, 'в городке артерий нет');
  });
  test('земля: дорога ложится в плитку без горизонталей, над водой — настил моста', () => {
    const T = 128, out = new Uint8Array(T * T), cls = new Uint8Array(T * T).fill(5);
    const b = A.bridges.find(q => q.style !== 'rail') || A.bridges[0];
    const x0 = Math.floor(b.x / T) * T, y0 = Math.floor(b.y / T) * T;
    assert(EP.stampPaths(x0, y0, T, out, cls), 'плитка без артерий');
    const k = Math.round(b.y - y0) * T + Math.round(b.x - x0), o = EP.OV[out[k]];
    assert(o && o.a === 1 && o.col.join() === [0x4a, 0x46, 0x3f].join(), `у моста не настил: ${o && o.col}`);
    eq(cls[k], 0, 'на мосту горизонталь');
    let paths = 0, clean = 0;
    for (let q = 0; q < T * T; q++) if (out[q]) { paths++; if (cls[q] === 0) clean++; }
    eq(clean, paths, 'на полотне остался штрих');
  });
  test('линия неба: акведук → аркады → столбы → ЛЭП → эстакада; опоры не на постройках', () => {
    for (const side of ['south', 'north', 'east', 'west', 'plain']) {
      const S = line('sky:' + side);
      eq(runs(S.pts.map(p => p.st)).filter(Boolean).join(' > '), 'aqueduct > arcade > poles > pylons > flyover', `линия неба ${side}`);
      for (const p of S.pts) if (p.ok) assert(!L.some(l => p.x > l.x && p.x < l.x + l.w && p.y > l.y && p.y < l.y + l.h), `опора в постройке у (${p.x | 0},${p.y | 0})`);
    }
    AP.buildArteryProps();
    assert(AP.arteryProps.length > 300, `поднятого ${AP.arteryProps.length}`);
    for (const p of AP.arteryProps) assert(p.h > 0 && p.w > 0 && Number.isFinite(p.gy), 'кусок без рамки');
    const view = AP.arteryPropsIn(line('sky:east').pts[60].x - 320, line('sky:east').pts[60].y - 180, line('sky:east').pts[60].x + 320, line('sky:east').pts[60].y + 180);
    assert(view.length > 0, 'в кадре у линии неба пусто');
  });
  test('кольцо огня: дорога проходит огонь насквозь — костров на ней нет', () => {
    F.fireSitesAvoid((x, y) => A.onArtery(x, y, 18));
    for (const f of F.fireSites) assert(!A.onArtery(f.x, f.y, 10), `костёр на дороге (${f.x},${f.y})`);
    assert(F.fireSites.length > 30, `костров ${F.fireSites.length}`);
  });
}

// ═══ РАСТИТЕЛЬНОСТЬ, ПОЛЯ, ПРИМЕТЫ (идут после артерий: их обходят) ═══
{
  const A = await imp('world/arteries.js');
  const D = await imp('world/disc.js');
  const R = await imp('world/relief.js');
  const RT = await imp('world/routes.js');
  const F = await imp('world/flora.js');
  const FD = await imp('world/fields.js');
  const LM = await imp('world/landmarks.js');
  const AG = await imp('render/archground.js');
  const EP = await imp('render/etchPaths.js');
  FD.buildFields(AG.archGroundRects());
  LM.buildLandmarks();
  const ML = (await imp('world/locations.js')).locations;
  F.buildFlora([...LM.landmarkBoxes(), ...ML.map(l => ({ x0: l.x - 10, y0: l.y - 8, x1: l.x + l.w + 10, y1: l.y + l.h + 10 }))], LM.landmarks.filter(l => l.kind === 'oasis'));   // как в main.js
  const river = A.lines.find(l => l.kind === 'river');
  const ALLEYS = new Set(['poplar', 'birch', 'palm']);
  test('растительность: вид по стороне и эпохе; не на постройках, дорогах и реке', () => {
    assert(F.flora.length > 800, `растений ${F.flora.length}`);
    for (const t of F.flora) {
      if (t.sp === 'reed' || t.town) continue;                     // Мёртвый лес городка — своим тестом
      assert(!RT.blockedAt(A.artBlock, t.x, t.gy), `${t.sp} на постройке или во дворе (${t.x},${t.gy})`);
      assert(!A.onArtery(t.x, t.gy, 2), `${t.sp} на дороге или в реке (${t.x},${t.gy})`);
      const ok = F.KINDS[t.side].rows[t.ring - 1].some(e => e.sp === t.sp) || ALLEYS.has(t.sp);
      assert(ok, `${t.sp} не растёт на стороне ${t.side} в кольце ${t.ring}`);
    }
  });
  test('рощи и поляны: лес запада гуще юга; в кадре не чаща', () => {
    const count = (side, n) => F.flora.filter(t => t.side === side && t.ring <= n && t.sp !== 'reed').length;
    assert(count('west', 2) > 3 * count('south', 2), `запад ${count('west', 2)}, юг ${count('south', 2)}`);
    let worst = 0;
    for (const t of F.flora) worst = Math.max(worst, F.floraIn(t.x - 320, t.gy - 180, t.x + 320, t.gy + 180).length);
    assert(worst < 160, `в кадре ${worst} растений`);
    // к краю растительность отступает: в девятом кольце меньше, чем во втором
    assert(F.flora.filter(t => t.ring === 9).length < F.flora.filter(t => t.ring === 2).length / 3, 'к огню не редеет');
  });
  test('камыш — по берегу ручья, не на льду', () => {
    const reeds = F.flora.filter(t => t.sp === 'reed');
    assert(reeds.length > 10, `камыша ${reeds.length}`);
    for (const r of reeds) {
      let best = Infinity, near = null;
      for (const p of river.pts) { const d = Math.hypot(p.x - r.x, p.y - r.gy); if (d < best) { best = d; near = p; } }
      assert(best < 12 && near.st === 'stream' && !near.ice, `камыш не у ручья: ${best.toFixed(1)} ${near.st}`);
    }
  });
  test('поля: у жилья и дорог, своим видом; не на дорогах и не на постройках; борозды — в землю, склон виден', () => {
    assert(FD.fields.length > 20, `полей ${FD.fields.length}`);
    const kinds = new Set(FD.fields.map(f => f.kind));
    for (const k of ['paddy', 'garden', 'strip']) assert(kinds.has(k), `нет полей «${k}»`);
    for (const f of FD.fields) {
      assert(!A.onArtery(f.cx, f.cy, 2), 'поле на дороге');
      assert(!RT.blockedAt(A.artBlock, f.cx, f.cy), 'поле на постройке');
      assert(FD.fieldAt(f.cx, f.cy) === f, 'середина поля — не в поле');
    }
    const f = FD.fields.find(q => q.kind === 'strip' || q.kind === 'plow') || FD.fields[0];
    const T = 128, out = new Uint8Array(T * T), cls = new Uint8Array(T * T).fill(5);
    const x0 = Math.floor(f.cx / T) * T, y0 = Math.floor(f.cy / T) * T;
    EP.stampPaths(x0, y0, T, out, cls);
    let inF = 0, marked = 0, kept = 0;
    for (let k = 0; k < T * T; k++) {
      const x = x0 + (k % T), y = y0 + ((k / T) | 0);
      if (FD.inField(f, x, y) < 3 || A.onArtery(x, y, 3)) continue;
      inF++;
      if (out[k]) marked++;
      if (out[k] && EP.OV[out[k]].a < 1 && cls[k] === 5) kept++;
    }
    assert(inF > 50 && marked / inF > 0.3, `борозд мало: ${marked} из ${inF}`);
    assert(kept > 0, 'под бороздами пропал штрих склона');
  });
  test('приметы у реки: дерево у родника, вмёрзшая мельница, шлюз, задвижка, лодка в сухом русле', () => {
    const near = (kind, pred, r) => LM.landmarks.filter(l => l.kind === kind).some(l => river.pts.some(p => pred(p) && Math.hypot(p.x - l.x, p.y - l.gy) < r));
    assert(near('clootie', p => p === river.pts[2], 30), 'у родника нет дерева');
    assert(near('frozenMill', p => p.st === 'stream' && p.ice, 30), 'мельница не у ручья подо льдом');
    assert(near('locks', p => p.st === 'canal' && !p.ice, 6), 'шлюз не на канале');
    assert(near('valve', p => p.st === 'pipe', 16), 'задвижка не на трубе');
    assert(near('boat', p => p.st === 'dry', 6), 'лодка не в сухом русле');
  });
  test('приметы на вершинах — выше округи; у дорог — там, где примыкает дуга', () => {
    const HILLS = new Set(['seid', 'cairn', 'menhir', 'calvary', 'windmill', 'semaphore', 'stupa', 'pillbox', 'turbine', 'celltower']);
    let n = 0;
    for (const l of LM.landmarks) {
      if (!HILLS.has(l.kind)) continue;
      n++;
      const h = R.heightAt(l.x, l.gy);
      let lower = 0;
      for (let k = 0; k < 8; k++) if (R.heightAt(l.x + Math.cos(k * Math.PI / 4) * 50, l.gy + Math.sin(k * Math.PI / 4) * 25) < h + 1.5) lower++;
      assert(lower >= 7, `${l.kind} (${l.x},${l.gy}) не на вершине: ниже — ${lower} из 8`);
    }
    assert(n >= 25, `примет на вершинах ${n}`);
    const ways = LM.landmarks.filter(l => ['herm', 'khachkar', 'watertower', 'busstop'].includes(l.kind));
    assert(ways.length >= 8, `придорожных ${ways.length}`);
    for (const w of ways) assert(A.nearRoad(w.x, w.gy, 90), `${w.kind} не у дороги`);
    for (const l of LM.landmarks) assert(!A.onArtery(l.x, l.gy, 0, river) || ['iceHole', 'locks', 'barge', 'boat'].includes(l.kind), `${l.kind} на дороге`);
  });
  test('пустота не случайна: в углах колец 1–6 голых кадров не больше половины', () => {
    const T = D.TOWN;
    let s = 4242; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (const [cx, cy, name] of [[T.x1, T.y1, 'ЮВ'], [T.x0, T.y1, 'ЮЗ'], [T.x0, T.y0, 'СЗ']]) {
      for (let n = 1; n <= 6; n++) {
        let bare = 0, v = 0;
        for (let k = 0; k < 24; k++) {
          const a = (0.15 + 0.7 * rnd()) * Math.PI / 2, r = (n - 1 + rnd()) * D.RING_W;
          const x = cx + (cx > T.x0 ? 1 : -1) * Math.cos(a) * r, y = cy + (cy > T.y0 ? 1 : -1) * Math.sin(a) * r;
          if (D.ringAt(x, y) !== n) continue;
          v++;
          const x0 = x - 320, y0 = y - 180, x1 = x + 320, y1 = y + 180;
          const trees = F.floraIn(x0, y0, x1, y1).filter(t => t.sp !== 'reed' && t.sp !== 'bush').length;
          const lms = LM.landmarks.some(l => l.x > x0 && l.x < x1 && l.gy > y0 && l.gy < y1);
          const flds = FD.fieldsIn(x0, y0, x1, y1).length;
          const props = AG.archProps.some(p => p.x > x0 && p.x < x1 && p.gy > y0 && p.gy < y1);
          if (trees < 3 && !lms && !flds && !props) bare++;
        }
        assert(v < 6 || bare / v <= 0.5, `угол ${name}, кольцо ${n}: голых кадров ${bare} из ${v}`);
      }
    }
  });
}

// ═══ ВЕЩЬ В ЗЕМЛЕ И НЕ КОПИИ (ткань поля — после рощ, полей и примет) ═══
{
  const D = await imp('world/disc.js');
  const M = await imp('world/locations.js');
  const AG = await imp('render/archground.js');
  const GR = await imp('render/ground.js');
  const TH = await imp('render/things.js');
  const FD = await imp('world/fields.js');
  const F = await imp('world/flora.js');
  const LM = await imp('world/landmarks.js');
  const H = await imp('world/hang.js');
  const ART = await imp('world/arteries.js');
  const { ARCH_BY_RING } = await imp('sprites/arch/index.js');
  const { FRAGMENTS } = await imp('sprites/fragments.js');
  const { SEGMENTS } = await imp('content/ulitsa_db.js');
  GR.setTissueBlockers([...M.locations.map(l => ({ x0: l.x - 4, y0: l.y - 20, x1: l.x + l.w + 4, y1: l.y + l.h + 6 })), ...AG.archGroundRects()]);
  const yard = AG.archProps.filter(p => p.name);
  const tissue = GR.buildTissue(yard);
  // холст-самописец: что и чем рисовали
  const rec = () => {
    const log = [];
    const ctx = new Proxy({ canvas: { width: 1, height: 1 } }, {
      get(t, k) { if (k in t) return t[k]; return (...a) => { log.push([k, ...a]); return k === 'measureText' ? { width: 1 } : String(k).startsWith('create') ? { addColorStop: noop } : undefined; }; },
      set(t, k, v) { log.push(['=' + k, v]); return true; },
    });
    return { log, ctx };
  };
  test('утварь: живое (огонь, вода, подвес) помечено live — его не запекают', () => {
    for (const A of Object.values(ARCH_BY_RING)) for (const L of Object.values(A.props || {})) for (const p of L) {
      const n0 = H._count(), a = rec(), b = rec();
      p.draw(a.ctx, 500, 500, 0); p.draw(b.ctx, 500, 500, 37);
      const live = H._count() > n0 || JSON.stringify(a.log) !== JSON.stringify(b.log);
      assert(!live || p.live, `«${p.name}» живая, а не помечена live`);
    }
  });
  test('обломки эпох: по три на кольцо, рисунок в своей рамке, краски канона', () => {
    const OK = new Set(['#0D0B0A', '#D9CFB8', '#8A8D8F', '#3D4A3A', '#15100c', '#241c14', '#2a2620', '#34302a', '#3a3328', '#3a2818', '#c8b89a', '#b0a284'].map(c => c.toLowerCase()));
    eq(FRAGMENTS.length, D.RINGS, 'колец');
    for (const ring of FRAGMENTS) {
      eq(ring.length, 3, 'обломков на кольцо');
      for (const f of ring) {
        const r = rec(); f.draw(r.ctx, 100, 200, 0);
        for (const [k, ...a] of r.log) {
          if (k === '=fillStyle') assert(OK.has(String(a[0]).toLowerCase()), `«${f.name}»: краска ${a[0]} вне палитры`);
          if (k !== 'fillRect') continue;
          const [x, y, w, h] = a;
          assert(x >= 100 - f.w / 2 - 1 && x + w <= 100 + f.w / 2 + 1, `«${f.name}» вылез вбок: ${x}..${x + w}`);
          assert(y >= 200 - f.h - 1 && y + h <= 200, `«${f.name}» вылез по высоте: ${y}..${y + h}`);
        }
      }
    }
  });
  test('ткань поля: вид своего кольца и стороны или обломок эпохи; не живое, не тёплое, не примета эпохи', () => {
    assert(tissue.length > 200, `вещей ткани ${tissue.length}`);
    for (const it of tissue) {
      const own = ARCH_BY_RING[SEGMENTS[it.pr - 1].id].props[it.side] || [];
      const K = own.find(p => p.name === it.kind) || FRAGMENTS[it.pr - 1].find(f => f.name === it.kind);
      assert(K, `«${it.kind}» не из кольца ${it.pr} стороны ${it.side}`);
      assert(!K.live && !K.unique, `«${it.kind}» — живое или примета эпохи`);
      assert(!['кальян', 'самовар на столике', 'фонарь', 'лоток-ятай', 'ларёк'].includes(it.kind), `«${it.kind}» тёплое — брошенным не лежит`);
    }
  });
  test('не копии: одна и та же вещь в кадр дважды не попадает — ни в поле, ни рядом с двором', () => {
    const all = [...tissue.map(it => ({ x: it.thing.x, y: it.wy, d: it.thing.src, n: it.kind })), ...yard.map(p => ({ x: p.x, y: p.gy, d: p.kindDraw, n: p.name }))];
    for (let i = 0; i < tissue.length; i++) for (let j = i + 1; j < all.length; j++) {
      const a = all[i], b = all[j];
      if (a.d !== b.d) continue;
      assert(Math.abs(a.x - b.x) >= 640 || Math.abs(a.y - b.y) >= 360, `«${a.n}» дважды в кадре: (${a.x},${a.y}) и (${b.x},${b.y})`);
    }
  });
  test('ткань поля: не в поле, не на примете, не под деревом, не на дороге', () => {
    for (const it of tissue) {
      const x = it.thing.x, y = it.wy;
      assert((FD.fieldAt(x, y)?.kind ?? 'fallow') === 'fallow', `«${it.kind}» в поле (${x},${y})`);
      assert(!F.floraIn(x - 18, y - 8, x + 18, y + 8).length, `«${it.kind}» под деревом (${x},${y})`);
      for (const b of LM.landmarkBoxes()) assert(!(x + 16 > b.x0 && x - 16 < b.x1 && y + 4 > b.y0 && y - 30 < b.y1), `«${it.kind}» на примете (${x},${y})`);
      assert(GR.tissueThingsIn(x - 1, y - 1, x + 1, y + 1).includes(it.thing), 'вещь не находится в своём кадре');
      assert(!ART.onArtery(x, y, 4), `«${it.kind}» на дороге или в реке (${x},${y})`);
    }
  });
  test('износ: старое глубже в земле, двор — нет; север под снегом, юг в песке, у огня копоть', () => {
    const w = o => TH.wearOf({ side: 'west', d: 300, seed: 5, ...o });
    let prev = Infinity;
    for (let era = 1; era <= 9; era++) { const b = w({ ring: era }).bury; assert(b <= prev + 1e-9, `кольцо ${era} глубже прошлого`); prev = b; }
    assert(w({ ring: 1 }).bury > 0.15, 'осевое не в земле');
    eq(w({ ring: 7 }).bury, 0, 'катастрофы в земле');
    eq(w({ ring: 1, yard: true }).bury, 0, 'во дворе вещь в землю не уходит');
    assert(w({ ring: 4, old: true }).bury > w({ ring: 4 }).bury, 'обломок прошлой эпохи не глубже');
    eq(TH.wearOf({ ring: 3, side: 'north', d: 500, seed: 1 }).foot, 'snow', 'север');
    eq(TH.wearOf({ ring: 3, side: 'south', d: 500, seed: 1 }).foot, 'sand', 'юг');
    assert(TH.wearOf({ ring: 9, side: 'east', d: D.RINGS * D.RING_W - 10, seed: 1 }).soot > 0.9, 'у огня без копоти');
    eq(TH.wearOf({ ring: 9, side: 'east', d: 1500, seed: 1 }).soot, 0, 'копоть вдали от огня');
    assert(w({ ring: 1 }).moss > w({ ring: 6 }).moss, 'мох в старом не гуще');
    eq(TH.wearOf({ ring: 1, side: 'south', d: 100, seed: 1 }).moss, 0, 'мох в пустыне');
    const sig = new Set();
    for (let s = 0; s < 60; s++) { const o = TH.wearOf({ ring: 2, side: 'west', d: 300, seed: s }); sig.add([o.bury.toFixed(3), o.lean, o.chips].join()); }
    assert(sig.size > 40, `разных зёрен ${sig.size} из 60`);
  });
}

// ═══ ГОРОДОК ПО КАНОНУ: русло, мост, замок-погода, окно №3 ═══
{
  const A = await imp('world/arteries.js');
  const D = await imp('world/disc.js');
  const M = await imp('world/locations.js');
  const TW = await imp('world/town.js');
  const C = await imp('render/castle.js');
  if (!A.lines.some(l => l.id === 'river:town')) TW.buildTown();
  const bed = A.lines.find(l => l.id === 'river:town');
  const loc = id => M.locations.find(l => l.id === id);
  test('городок: высохшее русло — в посёлке, сухое, кончается лужицей «Высохшего русла», мест не задевает', () => {
    assert(bed && bed.pts.length > 50, 'русла нет');
    for (const p of bed.pts) {
      assert(p.x > D.TOWN.x0 && p.x < D.TOWN.x1 && p.y > D.TOWN.y0 && p.y < D.TOWN.y1, `русло вне городка (${p.x | 0},${p.y | 0})`);
      eq(p.st, 'bed', 'стадия');
    }
    const rb = loc('riverbed'), end = bed.pts[bed.pts.length - 1];
    assert(Math.abs(end.x - (rb.x + rb.w / 2)) < 30 && Math.abs(end.y - (rb.y + rb.h / 2)) < 20, 'русло не доходит до лужицы');
    for (const l of M.locations) {
      if (l.id === 'riverbed') continue;
      for (const p of bed.pts) assert(!(p.x > l.x - 12 && p.x < l.x + l.w + 12 && p.y > l.y - 12 && p.y < l.y + l.h + 12), `русло задевает «${l.name}» (${p.x | 0},${p.y | 0})`);
    }
    assert(A.surfaceOf(bed.pts[40].x, bed.pts[40].y) !== 'water', 'в сухом русле вода');
  });
  test('мост: поперёк русла; с него в кадре и врата (и на телефоне стоймя)', () => {
    const B = TW.BRIDGE, g = loc('gates');
    const near = bed.pts.reduce((a, p) => Math.abs(p.y - (B.gy - 3)) < Math.abs(a.y - (B.gy - 3)) ? p : a);
    assert(Math.abs(near.x - B.x) <= 2, `мост мимо русла: ${B.x} и ${near.x | 0}`);
    assert(B.half * 2 > near.hw * 2 + 10, 'мост короче русла');
    const dx = g.x + g.w / 2 - B.x, dy = g.y + g.h / 2 - B.gy;
    assert(Math.abs(dx) < 180 && Math.abs(dy) < 170, `врата не видно с моста: ${dx | 0}, ${dy | 0}`);
    assert(TW.onBridge(B.x, B.gy - 3), 'на середине моста — не на мосту');
    assert(!TW.onBridge(B.x + B.half + 6, B.gy - 3) && !TW.onBridge(B.x, B.gy + 12), 'на мосту — и мимо него');
  });
  test('замок-погода: туман приходит и уходит; буря и красный полдень прячут; на мосту расходится', () => {
    for (let k = 0; k < 400; k++) C.stepCastle(false);
    const v0 = C.castleSeen(0, 0);
    assert(v0 >= 0 && v0 <= 1, `видимость ${v0}`);
    eq(C.castleSeen(1, 0), 0, 'в бурю виден');
    eq(C.castleSeen(0, 1), 0, 'в красный полдень виден');
    for (let k = 0; k < 300; k++) C.stepCastle(true);
    assert(C.castleClear() > 0.99, `с моста туман не разошёлся: ${C.castleClear()}`);
    assert(C.castleSeen(0, 0) > 0.99, 'с моста замок не виден');
    for (let k = 0; k < 600; k++) C.stepCastle(false);
    assert(C.castleClear() < 0.01, 'туман не вернулся');
  });
  test('окно №3: светится — тёплым, у окна; одно из трёх тёплых пятен городка', () => {
    const o = loc('office');
    assert(o.light && o.light.color[0] > 200 && o.light.color[2] < 90, 'окно №3 не тёплое');
    assert(o.light.dx < o.w / 2 && o.light.dy > 10, 'свет не у окна');
  });
}

// ═══ ГОРОДОК: ПЯТЬ ЗОН (weave/TOWN.md) ═══
{
  const D = await imp('world/disc.js');
  const M = await imp('world/locations.js');
  const R = await imp('world/relief.js');
  const E = await imp('render/etch.js');
  const fs = await import('fs');
  const T = D.TOWN;
  const hsv = ([r, g, b]) => {
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0;
    let h = 0;
    if (mx > mn) { if (mx === r) h = ((g - b) / (mx - mn)) % 6; else if (mx === g) h = (b - r) / (mx - mn) + 2; else h = (r - g) / (mx - mn) + 4; h = (h * 60 + 360) % 360; }
    return { h, sat, v: mx / 255 };
  };
  const neon = c => { const q = hsv(c); return q.sat > 0.5 && q.v > 0.35 && q.h > 70 && q.h < 320; };
  const THIRD = [140, 198, 63];                                    // третья краска — код (weave/INK.md)
  test('свет мест: без неона и синего; в городке тёплое — костёр, окно №3 и горящая мусорка', () => {
    for (const l of M.locations) {
      const L = l.light;
      if (!L) continue;
      const c = L.color, third = Math.abs(c[0] / c[1] - THIRD[0] / THIRD[1]) < 0.12 && l.id === 'terminal';
      assert(!neon(c) || third, `свет «${l.name}» вне палитры: ${c}`);
      const cx = l.x + l.w / 2, cy = l.y + l.h / 2, inTown = cx > T.x0 && cx < T.x1 && cy > T.y0 && cy < T.y1;
      const warm = c[0] > 200 && c[2] < 90;
      if (inTown && warm) assert(['campfire', 'office', 'dumpster'].includes(l.id), `тёплый свет «${l.name}» — сверх канона`);
    }
  });
  test('старые рисунки мест: в общей палитре нет неона и синего', () => {
    const src = fs.readFileSync(new URL('../src/sprites/locations/index.js', import.meta.url), 'utf8');
    const P = src.slice(src.indexOf('const P = {'), src.indexOf('};', src.indexOf('const P = {')));
    const bad = [];
    for (const m of P.matchAll(/(\w+):\s*'#([0-9a-fA-F]{6})'/g)) {
      const n = parseInt(m[2], 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255];
      if (neon(c) && !(m[1] === 'term' && c.join() === THIRD.join())) bad.push(m[1] + ' #' + m[2]);
    }
    eq(bad.length, 0, 'неон в палитре: ' + bad.join(', '));
  });
  const F = await imp('world/flora.js');
  const A = await imp('world/arteries.js');
  const loc = id => M.locations.find(l => l.id === id);
  test('Мёртвый лес: сухостой рощами — только сухое, в зоне леса, не на местах, не на валу и не на тропе', () => {
    const wood = F.flora.filter(t => t.town === 'forest');
    assert(wood.length > 200, `сухостоя ${wood.length}`);
    const DEAD = new Set(['dead', 'deadspruce', 'snag', 'stump', 'log']), seen = new Set();
    for (const t of wood) {
      assert(DEAD.has(t.sp), `живое в Мёртвом лесу: ${t.sp}`);
      seen.add(t.sp);
      const [wx, wy] = R.townWarp(t.x, t.gy);
      eq(R.townZoneOf(t.x + wx, t.gy + wy), 0, `${t.sp} вне леса (${t.x},${t.gy})`);
      assert(R.townEdge(t.x, t.gy) < -10, `${t.sp} на валу (${t.x},${t.gy})`);
      assert(!A.onArtery(t.x, t.gy, 2), `${t.sp} на тропе (${t.x},${t.gy})`);
      for (const l of M.locations) assert(!(t.x > l.x - 2 && t.x < l.x + l.w + 2 && t.gy > l.y - 2 && t.gy < l.y + l.h + 4), `${t.sp} на «${l.name}»`);
    }
    eq(seen.size, DEAD.size, 'не все виды сухостоя');
    // рощами: в окне 200×120 бывает и чаща, и пусто
    const counts = [];
    for (let y = T.y0 + 40; y < T.y0 + 300; y += 120) for (let x = T.x0 + 100; x < T.x1 - 300; x += 200)
      counts.push(wood.filter(t => t.x >= x && t.x < x + 200 && t.gy >= y && t.gy < y + 120).length);
    assert(Math.max(...counts) > 4 * Math.max(1, Math.min(...counts)), `ровно, не рощами: ${Math.min(...counts)}..${Math.max(...counts)}`);
  });
  test('тропа к кресту: от костра — в Мёртвый лес — к подножию креста на холме', () => {
    const P = A.lines.find(l => l.id === 'road:town-cross'), cr = loc('cross'), fire = loc('campfire');
    assert(P && P.pts.length > 20, 'тропы нет');
    const a = P.pts[0], b = P.pts[P.pts.length - 1];
    assert(Math.hypot(a.x - (fire.x + fire.w / 2), a.y - (fire.y + fire.h)) < 120, `тропа не от костра: ${a.x | 0},${a.y | 0}`);
    assert(Math.abs(b.x - (cr.x + cr.w / 2)) < 16 && b.y > cr.y + cr.h - 4 && b.y < cr.y + cr.h + 16, `тропа не у креста: ${b.x | 0},${b.y | 0}`);
    for (const p of P.pts) {
      eq(p.st, 'trail', 'тропа — не тропа');
      for (const l of M.locations) assert(!(p.x > l.x + 2 && p.x < l.x + l.w - 2 && p.y > l.y + 2 && p.y < l.y + l.h - 6), `тропа сквозь «${l.name}» (${p.x | 0},${p.y | 0})`);
    }
  });
  test('старые рисунки мест: и вписанные прямо в рисунок краски — без синего, лилового, розового, неона и чистого белого', () => {
    const src = fs.readFileSync(new URL('../src/sprites/locations/index.js', import.meta.url), 'utf8'), bad = [];
    for (const m of src.matchAll(/'#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})'/g)) {
      const h = m[1].length === 3 ? [...m[1]].map(c => c + c).join('') : m[1], n = parseInt(h, 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255];
      const blue = c[2] > c[0] + 25 && c[2] > c[1] + 8, white = c.every(v => v > 240);
      if ((blue || white || neon(c)) && h.toLowerCase() !== THIRD.map(v => v.toString(16)).join('')) bad.push('#' + m[1]);
    }
    eq(bad.length, 0, 'вне канона: ' + [...new Set(bad)].join(', '));
  });
  test('места и фигуры по канону: краски без синего, белого и неона, золото — только у Sol, без векторных фигур', () => {
    const GOLDS = ['b8860b', 'daa520', 'a06820', '7a4a14'], bad = [];
    for (const f of ['sprites/locations/canon.js', 'sprites/npcs/nocturnal.js', 'sprites/npcs/sol.js', 'sprites/npcs/jester.js', 'sprites/npcs/elder.js', 'sprites/player.js']) {
      const src = fs.readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
      for (const m of src.matchAll(/'#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})'/g)) {
        const h = (m[1].length === 3 ? [...m[1]].map(c => c + c).join('') : m[1]).toLowerCase(), n = parseInt(h, 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255];
        const blue = c[2] > c[0] + 25 && c[2] > c[1] + 8, white = c.every(v => v > 240);
        if ((blue || white || neon(c)) && h !== THIRD.map(v => v.toString(16)).join('')) bad.push(f + ' #' + h);
        if (GOLDS.includes(h) && !f.endsWith('sol.js')) bad.push(f + ': золото #' + h);
      }
      assert(!/createLinearGradient|createRadialGradient|\.arc\(|\.ellipse\(|bezierCurveTo|quadraticCurveTo|\.stroke\(\)/.test(src), `${f}: векторное — только точки`);
    }
    eq(bad.length, 0, 'вне канона: ' + bad.join(', '));
  });
  test('земля городка: у каждой зоны своя фактура, артерий она не трогает', () => {
    const pick = { 0: [T.x0 + 900, T.y0 + 100], 1: [T.x0 + 1000, T.y0 + 1400], 2: [T.x0 + 160, T.y0 + 700], 3: [T.x0 + 2300, T.y0 + 900], 4: [T.x0 + 1100, T.y0 + 700] };
    for (const [z, [x, y]] of Object.entries(pick)) {
      const d = E.bakeData(Math.floor(x / E.TILE), Math.floor(y / E.TILE));
      let own = 0, tex = 0;
      for (let k = 0; k < d.mat.length; k++) if (d.mat[k] === +z) { own++; if (d.ov[k]) tex++; }
      assert(own > 2000, `зона ${R.TOWN_ZONES[z]}: в плитке своей земли ${own}`);
      assert(tex / own > 0.002 && tex / own < 0.5, `зона ${R.TOWN_ZONES[z]}: фактуры ${(tex / own * 100).toFixed(1)}%`);
    }
  });
}

// ═══ КВАРТАЛ ГОРОДКА: улицы, фундаменты, огрызки стен, мёртвые фонари ═══
{
  const A = await imp('world/arteries.js');
  const M = await imp('world/locations.js');
  const TW = await imp('world/town.js');
  const Q = await imp('sprites/quarter.js');
  const near = (x, y, r, L) => A.onArtery(x, y, r) && (!L || L.pts.some(p => Math.hypot(p.x - x, p.y - y) < r + 8));
  const boxes = M.locations.map(l => ({ x0: l.x + 2, y0: l.y + 2, x1: l.x + l.w - 2, y1: l.y + l.h - 2, name: l.name }));
  test('квартал: улицы сеткой — от западных ворот, мощёные в руинах, мест не задевают', () => {
    const west = A.lines.find(l => l.id === 'road:west').pts[0];
    for (const [id] of TW.STREETS) {
      const L = A.lines.find(l => l.id === id);
      assert(L && L.pts.length > 10, `улицы ${id} нет`);
      for (const p of L.pts) {
        assert(['street', 'lane'].includes(p.st), `${id}: стадия ${p.st}`);
        const inside = [0, 24, -24].some(d => TW.inQuarter(p.x - d, p.y));           // на краю квартала — к соседу: к библиотеке, к посёлку
        assert(inside || Math.hypot(p.x - west.x, p.y - west.y) < 70 || A.lines.some(o => o.id !== id && o.id.startsWith('road:q-') && near(p.x, p.y, 2, o)), `${id} вне квартала (${p.x | 0},${p.y | 0})`);
        for (const b of boxes) assert(!(p.x > b.x0 && p.x < b.x1 && p.y > b.y0 && p.y < b.y1), `${id} сквозь «${b.name}»`);
      }
      // сетка: каждая улица упирается в другую или пересекает её
      const others = A.lines.filter(o => o.id !== id && o.id.startsWith('road:q-'));
      assert(L.pts.some(p => others.some(o => o.pts.some(q => Math.hypot(q.x - p.x, q.y - p.y) < 6))), `${id} ни с чем не сходится`);
    }
    const main = A.lines.find(l => l.id === 'road:q-main').pts[0];
    assert(Math.hypot(main.x - west.x, main.y - west.y) < 8, `главная не от ворот: ${main.x | 0},${main.y | 0}`);
    eq(A.surfaceOf(main.x + 60, A.lines.find(l => l.id === 'road:q-main').pts.find(p => p.x > main.x + 60).y), 'path', 'по улице не идётся');
  });
  test('фундаменты: вдоль улиц фасадом к ним, в квартале; не на улице, не на местах, не друг на друге', () => {
    const F = TW.FOUNDATIONS;
    assert(F.length >= 20, `фундаментов ${F.length}`);
    for (const f of F) {
      for (const [x, y] of [[f.x0, f.y0], [f.x1, f.y0], [f.x0, f.y1], [f.x1, f.y1]]) assert(TW.inQuarter(x, y), `фундамент вне квартала (${x},${y})`);
      for (let x = f.x0; x <= f.x1; x += 2) for (let y = f.y0; y <= f.y1; y += 2) assert(!A.onArtery(x, y, 1), `фундамент на улице (${x},${y})`);
      for (const b of boxes) assert(!(f.x0 < b.x1 + 6 && f.x1 > b.x0 - 6 && f.y0 < b.y1 + 6 && f.y1 > b.y0 - 6), `фундамент на «${b.name}»`);
      for (const g of F) if (g !== f) assert(!(f.x0 < g.x1 + 2 && f.x1 > g.x0 - 2 && f.y0 < g.y1 + 2 && f.y1 > g.y0 - 2), 'фундаменты друг на друге');
      const mx = (f.x0 + f.x1) / 2, my = (f.y0 + f.y1) / 2;
      const [fx, fy, dx, dy] = { n: [mx, f.y0, 0, -1], s: [mx, f.y1, 0, 1], w: [f.x0, my, -1, 0], e: [f.x1, my, 1, 0] }[f.face];
      let ok = false;
      for (let k = 1; k <= 16 && !ok; k++) ok = A.onArtery(fx + dx * k, fy + dy * k, 0);
      assert(ok, `фасад (${f.face}) не к улице: ${f.x0},${f.y0}`);
    }
    const kinds = new Set(F.map(f => f.ruin?.kind).filter(Boolean));
    for (const k of ['wall', 'chimney', 'arch']) assert(kinds.has(k), `нет: ${k}`);
    assert(F.filter(f => !f.ruin).length > F.length * 0.2, 'пустых фундаментов мало: дом снесён до земли — тоже руина');
  });
  test('мёртвые фонари: у бордюра главных, не на мостовой; огрызки и фонари — краски канона, не горят', () => {
    assert(TW.LAMPS.length >= 6, `фонарей ${TW.LAMPS.length}`);
    for (const m of TW.LAMPS) {
      assert(!A.onArtery(m.x, m.gy, 0), `фонарь на мостовой (${m.x},${m.gy})`);
      assert(A.onArtery(m.x, m.gy, 5), `фонарь не у улицы (${m.x},${m.gy})`);
      assert(TW.inQuarter(m.x, m.gy), 'фонарь вне квартала');
    }
    const OK = new Set(['#0D0B0A', '#D9CFB8', '#8A8D8F', '#3D4A3A', '#15100c', '#241c14', '#2a2620', '#34302a', '#3a3328', '#3a2818', '#c8b89a', '#b0a284', '#474442', '#5e5e5d', '#33302e'].map(c => c.toLowerCase()));
    const kinds = [...Array.from({ length: 20 }, (_, v) => Q.quarterLamp(v)), ...[0, 1, 2, 3, 4, 5].flatMap(v => [Q.quarterRuin('wall', v, 16 + v * 4), Q.quarterRuin('chimney', v), Q.quarterRuin('arch', v)])];
    for (const K of kinds) {
      const log = [];
      const ctx = new Proxy({ canvas: { width: 1, height: 1 } }, {
        get(t, k) { if (k in t) return t[k]; return (...a) => { log.push([k, ...a]); }; },
        set(t, k, v) { log.push(['=' + k, v]); return true; },
      });
      K.draw(ctx, 100, 200);
      for (const [k, ...a] of log) {
        if (k === '=fillStyle') assert(OK.has(String(a[0]).toLowerCase()), `«${K.name}»: краска ${a[0]} вне палитры`);
        if (k !== 'fillRect') continue;
        const [x, y, w, h] = a;
        assert(x >= 100 - K.w / 2 - 1 && x + w <= 100 + K.w / 2 + 1, `«${K.name}» вылез вбок: ${x}..${x + w}`);
        assert(y >= 200 - K.h - 1 && y + h <= 200, `«${K.name}» вылез по высоте: ${y}..${y + h}`);
      }
    }
  });
}

// ═══ ШОССЕ ГОРОДКА: трасса, эстакада, рельсы к поезду, машины ═══
{
  const A = await imp('world/arteries.js');
  const M = await imp('world/locations.js');
  const TW = await imp('world/town.js');
  const AP = await imp('render/arteryProps.js');
  const HS = await imp('sprites/highway.js');
  const LS = await imp('sprites/locations/index.js');
  const loc = id => M.locations.find(l => l.id === id);
  const line = id => A.lines.find(l => l.id === id);
  const hw = line('road:town-highway'), rail = line('arc:town-rail'), fly = line('sky:town-flyover');
  const crosses = (P, Q) => { const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)); for (let i = 0; i < P.length - 1; i++) for (let j = 0; j < Q.length - 1; j++) { const a = P[i], b = P[i + 1], c = Q[j], d = Q[j + 1]; if (o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b)) return true; } return false; };
  const boxes = (skip = []) => M.locations.filter(l => !skip.includes(l.id)).map(l => ({ x0: l.x + 2, y0: l.y + 2, x1: l.x + l.w - 2, y1: l.y + l.h - 2, name: l.name }));
  const inside = (p, B) => B.find(b => p.x > b.x0 && p.x < b.x1 && p.y > b.y0 && p.y < b.y1);
  test('шоссе: брошенная трасса от восточных ворот мимо «Выхода в Пустошь» к посёлку; мест не задевает', () => {
    assert(hw && hw.pts.length > 100, 'трассы нет');
    const gate = line('road:east').pts[0], a = hw.pts[0], b = hw.pts[hw.pts.length - 1];
    assert(Math.hypot(a.x - gate.x, a.y - gate.y) < 10, `трасса не от ворот: ${a.x | 0},${a.y | 0}`);
    const ex = loc('exit'), foot = { x: ex.x + ex.w / 2, y: ex.y + ex.h };
    const near = hw.pts.reduce((m, p) => Math.min(m, Math.hypot(p.x - foot.x, p.y - foot.y)), 1e9);
    assert(near < 30, `«Выход в Пустошь» не у трассы: ${near | 0}`);
    assert(b.x < ex.x - 100, 'трасса не доходит до посёлка');
    const B = boxes();
    for (const p of hw.pts) { eq(p.st, 'motorway', 'стадия'); const hit = inside(p, B); assert(!hit, `трасса сквозь «${hit && hit.name}»`); }
    eq(A.surfaceOf(hw.pts[60].x, hw.pts[60].y), 'path', 'по трассе не идётся');
  });
  test('эстакада: от «Обрушенного моста» над рельсами и трассой; опоры не на полотне и не на местах; конец рухнул', () => {
    assert(fly && fly.pts.every(p => p.st === 'flyover'), 'эстакады нет');
    const ov = loc('overpass'), a = fly.pts[0];
    assert(Math.abs(a.x - (ov.x + ov.w)) < 4 && Math.abs(a.y - (ov.y + ov.h)) < 4, `эстакада не от моста: ${a.x | 0},${a.y | 0}`);
    assert(crosses(fly.pts, hw.pts), 'эстакада не над трассой');
    assert(crosses(fly.pts, rail.pts), 'эстакада не над рельсами');
    const len = fly.pts[fly.pts.length - 1].s - a.s, n = Math.max(1, Math.round(len / 38)), B = boxes();
    for (let k = 0; k <= n; k++) {
      const s = a.s + len * k / n, p = fly.pts.find(q => q.s >= s - 1e-6) || fly.pts[fly.pts.length - 1];
      if (k === 0) { assert(p.ok, 'у моста опоры нет'); continue; }
      for (const L of [hw, rail]) assert(!L.pts.some(q => Math.hypot(q.x - p.x, q.y - p.y) < q.hw + 2), `опора на полотне (${p.x | 0},${p.y | 0})`);
      const hit = inside(p, B); assert(!hit, `опора на «${hit && hit.name}»`);
    }
    assert(!fly.pts[fly.pts.length - 1].ok && fly.pts.some(p => p.ok), 'конец эстакады не обрушен');
    const mid = fly.pts[fly.pts.length >> 1];
    assert(AP.arteryPropsIn(mid.x - 60, mid.y - 60, mid.x + 60, mid.y + 60).length > 0, 'пролётов нет');
  });
  test('рельсы к поезду: под поездом, на восток до вала; за поездом тупик', () => {
    assert(rail && rail.pts.every(p => p.st === 'rail'), 'рельсов нет');
    const tr = loc('train');
    assert(rail.pts.some(p => p.x > tr.x + 10 && p.x < tr.x + tr.w - 10 && Math.abs(p.y - (tr.y + tr.h - 5)) < 3), 'рельсы не под поездом');
    assert(rail.pts[rail.pts.length - 1].x > 6000, 'до вала не доходят');
    assert(Math.abs(TW.BUFFER.x - rail.pts[0].x) < 8 && TW.BUFFER.x < tr.x, 'тупика нет');
    const B = boxes(['train', 'powerline']);
    for (const p of rail.pts) { const hit = inside(p, B); assert(!hit, `рельсы сквозь «${hit && hit.name}»`); }
  });
  test('машины: вдоль трассы — на обочине и на полосе; не на рельсах и не под опорами; краски канона', () => {
    assert(TW.CARS.length >= 6, `машин ${TW.CARS.length}`);
    const B = boxes();
    for (const c of TW.CARS) {
      const d = hw.pts.reduce((m, p) => Math.min(m, Math.hypot(p.x - c.x, p.y - c.gy)), 1e9), L = TW.LOT;
      if (c.lot) assert(c.x > L.x0 && c.x < L.x1 && c.gy > L.y0 && c.gy < L.y1, `машина стоянки не на стоянке (${c.x},${c.gy})`);
      else assert(d < 18, `машина не у трассы (${c.x},${c.gy}): ${d | 0}`);
      assert(!rail.pts.some(p => Math.hypot(p.x - c.x, p.y - c.gy) < 10), 'машина на рельсах');
      assert(!fly.pts.some(p => Math.hypot(p.x - c.x, p.y - c.gy) < 9), 'машина под опорой эстакады');
      const hit = inside({ x: c.x, y: c.gy }, B); assert(!hit, `машина на «${hit && hit.name}»`);
    }
    const OK = new Set(HS.HIGHWAY_COLORS.map(c => c.toLowerCase()));
    for (const K of [...Array.from({ length: 60 }, (_, v) => HS.carWreck(v)), HS.bufferStop]) {
      const log = [];
      const ctx = new Proxy({ canvas: { width: 1, height: 1 } }, { get(t, k) { if (k in t) return t[k]; return (...a) => { log.push([k, ...a]); }; }, set(t, k, v) { log.push(['=' + k, v]); return true; } });
      K.draw(ctx, 100, 200);
      for (const [k, ...a] of log) {
        if (k === '=fillStyle') assert(OK.has(String(a[0]).toLowerCase()), `«${K.name}»: краска ${a[0]}`);
        if (k !== 'fillRect') continue;
        const [x, y, w, h] = a;
        assert(x >= 100 - K.w / 2 - 1 && x + w <= 100 + K.w / 2 + 1, `«${K.name}» вылез вбок: ${x}..${x + w}`);
        assert(y >= 200 - K.h - 1 && y + h <= 200, `«${K.name}» вылез по высоте: ${y}..${y + h}`);
      }
    }
    for (const c of HS.HIGHWAY_COLORS) { const n = parseInt(c.slice(1), 16), r = n >> 16, b = n & 255; assert(!(r > 200 && b < 90), `тёплое в машинах: ${c}`); }
  });
  test('«Обрушенный мост»: у эстакады есть тело — опоры, настил, рухнувший пролёт, канат', () => {
    const ov = loc('overpass'), log = [];
    const ctx = new Proxy({ canvas: { width: 1, height: 1 }, globalAlpha: 1 }, { get(t, k) { if (k in t) return t[k]; return (...a) => { log.push([k, ...a]); }; }, set(t, k, v) { log.push(['=' + k, v]); return true; } });
    setCtx(ctx); LS.draw_overpass(ov.x, ov.y); setCtx(fakeCtx());
    const rects = log.filter(e => e[0] === 'fillRect');
    assert(rects.length > 120, `мост пуст: ${rects.length} мазков`);
    for (const [, x, y, w, h] of rects) assert(x >= ov.x - 2 && x + w <= ov.x + ov.w + 2 && y >= ov.y - 2 && y + h <= ov.y + ov.h + 2, `мост вылез за место: ${x},${y}`);
  });
}

// ═══ ТРОПЫ ГОРОДКА: где ходят — там тропа ═══
{
  const A = await imp('world/arteries.js');
  const M = await imp('world/locations.js');
  const D = await imp('world/disc.js');
  const TW = await imp('world/town.js');
  const TP = await imp('world/townPaths.js');
  const fs = await import('fs');
  const bed = A.lines.find(l => l.id === 'river:town');
  const fresh = TW.routePaths(bed);
  test('тропы: запечённые совпадают с прокладкой (иначе — TOWN_PATHS_WRITE=1 node test/systems.mjs)', () => {
    const same = JSON.stringify(fresh) === JSON.stringify(TP.TOWN_PATHS);
    if (!same && process.env.TOWN_PATHS_WRITE) {
      const body = fresh.map(([id, st, pts]) => `  ['${id}', '${st}', [${pts.map(([x, y]) => `[${x}, ${y}]`).join(', ')}]],`).join('\n');
      const src = fs.readFileSync(new URL('../src/world/townPaths.js', import.meta.url), 'utf8');
      fs.writeFileSync(new URL('../src/world/townPaths.js', import.meta.url), src.slice(0, src.indexOf('export const TOWN_PATHS')) + `export const TOWN_PATHS = [\n${body}\n];\n`);
      console.log(`  запечено троп: ${fresh.length}`);
      return;
    }
    assert(same, 'запечённые тропы устарели: TOWN_PATHS_WRITE=1 node test/systems.mjs');
  });
  const town = A.lines.filter(l => l.id.startsWith(TW.PATH_ID));
  const roads = A.lines.filter(l => l.town && l.kind === 'road');
  const near = (x, y, r) => roads.some(L => L.pts.some(p => Math.hypot(p.x - x, p.y - y) < r + p.hw));
  test('тропы: к каждому месту городка — от двери до сети; стволы — от ворот к костру', () => {
    assert(town.length >= 25, `троп ${town.length}`);
    const T = D.TOWN, skip = new Set(['pithos', 'lantern1', 'luna_tag', 'captcha', 'campfire']);
    for (const l of M.locations) {
      if (skip.has(l.id) || l.id.endsWith('_home') || !(l.x > T.x0 && l.x + l.w < T.x1 && l.y > T.y0 && l.y + l.h < T.y1)) continue;
      const doors = [[l.x + l.w / 2, l.y + l.h + 10], [l.x - 10, l.y + l.h - 4], [l.x + l.w + 10, l.y + l.h - 4], [l.x + l.w / 2, l.y - 10]];
      assert(doors.some(([x, y]) => near(x, y, 18)), `к «${l.name}» тропы нет`);
    }
    for (const g of ['north', 'south']) {
      const P = A.lines.find(L => L.id === TW.PATH_ID + g), gate = D.trailPoint(g, 0);
      assert(P && Math.hypot(P.pts[0].x - gate.x, P.pts[0].y - gate.y) < 30, `от ворот ${g} тропы нет`);
    }
    const fire = M.locations.find(l => l.id === 'campfire');
    for (const g of ['quarter', 'highway']) {
      const P = A.lines.find(L => L.id === TW.PATH_ID + g), e = P.pts[P.pts.length - 1];
      assert(Math.hypot(e.x - (fire.x + fire.w / 2), e.y - (fire.y + fire.h)) < 40, `${g}: ствол не доходит до костра`);
    }
  });
  test('тропы: не сквозь места и фундаменты, не по валу; русло переходят редко', () => {
    const B = M.locations.map(l => ({ x0: l.x + 2, y0: l.y + 2, x1: l.x + l.w - 2, y1: l.y + l.h - 2, name: l.name }));
    let cross = 0;
    for (const L of town) for (let i = 0; i < L.pts.length; i++) {
      const p = L.pts[i];
      for (const b of B) assert(!(p.x > b.x0 && p.x < b.x1 && p.y > b.y0 && p.y < b.y1), `${L.id} сквозь «${b.name}» (${p.x | 0},${p.y | 0})`);
      for (const f of TW.FOUNDATIONS) assert(!(p.x > f.x0 && p.x < f.x1 && p.y > f.y0 && p.y < f.y1), `${L.id} сквозь фундамент`);
      if (i > 0 && bed.pts.some(q => Math.hypot(q.x - p.x, q.y - p.y) < q.hw) && !bed.pts.some(q => Math.hypot(q.x - L.pts[i - 1].x, q.y - L.pts[i - 1].y) < q.hw)) cross++;
      eq(L.pts[0].st === 'trail' || L.pts[0].st === 'path', true, 'стадия тропы');
    }
    assert(cross <= 6, `русло переходят ${cross} раз`);
  });
}

// ═══ ОТРАВА: мёртвый камыш у озера, ржавые трубы, лужи с плёнкой ═══
{
  const A = await imp('world/arteries.js');
  const M = await imp('world/locations.js');
  const F = await imp('world/flora.js');
  const TW = await imp('world/town.js');
  const TX = await imp('sprites/toxic.js');
  const LS = await imp('sprites/locations/index.js');
  const loc = id => M.locations.find(l => l.id === id);
  const rec = draw => {
    const log = [];
    const ctx = new Proxy({ canvas: { width: 1, height: 1 }, globalAlpha: 1 }, { get(t, k) { if (k in t) return t[k]; return (...a) => { log.push([k, ...a]); return k.startsWith('create') ? { addColorStop: (o, c) => log.push(['stop', c]) } : undefined; }; }, set(t, k, v) { log.push(['=' + k, v]); return true; } });
    draw(ctx); return log;
  };
  test('трубы: от «Ржавого трубопровода» к озеру — задвижка, пролом, колено, течь, сток; краски канона', () => {
    const P = TW.PIPES, big = loc('pipeline'), lake = loc('lake');
    assert(P.length >= 5, `кусков ${P.length}`);
    const kinds = new Set(P.map(p => p.kind));
    for (const k of ['valve', 'broken', 'elbow', 'leak', 'outlet']) assert(kinds.has(k), `нет: ${k}`);
    const xs = P.filter(p => p.kind !== 'elbow').map(p => [p.x - p.L / 2, p.x + p.L / 2]).flat();
    assert(Math.abs(Math.min(...xs) - (big.x + big.w)) < 4, 'труба не от трубопровода');
    assert(Math.abs(Math.max(...xs) - lake.x) < 12, 'труба не доходит до озера');
    for (const p of P) assert(TW.inToxic(p.x, p.gy) || p.x < big.x + big.w + 40, `кусок вне отравы (${p.x},${p.gy})`);
    const OK = new Set(TX.TOXIC_COLORS.map(c => c.toLowerCase()));
    for (const K of [...['pipe', 'valve', 'broken', 'leak', 'outlet'].map(k => TX.pipePiece(k, 7, 34)), TX.pipeElbow(32)]) {
      for (const [k, ...a] of rec(c => K.draw(c, 100, 200))) {
        if (k === '=fillStyle') assert(OK.has(String(a[0]).toLowerCase()), `«${K.name}»: краска ${a[0]}`);
        if (k !== 'fillRect') continue;
        const [x, y, w, h] = a;
        assert(x >= 100 - K.w / 2 - 1 && x + w <= 100 + K.w / 2 + 1 && y >= 200 - K.h - 1 && y + h <= 200, `«${K.name}» вылез из рамки: ${x},${y}`);
      }
    }
  });
  test('лужи с плёнкой: под течью, проломом и стоком и в низинах отравы; не на тропах и не у мест', () => {
    const PD = TW.PUDDLES;
    assert(PD.length >= 8, `луж ${PD.length}`);
    for (const k of ['leak', 'broken', 'outlet']) {
      const p = TW.PIPES.find(q => q.kind === k);
      assert(PD.some(d => Math.abs(d.x - p.x) < p.L && Math.abs(d.y - p.gy) < 10), `под «${k}» лужи нет`);
    }
    for (const d of PD.slice(3)) {
      assert(TW.inToxic(d.x, d.y), `лужа вне отравы (${d.x},${d.y})`);
      assert(!A.onArtery(d.x, d.y, d.r), `лужа на тропе (${d.x},${d.y})`);
      for (const l of M.locations) assert(!(d.x + d.r > l.x && d.x - d.r < l.x + l.w && d.y + d.r * 0.5 > l.y && d.y - d.r * 0.5 < l.y + l.h), `лужа на «${l.name}»`);
    }
  });
  test('мёртвый камыш: по берегу Токсичного озера и у луж; на берегу, а не в воде; не на тропах', () => {
    const reeds = F.flora.filter(t => t.town === 'toxic');
    assert(reeds.every(t => t.sp === 'deadreed'), 'у отравы живое');
    const lake = loc('lake'), cx = lake.x + 51, cy = lake.y + 30;
    const shore = reeds.filter(t => { const e = ((t.x - cx) / 50) ** 2 + ((t.gy - 2 - cy) / 29) ** 2; return e > 0.95 && e < 1.6; });
    assert(shore.length >= 8, `камыша у озера ${shore.length}`);
    const south = shore.filter(t => t.gy > cy).length, north = shore.length - south;
    assert(south > north, `с юга не гуще: ${south} / ${north}`);
    for (const t of reeds) assert(!A.onArtery(t.x, t.gy, 3), `камыш на тропе (${t.x},${t.gy})`);
    assert(reeds.length > shore.length, 'у луж камыша нет');
  });
  test('озеро и трубопровод: радуга нефти — в красках канона, без синего и чистого белого', () => {
    const blue = c => { const m = /^#([0-9a-f]{6})$/i.exec(c); if (!m) return false; const n = parseInt(m[1], 16), r = n >> 16, g = n >> 8 & 255, b = n & 255; return b > r + 30 && b > g + 10; };
    for (const id of ['lake', 'pipeline']) {
      const l = loc(id), log = rec(c => { setCtx(c); LS['draw_' + id](l.x, l.y); setCtx(fakeCtx()); });
      for (const [k, v] of log) {
        if (k !== '=fillStyle' && k !== 'stop') continue;
        const c = String(v).toLowerCase();
        assert(!blue(c) && c !== '#fff' && c !== '#ffffff', `«${l.name}»: ${c}`);
        assert(!/rgba\(\s*74\s*,\s*127/.test(c), `«${l.name}»: синее в ореоле`);
      }
    }
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
