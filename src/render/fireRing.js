// ═══════════════════════════════════════
// КОЛЬЦО ОГНЯ — край диска горит. Земля кольца — гарь (render/etch.js),
// по ней стоят костры: огонь сплошной (тепло не растрируется), языки
// клонятся по ветру и дрожат. Костры — не чаще одного на треть кадра:
// в кадре не больше трёх тёплых пятен. Каждый светит.
// Стоят по средней линии кольца, с разбросом поперёк — кромки кольца
// неровные сами (по рельефу), костры их не выравнивают.
// ═══════════════════════════════════════
import { TOWN, RINGS, RING_W, FIRE_W, warpedDist } from '../world/disc.js';
import { wind } from '../world/wind.js';

const D0 = RINGS * RING_W + FIRE_W * 0.5;     // средняя линия кольца
const GAP = 330, GAP_J = 110;                  // шаг костров по линии и его разброс
const C = '#C23B2B', S = '#E28A3A', N = '#0D0B0A', CHAR = '#1d0d07';

function h01(n) { const v = Math.sin(n * 127.13 + 7.7) * 43758.5453; return v - Math.floor(v); }

// точка на линии, отстоящей от прямоугольника городка на D (скруглённые углы), по длине s
function along(s, D) {
  const W = TOWN.x1 - TOWN.x0, H = TOWN.y1 - TOWN.y0, Q = Math.PI * D / 2;
  const segs = [
    [W, u => ({ x: TOWN.x0 + u, y: TOWN.y0 - D, nx: 0, ny: -1 })],
    [Q, u => { const a = Math.PI / 2 - u / D; return { x: TOWN.x1 + D * Math.cos(a), y: TOWN.y0 - D * Math.sin(a), nx: Math.cos(a), ny: -Math.sin(a) }; }],
    [H, u => ({ x: TOWN.x1 + D, y: TOWN.y0 + u, nx: 1, ny: 0 })],
    [Q, u => { const a = -u / D; return { x: TOWN.x1 + D * Math.cos(a), y: TOWN.y1 - D * Math.sin(a), nx: Math.cos(a), ny: -Math.sin(a) }; }],
    [W, u => ({ x: TOWN.x1 - u, y: TOWN.y1 + D, nx: 0, ny: 1 })],
    [Q, u => { const a = -Math.PI / 2 - u / D; return { x: TOWN.x0 + D * Math.cos(a), y: TOWN.y1 - D * Math.sin(a), nx: Math.cos(a), ny: -Math.sin(a) }; }],
    [H, u => ({ x: TOWN.x0 - D, y: TOWN.y1 - u, nx: -1, ny: 0 })],
    [Q, u => { const a = Math.PI - u / D; return { x: TOWN.x0 + D * Math.cos(a), y: TOWN.y0 - D * Math.sin(a), nx: Math.cos(a), ny: -Math.sin(a) }; }],
  ];
  for (const [len, f] of segs) { if (s <= len) return f(s); s -= len; }
  return segs[0][1](0);
}
const PERIM = 2 * (TOWN.x1 - TOWN.x0) + 2 * (TOWN.y1 - TOWN.y0) + 2 * Math.PI * D0;

export const fireSites = [];
{
  let s = 40, i = 0;
  while (s < PERIM - GAP * 0.6) {
    const p = along(s, D0);
    // поперёк линии — разброс; рваную границу (warpedDist) догоняем по нормали
    const want = D0 + (h01(i * 3 + 1) - 0.5) * FIRE_W * 0.5;
    let x = p.x, y = p.y;
    for (let k = 0; k < 5; k++) { const e = want - warpedDist(x, y); x += p.nx * e; y += p.ny * e; }
    fireSites.push({ x: Math.round(x), y: Math.round(y), n: 3 + Math.floor(h01(i * 3 + 2) * 3), seed: h01(i * 7 + 5) * 100 });
    s += GAP + (h01(i * 3 + 3) - 0.5) * GAP_J * 2;
    i++;
  }
}

// свет костров — для освещения (main добавляет при запуске)
export const fireLights = () => fireSites.map(f => ({ x: f.x, y: f.y - 6, r: 70, color: [226, 138, 58], flicker: 0.22 }));

export function fireSitesInView(camX, camY, vw, vh) {
  return fireSites.filter(f => f.x > camX - 30 && f.x < camX + vw + 30 && f.y > camY - 10 && f.y < camY + vh + 40);
}

// костёр: угли в яме и языки — сплошным цветом; ctx — в координатах мира
export function drawFireSite(ctx, f, t) {
  const lean = Math.max(-2.5, Math.min(2.5, wind.at(f.x, f.y).x * 0.8));
  ctx.fillStyle = CHAR; ctx.fillRect(f.x - 12, f.y - 2, 24, 4);
  ctx.fillStyle = N; ctx.fillRect(f.x - 10, f.y - 1, 20, 2);
  for (let i = 0; i < 6; i++) {                                    // угли
    if (((t * 0.05 + i * 1.7 + f.seed) % 3) < 1.2) { ctx.fillStyle = C; ctx.fillRect(f.x - 9 + i * 3 + (i & 1), f.y - (i & 1), 1, 1); }
  }
  for (let k = 0; k < f.n; k++) {
    const bx = Math.round(f.x + (k - (f.n - 1) / 2) * 5);
    const mid = 1 - Math.abs(k - (f.n - 1) / 2) / f.n;              // в середине костра языки выше
    const H = 10 + mid * 10 + h01(f.seed + k) * 6 + Math.sin(t * 0.19 + k * 1.9 + f.seed) * 2.5;
    const sway = Math.sin(t * 0.07 + k * 2.3 + f.seed) * 1.2;
    const tip = Math.round(lean + sway);
    // язык: три яруса уже кверху, верх уходит по ветру
    ctx.fillStyle = C; ctx.fillRect(bx - 2, Math.round(f.y - H * 0.55), 5, Math.round(H * 0.55));
    ctx.fillRect(bx - 1 + Math.round(tip * 0.5), Math.round(f.y - H * 0.85), 3, Math.round(H * 0.32));
    ctx.fillRect(bx + tip, Math.round(f.y - H), 1, Math.round(H * 0.2));
    ctx.fillStyle = S; ctx.fillRect(bx - 1, Math.round(f.y - H * 0.45), 3, Math.round(H * 0.42));
    ctx.fillRect(bx + Math.round(tip * 0.5), Math.round(f.y - H * 0.68), 1, Math.round(H * 0.25));
  }
}
