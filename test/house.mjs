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
    clearRect: noop, beginPath: noop, fill: noop, createLinearGradient: grad, createRadialGradient: grad, measureText: () => ({ width: 10 }) };
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

const passed = results.filter(r => r.status === 'pass').length;
for (const r of results) {
  if (r.status === 'pass') console.log('✓ ' + r.name);
  else console.log('✗ ' + r.name + '\n    ' + r.msg + '\n' + (r.stack || '').split('\n').slice(1, 4).join('\n'));
}
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
