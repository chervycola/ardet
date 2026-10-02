// ═══════════════════════════════════════
// ЗЕМЛЯ ПОД ПОСТРОЙКАМИ — чтобы дом стоял, а не висел наклейкой.
// Плоское (двор, тень, тропинки от дверей к тропе, сор, трава)
// запекается в холст ансамбля один раз и ложится на землю под странника.
// У стены — сугроб, нанос песка, бурьян: рисуются сразу после постройки.
// Забор — кусками, по глубине вместе со странником. Двор — по эпохе и
// стороне света: утоптанная земля, плиты, брусчатка, гравий, доски,
// асфальт, бетон, плитка; у воды — вода.
// ═══════════════════════════════════════
import { SEGMENTS } from '../content/ulitsa_db.js';
import { TOWN, trailPoint } from '../world/disc.js';
import { ARCH_BY_RING } from '../sprites/arch/index.js';
import { t as now } from '../core/time.js';
import { hash } from './draw.js';

const NIGHT = [13, 11, 10], BONE = [217, 207, 184], ASH = [138, 141, 143];
const MIST = [61, 74, 58], SEPIA = [58, 48, 38], SAND = [176, 162, 132];

function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
function css(c, a = 1) {
  const r = c[0] | 0, g = c[1] | 0, b = c[2] | 0;
  return a >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;

// ── стиль: двор · забор · сор · трава (0..1) · у стены ──
const S = (yard, fence, junk, weeds, drift) => ({ yard, fence, junk, weeds, drift });
const STYLE = {
  axial: {
    south: S('paving', 'stone', 'shards', 0.3, 'sand'), east: S('earth', 'bamboo', 'stones', 0.5, null),
    west: S('earth', 'palisade', 'stones', 0.6, null), north: S('earth', 'cairn', 'stones', 0.3, 'snow'),
    plain: S('steppe', null, 'bones', 0.9, null),
  },
  porticoes: {
    south: S('paving', 'stone', 'shards', 0.3, 'sand'), east: S('earth', 'bamboo', 'stones', 0.5, null),
    west: S('cobble', 'stone', 'bricks', 0.4, null), north: S('earth', 'stone', 'stones', 0.4, 'snow'),
    plain: S('steppe', null, 'shards', 0.8, null),
  },
  lightgarden: {
    south: S('paving', 'brick', 'shards', 0.2, 'sand'), east: S('gravel', 'bamboo', 'stones', 0.3, null),
    west: S('cobble', 'stone', 'stones', 0.4, null), north: S('earth', 'palisade', 'stones', 0.3, 'snow'),
    plain: S('earth', 'wattle', 'stones', 0.7, null),
  },
  twohearths: {
    south: S('paving', 'brick', 'shards', 0.2, 'sand'), east: S('gravel', 'bamboo', 'stones', 0.3, null),
    west: S('cobble', 'brick', 'bricks', 0.4, null), north: S('earth', 'stone', 'stones', 0.3, 'snow'),
    plain: S('earth', 'palisade', 'stones', 0.7, null),
  },
  enlightenment: {
    south: S('sand', null, 'shards', 0.1, 'sand'), east: S('paving', 'brick', 'paper', 0.3, null),
    west: S('cobble', 'iron', 'paper', 0.3, null), north: S('gravel', 'picket', 'stones', 0.3, 'snow'),
    plain: S('paving', 'iron', 'stones', 0.4, null),
  },
  steamshadows: {
    south: S('sand', null, 'scrap', 0.1, 'sand'), east: S('boards', 'iron', 'scrap', 0.3, null),
    west: S('cobble', 'brick', 'bricks', 0.4, null), north: S('boards', 'picket', 'scrap', 0.3, 'snow'),
    plain: S('earth', 'picket', 'stones', 0.8, null),
  },
  catastrophes: {
    south: S('sand', 'barbed', 'scrap', 0.2, 'sand'), east: S('rubble', null, 'bricks', 0.3, null),
    west: S('rubble', null, 'bricks', 0.5, null), north: S('snow', 'cairn', 'scrap', 0.2, 'snow'),
    plain: S('asphalt', 'concrete', 'scrap', 0.6, null),
  },
  neon: {
    south: S('sand', 'mesh', 'cans', 0.2, 'sand'), east: S('asphalt', 'mesh', 'cans', 0.3, null),
    west: S('asphalt', 'mesh', 'paper', 0.4, null), north: S('concrete', 'mesh', 'scrap', 0.2, 'snow'),
    plain: S('asphalt', 'concrete', 'glass', 0.8, null),
  },
  now: {
    south: S('tile', 'hoarding', 'cans', 0.1, 'sand'), east: S('tile', 'mesh', 'paper', 0.1, null),
    west: S('tile', 'hoarding', 'cans', 0.2, null), north: S('concrete', 'mesh', 'scrap', 0.2, 'snow'),
    plain: S('tile', 'hoarding', 'glass', 0.5, null),
  },
};
// у воды и в песках — своя земля рядом с постройкой
const WET = new Set(['Фаросский маяк', 'драккар на берегу', 'пирс над глубиной', 'затопленный фарватер',
  'нефтяная платформа', 'библиотека у моря', 'островная обсерватория', 'павильон описи', 'мост львов']);
const BOG = new Set(['болото жертв']);
const ICE = new Set(['вмёрзший барк', 'хранилище семян']);
const DUNE = new Set(['пароход в песках', 'опера в песке', 'пляж «аренда солнца»', 'игла над пустыней', 'сфинкс в лесах']);

// ── поверхности двора: (x, y, g) → цвет или null ──
function surface(kind, x, y, g) {
  const h = hash(x, y, 7.1);
  switch (kind) {
    case 'earth':
      if (h > 0.9) return mix(g, NIGHT, 0.28);
      if (h > 0.84) return mix(g, BONE, 0.16);
      return mix(g, BONE, 0.07);
    case 'steppe': return null;
    case 'paving': {
      const row = Math.floor(y / 5), col = Math.floor((x + (row & 1) * 4) / 9);
      const sh = hash(col, row, 3.3);
      if (sh < 0.1) return null;                                  // плиту вынули
      if (y % 5 === 0 || (x + (row & 1) * 4) % 9 === 0) return mix(g, NIGHT, 0.26);
      if (sh > 0.86 && h > 0.7) return mix(g, NIGHT, 0.2);        // трещина
      return mix(g, BONE, 0.05 + sh * 0.06);
    }
    case 'cobble': {
      const row = y >> 1, ox = (row & 1) * 1;
      if ((y & 1) === 1 || (x + ox) % 3 === 2) return mix(g, NIGHT, 0.24);
      return mix(g, ASH, 0.08 + hash(((x + ox) / 3) | 0, row, 5.5) * 0.08);
    }
    case 'gravel':
      if (y % 3 === 0) return mix(g, BONE, 0.2);
      return h > 0.8 ? mix(g, NIGHT, 0.2) : mix(g, BONE, 0.08);
    case 'sand':
      if (Math.sin(x * 0.32 + y * 1.4 + Math.sin(x * 0.07) * 3) > 0.82) return mix(g, SAND, 0.34);
      return mix(g, SAND, 0.16);
    case 'snow':
      return h > 0.93 ? mix(g, BONE, 0.38) : mix(g, BONE, 0.55);
    case 'boards': {
      const row = Math.floor(y / 3);
      if (y % 3 === 2) return mix(NIGHT, g, 0.4);
      const off = (hash(row, 1, 9.9) * 20) | 0;
      if ((x + off) % 17 === 0) return mix(NIGHT, g, 0.5);       // стык досок
      return hash(((x + off) / 17) | 0, row, 4.4) > 0.5 ? [58, 40, 24] : [42, 38, 32];
    }
    case 'asphalt':
      if (h > 0.97) return mix(g, ASH, 0.12);                            // щебёнка
      return mix(g, NIGHT, 0.3);
    case 'concrete': {
      if (y % 7 === 0 || x % 14 === 0) return mix(g, NIGHT, 0.28);
      return mix(g, ASH, 0.09 + hash((x / 14) | 0, (y / 7) | 0, 2.2) * 0.06);
    }
    case 'tile': {
      // плитка — новенькая; посреди — перекладывают: песок под снятой
      const bx = Math.floor(x / 24), by = Math.floor(y / 12);
      if (hash(bx, by, 8.8) > 0.9) return mix(g, SAND, 0.26);
      if (y % 3 === 0 || x % 4 === 0) return mix(g, NIGHT, 0.2);
      return mix(g, ASH, 0.2);
    }
    case 'rubble':
      if (h > 0.9) return [58, 36, 24];
      if (h > 0.7) return mix(g, ASH, 0.24);
      return mix(g, NIGHT, 0.12);
    case 'water':
      if (h > 0.994) return mix(NIGHT, BONE, 0.6);                        // лунный блик
      if (y % 4 === 0 && hash((x / 5) | 0, y, 1.7) > 0.78) return mix(NIGHT, ASH, 0.26);
      return mix(NIGHT, g, 0.3);
    case 'shore':
      return h > 0.6 ? mix(g, BONE, 0.14) : mix(g, NIGHT, 0.12);
    case 'bog':
      if (h > 0.88) return mix(MIST, g, 0.3);                             // кочка
      return mix(NIGHT, MIST, 0.45);
    default: return mix(g, BONE, 0.07);
  }
}

// ── геометрия ансамбля ──
function rectDist(r, x, y) {
  const dx = Math.max(r.x0 - x, 0, x - r.x1), dy = Math.max(r.y0 - y, 0, y - r.y1);
  return Math.hypot(dx, dy);
}

const grounds = [];          // запекаемая земля ансамблей
export const archProps = []; // куски заборов: { x, gy, w, h, draw(ctx) }

// sign ids → локации; trail — точка тропы рядом с ансамблем
export function prepareArchGround(ensembles, locations) {
  grounds.length = 0; archProps.length = 0;
  const byId = new Map(locations.map(l => [l.id, l]));
  const arch = locations.filter(l => l.archDraw);
  const allBoxes = arch.map(l => ({ x0: l.x, y0: l.y, x1: l.x + l.w, y1: l.y + l.h }));
  const signs = locations.filter(l => l.streetForm);
  for (const e of ensembles) {
    const st = STYLE[e.ringId]?.[e.side];
    if (!st) continue;
    const g = hex(SEGMENTS[e.ring - 1].palette.ground);
    const members = arch.filter(l => l.archEns === e.id);
    if (!members.length) continue;
    const ms = members.map(l => ({ x: l.archX, gy: l.archGy, w: l.w, h: l.h, name: l.name, loc: l }));
    ms.sort((a, b) => a.x - b.x);

    // двор: фартуки перед постройками + перемычки между соседями
    const rects = ms.map(m => ({ x0: m.x - m.w / 2 - 8, y0: m.gy - 8, x1: m.x + m.w / 2 + 8, y1: m.gy + 22 }));
    for (let i = 1; i < ms.length; i++) {
      const a = ms[i - 1], b = ms[i];
      if (b.x - b.w / 2 - (a.x + a.w / 2) < 70) {
        rects.push({ x0: a.x, y0: Math.min(a.gy, b.gy) - 4, x1: b.x, y1: Math.max(a.gy, b.gy) + 20 });
      }
    }
    // таблички сцены — на земле двора, если рядом
    const ss = (e.signs || []).map(id => byId.get(id)).filter(Boolean);
    const near = ss.filter(s => ms.some(m => Math.abs(s.x + 7 - m.x) < m.w / 2 + 90 && Math.abs(s.y + s.h - m.gy) < 110));
    if (near.length && e.kind !== 'gate') {
      const xs = near.map(s => s.x + s.w / 2), ys = near.map(s => s.y + s.h);
      rects.push({ x0: Math.min(...xs) - 12, y0: Math.min(...ys) - 6, x1: Math.max(...xs) + 12, y1: Math.max(...ys) + 8 });
    }

    // особая земля у отдельных построек
    const patches = [];
    for (const m of ms) {
      const kind = WET.has(m.name) ? 'water' : BOG.has(m.name) ? 'bog' : ICE.has(m.name) ? 'snow' : DUNE.has(m.name) ? 'sand' : null;
      if (!kind) continue;
      // вода — с одной стороны: наружу от соседей по двору, у одиночки — как выпадет
      const mid = ms.reduce((a, o) => a + o.x, 0) / ms.length;
      const dir = ms.length > 1 && Math.abs(m.x - mid) > 4 ? Math.sign(m.x - mid) : (hash(m.x, m.gy, 1.1) > 0.5 ? 1 : -1);
      if (kind === 'water') {
        // море — полосой от стены в сторону, за край двора; порог сухой
        const len = 130 + m.w * 0.6;
        const x0 = dir > 0 ? m.x + 16 : m.x - 16 - len, x1 = dir > 0 ? m.x + 16 + len : m.x - 16;
        patches.push({ kind, sea: { x0, x1, y0: m.gy - 6, y1: m.gy + 30, dir }, r: { x0, y0: m.gy - 10, x1, y1: m.gy + 34 } });
      } else if (kind === 'bog') {
        const rx = Math.max(26, m.w * 0.42), ry = 13;
        const ex = m.x + dir * (m.w * 0.3 + rx * 0.7), ey = m.gy + 10;
        patches.push({ kind, e: { cx: ex, cy: ey, rx, ry }, r: { x0: ex - rx, y0: ey - ry, x1: ex + rx, y1: ey + ry } });
      } else patches.push({ kind, r: { x0: m.x - m.w / 2 - 14, y0: m.gy - 10, x1: m.x + m.w / 2 + 14, y1: m.gy + 24 } });
    }

    // тропинки: от дверей — к тропе (ворота) или к калитке двора и дальше
    const paths = [];
    const front = Math.max(...ms.map(m => m.gy)) + 24;
    const cx = (ms[0].x + ms[ms.length - 1].x) / 2;
    const tr = e.trail;
    if (e.kind === 'gate' && tr) {
      for (const m of ms) {
        if (e.side === 'south' || e.side === 'north') {
          paths.push([[m.x, m.gy + 3], [m.x, m.gy + 12], [(m.x + tr.x) / 2, m.gy + 15], [tr.x, m.gy + 16]]);
        } else if (m.gy < tr.y) {
          paths.push([[m.x, m.gy + 3], [m.x + 3, (m.gy + tr.y) / 2], [m.x + 6, tr.y]]);
        } else {
          paths.push([[m.x, m.gy + 3], [m.x - 4, m.gy + 14], [m.x - 14, m.gy + 22]]);
        }
      }
    } else {
      // калитка — там, где в заборе проём (фронт двора), иначе перед домами
      const fenced = !!st.fence;
      const gy0 = fenced ? Math.max(...rects.map(r => r.y1)) + 8 : front + 6;
      const gate = [cx, gy0];
      for (const m of ms) paths.push([[m.x, m.gy + 3], [m.x, m.gy + 10], [(m.x + gate[0]) / 2, (m.gy + 10 + gate[1]) / 2], gate]);
      // хвост — из калитки прямо, потом к тропе (или к городку), тает
      let tx, ty;
      if (tr) { tx = tr.x; ty = tr.y; } else { tx = cx - 400; ty = gy0 + 300; }
      const out = [gate[0], gate[1] + 10];
      const L = Math.hypot(tx - out[0], ty - out[1]) || 1, k = Math.min(1, 80 / L);
      paths.push({ tail: true, pts: [gate, out, [out[0] + (tx - out[0]) * k * 0.5, out[1] + (ty - out[1]) * k * 0.5 + 4], [out[0] + (tx - out[0]) * k, out[1] + (ty - out[1]) * k]] });
    }

    // границы холста
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const grow = (a, b, c, d) => { x0 = Math.min(x0, a); y0 = Math.min(y0, b); x1 = Math.max(x1, c); y1 = Math.max(y1, d); };
    for (const r of rects) grow(r.x0 - 8, r.y0 - 8, r.x1 + 8, r.y1 + 8);
    for (const p of patches) grow(p.r.x0 - 8, p.r.y0 - 8, p.r.x1 + 8, p.r.y1 + 8);
    for (const p of paths) for (const [px, py] of (p.pts || p)) grow(px - 4, py - 4, px + 4, py + 4);
    for (const m of ms) grow(m.x - m.w / 2 - 20, m.gy - 12, m.x + m.w / 2 + 24, m.gy + 30);
    x0 = Math.floor(x0); y0 = Math.floor(y0); x1 = Math.ceil(x1); y1 = Math.ceil(y1);

    grounds.push({ e, st, g, ms, rects, patches, paths, x0, y0, x1, y1, canvas: null });

    // у стены: сугроб / нанос / бурьян / обломки — после постройки
    for (const m of ms) m.loc.archFoot = footFor(m, st, g, ms.length);

    // забор: двор и посёлок — буквой П, калитка спереди по тропинке
    if (st.fence && e.kind !== 'gate' && e.kind !== 'landmark') {
      // забор обходит весь мощёный двор, вместе с табличками сцены
      const yb = { x0: Math.min(...rects.map(r => r.x0)), x1: Math.max(...rects.map(r => r.x1)), y1: Math.max(...rects.map(r => r.y1)) };
      const water = patches.filter(p => p.kind === 'water' || p.kind === 'bog').map(p => p.r);
      fenceFor(e, st, ms, yb, cx, signs, allBoxes, water);
    }
    // утварь двора: колодец, телега, стог… — из модуля кольца; не в воде
    propsFor(e, ms, signs, allBoxes, patches.filter(p => p.kind === 'water' || p.kind === 'bog').map(p => p.r));
  }
}

// ── у стены ──
function footFor(m, st, g, n) {
  const out = [];
  const x0 = Math.round(m.x - m.w / 2) + 2, x1 = Math.round(m.x + m.w / 2) - 2, gy = m.gy;
  const seed = m.x * 0.37 + m.gy * 0.11;
  if (st.drift === 'snow' || ICE.has(m.name)) {
    // сугроб у стены — по ветру выше слева
    let x = x0;
    while (x < x1) {
      const run = 3 + ((hash(x, gy, seed) * 6) | 0);
      const hh = 1 + ((hash(x, gy, seed + 1) * 3) | 0);
      if (hash(x, gy, seed + 2) > 0.18) out.push([x, gy - hh + 1, Math.min(run, x1 - x), hh, css(BONE, 0.82)]);
      x += run;
    }
  } else if (st.drift === 'sand' || DUNE.has(m.name)) {
    let x = x0;
    const W = Math.max(1, x1 - x0);
    while (x < x1) {
      const run = 4 + ((hash(x, gy, seed) * 5) | 0);
      const f = 1 - (x - x0) / W;                    // ветер с запада: нанос слева
      const hh = 1 + Math.round(f * 3 * hash(x, gy, seed + 3) + f);
      out.push([x, gy - hh + 1, Math.min(run, x1 - x), hh, css(mix(g, SAND, 0.42))]);
      x += run;
    }
  }
  // бурьян у стены
  const tufts = Math.round((m.w / 14) * st.weeds) + (n > 1 ? 0 : 1);
  const weed = st.drift === 'snow' ? mix(MIST, BONE, 0.35) : st.drift === 'sand' ? [90, 82, 54] : MIST;
  for (let i = 0; i < tufts; i++) {
    const tx = Math.round(x0 + hash(i, gy, seed + 4) * (x1 - x0));
    const th = 2 + ((hash(i, gy, seed + 5) * 4) | 0);
    out.push([tx, gy - th + 1, 1, th, css(weed)]);
    out.push([tx + 1, gy - th + 2, 1, th - 1, css(weed)]);
    if (hash(i, gy, seed + 6) > 0.6) out.push([tx - 1, gy - th + 3, 1, th - 2, css(mix(weed, ASH, 0.3))]);
  }
  return out;
}

export function drawArchFoot(ctx, loc) {
  const f = loc.archFoot;
  if (!f) return;
  for (const r of f) { ctx.fillStyle = r[4]; ctx.fillRect(r[0], r[1], r[2], r[3]); }
}

// ── сор ──
const JUNK = {
  shards: [[107, 82, 54], [58, 36, 24], ASH],
  stones: [[52, 48, 42], [42, 38, 32], mix(ASH, NIGHT, 0.3)],
  bones: [mix(BONE, NIGHT, 0.35), [176, 162, 132]],
  bricks: [[58, 36, 24], [74, 48, 32]],
  scrap: [ASH, NIGHT, [58, 51, 40]],
  glass: [mix(BONE, NIGHT, 0.2), ASH],
  paper: [mix(BONE, NIGHT, 0.45), [200, 184, 154]],
  cans: [ASH, mix(ASH, NIGHT, 0.4), [194, 59, 43]],
};

// ── запекание ──
function bake(G) {
  const doc = typeof document !== 'undefined' ? document : null;
  if (!doc || !doc.createElement) return null;
  const W = G.x1 - G.x0, H = G.y1 - G.y0;
  const c = doc.createElement('canvas');
  if (!c.getContext) return null;
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  if (!x || !x.createImageData) return null;
  const img = x.createImageData(W, H), d = img.data;
  const { st, g } = G;
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const wx = px + G.x0, wy = py + G.y0;
      let col = null;
      // особая земля поверх двора
      for (const p of G.patches) {
        if (p.sea) {
          // берег неровный: кромка гуляет; у кромки — пена
          const S = p.sea;
          const edge = S.dir > 0 ? S.x0 + 6 * Math.sin(wy * 0.21) + 4 * Math.sin(wy * 0.07 + 1) : S.x1 - 6 * Math.sin(wy * 0.21) - 4 * Math.sin(wy * 0.07 + 1);
          const inside = S.dir > 0 ? wx > edge : wx < edge;
          // верх и низ полосы тоже неровные — бухта, а не лента
          const top = S.y0 + 3 * Math.sin(wx * 0.09) + 2 * Math.sin(wx * 0.23 + 2);
          const bot = S.y1 - 4 - 3 * Math.sin(wx * 0.07 + 1) - 2 * Math.sin(wx * 0.19);
          if (wy < top || wy > bot || wx < S.x0 - 8 || wx > S.x1 + 8) continue;
          const dEdge = Math.abs(wx - edge);
          const far = S.dir > 0 ? S.x1 - wx : wx - S.x0;          // к дальнему краю — растворяется
          if (far < 0 || (far < 24 && hash(wx, wy, 8.1) > far / 24)) continue;
          if ((wy > bot - 2 || wy < top + 1) && hash(wx, wy, 9.3) > 0.5) continue;
          if (inside && dEdge < 2) { col = mix(NIGHT, BONE, 0.55); break; }   // пена
          if (inside) { col = surface('water', wx, wy, g); break; }
          if (dEdge < 5) { col = surface('shore', wx, wy, g); break; }
          continue;
        }
        if (p.e) {
          const q = Math.hypot((wx - p.e.cx) / p.e.rx, (wy - p.e.cy) / p.e.ry)
            + (hash((wx / 3) | 0, (wy / 2) | 0, 5.1) - 0.5) * 0.18;
          if (q < 0.86) { col = surface(p.kind, wx, wy, g); break; }
          if (q < 1.02) { col = surface(p.kind === 'water' ? 'shore' : 'bog', wx, wy, g); break; }
          continue;
        }
        const dd = rectDist(p.r, wx, wy);
        if (dd > 8) continue;
        const cov = 1 - dd / 8 - (hash(wx, wy, 6.6) - 0.5) * 0.5;
        if (cov > bayer(wx, wy)) { col = surface(p.kind, wx, wy, g); break; }
      }
      if (!col && st.yard !== 'steppe') {
        let dd = Infinity;
        for (const r of G.rects) { dd = Math.min(dd, rectDist(r, wx, wy)); if (dd === 0) break; }
        if (dd < 7) {
          const cov = 1 - dd / 7 - (hash(wx, wy, 2.9) - 0.5) * 0.6;
          if (cov > bayer(wx, wy)) col = surface(st.yard, wx, wy, g);
        }
      }
      if (!col) continue;
      const i = (py * W + px) * 4;
      d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 215;
    }
  }
  x.putImageData(img, 0, 0);
  x.translate(-G.x0, -G.y0);
  const R = (a, b, w, h, cl) => { x.fillStyle = cl; x.fillRect(Math.round(a), Math.round(b), w, h); };

  // трещины и лужи по асфальту и бетону — ломаной, не узором
  if (st.yard === 'asphalt' || st.yard === 'concrete' || st.yard === 'tile') {
    const crack = css(mix(g, NIGHT, 0.6), 0.8);
    const nC = st.yard === 'tile' ? 1 : 3;
    for (let k = 0; k < nC; k++) {
      const r0 = G.rects[k % G.rects.length];
      let cx = r0.x0 + hash(k, 1, G.x0) * (r0.x1 - r0.x0), cy = r0.y0 + hash(k, 2, G.y0) * (r0.y1 - r0.y0);
      for (let i = 0; i < 22; i++) {
        R(cx, cy, 1, 1, crack);
        cx += hash(k, i, 3.3) > 0.3 ? 1 : -1;
        cy += hash(i, k, 4.4) > 0.6 ? 1 : hash(i, k, 5.5) > 0.7 ? -1 : 0;
        if (hash(i, k, 6.6) > 0.93) break;
      }
    }
    if (st.yard === 'asphalt') {
      for (let k = 0; k < 2; k++) {
        const r0 = G.rects[(k + 1) % G.rects.length];
        const px = Math.round(r0.x0 + 8 + hash(k, 7, G.x0) * Math.max(1, r0.x1 - r0.x0 - 16));
        const py = Math.round(r0.y0 + 6 + hash(k, 8, G.y0) * Math.max(1, r0.y1 - r0.y0 - 10));
        const pw = 6 + ((hash(k, 9, 1) * 8) | 0);
        R(px - pw / 2, py, pw, 2, css(NIGHT, 0.85)); R(px - pw / 2 + 2, py - 1, pw - 4, 1, css(NIGHT, 0.85));
        R(px - pw / 2 + 1, py, 2, 1, css(ASH, 0.35));                 // отблеск
      }
    }
  }

  // тени: у подножия и короткая отброшенная — луна за постройками
  for (const m of G.ms) {
    R(m.x - m.w * 0.46, m.gy - 1, Math.round(m.w * 0.92), 3, css(NIGHT, 0.45));
    const L = Math.max(3, Math.min(12, Math.round(m.h * 0.12)));
    for (let i = 0; i < L; i++) {
      R(m.x - m.w * 0.42 + i * 0.8, m.gy + 2 + i, Math.round(m.w * 0.84), 1, css(NIGHT, 0.26 * (1 - i / L)));
    }
  }
  // тропинки: утоптанная полоса темнее двора, края рваные; по мощёному
  // двору тропинок нет — только от калитки наружу
  const pathCol = mix(g, NIGHT, 0.22);
  const HARD = new Set(['paving', 'cobble', 'gravel', 'boards', 'asphalt', 'concrete', 'tile', 'rubble']);
  const onYard = (x, y) => HARD.has(st.yard) && G.rects.some(r => x >= r.x0 - 2 && x <= r.x1 + 2 && y >= r.y0 - 2 && y <= r.y1 + 2);
  for (const p of G.paths) {
    const pts = p.pts || p, tail = !!p.tail;
    let total = 0;
    for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    let run = 0;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      const L = Math.hypot(bx - ax, by - ay);
      for (let s = 0; s < L; s += 1) {
        const f = s / (L || 1), px = Math.round(ax + (bx - ax) * f), py = Math.round(ay + (by - ay) * f);
        if (onYard(px, py)) continue;
        const k = tail ? 1 - (run + s) / total : 1;
        if (hash(px, py, 3.7) > k + 0.15) continue;           // хвост тает
        const a = 0.55 * Math.max(0.35, k);
        R(px - 1, py - 1, 3, 3, css(pathCol, a));
        if (hash(px, py, 5.9) > 0.6) R(px + (hash(px, py, 2) > 0.5 ? 2 : -2), py, 1, 1, css(pathCol, a * 0.7));
      }
      run += L;
    }
  }
  // сор вокруг
  const junk = JUNK[st.junk] || JUNK.stones;
  for (const m of G.ms) {
    const n = Math.round(m.w / 7);
    for (let i = 0; i < n; i++) {
      const hx = hash(i, m.gy, m.x * 0.1), hy = hash(m.x, i, 4.2);
      const ox = m.x + (hx - 0.5) * (m.w + 40), oy = m.gy + 2 + hy * 22;
      const cl = junk[(hash(i, 3, m.x) * junk.length) | 0];
      const big = hash(i, 9, m.gy) > 0.7;
      R(ox, oy, big ? 2 : 1, 1, css(cl, 0.85));
      if (big && hash(i, 5, m.x) > 0.5) R(ox + 1, oy - 1, 1, 1, css(mix(cl, BONE, 0.2), 0.7));
    }
  }
  // трава пучками по краю двора (на равнине — ковыль по всей земле)
  const steppe = st.yard === 'steppe';
  const tuftCol = st.drift === 'snow' ? mix(MIST, BONE, 0.3) : steppe ? [90, 82, 54] : MIST;
  const nT = Math.round(((G.x1 - G.x0) * (G.y1 - G.y0)) / 900 * st.weeds);
  for (let i = 0; i < nT; i++) {
    const px = G.x0 + hash(i, 7, G.x0) * (G.x1 - G.x0), py = G.y0 + hash(i, 11, G.y0) * (G.y1 - G.y0);
    let dd = Infinity;
    for (const r of G.rects) dd = Math.min(dd, rectDist(r, px, py));
    if (!steppe && (dd < 2 || dd > 16)) continue;          // по кромке, не посреди двора
    if (G.ms.some(m => px > m.x - m.w / 2 && px < m.x + m.w / 2 && py > m.gy - m.h && py < m.gy)) continue;
    const th = 1 + ((hash(i, 13, 1) * 3) | 0);
    R(px, py - th, 1, th, css(tuftCol, 0.9));
    R(px + 1, py - th + 1, 1, th - 1 || 1, css(tuftCol, 0.7));
  }
  return c;
}

// LRU: запечённые холсты живут, пока нужны
const MAX_BAKED = 24;
const baked = [];
export function drawArchGround(ctx, camX, camY, vw, vh) {
  let budget = 1;                     // не больше одного запекания за кадр — без рывков
  for (const G of grounds) {
    if (G.x1 < camX - 80 || G.x0 > camX + vw + 80 || G.y1 < camY - 80 || G.y0 > camY + vh + 80) continue;
    if (!G.canvas) {
      if (G.canvas === false || budget <= 0) continue;
      budget--;
      G.canvas = bake(G) || false;
      if (!G.canvas) continue;
      baked.push(G);
      if (baked.length > MAX_BAKED) { const old = baked.shift(); old.canvas = null; }
    }
    ctx.drawImage(G.canvas, G.x0, G.y0);
  }
}

// ── заборы ──
// кусок забора: горизонтальный (вдоль x) или боковой (вдоль y — в глубину)
const pieceCache = new Map();
function pieceCanvas(style, vert, len, v) {
  const key = `${style}:${vert ? 1 : 0}:${len}:${v}`;
  let c = pieceCache.get(key);
  if (c !== undefined) return c;
  const doc = typeof document !== 'undefined' ? document : null;
  c = null;
  if (doc && doc.createElement) {
    const H = 16;
    const cv = doc.createElement('canvas');
    if (cv.getContext) {
      cv.width = vert ? 6 : len; cv.height = vert ? len + H : H;
      const x = cv.getContext('2d');
      if (x) { drawFence(x, style, vert, len, H, v); c = cv; }
    }
  }
  pieceCache.set(key, c);
  return c;
}

// рисует кусок в локальных координатах: низ — y = H (горизонтальный)
// или y = H..H+len (боковой, столбы сверху вниз)
function drawFence(x, style, vert, len, H, v) {
  const R = (a, b, w, h, cl) => { x.fillStyle = cl; x.fillRect(a, b, w, h); };
  const hv = (i, s) => hash(i, v, s);
  const posts = (step, fn) => {
    if (vert) for (let y = 0; y < len; y += step) fn(2, H + y, y);
    else for (let p = 0; p < len; p += step) fn(p, H, p);
  };
  switch (style) {
    case 'stone': {     // низкая кладка
      if (vert) { R(1, H - 5, 4, len + 5, '#3a3328'); R(1, H - 5, 4, 1, css(ASH, 0.45)); for (let y = 0; y < len; y += 4) R(1, H + y, 4, 1, '#2a2620'); break; }
      R(0, H - 5, len, 5, '#3a3328');
      for (let p = 0; p < len; p++) if (hv(p, 1) > 0.15) R(p, H - 5 - (hv(p, 2) > 0.8 ? 1 : 0), 1, 1, css(ASH, 0.45));
      for (let p = 0; p < len; p += 4) R(p + (hv(p, 3) > 0.5 ? 1 : 0), H - 3, 1, 2, '#2a2620');
      break;
    }
    case 'palisade': {   // частокол, заострённый
      if (vert) { R(1, H - 11, 3, len + 11, '#241c14'); for (let y = 0; y < len; y += 2) R(1 + (y & 2 ? 1 : 0), H - 12 + y, 1, 1, '#3a2818'); break; }
      for (let p = 0; p < len; p += 3) {
        const hh = 10 + (hv(p, 1) * 3 | 0);
        R(p, H - hh, 2, hh, '#241c14'); R(p, H - hh - 1, 1, 1, '#3a2818');
        if (hv(p, 2) > 0.6) R(p, H - hh + 2, 1, hh - 3, '#3a2818');
      }
      break;
    }
    case 'wattle': {     // плетень
      posts(vert ? 4 : 6, (a, b) => R(a, b - 9, 1, 9, '#241c14'));
      if (vert) { R(2, H - 7, 1, len + 6, '#3a2818'); break; }
      for (const yy of [2, 4, 6]) for (let p = (yy / 2) & 1 ? 0 : 2; p < len; p += 4) R(p, H - yy, 3, 1, (p / 4) & 1 ? '#3a2818' : '#2a2620');
      break;
    }
    case 'picket': {     // штакетник
      if (vert) { for (let y = 0; y < len; y += 3) R(2, H + y - 7, 1, 7, '#5a5236'); R(2, H - 5, 1, len + 2, '#34302a'); break; }
      R(0, H - 2, len, 1, '#34302a'); R(0, H - 5, len, 1, '#34302a');
      for (let p = 0; p < len; p += 3) if (hv(p, 1) > 0.12) { R(p, H - 7, 1, 7, '#5a5236'); R(p, H - 8, 1, 1, '#6a6246'); }
      break;
    }
    case 'iron': {       // кованая решётка на цоколе
      if (vert) { R(1, H - 2, 4, len + 2, '#3a3328'); for (let y = 0; y < len; y += 3) R(2, H + y - 10, 1, 9, '#0D0B0A'); R(2, H - 10, 1, len, '#0D0B0A'); break; }
      R(0, H - 2, len, 2, '#3a3328'); R(0, H - 9, len, 1, '#0D0B0A');
      for (let p = 1; p < len; p += 3) { R(p, H - 10, 1, 8, '#0D0B0A'); R(p, H - 11, 1, 1, css(ASH, 0.6)); }
      break;
    }
    case 'brick': {
      if (vert) { R(1, H - 8, 4, len + 8, '#3a2418'); R(1, H - 9, 4, 1, '#4a3020'); for (let y = 0; y < len; y += 3) R(1, H + y - 6, 4, 1, '#2a1a12'); break; }
      R(0, H - 8, len, 8, '#3a2418'); R(0, H - 9, len, 1, '#4a3020');
      for (let r = 0; r < 3; r++) { R(0, H - 8 + r * 3 + 2, len, 1, '#2a1a12'); for (let p = (r & 1) * 2; p < len; p += 4) R(p, H - 8 + r * 3, 1, 2, '#2a1a12'); }
      break;
    }
    case 'concrete': {   // плиты с ромбиками
      if (vert) { R(1, H - 12, 4, len + 12, '#34302a'); R(1, H - 12, 4, 1, css(ASH, 0.35)); for (let y = 0; y < len; y += 14) R(1, H + y, 4, 1, '#0D0B0A'); break; }
      R(0, H - 12, len, 12, '#34302a'); R(0, H - 12, len, 1, css(ASH, 0.35));
      R(len - 1, H - 12, 1, 12, '#0D0B0A');
      for (let yy = 2; yy < 11; yy += 2) for (let p = (yy & 2) ? 2 : 0; p < len - 1; p += 4) R(p, H - 12 + yy, 1, 1, '#2a2620');
      break;
    }
    case 'mesh': {       // рабица
      posts(vert ? 12 : 12, (a, b) => R(a, b - 10, 1, 10, css(ASH, 0.55)));
      if (vert) { for (let y = 0; y < len; y += 2) R(2, H + y - 8, 1, 6, css(ASH, 0.18)); break; }
      R(0, H - 10, len, 1, css(ASH, 0.4));
      for (let yy = 1; yy < 9; yy++) for (let p = yy & 1; p < len; p += 2) R(p, H - 10 + yy, 1, 1, css(ASH, 0.16));
      break;
    }
    case 'barbed': {     // колючка на кривых столбах
      posts(vert ? 8 : 10, (a, b, i) => R(a + (hash(i, v, 1) > 0.6 ? 1 : 0), b - 9, 1, 9, '#241c14'));
      if (vert) { R(2, H - 7, 1, len + 4, css(ASH, 0.45)); R(3, H - 4, 1, len + 4, css(ASH, 0.35)); break; }
      for (const yy of [3, 6, 8]) {
        R(0, H - yy, len, 1, css(ASH, 0.5));
        for (let p = 1; p < len; p += 3) R(p, H - yy - (p & 1 ? 1 : -1), 1, 1, css(ASH, 0.5));
      }
      break;
    }
    case 'hoarding': {   // стройзабор, на нём напечатано светлое будущее
      if (vert) { R(1, H - 13, 3, len + 13, '#2a2620'); for (let y = 0; y < len; y += 10) R(1, H + y, 3, 1, '#0D0B0A'); break; }
      R(0, H - 13, len, 13, '#2a2620');
      R(1, H - 12, len - 2, 9, '#3a3328');
      for (let p = 0; p < len; p += 16) R(p, H - 13, 1, 13, '#0D0B0A');
      // печать: домик и деревце — серым, без тепла
      const ox = 3 + ((hv(0, 6) * Math.max(1, len - 12)) | 0);
      R(ox, H - 8, 5, 4, css(ASH, 0.5)); R(ox + 1, H - 10, 3, 2, css(ASH, 0.5)); R(ox + 2, H - 7, 1, 2, '#3a3328');
      R(ox + 8, H - 9, 3, 3, css(ASH, 0.4)); R(ox + 9, H - 6, 1, 2, css(ASH, 0.4));
      break;
    }
    case 'bamboo': {
      if (vert) { R(2, H - 11, 1, len + 11, '#3a3328'); for (let y = 0; y < len; y += 3) R(2, H + y - 6, 1, 1, '#b0a284'); break; }
      for (let p = 0; p < len; p += 3) { R(p, H - 11, 1, 11, '#3a3328'); R(p, H - 4 - (p % 2), 1, 1, '#b0a284'); R(p, H - 8 - (p % 2), 1, 1, '#b0a284'); }
      R(0, H - 3, len, 1, '#241c14'); R(0, H - 9, len, 1, '#241c14');
      break;
    }
    case 'cairn': {      // межа из камней
      posts(vert ? 10 : 9, (a, b) => { R(a - 1, b - 3, 4, 3, '#34302a'); R(a, b - 5, 2, 2, css(ASH, 0.5)); });
      break;
    }
  }
}

// тропа рядом с точкой (забор её не перегораживает)
function onTrail(side, x, y) {
  if (side === 'south' || side === 'north') {
    const d = side === 'south' ? y - TOWN.y1 : TOWN.y0 - y;
    return d >= 0 && Math.abs(trailPoint(side, d).x - x) < 10;
  }
  if (side === 'east' || side === 'west') {
    const d = side === 'east' ? x - TOWN.x1 : TOWN.x0 - x;
    return d >= 0 && Math.abs(trailPoint(side, d).y - y) < 10;
  }
  return false;
}

function fenceFor(e, st, ms, yb, cx, signs, boxes, water = []) {
  const L = Math.round(Math.min(yb.x0 - 4, ...ms.map(m => m.x - m.w / 2 - 14)));
  const Rx = Math.round(Math.max(yb.x1 + 4, ...ms.map(m => m.x + m.w / 2 + 14)));
  const back = Math.round(Math.min(...ms.map(m => m.gy)) - 10);
  // фронт — по краю двора, перед табличками
  let fy = Math.round(yb.y1 + 6);
  for (const s of signs) {
    const sx = s.x + s.w / 2, sgy = s.y + s.h;
    if (sx > L && sx < Rx && sgy > back && sgy + 10 > fy && sgy < fy + 40) fy = Math.round(sgy + 12);
  }
  const gate0 = Math.round(cx - 12), gate1 = Math.round(cx + 12);
  const blocked = (x0, y0, x1, y1) => {
    for (const s of signs) {
      const sx = s.x + s.w / 2, sgy = s.y + s.h;
      if (sx > x0 - 10 && sx < x1 + 10 && sgy > y0 - 6 && sgy < y1 + 14) return true;
    }
    for (const b of boxes) if (x1 > b.x0 && x0 < b.x1 && y1 > b.y1 - 6 && y0 < b.y1 + 2) return true;
    for (const w of water) if (x1 > w.x0 && x0 < w.x1 && y1 > w.y0 && y0 < w.y1) return true;   // забор не по воде
    for (let x = x0; x <= x1; x += 4) if (onTrail(e.side, x, y1)) return true;
    for (let y = y0; y <= y1; y += 4) if (onTrail(e.side, x0, y)) return true;
    return false;
  };
  const style = st.fence;
  const H = 16;
  const PL = style === 'concrete' ? 14 : 16;     // кусок — по плите, без лишних швов
  // фронт: два крыла по сторонам калитки
  for (const [a, b] of [[L, gate0], [gate1, Rx]]) {
    for (let x = a; x < b; x += PL) {
      const len = Math.min(PL, b - x);
      if (len < 3 || blocked(x, fy - 2, x + len, fy)) continue;
      if (hash(x, fy, 7.7) < 0.14) continue;          // после пожара заборы с прорехами
      const v = (hash(x, fy, 1.3) * 3) | 0;
      archProps.push({ x: x + len / 2, gy: fy, w: len, h: H,
        draw(ctx) { const c = pieceCanvas(style, false, len, v); if (c) ctx.drawImage(c, x, fy - H); } });
    }
  }
  // бока: от фронта вглубь, до задов построек
  for (const sx of [L, Rx]) {
    for (let y = back; y < fy; y += 12) {
      const len = Math.min(12, fy - y);
      if (len < 3 || blocked(sx - 3, y, sx + 3, y + len)) continue;
      if (hash(sx, y, 7.7) < 0.14) continue;
      const v = (hash(sx, y, 2.1) * 3) | 0;
      archProps.push({ x: sx, gy: y + len, w: 6, h: H + len,
        draw(ctx) { const c = pieceCanvas(style, true, len, v); if (c) ctx.drawImage(c, sx - 2, y - H); } });
    }
  }
}

// ── утварь двора ──
// Вещи эпохи перед постройками: во дворе — две-три, у ворот — одна у
// тропы. Не на пороге, не на табличке, не друг на друге.
function propsFor(e, ms, signs, boxes, water = []) {
  const kinds = ARCH_BY_RING[e.ringId]?.props?.[e.side];
  if (!kinds || !kinds.length) return;
  const want = e.kind === 'gate' ? 1 : Math.min(kinds.length, ms.length > 1 ? 3 : 2);
  const placed = [];
  const free = (x, gy, w, h) => {
    const x0 = x - w / 2 - 3, x1 = x + w / 2 + 3, y0 = gy - h, y1 = gy + 3;
    for (const m of ms) if (Math.abs(x - m.x) < 16 + w / 2 && gy > m.gy - 4 && gy < m.gy + 34) return false;   // порог
    for (const s of signs) {
      const sx = s.x + s.w / 2, sgy = s.y + s.h;
      if (sx > x0 - 12 && sx < x1 + 12 && sgy > y0 - 4 && sgy < y1 + 30) return false;
    }
    for (const b of boxes) if (x1 > b.x0 && x0 < b.x1 && y1 > b.y0 + 2 && y0 < b.y1 + 2) return false;
    for (const w of water) if (x1 > w.x0 && x0 < w.x1 && y1 > w.y0 && y0 < w.y1) return false;
    for (const p of placed) if (x1 > p.x - p.w / 2 - 6 && x0 < p.x + p.w / 2 + 6 && y1 > p.gy - p.h - 2 && y0 < p.gy + 4) return false;
    for (const p of archProps) if (Math.abs(p.x - x) < p.w / 2 + w / 2 + 2 && Math.abs(p.gy - gy) < 6) return false;
    return !onTrail(e.side, x, gy) && !onTrail(e.side, x - w / 2, gy) && !onTrail(e.side, x + w / 2, gy);
  };
  // одна и та же вещь в один кадр не попадает; примета эпохи (unique) —
  // одна на сторону кольца
  const seenNear = (K, x, gy) => (K.unique && archProps.some(p => p.name === K.name))
    || archProps.some(p => p.name === K.name && Math.abs(p.x - x) < 640 && Math.abs(p.gy - gy) < 360);
  const used = new Set();
  for (let i = 0; i < want; i++) {
    const order = kinds.map((_, j) => kinds[(e.id + i + j) % kinds.length]).filter(k => !used.has(k));
    const ax = ms[0].x, ag = ms[0].gy;
    const K = order.find(k => !seenNear(k, ax, ag));
    if (!K) break;
    used.add(K);
    const cands = [];
    if (e.kind === 'gate' && e.trail) {
      // у ворот — на обочине тропы
      for (const m of ms) for (const dx of [-1, 1]) for (const dy of [14, 24, 6, 34]) {
        cands.push({ x: m.x + dx * (m.w / 2 - 6), gy: m.gy + dy });
      }
    } else {
      // во дворе: перед постройками, по краю фартука
      for (const m of ms) for (const fx of [-0.42, 0.42, -0.25, 0.25, -0.55, 0.55]) for (const dy of [12, 20, 8, 28]) {
        cands.push({ x: m.x + fx * m.w, gy: m.gy + dy });
      }
    }
    for (const c of cands) {
      const x = Math.round(c.x), gy = Math.round(c.gy);
      if (!free(x, gy, K.w, K.h)) continue;
      const p = { x, gy, w: K.w, h: K.h, name: K.name, kindDraw: K.draw, draw(ctx) { K.draw(ctx, x, gy, now); } };
      placed.push(p);
      archProps.push(p);
      break;
    }
  }
}

// дворы и вода — чтобы ткань застройки на них не ложилась
export function archGroundRects() {
  const out = [];
  for (const G of grounds) {
    for (const r of G.rects) out.push({ x0: r.x0 - 4, y0: r.y0 - 4, x1: r.x1 + 4, y1: r.y1 + 4 });
    for (const p of G.patches) out.push({ x0: p.r.x0, y0: p.r.y0, x1: p.r.x1, y1: p.r.y1 });
  }
  return out;
}
