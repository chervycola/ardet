// ═══ АРХИТЕКТУРА · неон (1960–90-е) ═══
// Свет стал товаром: вывески вместо звёзд, реклама поверх лозунгов, тепло продаётся. Трубки
// вывесок у канона в узде — мёртвые пеплом, живая одна, киноварью. Всё — набором (kit.js): тело
// неподвижно и запекается; огни, пар, кольца дыма, гондолы, факел, самолёт — слоем поверх.
//   юг     — отель-пластина в гребёнке балконов, вывеска теряет буквы, угол в оспинах (#2 — отель
//            ниже, охрой, во всю стену плакат STOP SOLIDERE штрихами); пляж «аренда солнца»;
//            кофейня Махфуза: машрабия, мёртвая вязь, столик с биркой (#2 — без бирки, за стеклом
//            старик пишет медленно)
//   восток — город-соты: три блока разного материала, клетки, вывески на кронштейнах, самолёт
//            садится над антеннами (#2 — снесли всё, кроме ямэня; парк с прудом); капсульная башня
//   запад  — колесо за воротами, гондолы ходят на ветру, звезда без огня; щит с ковбоями (#2 —
//            курящий щит: кольца дыма над улицей)
//   север  — платформа с факелом во льдах (#2 — жилая «на пяти ногах» с креном, пятая отломилась);
//            мебельный ангар: гофра, пояс выцвел до кости, стул под лампой, шестигранник; домик
//            Хёвди с двумя флагштоками (#2 — за домом в гавани теплоход делегации)
//   равнина — Останкинская башня: ноги-арки, ствол, ресторан с вращающимся полом, антенна в
//            полосах, огни киноварью; девятиэтажка — швы промазаны дважды, одна кухня на шестом
//            (#2 — та же, швы не промазаны, в них трава, ни одного огня); кочегарка «Камчатка»
// Фасады табличек: бейрутский дом с водонагревателем, лавка Коулуна, ломбард с шарами, барак.
// Утварь дворов: столик кафе, гирлянда, мотороллер · автомат, бельё, ятай · попкорн, автодром,
// остов с плавниками · тележка коробок, демонстрационная доска, универсал · «ракушка», лавочка,
// ракета-горка.

import { hang, angleOf, tipOf } from '../../world/hang.js';
import { plan, paint, MAT, FORM, tone, split } from './kit.js';
const N = '#0D0B0A', BONE = '#D9CFB8', ASH = '#8A8D8F', MIST = '#3D4A3A',
  CANDLE = '#E28A3A', CIN = '#C23B2B', SEP = '#3A3026',
  DARK = '#15100c', WOOD = '#241c14', WOOD2 = '#3a2418', STONE = '#3a3328',
  STONE2 = '#2a2620', BRICK = '#3a1c14', CONC = '#34302a',
  PAPER = '#c8b89a', PAPER2 = '#b0a284';

function R(c, col, x, y, w, h) { c.fillStyle = col; c.fillRect(x, y, w, h); }
const B = BONE, A = ASH, K = CIN, C = CANDLE, S = SEP;

// попиксельная прямая: Брезенхем (спицы колеса)
function line(c, col, x0, y0, x1, y1) {
  c.fillStyle = col;
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    c.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

// окружность средней точкой: чётко, без сглаживания (обод колеса)
function ring(c, col, cx, cy, r) {
  c.fillStyle = col;
  let x = r, y = 0, err = 1 - r;
  while (x >= y) {
    c.fillRect(cx + x, cy + y, 1, 1); c.fillRect(cx + y, cy + x, 1, 1);
    c.fillRect(cx - y, cy + x, 1, 1); c.fillRect(cx - x, cy + y, 1, 1);
    c.fillRect(cx - x, cy - y, 1, 1); c.fillRect(cx - y, cy - x, 1, 1);
    c.fillRect(cx + y, cy - x, 1, 1); c.fillRect(cx + x, cy - y, 1, 1);
    y++;
    if (err < 0) err += 2 * y + 1; else { x--; err += 2 * (y - x) + 1; }
  }
}

// ═══ НАБОР (kit.js): тело — картой материалов, живое — слоем поверх ═══
function noise(i, j, s) {
  let h = (i * 374761393 + j * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function hline(c, col, x0, y0, x1, y1) {
  c.fillStyle = col;
  const n = Math.abs(y1 - y0) + 1, sy = Math.sign(y1 - y0);
  for (let i = 0; i < n; i++) {
    const xa = Math.round(x0 + (x1 - x0) * i / n), xb = Math.round(x0 + (x1 - x0) * (i + 1) / n);
    c.fillRect(Math.min(xa, xb), y0 + sy * i, Math.max(1, Math.abs(xb - xa)), 1);
  }
}
function mix9(a, b, k) {
  const p = v => [1, 3, 5].map(i => parseInt(v.slice(i, i + 2), 16)), X = p(a), Y = p(b);
  return '#' + X.map((v, i) => Math.round(v + (Y[i] - v) * k).toString(16).padStart(2, '0')).join('');
}
const LEAF = mix9(BONE, SEP, 0.08);
function lazyPlan(w, h, build) { let P = null; return () => P || (P = (() => { const Q = plan(w, h); build(Q); return Q; })()); }
// вид набором: план строится раз, рисуется в рамку w×h (x — середина, gy — земля); over — поверх
function kit(w, h, build, opt, over) {
  const get = lazyPlan(w, h, build);
  const d = (c, x, gy) => {
    const P = get(), X0 = Math.round(x) - (w >> 1), Y0 = Math.round(gy) - h;
    paint(c, X0, Y0, P, opt);
    if (over) over(c, X0, Y0, P);
  };
  d.static = true; d.plan = get;
  return d;
}
// фасад таблички набором: 18×30, px(цвет, dx, dy, w, h) — поверх
function signKit(build, opt, over) {
  const get = lazyPlan(18, 30, build);
  const d = (c, X, G) => {
    const X0 = Math.round(X) - 9, Y0 = Math.round(G) - 30;
    paint(c, X0, Y0, get(), opt);
    if (over) over((col, dx, dy, w = 1, h = 1) => R(c, col, X0 + dx, Y0 + dy, w, h));
  };
  d.static = true;
  return d;
}
const pxOf = (c, X0, Y0) => (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
// полуциркульный проём одной частью: x — левый край, yb — строка под ним
function rarch(P, x, yb, w, h, mat = MAT.DARK) {
  const r = w / 2, pts = [[x, yb], [x, yb - h + r]];
  for (let k = 1; k < 8; k++) { const a = Math.PI * k / 8; pts.push([x + r - r * Math.cos(a), yb - h + r - r * Math.sin(a)]); }
  pts.push([x + w, yb - h + r], [x + w, yb]);
  return P.poly(pts, mat);
}
// стрельчатый проём одной частью
function parch(P, x, yb, w, h, mat = MAT.DARK) {
  const k = Math.min(h - 1, w * 0.9);
  return P.poly([[x, yb], [x, yb - h + k], [x + w * 0.12, yb - h + k * 0.45], [x + w / 2, yb - h], [x + w * 0.88, yb - h + k * 0.45], [x + w, yb - h + k], [x + w, yb]], mat);
}
// оспины: щербины от пуль и осколков — тёмная выбоина, светлый край скола
function pocks(px, x0, y0, w, h, n, seed, at) {
  for (let i = 0; i < n; i++) {
    const x = x0 + Math.floor(noise(i, 1, seed) * w), y = y0 + Math.floor(noise(i, 2, seed) * h);
    if (at && !at(x, y)) continue;
    px(N, x, y, noise(i, 3, seed) < 0.3 ? 2 : 1, 1); px(tone(MAT.CONCRETE, 5), x, y - 1, 1, 1);
  }
}
// пальма: ствол дугой, крона веером, листья свисают; x, g — основание ствола
function palm(c, x, g, h = 42) {
  hline(c, tone(MAT.TIMBER, 2), x, g - 1, x + 5, g - h);
  hline(c, tone(MAT.TIMBER, 4), x - 1, g - 1, x + 4, g - h);
  const px = x + 6, py = g - h - 1, F = tone(MAT.MOSS, 1), F2 = tone(MAT.MOSS, 3);
  R(c, F, px - 2, py - 1, 5, 2); R(c, F, px - 1, py - 5, 3, 4);
  R(c, F, px - 8, py - 3, 6, 2); R(c, F, px - 10, py - 1, 2, 1); R(c, F, px - 11, py, 1, 3);
  R(c, F, px + 3, py - 3, 6, 2); R(c, F, px + 9, py - 1, 1, 1); R(c, F, px + 10, py, 1, 3);
  R(c, F, px - 6, py + 1, 4, 1); R(c, F, px - 7, py + 2, 1, 3);
  R(c, F, px + 3, py + 1, 4, 1); R(c, F, px + 7, py + 2, 1, 3);
  R(c, F2, px - 8, py - 3, 5, 1); R(c, F2, px + 4, py - 3, 3, 1); R(c, F2, px - 1, py - 5, 1, 3);
}

// ── ЮГ (набором) ─────────────────────────────────────────────────────
// буквы 3×5 для вывесок и плакатов, что осмотр велит прочесть: '1' — штрих
const GLYPH = {
  H: ['1.1', '1.1', '111', '1.1', '1.1'], L: ['1..', '1..', '1..', '1..', '111'], I: ['111', '.1.', '.1.', '.1.', '111'],
  D: ['11.', '1.1', '1.1', '1.1', '11.'], Y: ['1.1', '1.1', '.1.', '.1.', '.1.'], S: ['111', '1..', '111', '..1', '111'],
  T: ['111', '.1.', '.1.', '.1.', '.1.'], O: ['111', '1.1', '1.1', '1.1', '111'], P: ['111', '1.1', '111', '1..', '1..'],
  E: ['111', '1..', '11.', '1..', '111'], R: ['11.', '1.1', '11.', '1.1', '1.1'],
};
function glyph(px, col, x, y, ch, dx = () => 0) {
  (GLYPH[ch] || []).forEach((row, j) => { for (let i = 0; i < 3; i++) if (row[i] === '1') px(col, x + i + dx(j), y + j); });
}
function words(px, col, x, y, text) { for (const ch of text) { if (ch !== ' ') glyph(px, col, x, y, ch); x += ch === ' ' ? 3 : 4; } }

// отель-пластина (набором): бейрутский отель у моря начала 70-х — высокая тонкая плита на столбах:
// балконы выносными плитами за левую грань и в середине — силуэт гребёнкой, между ними лоджии в
// рёбрах брис-солей; справа узкое ядро лестницы. Ярус выгорел: кромка плиты обрушена в темноту,
// торец отломан. Оспины на углу не заштукатурены. На крыше решётка вывески: из HOLIDAY висят
// пять плашек — читается «H LID Y»; D сползла на одном болте — следующая. В одном окне натрий.
// Пальма. Допущение: вывески на крыше в источниках нет — плашки капителью знак мира, не документ.
const HOT_F = Array.from({ length: 12 }, (_, f) => 16 + f * 5);
const HOT_PLATES = [[31, 'H'], [37, ''], [43, 'L'], [49, 'I'], [55, 'D'], [61, ''], [67, 'Y']];
const hotel = kit(96, 96, P => {
  P.box(30, 16, 46, 62, MAT.CONCRETE);
  for (const y of HOT_F) {
    P.cut(31, y + 1, 44, 3);
    for (let x = 35; x < 75; x += 6) P.box(x, y + 1, 1, 3, MAT.CONCRETE);
    P.box(28, y, 48, 1, MAT.CONCRETE).shade(-1);                       // плита балкона
  }
  P.cut(44, HOT_F[6], 14, 1); P.clear(28, HOT_F[6], 2, 1);             // ярус выгорел: кромка, торец
  P.box(76, 12, 4, 84, MAT.CONCRETE).shade(1);                        // ядро лестницы — узкое, сбоку
  P.box(30, 78, 46, 18, MAT.DARK);                                     // вестибюль под плитой
  for (const x of [31, 45, 59, 73]) P.box(x, 78, 2, 18, MAT.CONCRETE);
  P.cut(37, 80, 7, 16, MAT.GLASS);
}, { seed: 211, chip: 0.02, cracks: 2, drips: [[34, 74, 4], [61, 46, 6]] }, (c, X0, Y0, P) => {
  const px = pxOf(c, X0, Y0), ST = tone(MAT.STEEL, 3), PL = tone(MAT.STEEL, 5);
  pocks(px, 28, 22, 12, 52, 44, 7, (x, y) => P.at(x, y) === MAT.CONCRETE);          // угол в оспинах
  pocks(px, 76, 40, 4, 40, 10, 9, (x, y) => P.at(x, y) === MAT.CONCRETE);
  px(C, 62, HOT_F[4] + 1, 4, 2);                                                       // натрий
  // решётка вывески над крышей: рама и плашки, что не осыпались
  px(ST, 29, 15, 46, 1); px(ST, 29, 6, 46, 1);
  for (const x of [30, 52, 74]) px(ST, x, 6, 1, 9);
  for (const [x, ch] of HOT_PLATES) {
    if (!ch) continue;
    if (ch === 'D') {                                                  // на одном болте: сползла, осела краем
      const dy = i => 1 + (i >= 3 ? 1 : 0);
      for (let i = 0; i < 5; i++) px(PL, x + i, 7 + dy(i), 1, 7);
      px(tone(MAT.STEEL, 2), x + 4, 8 + dy(4), 1, 6);
      glyph(px, N, x + 1, 9, 'D');                                     // буква цела — плашка нет
      px(A, x, 6, 1, 3);                                               // болт, что держит
      continue;
    }
    px(PL, x, 7, 5, 7); px(tone(MAT.STEEL, 2), x + 4, 8, 1, 6);
    glyph(px, N, x + 1, 8, ch);
  }
  palm(c, X0 + 5, Y0 + 95, 44);
});
// отель #2 (набором): другой отель того же берега (по «Сен-Жоржу», 1932) — ниже, модернистский:
// светлый бетон, вокруг объёма пояса балконов со скруглёнными концами, ограждения ажурным блоком
// («клаустра»), за ними проёмы в ритм; внизу утопленная терраса на квадратных столбах; на крыше
// бак-блок, на нём рельефом мёртвое название. Тоже в оспинах, но поверх них во всю стену висит
// плакат STOP SOLIDERE (так он и висел: хозяин не продаёт руину застройщику). Плакат выгорает. Пальма.
const HOT2_F = [44, 56, 68, 80];
const hotel2 = kit(96, 96, P => {
  P.box(18, 40, 66, 48, MAT.PLASTER);
  P.box(16, 38, 70, 2, MAT.PLASTER).shade(-1);                        // парапет
  P.box(40, 28, 18, 10, MAT.PLASTER);                                 // бак-блок на крыше
  for (const y of HOT2_F) {
    for (let i = 0; i < 8; i++) P.cut(21 + i * 8, y + 1, 4, 6);
    P.box(16, y + 8, 70, 2, MAT.PLASTER).shade(-2);                   // пояс балкона
    P.clear(16, y + 8, 1, 1); P.clear(85, y + 8, 1, 1);               // скруглённые концы
  }
  P.cut(20, 90, 62, 6);                                               // утопленная терраса
  for (const x of [20, 34, 48, 62, 79]) P.box(x, 90, 3, 6, MAT.PLASTER);
  P.clear(72, 38, 14, 3); P.clear(78, 41, 8, 2);                      // обломан угол парапета
}, { seed: 213, chip: 0.03, cracks: 3, drips: [[30, 41, 7], [58, 41, 5]] }, (c, X0, Y0, P) => {
  const px = pxOf(c, X0, Y0), CL = mix9(B, S, 0.12), CL2 = mix9(B, S, 0.3);
  for (const y of HOT2_F) for (let x = 17; x < 85; x += 2) if (P.at(x, y + 7)) px(tone(MAT.PLASTER, 1), x, y + 7, 1, 1);   // клаустра
  pocks(px, 18, 40, 66, 48, 70, 13, (x, y) => P.at(x, y) === MAT.PLASTER);
  for (let i = 0; i < 7; i++) px(tone(MAT.PLASTER, 4), 42 + i * 2, 31, 1, 3);   // название на баке — рельеф, мёртвое
  // плакат во всю стену: полотно, по верху выгорело, слова — киноварью
  px(CL, 22, 46, 58, 20); px(CL2, 22, 46, 58, 2); px(CL2, 22, 65, 58, 1);
  words(px, K, 27, 51, 'STOP'); words(px, K, 27, 58, 'SOLIDERE');
  for (const x of [22, 79]) { px(A, x, 44, 1, 2); px(A, x, 66, 1, 3); }   // растяжки
  for (const [x, y] of [[75, 35], [79, 37], [77, 34]]) px(tone(MAT.IRON, 3), x, y, 1, 3);   // арматура из обломка
  palm(c, X0 + 6, Y0 + 95, 40);
});

// пляж «аренда солнца» (набором): будка проката под косым навесом; прейскурант выгорел, кроме
// солнца — в нём оно целое; окошко, прилавок, приёмник. Над будкой на шесте солнце — луча
// вверх-вправо не хватает. Зонты: полосатый, выгоревший, третий сложен. Шезлонги пусты все. Песок.
const beach = kit(76, 52, P => {
  P.box(0, 48, 76, 4, MAT.SAND);
  P.box(2, 22, 18, 26, MAT.BOARD);
  P.poly([[0, 21], [23, 17], [23, 19], [0, 24]], MAT.IRON);
  P.box(5, 23, 12, 5, MAT.PLASTER).shade(-2);                         // прейскурант
  P.cut(5, 29, 12, 7);
  P.box(4, 36, 14, 1, MAT.BOARD).shade(-1);                           // прилавок
}, { seed: 217, chip: 0.03 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), SUN = mix9(B, S, 0.15), POLE = tone(MAT.STEEL, 3), INK = tone(MAT.BOARD, 1);
  for (const y of [24, 26]) px(INK, 6, y, 6, 1);                       // строки цен — штрихами
  px(INK, 14, 24, 1, 3); px(INK, 13, 25, 3, 1);                        // в прейскуранте солнце целое: диск и лучи
  px(INK, 13, 24, 1, 1); px(INK, 15, 24, 1, 1); px(INK, 13, 26, 1, 1); px(INK, 15, 26, 1, 1);
  px(A, 20, 31, 3, 3); px(A, 22, 27, 1, 4);                            // приёмник
  // солнце на шесте: диск, лучи; верхнего правого нет — выгорел
  px(POLE, 11, 13, 1, 5);
  px(SUN, 10, 4, 3, 7); px(SUN, 9, 5, 5, 5); px(SUN, 8, 6, 7, 3); px(tone(MAT.SAND, 4), 9, 5, 1, 2);
  for (const [x, y, w, h] of [[10, 1, 3, 1], [11, 0, 1, 1], [16, 6, 1, 3], [17, 7, 1, 1], [6, 6, 1, 3], [5, 7, 1, 1], [15, 10, 2, 1], [16, 11, 1, 1], [6, 10, 2, 1], [6, 11, 1, 1], [6, 2, 2, 1], [6, 1, 1, 1]]) px(B, x, y, w, h);
  // зонты: полосатый, выгоревший; третий сложен
  const umb = (u, top, cloth, stripe) => {
    px(POLE, u, top + 5, 1, 47 - top - 5);
    px(cloth, u - 2, top, 5, 1); px(cloth, u - 6, top + 1, 13, 1); px(cloth, u - 9, top + 2, 19, 1); px(cloth, u - 10, top + 3, 21, 2);
    px(cloth, u - 10, top + 5, 2, 1); px(cloth, u - 1, top + 5, 3, 1); px(cloth, u + 9, top + 5, 2, 1);
    if (stripe) { px(K, u - 1, top + 1, 3, 4); px(K, u - 8, top + 3, 3, 2); px(K, u + 6, top + 3, 3, 2); }
  };
  umb(37, 14, B, true); umb(61, 18, mix9(B, S, 0.3), false);
  px(POLE, 74, 18, 1, 30); px(mix9(B, S, 0.3), 73, 14, 3, 10);
  for (const s of [30, 42, 54, 66]) {                                  // шезлонги, спинкой к будке
    px(A, s, 42, 8, 2); px(A, s - 2, 40, 2, 2); px(A, s - 3, 38, 2, 2);
    px(tone(MAT.BOARD, 1), s + 1, 44, 1, 4); px(tone(MAT.BOARD, 1), s + 6, 44, 1, 4);
  }
});

// кофейня Махфуза (набором): дом старого квартала Каира — штукатурка в два этажа, межэтажный
// карниз, эркер-машрабия на кронштейнах, окна со ставнями; стрельчатая арка входа, в ней фонарь;
// над витриной доска с мёртвой трубкой-вязью (штрихи, не буквы: высокие алиф и лям, петля, хвост
// под строку, точки). На крыше бак и телеантенна. У входа столик: бирка, чашка — кофе долит,
// никого; стул придвинут к столику; кальян у двери кухни.
function cafeBuild(P) {
  P.box(4, 14, 56, 48, MAT.PLASTER);
  P.box(3, 13, 58, 1, MAT.PLASTER).shade(-1);
  P.box(4, 36, 56, 2, MAT.PLASTER).shade(-1);                         // межэтажный карниз
  P.box(22, 16, 20, 18, MAT.BOARD);                                   // эркер-машрабия
  P.cut(9, 20, 6, 9); P.cut(49, 20, 6, 9);
  parch(P, 25, 62, 14, 22);
  P.cut(8, 44, 12, 11, MAT.GLASS);
  P.cut(45, 44, 11, 18);
  P.box(7, 38, 15, 5, MAT.BOARD).shade(1);                            // доска вывески
  P.box(10, 6, 9, 4, MAT.IRON);                                       // бак
}
function cafeOver(c, X0, Y0, P, table) {
  const px = pxOf(c, X0, Y0), W = tone(MAT.BOARD, 1);
  for (let x = 24; x < 41; x += 2) px(W, x, 18, 1, 14);               // точёная решётка
  for (let y = 18; y < 32; y += 2) px(W, 24, y, 16, 1);
  px(W, 24, 34, 3, 2); px(W, 37, 34, 3, 2);
  for (const x of [8, 15, 48]) px(tone(MAT.BOARD, 2), x, 20, 1, 9);   // ставни
  px(A, 11, 10, 1, 3); px(A, 17, 10, 1, 3);                            // ножки бака
  px(A, 47, 2, 1, 11); px(A, 45, 3, 5, 1); px(A, 45, 5, 4, 1); px(A, 46, 7, 3, 1);   // телеантенна
  // мёртвая трубка-вязь: строка, высокие алиф и лям справа, петля, хвост под строку, точки
  px(A, 9, 41, 10, 1); px(A, 18, 38, 1, 3); px(A, 16, 39, 1, 2);
  px(A, 11, 39, 3, 1); px(A, 11, 40, 1, 1); px(A, 13, 40, 1, 1);
  px(A, 8, 41, 1, 1); px(A, 8, 42, 2, 1); px(A, 7, 40, 1, 2);
  px(A, 15, 38, 1, 1); px(A, 10, 42, 1, 1);
  px(C, 31, 45, 2, 3);                                                 // фонарь в арке
  // кальян у двери кухни
  px(A, 57, 58, 3, 4); px(A, 58, 53, 1, 5); px(B, 57, 52, 3, 1); px(tone(MAT.BOARD, 1), 60, 59, 2, 1);
  if (!table) return;
  px(A, 0, 54, 8, 1); px(A, 4, 55, 1, 6); px(A, 2, 61, 5, 1);         // столик у входа
  px(B, 1, 52, 2, 2);                                                  // бирка
  px(B, 6, 53, 2, 1);                                                  // чашка
  px(A, 12, 49, 1, 13); px(A, 9, 56, 4, 1); px(A, 9, 57, 1, 5);       // стул придвинут, пуст
}
const cafeBody = kit(64, 62, cafeBuild, { seed: 219, chip: 0.02, drips: [[30, 15, 5], [52, 15, 6]] }, (c, X0, Y0, P) => cafeOver(c, X0, Y0, P, true));
function cafeLive(c, x, gy, t) {
  const X0 = Math.round(x) - 32, Y0 = Math.round(gy) - 62;
  if (((t | 0) >> 5) % 5 === 0) R(c, A, X0 + 7, Y0 + 51, 1, 1);      // над чашкой — пар
}
const cafe = split(cafeBody, cafeLive);
// кофейня #2 (набором): тот же дом; столика у входа нет. За витриной свет; у стекла за столиком
// старик пишет — медленно: перо сдвигается редко; напротив друг записывает то, что старик говорит
// вслух, — его перо ходит чаще. Монтаж назван: утренняя кофейня — привычка до 1994-го; после ножа
// он выходил вечерами, к друзьям и под охраной.
const cafe2Body = kit(64, 62, cafeBuild, { seed: 223, chip: 0.02, drips: [[30, 15, 5]] }, (c, X0, Y0, P) => {
  cafeOver(c, X0, Y0, P, false);
  const px = pxOf(c, X0, Y0);
  px(mix9(B, S, 0.6), 8, 44, 12, 11);                                  // за стеклом свет
  px(N, 9, 47, 3, 3); px(N, 9, 50, 4, 4); px(N, 13, 50, 1, 1);        // старик: голова к листу, плечи скатом
  px(N, 17, 47, 2, 3); px(N, 17, 50, 3, 4);                           // друг напротив
  px(LEAF, 12, 52, 5, 1);                                              // листы на столе
  px(A, 8, 53, 12, 1); px(A, 8, 44, 12, 1);
});
function cafe2Live(c, x, gy, t) {
  const X0 = Math.round(x) - 32, Y0 = Math.round(gy) - 62, k = ((t | 0) / 90 | 0) % 3, f = ((t | 0) / 20 | 0) % 3;
  R(c, N, X0 + 13, Y0 + 51, 1 + (k > 0 ? 1 : 0), 1); R(c, A, X0 + 13 + k, Y0 + 51, 1, 1);   // рука старика, перо — редко
  R(c, N, X0 + 16 - (f > 1 ? 1 : 0), Y0 + 51, 1, 1); R(c, A, X0 + 15 - f, Y0 + 51, 1, 1);   // друг пишет чаще
}
const cafe2 = split(cafe2Body, cafe2Live);

// ── ВОСТОК (набором) ─────────────────────────────────────────────────
// окна самостроя: на каждый ряд свой размер и свой сдвиг, часть заложена
const HONEY_WIN = [[1, 2], [2, 2], [3, 2], [4, 3], [2, 3]];
function honeyWin(P, x0, x1, y0, y1, step, s) {
  for (let y = y0; y < y1; y += step) {
    let x = x0 + (noise(x0, y, s) * 3 | 0);
    while (x < x1 - 1) {
      const [w, h] = HONEY_WIN[noise(x, y, s + 1) * HONEY_WIN.length | 0];
      if (x + w > x1) break;
      if (noise(x, y, s + 3) > 0.14) P.cut(x, y + (noise(x, y, s + 2) < 0.25 ? 1 : 0), w, h);
      x += w + 1 + (noise(x, y, s + 4) * 3 | 0);
    }
  }
}
// антенны-ёлочки: x, основание, высота, наклон (на сколько уходит вершина)
function antenna(px, c, X0, Y0, x, base, h, lean = 0) {
  if (lean) hline(c, A, X0 + x, Y0 + base - 1, X0 + x + lean, Y0 + base - h);
  else px(A, x, base - h, 1, h);
  const tx = x + lean, top = base - h;                                // верх мачты — вровень с верхней перекладиной
  px(A, tx - 1, top, 3, 1);
  if (h >= 7) px(A, tx - 2, top + 2, 5, 1);
  if (h >= 10) px(A, tx - 1, top + 4, 3, 1);
}
// бельё на шесте: вещи разной длины, по шуму
function laundry(px, x, y, len, s) {
  px(A, x, y, len, 1);
  const COL = [LEAF, tone(MAT.MOSS, 3), mix9(A, S, 0.3), mix9(B, S, 0.25)];
  for (let i = 1; i < len - 1; i += 2 + (noise(i, y, s) * 2 | 0)) {
    const w = noise(i, y, s + 1) < 0.5 ? 1 : 2, h = 2 + (noise(i, y, s + 2) * 2 | 0);
    if (i + w <= len) px(COL[noise(i, y, s + 3) * 4 | 0], x + i, y + 1, w, h);
  }
}
// самолёт на посадку (Кайтак, полоса 13 над Коулуном): снижается справа налево, шасси выпущены;
// у краёв рамки тает, а не срезается вертикалью в воздухе
function landing(c, X0, Y0, W, T, y0) {
  const ph = T % 1500;
  if (ph >= 250) return;
  const px0 = Math.round(W - ph * 0.42), dy = Math.round(ph * 0.02), L = 32;
  const f = (Math.min(W, px0 + L) - Math.max(0, px0)) / L;
  if (f <= 0) return;
  c.globalAlpha = Math.min(1, f * f * 1.4);
  const BE = tone(MAT.STEEL, 2);
  const parts = [[1, 3, L - 1, 3, A], [0, 4, 1, 2, A], [L - 4, 0, 2, 1, A], [L - 5, 1, 3, 1, A], [L - 6, 2, 4, 1, A],
    [2, 5, L - 4, 1, BE], [11, 6, 10, 1, BE], [8, 6, 1, 2, A], [20, 6, 1, 2, A], [8, 8, 1, 1, N], [20, 8, 1, 1, N]];
  for (const [dx, yy, w, h, col] of parts) {
    const a = Math.max(0, px0 + dx), b = Math.min(W, px0 + dx + w);
    if (b > a) R(c, col, X0 + a, Y0 + y0 + dy + yy, b - a, h);
  }
  for (let i = 4; i < 24; i += 2) if (px0 + i >= 0 && px0 + i < W) R(c, B, X0 + px0 + i, Y0 + y0 + dy + 4, 1, 1);   // иллюминаторы
  c.globalAlpha = 1;
}

// город-соты (набором): Коулун — три блока впритык, у каждого свой материал (бетон, плитка,
// штукатурка) и свой шаг этажей (5, 4, 6: на стыках ряды не сходятся); окна прорублены кто где —
// на ряд свой размер и свой сдвиг, часть заложена. Решётки-клетки выносом за грань и поверх них
// ещё решётки, кондиционеры, бельё на шестах. На крышах будки, бак и лес антенн-ёлочек, пара
// накренилась. Над улицей вывески на кронштейнах с мёртвыми трубками, живая — одна, киноварью.
// Одно окно тёплое. Раз в полминуты над антеннами садится самолёт: снижается, шасси выпущены.
const honeyBuild = P => {
  P.box(6, 26, 20, 70, MAT.CONCRETE);
  P.box(26, 14, 20, 82, MAT.CERAMIC);
  P.box(46, 34, 20, 62, MAT.PLASTER).shade(1);
  honeyWin(P, 7, 25, 30, 86, 5, 11);
  honeyWin(P, 27, 45, 18, 86, 4, 21);
  honeyWin(P, 47, 65, 38, 86, 6, 31);
  P.cut(39, 50, 2, 3);                                                 // окно тёплое — прорублено наверняка
  P.box(6, 89, 60, 7, MAT.DARK);                                      // лавки за ставнями
  P.cut(30, 78, 6, 18);                                               // проход в колодец двора
  P.box(9, 20, 8, 6, MAT.BOARD); P.box(50, 29, 6, 5, MAT.BOARD); P.box(39, 9, 5, 5, MAT.IRON);   // будки и бак
};
const HONEY_ANT = [[7, 26, 8], [12, 20, 9], [16, 20, 14], [22, 26, 9, 2], [27, 14, 7], [29, 14, 12], [33, 14, 6], [36, 14, 9],
  [41, 9, 6], [44, 14, 11, -2], [48, 34, 6], [53, 29, 10], [58, 34, 13], [62, 34, 6], [65, 34, 8, 2]];
const honeyBody = kit(72, 96, honeyBuild, { seed: 227, chip: 0.03, drips: [[12, 27, 9], [35, 15, 12], [58, 35, 8], [20, 50, 6]] }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), G = tone(MAT.IRON, 3), SH = tone(MAT.BOARD, 1);
  for (const [x, b, h, l] of HONEY_ANT) antenna(px, c, X0, Y0, x, b, h, l);
  // клетки-решётки выносом за грань, поверх — ещё одна
  for (const [x, y] of [[4, 44], [62, 60], [23, 66], [41, 28], [2, 70]]) { px(G, x, y, 5, 6); px(N, x + 1, y + 1, 3, 4); px(G, x + 2, y + 1, 1, 4); }
  px(G, 5, 43, 3, 1); px(G, 63, 58, 4, 3); px(N, 64, 59, 2, 1);
  for (const [x, y] of [[21, 36], [10, 74], [31, 40], [49, 56], [40, 70], [55, 44], [14, 58]]) { px(tone(MAT.IRON, 4), x, y, 3, 2); px(tone(MAT.IRON, 1), x, y + 2, 3, 1); }   // кондиционеры
  // бельё: шесты из окон вбок и за грань
  laundry(px, 8, 52, 9, 41); laundry(px, 49, 66, 10, 43); laundry(px, 0, 38, 8, 47); laundry(px, 64, 50, 8, 49); laundry(px, 28, 60, 8, 53);
  // вывески на кронштейнах над улицей: доска, мёртвая трубка
  px(A, 0, 60, 9, 1); px(SH, 0, 61, 12, 6); px(A, 2, 62, 1, 4); px(A, 3, 63, 3, 1); px(A, 8, 62, 1, 4); px(A, 7, 65, 3, 1);
  px(A, 63, 42, 9, 1); px(SH, 58, 43, 14, 6); px(A, 60, 44, 3, 1); px(A, 62, 45, 1, 2); px(A, 60, 47, 3, 1); px(A, 66, 44, 1, 4);
  px(A, 0, 76, 9, 1); px(SH, 1, 77, 10, 5);
  px(C, 39, 50, 2, 3);                                                 // одно окно тёплое
  px(tone(MAT.IRON, 4), 29, 77, 8, 1); px(A, 29, 78, 1, 18); px(A, 36, 78, 1, 18);
});
function honeyLive(c, x, gy, t) {
  const X0 = Math.round(x) - 36, Y0 = Math.round(gy) - 96, T = t | 0;
  R(c, K, X0 + 3, Y0 + 78, 1, 3); R(c, K, X0 + 4, Y0 + 79, 3, 1);     // живая трубка
  if (T % 397 > 9) R(c, K, X0 + 8, Y0 + 78, 1, 3);
  landing(c, X0, Y0, 72, T, 0);
}
const honeycomb = split(honeyBody, honeyLive);
// город-соты #2 (набором): тот же город с другой стороны, пока стоит, — а в середине, обступленный
// башнями, низкий дом под черепицей: ямэнь, старое присутственное место (1847), с которого всё
// начиналось. Серый кирпич, щипцы торцами над скатом, вход в каменной раме, ступень. Между
// блоками щель с лестничными маршами в соседние дома; по крышам будки, бельё, ребёнок на крыше —
// там светлее. Внизу лавка за ставнями, одна открыта. Самолёты ещё садятся.
// Монтаж назван: рисунок — до сноса (город снесён в 1993–94, парк открыт в 1995, Кайтак закрыт
// 6.07.1998); осмотр — будущее, предсказание. Ямэнь из блоков снаружи не был виден — здесь виден.
const honey2Build = P => {
  P.box(0, 16, 20, 80, MAT.CONCRETE);
  P.box(24, 22, 26, 74, MAT.CERAMIC);
  P.box(50, 14, 22, 82, MAT.PLASTER).shade(1);
  P.cut(20, 20, 4, 76);                                                // щель: марши в соседние дома
  honeyWin(P, 1, 19, 20, 84, 5, 61);
  honeyWin(P, 25, 49, 26, 66, 4, 71);
  honeyWin(P, 51, 71, 18, 84, 6, 81);
  P.box(0, 86, 20, 10, MAT.IRON); P.box(50, 86, 22, 10, MAT.IRON);    // лавки за ставнями
  P.cut(56, 88, 8, 8);                                                 // одна открыта
  P.box(4, 12, 7, 4, MAT.BOARD); P.box(60, 9, 6, 5, MAT.IRON);         // будка, бак
  // ямэнь: стена серого кирпича, черепица, щипцы над скатом, ступень
  P.box(16, 78, 40, 16, MAT.QING);
  P.box(18, 70, 36, 8, MAT.KAWARA);
  P.box(18, 69, 36, 1, MAT.KAWARA).shade(-1);                          // конёк
  P.box(16, 67, 2, 11, MAT.QING).shade(1); P.box(54, 67, 2, 11, MAT.QING).shade(-1);
  P.box(14, 94, 44, 2, MAT.ASHLAR);
  P.box(31, 80, 10, 14, MAT.ASHLAR);                                   // каменная рама входа
  P.cut(33, 82, 6, 12);
  P.cut(21, 83, 4, 4); P.cut(47, 83, 4, 4);
};
const honey2Body = kit(72, 96, honey2Build, { seed: 229, chip: 0.03, moss: 0.02, drips: [[8, 17, 10], [60, 15, 12], [36, 23, 8]] }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), G = tone(MAT.IRON, 3), ST = mix9(A, N, 0.35);
  for (const [x, b, h, l] of [[2, 16, 7], [8, 12, 9], [12, 16, 11, 1], [27, 22, 6], [33, 22, 9], [45, 22, 7, -1], [53, 14, 6], [68, 14, 9]]) antenna(px, c, X0, Y0, x, b, h, l);
  // щель: лестничные марши зигзагом, площадки
  for (let y = 24; y < 88; y += 8) { hline(c, ST, X0 + 20, Y0 + y + 7, X0 + 23, Y0 + y + 4); px(ST, 20, y + 3, 4, 1); hline(c, ST, X0 + 23, Y0 + y + 3, X0 + 20, Y0 + y); }
  for (const [x, y] of [[13, 40], [52, 30], [66, 64], [3, 58]]) { px(G, x, y, 5, 6); px(N, x + 1, y + 1, 3, 4); px(G, x + 2, y + 1, 1, 4); }
  for (const [x, y] of [[8, 30], [28, 46], [44, 34], [58, 50]]) { px(tone(MAT.IRON, 4), x, y, 3, 2); px(tone(MAT.IRON, 1), x, y + 2, 3, 1); }
  laundry(px, 3, 28, 10, 63); laundry(px, 52, 40, 12, 67); laundry(px, 26, 56, 9, 69); laundry(px, 52, 10, 6, 73);
  // ребёнок на крыше левого блока, у будки
  px(N, 17, 11, 1, 1); px(N, 16, 12, 3, 2); px(N, 16, 14, 1, 2); px(N, 18, 14, 1, 2);
  // ямэнь: тень под свесом, конёк с поднятыми концами, притолока камнем, решётки окон
  px(mix9(N, S, 0.25), 18, 78, 36, 1);
  px(tone(MAT.KAWARA, 0), 18, 69, 36, 1); px(tone(MAT.KAWARA, 1), 18, 68, 2, 1); px(tone(MAT.KAWARA, 1), 52, 68, 2, 1);
  px(tone(MAT.ASHLAR, 4), 31, 80, 10, 1);
  for (const x of [22, 24, 48, 50]) px(tone(MAT.QING, 1), x, 83, 1, 4);
  // открытая лавка: прилавок, под ним товар
  px(tone(MAT.BOARD, 3), 56, 91, 8, 1); px(mix9(B, S, 0.4), 57, 92, 2, 1); px(mix9(B, S, 0.4), 60, 92, 3, 1);
  px(C, 58, 89, 3, 1);                                                // лампа над прилавком
});
function honey2Live(c, x, gy, t) {
  const X0 = Math.round(x) - 36, Y0 = Math.round(gy) - 96;
  landing(c, X0, Y0, 72, (t | 0) + 600, 0);
}
const honey2 = split(honey2Body, honey2Live);

// капсульная башня (набором): два бетонных ствола гранями, на них капсулы — светлые коробки с
// круглым иллюминатором, внутренней кромкой вплотную к стволу (шов тёмный), разнобой — только
// наружу. Левая башня ниже правой; машинные наверху стволов. Внизу бетонный цоколь с полосой
// стекла, вход стеклом между стволами. В одной капсуле мерцает экран.
const CAPS = [];
for (const [side, n, bottom] of [[-1, 6, 76], [0, 4, 62], [1, 7, 76]]) for (let k = 0; k < n; k++) {
  const w = (k * 7 + n) % 3 === 0 ? 10 : 9, y = bottom - (k + 1) * 10 + 1;
  CAPS.push(side < 0 ? [13 - w, y, w, 1] : side > 0 ? [35, y, w, -1] : [19, y, 10, 0]);
}
const capsBody = kit(46, 92, P => {
  P.box(0, 76, 46, 16, MAT.CONCRETE);                                  // цоколь
  P.cut(2, 79, 42, 3, MAT.GLASS);
  P.box(13, 17, 6, 59, MAT.CONCRETE); P.box(18, 17, 1, 59, MAT.CONCRETE).shade(-2);
  P.box(29, 6, 6, 70, MAT.CONCRETE); P.box(34, 6, 1, 70, MAT.CONCRETE).shade(-2);
  P.box(12, 11, 8, 6, MAT.CONCRETE).shade(1); P.box(28, 0, 8, 6, MAT.CONCRETE).shade(1);   // машинные
  for (const [x, y, w] of CAPS) {
    P.box(x, y, w, 9, MAT.STEEL);
    const cx = x + (w >> 1) - 2;
    P.cut(cx + 1, y + 2, 3, 5, MAT.GLASS); P.cut(cx, y + 3, 5, 3, MAT.GLASS);
  }
  P.cut(20, 82, 8, 10, MAT.GLASS);
}, { seed: 233, drips: [[5, 20, 6], [38, 30, 5], [22, 45, 7]] }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0);
  for (const [x, y, w, s] of CAPS) {
    const cx = x + (w >> 1) - 2;
    const RIM = tone(MAT.STEEL, 1);                                    // кольцо иллюминатора
    px(RIM, cx + 1, y + 1, 3, 1); px(RIM, cx - 1, y + 3, 1, 3); px(RIM, cx + 5, y + 3, 1, 3); px(RIM, cx + 1, y + 7, 3, 1);
    px(RIM, cx, y + 2, 1, 1); px(RIM, cx + 4, y + 2, 1, 1); px(RIM, cx, y + 6, 1, 1); px(RIM, cx + 4, y + 6, 1, 1);
    if (s > 0) px(N, x + w - 1, y, 1, 9); else if (s < 0) px(N, x, y, 1, 9);   // шов к стволу
  }
  px(A, 19, 81, 10, 1); px(A, 24, 82, 1, 10);
});
const CAP_SCREEN = CAPS[13];
function capsLive(c, x, gy, t) {
  const X0 = Math.round(x) - 23, Y0 = Math.round(gy) - 92, [cx, cy, w] = CAP_SCREEN, sx = cx + (w >> 1) - 1;
  if ((t | 0) % 233 > 11) R(c, B, X0 + sx, Y0 + cy + 3, 3, 3);       // в одной капсуле — экран
}
const capsules = split(capsBody, capsLive);

// ── ЗАПАД (набором) ──────────────────────────────────────────────────
// колесо обозрения (набором): за решёткой ворот парка, открытие которого назначали на 1 мая и не
// открыли (рассказ о пробном пуске 27 апреля не подтверждён). Опоры буквой «А» стальным профилем,
// обод двойной, шестнадцать спиц, в каждом узле гондола — навес, скамья. Остановлено как положено:
// нижняя у помоста, к помосту ступенька. Гондолы чуть ходят на ветру. Ворота — лентой арки, под
// замком доска, буквы осыпались, по кромке мёртвые лампочки; касса. У въезда на пилоне звезда —
// восемь лучей на патронах, ни один не горит. Монтаж назван: звезда-«гуги», ворота с маркизой
// и касса — приём парков за океаном, не этого парка.
const WH = { x: 50, cy: 45, r: 33 };
const MARQ = [];
for (let k = 0; k <= 16; k++) { const a = Math.PI * k / 16; MARQ.push([WH.x - 18 * Math.cos(a), 70 - 10 * Math.sin(a)]); }
for (let k = 16; k >= 0; k--) { const a = Math.PI * k / 16; MARQ.push([WH.x - 16 * Math.cos(a), 70 - 8 * Math.sin(a)]); }
const WHEEL_FRONT = [MAT.BOARD, MAT.CONCRETE, MAT.BRICK];             // перед колесом: маркиза, столбы, касса
// контекст с маской: пиксели колеса за воротами не ложатся
function masked(c, X0, Y0, P) {
  return {
    set fillStyle(v) { c.fillStyle = v; },
    fillRect(x, y, w, h) {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (!WHEEL_FRONT.includes(P.at(x + i - X0, y + j - Y0))) c.fillRect(x + i, y + j, 1, 1);
    },
  };
}
function wheelGrille(c, X0, Y0) {
  for (let k = -12; k <= 12; k += 6) R(c, tone(MAT.IRON, 3), X0 + WH.x + k, Y0 + 72, 1, 19);
  R(c, N, X0 + WH.x - 13, Y0 + 72, 27, 1);
}
const wheelBody = kit(88, 92, P => {
  P.poly([[29, 91], [32, 91], [WH.x, WH.cy + 1], [WH.x - 1, WH.cy]], MAT.STEEL);
  P.poly([[68, 91], [71, 91], [WH.x + 1, WH.cy], [WH.x, WH.cy + 1]], MAT.STEEL);
  P.box(WH.x - 6, 84, 13, 2, MAT.STEEL); P.box(WH.x + 7, 87, 3, 1, MAT.STEEL);   // помост, ступенька
  P.box(WH.x - 16, 69, 3, 23, MAT.CONCRETE); P.box(WH.x + 14, 69, 3, 23, MAT.CONCRETE);   // столбы ворот
  P.poly(MARQ, MAT.BOARD).shade(1);                                    // маркиза — лента арки
  P.box(WH.x - 10, 63, 21, 4, MAT.BOARD);                              // доска под замком арки — для объявления
  P.box(75, 77, 11, 14, MAT.BRICK); P.box(74, 76, 13, 1, MAT.CONCRETE); P.cut(78, 80, 5, 4);   // касса
  P.poly([[7, 91], [10, 91], [7, 40], [5, 40]], MAT.CONCRETE);         // косой стебель пилона
}, { seed: 239, chip: 0.02 }, (c, X0, Y0, P) => {
  const px = pxOf(c, X0, Y0), X = X0 + WH.x, cy = Y0 + WH.cy, RIM = tone(MAT.STEEL, 3), RIM2 = tone(MAT.STEEL, 1), m = masked(c, X0, Y0, P);
  ring(m, RIM, X, cy, WH.r); ring(m, RIM2, X, cy, WH.r - 3);
  for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; line(m, RIM2, X, cy, X + Math.round(Math.cos(a) * (WH.r - 3)), cy + Math.round(Math.sin(a) * (WH.r - 3))); }
  // передние ноги «А» — поверх обода
  const LEG = tone(MAT.STEEL, 2);
  for (const bx of [30, 31, 69, 70]) line(m, LEG, X0 + bx, Y0 + 90, X, cy + 1);
  px(tone(MAT.STEEL, 4), WH.x - 1, WH.cy - 1, 3, 3); px(N, WH.x, WH.cy, 1, 1);   // ступица
  wheelGrille(c, X0, Y0);
  for (let dx = -16; dx <= 16; dx += 2) {                              // мёртвые лампочки по кромке маркизы
    const y = 70 - Math.round(10 * Math.sqrt(Math.max(0, 1 - (dx / 18) ** 2)));
    if ((dx + 40) % 7 !== 3) px(tone(MAT.STEEL, 4), WH.x + dx, y - 1, 1, 1);
  }
  px(LEAF, 79, 85, 3, 2);                                              // «перерыв»
  // звезда на пилоне: восемь лучей почти равной длины, на концах — патроны, втулка тёмная
  const sx = 6, sy = 34, ST = tone(MAT.STEEL, 3);
  px(ST, sx - 5, sy, 11, 1); px(ST, sx, sy - 5, 1, 11);
  for (let d = 1; d <= 4; d++) { px(ST, sx + d, sy - d); px(ST, sx - d, sy + d); px(ST, sx - d, sy - d); px(ST, sx + d, sy + d); }
  for (const [dx, dy] of [[-6, 0], [6, 0], [0, -6], [0, 6], [-5, -5], [5, -5], [-5, 5], [5, 5]]) px(A, sx + dx, sy + dy);
  px(ST, sx - 1, sy - 1, 3, 3); px(N, sx, sy);
});
function wheelLive(c, x, gy) {
  const X0 = Math.round(x) - 44, G = Math.round(gy), Y0 = G - 92, m = masked(c, X0, Y0, wheelBody.plan());
  for (let k = 0; k < 16; k++) {
    const a = k * Math.PI / 8, gx = WH.x + Math.round(Math.cos(a) * WH.r), gyy = WH.cy + Math.round(Math.sin(a) * WH.r);
    const h = hang(`gond:${X0}:${G}:${k}`, X0 + gx + 0.5, Y0 + gyy, 3, { sail: 0.03, damp: 0.994, gy: G, r: 3 });
    const o = Math.max(-1, Math.min(1, Math.round(tipOf(h).x - (X0 + gx + 0.5))));
    const L = Math.max(X0 + 1, Math.min(X0 + 80, X0 + gx - 3 + o)), T = Y0 + gyy;
    m.fillStyle = A; m.fillRect(X0 + gx, T, 1, 2);
    m.fillStyle = B; m.fillRect(L, T + 2, 7, 1);
    m.fillStyle = A; m.fillRect(L, T + 3, 1, 2); m.fillRect(L + 6, T + 3, 1, 2); m.fillRect(L, T + 5, 7, 1);
    m.fillStyle = tone(MAT.BOARD, 3); m.fillRect(L + 2, T + 4, 3, 1);
  }
  wheelGrille(c, X0, Y0);                                               // решётка ворот — перед гондолой у помоста
}
const wheel = split(wheelBody, wheelLive);

// щит с ковбоями (набором): щит на трёх ногах, мостик, лампы подсветки погашены. Два одинаковых
// плаката со всадником: конь в профиль, всадник прямо, курит; на втором тот же — завалился на
// шею коня, кашляет. Новый клеят поверх прежнего: у края угол отошёл и загнулся светлой
// изнанкой, под ним ступенькой прежний плакат и нижний, писанный от руки (обломок мазка киноварью).
// Над щитом — пустое небо: рамка выше доски, чтобы кольцам #2 было куда подниматься.
const BY = 14;
function boardFrame(P) {
  for (const x of [10, 37, 64]) P.box(x, BY + 27, 2, 31, MAT.STEEL);
  P.box(10, BY + 37, 56, 1, MAT.STEEL); P.box(10, BY + 47, 56, 1, MAT.STEEL);
  P.box(2, BY + 27, 72, 1, MAT.STEEL).shade(-1);                       // мостик
  P.box(2, BY + 2, 72, 25, MAT.BOARD);
}
function boardOver(px) {
  for (const lx of [12, 30, 48, 66]) { px(A, lx, 0, 3, 1); px(A, lx + 1, 1, 1, 1); }   // лампы погашены
}
// всадник в профиль: конь вправо, x — круп; cough — второй плакат
function rider(px, x, cough) {
  px(N, x, 15, 15, 5);                                                 // корпус коня
  for (const [lx, sh] of [[1, 0], [3, 1], [11, 0], [13, -1]]) { px(N, x + lx, 20, 1, 3); px(N, x + lx + sh, 23, 1, 2); }
  px(N, x + 14, 13, 2, 2); px(N, x + 15, 12, 2, 1); px(N, x + 16, 10, 4, 2); px(N, x + 19, 12, 1, 1); px(N, x + 16, 9, 1, 1);   // шея, голова
  px(N, x - 1, 15, 1, 4); px(N, x - 2, 17, 1, 4);                      // хвост
  if (!cough) {
    px(N, x + 5, 5, 5, 2); px(N, x + 4, 7, 7, 1); px(N, x + 6, 8, 3, 3); px(N, x + 5, 11, 4, 4);
    px(N, x + 9, 12, 3, 1);                                             // рука к поводу
    px(LEAF, x + 9, 9, 2, 1); px(K, x + 11, 9, 1, 1);                  // сигарета с угольком
  } else {
    px(N, x + 5, 12, 5, 3); px(N, x + 8, 11, 3, 2);                    // торс завален на шею
    px(N, x + 10, 8, 3, 3); px(N, x + 9, 7, 5, 1); px(N, x + 10, 5, 3, 2);
    px(N, x + 13, 9, 1, 2);                                             // рука у рта
    px(B, x + 15, 7, 1, 1); px(B, x + 17, 6, 1, 1); px(B, x + 16, 4, 1, 1);
  }
}
const billboard = kit(76, 58 + BY, boardFrame, { seed: 241 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0 + BY), SKY = mix9(B, S, 0.28), GR = tone(MAT.BOARD, 2);
  boardOver(px);
  for (const x of [4, 39]) {
    px(SKY, x, 4, 33, 8); px(GR, x, 12, 33, 13);
    px(S, x + 1, 9, 6, 3); px(S, x + 2, 8, 4, 1); px(S, x + 29, 10, 4, 2);   // столовые горы
    rider(px, x + 7, x > 20);
  }
  // отклеившийся угол: загнут светлой изнанкой; под ним прежний плакат и писанный от руки
  const OLD = tone(MAT.BOARD, 4), HAND = mix9(B, S, 0.35);
  for (let dy = 0; dy <= 5; dy++) for (let dx = 0; dx <= 5; dx++) {
    const s = dx + dy, x = 4 + dx, y = 24 - dy;
    if (s <= 3) px(HAND, x, y); else if (s <= 5) px(OLD, x, y);
    else if (s <= 8) px(s === 6 ? mix9(LEAF, N, 0.25) : LEAF, x, y);
  }
  px(K, 5, 22, 1, 1); px(K, 6, 21, 1, 1);                               // обломок мазка буквы
});
// щит #2 (набором): курящий щит — по образцу щита на Таймс-сквер (1941–66), как он и висел: на
// стене дома, в упор над окнами, лампы подсветки по верху. Во всю доску — курильщик (солдат,
// моряк, теперь кто-то в шляпе): шляпа, лицо, рот тёмным кружком, сигарета в пальцах; справа
// выцветший слоган — блоки букв, не прочесть. Раз в несколько секунд изо рта вылетает кольцо,
// поднимается над щитом, расходится и тает (пар из трубы за щитом — в изнанке).
const smokerBody = kit(76, 58 + BY, P => {
  P.box(0, BY + 6, 76, 52, MAT.BRICK);
  P.box(0, BY + 5, 76, 1, MAT.CONCRETE).shade(-1);                     // карниз брандмауэра
  for (const y of [BY + 31, BY + 44]) for (const x of [5, 17, 29, 41, 53, 65]) P.cut(x, y, 5, 7);
  P.box(0, BY + 29, 76, 1, MAT.CONCRETE);                              // пояс под щитом
  P.box(2, BY + 2, 72, 25, MAT.BOARD);
}, { seed: 243, chip: 0.02, soot: [[17, BY + 30, 5, 5], [53, BY + 43, 5, 4]] }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0 + BY), SKY = mix9(B, S, 0.32), FACE = mix9(B, S, 0.45), HAND = mix9(B, S, 0.56), HAT = tone(MAT.BOARD, 1);
  boardOver(px);
  for (const lx of [12, 30, 48, 66]) px(A, lx + 1, 2, 1, 2);           // кронштейны ламп к доске
  px(SKY, 4, 4, 68, 21);
  px(HAT, 22, 5, 18, 4); px(HAT, 17, 9, 28, 2);                        // шляпа
  px(FACE, 23, 11, 16, 12); px(FACE, 25, 23, 12, 2);                   // лицо, подбородок
  px(N, 26, 14, 3, 1); px(N, 33, 14, 3, 1);                            // глаза в тени полей
  px(tone(MAT.BOARD, 2), 29, 16, 2, 4);                                // нос
  px(N, 31, 20, 3, 3); px(FACE, 32, 21, 1, 1);                         // рот кружком
  px(S, 15, 25, 32, 2);                                                // ворот
  px(LEAF, 35, 22, 5, 1); px(A, 40, 22, 1, 1);                         // сигарета
  px(HAND, 37, 23, 3, 2); px(HAND, 38, 25, 2, 1);                      // пальцы, запястье к вороту
  // выцветший слоган: блоки букв, вторая строка мельче
  const SL = mix9(SKY, S, 0.35);
  for (const [x, w] of [[48, 3], [52, 3], [56, 2], [60, 3], [64, 3], [68, 2]]) px(SL, x, 8, w, 5);
  for (let x = 48; x < 71; x += 3) if (x !== 57) px(SL, x, 15, 2, 3);
});
function smokerLive(c, x, gy, t) {
  const X0 = Math.round(x) - 38, Y0 = Math.round(gy) - 58 - BY, ph = (t | 0) % 240;
  if (ph >= 200) return;
  const k = ph / 200, rx = Math.round(33 + 31 * k), ry = Math.round(BY + 21 - (BY + 16) * Math.sqrt(k)), s = k < 0.3 ? 1 : k < 0.65 ? 2 : 3;
  c.globalAlpha = 0.85 * Math.sqrt(1 - k);
  c.fillStyle = A;
  c.fillRect(X0 + rx - s, Y0 + ry - s, 2 * s + 1, 1); c.fillRect(X0 + rx - s, Y0 + ry + s, 2 * s + 1, 1);
  c.fillRect(X0 + rx - s - 1, Y0 + ry - s + 1, 1, 2 * s - 1); c.fillRect(X0 + rx + s + 1, Y0 + ry - s + 1, 1, 2 * s - 1);
  c.globalAlpha = 1;
}
const smoker = split(smokerBody, smokerLive);

// ── СЕВЕР (набором) ──────────────────────────────────────────────────
// своя вода у основания (как у судов катастроф): несколько рядов до земли рамки, края — берегом
// уступом, не срезом рамки; что ниже ватерлинии — под водой; у входа в воду — пена; рябь пеплом
function sea(c, X0, Y0, P, wl, W, H, ripple) {
  const px = pxOf(c, X0, Y0), ST = [4, 2, 1, 2];
  for (let y = wl; y < H; y++) {
    const k = y - wl, l = ST[k % 4], r = W - 1 - ST[(k + 1) % 4];
    px(k === 0 ? mix9(N, A, 0.3) : N, l, y, r - l + 1, 1);
  }
  for (let x = 1; x < W - 1; x++) {                                    // пена по краям того, что входит в воду
    const a = P.at(x, wl - 1), l = P.at(x - 1, wl - 1), r = P.at(x + 1, wl - 1);
    if (a && !l) px(B, x - 1, wl, 1, 1);
    if (a && !r) px(B, x + 1, wl, 1, 1);
  }
  for (const [x, y, w] of ripple) px(y ? A : mix9(N, B, 0.55), x, wl + y, w, 1);
}
// нефтяная платформа (набором): полупогружная — понтоны под водой, ватерлиния посередине колонн,
// три видимые колонны со связями; палуба под снегом; жилой блок с вертолётной площадкой кольцом;
// вышка в ветрозащитной обшивке, выше — открытые фермы и кронблок; модуль; на стреле, вынесенной
// за кромку палубы, факел — горит ровно. Держится на якорях: цепи от клюзов внешних колонн.
const RIG_WL = 72;
const rigBody = kit(84, 76, P => {
  for (const x of [10, 36, 62]) P.box(x, 54, 8, 22, MAT.PLATE, FORM.CYL);
  P.box(18, 68, 44, 2, MAT.STEEL);
  P.box(2, 50, 74, 4, MAT.STEEL);
  P.box(4, 37, 24, 13, MAT.PLATE);
  for (const y of [40, 44]) P.cut(6, y, 20, 2, MAT.GLASS);
  P.box(2, 34, 28, 3, MAT.STEEL).shade(-1);                            // вертолётная площадка
  P.trap(36, 52, 39, 49, 22, 49, MAT.IRON);                            // вышка в обшивке
  P.box(56, 42, 12, 8, MAT.CONCRETE);
}, { seed: 251, snow: 0.45, drips: [[12, 56, 8], [38, 58, 10], [64, 57, 7]] }, (c, X0, Y0, P) => {
  const px = pxOf(c, X0, Y0), ST = tone(MAT.STEEL, 3);
  hline(c, ST, X0 + 18, Y0 + 67, X0 + 35, Y0 + 56); hline(c, ST, X0 + 61, Y0 + 67, X0 + 44, Y0 + 56);   // раскосы
  hline(c, ST, X0 + 39, Y0 + 21, X0 + 42, Y0 + 9); hline(c, ST, X0 + 49, Y0 + 21, X0 + 46, Y0 + 9);  // открытые фермы
  px(ST, 40, 15, 8, 1); px(B, 40, 6, 8, 3); px(A, 43, 4, 2, 2);        // кронблок
  px(tone(MAT.STEEL, 5), 9, 35, 14, 1); px(N, 13, 35, 6, 1);           // кольцо площадки
  // стрела факела: две нитки с решёткой зигзагом, положе, за кромку палубы
  const BM = tone(MAT.PLATE, 3);
  hline(c, BM, X0 + 62, Y0 + 42, X0 + 78, Y0 + 19); hline(c, BM, X0 + 64, Y0 + 42, X0 + 80, Y0 + 19);
  for (let k = 0; k < 7; k++) { const y = 41 - k * 3, x = 62 + Math.round((41 - y) * 16 / 23); px(tone(MAT.PLATE, 4), x + (k & 1 ? 2 : 0), y, 1, 1); px(tone(MAT.PLATE, 4), x + 1, y - 1, 1, 1); }
  // якорные цепи: от клюзов внешних колонн наружу и вниз, в воду
  hline(c, A, X0 + 10, Y0 + 62, X0 + 5, Y0 + RIG_WL - 1); hline(c, A, X0 + 69, Y0 + 62, X0 + 78, Y0 + RIG_WL - 1);
  sea(c, X0, Y0, P, RIG_WL, 84, 76, [[24, 0, 5], [50, 0, 4], [8, 2, 4], [30, 1, 5], [56, 2, 4], [72, 1, 3]]);
});
function rigLive(c, x, gy, t) {
  const X0 = Math.round(x) - 42, Y0 = Math.round(gy) - 76, f = (((t | 0) >> 4) % 6 === 0) ? 1 : 0;
  R(c, C, X0 + 78, Y0 + 14, 3, 5); R(c, C, X0 + 78 + f, Y0 + 11, 2, 3); R(c, C, X0 + 79 - f, Y0 + 9, 1, 2);
}
const rig = split(rigBody, rigLive);
// платформа #2 (набором): жилая, «гостиница на ногах» с пятью колоннами (тип «Пентагон»). В тот
// вечер колонна D отломилась, и платформа легла на бок: весь набор — палуба, жилые блоки,
// вертолётная площадка, кран, вышка — повёрнут на 22°, колонны перпендикулярно палубе уходят в воду
// наклонно; две целые видны, третья — за ними; на месте колонны D — обломок. Опущенный край
// палубы с краном ушёл под ватерлинию, у входа в воду — пена. Вышка — допущение: примета нефти
// (на жилой не бурят).
const RIG2_WL = 72, TH = 22 * Math.PI / 180;
const rot = ([x, y]) => [40 + (x - 40) * Math.cos(TH) - (y - 50) * Math.sin(TH), 50 + (x - 40) * Math.sin(TH) + (y - 50) * Math.cos(TH) + 14];
const rbox = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(rot);
const rig2 = kit(84, 76, P => {
  P.poly(rbox(24, 48, 6, 26), MAT.PLATE).shade(2);                     // третья колонна — за ближними
  for (const x of [10, 38]) P.poly(rbox(x, 48, 8, 26), MAT.PLATE);
  P.poly([[62, 48], [70, 48], [70, 53], [67, 56], [65, 52], [62, 55]].map(rot), MAT.PLATE);   // обломок D
  P.poly(rbox(4, 44, 72, 4), MAT.STEEL);                               // палуба
  P.poly(rbox(6, 26, 30, 18), MAT.CONCRETE).shade(-2);                 // жилые блоки, светлые
  P.poly(rbox(46, 32, 18, 12), MAT.CONCRETE).shade(-1);
  P.poly(rbox(4, 23, 34, 3), MAT.STEEL).shade(1);                      // вертолётная площадка
  P.poly(rbox(66, 28, 4, 16), MAT.STEEL);                              // кран
  for (const [x0, y0, n, rows] of [[9, 29, 7, 3], [49, 35, 4, 2]]) for (let r = 0; r < rows; r++) for (let k = 0; k < n; k++) {
    const [x, y] = rot([x0 + k * 4, y0 + r * 5]); P.cut(Math.round(x), Math.round(y), 2, 2);   // окна рядами вдоль крена
  }
}, { seed: 253, chip: 0.03 }, (c, X0, Y0, P) => {
  const ln = (col, a, b) => { const [x0, y0] = rot(a), [x1, y1] = rot(b); line(c, col, X0 + Math.round(x0), Y0 + Math.round(y0), X0 + Math.round(x1), Y0 + Math.round(y1)); };
  const ST = tone(MAT.STEEL, 3);
  // вышка открытой решёткой между блоками, с тем же креном
  ln(ST, [38, 44], [40, 16]); ln(ST, [45, 44], [43, 16]); ln(ST, [40, 16], [43, 16]);
  for (let y = 40; y > 18; y -= 6) { ln(ST, [38.5 + (44 - y) / 14, y], [44.5 - (44 - y) / 14, y - 6]); ln(ST, [38.5, y], [44.5, y]); }
  ln(ST, [70, 28], [79, 35]); ln(A, [79, 35], [79, 41]);               // стрела крана, гак
  sea(c, X0, Y0, P, RIG2_WL, 84, 76, [[30, 0, 4], [6, 2, 4], [22, 1, 5], [52, 2, 5], [66, 1, 3]]);
});
// мебельный ангар (набором): глухой длинный короб в гофре под снегом; по кромке пояс — был
// жёлтым, выцвел до кости. В витрине под лампой один собранный стул, под ним на полу пятно света.
// Вход под козырьком, на стекле двери — инструкция без слов: человечек. Пилон выше короба
// с такой же панелью без слов. У стены — исполинский шестигранный ключ углом (допущение: ключ —
// гипербола); плоские коробки штабелем ровно — длинные, тонкие, со скотчем.
const warehouse = kit(96, 64, P => {
  P.box(14, 28, 72, 36, MAT.IRON);
  P.box(13, 26, 74, 2, MAT.IRON).shade(1);
  P.cut(44, 38, 18, 16);
  P.cut(66, 46, 8, 18, MAT.GLASS);
  P.box(64, 45, 12, 1, MAT.STEEL);
  P.box(90, 8, 2, 56, MAT.STEEL);
  P.box(86, 0, 10, 9, MAT.STEEL).shade(-1);
  for (let k = 0; k < 4; k++) P.box(1 + (k === 2 ? 1 : 0), 60 - k * 3, 17, 3, MAT.PLASTER).shade(k & 1 ? -1 : 0);   // коробки
  P.box(19, 30, 3, 31, MAT.STEEL); P.box(19, 58, 12, 3, MAT.STEEL);   // ключ: длинное плечо стоймя, короткое на земле
}, { seed: 257, snow: 0.7 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0);
  px(mix9(B, S, 0.1), 14, 29, 72, 3); px(mix9(B, S, 0.3), 14, 32, 72, 1);   // пояс выцвел до кости
  px(mix9(B, S, 0.2), 87, 1, 8, 7);                                    // панель без слов
  // стул под лампой, под ним на полу пятно света
  px(B, 52, 38, 2, 1); px(mix9(N, B, 0.35), 48, 53, 10, 1);
  px(A, 50, 48, 5, 1); px(A, 54, 43, 1, 5); px(A, 50, 49, 1, 4); px(A, 54, 49, 1, 4);
  // инструкция на стекле двери: лист, человечек, деталь
  px(mix9(B, S, 0.15), 67, 49, 7, 5);
  px(N, 69, 50, 1, 1); px(N, 69, 51, 1, 2); px(N, 68, 51, 3, 1); px(N, 68, 53, 1, 1); px(N, 70, 53, 1, 1); px(A, 72, 51, 1, 2);
  // ключ: светлая грань-фаска, торец короткого плеча со срезанными углами
  px(tone(MAT.STEEL, 5), 19, 30, 1, 28); px(tone(MAT.STEEL, 5), 22, 58, 9, 1);
  px(tone(MAT.STEEL, 1), 31, 59, 1, 1); px(N, 31, 58, 1, 1); px(N, 31, 60, 1, 1);
  // коробки: тёмная кромка, скотч, ярлык
  for (let k = 0; k < 4; k++) { const x = 1 + (k === 2 ? 1 : 0), y = 60 - k * 3; px(N, x, y + 2, 17, 1); px(mix9(B, S, 0.25), x + 7, y, 2, 2); if (k & 1) px(B, x + 12, y, 3, 1); }
});

// домик Хёвди (набором): белый деревянный дом у воды в обшивке, вальма под снегом, мезонин
// с фронтоном и чердачным окном, трубы; два этажа окон, свет в одном — в раме, с переплётом.
// Перед домом два флагштока — без флагов. За флагштоками — вода залива.
function hofdiBuild(P) {
  P.box(20, 40, 50, 34, MAT.CLAPBOARD).shade(-1);
  P.trap(16, 74, 22, 68, 30, 39, MAT.SLATE);
  P.box(36, 22, 20, 18, MAT.CLAPBOARD).shade(-1);
  P.poly([[35, 23], [46, 12], [57, 23]], MAT.SLATE);                  // фронтон: скаты шифером
  P.poly([[38, 22], [46, 14], [54, 22]], MAT.CLAPBOARD);
  P.cut(45, 17, 2, 3);                                                 // чердачное окно
  P.box(28, 24, 3, 7, MAT.BRICK); P.box(61, 24, 3, 7, MAT.BRICK);
  for (const x of [24, 32, 43, 54, 62]) { P.cut(x, 44, 5, 8); P.cut(x, 57, 5, 8); }
  P.cut(42, 26, 3, 7); P.cut(47, 26, 3, 7);
  P.cut(43, 61, 6, 13);
  P.box(40, 59, 12, 1, MAT.CLAPBOARD).shade(-1);
}
function hofdiOver(c, X0, Y0) {
  const px = pxOf(c, X0, Y0);
  px(mix9(B, S, 0.2), 55, 45, 3, 6); px(N, 56, 45, 1, 6); px(N, 55, 48, 3, 1);   // свет в одном окне — холодный, в раме
  px(mix9(B, S, 0.08), 54, 52, 5, 1);                                  // отсвет под подоконником
  for (const x of [4, 11]) { px(A, x, 2, 1, 72); px(B, x - 1, 0, 3, 2); px(tone(MAT.ASHLAR, 2), x - 1, 71, 3, 2); }   // флагштоки
  px(B, 71, 71, 4, 2); px(A, 72, 70, 2, 1);                            // сугроб
}
const hofdi = kit(76, 74, P => {
  P.box(0, 68, 18, 2, MAT.GLASS); P.box(2, 70, 14, 1, MAT.GLASS);     // залив за флагштоками, у земли
  hofdiBuild(P);
}, { seed: 263, snow: 0.6 }, hofdiOver);
// домик Хёвди #2 (набором): тот же дом; за ним, дальше, в гавани — теплоход, на котором ночевала
// одна из делегаций: корпус уходит за дом, надстройка и труба — между флагштоками.
const hofdi2 = kit(76, 74, P => {
  P.box(0, 53, 20, 5, MAT.GLASS);                                      // гавань
  P.poly([[0, 47], [28, 47], [26, 53], [0, 53]], MAT.PLATE);
  P.box(5, 43, 6, 4, MAT.STEEL); P.box(7, 38, 2, 5, MAT.STEEL).shade(1);
  hofdiBuild(P);
}, { seed: 269, snow: 0.6 }, (c, X0, Y0) => {
  hofdiOver(c, X0, Y0);
  const px = pxOf(c, X0, Y0);
  px(tone(MAT.GLASS, 1), 6, 44, 4, 1); px(N, 7, 38, 2, 1);             // окна надстройки лентой, обрез трубы
  px(tone(MAT.PLATE, 4), 0, 49, 20, 1);
});

// ── РАВНИНА (набором) ────────────────────────────────────────────────
// панельная девятиэтажка (набором): торец и фасад из панелей; швы промазаны, потом ещё раз —
// серым поверх серого; окна сеткой, первый этаж глухой — подъезды под козырьками; балконы двумя
// стояками. Антенны-«ёлочки» на крыше все смотрят в одну сторону. Горит одна кухня, на шестом.
const PAN_F = Array.from({ length: 8 }, (_, f) => 15 + f * 8);         // этажи 9…2 сверху вниз
function panelBuild(P) {
  P.box(2, 12, 12, 75, MAT.PANEL).shade(1);
  P.box(14, 12, 60, 75, MAT.PANEL);
  P.box(1, 11, 74, 1, MAT.PANEL).shade(-1);
  P.box(44, 6, 10, 5, MAT.PANEL).shade(1);                             // машинное
  for (const y of PAN_F) for (let k = 0; k < 8; k++) if (k !== 2 && k !== 6) P.cut(16 + k * 7, y, 4, 4);
  for (const bx of [29, 57]) for (const y of PAN_F) { P.cut(bx + 1, y - 1, 7, 3); P.box(bx, y + 2, 9, 3, MAT.PANEL).shade(-1); }   // лоджии: проём и экран ограждения
  for (const x of [20, 48]) { P.cut(x, 70, 5, 17); P.box(x - 2, 68, 9, 1, MAT.CONCRETE); }
}
function panelOver(c, X0, Y0, P, caulked) {
  const px = pxOf(c, X0, Y0), SEAM = tone(MAT.PANEL, 0), CK = tone(MAT.PANEL, 3), CK2 = tone(MAT.PANEL, 1);
  for (let y = 19; y < 86; y += 8) for (let x = 2; x < 74; x++) if (P.at(x, y) === MAT.PANEL) px(SEAM, x, y);
  for (let x = 8; x < 74; x += 14) for (let y = 12; y < 86; y++) if (P.at(x, y) === MAT.PANEL) px(SEAM, x, y);
  if (caulked) {                                                        // промазано, потом ещё раз — пятнами поверх
    for (let y = 19; y < 86; y += 8) for (let x = 2; x < 74; x++) if (P.at(x, y) === MAT.PANEL && noise(x >> 2, y, 31) < 0.7) px(noise(x >> 1, y, 33) < 0.5 ? CK : CK2, x, y);
    for (let x = 8; x < 74; x += 14) for (let y = 12; y < 86; y++) if (P.at(x, y) === MAT.PANEL && noise(x, y >> 2, 35) < 0.7) px(noise(x, y >> 1, 37) < 0.5 ? CK : CK2, x, y);
  } else {                                                              // не промазано ни разу: в швах трава
    for (let i = 0; i < 26; i++) { const y = 19 + 8 * Math.floor(noise(i, 1, 39) * 8), x = 3 + Math.floor(noise(i, 2, 39) * 70); if (P.at(x, y) === MAT.PANEL) { px(tone(MAT.MOSS, 2), x, y - 1, 1, 1); px(tone(MAT.MOSS, 3), x + 1, y - 2, 1, 2); } }
  }
  // антенны-«ёлочки»: мачта, штанга в одну сторону, вибраторы
  for (const ax of [20, 62]) { px(A, ax, 0, 1, 11); px(A, ax, 3, 9, 1); for (const d of [2, 4, 6, 8]) px(A, ax + d, 1 + (d >> 2), 1, 5 - (d >> 2) * 2 + 1); }
}
const panel = kit(76, 87, panelBuild, { seed: 271, chip: 0.01 }, (c, X0, Y0, P) => {
  panelOver(c, X0, Y0, P, true);
  R(c, C, X0 + 23, Y0 + PAN_F[3], 4, 4);                                // кухня на шестом
});
const panel2 = kit(76, 87, panelBuild, { seed: 277, chip: 0.02, moss: 0.05 }, (c, X0, Y0, P) => panelOver(c, X0, Y0, P, false));

// кочегарка «Камчатка» (набором): кирпичный полуподвал — ступени вниз к двери, перила приямка,
// журнал смен на гвозде; окно топки у самой земли, уголь кучей; кирпичная труба с оголовком.
// На ребре крыши кот. Рядом забор из бетонных плит — надпись штрихами; трансформаторная будка
// «не влезай».
const boilerBody = kit(96, 58, P => {
  P.box(20, 3, 4, 30, MAT.BRICK, FORM.CYL); P.box(19, 2, 6, 2, MAT.BRICK).shade(-1);
  P.box(0, 33, 34, 25, MAT.BRICK);
  P.box(0, 32, 34, 1, MAT.CONCRETE).shade(-1);
  P.cut(4, 37, 4, 4, MAT.GLASS); P.cut(11, 37, 4, 4, MAT.GLASS);
  P.cut(25, 40, 6, 18);
  P.cut(4, 54, 5, 3);                                                   // окно топки
  P.round(15, 50, 57, 10, MAT.BASALT);                                  // уголь
  P.box(37, 43, 40, 15, MAT.CONCRETE);
  P.box(80, 27, 16, 31, MAT.CONCRETE); P.box(79, 26, 17, 2, MAT.CONCRETE).shade(-1);
  P.box(83, 33, 10, 25, MAT.IRON);
}, { seed: 281, chip: 0.02, drips: [[22, 33, 6], [86, 28, 5]] }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), D = tone(MAT.DARK, 2);
  px(A, 29, 51, 3, 1); px(A, 27, 53, 3, 1); px(A, 25, 55, 3, 1);       // ступени вниз
  px(A, 23, 49, 11, 1); px(A, 23, 49, 1, 8); px(A, 33, 49, 1, 8);      // перила приямка
  px(LEAF, 32, 43, 1, 2);                                              // журнал смен
  px(D, 6, 28, 6, 4); px(D, 5, 25, 4, 3); px(A, 5, 24, 1, 1); px(A, 8, 24, 1, 1); px(D, 12, 31, 1, 5);   // кот, хвост по стене
  for (const x of [50, 63]) px(tone(MAT.CONCRETE, 0), x, 43, 1, 15);  // швы плит
  for (let i = 0; i < 6; i++) {                                        // два слова по три знака — штрихами
    const gx = 40 + i * 5 + (i > 2 ? 4 : 0), hh = [5, 4, 5, 5, 3, 5][i], top = 52 - hh;
    px(B, gx + (i % 2), top, 1, 1); px(B, gx, top + 1, 2, hh - 1);
  }
  px(B, 39, 53, 35, 1); px(B, 75, 47, 1, 4); px(B, 75, 53, 1, 1);
  px(B, 86, 30, 4, 3); px(K, 87, 31, 2, 1);                            // «не влезай»
});
function boilerLive(c, x, gy, t) {
  const X0 = Math.round(x) - 48, Y0 = Math.round(gy) - 58;
  R(c, ((t | 0) >> 4) % 7 ? C : S, X0 + 5, Y0 + 55, 3, 2);           // в топке
}
const boiler = split(boilerBody, boilerLive);

// ───────────────────────── ДОМИНАНТА · РАВНИНА ─────────────────────────
// Останкинская башня (набором): бетон светлый; основание — усечённый конус на ногах, между ними
// арки, в середине остеклённое лобби; ствол сужается, пояса техэтажей; ресторан — обод в три
// этажа, лента стекла, пол вращается (переплёт ползёт); выше стальная антенна с полосами.
// Заградительные огни киноварью, верхний мигает.
const ostBody = kit(72, 200, P => {
  P.trap(14, 57, 31, 41, 174, 199, MAT.CONCRETE).shade(-1);
  for (const [x, h] of [[18, 12], [25, 17], [42, 17], [49, 12]]) rarch(P, x, 200, 5, h);
  P.cut(33, 186, 6, 14, MAT.GLASS);
  P.trap(31, 41, 34, 38, 57, 173, MAT.CONCRETE, FORM.CYL).shade(-1);
  P.box(29, 144, 14, 2, MAT.CONCRETE).shade(-2); P.box(31, 98, 10, 2, MAT.CONCRETE).shade(-2);
  P.box(28, 73, 16, 9, MAT.CONCRETE, FORM.CYL).shade(-2);
  P.cut(29, 76, 14, 3, MAT.GLASS);
  P.box(34, 30, 4, 27, MAT.STEEL); P.box(35, 8, 2, 22, MAT.STEEL); P.box(35, 1, 1, 7, MAT.STEEL);
  for (const y of [32, 44]) P.box(33, y, 6, 1, MAT.STEEL);
}, { seed: 283, chip: 0.01 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0);
  for (const y of [12, 20, 28]) px(K, 35, y, 2, 2);                    // полосы антенны
  px(K, 27, 77, 1, 1); px(K, 44, 77, 1, 1); px(K, 33, 44, 1, 1); px(K, 38, 44, 1, 1);
  px(MIST, 32, 77, 2, 1);                                               // в окне — отсвет экрана
});
function ostLive(c, x, gy, t) {
  const X0 = Math.round(x) - 36, Y0 = Math.round(gy) - 200, s = ((t | 0) / 150 | 0) % 4;
  for (let k = 0; k < 4; k++) R(c, tone(MAT.CONCRETE, 4), X0 + 29 + ((k * 4 + s) % 14), Y0 + 76, 1, 3);   // пол ресторана вращается
  if (((t | 0) >> 4) % 3) R(c, K, X0 + 34, Y0 + 1, 3, 1);
  R(c, K, X0 + 35, Y0 + 0, 1, 2);
}
const ostankino = split(ostBody, ostLive);

// ── ФАСАДЫ ТАБЛИЧЕК 18×30 (набором) ──
// юг: плоская крыша, солнечный водонагреватель, маркиза в полоску, витрина дьюти-фри с флаконами
const signSouth = signKit(P => {
  P.box(1, 8, 16, 22, MAT.PLASTER);
  P.box(0, 7, 18, 1, MAT.PLASTER).shade(-1);
  P.poly([[1, 6], [10, 1], [11, 2], [2, 7]], MAT.GLASS);
  P.box(10, 0, 7, 3, MAT.IRON);
  P.cut(10, 9, 6, 3);
  P.cut(3, 12, 5, 18);
  P.cut(10, 18, 6, 7, MAT.GLASS);
}, { seed: 287, chip: 0.03 }, px => {
  px(A, 11, 3, 1, 4); px(A, 15, 3, 1, 4); px(A, 10, 10, 6, 1);
  px(B, 9, 14, 9, 3); for (const x of [11, 15]) px(K, x, 14, 2, 3);
  px(LEAF, 11, 21, 1, 3); px(B, 13, 19, 1, 6); px(LEAF, 15, 21, 1, 3); px(mix9(B, S, 0.3), 10, 25, 6, 1);
});
// восток: лавка за полуопущенной ставней, вертикальная вывеска — одна трубка живая, кондиционер, бельё
const signEastBody = signKit(P => {
  P.box(4, 2, 14, 28, MAT.CONCRETE);
  P.cut(7, 4, 6, 3, MAT.GLASS);
  P.cut(6, 12, 11, 18);
  P.box(6, 12, 11, 7, MAT.IRON);
  P.box(0, 4, 4, 15, MAT.BOARD).shade(1);
}, { seed: 293, drips: [[10, 3, 6]] }, px => {
  px(tone(MAT.IRON, 4), 7, 8, 4, 2); px(A, 13, 5, 4, 1); px(LEAF, 14, 6, 2, 2);
  px(K, 1, 5, 1, 6); px(A, 1, 12, 1, 6);
  px(B, 5, 11, 13, 1);
});
const signEast = (c, X, G, t) => { signEastBody(c, X, G); if ((t | 0) % 331 > 7) R(c, K, Math.round(X) - 8, Math.round(G) - 18, 1, 6); };
// запад: ломбард — мёртвая трубка петлёй на вывеске, в витрине кольцо на подносе; три шара на
// длинном кронштейне треугольником — качаются целиком
const signWestBody = signKit(P => {
  P.box(0, 3, 14, 27, MAT.BRICK);
  P.cut(2, 4, 4, 3, MAT.GLASS); P.cut(8, 4, 4, 3, MAT.GLASS);
  P.box(0, 7, 14, 4, MAT.BOARD).shade(1);
  P.cut(1, 14, 7, 11, MAT.GLASS); P.cut(9, 12, 4, 18);
}, { seed: 307, chip: 0.03 }, px => {
  px(A, 2, 8, 4, 1); px(A, 2, 10, 4, 1); px(A, 2, 9, 1, 1); px(A, 5, 9, 1, 1); px(A, 6, 10, 6, 1);
  px(A, 2, 23, 5, 1); px(B, 4, 22, 1, 1);
  px(A, 11, 6, 7, 1);
});
function signWest(c, X, G) {
  signWestBody(c, X, G);
  const L = Math.round(X) - 9, g = Math.round(G);
  const pb = hang(`pawn:${L}:${g}`, L + 14.5, g - 23, 5, { sail: 0.03, damp: 0.995, gy: g, r: 4 });
  const s = Math.sin(angleOf(pb)), sh = d => Math.round(s * d);
  R(c, A, L + 14 + sh(1), g - 23, 1, 2);
  R(c, LEAF, L + 11 + sh(3.5), g - 21, 3, 3); R(c, LEAF, L + 15 + sh(3.5), g - 21, 3, 3); R(c, LEAF, L + 13 + sh(7.5), g - 17, 3, 3);
}
// север: вахтовый барак — прямой скат под снегом, иллюминатор кольцом, короб вентиляции, прожектор
const signNorth = signKit(P => {
  P.box(1, 7, 16, 23, MAT.IRON);
  P.wedge(9, 0, 6, 4, 18, MAT.IRON);
  P.box(13, 0, 2, 4, MAT.STEEL);
  P.cut(3, 12, 5, 18);
  P.cut(11, 12, 4, 4, MAT.GLASS);
  P.box(11, 22, 5, 4, MAT.CONCRETE);
}, { seed: 311, snow: 0.7 }, px => {
  px(A, 11, 11, 4, 1); px(A, 11, 16, 4, 1); px(A, 10, 12, 1, 4); px(A, 15, 12, 1, 4); px(B, 12, 13, 1, 1);
  px(A, 16, 8, 2, 1); px(B, 16, 9, 2, 2);
  px(B, 3, 7, 1, 2); px(B, 14, 7, 1, 3);
  px(B, 0, 28, 3, 2); px(B, 15, 28, 3, 2);
});

// ── УТВАРЬ ДВОРОВ ───────────────────────────────────────────────────
// Трафарет: строки сверху вниз, символ — краска из PAL, '.' — пусто; низ
// стоит на земле gy, середина — на x. Собирается в прямоугольники один раз:
// одинаковые отрезки соседних строк склеиваются по вертикали.
const PAL = {
  N, B: BONE, A: ASH, M: MIST, C: CANDLE, K: CIN, S: SEP, 1: DARK, w: WOOD, W: WOOD2,
  s: STONE, t: STONE2, x: BRICK, c: CONC, p: PAPER, P: PAPER2,
};
const STAMPS = new Map();
function stamp(c, x, gy, art) {
  let rs = STAMPS.get(art);
  if (!rs) {
    rs = []; let open = new Map();
    art.forEach((row, y) => {
      const next = new Map();
      for (let i = 0; i < row.length;) {
        const ch = row[i];
        if (ch === '.') { i++; continue; }
        let e = i; while (e < row.length && row[e] === ch) e++;
        const k = ch + ',' + i + ',' + e, r = open.get(k);
        if (r) { r[4]++; next.set(k, r); } else { const nr = [PAL[ch], i, y, e - i, 1]; rs.push(nr); next.set(k, nr); }
        i = e;
      }
      open = next;
    });
    STAMPS.set(art, rs);
  }
  const L = Math.round(x - art[0].length / 2), T = Math.round(gy) - art.length;
  for (const [col, rx, ry, rw, rh] of rs) { c.fillStyle = col; c.fillRect(L + rx, T + ry, rw, rh); }
}
// вещь по трафарету: пустые края по бокам срезаются, w×h — по рисунку
function art(name, rows) {
  let lo = Infinity, hi = -1;
  for (const r of rows) for (let i = 0; i < r.length; i++) if (r[i] !== '.') { lo = Math.min(lo, i); hi = Math.max(hi, i); }
  const t = rows.map(r => r.slice(lo, hi + 1));
  return { name, w: t[0].length, h: t.length, draw: (c, x, gy) => stamp(c, x, gy, t) };
}

// юг — корниш: столик кафе на двоих, гирлянда мёртвых лампочек, мотороллер
const CAFE_TABLE = [
  '........pp........',
  'A.....BBBBBB.....A',
  'A.......1........A',
  'A.......1........A',
  'AAAA....1.....AAAA',
  'A..A....1.....A..A',
  'A..A....1.....A..A',
  'A..A...111....A..A',
];
const GARLAND = [
  'A............................A',
  'AA..........................AA',
  'A.AA......................AA.A',
  'A...A....................A...A',
  'A...PAAA..............AAAP...A',
  'A...P..PAAA........AAAP..P...A',
  'A......P..PAAAAAAAAP..P......A',
  'A.........P...P..P...P.......A',
  'A..............P.............A',
  'A............................A',
  'A............................A',
  'A............................A',
  'A............................A',
  'A............................A',
  'A............................A',
  'AA..........................AA',
];
const SCOOTER = [
  '.AA.............',
  '.AAA............',
  '..PA............',
  '..PP.......111..',
  '..PP....1111111.',
  '..PP...PPPPPPPPP',
  '.PPPPPPPPPPPPPPP',
  '.PPP.....PPPPPPA',
  '.AAA......AAA...',
  'A1N1A....A1N1A..',
  '.AAA......AAA...',
];
// восток — соты: автомат с напитками, бельё на бамбуке, лоток-ятай с фонарём
const VENDING = [
  'AAAAAAAA1',
  'APPPPPPP1',
  'APNPNPNP1',
  'APNPNPNP1',
  'APPPPPPP1',
  'APNPNPNP1',
  'APNPNPNP1',
  'APPPPPPP1',
  'AsssssKs1',
  'Asssss1s1',
  'Asssssss1',
  'As11111s1',
  'Asssssss1',
  'Asssssss1',
  'Asssssss1',
  'Asssssss1',
  'Asssssss1',
  '111111111',
];
const LAUNDRY = [
  'A......................A',
  'PPPPPPPPPPPPPPPPPPPPPPPP',
  'A.pppppp..MMMMM..BBBB..A',
  'A.pppppp..MMMMM..BBBB..A',
  'A..pppp...MM.MM..BBBB..A',
  'A..pppp...MM.MM..BBBB..A',
  'A..pppp...MM.MM..BBBB..A',
  'A..pppp...MM.MM........A',
  'A.........MM.MM........A',
  'A......................A',
  'A......................A',
  'A......................A',
  'A......................A',
  'A......................A',
  'A......................A',
  'A......................A',
  'A......................A',
  'A......................A',
  'A......................A',
  'AA....................AA',
];
const YATAI = [
  'AAAAAAAAAAAAAAAAAAAAA.',
  'WWWWWWWWWWWWWWWWWWWWWW',
  '.A.PPP.PPP.PPP....A.A.',
  '.A.PPP.PPP.PPP....AKKK',
  '.A.PPP.PPP.PPP....AKCK',
  '.A................AKKK',
  '.A................A.A.',
  '.A................A...',
  '.A................A...',
  'AAAAAAAAAAAAAAAAAAAA..',
  'WWWWWWWWWWWWWWWWWWWW..',
  'WWWWWWWWWWWWWWWWWWWW..',
  'WWWWWWWWWWWWWWWWWWWW..',
  'WWWWWWWWWWWWWWWWWWWW..',
  'WWWWWWWWWWWWWWWWWWWW..',
  '..AAA..........AAA....',
  '.A1N1A........A1N1A...',
  '..AAA..........AAA....',
];
// запад — закрытый праздник: тележка попкорна, машинка автодрома, остов
// машины с плавниками
const POPCORN = [
  '......A.......',
  '....KKKKK.....',
  '..KKKKKKKKK...',
  '.BBBBBBBBBBB..',
  '.A.........A..',
  '.A.AAAAAAA.A..',
  '.A.A11111A.A..',
  '.A.ApppppA.A..',
  '.A.ApppppA.A..',
  '.AAAAAAAAAAA..',
  '.WWWWWWWWWWW..',
  '.WWWWWWWWWWWAA',
  '.WWWWWWWWWWW..',
  '.WWWWWWWWWWW..',
  '.AAAAAAAAAAA..',
  '...A.....AAA..',
  '...A....A1N1A.',
  '...A....A1N1A.',
  '..AAA....AAA..',
];
const BUMPER = [
  '..........AAA...',
  '...........A....',
  '...........A....',
  '...........A....',
  '...........A....',
  '...........A....',
  '...........A....',
  '...........A....',
  '...........A....',
  '...A.......A....',
  '..AAA....KKKK...',
  '...A.....KKKK...',
  '.KKKKKKKKKKKKK..',
  'KKKKKKKKKKKKKKK.',
  'KKKKKKKKKKKKKKK.',
  '111111111111111.',
  '111111111111111.',
];
const FINS = [
  '..........AAAAAAAA..............',
  '.........A1111111A..............',
  '........A11111111A............A.',
  '..PPPPPPPPPPPPPPPPPPPPPPPPPPPPPA',
  '.PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPK',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'PPPP111PPPPPPPPPPPPP111PPPPPPPP.',
  '.PP11111PPPPPPPPPPP11111PPPPPP..',
  '...11A11...........11A11........',
  '....111.............111.........',
];
// север — собери сам: тележка плоских коробок, демонстрационная доска,
// универсал под снегом
const FLATPACK = [
  '................AA',
  '.................A',
  'BBBBBBBBBBBBBB...A',
  'PPPPPPPPPPPPPS...A',
  'BBBBBBBBBBBBBB...A',
  'PPPPPPPPPPPPPS...A',
  'BBBBBBBBBBBBBB...A',
  'PPPPPPPPPPPPPS...A',
  'AAAAAAAAAAAAAAAAAA',
  '.A1A..........A1A.',
  '..A............A..',
];
const CHESS = [
  'AAAAAAAAAA',
  'ABBNNBBNNA',
  'ABBNNBBNNA',
  'ANNBBNNBBA',
  'ANNBBNNBBA',
  'ABBNNBBNNA',
  'ABBNNBBNNA',
  'ANNBBNNBBA',
  'ANNBBNNBBA',
  'AAAAAAAAAA',
  '.A......A.',
  '.A......A.',
  '.A......A.',
  '.A......A.',
  'A........A',
  'A........A',
  'A........A',
  'A........A',
];
const ESTATE = [
  '.......BBBBBBBBBBBBBBBBBBBB.',
  '.....A111111A1111111111111A.',
  '.....A111111A1111111111111A.',
  'BBBBBccccccccccccccccccccccc',
  'Accccccccccccccccccccccccccc',
  'AAcccccccccccccccccccccccccA',
  'cc11111cccccccccc11111cccccc',
  '..11A11..........11A11......',
  '...111............111.......',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBB',
];
// равнина — двор: гараж-«ракушка», лавочка у подъезда, ракета-горка
const SHELL = [
  '.......AAAAAAAAAAAAAAAAA',
  '.....AAcAcAcAcAcAcAcAcA1',
  '....AcAcAcAcAcAcAcAcAcA1',
  '...AccAcAcAcAcAcAcAcAcA1',
  '..AcccAcAcAcAcAcAcAcAcA1',
  '..AcccAcAcAcAcAcAcAcAcA1',
  '.AccccAcAcAcAcAcAcAcAcA1',
  '.AccccAcAcAcAcAcAcAcAcA1',
  'AcccccAcAcAcAcAcAcAcAcA1',
  'AcccccAcAcAcAcAcAcAcAcA1',
  'AcccccAcAcAcAcAcAcAcAcA1',
  '111111111111111111111111',
];
const BENCH = [
  'AAAAAAAAAAAAAAAAAA',
  'WWWWWWWWWWWWWWWWWW',
  '.c..............c.',
  'AAAAAAAAAAAAAAAAAA',
  'WWWWWWWWWWWWWWWWWW',
  '.cc............cc.',
  '.cc............cc.',
];
// ракета-горка из труб: нос киноварью, кольца, иллюминатор, стабилизаторы
function rocket(c, x, gy) {
  const L = Math.round(x) - 7, G = Math.round(gy);
  R(c, CIN, L + 6, G - 30, 2, 2); R(c, CIN, L + 5, G - 28, 4, 2); R(c, CIN, L + 4, G - 26, 6, 2);
  R(c, ASH, L + 3, G - 24, 8, 1); R(c, ASH, L + 3, G - 8, 8, 1);
  R(c, ASH, L + 3, G - 23, 1, 22); R(c, ASH, L + 10, G - 23, 1, 22);
  R(c, ASH, L + 5, G - 21, 4, 1); R(c, ASH, L + 5, G - 18, 4, 1); R(c, ASH, L + 5, G - 20, 1, 2); R(c, ASH, L + 8, G - 20, 1, 2);
  R(c, ASH, L + 4, G - 14, 6, 1); R(c, ASH, L + 4, G - 11, 6, 1);
  R(c, ASH, L + 2, G - 11, 1, 4); R(c, ASH, L + 1, G - 7, 1, 4); R(c, ASH, L, G - 3, 1, 3);
  R(c, ASH, L + 11, G - 11, 1, 4); R(c, ASH, L + 12, G - 7, 1, 4); R(c, ASH, L + 13, G - 3, 1, 3);
}

export const ARCH = {
  landmark: {
    name: 'Останкинская башня', side: 'plain', w: 72, h: 200,
    light: { dx: -1, dy: -199, r: 90, color: [194, 59, 43] },
    draw: ostankino,
    life: { blink: [[-5, -120, 'K', 23, 0.35]] },
  },
  south: [
    { name: 'отель-пластина', w: 96, h: 96, draw: hotel, draw2: hotel2, life: { birds: [[-17, -11, -89, 'K']] }, life2: { birds: [[-30, -24, -57]] } },
    { name: 'пляж «аренда солнца»', w: 76, h: 52, draw: beach },
    { name: 'кофейня Махфуза', w: 64, h: 62, life: { birds: [[-14, -8, -48]] }, draw: cafe, draw2: cafe2 },
  ],
  east: [
    { name: 'город-соты', w: 72, h: 96, life: { birds: [[-19, -16, -69]] }, draw: honeycomb, draw2: honey2, life2: { birds: [[0, 5, -73]] } },
    { name: 'капсульная башня', w: 46, h: 92, draw: capsules },
  ],
  west: [
    { name: 'колесо обозрения', w: 88, h: 92, life: { birds: [[4, 8, -79]] }, draw: wheel },
    { name: 'щит с ковбоями', w: 76, h: 72, draw: billboard, draw2: smoker, life: { blink: [[29, -57, 'S', 150, 0.12]], birds: [[-23, -17, -55]] } },
  ],
  north: [
    { name: 'нефтяная платформа', w: 84, h: 76, draw: rig, life: { smoke: [[38, -67]], birds: [[-38, -32, -41]] }, draw2: rig2, life2: {} },
    { name: 'мебельный ангар', w: 96, h: 64, life: { birds: [[-30, -22, -37]] }, draw: warehouse },
    { name: 'домик Хёвди', w: 76, h: 74, life: { birds: [[18, 21, -43]] }, draw: hofdi, draw2: hofdi2 },
  ],
  plain: [
    { name: 'панельная девятиэтажка', w: 76, h: 87, draw: panel, draw2: panel2, life: { birds: [[-17, -11, -75]] } },
    { name: 'кочегарка «Камчатка»', w: 96, h: 58, draw: boiler, life: { smoke: [[-27, -56]], birds: [[31, 40, -31]] } },
  ],
  sign: { south: signSouth, east: signEast, west: signWest, north: signNorth },
  props: {
    south: [art('столик кафе', CAFE_TABLE), art('гирлянда мёртвых лампочек', GARLAND), art('мотороллер', SCOOTER)],
    east: [art('автомат с напитками', VENDING), art('бельё на бамбуке', LAUNDRY), art('лоток-ятай', YATAI)],
    west: [art('тележка попкорна', POPCORN), art('машинка автодрома', BUMPER), art('остов машины с плавниками', FINS)],
    north: [art('тележка с коробками', FLATPACK), { ...art('демонстрационная доска', CHESS), unique: true }, art('универсал под снегом', ESTATE)],
    plain: [art('гараж-«ракушка»', SHELL), art('лавочка', BENCH), { name: 'ракета-горка', w: 14, h: 30, draw: rocket }],
  },
};
