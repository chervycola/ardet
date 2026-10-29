// ═══════════════════════════════════════
// ГАРДЕРОБ СТРАННИКА — крои на выбор автору (слово автора 28.10: «слишком похож на мешок
// из перьев»). Канон §05: «лица нет — капюшон и тьма; рваная ткань слоями; огонёк у сердца;
// границы тел чёткие и броские». Общее у всех кроёв: стройная фигура (27 точек роста,
// 13 в плечах — не 18), капюшон 7×7 с тьмой и двумя угольками, огонёк — в центре груди,
// на оси фигуры (слово автора 29.10); вес несёт верх (sprites/player.js, pose).
// Две плоскости — к нам и от нас (слово автора 29.10): лицом, когда идёт вниз, спиной —
// вверх; вбок — в той, в какой был. Ни профиля, ни трёх четвертей.
// Ноги — только у пелерины (слово автора 29.10); у прочих ткань до земли, без ног и носков.
// Крои:
//  · duster  — пыльник: долгополое пальто с поясом до земли, полы запахнуты — шов спереди,
//              шлица сзади; шагнувшая пола отходит;
//  · pilgrim — паломник: ряса до земли, верёвочный пояс с концами, котомка через плечо
//              (опись: фонарь, газета, блюдце), посох выше капюшона;
//  · cape    — пелерина: короткий рваный плащ с капюшоном до локтей, под ним рубаха до
//              бедра, штаны и ботинки — ноги идут целиком (единственный крой с ногами);
//  · nomad   — номад: голова обмотана, прорезь для угольков, ряса до земли, платок
//              мглой наискось через грудь, конец его — по ветру;
//  · tiers   — ярусы: «оперение» по канону, но кроем — два яруса накидки с ровными зубцами
//              на плечах, ряса узкая: силуэт — перевёрнутый клин, а не мешок.
// Рисунок — по клеткам: крой кладёт материалы в сетку (u — от оси фигуры, v — от земли
// вверх отрицательно), поза сдвигает верх (вес, дыхание), свет — слева, кромка пеплом —
// справа, подол — тенью по низу.
// Выбор: player.cut, иначе ?cut= в адресе (на пробу), иначе — пыльник.
// ═══════════════════════════════════════
import { X } from '../render/context.js';
import { t } from '../core/time.js';

const NI = '#0D0B0A', AS = '#8A8D8F', SV = '#E28A3A', KV = '#C23B2B', L1 = '#c8b89a';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K4 = '#3a3328', S2 = '#33302e';
const BT = '#5c564e', GL = '#5a4232';
const MG = '#3D4A3A', MGL = '#4a5646', MGD = '#2c362a';         // мгла — платок номада
const q = Math.round;

// материалы: b — тон, l — край к свету (слева), r — кромка справа, t — верх, d — низ (тень у земли)
const CL = 1, CD = 2, DP = 3, TR = 4, BO = 5, HD = 6, FC = 7, RP = 8, BG = 9, ST = 10, SH = 11, TO = 12, LT = 13, HN = 14, HR = 15, BK = 16;
const MAT = [];
MAT[CL] = { b: K2, l: K4, r: S2, t: K4, d: K0 };
MAT[CD] = { b: K1, l: K2, r: K1, t: K2, d: K0 };
MAT[DP] = { b: K0 };
MAT[TR] = { b: K1, l: K2, d: K0 };
MAT[BO] = { b: K0, l: K4 };
MAT[HD] = { b: K1, l: K4, r: S2, t: K2 };
MAT[HR] = { b: K1, l: K4, r: AS, t: K2 };                      // верх капюшона: кромка пеплом
MAT[FC] = { b: NI };
MAT[RP] = { b: BT };
MAT[BG] = { b: K4, l: BT, r: K2, d: K1 };
MAT[ST] = { b: K4, l: BT };
MAT[SH] = { b: MG, l: MGL, r: MGD, d: MGD, t: MGL };
MAT[TO] = { b: BT };
MAT[LT] = { b: K4, r: S2 };
MAT[HN] = { b: K4 };
MAT[BK] = { b: S2 };                                            // пряжка: металл потускнел

// сетка: u −15..15, v −34..5 (0 — земля, носки)
const OU = 15, GW = 31, OV = 34, GH = 40;
const M = new Uint8Array(GW * GH);
const inG = (u, v) => u >= -OU && u < GW - OU && v >= -OV && v < GH - OV;
const at = (u, v) => (inG(u, v) ? M[(v + OV) * GW + u + OU] : 0);
// поза: верх (выше пояса) садится на опоре и дышит; голова — своё
let BY = 0, HY = 0, CLIP = 99, SEAT = 0;
function shift(v) {
  if (v <= -19) return [0, BY + HY];
  if (v <= -11 || SEAT) return [0, BY];                           // сидя опускается вся фигура
  return [0, 0];
}
function put(u, v, m) {
  u = q(u); v = q(v);
  const [du, dv] = shift(v);
  const pu = u + du, pv = v + dv;
  if (pv > CLIP || (SEAT && pv > -3)) return;                     // сидя низ рисует seat()
  if (inG(pu, pv)) M[(pv + OV) * GW + pu + OU] = m;
  // верх приподнялся (вдох): нижний ряд области тянется — без щели у пояса
  if (dv < 0 && (v === -11 || v === -19) && inG(pu, v) && !M[(v + OV) * GW + pu + OU]) M[(v + OV) * GW + pu + OU] = m;
}
const run = (u0, u1, v, m) => { for (let u = q(u0); u <= q(u1); u++) put(u, v, m); };
function trap(v0, v1, l0, r0, l1, r1, m) {
  for (let v = v0; v <= v1; v++) { const k = v1 === v0 ? 0 : (v - v0) / (v1 - v0); run(l0 + (l1 - l0) * k, r0 + (r1 - r0) * k, v, m); }
}
// куда клетка попала на экране (для угольков и огонька — поверх сетки)
let PX = 0, PY = 0;
function scr(u, v) { const [du, dv] = shift(v); return [PX + u + du, PY + v + dv]; }

// d-зависимая трапеция (зеркало рукава и котомки спиной): края — по возрастанию
function trapD(v0, v1, a0, b0, a1, b1, m) { trap(v0, v1, Math.min(a0, b0), Math.max(a0, b0), Math.min(a1, b1), Math.max(a1, b1), m); }

// ── ноги — только у пелерины: к зрителю и спиной; маховая короче на точку (колено вперёд),
// опорная — во весь рост; окаменелость — опорная нога уехала назад: ступня выше на две
function legsFront(P, hv, back) {
  const k = P.walking ? P.amp : 0;
  const up = k > 0.3 && P.fr < 0.6 ? 1 : 0, fos = P.kind === 'fossil' ? q(2 * P.tp) : 0;
  const lu = (P.foot > 0 ? up : 0) + fos, ru = P.foot < 0 ? up : 0;
  trap(hv, -1 - lu, -3, -2, -3, -2, TR); trap(hv, -1 - ru, 1, 2, 1, 2, TR);
  if (P.feet) {
    run(-4, -2, -lu, BO); run(1, 3, -ru, BO);
    if (!back) { put(-3, -lu, TO); put(2, -ru, TO); }
  }
}

// ── капюшон: лицом — тьма с угольками, спиной — шов; верх — кромкой пеплом ──
function hood(back) {
  put(0, -26, HR); run(-2, 2, -25, HR); run(-3, 3, -24, HR); trap(-23, -19, -3, 3, -3, 3, HD);
  if (back) for (let v = -25; v <= -20; v++) put(0, v, DP);
  else { run(-1, 1, -23, FC); trap(-22, -20, -1, 1, -1, 1, FC); put(0, -24, FC); }
}
// угольки: тлеют, раз в четыре с лишним секунды моргают; оступился — зажмурился
const EYES = [[-1, -22], [1, -22]];
function eyes(P, cold) {
  if (t % 260 < 6 || P.tp >= 0.4) return;
  X.fillStyle = cold ? AS : SV;
  X.globalAlpha = 0.55 + 0.25 * Math.sin(t * 0.12);
  for (const [u, v] of EYES) { const [px, py] = scr(u, v); X.fillRect(px, py, 1, 1); }
  X.globalAlpha = 1;
}
// голова номада: обмотка витками, прорезь для угольков, край обмотки закрывает рот; спиной — узел
function wrap(back) {
  run(-2, 2, -25, HR); run(-3, 3, -24, HR); trap(-23, -19, -3, 3, -3, 3, HD);
  for (const v of [-24, -20]) run(-2, 2, v, CD);                  // витки обмотки
  if (!back) { run(-2, 2, -22, FC); run(-1, 1, -21, FC); trap(-20, -18, -2, 2, -3, 3, SH); }
  else { put(0, -23, CD); put(0, -22, CD); run(-1, 1, -21, CD); put(-1, -19, CD); put(-1, -18, CD); }   // узел и хвост обмотки
}

// ── крои: вид к зрителю или спиной (back); возвращают огонёк на груди [u, v] (null — не видно);
// sleeve — рукав для ладони козырьком
const CUTS = {};
// шаг без ног: шагнувшая сторона подола отходит
const hemPush = P => (P.walking ? q(P.amp * Math.sin(Math.PI * P.fr)) : 0);
// складки — короткими чертами, не точками
function folds(us, v0, v1, m) { for (const u of us) for (let v = v0; v <= v1; v++) put(u, v, m); }
// подол до земли: углы скруглены; шагнувшая сторона отходит на точку
function hem(P, l, r, m) {
  const pl = hemPush(P), lp = P.foot > 0 ? pl : 0, rp = P.foot < 0 ? pl : 0;
  if (lp) { put(l - 1, -1, m); put(l - 1, 0, m); } else put(l, 0, 0);
  if (rp) { put(r + 1, -1, m); put(r + 1, 0, m); } else put(r, 0, 0);
}

// сидя (лицом к зрителю): колени подтянуты, ткань легла на землю, кисти — на земле по бокам.
// how: 'coat' — колени под полами, между ними разрез; 'robe' — колени под тканью; 'legs' — рубаха,
// штаны и ботинки (пелерина — единственная с ногами)
function seat(how, m) {
  const legs = how === 'legs', km = legs ? TR : m;
  trap(-3, 0, -6, 6, -8, 8, m);                                   // ткань на земле
  if (how === 'coat') { run(-1, 1, -3, DP); run(-2, 2, -2, DP); }   // разрез полы между коленями
  trap(-6, -2, -4, -1, -4, -1, km); trap(-6, -2, 1, 4, 1, 4, km);  // колени
  put(-4, -6, legs ? CD : LT); put(1, -6, legs ? CD : LT);
  put(0, -5, DP); put(0, -4, DP);                                  // между коленями — тень
  if (legs) {
    run(-4, -2, -1, BO); run(-4, -1, 0, BO); put(-1, 0, TO); run(2, 4, -1, BO); run(1, 4, 0, BO); put(1, 0, TO);   // ботинки
    run(-6, 6, -3, TR); run(-7, -5, -2, TR); run(5, 7, -2, TR);   // подол рубахи
  }
}

// пыльник: полы до земли, запахнуты — спереди шов, сзади шлица; шагнувшая пола отходит
CUTS.duster = {
  sleeve: CL, seat: 'coat', cloth: CL,
  front(P, back) {
    trap(-10, 0, -4, 4, -6, 6, CL); hem(P, -6, 6, CL);
    if (!back) {
      for (let v = -10; v <= 0; v++) put(0, v, DP);               // шов запаха
      for (let v = -9; v <= 0; v++) put(1, v, LT);                // край правой полы ловит свет
      if (P.walking && P.fr < 0.5) { put(-1, -1, DP); put(-1, 0, DP); }   // пола приоткрылась на шаге — внутри тень
    } else for (let v = -7; v <= 0; v++) put(0, v, DP);           // шлица
    // верх: воротник капюшона на плечах, плечи, рукава отделены проймой
    run(-4, 4, -18, HD); run(-6, 6, -17, CL);
    trap(-16, -12, -3, 3, -3, 3, CL);
    for (let v = -16; v <= -11; v++) { put(-4, v, DP); put(4, v, DP); }
    const au = P.walking ? P.foot : 0;
    trap(-16, -11 - (au > 0 ? 1 : 0), -6, -5, -6, -5, CL); put(-6, -10 - (au > 0 ? 1 : 0), HN);
    trap(-16, -11 - (au < 0 ? 1 : 0), 5, 6, 5, 6, CL); put(6, -10 - (au < 0 ? 1 : 0), HN);
    run(-4, 4, -11, DP); if (!back) put(0, -11, BK);              // пояс, пряжка
    return back ? null : [0, -15];
  },
};

// паломник: ряса до земли, верёвочный пояс, котомка через плечо, посох выше капюшона
CUTS.pilgrim = {
  sleeve: CL, seat: 'robe', cloth: CL, staff: true,
  front(P, back) {
    trap(-10, 0, -5, 5, -6, 6, CL); hem(P, -6, 6, CL);
    folds([-2], -7, -3, CD); folds([3], -5, -1, CD);
    run(-4, 4, -18, HD); run(-5, 5, -17, CL); trap(-16, -11, -5, 5, -5, 5, CL);
    // посох — в правой руке (с экрана слева); спиной — справа
    const d = back ? -1 : 1, su = back ? 8 : -8;
    for (let v = -27; v <= 0; v++) put(su, v, ST); put(su + d, -27, ST); put(su + d, -26, ST);
    // рукав колоколом, что держит посох, — согнут; другой висит
    trapD(-16, -13, -5 * d, -6 * d, -6 * d, -7 * d, CL); put(-7 * d, -14, HN); put(-6 * d, -12, DP);
    trapD(-16, -10, 5 * d, 6 * d, 6 * d, 7 * d, CL); run(Math.min(6 * d, 7 * d), Math.max(6 * d, 7 * d), -10, DP);
    // пояс верёвкой, конец висит
    run(-5, 5, -11, RP);
    if (!back) { for (let v = -10; v <= -6; v++) put(1 + (v === -8 ? 1 : 0), v, RP); }
    // лямка наискось через грудь и котомка у бедра
    for (let i = 0; i <= 8; i++) put((-4 + i) * d, -17 + q(i * 0.75), RP);
    trapD(-11, -7, 5 * d, 8 * d, 5 * d, 8 * d, BG); run(Math.min(5 * d, 8 * d), Math.max(5 * d, 8 * d), -10, DP);
    return back ? null : [0, -15];
  },
};

// пелерина: рубаха до бедра, штаны и ботинки — ноги целиком; пелерина до локтей, край зубцами
CUTS.cape = {
  sleeve: CD, seat: 'legs', cloth: CL, legs: true,
  front(P, back) {
    legsFront(P, -6, back);
    const pl = hemPush(P);
    // рубаха до бедра, пояс; предплечья из-под пелерины, кисти
    trap(-12, -6, -4, 4, -5, 5, TR);
    if (P.walking) run(P.foot > 0 ? -5 : 1, P.foot > 0 ? -1 : 5, -4 - (pl ? 0 : 1), TR);
    run(-4, 4, -9, DP); if (!back) put(0, -9, BK);
    const au = P.walking ? P.foot : 0;
    trap(-12, -10 - (au > 0 ? 1 : 0), -6, -5, -6, -5, TR); put(-6, -9 - (au > 0 ? 1 : 0), HN);
    trap(-12, -10 - (au < 0 ? 1 : 0), 5, 6, 5, 6, TR); put(6, -9 - (au < 0 ? 1 : 0), HN);
    // пелерина: край зубцами; спереди — разрез, в нём огонёк; тень от края на рубахе
    run(-4, 4, -18, HD); run(-5, 5, -17, CL); trap(-16, -13, -6, 6, -7, 7, CL);
    for (const u of [-7, -6, -3, -2, 1, 2, 5, 6]) put(u, -12, CL);
    for (const u of [-5, -4, -1, 0, 3, 4]) put(u, -12, DP);
    if (!back) for (let v = -16; v <= -12; v++) { put(0, v, DP); if (v >= -14) put(1, v, DP); }
    else for (let v = -16; v <= -13; v++) put(0, v, CD);
    return back ? null : [0, -15];
  },
};

// номад: ряса до земли, платок мглой наискось через грудь, конец — по ветру
CUTS.nomad = {
  head: 'wrap', sleeve: CL, seat: 'robe', cloth: CL,
  front(P, back) {
    trap(-10, 0, -5, 5, -6, 6, CL); hem(P, -6, 6, CL);
    folds([-3], -7, -3, CD); folds([2], -5, -1, CD);
    run(-5, 5, -17, CL); trap(-16, -11, -5, 5, -5, 5, CL);
    // платок наискось: с левого плеча (справа на экране) к правому бедру; спиной — наоборот
    const d = back ? -1 : 1;
    for (let v = -17; v <= -9; v++) { const c = 4 * d - (v + 17) * d; run(c - 1, c + 1, v, SH); }
    // конец платка — с плеча вниз и по ветру, волной
    const tr = P.trail, k = P.walking ? P.amp : 0;
    for (let v = -16; v <= -8; v++) {
      const f = (v + 16) / 8, wv = Math.sin(t * 0.1 - v * 0.6) * (0.4 + 0.6 * k) * f;
      const u = 6 * d + q(tr * 0.5 * f + wv);
      put(u, v, SH); put(u + d, v, SH);
    }
    return back ? null : [0, -15];
  },
};

// ярусы: накидка в два яруса — зубцы широкие, края ярусов по бокам длиннее (крылья), ряса узкая
CUTS.tiers = {
  sleeve: CL, seat: 'robe', cloth: CD,
  front(P, back) {
    const pl = hemPush(P), lpush = P.foot > 0 ? pl : 0, rpush = P.foot < 0 ? pl : 0;
    trap(-8, -1, -4, 4, -5, 5, CD);
    for (const u of [-4, -1, 2]) run(u, u + 1, 0, CD);               // подол зубцами — до земли
    if (lpush) run(-5, -1, 0, CD); if (rpush) run(1, 5, 0, CD);
    // второй ярус: по бокам до колен, к середине короче
    trap(-12, -9, -6, 6, -7, 7, CL);
    for (const [u0, u1, v1] of [[-7, -6, -5], [-5, -4, -7], [-2, -1, -8], [2, 3, -8], [4, 5, -7], [6, 7, -5]]) trap(-8, v1, u0, u1, u0, u1, CL);
    // первый ярус от капюшона: верх на свету, зубцы, тень на втором
    run(-4, 4, -18, HD); run(-6, 6, -17, LT); trap(-16, -14, -6, 6, -7, 7, CL);
    for (const [u0, u1] of [[-7, -6], [-4, -3], [3, 4], [6, 7]]) run(u0, u1, -13, CL), run(u0, u1, -12, CL);
    for (const u of [-5, -2, -1, 1, 2, 5]) put(u, -13, DP);
    if (!back) for (let v = -16; v <= -13; v++) { put(0, v, DP); if (v >= -15) put(1, v, DP); }
    else for (let v = -16; v <= -9; v++) put(0, v, CD);
    return back ? null : [0, -15];
  },
};

// вид: две плоскости — к зрителю и спиной (слово автора 29.10); всё, что «на север», — спиной
export const backOf = view => typeof view === 'string' && view.includes('N');

// огонёк в центре груди, на оси фигуры (слово автора 29.10): свеча, сплошной — уголёк в три
// точки (сердцевина в кайме, снизу угли, края углей тусклее), язык над ним; в порыв язык выше
// и клонится по ветру; на вдохе выше
function ember(player, P, fx, fy) {
  const ice = (player.cold || 0) > 0.5, F = ice ? AS : SV, F0 = ice ? S2 : KV, low = player.ember !== undefined && player.ember < 0.3;
  const flick = P.flick;
  const r = (x, y, w, h, c) => { X.fillStyle = c; X.fillRect(q(x), q(y), w, h); };
  r(fx, fy + 1, 1, 1, F0); X.globalAlpha = 0.55; r(fx - 1, fy + 1, 1, 1, F0); r(fx + 1, fy + 1, 1, 1, F0); X.globalAlpha = 1;   // угли
  r(fx - 1, fy, 1, 1, F0); r(fx + 1, fy, 1, 1, F0);              // кайма
  r(fx, fy, 1, 1, F);                                             // сердцевина
  const up = Math.round(3 * (player.flare || 0)), tg = player.tug, hi = flick > 0.25 ? 1 : 0;
  const tx = tg && tg.x ? Math.sign(tg.x) : hi ? (P.w.x < 0 ? -1 : 1) : 0, ty = tg && tg.y < 0 ? 1 : 0;
  if (!low || up) r(fx + tx, fy - 1 - hi - up - ty, 1, 1 + hi + up + ty, F);   // язык
  if ((flick > 0.3 || (player.pulse || 0) > 0.45) && !ice) r(fx, fy, 1, 1, L1);
  if (!ice && t % 9 === 0 && ((t / 9) % 3 | 0) === 0) {
    const w = P.w;
    X.globalAlpha = 0.6; r(fx + (tg ? tg.x * 4 : q(w.x * 3)), fy - 3 + (tg ? tg.y * 6 : 0), 1, 1, SV); X.globalAlpha = 1;
  }
}

export function drawCut(player, P, name) {
  const C = CUTS[name];
  M.fill(0);
  const back = backOf(P.view), cold = (player.cold || 0) > 0.5;
  PX = P.x + 7; PY = P.y + 22;
  // поза: вес на опоре, осел, дыхание (плечи, потом голова), сидя — ниже
  // сесть: сперва колени (верх ниже на 2), с середины — сидит: вся фигура на 7 ниже, низ — seat()
  const seated = P.sit > 0.5;
  const sitD = seated ? 5 + q(2 * Math.min(1, (P.sit - 0.5) * 2)) : q(4 * P.sit);
  // оступился: о камень — клюнул верхом, в яму — осел, окаменелость дёрнула; голова вниз
  const peck = P.kind === 'stone' && P.tp > 0.6 ? 1 : 0;
  const down = peck || (P.kind === 'pit' && P.tp > 0.5) || (P.kind === 'fossil' && P.tp > 0.5) ? 1 : 0;
  P.down = down;
  BY = P.dip - P.bSh + sitD + peck; HY = -P.bHd + down + P.dipH; SEAT = seated ? 1 : 0;
  // яма — проседает; вброд, в зыби, снегу и мху — низа не видно
  CLIP = P.kind === 'pit' ? -q(2 * P.tp) : !P.feet && P.sit < 0.5 ? -2 : 99;
  const PP = Object.assign({}, P);
  if (P.sit > 0.5) PP.walking = false;
  const heart = C.front(PP, back);
  if (C.head === 'wrap') wrap(back); else hood(back);
  // ладонь козырьком (лицом к зрителю): плечо в сторону, предплечье стоймя, кисть над тьмой — «Г»
  if (P.visorK > 0) {
    const sl = C.sleeve;
    run(5, 8, -17, sl); run(5, 7, -16, sl);                       // плечо в сторону, рукав провис
    if (P.visorK < 0.5) run(7, 8, -18, sl);                       // локоть пошёл вверх
    else {
      trap(-22, -18, 7, 8, 7, 8, sl); put(8, -17, DP);             // предплечье стоймя, под локтем — тень
      if (P.visorK >= 1) { run(1, 7, -23, sl); run(-2, 5, -24, HN); put(-2, -24, TO); run(-1, 3, -23, FC); }   // кисть к виску, ладонь над тьмой
    }
  }
  SEAT = 0;                                                       // низ сидящего — на месте, без сдвига
  if (seated) seat(C.seat || 'robe', C.cloth || CL);
  if (seated && C.staff) for (let v = -2; v <= 0; v++) put(back ? 8 : -8, v, ST);   // посох сидящего — до земли
  // тень у земли
  X.globalAlpha = 0.35; X.fillStyle = NI; X.fillRect(P.x + 1, P.y + 23, 13, 1); X.globalAlpha = 1;
  // свет и кромки по сетке → холст (ряд за рядом, одинаковые подряд — одним прямоугольником)
  for (let gv = 0; gv < GH; gv++) {
    let runC = null, runX = 0, runN = 0;
    const flush = () => { if (runN) { X.fillStyle = runC; X.fillRect(runX, PY + gv - OV, runN, 1); } runN = 0; };
    for (let gx = 0; gx < GW; gx++) {
      const u = gx - OU, v = gv - OV, m = at(u, v);
      let c = null;
      if (m) {
        const A = MAT[m];
        c = A.b;
        if (A.d && !at(u, v + 1)) c = A.d;
        else if (A.t && !at(u, v - 1)) c = A.t;
        else if (A.l && !at(u - 1, v)) c = A.l;
        else if (A.r && !at(u + 1, v)) c = A.r;
      }
      const sx = PX + u;
      if (c === runC && c && sx === runX + runN) runN++;
      else { flush(); if (c) { runC = c; runX = sx; runN = 1; } else runC = null; }
    }
    flush();
  }
  // спиной: отсвет огонька по обоим краям ткани
  if (back && !cold) {
    const gh = P.flick > 0.2 ? 3 : 2, [lx, ly] = scr(-6, -15), [rx] = scr(6, -15);
    X.fillStyle = GL; X.fillRect(lx, ly, 1, gh); X.fillRect(rx, ly, 1, gh);
  }
  if (heart) { const [fx, fy] = scr(heart[0], heart[1]); ember(player, P, fx, fy); }
  if (!back && P.visorK < 1) eyes(P, cold);
}

// есть ли такой крой: своё поле, не ключ прототипа; без Object.hasOwn — старые Safari и WebView
const own = Object.prototype.hasOwnProperty;
export const isCut = c => typeof c === 'string' && own.call(CUTS, c);
// основной крой — пыльник (слово автора 28.10); ?cut= в адресе — на пробу, без сохранения
let pick = 'duster', pinned = false;
try { const m = /[?&]cut=(\w+)/.exec(typeof location !== 'undefined' ? location.search : ''); if (m && isCut(m[1])) { pick = m[1]; pinned = true; } } catch (e) { /* без адреса — пыльник */ }
export const CUT = pick;
export const CUT_PINNED = pinned;                                 // крой задан адресом — надетое в мире не рисуется
export { CUTS };
