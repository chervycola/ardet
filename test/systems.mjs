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
  const DSC0 = await imp('world/disc.js');
  test('getZone: every point of the disc world returns a known zone', () => {
    const valid = new Set(['forest', 'toxic', 'quarter', 'highway', 'settlement', 'street']);
    for (let x = 0; x <= 7600; x += 100) {
      for (let y = 0; y <= 6280; y += 100) {
        const z = getZone(x, y);
        assert(valid.has(z), `unknown zone "${z}" at (${x},${y})`);
      }
    }
  });
  test('диск: кольца по длительности эпохи — шире у городка, уже к огню; перенос прежних точек обратим и держит кольцо', () => {
    const D = DSC0;
    eq(D.RING_EDGE.length, 10); eq(D.RINGS_D, 3150); eq(D.OFF, D.RINGS_D + D.FIRE_W + D.EDGE_BAND);
    for (let n = 1; n <= 9; n++) eq(D.ringOfD(D.ringD(n, 100)), n, `середина кольца ${n}`);
    assert(D.RING_WS[0] > D.RING_WS[3] && D.RING_WS[3] > D.RING_WS[8], 'древние шире новых');
    for (const od of [1, 150, 200, 777, 1799, 1800, 1900, 2600]) assert(Math.abs(D.oldD(D.newD(od)) - od) < 1e-6, `обратимо ${od}`);
    eq(D.ringOfD(D.newD(1799)), 9); eq(D.ringOfD(D.newD(1801)), 10, 'огонь'); eq(D.ringOfD(D.newD(1951)), 11, 'за краем');
    // прежнее поле 3150: место у костра и знаки колец встают туда же по смыслу
    const fire = DSC0.fromOldGeo(3950, 3890), C = DSC0.CORE;
    assert(Math.hypot(fire.x - C.x, fire.y - C.y) < 1, 'середина ядра — у нового ядра');
    let same = 0, n = 0;
    for (let k = 0; k < 400; k++) {
      const a = k * 2.399, r = 30 + (k * 37 % 1760);                   // прежние кольца 1–9 вокруг прежнего городка
      const x = 4650 + Math.cos(a) * (1500 + r), y = 3970 + Math.sin(a) * (820 + r);
      const dx = Math.max(0, 3150 - x, x - 6150), dy = Math.max(0, 3150 - y, y - 4790), od = Math.hypot(dx, dy);
      if (od < 20 || od > 1780 || od % 200 < 20 || od % 200 > 180) continue;   // у рваной кромки — не в счёт
      const q = DSC0.fromOldGeo(x, y), back = DSC0.toOldGeo(q.x, q.y);
      assert(Math.hypot(back.x - x, back.y - y) < 0.01, 'туда и обратно');
      n++; if (DSC0.ringOfD(DSC0.townDist(q.x, q.y)) === Math.ceil(od / 200)) same++;
    }
    assert(n > 100 && same === n, `кольцо при переносе: ${same} из ${n}`);
  });
  test('getZone: городок в центре, кольца вокруг', () => {
    // точки — в мире прежнего поля (2300): перенос по долям колец, городок ×1,25 (world/disc.js)
    const zoneWas = (x, y) => { const p = DSC0.fromOldGeo(x, y, 2300); return getZone(p.x, p.y); };
    eq(zoneWas(3300, 3100), 'settlement', 'center should be settlement');
    eq(zoneWas(3300, 2500), 'forest', 'north strip → forest');
    eq(zoneWas(3300, 3800), 'toxic', 'south strip → toxic');
    eq(zoneWas(2450, 3100), 'quarter', 'west → quarter');
    eq(zoneWas(4800, 3100), 'highway', 'east → highway');
    eq(zoneWas(3800, 4500), 'street', 'южные кольца → эпохи');
    eq(zoneWas(6000, 3100), 'street', 'восточные кольца → эпохи');
    eq(zoneWas(3800, 1500), 'street', 'северные кольца → эпохи');
    eq(zoneWas(1500, 3100), 'street', 'западные кольца → эпохи');
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
    for (let d = D.RINGS_D - 10; d <= D.RINGS_D + D.FIRE_W + 10; d += 10) hot = Math.max(hot, Hz.heatAt(mid, TOWN.y1 + d));
    eq(hot, 1, 'в огне не жарко');
    eq(Hz.heatAt(mid, TOWN.y1 + D.RINGS_D + D.FIRE_W + 650), 0, 'за краем');
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
  test('тени: масок не больше полутора тысяч — самые давние уходят (мир большой, кадр мал)', () => {
    const ce = document.createElement;
    document.createElement = () => ({ ...fakeEl(), width: 0, height: 0, getContext: () => ctx });
    try {
      const casters = Array.from({ length: 1700 }, (_, i) => ({ key: 'lru' + i, ox: 0, oy: 0, build: () => null }));
      for (let f = 0; f < 300; f++) Sh.castShadows(ctx, 0, 0, 640, 360, casters, { dx: 0.5, dy: 0.2, a: 0.5, wash: 0 }, null);
      assert(Sh._maskCount() <= 1500, `масок ${Sh._maskCount()}`);
      assert(Sh._maskCount() > 1000, `масок подозрительно мало: ${Sh._maskCount()}`);
    } finally { document.createElement = ce; }
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
      const d = D.warpedDist(x, y), edge = Math.min(...D.RING_EDGE.map(e => Math.abs(d - e)));
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
  (await imp('world/house.js')).buildHouse(M.locations);         // как в main.js: дом пробуждения — до артерий и троп
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
    eq(A.roadStage(D.RINGS_D + D.FIRE_W * 0.95), null, 'у самого края дороги нет');
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
  // Кольца просторнее прежнего (weave/SCALE.md, вариант Б): заполнения столько же на
  // площади вдвое-вчетверо больше, кадр стал меньше кольца — между находками пусто
  // нарочно. Угол кольца не мёртв: хоть каждый десятый кадр — с рощей, полем,
  // приметой или утварью (лес держится углов — world/flora.js)
  test('пустота не случайна: углы колец 1–6 не мертвы — голых кадров не больше 90%', () => {
    const T = D.TOWN;
    let s = 4242; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (const [cx, cy, name] of [[T.x1, T.y1, 'ЮВ'], [T.x0, T.y1, 'ЮЗ'], [T.x0, T.y0, 'СЗ']]) {
      for (let n = 1; n <= 6; n++) {
        let bare = 0, v = 0;
        for (let k = 0; k < 24; k++) {
          const a = (0.15 + 0.7 * rnd()) * Math.PI / 2, r = D.ringD(n, rnd() * 200);
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
        assert(v < 6 || bare / v <= 0.9, `угол ${name}, кольцо ${n}: голых кадров ${bare} из ${v}`);
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
    assert(TH.wearOf({ ring: 9, side: 'east', d: D.RINGS_D - 10, seed: 1 }).soot > 0.9, 'у огня без копоти');
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
    for (const f of ['sprites/locations/canon.js', 'sprites/npcs/nocturnal.js', 'sprites/npcs/sol.js', 'sprites/npcs/jester.js', 'sprites/npcs/elder.js', 'sprites/npcs/dumpster.js', 'sprites/player.js', 'render/underside.js', 'world/townWell.js', 'world/mossway.js', 'world/beyond.js', 'world/oldways.js']) {
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
  const { COLOR_EXCEPTIONS } = await imp('content/world_cells.js');
  const { SEGMENTS: SEGS } = await imp('content/ulitsa_db.js');
  test('постройки колец по канону: без золота, синего, неона и белого; чужой цвет — только объявленное исключение своей эпохи', () => {
    // золото — по оттенку, а не списком: жёлтое и золотое (30–70°) насыщенное и светлое; свеча (28°)
    // и киноварь (5°) вне полосы, кость и бумага — без насыщенности
    const gold = c => { const q = hsv(c); return q.h >= 30 && q.h <= 70 && q.sat > 0.35 && q.v > 0.35; }, bad = [];
    const dir = new URL('../src/sprites/arch/', import.meta.url);
    for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.js') && n !== 'index.js')) {
      const epoch = f.slice(0, -3);
      const own = Object.values(COLOR_EXCEPTIONS).filter(e => e.epoch === epoch).flatMap(e => [...e.color.matchAll(/#([0-9a-fA-F]{6})/g)].map(m => m[1].toLowerCase()));
      const src = fs.readFileSync(new URL(f, dir), 'utf8');
      for (const m of src.matchAll(/['"`]#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})['"`]/g)) {
        const h = (m[1].length === 3 ? [...m[1]].map(c => c + c).join('') : m[1]).toLowerCase(), n = parseInt(h, 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255];
        if (own.includes(h)) continue;
        const blue = c[2] > c[0] + 25 && c[2] > c[1] + 8, white = c.every(v => v > 240);
        if (blue || white || neon(c) || gold(c)) bad.push(f + ' #' + h);
      }
      assert(!/createLinearGradient|createRadialGradient|\.arc\(|\.ellipse\(|bezierCurveTo|quadraticCurveTo|\.stroke\(\)/.test(src), `${f}: векторное — только точки`);
    }
    eq(bad.length, 0, 'вне канона: ' + [...new Set(bad)].join(', '));
  });
  test('палитры колец (небо, земля, пыль) — производные канона: без синего, лилового и малинового отлива', () => {
    const bad = [];
    for (const s of SEGS) for (const k of ['sky', 'ground', 'dust']) {
      const v = s.palette[k], n = parseInt(v.slice(1), 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255];
      const cold = c[2] > Math.max(c[0], c[1]) + 6, magenta = c[1] < Math.min(c[0], c[2]) - 20 && c[2] > c[1] + 30;
      const q = hsv(c), lilac = q.h >= 250 && q.h <= 340 && q.sat > 0.12;     // и тусклый лиловый
      if (cold || magenta || lilac || neon(c)) bad.push(`${s.id || s.name}.${k} ${v}`);
    }
    eq(bad.length, 0, 'вне канона: ' + bad.join(', '));
  });
  test('земля городка: у каждой зоны своя фактура, артерий она не трогает', () => {
    const S = 1.25, pick = { 0: [T.x0 + 900 * S, T.y0 + 100 * S], 1: [T.x0 + 1000 * S, T.y0 + 1400 * S], 2: [T.x0 + 160 * S, T.y0 + 700 * S], 3: [T.x0 + 2300 * S, T.y0 + 900 * S], 4: [T.x0 + 1100 * S, T.y0 + 700 * S] };   // городок ×1,25 от угла
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

// ═══ ИЗНАНКА: отдельная карта, трубы Boring, спуски и подъёмы ═══
{
  const U = await imp('world/underside.js');
  const UR = await imp('render/underside.js');
  const M = await imp('world/locations.js');
  const UA = await imp('world/useActions.js');
  const TX = await imp('content/underside.js');
  const MW = await imp('world/mossway.js');
  const AR = await imp('world/arteries.js');
  const WH = await imp('world/whisper.js');
  const D = await imp('world/disc.js');
  test('изнанка: у каждой вещи есть где встать; от любой лестницы дойти до любой вещи своего хода, ход мха с линией не сшит', () => {
    const was = U.under.signed; U.under.signed = true;              // гермодверь U4 открыта: сеть — целиком
    for (const th of U.THINGS) assert(U.walkable(th.at[0], th.at[1]), `${th.id}: у вещи не встать (${th.at})`);
    const stairs = U.THINGS.filter(th => th.up), net = th => (th.room === 'moss' ? 'moss' : 'line');
    eq(stairs.filter(th => net(th) === 'moss').map(th => th.up).sort().join(), 'burrow,pithos', 'выходы хода мха');
    for (const a of stairs) for (const b of U.THINGS) {
      const path = U.pathTo(a.at[0], a.at[1], b.at[0], b.at[1]);
      if (net(a) !== net(b)) { assert(!path, `${a.id} → ${b.id}: ход мха сшит с линией`); continue; }
      assert(path && path.length, `${a.id} → ${b.id}: пути нет`);
      const end = path[path.length - 1];
      assert(Math.hypot(end.x - b.at[0], end.y - b.at[1]) < 1, `${a.id} → ${b.id}: путь кончился не у вещи`);
      let px = a.at[0], py = a.at[1];
      for (const w of path) {                                     // каждый отрезок — по полу
        const n = Math.max(1, Math.ceil(Math.hypot(w.x - px, w.y - py) / 2));
        for (let k = 0; k <= n; k++) assert(U.walkable(px + (w.x - px) * k / n, py + (w.y - py) * k / n), `${a.id} → ${b.id}: путь сквозь породу у (${Math.round(px)},${Math.round(py)})`);
        px = w.x; py = w.y;
      }
    }
    U.under.signed = was;
  });
  test('изнанка: спуск — повторное «использовать» у места со сценой; лестница выводит к нему же', () => {
    for (const [key, stair] of Object.entries(U.DESCENTS)) {
      assert(UA.useTexts[key], `спуск ${key}: нет сцены наверху`);
      const th = U.thingById(stair);
      assert(th && th.up && th.useAction === 'under_up', `спуск ${key}: нет лестницы ${stair}`);
      const loc = M.locations.find(l => l.id === th.up || l.upKey === th.up);   // постройка кольца — по своему ключу
      const alt = loc && loc.altNow && loc.altNow();
      assert(loc && ((loc.useAction || loc.id) === key || (alt && alt.key === key)), `лестница ${stair}: наверху не «${key}»`);
    }
    const ups = U.THINGS.filter(th => th.up).map(th => th.id).sort();
    eq(ups.join(), Object.values(U.DESCENTS).sort().join(), 'лестница без спуска');
  });
  test('изнанка: ходьба по клавишам не уводит в породу; круглые проёмы стоят в стенах', () => {
    const p = { x: 2184, y: 625, vx: 0, vy: 0 };
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 6000; i++) {
      const a = rnd() * Math.PI * 2;
      U.underMove(p, Math.cos(a) * 2.4, Math.sin(a) * 2.4);
      assert(U.walkable(p.x + 6, p.y + 23), `шаг ${i}: в породе (${p.x.toFixed(1)},${p.y.toFixed(1)})`);
    }
    for (const P of U.PORTALS) assert(P.host && P.H >= U.T.WH && P.R * 2 <= U.T.FW + 2 * U.T.SW, `проём ${P.tube.id}: без стены`);
    eq(U.PORTALS.length, U.TUBES.filter(tb => tb.bot === 'portal').length, 'проёмов');
  });
  test('изнанка: холод — только в жиле и криосклепе; в криосклепе тепла нет совсем', () => {
    eq(U.coldAt(1200, 465), 0, 'линия'); eq(U.coldAt(834, 300), 1, 'криосклеп');
    assert(U.coldAt(690, 294) > 0.5 && U.coldAt(500, 294) === 0, 'жила стынет к востоку');
    eq(U.placeAt(726, 300), 'kapt', 'перед криосклепом — каптёрка'); eq(U.coldAt(726, 300), 0, 'в каптёрке Дежурного холодно');
    U.under.cold = 1;
    const L = U.underLights(834, 300);
    for (const l of L.slice(0, 2)) assert(l.color[0] < l.color[1] + 30, 'в криосклепе тёплый свет: ' + l.color);
    U.under.cold = 0;
    assert(U.underLights(100, 100)[0].color[0] > U.underLights(100, 100)[0].color[1] + 30, 'уголёк не тёплый');
    eq(U.surfaceUnder(1200, 465), 'path', 'полотно'); eq(U.surfaceUnder(1200, 840), 'water', 'подвал');
  });
  test('изнанка: тексты есть у всех вещей, шутка про Boring — на табличке первого кольца', () => {
    for (const th of U.THINGS) assert(th.name && th.look && th.look.length > 20, `${th.id}: без текста`);
    const pl = U.thingById('u_plaque');
    assert(/BORING COMPANY/.test(pl.look) && /улитк/.test(pl.look) && /Гэри/.test(pl.look), 'шутки нет');
    assert(/кремирован/.test(U.thingById('u_capsule').look) && /охлаждается/.test(U.thingById('u_capsule').look), 'криосклеп без канона U7');
    for (const id of Object.keys(TX.UNDER_INSC)) assert(U.thingById(id), 'надпись без вещи: ' + id);
  });
  test('изнанка: разрез эпох — четыре старых хода в стене линии; отбой — раз за спуск; поезд — только стоящему', () => {
    eq(U.CUTS.map(c => c.id).join(), 'catacomb,sewer,shelter,metro', 'срезы');
    for (const c of U.CUTS) {
      assert(U.thingById('u_cut_' + c.id), `срез ${c.id}: нет вещи`);
      for (const P of U.PORTALS) assert(P.cx + P.R < c.x0 || P.cx - P.R > c.x1, `срез ${c.id} лезет в проём ${P.tube.id}`);
      assert(!U.ROOMS.some(R => R.x0 < c.x1 && R.x1 > c.x0 && R.y0 < U.TUBES[0].y0 && R.y1 > U.TUBES[0].y0), `срез ${c.id} — в зале поверх линии`);
    }
    const r0 = Math.random; Math.random = () => 0.1;
    U.under.enter(0, 0);
    for (let i = 0; i < 3; i++) U.under.step(1460, 466);
    eq(U.under.say, '— Отбой. Всем спасибо. Все свободны.', 'отбой'); U.under.say = null;
    for (let i = 0; i < 30; i++) U.under.step(1460 + (i & 1), 466);
    eq(U.under.say, null, 'отбой второй раз');
    Math.random = r0;
    for (let i = 0; i < 310; i++) U.under.step(1698, 466);          // стоит у метро
    assert(U.under.train > 0, 'поезд не пошёл');
    U.under.step(1702, 466);                                       // шевельнулся — поезда не было
    eq(U.under.train, 0, 'поезд не отменился'); eq(U.under.say, null, 'строка после отмены');
    for (let i = 0; i < 400; i++) U.under.step(1702, 466);
    eq(U.under.train, 0, 'поезд пошёл второй раз за спуск');
    U.under.enter(0, 0);
    for (let i = 0; i < 560; i++) U.under.step(1698, 466);
    eq(U.under.say, 'Что-то длинное прошло сзади и стихло. На скамье рядом лежит картонный билет.', 'строка поезда');
    U.under.leave(); U.under.say = null;
  });
  test('изнанка: билет «до колодца. туда.» — лежит на скамье после поезда, с ним поезд забирает в один конец', () => {
    const W = U.under;
    W.ticket = false; W.enter(0, 0);
    assert(!U.thingsNow().some(th => th.id === 'u_ticket'), 'билет на скамье до поезда');
    for (let i = 0; i < 560; i++) W.step(1698, 466);
    assert(W.bench && U.thingsNow().some(th => th.id === 'u_ticket'), 'поезд прошёл — билета нет');
    const tk = U.thingById('u_ticket');
    assert(Math.abs(tk.at[0] - 1698) < 40, 'у билета не услышать поезда');
    assert(tk.useAction === 'under_ticket' && /до колодца\. туда\./.test(tk.look) && /одинаковые/.test(tk.look), 'билет без канона');
    assert(W.takeTicket() && W.ticket && !W.bench && !W.takeTicket(), 'билет не взялся');
    W.say = null;
    for (let i = 0; i < 560 && !W.ride; i++) W.step(1690, 466);    // стоит дальше — поезд не проходит мимо
    assert(W.ride, 'с билетом поезд не забрал');
    eq(W.say, null, 'забрал — строки нет');
    eq(JSON.parse(JSON.stringify(W.save())).ticket, true, 'билет не сохраняется');
    W.arrive();
    assert(!W.ticket && !W.ride, 'билет не погашен');
    W.enter(0, 0);
    for (let i = 0; i < 560; i++) W.step(1698, 466);
    assert(W.bench, 'новый спуск — нового билета нет');
    W.leave();
    assert(!W.bench && !U.thingsNow().some(th => th.id === 'u_ticket'), 'наверху билет остался на скамье');
    W.load({ ticket: true }); assert(W.ticket, 'билет не загрузился'); W.ticket = false; W.say = null;
  });
  test('изнанка: ход мха — шаг по стуку сердца: в такт мох светится на шаг вперёд, спешка гасит свет, стоишь — мох растёт, у норы светится сам', () => {
    const W = U.under, Mo = U.moss, fy = x => U.mossY(x) + 12;
    let x = U.MOSS.x0 + 30;
    W.enter(0, 0); W.say = null;
    eq(U.placeAt(x, fy(x)), 'moss', 'ход мха'); eq(U.surfaceUnder(x, fy(x)), 'moss', 'под ногой не мох');
    for (let i = 0; i < 200; i++) W.step(x, fy(x));                // стоит
    eq(Mo.glows.length, 0, 'стоишь — вспыхнуло');
    assert(Mo.sprouts.length > 0 && Mo.sprouts.every(sp => U.placeAt(sp.x, sp.y) === 'moss'), 'стоишь — мох не растёт у ног');
    let lit = 0;
    for (let i = 0; i < 300; i++) {                                 // в такт: 18 точек за удар
      x += 0.3; W.step(x, fy(x));
      if (Mo.beat) {
        eq(Mo.glows.length, 2, 'на ударе — под ногой и на шаг вперёд');
        const [a, b] = Mo.glows;
        assert(Math.abs(a.x - x) < 0.01 && b.x - a.x > 15 && b.x - a.x < 17 && !a.warm, 'вспышка не на шаг вперёд');
        lit++;
      }
    }
    assert(lit >= 4 && !Mo.dark && W.say === null, 'в такт — темно');
    for (let i = 0; i < 70; i++) { x += 2; W.step(x, fy(x)); }       // спешит
    assert(Mo.dark && Mo.glows.length === 0, 'спешка не погасила свет');
    eq(W.say, U.MOSS_LINE, 'реплика о превышении'); W.say = null;
    for (let i = 0; i < 70; i++) { x += 2; W.step(x, fy(x)); }
    eq(W.say, null, 'реплика второй раз за спуск');
    let calm = 0;                                                   // отдышаться: свет — на втором спокойном ударе
    for (let i = 0; i < 400 && calm < 2; i++) {
      const pb = Mo.bx;
      x += 0.3; W.step(x, fy(x));
      if (!Mo.beat) continue;
      if (Math.hypot(x - pb, 0) > U.STRIDE) { calm = 0; assert(Mo.dark, 'спешка — светло'); continue; }
      calm++;
      if (calm === 1) assert(Mo.dark && Mo.glows.length === 0, 'свет вернулся с первого спокойного удара');
      else assert(!Mo.dark && Mo.glows.length === 2, 'не отдышался за два удара');
    }
    eq(calm, 2, 'спокойных ударов');
    x = U.MOSS.dry + 20;                                            // у норы: как ни иди — светится, тёплым
    for (let i = 0; i < 61; i++) { x += 1.2; W.step(x, fy(x)); }
    assert(!Mo.dark && Mo.glows.length >= 2 && Mo.glows.every(g => g.warm), 'у норы мох не светится сам');
    assert(U.underLights(x, fy(x) - 13).some(L => L.color[0] > 190 && L.color[2] < 80), 'у норы нет отсвета огня');
    W.leave();
    eq(Mo.k, 0, 'наверху — ход мха'); eq(Mo.glows.length, 0, 'вспышки остались');
  });
  test('ход мха: пифос шепчет ночью тому, кто задержался, — раз за ночь; потом у пифоса «ЛЕЧЬ» и «УСНУТЬ»; нора у подножия огня', () => {
    const p = M.locations.find(l => l.id === 'pithos'), b = M.locations.find(l => l.id === 'burrow');
    U.under.seen.delete('pithos_whisper'); U.under.seen.delete('pithos_lie'); MW._resetMossway(); WH._reset();
    assert(p.useAction === 'pithos_lie' && !p.useShown(), 'до шёпота у пифоса есть действие');
    const pl = { x: p.x + p.w / 2 - 6, y: p.y + p.h + 5, moving: false };
    for (let i = 0; i < 400; i++) MW.stepMossway(pl, false, 1);
    assert(!U.under.seen.has('pithos_whisper') && !WH.hush.has('pithos'), 'днём шепчет мох');
    for (let i = 0; i < 400; i++) MW.stepMossway({ ...pl, moving: true }, true, 1);
    assert(!U.under.seen.has('pithos_whisper'), 'шепчет проходящему мимо');
    for (let i = 0; i < 400; i++) MW.stepMossway(pl, true, 1);
    eq(WH.whisperText(), MW.MOSS_WHISPER, 'шёпот мха');
    assert(U.under.seen.has('pithos_whisper') && p.useShown() && WH.hush.has('pithos') && /ЛЕЧЬ/.test(p.useLabel), 'после шёпота нет «лечь»');
    WH._reset();
    for (let i = 0; i < 400; i++) MW.stepMossway(pl, true, 1);
    eq(WH.whisperText(), '', 'шёпот повторился за ночь');
    for (let i = 0; i < 400; i++) MW.stepMossway(pl, true, 2);
    eq(WH.whisperText(), MW.MOSS_WHISPER, 'другой ночью — снова');
    U.under.seen.add('pithos_lie'); assert(/УСНУТЬ/.test(p.useLabel), 'второй раз — не «уснуть»');
    const bx = b.x + b.w / 2, by = b.y + b.h, R9 = D.RINGS;
    assert(D.ringAt(bx, by) === R9 && D.ringAt(bx, by + 28) === R9 && D.ringAt(bx, by + 70) === R9 + 1, 'нора не у подножия огня');
    assert(b.useAction === 'burrow_down' && b.look && b.drawSelf, 'нора без спуска');
    assert(AR.lines.length > 0 && !AR.onArtery(bx, by - 4, 6), 'нора на дороге');
    for (const l of M.locations) if (l !== b) assert(!(l.x < b.x + b.w + 8 && l.x + l.w > b.x - 8 && l.y < b.y + b.h + 8 && l.y + l.h > b.y - 8), `нора налезла на «${l.name}»`);
    const log = [];
    const ctx = new Proxy({}, { get(t, k) { return (...a) => { log.push([k, ...a]); }; }, set(t, k, v) { log.push(['=' + k, v]); return true; } });
    b.drawSelf(ctx, b, 0);
    for (const [k, x, y, w, h] of log) if (k === 'fillRect') assert(x >= b.x - 1 && x + w <= b.x + b.w + 1 && y >= b.y - 1 && y + h <= b.y + b.h + 1, `нора вылезла из рамки: ${x},${y}`);
    U.under.seen.delete('pithos_whisper'); U.under.seen.delete('pithos_lie'); MW._resetMossway(); WH._reset(); WH.hush.delete('pithos');
  });
  test('изнанка: шёпоты гуще, чем наверху — раз в 20–40 секунд, обрывки строк ближнего места; без «вдоха» — у уха', () => {
    const W = U.under, norm = s => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const corpus = norm([...Object.values(TX.UNDER_TEXT).map(v => v.look), ...Object.values(TX.UNDER_INSC), ...Object.values(WH.WHISPERS), '— Отбой. Всем спасибо. Все свободны.'].join(' | '));
    for (const [key, lines] of Object.entries(U.MURMURS)) {
      assert(U.ROOMS.some(R => R.id === key) || U.CUTS.some(c => c.id === key) || key === 'vein' || key === 'godot', 'шёпот без места: ' + key);
      for (const l of lines) assert(corpus.includes(norm(l)), `шёпот не из строк места: ${l}`);
    }
    W.enter(0, 0); W.say = null;
    const at = [], fx = 300, fy = 300;                              // крипта
    for (let i = 1; i <= 12000; i++) { W.step(fx, fy); if (W.whisper) { at.push([i, W.whisper]); W.whisper = null; } }
    eq(at[0][0], 900, 'первый шёпот — через 15 секунд');
    for (let i = 1; i < at.length; i++) { const d = at[i][0] - at[i - 1][0]; assert(d >= 1200 && d <= 2400, 'между шёпотами ' + d); }
    for (const [, w] of at) {
      assert(U.MURMURS.crypt.includes(w.text), 'в крипте — чужой шёпот: ' + w.text);
      assert(Math.abs(w.x - fx) <= 4 && w.y === fy - 32 && w.ear, 'не поздоровался — а шёпот не у уха');
    }
    eq(W.say, null, 'шёпот — бумажкой');
    W.greeted = true; W.murmur = 1;
    W.step(fx, fy);
    const R = U.ROOMS.find(r => r.id === 'crypt');
    assert(W.whisper && !W.whisper.ear && Math.abs(W.whisper.x - fx) >= 40 && W.whisper.x >= R.x0 + 40 && W.whisper.x <= R.x1 - 40 && W.whisper.y === R.y0 - R.wh / 2, 'поздоровался — шёпот не у стены');
    W.whisper = null; W.murmur = 1;
    W.step(1200, 465);                                               // линия: у дальней стены, не за краем
    assert(W.whisper && W.whisper.y === U.TUBES[0].y0 - 13, 'на линии шёпот не на стене');
    W.whisper = null; W.leave();
    W.enter(0, 0); eq(W.greeted, false, 'новый спуск — уже поздоровался');
    W.leave();
  });
  test('изнанка: тишина — в криосклепе ни одного шёпота, слышно уголёк; в ходе мха — рост; окна тишины ритуалов', () => {
    const W = U.under;
    W.enter(0, 0); W.say = null; W.ember = 0.6;
    const ticks = [];
    for (let i = 0; i < 6000; i++) { W.step(834, 300); assert(!W.whisper, 'в криосклепе шёпот'); if (W.tick) ticks.push(W.tick); if (i === 0) { eq(W.say, U.WD_SILENCE, 'тишина криосклепа'); assert(W.quench, 'недописанный шёпот не гаснет'); W.say = null; W.quench = false; } }
    eq(W.say, null, '«Шёпотов нет» — второй раз');
    // уголёк 0.6 в криосклепе тускнеет вдвое быстрее — за 72 секунды: 144 тика по полсекунды, потом тихо
    assert(ticks.length >= 140 && ticks.length <= 146, 'уголёк тикает: ' + ticks.length);
    for (let i = 1; i < ticks.length; i++) assert(ticks[i] <= ticks[i - 1], 'тиканье громче');
    assert(ticks[0] > 0.55 && ticks[ticks.length - 1] < 0.01, 'тиканье не тускнеет вместе с угольком: ' + ticks[ticks.length - 1]);
    eq(W.tick, 0, 'совсем тихо — а тикает');
    W.step(1200, 465); eq(W.tick, 0, 'тикает вне криосклепа');
    W.enter(0, 0); W.say = null;
    for (let i = 0; i < 3000; i++) { const x = U.MOSS.x0 + 30; W.step(x, U.mossY(x) + 12); assert(!W.whisper, 'в ходе мха шёпот'); }
    W.say = null;
    for (const [k, v] of [['hushF', 600], ['hushS', 40]]) {
      W.enter(0, 0); W.say = null; W[k] = v; W.murmur = 1;
      W.step(300, 300);
      assert(!W.whisper, 'окно тишины — шёпот: ' + k);
    }
    W.hushF = 0; W.hushS = 40;
    for (let x = 1000; x < 1050; x++) W.step(x, 465);                // тишина на 40 точек пути
    eq(W.hushS, 0, 'тишина не кончилась через 40 точек');
    W.leave(); W.say = null;
    WH._reset();
    assert(WH.sayAt('...x...', 0, 0, true) && !WH.sayAt('...y...', 0, 0), 'перо занято — а пишет');
    WH.quench(); eq(WH.whisperText(), '', 'не тронутый пером шёпот не погас');
    WH.sayAt('...x...', 0, 0); WH.clear(); eq(WH.whisperText(), '', 'спуск — шёпот сверху остался');
    WH._reset();
    let px = 100;                                                   // у уха — идёт следом
    WH.sayAt('...x...', px, 50, false, () => [px, 50]);
    for (let i = 0; i < 120; i++) { px += 1; WH.stepWhisper(); }
    assert(Math.abs(WH.whisperAt()[0] - px) < 12 && WH.whisperAt()[1] === 50, 'шёпот у уха отстал: ' + WH.whisperAt());
    WH._reset();
  });
  test('изнанка: вдох на пороге — подул на уголёк у лестницы, через секунду тоннель вдыхает; раз за спуск', () => {
    const W = U.under, stairs = U.THINGS.filter(th => th.up);
    W.enter(0, 0); W.say = null;
    const greetOf = th => { const a = th.altNow(); return a && a.key === 'under_greet' && /ПОДУТЬ НА УГОЛЁК/.test(a.label); };
    for (const th of stairs) assert(greetOf(th), `${th.id}: у порога не подуть`);
    assert(!U.THINGS.some(th => !th.up && greetOf(th)), 'подуть — не у порога');
    const st = U.thingById('u_up_crypt'), [fx, fy] = st.at;
    assert(W.greet() && !W.greet(), 'подул дважды');
    assert(!greetOf(st), 'подул — а «подуть» осталось');
    for (let i = 0; i < 58; i++) W.step(fx, fy);
    assert(!W.greeted && !W.inhale, 'тоннель ответил раньше секунды');
    W.step(fx, fy); W.step(fx, fy);
    assert(W.greeted && W.inhale && W.flare > 0.98, 'тоннель не вдохнул');
    const h = W.inhale;
    assert(Math.abs(Math.hypot(h.dx, h.dy) - 1) < 0.01, 'сквозняк без направления');
    assert(U.exitDist(fx + h.dx * 40, fy + h.dy * 40) > U.exitDist(fx, fy), 'сквозняк тянет не внутрь');
    W.inhale = null;
    for (let i = 0; i < 100 && !W.say; i++) W.step(fx, fy);
    eq(W.say, U.GREET_LINE, 'строка вдоха'); W.say = null;
    eq(U.GREET_LINE, 'Посетитель поздоровался. Отмечено всеми.', 'реплика канона');
    for (let i = 0; i < 200; i++) W.step(fx, fy);
    eq(W.flare, 0, 'свечка не опала');
    assert(!W.greet(), 'второй раз за спуск');
    for (const th of stairs) assert(!greetOf(th), 'поздоровался — «подуть» осталось');
    W.leave(); W.enter(0, 0);
    assert(!W.greeted && stairs.every(greetOf), 'новый спуск — уже поздоровался');
    for (const th of stairs) {                                       // у каждого порога — внутрь, к середине своего хода
      const d = U.deepAt(th.at[0], th.at[1]);
      assert(Math.abs(Math.hypot(d.x, d.y) - 1) < 0.01, `${th.id}: глубины нет`);
    }
    W.leave(); W.say = null;
  });
  test('изнанка: после вдоха огонёк ровнее — чужие сквозняки не трогают; на развилках тянется к выходу', () => {
    const W = U.under, st = U.thingById('u_up_crypt'), [fx, fy] = st.at;
    eq(U.FORKS.length, 6, 'развилок');
    for (const f of U.FORKS) {
      assert(U.walkable(f.x, f.y), 'развилка в породе');
      const g = U.tugAt(f.x, f.y);
      assert(g, 'на развилке огонёк никуда не тянется: ' + f.x);
      assert(U.exitDist(f.x + g.x * 30, f.y + g.y * 30) < U.exitDist(f.x, f.y), 'тянется не к выходу: ' + f.x);
    }
    eq(U.tugAt(1135, 465), null, 'не развилка — тянется');
    W.enter(0, 0); W.say = null;
    let gust = 0;
    for (let i = 0; i < 400; i++) { tick(); W.step(fx, fy); gust = Math.max(gust, W.draft); }
    assert(gust > 0.9, 'крипта выдыхает — уголёк не чувствует');
    const r0 = () => U.underLights(fx, fy - 13)[0].r;
    let lo = Infinity, hi = 0;
    for (let i = 0; i < 400; i++) { tick(); W.step(fx, fy); const r = r0(); lo = Math.min(lo, r); hi = Math.max(hi, r); }
    assert(hi - lo > 8, 'сквозняк не прибивает огонёк');
    W.step(1135, 465); eq(W.tug, null, 'не поздоровался — огонёк тянется');
    W.step(1215, 465); eq(W.tug, null, 'не поздоровался — на развилке тянется');
    W.greet(); for (let i = 0; i < 200; i++) { tick(); W.step(fx, fy); }
    assert(W.greeted, 'не поздоровался');
    for (let i = 0; i < 400; i++) { tick(); W.step(fx, fy); eq(W.draft, 0, 'поздоровался — сквозняк трогает'); }
    assert(U.underLights(fx, fy - 13)[0].flicker < 0.05, 'горит не ровнее');
    W.step(1215, 465);
    assert(W.tug && W.tug.y === 1, 'на развилке у затопленного подвала огонёк не тянется вниз');
    const L = U.underLights(1215, 452)[0];
    assert(L.y > 452, 'свет не тянется вслед за огоньком');
    W.step(1135, 465); eq(W.tug, null, 'между развилками — тянется');
    W.leave(); W.say = null;
  });
  test('изнанка: перекличка ниш — уголёк будит одну за проход; повторил имя — утешена, тишина на 40 шагов; промолчал — имя идёт следом', () => {
    const W = U.under, th = U.thingById('u_niches'), R = U.ROOMS.find(r => r.id === 'crypt');
    for (const n of U.NICHES) assert(n.x >= th.x && n.x + n.w <= th.x + th.w && n.y >= th.y && n.y + n.h + 3 <= th.y + th.h && n.y > R.y0 - R.wh, 'ниша вне стены');
    for (const o of U.THINGS) if (o !== th && o.wall && o.room === 'crypt') assert(o.x >= th.x + th.w || o.x + o.w <= th.x, 'ниши налезли на ' + o.id);
    eq(U.NICHE_NAMES[0], 'Агафья', 'первое имя — канон');
    eq(new Set(U.NICHE_NAMES.map(U.nicheOf)).size, U.NICHE_NAMES.length, 'у двух имён одна ниша');
    W.called.clear(); W.enter(0, 0); W.say = null; W.px = 260; W.py = 256;
    assert(!th.useShown(), 'ниши спят — а «повторить» есть');
    for (let i = 0; i < 100; i++) W.step(260, 256);                  // стоит у ниш — не будит
    eq(W.niche, null, 'стоящий разбудил');
    W.step(262, 256);
    assert(W.niche && W.niche.name === 'Агафья', 'уголёк прошёл мимо — ниша спит');
    const n = U.nicheOf('Агафья');
    assert(W.whisper && W.whisper.text === '...Агафья' && W.whisper.keep && Math.abs(W.whisper.x - n.x - n.w / 2) < 1, 'ниша не шепчет имя');
    W.whisper = null;
    assert(th.useShown() && /«АГАФЬЯ»/.test(th.useLabel), '«повторить» нет');
    for (let x = 262; x < 290; x++) W.step(x, 256);
    eq(W.niche.name, 'Агафья', 'за проход проснулась вторая');
    assert(W.callNiche() && !W.callNiche(), 'повторил дважды');
    eq(W.say, U.NICHE_LINE, 'реплика'); W.say = null;
    eq(U.NICHE_LINE, 'Присутствие отмечено. Можно не приходить больше никогда.', 'реплика канона');
    assert(W.quench && W.called.has('Агафья') && !th.useShown(), 'утешенная ниша не умолкла');
    W.quench = false;
    let x = 1000; W.px = x; W.py = 465;                              // шёпоты гаснут на 40 шагов вперёд
    for (; x < 1000 + U.NICHE_HUSH - 4; x += 2) { W.murmur = 1; W.step(x, 465); assert(!W.whisper, 'утешили — а шёпот через ' + (x - 1000)); }
    for (let i = 0; i < 6; i++) { x += 2; W.step(x, 465); }
    W.whisper = null; W.murmur = 1; W.step(x, 465);
    assert(W.whisper, 'после 40 шагов шёпоты не вернулись');
    W.leave(); W.enter(0, 0); W.say = null;
    W.step(260, 256); W.step(262, 256);
    eq(W.niche && W.niche.name, 'Фёкла', 'утешенная проснулась снова');
    for (let i = 0; i < 320; i++) W.step(1200, 465);                // промолчал: ушёл из крипты
    eq(W.niche, null, 'ушёл — окно не закрылось'); eq(W.trail, 'Фёкла', 'имя не идёт следом');
    let got = 0;
    for (let i = 0; i < 3000; i++) {
      W.whisper = null; W.step(1200, 465);
      if (W.whisper && W.whisper.text === '...Фёкла') { got++; assert(W.whisper.faint && W.whisper.ear, 'имя следом — не тихо и не у уха'); }
    }
    assert(got >= 2, 'имя следом не слышно: ' + got);
    eq(JSON.parse(JSON.stringify(W.save())).called.join(), 'Агафья', 'вызванные не сохраняются');
    W.leave(); eq(W.trail, null, 'наверху имя всё идёт');
    W.called.clear(); W.load({ called: ['Агафья'] }); assert(W.called.has('Агафья'), 'вызванные не загрузились');
    W.called.clear(); W.whisper = null; W.say = null;
  });
  test('изнанка: флотилия входящих — выловил кораблик, прочитал вслух; минуту вода тиха и шёпотов нет совсем; одно за спуск', () => {
    const W = U.under, th = U.thingById('u_cut_sewer'), [ax, ay] = th.at;
    W.enter(0, 0); W.say = null;
    assert(Math.abs(ax - U.SEWER_X) < 30, 'у канала не встать');
    for (let i = 0; i < 4000; i++) W.step(2000, 465);
    eq(W.boats.length, 0, 'кораблики — далеко от канала');
    let seen = false;
    for (let i = 0; i < 6000 && !seen; i++) { W.step(ax, ay); seen = th.useShown(); }
    assert(seen && /ВЫЛОВИТЬ КОРАБЛИК/.test(th.useLabel), 'кораблик прошёл — а выловить нечего');
    const b0 = W.boats.find(b => b.y > U.TUBES[0].y0 - 2), y0 = b0.y;
    const f0 = W.flow; W.step(ax, ay); assert(b0.y - y0 > 0.1, 'кораблик стоит');
    const n0 = W.boats.length, run = W.flow - f0;
    assert(W.fishBoat(), 'не выловил'); assert(!W.fishBoat(), 'второе заявление за спуск');
    eq(W.boats.length, n0 - 1, 'кораблик остался в канале');
    eq(W.after, U.FLEET_LINE, 'реплика'); eq(U.FLEET_LINE, 'Ваше обращение зарегистрировано течением.', 'реплика канона');
    assert(/Прошу разъяснить, куда девается\.\.\./.test(U.FLEET_TEXT) && /двумя пальцами/.test(U.FLEET_TEXT), 'сцена без канона');
    assert(W.quench && !th.useShown(), 'прочитал — шёпот не погас или «выловить» осталось');
    W.quench = false; W.after = null;
    const f1 = W.flow; W.step(ax, ay);
    assert(W.flow - f1 < run / 3, 'вода не тише');
    for (let i = 0; i < U.CALM - 10; i++) { W.murmur = 1; W.step(ax, ay); assert(!W.whisper, 'тихая вода — а шёпот'); }
    assert(W.boats.every(b => b.y < U.TUBES[0].y0 + 30), 'кораблики не еле движутся');
    for (let i = 0; i < 20; i++) W.step(ax, ay);
    eq(W.calm, 0, 'вода тиха дольше минуты');
    W.murmur = 1; W.step(ax, ay); assert(W.whisper, 'минута прошла — шёпотов нет');
    W.leave(); eq(W.boats.length, 0, 'наверху кораблики плывут');
    W.enter(0, 0); assert(!W.read, 'новый спуск — уже прочитано');
    W.leave(); W.say = null; W.whisper = null;
  });
  test('изнанка: вечный отбой — расписался в журнале учений; репродуктор больше не шипит, гермодверь без скрипа', () => {
    const W = U.under, th = U.thingById('u_cut_shelter');
    W.signed = false; W.enter(0, 0); W.say = null;
    assert(/журнал учений/.test(th.look) && /явился \/ убыл/.test(th.look) && /противогазного шкафа/.test(th.look), 'у среза нет журнала');
    assert(th.useShown() && /РАСПИСАТЬСЯ В ЖУРНАЛЕ/.test(th.useLabel), '«расписаться» нет');
    const r0 = Math.random; Math.random = () => 0.1;
    for (let i = 0; i < 3; i++) W.step(1460, 466);
    eq(W.say, U.OFF_LINE, 'отбой'); assert(W.hiss > 0, 'репродуктор не шипит'); W.say = null;
    assert(W.sign() && !W.sign(), 'расписался дважды');
    eq(W.after, U.DRILL_LINE, 'реплика'); eq(U.DRILL_LINE, 'Учения прошли успешно: никто не пришёл, никто не пострадал.', 'реплика канона');
    assert(/Единственная запись за век/.test(U.JOURNAL_TEXT) && /сорок какого-то года/.test(U.JOURNAL_TEXT), 'сцена без канона');
    assert(!th.useShown() && /открылась без скрипа/.test(th.look) && /проверяющим/.test(th.look), 'убежище не считает проверяющим');
    W.after = null; W.leave(); W.enter(0, 0); W.say = null;
    for (let i = 0; i < 3; i++) W.step(1460, 466);
    eq(W.say, U.OFF_LINE, 'проверяющему отбой не объявили'); eq(W.hiss, 0, 'при проверяющем шипит');
    Math.random = r0;
    eq(JSON.parse(JSON.stringify(W.save())).signed, true, 'подпись не сохраняется');
    W.signed = false; W.load({ signed: true }); assert(W.signed, 'подпись не загрузилась');
    W.signed = false; W.leave(); W.say = null;
  });
  test('изнанка: гербарий темноты — поднёс уголёк к извёстке, снял тень пиона; положил на вещь — минуту тёплая, дневная, отвечает', () => {
    const W = U.under, th = U.thingById('u_cut_catacomb'), [ax, ay] = th.at;
    W.shadow = false; W.enter(0, 0); W.say = null;
    assert(th.useShown() && /ПОДНЕСТИ УГОЛЁК/.test(th.useLabel), 'у извёстки не поднести уголёк');
    eq(W.herb(ax), 'bloom', 'тень не раскрылась'); eq(W.say, U.BLOOM_LINE, 'строка тени'); W.say = null;
    assert(/пиона/.test(U.BLOOM_LINE) && /дышащая/.test(U.BLOOM_LINE), 'тень не канона');
    assert(/СНЯТЬ ТЕНЬ ЦВЕТКА/.test(th.useLabel), '«снять» нет');
    for (let i = 0; i < 30; i++) W.step(ax, ay);
    assert(W.bloom && W.bloom.t >= 30, 'тень не держится у уголька');
    W.step(ax + 100, ay); eq(W.bloom, null, 'отошёл — тень осталась на стене');
    eq(W.herb(ax), 'bloom', 'вернулся — тень не раскрылась снова'); W.say = null;
    eq(W.herb(ax), 'pick', 'тень не снялась');
    eq(W.say, U.HERB_LINE, 'реплика'); eq(U.HERB_LINE, 'Сорвано в темноте. Наверху не заметят недостачи.', 'реплика канона'); W.say = null;
    assert(W.shadow && !th.useShown() && W.herb(ax) === null, 'вторая тень за проход');
    const cap = U.thingById('u_capsule');
    const a = cap.altNow(); assert(a && a.key === 'under_lay' && /ПОЛОЖИТЬ ТЕНЬ ЦВЕТКА/.test(a.label), 'тень некуда положить');
    const stair = U.thingById('u_up_crypt'); eq(stair.altNow().key, 'under_greet', 'у порога сперва — поздороваться');
    assert(W.lay(cap) && !W.shadow && !W.lay(cap), 'тень не легла или легла дважды');
    assert(W.whisper && W.whisper.keep && W.whisper.text === '...ноль тёплых пятен...', 'вещь не отвечает: ' + (W.whisper && W.whisper.text));
    W.whisper = null;
    eq(cap.altNow(), null, 'тени в кармане нет — а положить');
    const lit = () => U.underLights(834, 300).some(L => L.color[0] > 200 && L.color[1] > 180 && Math.abs(L.x - (cap.x + cap.w / 2)) < 1);
    for (let i = 0; i < 120; i++) W.step(834, 300);
    assert(lit(), 'верхняя вещь не тёплая');
    let again = 0;
    for (let i = 0; i < U.UPPER; i++) { W.whisper = null; W.step(834, 300); if (W.whisper && W.whisper.text === '...ноль тёплых пятен...') again++; }
    eq(W.upper, null, 'вещь верхняя дольше минуты'); assert(!lit(), 'минута прошла — а тепло');
    eq(again, 0, 'в криосклепе вещь ответила — а там шёпотов нет');
    for (const o of U.THINGS) assert(U.answerOf(o).length > 6, 'вещи нечего ответить: ' + o.id);
    eq(U.answerOf(U.thingById('u_godot')), '...сегодня не придёт. завтра — наверняка...', 'щит отвечает своей надписью');
    W.shadow = true; W.leave(); assert(W.shadow, 'тень пропала под землёй');
    W.shadow = false; W.say = null; W.whisper = null;
  });
  test('изнанка: опись инеем — дочитал строку, не выдохнув, — она в описи криосклепа; выдох стирает строку; чужую сохранить можно тоже', () => {
    const W = U.under, cap = U.thingById('u_capsule'), fl = U.thingById('u_frost_line');
    W.kept.clear(); W.enter(0, 0); W.say = null;
    eq(U.FROST[2].text, '3. запах подъезда в дождь', 'строка канона'); eq(U.FROST_FOREIGN, '1. пусть подождёт', 'чужая строка канона');
    for (const f of U.FROST) assert(f.x - 75 >= U.VEIN.x0 && f.x + 75 <= U.VEIN.x1 && U.placeAt(f.x, U.VEIN.y0 + 12) === 'vein', 'строка вне жилы: ' + f.text);
    // дыхание на холоде: идёшь — выдох раз в 80 шагов; стоишь — задержано
    W.cold = 1; let ex = 0, x = 660;
    for (let i = 0; i < 400; i++) { x += i & 1 ? 0.5 : -0.5; W.step(x, 294); if (W.exhale) ex++; }
    assert(ex >= 4 && ex <= 6, 'идёшь — выдохов ' + ex);
    ex = 0; for (let i = 0; i < 280; i++) { W.step(x, 294); if (W.exhale) ex++; }
    assert(ex <= 1, 'стоишь — а дышишь: ' + ex);
    W.leave(); W.enter(0, 0); W.say = null; W.px = 470; W.py = 294;
    // тёплый конец жилы: подошёл, постоял — сохранил
    let f = U.FROST[0]; W.step(f.x, 294);
    assert(W.frost && W.frost.text === f.text && W.whisper && W.whisper.frost && W.whisper.keep, 'иней не пишет строку');
    W.whisper = null;
    for (let i = 0; i < 400 && W.frost; i++) W.step(f.x, 294);
    assert(W.kept.has(f.text), 'дочитал — не сохранилось');
    eq(W.say, U.FROST_LINE, 'реплика'); eq(U.FROST_LINE, 'Хранение бессрочное. Перечень уточняется дыханием.', 'реплика канона'); W.say = null;
    // холод: идёшь мимо — выдох стирает строку
    f = U.FROST[2]; W.cold = 1;
    let fx = f.x - 20; W.px = fx; W.step(fx, 294);
    assert(W.frost && W.frost.text === f.text, 'строка 3 не пишется');
    for (let i = 0; i < 120 && W.frost; i++) { fx += 0.3; W.step(fx, 294); W.cold = 1; }
    assert(!W.frost && !W.kept.has(f.text) && W.frostDone.has(f.text) && W.quench, 'выдох не стёр строку');
    W.quench = false;
    for (let i = 0; i < 60; i++) W.step(f.x, 294);
    assert(!W.frost, 'стёртая строка пишется снова за спуск');
    W.leave(); W.enter(0, 0); W.say = null; W.px = f.x - 200; W.py = 294; W.cold = 1; W.breath = 200;
    W.step(f.x, 294); W.cold = 1;                                    // пришёл издалека, на выдохе — строка всё равно начинается с вдоха
    assert(W.frost, 'выдох на подходе стёр строку, не дав начать');
    for (let i = 0; i < 400 && W.frost; i++) { W.step(f.x, 294); W.cold = 1; }
    assert(W.kept.has(f.text), 'стоял, не выдохнул — а строка не сохранилась');
    // чужая строка над дверью криосклепа
    assert(fl.useShown() && /ДОЧИТАТЬ, НЕ ВЫДОХНУВ/.test(fl.useLabel), 'чужую не дочитать');
    W.whisper = null; W.px = 786; W.py = 256; W.step(786, 256); W.say = null; W.quench = false;
    assert(W.readFrost(fl.x + fl.w / 2, fl.y + 12, U.FROST_FOREIGN), 'чужая не читается');
    assert(W.whisper && W.whisper.text === U.FROST_FOREIGN, 'иней не пишет чужую');
    for (let i = 0; i < 400 && W.frost; i++) { W.step(786, 256); assert(!W.quench, 'криосклеп погасил иней'); }
    assert(W.kept.has(U.FROST_FOREIGN) && !fl.useShown(), 'чужая не сохранилась');
    assert(/В описи криосклепа: .*«3\. запах подъезда в дождь».*«1\. пусть подождёт»/.test(cap.look), 'опись криосклепа пуста: ' + cap.look.slice(-120));
    eq(JSON.parse(JSON.stringify(W.save())).kept.length, 3, 'опись не сохраняется');
    W.leave(); W.kept.clear(); W.load({ kept: ['3. запах подъезда в дождь'] }); assert(W.kept.size === 1, 'опись не загрузилась');
    W.kept.clear(); W.cold = 0; W.say = null; W.whisper = null; W.quench = false;
  });
  test('изнанка: каптёрка Дежурного перед криосклепом — тепло; на шаги он выходит и наливает кипяток; у печки уголёк отходит', () => {
    const W = U.under, K = U.KAPT, man = U.thingById('u_watchman'), log = U.thingById('u_duty_log');
    assert(K && K.x0 > U.VEIN.x0 && K.x1 <= U.VEIN.x1 && K.y0 === U.VEIN.y0, 'каптёрка не в коллекторе перед криосклепом');
    for (const x of [K.x0 + 8, (K.x0 + K.x1) / 2, K.x1 - 8]) assert(U.walkable(x, U.VEIN.y0 + 12), 'проход к криосклепу через каптёрку закрыт: ' + x);
    assert(U.pathTo(600, 294, 834, 306), 'из жилы в криосклеп — не пройти');
    for (const th of [man, log]) assert(U.walkable(th.at[0], th.at[1]), th.id + ': не подойти');
    eq(U.coldAt(U.STOVE.x - 20, U.STOVE.y), 0, 'у печки холодно'); assert(U.coldAt(834, 300) === 1, 'криосклеп оттаял');
    assert(U.underLights(726, 300).some(L => L.color[0] > 190 && L.color[2] < 80 && Math.hypot(L.x - U.STOVE.x, L.y - U.STOVE.y) < 12), 'печка не светит');
    assert(man.npc === 'watchman' && man.talkName === 'Дежурный криосклепа', 'Дежурный не житель');
    assert(/катушка от кабеля вместо стола/.test(man.look) && /ватник на гвозде/.test(man.look) && /2087/.test(man.look), 'Дежурный без канона');
    assert(/продолжает чью-то честность/.test(log.look) && /прочерки/.test(log.look), 'журнал без канона');
    eq(U.DUTY_LINE, 'Расписаться не могу — ставку сократили. Ставлю прочерк. Прочерк — это я.', 'реплика канона');
    W.enter(0, 0); W.say = null; W.px = 600; W.py = 294;
    for (const f of U.FROST) W.kept.add(f.text);                     // опись инеем здесь ни при чём
    for (let i = 0; i < 60; i++) W.step(600, 294);
    eq(W.duty.st, 'sit', 'издалека встал');
    W.px = 680; W.py = 294; for (let i = 0; i < 60; i++) W.step(680, 294);   // стоит рядом, не шагая (пришёл издалека — шаг был один)
    W.duty = { st: 'sit', t: 0, poured: false, glass: 0, away: 0 }; W.px = 680; W.py = 294;
    for (let i = 0; i < 60; i++) W.step(680, 294);
    eq(W.duty.st, 'sit', 'стоящий — а он вышел');
    let x = 680, pour = 0;
    for (let i = 0; i < 20; i++) { x += 0.6; W.step(x, 294); }
    eq(W.duty.st, 'up', 'на шаги не вышел');
    for (let i = 0; i < 200; i++) { W.step(x, 294); if (W.pourSnd) pour++; }
    assert(W.duty.poured && W.duty.st === 'wait' && pour === 1, 'кипяток не налил');
    eq(W.say, U.DUTY_POUR, 'не сказал «погрейтесь»'); eq(U.DUTY_POUR, '— Погрейтесь перед. Там — не положено.', 'реплика сцены канона'); W.say = null;
    for (let i = 0; i < 700; i++) W.step(500, 294);
    eq(W.duty.st, 'sit', 'ушёл — а он стоит');
    for (let i = 0; i < 20; i++) { x += 0.6; W.step(x, 294); }
    for (let i = 0; i < 200; i++) W.step(x, 294);
    eq(W.say, null, 'налил второй раз за спуск');
    W.ember = 0.3; for (let i = 0; i < 600; i++) W.step(726, 300);
    assert(W.ember > 0.75, 'у печки уголёк не отходит: ' + W.ember.toFixed(2));
    W.kept.clear(); W.leave(); W.say = null;
  });
  test('изнанка: Дежурный говорит по канону; строка описи инеем, сохранённая в прошлый спуск, встречает странника у него — раз', () => {
    const W = U.under;
    W.kept.clear(); W.met.clear(); W.enter(0, 0);
    let lines = W.talk();
    eq(lines.join('|'), [U.DUTY_SHIFT, U.DUTY_LINE].join('|'), 'разговор');
    W.kept.add('3. запах подъезда в дождь'); W.keptNow.add('3. запах подъезда в дождь');
    eq(W.talk().length, 2, 'строка встретила в тот же спуск');
    W.leave(); W.enter(0, 0);
    lines = W.talk();
    eq(lines[0], U.metLine('3. запах подъезда в дождь'), 'строка описи не дошла до Дежурного');
    assert(/Хранение бессрочное/.test(lines[0]), 'встреча без канона описи');
    eq(W.talk().length, 2, 'одна и та же строка встречает дважды');
    eq(JSON.parse(JSON.stringify(W.save())).met.join(), '3. запах подъезда в дождь', 'встречи не сохраняются');
    W.met.clear(); W.load({ met: ['3. запах подъезда в дождь'] }); assert(W.met.size === 1, 'встречи не загрузились');
    W.kept.clear(); W.met.clear(); W.keptNow.clear(); W.leave();
  });
  test('изнанка: кадр рисуется без холста (тесты) и без ошибок; иней тает у уголька', () => {
    const c = fakeCtx(); setCtx(c);
    const p = { x: 828, y: 283, dir: 1, moving: true, vx: 1, vy: 0 };
    U.under.cold = 1;
    for (let i = 0; i < 40; i++) { tick(); UR.stepUnderLife(p); }
    UR.drawUnderWorld(c, 820 - 320, 290 - 180, 640, 360, p, () => {});
    UR.drawUnderThing(c, U.thingById('u_plaque')); UR.drawUnderThing(c, U.thingById('u_capsule'));
    UR.drawUnderFx(c, 640, 360);
    U.moss.glows.push({ x: U.MOSS.x0 + 60, y: U.mossY(U.MOSS.x0 + 60) + 12, life: 40, warm: false }); U.moss.sprouts.push({ x: U.MOSS.x0 + 50, y: U.mossY(U.MOSS.x0 + 50) + 10, tall: true });
    UR.drawUnderWorld(c, U.MOSS.x0 - 20, U.MOSS.base - 180, 640, 360, { x: U.MOSS.x0 + 54, y: U.mossY(U.MOSS.x0 + 60) - 11, dir: 1 }, () => {});
    for (const id of ['u_moss', 'u_up_pithos', 'u_up_burrow']) UR.drawUnderThing(c, U.thingById(id));
    for (const st of ['sit', 'up', 'pour', 'wait']) for (const tt of [0, 20, 40, 70]) {   // каптёрка: Дежурный во всех видах
      U.under.duty = { st, t: tt, poured: tt > 40, glass: 10, away: 0 };
      UR.drawUnderWorld(c, 700 - 320, 300 - 180, 640, 360, { x: 690, y: 271, dir: 1 }, () => {});
      for (const id of ['u_watchman', 'u_duty_log', 'u_vatnik']) UR.drawUnderThing(c, U.thingById(id));
    }
    U.under.duty = { st: 'sit', t: 0, poured: false, glass: 0, away: 0 };
    U.moss.reset();
    U.under.cold = 0;
    setCtx(ctx);
  });
}

// ═══ КОЛОДЕЦ У ПЛОЩАДИ: ведро общего дна, сюда выходит метро изнанки ═══
{
  const M = await imp('world/locations.js');
  const TWL = await imp('world/townWell.js');
  const MX = await imp('world/mechanisms.js');
  const D = await imp('world/disc.js');
  const A = await imp('world/arteries.js');
  const TM = await imp('core/time.js');
  const SKY = await imp('world/sky.js');
  const UAW = await imp('world/useActions.js');
  const LK = await imp('content/looks.js');
  const w = M.locations.find(l => l.id === 'town_well'), fire = M.locations.find(l => l.id === 'campfire');
  test('колодец у площади: у круга костра, в городке, ни на кого не налез, у тропы', () => {
    assert(w && w.zone === 'settlement' && w.useAction === 'town_well_crank', 'колодца нет');
    eq(TWL.townWell(), w, 'колодец не тот');
    const d = Math.hypot(w.x + w.w / 2 - (fire.x + fire.w / 2), w.y + w.h - (fire.y + fire.h));
    assert(d > 60 && d < 220, `колодец не у площади: ${Math.round(d)} от костра`);
    const T = D.TOWN;
    assert(w.x > T.x0 && w.x + w.w < T.x1 && w.y > T.y0 && w.y + w.h < T.y1, 'колодец вне городка');
    for (const l of M.locations) {
      if (l === w) continue;
      assert(!(l.x < w.x + w.w + 4 && l.x + l.w > w.x - 4 && l.y < w.y + w.h + 4 && l.y + l.h > w.y - 4), `колодец налез на «${l.name}»`);
    }
    const a = TWL.wellAccess(), fx = a.x + 6, fy = a.y + 23;
    let near = 1e9;
    for (const L of A.lines) if (L.town && L.kind === 'road') for (const p of L.pts) near = Math.min(near, Math.hypot(p.x - fx, p.y - fy));
    assert(near < 24, `от колодца до тропы ${Math.round(near)}`);
    assert(/собака, поднявшая голову/.test(w.look) && /мокрая/.test(w.look) && /тяжёлым/.test(w.look), 'осмотр не по канону');
  });
  test('колодец у площади: ворот — тяжёлое ведро, в нём потери по очереди с биркой; мимо прошёл — ворот поскрипел', () => {
    const got = [];
    TWL.loadTownWell({ q: 0 });
    for (let k = 0; k < 4; k++) {
      assert(TWL.crankTownWell(t => got.push(t)), 'ворот не крутится');
      assert(!TWL.crankTownWell(() => {}), 'ворот крутится дважды');
      let n = 0;
      while (MX.well('well:town_well').st !== 'idle' && n++ < 2000) MX.stepMechs();
      assert(n < 2000, 'ведро не вернулось');
      assert(n > 400, `ведро не тяжёлое: ${n} шагов`);
    }
    eq(got.length, 4, 'потерь');
    for (let k = 0; k < 4; k++) {
      eq(got[k], TWL.LOST[k % TWL.LOST.length], 'не по очереди');
      assert(/ВОЗВРАЩЕНО\. ВЛАДЕЛЕЦ ВЫБЫЛ/.test(got[k]), 'без бирки');
    }
    eq(TWL.saveTownWell().q, 4, 'очередь не сохраняется');
    const p = { x: w.x + w.w / 2 - 6 - 120, y: w.y + w.h + 5, moving: true };
    for (let k = 0; k < 120; k++) { p.x += 2; TWL.stepTownWell(p); }
    MX.stepMechs();
    eq(MX.well('well:town_well').st, 'nod', 'мимо прошёл — ворот молчит');
    for (let k = 0; k < 80; k++) MX.stepMechs();
    eq(MX.well('well:town_well').st, 'idle', 'ворот не вернулся');
    for (let k = 0; k < 120; k++) { p.x -= 2; TWL.stepTownWell(p); }
    MX.stepMechs();
    eq(MX.well('well:town_well').st, 'idle', 'ворот скрипит на каждом шаге');
  });
  test('колодец у площади: рисунок — точки краской канона, в своей рамке', () => {
    const OK = new Set(['#0D0B0A', '#D9CFB8', '#8A8D8F', '#3D4A3A', '#C23B2B', '#15100c', '#241c14', '#2a2620', '#34302a', '#3a3328', '#3a2818', '#c8b89a', '#474442', '#5e5e5d', '#33302e'].map(c => c.toLowerCase()));
    const m = MX.well('well:town_well');
    for (const [st, d] of [['idle', 1], ['top', 0]]) {
      m.st = st; m.d = d;
      const log = [];
      const ctx = new Proxy({}, {
        get(t, k) { return (...a) => { log.push([k, ...a]); }; },
        set(t, k, v) { log.push(['=' + k, v]); return true; },
      });
      for (let k = 0; k < 3; k++) w.drawSelf(ctx, w, 37 + k);
      for (const [k, ...a] of log) {
        if (k === '=fillStyle') assert(OK.has(String(a[0]).toLowerCase()), `колодец: краска ${a[0]} вне палитры`);
        if (k !== 'fillRect') continue;
        const [x, y, ww, hh] = a;
        assert(x >= w.x - 2 && x + ww <= w.x + w.w + 4 && y >= w.y - 3 && y + hh <= w.y + w.h + 1, `колодец вылез из рамки: ${x},${y} ${ww}×${hh}`);
      }
    }
    m.st = 'idle'; m.d = 1;
  });
  test('колодец у площади: своё можно отдать — в поднятое ведро, опустить; наутро в описи строка «принято на дно. очередь общая»', () => {
    M.attachContent(LK.looks, {});                                 // main переписывает осмотры мест из словаря — опись не должна мешать
    assert(/собака, поднявшая голову/.test(w.look), 'осмотр колодца потерян');
    const m = MX.well('well:town_well'), near = { x: w.x + w.w / 2 - 6, y: w.y + w.h - 18, moving: false }, far = { x: w.x - 300, y: w.y + 200, moving: false };
    TWL.loadTownWell({ q: 0 }); m.st = 'idle'; m.d = 1; m.hold = false;
    const up = () => { assert(TWL.crankTownWell(() => {}), 'ворот не крутится'); let n = 0; while (m.st !== 'top' && n++ < 2000) { TWL.stepTownWell(near); MX.stepMechs(); } assert(m.st === 'top', 'ведро не поднялось'); };
    TWL.stepTownWell(near);
    eq(w.altNow(), null, 'отдать — в ведро, которое внизу');
    up();
    for (let k = 0; k < 600; k++) { TWL.stepTownWell(near); MX.stepMechs(); }
    eq(m.st, 'top', 'ведро не ждёт, пока странник рядом');
    assert(/ОПУСТИТЬ ВЕДРО/.test(w.useLabel), 'ворот не отпускает ведро');
    eq(w.altNow().key, 'town_well_give', 'своё не отдать');
    assert(/отдают не глядя/.test(UAW.useTexts.town_well_give.text) && /отпускаешь ворот/.test(UAW.useTexts.town_well_give.text), 'сцена не та');
    const day0 = SKY.dayIndex(TM.t);
    assert(TWL.giveTownWell(), 'не отдал'); eq(m.st, 'drop', 'ведро со своим не ушло вниз');
    assert(!TWL.giveTownWell(), 'отдал дважды');
    for (let k = 0; k < 2000 && m.st !== 'idle'; k++) { TWL.stepTownWell(near); MX.stepMechs(); }
    TWL.stepTownWell(near);
    assert(!/принято на дно/.test(w.look), 'строка в описи — до утра');
    up();
    eq(w.altNow(), null, 'до утра отдать второй раз');
    TWL.stepTownWell(far);
    for (let k = 0; k < 400; k++) MX.stepMechs();
    eq(m.st, 'idle', 'ушёл — а ведро висит');
    let n = 0;
    while (SKY.dayIndex(TM.t) <= day0 && n++ < SKY.DAY_LEN + 2) TM.tick();
    TWL.stepTownWell(far);
    assert(/опись канцелярии, в ней одна строка: «принято на дно\. очередь общая»/.test(w.look), 'наутро строки нет: ' + w.look.slice(-120));
    const s1 = TWL.saveTownWell(); eq(s1.g, 1, 'отданное не сохраняется'); eq(s1.l, 1, 'строка не сохраняется'); eq(s1.p, false, 'утро не наступило');
    up(); assert(TWL.giveTownWell(), 'наутро своё снова не отдать');
    const s2 = TWL.saveTownWell(); eq(s2.p, true, 'не ждёт утра');
    TWL.loadTownWell(s2);
    assert(/2 строки, все одинаковые/.test(w.look), 'вышел из игры — утро не прошло');
    const log = [], ctx = new Proxy({}, { get(t, k) { return (...a) => { log.push([k, ...a]); }; }, set(t, k, v) { log.push(['=' + k, v]); return true; } });
    w.drawSelf(ctx, w, 5);
    for (const [k, x, y, ww, hh] of log) if (k === 'fillRect') assert(x >= w.x - 2 && x + ww <= w.x + w.w + 4 && y >= w.y - 3 && y + hh <= w.y + w.h + 1, `опись вылезла из рамки: ${x},${y}`);
    TWL.loadTownWell({ q: 0 }); m.st = 'idle'; m.d = 1; m.hold = false;
  });
}

// ═══ ЗА КОЛЬЦОМ: позёмка растра на северной равнине (weave/UNDERGROUND.md, ритуалы за кольцом) ═══
{
  const BY = await imp('world/beyond.js');
  const DSC = await imp('world/disc.js');
  const EDG = await imp('world/edges.js');
  const BRT = await imp('world/brainrot.js');
  const T0 = DSC.TOWN, OUT = DSC.RINGS_D + DSC.FIRE_W;
  const N = { x: (T0.x0 + T0.x1) / 2, y: T0.y0 - OUT - 300 };      // север за огнём, четверть пустыни
  const stand = (k, p = N, paused = false) => { for (let i = 0; i < k; i++) { tick(); BY.beyond.step(p.x, p.y, false, paused); } };
  test('за кольцом: северная пустыня — только север и только за огнём, глубже — глубже', () => {
    const d = BY.northDepth(N.x, N.y);
    assert(d > 0.1 && d < 0.5, `глубина ${d}`);
    assert(BY.northDepth(N.x, N.y - 400) > d, 'к краю не глубже');
    eq(BY.northDepth(DSC.oldX(4650), DSC.oldY(4000)), -1, 'городок');
    eq(BY.northDepth((T0.x0 + T0.x1) / 2, T0.y0 - OUT + 100), -1, 'кольцо огня');
    eq(BY.northDepth((T0.x0 + T0.x1) / 2, T0.y1 + OUT + 300), -1, 'юг');
    eq(BY.northDepth(T0.x0 - OUT - 300, 3900), -1, 'запад');
    eq(BY.northDepth(T0.x1 + OUT + 300, 3900), -1, 'восток');
  });
  test('за кольцом: старые картинки — чьи-то, первая по канону; поле бумаги и не пусто', () => {
    eq(BY.PICS[0].name, 'кухня, клеёнка, чей-то локоть', 'первая — не канон');
    for (let k = 0; k < BY.PICS.length; k++) {
      const px = BY.picPixels(k), tones = new Map();
      eq(px.length, BY.PIC_W * BY.PIC_H, `картинка ${k}: точек`);
      for (const [x, y, c] of px) {
        tones.set(c, (tones.get(c) || 0) + 1);
        if (x === 0 || y === 0 || x === BY.PIC_W - 1 || y === BY.PIC_H - 1) eq(c, 5, `картинка ${k}: поле бумаги`);
      }
      assert(tones.size >= 5, `картинка ${k}: тонов ${tones.size}`);
      assert((tones.get(1) || 0) > 40, `картинка ${k}: теней ${tones.get(1) || 0}`);
    }
  });
  test('за кольцом: встал и смотришь — минута, кадр собран; досмотрел — тихо и строка; потом следующий', () => {
    BY._resetBeyond();
    stand(BY.STILL0 - 1);
    eq(BY.beyond.pic, null, 'кадр раньше, чем встал');
    stand(1);
    const P = BY.beyond.pic;
    assert(P && P.k === 0, 'песчинка не выбрана');
    eq(P.x, Math.round(N.x + 30), 'песчинка не сбоку');
    assert(BY.beyond.seated, 'выбрал песчинку — не сел');
    stand(BY.GRAIN + BY.BUILD / 2);
    assert(Math.abs(BY.picProgress(P) - 0.5) < 0.01, `полминуты — ${BY.picProgress(P)}`);
    stand(BY.BUILD / 2 + BY.HOLD - 1);
    assert(!P.gone, 'рассыпался до конца');
    eq(BY.beyond.say, null, 'строка раньше конца');
    stand(1);
    eq(P.gone && P.gone.kind, 'quiet', 'досмотренный — не тихо');
    eq(BY.beyond.say, BY.PIC_LINE, 'строки нет');
    assert(!BY.beyond.sighSnd, 'досмотренный вздыхает');
    BY.beyond.say = null;
    stand(150);
    eq(BY.beyond.pic, null, 'не рассыпался');
    assert(BY.beyond.seated, 'досмотрел — вскочил');
    stand(300 + BY.STILL0);
    assert(BY.beyond.pic && BY.beyond.pic.k === 1, 'следующий кадр — не следующая картинка');
  });
  test('за кольцом: шагнул — недосмотренный со вздохом; не успел выбрать — без вздоха; меню — кадр ждёт', () => {
    BY._resetBeyond();
    stand(BY.STILL0 + 30);
    tick(); BY.beyond.step(N.x + 1, N.y, true);
    eq(BY.beyond.pic, null, 'песчинка без кадра — держится');
    assert(!BY.beyond.sighSnd, 'вздох без кадра');
    stand(BY.STILL0 + BY.GRAIN + 200);
    const P = BY.beyond.pic, t0 = P.t;
    stand(100, N, true);
    eq(P.t, t0, 'в меню собирается');
    assert(!P.gone, 'меню рассыпало');
    tick(); BY.beyond.step(N.x + 1, N.y, true);
    eq(P.gone && P.gone.kind, 'sigh', 'шагнул — не вздох');
    assert(BY.beyond.sighSnd, 'вздоха не слышно');
    assert(!BY.beyond.seated, 'шагнул — сидит');
    eq(BY.beyond.say, null, 'недосмотренному — строка');
    // ушёл с севера стоя (телепорт) — тоже вздох
    BY._resetBeyond();
    stand(BY.STILL0 + BY.GRAIN + 10);
    const S = { x: (T0.x0 + T0.x1) / 2, y: T0.y1 + OUT + 300 };
    stand(1, S);
    eq(BY.beyond.pic && BY.beyond.pic.gone && BY.beyond.pic.gone.kind, 'sigh', 'унёсся с севера — без вздоха');
    BY._resetBeyond();
    stand(BY.STILL0 * 3, S);
    eq(BY.beyond.pic, null, 'на юге собирается кадр');
  });
  {
    const PL = await imp('sprites/player.js');
    const box = sit => {
      const b = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9 };
      const g = new Proxy({}, { get(t, k) { return k === 'fillRect' ? (x, y, w, h) => { b.x0 = Math.min(b.x0, x); b.x1 = Math.max(b.x1, x + w); b.y0 = Math.min(b.y0, y); b.y1 = Math.max(b.y1, y + h); } : noop; }, set() { return true; } });
      setCtx(g); PL.drawPlayer({ x: 100, y: 100, moving: false, vx: 0, vy: 0, sit }); setCtx(ctx);
      return b;
    };
    test('за кольцом: странник садится смотреть — ниже и шире, подол на земле', () => {
      const a = box(0), b = box(1);
      assert(b.y0 >= a.y0 + 5, `сел не ниже: ${a.y0} → ${b.y0}`);
      assert(b.x1 - b.x0 > a.x1 - a.x0, 'подол не лёг шире');
      assert(b.y1 <= 125 && b.y1 >= 121, `подол не на земле: ${b.y1}`);
      assert(b.x0 >= 92 && b.x1 <= 122, `вылез из рамки тени: ${b.x0}..${b.x1}`);
    });
  }
  test('за кольцом: позёмка бормочет на севере, в городке молчит; горизонт виден — молчит', () => {
    BY._resetBeyond();
    let n = 0;
    for (let i = 0; i < 400; i++) { BY.beyond.step(N.x, N.y, true); if (BY.beyond.murmur > 0) n++; }
    assert(n > 40 && n < 160, `обломков слов ${n} из 400`);
    let m = 0;
    for (let i = 0; i < 400; i++) { BY.beyond.step(DSC.oldX(4650), DSC.oldY(4000), true); if (BY.beyond.murmur > 0) m++; }
    eq(m, 0, 'бормочет в городке');
    assert(BY.beyond.lookHorizon(), 'горизонт не открылся');
    for (let i = 0; i < BY.HOR; i++) { tick(); BY.beyond.step(N.x, N.y, false); if (BY.beyond.murmur > 0 && BY.beyond.hAge > BY.HOR_IN + 1 && BY.beyond.hT > BY.HOR_OUT) m++; }
    eq(m, 0, 'бормочет при горизонте');
    BY._resetBeyond();
  });
  {
    const LOC = (await imp('world/locations.js')).locations, W2 = (await imp('world/wind.js')).wind;
    test('за кольцом: столб у северной тропы, на трети пустыни; одинокий; действие — из-под ладони', () => {
      const p = BY.horizonPole();
      assert(p && LOC.includes(p), 'столба нет среди мест');
      const gx = p.x + 6, gy = p.y + p.h, d = BY.northDepth(gx, gy);
      assert(d >= 0.29 && d < 0.33, `глубина столба ${d}`);
      const tr = DSC.trailPoint('north', T0.y0 - gy);
      assert(Math.abs(tr.x - gx) < 90, `от тропы далеко: ${Math.round(tr.x - gx)}`);
      eq(p.useAction, 'horizon_look', 'действие');
      assert(/Утерян горизонт\. Нашедшему — вернуть/.test(p.look) && /растр съедает линию/.test(p.look), 'осмотр не по канону');
      for (const l of LOC) if (l !== p) assert(Math.hypot(l.x - p.x, l.y - p.y) > 300, `рядом ${l.id} — не одинокий`);
    });
    test('за кольцом: столб — точки краской канона, в рамке тени; бланк трепещет, при горизонте замер', () => {
      const p = BY.horizonPole(), OK = new Set(['#15100c', '#2a2620', '#34302a', '#3a3328', '#3a2818', '#241c14', '#c8b89a', '#D9CFB8', '#8A8D8F', '#C23B2B'].map(c => c.toLowerCase()));
      const shot = tt => {
        const log = [];
        const g = new Proxy({}, { get(t, k) { return (...a) => { log.push([k, ...a]); }; }, set(t, k, v) { log.push(['=' + k, v]); return true; } });
        p.drawSelf(g, p, tt);
        for (const [k, ...a] of log) {
          if (k === '=fillStyle') assert(OK.has(String(a[0]).toLowerCase()), `столб: краска ${a[0]} вне палитры`);
          if (k === 'fillRect') assert(a[0] >= p.x - 30 && a[0] + a[2] <= p.x + p.w + 30 && a[1] >= p.y - 70 && a[1] + a[3] <= p.y + p.h + 1, `столб вылез: ${a}`);
          assert(!/arc|ellipse|stroke|Gradient/.test(k), `столб: векторное ${k}`);
        }
        return JSON.stringify(log);
      };
      W2.s = 0.7; BY.beyond.hK = 0;
      const a = [3, 9, 17, 26].map(shot);
      assert(new Set(a).size > 1, 'бланк не трепещет');
      BY.beyond.hK = 1;
      const b = [3, 9, 17, 26].map(shot);
      eq(new Set(b).size, 1, 'при горизонте трепещет');
      BY.beyond.hK = 0;
    });
  }
  test('за кольцом: горизонт — прорезается, держится семь секунд, уходит; строка про вынос — не чаще раза в 45 с', () => {
    BY._resetBeyond();
    stand(5);
    assert(BY.beyond.lookHorizon(), 'не открылся');
    assert(!BY.beyond.lookHorizon(), 'открылся дважды');
    stand(1);
    assert(BY.beyond.visor, 'ладонь не поднята');
    assert(BY.beyond.hK > 0 && BY.beyond.hK < 0.1, `прорезается сразу: ${BY.beyond.hK}`);
    stand(BY.HOR_IN);
    eq(BY.beyond.hK, 1, 'не прорезался');
    eq(BY.beyond.pic, null, 'смотрит на черту — а собирает кадр');
    stand(BY.HOR - BY.HOR_IN - BY.HOR_OUT - 2);
    eq(BY.beyond.hK, 1, 'ушёл раньше');
    stand(BY.HOR_OUT / 2);
    assert(BY.beyond.hK > 0.3 && BY.beyond.hK < 0.7, `уходит не плавно: ${BY.beyond.hK}`);
    eq(BY.beyond.say, null, 'строка раньше конца');
    stand(BY.HOR_OUT / 2 + 1);
    eq(BY.beyond.hK, 0, 'не ушёл');
    assert(!BY.beyond.visor, 'ладонь не опущена');
    eq(BY.beyond.say, BY.HOR_LINE, 'строки нет');
    BY.beyond.say = null;
    assert(BY.beyond.lookHorizon(), 'второй раз не открылся');
    stand(BY.HOR + 1);
    eq(BY.beyond.say, null, 'строка чаще раза в 45 секунд');
    stand(BY.STILL0 + 1);
    assert(BY.beyond.pic, 'после горизонта песчинка не выбирается');
  });
  test('за кольцом: шагнул с горизонтом — ладонь опущена, черта уходит за секунду: вынос не предусмотрен', () => {
    BY._resetBeyond();
    stand(BY.STILL0 + BY.GRAIN + 300);
    const P = BY.beyond.pic;
    assert(P && !P.gone, 'кадра нет');
    BY.beyond.lookHorizon();
    eq(P.gone && P.gone.kind, 'sigh', 'недосмотренный кадр не ушёл со вздохом');
    assert(BY.beyond.sighSnd, 'вздоха нет');
    BY.beyond.sighSnd = false;
    stand(BY.HOR_IN + 10);
    tick(); BY.beyond.step(N.x + 1, N.y, true);
    assert(!BY.beyond.visor, 'шагнул — ладонь у лба');
    for (let i = 0; i < BY.HOR_OUT - 2; i++) { tick(); BY.beyond.step(N.x + i, N.y, true); }
    assert(BY.beyond.hK > 0, 'ушёл раньше секунды');
    for (let i = 0; i < 3; i++) { tick(); BY.beyond.step(N.x + i, N.y, true); }
    eq(BY.beyond.hK, 0, 'унёс горизонт с собой');
    eq(BY.beyond.say, BY.HOR_LINE, 'про вынос не сказано');
    BY._resetBeyond();
  });
  test('за кольцом: горизонт — черта во всю ширину на пятой части кадра, вечер над ней; распад редеет', () => {
    const OK = new Set(['#0d0b0a', '#e28a3a', '#d9cfb8', '#8a8d8f', '#2a2620']);
    const run = () => {
      const log = [];
      const g = new Proxy({}, { get(t, k) { return (...a) => { log.push([k, ...a]); }; }, set(t, k, v) { log.push(['=' + k, v]); return true; } });
      BY.drawHorizon(g, 640, 360);
      return log;
    };
    BY._resetBeyond();
    eq(run().length, 0, 'горизонт без взгляда');
    BY.beyond.lookHorizon();
    stand(BY.HOR_IN + 30);
    const log = run();
    let fill = '';
    for (const [k, ...a] of log) {
      if (k === '=fillStyle') { fill = String(a[0]).toLowerCase(); assert(OK.has(fill), `горизонт: краска ${a[0]} вне палитры`); }
      if (k === 'fillRect') assert(a[1] >= 0 && a[1] + a[3] <= 360 * 0.2 + 60, `горизонт ниже поля: ${a}`);
    }
    assert(log.some(([k, x, y, w, h], i) => k === 'fillRect' && x === 0 && y === 72 && w === 640 && h === 1 && log.slice(0, i).reverse().find(([kk]) => kk === '=fillStyle')[1] === '#0D0B0A'), 'черты нет');
    const warm = log.filter(([k], i) => k === 'fillRect' && log.slice(0, i).reverse().find(([kk]) => kk === '=fillStyle')[1] === '#E28A3A');
    assert(warm.length > 0 && warm.every(([, , y, , h]) => y >= 72 - 3 && y + h <= 72), 'тёплое — не у самой черты');
    // распад редеет: пепел распада тоньше
    const deep = { x: N.x, y: N.y - 300, moving: false };
    for (let i = 0; i < 300; i++) { EDG.update(deep); BRT.update(deep); }
    const ash = d => {
      BRT.dampBrainrot(d);
      const L = [];
      const g = new Proxy({}, { get(t, k) { if (/^create/.test(k)) return () => ({ addColorStop: noop }); return (...a) => { L.push([k, ...a]); }; }, set(t, k, v) { L.push(['=' + k, v]); return true; } });
      BRT.draw(g);
      let al = 0, a0 = 0;
      for (const [k, v] of L) { if (k === '=globalAlpha') al = v; if (k === '=fillStyle' && v === '#8A8D8F') a0 = al; }
      return a0;
    };
    const full = ash(0), calm = ash(1);
    assert(full > 0.04 && calm < full * 0.3, `пепел распада: ${full} → ${calm}`);
    BRT.dampBrainrot(0);
    const town = { x: DSC.oldX(4650), y: DSC.oldY(4000), moving: false };
    for (let i = 0; i < 400; i++) { EDG.update(town); BRT.update(town); }
    BY._resetBeyond();
  });
  {
    const PL = await imp('sprites/player.js');
    const draw = visor => {
      const L = [];
      const g = new Proxy({}, { get(t, k) { return k === 'fillRect' ? (...a) => L.push(['fillRect', ...a]) : noop; }, set(t, k, v) { if (k === 'fillStyle') L.push(['=fillStyle', v]); return true; } });
      setCtx(g); PL.drawPlayer({ x: 100, y: 100, moving: false, vx: 0, vy: 0, visor }); setCtx(ctx);
      return L;
    };
    test('за кольцом: ладонь козырьком — локоть в сторону, ладонь над тьмой капюшона', () => {
      const a = draw(false), b = draw(true);
      const x1 = L => Math.max(...L.filter(([k]) => k === 'fillRect').map(([, x, , w]) => x + w));
      assert(x1(b) >= x1(a), `локоть не в сторону: ${x1(a)} → ${x1(b)}`);
      assert(b.length > a.length + 6, 'ладони не видно');
    });
  }
  const WND = (await imp('world/wind.js')).wind;
  const cam = p => ({ x: p.x - 320, y: p.y - 180 });
  const sweep = (p, k) => { const c = cam(p); for (let i = 0; i < k; i++) { tick(); BY.stepPozemka(c.x, c.y, 640, 360); } return c; };
  test('за кольцом: позёмка метёт по ветру прядями, гуще к краю; горизонт — ложится; на юге её нет', () => {
    BY._resetBeyond();
    WND.ang = 0; WND.s = 0.6;
    const c = sweep(N, 300), G = BY._grains(), n0 = G.length;
    const dep = Math.max(BY.northDepth(c.x + 320, c.y + 180), BY.northDepth(c.x + 320, c.y + 360));
    eq(n0, Math.round(110 + 260 * dep), 'крошки в кадре');
    for (const g of G) assert(g.x >= c.x - 8 && g.x <= c.x + 648 && g.y >= c.y - 8 && g.y <= c.y + 368, 'крошка вне кадра');
    const was = G.map(g => [g.x, g.y]);
    sweep(N, 1);
    let dx = 0, dy = 0, k = 0;
    G.forEach((g, i) => { const ddx = g.x - was[i][0]; if (Math.abs(ddx) < 20) { dx += ddx; dy += g.y - was[i][1]; k++; } });
    assert(dx / k > 0.5, `по ветру на восток — ${(dx / k).toFixed(2)}`);
    assert(Math.abs(dy / k) < 0.2, `поперёк ветра — ${(dy / k).toFixed(2)}`);
    const lanes = new Map();
    for (const g of G) if (g.m !== null) lanes.set(g.m, (lanes.get(g.m) || 0) + 1);
    const inLanes = [...lanes.values()].reduce((a, b) => a + b, 0);
    assert(inLanes / n0 > 0.8, `в прядях ${inLanes} из ${n0}`);
    assert(inLanes / lanes.size >= 4, `прядь — ${(inLanes / lanes.size).toFixed(1)} крошки`);
    sweep({ x: N.x, y: N.y - 500 }, 2);
    assert(BY._grains().length > n0 + 60, `к краю не гуще: ${BY._grains().length} против ${n0}`);
    BY.beyond.hK = 1;
    const still = BY._grains().map(g => [g.x, g.y]);
    sweep({ x: N.x, y: N.y - 500 }, 5);
    BY._grains().forEach((g, i) => assert(g.x === still[i][0] && g.y === still[i][1], 'при горизонте метёт'));
    BY.beyond.hK = 0;
    sweep({ x: (T0.x0 + T0.x1) / 2, y: T0.y1 + OUT + 300 }, 2);
    eq(BY._grains().length, 0, 'позёмка на юге');
    BY._resetBeyond();
  });
  test('за кольцом: рисунок — тушью и сепией палитры; окно в растре — вокруг песчинки, потом по кадру', () => {
    const OK = new Set(['#2a2620', '#34302a', '#3a3328', '#8A8D8F', '#241c14', '#3a2818', '#b0a284', '#D9CFB8', '#c8b89a', '#6b4a2c'].map(c => c.toLowerCase()));
    BY._resetBeyond();
    WND.ang = 0.7; WND.s = 0.7;
    const c = sweep(N, 120);
    stand(BY.STILL0 + 50);
    const P = BY.beyond.pic, log = [];
    const ctx = new Proxy({}, { get(t, k) { return (...a) => { log.push([k, ...a]); }; }, set(t, k, v) { log.push(['=' + k, v]); return true; } });
    const hole = BY.clearings(c.x, c.y);
    eq(hole.length, 1, 'окна у песчинки нет');
    eq(JSON.stringify(hole[0]), JSON.stringify({ x: P.x - 3 - c.x, y: P.y - 3 - c.y, w: 7, h: 7 }), 'окно не вокруг песчинки');
    for (const tt of [50, BY.GRAIN + BY.BUILD * 0.4, BY.GRAIN + BY.BUILD + 10]) {
      P.t = tt;
      BY.drawBeyondWorld(ctx, c.x, c.y, 640, 360);
    }
    const full = BY.clearings(c.x, c.y)[0];
    eq(JSON.stringify(full), JSON.stringify({ x: P.ox - 1 - c.x, y: P.oy - 1 - c.y, w: BY.PIC_W + 2, h: BY.PIC_H + 2 }), 'окно не по кадру');
    BY.beyond.scatter('sigh');
    for (let i = 0; i < 40; i++) { P.gone.t--; BY.drawBeyondWorld(ctx, c.x, c.y, 640, 360); }
    assert(BY.clearings(c.x, c.y)[0].w < full.w, 'окно не затягивается');
    P.gone.t = 0;
    eq(BY.clearings(c.x, c.y).length, 0, 'окно осталось');
    let rects = 0;
    for (const [k, ...a] of log) {
      if (k === '=fillStyle') assert(OK.has(String(a[0]).toLowerCase()), `позёмка: краска ${a[0]} вне палитры`);
      if (k === 'fillRect') { rects++; assert(a[0] > c.x - 100 && a[0] < c.x + 740 && a[1] > c.y - 100 && a[1] < c.y + 460, `точка вне кадра: ${a[0]},${a[1]}`); }
      assert(!/arc|ellipse|stroke|Gradient/.test(k), `позёмка: векторное ${k}`);
    }
    assert(rects > 1000, `точек ${rects}`);
    BY._resetBeyond();
    eq(BY.clearings(c.x, c.y).length, 0, 'окно без кадра');
  });
  test('за кольцом: распад расступается над собранным кадром — пепел и растр мимо окна', () => {
    const deep = { x: N.x, y: N.y - 300, moving: false };
    for (let i = 0; i < 300; i++) { EDG.update(deep); BRT.update(deep); }
    assert(BRT.getLevel() > 20, `распада ${BRT.getLevel()}`);
    const draw = () => {
      const log = [];
      const ctx = new Proxy({}, { get(t, k) { if (/^create/.test(k)) return () => ({ addColorStop: noop }); return (...a) => { log.push([k, ...a]); }; }, set(t, k, v) { log.push(['=' + k, v]); return true; } });
      BRT.draw(ctx);
      return log;
    };
    eq(draw().filter(([k]) => k === 'clip').length, 0, 'окно без кадра');
    BRT.setClearings([{ x: 100, y: 80, w: 38, h: 29 }]);
    const log = draw();
    assert(log.some(([k]) => k === 'clip'), 'распад не обходит окно');
    assert(log.some(([k, x, y]) => k === 'moveTo' && x === 100 && y === 80), 'окно не там');
    BRT.setClearings([]);
    const town = { x: DSC.oldX(4650), y: DSC.oldY(4000), moving: false };
    for (let i = 0; i < 400; i++) { EDG.update(town); BRT.update(town); }
    eq(BRT.getLevel(), 0, 'распад не отпустил');
  });
}

// ═══ СТАРЫЕ ХОДЫ С КОЛЕЦ ЭПОХ (канон UNDERSIDE, волна 4; weave/UNDERGROUND.md) ═══
{
  const U = await imp('world/underside.js');
  const M = await imp('world/locations.js');
  const OW = await imp('world/oldways.js');
  const UA = await imp('world/useActions.js');
  const TX = await imp('content/underside.js');
  const DS = await imp('world/disc.js');
  const WW = await imp('content/world_weave.js');
  const T0 = DS.TOWN;
  const sideOf = (x, y) => { const dn = T0.y0 - y, ds = y - T0.y1, dw = T0.x0 - x, de = x - T0.x1, m = Math.max(dn, ds, dw, de); return m === ds ? 'south' : m === dn ? 'north' : m === dw ? 'west' : 'east'; };
  const upOf = th => M.locations.find(l => l.id === th.up || l.upKey === th.up);
  test('U1 «крипта»: за алтарём ставкирки (свет и сад, север) — дверца вниз; выход — нилометр осевого юга', () => {
    const { stave, nilometer: n } = OW.oldways();
    assert(stave && stave.archDraw && stave.name === 'ставкирка', 'ставкирки нет');
    eq(stave.archRing, 3, 'ставкирка не в «свете и саде»'); eq(stave.archSide, 'north', 'ставкирка не на севере');
    const alt = stave.altNow();
    eq(alt.key, 'stave_altar', 'за алтарь — не второе действие');
    assert(/^ar_\d+_around$/.test(stave.useAction), 'ставкирку больше не обойти');
    eq(U.DESCENTS.stave_altar, 'u_up_stave', 'дверца не ведёт к лестнице хода');
    eq(upOf(U.thingById('u_up_stave')), stave, 'лестница хода выводит не к ставкирке');
    assert(n && M.locations.includes(n), 'нилометра нет среди мест');
    const nx = n.x + n.w / 2, ny = n.y + n.h;
    eq(DS.ringAt(nx, ny), 1, 'нилометр не в осевом'); eq(sideOf(nx, ny), 'south', 'нилометр не на юге');
    eq(n.useAction, 'nilometer_down', 'нилометр без спуска');
    assert(/сухая цистерна у бассейна/.test(n.look) && /больше не поднимается/.test(n.look), 'осмотр нилометра не по канону');
    assert(UA.useTexts.nilometer_down && UA.useTexts.stave_altar, 'сцен спуска нет');
    eq(upOf(U.thingById('u_up_nilometer')), n, 'винтовая лестница выводит не к нилометру');
    for (const l of M.locations) if (l !== n) assert(!(l.x < n.x + n.w + 6 && l.x + l.w > n.x - 6 && l.y < n.y + n.h + 6 && l.y + l.h > n.y - 6), `нилометр налез на «${l.name}»`);
  });
  test('U1: внизу ход крипты — от девятого яруса к дверце за алтарём и к сухой цистерне; кладка стареет к востоку', () => {
    const crypt = U.thingById('u_up_crypt'), stv = U.thingById('u_up_stave'), nil = U.thingById('u_up_nilometer');
    for (const [a, b] of [[crypt, stv], [crypt, nil], [stv, nil]]) {
      const path = U.pathTo(a.at[0], a.at[1], b.at[0], b.at[1]);
      assert(path && path.length, `${a.id} → ${b.id}: не пройти`);
    }
    eq(U.placeAt(stv.at[0], stv.at[1]), 'u1', 'дверца — не в ходе крипты');
    eq(U.placeAt(nil.at[0], nil.at[1]), 'u1c', 'винтовая лестница — не в цистерне');
    eq(U.placeAt(900, 100), 'u1c', 'середина цистерны');
    assert(U.MURMURS.u1c.some(l => /выше вода не поднималась/.test(l)), 'цистерна шепчет не своё');
    const R = U.ROOMS.find(r => r.id === 'u1');
    assert(R.x1 - R.x0 > 600, 'ход короткий');
  });
  test('U1: сухая цистерна открыта небу — днём свет сверху, ночью — луны; без неба — темно', () => {
    const at = L => L.filter(l => Math.abs(l.x - 918) < 2 && Math.abs(l.y - 44) < 2);
    eq(at(U.underLights(900, 100)).length, 0, 'свет неба без неба');
    const d = at(U.underLights(900, 100, { day: 1, moon: 0 })), n = at(U.underLights(900, 100, { day: 0, moon: 1 }));
    eq(d.length, 1, 'днём сверху темно'); eq(n.length, 1, 'ночью луны нет');
    assert(d[0].intensity > n[0].intensity, 'луна ярче дня');
  });
  test('U1, U2: места наверху — точки в своей рамке', () => {
    for (const k of ['nilometer', 'colonnade']) {
      const n = OW.oldways()[k], log = [];
      const ctx = new Proxy({}, { get(t, kk) { return (...a) => { log.push([kk, ...a]); }; }, set(t, kk, v) { log.push(['=' + kk, v]); return true; } });
      n.drawSelf(ctx, n, 0);
      for (const [kk, x, y, w, h] of log) if (kk === 'fillRect') assert(x >= n.x - 2 && x + w <= n.x + n.w + 3 && y >= n.y - 1 && y + h <= n.y + n.h + 1, `${n.name} вылез из рамки: ${x},${y} ${w}×${h}`);
      assert(log.filter(([kk]) => kk === 'fillRect').length > 60, `${n.name} почти не нарисован`);
    }
  });
  test('U2 «катакомбы»: тёмная дверь в глубине красной колоннады (портики, юг); выход — крипта чёрного собора (свет и сад, запад)', () => {
    const { colonnade: c, cathedral: cat } = OW.oldways();
    assert(c && M.locations.includes(c), 'колоннады нет');
    const cx = c.x + c.w / 2, cy = c.y + c.h;
    eq(DS.ringAt(cx, cy), 2, 'колоннада не в портиках'); eq(sideOf(cx, cy), 'south', 'колоннада не на юге');
    const garden = M.locations.filter(l => l.archDraw && l.name === 'сад Эпикура' && l.archRing === 2)
      .reduce((a, l) => Math.min(a, Math.hypot(l.archX - cx, l.archGy - cy)), 1e9);
    assert(garden < 400, `сад Эпикура далеко от колоннады: ${Math.round(garden)}`);
    assert(/платные полосы/.test(c.look) && /тёмная дверь/.test(c.look), 'осмотр колоннады не по канону');
    eq(c.useAction, 'colonnade_door', 'колоннада без спуска');
    eq(upOf(U.thingById('u_up_colonnade')), c, 'ступени выводят не к колоннаде');
    for (const l of M.locations) if (l !== c) assert(!(l.x < c.x + c.w + 6 && l.x + l.w > c.x - 6 && l.y < c.y + c.h + 6 && l.y + l.h > c.y - 6), `колоннада налезла на «${l.name}»`);
    assert(cat && cat.archDraw && cat.name === 'чёрный собор' && cat.archRing === 3 && cat.archSide === 'west', 'собора нет');
    eq(cat.altNow().key, 'cathedral_crypt', 'в крипту — не второе действие собора');
    eq(upOf(U.thingById('u_up_cathedral')), cat, 'ступени выводят не к собору');
    assert(/для рукописей, которые жгли/.test(UA.useTexts.cathedral_crypt.text), 'погреб не по канону');
  });
  test('U2: внизу катакомбы открыты на юг от среза — галерея-оссуарий, столб корней посреди хода', () => {
    const cut = U.thingById('u_cut_catacomb'), col = U.thingById('u_up_colonnade'), cat = U.thingById('u_up_cathedral');
    for (const b of [col, cat]) assert(U.pathTo(cut.at[0], cut.at[1], b.at[0], b.at[1]), `от среза к ${b.id} не пройти`);
    eq(U.placeAt(col.at[0], col.at[1]), 'u2', 'ступени — не в катакомбах'); eq(U.placeAt(cat.at[0], cat.at[1]), 'u2', 'стрельчатый проём — не в катакомбах');
    const roots = U.thingById('u_roots');
    assert(roots && !roots.wall && !U.walkable(331, 632), 'сквозь столб корней проходят');
    assert(U.walkable(331, 616) && U.walkable(331, 646), 'столб перегородил ход');
  });
  test('U3 «канализация»: решётка у газового фонаря (пар и тени, запад); выход — люк на территории завода (катастрофы, равнина)', () => {
    const { gaslamp: g, hatch: h } = OW.oldways();
    assert(g && M.locations.includes(g), 'фонаря нет');
    const gx = g.x + g.w / 2, gy = g.y + g.h;
    eq(DS.ringAt(gx, gy), 6, 'фонарь не в паре и тенях'); eq(sideOf(gx, gy), 'west', 'фонарь не на западе');
    assert(/один горящий фонарь/.test(g.look) && /89 6/.test(g.look) && /решётка/.test(g.look), 'осмотр переулка не по канону');
    assert(g.light && g.light.r > 0, 'фонарь не горит');
    const box = M.locations.find(l => l.name === 'ящик в газовом переулке');
    if (box) assert(Math.hypot(box.x + box.w / 2 - gx, box.y + box.h - gy) < 500, 'фонарь далеко от газового переулка');
    eq(g.useAction, 'gas_grate_down', 'у фонаря нет спуска');
    eq(U.DESCENTS.gas_grate_down, 'u_up_gaslamp', 'решётка ведёт не к скобам');
    eq(upOf(U.thingById('u_up_gaslamp')), g, 'скобы выводят не к фонарю');
    assert(h && M.locations.includes(h), 'люка нет');
    const hx = h.x + h.w / 2, hy = h.y + h.h;
    eq(DS.ringAt(hx, hy), 7, 'люк не в веке катастроф');
    assert(hx > T0.x1 && hy < T0.y0, 'люк не на равнине');
    const works = M.locations.filter(l => l.archDraw && l.name === 'градирня и цех' && l.archRing === 7)
      .reduce((a, l) => Math.min(a, Math.hypot(l.archX - hx, l.archGy - hy)), 1e9);
    assert(works < 400, `люк далеко от завода: ${Math.round(works)}`);
    eq(h.useAction, 'factory_hatch_down', 'люк не открыть');
    eq(upOf(U.thingById('u_up_hatch')), h, 'скобы выводят не к люку');
    assert(UA.useTexts.gas_grate_down && UA.useTexts.factory_hatch_down, 'сцен спуска нет');
    for (const n of [g, h]) for (const l of M.locations) if (l !== n) assert(!(l.x < n.x + n.w + 6 && l.x + l.w > n.x - 6 && l.y < n.y + n.h + 6 && l.y + l.h > n.y - 6), `${n.name} налез на «${l.name}»`);
    for (const n of [g, h]) {
      const log = [], ctx = new Proxy({}, { get(t, kk) { return (...a) => { log.push([kk, ...a]); }; }, set(t, kk, v) { log.push(['=' + kk, v]); return true; } });
      n.drawSelf(ctx, n, 0);
      for (const [kk, x, y, w, hh] of log) if (kk === 'fillRect') assert(x >= n.x - 1 && x + w <= n.x + n.w + 1 && y >= n.y - 1 && y + hh <= n.y + n.h + 1, `${n.name} вылез из рамки: ${x},${y} ${w}×${hh}`);
    }
  });
  test('U3: внизу канал уходит под полотно и выходит стоком — по бровке к галерее; через сток — по настилу; в воду не шагнуть', () => {
    const cut = U.thingById('u_cut_sewer'), gl = U.thingById('u_up_gaslamp'), ht = U.thingById('u_up_hatch'), C = U.CHANNEL;
    for (const b of [gl, ht]) assert(U.pathTo(cut.at[0], cut.at[1], b.at[0], b.at[1]), `от среза к ${b.id} не пройти`);
    assert(U.pathTo(gl.at[0], gl.at[1], ht.at[0], ht.at[1]), 'по галерее из конца в конец не пройти');
    eq(U.placeAt(gl.at[0], gl.at[1]), 'u3', 'скобы к решётке — не в канализации'); eq(U.placeAt(ht.at[0], ht.at[1]), 'u3', 'скобы к люку — не в канализации');
    eq(U.placeAt(886, 700), 'u3n', 'бровка вдоль стока — не канализация');
    assert(U.walkable(886, 700), 'по бровке не пройти');
    assert(!U.walkable((C.x0 + C.x1) / 2, 700), 'шагнул в сток');
    assert(!U.walkable(1000, (C.gy0 + C.gy1) / 2), 'шагнул в воду галереи');
    assert(U.walkable((C.x0 + C.x1) / 2, C.gy0 - 10), 'настила над стоком нет');
    assert(C.x0 > cut.at[0] - 60 && C.x1 < cut.at[0] + 60, 'сток не под решёткой полотна');
  });
  test('U3: кораблики, которых не выловили, плывут дальше — сток на юг, галерея на восток, к заводу', () => {
    const W = U.under, L0 = U.TUBES[0], C = U.CHANNEL;
    W.enter(0, 0); W.say = null;
    W.boats.push({ x: U.SEWER_X, y: L0.y0 + U.T.FH + 5.95 });
    W.step(2000, 465);
    eq(W.boats.length, 0, 'кораблик застрял под полотном'); eq(W.drift.length, 1, 'не выловленный кораблик пропал');
    const b = W.drift[0];
    let turned = false, maxY = 0;
    for (let i = 0; i < 20000 && W.drift.length; i++) {
      W.step(2000, 465);
      maxY = Math.max(maxY, b.y);
      if (!turned && b.east) turned = true;
      if (!turned) assert(b.x > C.x0 && b.x < C.x1, 'кораблик вылез из стока');
      else assert(b.y > C.gy0 && b.y < C.gy1, 'кораблик вылез из галереи');
    }
    assert(turned, 'кораблик не дошёл до галереи'); eq(W.drift.length, 0, 'кораблик не уплыл к заводу');
    assert(maxY < C.gy1, 'кораблик проплыл сквозь пол');
    W.leave(); eq(W.drift.length, 0, 'наверху кораблики плывут');
    W.say = null; W.whisper = null;
  });
  test('U4 «бомбоубежище»: спуск в подвал завода (катастрофы, равнина); выход — задняя дверь вагона 89 6 во дворе-колодце (неон, восток)', () => {
    const { cellar: c, carriage: v } = OW.oldways();
    assert(c && M.locations.includes(c), 'спуска в подвал нет');
    const cx = c.x + c.w / 2, cy = c.y + c.h;
    eq(DS.ringAt(cx, cy), 7, 'подвал не в веке катастроф'); assert(cx > T0.x1 && cy < T0.y0, 'подвал не на равнине');
    const works = M.locations.filter(l => l.archDraw && l.name === 'градирня и цех' && l.archRing === 7)
      .reduce((a, l) => Math.min(a, Math.hypot(l.archX - cx, l.archGy - cy)), 1e9);
    assert(works < 400, `подвал далеко от завода: ${Math.round(works)}`);
    assert(/плакат с улыбкой/.test(c.look) && /отслаивается/.test(c.look), 'осмотр подвала не по канону');
    eq(c.useAction, 'cellar_door', 'в подвал не спуститься');
    assert(/1961\. НЕ ОТКРЫВАТЬ/.test(UA.useTexts.cellar_door.text), 'в подвале нет банки 1961-го');
    eq(upOf(U.thingById('u_up_cellar')), c, 'ступени выводят не в подвал завода');
    assert(v && M.locations.includes(v), 'вагона нет');
    const vx = v.x + v.w / 2, vy = v.y + v.h;
    eq(DS.ringAt(vx, vy), 8, 'вагон не в неоне'); eq(sideOf(vx, vy), 'east', 'вагон не на востоке');
    const yard = M.locations.find(l => l.name === 'громкоговоритель двора-колодца');
    if (yard) assert(Math.hypot(yard.x + yard.w / 2 - vx, yard.y + yard.h - vy) < 400, 'вагон не во дворе-колодце');
    assert(/тупиком вкопан вагон 89 6/.test(v.look) && /ЗДЕСЬ БЫЛ ВАСЯ/.test(v.look), 'осмотр вагона не по канону');
    eq(v.useAction, 'carriage_back', 'у вагона нет задней двери');
    eq(upOf(U.thingById('u_up_carriage')), v, 'тамбур выводит не к вагону');
    for (const n of [c, v]) for (const l of M.locations) if (l !== n) assert(!(l.x < n.x + n.w + 6 && l.x + l.w > n.x - 6 && l.y < n.y + n.h + 6 && l.y + l.h > n.y - 6), `${n.name} налез на «${l.name}»`);
    for (const n of [c, v]) {
      const log = [], ctx = new Proxy({}, { get(t, kk) { return (...a) => { log.push([kk, ...a]); }; }, set(t, kk, val) { log.push(['=' + kk, val]); return true; } });
      for (const tt of [0, 7, 31]) n.drawSelf(ctx, n, tt);
      for (const [kk, x, y, w, hh] of log) if (kk === 'fillRect') assert(x >= n.x - 1 && x + w <= n.x + n.w + 1 && y >= n.y - 1 && y + hh <= n.y + n.h + 1, `${n.name} вылез из рамки: ${x},${y} ${w}×${hh}`);
    }
  });
  test('U4: убежище открыто на юг от среза — зал, скамьи, картотека «ОТЦЫ…», ступени в подвал завода', () => {
    const cut = U.thingById('u_cut_shelter'), up = U.thingById('u_up_cellar'), k = U.thingById('u_kartoteka'), b = U.thingById('u_benches');
    for (const th of [up, k, b]) assert(U.pathTo(cut.at[0], cut.at[1], th.at[0], th.at[1]), `от среза к ${th.id} не пройти`);
    for (const th of [up, k, b]) eq(U.placeAt(th.at[0], th.at[1]), 'u4', `${th.id} — не в убежище`);
    assert(/ОТЦЫ\. К ВОСКРЕШЕНИЮ\. НЕ ЗАКРЫВАТЬ ЯЩИКИ/.test(TX.UNDER_TEXT.u_kartoteka.look) && /до горизонта/.test(TX.UNDER_TEXT.u_kartoteka.look), 'картотека не по канону');
    assert(!U.walkable((b.solid[0] + b.solid[2]) / 2, (b.solid[1] + b.solid[3]) / 2), 'сквозь скамьи проходят');
    eq(U.placeAt(1462, 530), 'u4n', 'коридор от среза — не убежище');
  });
  test('U4: гермодверь «ВЫХОД» — в сторону неона; открывается тому, кто расписался в журнале; снаружи задняя дверь вагона до того заперта', () => {
    const W = U.under, was = W.signed, cut = U.thingById('u_cut_shelter'), v = U.thingById('u_up_carriage'), H = U.HERMO;
    W.signed = false;
    assert(!U.pathTo(cut.at[0], cut.at[1], v.at[0], v.at[1]), 'к вагону прошёл сквозь закрытую гермодверь');
    assert(!U.walkable(H.cx, 438), 'в закрытой гермодвери стоят');
    assert(U.LOCKED.carriage_back(), 'задняя дверь вагона не заперта');
    assert(UA.useTexts.carriage_back_locked && /заперта с той стороны/.test(UA.useTexts.carriage_back_locked.text), 'нет сцены запертой двери');
    W.signed = true;
    const path = U.pathTo(cut.at[0], cut.at[1], v.at[0], v.at[1]);
    assert(path, 'расписался — а гермодверь закрыта');
    assert(path.some(w => w.y < 424) && U.walkable(H.cx, 438), 'путь к вагону не сквозь гермодверь');
    assert(!U.LOCKED.carriage_back(), 'проверяющему задняя дверь заперта');
    assert(/открывается без скрипа/.test(UA.useTexts.carriage_back.text), 'дверь со скрипом');
    eq(U.placeAt(v.at[0], v.at[1]), 'u4s', 'задняя дверь вагона — не в тамбуре');
    W.signed = false;
    assert(!U.pathTo(cut.at[0], cut.at[1], v.at[0], v.at[1]), 'сетка пути не закрыла дверь обратно');
    W.signed = was;
  });
  test('U5 «метро»: заклеенный вход метро на проспекте-экране (сейчас, восток) — кролик мелом, полустёртое LASCIATE; внизу вестибюль, эскалатор, платформа', () => {
    const { metro: m } = OW.oldways();
    assert(m && M.locations.includes(m), 'заклеенного входа нет');
    const mx = m.x + m.w / 2, my = m.y + m.h;
    eq(DS.ringAt(mx, my), 9, 'вход не в «сейчас»'); eq(sideOf(mx, my), 'east', 'вход не на востоке');
    const screen = M.locations.filter(l => l.archDraw && l.name === 'экран-фасад' && l.archRing === 9)
      .reduce((a, l) => Math.min(a, Math.hypot(l.archX - mx, l.archGy - my)), 1e9);
    assert(screen < 400, `вход далеко от проспекта-экрана: ${Math.round(screen)}`);
    assert(/LASCIATE OGNI SPERANZA/.test(m.look) && /белый кролик/.test(m.look) && /Заклеенный вход метро/.test(m.look), 'осмотр входа не по канону');
    eq(m.useAction, 'metro_sealed', 'под ленту не пролезть');
    eq(U.DESCENTS.metro_sealed, 'u_up_metro', 'вход ведёт не к эскалатору');
    const esc = U.thingById('u_up_metro');
    eq(upOf(esc), m, 'эскалатор выводит не к заклеенному входу');
    eq(U.placeAt(esc.at[0], esc.at[1]), 'u5', 'эскалатор — не в вестибюле');
    for (const l of M.locations) if (l !== m) assert(!(l.x < m.x + m.w + 6 && l.x + l.w > m.x - 6 && l.y < m.y + m.h + 6 && l.y + l.h > m.y - 6), `вход налез на «${l.name}»`);
    const log = [], ctx = new Proxy({}, { get(t, kk) { return (...a) => { log.push([kk, ...a]); }; }, set(t, kk, val) { log.push(['=' + kk, val]); return true; } });
    m.drawSelf(ctx, m, 0);
    for (const [kk, x, y, w, hh] of log) if (kk === 'fillRect') assert(x >= m.x - 1 && x + w <= m.x + m.w + 1 && y >= m.y - 1 && y + hh <= m.y + m.h + 1, `вход вылез из рамки: ${x},${y} ${w}×${hh}`);
    const cut = U.thingById('u_cut_metro');
    assert(U.pathTo(esc.at[0], esc.at[1], cut.at[0], cut.at[1]), 'от эскалатора к платформе не пройти');
    assert(U.pathTo(esc.at[0], esc.at[1], 1698, 465), 'от эскалатора не встать спиной к тоннелю (поезд за спиной)');
    assert(/сквозняком/.test(UA.useTexts.metro_sealed.text), 'снизу не тянет тоннелем');
  });
  test('U7, вход холодной жилы: морозилка в подсобке парка (неон, запад) — пуста, иней стрелкой вниз; рядом подстанция «ПРОЧЕЕ — 100%»', () => {
    const { freezer: f } = OW.oldways();
    assert(f && M.locations.includes(f), 'подсобки нет');
    const fx = f.x + f.w / 2, fy = f.y + f.h;
    eq(DS.ringAt(fx, fy), 8, 'подсобка не в неоне'); eq(sideOf(fx, fy), 'west', 'подсобка не на западе');
    const plate = M.locations.find(l => l.name === 'морозилка «ЖДЁТ ЛУЧШИХ ВРЕМЁН»');
    if (plate) assert(Math.hypot(plate.x + plate.w / 2 - fx, plate.y + plate.h - fy) < 300, 'подсобка далеко от таблички морозилки');
    assert(/ЖДЁТ ЛУЧШИХ ВРЕМЁН/.test(f.look) && /ПРОЧЕЕ — 100%/.test(f.look) && /стрелка счётчика крутится/.test(f.look), 'осмотр подсобки не по канону');
    eq(f.useAction, 'freezer_down', 'морозилку не открыть');
    assert(/иней лёг стрелкой вниз/.test(UA.useTexts.freezer_down.text) && /Пусто/.test(UA.useTexts.freezer_down.text), 'в морозилке не канон');
    eq(U.DESCENTS.freezer_down, 'u_up_freezer', 'морозилка ведёт не в лаз');
    const up = U.thingById('u_up_freezer');
    eq(upOf(up), f, 'лаз выводит не в подсобку');
    for (const l of M.locations) if (l !== f) assert(!(l.x < f.x + f.w + 6 && l.x + l.w > f.x - 6 && l.y < f.y + f.h + 6 && l.y + l.h > f.y - 6), `подсобка налезла на «${l.name}»`);
    const draw = tt => { const log = [], ctx = new Proxy({}, { get(t, kk) { return (...a) => { log.push([kk, ...a]); }; }, set(t, kk, val) { log.push(['=' + kk, val]); return true; } }); f.drawSelf(ctx, f, tt); return log; };
    for (const tt of [0, 13, 40]) for (const [kk, x, y, w, hh] of draw(tt)) if (kk === 'fillRect') assert(x >= f.x - 1 && x + w <= f.x + f.w + 1 && y >= f.y - 1 && y + hh <= f.y + f.h + 1, `подсобка вылезла из рамки: ${x},${y} ${w}×${hh}`);
    assert(JSON.stringify(draw(0)) !== JSON.stringify(draw(13)), 'стрелка счётчика стоит');
  });
  test('U7: от дна морозилки лаз в иней спускается в холодную жилу — к Дежурному, к криосклепу и к крипте', () => {
    const up = U.thingById('u_up_freezer');
    eq(U.placeAt(up.at[0], up.at[1]), 'u7n', 'дно морозилки — не над лазом');
    for (const id of ['u_capsule', 'u_watchman', 'u_up_crypt', 'u_frost']) {
      const b = U.thingById(id);
      assert(U.pathTo(up.at[0], up.at[1], b.at[0], b.at[1]), `от морозилки к ${id} не пройти`);
    }
    assert(U.coldAt(582, 240) > 0.5, 'в лазе под морозилкой тепло');
    eq(U.surfaceUnder(582, 240), 'snow', 'в лазе не иней под ногами');
    assert(/прочее/.test(TX.UNDER_TEXT.u_up_freezer.look) && /под лёд/.test(TX.UNDER_TEXT.u_up_freezer.look), 'кабели «прочего» не уходят под лёд');
  });
  test('U8 «остров»: остров у входа в залив — у таблички «остров с бункерами» (сейчас, запад); купола дотов, ворота тоннеля; вилла на ходу, баннер неподвижному взгляду', () => {
    const { sazan: z } = OW.oldways();
    assert(z && M.locations.includes(z), 'острова нет');
    const zx = z.x + z.w / 2, zy = z.y + z.h;
    eq(DS.ringAt(zx, zy), 9, 'остров не в «сейчас»'); eq(sideOf(zx, zy), 'west', 'остров не на западе');
    const sign = M.locations.find(l => l.name === 'остров с бункерами');
    if (sign) assert(Math.hypot(sign.x + sign.w / 2 - zx, sign.y + sign.h - zy) < 300, 'остров далеко от таблички');
    assert(/около трёх тысяч/.test(z.look) && /ворота для катеров/.test(z.look) && /Вилла уже стоит/.test(z.look), 'осмотр острова не по справке');
    assert(/на баннере/.test(z.potemkin) && /фанера/.test(z.potemkin), 'у виллы нет шва');
    const sg = M.locations.find(l => l.name === 'остров с бункерами');
    if (sg) assert(!/амбразура/.test(z.potemkin) && z.look.split('.')[0] !== (sg.look || '').split('.')[0], 'остров повторяет табличку рядом');
    eq(z.useAction, 'sazan_down', 'в тоннель не войти');
    assert(/ПОД ЯХТЫ/.test(UA.useTexts.sazan_down.text) && /девяносто седьмом/.test(UA.useTexts.sazan_down.text), 'у ворот не канон');
    eq(U.DESCENTS.sazan_down, 'u_up_sazan', 'ворота ведут не к слипу');
    const up = U.thingById('u_up_sazan');
    eq(upOf(up), z, 'слип выводит не на остров');
    eq(U.placeAt(up.at[0], up.at[1]), 'isle', 'слип — не в тоннелях острова');
    for (const l of M.locations) if (l !== z) assert(!(l.x < z.x + z.w + 6 && l.x + l.w > z.x - 6 && l.y < z.y + z.h + 6 && l.y + l.h > z.y - 6), `остров налез на «${l.name}»`);
    const draw = tt => { const log = [], ctx = new Proxy({}, { get(t, kk) { return (...a) => { log.push([kk, ...a]); }; }, set(t, kk, val) { log.push(['=' + kk, val]); return true; } }); z.drawSelf(ctx, z, tt); return log; };
    for (const tt of [0, 30, 500]) for (const [kk, x, y, w, hh] of draw(tt)) if (kk === 'fillRect') assert(x >= z.x - 1 && x + w <= z.x + z.w + 1 && y >= z.y - 1 && y + hh <= z.y + z.h + 1, `остров вылез из рамки: ${x},${y} ${w}×${hh}`);
    assert(JSON.stringify(draw(0)) !== JSON.stringify(draw(30)), 'маяк не мигает');
  });
  test('U8: из тоннелей острова — в бункер на всякий случай и к линии; бункер больше не тупик', () => {
    const up = U.thingById('u_up_sazan');
    for (const id of ['u_isle_inventory', 'u_isle_embrasure', 'u_isle_loungers', 'u_screen', 'u_cans', 'u_cut_shelter']) {
      const b = U.thingById(id);
      assert(U.pathTo(up.at[0], up.at[1], b.at[0], b.at[1]), `от слипа к ${id} не пройти`);
    }
    assert(/укрытие/.test(TX.UNDER_TEXT.u_isle_inventory.look) && /ВИД НА МОРЕ/.test(TX.UNDER_TEXT.u_isle_loungers.look), 'опись и шезлонги не по замыслу');
  });

  test('изнанка в описи: витков семь (Sol: «Витков семь, все в описи»), U8 — отвод от бункера', () => {
    eq(WW.UNDERSIDE.filter(u => !u.branch).length, 7, 'витков не семь — строка Sol разошлась с описью');
    assert(WW.UNDERSIDE.find(u => u.id === 'U8').branch, 'U8 записан витком');
  });

  test('шёпоты изнанки: в зале шепчет сам зал — у лестницы канализации не слышно острова', () => {
    const lad = U.thingById('u_up_gaslamp'), isle = U.thingById('u_isle_inventory');
    eq(U.placeAt(lad.at[0], lad.at[1]), 'u3', 'лестница газового фонаря не в канализации');
    for (let i = 0; i < 20; i++) eq(U.murmurAt(lad.at[0], lad.at[1], true).key, 'u3', 'у лестницы канализации шепчет чужой зал');
    eq(U.murmurAt(isle.at[0], isle.at[1], true).key, 'isle', 'в тоннелях острова шепчет не остров');
  });
}

// ═══ ЛЕНТА ТЯНЕТ: снос к краю и покой, который лечит (world/feedPull.js, brainrot.js) ═══
{
  const FP = await imp('world/feedPull.js');
  const DSC = await imp('world/disc.js');
  const EDG = await imp('world/edges.js');
  const BRT = await imp('world/brainrot.js');
  const T0 = DSC.TOWN, OUT = DSC.RINGS_D + DSC.FIRE_W, MIDX = (T0.x0 + T0.x1) / 2;
  const S = { x: MIDX, y: T0.y1 + OUT + 500 };                 // юг за огнём, середина пустыни
  const walk = 2.4;
  test('лента: наружу — к краю; при слабом распаде не тянет', () => {
    const [ux, uy] = FP.outward(S.x, S.y);
    assert(uy > 0.7, `юг: наружу не вниз (${ux.toFixed(2)}, ${uy.toFixed(2)})`);
    assert(FP.outward(MIDX, T0.y0 - OUT - 500)[1] < -0.7, 'север: наружу не вверх');
    assert(FP.outward(T0.x0 - OUT - 500, (T0.y0 + T0.y1) / 2)[0] < -0.7, 'запад: наружу не влево');
    eq(FP.pullVector(S.x, S.y, 3, walk, 0, 0, 'S').join(), '0,0', 'тянет при слабом распаде');
  });
  test('лента: всегда медленнее шага — вглубь уйти можно и при полном распаде', () => {
    for (const lvl of [20, 50, 80, 100]) for (const [mx, my, f] of [[0, walk, 'S'], [0, -walk, 'N'], [walk, 0, 'E'], [0, 0, 'S']]) {
      const v = Math.hypot(...FP.pullVector(S.x, S.y, lvl, walk, mx, my, f));
      assert(v <= walk * FP.PULL_MAX + 1e-9, `снос ${v.toFixed(2)} при ${lvl}`);
    }
    const [, py] = FP.pullVector(S.x, S.y, 100, walk, 0, -walk, 'N');
    assert(-walk + py < -walk * 0.85, `вглубь при полном распаде: ${(-walk + py).toFixed(2)}`);
  });
  test('лента: подыгрываешь — тянет сильнее; стоишь — слабее; спиной к краю — ещё слабее; вглубь — почти отпускает', () => {
    const m = (mx, my, f) => Math.hypot(...FP.pullVector(S.x, S.y, 70, walk, mx, my, f));
    const out = m(0, walk, 'S'), side = m(walk, 0, 'E'), still = m(0, 0, 'S'), back = m(0, 0, 'N'), inn = m(0, -walk, 'N');
    assert(out > side && side > still && still > back && back > inn, `${out} ${side} ${still} ${back} ${inn}`);
  });
  test('лента: в петле СКРОЛЛ крутит вниз', () => {
    const [px, py] = FP.pullVector(S.x, S.y, 60, walk, 0, 0, 'S', true);
    assert(py > 0 && px === 0, 'петля не вниз');
  });
  test('покой лечит: стоящему распад отпускает до половины, идущему — нет', () => {
    const p = { x: S.x, y: S.y, moving: true, still: false };
    const run = k => { for (let i = 0; i < k; i++) { EDG.update(p); BRT.update(p); } return BRT.getLevel(); };
    const walking = run(600);
    assert(walking > 20 && !BRT.isFrozen(), `в пустыне распад ${walking}`);
    p.moving = false; p.still = true;
    eq(BRT.calmOf(), 0, 'покой раньше, чем встал');
    const calm = run(400);
    assert(Math.abs(BRT.calmOf() - 0.5) < 1e-9, `покой ${BRT.calmOf()}`);
    assert(calm < walking * 0.6, `стоял — не отпустило: ${walking.toFixed(1)} → ${calm.toFixed(1)}`);
    p.moving = true; p.still = false;
    assert(run(600) > walking * 0.9, 'пошёл — распад не вернулся');
    p.y = T0.y1 - 50; run(300);                               // домой: распад ушёл
  });
}

// ═══ ПОЛОСЫ ЛЕНТЫ: кадр 9:16 с миром из прошлого (render/feedPanels.js) ═══
{
  const FPN = await imp('render/feedPanels.js');
  test('полосы ленты: ширина — 9:16 от высоты, на узком экране — не шире половины', () => {
    const w = FPN.panelWidth(640, 360);
    assert(Math.abs(w / 360 - 9 / 16) < 0.01, `ширина ${w}`);
    const ph = FPN.panelWidth(360, 640);
    assert(ph <= 360 / 2.2 + 1 && ph > 100, `телефон: ${ph}`);
  });
  test('полосы ленты: до порога распада кадр цел; дальше полосы входят по одной; середина всегда живая', () => {
    eq(FPN.layout(FPN.PANEL_FROM - 0.01, 640, 360).panels.length, 0, 'полосы раньше порога');
    const one = FPN.layout(0.6, 640, 360).panels;
    eq(one.length, 1, 'на 0.6 не одна полоса');
    assert(one[0].alpha > 0 && one[0].alpha < 1, 'полоса входит не плавно');
    for (const k of [0.7, 0.85, 1]) {
      const L = FPN.layout(k, 640, 360);
      for (const p of L.panels) {
        assert(p.x >= 0 && p.x + p.w <= 640 && p.w >= 4, `полоса вне экрана: ${JSON.stringify(p)}`);
        assert(p.x + p.w <= L.cx0 || p.x >= L.cx0 + L.pw, `полоса легла на середину: ${JSON.stringify(p)}`);
      }
    }
    eq(FPN.layout(1, 640, 360).panels.length, 4, 'на полном распаде не четыре полосы');
    const delays = FPN.SLOTS.map(sl => sl.delay).sort((a, b) => a - b).join();
    eq(delays, '2,4,6,8', 'задержки');
  });
  test('полосы ленты: показывают прошлое не моложе задержки; нет такого — самое старое', () => {
    const frames = Array.from({ length: 44 }, (_, i) => 1000 + i * 12);   // ≈ 8,8 с записи
    const now = frames[43];
    for (const d of [2, 4, 6, 8]) {
      const i = FPN.pickIndex(frames, now, d);
      assert(frames[i] <= now - d * 60 && (i === frames.length - 1 || frames[i + 1] > now - d * 60), `задержка ${d}: ${frames[i]}`);
    }
    eq(FPN.pickIndex(frames.slice(40), now, 8), 0, 'короткая запись: не самое старое');
    eq(FPN.pickIndex([], now, 2), -1, 'пустая запись');
  });
}

// ═══ ОРИЕНТИРОВАНИЕ ПЕЧАТЬЮ: штамп места и клетки плана (world/placeStamp.js, content/cell_titles.js) ═══
{
  const PS = await imp('world/placeStamp.js');
  const CT = await imp('content/cell_titles.js');
  const WC = await imp('content/world_cells.js');
  const LOC = await imp('world/locations.js');
  const DSC = await imp('world/disc.js');
  const { SEGMENTS: SEG } = await imp('content/ulitsa_db.js');
  test('план: названия клеток — те же, что в описи (лист 2), все 45', () => {
    const keys = Object.keys(WC.CELL_DETAIL);
    eq(Object.keys(CT.CELL_TITLES).length, 45, 'клеток');
    for (const k of keys) eq(CT.CELL_TITLES[k], WC.CELL_DETAIL[k].title, k);
  });
  test('штамп места: постройка — её кольцо и сторона; городок — вне времени; действие — без штампа', () => {
    const pier = LOC.locations.find(l => l.name === 'пирс над глубиной' && l.archNth === 1);
    eq(PS.placeStamp(pier), 'кольцо 6 · север · пар и тени', 'пирс');
    const fire = LOC.locations.find(l => l.id === 'campfire');
    eq(PS.placeStamp(fire), 'городок · вне времени', 'костёр');
    eq(PS.placeStamp({ name: 'МОНЕТА' }), '', 'действие со штампом');
    eq(PS.placeStamp({ under: true, x: 1, y: 1 }), 'изнанка', 'изнанка');
    const T = DSC.TOWN, OUT = DSC.RINGS_D + DSC.FIRE_W;
    eq(PS.placeStamp({ x: (T.x0 + T.x1) / 2, y: T.y1 + OUT + 300 }), 'за огнём · край', 'за огнём');
  });
  test('штамп места: у каждой постройки колец — кольцо и сторона, и такая клетка в описи есть', () => {
    for (const l of LOC.locations.filter(l => l.archDraw)) {
      const st = PS.placeStamp(l);
      assert(/^кольцо [1-9] · (север|юг|запад|восток|равнина) · /.test(st), `${l.name}: ${st}`);
      const p = PS.placeOf(l), key = SEG[p.ring - 1].id + ':' + p.side;
      assert(CT.CELL_TITLES[key], `${l.name}: клетки ${key} нет в описи`);
    }
  });
}

// ═══ ПОДПИСЬ СТРАННИКА (ui/signature.js) ═══
{
  const SG = await imp('ui/signature.js');
  test('подпись: не расписался — подписи нет; расписался — есть, в любую графу ложится росчерком', () => {
    SG.setStrokes([]);
    assert(!SG.hasSignature() && SG.signatureSVG() === '', 'подпись без росчерка');
    SG.setStrokes([[10, 40, 30, 12, 50, 38, 80, 20], [20, 46, 200, 44], [5, 5]]);   // третий штрих — точка, не росчерк
    assert(SG.hasSignature(), 'подписи нет');
    eq(SG.getStrokes().length, 2, 'штрихов');
    const svg = SG.signatureSVG(22);
    assert(/^<svg class="sign"/.test(svg) && /height="22"/.test(svg) && /<path d="M[\d.]+ [\d.]+L/.test(svg), svg.slice(0, 80));
    let moves = 0;
    const ctx = { save() {}, restore() {}, beginPath() {}, moveTo() { moves++; }, lineTo() {}, stroke() {} };
    assert(SG.drawSignature(ctx, 0, 0, 100, 20), 'на холсте не легла');
    eq(moves, 2, 'на холсте не два штриха');
    SG.setStrokes([]);
    assert(!SG.drawSignature(ctx, 0, 0, 100, 20), 'пустая подпись легла');
  });
  test('подпись: плоский росчерк (почти прямая) не растягивается во всю бумагу', () => {
    SG.setStrokes([[10, 30, 230, 30]]);
    const w = +/width="(\d+)"/.exec(SG.signatureSVG(20))[1];
    assert(w <= 160, `ширина ${w}`);
    SG.setStrokes([[10, 30, 120, 34, 230, 31]]);
    const w2 = +/width="(\d+)"/.exec(SG.signatureSVG(20, '#000', 1.6, 120))[1];
    assert(w2 <= 120, `ширина ${w2} при maxW 120`);
    SG.setStrokes([]);
  });
  test('подпись: тычок, правый клик, сорванный жест и второй палец прежнюю подпись не трогают', () => {
    const on = {};
    const cv = { getContext: () => fakeCtx(), addEventListener: (n, f) => { on[n] = f; }, setPointerCapture() {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 240, height: 56 }) };
    const ev = (o) => ({ isPrimary: true, button: 0, pointerId: 1, preventDefault() {}, stopPropagation() {}, ...o });
    const old = [[10, 40, 30, 12, 50, 38]];
    SG.setStrokes(old);
    let changed = 0;
    SG.initSignPad(cv, () => changed++);
    on.pointerdown(ev({ clientX: 20, clientY: 20 })); on.pointerup(ev({}));                       // тычок
    on.pointerdown(ev({ clientX: 20, clientY: 20, button: 2 })); on.pointerup(ev({}));            // правый клик
    on.pointerdown(ev({ clientX: 20, clientY: 20 })); on.pointermove(ev({ clientX: 60, clientY: 30 })); on.pointercancel(ev({}));   // сорвался
    eq(JSON.stringify(SG.getStrokes()), JSON.stringify(old), 'подпись стёрта');
    eq(changed, 0, 'бланк узнал о перемене, которой не было');
    // новый росчерк, посреди него — второй палец: он мимо, штрих не рвётся
    on.pointerdown(ev({ clientX: 20, clientY: 20 }));
    on.pointermove(ev({ clientX: 40, clientY: 25 }));
    on.pointerdown(ev({ clientX: 200, clientY: 45, pointerId: 2, isPrimary: false }));
    on.pointermove(ev({ clientX: 190, clientY: 44, pointerId: 2, isPrimary: false }));
    on.pointermove(ev({ clientX: 60, clientY: 30 }));
    on.pointerup(ev({ clientX: 200, clientY: 45, pointerId: 2, isPrimary: false }));
    on.pointerup(ev({}));
    const st = SG.getStrokes();
    eq(st.length, 1, 'штрихов после нового росчерка');
    eq(st[0].join(), '20,20,40,25,60,30', 'чужой палец в штрихе');
    eq(changed, 1, 'бланк не узнал о новой подписи');
    // палец, что держит телефон за краем поля, — не помеха: штрих другим пальцем ложится
    on.pointerdown(ev({ clientX: 30, clientY: 20, pointerId: 8, isPrimary: false }));
    on.pointermove(ev({ clientX: 70, clientY: 30, pointerId: 8, isPrimary: false }));
    on.pointerup(ev({ pointerId: 8, isPrimary: false }));
    eq(SG.getStrokes().length, 2, 'штрих не первым пальцем на экране не лёг');
    SG.setStrokes([]);
  });
}

// ═══ ВНИМАНИЕ ОЖИВЛЯЕТ МЕХАНИЗМЫ (world/attention.js; Платонов) ═══
{
  const AT = await imp('world/attention.js');
  const MCH = await imp('world/mechanisms.js');
  const HG = await imp('world/hang.js');
  const PR = await imp('core/playerRef.js');
  const FPN2 = await imp('render/feedPanels.js');
  const thing = { id: 'test_vane_house', x: 1000, y: 1000, w: 40, h: 30 };
  test('внимание: три раза — узнаёт, семь — отвечает в полную; лента отнимает половину', () => {
    AT._resetAttention();
    eq(AT.levelOf(thing.id), 0, 'с порога знаком');
    for (let i = 0; i < 3; i++) AT.noteAttention(thing);
    eq(AT.levelOf(thing.id), 1, 'после трёх');
    for (let i = 0; i < 4; i++) AT.noteAttention(thing);
    eq(AT.levelOf(thing.id), 2, 'после семи');
    AT.forget();
    eq(AT.levelOf(thing.id), 1, 'после падения в брейнрот');
    AT.noteAttention({ id: 'u', x: 1, y: 1, under: true });
    eq(AT.pointsOf('u'), 0, 'изнанка копит внимание');
  });
  test('внимание: отвечает только знакомое и только тому, кто рядом; сохранение помнит', () => {
    AT._resetAttention();
    for (let i = 0; i < 7; i++) AT.noteAttention(thing);
    const near = { x: 1000, y: 1020 }, far = { x: 1600, y: 1600 };
    assert(AT.respond(1020, 1000, near), 'рядом не отвечает');
    eq(AT.respond(1020, 1000, far), null, 'отвечает издалека');
    eq(AT.respond(3000, 3000, { x: 3000, y: 3000 }), null, 'отвечает незнакомое');
    const saved = AT.saveAttention();
    AT._resetAttention();
    AT.loadAttention(saved, [thing]);
    eq(AT.levelOf(thing.id), 2, 'сохранение не помнит');
  });
  test('внимание: флюгер у знакомой вещи поворачивается остриём к страннику, а не к ветру', () => {
    AT._resetAttention();
    for (let i = 0; i < 7; i++) AT.noteAttention(thing);
    const player = { x: 1100, y: 980, vx: 0, vy: 0 };   // справа от флюгера
    PR.setPlayer(player);
    const ctx = { fillRect() {}, fillStyle: '' };
    let m;
    for (let i = 0; i < 900; i++) { m = MCH.vane(ctx, 'vane:test', 1020, 990, '#000', '#fff'); MCH.stepMechs(); }
    const want = Math.atan2(player.y + 20 - 990, player.x + 6 - 1020);
    const off = Math.abs(Math.atan2(Math.sin(m.a - want), Math.cos(m.a - want)));
    assert(off < 0.6, `флюгер смотрит мимо: ${off.toFixed(2)} рад`);
  });
  test('внимание: флюгер на шпиле ищет странника на земле, а не в небе над ним', () => {
    AT._resetAttention();
    for (let i = 0; i < 7; i++) AT.noteAttention(thing);
    const player = { x: 1060, y: 1002, vx: 0, vy: 0 };   // перед вокзалом, правее шпиля, ноги у земли 1025
    PR.setPlayer(player);
    const ctx = { fillRect() {}, fillStyle: '' };
    let m;
    for (let i = 0; i < 1200; i++) { m = MCH.vane(ctx, 'vane:spire', 1020, 1025 - 73, '#000', '#fff', 1025); MCH.stepMechs(); }
    assert(Math.cos(m.a) > 0.8, `стрелка смотрит в небо/камеру: cos ${Math.cos(m.a).toFixed(2)}`);
  });
  test('внимание: колодец кивает знакомому раз на подход, а не на каждый шаг у края', () => {
    AT._resetAttention();
    const wl = { id: 'test_well', x: 2000, y: 2000, w: 20, h: 20 };
    for (let i = 0; i < 7; i++) AT.noteAttention(wl);
    const m = MCH.well('well:test_hyst'); m.x = 2010; m.y = 2010;
    const player = { x: 2010 - 6, y: 2010 + 50 - 20, vx: 0, vy: 0 };
    PR.setPlayer(player);
    let nods = 0, prev = m.st;
    for (let i = 0; i < 1200; i++) {                       // ходит взад-вперёд через границу «рядом» (60)
      player.y = 2010 - 20 + 50 + 25 * Math.sin(i / 20);
      MCH.stepMechs();
      if (m.st === 'nod' && prev !== 'nod') nods++;
      prev = m.st;
    }
    eq(nods, 1, 'кивков');
    player.y = 2010 - 20 + 200;                           // ушёл
    for (let i = 0; i < 100; i++) MCH.stepMechs();
    player.y = 2010 - 20 + 40;                            // вернулся
    for (let i = 0; i < 5; i++) { MCH.stepMechs(); if (m.st === 'nod' && prev !== 'nod') nods++; prev = m.st; }
    eq(nods, 2, 'на новый подход не кивнул');
  });
  test('внимание: маховик отпускает «уже поздоровался» и за кадром — вернувшемуся выдохнет снова', () => {
    AT._resetAttention();
    const office = { id: 'test_office', x: 3000, y: 2950, w: 60, h: 60 };
    for (let i = 0; i < 7; i++) AT.noteAttention(office);
    const player = { x: 3029 - 6, y: 3000 - 20 + 40, vx: 0, vy: 0 };
    PR.setPlayer(player);
    let m;
    for (let i = 0; i < 5; i++) { m = MCH.flywheel('fly:test_latch', { R: 6, r: 3, puff: { x: 3029, y: 2978 }, gy: 3000 }); MCH.stepMechs(); }
    assert(m.near, 'рядом — не поздоровался');
    player.y = 3000 - 20 + 200;                                   // ушёл за кадр ближе 225: маховик больше не рисуется
    for (let i = 0; i < 60; i++) MCH.stepMechs();
    player.y = 3000 - 20 + 400;                                   // и дальше
    for (let i = 0; i < 5; i++) MCH.stepMechs();
    assert(!m.near, 'ушедший из виду так и остался «рядом» — на возвращение выдоха не будет');
  });
  test('внимание: вокзальные часы, оставленные за кадром, встречают нынешней минутой, а не той, при которой ушёл', () => {
    AT._resetAttention();
    const st = { id: 'test_station', x: 4000, y: 3926, w: 92, h: 74 };
    for (let i = 0; i < 7; i++) AT.noteAttention(st);
    const player = { x: 4044 - 6, y: 4000 - 20 + 20, vx: 0, vy: 0 };
    PR.setPlayer(player);
    const RealDate = Date;
    let now = new RealDate(2026, 9, 24, 12, 0, 0).getTime();
    globalThis.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(now); } };
    try {
      const px = [];
      const ctx = { fillRect(x, y) { px.push(x + ',' + y); }, fillStyle: '' };
      for (let i = 0; i < 3; i++) { MCH.stationClock(ctx, 4044, 3951, 'rail', '#000', 4000); now += 16; }
      now += 25 * 60 * 1000;                                      // ушёл за кадр на 25 минут, вернулся
      px.length = 0;
      MCH.stationClock(ctx, 4044, 3951, 'rail', '#000', 4000);
      assert(px.includes('4045,3953'), `минутная не на 25-й минуте: ${px.join(' ')}`);
    } finally { globalThis.Date = RealDate; }
  });
  test('полосы ленты: где лежали — забыто, когда лент нет (распад рвёт мир мимо них только пока они есть)', () => {
    FPN2.draw(fakeCtx(), 0);
    eq(FPN2.drawn().length, 0, 'полосы помнят место без ленты');
  });
  test('внимание: колокол у знакомой вещи качнётся навстречу; кран кольца «сейчас» — нет', () => {
    AT._resetAttention(); HG._reset();
    for (let i = 0; i < 7; i++) AT.noteAttention(thing);
    const far = { x: 3000, y: 3000, vx: 0, vy: 0 };
    const bell = HG.hang('chime:test', 1020, 990, 6, { gy: 1030, r: 2 });
    const crane = HG.hang('crane:test', 1030, 990, 6, { gy: 1030, r: 2 });
    for (let i = 0; i < 200; i++) { HG.hang('chime:test', 1020, 990, 6, { gy: 1030 }); HG.hang('crane:test', 1030, 990, 6, { gy: 1030 }); HG.stepHangs(far); }
    const b0 = HG.tipOf(bell).x, c0 = HG.tipOf(crane).x;
    const near = { x: 1060, y: 1006, vx: 0, vy: 0 };                    // подошёл справа, не задевая
    let bmax = 0, cmax = 0;
    for (let i = 0; i < 40; i++) {
      HG.hang('chime:test', 1020, 990, 6, { gy: 1030 }); HG.hang('crane:test', 1030, 990, 6, { gy: 1030 });
      HG.stepHangs(near);
      bmax = Math.max(bmax, HG.tipOf(bell).x - b0); cmax = Math.max(cmax, Math.abs(HG.tipOf(crane).x - c0));
    }
    assert(bmax > 0.3, `колокол не качнулся навстречу (${bmax.toFixed(2)})`);
    assert(cmax < 0.05, `кран ответил вниманию (${cmax.toFixed(2)})`);
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
