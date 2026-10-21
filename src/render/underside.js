// ═══════════════════════════════════════
// ИЗНАНКА — рисунок (план — world/underside.js). Порода — штрихом по
// черноте; трубы Boring — дальняя половина обделки кольцами (швы колец,
// продольные швы вразбежку, мёртвые диоды, кабельный лоток по своду),
// полотно со следами шин, спереди — срез обделки; у труб с севера на юг —
// боковые стенки. Где труба входит в стену — круглый проём с ободом кольца.
// Комнаты — своим материалом: известняк крипты, казённая краска гауптвахты,
// мокрый бетон подвала, кирпич «Вавилона», иней криосклепа; жила — бетон
// коллектора и кабели на кронштейнах. Ход мха — круглый лаз в подушках мха,
// свет в нём — вспышки мха под ногой, в такт сердцу.
// Неподвижное запекается кусками по 256 точек (видимые — сразу, соседний —
// впрок, по одному за кадр); живое — поверх: вещи на полу по глубине,
// перемычки круглых проёмов, следы в пыли, вода, иней, который тает кольцом
// вокруг уголька, пар изо рта, капли, отблески мёртвых диодов.
// Только точки — без векторных фигур и градиентов.
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { UW, UH, T, TUBES, ROOMS, VEIN, MOSS, mossY, moss, GLOW, PORTALS, THINGS, CUTS, cutAt, under, placeAt, coldAt, inWater, NICHES, nicheOf, UPPER } from '../world/underside.js';

const NI = '#0D0B0A', BO = '#D9CFB8', AS = '#8A8D8F', MG = '#3D4A3A', KV = '#C23B2B';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K3 = '#34302a', K4 = '#3a3328';
const L1 = '#c8b89a', L2 = '#b0a284', BR2 = '#3a2818';
const S0 = '#474442', S1 = '#5e5e5d', S2 = '#33302e';
const MG_L = '#4d5a49', MG_D = '#2f372c', TI = '#8CC63F';
const RUST = '#4a3420', RUST_L = '#6b4a2c';
const GLOW_G = '#9DB08A', GLOW_W = '#C8A070';
const EMBER_G = '#E28A3A';                         // отблеск уголька — цвет масляного фонаря канона     // мох светится: живой — бледно-зелёным, сухой у норы — тёплым
const q = Math.round;
let G = null;                                      // холст, куда рисуем сейчас
const r = (x, y, w, h, c) => { G.fillStyle = c; G.fillRect(q(x), q(y), w, h); };
function hh(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const LINE = TUBES.find(tb => tb.ew), NS = TUBES.filter(tb => tb.ns);
const TRACKS = new Set(['line', 'celld']);         // где ездили машины — следы шин

// ── прогон точек: цвет по точке, подряд одинаковые — одним прямоугольником ──
function rows(x0, x1, y0, y1, cl, f) {
  const ax = Math.max(x0, cl.x0), bx = Math.min(x1, cl.x1), ay = Math.max(y0, cl.y0), by = Math.min(y1, cl.y1);
  for (let y = ay; y < by; y++) {
    let run = null, rx = ax;
    for (let x = ax; x <= bx; x++) {
      const c = x < bx ? f(x, y) : undefined;
      if (c !== run) { if (run) r(rx, y, x - rx, 1, run); run = c; rx = x; }
    }
  }
}
function col(x, y0, y1, cl, f) {
  if (x < cl.x0 || x >= cl.x1) return;
  const ay = Math.max(y0, cl.y0), by = Math.min(y1, cl.y1);
  let run = null, ry = ay;
  for (let y = ay; y <= by; y++) {
    const c = y < by ? f(y) : undefined;
    if (c !== run) { if (run) r(x, ry, 1, y - ry, run); run = c; ry = y; }
  }
}

// ═══ ПОРОДА: чернота, штрих по слою, редкое зерно ═══
function rock(cl) {
  r(cl.x0, cl.y0, cl.x1 - cl.x0, cl.y1 - cl.y0, NI);
  const S = 6;
  for (let cy = Math.floor(cl.y0 / S); cy * S < cl.y1; cy++) for (let cx = Math.floor(cl.x0 / S); cx * S < cl.x1; cx++) {
    const h = hh(cx, cy, 11);
    if (h < 0.3) {
      const x = cx * S + q(hh(cx, cy, 12) * 3), y = cy * S + q(hh(cx, cy, 13) * 3), len = 2 + (h < 0.07 ? 2 : 0);
      for (let k = 0; k < len; k++) r(x + k, y + (k >> 1), 1, 1, h < 0.12 ? K1 : K0);
    } else if (h > 0.988) r(cx * S + 2, cy * S + 2, 1, 1, K1);
  }
}

// ═══ ТРУБА BORING ═══
// дальняя половина снизу вверх: паз у полотна, бок к свету, свод уходит в тень
const BAND = [K2, S2, S0, S0, S1, S1, S1, S1, S1, S1, S1, S1, S1, S1, S1, S1, S1, S0, S0, S0, S2, S2, K3, K3, K2, K1];
function ringOf(L, x) { const v = L.x1 - x; return { k: Math.floor(v / T.RING), u: ((v % T.RING) + T.RING) % T.RING }; }
function ewBandColor(L, x, y) {
  const d = L.y0 - y, cut = cutAt(x);
  if (cut) return cutBand(cut, x, d);                                   // разрез эпох: тут обделка не сомкнулась
  const { k, u } = ringOf(L, x);
  if (u === 0 && d > 2 && d < T.WH) return K2;                          // шов колец
  if (u === T.RING - 1 && d > 4 && d < 20) return AS;                   // кромка кольца к свету
  const lj = k & 1 ? 8 : 12;
  if ((d === lj || d === lj + 9) && u > 1) return K2;                   // продольные швы вразбежку
  if ((d === lj + 2 || d === lj + 11) && u === 4) return K1;            // гнёзда болтов
  if (d === 15 && x % 3 === 0) return K1;                               // мёртвые диоды
  if (d === 23) return x % 6 === 0 ? S2 : K1;                           // кабельный лоток
  if (d === 22) return K2;
  const n = hh(x, y, 5);
  if (n < 0.035) return d < 13 ? S0 : S2;
  return BAND[d - 1];
}
// ближняя половина трубы срезана: от полотна обделка ещё поднимается к зрителю (изгиб), потом — срез
const TLIP = [S2, S0, S1, S1, AS, K2, K1];
function ewWalls(L, cl) { rows(L.x0, L.x1, L.y0 - T.WH, L.y0, cl, (x, y) => ewBandColor(L, x, y)); }
function ewLip(L, cl) {
  rows(L.x0, L.x1, L.y0 + T.FH, L.y0 + T.FH + TLIP.length, cl, (x, y) => {
    const row = y - L.y0 - T.FH, cut = cutAt(x);
    if (cut) return cutLip(cut, x, row);
    return ringOf(L, x).u === 0 && row < 5 ? K2 : TLIP[row];
  });
}
// ═══ РАЗРЕЗ ЭПОХ ═══
// Где линия прошла сквозь старый ход, обделка не сомкнулась: в дальней стене —
// срез старого слоя своим материалом, края — торцы последних колец (светлая
// кромка); посередине ход старого слоя уходит в стену и закрыт. Спереди, в срезе
// ближней половины, — тот же слой; канализация течёт под полотном.
function cutBand(c, x, d) {
  const u = x - c.x0, w = c.x1 - c.x0;
  if (u < 2 || u >= w - 2) return u === 0 || u === w - 1 ? K2 : AS;    // торец кольца
  switch (c.id) {
    case 'catacomb': {                                                 // белый известняк кладкой; под сводом — корни сада
      if (d > 23) return hh(x, d, 101) < 0.35 ? BR2 : K2;
      const course = Math.floor((d - 1) / 5), v = (d - 1) % 5;
      if (v === 4 || (x + course * 7) % 13 === 0) return S0;
      const n = hh(x, d, 102); return n < 0.08 ? S1 : n > 0.97 ? BO : L2;
    }
    case 'sewer': {                                                    // кирпич свода, понизу мокрый
      const course = Math.floor((d - 1) / 3), v = (d - 1) % 3;
      if (v === 2 || (x + (course & 1 ? 3 : 0)) % 7 === 0) return K1;
      if (d < 7) return hh(x, d, 103) < 0.35 ? MG_D : BR2;
      return hh(x, d, 104) < 0.08 ? BR2 : RUST;
    }
    case 'shelter': {                                                  // бетон в метр, торцы арматуры; за ним — убежище: зелёная краска, побелка
      if (u < 16 || u >= w - 16) {
        if ((d === 6 || d === 18) && x % 5 === 0) return K1;
        if ((d === 6 || d === 18) && x % 5 === 1) return RUST;
        const n = hh(x, d, 105); return n < 0.12 ? S1 : n < 0.2 ? K3 : S0;
      }
      if (d < 16) return hh(x, d, 106) < 0.05 ? MG_D : MG;
      if (d === 16) return K1;
      if (d > 24) return K2;
      return hh(x, d, 107) < 0.05 ? S0 : AS;
    }
    case 'metro': {                                                    // плитка станции, полоса потемнее
      if ((u % 5) === 0 || ((d - 1) % 4) === 3) return S2;
      if (d >= 9 && d <= 12) return S1;
      if (d > 23) return K3;
      return hh(x, d, 108) < 0.06 ? S1 : L2;
    }
  }
  return S0;
}
function cutLip(c, x, row) {
  if (row === 0) return S2;
  if (row >= TLIP.length - 2) return TLIP[row];
  const u = x - c.x0;
  if (c.id === 'sewer' && u >= 40 && u < 64) return hh(x, row, 109) < 0.2 ? MG_D : K1;   // канал уходит под ближний срез
  return cutBand(c, x, 4 + row * 3);
}
// череп 5×5: глазницы, зубы
function skull(x, y) {
  r(x + 1, y, 3, 1, L1); r(x, y + 1, 5, 1, BO); r(x, y + 2, 5, 1, BO); r(x + 1, y + 2, 1, 1, K1); r(x + 3, y + 2, 1, 1, K1);
  r(x, y + 3, 5, 1, L1); r(x + 1, y + 4, 1, 1, L2); r(x + 3, y + 4, 1, 1, L2);
}
function cutThing(th) {
  const c = CUTS.find(k => 'u_cut_' + k.id === th.id), gy = LINE.y0, cx = c.x0 + 52;
  rows(c.x0, c.x1, gy - T.WH, gy, { x0: -1e9, y0: -1e9, x1: 1e9, y1: 1e9 }, (x, y) => cutBand(c, x, gy - y));   // для второй краски — весь срез
  if (c.id === 'catacomb') {
    for (let x = cx - 12; x < cx + 12; x++) {                          // ход: арка, внутри темно
      const dx = x + 0.5 - cx, top = 12 + Math.sqrt(Math.max(0, 144 - dx * dx)) * 0.5;
      for (let d = 1; d < top; d++) r(x, gy - d, 1, 1, Math.abs(dx) > 10.5 ? S0 : d > top - 2 ? K2 : K1);
    }
    r(cx - 9, gy - 14, 1, 13, S2); r(cx + 8, gy - 14, 1, 13, K2);       // стенки хода сходятся
    for (let k = 0; k < 34; k++) {                                     // завал
      const x = cx - 11 + q(hh(k, 1, 110) * 22), h = 8 - Math.abs(x - cx) * 0.55;
      if (h < 1) continue;
      const n = hh(k, 3, 110);
      r(x, gy - 1 - q(hh(k, 2, 110) * h), 2, 1, n < 0.4 ? L2 : n < 0.7 ? S1 : K3);
    }
    for (const [xa, xb] of [[c.x0 + 4, cx - 14], [cx + 14, c.x1 - 4]]) {
      for (let x = xa; x + 5 <= xb; x += 6) skull(x, gy - 19);          // черепа рядами
      for (let x = xa; x + 2 <= xb; x += 3) { r(x, gy - 11, 2, 2, L1); r(x + 1, gy - 8, 2, 2, BO); r(x + 1, gy - 10, 1, 1, S0); }   // кости торцами, кладкой
    }
    for (let k = 0; k < 6; k++) {                                      // корни сада свисают сквозь свод
      let x = c.x0 + 8 + k * 16 + q(hh(k, 4, 111) * 6);
      const len = 4 + q(hh(k, 5, 111) * 7);
      for (let j = 0; j < len; j++) { r(x, gy - 26 + j, 1, 1, j < len - 2 ? BR2 : K4); if (hh(k, j, 112) < 0.25) x += hh(k, j, 113) < 0.5 ? -1 : 1; }
    }
    for (let x = cx + 16; x < c.x1 - 3; x++) if (hh(x, 0, 114) < 0.6 && (x - cx) % 4 !== 3) r(x, gy - 24, 1, 1, BO);   // мел — обрезан кольцом
  } else if (c.id === 'sewer') {
    for (let d = 1; d <= 23; d++) {                                    // свод яйцом: узкий низ, широкий круглый верх; кольцо клинчатого кирпича
      const hw = q(d >= 13 ? Math.sqrt(Math.max(0, 121 - (d - 13) * (d - 13))) : 11 * Math.pow(d / 13, 0.6));
      if (!hw) continue;
      r(cx - hw - 2, gy - d, 2, 1, d & 1 ? RUST_L : BR2); r(cx + hw, gy - d, 2, 1, d & 1 ? BR2 : RUST_L);
      r(cx - hw, gy - d, 2 * hw, 1, d < 5 ? (hh(d, 0, 115) < 0.3 ? MG : MG_D) : K1);   // внутри темно, понизу — чёрная вода
    }
    const gx0 = cx - 12;                                               // решётка в полотне: поверх канала
    r(gx0 - 1, gy + 2, 26, T.FH - 4, S2); r(gx0 - 1, gy + 2, 26, 1, AS);
    r(gx0, gy + 3, 24, T.FH - 6, K1);
    for (let x = gx0; x < gx0 + 24; x += 3) r(x, gy + 3, 1, T.FH - 6, K2);
    r(gx0, gy + 3 + ((T.FH - 6) >> 1), 24, 1, K2);
  } else if (c.id === 'shelter') {
    r(cx - 11, gy - 18, 22, 18, K2);                                   // гермодверь: рама, полотно, задрайки
    r(cx - 10, gy - 17, 20, 17, S1); r(cx - 10, gy - 17, 20, 1, AS); r(cx - 10, gy - 17, 1, 17, AS); r(cx + 9, gy - 16, 1, 16, S0);
    r(cx - 10, gy - 17, 2, 1, K2); r(cx + 8, gy - 17, 2, 1, K2);       // углы скруглены
    for (const yy of [gy - 13, gy - 5]) { r(cx + 3, yy, 6, 2, K2); r(cx + 3, yy, 6, 1, S0); }   // рычаги задраек
    r(cx - 9, gy - 14, 2, 3, K2); r(cx - 9, gy - 6, 2, 3, K2);         // петли
    write('ВЫХОД', cx - 11, gy - 24, K1, 0.05, 116);
    r(cx + 15, gy - 24, 1, 5, K1); r(cx + 14, gy - 20, 3, 1, K1); r(cx + 15, gy - 19, 1, 1, K1);   // стрелка — в дверь
    const tx = c.x0 + 8;                                               // столик у среза, на нём журнал учений — раскрыт
    r(tx, gy - 9, 22, 2, RUST_L); r(tx, gy - 7, 22, 1, RUST); r(tx + 1, gy - 6, 1, 6, RUST); r(tx + 20, gy - 6, 1, 6, RUST);
    r(tx + 5, gy - 11, 12, 2, L2); r(tx + 5, gy - 11, 12, 1, L1); r(tx + 10, gy - 11, 1, 2, S1);
    for (const gx of [tx + 6, tx + 12]) r(gx, gy - 10, 3, 1, AS);       // графы «явился / убыл» — пусты
    const kx = c.x1 - 15;                                              // противогазный шкаф: стекло, за ним маски
    r(kx, gy - 21, 11, 21, S2); r(kx + 1, gy - 20, 9, 19, K1); r(kx + 1, gy - 20, 9, 1, S0); r(kx + 5, gy - 20, 1, 19, S2);
    for (const [mx, my] of [[kx + 2, gy - 16], [kx + 7, gy - 16], [kx + 2, gy - 8], [kx + 7, gy - 8]]) { r(mx, my, 2, 3, MG_D); r(mx, my + 3, 2, 1, K2); }
    r(kx + 1, gy - 19, 1, 6, S0);                                      // блик на стекле — к свету
    const sx = c.x0 + 82, sy = gy - 14;                                 // репродуктор: чёрная тарелка на кронштейне
    r(sx - 1, sy - 8, 1, 4, K2);
    for (const [dx, dy] of [[-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [-3, -3], [3, -3], [-4, -2], [4, -2], [-4, -1], [4, -1], [-4, 0], [4, 0], [-3, 1], [3, 1], [-2, 2], [-1, 2], [0, 2], [1, 2], [2, 2]]) r(sx + dx, sy + dy, 1, 1, S2);
    r(sx - 3, sy - 3, 7, 5, K1); r(sx - 2, sy - 4, 5, 1, K1); r(sx - 2, sy + 1, 5, 1, K1); r(sx, sy - 1, 1, 1, S2);
  } else if (c.id === 'metro') {
    const mx = c.x0 + 76;                                              // тоннель: круглый, рельсы сходятся
    for (let d = 1; d <= 22; d++) {
      const dy = d - 10, hw = q(Math.sqrt(Math.max(0, 144 - dy * dy)));
      if (!hw) continue;
      r(mx - hw - 1, gy - d, 1, 1, AS); r(mx + hw, gy - d, 1, 1, S1);
      r(mx - hw, gy - d, 2 * hw, 1, d < 3 ? K2 : NI);
    }
    for (let d = 1; d < 9; d++) { r(mx - 7 + q(d * 0.5), gy - d, 1, 1, S2); r(mx + 6 - q(d * 0.5), gy - d, 1, 1, S2); }   // рельсы
    r(c.x0 + 2, gy - 3, 58, 1, AS); r(c.x0 + 2, gy - 2, 58, 2, K2); r(c.x0 + 2, gy - 4, 58, 1, L2);   // край платформы
    r(c.x0 + 8, gy - 8, 22, 2, RUST_L); r(c.x0 + 8, gy - 12, 22, 3, RUST); r(c.x0 + 9, gy - 6, 1, 2, K2); r(c.x0 + 28, gy - 6, 1, 2, K2);   // скамья
    r(c.x0 + 13, gy - 25, 1, 3, S2); r(c.x0 + 41, gy - 25, 1, 3, S2);   // табло без цифр — на тягах
    r(c.x0 + 11, gy - 22, 33, 9, S2); r(c.x0 + 12, gy - 21, 31, 7, K1);
    for (let i = 0; i < 6; i++) r(c.x0 + 14 + i * 5, gy - 20, 4, 5, K2);
  }
}

function slab(x, y, rowOrCol, len, tracks) {
  if (rowOrCol === 0 || rowOrCol === len - 1) return K2;                // паз у стены
  if (rowOrCol === 1 || rowOrCol === len - 2) return S2;
  if (tracks && (rowOrCol === 8 || rowOrCol === 9 || rowOrCol === len - 10 || rowOrCol === len - 9)) return hh(x >> 2, y >> 2, 7) < 0.8 ? S2 : S0;   // шины
  const n = hh(x, y, 9);
  return n < 0.03 ? K4 : n < 0.045 ? S1 : S0;
}
function ewFloor(L, cl) {
  rows(L.x0, L.x1, L.y0, L.y0 + T.FH, cl, (x, y) => {
    const row = y - L.y0;
    if (row > 1 && x % 150 === 0) return S2;                            // шов плиты полотна
    return slab(x, y, row === T.FH - 1 ? 2 : row, T.FH + 1, TRACKS.has(L.id));
  });
}
// боковые стенки трубы с севера на юг: от пола к своду; правая — к свету
const LW = [K2, S0, S0, S1, S0, S2, K3, K1], RW = [K2, S0, S1, AS, S1, S0, K3, K1];
function nsSpan(tb, side) {               // по вертикали: где у стенки начало
  if (tb.top === 'corner') return side === tb.outer ? tb.y0 - T.WH : tb.y0 + T.FH;
  return tb.y0;
}
function nsWalls(tb, cl) {
  const jt = y => ((tb.y1 - y) % T.RING + T.RING) % T.RING === 0;
  rows(tb.x0 - T.SW, tb.x0, nsSpan(tb, 'left'), tb.y1, cl, (x, y) => { const c = tb.x0 - x; return jt(y) && c > 1 && c < 8 ? K2 : LW[c - 1]; });
  rows(tb.x0 + T.FW, tb.x0 + T.FW + T.SW, nsSpan(tb, 'right'), tb.y1, cl, (x, y) => { const c = x - tb.x0 - T.FW + 1; return jt(y) && c > 1 && c < 8 ? K2 : RW[c - 1]; });
}
function nsFloor(tb, cl) {
  const y0 = tb.top === 'corner' ? tb.y0 + T.FH : tb.y0;
  rows(tb.x0, tb.x0 + T.FW, y0, tb.y1, cl, (x, y) => slab(x, y, x - tb.x0, T.FW, TRACKS.has(tb.id)));
}

// ═══ КОМНАТЫ: стена (полоса за полом), боковые стенки, срез, пол ═══
const BANDS = {
  lime(x, d, H) {                                                       // известняк крипты, свод уходит в тень
    if (d > H - 2) return K2;
    if (d > H - 8) return hh(x, d, 31) < 0.12 ? K2 : K3;
    const course = Math.floor((d - 1) / 8), u = (d - 1) % 8;
    if (u === 7) return K2;
    const bx = (x + (course & 1 ? 9 : 0)) % 18;
    if (bx === 0) return K2;
    if (bx === 1 || u === 6) return AS;
    const n = hh(x, d, 32);
    return n < 0.05 ? S0 : n > 0.985 ? L2 : S1;
  },
  army(x, d, H) {                                                       // казённая краска по пояс, выше побелка
    if (d <= 2) return K2;
    if (d < 19) { const n = hh(x, d, 41); return n < 0.06 ? MG_D : n > 0.985 ? K3 : MG; }
    if (d === 19) return K1;
    if (d > H - 2) return K2;
    if (hh(x, 0, 42) < 0.08 && d > H - 12) return S2;                   // потёки от потолка
    return hh(x, d, 43) < 0.05 ? S0 : AS;
  },
  wet(x, d, H) {                                                        // мокрый бетон, след воды, швы опалубки
    if (d > H - 2) return K2;
    if (d === 11) return MG_L;
    if (d < 11) return hh(x, d, 51) < 0.1 ? MG_D : MG;
    if ((d - 11) % 7 === 0) return hh(x >> 3, d, 52) < 0.7 ? K2 : S2;
    return hh(x, d, 53) < 0.06 ? S2 : S0;
  },
  brick(x, d, H) {                                                      // кирпич: верх кирпича к свету
    if (d > H - 3) return K3;
    const course = Math.floor((d - 1) / 4), u = (d - 1) % 4;
    if (u === 3) return K1;
    if ((x + (course & 1 ? 4 : 0)) % 9 === 0) return K1;
    if (u === 2) return RUST_L;
    return hh(x, d, 61) < 0.08 ? BR2 : RUST;
  },
  frost(x, d, H) {                                                      // бетон; иней — живой, поверх
    if (d > H - 2) return K2;
    return hh(x, d, 71) < 0.05 ? S2 : S0;
  },
  shelter(x, d, H) {                                                    // убежище: толстый бетон, решётки вентиляции; под потолком — лампы дневного света
    if (d <= 2) return K2;
    if (d > H - 2) return K1;
    if (d === H - 6 || d === H - 5) return (x - 1440) % 30 < 12 ? BO : K2;   // лампы
    if (d > H - 8) return K3;
    const gx = (x - 1440) % 60;
    if (gx > 6 && gx < 20 && d > 14 && d < 26) return (d & 1) ? K2 : S2;   // решётка вентиляции
    if (d === 8) return S2;                                             // шов панелей
    return hh(x, d, 59) < 0.05 ? S2 : S0;
  },
  condo(x, d, H) {                                                      // квартира: снизу деревянные панели, поручень, выше — бежевая штукатурка
    if (d <= 2) return K2;
    if (d > H - 2) return K1;
    if (d > H - 5) return K3;
    if (d < 18) return (x - 520) % 7 === 0 ? K1 : d === 17 ? RUST_L : hh(x, d, 69) < 0.06 ? BR2 : RUST;
    if (d === 18) return AS;
    if (d === 19) return S0;
    return hh(x, d, 70) < 0.04 ? S1 : L2;
  },
  drill(x, d, H) {                                                      // буровой цех: бетон, труба по стене на кронштейнах, ржавые потёки
    if (d <= 2) return K2;
    if (d > H - 2) return K1;
    if (d > H - 6) return K3;
    if (d === 27) return AS;                                            // труба: верх к свету
    if (d === 26 || d === 25) return (x - 980) % 30 === 0 ? K2 : S2;
    if (d === 24) return K2;
    if (d < 24 && d > 12 && hh(x, 0, 67) < 0.06) return RUST;           // потёки под трубой
    const n = hh(x, d, 68);
    return n < 0.06 ? S2 : n > 0.98 ? S1 : S0;
  },
  granite(x, d, H) {                                                    // гранит: зерно, следы шпуров от взрывной проходки
    if (d <= 2) return K2;
    if (d > H - 2) return K1;
    if (d > H - 7) return hh(x, d, 66) < 0.2 ? K2 : K3;
    const sx = x % 11;
    if (sx === 0 && d < H - 9) return K3;                               // шпур — полутрубка
    if (sx === 1 && d < H - 9) return S1;
    const n = hh(x, d, 65);
    return n < 0.1 ? S1 : n < 0.18 ? K3 : n > 0.975 ? AS : S0;
  },
  loop(x, d, H) {                                                       // станция: гладкие панели, мёртвая лента диодов, свод в тень
    if (d <= 2) return K2;
    if (d <= 5) return S2;                                              // плинтус
    if (d === 31) return x % 3 === 0 ? K1 : K2;                         // лента диодов — мёртвая
    if (d > H - 2) return K1;
    if (d > H - 8) return hh(x, d, 64) < 0.15 ? K2 : S2;
    if (d > 31) return S0;
    const px = (x - 1760) % 26;
    if (px === 0) return K2;                                            // шов панелей
    if (px === 1) return AS;
    return hh(x, d, 63) < 0.04 ? S0 : S1;
  },
};
const SIDE = {
  lime: [K2, S2, S0, S0, S2, K1], army: [K2, MG_D, MG, MG, MG_D, K1], wet: [K2, MG_D, S2, S2, K3, K1],
  brick: [K1, BR2, RUST, RUST, BR2, K1], frost: [K2, S2, S2, S2, K3, K1], loop: [K2, S0, S1, S1, S0, K1], granite: [K2, K3, S0, S0, K3, K1], drill: [K2, S2, S0, S0, S2, K1], condo: [K2, RUST, RUST_L, RUST_L, RUST, K1], shelter: [K2, S2, S0, S1, S0, K1],
};
const LIPS = {
  lime: [S1, S0, S2, K2, K1], army: [S1, S0, S2, K2, K1], wet: [MG_L, MG_D, S2, K2, K1],
  brick: [RUST_L, RUST, BR2, K2, K1], frost: [AS, S0, S2, K2, K1], loop: [AS, S1, S0, K2, K1], granite: [S1, S0, K3, K2, K1], drill: [S1, S0, S2, K2, K1], condo: [L2, S1, S0, K2, K1], shelter: [S1, S0, S2, K2, K1],
};
const STAINS = [[1012, 232, 9], [1122, 282, 7], [1038, 287, 5], [1138, 214, 5], [1090, 266, 4]];   // масло у станка и у устья
const FLOORS = {
  lime(x, y, R) {                                                       // каменные плиты
    const fy = y - R.y0, row = Math.floor(fy / 10);
    if (fy === 0) return K1;
    if (fy % 10 === 0 || (x - R.x0 + (row & 1 ? 8 : 0)) % 16 === 0) return K2;
    const n = hh(x, y, 91); return n < 0.04 ? S2 : n > 0.985 ? S1 : S0;
  },
  army(x, y, R) { const fy = y - R.y0; if (fy === 0) return K1; if (fy === 1) return K2; const n = hh(x, y, 92); return n < 0.04 ? S2 : n > 0.985 ? S1 : S0; },
  brick(x, y, R) { const fy = y - R.y0; if (fy === 0) return K1; if (fy === 1) return K2; const n = hh(x, y, 93); return n > 0.997 ? L2 : n > 0.988 ? S1 : n < 0.04 ? S2 : S0; },   // мука по бетону
  frost(x, y, R) { const fy = y - R.y0; if (fy === 0) return K1; return hh(x, y, 94) < 0.05 ? S2 : S0; },
  wet(x, y) { if (y % 7 === 0 && hh(x >> 2, y, 95) < 0.5) return MG_L; return hh(x, y, 96) > 0.996 ? AS : MG; },   // вода
  granite(x, y, R) { const fy = y - R.y0; if (fy === 0) return K1; if (fy === 1) return K2; const n = hh(x, y, 89); return n < 0.06 ? K3 : n > 0.985 ? S1 : S0; },
  shelter(x, y, R) {                                                    // фальшпол дата-центра: плитки, в проходах — с дырочками
    const fy = y - R.y0; if (fy === 0) return K1; if (fy === 1) return K2;
    const u = (x - R.x0) % 12, v = fy % 12;
    if (u === 0 || v === 0) return K2;
    if (fy > 66 && fy < 92 && u % 3 === 1 && v % 3 === 1) return S2;   // перфорированные — в проходе между рядами
    return hh(x, y, 84) < 0.04 ? S0 : S1;
  },
  condo(x, y, R) {                                                      // ковёр: тёмный, ромбом
    const fy = y - R.y0; if (fy === 0) return K1; if (fy === 1) return K2;
    const u = (x - R.x0) % 12, v = fy % 12;
    if (Math.abs(u - 6) + Math.abs(v - 6) === 5) return RUST;
    return hh(x, y, 85) < 0.05 ? K3 : BR2;
  },
  drill(x, y, R) {                                                      // бетон в масляных пятнах
    const fy = y - R.y0; if (fy === 0) return K1; if (fy === 1) return K2;
    for (const [sx, sy, sr] of STAINS) { const d = Math.hypot(x - sx, (y - sy) * 1.4); if (d < sr + hh(x, y, 88) * 2.5 - 1) return d < sr * 0.5 ? K2 : K3; }
    const n = hh(x, y, 86); return n < 0.04 ? S2 : n > 0.985 ? S1 : S0;
  },
  loop(x, y, R) {                                                       // платформа на одну машину — плитка, тактильная полоса, бордюр; дальше полоса посадки
    const fy = y - R.y0;
    if (fy === 0) return K1;
    if (fy < 13) return (x - R.x0) % 16 === 0 || fy === 6 ? K2 : hh(x, y, 98) < 0.04 ? S0 : S1;
    if (fy === 13) return x % 2 ? L2 : S0;
    if (fy === 14) return AS;
    if (fy === 15) return K2;
    const n = hh(x, y, 99); return n < 0.03 ? K4 : n < 0.045 ? S1 : S0;
  },
};
// многоугольник: грани с внутренней нормалью к зрителю (идут на восток) — стены, остальные — срез
function edges(P) { return P.map((a, i) => [a, P[(i + 1) % P.length]]); }
const yAt = (a, b, x) => a[1] + (x - a[0]) * (b[1] - a[1]) / (b[0] - a[0]);
function roomWalls(R, cl) {
  const band = BANDS[R.mat];
  if (R.poly) {
    for (const [a, b] of edges(R.poly)) if (b[0] > a[0]) for (let x = Math.ceil(a[0]); x < b[0]; x++) {
      const ye = q(yAt(a, b, x));
      col(x, ye - R.wh, ye, cl, y => band(x, ye - y, R.wh));
    }
    return;
  }
  rows(R.x0, R.x1, R.y0 - R.wh, R.y0, cl, (x, y) => band(x, R.y0 - y, R.wh));
  const sd = SIDE[R.mat];
  rows(R.x0 - 6, R.x0, R.y0 - R.wh, R.y1 + T.LIP, cl, x => sd[R.x0 - x - 1]);
  rows(R.x1, R.x1 + 6, R.y0 - R.wh, R.y1 + T.LIP, cl, x => sd[x - R.x1]);
}
function roomLip(R, cl) {
  const lp = LIPS[R.mat];
  if (R.poly) {
    for (const [a, b] of edges(R.poly)) if (b[0] < a[0]) for (let x = Math.ceil(b[0]); x < a[0]; x++) {
      const ye = q(yAt(a, b, x));
      col(x, ye, ye + T.LIP, cl, y => lp[y - ye]);
    }
    return;
  }
  rows(R.x0 - 6, R.x1 + 6, R.y1, R.y1 + T.LIP, cl, (x, y) => lp[y - R.y1]);
}
function roomFloor(R, cl) {
  const f = FLOORS[R.mat];
  if (!R.poly) { rows(R.x0, R.x1, R.y0, R.y1, cl, (x, y) => f(x, y, R)); return; }
  for (let y = Math.max(R.y0, cl.y0); y < Math.min(R.y1, cl.y1); y++) {
    const xs = [];
    for (const [a, b] of edges(R.poly)) {
      const yy = y + 0.5;
      if ((a[1] > yy) !== (b[1] > yy)) xs.push(a[0] + (yy - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
    }
    xs.sort((u, v) => u - v);
    for (let k = 0; k + 1 < xs.length; k += 2) rows(Math.ceil(xs[k]), Math.floor(xs[k + 1]) + 1, y, y + 1, cl, (x, yy) => f(x, yy, R));
  }
}

// ═══ ХОЛОДНАЯ ЖИЛА: кабельный коллектор, кабели на кронштейнах ═══
function veinBand(x, d, H) {
  if (d <= 2 || d > H - 2) return K2;
  const bk = (x - VEIN.x0) % 24;
  if (bk === 0) return AS;                                              // кронштейн
  if (d === 7 || d === 10 || d === 13 || d === 16) return K1;           // кабели
  if (d === 6 || d === 9 || d === 12 || d === 15) return bk === 1 || bk === 23 ? AS : K2;   // полки, тень под кабелем
  return hh(x, d, 81) < 0.05 ? S2 : S0;
}
function veinWalls(cl) { rows(VEIN.x0, VEIN.x1, VEIN.y0 - VEIN.wh, VEIN.y0, cl, (x, y) => veinBand(x, VEIN.y0 - y, VEIN.wh)); }
function veinLip(cl) { rows(VEIN.x0, VEIN.x1, VEIN.y0 + VEIN.fh, VEIN.y0 + VEIN.fh + T.LIP, cl, (x, y) => LIPS.frost[y - VEIN.y0 - VEIN.fh]); }
function veinFloor(cl) {
  rows(VEIN.x0 - 6, VEIN.x1 + 6, VEIN.y0, VEIN.y0 + VEIN.fh, cl, (x, y) => {
    const row = y - VEIN.y0;
    if (row === 0) return K1;
    if (row === VEIN.fh - 3) return K1;                                 // водосток
    return hh(x, y, 97) < 0.04 ? S2 : S0;
  });
}

// ═══ ХОД МХА: круглый лаз, стены в подушках мха (канон U6) ═══
// Подушки — кочками по дальней стене в три ряда: верх и левый бок к свету, низ в
// тень, между ними чёрные щели, под сводом порода. Пол — ковёр мха, ближний срез —
// мох свисает прядями. У норы мох сухой и тёплый: рыжее и светлее (переход — 48 точек)
const CUSH = [], CB = 8, CBK = new Map();
{
  let k = 0;
  for (let x = MOSS.x0 - 6; x < MOSS.x1 + 6; k++) {
    const r0 = 3.2 + hh(k, 1, 121) * 3.4;
    CUSH.push({ x: x + hh(k, 2, 121) * 3, d: 3 + hh(k, 3, 121) * 7, r: r0 });
    CUSH.push({ x: x + 2 + hh(k, 5, 121) * 4, d: 9 + hh(k, 6, 121) * (MOSS.wh - 15), r: r0 * 0.9 });
    CUSH.push({ x: x + 1 + hh(k, 7, 121) * 5, d: MOSS.wh - 7 + hh(k, 8, 121) * 2, r: r0 * 0.7 });   // под сводом — помельче
    x += r0 * (1.15 + hh(k, 4, 121) * 0.45);
  }
  for (const c of CUSH) {
    const b = Math.floor(c.x / CB);
    for (let i = b - 1; i <= b + 1; i++) { if (!CBK.has(i)) CBK.set(i, []); CBK.get(i).push(c); }
  }
}
const mossDry = x => Math.max(0, Math.min(1, (x - MOSS.dry + 24) / 48));
function mossBand(x, d, H) {
  if (d > H - 2) return K1;                                             // свод в тени
  if (d > H - 5) return hh(x, d, 122) < 0.3 ? K2 : K1;                  // порода под сводом
  let best = 0, cu = null;
  for (const c of CBK.get(Math.floor(x / CB)) || []) {
    const sc = c.r - Math.hypot(x + 0.5 - c.x, (d - c.d) * 1.2);
    if (sc > best) { best = sc; cu = c; }
  }
  const dry = hh(x, d, 123) < mossDry(x);
  if (!cu) return d < 3 ? K2 : K1;                                      // щель между подушками
  const v = (d - cu.d) / cu.r, u = (x + 0.5 - cu.x) / cu.r;
  if (best < 0.9) return dry ? K2 : MG_D;                               // край подушки
  if (v > 0.4 || (u < -0.35 && v > -0.1)) return dry ? (hh(x, d, 133) < 0.15 ? L2 : RUST_L) : MG_L;   // верх и левый бок — к свету
  if (v < -0.45) return dry ? BR2 : MG_D;                               // низ — в тени
  return dry ? RUST : hh(x, d, 124) < 0.08 ? MG_L : MG;
}
function mossWalls(cl) {
  for (let x = Math.max(MOSS.x0, cl.x0); x < Math.min(MOSS.x1, cl.x1); x++) {
    const y0 = mossY(x);
    col(x, y0 - MOSS.wh, y0, cl, y => mossBand(x, y0 - y, MOSS.wh));
  }
}
const MOSS_LIP = [MG_L, MG, MG_D, K2, K1], DRY_LIP = [RUST_L, RUST, BR2, K2, K1];
function mossLip(cl) {
  for (let x = Math.max(MOSS.x0 - 6, cl.x0); x < Math.min(MOSS.x1 + 6, cl.x1); x++) {
    const yb = mossY(Math.max(MOSS.x0, Math.min(MOSS.x1 - 1, x))) + MOSS.fh, dry = hh(x, 0, 125) < mossDry(x);
    const lp = dry ? DRY_LIP : MOSS_LIP, hang = hh(x, 1, 126) < 0.2 ? 1 + q(hh(x, 2, 126) * 2) : 0;
    col(x, yb, yb + T.LIP + hang, cl, y => { const row = y - yb; return row < T.LIP ? lp[row] : dry ? BR2 : MG_D; });   // пряди свисают
  }
}
function mossFloor(cl) {
  for (let x = Math.max(MOSS.x0, cl.x0); x < Math.min(MOSS.x1, cl.x1); x++) {
    const y0 = mossY(x);
    col(x, y0, y0 + MOSS.fh, cl, y => {
      const fy = y - y0, dry = hh(x, y, 127) < mossDry(x), n = hh(x >> 1, y >> 1, 128), f = hh(x, y, 134);   // комками по 2 точки
      if (fy === 0) return K1;
      if (fy === 1) return dry ? BR2 : K2;
      if (dry) return f < 0.03 ? L2 : n < 0.38 ? RUST_L : RUST;          // сухой, тёплый
      return f < 0.025 ? MG_L : n < 0.45 ? MG : MG_D;                    // ковёр мха
    });
  }
}
// торцы лаза — стенка мха, к своду скруглена
const MOSS_END = [K2, MG_D, MG, MG, MG_D, K1], DRY_END = [K2, BR2, RUST, RUST_L, RUST, K1], END_CUT = [0, 0, 0, 1, 2, 4];
function mossEnds(cl) {
  for (const east of [false, true]) {
    const y0 = mossY(east ? MOSS.x1 - 1 : MOSS.x0), pal = east ? DRY_END : MOSS_END;
    for (let i = 0; i < 6; i++) {
      const x = east ? MOSS.x1 + i : MOSS.x0 - 1 - i;
      col(x, y0 - MOSS.wh + END_CUT[i], y0 + MOSS.fh + T.LIP, cl, () => pal[i]);
    }
  }
}
const inMossChunk = cl => cl.x1 > MOSS.x0 - 12 && cl.x0 < MOSS.x1 + 12 && cl.y1 > MOSS.base - 60 && cl.y0 < MOSS.base + 60;

// ═══ КРУГЛЫЙ ПРОЁМ: стена хозяина вне круга и обод кольца ═══
function hostBand(host, x, y) {
  if (host.ew) return ewBandColor(host, x, y);
  const R = host;
  return BANDS[R.mat](x, R.y0 - y, R.wh);
}
function arch(p, cl) {
  const { cx, yb, R, H, host } = p;
  for (let x = Math.floor(cx - R - 2); x <= Math.ceil(cx + R + 2); x++) {
    const dx = x + 0.5 - cx;
    const hc = Math.abs(dx) < R ? Math.sqrt(R * R - dx * dx) : -1;
    const ho = Math.abs(dx) < R + 2 ? Math.sqrt((R + 2) * (R + 2) - dx * dx) : -1;
    if (ho < 0) continue;
    col(x, yb - H, yb, cl, y => {
      const h = yb - y;
      if (h <= hc) return null;                                         // проём
      if (h <= ho) return h > hc + 1.2 ? S1 : K1;                       // обод кольца; внутренняя кромка — в тень
      return hostBand(host, x, y);
    });
  }
}

// ═══ ПИКСЕЛЬНЫЕ БУКВЫ (мел, баллончик, трафарет цифр) ═══
const FONT = {
  Д: ['.XXX.', '.X.X.', '.X.X.', 'XXXXX', 'X...X'], У: ['X..X', 'X..X', '.XXX', '...X', 'XXX.'], Р: ['XX.', 'X.X', 'XX.', 'X..', 'X..'],
  О: ['.XX.', 'X..X', 'X..X', 'X..X', '.XX.'], В: ['XX.', 'X.X', 'XX.', 'X.X', 'XX.'], Е: ['XXX', 'X..', 'XX.', 'X..', 'XXX'],
  Н: ['X.X', 'X.X', 'XXX', 'X.X', 'X.X'], И: ['X..X', 'X..X', 'X.XX', 'XX.X', 'X..X'], С: ['.XX', 'X..', 'X..', 'X..', '.XX'],
  Т: ['XXX', '.X.', '.X.', '.X.', '.X.'], ',': ['.', '.', '.', 'X', 'X'], ' ': ['..', '..', '..', '..', '..'],
  К: ['X.X', 'X.X', 'XX.', 'X.X', 'X.X'], Л: ['.XXX', '.X.X', '.X.X', '.X.X', 'XX.X'], Ь: ['X..', 'X..', 'XX.', 'X.X', 'XX.'],
  А: ['.X.', 'X.X', 'XXX', 'X.X', 'X.X'], Ш: ['X.X.X', 'X.X.X', 'X.X.X', 'X.X.X', 'XXXXX'], Б: ['XXX', 'X..', 'XX.', 'X.X', 'XX.'],
  Я: ['.XX', 'X.X', '.XX', 'X.X', 'X.X'], '—': ['....', '....', 'XXXX', '....', '....'],
  I: ['XXX', '.X.', '.X.', '.X.', 'XXX'], A: ['.X.', 'X.X', 'XXX', 'X.X', 'X.X'], '!': ['X', 'X', 'X', '.', 'X'],
  S: ['.XX', 'X..', '.X.', '..X', 'XX.'], H: ['X.X', 'X.X', 'XXX', 'X.X', 'X.X'], U: ['X.X', 'X.X', 'X.X', 'X.X', 'XXX'],
  Ы: ['X..X', 'X..X', 'XX.X', 'X.XX', 'XX.X'], Х: ['X.X', 'X.X', '.X.', 'X.X', 'X.X'],
  Г: ['XXX', 'X..', 'X..', 'X..', 'X..'], 'м': ['...', '...', 'X.X', 'XXX', 'X.X'],
  B: ['XX.', 'X.X', 'XX.', 'X.X', 'XX.'], D: ['XX.', 'X.X', 'X.X', 'X.X', 'XX.'], G: ['.XX', 'X..', 'X.X', 'X.X', '.XX'], O: ['.X.', 'X.X', 'X.X', 'X.X', '.X.'], T: ['XXX', '.X.', '.X.', '.X.', '.X.'], '-': ['...', '...', 'XXX', '...', '...'], W: ['X...X', 'X...X', 'X.X.X', 'X.X.X', '.X.X.'],
  0: ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'], 1: ['.X', 'XX', '.X', '.X', '.X'], 2: ['XX.', '..X', '.X.', 'X..', 'XXX'],
  3: ['XX.', '..X', '.X.', '..X', 'XX.'], 4: ['X.X', 'X.X', 'XXX', '..X', '..X'], 5: ['XXX', 'X..', 'XX.', '..X', 'XX.'],
  6: ['.XX', 'X..', 'XX.', 'X.X', '.X.'], 7: ['XXX', '..X', '.X.', '.X.', '.X.'], 8: ['.X.', 'X.X', '.X.', 'X.X', '.X.'], 9: ['.X.', 'X.X', '.XX', '..X', 'XX.'],
};
// пишет слово; gap — дыры (мел, краска), seed — чтобы дыры были свои у каждой надписи
function write(word, x0, y0, c, gap = 0, seed = 1) {
  let x = x0;
  for (const ch of String(word)) {
    const g = FONT[ch] || FONT[' '];
    g.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === 'X' && hh(x + i, y0 + j, seed) >= gap) r(x + i, y0 + j, 1, 1, c); });
    x += g[0].length + 1;
  }
  return x;
}
const scrawl = (x0, y0, w, rowsN, c, seed, step = 3) => {         // строки «текста», нечитаемые на таком размере
  for (let j = 0; j < rowsN; j++) for (let x = x0; x < x0 + w; x++) if (hh(x, j, seed) < 0.62 && (x - x0) % step !== step - 1) r(x, y0 + j * 3, 1, 1, c);
};

// ═══ ВЕЩИ НА СТЕНАХ ═══
function stair(th) {
  const { x, y, w, h } = th, kind = th.stair, gy = y + h;
  const ox = x + 3, ow = w - 6, top = y + 5;
  if (kind === 'door') {                                                // дверь в церковь: доски в каменной раме
    r(ox - 2, top - 2, ow + 4, gy - top + 2, S1); r(ox + ow, top - 1, 2, gy - top + 1, S2);
    r(ox, top, ow, gy - top, BR2);
    for (let i = ox + 4; i < ox + ow; i += 5) r(i, top, 1, gy - top, K1);
    r(ox, top + 6, ow, 1, S2); r(ox, gy - 8, ow, 1, S2);                // петли — полосой
    r(ox + ow - 5, top + 15, 2, 2, AS);                                 // кольцо-ручка
    r(ox, gy - 1, ow, 1, K1);
    return;
  }
  if (kind === 'pithos' || kind === 'burrow') {                         // ход мха: круглая дыра наверх — в пифос (глина) или в нору (сухой мох; сверху — отсвет огня)
    const cx = x + w / 2, R0 = (w - 4) / 2, top = y + 2, ay = top + R0;
    const rim = kind === 'pithos' ? [RUST_L, RUST] : [RUST_L, BR2];
    for (let yy = top; yy < gy; yy++) for (let xx = x + 2; xx < x + w - 2; xx++) {
      const dx = xx + 0.5 - cx, d = yy < ay ? Math.hypot(dx, yy + 0.5 - ay) : Math.abs(dx);
      if (d > R0) continue;
      const warm = kind === 'burrow' && yy < top + 9 && hh(xx, yy, 135) < 0.55 - (yy - top) * 0.06;   // в норе сверху — отсвет огня
      r(xx, yy, 1, 1, d > R0 - 2 ? (dx < 0 ? rim[0] : rim[1]) : warm ? (yy < top + 5 ? RUST_L : RUST) : NI);
    }
    for (let i = 0; i < 5; i++) {                                       // корни ступенями вверх
      const sy = gy - 3 - i * 5, half = q(R0 - 3 - i * 0.6);
      if (sy < top + 6) break;
      r(q(cx - half + hh(i, x, 128) * 2), sy, half * 2 - 1, 1, BR2); r(q(cx - half + 1), sy + 1, half * 2 - 3, 1, K1);
    }
    if (kind === 'pithos') { r(q(cx - 4), top + 3, 8, 2, RUST); r(q(cx), top + 3, 1, 1, L1); }   // над головой — дно пифоса, щёлка
    else for (let k = 0; k < 4; k++) r(q(cx - 3 + k * 2), top + 3, 1, 1, k === 1 ? KV : L2);       // в щели над норой — угли огня
    return;
  }
  const PAL = {
    stone: [S1, S2, S0, K3], rock: [K4, K2, K3, K1], concrete: [S0, S2, S1, K3], wood: [RUST_L, BR2, RUST, K1],
  }[kind];
  // проём: рама, в глубине ступени уходят вверх в темноту
  r(ox - 2, top - 2, ow + 4, gy - top + 2, kind === 'rock' ? K2 : PAL[0]);
  r(ox + ow, top - 1, 2, gy - top + 1, PAL[1]);
  r(ox, top, ow, gy - top, NI);
  const n = 7;
  for (let i = 0; i < n; i++) {
    const sy = gy - 1 - i * 4, sh = i * 1;                              // выше — уже и темнее
    if (sy - 3 < top) break;
    const c0 = i < 2 ? PAL[0] : i < 4 ? PAL[2] : PAL[3];
    const jag = kind === 'rock' ? q(hh(i, x, 3) * 2) : 0;
    r(ox + sh + jag, sy - 1, ow - 2 * sh - jag, 2, c0);                 // проступь
    r(ox + sh, sy + 1, ow - 2 * sh, 1, i < 3 ? PAL[1] : K1);            // подступёнок
  }
  if (kind === 'wood') { r(ox + 4, top + 1, ow - 8, 1, L2); r(ox + 4, top + 1, 1, 3, K1); r(ox + ow - 5, top + 1, 1, 3, K1); }   // люк наверху
  if (kind === 'concrete') for (let i = 0; i < ow; i++) if (hh(i, x, 4) < 0.7) r(ox + i, gy - 2, 1, 1, MG_D);   // вода на нижней
}
const CL_ALL = { x0: -1e9, y0: -1e9, x1: 1e9, y1: 1e9 };
function wallThing(th) {
  if (th.stair) { stair(th); return; }
  const { x, y, w, h } = th;
  switch (th.id) {
    case 'u_moss': {                                                    // мох на стене: подушки; коробочки спор на тонких ножках
      for (let xx = x; xx < x + w; xx++) { const y0 = mossY(xx); col(xx, y0 - MOSS.wh, y0, CL_ALL, yy => mossBand(xx, y0 - yy, MOSS.wh)); }
      for (let k = 0; k < 9; k++) {
        const sx = q(x + 3 + k * 6.4 + hh(k, 1, 130) * 3), sy = mossY(sx) - 7 - q(hh(k, 2, 130) * 9);
        r(sx, sy, 1, 3, MG_L); r(sx, sy - 1, 1, 1, L1);
      }
      break;
    }
    case 'u_plaque': {                                                  // табличка на первом кольце и маркер под ней
      r(x, y, 14, 9, S1); r(x, y, 14, 1, L2); r(x + 13, y + 1, 1, 8, S2); r(x, y + 8, 14, 1, K2);
      r(x + 1, y + 1, 1, 1, K1); r(x + 12, y + 1, 1, 1, K1); r(x + 1, y + 7, 1, 1, K1); r(x + 12, y + 7, 1, 1, K1);   // болты
      scrawl(x + 3, y + 2, 8, 2, BO, 17, 4);
      scrawl(x - 1, y + 11, 18, 2, K1, 18, 5);                          // маркер проходчика
      break;
    }
    case 'u_chalk': {                                                   // ДУРОВ, ВЕРНИ / СТЕНУ / 2011 — мел, крупно
      write('ДУРОВ, ВЕРНИ', x + 1, y + 4, BO, 0.04, 21);
      write('СТЕНУ', x + 1, y + 11, BO, 0.04, 22);
      write('2011', x + 1, y + 20, L1, 0.04, 23);
      break;
    }
    case 'u_wallet': {                                                  // лист с кошельком и газетная вырезка
      r(x + 2, y + 3, 12, 14, L2); r(x + 13, y + 4, 1, 13, S0);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (hh(i, j, 25) < 0.55) r(x + 4 + i * 2, y + 5 + j * 2, 2, 2, K1);
      r(x + 4, y + 14, 8, 1, K2);                                       // адрес, стёртый ногтем
      r(x + 20, y + 6, 16, 12, AS); r(x + 35, y + 7, 1, 11, S0);
      scrawl(x + 22, y + 8, 12, 3, K2, 26, 4);
      break;
    }
    case 'u_niches': {                                                  // ниши в известняке рядами; под каждой — имя царапиной
      NICHES.forEach((n, i) => {
        r(n.x - 1, n.y - 1, n.w + 2, 1, S1); r(n.x - 1, n.y, 1, n.h, S0);   // кромка: свет слева сверху
        r(n.x, n.y, n.w, n.h, NI); r(n.x, n.y, n.w, 1, K1); r(n.x, n.y + 1, 1, n.h - 1, K0);   // глубина, свод ниши
        r(n.x + n.w, n.y, 1, n.h + 1, K2); r(n.x - 1, n.y + n.h, n.w + 2, 1, S2);   // тень справа, плита порога
        scrawl(n.x + 1, n.y + n.h + 2, n.w - 2, 1, AS, 40 + i, 3);       // имя
        if (hh(i, 3, 41) < 0.5) r(n.x + 2 + q(hh(i, 4, 41) * 4), n.y + n.h + 1, 1, 2 + q(hh(i, 5, 41) * 3), S2);   // потёк свечного века
      });
      break;
    }
    case 'u_tiers': {                                                   // табличка яруса
      r(x + 2, y + 2, 34, 14, S1); r(x + 2, y + 2, 34, 1, L2); r(x + 35, y + 3, 1, 13, S2); r(x + 2, y + 15, 34, 1, K2);
      scrawl(x + 5, y + 5, 28, 3, K2, 27, 4);
      break;
    }
    case 'u_door_cell': {                                               // дверь камеры: железо, кормушка, глазок; лампа над дверью
      r(x + 3, y + 7, 22, 31, K2); r(x + 4, y + 8, 20, 30, S2); r(x + 4, y + 8, 1, 30, S0);
      for (let j = 0; j < 4; j++) for (const dx of [6, 21]) r(x + dx, y + 11 + j * 7, 1, 1, AS);   // заклёпки
      r(x + 9, y + 21, 10, 3, K1); r(x + 9, y + 24, 10, 1, S0);         // кормушка
      r(x + 13, y + 13, 2, 1, K1);                                      // глазок
      r(x + 11, y + 1, 7, 5, K2); r(x + 12, y + 2, 5, 3, MG_L); r(x + 13, y + 3, 3, 1, TI);   // лампа: ровно, не мигает
      r(x + 11, y + 6, 7, 1, K1); r(x + 14, y, 1, 1, K1);
      break;
    }
    case 'u_door_wood': {                                               // деревянная дверь в дальнем углу; карандаш над ней
      r(x + 6, y + 8, 16, 26, RUST); for (let i = x + 9; i < x + 22; i += 4) r(i, y + 8, 1, 26, BR2);
      r(x + 6, y + 8, 1, 26, RUST_L); r(x + 5, y + 7, 18, 1, K1); r(x + 22, y + 8, 1, 26, K1);
      r(x + 6, y + 27, 16, 7, MG_D);                                    // разбухло от воды
      r(x + 18, y + 19, 1, 2, AS);
      scrawl(x + 4, y + 2, 20, 2, L2, 28, 3);
      break;
    }
    case 'u_graffiti': {                                                // «Iä! Iä! Shub—» баллончиком, обрывается
      write('IA!IA!', x + 2, y + 4, AS, 0.08, 29);
      r(x + 6, y + 2, 1, 1, AS); r(x + 8, y + 2, 1, 1, AS); r(x + 18, y + 2, 1, 1, AS); r(x + 20, y + 2, 1, 1, AS);   // точки над «а»
      write('SHUB-', x + 2, y + 12, AS, 0.08, 30);
      r(x + 5, y + 17, 1, 3, AS); r(x + 13, y + 17, 1, 2, AS);          // потёки
      break;
    }
    case 'u_frost': scrawl(x + 2, y + 4, 62, 3, BO, 31, 4); break;      // опись инеем
    case 'u_frost_line': scrawl(x + 2, y + 7, 34, 1, BO, 32, 4); break;
    case 'u_godot': godot(th); break;
    case 'u_cut_catacomb': case 'u_cut_sewer': case 'u_cut_shelter': case 'u_cut_metro': cutThing(th); break;
    case 'u_spiral': spiral(th); break;
    case 'u_screen': {                                                  // окно-экран: рама, шторы; лес — живой, поверх
      r(x + 2, y + 4, 80, 30, RUST); r(x + 2, y + 4, 80, 1, RUST_L); r(x + 81, y + 5, 1, 29, BR2);
      r(x + 5, y + 7, 74, 24, K1);
      for (let i = 0; i < 6; i++) { r(x + i, y + 2, 1, 33, i & 1 ? L1 : L2); r(x + 79 + i, y + 2, 1, 33, i & 1 ? L2 : L1); }   // шторы
      r(x - 1, y + 1, 87, 2, S2);                                       // карниз
      break;
    }
    case 'u_cans': {                                                    // стеллаж: банки рядами, на каждой — дата
      r(x + 2, y + 2, 2, 38, S2); r(x + 72, y + 2, 2, 38, S2);
      for (let sh = 0; sh < 3; sh++) {
        const sy = y + 12 + sh * 12;
        r(x + 2, sy, 72, 2, S0); r(x + 2, sy, 72, 1, AS);
        for (let k = 0; k < 16; k++) {
          if (hh(k, sh, 71) < 0.12) continue;                           // где-то уже брали
          const cx = x + 5 + k * 4;
          r(cx, sy - 6, 3, 6, S1); r(cx, sy - 6, 3, 1, AS); r(cx, sy - 4, 3, 2, L2); r(cx + 1, sy - 3, 1, 1, K2);
        }
      }
      break;
    }
    case 'u_kola': {                                                    // устье: крышка заварена, болты по кругу, ржа
      const cx = x + 12, cy = y + 12;
      G.globalAlpha = 0.5; r(cx - 10, cy + 6, 21, 4, K1); G.globalAlpha = 1;
      for (let yy = cy - 11; yy <= cy + 11; yy++) for (let xx = cx - 11; xx <= cx + 11; xx++) {
        const dx = xx + 0.5 - cx, dy = (yy + 0.5 - cy) * 1.35, d = Math.hypot(dx, dy);
        if (d > 10.5) continue;
        r(xx, yy, 1, 1, d > 8.5 ? (dx + dy < -4 ? AS : dx + dy < 5 ? S1 : S2) : d > 6.5 && d < 7.6 ? K3 : hh(xx, yy, 48) < 0.12 ? RUST : S0);
      }
      for (let k = 0; k < 12; k++) {                                    // болты по кругу
        const a = k / 12 * Math.PI * 2, bx = q(cx + Math.cos(a) * 9.4), by = q(cy + Math.sin(a) * 9.4 / 1.35);
        r(bx, by, 1, 1, K1); if (Math.sin(a) < 0) r(bx, by - 1, 1, 1, AS);
      }
      r(cx - 1, cy - 1, 3, 2, S2);                                      // шов сварки посередине
      break;
    }
    case 'u_onkalo_sign': {                                             // плита: семь языков и рисунок — лицо в ужасе
      r(x + 2, y + 4, 80, 34, K2); r(x + 3, y + 5, 78, 32, S1); r(x + 3, y + 5, 78, 1, L2); r(x + 80, y + 6, 1, 31, S0);
      for (let k = 0; k < 7; k++) {
        const yy = y + 8 + k * 4;
        if (k === 4) { for (let i = 0; i < 12; i++) if (hh(i, k, 51) < 0.85) { r(x + 7 + i * 4, yy, 3, 3, K1); r(x + 8 + i * 4, yy + 1, 1, 1, S1); } continue; }   // иероглифы
        if (k === 5) { for (let i = 0; i < 46; i++) { r(x + 53 - i, yy + 1 + (hh(i, k, 52) < 0.3 ? -1 : 0), 1, 1, K1); if (hh(i, k, 53) < 0.12) r(x + 53 - i, yy - 1 + (i & 2), 1, 1, K1); } continue; }   // вязь справа налево, с точками
        for (let i = 0; i < 46; i++) if (hh(i, k, 54 + k) < 0.66 && (i + k) % (4 + (k % 3)) !== 0) r(x + 7 + i, yy, 1, 2, K1);   // строки букв
      }
      // рисунок: лицо в ужасе — овал, глаза, рот кругом; руки к щекам
      const fx = x + 64, fy = y + 10;
      for (const [dx, dy] of [[3, 0], [4, 0], [5, 0], [2, 1], [6, 1], [1, 2], [7, 2], [1, 3], [7, 3], [1, 4], [7, 4], [1, 5], [7, 5], [1, 6], [7, 6], [2, 7], [6, 7], [2, 8], [6, 8], [3, 9], [4, 9], [5, 9]]) r(fx + dx, fy + dy, 1, 1, K1);
      r(fx + 3, fy + 3, 1, 1, K1); r(fx + 5, fy + 3, 1, 1, K1); r(fx + 4, fy + 5, 1, 2, K1); r(fx + 3, fy + 6, 1, 1, K1); r(fx + 5, fy + 6, 1, 1, K1);
      r(fx - 1, fy + 4, 1, 4, K1); r(fx + 9, fy + 4, 1, 4, K1);
      for (let i = 0; i < 9; i++) r(fx + i, fy + 14 + (i & 1), 1, 1, K1);  // под лицом — волна: «опасно»
      break;
    }
    case 'u_board': {                                                   // табло перекидное: «следующее отправление — скоро»
      r(x + 10, y, 1, 6, S2); r(x + 50, y, 1, 6, S2);                   // висит на тягах
      r(x, y + 6, 60, 26, K2); r(x + 1, y + 7, 58, 24, K1); r(x, y + 6, 60, 1, S0);
      for (let i = 0; i < 13; i++) { r(x + 4 + i * 4, y + 10, 3, 5, K2); r(x + 4 + i * 4, y + 12, 3, 1, K1); if (hh(i, 0, 46) < 0.8) r(x + 5 + i * 4, y + 11, 1, 3, S2); }
      for (let i = 0; i < 5; i++) { r(x + 9 + i * 9, y + 18, 7, 9, K2); r(x + 9 + i * 9, y + 22, 7, 1, K1); }
      let lx = x + 10; for (const ch of 'СКОРО') { write(ch, lx, y + 20, L2, 0, 47); lx += 9; }
      break;
    }
    case 'u_meter': {                                                   // счётчик; провод — вниз к капсуле
      r(x + 4, y + 4, 14, 18, K2); r(x + 5, y + 5, 12, 16, S2); r(x + 5, y + 5, 12, 1, S0);
      r(x + 7, y + 8, 8, 3, AS);                                        // окошко диска (метка — живая)
      for (let i = 0; i < 4; i++) r(x + 7 + i * 2, y + 14, 1, 2, K1);   // барабанчики
      r(x + 10, y + 22, 1, 18, K1);
      break;
    }
  }
}

// ═══ ЩИТ «ГОДО»: проходка встала ═══
// Видно сзади: туннель кончается машиной. Щит — цилиндр во всю выработку,
// уходит к забою; у самой породы чуть шире — режущая голова. Хвост щита —
// круг к зрителю: обод, кольцо эректора, домкраты по кругу, в чёрной середине —
// шнек. Перед хвостом на полотне — гентри: рама, лента, пульт со стопкой
// графиков. На борту трафаретом — GODOT, ниже краской от руки: «сколько
// делал — столько ошибался» (слово автора). Свет слева.
function godot(th) {
  const tb = TUBES.find(tb => tb.id === 'godot'), cx = tb.x0 + T.FW / 2, yb = tb.y0, R = T.FW / 2 + T.SW, L = 44;
  const yc = yb - L;                                                    // земля у забоя
  // режущая голова у породы: обод шире щита
  for (let x = cx - R - 2; x <= cx + R + 2; x++) {
    const dx = x + 0.5 - cx, h2 = Math.sqrt(Math.max(0, (R + 2) ** 2 - dx * dx)), h = Math.abs(dx) < R ? Math.sqrt(R * R - dx * dx) : 0;
    for (let y = Math.round(yc - R - h2); y < Math.round(yc - R - h) + 1; y++) r(x, y, 1, 1, Math.abs(dx) < R * 0.4 ? S2 : K3);
  }
  // щит: верх цилиндра уходит к забою — полоса по дуге; середина к свету; кольцевые рёбра
  for (let x = cx - R; x < cx + R; x++) {
    const dx = x + 0.5 - cx, h = Math.sqrt(Math.max(0, R * R - dx * dx)), u = Math.abs(dx) / R;
    const c = dx < 0 ? (u < 0.25 ? AS : u < 0.6 ? S1 : u < 0.88 ? S0 : S2) : (u < 0.2 ? S1 : u < 0.55 ? S0 : u < 0.85 ? S2 : K2);
    const y0 = Math.round(yc - R - h), y1 = Math.round(yb - R - h);
    r(x, y0, 1, y1 - y0, c);
    for (let k = 1; k < 4; k++) r(x, y0 + k * 11, 1, 1, K2);           // рёбра
    if (hh(x, 3, 41) < 0.12) r(x, y0 + 2 + q(hh(x, 4, 41) * (L - 4)), 1, 1, RUST);   // ржа
  }
  write('GODOT', cx - 9, yc - R - R + 4, L2, 0.06, 40);                 // на борту — трафаретом
  // ниже — краской от руки (слово автора)
  ['СКОЛЬКО', 'ДЕЛАЛ —', 'СТОЛЬКО', 'ОШИБАЛСЯ'].forEach((s, i) => {
    const w = [...s].reduce((a, ch) => a + (FONT[ch] || FONT[' '])[0].length + 1, -1);
    write(s, cx - (w >> 1) + (i & 1), yc - R - R + 12 + i * 6, BO, 0.05, 44 + i);
  });
  // хвост щита: круг к зрителю
  const fy = yb - R;
  for (let y = yb - 2 * R; y < yb; y++) for (let x = cx - R; x < cx + R; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - fy, d = Math.hypot(dx, dy);
    if (d > R) continue;
    let c;
    if (d > R - 2) c = dx + dy < -6 ? AS : dx + dy < 6 ? S1 : S2;       // обод: слева сверху к свету
    else if (d > R - 6) c = hh(x, y, 42) < 0.08 ? K2 : S0;              // юбка хвоста
    else if (d > R - 8) c = K2;                                          // щётки уплотнения
    else if (d > R - 11) c = S2;
    else if (d > R - 13) c = K2;                                         // кольцо эректора
    else c = K1;                                                          // чёрная середина
    r(x, y, 1, 1, c);
  }
  for (let k = 0; k < 8; k++) {                                         // домкраты по кругу
    const a = (k + 0.5) / 8 * Math.PI * 2, x = q(cx + Math.cos(a) * (R - 9.5)), y = q(fy + Math.sin(a) * (R - 9.5));
    r(x - 1, y - 1, 3, 3, K2); r(x - 1, y - 1, 1, 1, AS);
  }
  for (let k = 0; k < 14; k++) {                                        // шнек: из середины вниз-вправо
    const x = cx - 5 + k, y = fy - 6 + k;
    r(x, y, 3, 2, k % 3 ? K3 : S2);
  }
  // гентри перед хвостом: рама на четырёх стойках, лента посередине, пульт справа
  const gy0 = yb + 12, gy1 = yb + 34, H = 20;
  for (let i = 0; i < 26; i++) if (hh(i, 1, 43) < 0.5) r(cx - 14 + i, yb + 2 + q(hh(i, 2, 43) * 36), 1, 1, hh(i, 3, 43) < 0.5 ? K4 : K3);   // порода с ленты
  for (const [px, py] of [[cx - 13, gy0], [cx + 11, gy0]]) { r(px, py - H, 2, H, K2); r(px, py - H, 1, H, S1); }
  r(cx - 13, gy0 - H, 26, 2, K2); r(cx - 13, gy0 - H, 26, 1, S0);       // дальняя поперечина
  r(cx - 13, gy0 - H, 2, gy1 - gy0, K2); r(cx + 11, gy0 - H, 2, gy1 - gy0, K2);   // продольные балки
  r(cx - 3, yb - 10, 6, gy1 - yb + 2, K1);                              // лента — от хвоста к нам
  for (let y = yb - 9; y < gy1 - 8; y += 4) r(cx - 3, y, 6, 1, S2);
  r(cx + 4, gy1 - 12, 7, 2, S0); r(cx + 4, gy1 - 12, 7, 1, S1); r(cx + 5, gy1 - 10, 1, 4, K2); r(cx + 9, gy1 - 10, 1, 4, K2);   // пульт
  r(cx + 5, gy1 - 14, 5, 2, L2); r(cx + 6, gy1 - 15, 4, 1, BO); r(cx + 5, gy1 - 13, 5, 1, K2);   // стопка графиков
  for (const [px, py] of [[cx - 13, gy1], [cx + 11, gy1]]) { r(px, py - H, 2, H, K2); r(px, py - H, 1, H, S1); }
  r(cx - 13, gy1 - H, 26, 2, K2); r(cx - 13, gy1 - H, 26, 1, S0);       // ближняя поперечина
}

// зал поверх линии (станция): там своей стены у трубы нет
const overLine = (a, b) => ROOMS.some(R => R.x0 < b && R.x1 > a && R.y0 < LINE.y0 && R.y1 > LINE.y0);

// ═══ ОНКАЛО: шахта посреди зала, ход спиралью вниз ═══
// Смотришь в шахту сверху: видна дальняя стена, по ней виток за витком
// спускается пандус — уступы дугой, каждый ниже и темнее; спираль — уступ
// идёт под уклон с запада на восток. Внизу — темнота. Обод к свету слева.
function spiral(th) {
  const cx = th.x + th.w / 2, cy = th.y + th.h / 2, R = th.w / 2 - 2, TURN = 12;
  for (let x = Math.floor(cx - R - 2); x <= Math.ceil(cx + R + 2); x++) {
    const dx = x + 0.5 - cx;
    for (let y = Math.floor(cy - R - 2); y <= Math.ceil(cy + R + 2); y++) {
      const dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
      if (d > R + 2) continue;
      if (d > R - 1) { r(x, y, 1, 1, dy < 0 ? (dx < 0 ? AS : S1) : d > R + 1 ? K1 : K2); continue; }   // обод
      const h = Math.sqrt(Math.max(0, R * R - dx * dx));
      const z = y - (cy - h) - 6 * (dx + R) / (2 * R);                 // глубина по дальней стене; уклон витка
      if (z < 0) { r(x, y, 1, 1, K2); continue; }
      const u = ((z % TURN) + TURN) % TURN, deep = z / TURN;
      let c;
      if (u < 1.2) c = deep < 1.5 ? S1 : deep < 3.5 ? S0 : deep < 5.5 ? K3 : K2;   // уступ пандуса
      else if (u < 2.4) c = deep < 3.5 ? S2 : K2;                       // кромка — в тень
      else c = deep < 1.5 ? S0 : deep < 3 ? S2 : deep < 4.5 ? K3 : deep < 6 ? K2 : deep < 7.5 ? K1 : NI;   // стена шахты
      r(x, y, 1, 1, c);
    }
  }
  // вход на пандус — с запада: обод разомкнут, полоса уходит вниз
  for (let k = 0; k < 10; k++) r(cx - R - 1 + q(k * 0.6), cy - 4 + k, 4, 1, k < 4 ? S0 : S2);
}

// ═══ ДЕКОР: номера колец, ниши, ручеёк талой воды ═══
function decor(cl) {
  const L = LINE;
  // номера колец — трафаретом, каждое десятое (счёт — от «Вавилона»: там первое)
  for (let v = 0; v < L.x1 - L.x0; v += T.RING) {
    const k = v / T.RING + 10, x = L.x1 - v;
    if (k % 10 || x < cl.x0 - 20 || x > cl.x1 + 4 || PORTALS.some(P => P.host === L && x > P.cx - P.R - 4 && x - 16 < P.cx + P.R + 4) || overLine(x - 16, x + 2) || cutAt(x - 16) || cutAt(x)) continue;
    write(String(k), x - 14, L.y0 - 14, L2, 0.15, k);
  }
  // Кольская: на стене трафаретом — СГ-3 и глубина
  if (cl.x0 < 1150 && cl.x1 > 990 && cl.y0 < 196 && cl.y1 > 166) {
    write('СГ-3', 994, 172, L2, 0.12, 49);
    write('12262 м', 1110, 172, L2, 0.12, 50);
  }
  // облако: ниша водопада в стене и бассейн у стены
  if (cl.x0 < 1730 && cl.x1 > 1680 && cl.y0 < 212 && cl.y1 > 150) {
    r(1690, 158, 30, 42, K1); r(1689, 157, 32, 1, S1); r(1689, 158, 1, 42, S1); r(1720, 158, 1, 42, S2);
    r(1686, 199, 38, 11, S1); r(1686, 199, 38, 1, AS); r(1688, 201, 34, 7, MG); r(1688, 201, 34, 1, MG_L); r(1686, 209, 38, 1, K2);
  }
  // бункер: этаж и гермодверь у входа — круглая, открыта
  if (cl.x0 < 816 && cl.x1 > 604 && cl.y0 < 720 && cl.y1 > 676) {
    r(790, 684, 22, 11, S2); r(791, 685, 20, 9, S1); write('-15', 795, 687, K1);
    const dx0 = 618, dy0 = 702;
    for (let yy = dy0 - 12; yy <= dy0 + 12; yy++) for (let xx = dx0 - 12; xx <= dx0 + 12; xx++) {
      const d = Math.hypot(xx + 0.5 - dx0, (yy + 0.5 - dy0) * 1.1);
      if (d > 12) continue;
      r(xx, yy, 1, 1, d > 10.5 ? (xx < dx0 ? AS : S2) : d > 9 ? K2 : d < 3 ? S2 : hh(xx, yy, 72) < 0.05 ? RUST : S1);
    }
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; r(q(dx0 + Math.cos(a) * 7), q(dy0 + Math.sin(a) * 7 / 1.1), 1, 1, K1); }   // засовы
  }
  // станция: имя на стене
  if (cl.x0 < 1815 && cl.x1 > 1770 && cl.y0 < 380 && cl.y1 > 364) {
    r(1772, 366, 40, 11, S2); r(1773, 367, 38, 9, S1); r(1773, 367, 38, 1, AS);
    write('ВАВИЛОН', 1777, 369, K1);
  }
  // аварийные ниши с мёртвым телефоном
  for (const nx of [760, 1560]) {
    if (nx + 16 < cl.x0 || nx > cl.x1) continue;
    r(nx, L.y0 - 18, 16, 14, S2); r(nx + 1, L.y0 - 17, 14, 12, K1);
    r(nx + 5, L.y0 - 14, 6, 7, S2); r(nx + 6, L.y0 - 13, 4, 2, K2); r(nx + 6, L.y0 - 10, 1, 2, AS);
  }
  // крипта: из-под ларей сочится талая вода — ручеёк на восток, в жилу
  for (let x = 396; x < 452; x++) { const y = 304 + q(Math.sin(x * 0.27) * 1.5) - (x > 430 ? 6 : q((x - 396) / 6)); r(x, y, 1, 1, MG_D); }
}

function drawStatic(cl) {
  rock(cl);
  for (const R of ROOMS) roomWalls(R, cl);
  veinWalls(cl);
  ewWalls(LINE, cl);
  for (const R of ROOMS) roomLip(R, cl);
  veinLip(cl); ewLip(LINE, cl);
  for (const tb of NS) nsWalls(tb, cl);
  for (const R of ROOMS) roomFloor(R, cl);
  veinFloor(cl); ewFloor(LINE, cl);
  if (inMossChunk(cl)) { mossWalls(cl); mossLip(cl); mossFloor(cl); mossEnds(cl); }
  for (const tb of NS) nsFloor(tb, cl);
  for (const p of PORTALS) arch(p, cl);
  for (const th of THINGS) if (th.wall && th.x < cl.x1 && th.x + th.w > cl.x0 && th.y < cl.y1 && th.y + th.h > cl.y0) wallThing(th);
  decor(cl);
}

// ═══ ЗАПЕКАНИЕ КУСКАМИ ═══
const CH = 256, NX = Math.ceil(UW / CH), NY = Math.ceil(UH / CH);
const chunks = new Map();
function canvas(w, h) {
  if (typeof document === 'undefined' || !document.createElement) return null;
  const c = document.createElement('canvas');
  if (!c || typeof c.getContext !== 'function') return null;
  c.width = w; c.height = h;
  return c;
}
function chunk(i, j) {
  const key = i * 64 + j;
  let c = chunks.get(key);
  if (c !== undefined) return c;
  c = canvas(CH, CH);
  if (c) {
    const g = c.getContext('2d'), prev = G;
    g.imageSmoothingEnabled = false;
    g.translate(-i * CH, -j * CH);
    G = g;
    try { drawStatic({ x0: i * CH, y0: j * CH, x1: (i + 1) * CH, y1: (j + 1) * CH }); } finally { G = prev; }
  }
  chunks.set(key, c);
  return c;
}
function drawStaticView(g, camX, camY, vw, vh) {
  const i0 = Math.max(0, Math.floor(camX / CH)), i1 = Math.min(NX - 1, Math.floor((camX + vw) / CH));
  const j0 = Math.max(0, Math.floor(camY / CH)), j1 = Math.min(NY - 1, Math.floor((camY + vh) / CH));
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const c = chunk(i, j);
    if (c) g.drawImage(c, i * CH, j * CH);
    else { G = g; drawStatic({ x0: Math.max(i * CH, camX), y0: Math.max(j * CH, camY), x1: Math.min((i + 1) * CH, camX + vw), y1: Math.min((j + 1) * CH, camY + vh) }); }
  }
  // впрок: один соседний кусок за кадр
  for (let j = j0 - 1; j <= j1 + 1; j++) for (let i = i0 - 1; i <= i1 + 1; i++) {
    if (i < 0 || j < 0 || i >= NX || j >= NY || chunks.has(i * 64 + j)) continue;
    chunk(i, j); return;
  }
}
// ═══ ВЕЩИ НА ПОЛУ (по глубине с героем) ═══
const ARCHS = new Map();
function archSprite(g, p) {                       // перемычка проёма — поверх героя, когда он за стеной
  let c = ARCHS.get(p);
  const x0 = Math.floor(p.cx - p.R - 2), y0 = p.yb - p.H, w = Math.ceil(2 * p.R + 6), h = p.H;
  if (c === undefined) {
    c = canvas(w, h);
    if (c) {
      const cg = c.getContext('2d'), prev = G;
      cg.translate(-x0, -y0); G = cg;
      try { arch(p, { x0, y0, x1: x0 + w, y1: y0 + h }); } finally { G = prev; }
    }
    ARCHS.set(p, c);
  }
  if (c) g.drawImage(c, x0, y0);
  else { G = g; arch(p, { x0, y0, x1: x0 + w, y1: y0 + h }); }
}
function chest(x, gy, open) {                     // ларь: крышка сверху, перед, бирка; на кромке — иней
  if (open) {
    r(x + 1, gy - 22, 14, 9, K4); r(x + 1, gy - 22, 14, 1, S0); r(x + 1, gy - 14, 14, 1, K1);   // крышка откинута
    r(x, gy - 13, 16, 5, K1); r(x + 1, gy - 12, 14, 3, NI);             // пусто
  } else {
    r(x, gy - 13, 16, 5, K3); r(x, gy - 13, 16, 1, S0);
    for (let i = 0; i < 16; i++) if (hh(i, x, 33) < 0.5) r(x + i, gy - 13, 1, 1, i & 1 ? BO : AS);
  }
  r(x, gy - 8, 16, 8, K4); r(x, gy - 8, 1, 8, S0); r(x + 15, gy - 8, 1, 8, K2);
  r(x + 2, gy - 8, 1, 8, S2); r(x + 13, gy - 8, 1, 8, S2);              // оковка
  r(x + 8, gy - 7, 1, 1, K1); r(x + 6, gy - 6, 5, 2, L2);              // бирка на шнурке
  if (open) r(x + 7, gy - 5, 3, 1, K1);                                 // на пустом — прочерк
  r(x, gy - 1, 16, 1, K1);
}
// машина Loop: белая, двери открыты, за рулём водитель. Видна боком (как дома
// городка — фасадом), смотрит на восток; свет слева. Фары мёртвые, марок нет.
function car(th) {
  const X0 = th.solid[0], B = th.solid[3];                              // нос — на востоке, низ — по земле у края
  const p = (x, y, w, h, c) => r(X0 + x, B + y, w, h, c);
  G.globalAlpha = 0.5; p(2, -1, 62, 2, K1); G.globalAlpha = 1;          // тень
  // кабина: задняя стойка, окна, средняя, лобовое; крыша сверху
  for (let k = 0; k < 9; k++) {
    const y = -13 - k, xr = 16 + q(k * 0.7), xf = 48 - q(k * 0.8);     // наклон стоек
    p(xr, y, 2, 1, BO); p(xf - 1, y, 2, 1, BO);
    p(xr + 2, y, xf - xr - 3, 1, k > 6 ? S0 : S2);                      // стекло тусклое
  }
  p(33, -21, 2, 9, BO);                                                 // средняя стойка
  p(22, -22, 20, 1, AS); p(21, -21, 22, 1, BO);                         // крыша
  for (let k = 0; k < 5; k++) p(37 + k, -19 + k, 1, 1, S0);             // блик на стекле
  // водитель за рулём: голова и плечи в проёме передней двери, руль
  p(40, -19, 3, 4, K1); p(41, -20, 2, 1, K1); p(40, -19, 1, 1, S0);
  p(38, -15, 6, 4, K1); p(44, -15, 2, 1, S2); p(45, -16, 1, 2, S2);
  // кузов: борт, пояс к свету, порог; капот и багажник — верх светлее
  p(1, -12, 64, 8, L1); p(1, -12, 64, 1, BO); p(48, -13, 16, 1, BO); p(2, -13, 15, 1, BO);
  p(0, -11, 1, 6, S1); p(65, -11, 1, 6, S0);
  p(1, -5, 64, 1, S1); p(2, -4, 62, 1, K2);
  p(63, -11, 2, 2, S1); p(1, -10, 2, 2, S2);                            // фары и стопы — мёртвые
  // проёмы дверей открыты — внутри темно
  p(20, -12, 13, 7, K1); p(35, -12, 12, 7, K1);
  // колёса в арках
  for (const wx of [13, 52]) { p(wx - 5, -9, 11, 2, K2); p(wx - 4, -7, 9, 7, K1); p(wx - 1, -5, 3, 3, S1); p(wx, -4, 1, 1, AS); }
  // открытые двери — к зрителю, на петлях у передних кромок
  for (const [hx, w] of [[47, 9], [33, 8]]) for (let k = 0; k < w; k++) {
    const x = hx - k, d = q(k * 0.75);
    p(x, -18 + d, 1, 6, k === 0 ? BO : S2);                             // окно двери
    p(x, -12 + d, 1, 7, k === w - 1 ? S1 : k === 0 ? BO : L1);          // панель
    p(x, -5 + d, 1, 1, K2);
  }
}
// магнитофон на табурете; плёнка вытянута и тянется по полу к устью
function tape(th) {
  const x = th.x, gy = th.solid[3];
  for (let k = 0; k < 26; k++) r(x + 2 - k, gy + 3 + q(Math.sin(k * 0.55) * 2), 1, 1, k % 7 ? K1 : RUST_L);   // плёнка по полу
  r(x + 2, gy - 6, 1, 7, BR2); r(x + 12, gy - 6, 1, 7, BR2); r(x + 3, gy - 2, 9, 1, BR2);   // табурет
  r(x + 1, gy - 7, 13, 2, RUST); r(x + 1, gy - 7, 13, 1, RUST_L);
  r(x + 2, gy - 14, 11, 7, K2); r(x + 2, gy - 14, 11, 1, S0); r(x + 12, gy - 13, 1, 6, K1);   // магнитофон
  r(x + 4, gy - 12, 7, 3, S1); r(x + 5, gy - 11, 1, 1, K1); r(x + 9, gy - 11, 1, 1, K1);   // окно кассеты, катушки
  r(x + 4, gy - 9, 2, 1, S2); r(x + 7, gy - 9, 2, 1, S2); r(x + 10, gy - 9, 1, 1, S2);     // клавиши
  r(x + 5, gy - 13, 5, 1, L2);                                          // наклейка: «звуки»
  for (let k = 0; k < 6; k++) r(x + 3 - k, gy - 8 + k, 1, 1, K1);       // плёнка с края стола вниз
}
// стойка серверов: шкаф, юниты; огоньки — код, мигают (третья краска, мало)
function rack(x, gy, id) {
  r(x, gy - 26, 12, 26, K1); r(x, gy - 26, 12, 1, S2); r(x, gy - 25, 1, 25, K2); r(x + 11, gy - 25, 1, 25, K1);
  for (let u = 0; u < 7; u++) {
    const y = gy - 23 + u * 3;
    r(x + 2, y, 8, 2, K2);
    const ph = Math.floor(t / (14 + ((id * 7 + u * 13) % 23)));
    if (hh(id, u, ph) < 0.55) r(x + 3, y, 1, 1, TI);
    if (hh(id + 50, u, ph) < 0.25) r(x + 5, y, 1, 1, BO);
  }
  r(x, gy - 1, 12, 1, K2);
}
const RACKS_N = [], RACKS_S = [];
for (let x = 1460; x + 12 <= 1702; x += 14) RACKS_N.push(x);
for (let x = 1460; x + 12 <= 1572; x += 14) RACKS_S.push(x);
for (let x = 1640; x + 12 <= 1702; x += 14) RACKS_S.push(x);
// пальма в кадке
function palm(x, gy) {
  r(x - 4, gy - 6, 9, 6, RUST); r(x - 4, gy - 6, 9, 1, RUST_L); r(x + 4, gy - 5, 1, 5, BR2);
  r(x, gy - 18, 1, 12, BR2); r(x - 1, gy - 12, 1, 1, RUST);
  for (const [dx, dy, dir] of [[-1, -18, -1], [1, -18, 1], [0, -19, -1], [0, -19, 1]]) for (let k = 0; k < 7; k++) r(x + dx + dir * k, gy + dy + q(k * k * 0.12) - (dy === -19 ? 1 : 0), 1, 1, k < 2 ? MG_L : MG);
}
// диван в бункере — спинкой к нам, лицом к окну-экрану
function sofa() {
  const x = 716, gy = 792;
  G.globalAlpha = 0.5; r(x + 1, gy - 1, 58, 2, K1); G.globalAlpha = 1;
  r(x, gy - 14, 58, 12, L1); r(x, gy - 14, 58, 1, BO); r(x, gy - 3, 58, 1, S1);
  for (let k = 1; k < 3; k++) r(x + k * 19, gy - 13, 1, 9, L2);         // подушки
  r(x - 2, gy - 11, 4, 10, L2); r(x + 56, gy - 11, 4, 10, L2); r(x - 2, gy - 11, 4, 1, BO); r(x + 56, gy - 11, 4, 1, BO);   // подлокотники
  r(x + 2, gy - 2, 2, 2, K1); r(x + 54, gy - 2, 2, 2, K1);
}
const FLOOR_DRAW = {
  u_racks() { RACKS_S.forEach((x, i) => rack(x, 302, 100 + i)); },
  racksN() { RACKS_N.forEach((x, i) => rack(x, 264, i)); },
  sofa,
  u_tape: tape,
  u_car: car,
  u_ticket() {                                                          // билет на сиденье скамьи метро: картон, ближний край
    if (!under.bench) return;
    const gy = LINE.y0;
    r(1667, gy - 8, 5, 1, BO); r(1668, gy - 7, 4, 1, L2); r(1669, gy - 8, 1, 1, L2);
  },
  u_chests(th) { chest(342, 308, false); chest(360, 308, true); chest(378, 308, false); },
  chestsWest() { chest(238, 308, false); chest(256, 308, false); chest(274, 308, false); },
  u_pot(th) {                                                           // котелок у двери, полный; дужка
    const x = th.x + 3, gy = th.y + th.h - 1;
    r(x, gy - 5, 8, 5, S2); r(x, gy - 5, 1, 5, S1); r(x + 7, gy - 5, 1, 5, K2);
    r(x - 1, gy - 6, 10, 1, AS); r(x + 1, gy - 7, 6, 1, K2);
    r(x, gy - 9, 1, 3, K2); r(x + 7, gy - 9, 1, 3, K2); r(x + 1, gy - 10, 6, 1, K2);
    r(x, gy, 8, 1, K1);
  },
  u_planes(th) {                                                        // гора самолётиков из пятитысячных
    const x0 = th.x, gy = th.y + th.h - 1;
    for (let k = 0; k < 70; k++) {
      const u = hh(k, 1, 35), v = hh(k, 2, 35);
      const x = x0 + 2 + q(u * 34), hgt = 16 * (1 - Math.abs(u - 0.5) * 2);
      const y = gy - 2 - q(v * hgt);
      const c = hh(k, 3, 35);
      const cc = c < 0.07 ? KV : c < 0.3 ? RUST_L : c < 0.65 ? L2 : AS;
      r(x, y, 3, 1, cc); r(x + (k & 1 ? 0 : 2), y - 1, 1, 1, cc);
    }
    r(x0 + 2, gy, 36, 1, K1);
  },
  u_capsule(th) {                                                       // капсула под инеем: табличка WD, окошко
    const x = th.x + 2, gy = th.y + th.h - 1;
    r(x + 2, gy - 3, 44, 3, K2);                                        // подставка
    r(x, gy - 20, 48, 17, S0); r(x + 1, gy - 21, 46, 1, S1); r(x - 1, gy - 18, 1, 13, S2); r(x + 48, gy - 18, 1, 13, K2);
    r(x, gy - 20, 48, 6, S1); r(x + 4, gy - 21, 40, 1, AS);             // верх — к свету
    r(x + 18, gy - 19, 12, 3, K1); r(x + 19, gy - 18, 10, 1, MG_D);     // окошко, запотело
    r(x + 6, gy - 11, 14, 6, S1); write('WD', x + 7, gy - 11, K1);      // табличка: две буквы
    for (let i = 0; i < 48; i++) for (let j = 0; j < 17; j++) if (hh(i, j, 36) < 0.1) r(x + i, gy - 20 + j, 1, 1, hh(i, j, 37) < 0.5 ? BO : AS);   // иней
    r(x, gy - 4, 48, 1, K1);
  },
};

// ═══ ЖИВОЕ ═══
const prints = [];                                 // следы в пыли — единственная биография
let lastPrint = null, printSide = 0;
const drips = [];
const puffs = [];
const draft = [];                                  // сквозняк метро и пыль от поезда
const breath = [];                                 // вдох на пороге: сквозняк тянет пыль от уголька в глубину
// тоннель вдохнул (ритуал «Вдох на пороге»): пыль у уголька уходит внутрь, в (dx, dy)
export function inhaleDust(x, y, dx, dy) {
  for (let k = 0; k < 26; k++) {
    const v = 0.35 + Math.random() * 0.45;
    breath.push({ x: x + (Math.random() - 0.5) * 26, y: y + (Math.random() - 0.5) * 16, vx: dx * v + (Math.random() - 0.5) * 0.1, vy: dy * v + (Math.random() - 0.5) * 0.1, life: 70 + q(Math.random() * 70), w: k * 3 });
  }
}
let frost = null;                                  // иней: точки, тают у уголька, отрастают
function frostDots() {
  if (frost) return frost;
  frost = [];
  // ворс клочьями: гуще на стенах и у стен, на полу — тропа почти чистая
  const add = (x0, x1, y0, y1, dens) => {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const d = dens(x, y) * (0.3 + 1.1 * hh(x >> 3, y >> 3, 76));
      if (hh(x, y, 77) < d) frost.push({ x, y, c: hh(x, y, 78) < 0.3 ? BO : AS, a: 1 });
    }
  };
  const W = ROOMS.find(R => R.id === 'wd');
  add(W.x0, W.x1, W.y0 - W.wh, W.y1, (x, y) => {
    if (y < W.y0) return 0.1;                                           // стена
    const e = Math.min(x - W.x0, W.x1 - x, y - W.y0, W.y1 - y);
    return 0.015 + 0.08 * Math.max(0, 1 - e / 18);                      // пол: у стен гуще
  });
  const vk = x => Math.max(0, (x - VEIN.x0 - 80) / (VEIN.x1 - VEIN.x0 - 80));
  add(VEIN.x0 + 80, VEIN.x1, VEIN.y0 - VEIN.wh, VEIN.y0 + VEIN.fh, (x, y) => (y < VEIN.y0 ? 0.09 : 0.03) * vk(x));
  return frost;
}

// шаг живого: следы, капли, пар, иней (идёт в stepFx)
export function stepUnderLife(p) {
  const fx = p.x + 6, fy = p.y + 23;
  // следы: каждые 7 точек пути, левый-правый
  if (!lastPrint || Math.hypot(fx - lastPrint.x, fy - lastPrint.y) > 7) {
    if (lastPrint && !inWater(fx, fy) && placeAt(fx, fy) !== 'moss') {   // мох глушит шаги начисто — и следов не держит
      printSide ^= 1;
      prints.push({ x: q(fx + (printSide ? -2 : 1)), y: q(fy - 1 + printSide) });
      if (prints.length > 900) prints.shift();
    }
    lastPrint = { x: fx, y: fy };
  }
  // капли со свода линии — рядом с героем, редко
  if (placeAt(fx, fy) === 'tube' && Math.random() < 0.006 && drips.length < 3) {
    const L = LINE;
    if (fy > L.y0 && fy < L.y0 + T.FH) drips.push({ x: q(fx + (Math.random() - 0.5) * 160), y: L.y0 - 22, gy: L.y0 + 4 + q(Math.random() * 22), v: 0, splash: 0 });
  }
  for (let i = drips.length - 1; i >= 0; i--) {
    const d = drips[i];
    if (d.splash) { if (++d.splash > 18) drips.splice(i, 1); continue; }
    d.v += 0.18; d.y += d.v;
    if (d.y >= d.gy) { d.y = d.gy; d.splash = 1; }
  }
  // пар изо рта — в холоде
  if (under.exhale) {                                                  // выдох — дыхание считает изнанка (опись инеем)
    for (let k = 0; k < 5; k++) puffs.push({ x: p.x + 7 + (p.dir || 1) * 3, y: p.y - 1, vx: (p.dir || 1) * (0.1 + Math.random() * 0.15), vy: -0.08 - Math.random() * 0.06, life: 70 + k * 6 });
  }
  for (let i = puffs.length - 1; i >= 0; i--) { const u = puffs[i]; u.x += u.vx; u.y += u.vy; u.vx *= 0.99; if (--u.life <= 0) puffs.splice(i, 1); }
  // метро: сквозняк тянет пыль в тоннель; поезд — выдувает её наружу
  const mt = CUTS.find(c => c.id === 'metro'), mx = mt.x0 + 76;
  if (Math.abs(fx - mx) < 300 && draft.length < (under.train ? 24 : 5) && Math.random() < (under.train ? 0.5 : 0.03)) {
    draft.push(under.train ? { x: mx - 10 + Math.random() * 20, y: LINE.y0 - 4, vx: (Math.random() - 0.5) * 0.6, vy: 0.5 + Math.random() * 0.6, life: 50 }
      : { x: mx - 20 + Math.random() * 40, y: LINE.y0 + 4 + Math.random() * 20, vx: 0, vy: -0.12, life: 160 });
  }
  for (let i = draft.length - 1; i >= 0; i--) { const d = draft[i]; d.x += d.vx; d.y += d.vy; if (--d.life <= 0) draft.splice(i, 1); }
  for (let i = breath.length - 1; i >= 0; i--) { const d = breath[i]; if (d.w > 0) { d.w--; continue; } d.x += d.vx; d.y += d.vy; d.vx *= 1.01; d.vy *= 1.01; if (--d.life <= 0) breath.splice(i, 1); }
  // иней тает кольцом вокруг уголька и отрастает, когда отойдёшь
  if (under.cold > 0.05 || placeAt(fx, fy) === 'vein' || placeAt(fx, fy) === 'wd') {
    const R = 22, ex = p.x + 7, ey = p.y + 10;
    for (const f of frostDots()) {
      const dx = f.x - ex, dy = (f.y - ey) * 1.3;
      if (Math.abs(dx) < R && Math.abs(dy) < R && dx * dx + dy * dy < R * R) f.a = Math.max(0, f.a - 0.06);
      else if (f.a < 1) f.a = Math.min(1, f.a + 0.002);
    }
  }
}

function floorLife(g, camX, camY, vw, vh, p) {
  G = g;
  // следы
  G.globalAlpha = 0.7;
  for (const s of prints) if (s.x > camX - 4 && s.x < camX + vw + 4 && s.y > camY - 4 && s.y < camY + vh + 4) r(s.x, s.y, 2, 1, K1);
  G.globalAlpha = 1;
  // отблески мёртвых диодов у огонька
  const L = LINE, ex = p.x + 7, ey = p.y + 10;
  if (ey > L.y0 - 30 && ey < L.y0 + T.FH + 10) {
    for (let x = Math.floor((ex - 70) / 3) * 3; x < ex + 70; x += 3) {
      if (x < L.x0 || x >= L.x1 || PORTALS.some(P => P.host === L && Math.abs(x - P.cx) <= P.R) || overLine(x, x + 1) || cutAt(x)) continue;
      const k = 1 - Math.abs(x - ex) / 70;
      G.globalAlpha = k * k * 0.75 * (0.5 + 0.5 * under.ember); r(x, L.y0 - 15, 1, 1, AS);
    }
    G.globalAlpha = 1;
  }
  // вода подвала: рябь ползёт; вокруг идущего — круги
  const B = ROOMS.find(R => R.id === 'base');
  if (B.x1 > camX && B.x0 < camX + vw && B.y1 > camY && B.y0 < camY + vh) {
    for (let k = 0; k < 26; k++) {
      const x = B.x0 + 20 + q(hh(k, 5, 38) * (B.x1 - B.x0 - 40) + Math.sin(t * 0.01 + k) * 6), y = B.y0 + 12 + q(hh(k, 6, 38) * (B.y1 - B.y0 - 30));
      if (!inWater(x, y) || !inWater(x + 6, y)) continue;
      G.globalAlpha = 0.35 + 0.25 * Math.sin(t * 0.03 + k * 1.7);
      r(x, y, 4 + (k % 3), 1, k % 4 ? MG_L : AS);
    }
    G.globalAlpha = 1;
  }
  // облако: водопад по стене — струи бегут вниз, в бассейне рябь
  if (camX < 1724 && camX + vw > 1686 && camY < 212 && camY + vh > 150) {
    for (let i = 0; i < 28; i++) {
      const x = 1691 + i, sp = 1 + (i % 3);
      for (let y = 160; y < 200; y++) if (((y - t * sp) & 7) < 2 && hh(i, y >> 2, 58) < 0.7) r(x, y, 1, 1, (y + i) % 5 ? AS : BO);
    }
    for (let k = 0; k < 6; k++) { const x = 1690 + ((t >> 2) + k * 9) % 30; r(x, 203 + (k & 1) * 2, 3, 1, AS); }
  }
  // бункер: на экране лес шевелится (небо, дальний лес, ближние ели качаются), строки экрана
  { const s = THINGS.find(th => th.id === 'u_screen'), sx = s.x + 5, sy = s.y + 7;
    if (sx < camX + vw && sx + 74 > camX && sy < camY + vh && sy + 24 > camY) {
      r(sx, sy, 74, 9, S1); r(sx, sy + 9, 74, 4, AS);
      for (let i = 0; i < 74; i++) { const h = 3 + q(hh(i >> 2, 1, 73) * 3); r(sx + i, sy + 13 - h, 1, h, MG_L); }
      r(sx, sy + 13, 74, 11, MG);
      for (let k = 0; k < 7; k++) {
        const tx = sx + 4 + k * 11, sw = Math.sin(t * 0.018 + k * 1.3) * 1.2;
        for (let j = 0; j < 11; j++) { const w = 1 + (j >> 1); r(tx + q(sw * (1 - j / 11)) - (w >> 1), sy + 7 + j, w, 1, MG_D); }
        r(tx, sy + 18, 1, 5, K2);
      }
      if ((t >> 6) % 9 === 0) r(sx + ((t >> 1) % 74), sy + 3, 2, 1, K2);   // птица пролетела
      G.globalAlpha = 0.25; for (let y = sy; y < sy + 24; y += 2) r(sx, y, 74, 1, K1); G.globalAlpha = 1;
    } }
  // ручеёк талой воды в крипте: блик бежит к жиле
  { const x = 396 + ((t >> 1) % 56), y = 304 + q(Math.sin(x * 0.27) * 1.5) - (x > 430 ? 6 : q((x - 396) / 6)); G.globalAlpha = 0.6; r(x, y, 1, 1, MG_L); G.globalAlpha = 1; }
  // иней
  if (frost || under.cold > 0.01 || (camX < 920 && camX + vw > 500 && camY < 340 && camY + vh > 200)) {
    for (const f of frostDots()) {
      if (f.a < 0.05 || f.x < camX || f.x > camX + vw || f.y < camY || f.y > camY + vh) continue;
      G.globalAlpha = f.a * 0.65; r(f.x, f.y, 1, 1, f.c);
    }
    G.globalAlpha = 1;
  }
  // разрез эпох: вода под решёткой канализации бежит, кораблики, пар с запада
  { const sw = CUTS.find(c => c.id === 'sewer'), gx0 = sw.x0 + 40, y0 = LINE.y0 + 3, H = T.FH - 6;
    if (gx0 < camX + vw && gx0 + 24 > camX) {
      for (let k = 0; k < 14; k++) {
        const x = gx0 + ((k * 7) % 24), y = y0 + q((under.flow + k * 9) % H);   // прочитал заявление — вода течёт тише
        if ((x - gx0) % 3 && y !== y0 + (H >> 1)) { G.globalAlpha = 0.55; r(x, y, 1, 1, k & 1 ? MG_L : MG); }
      }
      G.globalAlpha = 1;
      for (const b of under.boats) {                                    // кораблик: парус и корпус, решётка поверх
        for (const [dx, dy, c] of [[1, -1, BO], [0, 0, L2], [1, 0, BO], [2, 0, L2]]) {
          const x = q(b.x + dx), y = q(b.y + dy);
          if (y >= y0 && y < y0 + H && ((x - gx0) % 3 === 0 || y === y0 + (H >> 1))) continue;
          r(x, y, 1, 1, c);
        }
      }
      if (t % 90 < 40) { const k = (t % 90) / 40; G.globalAlpha = 0.25 * (1 - k); r(gx0 + 4 + q(k * 10), y0 - q(k * 14), 2, 1, BO); G.globalAlpha = 1; }   // пар
    } }
  // метро: пыль — в тоннель (сквозняк) или из него (поезд); в тоннеле — свет окон прошёл
  { const mt = CUTS.find(c => c.id === 'metro'), mx = mt.x0 + 76;
    if (mx - 20 < camX + vw && mx + 20 > camX) {
      for (const d of draft) { G.globalAlpha = Math.min(0.4, d.life / 60); r(d.x, d.y, 1, 1, BO); }
      G.globalAlpha = 1;
      if (under.train > 30 && under.train < 210) {
        const k = (under.train * 3) % 40, a = Math.sin(Math.PI * (under.train - 30) / 180);
        G.globalAlpha = 0.5 * a; r(mx - 11 + (k % 22), LINE.y0 - 16, 4, 6, AS); r(mx - 11 + ((k + 11) % 22), LINE.y0 - 16, 4, 6, S1); G.globalAlpha = 1;
      }
    } }
  // гербарий темноты: уголёк у белой стены — на извёстке раскрывается тень пиона, крупная, дышащая
  if (under.bloom && under.bloom.x > camX - 20 && under.bloom.x < camX + vw + 20) {
    const k = Math.min(1, under.bloom.t / 90), open = k * k * (3 - 2 * k);
    peonyShadow(q(under.bloom.x), LINE.y0 - 17, (6.5 + 0.5 * Math.sin(t * 0.05)) * open, 0.65 * open);
  }
  // убежище: уголёк отражается в стекле противогазного шкафа; расписался — подпись в журнале,
  // гермодверь приоткрыта (открылась без скрипа)
  { const c = CUTS.find(k => k.id === 'shelter'), gy = LINE.y0, kx = c.x1 - 15;
    if (c.x1 > camX && c.x0 < camX + vw && camY < gy && camY + vh > gy - 30) {
      const d = Math.abs(p.x + 6 - (kx + 5));
      if (d < 110 && Math.abs(p.y + 23 - (gy + 15)) < 40) {
        G.globalAlpha = 0.7 * (1 - d / 110);                         // одна тёплая искра, едет по стеклу вслед за угольком
        r(kx + 3 + q(Math.max(-1, Math.min(1, (p.x + 6 - kx - 5) / 40))), gy - 13, 1, 1, EMBER_G); G.globalAlpha = 1;
      }
      if (under.signed) {
        r(c.x0 + 14, gy - 10, 2, 1, K1); r(c.x0 + 15, gy - 11, 1, 1, K1);   // подпись в графе «явился»
        r(c.x0 + 41, gy - 17, 2, 17, NI); r(c.x0 + 43, gy - 17, 1, 17, K2);   // щель приоткрытой гермодвери
      }
    } }
  // убежище: репродуктор шипит
  if (under.hiss > 0) {
    const sx = CUTS.find(c => c.id === 'shelter').x0 + 82, sy = LINE.y0 - 14;
    for (let k = 0; k < 4; k++) { G.globalAlpha = 0.5; r(sx - 6 + q(Math.random() * 12), sy - 6 + q(Math.random() * 10), 1, 1, Math.random() < 0.5 ? AS : S2); }
    G.globalAlpha = 1;
  }
  // ход мха: вспышки — под ногой и на шаг вперёд; мох, выросший у ног; сухой у норы тлеет сам
  if (camY + vh > MOSS.base - 40 && camY < MOSS.base + 50) {
    for (const g of moss.glows) {
      const a = g.life / GLOW, gx = q(g.x), gyy = q(g.y);
      for (let dy = -4; dy <= 4; dy++) for (let dx = -9; dx <= 9; dx++) {
        const f = 1 - Math.hypot(dx / 9, dy / 4), yy = gyy + dy, y0 = mossY(gx + dx);
        if (f <= 0 || hh(gx + dx, yy, 131) > f * 2 || yy < y0 + 1 || yy > y0 + MOSS.fh - 1) continue;
        G.globalAlpha = a * (0.35 + 0.6 * f); r(gx + dx, yy, 1, 1, g.warm ? GLOW_W : GLOW_G);
      }
    }
    G.globalAlpha = 1;
    for (const sp of moss.sprouts) { r(sp.x, sp.y, 1, 1, MG_L); if (sp.tall) r(sp.x, sp.y - 1, 1, 1, MG); }
    for (let x = MOSS.dry; x < MOSS.x1 - 2; x += 3) {
      const y0 = mossY(x), k = 0.5 + 0.5 * Math.sin(t * 0.03 + x * 0.21);
      G.globalAlpha = (0.1 + 0.16 * k) * mossDry(x); r(x, y0 + 3 + q(hh(x, 0, 132) * (MOSS.fh - 6)), 1, 1, GLOW_W);
    }
    G.globalAlpha = 1;
  }
  // брызги капель — на полу
  for (const d of drips) if (d.splash) {
    const s = d.splash;
    G.globalAlpha = 0.6 * (1 - s / 18);
    r(d.x - 1 - (s >> 3), d.y, 1, 1, AS); r(d.x + 1 + (s >> 3), d.y, 1, 1, AS); if (s < 6) r(d.x, d.y - 1, 1, 1, BO);
    G.globalAlpha = 1;
  }
}

function airLife(g, camX, camY, vw, vh, p) {
  G = g;
  for (const d of drips) if (!d.splash) { G.globalAlpha = 0.7; r(d.x, d.y, 1, 2, AS); G.globalAlpha = 1; }
  for (const u of puffs) { G.globalAlpha = Math.min(0.35, u.life / 160); r(u.x, u.y, 1 + (u.life < 40 ? 1 : 0), 1, BO); }
  for (const d of breath) if (!d.w) {                 // пылинка со следом: сквозняк виден по тому, что все летят в одну сторону
    const a = Math.min(0.6, d.life / 70);
    G.globalAlpha = a; r(d.x, d.y, 1, 1, BO);
    G.globalAlpha = a * 0.45; r(d.x - d.vx * 2.5, d.y - d.vy * 2.5, 1, 1, BO); r(d.x - d.vx * 5, d.y - d.vy * 5, 1, 1, AS);
  }
  G.globalAlpha = 1;
  // крипта дышит: раз в шесть секунд воздух уходит вверх по ступеням — пыль следом
  const st = THINGS.find(th => th.id === 'u_up_crypt'), ph = t % 360;
  if (ph < 50 && st.x > camX - 20 && st.x < camX + vw + 20) {
    for (let k = 0; k < 8; k++) {
      const u = (ph + k * 6) / 50;
      if (u > 1) continue;
      G.globalAlpha = 0.3 * (1 - u);
      r(st.x + 6 + q(hh(k, 7, 39) * 16), st.y + st.h - 2 - q(u * 30), 1, 1, BO);
    }
    G.globalAlpha = 1;
  }
  // «верхняя» вещь: на ней лежит тень цветка — минуту
  if (under.upper) {
    const th = THINGS.find(o => o.id === under.upper.id), u = under.upper.t, a = Math.min(1, u / 240, (UPPER - u) / 60);
    if (th && th.x + th.w > camX && th.x < camX + vw) peonyShadow(q(th.x + th.w / 2), q(th.y + th.h / 2) - 2, 3.5 + 0.3 * Math.sin(t * 0.05), 0.4 * a);
  }
  // перекличка ниш: проснувшаяся ниша выдыхает — пыль из зева, пока шепчет имя
  if (under.niche && !under.niche.done && under.niche.t < 240) {
    const n = nicheOf(under.niche.name), u = under.niche.t;
    for (let k = 0; k < 6; k++) {
      const s = ((u + k * 23) % 90) / 90;
      G.globalAlpha = 0.35 * (1 - s) * (1 - u / 240);
      r(n.x + 2 + q(hh(k, 9, 42) * 5) + q(s * (hh(k, 8, 42) - 0.5) * 8), n.y + n.h - 1 + q(s * 9), 1, 1, BO);
    }
    G.globalAlpha = 1;
  }
  // метка диска счётчика крутится
  const m = THINGS.find(th => th.id === 'u_meter');
  if (m.x > camX - 20 && m.x < camX + vw) r(m.x + 7 + ((t >> 3) % 8), m.y + 9, 1, 1, K1);
  // пар над котелком — несут каждый вечер, ещё тёплый
  const pot = THINGS.find(th => th.id === 'u_pot');
  if (pot.x > camX - 20 && pot.x < camX + vw + 20) {
    for (let k = 0; k < 3; k++) {
      const u = ((t + k * 40) % 120) / 120;
      G.globalAlpha = 0.25 * (1 - u); r(pot.x + 6 + q(Math.sin(u * 6 + k) * 2), pot.y - 1 - q(u * 12), 1, 1, BO);
    }
    G.globalAlpha = 1;
  }
}

// вода по пояс: подол и колени — под водой; у идущего — круги
function wade(g, p) {
  G = g;
  const fx = p.x + 6, fy = p.y + 23;
  if (!inWater(fx, fy)) return;
  const wl = q(fy - 9 + Math.sin(t * 0.08) * 0.6);
  r(p.x - 3, wl, 20, fy - wl + 1, MG);
  G.globalAlpha = 0.8; r(p.x - 4, wl, 22, 1, MG_L); G.globalAlpha = 1;
  if (p.moving) for (let k = 0; k < 2; k++) {
    const s = ((t + k * 20) % 40) / 40, R = 8 + s * 10;
    G.globalAlpha = 0.5 * (1 - s);
    for (let a = 0; a < 12; a++) { const an = a / 12 * Math.PI * 2; r(fx + Math.cos(an) * R, wl + Math.sin(an) * R * 0.4, 1, 1, MG_L); }
    G.globalAlpha = 1;
  }
}

// тень пиона по камню: шапка лепестков с зубчатым краем и прожилкой, стебель, два листа
function peonyShadow(bx, by, R, a) {
  if (a <= 0.01 || R < 1) return;
  G.globalAlpha = a;
  const RR = Math.ceil(R + 1);
  for (let dy = -RR; dy <= RR; dy++) for (let dx = -RR; dx <= RR; dx++) {
    const d = Math.hypot(dx, dy * 1.1), an = Math.atan2(dy, dx);
    if (d > R * (0.82 + 0.18 * Math.cos(6 * an + 0.4) * Math.cos(3 * an))) continue;
    if (d > R * 0.4 && d < R * 0.55 && (Math.floor(an * 2.5 + 9) & 1)) continue;   // лепестки внахлёст — просвет
    r(bx + dx, by + dy, 1, 1, K1);
  }
  const s0 = by + q(R * 0.8);
  for (let j = 1; j <= q(R * 1.3); j++) r(bx + q(Math.sin(j * 0.35) * 0.8), s0 + j, 1, 1, K1);   // стебель
  const ly = s0 + q(R * 0.7);
  r(bx - 3, ly, 3, 1, K1); r(bx - 4, ly - 1, 1, 1, K1); r(bx + 1, ly + 1, 3, 1, K1); r(bx + 4, ly, 1, 1, K1);   // листья
  G.globalAlpha = 1;
}

// ═══ КАДР ИЗНАНКИ ═══
// g — холст мира (уже сдвинут на камеру); drawHero рисует странника
export function drawUnderWorld(g, camX, camY, vw, vh, p, drawHero) {
  G = g;
  drawStaticView(g, camX, camY, vw, vh);
  floorLife(g, camX, camY, vw, vh, p);
  const list = [];
  const seen = th => th.x + th.w > camX - 8 && th.x < camX + vw + 8 && th.y + th.h > camY - 30 && th.y < camY + vh + 8;
  for (const th of THINGS) if (!th.wall && FLOOR_DRAW[th.id] && seen(th)) list.push({ k: th.solid ? th.solid[3] : th.y + th.h, th });
  if (camX < 300 && camX + vw > 230 && camY < 320 && camY + vh > 280) list.push({ k: 308, west: true });
  if (camX < 780 && camX + vw > 712 && camY < 795 && camY + vh > 776) list.push({ k: 792, sofa: true });
  if (camX < 1745 && camX + vw > 1440 && camY < 300 && camY + vh > 190) {
    list.push({ k: 264, racksN: true }, { k: 216, palm: 1672 }, { k: 216, palm: 1728 });
  }
  for (const P of PORTALS) if (P.cx + P.R > camX && P.cx - P.R < camX + vw && P.yb > camY && P.yb - P.H < camY + vh) list.push({ k: P.yb, arch: P });
  list.push({ k: p.y + 23, hero: true });
  list.sort((a, b) => a.k - b.k);
  for (const it of list) {
    if (it.hero) { drawHero(); wade(g, p); G = g; continue; }
    G = g;
    if (it.arch) archSprite(g, it.arch);
    else if (it.west) FLOOR_DRAW.chestsWest();
    else if (it.sofa) sofa();
    else if (it.racksN) FLOOR_DRAW.racksN();
    else if (it.palm) palm(it.palm, 216);
    else FLOOR_DRAW[it.th.id](it.th);
  }
  airLife(g, camX, camY, vw, vh, p);
}

// вторая краска: осмотренная вещь целиком — только её точки, без породы вокруг
export function drawUnderThing(g, th) {
  G = g;
  if (th.wall) { wallThing(th); return; }
  const f = FLOOR_DRAW[th.id];
  if (f) f(th);
}

// иней на стекле: растр инверсией — светлые точки нарастают из углов кадра
// перьями, вдоль краёв — тоньше (слой fx, складывается); середина чистая
let frostScreen = null, fsW = 0, fsH = 0;
export function drawUnderFx(fx, vw, vh) {
  const k = under.cold;
  if (k < 0.04) return;
  if (!frostScreen || fsW !== vw || fsH !== vh) {
    fsW = vw; fsH = vh;
    frostScreen = canvas(vw, vh);
    if (frostScreen) {
      const g = frostScreen.getContext('2d'), prev = G, m = Math.min(vw, vh);
      G = g;
      for (let y = 0; y < vh; y += 2) for (let x = 0; x < vw; x += 2) {
        const dx = Math.min(x, vw - x), dy = Math.min(y, vh - y);
        const ec = Math.hypot(dx, dy) / (m * 0.5), ee = Math.min(dx, dy) / (m * 0.12);
        let f = Math.max(Math.pow(Math.max(0, 1 - ec), 1.4), Math.pow(Math.max(0, 1 - ee), 2) * 0.5);
        f *= 0.45 + 0.9 * hh(x >> 3, y >> 3, 74) * hh(x >> 4, (y + x) >> 4, 75);   // перья
        const n = hh(x, y, 79);
        if (n >= f) continue;
        r(x, y, 1, 1, n < f * 0.25 ? '#5a5853' : '#33312d');
      }
      G = prev;
    }
  }
  if (!frostScreen) return;
  fx.globalAlpha = Math.min(1, k);
  fx.drawImage(frostScreen, 0, 0);
  fx.globalAlpha = 1;
}

// сброс живого при входе: прошлые следы остаются (пыль помнит), капли и пар — нет
export function resetUnderLife() { drips.length = 0; puffs.length = 0; breath.length = 0; lastPrint = null; }
