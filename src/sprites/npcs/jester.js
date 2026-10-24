// ═══════════════════════════════════════
// ШУТ — по осмотру и ART_BIBLE §05. «Шут стоит у костра и пошатывается,
// сдвигая центр тяжести. Если смотреть долго — замечаешь редкое моргание.
// В одной руке — кинжал. В другой держит пику, на которой подпекается над
// костром человеческий скальп. Лицо белое, губы красные. Улыбка — не
// результат, а форма.» По библии: колпак с тремя рогами, ромбы арлекина,
// хвост с лезвием, горящий нимб, крест в глазнице, игральные карты-надгробия.
// Багрянец на чёрном: киноварь и ночь, кость; тепло — только язычки нимба.
// По слову автора жонглирует: три вещи каскадом из руки в руку, оружие разное —
// кинжал, топорик, серп, булава, тесак; каждая вертится в полёте, раз в
// несколько кругов одна меняется на другую. Руки — естественными движениями
// (слово автора, 23.10): кисть ловит снаружи, подхватывает ковшом, бросает у
// середины; локти у тела. Пика с лицом воткнута в землю у
// костра (рисуется с костром, sprites/locations/canon.js). На ходу
// (world/wandering.js) жонглирует так же.
// Рисунок — пиксельными картами, как костёр (слово автора 24.10: «в таком же
// качестве»): голова в капюшоне накрест, рога с бубенцами, ворот лепестками,
// камзол ромбами рядами, баска зубцами, трико и башмаки накрест. Свет слева,
// кромка серым справа; неподвижные карты запекаются, живое — поверх.
// ═══════════════════════════════════════
import { t } from '../../core/time.js';
import { X, setCtx } from '../../render/context.js';

const NI = '#0D0B0A', BO = '#D9CFB8', AS = '#8A8D8F', SV = '#E28A3A', KV = '#C23B2B';
const K0 = '#15100c', K1 = '#241c14', K3 = '#34302a', K4 = '#3a3328';
const BR2 = '#3a2818', L1 = '#c8b89a', L2 = '#b0a284', S0 = '#474442', S1 = '#5e5e5d';
const KD = '#8a2a1f', BLOOD = '#6b0f1a';                                 // киноварь в тени, запёкшаяся
const q = Math.round;
const r = (x, y, w = 1, h = 1, c) => { X.fillStyle = c; X.fillRect(q(x), q(y), w, h); };
const line = (x0, y0, x1, y1, c) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let k = 0; k <= n; k++) r(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, 1, 1, c); };
function hh(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

let npcProximity = 0;
export function setProximity(v) { npcProximity = v; }

// ── пиксельные карты: буква — краска, точка — пусто. Карта запекается в свой холст
//    один раз (ключ — сам массив, поэтому карты — только константами), дальше блит;
//    нет холста (тесты) — рисуется по пикселю ──
const PAL = { n: NI, B: BO, L: L1, l: L2, r: KV, d: KD, b: BLOOD, k: K4, K: K3, h: K1, e: K0, P: AS, p: S1, s: SV };
const SPR = new Map();
function pixRaw(rows, ox, oy) {
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
    const ch = rows[y][x];
    if (ch !== '.') r(ox + x, oy + y, 1, 1, PAL[ch]);
  }
}
function pix(rows, ox, oy) {
  let c = SPR.get(rows);
  if (c === undefined) {
    c = typeof document !== 'undefined' && document.createElement ? document.createElement('canvas') : null;
    if (c && typeof c.getContext === 'function') {
      c.width = Math.max(...rows.map(w => w.length)); c.height = rows.length;
      const prev = X; setCtx(c.getContext('2d'));
      try { pixRaw(rows, 0, 0); } finally { setCtx(prev); }
    } else c = null;
    SPR.set(rows, c);
  }
  if (c) X.drawImage(c, q(ox), q(oy)); else pixRaw(rows, ox, oy);
}
// голова в колпаке: капюшон накрест — левая половина киноварь, правая ночь; поля
// тенью по лбу; лицо белое, к тени — L; в левой глазнице крест (латинский, длинной
// ногой), правый глаз — чёрный с красной искрой; улыбка — уголки высоко, щель рта,
// нижняя губа; подбородок клином
const HEAD = [
  '..rrrrnnn..',
  '.rrrrrnnnn.',
  'rrddddhhhnn',
  'rBBBBBBBLln',
  'rBereBeeLln',
  'rBrrrBerLln',
  'rBereBBBLln',
  'rBerelBBLln',
  'rBrBBBBBrln',
  'rBBreeerLln',
  '.rBBrrrBLn.',
  '..rBBBBLn..',
  '...eBBLe...',
];
const HEAD_BLINK = HEAD.map((row, y) => y === 4 ? 'rBereBBBLln' : y === 5 ? 'rBrrrBhhLln' : row);
// рога колпака: ряды [y, x0, x1] от верха капюшона; левый и правый — киноварь,
// средний — ночь; кончики свисают, на них бубенцы
const HORN_L = [[-1, 2, 3], [-2, 1, 2], [-3, 1, 2], [-4, 0, 1], [-5, -1, 0], [-6, -2, -1], [-7, -4, -2], [-8, -5, -4], [-7, -6, -6]];
const HORN_M = [[-1, 4, 6], [-2, 4, 5], [-3, 4, 5], [-4, 4, 5], [-5, 5, 5], [-6, 5, 5], [-7, 5, 5], [-8, 4, 5], [-9, 3, 4], [-8, 2, 2]];
const HORN_R = [[-1, 7, 8], [-2, 8, 9], [-3, 8, 9], [-4, 9, 10], [-5, 10, 11], [-6, 11, 12], [-7, 12, 14], [-8, 14, 15], [-7, 16, 16]];
const BELLS = [[-7, -6], [1, -7], [16, -6]];                             // [x, y] — верх бубенца под кончиком
// ворот: пять лепестков зубцами, кость и киноварь; к тени — L и тёмная киноварь
const COLLAR = [
  'BBBrrrBBBdddlll',
  '.BB.rr.BB.dd.ll',
  '..B..r..B..d..l',
];
// камзол: ромбы рядами — красный ряд по груди, чёрный ниже, под поясом снова красный
// (зубцы баски); к талии уже;
// свет слева, кромка пеплом справа; пояс с пряжкой
const DOUBLET = [
  '.knnnnrnnnnP.',
  '.rnnnrrrnnnP.',
  '.rrnrrrrrndP.',
  '.rrnrrrrrndP.',
  '..knnrrrnnP..',
  '..knnnrnnnP..',
  '..knnnrnnnP..',
  '..knnrrrnnP..',
  '..hhhhLhhhh..',
];
// баска: зубцы накрест, расходится колоколом
const PEPLUM = [
  '..rnnnrrrnnnd..',
  '.rrnnnrrrnnndP.',
  'rrrnnnrrrnnnddP',
  '.r..k..r..k..d.',
];
// башмаки с загнутыми носами и бубенцами: левый — киноварь (нога чёрная),
// правый — ночь (нога красная)
const BLADE = ['.B.', 'BBl', 'Blp', '.n.'];                            // лезвие хвоста листом, остриём вверх
const PUFF_L = ['rrr', 'rrd', '.dd'], PUFF_R = ['knn', 'nnP', '.nP'];   // буфы у плеч
const SHOE_L = [
  'Ll........',
  'Pr......rr',
  '.rr..rrrrr',
  '..drrrrrrd',
];
const SHOE_R = [
  '........Ll',
  'kn......nP',
  'nnnnn..nn.',
  'knnnnnnK..',
];
// нимб: кольцо киновари 23×22 вокруг головы — точки по эллипсу без повторов; само
// кольцо запекается картой, язычки и тёмный отрезок — поверх, каждый кадр
const HALO_R = 12, RING = [];
{
  const seen = new Set();
  for (let a = 0; a < 96; a++) {
    const u = a / 96 * Math.PI * 2, dx = q(Math.cos(u) * 11.5), dy = q(Math.sin(u) * 11), key = dx * 1000 + dy;
    if (!seen.has(key)) { seen.add(key); RING.push([dx, dy, u]); }
  }
}
const HALO = Array.from({ length: 2 * HALO_R + 1 }, (_, y) => Array.from({ length: 2 * HALO_R + 1 }, (_, x) =>
  RING.some(([dx, dy]) => dx === x - HALO_R && dy === y - HALO_R) ? 'r' : '.').join(''));
// карта-надгробие: рубашка тёмная кромкой, лицо костью, масть — киноварь или ночь;
// верх клонится (lean), низ в земле
function card(x, g, lean, pip) {
  for (let y = 0; y < 8; y++) {
    const dx = y < 3 ? lean : 0;
    r(x + dx, g - 8 + y, 5, 1, K1);
    if (y > 0 && y < 7) r(x + dx + 1, g - 8 + y, 3, 1, y === 1 ? BO : L1);
  }
  r(x + 1 + lean, g - 7, 1, 1, pip);                                     // индекс в углу
  r(x + 2, g - 5, 1, 2, pip); r(x + 1, g - 5, 1, 1, pip); r(x + 3, g - 5, 1, 1, pip);   // масть
  r(x - 1, g, 7, 1, K0); r(x, g - 1, 5, 1, K0);                            // земля у карты
}
// оружие по оси: k — вдоль (к острию, к бойку), p — поперёк; a — куда смотрит
const WEAPONS = {
  кинжал: [[-2, 0, L2], [-1, 0, K1], [0, 0, K1], [1, -1, L2], [1, 0, L2], [1, 1, L2], [2, 0, AS], [3, 0, AS], [4, 0, BO], [5, 0, BO]],
  топорик: [[-3, 0, BR2], [-2, 0, BR2], [-1, 0, BR2], [0, 0, BR2], [1, 0, BR2], [2, 0, K1], [2, -1, K1], [2, 1, AS], [3, 1, AS], [1, 2, AS], [2, 2, AS], [3, 2, BO], [1, 3, BO], [2, 3, BO], [3, 3, BO]],
  серп: [[-3, 0, BR2], [-2, 0, BR2], [-1, 0, K1], [0, 0, AS], [1, -1, AS], [2, -2, AS], [3, -2, BO], [4, -2, AS], [5, -1, BO], [5, 0, AS], [4, 1, BO]],
  булава: [[-3, 0, BR2], [-2, 0, BR2], [-1, 0, BR2], [0, 0, BR2], [1, 0, K1], [2, -1, K3], [2, 0, K4], [2, 1, K3], [3, -1, K4], [3, 0, S1], [3, 1, K4], [4, 0, K3], [2, -2, S1], [2, 2, S1], [4, -1, S1], [4, 1, S1], [5, 0, S1]],
  тесак: [[-2, 0, BR2], [-1, 0, BR2], [0, 0, K1], [1, -1, K1], [1, 0, AS], [1, 1, AS], [2, 0, AS], [2, 1, AS], [3, 0, AS], [3, 1, BO], [4, 0, AS], [4, 1, BO], [5, 1, BO]],
};
const KINDS = Object.keys(WEAPONS);
function weapon(kind, cx, cy, a) {
  const c = Math.cos(a), s = Math.sin(a);
  for (const [k, p, col] of WEAPONS[kind]) r(cx + k * c - p * s, cy + k * s + p * c, 1, 1, col);
}
// каскад: вещь летит FLY шагов (выше головы), в руке лежит HOLD; бросок каждые S шагов,
// руки по очереди — каждая бросает раз в 2S; вещь возвращается в ту же руку через 2(FLY+HOLD)
const FLY = 45, HOLD = 30, S = (FLY + HOLD) / 3, HIGH = 34;
// точки петли кисти от плеча: бросок — у пояса ближе к середине, ловля — снаружи и чуть
// выше, низ подхвата — между ними; dir — наружу (−1 левая, +1 правая)
const hand = (sh, dir) => ({ throwP: { x: sh.x + dir * 2, y: sh.y + 8 }, catchP: { x: sh.x + dir * 8, y: sh.y + 6 }, low: { x: sh.x + dir * 5, y: sh.y + 11 } });
// где кисть сейчас: пустая — от броска наружу и чуть вверх к ловле; с вещью — подхват
// вниз и к середине, к броску. off — сдвиг фазы (правая — на шаг броска позже)
function handAt(sh, dir, time, off, swing) {
  const P = hand(sh, dir), Hc = 2 * S, ph = ((time - off) % Hc + Hc) % Hc;
  let x, y;
  if (ph < Hc - HOLD) {                                                  // пустая: наружу, навстречу
    const u = ph / (Hc - HOLD);
    x = P.throwP.x + (P.catchP.x - P.throwP.x) * u; y = P.throwP.y + (P.catchP.y - P.throwP.y) * u - Math.sin(u * Math.PI) * 2;
  } else {                                                               // с вещью: подхват ковшом
    const v = (ph - (Hc - HOLD)) / HOLD, cx = 2 * P.low.x - (P.catchP.x + P.throwP.x) / 2, cy = 2 * P.low.y - (P.catchP.y + P.throwP.y) / 2;
    x = (1 - v) * (1 - v) * P.catchP.x + 2 * (1 - v) * v * cx + v * v * P.throwP.x;
    y = (1 - v) * (1 - v) * P.catchP.y + 2 * (1 - v) * v * cy + v * v * P.throwP.y;
  }
  return { x: q(x + swing), y: q(y) };
}
export function drawNPC_jester(jx, jy, opts = {}) {
  const home = opts.moving === undefined, moving = !!opts.moving;
  const x0 = q(jx), y0 = q(jy);
  // пошатывается: таз в одну сторону, плечи — в другую, голова запаздывает
  const sw = Math.sin(t * 0.0045), hip = moving ? 0 : q(sw), sh = moving ? 0 : -q(sw * 0.8), hd = moving ? 0 : q(Math.sin(t * 0.0045 - 0.8));
  const step = moving ? Math.sin(t * 0.18) : 0, bob = moving ? q(Math.abs(step) * 1.5) : 0;
  const cx = x0 + 12, by = y0 - bob, G = y0 + 46;
  const tc = cx + q((hip + sh) / 2);                                    // середина камзола
  const hx = cx - 5 + sh + hd, hy = by;                                  // голова: левый верх карты
  // ── у костра: карты-надгробия в земле ──
  if (home) { card(x0 - 7, G - 1, 1, KV); card(x0 + 25, G - 2, -1, NI); }
  X.globalAlpha = 0.3; r(cx - 8, G, 16, 1, NI); X.globalAlpha = 1;
  // ── горящий нимб — за головой, шире колпака: кольцо киновари; по верху язычки
  //    свечой лижут наружу и меняются медленно (не мигают); тёмный отрезок обходит кольцо ──
  const hcx = hx + 5, hcy = hy + 5, slow = t >> 4;
  pix(HALO, hcx - HALO_R, hcy - HALO_R);
  RING.forEach(([dx, dy, u], i) => {
    const px = hcx + dx, py = hcy + dy;
    if (i % 11 === slow % 11) r(px, py, 1, 1, BLOOD);
    if (Math.sin(u) < 0.25 && i % 3 === 0) {                             // язычок — наружу и чуть вверх
      const h = q(hh(i, slow, 7) * 2.6), ox = Math.cos(u) * 0.8, oy = Math.sin(u) * 0.8 - 0.5;
      for (let k = 1; k <= h; k++) r(px + ox * k, py + oy * k, 1, 1, k === h ? KV : SV);
      if (h >= 2) r(px, py, 1, 1, SV);
    }
  });
  // ── хвост с лезвием — из-за спины, вьётся; ночь с серой кромкой, лезвие костью ──
  const tw = Math.sin(t * 0.01) * (moving ? 3 : 1.5);
  let px0 = cx + 4 + hip, py0 = by + 25;
  for (let k = 1; k <= 13; k++) {
    const nx = cx + 4 + hip + k * 0.95 + Math.sin(k * 0.5) * 1.5 + tw * k / 13, ny = by + 25 + k * 0.95 - (k > 8 ? (k - 8) * 1.5 : 0);
    line(px0, py0, nx, ny, K3);
    if (k <= 6) line(px0, py0 + 1, nx, ny + 1, NI);                      // у основания толще
    if (k % 2 === 0) r(nx, ny - 1, 1, 1, S0);
    px0 = nx; py0 = ny;
  }
  pix(BLADE, px0 - 1, py0 - 4);
  // ── ноги: трико накрест — левая ночь, правая киноварь; колено, щиколотка уже ──
  const lL = moving ? q(Math.max(0, step) * 3) : 0, lR = moving ? q(Math.max(0, -step) * 3) : 0;
  const lx = cx + hip, top = by + 29;
  const nL = 14 - lL, nR = 14 - lR;                                      // свет слева — серой кромкой, иначе ночью не видно
  r(lx - 4, top, 1, Math.min(11, nL), S0); r(lx - 3, top, 2, nL, NI); if (nL > 7) r(lx - 3, top + 7, 1, 1, K3);
  r(lx + 2, top, 2, nR, KV); r(lx + 4, top, 1, Math.min(11, nR), KD); if (nR > 7) r(lx + 3, top + 7, 1, 1, KD);
  pix(SHOE_L, lx - 11, by + 42 - lL); pix(SHOE_R, lx + 2, by + 42 - lR);
  // ── баска, камзол, ворот ──
  pix(PEPLUM, cx - 7 + hip, by + 25);
  pix(DOUBLET, tc - 6, by + 16);
  pix(COLLAR, cx - 7 + sh, by + 13);
  // ── руки: жонглируют по-настоящему (слово автора: «естественными движениями») ──
  // каждая кисть ходит петлёй: ловит снаружи, несёт вещь вниз и к середине,
  // бросает у пояса, пустая уходит наружу и чуть вверх — навстречу следующей;
  // локти у тела, ходит предплечье; руки — в противофазе (cascade).
  // Рукава накрест ногам: левый киноварь, правый ночь с серой кромкой; у плеча буф
  const sL = { x: tc - 6, y: by + 17 }, sR = { x: tc + 6, y: by + 17 };
  const swing = moving ? q(step * 1.5) : 0;
  const hL = handAt(sL, -1, t, 0, swing), hR = handAt(sR, 1, t, S, -swing);
  const arm = (s0, h, dir, main, edge) => {                              // плечо → локоть у тела → кисть
    const el = { x: s0.x + dir * 2 + (h.x - s0.x - dir * 5) * 0.3, y: s0.y + 6 + (h.y - s0.y - 9) * 0.25 };
    line(s0.x + 1, s0.y + 1, el.x + 1, el.y, edge); line(el.x + 1, el.y, h.x + 1, h.y, edge);   // кромка правее: у левой — тень к телу, у правой — снаружи
    line(s0.x, s0.y, el.x, el.y, main); line(el.x, el.y, h.x, h.y, main);
    const cf = { x: el.x + (h.x - el.x) * 0.72, y: el.y + (h.y - el.y) * 0.72 };
    r(cf.x - 1, cf.y, 3, 1, BO); r(cf.x + (dir < 0 ? 1 : -1), cf.y + 1, 1, 1, L2);   // манжета зубцом
  };
  arm(sL, hL, -1, KV, KD); arm(sR, hR, 1, NI, S0);
  pix(PUFF_L, sL.x - 1, sL.y - 2); pix(PUFF_R, sR.x - 1, sR.y - 2);
  // ── голова: лицо белое, губы красные — улыбка как форма; крест в глазнице;
  //    моргает редко, если смотреть долго ──
  pix(t % 900 < 6 ? HEAD_BLINK : HEAD, hx, hy);
  // ── колпак: три рога с бубенцами; кончики качаются ──
  const hs = Math.sin(t * 0.009) * (moving ? 1.5 : 0.8);
  const shear = y => q(hs * -y / 8);
  const horn = (rows, main, lit, dark) => {
    for (const [y, a, b] of rows) for (let x = a; x <= b; x++)
      r(hx + x + shear(y), hy + y, 1, 1, b > a && x === b ? dark : b > a && x === a ? lit : main);
  };
  horn(HORN_L, KV, KV, KD); horn(HORN_M, NI, K4, NI); horn(HORN_R, KV, KV, KD);
  for (const [bx, bb] of BELLS) { const ox = hx + bx + shear(bb - 1); r(ox, hy + bb, 1, 1, L1); r(ox + 1, hy + bb, 1, 1, L2); r(ox, hy + bb + 1, 1, 1, AS); r(ox + 1, hy + bb + 1, 1, 1, S0); }
  // ── каскад: три вещи накрест из руки в руку; каждая вертится в полёте, в руке лежит
  //    остриём вверх; раз в шесть бросков у каждой — другое оружие, одинаковых нет ──
  const k0 = Math.floor(t / S);
  for (let i = 0; i < 3; i++) {
    const k = k0 - (((k0 - i) % 3) + 3) % 3, dt = t - k * S, n = (k - i) / 3;   // последний бросок этой вещи
    const fromL = (k & 1) === 0, a = fromL ? hand(sL, -1) : hand(sR, 1), b = fromL ? hand(sR, 1) : hand(sL, -1);
    const kind = KINDS[(((Math.floor(n / 6) * 3 + i) % KINDS.length) + KINDS.length) % KINDS.length];
    if (dt < FLY) {                                                      // в полёте: от точки броска к точке ловли
      const u = dt / FLY, H = fromL ? HIGH : HIGH - 5;                   // встречные дуги — на разной высоте
      const wx = a.throwP.x + swing * (fromL ? 1 : -1) + (b.catchP.x - a.throwP.x) * u, wy = a.throwP.y + (b.catchP.y - a.throwP.y) * u - Math.sin(u * Math.PI) * H;
      weapon(kind, wx + 1, wy - 1, u * Math.PI * 2 * (fromL ? 1 : -1) + i * 2.1 - Math.PI / 2);
    } else {                                                             // в руке: несут к броску
      const h = fromL ? hR : hL;
      weapon(kind, h.x + 1, h.y - 2, -Math.PI / 2 + (fromL ? 0.25 : -0.25));
    }
  }
  for (const h of [hL, hR]) { r(h.x, h.y, 2, 2, BO); r(h.x + 1, h.y + 1, 1, 1, L2); }   // кулаки — перчатки костью, поверх рукоятей
  // ── «ХА!» вблизи ──
  if (npcProximity > 0.3 && t % 80 < 20) {
    const laughPh = (t % 80) / 20;
    X.globalAlpha = (1 - laughPh) * npcProximity * 0.7;
    X.fillStyle = KV;
    X.font = '6px "Press Start 2P"';
    X.fillText('ХА!', cx + 12 - laughPh * 2, hy - 10 - laughPh * 4);
    X.globalAlpha = 1;
  }
}
