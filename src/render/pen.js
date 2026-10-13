// ═══════════════════════════════════════
// ПЕРО — «чернила устают» (канон: IRONY_DEVICES Г-1; world_cells · daycycle):
// к ночи штрих тоньше — перо исписалось; на рассвете свежий нажим.
// Штрих мира — костяной по ночи («вечер — костяной штрих», ART_BIBLE): им и
// пишет перо. Нажим один на весь лист и идёт по фазе суток (world/sky.js):
//   толщина линий: lineWidth на слоях мира и земли умножается на нажим;
//   сухое перо: к ночи в светлых линиях просветы — перо пропускает, сквозь
//   штрих видна ночь; тёмное почти не меняется (просвет — умножение: светлое
//   гаснет на три четверти, тёмное и так тёмное);
//   огонь не трогается никогда: тепло не растрируется, огонь сплошной;
//   на рассвете перо обмакнули: штрих снова полный и сплошной.
// После второй краски, до пластины. ?nopen — без пера (сравнить).
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { scaler } from './scaler.js';

const DAY = 0.42, DUSK = 0.55, NIGHT = 0.92;   // фазы канона — как в world/sky.js
const GAP = '#404040';                         // просвет: умножение на четверть — штрих гаснет до ночи
const DOTS = 0.035;                            // доля пропусков при совсем сухом пере
const OFF = /[?&]nopen\b/.test(typeof location !== 'undefined' ? location.search : '');
let press = 1;
let baseC = null, baseX = null, workC = null, workX = null, builtKey = '';

const smooth = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };

// нажим по фазе: рассвет — свежий (1.15), к концу дня 0.95, к ночи 0.7,
// к утру 0.55 (исписалось); на рассвете обмакнули — снова 1.15
export function pressAt(p) {
  if (p < DAY) return 1.15 - 0.2 * (p / DAY);
  if (p < DUSK) return 0.95 - 0.25 * ((p - DAY) / (DUSK - DAY));
  if (p < NIGHT) return 0.7 - 0.15 * ((p - DUSK) / (NIGHT - DUSK));
  return 0.55 + 0.6 * smooth((p - NIGHT) / (1 - NIGHT));
}
export const dryOf = v => Math.max(0, Math.min(1, (0.95 - v) / 0.4));  // 0 — днём, 1 — к утру
export function setPress(v) { press = OFF ? 1 : v; }
export const getPress = () => press;

// толщина линий: на этом контексте lineWidth умножается на нажим
export function installPen(ctx) {
  let proto = Object.getPrototypeOf(ctx), d = null;
  while (proto && !(d = Object.getOwnPropertyDescriptor(proto, 'lineWidth'))) proto = Object.getPrototypeOf(proto);
  if (!d || !d.set) return;
  let want = ctx.lineWidth;
  Object.defineProperty(ctx, 'lineWidth', {
    configurable: true,
    get() { return want; },
    set(v) { want = v; d.set.call(this, v * press); },
  });
}

// пропуски сухого пера: короткие чёрточки вдоль строки (штрих пластины горизонтальный),
// перебегают раз в 8 кадров, как зерно
function base(w, h, dry, seed) {
  if (!baseC) { baseC = document.createElement('canvas'); baseX = baseC.getContext('2d'); }
  if (baseC.width !== w || baseC.height !== h) { baseC.width = w; baseC.height = h; builtKey = ''; }
  const key = Math.round(dry * 20) + ':' + seed;
  if (key === builtKey) return baseC;
  builtKey = key;
  baseX.fillStyle = '#fff';                                       // белое — умножение ничего не меняет
  baseX.fillRect(0, 0, w, h);
  baseX.fillStyle = GAP;
  const n = Math.round(w * h * DOTS * Math.round(dry * 20) / 20 / 2);   // чёрточка — две точки
  let s = (seed * 7919 + 13) % 233280;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280; const x = s / 233280 * w | 0;
    s = (s * 9301 + 49297) % 233280; const y = s / 233280 * h | 0;
    baseX.fillRect(x, y, 2, 1);
  }
  return baseC;
}

// проход по кадру (ctx — главный холст без преобразований, в точках экрана);
// warm — тёплые огни на экране [{x, y, r}] в точках кадра: там пропусков нет
export function penComposite(ctx, main, warm) {
  if (OFF) return;
  const dry = dryOf(press);
  if (dry <= 0.02) return;
  const s = main.width / scaler.vw, W = scaler.vw, H = scaler.vh;
  const B = base(W, H, dry, Math.floor(t / 8) % 64);
  if (!workC) { workC = document.createElement('canvas'); workX = workC.getContext('2d'); }
  if (workC.width !== W || workC.height !== H) { workC.width = W; workC.height = H; }
  workX.globalCompositeOperation = 'copy';
  workX.drawImage(B, 0, 0);
  workX.globalCompositeOperation = 'source-over';
  workX.fillStyle = '#fff';                                        // огонь сплошной — там пропусков нет
  for (const L of warm || []) { workX.beginPath(); workX.arc(L.x, L.y, L.r, 0, Math.PI * 2); workX.fill(); }
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';                       // светлый штрих рвётся, тёмное почти не меняется
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(workC, 0, 0, W, H, 0, 0, W * s, H * s);
  ctx.restore();
}
