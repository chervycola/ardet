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
    solid: true, light: { r: 50, color: [30, 200, 30], flicker: 0.08 } },
  { id: 'sol_home', name: 'Sol Invictus', x: 965, y: 910, w: 28, h: 44, zone: 'settlement',
    npc: 'sol' },
  { id: 'vending', name: 'Торговый автомат', x: 550, y: 1060, w: 42, h: 56, zone: 'settlement',
    useAction: 'shop1',
    solid: true, light: { r: 35, color: [180, 140, 40], flicker: 0.2 } },
  { id: 'library', name: 'Разрушенная библиотека', x: 400, y: 680, w: 105, h: 82, zone: 'settlement',
    useAction: 'archive',
    solid: true },
  { id: 'tent', name: 'Палатка Старца', x: 1250, y: 1080, w: 65, h: 55, zone: 'settlement',
    useAction: 'tent_tea',
    solid: true, light: { r: 30, color: [140, 100, 50], flicker: 0.05 } },
  { id: 'elder_home', name: 'Старец', x: 1272, y: 1100, w: 22, h: 32, zone: 'settlement',
    npc: 'elder' },
  { id: 'graffiti', name: 'Стена граффити', x: 600, y: 850, w: 60, h: 45, zone: 'settlement',
    useAction: 'graffiti_tag' },
  { id: 'ruins', name: 'Жилой дом №7', x: 665, y: 590, w: 108, h: 90, zone: 'settlement',
    useAction: 'ruins_apt42',
    solid: true },
  { id: 'watchtower', name: 'Смотровая вышка', x: 1550, y: 550, w: 30, h: 60, zone: 'settlement',
    useAction: 'watchtower_binoc',
    solid: true, light: { r: 20, color: [140, 120, 80], flicker: 0.04 } },
  { id: 'posterwall', name: 'Стена афиш', x: 850, y: 680, w: 70, h: 50, zone: 'settlement',
    useAction: 'events',
    light: { r: 20, color: [184, 134, 11], flicker: 0.03 } },
  { id: 'riverbed', name: 'Высохшее русло', x: 900, y: 1050, w: 60, h: 30, zone: 'settlement',
    useAction: 'riverbed_dig',
    light: { r: 12, color: [60, 80, 120], flicker: 0.02 } },
  { id: 'crater', name: 'Кратер', x: 1025, y: 830, w: 50, h: 40, zone: 'settlement',
    useAction: 'crater_coin' },

  // ── DEAD FOREST ──
  { id: 'radio', name: 'Радиовышка', x: 350, y: 250, w: 40, h: 80, zone: 'forest',
    useAction: 'radio_tune',
    solid: true, light: { r: 25, color: [255, 30, 30], flicker: 0.3 } },
  { id: 'cross', name: 'Крест на холме', x: 700, y: 300, w: 30, h: 50, zone: 'forest',
    useAction: 'cross_push',
    light: { r: 15, color: [200, 180, 120], flicker: 0.02 } },
  { id: 'raven', name: 'Гнездо Ворона', x: 1100, y: 180, w: 45, h: 40, zone: 'forest',
    useAction: 'raven_feed' },
  { id: 'theater', name: 'Театр Теней', x: 480, y: 200, w: 80, h: 60, zone: 'forest',
    useAction: 'theater_stage',
    solid: true, light: { r: 35, color: [200, 180, 140], flicker: 0.06 } },
  { id: 'altar', name: 'Мховый алтарь', x: 1380, y: 120, w: 55, h: 45, zone: 'forest',
    useAction: 'moss_commune',
    light: { r: 40, color: [60, 120, 40], flicker: 0.02 } },

  // ── TOXIC LOWLANDS ──
  { id: 'lake', name: 'Токсичное озеро', x: 900, y: 1480, w: 100, h: 60, zone: 'toxic',
    useAction: 'lake_stone',
    light: { r: 60, color: [50, 180, 30], flicker: 0.1 } },
  { id: 'basement', name: 'Затопленный подвал', x: 1350, y: 1400, w: 50, h: 45, zone: 'toxic',
    useAction: 'basement_door',
    solid: true, light: { r: 20, color: [80, 200, 80], flicker: 0.12 } },
  { id: 'pipeline', name: 'Ржавый трубопровод', x: 600, y: 1450, w: 80, h: 25, zone: 'toxic',
    useAction: 'pipeline_valve',
    light: { r: 15, color: [50, 120, 40], flicker: 0.06 } },
  { id: 'pit', name: 'Пропасть', x: 10, y: 1720, w: 40, h: 30, zone: 'toxic',
    useAction: 'greenpit',
    light: { r: 25, color: [20, 40, 10], flicker: 0.15 } },
  { id: 'nocturnal', name: 'Равнина Лунного', x: 1650, y: 1680, w: 60, h: 100, zone: 'toxic',
    useAction: 'nocturnal_thread',
    light: { r: 45, color: [80, 80, 140], flicker: 0.015 } },
  { id: 'nocturnal_home', name: 'Лунный', x: 1665, y: 1685, w: 32, h: 64, zone: 'toxic',
    npc: 'nocturnal' },

  // ── HIGHWAY ──
  { id: 'exit', name: 'Выход в Пустошь', x: 2000, y: 850, w: 60, h: 40, zone: 'highway',
    useAction: 'links' },
  { id: 'train', name: 'Ржавый поезд', x: 2200, y: 680, w: 120, h: 50, zone: 'highway',
    useAction: 'train_brake',
    npc: 'machinist', solid: true, light: { r: 20, color: [120, 80, 40], flicker: 0.05 } },
  { id: 'bus', name: 'Разбитый автобус', x: 1900, y: 1020, w: 70, h: 40, zone: 'highway',
    useAction: 'bus_instr',
    solid: true },
  { id: 'junkyard', name: 'Кладбище машин', x: 2500, y: 480, w: 90, h: 70, zone: 'highway',
    useAction: 'shop3',
    solid: true },
  { id: 'dumpster', name: 'Горящая мусорка', x: 2720, y: 200, w: 48, h: 44, zone: 'highway',
    useAction: 'shop2',
    npc: 'dumpster', solid: true, light: { r: 80, color: [255, 50, 10], flicker: 0.2 } },
  { id: 'overpass', name: 'Обрушенный мост', x: 2280, y: 610, w: 100, h: 60, zone: 'highway',
    useAction: 'overpass_rope',
    light: { r: 15, color: [100, 80, 60], flicker: 0.03 } },
  { id: 'billboard', name: 'Упавший билборд', x: 2085, y: 752, w: 105, h: 50, zone: 'highway',
    useAction: 'billboard_tear' },
  { id: 'powerline', name: 'Сломанный столб ЛЭП', x: 2235, y: 695, w: 30, h: 50, zone: 'highway',
    useAction: 'powerline_touch' },
  { id: 'banner', name: 'Транспарант', x: 1800, y: 700, w: 280, h: 120, zone: 'highway',
    useAction: 'banner_fine',
    light: { r: 30, color: [218, 165, 32], flicker: 0.05 } },
  { id: 'pizzeria', name: 'Пиццерия "Вавилон"', x: 2600, y: 1350, w: 140, h: 88, zone: 'highway',
    useAction: 'pizzeria_enter',
    solid: true, light: { r: 25, color: [200, 50, 50], flicker: 0.08 } },

  // ── FORGOTTEN QUARTER ──
  { id: 'church', name: 'Заброшенная церковь', x: 120, y: 780, w: 105, h: 92, zone: 'quarter',
    useAction: 'church_candle',
    solid: true, light: { r: 40, color: [100, 70, 150], flicker: 0.04 } },
  { id: 'fountain', name: 'Разбитый фонтан', x: 200, y: 1100, w: 50, h: 45, zone: 'quarter',
    useAction: 'fountain_coin',
    light: { r: 25, color: [40, 120, 60], flicker: 0.08 } },
  { id: 'crypt', name: 'Вход в крипту', x: 80, y: 950, w: 40, h: 35, zone: 'quarter',
    useAction: 'crypt_descend' },
];

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
