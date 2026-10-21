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
const NOON = [163, 45, 45];         // ПОЛДЕНЬ #A32D2D — красный полдень (ART_BIBLE)
const BLACK_SHARE = 0.38;           // доля кадра под чёрной формой при заливке
export const INK_NAMES = ['индикаторы', 'норма', 'группа', 'заливка'];
const COVER = ['1–3 %', '5–10 %', '20–30 %', '60–90 %'];

let level = 1, reason = '';             // что просит сцена
let override = null;                    // ручной регулятор (клавиша I, ?ink=N)
let flood = 0, band = 1, groupA = 0;    // плавные доли ступеней
let group = [];                         // вещи, отпечатанные красным
let pulseUntil = 0, pulseLevel = 3;     // короткий острый момент
let noonK = 0;                          // красный полдень (world/redNoon.js): 0…1
let skyOn = true;                       // под землёй неба нет — полосы неба тоже (world/underside.js)
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

// лицо солнца — является в красный полдень (ART_BIBLE): гротескное, строгое;
// венок колосьев, трещины позолоты; едва различимо — строки дрожат в мареве
function sunFace(ctx, s, W, H, a) {
  const cx = Math.round(W * 0.5), cy = Math.round(H * 0.27), R = Math.round(Math.min(W, H) * 0.2);
  const wob = y => Math.round(Math.sin(y * 0.35 + t * 0.12) * 1.2);
  const run = (x0, x1, y, col, al) => { ctx.globalAlpha = al * a; ctx.fillStyle = col; ctx.fillRect(x0 + wob(y), y, Math.max(1, x1 - x0), 1); };
  ctx.save(); ctx.setTransform(s, 0, 0, s, 0, 0);
  for (let dy = -R; dy <= R; dy++) {                              // диск — чуть светлее заливки
    const hw = Math.round(Math.sqrt(R * R - dy * dy));
    run(cx - hw, cx + hw, cy + dy, '#B83838', 0.07);
  }
  for (let i = 0; i < 30; i++) {                                  // венок: колосья косо по кромке
    const g = i / 30 * Math.PI * 2;
    for (let r = R + 2; r < R + 9; r++) {
      const q = g + (r - R) * 0.05;
      run(Math.round(cx + Math.cos(q) * r), Math.round(cx + Math.cos(q) * r) + 1, Math.round(cy + Math.sin(q) * r), '#7E1F1F', 0.14);
    }
  }
  const dark = '#5E1414';
  for (const ex of [-1, 1]) {                                     // глаза: тяжёлые веки, пустые
    const x = cx + ex * Math.round(R * 0.36), y = cy - Math.round(R * 0.12);
    [[0, 3], [1, 6], [2, 8], [3, 6], [4, 3]].forEach(([dy, w]) => run(x - (w >> 1), x + (w >> 1) + 1, y + dy - 2, dark, 0.2));
    run(x - 5, x + 6, y - 5, dark, 0.15);                          // бровь — строго
  }
  for (let y = cy - Math.round(R * 0.04); y < cy + Math.round(R * 0.22); y++) run(cx, cx + 1, y, dark, 0.18);   // нос
  const my = cy + Math.round(R * 0.42), mw = Math.round(R * 0.32);
  run(cx - mw, cx + mw, my, dark, 0.2);                           // рот — уголки вниз
  run(cx - mw - 2, cx - mw, my + 1, dark, 0.2); run(cx + mw, cx + mw + 2, my + 1, dark, 0.2);
  for (const [a0, len] of [[0.6, 0.55], [2.4, 0.4], [4.1, 0.5]]) { // трещины позолоты — от кромки внутрь
    let x = cx + Math.cos(a0) * R, y = cy + Math.sin(a0) * R;
    for (let i = 0; i < R * len; i++) {
      x -= Math.cos(a0) + Math.sin(i * 1.7) * 0.6; y -= Math.sin(a0) + Math.cos(i * 1.3) * 0.6;
      run(Math.round(x), Math.round(x) + 1, Math.round(y), dark, 0.15);
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

export const ink = {
  // сцена сообщает, чего хочет; побеждает самое сильное за кадр
  want(n, why) { if (n > level || (n === 0 && level === 1 && !reason)) { level = n; reason = why || ''; } },
  // острый момент на ms миллисекунд (замок, проход врат)
  pulse(ms, n = 3) { pulseUntil = performance.now() + ms; pulseLevel = n; },
  setGroup(locs) { group = locs || []; },
  noon(v) { noonK = v; },                // красный полдень: доля плоской киновари
  sky(on) { skyOn = !!on; },
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
    band += ((L >= 1 && skyOn ? 1 : 0) - band) * k;
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
      g.addColorStop(0, `rgba(194,59,43,${0.34 * band})`);          // киноварью (прежний багровый — вне палитры)
      g.addColorStop(0.7, `rgba(194,59,43,${0.1 * band})`);
      g.addColorStop(1, 'rgba(194,59,43,0)');
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
    // заливка: делёж кадра на две формы — чёрную и красную;
    // красный полдень: всё в одну плоскую краску, от формы — едва след
    if (flood > 0 || noonK > 0) {
      buffers();
      smallCtx.imageSmoothingEnabled = false;
      smallCtx.drawImage(mainCanvas, 0, 0, mainCanvas.width, mainCanvas.height, 0, 0, W, H);
      const img = smallCtx.getImageData(0, 0, W, H), d = img.data;
      const f = flood, nk = noonK, n = d.length / 4;
      let lo = 0, hi = 1;
      if (f > 0) {
        // порог чёрной формы — по самому кадру: тёмная треть остаётся графикой
        const hist = new Uint32Array(64);
        for (let i = 0; i < d.length; i += 16) hist[(d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 10]++;
        let acc = 0, p0 = 0, p1 = 63; const tot = n / 4;
        for (let k = 0; k < 64; k++) { acc += hist[k]; if (acc < tot * BLACK_SHARE) p0 = k; if (acc < tot * 0.97) p1 = k; }
        lo = (p0 + 0.5) / 64; hi = Math.max(lo + 0.06, (p1 + 1) / 64);
      }
      for (let i = 0; i < d.length; i += 4) {
        let r = d[i], gr = d[i + 1], b = d[i + 2];
        // горячее ядро — огонь и свеча — единственное не-красное (и в полдень: видно одно тепло)
        if (r > 170 && gr > 90 && b < 120 && r - b > 80) continue;
        if (f > 0) {
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
          r += (o[0] - r) * f; gr += (o[1] - gr) * f; b += (o[2] - b) * f;
        }
        if (nk > 0) {                                           // ни чёрного, ни белого: свет плоский
          const m = 0.86 + 0.28 * (0.299 * r + 0.587 * gr + 0.114 * b) / 255;
          r += (NOON[0] * m - r) * nk; gr += (NOON[1] * m - gr) * nk; b += (NOON[2] * m - b) * nk;
        }
        d[i] = r; d[i + 1] = gr; d[i + 2] = b;
      }
      smallCtx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small, 0, 0, W, H, 0, 0, W * s, H * s);
    }
    if (noonK > 0.02) sunFace(ctx, s, W, H, noonK);
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
