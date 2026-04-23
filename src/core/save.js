// ═══════════════════════════════════════
// SAVE / LOAD — localStorage persistence
// ═══════════════════════════════════════
import { events, E } from './events.js';

const KEY = 'ardet_v2_save';

export function saveGame(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      ...data,
      version: 2,
      timestamp: Date.now(),
    }));
    events.emit(E.SAVE);
    return true;
  } catch (e) {
    console.error('[save] error:', e);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    events.emit(E.LOAD, data);
    return data;
  } catch (e) {
    console.error('[load] error:', e);
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(KEY);
}

// Auto-save interval
let autoSaveInterval = null;
export function startAutoSave(getSaveData, intervalMs = 30000) {
  if (autoSaveInterval) clearInterval(autoSaveInterval);
  autoSaveInterval = setInterval(() => {
    saveGame(getSaveData());
  }, intervalMs);
}

export function stopAutoSave() {
  if (autoSaveInterval) clearInterval(autoSaveInterval);
  autoSaveInterval = null;
}
