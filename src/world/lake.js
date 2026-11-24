// ═══════════════════════════════════════
// ТЁПЛОЕ ОЗЕРО — слово автора 24.11: «пусть пруд станет большим озером, с плакучими ивами и
// другими элементами. он должен быть не менее трёх минут переплавки с одной стороны на
// противоположную, увеличь его, добавь ручейки и строительный мусор».
// Прежний пруд-охладитель у градирни (23.11) стал озером: у самой градирни места на озеро нет
// (дороги, рельсы, корпуса), а большое свободное место рядом — котловина колец 4–6 равнины,
// в полутора тысячах точек к западу (посчитано по раскладке: места, дворы, артерии). Завод
// своё отдаёт по-прежнему: от него к озеру бежит тёплый сброс — ручей с паром.
//   форма — пять слитых котловин: восточный плёс, западный рукав, северная бухта, южный
//     залив; с востока на запад — две тысячи точек; берег неровный;
//   острова — водозабор (мостки, будка), ивовый, насыпь из строительного мусора, камышовый;
//   ручьи — тёплый сброс от завода, ручей с севера из родника, ручей с юго-запада, сток в реку;
//   по берегам — плакучие ивы, камыш, кувшинки; на берегах и на насыпи — строительный мусор:
//     плиты, арматура, битый кирпич, бетонные кольца, бетономешалка, блоки; полузатопленная
//     лодка, рыбацкое место, бочки;
//   лодки — у трёх мостков (world/boat.js): с берега на противоположный — дольше трёх минут.
// Глубокая вода не держит; у берега и в ручьях — вброд. Рельеф: чаша, насыпи островов,
// русла ручьёв — поздним крючком (world/landforms.js landCarve). Вода на земле — накладкой
// (render/etchPaths.js).
// ═══════════════════════════════════════
function gh(ix, iy, s) { const n = Math.sin(ix * 127.1 + iy * 311.7 + s * 74.7) * 43758.5453; return n - Math.floor(n); }
function vn(x, y, s) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = gh(ix, iy, s), b = gh(ix + 1, iy, s), c = gh(ix, iy + 1, s), d = gh(ix + 1, iy + 1, s);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
function hh(a, b, s) { let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const sm = (a, b, v) => { const k = Math.max(0, Math.min(1, (v - a) / (b - a))); return k * k * (3 - 2 * k); };

export const LAKE = { id: 'warm_lake', name: 'Тёплое озеро' };
// котловины (эллипсы по земле): форма — их мягкое слияние
export const BASINS = [
  { id: 'east', cx: 8150, cy: 2680, rx: 560, ry: 330 },          // восточный плёс
  { id: 'south', cx: 7420, cy: 2810, rx: 320, ry: 210 },          // южный залив
  { id: 'west', cx: 6920, cy: 2690, rx: 250, ry: 85 },            // западный рукав
  { id: 'north', cx: 7800, cy: 2420, rx: 260, ry: 120 },          // северная бухта
];
export const ISLES = [
  { id: 'pump', name: 'остров водозабора', cx: 8420, cy: 2620, rx: 55, ry: 26 },
  { id: 'willow', name: 'ивовый остров', cx: 7980, cy: 2760, rx: 75, ry: 34 },
  { id: 'rubble', name: 'насыпь', cx: 7440, cy: 2836, rx: 50, ry: 22 },
  { id: 'reeds', name: 'камышовый островок', cx: 8160, cy: 2520, rx: 30, ry: 13 },
];
// ручьи: точки — от истока к устью (сток — от озера к реке); w0, w1 — ширина у истока и у устья
export const BROOKS = [
  { id: 'warm', name: 'тёплый сброс', warm: true, w0: 6, w1: 11,
    pts: [[10305, 3155], [10235, 3125], [10165, 3085], [10105, 3025], [10045, 2965], [9965, 2945], [9885, 2935], [9805, 2925], [9725, 2925], [9645, 2925],
      [9565, 2925], [9495, 2885], [9415, 2865], [9335, 2865], [9255, 2865], [9175, 2865], [9095, 2865], [9015, 2865], [8935, 2895], [8855, 2895], [8795, 2835], [8715, 2795], [8680, 2785]] },
  { id: 'north', name: 'ручей с севера', w0: 3, w1: 8,
    pts: [[7985, 1965], [7955, 2005], [7925, 2045], [7925, 2085], [7925, 2125], [7915, 2165], [7915, 2205], [7885, 2235], [7855, 2265], [7825, 2295], [7805, 2330]] },
  { id: 'sw', name: 'ручей с юго-запада', w0: 3, w1: 8,
    pts: [[6725, 3145], [6725, 3105], [6745, 3065], [6745, 3025], [6755, 2985], [6755, 2945], [6755, 2905], [6755, 2865], [6765, 2825], [6765, 2785], [6765, 2745]] },
  { id: 'out', name: 'сток в реку', out: true, w0: 10, w1: 8,
    pts: [[7985, 2985], [7985, 3045], [7985, 3085], [7985, 3125], [7985, 3165], [7985, 3205], [7985, 3240]] },
];
export const DEEP = 0.8, ISLE_WADE = 1.22, SOFT = 0.1;

// рамка озера и рамки котловин
export const BOX = { x0: Math.min(...BASINS.map(b => b.cx - b.rx)) - 20, x1: Math.max(...BASINS.map(b => b.cx + b.rx)) + 20,
  y0: Math.min(...BASINS.map(b => b.cy - b.ry)) - 12, y1: Math.max(...BASINS.map(b => b.cy + b.ry)) + 12 };
// ядро котловин (вписанный прямоугольник): дороги обходят воду, а углы рамки остаются землёй
export const basinCores = () => BASINS.map(b => ({ x0: b.cx - b.rx * 0.7, y0: b.cy - b.ry * 0.7, x1: b.cx + b.rx * 0.7, y1: b.cy + b.ry * 0.7 }));
export const basinBoxes = (pad = 0) => BASINS.map(b => ({ x0: b.cx - b.rx - pad, y0: b.cy - b.ry - pad, x1: b.cx + b.rx + pad, y1: b.cy + b.ry + pad }));
const inBox = (x, y, m = 0) => x > BOX.x0 - m && x < BOX.x1 + m && y > BOX.y0 - m && y < BOX.y1 + m;

// e берега: < 1 — вода; мягкое слияние котловин, берег гуляет
export function lakeE(x, y) {
  if (!inBox(x, y, 30)) return 9;
  let s = 0;
  for (const b of BASINS) { const e = ((x - b.cx) / b.rx) ** 2 + ((y - b.cy) / b.ry) ** 2; if (e < 4) s += Math.exp(-e / SOFT); }
  if (s <= 0) return 9;
  return -SOFT * Math.log(s) * (1 + 0.1 * (vn(x / 40, y / 20, 71) - 0.5) + 0.05 * (vn(x / 13, y / 7, 72) - 0.5));
}
export const isleE = (I, x, y) => (((x - I.cx) / I.rx) ** 2 + ((y - I.cy) / I.ry) ** 2) * (1 + 0.16 * (vn(x / 12, y / 6, 73) - 0.5));
export function isleAt(x, y) {
  let best = null, be = 9;
  for (const I of ISLES) { if (Math.abs(x - I.cx) > I.rx * 1.6 || Math.abs(y - I.cy) > I.ry * 1.6) continue; const e = isleE(I, x, y); if (e < be) { be = e; best = I; } }
  return { I: best, e: be };
}

// ── ручьи: ломаная сглажена и чуть петляет; поиск — по сетке отрезков ──
const BG = 64, bgrid = new Map();
for (const B of BROOKS) {
  let p = B.pts.map(([x, y]) => ({ x, y }));
  for (let it = 0; it < 2; it++) {                                   // сглаживание (Чайкин), концы на месте
    const q = [p[0]];
    for (let i = 0; i < p.length - 1; i++) { const a = p[i], b = p[i + 1]; q.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 }, { x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 }); }
    q.push(p[p.length - 1]); p = q;
  }
  let s = 0;
  const L = p.map((pt, i) => { if (i) s += Math.hypot(pt.x - p[i - 1].x, pt.y - p[i - 1].y); return { ...pt, s }; });
  const len = s;
  B.line = L.map((pt, i) => {                                        // петляет: поперёк хода, к концам тише
    const a = L[Math.max(0, i - 1)], b = L[Math.min(L.length - 1, i + 1)], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    const u = pt.s / len, amp = 7 * sm(0, 0.08, u) * sm(1, 0.85, u), o = amp * (vn(pt.s / 60, 0, 81 + B.id.length) - 0.5) * 2;
    return { x: pt.x - dy / l * o, y: pt.y + dx / l * o * 0.5, u };
  });
  B.len = len;
  for (let i = 0; i < B.line.length - 1; i++) {
    const a = B.line[i], b = B.line[i + 1];
    for (let gx = Math.floor((Math.min(a.x, b.x) - 12) / BG); gx <= Math.floor((Math.max(a.x, b.x) + 12) / BG); gx++)
      for (let gy = Math.floor((Math.min(a.y, b.y) - 12) / BG); gy <= Math.floor((Math.max(a.y, b.y) + 12) / BG); gy++) {
        const k = gx * 100000 + gy;
        if (!bgrid.has(k)) bgrid.set(k, []);
        bgrid.get(k).push([B, i]);
      }
  }
}
// ближайший ручей: d — по кадру (ручей виден одной ширины, куда бы ни тёк), hw — полуширина там, u — где по длине
export function brookAt(x, y) {
  const L = bgrid.get(Math.floor(x / BG) * 100000 + Math.floor(y / BG));
  if (!L) return null;
  let best = null;
  for (const [B, i] of L) {
    const a = B.line[i], b = B.line[i + 1], lx = b.x - a.x, ly = b.y - a.y, rx = x - a.x, ry = y - a.y, L2 = lx * lx + ly * ly || 1;
    let t = (rx * lx + ry * ly) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
    const d = Math.hypot(rx - lx * t, ry - ly * t);
    if (!best || d < best.d) {
      const u = a.u + (b.u - a.u) * t;
      best = { B, d, u, hw: (B.w0 + (B.w1 - B.w0) * u) / 2 + 0.6 * (vn(x / 9, y / 5, 83) - 0.5) };
    }
  }
  return best;
}
export const brookBoxes = (pad = 0) => BROOKS.map(B => ({ x0: Math.min(...B.line.map(p => p.x)) - pad, x1: Math.max(...B.line.map(p => p.x)) + pad, y0: Math.min(...B.line.map(p => p.y)) - pad, y1: Math.max(...B.line.map(p => p.y)) + pad }));

// вода в точке: 0 — суша, 1 — вброд (у берега, в ручье), 2 — глубоко (не войти), 3 — суша острова
export function waterAt(x, y) {
  if (inBox(x, y)) {
    const { e: ie } = isleAt(x, y);
    if (ie < 1) return 3;
    const e = lakeE(x, y);
    if (e < 1) return ie < ISLE_WADE ? 1 : e < DEEP ? 2 : 1;
  }
  const b = brookAt(x, y);
  return b && b.d <= b.hw ? 1 : 0;
}
export const deepAt = (x, y) => waterAt(x, y) === 2;
// на острове водозабора (с мостками) — суша или вброд у его берега
export const onIsle = (x, y) => inBox(x, y) && isleE(ISLES[0], x, y) < ISLE_WADE;
// вода рядом — для раскладки (деревья, приметы, утварь не встают в воду и в ручей)
export function waterNear(x, y, r = 0) {
  if (inBox(x, y, r + 20)) {
    if (lakeE(x, y) < 1.06 + r / 300) return true;
    if (isleAt(x, y).e < ISLE_WADE) return true;
  }
  const b = brookAt(x, y);
  return !!b && b.d <= b.hw + r + 2;
}
// для штриха земли (render/etchPaths.js)
export function shapeAt(x, y) {
  const near = inBox(x, y, 30);
  const b = brookAt(x, y);
  if (!near && !b) return null;
  const is = near ? isleAt(x, y) : { I: null, e: 9 };
  return { e: near ? lakeE(x, y) : 9, ie: is.e, I: is.I, b };
}
const BB14 = brookBoxes(14);
export const lakeIn = (x0, y0, x1, y1) => (x1 > BOX.x0 - 30 && x0 < BOX.x1 + 30 && y1 > BOX.y0 - 30 && y0 < BOX.y1 + 30)
  || BB14.some(r => x1 > r.x0 && x0 < r.x1 && y1 > r.y0 && y0 < r.y1);

// ── рельеф: чаша, насыпи островов, русла ручьёв (вычитается из высоты) ──
const BB = brookBoxes(12);
export function lakeCarve(x, y) {
  let c = 0;
  if (inBox(x, y, 60)) {
    const e = lakeE(x, y);
    c += 16 * (1 - sm(0.6, 1.3, e));
    const { e: ie } = isleAt(x, y);
    if (ie < 1.6) c -= 20 * (1 - sm(0.2, 1.6, ie));
  }
  if (BB.some(r => x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1)) {
    const b = brookAt(x, y);
    if (b && b.d < b.hw + 5) c += 3 * (1 - b.d / (b.hw + 5));
  }
  return c;
}

// ── точка берега: от середины котловины по лучу наружу, пока не суша ──
export function shoreAt(basinId, deg, out = 6) {
  const b = BASINS.find(q => q.id === basinId), a = deg * Math.PI / 180;
  for (let r = 0.3; r < 3; r += 0.004) {
    const x = b.cx + Math.cos(a) * b.rx * r, y = b.cy + Math.sin(a) * b.ry * r;
    if (lakeE(x, y) >= 1) return { x: Math.round(x + Math.cos(a) * out), y: Math.round(y + Math.sin(a) * out * 0.5) };
  }
  return null;
}
// по ряду y от x0 шагом dx — до первой суши (край воды)
function edgeAlong(x0, y, dx) { let x = x0; while (Math.abs(x - x0) < 1200 && waterAt(x, y) !== 0) x += dx; return x; }

// ── места у воды ──
const LOOK = {
  pierE: `Мостки на сваях, доски в ржавых скобах. У последней сваи — плоскодонка, весло одно. На корме выжжено: «ВОЗВРАТ — СЮДА ЖЕ».

До того берега — долго: озеро тёплое и никуда не торопится.`,
  pierW: `Западные мостки — короче восточных, зато целые. Плоскодонка привязана тремя узлами разных лет.

На доске мелом: «ДО ЗАВОДА — ТРИ МИНУТЫ ВОДЫ».`,
  pierI: `Три доски на сваях. Лодка ждёт здесь, нос к берегу.

«ВОЗВРАТ — СЮДА ЖЕ».`,
  pump: `Насыпной остров: бетонные плиты, между ними камыш. Будка водозабора, дверь на одной петле.

Внутри — щит с рубильниками, все в положении «ВКЛ», и журнал смены. Последняя запись: «уровень в норме». Дальше страницы чистые, но разлинованы до конца тетради.

У плит в воде ходит кто-то длинный и медленный. Больше лодки. Не всплывает.`,
  outlet: `Бетонная труба выходит из-под забора завода. Из неё течёт вода — тёплая, с паром, рыжеватая. Ручей уходит на запад, к озеру.

На трубе краской: «СБРОС № 2». Сброса № 1 нигде нет.`,
  sign: `Щит на двух трубах: «КУПАНИЕ ЗАПРЕЩЕНО. ВОДА ТЕХНИЧЕСКАЯ».

Ниже, другой краской: «РЫБУ НЕ КОРМИТЬ». Ещё ниже, совсем свежо: «И НЕ ЗВАТЬ».`,
  spring: `Родник обложен кирпичом — битым, со стройки. Вода холодная: единственная холодная во всей округе.

На кирпиче — клеймо завода.`,
};
// мостки: куда плыть отсюда — use (дальнее), alt (второе)
export const PIERS = {};
export function buildLake() {
  const out = [];
  // восточные: у восточного берега плёса, доски уходят на запад, в воду; стоят — на берегу
  { const y = 2700, sx = edgeAlong(8600, y, 1);
    PIERS.east = { side: 'east', x: sx - 24, y: y - 5, w: 26, h: 10, dir: -1, stand: { x: sx + 6, y: y + 1 - 23 }, dock: { x: sx - 30, y: y + 3 } }; }
  // западные: у дальнего конца западного рукава, доски — на восток
  { const y = 2692, sx = edgeAlong(6820, y, -1);
    PIERS.west = { side: 'west', x: sx - 1, y: y - 5, w: 26, h: 10, dir: 1, stand: { x: sx - 18, y: y + 1 - 23 }, dock: { x: sx + 31, y: y + 3 } }; }
  // острова водозабора: доски с восточного края острова — на восток
  { const I = ISLES[0], y = I.cy + 3, sx = I.cx + Math.round(I.rx * 0.86);
    PIERS.isle = { side: 'isle', x: sx - 2, y: y - 5, w: 24, h: 10, dir: 1, stand: { x: sx - 22, y: y + 1 - 23 }, dock: { x: sx + 28, y: y + 3 }, isle: true }; }
  const LABEL = { east: '<i>≈</i>К ВОСТОЧНОМУ БЕРЕГУ', west: '<i>≈</i>К ЗАПАДНОМУ БЕРЕГУ', isle: '<i>≈</i>К ОСТРОВУ' };
  const GO = { east: ['west', 'isle'], west: ['east', 'isle'], isle: ['east', 'west'] };
  const NAME = { east: 'Мостки восточного берега', west: 'Мостки западного берега', isle: 'Мостки острова водозабора' };
  for (const k of ['east', 'west', 'isle']) {
    const P = PIERS[k], [to, alt] = GO[k];
    P.loc = { id: 'lake_pier_' + k, name: NAME[k], zone: 'street', x: P.x, y: P.y, w: P.w, h: P.h,
      look: k === 'east' ? LOOK.pierE : k === 'west' ? LOOK.pierW : LOOK.pierI, drawSelf: drawPier, pierDir: P.dir,
      useAction: 'boat_ride', useLabel: LABEL[to], boatTo: to, altTo: alt, altNow: () => ({ key: 'boat_alt', label: LABEL[alt] }),
      stand: P.stand, lake: LAKE.id, pier: k, isle: !!P.isle };
    out.push(P.loc);
  }
  // будка водозабора на острове
  { const I = ISLES[0], hx = I.cx - 16, hy = I.cy - 2;
    out.push({ id: 'lake_pump', name: 'Водозабор на острове', zone: 'street', x: hx - 9, y: hy - 18, w: 18, h: 18,
      look: LOOK.pump, drawSelf: drawPumphouse, stand: { x: hx - 6, y: hy + 9 - 23 }, isle: true, lake: LAKE.id }); }
  // сброс у завода — исток тёплого ручья
  { const [x, y] = BROOKS[0].pts[0];
    out.push({ id: 'lake_outlet', name: 'Сброс тёплой воды', zone: 'street', x: x - 6, y: y - 12, w: 16, h: 12,
      look: LOOK.outlet, drawSelf: drawOutlet, stand: { x: x - 18, y: y + 12 - 23 } }); }
  // щит у восточных мостков
  { const P = PIERS.east, x = P.stand.x + 30, y = P.stand.y + 23 - 14;
    out.push({ id: 'lake_sign', name: 'Щит у озера', zone: 'street', x: x - 7, y: y - 10, w: 14, h: 14, look: LOOK.sign, drawSelf: drawSign }); }
  // родник — исток ручья с севера
  { const [x, y] = BROOKS[1].pts[0];
    out.push({ id: 'lake_spring', name: 'Родник', zone: 'street', x: x - 7, y: y - 8, w: 14, h: 8, look: LOOK.spring, drawSelf: drawSpring,
      stand: { x: x - 6, y: y + 14 - 23 } }); }
  return out;
}

// ── что растёт у воды (world/flora.js сажает): плакучие ивы по берегу и на ивовом острове, камыш ──
export function shorePlants() {
  const out = [], took = [];
  const free = (x, y, r) => took.every(t => Math.abs(t.x - x) > r + t.r || Math.abs(t.y - y) > (r + t.r) * 0.6);
  const put = (sp, x, y, r, v) => { x = Math.round(x); y = Math.round(y); if (!free(x, y, r)) return; took.push({ x, y, r }); out.push({ sp, x, gy: y, v }); };
  // ивы — по берегу: сетка 14 точек, где берег (e 1,05…1,17); куртинами, гуще на севере и западе
  for (let y = BOX.y0 - 20; y < BOX.y1 + 20; y += 7) for (let x = BOX.x0 - 30; x < BOX.x1 + 30; x += 14) {
    const e = lakeE(x, y);
    if (e < 1.05 || e > 1.17 || brookAt(x, y)?.d < 14) continue;
    const north = y < 2560 ? 0.25 : 0, west = x < 7500 ? 0.15 : 0;
    const p = (0.035 + north * 0.1 + west * 0.1) * (0.3 + 1.6 * vn(x / 90, y / 45, 91));
    if (hh(x, y, 92) > p) continue;
    put('weeper', x, y, 15, Math.floor(hh(x, y, 93) * 6));
  }
  // ивовый остров — три ивы
  const W = ISLES[1];
  for (const [dx, dy, v] of [[-34, -6, 1], [6, -12, 3], [36, 2, 4], [-10, 10, 5]]) put('weeper', W.cx + dx, W.cy + dy, 13, v);
  // камыш — на мелководье у берега и у островов, кустами
  for (let y = BOX.y0; y < BOX.y1; y += 5) for (let x = BOX.x0; x < BOX.x1; x += 8) {
    const e = lakeE(x, y), { e: ie } = isleAt(x, y);
    const shore = (e > 0.86 && e < 0.985) || (ie > 1.03 && ie < 1.2 && e < 1);
    if (!shore) continue;
    if (hh(x, y, 94) > 0.09 * (0.2 + 1.8 * vn(x / 50, y / 25, 95))) continue;
    if (Object.values(PIERS).some(P => Math.abs(x - P.dock.x) < 60 && Math.abs(y - P.dock.y) < 26)) continue;   // у мостков — чисто
    put('reed', x, y, 4, Math.floor(hh(x, y, 96) * 6));
  }
  // камыш по ручьям
  for (const B of BROOKS) for (let i = 2; i < B.line.length - 2; i += 3) {
    if (hh(i, B.id.length, 97) > 0.4) continue;
    const p = B.line[i], q = B.line[i + 1], dx = q.x - p.x, dy = q.y - p.y, l = Math.hypot(dx, dy) || 1, k = hh(i, 1, 98) < 0.5 ? -1 : 1;
    put('reed', p.x - dy / l * 7 * k, p.y + dx / l * 4 * k, 4, Math.floor(hh(i, 2, 99) * 6));
  }
  return out;
}

// ── строительный мусор и прочее у воды: { x, gy, kind } — рисует drawProp ──
export const PROPS = [];
export function buildProps() {
  PROPS.length = 0;
  const add = (kind, p, dx = 0, dy = 0) => { if (p) PROPS.push({ kind, x: Math.round(p.x + dx), gy: Math.round(p.y + dy), v: PROPS.length }); };
  // устье тёплого сброса: сваленные кольца, плиты
  const m = BROOKS[0].line[BROOKS[0].line.length - 8];
  add('pipe', m, 6, -14); add('slabs', m, 24, 12); add('rebar', m, 40, -6);
  // насыпь — остров из строительного мусора
  const R = ISLES[2];
  add('slabs', { x: R.cx - 22, y: R.cy - 2 }); add('rebar', { x: R.cx - 4, y: R.cy - 8 }); add('bricks', { x: R.cx + 14, y: R.cy + 4 });
  add('pipe', { x: R.cx + 30, y: R.cy - 6 }); add('blocks', { x: R.cx - 6, y: R.cy + 10 });
  // южный берег плёса: бетономешалка на боку, битый кирпич
  add('mixer', shoreAt('east', 75, 14)); add('bricks', shoreAt('east', 88, 12));
  add('blocks', shoreAt('east', 25, 12));
  // западный рукав: блоки и арматура на северном берегу, полузатопленная лодка у южного
  add('blocks', shoreAt('west', 255, 12)); add('rebar', shoreAt('west', 285, 10));
  add('wreck', shoreAt('west', 115, -10));
  // южный залив: плиты сползли в воду, бочки и покрышка
  add('slabwet', shoreAt('south', 145, -8)); add('barrel', shoreAt('south', 255, 10)); add('tyre', shoreAt('south', 230, 12));
  add('bricks', shoreAt('south', 160, 14));
  // северная бухта: рыбацкое место
  add('fisher', shoreAt('north', 290, 12));
  // пар над тёплым ручьём — у сброса и дальше по руслу
  for (const i of [3, 9, 16, 24]) { const p = BROOKS[0].line[Math.min(i, BROOKS[0].line.length - 1)]; add('steam', p); }
  return PROPS;
}
export const propsIn = (x0, y0, x1, y1) => PROPS.filter(p => p.x > x0 - 30 && p.x < x1 + 30 && p.gy > y0 - 10 && p.gy < y1 + 40);

// ── рисунок ──
const Rf = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const CON = '#57534c', CON_L = '#6e6a60', CON_D = '#3a3836', RUST = '#6b4a2c', RUST_D = '#4a3a2a', BRICK = '#6b3a2a', BRICK_L = '#8a4a32', BRICK_D = '#4a2a1e';
const WOOD = '#5c4229', WOOD_L = '#7a6040', TAR = '#2a1c10', NIGHT = '#0D0B0A', BONE = '#D9CFB8', WATER = '#2a3128';
function drawPier(ctx, loc) {
  const x = loc.x, y = loc.y, n = Math.floor(loc.w / 3);
  for (let i = 0; i < n; i++) {                                     // доски поперёк хода, через щель
    const xx = x + i * 3, c = (i * 7 + loc.y) % 5 === 0 ? '#3f3020' : WOOD;
    Rf(ctx, xx, y + 2, 2, loc.h - 4, c); Rf(ctx, xx, y + 2, 2, 1, WOOD_L);
  }
  for (const xx of [x + 1, x + loc.w - 3]) { Rf(ctx, xx, y + loc.h - 2, 2, 3, TAR); Rf(ctx, xx, y, 2, 2, TAR); }   // сваи
}
function drawPumphouse(ctx, loc) {
  const x = loc.x, y = loc.y;
  Rf(ctx, x + 1, y + 6, 16, 12, CON); Rf(ctx, x + 1, y + 6, 1, 12, CON_L); Rf(ctx, x + 16, y + 6, 1, 12, CON_D);
  Rf(ctx, x, y + 4, 18, 2, RUST_D); Rf(ctx, x, y + 3, 18, 1, RUST);
  Rf(ctx, x + 7, y + 10, 4, 8, '#1a1612'); Rf(ctx, x + 10, y + 10, 1, 8, TAR);
  Rf(ctx, x + 3, y + 8, 2, 2, '#2a2622'); Rf(ctx, x + 13, y + 1, 1, 3, '#8A8D8F');
  ctx.globalAlpha = 0.45; Rf(ctx, x + 1, y + 18, 17, 1, NIGHT); ctx.globalAlpha = 1;
}
function drawOutlet(ctx, loc) {                                     // бетонная труба из откоса, из неё — рыжая вода
  const x = loc.x, y = loc.y;
  Rf(ctx, x, y + 2, 16, 8, '#4a443a'); Rf(ctx, x, y + 2, 16, 1, CON_L);
  for (let k = 0; k < 7; k++) { const w = Math.round(2 * Math.sqrt(9 - (k - 3) ** 2)); Rf(ctx, x + 8 - w, y + 3 + k, w * 2, 1, k === 0 || k === 6 ? CON_L : CON); }
  Rf(ctx, x + 5, y + 5, 6, 4, NIGHT); Rf(ctx, x + 6, y + 8, 4, 4, '#5a3420');   // зев и рыжая струя
  Rf(ctx, x + 2, y + 1, 1, 2, RUST); Rf(ctx, x + 12, y, 1, 3, RUST);
}
function drawSign(ctx, loc) {
  const x = loc.x, y = loc.y;
  Rf(ctx, x + 2, y + 6, 1, 8, '#8A8D8F'); Rf(ctx, x + 11, y + 6, 1, 8, '#8A8D8F');
  Rf(ctx, x, y, 14, 7, '#b0a284'); Rf(ctx, x, y, 14, 1, BONE); Rf(ctx, x, y + 6, 14, 1, RUST_D);
  for (let k = 0; k < 3; k++) Rf(ctx, x + 2, y + 2 + k * 1.5 | 0, 7 + (k * 3) % 4, 1, k === 0 ? '#C23B2B' : '#3A3026');   // строки — штрихами
}
function drawSpring(ctx, loc) {
  const x = loc.x, y = loc.y;
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; Rf(ctx, x + 7 + Math.round(Math.cos(a) * 6) - 1, y + 4 + Math.round(Math.sin(a) * 3), 2, 2, k % 2 ? BRICK : BRICK_L); }
  Rf(ctx, x + 4, y + 3, 6, 3, WATER); Rf(ctx, x + 6, y + 4, 2, 1, '#9aa48e');
}
// мусор и прочее: kind, x, gy (подножие)
export function drawProp(ctx, p, t = 0) {
  const x = p.x, g = p.gy, v = p.v;
  switch (p.kind) {
    case 'slabs':                                                    // плиты стопкой вразнобой, из торца — арматура
      for (let k = 0; k < 3; k++) { const dx = (k * 5 + v) % 7 - 3, y = g - 3 - k * 3; Rf(ctx, x - 12 + dx, y, 24, 3, k % 2 ? CON : CON_L); Rf(ctx, x - 12 + dx, y + 2, 24, 1, CON_D); }
      for (const k of [-9, -6, 7]) Rf(ctx, x + k, g - 13, 1, 4, RUST);
      ctx.globalAlpha = 0.4; Rf(ctx, x - 13, g, 26, 1, NIGHT); ctx.globalAlpha = 1; break;
    case 'slabwet':                                                  // плита сползла в воду: торчит угол
      Rf(ctx, x - 10, g - 4, 20, 3, CON_L); Rf(ctx, x - 10, g - 2, 20, 2, CON_D); Rf(ctx, x - 12, g, 24, 1, '#9aa48e');
      Rf(ctx, x + 6, g - 8, 1, 4, RUST); Rf(ctx, x + 8, g - 7, 1, 3, RUST); break;
    case 'rebar':                                                    // арматура пучком, гнутая
      for (let k = 0; k < 6; k++) { const h = 6 + ((k * 7 + v) % 6), lean = (k % 3) - 1; for (let y = 0; y < h; y++) Rf(ctx, x - 5 + k * 2 + Math.round(lean * y / 4), g - y - 1, 1, 1, y > h - 2 ? RUST : RUST_D); }
      Rf(ctx, x - 7, g - 1, 15, 1, CON_D); break;
    case 'bricks':                                                   // битый кирпич кучей
      for (let k = 0; k < 26; k++) { const a = hh(v, k, 1) * Math.PI, r = hh(v, k, 2); const bx = x + Math.round(Math.cos(a) * 11 * r), by = g - Math.round(Math.sin(a) * 6 * r); Rf(ctx, bx - 1, by - 1, 2 + (k % 2), 1, k % 3 ? BRICK : k % 2 ? BRICK_L : BRICK_D); }
      ctx.globalAlpha = 0.4; Rf(ctx, x - 11, g, 23, 1, NIGHT); ctx.globalAlpha = 1; break;
    case 'pipe':                                                     // бетонное кольцо на боку
      for (let k = 0; k < 9; k++) { const w = Math.round(4 * Math.sqrt(1 - ((k - 4) / 4.5) ** 2)); Rf(ctx, x - 7, g - 9 + k, 14, 1, k < 2 ? CON_L : k > 6 ? CON_D : CON); Rf(ctx, x + 7, g - 5 - w + k * 0 , 1, 1, CON_D); }
      for (let k = 0; k < 9; k++) { const w = Math.round(3.6 * Math.sqrt(Math.max(0, 1 - ((k - 4) / 4.5) ** 2))); Rf(ctx, x + 7 - w, g - 9 + k, w * 2, 1, k === 0 ? CON_L : CON); }
      Rf(ctx, x + 5, g - 7, 3, 5, NIGHT); break;
    case 'blocks':                                                   // фундаментные блоки вразброс
      for (let k = 0; k < 3; k++) { const bx = x - 12 + k * 9 + ((v + k) % 3), by = g - (k === 1 ? 7 : 5); Rf(ctx, bx, by, 8, 5, k === 1 ? CON_L : CON); Rf(ctx, bx, by + 4, 8, 1, CON_D); Rf(ctx, bx + 2, by - 1, 1, 1, RUST); }
      break;
    case 'mixer':                                                    // бетономешалка на боку, ржавый барабан
      for (let k = 0; k < 8; k++) { const w = Math.round(7 * Math.sqrt(1 - ((k - 3.5) / 4) ** 2)); Rf(ctx, x - w, g - 9 + k, w * 2, 1, k < 2 ? RUST : k > 5 ? RUST_D : '#5a3e28'); }
      Rf(ctx, x + 6, g - 7, 4, 4, '#4a443a'); Rf(ctx, x + 7, g - 6, 2, 2, NIGHT); Rf(ctx, x - 9, g - 2, 3, 2, TAR); Rf(ctx, x - 2, g - 1, 1, 1, TAR);
      ctx.globalAlpha = 0.4; Rf(ctx, x - 8, g, 18, 1, NIGHT); ctx.globalAlpha = 1; break;
    case 'wreck':                                                    // лодка полузатоплена: нос над водой, корма ушла
      Rf(ctx, x - 9, g - 3, 14, 1, WOOD_L); Rf(ctx, x - 9, g - 2, 16, 2, WOOD); Rf(ctx, x - 7, g - 2, 10, 1, '#1e140c');
      Rf(ctx, x + 5, g - 4, 3, 2, WOOD); Rf(ctx, x - 11, g, 22, 1, '#9aa48e'); Rf(ctx, x + 2, g - 6, 1, 4, TAR); break;
    case 'barrel':
      for (const [dx, h] of [[-4, 8], [4, 7]]) { Rf(ctx, x + dx - 3, g - h, 6, h, RUST); Rf(ctx, x + dx - 3, g - h, 1, h, '#8a5a34'); Rf(ctx, x + dx - 3, g - h + 2, 6, 1, RUST_D); Rf(ctx, x + dx - 3, g - 2, 6, 1, RUST_D); }
      break;
    case 'tyre':
      for (let k = 0; k < 5; k++) { const w = Math.round(6 * Math.sqrt(1 - ((k - 2) / 2.6) ** 2)); Rf(ctx, x - w, g - 5 + k, w * 2, 1, '#1a1814'); }
      Rf(ctx, x - 2, g - 3, 4, 1, '#34302a'); break;
    case 'fisher': {                                                 // рыбацкое место: складной стул, удочка на рогатине, ведро
      Rf(ctx, x - 6, g - 5, 6, 1, '#4a3a2a'); Rf(ctx, x - 6, g - 4, 1, 4, TAR); Rf(ctx, x - 1, g - 4, 1, 4, TAR);
      Rf(ctx, x + 3, g - 4, 1, 4, WOOD); Rf(ctx, x + 2, g - 5, 3, 1, WOOD);
      for (let k = 0; k < 14; k++) Rf(ctx, x + 3 + k, g - 5 - Math.round(k * 0.5), 1, 1, k > 10 ? '#8A8D8F' : WOOD_L);   // удилище
      const sw = Math.round(Math.sin(t * 0.03) * 1);
      Rf(ctx, x + 17, g - 11, 1, 8 + sw, '#8A8D8F');                 // леска
      Rf(ctx, x - 12, g - 4, 4, 4, '#57534c'); Rf(ctx, x - 12, g - 4, 4, 1, CON_L);   // ведро
      break; }
    case 'steam': {                                                  // пар над тёплой водой: клочья поднимаются и тают
      for (let k = 0; k < 7; k++) {
        const ph = ((t * 0.4 + k * 17 + v * 17) % 60) / 60, px = x + Math.round(Math.sin(ph * 5 + k) * 3 + (k - 3) * 3), py = g - 2 - Math.round(ph * 20);
        ctx.globalAlpha = 0.42 * (1 - ph); Rf(ctx, px, py, 2 + (k & 1), 2, BONE);
      }
      ctx.globalAlpha = 1; break; }
  }
}
