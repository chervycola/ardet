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
import { DW, DH, PLATE, LANTERN, CENTER, quadAt, stageView } from '../world/stage.js';
import { tremble, ghostShift, flicker, GHOST_A } from './ghost.js';
import { redNoon } from '../world/redNoon.js';

const NI = '#0D0B0A', BO = '#D9CFB8', AS = '#8A8D8F', SV = '#E28A3A';
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
      c.globalAlpha = a * (day ? 0.24 : 0.34) * am;
      R(c, s.x - 2 + ox, s.y - 4 + oy, 5, 3, AS);                     // плечи пеплом
      R(c, s.x - 1 + to + ox, s.y - 7 + oy, 3, 3, AS);                // голова — к сцене
      R(c, s.x - 1 + to + ox, s.y - 7 + oy, 3, 1, BO);                // костяная кромка
    }
  }
  c.globalAlpha = 1;
}

// ── живой зритель: на четвёртом ярусе у прохода; моргает; иногда светящееся у глаз
function spectator(c) {
  const x = Math.round(tierX(SPEC.k, SPEC.th)), y = Math.round(tierY(SPEC.k, SPEC.th));
  R(c, x - 2, y - 4, 5, 3, NI); R(c, x - 1, y - 7, 3, 3, NI);
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

// весь мир сцены; drawHero — нарисовать странника (сидит на трещине); day — в мире день
export function drawStageWorld(c, drawHero, heroY, day = false) {
  const key = day ? 'day' : 'night';
  if (!(key in sheets)) sheets[key] = bakeBody(day);
  const sheet = sheets[key];
  if (sheet) c.drawImage(sheet, 0, 0);
  else R(c, 0, 0, DW, DH, day ? K2 : NI);
  const sv = stageView(redNoon.k) || { light: 0, lift: 0, quad2: false };
  if (sv.light > 0.01) dustHall(c, sv.light, day);
  spectator(c);
  // тени и странник — по глубине (ступни)
  const qs = [0, 1, 2, 3].map(i => quadAt(i, t, sv.quad2));
  const drawn = qs.map(q => ({ y: q.y, f: () => shadow(c, q, sv.quad2) }));
  drawn.push({ y: heroY, f: drawHero });
  drawn.push({ y: LANTERN.y, f: () => lanternMan(c, sv.lift) });
  drawn.sort((a, b) => a.y - b.y);
  for (const d of drawn) d.f();
}

// свет сцены: фонарь (растёт с подъёмом) и огонёк у сердца сидящего
export const STAGE_AMBIENT = { night: 0.14, day: 0.26 };
export function stageLights(px, py) {
  const sv = stageView(redNoon.k) || { light: 0, lift: 0 };
  const lx = LANTERN.x - 4, ly = LANTERN.y - 5 - sv.lift * 11;
  return [
    { x: px, y: py, r: 40, color: [226, 138, 58], flicker: 0.1, candle: true, intensity: 1 },
    { x: lx, y: ly, r: 34 + 190 * sv.light, color: [226, 150, 80], flicker: 0.08, candle: true, intensity: 0.7 + 0.9 * sv.light },
    { x: CENTER.x, y: CENTER.y - 30, r: 150, color: [200, 192, 176], flicker: 0, intensity: 0.25 + 0.8 * sv.light },
  ];
}
export function _resetStageArt() { for (const k in sheets) delete sheets[k]; seats = null; }
