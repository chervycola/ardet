// ═══════════════════════════════════════
// ЛЕНТА ТЯНЕТ — у края мира брейнрот сносит странника наружу, к падению.
// Тянет тем сильнее, чем глубже распад, и тем слабее, чем меньше ты ей
// подыгрываешь: идёшь к краю — подхватывает; идёшь вдоль — тянет вбок;
// стоишь — едва ползёшь (а спиной к краю — ещё слабее); идёшь вглубь —
// почти отпускает. Всегда медленнее шага: уйти можно до последнего,
// падения милосердны. Покой лечит — brainrot.js (calm).
// В петле СКРОЛЛ лента крутит вниз, по кольцу девять.
// ═══════════════════════════════════════
import { warpedDist } from './disc.js';

export const PULL_MAX = 0.55;   // доля скорости шага при полном распаде, если идёшь к краю
const FROM = 5;                 // ниже этого распада лента не тянет
const FACE = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };

// куда «наружу»: туда, где глубина края растёт быстрее всего
export function outward(x, y) {
  const h = 8;
  const gx = warpedDist(x + h, y) - warpedDist(x - h, y);
  const gy = warpedDist(x, y + h) - warpedDist(x, y - h);
  const l = Math.hypot(gx, gy);
  return l > 1e-6 ? [gx / l, gy / l] : [0, 0];
}

// насколько странник подыгрывает ленте: 1 — идёт к краю, ~0.12 — уходит вглубь
export function engagement(ux, uy, mvx, mvy, face) {
  const ml = Math.hypot(mvx, mvy);
  if (ml < 0.01) {
    const f = FACE[face];
    return f && f[0] * ux + f[1] * uy < -0.5 ? 0.15 : 0.25;   // стоит; спиной к краю — меньше
  }
  const c = (mvx * ux + mvy * uy) / ml;                     // −1 вглубь … +1 к краю
  return c >= 0 ? 0.6 + 0.4 * c : Math.max(0.12, 0.6 + 0.65 * c);
}

// снос за кадр: level — брейнрот 0..100, walk — скорость шага (px/кадр),
// mvx/mvy — куда хочет идти (желаемая скорость), loop — петля СКРОЛЛ
export function pullVector(x, y, level, walk, mvx, mvy, face, loop = false) {
  if (!(level > FROM) || !(walk > 0)) return [0, 0];
  const [ux, uy] = loop ? [0, 1] : outward(x, y);
  if (!ux && !uy) return [0, 0];
  const k = Math.min(1, level / 100);
  const s = walk * PULL_MAX * Math.pow(k, 1.2) * engagement(ux, uy, mvx, mvy, face);
  return [ux * s, uy * s];
}
