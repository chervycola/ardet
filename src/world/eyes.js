// ═══════════════════════════════════════
// ЗАКРЫТЬ ГЛАЗА — глагол без слов (weave/DEPTH_GAMES_2026-11-16.md, «Ответить коту»;
// слой «остановиться», .claude/skills/ardet-scene-accept §5). Держишь C (на русской раскладке С)
// или два пальца на экране — веки смыкаются; отпустил или шагнул — открыты. Звук остаётся:
// за веками нет ничего, кроме слуха; у огня веки чуть теплее — свет сквозь них.
// Ничего не считает и ничего не прибавляет: закрытые глаза — ответ, а не занятие.
// ═══════════════════════════════════════
const CLOSE = 1 / 24;                 // смыкаются за ~0,4 с
const OPEN = 1 / 10;                  // открываются быстрее
export const eyes = { k: 0 };         // 0 — открыты, 1 — сомкнуты
let el = null, shownK = -1, shownWarm = null;

export function stepEyes(want, moving, warm = false) {
  const target = want && !moving ? 1 : 0;
  eyes.k = target > eyes.k ? Math.min(1, eyes.k + CLOSE) : Math.max(0, eyes.k - OPEN);
  paint(warm);
}
export const eyesShut = () => eyes.k > 0.95;

// веки — поверх кадра, как при пробуждении (#wakelids), но держит их сам странник
function paint(warm) {
  if (typeof document === 'undefined' || !document.body) return;
  if (!el) {
    if (eyes.k <= 0) return;
    el = document.createElement('div'); el.id = 'eyelids';
    document.body.appendChild(el);
  }
  const k = Math.round(eyes.k * 100) / 100;
  if (k !== shownK) {
    if (el.style.setProperty) el.style.setProperty('--k', k);
    el.style.display = k > 0 ? 'block' : 'none'; shownK = k;
  }
  if (!!warm !== shownWarm) { shownWarm = !!warm; el.classList[shownWarm ? 'add' : 'remove']('warm'); }
}
export function _resetEyes() { eyes.k = 0; }
