// ═══════════════════════════════════════
// ЗАГЛАВНАЯ · СБОЙ ПО БОКАМ — середина картины чиста (луна, щит, городок), к краям
// экрана она сыпется цифрой. Два лица сбоя по очереди (слово автора: «иногда — растр»):
//  А — блоки: картина теряет точки, всё крупнее к краю, полосами разной глубины; строки
//      сорваны вбок; строка тянется вниз потёком; битые точки и обрывки строк;
//  Д — растр ротапринта: та же полоса картины точками — клетка втрое темнее, в ней точка
//      по светлоте и цветом самой картины, к краю клетка крупнее (брейнрот = растр).
// А стоит 8–14 с, Д — 4–7 с; смена — с рывком, новое лицо проступает строкой развёртки
// сверху вниз, как мир при пробуждении. Поверх обоих — рывки строк, подгрузка крупным
// блоком, потёки; текста нет — ни цифр, ни букв (слово автора 27.10). Словарь — тот же, что у пробуждения
// (render/wakefx.js): дробится сам кадр, сверху — только кость, пепел и редкая киноварь;
// рывков не больше трёх в секунду. Оба лица запекаются раз на размер окна (bake); живое —
// на своём холсте поверх, тридцать раз в секунду и только пока заглавная на экране (run).
// «Меньше движения» — только запечённое лицо А, без смен и рывков. Щит-афиша и кнопка
// FALL IN не трогаются (keep).
// ═══════════════════════════════════════
import { reducedMotion } from '../core/prefs.js';

const BO = '#D9CFB8', AS = '#8A8D8F', KV = '#C23B2B';
// полосы сбоя по картине (доли ширины): слева у земли — только край левее труб завода, выше,
// в дыму, — глубже; справа — всё правее луны и городка; на узком экране, где боков картины не
// видно, — ещё полоса у самого края экрана, послабее
const LEFT_SKY = 0.25, LEFT_GROUND = 0.095, SKY_TO = [0.5, 0.58], RIGHT = 0.68, RAMP_R = 0.25, EDGE = 0.09, EDGE_W = 0.75;
const STRIPE = 12;                                              // полоса глубины, точки экрана
const LEVELS = [[0.16, 4], [0.32, 6], [0.5, 10], [0.68, 16], [0.86, 24]];   // А: [порог веса, блок]
const RASTER = [[0.22, 4], [0.48, 6], [0.75, 8]], RASTER_BAND = 0.8;        // Д: [порог, клетка]; полоса чуть уже
const HOLD_A = [8000, 14000], HOLD_D = [4000, 7000], WIPE = 450;            // сколько стоит лицо; смена, мс
const RELOAD = 20;                                              // блок подгрузки заново

function hh(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const cl = v => v < 0 ? 0 : v > 1 ? 1 : v;

// вес сбоя в точке экрана (0 — чисто, 1 — край): по картине, у края экрана, полосами
// разной глубины; щит и кнопка — ноль; k < 1 — полоса уже
function baseW(L, x, y, k) {
  const xp = (x - L.dx) / L.dw, yp = (y - L.dy) / L.dh;
  if (xp < 0 || xp > 1) return 1;
  const s = cl((yp - SKY_TO[0]) / (SKY_TO[1] - SKY_TO[0])), lim = (LEFT_SKY + (LEFT_GROUND - LEFT_SKY) * s) * k;
  const w = Math.max(cl((lim - xp) / Math.max(0.02, lim - 0.01)), cl((xp - (1 - (1 - RIGHT) * k)) / (RAMP_R * k)));
  return L.edge ? Math.max(w, EDGE_W * cl(1 - Math.min(x, L.vw - x) / (EDGE * L.vw))) : w;
}
export function weightAt(L, x, y, k = 1) {
  const w = baseW(L, x, y, k);
  if (w <= 0) return 0;
  for (const r of L.keep) if (x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1) return 0;
  const j = Math.floor(y / STRIPE), d = hh(j, 1, L.seed);
  return w + (d - 0.5) * 0.36 + (hh(j, 2, L.seed) < 0.12 ? 0.3 : 0);   // полоса глубже или мельче соседних
}
const hitsKeep = (L, x, y, w, h) => L.keep.some(r => x < r.x1 && x + w > r.x0 && y < r.y1 && y + h > r.y0);
// полоса сбоя на строках y..y+h: слева — от края до a, справа — от b до края (по весу,
// у всех строк сразу — сорванная строка не заедет на щит)
function band(L, y, h) {
  let a = L.vw, b = 0;
  for (let yy = y; yy < y + Math.max(1, h); yy += 3) {
    let ra = 0, rb = L.vw;
    while (ra < L.vw * 0.5 && weightAt(L, ra, yy) > 0.05) ra += 4;
    while (rb > L.vw * 0.5 && weightAt(L, rb - 1, yy) > 0.05) rb -= 4;
    a = Math.min(a, ra); b = Math.max(b, rb);
  }
  return [a, b];
}
// строка и сторона сбоя: где полоса шире — туда чаще
function pick(L, rnd, h) {
  for (let k = 0; k < 6; k++) {
    const y = Math.floor(rnd() * Math.max(1, L.vh - h)), [a, b] = band(L, y, h), wl = a, wr = L.vw - b;
    if (wl + wr < 8) continue;
    const left = rnd() * (wl + wr) < wl;
    return { y, h, left, x0: left ? 0 : b, x1: left ? a : L.vw };
  }
  return null;
}
const lcg = seed => { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
const span = (rnd, [a, b]) => a + rnd() * (b - a);

let snapC = null, midC = null;
const faces = [null, null];                                     // запечённые лица: 0 — А, 1 — Д
const smalls = new Map();                                       // блок → картина, уменьшенная до блоков
function canvas(old, w, h) {
  const c = old || document.createElement('canvas');
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  return c;
}
// картина блоками p точек экрана (сетка от угла экрана)
function small(src, L, p) {
  if (smalls.has(p)) return smalls.get(p);
  const w = Math.max(1, Math.ceil(L.vw / p)), h = Math.max(1, Math.ceil(L.vh / p));
  const c = canvas(null, w, h), g = c.getContext('2d');
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(src, 0, 0, w * p * L.dpr, h * p * L.dpr, 0, 0, w, h);
  smalls.set(p, c);
  return c;
}
// сорванная строка: полоса сдвинута вбок в своих границах; бывает с налётом киновари или кости
function tear(g, src, D, q, dx, tint) {
  g.save();
  g.beginPath(); g.rect(q.x0, q.y, q.x1 - q.x0, q.h); g.clip();
  g.drawImage(src, q.x0 * D, q.y * D, (q.x1 - q.x0) * D, q.h * D, q.x0 + dx, q.y, q.x1 - q.x0, q.h);
  if (tint) { g.globalAlpha = tint === KV ? 0.24 : 0.1; g.fillStyle = tint; g.fillRect(q.x0, q.y, q.x1 - q.x0, q.h); }
  g.restore();
}
// потёк: одна строка картины тянется вниз столбом
const smear = (g, src, D, m) => g.drawImage(src, m.x * D, m.y * D, m.w * D, D, m.x, m.y, m.w, m.h);
// снимок холста — источник для сорванных строк уже по запечённому
function snapshot(c) {
  midC = canvas(midC, c.width, c.height);
  const g = midC.getContext('2d');
  g.clearRect(0, 0, c.width, c.height); g.drawImage(c, 0, 0);
  return midC;
}
// сорванные строки
function tears(g, L, rnd, src, n, shift, tintP) {
  for (let i = 0; i < n; i++) {
    const h = 2 + Math.floor(rnd() * (rnd() < 0.2 ? 40 : 14)), q = pick(L, rnd, h);
    if (!q || q.x1 - q.x0 < 6) continue;
    const reach = 4 + rnd() * 0.5 * (q.x1 - q.x0);
    tear(g, src, L.dpr, q, Math.round((q.left ? 1 : -1) * (rnd() < 0.7 ? 1 : -1) * Math.min(shift, reach)), rnd() < tintP ? KV : rnd() < 0.12 ? BO : null);
  }
}
// битые точки и обрывки строк: кость, пепел, редкая киноварь; per — точек на столько точек экрана
function dots(g, L, per) {
  const n = Math.round(L.vw * L.vh / per);
  for (let i = 0; i < n; i++) {
    const x = Math.floor(hh(i, 3, L.seed) * L.vw), y = Math.floor(hh(i, 4, L.seed) * L.vh), w = weightAt(L, x, y);
    if (w < 0.3 || hh(i, 5, L.seed) > w) continue;
    g.globalAlpha = 0.5 + 0.35 * hh(i, 6, L.seed);
    g.fillStyle = i % 9 === 4 ? KV : i % 3 ? BO : AS;
    const k = hh(i, 7, L.seed);
    if (k < 0.12) {                                             // строка-остаток — в своей полосе
      const len = 16 + Math.floor(hh(i, 8, L.seed) * 110), [a] = band(L, y, 1);
      g.globalAlpha *= 0.45;
      g.fillRect(x, y, x < L.vw / 2 ? Math.max(2, Math.min(len, a - x)) : len, 1);
    } else g.fillRect(x, y, k < 0.35 ? 2 : 1, k > 0.9 ? 2 : 1);
  }
  g.globalAlpha = 1;
}

// лицо А: блоки, сорванные строки, потёки, битые точки
function faceBlocks(g, c, L) {
  const rnd = lcg(L.seed * 7919);
  for (const [th, p] of LEVELS) {                               // мельче — шире, крупнее — у самого края
    g.save();
    g.beginPath();
    let any = false;
    for (let y = 0; y < L.vh; y += p) {
      let run = -1;
      for (let x = 0; x <= L.vw; x += p) {
        const on = x < L.vw && weightAt(L, x + p / 2, y + p / 2) >= th;
        if (on && run < 0) run = x;
        if (!on && run >= 0) { g.rect(run, y, x - run, p); run = -1; any = true; }
      }
    }
    if (any) {
      g.clip();
      const sm = smalls.get(p);
      g.drawImage(sm, 0, 0, sm.width, sm.height, 0, 0, sm.width * p, sm.height * p);
    }
    g.restore();
  }
  const mid = snapshot(c);
  tears(g, L, rnd, mid, Math.round(L.vh / 22), 64, 0.18);
  for (let i = 0, n = 4 + Math.round(L.vh / 260); i < n; i++) {   // потёки: по нескольку с каждого бока
    const q = pick(L, rnd, 1);
    if (!q || q.x1 - q.x0 < 10) continue;
    const w = Math.min(q.x1 - q.x0 - 2, 2 + 2 * Math.floor(rnd() * 7)), x = q.x0 + Math.floor(rnd() * (q.x1 - q.x0 - w)), h = 24 + Math.floor(rnd() * 180);
    if (hitsKeep(L, x, q.y, w, h)) continue;
    g.globalAlpha = 0.85; smear(g, mid, L.dpr, { x, y: q.y, w, h: Math.min(h, L.vh - q.y) }); g.globalAlpha = 1;
  }
  dots(g, L, 7000);
}
// лицо Д: растр ротапринта; строк сорвано мало, битых точек мало
function faceRaster(g, c, L) {
  const rnd = lcg(L.seed * 104729);
  for (const [th, p] of RASTER) {
    const sm = smalls.get(p), data = sm.getContext('2d').getImageData(0, 0, sm.width, sm.height).data;
    for (let y = 0; y < L.vh; y += p) for (let x = 0; x < L.vw; x += p) {
      if (weightAt(L, x + p / 2, y + p / 2, RASTER_BAND) < th) continue;
      const i = ((y / p) * sm.width + x / p) * 4, r = data[i], gg = data[i + 1], b = data[i + 2];
      const lum = (0.3 * r + 0.59 * gg + 0.11 * b) / 255, d = p * Math.min(1, 0.3 + Math.sqrt(lum) * 1.2);
      g.fillStyle = `rgb(${r * 0.3 | 0},${gg * 0.3 | 0},${b * 0.3 | 0})`; g.fillRect(x, y, p, p);
      g.fillStyle = `rgb(${Math.min(255, r * 1.3 + 10) | 0},${Math.min(255, gg * 1.3 + 8) | 0},${Math.min(255, b * 1.3 + 7) | 0})`;
      g.beginPath(); g.arc(x + p / 2, y + p / 2, d / 2, 0, Math.PI * 2); g.fill();
    }
  }
  tears(g, L, rnd, snapshot(c), Math.round(L.vh / 110), 14, 0.05);
  dots(g, L, 40000);
}
// лицо в свой холст: картина до сбоя + сбой, в точках экрана
function face(i, L, paintFace) {
  const c = faces[i] = canvas(faces[i], snapC.width, snapC.height), g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, c.width, c.height); g.drawImage(snapC, 0, 0);
  g.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
  g.save(); g.imageSmoothingEnabled = false;
  paintFace(g, c, L);
  g.restore();
  return c;
}
// ── запечь оба лица; в холст картины — лицо А ──
export function bake(g, cv, L) {
  L.edge = L.vw < 0.6 * L.dw;                                  // боков картины не видно — сыплется край экрана
  smalls.clear();
  snapC = canvas(snapC, cv.width, cv.height);                   // картина до сбоя: из неё блоки, растр и рывки
  snapC.getContext('2d').drawImage(cv, 0, 0);
  for (const [, p] of LEVELS) small(snapC, L, p);
  for (const [, p] of RASTER) small(snapC, L, p);
  small(snapC, L, RELOAD);
  face(0, L, faceBlocks);
  face(1, L, faceRaster);
  show(cv, 0);
}
function show(cv, i) {
  const g = cv.getContext('2d');
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(faces[i], 0, 0); g.restore();
}

// ── живой слой поверх ──
let raf = 0, layer = null;
export function stop() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  if (layer) layer.getContext('2d').clearRect(0, 0, layer.width, layer.height);
}
export function run(cv, over, L, shown) {
  stop();
  layer = over;
  over.width = cv.width; over.height = cv.height;
  if (reducedMotion() || !snapC || !faces[1]) return;
  const g = over.getContext('2d');
  g.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
  g.imageSmoothingEnabled = false;
  const D = L.dpr, rnd = lcg(L.seed);
  const S = { t0: -1, last: -1, face: 0, until: span(rnd, HOLD_A), wipe: null, burst: null, next: 400 + rnd() * 700, tears: [], tearsAt: -1, smears: [], nextSmear: 500, reload: null };
  const frame = now => {
    raf = 0;
    if (!shown()) { stop(); return; }
    raf = requestAnimationFrame(frame);
    if (S.t0 < 0) S.t0 = now;
    const t = now - S.t0;
    if (S.last >= 0 && t - S.last < 33) return;                 // тридцать раз в секунду
    S.last = t;
    g.clearRect(0, 0, L.vw, L.vh);
    // смена лица: с рывком; новое проступает строкой развёртки сверху вниз
    if (!S.wipe && t >= S.until) { S.wipe = { to: 1 - S.face, t0: t }; S.next = Math.min(S.next, t); }
    if (S.wipe) {
      const k = (t - S.wipe.t0) / WIPE;
      if (k >= 1) {
        show(cv, S.wipe.to);
        S.face = S.wipe.to; S.until = t + span(rnd, S.face ? HOLD_D : HOLD_A); S.wipe = null;
      } else {
        const y = Math.round(k * L.vh);
        g.drawImage(faces[S.wipe.to], 0, 0, cv.width, y * D, 0, 0, L.vw, y);
        g.globalAlpha = 0.35; g.fillStyle = BO; g.fillRect(0, y, L.vw, 1); g.globalAlpha = 1;
      }
    }
    const src = faces[S.face];
    // рывок: раз в 0,5–2 с на 0,12–0,36 с — строки уезжают вбок, держатся по 70 мс
    if (!S.burst && t >= S.next) { S.burst = { t0: t, len: 120 + rnd() * 240 }; S.next = t + 500 + rnd() * 1500; }
    if (S.burst && t - S.burst.t0 > S.burst.len) { S.burst = null; S.tears = []; S.reload = null; }
    if (S.burst && t - S.tearsAt >= 70) {
      S.tearsAt = t; S.tears = []; S.reload = null;
      for (let i = 0, n = 2 + Math.floor(rnd() * 5); i < n; i++) {
        const big = rnd() < 0.2, q = pick(L, rnd, big ? 40 + Math.floor(rnd() * 100) : 2 + Math.floor(rnd() * 18));
        if (!q) continue;
        S.tears.push({ q, dx: Math.round((rnd() < 0.5 ? -1 : 1) * (6 + rnd() * (big ? 36 : 60))), tint: rnd() < 0.25 ? KV : rnd() < 0.15 ? BO : null });
      }
      if (rnd() < 0.6) {                                        // кусок подгружается заново — крупно
        const h = 16 + Math.floor(rnd() * 40), q = pick(L, rnd, h);
        if (q && q.x1 - q.x0 > 30) {
          const w = Math.min(q.x1 - q.x0, 30 + Math.floor(rnd() * 90)), x = q.x0 + Math.floor(rnd() * (q.x1 - q.x0 - w + 1));
          if (!hitsKeep(L, x, q.y, w, h)) S.reload = { x, y: q.y, w, h };
        }
      }
    }
    for (const r of S.tears) tear(g, src, D, r.q, r.dx, r.tint);
    if (S.reload) {
      const r = S.reload, sm = smalls.get(RELOAD), p = RELOAD;
      const bx = Math.floor(r.x / p), by = Math.floor(r.y / p), bw = Math.ceil((r.x + r.w) / p) - bx, bh = Math.ceil((r.y + r.h) / p) - by;
      g.save(); g.beginPath(); g.rect(r.x, r.y, r.w, r.h); g.clip();
      if (sm) g.drawImage(sm, bx, by, bw, bh, bx * p, by * p, bw * p, bh * p);
      g.restore();
    }
    // потёк: строка тянется вниз столбом и держится 0,3–1,2 с; не больше трёх сразу
    S.smears = S.smears.filter(m => t < m.end);
    if (t >= S.nextSmear && S.smears.length < 3) {
      const q = pick(L, rnd, 1);
      if (q && q.x1 - q.x0 > 6) {
        const w = Math.min(q.x1 - q.x0, 2 * (2 + Math.floor(rnd() * 13))), x = q.x0 + Math.floor(rnd() * (q.x1 - q.x0 - w + 1)), h = 20 + Math.floor(rnd() * 160);
        if (!hitsKeep(L, x, q.y, w, h)) S.smears.push({ x, y: q.y, w, h: Math.min(h, L.vh - q.y), end: t + 300 + rnd() * 900 });
      }
      S.nextSmear = t + 600 + rnd() * 1200;
    }
    for (const m of S.smears) smear(g, src, D, m);
  };
  raf = requestAnimationFrame(frame);
}
