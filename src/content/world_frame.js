// ═══════════════════════════════════════
// WORLD FRAME — каркас мира старой игры по форме world-map (диск):
// городок в центре, радиусы по сторонам света, кольца = время,
// кольцевые — поперечины между радиусами на одном кольце.
// Проекция диска на прямоугольный мир 6200×1800:
//   восток экрана  = радиус «юг · полдень» (улица девяти эпох — ЗАНЯТ)
//   юг экрана      = радиус «равнина · предрассветье» (трассирован)
//   север экрана   = радиус «север · полночь» (трассирован)
//   запад экрана   = радиус «запад · вечер» (трассирован)
//   восток диска (утро) — слота на текущем полотне нет: требует роста мира.
// Автор кладёт картинки на этот каркас; раскоп пространств — по слотам.
// ═══════════════════════════════════════
import { SEGMENTS, TOWNLET } from './ulitsa_db.js';
import { STREET_SHIFT, STREET_ROAD_Y, BRANCH_PLAIN } from '../world/street.js';

export const FRAME = {
  // центр: городок вне времени (пустошь-поселение целиком)
  center: { x0: 0, y0: 160, x1: 3000, y1: 1800, id: 'townlet', state: 'occupied' },

  radials: [
    { id: 'south_noon', side: 'юг · полдень', axis: 'east',
      state: 'occupied', corridor: { y0: 800, y1: 960 },
      // кольца = сегменты улицы, мировые координаты
      slots: SEGMENTS.map(s => ({
        ring: s.n, epoch: s.id, state: 'occupied',
        x0: s.range[0] + STREET_SHIFT, x1: s.range[1] + STREET_SHIFT,
        y0: 800, y1: 960,
      })) },

    { id: 'plain_dawn', side: 'равнина · предрассветье', axis: 'south',
      state: 'staked', corridor: { x0: 1350, x1: 1650 },
      pegs: { x0: 1350, y0: 1740, x1: 1650, y1: 1740 },
      slots: [], growth: 'вниз: мир должен вырасти по Y' },

    { id: 'north_midnight', side: 'север · полночь', axis: 'north',
      state: 'staked', corridor: { x0: 1350, x1: 1650 },
      pegs: { x0: 1350, y0: 215, x1: 1650, y1: 215 },
      slots: [], growth: 'вверх: мир должен вырасти по Y' },

    { id: 'west_evening', side: 'запад · вечер', axis: 'west',
      state: 'staked', corridor: { y0: 750, y1: 1050 },
      pegs: { x0: 95, y0: 760, x1: 95, y1: 1040 },
      slots: [], growth: 'влево: мир должен вырасти по X' },

    { id: 'east_morning', side: 'восток · утро', axis: null,
      state: 'unplaced', slots: [],
      growth: 'сторона утра ждёт вторых координат: на полотне занято улицей' },
  ],

  // кольцевые: поперечины между радиусами на одном кольце
  ringRoads: [
    { ring: 2, id: 'ring2_plain', state: 'occupied',
      from: 'south_noon', to: 'plain_dawn',
      x0: BRANCH_PLAIN.x0, x1: BRANCH_PLAIN.x1,
      y0: BRANCH_PLAIN.yMin, y1: BRANCH_PLAIN.yMax,
      note: 'равнинная кольцевая кольца §2: портики ↔ предрассветье' },
  ],
};

// Трассировочные бирки (лук-локации у колышков) — канцелярия разметила,
// пространств ещё нет; раскоп по мере поступления картин.
export const surveyLocations = [
  { id: 'svy_plain', name: 'трассировка · равнина', zone: 'settlement',
    x: 1480, y: 1720, w: 18, h: 20, streetForm: 'plaque', streetSprite: 'survey_peg',
    look: `Колышки и шнур. Бирка: «Радиус „равнина · предрассветье". Кольцо I размечено. Пространство не раскопано». Шнур натянут туго: канцелярия верит в юг.` },
  { id: 'svy_north', name: 'трассировка · север', zone: 'settlement',
    x: 1480, y: 195, w: 18, h: 20, streetForm: 'plaque', streetSprite: 'survey_peg',
    look: `Колышки и шнур уходят к лесу. Бирка: «Радиус „север · полночь". Кольцо I размечено. Работы начнутся по получении зимы». Зима в графике поставок значится.` },
  { id: 'svy_west', name: 'трассировка · запад', zone: 'settlement',
    x: 92, y: 880, w: 18, h: 20, streetForm: 'plaque', streetSprite: 'survey_peg',
    look: `Колышки и шнур вдоль западной кромки. Бирка: «Радиус „запад · вечер". Кольцо I размечено. Вечер ожидается». Смета приложена, вечер — нет.` },
];
