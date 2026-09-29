// ═══════════════════════════════════════
// WORLD FRAME — каркас мира по форме world-map. С версии «открытый
// диск» кольца эпох окружают городок со всех сторон (world/disc.js),
// за кольцом огня — стихии краёв (world/edges.js). Этот лист хранит
// смысловую раскладку сторон для картин и раскопа пространств.
// ═══════════════════════════════════════
import { TOWN, RING_W, RINGS, FIRE_W, EDGE_BAND, WORLD_W, WORLD_H } from '../world/disc.js';

export const FRAME = {
  center: { ...TOWN, id: 'townlet', state: 'occupied' },
  ringW: RING_W, rings: RINGS, fireW: FIRE_W, edgeBand: EDGE_BAND,
  world: { w: WORLD_W, h: WORLD_H },
  sides: [
    { id: 'south_noon',    side: 'юг · полдень',            axis: 'south', element: 'зыбучий песок',   state: 'occupied', note: 'таблички девяти эпох, скайлайн, СКРОЛЛ на кольце 9' },
    { id: 'east_morning',  side: 'восток · утро',           axis: 'east',  element: 'куча мусора',     state: 'occupied', note: 'равнина·предрассветье на кольце 2; остальные кольца ждут картин' },
    { id: 'north_midnight',side: 'север · полночь',         axis: 'north', element: 'лёд',             state: 'open',     note: 'кольца проходимы, наполнение ждёт картин' },
    { id: 'west_evening',  side: 'запад · вечер',           axis: 'west',  element: 'токсичное озеро', state: 'open',     note: 'кольца проходимы, наполнение ждёт картин' },
  ],
};

// Городок: вне времени — только ядро пробуждения (disc.CORE: костёр,
// палатка, Шут). Остальные локации городка тронуты временем — их
// эпохи для наполнения и карты:
export const ERA_HINT = {
  // ядро (вне времени): campfire, tent, jester_home, elder_home, sol_home, altar
  theater: 'porticoes', pithos: 'porticoes', cross: 'twohearths',
  church: 'twohearths', crypt: 'twohearths', fountain: 'twohearths',
  raven: 'twohearths', basement: 'twohearths', well: 'twohearths',
  library: 'enlightenment', office: 'enlightenment', lantern1: 'axial',
  watchtower: 'catastrophes', radio: 'catastrophes', train: 'catastrophes',
  powerline: 'catastrophes', banner: 'catastrophes',
  graffiti: 'neon', pizzeria: 'neon', vending: 'neon', billboard: 'neon',
  overpass: 'neon', posterwall: 'neon',
  ruins: 'now', rocket: 'now', junkyard: 'now', dumpster: 'now', bus: 'now',
  crater: 'now', lake: 'now', exit: 'now', pipeline: 'now', pit: 'now',
};

// Исторические трассировки сняты: радиусы стали пространством.
export const surveyLocations = [];
