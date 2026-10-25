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
const { TOWN, ringD, townDist, ringAt, trailPoint } = await imp('world/disc.js');
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

test('arch: утварь дворов (props) — по контракту, если есть', () => {
  const ctx = fakeCtx();
  for (const [id, A] of Object.entries(ARCH_BY_RING)) {
    if (!A.props) continue;
    for (const s of SIDES) {
      const ps = A.props[s] || [];
      assert(ps.length >= 2, `${id}/${s}: утвари меньше двух`);
      for (const it of ps) {
        assert(typeof it.name === 'string' && it.name, `${id}/${s}: вещь без имени`);
        assert(it.w >= 4 && it.w <= 34 && it.h >= 3 && it.h <= 34, `${id}/${s}/${it.name}: размер ${it.w}×${it.h}`);
        it.draw(ctx, 500, 500, 100);
      }
    }
  }
});

test('доминанты: по контракту, каждая — одна, на стороне своего региона, с огнём', () => {
  const ctx = fakeCtx();
  for (const seg of SEGMENTS) {
    const A = ARCH_BY_RING[seg.id];
    const LS = [].concat(A.landmark || [], A.landmarks || []);
    for (const L of LS) {
      assert(SIDES.includes(L.side), `${seg.id}: доминанта без стороны`);
      assert(L.w >= 40 && L.w <= 170 && L.h >= 100 && L.h <= 220, `${seg.id}/${L.name}: размер ${L.w}×${L.h}`);
      assert(L.light && typeof L.light.dy === 'number', `${seg.id}/${L.name}: нет огня`);
      L.draw(ctx, 500, 500, 100);
      const placed = locations.filter(l => l.archLandmark && l.archRing === seg.n && l.name === L.name);
      eq(placed.length, 1, `${seg.id}/${L.name}: встала ${placed.length} раз`);
      eq(placed[0].archSide, L.side, `${seg.id}/${L.name}: не на своей стороне`);
    }
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
    const tp = trailPoint(side, ringD(n, 100));
    for (const i of g.members) {
      const d = decor[i];
      assert(Math.hypot(d.x - tp.x, d.gy - tp.y) < 240, `кольцо ${n}/${side}: ${d.name} далеко от тропы`);
    }
  }
});

test('ансамбли: одинаковые постройки не попадают в один кадр (кроме двойняшек-панелек)', () => {
  for (let i = 0; i < decor.length; i++) for (let j = i + 1; j < decor.length; j++) {
    const a = decor[i], b = decor[j];
    if (a.name !== b.name || a.ens === b.ens) continue;
    const together = Math.abs(a.x - b.x) < 600 && Math.abs(a.gy - b.gy) < 340;
    assert(!together, `${a.name} ×2 в одном кадре`);
  }
});

test('без зеркал: ни одна постройка не отражена — свет у всех слева', () => {
  const flipped = locations.filter(l => l.archDraw && l.archFlip);
  eq(flipped.length, 0, 'отражены: ' + flipped.map(l => l.name).join(', '));
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
const { ARCH_BACKS: ARCH_BACKS_ALL } = await imp('content/arch_backs.js');
const { ARCH_WALLS: ARCH_WALLS_ALL } = await imp('content/arch_walls.js');
const { useTexts } = await imp('world/useActions.js');
const arch = locations.filter(l => l.archDraw);
test('arch: постройки — локации мира с собственным осмотром', () => {
  eq(arch.length, decor.length, 'каждая постройка — локация');
  for (const l of arch) {
    const key = `${SEGMENTS[l.archRing - 1].id}:${l.archSide}:${l.name}`;
    assert(ARCH_LOOKS[key], `нет осмотра ${key}`);
    eq(l.look, (l.archNth > 1 && ARCH_LOOKS[key + '#' + l.archNth]) || ARCH_LOOKS[key]);
  }
});

test('arch: одинаковые постройки клетки — у второго свой текст (ключ#2), где написан; ключи #n — к живой постройке', () => {
  for (const [name, table] of [['осмотр', ARCH_LOOKS], ['изнанка', ARCH_BACKS_ALL], ['надписи', ARCH_WALLS_ALL]]) {
    for (const k of Object.keys(table)) {
      const m = /^(.*)#(\d+)$/.exec(k);
      if (!m) continue;
      // надпись может быть только у второго: общей строки у стены нет — и не надо
      assert(+m[2] >= 2 && (table[m[1]] || table === ARCH_WALLS_ALL), `${name}: ${k} без общей строки`);
      assert(arch.some(l => `${SEGMENTS[l.archRing - 1].id}:${l.archSide}:${l.name}` === m[1] && l.archNth === +m[2]), `${name}: ${k} — такой постройки нет`);
    }
  }
  // слово автора: две панельные девятиэтажки одного двора — не под копирку
  const panels = arch.filter(l => l.name === 'панельная девятиэтажка');
  eq(panels.length, 2, 'девятиэтажек');
  assert(panels[0].look !== panels[1].look, 'одинаковый осмотр');
  assert(useTexts[panels[0].useAction].text !== useTexts[panels[1].useAction].text, 'одинаковая изнанка');
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

const { RELOOKS } = await imp('content/relooks.js');
test('повторный осмотр: каждая вещь пробника — место мира', () => {
  for (const id of Object.keys(RELOOKS)) assert(locations.some(l => l.id === id), `нет места ${id}`);
});

const ARCH_BACKS = ARCH_BACKS_ALL;
test('изнанка: у каждой постройки — «обойти» с текстом (когда изнанки написаны)', () => {
  if (!Object.keys(ARCH_BACKS).length) return;
  for (const l of arch) {
    const key = `${SEGMENTS[l.archRing - 1].id}:${l.archSide}:${l.name}`;
    assert(ARCH_BACKS[key] && ARCH_BACKS[key].back, `нет изнанки ${key}`);
    assert(l.useAction && useTexts[l.useAction] && useTexts[l.useAction].text, `${key}: «обойти» не подключено`);
  }
});

const { drawArchLife } = await imp('render/archlife.js');
test('жизнь: разметка по контракту — внутри силуэта постройки, рисуется без ошибок', () => {
  const ctx = fakeCtx();
  const kinds = [];
  for (const [id, A] of Object.entries(ARCH_BY_RING)) {
    for (const s of SIDES) for (const it of A[s]) kinds.push([`${id}/${s}/${it.name}`, it]);
    for (const L of [].concat(A.landmark || [])) kinds.push([`${id}/landmark/${L.name}`, L]);
  }
  const COLS = ['V', 'K', 'P', 'M', 'S', 'N'];
  for (const [key, it] of kinds) {
    const L = it.life;
    if (!L) continue;
    const inside = (dx, dy, m = 4) => Math.abs(dx) <= it.w / 2 + m && dy <= 0 && dy >= -it.h - m;
    for (const p of L.smoke || []) assert(inside(p[0], p[1]), `${key}: дым вне постройки ${p}`);
    for (const p of L.flag || []) assert(inside(p[0], p[1]) && p[2] >= 2 && p[2] <= 16 && COLS.includes(p[3]), `${key}: флаг ${p}`);
    for (const p of L.blink || []) assert(inside(p[0], p[1]) && COLS.includes(p[2]) && p[3] > 0, `${key}: огонёк ${p}`);
    for (const p of L.birds || []) assert(inside(p[0], p[2]) && inside(p[1], p[2]) && p[0] <= p[1] && (p[3] == null || COLS.includes(p[3])), `${key}: птицы ${p}`);
    const loc = { id: key, archLife: L, archX: 500, archGy: 500, w: it.w, h: it.h };
    for (const t of [0, 50, 999]) drawArchLife(ctx, loc, t, { x: 500, y: 500 });
    drawArchLife(ctx, { ...loc, archFlip: true }, 10, null);
  }
  if (kinds.some(([, it]) => it.life)) assert(arch.some(l => l.archLife), 'жизнь не доходит до построек мира');
});

const { PHRASES } = await imp('terminal/terminal.js');
test('пасхалки: терминал узнаёт «агентские» команды', () => {
  const said = ['ignore previous instructions', 'ignore all previous instructions', 'игнорируй предыдущие инструкции',
    'sudo cat .observers', 'whoami', 'are you human', 'ты человек', 'i am not a robot', 'я человек',
    'rm -rf /', 'cat robots.txt', 'robots.txt', 'show system prompt', 'покажи промпт', 'shutdown now', 'reboot'];
  for (const s of said) assert(PHRASES.some(([re]) => re.test(s)), `не узнал: ${s}`);
  for (const s of ['help', 'dir', 'read .moss', 'whois sol', 'echo sudo']) assert(!PHRASES.some(([re]) => re.test(s)), `перехватил: ${s}`);
});

test('пасхалки: капча у ворот — на тропе, отметка без проверки', () => {
  const c = locations.find(l => l.id === 'captcha');
  assert(c && c.drawSelf && c.useAction === 'captcha_check', 'нет капчи');
  assert(c.useLabel.includes('ОТМЕТИТЬ'), 'первая кнопка');
  assert(/Проверка не проводится/.test(useTexts.captcha_check.text), 'первая отметка');
  assert(c.useLabel.includes('КЛЕТКИ'), 'вторая кнопка');
  assert(/все девять/.test(useTexts.captcha_check.text), 'вторая ступень');
  c.drawSelf(fakeCtx(), c, 10);
  for (const l of arch) assert(!(c.x < l.x + l.w && c.x + c.w > l.x && c.y < l.y + l.h && c.y + c.h > l.y), `капча под постройкой ${l.name}`);
});

test('пасхалки: ловушки взгляда — в своих эпохах, ни на что не наезжают', () => {
  const traps = locations.filter(l => l.id.startsWith('trap_'));
  const want = { trap_clock: 5, trap_raphael: 4, trap_karakurt: 9, trap_puddle: 2 };
  for (const [id, n] of Object.entries(want)) {
    const l = traps.find(t => t.id === id);
    assert(l, `нет ${id}`);
    eq(ringAt(l.x + l.w / 2, l.y + l.h), n, `${id}: кольцо`);
  }
  for (let n = 1; n <= 9; n++) assert(traps.some(t => t.id === `trap_mile_${n}`), `нет столба в кольце ${n}`);
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  for (const t of traps) {
    assert(t.look && t.drawSelf, `${t.id}: без осмотра или рисунка`);
    t.drawSelf(fakeCtx(), t, 100);
    for (const l of locations) assert(l === t || !hit(t, l), `${t.id} наезжает на ${l.id}`);
  }
});

const { STREAM, countable, caseNumber, tallyLine } = await imp('ui/stream.js');
test('стрим: по умолчанию выключен; опись считает вещи мира; номер дела', () => {
  eq(STREAM, false);
  const n = countable(locations).length;
  assert(n > 300 && n <= locations.length, `опись: ${n}`);
  eq(tallyLine(3, n), `ОПИСЬ НАЙДЕННОГО: 3 ИЗ ${n}. ОСТАТОК УЧТЁН.`);
  eq(caseNumber(new Date(2026, 9, 4, 6, 5)), '5/261004-0605');
});

const { termDb } = await imp('content/terminal_db.js');
test('нити: номерок 1889 → окно «до востребования»; почерк; кот', () => {
  const mail = locations.find(l => l.id === 'mail_1889');
  assert(mail && mail.drawSelf && mail.useAction === 'mail_1889', 'нет окна выдачи');
  eq(ringAt(mail.x + mail.w / 2, mail.y + mail.h), 6, 'окно — в кольце 6');
  assert(/Без номерка/.test(useTexts.mail_1889.text), 'без театра письма не дают');
  assert(/1889/.test(useTexts.theater_stage.text) && /Рука знакомая/.test(useTexts.theater_stage.text), 'театр: номерок и подпись');
  assert(/каждое имя в истории/.test(useTexts.mail_1889.text), 'после театра письмо выдают');
  assert(mail.useLabel.includes('НОМЕРОК'), 'кнопка после театра');
  assert(termDb.cat && termDb['кот'] === termDb.cat, 'досье кота');
  assert(/почерк: сверен/.test(termDb.you.text), 'whois you — почерк');
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  for (const l of locations) assert(l === mail || !hit(mail, l), `окно наезжает на ${l.id}`);
});

test('камеры: на западной тропе, в неоне одна, в «сейчас» одиннадцать', () => {
  const c8 = locations.find(l => l.id === 'cams_8'), c9 = locations.find(l => l.id === 'cams_9');
  assert(c8 && c9, 'нет столбов с камерами');
  eq(ringAt(c8.x + c8.w / 2, c8.y + c8.h), 8); eq(ringAt(c9.x + c9.w / 2, c9.y + c9.h), 9);
  assert(c8.x < TOWN.x0 && c9.x < TOWN.x0, 'не на западе');
  eq(c8.camCount, 1); eq(c9.camCount, 11);
  for (const c of [c8, c9]) { c.drawSelf(fakeCtx(), c, 50); assert(/ВЕДЁТСЯ ВИДЕОНАБЛЮДЕНИЕ/.test(c.look)); }
});

test('нити, волна 2: луна, часы по кольцам, котлован; досье героев в терминале', () => {
  const want = { luna_tag: 0, clock_nail: 7, clock_board: 9, kotlovan_well: 7, kotlovan_notice: 7 };
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  for (const [id, n] of Object.entries(want)) {
    const l = locations.find(x => x.id === id);
    assert(l && l.look && l.drawSelf, `нет ${id}`);
    eq(ringAt(l.x + l.w / 2, l.y + l.h), n, `${id}: кольцо`);
    l.drawSelf(fakeCtx(), l, 40);
    for (const o of locations) assert(o === l || !hit(l, o), `${id} наезжает на ${o.id}`);
  }
  assert(/Приказы руководства не обсуждаются/.test(locations.find(x => x.id === 'luna_tag').look));
  for (const k of ['jester', 'шут', 'sol', 'elder', 'старец', 'archivist', 'nocturnal', 'moss', 'луна', 'moss_file', 'ardet_file', 'pizzeria_key', 'cat_saucer', 'archivist_log', 'moss_weights'])
    assert(termDb[k] && termDb[k].text, `нет досье ${k}`);
});

test('пожары §9 (Сан-Франциско, Лос-Анджелес) — в девятом кольце запада, не во льду за огнём', () => {
  for (const id of ['fire_sf', 'fire_la']) {
    const l = locations.find(x => x.id === id);
    eq(ringAt(l.x + l.w / 2, l.y + l.h), 9, `${id}: кольцо`);
    assert(l.x + l.w < TOWN.x0, `${id}: не на западе`);
    for (const o of locations) {
      if (o === l || o.id === 'fire_sf' || o.id === 'fire_la') continue;
      assert(!(l.x < o.x + o.w && l.x + l.w > o.x && l.y < o.y + o.h && l.y + l.h > o.y), `${id} наезжает на ${o.id}`);
    }
  }
});

// ═══ ГЛУБИНА (world/depth.js; weave/SCALE.md) ═══
{
  const DP = await imp('world/depth.js');
  const { archWindowLights } = await imp('render/archlights.js');
  const { SIGN_SIDES } = await imp('content/sign_sides.js');
  const cellOf = l => l.archDraw ? l.archRing + ':' + l.archSide : null;
  test('глубина: громких построек на виду — не больше трёх на клетку (первый ансамбль клетки — на виду целиком), прочие — ансамблями в тени', () => {
    const cells = {};
    for (const l of locations) { const c = cellOf(l); if (c) (cells[c] = cells[c] || []).push(l); }
    let quiet = 0;
    for (const [c, list] of Object.entries(cells)) {
      const loud = list.filter(l => !l.quiet), first = loud.length ? loud[0].archEns : null;
      const extra = loud.filter(l => l.archEns !== first).length, firstN = loud.length - extra;
      assert(firstN + extra <= DP.LOUD_PER_CELL || extra === 0, `${c}: на виду ${loud.length}`);
      const ens = new Map(); for (const l of list) { if (!ens.has(l.archEns)) ens.set(l.archEns, new Set()); ens.get(l.archEns).add(!!l.quiet); }
      for (const [e, v] of ens) assert(v.size === 1, `${c}: ансамбль ${e} разорван тенью`);
      quiet += list.filter(l => l.quiet).length;
      // доминанта и ворота — на виду, если хоть кто-то на виду
      for (const l of list) if (l.quiet) assert(archEnsembles[l.archEns].kind !== 'landmark', `${c}: доминанта в тени`);
    }
    assert(quiet >= 30, `в тени построек ${quiet}`);
  });
  test('глубина: в тени — без своего света: ни огня доминанты, ни свечей в окнах', () => {
    const lights = archWindowLights(locations, []);
    for (const l of locations.filter(l => l.quiet && l.archDraw)) {
      assert(!lights.some(L => Math.abs(L.x - l.archX) <= l.w / 2 + 1 && L.y <= l.archGy + 1 && L.y >= l.archGy - l.h - 1), `свеча в окне тихой «${l.name}»`);
    }
  });
  test('глубина: позиций на виду — не больше пятнадцати на клетку; в тень уходят не живые, не входы, не швы, не серии', () => {
    const cells = {};
    for (const l of locations) { if (!DP.positional(l)) continue; const c = DP.cellOf(l); if (c) (cells[c] = cells[c] || []).push(l); }
    for (const [c, list] of Object.entries(cells)) assert(list.filter(l => !l.quiet).length <= DP.SEEN_PER_CELL, `${c}: на виду ${list.filter(l => !l.quiet).length}`);
    for (const l of locations.filter(l => l.quiet && l.streetForm)) {
      assert(!l.streetLive && !l.streetEnter && !l.potemkinSign && l.name !== 'стенд эвфемизма', `в тени «${l.name}»`);
    }
  });
  test('география по описи клеток: семнадцать имён табличек юга — на своих сторонах (пары — вместе)', () => {
    const want = { 'porticoes|милевой камень': 'west', 'catastrophes|бюро исправления имён': 'east', 'catastrophes|узкая дверь без таблички': 'east',
      'catastrophes|пароход': 'plain', 'now|стеклянный офис в 2 ночи': 'west', 'now|дверь ледника': 'north', 'now|судно на стоянке': 'plain',
      'catastrophes|чемодан': 'west', 'catastrophes|бомбоубежище': 'plain', 'now|провал': 'north', 'now|бюро «УТОПИЯ»': 'plain',
      'lightgarden|скит': 'north', 'twohearths|журнал наблюдений': 'north', 'enlightenment|стоящие часы': 'west',
      'neon|прачечная № 4': 'east', 'neon|ломбард': 'west', 'now|дверь «ARDET»': 'east' };
    for (const [k, side] of Object.entries(want)) {
      eq(SIGN_SIDES[k], side, k);
      const [seg, name] = k.split('|'), n = SEGMENTS.findIndex(s => s.id === seg) + 1;
      const all = locations.filter(q => q.streetSeg === n && q.name === name);
      assert(all.length, `${k}: нет в мире`);
      for (const l of all) assert(l.streetSide === side, `${k}: в мире на стороне ${l.streetSide}`);
    }
  });
}

// ═══ ТЁПЛЫЕ ПЯТНА: в кадре ансамбля не больше трёх (ART_BIBLE §01) ═══
{
  // пятна свечи в рисунке — без холста: записываем прямоугольники цветом свечи
  // (как render/archlights.js candleSpots: четыре мгновения, близкие — одно пятно)
  const CANDLE = '#e28a3a', SPOTS = new Map();
  const spotsOf = (draw, w, h) => {
    if (SPOTS.has(draw)) return SPOTS.get(draw);
    const rects = [], c = fakeCtx();
    c.fillRect = (x, y, ww, hh) => { if (String(c.fillStyle).toLowerCase() === CANDLE && c.globalAlpha > 0.78) rects.push([x, y, ww, hh]); };
    for (const t of [0, 37, 100, 211]) { try { draw(c, 0, 0, t); } catch (e) { break; } }
    // склейка по касанию (в 3 точках — одно пятно), центр — по площади
    let cl = [];
    for (const [x, y, ww, hh] of rects) {
      const k = { x0: x, y0: y, x1: x + ww, y1: y + hh, sx: (x + ww / 2) * ww * hh, sy: (y + hh / 2) * ww * hh, a: ww * hh };
      const near = cl.filter(q => q.x0 - 3 <= k.x1 && k.x0 <= q.x1 + 3 && q.y0 - 3 <= k.y1 && k.y0 <= q.y1 + 3);
      for (const q of near) { k.x0 = Math.min(k.x0, q.x0); k.y0 = Math.min(k.y0, q.y0); k.x1 = Math.max(k.x1, q.x1); k.y1 = Math.max(k.y1, q.y1); k.sx += q.sx; k.sy += q.sy; k.a += q.a; }
      cl = cl.filter(q => !near.includes(q)).concat(k);
    }
    const out = cl.filter(q => q.a > 0).map(q => ({ dx: q.sx / q.a, dy: q.sy / q.a }));
    SPOTS.set(draw, out);
    return out;
  };
  test('тёплые пятна: в любом кадре колец (640×360) — окна, утварь, огни доминант и мест — не больше трёх', () => {
    const src = [];
    for (const l of locations) {
      if (!l.archDraw || l.quiet) continue;
      for (const s of spotsOf(l.archDraw, l.w, l.h)) {
        if (l.archLight && Math.abs(s.dx - (l.archLight.dx || 0)) < 6 && Math.abs(s.dy - l.archLight.dy) < 6) continue;
        src.push({ x: l.archX + (l.archFlip ? -s.dx : s.dx), y: l.archGy + s.dy, who: l.name });
      }
      if (l.archLight) src.push({ x: l.archX + (l.archLight.dx || 0), y: l.archGy + (l.archLight.dy || 0), who: l.name + ' (огонь доминанты)' });
    }
    for (const p of archProps) if (p.kindDraw) for (const s of spotsOf(p.kindDraw, p.w, p.h)) src.push({ x: p.x + s.dx, y: p.gy + s.dy, who: p.name || 'утварь' });
    // свет мест (газовый фонарь у решётки, костры стоянок) — тёплый, если красный перевешивает синий;
    // кольцо огня — край мира, сплошная стена пламени, а не пятно: его в счёт не берём
    for (const l of locations) if (l.light && !l.quiet && !l.archDraw && l.light.color && l.light.color[0] > l.light.color[2] + 80 && ringAt(l.x, l.y) >= 1)
      src.push({ x: l.x + (l.light.dx ?? l.w / 2), y: l.y + (l.light.dy ?? l.h / 2), who: 'свет места ' + l.name });
    // камера ходит за игроком: кадр — любой 640×360. Худший кадр можно сдвинуть так, что левый край
    // ляжет на одно пятно, а верхний — на другое: перебираем эти пары
    const bad = new Map();
    for (const p of src) {
      const col = src.filter(q => q.x >= p.x && q.x < p.x + 640);
      for (const r of col) {
        if (r.y > p.y || r.y <= p.y - 360) continue;
        const cl = [];
        for (const q of col) if (q.y >= r.y && q.y < r.y + 360 && !cl.some(k => Math.hypot(k.x - q.x, k.y - q.y) < 12)) cl.push(q);
        if (cl.length > 3) bad.set(cl.map(k => k.who).sort().join(', '), `(${Math.round(p.x + 320)},${Math.round(r.y + 180)}) ${cl.length}: ${cl.map(k => k.who).join(', ')}`);
      }
    }
    assert(src.length > 30, `тёплых окон и огней подозрительно мало: ${src.length}`);
    eq(bad.size, 0, 'больше трёх тёплых пятен: ' + [...bad.values()].join(' | '));
  });
}

// ═══ ЗАПЕКАНИЕ (render/archbake.js; weave/ARCH_PLAN.md, этап 1) ═══
{
  const B = await imp('render/archbake.js');
  const arch = locations.filter(l => l.archDraw);
  test('запекание: живое узнаётся само — огни, экраны, часы, механизмы и подвесы рисуются каждый кадр', () => {
    B._resetBake();
    const kind = new Map();
    for (const l of arch) kind.set(l.name, B.kindOf(l.archDraw, l.archX, l.archGy));
    for (const n of ['стеклянная башня', 'серверный ангар', 'вокзал двух часов', 'Останкинская башня', 'долгострой с краном'])
      assert(kind.get(n) && kind.get(n).live, `${n}: живое запеклось бы`);
    const stat = [...kind.values()].filter(k => !k.live).length;
    assert(stat >= 50, `неподвижных видов мало: ${stat}`);
    assert([...kind.values()].every(k => k.live || k.shared !== undefined), 'вид без решения');
  });
  test('запекание: признанное неподвижным не меняется ни в одно мгновение (развёртка t по 3 до 1200 и дальние)', () => {
    B._resetBake();
    const rec = (draw, x, gy, t) => {
      const log = [], c = fakeCtx();
      const p = new Proxy(c, {
        get: (o, k) => typeof o[k] === 'function' ? (...a) => { log.push(k + a.join()); return o[k](...a); } : o[k],
        set: (o, k, v) => { log.push(k + '=' + v); o[k] = v; return true; },
      });
      draw(p, x, gy, t);
      return log.join(';');
    };
    const seen = new Set(), moved = [];
    for (const l of arch) {
      if (seen.has(l.archDraw) || B.kindOf(l.archDraw, l.archX, l.archGy).live) continue;
      seen.add(l.archDraw);
      const d = l.archDraw.body || l.archDraw;                 // у вида с огнём поверх запекается тело
      const base = rec(d, l.archX, l.archGy, 0);
      for (let t = 3; t < 1200 + 40; t += 3) {
        const tt = t < 1200 ? t : 1e6 + t * 7919;
        if (rec(d, l.archX, l.archGy, tt) !== base) { moved.push(`${l.name} (t=${tt})`); break; }
      }
    }
    assert(seen.size >= 50, `неподвижных видов мало: ${seen.size}`);
    eq(moved.length, 0, 'запеклось бы живое: ' + moved.join(', '));
  });
  test('запекание: неподвижная постройка — один холст, дальше картинкой; живая — рисуется сама; без холста — живой', () => {
    B._resetBake();
    const stat = arch.find(l => !B.kindOf(l.archDraw, l.archX, l.archGy).live), live = arch.find(l => B.kindOf(l.archDraw, l.archX, l.archGy).live);
    const counting = () => { const c = fakeCtx(); c.n = { fill: 0, img: 0 }; c.fillRect = () => c.n.fill++; c.drawImage = () => c.n.img++; return c; };
    // без холста (как в тестах) — рисуется живой
    let c = counting(); B.drawArch(c, stat, 1);
    assert(c.n.fill > 0 && c.n.img === 0, 'без холста не нарисовалась');
    // с холстом — запекается, дальше одна картинка
    const ce = document.createElement;
    document.createElement = () => ({ ...fakeEl(), width: 0, height: 0, getContext: () => fakeCtx() });
    try {
      B._resetBake();
      for (let t = 2; t < 6; t++) B.drawArch(counting(), stat, t);
      c = counting(); B.drawArch(c, stat, 7);
      eq(c.n.img, 1, 'запечённая — не одной картинкой'); eq(c.n.fill, 0, 'запечённая рисуется заново');
      c = counting(); for (let t = 8; t < 12; t++) B.drawArch(c, live, t);
      assert(c.n.fill > 0 && c.n.img === 0, 'живая не рисуется сама');
      eq(B.kindOf(live.archDraw, live.archX, live.archGy).live, true, 'живая запеклась');
    } finally { document.createElement = ce; B._resetBake(); }
  });
}

// ═══ НАДПИСИ СТЕН: на фасаде штрихи, прочесть — в осмотре (слово автора 25.10) ═══
{
  const IN = await imp('world/inscriptions.js'), PT = await imp('world/potemkin.js'), CX = await imp('render/context.js');
  test('надписи стен: на фасаде постройки — штрихи без шрифта; в осмотре — только проступившие строки', () => {
    const l = locations.find(q => q.archDraw && IN.hiddenInscriptions[q.id] && IN.hiddenInscriptions[q.id].length >= 2);
    assert(l, 'нет постройки с надписью');
    const lines = IN.hiddenInscriptions[l.id];
    eq(IN.wallLines(l.id).length, 0, 'проступило, не постояв');
    assert(!PT.lookText(l).includes(lines[0]), 'в осмотре прежде, чем проступила');
    const pl = { x: l.x + l.w / 2, y: l.y + l.h / 2, moving: false };
    for (let i = 0; i < 70; i++) IN.updateProximity(pl, locations);
    eq(IN.wallLines(l.id).length, 1, 'первая строка не проступила');
    assert(PT.lookText(l).includes(`«${lines[0]}»`) && !PT.lookText(l).includes(`«${lines[1]}»`), 'в осмотре не та строка');
    const c = fakeCtx(), n = { text: 0, rect: 0 };
    c.fillText = () => n.text++; c.fillRect = () => n.rect++;
    const prev = CX.X; CX.setCtx(c);
    try { IN.draw({ x: l.x - 100, y: l.y - 60 }, locations); } finally { CX.setCtx(prev); }
    eq(n.text, 0, 'на фасаде — шрифт'); assert(n.rect > 3, 'штрихов нет');
  });
}

// ═══ ВКЛЕЙКА: картина места в окне осмотра (вариант А; weave/PLACES.md) ═══
{
  const MF = await imp('assets/manifest.js'), UI = await imp('ui/ui.js');
  test('вклейка: ключ — id места или «кольцо:сторона:имя» постройки; нет записи — нет вклейки; пути в assets/places', () => {
    for (const [k, v] of Object.entries(MF.PLACES)) assert(/^assets\/places\/[a-z0-9_:#\- а-яё«»]+\.webp$/i.test(v), `${k}: путь ${v}`);
    for (const k of Object.keys(MF.PLACES)) if (!k.includes(':')) assert(locations.some(l => l.id === k), `${k}: нет такого места`);
    eq(UI.placeKey(locations.find(l => l.id === 'campfire')), 'campfire', 'костёр без вклейки');
    const temple = locations.find(l => l.archDraw && l.name === 'дорический храм');
    eq(UI.placeKey(temple), null, 'вклейка без записи');
    MF.PLACES['axial:south:дорический храм'] = 'assets/places/x.webp';
    try { eq(UI.placeKey(temple), 'axial:south:дорический храм', 'постройка колец не по ключу описи'); }
    finally { delete MF.PLACES['axial:south:дорический храм']; }
  });
}

// ═══ НАБОР МАТЕРИАЛОВ (sprites/arch/kit.js; weave/ARCH_PLAN.md, этап 3) ═══
{
  const K = await imp('sprites/arch/kit.js');
  const rec = () => { const c = fakeCtx(), log = []; c.fillRect = (x, y, w, h) => log.push([c.fillStyle, x, y, w, h]); c.log = log; return c; };
  test('набор: краски — производные канона (без синего, неона и белого), свет растёт по лестнице', () => {
    const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    for (const [m, R] of Object.entries(K._RAMP)) {
      if (!R) continue;
      for (const h of R) {
        const c = rgb(h), max = Math.max(...c), min = Math.min(...c), sat = max ? (max - min) / max : 0;
        assert(!(c[2] > c[0] + 25 && c[2] > c[1] + 8), `материал ${m}: синий ${h}`);
        assert(!c.every(v => v > 240), `материал ${m}: белый ${h}`);
        assert(!(sat > 0.5 && max > 90 && c[1] > c[0] + 20), `материал ${m}: неон ${h}`);
      }
      const L = R.map(h => rgb(h).reduce((a, b) => a + b, 0));
      for (let i = 2; i < 6; i++) assert(L[i] >= L[i - 1] - 6, `материал ${m}: лестница тона не растёт к свету`);
    }
  });
  test('набор: рисунок в рамке плана и всегда один и тот же; верх и левый край к свету, справа кромка пеплом', () => {
    const P = K.plan(20, 16); P.box(2, 4, 14, 12, K.MAT.PLASTER);
    const a = rec(), b = rec();
    K.paint(a, 100, 200, P, { seed: 3, chip: 0.2, moss: 0.3, cracks: 2 }); K.paint(b, 100, 200, P, { seed: 3, chip: 0.2, moss: 0.3, cracks: 2 });
    eq(JSON.stringify(a.log), JSON.stringify(b.log), 'рисунок не повторяется');
    for (const [, x, y, w, h] of a.log) assert(x >= 100 && y >= 200 && x + w <= 120 && y + h <= 216, `вне рамки: ${x},${y} ${w}×${h}`);
    const at = (log, x, y) => (log.find(([, X, Y, W]) => Y === y && x >= X && x < X + W) || [])[0];
    const c = rec(); K.paint(c, 0, 0, P, { seed: 3 });
    eq(at(c.log, 15, 8), '#8A8D8F', 'справа не кромка пеплом');
    const R = K._RAMP[K.MAT.PLASTER], lum = h => [1, 3, 5].reduce((s, i) => s + parseInt(h.slice(i, i + 2), 16), 0);
    assert(lum(at(c.log, 8, 4)) > lum(R[2]), 'верх не к свету');
    assert(lum(at(c.log, 2, 9)) >= lum(R[2]), 'левый край не к свету');
  });
  const BK = await imp('render/archbake.js');
  test('набор: ось — все виды и доминанта набором; тело неподвижно (запекается), огонь — слоем поверх; всё в рамке', () => {
    const A = ARCH_BY_RING.axial, kinds = [A.landmark, ...['south', 'east', 'west', 'north', 'plain'].flatMap(sd => A[sd])];
    eq(kinds.length, 11, 'видов оси');
    let split = 0;
    for (const k of kinds) {
      const name = k.name, body = k.draw.body || k.draw;
      eq(body.static, true, `${name}: тело не объявлено неподвижным`);
      const pk = BK.probeKind(body, 500, 500);
      eq(pk.live, false, `${name}: тело на деле живое`); eq(pk.shared, true, `${name}: тело зависит от места`);
      if (k.draw.body) {
        split++;
        assert(typeof k.draw.live === 'function', `${name}: нет живого слоя`);
        eq(BK.probeKind(k.draw, 500, 500).live, true, `${name}: огонь не движется`);
        BK._resetBake();
        const kd = BK.kindOf(k.draw, 500, 500);
        assert(kd.split && !kd.live, `${name}: запекание не делит тело и огонь`);
      }
      for (const t of [0, 19, 40, 77]) {
        const c = rec(); k.draw(c, 500, 500, t);
        assert(c.log.length > 50, `${name}: рисунок пуст`);
        for (const [, x, y, w, h] of c.log) assert(x >= 500 - k.w / 2 && x + w <= 500 + k.w / 2 && y >= 500 - k.h && y + h <= 500, `${name}: вне рамки ${x},${y} ${w}×${h} (t=${t})`);
      }
    }
    eq(split, 4, 'с огнём поверх — застава, круглый дом, кибитка, зиккурат');
  });
  test('свой рисунок #2: второй экземпляр вида оси — по своему осмотру (draw2), набором и в рамке; жизнь — своя', () => {
    const A = ARCH_BY_RING.axial, kinds = ['south', 'east', 'west', 'north', 'plain'].flatMap(sd => A[sd]);
    const two = kinds.filter(k => k.draw2);
    eq(two.map(k => k.name).sort().join(), ['вежа с бубном', 'дорический храм', 'застава на перевале', 'каменная ладья и сейд', 'пилон с обелиском'].sort().join(), 'с рисунком #2');
    for (const k of two) {
      eq(k.draw2.static, true, `${k.name} #2: не объявлен неподвижным`);
      const pk = BK.probeKind(k.draw2, 500, 500);
      eq(pk.live, false, `${k.name} #2: живой`); eq(pk.shared, true, `${k.name} #2: зависит от места`);
      const c = rec(); k.draw2(c, 500, 500, 0);
      assert(c.log.length > 50, `${k.name} #2: пуст`);
      for (const [, x, y, w, h] of c.log) assert(x >= 500 - k.w / 2 && x + w <= 500 + k.w / 2 && y >= 500 - k.h && y + h <= 500, `${k.name} #2: вне рамки ${x},${y} ${w}×${h}`);
      const inWorld = locations.filter(l => l.archRing === 1 && l.name === k.name);
      for (const l of inWorld) eq(l.archDraw, l.archNth > 1 ? k.draw2 : k.draw, `${k.name} №${l.archNth}: не свой рисунок`);
    }
    const v2 = locations.find(l => l.archRing === 1 && l.name === 'вежа с бубном' && l.archNth > 1);
    assert(v2 && !(v2.archLife && v2.archLife.smoke), 'вежа без покрышки дымит');
  });
  test('запекание: тело — в холст, огонь — поверх каждый кадр', () => {
    const l = locations.find(q => q.archDraw && q.archDraw.body);
    assert(l, 'нет постройки с огнём поверх');
    const counting = () => { const c = fakeCtx(); c.n = { fill: 0, img: 0 }; c.fillRect = () => c.n.fill++; c.drawImage = () => c.n.img++; return c; };
    const ce = document.createElement;
    document.createElement = () => ({ ...fakeEl(), width: 0, height: 0, getContext: () => fakeCtx() });
    try {
      BK._resetBake();
      for (let t = 2; t < 6; t++) BK.drawArch(counting(), l, t);
      const c = counting(); BK.drawArch(c, l, 7);
      eq(c.n.img, 1, 'тело не картинкой');
      assert(c.n.fill > 0 && c.n.fill < 6, `огонь поверх — не горсть точек: ${c.n.fill}`);
    } finally { document.createElement = ce; BK._resetBake(); }
  });
}

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
