// ═══════════════════════════════════════
// ATMOSPHERE — footprints, smoke, blood moon, weather
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { scaler } from './scaler.js';
import { hash } from './draw.js';

// ── FOOTPRINTS ──
const footprints = [];
const MAX_FOOTPRINTS = 80;
let lastFootprint = 0;

export function addFootprint(x, y) {
  if (t - lastFootprint < 12) return; // throttle
  lastFootprint = t;
  if (footprints.length >= MAX_FOOTPRINTS) footprints.shift();
  footprints.push({ x: Math.floor(x + 5), y: Math.floor(y + 20), age: 0 });
}

export function drawFootprints(ctx, camera) {
  for (const fp of footprints) {
    fp.age++;
    const fade = Math.max(0, 1 - fp.age / 600);
    if (fade <= 0) continue;
    ctx.globalAlpha = fade * 0.15;
    ctx.fillStyle = '#1a1810';
    ctx.fillRect(fp.x - camera.x, fp.y - camera.y, 3, 2);
    ctx.fillRect(fp.x - camera.x + 5, fp.y - camera.y + 1, 3, 2);
  }
  ctx.globalAlpha = 1;
  // Cleanup old
  while (footprints.length > 0 && footprints[0].age > 600) footprints.shift();
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

// ── GREEN RAIN (toxic zone) ──
const raindrops = [];
export function updateRain(playerZone) {
  if (playerZone !== 'toxic') {
    raindrops.length = 0;
    return;
  }
  // Spawn
  if (raindrops.length < 60 && t % 2 === 0) {
    raindrops.push({
      x: Math.random() * scaler.vw,
      y: -5,
      speed: 2 + Math.random() * 2,
      len: 3 + Math.random() * 4,
    });
  }
  // Update
  for (let i = raindrops.length - 1; i >= 0; i--) {
    raindrops[i].y += raindrops[i].speed;
    if (raindrops[i].y > scaler.vh + 10) raindrops.splice(i, 1);
  }
}

export function drawRain(ctx) {
  if (raindrops.length === 0) return;
  ctx.strokeStyle = 'rgba(80,200,40,0.25)';
  ctx.lineWidth = 1;
  for (const r of raindrops) {
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x - 0.5, r.y + r.len);
    ctx.stroke();
  }
}
