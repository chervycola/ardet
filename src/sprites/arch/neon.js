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
import { phaseAt, skyAt } from '../../world/sky.js';
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
const night = t => skyAt(phaseAt(t || 0)).name !== 'день';
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
// отель-пластина (набором): бейрутский отель у моря начала 70-х — плита на столбах, балконы
// выносными плитами за обе грани — силуэт гребёнкой, между ними лоджии в ребрах брис-солей; ядро
// лестницы сбоку. Ярус выгорел: кромка обрушена, торец плиты отломан. Оспины на углу не
// заштукатурены. На крыше решётка вывески: из «HOLIDAY» висят пять плашек, одна — на одном болте.
// В одном окне натрий. Пальма.
const HOT_F = Array.from({ length: 9 }, (_, f) => 16 + f * 7);
const HOT_PLATES = [[25, 1], [32, 0], [39, 1], [46, 1], [53, 2], [60, 0], [67, 1]];   // 0 — выпала, 2 — на одном болте
const hotel = kit(96, 96, P => {
  P.box(80, 12, 10, 84, MAT.CONCRETE).shade(1);                       // ядро лестницы
  P.box(22, 16, 58, 62, MAT.CONCRETE);
  for (const y of HOT_F) {
    P.cut(24, y + 2, 54, 4);
    for (let x = 29; x < 78; x += 6) P.box(x, y + 2, 1, 4, MAT.CONCRETE);
    P.box(20, y, 62, 2, MAT.CONCRETE).shade(-1);                       // плита балкона
  }
  P.clear(40, HOT_F[5], 14, 1); P.clear(79, HOT_F[5], 3, 2);          // ярус выгорел: кромка, торец
  P.box(22, 78, 58, 18, MAT.DARK);                                     // вестибюль под плитой
  for (const x of [24, 40, 56, 72, 77]) P.box(x, 78, 2, 18, MAT.CONCRETE);
  P.cut(31, 80, 8, 16, MAT.GLASS);
}, { seed: 211, chip: 0.02, cracks: 2, drips: [[30, 74, 4], [61, 46, 6]] }, (c, X0, Y0, P) => {
  const px = pxOf(c, X0, Y0), ST = tone(MAT.STEEL, 3);
  pocks(px, 20, 22, 14, 52, 44, 7, (x, y) => P.at(x, y) === MAT.CONCRETE);          // угол в оспинах
  pocks(px, 80, 40, 10, 40, 14, 9, (x, y) => P.at(x, y) === MAT.CONCRETE);
  px(C, 58, HOT_F[3] + 3, 4, 2);                                                       // натрий
  // решётка вывески над крышей: рама и плашки, что не осыпались
  px(ST, 23, 15, 56, 1); px(ST, 23, 6, 56, 1);
  for (const x of [24, 50, 77]) px(ST, x, 6, 1, 9);
  for (const [x, k] of HOT_PLATES) {
    if (!k) continue;
    if (k === 2) { px(tone(MAT.STEEL, 5), x + 1, 9, 5, 7); px(N, x + 2, 11, 3, 1); continue; }   // висит углом
    px(tone(MAT.STEEL, 5), x, 7, 5, 7); px(tone(MAT.STEEL, 2), x + 4, 8, 1, 6);
  }
  palm(c, X0 + 5, Y0 + 95, 44);
});
// отель #2 (набором): другой отель того же берега — ниже, довоенный, штукатурка охрой, окна
// арками; тоже в оспинах, но поверх них во всю стену висит плакат: два слова штрихами — STOP
// SOLIDERE (так он и висел: хозяин не продаёт руину застройщику). Плакат выгорает. Пальма.
const hotel2 = kit(96, 96, P => {
  P.box(18, 36, 66, 60, MAT.OCHRE);
  P.box(16, 34, 70, 2, MAT.OCHRE).shade(-1);
  for (let f = 0; f < 4; f++) for (let i = 0; i < 8; i++) rarch(P, 21 + i * 8, 48 + f * 12, 4, 8);
  for (let i = 0; i < 5; i++) rarch(P, 22 + i * 13, 96, 8, 12);       // аркада низа
  P.clear(70, 34, 8, 3); P.clear(74, 37, 4, 2);                        // обломан угол парапета
}, { seed: 213, chip: 0.03, cracks: 3, drips: [[30, 37, 7], [58, 37, 5]] }, (c, X0, Y0, P) => {
  const px = pxOf(c, X0, Y0), CL = mix9(B, S, 0.12), CL2 = mix9(B, S, 0.3);
  pocks(px, 18, 38, 66, 44, 70, 13, (x, y) => P.at(x, y) === MAT.OCHRE);
  // плакат во всю стену: полотно, по верху выгорело, два слова штрихами
  px(CL, 24, 49, 54, 18); px(CL2, 24, 49, 54, 2); px(CL2, 24, 66, 54, 1);
  for (let i = 0; i < 12; i++) {
    const gx = 27 + i * 4 + (i > 3 ? 3 : 0), h = 8 - (noise(i, 4, 17) < 0.3 ? 1 : 0);
    px(K, gx, 54, 1, h); if (noise(i, 5, 17) < 0.6) px(K, gx + 1, 54 + (noise(i, 6, 17) < 0.5 ? 0 : h - 1), 2, 1);
    if (noise(i, 7, 17) < 0.4) px(K, gx + 2, 54, 1, h >> 1);
  }
  for (const x of [24, 77]) { px(A, x, 47, 1, 2); px(A, x, 67, 1, 3); }   // растяжки
  for (const [x, y] of [[71, 31], [75, 33], [73, 30]]) px(tone(MAT.IRON, 3), x, y, 1, 3);   // арматура из обломка
  palm(c, X0 + 6, Y0 + 95, 40);
});

// пляж «аренда солнца» (набором): будка проката под косым навесом, прейскурант выгорел, окошко,
// прилавок, приёмник. Над будкой на шесте солнце — луча вверх-вправо не хватает. Зонты: полосатый,
// выгоревший, третий сложен. Шезлонги пусты все. Песок.
const beach = kit(76, 52, P => {
  P.box(0, 48, 76, 4, MAT.SAND);
  P.box(2, 22, 18, 26, MAT.BOARD);
  P.poly([[0, 21], [23, 17], [23, 19], [0, 24]], MAT.IRON);
  P.box(5, 24, 12, 3, MAT.PLASTER).shade(-2);                         // прейскурант
  P.cut(5, 28, 12, 8);
  P.box(4, 36, 14, 1, MAT.BOARD).shade(-1);                           // прилавок
}, { seed: 217, chip: 0.03 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), SUN = mix9(B, S, 0.15), POLE = tone(MAT.STEEL, 3);
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
// над витриной доска с мёртвой трубкой-вязью (штрихи, не буквы). На крыше бак и тарелка. У входа
// столик: бирка, чашка — кофе долит, никого; кальян у двери кухни.
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
  px(A, 47, 3, 1, 10); px(A, 44, 1, 5, 1); px(A, 43, 2, 6, 2); px(A, 44, 4, 5, 1); px(B, 43, 2, 1, 2);   // тарелка
  // мёртвая трубка-вязь — штрихи
  px(A, 8, 41, 12, 1); px(A, 10, 39, 1, 2); px(A, 14, 38, 1, 3); px(A, 18, 40, 1, 1); px(A, 12, 42, 1, 1);
  px(C, 31, 45, 2, 3);                                                 // фонарь в арке
  // кальян у двери кухни
  px(A, 57, 58, 3, 4); px(A, 58, 53, 1, 5); px(B, 57, 52, 3, 1); px(tone(MAT.BOARD, 1), 60, 59, 2, 1);
  if (!table) return;
  px(A, 0, 54, 8, 1); px(A, 4, 55, 1, 6); px(A, 2, 61, 5, 1);         // столик у входа
  px(B, 1, 52, 2, 2);                                                  // бирка
  px(B, 6, 53, 2, 1);                                                  // чашка
  px(A, 9, 49, 1, 13); px(A, 9, 56, 4, 1); px(A, 12, 57, 1, 5);       // стул пуст
}
const cafeBody = kit(64, 62, cafeBuild, { seed: 219, chip: 0.02, drips: [[30, 15, 5], [52, 15, 6]] }, (c, X0, Y0, P) => cafeOver(c, X0, Y0, P, true));
function cafeLive(c, x, gy, t) {
  const X0 = Math.round(x) - 32, Y0 = Math.round(gy) - 62;
  if (((t | 0) >> 5) % 5 === 0) R(c, A, X0 + 7, Y0 + 51, 1, 1);      // над чашкой — пар
}
const cafe = split(cafeBody, cafeLive);
// кофейня #2 (набором): тот же дом; столик у входа пуст, бирки нет. За окном-витриной, у стекла,
// сидит старик и пишет — медленно: перо сдвигается редко.
const cafe2Body = kit(64, 62, cafeBuild, { seed: 223, chip: 0.02, drips: [[30, 15, 5]] }, (c, X0, Y0, P) => {
  cafeOver(c, X0, Y0, P, false);
  const px = pxOf(c, X0, Y0), F = N;
  px(mix9(B, S, 0.6), 8, 44, 12, 11);                                  // за стеклом светло — утро
  px(F, 14, 46, 3, 3); px(F, 13, 49, 5, 6);                           // старик: голова, плечи
  px(LEAF, 9, 52, 4, 1);                                               // лист на столе
  px(A, 8, 53, 10, 1); px(A, 8, 44, 12, 1);
});
function cafe2Live(c, x, gy, t) {
  const X0 = Math.round(x) - 32, Y0 = Math.round(gy) - 62, k = ((t | 0) / 90 | 0) % 3;
  R(c, N, X0 + 11 + k, Y0 + 51, 2, 1);                                 // рука с пером
  R(c, A, X0 + 10 + k, Y0 + 51, 1, 1);
}
const cafe2 = split(cafe2Body, cafe2Live);

// ── ВОСТОК (набором) ─────────────────────────────────────────────────
// город-соты (набором): Коулун — три блока впритык, у каждого свой материал и своя сетка окон,
// окна прорублены кто где, решётки-клетки поверх решёток, кондиционеры, бельё на шестах. На крышах
// будки, баки и лес голых антенн; над улицей вывески на кронштейнах с мёртвыми трубками, живая —
// одна, киноварью. Одно окно тёплое. Над антеннами раз в полминуты садится самолёт — брюхом.
const honeyBuild = P => {
  P.box(6, 26, 20, 70, MAT.CONCRETE);
  P.box(26, 14, 20, 82, MAT.PANEL);
  P.box(46, 34, 20, 62, MAT.PLASTER).shade(1);
  for (let y = 30; y < 88; y += 5) for (const x of [8, 13, 19]) if (noise(x, y, 3) > 0.12) P.cut(x + (noise(x, y, 4) < 0.2 ? 1 : 0), y, 3, 3);
  for (let y = 18; y < 88; y += 4) for (const x of [28, 32, 36, 41]) if (noise(x, y, 5) > 0.1) P.cut(x, y, 2, 2);
  for (let y = 38; y < 88; y += 6) for (const x of [48, 54, 60]) if (noise(x, y, 6) > 0.15) P.cut(x, y, 4, 3);
  P.box(6, 89, 60, 7, MAT.DARK);                                      // лавки за ставнями
  P.cut(30, 78, 6, 18);                                               // проход в колодец двора
  P.box(9, 20, 8, 6, MAT.BOARD); P.box(50, 29, 6, 5, MAT.BOARD); P.box(39, 9, 5, 5, MAT.IRON);   // будки и бак
};
const honeyBody = kit(72, 96, honeyBuild, { seed: 227, chip: 0.03, drips: [[12, 27, 9], [35, 15, 12], [58, 35, 8], [20, 50, 6]] }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), G = tone(MAT.IRON, 3), SH = tone(MAT.BOARD, 1);
  for (const [ax, ay, ah] of [[11, 20, 9], [16, 20, 14], [29, 14, 11], [33, 14, 5], [37, 14, 8], [58, 34, 12], [62, 34, 5], [44, 14, 7]]) px(A, ax, ay - ah, 1, ah);
  px(A, 15, 7, 3, 1); px(A, 28, 4, 3, 1);                              // перекладины антенн
  // клетки-решётки выносом за грань, поверх — ещё одна
  for (const [x, y] of [[4, 44], [62, 60], [23, 66]]) { px(G, x, y, 5, 6); px(N, x + 1, y + 1, 3, 4); px(G, x + 2, y + 1, 1, 4); }
  px(G, 5, 43, 3, 1);
  for (const [x, y] of [[21, 36], [10, 74], [31, 40], [49, 56], [40, 70]]) { px(tone(MAT.IRON, 4), x, y, 3, 2); px(tone(MAT.IRON, 1), x, y + 2, 3, 1); }   // кондиционеры
  for (const [x, y] of [[20, 62], [47, 46]]) { px(A, x, y, 6, 1); px(LEAF, x + 1, y + 1, 2, 2); px(tone(MAT.MOSS, 3), x + 4, y + 1, 1, 3); }   // бельё
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
  // самолёт на посадке: брюхо над антеннами, идёт справа налево
  const ph = T % 1500;
  if (ph < 240) {
    const px0 = Math.round(72 - ph * 0.42);
    for (const [dx, dy, w, h, col] of [[0, 2, 27, 2, A], [24, 0, 3, 2, A], [4, 2, 18, 1, B], [10, 4, 4, 1, A]]) {
      const a = Math.max(0, px0 + dx), b = Math.min(72, px0 + dx + w);
      if (b > a) R(c, col, X0 + a, Y0 + dy, b - a, h);
    }
  }
}
const honeycomb = split(honeyBody, honeyLive);
// город-соты #2 (набором): снесли всё, кроме старого присутственного места в середине — ямэня:
// низкий зал под серой черепицей, побелка, двери. Вокруг — парк в старинном вкусе: газон, дорожки
// гравием, пруд, деревья кронами, фонари. Самолётов нет — аэропорт перевели.
const honey2 = kit(72, 96, P => {
  P.box(0, 86, 72, 10, MAT.MOSS);
  P.box(0, 89, 72, 2, MAT.GRAVEL);
  P.box(42, 91, 26, 4, MAT.GLASS);                                     // пруд
  P.box(12, 68, 40, 18, MAT.SHIKKUI);
  P.box(10, 84, 44, 2, MAT.ASHLAR);
  P.wedge(32, 56, 67, 30, 48, MAT.KAWARA);
  P.box(12, 54, 40, 2, MAT.KAWARA);
  P.box(8, 66, 2, 1, MAT.KAWARA); P.box(54, 66, 2, 1, MAT.KAWARA);
  P.cut(28, 72, 8, 12); P.cut(16, 72, 6, 7); P.cut(42, 72, 6, 7);
  for (const [cx, yt, w] of [[4, 62, 10], [62, 58, 12], [57, 70, 8]]) { P.box(cx - 1, yt + 8, 2, 86 - yt - 8, MAT.TIMBER); P.round(cx, yt, yt + 10, w, MAT.MOSS); }
}, { seed: 229, moss: 0.04 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0);
  for (const x of [13, 22, 36, 42, 50]) px(mix9(K, S, 0.45), x, 69, 1, 15);   // стойки в киновари
  px(tone(MAT.TIMBER, 3), 28, 72, 8, 1);
  for (const x of [24, 40]) { px(A, x, 76, 1, 10); px(B, x - 1, 75, 3, 1); }  // фонари
  px(tone(MAT.GLASS, 5), 47, 92, 5, 1); px(tone(MAT.GLASS, 5), 58, 93, 4, 1);  // рябь на пруду
});

// капсульная башня (набором): два бетонных ствола, на них вразнобой капсулы — светлые коробки
// с круглым иллюминатором; машинные наверху стволов, вход стеклом между ними. В одной капсуле
// мерцает экран.
const CAPS = [];
for (const [cx, base, n] of [[3, 8, 8], [20, 22, 6], [36, 6, 8]]) for (let k = 0; k < n; k++) {
  const sh = (k * 7 + cx) % 3 === 0 ? (cx < 12 ? -1 : 1) : 0;
  CAPS.push([cx + sh, 92 - base - (k + 1) * 10 + 1]);
}
const capsBody = kit(46, 92, P => {
  P.box(0, 86, 46, 6, MAT.CONCRETE);
  P.box(13, 10, 6, 76, MAT.CONCRETE, FORM.CYL); P.box(29, 4, 6, 82, MAT.CONCRETE, FORM.CYL);
  P.box(12, 6, 8, 4, MAT.CONCRETE).shade(1); P.box(28, 0, 8, 4, MAT.CONCRETE).shade(1);
  for (const [x, y] of CAPS) {
    P.box(x, y, 9, 9, MAT.STEEL);
    P.cut(x + 3, y + 2, 3, 5); P.cut(x + 2, y + 3, 5, 3);
  }
  P.cut(21, 73, 7, 13, MAT.GLASS);
}, { seed: 233, drips: [[5, 20, 6], [38, 30, 5], [22, 45, 7]] }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0);
  for (const [x, y] of CAPS) { px(tone(MAT.STEEL, 1), x + 2, y + 2, 1, 1); px(tone(MAT.STEEL, 1), x + 6, y + 6, 1, 1); }   // кольцо иллюминатора
  px(A, 20, 72, 9, 1); px(A, 24, 73, 1, 13);
});
function capsLive(c, x, gy, t) {
  const X0 = Math.round(x) - 23, Y0 = Math.round(gy) - 92, [cx, cy] = CAPS[11];
  if ((t | 0) % 233 > 11) R(c, B, X0 + cx + 3, Y0 + cy + 3, 3, 3);   // в одной капсуле — экран
}
const capsules = split(capsBody, capsLive);

// ── ЗАПАД (набором) ──────────────────────────────────────────────────
// колесо обозрения (набором): за решёткой ворот парка, открытие которого назначали на 1 мая и не
// открыли. Опоры буквой «А» стальным профилем, обод двойной, двенадцать спиц; гондолы открытые —
// навес, скамья; остановлено как положено: нижняя у помоста. Гондолы чуть ходят на ветру. Над
// воротами маркиза аркой, лампочки мёртвые; касса. На пилоне звезда — восемь лучей, ни один не
// горит (звезда-«гуги» над въездом — монтаж назван: так украшали парки за океаном).
const WH = { x: 50, cy: 36, r: 34 };
const wheelBody = kit(88, 92, P => {
  P.poly([[29, 91], [32, 91], [WH.x, WH.cy + 1], [WH.x - 1, WH.cy]], MAT.STEEL);
  P.poly([[68, 91], [71, 91], [WH.x + 1, WH.cy], [WH.x, WH.cy + 1]], MAT.STEEL);
  P.box(WH.x - 14, 64, 29, 2, MAT.STEEL);                              // связь опор
  P.box(WH.x - 6, 78, 13, 2, MAT.BOARD);                              // помост
  P.box(WH.x - 16, 69, 3, 23, MAT.CONCRETE); P.box(WH.x + 14, 69, 3, 23, MAT.CONCRETE);   // столбы ворот
  const arc = [[WH.x - 18, 70]];
  for (let k = 0; k <= 16; k++) { const a = Math.PI * k / 16; arc.push([WH.x - 18 * Math.cos(a), 70 - 10 * Math.sin(a)]); }
  arc.push([WH.x + 18, 70], [WH.x + 18, 72], [WH.x - 18, 72]);
  P.poly(arc, MAT.BOARD).shade(1);                                     // маркиза
  P.box(76, 77, 9, 14, MAT.BRICK); P.box(75, 76, 11, 1, MAT.CONCRETE); P.cut(78, 80, 5, 4);   // касса
  P.poly([[7, 91], [10, 91], [7, 40], [5, 40]], MAT.CONCRETE);         // косой стебель пилона
}, { seed: 239, chip: 0.02 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), X = X0 + WH.x, cy = Y0 + WH.cy, RIM = tone(MAT.STEEL, 3), RIM2 = tone(MAT.STEEL, 1);
  ring(c, RIM, X, cy, WH.r); ring(c, RIM2, X, cy, WH.r - 3);
  for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; line(c, RIM2, X, cy, X + Math.round(Math.cos(a) * (WH.r - 3)), cy + Math.round(Math.sin(a) * (WH.r - 3))); }
  px(B, WH.x - 1, WH.cy - 1, 3, 3);                                     // ступица
  for (let k = -12; k <= 12; k += 6) px(tone(MAT.IRON, 3), WH.x + k, 72, 1, 19);   // решётка ворот
  px(N, WH.x - 13, 72, 27, 1);
  for (let dx = -16; dx <= 16; dx += 2) {                              // мёртвые лампочки по кромке маркизы
    const y = 70 - Math.round(10 * Math.sqrt(Math.max(0, 1 - (dx / 18) ** 2)));
    if ((dx + 40) % 7 !== 3) px(tone(MAT.STEEL, 4), WH.x + dx, y + 1, 1, 1);
  }
  px(tone(MAT.BOARD, 1), WH.x - 9, 62, 19, 3); px(N, WH.x - 8, 63, 4, 1); px(N, WH.x + 1, 63, 7, 1);   // доска: буквы осыпались
  px(LEAF, 79, 85, 3, 2);                                              // «перерыв»
  // звезда на пилоне: восемь лучей, тёмная
  const sx = 6, sy = 34, ST = tone(MAT.STEEL, 3);
  px(ST, sx - 6, sy, 13, 1); px(ST, sx, sy - 6, 1, 13);
  for (let d = 1; d <= 4; d++) { px(ST, sx + d, sy - d); px(ST, sx - d, sy + d); if (d < 4) { px(ST, sx - d, sy - d); px(ST, sx + d, sy + d); } }
  px(tone(MAT.STEEL, 5), sx - 1, sy - 1, 3, 3);
});
function wheelLive(c, x, gy) {
  const X0 = Math.round(x) - 44, G = Math.round(gy), Y0 = G - 92;
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4 + Math.PI / 8, gx = WH.x + Math.round(Math.cos(a) * WH.r), gyy = WH.cy + Math.round(Math.sin(a) * WH.r);
    const h = hang(`gond:${X0}:${G}:${k}`, X0 + gx + 0.5, Y0 + gyy, 3, { sail: 0.03, damp: 0.994, gy: G, r: 3 });
    const o = Math.max(-1, Math.min(1, Math.round(tipOf(h).x - (X0 + gx + 0.5))));
    const L = Math.max(X0 + 1, Math.min(X0 + 80, X0 + gx - 3 + o)), T = Y0 + gyy;
    R(c, A, X0 + gx, T, 1, 2);
    R(c, B, L, T + 2, 7, 1); R(c, A, L, T + 3, 1, 2); R(c, A, L + 6, T + 3, 1, 2);
    R(c, A, L, T + 5, 7, 1); R(c, tone(MAT.BOARD, 3), L + 2, T + 4, 3, 1);
  }
}
const wheel = split(wheelBody, wheelLive);

// щит с ковбоями (набором): щит на трёх ногах, мостик, лампы подсветки погашены. Два одинаковых
// плаката со всадником: на втором он кашляет. Новый клеят поверх прежнего: у края отошло — три
// слоя, нижний писан от руки.
function boardFrame(P) {
  for (const x of [10, 37, 64]) P.box(x, 27, 2, 31, MAT.STEEL);
  P.box(10, 37, 56, 1, MAT.STEEL); P.box(10, 47, 56, 1, MAT.STEEL);
  P.box(2, 27, 72, 1, MAT.STEEL).shade(-1);                            // мостик
  P.box(2, 2, 72, 25, MAT.BOARD);
}
function boardOver(px) {
  for (const lx of [12, 30, 48, 66]) { px(A, lx, 0, 3, 1); px(A, lx + 1, 1, 1, 1); }   // лампы погашены
}
const billboard = kit(76, 58, boardFrame, { seed: 241 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), SKY = mix9(B, S, 0.28), GR = tone(MAT.BOARD, 2);
  boardOver(px);
  for (const x of [4, 39]) {
    px(SKY, x, 4, 33, 8); px(GR, x, 12, 33, 13);
    px(S, x + 1, 11, 9, 1); px(S, x + 24, 10, 8, 2);                   // столовые горы
  }
  const H = 20;                                                         // всадник прямо, курит
  px(N, H - 3, 5, 7, 3); px(N, H - 7, 8, 15, 1); px(N, H - 8, 7, 1, 1); px(N, H + 8, 7, 1, 1);
  px(N, H - 2, 9, 5, 4); px(N, H - 1, 13, 3, 1); px(N, H - 7, 14, 15, 1); px(N, H - 9, 15, 19, 9);
  px(LEAF, H + 3, 11, 4, 1); px(K, H + 7, 11, 1, 1);
  const Q = 54;                                                         // второй согнулся — кашляет
  px(N, Q, 9, 7, 2); px(N, Q - 4, 11, 15, 1); px(N, Q - 5, 10, 1, 1); px(N, Q + 11, 10, 1, 1);
  px(N, Q + 1, 12, 5, 5); px(N, Q - 9, 19, 9, 5); px(N, Q - 4, 17, 11, 7);
  px(N, Q + 5, 15, 3, 2); px(SKY, Q + 6, 14, 2, 2); px(LEAF, Q - 7, 22, 3, 1);
  px(B, Q + 9, 14, 1, 1); px(B, Q + 11, 13, 1, 1); px(B, Q + 10, 16, 1, 1);
  // отклеившийся угол: под рекламой — прежний плакат, под ним — писанный от руки
  px(LEAF, 4, 21, 6, 4); px(K, 4, 24, 5, 1); px(tone(MAT.BOARD, 4), 4, 21, 3, 2); px(N, 7, 20, 3, 1);
});
// щит #2 (набором): курящий щит. Во всю доску — курильщик (солдат, моряк, теперь кто-то в шляпе):
// голова, шляпа, сигарета; рот — тёмным кружком. Раз в несколько секунд изо рта вылетает кольцо
// и плывёт над улицей, расходится и тает.
const smokerBody = kit(76, 58, boardFrame, { seed: 243 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), SKY = mix9(B, S, 0.32), FACE = mix9(B, S, 0.45), HAT = tone(MAT.BOARD, 1);
  boardOver(px);
  px(SKY, 4, 4, 68, 21);
  px(HAT, 22, 5, 18, 4); px(HAT, 17, 9, 28, 2);                        // шляпа
  px(FACE, 23, 11, 16, 12); px(FACE, 25, 23, 12, 2);                   // лицо
  px(N, 26, 14, 3, 1); px(N, 33, 14, 3, 1);                            // глаза в тени полей
  px(tone(MAT.BOARD, 2), 29, 16, 2, 4);                                // нос
  px(N, 31, 20, 3, 3); px(FACE, 32, 21, 1, 1);                         // рот кружком
  px(tone(MAT.BOARD, 2), 18, 25, 26, 0); px(S, 15, 23, 32, 2);         // ворот
  px(LEAF, 37, 19, 6, 1); px(A, 43, 19, 1, 1);                         // сигарета
  for (const x of [50, 56, 62]) px(tone(MAT.BOARD, 3), x, 8, 1, 14);  // полосы доски за курильщиком
});
function smokerLive(c, x, gy, t) {
  const X0 = Math.round(x) - 38, Y0 = Math.round(gy) - 58, ph = (t | 0) % 240;
  if (ph >= 180) return;
  const k = ph / 180, rx = Math.round(33 + 30 * k), ry = Math.round(20 - 18 * k), s = k < 0.4 ? 1 : 2;
  c.globalAlpha = 0.85 * (1 - k);
  c.fillStyle = A;
  c.fillRect(X0 + rx - s, Y0 + ry - s, 2 * s + 1, 1); c.fillRect(X0 + rx - s, Y0 + ry + s, 2 * s + 1, 1);
  c.fillRect(X0 + rx - s - 1, Y0 + ry - s + 1, 1, 2 * s - 1); c.fillRect(X0 + rx + s + 1, Y0 + ry - s + 1, 1, 2 * s - 1);
  c.globalAlpha = 1;
}
const smoker = split(smokerBody, smokerLive);

// ── СЕВЕР (набором) ──────────────────────────────────────────────────
// нефтяная платформа (набором): полупогружная — на понтонах у ватерлинии, три видимые колонны со
// связями, палуба под снегом; жилой блок с вертолётной площадкой кольцом; вышка в ветрозащитной
// обшивке, выше — открытые фермы и кронблок; модуль; на длинной стреле — факел, горит ровно.
const rigBody = kit(84, 96, P => {
  P.box(6, 86, 72, 4, MAT.PLATE);
  for (const x of [10, 38, 66]) P.box(x, 54, 8, 33, MAT.PLATE, FORM.CYL);
  P.box(18, 70, 48, 2, MAT.STEEL);
  P.box(2, 50, 80, 4, MAT.STEEL);
  P.box(4, 37, 24, 13, MAT.PLATE);
  for (const y of [40, 44]) P.cut(6, y, 20, 2, MAT.GLASS);
  P.box(2, 34, 28, 3, MAT.STEEL).shade(-1);                            // вертолётная площадка
  P.trap(40, 56, 43, 53, 22, 49, MAT.IRON);                            // вышка в обшивке
  P.box(60, 42, 12, 8, MAT.CONCRETE);
}, { seed: 251, snow: 0.45, drips: [[12, 56, 8], [40, 58, 10], [68, 57, 7]] }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), ST = tone(MAT.STEEL, 3);
  hline(c, ST, X0 + 18, Y0 + 69, X0 + 37, Y0 + 56); hline(c, ST, X0 + 65, Y0 + 69, X0 + 46, Y0 + 56);   // раскосы
  hline(c, ST, X0 + 43, Y0 + 21, X0 + 46, Y0 + 9); hline(c, ST, X0 + 53, Y0 + 21, X0 + 50, Y0 + 9);  // открытые фермы
  px(ST, 44, 15, 8, 1); px(B, 44, 6, 8, 3); px(A, 47, 4, 2, 2);        // кронблок
  px(tone(MAT.STEEL, 5), 9, 35, 14, 1); px(N, 13, 35, 6, 1);           // кольцо площадки
  for (const [x, w] of [[1, 6], [74, 8], [28, 5]]) { px(B, x, 92, w, 1); px(A, x + 1, 93, w - 1, 1); }   // льдины
  hline(c, tone(MAT.PLATE, 2), X0 + 72, Y0 + 50, X0 + 80, Y0 + 18);   // стрела факела
  hline(c, tone(MAT.PLATE, 4), X0 + 71, Y0 + 50, X0 + 79, Y0 + 18);
});
function rigLive(c, x, gy, t) {
  const X0 = Math.round(x) - 42, Y0 = Math.round(gy) - 96, f = (((t | 0) >> 4) % 6 === 0) ? 1 : 0;
  R(c, C, X0 + 79, Y0 + 13, 3, 5); R(c, C, X0 + 79 + f, Y0 + 10, 2, 3); R(c, C, X0 + 80 - f, Y0 + 8, 1, 2);
}
const rig = split(rigBody, rigLive);
// платформа #2 (набором): жилая, «гостиница на ногах» с пятью колоннами — в тот вечер одна нога
// отломилась, и она ложится на бок. Палуба косо, жилые блоки с рядами окон съезжают вместе с ней,
// колонны уходят в воду наклонно, на месте пятой — обломок; у кромки вода пенится.
const rig2 = kit(84, 96, P => {
  for (const [x0, y0] of [[8, 44], [36, 48]]) P.poly([[x0, y0], [x0 + 8, y0 + 1], [x0 + 7, 76], [x0 - 1, 76]], MAT.PLATE, FORM.CYL);   // колонны в воду
  P.poly([[62, 53], [70, 54], [70, 59], [67, 62], [65, 59], [62, 61]], MAT.PLATE);   // от пятой — обломок
  P.poly([[2, 40], [82, 52], [82, 57], [2, 45]], MAT.STEEL);             // палуба с креном
  P.poly([[5, 40], [42, 46], [42, 28], [5, 22]], MAT.CONCRETE).shade(-2);   // жилые блоки, светлые
  P.poly([[44, 46], [66, 49], [66, 36], [44, 33]], MAT.CONCRETE).shade(-1);
  P.poly([[4, 22], [32, 26], [32, 23], [4, 19]], MAT.STEEL).shade(1);    // вертолётная площадка
  P.poly([[66, 49], [74, 50], [72, 30], [70, 30]], MAT.STEEL);            // кран
}, { seed: 253, chip: 0.03 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0);
  // окна рядами вдоль крена — блок съезжает вместе с палубой
  for (const d of [4, 9, 14]) for (let x = 8; x < 40; x += 4) px(N, x, Math.round(22 + d + (x - 5) * 6 / 37), 2, 2);
  for (const d of [4, 9]) for (let x = 47; x < 64; x += 4) px(N, x, Math.round(33 + d + (x - 44) * 3 / 22), 2, 2);
  hline(c, tone(MAT.STEEL, 3), X0 + 71, Y0 + 30, X0 + 80, Y0 + 38); px(A, 80, 38, 1, 6);   // стрела крана, гак
  // море: вода закрыла правый край палубы, у кромки пена
  for (let y = 74; y < 96; y++) px(mix9(N, A, y < 76 ? 0.25 : 0.08), 0, y, 84, 1);
  for (let y = 56; y < 74; y++) { const x0 = Math.max(60, 82 - (y - 56)); px(mix9(N, A, 0.12), x0, y, 84 - x0, 1); }
  for (const [x, y, w] of [[60, 74, 10], [72, 60, 8], [30, 74, 6], [4, 74, 7]]) { px(B, x, y, w, 1); px(A, x + 2, y + 1, w - 3, 1); }
  for (const [x, y] of [[10, 82], [40, 86], [62, 80], [24, 90]]) px(A, x, y, 6, 1);
});
// мебельный ангар (набором): глухой короб в гофре под снегом; по кромке пояс — был жёлтым,
// выцвел до кости. В витрине под лампой один собранный стул. Вход под козырьком. Пилон выше
// короба с такой же панелью без слов. К стене прислонён исполинский шестигранник; плоские
// коробки штабелем; на земле лист схемы — человечек справляется.
const warehouse = kit(96, 64, P => {
  P.box(14, 12, 72, 52, MAT.IRON);
  P.box(13, 10, 74, 2, MAT.IRON).shade(1);
  P.cut(44, 37, 18, 16);
  P.cut(66, 45, 8, 19, MAT.GLASS);
  P.box(64, 44, 12, 1, MAT.STEEL);
  P.box(90, 8, 2, 56, MAT.STEEL);
  P.box(86, 0, 10, 9, MAT.STEEL).shade(-1);
  for (let k = 0; k < 4; k++) P.box(1 + (k & 1) * 2 - (k === 3 ? 1 : 0), 59 - k * 4, 12, 4, MAT.BOARD).shade(-2);
}, { seed: 257, snow: 0.7 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), BAND = mix9(B, S, 0.1);
  px(BAND, 14, 13, 72, 3); px(mix9(B, S, 0.3), 14, 16, 72, 1);         // пояс выцвел до кости
  px(mix9(B, S, 0.2), 87, 1, 8, 7);                                    // панель без слов
  // стул под лампой: свет конусом костью, стул пеплом
  px(B, 52, 37, 2, 1); hline(c, mix9(N, B, 0.25), X0 + 51, Y0 + 38, X0 + 47, Y0 + 52); hline(c, mix9(N, B, 0.25), X0 + 54, Y0 + 38, X0 + 58, Y0 + 52);
  px(A, 51, 47, 4, 1); px(A, 54, 43, 1, 4); px(A, 51, 48, 1, 5); px(A, 54, 48, 1, 5);
  // шестигранник: длинное плечо к стене, короткое на земле
  hline(c, tone(MAT.STEEL, 3), X0 + 22, Y0 + 61, X0 + 38, Y0 + 31); hline(c, tone(MAT.STEEL, 4), X0 + 21, Y0 + 61, X0 + 37, Y0 + 31);
  hline(c, tone(MAT.STEEL, 1), X0 + 23, Y0 + 61, X0 + 39, Y0 + 31);
  px(tone(MAT.STEEL, 3), 13, 61, 11, 3); px(B, 37, 30, 3, 1); px(B, 13, 61, 1, 3);
  for (let k = 0; k < 4; k++) px(tone(MAT.BOARD, 1), 11 + (k & 1) * 2 - (k === 3 ? 1 : 0), 60 - k * 4, 2, 3);
  px(LEAF, 28, 63, 4, 1);                                               // схема сборки на земле
});

// домик Хёвди (набором): белый деревянный дом у воды в обшивке, вальма под снегом, мезонин с
// фронтоном, трубы; два этажа окон, свет в одном. Перед домом два флагштока — без флагов.
function hofdiBuild(P) {
  P.box(20, 40, 50, 34, MAT.CLAPBOARD).shade(-1);
  P.trap(16, 74, 22, 68, 30, 39, MAT.SLATE);
  P.box(36, 22, 20, 18, MAT.CLAPBOARD).shade(-1);
  P.wedge(46, 14, 22, 4, 24, MAT.SLATE);
  P.box(28, 24, 3, 7, MAT.BRICK); P.box(61, 24, 3, 7, MAT.BRICK);
  for (const x of [24, 32, 43, 54, 62]) { P.cut(x, 44, 5, 8); P.cut(x, 57, 5, 8); }
  P.cut(42, 26, 3, 7); P.cut(47, 26, 3, 7);
  P.cut(43, 61, 6, 13);
  P.box(40, 59, 12, 1, MAT.CLAPBOARD).shade(-1);
}
function hofdiOver(c, X0, Y0) {
  const px = pxOf(c, X0, Y0);
  px(mix9(B, S, 0.2), 54, 44, 5, 8);                                   // свет в одном окне — холодный
  for (const x of [4, 11]) { px(A, x, 2, 1, 72); px(B, x - 1, 0, 3, 2); px(tone(MAT.ASHLAR, 2), x - 1, 71, 3, 2); }   // флагштоки
  px(B, 71, 71, 4, 2); px(A, 72, 70, 2, 1);                            // сугроб
}
const hofdi = kit(76, 74, hofdiBuild, { seed: 263, snow: 0.6 }, hofdiOver);
// домик Хёвди #2 (набором): тот же дом; за ним в гавани — теплоход, на котором ночевала одна из
// делегаций: корпус, надстройка, труба.
const hofdi2 = kit(76, 74, P => {
  P.box(0, 58, 20, 6, MAT.GLASS);                                      // гавань
  P.poly([[0, 50], [18, 50], [16, 58], [0, 58]], MAT.PLATE);
  P.box(1, 44, 13, 6, MAT.STEEL); P.box(5, 39, 3, 5, MAT.STEEL).shade(1);
  hofdiBuild(P);
}, { seed: 269, snow: 0.6 }, (c, X0, Y0) => {
  hofdiOver(c, X0, Y0);
  const px = pxOf(c, X0, Y0);
  for (let x = 2; x < 13; x += 3) px(tone(MAT.GLASS, 1), x, 46, 2, 1); // иллюминаторы надстройки
  px(tone(MAT.PLATE, 4), 0, 52, 17, 1);
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
    { name: 'отель-пластина', w: 96, h: 96, draw: hotel, draw2: hotel2, life: { birds: [[-20, -14, -89, 'K']] }, life2: { birds: [[-23, -17, -61]] } },
    { name: 'пляж «аренда солнца»', w: 76, h: 52, draw: beach },
    { name: 'кофейня Махфуза', w: 64, h: 62, life: { birds: [[-14, -8, -48]] }, draw: cafe, draw2: cafe2 },
  ],
  east: [
    { name: 'город-соты', w: 72, h: 96, life: { birds: [[-19, -14, -69]] }, draw: honeycomb, draw2: honey2, life2: { birds: [[-14, -8, -41]] } },
    { name: 'капсульная башня', w: 46, h: 92, draw: capsules },
  ],
  west: [
    { name: 'колесо обозрения', w: 88, h: 92, life: { birds: [[3, 6, -89]] }, draw: wheel },
    { name: 'щит с ковбоями', w: 76, h: 58, draw: billboard, draw2: smoker, life: { blink: [[29, -57, 'S', 150, 0.12]], birds: [[-23, -17, -55]] } },
  ],
  north: [
    { name: 'нефтяная платформа', w: 84, h: 96, draw: rig, life: { smoke: [[38, -87]], birds: [[-40, -34, -61]] }, draw2: rig2, life2: {} },
    { name: 'мебельный ангар', w: 96, h: 64, life: { birds: [[-30, -22, -53]] }, draw: warehouse },
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
