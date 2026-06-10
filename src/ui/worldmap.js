// ═══════════════════════════════════════
// WORLD MAP — toggled with M. A hand-drawn schematic: the waste with
// its zones on the left, the street strip with its nine epochs running
// east. Player position blinks. Click or any key closes.
// ═══════════════════════════════════════
import { state } from '../core/state.js';
import { SEGMENTS } from '../content/ulitsa_db.js';
import { STREET_SHIFT, STREET_X0, STREET_END_W, STREET_ROAD_Y } from '../world/street.js';
import { MW, MH } from '../world/terrain.js';
import { getPlayerPos } from '../core/playerRef.js';

let visible = false;
let canvas = null;
let ctx = null;
let rafId = 0;

const W = 640, H = 300;

// Layout: waste schematic occupies left block; street strip is a long
// band to the right of it. Both scaled into the canvas.
const WASTE_BOX = { x: 16, y: 30, w: 240, h: 144 };       // maps 0..3000 × 0..1800
const STREET_BOX = { x: 280, y: 86, w: 344, h: 30 };      // maps 3200..6000 (x only)

const ZONES = [
  { name: 'лес', x0: 0, y0: 0, x1: 3000, y1: 500, col: '#16240e' },
  { name: 'квартал', x0: 0, y0: 500, x1: 400, y1: 1300, col: '#1a1824' },
  { name: 'поселение', x0: 400, y0: 500, x1: 1800, y1: 1300, col: '#241e14' },
  { name: 'трасса', x0: 1800, y0: 500, x1: 3000, y1: 1300, col: '#2a2015' },
  { name: 'токс', x0: 0, y0: 1300, x1: 3000, y1: 1800, col: '#16240e' },
];

function wasteToMap(wx, wy) {
  return {
    x: WASTE_BOX.x + (wx / 3000) * WASTE_BOX.w,
    y: WASTE_BOX.y + (wy / 1800) * WASTE_BOX.h,
  };
}
function streetToMap(wx) {
  const t = (wx - STREET_X0) / (STREET_END_W - STREET_X0);
  return STREET_BOX.x + t * STREET_BOX.w;
}

function draw() {
  if (!visible || !ctx) return;
  ctx.clearRect(0, 0, W, H);

  // Frame
  ctx.fillStyle = 'rgba(5,5,16,0.96)';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#6b0f1a';
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
  ctx.fillStyle = '#b8860b';
  ctx.fillRect(1, 1, W - 2, 1);

  ctx.font = '8px "Press Start 2P","VT323",monospace';
  ctx.fillStyle = '#daa520';
  ctx.fillText('КАРТА', 16, 18);
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  ctx.fillStyle = '#8a8d8f';
  ctx.fillText('[M] закрыть', W - 90, 16);

  // ── Waste ──
  for (const z of ZONES) {
    const a = wasteToMap(z.x0, z.y0);
    const b = wasteToMap(z.x1, z.y1);
    ctx.fillStyle = z.col;
    ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
  }
  ctx.strokeStyle = 'rgba(138,141,143,0.4)';
  ctx.strokeRect(WASTE_BOX.x + 0.5, WASTE_BOX.y + 0.5, WASTE_BOX.w, WASTE_BOX.h);
  ctx.fillStyle = 'rgba(232,220,200,0.6)';
  ctx.fillText('пустошь', WASTE_BOX.x, WASTE_BOX.y - 4);
  // Zone labels
  ctx.fillStyle = 'rgba(138,141,143,0.55)';
  ctx.fillText('лес', WASTE_BOX.x + 100, WASTE_BOX.y + 18);
  ctx.fillText('поселение', WASTE_BOX.x + 80, WASTE_BOX.y + 74);
  ctx.fillText('токс', WASTE_BOX.x + 100, WASTE_BOX.y + 136);
  // Gates marker
  const g = wasteToMap(1395, 880);
  ctx.fillStyle = '#daa520';
  ctx.fillRect(g.x - 1, g.y - 3, 3, 6);
  ctx.fillStyle = 'rgba(218,165,32,0.7)';
  ctx.fillText('врата', g.x - 14, g.y + 14);

  // ── Connector: gates → street ──
  ctx.strokeStyle = 'rgba(184,134,11,0.5)';
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(g.x + 3, g.y);
  ctx.lineTo(STREET_BOX.x, STREET_BOX.y + STREET_BOX.h / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Street strip ──
  ctx.fillStyle = 'rgba(232,220,200,0.6)';
  ctx.fillText('улица', STREET_BOX.x, STREET_BOX.y - 8);
  for (const seg of SEGMENTS) {
    const x0 = streetToMap(seg.range[0] + STREET_SHIFT);
    const x1 = streetToMap(seg.range[1] + STREET_SHIFT);
    ctx.fillStyle = seg.palette.ground;
    ctx.fillRect(x0, STREET_BOX.y, x1 - x0, STREET_BOX.h);
    // Segment tick + number
    ctx.fillStyle = 'rgba(232,220,200,0.5)';
    ctx.fillRect(x0, STREET_BOX.y, 1, STREET_BOX.h);
    ctx.fillText(`${seg.n}`, x0 + 2, STREET_BOX.y - 2);
  }
  ctx.strokeStyle = 'rgba(138,141,143,0.4)';
  ctx.strokeRect(STREET_BOX.x + 0.5, STREET_BOX.y + 0.5, STREET_BOX.w, STREET_BOX.h);
  // End label
  ctx.fillStyle = 'rgba(138,141,143,0.5)';
  ctx.fillText('сейчас →', STREET_BOX.x + STREET_BOX.w - 56, STREET_BOX.y + STREET_BOX.h + 12);
  ctx.fillText('осевое', STREET_BOX.x, STREET_BOX.y + STREET_BOX.h + 12);

  // Segment names below (small legend, two rows)
  ctx.fillStyle = 'rgba(138,141,143,0.45)';
  let lx = STREET_BOX.x, lyy = STREET_BOX.y + STREET_BOX.h + 30;
  for (const seg of SEGMENTS) {
    ctx.fillText(`§${seg.n} ${seg.name}`, lx, lyy);
    lyy += 10;
    if (seg.n === 5) { lx += 176; lyy = STREET_BOX.y + STREET_BOX.h + 30; }
  }

  // ── Player marker (blinking) ──
  const p = getPlayerPos();
  if (p) {
    const blink = (Date.now() / 300 | 0) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#ff7020';
      if (p.x > STREET_X0 - 100) {
        const mx = streetToMap(Math.max(STREET_X0, Math.min(STREET_END_W, p.x)));
        ctx.fillRect(mx - 1, STREET_BOX.y + STREET_BOX.h / 2 - 2, 3, 4);
      } else {
        const m = wasteToMap(Math.min(3000, p.x), p.y);
        ctx.fillRect(m.x - 1, m.y - 2, 3, 4);
      }
    }
  }

  rafId = requestAnimationFrame(draw);
}

export function toggle() {
  visible = !visible;
  const el = document.getElementById('map');
  if (!el) return;
  if (visible) {
    el.classList.add('on');
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(draw);
  } else {
    el.classList.remove('on');
    cancelAnimationFrame(rafId);
  }
}

export function isOpen() { return visible; }

export function init() {
  canvas = document.getElementById('map-canvas');
  if (canvas) {
    canvas.width = W;
    canvas.height = H;
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
  }
  const el = document.getElementById('map');
  if (el) el.addEventListener('click', () => { if (visible) toggle(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь') {
      if (state.is('game') || visible) toggle();
    } else if (visible && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) {
      toggle();
    }
  });
}
