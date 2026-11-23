// ═══════════════════════════════════════
// ЛОДКА НА ПРУДУ-ОХЛАДИТЕЛЕ — слово автора 23.11: «механику покататься до острова».
// Плоскодонка у мостков (world/landforms.js). «ПЛЫТЬ К ОСТРОВУ» — странник садится, и
// лодка идёт сама, медленно, вокруг острова по воде — запад, север, восток — к мосткам
// острова: секунд двенадцать, вода тёплая, весло одно, грести почти не надо. Назад —
// коротко, по прямой течения. Пока плывёт, ход заперт: из лодки в глубину не шагнёшь.
// Лодка одна; стоит там, где странник: на острове — у мостков острова, иначе — у берега
// («ВОЗВРАТ — СЮДА ЖЕ»: на корме выжжено). Рисунок — плоско сбоку, нос туда, куда плывёт;
// корпус — за фигурой, ближний борт — перед ней; за кормой расходятся круги.
// ═══════════════════════════════════════
export const SPEED = 0.42;                    // точек за кадр по воде
export const RING_RX = 28, RING_RY = 16;      // путь вокруг острова — на столько дальше его кромки

export const boat = { ride: null, last: null, rings: [], t: 0 };

// путь к острову: от мостков берега на воду, по дуге вокруг острова (через запад, север,
// восток) и к мосткам острова; назад — от мостков острова к мосткам берега по течению
export function routeOf(L, toIsle) {
  const I = L.isle, a = L.pier.dock, b = L.ipier.dock, pts = [];
  const ring = th => ({ x: I.cx + (I.rx + RING_RX) * Math.cos(th), y: I.cy + (I.ry + RING_RY) * Math.sin(th) });
  if (toIsle) {
    pts.push({ x: a.x, y: a.y });
    for (let d = 115; d <= 420; d += 7.5) pts.push(ring(d * Math.PI / 180));
    pts.push({ x: b.x, y: b.y });
  } else {
    pts.push({ x: b.x, y: b.y });
    pts.push({ x: (a.x + b.x) / 2, y: Math.max(a.y, b.y) + 6 });
    pts.push({ x: a.x, y: a.y });
  }
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) { const p = pts[i], q = out[out.length - 1]; out.push({ x: p.x, y: p.y, s: (q.s || 0) + Math.hypot(p.x - q.x, p.y - q.y) }); }
  out[0].s = 0;
  return out;
}
export const routeLen = r => r[r.length - 1].s;
export function pointAt(r, s) {
  if (s <= 0) return { x: r[0].x, y: r[0].y, dx: r[1].x - r[0].x };
  for (let i = 1; i < r.length; i++) {
    if (s <= r[i].s) {
      const a = r[i - 1], b = r[i], f = (s - a.s) / ((b.s - a.s) || 1);
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, dx: b.x - a.x };
    }
  }
  const z = r[r.length - 1], y = r[r.length - 2];
  return { x: z.x, y: z.y, dx: z.x - y.x };
}

// сесть и плыть: from — мостки, у которых стоит странник
export function startRide(L, toIsle) {
  const route = routeOf(L, toIsle), p = pointAt(route, 0);
  boat.ride = { L, toIsle, route, s: 0, t: 0, dir: toIsle ? -1 : 1, x: p.x, y: p.y };
  return boat.ride;
}
export const riding = () => !!boat.ride;
// где лодка, когда стоит: у мостков той стороны, где странник
export function boatRest(L, onIsle) { const d = onIsle ? L.ipier.dock : L.pier.dock; return { x: d.x, y: d.y, dir: onIsle ? -1 : 1 }; }

// шаг: лодка идёт по пути — плавно трогается и плавно причаливает; странник сидит в ней.
// Вернёт 'done', когда причалила (main.js ставит странника на мостки)
export function stepRide(player) {
  boat.t++;
  for (let i = boat.rings.length - 1; i >= 0; i--) if (++boat.rings[i].age > 70) boat.rings.splice(i, 1);
  const R = boat.ride;
  if (!R) return null;
  R.t++;
  const len = routeLen(R.route), f = R.s / len;
  const v = SPEED * Math.max(0.25, Math.min(1, f * 6, (1 - f) * 6));   // тронулась — пошла — сбавила у мостков
  R.s = Math.min(len, R.s + v);
  const p = pointAt(R.route, R.s);
  if (Math.abs(p.dx) > 0.5) R.dir = p.dx > 0 ? 1 : -1;
  R.x = p.x; R.y = p.y;
  player.x = Math.round(p.x) - 6; player.y = Math.round(p.y) + 1 - 23;
  player.dir = R.dir; player.moving = false; player.still = true; player.vx = 0; player.vy = 0;
  if (R.t % 22 === 0) boat.rings.push({ x: p.x - R.dir * 10, y: p.y + 1, age: 0 });   // за кормой — круги
  if (R.s >= len) { boat.last = R; boat.ride = null; return 'done'; }
  return null;
}

// ── рисунок: корпус сбоку, нос — по ходу; качается на точку ──
const R_ = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
const RIM = '#7a6040', WOOD = '#5c4229', DARK = '#3f3020', IN = '#1e140c', TAR = '#2a1c10';
export const bob = (t, x) => Math.round(Math.sin(t * 0.05 + x * 0.1) * 0.6);
// задняя часть: тень, круги, корпус и нутро — до фигуры
export function drawBoatBack(ctx, x, y, dir, t) {
  x = Math.round(x); y = Math.round(y) + bob(t, x);
  for (const r of boat.rings) {
    const k = r.age / 70, rx = Math.round(3 + 9 * k), ry = Math.max(1, Math.round(1 + 3 * k));
    ctx.globalAlpha = 0.35 * (1 - k); ctx.fillStyle = '#9aa48e';
    for (let a = 0; a < 24; a++) { const th = a / 24 * Math.PI * 2; ctx.fillRect(Math.round(r.x + Math.cos(th) * rx), Math.round(r.y + Math.sin(th) * ry), 1, 1); }
  }
  ctx.globalAlpha = 0.4; R_(ctx, x - 10, y + 3, 21, 1, '#0D0B0A'); ctx.globalAlpha = 1;   // тень в воде
  // нос (по ходу) острый, корма тупая: ряды от планширя к днищу
  for (let row = -2; row <= 2; row++) {
    const half = row === -2 ? 10 : row === 2 ? 8 : 10 - Math.max(0, row);
    let x0 = x - half, x1 = x + half;
    if (dir > 0) x1 += row === -2 ? 2 : row === -1 ? 1 : 0; else x0 -= row === -2 ? 2 : row === -1 ? 1 : 0;   // нос
    const c = row === -2 ? RIM : row === 2 ? DARK : WOOD;
    R_(ctx, x0, y + row, x1 - x0 + 1, 1, c);
  }
  R_(ctx, x - 8, y - 1, 17, 2, IN);                                  // нутро
  R_(ctx, x + dir * 3, y - 1, 1, 2, WOOD);                           // банка
  // весло: с борта наискось в воду
  ctx.fillStyle = '#6b5236';
  for (let k = 0; k < 7; k++) ctx.fillRect(x - dir * (2 + k), y - 3 + k, 1, 1);
  R_(ctx, x - dir * 10, y + 4, 2, 1, '#9aa48e');                     // всплеск у лопасти
}
// ближний борт — после фигуры: сидит внутри
export function drawBoatFront(ctx, x, y, dir, t) {
  x = Math.round(x); y = Math.round(y) + bob(t, x);
  const x0 = x - 9 - (dir < 0 ? 1 : 0), x1 = x + 9 + (dir > 0 ? 1 : 0);
  R_(ctx, x0, y + 1, x1 - x0 + 1, 1, WOOD);
  R_(ctx, x0 + 1, y + 2, x1 - x0 - 1, 1, DARK);
  R_(ctx, x0, y + 1, 1, 1, RIM); R_(ctx, x1, y + 1, 1, 1, TAR);
}
