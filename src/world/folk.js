// ═══════════════════════════════════════
// НАРОД МИРА — ПУЛ FOLK (канон v3.5, утверждён автором целиком; content/world_folk.js, полные тексты —
// src/assets/CONTENT_POOL.md). Волна I (слово автора 26.11: «погнали … 3»; решения — weave/DECISIONS_2026-11-25.md):
// то, что встаёт в мир без новых фигур.
//  · ГОЛОСА — у таблички своей клетки: постоял тихо — голос говорит, по фразе, пером шёпота
//    (world/whisper.js sayAt), ушёл — замолкает. Почтальон и силуэт — ночью; ночной у врат — после
//    первого возвращения из-за края, один раз.
//  · ФОРМЫ КАНЦЕЛЯРИИ — подшивкой в самой канцелярии (действие «подшивка»): полка полудня, журнал
//    входящих, несгораемый шкаф, исходящие, гвоздь у окна № 3, лист сверки, наряд, форма У, форма Л,
//    рамка на стене. Акт за сегодняшним числом: в красный полдень — «состоялся. свидетели: все»
//    (переписано v3.5). Квитанции — на гвозде, игроку не выдаются (доработка судьи).
//  · ИЗВЕЩЕНИЕ О НЕЯВКЕ — в почтовом ящике у дома странника.
// Строки — дословно по пулу, с правками приёмки v3.5 («Пул FOLK правится при подключении», STYLE §10 п. 20).
// Жители, вещи, образы и ритуалы с новыми фигурами и механикой — следующими волнами.
// ═══════════════════════════════════════
import { FOLK } from '../content/world_folk.js';
import { useTexts } from './useActions.js';
import { sayAt, whisperText } from './whisper.js';
import { redNoon } from './redNoon.js';
import { phaseAt, skyAt } from './sky.js';
import { hasReturned } from '../core/sessionMemory.js';
import { free } from './recount.js';
import { kitKind, MAT, FORM, tone } from '../sprites/arch/kit.js';
import { TOWN } from './disc.js';

const folkLine = name => { const f = FOLK.find(q => q.name.startsWith(name)); return f ? f.line : null; };

// ── голоса: имя в пуле → клетка (кольцо по описи улицы, сторона), какая табличка (по имени), когда ──
export const VOICES = [
  { name: 'тень обелиска', ring: 1, side: 'south', key: /обелиск|гномон|пилон/i,
    fix: s => s.replace('В полдень не показываю ничего.', 'В красный полдень не показываю ничего.') },   // приёмка v3.5: «в полдень» → «в красный полдень»
  { name: 'голос: круг ста пустых камней-сидений', ring: 1, side: 'east', key: /беспокоить|камн/i },
  { name: 'соляные сады', ring: 2, side: 'south', key: /сол|гномон|море/i },
  { name: 'полка невернувшихся книг', ring: 3, side: 'south', key: /книг|бумаг|перевод|толедо/i },
  { name: 'голос: у стены сада', ring: 3, side: 'east', key: /журнал смотрителя|стен/i },
  { name: 'Садовник сада камней', ring: 3, side: 'east', key: /сад камней|рёандзи/i },
  { name: 'колодец каравансарая', ring: 4, side: 'south', key: /колод|караван/i },
  { name: 'Фонарщик', ring: 6, side: 'west', key: /газов|фонар/i },
  { name: 'голос: полка стоит посреди пустыря', ring: 7, side: 'east', key: /полк|пустыр/i },
  { name: 'голос: мокрый асфальт', ring: 8, side: 'east', key: /вывеск|асфальт|иероглиф/i },
  { name: 'вода над набережной', ring: 9, side: 'south', key: /набережн|стеклянным дном|промерн/i },
  { name: 'голос: витрина', ring: 9, side: 'east', key: /экран|витрин|фотооб/i },
  { name: 'Шёпот ледника', ring: 9, side: 'north', key: /ледник/i },
  { name: 'Почтальон равнины', ring: 9, side: 'plain', key: /дом|подъезд|панел/i, night: true },
  { name: 'Пишущий силуэт', town: 'office', night: true },
  { name: 'Ночной — у врат', town: 'gates', once: true, when: () => hasReturned() },
];
const STILL = 90, NEAR = 60, AWAY = 130, AGAIN = 60 * 60 * 10;   // постоять полторы секунды; рядом; ушёл; снова — через десять минут

export const folk = { voices: [], said: new Set(), cur: null, still: 0 };

// фразы голоса: по предложению, многоточия и кавычки — целиком
const sentences = s => s.replace(/\s+/g, ' ').trim().split(/(?<=[.!?…»])\s+(?=[А-ЯЁA-Z«(.])/).filter(Boolean);

function anchorOf(V, locations) {
  if (V.town) return locations.find(l => l.id === V.town) || null;
  const cell = locations.filter(l => l.streetForm && l.streetSeg === V.ring && (l.streetSide || 'south') === V.side);
  return cell.find(l => V.key && V.key.test(l.name)) || cell[0] || null;
}

// ── формы канцелярии — подшивкой ──
const FILES = [
  ['Полка «ЯВЛЕНИЯ. ПОЛДЕНЬ», лист за сегодняшним числом', 'Акт о несостоявшемся полдне'],
  ['Конторка у окна № 3, журнал входящих явлений', 'Журнал входящих явлений'],
  ['Несгораемый шкаф', 'Договор с огнём'],
  ['Папка «ИСХОДЯЩИЕ»', 'Исходящее № 1'],
  ['Гвоздь у окна № 3: квитанции, оба экземпляра — на гвозде', 'Квитанция о приёме внимания'],
  ['За окном № 3, лист ежесуточной сверки', 'Лист ежесуточной сверки'],
  ['Стол, наряд под стеклом', 'Наряд на ночные работы'],
  ['Подоконник, пустой бланк', 'Форма У'],
  ['Нижний ящик конторки, бланки формы Л', 'Заявление о забвении'],
  ['Стена, единственная рамка', 'Ходатайство о дожде'],
];
// машинка без первого лица — в приёмной без приёмщика; формула — замена судьи («справка выдана предъявителю…»)
const MACHINE = 'Приёмная без приёмщика: чёрная машинка без марки, на месте клавиши «я» — фабричная заглушка; лента наполовину киноварная, красная половина суха. Под валиком — справка: «справка выдана предъявителю. в чём — устанавливается». Рядом стопка ответов на незаданные вопросы.';
export function filesText() {
  return FILES.map(([where, name]) => {
    let line = folkLine(name) || '';
    if (name.startsWith('Акт о несостоявшемся') && redNoon.active) line = 'Настоящим удостоверяется: полдень состоялся. Свидетели: все.';
    return `${where}: «${line.trim()}»`;
  }).concat(MACHINE).join('\n\n');
}

// ── почтовый ящик у дома: извещение о неявке ──
const NOTICE = () => `В почтовом ящике — извещение, сложенное вчетверо: «${(folkLine('Извещение о неявке') || '').trim()}» Марка не погашена.`;
function drawMailbox(ctx, l) {
  const x = l.x, gy = l.y + l.h;
  ctx.fillStyle = '#2a2620'; ctx.fillRect(x + 4, gy - 12, 2, 12);                 // столбик
  ctx.fillStyle = '#4a4438'; ctx.fillRect(x, gy - 18, 10, 7);                     // ящик
  ctx.fillStyle = '#6a6252'; ctx.fillRect(x, gy - 18, 10, 1); ctx.fillRect(x, gy - 18, 1, 7);   // свет слева-сверху
  ctx.fillStyle = '#8A8D8F'; ctx.fillRect(x + 9, gy - 17, 1, 6);                  // кромка пеплом
  ctx.fillStyle = '#0D0B0A'; ctx.fillRect(x + 2, gy - 15, 6, 1);                  // щель
  ctx.fillStyle = '#D9CFB8'; ctx.fillRect(x + 3, gy - 16, 3, 1);                  // уголок извещения торчит
}

// ── вещи-жители (волна II): рисунок набором колец, осмотр — сцена пула, одно действие — механика пула ──
const B = (w, h, build, seed) => kitKind(w, h, build, { seed, chip: 0.04, ao: 1 });
const scales = B(22, 30, (P, M) => {
  P.box(10, 6, 2, 24, M.WROUGHT); P.box(7, 27, 8, 3, M.BASALT);                  // стойка, вкопана
  P.box(2, 6, 18, 2, M.WROUGHT);                                                  // коромысло
  P.box(1, 14, 7, 2, M.WROUGHT); P.box(14, 14, 7, 2, M.WROUGHT);                  // чаши
}, 301);
const drum = B(18, 26, (P, M) => {
  P.box(8, 0, 2, 26, M.TIMBER).shade(1);                                          // ось
  P.box(3, 5, 12, 14, M.LOGS, FORM.CYL);                                          // цилиндр, тёмный от ладоней
  P.box(3, 5, 12, 1, M.WROUGHT); P.box(3, 18, 12, 1, M.WROUGHT);                  // медные обручи
  P.box(15, 18, 3, 8, M.TIMBER);                                                  // столбик с воронкой
}, 303);
const booth = B(18, 30, (P, M) => {
  P.box(1, 4, 16, 26, M.TARRED);                                                  // дубовая будка
  P.box(0, 2, 18, 2, M.TARRED);
  P.cut(5, 9, 8, 7);                                                              // окошко за решёткой
}, 305);
const photo = B(18, 34, (P, M) => {
  P.box(1, 3, 16, 31, M.WARSHIP); P.box(0, 1, 18, 2, M.STEEL);                    // будка, козырёк
  P.box(3, 7, 9, 22, M.FELT).shade(1);                                            // шторка
  P.box(13, 12, 3, 4, M.PLATE);                                                   // монетоприёмник
}, 307);
const dish = B(14, 42, (P, M) => {
  P.box(6, 6, 2, 36, M.TIMBER);                                                   // столб
  P.round(5, 0, 7, 10, M.PLATE);                                                  // чёрная бумажная тарелка
}, 309);
const vanePole = B(12, 36, (P, M) => { P.box(5, 6, 2, 30, M.TIMBER); }, 311);
function drawThing(kind) {
  return (ctx, l) => {
    const cx = l.x + (l.w >> 1), gy = l.y + l.h;
    kind.draw(ctx, cx, gy);
    if (kind.over) kind.over(ctx, l.x, l.y, l);
  };
}
const FEATHER = '#D9CFB8', INK = '#0D0B0A';
export const THINGS = [
  { id: 'folk_scales', name: 'Весы у сухой переправы', ring: 1, side: 'south', near: /пилон|обелиск|храм/i, w: 22, h: 30, draw: scales,
    over: (c, x, y) => { c.fillStyle = FEATHER; c.fillRect(x + 2, y + 12, 5, 1); c.fillRect(x + 5, y + 11, 2, 1); c.fillStyle = tone(MAT.WROUGHT, 5); c.fillRect(x + 15, y + 14, 5, 1); },   // перо на левой; правая отполирована ладонями
    look: 'Бронзовые весы в рост человека, вкопаны у сухого рукава реки. На левой чаше — перо, серое от тысячелетий. Правая пуста, отполирована ладонями до тёплого блеска. Под чашей с пером, если присесть, — наросшая за века смола.',
    use: { label: '<i>⚖</i>ПОЛОЖИТЬ', title: 'Весы у сухой переправы', text: 'Коромысло качнулось и встало ровно. Из прорези в основании выходит бирка: «ВЗВЕШЕНО. НЕ ТЯЖЕЛЕЕ ПЕРА. ПРЕТЕНЗИЙ НЕТ». Уголёк весы не взвешивают — коромысло не трогается.' } },
  { id: 'folk_drum', name: 'Барабан прошений', ring: 3, side: 'east', near: /сад камней/i, w: 18, h: 26, draw: drum,
    look: 'У тропы — деревянный цилиндр на оси, тёмный от ладоней, обит медью. Внутри шуршит бумага, много бумаги. Рядом столбик с воронкой-щелью. На оси бирка: «единица хранения — 1 (одна). содержимое описи не поддаётся».',
    use: { label: '<i>↻</i>КРУТНУТЬ', title: 'Барабан прошений', lines: ['пусть дойдёт письмо', 'пусть перезимует олива', 'пусть он вернётся, я не буду ругаться'],
      text: 'Из нижней щели выползает узкая лента: одна строка чужой просьбы, без имени и даты.' } },
  { id: 'folk_confess', name: 'Окно устных заявлений', ring: 3, side: 'west', near: /собор/i, w: 18, h: 30, draw: booth,
    over: (c, x, y) => { c.fillStyle = tone(MAT.TARRED, 4); for (let i = 0; i < 4; i++) c.fillRect(x + 6 + i * 2, y + 9, 1, 7); c.fillStyle = FEATHER; c.fillRect(x + 4, y + 5, 10, 2); c.fillStyle = INK; c.fillRect(x + 5, y + 5, 8, 1); },
    look: 'Дубовая будка исповедальни, к ней прикручена свежая табличка: «ОКНО ПРИЁМА УСТНЫХ ЗАЯВЛЕНИЙ. ЧАСЫ ПРИЁМА: КОГДА ТЕМНО». За решёткой никого.',
    use: { label: '<i>…</i>СКАЗАТЬ', title: 'Окно устных заявлений', text: 'Перо за решёткой скрипит, пока говоришь; замолчишь — доскрипывает и останавливается. В прорезь выходит квитанция: «ВЫСЛУШАНО ПОЛНОСТЬЮ», печать «ПРИНЯТО». Лист под пером чистый: слушали, не записывали.' } },
  { id: 'folk_photo', name: 'Фотоавтомат «за 3 минуты»', ring: 8, side: 'east', near: /вагон|пут/i, w: 18, h: 34, draw: photo,
    over: (c, x, y) => { c.fillStyle = FEATHER; c.fillRect(x + 13, y + 11, 3, 1); },   // бумажка на монетоприёмнике
    look: 'Будка фотоавтомата с тяжёлой шторкой, внутри пахнет реактивами. Монетоприёмник заклеен бумажкой: «оплачено предыдущим».',
    use: { label: '<i>▣</i>СЕСТЬ', title: 'Фотоавтомат «за 3 минуты»', text: 'Вспышка не белая — тёплая, свечного тона. Из щели выходит снимок: на нём не лицо, а тёплое пятно — уголёк и погода того дня. Платить не нужно: оплачено предыдущим. Графа «следующий» на бумажке пуста.' } },
  { id: 'folk_dish', name: 'Репродуктор вчерашнего дня', ring: 9, side: 'plain', near: /панел|дом|подъезд/i, w: 14, h: 42, draw: dish,
    look: 'Пустая площадь между панельными домами: столб, на нём чёрная бумажная тарелка-репродуктор. Провод цел и уходит под землю. Молчит весь день.',
    use: { label: '<i>♫</i>ПОСЛУШАТЬ', title: 'Репродуктор вчерашнего дня', get text() { return hasReturned() ? 'Тарелка откашливается и читает сводку за вчера, тихо и без выражения: «происшествий не было. вернулся один (1) странник».' : 'Тарелка откашливается и читает сводку за вчера, тихо и без выражения: «происшествий не было». Имён не называет.'; } } },
  { id: 'folk_vane', name: 'Флюгер-кораблик', ring: 5, side: 'north', near: /./, w: 12, h: 36, draw: vanePole,
    over: (c, x, y, l) => {                                                       // кораблик: нос — откуда пришёл (к городку)
      const home = (TOWN.x0 + TOWN.x1) / 2 < l.x ? -1 : 1, cx = x + 6;
      c.fillStyle = tone(MAT.IRON, 3); c.fillRect(cx - 4, y + 4, 9, 2); c.fillRect(cx - 3, y + 6, 7, 1);
      c.fillStyle = tone(MAT.IRON, 4); c.fillRect(cx, y, 1, 4); c.fillRect(cx + home, y + 1, 1, 2);
      c.fillStyle = tone(MAT.IRON, 2); c.fillRect(cx + home * 5, y + 4, 1, 1);
    },
    look: 'Жестяной поморский кораблик на шесте. Скрипит. Нос указывает не куда ветер, а откуда пришёл: в сторону городка.',
    use: null },
];
function placeNear(T, locations) {
  const cell = locations.filter(l => l.archDraw && l.archRing === T.ring && l.archSide === T.side);
  const cands = [...cell.filter(l => T.near.test(l.name)), ...cell.filter(l => !T.near.test(l.name))];
  for (const b of cands) for (const dir of [1, -1]) for (const gap of [12, 26, 44, 66]) for (const dy of [0, 10, -10, 20]) {
    const cx = dir > 0 ? b.archX + b.w / 2 + gap + T.w / 2 : b.archX - b.w / 2 - gap - T.w / 2;
    const box = { x: Math.round(cx - T.w / 2), y: b.archGy + dy - T.h, w: T.w, h: T.h };
    if (free(box, locations)) return box;
  }
  return null;
}
export function buildFolkThings(locations) {
  const out = [];
  for (const T of THINGS) {
    const box = placeNear(T, locations);
    if (!box) continue;
    const kind = { draw: T.draw, over: T.over };
    const l = { id: T.id, name: T.name, zone: 'street', ...box, look: T.look, drawSelf: drawThing(kind) };
    if (T.use) {
      l.useAction = T.id; l.useLabel = T.use.label;
      if (T.use.lines) { let k = 0; useTexts[T.id] = { title: T.use.title, get text() { const s = T.use.lines[k++ % T.use.lines.length]; return `${T.use.text} «${s}».`; } }; }
      else useTexts[T.id] = T.use;
    }
    out.push(l); locations.push(l);
  }
  return out;
}

export function buildFolk(locations) {
  buildFolkThings(locations);
  folk.voices = VOICES.map(V => {
    const raw = folkLine(V.name);
    if (!raw) return null;
    const line = (V.fix ? V.fix(raw) : raw).trim();
    return { ...V, line, parts: sentences(line), at: anchorOf(V, locations), last: -AGAIN };
  }).filter(v => v && v.at);
  useTexts.office_files = { title: 'Подшивка канцелярии', get text() { return filesText(); } };
  const office = locations.find(l => l.id === 'office');
  if (office && !office.useAction) { office.useAction = 'office_files'; office.useLabel = '<i>§</i>ПОДШИВКА'; }
  return folk.voices;
}
// ящик ставится к дому, когда дом построен (world/house.js buildHouse)
export function buildMailbox(locations, home) {
  if (!home || locations.some(l => l.id === 'house_mailbox')) return null;
  const l = { id: 'house_mailbox', name: 'Почтовый ящик', zone: 'quarter', x: home.x + home.w + 4, y: home.y + home.h - 18, w: 10, h: 18,
    get look() { return NOTICE(); }, drawSelf: drawMailbox };
  locations.push(l);
  return l;
}

// шаг: постоял тихо у таблички — голос говорит по фразе; ушёл — замолк; t — шаг мира
export function stepFolk(player, t) {
  const fx = player.x + 6, fy = player.y + 23;
  const C = folk.cur;
  if (C) {
    const dx = fx - (C.at.x + C.at.w / 2), dy = (fy - (C.at.y + C.at.h)) * 2;
    if (Math.hypot(dx, dy) > AWAY || redNoon.active) { folk.cur = null; return null; }
    if (whisperText()) return null;
    if (C.i >= C.parts.length) { folk.cur = null; return null; }
    if (sayAt(C.parts[C.i], C.at.x + C.at.w / 2, C.at.y - 10)) C.i++;
    return null;
  }
  folk.still = player.moving ? 0 : folk.still + 1;
  if (folk.still < STILL || whisperText() || redNoon.active) return null;
  const night = ['ночь', 'сумерки'].includes(skyAt(phaseAt(t)).name);
  for (const V of folk.voices) {
    if (t - V.last < AGAIN || (V.once && folk.said.has(V.name)) || (V.night && !night) || (V.when && !V.when())) continue;
    const dx = fx - (V.at.x + V.at.w / 2), dy = (fy - (V.at.y + V.at.h)) * 2;
    if (Math.hypot(dx, dy) > NEAR) continue;
    V.last = t; folk.said.add(V.name); folk.still = 0;
    folk.cur = { ...V, i: 0 };
    return V;
  }
  return null;
}
export const saveFolk = () => ({ said: [...folk.said].filter(n => VOICES.some(V => V.once && V.name === n)) });
export function loadFolk(d) { if (!d) return; folk.said = new Set(d.said || []); }
export function _resetFolk() { folk.said = new Set(); folk.cur = null; folk.still = 0; for (const V of folk.voices) V.last = -AGAIN; }
