// ═══════════════════════════════════════
// EDGES — стихии краёв мира: за кольцом огня каждая сторона роняет
// в брейнрот по-своему. Юг — зыбучий песок; север — лёд (трещины по
// экрану, разряжается телефон); запад — токсичное озеро; восток —
// куча мусора. Падения милосердны: мороз/песок/жижа/хлам отпускают
// у костра.
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { X } from '../render/context.js';
import { scaler } from '../render/scaler.js';
import { TOWN, RINGS, RING_W, FIRE_W, WORLD_W, WORLD_H } from './disc.js';
import { crackedGlass } from '../render/metaFx.js';

const OUTER = RINGS * RING_W + FIRE_W;   // 1950 — где кончается огонь

export const EDGE = {
  south: { y0: TOWN.y1 + OUTER, y1: WORLD_H, elem: 'quicksand', name: 'зыбучий песок' },
  east:  { x0: TOWN.x1 + OUTER, x1: WORLD_W, elem: 'junk',      name: 'куча мусора' },
  north: { y1: TOWN.y0 - OUTER, elem: 'ice',  name: 'лёд' },
  west:  { x1: TOWN.x0 - OUTER, elem: 'lake', name: 'токсичное озеро' },
};

let cur = null;      // { elem, depth 0..1 }
let crackTick = 0;

export function edgeState() { return cur; }
export function edgeDepth() { return cur ? cur.depth : 0; }
export function slowFactor() {
  if (!cur) return 1;
  if (cur.elem === 'quicksand') return 1 - cur.depth * 0.72;   // вязнешь
  if (cur.elem === 'lake') return 1 - cur.depth * 0.6;         // жижа
  if (cur.elem === 'junk') return 1 - cur.depth * 0.45;        // завалы
  return 1;                                                    // лёд не держит
}

export function update(player) {
  const px = player.x, py = player.y;
  cur = null;
  if (py > EDGE.south.y0) {
    cur = { elem: 'quicksand', depth: Math.min(1, (py - EDGE.south.y0) / (EDGE.south.y1 - EDGE.south.y0 - 40)) };
  } else if (px > EDGE.east.x0) {
    cur = { elem: 'junk', depth: Math.min(1, (px - EDGE.east.x0) / (EDGE.east.x1 - EDGE.east.x0 - 40)) };
  } else if (py < EDGE.north.y1) {
    cur = { elem: 'ice', depth: Math.min(1, (EDGE.north.y1 - py) / (EDGE.north.y1 - 40)) };
  } else if (px < EDGE.west.x1) {
    cur = { elem: 'lake', depth: Math.min(1, (EDGE.west.x1 - px) / (EDGE.west.x1 - 40)) };
  }
  // лёд: экран трескается по мере глубины
  if (cur && cur.elem === 'ice' && cur.depth > 0.25) {
    if (++crackTick > Math.max(30, 160 - cur.depth * 130)) {
      crackTick = 0;
      crackedGlass.add((Math.random() * scaler.vw) | 0, (Math.random() * scaler.vh * 0.7) | 0);
    }
  }
}

// ── оверлеи стихий (экранные координаты) ──
export function draw(ctx) {
  if (!cur || cur.depth <= 0.02) return;
  const vw = scaler.vw, vh = scaler.vh, d = cur.depth;

  if (cur.elem === 'quicksand') {
    // песок поднимается снизу; мир тонет
    const h = (vh * (0.12 + d * 0.5)) | 0;
    const g = ctx.createLinearGradient(0, vh - h, 0, vh);
    g.addColorStop(0, 'rgba(122,96,52,0)');
    g.addColorStop(1, `rgba(122,96,52,${0.55 + d * 0.4})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, vh - h, vw, h);
    for (let i = 0; i < 14; i++) {                 // рябь песка
      const sx = ((i * 97 + t * (0.4 + d)) % vw) | 0;
      ctx.fillStyle = 'rgba(160,130,80,0.35)';
      ctx.fillRect(sx, vh - ((i * 53) % h) | 0, 6, 1);
    }
  } else if (cur.elem === 'ice') {
    ctx.fillStyle = `rgba(180,210,230,${d * 0.16})`;
    ctx.fillRect(0, 0, vw, vh);
    // разряжается телефон: пиксельная батарейка тает
    const charge = Math.max(0, 1 - d * 1.15);
    const bx = vw - 34, by = 8;
    ctx.fillStyle = 'rgba(10,8,6,0.8)';
    ctx.fillRect(bx - 2, by - 2, 28, 14);
    ctx.strokeStyle = '#e8dcc8'; ctx.lineWidth = 1;
    ctx.strokeRect(bx + 0.5, by + 0.5, 22, 9);
    ctx.fillStyle = '#e8dcc8'; ctx.fillRect(bx + 23, by + 3, 2, 4);
    ctx.fillStyle = charge > 0.3 ? '#e8dcc8' : '#C23B2B';
    if (charge > 0.01) ctx.fillRect(bx + 2, by + 2, (20 * charge) | 0, 6);
    if (charge < 0.3 && (t / 20 | 0) % 2 === 0) {
      ctx.font = '6px "Press Start 2P","VT323",monospace';
      ctx.fillStyle = '#C23B2B';
      ctx.fillText('LOW', bx - 24, by + 9);
    }
  } else if (cur.elem === 'lake') {
    ctx.fillStyle = `rgba(58,255,26,${d * 0.10})`;
    ctx.fillRect(0, 0, vw, vh);
    const h = (vh * (0.08 + d * 0.4)) | 0;         // жижа снизу
    const g = ctx.createLinearGradient(0, vh - h, 0, vh);
    g.addColorStop(0, 'rgba(30,80,20,0)');
    g.addColorStop(1, `rgba(40,110,25,${0.5 + d * 0.4})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, vh - h, vw, h);
    for (let i = 0; i < 8; i++) {                  // пузыри
      const ph = (t * 0.02 + i * 0.7) % 1;
      ctx.fillStyle = `rgba(120,255,80,${(1 - ph) * 0.4 * d})`;
      ctx.fillRect(((i * 131) % vw) | 0, (vh - ph * h) | 0, 2, 2);
    }
  } else if (cur.elem === 'junk') {
    // мусор наступает с краёв экрана
    ctx.fillStyle = `rgba(20,16,10,${d * 0.25})`;
    ctx.fillRect(0, 0, vw, vh);
    const n = (d * 26) | 0;
    for (let i = 0; i < n; i++) {
      const side = i % 2 === 0;
      const jx = side ? ((i * 89) % (vw * 0.18)) : vw - ((i * 89) % (vw * 0.18)) - 6;
      const jy = ((i * 157 + t * 0.2) % vh) | 0;
      ctx.fillStyle = ['#2a241c', '#3a2e1e', '#1c1812'][i % 3];
      ctx.fillRect(jx | 0, jy, 4 + (i % 4), 3 + (i % 3));
    }
  }
}
