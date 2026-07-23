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

// сторона = час суток (канон)
export const SIDES = [
  { id: 'south', name: 'юг',      hour: 'полдень',            light: 'красный час без теней' },
  { id: 'east',  name: 'восток',  hour: 'утро',               light: 'серо-жемчужный рассвет' },
  { id: 'west',  name: 'запад',   hour: 'вечер',              light: 'газовый вечер, свеча' },
  { id: 'north', name: 'север',   hour: 'полночь',            light: 'синяя ночь, редкая кость' },
  { id: 'plain', name: 'равнина', hour: 'предрассветный час', light: 'самый тёмный час, мгла' },
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
  if (e.id === 'townlet') { CELLS.push({ epoch: e.id, side: 'all', screens: 6, status: 'есть', refs: ['процедурный городок (etching-game)'] }); continue; }
  if (e.id === 'edge')    { CELLS.push({ epoch: e.id, side: 'all', screens: 2, ...(KNOWN['edge:all'] || { status: 'нет', refs: [] }) }); continue; }
  for (const s of SIDES) {
    const k = `${e.id}:${s.id}`;
    CELLS.push({ epoch: e.id, side: s.id, screens: 5, ...(KNOWN[k] || { status: 'нет', refs: [] }) });
  }
}

// радиальные швы: эпоха n → n+1 вдоль луча (везде, где обе клетки будут)
// кольцевые дороги: полный круг только в узловых эпохах
export const RING_ROADS = [
  { epoch: 'axial',        name: 'шёлковый путь',    pairs: [['south','east'], ['south','west']] },
  { epoch: 'lightgarden',  name: 'караваны',         pairs: [['west','south'], ['east','plain']] },
  { epoch: 'steamshadows', name: 'железная дорога',  pairs: [['west','plain'], ['west','north']] },
  { epoch: 'now',          name: 'сеть/аэропорт',    pairs: [['east','west'], ['south','north'], ['plain','east']] },
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
