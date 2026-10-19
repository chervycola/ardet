// ═══════════════════════════════════════
// ШУТ — по осмотру и ART_BIBLE §05. «Шут стоит у костра и пошатывается,
// сдвигая центр тяжести. Если смотреть долго — замечаешь редкое моргание.
// В одной руке — кинжал. В другой держит пику, на которой подпекается над
// костром человеческий скальп. Лицо белое, губы красные. Улыбка — не
// результат, а форма.» По библии: колпак с тремя рогами, ромбы арлекина,
// хвост с лезвием, горящий нимб, крест в глазнице, игральные карты-надгробия.
// Багрянец на чёрном: киноварь и ночь, кость; тепло — только язычки нимба.
// По слову автора вертит пику и пару кинжалов: у костра подпекает скальп над
// огнём, потом крутит пику; на ходу (world/wandering.js) крутит не переставая;
// кинжалы по очереди взлетают с правой руки.
// Пиксель к пикселю; свет слева, кромка пеплом справа.
// ═══════════════════════════════════════
import { t } from '../../core/time.js';
import { X } from '../../render/context.js';

const NI = '#0D0B0A', BO = '#D9CFB8', AS = '#8A8D8F', SV = '#E28A3A', KV = '#C23B2B';
const K0 = '#15100c', K1 = '#241c14', K4 = '#3a3328';
const BR2 = '#3a2818', L1 = '#c8b89a', L2 = '#b0a284', S0 = '#474442';
const q = Math.round;
const r = (x, y, w = 1, h = 1, c) => { X.fillStyle = c; X.fillRect(q(x), q(y), w, h); };
const line = (x0, y0, x1, y1, c) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let k = 0; k <= n; k++) r(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, 1, 1, c); };

let npcProximity = 0;
export function setProximity(v) { npcProximity = v; }

// карта-надгробие: воткнута в землю, чуть набок
function card(x, g, lean, pip) {
  r(x - 1, g - 6, 5, 7, K1);
  for (let k = 0; k < 5; k++) r(x + (k < 2 ? lean : 0), g - 5 + k, 3, 1, k === 0 ? BO : L1);
  r(x + 1 + (lean > 0 ? 1 : 0), g - 4, 1, 2, pip);
  r(x - 1, g, 5, 1, K0);
}
// кинжал по оси: навершие, рукоять, гарда, клинок; a — куда смотрит остриё
function dagger(cx, cy, a) {
  const c = Math.cos(a), s = Math.sin(a);
  for (const [k, p, col] of [[-2, 0, L2], [-1, 0, K1], [0, 0, K1], [1, -1, L2], [1, 0, L2], [1, 1, L2], [2, 0, AS], [3, 0, AS], [4, 0, BO], [5, 0, BO]]) r(cx + k * c - p * s, cy + k * s + p * c, 1, 1, col);
}
const TWIRL = 420, ROAST = 260;                                          // цикл у костра: семь секунд, из них подпекает четыре с третью
const DAG = 64;                                                          // кинжал: взлёт, оборот с половиной, в руке
export function drawNPC_jester(jx, jy, opts = {}) {
  const home = opts.moving === undefined, moving = !!opts.moving;
  const x0 = q(jx), y0 = q(jy);
  // пошатывается: таз в одну сторону, плечи — в другую, голова запаздывает
  const sw = Math.sin(t * 0.0045), hip = moving ? 0 : q(sw), sh = moving ? 0 : -q(sw * 0.8), hd = moving ? 0 : q(Math.sin(t * 0.0045 - 0.8));
  const step = moving ? Math.sin(t * 0.18) : 0, bob = moving ? q(Math.abs(step) * 1.5) : 0;
  const cx = x0 + 12, by = y0 - bob, G = y0 + 46;
  // ── у костра: карты-надгробия в земле ──
  if (home) { card(x0 - 6, G - 2, 1, KV); card(x0 + 24, G - 3, -1, NI); }
  X.globalAlpha = 0.3; r(cx - 7, G, 14, 1, NI); X.globalAlpha = 1;
  // ── горящий нимб — за головой: кольцо киновари, язычки свечой ──
  const hx = cx - 4 + sh + hd, hy = by + 1;
  for (let a = 0; a < 44; a++) {
    const u = a / 44 * Math.PI * 2, rx = hx + 4 + Math.cos(u) * 9, ry = hy + 4 + Math.sin(u) * 8;
    r(rx, ry, 1, 1, a % 6 === (t >> 4) % 6 ? K1 : KV);
  }
  for (let i = 0; i < 4; i++) {                                         // язычки по верху кольца
    const u = Math.PI * (1.2 + i * 0.2), h = 1 + (((t >> 3) + i * 3) % 3 === 0 ? 1 : 0);
    r(hx + 4 + Math.cos(u) * 9, hy + 4 + Math.sin(u) * 8 - h, 1, h, SV);
  }
  // ── хвост с лезвием — из-за спины, вьётся ──
  const tw = Math.sin(t * 0.01) * (moving ? 3 : 1.5);
  let px0 = cx + 4 + hip, py0 = by + 27;
  for (let k = 1; k <= 12; k++) {
    const nx = cx + 4 + hip + k * 0.9 + Math.sin(k * 0.5) * 1.5 + tw * k / 12, ny = by + 27 + k * 0.9 - (k > 8 ? (k - 8) * 1.4 : 0);
    line(px0, py0, nx, ny, NI); px0 = nx; py0 = ny;
  }
  r(px0, py0 - 3, 1, 3, AS); r(px0 + 1, py0 - 2, 1, 2, BO); r(px0 - 1, py0 - 1, 1, 1, S0);   // лезвие
  // ── ноги: трико в два цвета; на ходу — шаг ──
  const lL = moving ? q(Math.max(0, step) * 3) : 0, lR = moving ? q(Math.max(0, -step) * 3) : 0;
  r(cx - 5 + hip, by + 28, 3, 16 - lL, NI); r(cx + 2 + hip, by + 28, 3, 16 - lR, KV);
  for (let k = 0; k < 7; k++) { r(cx - 4 + hip, by + 29 + k * 2, 1, 1, KV); r(cx + 3 + hip, by + 29 + k * 2, 1, 1, NI); }
  r(cx - 5 + hip, by + 28, 1, 16 - lL, K4); r(cx + 4 + hip, by + 28, 1, 16 - lR, AS);
  // башмаки с загнутыми носами и бубенцами
  const fL = by + 44 - lL, fR = by + 44 - lR;
  r(cx - 7 + hip, fL, 5, 2, NI); r(cx - 9 + hip, fL - 1, 3, 2, NI); r(cx - 10 + hip, fL - 2, 1, 1, NI); r(cx - 11 + hip, fL - 3, 1, 1, L2);
  r(cx + 2 + hip, fR, 5, 2, NI); r(cx + 6 + hip, fR - 1, 3, 2, NI); r(cx + 9 + hip, fR - 2, 1, 1, NI); r(cx + 10 + hip, fR - 3, 1, 1, L2);
  // ── камзол: ромбы арлекина ──
  const tx = cx - 5 + q((hip + sh) / 2), ty = by + 14;
  for (let yy = 0; yy < 14; yy++) for (let xx = 0; xx < 11; xx++) {
    const u = (xx + 0.5) / 6, v = (yy + 4.5) / 9, d = (Math.floor(u + v) + Math.floor(u - v + 8)) & 1;   // ромб: шесть в ширину, девять в высоту
    r(tx + xx, ty + yy, 1, 1, d ? KV : NI);
  }
  r(tx, ty, 1, 14, BO); r(tx + 10, ty, 1, 14, AS);                       // свет слева, кромка пеплом
  r(tx, ty + 12, 11, 1, K1); r(tx + 5, ty + 12, 1, 1, L2);               // пояс, пряжка
  // ворот зубцами: кость и киноварь
  for (let k = 0; k < 6; k++) { r(tx - 1 + k * 2, ty - 1, 2, 1, k & 1 ? KV : BO); r(tx + k * 2, ty, 1, 1, k & 1 ? KV : BO); }
  // ── руки: левая вертит пику, правая — два кинжала ──
  const sL = { x: tx - 1, y: ty + 2 }, sR = { x: tx + 11, y: ty + 2 };
  const swing = moving ? q(step * 2) : 0;
  // пика: у костра держит над огнём — подпекает, потом перехватывает за середину и крутит
  // два оборота; на ходу крутит не переставая
  const ph = t % TWIRL, HOLD = Math.atan2(-13, -30);
  let ang = HOLD, spin = 0;
  if (moving) { ang = HOLD + t * 0.09; spin = 1; }
  else if (ph >= ROAST) { const u = (ph - ROAST) / (TWIRL - ROAST), e = u * u * (3 - 2 * u); ang = HOLD + e * Math.PI * 4; spin = Math.sin(u * Math.PI); }
  const hL = { x: sL.x - 4 + q(Math.cos(ang * 2) * spin), y: sL.y + 3 + q(Math.sin(ang * 2) * spin) };   // кисть ходит кругом
  line(sL.x, sL.y, hL.x, hL.y, NI); line(sL.x + 1, sL.y + 1, hL.x + 1, hL.y, KV);
  // правая подбрасывает: в такт кинжалам кисть чуть вверх
  const hR = { x: sR.x + 2 - swing, y: sR.y + 9 - (((t % DAG) / DAG) < 0.12 ? 1 : 0) };
  line(sR.x, sR.y, hR.x, hR.y, NI); line(sR.x + 1, sR.y, hR.x + 1, hR.y, KV);
  // ── голова: лицо белое, губы красные — улыбка как форма; крест в глазнице ──
  r(hx - 1, hy, 10, 11, K0);
  r(hx, hy + 1, 8, 9, BO); r(hx, hy + 1, 1, 9, L1); r(hx + 7, hy + 2, 1, 7, L2);
  r(hx + 1, hy + 3, 3, 4, K0); r(hx + 2, hy + 3, 1, 4, KV); r(hx + 1, hy + 4, 3, 1, KV);   // глазница, в ней крест
  const blink = t % 900 < 6;
  if (blink) r(hx + 5, hy + 4, 2, 1, K1); else { r(hx + 5, hy + 3, 2, 2, K0); r(hx + 5, hy + 4, 1, 1, KV); }   // моргает редко
  r(hx + 3, hy + 6, 1, 1, L2);                                           // нос
  r(hx + 1, hy + 8, 6, 1, KV); r(hx, hy + 7, 1, 1, KV); r(hx + 7, hy + 7, 1, 1, KV); r(hx + 2, hy + 9, 4, 1, KV);   // губы — улыбка
  r(hx + 2, hy + 8, 4, 1, NI);
  // ── колпак: три рога с бубенцами ──
  r(hx - 1, hy - 1, 10, 2, KV); r(hx - 1, hy - 1, 10, 1, K1); r(hx - 1, hy, 1, 1, BO);
  const hs = Math.sin(t * 0.009) * (moving ? 1.5 : 0.8);
  const horn = (pts, c) => { for (const [ax, ay] of pts) r(hx + ax, hy + ay, 2, 2, c); };
  horn([[-1, -3], [-3, -5], [-5, -7], [-6 + q(hs), -9]], KV);
  horn([[3, -3], [3, -5], [3, -7], [3 + q(hs * 0.5), -10]], NI);
  horn([[7, -3], [9, -5], [11, -7], [12 + q(hs), -9]], KV);
  for (const [bx, bb] of [[-7 + q(hs), -10], [3 + q(hs * 0.5), -12], [14 + q(hs), -10]]) { r(hx + bx, hy + bb, 2, 1, L2); r(hx + bx, hy + bb + 1, 1, 1, AS); }
  // ── пика — перед ним: древко, наконечник, скальп; на быстром обороте — след ──
  const ca = Math.cos(ang), sa = Math.sin(ang), grip = 7 + 12 * spin;  // хват ползёт к середине
  const tip = { x: hL.x + ca * (38 - grip), y: hL.y + sa * (38 - grip) }, tail = { x: hL.x - ca * grip, y: hL.y - sa * grip };
  if (spin > 0.6) {
    X.globalAlpha = 0.25;
    for (const dA of [-0.35, -0.7]) { const c2 = Math.cos(ang + dA), s2 = Math.sin(ang + dA); r(hL.x + c2 * (37 - grip), hL.y + s2 * (37 - grip), 1, 1, L2); r(hL.x - c2 * grip, hL.y - s2 * grip, 1, 1, L2); }
    X.globalAlpha = 1;
  }
  line(tail.x, tail.y, tip.x, tip.y, BR2);
  if (Math.abs(sa) < 0.7) line(tail.x, tail.y - 1, tip.x, tip.y - 1, L2); else line(tail.x - 1, tail.y, tip.x - 1, tip.y, L2);   // кромка к свету
  r(hL.x, hL.y, 2, 2, BO);                                               // кулак
  r(tip.x + ca, tip.y + sa, 1, 1, AS); r(tip.x + ca * 2, tip.y + sa * 2, 1, 1, S0);   // наконечник
  // скальп: висит, когда держит; на обороте прядь летит наружу
  const hx2 = ca * spin, hy2 = sa * spin + (1 - spin), hn = Math.hypot(hx2, hy2) || 1;
  const sx = tip.x - ca, sy = tip.y - sa;
  r(sx - 1, sy, 3, 2, K1); r(sx, sy + 1, 2, 1, KV);
  for (const off of [-1, 0, 1]) for (let k = 1; k <= 3; k++) r(sx + off * (1 - spin) + hx2 / hn * k, sy + 1 + hy2 / hn * k + off * spin, 1, 1, K1);
  if (!moving && ph < ROAST) for (let i = 0; i < 3; i++) {             // подпекается: дымок
    const u = ((t * 0.4 + i * 20) % 60) / 60;
    X.globalAlpha = 0.35 * (1 - u); r(sx + q(Math.sin(u * 6 + i) * 1.5), sy - 2 - q(u * 14), 1, 1, AS);
  }
  X.globalAlpha = 1;
  // ── два кинжала: по очереди взлетают с правой руки, вертятся, ложатся обратно ──
  for (let i = 0; i < 2; i++) {
    const u = ((t + i * DAG / 2) % DAG) / DAG;
    if (u < 0.78) {
      const a = u / 0.78, side = i ? 1 : -1;
      dagger(hR.x + 1 + q(Math.sin(a * Math.PI) * 3 * side), hR.y - 2 - q(Math.sin(a * Math.PI) * 15), a * Math.PI * 3 + i * 1.3);
    } else dagger(hR.x + 1, hR.y + 1, Math.PI / 2);                     // в руке — остриём вниз
  }
  // ── «ХА!» вблизи ──
  if (npcProximity > 0.3 && t % 80 < 20) {
    const laughPh = (t % 80) / 20;
    X.globalAlpha = (1 - laughPh) * npcProximity * 0.7;
    X.fillStyle = KV;
    X.font = '6px "Press Start 2P"';
    X.fillText('ХА!', cx + 12 - laughPh * 2, hy - 10 - laughPh * 4);
    X.globalAlpha = 1;
  }
}
