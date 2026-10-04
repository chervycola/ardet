// ═══════════════════════════════════════
// КАМЕРЫ НА ЗАПАДНОЙ ТРОПЕ — счёт растёт по кольцам: в неоне одна
// камера смотрит на дорогу, в «сейчас» столб облеплен камерами, и
// у каждой мигает красный глаз. Табличка одна и та же.
// ═══════════════════════════════════════
import { trailPoint, ringAt, RING_W } from './disc.js';
import { free } from './aitraps.js';

const N = '#0D0B0A', K = '#D9CFB8', P = '#8A8D8F', V = '#C23B2B', D1 = '#15100c', D3 = '#2a2620';
const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

// камера: корпус 4×2 на кронштейне, объектив в сторону dir; blink — красный диод
function cam(ctx, x, y, dir, t, phase, blink) {
  R(ctx, x, y + 1, dir > 0 ? 2 : -2, 1, D3);                 // кронштейн
  const bx = dir > 0 ? x + 2 : x - 6;
  R(ctx, bx, y, 4, 2, P); R(ctx, bx, y, 4, 1, K);
  R(ctx, dir > 0 ? bx + 4 : bx - 1, y, 1, 2, N);             // объектив
  if (blink && ((t + phase) % 90) < 45) R(ctx, dir > 0 ? bx : bx + 3, y + 1, 1, 1, V);
}

function plate(ctx, x, y) {                                   // табличка «ВЕДЁТСЯ…»
  R(ctx, x - 4, y, 9, 5, N); R(ctx, x - 3, y + 1, 7, 3, K);
  R(ctx, x - 2, y + 2, 5, 1, P);
}

function drawPole(ctx, loc, t) {
  const x = loc.x + loc.w / 2, gy = loc.y + loc.h, many = loc.camCount > 1;
  R(ctx, x - 4, gy, 9, 2, 'rgba(0,0,0,0.35)');
  R(ctx, x, gy - loc.h + 2, 1, loc.h - 2, D1); R(ctx, x - 1, gy - 2, 3, 2, D1);
  plate(ctx, x, many ? gy - 9 : gy - 14);
  if (!many) { cam(ctx, x + 1, gy - loc.h + 4, 1, t, 0, false); return; }
  // одиннадцать: три яруса во все стороны, наверху две — друг на друга
  const spots = [[-1, 4], [1, 4], [-1, 8], [1, 8], [1, 10], [-1, 12], [1, 14], [-1, 16], [1, 18]];
  spots.forEach(([d, dy], i) => cam(ctx, d > 0 ? x + 1 : x, gy - loc.h + dy + 4, d, t, i * 17, true));
  const top = gy - loc.h + 1;
  R(ctx, x - 7, top + 1, 15, 1, D3);                          // перекладина
  cam(ctx, x - 8, top - 1, 1, t, 3, true);                    // смотрят друг на друга
  cam(ctx, x + 9, top - 1, -1, t, 48, true);
}

const LOOK = {
  1: 'Столб, на нём одна камера. Смотрит на дорогу. Табличка: «ВЕДЁТСЯ ВИДЕОНАБЛЮДЕНИЕ».',
  11: 'Столб, на нём одиннадцать камер. Смотрят во все стороны; две — друг на друга. Табличка внизу: «ВЕДЁТСЯ ВИДЕОНАБЛЮДЕНИЕ». Кем — не указано.',
};

export function buildCameras(locations) {
  for (const [ring, count] of [[8, 1], [9, 11]]) {
    const h = count > 1 ? 34 : 26, w = count > 1 ? 20 : 12;
    for (const dd of [0.5, 0.35, 0.65, 0.2, 0.8]) {
      const p = trailPoint('west', (ring - 1 + dd) * RING_W);
      const box = { x: Math.round(p.x - w / 2), y: Math.round(p.y) - 10 - h, w, h };
      if (ringAt(box.x + w / 2, box.y + h) !== ring || !free(box, locations)) continue;
      locations.push({
        id: `cams_${ring}`, name: count > 1 ? 'столб с камерами' : 'столб с камерой', zone: 'street', ...box,
        look: LOOK[count], camCount: count, drawSelf: drawPole,
      });
      break;
    }
  }
}
