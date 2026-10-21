// ═══════════════════════════════════════
// ИЗНАНКА — рисунок (план — world/underside.js). Порода — штрихом по
// черноте; трубы Boring — дальняя половина обделки кольцами (швы колец,
// продольные швы вразбежку, мёртвые диоды, кабельный лоток по своду),
// полотно со следами шин, спереди — срез обделки; у труб с севера на юг —
// боковые стенки. Где труба входит в стену — круглый проём с ободом кольца.
// Комнаты — своим материалом: известняк крипты, казённая краска гауптвахты,
// мокрый бетон подвала, кирпич «Вавилона», иней криосклепа; жила — бетон
// коллектора и кабели на кронштейнах.
// Неподвижное запекается кусками по 256 точек (видимые — сразу, соседний —
// впрок, по одному за кадр); живое — поверх: вещи на полу по глубине,
// перемычки круглых проёмов, следы в пыли, вода, иней, который тает кольцом
// вокруг уголька, пар изо рта, капли, отблески мёртвых диодов.
// Только точки — без векторных фигур и градиентов.
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { UW, UH, T, TUBES, ROOMS, VEIN, PORTALS, THINGS, under, placeAt, coldAt, inWater } from '../world/underside.js';

const NI = '#0D0B0A', BO = '#D9CFB8', AS = '#8A8D8F', MG = '#3D4A3A', KV = '#C23B2B';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K3 = '#34302a', K4 = '#3a3328';
const L1 = '#c8b89a', L2 = '#b0a284', BR2 = '#3a2818';
const S0 = '#474442', S1 = '#5e5e5d', S2 = '#33302e';
const MG_L = '#4d5a49', MG_D = '#2f372c', TI = '#8CC63F';
const RUST = '#4a3420', RUST_L = '#6b4a2c';
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
  const d = L.y0 - y, { k, u } = ringOf(L, x);
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
    const row = y - L.y0 - T.FH;
    return ringOf(L, x).u === 0 && row < 5 ? K2 : TLIP[row];
  });
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
  brick: [K1, BR2, RUST, RUST, BR2, K1], frost: [K2, S2, S2, S2, K3, K1], loop: [K2, S0, S1, S1, S0, K1],
};
const LIPS = {
  lime: [S1, S0, S2, K2, K1], army: [S1, S0, S2, K2, K1], wet: [MG_L, MG_D, S2, K2, K1],
  brick: [RUST_L, RUST, BR2, K2, K1], frost: [AS, S0, S2, K2, K1], loop: [AS, S1, S0, K2, K1],
};
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
function wallThing(th) {
  if (th.stair) { stair(th); return; }
  const { x, y, w, h } = th;
  switch (th.id) {
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

// ═══ ДЕКОР: номера колец, ниши, ручеёк талой воды ═══
function decor(cl) {
  const L = LINE;
  // номера колец — трафаретом, каждое десятое (счёт — от «Вавилона»: там первое)
  for (let v = 0; v < L.x1 - L.x0; v += T.RING) {
    const k = v / T.RING + 10, x = L.x1 - v;
    if (k % 10 || x < cl.x0 - 20 || x > cl.x1 + 4 || PORTALS.some(P => P.host === L && x > P.cx - P.R - 4 && x - 16 < P.cx + P.R + 4) || overLine(x - 16, x + 2)) continue;
    write(String(k), x - 14, L.y0 - 14, L2, 0.15, k);
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
const FLOOR_DRAW = {
  u_car: car,
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
    if (lastPrint && !inWater(fx, fy)) {
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
  if (under.cold > 0.25 && t % 80 === 0) {
    for (let k = 0; k < 5; k++) puffs.push({ x: p.x + 7 + (p.dir || 1) * 3, y: p.y - 1, vx: (p.dir || 1) * (0.1 + Math.random() * 0.15), vy: -0.08 - Math.random() * 0.06, life: 70 + k * 6 });
  }
  for (let i = puffs.length - 1; i >= 0; i--) { const u = puffs[i]; u.x += u.vx; u.y += u.vy; u.vx *= 0.99; if (--u.life <= 0) puffs.splice(i, 1); }
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
      if (x < L.x0 || x >= L.x1 || PORTALS.some(P => P.host === L && Math.abs(x - P.cx) <= P.R) || overLine(x, x + 1)) continue;
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
  for (const P of PORTALS) if (P.cx + P.R > camX && P.cx - P.R < camX + vw && P.yb > camY && P.yb - P.H < camY + vh) list.push({ k: P.yb, arch: P });
  list.push({ k: p.y + 23, hero: true });
  list.sort((a, b) => a.k - b.k);
  for (const it of list) {
    if (it.hero) { drawHero(); wade(g, p); G = g; continue; }
    G = g;
    if (it.arch) archSprite(g, it.arch);
    else if (it.west) FLOOR_DRAW.chestsWest();
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
export function resetUnderLife() { drips.length = 0; puffs.length = 0; lastPrint = null; }
