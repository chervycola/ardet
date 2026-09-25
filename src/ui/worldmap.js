// ═══════════════════════════════════════
// WORLD MAP — pixel canvas summary, M toggles.
// Lifts the editor's four-continent layout into the game and overlays
// our own structure: the waste, the gates, the street's nine epochs,
// plus three small categories — tunnels, museums, precipices.
// Click anywhere / Esc / Space / Enter / M closes.
// ═══════════════════════════════════════
import { state } from '../core/state.js';
import {
  MAP_W, MAP_H, CONTINENTS, NODES, TUNNELS, MUSEUMS, PRECIPICES, GATES,
  STATUS_COLORS, THREAD_COLORS, nodeById, gateById,
} from '../content/worldmap_db.js';
import { SEGMENTS } from '../content/ulitsa_db.js';
import { STREET_SHIFT, STREET_X0, STREET_END_W } from '../world/street.js';
import { getPlayerPos, getPlayer } from '../core/playerRef.js';
import { events } from '../core/events.js';
import { locations } from '../world/locations.js';

// ── Gate discovery state (persistable) ──
const discovered = new Set(['gate_townlet']);
const recently   = new Map();    // gate id → timestamp of discovery (for pulse)
export function isDiscovered(id) { return discovered.has(id); }
export function getDiscovered() { return Array.from(discovered); }
export function loadDiscovered(ids) {
  if (!Array.isArray(ids)) return;
  for (const id of ids) discovered.add(id);
}
export function markDiscovered(id) {
  if (discovered.has(id)) return false;
  discovered.add(id);
  recently.set(id, Date.now());
  events.emit('gate.discovered', id);
  return true;
}

const W = 720, H = 800;             // canvas pixel size (logical)
let visible = false;
let canvas = null;
let ctx = null;
let rafId = 0;

// ── Второй лист карты: план местности (пустошь с локациями) ──
let view = 'world';                       // 'world' | 'local'
let getVisitedFn = () => new Set();       // main передаёт flags.visited
const TAB_BOX = { x: W - 150, y: 4, w: 138, h: 18 };
const LOCAL_BOX = { x: 20, y: 44, w: W - 40, h: H - 150 };
const LOCAL_XMAX = 3200, LOCAL_Y0 = 60, LOCAL_Y1 = 1800;
function lx(wx) { return LOCAL_BOX.x + Math.max(0, Math.min(1, wx / LOCAL_XMAX)) * LOCAL_BOX.w; }
function ly(wy) { return LOCAL_BOX.y + Math.max(0, Math.min(1, (wy - LOCAL_Y0) / (LOCAL_Y1 - LOCAL_Y0))) * LOCAL_BOX.h; }

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

// ── Зум и панорама листа (щипок/драг на тач, колесо/драг на мыши) ──
const ZMIN = 1, ZMAX = 3;
let zscale = 1, zx = 0, zy = 0;      // translate(zx,zy) scale(zscale)
let gestured = false;                // жест был — ближайший click не закрывает
function clampPan() {
  zx = Math.min(0, Math.max(W - W * zscale, zx));
  zy = Math.min(0, Math.max(H - H * zscale, zy));
}
function zoomAt(cx, cy, factor) {
  const ns = Math.min(ZMAX, Math.max(ZMIN, zscale * factor));
  zx = cx - (cx - zx) * (ns / zscale);
  zy = cy - (cy - zy) * (ns / zscale);
  zscale = ns;
  clampPan();
}
function resetZoom() { zscale = 1; zx = 0; zy = 0; }
let pendingClose = 0;                // отложенное закрытие: ждём второй тап
function cancelPendingClose() { if (pendingClose) { clearTimeout(pendingClose); pendingClose = 0; } }

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
  ctx.fillText(view === 'world' ? 'КАРТА МИРА' : 'ПЛАН МЕСТНОСТИ', 16, 18);
  // Переключатель листов (клик / Tab)
  ctx.fillStyle = 'rgba(184,134,11,0.14)';
  ctx.fillRect(TAB_BOX.x, TAB_BOX.y, TAB_BOX.w, TAB_BOX.h);
  ctx.strokeStyle = 'rgba(184,134,11,0.55)';
  ctx.strokeRect(TAB_BOX.x + 0.5, TAB_BOX.y + 0.5, TAB_BOX.w, TAB_BOX.h);
  ctx.font = '7px "Press Start 2P","VT323",monospace';
  ctx.fillStyle = '#daa520';
  ctx.fillText(view === 'world' ? '→ МЕСТНОСТЬ' : '→ МИР', TAB_BOX.x + 10, TAB_BOX.y + 13);
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  ctx.fillStyle = '#8a8d8f';
  ctx.fillText('[M/Esc] закрыть · [Tab] лист · щипок/колесо — зум', 16, 28);

  ctx.save();
  ctx.translate(zx, zy);
  ctx.scale(zscale, zscale);
  if (view === 'local') {
    drawLocal();
    ctx.restore();
    drawLocalLegend();
    rafId = requestAnimationFrame(draw);
    return;
  }
  // Sub-banner: most-recently-discovered gate
  const fresh = [...recently.entries()].sort((a, b) => b[1] - a[1])[0];
  if (fresh && (Date.now() - fresh[1] < 10000)) {
    const g = gateById(fresh[0]);
    if (g) {
      const alpha = Math.min(1, 1 - (Date.now() - fresh[1]) / 10000);
      ctx.fillStyle = `rgba(218,165,32,${alpha})`;
      ctx.font = '7px "Press Start 2P","VT323",monospace';
      ctx.fillText('→ открылись: ' + g.label.toUpperCase(), 16, 40);
    }
  }

  drawContinents();
  drawThreads();
  drawNodes();
  drawOverlays();           // tunnels / museums / precipices
  drawWasteAndStreet();
  drawGates();              // continental fast-travel points
  drawPlayer();
  ctx.restore();
  drawLegend();

  rafId = requestAnimationFrame(draw);
}

// ── План местности: пустошь, локации, туман непосещённого ──
function drawLocal() {
  const visited = getVisitedFn() || new Set();
  // Поле
  ctx.fillStyle = '#1c150b';
  ctx.fillRect(LOCAL_BOX.x, LOCAL_BOX.y, LOCAL_BOX.w, LOCAL_BOX.h);
  ctx.strokeStyle = '#5a4c30';
  ctx.strokeRect(LOCAL_BOX.x + 0.5, LOCAL_BOX.y + 0.5, LOCAL_BOX.w, LOCAL_BOX.h);
  // Зерно бумаги — редкие точки по детерминированной сетке
  ctx.fillStyle = 'rgba(138,141,143,0.1)';
  for (let gy = 0; gy < 24; gy++)
    for (let gx = 0; gx < 30; gx++) {
      const jx = Math.sin(gx * 127.1 + gy * 311.7) * 43758.5453 % 1;
      if (Math.abs(jx) < 0.22)
        ctx.fillRect(LOCAL_BOX.x + 8 + gx * (LOCAL_BOX.w - 16) / 30,
                     LOCAL_BOX.y + 8 + gy * (LOCAL_BOX.h - 16) / 24, 1, 1);
    }
  // Выход на улицу — арка у восточного края
  const gx0 = LOCAL_BOX.x + LOCAL_BOX.w - 8, gy0 = ly(760);
  ctx.fillStyle = '#b8860b';
  ctx.fillRect(gx0 - 3, gy0 - 6, 1, 6);
  ctx.fillRect(gx0 + 2, gy0 - 6, 1, 6);
  ctx.fillRect(gx0 - 3, gy0 - 7, 6, 1);
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  ctx.fillStyle = 'rgba(218,165,32,0.8)';
  ctx.fillText('улица →', gx0 - 48, gy0 + 12);

  // Локации: посещённые — именованные метки, прочие — слабые точки тумана
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  let shown = 0, total = 0;
  for (const loc of locations) {
    if (loc.x >= LOCAL_XMAX) continue;             // уличные знаки — на листе мира
    total++;
    const sx = lx(loc.x + (loc.w || 0) / 2), sy = ly(loc.y + (loc.h || 0) / 2);
    if (visited.has(loc.id)) {
      shown++;
      ctx.fillStyle = '#0c0b09';
      ctx.fillRect(sx - 2, sy - 2, 6, 6);       // тёмная подложка — отрыв от поля
      ctx.fillStyle = '#f0c040';
      ctx.fillRect(sx - 1, sy - 1, 4, 4);
      ctx.fillStyle = 'rgba(240,228,208,0.95)';
      const name = (loc.name || loc.id).slice(0, 20);
      // подпись не должна вылезти за поле
      const tw = ctx.measureText(name).width;
      ctx.fillText(name, Math.min(sx + 6, LOCAL_BOX.x + LOCAL_BOX.w - tw - 4), sy + 3);
    } else {
      ctx.fillStyle = 'rgba(232,220,200,0.38)';
      ctx.fillRect(sx, sy, 3, 3);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(sx + 1, sy + 1, 1, 1);
    }
  }
  // Игрок
  const p = getPlayerPos();
  if (p) {
    const blink = ((Date.now() / 300) | 0) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#ff7020';
      if (p.x < LOCAL_XMAX) {
        ctx.fillRect(lx(p.x) - 1, ly(p.y) - 2, 3, 4);
      } else {
        // На улице: маркер у арки
        ctx.fillRect(gx0 - 1, gy0 - 3, 3, 4);
        ctx.fillStyle = 'rgba(255,112,32,0.8)';
        ctx.fillText('ты — на улице', gx0 - 88, gy0 - 12);
      }
    }
  }
  localShown = shown; localTotal = total;
}

let localShown = 0, localTotal = 0;
function drawLocalLegend() {
  const lyy = H - 56;
  ctx.fillStyle = 'rgba(8,6,4,0.92)';
  ctx.fillRect(1, lyy - 12, W - 2, 54);
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  ctx.fillStyle = '#b8b8a8';
  ctx.fillText(`осмотрено мест: ${localShown} из ${localTotal}`, 16, lyy);
  ctx.fillStyle = '#f0c040';
  ctx.fillRect(16, lyy + 10, 4, 4);
  ctx.fillStyle = '#c8c8b8';
  ctx.fillText('посещено', 26, lyy + 16);
  ctx.fillStyle = 'rgba(232,220,200,0.4)';
  ctx.fillRect(98, lyy + 11, 3, 3);
  ctx.fillStyle = '#c8c8b8';
  ctx.fillText('непосещённое (место есть — имени нет)', 108, lyy + 16);
  ctx.fillStyle = '#ff7020';
  ctx.fillRect(16, lyy + 24, 3, 4);
  ctx.fillStyle = '#c8c8b8';
  ctx.fillText('ты', 26, lyy + 30);
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
    ctx.fillStyle = '#262012';
    ctx.fill();
    ctx.strokeStyle = '#6a5c3c';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Label
    ctx.fillStyle = '#9a8d64';
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
    ctx.beginPath(); ctx.arc(sx, sy, pr + 0.6, 0, Math.PI * 2); ctx.fill();
    // Stroke
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.2;
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

// ── Gates: small arches on each continent ──
// Discovered gates render bright and clickable; hidden ones show as a
// faint dotted "?" near where they're expected to be — enough hint to
// feel that the world is bigger than what you see, not so much that
// they trivialize their own discovery.
function drawGates() {
  const now = Date.now();
  for (const g of GATES) {
    const sx = ax(g.x), sy = ay(g.y);
    const known = discovered.has(g.id);
    if (!known) {
      // Faint dotted ghost — only on continents where the player has
      // shown some commitment (>=1 lore or any conversation). Without
      // any progress, hidden gates are invisible.
      ctx.fillStyle = 'rgba(155,140,90,0.18)';
      ctx.fillText('?', sx - 2, sy + 3);
      continue;
    }
    // New-discovery pulse for ~6 s after reveal
    const t = recently.has(g.id) ? (now - recently.get(g.id)) / 1000 : 99;
    const pulse = t < 6 ? (1 + Math.sin(now * 0.012) * 0.5) : 0;
    // Halo
    if (pulse) {
      ctx.fillStyle = `rgba(218,165,32,${0.18 + pulse * 0.12})`;
      ctx.beginPath(); ctx.arc(sx, sy - 2, 8 + pulse * 2, 0, Math.PI * 2); ctx.fill();
    }
    // Arch: two pillars + lintel
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(sx - 4, sy - 6, 1, 6);     // left pillar
    ctx.fillRect(sx + 3, sy - 6, 1, 6);     // right pillar
    ctx.fillRect(sx - 4, sy - 7, 8, 1);     // lintel
    // Cap
    ctx.fillStyle = '#daa520';
    ctx.fillRect(sx - 5, sy - 8, 10, 1);
    // Opening — dark inside
    ctx.fillStyle = '#0c0a08';
    ctx.fillRect(sx - 2, sy - 5, 5, 5);
    // Tiny ember dot for the active arch
    ctx.fillStyle = '#ff7020';
    ctx.fillRect(sx, sy - 3, 1, 1);
  }
}

// Returns the gate id under (cx,cy) in canvas pixel space, or null.
function gateAt(cx, cy) {
  for (const g of GATES) {
    if (!discovered.has(g.id)) continue;
    const sx = ax(g.x), sy = ay(g.y);
    if (Math.abs(cx - sx) <= 8 && Math.abs(cy - (sy - 3)) <= 9) return g;
  }
  return null;
}

// ── Our waste pocket + street strip ──
function drawWasteAndStreet() {
  // Waste pocket inset (over Europe area for orientation)
  ctx.fillStyle = '#332818';
  ctx.fillRect(WASTE_BOX.x, WASTE_BOX.y, WASTE_BOX.w, WASTE_BOX.h);
  ctx.strokeStyle = '#a03040';
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
    ctx.fillStyle = 'rgba(232,220,200,0.75)';
    ctx.fillRect(x0, STREET_BOX.y, 1, STREET_BOX.h);
    ctx.font = '6px "Press Start 2P","VT323",monospace';
    ctx.fillStyle = 'rgba(240,228,208,0.9)';
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
  ctx.fillStyle = 'rgba(8,6,4,0.92)';
  ctx.fillRect(1, ly - 12, W - 2, 54);
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
  resetZoom();
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

export function init(opts) {
  if (opts && typeof opts.getVisited === 'function') getVisitedFn = opts.getVisited;
  canvas = document.getElementById('map-canvas');
  if (canvas) {
    canvas.width = W;
    canvas.height = H;
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
  }
  const el = document.getElementById('map');
  // клиентские координаты → пиксели канваса
  function canvasXY(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return [
      (clientX - rect.left) * (canvas.width / rect.width),
      (clientY - rect.top) * (canvas.height / rect.height),
    ];
  }
  if (el) el.addEventListener('click', (e) => {
    if (!visible || !canvas) return;
    if (gestured) { gestured = false; return; }  // это был драг/щипок
    const [cx, cy] = canvasXY(e.clientX, e.clientY);
    // Шапка (вкладка) — в неподвижных координатах
    if (cx >= TAB_BOX.x - 4 && cx <= TAB_BOX.x + TAB_BOX.w + 4 &&
        cy >= TAB_BOX.y - 4 && cy <= TAB_BOX.y + TAB_BOX.h + 6) {
      view = view === 'world' ? 'local' : 'world';
      return;
    }
    // Содержимое листа — через зум-трансформацию
    const wx = (cx - zx) / zscale, wy = (cy - zy) / zscale;
    const g = view === 'world' ? gateAt(wx, wy) : null;
    if (g) {
      cancelPendingClose();
      events.emit('gate.use', g);
      close();
    } else {
      // не сразу: вдруг это первый тап двойного (зум)
      cancelPendingClose();
      pendingClose = setTimeout(() => { pendingClose = 0; close(); }, 480);
    }
  });

  // ── Жесты карты: щипок и драг (тач), колесо (мышь), двойной тап ──
  if (canvas) {
    canvas.style.touchAction = 'none';
    const pts = new Map();               // pointerId → [cx, cy]
    let pinchDist = 0, movedTotal = 0, lastTap = 0, lastTapXY = [0, 0];
    canvas.addEventListener('pointerdown', (e) => {
      pts.set(e.pointerId, canvasXY(e.clientX, e.clientY));
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinchDist = Math.hypot(a[0] - b[0], a[1] - b[1]);
      }
      if (pts.size === 1) movedTotal = 0;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return;
      const cur = canvasXY(e.clientX, e.clientY);
      const prev = pts.get(e.pointerId);
      pts.set(e.pointerId, cur);
      if (pts.size === 1) {
        const dx = cur[0] - prev[0], dy = cur[1] - prev[1];
        movedTotal += Math.abs(dx) + Math.abs(dy);
        if (zscale > 1 && movedTotal > 6) {
          zx += dx; zy += dy; clampPan();
          gestured = true;
        }
      } else if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (pinchDist > 0 && d > 0) {
          zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, d / pinchDist);
          gestured = true;
        }
        pinchDist = d;
      }
    });
    const lift = (e) => {
      if (pts.size === 1 && movedTotal < 8) {
        // одиночный тап: двойной за 350 мс — зум туда/обратно
        const now = performance.now();
        const [cx, cy] = canvasXY(e.clientX, e.clientY);
        if (now - lastTap < 450 &&
            Math.abs(cx - lastTapXY[0]) < 40 && Math.abs(cy - lastTapXY[1]) < 40) {
          cancelPendingClose();        // первый тап закрытия не дождётся
          if (zscale > 1.4) resetZoom(); else zoomAt(cx, cy, 2.2 / zscale);
          gestured = true;             // click после даблтапа не закрывает
          lastTap = 0;
        } else {
          lastTap = now; lastTapXY = [cx, cy];
        }
      }
      pts.delete(e.pointerId);
      pinchDist = 0;
    };
    canvas.addEventListener('pointerup', lift);
    canvas.addEventListener('pointercancel', (e) => { pts.delete(e.pointerId); pinchDist = 0; });
    canvas.addEventListener('wheel', (e) => {
      if (!visible) return;
      e.preventDefault();
      const [cx, cy] = canvasXY(e.clientX, e.clientY);
      zoomAt(cx, cy, e.deltaY < 0 ? 1.15 : 0.87);
    }, { passive: false });
  }
  document.addEventListener('keydown', (e) => {
    if (visible) {
      if (e.key === 'Tab') {
        e.preventDefault();
        view = view === 'world' ? 'local' : 'world';
        return;
      }
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
