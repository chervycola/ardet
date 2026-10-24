// ═══════════════════════════════════════
// РАСТИТЕЛЬНОСТЬ — рощи, одиночные деревья, аллеи, сады, камыш (канон
// world_cells: дубовая роща запада и лес поперёк лимеса, кипарисы сада
// Эпикура, бамбуковые леса и сосна востока, мох и болота севера, ковыль и
// курганы равнины, «в кадр приходит дерево», усадьба за деревьями).
// Вид — по стороне света и эпохе: в первых кольцах природа, к середине —
// сады, аллеи вдоль дорог, к краю растительность отступает: горелые стволы
// катастроф, пни, дерево в решётке у дороги. Рощи — пятнами по шуму, между
// ними поляны (много пустоты — канон кадра). Дерево не встаёт на постройку,
// двор, утварь, дорогу, реку и опору линии неба; камыш — по берегу ручья.
// Рисунок — render/floraProps.js.
// ═══════════════════════════════════════
import { TOWN, TS, RINGS_D, RING_WS, RING_EDGE, WORLD_W, WORLD_H, warpedDist, ringOfD, thinAt } from './disc.js';
import { sideAt, townZoneOf, townWarp, townEdge } from './relief.js';
import { PUDDLES } from './town.js';
import { locations } from './locations.js';
import { lines, onArtery, artBlock } from './arteries.js';
import { blockedAt } from './routes.js';
import { fieldAt } from './fields.js';

// виды: дуб, берёза, ель, сосна, кипарис, пальма, олива, бамбук, ива,
// тополь, плодовое, городское (в решётке), сухое, пень, куст
// [вид, вес] по кольцам 1…9; dens — сколько леса на стороне (1 — лес)
const S = (...rows) => rows.map(r => r.map(([sp, w]) => ({ sp, w })));
export const KINDS = {
  south: { dens: [0.3, 0.4, 0.45, 0.35, 0.3, 0.25, 0.35, 0.25, 0.15], rows: S(
    [['palm', 3], ['bush', 2]],
    [['cypress', 3], ['olive', 3], ['palm', 1], ['bush', 1]],
    [['cypress', 3], ['palm', 2], ['fruit', 1], ['bush', 1]],
    [['palm', 2], ['olive', 1], ['bush', 2]],
    [['palm', 2], ['cypress', 1], ['bush', 2]],
    [['palm', 1], ['bush', 1], ['stump', 1]],
    [['dead', 3], ['palm', 1], ['stump', 2]],
    [['palm', 2], ['street', 1]],
    [['palm', 1], ['street', 1], ['dead', 1]]) },
  east: { dens: [0.8, 0.85, 0.8, 0.75, 0.6, 0.45, 0.45, 0.3, 0.18], rows: S(
    [['bamboo', 3], ['pine', 1], ['bush', 2]],
    [['bamboo', 3], ['pine', 1], ['bush', 1]],
    [['pine', 3], ['fruit', 1], ['bamboo', 1]],
    [['bamboo', 2], ['pine', 2], ['willow', 1]],
    [['pine', 2], ['fruit', 1], ['bush', 1]],
    [['pine', 1], ['street', 1], ['stump', 1]],
    [['dead', 2], ['bamboo', 1], ['stump', 1]],
    [['street', 2], ['bush', 1]],
    [['street', 1]]) },
  west: { dens: [1.25, 1.1, 0.85, 0.8, 0.6, 0.45, 0.45, 0.3, 0.18], rows: S(
    [['oak', 4], ['spruce', 1], ['birch', 1], ['bush', 1]],
    [['oak', 3], ['spruce', 1], ['cypress', 1], ['bush', 1]],
    [['oak', 2], ['fruit', 2], ['cypress', 1]],
    [['oak', 2], ['fruit', 2], ['willow', 1]],
    [['poplar', 2], ['fruit', 1], ['oak', 1]],
    [['poplar', 2], ['oak', 1], ['street', 1]],
    [['dead', 3], ['stump', 2]],
    [['street', 2]],
    [['street', 1]]) },
  north: { dens: [0.9, 1.0, 0.9, 0.85, 0.7, 0.5, 0.45, 0.3, 0.15], rows: S(
    [['spruce', 2], ['birch', 2], ['bush', 2]],
    [['spruce', 3], ['birch', 1], ['bush', 1]],
    [['spruce', 3], ['birch', 1]],
    [['spruce', 3], ['birch', 1]],
    [['spruce', 2], ['birch', 1]],
    [['spruce', 2], ['stump', 1]],
    [['dead', 2], ['spruce', 1], ['stump', 1]],
    [['spruce', 1], ['stump', 1]],
    [['dead', 1]]) },
  plain: { dens: [0.08, 0.3, 0.8, 0.85, 0.7, 0.6, 0.45, 0.35, 0.18], rows: S(
    [['bush', 1]],
    [['bush', 2], ['birch', 1]],
    [['birch', 3], ['spruce', 2], ['willow', 1]],
    [['birch', 3], ['oak', 1], ['spruce', 1]],
    [['birch', 2], ['oak', 1], ['poplar', 1], ['willow', 1]],
    [['oak', 2], ['birch', 2], ['poplar', 1]],
    [['dead', 2], ['birch', 1], ['stump', 2]],
    [['poplar', 2], ['birch', 1], ['street', 1]],
    [['poplar', 1], ['dead', 1]]) },
};
// рост вида (для раскладки и рамки куска): ширина, высота
export const SIZE = {
  oak: [26, 34], birch: [14, 30], spruce: [16, 32], pine: [24, 30], cypress: [8, 30], palm: [22, 32],
  olive: [18, 18], bamboo: [14, 34], willow: [24, 26], poplar: [10, 40], fruit: [14, 16], street: [12, 22],
  dead: [18, 26], stump: [8, 5], bush: [12, 8], reed: [8, 12],
  deadspruce: [16, 34], snag: [8, 18], log: [36, 11],          // Мёртвый лес городка: сухая ель, обломанный ствол, бурелом
  deadreed: [12, 15],                                            // мёртвый камыш у отравы
};
// аллеи вдоль дорог: в каких кольцах какой стороны дорогу обсаживали
const ALLEY = { west: { 5: 'poplar', 6: 'poplar' }, plain: { 5: 'poplar', 6: 'birch', 8: 'poplar' }, south: { 6: 'palm' }, east: {}, north: {} };

export const flora = [];          // { sp, x, gy, v, ring, side, snow }

function h01(x, y, s) { let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vn(x, y, s) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = h01(ix, iy, s), b = h01(ix + 1, iy, s), c = h01(ix, iy + 1, s), d = h01(ix + 1, iy + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
// где роща: пятна по шуму (по глубине кадр сжат — пятна вытянуты по x);
// пятно — в полкадра, между пятнами поляны: в кадре и лес, и пустота
const grove = (x, y) => 0.6 * vn(x / 230, y / 135, 31) + 0.4 * vn(x / 80, y / 48, 37);
// рощ на кольце столько же, сколько было до просторных колец (disc.js: thinAt):
// роща той же густоты, а встают они пятнами крупнее рощи — лесные края и
// открытые; доля края, где рощи есть, — по площади кольца. Порог — по выборке
// самого шума (его значения не ровны: у середины чаще). Лес держится углов
// колец — там сходятся две стороны и ничьё жильё не стоит; у мест сторон его
// свели (в сумме рощ столько же)
const wood = (x, y) => vn(x / 320, y / 190, 39);
const WOODQ = (() => { const v = []; for (let i = 0; i < 4096; i++) v.push(wood(h01(i, 1, 61) * 4000, h01(i, 2, 61) * 4000)); return v.sort((a, b) => a - b); })();
const woodAt = keep => WOODQ[Math.min(WOODQ.length - 1, Math.floor(keep * WOODQ.length))];
const cornerAt = (x, y) => sm(-240, 0, Math.min(Math.max(TOWN.x0 - x, x - TOWN.x1), Math.max(TOWN.y0 - y, y - TOWN.y1)));
const CORNER_F = RING_WS.map((w, i) => {                                   // доля углов в площади кольца
  const d0 = RING_EDGE[i], d1 = RING_EDGE[i + 1], c = Math.PI * (d1 * d1 - d0 * d0);
  return c / (c + 2 * (TOWN.x1 - TOWN.x0 + TOWN.y1 - TOWN.y0) * w);
});
const CB = 1.5;
const keepAt = (ring, x, y) => Math.min(0.92, thinAt(ring) * (1 + CB * cornerAt(x, y)) / (1 + CB * CORNER_F[ring - 1]));
const sm = (a, b, v) => { const k = Math.max(0, Math.min(1, (v - a) / (b - a))); return k * k * (3 - 2 * k); };

function pick(list, r) {
  let sum = 0;
  for (const e of list) sum += e.w;
  let t = r * sum;
  for (const e of list) { t -= e.w; if (t <= 0) return e.sp; }
  return list[list.length - 1].sp;
}

// свободно ли место под дерево: не постройка, не двор, не дорога, не опора
function freeAt(x, y, r) {
  if (artBlock && (blockedAt(artBlock, x, y) || blockedAt(artBlock, x - r, y) || blockedAt(artBlock, x + r, y))) return false;
  return !onArtery(x, y, r + 3);
}
function taken(grid, x, y, r) {
  const k = Math.floor(x / 16) * 100000 + Math.floor(y / 16);
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
    const L = grid.get(k + i * 100000 + j);
    if (L) for (const t of L) if (Math.abs(t.x - x) < (t.r + r) && Math.abs(t.gy - y) < (t.r + r) * 0.6) return true;
  }
  return false;
}
function put(grid, t, r) {
  const k = Math.floor(t.x / 16) * 100000 + Math.floor(t.gy / 16);
  t.r = r;
  if (!grid.has(k)) grid.set(k, []);
  grid.get(k).push(t);
  flora.push(t);
}

// ── сборка: после артерий (обходим их и занятое) ──
// skip — боксы, куда не сажать (приметы); oases — колодцы оазисов: вокруг пальмы
export function buildFlora(skip = [], oases = []) {
  flora.length = 0; fgrid.clear();
  const grid = new Map();
  const add = (sp, x, gy, ring, side, seed) => {
    x = Math.round(x); gy = Math.round(gy);                                // проверяем там, где и встанет
    const r = Math.max(3, SIZE[sp][0] * 0.32);
    if (!freeAt(x, gy, r) || taken(grid, x, gy, r)) return false;
    const fl = fieldAt(x, gy);
    if (fl && fl.kind !== 'fallow') return false;                          // на пашне не растут (на заброшенной — пробиваются)
    for (const b of skip) if (x > b.x0 - r && x < b.x1 + r && gy > b.y0 && gy < b.y1 + 4) return false;
    put(grid, { sp, x: Math.round(x), gy: Math.round(gy), v: Math.floor(seed * 6), ring, side, snow: side === 'north' && ring >= 3 }, r);
    return true;
  };
  // 0) у колодца оазиса — пальмы кругом
  for (const o of oases) {
    let k = 0;
    for (const [dx, dy] of [[-15, -3], [14, -5], [3, -11], [-8, 7], [11, 6]]) {
      if (k >= 3) break;
      if (add('palm', o.x + dx, o.gy + dy, o.ring, o.side, h01(o.x, k, 17))) k++;
    }
  }
  // 1) аллеи: деревья вдоль дорог, ровным шагом, по обе руки
  for (const L of lines) {
    if (L.kind !== 'road') continue;
    let last = -1e9;
    for (let i = 2; i < L.pts.length - 2; i++) {
      const p = L.pts[i], n = ringOfD(p.d), side = sideAt(p.x, p.y), sp = ALLEY[side]?.[n];
      if (!sp || p.s - last < 26) continue;
      const a = L.pts[i - 2], b = L.pts[i + 2], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
      const off = p.hw + 8;
      let ok = false;
      for (const k of [-1, 1]) ok = add(sp, p.x - dy / l * off * k, p.y + dx / l * off * k * 0.8, n, side, h01(i, k, 3)) || ok;
      if (ok) last = p.s;
    }
  }
  // 2) камыш: по берегам ручья (не во льду), кустами
  const river = lines.find(l => l.kind === 'river');
  if (river) for (let i = 1; i < river.pts.length - 1; i += 2) {
    const p = river.pts[i];
    if (p.st !== 'stream' || p.ice || h01(i, 0, 5) < 0.45) continue;
    const a = river.pts[i - 1], b = river.pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    const k = h01(i, 1, 7) < 0.5 ? -1 : 1, off = p.hw + 2 + h01(i, 2, 9) * 3;
    const x = p.x - dy / l * off * k, y = p.y + dx / l * off * k;
    const r = 3;
    if (artBlock && blockedAt(artBlock, x, y)) continue;
    if (onArtery(x, y, 0, river) || taken(grid, x, y, r)) continue;
    put(grid, { sp: 'reed', x: Math.round(x), gy: Math.round(y), v: Math.floor(h01(i, 3, 11) * 6), ring: ringOfD(p.d), side: sideAt(x, y), snow: false }, r);
  }
  // 3) рощи и одиночные деревья: сетка 22 точки со сдвигом
  const C = 22;
  for (let gy = 0; gy < WORLD_H / C; gy++) for (let gx = 0; gx < WORLD_W / C; gx++) {
    const x = (gx + 0.15 + 0.7 * h01(gx, gy, 1)) * C, y = (gy + 0.15 + 0.7 * h01(gx, gy, 2)) * C;
    const d = warpedDist(x, y);
    if (d <= 30 || d > RINGS_D - 12) continue;
    const ring = ringOfD(d), side = sideAt(x, y), K = KINDS[side], keep = keepAt(ring, x, y);
    const q = woodAt(keep), dn = K.dens[ring - 1], g = grove(x, y) - 0.6 * sm(q - 0.05, q + 0.05, wood(x, y)), thr = 1 - 0.42 * dn;   // гуще лес — больше рощ
    const r = h01(gx, gy, 3);
    let p;
    if (g > thr) p = Math.min(0.55, 0.2 + (g - thr) * 3.5) * Math.min(1, 0.45 + dn);   // в роще: к середине гуще
    else p = 0.009 * dn * keep;                                             // поляна: изредка одно дерево
    p *= 0.35 + 1.3 * vn(x / 46, y / 28, 41);                               // куртинами, а не посыпкой
    if (r > p) continue;
    // вид — пятнами (дубрава, ельник, березняк), изредка вперемешку
    const patch = vn(x / 150, y / 90, 43) * 2.3 + 0.1, sp = pick(K.rows[ring - 1], h01(gx, gy, 5) < 0.2 ? h01(gx, gy, 4) : patch - Math.floor(patch));
    add(sp, x, y, ring, side, h01(gx, gy, 6));
  }
  // 4) Мёртвый лес городка (зона леса, world/relief.js): сухостой рощами — сухие ели,
  //    голые деревья, обломанные стволы, пни, бурелом. У мест — поляны (их боксы — в skip);
  //    трассировщик держит весь городок занятым — здесь своя проверка места
  const town = (sp, x, gy, seed) => {
    x = Math.round(x); gy = Math.round(gy);
    const r = Math.max(3, SIZE[sp][0] * 0.3);
    if (onArtery(x, gy, r + 3) || taken(grid, x, gy, r)) return false;
    for (const b of skip) if (x > b.x0 - r && x < b.x1 + r && gy > b.y0 && gy < b.y1 + 4) return false;
    put(grid, { sp, x, gy, v: Math.floor(seed * 6), ring: 0, side: 'town', snow: false, town: 'forest' }, r);
    return true;
  };
  const TF = 20, FOREST = [['dead', 40], ['deadspruce', 28], ['snag', 12], ['stump', 12], ['log', 8]].map(([sp, w]) => ({ sp, w }));
  for (let y = TOWN.y0 + 14; y < TOWN.y0 + 520 * TS; y += TF) for (let x = TOWN.x0 + 14; x < TOWN.x1 - 14; x += TF) {
    const gx = Math.round(x / TF), gy = Math.round(y / TF);
    const px = x + (h01(gx, gy, 51) - 0.5) * TF * 0.8, py = y + (h01(gx, gy, 52) - 0.5) * TF * 0.8;
    if (townEdge(px, py) > -12) continue;                                   // не на валу
    const [wx, wy] = townWarp(px, py);
    if (townZoneOf(px + wx, py + wy) !== 0) continue;                       // только в лесу
    const g = grove(px * 1.4, py * 1.4);
    let p = g > 0.5 ? Math.min(0.28, 0.12 + (g - 0.5) * 1.3) : 0.018;       // рощами; между ними — редкий сухостой
    p *= 0.4 + 1.2 * vn(px / 40, py / 26, 53);
    if (h01(gx, gy, 54) > p) continue;
    town(pick(FOREST, h01(gx, gy, 55)), px, py, h01(gx, gy, 56));
  }
  // 5) мёртвый камыш отравы: по берегу Токсичного озера — кустами, гуще с юга и
  //    запада; у луж с плёнкой — по кромке. Не на тропах, не друг на друге
  const reed = (x, gy, seed) => {
    x = Math.round(x); gy = Math.round(gy);
    if (onArtery(x, gy, 5) || taken(grid, x, gy, 4)) return;
    put(grid, { sp: 'deadreed', x, gy, v: Math.floor(seed * 6), ring: 0, side: 'town', snow: false, town: 'toxic' }, 4);
  };
  const lake = locations.find(l => l.id === 'lake');
  if (lake) {
    const cx = lake.x + 51, cy = lake.y + 30;                               // гладь озера (sprites/locations: draw_lake)
    for (let k = 0; k < 64; k++) {
      const a = k / 64 * Math.PI * 2, s = Math.sin(a), c = Math.cos(a);
      const want = 0.12 + 0.45 * Math.max(0, s) + 0.3 * Math.max(0, -c);      // юг и запад гуще, север — редко
      if (h01(k, 3, 91) > want) continue;
      const rr = 1.04 + h01(k, 4, 93) * 0.16;
      reed(cx + c * 50 * rr, cy + s * 29 * rr + 2, h01(k, 5, 95));
    }
  }
  for (const p of PUDDLES) for (let k = 0; k < 3; k++) {
    if (h01(p.x, k, 97) < 0.35) continue;
    const a = h01(p.x, k, 99) * Math.PI * 2;
    reed(p.x + Math.cos(a) * p.r * 1.25, p.y + Math.sin(a) * p.r * 0.6 + 1, h01(p.y, k, 101));
  }
  flora.sort((a, b) => a.gy - b.gy);
  for (const t of flora) {
    const k = Math.floor(t.x / FG) * 100000 + Math.floor(t.gy / FG);
    if (!fgrid.has(k)) fgrid.set(k, []);
    fgrid.get(k).push(t);
  }
  return flora;
}

// деревья в прямоугольнике (по подножию)
const FG = 128, fgrid = new Map();
export function floraIn(x0, y0, x1, y1) {
  const out = [];
  for (let gx = Math.floor(x0 / FG); gx <= Math.floor(x1 / FG); gx++) for (let gy = Math.floor(y0 / FG); gy <= Math.floor(y1 / FG); gy++) {
    const L = fgrid.get(gx * 100000 + gy);
    if (L) for (const t of L) if (t.x >= x0 && t.x < x1 && t.gy >= y0 && t.gy < y1) out.push(t);
  }
  return out;
}
