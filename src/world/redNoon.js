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
export const WIN0 = 0.19, WIN1 = 0.23;         // окно: около полудня (день — 0…0.42, полдень — 0.21)
const DUSK = 0.42;                             // к сумеркам бросают жребий на завтра

// жребий бросается с первого шага суток (или захода), на завтра — к сумеркам; хранится
// с часами мира: сказанное «жребий суток: красный полдень» (world/clauses.js) не солжёт
// после перезагрузки. Шанс прежний; меняется только миг броска.
let startAt = -1, lots = {}, firedDay = -1, k = 0, force = false;
try { force = /[?&]rednoon\b/.test(location.search); } catch (e) {}

const smooth = v => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };

let muted = false;                             // под землёй солнца нет — полдня не видно (world/underside.js)
export const redNoon = {
  get k() { return muted ? 0 : k; },           // 0…1 — насколько полдень сейчас
  get active() { return !muted && k > 0.01; },
};
export function muteRedNoon(on) { muted = !!on; }

// шаг: step — шаг мира, phase — фаза суток, day — номер суток (world/sky.js)
export function stepRedNoon(step, phase, day, rnd = Math.random) {
  if (force) { force = false; startAt = step; }
  if (!(day in lots)) {                        // сутки начались (или первый шаг захода): жребий на сегодня
    const keep = lots[day + 1];
    lots = { [day]: rnd() < CHANCE };
    if (keep !== undefined) lots[day + 1] = keep;
  } else for (const d of Object.keys(lots)) if (+d < day) delete lots[d];
  if (phase >= DUSK && !(day + 1 in lots)) lots[day + 1] = rnd() < CHANCE;   // к сумеркам — на завтра
  if (startAt < 0 && lots[day] && firedDay !== day && phase > WIN0 && phase < WIN1) {
    firedDay = day;                            // полдень — один раз за сутки
    startAt = step;
  }
  if (startAt >= 0) {
    const a = step - startAt;
    if (a > DUR) { startAt = -1; k = 0; return; }
    k = smooth(a / IN) * smooth((DUR - a) / OUT);
  } else k = 0;
}
export function triggerRedNoon(step) { startAt = step; }
// что выпало на сутки: true — красный полдень, false — полдень как полдень, null — не брошен
export const noonLot = day => (day in lots ? lots[day] : null);
export const noonFired = day => firedDay === day;
export function saveNoon() { return { l: { ...lots }, f: firedDay }; }
export function loadNoon(d) {
  if (!d) return;
  lots = {};
  if (d.l && typeof d.l === 'object') for (const [key, v] of Object.entries(d.l)) if (Number.isFinite(+key)) lots[+key] = !!v;
  if (Number.isFinite(d.f)) firedDay = d.f;
}

// текст на время полдня: буквы — точками (форма строки остаётся, чтения нет)
export const smear = s => String(s).replace(/[A-Za-zА-Яа-яЁё0-9]/g, '·');

// для тестов
export function _reset() { startAt = -1; lots = {}; firedDay = -1; k = 0; force = false; }
