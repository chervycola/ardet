// ═══════════════════════════════════════
// SESSION MEMORY — world ages across visits (shifting baseline)
// ═══════════════════════════════════════

const KEY = 'ardet_v2_sessions';

export function getSessionAge() {
  return parseInt(localStorage.getItem(KEY) || '0', 10);
}

export function incrementSession() {
  const age = getSessionAge() + 1;
  localStorage.setItem(KEY, String(age));
  return age;
}

// Config that depends on session count
export function getShiftConfig() {
  const age = getSessionAge();
  return {
    age,
    // Colors desaturate over 30 sessions (max 15%)
    desaturation: Math.min(0.15, age * 0.005),
    // Dying pixels accelerate with each session
    dyingInterval: Math.max(600, 3600 - age * 60),
    // Screen moss retreats slower with more sessions
    mossRetreat: Math.max(0.005, 0.015 - age * 0.0003),
    // Alternative idle messages unlock after 10 sessions
    alternativesUnlocked: age >= 10,
    // "Мир сгорел" blank screen every 50 sessions
    blankScreenDue: age >= 50 && age % 50 === 0,
  };
}

const ALT_IDLE_MSGS = [
  'ты уже был здесь', 'стены узнали тебя', 'мох помнит твой запах',
  'трещины стали шире', 'пиксели гаснут быстрее', 'колесо сделало ещё один оборот',
  'кот постарел', 'записи на стенах бледнее', 'воздух гуще', 'пепел глубже',
];

export function getAlternativeIdleMsgs() {
  return ALT_IDLE_MSGS.slice();
}

// Show blank screen for 60s on milestone sessions
export function maybeShowBlankScreen() {
  const cfg = getShiftConfig();
  if (!cfg.blankScreenDue) return false;
  const overlay = document.createElement('div');
  overlay.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;' +
    'background:#000;z-index:99999;display:flex;' +
    'align-items:center;justify-content:center;' +
    'font-family:"Press Start 2P",monospace;' +
    'color:#8a8d8f;font-size:12px;';
  overlay.textContent = 'Мир сгорел.';
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 60000);
  return true;
}
