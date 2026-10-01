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
const { buildArchitecture, signFacade } = await imp('world/architecture.js');
const { locations } = await imp('world/locations.js');
const { TOWN, RING_W, townDist } = await imp('world/disc.js');
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
test('arch: в каждом кольце стоят постройки, каждая — в полосе своего кольца', () => {
  for (let n = 1; n <= 9; n++) {
    const inRing = decor.filter(d => d.ring === n);
    assert(inRing.length >= 10, `кольцо ${n}: построек ${inRing.length}`);
    for (const d of inRing) {
      const r = Math.ceil(townDist(d.x, d.gy) / RING_W);
      eq(r, n, `${d.name} (${d.side}) стоит в кольце ${r}, а не ${n}`);
    }
  }
});

test('arch: постройки не заслоняют таблички', () => {
  for (const d of decor) for (const s of signs) {
    const sx = s.x + s.w / 2, sgy = s.y + s.h;
    const clashX = Math.abs(d.x - sx) < d.w / 2 + 10;
    const clashY = sgy > d.gy - d.h - 10 && sgy - s.h < d.gy + 10;
    assert(!(clashX && clashY), `${d.name} заслоняет «${s.name}»`);
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
