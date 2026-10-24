// ═══════════════════════════════════════
// ТРАССИРОВКА — линия по замыслу (дорога, река, дуга, линия неба), которая
// обходит постройки, дворы и таблички, не сдвигая их: раскладка прежняя.
// Замысел — ломаная; там, где прямой отрезок между вехами свободен, он и
// остаётся; где занят — путь ищется по сетке занятости (A*) в коридоре
// вокруг замысла: чем дальше от замысла, тем дороже. Занятое не запретно,
// а очень дорого: если обойти негде, линия пройдёт краем, но не прыгнет
// напрямик. Полотно дороги — дешёвый переход: пересечь можно, идти вдоль —
// накладно. Потом ломаная сглаживается и размечается ровным шагом.
// ═══════════════════════════════════════
const CELL = 8;
const FREE = 0, BLOCK = 1, ROAD = 2;
const COST = [1, 25, 3];                       // свободно · занято · по полотну дороги

// сетка занятости по прямоугольникам { x0, y0, x1, y1 } с запасом pad;
// roads — ломаные [{x, y}], полотно которых проходимо (r — полуширина);
// дворики, запертые со всех сторон, считаются занятыми (туда не войти)
export function makeBlock(W, H, boxes, pad = 10, roads = [], r = 10) {
  const gw = Math.ceil(W / CELL), gh = Math.ceil(H / CELL), g = new Uint8Array(gw * gh);
  for (const b of boxes) {
    const i0 = Math.max(0, Math.floor((b.x0 - pad) / CELL)), i1 = Math.min(gw - 1, Math.floor((b.x1 + pad) / CELL));
    const j0 = Math.max(0, Math.floor((b.y0 - pad) / CELL)), j1 = Math.min(gh - 1, Math.floor((b.y1 + pad) / CELL));
    for (let j = j0; j <= j1; j++) g.fill(BLOCK, j * gw + i0, j * gw + i1 + 1);
  }
  for (const P of roads) for (const p of P) {
    const i0 = Math.max(0, Math.floor((p.x - r) / CELL)), i1 = Math.min(gw - 1, Math.floor((p.x + r) / CELL));
    const j0 = Math.max(0, Math.floor((p.y - r) / CELL)), j1 = Math.min(gh - 1, Math.floor((p.y + r) / CELL));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) g[j * gw + i] = ROAD;
  }
  sealPockets(g, gw, gh);
  return { g, gw, gh };
}
// заливка от краёв мира: свободное, до чего не дойти, — занято
function sealPockets(g, gw, gh) {
  const seen = new Uint8Array(gw * gh), q = new Int32Array(gw * gh);
  let qh = 0, qt = 0;
  const push = v => { if (!seen[v] && g[v] !== BLOCK) { seen[v] = 1; q[qt++] = v; } };
  for (let i = 0; i < gw; i++) { push(i); push((gh - 1) * gw + i); }
  for (let j = 0; j < gh; j++) { push(j * gw); push(j * gw + gw - 1); }
  while (qh < qt) {
    const v = q[qh++], i = v % gw, j = (v / gw) | 0;
    if (i > 0) push(v - 1);
    if (i < gw - 1) push(v + 1);
    if (j > 0) push(v - gw);
    if (j < gh - 1) push(v + gw);
  }
  for (let v = 0; v < g.length; v++) if (!seen[v] && g[v] !== BLOCK) g[v] = BLOCK;
}
const cellAt = (B, x, y) => {
  const i = Math.floor(x / CELL), j = Math.floor(y / CELL);
  return i < 0 || j < 0 || i >= B.gw || j >= B.gh ? FREE : B.g[j * B.gw + i];
};
export const blockedAt = (B, x, y) => cellAt(B, x, y) === BLOCK;
function segFree(B, a, b) {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 4));
  for (let k = 0; k <= n; k++) if (blockedAt(B, a.x + (b.x - a.x) * k / n, a.y + (b.y - a.y) * k / n)) return false;
  return true;
}

// ближайшая свободная клетка к точке (по квадратам вокруг; полотно дороги — не веха);
// дальше reach клеток не ищет — null
export function freeNear(B, p, reach = 40) {
  if (cellAt(B, p.x, p.y) === FREE) return p;
  for (let r = 1; r < reach; r++) {
    for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
      if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
      const q = { x: p.x + di * CELL, y: p.y + dj * CELL };
      if (cellAt(B, q.x, q.y) === FREE) return q;
    }
  }
  return reach >= 40 ? p : null;
}

// маленькая куча для A*
function heapPush(h, f, v) { h.push([f, v]); let i = h.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (h[p][0] <= h[i][0]) break; [h[p], h[i]] = [h[i], h[p]]; i = p; } }
function heapPop(h) {
  const top = h[0], last = h.pop();
  if (h.length) { h[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < h.length && h[l][0] < h[m][0]) m = l; if (r < h.length && h[r][0] < h[m][0]) m = r; if (m === i) break; [h[m], h[i]] = [h[i], h[m]]; i = m; } }
  return top;
}

// A* от a до b в коридоре вокруг отрезка a→b (запас pad). Возвращает
// { pts, hard } — hard: сколько клеток пути пришлось пройти по занятому.
// band — { dist(x, y), lo, hi }: вне полосы расстояний — как занято (река
// обходит вбок, а не наружу и обратно)
function astar(B, a, b, pad, band = null) {
  const x0 = Math.floor((Math.min(a.x, b.x) - pad) / CELL), y0 = Math.floor((Math.min(a.y, b.y) - pad) / CELL);
  const x1 = Math.ceil((Math.max(a.x, b.x) + pad) / CELL), y1 = Math.ceil((Math.max(a.y, b.y) + pad) / CELL);
  const w = x1 - x0 + 1, h = y1 - y0 + 1, N = w * h;
  const gS = new Float32Array(N).fill(Infinity), from = new Int32Array(N).fill(-1), done = new Uint8Array(N);
  const si = Math.floor(a.x / CELL) - x0, sj = Math.floor(a.y / CELL) - y0;
  const ti = Math.floor(b.x / CELL) - x0, tj = Math.floor(b.y / CELL) - y0;
  const lx = ti - si, ly = tj - sj, ll = Math.hypot(lx, ly) || 1;
  const dev = (i, j) => Math.abs((i - si) * ly - (j - sj) * lx) / ll;    // отход от замысла, клеток
  const s = sj * w + si, goal = tj * w + ti, heap = [];
  gS[s] = 0; heapPush(heap, 0, s);
  const D8 = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
  const kind = (i, j) => {
    const gi = i + x0, gj = j + y0;
    const k = gi < 0 || gj < 0 || gi >= B.gw || gj >= B.gh ? FREE : B.g[gj * B.gw + gi];
    if (k !== BLOCK && band) { const d = band.dist(gi * CELL + CELL / 2, gj * CELL + CELL / 2); if (d < band.lo || d > band.hi) return BLOCK; }
    return k;
  };
  let it = 0;
  while (heap.length && it++ < 200000) {
    const [, v] = heapPop(heap);
    if (done[v]) continue;
    done[v] = 1;
    if (v === goal) break;
    const vi = v % w, vj = (v / w) | 0;
    for (const [di, dj, c] of D8) {
      const ni = vi + di, nj = vj + dj;
      if (ni < 0 || nj < 0 || ni >= w || nj >= h) continue;
      const u = nj * w + ni;
      if (done[u]) continue;
      const cost = gS[v] + c * COST[kind(ni, nj)] * (1 + 0.04 * dev(ni, nj));
      if (cost < gS[u]) {
        gS[u] = cost; from[u] = v;
        heapPush(heap, cost + Math.hypot(ti - ni, tj - nj), u);
      }
    }
  }
  if (from[goal] < 0 && goal !== s) return null;
  const pts = [];
  let hard = 0;
  for (let v = goal; v >= 0; v = v === s ? -1 : from[v]) {
    const i = v % w, j = (v / w) | 0;
    if (kind(i, j) === BLOCK) hard++;
    pts.push({ x: (i + x0) * CELL + CELL / 2, y: (j + y0) * CELL + CELL / 2 });
  }
  pts.reverse();
  pts[0] = a; pts[pts.length - 1] = b;
  return { pts, hard };
}

// натянуть нить: клетки A* — ступеньками; оставляем те, между которыми видно
// напрямик (по свободному) — обход идёт под любым углом, а не по краям клеток
function pull(B, P) {
  const out = [P[0]];
  let i = 0;
  while (i < P.length - 1) {
    let j = i + 1;
    for (let k = Math.min(P.length - 1, i + 48); k > i + 1; k--) if (segFree(B, P[i], P[k])) { j = k; break; }
    out.push(P[j]);
    i = j;
  }
  return out;
}

// сгладить (Чайкин) и разметить шагом step; концы на месте
function chaikin(P, n) {
  for (let k = 0; k < n; k++) {
    const Q = [P[0]];
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i], b = P[i + 1];
      Q.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 }, { x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
    }
    Q.push(P[P.length - 1]);
    P = Q;
  }
  return P;
}
export function resample(P, step) {
  const out = [{ x: P[0].x, y: P[0].y, s: 0 }];
  let total = 0, next = step;
  for (let i = 0; i < P.length - 1; i++) {
    const a = P[i], b = P[i + 1], L = Math.hypot(b.x - a.x, b.y - a.y);
    while (L > 0 && next <= total + L) {
      const t = (next - total) / L;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, s: next });
      next += step;
    }
    total += L;
  }
  const last = P[P.length - 1], o = out[out.length - 1];
  if (Math.hypot(last.x - o.x, last.y - o.y) > step * 0.3) out.push({ x: last.x, y: last.y, s: total });
  return out;
}

// проложить: ideal — ломаная замысла; every — шаг вех; pad — коридор;
// smooth — сколько раз сглаживать; step — шаг разметки.
// Вехи — по замыслу, сдвинутые на свободное рядом; веху в глубине занятого
// пропускаем (обход найдёт A*), а не уводим далеко — иначе линия петляет.
// Концы — как даны.
export function route(B, ideal, { every = 240, pad = 120, smooth = 3, step = 6, wide = true, dist = null, slack = 30 } = {}) {
  let marks = [0];
  let acc = 0;
  for (let i = 1; i < ideal.length; i++) {
    acc += Math.hypot(ideal[i].x - ideal[i - 1].x, ideal[i].y - ideal[i - 1].y);
    if (acc >= every || i === ideal.length - 1) { marks.push(i); acc = 0; }
  }
  const W = [];
  marks = marks.filter((k, i) => {
    const q = (i === 0 || i === marks.length - 1) ? ideal[k] : freeNear(B, ideal[k], 4);
    if (q) W.push(q);
    return !!q;
  });
  let path = [W[0]];
  route.hard = 0;
  for (let m = 0; m < marks.length - 1; m++) {
    const a = W[m], b = W[m + 1];
    // замысел между вехами; если свободен — берём его как есть
    const chain = [a, ...ideal.slice(marks[m] + 1, marks[m + 1]), b];
    let ok = true;
    for (let k = 0; k < chain.length - 1 && ok; k++) ok = segFree(B, chain[k], chain[k + 1]);
    if (ok) { path.push(...chain.slice(1)); continue; }
    // обход: сначала в узком коридоре, если пришлось по занятому — в широком
    let band = null;
    if (dist) {
      let lo = Infinity, hi = -Infinity;
      for (const p of chain) { const d = dist(p.x, p.y); lo = Math.min(lo, d); hi = Math.max(hi, d); }
      band = { dist, lo: lo - slack, hi: hi + slack };
    }
    let found = astar(B, a, b, pad, band);
    if (wide && (!found || found.hard > 2)) {
      const wide = astar(B, a, b, pad * 2.5, band);
      if (wide && (!found || wide.hard < found.hard)) found = wide;
    }
    if (found) { route.hard += found.hard; path.push(...pull(B, found.pts).slice(1)); } else path.push(b);
  }
  path = chaikin(dedupe(path), smooth);
  return resample(path, step);
}
function dedupe(P) {
  const out = [P[0]];
  for (const p of P) if (Math.hypot(p.x - out[out.length - 1].x, p.y - out[out.length - 1].y) > 0.5) out.push(p);
  return out;
}
