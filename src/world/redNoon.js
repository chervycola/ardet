// ═══════════════════════════════════════
// КРАСНЫЙ ПОЛДЕНЬ — событие всего диска (канон: content/world_cells.js ·
// red-noon; ART_BIBLE «час без теней»). Очень редкое и только днём, около
// полудня: минута плоской киновари. Тени исчезают, полутона заливаются,
// формы теряют чтение; не заливается только тепло — огонь, свеча, уголь в
// груди: в час без теней видно одно тепло. Лицо солнца едва различимо в
// мареве. Мир на минуту перестаёт быть текстом: таблички нечитаемы, шёпоты
// молчат, пасхалки прячутся. Юг (у него киноварь всегда) почти не видит
// полдень глазом — узнаёт его по тишине. Милосердие: минута, не час; тени
// возвращаются — «и с ними читаемость мира».
// ?rednoon — сразу (проверка руками); клавиша N (Т) — тоже.
// ═══════════════════════════════════════
const DUR = 3600, IN = 240, OUT = 300;         // минута; входит 4 с, уходит 5 с
const CHANCE = 0.25;                           // в который полдень случится — жребий раз в сутки
const WIN0 = 0.19, WIN1 = 0.23;                // окно: около полудня (день — 0…0.42, полдень — 0.21)

let startAt = -1, rolledDay = -1, k = 0, force = false;
try { force = /[?&]rednoon\b/.test(location.search); } catch (e) {}

const smooth = v => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };

export const redNoon = {
  get k() { return k; },                       // 0…1 — насколько полдень сейчас
  get active() { return k > 0.01; },
};

// шаг: step — шаг мира, phase — фаза суток, day — номер суток (world/sky.js)
export function stepRedNoon(step, phase, day, rnd = Math.random) {
  if (force) { force = false; startAt = step; }
  if (startAt < 0 && phase > WIN0 && phase < WIN1 && rolledDay !== day) {
    rolledDay = day;                           // жребий — один раз за сутки
    if (rnd() < CHANCE) startAt = step;
  }
  if (startAt >= 0) {
    const a = step - startAt;
    if (a > DUR) { startAt = -1; k = 0; return; }
    k = smooth(a / IN) * smooth((DUR - a) / OUT);
  } else k = 0;
}
export function triggerRedNoon(step) { startAt = step; }

// текст на время полдня: буквы — точками (форма строки остаётся, чтения нет)
export const smear = s => String(s).replace(/[A-Za-zА-Яа-яЁё0-9]/g, '·');

// для тестов
export function _reset() { startAt = -1; rolledDay = -1; k = 0; force = false; }
