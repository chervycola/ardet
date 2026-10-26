// ═══════════════════════════════════════
// GROUND — разметка на земле открытого мира: подписи стихий, межа ядра и
// ткань застройки (утварь эпох в поле). Саму землю — кольца, городок,
// кольцо огня, стихии, дороги и реку — рисует render/etch.js штрихом по рельефу.
// ═══════════════════════════════════════
import { SEGMENTS } from '../content/ulitsa_db.js';
import { TOWN, RINGS, RINGS_D, FIRE_W, warpedDist, ringFrac, thinAt } from '../world/disc.js';
import { onArtery, nearRoad } from '../world/arteries.js';
import { sideAt } from '../world/relief.js';
import { hash } from './draw.js';
import { ARCH_BY_RING } from '../sprites/arch/index.js';
import { scaler } from './scaler.js';

const OUTER = RINGS_D + FIRE_W;

// ── надписи стихий и межа ядра — мировые координаты (ctx уже с камерой);
// дороги, река и дуги лежат в самой земле (render/etchPaths.js) ──
export function drawGroundMarks(ctx, cam) {
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  const vis = (x, y, w, h) =>
    x + w > cam.x && x < cam.x + scaler.vw + 80 && y + h > cam.y && y < cam.y + scaler.vh + 100;

  // подписи стихий
  ctx.fillStyle = 'rgba(122,100,64,0.8)';
  if (vis(TOWN.x0 + 340, TOWN.y1 + OUTER + 4, 500, 14))
    ctx.fillText('зыбучий песок · юг не держит', TOWN.x0 + 348, TOWN.y1 + OUTER + 16);
  ctx.fillStyle = 'rgba(150,130,90,0.7)';
  if (vis(TOWN.x1 + OUTER + 4, TOWN.y0 + 40, 300, 14))
    ctx.fillText('куча мусора · восток завален', TOWN.x1 + OUTER + 10, TOWN.y0 + 52);
  ctx.fillStyle = 'rgba(138,141,143,0.85)';         // лёд — пеплом (голубой вне палитры)
  if (vis(TOWN.x0 + 340, TOWN.y0 - OUTER - 18, 400, 14))
    ctx.fillText('лёд · север трескается', TOWN.x0 + 348, TOWN.y0 - OUTER - 6);
  ctx.fillStyle = 'rgba(124,127,105,0.7)';            // мглой: неона в палитре нет
  if (vis(TOWN.x0 - OUTER - 10, TOWN.y0 + 60, 300, 14))
    ctx.fillText('токсичное озеро · запад', TOWN.x0 - OUTER - 4, TOWN.y0 + 74);

  // ядро вне времени — еле заметная межа вокруг места пробуждения
  if (vis(CORE.x - CORE.r, CORE.y - CORE.r, CORE.r * 2, CORE.r * 2)) {
    ctx.strokeStyle = 'rgba(217,207,184,0.07)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 14]);
    ctx.beginPath(); ctx.arc(CORE.x, CORE.y, CORE.r, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }
}

// ═══ Ткань застройки: утварь эпохи в поле ═══
// Таблички перестают быть фишками в поле: вокруг — обломки среды. Это та же
// утварь, что во дворах (модуль кольца и стороны), только брошенная: стоит в
// земле (render/things.js), старое — глубже; рядом с ней — обломки эпохи
// (кладка, колонна, сруб, бочка, плита с арматурой…). Одна и та же вещь в
// кадр дважды не попадает: вид выбирается при сборке мира так, чтобы не
// повторить соседей и утварь ближних дворов; где все виды уже стоят рядом —
// пусто. Живое (огонь, лампа, вода, подвес) брошенным не бывает — в ткань
// не идёт.
import { ringAt, CORE, WORLD_W, WORLD_H } from '../world/disc.js';
import { fieldAt } from '../world/fields.js';
import { floraIn } from '../world/flora.js';
import { landmarkBoxes } from '../world/landmarks.js';
import { thing, wearOf, warmKind } from './things.js';
import { FRAGMENTS } from '../sprites/fragments.js';
const CELL = 150;
const FRAME_X = 640, FRAME_Y = 360;   // «один кадр»: ближе — повтор видно
// ткань не ложится на постройки, таблички и дворы
let blockGrid = null;
export function setTissueBlockers(boxes) {
  cellCache.clear();
  blockGrid = new Map();
  for (const b of boxes) {
    for (let gx = Math.floor(b.x0 / CELL); gx <= Math.floor(b.x1 / CELL); gx++) {
      for (let gy = Math.floor(b.y0 / CELL); gy <= Math.floor(b.y1 / CELL); gy++) {
        const k = gx * 100000 + gy;
        if (!blockGrid.has(k)) blockGrid.set(k, []);
        blockGrid.get(k).push(b);
      }
    }
  }
}
// занято ли место постройкой, табличкой, двором (для травы и ткани)
export function groundBlocked(x0, y0, x1, y1) { return tissueBlocked(x0, y0, x1, y1); }
function tissueBlocked(x0, y0, x1, y1) {
  if (!blockGrid) return false;
  for (let gx = Math.floor(x0 / CELL); gx <= Math.floor(x1 / CELL); gx++) {
    for (let gy = Math.floor(y0 / CELL); gy <= Math.floor(y1 / CELL); gy++) {
      const list = blockGrid.get(gx * 100000 + gy);
      if (!list) continue;
      for (const b of list) if (x1 > b.x0 && x0 < b.x1 && y1 > b.y0 && y0 < b.y1) return true;
    }
  }
  return false;
}
// клетка ткани: где лежит (детерминированно, без камеры; кэш)
const cellCache = new Map();
function tissueCell(gx, gy) {
  const key = gx * 100000 + gy;
  if (cellCache.has(key)) return cellCache.get(key);
  if (cellCache.size > 6000) cellCache.clear();
  const c = tissueCellRaw(gx, gy);
  cellCache.set(key, c);
  return c;
}
function tissueCellRaw(gx, gy) {
  const h = hash(gx + 31, gy + 57, 29);
  if (h < 0.5) return null;
  const wx = Math.round(gx * CELL + 20 + ((h * 991) % (CELL - 60)));
  const wy = Math.round(gy * CELL + 24 + ((h * 733) % (CELL - 60)));
  const ring = ringAt(wx, wy);
  if (ring < 1 || ring > RINGS) return null;
  if (hash(gx, gy, 83) > thinAt(ring)) return null;     // кольцо просторнее прежнего — ткани столько же, пустоты больше
  if (tissueBlocked(wx - 6, wy - 30, wx + 32, wy + 8)) return null;
  if (onArtery(wx + 2, wy, 10) || onArtery(wx + 14, wy, 10) || onArtery(wx + 26, wy, 10)) return null;   // не на дороге и не в реке
  // жильё тянется к дорогам: у дороги ткань гуще, в чистом поле — реже
  if (!nearRoad(wx + 12, wy, 230) && h < 0.76) return null;
  const side = sideAt(wx + 12, wy);                     // сторона — по рваному шву: в углах колец стороны мешаются
  // шов эпох: у внутренней кромки кольца лежат обломки прошлой эпохи
  const d = warpedDist(wx, wy), frac = ringFrac(d) - (ring - 1);
  const pr = ring > 1 && frac < 0.22 && hash(gx, gy, 71) > 0.35 ? ring - 1 : ring;
  return { h, wx, wy, ring, side, pr, d, gx, gy };
}

// виды ткани кольца и стороны: утварь модуля (кроме приметы эпохи, живого и
// тёплого), за ней — обломки эпохи
function kindsOf(pr, side) {
  const own = (ARCH_BY_RING[SEGMENTS[pr - 1].id]?.props?.[side] || []).filter(p => !p.unique && !p.live && !warmKind(p));
  return [...own, ...FRAGMENTS[pr - 1]];
}

// ── сборка ткани: один раз, после дворов, полей, примет и рощ ──
// yard — утварь дворов ({ x, gy, kindDraw }): её вид рядом тоже занят
const tissue = [];                 // { wx, wy, ring, side, pr, kind, thing }
const tgrid = new Map();
export function buildTissue(yard = []) {
  tissue.length = 0; tgrid.clear();
  const near = [...yard.map(p => ({ x: p.x, y: p.gy, draw: p.kindDraw }))];
  const lms = landmarkBoxes();
  const gx1 = Math.ceil(WORLD_W / CELL), gy1 = Math.ceil(WORLD_H / CELL);
  for (let gy = 0; gy <= gy1; gy++) for (let gx = 0; gx <= gx1; gx++) {
    const c = tissueCell(gx, gy);
    if (!c) continue;
    const cx = c.wx + 12;
    // не в поле (кроме заброшенного), не на примете, не под деревом
    if ((fieldAt(cx, c.wy)?.kind ?? 'fallow') !== 'fallow' || (fieldAt(c.wx, c.wy)?.kind ?? 'fallow') !== 'fallow') continue;
    if (lms.some(b => cx + 16 > b.x0 && cx - 16 < b.x1 && c.wy + 4 > b.y0 && c.wy - 30 < b.y1)) continue;
    if (floraIn(cx - 18, c.wy - 8, cx + 18, c.wy + 8).length) continue;
    // вид: первый по зерну, которого нет в кадре вокруг; нет такого — пусто
    const kinds = kindsOf(c.pr, c.side);
    if (!kinds.length) continue;
    const taken = new Set();
    for (const o of near) if (Math.abs(o.x - cx) < FRAME_X && Math.abs(o.y - c.wy) < FRAME_Y) taken.add(o.draw);
    const s0 = (c.h * 977) | 0;
    let K = null;
    for (let i = 0; i < kinds.length && !K; i++) { const k = kinds[(s0 + i) % kinds.length]; if (!taken.has(k.draw)) K = k; }
    if (!K) continue;
    const seed = (gx * 7349 + gy * 3571) >>> 0;
    const T = thing({ x: cx, gy: c.wy, w: K.w, h: K.h, draw: K.draw, name: K.name, kind: 'tissue',
      wear: wearOf({ ring: c.ring, era: c.pr, side: c.side, d: c.d, seed, old: c.pr !== c.ring }) });
    const it = { wx: c.wx, wy: c.wy, ring: c.ring, side: c.side, pr: c.pr, kind: K.name, thing: T };
    tissue.push(it);
    near.push({ x: cx, y: c.wy, draw: K.draw });
    const key = Math.floor(cx / CELL) * 100000 + Math.floor(c.wy / CELL);
    if (!tgrid.has(key)) tgrid.set(key, []);
    tgrid.get(key).push(it);
  }
  return tissue;
}

// ткань в прямоугольнике мира (для замеров и тестов)
export function tissueIn(x0, y0, x1, y1) {
  return tissueThings(x0, y0, x1, y1);
}
// вещи ткани, задевающие прямоугольник (для кадра: по глубине, с тенью)
export function tissueThingsIn(x0, y0, x1, y1) {
  return tissueThings(x0 - 24, y0, x1 + 24, y1 + 40).map(it => it.thing)
    .filter(T => T.x + T.w / 2 + 6 > x0 && T.x - T.w / 2 - 6 < x1 && T.gy + 3 > y0 && T.gy - T.h - 6 < y1);
}
function tissueThings(x0, y0, x1, y1) {
  const out = [];
  for (let gy = Math.floor(y0 / CELL); gy <= Math.floor(y1 / CELL); gy++)
    for (let gx = Math.floor(x0 / CELL); gx <= Math.floor(x1 / CELL); gx++) {
      const L = tgrid.get(gx * 100000 + gy);
      if (L) for (const it of L) if (it.thing.x >= x0 && it.thing.x < x1 && it.wy >= y0 && it.wy < y1) out.push(it);
    }
  return out;
}
