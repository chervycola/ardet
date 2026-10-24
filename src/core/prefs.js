// ═══════════════════════════════════════
// НАСТРОЙКИ БЫТА — то, что отмечено углём в форме 0 (ui/titleForm.js):
// звук мира, движение, кадр. Живут в браузере, отдельно от сохранения
// странствия: быт — дело заявителя, не канцелярии.
// ═══════════════════════════════════════
const KEY = 'ardet-byt';
export const BYT = {
  sound: ['громко', 'тихо', 'без звука'],
  motion: ['как есть', 'меньше'],
  frame: ['полный', 'экономный'],
};
const DEFAULTS = { sound: 'громко', motion: 'как есть', frame: 'полный' };
let prefs = { ...DEFAULTS };
try {
  const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
  if (raw) {
    const p = JSON.parse(raw);
    for (const k of Object.keys(BYT)) if (p && BYT[k].includes(p[k])) prefs[k] = p[k];
  }
} catch (e) {}

const listeners = [];
export function onPrefs(fn) { listeners.push(fn); }
export function getPref(k) { return prefs[k]; }
export function setPref(k, v) {
  if (!BYT[k] || !BYT[k].includes(v) || prefs[k] === v) return;
  prefs[k] = v;
  try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {}
  applyClasses();
  for (const fn of listeners) { try { fn(k, v); } catch (e) {} }
}

// «меньше движения» — отмеченное в форме или заданное системой
export function reducedMotion() {
  if (prefs.motion === 'меньше') return true;
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
// экономный кадр: без марева, зерно печати пересыпается редко (Г7)
export function economyFrame() { return prefs.frame === 'экономный'; }
// громкость мира: 1 — как задумано, 0.4 — тихо, 0 — без звука
export function soundLevel() { return prefs.sound === 'без звука' ? 0 : prefs.sound === 'тихо' ? 0.4 : 1; }

// страница: классы для CSS («меньше движения» без системной настройки)
function applyClasses() {
  if (typeof document === 'undefined' || !document.documentElement) return;
  document.documentElement.classList.toggle('rm', prefs.motion === 'меньше');
}
applyClasses();
