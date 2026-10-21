// ═══════════════════════════════════════
// ШЁПОТЫ — места шепчут, когда стоишь рядом тихо.
// Шёпот не проявляется, а пишется (канон Г-8, IRONY_DEVICES): буквы
// дорисовываются штрихами, как пером при тебе. Перо идёт слева направо,
// по штриху буквы — с верхней точки к соседней; между буквами отрывается,
// на пробеле медлит. Свежие чернила светлее и сохнут на глазах, кончик пера
// виден. Дописал — строка стоит, потом выцветает и уходит вверх.
// Строка пишется в полную точность экрана: клетка штриха — точка игры.
// Ночью шёпоты живут только у света; в красный полдень молчат, а недописанный
// гаснет. ?whisper — без паузы перед первым шёпотом (проверка руками).
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { scaler } from '../render/scaler.js';
import { redNoon } from './redNoon.js';

export const WHISPERS = {
  church: '...lasciate ogni speranza...',
  crypt: '...девять ярусов вниз...',
  lake: '...удочку оставь... всё равно запрещено...',
  luna_tag: '...занавески задёрни... светит же...',
  clock_board: '...который час?.. не говорят... ну и ладно...',
  kotlovan_well: '...ведро не забудь... пустое тоже нести...',
  cross: '...круг не размыкается...',
  raven: '...не корми с руки... он запомнит...',
  pizzeria: '...47 столов... welcome куда?...',
  radio: '...лента продолжает ехать...',
  junkyard: '...автопилот всё ещё едет...',
  train: '...трава у колёс не растёт...',
  library: '...мох читает с полки 7-G...',
  fountain: '...чума мутировала...',
  graffiti: '...потряси баллон... ещё стучит?...',
  basement: '...iä! iä!...',
  campfire: '...огонь не помнит, что варил...',
  terminal: '...how can I help you today?...',
  // Источник: Андрей Платонов, «Чевенгур» / записные книжки — «без меня
  // народ неполный» (долг №9 каркаса v3: честность каталога).
  tent: '...без меня народ неполный...',
  vending: '...мериты... крути...',
  bus: '...учебная тревога повторяется...',
  exit: '...блуждание — было общим...',
  crater: '...ни орла ни решки...',
  overpass: '...тебе не обязательно сегодня...',
  riverbed: '...вода помнит цвет...',
  billboard: '...69 миллионов... за jpeg...',
  powerline: '...фантомный гул...',
  ruins: '...жильцы съехали раньше пожара...',
  pipeline: '...nord stream... пузыри...',
  watchtower: '...prism... кто-то только что ушёл...',
  pit: '...братишка... покушать...',
  nocturnal: '......(тишина)......',
  theater: '...одну сцену. одиннадцать лет...',
  altar: '...приложи ладонь... мох ждал...',
  posterwall: '...выход был заперт снаружи...',
  banner: '...coming soon...',
  // ── PHILOSOPHY PHASE 1 / PACKAGE A + G ──
  pithos: '...жильё без ипотеки... солнца не заслоняй...',
  gates: '...обычно это узнают позже...',
};

const INK = '#e8dcc8';                          // чернила шёпота
const NIB = '#D9CFB8';                          // кончик пера — КОСТЬ
const FONT_PX = 6, FONT = '"Press Start 2P","VT323",monospace';
const PEN = 1.6;                                // скорость пера: клеток штриха за шаг
const LIFT = 2, SPACE = 5;                      // перо оторвалось между буквами; на пробеле медлит
const LETTER = 6;                               // без холста (проверки) — шагов на букву
const HOLD = 90, FADE = 240;                    // дописал — постоял полторы секунды, выцветает четыре
const WET = 12;                                 // сколько шагов сохнут свежие чернила
const DRY_A = 0.35, WET_A = 0.3, NIB_A = 0.75;  // сухое, свежее сверху, кончик
const COOLDOWN = 10800;                         // ~3 минуты между шёпотами

let whisper = { text: '', x: 0, y: 0, t0: 0, prep: null };
let lastWhisperEnd = 0;
try { if (/[?&]whisper\b/.test(location.search)) lastWhisperEnd = -COOLDOWN; } catch (e) {}
// места, которым сейчас молчать: у них свой шёпот по случаю (ночью у пифоса — мох)
export const hush = new Set();
// шёпот по случаю, не по расписанию: пишется, если перо свободно и не красный полдень;
// faint — на границе слышимости (чернила вдвое бледнее); follow() → [x, y] — шёпот
// идёт следом (вплотную, у уха), не отставая и не забегая вперёд
export function sayAt(text, x, y, faint = false, follow = null) {
  if (whisper.text || redNoon.active) return false;
  whisper = { text, x, y, t0: t, prep: null, k: faint ? 0.5 : 1, follow };
  return true;
}
// шёпот отходит в сторону, к стене (вдох на пороге): перестаёт идти следом
export function drift(x, y) { if (whisper.text && whisper.follow) whisper.follow = () => [x, y]; }
// шаг мира: шёпот, что идёт следом, догоняет — мягко
export function stepWhisper() {
  const w = whisper;
  if (!w.text || !w.follow) return;
  const [x, y] = w.follow();
  w.x += (x - w.x) * 0.12; w.y += (y - w.y) * 0.12;
}
export const whisperText = () => whisper.text;
export const whisperAt = () => [whisper.x, whisper.y];
// погасить: недописанный гаснет недописанным, дописанный — выцветает сразу
export function quench() {
  const w = whisper;
  if (!w.text || w.quenched) return;
  if (!w.prep) { whisper = { text: '', x: 0, y: 0, t0: 0, prep: null }; return; }   // перо ещё не коснулось
  const a = t - w.t0;
  if (a >= w.prep.write + HOLD) return;
  w.cut = Math.min(a, w.prep.write); w.t0 = t - w.prep.write - HOLD; w.quenched = true;
}
// смена карты (спуск, подъём): шёпот остаётся там, где был сказан
export function clear() {
  if (!whisper.text) return;
  whisper = { text: '', x: 0, y: 0, t0: 0, prep: null };
  lastWhisperEnd = t;
}

// litAt(x, y) — ночью: светит ли тут чужой свет (уголь в груди не в счёт);
// null — день, свет не нужен
export function check(player, locations, litAt = null) {
  if (whisper.text) return;
  if (redNoon.active) return;                    // красный полдень: шёпоты молчат
  if (t - lastWhisperEnd < COOLDOWN) return;

  for (const l of locations) {
    if (!WHISPERS[l.id] || hush.has(l.id)) continue;
    const dx = player.x - l.x - l.w / 2;
    const dy = player.y - l.y - l.h / 2;
    if (Math.sqrt(dx * dx + dy * dy) < 70 && !player.moving) {
      // ночью шёпоты живут только у света: в темноте мир не отвечает
      if (litAt && !l.light && !litAt(l.x + l.w / 2, l.y + l.h / 2)) continue;
      whisper = { text: WHISPERS[l.id], x: l.x + l.w / 2, y: l.y - 10, t0: t, prep: null };
      break;
    }
  }
}

// путь пера по одной букве: с верхней левой точки — к ближайшей соседней,
// по возможности не сворачивая (штрих, а не строчка за строчкой)
export function penPath(cells) {
  const left = cells.slice(), out = [];
  if (!left.length) return out;
  let k = 0;
  for (let i = 1; i < left.length; i++) if (left[i].y < left[k].y || (left[i].y === left[k].y && left[i].x < left[k].x)) k = i;
  let cur = left.splice(k, 1)[0], dx = 0, dy = 0;
  out.push(cur);
  while (left.length) {
    let bi = 0, bs = Infinity;
    for (let i = 0; i < left.length; i++) {
      const ex = left[i].x - cur.x, ey = left[i].y - cur.y;
      const d = Math.max(Math.abs(ex), Math.abs(ey));
      const turn = dx || dy ? 1 - (ex * dx + ey * dy) / (Math.hypot(ex, ey) * Math.hypot(dx, dy)) : 0;
      const sc = d + 0.3 * turn + (ey < 0 ? 0.05 : 0);         // ближе, прямее, сверху вниз
      if (sc < bs) { bs = sc; bi = i; }
    }
    const nx = left.splice(bi, 1)[0];
    dx = nx.x - cur.x; dy = nx.y - cur.y; cur = nx;
    out.push(cur);
  }
  return out;
}

// строка — в клетки штриха по буквам и расписание пера (при первом показе)
function prepare(text) {
  let full = null;
  try { full = document.createElement('canvas'); } catch (e) { return null; }
  const g = full && full.getContext && full.getContext('2d', { willReadFrequently: true });
  if (!g) return null;
  const s = Math.max(1, Math.round(scaler.scale) || 1), fp = FONT_PX * s, font = `${fp}px ${FONT}`;
  g.font = font;
  const tw = g.measureText(text).width, B = Math.round(fp * 1.15);
  const cw = Math.ceil((tw + 2 * s) / s), ch = Math.ceil((B + fp * 0.5) / s);
  full.width = cw * s; full.height = ch * s;
  g.font = font; g.fillStyle = INK; g.textBaseline = 'alphabetic';
  g.fillText(text, s, B);
  const chars = Array.from(text), ext = [];                    // где кончается каждая буква (точки холста)
  for (let i = 0; i <= chars.length; i++) ext.push(s + g.measureText(chars.slice(0, i).join('')).width);
  const d = g.getImageData(0, 0, full.width, full.height).data, W = full.width;
  const per = chars.map(() => []);
  for (let cy = 0; cy < ch; cy++) for (let cx = 0; cx < cw; cx++) {
    let ink = 0;
    for (let y = 0; y < s && !ink; y++) for (let x = 0; x < s; x++) if (d[((cy * s + y) * W + cx * s + x) * 4 + 3]) { ink = 1; break; }
    if (!ink) continue;
    const mx = (cx + 0.5) * s;
    let i = 0;
    while (i < chars.length - 1 && mx >= ext[i + 1]) i++;
    per[i].push({ x: cx, y: cy });
  }
  const cells = [], times = [];
  let time = 0;
  chars.forEach((c, i) => {
    if (!per[i].length) { time += c === ' ' ? SPACE : 1; return; }
    for (const q of penPath(per[i])) { cells.push(q); times.push(Math.floor(time)); time += 1 / PEN; }
    time += LIFT;
  });
  const sheet = document.createElement('canvas');
  sheet.width = full.width; sheet.height = full.height;
  return { full, sheet, sg: sheet.getContext('2d'), s, cells, times, next: 0, write: Math.ceil(time), wl: cw, base: B / s };
}

export function draw(ctx, camera) {
  void camera;                                    // контекст мира уже сдвинут камерой — рисуем в координатах мира
  if (!whisper.text) return;
  const w = whisper;
  if (!w.prep) {
    w.prep = prepare(w.text);
    if (!w.prep) {                                // без холста — строка дописывается по буквам целиком
      ctx.font = `${FONT_PX}px ${FONT}`;
      w.prep = { write: Array.from(w.text).length * LETTER, wl: ctx.measureText(w.text).width, plain: true };
    }
  }
  const P = w.prep;
  let a = t - w.t0;
  if (redNoon.active && a < P.write + HOLD) {     // полдень: недописанное так и гаснет недописанным
    if (w.cut === undefined) w.cut = Math.min(a, P.write);
    w.t0 = t - P.write - HOLD; a = P.write + HOLD;
  }
  const wrote = w.cut === undefined ? a : w.cut;  // докуда дошло перо
  if (a >= P.write + HOLD + FADE) { whisper = { text: '', x: 0, y: 0, t0: 0, prep: null }; lastWhisperEnd = t; return; }
  const fade = (a < P.write + HOLD ? 1 : 1 - (a - P.write - HOLD) / FADE) * (w.k ?? 1);
  const sy = w.y - Math.max(0, a - P.write - HOLD) * 0.12;     // выцветая, уходит вверх
  if (P.plain) {
    const n = Math.min(Array.from(w.text).length, Math.floor(wrote / LETTER) + 1);
    ctx.globalAlpha = DRY_A * fade; ctx.fillStyle = INK; ctx.font = `${FONT_PX}px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText(Array.from(w.text).slice(0, n).join(''), w.x - P.wl / 2, sy);
    ctx.globalAlpha = 1;
    return;
  }
  // перо: дописать клетки, до которых дошло
  while (P.next < P.cells.length && P.times[P.next] <= wrote) {
    const c = P.cells[P.next++];
    P.sg.drawImage(P.full, c.x * P.s, c.y * P.s, P.s, P.s, c.x * P.s, c.y * P.s, P.s, P.s);
  }
  const s = P.s;
  const x0 = Math.round((w.x - P.wl / 2) * s) / s, y0 = Math.round((sy - P.base) * s) / s;
  ctx.globalAlpha = DRY_A * fade;
  ctx.drawImage(P.sheet, x0, y0, P.wl, P.sheet.height / s);
  // свежие чернила светлее — сохнут за WET шагов
  for (let i = P.next - 1; i >= 0 && a - P.times[i] < WET; i--) {
    const c = P.cells[i];
    ctx.globalAlpha = WET_A * (1 - (a - P.times[i]) / WET) * fade;
    ctx.drawImage(P.full, c.x * s, c.y * s, s, s, x0 + c.x, y0 + c.y, 1, 1);
  }
  if (P.next > 0 && P.next < P.cells.length && w.cut === undefined) {   // кончик пера — пока пишет
    const c = P.cells[P.next - 1];
    ctx.globalAlpha = NIB_A * fade; ctx.fillStyle = NIB;
    ctx.fillRect(x0 + c.x, y0 + c.y, 1, 1);
  }
  ctx.globalAlpha = 1;
}

// для проверок
export function _reset() { whisper = { text: '', x: 0, y: 0, t0: 0, prep: null }; lastWhisperEnd = -COOLDOWN; }
