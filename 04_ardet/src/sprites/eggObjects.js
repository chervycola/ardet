// ═══════════════════════════════════════
// EGG OBJECTS — пиксельные вещи под пасхалки: именные объекты улицы
// (поле sprite у таблички) и формы записок на земле (поле form).
// Палитра старой игры; правило фонда: вещь стоит в тени, не подсвечивается.
// ═══════════════════════════════════════

import { hang, angleOf } from '../world/hang.js';
const C = {
  dark: '#15100c', wood: '#241c14', wood2: '#3a2418', plank: '#3a2818',
  stone: '#3a3328', stone2: '#2a2620', brick: '#3a1c14', concrete: '#34302a',
  gold: '#b8860b', gold2: '#daa520', crimson: '#6b0f1a',
  bone: '#e8dcc8', ash: '#8a8d8f', black: '#0a0808',
  paper: '#c8b89a', paper2: '#b0a284',
  fire: '#ff7020', fire2: '#ffd060',
};

// ── Объекты улицы: (ctx, x — центр, gy — линия земли, t — тик) ──
const STREET = {
  // курган: холм со срезом раскопа и колышками описи
  kurgan(ctx, x, gy, t) {
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 13, gy - 4, 26, 4);
    ctx.fillRect(x - 10, gy - 8, 20, 4);
    ctx.fillRect(x - 6, gy - 11, 12, 3);
    ctx.fillStyle = C.black;                       // срез раскопа
    ctx.fillRect(x + 2, gy - 8, 6, 8);
    ctx.fillStyle = C.wood2;                       // колышки
    ctx.fillRect(x - 12, gy - 7, 1, 7);
    ctx.fillRect(x + 10, gy - 6, 1, 6);
    ctx.fillStyle = C.paper;                       // бирка описи
    ctx.fillRect(x - 13, gy - 9, 3, 2);
  },
  // обменный камень: валун, меловая черта, меловые метки
  exchange_stone(ctx, x, gy) {
    ctx.fillStyle = C.stone;
    ctx.fillRect(x - 6, gy - 9, 12, 9);
    ctx.fillRect(x - 4, gy - 11, 8, 2);
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 6, gy - 3, 12, 3);
    ctx.fillStyle = C.bone;                        // мелом: цена
    ctx.fillRect(x - 3, gy - 8, 2, 1);
    ctx.fillRect(x + 1, gy - 8, 2, 1);
    ctx.globalAlpha = 0.5;                          // черта, за которую отходят
    ctx.fillRect(x - 14, gy - 1, 28, 1);
    ctx.globalAlpha = 1;
  },
  // фонарь, горящий днём: столб, фонарь, живой огонёк, бирка
  day_lantern(ctx, x, gy, t) {
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 1, gy - 22, 2, 22);
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 4, gy - 30, 8, 9);
    ctx.fillStyle = C.gold;
    ctx.fillRect(x - 4, gy - 31, 8, 1);
    ctx.fillRect(x - 1, gy - 33, 2, 2);
    const fl = Math.sin(t * 0.15 + 2) * 0.5;
    ctx.fillStyle = C.fire;                        // огонь — всегда сплошной
    ctx.fillRect(x - 2, gy - 28 + (fl > 0 ? 1 : 0), 4, 5);
    ctx.fillStyle = C.fire2;
    ctx.fillRect(x - 1, gy - 27, 2, 3);
    ctx.fillStyle = C.paper;                       // бирка на столбе
    ctx.fillRect(x + 2, gy - 16, 4, 5);
    ctx.fillStyle = C.wood2;
    ctx.fillRect(x + 3, gy - 15, 2, 1);
  },
  // клетка с табличкой «человек»: прутья, пусто
  cage(ctx, x, gy) {
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 8, gy - 22, 16, 2);           // верх
    ctx.fillRect(x - 8, gy - 2, 16, 2);            // низ
    ctx.fillStyle = C.stone2;
    for (let i = -8; i <= 8; i += 4) ctx.fillRect(x + i, gy - 21, 1, 19);
    ctx.fillStyle = C.paper;                       // табличка экспоната
    ctx.fillRect(x - 4, gy - 27, 8, 4);
    ctx.fillStyle = C.wood2;
    ctx.fillRect(x - 3, gy - 26, 6, 1);
    ctx.fillRect(x - 3, gy - 24, 4, 1);
  },
  // кривой дуб: не годен ни на что, цел
  crooked_tree(ctx, x, gy) {
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 2, gy - 12, 4, 12);
    ctx.fillRect(x - 4, gy - 18, 4, 7);            // изгиб влево
    ctx.fillRect(x - 6, gy - 24, 4, 7);
    ctx.fillStyle = C.wood2;                       // голые ветви
    ctx.fillRect(x - 10, gy - 26, 6, 2);
    ctx.fillRect(x - 4, gy - 28, 8, 2);
    ctx.fillRect(x + 2, gy - 24, 7, 2);
    ctx.fillRect(x + 6, gy - 28, 2, 5);
    ctx.fillRect(x - 12, gy - 30, 2, 5);
  },
  // дерево «НЕ БЕСПОКОИТЬ»: тот же дуб + дощечка на стволе
  do_not_disturb(ctx, x, gy, t) {
    STREET.crooked_tree(ctx, x, gy);
    ctx.fillStyle = C.paper;
    ctx.fillRect(x - 5, gy - 9, 10, 5);
    ctx.fillStyle = C.wood2;
    ctx.fillRect(x - 4, gy - 8, 8, 1);
    ctx.fillRect(x - 4, gy - 6, 6, 1);
  },
  // весовая будка: окно, коромысло весов на крыше
  weigh_booth(ctx, x, gy) {
    ctx.fillStyle = C.plank;
    ctx.fillRect(x - 7, gy - 16, 14, 16);
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 4, gy - 12, 8, 5);            // окошко
    ctx.fillStyle = C.gold;
    ctx.fillRect(x - 4, gy - 7, 8, 1);             // прилавок
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 1, gy - 22, 2, 6);            // стойка весов
    ctx.fillRect(x - 7, gy - 22, 14, 1);           // коромысло
    ctx.fillStyle = C.gold;
    ctx.fillRect(x - 8, gy - 21, 3, 2);            // чаши
    ctx.fillRect(x + 5, gy - 20, 3, 2);            // перевес знаков
  },
  // печь: кирпич, заслонка, труба без дыма
  stove(ctx, x, gy) {
    ctx.fillStyle = C.brick;
    ctx.fillRect(x - 7, gy - 16, 14, 16);
    ctx.fillStyle = C.crimson;
    ctx.fillRect(x - 7, gy - 16, 14, 1);
    ctx.fillRect(x - 7, gy - 11, 14, 1);
    ctx.fillRect(x - 7, gy - 6, 14, 1);
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 3, gy - 10, 6, 6);            // заслонка
    ctx.fillStyle = C.gold;
    ctx.fillRect(x + 1, gy - 8, 1, 2);             // ручка
    ctx.fillStyle = C.brick;
    ctx.fillRect(x + 3, gy - 22, 4, 6);            // труба
  },
  // убежище: бетонный вход, ступени вниз
  shelter(ctx, x, gy) {
    ctx.fillStyle = C.concrete;
    ctx.fillRect(x - 9, gy - 12, 18, 12);
    ctx.fillRect(x - 7, gy - 15, 14, 3);
    ctx.fillStyle = C.black;                       // проём вниз
    ctx.fillRect(x - 4, gy - 10, 8, 10);
    ctx.fillStyle = C.stone2;                      // ступени
    ctx.fillRect(x - 4, gy - 4, 8, 1);
    ctx.fillRect(x - 3, gy - 7, 6, 1);
    ctx.fillStyle = C.bone;                        // трафарет
    ctx.globalAlpha = 0.7;
    ctx.fillRect(x - 8, gy - 14, 4, 1);
    ctx.globalAlpha = 1;
  },
  // обгорелый сруб: венцы, обугленный верх
  burnt_izba(ctx, x, gy) {
    ctx.fillStyle = C.wood;
    for (let i = 0; i < 4; i++) ctx.fillRect(x - 9, gy - 4 - i * 4, 18, 3);
    ctx.fillStyle = C.black;                       // уголь поверху
    ctx.fillRect(x - 9, gy - 19, 18, 3);
    ctx.fillRect(x - 7, gy - 21, 5, 2);
    ctx.fillRect(x + 2, gy - 22, 6, 3);
    ctx.fillStyle = C.dark;                        // выгоревший проём
    ctx.fillRect(x - 2, gy - 12, 5, 12);
  },
  // дверь мастерской линз: линза-витрина с бликом
  lens_door(ctx, x, gy, t) {
    ctx.fillStyle = C.stone;
    ctx.fillRect(x - 8, gy - 24, 16, 24);
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 4, gy - 18, 8, 18);           // дверь
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 3, gy - 17, 6, 16);
    ctx.fillStyle = C.ash;                         // линза
    ctx.fillRect(x - 2, gy - 14, 4, 4);
    ctx.fillStyle = C.bone;                        // блик по кругу
    const ph = (t * 0.02) % 4 | 0;
    const bx = [x - 2, x + 1, x + 1, x - 2][ph];
    const by = [gy - 14, gy - 14, gy - 11, gy - 11][ph];
    ctx.fillRect(bx, by, 1, 1);
  },
  // портовое окошко нансеновских паспортов
  nansen_window(ctx, x, gy) {
    ctx.fillStyle = C.plank;
    ctx.fillRect(x - 9, gy - 18, 18, 18);
    ctx.fillStyle = C.wood;                        // доски
    for (let i = -9; i < 9; i += 3) ctx.fillRect(x + i, gy - 18, 1, 18);
    ctx.fillStyle = C.black;                       // окошко
    ctx.fillRect(x - 3, gy - 13, 7, 6);
    ctx.fillStyle = C.gold;
    ctx.fillRect(x - 3, gy - 7, 7, 1);             // полочка выдачи
    ctx.fillStyle = C.paper;
    ctx.fillRect(x - 8, gy - 16, 4, 3);            // вывеска
  },
  // музейная витрина: стекло на ножках, внутри кочерга
  museum_case(ctx, x, gy, t) {
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 6, gy - 2, 2, 2);
    ctx.fillRect(x + 4, gy - 2, 2, 2);
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 8, gy - 4, 16, 2);            // постамент
    ctx.globalAlpha = 0.35;                        // стекло
    ctx.fillStyle = C.ash;
    ctx.fillRect(x - 7, gy - 16, 14, 12);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = C.ash;
    ctx.strokeRect(x - 7.5, gy - 16.5, 15, 13);
    ctx.fillStyle = C.black;                       // кочерга
    ctx.fillRect(x - 3, gy - 13, 1, 8);
    ctx.fillRect(x - 3, gy - 13, 5, 1);
    ctx.fillStyle = C.paper;                       // «аргумент»
    ctx.fillRect(x + 1, gy - 7, 4, 2);
  },
  // столб с объявлением
  pillar_ad(ctx, x, gy) {
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 2, gy - 24, 4, 24);
    ctx.fillStyle = C.wood2;
    ctx.fillRect(x - 3, gy - 25, 6, 2);
    ctx.fillStyle = C.paper2;                      // старое объявление
    ctx.fillRect(x - 4, gy - 20, 8, 9);
    ctx.fillStyle = C.wood2;
    ctx.fillRect(x - 3, gy - 18, 6, 1);
    ctx.fillRect(x - 3, gy - 16, 6, 1);
    ctx.fillRect(x - 3, gy - 14, 4, 1);
    ctx.fillStyle = C.paper;                       // уголок отклеился
    ctx.fillRect(x + 3, gy - 12, 2, 2);
  },
  // лавка красок: витрина с 12 выкрасами — все НОЧЬ
  paint_shop(ctx, x, gy) {
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 9, gy - 22, 18, 22);
    ctx.fillStyle = C.crimson;
    ctx.fillRect(x - 9, gy - 22, 18, 3);           // вывеска-полоса
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 7, gy - 17, 14, 12);          // витрина
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 4; c++) {
        ctx.fillStyle = '#0d0b0a';                 // 12 цветов — один
        ctx.fillRect(x - 6 + c * 3.5, gy - 16 + r * 4, 2, 2);
      }
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 2, gy - 4, 4, 4);             // порожек
  },
  // ── вторая волна ──
  // игорный дом «У БОГА»: дом с вывеской-костью
  gambling_house(ctx, x, gy, t) {
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 9, gy - 24, 18, 24);
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 8, gy - 23, 16, 22);
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 2, gy - 12, 5, 12);           // дверь
    ctx.fillStyle = C.bone;                        // кость-вывеска
    ctx.fillRect(x - 4, gy - 30, 8, 7);
    ctx.fillStyle = C.black;                       // точки: всегда одна
    ctx.fillRect(x - 1, gy - 27, 1, 1);
    ctx.fillStyle = C.wood2;
    ctx.fillRect(x - 1, gy - 23, 2, 2);            // подвес
  },
  // табачная контора: латунная вывеска, научный отдел не дымит
  tobacco_office(ctx, x, gy) {
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 8, gy - 22, 16, 22);
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 6, gy - 17, 4, 5);            // окно
    ctx.fillRect(x + 2, gy - 17, 4, 5);
    ctx.fillRect(x - 2, gy - 9, 4, 9);             // дверь
    ctx.fillStyle = C.gold;                        // латунь
    ctx.fillRect(x - 6, gy - 21, 12, 2);
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 5, gy - 21, 1, 1);            // гравировка
    ctx.fillRect(x - 2, gy - 21, 1, 1);
    ctx.fillRect(x + 1, gy - 21, 1, 1);
  },
  // бюро исправления имён: будка, зачёркнутые таблички, очередь-столбики
  names_bureau(ctx, x, gy) {
    ctx.fillStyle = C.plank;
    ctx.fillRect(x - 6, gy - 15, 12, 15);
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 3, gy - 11, 6, 4);            // окошко
    ctx.fillStyle = C.paper;                       // таблички имён
    ctx.fillRect(x - 6, gy - 19, 5, 3);
    ctx.fillRect(x + 1, gy - 19, 5, 3);
    ctx.fillStyle = C.crimson;                     // зачёркнуто
    ctx.fillRect(x - 6, gy - 18, 5, 1);
    ctx.fillStyle = C.ash;                         // очередь: столбики с верёвкой
    ctx.fillRect(x - 12, gy - 6, 1, 6);
    ctx.fillRect(x - 17, gy - 6, 1, 6);
    ctx.fillRect(x - 17, gy - 6, 6, 1);
  },
  // клиника д-ра Детуша: тёмная дверь, латунная табличка, часы не указаны
  detush_clinic(ctx, x, gy) {
    ctx.fillStyle = C.concrete;
    ctx.fillRect(x - 7, gy - 22, 14, 22);
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 3, gy - 15, 6, 15);           // дверь
    ctx.fillStyle = C.gold;
    ctx.fillRect(x - 6, gy - 19, 5, 3);            // табличка
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 5, gy - 18, 3, 1);
    ctx.fillStyle = C.ash;                         // молоточек
    ctx.fillRect(x + 1, gy - 10, 1, 2);
  },
  // сбитый указатель «ВЫХОД ИЗ ПОЛОЖЕНИЯ»: лежит остриём в землю
  fallen_sign(ctx, x, gy) {
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 8, gy - 3, 3, 3);             // пень столба
    ctx.fillStyle = C.wood2;                       // сбитый щит, наклонён
    ctx.fillRect(x - 3, gy - 6, 10, 4);
    ctx.fillStyle = C.paper2;
    ctx.fillRect(x - 2, gy - 5, 8, 2);
    ctx.fillStyle = C.dark;                        // остриё в земле
    ctx.fillRect(x + 6, gy - 3, 2, 3);
  },
  // «УКРЫТИЕ»: стрелка вниз, краска свежее стены
  shelter_arrow(ctx, x, gy) {
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 7, gy - 18, 14, 18);          // стена
    ctx.fillStyle = C.concrete;                    // свежее пятно
    ctx.fillRect(x - 4, gy - 15, 8, 11);
    ctx.fillStyle = C.bone;                        // стрелка вниз
    ctx.fillRect(x - 1, gy - 13, 2, 5);
    ctx.fillRect(x - 3, gy - 9, 6, 1);
    ctx.fillRect(x - 2, gy - 8, 4, 1);
    ctx.fillRect(x - 1, gy - 7, 2, 1);
  },
  // рунный камень: валун со штрихами рун
  rune_stone(ctx, x, gy) {
    ctx.fillStyle = C.stone;
    ctx.fillRect(x - 5, gy - 14, 10, 14);
    ctx.fillRect(x - 3, gy - 16, 6, 2);
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 5, gy - 4, 10, 4);
    ctx.fillStyle = C.ash;                         // руны: вертикали и косые
    ctx.fillRect(x - 3, gy - 13, 1, 6);
    ctx.fillRect(x - 1, gy - 12, 1, 5);
    ctx.fillRect(x + 1, gy - 13, 1, 6);
    ctx.fillRect(x + 3, gy - 11, 1, 4);
    ctx.fillRect(x - 2, gy - 10, 2, 1);
  },
  // столпный столб: колонна с пустой площадкой
  pillar_saint(ctx, x, gy) {
    ctx.fillStyle = C.stone;
    ctx.fillRect(x - 2, gy - 24, 4, 24);
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 3, gy - 12, 6, 1);            // пояс кладки
    ctx.fillStyle = C.stone;
    ctx.fillRect(x - 5, gy - 26, 10, 2);           // площадка
    ctx.fillStyle = C.ash;                         // перильце
    ctx.fillRect(x - 5, gy - 29, 1, 3);
    ctx.fillRect(x + 4, gy - 29, 1, 3);
    // наверху пусто — в этом и дело
  },
  // мастерская кинцуги: витрина, чаша с золотым швом
  kintsugi(ctx, x, gy) {
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 8, gy - 18, 16, 18);
    ctx.fillStyle = C.black;                       // витрина
    ctx.fillRect(x - 5, gy - 14, 10, 8);
    ctx.fillStyle = C.stone2;                      // чаша
    ctx.fillRect(x - 3, gy - 10, 6, 3);
    ctx.fillRect(x - 2, gy - 7, 4, 1);
    ctx.fillStyle = C.gold2;                       // золотой шов — единственный
    ctx.fillRect(x - 1, gy - 10, 1, 3);
    ctx.fillRect(x, gy - 8, 1, 1);
  },
  // котельная «КАМЧАТКА»: кирпич, труба, красное окошко
  kamchatka(ctx, x, gy, t) {
    ctx.fillStyle = C.brick;
    ctx.fillRect(x - 9, gy - 16, 18, 16);
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 2, gy - 10, 5, 10);           // дверь
    const warm = Math.sin(t * 0.03) > 0;
    ctx.fillStyle = warm ? C.crimson : '#4a0d14';  // окно кочегарки
    ctx.fillRect(x - 7, gy - 12, 3, 3);
    ctx.fillStyle = C.brick;
    ctx.fillRect(x + 4, gy - 24, 4, 8);            // труба
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x + 4, gy - 25, 4, 1);
  },
  // прачечная № 4: витрина с барабаном
  laundry(ctx, x, gy, t) {
    ctx.fillStyle = C.concrete;
    ctx.fillRect(x - 8, gy - 18, 16, 18);
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 6, gy - 14, 12, 9);           // витрина
    ctx.fillStyle = C.ash;                         // барабан
    ctx.fillRect(x - 3, gy - 12, 6, 5);
    ctx.fillStyle = C.black;
    const ph = (t * 0.05 | 0) % 4;                 // бельё крутится
    const dx = [0, 1, 0, -1][ph], dy = [-1, 0, 1, 0][ph];
    ctx.fillRect(x + dx, gy - 10 + dy, 2, 2);
  },
  // бюро «УТОПИЯ»: офисная дверь, буквы вывески осыпались
  utopia_bureau(ctx, x, gy) {
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 8, gy - 20, 16, 20);
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 3, gy - 13, 6, 13);           // стеклянная дверь
    ctx.fillStyle = C.ash;
    ctx.fillRect(x - 2, gy - 12, 1, 11);           // блик стекла
    ctx.fillStyle = C.bone;                        // вывеска: у_о_ия
    ctx.fillRect(x - 6, gy - 18, 2, 2);
    ctx.fillRect(x - 1, gy - 18, 2, 2);
    ctx.fillRect(x + 4, gy - 18, 2, 2);
    ctx.fillStyle = C.black;                       // тени упавших букв
    ctx.fillRect(x - 3, gy - 2, 2, 2);
    ctx.fillRect(x + 2, gy - 2, 2, 2);
  },
  // знак «ЧЕРЕПАХА ВПЕРЕДИ»: дорожный ромб с силуэтом
  turtle_sign(ctx, x, gy) {
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 1, gy - 14, 2, 14);
    ctx.fillStyle = C.gold;                        // ромб
    ctx.fillRect(x - 5, gy - 21, 10, 8);
    ctx.fillStyle = C.dark;                        // черепаха: панцирь и голова
    ctx.fillRect(x - 3, gy - 18, 5, 2);
    ctx.fillRect(x + 2, gy - 17, 1, 1);
    ctx.fillRect(x - 2, gy - 16, 1, 1);
    ctx.fillRect(x + 1, gy - 16, 1, 1);
  },
  // милевой камень: столбик с числом
  mile_stone(ctx, x, gy) {
    ctx.fillStyle = C.stone;
    ctx.fillRect(x - 3, gy - 10, 6, 10);
    ctx.fillRect(x - 2, gy - 12, 4, 2);
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 3, gy - 3, 6, 3);
    ctx.fillStyle = C.dark;                        // число
    ctx.fillRect(x - 1, gy - 9, 1, 3);
    ctx.fillRect(x + 1, gy - 9, 1, 3);
  },
  // посудная лавка «НЕ ПРИЛИПАЕТ»: витрина со сковородой
  pan_shop(ctx, x, gy, t) {
    ctx.fillStyle = C.concrete;
    ctx.fillRect(x - 8, gy - 18, 16, 18);
    ctx.fillStyle = C.crimson;                     // неоновая полоса вывески
    ctx.fillRect(x - 8, gy - 18, 16, 2);
    ctx.fillStyle = C.black;                       // витрина
    ctx.fillRect(x - 6, gy - 14, 12, 9);
    ctx.fillStyle = C.dark;                        // сковорода
    ctx.fillRect(x - 4, gy - 10, 6, 3);
    ctx.fillRect(x + 2, gy - 9, 4, 1);             // ручка
    ctx.fillStyle = C.ash;                         // блик покрытия: чистое
    ctx.fillRect(x - 3, gy - 9, 3, 1);
  },
  // провал в мерзлоте: яма, переносимое ограждение
  sinkhole(ctx, x, gy) {
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 10, gy - 4, 20, 4);
    ctx.fillRect(x - 8, gy - 6, 16, 2);
    ctx.fillStyle = C.stone2;                      // обнажённые слои
    ctx.fillRect(x - 10, gy - 5, 2, 1);
    ctx.fillRect(x + 8, gy - 5, 2, 1);
    ctx.fillStyle = C.wood2;                       // ограждение, уже близко к краю
    ctx.fillRect(x - 14, gy - 8, 1, 8);
    ctx.fillRect(x - 14, gy - 7, 6, 1);
    ctx.fillStyle = C.paper;
    ctx.fillRect(x - 13, gy - 11, 4, 3);           // табличка на колу
  },
  // смотровая площадка озера-карьера: помост, перила, монетоприёмник
  overlook(ctx, x, gy) {
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 8, gy - 8, 16, 2);            // помост
    ctx.fillRect(x - 7, gy - 6, 2, 6);
    ctx.fillRect(x + 5, gy - 6, 2, 6);
    ctx.fillStyle = C.ash;                         // перила
    ctx.fillRect(x - 8, gy - 14, 1, 6);
    ctx.fillRect(x + 7, gy - 14, 1, 6);
    ctx.fillRect(x - 8, gy - 14, 16, 1);
    ctx.fillStyle = C.dark;                        // монетоприёмник-бинокль
    ctx.fillRect(x + 2, gy - 13, 3, 5);
    ctx.fillStyle = C.gold;
    ctx.fillRect(x + 3, gy - 12, 1, 1);            // щель для монеты
  },
  // судно в песке: корпус, крен, до воды далеко
  ship_sand(ctx, x, gy) {
    ctx.fillStyle = C.stone2;                      // песчаный нанос
    ctx.fillRect(x - 12, gy - 3, 24, 3);
    ctx.fillStyle = C.dark;                        // корпус с креном
    ctx.fillRect(x - 9, gy - 10, 18, 7);
    ctx.fillRect(x - 7, gy - 12, 14, 2);
    ctx.fillStyle = C.crimson;                     // ватерлиния — выше песка
    ctx.fillRect(x - 9, gy - 6, 18, 1);
    ctx.fillStyle = C.wood2;                       // рубка
    ctx.fillRect(x - 1, gy - 16, 6, 4);
    ctx.fillStyle = C.black;
    ctx.fillRect(x + 1, gy - 15, 2, 2);            // окно рубки
    ctx.fillStyle = C.ash;                         // мачта
    ctx.fillRect(x - 4, gy - 19, 1, 7);
  },
  // молочная кухня: витрина с бутылочками, первый образец бесплатно
  milk_kitchen(ctx, x, gy) {
    ctx.fillStyle = C.concrete;
    ctx.fillRect(x - 8, gy - 17, 16, 17);
    ctx.fillStyle = C.bone;                        // белая вывеска
    ctx.fillRect(x - 8, gy - 17, 16, 2);
    ctx.fillStyle = C.black;                       // витрина
    ctx.fillRect(x - 6, gy - 13, 12, 8);
    ctx.fillStyle = C.bone;                        // бутылочки в ряд
    ctx.fillRect(x - 4, gy - 10, 2, 4);
    ctx.fillRect(x - 1, gy - 10, 2, 4);
    ctx.fillRect(x + 2, gy - 10, 2, 4);
    ctx.fillStyle = C.gold;                        // ярлычок «бесплатно» на первой
    ctx.fillRect(x - 4, gy - 11, 2, 1);
  },
  // аптечный киоск: крест, окошко отпуска
  pharmacy(ctx, x, gy, t) {
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 7, gy - 16, 14, 16);
    const on = Math.sin(t * 0.04) > -0.6;          // крест мигает устало
    ctx.fillStyle = on ? C.ash : C.stone;
    ctx.fillRect(x - 1, gy - 22, 2, 6);
    ctx.fillRect(x - 3, gy - 20, 6, 2);
    ctx.fillStyle = C.black;                       // окошко
    ctx.fillRect(x - 4, gy - 12, 8, 5);
    ctx.fillStyle = C.gold;
    ctx.fillRect(x - 4, gy - 7, 8, 1);             // прилавок
    ctx.fillStyle = C.paper;                       // листок побочных действий
    ctx.fillRect(x + 4, gy - 5, 3, 4);
  },
  // веха кольцевой: столб с кольцом
  ring_post(ctx, x, gy) {
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 1, gy - 22, 3, 22);
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, gy - 27, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.paper;
    ctx.fillRect(x + 3, gy - 16, 4, 5);
  },
  // колокол без языка
  bell_mute(ctx, x, gy) {
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 1, gy - 24, 3, 24);
    ctx.fillRect(x - 7, gy - 25, 15, 2);
    // качается на перекладине — от ветра, от прохожего; звона нет: языка нет
    const b = hang(`bellmute:${x}:${gy}`, x + 0.5, gy - 23, 4, { sail: 0.02, damp: 0.997, gy, r: 5 });
    const s = Math.sin(angleOf(b));
    ctx.fillStyle = C.dark;
    for (let k = 0; k < 6; k++) ctx.fillRect(x - 4 + Math.round(s * (k + 1)), gy - 23 + k, 9, 1);
    ctx.fillRect(x - 5 + Math.round(s * 7), gy - 18, 11, 2);
    // языка нет — пусто под юбкой
    ctx.fillStyle = C.paper;                       // расписание звона
    ctx.fillRect(x + 5, gy - 12, 4, 5);
  },
  // СКРОЛЛ: эскалатор вниз, лента движется сама
  scroll_down(ctx, x, gy, t) {
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 10, gy - 6, 20, 6);           // дыра
    ctx.fillStyle = C.stone2;
    const ph = (t * 0.08 | 0) % 4;
    for (let i = 0; i < 4; i++) {                   // ступени уползают вниз
      const off = (i + ph * 0.25) * 3;
      ctx.fillRect(x - 8 + off, gy - 5 + off * 0.6, 8 - i, 2);
    }
    ctx.fillStyle = C.ash;                         // поручень
    ctx.fillRect(x - 12, gy - 14, 2, 10);
    ctx.fillRect(x - 12, gy - 15, 12, 2);
    ctx.fillStyle = '#7adfff';                     // экранная подсветка из дыры
    ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 0.1);
    ctx.fillRect(x - 8, gy - 3, 16, 2);
    ctx.globalAlpha = 1;
  },
  // колышек геодезиста со шнуром: трассировка каркаса
  survey_peg(ctx, x, gy) {
    ctx.fillStyle = C.wood2;
    ctx.fillRect(x - 1, gy - 8, 2, 8);
    ctx.fillStyle = C.crimson;
    ctx.fillRect(x - 2, gy - 10, 4, 3);
    ctx.fillStyle = C.paper;
    ctx.fillRect(x + 2, gy - 6, 4, 3);
  },
  // каменный лабиринт: спираль валунов, ход внутрь
  labyrinth(ctx, x, gy) {
    ctx.fillStyle = C.stone2;
    const pts = [[-12,0],[-8,-6],[0,-9],[8,-6],[12,0],[8,5],[0,7],[-7,4],[-4,-2],[2,-4],[6,0],[2,3]];
    for (const [dx, dy] of pts) ctx.fillRect(x + dx, gy + dy - 6, 3, 3);
    ctx.fillStyle = C.bone;                        // след внутрь
    ctx.fillRect(x - 10, gy - 2, 1, 1); ctx.fillRect(x - 5, gy - 4, 1, 1);
    ctx.fillRect(x, gy - 6, 1, 1);
  },
  // согнутые мечи остриями вниз
  bent_swords(ctx, x, gy) {
    ctx.fillStyle = C.ash;
    for (const dx of [-8, 0, 8]) {
      ctx.fillRect(x + dx, gy - 16, 2, 9);         // клинок
      ctx.fillRect(x + dx + 1, gy - 7, 2, 7);      // сгиб — вниз
      ctx.fillStyle = C.stone2;
      ctx.fillRect(x + dx - 2, gy - 17, 6, 2);     // гарда
      ctx.fillStyle = C.ash;
    }
    ctx.fillStyle = '#26323a';                     // вода не замерзает над остриями
    ctx.fillRect(x - 11, gy - 1, 26, 3);
  },
  // скамейка Г8: пять планок, резьба
  bench(ctx, x, gy) {
    ctx.fillStyle = C.wood;
    for (let i = 0; i < 5; i++) ctx.fillRect(x - 10, gy - 12 + i * 2, 22, 1);
    ctx.fillRect(x - 9, gy - 4, 2, 4); ctx.fillRect(x + 9, gy - 4, 2, 4);
    ctx.fillStyle = C.bone;                        // резаное имя на средней планке
    ctx.fillRect(x - 3, gy - 8, 7, 1);
  },
  // зеркало лицом к стене
  mirror_wall(ctx, x, gy) {
    ctx.fillStyle = C.stone;
    ctx.fillRect(x - 9, gy - 20, 18, 20);          // стена
    ctx.fillStyle = C.wood2;                       // рама зеркала — тыльной стороной
    ctx.fillRect(x - 5, gy - 16, 11, 15);
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 4, gy - 15, 9, 13);
    ctx.fillStyle = C.paper;                       // бирка «временно»
    ctx.fillRect(x + 3, gy - 9, 4, 3);
  },
  // часы без стрелок
  clock_bare(ctx, x, gy) {
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 2, gy - 18, 4, 18);
    ctx.fillStyle = C.paper;
    ctx.beginPath(); ctx.arc(x, gy - 22, 7, 0, 7); ctx.fill();
    ctx.fillStyle = C.dark;
    ctx.beginPath(); ctx.arc(x, gy - 22, 5, 0, 7); ctx.fill();
    ctx.fillStyle = C.gold;                        // деления есть — стрелок нет
    ctx.fillRect(x, gy - 27, 1, 1); ctx.fillRect(x + 4, gy - 23, 1, 1);
    ctx.fillRect(x, gy - 19, 1, 1); ctx.fillRect(x - 4, gy - 23, 1, 1);
  },
  // велосипед у стены
  bicycle(ctx, x, gy, t) {
    ctx.strokeStyle = C.ash; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x - 6, gy - 4, 4, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 6, gy - 4, 4, 0, 7); ctx.stroke();
    ctx.fillStyle = C.ash;
    ctx.fillRect(x - 6, gy - 9, 12, 1);            // рама
    ctx.fillRect(x - 1, gy - 12, 1, 4);
    ctx.fillRect(x - 3, gy - 12, 5, 1);            // руль
    ctx.fillStyle = C.paper;
    ctx.fillRect(x + 8, gy - 10, 4, 3);            // бирка «оставлен»
  },
  // два бака с блюдцами
  two_bins(ctx, x, gy) {
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 11, gy - 12, 10, 12);
    ctx.fillRect(x + 1, gy - 12, 10, 12);
    ctx.fillStyle = C.stone2;                      // крышки
    ctx.fillRect(x - 12, gy - 14, 12, 2);
    ctx.fillRect(x, gy - 14, 12, 2);
    ctx.fillStyle = C.bone;                        // блюдца
    ctx.fillRect(x - 9, gy - 16, 6, 2);
    ctx.fillRect(x + 3, gy - 16, 6, 2);
  },
  // бритвенная «ОККАМ»: шест-спираль у двери
  barber(ctx, x, gy, t) {
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 8, gy - 20, 16, 20);
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 2, gy - 12, 5, 12);           // дверь
    ctx.fillStyle = C.bone;                        // шест
    ctx.fillRect(x - 7, gy - 18, 3, 12);
    ctx.fillStyle = C.crimson;                     // спираль ползёт
    const ph = (t * 0.05 | 0) % 4;
    for (let i = 0; i < 3; i++) ctx.fillRect(x - 7, gy - 17 + ((i * 4 + ph) % 12), 3, 1);
  },
  // указ о кофе: кофейник за решёткой
  coffee_decree(ctx, x, gy) {
    ctx.fillStyle = C.wood2;
    ctx.fillRect(x - 8, gy - 16, 16, 16);          // ниша указа
    ctx.fillStyle = C.dark;                        // кофейник
    ctx.fillRect(x - 3, gy - 11, 7, 7);
    ctx.fillRect(x + 4, gy - 10, 3, 2);            // носик
    ctx.fillRect(x - 2, gy - 13, 5, 2);            // крышка
    ctx.fillStyle = C.stone2;                      // решётка
    for (let i = -7; i <= 7; i += 4) ctx.fillRect(x + i, gy - 15, 1, 14);
    ctx.fillStyle = C.gold;                        // замок
    ctx.fillRect(x - 2, gy - 4, 4, 3);
  },
  // нора у контрфорса: тьма и угол белой перчатки
  rabbit_hole(ctx, x, gy) {
    ctx.fillStyle = C.stone;
    ctx.fillRect(x - 10, gy - 18, 8, 18);          // контрфорс
    ctx.fillRect(x - 13, gy - 10, 3, 10);
    ctx.fillStyle = C.black;                       // нора
    ctx.beginPath(); ctx.arc(x + 4, gy - 2, 6, Math.PI, 0); ctx.fill();
    ctx.fillStyle = C.bone;                        // угол перчатки
    ctx.fillRect(x + 2, gy - 4, 3, 2);
    ctx.fillRect(x + 4, gy - 5, 2, 1);
    ctx.fillStyle = C.stone2;                      // подметено: дуги метлы
    ctx.fillRect(x - 2, gy + 1, 12, 1);
  },
  // болотный клад: чаша подо льдом, имя начищено
  bog_bowl(ctx, x, gy, t) {
    ctx.fillStyle = '#26323a';                     // полынья-лёд
    ctx.fillRect(x - 10, gy - 6, 20, 6);
    ctx.fillStyle = 'rgba(174,198,212,0.5)';       // кромка льда
    ctx.fillRect(x - 12, gy - 7, 4, 2); ctx.fillRect(x + 8, gy - 7, 4, 2);
    ctx.fillStyle = C.gold;                        // чаша на дне
    ctx.fillRect(x - 4, gy - 4, 8, 3);
    ctx.fillRect(x - 2, gy - 5, 4, 1);
    const gl = Math.sin(t * 0.03) > 0.4;           // имя блеснуло
    if (gl) { ctx.fillStyle = C.bone; ctx.fillRect(x - 1, gy - 3, 3, 1); }
  },
  // голос Экклезиаста: пустой постамент, слово в воздухе
  voice_stand(ctx, x, gy, t) {
    ctx.fillStyle = C.stone;
    ctx.fillRect(x - 6, gy - 6, 12, 6);            // постамент
    ctx.fillRect(x - 4, gy - 8, 8, 2);
    // никого сверху; волны воздуха
    ctx.fillStyle = 'rgba(232,220,200,0.25)';
    const ph = (t * 0.04) % 6;
    for (let i = 0; i < 3; i++) {
      const r = 4 + i * 4 + ph;
      ctx.fillRect(x - r, gy - 14, 2, 1);
      ctx.fillRect(x + r - 1, gy - 14, 2, 1);
    }
  },
  // ночлежка: дом, фонарь над дверью
  night_house(ctx, x, gy, t) {
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 9, gy - 26, 18, 26);
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 8, gy - 25, 16, 24);
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 2, gy - 13, 5, 13);           // дверь
    ctx.fillStyle = C.gold2;                       // фонарь приёма
    const on = Math.sin(t * 0.02) > -0.7;
    ctx.fillStyle = on ? C.gold2 : C.wood2;
    ctx.fillRect(x, gy - 16, 2, 2);
    ctx.fillStyle = C.black;                       // окна спят
    ctx.fillRect(x - 6, gy - 21, 3, 3);
    ctx.fillRect(x + 4, gy - 21, 3, 3);
  },

  // ── слой прикрытия: вещи, которые прячут убыль или хотят казаться иным.
  // Нарисованное тепло — сепией, не СВЕЧОЙ: палитра не подделывается.
  // мастерская видов: лавка, в витрине мольберт с «видом» в оконной раме
  view_workshop(ctx, x, gy) {
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 10, gy - 24, 20, 24);
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 9, gy - 23, 18, 22);
    ctx.fillStyle = C.paper2;                      // вывеска
    ctx.fillRect(x - 8, gy - 27, 16, 3);
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 7, gy - 19, 9, 11);           // витрина
    ctx.fillStyle = C.ash;                         // «вид»: небо словом, облако одно
    ctx.fillRect(x - 6, gy - 18, 7, 8);
    ctx.fillStyle = C.bone;
    ctx.fillRect(x - 4, gy - 17, 3, 1);            // облако
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 6, gy - 12, 7, 2);            // даль
    ctx.fillStyle = C.wood2;                       // переплёт оконной рамы
    ctx.fillRect(x - 3, gy - 18, 1, 8);
    ctx.fillRect(x - 6, gy - 14, 7, 1);
    ctx.fillStyle = C.wood2;                       // ножки мольберта
    ctx.fillRect(x - 5, gy - 8, 1, 3);
    ctx.fillRect(x - 1, gy - 8, 1, 3);
    ctx.fillStyle = C.black;
    ctx.fillRect(x + 4, gy - 13, 4, 13);           // дверь
  },
  // щит для снимка «на краю»: фанера на ножках, две прорези для лиц,
  // огонь писан сепией
  edge_board(ctx, x, gy) {
    ctx.fillStyle = C.wood2;
    ctx.fillRect(x - 8, gy - 6, 1, 6);             // ножки
    ctx.fillRect(x + 7, gy - 6, 1, 6);
    ctx.fillStyle = C.paper2;
    ctx.fillRect(x - 10, gy - 26, 20, 20);         // щит
    ctx.fillStyle = C.dark;                        // обрыв
    ctx.fillRect(x - 10, gy - 12, 12, 6);
    ctx.fillStyle = '#3a3026';                     // огонь — сепия
    ctx.fillRect(x + 2, gy - 12, 8, 6);
    ctx.fillRect(x + 4, gy - 15, 2, 3);
    ctx.fillRect(x + 7, gy - 14, 2, 2);
    ctx.fillStyle = C.bone;                        // звёзды
    ctx.fillRect(x - 7, gy - 24, 1, 1); ctx.fillRect(x + 6, gy - 23, 1, 1);
    ctx.fillStyle = C.black;                       // прорези: для лица и пониже
    ctx.fillRect(x - 5, gy - 21, 3, 4);
    ctx.fillRect(x + 2, gy - 19, 3, 4);
    ctx.fillStyle = '#E28A3A';                     // в пустую прорезь светит огонь из-за щита
    ctx.fillRect(x - 4, gy - 18, 1, 1);
    ctx.fillStyle = '#8a8d8f';
    ctx.fillRect(x - 13, gy - 1, 1, 1);            // столбик очереди
    ctx.fillRect(x - 13, gy - 4, 1, 3);
  },
  // стена капеллы: штукатурка слоями, в трещине — кладка, нарисованная
  plaster_wall(ctx, x, gy) {
    const layers = [C.paper, C.paper2, C.bone, C.paper2, C.ash];
    for (let i = 0; i < layers.length; i++) {       // слои видны по срезу
      ctx.fillStyle = layers[i];
      ctx.fillRect(x - 9 + i, gy - 24 + i, 18 - i, 24 - i);
    }
    ctx.fillStyle = C.black;                       // трещина
    ctx.fillRect(x, gy - 20, 1, 5); ctx.fillRect(x + 1, gy - 15, 1, 4);
    ctx.fillRect(x, gy - 11, 1, 3);
    ctx.fillStyle = C.brick;                       // «кирпич» под штукатуркой — писан
    ctx.fillRect(x - 3, gy - 14, 3, 2);
    ctx.fillRect(x + 2, gy - 12, 3, 2);
    ctx.fillStyle = C.bone;                        // расшитые белилами швы
    ctx.fillRect(x - 3, gy - 12, 3, 1);
    ctx.fillRect(x + 2, gy - 10, 3, 1);
  },
  // «ПРОДУКТЫ»: витрина с пирамидой банок, на двери — «ПЕРЕУЧЁТ»
  can_pyramid(ctx, x, gy) {
    ctx.fillStyle = C.concrete;
    ctx.fillRect(x - 11, gy - 22, 22, 22);
    ctx.fillStyle = C.paper2;                      // вывеска
    ctx.fillRect(x - 10, gy - 21, 20, 3);
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 9, gy - 16, 12, 12);          // витрина
    ctx.fillStyle = C.ash;                         // пирамида: ярусы банок
    for (let r = 0; r < 4; r++)
      for (let c = 0; c <= 3 - r; c++)
        ctx.fillRect(x - 8 + r + c * 2.6, gy - 6 - r * 2.5, 2, 2);
    ctx.fillStyle = C.dark;
    ctx.fillRect(x + 5, gy - 14, 5, 14);           // дверь
    ctx.fillStyle = C.paper;
    ctx.fillRect(x + 5, gy - 11, 5, 2);            // табличка «ПЕРЕУЧЁТ»
  },
  // стена от дома: фотообои «берёзовая роща», под ними горячая батарея,
  // на батарее кот — спиной к роще
  birch_wall(ctx, x, gy) {
    ctx.fillStyle = C.concrete;
    ctx.fillRect(x - 11, gy - 28, 22, 28);
    ctx.fillStyle = C.paper2;                      // обои
    ctx.fillRect(x - 10, gy - 27, 20, 19);
    ctx.fillStyle = C.bone;                        // стволы
    for (const bx of [-8, -4, 1, 6]) ctx.fillRect(x + bx, gy - 27, 2, 19);
    ctx.fillStyle = C.black;                       // чечевички и стык листа
    ctx.fillRect(x - 8, gy - 22, 1, 1); ctx.fillRect(x - 3, gy - 17, 1, 1);
    ctx.fillRect(x + 2, gy - 24, 1, 1); ctx.fillRect(x + 7, gy - 13, 1, 1);
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 1, gy - 27, 1, 19);           // стык: стволы не сошлись
    ctx.fillStyle = '#8a8d8f';                     // батарея
    ctx.fillRect(x - 7, gy - 7, 14, 4);
    ctx.fillStyle = C.stone2;
    for (let i = 0; i < 6; i++) ctx.fillRect(x - 6 + i * 2.4, gy - 7, 1, 4);
    ctx.fillStyle = '#050404';                     // кот на батарее
    ctx.fillRect(x - 1, gy - 10, 5, 3);
    ctx.fillRect(x + 3, gy - 11, 2, 1);
  },
  // очаг на холсте: огонь в три языка сепией, котелок; в холсте — дыра
  painted_hearth(ctx, x, gy) {
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 10, gy - 22, 20, 22);         // стена каморки
    ctx.fillStyle = C.wood2;
    ctx.fillRect(x - 8, gy - 19, 16, 16);          // подрамник
    ctx.fillStyle = C.paper2;
    ctx.fillRect(x - 7, gy - 18, 14, 14);          // холст
    ctx.fillStyle = C.stone;
    ctx.fillRect(x - 6, gy - 7, 12, 3);            // очаг
    ctx.fillStyle = '#3a3026';                     // три языка — сепия
    ctx.fillRect(x - 4, gy - 10, 2, 3); ctx.fillRect(x - 1, gy - 11, 2, 4);
    ctx.fillRect(x + 2, gy - 10, 2, 3);
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 3, gy - 15, 6, 4);            // котелок
    ctx.fillStyle = C.ash;
    ctx.fillRect(x, gy - 18, 1, 3);                // пар столбиком
    ctx.fillStyle = C.black;
    ctx.fillRect(x, gy - 13, 1, 1);                // дыра размером с нос
  },
  // конь канцлера: у коновязи — пятнистый олень с рогами, на столбе
  // бирка «КОНЬ» с печатью киноварью
  deer_horse(ctx, x, gy) {
    ctx.fillStyle = C.wood2;
    ctx.fillRect(x - 11, gy - 14, 2, 14);          // коновязь
    ctx.fillRect(x - 11, gy - 12, 8, 1);
    ctx.fillStyle = C.paper;                       // бирка
    ctx.fillRect(x - 14, gy - 19, 7, 4);
    ctx.fillStyle = '#c23b2b';
    ctx.fillRect(x - 9, gy - 17, 1, 1);            // печать
    ctx.fillStyle = C.paper2;                      // олень: корпус, ноги, шея
    ctx.fillRect(x - 3, gy - 12, 11, 5);
    ctx.fillRect(x - 2, gy - 7, 1, 7); ctx.fillRect(x + 1, gy - 7, 1, 7);
    ctx.fillRect(x + 5, gy - 7, 1, 7); ctx.fillRect(x + 7, gy - 7, 1, 7);
    ctx.fillRect(x - 5, gy - 16, 3, 5);
    ctx.fillRect(x - 7, gy - 16, 3, 2);            // морда
    ctx.fillStyle = C.bone;                        // пятна
    ctx.fillRect(x, gy - 11, 1, 1); ctx.fillRect(x + 3, gy - 10, 1, 1);
    ctx.fillRect(x + 6, gy - 11, 1, 1);
    ctx.fillStyle = C.bone;                        // рога — их видно первыми
    ctx.fillRect(x - 5, gy - 20, 1, 4); ctx.fillRect(x - 3, gy - 21, 1, 5);
    ctx.fillRect(x - 6, gy - 21, 1, 1); ctx.fillRect(x - 2, gy - 22, 1, 1);
    ctx.fillRect(x - 4, gy - 19, 1, 1);
  },
  // мёд: одна посудина на лотке; от кольца к кольцу меньше
  honey_pot(ctx, x, gy) {
    ctx.fillStyle = C.wood2; ctx.fillRect(x - 8, gy - 6, 16, 2);
    ctx.fillRect(x - 7, gy - 4, 1, 4); ctx.fillRect(x + 6, gy - 4, 1, 4);
    ctx.fillStyle = C.brick; ctx.fillRect(x - 4, gy - 15, 8, 9);   // горшок
    ctx.fillRect(x - 3, gy - 16, 6, 1);
    ctx.fillStyle = C.gold; ctx.fillRect(x - 3, gy - 16, 6, 1);    // мёд до края
    ctx.fillRect(x + 3, gy - 14, 1, 3);                            // потёк
    ctx.fillStyle = C.paper2; ctx.fillRect(x - 4, gy - 18, 8, 2);  // крышка
  },
  honey_jar(ctx, x, gy) {
    ctx.fillStyle = C.wood2; ctx.fillRect(x - 8, gy - 6, 16, 2);
    ctx.fillRect(x - 7, gy - 4, 1, 4); ctx.fillRect(x + 6, gy - 4, 1, 4);
    ctx.fillStyle = C.ash; ctx.fillRect(x - 2, gy - 12, 5, 6);     // склянка
    ctx.fillStyle = C.gold; ctx.fillRect(x - 1, gy - 10, 3, 4);
    ctx.fillStyle = C.paper; ctx.fillRect(x - 2, gy - 10, 5, 2);   // ярлык
  },
  honey_portion(ctx, x, gy) {
    ctx.fillStyle = C.wood2; ctx.fillRect(x - 8, gy - 6, 16, 2);
    ctx.fillRect(x - 7, gy - 4, 1, 4); ctx.fillRect(x + 6, gy - 4, 1, 4);
    ctx.fillStyle = C.bone; ctx.fillRect(x - 1, gy - 8, 3, 2);     // запайка
    ctx.fillStyle = C.gold2; ctx.fillRect(x, gy - 8, 1, 1);
    ctx.fillStyle = C.paper; ctx.fillRect(x - 6, gy - 13, 12, 4);  // крупная надпись
    ctx.fillStyle = C.dark;
    for (let i = 0; i < 5; i++) ctx.fillRect(x - 5 + i * 2.2, gy - 12, 1, 2);
  },
  // остановка в долине: навес, скамья, трое ожидающих — куклы
  bus_stop_dolls(ctx, x, gy) {
    ctx.fillStyle = C.concrete;
    ctx.fillRect(x - 12, gy - 22, 24, 2);          // навес
    ctx.fillRect(x - 12, gy - 20, 1, 20); ctx.fillRect(x + 11, gy - 20, 1, 20);
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 10, gy - 7, 20, 2);           // скамья
    const dolls = [[-8, C.wood2, C.dark], [-2, C.stone, C.paper2], [4, C.crimson, C.dark]];
    for (const [dx, coat, hat] of dolls) {
      ctx.fillStyle = coat; ctx.fillRect(x + dx, gy - 13, 4, 6);
      ctx.fillStyle = C.paper2; ctx.fillRect(x + dx + 1, gy - 16, 3, 3);   // лицо-мешковина
      ctx.fillStyle = C.black; ctx.fillRect(x + dx + 1, gy - 15, 1, 1);    // глаза-пуговицы
      ctx.fillRect(x + dx + 3, gy - 15, 1, 1);
      ctx.fillStyle = hat; ctx.fillRect(x + dx, gy - 17, 5, 1);
    }
    ctx.fillStyle = C.wood2;                       // корзина у третьей
    ctx.fillRect(x + 8, gy - 9, 3, 2);
  },
  // овощной: витрина, между луком и морковью — красная полоса лозунга
  veg_window(ctx, x, gy) {
    ctx.fillStyle = C.concrete;
    ctx.fillRect(x - 11, gy - 22, 22, 22);
    ctx.fillStyle = C.paper2;
    ctx.fillRect(x - 10, gy - 21, 20, 3);          // «ОВОЩИ — ФРУКТЫ»
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 9, gy - 16, 13, 12);          // витрина
    ctx.fillStyle = '#b8807a';                     // лозунг выгорел до розового
    ctx.fillRect(x - 8, gy - 14, 11, 2);
    ctx.fillStyle = '#c23b2b';                     // …кроме полосы за ящиком
    ctx.fillRect(x - 8, gy - 12, 11, 1);
    ctx.fillStyle = C.wood2;                       // ящики
    ctx.fillRect(x - 8, gy - 8, 5, 3); ctx.fillRect(x - 2, gy - 8, 5, 3);
    ctx.fillStyle = C.paper;                       // лук
    ctx.fillRect(x - 7, gy - 9, 1, 1); ctx.fillRect(x - 5, gy - 9, 1, 1);
    ctx.fillStyle = C.dark;
    ctx.fillRect(x + 5, gy - 14, 5, 14);           // дверь
  },
  // избирательный участок: портьера, урна, флажок
  polling_booth(ctx, x, gy) {
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 10, gy - 24, 20, 24);
    ctx.fillStyle = C.crimson;                     // портьера бархатная
    ctx.fillRect(x - 9, gy - 23, 8, 23);
    ctx.fillStyle = C.brick;
    for (let i = 0; i < 4; i++) ctx.fillRect(x - 8 + i * 2, gy - 23, 1, 23);
    ctx.fillStyle = C.wood;                        // урна, опечатана
    ctx.fillRect(x + 1, gy - 9, 7, 9);
    ctx.fillStyle = C.black; ctx.fillRect(x + 3, gy - 9, 3, 1);
    ctx.fillStyle = '#c23b2b'; ctx.fillRect(x + 4, gy - 6, 1, 1);
    ctx.fillStyle = C.ash;                         // флажок
    ctx.fillRect(x + 7, gy - 22, 1, 10);
    ctx.fillStyle = '#c23b2b'; ctx.fillRect(x + 3, gy - 22, 4, 3);
  },
  // окно второго этажа: банки этикетками внутрь, к кровати
  jars_window(ctx, x, gy) {
    ctx.fillStyle = C.brick;
    ctx.fillRect(x - 10, gy - 28, 20, 28);         // стена дома
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 7, gy - 24, 14, 10);          // окно
    ctx.fillStyle = C.wood2;
    ctx.fillRect(x - 8, gy - 14, 16, 1);           // подоконник
    ctx.fillStyle = C.ash;                         // банки
    for (let i = 0; i < 4; i++) ctx.fillRect(x - 6 + i * 3.4, gy - 18, 2, 4);
    ctx.fillStyle = C.paper;                       // к улице — изнанка этикеток, глянец
    for (let i = 0; i < 4; i++) ctx.fillRect(x - 6 + i * 3.4, gy - 17, 2, 1);
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 2, gy - 8, 4, 8);             // дверь подъезда
  },
  // двойной портрет над комодом: рама с позолотой, двое плечом к плечу
  double_portrait(ctx, x, gy) {
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 10, gy - 26, 20, 26);         // стена избы
    ctx.fillStyle = C.gold;
    ctx.fillRect(x - 7, gy - 24, 14, 11);          // рама
    ctx.fillStyle = C.ash;
    ctx.fillRect(x - 6, gy - 23, 12, 9);           // фон — небо (голубое): словом
    ctx.fillStyle = C.paper2;                      // лица
    ctx.fillRect(x - 4, gy - 21, 3, 3); ctx.fillRect(x + 1, gy - 21, 3, 3);
    ctx.fillStyle = C.bone; ctx.fillRect(x - 4, gy - 18, 3, 3);   // кружевной воротник
    ctx.fillStyle = C.dark; ctx.fillRect(x + 1, gy - 18, 3, 3);   // пиджак
    ctx.fillStyle = C.wood;                        // комод
    ctx.fillRect(x - 8, gy - 10, 16, 10);
    ctx.fillStyle = C.wood2;
    ctx.fillRect(x - 7, gy - 7, 14, 1); ctx.fillRect(x - 7, gy - 4, 14, 1);
  },
  // ── пустошь за огнём ──
  // остов перехватчика: на боку, три бака
  wreck_car(ctx, x, gy) {
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 13, gy - 9, 26, 7);           // кузов на боку
    ctx.fillRect(x - 9, gy - 13, 14, 4);           // кабина
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 3, gy - 17, 4, 4);            // нагнетатель
    ctx.fillStyle = C.ash;
    for (const bx of [-12, -8, 8]) ctx.fillRect(x + bx, gy - 4, 3, 3);   // баки
    ctx.fillStyle = C.stone2;
    ctx.beginPath(); ctx.arc(x - 7, gy - 1, 3, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 9, gy - 1, 3, 0, 7); ctx.fill();
    ctx.fillStyle = C.bone; ctx.fillRect(x + 4, gy - 8, 1, 1);           // ржавый блик
  },
  // цитадель: скала в три столба, сады наверху, труба воды внизу
  citadel(ctx, x, gy) {
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 13, gy - 30, 7, 30); ctx.fillRect(x - 4, gy - 36, 8, 36); ctx.fillRect(x + 6, gy - 28, 7, 28);
    ctx.fillStyle = C.stone;
    ctx.fillRect(x - 12, gy - 29, 2, 28); ctx.fillRect(x - 3, gy - 35, 2, 34); ctx.fillRect(x + 7, gy - 27, 2, 26);
    ctx.fillStyle = '#3D4A3A';                     // сады — мгла-зелень
    ctx.fillRect(x - 13, gy - 32, 7, 2); ctx.fillRect(x - 4, gy - 38, 8, 2); ctx.fillRect(x + 6, gy - 30, 7, 2);
    ctx.fillStyle = C.ash; ctx.fillRect(x - 1, gy - 12, 3, 4);   // труба
    ctx.fillStyle = C.dark;
    for (let i = 0; i < 6; i++) ctx.fillRect(x - 10 + i * 4, gy - 2, 2, 2);   // толпа с вёдрами
  },
  // купол-клетка: полусфера из прутьев
  cage_dome(ctx, x, gy) {
    ctx.strokeStyle = C.ash; ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath(); ctx.ellipse(x + 0.5, gy, Math.abs(i) * 4 + 0.5, 20, 0, Math.PI, 2 * Math.PI); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(x + 0.5, gy - 10, 12, 3, 0, 0, 2 * Math.PI); ctx.stroke();
    ctx.fillStyle = C.dark; ctx.fillRect(x - 13, gy - 1, 26, 1);
  },
  // камень с серебряным отпечатком губ, пустой баллончик
  chrome_rock(ctx, x, gy) {
    ctx.fillStyle = C.stone;
    ctx.fillRect(x - 7, gy - 8, 14, 8); ctx.fillRect(x - 5, gy - 10, 10, 2);
    ctx.fillStyle = '#c8ccd0';                     // хром
    ctx.fillRect(x - 2, gy - 7, 4, 1); ctx.fillRect(x - 1, gy - 6, 2, 1);
    ctx.fillStyle = C.ash; ctx.fillRect(x + 6, gy - 3, 2, 3);   // баллончик
  },
  // шлюз убежища: шестерня в скале
  vault_door(ctx, x, gy) {
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 14, gy - 26, 28, 26);
    ctx.fillStyle = C.ash;
    ctx.beginPath(); ctx.arc(x, gy - 12, 10, 0, 7); ctx.fill();
    ctx.fillStyle = C.stone;
    ctx.beginPath(); ctx.arc(x, gy - 12, 7, 0, 7); ctx.fill();
    ctx.fillStyle = C.ash;
    for (let a = 0; a < 8; a++) {                  // зубья
      const ang = a / 8 * Math.PI * 2;
      ctx.fillRect(x + Math.cos(ang) * 11 - 1 | 0, gy - 12 + Math.sin(ang) * 11 - 1 | 0, 2, 2);
    }
    ctx.fillStyle = C.bone; ctx.fillRect(x - 2, gy - 14, 1, 3); ctx.fillRect(x, gy - 14, 2, 1);   // «12»
    ctx.fillRect(x + 1, gy - 13, 1, 1); ctx.fillRect(x, gy - 12, 2, 1);
    ctx.fillStyle = C.black; ctx.fillRect(x + 10, gy - 20, 1, 16);   // щель — по проекту
  },
  // автомат газировки: бутылка-ракета на боку
  cola_vending(ctx, x, gy) {
    ctx.fillStyle = '#C23B2B';
    ctx.fillRect(x - 6, gy - 24, 12, 24);
    ctx.fillStyle = C.dark; ctx.fillRect(x - 4, gy - 21, 8, 10);
    ctx.fillStyle = C.bone;                        // бутылка-ракета
    ctx.fillRect(x - 1, gy - 20, 2, 7); ctx.fillRect(x - 2, gy - 14, 4, 1);
    ctx.fillStyle = C.ash; ctx.fillRect(x + 2, gy - 8, 2, 1);   // прорезь для крышек
    ctx.fillStyle = C.black; ctx.fillRect(x - 4, gy - 5, 8, 3);
  },
  // корова о двух головах
  brahmin(ctx, x, gy) {
    ctx.fillStyle = C.paper2;
    ctx.fillRect(x - 6, gy - 11, 12, 6);
    ctx.fillRect(x - 5, gy - 5, 1, 5); ctx.fillRect(x - 2, gy - 5, 1, 5);
    ctx.fillRect(x + 2, gy - 5, 1, 5); ctx.fillRect(x + 5, gy - 5, 1, 5);
    ctx.fillRect(x - 10, gy - 15, 4, 4); ctx.fillRect(x + 7, gy - 15, 4, 4);   // головы в разные стороны
    ctx.fillRect(x - 7, gy - 13, 2, 3); ctx.fillRect(x + 6, gy - 13, 2, 3);
    ctx.fillStyle = C.bone;
    ctx.fillRect(x - 10, gy - 16, 1, 1); ctx.fillRect(x + 10, gy - 16, 1, 1);  // рога
    ctx.fillStyle = C.wood;
    ctx.fillRect(x - 3, gy - 10, 2, 2); ctx.fillRect(x + 2, gy - 9, 2, 2);     // пятна
  },
  // чемодан «Сад Эдема»
  geck_case(ctx, x, gy) {
    ctx.fillStyle = C.ash;
    ctx.fillRect(x - 7, gy - 8, 14, 8);
    ctx.fillStyle = C.stone; ctx.fillRect(x - 2, gy - 10, 4, 2);   // ручка
    ctx.fillStyle = '#3D4A3A'; ctx.fillRect(x - 5, gy - 6, 4, 3);  // росток на крышке
    ctx.fillStyle = C.bone; ctx.fillRect(x + 1, gy - 5, 4, 1);
  },
  // остров с бункерами: вода, скала, купола, свежая табличка на причале
  island_bunkers(ctx, x, gy) {
    ctx.fillStyle = '#3D4A3A';                     // вода — мгла
    ctx.fillRect(x - 16, gy - 4, 32, 4);
    ctx.fillStyle = C.ash;
    for (const wx of [-14, -6, 5, 12]) ctx.fillRect(x + wx, gy - 3, 2, 1);   // рябь
    ctx.fillStyle = C.stone2;                      // скала
    ctx.fillRect(x - 12, gy - 9, 24, 5); ctx.fillRect(x - 8, gy - 13, 16, 4);
    ctx.fillStyle = C.concrete;                    // купола
    for (const bx of [-8, 0, 7]) {
      ctx.beginPath(); ctx.ellipse(x + bx, gy - 9 - (bx === 0 ? 4 : 0), 3, 3, 0, Math.PI, 2 * Math.PI); ctx.fill();
    }
    ctx.fillStyle = C.black;
    ctx.fillRect(x - 9, gy - 10, 2, 1); ctx.fillRect(x - 1, gy - 14, 2, 1); ctx.fillRect(x + 6, gy - 10, 2, 1);
    ctx.fillStyle = C.wood2; ctx.fillRect(x + 12, gy - 9, 1, 6);   // причал, столбик
    ctx.fillStyle = C.bone; ctx.fillRect(x + 10, gy - 12, 6, 3);   // табличка свежее всего
  },
  // бункер-купол: бетон, амбразура
  bunker_dome(ctx, x, gy) {
    ctx.fillStyle = C.concrete;
    ctx.beginPath(); ctx.ellipse(x, gy, 11, 9, 0, Math.PI, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = C.ash; ctx.fillRect(x - 11, gy - 1, 22, 1);
    ctx.fillStyle = C.black; ctx.fillRect(x - 4, gy - 5, 8, 2);    // амбразура
    ctx.fillStyle = C.paper2; ctx.fillRect(x + 5, gy - 7, 2, 1);   // номер
  },
  // бункер — божья коровка
  bunker_ladybug(ctx, x, gy) {
    ctx.fillStyle = '#C23B2B';
    ctx.beginPath(); ctx.ellipse(x, gy, 11, 9, 0, Math.PI, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = C.black;
    ctx.fillRect(x, gy - 9, 1, 9);                 // спинка
    for (const [dx, dy] of [[-6, -5], [-3, -7], [4, -6], [6, -3], [-7, -2], [3, -3]]) ctx.fillRect(x + dx, gy + dy, 2, 2);
    ctx.fillRect(x - 3, gy - 3, 6, 2);             // амбразура — рот
    ctx.fillStyle = C.paper; ctx.fillRect(x + 12, gy - 6, 4, 6);   // меню мелом
  },
};

// ── Формы записок на земле: (ctx, x, y, t) ──
const LORE = {
  envelope(ctx, x, y) {
    ctx.fillStyle = C.paper;
    ctx.fillRect(x - 3, y - 2, 7, 5);
    ctx.fillStyle = C.paper2;
    ctx.fillRect(x - 2, y - 1, 5, 1);              // клапан
    ctx.fillStyle = C.crimson;
    ctx.fillRect(x + 2, y, 1, 1);                  // печать
  },
  jar(ctx, x, y) {
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 2, y - 4, 5, 6);
    ctx.fillStyle = C.gold;
    ctx.fillRect(x - 2, y - 5, 5, 1);              // крышка
    ctx.fillStyle = C.dark;
    ctx.fillRect(x - 1, y - 2, 3, 3);              // содержимое
  },
  sheet(ctx, x, y) {
    ctx.fillStyle = C.paper;
    ctx.fillRect(x - 3, y - 3, 7, 6);
    ctx.fillStyle = C.paper2;
    ctx.fillRect(x - 2, y - 2, 5, 1);
    ctx.fillRect(x - 2, y, 4, 1);
  },
  poster(ctx, x, y) {
    ctx.fillStyle = C.paper2;                      // лицом в землю
    ctx.fillRect(x - 4, y - 3, 9, 7);
    ctx.fillStyle = C.wood2;
    ctx.fillRect(x - 3, y - 2, 7, 5);
  },
  tag(ctx, x, y) {
    ctx.fillStyle = C.paper;
    ctx.fillRect(x - 2, y - 2, 5, 4);
    ctx.fillStyle = C.ash;
    ctx.fillRect(x + 3, y - 3, 2, 1);              // шнурок
    ctx.fillStyle = C.crimson;
    ctx.fillRect(x - 1, y - 1, 1, 1);
  },
  cloth(ctx, x, y) {
    ctx.fillStyle = C.wood2;
    ctx.fillRect(x - 3, y - 2, 7, 5);
    ctx.fillStyle = C.crimson;                     // вышивка изнутри
    ctx.fillRect(x - 1, y - 1, 3, 1);
  },
  birch(ctx, x, y) {
    ctx.fillStyle = C.bone;
    ctx.fillRect(x - 3, y - 2, 7, 4);
    ctx.fillStyle = C.ash;
    ctx.fillRect(x - 3, y - 2, 1, 4);              // завиток свитка
    ctx.fillRect(x + 3, y - 2, 1, 4);
    ctx.fillStyle = C.wood2;
    ctx.fillRect(x - 1, y - 1, 3, 1);
  },
  calendar(ctx, x, y) {
    ctx.fillStyle = C.paper;
    ctx.fillRect(x - 3, y - 3, 6, 7);
    ctx.fillStyle = C.crimson;
    ctx.fillRect(x - 3, y - 3, 6, 1);
    ctx.fillStyle = C.black;                       // закрашенная пятница
    ctx.fillRect(x + 1, y, 1, 1);
  },
  cheque(ctx, x, y) {
    ctx.fillStyle = C.paper;
    ctx.fillRect(x - 2, y - 4, 4, 8);
    ctx.fillStyle = C.dark;                        // гвоздь
    ctx.fillRect(x - 1, y - 5, 1, 2);
    ctx.fillStyle = C.paper2;
    ctx.fillRect(x - 1, y - 2, 2, 1);
    ctx.fillRect(x - 1, y, 2, 1);
  },
  disc(ctx, x, y) {
    ctx.fillStyle = C.ash;
    ctx.fillRect(x - 3, y - 3, 7, 7);
    ctx.fillStyle = C.bone;
    ctx.fillRect(x - 2, y - 2, 5, 5);
    ctx.fillStyle = C.dark;                        // цветущий слой
    ctx.fillRect(x + 1, y - 2, 2, 2);
    ctx.fillStyle = C.black;                       // отверстие
    ctx.fillRect(x, y, 1, 1);
  },
  stone(ctx, x, y) {
    ctx.fillStyle = C.stone;
    ctx.fillRect(x - 3, y - 3, 7, 6);
    ctx.fillStyle = C.stone2;
    ctx.fillRect(x - 2, y - 2, 5, 1);
    ctx.fillRect(x - 2, y, 4, 1);
  },
};

export function drawEggObject(ctx, id, x, gy, t) {
  const fn = STREET[id];
  if (!fn) return false;
  fn(ctx, x, gy, t);
  return true;
}

export function drawLoreForm(ctx, id, x, y, t) {
  const fn = LORE[id];
  if (!fn) return false;
  fn(ctx, x, y, t);
  return true;
}
