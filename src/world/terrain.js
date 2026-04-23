// ═══════════════════════════════════════
// TERRAIN — procedural world generation
// ═══════════════════════════════════════
import { rect, px, hash, clamp } from '../render/draw.js';

export const MW = 3000;
export const MH = 1800;

// Palette for terrain
const P = {
  void: '#050510',
  indigo: '#1b1464',
  crimson: '#6b0f1a',
  gold: '#b8860b',
  g1: '#1a1810', g2: '#141208', g3: '#0e0c06', g4: '#1e1a12',
  fg1: '#0e1a08', fg2: '#1a2812', fg3: '#0a1204', fg4: '#1e2a16',
  tg1: '#1a2a0e', tg2: '#0e1a04', tg3: '#2a3a1a', tg4: '#0a1408',
  hg1: '#2a2015', hg2: '#1a1408', hg3: '#3a2a18', hg4: '#14100a',
  qg1: '#1a1824', qg2: '#14101e', qg3: '#241e2a', qg4: '#0e0c18',
  ash: '#8a8d8f',
  dstone: '#3a3a2a',
};

function getZone(x, y) {
  if (y < 500) return 'forest';
  if (y > 1300) return 'toxic';
  if (x < 400) return 'quarter';
  if (x > 1800) return 'highway';
  return 'settlement';
}

function getZoneColors(zone) {
  switch (zone) {
    case 'forest': return [P.fg1, P.fg2, P.fg3, P.fg4];
    case 'toxic': return [P.tg1, P.tg2, P.tg3, P.tg4];
    case 'highway': return [P.hg1, P.hg2, P.hg3, P.hg4];
    case 'quarter': return [P.qg1, P.qg2, P.qg3, P.qg4];
    default: return [P.g1, P.g2, P.g3, P.g4];
  }
}

// Build terrain once onto a large offscreen canvas
export function buildTerrain() {
  const canvas = document.createElement('canvas');
  canvas.width = MW;
  canvas.height = MH;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Sky — top 160px gradient
  for (let y = 0; y < 160; y++) {
    const t = y / 160;
    const r = Math.floor(5 + t * t * 100);
    const g = Math.floor(5 + t * 15 - t * t * 10);
    const b = Math.floor(16 + t * 50 - t * t * 40);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, y, MW, 1);
  }

  // Horizon glow
  for (let y = 110; y < 170; y++) {
    const t = 1 - Math.abs(y - 148) / 30;
    if (t > 0) {
      ctx.fillStyle = `rgba(107,15,26,${t * 0.25})`;
      ctx.fillRect(0, y, MW, 1);
      if (y > 140) {
        ctx.fillStyle = `rgba(184,134,11,${t * 0.12})`;
        ctx.fillRect(0, y, MW, 1);
      }
    }
  }

  // Ground — zoned, dithered
  for (let y = 160; y < MH; y += 4) {
    for (let x = 0; x < MW; x += 4) {
      const zone = getZone(x, y);
      const cols = getZoneColors(zone);
      const n = hash(x, y, 13);
      const cIdx = Math.floor(n * cols.length);
      ctx.fillStyle = cols[cIdx];
      ctx.fillRect(x, y, 4, 4);

      // Dither speckle
      if (hash(x, y, 27) > 0.7) {
        ctx.fillStyle = cols[(cIdx + 1) % cols.length];
        ctx.fillRect(x + 2, y + 2, 1, 1);
      }
    }
  }

  // Zone boundary smoke (soft transitions between zones)
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 80; i++) {
    const x = hash(i, 0, 5) * MW;
    const y = 480 + hash(i, 0, 9) * 40;
    ctx.fillStyle = '#2a2a3a';
    ctx.beginPath();
    ctx.ellipse(x, y, 30 + hash(i, 0, 11) * 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Ash scatter — small white/grey dots across map
  for (let i = 0; i < 2000; i++) {
    const x = hash(i, 1, 3) * MW;
    const y = 160 + hash(i, 1, 7) * (MH - 160);
    const gray = Math.floor(80 + hash(i, 1, 13) * 60);
    ctx.fillStyle = `rgb(${gray},${gray},${gray - 10})`;
    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }

  return canvas;
}
