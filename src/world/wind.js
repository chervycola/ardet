// ═══════════════════════════════════════
// ВЕТЕР — одна величина на весь мир. Его читают все: дождь и песок,
// дым из труб и пыль из-под ног, флаги, трава, огонь в груди странника,
// струйки кода, звук. Свой ветер ни у кого не заведён.
//   направление и сила плывут медленно (минуты);
//   по земле бегут порывы — полосы посильнее, они идут по ветру,
//   и их видно: волна проходит по траве, а не всё качается разом;
//   погода задаёт силу: ясно — слабый, дождь — средний, песчаная
//   буря — сильный; в круге у костра (вне времени) тише, в огне и
//   за краем — сильнее.
// Сила s: штиль 0 … буря ~1.3. Вектор x, y — «точек за шаг» у земли.
// Шагов 60 в секунду (ровный шаг, main.js).
// ═══════════════════════════════════════
import { RINGS } from './disc.js';

function h2(ix, iy) {
  const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
function noise2(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = h2(ix, iy), b = h2(ix + 1, iy), c = h2(ix, iy + 1), d = h2(ix + 1, iy + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

const ANG0 = Math.random() * Math.PI * 2;    // откуда в этот раз преобладает
let step = 0, base = 0.22, swell = 1, ca = 1, sa = 0;

export const wind = {
  x: 0, y: 0,        // средний вектор (без полос порывов)
  s: 0.22,           // средняя сила
  ang: 0,            // куда дует: 0 — на восток, π/2 — на юг
  phase: 0,          // насколько уехали полосы порывов, в точках

  // погода (состояние, 0..1), кольцо под ногами, в круге ли у костра
  update(weatherState, intensity, ring, inCore) {
    step++;
    // направление гуляет на ±75° вокруг преобладающего, за минуты
    this.ang = ANG0 + (noise2(step / 4200, 3.7) - 0.5) * 2.6;
    ca = Math.cos(this.ang); sa = Math.sin(this.ang);
    // сила: погода, затем место
    let target = 0.1 + 0.3 * noise2(step / 2600, 9.1);
    if (weatherState === 'toxicRain') target = Math.max(target, 0.32 + 0.35 * intensity);
    if (weatherState === 'sandstorm') target = Math.max(target, 0.5 + 0.65 * intensity);
    if (ring === RINGS + 1) target += 0.2;                 // огонь тянет воздух
    if (ring >= RINGS + 2) target = Math.max(target, 0.55); // за краем дует всегда
    if (inCore) target *= 0.55;                            // у костра тише
    base += (target - base) * 0.004;                       // ~4 с на перемену
    // общий набег — весь кадр то сильнее, то слабее (секунды)
    swell = 0.82 + 0.36 * noise2(step / 260, 5.5);
    this.s = base * swell;
    this.x = ca * this.s;
    this.y = sa * this.s;
    // полосы порывов едут по ветру: в штиль медленно, в бурю быстро
    this.phase += 0.5 + base * 2.2;
  },

  // ветер в точке мира: средний × полоса порыва (0.55…1.45)
  at(x, y) {
    const u = x * ca + y * sa - this.phase, v = -x * sa + y * ca;
    const n = noise2(u / 170, v / 300);
    const s = this.s * (0.55 + 0.9 * n * n * (3 - 2 * n));
    return { x: ca * s, y: sa * s, s };
  },
};
