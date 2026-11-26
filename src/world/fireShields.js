// ═══════════════════════════════════════
// ПОЖАРНЫЙ ЩИТ № 1 (пул FOLK, образ: «край, у выхода любой радиальной дороги — поодаль от костра Шута: сцену
// Шута не трогаем»). Огонь держит край наружу (world/jesterFire.js) — у выхода остальных дорог, где упираешься в
// жар, стоит щит: багор, конусное ведро, лопата — по нарисованным контурам, ящик с песком. Ведро полное, песок
// сухой: мир соблюдает, значит, не сдался. Каждый — «№ 1». Север, восток, запад (п); юг — костёр Шута.
// ═══════════════════════════════════════
import { trailPoint, warpedDist, RINGS_D } from './disc.js';
import { kitKind, MAT, tone } from '../sprites/arch/kit.js';
import { free } from './recount.js';

const W = 26, H = 30;
const board = kitKind(W, H, (P, M) => {
  P.box(1, 2, 18, 26, M.FALU);                                   // щит — доски, крашенные киноварью
  P.box(0, 0, 20, 2, M.TIMBER);                                  // козырёк
  P.box(19, 21, 7, 9, M.BOARD);                                  // ящик с песком
}, { seed: 401, chip: 0.05, ao: 1 });
// трафарет 3×5: «№1»
const STENCIL = [['#.#', '##.', '#.#', '#.#', '#.#'], ['.#', '##', '.#', '.#', '.#']];
function drawShield(ctx, l) {
  const cx = l.x + (l.w >> 1), gy = l.y + l.h, x = l.x, y = l.y;
  board(ctx, cx, gy);
  const ink = tone(MAT.FALU, 0), steel = tone(MAT.IRON, 3), red = '#C23B2B', sand = tone(MAT.SAND, 4), bone = '#D9CFB8';
  ctx.fillStyle = ink;                                           // контуры инструмента — нарисованы на досках
  ctx.fillRect(x + 3, y + 5, 1, 18); ctx.fillRect(x + 8, y + 5, 1, 7); ctx.fillRect(x + 15, y + 5, 1, 7); ctx.fillRect(x + 9, y + 25, 4, 1);
  ctx.fillStyle = steel;                                         // багор: древко и крюк
  ctx.fillRect(x + 4, y + 5, 1, 18); ctx.fillRect(x + 5, y + 5, 2, 1); ctx.fillRect(x + 6, y + 6, 1, 1);
  ctx.fillStyle = red;                                           // конусное ведро — полное
  for (let j = 0; j < 6; j++) ctx.fillRect(x + 9 + (j >> 1), y + 6 + j, 6 - (j >> 1) * 2, 1);
  ctx.fillStyle = tone(MAT.WARSHIP, 1); ctx.fillRect(x + 9, y + 6, 6, 1);
  ctx.fillStyle = steel; ctx.fillRect(x + 11, y + 14, 1, 8); ctx.fillRect(x + 10, y + 22, 3, 3);   // лопата
  ctx.fillStyle = bone;                                          // трафарет «№1»
  let sx = x + 9;
  for (const g of STENCIL) { for (let j = 0; j < 5; j++) for (let i = 0; i < g[j].length; i++) if (g[j][i] === '#') ctx.fillRect(sx + i, y + 21 + j, 1, 1); sx += g[0].length + 1; }
  ctx.fillStyle = sand; ctx.fillRect(x + 20, y + 21, 5, 1);     // песок сухой
}
const LOOK = 'Дощатый щит, выкрашенный киноварью. Инструмент — по нарисованным контурам: багор, конусное ведро, лопата. Рядом ящик с песком. Ведро полное, песок сухой. Трафарет: «ЩИТ ПОЖАРНЫЙ № 1. ОТВЕТСТВЕННЫЙ: —».';

// точка тропы стороны, где кольцо — на глубине D (кромки рваные)
function trailAt(side, D) {
  let lo = D - 400, hi = D + 400;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, p = trailPoint(side, m); if (warpedDist(p.x, p.y) < D) lo = m; else hi = m; }
  return trailPoint(side, (lo + hi) / 2);
}
export function buildFireShields(locations) {
  const out = [];
  for (const side of ['north', 'east', 'west']) {
    for (const [D, off] of [[RINGS_D - 40, 30], [RINGS_D - 40, -30 - W], [RINGS_D - 70, 30], [RINGS_D - 70, -30 - W]]) {
      const p = trailAt(side, D);
      const box = side === 'north' || side === 'south'
        ? { x: Math.round(p.x + off), y: Math.round(p.y) - H, w: W, h: H }
        : { x: Math.round(p.x) - (W >> 1), y: Math.round(p.y + off * 0.6) - H, w: W, h: H };
      if (warpedDist(box.x + W / 2, box.y + H) > RINGS_D - 4 || !free(box, locations)) continue;
      const l = { id: `fire_shield_${side}`, name: 'Пожарный щит № 1', zone: 'street', ...box, look: LOOK, drawSelf: drawShield };
      out.push(l); locations.push(l);
      break;
    }
  }
  return out;
}
