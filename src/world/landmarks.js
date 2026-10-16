// ═══════════════════════════════════════
// ПРИМЕТЫ — вещи, у которых есть причина стоять там, где стоят.
//   У реки, по её клеткам: у родника — дерево в лоскутах; на ручье севера —
//     вмёрзшая мельница; на льду канала — прорубь с ящиком рыбака; на канале
//     равнины — шлюз; на канале востока — баржа у стенки; на трубе — задвижка
//     с красным колесом; в сухом русле юга — лодка (канон: «устье без реки»).
//   На вершинах: на курганах равнины — каменные бабы (канон: «поле курганов
//     с каменными бабами»), потом деревянные кресты, потом триангуляционные
//     знаки; на моренах севера — сейды, дальше — гурии; на холмах запада —
//     менгир, распятие у дороги, мельница-столбовка, оптический телеграф;
//     на террасах востока — ступы; в низинах юга — колодец оазиса.
//   У дорог — там, где к ним примыкает кольцевая дуга: знак своей эпохи
//     (герма, камень с крестом, водокачка у рельсов, остановка у сети).
// Без надписей: приметы молчат, их читают по месту. Рисунок —
// render/landmarkProps.js.
// ═══════════════════════════════════════
import { RING_W, RINGS, WORLD_W, WORLD_H, warpedDist } from './disc.js';
import { sideAt, heightAt, kurgansIn } from './relief.js';
import { lines, onArtery, artBlock } from './arteries.js';
import { blockedAt } from './routes.js';
import { fieldAt } from './fields.js';

export const landmarks = [];      // { kind, x, gy, ring, side, seed, w, h, dir? }

// рамка вещи: ширина и высота (для свободного места и куска)
export const LM_SIZE = {
  clootie: [22, 24], frozenMill: [32, 22], iceHole: [16, 8], locks: [24, 14], barge: [34, 14], valve: [16, 14], boat: [28, 10],
  baba: [8, 13], cross: [8, 15], trig: [16, 30], seid: [14, 11], cairn: [9, 11], menhir: [6, 17], calvary: [10, 19],
  windmill: [28, 30], semaphore: [18, 26], stupa: [16, 15], oasis: [12, 7],
  pillbox: [18, 9], turbine: [26, 46], billboard: [22, 22], celltower: [12, 40],
  herm: [10, 15], khachkar: [9, 15], watertower: [16, 30], busstop: [20, 16],
};

function h01(x, y, s) { let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

// свободно ли: не постройка, двор, дорога, пашня, не другая примета;
// skip — линия, которой можно касаться (у реки — сама река)
function freeFor(kind, x, gy, extra = 0, skip = null) {
  const [w] = LM_SIZE[kind], r = w / 2 + 4 + extra;
  if (artBlock) for (const dx of [-r, 0, r]) for (const dy of [-6, 0, 3]) if (blockedAt(artBlock, x + dx, gy + dy)) return false;
  if (onArtery(x, gy, r, skip)) return false;
  const f = fieldAt(x, gy);
  if (f && f.kind !== 'fallow') return false;
  for (const l of landmarks) if (Math.abs(l.x - x) < (LM_SIZE[l.kind][0] + w) / 2 + 30 && Math.abs(l.gy - gy) < 40) return false;
  return true;
}
function place(kind, x, gy, seed, extra = {}) {
  const d = warpedDist(x, gy);
  landmarks.push({ kind, x: Math.round(x), gy: Math.round(gy), ring: Math.ceil(d / RING_W), side: sideAt(x, gy), seed, ...extra });
}

// вершина: выше всего вокруг на кольце в 50 точек (местный верх), с запасом
function summit(x, y) {
  const h = heightAt(x, y);
  let top = -Infinity, sum = 0;
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4, v = heightAt(x + Math.cos(a) * 50, y + Math.sin(a) * 25);
    top = Math.max(top, v); sum += v;
  }
  return { h, prom: h - top, rise: h - sum / 8 };
}

// ── сборка: после артерий и полей ──
export function buildLandmarks() {
  landmarks.length = 0;
  // 1) у реки — по клеткам
  const river = lines.find(l => l.kind === 'river');
  if (river) {
    const P = river.pts;
    const along = (pred, frac = 0.5) => { const run = P.filter(pred); return run.length ? run[Math.floor(run.length * frac)] : null; };
    const bank = (p, i, off, kind, seed) => {
      const a = P[Math.max(0, i - 2)], b = P[Math.min(P.length - 1, i + 2)], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
      for (const k of [1, -1]) {
        const x = p.x - dy / l * off * k, y = p.y + dx / l * off * k;
        if (freeFor(kind, x, y, 0, river)) { place(kind, x, y, seed, { dir: k, ax: dx / l, ay: dy / l }); return true; }
      }
      return false;
    };
    const at = p => P.indexOf(p);
    const spring = P[2];
    if (spring) bank(spring, 2, 16, 'clootie', 1);
    const ice3 = along(p => p.st === 'stream' && p.ice), c4 = along(p => p.st === 'canal' && p.ice && Math.ceil(p.d / RING_W) === 4, 0.4);
    if (ice3) bank(ice3, at(ice3), ice3.hw + 13, 'frozenMill', 2);
    if (c4) place('iceHole', c4.x, c4.y + 1, 3);
    const lock = along(p => p.st === 'canal' && !p.ice && sideAt(p.x, p.y) === 'plain', 0.55);
    if (lock) place('locks', lock.x, lock.y, 4, { ax: 0, ay: 0, ...dirAt(P, at(lock)) });
    const barge = along(p => p.st === 'canal' && sideAt(p.x, p.y) === 'east', 0.5);
    if (barge) bank(barge, at(barge), barge.hw - 4, 'barge', 5);
    const valve = along(p => p.st === 'pipe', 0.18);
    if (valve) bank(valve, at(valve), 9, 'valve', 6);
    const boat = along(p => p.st === 'dry' && Math.ceil(p.d / RING_W) === 9, 0.45);
    if (boat) place('boat', boat.x, boat.y + 2, 7, dirAt(P, at(boat)));
  }
  // 2) на курганах равнины: бабы → кресты → знаки
  const kurgans = kurgansIn(0, 0, WORLD_W, WORLD_H).filter(k => sideAt(k.x, k.y) === 'plain');
  const byRing = {};
  for (const k of kurgans) {
    const d = warpedDist(k.x, k.y), n = Math.ceil(d / RING_W);
    if (d <= 40 || n > RINGS) continue;
    (byRing[n] || (byRing[n] = [])).push(k);
  }
  for (const [n, list] of Object.entries(byRing)) {
    const ring = +n, kind = ring <= 3 ? 'baba' : ring <= 5 ? 'cross' : ring <= 8 ? 'trig' : null;
    if (!kind) continue;
    list.sort((a, b) => b.H - a.H);
    const want = kind === 'baba' ? 5 : kind === 'cross' ? 2 : 1;
    let got = 0;
    for (const k of list) {
      if (got >= want) break;
      const y = k.y + 2;                                             // вершина — подножие примета
      if (!freeFor(kind, k.x, y)) continue;
      place(kind, k.x, y, got + ring * 10);
      got++;
    }
  }
  // 3) вершины севера, запада, востока; низины юга — оазис
  const HILL = {
    north: { 1: ['seid', 3], 2: ['seid', 2], 3: ['cairn', 2], 4: ['cairn', 2], 5: ['cairn', 1], 6: ['cairn', 1] },
    west: { 1: ['menhir', 2], 3: ['calvary', 1], 4: ['windmill', 2], 5: ['semaphore', 2] },
    plain: { 1: ['baba', 2], 2: ['baba', 2] },                         // поле курганов: бабы и без кургана в рельефе
    east: { 1: ['stupa', 2], 2: ['stupa', 1] },
    south: { 1: ['oasis', 1], 2: ['oasis', 1], 3: ['oasis', 1] },
  };
  // внешние кольца: высоту занимает своё время — дот (катастрофы), ветряк (неон),
  // вышка связи (сейчас); на каждой стороне
  for (const side of ['north', 'south', 'west', 'east', 'plain']) {
    const H = HILL[side] || (HILL[side] = {});
    H[7] = ['pillbox', 3];
    H[8] = side === 'north' || side === 'plain' || side === 'west' ? ['turbine', 2] : ['celltower', 1];
    H[9] = ['celltower', 2];
  }
  const cand = {};
  for (let k = 0; k < 16000; k++) {
    const x = h01(k, 1, 31) * WORLD_W, y = h01(k, 2, 31) * WORLD_H, d = warpedDist(x, y);
    if (d <= 60 || d > RINGS * RING_W - 30) continue;
    const ring = Math.ceil(d / RING_W), side = sideAt(x, y), want = HILL[side]?.[ring];
    if (!want) continue;
    const s = summit(x, y), low = want[0] === 'oasis';
    const score = low ? -s.rise : s.rise;
    if (low ? s.rise > -1 : s.prom < -1.5) continue;                 // вершина (или низина) — по местности
    const key = side + ring;
    (cand[key] || (cand[key] = { want, list: [] })).list.push({ x, y, score });
  }
  for (const { want: [kind, n], list } of Object.values(cand)) {
    list.sort((a, b) => b.score - a.score);
    let got = 0;
    for (const c of list) {
      if (got >= n) break;
      if (landmarks.some(l => l.kind === kind && Math.hypot(l.x - c.x, l.gy - c.y) < 420)) continue;
      if (!freeFor(kind, c.x, c.y, kind === 'windmill' ? 10 : 0)) continue;
      place(kind, c.x, c.y, got + 50);
      got++;
    }
  }
  // 4) у дорог, где примыкает дуга: знак своей эпохи
  const WAY = { silk: 'herm', caravan: 'khachkar', winter: 'khachkar', portage: 'khachkar', rail: 'watertower', net: 'busstop' };
  for (const L of lines) {
    if (L.kind !== 'arc') continue;
    const kind = WAY[L.id.slice(4)];
    if (!kind) continue;                                     // ветки городка — без знака эпохи
    const ends = L.id === 'arc:net' ? netCrossings(L) : [L.pts[0], L.pts[L.pts.length - 1]];
    let i = 0;
    for (const e of ends) {
      i++;
      search: for (const r of [18, 28, 40, 54, 70]) for (let a = 0; a < 8; a++) {
        const ox = Math.cos(a * Math.PI / 4 + 0.4) * r, oy = Math.sin(a * Math.PI / 4 + 0.4) * r * 0.6;
        if (!freeFor(kind, e.x + ox, e.y + oy)) continue;
        place(kind, e.x + ox, e.y + oy, i + 70);
        break search;
      }
    }
  }
  // 5) щиты у дорог неона: рама без плаката, у самой обочины
  for (const L of lines) {
    if (L.kind !== 'road') continue;
    let last = -1e9;
    for (let i = 4; i < L.pts.length - 4; i += 3) {
      const p = L.pts[i];
      if (Math.ceil(p.d / RING_W) !== 8 || p.s - last < 260 || h01(i, 3, 41) > 0.35) continue;
      const a = L.pts[i - 3], b = L.pts[i + 3], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
      for (const k of [1, -1]) {
        const x = p.x - dy / l * (p.hw + 14) * k, y = p.y + dx / l * (p.hw + 14) * k;
        if (!freeFor('billboard', x, y)) continue;
        place('billboard', x, y, i + 90);
        last = p.s;
        break;
      }
    }
  }
  landmarks.sort((a, b) => a.gy - b.gy);
  return landmarks;
}
function dirAt(P, i) {
  const a = P[Math.max(0, i - 2)], b = P[Math.min(P.length - 1, i + 2)], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
  return { ax: dx / l, ay: dy / l };
}
// где сеть пересекает дороги сторон
function netCrossings(net) {
  const out = [];
  for (const L of lines) {
    if (L.kind !== 'road' || L.town) continue;
    let best = null, bd = Infinity;
    for (const p of L.pts) { const dd = Math.abs(p.d - 1730); if (dd < bd) { bd = dd; best = p; } }
    if (best) out.push(best);
  }
  return out;
}
// боксы примет — растительность их обходит
export const landmarkBoxes = () => landmarks.map(l => { const [w, h] = LM_SIZE[l.kind]; return { x0: l.x - w / 2 - 4, y0: l.gy - h, x1: l.x + w / 2 + 4, y1: l.gy + 6 }; });
