// ═══════════════════════════════════════
// ACHIEVEMENTS — unlock tracking
// ═══════════════════════════════════════
import { events, E } from './events.js';

const DEFS = {
  wanderer: { name: 'СТРАННИК', desc: 'Посетил 10 локаций', threshold: 10 },
  explorer: { name: 'ИССЛЕДОВАТЕЛЬ', desc: 'Посетил 25 локаций', threshold: 25 },
  cartographer: { name: 'КАРТОГРАФ', desc: 'Посетил все локации', threshold: 38 },
  collector: { name: 'СОБИРАТЕЛЬ', desc: 'Собрал 20 фрагментов', threshold: 20 },
  archivist: { name: 'АРХИВАРИУС', desc: 'Собрал все фрагменты', threshold: 57 },
  listener: { name: 'СЛУШАТЕЛЬ', desc: 'Поговорил со всеми NPC', threshold: 5 },
  observers: { name: 'СВИДЕТЕЛЬ', desc: 'Увидел всех Наблюдателей', threshold: 4 },
  fire: { name: 'ОГНЕННЫЙ', desc: 'Бросил 7 вещей в костёр', threshold: 7 },
  moss: { name: 'МОХ ПОМНИТ', desc: 'Простоял 10 минут неподвижно' },
  terminal: { name: 'ПРОШИВКА', desc: 'Ввёл 10 команд в терминал', threshold: 10 },
};

const unlocked = new Set();

function unlock(id) {
  if (unlocked.has(id)) return;
  unlocked.add(id);
  const def = DEFS[id];
  if (!def) return;
  events.emit(E.ACHIEVEMENT, { id, ...def });
  console.log(`[ach] ${def.name} — ${def.desc}`);
}

export function init(flags, getLore, getTerminalCount) {
  events.on(E.LOCATION_VISIT, () => {
    const count = flags.visited.size;
    if (count >= 10) unlock('wanderer');
    if (count >= 25) unlock('explorer');
    if (count >= 38) unlock('cartographer');
  });
  events.on(E.LORE_COLLECT, () => {
    const count = getLore();
    if (count >= 20) unlock('collector');
    if (count >= 57) unlock('archivist');
  });
  events.on(E.NPC_TALK, () => {
    if (flags.talkedTo.size >= 5) unlock('listener');
  });
  events.on(E.OBSERVER_MET, () => {
    if (flags.observersSeen && flags.observersSeen.size >= 4) unlock('observers');
  });
}

export function getUnlocked() { return Array.from(unlocked); }
export function loadUnlocked(ids) {
  unlocked.clear();
  if (Array.isArray(ids)) ids.forEach(id => unlocked.add(id));
}
export function getDefs() { return DEFS; }
