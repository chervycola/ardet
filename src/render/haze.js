// ═══════════════════════════════════════
// МАРЕВО — горячий воздух дрожит и гнёт то, что за ним.
//   над костром — столб: начинается выше пламени (огонь сплошной, его не
//   трогаем), кверху шире и слабее, клонится по ветру, как дым;
//   над Sol — слабо: он горит с основания;
//   в кольце огня над гарью дышат пятна горячего воздуха — то тут, то там.
// Волна идёт снизу вверх. Сдвиг — кусками кадра на точку-две, после мира
// и до печати: зерно и краска лежат на бумаге, марево — в мире.
// ?nohaze — без марева (сравнить).
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { scaler } from './scaler.js';
import { wind } from '../world/wind.js';
import { warpedDist, RINGS, RING_W, FIRE_W } from '../world/disc.js';
import { hash } from './draw.js';

const OFF = /[?&]nohaze\b/.test(typeof location !== 'undefined' ? location.search : '');
const CH = 4;                                  // ширина куска, точек
const PATCH = 150;                             // сетка пятен в гари
const FIRE_IN = RINGS * RING_W, FIRE_OUT = RINGS * RING_W + FIRE_W;
let buf = null, bctx = null;
let cam = { x: 0, y: 0 }, cols = [];

// столб: x, y0 — где начинается (над пламенем), H — высота, w0 — полуширина
// у основания, grow — на сколько шире к верху, amp — сила, lean — наклон
// по ветру (точек вбок на точку вверх)
export function column(x, y0, H, w0, grow, amp) {
  const w = wind.at(x, y0);
  return { x, y0, H, w0, grow, amp, lean: Math.max(-0.8, Math.min(0.8, w.x * 0.5)) };
}

// сдвиг в точке мира (wx, wy) от столба c в момент tt — целые точки
export function shiftAt(c, wx, wy, tt) {
  const h = c.y0 - wy;                         // высота над основанием
  if (h <= 0 || h >= c.H) return 0;            // ниже — пламя, выше — уже остыло
  const ev = Math.min(1, h / 6) * Math.pow(1 - h / c.H, 0.8);
  const cx = c.x + c.lean * h, hw = c.w0 + c.grow * h;
  const dx = (wx - cx) / hw;
  if (Math.abs(dx) >= 1) return 0;
  const wave = Math.sin(wy * 0.55 + tt * 0.21 + Math.sin(wx * 0.21 + tt * 0.045) * 1.6);
  return Math.round(c.amp * ev * (1 - dx * dx) * wave);
}

// жар кольца огня у точки: 0..1 (с краёв — на нет)
export function heatAt(x, y) {
  const d = warpedDist(x, y);
  if (d <= FIRE_IN - 60 || d >= FIRE_OUT + 60) return 0;
  if (d < FIRE_IN) return (d - (FIRE_IN - 60)) / 60;
  if (d > FIRE_OUT) return 1 - (d - FIRE_OUT) / 60;
  return 1;
}

// кадр: где что дрожит (вызывать из render, до сборки слоёв)
// noon — красный полдень (0…1): марево по всему кадру
// изнанка: под землёй марева нет — столбы прошлого кадра не тянем
export function hazeOff() { cols = []; }

export function hazeView(camX, camY, vw, vh, locations, noon = 0) {
  cam = { x: camX, y: camY };
  cols = [];
  if (OFF) return;
  const inView = (x, y, r) => x + r > camX && x - r < camX + vw && y > camY && y - 80 < camY + vh;
  const fire = locations.find(l => l.id === 'campfire');
  if (fire && inView(fire.x + 18, fire.y, 40)) cols.push(column(fire.x + 18, fire.y - 3, 48, 8, 0.27, 1.6));
  const sol = locations.find(l => l.id === 'sol_home');
  if (sol && inView(sol.x + 14, sol.y, 30)) cols.push(column(sol.x + 14, sol.y - 8, 30, 6, 0.2, 0.9));
  // гарь: пятна по сетке, каждое дышит — то есть, то нет
  const i0 = Math.floor((camX - 40) / PATCH), i1 = Math.floor((camX + vw + 40) / PATCH);
  const j0 = Math.floor((camY - 20) / PATCH), j1 = Math.floor((camY + vh + 60) / PATCH);
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
    const px = i * PATCH + 20 + hash(i, j, 2.7) * (PATCH - 40), py = j * PATCH + 30 + hash(i, j, 4.1) * (PATCH - 40);
    const heat = Math.max(heatAt(px, py), noon * 0.9);
    if (heat <= 0) continue;
    const breath = Math.sin(t * (0.004 + hash(i, j, 6.3) * 0.004) + hash(i, j, 8.9) * 6.28);
    if (breath <= 0.15) continue;
    cols.push(column(px, py, 26, 12, 0.35, 1.2 * heat * Math.min(1, (breath - 0.15) * 2.5)));
  }
}

// область столба на экране (точки логического кадра), уже обрезанная краями
function regionOf(c, vw, vh) {
  const reach = c.w0 + c.grow * c.H + Math.abs(c.lean) * c.H;
  return {
    x0: Math.max(0, Math.floor(c.x - reach - cam.x)), x1: Math.min(vw, Math.ceil(c.x + reach - cam.x)),
    y0: Math.max(0, Math.floor(c.y0 - c.H - cam.y)), y1: Math.min(vh, Math.ceil(c.y0 - cam.y)),
  };
}

// сдвиг кусков кадра (main — холст в точках экрана, ctx без преобразований):
// сначала копии всех областей, потом сдвиги — столбы не гнут друг друга дважды
export function hazeComposite(ctx, main) {
  if (!cols.length) return;
  const s = main.width / scaler.vw, vw = scaler.vw, vh = scaler.vh;
  if (!buf) { buf = document.createElement('canvas'); bctx = buf.getContext('2d'); }
  if (buf.width !== main.width || buf.height !== main.height) { buf.width = main.width; buf.height = main.height; }
  const regs = cols.map(c => regionOf(c, vw, vh));
  for (const r of regs) {
    if (r.x1 > r.x0 && r.y1 > r.y0) bctx.drawImage(main, r.x0 * s, r.y0 * s, (r.x1 - r.x0) * s, (r.y1 - r.y0) * s, r.x0 * s, r.y0 * s, (r.x1 - r.x0) * s, (r.y1 - r.y0) * s);
  }
  cols.forEach((c, k) => {
    const r = regs[k];
    for (let vy = r.y0; vy < r.y1; vy++) {
      const wy = vy + cam.y;
      let run = 0, rx = 0;                                       // соседние куски с одним сдвигом — одним вызовом
      for (let vx = r.x0; vx <= r.x1; vx += CH) {
        const sh = vx < r.x1 ? shiftAt(c, vx + CH / 2 + cam.x, wy, t) : 0;
        if (sh === run && sh) continue;
        if (run) ctx.drawImage(buf, rx * s, vy * s, (vx - rx) * s, s, (rx + run) * s, vy * s, (vx - rx) * s, s);
        run = sh; rx = vx;
      }
    }
  });
}

export const _cols = () => cols;
