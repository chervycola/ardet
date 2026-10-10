// ═══════════════════════════════════════
// НИТИ, ВОЛНА 2 (weave/perel/threads2.md): луна на учёте, часы по
// кольцам, платоновский кластер у котлована. Тексты — утверждённые
// эталоны и правка автора.
// ═══════════════════════════════════════
import { free, besideBuilding } from './aitraps.js';
import { well } from './mechanisms.js';
import { hang, tipOf } from './hang.js';

const N = '#0D0B0A', K = '#D9CFB8', P = '#8A8D8F', V = '#C23B2B', D1 = '#15100c', D2 = '#241c14', D3 = '#2a2620', C1 = '#c8b89a';
const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
const shadow = (ctx, x, gy, w) => R(ctx, x - w / 2, gy, w, 2, 'rgba(0,0,0,0.35)');

function drawTag(ctx, loc) {                 // столбик с биркой
  const x = loc.x + loc.w / 2, gy = loc.y + loc.h;
  shadow(ctx, x, gy, 8);
  R(ctx, x, gy - 14, 1, 14, D2);
  R(ctx, x + 1, gy - 13, 5, 7, C1); R(ctx, x + 1, gy - 13, 5, 1, P);
  R(ctx, x + 2, gy - 11, 3, 1, D3); R(ctx, x + 2, gy - 9, 2, 1, D3);
  R(ctx, x + 3, gy - 14, 1, 1, V);            // киноварная нитка
}

function drawNail(ctx, loc) {                // кусок стены: светлый прямоугольник и гвоздь
  const x = loc.x + loc.w / 2, gy = loc.y + loc.h;
  shadow(ctx, x, gy, 16);
  R(ctx, x - 8, gy - 22, 16, 22, D3); R(ctx, x - 8, gy - 22, 16, 1, P);
  R(ctx, x - 4, gy - 18, 8, 8, '#4a4438');     // след от часов
  R(ctx, x, gy - 19, 1, 1, K);                 // гвоздь
  R(ctx, x + 2, gy - 9, 4, 3, C1);             // бирка
}

function drawBoard(ctx, loc, t) {            // табло без времени
  const x = loc.x + loc.w / 2, gy = loc.y + loc.h;
  shadow(ctx, x, gy, 10);
  R(ctx, x - 1, gy - 12, 2, 12, D3);
  R(ctx, x - 9, gy - 22, 18, 10, N); R(ctx, x - 9, gy - 22, 18, 1, D3);
  if ((t >> 5) & 1) { R(ctx, x - 6, gy - 18, 3, 1, V); R(ctx, x - 2, gy - 18, 3, 1, V); }
  R(ctx, x + 1, gy - 19, 1, 1, V); R(ctx, x + 1, gy - 17, 1, 1, V);
  R(ctx, x - 7, gy - 14, ((t >> 3) % 14) + 1, 1, P);          // бегущая строка
}

function drawWell(ctx, loc) {                // колодец с воротом: крутишь — ведро идёт вверх
  const x = loc.x + loc.w / 2, gy = loc.y + loc.h;
  const m = well(`well:${loc.id}`);
  shadow(ctx, x, gy, 18);
  R(ctx, x - 7, gy - 20, 1, 12, D1); R(ctx, x + 6, gy - 20, 1, 12, D1);
  R(ctx, x - 8, gy - 21, 16, 2, D2); R(ctx, x - 4, gy - 17, 8, 2, D3);   // крыша и ворот
  R(ctx, x - 4 + ((((m.crank * 1.3) % 8) + 8) % 8 | 0), gy - 17, 1, 2, D1); // метка: барабан крутится
  // ручка ходит по кругу
  R(ctx, x + 4, gy - 16, 3, 1, D1);
  R(ctx, x + 7 + Math.round(Math.cos(m.crank)), gy - 16 + Math.round(Math.sin(m.crank) * 2), 2, 1, D1);
  // цепь до блеска и ведро на ней: длина цепи — от глубины, наверху качается
  const top = gy - 15, rim = gy - 8, len = 1 + m.d * 26;
  const b = hang(`wellb:${loc.id}`, x + 0.5, top, len, { sail: 0.02, damp: 0.993, gy, r: 2 });
  b.len = len;
  if (m.kick) { tipOf(b).x += 1.2; m.kick = false; }   // пришло наверх рывком — качнулось
  const t = tipOf(b), bx = Math.round(t.x), by = Math.round(t.y);
  const n = Math.max(1, by - top);
  ctx.fillStyle = K;
  for (let i = 0; i < n; i++) {
    const cy = top + i;
    if (cy >= rim) break;                               // ниже сруба цепь не видно
    ctx.fillRect(Math.round(x + (bx - x) * i / n), cy, 1, 1);
  }
  for (let k = 0; k < 2; k++) if (by + k < rim) R(ctx, bx - 1, by + k, 3, 1, P);   // ведро
  // сруб спереди — закрывает шахту
  R(ctx, x - 8, gy - 8, 16, 8, D2); R(ctx, x - 8, gy - 8, 16, 1, P);
}

function drawNotice(ctx, loc) {              // столб с объявлением, отрывные язычки
  const x = loc.x + loc.w / 2, gy = loc.y + loc.h;
  shadow(ctx, x, gy, 8);
  R(ctx, x, gy - 20, 2, 20, D2);
  R(ctx, x - 4, gy - 19, 10, 9, C1); R(ctx, x - 3, gy - 17, 7, 1, D3); R(ctx, x - 3, gy - 15, 5, 1, D3);
  for (let i = 0; i < 4; i++) R(ctx, x - 4 + i * 3 - (i > 2 ? 1 : 0), gy - 10, 1, i === 1 ? 0 : 3, C1);
}

const LOOK = {
  luna_tag: 'Бирка канцелярии: «Луна, 1 шт. Цвет не по нормативу. Замена запрошена». Ниже, другой ручкой: «Ответ: луна единственная, замены нет». Ещё ниже: «Приказы руководства не обсуждаются».',
  clock_nail: 'На стене светлый прямоугольник и гвоздь. Бирка: «Часы настенные, 1 шт. Ход исправен, стрелки на месте, время показывают верное. Изъяты как вызывающие беспокойство».',
  clock_board: 'Табло: «--:--». Ниже бегущая строка: «Точное время предоставляется по подписке».',
  kotlovan_well: 'Ворот крутится легко: ведро приходит наверх пустым и потому лёгким. Цепь отполирована руками до блеска — пить не пили, но крутили исправно.',
  kotlovan_notice: 'ОТДАМ В ХОРОШИЕ РУКИ — РУКИ. Свои, рабочие, привыкли к лопате, к людям тоже. Уволен по причине задумчивости. Думать больше не буду.',
};
const NAME = {
  luna_tag: 'бирка у костра', clock_nail: 'гвоздь от часов', clock_board: 'табло',
  kotlovan_well: 'колодец', kotlovan_notice: 'объявление на столбе',
};
// колодец: ворот можно крутить (world/mechanisms.js)
const USE = { kotlovan_well: { useAction: 'well_crank', useLabel: '<i>↻</i>КРУТИТЬ ВОРОТ' } };
const DRAW = { luna_tag: drawTag, clock_nail: drawNail, clock_board: drawBoard, kotlovan_well: drawWell, kotlovan_notice: drawNotice };

// рядом с вещью-якорем: справа/слева на одной земле, не наезжая
function near(anchor, w, h, locations, gaps = [12, 26, 44, 64], dirs = [1, -1]) {
  const gy = anchor.archGy ?? (anchor.y + anchor.h);
  const cx = anchor.archX ?? (anchor.x + anchor.w / 2), half = anchor.w / 2;
  for (const g of gaps) for (const dir of dirs) {
    const box = { x: Math.round(cx + dir * (half + g) - w / 2), y: gy - h, w, h };
    if (free(box, locations)) return box;
  }
  return null;
}

export function buildThreads2(locations) {
  const add = (id, box) => {
    if (!box) return;
    locations.push({ id, name: NAME[id], zone: 'street', ...box, look: LOOK[id], drawSelf: DRAW[id], ...(USE[id] || {}) });
  };
  const fire = locations.find(l => l.id === 'campfire');
  if (fire) add('luna_tag', near(fire, 10, 16, locations, [16, 30, 44], [-1, 1]));   // от Шута — на другую сторону
  add('clock_nail', besideBuilding(locations, 7, 'south', 18, 24, {}) || besideBuilding(locations, 7, 'east', 18, 24, {}));
  add('clock_board', besideBuilding(locations, 9, 'south', 20, 24, {}) || besideBuilding(locations, 9, 'east', 20, 24, {}));
  const palace = locations.find(l => l.archDraw && l.name === 'Дворец Советов');
  if (palace) {
    add('kotlovan_well', near(palace, 18, 22, locations));
    add('kotlovan_notice', near(palace, 12, 22, locations));
  }
}
