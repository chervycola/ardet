// ═══════════════════════════════════════
// TERRAIN — procedural world generation
// ═══════════════════════════════════════
import { rect, px, hash, clamp } from '../render/draw.js';
import { SEGMENTS } from '../content/ulitsa_db.js';
import { STREET_SHIFT, STREET_X0, STREET_END_W, STREET_Y_MIN, STREET_Y_MAX, STREET_ROAD_Y, BRANCH_PLAIN } from './street.js';

// World width includes the street strip east of the waste.
import { TOWN, RING_W, RINGS, FIRE_W, WORLD_W, WORLD_H, townDist, ringAt, southBand } from './disc.js';
export const MW = WORLD_W;
export const MH = WORLD_H;
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

  paintRings(ctx);
  paintEdgesElements(ctx);
  paintSurvey(ctx);

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

// Силуэты заднего плана: по 2-3 доминанты на эпоху, чёрным по пустоте.
// База — верх северной обочины; всё строится вверх от неё.
function paintSkyline(ctx, base) {
  const S = '#100c08', S2 = '#181209', HOLE = '#050510';
  const seg = (id) => SEGMENTS.find(g => g.id === id);
  const wx = (id, v) => seg(id).range[0] + v + STREET_SHIFT;
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

  // §1 осевое: зиккурат ступенями + обелиск
  { const x = wx('axial', 40);
    R(x,      base - 22, 70, 22, S);
    R(x + 10, base - 38, 50, 38, S);
    R(x + 20, base - 52, 30, 52, S);
    R(x + 28, base - 64, 14, 64, S);
    const o = wx('axial', 214);
    R(o, base - 80, 8, 80, S2);
    ctx.fillStyle = S2; ctx.beginPath();
    ctx.moveTo(o - 1, base - 80); ctx.lineTo(o + 4, base - 90); ctx.lineTo(o + 9, base - 80); ctx.fill(); }

  // §2 портики: аркада из пяти колонн, архитрав и фронтон
  { const x = wx('porticoes', 60);
    R(x - 8, base - 8, 116, 8, S2);                 // стилобат
    for (let i = 0; i < 5; i++) R(x + i * 22, base - 56, 6, 48, S);
    R(x - 8, base - 62, 116, 6, S2);                // архитрав
    ctx.fillStyle = S2; ctx.beginPath();
    ctx.moveTo(x - 10, base - 62); ctx.lineTo(x + 50, base - 80); ctx.lineTo(x + 110, base - 62); ctx.fill(); }

  // §3 сад света: пагода тремя крышами + минарет
  { const x = wx('lightgarden', 90);
    R(x + 10, base - 26, 22, 26, S);                // этаж 1
    R(x + 2,  base - 32, 38, 6,  S2);               // крыша 1
    R(x + 14, base - 50, 14, 18, S);                // этаж 2
    R(x + 8,  base - 56, 26, 6,  S2);               // крыша 2
    R(x + 18, base - 68, 6,  12, S);                // шпиль-этаж
    R(x + 14, base - 72, 14, 4,  S2);               // крыша 3
    const m = wx('lightgarden', 300);
    R(m, base - 92, 7, 92, S2);                     // минарет
    R(m - 3, base - 64, 13, 5, S2);                 // балкончик
    R(m + 1, base - 98, 5, 6, S2); }

  // §4 два очага: частокол + шатровая колокольня
  { const x = wx('twohearths', 26);
    for (let i = 0; i < 12; i++) R(x + i * 7, base - 26 - ((i * 37) % 9), 4, 26 + ((i * 37) % 9), S);
    const k = wx('twohearths', 128);
    R(k, base - 56, 20, 56, S);
    ctx.fillStyle = S; ctx.beginPath();
    ctx.moveTo(k - 4, base - 56); ctx.lineTo(k + 10, base - 84); ctx.lineTo(k + 24, base - 56); ctx.fill();
    R(k + 9, base - 92, 2, 10, S2); }

  // §5 просвещение: купол обсерватории со щелью + ротонда
  { const x = wx('enlightenment', 80);
    R(x, base - 34, 40, 34, S);
    ctx.fillStyle = S2; ctx.beginPath();
    ctx.arc(x + 20, base - 34, 20, Math.PI, 0); ctx.fill();
    R(x + 18, base - 54, 4, 22, '#241c10');         // щель купола
    const r = wx('enlightenment', 210);
    for (let i = 0; i < 4; i++) R(r + i * 11, base - 34, 4, 34, S2);
    R(r - 4, base - 40, 42, 6, S2);
    ctx.fillStyle = S2; ctx.beginPath();
    ctx.arc(r + 17, base - 40, 15, Math.PI, 0); ctx.fill(); }

  // §6 пар и тени: две трубы со статикой дыма + газгольдер
  { const x = wx('steamshadows', 60);
    R(x, base - 88, 10, 88, S2);
    R(x + 44, base - 72, 12, 72, S2);
    R(x + 1, base - 100, 8, 10, 'rgba(138,141,143,0.16)');
    R(x + 46, base - 84, 9, 9, 'rgba(138,141,143,0.16)');
    const g = wx('steamshadows', 190);
    R(g, base - 44, 54, 44, S);
    R(g - 2, base - 47, 58, 3, S2); }

  // §7 катастрофы: руина с проёмами и рваным верхом + водонапорка
  { const x = wx('catastrophes', 50);
    R(x, base - 74, 92, 74, S);
    for (let i = 0; i < 9; i++) R(x + i * 10, base - 74, 10, 8 + ((i * 53) % 12), HOLE);
    R(x + 12, base - 44, 12, 16, HOLE);
    R(x + 44, base - 38, 14, 14, HOLE);
    R(x + 68, base - 50, 10, 12, HOLE);
    const w = wx('catastrophes', 250);
    R(w + 8,  base - 60, 4, 60, S2);
    R(w + 30, base - 60, 4, 60, S2);
    R(w + 2,  base - 84, 38, 26, S);
    R(w + 16, base - 90, 10, 6, S2); }

  // §8 неон: панельки с решёткой окон + вышка с красным огнём
  { const x = wx('neon', 36);
    for (const [bx, bw, bh] of [[x, 46, 96], [x + 58, 38, 72]]) {
      R(bx, base - bh, bw, bh, S);
      for (let r2 = 0; r2 < ((bh - 14) / 12) | 0; r2++)
        for (let c = 0; c < ((bw - 8) / 10) | 0; c++)
          if (((r2 * 7 + c * 13 + bx) % 5) > 2.2)
            R(bx + 5 + c * 10, base - bh + 8 + r2 * 12, 4, 5, 'rgba(255,74,255,0.13)');
    }
    const v = wx('neon', 214);
    R(v, base - 98, 3, 98, S2);
    R(v + 13, base - 98, 3, 98, S2);
    R(v - 2, base - 98, 20, 2, S2);
    R(v + 4, base - 62, 8, 2, S2);
    R(v + 6, base - 103, 4, 4, '#C23B2B'); }

  // §9 сейчас: стеклянная плоскость + кран над недостроем
  { const x = wx('now', 50);
    const gl = ctx.createLinearGradient(x, base - 108, x + 54, base);
    gl.addColorStop(0, 'rgba(122,223,255,0.10)'); gl.addColorStop(1, 'rgba(10,10,24,0.9)');
    ctx.fillStyle = gl; ctx.fillRect(x, base - 108, 54, 108);
    R(x, base - 108, 54, 2, S2);
    R(x + 26, base - 108, 2, 108, S2);
    const k = wx('now', 176);
    R(k, base - 94, 5, 94, S2);                     // башня крана
    R(k - 34, base - 94, 84, 3, S2);                // стрела
    R(k + 44, base - 91, 2, 24, S2);                // трос
    R(k + 40, base - 68, 10, 8, S);                 // груз висит
    R(k - 60, base - 30, 44, 30, HOLE); }           // недострой-проём
}

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

  // ── Скайлайн эпох: силуэты-доминанты на северной обочине ──
  // Кишка перестаёт быть кишкой, когда у каждого времени есть спина.
  paintSkyline(ctx, bandTop);

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


// ── Равнинная кольцевая кольца §2: полоса предрассветья под портиками ──
function paintPlainRing(ctx) {
  const { x0, x1, yMin, yMax, roadY } = BRANCH_PLAIN;
  // тропа-пунктир от портиков вниз (шов через пустоту)
  ctx.fillStyle = 'rgba(200,184,160,0.28)';
  const px = x0 + 252 + 12; // от кольцевой вехи улицы (vx 812)
  for (let y = STREET_Y_MAX + 8; y < yMin - 4; y += 10) ctx.fillRect(px, y, 2, 5);
  // полоса
  for (let x = x0 - 30; x < x1 + 30; x += 4) {
    ctx.fillStyle = '#20242e';
    ctx.fillRect(x, yMin, 4, yMax - yMin);
    if (hash(x, 5, 41) > 0.62) {
      ctx.fillStyle = '#39404f';
      ctx.fillRect(x + ((hash(x, 6, 11) * 3) | 0), yMin + 10 + hash(x, 7, 13) * (yMax - yMin - 20) | 0, 1, 1);
    }
  }
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = `rgba(5,5,16,${(1 - i / 18) * 0.85})`;
    ctx.fillRect(x0 - 30, yMin + i, x1 - x0 + 60, 1);
    ctx.fillRect(x0 - 30, yMax - i, x1 - x0 + 60, 1);
  }
  // дорога
  ctx.globalAlpha = 0.3; ctx.fillStyle = '#aab2c8';
  ctx.fillRect(x0 - 30, roadY - 9, x1 - x0 + 60, 18);
  ctx.globalAlpha = 1;
  // сухая трава по обочинам — короткие штрихи
  for (let x = x0 - 20; x < x1 + 20; x += 6) {
    if (hash(x, 8, 29) > 0.45) {
      ctx.fillStyle = 'rgba(138,141,143,0.35)';
      const gy = (hash(x, 9, 19) > 0.5 ? yMin + 14 : yMax - 20) + hash(x, 10, 7) * 6;
      ctx.fillRect(x, gy | 0, 1, 5);
    }
  }
  // один фонарь-свеча посередине
  const lx = (x0 + x1) / 2 | 0, ly = yMin + 22;
  const grad = ctx.createRadialGradient(lx + 1, ly + 30, 2, lx + 1, ly + 30, 20);
  grad.addColorStop(0, 'rgba(218,165,32,0.28)'); grad.addColorStop(1, 'rgba(218,165,32,0)');
  ctx.fillStyle = grad; ctx.fillRect(lx - 20, ly + 12, 40, 40);
  ctx.fillStyle = '#14100c'; ctx.fillRect(lx, ly, 2, 30);
  ctx.fillStyle = '#daa520'; ctx.fillRect(lx - 1, ly - 3, 4, 3);
  // шапка полосы
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  ctx.fillStyle = 'rgba(232,220,200,0.4)';
  ctx.fillText('кольцевая §2 · равнина · предрассветье', x0 - 20, yMin - 8);
}

// ── Трассировка каркаса: ряды колышков со шнуром по сторонам городка ──
function paintSurvey(ctx) {
  ctx.fillStyle = 'rgba(194,59,43,0.55)';
  const line = (ax, ay, bx, by) => {
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const x = ax + (bx - ax) * i / steps, y = ay + (by - ay) * i / steps;
      if (i % 2 === 0) ctx.fillRect(x | 0, y | 0, 2, 1);      // шнур пунктиром
      if (i % 4 === 0) { ctx.fillStyle = '#3a2418'; ctx.fillRect(x | 0, (y - 4) | 0, 2, 5); ctx.fillStyle = 'rgba(194,59,43,0.55)'; }
    }
  };
  line(1350, 1745, 1650, 1745);   // юг: равнина
  line(1350, 218, 1650, 218);     // север
  line(96, 760, 96, 1040);        // запад
}


// ── Кольца эпох вокруг городка: время растёт наружу ──
function paintRings(ctx) {
  const step = 4;
  for (let y = 0; y < MH; y += step) {
    for (let x = 0; x < MW; x += step) {
      const d = townDist(x + 2, y + 2);
      if (d <= 0) continue;                        // городок нарисован пустошью
      const n = Math.ceil(d / RING_W);
      if (n >= 1 && n <= RINGS) {
        const seg = SEGMENTS[n - 1];
        ctx.fillStyle = seg.palette.ground;
        ctx.fillRect(x, y, step, step);
        if (hash(x, y % 97, 43) > 0.86) {
          ctx.fillStyle = seg.palette.dust;
          ctx.fillRect(x + 1, y + 1, 1, 1);
        }
        // кромка между кольцами — тонкий тёмный шов
        if (d % RING_W < 3) {
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.fillRect(x, y, step, 1);
        }
      } else if (d <= RINGS * RING_W + FIRE_W) {
        // кольцо огня: гарь с угольями (живой огонь — в динамике)
        ctx.fillStyle = '#160a06';
        ctx.fillRect(x, y, step, step);
        if (hash(x, y % 89, 51) > 0.9) {
          ctx.fillStyle = hash(x, y % 53, 7) > 0.5 ? '#6b0f1a' : '#3a1408';
          ctx.fillRect(x + 1, y + 1, 2, 2);
        }
      }
    }
  }
  // подписи эпох на южной стороне
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  for (const seg of SEGMENTS) {
    const b = southBand(seg.n);
    ctx.fillStyle = 'rgba(232,220,200,0.4)';
    ctx.fillText('§' + seg.n + ' ' + seg.name, 348, b.y0 + 12);
    ctx.fillStyle = 'rgba(138,141,143,0.35)';
    ctx.fillText(seg.era, 348, b.y0 + 20);
    // и на восточной — вертикально не крутим, просто у кромки
    const ex = TOWN.x1 + (seg.n - 1) * RING_W + 6;
    ctx.fillStyle = 'rgba(232,220,200,0.3)';
    ctx.fillText('§' + seg.n, ex, 190);
  }
  // тропа юга (от врат вниз сквозь эпохи) и тропа востока
  ctx.fillStyle = 'rgba(200,184,160,0.3)';
  for (let y = TOWN.y1 + 4; y < TOWN.y1 + RINGS * RING_W; y += 10) ctx.fillRect(1498, y, 3, 5);
  for (let x = TOWN.x1 + 4; x < TOWN.x1 + RINGS * RING_W; x += 10) ctx.fillRect(x, 978, 5, 3);
  // скайлайн юга — доминанты на кромке каждого кольца
  paintSkylineSouth(ctx);
}

// ── Стихии краёв: песок, мусор, лёд, озеро ──
function paintEdgesElements(ctx) {
  const OUTER = RINGS * RING_W + FIRE_W;
  // юг: зыбучий песок
  for (let y = TOWN.y1 + OUTER; y < MH; y += 3) {
    for (let x = 0; x < MW; x += 6) {
      ctx.fillStyle = ((x + y) % 12 < 6) ? '#5a4a30' : '#4e3f28';
      ctx.fillRect(x, y, 6, 3);
      if (hash(x, y % 71, 13) > 0.92) { ctx.fillStyle = '#7a6440'; ctx.fillRect(x + 2, y + 1, 2, 1); }
    }
  }
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  ctx.fillStyle = 'rgba(122,100,64,0.8)';
  ctx.fillText('зыбучий песок · юг не держит', 360, TOWN.y1 + OUTER + 14);
  // восток: куча мусора
  for (let x = TOWN.x1 + OUTER; x < MW; x += 5) {
    for (let y = 160; y < MH; y += 4) {
      ctx.fillStyle = ['#221c12', '#2e2618', '#1a160e'][((x * 7 + y * 13) % 3 + 3) % 3];
      ctx.fillRect(x, y, 5, 4);
      if (hash(x % 91, y % 83, 17) > 0.88) { ctx.fillStyle = '#3f3320'; ctx.fillRect(x + 1, y + 1, 3, 2); }
    }
  }
  ctx.fillStyle = 'rgba(150,130,90,0.7)';
  ctx.fillText('куча мусора · восток завален', TOWN.x1 + OUTER + 8, 220);
  // север: лёд (узкая кромка полотна)
  for (let y = 0; y < 155; y += 3) {
    for (let x = 0; x < TOWN.x1 + OUTER; x += 6) {
      ctx.fillStyle = ((x - y) % 14 < 7) ? '#aec6d4' : '#98b4c4';
      ctx.fillRect(x, y, 6, 3);
      if (hash(x % 79, y + 5, 19) > 0.9) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 2, y + 1, 1, 1); }
    }
  }
  ctx.fillStyle = 'rgba(60,90,110,0.85)';
  ctx.fillText('лёд · север трескается', 360, 130);
  // запад: токсичное озеро (кромка)
  for (let x = 0; x < 88; x += 4) {
    for (let y = 160; y < TOWN.y1 + OUTER; y += 4) {
      ctx.fillStyle = ((x + y) % 10 < 5) ? '#1e3a14' : '#254a18';
      ctx.fillRect(x, y, 4, 4);
      if (hash(x + 3, y % 67, 23) > 0.93) { ctx.fillStyle = '#3aff1a'; ctx.fillRect(x + 1, y + 1, 1, 1); }
    }
  }
}

// ── Скайлайн юга: та же линия доминант, теперь вдоль колец ──
function paintSkylineSouth(ctx) {
  // каждый силуэт стоит у верхней кромки своего кольца, x — по эпохе
  const at = (n, off) => ({ x: 360 + off, base: TOWN.y1 + (n - 1) * RING_W + 46 });
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  const S = '#100c08', S2 = '#181209', HOLE = '#050510';
  { const { x, base } = at(1, 60);                       // зиккурат + обелиск
    R(x, base - 22, 70, 22, S); R(x + 10, base - 38, 50, 38, S);
    R(x + 20, base - 52, 30, 52, S); R(x + 28, base - 64, 14, 64, S);
    R(x + 240, base - 80, 8, 80, S2); }
  { const { x, base } = at(2, 130);                      // аркада
    R(x - 8, base - 8, 116, 8, S2);
    for (let i = 0; i < 5; i++) R(x + i * 22, base - 56, 6, 48, S);
    R(x - 8, base - 62, 116, 6, S2); }
  { const { x, base } = at(3, 220);                      // пагода + минарет
    R(x + 10, base - 26, 22, 26, S); R(x + 2, base - 32, 38, 6, S2);
    R(x + 14, base - 50, 14, 18, S); R(x + 8, base - 56, 26, 6, S2);
    R(x + 200, base - 92, 7, 92, S2); R(x + 197, base - 64, 13, 5, S2); }
  { const { x, base } = at(4, 310);                      // частокол + шатёр
    for (let i = 0; i < 10; i++) R(x + i * 7, base - 26 - ((i * 37) % 9), 4, 26 + ((i * 37) % 9), S);
    R(x + 100, base - 56, 20, 56, S); }
  { const { x, base } = at(5, 420);                      // купол со щелью
    R(x, base - 34, 40, 34, S);
    ctx.fillStyle = S2; ctx.beginPath(); ctx.arc(x + 20, base - 34, 20, Math.PI, 0); ctx.fill();
    R(x + 18, base - 54, 4, 22, '#241c10'); }
  { const { x, base } = at(6, 540);                      // трубы + газгольдер
    R(x, base - 88, 10, 88, S2); R(x + 44, base - 72, 12, 72, S2);
    R(x + 120, base - 44, 54, 44, S); }
  { const { x, base } = at(7, 660);                      // руина + водонапорка
    R(x, base - 74, 92, 74, S);
    for (let i = 0; i < 9; i++) R(x + i * 10, base - 74, 10, 8 + ((i * 53) % 12), HOLE);
    R(x + 152, base - 60, 4, 60, S2); R(x + 174, base - 60, 4, 60, S2);
    R(x + 146, base - 84, 38, 26, S); }
  { const { x, base } = at(8, 800);                      // панельки + вышка
    for (const [bx, bw, bh] of [[x, 46, 96], [x + 58, 38, 72]]) {
      R(bx, base - bh, bw, bh, S);
      for (let r2 = 0; r2 < ((bh - 14) / 12) | 0; r2++)
        for (let c = 0; c < ((bw - 8) / 10) | 0; c++)
          if (((r2 * 7 + c * 13 + bx) % 5) > 2.2)
            R(bx + 5 + c * 10, base - bh + 8 + r2 * 12, 4, 5, 'rgba(255,74,255,0.13)');
    }
    R(x + 160, base - 98, 3, 98, S2); R(x + 173, base - 98, 3, 98, S2);
    R(x + 166, base - 103, 4, 4, '#C23B2B'); }
  { const { x, base } = at(9, 940);                      // стекло + кран
    const gl = ctx.createLinearGradient(x, base - 108, x + 54, base);
    gl.addColorStop(0, 'rgba(122,223,255,0.10)'); gl.addColorStop(1, 'rgba(10,10,24,0.9)');
    ctx.fillStyle = gl; ctx.fillRect(x, base - 108, 54, 108);
    R(x, base - 108, 54, 2, S2); R(x + 26, base - 108, 2, 108, S2);
    R(x + 140, base - 94, 5, 94, S2); R(x + 106, base - 94, 84, 3, S2); }
}
