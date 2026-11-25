// ═══════════════════════════════════════
// АРХИТЕКТУРА КОЛЕЦ — реестр модулей: кольцо → { south, east, west,
// north, plain: [{ name, w, h, draw(ctx, x, gy, t) }], sign: { сторона: fn },
// props: { сторона: утварь } }. У утвари unique — примета эпохи (одна на
// сторону кольца), live — рисунок живёт (огонь, лампа, вода, подвес): такую
// вещь не запекают (render/things.js) и брошенной в поле не кладут.
// Раскладка по миру — src/world/architecture.js.
// ═══════════════════════════════════════
import { ARCH as axial } from './axial.js';
import { ARCH as porticoes } from './porticoes.js';
import { ARCH as lightgarden } from './lightgarden.js';
import { ARCH as twohearths } from './twohearths.js';
import { ARCH as enlightenment } from './enlightenment.js';
import { ARCH as steamshadows } from './steamshadows.js';
import { ARCH as catastrophes } from './catastrophes.js';
import { ARCH as neon } from './neon.js';
import { ARCH as now } from './now.js';
import { grandKind } from './kit.js';

export const ARCH_BY_RING = {
  axial, porticoes, lightgarden, twohearths, enlightenment, steamshadows, catastrophes, neon, now,
};

// доминанты — крупнее (слово автора 25.11: «сделай объекты больше — пирамиды и т. д.»): до трёхсот
// точек ростом, но не больше чем вдвое; план набора строится заново крупнее (kit.js grandKind)
export const GRAND_H = 300;
export const grandOf = h => Math.min(2, Math.round(GRAND_H / h * 20) / 20);
for (const A of Object.values(ARCH_BY_RING)) {
  if (Array.isArray(A.landmark)) A.landmark = A.landmark.map(L => grandKind(L, grandOf(L.h)));
  else if (A.landmark) A.landmark = grandKind(A.landmark, grandOf(A.landmark.h));
}

// постройки колец — крупнее (слово автора 25.11: «проработай здания в величину и качество»): в полтора раза,
// но не выше двухсот точек — доминанты (до трёхсот) остаются над ними. Утварь и таблички — прежние
export const BUILD_K = 1.5, BUILD_H = 200;
export const buildOf = h => Math.min(BUILD_K, Math.floor(BUILD_H / h * 20) / 20);
for (const A of Object.values(ARCH_BY_RING)) for (const side of ['south', 'east', 'west', 'north', 'plain']) {
  // smaller — запас для раскладки: совсем негде встать крупной — встаёт поменьше, но встаёт (world/architecture.js)
  if (A[side]) A[side] = A[side].map(K => { const k = buildOf(K.h); if (k <= 1) return K; const G = grandKind(K, k); G.smaller = [k > 1.25 ? { ...grandKind(K, 1.25), base: G } : null, { ...K, base: G }].filter(Boolean); return G; });
}

// птицы крупной постройки садятся на настоящую кромку: кривые кровли и купола при масштабе ложатся на точку
// иначе — рисунок прогоняется вхолостую, стая сдвигается к ближайшему месту, где под ней твёрдое, а над ней пусто
// (тот же уговор, что в проверке: опора — строка под птицей, рисунок с непрозрачностью от 0,6)
function solidOf(d, w, h) {
  const W = w + 60, H = h + 60, g = new Uint8Array(W * H), ax = W >> 1, ay = H - 20;
  const T = {
    globalAlpha: 1, fillStyle: '',
    fillRect(x, y, ww, hh) {
      if (T.globalAlpha < 0.6) return;
      for (let j = Math.max(0, y); j < Math.min(H, y + hh); j++) for (let i = Math.max(0, x); i < Math.min(W, x + ww); i++) g[j * W + i] = 1;
    },
  };
  const c = new Proxy(T, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  try { (d.body || d)(c, ax, ay, 0); } catch (e) { return null; }
  return (dx, dy) => { const x = ax + dx, y = ay + dy; return x >= 0 && y >= 0 && x < W && y < H && g[y * W + x] === 1; };
}
const perchOk = (sol, p) => { for (let dx = p[0]; dx <= p[1] + 1; dx++) if (!sol(dx, p[2] - 1) || sol(dx, p[2] - 2)) return false; return true; };
const NEAR = [];
for (let dy = -6; dy <= 6; dy++) for (let dx = -10; dx <= 10; dx++) NEAR.push([dx, dy]);
NEAR.sort((a, b) => Math.abs(a[0]) + 1.5 * Math.abs(a[1]) - Math.abs(b[0]) - 1.5 * Math.abs(b[1]));
function snapBirds(K) {
  if (!K.grand) return;
  // жизнь #1 — у первого рисунка и у тех повторов, у кого своей нет (как в world/architecture.js)
  for (const [ln, draws] of [['life', ['draw', !K.life2 && 'draw2', !K.life2 && !K.life3 && 'draw3']], ['life2', ['draw2', !K.life3 && 'draw3']], ['life3', ['draw3']]]) {
    const L = K[ln];
    if (!L || !L.birds) continue;
    const sols = draws.filter(n => n && K[n]).map(n => solidOf(K[n], K.w, K.h)).filter(Boolean);
    if (!sols.length) continue;
    L.birds = L.birds.map(p => {
      if (sols.every(sol => perchOk(sol, p))) return p;
      for (let len = p[1] - p[0]; len >= 0; len--) for (const [dx, dy] of NEAR) {
        const q = [p[0] + dx, p[0] + dx + len, p[2] + dy, ...p.slice(3)];
        if (sols.every(sol => perchOk(sol, q))) return q;
      }
      return p;
    });
  }
}
for (const A of Object.values(ARCH_BY_RING)) {
  for (const side of ['south', 'east', 'west', 'north', 'plain']) for (const K of A[side] || []) snapBirds(K);
  for (const L of [].concat(A.landmark || [])) snapBirds(L);
}
