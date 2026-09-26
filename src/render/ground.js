// ═══════════════════════════════════════
// GROUND — аналитическая земля открытого мира: кольца эпох, кольцо
// огня и стихии краёв рисуются по вьюпорту каждый кадр (мир любого
// размера без запечённого полотна). Городок блитится поверх из
// своего запечённого канваса (main).
// ═══════════════════════════════════════
import { SEGMENTS } from '../content/ulitsa_db.js';
import {
  TOWN, RING_W, RINGS, FIRE_W, OFF, WORLD_W, WORLD_H, townDist, southBand,
} from '../world/disc.js';
import { hash } from './draw.js';

const OUTER = RINGS * RING_W + FIRE_W;
const B = 8;                     // размер блока земли

function groundColor(wx, wy) {
  // стихии за огнём — по сторонам
  const d = townDist(wx, wy);
  if (d > OUTER) {
    if (wy > TOWN.y1 + OUTER)      // юг: зыбучий песок
      return ((wx + wy) % 24 < 12) ? '#5a4a30' : '#4e3f28';
    if (wx > TOWN.x1 + OUTER)      // восток: куча мусора
      return ['#221c12', '#2e2618', '#1a160e'][(((wx * 7 + wy * 13) / 8 | 0) % 3 + 3) % 3];
    if (wy < TOWN.y0 - OUTER)      // север: лёд
      return ((wx - wy) % 28 < 14) ? '#aec6d4' : '#98b4c4';
    return ((wx + wy) % 20 < 10) ? '#1e3a14' : '#254a18';   // запад: озеро
  }
  if (d > RINGS * RING_W) return '#160a06';                 // кольцо огня — гарь
  const n = Math.ceil(d / RING_W);
  return SEGMENTS[Math.max(0, n - 1)].palette.ground;
}

// ── земля по вьюпорту: экранные координаты ──
export function drawGround(ctx, camX, camY, vw, vh) {
  const x0 = Math.floor(camX / B) * B, y0 = Math.floor(camY / B) * B;
  for (let wy = y0; wy < camY + vh + B; wy += B) {
    for (let wx = x0; wx < camX + vw + B; wx += B) {
      const d = townDist(wx + 4, wy + 4);
      if (d <= 0) continue;                       // городок блитится поверх
      ctx.fillStyle = groundColor(wx + 4, wy + 4);
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
      // шов между кольцами
      if (d <= RINGS * RING_W && d % RING_W < B) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(wx - camX, wy - camY, B, 1);
      }
    }
  }
}

// ── надписи, тропы и скайлайн — мировые координаты (ctx уже с камерой) ──
export function drawGroundMarks(ctx, cam) {
  ctx.font = '6px "Press Start 2P","VT323",monospace';
  const vis = (x, y, w, h) =>
    x + w > cam.x && x < cam.x + 720 && y + h > cam.y && y < cam.y + 460;

  // подписи эпох: юг и восток; тропы на 4 стороны
  for (const seg of SEGMENTS) {
    const b = southBand(seg.n);
    if (vis(TOWN.x0 + 340, b.y0, 400, 24)) {
      ctx.fillStyle = 'rgba(232,220,200,0.4)';
      ctx.fillText(`§${seg.n} ${seg.name}`, TOWN.x0 + 348, b.y0 + 12);
      ctx.fillStyle = 'rgba(138,141,143,0.35)';
      ctx.fillText(seg.era, TOWN.x0 + 348, b.y0 + 20);
    }
    const ex = TOWN.x1 + (seg.n - 1) * RING_W + 6;
    if (vis(ex, TOWN.y0 + 20, 40, 12)) {
      ctx.fillStyle = 'rgba(232,220,200,0.3)';
      ctx.fillText(`§${seg.n}`, ex, TOWN.y0 + 30);
    }
    const ny = TOWN.y0 - seg.n * RING_W + 6;
    if (vis(TOWN.x0 + 340, ny, 40, 12)) {
      ctx.fillStyle = 'rgba(232,220,200,0.3)';
      ctx.fillText(`§${seg.n}`, TOWN.x0 + 348, ny + 10);
    }
    const wxx = TOWN.x0 - seg.n * RING_W + 6;
    if (vis(wxx, TOWN.y0 + 20, 40, 12)) {
      ctx.fillStyle = 'rgba(232,220,200,0.3)';
      ctx.fillText(`§${seg.n}`, wxx, TOWN.y0 + 30);
    }
  }
  ctx.fillStyle = 'rgba(200,184,160,0.3)';
  const cx = (TOWN.x0 + TOWN.x1) / 2, cy = (TOWN.y0 + TOWN.y1) / 2;
  for (let y = TOWN.y1 + 4; y < TOWN.y1 + RINGS * RING_W; y += 10)
    if (vis(cx, y, 4, 5)) ctx.fillRect(cx - 1, y, 3, 5);
  for (let y = TOWN.y0 - RINGS * RING_W; y < TOWN.y0 - 4; y += 10)
    if (vis(cx, y, 4, 5)) ctx.fillRect(cx - 1, y, 3, 5);
  for (let x = TOWN.x1 + 4; x < TOWN.x1 + RINGS * RING_W; x += 10)
    if (vis(x, cy, 5, 4)) ctx.fillRect(x, cy - 1, 5, 3);
  for (let x = TOWN.x0 - RINGS * RING_W; x < TOWN.x0 - 4; x += 10)
    if (vis(x, cy, 5, 4)) ctx.fillRect(x, cy - 1, 5, 3);

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

  drawSkylineSouth(ctx, vis);
}

// скайлайн юга: доминанты на кромке каждого кольца
function drawSkylineSouth(ctx, vis) {
  const at = (n, off) => ({ x: TOWN.x0 + 360 + off, base: TOWN.y1 + (n - 1) * RING_W + 46 });
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  const S = '#100c08', S2 = '#181209', HOLE = '#050510';
  { const { x, base } = at(1, 60); if (vis(x, base - 90, 260, 100)) {
    R(x, base - 22, 70, 22, S); R(x + 10, base - 38, 50, 38, S);
    R(x + 20, base - 52, 30, 52, S); R(x + 28, base - 64, 14, 64, S);
    R(x + 240, base - 80, 8, 80, S2); } }
  { const { x, base } = at(2, 130); if (vis(x, base - 90, 130, 100)) {
    R(x - 8, base - 8, 116, 8, S2);
    for (let i = 0; i < 5; i++) R(x + i * 22, base - 56, 6, 48, S);
    R(x - 8, base - 62, 116, 6, S2); } }
  { const { x, base } = at(3, 220); if (vis(x, base - 100, 220, 110)) {
    R(x + 10, base - 26, 22, 26, S); R(x + 2, base - 32, 38, 6, S2);
    R(x + 14, base - 50, 14, 18, S); R(x + 8, base - 56, 26, 6, S2);
    R(x + 200, base - 92, 7, 92, S2); R(x + 197, base - 64, 13, 5, S2); } }
  { const { x, base } = at(4, 310); if (vis(x, base - 90, 140, 100)) {
    for (let i = 0; i < 10; i++) R(x + i * 7, base - 26 - ((i * 37) % 9), 4, 26 + ((i * 37) % 9), S);
    R(x + 100, base - 56, 20, 56, S); } }
  { const { x, base } = at(5, 420); if (vis(x, base - 60, 70, 70)) {
    R(x, base - 34, 40, 34, S);
    ctx.fillStyle = S2; ctx.beginPath(); ctx.arc(x + 20, base - 34, 20, Math.PI, 0); ctx.fill();
    R(x + 18, base - 54, 4, 22, '#241c10'); } }
  { const { x, base } = at(6, 540); if (vis(x, base - 100, 190, 110)) {
    R(x, base - 88, 10, 88, S2); R(x + 44, base - 72, 12, 72, S2);
    R(x + 120, base - 44, 54, 44, S); } }
  { const { x, base } = at(7, 660); if (vis(x, base - 90, 200, 100)) {
    R(x, base - 74, 92, 74, S);
    for (let i = 0; i < 9; i++) R(x + i * 10, base - 74, 10, 8 + ((i * 53) % 12), HOLE);
    R(x + 152, base - 60, 4, 60, S2); R(x + 174, base - 60, 4, 60, S2);
    R(x + 146, base - 84, 38, 26, S); } }
  { const { x, base } = at(8, 800); if (vis(x, base - 110, 190, 120)) {
    for (const [bx, bw, bh] of [[x, 46, 96], [x + 58, 38, 72]]) {
      R(bx, base - bh, bw, bh, S);
      for (let r2 = 0; r2 < ((bh - 14) / 12) | 0; r2++)
        for (let c = 0; c < ((bw - 8) / 10) | 0; c++)
          if (((r2 * 7 + c * 13 + bx) % 5) > 2.2)
            R(bx + 5 + c * 10, base - bh + 8 + r2 * 12, 4, 5, 'rgba(255,74,255,0.13)');
    }
    R(x + 160, base - 98, 3, 98, S2); R(x + 173, base - 98, 3, 98, S2);
    R(x + 166, base - 103, 4, 4, '#C23B2B'); } }
  { const { x, base } = at(9, 940); if (vis(x, base - 115, 200, 125)) {
    const gl = ctx.createLinearGradient(x, base - 108, x + 54, base);
    gl.addColorStop(0, 'rgba(122,223,255,0.10)'); gl.addColorStop(1, 'rgba(10,10,24,0.9)');
    ctx.fillStyle = gl; ctx.fillRect(x, base - 108, 54, 108);
    R(x, base - 108, 54, 2, S2); R(x + 26, base - 108, 2, 108, S2);
    R(x + 140, base - 94, 5, 94, S2); R(x + 106, base - 94, 84, 3, S2); } }
}
