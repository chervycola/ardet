// ═══════════════════════════════════════
// ПОВТОРНЫЙ ОСМОТР (weave/ROADMAP И8; слово автора 23.10): второй и следующие
// осмотры вещи — точнее первого, вариант — по обстановке. Первый — всегда свой
// текст вещи. Счёт осмотров, виденные варианты и тронутые вещи помнит
// сохранение. Тексты — content/relooks.js; метки обстановки даёт main.js.
// ═══════════════════════════════════════
import { RELOOKS } from '../content/relooks.js';

const counts = new Map();   // id → сколько раз осматривали
const shown = new Map();    // id → номера виденных вариантов
const used = new Set();     // с чем странник что-то делал

export function noteLook(id) {
  const n = (counts.get(id) || 0) + 1;
  counts.set(id, n);
  return n;
}
export const lookCount = id => counts.get(id) || 0;
export function noteUse(id) { used.add(id); }
export const wasUsed = id => used.has(id);

// текст повторного осмотра или null (первый раз, нет вариантов, ни один не подходит).
// tags — метки обстановки (Set); n3 и used добавляются здесь
export function relookText(id, tags = new Set()) {
  const list = RELOOKS[id], n = counts.get(id) || 0;
  if (!list || n < 2) return null;
  const T = new Set(tags);
  if (n >= 3) T.add('n3');
  if (used.has(id)) T.add('used');
  const fits = [];
  list.forEach((v, i) => { if (!v.if || v.if.every(tg => T.has(tg))) fits.push(i); });
  if (!fits.length) return null;
  const seen = shown.get(id) || new Set();
  const i = fits.find(k => !seen.has(k)) ?? fits[0];   // сперва — ещё не виденный
  seen.add(i);
  shown.set(id, seen);
  return list[i].text;
}

export function saveRelook() {
  return {
    n: Object.fromEntries(counts),
    seen: Object.fromEntries([...shown].map(([id, s]) => [id, [...s]])),
    used: [...used],
  };
}
export function loadRelook(d) {
  if (!d) return;
  for (const [id, n] of Object.entries(d.n || {})) if (n > 0) counts.set(id, n | 0);
  for (const [id, s] of Object.entries(d.seen || {})) if (Array.isArray(s)) shown.set(id, new Set(s));
  for (const id of d.used || []) used.add(id);
}
export function _resetRelook() { counts.clear(); shown.clear(); used.clear(); }
