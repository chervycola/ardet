// ═══════════════════════════════════════
// ЗА КОЛЬЦОМ — ритуалы пустыни брейнрота (канон CONTENT_POOL «ИЗНАНКА — ритуалы
// тоннелей», 8 и 9: «за кольцом»). Север за огнём — плоская серая равнина, и
// никого; песок здесь — крошка изображений, стёршихся от рассеянного смотрения:
// обрывки чужих лент, битые пиксели, смех без ртов.
//  · Позёмка растра: крошка метёт по земле по ветру (за краем дует всегда),
//    прядями; мерцает и бормочет на границе слуха — не слова, а обломки слов, гуще
//    любого тоннельного шёпота. Замер — странник садится и смотрит на одну
//    песчинку; растр вокруг неё расступается и за минуту собирается обратно в одну
//    старую картинку, чью-то, не свою; держится, пока держится взгляд. Кадр нельзя
//    унести, можно только досмотреть: досмотренный до конца рассыпается тихо,
//    недосмотренный — со вздохом.
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { TOWN, RINGS, RING_W, FIRE_W, EDGE_BAND, warpedDist } from './disc.js';
import { wind } from './wind.js';

const OUTER = RINGS * RING_W + FIRE_W;                 // где кончается огонь

// глубина в северной пустыне 0..1; не север или не за огнём — -1
export function northDepth(x, y) {
  const d = warpedDist(x, y);
  if (d <= OUTER) return -1;
  const dn = TOWN.y0 - y, ds = y - TOWN.y1, dw = TOWN.x0 - x, de = x - TOWN.x1;
  if (dn < Math.max(ds, dw, de)) return -1;
  return Math.min(1, (d - OUTER) / (EDGE_BAND - 80));
}

// ── старые картинки: чьи-то, не свои. Тона — как у выцветшего снимка: 1 — тень,
//    2 — сепия, 3 — свет, 4 — блик; 0 — фон снимка (стена, небо). По краю — белое
//    поле фотобумаги. Первая — канон («кухня, клеёнка, чей-то локоть»), остальные — нов. ──
export const PIC_W = 36, PIC_H = 27;
const ell = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
const seg = (x, y, ax, ay, bx, by, w) => {                    // близко к отрезку
  const vx = bx - ax, vy = by - ay, u = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(x - ax - u * vx, y - ay - u * vy) <= w;
};
export const PICS = [
  { name: 'кухня, клеёнка, чей-то локоть', at(x, y) {          // канон
    if (ell(x, y, 30, 19, 7.5, 4.6) <= 1) return ell(x, y, 30, 19, 6.2, 3.4) <= 1 ? (x < 27 && y < 18 ? 3 : 2) : 1;   // локоть в рукаве — с края кадра
    if (ell(x, y, 30, 24, 8, 1.6) <= 1) return 1;                                     // тень от локтя на клеёнке
    if (x >= 9 && x <= 13 && y >= 9 && y <= 15) {             // кружка на клеёнке
      if (y === 9) return x === 9 || x === 13 ? 1 : 2;
      return x === 9 || x === 13 || y === 15 ? 1 : x === 10 ? 4 : 3;
    }
    if (x === 14 && y >= 11 && y <= 13) return 1;             // ручка
    if (x >= 2 && x <= 12 && y >= 1 && y <= 8) {              // окно: рама, крестовина, свет
      if (x === 2 || x === 12 || y === 1 || y === 8 || x === 7 || y === 4) return 1;
      return (x + y) % 3 ? 4 : 3;
    }
    if (y < 10) return 0;
    if (y === 10) return 1;                                   // дальний край стола
    const s = 2 + Math.floor((y - 10) / 5), cx = Math.floor((x + (y - 10) * 0.3) / s), cy = Math.floor((y - 10) / s);
    return (cx + cy) % 2 ? 3 : 4;                             // клеёнка в клетку — к нам клетка крупнее
  } },
  { name: 'двор, качели, чья-то тень', at(x, y) {              // нов.
    if (seg(x, y, 2, 26, 13, 21, 1.1) || ell(x, y, 14, 20.5, 1.6, 1.2) <= 1) return 1;   // длинная тень человека
    if (seg(x, y, 6, 19, 9, 3, 0.6) || seg(x, y, 12, 19, 9, 3, 0.6) || seg(x, y, 24, 19, 27, 3, 0.6) || seg(x, y, 30, 19, 27, 3, 0.6)) return 1;   // стойки
    if (y === 3 && x >= 9 && x <= 27) return 1;               // перекладина
    if ((x === 16 || x === 21) && y > 3 && y < 14) return 2;  // цепи
    if (y >= 14 && y <= 15 && x >= 15 && x <= 22) return y === 14 ? 2 : 1;   // сиденье
    if (y >= 19) return (x * 7 + y * 3) % 5 ? 4 : 3;          // утоптанная земля
    return 0;
  } },
  { name: 'подоконник, герань, чьи-то очки', at(x, y) {        // нов.
    if (ell(x, y, 22, 17, 2.6, 1.6) <= 1 && ell(x, y, 22, 17, 1.4, 0.7) > 1) return 1;   // очки
    if (ell(x, y, 28, 17, 2.6, 1.6) <= 1 && ell(x, y, 28, 17, 1.4, 0.7) > 1) return 1;
    if (y === 16 && x === 25) return 1;
    if ((x === 6 && y === 6) || (x === 8 && y === 4) || (x === 10 && y === 5) || (x === 7 && y === 3)) return 4;   // цветы
    if (ell(x, y, 8, 8, 4.5, 4) <= 1) return (x + y) % 3 ? 2 : 1;   // листья
    if (x >= 5 && x <= 11 && y >= 12 && y <= 17) return y === 12 ? 3 : x === 5 || x === 11 ? 1 : 2;   // горшок
    if (y >= 18 && y <= 20) return y === 18 ? 3 : 2;          // подоконник
    if (y === 21) return 1;
    if (y <= 17 && x >= 14 && x <= 34) {                       // окно за горшком
      if (x === 14 || x === 34 || y === 0 || x === 24 || y === 8) return 1;
      return (x + y) % 4 ? 4 : 3;                             // свет за стеклом
    }
    return 0;
  } },
];
const PIX = PICS.map(P => {
  const out = [];
  for (let y = 0; y < PIC_H; y++) for (let x = 0; x < PIC_W; x++) {
    const edge = x === 0 || y === 0 || x === PIC_W - 1 || y === PIC_H - 1;
    out.push([x, y, edge ? 5 : P.at(x, y) || 6]);                   // поле бумаги; фон снимка
  }
  return out;
});
export const picPixels = k => PIX[k];

function hh(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export const PIC_LINE = 'Изображение восстановлено частично. Полностью не бывает.';
export const STILL0 = 60, GRAIN = 120, BUILD = 3600, HOLD = 600;    // встал; выбрал песчинку; минута; досмотреть
const MISS = 0.13;                                                   // столько крошки не возвращается никогда

// ── состояние ──
export const beyond = {
  depth: -1,             // глубина в северной пустыне (-1 — не здесь)
  still: 0,              // стоит неподвижно, шагов
  pic: null,             // кадр: { x, y, k, t, px: [...], gone: { kind, t } | null }
  picN: 0,               // какую картинку соберёт следующей
  murmur: 0,             // бормотание на этом шаге (громкость; 0 — тихо)
  sighSnd: false,        // недосмотренный рассыпался — вздох
  seated: false,         // странник сел смотреть («садится, выбирает песчинку»)
  hK: 0,                 // видимость горизонта 0..1 (ритуал «Столб утерянного горизонта»)
  say: null,             // строка мира — main покажет бумажкой
  // paused — меню, осмотр, разговор: взгляд не на песке, кадр ждёт как есть
  step(fx, fy, moving, paused = false) {
    const dep = northDepth(fx, fy), here = dep > 0.03 && dep < 0.92;
    this.depth = dep;
    this.sighSnd = false;
    // позёмка бормочет: обломки слов, гуще к краю; горизонт виден — молчит
    this.murmur = here && Math.random() < 0.22 ? (0.35 + 0.65 * dep) * (1 - this.hK) : 0;
    if (paused) return;
    this.still = moving ? 0 : this.still + 1;                      // неподвижный взгляд на одну песчинку
    this.look(here, moving, fx, fy);
    const Q = this.pic;
    // странник сидит, пока смотрит: от выбранной песчинки до тихого конца и отдыха после
    this.seated = here && !moving && (Q ? !Q.gone || Q.gone.kind === 'quiet' : this.still < 0);
  },
  look(here, moving, fx, fy) {
    const P = this.pic;
    if (P && P.gone) { if (--P.gone.t <= 0) this.pic = null; return; }
    if (P) {
      if (moving || !here) {                                         // шагнул: недосмотренный — со вздохом
        if (P.t > GRAIN) this.scatter('sigh'); else this.pic = null;
        return;
      }
      if (++P.t >= GRAIN + BUILD + HOLD) { this.scatter('quiet'); this.say = PIC_LINE; this.still = -300; }   // досмотрел
      return;
    }
    if (here && this.still >= STILL0) this.pic = makePic(Math.round(fx + 30), Math.round(fy + 3), this.picN++ % PICS.length);   // песчинка — сбоку, у ног
  },
  scatter(kind) {
    const P = this.pic;
    if (!P || P.gone) return;
    P.gone = { kind, t: kind === 'quiet' ? 150 : 70, t0: kind === 'quiet' ? 150 : 70 };
    if (kind === 'sigh') this.sighSnd = true;
  },
  reset() { this.pic = null; this.still = 0; this.murmur = 0; this.sighSnd = false; this.seated = false; this.say = null; this.depth = -1; },
};
// кадр у ног: песчинка — в середине; крошка прилетает по ветру, с наветренной стороны
function makePic(x, y, k) {
  const seed = (x * 31 + y * 17 + k * 7) | 0, [ux, uy] = drift();
  const px = PIX[k].map(([tx, ty, c], i) => {
    const r = 26 + hh(i, 1, seed) * 52, sj = (hh(i, 2, seed) - 0.5) * 30;
    return { tx, ty, c, d: hh(i, 3, seed) * 0.72, sx: tx - ux * r - uy * sj, sy: ty - uy * r + ux * sj, miss: hh(i, 4, seed) < MISS };
  });
  return { x, y, k, t: 0, px, gone: null, ox: x - (PIC_W >> 1), oy: y - (PIC_H >> 1) };
}
// сколько кадра собрано 0..1
export const picProgress = P => (P ? Math.max(0, Math.min(1, (P.t - GRAIN) / BUILD)) : 0);
// окно в растре распада (точки кадра): сперва вокруг песчинки, потом — по кадру, пока
// он собирается; рассыпается кадр — окно затягивается
export function clearings(camX, camY) {
  const P = beyond.pic;
  if (!P) return [];
  const r = Math.min(3, P.t / 12), e0 = picProgress(P), e = e0 * e0 * (3 - 2 * e0), G = P.gone, gk = G ? G.t / G.t0 : 1;
  const x0 = P.x - r + (P.ox - 1 - P.x + r) * e, y0 = P.y - r + (P.oy - 1 - P.y + r) * e;
  const w = (2 * r + 1) + (PIC_W + 2 - 2 * r - 1) * e, h = (2 * r + 1) + (PIC_H + 2 - 2 * r - 1) * e;
  if (w * gk < 1) return [];
  const cx = x0 + w / 2, cy = y0 + h / 2;
  return [{ x: Math.round(cx - w * gk / 2 - camX), y: Math.round(cy - h * gk / 2 - camY), w: Math.round(w * gk), h: Math.round(h * gk) }];
}

// ── рисунок (контекст мира уже сдвинут камерой) ──
// Земля за огнём — костяная бумага в штрихе: крошка на ней — тушь. Светлое тут не видно.
const TONE = ['', '#241c14', '#3a2818', '#b0a284', '#D9CFB8', '#c8b89a', '#6b4a2c'];   // …, поле бумаги, фон — сепия
const INK = ['#2a2620', '#34302a', '#3a3328'], AS = '#8A8D8F', K1 = '#241c14';
const grains = [];                                                 // крошка позёмки — по кадру
const LANE = 18;                                                   // позёмка идёт прядями: пряди поперёк ветра — через столько
const laneOn = m => hh(m, Math.floor(t / 300), 11) < 0.4;          // какие пряди метут сейчас (меняются раз в пять секунд)
// куда метёт: ветер у земли, по вертикали кадра — сжат, как всё на равнине
function drift() { const a = wind.ang || 0, x = Math.cos(a), y = Math.sin(a) * 0.6, l = Math.hypot(x, y) || 1; return [x / l, y / l, l]; }
// крошка встаёт в ближнюю живую прядь; живых рядом нет — метёт одна
function toLane(g, [ux, uy]) {
  const w = g.x * -uy + g.y * ux, m0 = Math.round(w / LANE);
  for (const d of [0, 1, -1, 2, -2]) if (laneOn(m0 + d)) {
    const dw = (m0 + d) * LANE + (Math.random() - 0.5) * 4 - w;
    g.x -= uy * dw; g.y += ux * dw; g.m = m0 + d; return;
  }
  g.m = null;
}
// шаг позёмки: крошка метёт по ветру, гуще к краю; горизонт виден — ложится
export function stepPozemka(camX, camY, vw, vh) {
  const dep = Math.max(northDepth(camX + vw / 2, camY + vh / 2), northDepth(camX + vw / 2, camY + vh));
  const want = dep > 0 ? Math.round(110 + 260 * dep) : 0;
  const D = drift(), [ux, uy, l] = D, calm = 1 - beyond.hK, sp = (0.5 + (wind.s || 0)) * calm * l;
  while (grains.length > want) grains.pop();
  while (grains.length < want) { const g = { x: camX + Math.random() * vw, y: camY + Math.random() * vh, v: 0.8 + Math.random() * 1.3, ph: Math.random() * 6.28, m: null }; toLane(g, D); grains.push(g); }
  for (const g of grains) {
    g.x += ux * g.v * sp + Math.sin(t * 0.05 + g.ph) * 0.15 * calm;
    g.y += uy * g.v * sp + Math.cos(t * 0.04 + g.ph) * 0.1 * calm;
    // вылетела из кадра — заходит с наветренной стороны, в прядь; кадр прыгнул — крошка уже по всему кадру
    const far = g.x < camX - 64 || g.x > camX + vw + 64 || g.y < camY - 64 || g.y > camY + vh + 64;
    if (far) { g.x = camX + Math.random() * vw; g.y = camY + Math.random() * vh; toLane(g, D); }
    else if (g.x < camX - 8 || g.x > camX + vw + 8 || g.y < camY - 8 || g.y > camY + vh + 8) {
      const side = Math.abs(ux) * vh / (Math.abs(ux) * vh + Math.abs(uy) * vw + 1e-6);   // с какой кромки сколько заходит
      if (Math.random() < side) { g.x = ux > 0 ? camX - 6 : camX + vw + 6; g.y = camY + Math.random() * vh; }
      else { g.y = uy > 0 ? camY - 6 : camY + vh + 6; g.x = camX + Math.random() * vw; }
      toLane(g, D);
    }
  }
}
export function drawBeyondWorld(ctx, camX, camY, vw, vh) {
  if (!grains.length && !beyond.pic) return;
  const calm = 1 - beyond.hK;
  // позёмка: крошка метёт по ветру штрихами туши; мерцает; среди неё — битые пиксели;
  // горизонт виден — легла: ни хвостов, бледная
  const [wx, wy] = drift();
  for (let i = 0; i < grains.length; i++) {
    const g = grains[i], fl = hh(i, (t >> 2) & 1023, 7);
    if (northDepth(g.x, g.y) <= 0) continue;
    const a = (0.4 + 0.45 * fl) * (0.35 + 0.65 * calm);
    const wv = g.m === null ? 0 : Math.sin((g.x * wx + g.y * wy) * 0.045 + g.m * 1.7) * 3 * calm;   // прядь вьётся
    const gx = g.x - wy * wv, gy = g.y + wx * wv, x = Math.round(gx), y = Math.round(gy);
    if (i % 6 === 0) {                                               // битый пиксель: чёрный квадратик, моргает
      if (fl < 0.3) continue;
      ctx.globalAlpha = Math.min(1, a * 1.15); ctx.fillStyle = K1; ctx.fillRect(x, y, 2, 2);
      continue;
    }
    const ink = INK[i % 3];
    ctx.fillStyle = ink; ctx.globalAlpha = a;
    if (i % 6 === 3) ctx.fillRect(x, y, 2, 1);                       // обрывок строки растра
    else ctx.fillRect(x, y, 1, 1);
    const n = 2 + (i % 4);
    for (let k = 1; k <= n * calm; k++) {                            // хвост по ветру: тушь, к концу — пепел
      ctx.globalAlpha = a * 0.85 * (1 - k / (n + 1)); ctx.fillStyle = k < 3 ? ink : AS;
      ctx.fillRect(Math.round(gx - wx * k * 1.8), Math.round(gy - wy * k * 1.8), 1, 1);
    }
  }
  ctx.globalAlpha = 1;
  const P = beyond.pic;
  if (!P) return;
  // песчинка, на которую смотришь: стоит, пока всё метёт мимо, и моргает
  // (растр вокруг неё расступается — clearings, слой распада)
  if (!P.gone && P.t < GRAIN + 60) {
    const f = 0.5 + 0.5 * Math.sin(t * 0.25);
    ctx.globalAlpha = 0.25 * f; ctx.fillStyle = AS; ctx.fillRect(P.x - 1, P.y, 3, 1); ctx.fillRect(P.x, P.y - 1, 1, 3);
    ctx.globalAlpha = 0.6 + 0.4 * f; ctx.fillStyle = K1; ctx.fillRect(P.x, P.y, 1, 1);
    ctx.globalAlpha = 1;
  }
  // кадр: крошка возвращается на места; часть не вернётся никогда
  const p = picProgress(P), G = P.gone, gk = G ? G.t / G.t0 : 1, [ux, uy] = drift();
  for (let i = 0; i < P.px.length; i++) {
    const q = P.px[i];
    let f = Math.max(0, Math.min(1, (p - q.d) / 0.26));
    if (q.miss) f = Math.min(f, 0.55);                                 // эти так и метут мимо
    if (f <= 0) continue;                                              // ещё не прилетели — и не прилетят
    const e = f * f * (3 - 2 * f);
    let x = q.sx + (q.tx - q.sx) * e, y = q.sy + (q.ty - q.sy) * e;
    if (q.miss) { x += Math.sin(t * 0.07 + i) * 3; y += Math.cos(t * 0.05 + i) * 2; }
    let al = q.miss ? 0.25 * f : 0.25 + 0.7 * e;
    if (G) {                                                           // рассыпается: тихо — тает на месте; со вздохом — сдувает
      if (G.kind === 'sigh') { const s = 1 - gk; x += ux * s * (30 + i % 23); y += uy * s * (18 + i % 11) - s * 4; }
      al *= gk;
    }
    if (al <= 0.02) continue;
    ctx.globalAlpha = al; ctx.fillStyle = TONE[q.c];
    ctx.fillRect(Math.round(P.ox + x), Math.round(P.oy + y), 1, 1);
  }
  ctx.globalAlpha = 1;
}
export const _grains = () => grains;
export function _resetBeyond() { beyond.reset(); beyond.picN = 0; beyond.hK = 0; grains.length = 0; }
