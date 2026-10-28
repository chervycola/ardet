// ═══════════════════════════════════════
// СТРАННИК — по ART_BIBLE §05. «Лица нет — капюшон и тьма; рваная ткань слоями; огонёк у
// сердца... следы на пыли — единственная биография.» Здесь — поза кадра; рисунок — крой
// из гардероба (sprites/wardrobe.js): по умолчанию пыльник (слово автора 28.10), другие
// крои висят в местах мира и надеваются там (world/garments.js).
// Один тёплый огонёк у сердца — свеча, без растра; свет вокруг даёт слой света
// (lighting.sources[0]). Свет слева, кромка пеплом справа.
// Слово автора (23.10): в тьме капюшона — два глаза-уголька, тлеют и изредка моргают;
// идёт вверх — разворачивается спиной (огонька не видно, только отсвет по краям), идёт
// на юг — лицом, вбок — в профиль (player.face: S · N · E · W, main.js heroStep).
// Походка (world/gait.js, ROADMAP Г8): шаг по пройденному пути; вес несёт верх — на
// опоре плечи и капюшон садятся на точку, верх качается к опорной ноге; ноги и полы
// стоят на земле. Остановился — дошагал, осел, пола по инерции ушла вперёд и опала.
// Стоя дышит раз в шесть секунд (как угли): сперва плечи, потом капюшон и огонёк.
// Оборот — через три четверти: тьма лица сужается, дальний глаз тусклее, шов капюшона
// обходит голову, острие отстаёт. Оступился — позой: камень — клюёт верхом; яма —
// проседает, голова вниз; окаменелость — нога едет назад; зажмурился. Ладонь козырьком —
// рукавом: плечо в сторону, предплечье стоймя, кисть над тьмой; поднимается, когда
// обернулся. Сесть — сперва колени, потом сидит: ткань на земле, носки впереди.
// У теней чужих и масок тени походки нет — рисунок по флагу хода и часам.
// Рамка рисунка: x−6..x+20, y−10..y+24 (маска тени героя, main.js).
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { wind } from '../world/wind.js';
import { CUTS, CUT, drawCut } from './wardrobe.js';

const q = Math.round;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
// вид: сторона (−1…1: в профиль ±1, в три четверти ±0.5)
const SIDE = { S: 0, SE: 0.5, E: 1, NE: 0.5, N: 0, NW: -0.5, W: -1, SW: -0.5 };

// поза кадра — общая для всех кроёв: ход, вид, вес, дыхание, ветер, оступился
export function pose(player) {
  const x = Math.floor(player.x), y = Math.floor(player.y);
  const g = player.gait, red = !!(g && g.red);
  const w = wind.at(x + 6, y + 12), vx = player.vx || 0;
  // походка: у своего героя — из world/gait.js; у теней чужих и масок — по флагу хода и часам
  const amp = g ? g.amp : (player.moving ? 1 : 0);
  const phase = g ? g.phase : t * 0.042;
  const fr = phase - Math.floor(phase), foot = Math.floor(phase) & 1 ? 1 : -1;
  const sit = g ? g.sitV : (player.sit || 0);
  const view = g ? g.view : (player.visor || sit > 0.5 ? 'S' : (SIDE[player.face] !== undefined ? player.face : 'S'));
  const side = SIDE[view] || 0, back = view.includes('N'), sd = Math.sign(side);
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
  const trail = clamp(g ? g.hem : w.x * 2.4 - vx * 0.7, -3, 3) - tdx * tp;
  // наклон в ход: бегом — сильнее; оступился о камень — клюёт верхом
  const run = g ? g.run : 0;
  const lean = clamp(q(vx * (run > 0.5 ? 0.6 : 0.45)), run > 0.5 ? -2 : -1, run > 0.5 ? 2 : 1) + (kind === 'stone' ? q(2 * tp) * tdx : 0);
  const flick = (0.15 + w.s * 0.25 + 0.3 * (player.gust || 0) + 0.6 * tp) * (player.steady ? 0.35 : 1) * Math.sin(t * (0.45 + w.s * 0.3 + 0.4 * (player.gust || 0)) + Math.sin(t * 0.1) * 2);
  return { x, y, g, red, w, vx, amp, phase, fr, foot, sit, view, side, back, sd, visorK, trip, tp, kind, tdx, feet, walking, reverse,
    contact, dip, dipH, still, bSh, bHd, trail, run, lean, flick };
}

// крой: свой у фигуры (сохранён, надет в месте мира), иначе — основной
export const cutOf = player => (player && typeof player.cut === 'string' && Object.hasOwn(CUTS, player.cut) ? player.cut : CUT);

export function drawPlayer(player) {
  drawCut(player, pose(player), cutOf(player));
}
