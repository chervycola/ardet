// ═══════════════════════════════════════
// ТОКСИК — поле токсичности и просачивание бинарного кода.
// Код сочится из ядовитых мест (озеро, трубопровод, подвал, свалка,
// пропасть) и ползёт по земле, мигая 0/1. Не дождём сквозь кадр (слово
// автора): где яда много, изредка — не чаще раза в две минуты — кусок кода
// срывается с земли, летит на зрителя, растёт и бьёт в экран: держится на
// стекле, цифры перещёлкиваются, потом осыпается по точке. Стекло не
// трескается — экран бьётся только от молнии и от брейнрота (решение автора).
// Третья краска: ТОКСИЧНЫЙ ЗЕЛЁНЫЙ #8CC63F — только свечение, мало.
// ═══════════════════════════════════════
import { ringAt, RINGS } from './disc.js';
import { scaler } from '../render/scaler.js';

const GREEN = '#8CC63F', HALO = 'rgba(140,198,63,0.13)';
const GLYPH = { 0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'] };
const TOXIC_IDS = new Set(['lake', 'pipeline', 'basement', 'dumpster', 'pit', 'toxic_dump']);

let sources = null;
let tox = 0, toxTest = false, burstTest = false;
try { toxTest = /[?&]tox\b/.test(location.search); burstTest = /[?&]toxburst\b/.test(location.search); } catch (e) {}
const streams = [];
let frame = 0;
// прорыв: один за раз, между прорывами — не меньше двух минут (7200 шагов)
const GAP = 7200, LIFT = 24, FLY = 60, HOLD = 150, PEEL = 270;
let burst = null, lastBurst = -GAP;

function srcList(locations) {
  if (!sources) sources = locations.filter(l => l.zone === 'toxic' || TOXIC_IDS.has(l.id));
  return sources;
}

function glyph(ctx, x, y, bit, a, S = 1) {
  const g = GLYPH[bit];
  ctx.globalAlpha = a * 0.9;
  ctx.fillStyle = HALO;
  ctx.fillRect(x - S, y - S, 5 * S, 7 * S);
  ctx.globalAlpha = a;
  ctx.fillStyle = GREEN;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (g[r][c] === '1') ctx.fillRect(x + c * S, y + r * S, S, S);
}

export const toxic = {
  setTest(on) { toxTest = on; },
  isTest() { return toxTest; },
  level() { return tox; },

  // изнанка: яда нет и прорывов нет — счётчик стихает
  hush() { tox += (0 - tox) * 0.05; burst = null; },

  // токсичность у ног: 0..1
  update(px, py, locations, extra = 0) {
    frame++;
    let v = 0;
    const ring = ringAt(px, py);
    if (ring === 7) v = 0.22;                    // век катастроф: фон после аварий
    if (ring === RINGS + 1) v = 0.45;            // огонь
    if (ring === RINGS + 2) v = 0.7;             // за краем
    for (const l of srcList(locations)) {
      const d = Math.hypot(l.x + l.w / 2 - px, l.y + l.h / 2 - py) - Math.max(l.w, l.h) / 2;
      if (d < 240) v = Math.max(v, 0.35 + 0.65 * (1 - Math.max(0, d) / 240));
    }
    v = Math.max(v, extra);
    if (toxTest) v = Math.max(v, 0.85);
    tox += (v - tox) * 0.05;
    return tox;
  },

  // ── шаг: код сочится из ядовитых мест и сквозь кадр; ветер сносит струйки ──
  step(camX, camY, locations, wind) {
    const W = scaler.vw, H = scaler.vh;
    for (const l of srcList(locations)) {
      if (l.x + l.w < camX - 40 || l.x > camX + W + 40 || l.y + l.h < camY - 40 || l.y > camY + H + 40) continue;
      const mine = streams.filter(s => s.src === l).length;
      if (mine < 4 && Math.random() < 0.02) {
        const a = Math.random() * Math.PI * 2;
        streams.push({
          src: l, x: l.x + l.w / 2 + Math.cos(a) * l.w * 0.45, y: l.y + l.h * 0.6 + Math.sin(a) * l.h * 0.4,
          vx: Math.cos(a) * 0.12, vy: Math.abs(Math.sin(a)) * 0.08 + 0.04, trail: [], life: 400 + Math.random() * 400 | 0, acc: 0,
        });
      }
    }
    const wx = wind ? wind.x * 0.08 : 0, wy = wind ? wind.y * 0.05 : 0;
    for (let i = streams.length - 1; i >= 0; i--) {
      const s = streams[i];
      const mx = s.vx + wx + Math.sin(frame * 0.03 + i) * 0.05, my = s.vy + wy;
      s.x += mx; s.y += my; s.acc += Math.hypot(mx, my);
      if (s.acc > 6 && s.life > 60) { s.acc = 0; s.trail.push({ x: Math.round(s.x), y: Math.round(s.y), b: Math.random() < 0.5 ? 0 : 1, t: 0 }); }
      if (--s.life <= 0 && !s.trail.length) { streams.splice(i, 1); continue; }
      for (let j = s.trail.length - 1; j >= 0; j--) {
        const g = s.trail[j]; g.t++;
        if (g.t > 260) { s.trail.splice(j, 1); continue; }
        if (Math.random() < 0.02) g.b ^= 1;           // цифра перещёлкивается
      }
    }
    // прорыв: кусок кода срывается с земли у источника и бьёт в экран
    if (!burst && tox > 0.45 && frame - lastBurst > (burstTest ? 180 : GAP) && Math.random() < (burstTest ? 0.05 : 0.0006 * (tox - 0.4) * 10)) {
      let wx0 = null, wy0 = null;
      const near = streams.filter(s => s.trail.length && s.x > camX && s.x < camX + W && s.y > camY && s.y < camY + H);
      if (near.length) { const g = near[(Math.random() * near.length) | 0].trail.slice(-1)[0]; wx0 = g.x; wy0 = g.y; }
      else for (const l of srcList(locations)) if (l.x + l.w > camX && l.x < camX + W && l.y + l.h > camY && l.y < camY + H) { wx0 = l.x + l.w / 2; wy0 = l.y + l.h / 2; break; }
      if (wx0 !== null) {
        const n = 4 + ((Math.random() * 4) | 0), side = Math.random() < 0.5 ? -1 : 1;
        burst = {
          wx: wx0, wy: wy0, t: 0, S: Math.max(3, Math.round(H / 64)),
          bits: Array.from({ length: n }, () => (Math.random() < 0.5 ? 0 : 1)), rows: n > 5 ? 2 : 1,
          tx: W / 2 + side * (W * (0.12 + Math.random() * 0.22)), ty: H * (0.22 + Math.random() * 0.4),
          fall: [],
        };
        lastBurst = frame;
      }
    }
    if (burst) {
      const B = burst;
      B.t++;
      B.sx = B.wx - camX; B.sy = B.wy - camY;                          // где он сорвался — на экране сейчас
      if (B.t > HOLD && B.t < HOLD + 3) {                               // осыпается: по точке, каждая в свой черёд
        const S = B.S, cols = Math.ceil(B.bits.length / B.rows);
        B.bits.forEach((bit, k) => {
          const gx = B.tx + ((k % cols) - cols / 2) * 4 * S, gy = B.ty + ((k / cols) | 0) * 7 * S;
          GLYPH[bit].forEach((row, rr) => { for (let c = 0; c < 3; c++) if (row[c] === '1') B.fall.push({ x: gx + c * S, y: gy + rr * S, v: 0, d: (Math.random() * 60) | 0 }); });
        });
      }
      if (B.t > HOLD) for (const f of B.fall) if (B.t - HOLD > f.d) { f.v += 0.12; f.y += f.v; f.x += wind ? wind.x * 0.3 : 0; }
      if (B.t > HOLD && B.t < PEEL && Math.random() < 0.08) B.bits[(Math.random() * B.bits.length) | 0] ^= 1;   // перещёлкивается
      if (B.t >= HOLD && B.t < HOLD + 40 && Math.random() < 0.1) B.bits[(Math.random() * B.bits.length) | 0] ^= 1;
      if (B.t > PEEL) burst = null;
    }
  },

  // ── рисунок: струйки на земле (мировые координаты) ──
  drawWorld(ctx) {
    for (const s of streams) {
      for (const g of s.trail) {
        const a = Math.min(1, g.t / 20) * (1 - g.t / 260) * 0.75;
        glyph(ctx, g.x, g.y, g.b, a);
      }
    }
    ctx.globalAlpha = 1;
  },

  // ── рисунок: прорыв в экран (экранные координаты) ──
  drawScreen(ctx) {
    const B = burst;
    if (!B) return;
    const cols = Math.ceil(B.bits.length / B.rows);
    if (B.t <= FLY) {                                                    // срывается и летит на зрителя — растёт
      const lift = Math.min(1, B.t / LIFT), u = B.t <= LIFT ? 0 : (B.t - LIFT) / (FLY - LIFT), e = u * u;
      const S = Math.max(1, Math.round(1 + (B.S - 1) * e));
      const cx = Math.round(B.sx + (B.tx - B.sx) * e), cy = Math.round(B.sy - lift * 6 + (B.ty - (B.sy - 6)) * e);
      B.bits.forEach((bit, k) => glyph(ctx, cx + ((k % cols) - cols / 2) * 4 * S, cy + ((k / cols) | 0) * 7 * S, bit, 0.35 + 0.6 * lift, S));
    } else if (B.t <= HOLD) {                                            // ударил в стекло: держится, дрожит в ударе
      const S = B.S, jit = B.t < FLY + 6 ? (B.t & 1 ? S : -S) : 0;
      const a = B.t < FLY + 4 ? 1 : 0.85;
      B.bits.forEach((bit, k) => glyph(ctx, Math.round(B.tx + ((k % cols) - cols / 2) * 4 * S) + jit, Math.round(B.ty + ((k / cols) | 0) * 7 * S), bit, a, S));
    } else {                                                             // осыпается по точке
      const S = B.S, k = (B.t - HOLD) / (PEEL - HOLD);
      ctx.fillStyle = GREEN;
      for (const f of B.fall) { ctx.globalAlpha = Math.max(0, 0.85 * (1 - k) * (B.t - HOLD > f.d ? 0.8 : 1)); ctx.fillRect(Math.round(f.x), Math.round(f.y), S, S); }
    }
    ctx.globalAlpha = 1;
  },
};
