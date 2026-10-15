// ═══════════════════════════════════════
// РИСУНОК РАСТИТЕЛЬНОСТИ (раскладка — world/flora.js). Дерево — силуэт
// мглой с лунной кромкой слева, как постройки эпох; ствол — бурым, береза
// — костью в чёрных штрихах; на севере с третьего кольца — снег на кронах.
// Вид × вариант рисуется один раз в свой холст: снизу ствол, сверху крона;
// крону ведёт ветер (сдвиг на точку-другую, гибкие — сильнее), ствол стоит.
// Камыш — стеблями, гнётся по ветру, как трава. Тень — по солнцу, одна
// маска на вид и вариант (тень вещей — render/shadows.js).
// ═══════════════════════════════════════
import { SIZE } from '../world/flora.js';
import { wind } from '../world/wind.js';

const N = '#0D0B0A', K = '#D9CFB8', P = '#8A8D8F';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K3 = '#34302a', L2 = '#b0a284';
const FD = '#252c22', FB = '#33402f', FM = '#3D4A3A', FL = '#5d675a';   // листва: тень, тело, мгла, лунная кромка
const FS = '#4f5444', FSL = '#7a7a66';                                 // сухая листва юга: тело, кромка
const BARK = '#2e2216';

function R(c, col, x, y, w, h) { c.fillStyle = col; c.fillRect(x, y, w, h); }
const q = Math.round;
function hh(x, y, s) { let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

// крона-ком: неровный эллипс (cx, cy, rx, ry), свет слева сверху, тень справа снизу;
// листва точками; col — { d, b, l } тень/тело/кромка; snow — снег по верху
function blob(c, cx, cy, rx, ry, v, col, snow) {
  for (let y = -ry - 2; y <= ry + 2; y++) for (let x = -rx - 2; x <= rx + 2; x++) {
    const a = Math.atan2(y / ry, x / rx), lump = 1 + 0.16 * Math.sin(3 * a + v * 1.7) + 0.09 * Math.sin(5 * a + v * 2.3) + 0.08 * (hh(x + 9, y + 7, v) - 0.5);
    const e = (x / rx) ** 2 + (y / ry) ** 2;
    if (e > lump * lump) continue;
    const s = (-x / rx * 0.7 - y / ry * 0.7);                     // к свету (слева сверху)
    const rim = e > (lump - 0.22) * (lump - 0.22);
    let k = s > 0.55 ? col.l : s < -0.35 ? col.d : (hh(x, y, v + 3) < 0.28 ? col.d : col.b);
    if (rim && s > 0.1) k = col.l;
    if (snow && y < -ry * 0.35 && s > -0.2 && hh(x, y, v + 5) < 0.75) k = K;
    R(c, k, q(cx + x), q(cy + y), 1, 1);
  }
}
const LEAF = { d: FD, b: FB, l: FL }, DRY = { d: FD, b: FS, l: FSL };

// ── виды: c — холст, x — середина, g — земля, v — вариант 0…5 ──
const DRAW = {
  oak(c, x, g, v, snow) {
    const h = 13 + (v % 3);
    R(c, BARK, x - 1, g - h, 3, h); R(c, K1, x - 3, g - 2, 7, 2); R(c, P, x - 1, g - h + 2, 1, h - 4);   // ствол, корни, кромка
    R(c, BARK, x - 5, g - h - 1, 4, 1); R(c, BARK, x + 2, g - h, 4, 1);                                 // сучья
    blob(c, x - 4 + (v % 2), g - h - 7, 7, 6, v, LEAF, snow);
    blob(c, x + 5, g - h - 6, 6, 5, v + 1, LEAF, snow);
    blob(c, x, g - h - 12, 8, 6, v + 2, LEAF, snow);
  },
  birch(c, x, g, v, snow) {
    const h = 26 + (v % 3) * 2, lean = v % 2 ? 1 : -1;
    for (let y = 0; y < h - 6; y++) {
      const bx = x + q(lean * y * y / (h * h) * 3);
      R(c, K, bx, g - y - 1, 2, 1);
      if (hh(v, y, 9) < 0.22) R(c, N, bx + (y & 1), g - y - 1, 1, 1);        // чёрные штрихи по бересте
    }
    R(c, P, x + 1, g - h + 6, 1, h - 8);
    const tx = x + lean * 3;
    blob(c, tx - 2, g - h + 6, 5, 6, v, LEAF, snow);
    blob(c, tx + 3, g - h + 9, 4, 5, v + 1, LEAF, snow);
    for (let k = 0; k < 4; k++) R(c, FL, tx - 4 + k * 3, g - h + 12 + (k & 1) * 3, 1, 3);   // свисающие ветки
  },
  spruce(c, x, g, v, snow) {
    const h = 26 + (v % 3) * 3;
    R(c, BARK, x, g - 3, 2, 3);
    for (let y = 3; y < h; y++) {
      const t = (y - 3) / (h - 3), tier = (y - 3) % 6;
      const w = Math.max(1, q((1 - t) * 7.5 - tier * 0.35 + 0.5));
      R(c, FD, x + 1 - w, g - y - 1, 2 * w, 1);
      R(c, FL, x + 1 - w, g - y - 1, 1, 1);                                    // кромка слева — луной
      if (tier === 5 && w > 2) R(c, FB, x + 1 - w, g - y - 1, w, 1);
      if (snow && tier >= 4 && w > 1) R(c, K, x + 1 - w, g - y - 1, w + (tier === 5 ? 1 : 0), 1);
    }
    if (snow) R(c, K, x, g - h - 1, 2, 1);
  },
  pine(c, x, g, v, snow) {
    // сосна востока: кривой ствол, крона плоскими подушками ярусами
    const h = 16 + (v % 3) * 2;
    let bx = x;
    for (let y = 0; y < h; y++) { bx = x + q(Math.sin(y * 0.22 + v) * 2.2); R(c, BARK, bx, g - y - 1, 2, 1); }
    R(c, P, bx, g - h, 1, 3);
    blob(c, bx - 4, g - h - 2, 8, 2, v, LEAF, snow);
    blob(c, bx + 6, g - h + 4, 6, 2, v + 1, LEAF, snow);
    blob(c, bx - 1, g - h - 6, 5, 2, v + 2, LEAF, snow);
  },
  cypress(c, x, g, v, snow) {
    const h = 24 + (v % 3) * 3;
    R(c, BARK, x, g - 2, 1, 2);
    for (let y = 2; y < h; y++) {
      const t = (y - 2) / (h - 2), w = Math.max(1, q(3.4 * Math.sin(Math.PI * Math.pow(t, 0.75)) + 0.3));
      R(c, FD, x - w + 1, g - y - 1, 2 * w - 1, 1);
      if (w > 1) R(c, FL, x - w + 1, g - y - 1, 1, 1);
      if (hh(v, y, 4) < 0.3 && w > 2) R(c, FB, x - w + 2, g - y - 1, 1, 1);
    }
  },
  palm(c, x, g, v, snow) {
    const h = 22 + (v % 3) * 3, lean = (v % 2 ? 1 : -1) * (2 + v % 3);
    let tx = x, ty = g;
    for (let y = 0; y < h; y++) {
      tx = x + q(lean * (y / h) ** 2 * 2); ty = g - y - 1;
      R(c, y % 3 === 0 ? K1 : BARK, tx, ty, 2, 1);                              // ствол кольцами
      if (y % 3 === 0) R(c, P, tx, ty, 1, 1);
    }
    // листья веером: дугой вверх и вниз, по свету — кромка
    const leaves = [[-9, -2], [-7, -5], [-3, -7], [3, -7], [7, -5], [9, -2], [-5, 1], [5, 1]];
    for (const [lx, ly] of leaves) {
      const n = 9;
      for (let k = 1; k <= n; k++) {
        const t = k / n, px = tx + 1 + q(lx * t), py = ty + q(ly * t + 5 * t * t);
        R(c, k > n - 2 ? FD : FB, px, py, 1, 1);
        if (lx < 0 && k % 2) R(c, FSL, px, py - 1, 1, 1);
      }
    }
    R(c, K1, tx, ty + 1, 3, 2);
  },
  olive(c, x, g, v, snow) {
    // олива: низкая, ствол перекручен надвое, крона серебром — плоско
    R(c, BARK, x - 2, g - 6, 2, 6); R(c, BARK, x + 1, g - 7, 2, 7); R(c, K1, x - 3, g - 1, 7, 1);
    R(c, P, x - 2, g - 6, 1, 4);
    blob(c, x - 3, g - 10, 6, 3, v, { d: FD, b: '#4c5248', l: P }, snow);
    blob(c, x + 4, g - 11, 5, 3, v + 1, { d: FD, b: '#4c5248', l: P }, snow);
  },
  bamboo(c, x, g, v, snow) {
    const n = 4 + (v % 3);
    for (let k = 0; k < n; k++) {
      const bx = x - 6 + q(k * 12 / n) + (k & 1), h = 20 + q(hh(v, k, 3) * 12), bend = (hh(v, k, 5) - 0.5) * 3;
      for (let y = 0; y < h; y++) {
        const px = bx + q(bend * (y / h) ** 2);
        R(c, y % 5 === 0 ? FD : (k % 2 ? FL : FB), px, g - y - 1, 1, 1);
        if (y > h * 0.45 && y % 4 === 1) { const s = k % 2 ? 1 : -1; R(c, FB, px + s, g - y - 2, 1, 1); R(c, FB, px + 2 * s, g - y - 3, 1, 1); }   // листья наискось
      }
    }
  },
  willow(c, x, g, v, snow) {
    R(c, BARK, x - 1, g - 9, 3, 9); R(c, K1, x - 2, g - 1, 5, 1); R(c, P, x - 1, g - 8, 1, 6);
    blob(c, x, g - 16, 10, 6, v, LEAF, snow);
    for (let k = -9; k <= 9; k += 2) {                                         // плакучие пряди до земли
      const len = 6 + q(hh(v, k, 7) * 7), top = g - 13 + q(Math.abs(k) * 0.3);
      R(c, k < -3 ? FL : FB, x + k, top, 1, len);
    }
  },
  poplar(c, x, g, v, snow) {
    const h = 34 + (v % 3) * 2;
    R(c, BARK, x, g - 5, 1, 5);
    for (let y = 4; y < h; y++) {
      const t = (y - 4) / (h - 4), w = Math.max(1, q(3.6 * Math.sin(Math.PI * Math.pow(t, 0.6)) + (hh(v, y, 2) - 0.5)));
      R(c, FB, x - w + 1, g - y - 1, 2 * w - 1, 1);
      R(c, FL, x - w + 1, g - y - 1, 1, 1);
      if (w > 2) R(c, FD, x + w - 1, g - y - 1, 1, 1);
    }
  },
  fruit(c, x, g, v, snow) {
    R(c, BARK, x, g - 6, 2, 6); R(c, P, x, g - 5, 1, 4);
    blob(c, x + 1, g - 10, 6, 4, v, LEAF, snow);
    for (let k = 0; k < 4; k++) R(c, L2, x - 3 + q(hh(v, k, 1) * 8), g - 13 + q(hh(v, k, 2) * 6), 1, 1);   // цвет/плоды — костью
  },
  street(c, x, g, v, snow) {
    R(c, K3, x - 3, g - 1, 7, 1); R(c, P, x - 3, g - 2, 7, 1); R(c, P, x - 3, g - 2, 1, 2); R(c, P, x + 3, g - 2, 1, 2);   // решётка
    R(c, BARK, x, g - 10, 1, 8); R(c, K3, x + 2, g - 9, 1, 7);                  // ствол и кол-подпорка
    blob(c, x, g - 15, 5, 5, v, LEAF, snow);
  },
  dead(c, x, g, v, snow) {
    // мёртвое: ствол углём, сучья врозь, обломанная верхушка
    const h = 18 + (v % 3) * 3;
    R(c, K0, x - 1, g - h, 2, h); R(c, P, x - 1, g - h + 3, 1, h - 5); R(c, K0, x - 2, g - 2, 5, 2);
    const br = [[-1, 0.55, -6, -4], [1, 0.45, 5, -5], [-1, 0.8, -4, -3], [1, 0.72, 4, -2]];
    for (const [s, at, dx, dy] of br) {
      const y0 = g - q(h * at);
      for (let k = 0; k <= Math.abs(dx); k++) R(c, K0, x + (s > 0 ? 1 : -1) + Math.sign(dx) * k, y0 + q(dy * k / Math.abs(dx)), 1, 1);
    }
    if (snow) R(c, K, x - 1, g - h, 2, 1);
  },
  stump(c, x, g, v) {
    R(c, BARK, x - 3, g - 4, 6, 4); R(c, L2, x - 3, g - 5, 6, 1); R(c, K1, x - 1, g - 5, 2, 1); R(c, K1, x - 4, g - 1, 8, 1);
  },
  bush(c, x, g, v, snow) {
    blob(c, x, g - 4, 5, 3, v, v % 2 ? LEAF : DRY, snow);
  },
};
const FLEX = { oak: 0.25, birch: 0.6, spruce: 0.2, pine: 0.35, cypress: 0.3, palm: 0.55, olive: 0.2, bamboo: 0.9, willow: 0.5, poplar: 0.45, fruit: 0.3, street: 0.3, dead: 0.05, stump: 0, bush: 0.25 };
const CROWN = { oak: 12, birch: 10, spruce: 8, pine: 10, cypress: 6, palm: 14, olive: 5, bamboo: 12, willow: 8, poplar: 8, fruit: 5, street: 9, dead: 99, stump: 99, bush: 99 };   // где кончается ствол (снизу)

// холст вида и варианта
const cache = new Map();
function variant(sp, v, snow) {
  const key = sp + v + (snow ? 's' : '');
  let e = cache.get(key);
  if (e) return e;
  const [w, h] = SIZE[sp], W = w + 8, H = h + 8;
  let cv = null;
  if (typeof document !== 'undefined') {
    cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    if (g) DRAW[sp](g, W >> 1, H - 2, v, snow); else cv = null;
  }
  e = { key: 'flora:' + key, cv, W, H, ax: W >> 1, ay: H - 2, crown: H - 2 - CROWN[sp] };
  cache.set(key, e);
  return e;
}

// дерево в мире: ствол стоит, крона — по ветру (гибкие сильнее)
export function drawTree(ctx, t, step) {
  if (t.sp === 'reed') return drawReed(ctx, t, step);
  const e = variant(t.sp, t.v, t.snow);
  if (!e.cv) return;
  const x0 = t.x - e.ax, y0 = t.gy - e.ay, flex = FLEX[t.sp];
  let sx = 0;
  if (flex > 0) {
    const w = wind.at(t.x, t.gy);
    sx = q(w.x * 2.2 * flex + Math.sin(step * 0.035 + t.x * 0.07) * w.s * 1.4 * flex);
  }
  if (!sx || e.crown >= e.H) { ctx.drawImage(e.cv, x0, y0); return; }
  ctx.drawImage(e.cv, 0, e.crown, e.W, e.H - e.crown, x0, y0 + e.crown, e.W, e.H - e.crown);   // ствол
  ctx.drawImage(e.cv, 0, 0, e.W, e.crown, x0 + sx, y0, e.W, e.crown);                         // крона
}
// камыш: 4–6 стеблей, у двух — початки; гнётся по ветру
function drawReed(ctx, t, step) {
  const w = wind.at(t.x, t.gy), bend = w.x * 2.4 + Math.sin(step * 0.05 + t.x * 0.11) * w.s * 1.6;
  const n = 4 + (t.v % 3);
  for (let k = 0; k < n; k++) {
    const h = 7 + q(hh(t.v, k, 3) * 6), bx = t.x - 3 + q(k * 6 / n);
    for (let y = 0; y < h; y++) {
      const px = bx + q(bend * (y / h) ** 2);
      ctx.fillStyle = k % 2 ? FB : FM; ctx.fillRect(px, t.gy - y - 1, 1, 1);
    }
    if (k === 1 || k === n - 2) { ctx.fillStyle = BARK; ctx.fillRect(bx + q(bend) , t.gy - h - 2, 1, 3); }   // початок рогоза
  }
}

// тень дерева — одна маска на вид и вариант (подножие в нуле, сдвиг — ox/oy)
export function treeCaster(t, maskFrom) {
  const e = variant(t.sp, t.v, t.snow);
  return { key: e.key, ox: t.x, oy: t.gy, build: () => e.cv ? maskFrom(g => g.drawImage(e.cv, -e.ax, -e.ay), -e.ax, -e.ay, e.W, 0) : null };
}
export const treeHeight = t => SIZE[t.sp][1];
