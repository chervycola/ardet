// ═══════════════════════════════════════
// WORLD MAP NODES — story laid over the four continents.
// Lifted from the ardet_map_editor.html reference, kept as one source
// of truth here. Used by ui/worldmap.js.
// ═══════════════════════════════════════

// Continents are polygons in a 1400×1560 abstract space; renderer scales
// them into a window-fit canvas.
export const MAP_W = 1400;
export const MAP_H = 1560;

export const CONTINENTS = [
  { name: 'Америки',  label: [200, 170], pts: '90,260 300,200 380,380 330,560 260,620 290,780 215,950 125,860 150,620 95,430' },
  { name: 'Европа',   label: [640, 100], pts: '430,180 660,130 940,165 1005,265 990,415 940,495 960,610 860,650 700,650 580,610 470,590 415,395' },
  { name: 'Африка',   label: [640, 740], pts: '500,800 740,758 880,860 860,1120 760,1360 620,1440 520,1280 470,1000' },
  { name: 'Азия · Ближний Восток', label: [1140, 270], pts: '1050,340 1220,295 1330,375 1325,650 1270,860 1120,940 1045,775 1030,555' },
];

// Status palette
export const STATUS_COLORS = {
  closed:  '#8a8474',  // closed record
  live:    '#d4a017',  // запись продолжается
  hearth:  '#3fae8c',  // очаг
  natural: '#d85a30',  // нерукотворный огонь
  start:   '#9b8cf0',  // старт
  ghost:   '#55514a',  // призрак, предполагается
};

export const THREAD_COLORS = {
  'учителя':   '#9b8cf0',
  'фонари':    '#d4a017',
  'очаги':     '#3fae8c',
  'света':     '#e8d48a',
  'архив':     '#c8b89a',
  'вывозы':    '#7da7c4',
  'вертикаль': '#8b2d2d',
};

export const NODES = [
  { id: 'gorodok',   name: 'Городок (старт)',         x: 992,  y: 400,  st: 'start',   thr: ['учителя','фонари','вертикаль'] },
  { id: 'felix',     name: 'Felixstowe',              x: 500,  y: 236,  st: 'closed',  thr: [] },
  { id: 'amst',      name: 'Печь Декарта',            x: 572,  y: 300,  st: 'hearth',  thr: ['очаги'] },
  { id: 'paris',     name: 'Париж ×3',                x: 506,  y: 392,  st: 'closed',  thr: [] },
  { id: 'portbou',   name: 'Порт-Бу',                 x: 468,  y: 600,  st: 'closed',  thr: [] },
  { id: 'shelden',   name: 'Шёлден',                  x: 660,  y: 180,  st: 'closed',  thr: [] },
  { id: 'kopen',     name: 'Копенгаген',              x: 718,  y: 236,  st: 'closed',  thr: [] },
  { id: 'kenig',     name: 'Кёнигсберг',              x: 906,  y: 222,  st: 'closed',  thr: [] },
  { id: 'jena',      name: 'Йена ×2',                 x: 690,  y: 330,  st: 'closed',  thr: [] },
  { id: 'frank',     name: 'Гранд-отель «Бездна»',    x: 636,  y: 396,  st: 'closed',  thr: [] },
  { id: 'todt',      name: 'Тодтнауберг',             x: 598,  y: 458,  st: 'closed',  thr: [] },
  { id: 'teatr',     name: 'Театр Ницше',             x: 812,  y: 358,  st: 'closed',  thr: ['фонари'] },
  { id: 'rim',       name: 'Рим',                     x: 668,  y: 548,  st: 'closed',  thr: [] },
  { id: 'afiny',     name: 'Афины',                   x: 788,  y: 580,  st: 'closed',  thr: [] },
  { id: 'efes',      name: 'Эфес',                    x: 918,  y: 598,  st: 'closed',  thr: [] },
  { id: 'skit',      name: 'Скит',                    x: 838,  y: 646,  st: 'closed',  thr: [] },
  { id: 'sloboda',   name: 'Слободская дорога',       x: 938,  y: 448,  st: 'live',    thr: ['учителя'] },
  { id: 'kotlovan',  name: 'Котлован',                x: 906,  y: 514,  st: 'closed',  thr: ['вертикаль'] },
  { id: 'chern',     name: 'Чернобыль',               x: 972,  y: 318,  st: 'closed',  thr: [] },
  { id: 'parohod',   name: 'Философский пароход',     x: 762,  y: 150,  st: 'closed',  thr: ['вывозы'] },
  { id: 'kamera',    name: 'Камера · Владимир',       x: 1014, y: 366,  st: 'closed',  thr: [] },
  { id: 'astap',     name: 'Станция Астапово',        x: 1036, y: 424,  st: 'closed',  thr: [] },
  { id: 'tropa',     name: 'Тропа по снегу',          x: 1284, y: 180,  st: 'closed',  thr: [] },
  { id: 'tipasa',    name: 'Типаса',                  x: 432,  y: 714,  st: 'natural', thr: [] },
  { id: 'oregon',    name: 'Орегон',                  x: 152,  y: 318,  st: 'closed',  thr: [] },
  { id: 'parker',    name: 'Паркерсберг',             x: 282,  y: 368,  st: 'closed',  thr: [] },
  { id: 'santa',     name: 'Санта-Круз',              x: 142,  y: 438,  st: 'closed',  thr: [] },
  { id: 'mview',     name: 'Маунтин-Вью',             x: 192,  y: 518,  st: 'closed',  thr: [] },
  { id: 'vegas',     name: 'Лас-Вегас',               x: 224,  y: 600,  st: 'closed',  thr: [] },
  { id: 'sf',        name: 'Сан-Франциско',           x: 148,  y: 482,  st: 'live',    thr: [] },
  { id: 'la',        name: 'Лос-Анджелес',            x: 172,  y: 596,  st: 'live',    thr: [] },
  { id: 'rynok',     name: 'Рынок-лабиринт',          x: 272,  y: 862,  st: 'live',    thr: [] },
  { id: 'blida',     name: 'Блида',                   x: 582,  y: 830,  st: 'closed',  thr: [] },
  { id: 'dom4',      name: 'Дом четырёх комнат',      x: 682,  y: 800,  st: 'closed',  thr: [] },
  { id: 'timbuktu',  name: 'Тимбукту',                x: 600,  y: 938,  st: 'closed',  thr: ['учителя','архив','вывозы'] },
  { id: 'blokpost',  name: 'Блокпост',                x: 778,  y: 938,  st: 'closed',  thr: [] },
  { id: 'yakob',     name: 'Пещера Якоба',            x: 832,  y: 1010, st: 'hearth',  thr: ['очаги','света'] },
  { id: 'klass',     name: 'Школьный класс',          x: 748,  y: 1062, st: 'closed',  thr: [] },
  { id: 'agbog',     name: 'Agbogbloshie',            x: 588,  y: 1118, st: 'closed',  thr: ['архив'] },
  { id: 'derevo',    name: 'Дерево совета',           x: 700,  y: 1160, st: 'closed',  thr: ['учителя'] },
  { id: 'fort',      name: 'Форт Сан-Себастьян',      x: 540,  y: 1198, st: 'closed',  thr: [] },
  { id: 'ogoni',     name: 'Огониленд',               x: 652,  y: 1228, st: 'live',    thr: [] },
  { id: 'trava',     name: 'Высокая трава',           x: 642,  y: 1390, st: 'closed',  thr: [] },
  { id: 'konya',     name: 'Конья',                   x: 1078, y: 524,  st: 'closed',  thr: ['учителя'] },
  { id: 'tbilisi',   name: 'Тбилиси',                 x: 1108, y: 462,  st: 'closed',  thr: [] },
  { id: 'isfahan',   name: 'Исфахан',                 x: 1174, y: 608,  st: 'live',    thr: ['света'] },
  { id: 'jerusalem', name: 'Иерусалим · суд',         x: 1088, y: 676,  st: 'closed',  thr: [] },
  { id: 'oliva',     name: 'Терраса с оливами',       x: 1062, y: 744,  st: 'live',    thr: [] },
  { id: 'bhopal',    name: 'Бхопал',                  x: 1252, y: 806,  st: 'closed',  thr: [] },
  { id: 'seoul',     name: 'Сеул',                    x: 1274, y: 408,  st: 'closed',  thr: [] },
  { id: 'buro',      name: 'Бюро имён',               x: 1198, y: 420,  st: 'closed',  thr: [] },
  { id: 'din',       name: 'Нож Дина',                x: 1178, y: 472,  st: 'closed',  thr: [] },
  { id: 'derevo2',   name: 'Бесполезное дерево',      x: 1142, y: 520,  st: 'closed',  thr: [] },
  { id: 'indra',     name: 'Сеть Индры',              x: 1236, y: 700,  st: 'closed',  thr: ['света'] },
  { id: 'kioto',     name: 'Киото · Рёандзи',         x: 1296, y: 494,  st: 'closed',  thr: [] },
  { id: 'kintsugi',  name: 'Мастерская кинцуги',      x: 1318, y: 540,  st: 'closed',  thr: [] },
  { id: 'hirosima',  name: 'Ступень · Хиросима',      x: 1282, y: 566,  st: 'closed',  thr: [] },
  { id: 'nemo',      name: 'Точка Немо',              x: 184,  y: 1300, st: 'natural', thr: [] },
  { id: 'g_vedanta', name: '(?) Веданта',             x: 1206, y: 862,  st: 'ghost',   thr: [] },
  { id: 'g_dogen',   name: '(?) Эйхэйдзи',            x: 1342, y: 498,  st: 'ghost',   thr: [] },
  { id: 'g_rus',     name: '(?) Русская линия',       x: 1062, y: 322,  st: 'ghost',   thr: [] },
];

// Tunnels (passable shortcuts), museums (institutionalised captures),
// precipices (do-not-go-there zones) — small overlays per the user's
// request. Kept short on purpose; meant to read as marks, not labels.
export const TUNNELS = [
  // a, b — endpoints; threaded between two distant nodes
  { id: 'tun_metro', a: 'paris', b: 'todt',     label: 'туннель Целана' },
  { id: 'tun_ship',  a: 'parohod', b: 'sf',     label: 'туннель парохода' },
  { id: 'tun_road',  a: 'sloboda', b: 'kenig',  label: 'туннель Сковорода ↔ Кант' },
];
export const MUSEUMS = [
  // Captures: institutions that house an idea behind glass.
  { id: 'mus_frank',  at: 'frank',  label: 'музей «Бездны»' },
  { id: 'mus_paris',  at: 'paris',  label: 'музей сувениров критики' },
  { id: 'mus_panopt', at: 'mview',  label: 'музей паноптикона (брелок)' },
];
export const PRECIPICES = [
  // Drop-off zones — at the literal precipice or at the figurative one.
  { id: 'prc_nemo',  at: 'nemo',   label: 'пропасть Немо' },
  { id: 'prc_agbog', at: 'agbog',  label: 'пропасть форматов' },
  { id: 'prc_la',    at: 'la',     label: 'пропасть проекта' },
];

// Helper: find a node by id
export function nodeById(id) { return NODES.find(n => n.id === id) || null; }
