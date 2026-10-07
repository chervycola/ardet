// ═══════════════════════════════════════
// ПЛАСТИНА — фактура оттиска, которую кладёт игра, а не генерация
// (weave/REVE_PROJECT.md «Что добавляет игра»). Всё зависит от эпохи
// под ногами: ранние кольца — грубая старая пластина, поздние — чище,
// «сейчас» почти без следа печати.
//   зерно     — ровная фактура пластины, привязана к бумаге
//   царапины  — волоски по пластине, вспышками
//   края      — кромка кадра осыпается точками (многократное копирование)
//   бумага    — тон листа: ранние эпохи на сепии
//   приводка  — насколько красная форма гуляет от чёрной
//   шторм     — непогода, молния и брейнрот раскачивают пластину:
//               зерно гуще, царапины чаще, приводка пляшет, кляксы
// ═══════════════════════════════════════
import { scaler } from './scaler.js';
import { warpedDist, RING_W, RINGS, FIRE_W } from '../world/disc.js';

// профиль по кольцам: 0 — городок, 1..9 — эпохи, 10 — огонь, 11 — за краем
//            зерно  ячейка царапин/мин  края  бумага приводка развёртка
const P = [
  /* 0 городок   */ [0.07, 1,  2,  3, 0.10, 1, 0],
  /* 1 три огня  */ [0.16, 2, 10, 12, 0.30, 2, 0],
  /* 2 портики   */ [0.15, 2,  9, 11, 0.26, 2, 0],
  /* 3 свет/сад  */ [0.14, 2,  8, 10, 0.22, 2, 0],
  /* 4 два очага */ [0.12, 1,  7,  8, 0.16, 1, 0],
  /* 5 шрифт     */ [0.11, 1,  6,  7, 0.12, 1, 0],
  /* 6 пар/тени  */ [0.12, 1,  8,  7, 0.10, 1, 0],
  /* 7 катастрофы*/ [0.11, 1, 14,  6, 0.04, 1, 0],
  /* 8 неон      */ [0.07, 1,  4,  4, 0.00, 1, 0.05],
  /* 9 сейчас    */ [0.03, 1,  1,  1, 0.00, 0, 0.02],
  /* 10 огонь    */ [0.18, 2, 14, 12, 0.00, 2, 0],
  /* 11 край     */ [0.22, 2, 16, 16, 0.00, 3, 0],
];
const KEYS = ['grain', 'cell', 'scr', 'edge', 'paper', 'misreg', 'scan'];

const prof = { grain: 0.07, cell: 1, scr: 2, edge: 3, paper: 0.1, misreg: 1, scan: 0, ring: 0 };
let storm = 0, stormWant = 0;
let frame = 0, nextBurst = 120;
const scratches = [], blots = [];
let film = null;                          // долгая царапина плёнки (катастрофы, шторм)
let grainTiles = {}, edgeMasks = new Map();
let jitter = 0;
let cache = null, cacheCtx = null, cacheKey = '';

// детерминированный шум
function h(x, y, s) {
  const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

// плавная доля кольца под ногами (по рваной границе эпох)
function ringF(x, y) {
  const d = warpedDist(x, y);
  if (d <= 0) return 0;
  const r = d / RING_W;
  if (r <= RINGS) return r;
  const over = d - RINGS * RING_W;
  return over <= FIRE_W ? RINGS + over / FIRE_W : Math.min(RINGS + 2, RINGS + 1 + (over - FIRE_W) / 300);
}

function grainTile(cell) {
  const key = cell;
  if (grainTiles[key]) return grainTiles[key];
  const W = 192, H = 108;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  for (let gy = 0; gy < H; gy += cell) for (let gx = 0; gx < W; gx += cell) {
    const v = h(gx, gy, cell);
    if (v < 0.13) { x.fillStyle = '#0D0B0A'; x.fillRect(gx, gy, cell, cell); }
    else if (v > 0.972) { x.fillStyle = '#D9CFB8'; x.fillRect(gx, gy, cell, cell); }
  }
  return (grainTiles[key] = c);
}

function edgeMask(w, W, H, seed) {
  const key = `${w}:${W}:${H}:${seed}`;
  if (edgeMasks.has(key)) return edgeMasks.get(key);
  if (edgeMasks.size > 24) edgeMasks.clear();
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = '#0D0B0A';
  const band = w * 2;
  for (let y = 0; y < H; y++) {
    const dy = Math.min(y, H - 1 - y);
    if (dy >= band) {
      // только боковые полосы
      for (const xs of [[0, band], [W - band, W]]) for (let px = xs[0]; px < xs[1]; px++) dot(px, y);
    } else for (let px = 0; px < W; px++) dot(px, y);
  }
  function dot(px, y) {
    const d = Math.min(px, W - 1 - px, y, H - 1 - y);
    if (d >= band) return;
    // крупные выщербины + мелкая осыпь
    const big = h(px >> 2, y >> 2, seed + 9);
    const p = Math.pow(1 - d / band, 2.2) * (big < 0.5 ? 1.15 : 0.7);
    if (h(px, y, seed) < p) x.fillRect(px, y, 1, 1);
  }
  edgeMasks.set(key, c);
  return c;
}

function spawnBurst(n, vertical) {
  for (let i = 0; i < n; i++) {
    const W = scaler.vw, H = scaler.vh;
    const vert = vertical || Math.random() < 0.3;
    scratches.push({
      x: Math.random() * W, y: Math.random() * H,
      a: vert ? Math.PI / 2 + (Math.random() - 0.5) * 0.12 : Math.random() * Math.PI,
      len: 20 + Math.random() * (vert ? 200 : 110),
      life: 4 + (Math.random() * 18 | 0),
      dark: Math.random() < 0.25,
      wob: Math.random() * 10,
    });
  }
}

export const plate = {
  // stormLevel: 0..1 от погоды/молнии/брейнрота — считает main
  update(px, py, stormLevel) {
    frame++;
    const r = ringF(px, py);
    const i0 = Math.min(P.length - 1, Math.floor(r)), i1 = Math.min(P.length - 1, i0 + 1), k = r - Math.floor(r);
    KEYS.forEach((key, j) => { prof[key] = P[i0][j] + (P[i1][j] - P[i0][j]) * k; });
    prof.cell = P[Math.round(Math.min(P.length - 1, r))][1];
    prof.ring = Math.round(r);
    stormWant = stormLevel || 0;
    storm += (stormWant - storm) * (stormWant > storm ? 0.08 : 0.02);
    if (storm < 0.002) storm = 0;

    // царапины — вспышками; в шторм чаще
    const rate = prof.scr + storm * 40;                      // вспышек в минуту
    if (rate > 0 && --nextBurst <= 0) {
      spawnBurst(2 + (Math.random() * (3 + storm * 5) | 0), prof.ring === 7 && Math.random() < 0.6);
      nextBurst = (3600 / rate) * (0.5 + Math.random());
    }
    for (let j = scratches.length - 1; j >= 0; j--) if (--scratches[j].life <= 0) scratches.splice(j, 1);
    // долгая царапина плёнки: эпоха катастроф и шторм
    const wantFilm = (prof.ring === 7 && frame % 900 < 420) || storm > 0.5;
    if (wantFilm && !film) film = { x: Math.random() * scaler.vw, drift: (Math.random() - 0.5) * 0.15 };
    if (!wantFilm) film = null;
    if (film) { film.x += film.drift + (Math.random() - 0.5) * 0.6; if (film.x < 4 || film.x > scaler.vw - 4) film = null; }
    // кляксы в шторм
    if (storm > 0.35 && Math.random() < storm * 0.04) {
      const W = scaler.vw, H = scaler.vh, side = Math.random() * 4 | 0;
      blots.push({
        x: side === 0 ? Math.random() * 30 : side === 1 ? W - Math.random() * 30 : Math.random() * W,
        y: side === 2 ? Math.random() * 24 : side === 3 ? H - Math.random() * 24 : Math.random() * H,
        r: 2 + Math.random() * 5, life: 10 + (Math.random() * 30 | 0), seed: Math.random() * 99,
        red: Math.random() < 0.3,
      });
    }
    for (let j = blots.length - 1; j >= 0; j--) if (--blots[j].life <= 0) blots.splice(j, 1);
    // приводка в шторм пляшет
    if (frame % 6 === 0) jitter = storm > 0.25 ? Math.round((Math.random() - 0.3) * 3 * storm) : 0;
  },

  // сдвиг красной формы от чёрной, в точках
  misreg() { return Math.max(0, Math.round(prof.misreg) + jitter); },
  scan() { return prof.scan; },
  storm() { return storm; },
  profile() { return prof; },

  // поверх отпечатанного кадра (после второй краски), до интерфейса
  composite(ctx) {
    const s = scaler.scale, W = scaler.vw, H = scaler.vh;
    ctx.save();
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.imageSmoothingEnabled = false;

    // бумага: ранние эпохи — сепия (multiply не поднимает чёрное)
    if (prof.paper > 0.005) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = prof.paper;
      ctx.fillStyle = '#C9A982';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }

    // зерно и осыпь краёв — один кэшированный слой; пересобирается, когда зерно сдвигается
    const g = Math.min(0.5, prof.grain * (1 + storm * 0.9));
    const ew = Math.round(prof.edge + storm * 6);
    const step = storm > 0.3 ? 2 : 8;
    const seed = storm > 0.3 ? (frame >> 3) % 4 : 0;
    const key = `${W}:${H}:${prof.cell}:${Math.round(g * 100)}:${ew}:${seed}:${Math.floor(frame / step)}`;
    if (key !== cacheKey) {
      cacheKey = key;
      if (!cache || cache.width !== W || cache.height !== H) {
        cache = document.createElement('canvas'); cache.width = W; cache.height = H;
        cacheCtx = cache.getContext('2d');
      }
      cacheCtx.clearRect(0, 0, W, H);
      if (g > 0.004) {
        const tile = grainTile(prof.cell);
        const n = Math.floor(frame / step);
        const ox = (h(n, 1, 3) * 192) | 0, oy = (h(n, 2, 5) * 108) | 0;
        cacheCtx.globalAlpha = g;
        for (let y = -oy; y < H; y += 108) for (let x = -ox; x < W; x += 192) cacheCtx.drawImage(tile, x, y);
      }
      if (ew > 0) { cacheCtx.globalAlpha = 0.85; cacheCtx.drawImage(edgeMask(ew, W, H, seed), 0, 0); }
      cacheCtx.globalAlpha = 1;
    }
    ctx.globalAlpha = 1;
    ctx.drawImage(cache, 0, 0);

    // царапины пластины: светлые волоски (иногда тёмные)
    for (const sc of scratches) {
      ctx.globalAlpha = Math.min(1, sc.life / 6) * (sc.dark ? 0.45 : 0.4);
      ctx.fillStyle = sc.dark ? '#0D0B0A' : '#D9CFB8';
      const ca = Math.cos(sc.a), sa = Math.sin(sc.a);
      for (let i = 0; i < sc.len; i += 1) {
        const w = Math.sin(i * 0.05 + sc.wob) * 1.5;
        ctx.fillRect(Math.round(sc.x + ca * i - sa * w), Math.round(sc.y + sa * i + ca * w), 1, 1);
      }
    }
    if (film) {
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = '#D9CFB8';
      for (let y = 0; y < H; y += 1) if (h(film.x | 0, y >> 3, frame >> 2) > 0.12) ctx.fillRect(Math.round(film.x + Math.sin(y * 0.02) * 0.6), y, 1, 1);
    }

    // кляксы — краска сорвалась с валика
    for (const b of blots) {
      ctx.globalAlpha = Math.min(1, b.life / 8) * 0.8;
      ctx.fillStyle = b.red ? '#6b0f1a' : '#0D0B0A';
      const R = Math.ceil(b.r);
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
        const rr = Math.hypot(dx, dy) / b.r;
        if (rr < 1 && h(dx + b.seed, dy, 7) > rr * rr * 0.9) ctx.fillRect(Math.round(b.x + dx), Math.round(b.y + dy), 1, 1);
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  },
};
