// ═══════════════════════════════════════
// ОТРАВА ГОРОДКА — трубы от «Ржавого трубопровода» к озеру (world/town.js):
// потоньше большой, ржавые, на бетонных опорах; куски — целый, с задвижкой,
// проломленный (обломок лежит рядом), с течью, колено вниз, сток в озеро.
// Ржа — бурым, местами багровым, как на большой трубе. Свет слева, кромка
// пеплом справа. Контракт: x — середина, gy — линия земли, рисунок строго в
// w×h; v — зерно варианта. Ставит render/townProps.js.
// ═══════════════════════════════════════
const AS = '#8A8D8F', MG = '#3D4A3A';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620';
const BR2 = '#3a2818', L2 = '#b0a284';
const RUST = '#4a3420', RUST_L = '#6b4a2c', BLOOD = '#6b0f1a';       // ржа; багровая — как на большой трубе
const CONC = '#5a5650', CONC_D = '#3e3b36';
export const TOXIC_COLORS = [AS, MG, K0, K1, K2, BR2, L2, RUST, RUST_L, BLOOD, CONC, CONC_D];
const q = Math.round;
const r = (c, col, x, y, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
function hh(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const RISE = 9;                                                       // верх трубы над землёй (ось — на 7)

// столбец трубы: верх — блик, тело — ржа пятнами, низ — тень
function col(c, x, g, v) {
  const t = g - RISE;
  r(c, L2, x, t, 1, 1);
  const h = hh(x, v, 3);
  r(c, h < 0.18 ? BLOOD : h < 0.55 ? RUST : RUST_L, x, t + 1, 1, 2);
  if (hh(x, v, 5) < 0.2) r(c, BR2, x, t + 2, 1, 1);
  r(c, K1, x, t + 3, 1, 1);
}
function support(c, x, g) {                                           // бетонная опора и хомут
  r(c, CONC, x - 1, g - 4, 4, 4); r(c, L2, x - 1, g - 4, 1, 1); r(c, CONC_D, x + 2, g - 3, 1, 3);
  r(c, K1, x - 1, g - 5, 4, 1);
}
function flange(c, x, g) {                                            // фланец — кольцо пошире
  r(c, K2, x, g - RISE - 1, 1, 6); r(c, L2, x, g - RISE - 1, 1, 1); r(c, AS, x, g - RISE + 4, 1, 1);
}

// кусок трубы: L — длина; kind — pipe, valve, broken, leak, outlet
function piece(c, X, G, L, v, kind) {
  const x0 = q(X - L / 2), g = q(G), x1 = x0 + L - 1, t = g - RISE;
  const gap = kind === 'broken' ? [x0 + q(L * 0.38), x0 + q(L * 0.62)] : null;
  for (let x = x0; x <= x1; x++) {
    if (gap && x >= gap[0] && x <= gap[1]) continue;
    if (gap && (x === gap[0] - 1 || x === gap[1] + 1) && hh(x, v, 7) < 0.5) { r(c, RUST, x, t + 1, 1, 2); continue; }   // рваный край
    col(c, x, g, v);
  }
  support(c, x0 + 3, g); support(c, x1 - 4, g);
  flange(c, x0, g);
  if (kind !== 'outlet') flange(c, x1, g);
  if (kind === 'valve') {                                             // задвижка: шток и маховик
    const m = q((x0 + x1) / 2);
    r(c, K1, m, t - 3, 1, 3); r(c, K2, m - 3, t - 5, 7, 2); r(c, L2, m - 3, t - 5, 3, 1); r(c, AS, m + 3, t - 4, 1, 1);
    r(c, K1, m - 1, t - 4, 3, 1);
  }
  if (gap) {                                                          // обломок лежит у опоры
    const fx = gap[0] + 1, fl = gap[1] - gap[0] - 2;
    r(c, RUST, fx, g - 3, fl, 2); r(c, L2, fx, g - 3, fl, 1); r(c, K1, fx, g - 1, fl, 1);
    r(c, BLOOD, fx + 1, g - 2, 1, 1);
  }
  if (kind === 'leak') {                                              // течь: дыра, потёк вниз
    const m = x0 + q(L * 0.55);
    r(c, K0, m, t + 1, 2, 1);
    for (let k = 0; k < 4; k++) r(c, k < 2 ? MG : K1, m + (k > 2 ? 1 : 0), t + 4 + k, 1, 1);
  }
  if (kind === 'outlet') {                                            // сток: открытый зев, натёк
    r(c, K0, x1, t, 1, 4); r(c, K0, x1 + 1, t + 1, 1, 2); r(c, RUST_L, x1, t - 1, 1, 1);
    r(c, MG, x1 + 1, t + 3, 1, 2); r(c, K1, x1 + 2, g - 3, 2, 2);
  }
}
// колено: труба уходит вниз, к ближнему ряду — по экрану столбом; H — на сколько ближе
function elbow(c, X, G, H) {
  const x = q(X), g = q(G), t0 = g - H - RISE, t1 = g - RISE;
  for (let y = t0; y <= t1 + 3; y++) {
    r(c, L2, x - 2, y, 1, 1); r(c, hh(x, y, 11) < 0.2 ? BLOOD : RUST, x - 1, y, 2, 1); r(c, K1, x + 1, y, 1, 1);
  }
  r(c, K2, x - 3, t0 - 1, 6, 1); r(c, K2, x - 3, t1 + 4, 6, 1);       // хомуты на изгибах
  support(c, x - 1, g); support(c, x - 1, g - H);
}

// виды: { name, w, h, draw(c, x, gy) }
export function pipePiece(kind, v, L = 32) {
  const name = { pipe: 'ржавая труба', valve: 'задвижка', broken: 'проломленная труба', leak: 'труба с течью', outlet: 'сток в озеро' }[kind];
  return { name, w: L + 4, h: RISE + 6, draw: (c, x, g) => piece(c, x, g, L, v, kind) };
}
export function pipeElbow(H) {
  return { name: 'колено трубы', w: 8, h: H + RISE + 2, draw: (c, x, g) => elbow(c, x, g, H) };
}
