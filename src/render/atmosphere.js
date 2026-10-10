// ═══════════════════════════════════════
// ATMOSPHERE — footprints, smoke, blood moon, weather
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { scaler } from './scaler.js';
import { hash } from './draw.js';

// ── FOOTPRINTS ──
// След ставится по пройденному пути (шаг ~9 точек), а не по кадрам: быстрый
// ход — те же шаги, только чаще. Вид следа — по поверхности (world/surface.js):
// в песке глубокий и долгий, в грязи тёмный, на снегу синеватый, в гари — чёрный,
// на льду, в болоте и в мусоре следа нет.
const footprints = [];
const MAX_FOOTPRINTS = 120;
const STRIDE = 9;
let lastX = null, lastY = null, side = 0;
const PRINT = {
  soft: { col: '#1a1810', a: 0.15, life: 600, w: 3, h: 2 },
  deep: { col: '#20160a', a: 0.38, life: 1500, w: 3, h: 3 },
  mud:  { col: '#0b1008', a: 0.42, life: 1200, w: 3, h: 2 },
  snow: { col: '#2a3440', a: 0.32, life: 1400, w: 2, h: 2 },
  ash:  { col: '#050302', a: 0.32, life: 900,  w: 3, h: 2 },
};

export function addFootprint(x, y, kind = 'soft') {
  if (lastX !== null && Math.hypot(x - lastX, y - lastY) < STRIDE) return;
  lastX = x; lastY = y;
  const P = PRINT[kind];
  if (!P) return;                         // лёд, болото, мусор — следа нет
  if (footprints.length >= MAX_FOOTPRINTS) footprints.shift();
  side ^= 1;                              // левая — правая
  footprints.push({ x: Math.floor(x + 4 + side * 4), y: Math.floor(y + 20 + side), age: 0, P });
}

export function drawFootprints(ctx, camera) {
  for (const fp of footprints) {
    fp.age++;
    const fade = Math.max(0, 1 - fp.age / fp.P.life);
    if (fade <= 0) continue;
    ctx.globalAlpha = fade * fp.P.a;
    ctx.fillStyle = fp.P.col;
    ctx.fillRect(fp.x - camera.x, fp.y - camera.y, fp.P.w, fp.P.h);
  }
  ctx.globalAlpha = 1;
  // Cleanup old
  while (footprints.length > 0 && footprints[0].age > footprints[0].P.life) footprints.shift();
}

// ── SMOKE CLOUDS ──
const SMOKE_COUNT = 12;
export function drawSmokeClouds(ctx, camera) {
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < SMOKE_COUNT; i++) {
    const x = hash(i, 0, 1) * 3000 + Math.sin(t * 0.001 + i * 2) * 40;
    const y = 400 + hash(i, 0, 2) * 1000 + Math.cos(t * 0.0008 + i) * 30;
    const r = 40 + hash(i, 0, 3) * 60;
    const sx = x - camera.x, sy = y - camera.y;
    if (sx < -r || sx > scaler.vw + r || sy < -r || sy > scaler.vh + r) continue;
    ctx.fillStyle = '#2a2a3a';
    ctx.beginPath();
    ctx.ellipse(sx, sy, r, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ── BLOOD MOON ──
export function drawBloodMoon(ctx, camera) {
  const moonX = 100 - camera.x * 0.05;
  const moonY = 30 - camera.y * 0.02;
  const pulse = 0.85 + 0.15 * Math.sin(t * 0.003);

  // Outer glow
  ctx.globalAlpha = 0.12 * pulse;
  const grd = ctx.createRadialGradient(moonX, moonY, 5, moonX, moonY, 40);
  grd.addColorStop(0, '#8b0000');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(moonX - 40, moonY - 40, 80, 80);

  // Moon disc
  ctx.globalAlpha = 0.7 * pulse;
  ctx.fillStyle = '#6b0f1a';
  ctx.beginPath();
  ctx.arc(moonX, moonY, 8, 0, Math.PI * 2);
  ctx.fill();

  // Inner highlight
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#b8860b';
  ctx.beginPath();
  ctx.arc(moonX - 2, moonY - 2, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
}

// Rain/sand/lightning system moved to ./weather.js
// (richer effects, zone-aware scheduler)
