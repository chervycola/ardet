// ═══════════════════════════════════════
// ПОДВЕСЫ — то, что висит: колокол, вывеска, фонарик, плита на тросе крана.
// Цепочка точек по Верле: первая прибита к опоре, длины держат связи,
// тянет вниз, ветер толкает по разнице скоростей (лёгкое и парусное —
// сильнее, тяжёлое — едва), задел странник — качнётся и успокоится не
// сразу. Длинный трос качается медленно, короткий — часто: период из
// длины выходит сам, его никто не задаёт.
// Считаются только видимые: рисунок регистрирует подвес (hang), шаг
// (stepHangs, 60 раз в секунду) двигает то, что видели последние полсекунды.
// Колокола одной группы сталкиваются и звенят — тихо; у кого нет языка,
// тот качается молча.
// ═══════════════════════════════════════
import { wind } from './wind.js';
import { getCtx } from '../audio/audio.js';

const G = 0.12;                  // тяжесть, точек за шаг²
const REG = new Map();
const rang = new Map();          // группа → шаг, когда звенела
let frame = 0;

// подвес по ключу: опора (ax, ay), длина, параметры
//   segs  — звеньев (1 — жёсткий маятник, больше — гибкий трос)
//   sail  — парусность: как сильно тянет ветер
//   damp  — гашение за шаг (ближе к 1 — дольше качается)
//   gy    — земля под подвесом (странник задевает, только стоя рядом по глубине)
//   r     — полуширина тела (столкновения, касание)
//   group, tone — колокола одной рамы и их тон (без тона — молчит)
export function hang(key, ax, ay, len, opt = {}) {
  let h = REG.get(key);
  if (!h) {
    const segs = opt.segs || 1, pts = [];
    for (let i = 0; i <= segs; i++) {
      const y = ay + len * i / segs;
      pts.push({ x: ax, y, ox: ax, oy: y });
    }
    h = {
      ax, ay, len, segs, pts, seen: frame,
      sail: opt.sail ?? 0.03, damp: opt.damp ?? 0.995, gy: opt.gy ?? ay + len,
      r: opt.r ?? 2, group: opt.group || null, tone: opt.tone || 0,
    };
    REG.set(key, h);
  }
  h.ax = ax; h.ay = ay; h.seen = frame;
  return h;
}

export const tipOf = h => h.pts[h.pts.length - 1];
// угол последнего звена от отвеса (радианы, + — вправо)
export function angleOf(h) {
  const a = h.pts[h.pts.length - 2], b = h.pts[h.pts.length - 1];
  return Math.atan2(b.x - a.x, b.y - a.y);
}

function sim(h, player) {
  const P = h.pts, n = P.length;
  const w = wind.at(h.ax, h.gy);
  for (let i = 1; i < n; i++) {
    const p = P[i];
    const vx = (p.x - p.ox) * h.damp, vy = (p.y - p.oy) * h.damp;
    // ветер тянет к своей скорости: в штиль висит, в порыв уходит и качается
    const fx = h.sail * (w.x * 2.2 - vx);
    p.ox = p.x; p.oy = p.y;
    p.x += vx + fx;
    p.y += vy + G;
  }
  // странник проходит сквозь — задевает: толчок по его ходу
  if (player && Math.abs(player.y + 24 - h.gy) < 12) {
    const x0 = player.x - 1 - h.r, x1 = player.x + 14 + h.r, y0 = player.y - 4, y1 = player.y + 22;
    for (let i = 1; i < n; i++) {
      const p = P[i];
      if (p.x > x0 && p.x < x1 && p.y > y0 && p.y < y1) {
        p.x += (player.vx || 0) * 0.45 + (p.x < player.x + 6 ? -0.2 : 0.2);
      }
    }
  }
  // связи: звенья держат длину, опора прибита
  const seg = h.len / h.segs;
  for (let it = 0; it < 4; it++) {
    P[0].x = h.ax; P[0].y = h.ay;
    for (let i = 0; i < n - 1; i++) {
      const a = P[i], b = P[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1e-4;
      const k = (d - seg) / d;
      if (i === 0) { b.x -= dx * k; b.y -= dy * k; }
      else { a.x += dx * k * 0.5; a.y += dy * k * 0.5; b.x -= dx * k * 0.5; b.y -= dy * k * 0.5; }
    }
  }
  P[0].x = h.ax; P[0].y = h.ay;
}

// колокола одной рамы: разойтись, а если ударились заметно — звякнуть
function collide(group, list, player) {
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = tipOf(list[i]), b = tipOf(list[j]);
    const dx = b.x - a.x, min = list[i].r + list[j].r;
    if (Math.abs(dx) >= min || Math.abs(b.y - a.y) > 4) continue;
    const push = (min - Math.abs(dx)) / 2 * (dx >= 0 ? 1 : -1);
    const va = a.x - a.ox, vb = b.x - b.ox, rel = Math.abs(va - vb);
    a.x -= push; b.x += push;
    // удар гасит сближение: скорости меняются местами наполовину
    a.ox = a.x - (va * 0.3 + vb * 0.5); b.ox = b.x - (vb * 0.3 + va * 0.5);
    if (rel > 0.12 && frame - (rang.get(group) || -99) > 14) {
      rang.set(group, frame);
      const tone = list[i].tone || list[j].tone;
      if (tone) ding(tone, Math.min(1, rel * 2.5), player ? Math.hypot(a.x - player.x, a.y - player.y) : 0);
    }
  }
}

// звон: основной тон и колокольный обертон, гаснет за полторы секунды
function ding(freq, force, dist) {
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  const vol = 0.016 * force * Math.max(0, 1 - dist / 420);
  if (vol < 0.001) return;
  const t0 = ctx.currentTime, g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
  g.connect(ctx.destination);
  for (const [f, k] of [[freq, 1], [freq * 2.76, 0.35], [freq * 5.4, 0.12]]) {
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f; og.gain.value = k;
    o.connect(og); og.connect(g); o.start(t0); o.stop(t0 + 1.7);
  }
}

// шаг: двигать только то, что видели недавно; забытое — убрать
export function stepHangs(player) {
  frame++;
  const groups = new Map();
  for (const [k, h] of REG) {
    const age = frame - h.seen;
    if (age > 30) { if (age > 3600) REG.delete(k); continue; }
    sim(h, player);
    if (h.group) {
      if (!groups.has(h.group)) groups.set(h.group, []);
      groups.get(h.group).push(h);
    }
  }
  for (const [g, list] of groups) collide(g, list, player);
}

// трос/цепь пикселями между точками
export function drawRope(ctx, pts, col) {
  ctx.fillStyle = col;
  for (let i = 0; i < pts.length - 1; i++) {
    const x0 = Math.round(pts[i].x), y0 = Math.round(pts[i].y), x1 = Math.round(pts[i + 1].x), y1 = Math.round(pts[i + 1].y);
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (let s = 0; s <= n; s++) ctx.fillRect(Math.round(x0 + (x1 - x0) * s / n), Math.round(y0 + (y1 - y0) * s / n), 1, 1);
  }
}

// для тестов: сколько подвесов сейчас живёт
export function _count() { return REG.size; }
export function _reset() { REG.clear(); rang.clear(); frame = 0; }
