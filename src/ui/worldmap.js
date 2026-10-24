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
import { TOWN, CORE, RINGS, RINGS_D, RING_EDGE, FIRE_W, ringD, ringAt, ringOfD, warpedDist, trailPoint } from '../world/disc.js';
import { sideAt } from '../world/relief.js';
import { CELL_TITLES } from '../content/cell_titles.js';
import { SIDE_RU } from '../world/placeStamp.js';
import { drawSignature } from './signature.js';
import { redNoon } from '../world/redNoon.js';
import { reducedMotion } from '../core/prefs.js';
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
// план местности — бумага (канон: «система — бумага»)
const PAPER = '#E8DCC3', SEPIA = '#3A3026';
const F_PAPER = "16px Literata, 'PT Serif', Georgia, serif";
const F_PAPER_S = "14px Literata, 'PT Serif', Georgia, serif";
const F_GRIF = "500 9px Montserrat, 'PT Sans', sans-serif";

let view = 'local';                       // 'local' — план местности, 'world' — карта мира
let getVisitedFn = () => new Set();       // main передаёт flags.visited
let getLockedFn = () => false;            // выход из городка закрыт?
let getWalkedFn = () => new Set();        // клетки «кольцо:сторона», пройденные ногами (main)
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
const PAD = RINGS_D + FIRE_W + 300;
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
  const paper = view === 'local';               // план местности — бумага; карта мира — ночь
  ctx.fillStyle = paper ? PAPER : NIGHT;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = paper ? rgba(SEPIA, 0.5) : rgba(CINNABAR, 0.5);
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

  // шапка: название листа и вкладки
  if (paper) {
    ctx.font = F_GRIF; ctx.fillStyle = SEPIA;
    ctx.fillText('ПЛАН МЕСТНОСТИ · КАДАСТРОВЫЙ · ЛИСТ 1', 18, 25);
    ctx.save();                                 // штамп: криво, сепией
    ctx.translate(330, 21); ctx.rotate(-0.07);
    ctx.strokeStyle = rgba(SEPIA, 0.7); ctx.lineWidth = 1; ctx.strokeRect(-4, -12, 150, 17);
    ctx.fillStyle = rgba(SEPIA, 0.8); ctx.fillText('ОБМЕР — НОГАМИ', 6, 0);
    ctx.restore();
  } else {
    ctx.font = F_TITLE;
    ctx.fillStyle = BONE;
    ctx.fillText('КАРТА', 18, 27);
  }
  ctx.font = paper ? F_GRIF : F_SMALL;
  for (const t of TABS) {
    const on = t.view === view;
    ctx.fillStyle = on ? (paper ? rgba(SEPIA, 0.1) : rgba(CANDLE, 0.16)) : 'transparent';
    ctx.fillRect(t.x, TAB_Y, t.w, TAB_H);
    ctx.strokeStyle = paper ? rgba(SEPIA, on ? 0.9 : 0.4) : on ? CANDLE : rgba(ASH, 0.5);
    ctx.strokeRect(t.x + 0.5, TAB_Y + 0.5, t.w, TAB_H);
    ctx.fillStyle = paper ? rgba(SEPIA, on ? 1 : 0.6) : on ? CANDLE : ASH;
    ctx.fillText(t.label, t.x + (t.w - ctx.measureText(t.label).width) / 2, TAB_Y + (paper ? 15 : 16));
  }
  // подвал: клавиши
  ctx.font = paper ? F_PAPER_S : F_SMALL;
  ctx.fillStyle = paper ? rgba(SEPIA, 0.7) : ASH;
  ctx.fillText('тащи — двигать · колесо, щипок, +/− — масштаб · стрелки — сдвиг · Tab — лист · Esc — закрыть', 16, H - 12);

  // поле листа — под зумом, с обрезкой по рамке
  ctx.save();
  ctx.beginPath(); ctx.rect(MAPB.x, MAPB.y, MAPB.w, MAPB.h); ctx.clip();
  ctx.setTransform(DPR * zscale, 0, 0, DPR * zscale, DPR * zx, DPR * zy);
  if (view === 'local') drawLocal(); else drawWorld();
  ctx.restore();
  base();
  ctx.strokeStyle = paper ? rgba(SEPIA, 0.6) : rgba(ASH, 0.35);
  ctx.strokeRect(MAPB.x + 0.5, MAPB.y + 0.5, MAPB.w, MAPB.h);
  if (view === 'local') drawLocalSide(); else drawWorldSide();
  drawButtons();

  rafId = requestAnimationFrame(draw);
}

function drawButtons() {
  ctx.font = F_TEXT;
  const paper = view === 'local';
  for (const b of BTNS) {
    const dim = (b.id === 'in' && zscale >= ZMAX) || (b.id === 'out' && zscale <= ZMIN) || (b.id === 'reset' && zscale === 1);
    ctx.fillStyle = paper ? rgba(PAPER, 0.92) : rgba(NIGHT, 0.85); ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = paper ? rgba(SEPIA, dim ? 0.3 : 0.75) : dim ? rgba(ASH, 0.3) : rgba(BONE, 0.6); ctx.lineWidth = 1;
    ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
    ctx.fillStyle = paper ? rgba(SEPIA, dim ? 0.35 : 1) : dim ? rgba(ASH, 0.4) : BONE;
    ctx.fillText(b.label, b.x + (b.w - ctx.measureText(b.label).width) / 2, b.y + b.h / 2 + 5);
  }
  if (zscale > 1) {
    ctx.font = F_SMALL; ctx.fillStyle = paper ? SEPIA : ASH;
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

// ── План местности — кадастровый (ориентирование печатью, 3А): лист бумаги, клетки
// диска «кольцо × сторона» в графах; пройденные ногами заштрихованы карандашом и
// подписаны от руки названием из описи; непройденные — пустые графы. Огонь — киноварью.
const SIDES5 = ['north', 'south', 'west', 'east', 'plain'];
const SIDE_ABBR = { north: 'С', south: 'Ю', west: 'З', east: 'В', plain: 'Р' };
const cellId = (ring, side) => ring === 0 ? 1 : ring <= RINGS ? 2 + (ring - 1) * 5 + SIDES5.indexOf(side) : ring === RINGS + 1 ? 50 : 0;
const cellKey = (ring, side) => SEGMENTS[ring - 1].id + ':' + side;
let mask = null;                 // { ids, cx, cy } — геометрия клеток в точках листа, считается раз
let baseCv = null, fillCv = null, fillKey = '';
function plainCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
// геометрия клеток считается по частям (≈0,1 с целиком): после старта — в фоне, по 40 строк;
// открыли карту раньше — по 90 строк за кадр, лист пока просто бумага (ревью 24.10)
let maskJob = null;
function maskStep(rows) {
  if (mask) return true;
  const w = MAPB.w, h = MAPB.h;
  if (!maskJob) maskJob = { y: 0, ids: new Uint8Array(w * h), sx: new Float64Array(64), sy: new Float64Array(64), n: new Float64Array(64) };
  const J = maskJob, end = Math.min(h, J.y + rows);
  for (let y = J.y; y < end; y++) for (let x = 0; x < w; x++) {
    const wx = EXT.x0 + (MAPB.x + x + 0.5 - LOX) / LS, wy = EXT.y0 + (MAPB.y + y + 0.5 - LOY) / LS;
    const r = ringOfD(warpedDist(wx, wy));
    const id = r >= 1 && r <= RINGS ? cellId(r, sideAt(wx, wy)) : cellId(r);
    J.ids[y * w + x] = id; J.sx[id] += x; J.sy[id] += y; J.n[id]++;
  }
  J.y = end;
  if (J.y < h) return false;
  finishMask(J.ids, J.sx, J.sy, J.n);
  maskJob = null;
  return true;
}
function finishMask(ids, sx, sy, n) {
  const w = MAPB.w, h = MAPB.h;
  // подпись — в точке самой клетки, ближайшей к её середине: у колец-подков середина бывает чужой
  const gx = new Float64Array(64), gy = new Float64Array(64), best = new Float64Array(64).fill(Infinity);
  const cx = new Float64Array(64), cy = new Float64Array(64);
  for (let i = 0; i < 64; i++) if (n[i]) { gx[i] = sx[i] / n[i]; gy[i] = sy[i] / n[i]; }
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) {
    const id = ids[y * w + x], d = (x - gx[id]) ** 2 + (y - gy[id]) ** 2;
    if (d < best[id]) { best[id] = d; cx[id] = x; cy[id] = y; }
  }
  mask = { ids, cx, cy, w, h };
  // подложка: бумага, графы клеток сепией, огонь киноварью, за краем — пусто
  baseCv = plainCanvas(w, h);
  const g = baseCv.getContext('2d'), img = g.createImageData(w, h), d = img.data;
  const put = (i, r, gg, b, a) => { d[i * 4] = r; d[i * 4 + 1] = gg; d[i * 4 + 2] = b; d[i * 4 + 3] = a; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, id = ids[i];
    const edge = (x + 1 < w && ids[i + 1] !== id) || (y + 1 < h && ids[i + w] !== id);
    const fib = ((x * 73 + y * 151) % 97) / 97;                       // волокно бумаги
    if (edge && (id || ids[i + 1] || ids[i + w])) put(i, 58, 48, 38, 150);
    else if (id === 50) put(i, 194, 59, 43, 70);                       // огонь
    else put(i, 232 - (fib > 0.93 ? 8 : 0), 220 - (fib > 0.93 ? 8 : 0), 195 - (fib > 0.93 ? 8 : 0), 255);
  }
  g.putImageData(img, 0, 0);
}
// штриховка пройденного: карандаш по диагонали; городок — точками (вне времени)
function buildFill(walked) {
  const key = [...walked].sort().join('|');
  if (fillCv && key === fillKey) return;
  fillKey = key;
  const { ids, w, h } = mask, on = new Uint8Array(64);
  for (const k of walked) {
    const [rid, side] = k.split(':'), n = SEGMENTS.findIndex(sg => sg.id === rid) + 1;
    if (n > 0) on[cellId(n, side)] = 1;
  }
  fillCv = fillCv || plainCanvas(w, h);
  const g = fillCv.getContext('2d'), img = g.createImageData(w, h), d = img.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, id = ids[i];
    let a = 0;
    if (id === 1) a = (x % 4 === 0 && y % 4 === 0) ? 90 : 0;
    else if (on[id]) a = ((x - y) % 5 + 5) % 5 === 0 ? 85 + ((x * 31 + y * 17) % 40) : 14;
    if (a) { d[i * 4] = 58; d[i * 4 + 1] = 48; d[i * 4 + 2] = 38; d[i * 4 + 3] = a; }
  }
  g.putImageData(img, 0, 0);
}

let localShown = 0, localTotal = 0, knownRings = new Set(), here = 0, hereSide = null, walkedNow = new Set();
function drawLocal() {
  const visited = getVisitedFn() || new Set();
  const walked = getWalkedFn() || new Set();
  const p = getPlayerPos();
  const f = p && { x: p.x + 6, y: p.y + 23 };                  // клетка — по ногам, как пишет обмер (main)
  here = f ? ringAt(f.x, f.y) : 0;
  hereSide = f && here >= 1 && here <= RINGS ? sideAt(f.x, f.y) : null;
  walkedNow = new Set(walked);
  if (hereSide) walkedNow.add(cellKey(here, hereSide));
  knownRings = new Set([here]);
  for (const k of walkedNow) { const n = SEGMENTS.findIndex(sg => sg.id === k.split(':')[0]) + 1; if (n) knownRings.add(n); }
  if (!mask) maskStep(90);
  if (mask) {
    buildFill(walkedNow);
    ctx.imageSmoothingEnabled = false;            // при приближении — чёткие ступени, а не муть
    ctx.drawImage(baseCv, MAPB.x, MAPB.y);
    ctx.drawImage(fillCv, MAPB.x, MAPB.y);
    ctx.imageSmoothingEnabled = true;
  } else { ctx.fillStyle = PAPER; ctx.fillRect(MAPB.x, MAPB.y, MAPB.w, MAPB.h); }
  // замок на выходе
  if (getLockedFn()) {
    ctx.setLineDash([3, 2]);
    ctx.strokeStyle = CINNABAR; ctx.lineWidth = 1;
    ctx.strokeRect(lx(SETTLEMENT.x1), ly(SETTLEMENT.y1), (SETTLEMENT.x2 - SETTLEMENT.x1) * LS, (SETTLEMENT.y2 - SETTLEMENT.y1) * LS);
    ctx.setLineDash([]);
  }
  // тропы на четыре стороны — пунктир сепией
  ctx.fillStyle = rgba(SEPIA, 0.5);
  for (const side of ['north', 'south', 'east', 'west'])
    for (let d = 0; d < RINGS_D + FIRE_W; d += 45) {
      const t = trailPoint(side, d);
      ctx.fillRect(lx(t.x) - 0.6, ly(t.y) - 0.6, 1.2, 1.2);
    }
  // ядро вне времени и костёр — единственное тёплое на листе
  ctx.strokeStyle = rgba(SEPIA, 0.45); ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(lx(CORE.x), ly(CORE.y), CORE.r * LS, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = CANDLE;
  ctx.fillRect(lx(CORE.x) - 1.5, ly(CORE.y) - 1.5, 3, 3);
  // номера колец — по северо-западной диагонали, как графы
  ctx.font = `500 ${10 / Math.sqrt(zscale)}px Montserrat, 'PT Sans', sans-serif`;
  for (let n = 1; n <= RINGS; n++) {
    const d = ringD(n, 100) * LS;
    const cx = lx(TOWN.x0) - d * 0.7071, cy = ly(TOWN.y0) - d * 0.7071, s = String(n);
    ctx.fillStyle = n === here ? CINNABAR : rgba(SEPIA, knownRings.has(n) ? 0.95 : 0.5);
    ctx.fillText(s, cx - ctx.measureText(s).width / 2, cy + 4);
  }
  // подписи пройденных клеток — от руки, названием из описи
  const fs = 11.5 / Math.sqrt(zscale);
  ctx.font = `italic ${fs}px Literata, 'PT Serif', Georgia, serif`;
  // тесно (запад, восток) — подпись, налезающая на соседнюю, ждёт приближения
  const tboxes = [];
  const put = (id, title) => {
    if (!mask) return;
    const tx = MAPB.x + mask.cx[id], ty = MAPB.y + mask.cy[id] + fs * 0.35, tw = ctx.measureText(title).width;
    const b = { x: tx - tw / 2 - 2, y: ty - fs * 0.8, w: tw + 4, h: fs * 1.1 };
    if (tboxes.some(o => b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y)) return;
    tboxes.push(b);
    ctx.fillStyle = rgba(PAPER, 0.82); ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = SEPIA; ctx.fillText(title, tx - tw / 2, ty);
  };
  put(1, 'городок');
  const cells = [...walkedNow].map(k => { const [rid, side] = k.split(':'); return { k, side, n: SEGMENTS.findIndex(sg => sg.id === rid) + 1 }; })
    .filter(c => c.n && CELL_TITLES[c.k]).sort((a, b) => a.n - b.n);
  for (const c of cells) put(cellId(c.n, c.side), '«' + CELL_TITLES[c.k] + '»');

  // места: осмотренные — точка сепией, имя при приближении
  let shown = 0, total = 0;
  const marks = [];
  for (const loc of locations) {
    total++;
    const sx = lx(loc.x + (loc.w || 0) / 2), sy = ly(loc.y + (loc.h || 0) / 2);
    if (visited.has(loc.id)) shown++;
    if (sx < MAPB.x + 2 || sx > MAPB.x + MAPB.w - 2 || sy < MAPB.y + 2 || sy > MAPB.y + MAPB.h - 2) continue;
    if (visited.has(loc.id)) marks.push([sx, sy, loc]);
  }
  const q = 1 / Math.sqrt(zscale);
  for (const [sx, sy] of marks) { ctx.fillStyle = SEPIA; ctx.fillRect(sx - 1.4 * q, sy - 1.4 * q, 2.8 * q, 2.8 * q); }
  if (zscale >= 1.8) {
    const ls = 13 / zscale;
    ctx.font = `${ls}px Literata, 'PT Serif', Georgia, serif`;
    const boxes = [];
    for (const [sx, sy, loc] of marks) {
      const name = (loc.name || loc.id).slice(0, 28), tw = ctx.measureText(name).width;
      const b = { x: sx + 4, y: sy - ls * 0.7, w: tw + 2, h: ls * 0.95 };
      if (boxes.some(o => b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y)) continue;
      boxes.push(b);
      ctx.fillStyle = rgba(PAPER, 0.85); ctx.fillRect(b.x - 1, b.y, b.w + 1, b.h);
      ctx.fillStyle = SEPIA; ctx.fillText(name, sx + 5, sy + ls * 0.2);
    }
  }
  // ты — киноварью
  if (p) {
    const px = lx(p.x), py = ly(p.y);
    if (reducedMotion() || ((Date.now() / 400) | 0) % 2 === 0) { ctx.fillStyle = CINNABAR; ctx.fillRect(px - 2.5 * q, py - 2.5 * q, 5 * q, 5 * q); }
    ctx.font = `italic ${13 / Math.sqrt(zscale)}px Literata, 'PT Serif', Georgia, serif`;
    const tw = ctx.measureText('ты').width;
    ctx.fillStyle = CINNABAR; ctx.fillText('ты', px - tw - 5 * q, py + 4 * q);
  }
  localShown = shown; localTotal = total;
}

function sideText(lines, y) {
  for (const [txt, col, font] of lines) {
    if (txt === null) { y += 8; continue; }
    const paper = view === 'local';
    ctx.font = font || (paper ? F_PAPER : F_TEXT);
    ctx.fillStyle = col || (paper ? SEPIA : BONE);
    const lh = font === F_GRIF ? 15 : font === F_PAPER_S ? 17 : font === F_SMALL ? 16 : paper ? 19 : 18;
    for (const ln of wrap(txt, SIDE.w - 8)) { ctx.fillText(ln, SIDE.x, y); y += lh; }
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

function whereName(n, side) {
  if (n === 0) return 'городок · вне времени';
  if (n <= RINGS) return `кольцо ${n} · ${side ? SIDE_RU[side] + ' · ' : ''}${SEGMENTS[n - 1].name}`;
  return n === RINGS + 1 ? 'кольцо огня' : 'за огнём · край';
}

function drawLocalSide() {
  const filled = [...walkedNow].filter(k => CELL_TITLES[k]).length;
  const L = [
    ['ты: ' + whereName(here, hereSide), CINNABAR],
  ];
  if (hereSide && CELL_TITLES[cellKey(here, hereSide)]) L.push([`клетка «${CELL_TITLES[cellKey(here, hereSide)]}»`, SEPIA, F_PAPER_S]);
  L.push([`граф заполнено: ${filled} из ${RINGS * 5} · мест осмотрено: ${localShown} из ${localTotal}`, rgba(SEPIA, 0.8), F_PAPER_S]);
  L.push([null]);
  let y = sideText(L, SIDE.y + 16);
  // ведомость клеток: кольцо, эпоха, пять граф сторон
  ctx.font = F_GRIF; ctx.fillStyle = rgba(SEPIA, 0.75);
  ctx.fillText('КОЛЬЦО · ЭПОХА', SIDE.x, y);
  const gx = SIDE.x + SIDE.w - 5 * 15 - 4;
  SIDES5.forEach((sd, i) => ctx.fillText(SIDE_ABBR[sd], gx + i * 15 + 3, y));
  y += 16;
  for (let n = 1; n <= RINGS; n++) {
    const sg = SEGMENTS[n - 1], k = knownRings.has(n);
    ctx.font = F_PAPER_S;
    ctx.fillStyle = n === here ? CINNABAR : rgba(SEPIA, k ? 0.95 : 0.45);
    ctx.fillText(`${n}  ${k ? sg.name : '· · ·'}`, SIDE.x, y);
    SIDES5.forEach((sd, i) => {
      const bx = gx + i * 15, by = y - 10;
      ctx.strokeStyle = rgba(SEPIA, 0.6); ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, 11, 11);
      if (walkedNow.has(cellKey(n, sd))) {
        ctx.strokeStyle = SEPIA; ctx.lineWidth = 1.2;
        ctx.beginPath(); for (let j = -8; j <= 8; j += 4) { ctx.moveTo(bx + 1 + Math.max(0, j), by + 1 + Math.max(0, -j)); ctx.lineTo(bx + 11 + Math.min(0, j), by + 11 + Math.min(0, -j)); } ctx.stroke();
      }
      if (n === here && sd === hereSide) { ctx.strokeStyle = CINNABAR; ctx.lineWidth = 1.2; ctx.strokeRect(bx - 0.5, by - 0.5, 13, 13); }
    });
    y += 18;
  }
  y = sideText([[null], ['за девятым — огонь, за огнём — край', rgba(SEPIA, 0.7), F_PAPER_S]], y);
  if (getLockedFn()) y = sideText([[null], ['Выход из городка — по пропуску. Пропуска выдаёт Шут. Шут у костра.', CINNABAR, F_PAPER_S]], y);
  // обмер произвёл — рука странника (ui/signature.js); не расписался — уклонился; в красный полдень руки нет
  const sy = Math.max(y + 12, SIDE.y + SIDE.h - 96);
  ctx.font = F_GRIF; ctx.fillStyle = rgba(SEPIA, 0.75);
  ctx.fillText('ОБМЕР ПРОИЗВЁЛ', SIDE.x, sy);
  if (redNoon.k > 0.5 || !drawSignature(ctx, SIDE.x + 112, sy - 17, 140, 22, '#241d18', 1.3)) {
    ctx.font = "italic 13px Literata, 'PT Serif', Georgia, serif"; ctx.fillStyle = rgba(SEPIA, 0.8);
    ctx.fillText('— от подписи уклонился', SIDE.x + 104, sy);
  }
  ctx.strokeStyle = rgba(SEPIA, 0.5); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(SIDE.x + 104, sy + 4); ctx.lineTo(SIDE.x + SIDE.w - 8, sy + 4); ctx.stroke();
  // легенда
  y = Math.max(sy + 28, SIDE.y + SIDE.h - 58);
  ctx.font = F_PAPER_S;
  const leg = [
    [() => { ctx.strokeStyle = SEPIA; ctx.lineWidth = 1; ctx.beginPath(); for (let j = 0; j < 9; j += 3) { ctx.moveTo(SIDE.x + j, y - 1); ctx.lineTo(SIDE.x + j + 5, y - 9); } ctx.stroke(); }, 'пройдено ногами'],
    [() => { ctx.fillStyle = SEPIA; ctx.fillRect(SIDE.x + 2, y - 7, 3, 3); }, 'осмотрено'],
    [() => { ctx.fillStyle = CINNABAR; ctx.fillRect(SIDE.x + 1, y - 8, 6, 6); }, 'ты'],
  ];
  for (const [icon, label] of leg) { icon(); ctx.fillStyle = rgba(SEPIA, 0.85); ctx.fillText(label, SIDE.x + 16, y); y += 17; }
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
// force — с бланка заставки («вспомнить дорогу»): мир ещё не начат, а план уже есть
export function open(force = false) {
  if (visible) return;
  if (!state.is('game') && !force) return;
  visible = true;
  resetZoom();
  const el = document.getElementById('map');
  if (!el) return;
  el.classList.add('on');
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(draw);
}

export function close() {
  const was = visible;
  visible = false;
  const el = document.getElementById('map');
  if (el) el.classList.remove('on');
  cancelAnimationFrame(rafId);
  if (was) events.emit('map.closed');
}

export function toggle() {
  if (visible) close(); else open();
}

export function isOpen() { return visible; }

export function init(opts) {
  if (opts && typeof opts.getVisited === 'function') getVisitedFn = opts.getVisited;
  if (opts && typeof opts.getLocked === 'function') getLockedFn = opts.getLocked;
  if (opts && typeof opts.getWalked === 'function') getWalkedFn = opts.getWalked;
  canvas = document.getElementById('map-canvas');
  // кадастровая геометрия — заранее, в фоне, не мешая игре (по 40 строк раз в 30 мс)
  if (typeof setTimeout === 'function') setTimeout(function step() { if (!visible && !maskStep(40)) setTimeout(step, 30); else if (!mask) setTimeout(step, 200); }, 3000);
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
