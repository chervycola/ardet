// ═══════════════════════════════════════
// ACHIEVEMENTS — unlock tracking
// ═══════════════════════════════════════
import { events, E } from './events.js';

const DEFS = {
  collector: {
    name: 'ПОДПИСЧИК',
    desc: '20 фрагментов прочитано',
    note: 'Подписка оформлена до твоего рождения.',
    threshold: 20,
  },
  forty_seven: {
    name: '47-Й',
    desc: '47 фрагментов прочитано',
    note: 'Шутка → тик → номер. Форма выжила.',
    threshold: 47,
  },
  archivist: {
    name: 'АРХИВАРИУС',
    desc: 'Все 88 фрагментов прочитаны',
    note: 'Архивариус — это ты.',
    threshold: 88,
  },
  listener: {
    name: 'СЛУШАТЕЛЬ',
    desc: 'Услышал всех у костров',
    note: 'Тишина — пароль. Ты его уже ввёл.',
    threshold: 5,
  },
  observers: {
    name: 'СВИДЕТЕЛЬ',
    desc: 'Шут / Sol / Старец / Лунный',
    note: 'Четыре способа быть в горящем доме.',
    threshold: 4,
  },
  fire: {
    name: 'AMOR FATI',
    desc: 'Принял чай у Старца',
    note: 'Совпал с огнём. Не выбирал.',
  },
  moss: {
    name: 'МОХ ПОМНИТ',
    desc: 'Простоял на месте 10 минут',
    note: 'И приговор, и утешение.',
  },
  terminal: {
    name: 'СЕАНС',
    desc: '10 команд в терминал',
    note: 'Спираль ведёт вниз. А вниз — это сюда же.',
    threshold: 10,
  },
  cat: {
    name: 'ПЯТЫЙ',
    desc: 'Кот замечен во всех своих местах',
    note: 'Не Наблюдатель. Не-Работник.',
    threshold: 5,
  },
  hauntology: {
    name: 'ХОНТОЛОГИЯ',
    desc: 'Прочитан .fisher',
    note: 'Конец капитализма представить трудно. Конец света — уже наступил.',
  },
};

const unlocked = new Set();
let termCmdCount = 0;
let stillFrames = 0;
const STILL_FRAMES_FOR_MOSS = 36000; // 10 min @ 60fps

function unlock(id) {
  if (unlocked.has(id)) return;
  unlocked.add(id);
  const def = DEFS[id];
  if (!def) return;
  events.emit(E.ACHIEVEMENT, { id, ...def });
  console.log(`[ach] ${def.name} — ${def.desc}`);
}

export function init(flags, getLore) {
  events.on(E.LORE_COLLECT, () => {
    const count = getLore();
    if (count >= 20) unlock('collector');
    if (count >= 47) unlock('forty_seven');
    if (count >= 88) unlock('archivist');
  });
  events.on(E.NPC_TALK, () => {
    if (flags.talkedTo.size >= 5) unlock('listener');
  });
  events.on(E.OBSERVER_MET, () => {
    if (flags.observersSeen && flags.observersSeen.size >= 4) unlock('observers');
  });
  events.on('location.use', (loc) => {
    if (!loc) return;
    const key = loc.useAction || loc.id;
    if (key === 'campfire_throw' || key === 'tent_tea') unlock('fire');
  });
  events.on('terminal.cmd', () => {
    termCmdCount++;
    if (termCmdCount >= 10) unlock('terminal');
  });
  events.on('terminal.read', (file) => {
    const k = (file || '').replace(/^\./, '').toLowerCase();
    if (k === 'fisher') unlock('hauntology');
  });
  events.on('cat.sighted', (loc, count) => {
    if (count >= 5) unlock('cat');
  });
}

// Called from the main update loop. moving=true → reset; false → tick.
export function tickStillness(moving) {
  if (moving) { stillFrames = 0; return; }
  stillFrames++;
  if (stillFrames >= STILL_FRAMES_FOR_MOSS) unlock('moss');
}

export function getUnlocked() { return Array.from(unlocked); }
export function getDefs() { return DEFS; }
export function isUnlocked(id) { return unlocked.has(id); }
export function loadUnlocked(ids) {
  unlocked.clear();
  if (Array.isArray(ids)) ids.forEach(id => unlocked.add(id));
}
