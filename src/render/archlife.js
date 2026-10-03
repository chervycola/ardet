// ═══════════════════════════════════════
// ЖИЗНЬ ПОСТРОЕК — то, что шевелится: дым из труб, флаги, мигающие огни,
// птицы на коньке. Разметка — в спрайтах эпох, поле `life` у постройки:
//   smoke: [[dx, dy]]              — устье трубы; струйка уходит вверх по ветру
//   flag:  [[dx, dy, len, 'V']]    — верх древка; полотнище по ветру (V/K/P/M/S)
//   blink: [[dx, dy, 'S', period, duty]] — огонёк: горит duty доли периода
//   birds: [[dx0, dx1, dy, 'K'?]]  — конёк, где сидят птицы; взлетают от странника;
//                                    цвет необязателен (чайки — K, по умолчанию чёрные)
// dx, dy — от центра основания (x, gy), как в рисунке постройки.
// Ветер один на весь мир — к востоку.
// ═══════════════════════════════════════
const COL = { V: '#C23B2B', K: '#D9CFB8', P: '#8A8D8F', M: '#3D4A3A', S: '#E28A3A', N: '#0D0B0A' };
const SMOKE = '#8A8D8F', BIRD = '#0D0B0A';

function hash(n) { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n ^= n >>> 4; n *= 0x27d4eb2d; return (n ^ (n >>> 15)) >>> 0; }

// дым: клубки рождаются в устье, растут, сносятся ветром и тают
function drawSmoke(ctx, x, y, t, seed) {
  const LIFE = 150, N = 10;
  for (let i = 0; i < N; i++) {
    const age = (t * 0.6 + i * LIFE / N + seed * 13) % LIFE, k = age / LIFE;
    const px = Math.round(x + age * 0.16 + Math.sin(age * 0.07 + i * 1.7 + seed) * 1.5 * k * 2);
    const py = Math.round(y - 1 - age * 0.32);
    const s = 2 + Math.floor(k * 3);
    ctx.globalAlpha = 0.7 * (1 - k) * Math.min(1, age / 8);
    ctx.fillStyle = SMOKE;
    ctx.fillRect(px - (s >> 1), py - (s >> 1), s, s);
  }
  ctx.globalAlpha = 1;
}

// флаг: столбцы полотнища, волна бежит от древка
function drawFlag(ctx, x, y, len, col, t, seed) {
  const h = Math.max(2, Math.round(len * 0.6));
  ctx.fillStyle = COL[col] || col || COL.P;
  for (let c = 0; c < len; c++) {
    const amp = Math.min(1.5, c / 3);
    const off = Math.round(Math.sin(t * 0.09 + seed - c * 0.8) * amp);
    ctx.fillRect(x + 1 + c, y + off, 1, h - (c === len - 1 && len > 3 ? 1 : 0));
  }
}

function drawBlink(ctx, x, y, col, period, duty, t, seed) {
  const p = period || 90;
  if ((t + seed * 7) % p >= p * (duty == null ? 0.5 : duty)) return;
  ctx.fillStyle = COL[col] || col || COL.S;
  ctx.fillRect(x, y, 1, 1);
}

// птицы: сидят на коньке и клюют; странник близко — взлетают дугой прочь,
// уходят из кадра; странник ушёл — возвращаются той же дугой
const flocks = new Map();
function flockOf(key, perch, seed) {
  let f = flocks.get(key);
  if (f) return f;
  const [x0, x1, dy] = perch, n = 2 + (hash(seed) % 3), birds = [];
  for (let i = 0; i < n; i++) {
    const h = hash(seed * 31 + i);
    birds.push({
      px: x0 + (h % Math.max(1, x1 - x0 + 1)), py: dy,
      ex: (h & 1 ? 1 : -1) * (60 + (h >>> 3) % 60), ey: -70 - (h >>> 7) % 50,
      delay: (h >>> 11) % 14,
    });
  }
  f = { birds, s: 0, gone: 0 };
  flocks.set(key, f);
  return f;
}

function drawBirds(ctx, x, gy, perch, t, seed, near, key) {
  const col = COL[perch[3]] || BIRD;
  const f = flockOf(key, perch, seed);
  if (near) { f.s = Math.min(1.2, f.s + 0.02); f.gone = 0; }
  else if (f.s > 0) { if (++f.gone > 360) f.s = Math.max(0, f.s - 0.008); }
  ctx.fillStyle = col;
  f.birds.forEach((b, i) => {
    const s = Math.max(0, Math.min(1, f.s * 1.2 - b.delay / 40));
    if (s >= 1) return;
    if (s <= 0) {
      const peck = ((t + i * 53 + seed) % 200) < 12 ? 1 : 0;
      ctx.fillRect(x + b.px, gy + b.py - 2 + peck, 2, 1);
      ctx.fillRect(x + b.px + (b.ex > 0 ? 1 : 0), gy + b.py - 3 + peck, 1, 1);
      return;
    }
    const e = s * s * (3 - 2 * s);
    const bx = Math.round(x + b.px + b.ex * e), by = Math.round(gy + b.py - 2 + b.ey * Math.sin(e * Math.PI / 2));
    const up = ((t >> 2) + i) & 1;
    ctx.fillRect(bx - 1, by - up, 1, 1); ctx.fillRect(bx, by, 1, 1); ctx.fillRect(bx + 1, by - up, 1, 1);
  });
}

// жизнь одной постройки; flip — постройка нарисована зеркально
export function drawArchLife(ctx, loc, t, walker) {
  const L = loc.archLife;
  if (!L) return;
  const x = loc.archX, gy = loc.archGy, sx = loc.archFlip ? -1 : 1;
  const seed = hash(loc.archX * 7 + loc.archGy) % 97;
  for (const [dx, dy] of L.smoke || []) drawSmoke(ctx, x + sx * dx, gy + dy, t, seed);
  for (const [dx, dy, len, col] of L.flag || []) drawFlag(ctx, x + sx * dx, gy + dy, len || 5, col, t, seed);
  for (const [dx, dy, col, p, duty] of L.blink || []) drawBlink(ctx, x + sx * dx, gy + dy, col, p, duty, t, seed);
  if (L.birds) {
    const near = walker && Math.abs(walker.x - x) < loc.w / 2 + 34 && walker.y > gy - loc.h - 30 && walker.y < gy + 50;
    L.birds.forEach((p, i) => {
      const perch = sx > 0 ? p : [-p[1], -p[0], p[2], p[3]];
      drawBirds(ctx, x, gy, perch, t, seed + i * 11, near, loc.id + ':' + i);
    });
  }
}
