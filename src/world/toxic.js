// ═══════════════════════════════════════
// ТОКСИК — поле токсичности и просачивание бинарного кода.
// Код сочится из ядовитых мест (озеро, трубопровод, подвал, свалка,
// пропасть) и ползёт по земле, мигая 0/1. Где яда много — сочится уже
// сквозь кадр: струйки цифр стекают сверху и от осыпавшихся краёв.
// Третья краска: ТОКСИЧНЫЙ ЗЕЛЁНЫЙ #8CC63F — только свечение, мало.
// ═══════════════════════════════════════
import { ringAt, RINGS } from './disc.js';
import { scaler } from '../render/scaler.js';

const GREEN = '#8CC63F', HALO = 'rgba(140,198,63,0.13)';
const GLYPH = { 0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'] };
const TOXIC_IDS = new Set(['lake', 'pipeline', 'basement', 'dumpster', 'pit', 'toxic_dump']);

let sources = null;
let tox = 0, toxTest = false;
try { toxTest = /[?&]tox\b/.test(location.search); } catch (e) {}
const streams = [], drips = [];
let frame = 0;

function srcList(locations) {
  if (!sources) sources = locations.filter(l => l.zone === 'toxic' || TOXIC_IDS.has(l.id));
  return sources;
}

function glyph(ctx, x, y, bit, a) {
  const g = GLYPH[bit];
  ctx.globalAlpha = a * 0.9;
  ctx.fillStyle = HALO;
  ctx.fillRect(x - 1, y - 1, 5, 7);
  ctx.globalAlpha = a;
  ctx.fillStyle = GREEN;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (g[r][c] === '1') ctx.fillRect(x + c, y + r, 1, 1);
}

export const toxic = {
  setTest(on) { toxTest = on; },
  isTest() { return toxTest; },
  level() { return tox; },

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
    // сквозь кадр: струйки сверху и от краёв, когда яда много
    const want = tox > 0.45 ? Math.floor((tox - 0.45) * 16) + 1 : 0;
    if (drips.length < want && Math.random() < 0.05) {
      const fromEdge = Math.random() < 0.35;
      drips.push({
        x: fromEdge ? (Math.random() < 0.5 ? 4 + Math.random() * 10 : W - 14 + Math.random() * 10) : 8 + Math.random() * (W - 16),
        y: fromEdge ? Math.random() * H * 0.6 : -6, v: 0.25 + Math.random() * 0.35,
        len: 4 + (Math.random() * 7 | 0), bits: [], stop: H * (0.35 + Math.random() * 0.6), fade: 0,
      });
    }
    const dx = wind ? wind.x * 0.12 : 0;              // ветер клонит струйку вбок
    for (let i = drips.length - 1; i >= 0; i--) {
      const d = drips[i];
      if (d.y < d.stop) { d.y += d.v; d.x += dx; } else d.fade++;
      if (d.fade > 120 || (want === 0 && (d.fade += 2) > 120)) { drips.splice(i, 1); continue; }
      while (d.bits.length < d.len) d.bits.push(Math.random() < 0.5 ? 0 : 1);
      if (Math.random() < 0.08) d.bits[(Math.random() * d.len) | 0] ^= 1;
      d.lean = dx * 7;                                 // хвост струйки отстаёт по ветру
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

  // ── рисунок: струйки сквозь кадр (экранные координаты) ──
  drawScreen(ctx) {
    for (const d of drips) {
      for (let k = 0; k < d.len; k++) {
        const y = Math.round(d.y) - k * 7;
        if (y < -6) break;
        const a = (1 - k / d.len) * (1 - d.fade / 120) * 0.7;
        glyph(ctx, Math.round(d.x - (d.lean || 0) * k / d.len), y, d.bits[k], a);
      }
    }
    ctx.globalAlpha = 1;
  },
};
