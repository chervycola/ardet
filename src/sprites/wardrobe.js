// ═══════════════════════════════════════
// ГАРДЕРОБ СТРАННИКА — крои на выбор автору (слово автора 28.10: «слишком похож на мешок
// из перьев»). Канон §05: «лица нет — капюшон и тьма; рваная ткань слоями; огонёк у сердца;
// границы тел чёткие и броские». Общее у всех кроёв: стройная фигура (27 точек роста,
// 13 в плечах — не 18), капюшон 7×7 с тьмой и двумя угольками, огонёк на груди, носки
// стоптанных ботинок, подол и полы на земле; вес несёт верх (sprites/player.js, pose).
// Крои:
//  · duster  — пыльник: долгополое пальто с поясом, полы расходятся от пояса — ноги видны
//              в шаге; хвост полы отстаёт и уходит по ветру;
//  · pilgrim — паломник: ряса до земли, верёвочный пояс с концами, котомка через плечо
//              (опись: фонарь, газета, блюдце), посох выше капюшона — ставится через шаг;
//  · cape    — пелерина: короткий рваный плащ с капюшоном до локтей, под ним рубаха до
//              бедра, штаны и ботинки — ноги идут целиком;
//  · nomad   — номад: голова обмотана, прорезь для угольков, ряса до щиколоток, платок
//              мглой наискось через грудь, конец его — по ветру;
//  · tiers   — ярусы: «оперение» по канону, но кроем — два яруса накидки с ровными зубцами
//              на плечах, ряса узкая: силуэт — перевёрнутый клин, а не мешок.
// Рисунок — по клеткам: крой кладёт материалы в сетку (u — от оси фигуры, v — от земли
// вверх отрицательно), поза сдвигает верх (вес, дыхание, наклон), свет — слева, кромка
// пеплом — справа, подол — тенью по низу; W и SW — зеркало E и SE.
// Выбор: player.cut, иначе ?cut= в адресе (на пробу), иначе — прежний плащ (player.js).
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
// поза: верх (выше пояса) садится на опоре и дышит, наклон растёт к плечам; голова — своё
let BY = 0, HY = 0, LEAN = 0, CLIP = 99, SEAT = 0;
function shift(v) {
  if (v <= -19) return [LEAN, BY + HY];
  if (v <= -11 || SEAT) return [q(LEAN * Math.min(1, (-10 - v) / 8)), BY];   // сидя опускается вся фигура
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
function limb(u0, v0, u1, v1, w, m) {
  const n = Math.max(Math.abs(v1 - v0), Math.abs(u1 - u0), 1);
  for (let i = 0; i <= n; i++) { const u = u0 + (u1 - u0) * i / n, v = v0 + (v1 - v0) * i / n; for (let k = 0; k < w; k++) put(u + k, v, m); }
}
// куда клетка попала на экране (для угольков и огонька — поверх сетки)
let FLIP = false, PX = 0, PY = 0;
function scr(u, v) { const [du, dv] = shift(v); const uu = u + du; return [PX + (FLIP ? -uu : uu), PY + v + dv]; }

// ── ноги: от бедра (hu, hv) до ступни; планта и мах по фазе шага ──
// вбок: опорная ступня едет назад под телом, маховая — вперёд и над землёй
function legsSide(P, hv, s, near, far) {
  const k = P.walking && !P.reverse ? P.amp : 0;
  const a = q(s * k * (1 - 2 * P.fr)), lift = q(2 * k * Math.sin(Math.PI * P.fr));
  // окаменелость: опорная нога едет назад, другая осталась впереди
  const fos = P.kind === 'fossil' ? q(3 * P.tp) : 0;
  const plant = a - fos - (fos ? 1 : 0), swing = -a + (fos ? 1 : 0);
  // какая нога ближе к зрителю — по счёту шага
  const nearSwing = P.foot > 0;
  const L = [[plant, 0, nearSwing ? far : near], [swing, lift, nearSwing ? near : far]];
  if (!nearSwing) L.reverse();                                   // дальняя рисуется первой
  for (const [fu, fl, m] of L) {
    const knee = fl > 0 ? 1 : 0;
    limb(0, hv, q(fu / 2) + knee, q((hv - fl) / 2), 2, m);
    limb(q(fu / 2) + knee, q((hv - fl) / 2), fu, -fl - 1, 2, m);
    if (P.feet) { run(fu - 1, fu + 1, -fl, BO); put(fu + 2, -fl, TO); }   // ботинок носком вперёд
  }
  return { plant, swing, lift, a };
}
// к зрителю / спиной: маховая нога короче на точку (колено вперёд), опорная — во весь рост
function legsFront(P, hv, back) {
  const k = P.walking && !P.reverse ? P.amp : 0;
  const up = k > 0.3 && P.fr < 0.6 ? 1 : 0;
  const lu = P.foot > 0 ? up : 0, ru = P.foot < 0 ? up : 0;
  trap(hv, -1 - lu, -3, -2, -3, -2, TR); trap(hv, -1 - ru, 1, 2, 1, 2, TR);
  if (P.feet) {
    run(-4, -2, -lu, BO); run(1, 3, -ru, BO);
    if (!back) { put(-3, -lu, TO); put(2, -ru, TO); }
  }
  return { lu, ru };
}

// ── капюшон: острие отстаёт от взгляда; тьма лица с угольками; верх — кромкой пеплом ──
// mode: 'S' анфас, 'Q' три четверти, 'E' профиль, 'N' спина, 'NQ' спина в три четверти
function hood(mode) {
  if (mode === 'E') {                                             // профиль: затылок округлый, спереди — проём, козырёк нависает
    put(-2, -26, HR); run(-2, 1, -25, HR); run(-3, 2, -24, HR); trap(-23, -19, -3, 2, -3, 1, HD); run(-3, 0, -18, HD);
    for (let v = -23; v <= -20; v++) put(2, v, FC);
    trap(-22, -20, 1, 1, 1, 1, FC);
    return;
  }
  const tk = mode === 'Q' || mode === 'NQ' ? -1 : 0;
  put(tk, -26, HR); run(-2, 2, -25, HR); run(-3, 3, -24, HR); trap(-23, -19, -3, 3, -3, 3, HD);
  if (mode === 'S') { run(-1, 1, -23, FC); trap(-22, -20, -1, 1, -1, 1, FC); put(0, -24, FC); }
  else if (mode === 'Q') { trap(-23, -20, 0, 2, 0, 2, FC); put(1, -24, FC); }
  else if (mode === 'N') { for (let v = -25; v <= -20; v++) put(0, v, DP); }
  else if (mode === 'NQ') { for (let v = -25; v <= -20; v++) put(-1, v, DP); put(3, -22, FC); put(3, -21, FC); }
}
// угольки: тлеют, раз в четыре с лишним секунды моргают; дальний тусклее; оступился — зажмурился
const EYES = { S: [[-1, -22, 1], [1, -22, 1]], Q: [[0, -22, 1], [2, -22, 0.6]], E: [[1, -22, 1]],
  slitS: [[-1, -22, 1], [1, -22, 1]], slitQ: [[0, -22, 1], [2, -22, 0.6]], slitE: [[2, -22, 1]] };
function eyes(mode, P, cold) {
  if (t % 260 < 6 || P.tp >= 0.4) return;
  const a = 0.55 + 0.25 * Math.sin(t * 0.12);
  X.fillStyle = cold ? AS : SV;
  for (const [u, v, k] of EYES[mode] || []) { const [px, py] = scr(u, v); X.globalAlpha = a * k; X.fillRect(px, py, 1, 1); }
  X.globalAlpha = 1;
}
// голова номада: обмотка витками, прорезь для угольков, край обмотки закрывает рот; спиной — узел
function wrap(mode) {
  if (mode === 'E') {
    run(-2, 1, -25, HR); run(-3, 2, -24, HR); trap(-23, -19, -3, 2, -3, 2, HD);
    for (const v of [-24, -20]) run(-2, 1, v, CD);
    run(0, 2, -22, FC); put(1, -21, FC); trap(-20, -18, -1, 2, -2, 2, SH);
    put(-4, -21, CD); put(-4, -20, CD);                            // хвост обмотки на затылке
    return;
  }
  run(-2, 2, -25, HR); run(-3, 3, -24, HR); trap(-23, -19, -3, 3, -3, 3, HD);
  for (const v of [-24, -20]) run(-2, 2, v, CD);                  // витки обмотки
  if (mode === 'S') { run(-2, 2, -22, FC); run(-1, 1, -21, FC); trap(-20, -18, -2, 2, -3, 3, SH); }
  else if (mode === 'Q') { run(-1, 3, -22, FC); run(0, 2, -21, FC); trap(-20, -18, -1, 3, -2, 3, SH); }
  else { put(0, -23, CD); put(0, -22, CD); run(-1, 1, -21, CD); put(-1, -19, CD); put(-1, -18, CD); }   // узел и хвост обмотки
}

// ── крои: каждый — вид спереди (s: 0 анфас, 1 — три четверти), спиной (back), сбоку (лицом к +u) ──
// возвращают огонёк на груди [u, v] (null — не видно); sleeve — рукав для ладони козырьком
const CUTS = {};
const hemPush = P => (P.walking && !P.reverse ? q(P.amp * Math.sin(Math.PI * P.fr)) : 0);
// отмах руки вбок: против ближней ноги
const armSwing = (P, k = 2) => (P.walking && !P.reverse ? -q(k * P.amp * (1 - 2 * P.fr) * (P.foot > 0 ? -1 : 1)) : 0);
// складки рясы — короткими чертами, не точками
function folds(us, v0, v1, m) { for (const u of us) for (let v = v0; v <= v1; v++) put(u, v, m); }
// носки из-под рясы: стоит лицом — оба, на ходу — опорный
function toesFront(P, back) {
  if (!P.feet || back) return;
  if (!P.walking) { run(-3, -2, 0, BO); put(-3, 0, TO); run(1, 2, 0, BO); put(2, 0, TO); }
  else if (P.fr < 0.45) { const u = P.foot > 0 ? 1 : -3; run(u, u + 1, 0, BO); put(P.foot > 0 ? u + 1 : u, 0, TO); }
}
function toesSide(P, fh, bh) {
  if (!P.feet) return;
  if (!P.walking) { put(fh, 0, BO); put(fh + 1, 0, TO); }
  else if (P.fr < 0.4) { put(fh + 1, 0, BO); put(fh + 2, 0, TO); }
  else if (P.fr > 0.55 && P.fr < 0.9) put(bh - 1, 0, BO);
}

// сидя (лицом к зрителю): колени подтянуты, ткань легла на землю, носки впереди, кисти — на земле по бокам.
// how: 'coat' — полы разошлись, колени в штанах; 'robe' — колени под тканью; 'legs' — рубаха и штаны
function seat(how, m) {
  const km = how === 'robe' ? m : TR;
  trap(-3, 0, -6, 6, -8, 8, m);                                   // ткань на земле
  if (how === 'coat') { run(-1, 1, -3, DP); run(-2, 2, -2, DP); }   // разрез полы между коленями
  trap(-6, -2, -4, -1, -4, -1, km); trap(-6, -2, 1, 4, 1, 4, km);  // колени и голени
  put(-4, -6, how === 'robe' ? LT : CD); put(1, -6, how === 'robe' ? LT : CD);
  put(0, -5, DP); put(0, -4, DP);                                  // между коленями — тень
  if (how !== 'robe') { run(-4, -2, -1, BO); run(-4, -1, 0, BO); put(-1, 0, TO); run(2, 4, -1, BO); run(1, 4, 0, BO); put(1, 0, TO); }
  else { run(-3, -2, 0, BO); put(-2, 0, TO); run(2, 3, 0, BO); put(2, 0, TO); }
  if (how === 'legs') { run(-6, 6, -3, TR); run(-7, -5, -2, TR); run(5, 7, -2, TR); }   // подол рубахи
}

// пыльник
CUTS.duster = {
  sleeve: CL, seat: 'coat', cloth: CL,
  front(P, s, back) {
    legsFront(P, -9, back);
    // полы: от пояса клином вниз; спереди — разрез, в нём ноги; шагнувшая нога выносит полу
    const pl = hemPush(P), lpush = P.foot > 0 ? pl : 0, rpush = P.foot < 0 ? pl : 0;
    trap(-10, -3, -4 + s, 4, -6 + s, 6, CL);
    if (lpush) run(-6 + s, -2, -2, CL); if (rpush) run(2, 6, -2, CL);
    if (!back) {
      for (let v = -9; v <= -3; v++) { const h = v >= -6 ? 1 : 0; run(-h + s, h + s, v, v >= -5 ? TR : DP); }
      for (let v = -8; v <= -3; v++) put(1 + s + (v >= -6 ? 1 : 0), v, LT);   // кромка правой полы ловит свет
    } else for (let v = -7; v <= -3; v++) put(0, v, DP);         // шлица сзади
    // верх: воротник капюшона на плечах, плечи, рукава отделены проймой
    run(-4, 4, -18, HD); run(-6 + s, 6, -17, CL);
    trap(-16, -12, -3 + s, 3, -3 + s, 3, CL);
    for (let v = -16; v <= -11; v++) { put(-4 + s, v, DP); put(4, v, DP); }
    const au = P.walking ? P.foot : 0;
    trap(-16, -11 - (au > 0 ? 1 : 0), -6 + s, -5 + s, -6 + s, -5 + s, CL); put(-6 + s, -10 - (au > 0 ? 1 : 0), HN);
    trap(-16, -11 - (au < 0 ? 1 : 0), 5, 6, 5, 6, CL); put(6, -10 - (au < 0 ? 1 : 0), HN);
    run(-4 + s, 4, -11, DP); if (!back) put(s, -11, BK);         // пояс, пряжка
    return back ? null : [1 + s, -15];
  },
  side(P) {
    legsSide(P, -9, 3, TR, DP);
    const pl = hemPush(P), tr = P.trail;
    const fh = 3 + (pl > 0 ? 1 : 0) + Math.max(0, q(tr * 0.4)), bh = -5 + Math.min(0, q(tr * 0.8)) - (P.walking ? 1 : 0);
    trap(-10, -3, -3, 3, bh, fh, CL);
    for (let v = -8; v <= -4; v++) put(q(-3 + (bh + 3) * (v + 10) / 7) + 2, v, CD);   // складка полы к хвосту
    // корпус в профиль — в тени, ближний рукав — на свету
    run(-3, 2, -18, HD); trap(-17, -12, -3, 3, -3, 3, CD); put(4, -15, CD); put(4, -14, CD);
    run(-3, 3, -11, DP); put(3, -11, BK);
    const au = armSwing(P);
    for (let v = -15; v <= -11; v++) put(-2 + q(au * (v + 16) / 6), v, DP);
    limb(-1, -17, -1 + au, -10, 2, CL); put(au + (au > 0 ? 1 : 0), -9, HN);
    return [4, -15];
  },
};

// паломник
CUTS.pilgrim = {
  sleeve: CL, seat: 'robe', cloth: CL,
  front(P, s, back) {
    const pl = hemPush(P), lpush = P.foot > 0 ? pl : 0, rpush = P.foot < 0 ? pl : 0;
    toesFront(P, back);
    trap(-10, -1, -5 + s, 5, -6 + s, 6, CL);
    if (!lpush) put(-6 + s, -1, 0); if (!rpush) put(6, -1, 0);   // шагнувшая сторона подола — до земли
    folds([-2 + s], -7, -4, CD); folds([3], -5, -2, CD);
    run(-4, 4, -18, HD); run(-5 + s, 5, -17, CL); trap(-16, -11, -5 + s, 5, -5 + s, 5, CL);
    // посох — в правой руке (с экрана слева); спиной — справа
    const d = back ? -1 : 1, su = back ? 8 : -8 + s;
    for (let v = -27; v <= 0; v++) put(su, v, ST); put(su + d, -27, ST); put(su + d, -26, ST);
    // рукав колоколом, что держит посох, — согнут; другой висит
    trap(-16, -13, -5 * d, -6 * d, -6 * d, -7 * d, CL); put(-7 * d, -14, HN); put(-6 * d, -12, DP);
    trap(-16, -10, 5 * d, 6 * d, 6 * d, 7 * d, CL); run(6 * d, 7 * d, -10, DP);
    // пояс верёвкой, конец висит
    run(-5 + s, 5, -11, RP);
    if (!back) { for (let v = -10; v <= -6; v++) put(1 + s + (v === -8 ? 1 : 0), v, RP); }
    // лямка наискось через грудь и котомка у бедра
    for (let i = 0; i <= 8; i++) put((-4 + i) * d + (d > 0 ? s : 0), -17 + q(i * 0.75), RP);
    trap(-11, -7, 5 * d, 8 * d, 5 * d, 8 * d, BG); run(Math.min(5 * d, 8 * d), Math.max(5 * d, 8 * d), -10, DP);
    return back ? null : [-1 + s, -15];
  },
  side(P) {
    const pl = hemPush(P), tr = P.trail;
    const fh = 3 + (pl > 0 ? 1 : 0), bh = -5 + Math.min(0, q(tr * 0.7));
    toesSide(P, fh, bh);
    trap(-10, -1, -3, 3, bh, fh, CL); folds([0], -7, -4, CD); folds([-2], -4, -2, CD);
    run(-3, 2, -18, HD); trap(-17, -11, -3, 3, -3, 3, CL); put(4, -15, CL); put(4, -14, CL);
    // котомка у спины, лямка через плечо
    limb(0, -17, -3, -12, 1, RP); trap(-12, -8, -6, -4, -6, -4, BG); run(-6, -4, -11, DP);
    run(-3, 3, -11, RP); for (let v = -10; v <= -7; v++) put(3 + (v === -8 ? 1 : 0), v, RP);
    // посох: ставится через шаг — конец на земле, верх качается
    const k = P.walking ? P.amp : 0, ph = (P.phase / 2) % 1;
    const su = 7 - q(3 * k * ph), tip = 7 - q(1.5 * k * Math.sin(Math.PI * ph));
    limb(tip, -27, su, 0, 1, ST);
    limb(1, -16, 5, -14, 2, CL); put(6, -14, HN);                 // рука на посохе
    return [4, -15];
  },
};

// пелерина
CUTS.cape = {
  sleeve: CD, seat: 'legs', cloth: CL,
  front(P, s, back) {
    legsFront(P, -6, back);
    const pl = hemPush(P);
    // рубаха до бедра, пояс; предплечья из-под пелерины, кисти
    trap(-12, -6, -4 + s, 4, -5 + s, 5, TR);
    if (P.walking) run(P.foot > 0 ? -5 + s : 1, P.foot > 0 ? -1 : 5, -5 - (pl ? 0 : 1) + 1, TR);
    run(-4 + s, 4, -9, DP); if (!back) put(s, -9, BK);
    const au = P.walking ? P.foot : 0;
    trap(-12, -10 - (au > 0 ? 1 : 0), -6 + s, -5 + s, -6 + s, -5 + s, TR); put(-6 + s, -9 - (au > 0 ? 1 : 0), HN);
    trap(-12, -10 - (au < 0 ? 1 : 0), 5, 6, 5, 6, TR); put(6, -9 - (au < 0 ? 1 : 0), HN);
    // пелерина до локтей, край зубцами; спереди — разрез, в нём огонёк; тень от края на рубахе
    run(-4, 4, -18, HD); run(-5 + s, 5, -17, CL); trap(-16, -13, -6 + s, 6, -7 + s, 7, CL);
    for (const u of [-7, -6, -3, -2, 1, 2, 5, 6]) if (u + (u < 0 ? 0 : 0) >= -7 + s) put(u, -12, CL);
    for (const u of [-5, -4, -1, 0, 3, 4]) put(u, -12, DP);
    if (!back) for (let v = -16; v <= -12; v++) { put(s, v, DP); if (v >= -14) put(1 + s, v, DP); }
    else for (let v = -16; v <= -13; v++) put(0, v, CD);
    return back ? null : [s, -15];
  },
  side(P) {
    legsSide(P, -7, 3, TR, DP);
    const pl = hemPush(P), tr = P.trail;
    trap(-12, -6, -3, 2, -4, 3 + (pl > 0 ? 1 : 0), TR); run(-3, 2, -9, DP);
    const au = armSwing(P);
    limb(0, -12, au, -10, 2, TR); put(au + (au >= 0 ? 1 : 0), -9, HN);
    // пелерина: сзади длиннее и уходит по ветру
    const bh = -5 + Math.min(0, q(tr * 0.8)) - (P.walking ? 1 : 0);
    run(-3, 2, -18, HD); trap(-17, -13, -3, 3, bh, 4, CL);
    for (let u = bh; u <= 4; u += 3) { put(u, -12, CL); put(u + 1, -12, CL); }
    put(bh, -11, CL);
    return [4, -15];
  },
};

// номад
CUTS.nomad = {
  head: 'wrap', sleeve: CL, seat: 'robe', cloth: CL,
  front(P, s, back) {
    const pl = hemPush(P), lpush = P.foot > 0 ? pl : 0, rpush = P.foot < 0 ? pl : 0;
    toesFront(P, back);
    trap(-10, -1, -5 + s, 5, -6 + s, 6, CL);
    if (!lpush) put(-6 + s, -1, 0); if (!rpush) put(6, -1, 0);
    folds([-3 + s], -7, -4, CD); folds([2], -5, -2, CD);
    run(-5 + s, 5, -17, CL); trap(-16, -11, -5 + s, 5, -5 + s, 5, CL);
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
    return back ? null : [-2 + s, -15];
  },
  side(P) {
    const pl = hemPush(P), tr = P.trail;
    const fh = 3 + (pl > 0 ? 1 : 0), bh = -5 + Math.min(0, q(tr * 0.6));
    toesSide(P, fh, bh);
    trap(-10, -1, -3, 3, bh, fh, CL); folds([0], -7, -4, CD); folds([-2], -4, -2, CD);
    trap(-17, -11, -3, 3, -3, 3, CL); put(4, -15, CL); put(4, -14, CL);
    for (let v = -17; v <= -10; v++) { const c = 2 - q((v + 17) * 0.6); run(c - 1, c + 1, v, SH); }
    // конец платка с плеча за спину — висит; на ходу и по ветру отлетает назад, волной
    const k = P.walking ? P.amp : 0;
    for (let i = 0; i < 8; i++) {
      const f = i / 7, wv = Math.sin(t * 0.12 - i * 0.7) * (0.3 + 0.7 * k) * f;
      const u = -3 - q(f * (1 + 3 * k) - Math.min(0, tr) * f * 0.6 + wv);
      put(u, -16 + i, SH); put(u - 1, -16 + i, SH);
    }
    return [4, -15];
  },
};

// ярусы: накидка в два яруса — зубцы широкие, края ярусов по бокам длиннее (крылья), ряса узкая
CUTS.tiers = {
  sleeve: CL, seat: 'robe', cloth: CD,
  front(P, s, back) {
    const pl = hemPush(P), lpush = P.foot > 0 ? pl : 0, rpush = P.foot < 0 ? pl : 0;
    toesFront(P, back);
    trap(-8, -1, -4 + s, 4, -5 + s, 5, CD);
    for (const u of [-4, -1, 2]) run(u + (u < 0 ? s : 0), u + 1, 0, CD);
    if (lpush) run(-5 + s, -1, 0, CD); if (rpush) run(1, 5, 0, CD);
    // второй ярус: по бокам до колен, к середине короче
    trap(-12, -9, -6 + s, 6, -7 + s, 7, CL);
    for (const [u0, u1, v1] of [[-7, -6, -5], [-5, -4, -7], [-2, -1, -8], [2, 3, -8], [4, 5, -7], [6, 7, -5]]) trap(-8, v1, u0 + (u0 < 0 ? s : 0), u1, u0 + (u0 < 0 ? s : 0), u1, CL);
    // первый ярус от капюшона: верх на свету, зубцы, тень на втором
    run(-4, 4, -18, HD); run(-6 + s, 6, -17, LT); trap(-16, -14, -6 + s, 6, -7 + s, 7, CL);
    for (const [u0, u1] of [[-7, -6], [-4, -3], [3, 4], [6, 7]]) run(u0 + (u0 < 0 ? s : 0), u1, -13, CL), run(u0 + (u0 < 0 ? s : 0), u1, -12, CL);
    for (const u of [-5, -2, -1, 1, 2, 5]) put(u, -13, DP);
    if (!back) for (let v = -16; v <= -13; v++) { put(s, v, DP); if (v >= -15) put(1 + s, v, DP); }
    else for (let v = -16; v <= -9; v++) put(0, v, CD);
    return back ? null : [s, -15];
  },
  side(P) {
    const pl = hemPush(P), tr = P.trail;
    const fh = 3 + (pl > 0 ? 1 : 0), bh = -4 + Math.min(0, q(tr * 0.6));
    toesSide(P, fh, bh);
    trap(-8, -1, -2, 2, bh, fh, CD);
    // ярусы откинуты назад; задние зубцы длиннее и уходят по ветру
    const b2 = -6 + Math.min(0, q(tr * 0.8)) - (P.walking ? 1 : 0), b1 = b2 + 1;
    trap(-12, -9, -3, 3, b2, 3, CL);
    for (const [u, v1] of [[b2, -5], [b2 + 2, -6], [b2 + 4, -7], [1, -8]]) { put(u, v1, CL); trap(-8, v1, u, u + 1, u, u + 1, CL); }
    run(-3, 2, -18, HD); run(-3, 3, -17, LT); trap(-16, -14, -3, 3, b1, 4, CL);
    for (const u of [b1, b1 + 3, 1]) run(u, u + 1, -13, CL), run(u, u + 1, -12, CL);
    for (const u of [b1 + 2, 0]) put(u, -13, DP);
    return [4, -15];
  },
};

// ── вид: какой рисунок и зеркало ──
const VIEWMAP = { S: ['front', 0, false, false], SE: ['front', 1, false, false], SW: ['front', 1, true, false],
  E: ['side', 0, false, false], W: ['side', 0, true, false],
  N: ['front', 0, false, true], NE: ['front', 1, false, true], NW: ['front', 1, true, true] };

// огонёк у сердца (как в player.js): свеча, сплошной; в порыв дрожит; на вдохе выше
function ember(player, P, fx, fy) {
  const ice = (player.cold || 0) > 0.5, F = ice ? AS : SV, F0 = ice ? S2 : KV, low = player.ember !== undefined && player.ember < 0.3;
  const flick = P.flick;
  const r = (x, y, w, h, c) => { X.fillStyle = c; X.fillRect(q(x), q(y), w, h); };
  r(fx, fy + 1, 2, 1, F0);
  r(fx, fy, 2, 1, F);
  const up = Math.round(3 * (player.flare || 0)), tg = player.tug, tx = tg ? (tg.x > 0 ? 2 : tg.x < 0 ? -1 : 0) : 0, ty = tg && tg.y < 0 ? 1 : 0;
  if (!low || up) r(fx + (tg && tg.x ? tx : (flick > 0.1 ? 1 : 0)), fy - 1 - (flick > 0.25 ? 1 : 0) - up - ty, 1, 1 + (flick > 0.25 ? 1 : 0) + up + ty, F);
  if ((flick > 0.3 || (player.pulse || 0) > 0.45) && !ice) r(fx, fy, 1, 1, L1);
  if (!ice && t % 9 === 0 && ((t / 9) % 3 | 0) === 0) {
    const w = P.w;
    X.globalAlpha = 0.6; r(fx + (tg ? tg.x * 4 : q(w.x * 3)), fy - 3 + (tg ? tg.y * 6 : 0), 1, 1, SV); X.globalAlpha = 1;
  }
}

export function drawCut(player, P, name) {
  const C = CUTS[name];
  M.fill(0);
  const [kind, s, flip, back] = VIEWMAP[P.view] || VIEWMAP.S;
  FLIP = flip; PX = P.x + 7; PY = P.y + 22;
  // поза: вес на опоре, осел, дыхание (плечи, потом голова), сидя — ниже; наклон — по ходу
  // сесть: сперва колени (верх ниже на 2), с середины — сидит: вся фигура на 7 ниже, низ — seat()
  const seated = P.sit > 0.5 && kind !== 'side';
  const sitD = seated ? 5 + q(2 * Math.min(1, (P.sit - 0.5) * 2)) : q(4 * P.sit);
  const down = (P.kind === 'stone' && P.tp > 0.6) || (P.kind === 'pit' && P.tp > 0.5) ? 1 : 0;
  P.down = down;
  BY = P.dip - P.bSh + sitD; HY = -P.bHd + down + P.dipH; SEAT = seated ? 1 : 0;
  LEAN = kind === 'side' ? (flip ? -P.lean : P.lean) : 0;                // клевок о камень — уже в наклоне (pose)
  // яма — проседает; вброд, в зыби, снегу и мху — ступней не видно
  CLIP = P.kind === 'pit' ? -q(2 * P.tp) : !P.feet && P.sit < 0.5 ? -2 : 99;
  // ход по экрану: фазу ноги — по зеркалу
  const PP = Object.assign({}, P, { swayU: 0 });
  if (P.sit > 0.5) PP.walking = false;
  let heart;
  if (kind === 'side') {
    heart = C.side(PP);
    if (C.head === 'wrap') wrap('E'); else hood('E');
  } else {
    heart = C.front(PP, s, back);
    if (C.head === 'wrap') wrap(back ? 'N' : s ? 'Q' : 'S'); else hood(back ? (s ? 'NQ' : 'N') : s ? 'Q' : 'S');
  }
  // ладонь козырьком (лицом к зрителю): плечо в сторону, предплечье стоймя, кисть над тьмой — «Г»
  if (P.visorK > 0 && kind !== 'side') {
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
  // тень у земли
  X.globalAlpha = 0.35; X.fillStyle = NI; X.fillRect(P.x + 1, P.y + 23, 13, 1); X.globalAlpha = 1;
  // свет и кромки по сетке → холст (ряд за рядом, одинаковые подряд — одним прямоугольником)
  for (let gv = 0; gv < GH; gv++) {
    let runC = null, runX = 0, runN = 0;
    const flush = () => { if (runN) { X.fillStyle = runC; X.fillRect(runX, PY + gv - OV, runN, 1); } runN = 0; };
    for (let gx = 0; gx < GW; gx++) {
      const su = gx - OU;                                         // экранная колонка от оси
      const mu = FLIP ? -su : su;                                  // колонка в сетке
      const v = gv - OV, m = at(mu, v);
      let c = null;
      if (m) {
        const A = MAT[m];
        const lN = at(FLIP ? -(su - 1) : su - 1, v), rN = at(FLIP ? -(su + 1) : su + 1, v);
        c = A.b;
        if (A.d && !at(mu, v + 1)) c = A.d;
        else if (A.t && !at(mu, v - 1)) c = A.t;
        else if (A.l && !lN) c = A.l;
        else if (A.r && !rN) c = A.r;
      }
      const sx = PX + su;
      if (c === runC && c && sx === runX + runN) runN++;
      else { flush(); if (c) { runC = c; runX = sx; runN = 1; } else runC = null; }
    }
    flush();
  }
  // спиной: отсвет огонька по краю ткани
  if (back && !((player.cold || 0) > 0.5)) {
    const gh = P.flick > 0.2 ? 3 : 2, [lx, ly] = scr(-6, -15), [rx] = scr(6, -15);
    X.fillStyle = GL;
    if (P.side <= 0) X.fillRect(Math.min(lx, rx) - 0, ly, 1, gh);
    if (P.side >= 0) X.fillRect(Math.max(lx, rx), ly, 1, gh);
  }
  if (heart) { const [fx, fy] = scr(heart[0], heart[1] + 0); ember(player, P, FLIP ? fx - 1 : fx, fy); }
  const em = C.head === 'wrap' ? (kind === 'side' ? 'slitE' : s ? 'slitQ' : 'slitS') : (kind === 'side' ? 'E' : s ? 'Q' : 'S');
  if (!back && !(P.visorK >= 1 && kind !== 'side')) eyes(em, P, (player.cold || 0) > 0.5);
}

// основной крой — пыльник (слово автора 28.10); ?cut= в адресе — на пробу, без сохранения
let pick = 'duster', pinned = false;
try { const m = /[?&]cut=(\w+)/.exec(typeof location !== 'undefined' ? location.search : ''); if (m && Object.hasOwn(CUTS, m[1])) { pick = m[1]; pinned = true; } } catch (e) { /* без адреса — пыльник */ }
export const CUT = pick;
export const CUT_PINNED = pinned;                                 // крой задан адресом — надетое в мире не рисуется
export { CUTS };
