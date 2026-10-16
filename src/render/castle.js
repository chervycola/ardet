// ═══════════════════════════════════════
// ЗАМОК-ПОГОДА (ART_BIBLE §04, опись городка: «замок на горе — виден
// отовсюду; дорога к нему всегда возвращает в городок»; «замок — рисовать
// как погоду · окна не горят»). Далёкий силуэт на горе в полосе неба по верху
// кадра, гравюрой: штрих костью по тёмному, освещённое — кромкой слева.
// Он не приближается: где ни стой, он того же роста; висит над городком —
// с востока виден на западе, с запада — на востоке, и путь к нему ведёт назад
// в городок. Как погода: туман то прячет его целиком, то открывает башню,
// то весь; клочья тумана идут по ветру. В песчаную бурю и отравленный дождь
// его не видно, в красный полдень — тоже. Кто стоит на мосту подолгу, тому
// туман расходится (§04: «мост — с него видно и замок, и врата»).
// Окна — тёмные всегда. На башне флюгер — крест (Г6), поворачивается по ветру.
// ═══════════════════════════════════════
import { TOWN } from '../world/disc.js';
import { wind } from '../world/wind.js';
import { t } from '../core/time.js';

const NI = [13, 11, 10], BO = [217, 207, 184], AS = [138, 141, 143], MG = [61, 74, 58];
const css = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k | 0, a[1] + (b[1] - a[1]) * k | 0, a[2] + (b[2] - a[2]) * k | 0];
// гравюрой: тело тёмное (мгла), к свету — штрих костью, кромка слева светлее;
// гора — темнее замка, штрих по склону к свету реже
const BODY = mix(NI, MG, 0.8), HATCH = mix(MG, BO, 0.42), LIT = mix(AS, BO, 0.6), RIM = mix(MG, AS, 0.55);
const HILL = mix(NI, MG, 0.55), HILLH = mix(MG, BO, 0.3);
const HX = (TOWN.x0 + TOWN.x1) / 2 - 500;      // над чем висит: середина посёлка
const W = 150, H = 50;                         // холст горы с замком; низ — линия горы

// шум для погоды: плавный, на минуты
function n1(x, s) {
  const i = Math.floor(x), f = x - i, h = k => { let v = Math.sin((k + s * 57.3) * 127.1) * 43758.5453; return v - Math.floor(v); };
  const u = f * f * (3 - 2 * f);
  return h(i) + (h(i + 1) - h(i)) * u;
}

let art = null;
// гора и замок — один раз, в свой холст
function build() {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const R = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const G = H - 1;
  // гора: пологий горб, макушка — под замком; тень справа — штрихом
  const top = [];
  for (let x = 0; x < W; x++) {
    const u = (x - 74) / 75, hh = Math.round(20 * Math.max(0, 1 - Math.abs(u) ** 1.7) + (Math.sin(x * 0.7) + Math.sin(x * 0.23)) * 0.6);
    top[x] = G - Math.max(0, hh);
    R(css(HILL), x, top[x], 1, G - top[x] + 1);
  }
  for (let x = 0; x < W; x++) {
    // склон к свету (левый) — штрихом кости, редеет книзу; теневой — без штриха
    for (let y = top[x] + 2; y <= G; y += 2) if (x < 74 && (x + (y >> 1)) % 3 === 0 && y - top[x] < 9) R(css(HILLH), x, y);
    if (x < 76 && top[x] <= top[x + 1]) R(css(LIT, 0.8), x, top[x]);                  // склон к свету — кромкой
    else if (x >= 76) R(css(RIM, 0.7), x, top[x]);
  }
  // замок: стена с зубцами, за ней — низкие дома тесно, и одна круглая башня
  const B = top[74] + 2, X = 44;                 // подошва замка, левый край
  const mass = (x0, y0, w, h) => {               // масса: тело, штрих к свету (левая половина), кромки
    R(css(BODY), X + x0, B - y0 - h, w, h);
    for (let y = B - y0 - h + 1; y < B - y0; y += 2) R(css(HATCH), X + x0 + 1, y, Math.max(1, (w >> 1) - 1), 1);
    R(css(LIT), X + x0, B - y0 - h, 1, h);
    R(css(RIM), X + x0 + w - 1, B - y0 - h, 1, h);
  };
  const roof = (x0, w, base, hgt) => {           // скат: щипец, конёк светлее слева
    for (let k = 0; k < hgt; k++) {
      const a = Math.round(k * (w / 2) / hgt), y = base - k - 1;
      R(css(BODY), X + x0 + a, y, Math.max(1, w - 2 * a), 1);
      R(css(LIT), X + x0 + a, y, 1, 1);
      R(css(RIM), X + x0 + w - a - 1, y, 1, 1);
    }
  };
  mass(2, 0, 10, 7); roof(2, 10, B - 7, 4);
  mass(13, 0, 12, 9); roof(13, 12, B - 9, 5);
  mass(34, 0, 20, 10); roof(34, 20, B - 10, 5);
  mass(54, 0, 8, 6); roof(54, 8, B - 6, 3);
  // башня — круглая, выше всех; верх — зубцами вразнобой
  mass(25, 0, 8, 26);
  for (const [dx, h] of [[0, 2], [2, 1], [3, 3], [5, 1], [7, 2]]) R(css(BODY), X + 25 + dx, B - 26 - h, 1, h);
  R(css(LIT), X + 25, B - 28, 1, 2);
  // стена с зубцами — перед домами
  R(css(BODY), X, B - 4, 64, 4);
  for (let x = 0; x < 64; x += 3) R(css(BODY), X + x, B - 5, 1, 1);
  R(css(LIT), X, B - 5, 1, 5); R(css(RIM), X + 63, B - 4, 1, 4);
  for (let x = 1; x < 32; x += 2) R(css(HATCH), X + x, B - 2, 1, 1);
  // окна — тёмные, всегда
  for (const [x, y] of [[5, 4], [8, 4], [16, 5], [19, 5], [22, 5], [37, 6], [41, 6], [45, 6], [49, 6], [57, 3], [28, 10], [28, 16], [30, 21]]) R(css(NI), X + x, B - y, 1, 2);
  // подошва горы тонет в тумане: книзу — на нет
  // (одной заливкой: «destination-in» стирает всё, что вне закрашенного)
  g.globalCompositeOperation = 'destination-in';
  const fade = g.createLinearGradient(0, 0, 0, H);
  fade.addColorStop(0, 'rgba(0,0,0,1)'); fade.addColorStop((H - 16) / H, 'rgba(0,0,0,1)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = fade; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'source-over';
  art = { c, cx: X + 29, ty: B - 29, G };       // ось башни, верх башни
  return art;
}

// ── крыши городка (§04: «два-три плана силуэтов; черепица, дранка, одна
// дымящая труба») — у подножия горы, перед ней: дальний план в тумане, ближний
// темнее. Видны из городка; за его кромкой тают ──
const RW = 230, RH = 30;
let roofs = null;
function buildRoofs() {
  // план: дома бок о бок, где-то проулок; стена с тёмными окнами, крыша — щипцом
  // или вальмой; черепица — рядами по скату к свету, дранка — штрихом
  const plane = (seed, y0, hmin, hmax, body, lit, alpha, smoke) => {
    const c = document.createElement('canvas'); c.width = RW; c.height = RH;
    const g = c.getContext('2d'), R = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    const base = RH - 1;
    let x = 2 + Math.round(n1(seed, seed) * 6), k = 0, chimney = null;
    const peaks = [];
    while (x < RW - 12) {
      const r1 = n1(k * 1.7 + seed, seed), r2 = n1(k * 2.3 + seed * 3, seed + 1), r3 = n1(k * 3.1 + seed * 5, seed + 2);
      const w = 12 + Math.round(r1 * 12), wall = 3 + Math.round(r3 * 4), hh = hmin + Math.round(r2 * (hmax - hmin));
      const hip = r3 > 0.62, tile = r1 > 0.35, top = base - wall;
      R(css(body), x, top, w, wall + 1);
      R(css(lit, 0.6), x, top, 1, wall + 1);
      for (let wx = x + 3; wx < x + w - 2; wx += 4) R(css(NI), wx, top + 1 + (k & 1), 1, 2);   // окна — тёмные
      for (let j = 0; j < hh; j++) {
        const a = Math.round(j * (w / 2) / hh) + (hip ? Math.min(2, j) : 0), y = top - j - 1, ww = Math.max(1, w - 2 * a);
        if (hip && ww < 4) break;
        R(css(body), x + a, y, ww, 1);
        R(css(lit), x + a, y, 1, 1);                                              // скат к свету — кромкой
        if (tile && j % 2 === 1) R(css(lit, 0.5), x + a + 1, y, Math.max(0, (ww >> 1) - 1), 1);
        if (!tile && (x + a + j) % 3 === 0) R(css(lit, 0.45), x + a + 1, y, 1, 1);
      }
      if (!hip) peaks.push({ x: x + (w >> 1), y: top - hh });
      if (smoke && !chimney && x > RW * 0.5) {                                   // одна труба, и та — на ближнем плане
        chimney = { x: x + (w >> 1) + 2, y: top - hh + 3 };
        R(css(body), chimney.x, chimney.y - 6, 2, 7); R(css(lit), chimney.x, chimney.y - 6, 1, 7);
      }
      x += w + (r2 > 0.7 ? 3 + Math.round(r1 * 5) : -1); k++;                     // проулок или стена к стене
    }
    g.globalCompositeOperation = 'destination-in';                                // низ тонет в тумане
    const f = g.createLinearGradient(0, 0, 0, RH);
    f.addColorStop(0, 'rgba(0,0,0,1)'); f.addColorStop(0.62, 'rgba(0,0,0,1)'); f.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = f; g.fillRect(0, 0, RW, RH);
    return { c, y0, alpha, chimney, peaks };
  };
  roofs = [plane(5, -7, 4, 7, mix(NI, MG, 0.8), mix(MG, BO, 0.3), 0.45, false), plane(2, 0, 5, 10, mix(NI, MG, 0.4), mix(MG, BO, 0.5), 1, true)];
  return roofs;
}
// насколько видно крыши: в городке — вполне, за кромкой тает
function inTown(cx, cy) {
  const dx = Math.max(TOWN.x0 - cx, 0, cx - TOWN.x1), dy = Math.max(TOWN.y0 - cy, 0, cy - TOWN.y1);
  return Math.max(0, 1 - Math.hypot(dx, dy) / 300);
}

// ── погода: видно ли замок ──
let clear = 0, vaneA = Math.PI, drift = 0;
// stand — стоит ли странник на мосту (0/1); шаг — 60 раз в секунду
export function stepCastle(stand) {
  clear = stand ? Math.min(1, clear + 1 / 240) : Math.max(0, clear - 1 / 400);   // ~4 с — разошёлся, ~7 — сошёлся
  let d = wind.ang + Math.PI - vaneA;                                              // флюгер: навстречу ветру, с ленцой
  d = Math.atan2(Math.sin(d), Math.cos(d));
  vaneA += d * 0.01;
  drift += (0.02 + wind.s * 0.12) * (wind.x >= 0 ? 1 : -1);                        // туман сносит ветром — копится, не прыгает
}
export function castleClear() { return clear; }

// видимость: погода (минуты), буря и дождь прячут, красный полдень стирает
export function castleSeen(storm = 0, noon = 0) {
  // туман приходит и уходит: волна минут в семь (в начале ясно) и шум поверх
  const cyc = 0.5 + 0.5 * Math.cos(t / (60 * 60 * 7) * Math.PI * 2), w = n1(t / 6000, 3);
  const base = Math.max(0, Math.min(1, cyc * 0.75 + w * 0.5 - 0.15));
  const v = Math.max(0.15 + 0.85 * base * base * (3 - 2 * base), clear);
  return v * (1 - storm) * (1 - noon);
}

// ── рисунок: ctx — экранный (фон, без камеры) ──
export function drawCastle(ctx, cam, vw, vh, seen) {
  // висит над городком: чем дальше в сторону, тем сильнее он в той стороне, где городок
  const cx = cam.x + vw / 2, off = -Math.tanh((cx - HX) / 1800) * 0.36 * vw, town = inTown(cx, cam.y + vh / 2);
  if (seen <= 0.01 && town <= 0.01) return;
  const A = art || build();
  const x0 = Math.round(vw * 0.56 + off - W / 2), y0 = Math.round(Math.min(vh * 0.14, 50) - H);
  ctx.save();
  if (seen > 0.01) castle(ctx, A, x0, y0, seen);
  if (town > 0.01) houses(ctx, x0, y0, town);
  ctx.restore();
}
// гора с замком, флюгер, туман
function castle(ctx, A, x0, y0, seen) {
  ctx.globalAlpha = 0.9 * seen;
  ctx.drawImage(A.c, x0, y0);
  // флюгер-крест на башне: стойка и перекладина, видная в проекции
  const fx = x0 + A.cx, fy = y0 + A.ty, arm = Math.round(Math.cos(vaneA) * 2);
  ctx.fillStyle = css(LIT);
  ctx.fillRect(fx, fy - 6, 1, 6);
  if (arm) ctx.fillRect(fx + Math.min(0, arm), fy - 4, Math.abs(arm) + 1, 1);
  else ctx.fillRect(fx, fy - 4, 1, 1);
  // туман: клочья полосами, идут по ветру; где густо — прячет
  for (let k = 0; k < 3; k++) {
    const by = y0 + 18 + k * 11 + Math.round(Math.sin(t * 0.0007 + k * 2) * 3), dens = 0.5 + 0.5 * n1(t / 5200 + k * 3.1, 7 + k);
    for (let x = -4; x < W + 8; x += 2) {
      const q = n1((x + drift * (1 + k * 0.4)) / 23 + k * 40, 11 + k);
      const a = Math.max(0, q - 0.35) * dens * (1 - clear) * 0.5;
      if (a < 0.03) continue;
      const hh = 2 + Math.round(q * 5);
      ctx.globalAlpha = Math.min(1, a) * seen;
      ctx.fillStyle = css(mix(MG, AS, 0.5));
      ctx.fillRect(x0 + x, by - (hh >> 1), 2, hh);
    }
  }
}
// крыши — перед горой, без погоды: туман их не прячет, город рядом
function houses(ctx, x0, y0, town) {
  const P = roofs || buildRoofs(), rx = x0 + W / 2 - RW / 2, ry = y0 + H - RH + 8;
  for (const p of P) {
    ctx.globalAlpha = p.alpha * town;
    ctx.drawImage(p.c, rx, ry + p.y0);
    if (!p.chimney) continue;
    // кот на крышах — чаще, чем геометрически возможно (§04, подмигивание):
    // раз в две с половиной минуты полминуты сидит на коньке; бывает — на двух сразу
    const cyc = Math.floor(t / 9000);
    if (t % 9000 < 1800 && p.peaks.length) {
      const n = cyc % 3 === 2 ? 2 : 1;
      for (let j = 0; j < n; j++) {
        const pk = p.peaks[Math.floor(n1(cyc * 3.7 + j * 11, 21) * p.peaks.length) % p.peaks.length];
        const kx = rx + pk.x, ky = ry + p.y0 + pk.y;
        ctx.globalAlpha = town;
        ctx.fillStyle = css(NI);
        ctx.fillRect(kx - 1, ky - 2, 3, 2); ctx.fillRect(kx - 1, ky - 3, 1, 1); ctx.fillRect(kx + 1, ky - 3, 1, 1);
        ctx.fillRect(kx + 2, ky - 1, 1, 1); ctx.fillRect(kx + 3, ky - 2, 1, 1);    // хвост
      }
    }
    // дым из трубы: клубы поднимаются, их сносит ветер, тают
    for (let i = 0; i < 9; i++) {
      const age = (t * 0.35 + i * 11) % 99, k = age / 99;
      const sx = rx + p.chimney.x + Math.round(age * wind.x * 0.5 + Math.sin(age * 0.15 + i) * 1.5), sy = ry + p.y0 + p.chimney.y - 6 - Math.round(age * 0.22);
      ctx.globalAlpha = (1 - k) * 0.6 * town;
      ctx.fillStyle = css(mix(AS, BO, 0.45));
      ctx.fillRect(sx, sy, 1 + Math.round(k * 3), 1 + Math.round(k * 2));
    }
  }
}
