// ═══════════════════════════════════════
// СТРАННИК — по ART_BIBLE §05. «Лица нет — капюшон и тьма; рваная ткань
// слоями, как оперение; огонёк у сердца... следы на пыли — единственная
// биография.» Плащ — три яруса рваной ткани, кончики перьями. Один тёплый
// огонёк у сердца — свеча, без растра; свет вокруг даёт слой света
// (lighting.sources[0]). Подол отстаёт от хода и уходит по ветру; ярусы
// колышутся каждый в свой черёд. Свет слева, кромка пеплом справа.
// Слово автора (23.10): в тьме капюшона — два глаза-уголька, тлеют и изредка
// моргают; идёт вверх — разворачивается спиной, капюшоном к зрителю (огонька
// не видно, только отсвет по краям), идёт на юг — лицом, вбок — в профиль
// (player.face: S · N · E · W, main.js heroStep).
// Походка (world/gait.js, ROADMAP Г8): шаг — по пути: на опоре вес садится на
// точку, из-под подола на миг выглядывает носок стоптанного ботинка (вбок — носок
// впереди, пятка сзади), подол толкает шагающая нога; остановился — дошагал, осел,
// подол по инерции ушёл вперёд и опал; стоя — дышит: раз в четыре секунды плечи
// и капюшон приподнимаются, огонёк на вдохе выше на точку. Оборот — через три
// четверти (SE · NE · NW · SW). Оступился — позой: камень — клюёт вперёд, нога
// упирается; яма — подол лёг, голова вниз; окаменелость — нога едет назад.
// Ладонь козырьком поднимается за восемь тиков, встаёт — за пять.
// У теней чужих и масок тени походки нет — рисунок по флагу хода, как прежде.
// Рамка рисунка: стоя x−4..x+19, y−8..y+24 (тень героя, main.js; маска x−6..x+20).
// ═══════════════════════════════════════
import { X } from '../render/context.js';
import { t } from '../core/time.js';
import { wind } from '../world/wind.js';

const NI = '#0D0B0A', AS = '#8A8D8F', SV = '#E28A3A', KV = '#C23B2B', L1 = '#c8b89a';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K4 = '#3a3328', S2 = '#33302e';
const q = Math.round;
const r = (x, y, w = 1, h = 1, c) => { X.fillStyle = c; X.fillRect(q(x), q(y), w, h); };
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

// ярус плаща: x0..x0+w, от y0 вниз на h; кончики — перьями разной длины; низ сносит на off
const TIP = [0, 2, 1, 3, 0, 1, 2, 0, 3, 1, 2, 0, 1, 3, 0, 2, 1];
function tier(x0, y0, w, h, off, ph) {
  for (let k = 0; k < w; k++) {
    const u = k / (w - 1), len = h + TIP[(k + ph) % TIP.length], xx = x0 + k;
    for (let j = 0; j < len; j++) {
      const v = j / len, sx = q(off * v * (0.5 + u * 0.5));              // низ отстаёт сильнее верха
      const c = j === 0 ? (u < 0.35 ? K4 : u > 0.9 ? AS : K2)            // верхний край ловит свет
        : j === len - 1 ? (k & 1 ? K0 : K2)                              // кончик пера
        : u < 0.15 ? K2 : u > 0.92 ? S2 : v < 0.4 ? K2 : K1;
      r(xx + sx, y0 + j, 1, 1, c);
    }
  }
}
// вид: сторона (−1…1: в профиль ±1, в три четверти ±0.5) и спиной ли
const SIDE = { S: 0, SE: 0.5, E: 1, NE: 0.5, N: 0, NW: -0.5, W: -1, SW: -0.5 };
// тьма лица и глаза по виду (от левого края капюшона): [сдвиг, ширина, глаза]
const FACE = { S: [0, 5, [3, 5]], SE: [1, 4, [4, 6]], E: [2, 4, [6]], SW: [-1, 4, [2, 4]], W: [-1, 4, [1]] };
// носок стоптанного ботинка: сверху вытертая кожа ловит свет (слева), под ним тень на земле
const BT = '#5c564e';
const toe = (x, y, w = 2) => { r(x, y, w, 1, K2); r(x, y, 1, 1, BT); r(x, y + 1, w, 1, NI); };

export function drawPlayer(player) {
  const x = Math.floor(player.x), y = Math.floor(player.y);
  const g = player.gait, red = !!(g && g.red);
  const w = wind.at(x + 6, y + 12), vx = player.vx || 0;
  // походка: у своего героя — из world/gait.js; у теней чужих и масок — по флагу хода
  const amp = g ? g.amp : (player.moving ? 1 : 0);
  const phase = g ? g.phase : t * 0.042;
  const fr = phase - Math.floor(phase), foot = Math.floor(phase) & 1 ? 1 : -1;
  const sit = g ? g.sitV : (player.sit || 0), sk = q(3 * sit);
  const view = g ? g.view : (player.visor || sit > 0.5 ? 'S' : (player.face || 'S'));
  const side = SIDE[view] || 0, back = view.includes('N'), sd = Math.sign(side);
  const visorK = g ? g.visorK : (player.visor ? 1 : 0);
  const trip = g && g.trip, tp = trip ? trip.p : 0, td = trip ? (trip.dir || 1) : 0;
  const heavy = g && g.heavy;
  // вес на опоре — вниз на точку (в вязком — на две); остановился — осел; стоя — дышит
  const contact = amp > 0.3 && !red && (fr < 0.16 || fr > 0.92);
  const dip = (contact ? 1 + (heavy && fr < 0.08 ? 1 : 0) : 0) + (g && g.settle > 0.5 && !red ? 1 : 0);
  const still = 1 - Math.min(1, amp * 2);
  const breath = red || sit > 0.5 ? 0 : (still > 0.5 && Math.sin(t * Math.PI * 2 / 240) > 0.35 ? 1 : 0);
  const sway = red ? 0 : q(Math.sin(t * 0.02) * 0.6 * still);
  const trail = clamp(g ? g.hem : w.x * 2.4 - vx * 0.7, -3, 3) - td * 2 * tp * (trip && trip.kind !== 'pit' ? 1 : 0);
  // наклон в ход: бегом — сильнее; оступился — клюёт
  const run = g ? g.run : 0;
  const lean = clamp(q(vx * (run > 0.5 ? 0.6 : 0.45)), run > 0.5 ? -2 : -1, run > 0.5 ? 2 : 1) + q(td * tp * (trip && trip.kind === 'stone' ? 2 : 1));
  // огонёк дрожит в порыв; под землёй его прибивает чужой сквозняк (gust), а после вдоха на пороге горит ровнее (steady)
  const flick = (0.15 + w.s * 0.25 + 0.3 * (player.gust || 0) + 0.6 * tp) * (player.steady ? 0.35 : 1) * Math.sin(t * (0.45 + w.s * 0.3 + 0.4 * (player.gust || 0)) + Math.sin(t * 0.1) * 2);
  const cx = x + sway, top = y + q(dip * (1 - 0.5 * sit)) + 2 * sk;
  // следы и тень — у земли
  X.globalAlpha = 0.35; r(x + 1 - sk, y + 23, 12 + 2 * sk, 1, NI); X.globalAlpha = 1;
  // шагающая нога толкает подол: вбок — вперёд по ходу, к зрителю и спиной — поочерёдно в стороны
  const push = red ? 0 : amp * Math.sin(Math.PI * fr);
  const swing = q(sd ? sd * push : foot * push);
  // яма: подол ложится на край, середина короче
  const pit = trip && trip.kind === 'pit' ? tp : 0;
  // ── ярусы плаща снизу вверх: подол, середина, оплечье ──
  const ph = (t >> 4) & 7;
  tier(cx - 2 - q(2 * sit) - q(2 * pit), top + 15 - sk, 18 + q(4 * sit) + q(4 * pit), 6 - sk - q(pit), trail + swing, ph);
  r(cx - 1, top + 15 - sk, 16, 1, K0);                                   // тень от среднего яруса
  tier(cx - 1 + q(td * tp * 0.5), top + 9 - breath, 16, 6 - sk + breath, trail * 0.55 + (red ? 0 : Math.sin(t * 0.05) * 0.4 * still), ph + 5);
  r(cx, top + 9 - breath, 14, 1, K0);                                    // тень от оплечья
  tier(cx + 1 + q(td * tp), top + 4 - breath, 12, 5, trail * 0.25, ph + 9);
  // ── носки ботинков: на опоре выглядывают из-под подола; стоя лицом — оба ──
  if (sit < 0.5) {
    const gy = y + 22;
    if (trip && trip.kind === 'stone' && tp > 0.2) toe(cx + 6 + td * 9 - (td < 0 ? 1 : 0), gy);   // нога упёрлась вперёд
    else if (trip && trip.kind === 'fossil' && tp > 0.2) toe(cx + 6 - td * (6 + q(4 * tp)) - (td > 0 ? 1 : 0), gy);   // едет назад
    else if (amp > 0.35 && !back && !sd && fr < 0.4) toe(foot < 0 ? cx + 3 + q(side * 2) : cx + 9 + q(side * 2), gy);
    else if (amp > 0.35 && sd && side === sd && Math.abs(side) === 1) {
      if (fr < 0.4) toe(sd > 0 ? cx + 15 : cx - 3, gy);                 // вбок: носок впереди
      else if (fr > 0.55) { r(sd > 0 ? cx - 3 : cx + 16, gy, 1, 1, K2); r(sd > 0 ? cx - 3 : cx + 16, gy + 1, 1, 1, NI); }   // пятка сзади отрывается
    } else if (amp > 0.35 && back && fr < 0.4) { r(foot < 0 ? cx + 4 : cx + 9, gy + 1, 2, 1, NI); r(foot < 0 ? cx + 4 : cx + 9, gy, 1, 1, K2); }   // спиной — пятка
    else if (amp <= 0.35 && view === 'S' && !trip) { toe(cx + 3, gy); toe(cx + 9, gy); }   // стоит лицом — оба носка
  }
  // ── огонёк у сердца: свеча, сплошной; в порыв дрожит; на вдохе выше ──
  // в криосклепе тёплого нет (канон U7) — огонёк пеплом; под землёй тускнеет — язычок ниже
  const ice = (player.cold || 0) > 0.5, F = ice ? AS : SV, F0 = ice ? S2 : KV, low = player.ember !== undefined && player.ember < 0.3;
  const fx = cx + 5 + lean + q(side * 2), fy = top + 9 - breath;
  if (back) {
    // спиной: огонёк впереди, за плащом — только отсвет по краям ярусов (в три четверти — с одного)
    if (!ice) {
      X.globalAlpha = 0.32;
      if (side <= 0) r(cx - 1, fy + 1, 1, 2, SV);
      if (side >= 0) r(cx + 14, fy + 1, 1, 2, SV);
      X.globalAlpha = 1;
    }
  } else {
    r(fx, fy + 1, 2, 2, F0);
    r(fx, fy, 2, 2, F);
    // язычок: пламя встало свечкой (flare) — выше; на развилке тянется к выходу (tug); вдох — на точку
    const up = Math.round(3 * (player.flare || 0)) + breath, tg = player.tug, tx = tg ? (tg.x > 0 ? 2 : tg.x < 0 ? -1 : 0) : 0, ty = tg && tg.y < 0 ? 1 : 0;
    if (!low || up) r(fx + (tg && tg.x ? tx : (flick > 0.1 ? 1 : 0)), fy - 1 - (flick > 0.25 ? 1 : 0) - up - ty, 1, 1 + (flick > 0.25 ? 1 : 0) + up + ty, F);
    if ((flick > 0.3 || (player.pulse || 0) > 0.45) && !ice) r(fx, fy, 1, 1, L1);   // в порыв вспыхивает; в ходе мха — на ударе сердца
    if (!ice && t % 9 === 0 && ((t / 9) % 3 | 0) === 0) {                 // искру сносит ветром; на развилке — тянет к выходу
      X.globalAlpha = 0.6; r(fx + (tg ? tg.x * 4 : q(w.x * 3)), fy - 3 + (tg ? tg.y * 6 : 0), 1, 1, SV); X.globalAlpha = 1;
    }
  }
  // ── капюшон: в тьме — два уголька; спиной — тьмы не видно, шов по капюшону ──
  const tipK = view === 'E' ? -1 : view === 'W' ? 1 : 0;               // острие клобука в профиль отстаёт назад
  const hx = cx + 2 + lean, hy = top - 4 - breath + (pit > 0.5 ? 1 : 0);
  r(hx + 4 + tipK, hy - 2, 1, 1, K2); r(hx + 3 + tipK, hy - 1, 3, 1, K2);
  r(hx + 1, hy, 7, 1, K2); r(hx, hy + 1, 9, 8, K1);
  r(hx, hy + 1, 1, 7, K4); r(hx + 1, hy, 2, 1, K4); r(hx + 8, hy + 2, 1, 6, AS);   // к свету; кромка пеплом
  if (back) {
    const sx = 4 - q(side * 2);                                           // шов уходит от стороны, куда повернулся
    r(hx + sx, hy + 1, 1, 8, K0); r(hx + sx - 1, hy + 2, 1, 5, K2);       // спина капюшона: шов и складка
    if (side > 0) r(hx + 7, hy + 3, 1, 4, NI);                           // в три четверти — краешек тьмы
    else if (side < 0) r(hx + 1, hy + 3, 1, 4, NI);
  } else {
    // тьма лица: анфас — посередине, в три четверти и в профиль — к переднему краю
    const [o, wd, eyes] = FACE[view] || FACE.S;
    r(hx + 2 + o, hy + 3, wd, 5, NI); r(hx + 3 + o, hy + 2, wd - 2, 1, NI); r(hx + 2 + o, hy + 8, wd, 1, NI);
    // глаза-угольки: тлеют, раз в четыре с лишним секунды моргают; оступился — зажмурился
    if (t % 260 >= 6 && tp < 0.4) {
      const glow = ice ? AS : SV, a = 0.55 + 0.25 * Math.sin(t * 0.12);
      X.globalAlpha = a;
      for (const e of eyes) r(hx + e, hy + 5 + (pit > 0.5 ? 1 : 0), 1, 1, glow);
      X.globalAlpha = 1;
    }
  }
  for (const k of [0, 2, 5, 7]) r(hx + k, hy + 9, 1, 1 + (k & 1), K1);     // рваный край на оплечье
  // ладонь козырьком (за кольцом — смотреть горизонт): правый рукав вверх, локоть в сторону, ладонь над тьмой;
  // поднимается за восемь тиков: сперва плечо и локоть, потом предплечье и ладонь
  if (visorK > 0) {
    r(hx + 10, top + 5, 1, 2, K1);                                        // плечо
    if (visorK >= 0.5) { r(hx + 11, top + 3, 1, 2, K2); r(hx + 12, top + 2, 1, 2, AS); }   // локоть — кромкой пеплом
    else r(hx + 11, top + 4, 1, 2, K2);
    if (visorK >= 1) {
      r(hx + 10, top + 1, 1, 2, K2); r(hx + 9, hy + 3, 1, 2, K2);                               // предплечье к виску
      r(hx + 1, hy + 2, 8, 1, K4); r(hx + 2, hy + 3, 6, 1, K1); r(hx, hy + 2, 1, 1, AS);         // ладонь: сверху свет, снизу тень на лицо
    } else if (visorK >= 0.5) r(hx + 10, top + 2, 1, 2, K2);
  }
}
