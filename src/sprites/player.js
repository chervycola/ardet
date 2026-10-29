// ═══════════════════════════════════════
// СТРАННИК — по ART_BIBLE §05. «Лица нет — капюшон и тьма; рваная ткань слоями; огонёк у
// сердца... следы на пыли — единственная биография.» Здесь — поза кадра; рисунок — крой
// из гардероба (sprites/wardrobe.js): по умолчанию пыльник (слово автора 28.10), другие
// крои висят в местах мира и надеваются там (world/garments.js).
// Огонёк — в центре груди, на оси фигуры (слово автора 29.10): свеча, без растра; свет
// вокруг даёт слой света (lighting.sources[0]). Свет слева, кромка пеплом справа.
// Слово автора (23.10): в тьме капюшона — два глаза-уголька, тлеют и изредка моргают.
// Две плоскости — к нам и от нас (слово автора 29.10): идёт вверх — спиной (огонька не
// видно, только отсвет по краям), вниз — лицом; вбок — в той плоскости, в какой был
// (player.face: S · N, main.js heroStep). Ни профиля, ни трёх четвертей.
// Ноги — только у пелерины (слово автора 29.10); у прочих кроёв ткань до земли.
// Походка (world/gait.js, ROADMAP Г8): шаг по пройденному пути; вес несёт верх — на
// опоре плечи и капюшон садятся на точку; шагнувшая сторона подола отходит. Остановился —
// дошагал, осел, пола по инерции ушла и опала. Стоя дышит раз в шесть секунд (как угли):
// сперва плечи, потом капюшон и огонёк. Оборот — сразу из лица в спину, после доворота.
// Оступился — позой: камень — клюёт верхом; яма — проседает, голова вниз; окаменелость —
// дёрнуло, у пелерины нога уехала назад; зажмурился. Ладонь козырьком — рукавом: плечо в
// сторону, предплечье стоймя, кисть над тьмой. Сесть — сперва колени, потом сидит: ткань
// на земле. У теней чужих и масок тени походки нет — рисунок по флагу хода и часам.
// Рамка рисунка: x−6..x+20, y−10..y+24 (маска тени героя, main.js).
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { wind } from '../world/wind.js';
import { CUT, isCut, drawCut, backOf } from './wardrobe.js';

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

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
  // две плоскости: всё, что «на север», — спиной; прочее (и чужой старый клиент с E/W) — лицом
  const want = g ? g.view : (player.visor || sit > 0.5 ? 'S' : player.face);
  const back = backOf(want), view = back ? 'N' : 'S';
  const visorK = g ? g.visorK : (player.visor ? 1 : 0);
  const trip = g && g.trip, tp = trip ? trip.p : 0, kind = trip ? trip.kind : '';
  const feet = (!g || g.feet) && sit < 0.5 && kind !== 'pit';
  const walking = amp > 0.35 && !trip;
  // вес на опоре (двойная опора — дольше), осел на остановке: верх на точку ниже; в вязком капюшон — на две
  const contact = amp > 0.3 && !red && (fr < 0.3 || fr > 0.92);
  const dip = Math.max(contact ? 1 : 0, g && g.settle > 0.5 && !red ? 1 : 0);
  const dipH = contact && g && g.heavy && fr < 0.1 ? 1 : 0;
  // дыхание — только в покое: у своего — с остановки (gait.calm), у теней — по часам; сперва плечи, потом голова
  const still = 1 - Math.min(1, amp * 2);
  const bt = g ? g.calm - 40 : t;
  const bs = !red && sit < 0.5 && still > 0.5 && bt > 0 ? Math.sin(bt * Math.PI * 2 / 360) : 0;
  const bSh = bs > 0.15 ? 1 : 0, bHd = bs > 0.45 ? 1 : 0;
  const trail = clamp(g ? g.hem : w.x * 2.4 - vx * 0.7, -3, 3);
  const run = g ? g.run : 0;
  const flick = (0.15 + w.s * 0.25 + 0.3 * (player.gust || 0) + 0.6 * tp) * (player.steady ? 0.35 : 1) * Math.sin(t * (0.45 + w.s * 0.3 + 0.4 * (player.gust || 0)) + Math.sin(t * 0.1) * 2);
  return { x, y, g, red, w, vx, amp, phase, fr, foot, sit, view, back, visorK, trip, tp, kind, feet, walking,
    contact, dip, dipH, still, bSh, bHd, trail, run, flick };
}

// крой: свой у фигуры (сохранён, надет в месте мира), иначе — основной
export const cutOf = player => (player && isCut(player.cut) ? player.cut : CUT);

export function drawPlayer(player) {
  drawCut(player, pose(player), cutOf(player));
}
