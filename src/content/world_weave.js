// ═══════════════════════════════════════
// WORLD WEAVE — машинная опись ткани мира
// ДИСК: радиус = время (кольца-эпохи), азимут = сторона света.
// Городок в центре, край — внешнее кольцо огня, общее для всех.
// Клетка = сектор кольца. Река Гераклита — спираль через диск.
// Правила и промт-библиотека: src/assets/WORLD_WEAVE.md
// ═══════════════════════════════════════
export const GEOMETRY = { type: 'disc', center: 'townlet', radiusAxis: 'эпохи', azimuthAxis: 'стороны света', rim: 'edge' };

export const EPOCHS = [
  { id: 'townlet',       name: 'городок',        era: 'вне времени' },
  { id: 'axial',         name: 'три огня',       era: 'осевое время' },
  { id: 'porticoes',     name: 'портики и сады', era: 'III до — V н.э.' },
  { id: 'lightgarden',   name: 'свет и сад',     era: 'VI–XVI вв.' },
  { id: 'twohearths',    name: 'два очага',      era: 'XVII век' },
  { id: 'enlightenment', name: 'мелкий шрифт',   era: 'XVIII век' },
  { id: 'steamshadows',  name: 'пар и тени',     era: 'XIX век' },
  { id: 'catastrophes',  name: 'век катастроф',  era: 'XX век' },
  { id: 'neon',          name: 'неон',           era: '1960–90-е' },
  { id: 'now',           name: 'сейчас',         era: '2000-е —' },
  { id: 'edge',          name: 'край',           era: 'дальше пока нечего' },
];

// сторона = культурный вектор; колорит — тональный грейд сектора.
// ВРЕМЯ СУТОК ГЛОБАЛЬНОЕ: сутки идут для всего диска одинаково и не
// зависят от направления движения (v3.3). Погода — случайные события.
export const SIDES = [
  { id: 'south', name: 'юг · древние пути',            flavor: 'полуденный грейд',      scope: 'Египет (до-осевой фундамент), Месопотамия, Средиземноморье, шёлковый и благовонный пути' },
  { id: 'east',  name: 'восток · Азия',                flavor: 'утренний жемчужный грейд', scope: 'Индия, Китай, Япония; чань/дзен; китайско-японские распри в XX' },
  { id: 'west',  name: 'запад · европейская мысль',    flavor: 'вечерний газовый грейд', scope: 'схоласты → Возрождение → Просвещение → модерн' },
  { id: 'north', name: 'север · северные народы',      flavor: 'полуночный грейд',      scope: 'Скандинавия, саамы, кельты островов, поморы; эдды → Кьеркегор → льды' },
  { id: 'plain', name: 'северо-восток · СНГ-пространство', flavor: 'предрассветный грейд', scope: 'Русь → империя → СССР → панельная тишина; космисты' },
];

// клетка: 4–6 экранов панорамы. status: 'есть' | 'частично' | 'нет'
// refs: файлы в корне репо (позже переезжают в weave/)
const KNOWN = {
  'axial:south':         { status: 'частично', refs: ['сократики эпоха.jpg'] },
  'porticoes:south':     { status: 'частично', refs: ['римская эпоха начало.jpg', '29a32b2e2e980db5035e7caf3807c67d.jpg', 'd767094e24a6771e19e0c00383172710.jpg'] },
  'lightgarden:west':    { status: 'частично', refs: ['пустая европа.jpg', '0f415e34e39a635675822b90fff1c3d9.jpg', 'c1b31ab67aadf1493c4b54e3abe1005a.jpg', 'c687bcd5522c0998f570726f58690c2f.jpg'] },
  'steamshadows:west':   { status: 'частично', refs: ['реф город 1.jpg'] },
  'catastrophes:plain':  { status: 'частично', refs: ['территория завода.jpg', 'b23ef0ce9da47368d45494a860b604f9.jpg', '5f05e478e86cc2b9946ecc3252741913.jpg', '7c4519b96fcf9ef88c4b8ebf4def464f.jpg', 'дороги электрический цепей.jpg', 'bc836d6ec4d1015f53f4f38395748dcd.jpg'] },
  'neon:east':           { status: 'частично', refs: ['555816c63b878b86a67df15fafface46.jpg', '7fee1fd98135ca5d439927989c383d16.jpg'] },
  'now:east':            { status: 'частично', refs: ['плоский новый мир, граница нашего времени.jpg'] },
  'now:west':            { status: 'частично', refs: ['a959eeea58c1594b719a700c334025ac.jpg', 'мелкие билборды.jpg'] },
  'now:south':           { status: 'частично', refs: ['8c40aad853c2e7994c2e0b32153510fa.jpg'] },
  'edge:all':            { status: 'частично', refs: ['дыра огня.jpg'] },
};

export const CELLS = [];
for (const e of EPOCHS) {
  if (e.id === 'townlet') { CELLS.push({ epoch: e.id, side: 'all', screens: 6, status: 'есть', refs: ['weave/G0_1_v2_dark.png (ЭТАЛОН мира: масштаб, зерно, палитра)', 'weave/G0_1_pano.png (панорама 21:9)', 'weave/G0_1_v1.png (арт: вечерний план)', 'процедурный городок (etching-game)'] }); continue; }
  if (e.id === 'edge')    { CELLS.push({ epoch: e.id, side: 'all', screens: 2, ...(KNOWN['edge:all'] || { status: 'нет', refs: [] }) }); continue; }
  for (const s of SIDES) {
    const k = `${e.id}:${s.id}`;
    CELLS.push({ epoch: e.id, side: s.id, screens: 5, ...(KNOWN[k] || { status: 'нет', refs: [] }) });
  }
}

// радиальные швы: эпоха n → n+1 вдоль луча (везде, где обе клетки будут)
// кольцевые дороги: ДУГИ с географией (v3.3), не полные кольца.
// arc — географическое положение дуги; pairs — кого сшивает.
// УЗЕЛ = одна сцена обмена на шве смежной пары, оба соседа описывают её
// идентично; сцены узлов — src/content/world_cells.js: RING_NODES (v3.4).
export const RING_ROADS = [
  { epoch: 'axial',        name: 'шёлковый путь',   arc: 'южная дуга + степная ветка (узел без дороги на меже север|равнина)',
    pairs: [['east', 'south'], ['north', 'plain']],
    nodes: { 'east|south': 'весовая при заставе Лао-цзы (+ столб золотого правила Ж9 — каноническая клетка)', 'north|plain': 'янтарный камень немого торга' } },
  { epoch: 'lightgarden',  name: 'караваны',        arc: 'юго-западная дуга + санная ветка (зимник) + волок',
    pairs: [['south', 'west'], ['north', 'plain'], ['plain', 'east']],
    nodes: { 'south|west': 'хан с двумя воротами (во дворе — толедский стол)', 'north|plain': 'ганзейские весы', 'plain|east': 'волок у сарая «Полупустой тюк»' } },
  { epoch: 'steamshadows', name: 'железная дорога', arc: 'северо-восточная дуга (СНГ)',
    pairs: [['north', 'plain'], ['plain', 'east']],
    nodes: { 'north|plain': 'таможня двух часов (без домкратов)', 'plain|east': 'станция перестановки тележек (1520/1435)' } },
  { epoch: 'now',          name: 'сеть',            arc: 'полное кольцо',
    pairs: [['east', 'west'], ['south', 'north'], ['plain', 'east'], ['south', 'plain']],
    nodes: { 'east|west': 'аэропорт-хаб на насыпном острове', 'south|north': 'кабельный берег', 'plain|east': 'контейнерный рынок у вышки' } },
];

// изнанка: тоннели сшивают несмежное; вход — пасхалка, не кнопка
export const UNDERSIDE = [
  { id: 'U1', layer: 'крипта',        from: { cell: 'lightgarden:north', entry: 'дверца за алтарём' },
    to: { cell: 'axial:south', exit: 'сухая цистерна у бассейна' } },
  { id: 'U2', layer: 'катакомбы',     from: { cell: 'porticoes:south', entry: 'тёмная дверь за колоннадой' },
    to: { cell: 'lightgarden:west', exit: 'крипта собора' } },
  { id: 'U3', layer: 'канализация',   from: { cell: 'steamshadows:west', entry: 'решётка у газового фонаря' },
    to: { cell: 'catastrophes:plain', exit: 'люк на территории завода' } },
  { id: 'U4', layer: 'бомбоубежище',  from: { cell: 'catastrophes:plain', entry: 'дверь в подвале' },
    to: { cell: 'neon:east', exit: 'задняя дверь вагона 89 6' } },
  { id: 'U5', layer: 'метро',         from: { cell: 'now:east', entry: 'заклеенный вход метро' },
    to: { cell: 'townlet:all', exit: 'колодец городка' } },
  { id: 'U6', layer: 'ход мха',       from: { cell: 'townlet:all', entry: 'пифос (лечь и уснуть)' },
    to: { cell: 'edge:all', exit: 'нора у подножия огня' } },
  // U7 — тупик-святилище: не сшивает, а ведёт в одну комнату.
  // Нить — энергия: единственная гудящая ЛЭП мира жары ведёт сюда.
  { id: 'U7', layer: 'кабельный коллектор («холодная жила»)',
    from: { cell: 'neon:west', entry: 'морозилка в подсобке парка (иней стрелкой вниз)' },
    to: { cell: 'twohearths:west', exit: 'КРИОСКЛЕП «WD» — тупик под двумя очагами' },
    deadEnd: true,
    room: {
      name: 'криосклеп',
      rule: 'ноль тёплых пятен — единственная комната мира без тепла; иней-растр инверсией, пар изо рта странника, уголёк тускнеет вдвое быстрее',
      lore: 'по документам — кремирован. по счетам — охлаждается',
    } },
];

// волны заполнения (не генерим клетку, пока не готовы кромки соседей волны)
export const WAVES = [
  { n: 1, what: 'хребет по времени: юг (осевое→портики) + запад (свет и сад→сейчас)' },
  { n: 2, what: 'поперечные узлы: шёлковый путь, железная дорога' },
  { n: 3, what: 'стороны целиком: восток, север, равнина' },
  { n: 4, what: 'изнанка U1–U6' },
];

// за кольцом огня: проход у костра Шута (сцена, не формула),
// пустыня рассыпанного времени, брейнрот = RASTER, blackout → дом.
export const BEYOND = {
  pass: { at: 'костёр Шута у кольца', how: 'художественная сцена: играть, не просить' },
  desert: { arteries: 'нет — рассыпанное вневременье', decay: 'brainrot → RASTER 0..1' },
  fall: 'blackout → дома: журнал пуст, ботинки стоптаны сильнее, чем помнишь',
  jesterLine: 'С возвращением. Как самочувствие?', // канон v3.2
};

export function cellKey(c) { return `${c.epoch}:${c.side}`; }
export function progress() {
  const t = CELLS.length, done = CELLS.filter(c => c.status !== 'нет').length;
  return `${done}/${t} клеток имеют кадры`;
}
