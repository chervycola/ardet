// ═══════════════════════════════════════
// ТОКСИК — поле токсичности и то, что яд делает с картинкой.
// Яд не рисует цифр (слово автора: двоичный код вышел нарочитым и мультяшным).
// Над ядовитыми местами — озеро, подвал, трубопровод, пропасть, равнина
// Лунного — картинка мира протёрта: точками, по растру, гуще к середине.
// Сквозь протёртое видно, что за экраном (render/backstage.js): старая
// командная строка и блок-схемы. Протёртость стоит в мире, машина — в
// экране: идёшь — одно едет по другому. Дышит медленно, без вспышек.
// Огонь не протирается (тепло не растрируется): у горящей мусорки — только
// счётчик. Красный полдень — мир без текста: машины не видно.
// Изредка — где яда много, не чаще раза в две минуты (слово автора: «не
// дождём, а иногда прорываться в экран») — картинка у источника расходится
// шире, растром, и машина допечатывает о месте строку; потом картинка
// затягивается. Стекло не трескается — экран бьётся только от молнии и от
// брейнрота (решение автора). «Меньше движения» в системе — без прорывов,
// протёртость не дышит.
// Третья краска: ТОКСИЧНЫЙ ЗЕЛЁНЫЙ #8CC63F — только свечением: люминофор машины.
// ═══════════════════════════════════════
import { ringAt, RINGS } from './disc.js';
import { scaler } from '../render/scaler.js';
import { backstage, drawBack, MONO, PROMPT, BACK_COLORS } from '../render/backstage.js';
import { reducedMotion } from '../core/prefs.js';

const TOXIC_IDS = new Set(['lake', 'pipeline', 'basement', 'dumpster', 'pit', 'toxic_dump']);
const FIRE_IDS = new Set(['dumpster']);                    // горит — не протирается
// [доля величины места, сила]: озеро протёрто по всей глади, труба — у пробоины
const WORN = { lake: [1, 1], pit: [0.9, 1], basement: [0.8, 0.9], pipeline: [0.55, 0.8], toxic_dump: [0.8, 0.9], nocturnal: [0.6, 0.7] };

let sources = null;
let tox = 0, toxTest = false, burstTest = false;
try { toxTest = /[?&]tox\b/.test(location.search); burstTest = /[?&]toxburst\b/.test(location.search); } catch (e) {}
let frame = 0;
// прорыв: один за раз, между прорывами — не меньше двух минут (7200 шагов);
// растр расходится (IN), держится (HOLD), затягивается (OUT)
export const GAP = 7200, IN = 32, HOLD = 210, OUT = 48;
let burst = null, lastBurst = -GAP;
let cam = null;                                             // камера этого кадра — ставит отрисовка поверхности
const reducedNow = reducedMotion;   // система или «меньше движения» в настройках быта (core/prefs.js)

function hh(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hh(xi, yi, s), b = hh(xi + 1, yi, s), c = hh(xi, yi + 1, s), d = hh(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bay = (i, j) => (BAYER[((j & 3) << 2) | (i & 3)] + 0.5) / 16;
const seedOf = id => { let h = 7; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) | 0; return h >>> 0; };

function srcList(locations) {
  if (!sources) sources = locations.filter(l => l.zone === 'toxic' || TOXIC_IDS.has(l.id));
  return sources;
}

// протёртое место: эллипс у земли источника (точки мира); огонь и живые — нет
export function wornOf(l) {
  if (!l || FIRE_IDS.has(l.id) || l.npc) return null;
  const [k, f] = WORN[l.id] || [0.7, 0.8];
  return { id: l.id, cx: Math.round(l.x + l.w / 2), cy: Math.round(l.y + l.h * 0.7), rx: Math.max(6, Math.round((l.w * 0.45 + 10) * k)), ry: Math.max(4, Math.round((l.h * 0.3 + 6) * k)), f, seed: seedOf(l.id) };
}
// какие точки протёрты (level 0..1): гуще к середине, края рваные — шум в точках мира
export function wornMask(P, level) {
  const w = P.rx * 2, h = P.ry * 2, m = new Uint8Array(w * h);
  if (level <= 0) return m;
  const X0 = P.cx - P.rx, Y0 = P.cy - P.ry;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const dx = (i + 0.5 - P.rx) / P.rx, dy = (j + 0.5 - P.ry) / P.ry, d = dx * dx + dy * dy;
    if (d >= 1) continue;
    const f = (1 - d) * (0.55 + 0.9 * vnoise((X0 + i) / 5, (Y0 + j) / 5, P.seed));
    if (f * level > bay(X0 + i, Y0 + j)) m[j * w + i] = 1;
  }
  return m;
}
// прорыв: сколько растра открыто к шагу t — ступенями, по растру
export function burstLevel(t) {
  if (t < 0) return 0;
  if (t < IN) return Math.ceil((t + 1) / 2) / (IN / 2);
  if (t < IN + HOLD) return 1;
  if (t < IN + HOLD + OUT) return Math.max(0, 1 - Math.ceil((t - IN - HOLD + 1) / 3) / (OUT / 3));
  return 0;
}
// прорыв — пятном: середина открыта целиком, край рваный и растром
export function burstMask(w, h, level, seed) {
  const m = new Uint8Array(w * h);
  if (level <= 0) return m;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const dx = (i + 0.5 - w / 2) / (w / 2), dy = (j + 0.5 - h / 2) / (h / 2);
    const d = Math.sqrt(dx * dx * 0.85 + dy * dy) + (vnoise(i / 9, j / 9, seed) - 0.5) * 0.35;
    const f = d < 0.72 ? 1.02 : Math.max(0, (1 - d) / 0.28);
    if (f * level > bay(i, j)) m[j * w + i] = 1;
  }
  return m;
}

// что машина допечатывает о месте (нов.; по канону мест — looks.js): $ — команда
export const BURST_LINES = {
  lake: ['$check lake.dat', 'Проба 0048 ........... pH 2,0', 'Норма ................ пересмотрена', 'Превышение ........... 0%'],
  pipeline: ['$check pipe.dat', 'Версия 5 ............. —', 'Строка пустая. Записать? (Д/Н)'],
  pit: ['$echo Подъём > pit.dat', 'Доступ запрещён.', '$type pit.dat', 'Отбой.'],
  basement: ['$dir basement', 'Углов ................ 5', 'Ожидалось ............ 4', 'Прервать, Повторить, Пропустить?'],
  nocturnal: ['$type noise.log', 'Замер 1 .............. тихо', 'Замер 2 .............. тихо', 'Почерк замера 2 ...... опознан'],
  _: ['$check *.dat', 'Превышение ........... 0%', 'Норма ................ пересмотрена'],
};
// печать к шагу t удержания: команда — по знаку в два шага, ответ — строкой сразу
export function typedAt(lines, t) {
  const out = [];
  let c = 8, cursor = -1;
  for (const raw of lines) {
    if (t < c) break;
    if (raw[0] === '$') {
      const cmd = raw.slice(1), n = Math.min(cmd.length, Math.floor((t - c) / 2));
      out.push({ s: PROMPT + cmd.slice(0, n), cmd: true });
      cursor = out.length - 1;
      if (n < cmd.length) return { lines: out, cursor };
      c += cmd.length * 2 + 14;
    } else { out.push({ s: raw, cmd: false }); cursor = -1; c += 16; }
  }
  if (t >= c && out.length === lines.length) { out.push({ s: PROMPT, cmd: true }); cursor = out.length - 1; }
  return { lines: out, cursor };
}

// ── холсты: маски растром и черновой холст для куска машины ──
const masks = new Map();
function maskCanvas(key, w, h, bits) {
  if (masks.has(key)) return masks.get(key);
  if (typeof document === 'undefined' || !document.createElement) return null;
  const c = document.createElement('canvas');
  if (!c || !c.getContext) return null;
  c.width = w; c.height = h;
  const g = c.getContext('2d'), img = g.createImageData(w, h);
  for (let k = 0; k < bits.length; k++) if (bits[k]) img.data[k * 4 + 3] = 255;
  g.putImageData(img, 0, 0);
  if (masks.size > 64) masks.clear();
  masks.set(key, c);
  return c;
}
let scratch = null;
function scratchCtx(w, h) {
  if (typeof document === 'undefined' || !document.createElement) return null;
  if (!scratch) scratch = document.createElement('canvas');
  if (!scratch.getContext) return null;
  if (scratch.width < w) scratch.width = w;
  if (scratch.height < h) scratch.height = h;
  const g = scratch.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  g.clearRect(0, 0, w, h);
  g.imageSmoothingEnabled = false;
  return g;
}
// кусок машины в рамку экрана x,y,w,h (точки экрана) — сквозь маску (точки мира, ×s)
function throughMask(ctx, B, x, y, w, h, mask, alpha, overlay) {
  const g = scratchCtx(w, h);
  if (!g) return;
  g.setTransform(1, 0, 0, 1, -x, -y);
  drawBack(g, B, x, y, w, h, frame);
  if (overlay) overlay(g);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(mask, 0, 0, mask.width, mask.height, 0, 0, w, h);
  g.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = alpha;
  ctx.drawImage(scratch, 0, 0, w, h, x, y, w, h);
  ctx.globalAlpha = 1;
}

export const toxic = {
  setTest(on) { toxTest = on; },
  isTest() { return toxTest; },
  level() { return tox; },
  burst() { return burst; },

  // изнанка: яда нет и прорывов нет — счётчик стихает
  hush() { tox += (0 - tox) * 0.05; burst = null; },

  // токсичность у ног: 0..1
  update(px, py, locations, extra = 0) {
    frame++;
    let v = 0;
    const ring = ringAt(px, py);
    if (ring === 7) v = 0.22;                    // век катастроф: фон после аварий
    if (ring === RINGS + 1) v = 0.45;            // огонь
    if (ring === RINGS + 2) v = 0.7;             // за краем
    for (const l of srcList(locations)) {
      const d = Math.hypot(l.x + l.w / 2 - px, l.y + l.h / 2 - py) - Math.max(l.w, l.h) / 2;
      if (d < 240) v = Math.max(v, 0.35 + 0.65 * (1 - Math.max(0, d) / 240));
    }
    v = Math.max(v, extra);
    if (toxTest) v = Math.max(v, 0.85);
    tox += (v - tox) * 0.05;
    return tox;
  },

  // ── шаг: прорыв — где яда много, у видимого источника; рамка стоит в экране ──
  step(camX, camY, locations) {
    const W = scaler.vw, H = scaler.vh;
    srcList(locations);
    if (!burst && !reducedNow() && tox > 0.45 && frame - lastBurst > (burstTest ? 180 : GAP) && Math.random() < (burstTest ? 0.05 : 0.0006 * (tox - 0.4) * 10)) {
      let best = null, bd = Infinity;
      for (const l of sources) {
        const P = wornOf(l);
        if (!P) continue;
        const sx = P.cx - camX, sy = P.cy - camY;
        if (sx < 0 || sx > W || sy < 0 || sy > H) continue;
        const d = Math.hypot(sx - W / 2, sy - H / 2);
        if (d < bd) { bd = d; best = { P, sx, sy }; }
      }
      if (best) {
        const w = Math.round(Math.min(340, Math.max(200, W * 0.48))), h = Math.round(Math.min(140, Math.max(90, H * 0.32)));
        burst = {
          id: best.P.id, t: 0, w, h, seed: (Math.random() * 1e9) | 0, lines: BURST_LINES[best.P.id] || BURST_LINES._,
          x: Math.round(Math.max(4, Math.min(W - w - 4, best.sx - w / 2))),
          y: Math.round(Math.max(4, Math.min(H - h - 4, best.sy - best.P.ry - h))),
        };
        lastBurst = frame;
      }
    }
    if (burst && ++burst.t >= IN + HOLD + OUT) burst = null;
  },

  // камера кадра поверхности (дом и изнанка её не ставят — там машины не видно)
  setView(camX, camY) { cam = { x: camX, y: camY }; },

  // ── поверх отпечатанного кадра, до лоу-фая и интерфейса (точки экрана) ──
  composite(ctx, main, blind = false) {
    const v = cam;
    cam = null;
    if (!v || !main || blind || !sources) return;
    const s = scaler.scale, vw = main.width / s, vh = main.height / s;
    const seen = [];
    for (const l of sources) {
      const P = wornOf(l);
      if (P && P.cx + P.rx > v.x && P.cx - P.rx < v.x + vw && P.cy + P.ry > v.y && P.cy - P.ry < v.y + vh) seen.push(P);
    }
    if (!seen.length && !burst) return;
    const B = backstage(main.width, main.height);
    if (!B) return;
    const reduced = reducedNow();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    // протёртое: сила — от яда у ног, ступенями (маски в запасе)
    for (const P of seen) {
      const lv = Math.round((0.4 + 0.6 * tox) * P.f * 8) / 8;
      const m = maskCanvas(`${P.id}:${lv}`, P.rx * 2, P.ry * 2, wornMask(P, lv));
      if (!m) continue;
      const breath = reduced ? 0.7 : 0.62 + 0.22 * Math.sin(frame * Math.PI / 240 + (P.seed % 628) / 100);
      throughMask(ctx, B, (P.cx - P.rx - v.x) * s, (P.cy - P.ry - v.y) * s, P.rx * 2 * s, P.ry * 2 * s, m, breath);
    }
    // прорыв: рамка в экране, машина допечатывает строку
    if (burst) {
      const U = burst, lv = burstLevel(U.t);
      const m = lv > 0 && maskCanvas(`burst:${U.seed}:${lv}`, U.w, U.h, burstMask(U.w, U.h, lv, U.seed));
      if (m) {
        const x = U.x * s, y = U.y * s, w = U.w * s, h = U.h * s, fs = B.L.fs / B.sc, lh = B.L.lh / B.sc;
        const T = typedAt(U.lines, U.t - IN), n = T.lines.length;
        throughMask(ctx, B, x, y, w, h, m, 0.92, g => {
          if (!n) return;
          const ty = y + h / 2 - (n * lh) / 2, tx = x + w * 0.16;
          g.fillStyle = BACK_COLORS.BG; g.fillRect(x, ty - lh * 0.4, w, (n + 0.8) * lh);
          g.font = `${fs}px ${MONO}`; g.textAlign = 'left'; g.textBaseline = 'top';
          g.shadowColor = 'rgba(140,198,63,0.5)'; g.shadowBlur = fs * 0.35;
          T.lines.forEach((L, i) => {
            g.fillStyle = L.cmd ? BACK_COLORS.HOT : BACK_COLORS.TXT;
            g.fillText(L.s, tx, ty + i * lh);
            if (i === T.cursor && (frame >> 5) % 2 === 0) g.fillRect(tx + g.measureText(L.s).width, ty + i * lh + fs * 0.1, fs * 0.6, fs * 0.95);
          });
          g.shadowBlur = 0;
        });
      }
    }
    ctx.restore();
  },
};
