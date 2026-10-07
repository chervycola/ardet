// ═══════════════════════════════════════
// ВТОРАЯ КРАСКА — красный печатается отдельным прогоном, плашкой.
// Не подкраска и не среда: регулятор покрытия (weave/REVE_PROJECT.md).
//   0 · индикаторы  1–3 %   мёртвые сцены: луна гаснет, красное — только точки
//   1 · норма       5–10 %  диск луны с потёками и полоса неба по верху кадра
//   2 · группа     20–30 %  одна группа вещей отпечатана красным целиком
//   3 · заливка    60–90 %  воздух кадра залит; чёрное — графика поверх
//                           красного, не-красным остаётся одно горячее ядро
// Заливка — расходный приём: только острые моменты.
// Приводка неточная: красная форма гуляет на точку от чёрной.
// ═══════════════════════════════════════
import { scaler } from './scaler.js';
import { t } from '../core/time.js';
import { plate } from './plate.js';

const NIGHT = [13, 11, 10], CRIMSON = [107, 15, 26], CINNABAR = [194, 59, 43], BONE = [217, 207, 184];
const HOT = [226, 96, 70];          // киноварь на свету — светлее, но ещё красная
const BLACK_SHARE = 0.38;           // доля кадра под чёрной формой при заливке
export const INK_NAMES = ['индикаторы', 'норма', 'группа', 'заливка'];
const COVER = ['1–3 %', '5–10 %', '20–30 %', '60–90 %'];

let level = 1, reason = '';             // что просит сцена
let override = null;                    // ручной регулятор (клавиша I, ?ink=N)
let flood = 0, band = 1, groupA = 0;    // плавные доли ступеней
let group = [];                         // вещи, отпечатанные красным
let pulseUntil = 0, pulseLevel = 3;     // короткий острый момент
let shownAt = -1e9, noteTxt = '';       // подпись регулятора
let small = null, smallCtx = null, groupC = null, groupCtx = null;

try {
  const q = new URLSearchParams(location.search).get('ink');
  if (q !== null && /^[0-3]$/.test(q)) override = +q;
} catch (e) {}

function buffers() {
  const w = scaler.vw, h = scaler.vh;
  if (!small || small.width !== w || small.height !== h) {
    small = document.createElement('canvas'); small.width = w; small.height = h;
    smallCtx = small.getContext('2d', { willReadFrequently: true });
    groupC = document.createElement('canvas'); groupC.width = w; groupC.height = h;
    groupCtx = groupC.getContext('2d');
  }
}

export const ink = {
  // сцена сообщает, чего хочет; побеждает самое сильное за кадр
  want(n, why) { if (n > level || (n === 0 && level === 1 && !reason)) { level = n; reason = why || ''; } },
  // острый момент на ms миллисекунд (замок, проход врат)
  pulse(ms, n = 3) { pulseUntil = performance.now() + ms; pulseLevel = n; },
  setGroup(locs) { group = locs || []; },
  cycle() {
    noteTxt = '';
    override = override === null ? 0 : override >= 3 ? null : override + 1;
    shownAt = performance.now();
  },
  get level() { return this.effective(); },
  effective() {
    if (override !== null) return override;
    if (performance.now() < pulseUntil) return Math.max(level, pulseLevel);
    return level;
  },
  beginFrame() { level = 1; reason = ''; },

  // плавный переход между ступенями
  update() {
    const L = this.effective();
    const k = 0.08;
    flood += ((L === 3 ? 1 : 0) - flood) * k;
    band += ((L >= 1 ? 1 : 0) - band) * k;
    groupA += ((L === 2 ? 1 : 0) - groupA) * k;
    if (flood < 0.003) flood = 0;
    if (groupA < 0.003) groupA = 0;
  },

  // луна: плашка киновари с потёками (норма) — или почти погасшая (индикаторы)
  drawMoon(ctx, cam) {
    // луна висит в правой верхней трети и чуть плывёт за камерой
    const mx = Math.round(scaler.vw * 0.8 + Math.sin(cam.x * 0.0004) * 26);
    const my = Math.round(30 + Math.sin(cam.y * 0.0005) * 6);
    const a = 0.18 + 0.82 * band;
    ctx.save();
    ctx.globalAlpha = 0.10 * a;
    const g = ctx.createRadialGradient(mx, my, 6, mx, my, 42);
    g.addColorStop(0, '#6b0f1a'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(mx - 42, my - 42, 84, 84);
    // диск — ровная плашка, без бликов; приводка гуляет на точку
    const off = plate.misreg() + ((Math.floor(t / 97) % 7 === 0) ? 1 : 0);
    ctx.globalAlpha = 0.9 * a;
    ctx.fillStyle = '#C23B2B';
    ctx.beginPath(); ctx.arc(mx + off, my, 9, 0, Math.PI * 2); ctx.fill();
    // потёки — краска стекла с формы
    for (const [dx, len] of [[-4, 5], [1, 9], [5, 3]]) {
      const l = Math.round(len * band + Math.sin(t * 0.002 + dx) * 0.6);
      ctx.fillRect(mx + dx + off, my + 7, 1, l);
      ctx.fillRect(mx + dx + off, my + 7 + l, 1, 1);
    }
    // чёрная форма сверху: ущерб по левому краю
    ctx.globalAlpha = a;
    ctx.fillStyle = '#0D0B0A';
    for (let dy = -6; dy <= 6; dy++) ctx.fillRect(mx - 9 + off, my + dy, Math.max(0, 3 - Math.abs(dy) / 3) | 0, 1);
    ctx.restore();
  },

  // вещи группы — красной формой поверх кадра (рисует render, пока камера на месте)
  drawGroup(drawFn, camX, camY) {
    if (groupA <= 0 || !group.length) return;
    buffers();
    groupCtx.setTransform(1, 0, 0, 1, 0, 0);
    groupCtx.clearRect(0, 0, groupC.width, groupC.height);
    groupCtx.save();
    groupCtx.translate(-camX, -camY);
    for (const loc of group) drawFn(groupCtx, loc);
    groupCtx.restore();
    // силуэт → плашка: светлое в вещи станет киноварью, тёмное останется чёрным
    groupCtx.globalCompositeOperation = 'source-atop';
    groupCtx.fillStyle = '#C23B2B';
    groupCtx.globalAlpha = 0.85;
    groupCtx.fillRect(0, 0, groupC.width, groupC.height);
    groupCtx.globalAlpha = 1;
    groupCtx.globalCompositeOperation = 'source-over';
  },

  // проход в композите: после света и эффектов, до интерфейса
  composite(ctx, mainCanvas) {
    const s = scaler.scale, W = scaler.vw, H = scaler.vh;
    // норма: полоса неба по верху кадра, багровым
    if (band > 0.01) {
      const g = ctx.createLinearGradient(0, 0, 0, H * 0.16 * s);
      g.addColorStop(0, `rgba(107,15,26,${0.55 * band})`);
      g.addColorStop(0.7, `rgba(107,15,26,${0.18 * band})`);
      g.addColorStop(1, 'rgba(107,15,26,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W * s, H * 0.16 * s);
    }
    // группа: красная форма со сдвигом приводки
    if (groupA > 0 && groupC) {
      const mr = Math.max(1, plate.misreg());
      ctx.globalAlpha = groupA;
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(groupC, 0, 0, W, H, mr * s, 0, W * s, H * s);
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = groupA * 0.55;
      ctx.drawImage(groupC, 0, 0, W, H, mr * s, 0, W * s, H * s);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
    // заливка: делёж кадра на две формы — чёрную и красную
    if (flood > 0) {
      buffers();
      smallCtx.imageSmoothingEnabled = false;
      smallCtx.drawImage(mainCanvas, 0, 0, mainCanvas.width, mainCanvas.height, 0, 0, W, H);
      const img = smallCtx.getImageData(0, 0, W, H), d = img.data;
      const f = flood, n = d.length / 4;
      // порог чёрной формы — по самому кадру: тёмная треть остаётся графикой
      const hist = new Uint32Array(64);
      for (let i = 0; i < d.length; i += 16) hist[(d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 10]++;
      let acc = 0, p0 = 0, p1 = 63; const tot = n / 4;
      for (let k = 0; k < 64; k++) { acc += hist[k]; if (acc < tot * BLACK_SHARE) p0 = k; if (acc < tot * 0.97) p1 = k; }
      const lo = (p0 + 0.5) / 64, hi = Math.max(lo + 0.06, (p1 + 1) / 64);
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], gr = d[i + 1], b = d[i + 2];
        // горячее ядро — огонь и свеча — единственное не-красное
        if (r > 170 && gr > 90 && b < 120 && r - b > 80) continue;
        const L = (0.299 * r + 0.587 * gr + 0.114 * b) / 255;
        let o;
        if (L > 0.78) o = BONE;                               // белое прожигает красное
        else if (L <= lo) o = NIGHT;                          // чёрная графика поверх красного
        else {
          const u = Math.min(1, (L - lo) / (hi - lo));
          o = u < 0.12 ? mix(NIGHT, CRIMSON, u / 0.12, null, 1)   // кромка: в красное через багровый
            : u < 0.75 ? mix(CRIMSON, CINNABAR, Math.min(1, (u - 0.12) / 0.35), null, 1)
            : mix(CINNABAR, HOT, (u - 0.75) / 0.25 * 0.6, null, 1);
        }
        d[i] = r + (o[0] - r) * f; d[i + 1] = gr + (o[1] - gr) * f; d[i + 2] = b + (o[2] - b) * f;
      }
      smallCtx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small, 0, 0, W, H, 0, 0, W * s, H * s);
    }
  },

  // подпись регулятора — только когда его крутят руками
  drawLabel(ctx) {
    const age = performance.now() - shownAt;
    if (age > 2200) return;
    const L = this.effective();
    const txt = noteTxt ? noteTxt : override === null
      ? `ВТОРАЯ КРАСКА · АВТО · ${INK_NAMES[L]}${reason ? ' — ' + reason : ''}`
      : `ВТОРАЯ КРАСКА · ${L} · ${INK_NAMES[L]} · ${COVER[L]}`;
    ctx.save();
    ctx.globalAlpha = Math.min(1, (2200 - age) / 400);
    ctx.font = '8px "Press Start 2P",monospace';
    const w = ctx.measureText(txt).width;
    ctx.fillStyle = 'rgba(13,11,10,0.85)';
    ctx.fillRect(8, 8, w + 12, 16);
    ctx.fillStyle = '#C23B2B';
    ctx.fillText(txt, 14, 19);
    ctx.restore();
  },
  tint() { return band; },            // доля красного в общей подкраске кадра
  note(txt) { noteTxt = txt; shownAt = performance.now(); },
  getReason() { return reason; },
  isOverride() { return override !== null; },
};

// смешать два цвета, затем (если задан) подложить под чёрную форму
function mix(a, b, k, under, ku) {
  let o = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  if (under) o = [under[0] + (o[0] - under[0]) * ku, under[1] + (o[1] - under[1]) * ku, under[2] + (o[2] - under[2]) * ku];
  return o;
}
