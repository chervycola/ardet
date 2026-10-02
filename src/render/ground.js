// ═══════════════════════════════════════
// GROUND — аналитическая земля открытого мира: кольца эпох, кольцо
// огня и стихии краёв рисуются по вьюпорту каждый кадр (мир любого
// размера без запечённого полотна). Городок блитится поверх из
// своего запечённого канваса (main).
// ═══════════════════════════════════════
import { SEGMENTS } from '../content/ulitsa_db.js';
import {
  TOWN, RING_W, RINGS, FIRE_W, townDist, warpedDist, trailPoint,
} from '../world/disc.js';
import { hash } from './draw.js';

const OUTER = RINGS * RING_W + FIRE_W;
const B = 8;                     // размер блока земли

function elementColor(wx, wy) {
  const dn = TOWN.y0 - wy, ds = wy - TOWN.y1, dw = TOWN.x0 - wx, de = wx - TOWN.x1;
  const m = Math.max(dn, ds, dw, de);
  if (m === ds) return ((wx + wy) % 24 < 12) ? '#5a4a30' : '#4e3f28';          // песок
  if (m === de) return ['#221c12', '#2e2618', '#1a160e'][(((wx * 7 + wy * 13) / 8 | 0) % 3 + 3) % 3];
  if (m === dn) return ((wx - wy) % 28 < 14) ? '#aec6d4' : '#98b4c4';          // лёд
  return ((wx + wy) % 20 < 10) ? '#1e3a14' : '#254a18';                        // озеро
}
const FIRE_G = '#160a06';
function ringGround(n) { return SEGMENTS[Math.max(0, Math.min(RINGS, n) - 1)].palette.ground; }

// цвет земли с дизерингом на рваных границах: эпохи перетекают,
// а не сменяются по линейке
function groundColor(wx, wy, bx, by) {
  const d = warpedDist(wx, wy);
  const mix = hash(bx * 3 + 1, by * 3 + 2, 17);
  if (d > OUTER) {
    const f = (d - OUTER) / 60;                    // кромка стихии
    if (f < 1 && mix > f) return FIRE_G;
    return elementColor(wx, wy);
  }
  if (d > RINGS * RING_W) {
    const f = (d - RINGS * RING_W) / FIRE_W;       // гарь ест девятое кольцо
    if (f < 0.4 && mix > 0.5 + f) return ringGround(RINGS);
    return FIRE_G;
  }
  const n = Math.ceil(d / RING_W);
  const frac = d / RING_W - (n - 1);
  if (n < RINGS && frac > 0.7) {
    if (mix < ((frac - 0.7) / 0.3) * 0.55) return ringGround(n + 1);
  } else if (n > 1 && frac < 0.3) {
    if (mix < ((0.3 - frac) / 0.3) * 0.55) return ringGround(n - 1);
  } else if (n === RINGS && frac > 0.75) {
    if (mix < ((frac - 0.75) / 0.25) * 0.4) return FIRE_G;
  }
  return ringGround(n);
}

// ── земля по вьюпорту: экранные координаты ──
export function drawGround(ctx, camX, camY, vw, vh) {
  const x0 = Math.floor(camX / B) * B, y0 = Math.floor(camY / B) * B;
  for (let wy = y0; wy < camY + vh + B; wy += B) {
    for (let wx = x0; wx < camX + vw + B; wx += B) {
      if (townDist(wx + 4, wy + 4) <= 0) continue;   // городок блитится поверх
      const d = warpedDist(wx + 4, wy + 4);
      ctx.fillStyle = groundColor(wx + 4, wy + 4, (wx / B) | 0, (wy / B) | 0);
      ctx.fillRect(wx - camX, wy - camY, B, B);
      // пыль/уголья/блёстки — детерминированно
      const h = hash((wx / B) | 0, (wy / B) | 0, 43);
      if (h > 0.84) {
        if (d > RINGS * RING_W && d <= OUTER) {
          ctx.fillStyle = h > 0.94 ? '#6b0f1a' : '#3a1408';   // уголья
        } else if (d > OUTER) {
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
        } else {
          const n = Math.ceil(d / RING_W);
          ctx.fillStyle = SEGMENTS[Math.max(0, n - 1)].palette.dust;
        }
        ctx.fillRect(wx - camX + ((h * 5) | 0), wy - camY + ((h * 7) | 0) % B, 2, 2);
      }

    }
  }
}

// ── надписи, тропы и скайлайн — мировые координаты (ctx уже с камерой) ──
export function drawGroundMarks(ctx, cam) {
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  const vis = (x, y, w, h) =>
    x + w > cam.x && x < cam.x + 720 && y + h > cam.y && y < cam.y + 460;

  // тропы на четыре стороны (эпохи без подписей: их читают по постройкам)
  ctx.fillStyle = 'rgba(200,184,160,0.3)';
  const span = RINGS * RING_W;
  for (let d = 4; d < span; d += 10) {
    const s = trailPoint('south', d), n = trailPoint('north', d);
    if (vis(s.x, s.y, 4, 5)) ctx.fillRect(s.x - 1, s.y, 3, 5);
    if (vis(n.x, n.y - 5, 4, 5)) ctx.fillRect(n.x - 1, n.y - 5, 3, 5);
    const e = trailPoint('east', d), w = trailPoint('west', d);
    if (vis(e.x, e.y, 5, 4)) ctx.fillRect(e.x, e.y - 1, 5, 3);
    if (vis(w.x - 5, w.y, 5, 4)) ctx.fillRect(w.x - 5, w.y - 1, 5, 3);
  }

  // подписи стихий
  ctx.fillStyle = 'rgba(122,100,64,0.8)';
  if (vis(TOWN.x0 + 340, TOWN.y1 + OUTER + 4, 500, 14))
    ctx.fillText('зыбучий песок · юг не держит', TOWN.x0 + 348, TOWN.y1 + OUTER + 16);
  ctx.fillStyle = 'rgba(150,130,90,0.7)';
  if (vis(TOWN.x1 + OUTER + 4, TOWN.y0 + 40, 300, 14))
    ctx.fillText('куча мусора · восток завален', TOWN.x1 + OUTER + 10, TOWN.y0 + 52);
  ctx.fillStyle = 'rgba(60,90,110,0.85)';
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
export function drawTissue(ctx, cam) {
  const gx0 = Math.floor((cam.x - 60) / CELL), gy0 = Math.floor((cam.y - 100) / CELL);
  const gx1 = Math.ceil((cam.x + 760) / CELL), gy1 = Math.ceil((cam.y + 520) / CELL);
  for (let gy = gy0; gy <= gy1; gy++) {
    for (let gx = gx0; gx <= gx1; gx++) {
      const h = hash(gx + 31, gy + 57, 29);
      if (h < 0.62) continue;
      const wx = gx * CELL + 20 + ((h * 991) % (CELL - 60));
      const wy = gy * CELL + 24 + ((h * 733) % (CELL - 60));
      const ring = ringAt(wx, wy);
      if (ring < 1 || ring > RINGS) continue;
      const variant = ((h * 100) | 0) % 3;
      // сторона: снег севера белит верхушки
      const north = TOWN.y0 - wy > Math.max(wy - TOWN.y1, TOWN.x0 - wx, wx - TOWN.x1);
      drawTissueItem(ctx, wx, wy, ring, variant, north);
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
      else if (v === 1) { ctx.fillStyle = '#0a0806'; ctx.beginPath(); ctx.arc(x + 8, y, 9, 0, 7); ctx.fill(); }
      else { R(0, -14, 12, 14, S); R(0, -14, 12, 3, '#050510'); }
      break;
    case 8: // неон: бетонный забор, столб с проводами, остов ларька
      if (v === 0) { for (let i = 0; i < 3; i++) R(i * 9, -10, 8, 10, S); R(-1, -11, 28, 2, S2); }
      else if (v === 1) { R(0, -20, 2, 20, S); R(-6, -18, 14, 1, S2); R(-6, -15, 14, 1, S2); }
      else { R(0, -10, 12, 10, S2); R(-1, -12, 14, 2, '#3a1420'); }
      break;
    default: // сейчас: дорожный блок, стеклобетон, знак без текста
      if (v === 0) { R(0, -6, 16, 6, '#2a2a2e'); R(2, -6, 3, 6, '#3a3a40'); }
      else if (v === 1) { R(0, -16, 10, 16, S); R(1, -15, 2, 14, 'rgba(122,223,255,0.15)'); }
      else { R(0, -12, 2, 12, S); R(-3, -16, 8, 5, S2); }
  }
  if (north) { ctx.fillStyle = 'rgba(220,232,240,0.5)'; ctx.fillRect(x - 2, y - (ring === 2 ? 26 : 16), 12, 1); }
}
