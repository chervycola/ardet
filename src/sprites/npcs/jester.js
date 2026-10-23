// ═══════════════════════════════════════
// ШУТ — по осмотру и ART_BIBLE §05. «Шут стоит у костра и пошатывается,
// сдвигая центр тяжести. Если смотреть долго — замечаешь редкое моргание.
// В одной руке — кинжал. В другой держит пику, на которой подпекается над
// костром человеческий скальп. Лицо белое, губы красные. Улыбка — не
// результат, а форма.» По библии: колпак с тремя рогами, ромбы арлекина,
// хвост с лезвием, горящий нимб, крест в глазнице, игральные карты-надгробия.
// Багрянец на чёрном: киноварь и ночь, кость; тепло — только язычки нимба.
// По слову автора жонглирует: три вещи каскадом из руки в руку, оружие разное —
// кинжал, топорик, серп, булава, тесак; каждая вертится в полёте, раз в
// несколько кругов одна меняется на другую. Руки — естественными движениями
// (слово автора, 23.10): кисть ловит снаружи, подхватывает ковшом, бросает у
// середины; локти у тела. Пика с лицом воткнута в землю у
// костра (рисуется с костром, sprites/locations/canon.js). На ходу
// (world/wandering.js) жонглирует так же.
// Пиксель к пикселю; свет слева, кромка пеплом справа.
// ═══════════════════════════════════════
import { t } from '../../core/time.js';
import { X } from '../../render/context.js';

const NI = '#0D0B0A', BO = '#D9CFB8', AS = '#8A8D8F', SV = '#E28A3A', KV = '#C23B2B';
const K0 = '#15100c', K1 = '#241c14', K3 = '#34302a', K4 = '#3a3328';
const BR2 = '#3a2818', L1 = '#c8b89a', L2 = '#b0a284', S0 = '#474442', S1 = '#5e5e5d';
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
// оружие по оси: k — вдоль (к острию, к бойку), p — поперёк; a — куда смотрит
const WEAPONS = {
  кинжал: [[-2, 0, L2], [-1, 0, K1], [0, 0, K1], [1, -1, L2], [1, 0, L2], [1, 1, L2], [2, 0, AS], [3, 0, AS], [4, 0, BO], [5, 0, BO]],
  топорик: [[-3, 0, BR2], [-2, 0, BR2], [-1, 0, BR2], [0, 0, BR2], [1, 0, BR2], [2, 0, K1], [2, -1, K1], [2, 1, AS], [3, 1, AS], [1, 2, AS], [2, 2, AS], [3, 2, BO], [1, 3, BO], [2, 3, BO], [3, 3, BO]],
  серп: [[-3, 0, BR2], [-2, 0, BR2], [-1, 0, K1], [0, 0, AS], [1, -1, AS], [2, -2, AS], [3, -2, BO], [4, -2, AS], [5, -1, BO], [5, 0, AS], [4, 1, BO]],
  булава: [[-3, 0, BR2], [-2, 0, BR2], [-1, 0, BR2], [0, 0, BR2], [1, 0, K1], [2, -1, K3], [2, 0, K4], [2, 1, K3], [3, -1, K4], [3, 0, S1], [3, 1, K4], [4, 0, K3], [2, -2, S1], [2, 2, S1], [4, -1, S1], [4, 1, S1], [5, 0, S1]],
  тесак: [[-2, 0, BR2], [-1, 0, BR2], [0, 0, K1], [1, -1, K1], [1, 0, AS], [1, 1, AS], [2, 0, AS], [2, 1, AS], [3, 0, AS], [3, 1, BO], [4, 0, AS], [4, 1, BO], [5, 1, BO]],
};
const KINDS = Object.keys(WEAPONS);
function weapon(kind, cx, cy, a) {
  const c = Math.cos(a), s = Math.sin(a);
  for (const [k, p, col] of WEAPONS[kind]) r(cx + k * c - p * s, cy + k * s + p * c, 1, 1, col);
}
// каскад: вещь летит FLY шагов (выше головы), в руке лежит HOLD; бросок каждые S шагов,
// руки по очереди — каждая бросает раз в 2S; вещь возвращается в ту же руку через 2(FLY+HOLD)
const FLY = 45, HOLD = 30, S = (FLY + HOLD) / 3, HIGH = 34;
// точки петли кисти от плеча: бросок — у пояса ближе к середине, ловля — снаружи и чуть
// выше, низ подхвата — между ними; dir — наружу (−1 левая, +1 правая)
const hand = (sh, dir) => ({ throwP: { x: sh.x + dir * 2, y: sh.y + 8 }, catchP: { x: sh.x + dir * 8, y: sh.y + 6 }, low: { x: sh.x + dir * 5, y: sh.y + 11 } });
// где кисть сейчас: пустая — от броска наружу и чуть вверх к ловле; с вещью — подхват
// вниз и к середине, к броску. off — сдвиг фазы (правая — на шаг броска позже)
function handAt(sh, dir, time, off, swing) {
  const P = hand(sh, dir), Hc = 2 * S, ph = ((time - off) % Hc + Hc) % Hc;
  let x, y;
  if (ph < Hc - HOLD) {                                                  // пустая: наружу, навстречу
    const u = ph / (Hc - HOLD);
    x = P.throwP.x + (P.catchP.x - P.throwP.x) * u; y = P.throwP.y + (P.catchP.y - P.throwP.y) * u - Math.sin(u * Math.PI) * 2;
  } else {                                                               // с вещью: подхват ковшом
    const v = (ph - (Hc - HOLD)) / HOLD, cx = 2 * P.low.x - (P.catchP.x + P.throwP.x) / 2, cy = 2 * P.low.y - (P.catchP.y + P.throwP.y) / 2;
    x = (1 - v) * (1 - v) * P.catchP.x + 2 * (1 - v) * v * cx + v * v * P.throwP.x;
    y = (1 - v) * (1 - v) * P.catchP.y + 2 * (1 - v) * v * cy + v * v * P.throwP.y;
  }
  return { x: q(x + swing), y: q(y) };
}
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
  // ── руки: жонглируют по-настоящему (слово автора: «естественными движениями») ──
  // каждая кисть ходит петлёй: ловит снаружи, несёт вещь вниз и к середине,
  // бросает у пояса, пустая уходит наружу и чуть вверх — навстречу следующей;
  // локти у тела, ходит предплечье; руки — в противофазе (cascade)
  const sL = { x: tx - 1, y: ty + 2 }, sR = { x: tx + 11, y: ty + 2 };
  const swing = moving ? q(step * 1.5) : 0;
  const hL = handAt(sL, -1, t, 0, swing), hR = handAt(sR, 1, t, S, -swing);
  const arm = (sh, h, dir) => {                                          // плечо → локоть у тела → кисть
    const el = { x: sh.x + dir * 2 + (h.x - sh.x - dir * 5) * 0.3, y: sh.y + 6 + (h.y - sh.y - 9) * 0.25 };
    line(sh.x, sh.y, el.x, el.y, KV); line(sh.x + dir, sh.y + 1, el.x + dir, el.y, NI);   // плечо: киноварь, тень снаружи
    line(el.x, el.y, h.x, h.y, NI); line(el.x - dir, el.y, h.x - dir, h.y, dir < 0 ? K4 : AS);   // предплечье: чёрное, кромка
    const cf = { x: el.x + (h.x - el.x) * 0.7, y: el.y + (h.y - el.y) * 0.7 };
    r(cf.x, cf.y, 1, 1, BO); r(cf.x - dir, cf.y, 1, 1, L1);              // манжета костью — у кисти, как ворот
  };
  arm(sL, hL, -1); arm(sR, hR, 1);
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
  // ── каскад: три вещи накрест из руки в руку; каждая вертится в полёте, в руке лежит
  //    остриём вверх; раз в шесть бросков у каждой — другое оружие, одинаковых нет ──
  r(hL.x, hL.y, 2, 2, BO); r(hR.x, hR.y, 2, 2, BO);                      // кулаки
  const k0 = Math.floor(t / S);
  for (let i = 0; i < 3; i++) {
    const k = k0 - (((k0 - i) % 3) + 3) % 3, dt = t - k * S, n = (k - i) / 3;   // последний бросок этой вещи
    const fromL = (k & 1) === 0, a = fromL ? hand(sL, -1) : hand(sR, 1), b = fromL ? hand(sR, 1) : hand(sL, -1);
    const kind = KINDS[(((Math.floor(n / 6) * 3 + i) % KINDS.length) + KINDS.length) % KINDS.length];
    if (dt < FLY) {                                                      // в полёте: от точки броска к точке ловли
      const u = dt / FLY, H = fromL ? HIGH : HIGH - 5;                   // встречные дуги — на разной высоте
      const wx = a.throwP.x + swing * (fromL ? 1 : -1) + (b.catchP.x - a.throwP.x) * u, wy = a.throwP.y + (b.catchP.y - a.throwP.y) * u - Math.sin(u * Math.PI) * H;
      weapon(kind, wx + 1, wy - 1, u * Math.PI * 2 * (fromL ? 1 : -1) + i * 2.1 - Math.PI / 2);
    } else {                                                             // в руке: несут к броску
      const h = fromL ? hR : hL;
      weapon(kind, h.x + 1, h.y - 2, -Math.PI / 2 + (fromL ? 0.25 : -0.25));
    }
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
