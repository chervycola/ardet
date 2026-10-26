// ═══ АРХИТЕКТУРА · портики и сады (III в. до н. э. — V в. н. э.) ═══
// Одна эпоха — пять культур; империя и её края. Юг: Пантеон (треугольный
// фронтон перед куполом-блюдцем, киноварный фриз) и сад Эпикура за калиткой — кипарисы над стеной, тень
// бесплатна только здесь. Восток: пещерный храм-чайтья — утёс, подкова
// «солнечного окна» с дугами рёбер, львиный столб указа; и Великая стена,
// которая едет по склону к караулке под загнутой кровлей и строится прямо
// в кадре (бамбуковые леса, корзины земли, сигнальный огонь). Запад:
// башня лимеса — полуциркульные ворота с замковым камнем, обрубки
// каменной куртины, лес по краям, брошенный щит; сквозной акведук с
// обрушенным краем. Север: брох с двойной стеной на срезе и болото жертв —
// выбеленные идолы-развилки, лес рукоятей над чёрной водой, щит на шесте,
// весло Пифея. Равнина: недостроенный портик фактории, который съедает
// ковыль, лежащий мильный столб; войлочная юрта с гуннским котлом на
// треноге, амфоры и конь у таможенного камня — обмен двух миров.
// Утварь дворов (props) — по три вещи на сторону, без осмотра.
// Свет — лунный, слева; проёмы — ночь. x — центр, gy — линия земли.

import { plan, paint, MAT, FORM, tone, split, carve } from './kit.js';
import { hang, angleOf } from '../../world/hang.js';

const N = '#0D0B0A', K = '#D9CFB8', P = '#8A8D8F', M = '#3D4A3A';
const S = '#E28A3A', V = '#C23B2B';
const D1 = '#15100c', D2 = '#241c14', D3 = '#2a2620', D4 = '#34302a', D5 = '#3a3328';
const B1 = '#3a2418', B2 = '#3a2818', B3 = '#3a1c14';
const C1 = '#c8b89a', C2 = '#b0a284';
const V_F = '#7e3629';                              // киноварь выцвела (скутум)

function R(c, col, x, y, w, h) { c.fillStyle = col; c.fillRect(x, y, w, h); }
const q = Math.round;

// отрезок ступеньками [x0, x1): пологий — по рядам, крутой — по столбцам
function seg(c, col, x0, y0, x1, y1) {
  const dx = x1 - x0, dy = y1 - y0;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const n = Math.abs(dy) + 1, s = Math.sign(dy);
    for (let k = 0; k < n; k++) {
      const a = x0 + q(dx * k / n), b = x0 + q(dx * (k + 1) / n);
      R(c, col, Math.min(a, b), y0 + s * k, Math.max(1, Math.abs(b - a)), 1);
    }
  } else {
    const n = Math.abs(dx) + 1, s = Math.sign(dx);
    for (let k = 0; k < n; k++) {
      const a = y0 + q(dy * k / n), b = y0 + q(dy * (k + 1) / n);
      R(c, col, x0 + s * k, Math.min(a, b), 1, Math.max(1, Math.abs(b - a)));
    }
  }
}

// ── ЮГ · Средиземноморье, Александрия ─────────────────────────────
// кипарис набором: веретено с зубчатой кромкой (листва ±1), макушка клонится
function cypressPoly(P, x, base, h, lean = 0) {
  const L = [], R2 = [];
  for (let k = 0; k <= 6; k++) {
    const y = base - h * k / 6, hw = 3.5 * Math.sin(Math.PI * (0.18 + 0.82 * (1 - k / 6)) / 1.6) + (k & 1 ? 0.6 : -0.2);
    const dx = lean * (k / 6) ** 2;
    L.push([x - hw + dx, y]); R2.push([x + hw + 1 + dx, y]);
  }
  P.poly([...L, [x + lean + 0.5, base - h - 1], ...R2.reverse()], MAT.MOSS);
}

// Пантеон: кирпичный барабан ротонды (по ширине — цилиндр), бетонный купол с тремя
// ступенчатыми кольцами у пят и окулом-щербиной на темени; перед ним портик в восемь
// гранитных колонн с мраморными капителями, тёмный фриз, фронтон, а над ним — второй
// фронтон промежуточного блока, выше первого. В тени портика — бронзовая дверь.
// Колонн восемь: их отражает лужа у ступеней (world/aitraps.js).
function pantheonPlan(v) {
  const W = 96, H = 66, P = plan(W, H);
  if (!v) {
    P.box(6, 26, 84, 36, MAT.BRICK, FORM.CYL);                               // барабан
    P.box(5, 25, 86, 1, MAT.MARBLE); P.box(6, 40, 84, 1, MAT.MARBLE);         // карнизы барабана
    P.box(9, 23, 78, 2, MAT.CONCRETE); P.box(13, 21, 70, 2, MAT.CONCRETE); P.box(17, 19, 62, 2, MAT.CONCRETE);
    const d = [];
    for (let k = 0; k <= 16; k++) { const a = Math.PI * k / 16; d.push([48 + 29 * Math.cos(a), 19 - 13 * Math.sin(a)]); }
    P.poly(d, MAT.CONCRETE, FORM.CYL);                                         // купол
    P.cut(45, 6, 6, 1);                                                        // окул
    P.wedge(48, 13, 23, 2, 52, MAT.MARBLE);                                    // второй фронтон
    P.box(14, 60, 68, 2, MAT.MARBLE); P.box(12, 62, 72, 4, MAT.MARBLE);        // ступени
    P.box(16, 30, 64, 4, MAT.MARBLE);                                          // антаблемент
    P.cut(18, 34, 60, 26);                                                     // тень портика
    P.box(42, 42, 12, 18, MAT.IRON); P.cut(48, 42, 1, 18);                     // бронзовая дверь в две створки
    for (let i = 0; i < 8; i++) {                                              // восемь колонн
      const x = 18 + i * 8;
      P.box(x, 36, 5, 24, MAT.GRANITE, FORM.CYL);
      P.box(x - 1, 34, 7, 2, MAT.MARBLE); P.box(x - 1, 59, 7, 1, MAT.MARBLE);
    }
    P.wedge(48, 18, 29, 2, 66, MAT.MARBLE);                                    // фронтон портика
    P.wedge(48, 21, 28, 2, 54, MAT.PLASTER);                                   // тимпан — бронза снята
  } else {
    // второй — поменьше, во дворе за чужой стеной: над стеной купол, барабан, верх портика
    P.box(26, 26, 44, 20, MAT.BRICK, FORM.CYL);
    P.box(25, 25, 46, 1, MAT.MARBLE);
    P.box(29, 23, 38, 2, MAT.CONCRETE);
    const d = [];
    for (let k = 0; k <= 12; k++) { const a = Math.PI * k / 12; d.push([48 + 17 * Math.cos(a), 23 - 9 * Math.sin(a)]); }
    P.poly(d, MAT.CONCRETE, FORM.CYL);
    P.cut(46, 14, 4, 1);
    P.box(34, 32, 28, 3, MAT.MARBLE); P.cut(35, 35, 26, 11);                   // антаблемент, тень портика
    for (let i = 0; i < 4; i++) P.box(36 + i * 7, 36, 4, 10, MAT.GRANITE, FORM.CYL);
    P.wedge(48, 24, 31, 2, 32, MAT.MARBLE);
    P.box(0, 46, 96, 20, MAT.PLASTER);                                         // чужая стена двора
    P.poly([[6, 52], [13, 50], [16, 56], [9, 60]], MAT.RUBBLE); P.poly([[70, 55], [79, 53], [82, 60], [73, 62]], MAT.RUBBLE);
    P.box(0, 46, 96, 1, MAT.TILE);
    P.cut(42, 50, 12, 16); P.cut(43, 49, 10, 1);                               // ворота двора
  }
  return P;
}
function pantheonPaint(c, X, G, P, v) {
  const X0 = q(X) - 48, Y0 = q(G) - 66;
  paint(c, X0, Y0, P, { seed: v ? 63 : 61, chip: 0.08, cracks: 3, moss: 0.03 });
  const px = (col, dx, dy, w = 1, h = 1) => R(c, col, X0 + dx, Y0 + dy, w, h);
  if (!v) {
    px(D2, 18, 31, 60, 2);                                                     // фриз: имя по камню — темнее
    for (const [x, y] of [[40, 24], [48, 23], [56, 24], [44, 26], [52, 26]]) px(D2, x, y);   // гнёзда бронзы в тимпане
    px(P, 44, 7, 8, 1);                                                        // кольцо окула
  } else {
    px(P, 45, 15, 6, 1);
    px(C1, 47, 60, 3, 2); px(K, 48, 60, 1, 1);                                 // в воротах: круг из окулюса на полу
  }
}
function pantheon(c, X, G) { if (!pantheon.P) pantheon.P = pantheonPlan(0); pantheonPaint(c, X, G, pantheon.P, 0); }
function pantheon2(c, X, G) { if (!pantheon2.P) pantheon2.P = pantheonPlan(1); pantheonPaint(c, X, G, pantheon2.P, 1); }

// Фаросский маяк — доминанта юга: мол-подиум, три яруса — квадратный ствол квадрами
// с откосом, восьмигранник гранями (свет на левой), круглый фонарь с огнём под
// колоннами, над куполком статуя. У двери — доска посвящения: имя царя по штукатурке,
// где она осыпалась — другое имя, в камне и глубже (Сострат, по Лукиану). Под
// карнизами соляные потёки, у мола — мох.
function pharosBody(c, X, G) {
  const W = 72, H = 196;
  if (!pharosBody.P) {
    const P = pharosBody.P = plan(W, H);
    P.box(0, 188, 72, 8, MAT.ASHLAR);                                          // мол
    P.trap(13, 58, 17, 54, 88, 187, MAT.ASHLAR);                               // квадратный ствол с откосом
    for (const y of [134, 116, 98]) { P.cut(24, y, 2, 4); P.cut(46, y, 2, 4); P.cut(35, y - 6, 2, 4); }
    P.cut(32, 168, 8, 20); P.cut(33, 167, 6, 1);                               // дверь в рост
    P.box(23, 150, 26, 12, MAT.ASHLAR); P.box(24, 151, 15, 10, MAT.PLASTER); P.box(39, 151, 4, 4, MAT.PLASTER);   // доска
    P.box(15, 85, 42, 3, MAT.MARBLE);                                          // карниз
    P.box(15, 81, 3, 4, MAT.MARBLE); P.box(54, 81, 3, 4, MAT.MARBLE);          // тритоны по углам
    P.box(23, 43, 6, 42, MAT.MARBLE); P.box(29, 43, 14, 42, MAT.MARBLE); P.box(43, 43, 6, 42, MAT.MARBLE);   // восьмигранник
    P.cut(35, 52, 2, 4); P.cut(35, 66, 2, 4); P.cut(35, 76, 2, 3);
    P.box(21, 41, 30, 2, MAT.MARBLE);
    P.box(27, 33, 18, 8, MAT.MARBLE, FORM.CYL);                                // круглый ярус
    P.cut(28, 19, 16, 14);                                                     // фонарь
    for (const x of [28, 33, 38, 43]) P.box(x, 19, 1, 14, MAT.MARBLE);
    P.box(27, 17, 18, 2, MAT.MARBLE); P.box(29, 15, 14, 2, MAT.MARBLE); P.box(31, 13, 10, 2, MAT.MARBLE); P.box(33, 12, 6, 1, MAT.MARBLE);
  }
  const X0 = q(X) - 36, Y0 = q(G) - H;
  paint(c, X0, Y0, pharosBody.P, { seed: 67, chip: 0.06, cracks: 4, moss: 0.05, drips: [[20, 88, 8], [50, 88, 6], [26, 43, 5], [44, 43, 7], [16, 188, 3]] });
  const px = (col, dx, dy, w = 1, h = 1) => R(c, col, X0 + dx, Y0 + dy, w, h);
  for (const [x, y, w] of [[26, 153, 3], [30, 153, 4], [35, 153, 3], [26, 156, 5], [32, 156, 3], [36, 156, 2], [26, 159, 2], [29, 159, 4], [34, 159, 3]]) px(D3, x, y, w, 1);   // имя царя
  for (const [x, y, w] of [[40, 156, 3], [44, 156, 2], [40, 159, 2], [43, 159, 4], [44, 152, 3]]) px(D1, x, y, w, 2);   // глубже, в камне
  px(C2, 38, 160, 1, 1); px(C2, 41, 161, 2, 1);                                 // осыпь
  px(C2, 35, 4, 3, 8); px(K, 35, 4, 1, 8); px(C2, 35, 1, 2, 3);                 // статуя
  px(P, 39, 0, 1, 11); px(P, 38, 0, 3, 1);                                      // трезубец
}
function pharosLive(c, X, G, t) {
  const cx = q(X), B = q(G), f = ((t || 0) / 18 | 0) % 3;
  R(c, S, cx - 4, B - 173 + (f === 1 ? 1 : 0), 8, 10 - (f === 1 ? 1 : 0));    // огонь
  R(c, S, cx - 2 + (f === 2 ? 1 : 0), B - 175, 3, 2);
}
const pharos = split(pharosBody, pharosLive);

// Сад Эпикура: глухая стена выше роста — бут под известковой штукатуркой, облетевшей
// пятнами, по гребню черепица; калитка в рост приоткрыта, у входа герма с тенонами;
// над стеной кипарисы, один клонится. Без огня: тень бесплатна только здесь.
// Второй (#2): стена исписана снаружи во всю длину — тени у неё нет, вся ушла в сад.
function gardenPlan(v) {
  const P = plan(56, 50);
  if (!v) { cypressPoly(P, 9, 31, 30); cypressPoly(P, 18, 31, 23, 1); cypressPoly(P, 47, 31, 27); }
  else {
    P.poly([[2, 31], [4, 22], [10, 16], [18, 14], [25, 18], [27, 25], [24, 31]], MAT.MOSS);   // кроны вглубь сада
    P.poly([[30, 31], [33, 20], [40, 15], [48, 17], [53, 24], [52, 31]], MAT.MOSS);
  }
  P.box(0, 30, 56, 20, MAT.PLASTER);                                           // стена
  P.poly([[4, 36], [11, 35], [13, 41], [6, 43]], MAT.RUBBLE); P.poly([[46, 40], [53, 38], [54, 45], [48, 46]], MAT.RUBBLE);
  if (!v) P.poly([[16, 44], [22, 43], [23, 48], [17, 49]], MAT.RUBBLE);
  P.box(0, 30, 56, 1, MAT.TILE);
  P.cut(29, 32, 7, 18); P.cut(30, 31, 5, 1);                                   // калитка 7×18
  P.box(36, 32, 2, 18, MAT.BOARD);                                             // створка приоткрыта
  P.box(42, 37, 2, 13, MAT.MARBLE); P.box(41, 34, 4, 3, MAT.MARBLE);           // герма,
  P.box(40, 40, 1, 1, MAT.MARBLE); P.box(44, 40, 1, 1, MAT.MARBLE);            // теноны
  return P;
}
function gardenPaint(c, X, G, P, v) {
  const X0 = q(X) - 28, Y0 = q(G) - 50;
  paint(c, X0, Y0, P, { seed: v ? 73 : 71, chip: 0.06, moss: 0.08 });
  if (v) for (const y of [34, 37, 40, 43, 46]) for (let x = 2; x < 54; x += 2) {   // строки по всей стене, кроме калитки и гермы
    if (x >= 28 && x <= 45) continue;
    if (((x * 7 + y * 3) % 11) !== 0) R(c, D2, X0 + x, Y0 + y, 1, 1);
  }
}
function epicurusGarden(c, X, G) { if (!epicurusGarden.P) epicurusGarden.P = gardenPlan(0); gardenPaint(c, X, G, epicurusGarden.P, 0); }
function epicurusGarden2(c, X, G) { if (!epicurusGarden2.P) epicurusGarden2.P = gardenPlan(1); gardenPaint(c, X, G, epicurusGarden2.P, 1); }

// ── ВОСТОК · Индия, Китай ─────────────────────────────────────────
// подкова «солнечного окна» (гавакша): круг, у пят сужен — многоугольником
function horseshoe(cx, cy, r, foot) {
  const pts = [];
  for (let k = 0; k <= 20; k++) {
    const a = Math.PI * (-0.2 + 1.4 * k / 20);
    pts.push([cx + r * Math.cos(a), cy - r * Math.sin(a)]);
  }
  pts.push([cx - r * 0.72, cy + foot], [cx + r * 0.72 + 1, cy + foot]);
  return pts;
}
// Пещерный храм-чайтья (Карла): утёс базальтом с уступами, гребнем и кустами на темени,
// фасад врублен под нависанием; подкова «солнечного окна» в деревянной раме, внутри
// рёбра из тика — держат только себя; ниже ведика и три входа. По скале — малые
// подковы. Над входом канавка для дождя — от неё потёк. Перед утёсом — столб Ашоки:
// полированный ствол, капитель-колокол, львы спина к спине, колесо; строки к низу мельчают.
function chaityaPlan(v) {
  const P = plan(80, 62);
  const CL = [[0, 5, 26], [5, 4, 31], [9, 6, 34], [15, 5, 40], [20, 6, 46], [26, 8, 54], [34, 9, 58],
    [43, 7, 60], [50, 8, 57], [58, 6, 53], [64, 5, 47], [69, 4, 50], [73, 7, 39]];
  const top = [];
  for (const [a, w, h] of CL) top.push([a, 62 - h], [a + w - 1, 62 - h + ((a >> 2) & 1)]);
  P.poly([[0, 62], ...top, [80, 62 - 39], [80, 62]], MAT.BASALT);                   // утёс
  if (!v) {
    P.box(27, 9, 36, 2, MAT.BASALT);                                               // нависание
    P.box(28, 11, 34, 51, MAT.SANDSTONE);                                          // врубленный фасад
    for (let i = 0; i < 6; i++) { P.cut(30 + 5 * i, 13, 3, 3); P.box(30 + 5 * i, 12, 3, 1, MAT.SANDSTONE); }   // фриз малых подков
    P.poly(horseshoe(45, 26, 11, 10), MAT.TIMBER);                                 // рама окна
    P.poly(horseshoe(45, 26, 9, 10), MAT.DARK);
    P.box(28, 36, 34, 1, MAT.BASALT);                                              // карниз
    P.box(28, 37, 34, 4, MAT.SANDSTONE);                                           // ведика
    for (let x = 30; x < 61; x += 4) P.cut(x, 38, 2, 2);
    P.box(41, 43, 8, 1, MAT.TIMBER); P.cut(42, 44, 6, 18);                         // главный вход в рост
    P.cut(33, 50, 3, 12); P.cut(54, 50, 3, 12);
    for (const [sx, sy] of [[19, 25], [66, 21]]) { P.poly(horseshoe(sx + 3, sy + 3, 3, 3), MAT.SANDSTONE); P.poly(horseshoe(sx + 3, sy + 3, 2, 3), MAT.DARK); }
    P.box(8, 22, 3, 40, MAT.MARBLE, FORM.CYL);                                     // столб Ашоки
    P.box(7, 19, 5, 3, MAT.MARBLE); P.box(6, 18, 7, 1, MAT.MARBLE);
    P.box(4, 14, 11, 4, MAT.SANDSTONE); carve(P, 4, 14, ['.##.....##.', '####...####', '###########', '#.#.#.#.#.#']);   // львы спина к спине
    P.box(8, 10, 3, 3, MAT.SANDSTONE); carve(P, 8, 10, ['###', '#.#', '###']);   // колесо
  } else {
    // Аджанта: подкова ущелья, ряд пещер — одна чайтья, рядом кельи с колоннами; вход затянут лесом
    P.box(4, 26, 72, 20, MAT.SANDSTONE);                                           // вырубленная полка
    P.box(3, 24, 74, 2, MAT.BASALT);
    P.poly(horseshoe(40, 34, 7, 8), MAT.TIMBER); P.poly(horseshoe(40, 34, 5, 8), MAT.DARK);
    for (const x0 of [8, 22, 54, 66]) { P.cut(x0, 32, 9, 12); for (let k = 0; k < 3; k++) P.box(x0 + 2 + 3 * k, 33, 1, 11, MAT.SANDSTONE); }
    P.poly([[0, 62], [2, 50], [8, 44], [16, 47], [22, 42], [30, 46], [36, 43], [44, 47], [52, 42], [60, 46], [68, 43], [76, 48], [80, 50], [80, 62]], MAT.MOSS);   // лес у входа
  }
  return P;
}
function chaityaPaint(c, X, G, P, v) {
  const X0 = q(X) - 40, Y0 = q(G) - 62;
  paint(c, X0, Y0, P, { seed: v ? 83 : 79, moss: v ? 0.2 : 0.1, chip: 0.06, cracks: 3, drips: v ? [] : [[40, 11, 6], [50, 11, 5]] });
  const px = (col, dx, dy, w = 1, h = 1) => R(c, col, X0 + dx, Y0 + dy, w, h);
  for (const [x, y, w] of [[2, 44, 5], [14, 38, 6], [64, 40, 7], [70, 30, 5], [20, 52, 4], [62, 54, 6]]) px(tone(MAT.BASALT, 1), x, y, w, 1);   // пласты
  px(M, 46, 1, 4, 2); px(M, 70, 11, 3, 2); px(M, 25, 8, 3, 1);                     // кусты на темени
  if (!v) {
    for (const r of [7, 4]) for (let k = 0; k <= 10; k++) {                         // рёбра из тика внутри окна
      const a = Math.PI * k / 10; px(C2, q(45 + r * Math.cos(a)), q(26 - r * Math.sin(a)));
    }
    for (let k = 0; k < 7; k++) px(D3, 9, 25 + k * 5 - (k >> 1), 1, Math.max(1, 3 - (k >> 1)));   // строки указа к низу мельчают
  } else {
    for (const [x, len] of [[6, 9], [18, 7], [33, 10], [47, 8], [58, 11], [71, 6]]) px(M, x, 26, 1, len);   // лианы с полки
    px(C1, 39, 39, 2, 1);                                                          // роспись в глубине — пятно
  }
}
function chaitya(c, X, G) { if (!chaitya.P) chaitya.P = chaityaPlan(0); chaityaPaint(c, X, G, chaitya.P, 0); }
function chaitya2(c, X, G) { if (!chaitya2.P) chaitya2.P = chaityaPlan(1); chaityaPaint(c, X, G, chaitya2.P, 1); }

// Великая стена строится в кадре: лента трамбовки с прослойками тростника (так сложена
// ханьская стена у Дуньхуана) и рядами гнёзд опалубки лезет по гребню холма уступами
// прясел к сигнальной башне с караулкой под серой черепицей; справа участок в работе —
// свежая трамбовка ниже, щиты опалубки, бамбуковые леса, лестница, ворот с корзиной.
function wallBody(c, X, G) {
  const W = 96, H = 68;
  const hill = (a) => a < 52 ? 2 + a * 0.3 : Math.max(5, 17.6 - (a - 52) * 0.33);
  if (!wallBody.P) {
    const P = wallBody.P = plan(W, H);
    const band = [[0, H]];                                                         // готовая стена — одной лентой уступами
    for (const a of [0, 6, 12, 18, 24, 30, 36, 42]) { const top = q(hill(a + 3)) + 20; band.push([a, H - top], [a + 6, H - top]); }
    band.push([48, H]);
    P.poly(band, MAT.RAMMED);
    P.box(62, H - q(hill(65)) - 20, 6, q(hill(65)) + 20, MAT.RAMMED);              // прясло за башней
    for (const a of [0, 6, 12, 18, 24, 30, 36, 42, 62]) P.box(a + 1, H - q(hill(a + 3)) - 23, 3, 3, MAT.RAMMED);   // зубцы
    for (let a = 68; a < 96; a += 4) {                                             // свежая трамбовка
      const top = q(hill(a + 2)) + 9 + ((a >> 2) & 1);
      P.box(a, H - top, Math.min(4, 96 - a), top, MAT.MUD);
    }
    P.box(72, 43, 12, 6, MAT.BOARD);                                               // щиты опалубки
    P.trap(48, 61, 49, 60, 14, 67, MAT.RAMMED);                                    // сигнальная башня
    P.cut(53, 24, 4, 5);
    P.box(50, 8, 10, 6, MAT.TIMBER); P.cut(52, 9, 6, 4);                           // караулка
    P.box(45, 6, 20, 2, MAT.IRON); P.box(48, 3, 14, 3, MAT.IRON); P.box(52, 2, 6, 1, MAT.IRON);
    const crest = [];
    for (let a = 0; a <= 96; a += 4) crest.push([a, H - 1 - hill(Math.min(95, a))]);
    P.poly([[0, H], ...crest, [96, H]], MAT.MOSS);                                 // холм — своей массой
  }
  const X0 = q(X) - 48, Y0 = q(G) - H;
  paint(c, X0, Y0, wallBody.P, { seed: 89, chip: 0.05, moss: 0.04 });
  const px = (col, dx, dy, w = 1, h = 1) => R(c, col, X0 + dx, Y0 + dy, w, h);
  for (let k = 0; k < 4; k++) for (let a = 0; a < 48; a += 2) {                    // прослойки тростника
    const yy = H - q(hill(a + 3)) - 4 - 5 * k;
    if (yy > H - q(hill(a + 3)) - 19) px(C2, a + (k & 1), yy);
  }
  px(P, 43, 5, 2, 1); px(P, 42, 4, 1, 1); px(P, 65, 5, 2, 1); px(P, 67, 4, 1, 1);  // загнутые концы кровли
  px(P, 51, 1); px(P, 58, 1);                                                      // рожки конька
  for (const a of [69, 80, 91]) px(C2, a, 24, 1, 44 - q(hill(a)));                 // бамбуковые леса
  px(C2, 68, 27, 26, 1); px(C2, 68, 38, 26, 1);                                    // настилы
  for (const [x0, x1] of [[63, 68], [66, 71]]) for (let k = 0; k < 15; k++) px(C2, q(x0 + (x1 - x0) * k / 15), 53 - k);   // лестница
  px(C2, 64, 50, 3, 1); px(C2, 65, 46, 3, 1); px(C2, 67, 42, 3, 1);
  px(B2, 83, 22, 1, 5); px(B2, 89, 22, 1, 5); px(B2, 83, 23, 7, 2); px(P, 83, 23, 7, 1); px(P, 90, 22, 1, 3);   // ворот
  px(P, 86, 25, 1, 5); px(B2, 84, 30, 5, 4); px(D1, 85, 29, 3, 1);                 // корзина на верёвке
  px(B2, 92, 59, 4, 3); px(D1, 92, 58, 4, 1);                                      // корзины земли
}
function wallLive(c, X, G, t) {
  const f = ((t || 0) / 20 | 0) % 3;
  R(c, S, q(X) - 48 + 54, q(G) - 58 + (f === 1 ? 1 : 0), 2, 2 - (f === 1 ? 1 : 0));   // сигнальный огонь
}
const greatWall = split(wallBody, wallLive);

// ── ЗАПАД · Европа, лимес ─────────────────────────────────────────
// ель германского леса набором: ярусы лап зубцами
function sprucePoly(P, x, base, h) {
  const n = 5, th = h / (n + 0.6), pts = [];
  for (let k = 0; k < n; k++) { const y0 = base - k * th, hw = 5.5 - k; pts.push([x - hw, y0], [x - hw * 0.45, y0 - th * 0.75]); }
  const L = [[x - 1, base], ...pts, [x, base - h]];
  const R2 = L.slice(1, -1).map(([px, py]) => [2 * x + 1 - px, py]).reverse();
  P.poly([...L, ...R2, [x + 2, base]], MAT.MOSS);
}
// Башня лимеса: каменный низ квадрами, полуциркульные ворота с клинчатыми камнями и
// замком, бойница; по сторонам обрубки куртины, вал под дёрном, по краям ели — стена
// поперёк леса. Наверху деревянный ярус с галереей и шатёр тегул и имбрексов, по свесу
// антефиксы. Ворота открыты, часового нет; у ворот брошен выгнутый скутум с умбоном.
function limesTower(c, X, G) {
  const W = 56, H = 72;
  if (!limesTower.P) {
    const P = limesTower.P = plan(W, H);
    sprucePoly(P, 5, 69, 27); sprucePoly(P, 50, 69, 22);
    P.box(6, 55, 12, 10, MAT.ASHLAR); P.box(38, 57, 11, 8, MAT.ASHLAR); P.box(49, 60, 2, 5, MAT.ASHLAR);   // куртина
    P.box(18, 22, 20, 43, MAT.ASHLAR);                                        // каменный низ
    P.cut(27, 37, 2, 5);                                                      // бойница
    P.cut(24, 54, 8, 18); P.cut(25, 53, 6, 1); P.cut(26, 52, 4, 1);           // ворота в рост
    P.box(19, 12, 18, 8, MAT.BOARD); P.cut(22, 13, 3, 4); P.cut(31, 13, 3, 4);   // деревянный ярус
    P.box(14, 20, 28, 2, MAT.TIMBER);                                         // галерея: настил,
    P.box(14, 16, 28, 1, MAT.TIMBER);                                         // перила (на них садятся птицы)
    for (const x of [14, 23, 32, 41]) P.box(x, 16, 1, 4, MAT.TIMBER);
    P.trap(14, 41, 26, 30, 1, 11, MAT.TILE);                                  // шатёр тегул
    P.poly([[0, 72], [0, 67], [3, 65], [53, 65], [56, 67], [56, 72]], MAT.MOSS);   // вал под дёрном
  }
  const X0 = q(X) - 28, Y0 = q(G) - H;
  paint(c, X0, Y0, limesTower.P, { seed: 97, moss: 0.1, chip: 0.06, cracks: 2 });
  const px = (col, dx, dy, w = 1, h = 1) => R(c, col, X0 + dx, Y0 + dy, w, h);
  for (let x = 16; x < 41; x += 2) px(tone(MAT.TILE, 4), x, 2 + Math.round(Math.abs(x - 28) * 0.6), 1, 9 - Math.round(Math.abs(x - 28) * 0.6));   // имбрексы рёбрами
  for (let x = 14; x < 42; x += 3) px(C2, x, 11);                            // антефиксы по свесу
  for (const [x, y, col] of [[23, 52, P], [24, 51, C2], [25, 50, P], [30, 50, P], [31, 51, C2], [32, 52, P]]) px(col, x, y);   // клинчатые камни
  px(K, 27, 49, 2, 2);                                                        // замок
  const sx = 40;                                                              // скутум прислонён к куртине
  px(D1, sx, 63, 6, 9); px(V_F, sx + 1, 63, 4, 8); px(C2, sx + 1, 63, 1, 8); px(D2, sx + 4, 63, 1, 8);
  px(P, sx + 2, 66, 2, 2); px(K, sx + 2, 66, 1, 1);                           // умбон
}

// Акведук: квадры с рустом, нижний ярус высокими арками (клинчатые камни, замок
// костью, консоли на опорах), над ним малые арки, поверху канал под плитами. Правый
// край обрушен, последний столб стоит поодаль, на изломе трава; канал на изломе открыт
// и сух (известковый нарост — изнанка). Подача по графику не отменялась.
// Второй (#2) — сложен насухо, без раствора, гранит: два полных яруса узких арок,
// у камней по две ямки для клещей.
function aqueductPlan(v) {
  const P = plan(96, 56);
  const arch = (x, top, w, bot) => { P.clear(x, top + 2, w, bot - top - 2); P.clear(x + 1, top + 1, w - 2, 1); P.clear(x + 2, top, w - 4, 1); };
  if (!v) {
    P.box(0, 18, 76, 38, MAT.ASHLAR);                                        // нижний ярус
    for (let i = 0; i < 5; i++) arch(5 + i * 14, 24, 9, 56);
    P.clear(75, 18, 1, 6); P.clear(74, 18, 1, 3);                            // излом
    P.box(0, 8, 66, 10, MAT.ASHLAR);                                         // верхний ярус
    for (let j = 0; j < 9; j++) arch(3 + 7 * j, 11, 4, 18);
    P.clear(64, 8, 2, 4); P.clear(62, 8, 2, 1);
    P.box(0, 2, 66, 6, MAT.ASHLAR); P.box(0, 2, 66, 1, MAT.MARBLE);          // канал под плитами
    P.box(86, 26, 5, 30, MAT.ASHLAR); P.box(85, 23, 7, 3, MAT.ASHLAR);       // последний столб
  } else {
    P.box(0, 20, 96, 36, MAT.ASHLAR);
    for (let i = 0; i < 7; i++) arch(4 + i * 13, 25, 8, 56);
    P.box(0, 18, 96, 2, MAT.ASHLAR);
    P.box(0, 6, 96, 12, MAT.ASHLAR);
    for (let i = 0; i < 7; i++) arch(6 + i * 13, 9, 5, 18);
    P.box(0, 2, 96, 4, MAT.ASHLAR);
  }
  return P;
}
function aqueductPaint(c, X, G, P, v) {
  const X0 = q(X) - 48, Y0 = q(G) - 56;
  paint(c, X0, Y0, P, { seed: v ? 103 : 101, chip: 0.07, cracks: 3, moss: 0.06 });
  const px = (col, dx, dy, w = 1, h = 1) => R(c, col, X0 + dx, Y0 + dy, w, h);
  if (!v) {
    for (let i = 0; i < 5; i++) {                                            // клинчатые камни, замок, консоли
      const x = 5 + i * 14;
      px(P, x, 25); px(C2, x + 1, 24); px(P, x + 2, 23); px(C2, x + 6, 23); px(P, x + 7, 24); px(C2, x + 8, 25);
      px(K, x + 4, 22, 1, 2);
      px(D1, x - 2, 30); px(D1, x - 2, 42);
    }
    px(N, 65, 3, 1, 4); px(C2, 65, 4); px(C1, 65, 6);                        // открытый канал на изломе — сухо, нарост слоями
    px(M, 69, 17, 2, 1); px(M, 73, 18, 2, 1); px(M, 87, 22, 3, 1);           // трава на изломе
  } else {
    for (let y = 9; y < 54; y += 8) for (let x = 2; x < 92; x += 13) {         // ямки для клещей — по две на камне опоры
      const xx = x + ((y * 5) % 3);
      if (P.at(xx, y) && P.at(xx + 2, y)) { px(D2, xx, y); px(D2, xx + 2, y); }
    }
  }
}
function aqueduct(c, X, G) { if (!aqueduct.P) aqueduct.P = aqueductPlan(0); aqueductPaint(c, X, G, aqueduct.P, 0); }
function aqueduct2(c, X, G) { if (!aqueduct2.P) aqueduct2.P = aqueductPlan(1); aqueductPaint(c, X, G, aqueduct2.P, 1); }

// ── СЕВЕР · брохи, болота, Туле ───────────────────────────────────
// Брох: сухая кладка плитняком, профиль градирни с талией, цилиндр по ширине. Верх
// обрушен косо: на изломе внешняя скорлупа, щели галерей с плитами перекрытий, за ними
// внутренняя скорлупа; в толще стены ступени, на последней — гнездо. Вход низкий, под
// плитой. Снег на обеих стенах. Второй (#2) — целый, у болота, в тени (саги — Мауса);
// третий (#3) — на мысу, с него видно ещё два.
const BW = [42, 38, 35, 32, 30, 28, 27, 26, 25, 25, 25, 26, 26, 27, 28, 29, 30];
function brochShell(P, cx, base, k, broken, mat = MAT.DRYSTONE) {
  const W = BW.map(w => Math.round(w * k)), n = W.length, rh = 4 * k, L = [], R2 = [];
  for (let r = 0; r < n; r++) { L.push([cx - W[r] / 2, base - rh * r], [cx - W[r] / 2, base - rh * (r + 1)]); }
  if (!broken) {
    for (let r = n - 1; r >= 0; r--) R2.push([cx + W[r] / 2, base - rh * (r + 1)], [cx + W[r] / 2, base - rh * r]);
    P.poly([...L, ...R2], mat, FORM.CYL);
    return;
  }
  for (let r = 11; r >= 0; r--) R2.push([cx + W[r] / 2, base - rh * (r + 1)], [cx + W[r] / 2, base - rh * r]);
  P.poly([...L, [cx - 7, base - rh * n], [cx - 3, base - rh * n + 4], [cx + 1, base - rh * n + 8], [cx + 5, base - rh * n + 12], [cx + 9, base - rh * n + 16], [cx + 13, base - rh * 12], ...R2], mat, FORM.CYL);
}
function brochPlan(v) {
  const P = plan(44, 70), cx = 22;
  if (v === 2) {                                                             // на мысу: скала, два броха вдали
    P.poly([[0, 70], [2, 60], [9, 54], [18, 51], [30, 52], [38, 56], [44, 62], [44, 70]], MAT.BASALT);
    brochShell(P, 4, 49, 0.18, false); brochShell(P, 40, 47, 0.16, false);
    brochShell(P, cx + 2, 53, 0.72, true);
    P.box(cx - 1, 42, 6, 1, MAT.DRYSTONE); P.cut(cx, 43, 4, 10);
    return P;
  }
  brochShell(P, cx, 70, 1, v !== 1);
  if (v !== 1) {
    P.poly([[cx - 5, 3], [cx - 3, 3], [cx + 11, 21], [cx + 11, 27], [cx + 9, 27], [cx + 9, 23]], MAT.DRYSTONE);   // внутренняя скорлупа
    for (let k = 0; k < 4; k++) P.cut(cx - 4 + 4 * k, 5 + 4 * k, 2, 3);       // щели галерей
  } else {
    P.box(cx - 15, 1, 30, 2, MAT.DRYSTONE);                                  // целый верх
    P.poly([[30, 70], [32, 64], [40, 62], [44, 63], [44, 70]], MAT.GLASS);   // болото у подножия
  }
  P.box(cx - 5, 49, 10, 2, MAT.DRYSTONE); P.cut(cx - 3, 52, 6, 18);           // плита-перемычка, низкий вход
  if (v !== 1) { P.round(cx + 17, 66, 69, 4, MAT.DRYSTONE); P.round(cx + 20, 67, 69, 3, MAT.DRYSTONE); }   // обвал у подножия
  return P;
}
function brochPaint(c, X, G, P, v) {
  const X0 = q(X) - 22, Y0 = q(G) - 70;
  paint(c, X0, Y0, P, { seed: 107 + (v | 0), snow: v === 1 ? 0.25 : 0.5, chip: 0.05, moss: v === 1 ? 0.12 : 0.04 });
  const px = (col, dx, dy, w = 1, h = 1) => R(c, col, X0 + dx, Y0 + dy, w, h);
  if (!v) {
    for (let k = 0; k < 4; k++) px(K, 18 + 4 * k, 4 + 4 * k, 3, 1);            // плиты перекрытий поперёк щели
    px(C2, 31, 19, 2, 1); px(C2, 29, 17, 2, 1); px(C2, 27, 15, 2, 1);          // ступени в толще стены
    px(D2, 32, 18, 2, 1); px(C2, 33, 17, 1, 1);                                // гнездо на последней
  } else if (v === 1) {
    for (const [x, y] of [[10, 30], [15, 22], [29, 40], [26, 14], [12, 48]]) px(D1, x, y);   // щели качурок
    for (const [x, h] of [[33, 6], [36, 4], [41, 5]]) px(M, x, 63 - h, 1, h);   // камыш у воды
  } else {
    px(C1, 2, 66, 3, 1); px(C1, 8, 68, 4, 1); px(C1, 38, 67, 4, 1);            // пена у мыса
  }
}
function broch(c, X, G) { if (!broch.P) broch.P = brochPlan(0); brochPaint(c, X, G, broch.P, 0); }
function broch2(c, X, G) { if (!broch2.P) broch2.P = brochPlan(1); brochPaint(c, X, G, broch2.P, 1); }
function broch3(c, X, G) { if (!broch3.P) broch3.P = brochPlan(2); brochPaint(c, X, G, broch3.P, 2); }

// Болото жертв: чёрное зеркало со шугой по кромке, гать из поперечных кругляков разной
// длины, два идола-развилки из выбеленного дуба (один кренится), у подножия камни; над
// водой рукояти, согнутые клинки, копья вкось, круглый щит с умбоном на шесте, весло
// Пифея. Второе (#2) — без оружия: торфяной срез со следами лопаты, штабель торфа,
// чёрная вода; из торфа торчат загнутые колья (ими прижимали ко дну — изнанка).
function idolPoly(P, x, top, lean) {
  const pts = [[-3, 47], [-2, 36], [-3, 28], [-2, 6], [-1, 4], [-2, 0], [2, 0], [2, 4], [3, 6], [3, 28], [2, 36], [3, 47], [1, 47], [0, 39], [-1, 47]];
  const h = 47 - top;
  P.poly(pts.map(([dx, dy]) => { const y = top + dy * h / 47; return [x + dx + lean * (47 - (top + dy * h / 47)) / h, y]; }), MAT.MARBLE);
}
function bogPlan(v) {
  const P = plan(64, 48);
  if (!v) {
    idolPoly(P, 22, 8, 0); idolPoly(P, 33, 14, 3);
    P.round(19, 40, 42, 4, MAT.GRANITE); P.round(36, 41, 42, 3, MAT.GRANITE);
    P.poly([[50, 18], [53, 15], [57, 15], [60, 18], [60, 22], [57, 25], [53, 25], [50, 22]], MAT.BOARD);   // круглый щит
  } else {
    P.poly([[0, 48], [0, 30], [6, 28], [26, 29], [30, 33], [30, 48]], MAT.MUD);  // торфяной срез
    P.box(44, 34, 14, 4, MAT.MUD); P.box(46, 30, 10, 4, MAT.MUD); P.box(49, 26, 4, 4, MAT.MUD);   // штабель торфа
  }
  P.box(0, 42, 64, 6, MAT.GLASS);                                            // чёрная вода
  for (let x = 14, k = 0; x < 48; x += 3, k++) P.box(x, 40 + (k % 2), 2, 2 - (k % 2), MAT.TIMBER);   // гать
  return P;
}
function bogPaint(c, X, G, P, v) {
  const X0 = q(X) - 32, Y0 = q(G) - 48;
  paint(c, X0, Y0, P, { seed: v ? 113 : 109, chip: 0.04, moss: 0.15 });
  const px = (col, dx, dy, w = 1, h = 1) => R(c, col, X0 + dx, Y0 + dy, w, h);
  px(K, 0, 42, 12, 1); px(C1, 50, 42, 14, 1);                                  // шуга
  if (!v) {
    for (const [x, y] of [[21, 20], [22, 27], [34, 24], [33, 31]]) px(D4, x, y, 1, 4);   // волокна дуба
    for (const [sx, d] of [[4, 0], [8, 1], [12, 0], [44, 2], [51, 0]]) {           // рукояти и клинки остриём в воду
      const y = 32 + d; px(C2, sx, y); px(D2, sx, y + 1, 1, 2); px(C2, sx - 1, y + 3, 3, 1); px(P, sx, y + 4, 1, 6 - d);
    }
    for (const [x, y] of [[16, 31], [26, 34]]) { px(C2, x, y); px(P, x, y + 1, 1, 3); px(P, x + 1, y + 4); px(P, x + 2, y + 5, 1, 3); }   // согнутые вдвое
    for (let k = 0; k < 18; k++) px(P, 40 + (k >> 2), 24 + k);                  // копья вкось
    for (let k = 0; k < 14; k++) px(P, 47 - (k >> 3), 28 + k);
    px(P, 55, 25, 1, 17); px(P, 54, 19, 3, 2); px(K, 54, 19, 1, 1);             // шест, умбон
    px(C2, 62, 18, 1, 24); px(C2, 61, 38, 3, 4);                                // весло Пифея
  } else {
    for (const [x, y] of [[3, 31], [8, 31], [13, 32], [18, 31], [23, 32]]) px(D1, x, y, 1, 9);   // следы лопаты
    for (const [x, y] of [[31, 35], [36, 37], [41, 36]]) { px(C2, x, y, 1, 6); px(C2, x - 1, y - 1, 1, 1); px(C2, x - 2, y, 1, 1); }   // загнутые колья
  }
}
function bog(c, X, G) { if (!bog.P) bog.P = bogPlan(0); bogPaint(c, X, G, bog.P, 0); }
function bog2(c, X, G) { if (!bog2.P) bog2.P = bogPlan(1); bogPaint(c, X, G, bog2.P, 1); }

// ── РАВНИНА · край чужих карт ─────────────────────────────────────
// ковыль: пучок из 2–3 стеблей, верхушка клонится ветром
function grass(c, x, B, h, d) {
  R(c, C2, x, B - h, 1, h); R(c, C2, x + d, B - h - 1, 1, 1); R(c, C2, x + 2 * d, B - h, 1, 2);
  R(c, C2, x - d, B - h + 3, 1, h - 3);
}

// Портик фактории: колонны стоят, крыши нет; перекладина довезена на три пролёта, четвёртая
// колонна в половину, пятая — один барабан. Колонны гладкие: каннелюры режут после установки,
// гладкость — признак стройки; на барабанах и ступенях бобышки, за которые поднимали камень.
// У пятой — козлы с блоком, на верёвке висит барабан и качается на ветру. Степь съедает
// рамку: ковыль по стилобату, трава на архитраве; перед ступенями лежит мильный столб.
function porticoBody(c, X, G) {
  const W = 64, H = 50, HC = [36, 36, 36, 22, 7];
  if (!porticoBody.P) {
    const P = porticoBody.P = plan(W, H);
    P.box(0, 47, 64, 3, MAT.MARBLE); P.box(3, 45, 58, 2, MAT.MARBLE);         // стилобат
    for (let i = 0; i < 5; i++) {
      const k = 6 + i * 12, h = HC[i];
      P.box(k, 45 - h, 5, h, MAT.MARBLE, FORM.CYL);                           // гладкие колонны
      if (h === 36) P.box(k - 1, 7, 7, 2, MAT.MARBLE);
    }
    P.box(4, 3, 33, 4, MAT.MARBLE);                                           // архитрав над тремя
    P.box(20, 44, 13, 6, MAT.MARBLE); P.box(33, 44, 2, 6, MAT.ASHLAR);        // мильный столб лежит
    P.poly([[0, 50], [0, 46], [4, 45], [7, 47], [7, 50]], MAT.MOSS); P.poly([[57, 50], [58, 46], [62, 45], [64, 47], [64, 50]], MAT.MOSS);   // дёрн на ступенях
  }
  const X0 = q(X) - 32, Y0 = q(G) - H;
  paint(c, X0, Y0, porticoBody.P, { seed: 127, chip: 0.06, moss: 0.08 });
  const px = (col, dx, dy, w = 1, h = 1) => R(c, col, X0 + dx, Y0 + dy, w, h);
  for (let i = 0; i < 5; i++) { const k = 6 + i * 12; for (let y = 45 - HC[i] + 3; y < 44; y += 7) { px(tone(MAT.MARBLE, 1), k - 1, y); px(tone(MAT.MARBLE, 1), k + 5, y); } }   // бобышки
  px(tone(MAT.MARBLE, 1), 10, 47); px(tone(MAT.MARBLE, 1), 40, 45);
  px(B2, 49, 19, 1, 26); px(B2, 52, 19, 1, 26);                               // лестница к недовезённой
  for (const y of [22, 28, 34, 40]) px(B2, 49, y, 4, 1);
  for (let k = 0; k < 30; k++) { px(B2, 55 + (k >> 3), 14 + k); px(B2, 62 - (k >> 3), 14 + k); }   // козлы
  px(B2, 57, 13, 4, 1); px(P, 58, 14, 2, 1);                                  // блок
  px(M, 9, 2, 3, 1); px(M, 27, 1, 2, 2); px(M, 54, 36, 4, 2);                 // трава наверху
  for (const [g, h, d] of [[2, 9, 1], [4, 6, -1], [12, 7, 1], [16, 5, -1], [38, 8, -1], [41, 6, 1], [56, 9, 1], [61, 6, -1]]) grass(c, X0 + g, Y0 + 50, h, d);
  grass(c, X0 + 36, Y0 + 50, 5, 1);
}
function porticoLive(c, X, G) {
  const ax = q(X) - 32 + 59, ay = q(G) - 50 + 15;
  const b = hang(`hoist:${q(X)}:${q(G)}`, ax, ay, 14, { sail: 0.02, damp: 0.996, gy: q(G) });
  const s = Math.sin(angleOf(b)), tx = q(ax + s * 14), ty = ay + 14;
  for (let k = 0; k < 14; k++) R(c, P, q(ax + s * k), ay + k, 1, 1);         // верёвка
  R(c, D4, tx - 2, ty, 5, 4); R(c, C1, tx - 2, ty, 5, 1); R(c, C2, tx - 2, ty + 1, 1, 3);   // барабан на верёвке
}
const factoryPortico = split(porticoBody, porticoLive);

// амфора светлой глины: венчик, горло, покатые плечи, тулово, острое дно
// воткнуто в землю; tl — наклон верхней половины на 1 px
function amphora(c, a, B, tl) {
  const y = B - 11;
  R(c, C2, a + 2 + tl, y, 3, 1); R(c, C2, a + 3 + tl, y + 1, 1, 2);
  R(c, C2, a + 1 + tl, y + 3, 5, 1); R(c, C2, a, y + 4, 7, 3); R(c, C2, a + 1, y + 7, 5, 1);
  R(c, C2, a + 2, y + 8, 3, 2); R(c, C2, a + 3, y + 10, 1, 1);
  R(c, B1, a + 5, y + 4, 1, 4);
}

// Юрта у таможенного камня: войлочная юрта в полтора роста — стены-решётки с опоясками,
// гладкий купол войлоком, арканы крест-накрест, тюндюк; дверь в рост в раме. У входа
// гуннский котёл (колокол с рёбрами, ручки с грибками, конический поддон) на треноге над
// углями; амфоры между мирами; таможенный камень — стела с фронтончиком: сверху строки,
// снизу сарматская тамга; к камню привязан конь, щиплет ковыль. Дым — разметкой жизни.
function customsBody(c, X, G) {
  const W = 116, H = 42;
  if (!customsBody.P) {
    const P = customsBody.P = plan(W, H);
    P.box(2, 24, 44, 18, MAT.FELT);                                            // стены-решётки
    const d = [];
    for (let k = 0; k <= 16; k++) { const a = Math.PI * k / 16; d.push([24 + 24.5 * Math.cos(a), 25 - 19 * Math.sin(a) ** 0.85]); }
    P.poly(d, MAT.FELT, FORM.CYL);                                             // купол
    P.box(20, 23, 8, 19, MAT.TIMBER); P.cut(21, 24, 6, 18);                    // рама, дверь
    P.poly([[48, 21], [62, 21], [62, 25], [60, 29], [57, 31], [53, 31], [50, 29], [48, 25]], MAT.IRON, FORM.CYL);   // котёл-колокол
    P.box(54, 32, 2, 2, MAT.IRON); P.box(52, 34, 6, 1, MAT.IRON);              // поддон
    P.box(81, 10, 8, 32, MAT.MARBLE); P.wedge(85, 6, 9, 2, 10, MAT.MARBLE);    // стела с фронтончиком
    P.box(80, 9, 1, 1, MAT.MARBLE); P.box(89, 9, 1, 1, MAT.MARBLE);            // акротерии
  }
  const X0 = q(X) - 58, Y0 = q(G) - H;
  paint(c, X0, Y0, customsBody.P, { seed: 131, chip: 0.05 });
  const px = (col, dx, dy, w = 1, h = 1) => R(c, col, X0 + dx, Y0 + dy, w, h);
  px(C2, 3, 28, 42, 1); px(C2, 3, 34, 42, 1);                                 // опояски
  for (let k = 0; k < 15; k++) { px(D3, 8 + k, 23 - k); px(D3, 40 - k, 23 - k); }   // арканы крест-накрест
  px(P, 21, 6, 6, 1);                                                         // кольцо тюндюка
  for (let k = 0; k < 26; k++) { px(B2, 55 - (k >> 1) / 2 - (k >> 2), 15 + k); px(B2, 55 + (k >> 2) + (k >> 1) / 2, 15 + k); }   // тренога шире котла
  px(C2, 54, 14, 3, 1); px(P, 55, 16, 1, 4);                                  // вершина, цепь
  for (let x = 51; x < 61; x += 3) px(tone(MAT.IRON, 3), x, 23, 1, 5);        // рёбра котла
  px(C2, 48, 21, 15, 1);                                                      // кромка
  px(D1, 50, 17, 1, 4); px(D1, 59, 17, 1, 4); px(D1, 50, 17, 2, 1); px(D1, 58, 17, 2, 1);   // ручки дугой
  for (const x of [50, 52, 57, 59]) px(C2, x, 16);                            // грибки на ручках
  px(B2, 51, 40, 8, 1);                                                       // кострище
  amphora(c, X0 + 63, Y0 + H, 0); amphora(c, X0 + 71, Y0 + H, 1);
  for (const y of [14, 17, 20]) px(D2, 83, y, 5, 1);                          // строки
  px(C2, 84, 8, 2, 1); px(C2, 82, 23, 1, 1); px(C2, 87, 23, 1, 1);            // розетки
  px(N, 83, 27, 3, 3); px(D4, 84, 28, 1, 1); px(N, 84, 30, 1, 3); px(N, 85, 32, 2, 1);   // тамга: кольцо, ножка, крюк
  const hx = 94;                                                              // конь щиплет ковыль
  px(P, 89, 36, hx - 88, 1);                                                  // повод
  px(D1, hx + 5, 30, 11, 6); px(C2, hx + 5, 30, 11, 1);
  px(D1, hx + 2, 31, 4, 3); px(C2, hx + 2, 31, 3, 1);
  px(D1, hx, 33, 3, 5); px(D1, hx + 3, 34, 1, 1);
  for (const lx of [6, 8, 13, 15]) px(D1, hx + lx, 36, 1, 6);
  px(D1, hx + 16, 31, 1, 6);
  grass(c, X0 + 112, Y0 + H, 7, -1);
}
function customsLive(c, X, G, t) {
  R(c, S, q(X) - 58 + 53, q(G) - 2, 3 + ((t / 20 | 0) % 2), 1);              // угли под котлом
}
const customs = split(customsBody, customsLive);

// нарисованы набором (kit.js) — неподвижны и от места не зависят: запекаются без пробы; у маяка,
// стены, портика фактории и юрты тело запекается, огонь, барабан на верёвке — поверх (split).
// Повтор вида — свой рисунок по осмотру #2/#3 (draw2, draw3)
for (const f of [pantheon, pantheon2, epicurusGarden, epicurusGarden2, chaitya, chaitya2, limesTower, aqueduct, aqueduct2, broch, broch2, broch3, bog, bog2]) f.static = true;

// ── УТВАРЬ ДВОРОВ ─────────────────────────────────────────────────
// юг: штабель амфор, причальная тумба с канатом, пустой пьедестал.
function amphoraStack(c, X, Y) {
  const x = q(X), B = q(Y);                            // амфоры остриями в песок, плечом к плечу
  amphora(c, x - 11, B, 0); amphora(c, x - 4, B, 1); amphora(c, x + 3, B, 0);
  R(c, K, x - 9, B - 8, 2, 1); R(c, K, x - 2, B - 8, 2, 1); R(c, K, x + 5, B - 8, 2, 1);   // блики на плечах
  R(c, D1, x - 11, B - 1, 21, 1);
}

function bollard(c, X, Y) {
  const x = q(X), B = q(Y);
  R(c, D4, x - 3, B - 8, 7, 8); R(c, K, x - 3, B - 8, 1, 8); R(c, P, x + 3, B - 8, 1, 8);  // каменная тумба
  R(c, D5, x - 5, B - 11, 11, 3); R(c, K, x - 4, B - 11, 9, 1); R(c, P, x + 5, B - 10, 1, 2);  // грибом шапка
  R(c, C2, x - 3, B - 7, 7, 1); R(c, C2, x - 3, B - 5, 7, 1);        // шлаги каната
  R(c, C2, x + 4, B - 6, 2, 1); R(c, C2, x + 6, B - 5, 2, 1);        // конец — к воде
  R(c, C2, x - 8, B - 3, 5, 2); R(c, D2, x - 7, B - 3, 3, 1);        // бухта
}

function pedestal(c, X, Y) {
  const x = q(X), B = q(Y);
  R(c, D4, x - 6, B - 3, 12, 3); R(c, K, x - 6, B - 3, 12, 1);       // цоколь
  R(c, D5, x - 4, B - 12, 8, 9); R(c, C1, x - 4, B - 12, 1, 9); R(c, P, x + 3, B - 12, 1, 9);
  R(c, D2, x - 2, B - 10, 4, 5);                       // гладкое поле
  R(c, D4, x - 5, B - 14, 10, 2); R(c, K, x - 5, B - 14, 10, 1);     // карниз
  R(c, D4, x - 6, B - 16, 12, 2); R(c, K, x - 6, B - 16, 12, 1);     // плита: свободна, край отполирован
}

// восток: корзины земли с коромыслом, тачка с колесом посередине,
// малая обетная ступа.
function yokeBaskets(c, X, Y) {
  const x = q(X), B = q(Y);
  for (const bx of [x - 11, x + 4]) {
    R(c, B2, bx, B - 6, 7, 6); R(c, C2, bx, B - 6, 7, 1); R(c, C2, bx, B - 6, 1, 6);
    R(c, D2, bx + 1, B - 4, 6, 1); R(c, D2, bx + 1, B - 2, 6, 1);   // плетение
    R(c, D1, bx + 1, B - 8, 5, 2);                     // горка земли
  }
  R(c, C2, x - 12, B - 9, 24, 1);                      // бамбуковое коромысло
  R(c, P, x - 8, B - 11, 1, 2); R(c, P, x + 7, B - 11, 1, 2);       // петли верёвок
}

function wheelbarrow(c, X, Y) {
  const x = q(X), B = q(Y);
  const wl = x - 1, wt = B - 10;                       // колесо 10×10 под кладью
  R(c, D1, wl + 3, wt, 4, 1); R(c, D1, wl + 3, wt + 9, 4, 1); R(c, D1, wl, wt + 3, 1, 4); R(c, D1, wl + 9, wt + 3, 1, 4);
  R(c, D1, wl + 1, wt + 1, 2, 2); R(c, D1, wl + 7, wt + 1, 2, 2); R(c, D1, wl + 1, wt + 7, 2, 2); R(c, D1, wl + 7, wt + 7, 2, 2);
  R(c, C2, wl + 3, wt, 4, 1); R(c, C2, wl, wt + 3, 1, 4);
  R(c, P, wl + 4, wt + 1, 1, 8); R(c, P, wl + 1, wt + 4, 8, 1);   // спицы
  seg(c, B2, x - 3, B - 10, x - 13, B - 6);            // ручки назад
  R(c, B2, x - 10, B - 7, 1, 7);                       // ножка
  R(c, B2, x - 4, B - 11, 16, 2); R(c, C2, x - 4, B - 11, 16, 1);  // рама над колесом
  R(c, B2, x - 2, B - 16, 12, 5); R(c, C2, x - 2, B - 15, 1, 4); R(c, D1, x - 1, B - 16, 10, 1);  // корзина земли
}

function votiveStupa(c, X, Y) {
  const x = q(X), B = q(Y);
  R(c, D4, x - 6, B - 3, 12, 3); R(c, K, x - 6, B - 3, 12, 1);       // постамент
  R(c, D4, x - 5, B - 6, 10, 3); R(c, D4, x - 4, B - 8, 8, 2); R(c, D4, x - 2, B - 9, 4, 1);  // купол
  R(c, C1, x - 5, B - 6, 1, 3); R(c, C1, x - 4, B - 8, 1, 2); R(c, C1, x - 2, B - 9, 2, 1); R(c, P, x + 4, B - 6, 1, 3);
  R(c, D3, x - 2, B - 11, 4, 2); R(c, P, x - 2, B - 11, 4, 1);       // хармика
  R(c, P, x, B - 16, 1, 5);
  R(c, D4, x - 3, B - 13, 7, 1); R(c, D4, x - 2, B - 15, 5, 1);      // зонты
  R(c, C2, x - 3, B - 13, 2, 1); R(c, C2, x - 2, B - 15, 2, 1);
}

// запад: сундук с кодексами под откинутой крышкой, бронзовая жаровня
// на лапах, бочки (пиво для гарнизона заказано).
function bookChest(c, X, Y) {
  const x = q(X), B = q(Y);
  R(c, D1, x - 7, B - 13, 14, 3); R(c, C2, x - 7, B - 13, 14, 1);   // крышка откинута
  R(c, C1, x - 5, B - 10, 3, 2); R(c, K, x - 2, B - 10, 2, 2); R(c, C1, x + 1, B - 10, 3, 2);  // кодексы
  R(c, B1, x + 4, B - 10, 2, 2);
  R(c, B2, x - 7, B - 8, 14, 8); R(c, C2, x - 7, B - 8, 1, 8); R(c, P, x + 6, B - 8, 1, 8);  // короб
  R(c, D1, x - 4, B - 8, 1, 8); R(c, D1, x + 3, B - 8, 1, 8);        // железные полосы
  R(c, P, x - 1, B - 5, 2, 2);                         // замок
}

function brazier(c, X, Y, t) {
  const x = q(X), B = q(Y);
  R(c, D1, x - 5, B - 9, 10, 3); R(c, P, x - 5, B - 9, 10, 1);       // бронзовая чаша
  R(c, D1, x - 4, B - 6, 8, 1);
  R(c, D1, x - 4, B - 5, 1, 4); R(c, D1, x + 3, B - 5, 1, 4); R(c, D1, x - 1, B - 5, 1, 4);
  R(c, P, x - 5, B - 1, 2, 1); R(c, P, x + 3, B - 1, 2, 1); R(c, P, x - 2, B - 1, 3, 1);  // лапы
  const e = ((t || 0) / 22 | 0) % 2;
  R(c, S, x - 3 + e, B - 10, 5, 1);                    // угли
  R(c, P, x - e, B - 12, 1, 1);                        // дымок
}

function barrels(c, X, Y) {
  const x = q(X), B = q(Y);
  for (const [bx, h] of [[x - 11, 13], [x - 1, 11]]) {
    R(c, B2, bx + 1, B - h, 8, h); R(c, B2, bx, B - h + 2, 10, h - 4);
    R(c, C2, bx, B - h + 2, 1, h - 4); R(c, C2, bx + 1, B - h, 8, 1); R(c, P, bx + 9, B - h + 2, 1, h - 4);
    R(c, D1, bx, B - h + 3, 10, 1); R(c, D1, bx, B - 4, 10, 1);       // обручи
  }
}

// север: штабель торфа под снегом, загон сухой кладки с плетёной
// загородкой, лодка с двойными клювами штевней на берегу.
function peatStack(c, X, Y) {
  const x = q(X), B = q(Y);
  R(c, D2, x - 10, B - 4, 20, 4); R(c, D2, x - 8, B - 8, 16, 4); R(c, D2, x - 5, B - 12, 10, 4);
  R(c, C2, x - 10, B - 4, 2, 4); R(c, C2, x - 8, B - 8, 2, 4); R(c, C2, x - 5, B - 12, 2, 4);
  R(c, P, x + 9, B - 4, 1, 4); R(c, P, x + 7, B - 8, 1, 4); R(c, P, x + 4, B - 12, 1, 4);
  for (const [bx, by] of [[-4, 3], [1, 3], [6, 3], [-2, 7], [3, 7], [0, 11]]) R(c, D1, x + bx, B - by, 1, 3);
  R(c, K, x - 5, B - 13, 10, 1); R(c, K, x - 8, B - 9, 3, 1); R(c, K, x + 5, B - 9, 3, 1);   // снег
}

function sheepPen(c, X, Y) {
  const x = q(X), B = q(Y);
  for (const [dx, w, h] of [[-15, 5, 6], [-10, 4, 7], [-6, 5, 6], [6, 4, 7], [10, 5, 6]]) {
    R(c, D4, x + dx, B - h, w, h); R(c, C1, x + dx, B - h, w, 1); R(c, D2, x + dx, B - 3, w, 1);
  }
  R(c, B2, x - 1, B - 8, 1, 8); R(c, B2, x + 5, B - 8, 1, 8);        // колья загородки
  R(c, C2, x - 1, B - 7, 7, 1); R(c, C2, x - 1, B - 5, 7, 1); R(c, C2, x - 1, B - 3, 7, 1);
  R(c, K, x - 15, B - 7, 3, 1); R(c, K, x + 11, B - 7, 2, 1);
}

function longBoat(c, X, Y) {
  const x = q(X), B = q(Y);
  R(c, D2, x - 10, B - 5, 20, 3); R(c, C2, x - 10, B - 5, 20, 1);    // корпус
  R(c, D2, x - 8, B - 2, 16, 1);
  R(c, D2, x - 13, B - 7, 3, 4); R(c, D2, x - 15, B - 10, 2, 4); R(c, C2, x - 15, B - 10, 1, 4);  // штевень
  R(c, D2, x - 15, B - 4, 3, 1);                       // нижний клюв
  R(c, D2, x + 10, B - 7, 3, 4); R(c, D2, x + 13, B - 10, 2, 4); R(c, C2, x + 13, B - 10, 1, 4);
  R(c, D2, x + 12, B - 4, 3, 1);
  R(c, C2, x - 7, B - 7, 14, 1); R(c, B2, x - 7, B - 6, 14, 1);      // вёсла сложены
  R(c, K, x - 14, B - 1, 6, 1); R(c, K, x + 9, B - 1, 5, 1);         // снег
}

// равнина: бунчук на копье, мешки зерна и окованный модий, стол у
// лимана, занесённый песком, — таблички стопкой, свиток.
function horsetail(c, X, Y) {
  const x = q(X), B = q(Y);
  R(c, D2, x - 2, B - 2, 5, 2);
  R(c, B2, x, B - 26, 1, 24); R(c, C2, x - 1, B - 26, 1, 24);        // древко
  R(c, P, x, B - 30, 1, 1); R(c, P, x - 1, B - 29, 3, 3); R(c, K, x - 1, B - 29, 1, 2);  // наконечник
  R(c, P, x - 2, B - 26, 5, 1);                        // втулка
  R(c, D1, x - 3, B - 25, 7, 2);                       // узел хвоста
  for (const [dx, h] of [[-4, 6], [-3, 9], [-2, 7], [1, 8], [2, 10], [3, 6]]) R(c, D1, x + dx, B - 23, 1, h);  // пряди
  R(c, C2, x - 3, B - 23, 1, 4); R(c, P, x + 2, B - 15, 1, 2);
}

function grainSacks(c, X, Y) {
  const x = q(X), B = q(Y);
  for (const [sx, h] of [[x - 11, 9], [x - 5, 10]]) {
    R(c, C2, sx, B - h + 2, 6, h - 2); R(c, C2, sx + 1, B - h, 4, 2); R(c, D2, sx + 2, B - h + 1, 2, 1);
    R(c, D2, sx + 5, B - h + 2, 1, h - 2);
  }
  R(c, B2, x + 3, B - 7, 7, 7); R(c, C2, x + 3, B - 7, 1, 7);        // модий
  R(c, D1, x + 3, B - 6, 7, 1); R(c, D1, x + 3, B - 2, 7, 1);
  R(c, C1, x + 4, B - 9, 5, 2); R(c, C1, x + 5, B - 10, 3, 1);       // зерно горкой
}

function ovidTable(c, X, Y) {
  const x = q(X), B = q(Y);
  R(c, D1, x - 8, B - 8, 2, 8); R(c, D1, x + 6, B - 8, 2, 8);        // ножки
  R(c, B2, x - 10, B - 10, 20, 2); R(c, C2, x - 10, B - 10, 20, 1);  // столешница
  R(c, C2, x - 11, B - 3, 10, 3); R(c, C2, x - 9, B - 4, 6, 1); R(c, C2, x + 3, B - 2, 8, 2);  // песок намело
  R(c, C1, x - 7, B - 11, 6, 1); R(c, D2, x - 7, B - 12, 6, 1); R(c, C1, x - 7, B - 13, 6, 1);  // таблички стопкой
  R(c, K, x + 1, B - 12, 6, 2); R(c, D2, x + 1, B - 12, 1, 2);       // свиток
}

// ── ФАСАДЫ ТАБЛИЧЕК (18×30) ───────────────────────────────────────
// набором, тем же материалом, что и постройки: план один на фасад
function signKit(build, opt, over) {
  let P = null;
  const d = (c, X, G) => {
    if (!P) { P = plan(18, 30); build(P); }
    const X0 = q(X) - 9, Y0 = q(G) - 30;
    paint(c, X0, Y0, P, opt);
    if (over) over((col, dx, dy, w = 1, h = 1) => R(c, col, X0 + dx, Y0 + dy, w, h));
  };
  d.static = true;
  return d;
}
// юг: термополий — плоская кровля-терраса с кадкой, окно наверху, широкий проём, в
// плите прилавка устья долиев, лицо прилавка — помпейский красный
const signSouth = signKit(P => {
  P.box(1, 3, 16, 27, MAT.PLASTER); P.box(0, 2, 18, 1, MAT.MARBLE); P.box(12, 0, 3, 2, MAT.MOSS);
  P.cut(8, 7, 3, 3); P.cut(3, 13, 12, 9);
  P.box(3, 22, 12, 8, MAT.MARBLE);
}, { seed: 137, chip: 0.06 }, px => {
  px(V_F, 4, 24, 10, 4);                                                     // лицо прилавка
  for (const x of [4, 8, 12]) { px(N, x, 22, 2, 1); px(C1, x - 1, 22, 1, 1); }   // устья долиев
});
// восток: гуптская целла (Санчи, храм 17) — плоская кровля, портик на четырёх столбах
// с капителями-вазами, гладкая целла с дверью
const signEast = signKit(P => {
  P.box(1, 27, 16, 3, MAT.SANDSTONE); P.box(2, 10, 14, 17, MAT.SANDSTONE); P.box(0, 8, 18, 2, MAT.SANDSTONE);
  P.cut(7, 14, 4, 13);
  for (const x of [2, 6, 11, 15]) { P.box(x, 12, 1, 15, MAT.SANDSTONE); P.box(x - 1, 10, 3, 2, MAT.SANDSTONE); }
}, { seed: 139, chip: 0.05 });
// запад: кладка с прослойками кирпича (opus listatum) под двускаткой тегул с антефиксами,
// арочная дверь с замком, окно с решёткой — камера Боэция
const signWest = signKit(P => {
  P.box(1, 8, 16, 22, MAT.ASHLAR); P.box(1, 13, 16, 2, MAT.BRICK); P.box(1, 21, 16, 2, MAT.BRICK);
  P.wedge(9, 1, 7, 2, 18, MAT.TILE);
  P.cut(6, 19, 6, 11); P.cut(7, 18, 4, 1); P.cut(12, 9, 4, 4);
}, { seed: 141, chip: 0.06, moss: 0.06 }, px => {
  for (let x = 1; x < 18; x += 3) px(C2, x, 7);                               // антефиксы
  px(K, 8, 17, 2, 1); px(P, 13, 9, 1, 4); px(P, 15, 9, 1, 4);                 // замок, решётка
});
// север: сухая кладка, низкая толстая дерновая кровля со свесом и снегом, дёрн свисает
// клочьями; низкая дверь под плитой, круглый щит у двери
const signNorth = signKit(P => {
  P.box(1, 8, 16, 22, MAT.DRYSTONE);
  P.poly([[0, 9], [1, 4], [5, 2], [13, 2], [17, 4], [18, 9]], MAT.MOSS);
  P.box(6, 18, 7, 1, MAT.DRYSTONE); P.cut(7, 19, 5, 11);
  P.poly([[2, 20], [3, 19], [5, 19], [6, 20], [6, 22], [5, 23], [3, 23], [2, 22]], MAT.BOARD);
}, { seed: 143, snow: 0.7, chip: 0.04 }, px => {
  for (const x of [2, 9, 15]) px(M, x, 9, 1, 2);                              // дёрн клочьями
  px(P, 4, 21); px(N, 14, 12, 2, 2);                                          // умбон, продух
});

export const ARCH = {
  landmark: {
    name: 'Фаросский маяк', side: 'south', w: 72, h: 196,
    light: { dx: 0, dy: -170, r: 80 },
    draw: pharos,
    life: { smoke: [[8, -176]], birds: [[13, 17, -110, 'K']] },
    tender: true,           // маяк настоящий: проявляется только надпись, без подпорок
    potemkin: 'На доске у двери по штукатурке — имя царя. Где штукатурка осыпалась, из камня проступает другое имя, вырезанное глубже.',
  },
  south: [
    { name: 'Пантеон', w: 96, h: 66, draw: pantheon, draw2: pantheon2 },
    { name: 'сад Эпикура', w: 56, h: 50, draw: epicurusGarden, draw2: epicurusGarden2, life: { birds: [[-5, 14, -19]] } },
  ],
  east: [
    { name: 'пещерный храм-чайтья', w: 80, h: 62, draw: chaitya, draw2: chaitya2 },
    { name: 'стена в лесах', w: 96, h: 68, draw: greatWall, life: { smoke: [[7, -66]] } },
  ],
  west: [
    { name: 'башня лимеса', w: 56, h: 72, draw: limesTower, life: { birds: [[9, 12, -55]] } },
    { name: 'акведук', w: 96, h: 56, draw: aqueduct, draw2: aqueduct2 },
  ],
  north: [
    { name: 'брох', w: 44, h: 70, draw: broch, draw2: broch2, draw3: broch3, life: { birds: [[-14, -9, -67]] } },
    { name: 'болото жертв', w: 64, h: 48, draw: bog, draw2: bog2 },
  ],
  plain: [
    { name: 'портик фактории', w: 64, h: 50, draw: factoryPortico },
    { name: 'юрта у таможенного камня', w: 116, h: 42, draw: customs, life: { smoke: [[-34, -36]] } },
  ],
  sign: { south: signSouth, east: signEast, west: signWest, north: signNorth },
  props: {
    south: [
      { name: 'амфоры в песке', w: 22, h: 12, draw: amphoraStack },
      { name: 'причальная тумба', w: 16, h: 12, draw: bollard },
      { name: 'пустой пьедестал', w: 12, h: 16, unique: true, draw: pedestal },
    ],
    east: [
      { name: 'корзины земли с коромыслом', w: 24, h: 11, draw: yokeBaskets },
      { name: 'тачка с землёй', w: 26, h: 16, draw: wheelbarrow },
      { name: 'обетная ступа', w: 12, h: 16, draw: votiveStupa },
    ],
    west: [
      { name: 'сундук с кодексами', w: 16, h: 13, draw: bookChest },
      { name: 'жаровня', live: true, w: 12, h: 12, draw: brazier },
      { name: 'бочки', w: 22, h: 13, draw: barrels },
    ],
    north: [
      { name: 'штабель торфа', w: 22, h: 13, draw: peatStack },
      { name: 'загон сухой кладки', w: 30, h: 8, draw: sheepPen },
      { name: 'лодка на берегу', w: 30, h: 10, draw: longBoat },
    ],
    plain: [
      { name: 'бунчук', w: 8, h: 30, draw: horsetail },
      { name: 'мешки зерна и модий', w: 22, h: 10, draw: grainSacks },
      { name: 'стол у лимана', w: 22, h: 13, draw: ovidTable },
    ],
  },
};
