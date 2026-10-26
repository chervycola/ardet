// ═══════════════════════════════════════
// СВЕТ ОКОН — живые источники СВЕЧИ. Окна и огоньки, нарисованные в
// постройках эпох и в утвари дворов пикселями СВЕЧИ, находятся сами
// (рисунок прогоняется один раз в маленький холст) и получают ореол в
// освещении: мерцает, как огонь, а не как лампа. Перерисовывать спрайты
// не нужно — где свеча нарисована, там и светит.
// ═══════════════════════════════════════
import { DAY_LEN, phaseAt, skyAt } from '../world/sky.js';

const CANDLE = [226, 138, 58];
const cache = new Map();          // draw → [{dx, dy, n, night?}] от (x, gy)
// шаг, когда на дворе ночь: окно, что загорается только в сумерки, днём пробы не увидят
const nightStep = () => { for (let t = 0; t < DAY_LEN; t += 300) if (skyAt(phaseAt(t)).name === 'ночь') return t; return null; };

// пятна свечи в рисунке: кластеры соседних пикселей, центр и размер; night — горит только не днём
export function candleSpots(draw, w, h) {
  if (cache.has(draw)) return cache.get(draw);
  let spots = [];
  const doc = typeof document !== 'undefined' ? document : null;
  const c = doc && doc.createElement ? doc.createElement('canvas') : null;
  const x = c && c.getContext ? c.getContext('2d', { willReadFrequently: true }) : null;
  if (x && x.getImageData) {
    const W = Math.ceil(w) + 24, H = Math.ceil(h) + 24, cx = W >> 1, gy = H - 12;
    c.width = W; c.height = H;
    const hit = new Uint8Array(W * H);             // 1 — свеча и днём, 2 — только ночью
    const tn = nightStep();
    for (const t of [0, 37, 100, 211, ...(tn === null ? [] : [tn])]) {   // мерцающие огоньки — в разные мгновения; и ночью
      x.clearRect(0, 0, W, H);
      try { draw(x, cx, gy, t); } catch (e) { break; }
      const d = x.getImageData(0, 0, W, H).data;
      for (let i = 0; i < W * H; i++) {
        if (d[i * 4 + 3] > 200 && Math.abs(d[i * 4] - CANDLE[0]) < 6
          && Math.abs(d[i * 4 + 1] - CANDLE[1]) < 6 && Math.abs(d[i * 4 + 2] - CANDLE[2]) < 6) hit[i] = t === tn ? (hit[i] || 2) : 1;
      }
    }
    // кластеры: пиксели ближе 4 px — одно окно
    const seen = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) {
      if (!hit[i] || seen[i]) continue;
      const stack = [i]; seen[i] = 1;
      let sx = 0, sy = 0, n = 0, day = false;
      while (stack.length) {
        const j = stack.pop(), px = j % W, py = (j / W) | 0;
        sx += px; sy += py; n++; if (hit[j] === 1) day = true;
        for (let oy = -3; oy <= 3; oy++) for (let ox = -3; ox <= 3; ox++) {
          const qx = px + ox, qy = py + oy;
          if (qx < 0 || qy < 0 || qx >= W || qy >= H) continue;
          const q = qy * W + qx;
          if (hit[q] && !seen[q]) { seen[q] = 1; stack.push(q); }
        }
      }
      spots.push(day ? { dx: Math.round(sx / n - cx), dy: Math.round(sy / n - gy), n } : { dx: Math.round(sx / n - cx), dy: Math.round(sy / n - gy), n, night: true });
    }
    spots.sort((a, b) => b.n - a.n);
    spots = spots.slice(0, 4);
  }
  cache.set(draw, spots);
  return spots;
}

// источники света для построек (locations с archDraw) и утвари дворов
export function archWindowLights(locations, props) {
  const out = [];
  const add = (x, y, n, night) => out.push({
    x, y, r: Math.min(40, 20 + n * 2), color: CANDLE, flicker: 0.3, candle: true, intensity: 2, ...(night ? { night: true } : {}),
  });
  for (const l of locations) {
    if (!l.archDraw || l.quiet) continue;                 // постройка в тени (глубина II) — окна тёмные
    for (const s of candleSpots(l.archDraw, l.w, l.h)) {
      if (l.archLight && Math.abs(s.dx - (l.archLight.dx || 0)) < 6 && Math.abs(s.dy - l.archLight.dy) < 6) continue;
      add(l.archX + (l.archFlip ? -s.dx : s.dx), l.archGy + s.dy, s.n, s.night);
    }
  }
  for (const p of props) {
    if (!p.kindDraw) continue;
    for (const s of candleSpots(p.kindDraw, p.w, p.h)) add(p.x + s.dx, p.gy + s.dy, s.n, s.night);
  }
  return out;
}
