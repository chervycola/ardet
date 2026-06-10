// ═══════════════════════════════════════
// TERRAIN — procedural world generation
// ═══════════════════════════════════════
import { rect, px, hash, clamp } from '../render/draw.js';
import { SEGMENTS } from '../content/ulitsa_db.js';
import { STREET_SHIFT, STREET_X0, STREET_END_W, STREET_Y_MIN, STREET_Y_MAX, STREET_ROAD_Y } from './street.js';

// World width includes the street strip east of the waste.
export const MW = 6200;
export const MH = 1800;
// The procedural waste only spans the original 3000 px.
const WASTE_W = 3000;

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
    ctx.fillRect(0, y, WASTE_W, 1);
  }

  // Horizon glow
  for (let y = 110; y < 170; y++) {
    const t = 1 - Math.abs(y - 148) / 30;
    if (t > 0) {
      ctx.fillStyle = `rgba(107,15,26,${t * 0.25})`;
      ctx.fillRect(0, y, WASTE_W, 1);
      if (y > 140) {
        ctx.fillStyle = `rgba(184,134,11,${t * 0.12})`;
        ctx.fillRect(0, y, WASTE_W, 1);
      }
    }
  }

  // Ground — zoned, dithered
  for (let y = 160; y < MH; y += 4) {
    for (let x = 0; x < WASTE_W; x += 4) {
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
    const x = hash(i, 0, 5) * WASTE_W;
    const y = 480 + hash(i, 0, 9) * 40;
    ctx.fillStyle = '#2a2a3a';
    ctx.beginPath();
    ctx.ellipse(x, y, 30 + hash(i, 0, 11) * 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Ash scatter — small white/grey dots across map
  for (let i = 0; i < 2000; i++) {
    const x = hash(i, 1, 3) * WASTE_W;
    const y = 160 + hash(i, 1, 7) * (MH - 160);
    const gray = Math.floor(80 + hash(i, 1, 13) * 60);
    ctx.fillStyle = `rgb(${gray},${gray},${gray - 10})`;
    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }

  paintStreet(ctx);

  return canvas;
}

// ═══════════════════════════════════════
// STREET STRIP — the ulitsa painted onto the world surface.
// Epochs as a horizontal gradient: ground hue, road, lamp posts that
// change from oil to neon to screens. Everything east of the waste.
// ═══════════════════════════════════════
function hexToRGB(h) {
  const v = parseInt(h.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
function blendRGB(a, b, t) {
  return `rgb(${(a[0] + (b[0]-a[0])*t)|0},${(a[1] + (b[1]-a[1])*t)|0},${(a[2] + (b[2]-a[2])*t)|0})`;
}

// Palette of the street at a given VIRTUAL x (0..3000): blends across
// an 80px band before each segment boundary.
function streetPaletteAt(vx) {
  let curIdx = 0;
  for (let i = 0; i < SEGMENTS.length; i++) {
    if (vx >= SEGMENTS[i].range[0]) curIdx = i;
  }
  const cur = SEGMENTS[curIdx];
  const next = SEGMENTS[Math.min(SEGMENTS.length - 1, curIdx + 1)];
  let t = 0;
  if (cur !== next) {
    const boundary = cur.range[1];
    const band = 80;
    if (vx > boundary - band) t = Math.min(1, (vx - (boundary - band)) / band);
  }
  return {
    ground: blendRGB(hexToRGB(cur.palette.ground), hexToRGB(next.palette.ground), t),
    dust: blendRGB(hexToRGB(cur.palette.dust), hexToRGB(next.palette.dust), t),
    lamp: t > 0.5 ? next.palette.lamp : cur.palette.lamp,
  };
}

const LAMP_STYLE = {
  none:     null,
  ember:    { col: '#ff7020', glow: [255, 112, 32], r: 11 },
  oil:      { col: '#aa6618', glow: [180, 120, 40], r: 10 },
  lantern:  { col: '#c8881a', glow: [200, 140, 40], r: 12 },
  candle:   { col: '#daa520', glow: [218, 165, 32], r: 9 },
  gas:      { col: '#f4d03f', glow: [244, 208, 63], r: 14 },
  tungsten: { col: '#ffb060', glow: [255, 176, 96], r: 16 },
  neon:     { col: '#ff4aff', glow: [255, 74, 255], r: 18 },
  screen:   { col: '#7adfff', glow: [122, 223, 255], r: 20 },
};

function paintStreet(ctx) {
  const x0 = STREET_X0 - 160;        // include the approach corridor
  const x1 = STREET_END_W + 200;

  // Void around the strip — the street hangs in darkness
  ctx.fillStyle = P.void;
  ctx.fillRect(WASTE_W, 0, MW - WASTE_W, MH);

  // Ground band (walkable corridor plus shoulders)
  const bandTop = STREET_Y_MIN - 60;
  const bandBot = STREET_Y_MAX + 60;
  for (let x = x0; x < x1; x += 4) {
    const vx = clamp(x - STREET_SHIFT, 220, 2999);
    const pal = streetPaletteAt(vx);
    ctx.fillStyle = pal.ground;
    ctx.fillRect(x, bandTop, 4, bandBot - bandTop);
    // Dust speckle
    if (hash(x, 0, 31) > 0.6) {
      ctx.fillStyle = pal.dust;
      const dy = bandTop + 8 + hash(x, 1, 17) * (bandBot - bandTop - 16);
      ctx.fillRect(x + ((hash(x, 2, 7) * 3) | 0), dy | 0, 1, 1);
    }
  }

  // Edge fades into the void (top/bottom of the band)
  for (let i = 0; i < 24; i++) {
    ctx.fillStyle = `rgba(5,5,16,${(1 - i / 24) * 0.85})`;
    ctx.fillRect(x0, bandTop + i, x1 - x0, 1);
    ctx.fillRect(x0, bandBot - i, x1 - x0, 1);
  }

  // The road — packed lighter strip along the centerline
  for (let x = x0; x < x1; x += 4) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#c8b8a0';
    ctx.fillRect(x, STREET_ROAD_Y - 10, 4, 20);
    ctx.globalAlpha = 1;
    // Road wear lines
    if (hash(x, 3, 23) > 0.85) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(x, STREET_ROAD_Y - 10 + ((hash(x, 4, 9) * 20) | 0), 3, 1);
    }
  }

  // Lamp posts every 50 px — type follows the gradient
  for (let wx = STREET_X0; wx < STREET_END_W; wx += 50) {
    const vx = clamp(wx - STREET_SHIFT, 220, 2999);
    const style = LAMP_STYLE[streetPaletteAt(vx).lamp];
    if (!style) continue;
    const ly = STREET_Y_MIN - 26;     // lamps on the north shoulder
    // Pool of light on the ground
    const [gr, gg, gb] = style.glow;
    const grad = ctx.createRadialGradient(wx + 1, ly + 30, 2, wx + 1, ly + 30, style.r + 12);
    grad.addColorStop(0, `rgba(${gr},${gg},${gb},0.30)`);
    grad.addColorStop(1, `rgba(${gr},${gg},${gb},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(wx - style.r - 12, ly + 16, (style.r + 12) * 2, (style.r + 12) * 2);
    // Post
    ctx.fillStyle = '#14100c';
    ctx.fillRect(wx, ly, 2, 30);
    ctx.fillRect(wx - 1, ly - 2, 4, 2);
    // Head
    ctx.fillStyle = style.col;
    ctx.fillRect(wx - 1, ly - 4, 4, 3);
  }

  // Act plaques (acts I–IV) at segment entries — gold floor signs
  ctx.font = '7px "Press Start 2P","VT323",monospace';
  for (const seg of SEGMENTS) {
    if (!seg.actSign) continue;
    const wx = seg.range[0] + STREET_SHIFT;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(wx - 2, STREET_ROAD_Y + 14, 110, 22);
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(wx - 2, STREET_ROAD_Y + 13, 110, 1);
    const lines = seg.actSign.split('\n');
    for (let i = 0; i < lines.length; i++) {
      ctx.fillStyle = i === 0 ? '#daa520' : '#8a7a50';
      ctx.fillText(lines[i], wx + 2, STREET_ROAD_Y + 23 + i * 9);
    }
  }

  // Segment name etched on the shoulder at each entry
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  for (const seg of SEGMENTS) {
    const wx = seg.range[0] + STREET_SHIFT;
    ctx.fillStyle = 'rgba(232,220,200,0.4)';
    ctx.fillText(`§${seg.n} ${seg.name}`, wx + 4, STREET_Y_MIN - 38);
    ctx.fillStyle = 'rgba(138,141,143,0.35)';
    ctx.fillText(seg.era, wx + 4, STREET_Y_MIN - 30);
  }

  // West edge: arrow back to the gates
  ctx.fillStyle = 'rgba(232,220,200,0.5)';
  ctx.font = '7px "Press Start 2P","VT323",monospace';
  ctx.fillText('← врата', STREET_X0 - 130, STREET_ROAD_Y - 16);

  // East edge: the road simply stops; the empty frame stands past it
  ctx.fillStyle = 'rgba(138,141,143,0.4)';
  ctx.fillText('дальше дороги нет. назад — всегда.', STREET_END_W - 6, STREET_ROAD_Y + 40);
}
