// ═══════════════════════════════════════
// GROUND — разметка на земле открытого мира: подписи стихий, межа ядра и
// ткань застройки (утварь эпох в поле). Саму землю — кольца, городок,
// кольцо огня, стихии, дороги и реку — рисует render/etch.js штрихом по рельефу.
// ═══════════════════════════════════════
import { SEGMENTS } from '../content/ulitsa_db.js';
import { TOWN, RING_W, RINGS, FIRE_W, warpedDist } from '../world/disc.js';
import { onArtery } from '../world/arteries.js';
import { hash } from './draw.js';
import { ARCH_BY_RING } from '../sprites/arch/index.js';
import { t as now } from '../core/time.js';
import { scaler } from './scaler.js';

const OUTER = RINGS * RING_W + FIRE_W;

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
  ctx.fillStyle = 'rgba(90,200,80,0.6)';
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
  drawTissue(ctx, cam);
}

// ═══ Ткань застройки: рассеянные структуры эпохи по кольцам ═══
// Таблички перестают быть фишками в поле: вокруг — обломки среды.
import { ringAt, CORE } from '../world/disc.js';
const CELL = 150;
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
// сектор диска для ткани: юг/север/запад/восток; дуга северо-восточного
// угла — равнина
function sectorOf(wx, wy) {
  if (wx > TOWN.x1 && wy < TOWN.y0) {
    const a = Math.atan2(TOWN.y0 - wy, wx - TOWN.x1) / (Math.PI / 2);
    if (a > 0.2 && a < 0.8) return 'plain';
  }
  const dn = TOWN.y0 - wy, ds = wy - TOWN.y1, dw = TOWN.x0 - wx, de = wx - TOWN.x1;
  const m = Math.max(dn, ds, dw, de);
  return m === dn ? 'north' : m === ds ? 'south' : m === dw ? 'west' : 'east';
}

// клетка ткани: где лежит и что (детерминированно, без камеры; кэш)
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
  if (h < 0.62) return null;
  const wx = gx * CELL + 20 + ((h * 991) % (CELL - 60));
  const wy = gy * CELL + 24 + ((h * 733) % (CELL - 60));
  const ring = ringAt(wx, wy);
  if (ring < 1 || ring > RINGS) return null;
  if (tissueBlocked(wx - 6, wy - 30, wx + 32, wy + 8)) return null;
  if (onArtery(wx + 2, wy, 10) || onArtery(wx + 14, wy, 10) || onArtery(wx + 26, wy, 10)) return null;   // не на дороге и не в реке
  const side = sectorOf(wx, wy);
  // шов эпох: у внутренней кромки кольца лежат обломки прошлой эпохи
  const d = warpedDist(wx, wy), frac = d / RING_W - (ring - 1);
  const pr = ring > 1 && frac < 0.22 && hash(gx, gy, 71) > 0.35 ? ring - 1 : ring;
  const props = (ARCH_BY_RING[SEGMENTS[pr - 1].id]?.props?.[side] || []).filter(p => !p.unique);
  const idx = props.length ? ((h * 977) | 0) % props.length : -1;
  return { h, wx, wy, ring, side, props, idx, pr };
}

export function drawTissue(ctx, cam) {
  const gx0 = Math.floor((cam.x - 60) / CELL), gy0 = Math.floor((cam.y - 100) / CELL);
  const gx1 = Math.ceil((cam.x + scaler.vw + 120) / CELL), gy1 = Math.ceil((cam.y + scaler.vh + 160) / CELL);
  for (let gy = gy0; gy <= gy1; gy++) {
    for (let gx = gx0; gx <= gx1; gx++) {
      const c = tissueCell(gx, gy);
      if (!c) continue;
      // ткань — по кольцу И стороне света: утварь из модуля кольца;
      // одна и та же вещь не лежит дважды в пределах кадра
      if (c.idx >= 0) {
        let dup = false;
        for (let dy = -2; dy <= 2 && !dup; dy++) for (let dx = -4; dx <= 4 && !dup; dx++) {
          if (!dx && !dy) continue;
          const o = tissueCell(gx + dx, gy + dy);
          if (o && o.idx === c.idx && o.pr === c.pr && o.side === c.side && o.h > c.h) dup = true;
        }
        if (!dup) {
          if (c.pr !== c.ring) ctx.globalAlpha = 0.72;      // обломок прошлой эпохи — выцвел
          c.props[c.idx].draw(ctx, c.wx + 12, c.wy, now);
          ctx.globalAlpha = 1;
        }
        continue;
      }
      // сторона: снег севера белит верхушки
      drawTissueItem(ctx, c.wx, c.wy, c.ring, ((c.h * 100) | 0) % 3, c.side === 'north');
    }
  }
}

function drawTissueItem(ctx, x, y, ring, v, north) {
  const S = '#0f0b07', S2 = '#1a130c';
  const R = (dx, dy, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + dx, y + dy, w, h); };
  switch (ring) {
    case 1: // осевое: сырцовая кладка, черепки, вкопанный камень
      if (v === 0) { R(0, 0, 26, 6, S); R(3, -5, 18, 5, S2); R(7, -9, 9, 4, S); }
      else if (v === 1) { R(0, 0, 8, 4, S2); R(10, 2, 6, 3, S2); R(5, 5, 7, 3, S); }
      else { R(0, -8, 6, 12, S); R(-2, 2, 10, 3, S2); }
      break;
    case 2: // портики: колонна целая/пенёк/фронтон на земле
      if (v === 0) { R(0, -24, 5, 24, S); R(-2, -26, 9, 3, S2); R(-2, 0, 9, 2, S2); }
      else if (v === 1) { R(0, -8, 6, 8, S); R(-2, -10, 10, 3, S2); }
      else { ctx.fillStyle = S2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 12, y - 7); ctx.lineTo(x + 24, y); ctx.fill(); }
      break;
    case 3: // сад света: дерево-крона, арка, фонарик сада
      if (v === 0) { R(2, -6, 3, 8, S); ctx.fillStyle = S2; ctx.beginPath(); ctx.arc(x + 3, y - 11, 7, 0, 7); ctx.fill(); }
      else if (v === 1) { R(0, -14, 3, 14, S); R(9, -14, 3, 14, S); R(0, -16, 12, 3, S2); }
      else { R(0, -10, 2, 10, S); R(-2, -13, 6, 4, S2); }
      break;
    case 4: // два очага: плетень, сруб-угол, стог
      if (v === 0) { for (let i = 0; i < 5; i++) R(i * 5, -8 - (i % 2) * 2, 2, 8 + (i % 2) * 2, S); R(-1, -6, 24, 2, S2); }
      else if (v === 1) { R(0, -10, 14, 10, S); R(-2, -12, 18, 3, S2); }
      else { ctx.fillStyle = S2; ctx.beginPath(); ctx.arc(x + 6, y, 7, Math.PI, 0); ctx.fill(); }
      break;
    case 5: // просвещение: балюстрада, столб фонаря, тумба
      if (v === 0) { for (let i = 0; i < 4; i++) R(i * 6, -8, 2, 8, S); R(-1, -10, 21, 2, S2); R(-1, 0, 21, 2, S2); }
      else if (v === 1) { R(0, -18, 2, 18, S); R(-2, -20, 6, 3, S2); }
      else { R(0, -9, 8, 9, S2); R(-1, -11, 10, 2, S); }
      break;
    case 6: // пар и тени: труба-огрызок, кирпичная стена с окном, бочка
      if (v === 0) { R(0, -16, 7, 16, S2); R(-1, -18, 9, 2, S); }
      else if (v === 1) { R(0, -12, 20, 12, S); R(4, -9, 5, 5, '#050510'); }
      else { R(0, -8, 8, 8, S2); R(-1, -9, 10, 2, S); R(-1, -4, 10, 1, S); }
      break;
    case 7: // катастрофы: плита с арматурой, воронка, стена-огрызок
      if (v === 0) { R(0, -6, 18, 6, S); R(3, -12, 1, 6, '#2a2a2a'); R(9, -14, 1, 8, '#2a2a2a'); }
      else if (v === 1) { R(0, -2, 18, 4, '#0a0806'); R(2, -3, 14, 1, '#0a0806'); R(2, 2, 14, 1, '#0a0806'); R(3, -4, 12, 1, 'rgba(217,207,184,0.35)'); }   // воронка — на земле, кромка дальнего края
      else { R(0, -14, 12, 14, S); R(0, -14, 12, 3, '#050510'); }
      break;
    case 8: // неон: бетонный забор, столб с проводами, остов ларька
      if (v === 0) { for (let i = 0; i < 3; i++) R(i * 9, -10, 8, 10, S); R(-1, -11, 28, 2, S2); }
      else if (v === 1) { R(0, -20, 2, 20, S); R(-6, -18, 14, 1, S2); R(-6, -15, 14, 1, S2); }
      else { R(0, -10, 12, 10, S2); R(-1, -12, 14, 2, '#3a1420'); }
      break;
    default: // сейчас: дорожный блок, стеклобетон, знак без текста
      if (v === 0) { R(0, -6, 16, 6, '#2a2a2e'); R(2, -6, 3, 6, '#3a3a40'); }
      else if (v === 1) { R(0, -16, 10, 16, S); R(1, -15, 2, 14, 'rgba(138,141,143,0.2)'); }
      else { R(0, -12, 2, 12, S); R(-3, -16, 8, 5, S2); }
  }
  if (north) { ctx.fillStyle = 'rgba(220,232,240,0.5)'; ctx.fillRect(x - 2, y - (ring === 2 ? 26 : 16), 12, 1); }
}
