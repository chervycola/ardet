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
// Походка (world/gait.js, ROADMAP Г8). Ноги не видны — их читает подол: вбок на
// опоре колено выносит переднюю треть ткани, между ногами просвет перевёрнутой V,
// отстающая нога тянет заднюю треть; к зрителю и спиной — половина подола со стороны
// шагающей ноги длиннее. Подол и носки стоят на земле; вес несёт верх: на опоре
// капюшон, оплечье и середина садятся на точку (ткань середины сминается), верх
// качается к опорной ноге. Из-под подола на опоре выглядывает носок стоптанного
// ботинка (вбок — носок впереди, пятка сзади у угла подола; спиной — пятка; стоя
// лицом — оба носка); в воде, зыби, снегу и мху ног не видно. Бахрома ярусов
// перекладывается медленно, каждая в свой такт, на ходу у подола — на опоре.
// Остановился — дошагал, осел, подол по инерции ушёл вперёд и опал. Стоя дышит раз
// в шесть секунд (как угли): сперва плечи, потом капюшон и огонёк; выдох — сверху.
// Оборот — через три четверти: тьма лица сужается, дальний глаз тусклее, шов
// капюшона обходит голову (N · NE · E · SE), острие отстаёт, в профиль козырёк
// капюшона выступает, плащ уже. Оступился — позой: камень — клюёт верхом, нога
// упёрлась; яма — подол уходит в яму, голова вниз; окаменелость — нога и подол едут
// назад, верх на месте; зажмурился. Ладонь козырьком — рукавом: плечо, локоть,
// предплечье к виску, ладонь над тьмой; поднимается, когда обернулся.
// У теней чужих и масок тени походки нет — рисунок по флагу хода и часам.
// Рамка рисунка: стоя x−4..x+19, y−8..y+24 (тень героя, main.js; маска x−6..x+20).
// ═══════════════════════════════════════
import { X } from '../render/context.js';
import { t } from '../core/time.js';
import { wind } from '../world/wind.js';
import { CUTS, CUT, drawCut } from './wardrobe.js';

const NI = '#0D0B0A', AS = '#8A8D8F', SV = '#E28A3A', KV = '#C23B2B', L1 = '#c8b89a';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K4 = '#3a3328', S2 = '#33302e';
const BT = '#5c564e';                 // вытертая кожа носка — ловит свет
const GL = '#5a4232';                 // спиной: отсвет огонька по краю ткани — тусклый, сплошной
const q = Math.round;
const r = (x, y, w = 1, h = 1, c) => { X.fillStyle = c; X.fillRect(q(x), q(y), w, h); };
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

// ярус плаща: x0..x0+w, от y0 вниз на h; кончики — перьями разной длины; низ сносит на off.
// ph перекладывает бахрому — только каждую третью колонку; rim — кромка справа вверху;
// legs(u) → [длина, сдвиг низа] — ноги под тканью (только подол)
const TIP = [0, 2, 1, 3, 0, 1, 2, 0, 3, 1, 2, 0, 1, 3, 0, 2, 1];
const NOLEG = [0, 0];
function tier(x0, y0, w, h, off, ph, rim = AS, legs = null) {
  for (let k = 0; k < w; k++) {
    const u = k / (w - 1), [dl, dx] = legs ? legs(u) : NOLEG;
    const len = Math.max(2, h + TIP[(k + (k % 3 === 0 ? ph : 0)) % TIP.length] + dl), xx = x0 + k;
    for (let j = 0; j < len; j++) {
      const v = j / len, sx = q(off * v * (0.5 + u * 0.5)) + (j >= len * 0.5 ? dx : 0);   // низ отстаёт сильнее верха
      const c = j === 0 ? (u < 0.35 ? K4 : u > 0.9 ? rim : K2)           // верхний край ловит свет
        : j === len - 1 ? (k & 1 ? K0 : K2)                              // кончик пера
        : u < 0.15 ? K2 : u > 0.92 ? S2 : v < 0.4 ? K2 : K1;
      r(xx + sx, y0 + j, 1, 1, c);
    }
  }
}
// вид: сторона (−1…1: в профиль ±1, в три четверти ±0.5)
const SIDE = { S: 0, SE: 0.5, E: 1, NE: 0.5, N: 0, NW: -0.5, W: -1, SW: -0.5 };
// тьма лица и глаза по виду (от левого края капюшона): [сдвиг, ширина, глаза, дальний глаз]
const FACE = { S: [0, 5, [3, 5], -1], SE: [1, 4, [4, 6], 6], E: [3, 3, [6], -1], SW: [0, 4, [2, 4], 2], W: [-1, 3, [2], -1] };
// шов капюшона обходит голову: где он в каждом виде (лицом — его не видно)
const SEAM = { N: 4, NE: 3, E: 2, SE: 1, NW: 5, W: 6, SW: 7 };
// острие клобука отстаёт назад от взгляда
const TIPK = { S: 0, N: 0, SE: -1, NE: -1, E: -2, SW: 1, NW: 1, W: 2 };
// носок: кожа сверху (кончик вперёд — светлее), под ним мягкая тень
function toe(x, y, w, fwd) {
  r(x, y, w, 1, K4);
  r(fwd > 0 ? x + w - 1 : x, y, 1, 1, BT);
  X.globalAlpha = 0.5; r(x, y + 1, w, 1, NI); X.globalAlpha = 1;
}

// поза кадра — общая для всех кроёв (sprites/wardrobe.js): ход, вид, вес, дыхание, ветер, оступился
export function pose(player) {
  const x = Math.floor(player.x), y = Math.floor(player.y);
  const g = player.gait, red = !!(g && g.red);
  const w = wind.at(x + 6, y + 12), vx = player.vx || 0;
  // походка: у своего героя — из world/gait.js; у теней чужих и масок — по флагу хода и часам
  const amp = g ? g.amp : (player.moving ? 1 : 0);
  const phase = g ? g.phase : t * 0.042;
  const fr = phase - Math.floor(phase), foot = Math.floor(phase) & 1 ? 1 : -1;
  const sit = g ? g.sitV : (player.sit || 0), sk = q(3 * sit);
  const view = g ? g.view : (player.visor || sit > 0.5 ? 'S' : (SIDE[player.face] !== undefined ? player.face : 'S'));
  const side = SIDE[view] || 0, back = view.includes('N'), sd = Math.sign(side), prof = Math.abs(side) === 1;
  const visorK = g ? g.visorK : (player.visor ? 1 : 0);
  const trip = g && g.trip, tp = trip ? trip.p : 0, kind = trip ? trip.kind : '';
  const tdx = trip ? sd : 0;                                             // клевок — по взгляду; лицом и спиной — вниз
  const feet = (!g || g.feet) && sit < 0.5 && kind !== 'pit';
  const walking = amp > 0.35 && !trip;
  const reverse = sd !== 0 && Math.abs(vx) > 0.3 && Math.sign(vx) !== sd;   // разворот на ходу: ноги ещё идут в старую сторону
  // вес на опоре (двойная опора — дольше), осел на остановке: верх на точку ниже; в вязком капюшон — на две
  const contact = amp > 0.3 && !red && (fr < 0.3 || fr > 0.92);
  const dip = Math.max(contact ? 1 : 0, g && g.settle > 0.5 && !red ? 1 : 0);
  const dipH = contact && g && g.heavy && fr < 0.1 ? 1 : 0;
  // дыхание — только в покое: у своего — с остановки (gait.calm), у теней — по часам; сперва плечи, потом голова
  const still = 1 - Math.min(1, amp * 2);
  const bt = g ? g.calm - 40 : t;
  const bs = !red && sit < 0.5 && still > 0.5 && bt > 0 ? Math.sin(bt * Math.PI * 2 / 360) : 0;
  const bSh = bs > 0.15 ? 1 : 0, bHd = bs > 0.45 ? 1 : 0;
  // покачивание стоя и качание к опорной ноге на ходу — только верхом; ноги стоят
  const swayU = red ? 0 : q(Math.sin(t * 0.02) * 0.6 * still) + (walking && !sd && fr < 0.5 ? foot : 0);
  const trail = clamp(g ? g.hem : w.x * 2.4 - vx * 0.7, -3, 3) - tdx * tp;
  // наклон в ход: бегом — сильнее; оступился о камень — клюёт верхом
  const run = g ? g.run : 0;
  const lean = clamp(q(vx * (run > 0.5 ? 0.6 : 0.45)), run > 0.5 ? -2 : -1, run > 0.5 ? 2 : 1) + (kind === 'stone' ? q(2 * tp) * tdx : 0);
  const flick = (0.15 + w.s * 0.25 + 0.3 * (player.gust || 0) + 0.6 * tp) * (player.steady ? 0.35 : 1) * Math.sin(t * (0.45 + w.s * 0.3 + 0.4 * (player.gust || 0)) + Math.sin(t * 0.1) * 2);
  const cx = x + swayU, top = y + 2 * sk + dip;
  const push = red || reverse ? 0 : amp * Math.sin(Math.PI * fr);
  return { x, y, g, red, w, vx, amp, phase, fr, foot, sit, sk, view, side, back, sd, prof, visorK, trip, tp, kind, tdx, feet, walking, reverse,
    contact, dip, dipH, still, bs, bSh, bHd, swayU, trail, run, lean, flick, cx, top, push };
}

export function drawPlayer(player) {
  const cut = player.cut || CUT;
  if (cut !== 'plumage' && CUTS[cut]) { drawCut(player, pose(player), cut); return; }
  const { x, y, g, red, w, vx, amp, phase, fr, foot, sit, sk, view, side, back, sd, prof, visorK, trip, tp, kind, tdx, feet, walking, reverse,
    contact, dip, dipH, still, bs, bSh, bHd, swayU, trail, run, lean, flick, cx, top, push } = pose(player);
  // следы и тень — у земли
  X.globalAlpha = 0.35; r(x + 1 - sk, y + 23, 12 + 2 * sk, 1, NI); X.globalAlpha = 1;
  // ── подол: стоит на земле; ноги читаются его контуром ──
  const nar = prof ? 2 : side ? 1 : 0;                                   // в профиль и в три четверти плащ уже
  const pit = kind === 'pit' ? tp : 0, fos = kind === 'fossil' ? q(2 * tp) * tdx : 0;
  const hemX = x - 2 - q(2 * sit) + (nar >> 1) + q(2 * pit) - fos;
  const hemW = 18 + q(4 * sit) - nar - q(4 * pit);
  const hemY = y + 15 + sk - q(2 * pit);
  const swing = q(sd ? sd * push : foot * push);
  let legs = null;
  if (walking && !reverse && !red) {
    if (sd) legs = u => {
      const fwd = sd > 0 ? u : 1 - u;                                    // 0 — сзади, 1 — спереди
      if (fr < 0.4 && fwd > 0.66) return [1, sd];                        // колено вынесло ткань вперёд
      if (fr > 0.1 && fr < 0.4 && fwd > 0.38 && fwd < 0.62) return [-2, 0];   // просвет между ногами
      if (fr > 0.5 && fr < 0.9 && fwd < 0.34) return [0, -sd];           // отстающая нога тянет назад
      return NOLEG;
    };
    else if (fr < 0.7) legs = u => ((u > 0.5) === (foot > 0) ? [1, 0] : [-1, 0]);
  } else if (sit > 0.2) legs = () => [q(sit), 0];                       // сидя кончики лежат на земле
  const phH = walking ? Math.floor(phase) : (t >> 6);
  tier(hemX, hemY, hemW, 6 - sk, trail + swing, phH & 7, AS, legs);
  r(Math.min(cx - 1, hemX), hemY, Math.max(16, hemW), 1, K0);           // тень от середины — на всю ширину подола
  // ── середина и оплечье: несут вес и дыхание ──
  const midY = top + 9 - bSh, midH = 6 - sk + bSh - dip;
  tier(cx - 1 + (nar >> 1) + (kind === 'stone' ? q(tp * 0.5) * tdx : 0), midY, 16 - nar, midH, trail * 0.55 + (red ? 0 : Math.sin(t * 0.05) * 0.4 * still) + swayU * 0.5, ((t + 23) >> 6) & 7, S2);
  r(cx + (nar >> 1), midY, 14 - nar, 1, K0);                              // тень от оплечья
  tier(cx + 1 + (nar >> 1) + (kind === 'stone' ? q(tp) * tdx : 0), top + 4 - bSh, 12 - nar, 5, trail * 0.25, ((t + 41) >> 6) & 7, S2);
  // ── носки ботинков: на опоре выглядывают из-под подола; ноги — на земле, не качаются ──
  if (feet) {
    // края подола у земли — с ветром и шагом; носок не уходит за рамку маски тени (x−5..x+19)
    const gy = y + 22, hb = Math.min(x + 16, hemX + hemW - 1 + q(trail + swing)), hf = Math.max(x - 2, hemX + q((trail + swing) * 0.5));
    if (kind === 'stone' && tp > 0.2) { if (sd) toe(sd > 0 ? hb + 1 : hf - 3, gy, 3, sd); else toe(x + 5, gy, 2, 0); }   // нога упёрлась
    else if (kind === 'fossil' && tp > 0.2) { if (sd) toe(sd > 0 ? hf - 2 : hb + 1, gy, 2, -sd); }   // едет назад (лицом — уходит под подол)
    else if (walking && !reverse) {
      if (prof) {
        if (fr < 0.4) toe(sd > 0 ? hb + 1 : hf - 3, gy, 3, sd);          // вбок: носок впереди
        else if (fr > 0.55 && fr < 0.9) r(sd > 0 ? hf - 1 : hb + 1, gy + 1, 1, 1, K4);   // пятка сзади, у угла подола
      } else if (!back && fr < 0.4) toe(foot < 0 ? x + 3 + q(side * 2) : x + 9 + q(side * 2), gy, 2, 0);
      else if (back && fr < 0.4) r(foot < 0 ? x + 4 : x + 9, gy + 1, 2, 1, K4);   // спиной — пятка
    } else if (amp <= 0.35 && view === 'S' && !trip) { toe(x + 3, gy, 2, 0); toe(x + 9, gy, 2, 0); }   // стоит лицом — оба носка
  }
  // ── огонёк у сердца: свеча, сплошной; в порыв дрожит; на вдохе выше ──
  // в криосклепе тёплого нет (канон U7) — огонёк пеплом; под землёй тускнеет — язычок ниже
  const ice = (player.cold || 0) > 0.5, F = ice ? AS : SV, F0 = ice ? S2 : KV, low = player.ember !== undefined && player.ember < 0.3;
  const fx = cx + 5 + lean + q(side * 4), fy = top + 9 - bSh - bHd;
  if (back) {
    // спиной: огонёк впереди, за плащом — только отсвет по краю ткани (в три четверти — с одного), дрожит с огоньком
    if (!ice) {
      const gh = flick > 0.2 ? 3 : 2;
      if (side <= 0) r(cx - 1 + (nar >> 1), fy, 1, gh, GL);
      if (side >= 0) r(cx + 14 - (nar >> 1), fy, 1, gh, GL);
    }
  } else {
    r(fx, fy + 1, 2, 2, F0);
    r(fx, fy, 2, 2, F);
    // язычок: пламя встало свечкой (flare) — выше; на развилке тянется к выходу (tug)
    const up = Math.round(3 * (player.flare || 0)), tg = player.tug, tx = tg ? (tg.x > 0 ? 2 : tg.x < 0 ? -1 : 0) : 0, ty = tg && tg.y < 0 ? 1 : 0;
    if (!low || up) r(fx + (tg && tg.x ? tx : (flick > 0.1 ? 1 : 0)), fy - 1 - (flick > 0.25 ? 1 : 0) - up - ty, 1, 1 + (flick > 0.25 ? 1 : 0) + up + ty, F);
    if ((flick > 0.3 || (player.pulse || 0) > 0.45) && !ice) r(fx, fy, 1, 1, L1);   // в порыв вспыхивает; в ходе мха — на ударе сердца
    if (!ice && t % 9 === 0 && ((t / 9) % 3 | 0) === 0) {                 // искру сносит ветром; на развилке — тянет к выходу
      X.globalAlpha = 0.6; r(fx + (tg ? tg.x * 4 : q(w.x * 3)), fy - 3 + (tg ? tg.y * 6 : 0), 1, 1, SV); X.globalAlpha = 1;
    }
  }
  // ── капюшон: в тьме — два уголька; спиной — тьмы не видно, шов по капюшону ──
  const down = (kind === 'stone' && tp > 0.6) || pit > 0.5 || (kind === 'fossil' && tp > 0.5 && !sd) ? 1 : 0;
  const hx = cx + 2 + lean, hy = top - 4 - bSh - bHd + down + dipH;
  const tk = TIPK[view] || 0;
  r(hx + 4 + tk, hy - 2, 1, 1, K2); r(hx + 3 + tk, hy - 1, 3, 1, K2);   // острие клобука отстаёт от взгляда
  r(hx + 1, hy, 7, 1, K2); r(hx, hy + 1, 9, 8, K1);
  r(hx, hy + 1, 1, 7, K4); r(hx + 1, hy, 2, 1, K4); r(hx + 8, hy + 2, 1, 6, AS);   // к свету; кромка пеплом
  if (prof) r(sd > 0 ? hx + 9 : hx - 1, hy + 1, 1, 3, K2);              // в профиль козырёк капюшона выступает
  const sm = SEAM[view];
  if (sm !== undefined) {
    if (back) { r(hx + sm, hy + 1, 1, 8, K0); r(hx + sm + (sm > 4 ? 1 : -1), hy + 2, 1, 5, K2); }   // спина: шов и складка
    else r(hx + sm, hy + 2, 1, 5, K0);                                    // три четверти и профиль: шов уходит назад
  }
  if (back) {
    if (side > 0) r(hx + 7, hy + 3, 1, 4, NI);                           // в три четверти спиной — краешек тьмы
    else if (side < 0) r(hx + 1, hy + 3, 1, 4, NI);
  } else {
    // тьма лица: анфас — посередине, в три четверти и в профиль — к переднему краю, уже
    const [o, wd, eyes, far] = FACE[view] || FACE.S;
    r(hx + 2 + o, hy + 3, wd, 5, NI); r(hx + 3 + o, hy + 2, Math.max(1, wd - 2), 1, NI); r(hx + 2 + o, hy + 8, wd, 1, NI);
    // глаза-угольки: тлеют, раз в четыре с лишним секунды моргают; дальний — тусклее; оступился — зажмурился
    if (t % 260 >= 6 && tp < 0.4) {
      const glow = ice ? AS : SV, a = 0.55 + 0.25 * Math.sin(t * 0.12);
      for (const e of eyes) { X.globalAlpha = e === far ? a * 0.6 : a; r(hx + e, hy + 5 + down, 1, 1, glow); }
      X.globalAlpha = 1;
    }
  }
  for (const k of [0, 2, 5, 7]) r(hx + k, hy + 9, 1, 1 + (k & 1), K1);     // рваный край на оплечье
  // ── ладонь козырьком (за кольцом — смотреть горизонт): рукав от плеча через локоть к виску, ладонь над тьмой ──
  if (visorK > 0) {
    r(hx + 9, top + 4, 2, 3, K1); r(hx + 9, top + 4, 2, 1, K2);           // плечо: рукав, верх ловит свет
    if (visorK < 0.5) { r(hx + 10, top + 2, 2, 3, K1); r(hx + 11, top + 2, 1, 1, AS); }   // локоть пошёл вверх
    else {
      r(hx + 10, top + 1, 2, 3, K1); r(hx + 11, top + 1, 1, 1, AS); r(hx + 11, top + 4, 1, 1, K1);   // локоть в сторону, рваный край рукава
      if (visorK >= 1) {
        r(hx + 9, hy + 2, 2, 3, K1); r(hx + 9, hy + 2, 1, 1, K2);         // предплечье к виску
        r(hx + 4, hy + 2, 5, 1, K4); r(hx + 4, hy + 2, 1, 1, AS);         // ладонь: сверху свет, кончики пальцев
        r(hx + 3, hy + 3, 5, 1, NI);                                      // тень ладони на тьму лица
      } else r(hx + 9, top, 2, 2, K1);                                    // предплечье на полпути
    }
  }
}
