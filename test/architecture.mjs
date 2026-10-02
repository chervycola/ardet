// ═══════════════════════════════════════
// ARCHITECTURE TESTS — постройки эпох: модули колец по контракту,
// раскладка в полосе своего кольца, поодаль от табличек.
// Run: node test/architecture.mjs
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
const { ARCH_BY_RING } = await imp('sprites/arch/index.js');
const { buildArchitecture, buildEnsembles, signFacade } = await imp('world/architecture.js');
const { locations, archEnsembles } = await imp('world/locations.js');
const { TOWN, RING_W, townDist, ringAt, trailPoint } = await imp('world/disc.js');
const { SEGMENTS } = await imp('content/ulitsa_db.js');

const SIDES = ['south', 'east', 'west', 'north', 'plain'];
test('arch: девять колец, у каждого пять сторон и фасады табличек', () => {
  eq(Object.keys(ARCH_BY_RING).length, 9);
  for (const seg of SEGMENTS) {
    const A = ARCH_BY_RING[seg.id];
    assert(A, `нет модуля ${seg.id}`);
    for (const s of SIDES) assert(Array.isArray(A[s]) && A[s].length >= 1, `${seg.id}: пусто на стороне ${s}`);
    for (const s of ['south', 'east', 'west', 'north']) assert(typeof A.sign?.[s] === 'function', `${seg.id}: нет фасада ${s}`);
  }
});

test('arch: постройки по контракту и рисуются без ошибок', () => {
  const ctx = fakeCtx();
  for (const [id, A] of Object.entries(ARCH_BY_RING)) {
    for (const s of SIDES) for (const it of A[s]) {
      assert(typeof it.name === 'string' && it.name, `${id}/${s}: без имени`);
      assert(it.w >= 16 && it.w <= 130 && it.h >= 16 && it.h <= 130, `${id}/${s}/${it.name}: размер ${it.w}×${it.h}`);
      it.draw(ctx, 500, 500, 100);
    }
    for (const fn of Object.values(A.sign)) fn(ctx, 500, 500, 100);
  }
});

const signs = locations.filter(l => l.streetForm);
const decor = buildArchitecture(signs);
test('arch: в каждом кольце стоят постройки, основание — на земле своего кольца', () => {
  for (let n = 1; n <= 9; n++) {
    const inRing = decor.filter(d => d.ring === n);
    assert(inRing.length >= 10, `кольцо ${n}: построек ${inRing.length}`);
    for (const d of inRing) {
      for (const x of [d.x - d.w / 2 + 3, d.x, d.x + d.w / 2 - 3]) {
        const r = ringAt(x, d.gy);
        eq(r, n, `${d.name} (${d.side}) стоит на земле кольца ${r}, а не ${n}`);
      }
    }
  }
});

test('arch: городок вне времени не застроен', () => {
  for (const d of decor) {
    const inside = d.x + d.w / 2 > TOWN.x0 && d.x - d.w / 2 < TOWN.x1 && d.gy > TOWN.y0 && d.gy - d.h < TOWN.y1;
    assert(!inside, `${d.name} залезает в городок`);
  }
});

test('arch: постройки не заслоняют таблички (табличка — впереди или над крышей)', () => {
  for (const d of decor) for (const s of signs) {
    const sx = s.x + s.w / 2, sgy = s.y + s.h;
    if (Math.abs(d.x - sx) >= d.w / 2 + 12) continue;          // в стороне
    const ahead = sgy >= d.gy + 24, overRoof = sgy <= d.gy - d.h - 2;
    assert(ahead || overRoof, `${d.name} заслоняет «${s.name}»`);
  }
});

test('ансамбли: у тропы на каждой стороне каждого кольца — ворота эпохи', () => {
  for (let n = 1; n <= 9; n++) for (const side of ['south', 'north', 'west', 'east']) {
    const g = archEnsembles.find(e => e.ring === n && e.side === side && e.kind === 'gate');
    assert(g && g.members.length >= 1, `кольцо ${n}/${side}: нет ворот`);
    const tp = trailPoint(side, (n - 1) * RING_W + 100);
    for (const i of g.members) {
      const d = decor[i];
      assert(Math.hypot(d.x - tp.x, d.gy - tp.y) < 240, `кольцо ${n}/${side}: ${d.name} далеко от тропы`);
    }
  }
});

test('ансамбли: одинаковые постройки не стоят рядом (кроме двойняшек-панелек)', () => {
  for (let i = 0; i < decor.length; i++) for (let j = i + 1; j < decor.length; j++) {
    const a = decor[i], b = decor[j];
    if (a.name !== b.name || a.ens === b.ens) continue;
    assert(Math.hypot(a.x - b.x, a.gy - b.gy) >= 420, `${a.name} ×2 ближе 420`);
  }
});

test('ансамбли: постройки двора — рядом друг с другом', () => {
  for (const e of archEnsembles) {
    if (e.members.length < 2) continue;
    for (const i of e.members) {
      const d = decor[i];
      const others = e.members.filter(j => j !== i).map(j => decor[j]);
      const gap = Math.min(...others.map(o => Math.abs(o.x - d.x) - (o.w + d.w) / 2));
      assert(gap < 200, `${d.name}: оторвана от своего ансамбля (${Math.round(gap)})`);
    }
  }
});

test('arch: раскладка детерминирована', () => {
  const again = buildArchitecture(signs);
  eq(again.length, decor.length);
  for (let i = 0; i < decor.length; i++) assert(decor[i].x === again[i].x && decor[i].gy === again[i].gy, 'раскладка плывёт');
});

test('arch: фасады табличек — по кольцу и стороне', () => {
  for (let n = 1; n <= 9; n++) for (const s of ['south', 'east', 'west', 'north']) assert(typeof signFacade(n, s) === 'function', `нет фасада ${n}/${s}`);
  eq(signFacade(11, 'south'), null, 'за огнём фасадов нет');
});

const { isBlocked } = await imp('world/physics.js');
const { ARCH_LOOKS } = await imp('content/arch_looks.js');
const arch = locations.filter(l => l.archDraw);
test('arch: постройки — локации мира с собственным осмотром', () => {
  eq(arch.length, decor.length, 'каждая постройка — локация');
  for (const l of arch) {
    const key = `${SEGMENTS[l.archRing - 1].id}:${l.archSide}:${l.name}`;
    assert(ARCH_LOOKS[key], `нет осмотра ${key}`);
    eq(l.look, ARCH_LOOKS[key]);
  }
});

test('arch: твёрдое — только основание, внутри силуэта', () => {
  for (const l of arch) {
    const b = l.solidBox;
    assert(b.x >= l.x && b.x + b.w <= l.x + l.w && b.y >= l.y && b.y + b.h <= l.y + l.h + 1, `${l.name}: основание вне силуэта`);
    assert(b.h <= 14, `${l.name}: основание выше 14`);
  }
});

test('arch: к каждой постройке можно подойти; сквозь основание не пройти; из него — выйти', () => {
  for (const l of arch) {
    const ax = l.x + l.w / 2 - 6, ay = l.y + l.h + 5;      // точка подхода (как в клике)
    assert(!isBlocked(ax, ay, locations), `${l.name}: точка подхода занята`);
  }
  const l = arch[0], b = l.solidBox;
  const inside = { x: b.x + b.w / 2 - 6, y: b.y - 10 };
  assert(isBlocked(inside.x, inside.y, locations), 'основание твёрдое');
  assert(!isBlocked(inside.x, inside.y + 1, locations, inside), 'изнутри основания можно выйти');
});

const { prepareArchGround, archProps, drawArchFoot, drawArchGround } = await imp('render/archground.js');
test('земля: у каждой постройки — обвязка у стены, рисуется без ошибок', () => {
  prepareArchGround(archEnsembles, locations);
  const ctx = fakeCtx();
  for (const l of arch) {
    assert(Array.isArray(l.archFoot), `${l.name}: нет обвязки`);
    drawArchFoot(ctx, l);
  }
  drawArchGround(ctx, 0, 0, 99999, 99999);       // без холста — тихо пропускает
});

test('земля: заборы не перегораживают тропы и не встают на таблички', () => {
  assert(archProps.length > 50, `кусков забора мало: ${archProps.length}`);
  for (const p of archProps) {
    for (const s of signs) {
      const sx = s.x + s.w / 2, sgy = s.y + s.h;
      const hit = Math.abs(sx - p.x) < p.w / 2 + 6 && Math.abs(sgy - p.gy) < 6;
      assert(!hit, `забор на табличке «${s.name}»`);
    }
    for (const side of ['south', 'north']) {
      const d = side === 'south' ? p.gy - TOWN.y1 : TOWN.y0 - p.gy;
      if (d < 0 || p.x < TOWN.x0 || p.x > TOWN.x1) continue;
      assert(Math.abs(trailPoint(side, d).x - p.x) >= 6, `забор на тропе ${side}`);
    }
  }
});

// ═══ REPORT ═══
const passed = results.filter(r => r.status === 'pass').length;
const failed = results.filter(r => r.status === 'fail');
console.log('\n── ARCHITECTURE TESTS ──');
for (const r of results) {
  console.log(`${r.status === 'pass' ? '✓' : '✗'} ${r.name}`);
  if (r.status === 'fail') console.log(`  ${r.msg}`);
}
console.log(`\n${passed}/${results.length} passed`);
if (failed.length) { console.log(`\nFirst failure stack:\n${failed[0].stack}`); process.exit(1); }
process.exit(0);
