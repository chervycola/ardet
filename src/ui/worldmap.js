// ═══════════════════════════════════════
// WORLD MAP — pixel canvas summary, M toggles.
// Lifts the editor's four-continent layout into the game and overlays
// our own structure: the waste, the gates, the street's nine epochs,
// plus three small categories — tunnels, museums, precipices.
// Click anywhere / Esc / Space / Enter / M closes.
// ═══════════════════════════════════════
import { state } from '../core/state.js';
import {
  MAP_W, MAP_H, CONTINENTS, NODES, TUNNELS, MUSEUMS, PRECIPICES,
  STATUS_COLORS, THREAD_COLORS, nodeById,
} from '../content/worldmap_db.js';
import { SEGMENTS } from '../content/ulitsa_db.js';
import { STREET_SHIFT, STREET_X0, STREET_END_W } from '../world/street.js';
import { getPlayerPos } from '../core/playerRef.js';

const W = 720, H = 800;             // canvas pixel size (logical)
let visible = false;
let canvas = null;
let ctx = null;
let rafId = 0;

// Map abstract layout (1400×1560) into a top block of the canvas.
const MAP_BOX = { x: 12, y: 30, w: W - 24, h: 540 };
const STREET_BOX = { x: 30, y: MAP_BOX.y + MAP_BOX.h + 36, w: W - 60, h: 32 };
// Waste pocket — shown as a small inset on top of Europe so the player
// knows where they actually are in the world.
const WASTE_BOX = { x: 384, y: 380, w: 80, h: 56 };

function ax(mx) { return MAP_BOX.x + (mx / MAP_W) * MAP_BOX.w; }
function ay(my) { return MAP_BOX.y + (my / MAP_H) * MAP_BOX.h; }

function rgba(c, a) {
  const v = parseInt(c.slice(1), 16);
  return `rgba(${(v>>16)&255},${(v>>8)&255},${v&255},${a})`;
}

function draw() {
  if (!visible || !ctx) return;

  // Frame
  ctx.fillStyle = 'rgba(8,6,4,0.97)';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(107,15,26,0.55)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
  ctx.fillStyle = '#b8860b';
  ctx.fillRect(1, 1, W - 2, 1);

  ctx.font = '8px "Press Start 2P","VT323",monospace';
  ctx.fillStyle = '#daa520';
  ctx.fillText('КАРТА МИРА', 16, 18);
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  ctx.fillStyle = '#8a8d8f';
  ctx.fillText('[M / Esc / клик] закрыть', W - 170, 16);

  drawContinents();
  drawThreads();
  drawNodes();
  drawOverlays();           // tunnels / museums / precipices
  drawWasteAndStreet();
  drawPlayer();
  drawLegend();

  rafId = requestAnimationFrame(draw);
}

// ── Continents (polygons) ──
function drawContinents() {
  for (const c of CONTINENTS) {
    const pts = c.pts.split(' ').map(p => p.split(',').map(Number));
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const [px, py] = pts[i];
      const sx = ax(px), sy = ay(py);
      if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fillStyle = '#161410';
    ctx.fill();
    ctx.strokeStyle = '#332e22';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Label
    ctx.fillStyle = '#4d4738';
    ctx.font = '8px "Press Start 2P","VT323",monospace';
    ctx.fillText(c.name.toUpperCase(), ax(c.label[0]), ay(c.label[1]));
  }
}

// ── Threads (dashed polylines through grouped nodes) ──
function drawThreads() {
  const groups = {};
  for (const n of NODES) {
    for (const t of n.thr) {
      (groups[t] = groups[t] || []).push(n);
    }
  }
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1;
  for (const [name, ns] of Object.entries(groups)) {
    if (ns.length < 2) continue;
    ctx.strokeStyle = rgba(THREAD_COLORS[name] || '#777777', 0.55);
    ctx.beginPath();
    for (let i = 0; i < ns.length; i++) {
      const sx = ax(ns[i].x), sy = ay(ns[i].y);
      if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

// ── Nodes ──
function drawNodes() {
  for (const n of NODES) {
    const sx = ax(n.x), sy = ay(n.y);
    const isStart = n.st === 'start';
    const isLive = n.st === 'live';
    const r = isStart ? 4 : isLive ? 3 : 2.4;
    // Live pulse: gentle radius bob
    const pr = isLive ? r + 1 + Math.sin(Date.now() * 0.004) * 1.2 : r;
    // Halo for live
    if (isLive) {
      ctx.fillStyle = rgba(STATUS_COLORS[n.st], 0.18);
      ctx.beginPath(); ctx.arc(sx, sy, pr + 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = STATUS_COLORS[n.st] || '#888';
    ctx.beginPath(); ctx.arc(sx, sy, pr, 0, Math.PI * 2); ctx.fill();
    // Stroke
    ctx.strokeStyle = '#0c0b09';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// ── Tunnels / museums / precipices ──
function drawOverlays() {
  // Tunnels — curved dotted lines between two nodes, gold
  ctx.setLineDash([1, 2]);
  ctx.lineWidth = 1;
  for (const tn of TUNNELS) {
    const a = nodeById(tn.a), b = nodeById(tn.b);
    if (!a || !b) continue;
    const ax_ = ax(a.x), ay_ = ay(a.y), bx_ = ax(b.x), by_ = ay(b.y);
    const mx = (ax_ + bx_) / 2 + (by_ - ay_) * 0.18;
    const my = (ay_ + by_) / 2 - (bx_ - ax_) * 0.05;
    ctx.strokeStyle = 'rgba(184,134,11,0.75)';
    ctx.beginPath();
    ctx.moveTo(ax_, ay_);
    ctx.quadraticCurveTo(mx, my, bx_, by_);
    ctx.stroke();
    // Tunnel mouths — small "⌒"
    ctx.fillStyle = '#daa520';
    ctx.fillRect(ax_ - 2, ay_ - 1, 4, 1);
    ctx.fillRect(bx_ - 2, by_ - 1, 4, 1);
  }
  ctx.setLineDash([]);

  // Museums — small hollow squares at the node, behind everything else
  ctx.strokeStyle = '#9b8cf0';
  ctx.lineWidth = 1;
  for (const m of MUSEUMS) {
    const n = nodeById(m.at);
    if (!n) continue;
    const sx = ax(n.x), sy = ay(n.y);
    ctx.strokeRect(sx - 5, sy - 5, 10, 10);
    // Roof line
    ctx.beginPath();
    ctx.moveTo(sx - 6, sy - 5);
    ctx.lineTo(sx,     sy - 8);
    ctx.lineTo(sx + 6, sy - 5);
    ctx.stroke();
  }

  // Precipices — small crimson chevron pointing down from the node
  ctx.fillStyle = '#8b2d2d';
  for (const p of PRECIPICES) {
    const n = nodeById(p.at);
    if (!n) continue;
    const sx = ax(n.x), sy = ay(n.y) + 9;
    ctx.beginPath();
    ctx.moveTo(sx - 4, sy);
    ctx.lineTo(sx + 4, sy);
    ctx.lineTo(sx,     sy + 4);
    ctx.closePath();
    ctx.fill();
    // Dotted falling line
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(sx, sy + 6 + i * 3, 1, 1);
    }
  }
}

// ── Our waste pocket + street strip ──
function drawWasteAndStreet() {
  // Waste pocket inset (over Europe area for orientation)
  ctx.fillStyle = '#241c14';
  ctx.fillRect(WASTE_BOX.x, WASTE_BOX.y, WASTE_BOX.w, WASTE_BOX.h);
  ctx.strokeStyle = '#6b0f1a';
  ctx.strokeRect(WASTE_BOX.x + 0.5, WASTE_BOX.y + 0.5, WASTE_BOX.w, WASTE_BOX.h);
  ctx.fillStyle = '#b8860b';
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  ctx.fillText('пустошь', WASTE_BOX.x + 4, WASTE_BOX.y - 2);
  // Gates marker inside
  ctx.fillStyle = '#daa520';
  ctx.fillRect(WASTE_BOX.x + WASTE_BOX.w - 8, WASTE_BOX.y + WASTE_BOX.h / 2 - 1, 2, 4);
  ctx.fillStyle = 'rgba(218,165,32,0.7)';
  ctx.fillText('врата', WASTE_BOX.x + WASTE_BOX.w - 26, WASTE_BOX.y + WASTE_BOX.h + 8);

  // Dotted connector from the gates to the street strip
  ctx.strokeStyle = 'rgba(184,134,11,0.6)';
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(WASTE_BOX.x + WASTE_BOX.w, WASTE_BOX.y + WASTE_BOX.h / 2);
  ctx.lineTo(STREET_BOX.x, STREET_BOX.y + STREET_BOX.h / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Street strip (epoch bands)
  ctx.fillStyle = '#daa520';
  ctx.font = '7px "Press Start 2P","VT323",monospace';
  ctx.fillText('УЛИЦА — 9 эпох → сейчас', STREET_BOX.x, STREET_BOX.y - 6);
  for (const seg of SEGMENTS) {
    const t0 = (seg.range[0] + STREET_SHIFT - STREET_X0) / (STREET_END_W - STREET_X0);
    const t1 = (seg.range[1] + STREET_SHIFT - STREET_X0) / (STREET_END_W - STREET_X0);
    const x0 = STREET_BOX.x + t0 * STREET_BOX.w;
    const x1 = STREET_BOX.x + t1 * STREET_BOX.w;
    ctx.fillStyle = seg.palette.ground;
    ctx.fillRect(x0, STREET_BOX.y, x1 - x0, STREET_BOX.h);
    // Tick
    ctx.fillStyle = 'rgba(232,220,200,0.5)';
    ctx.fillRect(x0, STREET_BOX.y, 1, STREET_BOX.h);
    ctx.font = '6px "Press Start 2P","VT323",monospace';
    ctx.fillStyle = 'rgba(232,220,200,0.65)';
    ctx.fillText(`${seg.n}`, x0 + 2, STREET_BOX.y - 2);
  }
  ctx.strokeStyle = 'rgba(138,141,143,0.4)';
  ctx.strokeRect(STREET_BOX.x + 0.5, STREET_BOX.y + 0.5, STREET_BOX.w, STREET_BOX.h);
  // End labels
  ctx.fillStyle = 'rgba(138,141,143,0.55)';
  ctx.fillText('осевое', STREET_BOX.x, STREET_BOX.y + STREET_BOX.h + 10);
  ctx.fillText('сейчас →', STREET_BOX.x + STREET_BOX.w - 56, STREET_BOX.y + STREET_BOX.h + 10);
}

// ── Player marker ──
function drawPlayer() {
  const p = getPlayerPos();
  if (!p) return;
  const blink = ((Date.now() / 300) | 0) % 2 === 0;
  if (!blink) return;
  ctx.fillStyle = '#ff7020';
  if (p.x > STREET_X0 - 100) {
    // On the street
    const t = Math.max(0, Math.min(1, (p.x - STREET_X0) / (STREET_END_W - STREET_X0)));
    const mx = STREET_BOX.x + t * STREET_BOX.w;
    ctx.fillRect(mx - 1, STREET_BOX.y + STREET_BOX.h / 2 - 2, 3, 4);
  } else {
    // Inside the waste pocket
    const t = Math.min(1, p.x / 3000);
    const ty = Math.max(0, Math.min(1, (p.y - 160) / (1800 - 160)));
    const mx = WASTE_BOX.x + t * WASTE_BOX.w;
    const my = WASTE_BOX.y + ty * WASTE_BOX.h;
    ctx.fillRect(mx - 1, my - 1, 3, 3);
  }
}

// ── Legend ──
function drawLegend() {
  const ly = H - 56;
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  ctx.fillStyle = '#8a8d8f';
  ctx.fillText('узлы:', 16, ly);
  const items = [
    ['start',   'старт'],
    ['hearth',  'очаг'],
    ['live',    'продолжается'],
    ['natural', 'нерукотв.'],
    ['closed',  'закрыто'],
    ['ghost',   '(?)'],
  ];
  let lx = 56;
  for (const [k, label] of items) {
    ctx.fillStyle = STATUS_COLORS[k];
    ctx.beginPath(); ctx.arc(lx, ly - 2, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a8a89a';
    ctx.fillText(label, lx + 5, ly);
    lx += ctx.measureText(label).width + 22;
  }
  // Overlay legend
  ctx.fillStyle = '#8a8d8f';
  ctx.fillText('оверлеи:', 16, ly + 16);
  ctx.strokeStyle = '#9b8cf0';
  ctx.strokeRect(60, ly + 11, 6, 6);
  ctx.fillStyle = '#a8a89a';
  ctx.fillText('музей', 70, ly + 17);
  ctx.fillStyle = '#8b2d2d';
  ctx.beginPath();
  ctx.moveTo(124, ly + 12); ctx.lineTo(132, ly + 12); ctx.lineTo(128, ly + 17);
  ctx.fill();
  ctx.fillStyle = '#a8a89a';
  ctx.fillText('пропасть', 138, ly + 17);
  ctx.strokeStyle = '#daa520';
  ctx.setLineDash([1, 2]);
  ctx.beginPath(); ctx.moveTo(210, ly + 14); ctx.lineTo(232, ly + 14); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#a8a89a';
  ctx.fillText('туннель', 236, ly + 17);
  // Threads hint
  ctx.fillStyle = '#8a8d8f';
  ctx.fillText('нити:', 16, ly + 32);
  let tx = 60;
  for (const [name, col] of Object.entries(THREAD_COLORS)) {
    ctx.strokeStyle = col;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(tx, ly + 28);
    ctx.lineTo(tx + 12, ly + 28);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#a8a89a';
    ctx.fillText(name, tx + 16, ly + 31);
    tx += 16 + ctx.measureText(name).width + 18;
  }
}

// ── Public API ──
export function open() {
  if (visible) return;
  if (!state.is('game')) return;
  visible = true;
  const el = document.getElementById('map');
  if (!el) return;
  el.classList.add('on');
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(draw);
}

export function close() {
  visible = false;
  const el = document.getElementById('map');
  if (el) el.classList.remove('on');
  cancelAnimationFrame(rafId);
}

export function toggle() {
  if (visible) close(); else open();
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
  if (el) el.addEventListener('click', () => { if (visible) close(); });
  document.addEventListener('keydown', (e) => {
    if (visible) {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter' ||
          e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь') {
        e.preventDefault();
        close();
      }
      return;
    }
    if (e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь') {
      if (state.is('game')) open();
    }
  });
}
