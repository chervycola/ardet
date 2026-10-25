// ═══════════════════════════════════════
// WALL INSCRIPTIONS — hidden texts revealed by proximity
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { X } from '../render/context.js';
import { scaler } from '../render/scaler.js';

const P = {
  bone: '#e8dcc8',
  crimson: '#6b0f1a',
  damber: '#a07818',
  toxic: '#3aff1a',
};

export const hiddenInscriptions = {
  graffiti: ['мох помнит', 'поколения сходятся', 'стены читают тебя', 'ты уже субстрат', 'архивариус это ты', '.dna → мох'],
  church: ['LASCIATE OGNI SPERANZA', 'вобла не горит (проверено)', 'бога нет. мха — да', 'iä не пишется через у', 'запись #99 в каталоге'],
  crypt: ['девять ярусов. ниже нет.', 'лёд тает', 'предатели всплывают', 'первый круг — ты', 'второй круг — тоже ты'],
  library: ['полка 3.14', 'книга другого цвета', '14 млн единиц — было', 'короткое замыкание', 'тушили водой', 'мох читает с тобой'],
  ruins: ['жильцы съехали раньше пожара', 'счётчик остановился в среду', 'ключ под ковриком ждёт', 'окна помнят свет внутри', 'дом горит изнутри тише'],
  fountain: ['ПОМНИ', 'рьё ушёл первым', 'крысы умнее', 'ангел без головы', 'голова в чаше'],
  altar: ['мох помнит', 'мох всегда помнил', 'ты помнишь с ним', 'подпись оформлена', 'до твоего рождения', 'продолжай'],
};

// перенос пасхального фонда — строки добавляются к своим локациям
import { EGG_INSCRIPTIONS } from '../content/eggs_transfer.js';
for (const [loc, lines] of Object.entries(EGG_INSCRIPTIONS)) {
  (hiddenInscriptions[loc] = hiddenInscriptions[loc] || []).push(...lines);
}

const wallProx = {};
// локации по id — один раз (надписей на постройках эпох сотня)
let byId = null;
const locOf = (locations, id) => {
  if (!byId || byId.size !== locations.length) byId = new Map(locations.map(l => [l.id, l]));
  return byId.get(id);
};

export function updateProximity(player, locations) {
  for (const locId of Object.keys(hiddenInscriptions)) {
    const l = locOf(locations, locId);
    if (!l) continue;
    const dx = player.x - (l.x + l.w / 2);
    const dy = player.y - (l.y + l.h / 2);
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 60 && !player.moving) {
      wallProx[locId] = (wallProx[locId] || 0) + 1;
    }
  }
}

// сколько строк уже проступило у стены (постоял — проступают по одной)
const revealedOf = (locId, n) => { const prox = wallProx[locId] || 0; return prox < 60 ? 0 : Math.min(n, Math.floor((prox - 60) / 180) + 1); };
// проступившие строки — для осмотра постройки (world/potemkin.js lookText): на стене штрихи, прочесть — там
export function wallLines(locId) {
  const lines = hiddenInscriptions[locId];
  return lines ? lines.slice(0, revealedOf(locId, lines.length)) : [];
}

// штрихи вместо букв (слово автора 25.10): на фасаде — рука, а не шрифт; по знаку на букву,
// пробел — просвет; каждая надпись всегда одними и теми же штрихами
function scribble(ctx, text, x, y, seed, maxW) {
  let px = 0;
  for (let k = 0; k < text.length && px < maxW; k++) {
    if (text[k] === ' ') { px += 3; continue; }
    let h = (seed * 131 + k * 977 + text.charCodeAt(k) * 61) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h = (h ^ (h >>> 16)) >>> 0;
    ctx.fillRect(x + px, y - 3 + (h & 1), 1, 3 - (h & 1));                 // стойка
    if (h & 2) ctx.fillRect(x + px + 1, y - 2 + ((h >> 2) & 1), 1, 1);       // перекладина
    if ((h & 24) === 24) ctx.fillRect(x + px, y - 4, 2, 1);                  // надстрочный росчерк
    px += 2 + ((h >> 5) & 1);
  }
}

// ширина строки штрихами — та же, что у scribble (пробел 3, знак 2–3 точки)
function strokeW(text, seed) {
  let px = 0;
  for (let k = 0; k < text.length; k++) {
    if (text[k] === ' ') { px += 3; continue; }
    let h = (seed * 131 + k * 977 + text.charCodeAt(k) * 61) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h = (h ^ (h >>> 16)) >>> 0;
    px += 2 + ((h >> 5) & 1);
  }
  return px;
}

// Стена — по рисунку, а не по рамке: рисунок постройки прогоняется вхолостую (запись fillRect,
// без холста) в карту «светлое / тёмное / почти чёрное / пусто» в координатах рамки; строка ищет
// сперва светлую стену, у тёмных построек — тёмную, и только потом почти чёрную (там и проёмы).
// Карта — одна на вид и размер.
const MASKS = new Map();
function lum(c) {
  if (typeof c !== 'string') return 128;
  let m = c.match(/^#([0-9a-f]{6})$/i);
  if (m) { const n = parseInt(m[1], 16); return ((n >> 16 & 255) + (n >> 8 & 255) + (n & 255)) / 3; }
  if ((m = c.match(/^#([0-9a-f]{3})$/i))) return [...m[1]].reduce((a, h) => a + parseInt(h + h, 16), 0) / 3;
  if ((m = c.match(/^rgba?\(([^)]+)\)/))) { const v = m[1].split(',').map(Number); return (v[0] + v[1] + v[2]) / 3; }
  return 128;
}
function wallMask(l) {
  const key = l.archDraw;
  let byDim = MASKS.get(key);
  if (!byDim) MASKS.set(key, byDim = new Map());
  const dk = l.w + 'x' + l.h;
  if (byDim.has(dk)) return byDim.get(dk);
  const W = l.w, H = l.h, M = new Int8Array(W * H).fill(-1);       // -1 пусто, 0 почти чёрное, 1 тёмное, 2 светлое
  const st = { fillStyle: '#000', globalAlpha: 1 };
  let tx = 0, ty = 0;
  const stack = [];
  const ctx = new Proxy(st, {
    get(o, k) {
      if (k in o) return o[k];
      if (k === 'fillRect') return (x, y, w, h) => {
        if (o.globalAlpha < 0.5) return;
        const L = lum(o.fillStyle), v = L > 40 ? 2 : L > 18 ? 1 : 0;
        const x0 = Math.max(0, Math.round(x + tx - l.x)), y0 = Math.max(0, Math.round(y + ty - l.y));
        const x1 = Math.min(W, Math.round(x + w + tx - l.x)), y1 = Math.min(H, Math.round(y + h + ty - l.y));
        for (let j = y0; j < y1; j++) for (let i = x0; i < x1; i++) M[j * W + i] = v;
      };
      if (k === 'translate') return (a, b) => { tx += a; ty += b; };
      if (k === 'save') return () => stack.push([tx, ty, o.globalAlpha, o.fillStyle]);
      if (k === 'restore') return () => { const v = stack.pop(); if (v) [tx, ty, o.globalAlpha, o.fillStyle] = v; };
      if (k === 'setTransform') return (a, b, c, d, e, f) => { tx = e || 0; ty = f || 0; };
      if (k === 'measureText') return () => ({ width: 0 });
      if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (k === 'getImageData') return (a, b, w, h) => ({ data: new Uint8ClampedArray(Math.max(0, w * h * 4)) });
      if (k === 'canvas') return { width: 0, height: 0 };
      return () => {};
    },
    set(o, k, v) { o[k] = v; return true; },
  });
  try { l.archDraw(ctx, l.archX, l.archGy, 0); } catch (e) { /* без карты — по рамке */ }
  byDim.set(dk, M);
  return M;
}

// места строк постройки: строка (четыре ряда штрихов) ложится на самый длинный отрезок, где из
// четырёх рядов хотя бы три — стена (светлая, если есть), — ниже и шире лучше, верхняя треть —
// только если ниже негде (арки, решётки); строки не налезают друг на друга. Нет такого отрезка — нижняя треть рамки, как прежде.
const PLACES = new Map();
function placeLines(l, lines) {
  const W = l.w, H = l.h, M = wallMask(l), out = [], used = new Uint8Array(H);
  for (let i = 0; i < lines.length; i++) {
    const need = strokeW(lines[i], i + l.id.length * 7);
    let best = null;
    for (const lo of [2, 1, 0]) {                                  // светлая стена, тёмное тело, хоть что-то, но не воздух
      const ok = (x, b) => { let n = 0; for (let j = b; j < b + 4; j++) if (M[j * W + x] >= lo) n++; return n >= 3; };
      if (best && best.take >= Math.min(need, 24)) break;
    for (let b = H - 5; b >= 0; b--) {
      let clash = false;
      for (let j = b - 1; j < b + 5; j++) if (j >= 0 && j < H && used[j]) clash = true;
      if (clash) continue;
      for (let x = 0; x < W;) {
        if (!ok(x, b)) { x++; continue; }
        let e = x;
        while (e < W && ok(e, b)) e++;
        const L = e - x, take = Math.min(L, need);
        if (L >= 10) {
          const score = take + (take >= need ? 20 : 0) + 6 * b / H - (b < H * 0.3 ? 12 : 0);   // верх — только если ниже негде
          if (!best || score > best.score) best = { score, x0: x + ((L - take) >> 1), b, take };
        }
        x = e;
      }
    }
    }
    if (best) {
      for (let j = best.b - 1; j < best.b + 5; j++) if (j >= 0 && j < H) used[j] = 1;
      out.push({ lx: l.x + best.x0, ly: l.y + best.b + 4, mw: Math.max(12, best.take) });
    } else {
      out.push({ lx: l.x + 3 + (i % 2) * Math.max(0, W - 60), ly: l.y + Math.round(H * 0.62) + i * 6, mw: Math.max(12, W - 8) });
    }
  }
  return out;
}
export function wallPlace(l, i) {
  let p = PLACES.get(l.id);
  if (!p || p.draw !== l.archDraw) PLACES.set(l.id, p = { draw: l.archDraw, at: placeLines(l, hiddenInscriptions[l.id] || []) });
  return p.at[i] || p.at[p.at.length - 1];
}
export const _scribble = scribble, _wallMask = wallMask;

export function draw(camera, locations) {
  const ctx = X;
  for (const locId of Object.keys(hiddenInscriptions)) {
    const prox = wallProx[locId] || 0;
    if (prox < 60) continue;
    const l = locOf(locations, locId);
    if (!l) continue;
    const sx = l.x - camera.x;
    const sy = l.y - camera.y;
    if (sx < -100 || sx > scaler.vw + 100 || sy < -60 || sy > scaler.vh + 60) continue;

    const lines = hiddenInscriptions[locId];
    const revealed = revealedOf(locId, lines.length);

    ctx.font = '5px "Press Start 2P","VT323",monospace';         // для надписей над местами городка
    for (let i = 0; i < revealed; i++) {
      const lineAge = prox - 60 - i * 180;
      const alpha = Math.min(0.5, lineAge / 120) * 0.9;
      const flick = 0.85 + 0.15 * Math.sin(t * 0.01 + i * 2);
      ctx.globalAlpha = alpha * flick;
      ctx.fillStyle = locId === 'altar' ? P.toxic :
                      (locId === 'graffiti' ? P.crimson :
                       (locId === 'church' ? P.damber : P.bone));
      // на постройке эпохи — по стене, в нижней трети, строка под строкой
      if (l.archDraw) {
        const w = wallPlace(l, i);
        scribble(ctx, lines[i], w.lx, w.ly, i + locId.length * 7, w.mw);
      } else ctx.fillText(lines[i], l.x + 4 + (i % 2) * (l.w - 50), l.y - 8 + Math.floor(i / 2) * 7);
      ctx.globalAlpha = 1;
    }
  }
}
