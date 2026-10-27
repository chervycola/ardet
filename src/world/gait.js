// ═══════════════════════════════════════
// ПОХОДКА СТРАННИКА — шаг, остановка, оборот, оступился (weave/ROADMAP, Г8).
// Канон: «плавучий шаг, наклон в движение, качание — ротоскопная тяжесть вместо аркадной
// резкости» (weave/STYLE_LOCK); «никаких пружин и отскоков», «быстрые анимации — нет»
// (ART_BIBLE); «подол отстаёт от хода и уходит по ветру» (§05).
// · Шаг считается по пройденному пути, не по времени: стоишь — не шагаешь, упёрся — не
//   шагаешь, катишься по льду без руля — скользишь, не перебираешь ногами. Длина шага растёт
//   со скоростью (36 + 10·v точек): ход ≈ 2,5 шага в секунду, бег ≈ 3,5, в песке ≈ 1,7.
// · Остановка: шаг дошагивается до опоры, вес оседает, подол по инерции уходит вперёд и
//   опадает — первым порядком, без перелёта. Покой (calm) копится с остановки: от него
//   начинается дыхание — не с глобального часа.
// · Оборот: видимая сторона (view) идёт к player.face через три четверти, по 45° за пять
//   тиков, последний — за восемь (доворот); кругом — S↔N через бок по ходу, E↔W через лицо.
// · Сесть — сперва обернулся к зрителю, потом садится за ~18 тиков; встаёт за ~12. Ладонь
//   козырьком — тоже после оборота, за восемь тиков.
// · Оступился: вид и ход позы (world/stumble.js) — только наверху (main.js).
// · Ноги в воде, болоте, зыбучем песке, снегу и мху не видны (feet).
// Состояние — на объекте фигуры (player.gait): drawPlayer рисует и своего героя, и тени
// чужих, и маски тени — у тех походки нет, рисунок обходится без неё (sprites/player.js).
// «Меньше движения» — без подскока шага, дыхания и раскачки; оборот и посадка — сразу.
// «Шаг» здесь — шаг ногой; тик — 1/60 с.
// ═══════════════════════════════════════
import { wind } from './wind.js';

export const VIEWS = ['S', 'SE', 'E', 'NE', 'N', 'NW', 'W', 'SW'];  // по кругу: 45° на позицию
export const TURN_HOLD = 5, TURN_LAST = 8;                          // тиков на 45°; доворот
const TELEPORT = 12;                                               // дальше — перенос, не шаг
const HEAVY = { sand: 1, mud: 1, swamp: 1, water: 1, snow: 1 };    // нога вязнет — шаг тяжелее
const SUNK = { water: 1, swamp: 1, sand: 1, snow: 1, moss: 1 };    // ноги не видно: вброд, в зыби, в снегу, во мху

// куда смотрит фигура в игре (sprites/player.js: сидя и с ладонью — лицом к зрителю)
const wantView = p => (p.visor || (p.sit || 0) > 0.5 ? 'S' : (VIEWS.includes(p.face) ? p.face : 'S'));
export function gaitOf(p) {
  if (!p.gait) p.gait = { phase: 0, amp: 0, hem: 0, vx: 0, settle: 0, calm: 0, view: wantView(p), path: [], hold: 0, lx: null, ly: null, sitV: p.sit || 0, visorK: p.visor ? 1 : 0, trip: null, heavy: 0, feet: true, run: 0, glide: 0, red: false };
  return p.gait;
}
// путь между видами по кругу: короче; кругом — S↔N через бок по ходу, E↔W через лицо
export function turnPath(from, to, dir = 1) {
  const a = VIEWS.indexOf(from), b = VIEWS.indexOf(to);
  if (a < 0 || b < 0 || a === b) return [];
  let d = (b - a + 8) % 8;
  if (d === 4) {
    if (from === 'E' || from === 'W') d = from === 'E' ? -4 : 4;    // E→S→W, W→S→E: через лицо
    else d = (from === 'S') === (dir > 0) ? 4 : -4;                 // S→E→N при ходе вправо
  } else if (d > 4) d -= 8;
  const out = [], s = Math.sign(d);
  for (let i = 1; i <= Math.abs(d); i++) out.push(VIEWS[(a + s * i + 8) % 8]);
  return out;
}
// перенос, который не прыжок (шов петли ленты, main.js): точка отсчёта едет вместе с фигурой
export function shiftGait(p, dx, dy) {
  const g = p.gait;
  if (g && g.lx !== null) { g.lx += dx; g.ly += dy; }
}

// раз в тик (ровный шаг 60 Гц), до движения: o — { stepping, surf, trip, reduced }
export function stepGait(p, o = {}) {
  const g = gaitOf(p);
  const x = p.x, y = p.y;
  let d = 0;
  if (g.lx !== null) d = Math.hypot(x - g.lx, y - g.ly);
  const jump = !(d <= TELEPORT);                                   // и NaN — тоже перенос
  g.lx = x; g.ly = y;
  const red = !!o.reduced;
  g.red = red;
  if (jump) {                                                      // перенос: новое место — новое состояние
    d = 0; g.amp = 0; g.hem = 0; g.settle = 0; g.calm = 0;
    g.view = wantView(p); g.path = []; g.sitV = p.sit || 0; g.visorK = p.visor ? 1 : 0;
  }
  g.heavy = HEAVY[o.surf] ? 1 : 0;
  g.feet = !SUNK[o.surf];
  // шаг: по пути; без руля по льду — скольжение
  const stepping = !!o.stepping && d > 0.05;
  g.glide += ((!o.stepping && d > 0.3 ? 1 : 0) - g.glide) * 0.2;
  if (stepping) {
    const L = (36 + 10 * d) * (o.surf === 'ice' ? 0.75 : 1);
    g.phase += d / L;
    g.amp = Math.min(1, g.amp + 0.15);
    g.run += ((d > 3.2 ? 1 : 0) - g.run) * 0.1;
    g.settle = 0;
  } else {
    // дошагать до опоры: пока шаг не дошагнут, он не гаснет; на опоре — вес оседает
    const fr = g.phase - Math.floor(g.phase);
    if (g.amp > 0.05 && fr > 0.02) g.phase = fr > 0.94 ? Math.ceil(g.phase) : g.phase + 0.06;
    else {
      if (g.amp > 0.05) g.settle = 1;
      g.amp = Math.max(0, g.amp - 0.08);
    }
    g.run *= 0.9;
    g.settle = Math.max(0, g.settle - 0.04);
  }
  g.calm = g.amp === 0 && g.settle === 0 && !stepping ? g.calm + 1 : 0;
  // подол: тянется к «ветер − ход», при торможении по инерции уходит вперёд; первым порядком
  const vx = p.vx || 0, ax = vx - g.vx, w = wind.at(x + 6, y + 12);
  g.vx = vx;
  const target = Math.max(-3, Math.min(3, w.x * 2.4 - vx * 0.7 - ax * 5));
  g.hem += (target - g.hem) * (red ? 1 : 0.2);
  if (!(Math.abs(g.hem) < 10)) g.hem = 0;
  // оборот: видимая сторона догоняет сторону в игре
  const want = wantView(p);
  if (red) { g.view = want; g.path = []; }
  else {
    const tail = g.path.length ? g.path[g.path.length - 1] : g.view;
    if (tail !== want) { g.path = turnPath(g.view, want, p.dir || 1); g.hold = 0; }
    if (g.path.length && ++g.hold >= (g.path.length === 1 ? TURN_LAST : TURN_HOLD)) { g.view = g.path.shift(); g.hold = 0; }
  }
  // сесть — когда уже лицом к зрителю, за ~18 тиков; встать — за ~12
  const s = p.sit || 0;
  if (red) g.sitV = s;
  else if (s > g.sitV) { if (g.view === 'S') g.sitV = Math.min(s, g.sitV + 0.06); }
  else g.sitV = Math.max(s, g.sitV - 0.085);
  // ладонь козырьком: поднимается, когда обернулся к зрителю, за восемь тиков; опускается сразу же
  const up = p.visor && g.view === 'S';
  g.visorK = red ? (up ? 1 : 0) : Math.max(0, Math.min(1, g.visorK + (up ? 0.125 : -0.125)));
  g.trip = o.trip || null;
  return g;
}
