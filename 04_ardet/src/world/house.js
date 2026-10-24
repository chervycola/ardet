// ═══════════════════════════════════════
// ДОМ ПРОБУЖДЕНИЯ — пустой тёмный дом в центре старого города: квартал городка,
// угол, где главная улица встречает улицу у церкви (world/town.js). Канон:
// «Отсюда всегда можно начать, и здесь всегда просыпаются» (DRAMATURGY, 0 ·
// ГОРОДОК); «пробуждение дома: журнал пуст, ботинки стоптаны сильнее, чем
// помнишь» (WORLD_WEAVE, философия v3.1); «вторая кровать в комнате пробуждения
// застелена и холодна — не объясняется никогда» (ART_BIBLE, подмигивания).
//  · Каждый вход в мир — пробуждение здесь: сидишь на краю своей кровати, мир
//    всплывает в фокус; шагнул — встал. Упал за краем — проснёшься здесь же.
//  · Две комнаты: комната с двумя кроватями, окном, табуретом и холодной печью;
//    сени с дверью на улицу. Темно: светит огонёк у сердца, окно (ночью — луна)
//    и щель двери. Снаружи — единственный целый дом квартала, окна тёмные.
//  · Ботинки у порога — только после пробуждения: вышел — значит, обулся.
// Дом — свой слой, как изнанка: своя карта (точки дома 0..HW × 0..HH), свой ход,
// свои вещи с меню. Рисует render/house.js.
// ═══════════════════════════════════════
import { STREETS } from './town.js';

export const HW = 232, HH = 122;                       // дом целиком
export const WH = 26;                                  // стена видна лицом на столько
export const ROOM = { x0: 6, x1: 150, y0: 32, y1: 112 };          // пол комнаты
export const PART = { x0: 150, x1: 158, g0: 70, g1: 108 };        // перегородка; проём по полу g0..g1
export const SENI = { x0: 158, x1: 226, y0: 52, y1: 112 };        // пол сеней
export const FRONT = { y0: 112, y1: 118 };                         // передняя стена — сверху полосой
export const DOOR = { x0: 182, x1: 200 };                          // дверь на улицу — в передней стене сеней
// мебель — основание по полу; сквозь не пройти
export const BED = { x0: 44, x1: 66, y0: 32, y1: 62 };          // своя — левее окна; печь в углу её не заслоняет
export const BED2 = { x0: 120, x1: 142, y0: 32, y1: 62 };
export const STOOL = { x0: 76, x1: 86, y0: 40, y1: 48 };
export const STOVE = { x0: 8, x1: 32, y0: 84, y1: 110 };
export const WINDOW = { x0: 70, x1: 92, y0: 9, y1: 25 };          // в стене комнаты
export const BOOTS = { x: 206, gy: 107 };
const BLOCKS = [BED, BED2, STOOL, STOVE];

// где просыпаешься: на краю своей кровати (ноги — перед ней)
export const WAKE = { x: 55, y: 67 };
// где встаёшь, войдя с улицы: на пороге
export const ENTRY = { x: 191, y: 106 };

export const house = {
  active: false,
  seated: false,       // сидит на краю кровати, пока не шагнул
  boots: false,        // ботинки у порога: только после пробуждения
  wakes: 0,            // сколько раз просыпался здесь (за этот заход)
  // проснулся: свет, сидя на кровати; ботинки у порога
  wake() { this.active = true; this.seated = true; this.boots = true; this.wakes++; },
  enter() { this.active = true; this.seated = false; },
  leave() { this.active = false; this.seated = false; this.boots = false; },   // вышел — обулся
};

// ноги (x, y) — можно ли тут стоять
export function walkable(x, y) {
  const inR = R => x >= R.x0 + 4 && x <= R.x1 - 4 && y >= R.y0 + 3 && y <= R.y1 - 2;
  const gap = x > PART.x0 - 6 && x < PART.x1 + 6 && y >= PART.g0 + 4 && y <= PART.g1 - 2;
  if (!(inR(ROOM) || inR(SENI) || gap)) return false;
  for (const b of BLOCKS) if (x > b.x0 - 3 && x < b.x1 + 3 && y > b.y0 && y < b.y1 + 2) return false;
  return true;
}
export function houseMove(p, dx, dy) {
  const fx = p.x + 6, fy = p.y + 23;
  if (walkable(fx + dx, fy + dy)) { p.x += dx; p.y += dy; return true; }
  if (Math.abs(dx) > 0.01 && walkable(fx + dx, fy)) { p.x += dx; return true; }
  if (Math.abs(dy) > 0.01 && walkable(fx, fy + dy)) { p.y += dy; return true; }
  return false;
}
const inSeni = x => x >= PART.x1;
// ближайшая точка пола к (x, y) — туда и идти, если ткнули в стену или в мебель
export function nearestFloor(x, y) {
  if (walkable(x, y)) return { x, y };
  let best = null, bd = 1e9;
  for (let yy = 0; yy <= HH; yy += 2) for (let xx = 0; xx <= HW; xx += 2) {
    if (!walkable(xx, yy)) continue;
    const d = (xx - x) ** 2 + (yy - y) ** 2;
    if (d < bd) { bd = d; best = { x: xx, y: yy }; }
  }
  return best;
}
// путь от ног до точки: из комнаты в сени — через проём
export function houseRoute(fx, fy, tx, ty) {
  const to = nearestFloor(tx, ty);
  if (!to) return [];
  if (inSeni(fx) === inSeni(to.x)) return [to];
  return [{ x: PART.x0 - 8, y: (PART.g0 + PART.g1) / 2 + 2 }, { x: PART.x1 + 8, y: (PART.g0 + PART.g1) / 2 + 2 }, to];
}

// ── вещи: осмотр, у иных — действие ──
const WINDOW_NIGHT = 'Окно. За стеклом — пустая улица и мёртвый фонарь; луна стоит низко, свет от неё лежит на полу квадратом.';
const WINDOW_DAY = 'Окно. За стеклом — пустая улица квартала, вдоль неё фундаменты. Стекло пыльное, свет сквозь него серый.';
export const THINGS = [
  { id: 'h_bed', name: 'Кровать', x: BED.x0, y: BED.y0 - 6, w: BED.x1 - BED.x0, h: BED.y1 - BED.y0 + 6, at: [WAKE.x, WAKE.y],
    look: 'Своя кровать. Простыня сбита, подушка ещё помнит голову.' },
  { id: 'h_bed2', name: 'Вторая кровать', x: BED2.x0, y: BED2.y0 - 6, w: BED2.x1 - BED2.x0, h: BED2.y1 - BED2.y0 + 6, at: [131, 67],
    look: 'Вторая кровать. Застелена и холодна.' },                     // канон: не объясняется никогда
  { id: 'h_journal', name: 'Журнал', x: STOOL.x0 - 2, y: STOOL.y0 - 10, w: 14, h: 18, at: [81, 55],
    look: 'Журнал на табурете. Пуст.' },                                // канон: журнал пуст
  { id: 'h_window', name: 'Окно', x: WINDOW.x0, y: WINDOW.y0, w: WINDOW.x1 - WINDOW.x0, h: WINDOW.y1 - WINDOW.y0, at: [81, 55],
    look: WINDOW_NIGHT },
  { id: 'h_stove', name: 'Печь', x: STOVE.x0, y: STOVE.y0 - 30, w: STOVE.x1 - STOVE.x0, h: STOVE.y1 - STOVE.y0 + 30, at: [40, 100],
    look: 'Печь. Холодная; зола в ней старая, слежалась.' },
  { id: 'h_boots', name: 'Ботинки', x: BOOTS.x - 7, y: BOOTS.gy - 8, w: 14, h: 10, at: [196, 102],
    look: 'Ботинки у порога. Стоптаны сильнее, чем помнишь.', shown: () => house.boots },   // канон
  { id: 'h_door', name: 'Дверь', x: DOOR.x0, y: FRONT.y0 - 8, w: DOOR.x1 - DOOR.x0, h: 14, at: [ENTRY.x, ENTRY.y],
    look: 'Дверь на улицу. Не заперта.', useAction: 'house_exit', useLabel: '<i>⌂</i>ВЫЙТИ' },
];
for (const th of THINGS) th.house = true;
// вещи сейчас (ботинки — пока не обулся); окно — по времени суток
export function houseThings(night = true) {
  const w = THINGS.find(th => th.id === 'h_window');
  w.look = night ? WINDOW_NIGHT : WINDOW_DAY;
  return THINGS.filter(th => !th.shown || th.shown());
}

// ── свет: огонёк у сердца; окно — луной или серым днём; щель двери ──
export const AMBIENT = { night: 0.15, day: 0.24 };
export function houseLights(px, py, sky) {
  const night = !sky || !sky.sun, moon = sky ? sky.moon || 0 : 0;
  // огонёк у сердца и рассеянный от него свет на стенах (как в изнанке): без него комнату не видно
  const L = [{ x: px, y: py, r: 46, color: [226, 138, 58], flicker: 0.1, candle: true, intensity: 1.1 },
    { x: px, y: py, r: 120, color: [232, 220, 198], flicker: 0, intensity: 1.7 }];
  if (night) L.push({ x: (WINDOW.x0 + WINDOW.x1) / 2, y: 46, r: 44, color: [150, 160, 172], flicker: 0, intensity: 0.35 + 0.5 * moon });
  else L.push({ x: (WINDOW.x0 + WINDOW.x1) / 2, y: 46, r: 58, color: [176, 172, 164], flicker: 0, intensity: 0.8 });
  L.push({ x: (DOOR.x0 + DOOR.x1) / 2, y: FRONT.y0, r: 18, color: night ? [140, 150, 160] : [176, 172, 164], flicker: 0, intensity: night ? 0.2 : 0.5 });
  return L;
}

// ═══ ДОМ СНАРУЖИ ═══
// единственный целый дом квартала: на северо-восточном углу перекрёстка главной
// улицы и улицы у церкви, фасадом на главную. Камень светлее земли квартала,
// крыша скатом к улице, печная труба холодная, окна тёмные. Свет слева, кромка
// пеплом справа.
const NI = '#0D0B0A', AS = '#8A8D8F', K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K4 = '#3a3328';
const BR2 = '#3a2818', L1 = '#c8b89a', L2 = '#b0a284', S1 = '#4a463f', S2 = '#33302e';
const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
function hq(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
export const HOUSE_W = 40, HOUSE_H = 38;
function drawHouse(ctx, loc) {
  const x = loc.x, gy = loc.y + loc.h, W = HOUSE_W;
  ctx.globalAlpha = 0.45; R(ctx, x + 2, gy, W + 2, 2, K0); R(ctx, x + W, gy - 3, 3, 3, K0); ctx.globalAlpha = 1;   // тень — вправо
  // стены: кладка рядами, свет слева, кромка пеплом справа; цоколь темнее
  const wy = gy - 22;
  for (let y = wy; y < gy; y++) {
    const row = y - wy, off = (row >> 2) & 1 ? 3 : 0;
    for (let xx = x + 2; xx < x + W - 2; xx++) {
      const k = xx - x - 2, seam = (row & 3) === 3 || ((k + off) % 7 === 0);
      R(ctx, xx, y, 1, 1, row > 18 ? (seam ? K2 : S2) : seam ? S1 : k < 3 ? L1 : hq(k, row, 3) < 0.12 ? S1 : L2);
    }
  }
  R(ctx, x + W - 3, wy, 1, 22, AS);                                     // кромка пеплом
  // крыша: скат к улице, свес над стеной; конёк сверху; черепица рядами
  const ry = wy - 14;
  for (let j = 0; j < 14; j++) {
    const inset = Math.round((13 - j) * 0.35);
    for (let xx = x + inset; xx < x + W - inset; xx++) R(ctx, xx, ry + j, 1, 1, j === 13 ? K0 : (j & 1) && ((xx - x) % 4 === 0) ? K0 : j < 2 ? K4 : K1);
    R(ctx, x + inset, ry + j, 1, 1, K4);                                // к свету
  }
  R(ctx, x + 5, ry - 1, W - 10, 1, K4);                                 // конёк
  // печная труба — холодная, без дыма
  R(ctx, x + 27, ry - 7, 5, 9, S2); R(ctx, x + 27, ry - 7, 1, 9, L2); R(ctx, x + 26, ry - 8, 7, 1, K2);
  // окна тёмные: рама пеплом, стекло — ночь; в левом — отсвет
  for (const wx of [x + 6, x + 27]) {
    R(ctx, wx - 1, wy + 4, 9, 9, AS); R(ctx, wx, wy + 5, 7, 7, NI); R(ctx, wx + 3, wy + 5, 1, 7, K2); R(ctx, wx, wy + 8, 7, 1, K2);
    R(ctx, wx - 1, wy + 13, 9, 1, L1);                                  // подоконник
  }
  R(ctx, x + 7, wy + 6, 1, 1, S1);
  // дверь посередине: доски, ручка-кольцо; порог
  const dx = x + 16;
  R(ctx, dx - 1, gy - 15, 10, 15, K2); R(ctx, dx, gy - 14, 8, 14, BR2);
  for (const k of [2, 5]) R(ctx, dx + k, gy - 14, 1, 14, K1);
  R(ctx, dx + 6, gy - 7, 1, 1, AS); R(ctx, dx, gy - 14, 1, 14, K4);
  R(ctx, dx - 2, gy - 1, 12, 1, L2);                                    // порог
  // щебень у подошвы
  for (let k = 0; k < 9; k++) R(ctx, x + Math.floor(hq(k, 1, 5) * W), gy - 1 + (k & 1), 1, 1, k % 3 ? S1 : AS);
}
const OUT_LOOK = 'Единственный целый дом на старых улицах: стены, крыша, дверь. Окна тёмные, внутри никого. Здесь просыпаются.';
let home = null;
// на северо-восточном углу перекрёстка главной улицы квартала и улицы у церкви
export function buildHouse(locations) {
  const main = STREETS.find(s => s[0] === 'road:q-main')[1], church = STREETS.find(s => s[0] === 'road:q-church')[1];
  const cx = church.reduce((s, p) => s + p[0], 0) / church.length;   // улица у церкви — почти отвес
  let cy = main[0][1];                                                  // главная — на этом x
  for (let i = 1; i < main.length; i++) {
    const [ax, ay] = main[i - 1], [bx, by] = main[i];
    if (cx >= ax && cx <= bx) { cy = ay + (by - ay) * (cx - ax) / (bx - ax); break; }
  }
  const x = Math.round(cx + 5 + 10), gy = Math.round(cy - 5 - 5);       // за бордюром и тротуаром
  home = { id: 'wake_house', name: 'Дом', zone: 'quarter', x, y: gy - HOUSE_H, w: HOUSE_W, h: HOUSE_H, solid: true,
    look: OUT_LOOK, drawSelf: drawHouse, useAction: 'house_enter', useLabel: '<i>⌂</i>ВОЙТИ' };
  locations.push(home);
  return home;
}
export const wakeHouse = () => home;
// снаружи у двери — куда выходишь (верх рисунка героя)
export const doorOutside = () => ({ x: home.x + home.w / 2 - 6, y: home.y + home.h + 5 });
