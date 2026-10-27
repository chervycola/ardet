// ═══ АРХИТЕКТУРА · свет и сад (VI–XVI века) ═══
// Одна эпоха — пять культур; свет пропускают через бумагу, стекло, смолу и золото. Всё — набором
// (kit.js): тело неподвижно и запекается; лампады, лампа переписчика, камень на канате крана,
// колокола, цеховой щит и лист на ветру — слоем поверх.
// юг     — доминанта: Айя-София с юга — пологий свинцовый купол на кольце окон с лампадами, тимпан
//          под большой аркой, опоры, полукупола плечами, минареты разной руки. Дом бумаги (Кордова):
//          аркады подков, клинья костью через киноварь, портал в альфисе, ажимес; на кровле сохнут
//          листы под камешками (#2 — дом мудрости в Багдаде: лоджия, рукопись крупно и широко, весы
//          с гирями; #3 — гениза: пролом под крышей, листы торчат, лестницы нет). Минарет витком
//          (Самарра): пандус снаружи, перил нет, беседка (#2 — Ибн Тулун: пониже, квадратный цоколь,
//          цилиндр, лестница витком, курильница).
// восток — камень и тушь: пятиярусная пагода — кавара, киноварные стойки, решётки ярусов, сорин;
//          сад камней: зал на сваях со свечой за сёдзи, масляная ограда в потёках, гравий граблями,
//          рябь кольцами, камни на мху — один заслонён другим.
// запад  — чёрный собор (Кёльн): ажурный шпиль, правая башня в лесах с краном, на канате камень;
//          окно с одним цветным стеклом. Фахверк: каменная лавка с прилавком, вынос этажей, щипец,
//          цеховой щит качается.
// север  — смола и руны: ставкирка — смолёные стены, гонт ярусами, драконы и кресты на коньках
//          (#2 — отстроенная бревно в бревно: новое дерево, светлее, без износа). Драккар на
//          катках: клинкер, драконья голова, щиты через один, колокол на рее, рябина из борта
//          (#2 — курганный: катки от воды к яме, камера на палубе, утварь, вёсла все; #3 — копия
//          1893-го у белой колоннады выставки, под отпавшим штаффом — дранка).
// равнина — берестяной свет: белокаменный храм — закомары, лопатки, аркатурный пояс, шлем; в
//          портале золото иконы, единственное на равнине. Псковская звонница: два колокола
//          качаются, проём вечевого пуст, перекладина цела; помост, ступени подметены.
// Фасады табличек: андалусский дом, дзэн-мастерская, фахверк, сруб под дёрном.
// Утварь дворов (props) — по три вещи на сторону, без осмотра.
// Свет — лунный, слева; проёмы — ночь. x — центр, gy — линия земли.

import { hang, tipOf, angleOf, drawRope } from '../../world/hang.js';
import { plan, paint, MAT, FORM, tone, split } from './kit.js';
import { phaseAt, skyAt } from '../../world/sky.js';

const N = '#0D0B0A', BONE = '#D9CFB8', ASH = '#8A8D8F', MIST = '#3D4A3A',
  CANDLE = '#E28A3A', CINN = '#C23B2B', SEP = '#3A3026';
const D1 = '#15100c', D2 = '#241c14', WOOD = '#3a2418', PLANK = '#3a2818',
  STONE = '#3a3328', ST2 = '#2a2620',
  ICON_GOLD = '#D4AF37', PAPER = '#c8b89a', PAPER2 = '#b0a284';   // сусальное золото иконы — исключение равнины (COLOR_EXCEPTIONS)

function R(c, col, x, y, w, h) { c.fillStyle = col; c.fillRect(x, y, w, h); }
// ярусы снизу вверх: ось между cx-1 и cx, hw — полуширины, rh — высота яруса
function TIERS(c, col, cx, by, hw, rh) {
  c.fillStyle = col;
  for (let i = 0; i < hw.length; i++) c.fillRect(cx - hw[i], by - (i + 1) * rh, hw[i] * 2, rh);
}
// отрезок ступеньками [x0, x1): пологий — по рядам, крутой — по столбцам
function SEG(c, col, x0, y0, x1, y1) {
  const dx = x1 - x0, dy = y1 - y0;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const n = Math.abs(dy) + 1, s = Math.sign(dy);
    for (let k = 0; k < n; k++) {
      const a = x0 + Math.round(dx * k / n), b = x0 + Math.round(dx * (k + 1) / n);
      R(c, col, Math.min(a, b), y0 + s * k, Math.max(1, Math.abs(b - a)), 1);
    }
  } else {
    const n = Math.abs(dx) + 1, s = Math.sign(dx);
    for (let k = 0; k < n; k++) {
      const a = y0 + Math.round(dy * k / n), b = y0 + Math.round(dy * (k + 1) / n);
      R(c, col, x0 + s * k, Math.min(a, b), 1, Math.max(1, Math.abs(b - a)));
    }
  }
}

// ── УТВАРЬ ДВОРОВ ──
// юг: нория с кувшинами по ободу и жёлобом на устое, кувшины у дорожки
// сада и черепок, фонтан-чаша двора.
function noria(c, x0, gy) {
  const x = Math.round(x0), G = Math.round(gy), cx = x + 3, cy = G - 13;
  R(c, N, x - 12, G - 2, 26, 2); R(c, ASH, x - 9, G - 2, 3, 1); R(c, ASH, x + 8, G - 2, 2, 1);   // река
  R(c, ST2, x - 15, G - 25, 6, 25); R(c, BONE, x - 15, G - 25, 1, 25);             // устой
  R(c, ST2, x - 15, G - 28, 14, 3); R(c, BONE, x - 15, G - 28, 14, 1);             // жёлоб поверху
  R(c, WOOD, cx - 3, cy - 11, 7, 1); R(c, WOOD, cx - 6, cy - 10, 13, 2); R(c, WOOD, cx - 9, cy - 8, 19, 4);
  R(c, WOOD, cx - 11, cy - 4, 23, 9); R(c, WOOD, cx - 9, cy + 5, 19, 4); R(c, WOOD, cx - 6, cy + 9, 13, 2);
  R(c, WOOD, cx - 3, cy + 11, 7, 1);
  R(c, PAPER2, cx - 3, cy - 11, 7, 1); R(c, PAPER2, cx - 6, cy - 10, 3, 1); R(c, PAPER2, cx - 9, cy - 8, 3, 1);
  R(c, PAPER2, cx - 11, cy - 4, 1, 9);                 // лунный обод
  R(c, ASH, cx, cy - 10, 1, 21); R(c, ASH, cx - 10, cy, 21, 1); R(c, D1, cx - 1, cy - 1, 3, 3);  // спицы, ступица
  for (const [px, py] of [[8, -7], [9, 3], [3, 9], [-7, 7], [-9, -3]]) R(c, PAPER, cx + px, cy + py, 2, 2);  // кувшины
}

function jugs(c, x0, gy) {
  const x = Math.round(x0), G = Math.round(gy);
  R(c, PAPER2, x - 8, G - 8, 6, 7); R(c, PAPER2, x - 7, G - 10, 4, 2); R(c, PAPER2, x - 6, G - 13, 2, 3);
  R(c, PAPER2, x - 7, G - 13, 4, 1); R(c, D2, x - 3, G - 8, 1, 7); R(c, BONE, x - 8, G - 8, 1, 4);
  R(c, ASH, x - 9, G - 11, 1, 4); R(c, ASH, x - 8, G - 11, 1, 1); R(c, D2, x - 7, G - 1, 4, 1);  // ручка, ножка
  R(c, PAPER, x, G - 6, 5, 5); R(c, PAPER, x + 1, G - 7, 3, 1); R(c, PAPER, x + 1, G - 9, 3, 2); R(c, D2, x + 4, G - 6, 1, 5);
  R(c, PAPER2, x + 6, G - 2, 4, 2); R(c, D2, x + 7, G - 1, 2, 1);    // черепок
}

function fountain(c, x0, gy, t) {
  const x = Math.round(x0), G = Math.round(gy);
  R(c, ST2, x - 9, G - 4, 18, 4); R(c, BONE, x - 9, G - 4, 18, 1); R(c, BONE, x - 9, G - 4, 1, 4); R(c, ASH, x + 8, G - 4, 1, 4);
  R(c, N, x - 8, G - 3, 16, 1);                        // вода в бассейне
  R(c, ST2, x - 1, G - 9, 2, 5); R(c, BONE, x - 1, G - 9, 1, 5);
  R(c, ST2, x - 5, G - 11, 10, 2); R(c, BONE, x - 5, G - 11, 10, 1);
  R(c, ASH, x, G - 14, 1, 3);                          // струя
  const d = ((t || 0) / 30 | 0) % 3;
  R(c, ASH, x - 6, G - 9 + 2 * d, 1, 1); R(c, ASH, x + 5, G - 9 + 2 * ((d + 1) % 3), 1, 1);
}

// восток: каменный фонарь, каменная чаша с бамбуковым жёлобом и черпаком,
// поленница под навесом — и рядом зола отдельным ящиком.
function toro(c, x0, gy, t) {
  const x = Math.round(x0), G = Math.round(gy);
  R(c, ST2, x - 5, G - 2, 10, 2); R(c, ASH, x - 5, G - 2, 10, 1);
  R(c, ST2, x - 2, G - 10, 4, 8); R(c, BONE, x - 2, G - 10, 1, 8);    // столб
  R(c, ST2, x - 4, G - 12, 8, 2); R(c, ASH, x - 4, G - 12, 8, 1);
  R(c, ST2, x - 3, G - 16, 6, 4); R(c, BONE, x - 3, G - 16, 1, 4);    // огневая камера
  R(c, ((t || 0) / 40 | 0) % 9 ? CANDLE : D2, x - 1, G - 15, 2, 2);
  R(c, D1, x - 6, G - 18, 12, 2); R(c, D1, x - 6, G - 19, 1, 1); R(c, D1, x + 5, G - 19, 1, 1);  // крыша
  R(c, BONE, x - 5, G - 18, 4, 1);
  R(c, D1, x - 3, G - 20, 6, 2); R(c, ASH, x - 3, G - 20, 3, 1);
  R(c, D1, x - 1, G - 22, 2, 2); R(c, BONE, x - 1, G - 22, 1, 1);     // навершие
}

function tsukubai(c, x0, gy) {
  const x = Math.round(x0), G = Math.round(gy);
  R(c, MIST, x - 9, G - 1, 18, 1);                     // мох
  R(c, WOOD, x - 8, G - 11, 1, 10);
  R(c, PAPER2, x - 8, G - 12, 7, 1); R(c, PAPER2, x - 2, G - 11, 1, 1);   // бамбуковый жёлоб
  R(c, ASH, x - 2, G - 10, 1, 3);                      // струйка
  R(c, ST2, x - 5, G - 7, 9, 6); R(c, ST2, x - 6, G - 5, 11, 4);    // каменная чаша
  R(c, BONE, x - 6, G - 5, 1, 4); R(c, BONE, x - 5, G - 7, 1, 2); R(c, ASH, x + 4, G - 5, 1, 4);
  R(c, N, x - 4, G - 7, 7, 1);                         // вода
  R(c, PAPER2, x - 1, G - 8, 6, 1); R(c, PAPER2, x + 4, G - 10, 2, 2);   // черпак
  R(c, ST2, x + 5, G - 3, 4, 3); R(c, ASH, x + 5, G - 3, 4, 1);     // камень-ступень
}

function woodpile(c, x0, gy) {
  const x = Math.round(x0), G = Math.round(gy);
  R(c, D1, x - 13, G - 14, 18, 2); R(c, ASH, x - 13, G - 14, 18, 1);  // навес
  R(c, WOOD, x - 12, G - 12, 1, 12); R(c, WOOD, x + 3, G - 12, 1, 12);
  R(c, WOOD, x - 11, G - 11, 14, 11);                  // поленья
  for (const [lx, ly] of [[-10, 10], [-6, 10], [-2, 10], [-8, 7], [-4, 7], [0, 7], [-10, 4], [-6, 4], [-2, 4]]) {
    R(c, PAPER2, x + lx, G - ly, 2, 2);                // торцы
  }
  R(c, WOOD, x + 6, G - 5, 7, 5); R(c, BONE, x + 6, G - 5, 1, 5);    // ящик для золы
  R(c, ASH, x + 7, G - 6, 5, 1); R(c, ASH, x + 8, G - 7, 3, 1);
}

// запад: кафедра с раскрытой книгой и закладкой, тёсаные блоки со знаком
// каменщика и киянка, колодец под крутой кровелькой с воротом.
function lectern(c, x0, gy) {
  const x = Math.round(x0), G = Math.round(gy);
  R(c, D1, x - 5, G - 2, 10, 2); R(c, ASH, x - 5, G - 2, 10, 1);
  R(c, D1, x - 1, G - 14, 2, 12); R(c, BONE, x - 1, G - 14, 1, 12);   // стойка
  R(c, D1, x - 5, G - 15, 4, 2); R(c, D1, x - 2, G - 16, 4, 2); R(c, D1, x + 1, G - 17, 4, 2);  // наклонная доска
  R(c, PAPER, x - 5, G - 17, 4, 1); R(c, PAPER, x - 2, G - 18, 4, 1); R(c, PAPER, x + 1, G - 19, 4, 1);  // книга
  R(c, D1, x - 1, G - 18, 1, 1);
  R(c, CINN, x + 5, G - 18, 1, 4);                     // закладка
}

function masonBlocks(c, x0, gy) {
  const x = Math.round(x0), G = Math.round(gy);
  const blk = (bx, by, w, h) => {
    R(c, STONE, bx, by, w, h); R(c, BONE, bx, by, w, 1); R(c, BONE, bx, by, 1, h); R(c, D1, bx + w - 1, by + 1, 1, h - 1);
  };
  blk(x - 12, G - 5, 9, 5); blk(x - 2, G - 5, 8, 5); blk(x - 8, G - 10, 9, 5);
  R(c, D1, x - 5, G - 8, 1, 1); R(c, D1, x - 4, G - 7, 1, 1); R(c, D1, x - 3, G - 8, 1, 1);  // знак каменщика
  R(c, WOOD, x + 8, G - 4, 4, 4); R(c, PAPER2, x + 8, G - 4, 4, 1); R(c, WOOD, x + 6, G - 2, 2, 1);  // киянка
}

function stoneWell(c, x0, gy) {
  const x = Math.round(x0), G = Math.round(gy);
  R(c, STONE, x - 8, G - 8, 16, 8); R(c, BONE, x - 8, G - 8, 16, 1); R(c, BONE, x - 8, G - 8, 1, 8); R(c, ASH, x + 7, G - 7, 1, 7);
  R(c, D1, x - 7, G - 5, 14, 1); R(c, D1, x - 3, G - 8, 1, 3); R(c, D1, x + 2, G - 4, 1, 4);   // швы
  R(c, WOOD, x - 7, G - 19, 2, 11); R(c, WOOD, x + 5, G - 19, 2, 11); R(c, BONE, x - 7, G - 19, 1, 11);
  R(c, WOOD, x - 5, G - 16, 10, 2); R(c, ASH, x - 5, G - 16, 10, 1);  // вал
  R(c, ASH, x + 7, G - 16, 2, 1); R(c, ASH, x + 8, G - 15, 1, 3);     // рукоять
  R(c, ASH, x - 1, G - 14, 1, 4); R(c, D1, x - 2, G - 10, 3, 2); R(c, ASH, x - 2, G - 10, 3, 1);  // ведро
  TIERS(c, BONE, x - 1, G - 19, [9, 7, 5, 3, 1], 1); TIERS(c, D1, x, G - 19, [9, 7, 5, 3, 1], 1);  // кровелька
}

// север: колода с секирой, наковальня на пне с клещами, сети на кольях.
function axeBlock(c, x0, gy) {
  const x = Math.round(x0), G = Math.round(gy);
  R(c, WOOD, x - 5, G - 7, 10, 7); R(c, BONE, x - 5, G - 7, 1, 7); R(c, ASH, x + 4, G - 6, 1, 6);  // колода
  R(c, PAPER2, x - 5, G - 7, 10, 1);                   // торец
  R(c, ASH, x - 3, G - 9, 4, 2); R(c, ASH, x - 4, G - 8, 1, 2);      // секира с бородкой в колоде
  SEG(c, PAPER2, x + 1, G - 9, x + 6, G - 12);         // топорище
  R(c, PAPER2, x - 7, G - 1, 2, 1); R(c, PAPER2, x + 6, G - 2, 1, 1); // щепа
}

function anvil(c, x0, gy) {
  const x = Math.round(x0), G = Math.round(gy);
  R(c, WOOD, x - 4, G - 6, 8, 6); R(c, BONE, x - 4, G - 6, 1, 6);    // пень
  R(c, D1, x - 2, G - 8, 5, 2);
  R(c, D1, x - 5, G - 10, 10, 2); R(c, ASH, x - 5, G - 10, 10, 1);   // наковальня
  R(c, D1, x + 5, G - 10, 2, 1); R(c, ASH, x + 5, G - 10, 1, 1);     // рог
  R(c, ASH, x + 5, G - 7, 1, 7); R(c, ASH, x + 6, G - 8, 1, 2);      // клещи
  R(c, ASH, x - 7, G - 1, 2, 1);                       // окалина
}

function nets(c, x0, gy) {
  const x = Math.round(x0), G = Math.round(gy);
  for (const px of [-12, 0, 11]) R(c, WOOD, x + px, G - 18, 1, 18);
  R(c, BONE, x - 12, G - 18, 1, 18);
  R(c, ASH, x - 12, G - 16, 24, 1);                    // верхняя тетива
  for (let k = 0; k < 3; k++) R(c, ASH, x - 11, G - 13 + 3 * k, 22, 1);
  for (let i = 0; i < 8; i++) R(c, ASH, x - 10 + 3 * i, G - 15, 1, 9);   // ячея
  for (const fx of [-9, -3, 4, 8]) R(c, PAPER, x + fx, G - 17, 2, 2);    // поплавки
}

// равнина: колодец-журавль у сруба, сани-розвальни с сеном, плетень
// с крынками вверх дном на кольях.
function zhuravl(c, x0, gy) {
  const x = Math.round(x0), G = Math.round(gy);
  R(c, WOOD, x + 5, G - 8, 10, 8); R(c, BONE, x + 5, G - 8, 1, 8); R(c, PAPER2, x + 5, G - 8, 10, 1);  // сруб
  R(c, D1, x + 6, G - 5, 9, 1); R(c, D1, x + 6, G - 2, 9, 1);        // венцы
  R(c, WOOD, x - 9, G - 20, 2, 20); R(c, BONE, x - 9, G - 20, 1, 20); // рогатина
  R(c, WOOD, x - 10, G - 22, 1, 3); R(c, WOOD, x - 7, G - 22, 1, 3);
  SEG(c, PAPER2, x - 15, G - 17, x + 13, G - 31);      // журавель
  R(c, D1, x - 15, G - 19, 3, 3);                      // груз-чурбак
  R(c, ASH, x + 12, G - 30, 1, 18);                    // шест к бадье
  R(c, D1, x + 11, G - 12, 3, 3); R(c, ASH, x + 11, G - 12, 3, 1);   // бадья
}

function sledge(c, x0, gy) {
  const x = Math.round(x0), G = Math.round(gy);
  R(c, WOOD, x - 12, G - 2, 21, 2); R(c, PAPER2, x - 12, G - 2, 21, 1);   // полоз
  R(c, WOOD, x + 9, G - 3, 1, 1); R(c, WOOD, x + 10, G - 5, 1, 2); R(c, WOOD, x + 11, G - 8, 1, 3);  // загнутый передок
  R(c, PAPER2, x + 9, G - 3, 1, 1); R(c, PAPER2, x + 10, G - 5, 1, 1); R(c, PAPER2, x + 11, G - 9, 1, 1);
  R(c, PLANK, x - 11, G - 7, 19, 3); R(c, PAPER2, x - 11, G - 7, 19, 1); R(c, BONE, x - 11, G - 7, 1, 3);  // кузов
  R(c, D1, x - 9, G - 4, 1, 2); R(c, D1, x - 2, G - 4, 1, 2); R(c, D1, x + 5, G - 4, 1, 2);   // копылья
  R(c, PAPER2, x - 8, G - 9, 11, 2); R(c, BONE, x - 6, G - 10, 5, 1);    // сено
}

function wattlePots(c, x0, gy) {
  const x = Math.round(x0), G = Math.round(gy);
  for (const px of [-10, -3, 4, 10]) R(c, D1, x + px, G - 12, 1, 12);   // колья
  for (let k = 0; k < 3; k++) { R(c, WOOD, x - 12, G - 10 + 3 * k, 24, 2); R(c, PAPER2, x - 12 + 4 * (k & 1), G - 10 + 3 * k, 20, 1); }
  for (const px of [-10, 4]) {                         // крынки вверх дном
    R(c, PAPER2, x + px - 2, G - 15, 5, 3); R(c, PAPER2, x + px - 1, G - 16, 3, 1);
    R(c, D2, x + px + 2, G - 15, 1, 3);
  }
}


// ── набор (kit.js): шум, пологая линия, смесь красок канона, план по первому зову ──
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
const B = BONE, A = ASH, K = CINN, S = SEP, C = CANDLE;
const LEAF = mix9(B, S, 0.08), LEAF2 = mix9(B, S, 0.24);              // свежий лист и его тень
const VRED = mix9(K, S, 0.42);                                         // киноварь клиньев, выгоревшая

// подкова: косяки шириной w, дуга шире косяков на точку с каждой стороны и смыкается кругом;
// x — левый косяк, yb — строка под проёмом, h — высота до замка
function horse(P, x, yb, w, h, mat = MAT.DARK) {
  const r = w / 2 + 0.9, cx = x + w / 2, cy = yb - h + r;
  for (let y = yb - h; y < yb; y++) {
    const d = y + 0.5 - cy;
    let half = Math.abs(d) < r ? Math.sqrt(r * r - d * d) : 0;
    if (d > 0) half = Math.max(w / 2, half);
    if (half <= 0) continue;
    const a = Math.round(cx - half), b = Math.round(cx + half);
    if (b > a) P.cut(a, y, b - a, 1, mat);
  }
}
// клинья подковы через один — кость и киноварь (Кордова): кольцо вокруг дуги, ниже центра — до плеч
function voussoirs(px, at, x, yb, w, h, n = 8) {
  const r = w / 2 + 0.9, cx = x + w / 2, cy = yb - h + r, L = tone(MAT.MARBLE, 4);
  for (let y = Math.floor(cy - r - 3); y <= Math.ceil(cy + r * 0.7); y++) for (let i = Math.floor(cx - r - 3); i <= Math.ceil(cx + r + 3); i++) {
    const dx = i + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
    if (d < r + 0.45 || d > r + 2.5 || dy > r * 0.7) continue;
    const m = at(i, y);
    if (!m || m === MAT.DARK) continue;
    px(Math.floor((Math.atan2(dy, dx) + Math.PI) / (Math.PI / n)) % 2 ? VRED : L, i, y);
  }
}
// полуциркульный проём (или ниша) одной частью: x — левый край, yb — строка под ним
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
// купол: от шейки wb раздувается до wm на высоте ym, сходится к острию (point > 1 — луковица,
// < 1 — шлем); knee — где кончается шар и начинается остриё
function domePts(cx, yb, yt, wb, wm, ym, point = 1.4, knee = 0.6) {
  const half = y => {
    if (y >= ym) return wb / 2 + (wm - wb) / 2 * Math.sin((yb - y) / Math.max(1, yb - ym) * Math.PI / 2);
    const t = (ym - y) / Math.max(1, ym - yt);
    if (t <= knee) return wm / 2 * Math.sqrt(1 - t * t);
    return wm / 2 * Math.sqrt(1 - knee * knee) * Math.pow((1 - t) / (1 - knee), point);
  };
  const L = [], Rt = [];
  for (let y = yb; y >= yt; y--) { const h = half(y); L.push([cx - h, y]); Rt.unshift([cx + h, y]); }
  return [...L, ...Rt];
}
// пиксель плана поверх: px(цвет, x, y, w, h) в координатах рамки
const pxOf = (c, X0, Y0) => (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);

// ───────────────────────── ДОМИНАНТА · юг ─────────────────────────
// Айя-София (набором), вид с юга. Штукатурка охрой; купол пологий, под свинцом, по основанию — кольцо
// окон между контрфорсиками (окон сорок, с одной стороны видно семнадцать), в окнах лампады — огонь
// доминанты. Под куполом — южный тимпан: под большой аркой окна тремя рядами, по сторонам — две
// громадные опоры под свинцовыми шапками. Влево и вправо купол сходит полукуполами — свинцовыми
// плечами; ниже корпус галерей, окна в два ряда, у входа притвор. Минареты приставлены позже и
// разной рукой: с юга видно юго-западный белого камня (западные — по рассказу, Синана) и
// юго-восточный красного кирпича — его ставили первым, при Мехмеде II; он толще и ниже.
const SOFIA_WIN = Array.from({ length: 17 }, (_, i) => 47 + i * 4);
const sofiaBody = kit(160, 160, P => {
  P.box(3, 124, 9, 36, MAT.ASHLAR);                                  // минарет белого камня: цоколь до кровли
  P.box(4, 30, 7, 94, MAT.MARBLE, FORM.CYL);
  P.box(3, 64, 9, 2, MAT.MARBLE); P.box(3, 96, 9, 2, MAT.MARBLE);    // балконы-шерефе
  P.wedge(7, 10, 30, 1, 7, MAT.SLATE);                               // свинцовый карандаш
  P.box(147, 118, 10, 42, MAT.BRICK);                                // кирпичный — толще и ниже
  P.box(148, 40, 8, 78, MAT.BRICK, FORM.CYL);
  P.box(147, 74, 10, 2, MAT.BRICK);
  P.wedge(152, 22, 40, 1, 8, MAT.SLATE);
  // полукупола: свинцовые плечи от кольца вниз, в обе стороны — одной частью
  const SH = [[46, 56], [40, 57], [34, 60], [29, 64], [25, 69], [22, 75], [20, 82], [19, 90], [19, 100]];
  P.poly([...SH, ...SH.map(([x, y]) => [160 - x, y]).reverse()], MAT.SLATE);
  P.round(25, 80, 100, 14, MAT.SLATE); P.round(135, 80, 100, 14, MAT.SLATE);   // малые полукупола экседр
  P.box(16, 98, 128, 62, MAT.OCHRE);                                 // корпус галерей
  const dome = [];
  for (let k = 0; k <= 24; k++) { const a = Math.PI * k / 24; dome.push([80 - 33 * Math.cos(a), 49 - 18 * Math.sin(a)]); }
  P.poly(dome, MAT.SLATE, FORM.CYL);
  P.box(46, 48, 68, 8, MAT.OCHRE);                                   // кольцо окон под куполом
  for (const x of SOFIA_WIN) P.cut(x, 50, 2, 5);
  for (const bx of [34, 110]) { P.box(bx, 62, 16, 98, MAT.OCHRE); P.wedge(bx + 8, 57, 62, 10, 16, MAT.SLATE); P.cut(bx + 6, 70, 4, 8); }
  // тимпан под большой аркой — отступает вглубь
  const ty = [[50, 100], [50, 86]];
  for (let k = 1; k < 12; k++) { const a = Math.PI * k / 12; ty.push([80 - 30 * Math.cos(a), 86 - 30 * Math.sin(a)]); }
  ty.push([110, 86], [110, 100]);
  P.poly(ty, MAT.OCHRE).shade(1);
  for (const x of [67, 73, 79, 85, 91]) rarch(P, x, 71, 3, 7);
  for (let i = 0; i < 7; i++) rarch(P, 59 + i * 6, 81, 3, 6);
  for (let i = 0; i < 7; i++) rarch(P, 57 + i * 7, 96, 4, 8);
  // окна галерей в два ряда; середину низа занимает притвор
  for (const x of [20, 27, 126, 133, 54, 62, 98, 106]) { rarch(P, x, 114, 3, 8); rarch(P, x, 132, 3, 10); }
  for (const x of [70, 86]) rarch(P, x, 114, 3, 8);
  P.box(69, 126, 22, 2, MAT.SLATE);
  P.box(70, 128, 20, 32, MAT.OCHRE);                                 // притвор
  rarch(P, 76, 160, 8, 20);
  P.cut(72, 132, 2, 6); P.cut(86, 132, 2, 6);
}, { seed: 131, cracks: 2, chip: 0.015, drips: [[52, 101, 6], [107, 101, 5], [38, 79, 7], [120, 79, 6]] }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), RIM = tone(MAT.OCHRE, 4), LEAD = tone(MAT.SLATE, 4);
  // архивольт большой арки — кромка к свету
  for (let k = 0; k <= 40; k++) {
    const a = Math.PI * k / 40, x = Math.round(80 - 31 * Math.cos(a)), y = Math.round(86 - 31 * Math.sin(a));
    px(k < 20 ? RIM : tone(MAT.OCHRE, 3), x, y);
  }
  // контрфорсики между окнами кольца: светлая грань слева
  for (const x of SOFIA_WIN) px(RIM, x - 2, 49, 1, 6);
  // рёбра купола — свинец лёг полосами
  for (const dx of [-24, -14, -5, 5, 14, 24]) { const h = Math.round(18 * Math.sqrt(Math.max(0, 1 - (dx / 33) ** 2))); px(LEAD, 80 + dx, 49 - h + 2, 1, Math.max(1, h - 4)); }
  px(A, 80, 23, 1, 8); px(A, 79, 23, 3, 1); px(A, 78, 21, 1, 2); px(A, 82, 21, 1, 2);   // навершие с полумесяцем
  for (const [x, y] of [[7, 4], [152, 16]]) { px(A, x, y, 1, 6); px(A, x - 1, y - 2, 1, 2); px(A, x + 1, y - 2, 1, 2); }
});
// лампады в окнах кольца: мерцают все разом не в такт
function sofiaLive(c, x, gy, t) {
  const X0 = Math.round(x) - 80, Y0 = Math.round(gy) - 160, f = ((t || 0) / 20 | 0) % 3;
  SOFIA_WIN.forEach((wx, i) => { if ((i + f) % 3) R(c, C, X0 + wx, Y0 + 51, 2, 3); });
}
const sofia = split(sofiaBody, sofiaLive);

// ───────────────────────── ЮГ · дом бумаги, минарет витком ─────────────────────────
// дом бумаги (набором): Кордова. Песчаник; крылья — аркады подков, клинья через один костью и
// киноварью; средний корпус выше, со ступенчатыми мерлонами, портал-подкова в альфисе, над ним
// ажимес — двойное окно с колонкой. На кровле крыльев сохнут свежие листы: лежат на парапете,
// край свешивается, сверху камешек (один лист ветер то и дело поднимает за угол — камешек держит).
// Лампа переписчика горит в правой аркаде ночью.
const PAPER_ARCH = [3, 13, 23, 63, 73, 83];
const PAPER_SHEETS = [[1, 7, 3], [9, 6, 2], [16, 7, 4], [24, 6, 3], [61, 7, 3], [77, 7, 4], [85, 6, 2]];
const paperBody = kit(92, 52, P => {
  P.box(0, 24, 92, 28, MAT.SANDSTONE);
  for (const x of PAPER_ARCH) horse(P, x, 52, 6, 18);
  P.box(32, 6, 28, 46, MAT.SANDSTONE);
  for (const x of [33, 40, 47, 54]) { P.box(x, 3, 5, 3, MAT.SANDSTONE); P.box(x + 1, 1, 3, 2, MAT.SANDSTONE); }
  horse(P, 41, 52, 10, 28);                                          // портал
  horse(P, 41, 17, 3, 7); horse(P, 48, 17, 3, 7);                    // ажимес
}, { seed: 133, chip: 0.02, drips: [[8, 26, 4], [70, 26, 5], [36, 8, 6]] }, (c, X0, Y0, P) => {
  const px = pxOf(c, X0, Y0);
  for (const x of PAPER_ARCH) voussoirs(px, P.at, x, 52, 6, 18, 6);
  voussoirs(px, P.at, 41, 52, 10, 28, 8);
  const AL = tone(MAT.SANDSTONE, 4);                                 // альфис — рамка над подковой
  px(AL, 37, 20, 18, 1); px(AL, 37, 21, 1, 12); px(AL, 54, 21, 1, 12);
  px(tone(MAT.MARBLE, 3), 45, 11, 2, 6); px(tone(MAT.MARBLE, 4), 44, 10, 4, 1);   // колонка ажимеса
  for (const [x, w, d] of PAPER_SHEETS) {
    px(B, x, 23, w, 1); px(LEAF, x, 24, w, d - 1); px(LEAF2, x + 1, 23 + d, w - 3, 1);
    px(tone(MAT.SANDSTONE, 0), x + 1, 24 + d, w - 3, 1);              // лист тонок: под краем тень
    px(tone(MAT.ROCK, 1), x + 1 + (w >> 2), 22, 1, 1);                // камешек
  }
});
function paperLive(c, x, gy, t) {
  const X0 = Math.round(x) - 46, Y0 = Math.round(gy) - 52;
  if (night(t)) R(c, C, X0 + 75, Y0 + 45, 2, 2);                       // лампа переписчика — до утра
  const h = hang(`leaf:${X0}:${Y0}`, X0 + 70, Y0 + 23, 3, { sail: 0.09, damp: 0.93, gy: Y0 + 52, r: 2 });
  const lift = Math.min(2, Math.round(Math.abs(Math.sin(angleOf(h))) * 4));
  R(c, LEAF, X0 + 69, Y0 + 23, 3, 1); R(c, LEAF, X0 + 72, Y0 + 23 - lift, 3, 1);
  if (lift) R(c, LEAF2, X0 + 72, Y0 + 24 - lift, 3, lift);
  R(c, LEAF2, X0 + 69, Y0 + 24, lift ? 3 : 6, 2);
  R(c, tone(MAT.ROCK, 1), X0 + 70, Y0 + 22, 1, 1);
}
const paperHouse = split(paperBody, paperLive);

// дом бумаги #2 (набором): дом мудрости, Багдад. Обожжённый кирпич в два этажа; наверху лоджия
// тремя стрельчатыми арками. В средней — подставка и раскрытая рукопись: строки редкие, поля
// широкие, лист толстый, блок страниц — стопой. В левой — весы с гирями: чаша с рукописью ниже
// чаши с гирями (переводчику платят по весу — так рассказывают). В правой — стопы толстой бумаги.
const paper2 = kit(92, 52, P => {
  P.box(0, 26, 92, 26, MAT.BAKED);
  P.box(0, 9, 92, 17, MAT.BAKED);
  P.box(0, 6, 92, 3, MAT.BAKED);                                     // парапет
  for (const x of [2, 14, 26, 62, 74, 86]) P.box(x, 3, 4, 3, MAT.BAKED);   // зубцы
  for (const x of [30, 41, 52]) parch(P, x, 26, 9, 14);              // лоджия
  parch(P, 12, 52, 8, 17);                                            // дверь
  for (const x of [68, 78]) parch(P, x, 46, 4, 9);
  for (const x of [6, 18, 70, 82]) parch(P, x, 22, 3, 7);
}, { seed: 139, chip: 0.02, drips: [[34, 27, 4], [56, 27, 3]] }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), TB = tone(MAT.TIMBER, 3), TB2 = tone(MAT.TIMBER, 1), W = tone(MAT.IRON, 4);
  px(tone(MAT.BAKED, 4), 0, 26, 92, 1);                               // пояс между этажами
  px(TB, 29, 25, 33, 1);                                              // перила лоджии
  for (const x of [32, 36, 46, 50, 57]) px(TB2, x, 22, 1, 3);
  // весы: стойка, коромысло вкось — рукопись тянет вниз; чаши на шнурах
  px(TB, 34, 15, 1, 10); px(TB, 33, 24, 3, 1);
  hline(c, tone(MAT.TIMBER, 4), X0 + 30, Y0 + 16, X0 + 38, Y0 + 14);
  px(A, 30, 17, 1, 3); px(A, 38, 15, 1, 2);
  px(A, 29, 20, 4, 1); px(LEAF2, 29, 18, 4, 2); px(S, 29, 18, 1, 2);  // чаша с рукописью — ниже
  px(A, 36, 17, 4, 1); px(W, 36, 16, 1, 1); px(W, 38, 16, 2, 1);      // чаша с гирями
  // рукопись на подставке: страницы, редкие строки, широкие поля, блок толщиной
  px(TB, 43, 21, 1, 4); px(TB, 47, 21, 1, 4); px(TB, 42, 20, 7, 1);
  px(LEAF, 41, 15, 4, 5); px(LEAF, 46, 15, 4, 5); px(LEAF2, 45, 15, 1, 5);
  for (const y of [16, 18]) { px(S, 42, y, 2, 1); px(S, 47, y, 2, 1); }
  px(LEAF2, 41, 20, 9, 1); px(mix9(B, S, 0.36), 41, 21, 9, 1);
  px(A, 49, 13, 1, 2);                                                // калам в чернильнице
  for (const [x, h] of [[53, 3], [56, 5], [59, 2]]) { px(LEAF2, x, 25 - h, 3, h); px(LEAF, x, 25 - h, 3, 1); for (let y = 26 - h; y < 25; y += 2) px(S, x, y, 3, 1); }
});

// дом бумаги #3 (набором): хранилище-гениза (по Каиру, при синагоге Бен-Эзры). Гладкая штукатурка,
// окна редкие и малые; под самым карнизом справа — пролом в чулан: из него торчат края листов,
// один свесился по стене. Под проломом стена глухая до земли: ни двери, ни лестницы.
const paper3Body = kit(92, 52, P => {
  P.box(4, 12, 84, 40, MAT.PLASTER);
  P.box(2, 9, 88, 3, MAT.PLASTER);                                   // карниз
  P.box(4, 47, 84, 5, MAT.ASHLAR);                                    // цоколь
  P.cut(65, 12, 11, 5);                                               // пролом под крышей
  P.cut(15, 33, 8, 19);                                               // дверь с перемычкой
  for (const x of [10, 24, 52]) rarch(P, x, 24, 3, 7);
  P.box(36, 16, 9, 8, MAT.BOARD);                                     // решётка галереи
  for (const x of [34, 48]) rarch(P, x, 42, 4, 9);
}, { seed: 143, chip: 0.01, drips: [[66, 18, 5], [74, 18, 6], [30, 12, 5], [55, 12, 4]] }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), G = tone(MAT.TIMBER, 1);
  px(tone(MAT.ASHLAR, 3), 14, 32, 10, 1);                              // перемычка
  for (const x of [34, 48]) { px(tone(MAT.IRON, 3), x + 1, 34, 1, 8); px(tone(MAT.IRON, 3), x + 2, 34, 1, 8); }   // решётки
  for (let x = 37; x < 45; x += 2) px(G, x, 17, 1, 6);
  for (let y = 18; y < 23; y += 2) px(G, 37, y, 7, 1);
  px(tone(MAT.PLASTER, 4), 4, 26, 84, 1);                              // пояс
  // в проломе — листы стопой до края, кромки наружу; класть можно, доставать не предполагалось
  px(LEAF2, 65, 16, 11, 1); px(LEAF, 66, 15, 7, 1); px(LEAF, 74, 15, 2, 1); px(LEAF2, 67, 14, 4, 1); px(LEAF2, 72, 14, 2, 1);
  px(LEAF, 66, 17, 1, 1); px(LEAF, 73, 17, 2, 1); px(LEAF2, 76, 16, 1, 1);
});
function paper3Live(c, x, gy, t) {
  const X0 = Math.round(x) - 46, Y0 = Math.round(gy) - 52;
  // свесившийся лист: держится краем, низ ходит на ветру
  const h = hang(`geniza:${X0}:${Y0}`, X0 + 69, Y0 + 17, 5, { sail: 0.07, damp: 0.95, gy: Y0 + 52, r: 2 });
  const o = Math.max(-1, Math.min(1, Math.round(Math.sin(angleOf(h)) * 3)));
  R(c, LEAF, X0 + 68, Y0 + 17, 3, 2); R(c, LEAF2, X0 + 68 + (o > 0 ? 1 : 0), Y0 + 19, 3, 1); R(c, LEAF2, X0 + 68 + o, Y0 + 20, 3, 2);
  R(c, LEAF2, X0 + 69 + o, Y0 + 22, 2, 1);
}
const paper3 = split(paper3Body, paper3Live);

// спиральный минарет (набором): Самарра. Обожжённый кирпич; квадратный цоколь, конус — пандусом:
// виток идёт снаружи, перил нет. По силуэту уступы слева и справа — на полвитка вразбежку; по
// лицу пандус — светлой кромкой, под ней тень. Наверху беседка с двумя стрельчатыми проёмами.
const MALW = { b: 94, top: 22, turns: 5 };
const malwSteps = () => {
  const p = (MALW.b - MALW.top) / MALW.turns, L = [], Rr = [];
  for (let k = 0; k < MALW.turns; k++) { L.push(MALW.b - p * (k + 0.5)); Rr.push(MALW.b - p * (k + 1)); }
  return { p, L, R: Rr };
};
// полуширина конуса на высоте y по своей стороне: уступ 2 точки на каждый пройденный виток
function malwHalf(y, steps) {
  const n = steps.filter(s => y < s).length;
  return 19 - 2.4 * n - 0.4 * (MALW.b - y) / ((MALW.b - MALW.top) / MALW.turns) + 0.4 * n;
}
const malwiya = kit(44, 104, P => {
  P.box(1, 94, 42, 10, MAT.BAKED);
  const st = malwSteps(), pts = [];
  for (let y = MALW.b; y >= MALW.top; y--) pts.push([22 - malwHalf(y, st.L), y]);
  for (let y = MALW.top; y <= MALW.b; y++) pts.push([22 + malwHalf(y, st.R), y]);
  P.poly(pts, MAT.BAKED, FORM.CYL);
  P.box(17, 10, 10, 12, MAT.BAKED);                                  // беседка
  P.box(16, 8, 12, 2, MAT.BAKED);
  P.wedge(22, 4, 7, 2, 8, MAT.BAKED);
  parch(P, 18, 21, 3, 8); parch(P, 23, 21, 3, 8);
  rarch(P, 19, 104, 6, 8);                                            // вход в цоколе
}, { seed: 147, chip: 0.03, cracks: 1 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), st = malwSteps(), TOP = tone(MAT.BAKED, 5), SH = tone(MAT.BAKED, 0);
  // пандус по лицу: от правого уступа витка вверх-влево к левому — светлая кромка, под ней тень
  for (let k = 0; k < MALW.turns; k++) {
    const yr = st.R[k] - 1 + st.p, yl = st.L[k];
    const xr = Math.floor(22 + malwHalf(yr + 1, st.R)) - 1, xl = Math.ceil(22 - malwHalf(yl + 1, st.L));
    if (k === 0) continue;
    hline(c, TOP, X0 + xr, Y0 + Math.round(yr), X0 + xl, Y0 + Math.round(yl));
    hline(c, SH, X0 + xr, Y0 + Math.round(yr) + 1, X0 + xl, Y0 + Math.round(yl) + 1);
  }
  const yr0 = MALW.b - 1, yl0 = st.L[0];                               // первый виток — от земли у правого края цоколя
  hline(c, TOP, X0 + 40, Y0 + yr0, X0 + Math.ceil(22 - malwHalf(yl0 + 1, st.L)), Y0 + Math.round(yl0));
  hline(c, SH, X0 + 40, Y0 + yr0 + 1, X0 + Math.ceil(22 - malwHalf(yl0 + 1, st.L)), Y0 + Math.round(yl0) + 1);
  px(tone(MAT.BAKED, 4), 1, 94, 42, 1);
});

// спиральный минарет #2 (набором): Ибн Тулун, Каир — пониже, тоже витком: квадратный цоколь с
// наружной лестницей вкось, на нём цилиндр, лестница обходит его витком; выше восьмерик с
// арочками, фонарь и ребристый куполок-курильница.
const tulun = kit(44, 104, P => {
  P.box(6, 66, 32, 38, MAT.ASHLAR);
  P.box(5, 64, 34, 2, MAT.ASHLAR);
  P.box(11, 44, 22, 20, MAT.ASHLAR, FORM.CYL);
  P.box(10, 42, 24, 2, MAT.ASHLAR);
  P.box(14, 32, 16, 10, MAT.ASHLAR);
  for (const x of [16, 21, 26]) rarch(P, x, 41, 2, 6);
  P.box(17, 26, 10, 6, MAT.ASHLAR);
  P.round(22, 19, 26, 9, MAT.ASHLAR);
  for (const x of [10, 30]) horse(P, x, 84, 4, 10);                  // глухие подковы цоколя
  rarch(P, 19, 104, 6, 10);
}, { seed: 149, chip: 0.03, cracks: 1 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), TOP = tone(MAT.ASHLAR, 5), SH = tone(MAT.ASHLAR, 0);
  // лестница цоколя: от земли справа вверх-влево до верха квадрата, парапет — кромкой
  for (const [x0, y0, x1, y1] of [[38, 103, 7, 70], [33, 63, 11, 52], [33, 51, 11, 45]]) {
    hline(c, TOP, X0 + x0, Y0 + y0 - 1, X0 + x1, Y0 + y1 - 1);
    hline(c, SH, X0 + x0, Y0 + y0, X0 + x1, Y0 + y1);
  }
  for (let k = 0; k < 6; k++) px(tone(MAT.ASHLAR, 1), 13 + k * 3, 30, 1, 1);
  for (const dx of [-3, 0, 3]) px(tone(MAT.ASHLAR, 1), 22 + dx, 21, 1, 4);   // рёбра куполка
  px(A, 22, 14, 1, 5); px(A, 21, 15, 3, 1);
});

// ───────────────────────── ВОСТОК · камень и тушь ─────────────────────────
// пагода (набором): пять ярусов. Каменный стилобат; тела ярусов — светлая штукатурка в киноварных
// стойках, в середине решётка, за ней темно; кровли черепицей кавара с глубоким свесом, концы
// свеса загнуты вверх, под свесом — полоса кронштейнов в тени. Сорин: тёмный шест, девять колец,
// пламя-суйэн. Этажей внутри нет: ярусы держат только крыши.
const PAG = (() => {
  const T = [], bw = [18, 16, 14, 12, 10], bh = [10, 9, 8, 7, 7], ew = [22, 20, 18, 16, 14];
  let y = 85;
  for (let i = 0; i < 5; i++) {
    const top = y - bh[i] + 1, rb = top - 1, rt = rb - 4;
    T.push({ bw: bw[i], top, bot: y, ew: ew[i], rt, rb });
    y = rt - 1;
  }
  return T;
})();
const pagoda = kit(48, 92, P => {
  P.box(7, 86, 34, 6, MAT.ASHLAR);
  P.box(18, 89, 12, 3, MAT.ASHLAR);                                   // ступени
  for (const t of PAG) {
    P.box(24 - t.bw / 2, t.top, t.bw, t.bot - t.top + 1, MAT.SHIKKUI);
    P.cut(22, t.top + 2, 4, t.bot - t.top - 1);
    P.wedge(24, t.rt, t.rb, t.bw - 4, 2 * t.ew, MAT.KAWARA);
    P.box(24 - t.ew, t.rb - 1, 2, 1, MAT.KAWARA); P.box(24 + t.ew - 2, t.rb - 1, 2, 1, MAT.KAWARA);   // загиб углов
    P.box(24 - t.ew + 3, t.top, 2 * t.ew - 6, 1, MAT.TIMBER).shade(1); // кронштейны под свесом
  }
  P.box(21, 16, 6, 3, MAT.BASALT);                                    // подножие сорина
  P.box(23, 3, 2, 13, MAT.BASALT);
}, { seed: 151, moss: 0.04, chip: 0.01 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), PIL = mix9(K, S, 0.45), GR = tone(MAT.TIMBER, 3);
  for (const t of PAG) {
    const L = 24 - t.bw / 2;
    for (const x of [L, L + t.bw - 1, 21, 26]) px(PIL, x, t.top + 1, 1, t.bot - t.top);
    for (const x of [23, 24]) px(GR, x, t.top + 2, 1, t.bot - t.top - 1);   // решётка, за ней темно до шпиля
    px(GR, 22, t.top + 4, 4, 1);
  }
  for (let k = 0; k < 9; k++) px(tone(MAT.BASALT, 4), 22, 4 + k * 1.3 | 0, 1, 1);   // девять колец
  for (let k = 0; k < 9; k++) px(tone(MAT.BASALT, 1), 25, 4 + k * 1.3 | 0, 1, 1);
  px(tone(MAT.BASALT, 3), 22, 0, 4, 3); px(tone(MAT.BASALT, 5), 22, 0, 1, 2); px(N, 23, 1, 2, 1);   // суйэн
});

// сад камней (набором): слева зал на сваях — кровля иримоя черепицей, сёдзи, за одной — свеча;
// энгава, под полом темно. Позади низкая масляная ограда в потёках под черепичной кромкой. Гравий
// расчёсан граблями; камни на островках мха, вокруг рябь кольцами. Один камень заслоняет другой:
// с веранды камней видно меньше, чем числится.
const ROCKS = [[30, 36, 44, 9, 1], [51, 37, 43, 6, 0], [46, 34, 44, 10, 1], [66, 30, 44, 7, 1], [81, 37, 44, 9, 1]];
const rockGarden = kit(92, 47, P => {
  P.box(30, 22, 62, 12, MAT.MUD);                                     // масляная ограда
  P.box(29, 19, 63, 3, MAT.KAWARA);
  P.box(0, 33, 92, 1, MAT.MUD).shade(1);
  P.box(0, 34, 92, 13, MAT.GRAVEL);
  // зал
  for (const x of [3, 12, 22, 31]) P.box(x, 27, 1, 7, MAT.TIMBER);    // сваи
  P.box(0, 25, 38, 2, MAT.BOARD);                                     // энгава
  P.box(3, 14, 30, 11, MAT.SHIKKUI);
  P.wedge(18, 8, 13, 26, 38, MAT.KAWARA);                             // нижний скат иримои
  P.wedge(18, 3, 8, 8, 24, MAT.KAWARA);                               // щипец
  P.box(10, 2, 16, 1, MAT.KAWARA);                                    // конёк
  P.box(0, 13, 2, 1, MAT.KAWARA); P.box(35, 13, 2, 1, MAT.KAWARA);
  for (const [cx, yt, yb, w] of ROCKS) { P.box(cx - w / 2 - 1, yb - 1, w + 2, 2, MAT.MOSS); P.round(cx, yt, yb - 1, w, MAT.ROCK); }
}, { seed: 157, drips: [[34, 23, 8], [41, 23, 6], [47, 23, 9], [58, 23, 5], [63, 23, 8], [72, 23, 7], [79, 23, 9], [88, 23, 6]] }, (c, X0, Y0, P) => {
  const px = pxOf(c, X0, Y0), FR = tone(MAT.TIMBER, 1);
  px(N, 0, 27, 38, 6);                                                // под полом темно
  for (const x of [3, 12, 22, 31]) px(tone(MAT.TIMBER, 2), x, 27, 1, 6);
  for (const x of [3, 10, 17, 24, 32]) px(FR, x, 14, 1, 11);          // стойки сёдзи
  for (const y of [17, 21]) px(FR, 3, y, 30, 1);
  px(C, 25, 18, 7, 3);                                                // свеча за ширмой — одна створка светится сплошь
  px(tone(MAT.BOARD, 4), 0, 25, 38, 1);
  // рябь кольцами вокруг камней: по гравию, не по камню и не по мху
  for (const [cx, yt, yb, w, big] of ROCKS) {
    if (!big) continue;
    for (const rr of [w / 2 + 2.5, w / 2 + 4.5]) for (let a = 0; a < 48; a++) {
      const x = Math.round(cx + rr * 1.3 * Math.cos(a / 48 * 2 * Math.PI)), y = Math.round(yb - 1 + rr * 0.45 * Math.sin(a / 48 * 2 * Math.PI));
      if (P.at(x, y) === MAT.GRAVEL && y >= 35) px(tone(MAT.GRAVEL, 1), x, y);
    }
  }
});

// ───────────────────────── ЗАПАД · чёрный собор, фахверк ─────────────────────────
// чёрный собор (набором): Кёльн. Песчаник, почерневший от копоти; левая башня доведена до
// ажурного шпиля с крестоцветом, правая обрывается лесами — на ней топчаковый кран, со стрелы
// на канате висит камень, свежий, ещё светлый. В середине щипец, большое стрельчатое окно —
// в переплёте одно цветное стекло; три стрельчатых портала.
const cathBody = kit(84, 120, P => {
  P.box(2, 40, 26, 80, MAT.SOOTSAND);
  P.box(5, 30, 20, 10, MAT.SOOTSAND);
  P.poly([[5, 30], [14.5, 3], [15.5, 3], [25, 30]], MAT.SOOTSAND);    // ажурный шпиль
  for (let y = 8; y < 29; y += 4) { const hw = (y - 3) * 10 / 27; P.cut(Math.round(15 - hw * 0.5), y, 1, 2); P.cut(Math.round(15 + hw * 0.5) - 1, y, 1, 2); }
  P.wedge(3.5, 33, 40, 1, 3, MAT.SOOTSAND); P.wedge(26.5, 33, 40, 1, 3, MAT.SOOTSAND);
  P.box(28, 56, 28, 64, MAT.SOOTSAND);
  P.wedge(42, 45, 56, 2, 28, MAT.SOOTSAND);
  P.box(56, 50, 26, 70, MAT.SOOTSAND);
  P.clear(56, 50, 3, 2); P.clear(66, 50, 5, 1); P.clear(76, 50, 6, 2); P.clear(79, 52, 3, 1);   // верх не доведён
  for (const tx of [2, 56]) { parch(P, tx + 6, 76, 4, 20); parch(P, tx + 16, 76, 4, 20); parch(P, tx + 9, 120, 8, 22); }
  parch(P, 36, 88, 12, 24);                                           // большое окно
  parch(P, 36, 120, 12, 26);                                          // главный портал
  rarch(P, 40, 54, 4, 4);                                             // глазок в щипце
  // кран: будка с колесом на лесах, стрела
  P.box(64, 30, 12, 14, MAT.BOARD);
  P.wedge(70, 26, 30, 2, 14, MAT.BOARD);
}, { seed: 161, chip: 0.03, cracks: 1 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), TR = tone(MAT.SOOTSAND, 4), TB = tone(MAT.TIMBER, 3);
  px(TR, 39, 74, 1, 14); px(TR, 44, 74, 1, 14); px(TR, 37, 74, 10, 1);   // переплёт: два ланцета и круг над ними
  px(TR, 41, 66, 2, 1); px(TR, 41, 71, 2, 1); px(TR, 40, 67, 1, 4); px(TR, 43, 67, 1, 4);
  px(K, 41, 68, 2, 2);                                                // одно цветное стекло
  px(TR, 41, 98, 2, 22);                                              // средник портала
  for (const tx of [2, 56]) for (const x of [tx + 7, tx + 17]) px(TR, x, 58, 2, 18);
  px(tone(MAT.SOOTSAND, 5), 14, 0, 2, 3); px(tone(MAT.SOOTSAND, 5), 13, 1, 4, 1);   // крестоцвет
  // леса: стойки выше настилов, два настила, раскос
  px(TB, 58, 38, 1, 12); px(TB, 80, 38, 1, 12); px(TB, 57, 44, 25, 1); px(TB, 57, 39, 25, 1);
  hline(c, TB, X0 + 59, Y0 + 48, X0 + 64, Y0 + 45);
  // колесо в будке и стрела вверх-вправо
  px(N, 66, 33, 8, 8); px(TB, 67, 34, 6, 6); px(N, 68, 35, 4, 4); px(TB, 69, 34, 2, 6); px(TB, 67, 36, 6, 2);
  hline(c, tone(MAT.TIMBER, 2), X0 + 74, Y0 + 31, X0 + 78, Y0 + 21);
  hline(c, TB, X0 + 73, Y0 + 31, X0 + 77, Y0 + 21);
});
function cathLive(c, x, gy) {
  const X0 = Math.round(x) - 42, Y0 = Math.round(gy) - 120;
  // камень на канате со стрелы: тяжёлый — ходит медленно и долго
  const h = hang(`kran:${X0}:${Y0}`, X0 + 78, Y0 + 22, 11, { segs: 2, sail: 0.015, damp: 0.996, gy: Y0 + 120, r: 3 });
  drawRope(c, h.pts, A);
  const tp = tipOf(h), kx = Math.max(X0 + 2, Math.min(X0 + 79, Math.round(tp.x))), ky = Math.round(tp.y);
  R(c, tone(MAT.SANDSTONE, 2), kx - 2, ky, 4, 3); R(c, tone(MAT.SANDSTONE, 4), kx - 2, ky, 4, 1);
}
const cathedral = split(cathBody, cathLive);

// фахверковый дом (набором): внизу бутовый камень — дверь и лавка, ставень откинут прилавком;
// два этажа с выносом, каждый шире нижнего: штукатурка в стойках, ригелях и раскосах; крутой
// фахверковый щипец под черепичной кромкой, наверху балка с блоком. Сбоку цеховой щит на
// кронштейне — качается; одно окно ночью тёплое.
const fachBody = kit(48, 76, P => {
  P.box(8, 54, 32, 22, MAT.RUBBLE);
  parch(P, 11, 76, 7, 17);
  P.cut(23, 58, 12, 8);                                               // лавка
  P.box(6, 52, 36, 2, MAT.TIMBER);
  P.box(6, 39, 36, 13, MAT.PLASTER);
  P.box(4, 37, 40, 2, MAT.TIMBER);
  P.box(4, 24, 40, 13, MAT.PLASTER);
  P.wedge(24, 2, 24, 2, 42, MAT.TILE);
  P.wedge(24, 6, 24, 1, 34, MAT.PLASTER);
  for (const x of [9, 35]) P.cut(x, 42, 4, 6, MAT.GLASS);
  for (const x of [7, 30, 37]) P.cut(x, 27, 4, 6, MAT.GLASS);
  P.cut(22, 14, 4, 5, MAT.GLASS);
}, { seed: 163, chip: 0.02, moss: 0.03 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), T = tone(MAT.TIMBER, 1), T2 = tone(MAT.TIMBER, 3);
  // каркас этажей: стойки, ригели, раскосы «человечком»
  for (const [l, r, top, bot] of [[6, 41, 39, 51], [4, 43, 24, 36]]) {
    px(T, l, top, r - l + 1, 1); px(T, l, bot, r - l + 1, 1);
    for (const x of [l, l + 9, 23, 24, r - 9, r]) px(T, x, top, 1, bot - top);
    hline(c, T, X0 + l + 1, Y0 + bot - 1, X0 + l + 8, Y0 + top + 1);
    hline(c, T, X0 + r - 1, Y0 + bot - 1, X0 + r - 8, Y0 + top + 1);
    hline(c, T, X0 + 22, Y0 + bot - 1, X0 + 16, Y0 + top + 4);
    hline(c, T, X0 + 25, Y0 + bot - 1, X0 + 31, Y0 + top + 4);
  }
  for (let x = 6; x <= 41; x += 3) px(T2, x, 53, 1, 1);               // торцы балок выноса
  for (let x = 4; x <= 43; x += 3) px(T2, x, 38, 1, 1);
  // щипец: стойки и ригель, балка с блоком наверху
  px(T, 23, 8, 2, 16); px(T, 13, 18, 22, 1); px(T, 18, 12, 12, 1);
  hline(c, T, X0 + 12, Y0 + 22, X0 + 18, Y0 + 14); hline(c, T, X0 + 35, Y0 + 22, X0 + 29, Y0 + 14);
  px(T2, 23, 3, 2, 4); px(T2, 22, 7, 4, 1); px(A, 23, 8, 1, 4);
  // ставень лавки откинут прилавком; товар
  px(tone(MAT.BOARD, 3), 22, 66, 14, 1); px(tone(MAT.BOARD, 1), 22, 67, 14, 1);
  px(T2, 22, 67, 1, 3); px(T2, 35, 67, 1, 3);
  for (const x of [24, 28, 32]) px(tone(MAT.BOARD, 4), x, 65, 2, 1);
  px(tone(MAT.BOARD, 3), 22, 56, 14, 2);                              // верхний ставень — козырьком
  px(T2, 41, 44, 5, 1); px(T2, 41, 45, 1, 2);                         // кронштейн щита
});
function fachLive(c, x, gy, t) {
  const X0 = Math.round(x) - 24, Y0 = Math.round(gy) - 76;
  if (night(t)) R(c, C, X0 + 30, Y0 + 27, 4, 6);
  const h = hang(`guild:${X0}:${Y0}`, X0 + 44.5, Y0 + 45, 3, { sail: 0.04, damp: 0.993, gy: Y0 + 76, r: 3 });
  const o = Math.max(-1, Math.min(1, Math.round(tipOf(h).x - (X0 + 44.5))));
  R(c, A, X0 + 44, Y0 + 45, 1, 2);
  R(c, VRED, X0 + 43 + o, Y0 + 47, 4, 4); R(c, mix9(K, B, 0.3), X0 + 43 + o, Y0 + 47, 4, 1);
  R(c, B, X0 + 43 + o, Y0 + 49, 1, 1); R(c, B, X0 + 44 + o, Y0 + 48, 2, 1); R(c, B, X0 + 46 + o, Y0 + 49, 1, 1);   // знак цеха — стропило
}
const fachwerk = split(fachBody, fachLive);

// ───────────────────────── СЕВЕР · смола и руны ─────────────────────────
// ставкирка (набором): вид с долгой стороны. Внизу галерея-свальганг с аркадой малых проёмов,
// над ней юбка кровли; стены нефа на ставах — смолёная доска; кровли гонтом ярусами; на концах
// конька нефа — кресты, на концах верхнего — драконьи головы; башенка-такрюттар со шпилем.
// Над дверью крест. Снег по верхам.
function staveBuild(P, d) {
  const S2 = (q) => (d ? q.shade(d) : q);
  S2(P.box(4, 72, 50, 16, MAT.TARRED));
  for (const x of [7, 11, 15, 19, 37, 41, 45, 49]) rarch(P, x, 81, 2, 5);
  rarch(P, 26, 88, 6, 11);                                            // дверь
  S2(P.trap(1, 56, 6, 51, 65, 71, MAT.SPON));                         // юбка галереи
  S2(P.box(9, 52, 40, 13, MAT.TARRED));
  for (const x of [14, 22, 34, 42]) P.cut(x, 56, 2, 2);
  S2(P.trap(3, 54, 11, 46, 40, 51, MAT.SPON));
  S2(P.box(14, 33, 30, 7, MAT.TARRED));
  S2(P.trap(9, 48, 18, 39, 22, 32, MAT.SPON));
  S2(P.box(24, 17, 10, 5, MAT.TARRED));
  for (const x of [26, 29, 32]) P.cut(x, 18, 1, 3);
  S2(P.trap(22, 35, 25, 32, 13, 16, MAT.SPON));
  S2(P.wedge(29, 2, 12, 1, 7, MAT.SPON));
}
function staveOver(c, X0, Y0, fresh) {
  const px = pxOf(c, X0, Y0), D = tone(MAT.TARRED, fresh ? 2 : 1), E = fresh ? tone(MAT.TARRED, 5) : B, X = tone(MAT.TARRED, fresh ? 5 : 4);
  // драконы на концах верхнего конька: шея вверх-наружу, голова с челюстью, глаз
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? 18 : 39;
    hline(c, D, X0 + x0, Y0 + 22, X0 + x0 + s * 6, Y0 + 15);
    hline(c, D, X0 + x0 + s, Y0 + 22, X0 + x0 + s * 7, Y0 + 15);
    const hx = s < 0 ? x0 - 11 : x0 + 6;
    px(D, hx, 13, 6, 2); px(D, s < 0 ? hx : hx + 4, 15, 2, 1); px(D, s < 0 ? hx + 4 : hx, 12, 2, 1);
    px(E, s < 0 ? hx + 2 : hx + 3, 13, 1, 1);
  }
  // кресты на концах конька нефа и над дверью
  for (const x of [11, 46]) { px(X, x, 35, 1, 5); px(X, x - 1, 36, 3, 1); }
  px(X, 28, 70, 2, 5); px(X, 26, 71, 6, 1);
  px(X, 29, 0, 1, 2);
}
const stave = kit(58, 88, P => staveBuild(P, 0), { seed: 167, snow: 0.35, chip: 0.02, moss: 0.04 }, (c, X0, Y0) => staveOver(c, X0, Y0, false));
// ставкирка #2 (набором): та, что сгорела и отстроена бревно в бревно (Фантофт): тот же вид, но
// дерево новое — смола свежая, светлее, кромки целы, ни мха, ни сколов. Дракон и крест рядом,
// оба новые.
const stave2 = kit(58, 88, P => staveBuild(P, -1), { seed: 171 }, (c, X0, Y0) => staveOver(c, X0, Y0, true));

// щит на борту: круг в цвет, умбон тёмной точкой
function shield(px, x, y, col) { px(col, x + 1, y, 2, 1); px(col, x, y + 1, 4, 2); px(col, x + 1, y + 3, 2, 1); px(N, x + 2, y + 1, 1, 1); px(tone(MAT.IRON, 4), x + 1, y + 2, 1, 1); }
// драккар на берегу (набором): обшивка внакрой тёмным дубом, корпус-полумесяц на брёвнах-катках;
// форштевень вправо с драконьей головой, ахтерштевень завитком; щиты по борту через один костью
// и пеплом, одного нет. Мачта колокольней: рей, свёрнутый парус, на рее колокол — качается. Из
// борта растёт рябина: тёмная крона, кисти ягод.
const HULL = [[8, 40], [12, 46], [17, 52], [25, 56], [61, 56], [69, 52], [75, 46], [79, 40], [73, 45], [63, 48], [23, 48], [13, 45]];
function hullBuild(P, hull) {
  P.poly(hull, MAT.CLINKER);
  for (const x of [20, 36, 52, 66]) P.round(x + 1, 57, 59, 4, MAT.LOGS);   // катки
}
const drakBody = kit(86, 64, P => {
  P.box(0, 60, 86, 4, MAT.SNOW);
  hullBuild(P, HULL);
  P.poly([[77, 42], [80, 30], [81, 25], [84, 23], [85, 25], [83, 26], [82, 31], [80, 42]], MAT.TIMBER);   // форштевень
  P.poly([[11, 43], [7, 33], [5, 27], [7, 23], [10, 24], [9, 27], [8, 32], [13, 43]], MAT.TIMBER);       // ахтерштевень
  P.box(42, 2, 2, 46, MAT.TIMBER);
  P.box(30, 8, 26, 2, MAT.TIMBER);
  P.box(31, 10, 24, 2, MAT.FELT);
  P.box(20, 31, 1, 17, MAT.TIMBER);                                   // рябина
  P.round(18, 22, 30, 10, MAT.MOSS); P.round(24, 25, 31, 7, MAT.MOSS);
}, { seed: 173, snow: 0.2 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0);
  for (let i = 0; i < 9; i++) {                                       // щиты: через один, одного нет
    if (i === 5) continue;
    shield(px, 18 + i * 6, 44, i % 2 ? A : B);
  }
  px(tone(MAT.TIMBER, 2), 81, 21, 4, 2); px(tone(MAT.TIMBER, 2), 84, 23, 1, 1); px(B, 83, 21, 1, 1);   // голова дракона
  px(tone(MAT.TIMBER, 4), 6, 22, 3, 1);
  for (const [x, y] of [[16, 26], [21, 24], [25, 28]]) { px(K, x, y, 2, 1); px(K, x + 1, y + 1, 1, 1); }   // ягоды
  px(tone(MAT.FELT, 1), 37, 10, 2, 2); px(tone(MAT.FELT, 1), 46, 10, 2, 2);   // подвязки паруса
});
function drakLive(c, x, gy) {
  const X0 = Math.round(x) - 43, Y0 = Math.round(gy) - 64;
  const h = hang(`drakbell:${X0}:${Y0}`, X0 + 53.5, Y0 + 10, 3, { sail: 0.02, damp: 0.996, gy: Y0 + 64, r: 3 });
  const s = Math.sin(angleOf(h)), BL = tone(MAT.IRON, 3);
  R(c, A, X0 + 53, Y0 + 10, 1, 1);
  for (let k = 0; k < 4; k++) R(c, BL, X0 + 52 + Math.round(s * (k + 1)) - (k > 1 ? 1 : 0), Y0 + 11 + k, k > 1 ? 4 : 2, 1);
  R(c, tone(MAT.IRON, 4), X0 + 52 + Math.round(s * 2), Y0 + 12, 1, 2);
}
const drakkar = split(drakBody, drakLive);

// драккар #2 (набором): курганный корабль (по Усебергу). Катки уложены от воды — к яме под курган,
// за ней отвал глины. Нос — высокая спираль змеи, корма — завиток. На палубе за мачтой —
// погребальная камера из досок под двускатной крышей; повозка, сани, кровать со звериными
// головами на столбиках, сундуки, ведро с человечком на боку; вёсла положены все — пучком вдоль
// борта.
const oseberg = kit(86, 64, P => {
  P.box(0, 58, 86, 6, MAT.MUD);
  P.round(11, 44, 58, 20, MAT.SAND);                                  // отвал
  P.trap(4, 22, 2, 24, 58, 63, MAT.DARK);                             // яма
  hullBuild(P, [[30, 40], [33, 47], [38, 52], [46, 55], [70, 55], [76, 51], [80, 45], [82, 38], [78, 44], [71, 48], [44, 48], [35, 45]]);
  P.round(27, 54, 57, 4, MAT.LOGS);
  P.poly([[80, 44], [83, 30], [84, 22], [83, 17], [80, 16], [78, 18], [79, 20], [81, 20], [81, 29], [78, 44]], MAT.CLINKER);   // нос-спираль
  P.poly([[33, 44], [30, 34], [29, 27], [31, 24], [33, 25], [32, 28], [32, 34], [35, 44]], MAT.CLINKER);
  P.box(66, 26, 2, 22, MAT.TIMBER);
  P.box(44, 38, 16, 10, MAT.BOARD);                                   // камера
  P.wedge(52, 32, 38, 2, 20, MAT.BOARD);
}, { seed: 179, chip: 0.02 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), T = tone(MAT.TIMBER, 3), T1 = tone(MAT.TIMBER, 1);
  for (const [x0, y0, x1, y1] of [[34, 47, 80, 45], [35, 48, 79, 46], [36, 46, 81, 44]]) hline(c, tone(MAT.TIMBER, 4), X0 + x0, Y0 + y0, X0 + x1, Y0 + y1);   // вёсла пучком
  px(T, 70, 40, 9, 2); px(T1, 70, 42, 9, 1);                          // повозка
  for (const wx of [71, 77]) { px(T1, wx - 1, 42, 3, 3); px(T, wx, 43, 1, 1); }
  hline(c, T, X0 + 36, Y0 + 44, X0 + 42, Y0 + 44); px(T, 35, 42, 1, 2); px(T, 42, 41, 1, 3);   // сани с загнутым полозом
  px(T, 61, 37, 1, 7); px(T, 64, 37, 1, 7); px(T, 61, 41, 4, 1); px(tone(MAT.TIMBER, 5), 61, 36, 1, 1); px(tone(MAT.TIMBER, 5), 64, 36, 1, 1);   // кровать
  px(tone(MAT.BOARD, 3), 46, 44, 4, 3); px(tone(MAT.BOARD, 4), 46, 44, 4, 1); px(tone(MAT.BOARD, 3), 51, 45, 3, 2);   // сундуки
  px(T1, 56, 44, 3, 3); px(tone(MAT.WROUGHT, 4), 57, 45, 1, 1);       // ведро с медным человечком
  px(tone(MAT.CLINKER, 4), 79, 17, 3, 1); px(tone(MAT.CLINKER, 4), 82, 19, 1, 6); px(N, 80, 18, 1, 1);   // завиток носа
});

// драккар #3 (набором): копия 1893-го — через океан на всемирную выставку. На каменной набережной,
// на козлах; щиты по борту через один, драконья голова, мачта с реем. Позади — белая колоннада
// выставки: колонны с каннелюрами, антаблемент; на одной колонне отпала штукатурка — под ней
// дранка: Белый город строили из штаффа, гипса по дранке.
const viking93 = kit(86, 64, P => {
  P.box(0, 4, 86, 2, MAT.MARBLE);
  P.box(0, 6, 86, 6, MAT.MARBLE);
  P.box(0, 12, 86, 24, MAT.MARBLE).shade(3);                          // стена портика в тени
  for (let i = 0; i < 6; i++) { if (i % 2) P.cut(10 + i * 14, 18, 6, 18); P.box(3 + i * 14, 12, 6, 24, MAT.MARBLE, FORM.FLUTE); }
  P.box(0, 36, 86, 3, MAT.MARBLE);
  P.box(0, 59, 86, 5, MAT.ASHLAR);
  for (const x of [22, 40, 58]) P.box(x, 55, 3, 4, MAT.BOARD);        // козлы
  P.poly(HULL.map(([x, y]) => [x, y - 2]), MAT.CLINKER);
  P.poly([[77, 40], [80, 28], [81, 23], [84, 21], [85, 23], [83, 24], [82, 29], [80, 40]], MAT.CLINKER);
  P.poly([[11, 41], [7, 31], [5, 25], [7, 21], [10, 22], [9, 25], [8, 30], [13, 41]], MAT.CLINKER);
  P.box(42, 12, 2, 34, MAT.TIMBER);
  P.box(32, 16, 22, 2, MAT.TIMBER);
  P.box(33, 18, 20, 2, MAT.FELT);
}, { seed: 181, chip: 0.01 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0);
  for (let i = 0; i < 9; i++) {
    shield(px, 18 + i * 6, 42, i % 2 ? A : B);
  }
  px(tone(MAT.CLINKER, 4), 81, 19, 4, 2); px(B, 83, 19, 1, 1);
  px(tone(MAT.MARBLE, 1), 73, 22, 5, 6);                              // отпал штафф —
  for (const y of [23, 25, 27]) px(tone(MAT.TIMBER, 2), 73, y, 5, 1); // под ним дранка
  px(tone(MAT.MARBLE, 5), 0, 6, 86, 1);
});

// ───────────────────────── РАВНИНА · берестяной свет ─────────────────────────
// белокаменный храм (набором): белый известняк; четверик в три прясла, среднее шире, над каждым
// закомара с кромкой; между пряслами лопатки с полуколонками; посредине аркатурно-колончатый
// пояс; окна щелью. Перспективный портал уступами, в глубине — золото иконы (одно на равнину).
// Барабан с щелевыми окнами, шлемовидный купол под свинцом, крест.
const whiteChurch = kit(42, 86, P => {
  P.box(1, 82, 40, 4, MAT.MARBLE);
  P.box(15, 17, 12, 17, MAT.MARBLE, FORM.CYL);                        // барабан
  for (const x of [17, 20, 23]) P.cut(x, 21, 1, 7);
  P.poly(domePts(21, 17, 5, 13, 15, 13, 1.15, 0.55), MAT.SLATE, FORM.CYL);
  P.box(3, 34, 36, 48, MAT.MARBLE);
  for (const [x0, w] of [[3, 11], [14, 14], [28, 11]]) rarch(P, x0, 36, w, w / 2 + 2, MAT.MARBLE);
  for (const x of [8, 20, 33]) P.cut(x, 42, 2, 9);
  rarch(P, 13, 82, 16, 22, MAT.MARBLE).shade(1);                      // портал уступами
  rarch(P, 15, 82, 12, 19, MAT.MARBLE).shade(2);
  rarch(P, 17, 82, 8, 16);
}, { seed: 191, snow: 0.15, chip: 0.02 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), HI = tone(MAT.MARBLE, 5), LO = tone(MAT.MARBLE, 1);
  for (const [x0, w] of [[3, 11], [14, 14], [28, 11]]) {              // кромка закомар
    const r = w / 2;
    for (let k = 0; k <= 12; k++) { const a = Math.PI * k / 12; px(k < 6 ? HI : tone(MAT.MARBLE, 3), Math.round(x0 + r - r * Math.cos(a)), Math.round(36 - w / 2 - 2 + r - r * Math.sin(a))); }
  }
  for (const x of [13, 27]) { px(HI, x, 36, 1, 46); px(LO, x + 1, 36, 1, 46); }   // лопатки
  for (let x = 4; x < 38; x += 3) { px(HI, x, 57, 1, 4); px(LO, x + 1, 57, 1, 1); }   // аркатурный пояс
  px(HI, 3, 56, 36, 1);
  for (let x = 16; x < 27; x += 3) px(HI, x, 28, 1, 3);
  px(ICON_GOLD, 19, 71, 4, 5);                                        // золото иконы
  px(A, 21, 0, 1, 6); px(A, 19, 2, 5, 1);                             // крест
});

// вечевая звонница (набором): псковская звонница-стена, побелена. Два проёма с колоколами, над
// каждым своя кровелька; колокола качаются — звонят к службе. Над простенком ярус вечевого:
// перекладина цела, проём пуст. Перед стеной помост в исправности, ступени подметены — снег
// лежит, где не метут; под ногами мостовая ярусами брёвен.
const belfryBody = kit(60, 77, P => {
  P.box(0, 72, 60, 5, MAT.LOGS);
  P.box(6, 60, 48, 12, MAT.PLASTER);
  P.box(8, 30, 44, 30, MAT.PLASTER);
  for (const x of [10, 36]) { P.box(x, 26, 14, 4, MAT.PLASTER); P.wedge(x + 7, 20, 25, 2, 16, MAT.BOARD); rarch(P, x + 2, 47, 10, 17); }
  P.box(22, 16, 16, 14, MAT.PLASTER);
  rarch(P, 24, 30, 12, 12);
  P.wedge(30, 10, 15, 2, 18, MAT.BOARD);
  P.poly(domePts(30, 10, 3, 3, 6, 7, 1.6, 0.6), MAT.LEMEKH);
  P.box(16, 64, 28, 8, MAT.BOARD);                                    // помост
  P.box(10, 68, 6, 4, MAT.BOARD); P.box(12, 66, 4, 2, MAT.BOARD);
}, { seed: 193, snow: 0.3, chip: 0.02 }, (c, X0, Y0) => {
  const px = pxOf(c, X0, Y0), T = tone(MAT.TIMBER, 3), SW = tone(MAT.BOARD, 4);
  for (const x of [12, 38]) px(T, x, 32, 10, 1);                      // перекладины колоколов
  px(T, 24, 21, 12, 1); px(tone(MAT.TIMBER, 1), 24, 22, 12, 1);      // перекладина вечевого — цела
  px(SW, 10, 68, 6, 1); px(SW, 12, 66, 4, 1); px(SW, 16, 64, 28, 1);  // ступени подметены
  for (const x of [17, 29, 42]) px(tone(MAT.BOARD, 1), x, 65, 1, 7);
  px(T, 16, 61, 1, 3); px(T, 43, 61, 1, 3); px(T, 16, 61, 28, 1);    // перила
  px(A, 30, 0, 1, 4); px(A, 29, 1, 3, 1);
});
function belfryLive(c, x, gy) {
  const X0 = Math.round(x) - 30, Y0 = Math.round(gy) - 77, BL = tone(MAT.IRON, 3), HI = tone(MAT.IRON, 4);
  [17, 43].forEach((bx, i) => {
    const h = hang(`zvon:${X0}:${Y0}:${i}`, X0 + bx + 0.5, Y0 + 33, 4, { sail: 0.02, damp: 0.997, gy: Y0 + 77, r: 4 });
    const s = Math.sin(angleOf(h));
    for (let k = 0; k < 6; k++) R(c, BL, X0 + bx - (k >> 1) - 1 + Math.round(s * (k + 1)), Y0 + 33 + k, 3 + 2 * (k >> 1), 1);
    R(c, HI, X0 + bx - 2 + Math.round(s * 3), Y0 + 35, 1, 3);
    R(c, BL, X0 + bx + Math.round(s * 8), Y0 + 39, 1, 2);             // язык
  });
}
const belfry = split(belfryBody, belfryLive);

// ── ФАСАДЫ ТАБЛИЧЕК 18×30 (набором) ──
// юг: андалусский дом — ступенчатые мерлоны, ажимес, дверь-подкова с клиньями через один
const signSouth = signKit(P => {
  P.box(1, 6, 16, 24, MAT.SANDSTONE);
  for (const x of [1, 6, 11]) { P.box(x + 1, 3, 4, 3, MAT.SANDSTONE); P.box(x + 2, 1, 2, 2, MAT.SANDSTONE); }
  horse(P, 4, 14, 3, 6); horse(P, 10, 14, 3, 6);
  horse(P, 6, 30, 6, 12);
}, { seed: 197, chip: 0.03 }, px => {
  const at = (x, y) => (x >= 1 && x <= 16 && y >= 6 && !(y >= 18 && x >= 5 && x <= 12)) ? MAT.SANDSTONE : 0;
  voussoirs(px, (x, y) => at(x, y), 6, 30, 6, 12, 6);
  px(tone(MAT.MARBLE, 3), 8, 8, 1, 6);
});
// восток: дзэн-мастерская — вальма черепицей с загибом, окно-колокол, сёдзи
const signEast = signKit(P => {
  P.box(2, 13, 14, 17, MAT.SHIKKUI);
  P.trap(0, 17, 3, 14, 7, 12, MAT.KAWARA);
  P.box(5, 5, 8, 2, MAT.KAWARA); P.box(4, 4, 1, 1, MAT.KAWARA); P.box(13, 4, 1, 1, MAT.KAWARA);
  P.cut(8, 15, 2, 1); P.cut(7, 16, 4, 4); P.cut(6, 20, 6, 1);
  P.box(5, 22, 8, 8, MAT.SHIKKUI).shade(-1);
}, { seed: 199, moss: 0.06 }, px => {
  const T = tone(MAT.TIMBER, 1);
  px(T, 2, 13, 1, 17); px(T, 15, 13, 1, 17); px(T, 2, 13, 14, 1);
  px(T, 5, 22, 8, 1); px(T, 8, 22, 1, 8); px(T, 5, 25, 8, 1); px(T, 5, 22, 1, 8); px(T, 12, 22, 1, 8);
});
// запад: фахверк — каменный низ, вынос этажа, крутой щипец под черепичной кромкой
const signWest = signKit(P => {
  P.box(2, 19, 14, 11, MAT.RUBBLE);
  P.box(1, 17, 16, 2, MAT.TIMBER);
  P.box(1, 9, 16, 8, MAT.PLASTER);
  P.wedge(9, 0, 9, 2, 18, MAT.TILE); P.wedge(9, 3, 9, 1, 13, MAT.PLASTER);
  P.cut(3, 11, 3, 4, MAT.GLASS); P.cut(12, 11, 3, 4, MAT.GLASS);
  parch(P, 7, 30, 4, 9);
}, { seed: 211, chip: 0.03 }, px => {
  const T = tone(MAT.TIMBER, 1);
  px(T, 1, 9, 16, 1); px(T, 1, 9, 1, 8); px(T, 8, 9, 2, 8); px(T, 16, 9, 1, 8);
  px(T, 2, 16, 1, 1); px(T, 3, 15, 1, 1); px(T, 15, 16, 1, 1); px(T, 14, 15, 1, 1);
  px(T, 8, 4, 2, 5); px(T, 6, 7, 6, 1);
});
// север: сруб под дёрном и снегом, на щипце доски крест-накрест с драконьими головами, дымник
const signNorth = signKit(P => {
  P.box(1, 14, 16, 16, MAT.LOGS);
  P.trap(0, 17, 4, 13, 8, 13, MAT.MOSS);
  P.box(11, 6, 2, 2, MAT.LOGS);
  P.cut(12, 17, 3, 3, MAT.GLASS);
  rarch(P, 4, 30, 5, 10);
}, { seed: 223, snow: 0.6 }, px => {
  const D = tone(MAT.TARRED, 2);
  px(D, 3, 12, 2, 1); px(D, 5, 10, 2, 2); px(D, 7, 8, 2, 2); px(D, 9, 6, 2, 2); px(D, 10, 4, 2, 2);
  px(D, 13, 12, 2, 1); px(D, 11, 10, 2, 2); px(D, 9, 8, 2, 2); px(D, 7, 6, 2, 2); px(D, 6, 4, 2, 2);
  px(D, 4, 3, 3, 1); px(D, 11, 3, 3, 1);
  px(A, 12, 4, 1, 1);
  px(B, 11, 17, 5, 1); px(B, 11, 17, 1, 4); px(B, 15, 17, 1, 4); px(B, 11, 20, 5, 1);
});

export const ARCH = {
  // ── ДОМИНАНТА · юг: купол на кольце окон, в окнах лампады ──
  landmark: {
    name: 'Айя-София', side: 'south', w: 160, h: 160,
    light: { dx: 0, dy: -109, r: 80 },
    life: { birds: [[-7, -3, -128]] },
    draw: sofia,
  },
  // ── ЮГ · дом бумаги: Кордова, Багдад, Каир; минарет витком: Самарра, Каир ──
  south: [
    { name: 'дом бумаги', w: 92, h: 52, draw: paperHouse, draw2: paper2, draw3: paper3 },
    { name: 'спиральный минарет', w: 44, h: 104, draw: malwiya, draw2: tulun },
  ],
  // ── ВОСТОК · камень и тушь ──
  east: [
    { name: 'пагода', w: 48, h: 92, life: { birds: [[9, 12, -68]] }, draw: pagoda },
    { name: 'сад камней', w: 92, h: 47, life: { birds: [[-34, -30, -44]] }, draw: rockGarden },
  ],
  // ── ЗАПАД · чёрный собор и фахверк ──
  west: [
    { name: 'чёрный собор', w: 84, h: 120, life: { birds: [[17, 20, -80]] }, draw: cathedral },
    { name: 'фахверковый дом', w: 48, h: 76, draw: fachwerk },
  ],
  // ── СЕВЕР · смола и руны ──
  north: [
    { name: 'ставкирка', w: 58, h: 88, life: { birds: [[5, 9, -65]] }, draw: stave, draw2: stave2 },
    {
      name: 'драккар на берегу', w: 86, h: 64,
      life: { flag: [[0, -64, 6, 'V']], birds: [[1, 5, -55]] }, draw: drakkar,
      draw2: oseberg, life2: {},
      draw3: viking93, life3: { flag: [[0, -52, 6, 'V']] },
    },
  ],
  // ── РАВНИНА · берестяной свет ──
  plain: [
    { name: 'белокаменный храм', w: 42, h: 86, life: { birds: [[-15, -11, -56]] }, draw: whiteChurch },
    { name: 'вечевая звонница', w: 60, h: 77, draw: belfry },
  ],
  sign: { south: signSouth, east: signEast, west: signWest, north: signNorth },

  props: {
    south: [
      { name: 'нория', w: 30, h: 28, draw: noria },
      { name: 'кувшины у дорожки', w: 20, h: 13, draw: jugs },
      { name: 'фонтан-чаша', live: true, w: 18, h: 14, draw: fountain },
    ],
    east: [
      { name: 'каменный фонарь', live: true, w: 12, h: 22, draw: toro },
      { name: 'каменная чаша с жёлобом', w: 18, h: 12, draw: tsukubai },
      { name: 'поленница и зола', w: 26, h: 14, draw: woodpile },
    ],
    west: [
      { name: 'кафедра с книгой', w: 12, h: 20, draw: lectern },
      { name: 'тёсаные блоки и киянка', w: 24, h: 10, draw: masonBlocks },
      { name: 'колодец под кровелькой', w: 20, h: 24, draw: stoneWell },
    ],
    north: [
      { name: 'колода с секирой', w: 14, h: 12, draw: axeBlock },
      { name: 'наковальня на пне', w: 14, h: 10, draw: anvil },
      { name: 'сети на кольях', w: 26, h: 18, draw: nets },
    ],
    plain: [
      { name: 'колодец-журавль', w: 30, h: 32, draw: zhuravl },
      { name: 'сани-розвальни', w: 26, h: 10, draw: sledge },
      { name: 'плетень с крынками', w: 24, h: 16, draw: wattlePots },
    ],
  },
};
