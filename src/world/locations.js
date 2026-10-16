// ═══════════════════════════════════════
// LOCATIONS — world entity data
// ═══════════════════════════════════════
// Pure data — no draw logic here.
// Each location has: id, name, x, y, w, h, zone, solid?, light?
// Location draw functions live in src/sprites/locations/

export const locations = [
  // ── SETTLEMENT ──
  { id: 'campfire', name: 'Жертвенный костёр', x: 750, y: 780, w: 55, h: 50, zone: 'settlement',
    useAction: 'campfire_throw',
    light: { r: 95, color: [255, 100, 20], flicker: 0.15 } },
  { id: 'jester_home', name: 'Шут', x: 810, y: 772, w: 18, h: 36, zone: 'settlement',
    npc: 'jester' },
  { id: 'terminal', name: 'Ржавый терминал', x: 1000, y: 920, w: 50, h: 48, zone: 'settlement',
    useAction: 'terminal',
    solid: true, light: { r: 28, color: [120, 170, 60], flicker: 0.05 } },
  { id: 'sol_home', name: 'Sol Invictus', x: 965, y: 910, w: 28, h: 44, zone: 'settlement',
    npc: 'sol' },
  { id: 'vending', name: 'Торговый автомат', x: 550, y: 1060, w: 42, h: 56, zone: 'settlement',
    useAction: 'shop1',
    solid: true, light: { r: 22, color: [150, 150, 140], flicker: 0.03 } },
  { id: 'library', name: 'Разрушенная библиотека', x: 400, y: 680, w: 105, h: 82, zone: 'settlement',
    useAction: 'archive',
    solid: true },
  { id: 'tent', name: 'Палатка Старца', x: 1250, y: 1080, w: 65, h: 55, zone: 'settlement',
    useAction: 'tent_tea',
    solid: true, light: { r: 24, color: [140, 136, 124], flicker: 0.04 } },
  { id: 'elder_home', name: 'Старец', x: 1272, y: 1100, w: 22, h: 32, zone: 'settlement',
    npc: 'elder' },
  { id: 'graffiti', name: 'Стена граффити', x: 600, y: 850, w: 60, h: 45, zone: 'settlement',
    useAction: 'graffiti_tag' },
  { id: 'ruins', name: 'Жилой дом №7', x: 665, y: 590, w: 108, h: 90, zone: 'settlement',
    useAction: 'ruins_apt42',
    solid: true },
  { id: 'watchtower', name: 'Смотровая вышка', x: 1550, y: 550, w: 30, h: 60, zone: 'settlement',
    useAction: 'watchtower_binoc',
    solid: true, light: { r: 18, color: [138, 141, 143], flicker: 0.02 } },
  { id: 'posterwall', name: 'Стена афиш', x: 850, y: 680, w: 70, h: 50, zone: 'settlement',
    useAction: 'events',
    light: { r: 14, color: [150, 146, 134], flicker: 0.03 } },
  { id: 'riverbed', name: 'Высохшее русло', x: 900, y: 1050, w: 60, h: 30, zone: 'settlement',
    useAction: 'riverbed_dig',
    light: { r: 12, color: [61, 74, 58], flicker: 0.02 } },
  { id: 'crater', name: 'Кратер', x: 1025, y: 830, w: 50, h: 40, zone: 'settlement',
    useAction: 'crater_coin' },

  // ── PHILOSOPHY PHASE 1 / PACKAGE A: TOWN (around the campfire) ──
  { id: 'pithos', name: 'Пифос', x: 700, y: 845, w: 24, h: 16, zone: 'settlement' },
  { id: 'lantern1', name: 'Погасший фонарь', x: 690, y: 720, w: 10, h: 44, zone: 'settlement' },
  { id: 'office', name: 'Канцелярия', x: 1080, y: 720, w: 52, h: 46, zone: 'settlement',
    solid: true, light: { r: 22, color: [226, 138, 58], flicker: 0.04, dx: 13, dy: 22 } },   // окно №3 — всю ночь
  { id: 'gates', name: 'Врата', x: 1380, y: 820, w: 40, h: 56, zone: 'settlement',
    useAction: 'gates_pass' },

  // ── DEAD FOREST ──
  { id: 'radio', name: 'Радиовышка', x: 350, y: 250, w: 40, h: 80, zone: 'forest',
    useAction: 'radio_tune',
    solid: true, light: { r: 22, color: [194, 59, 43], flicker: 0.3 } },
  { id: 'cross', name: 'Крест на холме', x: 700, y: 300, w: 30, h: 50, zone: 'forest',
    useAction: 'cross_push',
    light: { r: 14, color: [217, 207, 184], flicker: 0.02 } },
  { id: 'raven', name: 'Гнездо Ворона', x: 1100, y: 180, w: 45, h: 40, zone: 'forest',
    useAction: 'raven_feed' },
  { id: 'theater', name: 'Театр Теней', x: 480, y: 200, w: 80, h: 60, zone: 'forest',
    useAction: 'theater_stage',
    solid: true, light: { r: 30, color: [190, 182, 162], flicker: 0.06 } },
  { id: 'altar', name: 'Мховый алтарь', x: 1380, y: 120, w: 55, h: 45, zone: 'forest',
    useAction: 'moss_commune',
    light: { r: 40, color: [96, 110, 88], flicker: 0.02 } },

  // ── TOXIC LOWLANDS ──
  { id: 'lake', name: 'Токсичное озеро', x: 900, y: 1480, w: 100, h: 60, zone: 'toxic',
    useAction: 'lake_stone',
    light: { r: 46, color: [90, 104, 84], flicker: 0.08 } },
  { id: 'basement', name: 'Затопленный подвал', x: 1350, y: 1400, w: 50, h: 45, zone: 'toxic',
    useAction: 'basement_door',
    solid: true, light: { r: 16, color: [90, 104, 84], flicker: 0.1 } },
  { id: 'pipeline', name: 'Ржавый трубопровод', x: 600, y: 1450, w: 80, h: 25, zone: 'toxic',
    useAction: 'pipeline_valve',
    light: { r: 12, color: [80, 94, 74], flicker: 0.04 } },
  { id: 'pit', name: 'Пропасть', x: 10, y: 1720, w: 40, h: 30, zone: 'toxic',
    useAction: 'greenpit',
    light: { r: 22, color: [40, 48, 38], flicker: 0.02 } },
  { id: 'nocturnal', name: 'Равнина Лунного', x: 1650, y: 1680, w: 60, h: 100, zone: 'toxic',
    useAction: 'nocturnal_thread',
    light: { r: 40, color: [138, 141, 143], flicker: 0.05 } },
  { id: 'nocturnal_home', name: 'Лунный', x: 1665, y: 1685, w: 32, h: 64, zone: 'toxic',
    npc: 'nocturnal' },

  // ── HIGHWAY ──
  { id: 'exit', name: 'Выход в Пустошь', x: 2000, y: 850, w: 60, h: 40, zone: 'highway',
    useAction: 'links' },
  { id: 'train', name: 'Ржавый поезд', x: 2200, y: 680, w: 120, h: 50, zone: 'highway',
    useAction: 'train_brake',
    npc: 'machinist', solid: true, light: { r: 18, color: [110, 106, 96], flicker: 0.03 } },
  // ракета вынесена из осмотра поезда в свою вещь: подделка — она,
  // не поезд (потёмкинская скорость проявляет только её)
  { id: 'rocket', name: 'Ракета за путями', x: 2420, y: 560, w: 22, h: 50, zone: 'highway' },
  { id: 'bus', name: 'Разбитый автобус', x: 1900, y: 1020, w: 70, h: 40, zone: 'highway',
    useAction: 'bus_instr',
    solid: true },
  { id: 'junkyard', name: 'Кладбище машин', x: 2500, y: 480, w: 90, h: 70, zone: 'highway',
    useAction: 'shop3',
    solid: true },
  { id: 'dumpster', name: 'Горящая мусорка', x: 2720, y: 200, w: 48, h: 44, zone: 'highway',
    useAction: 'shop2',
    npc: 'dumpster', solid: true, light: { r: 80, color: [226, 110, 40], flicker: 0.25 } },
  { id: 'overpass', name: 'Обрушенный мост', x: 2280, y: 610, w: 100, h: 60, zone: 'highway',
    useAction: 'overpass_rope',
    light: { r: 14, color: [104, 100, 92], flicker: 0.03 } },
  { id: 'billboard', name: 'Упавший билборд', x: 2085, y: 752, w: 105, h: 50, zone: 'highway',
    useAction: 'billboard_tear' },
  { id: 'powerline', name: 'Сломанный столб ЛЭП', x: 2235, y: 695, w: 30, h: 50, zone: 'highway',
    useAction: 'powerline_touch' },
  { id: 'banner', name: 'Транспарант', x: 1800, y: 700, w: 280, h: 120, zone: 'highway',
    useAction: 'banner_fine',
    light: { r: 24, color: [160, 154, 138], flicker: 0.04 } },
  { id: 'pizzeria', name: 'Пиццерия "Вавилон"', x: 2600, y: 1350, w: 140, h: 88, zone: 'highway',
    useAction: 'pizzeria_enter',
    solid: true, light: { r: 24, color: [194, 59, 43], flicker: 0.12 } },

  // ── FORGOTTEN QUARTER ──
  { id: 'church', name: 'Заброшенная церковь', x: 120, y: 780, w: 105, h: 92, zone: 'quarter',
    useAction: 'church_candle',
    solid: true, light: { r: 34, color: [150, 148, 140], flicker: 0.05 } },
  { id: 'fountain', name: 'Разбитый фонтан', x: 200, y: 1100, w: 50, h: 45, zone: 'quarter',
    useAction: 'fountain_coin',
    light: { r: 20, color: [90, 104, 84], flicker: 0.04 } },
  { id: 'crypt', name: 'Вход в крипту', x: 80, y: 950, w: 40, h: 35, zone: 'quarter',
    useAction: 'crypt_descend' },
];

// The street (ulitsa) signs join the world as ordinary locations.
// Their look texts are inline (loc.look) — see world/street.js.
// Городок исторически жил в 0..3000×160..1800 — сдвигаем в центр диска
import { SHIFT_X, SHIFT_Y } from './disc.js';
for (const l of locations) { l.x += SHIFT_X; l.y += SHIFT_Y; }

import { streetLocations, branchLocations, wasteLocations } from './street.js';
locations.push(...streetLocations);   // уже в мировых координатах диска
locations.push(...branchLocations);
locations.push(...wasteLocations);   // пустошь за огнём

// постройки эпох — ансамблями (ворота у тропы, дворы за табличками);
// твёрдые, с осмотром
import { buildEnsembles, archLocations } from './architecture.js';
const ARCH = buildEnsembles(locations.filter(l => l.streetForm));
locations.push(...archLocations(ARCH.buildings));
export const archEnsembles = ARCH.ensembles;

// капча у ворот: южная тропа, край городка
import { captchaLocation } from './captcha.js';
locations.push(captchaLocation);
// ловушки взгляда: часы, рука, лужа, подсказка, верстовые столбы
import { buildAiTraps } from './aitraps.js';
buildAiTraps(locations);
// нити: номерок 1889 → окно «до востребования»
import { buildThreads } from './threads.js';
buildThreads(locations);
// камеры на западной тропе: в неоне одна, в «сейчас» — столб, облепленный камерами
import { buildCameras } from './cameras.js';
buildCameras(locations);
// нити, волна 2: луна на учёте, часы по кольцам, колодец и объявление у котлована
import { buildThreads2 } from './threads2.js';
buildThreads2(locations);

// ── HYBRID FIRES — Los Angeles and San Francisco on the street ──
// They are full burning landmarks, not just plaques: lit, animated, and
// addressable like the campfire. Их эпоха — §9, «сейчас»; сторона — запад
// («стеклянный даунтаун, трасса»): первое свободное место в полосе девятого
// кольца, не на тропе, не на чужом дворе (раньше стояли по старым
// координатам улицы — во льду за огнём).
import { TOWN as TW, RING_W as RW, ringAt as ringOf, trailPoint as trailAt } from './disc.js';
function firePlace() {
  const busy = (x, y, w, h) => locations.some(l => {
    const big = !!l.archDraw, mx = big ? 80 : 40, below = big ? 140 : 40;
    return x < l.x + l.w + mx && x + w > l.x - mx && y < l.y + l.h + below && y + h > l.y - 60;
  });
  for (const along of [0.62, 0.7, 0.54, 0.78, 0.46, 0.86, 0.38, 0.3, 0.22]) {
    for (const depth of [70, 110, 150, 40]) {
      const x = Math.round(TW.x0 - 8 * RW - depth - 58), y = Math.round(TW.y0 + 140 + along * 1360);
      if (ringOf(x, y + 36) !== 9 || ringOf(x + 58, y + 36) !== 9) continue;
      let nearTrail = false;
      for (let d = 1500; d <= 1850; d += 10) {
        const p = trailAt('west', d);
        if (Math.abs(p.x - x - 29) < 70 && Math.abs(p.y - y - 18) < 50) { nearTrail = true; break; }
      }
      if (!nearTrail && !busy(x, y, 58, 36)) return { x, y };
    }
  }
  return { x: TW.x0 - 8 * RW - 120, y: TW.y0 + 900 };
}
const FIRE_AT = firePlace();
locations.push({
  id: 'fire_sf', name: 'Пожар Сан-Франциско', zone: 'street',
  x: FIRE_AT.x, y: FIRE_AT.y, w: 28, h: 36,
  streetForm: 'fire',
  streetLive: true,
  look: `Туман лежит на холмах, как лежал до города. Под ним горячо.

Четыре лихорадки: золото сорок девятого, доткомы, крипта, ИИ.

Туман старше всех лихорадок.

[запись продолжается]`,
  light: { r: 95, color: [255, 110, 60], flicker: 0.18 },
});

locations.push({
  id: 'fire_la', name: 'Пожар Лос-Анджелеса', zone: 'street',
  x: FIRE_AT.x + 30, y: FIRE_AT.y, w: 28, h: 36,
  streetForm: 'fire',
  streetLive: true,
  look: `Январь 2025: город горел в прямом эфире.

Причины ищут: в проводах, в поджоге. Суды идут.

Майк Дэвис, историк этого города, написал ещё в девяносто восьмом: Малибу горит по проекту.

[запись продолжается]`,
  light: { r: 105, color: [255, 90, 30], flicker: 0.2 },
});

// Quick lookup by id
export const locationById = {};
for (const loc of locations) locationById[loc.id] = loc;

// Attach content (look texts + dialogues) — called from main after imports
export function attachContent(looks, dialogues) {
  for (const loc of locations) {
    if (looks[loc.id]) loc.look = looks[loc.id];
    if (dialogues[loc.id]) {
      loc.talkLines = dialogues[loc.id];
      loc.talkName = loc.name;
    }
  }
}
