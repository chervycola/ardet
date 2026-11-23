// ═══════════════════════════════════════
// ДЕКОРАЦИЯ СЦЕНЫ ТЕАТРА ТЕНЕЙ (world/stage.js; weave/SCENE_STAGE_2026-11-22.md, шаг 2).
// Своя карта 232×122 в масштабе странника, как комната дома: тот же театр, что в городке,
// только крупно. Сверху вниз: небо над гребнем холма (ночь или день — по часу мира); над правой кулисой — блок и канат;
// шесть ярусов дугами, камень блоками, мох гуще кверху, два прохода лесенками, кое-где блок
// выпал; на четвёртом ярусе у прохода — живой зритель, моргает; круглая сцена плитами,
// трещина поперёк; кулисы по бокам; перед сценой натоптанная земля, справа гардероб: одно
// пальто с номерком и раскрытая книга выдачи. Свет слева, кромка пеплом справа.
// Живое поверх запечённого: зал из пыли в свете фонаря (призрачная дрожь, одно зерно на зал),
// тени труппы «Квадратом», человек с фонарём (три позы), странник на трещине.
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { DW, DH, PLATE, LANTERN, CENTER, SEAT_D, quadAt, stageView, stage, ageOf, CAPTION_AT, THINK_HOLD, THINK_RISE, HALL_HOLD, HALL_FADE } from '../world/stage.js';
import { tremble, ghostShift, flicker, ghostSeed, GHOST_A, setGaze, gazeFade } from './ghost.js';
import { digitalState, digitalText, setStill } from './digital.js';
import { redNoon } from '../world/redNoon.js';
import { preparePen, penDraw, PEN_HOLD, PEN_FADE } from '../world/whisper.js';
import { X, setCtx } from './context.js';
import * as locSprites from '../sprites/locations/index.js';

const NI = '#0D0B0A', BO = '#D9CFB8', AS = '#8A8D8F', SV = '#E28A3A';
const TI = '#8CC63F';                             // третья краска: свечение экрана
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K3 = '#34302a', K4 = '#3a3328';
const L1 = '#c8b89a', L2 = '#b0a284', SEP = '#3A3026';
const S0 = '#474442', S1 = '#5e5e5d', S2 = '#33302e';
const MG = '#3D4A3A', MG_D = '#2c3529', MG_L = '#566650';
const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
function hq(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ярусы: дуги над сценой, от нижнего (0) к верхнему (5); кое-где блок выпал до земли — кроме блока
// живого зрителя (ему есть на чём сидеть)
export const TIERS = 6;
export const tierOf = k => ({ rx: 72 + 8 * k, ry: 22 + 7 * k, h: 4 + 3 * k });
const TCY = 86;                                   // середина дуг
const AISLES = [0.36, 0.64];
export const tierY = (k, th) => { const { ry, h } = tierOf(k); return TCY - h - ry * Math.sin(th * Math.PI); };
export const tierX = (k, th) => CENTER.x + tierOf(k).rx * Math.cos(th * Math.PI);
const SPEC = { k: 3, th: 0.3 };                   // живой зритель: ярус и место на дуге
const blockOf = (k, x) => Math.floor((x + k * 5) / 9);
export const goneAt = (k, x) => hq(blockOf(k, x), k, 21) < 0.05 && !(k === SPEC.k && blockOf(k, x) === blockOf(k, Math.round(tierX(SPEC.k, SPEC.th))));

// ── неподвижное: запекается один раз на ночь и на день ──
const sheets = {};
function bakeBody(day) {
  let c = null;
  try { c = document.createElement('canvas'); } catch (e) { return null; }
  if (!c || !c.getContext) return null;
  c.width = DW; c.height = DH;
  const g = c.getContext('2d');
  if (!g) return null;
  // небо над гребнем холма: ночью — звёзды, днём — ржавая взвесь без звёзд (час мира тот же, что снаружи)
  R(g, 0, 0, DW, DH, day ? K2 : NI);
  if (day) { for (let y = 0; y < 12; y++) for (let x = 0; x < DW; x++) if (hq(x, y, 5) < 0.12) R(g, x, y, 1, 1, hq(x, y, 6) < 0.5 ? K4 : SEP); }
  else for (let i = 0; i < 26; i++) { const x = hq(i, 1, 7) * DW, y = hq(i, 2, 7) * 9; R(g, x, y, 1, 1, hq(i, 3, 7) < 0.3 ? L2 : K4); }
  for (let x = 0; x < DW; x++) {                   // холм: сухая трава по гребню, в него вырезан зал
    const top = 9 + Math.round(3 * Math.sin(x * 0.05) + 2 * hq(x, 4, 9));
    for (let y = top; y < 70; y++) R(g, x, y, 1, 1, hq(x, y, 11) < 0.06 ? K4 : hq(x, y, 12) > 0.95 ? MG_D : SEP);
    if (hq(x, 5, 13) < 0.5) R(g, x, top - 1, 1, 1 + (hq(x, 6, 13) < 0.3 ? 1 : 0), hq(x, 7, 13) < 0.4 ? MG : K4);
  }
  // ярусы — от верхнего к нижнему: нос скамьи, сиденье, подступёнок; блоками
  for (let k = TIERS - 1; k >= 0; k--) {
    const { rx, ry, h } = tierOf(k), base = TCY - h + 6;
    for (let x = Math.ceil(CENTER.x - rx); x <= Math.floor(CENTER.x + rx); x++) {
      const u = (x - CENTER.x) / rx, y0 = Math.round(TCY - h - ry * Math.sqrt(Math.max(0, 1 - u * u)));
      const blk = blockOf(k, x), joint = (x + k * 5) % 9 === 0, gone = goneAt(k, x);
      if (gone) { R(g, x, y0, 1, Math.max(1, base - y0), SEP); R(g, x, y0, 1, 1, K4); continue; }
      const lit = x < CENTER.x ? (hq(blk, k, 23) < 0.3 ? L2 : S1) : (hq(blk, k, 23) < 0.3 ? S1 : S0);
      R(g, x, y0, 1, 2, joint ? S2 : lit); R(g, x, y0 + 2, 1, 1, joint ? K3 : x < CENTER.x ? S0 : S2);
      R(g, x, y0 + 3, 1, Math.max(1, base - y0 - 3), x < CENTER.x ? (joint ? K1 : K2) : (joint ? K2 : S2));
      const moss = 0.05 + 0.05 * k;
      if (hq(x, k, 31) < moss) { R(g, x, y0, 2, 1, MG); if (hq(x, k, 33) < 0.5) R(g, x, y0 + 1, 1, 1, MG_L); }
      if (hq(x, k, 35) < moss * 0.6) R(g, x, y0 + 3, 1, 1 + (hq(x, k, 41) < 0.4 ? 1 : 0), MG_D);
    }
    for (const th of AISLES) {                     // проходы: лесенки через ярусы
      const xa = Math.round(tierX(k, th)), y0 = Math.round(tierY(k, th));
      R(g, xa - 2, y0, 5, 2, S1); R(g, xa - 2, y0 + 2, 5, 1, K3); R(g, xa - 2, y0 + 3, 5, 2, S0); R(g, xa - 2, y0, 1, 2, L2);
    }
  }
  // кулисы: тёмные щиты по бокам, кромка к свету
  R(g, 0, 34, 12, 76, K1); R(g, 11, 34, 1, 76, K3); R(g, 0, 34, 12, 1, K3);
  R(g, DW - 12, 34, 12, 76, K1); R(g, DW - 12, 34, 1, 76, AS); R(g, DW - 12, 34, 12, 1, K3);
  // над правой кулисой — блок и канат
  R(g, DW - 20, 2, 5, 4, K3); R(g, DW - 19, 3, 3, 2, S0); R(g, DW - 18, 6, 1, 28, K3);
  // перед сценой — натоптанная земля
  for (let y = 100; y < DH; y++) for (let x = 0; x < DW; x++) {
    const h = hq(x, y, 51);
    R(g, x, y, 1, 1, Math.abs(x - CENTER.x) < 26 && y > 108 ? (h < 0.35 ? SEP : K4) : h < 0.07 ? K4 : h > 0.95 ? MG_D : SEP);
  }
  // сцена: плиты кругом, край к свету, лицевая сторона кладкой
  const { cx, cy, rx, ry } = PLATE;
  for (let x = cx - rx; x <= cx + rx; x++) {
    const u = (x - cx) / rx, sq = Math.sqrt(Math.max(0, 1 - u * u)), y0 = Math.round(cy - ry * sq), y1 = Math.round(cy + ry * sq);
    for (let y = y0; y <= y1; y++) R(g, x, y, 1, 1, (x - cx + 60) % 13 === 0 && y > y0 ? S2 : hq(x >> 3, y >> 2, 53) < 0.15 ? S0 : S1);
    R(g, x, y0, 1, 1, x < cx ? L2 : S0);
    R(g, x, y1 + 1, 1, 5, (x + 1) % 8 === 0 ? K1 : x < cx + 6 ? K3 : S2); R(g, x, y1 + 6, 1, 1, K1);
    if (hq(x, 9, 55) < 0.15) R(g, x, y1 + 1, 1, 1, MG_D);
  }
  // трещина поперёк сцены, через середину
  let ty = cy;
  for (let x = cx - 46; x <= cx + 46; x++) { ty += hq(x, 3, 57) < 0.33 ? -1 : hq(x, 3, 57) > 0.66 ? 1 : 0; ty = Math.max(cy - 3, Math.min(cy + 3, ty)); R(g, x, ty, 1, 1, K1); if (hq(x, 4, 57) < 0.2) R(g, x, ty + 1, 1, 1, S2); }
  // гардероб: вешалка, одно пальто — тяжёлое, номерок; стойка, книга выдачи раскрыта
  const gx = 196, gg = 118;
  R(g, gx, gg - 30, 1, 30, K1); R(g, gx - 4, gg - 1, 9, 1, K1); R(g, gx - 5, gg - 30, 11, 2, K1);
  R(g, gx - 6, gg - 28, 9, 19, K2); R(g, gx - 6, gg - 28, 1, 19, K4); R(g, gx - 5, gg - 28, 4, 2, L2); R(g, gx - 2, gg - 25, 1, 13, K1);
  R(g, gx - 5, gg - 10, 7, 1, K3); R(g, gx + 2, gg - 26, 2, 4, BO);                   // номерок
  R(g, gx + 9, gg - 12, 14, 2, K1); R(g, gx + 11, gg - 10, 2, 10, K1); R(g, gx + 19, gg - 10, 2, 10, K1);
  R(g, gx + 9, gg - 16, 14, 4, BO); R(g, gx + 16, gg - 16, 1, 4, L2);                  // книга раскрыта
  for (let k = 0; k < 3; k++) { R(g, gx + 10, gg - 15 + k, 5, 1, K3); R(g, gx + 18, gg - 15 + k, 4, 1, K3); }
  return c;
}

// ── зал из пыли: следы от тел встают в свете фонаря снизу вверх; головы на точку к середине
// сцены — туда, где сидит странник; место живого зрителя, проходы и камень за кулисами свободны
let seats = null;
function seatList() {
  if (seats) return seats;
  seats = [];
  for (let k = 0; k < TIERS; k++) {
    const { rx, ry } = tierOf(k), n = Math.round((Math.PI * (rx + ry) / 2) / 8);
    for (let i = 0; i < n; i++) {
      const th = 0.04 + 0.92 * (i + 0.5) / n;
      if (AISLES.some(a => Math.abs(th - a) < 0.03)) continue;
      if (k === SPEC.k && Math.abs(th - SPEC.th) < 0.035) continue;
      const x = Math.round(tierX(k, th));
      // кулисы (0..11 и DW−12..) закрывают ярус; двойник уходит на 3 точки вправо, дрожь — на 1 влево
      if (x - 3 <= 11 || x + 5 >= DW - 12) continue;
      let hole = false;                                            // выпавший блок: сидеть не на чем
      for (let dx = -2; dx <= 2; dx++) if (goneAt(k, x + dx)) hole = true;
      if (hole) continue;
      seats.push({ k, x, y: Math.round(tierY(k, th)) });
    }
  }
  return seats;
}
export const _seats = () => seatList();
// day — днём пыль бледнее, как взвесь в луче
function dustHall(c, light, day) {
  const sd = 47, [gx, gy] = ghostShift(sd), [jx, jy] = tremble(sd), f = flicker(sd);
  for (const pass of [0, 1]) {
    const ox = pass ? jx : gx, oy = pass ? jy : gy, am = pass ? f : GHOST_A;
    for (const s of seatList()) {
      const a = Math.max(0, Math.min(1, light * TIERS - s.k));        // свет идёт вверх по ярусам
      if (a <= 0) continue;
      const to = s.x < CENTER.x - 2 ? 1 : s.x > CENTER.x + 2 ? -1 : 0;
      c.globalAlpha = a * (day ? 0.24 : 0.34) * am * gazeFade();      // в упор — до трети
      R(c, s.x - 2 + ox, s.y - 4 + oy, 5, 3, AS);                     // плечи пеплом
      R(c, s.x - 1 + to + ox, s.y - 7 + oy, 3, 3, AS);                // голова — к сцене
      R(c, s.x - 1 + to + ox, s.y - 7 + oy, 3, 1, BO);                // костяная кромка
    }
  }
  c.globalAlpha = 1;
}

// ── живой зритель: на четвёртом ярусе у прохода; моргает; иногда светящееся у глаз.
// raised — поднял светящееся над головой (рамка, шаг 3): во всём зале он один смотрит не на сцену
function spectator(c, raised = false) {
  const x = Math.round(tierX(SPEC.k, SPEC.th)), y = Math.round(tierY(SPEC.k, SPEC.th));
  R(c, x - 2, y - 4, 5, 3, NI); R(c, x - 1, y - 7, 3, 3, NI);
  if (raised) {                                                       // руки вверх, светящееся в ладонях
    R(c, x - 2, y - 10, 1, 4, NI); R(c, x + 2, y - 10, 1, 4, NI);
    c.globalAlpha = 0.5; R(c, x - 1, y - 11, 3, 2, TI); c.globalAlpha = 1;
    if (t % 230 >= 7) { R(c, x - 1, y - 7, 1, 1, L2); R(c, x + 1, y - 7, 1, 1, L2); }   // глаза вверх, к светящемуся
    return;
  }
  const glow = t % 7200 < 480, blink = glow ? t % 50 < 6 : t % 230 < 7;
  if (!blink) { R(c, x - 1, y - 6, 1, 1, L2); R(c, x + 1, y - 6, 1, 1, L2); }
  if (glow) { c.globalAlpha = 0.22; R(c, x - 2, y - 9, 5, 4, '#8CC63F'); c.globalAlpha = 1; R(c, x, y - 5, 1, 2, '#8CC63F'); }
}

// ── тени труппы в рост странника: чёрные, без двойника (эхо, а не призраки). Жест — в свой черёд
function shadow(c, q, quad2) {
  const x = Math.round(q.x), fy = Math.round(q.y), d = q.dx;
  const step = q.walking ? (Math.floor(t / 9) + (q.kind.length)) & 1 : 0;
  if (q.kind === 'sit' && !q.walking) {                              // сидит на корточках, кивает
    const n = (t >> 5) & 1;
    R(c, x - 3, fy - 4, 7, 4, NI); R(c, x - 2, fy - 11, 6, 7, NI); R(c, x - 1 + n * d, fy - 15, 4, 4, NI);
    return;
  }
  const shake = q.kind === 'laugh' && q.mine && (t >> 3) & 1 ? 1 : 0;
  const y = fy - shake;
  R(c, x - 1, y - 6, 2, 6 - step, NI); R(c, x + 1, y - 6, 2, 6 - (1 - step), NI);   // ноги — шагают
  R(c, x - 2, y - 15, 6, 10, NI);                                                    // тело
  const hx = q.kind === 'laugh' && q.mine ? -d : 0;                                  // смеётся — голова назад
  R(c, x - 1 + hx, y - 19, 4, 4, NI);
  if (q.kind === 'laugh' && q.mine) R(c, x + 2 * d, y - 11, 2, 2, NI);              // рука на животе
  if (q.kind === 'silent' && q.mine) R(c, x + (d > 0 ? 3 : -2), y - 17, 1, 3, NI);  // рука у рта
  if (q.kind === 'burn') {                                                           // огонь — тенью; во втором варианте не вспыхивает
    const f = !quad2 && q.mine ? 4 + ((t >> 3) % 3) : 1 + ((t >> 5) & 1);
    R(c, x, y - 19 - f, 2, f, NI); R(c, x - 1, y - 19 - (f >> 1), 1, f >> 1, NI);
    if (f > 3) { R(c, x + 2, y - 21 - (f >> 1), 1, f >> 1, NI); R(c, x - 2, y - 18, 1, 2, NI); }
  }
}

// ── человек с фонарём: живой, у дальнего правого края; фонарь у ног — поднят — выше
function lanternMan(c, lift) {
  const x = LANTERN.x, fy = LANTERN.y;
  R(c, x - 1, fy - 6, 2, 6, K1); R(c, x + 1, fy - 6, 2, 6, K1);
  R(c, x - 2, fy - 16, 6, 10, K1); R(c, x + 3, fy - 16, 1, 10, K3);
  R(c, x - 1, fy - 20, 4, 4, K1);
  if (lift > 0.5) R(c, x - 1, fy - 19, 2, 2, L2);                    // лицо в свете
  const ly = Math.round(fy - 5 - lift * 11), lx = x - 5;
  R(c, x - 3, Math.min(fy - 12, ly + 1), 1, Math.max(1, fy - 12 - ly), K1);   // рука
  R(c, lx, ly - 2, 3, 1, K3); R(c, lx, ly - 1, 3, 4, SV); R(c, lx + 1, ly, 1, 2, BO);
  c.globalAlpha = 0.14 + 0.12 * Math.min(1, lift); R(c, lx - 2, ly - 3, 7, 8, SV); c.globalAlpha = 1;
}

// ═══ ЧЕТЫРЕ ВИДА (шаг 3; weave/SCENE_STAGE §2.4): события прихода из stage.ev по часам сцены ═══
const evNow = kind => (stage.ev ? stage.ev.filter(e => e.kind === kind && ageOf(e) !== null) : []);
const lerp = (a, b, k) => a + (b - a) * k;
// строка по словам, не длиннее n знаков (как render/net.js wrap)
function wrap(text, n = 24) {
  const out = [];
  let cur = '';
  for (const w of String(text).split(' ')) {
    if (cur && (cur + ' ' + w).length > n) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) out.push(cur);
  return out;
}
// перо в несколько строк: пишет строку за строкой, одно зерно призрака на всю фразу (world/whisper.js)
function penLines(c, e, text, n = 24) {
  if (!e.preps) { const sd = ghostSeed(text); e.preps = wrap(text, n).map(l => { const P = preparePen(c, l); P.seed = sd; return { l, P }; }); }
  return e.preps;
}
// x0, x1 — в каких границах держать строку (между кулисами, а для шёпота зала — левее зрителя)
function drawPen(c, preps, cx, top, a, fade, x0 = 14, x1 = DW - 14) {
  let start = 0;
  const w = Math.max(0, ...preps.map(q => q.P.wl || 0));
  const x = Math.max(x0 + w / 2, Math.min(x1 - w / 2, cx));
  preps.forEach((q, i) => {
    const wr = a - start;
    if (wr > 0) penDraw(c, q.P, q.l, x, top + i * 8, wr, wr, fade, true);
    start += q.P.write;
  });
}
const penTotal = preps => preps.reduce((s, q) => s + q.P.write, 0);

// ── ПОЛОСЫ ПЕРА. Чтобы слова не ложились друг на друга и на зрителя, у каждого вида — своя полоса:
// рамка и подпись — наверху (строки 3–24); шёпот зала — ниже, только левее живого зрителя (строки
// 22–39, правый край не дальше 160); мысль — ещё ниже, от капюшона до третьего ряда (строки 41–68).
// Перо успевает в своё окно расписания (world/stage.js): рисунок знает, сколько пишется строка, и
// ускоряет перо ровно настолько, насколько нужно (k ≥ 1)
export const BANDS = { hall: { top: 22, bottom: 39, x1: 160 }, thought: { top: 41, bottom: 68 } };
const speedOf = (e, need) => (e.k ??= Math.max(1, need / Math.max(1, (e.due ?? e.at + need) - e.at)));

// ── шёпот зала: пером над шепчущим пылевым зрителем третьего ряда, левее середины (правее — живой
// зритель и рамка), быт мимо огня; гаснет на месте
function hallSeats() { return seatList().filter(s => s.k === 2 && s.x < 110 && s.y >= 38 && s.y <= 52); }
export function hallSeat(i) { const S = hallSeats(); return S.length ? S[((i | 0) * 3 + 1) % S.length] : { x: 90, y: 46, k: 2 }; }
export const hallSeatPan = i => Math.max(-1, Math.min(1, (hallSeat(i).x - CENTER.x) / CENTER.x));
const READ = 1.8;                                  // перо на сцене читаемее, чем шёпот улицы (свет фонаря множит)
function drawHall(c, e, a) {
  const preps = penLines(c, e, e.text, 22), total = penTotal(preps), need = total + HALL_HOLD + HALL_FADE;
  a *= speedOf(e, need);
  if (a >= need) return;
  const fade = (a < total + HALL_HOLD ? 1 : 1 - (a - total - HALL_HOLD) / HALL_FADE) * READ * gazeFade();
  const B = BANDS.hall, n = preps.length;
  const bottom = Math.max(B.top + 6 + (n - 1) * 8, Math.min(B.bottom, hallSeat(e.seat).y - 10));
  drawPen(c, preps, hallSeat(e.seat).x, bottom - (n - 1) * 8, a, fade, 14, B.x1);
}

// ── мысль: пишется пером над капюшоном, медленно плывёт к залу — направо или налево — и выцветает у
// нижних рядов: городок — у первого ряда, дальше от центра — выше, девятое кольцо — у третьего
// (радиус — время). Выше третьего ряда не поднимается: там шёпоты зала, зритель и рамка
export const thoughtTop = r => Math.round(56 - Math.max(0, Math.min(9, r || 0)));     // строка верха мысли у её ряда
function drawThought(c, e, a) {
  const preps = penLines(c, e, e.text), total = penTotal(preps), need = total + THINK_HOLD + THINK_RISE;
  a *= speedOf(e, need);
  if (a >= need) return;
  const n = preps.length, B = BANDS.thought;
  const x0 = SEAT_D.x + 1, y0 = B.bottom - (n - 1) * 8;                            // над капюшоном
  const x1 = e.side ? 82 : 150, y1 = Math.max(B.top + 6, Math.min(y0, thoughtTop(e.ring)));
  const p = Math.max(0, Math.min(1, (a - total - THINK_HOLD) / THINK_RISE)), q = p * p * (3 - 2 * p);
  drawPen(c, preps, lerp(x0, x1, q), lerp(y0, y1, q), a, (1 - p) * 2 * gazeFade());
}

// ── хлопок в третьем ряду: беззвучно, с ладоней сходит облачко пыли (призрачной)
function drawClap(c, e, a) {
  const S = seatList().filter(s => s.k === 2);
  if (!S.length) return;
  const s = S[(stage.n * 5 + 2) % S.length], [jx, jy] = tremble(47);
  for (let j = 0; j < 5; j++) {
    c.globalAlpha = 0.34 * (1 - a / e.dur) * flicker(47) * gazeFade();
    R(c, s.x - 2 + j + jx + (j - 2) * a * 0.03, s.y - 9 - a * 0.07 - (j % 2) + jy, 1, 1, j % 2 ? AS : BO);
  }
  c.globalAlpha = 1;
}

// ── рамка над живым зрителем: 9:16, растр через строку, третья краска; в ней четыре тени-точки
// играют тот же спектакль за 4 с. Почти всё время стоит ровно, раз в 2–3 с сбоит (render/digital.js):
// нижнюю половину рвёт вбок, рамка прыгает без двойника, одна тень на кадр — чёрточка, рамка на
// кадр пропадает. Через 3 с у рамки, слева, — «автоповтор: вкл.» (решение помощника по вопросу 4:
// подпись Б; слева, а не под рамкой: под ней руки зрителя и светящееся). Через 8 с рамку рвёт по
// горизонтали — и её нет
export const RAMA_BOX = { x: 166, y: 3, w: 12, h: 21 };
export const CAPTION = 'автоповтор: вкл.';
const CAP_LINES = ['автоповтор:', 'вкл.'];
// где подпись: две строки по 6 точек, выровнены вправо к рамке (для проверки — коробка)
export const CAPTION_BOX = { x: RAMA_BOX.x - 3 - 11 * 6, y: RAMA_BOX.y + 3, w: 11 * 6, h: 15 };   // знаки 6 точек над строками 12 и 20
function drawRama(c, e, a) {
  const { x: rx, y: ry, w, h } = RAMA_BOX, mid = ry + Math.round(h / 2);
  const rip = a >= e.dur - 3;
  const st = rip ? { kind: 'tear', dx: 6 } : digitalState(1889, 4);
  if (st.kind !== 'drop') {
    const jx = st.kind === 'jump' ? st.dx : 0;
    const G = (x, y, ww, hh, col, al) => {                         // рвёт — нижняя половина уехала вбок
      const dx = jx + (st.kind === 'tear' && y >= mid ? st.dx : 0) - (rip && y < mid ? 5 : 0);
      c.globalAlpha = al; R(c, x + dx, y, ww, hh, col);
    };
    for (let y = ry + 1; y < ry + h - 1; y += 2) G(rx + 1, y, w - 2, 1, TI, 0.32);      // растр через строку
    G(rx, ry, w, 1, TI, 0.8); G(rx, ry + h - 1, w, 1, TI, 0.8); G(rx, ry, 1, h, TI, 0.8); G(rx + w - 1, ry, 1, h, TI, 0.8);
    // спектакль за 4 с: четыре точки на дне рамки, жест — в свой черёд (смех, огонь, сидит, тишина)
    const turn = Math.floor((a % 240) / 60), fy = ry + h - 3;
    for (let i = 0; i < 4; i++) {
      const x = rx + 2 + i * 2 + (i > 1 ? 1 : 0), mine = turn === i;
      if (st.kind === 'swap' && st.at === i) { G(x - 1, fy, 2, 1, NI, 0.9); continue; }   // тень на кадр — чёрточка
      const hop = i === 0 && mine && (a >> 3) & 1 ? 1 : 0, low = i === 2 && mine ? 1 : 0;
      G(x, fy - 1 + low, 1, 2 - low, NI, 0.9); G(x, fy - 2 - hop + low, 1, 1, NI, 0.9);
      if (i === 1 && mine) G(x, fy - 4 - ((a >> 2) & 1), 1, 1, NI, 0.9);                 // огонь — тенью
      if (i === 3 && mine) G(x + 1, fy - 2, 1, 1, NI, 0.9);                                // рука у рта
    }
    c.globalAlpha = 1;
  }
  if (a >= CAPTION_AT && !rip && c.fillText) {                      // подпись машины — цифровой дрожью
    c.globalAlpha = 0.85; c.fillStyle = TI;
    c.font = '6px "Press Start 2P","VT323",monospace'; c.textAlign = 'right';    // мельче 6 точек знаки ломаются
    CAP_LINES.forEach((l, i) => digitalText(c, l, rx - 3, ry + 9 + i * 8, 1890 + i, 6));
    c.textAlign = 'left'; c.globalAlpha = 1;
  }
}

// ── задник на канате: из-за правой кулисы по дальнему краю сцены за левую, за шесть секунд.
// Расписная сторона к нам. Изображение — рисунок места из городка, сведённый в три тона (ночь,
// пепел, кость: в памяти тепла нет, огонь выходит пеплом). Рама, рейки и канат стоят твёрдо;
// изображение твёрдо, если место вписано в опись, иначе призрачно — оттиск, двойник, дрожь.
// Вклеек мест (assets/places) в ветке нет — пока рисунок места (решение документа §2.4)
export const BOARD = { w: 22, h: 30, top: 52, rope: 48, x0: DW + 14, x1: -14 };
const BOX = {                                     // запечённый лист места: x0, y0, w, h от loc.x, loc.y (canon.js bake)
  campfire: [-16, -46, 80, 90], office: [-6, -16, 80, 64], lantern1: [-1, 0, 13, 46], gates: [-16, -2, 80, 61],
  library: [-4, 1, 112, 83], church: [-2, -28, 110, 122], train: [-10, -1, 136, 56], pizzeria: [0, 5, 146, 84],
  lake: [-10, -4, 123, 69], crater: [-1, 4, 53, 34], ruins: [0, 0, 110, 91],
};
const TONES = [[13, 11, 10], [138, 141, 143], [217, 207, 184]];
// три тона: где рисунка нет — ночь; тёмное тело места — пепел через точку с ночью, середина — пепел,
// светлое — кость. Так силуэт не тонет в ночи доски (тело построек в городке тёмное)
export function toneMap(px, w) {
  for (let i = 0; i < px.length; i += 4) {
    const L = 0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2], p = i >> 2, x = p % w, y = (p / w) | 0;
    const tone = px[i + 3] < 60 ? 0 : L < 45 ? ((x + y) & 1 ? 1 : 0) : L < 110 ? 1 : 2;
    px[i] = TONES[tone][0]; px[i + 1] = TONES[tone][1]; px[i + 2] = TONES[tone][2]; px[i + 3] = 255;
  }
  return px;
}
const art = new Map();
function boardArt(id) {
  if (art.has(id)) return art.get(id);
  let out = null;
  try {
    const box = BOX[id], fn = locSprites['draw_' + id];
    if (box && fn && typeof document !== 'undefined' && document.createElement) {
      const src = document.createElement('canvas');
      const g = src && src.getContext ? (src.width = box[2], src.height = box[3], src.getContext('2d')) : null;
      if (g) {
        const prev = X; setCtx(g);
        try { fn(-box[0], -box[1]); } finally { setCtx(prev); }
        // по непрозрачному: где рисунок, а где пусто вокруг
        const sp = g.getImageData(0, 0, box[2], box[3]).data;
        let x0 = box[2], y0 = box[3], x1 = -1, y1 = -1;
        for (let y = 0; y < box[3]; y++) for (let x = 0; x < box[2]; x++) if (sp[(y * box[2] + x) * 4 + 3] > 40) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
        if (x1 >= x0 && y1 >= y0) {
          const bw = x1 - x0 + 1, bh = y1 - y0 + 1, iw = BOARD.w - 2, ih = BOARD.h - 2, dst = document.createElement('canvas');
          dst.width = iw; dst.height = ih;
          const d = dst.getContext('2d');
          const sc = Math.min(iw / bw, (ih - 1) / bh), w = Math.max(1, bw * sc), h = Math.max(1, bh * sc);
          d.imageSmoothingEnabled = true;
          d.drawImage(src, x0, y0, bw, bh, Math.round((iw - w) / 2), Math.round(ih - h - 1), w, h);   // стоит на нижней рейке
          const im = d.getImageData(0, 0, iw, ih);
          toneMap(im.data, iw);
          d.putImageData(im, 0, 0);
          out = dst;
        }
      }
    }
  } catch (err) { out = null; }
  art.set(id, out);
  return out;
}
export const boardX = a => BOARD.x0 + (BOARD.x1 - BOARD.x0) * Math.max(0, Math.min(1, a / 360));
function clipX(c, f) {                            // за кулисами не видно: только между ними
  const can = c.save && c.clip && c.rect && c.beginPath;
  if (can) { c.save(); c.beginPath(); c.rect(12, 0, DW - 24, DH); c.clip(); }
  try { f(); } finally { if (can) c.restore(); }
}
function drawBoard(c, e, a, light) {
  const bx = Math.round(boardX(a)), L = bx - BOARD.w / 2, T = BOARD.top;
  clipX(c, () => {
    R(c, 12, BOARD.rope, DW - 24, 1, K3);                                     // канат через всю сцену
    R(c, L + 2, BOARD.rope, 1, T - BOARD.rope, K3); R(c, L + BOARD.w - 3, BOARD.rope, 1, T - BOARD.rope, K3);   // подвесы
    R(c, L, T, BOARD.w, BOARD.h, K1);                                         // доска
    const img = boardArt(e.id);
    if (img && c.drawImage) {
      if (e.solid) c.drawImage(img, L + 1, T + 1);
      else {                                                                  // не в описи — призрачно
        const sd = 31 + e.id.length, [gx, gy] = ghostShift(sd), [jx, jy] = tremble(sd);
        c.globalAlpha = GHOST_A * 0.8 * gazeFade(); c.drawImage(img, L + 1 + gx, T + 1 + gy);
        c.globalAlpha = 0.8 * flicker(sd) * gazeFade(); c.drawImage(img, L + 1 + jx, T + 1 + jy);
        c.globalAlpha = 1;
      }
    }
    R(c, L, T, BOARD.w, 1, K3); R(c, L, T + BOARD.h - 1, BOARD.w, 1, K3);       // рейки — твёрдо
    R(c, L, T, 1, BOARD.h, K3); R(c, L + BOARD.w - 1, T, 1, BOARD.h, K3);
  });
  // проходя мимо поднятого фонаря — на миг закрывает его, по плитам идёт тень рамы
  const near = 1 - Math.abs(bx - LANTERN.x) / 30;
  if (near > 0 && light > 0.05) {
    c.globalAlpha = 0.35 * light * near;
    R(c, Math.round(bx - BOARD.w / 2 - (LANTERN.x - bx) * 0.5 - 6), BOARD.top + BOARD.h + 2, BOARD.w, 6, NI);
    c.globalAlpha = 1;
  }
}
// задник, что сейчас едет (для света: закрывает фонарь)
export function boardNow() { const e = evNow('board')[0]; return e ? boardX(ageOf(e)) : null; }

// весь мир сцены; drawHero — нарисовать странника (сидит на трещине); day — в мире день
// весь мир сцены — под взглядом сидящего: повернулся к залу — призрачное до трети, двойники встают
// рядом, рамка не сбоит (render/ghost.js setGaze, render/digital.js setStill); твёрдое не меняется
export function drawStageWorld(c, drawHero, heroY, day = false) {
  setGaze(stage.gaze || 0); setStill((stage.gaze || 0) > 0.5);
  try { drawStage(c, drawHero, heroY, day); } finally { setGaze(0); setStill(false); }
}
function drawStage(c, drawHero, heroY, day) {
  const key = day ? 'day' : 'night';
  if (!(key in sheets)) sheets[key] = bakeBody(day);
  const sheet = sheets[key];
  if (sheet) c.drawImage(sheet, 0, 0);
  else R(c, 0, 0, DW, DH, day ? K2 : NI);
  const sv = stageView(redNoon.k) || { light: 0, lift: 0, quad2: false };
  const shows = redNoon.k <= 0.5 && !!stage.ev;                      // в полдень мир молчит
  if (sv.light > 0.01) dustHall(c, sv.light, day);
  if (shows) for (const e of evNow('clap')) drawClap(c, e, ageOf(e));
  const rama = shows ? evNow('rama')[0] : null;
  spectator(c, !!rama);
  if (rama) drawRama(c, rama, ageOf(rama));
  // тени и странник — по глубине (ступни)
  const qs = [0, 1, 2, 3].map(i => quadAt(i, t, sv.quad2));
  const drawn = qs.map(q => ({ y: q.y, f: () => shadow(c, q, sv.quad2) }));
  drawn.push({ y: heroY, f: drawHero });
  drawn.push({ y: LANTERN.y, f: () => lanternMan(c, sv.lift) });
  if (shows) for (const e of evNow('board')) drawn.push({ y: BOARD.top + BOARD.h, f: () => drawBoard(c, e, ageOf(e), sv.light) });
  drawn.sort((a, b) => a.y - b.y);
  for (const d of drawn) d.f();
  if (shows && c.fillText) {                                         // перо — поверх: шёпоты зала, мысли
    for (const e of evNow('hall')) drawHall(c, e, ageOf(e));
    for (const e of evNow('thought')) drawThought(c, e, ageOf(e));
    c.globalAlpha = 1;
  }
}

// куда смотрит сидящий, когда курсора нет (телефон): на последнее, что появилось — рамку, шёпот
// зала, мысль, задник (§2.6); null — ничего не идёт
export function lastAppeared() {
  if (!stage.ev || redNoon.k > 0.5) return null;
  let best = null;
  for (const e of stage.ev) {
    const a = ageOf(e);
    if (a === null || (best && e.at < best.at)) continue;
    if (e.kind === 'rama') best = { at: e.at, x: RAMA_BOX.x + RAMA_BOX.w / 2, y: RAMA_BOX.y + RAMA_BOX.h / 2 };
    else if (e.kind === 'hall') { const s = hallSeat(e.seat); best = { at: e.at, x: s.x, y: s.y - 12 }; }
    else if (e.kind === 'thought') best = { at: e.at, x: e.side ? 82 : 150, y: 52 };
    else if (e.kind === 'board') best = { at: e.at, x: boardX(a), y: BOARD.top + BOARD.h / 2 };
  }
  return best ? { x: best.x, y: best.y } : null;
}

// свет сцены: фонарь (растёт с подъёмом) и огонёк у сердца сидящего
export const STAGE_AMBIENT = { night: 0.14, day: 0.26 };
export function stageLights(px, py) {
  const sv = stageView(redNoon.k) || { light: 0, lift: 0 };
  const lx = LANTERN.x - 4, ly = LANTERN.y - 5 - sv.lift * 11;
  const bx = redNoon.k <= 0.5 && stage.ev ? boardNow() : null;
  const hid = bx !== null && Math.abs(bx - lx) < BOARD.w / 2 ? 0.4 : 1;   // задник на миг закрыл фонарь
  const out = [
    { x: px, y: py, r: 40, color: [226, 138, 58], flicker: 0.1, candle: true, intensity: 1 },
    { x: lx, y: ly, r: (34 + 190 * sv.light) * (hid < 1 ? 0.7 : 1), color: [226, 150, 80], flicker: 0.08, candle: true, intensity: (0.7 + 0.9 * sv.light) * hid },
    { x: CENTER.x, y: CENTER.y - 30, r: 150, color: [200, 192, 176], flicker: 0, intensity: 0.25 + 0.8 * sv.light },
  ];
  // рамка светит третьей краской: свечение, не тепло — третьего тёплого пятна нет
  if (redNoon.k <= 0.5 && stage.ev && evNow('rama').length) out.push({ x: RAMA_BOX.x + RAMA_BOX.w / 2, y: RAMA_BOX.y + RAMA_BOX.h / 2 + 4, r: 30, color: [140, 198, 63], flicker: 0.05, intensity: 0.9 });
  return out;
}
export function _resetStageArt() { for (const k in sheets) delete sheets[k]; seats = null; art.clear(); }
