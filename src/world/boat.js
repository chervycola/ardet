// ═══════════════════════════════════════
// ЛОДКИ НА ТЁПЛОМ ОЗЕРЕ (world/lake.js) — слово автора 23.11: «механику покататься до
// острова»; 24.11: «не менее трёх минут переплавки с одной стороны на противоположную».
// У трёх мостков — по плоскодонке: восточный берег (со стороны завода), западный (дальний
// конец рукава), остров водозабора. Сел — лодка идёт сама, гребками: толчок — скольжение.
// С берега на противоположный — не напрямик, а озером: от восточных мостков к северной
// бухте, мимо камышового островка, вдоль ивового острова, южным заливом мимо насыпи и в
// западный рукав — дольше трёх минут. К острову — коротко. Пока плывёшь, ход заперт: из
// лодки в глубину не шагнёшь. Причалил — на мостках; лодка остаётся там, у тех мостков —
// своя («ВОЗВРАТ — СЮДА ЖЕ»).
// Рисунок — плоско сбоку, нос по ходу; корпус — за фигурой, ближний борт — перед ней; за
// кормой расходятся круги.
// ═══════════════════════════════════════
import { PIERS } from './lake.js';

export const STROKE = 150;                   // гребок — раз в две с половиной секунды
export const BASE = 0.28;                    // ход на толчке (точек за кадр); средний — около 0,23: с берега на берег — три минуты с лишним
export const boat = { ride: null, last: null, rings: [], t: 0 };

// озёрные точки пути (вода, в стороне от островов и берега)
const WP = {
  e1: [8560, 2700], n1: [8480, 2560], n2: [8300, 2470], n3: [8050, 2440], bay: [7800, 2400],
  w1: [7720, 2620], w2: [7760, 2780], s1: [7600, 2900], s2: [7430, 2930], s3: [7250, 2870], neck: [7110, 2720], w3: [6950, 2700],
  i1: [8590, 2660], i2: [8470, 2540],
};
const SCENIC = ['e1', 'n1', 'n2', 'n3', 'bay', 'w1', 'w2', 's1', 's2', 's3', 'neck', 'w3'];
function waypoints(from, to) {
  const d = k => (k === 'east' ? PIERS.east.dock : k === 'west' ? PIERS.west.dock : PIERS.isle.dock);
  const P = k => (WP[k] ? { x: WP[k][0], y: WP[k][1] } : { x: d(k).x, y: d(k).y });
  let names;
  if (from === 'east' && to === 'west') names = ['east', ...SCENIC, 'west'];
  else if (from === 'west' && to === 'east') names = ['west', ...SCENIC.slice().reverse(), 'east'];
  else if (from === 'east' && to === 'isle') names = ['east', 'i1', 'isle'];
  else if (from === 'isle' && to === 'east') names = ['isle', 'i1', 'east'];
  else if (from === 'west' && to === 'isle') names = ['west', ...SCENIC.slice(2).reverse(), 'i2', 'isle'];
  else names = ['isle', 'i2', ...SCENIC.slice(2), 'west'];
  return names.map(P);
}
// путь — кривой Катмулла — Рома через точки; s — пройдено от начала
export function routeOf(from, to) {
  const w = waypoints(from, to), pts = [];
  for (let i = 0; i < w.length - 1; i++) {
    const p0 = w[Math.max(0, i - 1)], p1 = w[i], p2 = w[i + 1], p3 = w[Math.min(w.length - 1, i + 2)];
    const n = Math.max(4, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / 8));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      pts.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) });
    }
  }
  pts.push({ x: w[w.length - 1].x, y: w[w.length - 1].y });
  let s = 0;
  return pts.map((p, i) => { if (i) s += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y); return { ...p, s }; });
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
// ход в кадре t от начала поездки при доле пути f: гребок (толчок — скольжение), тронулась и причалила плавно
export function speedAt(t, f) {
  const ph = (t % STROKE) / STROKE, push = ph < 0.3 ? Math.sin(ph / 0.3 * Math.PI / 2) : Math.exp(-(ph - 0.3) * 2.2);
  return BASE * (0.45 + 0.75 * push) * Math.max(0.3, Math.min(1, f * 25 + 0.3, (1 - f) * 25 + 0.3));
}
// сколько кадров займёт путь (для проверок и подписи)
export function rideFrames(r) {
  const len = routeLen(r);
  let s = 0, t = 0;
  while (s < len && t < 1e6) { s += speedAt(t, s / len); t++; }
  return t;
}

export function startRide(from, to) {
  const route = routeOf(from, to), p = pointAt(route, 0);
  boat.ride = { from, to, route, len: routeLen(route), s: 0, t: 0, dir: route[1].x >= route[0].x ? 1 : -1, x: p.x, y: p.y };
  return boat.ride;
}
export const riding = () => !!boat.ride;

// шаг: лодка идёт по пути; странник сидит в ней. 'done' — причалила (main.js ставит на мостки)
export function stepRide(player) {
  boat.t++;
  for (let i = boat.rings.length - 1; i >= 0; i--) if (++boat.rings[i].age > 70) boat.rings.splice(i, 1);
  const R = boat.ride;
  if (!R) return null;
  const v = speedAt(R.t, R.s / R.len);
  R.t++;
  R.s = Math.min(R.len, R.s + v);
  const p = pointAt(R.route, R.s);
  if (Math.abs(p.dx) > 0.5) R.dir = p.dx > 0 ? 1 : -1;
  R.x = p.x; R.y = p.y;
  player.x = Math.round(p.x) - 6; player.y = Math.round(p.y) + 1 - 23;
  player.dir = R.dir; player.moving = false; player.still = true; player.vx = 0; player.vy = 0;
  if (R.t % STROKE === 8) boat.rings.push({ x: p.x - R.dir * 10, y: p.y + 1, age: 0 });   // гребок — круги у весла
  if (R.s >= R.len) { boat.last = R; boat.ride = null; return 'done'; }
  return null;
}
// где стоят лодки: у всех мостков, кроме тех, откуда сейчас плывут
export function boatsAtRest() {
  const out = [];
  for (const k of ['east', 'west', 'isle']) {
    if (boat.ride && boat.ride.from === k) continue;
    const P = PIERS[k];
    if (P) out.push({ x: P.dock.x, y: P.dock.y, dir: P.dir > 0 ? -1 : 1 });
  }
  return out;
}

// ── рисунок: корпус сбоку, нос — по ходу; качается на точку ──
const R_ = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
const RIM = '#7a6040', WOOD = '#5c4229', DARK = '#3f3020', IN = '#1e140c', TAR = '#2a1c10';
export const bob = (t, x) => Math.round(Math.sin(t * 0.05 + x * 0.1) * 0.6);
export function drawRings(ctx) {
  for (const r of boat.rings) {
    const k = r.age / 70, rx = Math.round(3 + 9 * k), ry = Math.max(1, Math.round(1 + 3 * k));
    ctx.globalAlpha = 0.35 * (1 - k); ctx.fillStyle = '#9aa48e';
    for (let a = 0; a < 24; a++) { const th = a / 24 * Math.PI * 2; ctx.fillRect(Math.round(r.x + Math.cos(th) * rx), Math.round(r.y + Math.sin(th) * ry), 1, 1); }
  }
  ctx.globalAlpha = 1;
}
// задняя часть: тень, корпус и нутро — до фигуры
export function drawBoatBack(ctx, x, y, dir, t) {
  x = Math.round(x); y = Math.round(y) + bob(t, x);
  ctx.globalAlpha = 0.4; R_(ctx, x - 10, y + 3, 21, 1, '#0D0B0A'); ctx.globalAlpha = 1;   // тень в воде
  for (let row = -2; row <= 2; row++) {
    const half = row === -2 ? 10 : row === 2 ? 8 : 10 - Math.max(0, row);
    let x0 = x - half, x1 = x + half;
    if (dir > 0) x1 += row === -2 ? 2 : row === -1 ? 1 : 0; else x0 -= row === -2 ? 2 : row === -1 ? 1 : 0;   // нос
    R_(ctx, x0, y + row, x1 - x0 + 1, 1, row === -2 ? RIM : row === 2 ? DARK : WOOD);
  }
  R_(ctx, x - 8, y - 1, 17, 2, IN);                                  // нутро
  R_(ctx, x + dir * 3, y - 1, 1, 2, WOOD);                           // банка
  ctx.fillStyle = '#6b5236';                                         // весло: с борта наискось в воду
  for (let k = 0; k < 7; k++) ctx.fillRect(x - dir * (2 + k), y - 3 + k, 1, 1);
  R_(ctx, x - dir * 10, y + 4, 2, 1, '#9aa48e');
}
// ближний борт — после фигуры: сидит внутри
export function drawBoatFront(ctx, x, y, dir, t) {
  x = Math.round(x); y = Math.round(y) + bob(t, x);
  const x0 = x - 9 - (dir < 0 ? 1 : 0), x1 = x + 9 + (dir > 0 ? 1 : 0);
  R_(ctx, x0, y + 1, x1 - x0 + 1, 1, WOOD);
  R_(ctx, x0 + 1, y + 2, x1 - x0 - 1, 1, DARK);
  R_(ctx, x0, y + 1, 1, 1, RIM); R_(ctx, x1, y + 1, 1, 1, TAR);
}
