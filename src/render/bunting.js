// ═══════════════════════════════════════
// ФЛАГИ ШУТА — гирлянда от погасшего фонаря к шесту за Шутом, над костром.
// Трос прибит с двух концов и провисает; флажки по очереди — киноварь и
// кость. Ветер вытягивает их по себе и треплет; над огнём тяга задирает
// флажки вверх и дёргает трос; кто пройдёт под низким местом — заденет.
// Рисуется в два прохода по глубине: над огнём — перед костром (флажки
// видно на фоне луны), у шеста — за Шутом (он стоит перед своими флагами).
// Физика — подвес с двумя опорами (world/hang.js).
// ═══════════════════════════════════════
import { hang, drawRope } from '../world/hang.js';
import { wind } from '../world/wind.js';
import { t } from '../core/time.js';

const CIN = '#C23B2B', BONE = '#D9CFB8', ROPE = '#8A8D8F', POLE = '#4a3a2a', POLE_LIT = '#6a5a42';
const POLE_H = 50, SEGS = 16, SLACK = 1.05, LIFT_R = 30;
let geo = null;

export function initBunting(locations) {
  geo = null;
  const lamp = locations.find(l => l.id === 'lantern1');
  const jester = locations.find(l => l.id === 'jester_home');
  const fire = locations.find(l => l.id === 'campfire');
  if (!lamp || !jester) return;
  const a = { x: lamp.x + 9, y: lamp.y + 9 };                    // правый конец перекладины фонаря
  const poleX = jester.x + jester.w + 8, poleBase = jester.y + jester.h - 8;   // шест — за Шутом
  const b = { x: poleX, y: poleBase - POLE_H };
  const span = Math.hypot(b.x - a.x, b.y - a.y);
  const gyA = lamp.y + lamp.h;
  geo = {
    a, b, poleX, poleBase, gyA, gyB: poleBase, len: span * SLACK,
    fireX: fire ? fire.x + 18 : null,                            // середина огня в спрайте костра
    split: jester.x - 2,                                         // правее — уже за Шутом
    front: fire ? fire.y + fire.h + 0.5 : poleBase,              // глубина прохода перед костром
    back: jester.y + jester.h - 0.5,                             // и прохода за Шутом
    box: { x0: Math.min(a.x, b.x) - 8, x1: Math.max(a.x, b.x) + 8, y0: Math.min(a.y, b.y) - 12, y1: poleBase + 2 },
  };
}

// проходы для общего порядка рисования: [{ k — глубина, pass }] (пусто — гирлянды нет)
export const buntingPasses = () => geo ? [{ k: geo.front, pass: 'front' }, { k: geo.back, pass: 'back' }] : [];

export function drawBunting(ctx, cam, vw, vh, pass = 'front') {
  if (!geo) return;
  const B = geo.box;
  if (B.x1 < cam.x || B.x0 > cam.x + vw || B.y1 < cam.y || B.y0 > cam.y + vh) return;
  const h = hang('bunting:jester', geo.a.x, geo.a.y, geo.len, {
    segs: SEGS, pin2: geo.b, gy: geo.gyA, gy2: geo.gyB, sail: 0.05, damp: 0.99, r: 2,
    lift: geo.fireX !== null ? { x: geo.fireX, r: LIFT_R, k: 0.05 } : null,
  });
  const P = h.pts;
  let m = P.findIndex(p => p.x >= geo.split);                   // первая точка за Шутом
  if (m < 0) m = P.length - 1;
  let i0 = 1, i1 = m - 1;
  if (pass === 'back') {
    // шест Шута: жердь (освещённая сторона — к огню) и костяное навершие
    const ph = geo.poleBase - geo.b.y;
    ctx.fillStyle = POLE_LIT; ctx.fillRect(geo.poleX - 1, geo.b.y, 1, ph);
    ctx.fillStyle = POLE; ctx.fillRect(geo.poleX, geo.b.y, 1, ph);
    ctx.fillStyle = BONE; ctx.fillRect(geo.poleX - 2, geo.b.y - 1, 4, 1);
    ctx.globalAlpha = 0.75; drawRope(ctx, P.slice(m), ROPE); ctx.globalAlpha = 1;
    i0 = m; i1 = P.length - 2;
  } else {
    ctx.globalAlpha = 0.75; drawRope(ctx, P.slice(0, m + 1), ROPE); ctx.globalAlpha = 1;
  }
  for (let i = i0; i <= i1; i++) {
    const p = P[i], w = wind.at(p.x, geo.gyA);
    let lean = w.x * 2.4 + Math.sin(t * (0.12 + w.s * 0.3) + i * 1.7) * (0.5 + w.s * 0.9);
    let len = 4;
    if (geo.fireX !== null) {                                    // над огнём флажок задирает тягой
      const d = Math.abs(p.x - geo.fireX);
      if (d < LIFT_R) { const k = 1 - d / LIFT_R; len = Math.round(4 - k * 7.5); lean += Math.sin(t * 0.5 + i) * k * 1.5; }
    }
    if (len === 0) len = 1;
    lean = Math.max(-3.5, Math.min(3.5, lean));
    ctx.fillStyle = i % 2 ? CIN : BONE;
    const n = Math.abs(len), dir = len > 0 ? 1 : -1, px = Math.round(p.x), py = Math.round(p.y);
    for (let r = 0; r < n; r++) {
      const wdt = Math.max(1, 3 - Math.floor(r * 3 / n));
      const sx = Math.round(lean * (r + 1) / n);
      ctx.fillRect(px - 1 + sx + (3 - wdt >> 1), py + dir * (r + 1), wdt, 1);
    }
  }
}

// для тестов
export const _geo = () => geo;
