// ═══════════════════════════════════════
// КАРТА (M) — два листа, Tab между ними.
// План местности: городок и девять колец эпох вокруг, огонь, край,
// тропы, осмотренные места с именами, ты. Неосмотренные кольца — без имён.
// Карта мира: четыре материка, узлы и нити, врата (клик — переход).
// Клик мимо / Esc / пробел / Enter / M — закрыть.
// ═══════════════════════════════════════
import { state } from '../core/state.js';
import {
  MAP_W, MAP_H, CONTINENTS, NODES, TUNNELS, MUSEUMS, PRECIPICES, GATES,
  STATUS_COLORS, THREAD_COLORS, nodeById, gateById,
} from '../content/worldmap_db.js';
import { SEGMENTS } from '../content/ulitsa_db.js';
import { TOWN, CORE, RINGS, RING_W, FIRE_W, ringAt, trailPoint } from '../world/disc.js';
import { SETTLEMENT } from '../world/physics.js';
import { getPlayerPos } from '../core/playerRef.js';
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

// ── Лист: 960×600 логических точек, подложка ×2 — текст читается ──
const W = 960, H = 600, DPR = 2;
let visible = false;
let canvas = null;
let ctx = null;
let rafId = 0;

// палитра канона
const NIGHT = '#0D0B0A', BONE = '#D9CFB8', ASH = '#8A8D8F', MIST = '#3D4A3A',
  CANDLE = '#E28A3A', CINNABAR = '#C23B2B';
const F_TITLE = '10px "Press Start 2P",monospace';
const F_TEXT = '17px VT323,monospace';
const F_SMALL = '15px VT323,monospace';

let view = 'local';                       // 'local' — план местности, 'world' — карта мира
let getVisitedFn = () => new Set();       // main передаёт flags.visited
let getLockedFn = () => false;            // выход из городка закрыт?
const TABS = [
  { view: 'local', label: 'ПЛАН МЕСТНОСТИ', x: 560, w: 180 },
  { view: 'world', label: 'КАРТА МИРА', x: 750, w: 150 },
];
const TAB_Y = 10, TAB_H = 22, TAB_Y_ = 10;
const MAPB = { x: 16, y: 44, w: 640, h: 520 };     // поле листа
// кнопки листа: приблизить, отдалить, сброс — в правом нижнем углу поля; ✕ — в шапке
const BTNS = [
  { id: 'in', label: '+', x: MAPB.x + MAPB.w - 86, y: MAPB.y + MAPB.h - 30, w: 24, h: 24 },
  { id: 'out', label: '−', x: MAPB.x + MAPB.w - 58, y: MAPB.y + MAPB.h - 30, w: 24, h: 24 },
  { id: 'reset', label: '⟲', x: MAPB.x + MAPB.w - 30, y: MAPB.y + MAPB.h - 30, w: 24, h: 24 },
  { id: 'close', label: '✕', x: 912, y: TAB_Y_, w: 32, h: 22 },
];
const SIDE = { x: 672, y: 44, w: 272, h: 520 };    // колонка справа

// План местности: диск колец вокруг городка, без лишней пустыни
const PAD = RINGS * RING_W + FIRE_W + 300;
const EXT = { x0: TOWN.x0 - PAD, y0: TOWN.y0 - PAD, x1: TOWN.x1 + PAD, y1: TOWN.y1 + PAD };
const LS = Math.min(MAPB.w / (EXT.x1 - EXT.x0), MAPB.h / (EXT.y1 - EXT.y0));
const LOX = MAPB.x + (MAPB.w - (EXT.x1 - EXT.x0) * LS) / 2;
const LOY = MAPB.y + (MAPB.h - (EXT.y1 - EXT.y0) * LS) / 2;
const lx = wx => LOX + (wx - EXT.x0) * LS;
const ly = wy => LOY + (wy - EXT.y0) * LS;

// Карта мира: абстрактное поле 1400×1560 по центру поля листа
const AS = Math.min(MAPB.w / MAP_W, MAPB.h / MAP_H);
const AOX = MAPB.x + (MAPB.w - MAP_W * AS) / 2, AOY = MAPB.y + (MAPB.h - MAP_H * AS) / 2;
const ax = mx => AOX + mx * AS;
const ay = my => AOY + my * AS;

function rgba(c, a) {
  const v = parseInt(c.slice(1), 16);
  return `rgba(${(v>>16)&255},${(v>>8)&255},${v&255},${a})`;
}
function mix(c, k) {                      // притушить цвет к ночи
  const v = parseInt(c.slice(1), 16), n = parseInt(NIGHT.slice(1), 16);
  const ch = s => Math.round(((v >> s) & 255) * k + ((n >> s) & 255) * (1 - k));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

// ── Зум и панорама листа (щипок/драг на тач, колесо/драг на мыши) ──
const ZMIN = 1, ZMAX = 6;
let zscale = 1, zx = 0, zy = 0;      // translate(zx,zy) scale(zscale), в логических точках
let gestured = false;                // жест был — ближайший click не закрывает
function clampPan() {
  zx = Math.min(MAPB.x * (1 - zscale), Math.max(MAPB.x + MAPB.w - (MAPB.x + MAPB.w) * zscale, zx));
  zy = Math.min(MAPB.y * (1 - zscale), Math.max(MAPB.y + MAPB.h - (MAPB.y + MAPB.h) * zscale, zy));
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

function base() { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }

function draw() {
  if (!visible || !ctx) return;
  base();
  ctx.fillStyle = NIGHT;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = rgba(CINNABAR, 0.5);
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

  // шапка: название листа и вкладки
  ctx.font = F_TITLE;
  ctx.fillStyle = BONE;
  ctx.fillText('КАРТА', 18, 27);
  ctx.font = F_SMALL;
  for (const t of TABS) {
    const on = t.view === view;
    ctx.fillStyle = on ? rgba(CANDLE, 0.16) : 'transparent';
    ctx.fillRect(t.x, TAB_Y, t.w, TAB_H);
    ctx.strokeStyle = on ? CANDLE : rgba(ASH, 0.5);
    ctx.strokeRect(t.x + 0.5, TAB_Y + 0.5, t.w, TAB_H);
    ctx.fillStyle = on ? CANDLE : ASH;
    ctx.fillText(t.label, t.x + (t.w - ctx.measureText(t.label).width) / 2, TAB_Y + 16);
  }
  // подвал: клавиши
  ctx.fillStyle = ASH;
  ctx.fillText('тащи — двигать · колесо, щипок, +/− — масштаб · стрелки — сдвиг · Tab — лист · Esc — закрыть', 16, H - 12);

  // поле листа — под зумом, с обрезкой по рамке
  ctx.save();
  ctx.beginPath(); ctx.rect(MAPB.x, MAPB.y, MAPB.w, MAPB.h); ctx.clip();
  ctx.setTransform(DPR * zscale, 0, 0, DPR * zscale, DPR * zx, DPR * zy);
  if (view === 'local') drawLocal(); else drawWorld();
  ctx.restore();
  base();
  ctx.strokeStyle = rgba(ASH, 0.35);
  ctx.strokeRect(MAPB.x + 0.5, MAPB.y + 0.5, MAPB.w, MAPB.h);
  if (view === 'local') drawLocalSide(); else drawWorldSide();
  drawButtons();

  rafId = requestAnimationFrame(draw);
}

function drawButtons() {
  ctx.font = F_TEXT;
  for (const b of BTNS) {
    const dim = (b.id === 'in' && zscale >= ZMAX) || (b.id === 'out' && zscale <= ZMIN) || (b.id === 'reset' && zscale === 1);
    ctx.fillStyle = rgba(NIGHT, 0.85); ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = dim ? rgba(ASH, 0.3) : rgba(BONE, 0.6); ctx.lineWidth = 1;
    ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
    ctx.fillStyle = dim ? rgba(ASH, 0.4) : BONE;
    ctx.fillText(b.label, b.x + (b.w - ctx.measureText(b.label).width) / 2, b.y + b.h / 2 + 5);
  }
  if (zscale > 1) {
    ctx.font = F_SMALL; ctx.fillStyle = ASH;
    const t = '×' + zscale.toFixed(1);
    ctx.fillText(t, BTNS[0].x - ctx.measureText(t).width - 8, BTNS[0].y + 17);
  }
}
function btnAt(cx, cy) { return BTNS.find(b => cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) || null; }
const MID = () => [MAPB.x + MAPB.w / 2, MAPB.y + MAPB.h / 2];
function pressBtn(id) {
  if (id === 'in') zoomAt(...MID(), 1.4);
  else if (id === 'out') zoomAt(...MID(), 1 / 1.4);
  else if (id === 'reset') resetZoom();
  else if (id === 'close') close();
}
function pan(dx, dy) { zx += dx; zy += dy; clampPan(); }

// ── План местности ──
function roundRect(x0, y0, x1, y1, r) {
  ctx.beginPath();
  ctx.moveTo(x0 + r, y0);
  ctx.arcTo(x1, y0, x1, y1, r); ctx.arcTo(x1, y1, x0, y1, r);
  ctx.arcTo(x0, y1, x0, y0, r); ctx.arcTo(x0, y0, x1, y0, r);
  ctx.closePath();
}
function ringRect(d) { roundRect(lx(TOWN.x0 - d), ly(TOWN.y0 - d), lx(TOWN.x1 + d), ly(TOWN.y1 + d), Math.max(0.1, d * LS)); }

let localShown = 0, localTotal = 0, knownRings = new Set(), here = 0;
function drawLocal() {
  const visited = getVisitedFn() || new Set();
  const p = getPlayerPos();
  here = p ? ringAt(p.x, p.y) : 0;
  knownRings = new Set([here]);
  for (const loc of locations) if (visited.has(loc.id)) knownRings.add(ringAt(loc.x + (loc.w || 0) / 2, loc.y + (loc.h || 0)));

  // за краем — пустыня
  ctx.fillStyle = '#16110c';
  ctx.fillRect(MAPB.x, MAPB.y, MAPB.w, MAPB.h);
  // кольцо огня
  ringRect(RINGS * RING_W + FIRE_W);
  ctx.fillStyle = mix(CINNABAR, knownRings.has(RINGS + 1) ? 0.45 : 0.22);
  ctx.fill();
  // эпохи: снаружи внутрь; неизвестные — тёмные, только контур
  for (let n = RINGS; n >= 1; n--) {
    ringRect(n * RING_W);
    ctx.fillStyle = knownRings.has(n) ? mix(SEGMENTS[n - 1].palette.ground, 0.85) : '#1d1813';
    ctx.fill();
    ctx.strokeStyle = n === here ? CANDLE : rgba(ASH, 0.28);
    ctx.lineWidth = n === here ? 1.2 : 0.6;
    ctx.stroke();
  }
  // городок
  ctx.fillStyle = '#2a1e14';
  ctx.fillRect(lx(TOWN.x0), ly(TOWN.y0), (TOWN.x1 - TOWN.x0) * LS, (TOWN.y1 - TOWN.y0) * LS);
  ctx.strokeStyle = rgba(BONE, 0.7); ctx.lineWidth = 1;
  ctx.strokeRect(lx(TOWN.x0), ly(TOWN.y0), (TOWN.x1 - TOWN.x0) * LS, (TOWN.y1 - TOWN.y0) * LS);
  // номера колец — по северо-западной диагонали
  ctx.font = F_SMALL;
  for (let n = 1; n <= RINGS; n++) {
    const d = (n - 0.5) * RING_W, r = n * RING_W * LS, off = (r - d * LS) ;
    const cx = lx(TOWN.x0) - (r - off) * 0.7071 - 0, cy = ly(TOWN.y0) - (r - off) * 0.7071;
    ctx.fillStyle = n === here ? CANDLE : knownRings.has(n) ? BONE : rgba(ASH, 0.6);
    const s = String(n);
    ctx.fillText(s, cx - ctx.measureText(s).width / 2, cy + 5);
  }
  // тропы на четыре стороны
  ctx.fillStyle = rgba(BONE, 0.45);
  for (const side of ['north', 'south', 'east', 'west'])
    for (let d = 0; d < RINGS * RING_W + FIRE_W; d += 45) {
      const t = trailPoint(side, d);
      ctx.fillRect(lx(t.x) - 0.6, ly(t.y) - 0.6, 1.2, 1.2);
    }
  // ядро вне времени и костёр
  ctx.strokeStyle = rgba(CANDLE, 0.35); ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(lx(CORE.x), ly(CORE.y), CORE.r * LS, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = CANDLE;
  ctx.fillRect(lx(CORE.x) - 1.5, ly(CORE.y) - 1.5, 3, 3);
  // замок на выходе
  if (getLockedFn()) {
    ctx.setLineDash([3, 2]);
    ctx.strokeStyle = CINNABAR; ctx.lineWidth = 1;
    ctx.strokeRect(lx(SETTLEMENT.x1), ly(SETTLEMENT.y1), (SETTLEMENT.x2 - SETTLEMENT.x1) * LS, (SETTLEMENT.y2 - SETTLEMENT.y1) * LS);
    ctx.setLineDash([]);
  }

  // места: осмотренные — с именем, прочие — слабая точка
  let shown = 0, total = 0;
  const marks = [];
  for (const loc of locations) {
    total++;
    const sx = lx(loc.x + (loc.w || 0) / 2), sy = ly(loc.y + (loc.h || 0) / 2);
    if (visited.has(loc.id)) shown++;
    if (sx < MAPB.x + 2 || sx > MAPB.x + MAPB.w - 2 || sy < MAPB.y + 2 || sy > MAPB.y + MAPB.h - 2) continue;
    if (visited.has(loc.id)) { marks.push([sx, sy, loc]); }
    else { ctx.fillStyle = rgba(BONE, 0.22); ctx.fillRect(sx - 0.5, sy - 0.5, 1, 1); }
  }
  ctx.font = F_SMALL;
  const boxes = [];
  for (const [sx, sy, loc] of marks) {
    const q = 1 / Math.sqrt(zscale);            // при зуме метки не раздуваются
    ctx.fillStyle = NIGHT; ctx.fillRect(sx - 2.5 * q, sy - 2.5 * q, 5 * q, 5 * q);
    ctx.fillStyle = BONE; ctx.fillRect(sx - 1.5 * q, sy - 1.5 * q, 3 * q, 3 * q);
  }
  // подписи — сколько влезет без наложений; остальные видны при зуме
  const fs = 15 / zscale;
  ctx.font = `${fs}px VT323,monospace`;
  for (const [sx, sy, loc] of marks) {
    const name = (loc.name || loc.id).slice(0, 24);
    const tw = ctx.measureText(name).width;
    const tx = Math.min(sx + 5, MAPB.x + MAPB.w - tw - 3);
    const b = { x: tx - 1, y: sy - fs * 0.6, w: tw + 2, h: fs * 0.9 };
    if (sx + 5 > MAPB.x + MAPB.w - tw - 3 && zscale > 1) continue;
    if (boxes.some(o => b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y)) continue;
    boxes.push(b);
    ctx.fillStyle = rgba(NIGHT, 0.7); ctx.fillRect(b.x - 1, b.y, b.w + 1, b.h);
    ctx.fillStyle = BONE; ctx.fillText(name, tx, sy + fs * 0.25);
  }
  // ты
  if (p && ((Date.now() / 300) | 0) % 2 === 0) {
    const px = lx(p.x), py = ly(p.y);
    ctx.fillStyle = NIGHT; ctx.fillRect(px - 3, py - 3, 7, 7);
    ctx.fillStyle = CANDLE; ctx.fillRect(px - 2, py - 2, 5, 5);
  }
  if (p) {
    ctx.font = `${15 / zscale}px VT323,monospace`;
    const px = lx(p.x), py = ly(p.y), tw = ctx.measureText('ты').width;
    ctx.fillStyle = rgba(NIGHT, 0.75); ctx.fillRect(px - tw - 7, py - 6, tw + 3, 10);
    ctx.fillStyle = CANDLE; ctx.fillText('ты', px - tw - 6, py + 3);
  }
  localShown = shown; localTotal = total;
}

function sideText(lines, y) {
  for (const [txt, col, font] of lines) {
    if (txt === null) { y += 8; continue; }
    ctx.font = font || F_TEXT;
    ctx.fillStyle = col || BONE;
    for (const ln of wrap(txt, SIDE.w - 8)) { ctx.fillText(ln, SIDE.x, y); y += font === F_SMALL ? 16 : 18; }
  }
  return y;
}
function wrap(txt, maxW) {
  const out = []; let cur = '';
  for (const w of txt.split(' ')) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t;
  }
  if (cur) out.push(cur);
  return out;
}

function whereName(n) {
  if (n === 0) return 'городок';
  if (n <= RINGS) return `кольцо ${n} · ${SEGMENTS[n - 1].name}`;
  return n === RINGS + 1 ? 'кольцо огня' : 'за краем';
}

function drawLocalSide() {
  const L = [
    ['ТЫ: ' + whereName(here), CANDLE],
    [`осмотрено мест: ${localShown} из ${localTotal}`, ASH, F_SMALL],
    [null],
    ['КОЛЬЦА ОТ ГОРОДКА', ASH, F_SMALL],
  ];
  for (let n = 1; n <= RINGS; n++) {
    const s = SEGMENTS[n - 1], k = knownRings.has(n);
    L.push([`${n}  ${k ? s.name : '· · ·'}${k && s.era ? ' · ' + s.era : ''}`, n === here ? CANDLE : k ? BONE : ASH, F_SMALL]);
  }
  L.push([`за девятым — огонь, за огнём — край`, ASH, F_SMALL]);
  L.push([null]);
  let y = sideText(L, SIDE.y + 14);
  if (getLockedFn()) {
    y = sideText([[null], ['Выход из городка — по пропуску. Пропуска выдаёт Шут. Шут у костра.', CINNABAR, F_SMALL]], y);
  }
  // легенда
  y = Math.max(y + 6, SIDE.y + SIDE.h - 86);
  ctx.font = F_SMALL;
  const leg = [
    [() => { ctx.fillStyle = BONE; ctx.fillRect(SIDE.x + 2, y - 7, 4, 4); }, 'осмотрено'],
    [() => { ctx.fillStyle = rgba(BONE, 0.4); ctx.fillRect(SIDE.x + 3, y - 6, 2, 2); }, 'место есть, имени нет'],
    [() => { ctx.fillStyle = CANDLE; ctx.fillRect(SIDE.x + 1, y - 8, 6, 6); }, 'ты'],
    [() => { ctx.strokeStyle = rgba(CANDLE, 0.6); ctx.beginPath(); ctx.arc(SIDE.x + 4, y - 5, 4, 0, Math.PI * 2); ctx.stroke(); }, 'круг у костра — вне времени'],
    [() => { ctx.fillStyle = rgba(BONE, 0.6); for (let i = 0; i < 3; i++) ctx.fillRect(SIDE.x + i * 3, y - 5, 1.5, 1.5); }, 'тропы на четыре стороны'],
  ];
  for (const [icon, label] of leg) { icon(); ctx.fillStyle = ASH; ctx.fillText(label, SIDE.x + 14, y); y += 16; }
}

// ── Карта мира ──
function drawWorld() {
  // материки
  for (const c of CONTINENTS) {
    const pts = c.pts.split(' ').map(p => p.split(',').map(Number));
    ctx.beginPath();
    pts.forEach(([px, py], i) => i ? ctx.lineTo(ax(px), ay(py)) : ctx.moveTo(ax(px), ay(py)));
    ctx.closePath();
    ctx.fillStyle = '#211b13'; ctx.fill();
    ctx.strokeStyle = rgba(ASH, 0.6); ctx.lineWidth = 1; ctx.stroke();
  }
  // нити
  const groups = {};
  for (const n of NODES) for (const t of n.thr) (groups[t] = groups[t] || []).push(n);
  ctx.setLineDash([3, 3]); ctx.lineWidth = 0.8;
  for (const [name, ns] of Object.entries(groups)) {
    if (ns.length < 2) continue;
    ctx.strokeStyle = rgba(THREAD_COLORS[name] || ASH, 0.45);
    ctx.beginPath();
    ns.forEach((n, i) => i ? ctx.lineTo(ax(n.x), ay(n.y)) : ctx.moveTo(ax(n.x), ay(n.y)));
    ctx.stroke();
  }
  ctx.setLineDash([]);
  // туннели
  ctx.setLineDash([1, 2]); ctx.strokeStyle = rgba(CANDLE, 0.7);
  for (const tn of TUNNELS) {
    const a = nodeById(tn.a), b = nodeById(tn.b);
    if (!a || !b) continue;
    const x0 = ax(a.x), y0 = ay(a.y), x1 = ax(b.x), y1 = ay(b.y);
    ctx.beginPath(); ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo((x0 + x1) / 2 + (y1 - y0) * 0.18, (y0 + y1) / 2 - (x1 - x0) * 0.05, x1, y1);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  // узлы
  for (const n of NODES) {
    const live = n.st === 'live', r = n.st === 'start' ? 3.5 : live ? 2.6 : 2;
    const pr = live ? r + 0.6 + Math.sin(Date.now() * 0.004) * 0.8 : r;
    ctx.fillStyle = STATUS_COLORS[n.st] || ASH;
    ctx.beginPath(); ctx.arc(ax(n.x), ay(n.y), pr, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = NIGHT; ctx.lineWidth = 1; ctx.stroke();
  }
  // музеи и пропасти
  ctx.strokeStyle = STATUS_COLORS.start; ctx.lineWidth = 0.8;
  for (const m of MUSEUMS) { const n = nodeById(m.at); if (n) ctx.strokeRect(ax(n.x) - 5, ay(n.y) - 5, 10, 10); }
  ctx.fillStyle = CINNABAR;
  for (const pr of PRECIPICES) {
    const n = nodeById(pr.at); if (!n) continue;
    const sx = ax(n.x), sy = ay(n.y) + 7;
    ctx.beginPath(); ctx.moveTo(sx - 4, sy); ctx.lineTo(sx + 4, sy); ctx.lineTo(sx, sy + 4); ctx.closePath(); ctx.fill();
  }
  // названия материков — поверх, крупно
  ctx.font = `${17 / zscale}px VT323,monospace`;
  for (const c of CONTINENTS) {
    const t = c.name.toUpperCase(), tw = ctx.measureText(t).width;
    const tx = Math.min(ax(c.label[0]), MAPB.x + MAPB.w - tw - 4);
    ctx.fillStyle = rgba(NIGHT, 0.6);
    ctx.fillRect(tx - 2, ay(c.label[1]) - 13 / zscale, tw + 4, 16 / zscale);
    ctx.fillStyle = BONE; ctx.fillText(t, tx, ay(c.label[1]));
  }
  drawGates();
  // городок: здесь ты
  const g = nodeById('gorodok');
  if (g && ((Date.now() / 300) | 0) % 2 === 0) {
    ctx.strokeStyle = CANDLE; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(ax(g.x), ay(g.y), 7, 0, Math.PI * 2); ctx.stroke();
  }
  if (g) {
    ctx.font = `${15 / zscale}px VT323,monospace`;
    ctx.fillStyle = CANDLE; ctx.fillText('ты здесь', ax(g.x) + 10, ay(g.y) + 4);
  }
}

// Врата: найденные — яркая арка (клик — переход), прочие — бледный «?»
function drawGates() {
  const now = Date.now();
  ctx.font = `${15 / zscale}px VT323,monospace`;
  for (const g of GATES) {
    const sx = ax(g.x), sy = ay(g.y);
    if (!discovered.has(g.id)) {
      ctx.fillStyle = rgba(ASH, 0.35);
      ctx.fillText('?', sx - 3, sy + 4);
      continue;
    }
    const t = recently.has(g.id) ? (now - recently.get(g.id)) / 1000 : 99;
    if (t < 6) {
      ctx.fillStyle = rgba(CANDLE, 0.18 + (1 + Math.sin(now * 0.012)) * 0.08);
      ctx.beginPath(); ctx.arc(sx, sy - 3, 10, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = CANDLE;
    ctx.fillRect(sx - 4, sy - 7, 1.5, 7); ctx.fillRect(sx + 2.5, sy - 7, 1.5, 7);
    ctx.fillRect(sx - 5, sy - 8.5, 10, 1.5);
    ctx.fillStyle = NIGHT; ctx.fillRect(sx - 2.5, sy - 7, 5, 7);
  }
}

// Врата под точкой (логические координаты поля, до зума) — или null.
function gateAt(cx, cy) {
  for (const g of GATES) {
    if (!discovered.has(g.id)) continue;
    const sx = ax(g.x), sy = ay(g.y);
    if (Math.abs(cx - sx) <= 9 && Math.abs(cy - (sy - 3)) <= 10) return g;
  }
  return null;
}

function drawWorldSide() {
  const L = [];
  const fresh = [...recently.entries()].sort((a, b) => b[1] - a[1])[0];
  if (fresh && Date.now() - fresh[1] < 10000) {
    const g = gateById(fresh[0]);
    if (g) L.push(['открылись: ' + g.label, CANDLE], [null]);
  }
  L.push(['ВРАТА', ASH, F_SMALL]);
  const known = GATES.filter(g => discovered.has(g.id));
  for (const g of known) L.push([g.label, BONE], [g.note, ASH, F_SMALL]);
  const hidden = GATES.length - known.length;
  if (hidden) L.push([`ещё не найдено: ${hidden}`, ASH, F_SMALL]);
  L.push(['клик по арке — переход', ASH, F_SMALL], [null], ['УЗЛЫ', ASH, F_SMALL]);
  let y = sideText(L, SIDE.y + 14);
  ctx.font = F_SMALL;
  const st = [['start', 'старт'], ['hearth', 'очаг'], ['live', 'продолжается'], ['natural', 'нерукотворный'], ['closed', 'закрыто'], ['ghost', 'предполагается']];
  for (let i = 0; i < st.length; i++) {
    const cx = SIDE.x + (i % 2) * 136, cy = y + Math.floor(i / 2) * 16;
    ctx.fillStyle = STATUS_COLORS[st[i][0]];
    ctx.beginPath(); ctx.arc(cx + 4, cy - 4, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ASH; ctx.fillText(st[i][1], cx + 12, cy);
  }
  y += 56;
  ctx.fillStyle = ASH; ctx.fillText('НИТИ', SIDE.x, y); y += 16;
  const th = Object.entries(THREAD_COLORS);
  for (let i = 0; i < th.length; i++) {
    const cx = SIDE.x + (i % 2) * 136, cy = y + Math.floor(i / 2) * 16;
    ctx.strokeStyle = th[i][1]; ctx.setLineDash([3, 2]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy - 4); ctx.lineTo(cx + 10, cy - 4); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = ASH; ctx.fillText(th[i][0], cx + 14, cy);
  }
  y += Math.ceil(th.length / 2) * 16 + 8;
  ctx.strokeStyle = STATUS_COLORS.start; ctx.strokeRect(SIDE.x + 1, y - 9, 8, 8);
  ctx.fillStyle = ASH; ctx.fillText('музей', SIDE.x + 14, y);
  ctx.fillStyle = CINNABAR;
  ctx.beginPath(); ctx.moveTo(SIDE.x + 137, y - 8); ctx.lineTo(SIDE.x + 145, y - 8); ctx.lineTo(SIDE.x + 141, y - 3); ctx.fill();
  ctx.fillStyle = ASH; ctx.fillText('пропасть', SIDE.x + 150, y);
  y += 16;
  ctx.strokeStyle = rgba(CANDLE, 0.8); ctx.setLineDash([1, 2]);
  ctx.beginPath(); ctx.moveTo(SIDE.x, y - 4); ctx.lineTo(SIDE.x + 10, y - 4); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = ASH; ctx.fillText('туннель', SIDE.x + 14, y);
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
  if (opts && typeof opts.getLocked === 'function') getLockedFn = opts.getLocked;
  canvas = document.getElementById('map-canvas');
  if (canvas) {
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx = canvas.getContext('2d');
  }
  const el = document.getElementById('map');
  // клиентские координаты → логические точки листа
  function canvasXY(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return [
      (clientX - rect.left) * (W / rect.width),
      (clientY - rect.top) * (H / rect.height),
    ];
  }
  if (el) el.addEventListener('click', (e) => {
    if (!visible || !canvas) return;
    if (e.target !== canvas) { close(); return; }   // клик мимо листа — закрыть
    if (gestured) { gestured = false; return; }    // это был драг/щипок
    const [cx, cy] = canvasXY(e.clientX, e.clientY);
    const btn = btnAt(cx, cy);
    if (btn) { pressBtn(btn.id); return; }
    // Шапка (вкладки) — в неподвижных координатах
    const tab = TABS.find(t => cx >= t.x - 4 && cx <= t.x + t.w + 4 && cy >= TAB_Y - 6 && cy <= TAB_Y + TAB_H + 6);
    if (tab) { if (view !== tab.view) { view = tab.view; resetZoom(); } return; }
    if (cx < MAPB.x || cx > MAPB.x + MAPB.w || cy < MAPB.y || cy > MAPB.y + MAPB.h) return;
    // поле листа — через зум-трансформацию; клик по полю лист не закрывает
    const wx = (cx - zx) / zscale, wy = (cy - zy) / zscale;
    const g = view === 'world' ? gateAt(wx, wy) : null;
    if (g) { events.emit('gate.use', g); close(); }
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
          pan(dx, dy);
          gestured = true;
          canvas.style.cursor = 'grabbing';
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
      canvas.style.cursor = '';
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
        resetZoom();
        return;
      }
      const k = e.key.toLowerCase();
      if (k === '+' || k === '=') { e.preventDefault(); pressBtn('in'); return; }
      if (k === '-' || k === '_') { e.preventDefault(); pressBtn('out'); return; }
      if (k === '0') { e.preventDefault(); pressBtn('reset'); return; }
      const PAN = { arrowleft: [1, 0], a: [1, 0], 'ф': [1, 0], arrowright: [-1, 0], d: [-1, 0], 'в': [-1, 0],
        arrowup: [0, 1], w: [0, 1], 'ц': [0, 1], arrowdown: [0, -1], s: [0, -1], 'ы': [0, -1] };
      if (PAN[k]) { e.preventDefault(); const st = e.shiftKey ? 120 : 50; pan(PAN[k][0] * st, PAN[k][1] * st); return; }
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
