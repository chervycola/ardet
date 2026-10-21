// ═══════════════════════════════════════
// ИЗНАНКА — отдельная карта под городком (решение автора: «отдельная
// карта»; проект — weave/UNDERGROUND.md). Туннели — по образцу Boring
// Company: прямые круглые выработки, кольца обделки, ровное полотно, по
// которому ездили машины, мёртвые светодиоды по своду. Линия сшивает
// комнаты под спусками городка — от «братишки» под Пропастью до криосклепа
// «WD». Вход — пасхалка, не кнопка: спуск открывается повторным
// «использовать» после сцены места. Подъём — по лестнице своей комнаты,
// обычно далеко от того места, где спустился: тоннели сшивают несмежное.
// Ещё один выход — в один конец: поезд метро разреза эпох по билету «до
// колодца. туда.» выводит к колодцу у площади городка (world/townWell.js).
// Глубоко под всем — ход мха (U6): от дна пифоса к норе у подножия огня, с
// линией не сшит; идти по нему — в такт сердцу (двери наверху — world/mossway.js).
// Свет — уголёк странника: под землёй он тускнеет (не гаснет), в
// криосклепе — вдвое быстрее и без тепла.
// Здесь — план (трубы, комнаты, вещи), где можно стоять, путь по клику,
// состояние; рисунок — render/underside.js, тексты — content/underside.js.
// ═══════════════════════════════════════
import { UNDER_TEXT } from '../content/underside.js';
import { t } from '../core/time.js';

export const UW = 2400, UH = 1440;            // карта, точки (ниже 1100 — один ход мха)
// труба Boring: пол с запада на восток высотой FH или с севера на юг шириной
// FW; за полом — дальняя половина трубы (WH), спереди — срез обделки (LIP);
// у трубы с севера на юг — боковые стенки по SW; кольцо обделки — RING точек
export const T = { FH: 30, WH: 26, LIP: 5, FW: 30, SW: 8, RING: 20 };

// ── трубы ──
// концы трубы с севера на юг: corner — поворот (свод линии закрывает верх),
// open — выходит в пол комнаты или линии, portal — входит в стену круглым
// проёмом (стена хозяина — над проёмом), dead — тупик: там стоит щит
export const TUBES = [
  { id: 'line', ew: true, x0: 190, x1: 2080, y0: 450 },
  { id: 'west', ns: true, x0: 190, y0: 450, y1: 830, top: 'corner', bot: 'portal', outer: 'left' },
  { id: 'cryptd', ns: true, x0: 300, y0: 350, y1: 450, top: 'open', bot: 'portal' },
  { id: 'based', ns: true, x0: 1200, y0: 480, y1: 780, top: 'open', bot: 'portal' },
  { id: 'celld', ns: true, x0: 2050, y0: 450, y1: 640, top: 'corner', bot: 'portal', outer: 'right' },
  // забой: проходка встала — туннель кончается машиной (щит «Годо»)
  { id: 'godot', ns: true, x0: 1340, y0: 250, y1: 450, top: 'dead', bot: 'portal' },
  { id: 'onkalod', ns: true, x0: 1600, y0: 480, y1: 700, top: 'open', bot: 'portal' },
  { id: 'kolad', ns: true, x0: 1055, y0: 300, y1: 450, top: 'open', bot: 'portal' },
  { id: 'bunkerd', ns: true, x0: 640, y0: 480, y1: 720, top: 'open', bot: 'portal' },
  { id: 'cloudd', ns: true, x0: 1590, y0: 330, y1: 450, top: 'open', bot: 'portal' },
];

// ── комнаты ── (пол x0..x1 × y0..y1 или многоугольник по часовой; wh — стена)
export const ROOMS = [
  { id: 'crypt', name: 'Крипта, девятый ярус', x0: 180, y0: 250, x1: 440, y1: 350, wh: 46, mat: 'lime', surf: 'ground' },
  { id: 'guard', name: 'Гауптвахта', x0: 140, y0: 830, x1: 330, y1: 900, wh: 38, mat: 'army', surf: 'ground' },
  // углов — пять (канон): пол — пятиугольник, вода по пояс
  { id: 'base', name: 'Затопленный подвал', poly: [[1110, 780], [1300, 780], [1330, 858], [1205, 912], [1080, 858]], wh: 38, mat: 'wet', surf: 'water' },
  { id: 'cellar', name: 'Подвал «Вавилона»', x0: 1960, y0: 640, x1: 2220, y1: 730, wh: 40, mat: 'brick', surf: 'ground' },
  { id: 'wd', name: 'Криосклеп «WD»', x0: 760, y0: 248, x1: 900, y1: 336, wh: 40, mat: 'frost', surf: 'snow' },
  // станция Loop под стоянкой «Вавилона»: зал поверх линии, платформа на одну машину
  { id: 'station', name: 'Станция Loop «Вавилон»', x0: 1760, y0: 400, x1: 1960, y1: 500, wh: 44, mat: 'loop', surf: 'path' },
  // Онкало: зал в граните, посередине — шахта, ход спиралью вниз
  { id: 'onkalo', name: 'Онкало', x0: 1480, y0: 700, x1: 1780, y1: 890, wh: 44, mat: 'granite', surf: 'ground' },
  // Кольская сверхглубокая: буровой цех, устье под стальной крышкой
  { id: 'kola', name: 'Кольская сверхглубокая', x0: 980, y0: 200, x1: 1160, y1: 300, wh: 40, mat: 'drill', surf: 'ground' },
  // бункер на всякий случай: квартира в бывшей ракетной шахте, пятнадцатый этаж вниз
  { id: 'bunker', name: 'Бункер на всякий случай', x0: 520, y0: 720, x1: 820, y1: 850, wh: 44, mat: 'condo', surf: 'ground' },
  // облако: дата-центр в убежище гражданской обороны — стойки рядами, водопад по стене
  { id: 'cloud', name: 'Облако', x0: 1440, y0: 200, x1: 1740, y1: 330, wh: 46, mat: 'shelter', surf: 'ground' },
];
// провалы в полу — встать нельзя (шахта Онкало)
export const HOLES = [{ x: 1630, y: 800, r: 60 }];
for (const R of ROOMS) if (R.poly) {
  R.x0 = Math.min(...R.poly.map(p => p[0])); R.x1 = Math.max(...R.poly.map(p => p[0]));
  R.y0 = Math.min(...R.poly.map(p => p[1])); R.y1 = Math.max(...R.poly.map(p => p[1]));
}
// холодная жила (канон U7: кабельный коллектор) — от крипты к криосклепу
export const VEIN = { id: 'vein', x0: 440, x1: 760, y0: 282, fh: 24, wh: 22 };
// ход мха (канон U6: «пифос — лечь и уснуть» → «нора у подножия огня»): круглый
// лаз, стены в подушках мха. Не труба — нора: пол вьётся (mossY — верх пола в
// столбце x). С линией не сшит: свой ход, глубоко под остальными, — войти можно
// только из пифоса или из норы. От dry до конца мох сухой и тёплый
export const MOSS = { id: 'moss', x0: 420, x1: 1320, base: 1270, fh: 22, wh: 22, dry: 1224 };
export const mossY = x => MOSS.base + Math.round(9 * Math.sin((x - MOSS.x0) / 70) + 5 * Math.sin((x - MOSS.x0) / 31 + 1.3));

// ── разрез эпох: линия — самый новый слой — режет старые ходы насквозь (канон
// U2–U5, сцены — из ритуалов тоннелей); в дальней стене виден срез, ход старого
// слоя уходит в стену и закрыт: завал, вода под решёткой, гермодверь, тоннель
export const CUTS = [
  { id: 'catacomb', x0: 398, x1: 502 },   // U2 катакомбы: белый известняк, черепа, корни сада
  { id: 'sewer', x0: 858, x1: 962 },      // U3 канализация: кирпичный свод яйцом, чёрная вода, кораблики
  { id: 'shelter', x0: 1408, x1: 1512 },  // U4 бомбоубежище: бетон в метр, гермодверь «ВЫХОД», репродуктор
  { id: 'metro', x0: 1648, x1: 1748 },    // U5 метро: плитка, табло без цифр, тоннель со сквозняком
];
export const cutAt = x => CUTS.find(c => x >= c.x0 && x < c.x1) || null;

// круглые проёмы: низ трубы с севера на юг входит в стену хозяина —
// комнаты или линии (тогда проём — в дальней половине трубы)
export const PORTALS = TUBES.filter(tb => tb.bot === 'portal').map(tb => {
  const host = ROOMS.find(R => tb.y1 === R.y0 && tb.x0 >= R.x0 && tb.x0 + T.FW <= R.x1)
    || TUBES.find(L => L.ew && L.y0 === tb.y1);
  return { tube: tb, host, cx: tb.x0 + T.FW / 2, yb: tb.y1, R: T.FW / 2 + T.SW, H: host.wh || T.WH };
});

// ── вещи ── (рамка x,y,w,h — для клика; at — где встать ногами; wall — на стене)
const TH = [
  // подвал «Вавилона»
  { id: 'u_plaque', room: 'cellar', wall: true, x: 2090, y: 606, w: 16, h: 12, at: [2098, 648] },
  { id: 'u_chalk', room: 'cellar', wall: true, x: 1966, y: 604, w: 70, h: 30, at: [2002, 648] },
  { id: 'u_wallet', room: 'cellar', wall: true, x: 2110, y: 606, w: 44, h: 26, at: [2132, 648] },
  { id: 'u_up_pizzeria', room: 'cellar', wall: true, stair: 'wood', steps: 13, x: 2174, y: 600, w: 32, h: 40, at: [2190, 648], up: 'pizzeria' },
  { id: 'u_planes', room: 'cellar', x: 1966, y: 700, w: 40, h: 26, at: [2018, 722], solid: [1966, 708, 2006, 728] },
  // крипта
  { id: 'u_tiers', room: 'crypt', wall: true, x: 296, y: 216, w: 38, h: 20, at: [315, 256] },
  { id: 'u_up_church', room: 'crypt', wall: true, stair: 'door', steps: 9, x: 196, y: 208, w: 28, h: 42, at: [210, 256], up: 'church' },
  { id: 'u_up_crypt', room: 'crypt', wall: true, stair: 'stone', steps: 9, x: 398, y: 208, w: 28, h: 42, at: [412, 256], up: 'crypt' },
  { id: 'u_chests', room: 'crypt', x: 340, y: 280, w: 56, h: 28, at: [368, 318], solid: [340, 298, 396, 308] },
  { id: 'u_niches', room: 'crypt', wall: true, x: 228, y: 212, w: 64, h: 32, at: [260, 256], useAction: 'under_call' },
  // гауптвахта
  { id: 'u_door_cell', room: 'guard', wall: true, x: 240, y: 792, w: 28, h: 38, at: [254, 838] },
  { id: 'u_pot', room: 'guard', x: 266, y: 830, w: 14, h: 12, at: [273, 852] },
  { id: 'u_up_pit', room: 'guard', wall: true, stair: 'rock', steps: 0, x: 294, y: 792, w: 30, h: 38, at: [309, 838], up: 'pit' },
  // затопленный подвал
  { id: 'u_up_basement', room: 'base', wall: true, stair: 'concrete', steps: 0, x: 1122, y: 742, w: 30, h: 38, at: [1137, 790], up: 'basement' },
  { id: 'u_door_wood', room: 'base', wall: true, x: 1262, y: 746, w: 28, h: 34, at: [1276, 790] },
  { id: 'u_graffiti', room: 'base', wall: true, x: 1154, y: 748, w: 38, h: 26, at: [1172, 790] },
  { id: 'u_water', room: 'base', x: 1188, y: 846, w: 34, h: 14, at: [1205, 868] },
  // холодная жила и криосклеп
  { id: 'u_frost', room: 'vein', wall: true, x: 616, y: 262, w: 68, h: 18, at: [650, 294] },
  { id: 'u_frost_line', room: 'wd', wall: true, x: 766, y: 216, w: 38, h: 16, at: [786, 256] },
  { id: 'u_meter', room: 'wd', wall: true, x: 860, y: 212, w: 22, h: 28, at: [870, 256] },
  { id: 'u_capsule', room: 'wd', x: 808, y: 262, w: 52, h: 32, at: [834, 306], solid: [808, 276, 860, 296] },
  // станция Loop: машина на полотне (по глубине — за ней платформа), табло на стене
  { id: 'u_car', room: 'station', x: 1814, y: 424, w: 76, h: 56, at: [1850, 488], solid: [1818, 446, 1884, 471] },
  { id: 'u_board', room: 'station', wall: true, x: 1880, y: 356, w: 60, h: 34, at: [1910, 410] },
  // Онкало: шахта посреди зала (запекается) и плита с надписью на стене
  { id: 'u_spiral', room: 'onkalo', wall: true, x: 1572, y: 742, w: 116, h: 116, at: [1630, 872] },
  { id: 'u_onkalo_sign', room: 'onkalo', wall: true, x: 1658, y: 660, w: 84, h: 40, at: [1700, 712] },
  // Кольская: устье в полу (запекается), магнитофон на табурете — по глубине
  { id: 'u_kola', room: 'kola', wall: true, x: 1058, y: 240, w: 24, h: 24, at: [1070, 274], solid: [1060, 244, 1080, 262] },
  { id: 'u_tape', room: 'kola', x: 1094, y: 234, w: 18, h: 22, at: [1112, 270], solid: [1094, 248, 1110, 256] },
  // бункер: окно-экран и полки с запасами на стене
  { id: 'u_screen', room: 'bunker', wall: true, x: 698, y: 680, w: 84, h: 36, at: [740, 732] },
  { id: 'u_cans', room: 'bunker', wall: true, x: 528, y: 680, w: 76, h: 40, at: [566, 732] },
  // облако: стойки — два ряда (вещь — ближний ряд; дальний и пальмы — без осмотра)
  { id: 'u_racks', room: 'cloud', x: 1458, y: 228, w: 244, h: 76, at: [1605, 280], solid: [1458, 292, 1572, 302] },
  // разрез эпох: срезы старых ходов в стене линии (решётка канализации — в полотне)
  { id: 'u_cut_catacomb', room: 'tube', wall: true, x: 398, y: 424, w: 104, h: 26, at: [450, 470] },
  { id: 'u_cut_sewer', room: 'tube', wall: true, x: 858, y: 424, w: 104, h: 26, at: [884, 470], useAction: 'under_fish', useLabel: '<i>✋</i>ВЫЛОВИТЬ КОРАБЛИК' },
  { id: 'u_cut_shelter', room: 'tube', wall: true, x: 1408, y: 424, w: 104, h: 26, at: [1460, 470] },
  { id: 'u_cut_metro', room: 'tube', wall: true, x: 1648, y: 424, w: 100, h: 26, at: [1690, 470] },
  // билет на скамье метро — лежит, только когда поезд прошёл (рисуется живым, не запекается)
  { id: 'u_ticket', room: 'tube', x: 1662, y: 436, w: 16, h: 12, at: [1672, 470], useAction: 'under_ticket', useLabel: '<i>◆</i>ВЗЯТЬ' },
  // забой: щит стоит в конце штрека, гентри с лентой — на полотне (неподвижен — запекается)
  { id: 'u_godot', room: 'tube', wall: true, x: 1328, y: 156, w: 54, h: 132, at: [1355, 300], solid: [1336, 250, 1374, 288] },
  // ход мха: дно пифоса (наверх — в пифос), мох на стене, нора у подножия огня
  { id: 'u_up_pithos', room: 'moss', wall: true, stair: 'pithos', steps: 0, x: 428, y: mossY(441) - 28, w: 26, h: 28, at: [441, mossY(441) + 12], up: 'pithos' },
  { id: 'u_moss', room: 'moss', wall: true, x: 820, y: mossY(850) - 21, w: 60, h: 19, at: [850, mossY(850) + 12] },
  { id: 'u_up_burrow', room: 'moss', wall: true, stair: 'burrow', steps: 0, x: MOSS.x1 - 34, y: mossY(MOSS.x1 - 21) - 28, w: 26, h: 28, at: [MOSS.x1 - 21, mossY(MOSS.x1 - 21) + 12], up: 'burrow' },
];
// без осмотра, только мешает пройти: вторая группа ларей, диван в бункере;
// в облаке — дальний ряд стоек, правая часть ближнего, бассейн водопада, кадки
export const SOLIDS = [[236, 298, 292, 308], [716, 780, 774, 792],
  [1458, 254, 1702, 264], [1638, 292, 1702, 302], [1686, 200, 1724, 210], [1666, 208, 1678, 216], [1722, 208, 1734, 216]];

export const THINGS = TH.map(th => {
  const tx = UNDER_TEXT[th.id] || { name: th.id, look: '' };
  const o = { ...th, name: tx.name, look: tx.look, zone: 'under', under: true };
  if (th.up) {
    o.useAction = 'under_up'; o.useLabel = '<i>↑</i>ПОДНЯТЬСЯ';
    o.alt = 'under_greet'; o.altLabel = '<i>☼</i>ПОДУТЬ НА УГОЛЁК'; o.altShown = () => !under.greeted && !under.greetT;   // вдох на пороге
  }
  if (th.solid) SOLIDS.push(th.solid);
  return o;
});
export const thingById = id => THINGS.find(th => th.id === id);

// ── перекличка ниш (канон, ритуал «Перекличка ниш», U1): в стене крипты ниши с
// именами дремлют веками; уголёк будит по одной за проход. Ниша шепчет своё имя —
// единственное, что у неё осталось. Повторил вслух — ниша умолкает утешенной: её
// наконец вызвали по списку; шёпоты гаснут на 40 шагов вперёд, а сама она больше не
// просыпается (сохраняется). Промолчал — ниша не обидится, но имя идёт следом до
// самого выхода, тихо, на границе слышимости
export const NICHES = [];
for (let row = 0; row < 2; row++) for (let c = 0; c < 5; c++) NICHES.push({ x: 230 + c * 13, y: 216 + row * 14, w: 9, h: 6 });
// имя первой — канон («...Агафья»); остальные — нов.
export const NICHE_NAMES = ['Агафья', 'Фёкла', 'Прокопий', 'Пелагея', 'Евлампий', 'Акулина', 'Мокей', 'Феврония', 'Савватий', 'Устинья'];
const NICHE_ORDER = [6, 2, 8, 0, 4, 9, 3, 7, 1, 5];                  // какая ниша чьё имя держит
export const nicheOf = name => NICHES[NICHE_ORDER[NICHE_NAMES.indexOf(name)]];
export const NICHE_LINE = 'Присутствие отмечено. Можно не приходить больше никогда.';
export const NICHE_HUSH = 280;                                       // 40 шагов вперёд — по следу в 7 точек
{
  const th = thingById('u_niches');
  th.useShown = () => !!under.niche && !under.niche.done;
  Object.defineProperty(th, 'useLabel', { get: () => '<i>…</i>ПОВТОРИТЬ: «' + (under.niche ? under.niche.name : '').toUpperCase() + '»', configurable: true, enumerable: true });
}
// уголёк проходит мимо ниш: ноги у стены, под рядами
const nearNiches = (fx, fy) => fx > 220 && fx < 300 && fy < 286;

// ── флотилия входящих (канон, ритуал «Флотилия входящих», U3): по каналу под
// полотном плывут кораблики из заявлений, которые канцелярия так и не приняла.
// Выловил и прочитал вслух — заявление наконец услышано. Одно за спуск; минуту
// вода течёт заметно тише, кораблики еле движутся, и шёпоты не слышны совсем —
// единственная полная тишина на всей изнанке
export const SEWER_X = 910;                                          // канал под решёткой
export const FLEET_TEXT = `Мимо уголька проходит кораблик из бланка в клетку. На борту видно: «Прошу разъяснить, куда девается...» — дальше размыто.

Вылавливаешь его двумя пальцами и читаешь вслух. Вода течёт заметно тише.`;
export const FLEET_LINE = 'Ваше обращение зарегистрировано течением.';
export const CALM = 3600;                                            // минута тихой воды
const inChannel = b => b.y > L0.y0 - 2 && b.y < L0.y0 + T.FH;
{
  const th = thingById('u_cut_sewer');
  th.useShown = () => !under.read && under.boats.some(inChannel);   // ловить — только когда кораблик проходит
}
// что сейчас есть внизу: билета на скамье нет, пока не прошёл поезд
export const thingsNow = () => (under.bench ? THINGS : THINGS.filter(th => th.id !== 'u_ticket'));
// где встать у вещи — точка героя (ноги — x+6, y+23)
export function accessOf(th) { return { x: th.at[0] - 6, y: th.at[1] - 23 }; }

// спуски городка: ключ «использовать» → лестница внизу (там и встаёшь)
export const DESCENTS = {
  greenpit: 'u_up_pit',
  basement_door: 'u_up_basement',
  crypt_descend: 'u_up_crypt',
  church_candle: 'u_up_church',
  pizzeria_enter: 'u_up_pizzeria',
  pithos_lie: 'u_up_pithos',          // ход мха: лечь в пифос и уснуть (world/mossway.js)
  burrow_down: 'u_up_burrow',         // нора у подножия огня
};

// ── где можно стоять ── (ноги x, y; запас — на полу плаща у стен)
function inPoly(x, y, P) {
  let inside = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, yi] = P[i], [xj, yj] = P[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function onFloor(x, y) {
  for (const tb of TUBES) {
    if (tb.ew) { if (x >= tb.x0 + 5 && x <= tb.x1 - 5 && y >= tb.y0 + 3 && y <= tb.y0 + T.FH - 2) return true; continue; }
    const top = tb.top === 'corner' || tb.top === 'dead' ? tb.y0 + 3 : tb.y0 - 6, bot = tb.y1 + 6;
    if (x >= tb.x0 + 7 && x <= tb.x0 + T.FW - 7 && y >= top && y <= bot) return true;
  }
  if (x >= VEIN.x0 - 8 && x <= VEIN.x1 + 8 && y >= VEIN.y0 + 3 && y <= VEIN.y0 + VEIN.fh - 2) return true;
  if (x >= MOSS.x0 + 6 && x <= MOSS.x1 - 6) { const y0 = mossY(x); if (y >= y0 + 3 && y <= y0 + MOSS.fh - 2) return true; }
  for (const R of ROOMS) {
    if (R.poly) {
      if (inPoly(x - 5, y, R.poly) && inPoly(x + 5, y, R.poly) && inPoly(x, y - 3, R.poly) && inPoly(x, y + 2, R.poly)) return true;
    } else if (x >= R.x0 + 6 && x <= R.x1 - 6 && y >= R.y0 + 3 && y <= R.y1 - 2) return true;
  }
  return false;
}
export function walkable(x, y) {
  if (!onFloor(x, y)) return false;
  for (const h of HOLES) if (Math.hypot(x - h.x, y - h.y) < h.r) return false;
  for (const s of SOLIDS) if (x > s[0] - 5 && x < s[2] + 5 && y > s[1] - 2 && y < s[3] + 2) return false;
  return true;
}

// шаг героя с упором и скольжением вдоль стены (как tryMove наверху)
export function underMove(p, dx, dy) {
  const fx = p.x + 6, fy = p.y + 23;
  if (walkable(fx + dx, fy + dy)) { p.x += dx; p.y += dy; return true; }
  if (Math.abs(dx) > 0.01 && walkable(fx + dx, fy)) { p.x += dx; return true; }
  if (Math.abs(dy) > 0.01 && walkable(fx, fy + dy)) { p.y += dy; return true; }
  return false;
}

// ── где ты: комната, труба, жила; под ногами; холод ──
export function placeAt(x, y) {
  for (const R of ROOMS) {
    if (R.poly ? inPoly(x, y, R.poly) : (x >= R.x0 && x <= R.x1 && y >= R.y0 - 4 && y <= R.y1 + 2)) return R.id;
  }
  if (x >= VEIN.x0 && x <= VEIN.x1 && y >= VEIN.y0 - 4 && y <= VEIN.y0 + VEIN.fh + 2) return 'vein';
  if (x >= MOSS.x0 - 6 && x <= MOSS.x1 + 6 && Math.abs(y - mossY(x) - MOSS.fh / 2) < MOSS.fh) return 'moss';
  return 'tube';
}
export function surfaceUnder(x, y) {
  const at = placeAt(x, y);
  if (at === 'tube') return 'path';                  // полотно ровное: по нему ездили
  if (at === 'moss') return 'moss';                  // мох глушит шаги начисто
  if (at === 'vein') return coldAt(x, y) > 0.5 ? 'snow' : 'ground';
  return ROOMS.find(R => R.id === at).surf;
}
// холод 0..1: жила стынет к криосклепу, в криосклепе — весь
export function coldAt(x, y) {
  const at = placeAt(x, y);
  if (at === 'wd') return 1;
  if (at === 'vein') return Math.max(0, Math.min(0.7, (x - 520) / (VEIN.x1 - 520) * 0.7));
  return 0;
}
export const inWater = (x, y) => placeAt(x, y) === 'base';

// ── путь по клику: сетка по 4 точки, обход в ширину, прямые без лишних углов ──
const C = 4, GW = Math.ceil(UW / C), GH = Math.ceil(UH / C);
let grid = null, prev = null, stamp = null, mark = 0, queue = null;
function buildGrid() {
  grid = new Uint8Array(GW * GH);
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) grid[j * GW + i] = walkable(i * C + 2, j * C + 2) ? 1 : 0;
  prev = new Int32Array(GW * GH); stamp = new Uint32Array(GW * GH); queue = new Int32Array(GW * GH);
}
const cellOf = (x, y) => { const i = Math.floor(x / C), j = Math.floor(y / C); return i < 0 || j < 0 || i >= GW || j >= GH ? -1 : j * GW + i; };
function nearestCell(x, y, rmax = 40) {
  const c = cellOf(x, y);
  if (c >= 0 && grid[c]) return c;
  const i0 = Math.floor(x / C), j0 = Math.floor(y / C);
  for (let r = 1; r <= rmax; r++) {
    let best = -1, bd = 1e9;
    for (let j = j0 - r; j <= j0 + r; j++) for (let i = i0 - r; i <= i0 + r; i++) {
      if (Math.max(Math.abs(i - i0), Math.abs(j - j0)) !== r || i < 0 || j < 0 || i >= GW || j >= GH || !grid[j * GW + i]) continue;
      const d = (i - i0) ** 2 + (j - j0) ** 2;
      if (d < bd) { bd = d; best = j * GW + i; }
    }
    if (best >= 0) return best;
  }
  return -1;
}
function clearLine(ax, ay, bx, by) {
  const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 2);
  for (let k = 1; k < n; k++) if (!walkable(ax + (bx - ax) * k / n, ay + (by - ay) * k / n)) return false;
  return true;
}
// от ног (fx, fy) к точке (gx, gy): точки поворотов для ног; null — не дойти
export function pathTo(fx, fy, gx, gy) {
  if (!grid) buildGrid();
  const s = nearestCell(fx, fy, 4), g = nearestCell(gx, gy);
  if (s < 0 || g < 0) return null;
  mark++;
  let qh = 0, qt = 0;
  queue[qt++] = s; stamp[s] = mark; prev[s] = -1;
  while (qh < qt) {
    const c = queue[qh++];
    if (c === g) break;
    const i = c % GW, j = (c - i) / GW;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue;
      const ni = i + di, nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= GW || nj >= GH) continue;
      const n = nj * GW + ni;
      if (!grid[n] || stamp[n] === mark) continue;
      if (di && dj && (!grid[j * GW + ni] || !grid[nj * GW + i])) continue;   // угол не срезать
      stamp[n] = mark; prev[n] = c; queue[qt++] = n;
    }
  }
  if (stamp[g] !== mark) return null;
  const cells = [];
  for (let c = g; c >= 0; c = prev[c]) cells.push(c);
  cells.reverse();
  const pts = cells.map(c => ({ x: (c % GW) * C + 2, y: Math.floor(c / GW) * C + 2 }));
  const end = walkable(gx, gy) ? { x: gx, y: gy } : pts[pts.length - 1];
  pts[pts.length - 1] = end;
  // прямые: от поворота — к самой дальней видимой точке
  const out = [];
  let a = { x: fx, y: fy }, k = 0;
  while (k < pts.length - 1) {
    let j = k + 1;
    while (j + 1 < pts.length && clearLine(a.x, a.y, pts[j + 1].x, pts[j + 1].y)) j++;
    out.push(pts[j]); a = pts[j]; k = j;
  }
  if (!out.length) out.push(end);
  return out;
}

// ── до выхода: сколько клеток пути до ближней лестницы (обход в ширину от всех сразу) ──
let exitD = null;
function buildExits() {
  if (!grid) buildGrid();
  exitD = new Int32Array(GW * GH).fill(-1);
  let qh = 0, qt = 0;
  for (const th of TH) if (th.up) { const c = nearestCell(th.at[0], th.at[1]); if (c >= 0 && exitD[c] < 0) { exitD[c] = 0; queue[qt++] = c; } }
  while (qh < qt) {
    const c = queue[qh++], i = c % GW, j = (c - i) / GW;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ni = i + di, nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= GW || nj >= GH) continue;
      const n = nj * GW + ni;
      if (!grid[n] || exitD[n] >= 0) continue;
      exitD[n] = exitD[c] + 1; queue[qt++] = n;
    }
  }
}
// -1 — не дойти (порода)
export function exitDist(x, y) {
  if (!exitD) buildExits();
  const c = nearestCell(x, y, 3);
  return c < 0 ? -1 : exitD[c];
}
// развилки: где штрек с севера или с юга входит в линию
const L0 = TUBES[0];
export const FORKS = [];
for (const tb of TUBES) if (tb.ns && (tb.y1 === L0.y0 || tb.y0 === L0.y0 + T.FH)) {
  const x = tb.x0 + T.FW / 2;
  if (!FORKS.some(f => Math.abs(f.x - x) < 30)) FORKS.push({ x, y: L0.y0 + T.FH / 2 });
}
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
// на развилке огонёк тянется к ближнему выходу: куда шагнуть — {x, y}; не развилка — null
export function tugAt(fx, fy) {
  const f = FORKS.find(f => Math.abs(fx - f.x) < 26 && Math.abs(fy - f.y) < 26);
  if (!f) return null;
  let best = null, bd = exitDist(f.x, f.y);
  for (const [x, y] of DIRS) { const d = exitDist(f.x + x * 30, f.y + y * 30); if (d >= 0 && d < bd) { bd = d; best = { x, y }; } }
  return best;
}
// в глубину — от порога: куда уходит путь к середине своего хода (линии или хода мха)
export function deepAt(fx, fy) {
  const moss = placeAt(fx, fy) === 'moss', gx = moss ? (MOSS.x0 + MOSS.x1) / 2 : (L0.x0 + L0.x1) / 2;
  const path = pathTo(fx, fy, gx, moss ? mossY(gx) + 12 : L0.y0 + T.FH / 2);
  const w = path && path[0], d = w ? Math.hypot(w.x - fx, w.y - fy) : 0;
  return d > 0.5 ? { x: (w.x - fx) / d, y: (w.y - fy) / d } : { x: 0, y: 1 };
}

// ── вдох на пороге (канон, ритуал «Вдох на пороге», U1–U7): ритуал вежливости всей
// изнанки. У лестницы — порога хода — подуть на уголёк. Через секунду из глубины
// отвечает долгий втягивающий вдох: пламя встаёт свечкой, сквозняк тянет внутрь,
// шёпоты отходят к стенам. Один раз за спуск; после обмена дыханием уголёк горит
// ровнее, чужие сквозняки его не трогают, на развилках огонёк чуть тянется к выходу —
// не ведёт, но подсказывает. Не поздороваться можно: тогда шёпоты идут вплотную
export const GREET_LINE = 'Посетитель поздоровался. Отмечено всеми.';
// чужие сквозняки у уголька 0..1: крипта раз в шесть секунд выдыхает вверх по
// ступеням (пыль — render/underside.js), из тоннеля метро тянет, поезд дует
function draftAt(fx, fy, train) {
  let k = 0;
  const st = TH.find(th => th.id === 'u_up_crypt'), ph = t % 360;
  if (ph < 50 && Math.hypot(fx - st.at[0], fy - st.at[1]) < 70) k = 1 - 0.5 * ph / 50;
  if (fy > L0.y0 && fy < L0.y0 + T.FH + 2 && Math.abs(fx - 1724) < 90) k = Math.max(k, 0.35);
  if (train > 40 && train < 220) k = 1;
  return k;
}

// ── ход мха: шаг по стуку сердца (канон U6, ритуал «Шаг по стуку сердца») ──
// Мох глушит шаги начисто; идти можно только в такт сердцу. Сердце бьётся раз в
// секунду: прошёл за удар не больше шага — мох вспыхивает бледно-зелёным под ногой
// и ровно на шаг вперёд. Кто спешит, идёт в темноте: превышение гасится, и свет
// вернётся, когда отдышишься (два спокойных удара). Кто останавливается, слышит,
// как мох растёт, — и мох у ног правда прибавляется. У норы мох сухой и тёплый:
// последний участок светится сам, провожая, — как ни иди
export const HEART = 60, STRIDE = 40, GLOW = 54;   // удар — раз в 60 шагов; шаг — до 40 точек за удар; вспышка гаснет за 54
export const MOSS_LINE = 'Скорость хода — один пульс в секунду. Превышение гасится.';
export const moss = {
  t: 0, bx: -1, by: 0,    // часы сердца; где стоял на прошлом ударе
  breath: 0,              // сбился — сколько спокойных ударов до света
  dark: false,            // свет погашен: превышение
  told: false,            // реплика про превышение — раз за спуск
  still: 0,               // сколько стоит
  beat: false,            // в этот шаг ударило сердце (main стукнет)
  grow: false,            // в этот шаг мох прибавил (main прошуршит)
  pulse: 0,               // вспышка уголька на ударе 0..1
  k: 0,                   // насколько внутри хода 0..1 (плавно): свет уголька сжимается
  glows: [],              // вспышки мха { x, y, life, warm }
  sprouts: [],            // мох, выросший у ног, пока стоял { x, y, tall }
  reset() {
    this.t = 0; this.bx = -1; this.breath = 0; this.dark = false; this.told = false; this.still = 0;
    this.beat = false; this.grow = false; this.pulse = 0; this.k = 0; this.glows.length = 0; this.sprouts.length = 0;
  },
  // шаг: here — в ходе мха, mv — сколько прошёл за шаг; вернёт строку мира или null
  step(fx, fy, here, mv) {
    this.k += ((here ? 1 : 0) - this.k) * 0.06;
    this.beat = false; this.grow = false; this.pulse *= 0.88;
    for (let i = this.glows.length - 1; i >= 0; i--) if (--this.glows[i].life <= 0) this.glows.splice(i, 1);
    if (!here) { this.t = 0; this.bx = -1; this.still = 0; return null; }
    if (this.bx < 0) { this.bx = fx; this.by = fy; }
    this.still = mv > 0.05 ? 0 : this.still + 1;
    if (this.still > 90 && this.still % 40 === 0) {                   // стоишь — мох растёт
      this.grow = true;
      if (this.sprouts.length < 70) {
        const sx = Math.round(fx - 10 + Math.random() * 20), y0 = mossY(sx);
        this.sprouts.push({ x: sx, y: Math.max(y0 + 2, Math.min(y0 + MOSS.fh - 2, Math.round(fy - 4 + Math.random() * 8))), tall: Math.random() < 0.4 });
      }
    }
    if (++this.t % HEART) return null;
    this.beat = true; this.pulse = 1;                                    // удар сердца
    const dx = fx - this.bx, dy = fy - this.by, d = Math.hypot(dx, dy);
    this.bx = fx; this.by = fy;
    const dry = fx >= MOSS.dry;
    if (!dry && d > STRIDE) {                                          // спешишь — превышение гасится
      this.breath = 2; this.dark = true;
      if (this.told) return null;
      this.told = true;
      return MOSS_LINE;
    }
    if (!dry && this.breath > 0 && --this.breath > 0) return null;     // отдышаться
    this.dark = false;
    if (d < 2 && !dry) return null;                                    // стоишь — нового шага нет
    const ux = d >= 2 ? dx / d : 1, uy = d >= 2 ? dy / d : 0;
    this.glows.push({ x: fx, y: fy, life: GLOW, warm: dry });
    this.glows.push({ x: fx + ux * 16, y: fy + uy * 16, life: GLOW, warm: dry });   // ровно на один шаг вперёд
    return null;
  },
};

// ── шёпоты изнанки (канон: «в изнанке шёпоты гуще»; в криосклепе — ни одного) ──
// Шёпот — обрывок строки ближнего места: его же надпись, его осмотр; перо пишет
// её рядом (world/whisper.js). Внизу — раз в 20–40 секунд, чаще, чем наверху. Не
// поздоровался на пороге — шёпоты идут вплотную, у самого уха; поздоровался —
// держатся стен. Молчат в криосклепе, в ходе мха (там не шёпот, а рост) и в окнах
// тишины ритуалов
export const MURMURS = {
  crypt: ['...лёд кончается...', '...место держат...', '...ожидание продлено...', '...девять ярусов вниз...'],
  guard: ['...братишка... покушать...', '...отбой...'],
  base: ['...углов пять...', '...звонить три раза...', '...iä! iä!...'],
  cellar: ['...две пиццы...', '...верни стену...', '...47 столов...'],
  station: ['...скоро...', '...водитель на месте...'],
  onkalo: ['...здесь нет ничего ценного...'],
  kola: ['...звуки...', '...дальше не пустили...'],
  bunker: ['...годен до...', '...конец света перенесли...'],
  cloud: ['...облака здесь нет...'],
  vein: ['...пусть подождёт...'],
  godot: ['...на следующей неделе...'],
  catacomb: ['...гербаризация без описи...'],
  sewer: ['...прошу разъяснить...'],
  shelter: ['...все свободны...'],
  metro: ['...обратно все и так доезжают...'],
};
export const WD_SILENCE = '(Шёпотов нет. Впервые слышно уголёк у сердца: тикает тихо, как часы под подушкой.)';
const MURMUR_AT = [
  ...ROOMS.filter(R => MURMURS[R.id]).map(R => ({ key: R.id, x: (R.x0 + R.x1) / 2, y: (R.y0 + R.y1) / 2 })),
  ...CUTS.map(c => ({ key: c.id, x: (c.x0 + c.x1) / 2, y: TUBES[0].y0 + 15 })),
  { key: 'vein', x: (VEIN.x0 + VEIN.x1) / 2, y: VEIN.y0 + 12 },
  { key: 'godot', x: 1355, y: 300 },
];
// где шёпоту встать у стены: дальняя стена над полом — в зале, в жиле, на линии
// (вдоль, не за край); в штреке с севера на юг — в боковой стенке, сбоку
export function wallSpot(fx, fy, x) {
  const at = placeAt(fx, fy), L = TUBES[0], R = ROOMS.find(r => r.id === at);
  const fit = (a, b) => Math.max(a + 40, Math.min(b - 40, x));
  if (R) return [fit(R.x0, R.x1), R.y0 - Math.round(R.wh / 2)];
  if (at === 'vein') return [fit(VEIN.x0, VEIN.x1), VEIN.y0 - 11];
  if (fy > L.y0 - 4 && fy < L.y0 + T.FH + 4) return [fit(L.x0, L.x1 + T.FW), L.y0 - 13];
  return [x, fy - 20];
}
export function murmurAt(fx, fy, greeted) {
  let best = null, bd = 420;
  for (const a of MURMUR_AT) { const d = Math.hypot(a.x - fx, a.y - fy); if (d < bd) { bd = d; best = a; } }
  if (!best) return null;
  const lines = MURMURS[best.key], text = lines[Math.floor(Math.random() * lines.length)];
  if (!greeted) { const ox = Math.round((Math.random() - 0.5) * 8); return { text, x: fx + ox, y: fy - 32, ox, oy: -32, key: best.key, ear: true }; }   // вплотную, идёт следом
  const side = Math.random() < 0.5 ? -1 : 1, [x, y] = wallSpot(fx, fy, fx + side * (50 + Math.round(Math.random() * 30)));
  return { text, x, y, key: best.key };                                                                    // у стены
}

// ── состояние ──
export const under = {
  active: false,
  ret: null,              // точка наверху, где спустился (на карте мира странник — там)
  seen: new Set(),        // сцены, после которых открылся спуск (ключи «использовать»)
  found: new Set(),       // где побывал внизу
  ember: 1,               // уголёк 0..1: тускнеет под землёй, не гаснет
  cold: 0,                // холод у ног 0..1 (плавно)
  steps: 0,               // шагов под землёй (для огонька и пыли)
  heard: new Set(),       // что уже прозвучало за этот спуск (убежище, метро)
  say: null,              // строка мира — main покажет бумажкой внизу
  hiss: 0,                // репродуктор шипит (шагов)
  train: 0,               // поезд за спиной идёт (шаг прохода; 0 — нет)
  still: 0, px: 0, py: 0, // сколько стоит на месте
  murmur: 900,            // шагов до следующего шёпота
  hushF: 0, hushS: 0,     // окна тишины: шагов мира; точек пути (ритуалы)
  greeted: false,         // поздоровался на пороге — шёпоты держатся стен (за спуск)
  whisper: null,          // шёпот к записи { text, x, y, faint, ear, keep, wait } — main отдаёт перу; ear — идёт следом,
                          // keep — важнее (недописанное гаснет), wait — ждёт свободного пера столько шагов
  quench: false,          // погасить шёпот, что пишется (тишина)
  wdTold: false,          // в криосклепе сказано: «Шёпотов нет»
  tick: 0,                // уголёк тикает у сердца (криосклеп): громкость этого шага; 0 — тихо
  greetT: 0,              // вдох на пороге: шаг обмена дыханием (0 — нет)
  flare: 0,               // пламя встало свечкой (0..1, опадает за три секунды)
  inhale: null,           // тоннель вдохнул { x, y, dx, dy } — main даёт звук, пыль внутрь, шёпоты к стенам
  draft: 0,               // чужой сквозняк у уголька 0..1 (поздоровался — не трогает)
  tug: null,              // на развилке огонёк тянется к выходу { x, y }
  niche: null,            // перекличка ниш: проснулась { name, t, done } — за спуск одна
  nicheWoke: false,
  called: new Set(),      // ниши, вызванные по списку, — молчат навсегда (сохраняется)
  trail: null, trailT: 0, // промолчал — имя идёт следом до выхода
  boats: [],              // кораблики из заявлений по каналу { x, y }
  flow: 0,                // вода канала: сколько пробежала (рисунок)
  calm: 0,                // вода тиха: шагов (прочитал заявление)
  read: false,            // заявление за этот спуск прочитано
  after: null,            // строка мира — когда закроется окно сцены
  bench: false,           // на скамье метро лежит билет: поезд прошёл, а своего билета нет
  ticket: false,          // билет «до колодца. туда.» в кармане (сохраняется)
  ride: false,            // поезд забрал — main выводит к колодцу городка
  // шаг: уголёк тускнеет за четыре минуты (круг света сжимается на четверть, не гаснет); в криосклепе — вдвое быстрее
  step(fx, fy) {
    this.steps++;
    const c = coldAt(fx, fy);
    this.cold += (c - this.cold) * 0.03;
    this.ember = Math.max(0, this.ember - (1 + (c > 0.9 ? 1 : 0)) / (60 * 240));
    const at = placeAt(fx, fy);
    if (at !== 'tube') this.found.add(at);
    const mv = Math.hypot(fx - this.px, fy - this.py); this.px = fx; this.py = fy;
    this.still = mv > 0.05 ? 0 : this.still + 1;
    if (this.hiss > 0) this.hiss--;
    const said = moss.step(fx, fy, at === 'moss', mv);                  // ход мха: сердце
    if (said) this.say = said;
    // шёпоты: гуще, чем наверху; в криосклепе — впервые тихо
    if (this.hushF > 0) this.hushF--;
    if (this.hushS > 0) this.hushS = Math.max(0, this.hushS - mv);
    if (at === 'wd' && !this.wdTold) { this.wdTold = true; this.say = WD_SILENCE; this.quench = true; this.whisper = null; }
    // в криосклепе слышно уголёк: тикает и тускнеет вместе с ним — совсем тихо, значит, засиделся
    this.tick = at === 'wd' && this.steps % 30 === 0 ? this.ember : 0;
    // вдох на пороге: подул — через секунду тоннель отвечает вдохом, ещё через полторы — строка
    if (this.greetT > 0) {
      if (++this.greetT === 60) {
        this.greeted = true; this.flare = 1;
        const d = deepAt(fx, fy);
        this.inhale = { x: fx, y: fy - 13, dx: d.x, dy: d.y };
      } else if (this.greetT >= 150) { this.greetT = 0; this.say = GREET_LINE; }
    }
    if (this.flare > 0) this.flare = Math.max(0, this.flare - 1 / 180);
    this.draft = this.greeted ? 0 : draftAt(fx, fy, this.train);
    this.tug = this.greeted ? tugAt(fx, fy) : null;
    if (--this.murmur <= 0) {
      this.murmur = 1200 + Math.floor(Math.random() * 1200);
      if (!this.silent(at) && !(this.whisper && (this.whisper.keep || this.whisper.wait))) this.whisper = murmurAt(fx, fy, this.greeted);
    }
    // перекличка ниш: уголёк проплывает мимо — одна ниша выдыхает имя
    if (!this.nicheWoke && at === 'crypt' && mv > 0.05 && nearNiches(fx, fy)) {
      this.nicheWoke = true;
      const name = NICHE_NAMES.find(n => !this.called.has(n));
      if (name) {
        const n = nicheOf(name);
        this.niche = { name, t: 0, done: false };
        const R = ROOMS.find(r => r.id === 'crypt');                  // имя — над рядами, по тёмному своду: на камне не прочесть
        this.whisper = { text: '...' + name, x: n.x + n.w / 2, y: R.y0 - R.wh - 3, keep: true };
      }
    }
    if (this.niche && !this.niche.done && ++this.niche.t > 300 && (at !== 'crypt' || this.niche.t > 1800)) {
      this.trail = this.niche.name; this.trailT = 600; this.niche = null;   // промолчал
    }
    if (this.trail && --this.trailT <= 0) {
      if (this.silent(at) || this.whisper) this.trailT = 60;             // занято или тихо — чуть погодя
      else {
        this.trailT = 900 + Math.floor(Math.random() * 600);
        this.whisper = { text: '...' + this.trail, x: fx, y: fy - 32, ox: 0, oy: -32, faint: true, ear: true, wait: 600 };   // ждёт перо, не перебивая
      }
    }
    // флотилия входящих: кораблики плывут по каналу; прочитал заявление — минуту вода тиха
    if (this.calm > 0) this.calm--;
    this.flow += this.calm ? 0.06 : 0.25;
    if (!this.calm && Math.abs(fx - SEWER_X) < 300 && this.boats.length < 2 && Math.random() < 0.004) this.boats.push({ x: SEWER_X - 2 + Math.round(Math.random() * 4), y: L0.y0 - 4 });
    for (let i = this.boats.length - 1; i >= 0; i--) {
      const b = this.boats[i];
      b.y += this.calm ? 0.03 : 0.13; b.x += Math.sin(b.y * 0.3) * 0.05;
      if (b.y > L0.y0 + T.FH + 6) this.boats.splice(i, 1);
    }
    // разрез эпох: убежище раз в неведомый час объявляет отбой (канон «Вечный отбой»)
    const L = TUBES[0], onLine = fy > L.y0 && fy < L.y0 + T.FH + 2;
    if (onLine && Math.abs(fx - 1460) < 50 && !this.heard.has('shelter')) {
      this.heard.add('shelter');
      if (Math.random() < 0.6) { this.say = '— Отбой. Всем спасибо. Все свободны.'; this.hiss = 150; }
    }
    // метро: поезд приходит к тому, кто не смотрит в тоннель — стоит спиной, не шевелясь
    // (канон «Поезд за спиной»); шевельнулся — поезда не было. Прошёл — на скамье рядом
    // лежит билет «до колодца. туда.»; с билетом в кармане поезд не проходит мимо:
    // забирает, в один конец — к колодцу городка
    if (this.train > 0) {
      if (mv > 0.05) this.train = 0;
      else if (++this.train > 240) {
        this.train = 0;
        if (this.ticket) this.ride = true;
        else { this.say = 'Что-то длинное прошло сзади и стихло. На скамье рядом лежит картонный билет.'; this.bench = true; }
      }
    } else if (onLine && Math.abs(fx - 1698) < 40 && this.still > 300 && !this.ride && (this.ticket || !this.heard.has('metro'))) {
      this.heard.add('metro'); this.train = 1;
    }
  },
  // выловил кораблик и прочитал заявление вслух (одно за спуск)
  fishBoat() {
    if (this.read) return false;
    const i = this.boats.findIndex(inChannel);
    if (i < 0) return false;
    this.boats.splice(i, 1);
    this.read = true; this.calm = CALM; this.hushF = CALM; this.quench = true; this.whisper = null; this.after = FLEET_LINE;
    return true;
  },
  // повторил имя проснувшейся ниши вслух: её вызвали по списку
  callNiche() {
    const n = this.niche;
    if (!n || n.done) return false;
    n.done = true; this.called.add(n.name);
    this.hushS = NICHE_HUSH; this.quench = true; this.whisper = null; this.say = NICHE_LINE;
    return true;
  },
  // подул на уголёк у порога (раз за спуск): ответ — в step
  greet() {
    if (this.greeted || this.greetT) return false;
    this.greetT = 1;
    return true;
  },
  // тишина: в криосклепе, в ходе мха, в окнах тишины ритуалов
  silent(at) { return at === 'wd' || at === 'moss' || this.hushF > 0 || this.hushS > 0; },
  // взял билет со скамьи
  takeTicket() {
    if (!this.bench) return false;
    this.bench = false; this.ticket = true;
    return true;
  },
  // доехал до колодца: билет в один конец погашен
  arrive() { this.ride = false; this.ticket = false; },
  enter(retX, retY) {
    this.active = true; this.ret = { x: retX, y: retY }; this.ember = 1; this.cold = 0; this.steps = 0;
    this.heard.clear(); this.say = null; this.hiss = 0; this.train = 0; this.still = 0;
    this.bench = false; this.ride = false;
    this.murmur = 900; this.hushF = 0; this.hushS = 0; this.greeted = false; this.whisper = null; this.quench = false; this.wdTold = false; this.tick = 0;
    this.greetT = 0; this.flare = 0; this.inhale = null; this.draft = 0; this.tug = null;
    this.niche = null; this.nicheWoke = false; this.trail = null; this.trailT = 0;
    this.boats.length = 0; this.calm = 0; this.read = false; this.after = null;
    moss.reset();
  },
  leave() { this.active = false; this.cold = 0; this.bench = false; this.train = 0; this.whisper = null; this.tick = 0; this.greetT = 0; this.flare = 0; this.inhale = null; this.draft = 0; this.tug = null; this.niche = null; this.trail = null; this.boats.length = 0; this.calm = 0; this.after = null; moss.reset(); },
  save() { return { seen: [...this.seen], found: [...this.found], ticket: this.ticket, called: [...this.called] }; },
  load(d) {
    if (!d) return;
    (d.seen || []).forEach(k => this.seen.add(k));
    (d.found || []).forEach(k => this.found.add(k));
    if (d.ticket) this.ticket = true;
    (d.called || []).forEach(k => this.called.add(k));
  },
};

// свет под землёй: уголёк — единственное тёплое (сердцевина), вокруг — круг,
// в котором видно породу; зелёная лампа гауптвахты стоит ровно и не мигает
// (канон «ПЕРЕДАЧА»); в криосклепе тепла нет: огонёк холодный, круг меньше.
// В ходе мха уголёк почти не нужен: круг сжимается, светят вспышки мха; на ударе
// сердца огонёк вспыхивает; спешишь — темно; у норы сверху — отсвет огня
const EMBER = [226, 138, 58], COLD = [138, 141, 143], FILL = [232, 220, 198], FILL_C = [176, 180, 182];
const MOSS_PALE = [157, 176, 138], MOSS_WARM = [200, 160, 112], FIRE = [200, 120, 64];
const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
export function underLights(px, py) {
  const k = under.cold, e = under.ember, m = moss.k, dk = moss.dark ? 1 - 0.45 * m : 1;
  // вдох на пороге: пламя встало свечкой (fl), после — ровнее; чужой сквозняк (g) прибивает
  // огонёк, пока не поздоровался; на развилке огонёк тянется к выходу
  const fl = under.flare, g = under.draft, tg = under.tug, ex = px + (tg ? tg.x * 3 : 0), ey = py + (tg ? tg.y * 3 : 0);
  const L = [
    { x: ex, y: ey, r: (40 + 22 * e) * (1 - 0.35 * k) * (1 - 0.3 * m) * dk * (1 - 0.3 * g) * (1 + 0.45 * fl), color: mix(EMBER, COLD, k), flicker: (under.greeted ? 0.03 : 0.1 + 0.25 * g) * (1 - k), intensity: (1.1 - 0.3 * k) * (1 + 0.5 * moss.pulse * m) * (1 + 0.4 * fl) },
    { x: ex, y: ey, r: (118 + 42 * e) * (1 - 0.3 * k) * (1 - 0.78 * m) * (1 - 0.18 * g) * (1 + 0.25 * fl), color: mix(FILL, FILL_C, k), flicker: 0, intensity: 2.1 * (1 - 0.55 * m) },
    { x: 254, y: 797, r: 50, color: [77, 90, 73], flicker: 0, intensity: 1.6 },
    { x: 740, y: 702, r: 64, color: [118, 140, 108], flicker: 0.04, intensity: 1.3 },   // окно-экран бункера: лес светит
    { x: 1590, y: 262, r: 130, color: [196, 200, 194], flicker: 0, intensity: 1.15 },   // облако: свет искусственный, ровный
  ];
  if (m > 0.01) {
    if (!moss.dark) L.push({ x: px, y: py + 12, r: 26, color: MOSS_PALE, flicker: 0, intensity: 0.75 * m });   // мох под ногой чуть светится сам
    for (const g of moss.glows) { const a = g.life / GLOW; L.push({ x: g.x, y: g.y - 3, r: 26 + 18 * a, color: g.warm ? MOSS_WARM : MOSS_PALE, flicker: 0, intensity: 2.8 * a * m }); }
    for (let x = MOSS.dry + 14; x < MOSS.x1 - 24; x += 30) L.push({ x, y: mossY(x) + 10, r: 30, color: MOSS_WARM, flicker: 0.05, intensity: 0.9 * m });   // сухой мох тлеет сам
    L.push({ x: MOSS.x1 - 21, y: mossY(MOSS.x1 - 21) - 14, r: 76, color: FIRE, flicker: 0.2, intensity: 1.5 * m });   // нора: сверху — огонь
  }
  return L;
}
export const UNDER_AMBIENT = 0.16;
