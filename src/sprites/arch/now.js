// ═══ АРХИТЕКТУРА · сейчас (2000-е — наши дни) ═══
// Будущее не отменили — отменили разрешение его воображать. Стекло вместо
// камня, экран вместо фасада, на каждой вершине — красный огонёк для
// самолётов, которых нет. Пять культур одного «сейчас», набором (kit.js):
//   юг      — игла над пустыней: крылья уступами по спирали, игла в треть
//             высоты; #2 — та же игла с поясами поста, сад на конденсате,
//             лифт и вечернее солнце наверху; библиотека у моря — барабан,
//             срезанный к воде, гранит в знаках, шар планетария, капитель в
//             воде; #2 — архив в бывшей церкви, глиняные фигурки на скамьях;
//             #3 — пустая сгоревшая коробка, ресторан со стопками книг
//   восток  — пагода из стекла: восемь раструбов, шар-демпфер в ленте
//             обсерватории качается против ветра; #2 — башня-решётка с
//             бетонным столбом по оси, у ног старая пагода; экран-фасад —
//             экран во весь фасад, код, глухой бок в кондиционерах
//   запад   — «огурец» в шести спиралях, линза на макушке; стеклянная
//             башня со срезом: днём в стекле соседи, ночью горит этаж; #2 —
//             выгнута к улице, козырёк ламелей, пятно стало тенью
//   север   — серверный ангар в сугробе под ветряком, горячий коридор в
//             щели, кот у чиллера; #2 — бочка, поднятая со дна, в
//             водорослях; #3 — греет город трубой, кот на тёплой трубе
//   равнина — долгострой под замершим краном, растяжка «дом готов», в
//             пролёте сохнет одеяло; панельная башня в разношёрстных лоджиях,
//             тарелки в одну точку, одна на крыше — вверх
// Доминанты: юг — «Линия», зеркальная стена уходит к горизонту и
// обрывается, дальше только колышки разметки; в стекле на горизонте —
// отражённое кольцо огня. Север — Всемирное семенохранилище: столовая гора
// в пластах, бетонный клин входа, полоса света над дверью.
// Утварь дворов: лодка со стеклянным дном, свая прилива, солнечная панель ·
// светофор с пустой рамкой, гашапоны, велосипед · тумбы, самокат, зарядка ·
// снегоход, кабельный барабан, тарелка · поддоны кирпича, ларёк, грибок.
// Пиксель-арт: fillRect по целым; дуг нет.

import { hang, tipOf, drawRope } from '../../world/hang.js';
import { rotor } from '../../world/mechanisms.js';
import { plan, paint, MAT, FORM, tone, split } from './kit.js';
import { phaseAt, skyAt } from '../../world/sky.js';
import { redNoon } from '../../world/redNoon.js';
import { wind } from '../../world/wind.js';
const N = '#0D0B0A', BONE = '#D9CFB8', ASH = '#8A8D8F', MIST = '#3D4A3A',
  CANDLE = '#E28A3A', CIN = '#C23B2B', SEP = '#3A3026',
  DARK = '#15100c', WOOD = '#241c14', WOOD2 = '#3a2418', STONE = '#3a3328',
  STONE2 = '#2a2620', BRICK = '#3a1c14', CONC = '#34302a',
  PAPER = '#c8b89a', PAPER2 = '#b0a284';

function R(c, col, x, y, w, h) { c.fillStyle = col; c.fillRect(x, y, w, h); }

// пологая линия горизонтальными отрезками (тросы, лопасти): без разрывов
function hline(c, col, x0, y0, x1, y1) {
  c.fillStyle = col;
  const n = Math.abs(y1 - y0) + 1, sy = Math.sign(y1 - y0);
  for (let i = 0; i < n; i++) {
    const xa = Math.round(x0 + (x1 - x0) * i / n), xb = Math.round(x0 + (x1 - x0) * (i + 1) / n);
    c.fillRect(Math.min(xa, xb), y0 + sy * i, Math.max(1, Math.abs(xb - xa)), 1);
  }
}

// пальма: ствол и два яруса поникших листьев (концы вниз), лунный блик
function palm(c, px, top, bot, lit = true) {
  R(c, WOOD2, px, top + 2, 1, bot - top - 2);
  R(c, MIST, px - 2, top, 5, 1); R(c, MIST, px - 4, top + 1, 9, 1);
  R(c, MIST, px - 5, top + 2, 1, 2); R(c, MIST, px + 5, top + 2, 1, 2);
  R(c, MIST, px - 3, top + 3, 2, 1); R(c, MIST, px + 2, top + 3, 2, 1);
  R(c, MIST, px - 4, top + 4, 1, 1); R(c, MIST, px + 4, top + 4, 1, 1);
  if (lit) R(c, ASH, px - 1, top, 3, 1);
}

// ── ЮГ ───────────────────────────────────────────────────────────────
// игла над пустыней: три крыла по плану игрек уступами по спирали —
// левое под луной, правое в тени, ядро посередине; серебристое стекло в
// стальных рёбрах. Жилое кончается на семи десятых высоты, выше — корона и
// голая игла без окон: около трети высоты, в высоту засчитана. Внизу —
// низкий подиум с лобби под рост, дюна и пальма. Огонь для самолётов —
// в жизни постройки (мигает).
// tiers: крыло — [x0, x1] у земли и верхи уступов сверху вниз с сужением
const BURJ = {
  left: { x0: 20, x1: 31, tops: [[98, 0], [78, 3], [60, 6], [46, 8]] },
  right: { x0: 37, x1: 48, tops: [[90, 0], [70, 3], [54, 6], [42, 8]] },
  core: { x0: 30, x1: 38, top: 36 },
};
function burjTower(P, B) {
  P.poly([[0, 120], [2, 114], [7, 110], [11, 112], [16, 120]], MAT.SAND);              // дюна
  // крылья: уступ за уступом, каждый — своя часть (свет на кромке уступа)
  for (const side of ['left', 'right']) {
    const w = B[side];
    let prev = 120;
    for (const [top, ins] of w.tops) {
      const xa = side === 'left' ? w.x0 + ins : w.x0, xb = side === 'left' ? w.x1 : w.x1 - ins;
      P.box(xa, top, xb - xa + 1, prev - top, MAT.CURTAIN, FORM.CYL);
      if (side === 'right') P.shade(1);
      prev = top;
    }
  }
  P.box(B.core.x0, B.core.top, B.core.x1 - B.core.x0 + 1, 120 - B.core.top, MAT.CURTAIN, FORM.CYL);   // ядро
  P.trap(31, 37, 32, 36, 24, B.core.top, MAT.CURTAIN);                                // корона
  P.box(33, 10, 2, 14, MAT.STEEL); P.box(34, 1, 1, 9, MAT.STEEL);                     // игла
  P.box(12, 114, 44, 6, MAT.CONCRETE); P.box(11, 113, 46, 1, MAT.MARBLE);             // подиум
  P.cut(14, 116, 14, 2, MAT.GLASS); P.cut(41, 116, 13, 2, MAT.GLASS);
  P.cut(31, 102, 6, 18, MAT.DARK);                                                    // лобби под рост
}
function burjBody(c, x, gy) {
  const X0 = Math.round(x) - 34, Y0 = Math.round(gy) - 120;
  let P = burjBody.P;
  if (!P) { P = burjBody.P = plan(68, 120); burjTower(P, BURJ); }
  paint(c, X0, Y0, P, { seed: 161, chip: 0.02, drips: [[22, 99, 3], [40, 91, 3], [26, 79, 2]] });
  // песок под уступами: пыль лежит на каждой полке
  for (const w of [BURJ.left, BURJ.right]) for (const [top, ins] of w.tops) {
    const xa = w === BURJ.left ? w.x0 + ins : w.x0 + 1;
    R(c, PAPER2, X0 + xa + 1, Y0 + top, 2, 1);
  }
  palm(c, X0 + 59, Y0 + 98, Y0 + 113);
}
const burj = burjBody; burjBody.static = true;

// вторая игла: та же башня, повёрнутая крылом к зрителю — переднее крыло
// ниже, его полки выступают вперёд. Отмечены два пояса: восьмидесятый и
// сто пятидесятый этажи (выше них вечерний пост прерывают позже). У
// подножия вместо дюны — сад на конденсате: кочки зелени, две пальмы,
// нитка воды от подиума. Живое: огонёк лифта ползёт по ядру; вечером тень
// земли поднимается по башне, и наверху солнце держится дольше.
const BURJ2 = {
  left: { x0: 21, x1: 31, tops: [[94, 0], [70, 3], [50, 6], [40, 8]] },
  right: { x0: 37, x1: 47, tops: [[86, 0], [62, 3], [46, 6], [38, 8]] },
  core: { x0: 30, x1: 38, top: 36 },
};
function burj2Body(c, x, gy) {
  const X0 = Math.round(x) - 34, Y0 = Math.round(gy) - 120;
  let P = burj2Body.P;
  if (!P) {
    P = burj2Body.P = plan(68, 120);
    burjTower(P, BURJ2);
    P.clear(0, 108, 17, 12);                                                         // дюны нет — сад
    P.box(31, 58, 7, 56, MAT.CURTAIN, FORM.CYL);                                     // переднее крыло
    P.box(30, 100, 9, 1, MAT.CURTAIN); P.box(30, 80, 9, 1, MAT.CURTAIN);              // полки уступов вперёд
    P.box(12, 114, 44, 6, MAT.CONCRETE); P.box(11, 113, 46, 1, MAT.MARBLE);
    P.cut(14, 116, 14, 2, MAT.GLASS); P.cut(41, 116, 13, 2, MAT.GLASS);
    P.cut(31, 102, 6, 18, MAT.DARK);
    for (const [cx, top, w] of [[3, 114, 6], [9, 115, 5], [57, 114, 6], [63, 115, 5], [6, 116, 9]]) P.round(cx, top, 119, w, MAT.MOSS);
  }
  paint(c, X0, Y0, P, { seed: 163, chip: 0.02 });
  // пояса этажей поста: тёмная строка техэтажа, над ней кромка костью
  for (const y of [77, 39]) for (let k = 0; k < 68; k++) {
    if (!burj2Body.P.at(k, y) || burj2Body.P.at(k, y) === MAT.DARK) continue;
    R(c, tone(MAT.CURTAIN, 0), X0 + k, Y0 + y, 1, 1); R(c, BONE, X0 + k, Y0 + y - 1, 1, 1);
  }
  // нитка воды от подиума к саду
  R(c, tone(MAT.GLASS, 3), X0 + 4, Y0 + 119, 8, 1); R(c, tone(MAT.GLASS, 3), X0 + 56, Y0 + 119, 9, 1);
  palm(c, X0 + 5, Y0 + 98, Y0 + 114); palm(c, X0 + 62, Y0 + 100, Y0 + 114);
}
function burj2Live(c, x, gy, t) {
  const X0 = Math.round(x) - 34, Y0 = Math.round(gy) - 120, T = (t | 0) % 240;
  if (T < 180) R(c, BONE, X0 + 34, Y0 + 110 - Math.round(T * 70 / 180), 1, 1);   // лифт
  // вечер: тень земли поднимается по башне, выше неё — последнее солнце на левых гранях
  const sky = skyAt(phaseAt(t || 0));
  let line = null;
  if (sky.sun && sky.sun.az > Math.PI / 2 && sky.sun.elev < 0.2) line = Math.round(120 - 84 * (1 - sky.sun.elev / 0.2));
  else if (sky.name === 'сумерки' && sky.moon < 0.3) line = Math.round(36 - 34 * sky.moon / 0.3);
  if (line === null || redNoon.k > 0.5) return;
  for (const w of [BURJ2.left]) {
    let prev = 120;
    for (const [top, ins] of w.tops) {
      const xa = w.x0 + ins, y0 = Math.max(top + 1, line);
      if (y0 < prev) R(c, BONE, X0 + xa, Y0 + y0, 1, prev - y0);
      if (line < prev && top + 1 < line) R(c, tone(MAT.CURTAIN, 1), X0 + xa, Y0 + top + 1, 1, Math.min(prev, line) - top - 1);
      prev = top;
    }
  }
  if (line < 36) R(c, BONE, X0 + 32, Y0 + Math.max(25, line), 1, 36 - Math.max(25, line));
  if (line < 24) R(c, BONE, X0 + 33, Y0 + Math.max(10, line), 1, 24 - Math.max(10, line));
}
const burj2 = split(burj2Body, burj2Live);

// новая библиотека у моря: барабан читального зала, срезанный наискось к
// воде одной ровной линией кровли — поверх тонкая полоса стеклянных
// фонарей; глухая изогнутая стена из гранита, в рядах знаков всех
// письменностей — у каждого свой вид; вход под рост. Слева шар
// планетария сидит в кольце постамента, у земли; пальма. Море рисует двор;
// у подножия, в воде, — ионическая капитель двумя волютами, на ней чайки
const GLYPHS = [[[0, 0, 1, 2]], [[0, 0, 2, 1]], [[0, 0, 1, 1], [2, 0, 1, 1]], [[0, 0, 2, 1], [0, 1, 1, 1]], [[0, 1, 1, 1], [1, 0, 1, 1], [2, 1, 1, 1]],
  [[0, 0, 1, 2], [1, 1, 1, 1]], [[1, 0, 1, 2], [0, 1, 1, 1]], [[0, 0, 3, 1], [1, 1, 1, 1]], [[0, 0, 1, 1], [1, 1, 1, 1]], [[0, 1, 2, 1], [1, 0, 1, 1]]];
function libraryBody(c, x, gy) {
  const X0 = Math.round(x) - 48, Y0 = Math.round(gy) - 48;
  let P = libraryBody.P;
  if (!P) {
    P = libraryBody.P = plan(96, 48);
    const ring = []; for (let k = 0; k < 16; k++) ring.push([12 + 9 * Math.cos(k * Math.PI / 8), 32 + 9 * Math.sin(k * Math.PI / 8)]);
    P.poly(ring, MAT.PLASTER, FORM.CYL);                                              // шар планетария
    P.box(1, 40, 23, 2, MAT.CONCRETE); P.box(2, 42, 21, 6, MAT.CONCRETE);             // кольцо постамента
    P.poly([[26, 10], [86, 30], [86, 48], [26, 48]], MAT.GRANITE, FORM.CYL);         // барабан
    P.poly([[25, 7], [88, 28], [88, 30], [25, 9]], MAT.GLASS);                       // кровля — фонари полосой
    P.cut(48, 30, 6, 18, MAT.DARK);                                                  // вход под рост
  }
  paint(c, X0, Y0, P, { seed: 167, chip: 0.03 });
  // знаки в граните: ряды, у каждого знака свой вид
  let n = 0;
  for (let y = 16; y < 44; y += 4) for (let gx = 28; gx < 84; gx += 4) {
    const g = GLYPHS[(Math.imul(n++ * 7 + y, 2654435761) >>> 0) % GLYPHS.length];
    if (libraryBody.P.at(gx, y - 1) !== MAT.GRANITE || libraryBody.P.at(gx + 3, y + 2) !== MAT.GRANITE) continue;
    for (const [dx, dy, w, h] of g) { R(c, tone(MAT.GRANITE, 4), X0 + gx + dx, Y0 + y + dy - 1, w, 1); R(c, tone(MAT.GRANITE, 0), X0 + gx + dx, Y0 + y + dy, w, h); }
  }
  // фонари кровли: точки света по полосе
  for (let k = 0; k < 10; k++) { const fx = 28 + k * 6; R(c, tone(MAT.GLASS, 4), X0 + fx, Y0 + 8 + Math.round((fx - 25) / 3), 1, 1); }
  palm(c, X0 + 23, Y0 + 21, Y0 + 40, false);
  // капитель в воде у подножия: абака и две волюты, рябь поверх
  const L = X0;
  R(c, ASH, L + 85, Y0 + 44, 10, 1);
  R(c, ASH, L + 85, Y0 + 45, 1, 2); R(c, ASH, L + 87, Y0 + 45, 1, 2); R(c, ASH, L + 86, Y0 + 46, 1, 1);
  R(c, ASH, L + 92, Y0 + 45, 1, 2); R(c, ASH, L + 94, Y0 + 45, 1, 2); R(c, ASH, L + 93, Y0 + 46, 1, 1);
  R(c, ASH, L + 89, Y0 + 46, 2, 1);
  R(c, ASH, L + 84, Y0 + 42, 3, 1); R(c, ASH, L + 91, Y0 + 41, 4, 1);
}
const library = libraryBody; libraryBody.static = true;

// вторая библиотека — архив пропадающего из сети в бывшей церкви: белый
// храмовый фасад прошлого века на трёх ступенях, колонны с капителями,
// ровный аттик с урнами, во фризе — имя без букв. Купола нет. За колоннами
// тёмная лоджия; в высоких окнах бокового зала видны скамьи, на них рядами
// сидят глиняные фигурки сотрудников, в полроста, у каждой своя голова.
// Читателей нет; в тёмном зале мигают огоньки стоек (жизнь второго).
function library2Body(c, x, gy) {
  const X0 = Math.round(x) - 48, Y0 = Math.round(gy) - 48;
  let P = library2Body.P;
  if (!P) {
    P = library2Body.P = plan(96, 48);
    P.box(70, 12, 24, 36, MAT.PLASTER).shade(1);                                     // боковой зал
    for (const wx of [73, 81, 89]) P.cut(wx, 18, 4, 16, MAT.DARK);
    P.box(12, 17, 58, 25, MAT.PLASTER);                                              // задняя стена портика
    P.cut(14, 19, 54, 23, MAT.DARK);                                                 // лоджия
    P.box(8, 46, 64, 2, MAT.MARBLE); P.box(10, 44, 60, 2, MAT.MARBLE); P.box(12, 42, 56, 2, MAT.MARBLE);   // ступени
    for (let i = 0; i < 6; i++) {
      const cx = 14 + i * 10;
      P.box(cx, 19, 3, 23, MAT.MARBLE, FORM.CYL);
      P.box(cx - 1, 17, 5, 2, MAT.MARBLE); P.box(cx - 1, 41, 5, 1, MAT.MARBLE);
    }
    P.box(10, 11, 60, 6, MAT.MARBLE); P.box(8, 10, 64, 1, MAT.MARBLE);              // антаблемент, карниз
    P.box(12, 5, 56, 5, MAT.PLASTER);                                                // аттик
    for (const ux of [13, 64]) { P.round(ux + 1.5, 1, 5, 4, MAT.MARBLE); }           // урны на аттике
  }
  paint(c, X0, Y0, P, { seed: 171, chip: 0.03 });
  // имя во фризе — штрихами, без букв
  c.fillStyle = tone(MAT.MARBLE, 1); for (let k = 0; k < 11; k++) c.fillRect(X0 + 18 + k * 4, Y0 + 13, 2 + (k % 3 === 0 ? 1 : 0), 1);
  // двери в лоджии: средняя приоткрыта
  for (const dx of [26, 37, 48]) R(c, tone(MAT.IRON, 1), X0 + dx, Y0 + 28, 6, 14);
  R(c, N, X0 + 39, Y0 + 28, 2, 14);
  // в окнах зала — скамьи и глиняные фигурки рядами, головы разные
  const clay = [tone(MAT.MUD, 3), tone(MAT.BAKED, 2), tone(MAT.MUD, 2), tone(MAT.TILE, 3)];
  for (const [k, wx] of [[0, 73], [1, 81], [2, 89]]) {
    for (const row of [0, 1]) {
      const by = Y0 + 21 + row * 7;
      R(c, tone(MAT.BOARD, 3), X0 + wx, by + 4, 4, 1);                               // скамья
      for (const fx of [0, 2]) {
        const h = (k * 5 + row * 3 + fx) % 4;
        R(c, clay[h], X0 + wx + fx, by + 1, 1, 3);                                  // тело сидя
        R(c, clay[(h + 1) % 4], X0 + wx + fx, by - (h & 1), 1, 1 + (h & 1));          // голова — у каждой своя
      }
    }
  }
}
const library2 = library2Body; library2Body.static = true;

// третья библиотека пуста и сгорела: двухэтажная коробка с парапетом,
// все проёмы пусты, над каждым копоть языком; кровля провалилась, сквозь
// окна второго этажа под провалом видно небо. Над дверью — доска с именем
// без букв. Справа через стену — соседний ресторан: навес, в окне стопки
// книг до потолка, на двери бледный листок меню; на гребне стены — две
// книги, как их передавали из рук в руки. Огня нет: здание сгорело давно.
function library3Body(c, x, gy) {
  const X0 = Math.round(x) - 48, Y0 = Math.round(gy) - 48;
  let P = library3Body.P;
  if (!P) {
    P = library3Body.P = plan(96, 48);
    P.box(2, 12, 56, 36, MAT.BAKED);
    P.box(1, 10, 58, 2, MAT.CONCRETE); P.box(2, 28, 56, 2, MAT.CONCRETE);             // парапет, пояс
    P.clear(28, 10, 16, 6);                                                         // провал кровли
    P.box(29, 14, 5, 1, MAT.TIMBER); P.box(38, 15, 5, 1, MAT.TIMBER);                 // балки торчат
    for (const k of [0, 1, 4]) P.cut(6 + k * 10, 16, 5, 9, MAT.DARK);
    for (const k of [0, 1, 3, 4]) P.cut(6 + k * 10, 32, 5, 10, MAT.DARK);
    P.cut(26, 30, 7, 18, MAT.DARK);                                                 // дверь
    P.box(24, 26, 11, 2, MAT.CONCRETE);                                             // доска над дверью
    P.box(58, 26, 6, 22, MAT.BRICK);                                                // стена к соседу
    P.box(64, 24, 30, 24, MAT.PLASTER);                                             // ресторан
    P.box(62, 22, 34, 2, MAT.BOARD);                                                // навес
    P.cut(67, 29, 14, 13, MAT.GLASS);
    P.cut(84, 30, 6, 18, MAT.DARK);
  }
  paint(c, X0, Y0, P, {
    seed: 173, chip: 0.1, cracks: 4,
    soot: [[6, 16, 5, 10], [16, 16, 5, 12], [46, 16, 5, 9], [6, 32, 5, 7], [16, 32, 5, 7], [36, 32, 5, 8], [46, 32, 5, 7], [26, 30, 7, 6]],
  });
  // окна под провалом: насквозь — небо
  for (const k of [2, 3]) { R(c, tone(MAT.GLASS, 3), X0 + 6 + k * 10, Y0 + 16, 5, 9); R(c, ASH, X0 + 7 + k * 10, Y0 + 18, 1, 1); }
  // имя на доске — штрихами
  c.fillStyle = tone(MAT.CONCRETE, 0); for (let k = 0; k < 4; k++) c.fillRect(X0 + 25 + k * 2 + (k > 1 ? 1 : 0), Y0 + 26, 1, 1);
  // две книги на гребне стены
  R(c, tone(MAT.TILE, 3), X0 + 59, Y0 + 24, 2, 2); R(c, tone(MAT.LOGS, 3), X0 + 61, Y0 + 23, 2, 3);
  // в окне ресторана — стопки до потолка, корешками
  const spines = [tone(MAT.LOGS, 3), tone(MAT.THATCH, 2), tone(MAT.TILE, 3), tone(MAT.BOARD, 4), tone(MAT.FELT, 3)];
  for (let sx = 0; sx < 14; sx += 2) for (let sy = 0; sy < 13; sy++) R(c, spines[(sx * 3 + sy) % 5], X0 + 67 + sx, Y0 + 29 + sy, 2, 1);
  // меню на двери
  R(c, PAPER, X0 + 85, Y0 + 34, 3, 4); R(c, SEP, X0 + 85, Y0 + 35, 3, 1);
}
const library3 = library3Body; library3Body.static = true;

// ── ВОСТОК ───────────────────────────────────────────────────────────
// пагода из стекла: над сужающимся основанием — восемь одинаковых раструбов,
// каждый шире кверху, их можно сосчитать; стекло цвета мглы в поясах
// этажей, кромка каждого яруса светлее, по углам — загнутые кончики-жуи.
// Над ярусами — корона в два уступа и шпиль. На основании — монета с
// квадратной дырой. В верхнем ярусе — светлая лента обсерватории, в ней
// висит шар: качается против ветра (живое). Огонь — в жизни постройки.
const TP = { cx: 15 };
function taipeiBody(c, x, gy) {
  const X0 = Math.round(x) - 15, Y0 = Math.round(gy) - 120, cx = TP.cx;
  let P = taipeiBody.P;
  if (!P) {
    P = taipeiBody.P = plan(30, 120);
    P.trap(5, 24, 8, 21, 93, 114, MAT.TINT);                                         // основание
    for (let k = 0; k < 8; k++) { const yb = 92 - 8 * k; P.trap(cx - 7, cx + 6, cx - 10, cx + 9, yb - 7, yb, MAT.TINT); }
    P.box(cx - 5, 17, 10, 12, MAT.TINT); P.box(cx - 3, 13, 6, 4, MAT.TINT);           // корона
    P.box(cx - 1, 3, 2, 10, MAT.STEEL); P.box(cx, 1, 1, 2, MAT.STEEL);               // шпиль
    P.cut(cx - 6, 30, 12, 4, MAT.DARK);                                              // лента обсерватории
    P.box(1, 115, 28, 5, MAT.CURTAIN);                                               // молл
    P.cut(cx - 3, 102, 6, 18, MAT.DARK);                                             // вход под рост
  }
  paint(c, X0, Y0, P, { seed: 179, chip: 0.02 });
  // жуи по углам ярусов: кончики загнуты вверх
  for (let k = 0; k < 8; k++) { const yt = 92 - 8 * k - 7; R(c, BONE, X0 + cx - 11, Y0 + yt - 1, 1, 2); R(c, ASH, X0 + cx + 10, Y0 + yt - 1, 1, 2); }
  // монета с квадратной дырой на основании
  const my = Y0 + 95;
  R(c, PAPER2, X0 + cx - 1, my, 3, 1); R(c, PAPER2, X0 + cx - 2, my + 1, 5, 3); R(c, PAPER2, X0 + cx - 1, my + 4, 3, 1);
  R(c, N, X0 + cx, my + 2, 1, 1);
  // светлая лента обсерватории: шар висит на тросах
  R(c, tone(MAT.TINT, 4), X0 + cx - 6, Y0 + 30, 12, 4); R(c, ASH, X0 + cx - 1, Y0 + 30, 1, 1); R(c, ASH, X0 + cx + 1, Y0 + 30, 1, 1);
}
// шар-демпфер: стоит против ветра — башню качает ветер, шар отстаёт
function taipeiLive(c, x, gy, t) {
  const X0 = Math.round(x) - 15, Y0 = Math.round(gy) - 120, cx = TP.cx;
  const w = wind.at(x, gy - 90), sway = Math.max(-2, Math.min(2, Math.round(-w.x * 3 + Math.sin((t || 0) * 0.025) * w.s * 1.5)));
  R(c, ASH, X0 + cx - 1 + sway, Y0 + 31, 3, 3); R(c, BONE, X0 + cx - 1 + sway, Y0 + 31, 1, 1);
}
const taipei = split(taipeiBody, taipeiLive);

// вторая пагода — башня-решётка: треножник светлой стали с вогнутым
// сбегом, плотная решётка вместо стекла; по оси сквозь решётку виден
// бетонный столб — стоит отдельно от стен, как в деревянных пагодах; две
// площадки-кольца, над ними длинная мачта. У ног — старая деревянная
// пагода, по которой считали новую (нов.: ставим рядом для сравнения).
const ST = { cx: 19 };
function skytreeBody(c, x, gy) {
  const X0 = Math.round(x) - 15, Y0 = Math.round(gy) - 120, cx = ST.cx;
  let P = skytreeBody.P;
  if (!P) {
    P = skytreeBody.P = plan(30, 120);
    P.poly([[cx - 9, 120], [cx - 8, 111], [cx - 6, 100], [cx - 4.5, 88], [cx - 3, 72], [cx - 3, 56], [cx + 3, 56], [cx + 3, 72], [cx + 4.5, 88], [cx + 6, 100], [cx + 8, 111], [cx + 9, 120]], MAT.STEEL);
    P.box(cx - 2, 37, 4, 15, MAT.STEEL);                                             // ствол меж площадок
    P.box(cx - 6, 52, 12, 4, MAT.GLASS); P.box(cx - 6, 51, 12, 1, MAT.STEEL);       // нижняя площадка
    P.box(cx - 4, 34, 8, 3, MAT.GLASS); P.box(cx - 4, 33, 8, 1, MAT.STEEL);         // верхняя
    P.box(cx - 1, 20, 2, 13, MAT.STEEL); P.box(cx, 2, 1, 18, MAT.STEEL);             // мачта
    // старая пагода: пять крыш с выносом, шпиль-сорин
    P.box(3, 117, 5, 3, MAT.TILE);                                                  // цоколь
    for (let k = 0; k < 5; k++) { const yb = 117 - k * 4, hw = 4 - (k >> 1); P.box(5 - (hw >> 1), yb - 2, hw, 2, MAT.TILE); P.box(5 - hw, yb - 3, hw * 2 + 1, 1, MAT.BASALT); }
    P.box(5, 94, 1, 7, MAT.IRON);                                                   // сорин
  }
  paint(c, X0, Y0, P, { seed: 181, chip: 0.02 });
  // решётка: просветы между стержнями, к оси — столб
  for (let y = 57; y < 120; y++) for (let k = 0; k < 30; k++) {
    if (skytreeBody.P.at(k, y) !== MAT.STEEL) continue;
    if (((k + y) % 3 === 1 || ((k - y) % 3 + 3) % 3 === 1) && y % 6 !== 0) R(c, DARK, X0 + k, Y0 + y, 1, 1);
  }
  for (let y = 38; y < 51; y++) if (y % 3 === 1) R(c, DARK, X0 + cx - 1, Y0 + y, 2, 1);
  R(c, tone(MAT.CONCRETE, 2), X0 + cx - 1, Y0 + 57, 2, 63); R(c, tone(MAT.CONCRETE, 3), X0 + cx - 1, Y0 + 57, 1, 63);   // столб
  R(c, tone(MAT.GLASS, 4), X0 + cx - 5, Y0 + 53, 10, 1); R(c, tone(MAT.GLASS, 4), X0 + cx - 3, Y0 + 35, 6, 1);   // свет площадок
  // концы крыш старой пагоды загнуты вверх
  for (let k = 0; k < 5; k++) { const yb = 117 - k * 4, hw = 4 - (k >> 1); R(c, ASH, X0 + 4 - hw, Y0 + yb - 4, 1, 1); R(c, ASH, X0 + 6 + hw, Y0 + yb - 4, 1, 1); }
}
const skytree = skytreeBody; skytreeBody.static = true;

// экран-фасад: башня, у которой вместо окон — экран во весь фасад, от
// третьего этажа до карниза; на экране код. Что это дом, видно сбоку:
// боковая грань в тени — та же стена без экрана, глухой бетон, на каждом
// этаже кондиционер и подтёк под ним. Вдоль левой кромки на кронштейне —
// столб световых коробов, по коробу на этаж: горят, букв нет. Камера на
// углу экрана смотрит вниз, на тротуар. Внизу — витрина, дверь под рост,
// у двери штабель нетронутых пакетов доставки. Вход метро рядом — свой
// (world/oldways.js, U5).
const SCR = { x: 10, y: 14, w: 30, h: 58 };
function screenBody(c, x, gy) {
  const W = 60, H = 96, X0 = Math.round(x) - 30, Y0 = Math.round(gy) - H;
  let P = screenBody.P;
  if (!P) {
    P = screenBody.P = plan(W, H);
    P.box(14, 5, 12, 5, MAT.IRON);                       // кровельная установка
    P.box(33, 0, 1, 10, MAT.IRON); P.box(31, 7, 5, 2, MAT.IRON);  // мачта связи
    P.poly([[42, 12], [56, 16], [56, 96], [42, 96]], MAT.CONCRETE).shade(1);   // боковая грань
    for (let y = 22; y < 88; y += 8) { P.box(46, y, 5, 3, MAT.IRON); P.cut(53, y + 1, 2, 2, MAT.DARK); }   // кондиционеры, вентрешётки
    P.box(7, 10, 36, 3, MAT.CONCRETE);                   // карниз
    P.box(8, 13, 34, 83, MAT.CONCRETE);
    P.cut(SCR.x - 1, SCR.y - 1, SCR.w + 2, SCR.h + 2, MAT.DARK);   // рама экрана
    P.box(8, 74, 34, 2, MAT.CONCRETE);                   // пояс над витриной
    P.cut(10, 79, 17, 14, MAT.GLASS);
    P.cut(29, 78, 7, 18, MAT.DARK);
    P.box(7, 17, 1, 58, MAT.IRON);                       // кронштейн столба коробов
  }
  const drips = [[14, 76, 6], [24, 76, 4]];
  for (let y = 22; y < 88; y += 8) drips.push([47 + ((y >> 3) & 1) * 2, y + 3, 4]);
  paint(c, X0, Y0, P, { seed: 151, chip: 0.03, drips });
  // экран: светодиоды тусклой сеткой, посередине код — светлое поле, тёмные модули
  const sx = X0 + SCR.x, sy = Y0 + SCR.y;
  R(c, STONE2, sx, sy, SCR.w, SCR.h);
  c.fillStyle = DARK; for (let y = 1; y < SCR.h; y += 2) c.fillRect(sx, sy + y, SCR.w, 1);
  const qx = sx + 4, qy = sy + 15;
  R(c, ASH, qx - 1, qy - 1, 23, 23);
  for (const [fx, fy] of [[0, 0], [14, 0], [0, 14]]) { R(c, N, qx + fx, qy + fy, 7, 7); R(c, ASH, qx + fx + 1, qy + fy + 1, 5, 5); R(c, N, qx + fx + 2, qy + fy + 2, 3, 3); }
  R(c, N, qx + 14, qy + 14, 5, 5); R(c, ASH, qx + 15, qy + 15, 3, 3); R(c, N, qx + 16, qy + 16, 1, 1);   // малый маркер
  c.fillStyle = N;
  for (let j = 0; j < 21; j++) for (let i = 0; i < 21; i++) {
    if ((i < 8 && j < 8) || (i > 12 && j < 8) || (i < 8 && j > 12) || (i > 12 && j > 12 && i < 20 && j < 20)) continue;
    const h = (Math.imul(i * 73 + j * 151 + 9, 2654435761) >>> 0) / 4294967296;
    if (h < 0.47) c.fillRect(qx + i, qy + j, 1, 1);
  }
  // над кодом и под ним — полосы рекламы без товара: светлее сетки, без знаков
  R(c, STONE, sx + 3, sy + 4, 24, 3); R(c, ASH, sx + 3, sy + 4, 9, 3);
  R(c, STONE, sx + 3, sy + 42, 24, 2); R(c, STONE, sx + 7, sy + 46, 16, 2);
  // столб световых коробов: горят, букв нет
  for (let k = 0; k < 7; k++) {
    const by = Y0 + 18 + k * 8;
    R(c, ASH, X0 + 1, by, 6, 7); R(c, PAPER, X0 + 2, by + 1, 4, 5);
  }
  // камера на углу экрана: кронштейн вбок, объектив вниз, на тротуар
  R(c, ASH, X0 + 40, Y0 + 13, 3, 1); R(c, ASH, X0 + 42, Y0 + 14, 2, 2); R(c, STONE, X0 + 41, Y0 + 16, 2, 1);
  R(c, N, X0 + 41, Y0 + 17, 1, 1);
  // пакеты доставки у двери
  R(c, PAPER2, X0 + 36, Y0 + 92, 6, 4); R(c, SEP, X0 + 36, Y0 + 94, 6, 1);
  R(c, PAPER2, X0 + 37, Y0 + 88, 4, 4); R(c, SEP, X0 + 37, Y0 + 89, 4, 1);
}
// живое: строка развёртки ползёт вниз по экрану; бегущая полоса внизу; изредка экран гаснет на миг
function screenLive(c, x, gy, t) {
  const X0 = Math.round(x) - 30, Y0 = Math.round(gy) - 96, sx = X0 + SCR.x, sy = Y0 + SCR.y, T = t | 0;
  if (T % 700 < 5) { R(c, N, sx, sy, SCR.w, SCR.h); return; }
  R(c, DARK, sx, sy + (T >> 1) % SCR.h, SCR.w, 1);
  c.fillStyle = ASH;
  for (let k = 0; k < 5; k++) { const px = ((k * 6 - (T >> 2)) % 30 + 30) % 30; c.fillRect(sx + px, sy + 53, Math.min(3, 30 - px), 1); }
}
const screenTower = split(screenBody, screenLive);

// ── ЗАПАД ────────────────────────────────────────────────────────────
// «огурец»: пуля из стекла в диагональной стальной сетке, шире всего на
// трети высоты, макушка оживалом; выше собора третьего кольца. По ней
// вьются шесть тёмных спиралей — спереди видны три; верхушка — линза.
// Внизу плита площади, вход под рост; в плите — венок и штрихи: под ней
// римское захоронение, найденное при стройке и возвращённое на место.
const GH = { W: 38, H: 128, top: 4, base: 126 };
const ghHalf = y => {                                     // полуширина на строке y (0 — верх рамки)
  const u = (GH.base - y) / (GH.base - GH.top);           // 0 у земли … 1 у макушки
  return u < 0.32 ? 14 + 4 * u / 0.32 : 18 * Math.pow(Math.max(0, 1 - ((u - 0.32) / 0.7) ** 1.8), 0.55);
};
function gherkinBody(c, x, gy) {
  const X0 = Math.round(x) - 19, Y0 = Math.round(gy) - GH.H, cx = 19;
  let P = gherkinBody.P;
  if (!P) {
    P = gherkinBody.P = plan(GH.W, GH.H);
    const L = [], Rr = [];
    for (let y = GH.top; y <= GH.base; y += 2) { const hw = Math.max(1, ghHalf(y)); L.push([cx - hw, y]); Rr.push([cx + hw, y]); }
    P.poly([...L, ...Rr.reverse()], MAT.DIAGRID, FORM.CYL);
    P.box(0, 126, 38, 2, MAT.GRANITE);                                              // плита площади
    P.cut(cx - 3, 108, 6, 18, MAT.DARK);                                            // вход под рост
  }
  paint(c, X0, Y0, P, { seed: 207, chip: 0.01 });
  // шесть спиралей тёмного стекла: видны только с лицевой стороны
  for (let y = GH.top + 3; y < 107; y++) {
    const hw = Math.round(ghHalf(y));
    if (hw < 3) continue;
    for (let k = 0; k < 6; k++) {
      const th = k * Math.PI / 3 + y * 0.07, cs = Math.cos(th);
      if (cs < 0.15) continue;
      const bw = Math.max(1, Math.round(3.2 * cs)), px = Math.round(cx + hw * Math.sin(th) * 0.92 - bw / 2);
      const a = Math.max(cx - hw + 1, px), b = Math.min(cx + hw - 1, px + bw);
      if (b > a) R(c, tone(MAT.GLASS, 1), X0 + a, Y0 + y, b - a, 1);
    }
  }
  // линза на макушке
  R(c, tone(MAT.GLASS, 0), X0 + cx - 2, Y0 + GH.top, 4, 2); R(c, BONE, X0 + cx - 1, Y0 + GH.top, 1, 1);
  // плита захоронения: венок кольцом и штрихи — без букв
  R(c, tone(MAT.GRANITE, 4), X0 + 26, Y0 + 126, 9, 1);
  R(c, tone(MAT.GRANITE, 0), X0 + 27, Y0 + 127, 1, 1); R(c, tone(MAT.GRANITE, 0), X0 + 29, Y0 + 127, 1, 1); R(c, tone(MAT.GRANITE, 0), X0 + 28, Y0 + 126, 1, 1);
  c.fillStyle = tone(MAT.GRANITE, 1); for (const k of [31, 33]) c.fillRect(X0 + k, Y0 + 127, 1, 1);
}
const gherkin = gherkinBody; gherkinBody.static = true;

// стеклянная башня: навесная стена тёмного стекла в высоких витражах,
// макушка срезана наискось одной диагональю, мачта у высокого края; лобби
// двойной высоты, в нём эскалатор. Днём в стекле — соседние башни и пуля
// «огурца», ломаная по стёклам, эскалатор ходит; ночью — она сама: горит
// один этаж, эскалатор стоит (живое: по фазе суток). Огонь мачты — в жизни.
function glassBody(c, x, gy) {
  const X0 = Math.round(x) - 23, Y0 = Math.round(gy) - 112;
  let P = glassBody.P;
  if (!P) {
    P = glassBody.P = plan(46, 112);
    P.poly([[3, 112], [3, 20], [43, 10], [43, 112]], MAT.GLASS);
    P.box(40, 1, 1, 10, MAT.STEEL);                                                 // мачта
    P.box(1, 92, 44, 1, MAT.CONCRETE);                                              // козырёк лобби
    P.cut(4, 93, 38, 19, MAT.GLASS);
    P.cut(20, 98, 6, 14, MAT.DARK);
  }
  paint(c, X0, Y0, P, { seed: 211 });
  // стойки и редкие пояса: высокие витражи, а не клетка окон
  c.fillStyle = tone(MAT.GLASS, 0); for (let k = 1; k < 8; k++) { const sx = 3 + k * 5, top = Math.round(20 - (sx - 3) / 4) + 1; c.fillRect(X0 + sx, Y0 + top, 1, 92 - top); }
  c.fillStyle = tone(MAT.GLASS, 3); for (let y = 28; y < 92; y += 9) c.fillRect(X0 + 4, Y0 + y, 39, 1);
  // срез макушки — кромкой пепла
  hline(c, ASH, X0 + 3, Y0 + 19, X0 + 43, Y0 + 9);
  // эскалатор в лобби: косая лента с поручнем
  for (let k = 0; k < 12; k++) R(c, tone(MAT.STEEL, 1), X0 + 28 + k, Y0 + 110 - k, 2, 1);
  hline(c, ASH, X0 + 28, Y0 + 107, X0 + 40, Y0 + 96);
}
// днём в стекле — соседние башни и пуля «огурца», ломаная по стёклам; ход эскалатора;
// ночью — она сама: горит один этаж
function glassLive(c, x, gy, t) {
  const X0 = Math.round(x) - 23, Y0 = Math.round(gy) - 112, T = t | 0;
  const sky = skyAt(phaseAt(t || 0));
  if (sky.sun && redNoon.k < 0.5) {
    c.fillStyle = tone(MAT.GLASS, 3);
    for (const [bx, bw, top] of [[5, 6, 44], [23, 7, 52], [37, 5, 60]]) c.fillRect(X0 + bx, Y0 + top, bw, 92 - top);
    c.fillStyle = tone(MAT.GLASS, 1); for (const [bx, bw, top] of [[5, 6, 44], [23, 7, 52], [37, 5, 60]]) for (let y = top + 3; y < 92; y += 4) c.fillRect(X0 + bx + 1, Y0 + y, bw - 2, 1);
    // пуля соседа: контур пеплом, на каждом стыке витража сдвинут на точку
    c.fillStyle = ASH;
    for (let y = 34; y < 92; y++) {
      const u = (92 - y) / 58, hw = Math.round(5 * Math.pow(Math.max(0, 1 - ((u - 0.3) / 0.72) ** 2), 0.5) + (u < 0.3 ? 1 : 0));
      const jog = ((X0 + 14) / 5 | 0) & 1 ? 0 : 1, sx = 16 + (((y / 9) | 0) & 1);
      c.fillRect(X0 + sx - hw, Y0 + y, 1, 1); c.fillRect(X0 + sx + hw + jog, Y0 + y, 1, 1);
    }
    c.fillStyle = tone(MAT.STEEL, 3); for (let k = 0; k < 4; k++) c.fillRect(X0 + 29 + ((k * 3 + (T >> 3)) % 12), Y0 + 109 - ((k * 3 + (T >> 3)) % 12), 1, 1);   // ступени ползут
  } else if (sky.name === 'ночь') {
    R(c, PAPER2, X0 + 9, Y0 + 55, 26, 2);
    c.fillStyle = tone(MAT.GLASS, 1); for (const fx of [13, 22, 30]) c.fillRect(X0 + fx, Y0 + 55, 1, 2);   // люди внутри
  }
}
const glassTower = split(glassBody, glassLive);

// вторая башня выгнута к улице: шире кверху, вогнутое лицо собирало солнце
// в пятно — этажи прогибаются «улыбкой». Теперь на верхней половине стекла —
// козырёк из горизонтальных ламелей, нижняя треть голая; наверху — сад под
// стеклянной короной. У подножия — экраны и кадки с деревьями, чтобы ветер
// спотыкался. Пятно стало тенью: днём на тротуаре лежит тень, ползёт за
// солнцем (живое). Огонь на короне — в жизни второго.
const WT_EDGE = y => 9 - Math.round(8 * ((112 - y) / 100) ** 1.6);   // левая кромка: к верху выносится наружу
function walkieBody(c, x, gy) {
  const X0 = Math.round(x) - 23, Y0 = Math.round(gy) - 112;
  let P = walkieBody.P;
  if (!P) {
    P = walkieBody.P = plan(46, 112);
    const L = [], Rr = [];
    for (let y = 12; y <= 108; y += 4) { const e = WT_EDGE(y); L.push([e, y]); Rr.push([45 - e, y]); }
    P.poly([...L, ...Rr.reverse()], MAT.CURTAIN, FORM.CYL);
    P.poly([[3, 12], [9, 8], [37, 8], [43, 12]], MAT.GLASS);                         // сад наверху под стеклом
    P.box(0, 108, 46, 4, MAT.CONCRETE);                                              // тротуар у подножия
    P.cut(19, 94, 8, 14, MAT.DARK);
    // экраны от ветра и кадки
    P.box(2, 100, 1, 8, MAT.STEEL); P.box(42, 100, 1, 8, MAT.STEEL);
    for (const kx of [4, 36]) { P.box(kx, 104, 5, 4, MAT.CONCRETE); P.round(kx + 2.5, 97, 104, 6, MAT.MOSS); }
  }
  paint(c, X0, Y0, P, { seed: 213, chip: 0.01 });
  // вогнутое лицо: этажи прогибаются улыбкой по нижней трети
  for (let y = 66; y < 92; y += 4) { const e = WT_EDGE(y) + 1, w = 44 - 2 * e; for (let k = 0; k < w; k++) R(c, tone(MAT.CURTAIN, 1), X0 + e + k, Y0 + y + Math.round(2 * Math.sin(Math.PI * k / w)), 1, 1); }
  // козырёк: ламели по верхней половине лица, под каждой — тень
  for (let y = 16; y < 58; y += 3) { const e = WT_EDGE(y) + 1; R(c, tone(MAT.STEEL, 2), X0 + e, Y0 + y, 44 - 2 * e, 1); R(c, N, X0 + e, Y0 + y + 1, 44 - 2 * e, 1); }
  // сад под короной: зелень внутри переплёта
  c.fillStyle = tone(MAT.MOSS, 3); for (const gx of [10, 15, 22, 29, 34]) c.fillRect(X0 + gx, Y0 + 10, 3, 1);
}
function walkieLive(c, x, gy, t) {
  const X0 = Math.round(x) - 23, Y0 = Math.round(gy) - 112;
  const sky = skyAt(phaseAt(t || 0));
  if (!sky.sun || redNoon.k > 0.5) return;
  const sx = Math.round(23 - Math.cos(sky.sun.az) * 12);                           // за солнцем — по тротуару
  R(c, N, X0 + sx - 6, Y0 + 109, 12, 2); R(c, N, X0 + sx - 4, Y0 + 111, 8, 1);
}
const walkie = split(walkieBody, walkieLive);

// ── СЕВЕР ────────────────────────────────────────────────────────────
// серверный ангар во льду: длинная глухая коробка из профлиста под снегом —
// окон в зал нет, только пояс жалюзи забора воздуха; на кровле ряд
// одинаковых сухих охладителей с кожухами вентиляторов; горячий коридор
// светится в щель приоткрытой двери — единственное тепло; у крайнего
// охладителя, тёплого, сидит кот. У торца — выхлопные трубы двух дизелей
// и цистерна (на случай, если погаснет город). Сугроб до половины стены с
// карнизом. Рядом ветряк (крутит ветер — живое), огонь гондолы — живой.
function hangar(P, door = true) {
  P.box(24, 58, 64, 2, MAT.SNOW);                                                  // снег на кровле
  P.box(25, 60, 62, 38, MAT.IRON);
  P.cut(30, 64, 52, 6, MAT.DARK);                                                  // пояс жалюзи забора
  if (door) P.cut(60, 80, 8, 18, MAT.DARK);
  for (const fx of [28, 42, 56, 70]) { P.box(fx, 51, 11, 5, MAT.STEEL); P.cut(fx + 1, 53, 9, 2, MAT.DARK); }   // охладители
  P.box(20, 23, 2, 75, MAT.STEEL); P.box(18, 92, 6, 6, MAT.CONCRETE);               // мачта ветряка
  P.box(88, 86, 6, 12, MAT.IRON).shade(1);                                         // цистерна дизелей
  P.box(89, 70, 1, 16, MAT.STEEL); P.box(92, 72, 1, 14, MAT.STEEL);                 // выхлопные трубы
}
function hangarOver(c, X0, Y0) {
  // ламели жалюзи, кожухи вентиляторов
  c.fillStyle = tone(MAT.IRON, 3); for (let k = 0; k < 3; k++) c.fillRect(X0 + 30, Y0 + 65 + k * 2, 52, 1);
  for (const fx of [28, 42, 56, 70]) { R(c, ASH, X0 + fx + 1, Y0 + 50, 4, 1); R(c, ASH, X0 + fx + 6, Y0 + 50, 4, 1); }
  R(c, N, X0 + 89, Y0 + 70, 1, 1); R(c, N, X0 + 92, Y0 + 72, 1, 1);               // устья труб
}
function snowdrift(c, X0, Y0) {
  // сугроб до половины стены: пологий скат, наверху карниз нависает тенью
  for (let k = 0; k < 34; k++) {
    const h = Math.round(18 * Math.pow(1 - k / 34, 0.8)), x = X0 + 22 + k;
    R(c, tone(MAT.SNOW, k < 6 ? 4 : 3), x, Y0 + 98 - h, 1, h);
    R(c, tone(MAT.SNOW, 5), x, Y0 + 98 - h, 1, 1);
  }
  R(c, tone(MAT.SNOW, 1), X0 + 26, Y0 + 82, 8, 1);                                // тень под карнизом
  R(c, tone(MAT.SNOW, 4), X0 + 56, Y0 + 96, 32, 2);
}
function cat(c, x, y) {   // кот силуэтом пеплом: сидит, хвост вниз
  R(c, ASH, x, y + 2, 4, 3); R(c, ASH, x, y, 2, 2); R(c, ASH, x, y - 1, 1, 1); R(c, ASH, x + 2, y - 1, 1, 1); R(c, ASH, x + 4, y + 3, 1, 3);
}
function dataBody(c, x, gy) {
  const X0 = Math.round(x) - 47, Y0 = Math.round(gy) - 98;
  let P = dataBody.P;
  if (!P) { P = dataBody.P = plan(94, 98); hangar(P); }
  paint(c, X0, Y0, P, { seed: 217, snow: 0.3, chip: 0.03 });
  hangarOver(c, X0, Y0);
  R(c, CANDLE, X0 + 63, Y0 + 81, 1, 17);                                           // горячий коридор в щель
  cat(c, X0 + 81, Y0 + 48);
  snowdrift(c, X0, Y0);
}
function dataLive(c, x, gy, t) {
  const L = Math.round(x) - 47, G = Math.round(gy), T = t | 0;
  const rt = rotor(c, `rotor:${L}:${G}`, L + 21, G - 76, 20, { blade: ASH, hub: BONE, nac: ASH });
  if ((T + 10) % 90 < 60) R(c, CIN, rt.bx, G - 78, 1, 1);
  if (T % 120 < 90) R(c, CIN, L + 61, G - 17, 1, 1);                    // диод стойки в щели двери
}
const dataCenter = split(dataBody, dataLive);

// второй ангар утопили в море и через два года подняли: герметичная белая
// бочка без окон и дверей, днища на фланцах, лежит на раме-балласте у кромки
// причала; обросла водорослями гуще книзу, в углах рамы сидят актинии. Над
// ней — портал баржи на ногах с раскосами, лебёдка на балке, тросы ещё на
// проушинах; на причале кольцом — оборванный кабель. С бочки капает (живое).
// Людей нет.
function natickBody(c, x, gy) {
  const X0 = Math.round(x) - 47, Y0 = Math.round(gy) - 98;
  let P = natickBody.P;
  if (!P) {
    P = natickBody.P = plan(94, 98);
    P.box(0, 92, 70, 6, MAT.CONCRETE);                                             // причал
    // портал: две ноги-рамы и балка, лебёдка
    for (const lx of [8, 64]) { P.box(lx, 34, 2, 58, MAT.IRON); P.box(lx + 4, 34, 2, 58, MAT.IRON); }
    P.box(6, 30, 66, 4, MAT.IRON); P.box(34, 25, 10, 5, MAT.IRON).shade(1);
    // рама-балласт и бочка
    P.poly([[14, 92], [20, 84], [58, 84], [64, 92]], MAT.IRON);
    P.box(16, 64, 46, 20, MAT.STEEL, FORM.CYL);
    P.round(16, 64, 83, 8, MAT.STEEL); P.round(62, 64, 83, 8, MAT.STEEL);          // торцы скруглены
  }
  paint(c, X0, Y0, P, { seed: 223, chip: 0.02 });
  // раскосы ног портала: А-рама, не ворота
  for (const lx of [8, 64]) for (let k = 0; k < 54; k += 2) { R(c, tone(MAT.IRON, 3), X0 + lx + 2 + ((k >> 3) & 1 ? 1 : 0), Y0 + 36 + k, 1, 1); }
  // днища на фланцах
  R(c, tone(MAT.STEEL, 1), X0 + 19, Y0 + 64, 1, 20); R(c, tone(MAT.STEEL, 1), X0 + 59, Y0 + 64, 1, 20);
  // кабель кольцом на причале
  R(c, N, X0 + 3, Y0 + 90, 8, 1); R(c, N, X0 + 2, Y0 + 91, 1, 1); R(c, N, X0 + 11, Y0 + 91, 1, 1); R(c, N, X0 + 3, Y0 + 92, 8, 1); R(c, N, X0 + 12, Y0 + 90, 3, 1);
  // бочка в горизонтальном свете: верх светлый, рёбра жёсткости
  c.fillStyle = tone(MAT.STEEL, 1); for (const rx of [24, 34, 44, 54]) c.fillRect(X0 + rx, Y0 + 65, 1, 18);
  // водоросли пятнами по низу бочки, актинии точками
  c.fillStyle = tone(MAT.MOSS, 2); for (const [ax, ay, w] of [[17, 79, 9], [27, 81, 12], [41, 78, 8], [50, 80, 10], [20, 74, 3], [46, 73, 4], [57, 76, 4]]) c.fillRect(X0 + ax, Y0 + ay, w, 2);
  for (const [ax, ay, col] of [[16, 86, CIN], [19, 88, PAPER], [58, 86, CIN], [61, 88, PAPER], [44, 79, CIN]]) { R(c, col, X0 + ax, Y0 + ay, 1, 1); R(c, tone(MAT.MOSS, 4), X0 + ax, Y0 + ay + 1, 1, 1); }
  // тросы с балки на бочку
  c.fillStyle = ASH; for (const tx of [26, 52]) c.fillRect(X0 + tx, Y0 + 34, 1, 30);
  R(c, tone(MAT.IRON, 3), X0 + 24, Y0 + 33, 5, 2); R(c, tone(MAT.IRON, 3), X0 + 50, Y0 + 33, 5, 2);   // тележки
  // море справа от причала: рябь
  c.fillStyle = tone(MAT.GLASS, 3); for (const [wx, wy, w] of [[72, 93, 8], [82, 95, 9], [74, 97, 6], [86, 92, 6]]) c.fillRect(X0 + wx, Y0 + wy, w, 1);
}
function natickLive(c, x, gy, t) {
  const X0 = Math.round(x) - 47, Y0 = Math.round(gy) - 98, T = t | 0;
  for (const [dx, ph] of [[24, 0], [38, 17], [51, 33]]) {   // капли с бочки на причал
    const k = (T + ph) % 50;
    if (k < 8) R(c, tone(MAT.GLASS, 4), X0 + dx, Y0 + 84 + k, 1, 1);
  }
}
const natick = split(natickBody, natickLive);

// третий ангар греет город: горячий коридор подключили к трубам — щель
// закрыта, воздуховод ведёт в будку теплового насоса, от неё две трубы в
// утеплителе, подача и обратка, на опорах уходят к городку; на будке —
// счётчик тепла. Над тёплыми трубами снег стаял полосой, на трубе сидит кот.
// Счётчик крутится; по вечерам — быстрее: ищут больше (живое).
function heatBody(c, x, gy) {
  const X0 = Math.round(x) - 47, Y0 = Math.round(gy) - 98;
  let P = heatBody.P;
  if (!P) {
    P = heatBody.P = plan(94, 98);
    hangar(P, false);
    P.box(60, 80, 8, 18, MAT.IRON);                                                 // дверь закрыта
    P.box(0, 80, 14, 3, MAT.STEEL); P.box(0, 85, 14, 3, MAT.STEEL);                 // подача и обратка
    for (const sx of [3, 10]) P.box(sx, 88, 2, 10, MAT.CONCRETE);                  // опоры
    P.box(14, 76, 10, 22, MAT.PANEL);                                               // будка теплового насоса
    P.box(24, 72, 2, 4, MAT.STEEL); P.box(14, 72, 12, 2, MAT.STEEL);               // воздуховод из зала
    P.cut(16, 80, 4, 3, MAT.GLASS);                                                 // окошко счётчика
  }
  paint(c, X0, Y0, P, { seed: 227, snow: 0.3, chip: 0.03 });
  hangarOver(c, X0, Y0);
  c.fillStyle = tone(MAT.STEEL, 2); for (let k = 1; k < 14; k += 4) { c.fillRect(X0 + k, Y0 + 80, 1, 3); c.fillRect(X0 + k, Y0 + 85, 1, 3); }   // бандажи утеплителя
  snowdrift(c, X0, Y0);
  R(c, tone(MAT.SNOW, 3), X0 + 30, Y0 + 96, 26, 2); R(c, DARK, X0, Y0 + 96, 14, 2);   // под трубами снег стаял
  cat(c, X0 + 5, Y0 + 75);
}
function heatLive(c, x, gy, t) {
  const X0 = Math.round(x) - 47, Y0 = Math.round(gy) - 98, T = t | 0;
  const L = Math.round(x) - 47, G = Math.round(gy);
  const rt = rotor(c, `rotor:${L}:${G}`, L + 21, G - 76, 20, { blade: ASH, hub: BONE, nac: ASH });
  if ((T + 10) % 90 < 60) R(c, CIN, rt.bx, G - 78, 1, 1);
  // счётчик: колесо цифр крутится — вечером быстрее
  const p = phaseAt(t || 0), evening = p > 0.35 && p < 0.6, k = Math.floor(T / (evening ? 6 : 18)) % 4;
  R(c, ASH, X0 + 16 + k, Y0 + 81, 1, 1);
}
const heatReuse = split(heatBody, heatLive);

// ── РАВНИНА ──────────────────────────────────────────────────────────
// долгострой: бетонный каркас без стен — колонны и плиты восьми этажей,
// кое-где заложены пролёты; на недоведённом девятом торчит арматура под
// следующий этаж. Башенный кран замер, на крюке висит плита — ветер её
// качает медленно и долго (живое). Забор из профнастила, на нём растяжка
// «дом готов»: светлое полотно, дом, на балконах цветы, небо — без синего
// (канон: голубого нет, небо пеплом). В пролёте первого этажа на верёвке
// сохнет одеяло, на кирпиче чайник, в глубине теплится огонёк: тут живут.
function unfinishedBody(c, x, gy) {
  const X0 = Math.round(x) - 46, Y0 = Math.round(gy) - 112;
  let P = unfinishedBody.P;
  if (!P) {
    P = unfinishedBody.P = plan(92, 112);
    for (let k = 1; k <= 8; k++) P.box(29, 112 - k * 9, 58, 2, MAT.CONCRETE);        // плиты
    for (const cx of [30, 43, 56, 69, 84]) P.box(cx, 40, 2, 72, MAT.CONCRETE);       // колонны
    P.box(43, 32, 2, 8, MAT.CONCRETE); P.box(56, 32, 2, 8, MAT.CONCRETE);             // девятый
    for (const [bx, by, bw] of [[32, 96, 11], [45, 87, 11], [58, 96, 11], [71, 69, 13]]) P.box(bx, by, bw, 7, MAT.MUD);   // заложенные пролёты
    P.cut(47, 89, 3, 3, MAT.DARK);
    // кран: мачта решёткой, оголовок, стрела, противовес, кабина
    P.box(10, 8, 1, 104, MAT.IRON); P.box(15, 8, 1, 104, MAT.IRON);
    P.box(12, 0, 2, 8, MAT.IRON);
    P.box(2, 8, 88, 1, MAT.IRON); P.box(16, 6, 70, 1, MAT.IRON);
    P.box(1, 9, 7, 5, MAT.CONCRETE);
    P.box(16, 9, 4, 4, MAT.IRON); P.cut(17, 10, 2, 2, MAT.GLASS);
    // забор
    P.box(34, 102, 58, 10, MAT.IRON);
  }
  paint(c, X0, Y0, P, { seed: 191, chip: 0.08, cracks: 3, drips: [[33, 105, 4], [60, 78, 6], [73, 60, 5]] });
  // решётка мачты и тяги стрелы
  c.fillStyle = ASH; for (let k = 0; k < 13; k++) c.fillRect(X0 + (k & 1 ? 13 : 11), Y0 + 108 - k * 8, 2, 1);
  hline(c, ASH, X0 + 14, Y0, X0 + 62, Y0 + 5);
  hline(c, ASH, X0 + 11, Y0 + 1, X0 + 3, Y0 + 7);
  // арматура над недоведённым девятым
  c.fillStyle = tone(MAT.IRON, 3); for (const rx of [31, 35, 70, 75, 84, 86]) c.fillRect(X0 + rx, Y0 + 35, 1, 5);
  // растяжка «дом готов»: полотно, небо пеплом, дом, на балконах цветы — без букв
  R(c, PAPER, X0 + 50, Y0 + 103, 30, 8);
  R(c, ASH, X0 + 51, Y0 + 104, 28, 3);
  R(c, tone(MAT.PLASTER, 4), X0 + 58, Y0 + 105, 12, 5); R(c, tone(MAT.PLASTER, 4), X0 + 60, Y0 + 104, 8, 1);
  R(c, N, X0 + 60, Y0 + 106, 2, 1); R(c, N, X0 + 64, Y0 + 106, 2, 1); R(c, N, X0 + 60, Y0 + 108, 2, 1);
  R(c, CIN, X0 + 62, Y0 + 107, 1, 1); R(c, CIN, X0 + 66, Y0 + 107, 1, 1); R(c, CIN, X0 + 66, Y0 + 109, 1, 1);
  // в пролёте первого этажа: верёвка, одеяло, чайник на кирпиче, огонёк в глубине
  R(c, ASH, X0 + 70, Y0 + 95, 14, 1);
  R(c, tone(MAT.FELT, 3), X0 + 73, Y0 + 96, 6, 5); R(c, tone(MAT.FELT, 1), X0 + 73, Y0 + 100, 6, 1);
  R(c, tone(MAT.BRICK, 2), X0 + 81, Y0 + 99, 3, 2); R(c, tone(MAT.IRON, 3), X0 + 81, Y0 + 97, 3, 2); R(c, ASH, X0 + 84, Y0 + 97, 1, 1);
  R(c, CANDLE, X0 + 79, Y0 + 98, 1, 2);
}
function unfinishedLive(c, x, gy, t) {
  const L = Math.round(x) - 46, G = Math.round(gy);
  // крюк и плита на тросе: тяжёлая — ветер раскачивает её медленно и долго
  const hk = hang(`crane:${L}:${G}`, L + 66, G - 105, 21, { segs: 3, sail: 0.02, damp: 0.997, gy: G, r: 8 });
  drawRope(c, hk.pts, ASH);
  const tp = tipOf(hk), kx = Math.round(tp.x), ky = Math.round(tp.y);
  R(c, STONE, kx - 1, ky, 3, 2);                                       // крюк
  R(c, ASH, kx - 5, ky + 2, 5, 1); R(c, ASH, kx, ky + 2, 5, 1);        // стропы
  R(c, tone(MAT.CONCRETE, 2), kx - 8, ky + 3, 16, 4); R(c, tone(MAT.CONCRETE, 4), kx - 8, ky + 3, 16, 1);
}
const unfinished = split(unfinishedBody, unfinishedLive);

// панельная башня: семнадцать этажей сборных панелей — стыки по швам,
// окна в ряд; лоджии двумя стояками застеклены кто во что горазд: дерево,
// алюминий, пластик, открытая с бельём — каждая в свой год; кондиционеры.
// Тарелки на лоджиях смотрят в одну точку неба; одна, на крыше у машинного
// отделения, задрана прямо вверх. Подъезд под козырьком; окно горит одно.
function panelBody(c, x, gy) {
  const X0 = Math.round(x) - 26, Y0 = Math.round(gy) - 118;
  let P = panelBody.P;
  if (!P) {
    P = panelBody.P = plan(52, 118);
    P.box(19, 8, 12, 6, MAT.PANEL);                                                 // машинное отделение
    P.box(3, 14, 46, 2, MAT.CONCRETE);                                              // парапет
    P.box(4, 16, 44, 102, MAT.PANEL);
    for (let f = 0; f < 17; f++) {
      const y = 17 + f * 6;
      for (const wx of [15, 21, 27, 33]) if (!(f === 0 && wx === 21)) P.cut(wx, y + 1, 3, 3, MAT.GLASS);
    }
    P.box(21, 110, 8, 1, MAT.CONCRETE);                                             // козырёк подъезда
    P.cut(22, 111, 6, 7, MAT.DARK);
  }
  paint(c, X0, Y0, P, { seed: 193, chip: 0.04, drips: [[10, 40, 6], [42, 64, 5], [13, 88, 4]] });
  // швы перекрытий
  c.fillStyle = tone(MAT.PANEL, 1); for (let f = 1; f < 17; f++) c.fillRect(X0 + 5, Y0 + 16 + f * 6, 42, 1);
  // лоджии двумя стояками: остекление каждая на свой лад
  const kinds = [
    (lx, ly) => { R(c, tone(MAT.BOARD, 2), lx, ly, 7, 5); R(c, tone(MAT.GLASS, 1), lx + 1, ly + 1, 2, 3); R(c, tone(MAT.GLASS, 1), lx + 4, ly + 1, 2, 3); },
    (lx, ly) => { R(c, tone(MAT.STEEL, 1), lx, ly, 7, 5); R(c, tone(MAT.GLASS, 2), lx + 1, ly + 1, 5, 3); },
    (lx, ly) => { R(c, tone(MAT.PLASTER, 4), lx, ly, 7, 5); R(c, tone(MAT.GLASS, 0), lx + 1, ly + 1, 2, 2); R(c, tone(MAT.GLASS, 0), lx + 4, ly + 1, 2, 2); },
    (lx, ly) => { R(c, tone(MAT.PANEL, 1), lx, ly + 3, 7, 2); R(c, DARK, lx, ly, 7, 3); R(c, PAPER2, lx + 1, ly + 1, 1, 2); R(c, tone(MAT.FELT, 3), lx + 3, ly + 1, 2, 2); },
    (lx, ly) => { R(c, tone(MAT.IRON, 2), lx, ly, 7, 5); R(c, tone(MAT.GLASS, 3), lx + 1, ly + 1, 5, 2); },
    (lx, ly) => { R(c, tone(MAT.PANEL, 2), lx, ly + 2, 7, 3); R(c, DARK, lx, ly, 7, 2); },
  ];
  for (let f = 0; f < 16; f++) for (const [lx, sh] of [[6, 0], [39, 3]]) {
    const k = (f * 7 + sh * 5 + (f >> 2)) % kinds.length;
    kinds[k](X0 + lx, Y0 + 17 + f * 6);
  }
  // кондиционеры
  for (const [ax, f] of [[13, 2], [36, 4], [13, 7], [46, 9], [36, 12], [13, 14]]) { R(c, tone(MAT.IRON, 3), X0 + ax, Y0 + 20 + f * 6, 2, 2); R(c, ASH, X0 + ax, Y0 + 20 + f * 6, 1, 1); }
  // тарелки на лоджиях: все в одну точку неба — вверх-влево
  for (const [dx, f] of [[6, 1], [39, 3], [6, 6], [39, 8], [6, 11], [39, 13]]) {
    const ly = Y0 + 17 + f * 6;
    R(c, ASH, X0 + dx - 2, ly - 1, 2, 1); R(c, ASH, X0 + dx - 3, ly, 2, 1); R(c, ASH, X0 + dx - 3, ly + 1, 1, 1); R(c, tone(MAT.IRON, 2), X0 + dx - 1, ly + 1, 1, 1);
  }
  // одна — на крыше, прямо вверх
  R(c, BONE, X0 + 38, Y0 + 9, 5, 1); R(c, ASH, X0 + 39, Y0 + 10, 3, 1); R(c, ASH, X0 + 40, Y0 + 11, 1, 3);
  // окна: тёплое одно, холодные три
  R(c, CANDLE, X0 + 27, Y0 + 66, 3, 3);
  c.fillStyle = PAPER2; for (const [wx, f] of [[15, 4], [33, 9], [21, 13]]) c.fillRect(X0 + wx, Y0 + 18 + f * 6, 3, 3);
}
const panelTower = panelBody; panelBody.static = true;

// ── ФАСАДЫ ТАБЛИЧЕК 18×30 ────────────────────────────────────────────
// набором, тем же материалом, что и постройки: план один на фасад
function signKit(build, opt, over) {
  let P = null;
  const d = (c, X, G) => {
    if (!P) { P = plan(18, 30); build(P); }
    const X0 = Math.round(X) - 9, Y0 = Math.round(G) - 30;
    paint(c, X0, Y0, P, opt);
    if (over) over((col, dx, dy, w = 1, h = 1) => R(c, col, X0 + dx, Y0 + dy, w, h));
  };
  d.static = true;
  return d;
}
// юг: плоская крыша, из неё торчит арматура «под следующий этаж», чёрный
// бак для воды, окно со ставнями, кондиционер, тарелка; дверь под рост
const signSouth = signKit(P => {
  P.box(0, 7, 18, 23, MAT.CONCRETE);
  P.box(6, 2, 6, 5, MAT.IRON);                                                     // бак
  P.cut(10, 9, 5, 5, MAT.DARK); P.box(8, 9, 2, 5, MAT.BOARD); P.box(15, 9, 2, 5, MAT.BOARD);
  P.cut(2, 12, 5, 18, MAT.DARK);
  P.box(10, 16, 4, 2, MAT.STEEL);                                                  // кондиционер
}, { seed: 197, chip: 0.06, drips: [[11, 18, 4]] }, px => {
  for (const rx of [1, 4, 13, 16]) px(ASH, rx, 0, 1, 7);                           // арматура
  px(DARK, 6, 2, 6, 1); px(ASH, 13, 20, 3, 2); px(ASH, 15, 22, 1, 1);             // кромка бака, тарелка
});
// восток: узкий дом-карандаш с тёмной ролставней под рост; на тротуаре,
// через полоску земли, — светящийся торговый автомат: единственное
// светлое пятно фасада; у ставни два картонных пакета доставки
const signEast = signKit(P => {
  P.box(8, 0, 10, 30, MAT.CONCRETE);
  P.cut(10, 3, 6, 3, MAT.GLASS);
  P.box(14, 8, 3, 2, MAT.STEEL);                                                   // кондиционер
  P.box(9, 12, 9, 18, MAT.IRON);                                                   // ролставня
  P.box(0, 13, 7, 17, MAT.IRON); P.cut(1, 15, 5, 10, MAT.DARK);                    // автомат
}, { seed: 199, chip: 0.03 }, px => {
  px(ASH, 9, 12, 9, 1); px(PAPER2, 0, 13, 7, 1);
  for (let r = 0; r < 3; r++) for (const bx of [1, 3, 5]) px(PAPER2, bx, 16 + r * 3, 1, 2);   // бутылки
  px(N, 1, 27, 5, 1);                                                              // щель выдачи
  px(WOOD2, 13, 27, 4, 3); px(SEP, 13, 28, 4, 1);                                  // пакеты
});
// запад: кирпич, витрина под пустой табличкой «сдаётся», камера
// наблюдения, у земли трафарет — крыса с чемоданом уходит из кадра
const signWest = signKit(P => {
  P.box(0, 1, 18, 1, MAT.CONCRETE); P.box(1, 2, 16, 28, MAT.BRICK);
  P.cut(4, 4, 4, 4, MAT.GLASS); P.cut(11, 4, 4, 4, MAT.GLASS);
  P.box(2, 11, 15, 1, MAT.CONCRETE);
  P.cut(3, 13, 7, 9, MAT.GLASS); P.cut(11, 12, 5, 18, MAT.DARK);
}, { seed: 201, chip: 0.05 }, px => {
  px(PAPER2, 4, 15, 4, 3);                                                         // табличка «сдаётся» без букв
  px(ASH, 13, 9, 3, 2); px(ASH, 16, 8, 1, 3); px(CIN, 13, 10);                     // камера
  px(ASH, 14, 21, 1, 2);                                                           // ручка
  px(BONE, 2, 27, 2, 2); px(BONE, 3, 26); px(BONE, 5, 27); px(BONE, 6, 28, 3, 1); px(BONE, 9, 29, 2, 1);   // крыса с чемоданом
});
// север: чёрный скандинавский дом без свесов, стоячий фальц, панорамное
// окно, дверь под рост, наружный блок теплового насоса, снег
const signNorth = signKit(P => {
  P.wedge(9, 0, 10, 2, 16, MAT.IRON).shade(2);                                     // кровля фальцем
  P.box(1, 10, 16, 20, MAT.BOARD).shade(1);
  P.cut(3, 13, 7, 9, MAT.GLASS); P.cut(11, 12, 3, 18, MAT.DARK);
  P.box(15, 24, 3, 4, MAT.STEEL);                                                  // тепловой насос
}, { seed: 203, snow: 0.6, chip: 0.03 }, px => {
  px(CANDLE, 4, 18, 2, 2);                                                         // в окне — свеча
  px(N, 16, 25, 1, 2);
  px(BONE, 0, 28, 4, 2); px(BONE, 15, 29, 3, 1);                                   // снег у стены
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

// юг — пирс над фундаментом: лодка со стеклянным дном, свая с отметками
// прилива, солнечная панель на стойке
const GLASSBOAT = [
  '....BBBBBBBBBBBBBBBB........',
  '....A..............A........',
  '....A..............A....11..',
  'AAAAAAAAAAAAAAAAAAAAAAAA111.',
  '.PPPPPPPPPPPPPPPPPPPPPPPA11.',
  '..PPPPPPPPPPPPPPPPPPPPPP.1..',
  '...AAAAAAAAAAAAAAAAAAAAA.1..',
  '.........................A..',
];
const TIDEPOST = [
  '..AA....',
  '.AWWw...',
  '.AWWwBB.',
  '.AWWw...',
  '.AWWwB..',
  '.AWWw...',
  '.AWWwBB.',
  '.AWWw...',
  '.AWWwB..',
  '.AWWw...',
  '.AWWwBBB',
  '.AWWw...',
  'AAAAAA..',
  '.AWWwB..',
  '.AWWw...',
  '.AWWwBB.',
  '.AWWw...',
  '.AWWwB..',
  '.AWWw...',
  '.AWWwBBB',
  '.AWWw...',
  '.AMWw...',
  'MAMMwM..',
  '.MWMMw..',
  'MMMMMMM.',
];
const SOLAR = [
  '....AAAAAAAAAAAAAA',
  '....A111111111111A',
  '...A111111111111A.',
  '...AAAAAAAAAAAAAA.',
  '..A111111111111A..',
  '..A111111111111A..',
  '.AAAAAAAAAAAAAAA..',
  '.......A1.........',
  '.......A1..A......',
  '.......A1.A.......',
  '.......A1A........',
  '.......A1.........',
  '.....AAA11A.......',
];
// восток — плоский новый мир: светофор с пустой рамкой, гашапоны,
// прокатный велосипед
const WALKSIGN = [
  '.11111.',
  '1NNNNN1',
  '1NKKKN1',
  '1NKNKN1',
  '1NKNKN1',
  '1NKKKN1',
  '1NNNNN1',
  '1NtttN1',
  '1NtNtN1',
  '1NtttN1',
  '1NNNNN1',
  '.11111.',
  '...A1..',
  '...A1..',
  '...A1..',
  '...A1..',
  '...A1..',
  '...A1..',
  '...A1..',
  '...A1..',
  '...A1..',
  '...A1..',
  '...A1..',
  '...A1..',
  '..AA11.',
  '.AAA111',
];
function gacha(c, x, gy) {
  const L = Math.round(x) - 8, G = Math.round(gy);
  for (const [mx, k] of [[0, 0], [9, 1]]) {
    R(c, STONE, L + mx, G - 9, 7, 9); R(c, ASH, L + mx, G - 9, 1, 9);
    R(c, ASH, L + mx + 2, G - 7, 3, 3); R(c, N, L + mx + 3, G - 6, 1, 1);
    R(c, N, L + mx + 2, G - 3, 3, 2);
    R(c, ASH, L + mx, G - 16, 7, 7); R(c, N, L + mx + 1, G - 15, 5, 5);
    R(c, BONE, L + mx + 1 + k, G - 12, 2, 2); R(c, k ? MIST : CIN, L + mx + 3, G - 11, 2, 2); R(c, PAPER2, L + mx + 2 + k, G - 15, 2, 2);
  }
}
function bike(c, x, gy) {
  const L = Math.round(x) - 8, G = Math.round(gy);
  // колёса кольцами, втулки
  for (const wx of [0, 11]) {
    R(c, ASH, L + wx + 1, G - 5, 3, 1); R(c, ASH, L + wx + 1, G - 1, 3, 1);
    R(c, ASH, L + wx, G - 4, 1, 3); R(c, ASH, L + wx + 4, G - 4, 1, 3); R(c, N, L + wx + 2, G - 3, 1, 1);
  }
  // рама киноварью — единственный цвет; седло, руль, корзина
  R(c, CIN, L + 8, G - 3, 5, 1); R(c, CIN, L + 8, G - 7, 1, 4); R(c, CIN, L + 4, G - 7, 5, 1);
  R(c, CIN, L + 5, G - 6, 1, 1); R(c, CIN, L + 6, G - 5, 1, 1); R(c, CIN, L + 7, G - 4, 1, 1);
  R(c, ASH, L + 3, G - 7, 1, 4);
  R(c, N, L + 7, G - 8, 4, 1);
  R(c, ASH, L + 2, G - 9, 3, 1); R(c, ASH, L, G - 8, 3, 3); R(c, N, L + 1, G - 7, 1, 1);
}
// запад — стеклянный даунтаун: антитаранные тумбы, самокат, зарядка машин
const BOLLARDS = [
  '.BA.....BA.....BA.',
  'BAA1...BAA1...BAA1',
  'BAA1...BAA1...BAA1',
  'PPPP...PPPP...PPPP',
  'BAA1...BAA1...BAA1',
  'BAA1...BAA1...BAA1',
  'BAA1...BAA1...BAA1',
  'AAA1...AAA1...AAA1',
];
const ESCOOTER = [
  '..AAAA......',
  '....A1......',
  '....A1......',
  '....AK......',
  '....A1......',
  '....A1......',
  '....A1......',
  '....A1......',
  '....A1......',
  '....A1......',
  '....A1......',
  '...A11......',
  '..A1AAAAAAAA',
  '.A1A1111111A',
  'A111A.....A1',
  '.AAA.......A',
];
const CHARGER = [
  '.AAAAA...',
  'AcccccA..',
  'AN111NA..',
  'AN1B1NA..',
  'ANNNNNA..',
  'AcccccA..',
  'Acc1ccA11',
  'Acc1ccA.1',
  'AcccccA.1',
  'AcccccA.1',
  'AcccccA.1',
  'AcccccA.1',
  'AcccccA.1',
  'AcccccA1.',
  'AcccccA..',
  'AcccccA..',
  'AcccccA..',
  'AcccccA..',
  'AAAAAAA..',
];
// север — горячий коридор: снегоход, кабельный барабан, тарелка на шесте
const SNOWMOBILE = [
  '.....AA.................',
  '....A.A.....111.........',
  '...AAAAAAA111111111.....',
  '..APPPPPPPPPPPPPPPPP....',
  '.BPPPPPPPPPPPPPPPPPPP...',
  '..PPPPP11111111111111...',
  '....1..1ANANANANANA1....',
  '....1..11111111111111...',
  'A...1...................',
  '.AAAAAAAA...............',
];
function cableDrum(c, x, gy) {
  const L = Math.round(x) - 8, G = Math.round(gy);
  // щека катушки кругом из полос, обод пеплом сверху-слева, ступица
  R(c, WOOD2, L + 3, G - 13, 7, 1); R(c, WOOD2, L + 1, G - 12, 11, 2); R(c, WOOD2, L, G - 10, 13, 6);
  R(c, WOOD2, L + 1, G - 4, 11, 2); R(c, WOOD2, L + 3, G - 2, 7, 1);
  R(c, ASH, L + 3, G - 13, 7, 1); R(c, ASH, L + 1, G - 12, 2, 1); R(c, ASH, L, G - 10, 1, 6); R(c, ASH, L + 1, G - 4, 1, 2);
  R(c, N, L + 12, G - 10, 1, 6); R(c, N, L + 10, G - 3, 2, 1);
  R(c, N, L + 5, G - 8, 3, 3); R(c, ASH, L + 6, G - 7, 1, 1);
  // кабель сходит по земле — к ветряку
  R(c, N, L + 9, G - 1, 7, 1); R(c, ASH, L + 9, G - 2, 1, 1);
}
const DISH = [
  '........BBB...',
  '......AAAAA...',
  '....AA11111A..',
  '...A1111111A..',
  '..A1111111A...',
  '..A111111A..A.',
  '...A1111A..A..',
  '....AAAA..1...',
  '......A.......',
  '......A1......',
  '......A1......',
  '......A1......',
  '......A1......',
  '......A1......',
  '......A1......',
  '......A1......',
  '......A1......',
  '......A1......',
  '.....AA11.....',
  '....AAA111....',
];
// равнина — панельная тишина: поддоны кирпича, ларёк, грибок песочницы
const BRICKS = [
  'AAAAAAAA.AAAAAAAA.',
  'xxxxxxxA.xxxxxxxA.',
  'xxxxxxxA.xxxxxxxA.',
  'AAAAAAAA.AAAAAAAA.',
  'xxxxxxxA.xxxxxxxA.',
  'xxxxxxxA.xxxxxxxA.',
  'AAAAAAAA.AAAAAAAA.',
  'WW.WW.WW.WW.WW.WW.',
  'WWWWWWWW.WWWWWWWW.',
];
function kiosk(c, x, gy) {
  const L = Math.round(x) - 10, G = Math.round(gy);
  R(c, CONC, L + 1, G - 19, 18, 19);
  R(c, DARK, L, G - 22, 20, 3); R(c, ASH, L, G - 22, 20, 1);
  R(c, PAPER2, L + 2, G - 18, 16, 3);                 // вывеска — пустая
  R(c, ASH, L + 1, G - 19, 1, 19);
  R(c, N, L + 3, G - 14, 14, 9);
  c.fillStyle = ASH; for (const gx of [7, 11]) c.fillRect(L + gx, G - 14, 1, 9);
  R(c, ASH, L + 3, G - 10, 14, 1);
  c.fillStyle = BONE; for (const bx of [4, 9, 13, 15]) c.fillRect(L + bx, G - 13, 1, 2);
  c.fillStyle = PAPER2; for (const bx of [5, 8, 14]) c.fillRect(L + bx, G - 8, 1, 2);
  R(c, CANDLE, L + 13, G - 4, 3, 2);                  // окошко продавца — тёплое
  R(c, ASH, L + 12, G - 2, 5, 1);
}
function sandbox(c, x, gy) {
  const L = Math.round(x) - 10, G = Math.round(gy);
  // песочница: короб из досок, песок
  R(c, WOOD2, L, G - 3, 20, 3); R(c, ASH, L, G - 4, 20, 1); R(c, PAPER2, L + 1, G - 5, 18, 1);
  // грибок: столб, шляпка киноварью в белых пятнах
  R(c, ASH, L + 9, G - 15, 2, 10);
  R(c, CIN, L + 6, G - 20, 8, 1); R(c, CIN, L + 3, G - 19, 14, 2); R(c, CIN, L + 1, G - 17, 18, 2);
  R(c, SEP, L + 2, G - 15, 16, 1);
  c.fillStyle = BONE; for (const [bx, by] of [[5, 18], [10, 19], [14, 17], [3, 16], [8, 16]]) c.fillRect(L + bx, G - by, 2, 1);
}

// ── ДОМИНАНТА · ЮГ ───────────────────────────────────────────────────
// «Линия»: зеркальная стена уходит поперёк пустыни к горизонту — верхняя
// кромка и подножие сходятся в точку, швы панелей густеют к дали. Ближний
// торец — во всю высоту. В стекле — пустыня, та, что за спиной: ночное
// небо со звёздами, ниже горизонта — дюны; на горизонте отражается кольцо
// огня (нов.: огонь доминанты — отражённый). Стена кончается, не дойдя до
// горизонта (по сообщениям, проект сократили): дальше по той же линии —
// только колышки разметки с флажками. Подножие — гребень песка.
const LN = { W: 140, H: 150, vx: 150, vy: 116, x0: 8, x1: 104, top0: 2 };
const lnTop = x => LN.top0 + (LN.vy - LN.top0) * (x - LN.x0) / (LN.vx - LN.x0);
const lnBot = x => LN.H - 1 - (LN.H - 1 - LN.vy) * (x - LN.x0) / (LN.vx - LN.x0);
function lineBody(c, x, gy) {
  const X0 = Math.round(x) - 70, Y0 = Math.round(gy) - LN.H;
  const T = k => Math.round(lnTop(k)), B = k => Math.round(lnBot(k));
  // лицо стены: колонка за колонкой — небо в стекле над горизонтом, пустыня под ним
  for (let k = LN.x0; k <= LN.x1; k++) {
    const t0 = T(k), b0 = B(k), hz = Math.min(b0, LN.vy - 2 + Math.round((LN.vx - k) * 0.06));
    R(c, N, X0 + k, Y0 + t0, 1, hz - t0);
    R(c, SEP, X0 + k, Y0 + hz, 1, b0 - hz);
  }
  // отражённые звёзды; к дали реже
  for (const [sx, sy] of [[14, 20], [23, 47], [31, 12], [37, 70], [46, 33], [52, 88], [61, 57], [70, 41], [78, 78], [88, 66], [97, 94], [19, 101], [42, 104], [64, 99], [27, 84]]) {
    if (sy > T(sx) + 1 && sy < LN.vy - 4) R(c, ASH, X0 + sx, Y0 + sy, 1, 1);
  }
  // отражённые дюны: пологий наветренный скат, крутой подветренный в тени; к дали мельче
  for (const [d0, d1, hgt] of [[8, 44, 9], [36, 66, 7], [60, 84, 5], [78, 97, 3], [93, 104, 2]]) {
    const crest = d0 + Math.round((d1 - d0) * 0.72);
    for (let k = d0; k <= d1; k++) {
      const h = k <= crest ? Math.round(hgt * (k - d0) / (crest - d0)) : Math.round(hgt * (1 - (k - crest) / (d1 - crest)) ** 0.5);
      const yb = B(k) - 2 - h;
      if (yb <= LN.vy - 1 || yb >= B(k)) continue;
      R(c, k <= crest ? ASH : STONE2, X0 + k, Y0 + yb, 1, 1);
      if (k > crest) R(c, STONE2, X0 + k, Y0 + yb + 1, 1, Math.max(0, B(k) - yb - 3));
    }
  }
  // швы панелей: стойки сходятся к дали, пояса — к точке схода
  c.fillStyle = STONE2;
  for (let j = 1; j < 9; j++) {
    const k = Math.round(LN.x0 + (LN.x1 - LN.x0) * (1 - 1 / (1 + j * 0.42)) * 1.25);
    if (k >= LN.x1) break;
    c.fillRect(X0 + k, Y0 + T(k) + 1, 1, B(k) - T(k) - 1);
  }
  for (const f of [0.25, 0.5]) for (let k = LN.x0 + 1; k <= LN.x1; k++) {
    const y = Math.round(T(k) + (B(k) - T(k)) * f * (f < 0.4 ? 1 : 0.86));
    if (y < LN.vy - 3) c.fillRect(X0 + k, Y0 + y, 1, 1);
  }
  // верхняя кромка — под луной; дальний край — срез: торчат стойки каркаса
  for (let k = LN.x0; k <= LN.x1; k++) R(c, BONE, X0 + k, Y0 + T(k) - 1, 1, 1);
  R(c, ASH, X0 + LN.x1, Y0 + T(LN.x1), 1, B(LN.x1) - T(LN.x1));
  for (const [dx, h] of [[1, 5], [3, 3]]) R(c, ASH, X0 + LN.x1 + dx, Y0 + T(LN.x1) - 1, 1, h);
  // ближний торец: толщина стены — тоже зеркало, ребро костью
  for (let k = 0; k < LN.x0; k++) { const tt = LN.top0 + 4 - Math.round(k / 2); R(c, DARK, X0 + k, Y0 + tt, 1, LN.H - tt); }
  R(c, BONE, X0 + LN.x0 - 1, Y0 + LN.top0 - 1, 1, LN.H - LN.top0 + 1);
  R(c, ASH, X0, Y0 + LN.top0 + 4, LN.x0, 1);
  c.fillStyle = STONE2; for (const y of [30, 58, 86, 114]) c.fillRect(X0 + 1, Y0 + y, LN.x0 - 2, 1);
  // гребень песка вдоль подножия
  for (let k = 0; k <= LN.x1; k++) { const b0 = k < LN.x0 ? LN.H - 1 : B(k), hh2 = 1 + ((k * 7) % 5 === 0 ? 1 : 0); R(c, PAPER2, X0 + k, Y0 + b0 - hh2 + 1, 1, hh2); }
  // дальше линии стены нет — колышки разметки с флажками до самой рамки
  for (let j = 0; j < 6; j++) {
    const k = LN.x1 + 6 + Math.round(j * 6 - j * j * 0.25), yb = B(k), hgt = Math.max(2, 6 - j);
    if (k > LN.W - 2) break;
    R(c, ASH, X0 + k, Y0 + yb - hgt, 1, hgt + 1); R(c, CIN, X0 + k + 1, Y0 + yb - hgt, j < 3 ? 2 : 1, 1);
  }
}
// живое: на горизонте в стекле отражается кольцо огня — одна сплошная нить,
// языки над ней колышутся (тепло не растрируется)
function lineLive(c, x, gy, t) {
  const X0 = Math.round(x) - 70, Y0 = Math.round(gy) - LN.H, T = (t | 0) >> 3;
  for (let k = LN.x0; k <= LN.x1; k++) {
    const hz = Math.min(Math.round(lnBot(k)), LN.vy - 2 + Math.round((LN.vx - k) * 0.06));
    const tip = k < 70 && ((Math.imul(k * 31 + T * 7, 2654435761) >>> 28) & 7) === 0;
    R(c, CANDLE, X0 + k, Y0 + hz - (tip ? 1 : 0), 1, tip ? 2 : 1);
  }
}
const theLine = split(lineBody, lineLive);

// ── ДОМИНАНТА · СЕВЕР ────────────────────────────────────────────────
// Всемирное семенохранилище: столовая гора Шпицбергена — плоская макушка
// под снегом, под ней тёмный пояс скал с рваными уступами в снегу, ниже —
// белый фартук осыпей, в него из кулуаров сходят снежные конусы. Гора
// не симметрична: справа плечо ниже. У подножия из склона торчит бетонный
// клин входа: боковая грань уходит в гору, лицо — к нам, к двери — стальной
// мостик; по кровле и верху лица — треугольные грани световой инсталляции,
// над дверью ровная костяная полоса света (канон клетки; огонь доминанты —
// холодный, ровный). Гора шире своей высоты. Сбоку по склону —
// водоотводная канава к будке насоса: после семнадцатого года.
const SV = { W: 130, H: 162 };
const SV_HILL = [[0, 162], [8, 150], [16, 138], [24, 126], [30, 112], [33, 100], [36, 88], [40, 76], [44, 68], [52, 64], [64, 62],
  [78, 61], [92, 62], [100, 65], [104, 72], [107, 80], [112, 83], [116, 88], [119, 98], [122, 112], [126, 130], [130, 142], [130, 162]];
// нижняя кромка пояса скал: здесь начинается осыпь; зубцы вниз — кулуары, разной глубины
const SV_TALUS = [[30, 112], [35, 106], [40, 110], [45, 100], [50, 104], [56, 96], [61, 101], [66, 94], [72, 102], [77, 95],
  [83, 99], [88, 92], [93, 100], [98, 94], [104, 98], [110, 91], [115, 95], [119, 98]];
function vaultBody(c, x, gy) {
  const X0 = Math.round(x) - 65, Y0 = Math.round(gy) - SV.H;
  let P = vaultBody.P;
  if (!P) {
    P = vaultBody.P = plan(SV.W, SV.H);
    // осыпь: под луной слева, справа от гребня, что сходит с плеча, — в тени
    P.poly(SV_HILL, MAT.SNOW);
    P.poly([[70, 162], [84, 118], [100, 100], [110, 90], [112, 83], [116, 88], [119, 98], [122, 112], [126, 130], [130, 142], [130, 162]], MAT.SNOW).shade(1);
    // пояс скал: от верхней кромки горы до осыпи
    const top = SV_HILL.filter(([px, py]) => px >= 30 && px <= 119 && py < 113);
    P.poly([...top, ...SV_TALUS.slice().reverse()], MAT.ROCK);
    P.poly([[44, 68], [52, 64], [64, 62], [78, 61], [92, 62], [100, 65], [92, 64], [64, 64], [48, 67]], MAT.SNOW);   // шапка
    P.poly([[104, 72], [107, 80], [112, 83], [114, 85], [108, 81]], MAT.SNOW);                      // снег на плече
    // клин входа: боковая грань уходит в гору, лицо — к нам
    P.poly([[62, 162], [62, 128], [86, 117], [86, 162]], MAT.CONCRETE).shade(1);
    P.box(86, 115, 16, 47, MAT.CONCRETE);
    P.cut(91, 143, 6, 19, MAT.DARK);
  }
  paint(c, X0, Y0, P, { seed: 157, chip: 0.04, drips: [[90, 132, 6], [99, 130, 5]] });
  const on = (px, py) => vaultBody.P.at(px, py) === MAT.ROCK;
  // уступы: снег лежит рваными полками разной длины, полки чуть клонятся
  for (const [sx, sy, len] of [[46, 70, 7], [60, 69, 11], [80, 70, 5], [92, 71, 4], [40, 77, 4], [50, 76, 9], [68, 77, 6], [84, 76, 7],
    [37, 84, 6], [55, 83, 12], [88, 85, 5], [102, 86, 3], [35, 91, 8], [51, 92, 4], [64, 90, 7], [78, 91, 8], [96, 92, 5], [107, 89, 3]]) {
    for (let k = 0; k < len; k++) { const py = sy + (k > len * 0.6 ? 1 : 0); if (on(sx + k, py)) R(c, tone(MAT.SNOW, k ? 3 : 2), X0 + sx + k, Y0 + py, 1, 1); }
  }
  // кулуары: тёмная извилистая щель к зубцу осыпи, в ней снег языками
  for (const [gx, y0, y1, w] of [[40, 80, 109, 1], [50, 66, 103, -1], [61, 64, 100, 1], [72, 63, 101, -1], [83, 64, 98, 1], [93, 66, 99, -1], [110, 84, 90, 1]]) {
    for (let y = y0; y < y1; y++) {
      const px = gx + Math.round(Math.sin(y * 0.19 + gx) * 1.2 * w);
      if (!on(px, y)) continue;
      R(c, tone(MAT.ROCK, 0), X0 + px, Y0 + y, 1, 1);
      if (y > y1 - 12 && (y & 3) < 2) R(c, tone(MAT.SNOW, 3), X0 + px, Y0 + y, 1, 1);
    }
  }
  // камни из-под снега на осыпи
  c.fillStyle = tone(MAT.ROCK, 2);
  for (const [px, py] of [[18, 146], [12, 154], [26, 134], [50, 140], [44, 126], [112, 120], [118, 132], [114, 148], [122, 152], [32, 152], [24, 150], [56, 116]]) c.fillRect(X0 + px, Y0 + py, 2, 1);
  // грани инсталляции по кровле и верху лица: треугольники стали и зеркал ловят свет
  for (let k = 0; k < 8; k++) R(c, k & 1 ? ASH : BONE, X0 + 86 + k * 2, Y0 + 114, 2, 1);
  for (const [px, py, lit] of [[88, 118, 1], [92, 118, 0], [96, 118, 1], [100, 118, 0], [90, 123, 0], [94, 123, 1], [98, 123, 0], [92, 128, 1], [96, 128, 0]]) {
    R(c, lit ? BONE : ASH, X0 + px, Y0 + py + 2, 3, 1); R(c, lit ? BONE : ASH, X0 + px + 1, Y0 + py + 1, 1, 1);
  }
  // над дверью — ровная костяная полоса света
  R(c, BONE, X0 + 88, Y0 + 139, 12, 1);
  // стальной мостик к двери: настил и поручень на стойках
  R(c, tone(MAT.STEEL, 2), X0 + 80, Y0 + 160, 22, 1); R(c, ASH, X0 + 80, Y0 + 155, 11, 1);
  for (const sx of [80, 85, 90]) R(c, ASH, X0 + sx, Y0 + 155, 1, 5);
  // канава по склону к насосу: борозда с кромкой снега, у подножия — будка насоса
  for (let k = 0; k < 26; k++) { const px = X0 + 104 + Math.round(k * 0.35), py = Y0 + 128 + k; R(c, N, px, py, 2, 1); R(c, tone(MAT.SNOW, 5), px - 1, py, 1, 1); }
  R(c, tone(MAT.IRON, 2), X0 + 111, Y0 + 155, 7, 7); R(c, ASH, X0 + 111, Y0 + 155, 7, 1); R(c, N, X0 + 114, Y0 + 158, 2, 2);
}
const seedVault = vaultBody; vaultBody.static = true;

export const ARCH = {
  landmark: [
    {
      name: '«Линия»', side: 'south', w: 140, h: 150,
      light: { dx: -14, dy: -30, r: 80 },
      mirror: { x0: -62, x1: -20, y0: -112, y1: -12 },
      draw: theLine,
    },
    {
      name: 'Всемирное семенохранилище', side: 'north', w: 130, h: 162,
      light: { dx: 29, dy: -23, r: 80, color: [217, 207, 184], flicker: 0 },
      draw: seedVault,
    },
  ],
  south: [
    { name: 'игла над пустыней', w: 68, h: 120, draw: burj, draw2: burj2, life: { blink: [[0, -120, 'V', 90, 0.67]] } },
    {
      name: 'библиотека у моря', w: 96, h: 48, draw: library, draw2: library2, draw3: library3,
      life: { birds: [[37, 46, -4, 'K']] },
      life2: { blink: [[26, -29, 'P', 41, 0.35], [34, -28, 'K', 67, 0.2], [42, -29, 'P', 29, 0.5], [43, -19, 'K', 53, 0.25]] },
      life3: { birds: [[-46, -21, -38]] },
    },
  ],
  east: [
    { name: 'стеклянная пагода', w: 30, h: 120, draw: taipei, draw2: skytree, life: { blink: [[0, -119, 'V', 90, 0.67]] }, life2: { blink: [[4, -118, 'V', 90, 0.67]] } },
    { name: 'экран-фасад', w: 60, h: 96, draw: screenTower, life: { blink: [[11, -79, 'V', 120, 0.5]] } },
  ],
  west: [
    { name: '«огурец»', w: 38, h: 128, draw: gherkin },
    { name: 'стеклянная башня', w: 46, h: 112, draw: glassTower, draw2: walkie, life: { blink: [[17, -111, 'V', 90, 0.67]] }, life2: { blink: [[0, -105, 'V', 90, 0.67]] } },
  ],
  north: [
    {
      name: 'серверный ангар', w: 94, h: 98, noFlip: true, draw: dataCenter, draw2: natick, draw3: heatReuse,
      life: {}, life2: { birds: [[-31, 14, -34, 'K']] }, life3: {},
    },
  ],
  plain: [
    { name: 'долгострой с краном', w: 92, h: 112, noFlip: true, draw: unfinished, life: { birds: [[-1, 7, -73]] } },
    { name: 'панельная башня', w: 52, h: 118, draw: panelTower },
  ],
  sign: { south: signSouth, east: signEast, west: signWest, north: signNorth },
  props: {
    south: [art('лодка со стеклянным дном', GLASSBOAT), art('свая с отметками прилива', TIDEPOST), art('солнечная панель', SOLAR)],
    east: [art('светофор с пустой рамкой', WALKSIGN), { name: 'гашапоны', w: 16, h: 16, draw: gacha }, { name: 'прокатный велосипед', w: 16, h: 9, draw: bike }],
    west: [art('антитаранные тумбы', BOLLARDS), art('электросамокат', ESCOOTER), art('зарядка для машин', CHARGER)],
    north: [art('снегоход', SNOWMOBILE), { name: 'кабельный барабан', w: 16, h: 13, draw: cableDrum }, art('тарелка на шесте', DISH)],
    plain: [art('поддоны кирпича', BRICKS), { name: 'ларёк', w: 20, h: 22, draw: kiosk }, { name: 'грибок песочницы', w: 20, h: 20, draw: sandbox }],
  },
};
