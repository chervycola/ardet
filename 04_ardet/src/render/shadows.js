// ═══════════════════════════════════════
// ТЕНИ — вещи отбрасывают тени по времени суток (world/sky.js).
// Тень — силуэт самой вещи: маска строится один раз из её рисунка
// (плотное и тёмное — да; огонь, свечение и полупрозрачное — нет: огонь
// тени не отбрасывает) и каждый кадр ложится на землю — сдвинута и сжата
// по солнцу: утром на запад, вечером на восток, длинная и густая; в полдень
// короткая, назад; ночью — бледная, от луны. У костра — свои тени: от огня
// прочь, ночью гуще, днём их съедает солнце.
// Два спорящих света (канон Г-10, IRONY_DEVICES): ночью у вещи у костра две
// тени, и в размере они не сходятся. Лунная — неподвижная и честная: какая
// вещь, такая и тень. Костровая — дышащая и преувеличивающая: длиннее и к
// голове шире (свет низкий и близкий — что дальше от земли, то он раздувает
// сильнее), вспыхивает и опадает с пламенем и качается, куда клонится огонь;
// гаснет вместе с его светом — дальний конец бледнее. Свет огня тоже лежит на
// земле (тёплый круг, тени из него вырезаны): у луны свет — мгла, у огня — свеча,
// и спор видно ещё и цветом.
// Две тени от двух светил складываются; тени одного светила друг на друга
// не темнеют (общий слой, одна прозрачность).
// Плоское (кратер, русло, лужа) тени не отбрасывает.
// ═══════════════════════════════════════
const BUILD_PER_FRAME = 6;
const SHADE = [13, 11, 10];                    // НОЧЬ
const FIRE_EXAG = 1.3;                         // костёр преувеличивает: тень длиннее, чем вышло бы по высоте
const FIRE_L_MAX = 2.8;                        // но не до края кадра
const FIRE_GROW = 0.35;                        // к голове шире (у самого огня — почти на столько)
const GROW_H = 40;                             // на какой высоте раздувает в полную силу
const FIRE_BREATH = 0.12;                      // дыхание: длина и рост гуляют с пламенем
const FIRE_REACH = 1.25;                       // докуда достаёт свет огня (в долях радиуса теней)
const CANDLE = '226,138,58';                   // СВЕЧА — свет огня на земле
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

// костровая тень вещи: { dx, dy, grow } — куда и насколько длинна (на точку высоты) и
// на сколько шире к голове; null — вещь далеко от огня или в самом огне.
// От огня прочь: направление — от костра к подножию вещи; ближе к огню — длиннее;
// огонь вспыхнул (breath → 1) — тень выросла, опал — съёжилась
export function fireCast(m, ox, oy, fire) {
  const bx = m.x0 + ox + m.w / 2, by = m.base + oy;
  const ex = bx - fire.x, ey = by - fire.y, d = Math.hypot(ex, ey);
  if (d <= 6 || d >= fire.r) return null;
  const br = 1 + FIRE_BREATH * (fire.breath || 0);
  const L = Math.min(FIRE_L_MAX, (0.9 + 16 / Math.max(10, d)) * FIRE_EXAG) * br;
  // по глубине — не тоньше трети длины: иначе тень сбоку от огня сплющится в линию
  const dx = ex / d * L, dy = (ey > 2 ? 1 : -1) * Math.max(Math.abs(ey / d) * 0.6, 0.32) * L;
  return { dx, dy, grow: FIRE_GROW * (0.4 + 0.6 * (1 - d / fire.r)) * br };
}

// тень, растущая к голове: маска — полосами по высоте, каждая шире нижней
// (grow — на сколько шире на высоте GROW_H; низ остаётся у подножия как есть).
// [{ tr, v0, v1 }] — преобразование холста и строки маски [v0, v1)
export function grownBands(m, ox, oy, dx, dy, grow, camX, camY) {
  const H = m.base - m.y0, n = Math.max(1, Math.min(8, Math.round(m.h / 8))), cx = m.w / 2;
  const out = [];
  for (let k = 0; k < n; k++) {
    const v0 = Math.floor(k * m.h / n), v1 = Math.floor((k + 1) * m.h / n);
    if (v1 <= v0) continue;
    const S = 1 + grow * Math.min(1.2, Math.max(0, H - (v0 + v1) / 2) / GROW_H);
    // полосы заходят друг на друга на строку — на стыках без швов (слой непрозрачный, двойного нет)
    out.push({ tr: [S, 0, -dx, -dy, m.x0 + ox + cx * (1 - S) + dx * H - camX, m.base + oy + dy * H - camY], v0: Math.max(0, v0 - 1), v1 });
  }
  return out;
}

// докуда достаёт тень (для отсечения); pad — запас вбок (тень шире вещи)
function reaches(m, ox, oy, dx, dy, camX, camY, vw, vh, pad = 0) {
  const H = m.base - m.y0;
  const x0 = m.x0 + ox + Math.min(0, dx * H) - pad, x1 = m.x0 + ox + m.w + Math.max(0, dx * H) + pad;
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
// sun: { dx, dy, a, wash, washCol }; fire: { x, y, r, a, wash, breath } | null — костёр
// (breath −1…1 — где пламя в своём дыхании; x уже с тем, куда оно клонится).
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
      const f = fireCast(m, c.ox, c.oy, fire);
      if (f && reaches(m, c.ox, c.oy, f.dx, f.dy, camX, camY, vw, vh, m.w * f.grow * 0.6)) {
        for (const b of grownBands(m, c.ox, c.oy, f.dx, f.dy, f.grow, camX, camY)) {
          fireX.setTransform(...b.tr);
          fireX.drawImage(m.canvas, 0, b.v0, m.w, b.v1 - b.v0, 0, b.v0, m.w, b.v1 - b.v0);
        }
        anyFire = true;
      }
    }
  }
  // свет огня — круг вокруг него (за кругом ни света, ни тени огня): всё огненное — только в нём
  const fx = doFire ? fire.x - camX : 0, fy = doFire ? fire.y - camY : 0;
  const R = doFire ? fire.r * FIRE_REACH * (1 + FIRE_BREATH * (fire.breath || 0)) : 0;
  const bx = Math.max(0, Math.floor(fx - R)), by = Math.max(0, Math.floor(fy - R));
  const bw = Math.min(vw, Math.ceil(fx + R)) - bx, bh = Math.min(vh, Math.ceil(fy + R)) - by;
  const inRing = doFire && bw > 0 && bh > 0;
  if (anyFire && inRing) {
    // свет огня гаснет с расстоянием — и тень с ним: у подножия гуще, дальний конец бледнее
    // (стираем обратным кругом: так трогается только круг огня, не весь кадр)
    fireX.setTransform(1, 0, 0, 1, 0, 0);
    fireX.globalCompositeOperation = 'destination-out';
    const gr = fireX.createRadialGradient(fx, fy, 0, fx, fy, R);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
    fireX.fillStyle = gr; fireX.fillRect(bx, by, bw, bh);
    fireX.globalCompositeOperation = 'source-over';
  }
  // всё — в один слой кадра, на землю — один раз. Сначала оба света, потом обе тени:
  // у огня лунная тень не тонет в его свете — спор виден
  outC = layer(outC, vw, vh); outX = outC.getContext('2d');
  outX.setTransform(1, 0, 0, 1, 0, 0); outX.globalAlpha = 1; outX.clearRect(0, 0, vw, vh);
  if (doWash) { outX.globalAlpha = sun.wash; outX.fillStyle = sun.washCol; outX.fillRect(0, 0, vw, vh); outX.globalAlpha = 1; }
  if (inRing && fire.wash > 0.003) {
    // свет огня на земле — тёплый круг: у огня светлее всего, к краю на нет; тени огня из него вырезаны
    const gw = outX.createRadialGradient(fx, fy, 0, fx, fy, R);
    gw.addColorStop(0, `rgba(${CANDLE},${fire.wash})`); gw.addColorStop(0.45, `rgba(${CANDLE},${fire.wash * 0.45})`);
    gw.addColorStop(1, `rgba(${CANDLE},0)`);
    outX.fillStyle = gw; outX.fillRect(bx, by, bw, bh);
    if (anyFire) {
      outX.globalCompositeOperation = 'destination-out';
      outX.drawImage(fireC, bx, by, bw, bh, bx, by, bw, bh);
      outX.globalCompositeOperation = 'source-over';
    }
  }
  if (anySun) { sunX.setTransform(1, 0, 0, 1, 0, 0); outX.globalAlpha = sun.a; outX.drawImage(sunC, 0, 0); }
  if (anyFire && inRing) { outX.globalAlpha = fire.a; outX.drawImage(fireC, bx, by, bw, bh, bx, by, bw, bh); }
  outX.globalAlpha = 1;
  ctx.drawImage(outC, camX, camY);
}

export const _masks = () => masks;
