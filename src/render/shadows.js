// ═══════════════════════════════════════
// ТЕНИ — вещи отбрасывают тени по времени суток (world/sky.js).
// Тень — силуэт самой вещи: маска строится один раз из её рисунка
// (плотное и тёмное — да; огонь, свечение и полупрозрачное — нет: огонь
// тени не отбрасывает) и каждый кадр ложится на землю — сдвинута и сжата
// по солнцу: утром на запад, вечером на восток, длинная и густая; в полдень
// короткая, назад; ночью — бледная, от луны. У костра — свои тени: от огня
// прочь, ночью гуще, днём их съедает солнце.
// Две тени от двух светил складываются; тени одного светила друг на друга
// не темнеют (общий слой, одна прозрачность).
// Плоское (кратер, русло, лужа) тени не отбрасывает.
// ═══════════════════════════════════════
const BUILD_PER_FRAME = 6;
const SHADE = [13, 11, 10];                    // НОЧЬ
const masks = new Map();
let sunC = null, sunX = null, fireC = null, fireX = null, outC = null, outX = null;

function layer(c, vw, vh) {
  if (!c) c = document.createElement('canvas');
  if (c.width !== vw || c.height !== vh) { c.width = vw; c.height = vh; }
  return c;
}

// маска: рисунок вещи в области [x0, x0+w) × [y0, base) → силуэт цвета ночи
export function maskFrom(draw, x0, y0, w, base) {
  const h = Math.ceil(base - y0);
  if (w <= 0 || h <= 0) return null;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.translate(-x0, -y0);
  draw(g);
  const im = g.getImageData(0, 0, w, h), d = im.data;
  let any = false;
  for (let i = 0; i < d.length; i += 4) {
    const fire = d[i] > 200 && d[i + 2] < 90;                  // огонь и свеча тени не отбрасывают
    if (d[i + 3] > 150 && !fire) { d[i] = SHADE[0]; d[i + 1] = SHADE[1]; d[i + 2] = SHADE[2]; d[i + 3] = 255; any = true; }
    else d[i + 3] = 0;
  }
  if (!any) return null;
  const out = document.createElement('canvas'); out.width = w; out.height = h;
  out.getContext('2d').putImageData(im, 0, 0);
  return { canvas: out, x0, y0, base, w, h };
}

// куда ляжет маска: точка (u, v) маски — высота H = base − (y0 + v) над землёй;
// тень в мире: (x0 + u + dx·H, base + dy·H). Возвращает преобразование холста.
export function shadowTransform(m, ox, oy, dx, dy, camX, camY) {
  const H = m.base - m.y0;
  return [1, 0, -dx, -dy, m.x0 + ox + dx * H - camX, m.base + oy + dy * H - camY];
}

// докуда достаёт тень (для отсечения)
function reaches(m, ox, oy, dx, dy, camX, camY, vw, vh) {
  const H = m.base - m.y0;
  const x0 = m.x0 + ox + Math.min(0, dx * H), x1 = m.x0 + ox + m.w + Math.max(0, dx * H);
  const y0 = m.base + oy + Math.min(0, dy * H), y1 = m.base + oy + Math.max(0, dy * H) + 1;
  return x1 > camX && x0 < camX + vw && y1 > camY && y0 < camY + vh;
}

function maskOf(c, budget) {
  if (masks.has(c.key)) return masks.get(c.key);
  if (budget.n <= 0) return undefined;
  budget.n--;
  const m = c.build();
  masks.set(c.key, m);
  return m;
}

// тени кадра. casters: [{ key, ox, oy, build, noFire, fx, fy }] — build() строит маску
// (один раз), ox/oy — сдвиг маски в мире (странник ходит; дома стоят на нуле).
// sun: { dx, dy, a, wash, washCol }; fire: { x, y, r, a } | null — костёр.
// Свет светила кладётся на землю тонким слоем, тени из него вырезаны — так
// тень читается и на тёмной земле.
export function castShadows(ctx, camX, camY, vw, vh, casters, sun, fire) {
  const budget = { n: BUILD_PER_FRAME };
  const doSun = sun && sun.a > 0.005, doFire = fire && fire.a > 0.005;
  const doWash = sun && sun.wash > 0.003;
  if (!doSun && !doFire && !doWash) return;
  if (doSun) { sunC = layer(sunC, vw, vh); sunX = sunC.getContext('2d'); sunX.setTransform(1, 0, 0, 1, 0, 0); sunX.clearRect(0, 0, vw, vh); sunX.imageSmoothingEnabled = false; }
  if (doFire) { fireC = layer(fireC, vw, vh); fireX = fireC.getContext('2d'); fireX.setTransform(1, 0, 0, 1, 0, 0); fireX.clearRect(0, 0, vw, vh); fireX.imageSmoothingEnabled = false; }
  let anySun = false, anyFire = false;
  for (const c of casters) {
    const m = maskOf(c, budget);
    if (!m) continue;
    if (doSun && reaches(m, c.ox, c.oy, sun.dx, sun.dy, camX, camY, vw, vh)) {
      sunX.setTransform(...shadowTransform(m, c.ox, c.oy, sun.dx, sun.dy, camX, camY));
      sunX.drawImage(m.canvas, 0, 0);
      anySun = true;
    }
    if (doFire && !c.noFire) {
      // от огня прочь: направление — от костра к подножию вещи; ближе к огню — длиннее
      const bx = m.x0 + c.ox + m.w / 2, by = m.base + c.oy;
      const ex = bx - fire.x, ey = by - fire.y, d = Math.hypot(ex, ey);
      if (d > 6 && d < fire.r) {
        const L = Math.min(2.2, 0.9 + 16 / Math.max(10, d));
        // по глубине — не тоньше трети длины: иначе тень сбоку от огня сплющится в линию
        const fdx = ex / d * L, fdy = (ey > 2 ? 1 : -1) * Math.max(Math.abs(ey / d) * 0.6, 0.32) * L;
        if (reaches(m, c.ox, c.oy, fdx, fdy, camX, camY, vw, vh)) {
          fireX.globalAlpha = 1 - d / fire.r;                  // дальше от огня — бледнее
          fireX.setTransform(...shadowTransform(m, c.ox, c.oy, fdx, fdy, camX, camY));
          fireX.drawImage(m.canvas, 0, 0);
          anyFire = true;
        }
      }
    }
  }
  // всё — в один слой кадра (свет, поверх тени светила, поверх тени огня), на землю — один раз
  outC = layer(outC, vw, vh); outX = outC.getContext('2d');
  outX.setTransform(1, 0, 0, 1, 0, 0); outX.globalAlpha = 1; outX.clearRect(0, 0, vw, vh);
  if (doWash) { outX.globalAlpha = sun.wash; outX.fillStyle = sun.washCol; outX.fillRect(0, 0, vw, vh); }
  if (anySun) { sunX.setTransform(1, 0, 0, 1, 0, 0); outX.globalAlpha = sun.a; outX.drawImage(sunC, 0, 0); }
  if (anyFire) { fireX.setTransform(1, 0, 0, 1, 0, 0); fireX.globalAlpha = 1; outX.globalAlpha = fire.a; outX.drawImage(fireC, 0, 0); }
  outX.globalAlpha = 1;
  ctx.drawImage(outC, camX, camY);
}

export const _masks = () => masks;
