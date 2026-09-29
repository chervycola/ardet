// ═══════════════════════════════════════
// POTEMKIN TESTS — потёмкинская скорость: неподвижный взгляд проявляет
// подделку, ходьба собирает её обратно; шов попадает только в терпеливый
// осмотр. Run: node test/potemkin.mjs
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
const { tick } = await imp('core/time.js');
const P = await imp('world/potemkin.js');
const { POTEMKIN_LOOKS } = await imp('content/potemkin.js');
const { locations } = await imp('world/locations.js');
const { SEGMENTS } = await imp('content/ulitsa_db.js');
const { COVER_SIGNS } = await imp('content/cover_layer.js');

const sign = { potemkin: 'Сзади — подпорки.' };
const fake = { id: 'fake_1', name: 'фасад', x: 1000, y: 1000, w: 14, h: 26,
  look: 'Фасад.\n\n— обойти: «использовать» —', potemkinSign: sign };
const real = { id: 'real_1', name: 'дуб', x: 1200, y: 1000, w: 14, h: 26, look: 'Кривой дуб. Цел.' };
const locs = [fake, real];
const near = { x: fake.x + 1, y: fake.y + 16, moving: false };
const far = { x: fake.x + 500, y: fake.y, moving: false };
const run = (pl, n) => { for (let i = 0; i < n; i++) { tick(); P.update(pl, locs); } };

test('potemkin: на ходу подделка цела', () => {
  P._reset();
  run({ ...near, moving: true }, 600);
  eq(P.revealOf(fake), 0);
  eq(P.lookText(fake), fake.look, 'шва нет');
});

test('potemkin: короткая остановка ничего не проявляет', () => {
  P._reset();
  run(near, P.STILL_DELAY - 5);
  eq(P.revealOf(fake), 0);
});

test('potemkin: неподвижный взгляд проявляет и даёт шов перед подсказкой «обойти»', () => {
  P._reset();
  run(near, P.STILL_DELAY + 200);
  eq(P.revealOf(fake), 1);
  const txt = P.lookText(fake);
  assert(txt.includes(sign.potemkin), 'шов в осмотре');
  assert(txt.indexOf(sign.potemkin) < txt.indexOf('— обойти'), 'подсказка остаётся последней');
});

test('potemkin: подойти к проявленному и осмотреть — шов помнится', () => {
  P._reset();
  run(near, P.STILL_DELAY + 200);
  run({ ...near, moving: true }, 30);            // клик-подход в несколько шагов
  assert(P.lookText(fake).includes(sign.potemkin), 'шов пережил подход');
});

test('potemkin: пошёл — декорация собирается, шов уходит', () => {
  P._reset();
  run(near, P.STILL_DELAY + 200);
  run({ ...near, moving: true }, 300);
  eq(P.revealOf(fake), 0);
  eq(P.lookText(fake), fake.look);
});

test('potemkin: издалека не проявляется', () => {
  P._reset();
  run(far, 1000);
  eq(P.revealOf(fake), 0);
});

test('potemkin: настоящее не проявляется никогда', () => {
  P._reset();
  run({ x: real.x, y: real.y + 16, moving: false }, 1000);
  eq(P.revealOf(real), 0);
  eq(P.lookText(real), real.look);
});

test('potemkin: рендер без холста не падает (фолбэк рисует как есть)', () => {
  let drawn = 0;
  P.drawRevealed(fakeCtx(), fake, 1, () => { drawn++; }, { x: 980, y: 982, w: 40, h: 44 });
  eq(drawn, 1);
});

test('potemkin: бережение проявляется тихо — без подкосов (рендер не падает)', () => {
  const tender = { ...fake, id: 'tender_1', potemkinSign: { potemkin: 'Стекло протёрто.', tender: true } };
  let drawn = 0;
  P.drawRevealed(fakeCtx(), tender, 1, () => { drawn++; }, { x: 980, y: 982, w: 40, h: 44 });
  eq(drawn, 1);
});

test('potemkin: у вещей бережения со швом — тихое проявление (tender)', () => {
  const care = ['побелённая стена в коридоре', 'двойной портрет над комодом', 'окно с банками', 'остановка в долине'];
  for (const name of care) {
    const s = COVER_SIGNS.find(x => x.name === name);
    assert(s, `нет таблички ${name}`);
    assert(s.potemkin && s.tender === true, `${name}: шов без tender`);
  }
});

test('potemkin: все швы — непустые строки, у каждого шва табличка есть в мире', () => {
  const ids = new Set(locations.map(l => l.id));
  for (const [id, seam] of Object.entries(POTEMKIN_LOOKS)) {
    assert(typeof seam === 'string' && seam.trim(), `шов ${id} пуст`);
    assert(ids.has(id), `шов ${id}: такой локации нет`);
  }
  for (const seg of SEGMENTS) for (const s of seg.signs) {
    if (s.potemkin === undefined) continue;
    assert(typeof s.potemkin === 'string' && s.potemkin.trim(), `шов таблички ${s.name} пуст`);
  }
  const withSeam = locations.filter(l => l.potemkinSign);
  const signSeams = SEGMENTS.reduce((a, seg) => a + seg.signs.filter(s => s.potemkin).length, 0);
  eq(withSeam.length, signSeams, 'каждая табличка со швом стала подделкой в мире');
});

// ═══ REPORT ═══
const passed = results.filter(r => r.status === 'pass').length;
const failed = results.filter(r => r.status === 'fail');
console.log('\n── POTEMKIN TESTS ──');
for (const r of results) {
  console.log(`${r.status === 'pass' ? '✓' : '✗'} ${r.name}`);
  if (r.status === 'fail') console.log(`  ${r.msg}`);
}
console.log(`\n${passed}/${results.length} passed`);
if (failed.length) { console.log(`\nFirst failure stack:\n${failed[0].stack}`); process.exit(1); }
process.exit(0);
