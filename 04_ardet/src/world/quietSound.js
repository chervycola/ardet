// ═══════════════════════════════════════
// ТИХОЕ ПОДАЁТ ГОЛОС (weave/ROADMAP И5): вещь глубины II (world/depth.js) стоит в
// тени, её легко пройти мимо. Проходишь рядом — она отзывается: табличка шуршит
// жестью, постройка скрипит, — с той стороны, где стоит; ближе — громче, в ветер
// табличка громче. Значков нет: внимание вознаграждается, не требуется.
// Осмотренная молчит. Одна вещь — не чаще раза в полторы минуты, все вместе — не
// чаще раза в семь секунд.
// ═══════════════════════════════════════
export const HEAR = 150, NEAR = 40, GAP = 420, OWN = 5400;

const footOf = l => (l.archDraw ? { x: l.archX, y: l.archGy } : { x: l.x + l.w / 2, y: l.y + l.h });

// какая тихая вещь отзовётся сейчас: ближняя неосмотренная в пределах слуха.
// last — Map(id → кадр, когда звучала); lastAny — кадр последнего отзыва
export function quietVoice(list, fx, fy, frame, looked, last, lastAny = -Infinity) {
  if (frame - lastAny < GAP) return null;
  let best = null, bd = HEAR;
  for (const l of list) {
    if (!l.quiet || looked(l.id)) continue;
    const at = last.get(l.id);
    if (at !== undefined && frame - at < OWN) continue;
    const f = footOf(l), d = Math.hypot(f.x - fx, f.y - fy);
    if (d < bd) { bd = d; best = { l, f, d }; }
  }
  if (!best) return null;
  const v = best.d <= NEAR ? 1 : 1 - (best.d - NEAR) / (HEAR - NEAR);
  const pan = Math.max(-1, Math.min(1, (best.f.x - fx) / (HEAR * 0.8)));
  return { l: best.l, v: Math.max(0.15, v), pan, kind: best.l.archDraw ? 'creak' : 'rustle' };
}
