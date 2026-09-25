// ═══════════════════════════════════════
// EGG OBJECTS — пиксельные вещи под пасхалки: именные объекты улицы
// (поле sprite у таблички) и формы записок на земле (поле form).
// Палитра старой игры; правило фонда: вещь стоит в тени, не подсвечивается.
// ═══════════════════════════════════════

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
