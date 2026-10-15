// ═══════════════════════════════════════
// РИСУНОК ПРИМЕТ (раскладка — world/landmarks.js). Те же краски, что у
// построек эпох: камень и дерево тёмные, лунная кромка слева, снег костью.
// Живое там, где ему положено: крылья мельницы вертит ветер, плечи
// оптического телеграфа переставляются (он передаёт — кому, неизвестно),
// лоскуты на дереве у родника треплет ветер, баржа качается на воде.
// Вмёрзшее колесо не вертится. Красное — одно: колесо задвижки на трубе.
// ═══════════════════════════════════════
import { landmarks, LM_SIZE } from '../world/landmarks.js';
import { wind } from '../world/wind.js';

const N = '#0D0B0A', K = '#D9CFB8', P = '#8A8D8F', V = '#C23B2B';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K3 = '#34302a', K4 = '#3a3328', L2 = '#b0a284';
const BARK = '#2e2216', FD = '#252c22', FB = '#33402f', RUST = '#4a3420', CONC = '#5a5650', CONC_D = '#3e3b36', CONC_L = '#8a857a';
const SAND = '#6b6150';

function R(c, col, x, y, w, h) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
const q = Math.round;
function hh(x, y, s) { let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
// отрезок по точкам (1 точка толщиной)
function line(c, col, x0, y0, x1, y1) {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let k = 0; k <= n; k++) R(c, col, x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, 1, 1);
}
function disc(c, col, cx, cy, rx, ry) {
  for (let y = -ry; y <= ry; y++) { const w = q(rx * Math.sqrt(Math.max(0, 1 - (y / (ry + 0.5)) ** 2))); if (w > 0) R(c, col, cx - w, cy + y, 2 * w + 1, 1); }
}

const DRAW = {
  // дерево у родника: боярышник, на ветках лоскуты; один — киноварью
  clootie(c, l, t) {
    const x = l.x, g = l.gy;
    R(c, BARK, x - 1, g - 11, 3, 11); R(c, K1, x - 3, g - 1, 7, 1); R(c, P, x - 1, g - 10, 1, 7);
    line(c, BARK, x, g - 10, x - 8, g - 16); line(c, BARK, x + 1, g - 10, x + 8, g - 17); line(c, BARK, x, g - 11, x - 1, g - 20);
    disc(c, FD, x - 6, g - 18, 4, 2); disc(c, FB, x + 6, g - 19, 4, 2); disc(c, FD, x, g - 21, 3, 2);
    const w = wind.at(x, g), sw = w.x * 2 + Math.sin(t * 0.11 + x) * w.s;
    const rags = [[-7, -15, K], [-4, -13, P], [-1, -18, L2], [3, -14, K], [6, -16, V], [8, -14, P], [1, -12, K]];
    for (const [dx, dy, col] of rags) { R(c, col, x + dx, g + dy, 1, 2); R(c, col, x + dx + q(sw * 0.7), g + dy + 2, 1, 1); }
  },
  // мельница вмёрзла: колесо во льду, сосульки, снег на кровле
  frozenMill(c, l) {
    const x = l.x, g = l.gy, s = (l.dir || 1) > 0 ? -1 : 1;              // колесо — к реке
    R(c, K3, x - 8, g - 12, 16, 12); R(c, P, x - 8, g - 12, 1, 12); R(c, N, x - 2, g - 7, 4, 7);
    for (let k = 0; k < 9; k++) R(c, BARK, x - 9 + k, g - 13 - k, 18 - 2 * k, 1);   // кровля
    for (let k = 0; k < 9; k++) R(c, K, x - 9 + k, g - 13 - k, 3, 1);              // снег на скате
    const wx = x + s * 12, wy = g - 6;
    for (let a = 0; a < 16; a++) { const an = a * Math.PI / 8; R(c, BARK, wx + Math.cos(an) * 6, wy + Math.sin(an) * 6, 1, 1); }
    for (let a = 0; a < 4; a++) { const an = a * Math.PI / 4 + 0.3; line(c, BARK, wx - Math.cos(an) * 6, wy - Math.sin(an) * 6, wx + Math.cos(an) * 6, wy + Math.sin(an) * 6); }
    R(c, K, wx - 6, g - 1, 13, 2); R(c, P, wx - 4, g + 1, 9, 1);                    // лёд под колесом
    for (const dx of [-5, -2, 1, 4]) R(c, K, wx + dx, wy + 6, 1, 2 + (dx & 1));     // сосульки с обода
    for (const dx of [-6, -1, 4]) R(c, K, x + dx, g - 12, 1, 2);
  },
  // прорубь на льду канала: чёрная вода, ящик рыбака, леска
  iceHole(c, l, t) {
    const x = l.x, g = l.gy;
    disc(c, P, x, g, 4, 2); disc(c, N, x, g, 3, 1);
    R(c, K3, x + 5, g - 3, 4, 3); R(c, P, x + 5, g - 3, 4, 1);
    line(c, K1, x + 7, g - 4, x + 1, g - 9); R(c, K1, x, g - 9, 1, 9);
    if ((t >> 5) % 7 === 0) R(c, K, x - 1, g, 1, 1);                            // клюёт
  },
  // шлюз на канале: две створки поперёк воды, балансиры на берегах, будка
  locks(c, l) {
    const x = l.x, g = l.gy, ax = l.ax || 1, ay = l.ay || 0, nx = -ay, ny = ax;
    for (const s of [-5, 5]) {
      const cx = x + ax * s, cy = g + ay * s;
      for (let k = -8; k <= 8; k++) R(c, K1, cx + nx * k, cy + ny * k - 3, 1, 3);   // створка
      for (let k = -8; k <= 8; k += 4) R(c, P, cx + nx * k, cy + ny * k - 4, 1, 1);
      line(c, BARK, cx + nx * 9, cy + ny * 9 - 4, cx + nx * 9 + ax * 8, cy + ny * 9 + ay * 8 - 4);   // балансир
    }
    const bx = x + nx * 14, by = g + ny * 14;
    R(c, K3, bx - 4, by - 9, 8, 9); R(c, P, bx - 4, by - 9, 1, 9); R(c, N, bx - 1, by - 6, 2, 3);
    for (let k = 0; k < 5; k++) R(c, BARK, bx - 5 + k, by - 10 - k, 10 - 2 * k, 1);
  },
  // баржа у стенки канала: корпус, рубка, труба; качается
  barge(c, l, t) {
    const x = l.x, g = l.gy + q(Math.sin(t * 0.04 + l.x) * 0.6), horiz = Math.abs(l.ax || 1) >= Math.abs(l.ay || 0);
    if (horiz) {
      R(c, K1, x - 15, g - 3, 30, 4); R(c, P, x - 15, g - 4, 30, 1); R(c, K0, x - 13, g + 1, 26, 1);
      R(c, K3, x + 3, g - 9, 9, 5); R(c, P, x + 3, g - 9, 1, 5); R(c, N, x + 6, g - 7, 2, 2);
      R(c, K0, x - 6, g - 12, 2, 8); R(c, P, x - 6, g - 12, 2, 1);
      R(c, BARK, x - 12, g - 6, 1, 2); line(c, K1, x - 15, g - 3, x - 20, g + 1);  // швартов
    } else {
      R(c, K1, x - 3, g - 22, 7, 22); R(c, P, x - 3, g - 22, 1, 22); R(c, K3, x - 2, g - 12, 5, 6); R(c, K0, x, g - 18, 2, 3);
    }
  },
  // задвижка на трубе: стояк ржавью, колесо киноварью, бетонная тумба
  valve(c, l) {
    const x = l.x, g = l.gy;
    R(c, CONC_D, x - 5, g - 3, 10, 3); R(c, CONC_L, x - 5, g - 3, 10, 1);
    R(c, RUST, x - 1, g - 10, 3, 7); R(c, P, x - 1, g - 10, 1, 7);
    for (let a = 0; a < 12; a++) { const an = a * Math.PI / 6; R(c, V, x + Math.cos(an) * 4, g - 12 + Math.sin(an) * 2, 1, 1); }
    line(c, V, x - 4, g - 12, x + 4, g - 12); R(c, V, x, g - 14, 1, 4);
  },
  // лодка в сухом русле: на боку, рёбра наружу, наполовину в песке
  boat(c, l) {
    const x = l.x, g = l.gy;
    for (let k = -13; k <= 13; k++) { const d = q(3 * (1 - (k / 13) ** 2)); R(c, BARK, x + k, g - 3 - d, 1, d + 2); }
    for (let k = -10; k <= 10; k += 4) R(c, P, x + k, g - 6 + q(Math.abs(k) / 5), 1, 4);   // рёбра
    R(c, SAND, x - 14, g - 1, 28, 2); R(c, L2, x - 9, g - 2, 6, 1);
  },
  // каменная баба: стёртое лицо — тенью, руки на животе
  baba(c, l) {
    const x = l.x, g = l.gy;
    R(c, K3, x - 4, g - 2, 8, 2);
    R(c, P, x - 3, g - 10, 6, 8); R(c, K, x - 3, g - 10, 1, 8); R(c, K3, x + 2, g - 9, 1, 7);
    disc(c, P, x, g - 12, 2, 1); R(c, K, x - 2, g - 13, 1, 2); R(c, N, x - 1, g - 12, 2, 1);
    R(c, K3, x - 2, g - 6, 4, 1);
  },
  // крест на кургане: дерево, кровелька-голубец, чуть клонится
  cross(c, l) {
    const x = l.x, g = l.gy, lean = (l.seed % 2) ? 1 : 0;
    R(c, BARK, x, g - 14, 2, 14); R(c, P, x, g - 13, 1, 12);
    R(c, BARK, x - 3 + lean, g - 10, 8, 2); R(c, BARK, x - 1 + lean, g - 6, 4, 1);
    line(c, K1, x - 3, g - 14, x + 1, g - 17); line(c, K1, x + 1, g - 17, x + 5, g - 14);
  },
  // триангуляционный знак: деревянная пирамида, площадка, шест
  trig(c, l) {
    const x = l.x, g = l.gy;
    line(c, BARK, x - 7, g, x - 2, g - 22); line(c, BARK, x + 7, g, x + 2, g - 22);
    line(c, P, x - 7, g, x - 2, g - 22);
    for (const y of [6, 12, 18]) { const w = q(7 - 5 * y / 22); line(c, K1, x - w, g - y, x + w, g - y); }
    line(c, K1, x - 6, g - 3, x + 4, g - 15); line(c, K1, x + 6, g - 3, x - 4, g - 15);
    R(c, K3, x - 4, g - 23, 8, 2); R(c, P, x, g - 30, 1, 7);
  },
  // сейд: валун на камнях-ножках, под ним просвет
  seid(c, l) {
    const x = l.x, g = l.gy;
    R(c, K3, x - 5, g - 3, 3, 3); R(c, K3, x + 2, g - 3, 3, 3); R(c, N, x - 2, g - 3, 4, 2);
    disc(c, K3, x, g - 7, 6, 3); R(c, P, x - 6, g - 8, 2, 2); R(c, K, x - 4, g - 10, 3, 1);
  },
  // гурий: камни стопкой
  cairn(c, l) {
    const x = l.x, g = l.gy;
    const rows = [[4, 2], [3, 2], [3, 2], [2, 2], [1, 2]];
    let y = g;
    for (const [w, h] of rows) { y -= h; R(c, K3, x - w, y, 2 * w, h); R(c, P, x - w, y, 1, h); R(c, K, x - w, y, w, 1); }
  },
  menhir(c, l) {
    const x = l.x, g = l.gy;
    for (let y = 0; y < 16; y++) { const w = y < 13 ? 2 + (y < 6 ? 1 : 0) : 1; R(c, K3, x - w, g - y - 1, 2 * w, 1); R(c, P, x - w, g - y - 1, 1, 1); }
    R(c, '#3D4A3A', x + 1, g - 7, 1, 2);                                   // лишайник
  },
  // распятие у дороги: камень, тумба
  calvary(c, l) {
    const x = l.x, g = l.gy;
    R(c, K3, x - 4, g - 4, 8, 4); R(c, P, x - 4, g - 4, 8, 1);
    R(c, K3, x - 1, g - 18, 3, 14); R(c, P, x - 1, g - 18, 1, 14);
    R(c, K3, x - 4, g - 15, 9, 2); R(c, P, x - 4, g - 15, 9, 1); R(c, N, x, g - 13, 1, 3);
  },
  // мельница-столбовка на холме: короб на столбе, крылья вертит ветер
  windmill(c, l, t) {
    const x = l.x, g = l.gy;
    line(c, BARK, x - 5, g, x, g - 7); line(c, BARK, x + 5, g, x, g - 7); R(c, BARK, x, g - 11, 1, 5);   // козлы и столб
    R(c, K3, x - 5, g - 21, 10, 10); R(c, P, x - 5, g - 21, 1, 10); R(c, N, x - 1, g - 15, 2, 3);
    for (let k = 0; k < 6; k++) R(c, BARK, x - 6 + k, g - 22 - k, 12 - 2 * k, 1);
    const hx = x + 1, hy = g - 17, a0 = l.spin || 0;
    for (let k = 0; k < 4; k++) {
      const a = a0 + k * Math.PI / 2, cx = Math.cos(a), sy = Math.sin(a);
      line(c, K1, hx, hy, hx + cx * 12, hy + sy * 12);
      for (let r = 4; r <= 12; r += 2) R(c, L2, hx + cx * r - sy * 2, hy + sy * r + cx * 2, 1, 1);   // решётка крыла
    }
    R(c, P, hx - 1, hy - 1, 2, 2);
  },
  // оптический телеграф: башенка, мачта, регулятор с крыльями — переставляются
  semaphore(c, l, t) {
    const x = l.x, g = l.gy;
    R(c, K3, x - 4, g - 12, 8, 12); R(c, P, x - 4, g - 12, 1, 12); R(c, N, x - 1, g - 6, 2, 6);
    for (let k = 0; k < 5; k++) R(c, BARK, x - 5 + k, g - 13 - k, 10 - 2 * k, 1);
    R(c, BARK, x, g - 25, 1, 9);
    const code = Math.floor(t / 150 + l.seed * 7), r = hh(code, 1, 9), a = (Math.floor(r * 4) - 1.5) * Math.PI / 4;
    const ex = Math.cos(a) * 6, ey = Math.sin(a) * 6, cx = x, cy = g - 23;
    line(c, K1, cx - ex, cy - ey, cx + ex, cy + ey);
    for (const [s, k] of [[-1, 5], [1, 7]]) {
      const b = a + (Math.floor(hh(code, k, 11) * 4) - 1) * Math.PI / 4 + Math.PI / 2;
      line(c, K1, cx + s * ex, cy + s * ey, cx + s * ex + Math.cos(b) * 3, cy + s * ey + Math.sin(b) * 3);
    }
  },
  // ступа на террасе: белёный купол, хармика, шпиль
  stupa(c, l) {
    const x = l.x, g = l.gy;
    R(c, K3, x - 7, g - 2, 14, 2); R(c, P, x - 7, g - 2, 14, 1);
    for (let y = 0; y < 7; y++) { const w = q(6 * Math.sqrt(1 - (y / 7) ** 2)); R(c, L2, x - w, g - 3 - y, 2 * w, 1); R(c, K, x - w, g - 3 - y, 2, 1); R(c, P, x + w - 1, g - 3 - y, 1, 1); }
    R(c, K3, x - 2, g - 12, 4, 2); R(c, P, x, g - 15, 1, 3); R(c, P, x - 1, g - 14, 3, 1);
  },
  // колодец оазиса: каменное кольцо, ворот с ведром
  oasis(c, l) {
    const x = l.x, g = l.gy;
    disc(c, K3, x, g - 1, 5, 2); disc(c, N, x, g - 1, 3, 1); R(c, P, x - 5, g - 2, 1, 2);
    R(c, BARK, x - 5, g - 8, 1, 6); R(c, BARK, x + 5, g - 8, 1, 6); R(c, BARK, x - 5, g - 8, 11, 1);
    R(c, K1, x, g - 7, 1, 3); R(c, K3, x - 1, g - 4, 3, 2);
  },
  // герма у шёлкового пути: столб с головой, груда камней
  herm(c, l) {
    const x = l.x, g = l.gy;
    for (const [dx, dy] of [[-4, 0], [-2, -1], [2, 0], [4, -1], [0, 0]]) R(c, hh(dx, dy, 1) < 0.5 ? K3 : P, x + dx, g - 1 + dy, 2, 1);
    R(c, K3, x - 1, g - 11, 3, 10); R(c, P, x - 1, g - 11, 1, 10); disc(c, P, x, g - 13, 1, 1); R(c, K, x - 1, g - 14, 1, 1);
  },
  // камень с крестом у караванной дороги
  khachkar(c, l) {
    const x = l.x, g = l.gy;
    R(c, K3, x - 4, g - 2, 8, 2);
    R(c, K3, x - 3, g - 14, 7, 12); R(c, P, x - 3, g - 14, 1, 12);
    R(c, P, x, g - 12, 1, 8); R(c, P, x - 2, g - 9, 5, 1); R(c, K4, x - 2, g - 4, 5, 1);
  },
  // водокачка у рельсов: бак на ногах, хобот вниз
  watertower(c, l) {
    const x = l.x, g = l.gy;
    for (const s of [-1, 1]) { line(c, K1, x + s * 6, g, x + s * 4, g - 18); }
    line(c, K1, x - 5, g - 6, x + 5, g - 12); line(c, K1, x + 5, g - 6, x - 5, g - 12);
    R(c, K3, x - 6, g - 28, 12, 10); R(c, P, x - 6, g - 28, 1, 10); R(c, P, x - 6, g - 24, 12, 1); R(c, K4, x - 7, g - 29, 14, 1);
    R(c, P, x + 6, g - 22, 4, 1); R(c, P, x + 9, g - 22, 1, 7);
  },
  // остановка у сети: навес, скамья, пустая табличка
  busstop(c, l) {
    const x = l.x, g = l.gy;
    R(c, CONC_D, x - 9, g - 11, 1, 11); R(c, CONC_D, x + 8, g - 11, 1, 11);
    R(c, CONC_L, x - 10, g - 12, 20, 2);
    for (let k = -8; k < 8; k += 3) R(c, P, x + k, g - 10, 1, 6);              // стекло — осколками по раме
    R(c, K3, x - 6, g - 4, 12, 1); R(c, K3, x - 6, g - 3, 1, 3); R(c, K3, x + 5, g - 3, 1, 3);
    R(c, P, x + 12, g - 15, 1, 15); R(c, CONC_L, x + 10, g - 16, 5, 3); R(c, N, x + 11, g - 15, 3, 1);
  },
  // дот на высоте: бетонный горб, амбразура щелью, земля навалена
  pillbox(c, l) {
    const x = l.x, g = l.gy;
    disc(c, K3, x, g - 2, 9, 2);
    for (let y = 0; y < 6; y++) { const w = q(8 * Math.sqrt(1 - (y / 6) ** 2)); R(c, CONC_D, x - w, g - 3 - y, 2 * w, 1); R(c, CONC_L, x - w, g - 3 - y, 1, 1); }
    R(c, N, x - 4, g - 6, 8, 1); R(c, P, x - 5, g - 7, 10, 1);
  },
  // ветряк неона: башня, гондола, три лопасти — их вертит ветер
  turbine(c, l) {
    const x = l.x, g = l.gy;
    for (let y = 0; y < 36; y++) { const w = y < 20 ? 1 : 0; R(c, CONC_L, x - w, g - y - 1, 1 + 2 * w, 1); }
    R(c, P, x - 1, g - 38, 4, 2);
    const a0 = l.spin || 0, hx = x, hy = g - 37;
    for (let k = 0; k < 3; k++) {
      const a = a0 + k * 2 * Math.PI / 3;
      line(c, K, hx, hy, hx + Math.cos(a) * 11, hy + Math.sin(a) * 11);
    }
  },
  // щит у дороги: рама без плаката (плакат сорван), две ноги
  billboard(c, l) {
    const x = l.x, g = l.gy;
    R(c, K1, x - 7, g - 12, 1, 12); R(c, K1, x + 6, g - 12, 1, 12);
    R(c, K3, x - 10, g - 21, 21, 10); R(c, N, x - 9, g - 20, 19, 8);
    for (let k = -8; k < 10; k += 5) R(c, P, x + k, g - 20, 1, 8);              // рёбра рамы сквозь дыру
    R(c, L2, x - 9, g - 13, 5, 1); R(c, L2, x + 4, g - 20, 3, 1);                // обрывки бумаги
  },
  // вышка связи: решётка, площадки, тарелки
  celltower(c, l) {
    const x = l.x, g = l.gy;
    line(c, K1, x - 4, g, x - 1, g - 34); line(c, K1, x + 4, g, x + 1, g - 34); line(c, P, x - 4, g, x - 1, g - 34);
    for (let y = 4; y < 34; y += 6) { const w = q(4 - 3 * y / 34); line(c, K1, x - w, g - y, x + w, g - y - 5); line(c, K1, x + w, g - y, x - w, g - y - 5); }
    R(c, P, x - 3, g - 30, 2, 3); R(c, P, x + 2, g - 26, 2, 3); R(c, K, x, g - 39, 1, 5);
  },
};

// приметы — кусками с глубиной, как утварь дворов
export const landmarkProps = [];
export function buildLandmarkProps() {
  landmarkProps.length = 0;
  for (const l of landmarks) {
    const [w, h] = LM_SIZE[l.kind], d = DRAW[l.kind];
    if (!d) continue;
    landmarkProps.push({ x: l.x, gy: l.gy + 2, w: w + 6, h: h + 4, kind: l.kind, lm: l, draw(ctx) { d(ctx, l, stepNow); } });
  }
  return landmarkProps;
}
let stepNow = 0;
export function landmarkPropsIn(x0, y0, x1, y1, step) {
  const out = landmarkProps.filter(p => p.x + p.w / 2 > x0 && p.x - p.w / 2 < x1 && p.gy > y0 && p.gy - p.h < y1);
  if (step !== stepNow) {
    // крылья мельниц: угол копится по ветру (ветер стих — встали, окреп — пошли)
    for (const p of out) {
      if (p.kind === 'windmill') p.lm.spin = (p.lm.spin || 0) + (step - stepNow) * 0.004 * (0.15 + wind.s * 2.4);
      if (p.kind === 'turbine') p.lm.spin = (p.lm.spin || 0) + (step - stepNow) * 0.01 * (0.2 + wind.s * 2);
    }
    stepNow = step;
  }
  return out;
}
