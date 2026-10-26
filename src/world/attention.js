// ═══════════════════════════════════════
// ВНИМАНИЕ ОЖИВЛЯЕТ МЕХАНИЗМЫ (Платонов: «без меня народ неполный»).
// К чему странник возвращается, то начинает ему отвечать. Очки внимания
// вещи: осмотр, дело с вещью, постоять рядом неподвижно. С трёх очков вещь
// узнаёт, с семи — отвечает в полную: флюгер поворачивается к тебе, а не к
// ветру; местные часы вокзала догоняют железнодорожные; маховик прибавляет
// ход и выдыхает навстречу; ворот колодца кивает; колокол, вывеска, фонарик
// качнутся навстречу (world/mechanisms.js, world/hang.js).
// Новое так не умеет: ветряк, кран и люлька мойщика кольца «сейчас» отвечают
// всем одинаково — ветру и графику; купол камеры ведёт любого, кто движется,
// шлагбаум поднимается по звонку, — их внимание не касается.
// Лента отнимает внимание: падение в брейнрот — механизмы забывают половину.
// Чисел и шкал нет: видно только по тому, как вещь себя ведёт.
// ═══════════════════════════════════════
export const LEVELS = [3, 7];              // очков: узнаёт · отвечает в полную
const NEAR = 60;                           // «рядом» с вещью — в стольких точках от её рамки
const STILL_PT = 480;                      // кадров неподвижности рядом — очко (8 с)

const pts = new Map();                     // id → очки
const box = new Map();                     // id → рамка вещи {x, y, w, h}

export function levelOf(id) {
  const p = pts.get(id) || 0;
  return p >= LEVELS[1] ? 2 : p >= LEVELS[0] ? 1 : 0;
}
export const pointsOf = id => pts.get(id) || 0;

export function noteAttention(loc, k = 1) {
  if (!loc || !loc.id || !Number.isFinite(loc.x) || !Number.isFinite(loc.y) || loc.under || loc.house || loc.net) return;
  pts.set(loc.id, Math.min(20, (pts.get(loc.id) || 0) + k));
  box.set(loc.id, { x: loc.x, y: loc.y, w: loc.w || 0, h: loc.h || 0 });
}

// расстояние от точки до рамки вещи (0 — внутри)
function distTo(b, x, y) {
  const dx = Math.max(b.x - x, 0, x - (b.x + b.w)), dy = Math.max(b.y - y, 0, y - (b.y + b.h));
  return Math.hypot(dx, dy);
}

// постоять рядом: неподвижность у вещи копится в очки
let still = 0, stillAt = null;
export function stepAttention(player, locations, isStill) {
  if (!isStill) { still = 0; stillAt = null; return; }
  if (++still % 30) return;                                   // раз в полсекунды ищем, у чего стоим
  const px = player.x + 6, py = player.y + 23;
  let best = null, bd = NEAR;
  for (const l of locations) {
    if (!l.id || l.under || l.house || l.net || !Number.isFinite(l.x)) continue;
    const d = distTo(l, px, py);
    if (d < bd) { bd = d; best = l; }
  }
  if (!best) { stillAt = null; return; }
  if (stillAt !== best.id) { stillAt = best.id; still = 30; return; }
  if (still % STILL_PT === 0) noteAttention(best, 1);
}

// узнаёт ли что-то рядом с точкой механизма: высший уровень знакомых вещей в R
export function attendedAt(x, y, R = 70) {
  let lv = 0;
  for (const [id, b] of box) {
    const l = levelOf(id);
    if (l > lv && distTo(b, x, y) <= R) lv = l;
    if (lv === 2) break;
  }
  return lv;
}

// ответ механизма: знаком ли он со странником и где тот (если близко)
export function respond(x, y, player, near = 150) {
  if (!player || !box.size) return null;
  const dx = player.x + 6 - x, dy = player.y + 20 - y, d = Math.hypot(dx, dy);
  if (d > near) return null;
  const lv = attendedAt(x, y);
  return lv ? { lv, dx, dy, d } : null;
}

// лента отнимает внимание: после падения в брейнрот — половина
export function forget() {
  for (const [id, p] of pts) { const q = Math.floor(p / 2); if (q > 0) pts.set(id, q); else { pts.delete(id); box.delete(id); } }
}

export function saveAttention() { return Object.fromEntries(pts); }
// рамки — по нынешним вещам мира (места могли сдвинуться между версиями)
export function loadAttention(d, locations = []) {
  if (!d || typeof d !== 'object') return;
  const byId = new Map(locations.map(l => [l.id, l]));
  for (const [id, v] of Object.entries(d)) {
    const l = byId.get(id), p = Array.isArray(v) ? v[0] : v;
    if (!Number.isFinite(p) || p <= 0) continue;
    if (l) { pts.set(id, 0); noteAttention(l, Math.min(20, p | 0)); }
    else pts.set(id, Math.min(20, p | 0));             // вещь появится позже — рамку возьмём при встрече
  }
}
export function _resetAttention() { pts.clear(); box.clear(); still = 0; stillAt = null; }
