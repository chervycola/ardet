// ═══════════════════════════════════════
// ПОДНЯТОЕ — то из артерий, что стоит над землёй (полотно и тень под ним
// кладёт в землю render/etchPaths.js):
//   линия неба — акведук пролётами с прорехами (на месте рухнувшего пролёта —
//     обломок опоры и камни), аркады соборов (руин больше, чем арок),
//     телеграфные столбы, опоры ЛЭП с провисшими проводами (последняя —
//     гирлянда пустых изоляторов), эстакада на столбах — оборвана там, где
//     под ней постройка;
//   река — свой акведук (ручей поднимается на арки и сходит с них) и труба
//     на опорах (выходит из земли и уходит в неё);
//   мосты — перила своей эпохи: каменный парапет, железная ферма, бетон,
//     балки железной дороги.
// Не твёрдое: под арками, проводами и эстакадой проходишь. Каждая вещь —
// кусок со своей глубиной (gy): main раскладывает их с постройками, тень —
// по солнцу, как у построек. Рисунок куска — один раз, в свой холст.
// Свет — лунный, слева (как у построек эпох).
// ═══════════════════════════════════════
import { lines, bridges, skyRun } from '../world/arteries.js';

const N = '#0D0B0A', K = '#D9CFB8', P = '#8A8D8F';
const D2 = '#241c14', D3 = '#2a2620', D4 = '#34302a', C1 = '#c8b89a', C2 = '#b0a284';
const IRON = '#1e1d1c', IRON_L = '#55524c', RUST = '#4a3420', RUST_L = '#6b4a2c';
const CONC = '#5a5650', CONC_D = '#3e3b36', CONC_L = '#8a857a', WOOD = '#3a2818', WIRE = '#141210';
const WATER = '#1b211a', GLINT = '#7f8a7c';

function R(c, col, x, y, w, h) { c.fillStyle = col; c.fillRect(x, y, w, h); }
const q = Math.round;
const fr = n => { const v = Math.sin(n * 91.7 + 1.3) * 43758.5453; return v - Math.floor(v); };

export const arteryProps = [];          // { x, gy, w, h, draw(ctx) } — как утварь дворов

// ── кусок: рисунок в свой холст по рамке; draw кладёт холст в мир ──
// flat — пролёт вглубь кадра: тень по солнцу от него не строится (маска не
// знает глубины — вышла бы гребёнка); под ним и так тень в земле
function piece(x0, y0, x1, y1, gy, paint, kind, flat = false) {
  x0 = Math.floor(x0) - 1; y0 = Math.floor(y0) - 1; x1 = Math.ceil(x1) + 1; y1 = Math.ceil(Math.max(y1, gy)) + 1;
  let cv = null;
  const p = { x: (x0 + x1) / 2, gy: q(gy), w: x1 - x0, h: q(gy) - y0, kind, noShadow: flat,
    draw(ctx) {
      if (cv === null) cv = render(x1 - x0, y1 - y0, g => { g.translate(-x0, -y0); paint(g); });
      if (cv) ctx.drawImage(cv, x0, y0);
    } };
  arteryProps.push(p);
  return p;
}
function render(w, h, fn) {
  if (typeof document === 'undefined' || w <= 0 || h <= 0) return false;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  if (!g) return false;
  fn(g);
  return c;
}

// точка линии на длине s (pts размечены шагом, s растёт)
function atS(P, s) {
  let lo = 0, hi = P.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (P[m].s <= s) lo = m; else hi = m; }
  const a = P[lo], b = P[hi], t = b.s > a.s ? Math.max(0, Math.min(1, (s - a.s) / (b.s - a.s))) : 0;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, ok: a.ok !== false && b.ok !== false };
}
// отрезки одной стадии: [{ st, s0, s1 }]
function runs(L) {
  const out = [];
  let cur = null;
  for (const p of L.pts) {
    if (!cur || cur.st !== p.st) { if (cur) out.push(cur); cur = { st: p.st, s0: p.s, s1: p.s }; }
    else cur.s1 = p.s;
  }
  if (cur) out.push(cur);
  return out.filter(r => r.st && r.s1 - r.s0 > 8);
}
// опоры по отрезку: ровным шагом, чтобы концы пришлись на опору
function piers(L, s0, s1, pitch) {
  const n = Math.max(1, Math.round((s1 - s0) / pitch)), out = [];
  for (let k = 0; k <= n; k++) { const s = s0 + (s1 - s0) * k / n; out.push({ s, ...atS(L.pts, s) }); }
  return out;
}

// ── лицо пролёта между опорами A и B (точки земли) ──
// hA/hB — высота низа настила, T — толщина настила; open(q, h) — высота
// проёма на доле пролёта q ∈ (0, 1); pw — полуширина опоры на экране.
// Почти отвесный пролёт (идёт вглубь кадра) лица не кажет: виден верх.
function face(c, A, B, hA, hB, T, open, pw, col) {
  const dx = B.x - A.x, xa = q(A.x), xb = q(B.x);
  const lo = Math.min(xa, xb) - pw, hi = Math.max(xa, xb) + pw, n = Math.abs(xb - xa);
  for (let x = lo; x <= hi; x++) {
    const u = n ? Math.max(0, Math.min(1, (x - xa) / (xb - xa))) : 0;
    const g = A.y + (B.y - A.y) * u, h = hA + (hB - hA) * u;
    const top = q(g - h - T);
    const nearA = Math.abs(x - xa) <= pw, nearB = Math.abs(x - xb) <= pw;
    let oh = 0;
    if (!nearA && !nearB && n > 2 * pw + 1) {
      const qq = (Math.abs(x - xa) - pw) / (n - 2 * pw);
      oh = open(Math.max(0, Math.min(1, qq)), h);
    }
    const bot = q(g - oh);
    if (bot > top) R(c, col.body, x, top, 1, bot - top);
    R(c, col.top, x, top, 1, 1);                                   // верх настила на свету
    if (oh > 0) R(c, col.dark, x, q(g - oh) - 1, 1, 1);            // свод проёма — в тени
    if ((nearA && x === xa - pw) || (nearB && x === xb - pw)) R(c, col.lit, x, top + 1, 1, Math.max(0, q(g) - top - 1));   // опора: левая грань на свету
  }
  return Math.abs(dx) >= 3;
}
// пролёт, идущий вглубь кадра: лица не видно — виден верх настила полосой
// шириной w (у ближнего конца — торец толщиной T); опоры под ним скрыты
// настилом и ближней опорой, видна только самая ближняя (её рисует кусок)
function strip(c, A, B, hA, hB, T, w, col, channel) {
  const F = A.y - hA < B.y - hB ? { p: A, h: hA } : { p: B, h: hB }, Nr = F.p === A ? { p: B, h: hB } : { p: A, h: hA };
  const fy = F.p.y - F.h - T, ny = Nr.p.y - Nr.h - T, y0 = q(fy), y1 = q(ny), hw = w >> 1;
  for (let y = y0; y <= y1 + T; y++) {
    const u = y1 > y0 ? Math.max(0, Math.min(1, (y - fy) / (ny - fy))) : 0;
    const x = q(F.p.x + (Nr.p.x - F.p.x) * u);
    R(c, col.body, x - hw, y, w, 1);
    R(c, col.lit, x - hw, y, 1, 1);
    R(c, col.dark, x + hw - 1 + (w & 1), y, 1, 1);
    if (channel && y <= y1) R(c, channel, x, y, 1, 1);
  }
}
const steep = (A, B) => Math.abs(B.x - A.x) < Math.abs(B.y - A.y);
// отвесная опора (лицо к нам): полуширина pw, от земли до h
function pierFace(c, A, h, pw, col) {
  const x = q(A.x), g = q(A.y);
  R(c, col.body, x - pw, g - h, 2 * pw + 1, h);
  R(c, col.lit, x - pw, g - h, 1, h);
  R(c, col.top, x - pw, g - h, 2 * pw + 1, 1);
}
// груда камней на земле вдоль отрезка (рухнувший пролёт)
function rubble(c, A, B, seed, cols) {
  const n = 3 + Math.floor(fr(seed) * 4);
  for (let k = 0; k < n; k++) {
    const u = (k + 0.5 + (fr(seed + k * 7) - 0.5) * 0.6) / n, x = q(A.x + (B.x - A.x) * u + (fr(seed + k * 3) - 0.5) * 4);
    const y = q(A.y + (B.y - A.y) * u + (fr(seed + k * 5) - 0.5) * 3), w = 2 + Math.floor(fr(seed + k) * 3);
    R(c, cols.body, x, y - 2, w, 2); R(c, cols.top, x, y - 2, w, 1);
  }
}
// провод с провисом: из (ax, ay) в (bx, by), sag — провис в середине
function wire(c, ax, ay, bx, by, sag, col = WIRE) {
  const n = Math.max(2, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay))));
  let px = null, py = null;
  for (let k = 0; k <= n; k++) {
    const t = k / n, x = q(ax + (bx - ax) * t), y = q(ay + (by - ay) * t + sag * 4 * t * (1 - t));
    if (x === px && y === py) continue;
    R(c, col, x, y, 1, 1);
    px = x; py = y;
  }
}
// бокс по точкам (с запасом)
function box(pts, up, pad = 2) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of pts) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
  return { x0: x0 - pad, x1: x1 + pad, y0: y0 - up - pad, y1: y1 + pad, gy: y1 };
}

const STONE = { body: D3, top: C2, lit: C1, dark: N };
const STONE_RUIN = { body: D4, top: C2 };
const ARC_C = { body: '#2e2a24', top: C1, lit: K, dark: N };
const CONC_C = { body: CONC_D, top: CONC_L, lit: CONC, dark: N };

// ── акведук: линия неба (сухой, с прорехами) и река (с водой, весь цел) ──
function aqueduct(L, r, river) {
  const H = river ? 22 : 28, T = 5, P0 = piers(L, r.s0, r.s1, river ? 15 : 17);
  const rise = 5, hOf = k => river ? Math.min(H, 4 + 3.2 * Math.min(k, P0.length - 1 - k)) : H;   // ручей поднимается на арки
  const open = (qq, h) => Math.max(0, (h - rise - 2) + rise * Math.sqrt(Math.max(0, 1 - (2 * qq - 1) ** 2)));
  for (let k = 0; k < P0.length - 1; k++) {
    const A = P0[k], B = P0[k + 1], hA = hOf(k), hB = hOf(k + 1), seed = q(A.s) + (river ? 7 : 0);
    const stands = river || (A.ok && B.ok && skyRun((A.s + B.s) / 2, 'aqueduct'));
    const vert = steep(A, B);
    const bx = box([A, B], Math.max(hA, hB) + T + 2, 4);
    if (stands) {
      piece(bx.x0, bx.y0, bx.x1, bx.y1, bx.gy, c => {
        if (vert) {
          strip(c, A, B, hA, hB, T, 5, STONE, river ? WATER : D2);
          const S = A.y > B.y ? { p: A, h: hA } : { p: B, h: hB };            // ближняя опора — лицом к нам
          pierFace(c, S.p, S.h + T, 2, STONE);
        } else {
          face(c, A, B, hA, hB, T, open, 2, STONE);
          // жёлоб поверху: вода реки или сухой камень
          const xa = q(A.x), xb = q(B.x), n = Math.abs(xb - xa), sg = xb >= xa ? 1 : -1;
          for (let i = 0; i <= n; i++) {
            const u = n ? i / n : 0, y = q(A.y + (B.y - A.y) * u - (hA + (hB - hA) * u) - T) + 1;
            R(c, river ? (fr(seed + i * 13) < 0.06 ? GLINT : WATER) : D2, xa + sg * i, y, 1, 1);
          }
        }
      }, 'aqueduct', vert);
    } else {
      // пролёт рухнул: обломки опор по краям и камни внизу
      const stubA = A.ok && fr(seed * 1.3) < 0.55, stubB = B.ok && fr(seed * 1.7 + 2) < 0.35;
      if (!A.ok && !B.ok) continue;
      piece(bx.x0, bx.y0, bx.x1, bx.y1, bx.gy, c => {
        if (stubA) pierFace(c, A, 6 + q(fr(seed + 3) * (H - 8)), 2, STONE);
        if (stubB) pierFace(c, B, 4 + q(fr(seed + 4) * (H * 0.5)), 2, STONE);
        if (A.ok || B.ok) rubble(c, A, B, seed, STONE_RUIN);
      }, 'ruin');
    }
  }
}

// ── аркады соборов: стрельчатые арки на тонких столбах; больше руин ──
function arcade(L, r) {
  const H = 34, T = 4, P0 = piers(L, r.s0, r.s1, 21);
  const open = (qq, h) => (h - 12) + 12 * Math.pow(Math.max(0, 1 - Math.abs(2 * qq - 1)), 0.55);   // стрельчатая
  for (let k = 0; k < P0.length - 1; k++) {
    const A = P0[k], B = P0[k + 1], seed = q(A.s) * 3 + 1;
    const stands = A.ok && B.ok && skyRun((A.s + B.s) / 2, 'arcade');
    const vert = steep(A, B);
    const bx = box([A, B], H + T + 4, 4);
    if (!A.ok && !B.ok) continue;
    piece(bx.x0, bx.y0, bx.x1, bx.y1, bx.gy, c => {
      if (stands) {
        if (vert) {
          strip(c, A, B, H, H, T, 4, ARC_C, null);
          pierFace(c, A.y > B.y ? A : B, H + T, 1, ARC_C);
        } else {
          face(c, A, B, H, H, T, open, 1, ARC_C);
          for (const S of [A, B]) { R(c, C1, q(S.x) - 2, q(S.y - H + 12) - 1, 5, 1); R(c, D3, q(S.x) - 2, q(S.y) - 1, 5, 1); }   // капитель и база
        }
      } else {
        // руина: столб без арки — обломан на своей высоте; камни у подножия
        if (A.ok && fr(seed) < 0.7) {
          const h = 10 + q(fr(seed + 1) * (H - 8));
          pierFace(c, A, h, 1, ARC_C);
          R(c, P, q(A.x) - 1, q(A.y) - h, 1, 1);                      // скол
        }
        rubble(c, A, B, seed, STONE_RUIN);
      }
    }, stands ? 'arcade' : 'ruin', stands && vert);
  }
}

// ── столбы и ЛЭП: опоры через шаг, провода провисают ──
// arms — плечи траверсы поперёк линии: [смещение, высота]
function wires(L, r, kind) {
  const pole = kind === 'poles';
  const pitch = pole ? 46 : 104, Ht = pole ? 30 : 62;
  const arms = pole ? [[-3, 27], [3, 27]] : [[-11, 50], [0, 59], [11, 50]];
  const P0 = piers(L, r.s0, r.s1, pitch);
  const at = (k) => {
    const a = P0[Math.max(0, k - 1)], b = P0[Math.min(P0.length - 1, k + 1)];
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    return { nx: -dy / l, ny: dx / l };
  };
  // крепления проводов на опоре k: точки на экране
  const hooks = k => { const A = P0[k], n = at(k); return arms.map(([o, h]) => ({ x: A.x + n.nx * o, y: A.y + n.ny * o - h + 2 })); };
  for (let k = 0; k < P0.length; k++) {
    const A = P0[k];
    if (!A.ok) continue;
    const n = at(k), last = k === P0.length - 1 || !P0[k + 1].ok;
    const next = !last ? P0[k + 1] : null;
    const pts = [A, ...hooks(k)];
    if (next) pts.push(next, ...hooks(k + 1));
    const bx = box(pts, Ht + 4, 4);
    const lean = pole ? (fr(k * 7 + A.s) - 0.5) * 4 : 0;               // старые столбы клонятся
    piece(bx.x0, bx.y0, bx.x1, bx.y1, Math.max(bx.gy, A.y), c => {
      const x = q(A.x), g = q(A.y);
      if (pole) {
        for (let y = 0; y < Ht; y++) R(c, y < 2 ? N : WOOD, x + q(lean * y / Ht), g - y - 1, 2, 1);
        const tx = x + q(lean);
        const e0 = { x: A.x + n.nx * -4, y: A.y + n.ny * -4 - 27 }, e1 = { x: A.x + n.nx * 4, y: A.y + n.ny * 4 - 27 };
        wire(c, q(e0.x) + q(lean), q(e0.y), q(e1.x) + q(lean), q(e1.y), 0, WOOD);       // перекладина
        for (const h of hooks(k)) R(c, K, q(h.x) + q(lean), q(h.y) - 1, 1, 1);         // изоляторы
        R(c, P, tx, g - Ht, 1, 1);
      } else {
        // решётчатая опора: две ноги, к верху сходятся, раскосы крестом
        const base = 7, top = 2;
        for (let y = 0; y < Ht; y++) {
          const w = q(base - (base - top) * y / Ht);
          R(c, IRON_L, x - w, g - y - 1, 1, 1); R(c, IRON, x + w, g - y - 1, 1, 1);
          const ph = y % 10, cw = 2 * w;
          if (cw > 1) { const t1 = ph / 10, xa = q(x - w + cw * t1), xb = q(x + w - cw * t1); R(c, IRON, xa, g - y - 1, 1, 1); R(c, IRON, xb, g - y - 1, 1, 1); }
        }
        // траверсы поперёк линии и гирлянды изоляторов
        for (const [o, h] of arms) {
          const ex = A.x + n.nx * o, ey = A.y + n.ny * o - h;
          wire(c, x, g - h, q(ex), q(ey), 0, IRON);
          R(c, P, q(ex), q(ey) + 1, 1, 2); R(c, K, q(ex), q(ey) + 3, 1, 1);
        }
        R(c, IRON, x, g - Ht - 3, 1, 3);                                // грозотрос
      }
      if (next) {                                                      // провода — к следующей опоре
        const a = hooks(k), b = hooks(k + 1), sag = pole ? 3 : 7;
        for (let i = 0; i < a.length; i++) wire(c, q(a[i].x) + q(lean), q(a[i].y) + 1, q(b[i].x), q(b[i].y) + 1, sag);
      } else if (!pole) {
        // последняя опора: провода оборваны — пустые изоляторы висят гирляндой
        for (const h of hooks(k)) for (let j = 0; j < 3; j++) R(c, j % 2 ? P : K, q(h.x), q(h.y) + 2 + j, 1, 1);
      }
    }, pole ? 'pole' : 'pylon');
  }
}

// ── эстакада: настил на столбах; там, где под ней постройка, — оборвана ──
function flyover(L, r) {
  const H = 24, T = 6, P0 = piers(L, r.s0, r.s1, 38);
  for (let k = 0; k < P0.length - 1; k++) {
    const A = P0[k], B = P0[k + 1];
    if (!A.ok && !B.ok) continue;
    const whole = A.ok && B.ok, vert = steep(A, B);
    const bx = box([A, B], H + T + 6, 7);
    piece(bx.x0, bx.y0, bx.x1, bx.y1, bx.gy, c => {
      const pierAt = S => {                                          // столб с оголовком
        pierFace(c, S, H, 2, CONC_C);
        R(c, CONC_D, q(S.x) - 5, q(S.y) - H - 1, 11, 2); R(c, CONC_L, q(S.x) - 5, q(S.y) - H - 1, 11, 1);
      };
      if (A.ok) pierAt(A);
      if (!whole) {                                                  // обрыв: арматура торчит
        const S = A.ok ? A : B, E = A.ok ? B : A, u = 0.35;
        const M = { x: S.x + (E.x - S.x) * u, y: S.y + (E.y - S.y) * u };
        if (vert) strip(c, S, M, H, H, T, 10, CONC_C, null);
        else face(c, S, M, H, H, T, (qq, h) => h, 0, CONC_C);
        for (let j = 0; j < 3; j++) wire(c, q(M.x), q(M.y - H - 1 - j * 2), q(M.x + (E.x - S.x) * 0.08 + (fr(j + k) - 0.5) * 3), q(M.y - H - 2 - j * 2 + (E.y - S.y) * 0.08 + 2), 0, P);
        return;
      }
      if (vert) {
        strip(c, A, B, H, H, T, 10, CONC_C, null);
        const ya = q(Math.min(A.y, B.y) - H - T), yb = q(Math.max(A.y, B.y) - H);
        for (let y = ya; y < yb; y += 9) R(c, P, q(A.x), y, 1, 4);   // разметка
      } else {
        face(c, A, B, H, H, T, (qq, h) => h, 0, CONC_C);
        if (B.ok) pierAt(B);
        const xa = q(A.x), xb = q(B.x), n = Math.abs(xb - xa), sg = xb >= xa ? 1 : -1;
        for (let i = 0; i <= n; i++) {                               // отбойник поверху и тень под настилом
          const u = n ? i / n : 0, y = q(A.y + (B.y - A.y) * u - H - T);
          R(c, CONC_L, xa + sg * i, y - 2, 1, 2);
          R(c, N, xa + sg * i, y + T, 1, 1);
        }
      }
    }, 'flyover', vert);
  }
}

// ── труба реки: на опорах над землёй; у концов уходит в землю ──
function pipe(L, r) {
  const P0 = piers(L, r.s0, r.s1, 12), H = 7;
  const hOf = k => Math.min(H, 1 + 1.6 * Math.min(k, P0.length - 1 - k));
  for (let k = 0; k < P0.length - 1; k++) {
    const A = P0[k], B = P0[k + 1], hA = hOf(k), hB = hOf(k + 1);
    const bx = box([A, B], H + 6, 4), vert = steep(A, B);
    piece(bx.x0, bx.y0, bx.x1, bx.y1, bx.gy, c => {
      if (k % 2 === 0 && hA > 3) {                                   // опора — козлы
        R(c, IRON, q(A.x) - 2, q(A.y) - hA + 2, 1, hA - 2); R(c, IRON, q(A.x) + 2, q(A.y) - hA + 2, 1, hA - 2);
        R(c, IRON_L, q(A.x) - 2, q(A.y) - hA + 1, 5, 1);
      }
      if (vert) { strip(c, A, B, hA, hB, 3, 4, { body: RUST, lit: RUST_L, dark: N }, null); return; }
      const xa = q(A.x), xb = q(B.x), n = Math.abs(xb - xa), sg = xb >= xa ? 1 : -1;
      for (let i = 0; i <= n; i++) {
        const u = n ? i / n : 0, y = q(A.y + (B.y - A.y) * u - (hA + (hB - hA) * u));
        R(c, RUST, xa + sg * i, y - 3, 1, 3); R(c, RUST_L, xa + sg * i, y - 4, 1, 1); R(c, N, xa + sg * i, y, 1, 1);
      }
      if (k % 4 === 0) R(c, P, xa, q(A.y - hA) - 4, 1, 4);           // фланец
    }, 'pipe', vert);
  }
  // конец трубы — у сухого русла: обломанный фланец, чёрный зев
  const E = P0[P0.length - 1];
  piece(E.x - 4, E.y - 8, E.x + 4, E.y + 1, E.y, c => { R(c, P, q(E.x) - 2, q(E.y) - 5, 5, 5); R(c, N, q(E.x) - 1, q(E.y) - 4, 3, 3); }, 'pipe');
}

// ── мосты: перила по обе руки дороги, над водой ──
function bridge(b) {
  const nx = -b.ay, ny = b.ax, L = b.len / 2;
  for (const side of [-1, 1]) {
    const cx = b.x + nx * b.hw * side, cy = b.y + ny * b.hw * side;
    const A = { x: cx - b.ax * L, y: cy - b.ay * L }, B = { x: cx + b.ax * L, y: cy + b.ay * L };
    const Hh = b.style === 'rail' ? 7 : b.style === 'iron' ? 6 : b.style === 'stone' ? 4 : 3;
    const bx = box([A, B], Hh + 2, 2);
    piece(bx.x0, bx.y0, bx.x1, bx.y1, bx.gy, c => {
      const xa = q(A.x), xb = q(B.x), n = Math.abs(xb - xa), sg = xb >= xa ? 1 : -1;
      const vert = n < 3;
      const steps = vert ? Math.abs(q(B.y) - q(A.y)) : n;
      for (let i = 0; i <= steps; i++) {
        const u = steps ? i / steps : 0, x = vert ? q(A.x) : xa + sg * i, g = q(A.y + (B.y - A.y) * u);
        if (b.style === 'stone') { R(c, D3, x, g - Hh, 1, Hh); R(c, C2, x, g - Hh, 1, 1); if (vert) R(c, C1, x - 1, g - Hh, 1, Hh); }
        else if (b.style === 'concrete') { R(c, CONC_D, x, g - Hh, 1, Hh); R(c, CONC_L, x, g - Hh, 1, 1); }
        else {
          // ферма: два пояса, раскосы зигзагом — на свету пеплом
          const H2 = Hh;
          R(c, P, x, g - H2, 1, 1); R(c, IRON_L, x, g - 1, 1, 1);
          const ph = i % 6;
          R(c, P, x, g - 1 - q((H2 - 1) * (ph < 3 ? ph / 3 : (6 - ph) / 3)), 1, 1);
          if (ph === 0) R(c, IRON_L, x, g - H2, 1, H2);                       // стойка
          if (b.style === 'rail' && i % 3 === 0) R(c, K, x, g - H2 + 2, 1, 1);   // заклёпки
        }
      }
      // устои по концам
      for (const S of [A, B]) R(c, b.style === 'stone' ? C1 : b.style === 'concrete' ? CONC_L : IRON_L, q(S.x), q(S.y) - Hh - 1, 1, Hh + 1);
    }, 'bridge');
  }
}

// ── сборка: после buildArteries ──
export function buildArteryProps() {
  arteryProps.length = 0; grid.clear();
  for (const L of lines) {
    if (L.kind !== 'sky' && L.kind !== 'river') continue;
    for (const r of runs(L)) {
      if (L.kind === 'river') { if (r.st === 'aqueduct') aqueduct(L, r, true); else if (r.st === 'pipe') pipe(L, r); continue; }
      if (r.st === 'aqueduct') aqueduct(L, r, false);
      else if (r.st === 'arcade') arcade(L, r);
      else if (r.st === 'poles' || r.st === 'pylons') wires(L, r, r.st);
      else if (r.st === 'flyover') flyover(L, r);
    }
  }
  for (const b of bridges) bridge(b);
  for (const p of arteryProps) {
    const gx0 = Math.floor((p.x - p.w / 2) / G), gx1 = Math.floor((p.x + p.w / 2) / G);
    const gy0 = Math.floor((p.gy - p.h) / G), gy1 = Math.floor(p.gy / G);
    for (let gx = gx0; gx <= gx1; gx++) for (let gy = gy0; gy <= gy1; gy++) {
      const k = gx * 100000 + gy;
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(p);
    }
  }
  return arteryProps;
}

// куски в кадре (с запасом pad — для теней)
const G = 256, grid = new Map();
export function arteryPropsIn(x0, y0, x1, y1) {
  const out = new Set();
  for (let gx = Math.floor(x0 / G); gx <= Math.floor(x1 / G); gx++) for (let gy = Math.floor(y0 / G); gy <= Math.floor(y1 / G); gy++) {
    const L = grid.get(gx * 100000 + gy);
    if (!L) continue;
    for (const p of L) if (p.x + p.w / 2 > x0 && p.x - p.w / 2 < x1 && p.gy > y0 && p.gy - p.h < y1) out.add(p);
  }
  return [...out];
}
