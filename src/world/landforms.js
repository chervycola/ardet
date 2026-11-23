// ═══════════════════════════════════════
// ГОРЫ, КАНЬОНЫ, ПРУД — слово автора 23.11: «кажется, нам надо добавить горы и каньоны.
// посчитай подходящие места / давай сделаем ещё озеро и механику покататься до острова,
// где-нибудь у завода».
// Места посчитаны по раскладке мира (сетка 60×40 минус места, дворы и артерии): пустые
// углы колец — «три угла каждого кольца пусты всегда» (weave/LAND.md). Туда — массивы:
//   северо-запад, кольца 4–8 — стык севера и запада (Исландия, Шотландия, Норвегия по осям
//     сторон): самый пустой угол, большой массив с острыми гребнями;
//   юго-запад, кольца 5–7 — стык юга и запада (Атлас, Иберия): массив пониже.
// Каньоны — где канон уже говорит о пропасти и ущелье:
//   «Бездна» — у гранд-отеля «Бездна», кольцо 7, запад («номера с видом на пропасть»);
//   ущелье востока — кольца 2–3, восток («камень и тушь»: свитки гор и ущелий), в пустом
//     месте за заставой на перевале.
// Пруд-охладитель — в двухстах пятидесяти точках от градирни и цеха (кольцо 7, равнина:
// «котлован и цепи», «красная вода уходит в трубу»): ничего не пересекает — ни дороги, ни
// дуги, ни реки. На пруду — насыпной остров с будкой водозабора; к нему — лодка от мостков
// (world/boat.js). Глубокая вода не держит: туда не войти; у берега — вброд.
// Всё это — поздний крючок рельефа (world/relief.js setReliefCarve): раскладка мест не
// сдвигается, горизонтали и штриховка ложатся на новые склоны сами (render/etch.js), вода
// пруда — накладкой на землю (render/etchPaths.js). Высота — та же, что берёт шаг
// (main.js slopeK): в гору медленнее.
// ═══════════════════════════════════════
function gh(ix, iy, s) { const n = Math.sin(ix * 127.1 + iy * 311.7 + s * 74.7) * 43758.5453; return n - Math.floor(n); }
function vn(x, y, s) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = gh(ix, iy, s), b = gh(ix + 1, iy, s), c = gh(ix, iy + 1, s), d = gh(ix + 1, iy + 1, s);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
const sm = (a, b, v) => { const k = Math.max(0, Math.min(1, (v - a) / (b - a))); return k * k * (3 - 2 * k); };

// ── массивы: эллипс по земле (по глубине вдвое уже), гребни острые, край рваный ──
export const MASSIFS = [
  { id: 'nw', name: 'северо-западный массив', cx: 3380, cy: 2860, rx: 1000, ry: 500, H: 170, seed: 31 },
  { id: 'sw', name: 'юго-западный массив', cx: 3140, cy: 8280, rx: 900, ry: 450, H: 125, seed: 37 },
];
export function massifH(m, x, y) {
  const u = (x - m.cx) / m.rx, v = (y - m.cy) / m.ry, d = u * u + v * v;
  if (d >= 1.3) return 0;
  const dd = d * (0.78 + 0.44 * vn(x / 190, y / 95, m.seed));     // край рваный
  if (dd >= 1) return 0;
  const e = 1 - dd, env = e * e * (3 - 2 * e);
  const r1 = 1 - Math.abs(2 * vn(x / 170, y / 85, m.seed + 1) - 1);   // гребни
  const r2 = 1 - Math.abs(2 * vn(x / 64, y / 32, m.seed + 2) - 1);
  return m.H * env * (0.3 + 0.55 * r1 * r1 * r1 + 0.15 * r2 * r2);
}

// ── каньоны: ломаная по дну; дно ровное, стены круто (по земле: глубина вдвое) ──
export const CANYONS = [
  { id: 'abyss', name: 'Бездна', depth: 70, floor: 20, wall: 32,
    pts: [[1660, 4196], [1740, 4206], [1810, 4246], [1880, 4250], [1950, 4290], [2030, 4296], [2100, 4334], [2180, 4352], [2250, 4384], [2330, 4396], [2400, 4430]] },
  { id: 'gorge', name: 'ущелье востока', depth: 76, floor: 14, wall: 26,
    pts: [[8930, 5996], [9000, 6018], [9060, 6060], [9130, 6070], [9200, 6128], [9270, 6150], [9340, 6198], [9420, 6214], [9490, 6266], [9560, 6296]] },
];
for (const c of CANYONS) {
  const W = c.floor + c.wall + 4;
  c.x0 = Math.min(...c.pts.map(p => p[0])) - W; c.x1 = Math.max(...c.pts.map(p => p[0])) + W;
  c.y0 = Math.min(...c.pts.map(p => p[1])) - W / 2; c.y1 = Math.max(...c.pts.map(p => p[1])) + W / 2;
}
// расстояние по земле (по глубине вдвое) до ломаной; u — где ближайшая точка по длине (0..1)
export function canyonNear(c, x, y) {
  let best = Infinity, bu = 0, acc = 0;
  if (!c.len) { c.len = 0; for (let i = 0; i < c.pts.length - 1; i++) c.len += Math.hypot(c.pts[i + 1][0] - c.pts[i][0], (c.pts[i + 1][1] - c.pts[i][1]) * 2); }
  for (let i = 0; i < c.pts.length - 1; i++) {
    const [ax, ay] = c.pts[i], [bx, by] = c.pts[i + 1];
    const lx = bx - ax, ly = (by - ay) * 2, rx = x - ax, ry = (y - ay) * 2, L2 = lx * lx + ly * ly || 1, L = Math.sqrt(L2);
    let t = (rx * lx + ry * ly) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
    const d = Math.hypot(rx - lx * t, ry - ly * t);
    if (d < best) { best = d; bu = (acc + t * L) / c.len; }
    acc += L;
  }
  return { d: best, u: bu };
}
export const canyonDist = (c, x, y) => canyonNear(c, x, y).d;
export function canyonC(c, x, y) {
  if (x < c.x0 || x > c.x1 || y < c.y0 || y > c.y1) return 0;
  const { d, u } = canyonNear(c, x + 8 * (vn(x / 40, y / 20, 61) - 0.5), y + 3 * (vn(x / 30, y / 15, 62) - 0.5));   // кромка неровная
  const taper = sm(0, 0.16, u) * sm(1, 0.84, u);                    // к концам — мельче и уже: сходит на нет
  const fl = c.floor * (0.4 + 0.6 * taper), w = fl + c.wall * (0.6 + 0.4 * taper), D = c.depth * taper;
  if (d >= w || D <= 0) return 0;
  if (d <= fl) return D;
  const k = 1 - (d - fl) / (w - fl);
  // стена уступами: полки через треть, между ними — обрыв
  const st = k * 3, f = st - Math.floor(st);
  return D * ((Math.floor(st) + sm(0.55, 1, f)) / 3);
}

// ── пруд-охладитель: эллипс с неровным берегом; остров посреди ──
export const LAKES = [];
const lakeE = (L, x, y) => (((x - L.cx) / L.rx) ** 2 + ((y - L.cy) / L.ry) ** 2) * (1 + 0.14 * (vn(x / 26, y / 13, 71) - 0.5));
const isleE = (I, x, y) => (((x - I.cx) / I.rx) ** 2 + ((y - I.cy) / I.ry) ** 2) * (1 + 0.16 * (vn(x / 12, y / 6, 73) - 0.5));
export const DEEP = 0.8, ISLE_WADE = 1.22;
// вода в точке: 0 — суша, 1 — вброд (у берега), 2 — глубоко (не войти), 3 — суша острова
export function waterAt(x, y) {
  for (const L of LAKES) {
    if (x < L.cx - L.rx * 1.1 || x > L.cx + L.rx * 1.1 || y < L.cy - L.ry * 1.1 || y > L.cy + L.ry * 1.1) continue;
    const e = lakeE(L, x, y);
    if (e >= 1) continue;
    const ie = isleE(L.isle, x, y);
    if (ie < 1) return 3;
    if (ie < ISLE_WADE) return 1;
    return e < DEEP ? 2 : 1;
  }
  return 0;
}
export const deepAt = (x, y) => waterAt(x, y) === 2;
export const onIsle = (x, y) => waterAt(x, y) === 3 || (waterAt(x, y) === 1 && LAKES.some(L => isleE(L.isle, x, y) < ISLE_WADE));
export function lakeBox(L, pad = 0) { return { x0: L.cx - L.rx - pad, y0: L.cy - L.ry - pad, x1: L.cx + L.rx + pad, y1: L.cy + L.ry + pad }; }
// для штриха земли (render/etchPaths.js): e берега и острова в точке
export function lakeShape(x, y) {
  for (const L of LAKES) {
    if (x < L.cx - L.rx * 1.2 || x > L.cx + L.rx * 1.2 || y < L.cy - L.ry * 1.2 || y > L.cy + L.ry * 1.2) continue;
    return { L, e: lakeE(L, x, y), ie: isleE(L.isle, x, y) };
  }
  return null;
}
export const lakesIn = (x0, y0, x1, y1) => LAKES.filter(L => L.cx + L.rx * 1.2 > x0 && L.cx - L.rx * 1.2 < x1 && L.cy + L.ry * 1.2 > y0 && L.cy - L.ry * 1.2 < y1);

// ── поздний крючок рельефа: что вычесть из высоты (каньон — вниз, гора — вверх, пруд — чаша) ──
export function landCarve(x, y) {
  let c = 0;
  for (const m of MASSIFS) if (Math.abs(x - m.cx) < m.rx * 1.15 && Math.abs(y - m.cy) < m.ry * 1.15) c -= massifH(m, x, y);
  for (const k of CANYONS) c += canyonC(k, x, y);
  for (const L of LAKES) {
    if (Math.abs(x - L.cx) > L.rx * 1.4 || Math.abs(y - L.cy) > L.ry * 1.4) continue;
    const e = lakeE(L, x, y);
    c += 14 * (1 - sm(0.7, 1.25, e));                                   // чаша пруда
    const ie = isleE(L.isle, x, y);
    if (ie < 1.6) c -= 22 * (1 - sm(0.2, 1.6, ie));                     // остров — насыпь
  }
  return c;
}

// ── места у воды: мостки на южном берегу, остров, мостки острова (лодка — world/boat.js) ──
const PIER_LOOK = `Мостки на сваях, доски в ржавых скобах. К последней свае привязана плоскодонка, весло одно.

На корме выжжено: «ВОЗВРАТ — СЮДА ЖЕ».

Вода тёплая на вид: над ней стоит пар — и зимой стоял бы.`;
const ISLE_LOOK = `Насыпной остров: бетонные плиты, между ними камыш. Будка водозабора, дверь на одной петле.

Внутри — щит с рубильниками, все в положении «ВКЛ», и журнал смены. Последняя запись: «уровень в норме». Дальше страницы чистые, но разлинованы до конца тетради.

У плит в воде ходит кто-то длинный и медленный. Больше лодки. Не всплывает.`;
const ISLE_PIER_LOOK = `Три доски на сваях. Лодка ждёт здесь, нос к берегу.

«ВОЗВРАТ — СЮДА ЖЕ».`;

// фабрика: градирня и цех кольца 7, равнина (content/arch_ids.js); пруд — к югу-юго-востоку
export function buildLandforms(locations) {
  LAKES.length = 0;
  const works = locations.filter(l => l.archDraw && l.archRing === 7 && l.archSide === 'plain' && l.name === 'градирня и цех')
    .sort((a, b) => (a.archNth || 1) - (b.archNth || 1))[0];
  const fx = works ? (works.archX ?? works.x + works.w / 2) : 10392, fy = works ? (works.archGy ?? works.y + works.h) : 3038;
  const L = { id: 'cooling_pond', name: 'Пруд-охладитель', cx: Math.round(fx + 88), cy: Math.round(fy + 242), rx: 118, ry: 58 };
  L.isle = { cx: L.cx + 6, cy: L.cy - 4, rx: 40, ry: 20 };
  LAKES.push(L);
  // мостки берега: на юге, чуть западнее середины; уходят на север, в воду. Стоят у них — на берегу
  const sx = L.cx - 22, sy = L.cy + L.ry - 2;
  const pier = { id: 'cooling_pier', name: 'Мостки у пруда', zone: 'street', x: sx - 5, y: sy - 20, w: 10, h: 24,
    look: PIER_LOOK, useAction: 'boat_ride', useLabel: '<i>≈</i>ПЛЫТЬ К ОСТРОВУ', drawSelf: drawPier, pierDir: -1,
    stand: { x: sx - 6, y: sy + 9 - 23 }, dock: { x: sx + 1, y: sy - 15 }, lake: L.id };
  // мостки острова: на южной кромке острова, восточнее; уходят на юг, в воду. Стоят — на острове
  const I = L.isle, ix = I.cx + 14, iy = I.cy + I.ry - 3;
  const ipier = { id: 'isle_pier', name: 'Мостки острова', zone: 'street', x: ix - 5, y: iy - 4, w: 10, h: 16,
    look: ISLE_PIER_LOOK, useAction: 'boat_ride', useLabel: '<i>≈</i>ПЛЫТЬ НАЗАД', drawSelf: drawPier, pierDir: 1,
    stand: { x: ix - 6, y: iy - 5 - 23 }, dock: { x: ix + 1, y: iy + 10 }, lake: L.id, isle: true };
  // будка водозабора — посреди острова; стоят перед ней
  const hx = I.cx - 12, hy = I.cy + 2;
  const house = { id: 'isle_pumphouse', name: 'Водозабор на острове', zone: 'street', x: hx - 9, y: hy - 18, w: 18, h: 18,
    look: ISLE_LOOK, drawSelf: drawPumphouse,
    stand: { x: hx - 6, y: hy + 6 - 23 }, isle: true };
  L.pier = pier; L.ipier = ipier;
  return [pier, ipier, house];
}

// ── рисунок: мостки (доски поперёк, сваи), будка водозабора ──
const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
function drawPier(ctx, loc) {
  const x = loc.x, y = loc.y, n = Math.floor(loc.h / 3);
  for (let i = 0; i < n; i++) {                                     // доски поперёк, через щель
    const yy = y + i * 3, c = (i * 7 + loc.x) % 5 === 0 ? '#3f3020' : '#5c4229';
    R(ctx, x + 1, yy, loc.w - 2, 2, c);
    R(ctx, x + 1, yy, 1, 2, '#7a6040');                               // торец к свету — слева
  }
  for (const yy of [y + 2, y + loc.h - 4]) { R(ctx, x, yy, 1, 4, '#2a1c10'); R(ctx, x + loc.w - 1, yy, 1, 4, '#2a1c10'); }   // сваи
}
function drawPumphouse(ctx, loc) {
  const x = loc.x, y = loc.y;
  R(ctx, x + 1, y + 6, 16, 12, '#57534c');                          // бетон
  R(ctx, x + 1, y + 6, 1, 12, '#6e6a60');                           // к свету — слева
  R(ctx, x + 16, y + 6, 1, 12, '#3a3836');
  R(ctx, x, y + 4, 18, 2, '#4a3a2a'); R(ctx, x, y + 3, 18, 1, '#6b4a2c');   // крыша — ржавый лист
  R(ctx, x + 7, y + 10, 4, 8, '#1a1612'); R(ctx, x + 10, y + 10, 1, 8, '#2a1c10');   // дверь приоткрыта, на одной петле
  R(ctx, x + 3, y + 8, 2, 2, '#2a2622');                            // окошко
  R(ctx, x + 13, y + 1, 1, 3, '#8A8D8F');                           // труба вытяжки
  ctx.globalAlpha = 0.45; R(ctx, x + 1, y + 18, 17, 1, '#0D0B0A'); ctx.globalAlpha = 1;
}
