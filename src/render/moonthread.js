// ═══════════════════════════════════════
// НИТЬ ЛУННОГО — почта без встречи (weave/TROUPE_2026-10-27.md §5). Из поднятой руки
// Лунного одна нить идёт не вверх, а низко: падает к песку и тянется на север, над
// самой землёй, до палатки Старца — там уходит в брезент. Натянута сильнее остальных:
// с той стороны держат. Наблюдатели не встречаются — по нити к палатке изредка бежит
// блеск: показания идут. Странник, перешагнув, задевает нить — она дрожит и
// успокаивается, провиснуть ей не дают.
// Лежит на земле: поверх песка равнины и русел, под всем, что стоит (своя глубина
// в общем порядке рисования — сразу за плоскими местами).
// ═══════════════════════════════════════
import { t } from '../core/time.js';

const AS = '#8A8D8F', BO = '#D9CFB8', NI = '#0D0B0A';
const GLINT_EVERY = 1500, GLINT_RUN = 420;          // кадров: раз в ~25 с блеск идёт ~7 с от равнины к палатке
let geo = null, pluck = null, side = 0;

export function initMoonThread(locations) {
  geo = null; pluck = null; side = 0;
  const tent = locations.find(l => l.id === 'tent'), moon = locations.find(l => l.id === 'nocturnal_home');
  if (!tent || !moon) return;
  const cx = Math.round(moon.x) + 16, y0 = Math.round(moon.y);
  const hand = { x: cx - 12, y: y0 - 6 };            // палец поднятой руки (sprites/npcs/nocturnal.js)
  const foot = { x: cx - 16, y: y0 + 61 };           // нить легла на песок у левой полы
  const end = { x: Math.round(tent.x + tent.w * 0.62), y: Math.round(tent.y + tent.h - 2) };   // в брезент, у самой земли
  const len = Math.hypot(end.x - foot.x, end.y - foot.y);
  geo = {
    hand, foot, end, len, nx: -(end.y - foot.y) / len, ny: (end.x - foot.x) / len,
    box: { x0: Math.min(hand.x, end.x) - 4, x1: Math.max(hand.x, end.x) + 4, y0: Math.min(hand.y, end.y) - 4, y1: Math.max(foot.y, end.y) + 4 },
  };
}

// глубина в общем порядке: после плоских мест (у них y − 1e6), раньше всего, что стоит
export const moonThreadDepth = () => (geo ? -5e5 : null);

// странник перешагнул нить — она дрожит (вызывать каждый кадр с ногами странника)
export function touchMoonThread(px, py) {
  if (!geo) return;
  const { foot, end, len } = geo;
  const u = ((px - foot.x) * (end.x - foot.x) + (py - foot.y) * (end.y - foot.y)) / (len * len);
  if (u < 0 || u > 1) { side = 0; return; }
  const s = Math.sign((px - foot.x) * geo.nx + (py - foot.y) * geo.ny) || side;
  if (side && s !== side) pluck = { t0: t, u };
  side = s;
}

function line(ctx, ax, ay, bx, by, col, alpha, wave) {
  const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay)) | 0;
  ctx.fillStyle = col; ctx.globalAlpha = alpha;
  for (let i = 0; i <= n; i++) {
    const u = n ? i / n : 0;
    ctx.fillRect(Math.round(ax + (bx - ax) * u), Math.round(ay + (by - ay) * u + (wave ? wave(u) : 0)), 1, 1);
  }
  ctx.globalAlpha = 1;
}

export function drawMoonThread(ctx, cam, vw, vh) {
  if (!geo) return;
  const B = geo.box;
  if (B.x1 < cam.x || B.x0 > cam.x + vw || B.y1 < cam.y || B.y0 > cam.y + vh) return;
  const { hand, foot, end } = geo;
  // дрожь после касания: стоячая волна, гаснет; натянута — уходит быстро
  let wave = null;
  if (pluck) {
    const dt = t - pluck.t0, a = 1.6 * Math.exp(-dt / 50);
    if (a < 0.3) pluck = null;
    else wave = u => a * Math.sin(Math.PI * u * 7) * Math.cos(dt * 0.7) * Math.sin(Math.PI * Math.min(1, Math.max(0, u)));
  }
  line(ctx, foot.x, foot.y + 1, end.x, end.y + 1, NI, 0.22, null);        // тень на земле: нить над самой землёй
  line(ctx, foot.x, foot.y, end.x, end.y, AS, 0.62, wave);
  line(ctx, hand.x, hand.y, foot.x, foot.y, AS, 0.45, null);              // от пальцев к песку
  // блеск по длине — роса и серебро, неподвижный
  ctx.fillStyle = BO;
  const n = Math.max(Math.abs(end.x - foot.x), Math.abs(end.y - foot.y)) | 0;
  for (let i = 11; i < n; i += 37) {
    const u = i / n;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(Math.round(foot.x + (end.x - foot.x) * u), Math.round(foot.y + (end.y - foot.y) * u + (wave ? wave(u) : 0)), 1, 1);
  }
  // показания идут: блеск бежит от равнины к палатке
  const ph = t % GLINT_EVERY;
  if (ph < GLINT_RUN) {
    const u = ph / GLINT_RUN, x = foot.x + (end.x - foot.x) * u, y = foot.y + (end.y - foot.y) * u + (wave ? wave(u) : 0);
    ctx.globalAlpha = 0.9 * Math.sin(Math.PI * u);
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    ctx.globalAlpha *= 0.5;
    ctx.fillRect(Math.round(x - (end.x - foot.x) / n), Math.round(y - (end.y - foot.y) / n), 1, 1);
  }
  ctx.globalAlpha = 1;
}
