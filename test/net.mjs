// ═══════════════════════════════════════
// СЕТЬ СТРАННИКОВ — фильтр, локальный транспорт (BroadcastChannel), правила
// net.js на подставном транспорте, Supabase-транспорт на подставном сервере
// (fetch + WebSocket: проверяется форма запросов и протокола, не сам Supabase),
// рисование чужих и меню. Run: node test/net.mjs
// ═══════════════════════════════════════
const noop = () => {};
const storage = new Map();
globalThis.localStorage = {
  getItem: k => storage.has(k) ? storage.get(k) : null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: k => storage.delete(k), clear: () => storage.clear(),
};
const ss = new Map();
globalThis.sessionStorage = { getItem: k => ss.get(k) ?? null, setItem: (k, v) => ss.set(k, String(v)) };
globalThis.window = {
  innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
  addEventListener: noop, removeEventListener: noop, visualViewport: null,
};
function fakeEl() {
  return { style: {}, classList: { add: noop, remove: noop, contains: () => false },
    appendChild: noop, removeChild: noop, addEventListener: noop, remove: noop,
    set innerHTML(v) {}, get innerHTML() { return ''; }, set textContent(v) {}, focus: noop };
}
globalThis.document = {
  getElementById: () => fakeEl(), createElement: () => fakeEl(), addEventListener: noop,
  querySelectorAll: () => [], title: 'x', body: null, readyState: 'loading',
};
const grad = () => ({ addColorStop: noop });
function fakeCtx() {
  return {
    globalAlpha: 1, fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '', textAlign: 'left',
    fillRect: noop, clearRect: noop, beginPath: noop, moveTo: noop, lineTo: noop, stroke: noop, fill: noop,
    save: noop, restore: noop, fillText: noop, translate: noop, drawImage: noop, arc: noop,
    createLinearGradient: grad, createRadialGradient: grad, measureText: () => ({ width: 10 }),
  };
}

const results = [];
async function test(name, fn) {
  try { await fn(); results.push({ name, status: 'pass' }); }
  catch (e) { results.push({ name, status: 'fail', msg: e.message, stack: e.stack }); }
}
function assert(c, m) { if (!c) throw new Error(m || 'assertion failed'); }
function eq(a, b, m) { if (a !== b) throw new Error((m || 'eq') + `: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); }
const tick = () => new Promise(r => setTimeout(r, 0));
const flush = async (n = 3) => { for (let i = 0; i < n; i++) await tick(); };

const base = new URL('../src/', import.meta.url);
const imp = p => import(new URL(p, base));
const { clean, dirty, SAY_MAX, NOTE_MAX } = await imp('net/filter.js');
const { localTransport } = await imp('net/local.js');
const { supabaseTransport } = await imp('net/supabase.js');
const N = await imp('net/net.js');
const R = await imp('render/net.js');
const U = await imp('ui/netui.js');
const { setCtx } = await imp('render/context.js');
setCtx(fakeCtx());

// ── фильтр ──
await test('фильтр: брань вымарана чёрным, с приставкой и заглавными; обычные слова целы', () => {
  const s = clean('Ну ты и ХУЙло, заебал. Корабля не видно, рубля не жалко, употреблять, оскорблять, небо, худой');
  assert(!/ху[йе]/i.test(s) && !/заеб/i.test(s), s);
  assert(s.includes('█'), 'вымарано');
  for (const w of ['Корабля', 'рубля', 'употреблять', 'оскорблять', 'небо', 'худой']) assert(s.includes(w), 'цело: ' + w);
});
await test('фильтр: ссылки и ники вымараны, точка в числе и в конце фразы — нет', () => {
  for (const bad of ['https://x.y/z', 'www.example.org', 'заходи на сайт.рф, там', 't.me/ardet', 'пиши @ardet_bot', 'example.com/path']) assert(clean(bad).includes('█'), bad);
  for (const ok of ['цена 3.50 руб', 'конец. ru', 'текст.rubles']) assert(!clean(ok).includes('█'), ok);
});
await test('фильтр: длина, управляющие знаки, пустое', () => {
  eq(Array.from(clean('я'.repeat(300))).length, SAY_MAX, 'речь');
  eq(Array.from(clean('я'.repeat(300), NOTE_MAX)).length, NOTE_MAX, 'записка');
  eq(clean('а\u0000б‮в​г'), 'а б в г', 'управляющие → пробел');
  eq(clean('   '), '', 'пусто');
  assert(dirty('ну и хуйня') && !dirty('  ну   и   ладно  ') && !dirty('Здесь было тепло'), 'dirty');
});

// ── локальный транспорт ──
await test('локальный: вкладки видят шаги и слова друг друга, своё до себя не доходит', async () => {
  storage.clear();
  const A = localTransport('A'), B = localTransport('B'), gotA = [], gotB = [];
  A.on('pos', m => gotA.push(m)); B.on('pos', m => gotB.push(m)); B.on('say', m => gotB.push(m));
  assert(await A.start() && await B.start(), 'start');
  A.sendPos({ x: 10, y: 20, layer: 'surface' }); A.sendSay({ text: 'эй' });
  await flush(5);
  eq(gotA.length, 0, 'своё не вернулось');
  eq(gotB.length, 2, 'дошло');
  eq(gotB[0].id, 'A'); eq(gotB[0].x, 10); eq(gotB[1].text, 'эй');
  const left = []; B.on('leave', m => left.push(m.id));
  A.stop(); await flush(5);
  eq(left[0], 'A', 'ушёл');
  B.stop();
});
await test('локальный: записки — длина, 10 в сутки, своё не заверить, дважды нельзя, три жалобы скрывают, старше 30 дней не видно', async () => {
  storage.clear();
  const A = localTransport('A'), B = localTransport('B'), C = localTransport('C'), D = localTransport('D');
  eq((await A.addNote({ x: 1, y: 1, layer: 'surface', text: 'я'.repeat(NOTE_MAX + 1) })).error, 'length');
  const n = await A.addNote({ x: 100, y: 100, layer: 'surface', text: 'здесь' });
  assert(n.id && n.author === 'A', 'записана');
  const box = { layer: 'surface', x0: 0, x1: 200, y0: 0, y1: 200 };
  eq((await B.notesIn(box)).length, 1, 'видна другому');
  eq((await B.notesIn({ ...box, layer: 'under' })).length, 0, 'не на том слое');
  eq((await A.vote(n.id, 'cert')).error, 'twice', 'своё');
  eq((await B.vote(n.id, 'cert')).certs, 1);
  eq((await B.vote(n.id, 'cert')).error, 'twice', 'дважды');
  await B.vote(n.id, 'report'); await C.vote(n.id, 'report');
  eq((await B.notesIn(box)).length, 1, 'две жалобы — видна');
  eq((await D.vote(n.id, 'report')).hidden, true);
  eq((await B.notesIn(box)).length, 0, 'три — скрыта');
  for (let i = 0; i < 9; i++) await A.addNote({ x: i, y: 5, layer: 'surface', text: 'ещё ' + i });
  eq((await A.addNote({ x: 50, y: 5, layer: 'surface', text: 'одиннадцатая' })).error, 'quota', '10 в сутки');
  const list = JSON.parse(storage.get('ardet-net-notes'));
  list[1].created -= 31 * 86400e3; storage.set('ardet-net-notes', JSON.stringify(list));
  eq((await B.notesIn(box)).length, 8, 'старая не видна');
  for (const T of [A, B, C, D]) T.stop();
});

// ── net.js на подставном транспорте ──
// в базе записки просторных колец лежат со сдвигом X по x; без сдвига — прежней геометрии
const X = 1e6;
function fakeT(uid = 'ME') {
  const H = { pos: [], say: [], leave: [], note: [] };
  const T = {
    kind: 'fake', uid, H, sent: { pos: [], say: [], note: [] }, db: [], votes: [],
    async start() { return true; }, on(ev, f) { H[ev].push(f); },
    sendPos(p) { T.sent.pos.push(p); }, sendSay(s) { T.sent.say.push(s); }, sendNote(n) { T.sent.note.push(n); }, stop() { T.stopped = true; },
    async notesIn(b) { if (b.x0 > X / 2) T.fetches = (T.fetches || 0) + 1; return T.db.filter(n => n.layer === b.layer && n.x >= b.x0 && n.x <= b.x1 && n.y >= b.y0 && n.y <= b.y1); },   // подгрузка — по запросу записок новой геометрии
    async addNote(n) { const r = { id: 'n' + T.db.length, ...n, author: uid, created: Date.now(), certs: 0 }; T.db.push(r); return r; },
    async vote(id, kind) { T.votes.push([id, kind]); return {}; },
    emit(ev, m) { for (const f of H[ev]) f(m); },
  };
  return T;
}
const P = (x, y, moving = false) => ({ x: x - 6, y: y - 23, dir: 1, moving });   // ноги странника — в (x, y)
async function fresh() { N._resetNet(); storage.clear(); const T = fakeT(); await N.startNet(T); return T; }

await test('net: без транспорта мира для одного не касается ничего', async () => {
  N._resetNet();
  globalThis.location = { search: '?net=off' };            // адрес Supabase вписан — выключить можно только так
  assert(!(await N.startNet()), '?net=off — нет сети');
  delete globalThis.location;
  N.stepNet(P(0, 0), 'surface');
  eq(N.netSay('эй').error, 'off');
  eq((await N.netLeaveNote('эй')).error, 'off');
  eq(R.othersToDraw(fakeCtx(), 'surface', 0, 0, 400, 300).length, 0);
  eq(N.pickTransport('?net=off', 'x'), null);
  const lt = N.pickTransport('?net=local', 'x');
  eq(lt.kind, 'local');
  lt.stop();                                         // канал открыт — закрыть, иначе процесс не кончится
});
await test('net: вести о шагах — сразу, на ходу три в секунду, встал — сразу, стоишь — раз в 2 секунды', async () => {
  const T = await fresh();
  N.stepNet(P(100, 100), 'surface');
  eq(T.sent.pos.length, 1, 'первая весть');
  for (let i = 0; i < 60; i++) N.stepNet(P(100, 100), 'surface');
  eq(T.sent.pos.length, 1, 'стоит — молчит');
  for (let i = 1; i <= 60; i++) N.stepNet(P(100 + i * 2, 100, true), 'surface');
  eq(T.sent.pos.length, 4, 'секунда хода — три вести');     // 60 шагов / 20
  const before = T.sent.pos.length;
  for (let i = 0; i < 4; i++) N.stepNet(P(220, 100, false), 'surface');
  eq(T.sent.pos.length, before + 1, 'встал — весть сразу');
  eq(T.sent.pos.at(-1).moving, false);
  for (let i = 0; i < 119; i++) N.stepNet(P(220, 100), 'surface');
  eq(T.sent.pos.length, before + 2, 'стоит — «я тут» раз в 2 секунды');
  N.stepNet(P(220, 100), 'under');
  eq(T.sent.pos.at(-1).layer, 'surface', 'слой сменился — весть ждёт срока');
  for (let i = 0; i < 20; i++) N.stepNet(P(220, 100), 'under');
  eq(T.sent.pos.at(-1).layer, 'under', 'и уходит');
});
await test('net: чужой странник появляется, идёт плавно, шаг досчитывается между вестями; молчит 10 секунд — ушёл', async () => {
  const T = await fresh();
  N.stepNet(P(0, 0), 'surface');
  T.emit('pos', { id: 'w1', x: 100, y: 100, layer: 'surface', dir: 1, moving: true });
  const o = N.net.others.get('w1');
  assert(o && o.x === 100, 'появился там, где сказал');
  for (let i = 0; i < 20; i++) N.stepNet(P(0, 0), 'surface');
  T.emit('pos', { id: 'w1', x: 140, y: 100, layer: 'surface', dir: 1, moving: true });   // 2 точки за шаг
  const x0 = o.x;
  for (let i = 0; i < 20; i++) N.stepNet(P(0, 0), 'surface');
  assert(o.x > 140 + 20 && o.x < 140 + 44, 'идёт дальше между вестями: ' + o.x.toFixed(1));
  assert(o.x > x0, 'не прыгает назад');
  T.emit('pos', { id: 'w1', x: 180, y: 100, layer: 'surface', dir: 1, moving: false });
  for (let i = 0; i < 40; i++) N.stepNet(P(0, 0), 'surface');
  assert(Math.abs(o.x - 180) < 1, 'встал — стоит, где встал: ' + o.x.toFixed(1));
  T.emit('pos', { id: 'w1', x: 2000, y: 100, layer: 'under', dir: 1, moving: false });
  eq(o.x, 2000, 'спустился — там и стоит');
  for (let i = 0; i < N.LOST + 1; i++) N.stepNet(P(0, 0), 'surface');
  assert(!N.net.others.has('w1'), 'ушёл');
});
await test('net: слова слышны только рядом и на своём слое; глухому — нет; брань вымарана; ушёл — слова гаснут', async () => {
  const T = await fresh();
  N.stepNet(P(100, 100), 'surface');
  T.emit('pos', { id: 'near', x: 150, y: 100, layer: 'surface' });
  T.emit('pos', { id: 'far', x: 100 + N.HEAR + 50, y: 100, layer: 'surface' });
  T.emit('pos', { id: 'down', x: 120, y: 100, layer: 'under' });
  T.emit('say', { id: 'near', text: 'ну ты и хуйло' });
  T.emit('say', { id: 'far', text: 'далеко' });
  T.emit('say', { id: 'down', text: 'снизу' });
  T.emit('say', { id: 'nobody', text: 'кто это' });
  eq(N.net.voices.length, 1, 'одно слово');
  assert(N.net.voices[0].who === 'near' && N.net.voices[0].text.includes('█'), N.net.voices[0].text);
  N.mute('near');
  eq(N.net.voices.length, 0, 'не слушать — гаснет сразу');
  T.emit('say', { id: 'near', text: 'ещё' });
  eq(N.net.voices.length, 0, 'и новое не доходит');
  assert(JSON.parse(storage.get('ardet-net-muted')).includes('near'), 'помнится');
  N.mute('near', false);
  T.emit('say', { id: 'near', text: 'снова' });
  eq(N.net.voices.length, 1);
  T.emit('leave', { id: 'near' });
  assert(!N.net.others.has('near') && N.net.voices.length === 0, 'ушёл — и слова с ним');
});
await test('net: сказать — чистится, не чаще раза в 2 секунды, своё пишется над собой', async () => {
  const T = await fresh();
  N.stepNet(P(0, 0), 'surface');
  eq(N.netSay('   ').error, 'empty');
  eq(N.netSay('привет, пиши на t.me/xx').text.includes('█'), true);
  eq(T.sent.say.length, 1);
  eq(N.netSay('ещё').error, 'soon');
  for (let i = 0; i < N.SAY_GAP; i++) N.stepNet(P(0, 0), 'surface');
  eq(N.netSay('ещё').text, 'ещё');
  eq(N.net.voices.filter(v => v.who === 'me').length, 1, 'новое слово стирает прежнее');
});
await test('net: записка — у ног и наверху; брань не отправляется; раз в минуту; своя помечена', async () => {
  const T = await fresh();
  N.stepNet(P(300, 300), 'under');
  eq((await N.netLeaveNote('снизу')).error, 'under');
  N.stepNet(P(300, 300), 'surface');
  eq((await N.netLeaveNote('ну и хуйня')).error, 'dirty');
  eq((await N.netLeaveNote('пиши @ardet_bot')).error, 'dirty');
  eq(T.db.length, 0, 'до базы не дошло');
  const r = await N.netLeaveNote('  Здесь   было тепло ');
  assert(r.id, 'оставлена');
  eq(T.db[0].text, 'Здесь было тепло');
  eq(T.db[0].x, 300 + X, 'в базе — со сдвигом новой геометрии'); eq(T.db[0].y, 304);
  eq(N.net.notes.get(r.id).x, 300, 'у себя — в мире');
  assert(N.net.notes.get(r.id).mine, 'своя');
  eq((await N.netLeaveNote('ещё одна')).error, 'soon');
  for (let i = 0; i < N.NOTE_GAP; i++) N.stepNet(P(300, 300), 'surface');
  assert((await N.netLeaveNote('ещё одна')).id, 'через минуту — можно');
});
await test('net: записку, оставленную рядом, видно сразу — но раз в минуту и только у ног того, кто оставил', async () => {
  const T = await fresh();
  N.stepNet(P(300, 300), 'surface');
  const r = await N.netLeaveNote('здесь');
  eq(T.sent.note.length, 1); eq(T.sent.note[0].nid, r.id); eq(T.sent.note[0].text, 'здесь');
  T.emit('pos', { id: 'w', x: 500, y: 500, layer: 'surface' });
  T.emit('note', { id: 'stranger', nid: 'a', x: 500, y: 504, text: 'кто я' });
  T.emit('note', { id: 'w', nid: 'b', x: 900, y: 900, text: 'далеко от себя' });
  eq(N.net.notes.size, 1, 'незнакомый и чужая точка — нет');
  T.emit('note', { id: 'w', nid: 'c', x: 500, y: 504, text: 'ну и хуйня' });
  const n = N.net.notes.get('c');
  assert(n && !n.mine && n.text.includes('█'), 'у ног — видна, вымарана');
  T.emit('note', { id: 'w', nid: 'd', x: 500, y: 504, text: 'вторая сразу' });
  assert(!N.net.notes.has('d'), 'вторая в ту же минуту — нет');
  T.emit('pos', { id: 'u', x: 500, y: 500, layer: 'under' });
  T.emit('note', { id: 'u', nid: 'e', x: 500, y: 504, text: 'снизу' });
  assert(!N.net.notes.has('e'), 'из-под земли — нет');
});
await test('net: записки вокруг подгружаются наверху; отошёл — заново; под землёй — нет', async () => {
  const T = await fresh();
  T.db.push({ id: 'x1', x: 400 + X, y: 400, layer: 'surface', text: 'чужая, с хуйнёй', author: 'OTHER', created: Date.now(), certs: 2 });
  N.stepNet(P(300, 300), 'under');
  await flush();
  eq(T.fetches || 0, 0, 'под землёй не грузит');
  N.stepNet(P(300, 300), 'surface');
  await flush();
  eq(T.fetches, 1);
  const n = N.net.notes.get('x1');
  assert(n && !n.mine && n.text.includes('█'), 'чужая, вымарана: ' + (n && n.text));
  for (let i = 0; i < 10; i++) N.stepNet(P(310, 300), 'surface');
  await flush();
  eq(T.fetches, 1, 'рядом — не грузит заново');
  N.stepNet(P(300 + N.FETCH_R, 300), 'surface');
  await flush();
  eq(T.fetches, 2, 'отошёл — подгрузил');
  N.stepNet(P(400 + 3 * N.FETCH_R, 300), 'surface');
  await flush();
  assert(!N.net.notes.has('x1'), 'ушёл далеко — забыл');
  N.stepNet(P(400, 400), 'surface');
  await flush();
  assert(N.net.notes.has('x1'), 'вернулся — снова лежит');
});
await test('net: записка прежней геометрии (до просторных колец) ищется по своим координатам и встаёт на своё место', async () => {
  const T = await fresh();
  const D = await import(new URL('../src/world/disc.js', import.meta.url));
  const old = { x: 4100, y: 3900 }, p = D.fromOldGeo(old.x, old.y);   // у костра прежнего городка (поле 3150)
  T.db.push({ id: 'o1', x: old.x, y: old.y, layer: 'surface', text: 'давняя', author: 'OTHER', created: Date.now() - 5 * 86400e3, certs: 0 });
  T.db.push({ id: 'o2', x: p.x, y: p.y, layer: 'surface', text: 'не та', author: 'OTHER', created: Date.now(), certs: 0 });   // прежняя, но в прежнем мире далеко
  N.stepNet(P(Math.round(p.x), Math.round(p.y)), 'surface'); await flush();
  const n = N.net.notes.get('o1');
  assert(n && Math.abs(n.x - p.x) < 1 && Math.abs(n.y - p.y) < 1, 'перенесена: ' + (n && [n.x, n.y]));
  assert(!N.net.notes.has('o2'), 'без сдвига — прежняя геометрия: в прежнем мире она далеко');
});
await test('net: заверить — по разу, своё нельзя; пожаловался — пропала и не вернётся при подгрузке', async () => {
  const T = await fresh();
  T.db.push({ id: 'x1', x: 400 + X, y: 400, layer: 'surface', text: 'чужая', author: 'OTHER', created: Date.now(), certs: 0 });
  T.db.push({ id: 'x2', x: 420 + X, y: 400, layer: 'surface', text: 'другая', author: 'OTHER', created: Date.now(), certs: 0 });
  N.stepNet(P(400, 400), 'surface'); await flush();
  const mine = await N.netLeaveNote('своя');
  eq((await N.netVote(mine.id, 'cert')).error, 'mine');
  await N.netVote('x1', 'cert');
  eq(N.net.notes.get('x1').certs, 1); assert(N.net.notes.get('x1').certed);
  eq((await N.netVote('x1', 'cert')).error, 'twice');
  eq(T.votes.length, 1, 'второй раз до базы не идёт');
  await N.netVote('x2', 'report');
  assert(!N.net.notes.has('x2'), 'пропала');
  assert(JSON.parse(storage.get('ardet-net-reported')).includes('x2'), 'помнится');
  N.net.fetched = null; N.stepNet(P(400, 400), 'surface'); await flush();
  assert(!N.net.notes.has('x2'), 'подгрузка её не вернула');
  assert(N.net.notes.has('x1'));
});

// ── на экране ──
await test('экран: чужие — только в кадре и на своём слое; огонёк чужого светит, в инее — нет', async () => {
  const T = await fresh();
  N.stepNet(P(100, 100), 'surface');
  T.emit('pos', { id: 'a', x: 150, y: 120, layer: 'surface' });
  T.emit('pos', { id: 'b', x: 2000, y: 120, layer: 'surface' });
  T.emit('pos', { id: 'c', x: 150, y: 120, layer: 'under' });
  const ctx = fakeCtx(), items = R.othersToDraw(ctx, 'surface', 0, 0, 480, 270);
  eq(items.length, 1);
  eq(items[0].k, 121, 'глубина — по ногам');
  items[0].draw();                                   // без холста — прямо в мир, без ошибок
  eq(R.othersToDraw(ctx, 'under', 0, 0, 480, 270).length, 1);
  eq(R.otherLights('surface', 0, 0, 480, 270).length, 1);
  eq(R.otherLights('under', 0, 0, 480, 270, () => 1).length, 0, 'в криосклепе тёплого нет');
  eq(R.otherAt('surface', 150, 109).tab, 'a', 'клик по фигуре');
  eq(R.otherAt('surface', 150, 160), null, 'мимо');
});
await test('экран: записки на земле, клик по записке, перенос слов', async () => {
  const T = await fresh();
  T.db.push({ id: 'x1', x: 200 + X, y: 200, layer: 'surface', text: 'чужая', author: 'OTHER', created: Date.now() - 20 * 86400e3, certs: 1 });
  N.stepNet(P(200, 200), 'surface'); await flush();
  R.drawNotes(fakeCtx(), 0, 0, 480, 270);
  eq(R.noteAt(203, 201).id, 'x1');
  eq(R.noteAt(230, 200), null);
  const lines = R.wrap('Здесь было тепло, и мы сидели у огня до самого утра, пока не погас последний уголь');
  assert(lines.length >= 3 && lines.every(l => Array.from(l).length <= 30), lines.join('|'));
  eq(R.wrap('я'.repeat(70)).length, 1, 'длинное слово режется, не теряется строка');
});
await test('экран: двое рядом говорят — слова не налезают: позднее поднимается и не опускается', async () => {
  const T = await fresh();
  N.stepNet(P(100, 100), 'surface');
  T.emit('pos', { id: 'a', x: 120, y: 100, layer: 'surface' });
  N.netSay('первое слово рядом');
  N.stepNet(P(100, 100), 'surface');
  T.emit('say', { id: 'a', text: 'второе слово рядом' });
  const ctx = { ...fakeCtx(), measureText: t => ({ width: Array.from(t).length * 6 }) }, me = P(100, 100);   // строка — по 6 точек на букву
  R.drawVoices(ctx, 'surface', me);
  const [v1, v2] = N.net.voices;
  assert(!v1.lift && v2.lift > 0, 'второе поднялось: ' + v2.lift);
  const lift = v2.lift;
  N.net.voices = [v2];                                   // первое догорело
  R.drawVoices(ctx, 'surface', me);
  eq(v2.lift, lift, 'не опустилось');
});
await test('экран: сказанное пишется пером строка за строкой и гаснет', async () => {
  const T = await fresh();
  N.stepNet(P(100, 100), 'surface');
  T.emit('pos', { id: 'a', x: 150, y: 120, layer: 'surface' });
  T.emit('say', { id: 'a', text: 'Здесь было тепло, и мы сидели у огня' });
  N.netSay('и я тут');
  const ctx = fakeCtx(), me = P(100, 100);
  let steps = 0;
  while (N.net.voices.length && steps < 2000) { N.stepNet(me, 'surface'); R.drawVoices(ctx, 'surface', me); steps++; }
  eq(N.net.voices.length, 0, 'погасли');
  assert(steps > 60 && steps < N.VOICE_LIFE, 'не мгновенно и не по сроку: ' + steps);
});

// ── меню ──
await test('меню: записка — прочесть, заверить чужую, пожаловаться; своя — только прочесть; встречный — не слушать', async () => {
  await fresh();
  const other = U.noteMenu({ id: 'x', x: 10, y: 10, text: 'чужая', certs: 2, created: Date.now(), mine: false });
  assert(other.look.includes('«чужая»') && other.look.includes('Заверено: 2.') && other.look.includes('чужой'), other.look);
  assert(other.useShown() && other.altNow().key === 'net_report');
  eq(other.useAction, 'net_cert');
  const mine = U.noteMenu({ id: 'y', x: 10, y: 10, text: 'своя', certs: 0, mine: true });
  assert(!mine.useShown() && mine.altNow() === null && mine.look.includes('свой'));
  eq(mine.id, 'net_note_mine');
  const certed = U.noteMenu({ id: 'z', x: 0, y: 0, text: 't', certed: true, reported: false });
  assert(!certed.useShown(), 'заверил — кнопки нет');
  const w = U.otherMenu({ tab: 'w1', x: 50, y: 50 });
  assert(w.useLabel.includes('НЕ СЛУШАТЬ')); eq(w.useAction, 'net_mute');
  N.mute('w1');
  assert(U.otherMenu({ tab: 'w1', x: 50, y: 50 }).useLabel.includes('СЛУШАТЬ') && !U.otherMenu({ tab: 'w1', x: 50, y: 50 }).useLabel.includes('НЕ'));
});

// ── черта горизонта на двоих (канон: «видна двоим, если смотрят из-под ладоней в одну сторону») ──
const B = await imp('world/beyond.js');
const L0 = []; B.buildBeyond(L0);
const pole = B.horizonPole(), PX = pole.x + 6, PY = pole.y + pole.h + 30;   // у столба, в пустыне
await test('горизонт: один — черта семь секунд и «вынос не предусмотрен»', () => {
  B._resetBeyond();
  assert(B.northDepth(PX, PY) > 0.03, 'точка — в пустыне');
  assert(B.beyond.lookHorizon());
  let n = 0;
  while (B.beyond.hT > 0 && n < 2000) { B.beyond.step(PX, PY, false, false, false); n++; }
  eq(n, B.HOR, 'семь секунд');
  eq(B.beyond.say, B.HOR_LINE);
});
await test('горизонт: двое смотрят — черта держится, сколько смотрят, во всю ширину; потом — «выдан на двоих»', () => {
  B._resetBeyond();
  B.beyond.lookHorizon();
  for (let i = 0; i < 3 * B.HOR; i++) B.beyond.step(PX, PY, false, false, true);
  assert(B.beyond.hT > 0 && B.beyond.hK === 1 && B.beyond.shared && B.beyond.visor, 'держится: ' + B.beyond.hT);
  let n = 0;
  while (B.beyond.hT > 0 && n < 2000) { B.beyond.step(PX, PY, false, false, false); n++; }   // второй опустил ладонь
  assert(n > 0 && n <= B.HOR, 'дальше — своим сроком: ' + n);
  eq(B.beyond.say, B.HOR_TWO);
});
await test('горизонт: присоединился поздно — черта сразу в полную силу; шагнул — уходит и у двоих', () => {
  B._resetBeyond();
  B.beyond.lookHorizon();
  for (let i = 0; i < B.HOR - 20; i++) B.beyond.step(PX, PY, false, false, false);
  assert(B.beyond.hK < 1, 'гаснет');
  B.beyond.step(PX, PY, false, false, true);
  eq(B.beyond.hK, 1, 'двое — снова видна');
  B.beyond.step(PX, PY, true, false, true);                 // шагнул
  assert(!B.beyond.shared && !B.beyond.visor && B.beyond.hT <= B.HOR_OUT, 'ушла');
});
await test('горизонт: ладонь козырьком уходит в сеть сразу; рядом смотрящий — виден, далеко или внизу — нет', async () => {
  const T = await fresh();
  N.stepNet({ ...P(PX, PY), visor: false }, 'surface');
  const n0 = T.sent.pos.length;
  for (let i = 0; i < 5; i++) N.stepNet({ ...P(PX, PY), visor: true }, 'surface');
  eq(T.sent.pos.length, n0 + 1, 'подняла ладонь — весть');
  eq(T.sent.pos.at(-1).look, true);
  T.emit('pos', { id: 'near', x: PX + 60, y: PY, layer: 'surface', look: true });
  T.emit('pos', { id: 'far', x: PX + N.SIGHT + 80, y: PY, layer: 'surface', look: true });
  T.emit('pos', { id: 'down', x: PX + 10, y: PY, layer: 'under', look: true });
  assert(N.lookingNear(PX, PY), 'рядом смотрит');
  T.emit('pos', { id: 'near', x: PX + 60, y: PY, layer: 'surface', look: false });
  assert(!N.lookingNear(PX, PY), 'опустил — нет; далеко и внизу — не в счёт');
  T.emit('pos', { id: 'sitter', x: PX - 40, y: PY, layer: 'surface', sit: 1 });
  for (let i = 0; i < 60; i++) N.stepNet(P(PX, PY), 'surface');
  assert(N.net.others.get('sitter').sitK > 0.9, 'сел — садится и у тебя');
});
await test('горизонт: встречный смотрит вдаль — в меню «посмотреть туда же», если можно', async () => {
  await fresh();
  const o = { tab: 'w', x: PX, y: PY, look: true };
  const m = U.otherMenu(o, true);
  eq(m.altNow().key, 'horizon_join');
  assert(m.look.includes('ладонь козырьком'), m.look);
  eq(U.otherMenu(o, false).altNow(), null, 'нельзя — нет кнопки');
  eq(U.otherMenu({ ...o, look: false }, true).altNow(), null, 'не смотрит — нет');
});

// ── Supabase на подставном сервере ──
class FakeWS {
  constructor(url) { this.url = url; this.readyState = 0; this.sent = []; FakeWS.all.push(this); setTimeout(() => { if (this.readyState) return; this.readyState = 1; this.onopen && this.onopen(); }, 0); }
  send(d) { this.sent.push(JSON.parse(d)); }
  close() { this.readyState = 3; this.onclose && this.onclose(); }
  recv(m) { this.onmessage({ data: JSON.stringify(m) }); }
}
FakeWS.all = [];
globalThis.WebSocket = FakeWS;                       // в Node 22 свой WebSocket есть — к настоящему серверу не ходить
function server(routes) {
  const calls = [];
  globalThis.fetch = async (url, opt = {}) => {
    calls.push({ url, opt });
    for (const [re, f] of routes) if (re.test(url) && (!f.method || f.method === (opt.method || 'GET'))) {
      const r = f(url, opt);
      if (r === 'down') throw new Error('net');
      return { ok: r.status < 300, status: r.status, json: async () => r.body };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  };
  return calls;
}
const session = { access_token: 'AT1', refresh_token: 'RT1', expires_in: 3600, user: { id: 'U1' } };
await test('supabase: анонимный вход, канал, шаги и уход по протоколу Realtime', async () => {
  storage.clear(); FakeWS.all = [];
  const calls = server([[/\/auth\/v1\/signup$/, () => ({ status: 200, body: session })]]);
  const T = supabaseTransport('https://proj.supabase.co/', 'KEY', 'tab1');
  const got = { pos: [], leave: [] };
  T.on('pos', m => got.pos.push(m)); T.on('leave', m => got.leave.push(m));
  assert(await T.start(), 'вошёл');
  const su = calls.find(c => c.url.endsWith('/auth/v1/signup'));
  eq(su.opt.headers.apikey, 'KEY'); eq(su.opt.headers.Authorization, undefined, 'ключ не в Authorization');
  eq(T.uid, 'U1');
  eq(JSON.parse(storage.get('ardet-net-session')).refresh_token, 'RT1');
  await flush();
  const ws = FakeWS.all[0];
  eq(ws.url, 'wss://proj.supabase.co/realtime/v1/websocket?apikey=KEY&vsn=1.0.0');
  const join = ws.sent[0];
  eq(join.topic, 'realtime:ardet-world-2'); eq(join.event, 'phx_join');
  eq(join.payload.config.presence.key, 'tab1'); eq(join.payload.access_token, 'AT1');
  eq(join.payload.config.broadcast.self, false);
  T.sendPos({ x: 1, y: 2 });
  eq(ws.sent.length, 1, 'до ответа на вход — молчит');
  ws.recv({ topic: 'realtime:ardet-world-2', event: 'phx_reply', ref: join.ref, payload: { status: 'ok', response: {} } });
  const track = ws.sent[1];
  eq(track.event, 'presence'); eq(track.payload.event, 'track');
  T.sendPos({ x: 1, y: 2, layer: 'surface' });
  const b = ws.sent[2];
  eq(b.event, 'broadcast'); eq(b.payload.type, 'broadcast'); eq(b.payload.event, 'pos');
  eq(b.payload.payload.id, 'tab1'); eq(b.payload.payload.x, 1); eq(b.join_ref, join.ref);
  ws.recv({ topic: 'realtime:ardet-world-2', event: 'broadcast', payload: { type: 'broadcast', event: 'pos', payload: { id: 'tab2', x: 5, y: 6 } } });
  ws.recv({ topic: 'realtime:ardet-world-2', event: 'broadcast', payload: { type: 'broadcast', event: 'pos', payload: { id: 'tab1', x: 9, y: 9 } } });
  ws.recv({ topic: 'other', event: 'broadcast', payload: { type: 'broadcast', event: 'pos', payload: { id: 'tab3', x: 9, y: 9 } } });
  eq(got.pos.length, 1, 'чужое — да, своё и с чужого канала — нет'); eq(got.pos[0].id, 'tab2');
  ws.recv({ topic: 'realtime:ardet-world-2', event: 'presence_diff', payload: { joins: {}, leaves: { tab2: { metas: [] }, tab1: { metas: [] } } } });
  eq(got.leave.length, 1); eq(got.leave[0].id, 'tab2');
  T.stop();
  eq(ws.sent.at(-1).payload.event, 'leave', 'уходя — сказал');
  eq(FakeWS.all.length, 1, 'после stop не переподключается');
});
await test('supabase: записки и отметки — запросы PostgREST и ответы базы', async () => {
  storage.clear(); FakeWS.all = [];
  const row = { id: 7, x: 10, y: 20, layer: 'surface', text: 'здесь', certs: 0, created_at: '2026-10-20T10:00:00Z', author: 'U1' };
  let insert = { status: 201, body: [row] }, vote = { status: 201, body: null };
  const calls = server([
    [/\/auth\/v1\/signup$/, () => ({ status: 200, body: session })],
    [/\/rest\/v1\/notes\?/, () => ({ status: 200, body: [row] })],
    [/\/rest\/v1\/notes$/, () => insert],
    [/\/rest\/v1\/note_votes$/, () => vote],
  ]);
  const T = supabaseTransport('https://proj.supabase.co', 'KEY', 'tab1');
  await T.start(); await flush();
  const list = await T.notesIn({ layer: 'surface', x0: -5.5, x1: 100, y0: 0, y1: 200 });
  const q = calls.at(-1);
  assert(/layer=eq\.surface/.test(q.url) && /x=gte\.-5&x=lte\.100/.test(q.url) && /order=created_at\.desc/.test(q.url) && /limit=80/.test(q.url), q.url);
  eq(q.opt.headers.Authorization, 'Bearer AT1');
  eq(list[0].created, Date.parse('2026-10-20T10:00:00Z'));
  const n = await T.addNote({ x: 10.4, y: 20.6, layer: 'surface', text: 'здесь' });
  const ins = calls.at(-1);
  eq(ins.opt.method, 'POST'); eq(ins.opt.headers.Prefer, 'return=representation');
  const body = JSON.parse(ins.opt.body);
  eq(body.x, 10); eq(body.y, 21); assert(!('author' in body) && !('certs' in body), 'автора и печати ставит база');
  eq(n.id, 7);
  insert = { status: 403, body: {} }; eq((await T.addNote({ x: 0, y: 0, layer: 'surface', text: 'x' })).error, 'quota');
  insert = { status: 400, body: {} }; eq((await T.addNote({ x: 0, y: 0, layer: 'surface', text: 'x' })).error, 'refused');
  insert = 'down'; eq((await T.addNote({ x: 0, y: 0, layer: 'surface', text: 'x' })).error, 'net');
  eq(Object.keys(await T.vote(7, 'cert')).length, 0);
  eq(JSON.parse(calls.at(-1).opt.body).kind, 'cert');
  vote = { status: 409, body: {} }; eq((await T.vote(7, 'cert')).error, 'twice');
  vote = { status: 403, body: {} }; eq((await T.vote(7, 'cert')).error, 'refused');
  T.stop();
});
await test('supabase: сессия продлевается по сохранённому refresh-токену, без нового входа', async () => {
  storage.clear(); FakeWS.all = [];
  storage.set('ardet-net-session', JSON.stringify({ refresh_token: 'OLD' }));
  const calls = server([
    [/\/auth\/v1\/token\?grant_type=refresh_token$/, (u, o) => (JSON.parse(o.body).refresh_token === 'OLD' ? { status: 200, body: { ...session, access_token: 'AT2', refresh_token: 'RT2' } } : { status: 400, body: {} })],
    [/\/auth\/v1\/signup$/, () => ({ status: 200, body: session })],
  ]);
  const T = supabaseTransport('https://proj.supabase.co', 'KEY', 'tab1');
  assert(await T.start());
  assert(!calls.some(c => c.url.endsWith('/signup')), 'нового входа не было');
  eq(JSON.parse(storage.get('ardet-net-session')).refresh_token, 'RT2');
  await flush();
  eq(FakeWS.all[0].sent[0].payload.access_token, 'AT2');
  T.stop();
  storage.set('ardet-net-session', JSON.stringify({ refresh_token: 'BAD' }));
  const T2 = supabaseTransport('https://proj.supabase.co', 'KEY', 'tab1');
  assert(await T2.start(), 'протух — вошёл заново');
  assert(calls.some(c => c.url.endsWith('/signup')));
  T2.stop();
  server([[/\/auth\/v1\/signup$/, () => 'down']]);
  storage.clear();
  const T3 = supabaseTransport('https://proj.supabase.co', 'KEY', 'tab1');
  eq(await T3.start(), false, 'нет связи — сети нет, мир идёт');
});

// ── во что одет и куда смотрит (sprites/wardrobe.js): уходит, обновляется сразу, чужое — проверяется ──
await test('net: крой и сторона взгляда — уходят, переоделся — весть сразу, чужое проверяется, тень одета', async () => {
  const T = await fresh();
  const me = (x, y, o = {}) => ({ ...P(x, y), ...o });
  N.stepNet(me(100, 100, { cut: 'nomad', face: 'E' }), 'surface');
  eq(T.sent.pos.at(-1).cut, 'nomad'); eq(T.sent.pos.at(-1).face, 'E');
  const n = T.sent.pos.length;
  for (let i = 0; i < 5; i++) N.stepNet(me(100, 100, { cut: 'duster', face: 'E' }), 'surface');
  eq(T.sent.pos.length, n + 1, 'переоделся стоя — весть сразу'); eq(T.sent.pos.at(-1).cut, 'duster');
  for (let i = 0; i < 5; i++) N.stepNet(me(100, 100, { cut: 'duster', face: 'N' }), 'surface');
  eq(T.sent.pos.at(-1).face, 'N', 'обернулся — весть сразу');
  N.stepNet(me(100, 100, { cut: 'нет такого', face: '?' }), 'surface');
  // чужие: известный крой и сторона — берутся; ключ прототипа и мусор — мимо; без стороны — прежняя
  T.emit('pos', { id: 'a', x: 150, y: 120, layer: 'surface', cut: 'pilgrim', face: 'W' });
  eq(N.net.others.get('a').cut, 'pilgrim'); eq(N.net.others.get('a').face, 'W');
  T.emit('pos', { id: 'a', x: 150, y: 120, layer: 'surface', cut: '__proto__', face: 'Z' });
  eq(N.net.others.get('a').cut, undefined, 'ключ прототипа — мимо'); eq(N.net.others.get('a').face, 'W', 'без стороны — прежняя');
  for (const bad of ['constructor', 'toString', 'plumage', 42, null]) {
    T.emit('pos', { id: 'b', x: 160, y: 120, layer: 'surface', cut: bad });
    eq(N.net.others.get('b').cut, undefined, 'мусор — мимо: ' + bad);
  }
  T.emit('pos', { id: 'a', x: 150, y: 120, layer: 'surface', cut: 'tiers', face: 'E' });
  for (const it of R.othersToDraw(fakeCtx(), 'surface', 0, 0, 480, 270)) it.draw();   // тень в чужом крое — без ошибок
});

N._resetNet();
const passed = results.filter(r => r.status === 'pass').length;
for (const r of results) {
  if (r.status === 'pass') console.log('✓ ' + r.name);
  else console.log('✗ ' + r.name + '\n    ' + r.msg + '\n' + (r.stack || '').split('\n').slice(1, 4).join('\n'));
}
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
