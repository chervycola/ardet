// ═══════════════════════════════════════
// ВЫЛЕЗТИ НАВЕРХ — слово автора 23.11: «нужна анимация вылезания из подвала». Прежде
// подъём из изнанки был затемнением: темно — и странник уже стоит у порога. Теперь
// после затемнения он выходит сам, ход заперт (шаг — сразу дойти до конца):
//   затопленный подвал — по бетонному маршу из воды (что ниже воды — не видно), ступень
//     за ступенью, на площадку, на плиту и вокруг проёма — к порогу (sprites/locations/
//     canon.js basementBody: марш вдоль задней стены, площадка наверху слева);
//   прочие ходы — из тёмного люка у порога: поднимается рывками, как по скобам, шагает
//     вперёд, люк за ним затягивается.
// (пифос — свой: выползает, как ложился, — world/pithosLie.js)
// ═══════════════════════════════════════
export const RUNG = 16, RUNGS = 6, RUNG_UP = 4;   // люк: шесть скоб по четыре точки, ступень — 16 кадров
export const STEP_OUT = 36, HOLE_FADE = 50;       // шаг из люка; люк затягивается
export const STAIR = 14, WALK_V = 0.55;           // подвал: ступень марша — 14 кадров; по плите — медленно
const BS_WATER = 24;                              // уровень воды у задней стены подвала (рисунок: BS_WL)

export const climb = { on: false, kind: '', t: 0, loc: null, path: null, seg: 0, segT: 0, hole: null, holeT: 0, end: null, clipY: null };

// путь из подвала в точках мира: ступни (x, y) — от затопленной ступени вверх по маршу, на площадку,
// на плиту слева от проёма, вниз вдоль левой кромки и к порогу; f — кадров на отрезок
export function basementPath(loc, end) {
  const L = (x, y) => ({ x: loc.x + x, y: loc.y + y });
  const pts = [];
  for (let k = 8; k >= 0; k--) pts.push({ ...L(12 + 3 * k, 11 + 2 * k), f: STAIR, stair: true });   // ступни — на середине ступени
  pts.push({ ...L(9, 10), f: STAIR, stair: true });                // площадка наверху
  pts.push({ ...L(4, 8), f: 0 });                                  // на плиту
  pts.push({ ...L(-4, loc.h + 2), f: 0 });                         // вниз вдоль левой кромки
  pts.push({ x: end.x + 6, y: end.y + 23, f: 0 });                 // к порогу
  for (let i = 1; i < pts.length; i++) if (!pts[i].f) pts[i].f = Math.max(8, Math.round(Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y) / WALK_V));
  pts[0].f = 0;
  return pts;
}

// начать: end — порог (угол рамки странника), куда он придёт
export function startClimb(loc, end, player) {
  climb.on = true; climb.t = 0; climb.loc = loc; climb.end = { x: end.x, y: end.y };
  climb.seg = 1; climb.segT = 0; climb.hole = null; climb.holeT = 0;
  if (loc && loc.id === 'basement') {
    climb.kind = 'stairs';
    climb.path = basementPath(loc, end);
    climb.clipY = loc.y + BS_WATER;
    const p0 = climb.path[0];
    player.x = p0.x - 6; player.y = p0.y - 23;
  } else {
    climb.kind = 'hatch';
    climb.path = null; climb.clipY = null;
    climb.hole = { x: end.x + 6, y: end.y + 23 - 6 };              // люк — на шаг глубже порога
    player.x = end.x; player.y = end.y - 6;
  }
  player.face = 'N'; player.moving = true; player.still = false;
}
export function stopClimb() { climb.on = false; climb.kind = ''; climb.path = null; climb.clipY = null; }

// насколько фигура ещё в люке (точки вниз от земли): рывками, скоба за скобой
export function hatchDepth(t) {
  const total = RUNG * RUNGS;
  if (t >= total) return 0;
  const i = Math.floor(t / RUNG), r = t - i * RUNG, k = Math.min(1, r / 6);
  const risen = (i + k * k * (3 - 2 * k)) * RUNG_UP;
  return Math.max(0, Math.round(RUNGS * RUNG_UP - risen));
}

// шаг сцены; skip — игрок шагнул: сразу к порогу. Возвращает 'done', когда вышел
export function stepClimb(player, skip = false) {
  if (!climb.on) { stepHole(); return null; }
  climb.t++;
  if (skip && climb.t > 20) return finish(player);
  if (climb.kind === 'hatch') {
    const total = RUNG * RUNGS;
    if (climb.t <= total) { player.moving = true; player.still = false; player.face = 'N'; return null; }
    const f = Math.min(1, (climb.t - total) / STEP_OUT);
    player.face = 'S';
    player.y = climb.end.y - 6 + 6 * f;
    if (f >= 1) return finish(player);
    return null;
  }
  // подвал: по точкам пути
  const P = climb.path, a = P[climb.seg - 1], b = P[climb.seg];
  climb.segT++;
  const f = Math.min(1, climb.segT / b.f);
  // по ступени — шаг с подъёмом: сперва нога вверх, потом вперёд; по плите — ровно
  const g = b.stair ? Math.min(1, f * 1.4) : f;
  const fx = a.x + (b.x - a.x) * g, fy = a.y + (b.y - a.y) * (b.stair ? Math.min(1, f * 2) : f);
  player.x = fx - 6; player.y = fy - 23;
  player.moving = true; player.still = false;
  if (Math.abs(b.x - a.x) > 0.5) player.dir = b.x > a.x ? 1 : -1;
  player.face = b.y < a.y - 0.5 ? 'N' : b.y > a.y + 0.5 ? 'S' : player.face;
  if (fy <= climb.clipY - 2) climb.clipY = null;                   // вышел из воды — резать нечего
  if (f >= 1) { climb.seg++; climb.segT = 0; if (climb.seg >= P.length) return finish(player); }
  return null;
}
function finish(player) {
  player.x = climb.end.x; player.y = climb.end.y; player.tx = player.x; player.ty = player.y;
  player.moving = false; player.still = true; player.vx = 0; player.vy = 0; player.face = 'S';
  if (climb.hole) climb.holeT = 1;                                  // люк остаётся и затягивается
  climb.on = false; climb.path = null; climb.clipY = null;
  return 'done';
}
function stepHole() {
  if (!climb.hole || !climb.holeT) return;
  if (++climb.holeT > HOLE_FADE) { climb.hole = null; climb.holeT = 0; }
}
// поверх рисунка мира: фигура в рамке выхода. Возвращает true, если нарисовал сам
export function drawClimb(ctx, player, draw) {
  drawHole(ctx);
  if (!climb.on) return false;
  if (climb.kind === 'hatch') {
    const dy = climb.t <= RUNG * RUNGS ? hatchDepth(climb.t) : 0;
    ctx.save();
    ctx.beginPath(); ctx.rect(player.x - 20, player.y - 30, 52, climb.hole.y - (player.y - 30)); ctx.clip();   // ниже края люка — не видно
    ctx.translate(0, dy);
    draw();
    ctx.restore();
    return true;
  }
  if (climb.clipY !== null) {
    ctx.save();
    ctx.beginPath(); ctx.rect(player.x - 20, player.y - 30, 52, climb.clipY - (player.y - 30)); ctx.clip();   // под водой — не видно
    draw();
    ctx.restore();
    return true;
  }
  draw();
  return true;
}
// люк: тёмный зев с кромкой; вышел — затягивается к точке
function drawHole(ctx) {
  const h = climb.hole;
  if (!h) return;
  const k = climb.holeT ? Math.max(0, 1 - climb.holeT / HOLE_FADE) : 1;
  const rx = Math.max(0, Math.round(8 * k)), ry = Math.max(0, Math.round(3 * k));
  if (!rx) return;
  for (let dy = -ry; dy <= ry; dy++) {
    const w = Math.round(rx * Math.sqrt(1 - (dy / (ry + 0.5)) ** 2));
    ctx.fillStyle = dy === -ry ? '#2a2620' : '#0D0B0A';
    ctx.fillRect(h.x - w, h.y + dy, w * 2 + 1, 1);
  }
  ctx.fillStyle = '#8A8D8F'; ctx.globalAlpha = 0.6;
  ctx.fillRect(h.x - rx, h.y + ry + 1, rx * 2 + 1, 1);              // кромка к нам — пеплом
  ctx.globalAlpha = 1;
}
// для порядка рисунка: пока странник на марше подвала — поверх рисунка подвала
export function climbDepth(player) {
  if (climb.on && climb.kind === 'stairs' && climb.loc) return Math.max(player.y + 24, climb.loc.y + climb.loc.h + 1);
  return player.y + 24;
}
