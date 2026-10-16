// ═══════════════════════════════════════
// ШОССЕ ГОРОДКА — брошенные машины вдоль трассы (world/town.js): седан,
// малолитражка, фургон, грузовик с кузовом, сгоревший остов, перевёрнутая.
// Краска выгорела до пепла, сепии и кости; стёкла тёмные, где выбиты — блик;
// колёса спущены, иные на дисках или без колеса — кузов осел на угол. И тупик
// за поездом. Свет слева, кромка пеплом справа; перёд — в любую сторону, но
// рисуется заново, а не зеркалится. Контракт: x — середина, gy — линия земли,
// рисунок строго в w×h; v — зерно варианта. Ставит render/townProps.js.
// ═══════════════════════════════════════
const NI = '#0D0B0A', AS = '#8A8D8F';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620';
const BR2 = '#3a2818', L2 = '#b0a284';
// краска кузова: [бок, низ в тени, блик по верху]
const PAINT = [
  ['#525353', '#3a3b3b', '#7c7f80'],                 // пепел
  ['#4a433b', '#332e28', '#6e665a'],                 // сепия
  ['#5f5747', '#433e33', '#8a8070'],                 // выгоревшая кость
  ['#3a3328', '#2a2620', '#5a5244'],                 // бурая
];
export const HIGHWAY_COLORS = [NI, AS, K0, K1, K2, BR2, L2, ...PAINT.flat()];
const q = Math.round;
const r = (c, col, x, y, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
function hh(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// колесо: cx — середина, g — земля; kind: 0 — спущено, 1 — на диске, 2 — нет
function wheel(c, cx, g, kind) {
  if (kind === 2) { r(c, K1, cx - 1, g - 2, 3, 2); r(c, K2, cx - 1, g - 2, 3, 1); return; }   // вместо колеса — кирпич под осью
  if (kind === 1) { r(c, K1, cx - 1, g - 4, 3, 4); r(c, K1, cx - 2, g - 3, 5, 2); r(c, AS, cx, g - 3, 1, 1); return; }   // на диске
  r(c, K0, cx - 1, g - 4, 3, 1); r(c, K0, cx - 2, g - 3, 5, 3); r(c, K0, cx - 3, g - 1, 7, 1);   // спущено — шина расплылась
  r(c, K2, cx - 1, g - 3, 3, 1); r(c, AS, cx, g - 3, 1, 1);
}
// окно: тёмное, у иного блик битого стекла (фургон, грузовик, перевёрнутая)
function pane(c, x, y, w, h, v, k) {
  r(c, K0, x, y, w, h);
  if (hh(v, k, 3) < 0.6) r(c, AS, x + (hh(v, k, 5) * (w - 1) | 0), y, 1, 1);
  if (hh(v, k, 7) < 0.3 && w > 2) r(c, K2, x + 1, y + h - 1, w - 2, 1);
}
// кузов легковой: L — длина, cab — [зад, перёд] кабины снизу, roof — высота
// кабины, f — перёд (1 — вправо); bare — колеса нет, ось на кирпиче
function car(c, X, G, v, L, roof, cab, f, P, bare = false) {
  const x0 = q(X - L / 2), g = q(G), x1 = x0 + L - 1;
  const lo = g - 3, top = g - 8;                                       // порог и линия капота
  for (let x = x0; x <= x1; x++) {
    const end = x === x0 || x === x1;
    r(c, P[0], x, top + (end ? 1 : 0), 1, lo - top + 1 - (end ? 1 : 0));
    r(c, P[1], x, lo, 1, 1);
    r(c, end ? P[1] : P[2], x, top + (end ? 1 : 0), 1, 1);             // по верху — блик
  }
  r(c, P[2], x0, top + 1, 1, lo - top - 2); r(c, AS, x1, top + 2, 1, lo - top - 3);   // свет слева, пепел справа
  // кабина: снизу [зад, перёд], к крыше уже на скосах стёкол; стёкла — по рядам
  const [ra, fa] = f > 0 ? [cab[0], cab[1]] : [L - 1 - cab[1], L - 1 - cab[0]], mid = x0 + q((ra + fa) / 2);
  for (let k = 0; k < roof; k++) {
    const y = top - 1 - k, a = x0 + ra + (f > 0 ? q(k * 0.6) : k + 1), b = x0 + fa - (f > 0 ? k + 1 : q(k * 0.6));
    r(c, k === roof - 1 ? P[2] : P[0], a, y, b - a + 1, 1);
    if (k > 0 && k < roof - 1 && b - a > 4) { r(c, K0, a + 1, y, mid - a - 1, 1); r(c, K0, mid + 1, y, b - mid - 1, 1); }
  }
  if (hh(v, 1, 3) < 0.6) r(c, AS, mid - 2, top - 3, 1, 1);             // блик битого стекла
  if (hh(v, 2, 3) < 0.4) r(c, AS, mid + 2, top - 2, 1, 1);
  // колёсные арки и колёса
  const wr = x0 + 5, wf = x1 - 5, kinds = [hh(v, 11, 13) < 0.25 ? 1 : 0, hh(v, 12, 13) < 0.2 ? 1 : 0];
  if (bare) kinds[f > 0 ? 0 : 1] = 2;
  for (const [cx, kd] of [[wr, kinds[0]], [wf, kinds[1]]]) { r(c, K0, cx - 2, lo - 2, 5, 1); r(c, K0, cx - 3, lo - 1, 7, 2); wheel(c, cx, g, kd); }
  // бампер, фары мёртвые, шов двери, ржа понизу
  r(c, K1, x0 - 1, lo - 2, 2, 2); r(c, K1, x1, lo - 2, 2, 2);
  r(c, AS, f > 0 ? x1 : x0, top + 2, 1, 1); r(c, K1, f > 0 ? x0 : x1, top + 2, 1, 1);
  r(c, P[1], mid, top, 1, lo - top - 1);
  for (let k = 0; k < 4; k++) if (hh(v, k, 17) < 0.6) r(c, BR2, x0 + 2 + q(hh(v, k, 19) * (L - 5)), lo - 1 - (hh(v, k, 21) < 0.5 ? 1 : 0), 2, 1);
}
function sedan(c, X, G, v, f, P) { car(c, X, G, v, 30, 5, [8, 20], f, P, hh(v, 31, 3) < 0.18); }
function hatch(c, X, G, v, f, P) { car(c, X, G, v, 24, 6, [4, 15], f, P, hh(v, 33, 3) < 0.2); }
// фургон: короб, кабина спереди скосом; окно водителя, на борту — пусто
function van(c, X, G, v, f, P) {
  const L = 32, x0 = q(X - L / 2), g = q(G), x1 = x0 + L - 1, lo = g - 3, top = g - 15;
  for (let x = x0; x <= x1; x++) {
    const front = f > 0 ? x1 - x : x - x0, t = front < 4 ? 4 - front : 0;   // скос лобового
    r(c, P[0], x, top + t, 1, lo - top + 1 - t); r(c, P[1], x, lo, 1, 1); r(c, P[2], x, top + t, 1, 1);
  }
  r(c, P[2], x0, top + 1, 1, lo - top - 2); r(c, AS, x1, top + 2, 1, lo - top - 3);
  const wx = f > 0 ? x1 - 9 : x0 + 3;
  pane(c, wx, top + 3, 6, 4, v, 3);
  r(c, P[1], f > 0 ? x1 - 11 : x0 + 10, top + 2, 1, lo - top - 3);       // дверь кабины
  r(c, P[1], x0 + 3, top + 9, L - 6, 1);                                 // молдинг
  if (hh(v, 41, 3) < 0.5) r(c, K0, f > 0 ? x0 + 6 : x1 - 13, top + 3, 8, 10);   // сдвижная дверь откатана — внутри темно
  for (const cx of [x0 + 6, x1 - 6]) { r(c, K0, cx - 2, lo - 2, 5, 1); r(c, K0, cx - 3, lo - 1, 7, 2); wheel(c, cx, g, hh(v, cx, 43) < 0.3 ? 1 : 0); }
  r(c, K1, x0 - 1, lo - 2, 2, 2); r(c, K1, x1, lo - 2, 2, 2); r(c, AS, f > 0 ? x1 : x0, lo - 4, 1, 1);
}
// грузовик: кабина и пустой кузов с бортами
function truck(c, X, G, v, f, P) {
  const L = 42, x0 = q(X - L / 2), g = q(G), x1 = x0 + L - 1, lo = g - 4;
  const cab0 = f > 0 ? x1 - 13 : x0, cab1 = cab0 + 13, top = g - 19;
  for (let x = cab0; x <= cab1; x++) {
    const front = f > 0 ? cab1 - x : x - cab0, t = front < 2 ? 2 - front : 0;
    r(c, P[0], x, top + t, 1, lo - top - t); r(c, P[2], x, top + t, 1, 1);
  }
  pane(c, f > 0 ? cab1 - 6 : cab0 + 2, top + 3, 5, 5, v, 4);
  r(c, P[1], cab0, lo - 1, 14, 1); r(c, P[2], cab0, top + 1, 1, lo - top - 2);
  const b0 = f > 0 ? x0 : cab1 + 1, b1 = f > 0 ? cab0 - 1 : x1;          // кузов
  r(c, K1, b0, lo - 2, b1 - b0 + 1, 2);                                  // рама
  r(c, BR2, b0, lo - 7, b1 - b0 + 1, 5); r(c, L2, b0, lo - 7, b1 - b0 + 1, 1);
  for (let x = b0 + 3; x < b1; x += 6) r(c, K1, x, lo - 6, 1, 4);         // доски бортов
  if (hh(v, 51, 3) < 0.5) r(c, K0, b0 + 4, lo - 6, 6, 4);                // борт выломан
  r(c, AS, b1, lo - 6, 1, 4);
  for (const cx of [x0 + 6, x0 + 14, x1 - 6]) { r(c, K0, cx - 3, lo, 7, 1); wheel(c, cx, g, hh(v, cx, 53) < 0.3 ? 1 : 0); }
}
// сгоревший остов: копоть, стёкол нет — насквозь видно, на дисках, осел
function burnt(c, X, G, v, f) {
  const L = 28, x0 = q(X - L / 2), g = q(G), x1 = x0 + L - 1, lo = g - 3, top = g - 8;
  for (let x = x0; x <= x1; x++) {
    const end = x === x0 || x === x1;
    r(c, hh(x, v, 61) < 0.3 ? BR2 : K1, x, top + (end ? 1 : 0), 1, lo - top - (end ? 1 : 0));
    r(c, K0, x, lo - 1, 1, 1);
    if (hh(x, v, 63) < 0.35) r(c, AS, x, top, 1, 1);                    // пепел по кромке
  }
  const [a, b] = f > 0 ? [x0 + 7, x1 - 8] : [x0 + 7, x1 - 8];
  for (let k = 0; k < 4; k++) {                                          // каркас кабины — стойки без стёкол
    const y = top - 1 - k;
    r(c, K1, a + (k >> 1), y, 1, 1); r(c, K1, b - (k >> 1), y, 1, 1); r(c, K1, q((a + b) / 2), y, 1, 1);
    if (k === 3) r(c, K1, a + 1, y, b - a - 1, 1);
  }
  r(c, K0, x0 + 3, top + 2, L - 6, 2);                                   // салон выгорел — дыра
  for (const cx of [x0 + 5, x1 - 5]) { r(c, K0, cx - 3, lo - 1, 7, 1); wheel(c, cx, g, 1); }
  r(c, NI, x0 + 2, g - 1, L - 4, 1);
}
// перевёрнутая: на крыше, колёса кверху
function upside(c, X, G, v, f, P) {
  const L = 28, x0 = q(X - L / 2), g = q(G), x1 = x0 + L - 1;
  const cab0 = x0 + 7, cab1 = x1 - 8;
  for (let x = cab0; x <= cab1; x++) r(c, P[1], x, g - 3, 1, 3);         // крыша смята о землю
  pane(c, cab0 + 2, g - 3, cab1 - cab0 - 3, 2, v, 5);
  for (let x = x0; x <= x1; x++) {
    const end = x === x0 || x === x1;
    r(c, P[0], x, g - 9, 1, 6 - (end ? 1 : 0)); r(c, P[1], x, g - 4, 1, 1);
    r(c, K1, x, g - 10, 1, 1);                                           // днище — кверху, в тени
  }
  r(c, P[2], x0, g - 8, 1, 4); r(c, AS, x1, g - 8, 1, 3);
  for (const cx of [x0 + 5, x1 - 5]) { r(c, K0, cx - 2, g - 13, 5, 3); r(c, K2, cx - 1, g - 12, 3, 1); r(c, AS, cx, g - 13, 1, 1); }
  r(c, K1, x0 + 7, g - 11, L - 14, 1);                                   // ось
  r(c, AS, f > 0 ? x1 : x0, g - 6, 1, 1);
}

// вид по зерну: { name, w, h, draw(c, x, gy) }
export function carWreck(v) {
  const f = (v / 6 | 0) % 2 ? 1 : -1, P = PAINT[(v >> 2) % PAINT.length], k = v % 6;
  if (v >= 54) return { name: 'брошенный грузовик', w: 44, h: 20, draw: (c, x, g) => truck(c, x, g, v, v % 2 ? 1 : -1, P) };
  if (k === 0 || k === 1) return { name: 'брошенная машина', w: 34, h: 15, draw: (c, x, g) => sedan(c, x, g, v, f, P) };
  if (k === 2) return { name: 'малолитражка', w: 28, h: 16, draw: (c, x, g) => hatch(c, x, g, v, f, P) };
  if (k === 3) return { name: 'фургон', w: 36, h: 17, draw: (c, x, g) => van(c, x, g, v, f, P) };
  if (k === 4) return { name: 'сгоревшая машина', w: 32, h: 13, draw: (c, x, g) => burnt(c, x, g, v, f) };
  return { name: 'перевёрнутая машина', w: 32, h: 14, draw: (c, x, g) => upside(c, x, g, v, f, P) };
}
// тупик: упор из шпал поперёк рельсов, на брусе — полосы
export const bufferStop = {
  name: 'тупик', w: 14, h: 10,
  draw(c, X, G) {
    const x = q(X), g = q(G);
    r(c, K1, x - 5, g - 7, 2, 7); r(c, K1, x + 3, g - 7, 2, 7); r(c, L2, x - 5, g - 7, 1, 7);
    r(c, K2, x - 6, g - 9, 13, 3); r(c, L2, x - 6, g - 9, 13, 1); r(c, AS, x + 6, g - 8, 1, 2);
    for (let k = 0; k < 3; k++) r(c, L2, x - 4 + k * 4, g - 8, 2, 2);
    r(c, BR2, x - 1, g - 6, 3, 3); r(c, K0, x - 6, g - 1, 13, 1);
  },
};
