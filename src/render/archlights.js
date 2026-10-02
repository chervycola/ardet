// ═══════════════════════════════════════
// СВЕТ ОКОН — живые источники СВЕЧИ. Окна и огоньки, нарисованные в
// постройках эпох и в утвари дворов пикселями СВЕЧИ, находятся сами
// (рисунок прогоняется один раз в маленький холст) и получают ореол в
// освещении: мерцает, как огонь, а не как лампа. Перерисовывать спрайты
// не нужно — где свеча нарисована, там и светит.
// ═══════════════════════════════════════
const CANDLE = [226, 138, 58];
const cache = new Map();          // draw → [{dx, dy, n}] от (x, gy)

// пятна свечи в рисунке: кластеры соседних пикселей, центр и размер
export function candleSpots(draw, w, h) {
  if (cache.has(draw)) return cache.get(draw);
  let spots = [];
  const doc = typeof document !== 'undefined' ? document : null;
  const c = doc && doc.createElement ? doc.createElement('canvas') : null;
  const x = c && c.getContext ? c.getContext('2d', { willReadFrequently: true }) : null;
  if (x && x.getImageData) {
    const W = Math.ceil(w) + 24, H = Math.ceil(h) + 24, cx = W >> 1, gy = H - 12;
    c.width = W; c.height = H;
    const hit = new Uint8Array(W * H);
    for (const t of [0, 37, 100, 211]) {          // мерцающие огоньки — в разные мгновения
      x.clearRect(0, 0, W, H);
      try { draw(x, cx, gy, t); } catch (e) { break; }
      const d = x.getImageData(0, 0, W, H).data;
      for (let i = 0; i < W * H; i++) {
        if (d[i * 4 + 3] > 200 && Math.abs(d[i * 4] - CANDLE[0]) < 6
          && Math.abs(d[i * 4 + 1] - CANDLE[1]) < 6 && Math.abs(d[i * 4 + 2] - CANDLE[2]) < 6) hit[i] = 1;
      }
    }
    // кластеры: пиксели ближе 4 px — одно окно
    const seen = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) {
      if (!hit[i] || seen[i]) continue;
      const stack = [i]; seen[i] = 1;
      let sx = 0, sy = 0, n = 0;
      while (stack.length) {
        const j = stack.pop(), px = j % W, py = (j / W) | 0;
        sx += px; sy += py; n++;
        for (let oy = -3; oy <= 3; oy++) for (let ox = -3; ox <= 3; ox++) {
          const qx = px + ox, qy = py + oy;
          if (qx < 0 || qy < 0 || qx >= W || qy >= H) continue;
          const q = qy * W + qx;
          if (hit[q] && !seen[q]) { seen[q] = 1; stack.push(q); }
        }
      }
      spots.push({ dx: Math.round(sx / n - cx), dy: Math.round(sy / n - gy), n });
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
  const add = (x, y, n) => out.push({
    x, y, r: Math.min(40, 20 + n * 2), color: CANDLE, flicker: 0.3, candle: true, intensity: 2,
  });
  for (const l of locations) {
    if (!l.archDraw) continue;
    for (const s of candleSpots(l.archDraw, l.w, l.h)) {
      if (l.archLight && Math.abs(s.dx - (l.archLight.dx || 0)) < 6 && Math.abs(s.dy - l.archLight.dy) < 6) continue;
      add(l.archX + (l.archFlip ? -s.dx : s.dx), l.archGy + s.dy, s.n);
    }
  }
  for (const p of props) {
    if (!p.kindDraw) continue;
    for (const s of candleSpots(p.kindDraw, p.w, p.h)) add(p.x + s.dx, p.gy + s.dy, s.n);
  }
  return out;
}
