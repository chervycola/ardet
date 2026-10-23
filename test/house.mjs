// ═══════════════════════════════════════
// ДОМ ПРОБУЖДЕНИЯ — пол и мебель, ход из комнаты в сени, ботинки у порога,
// окно по времени суток, свет, дом снаружи в квартале, кадр без ошибок.
// Run: node test/house.mjs
// ═══════════════════════════════════════
const noop = () => {};
globalThis.window = { innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1, addEventListener: noop, removeEventListener: noop };
const results = [];
async function test(name, fn) {
  try { await fn(); results.push({ name, status: 'pass' }); }
  catch (e) { results.push({ name, status: 'fail', msg: e.message, stack: e.stack }); }
}
function assert(c, m) { if (!c) throw new Error(m || 'assertion failed'); }
function eq(a, b, m) { if (a !== b) throw new Error((m || 'eq') + `: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); }
const grad = () => ({ addColorStop: noop });
function fakeCtx() {
  return { globalAlpha: 1, fillStyle: '#000', fillRect: noop, drawImage: noop, save: noop, restore: noop, translate: noop,
    clearRect: noop, beginPath: noop, fill: noop, createLinearGradient: grad, createRadialGradient: grad, measureText: () => ({ width: 10 }),
    setTransform: noop, fillText: noop, rect: noop, clip: noop, font: '', textBaseline: 'alphabetic', imageSmoothingEnabled: false };
}
const base = new URL('../src/', import.meta.url);
const imp = p => import(new URL(p, base));
const H = await imp('world/house.js');
const RH = await imp('render/house.js');
const { STREETS, inQuarter } = await imp('world/town.js');
const { locations } = await imp('world/locations.js');

await test('дом: проснулся — на полу перед своей кроватью; вошёл — на пороге', () => {
  assert(H.walkable(H.WAKE.x, H.WAKE.y), 'место пробуждения — на полу');
  assert(H.WAKE.y > H.BED.y1 && H.WAKE.x > H.BED.x0 && H.WAKE.x < H.BED.x1, 'перед своей кроватью');
  assert(H.walkable(H.ENTRY.x, H.ENTRY.y), 'порог — на полу');
  assert(H.ENTRY.x > H.DOOR.x0 && H.ENTRY.x < H.DOOR.x1, 'у двери');
});
await test('дом: сквозь мебель и стены не пройти; в проём между комнатами — да', () => {
  for (const B of [H.BED, H.BED2, H.STOOL, H.STOVE]) assert(!H.walkable((B.x0 + B.x1) / 2, (B.y0 + B.y1) / 2), 'мебель');
  assert(!H.walkable(H.ROOM.x1 + 3, H.PART.g0 - 10), 'перегородка над проёмом');
  assert(H.walkable((H.PART.x0 + H.PART.x1) / 2, (H.PART.g0 + H.PART.g1) / 2), 'проём');
  assert(!H.walkable(100, H.ROOM.y0 - 6), 'стена');
  assert(!H.walkable(100, H.FRONT.y1 + 2), 'за передней стеной — улица');
  const p = { x: H.WAKE.x - 6, y: H.WAKE.y - 23 };
  for (let i = 0; i < 200; i++) H.houseMove(p, 0, -1);           // вверх — в свою кровать
  assert(H.walkable(p.x + 6, p.y + 23) && p.y + 23 > H.BED.y1, 'упёрся в кровать');
});
await test('дом: путь из комнаты в сени — через проём; в той же комнате — прямо', () => {
  const r1 = H.houseRoute(H.WAKE.x, H.WAKE.y, H.ENTRY.x, H.ENTRY.y);
  eq(r1.length, 3, 'через проём');
  assert(r1.every(q => H.walkable(q.x, q.y)), 'по полу');
  eq(H.houseRoute(H.WAKE.x, H.WAKE.y, 100, 90).length, 1, 'прямо');
  const w = H.houseRoute(H.WAKE.x, H.WAKE.y, 100, 5);             // ткнул в стену — к ближайшему полу
  assert(w.length === 1 && H.walkable(w[0].x, w[0].y), 'ближайший пол');
});
await test('дом: проснулся — сидя, ботинки у порога; вышел — обулся; вошёл снова — ботинок нет', () => {
  H.house.wake();
  assert(H.house.active && H.house.seated && H.house.boots);
  assert(H.houseThings().some(th => th.id === 'h_boots'));
  H.house.leave();
  assert(!H.house.active && !H.house.boots);
  H.house.enter();
  assert(H.house.active && !H.house.seated && !H.houseThings().some(th => th.id === 'h_boots'), 'обут');
  H.house.leave();
});
await test('дом: вещи — канон в осмотре; окно по суткам; дверь выводит', () => {
  const by = id => H.THINGS.find(th => th.id === id);
  eq(by('h_bed2').look, 'Вторая кровать. Застелена и холодна.');
  assert(by('h_journal').look.includes('Пуст'), 'журнал пуст');
  assert(by('h_boots').look.includes('Стоптаны сильнее, чем помнишь'), 'ботинки');
  eq(by('h_door').useAction, 'house_exit');
  assert(H.houseThings(true).find(th => th.id === 'h_window').look.includes('луна'));
  assert(H.houseThings(false).find(th => th.id === 'h_window').look.includes('серый'));
  for (const th of H.THINGS) { assert(th.house, 'вещь дома'); assert(H.walkable(th.at[0], th.at[1]), 'к ' + th.id + ' можно подойти'); }
});
await test('дом: записку в доме не оставить — своя строка', async () => {
  const N = await imp('net/net.js');
  N._resetNet();
  globalThis.localStorage = { getItem: () => null, setItem: noop };
  await N.startNet({ kind: 'fake', uid: 'me', async start() { return true; }, on() {}, sendPos() {}, sendSay() {}, stop() {}, async notesIn() { return []; }, async addNote() { throw new Error('не должно'); }, async vote() { return {}; } });
  N.stepNet({ x: 50, y: 50, dir: 1, moving: false }, 'house');
  eq((await N.netLeaveNote('здесь')).error, 'house');
  N._resetNet();
});
await test('дом: свет — огонёк у сердца, окно и щель двери; тёплое одно', () => {
  const night = H.houseLights(50, 50, { sun: null, moon: 1 }), day = H.houseLights(50, 50, { sun: { elev: 0.5 }, moon: 0 });
  eq(night.length, 4); eq(day.length, 4);
  const warm = night.filter(L => L.color[0] > L.color[1] + 30);
  eq(warm.length, 1, 'одно тёплое пятно');
  assert(H.AMBIENT.night < H.AMBIENT.day, 'ночью темнее');
});
await test('дом снаружи: угол главной улицы квартала и улицы у церкви, фасадом на главную, в квартале', () => {
  const L = [];
  const h = H.buildHouse(L);
  eq(L.length, 1); eq(h.id, 'wake_house'); eq(h.useAction, 'house_enter');
  const church = STREETS.find(s => s[0] === 'road:q-church')[1], cx = church.reduce((s, p) => s + p[0], 0) / church.length;
  assert(h.x > cx && h.x - cx < 30, 'к востоку от улицы у церкви, рядом');
  const d = H.doorOutside();
  assert(Math.abs(d.y + 23 - 3990) < 30, 'дверь — к главной улице');
  assert(inQuarter(h.x + h.w / 2, h.y + h.h / 2), 'в квартале');
  for (const l of locations) if (l.id !== 'wake_house') assert(!(h.x < l.x + l.w && h.x + h.w > l.x && h.y < l.y + l.h && h.y + h.h > l.y), 'не налезает на ' + l.id);
  h.drawSelf(fakeCtx(), h, 0);
});
await test('дом: кадр ночью и днём, с ботинками и без — без ошибок; герой по глубине', () => {
  let drawn = 0;
  H.house.wake();
  RH.drawHouseWorld(fakeCtx(), { x: H.WAKE.x - 6, y: H.WAKE.y - 23 }, () => drawn++, { sun: null, moon: 1 });
  H.house.leave(); H.house.enter();
  RH.drawHouseWorld(fakeCtx(), { x: H.ENTRY.x - 6, y: H.ENTRY.y - 23 }, () => drawn++, { sun: { elev: 0.4 }, moon: 0 });
  H.house.leave();
  eq(drawn, 2, 'герой нарисован в каждом кадре');
});

// ── пробуждение в мире цифры (render/wakefx.js) ──
const WF = await imp('render/wakefx.js');
await test('пробуждение: пятнадцать секунд, как муть и веки; подгрузки — на открытии век (lidBlink 8, 28, 58, 84%)', () => {
  eq(WF.LEN, 900, '15 с по 60 шагов');
  eq(JSON.stringify(WF.OPEN), JSON.stringify([0.08, 0.28, 0.58, 0.84].map(k => Math.round(k * 900))));
});
await test('пробуждение: мир собирается блоками — крупно, мельче, до точки; строка развёртки идёт сверху вниз', () => {
  let last = 99;
  for (let a = 0; a < 330; a += 5) {
    const D = WF.decodeAt(a);
    if (WF.OPEN.some(o => a >= o && a < o + 16)) continue;
    assert(D.b <= last, 'не крупнее прежнего: ' + a);
    assert(D.prev >= D.b && D.k >= 0 && D.k <= 1, 'ниже строки — крупнее');
    last = D.b;
  }
  eq(WF.decodeAt(0).b, 16); eq(WF.decodeAt(340).b, 1); eq(WF.decodeAt(900).b, 1, 'после — чисто');
  for (const o of WF.OPEN) { assert(WF.decodeAt(o + 1).b >= 2, 'веки открылись — подгрузка'); eq(WF.decodeAt(o + 20).b, o + 20 < 330 ? WF.decodeAt(o + 20).b : 1); }
  assert(WF.decodeAt(100).k > WF.decodeAt(85).k, 'строка движется вниз');
});
await test('пробуждение: дрожь всплесками целыми точками; рывки строк и код — в начале и на открытии век; «меньше движения» — без них', () => {
  let shaken = 0, still = 0;
  for (let a = 0; a < 900; a++) { const [x, y] = WF.tremorAt(a, 7); assert(Math.abs(x) <= 2 && Math.abs(y) <= 2 && Number.isInteger(x) && Number.isInteger(y)); if (x || y) shaken++; else still++; }
  assert(shaken > 50 && still > 300, 'всплесками: ' + shaken + '/' + still);
  assert(WF.slicesAt(30, 360, 7).length >= 1, 'в начале рвёт');
  eq(WF.slicesAt(400, 360, 7).length, 0, 'между — тихо');
  assert(WF.slicesAt(WF.OPEN[2] + 2, 360, 7).length >= 1, 'на открытии век — рвёт');
  const code = WF.codeAt(40, 640, 360, 7);
  assert(code.length >= 1 && code.every(c => /^[01]+$/.test(c.s) && c.x >= 0 && c.y >= 0 && c.y < 360), 'двоичный код в кадре');
  eq(WF.codeAt(400, 640, 360, 7).length, 0);
  for (const a of [10, 40, WF.OPEN[1] + 3]) { eq(WF.tremorAt(a, 7, true).join(), '0,0'); eq(WF.slicesAt(a, 360, 7, true).length, 0); eq(WF.codeAt(a, 640, 360, 7, true).length, 0); }
  let flips = 0, prev = '';
  for (let a = 0; a < 60; a++) { const k = JSON.stringify(WF.codeAt(a, 640, 360, 7)); if (k !== prev) flips++; prev = k; }
  assert(flips <= 9, 'код меняется не чаще раза в восемь кадров: ' + flips);
});
await test('пробуждение: проход без холста (проверки) — без ошибок', () => {
  WF.wakefx.start();
  WF.wakePass(fakeCtx(), null, 2);
  WF.wakePass(fakeCtx(), { width: 1280, height: 720 }, 2);
});

const passed = results.filter(r => r.status === 'pass').length;
for (const r of results) {
  if (r.status === 'pass') console.log('✓ ' + r.name);
  else console.log('✗ ' + r.name + '\n    ' + r.msg + '\n' + (r.stack || '').split('\n').slice(1, 4).join('\n'));
}
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
