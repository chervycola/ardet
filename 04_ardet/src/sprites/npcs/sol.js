// ═══════════════════════════════════════
// SOL INVICTUS — по осмотру и ART_BIBLE §05. «Вместо головы — пылающий диск.
// Четырнадцать лучей медленно вращаются. Под диском — лицо: закрытые глаза,
// золотые потёки, замершие на щеках. Через прорехи в мантии видны рёбра.
// Дышат — один вдох на четыре твоих. В руке — ветка. Горит, не сгорает. У ног —
// вторая ветка. Та уже сгорела, не заметив.» По библии: гротескное строгое
// лицо, увядающий венок колосьев, трещины позолоты, подсолнух с черепом в
// сердцевине; «золото через дерево к тлену» — позолота по тёмному дереву
// мантии, к подолу — тлен и пепел. Золото — только его (канон). Число лучей
// несущее: четырнадцать («число — последний бренд»). Пиксель к пикселю.
// ═══════════════════════════════════════
import { t } from '../../core/time.js';
import { X } from '../../render/context.js';

const NI = '#0D0B0A', BO = '#D9CFB8', AS = '#8A8D8F', SV = '#E28A3A', KV = '#C23B2B';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K4 = '#3a3328';
const BR2 = '#3a2818', L1 = '#c8b89a', L2 = '#b0a284', SEP = '#3A3026';
const GOLD = '#b8860b', GOLD_HI = '#daa520', BRONZE = '#7a4a14', BRONZE_M = '#a06820';   // золото Sol — канон
const q = Math.round;
const r = (x, y, w = 1, h = 1, c) => { X.fillStyle = c; X.fillRect(q(x), q(y), w, h); };
function hh(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

let npcProximity = 0;
export function setProximity(v) { npcProximity = v; }

export function drawNPC_sol(sx, sy) {
  const cx = q(sx) + 14, y0 = q(sy), G = y0 + 44;
  const breath = Math.sin(t * Math.PI * 2 / 960) > 0.3 ? 1 : 0;        // вдох на четыре твоих — шестнадцать секунд
  // ── у ног: сгоревшая ветка — уголь и пепел ──
  for (let k = 0; k < 9; k++) r(cx - 13 + k, G - 1 + (k > 5 ? 1 : 0), 1, 1, k % 3 ? K0 : K1);
  r(cx - 10, G - 2, 1, 1, K0); r(cx - 8, G - 3, 1, 2, K0); r(cx - 6, G - 2, 1, 1, K1);
  for (const dx of [-12, -9, -7]) r(cx + dx, G - 2, 1, 1, AS);
  X.globalAlpha = 0.4; r(cx - 8, G, 17, 1, NI); X.globalAlpha = 1;
  // ── мантия: позолота по тёмному дереву, к подолу — тлен ──
  for (let k = 0; k <= 29; k++) {
    const y = y0 + 15 + k, w = q(5 + k * 0.14), rag = k > 26 ? q(hh(k, 1, 3) * 2) : 0;
    r(cx - w + rag, y, 2 * w - rag, 1, BR2);
    for (let x = cx - w + rag + 1; x < cx + w - 1; x++) {
      const edge = 8 + q(hh(x, 1, 5) * 5);                              // где позолота кончилась — рвано
      if (k < edge) r(x, y, 1, 1, x < cx - w + 3 ? GOLD_HI : GOLD);
      else if (k < edge + 6 && hh(x, y, 11) < 0.1) r(x, y, 1, 1, GOLD);   // хлопья позолоты
      else if (k > 20 && hh(x, y, 7) < 0.06 + (k - 20) * 0.025) r(x, y, 1, 1, AS);   // пепел к подолу
      else if (k > 14 && hh(x, y, 9) < 0.16) r(x, y, 1, 1, SEP);         // тлен
    }
    r(cx - w + rag, y, 1, 1, k < 10 ? GOLD_HI : L2); r(cx + w - 1, y, 1, 1, AS);
    if (k > 9) for (const f of [-0.45, 0.35]) r(cx + q(f * w), y, 1, 1, K1);   // складки
  }
  for (const [x1, y1, n, d] of [[-5, 16, 5, 1], [1, 17, 4, -1], [-2, 21, 4, 1], [3, 22, 3, 1]]) for (let k = 0; k < n; k++) r(cx + x1 + k, y0 + y1 + ((k * d) >> 1), 1, 1, BRONZE);   // трещины позолоты
  // прорехи — видны рёбра; дышат
  for (const [hx, hy, hw, hl] of [[cx - 4, y0 + 21, 3, 6], [cx + 2, y0 + 27, 3, 5]]) {
    r(hx - 1, hy - 1, hw + 2, hl + 2, BR2); r(hx, hy, hw, hl, NI);
    for (let k = 1; k < hl - 1; k += 2) r(hx - (breath && k > 1 ? 1 : 0), hy + k, hw + (breath ? 1 : 0), 1, k === 1 ? BO : L1);
  }
  // подсолнух-застёжка: золотые лепестки, в сердцевине — череп
  const fx = cx, fy = y0 + 18;
  r(fx - 3, fy - 2, 7, 5, BR2); r(fx - 2, fy - 3, 5, 7, BR2);           // тёмная подложка — золото на золоте не видно
  for (let a = 0; a < 8; a++) { const u = a / 8 * Math.PI * 2; r(fx + q(Math.cos(u) * 3), fy + q(Math.sin(u) * 2.4), 1, 1, a < 4 ? GOLD : GOLD_HI); }
  r(fx - 1, fy - 1, 3, 3, K1);
  r(fx - 1, fy - 1, 3, 1, BO); r(fx, fy, 1, 1, BO); r(fx - 1, fy + 1, 1, 1, L1); r(fx + 1, fy + 1, 1, 1, L1);   // череп: свод, переносица, челюсть
  // левая рука — из рукава кость
  r(cx - 8, y0 + 28, 2, 3, BR2); r(cx - 8, y0 + 31, 1, 2, BO); r(cx - 7, y0 + 31, 1, 1, L1);
  // правая рука держит ветку: горит, не сгорает
  r(cx + 6, y0 + 18, 2, 12, BR2); r(cx + 7, y0 + 18, 1, 12, AS);
  r(cx + 7, y0 + 29, 2, 2, BO);
  const tw = [[9, 28], [10, 26], [10, 24], [11, 22], [12, 20], [12, 18], [13, 16]];
  for (const [dx, dy] of tw) r(cx + dx, y0 + dy, 1, 2, K1);
  r(cx + 11, y0 + 21, 2, 1, K1); r(cx + 13, y0 + 20, 1, 1, K1); r(cx + 9, y0 + 23, 1, 1, K1);
  const fl = (t >> 3) & 3;
  for (const [dx, dy, ph] of [[13, 15, 0], [14, 19, 2], [8, 22, 1]]) {
    const h = 1 + ((fl + ph) & 1);
    r(cx + dx, y0 + dy - h, 1, h, SV); r(cx + dx, y0 + dy, 1, 1, KV);
  }
  // ── диск вместо головы: четырнадцать лучей медленно вращаются ──
  const hcx = cx, hcy = y0 + 7, rot = t * 0.0008;
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2 + rot;
    for (let k = 8; k <= 11; k++) r(hcx + Math.cos(a) * k, hcy + Math.sin(a) * k, 1, 1, k < 10 ? GOLD : GOLD_HI);
  }
  for (let dy = -7; dy <= 7; dy++) {
    const w = q(Math.sqrt(Math.max(0, 52 - dy * dy)));
    r(hcx - w, hcy + dy, 2 * w + 1, 1, BRONZE);
    if (w > 1) r(hcx - w + 1, hcy + dy, 2 * w - 1, 1, dy < -2 ? GOLD_HI : GOLD);
    if (w > 1) r(hcx - w + 1, hcy + dy, 1, 1, dy < 3 ? BO : GOLD_HI);   // блик слева
  }
  for (const [dx, dy, l] of [[-5, -3, 3], [3, -5, 2], [4, 2, 3], [-4, 4, 2]]) for (let k = 0; k < l; k++) r(hcx + dx + k, hcy + dy + (k & 1), 1, 1, BRONZE_M);   // трещины позолоты
  // лицо под диском: тяжёлые закрытые веки, нос, рот прямой, уголки вниз; потёки застыли
  r(hcx - 4, hcy, 3, 1, BRONZE); r(hcx + 2, hcy, 3, 1, BRONZE); r(hcx - 4, hcy - 1, 3, 1, BRONZE_M); r(hcx + 2, hcy - 1, 3, 1, BRONZE_M);
  r(hcx, hcy, 1, 3, BRONZE); r(hcx - 1, hcy + 3, 1, 1, BRONZE_M);
  r(hcx - 2, hcy + 5, 5, 1, BRONZE); r(hcx - 3, hcy + 6, 1, 1, BRONZE); r(hcx + 3, hcy + 6, 1, 1, BRONZE);
  for (const dx of [-3, 3]) { r(hcx + dx, hcy + 1, 1, 3, BRONZE_M); r(hcx + dx, hcy + 4, 1, 1, L1); r(hcx + dx - Math.sign(dx), hcy + 2, 1, 1, BRONZE_M); }   // потёки застыли
  // ── увядающий венок колосьев — под диском, ворохом; колосья никнут ──
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (0.12 + i * 0.095), wilt = hh(i, 4, 3) < 0.4, ex = hcx + Math.cos(a) * 8, ey = hcy + Math.sin(a) * 7;
    const dx = Math.cos(a) * (wilt ? 0.6 : 1), dy = Math.sin(a) + (wilt ? 0.9 : 0.2);
    for (let k = 0; k < 6; k++) r(ex + dx * k, ey + dy * k, k < 3 ? 1 : 2, 1, k < 3 ? (wilt ? K4 : BRONZE_M) : wilt ? SEP : k === 5 ? L1 : L2);   // стебель, колос
  }
}
