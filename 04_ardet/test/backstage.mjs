// ═══════════════════════════════════════
// ЗА ЭКРАНОМ И ЯД — машина за стеклом (render/backstage.js): строки
// командной строки, блок-схемы ГОСТ 19.701, раскладка на любом экране;
// яд (world/toxic.js): без цифр — протёртое место и редкий прорыв пятном.
// Run: node test/backstage.mjs
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
    clearRect: noop, beginPath: noop, fill: noop, stroke: noop, createLinearGradient: grad, createRadialGradient: grad,
    measureText: () => ({ width: 10 }), setTransform: noop, fillText: noop, rect: noop, clip: noop, moveTo: noop, lineTo: noop,
    arc: noop, closePath: noop, font: '', textBaseline: 'alphabetic', imageSmoothingEnabled: false };
}
const base = new URL('../src/', import.meta.url);
const imp = p => import(new URL(p, base));
const BS = await imp('render/backstage.js');
const TX = await imp('world/toxic.js');
const { locations } = await imp('world/locations.js');

const SCREENS = [[1920, 1080], [1280, 720], [2732, 2048], [844 * 3, 390 * 3], [390 * 3, 844 * 3]];

await test('за экраном: сеанс командной строки — строки не шире экрана машины, внизу приглашение, дата машины подставлена', () => {
  const L = BS.sessionLines(new Date(2026, 9, 23, 4, 7));
  assert(L.length >= 30, 'сеанс полон: ' + L.length);
  for (const l of L) assert(l.s.length <= BS.COLS, `шире ${BS.COLS}: «${l.s}»`);
  for (const l of L) assert(!/[{}]/.test(l.s), 'подставлено: ' + l.s);
  assert(L.some(l => l.s.includes('23.10.26') && l.s.includes(' 4:07')), 'дата и время машины');
  eq(L[L.length - 1].s, BS.PROMPT, 'последняя — приглашение');
  assert(L[0].dim && !L[L.length - 2].dim, 'прошлый сеанс тусклее нынешнего');
  for (const k of ['pit.dat', 'Отбой.', '26.09.22', '01.01.80', 'пересмотрена']) assert(L.some(l => l.s.includes(k)), 'по канону мест: ' + k);
});

await test('за экраном: раскладка на любом экране — шрифт читается, терминал и схемы в экране, строка в ширину влезает', () => {
  for (const [W, H] of SCREENS) {
    const L = BS.backLayout(W, H);
    assert(L.fs >= 10 && L.fs <= 40, `${W}×${H}: шрифт ${L.fs}`);
    assert(L.term.w >= BS.COLS * L.cw * 0.98, `${W}×${H}: строка не влезает`);
    for (const R of [L.term, L.chart]) assert(R.x >= 0 && R.y >= 0 && R.x + R.w <= W + 1 && R.y + R.h <= H + 1, `${W}×${H}: рамка вне экрана`);
    if (L.land) assert(L.chart.x >= L.term.x + L.term.w, `${W}×${H}: схемы налезают на терминал`);
    else assert(L.chart.y >= L.term.y + L.term.h, `${W}×${H}: схемы налезают на терминал`);
  }
});

await test('за экраном: блок-схемы по ГОСТ 19.701 — пуск-останов, данные, процесс, решение; узлы в рамке, ветвь не налезает', () => {
  const kinds = new Set(BS.CHARTS.flatMap(C => C.nodes.map(n => n.k)));
  for (const k of ['term', 'data', 'proc', 'dec']) assert(kinds.has(k), 'нет фигуры ' + k);
  for (const C of BS.CHARTS) {
    eq(C.nodes[0].k, 'term'); eq(C.nodes[C.nodes.length - 1].k, 'term', 'начало и конец — пуск-останов');
    for (const n of C.nodes.filter(n => n.k === 'dec')) assert(n.down && n.side && n.side.on && n.down !== n.side.on, 'у решения два выхода: да/нет');
  }
  for (const [W, H] of SCREENS) {
    const L = BS.backLayout(W, H), R = { x: L.chart.x, y: L.chart.y, w: L.chart.w, h: L.chart.h * 0.56 };
    const B = BS.chartBoxes(BS.CHARTS[0], R, L.fs);
    for (const b of B) {
      assert(b.x >= R.x - 1 && b.x + b.w <= R.x + R.w + 1 && b.y >= R.y && b.y + b.h <= R.y + R.h + 1, `${W}×${H}: узел вне рамки`);
      if (b.side) assert(b.side.x > b.x + b.w && b.side.x + b.side.w <= R.x + R.w + 1, `${W}×${H}: боковая ветвь налезает`);
    }
    for (let i = 1; i < B.length; i++) assert(B[i].y > B[i - 1].y + B[i - 1].h, `${W}×${H}: узлы налезают`);
  }
});

await test('яд: протирается гладь озера, подвал, труба, пропасть — не огонь и не живые', () => {
  const srcs = locations.filter(l => l.zone === 'toxic' || ['lake', 'pipeline', 'basement', 'dumpster', 'pit'].includes(l.id));
  const worn = srcs.map(TX.wornOf).filter(Boolean).map(P => P.id);
  for (const id of ['lake', 'basement', 'pipeline', 'pit']) assert(worn.includes(id), 'не протёрто: ' + id);
  assert(!worn.includes('dumpster'), 'горящая мусорка — тепло не растрируется');
  assert(!srcs.filter(l => l.npc).some(l => worn.includes(l.id)), 'живые не протираются');
  const lake = TX.wornOf(locations.find(l => l.id === 'lake')), pipe = TX.wornOf(locations.find(l => l.id === 'pipeline'));
  assert(lake.rx > pipe.rx * 1.4, 'озеро протёрто шире, чем труба у пробоины');
});

await test('яд: протёртость — растром, гуще к середине, края в эллипсе, сила ступенями по яду', () => {
  const P = TX.wornOf(locations.find(l => l.id === 'lake'));
  const w = P.rx * 2, h = P.ry * 2;
  eq(TX.wornMask(P, 0).reduce((a, b) => a + b, 0), 0, 'нет яда — нет протёртого');
  const lo = TX.wornMask(P, 0.4), hi = TX.wornMask(P, 1);
  const n = m => m.reduce((a, b) => a + b, 0);
  assert(n(hi) > n(lo) * 1.3 && n(hi) < w * h * 0.8, `сила: ${n(lo)} → ${n(hi)} из ${w * h}`);
  for (let k = 0; k < lo.length; k++) if (lo[k]) assert(hi[k], 'сильнее — протёрто и то, что было');
  let mid = 0, edge = 0, nm = 0, ne = 0;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const dx = (i + 0.5 - P.rx) / P.rx, dy = (j + 0.5 - P.ry) / P.ry, d = dx * dx + dy * dy;
    if (d >= 1) assert(!hi[j * w + i], 'вне эллипса не протёрто');
    else if (d < 0.25) { mid += hi[j * w + i]; nm++; } else if (d > 0.6) { edge += hi[j * w + i]; ne++; }
  }
  assert(mid / nm > edge / ne * 1.5, `к середине гуще: ${(mid / nm).toFixed(2)} / ${(edge / ne).toFixed(2)}`);
});

await test('яд: прорыв — не чаще раза в две минуты; расходится растром полсекунды, держится, затягивается', () => {
  assert(TX.GAP >= 7200, 'слово автора: не дождём — не чаще раза в две минуты');
  assert(TX.IN >= 30 && TX.OUT >= TX.IN, 'не вспышкой: расходится и затягивается постепенно');
  eq(TX.burstLevel(-1), 0); eq(TX.burstLevel(TX.IN + 5), 1); eq(TX.burstLevel(TX.IN + TX.HOLD + TX.OUT), 0);
  let prev = 0;
  for (let t = 0; t < TX.IN; t++) { const v = TX.burstLevel(t); assert(v >= prev && v > 0, 'расходится'); prev = v; }
  for (let t = TX.IN + TX.HOLD; t < TX.IN + TX.HOLD + TX.OUT; t++) { const v = TX.burstLevel(t); assert(v <= prev, 'затягивается'); prev = v; }
  const w = 200, h = 90, m = TX.burstMask(w, h, 1, 7);
  assert(m[(h >> 1) * w + (w >> 1)] && !m[0] && !m[w - 1] && !m[(h - 1) * w], 'пятном: середина открыта, углы — нет');
  const half = TX.burstMask(w, h, 0.5, 7);
  for (let k = 0; k < half.length; k++) if (half[k]) assert(m[k], 'раскрывается, не мигая');
});

await test('яд: машина допечатывает о месте — команда по знаку, ответ строкой, в конце приглашение с курсором', () => {
  for (const id of ['lake', 'pipeline', 'pit', 'basement', 'nocturnal', '_']) {
    const L = TX.BURST_LINES[id];
    assert(L && L[0][0] === '$', id + ': начинается с команды');
    for (const s of L) assert((s[0] === '$' ? BS.PROMPT.length + s.length - 1 : s.length) <= 40, `${id}: строка не влезет в пятно: ${s}`);
  }
  const L = TX.BURST_LINES.lake;
  eq(TX.typedAt(L, 0).lines.length, 0, 'вначале пусто');
  const a = TX.typedAt(L, 14), b = TX.typedAt(L, 20);
  assert(a.lines[0].s.length < b.lines[0].s.length && a.lines[0].s.startsWith(BS.PROMPT), 'команда печатается по знаку');
  const end = TX.typedAt(L, 2000);
  eq(end.lines.length, L.length + 1, 'все строки и приглашение');
  eq(end.lines[end.lines.length - 1].s, BS.PROMPT); eq(end.cursor, end.lines.length - 1, 'курсор — у приглашения');
  let prev = 0;
  for (let t = 0; t < 400; t += 3) { const n = TX.typedAt(L, t).lines.reduce((a, l) => a + l.s.length, 0); assert(n >= prev, 'печать не пятится'); prev = n; }
});

await test('яд: проход без холста (проверки) — без ошибок; без камеры поверхности (дом, изнанка) — ничего', () => {
  TX.toxic.update(0, 0, locations);
  TX.toxic.step(0, 0, locations);
  TX.toxic.composite(fakeCtx(), { width: 1280, height: 720 });
  TX.toxic.setView(0, 0);
  TX.toxic.composite(fakeCtx(), { width: 1280, height: 720 });
  TX.toxic.setView(0, 0);
  TX.toxic.composite(fakeCtx(), { width: 1280, height: 720 }, true);
  eq(BS.backstage(1280, 720), null, 'без document слоя нет — и рисовать нечего');
  BS.drawBack(fakeCtx(), null, 0, 0, 10, 10);
});

const passed = results.filter(r => r.status === 'pass').length;
for (const r of results) {
  if (r.status === 'pass') console.log('✓ ' + r.name);
  else console.log('✗ ' + r.name + '\n    ' + r.msg + '\n' + (r.stack || '').split('\n').slice(1, 4).join('\n'));
}
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
