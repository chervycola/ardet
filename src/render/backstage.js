// ═══════════════════════════════════════
// ЗА ЭКРАНОМ — машина, на которой идёт мир. Где картинка истончается (яд:
// world/toxic.js), сквозь неё видно не цифры мира, а то, что за стеклом:
// старую командную строку и настоящие блок-схемы (ГОСТ 19.701-90:
// пуск-останов, данные, процесс, решение; линии потока, против хода — со
// стрелкой). Слой стоит на месте в экране — мир едет, машина нет.
// Не в стиле мира: системный моноширинный шрифт в точках экрана, а не в
// точках мира; один люминофор — токсичный зелёный канона (#8CC63F), светом.
// Тексты (нов.) — сухой журнал машины по канону мест: озеро, труба, пропасть.
// ═══════════════════════════════════════
export const COLS = 76;                 // строка терминала — не шире
const BG = '#030603', TXT = '#8CC63F', DIM = '#4C7424', HOT = '#C2E58A', LINE = '#6C9A36';
const GLOW = 'rgba(140,198,63,0.5)';
export const MONO = '"Lucida Console", Consolas, "DejaVu Sans Mono", "Liberation Mono", "Courier New", monospace';

// прошлый сеанс — тусклее; {D} {T} — дата и время машины. Строки длинные, как в
// живом сеансе (дампы, таблицы): сквозь протёртое видно текст, а не пустоту
const OLD = [
  'BIOS v4.51  (C) 1984-95          Процессор 486DX2-66      Память 16384K ОК',
  'Загрузка с C: ...   ARDET-DOS  версия 3.20   (C) Канцелярия, 1987-2026.',
  'Все права заверены.             Драйвер мыши не найден.  Мышь не нужна.',
  'C:\\>mem /c',
  'Модуль       Размер в десятичном виде     Размер в шестнадцатеричном',
  'MSDOS        16 384    (16K)              4000',
  'WORLD       598 016   (584K)              92000     кольца 1-9, городок',
  'FIRE         47 104    (46K)              B800      только чтение',
  'Свободно          0     (0K)              0',
];
const NOW = [
  'C:\\>cd town',
  'C:\\TOWN>dir *.dat',
  ' Том в устройстве C имеет метку ARDET     Серийный номер тома 0047-1980',
  ' Каталог C:\\TOWN',
  'LAKE     DAT     2 097 152  {D}  {T}   проба — ежечасно',
  'PIPE     DAT       524 288  26.09.22   2:03   версий — 4',
  'PIT      DAT             0  01.01.80   0:00   отбой',
  '        3 файл(а)     2 621 440 байт              0 байт свободно',
  'C:\\TOWN>debug lake.dat',
  '-d 100 13f',
  '0100  4C 41 4B 45 00 2F 00 00-FF FF 2F 4E 00 00 00 00   LAKE./..../N....',
  '0110  52 59 42 41 00 01 00 00-00 00 00 00 00 00 00 00   RYBA............',
  '0120  4C 4F 56 00 00 00 FF FF-5A 41 50 52 45 54 00 00   LOV.....ZAPRET..',
  '0130  00 00 00 00 00 00 00 00-00 00 00 00 00 00 00 00   ................',
  '-q',
  'C:\\TOWN>check lake.dat /all',
  'Проба 0047 ........... pH 2,1         Превышение ........... 340%',
  'Норма ................ пересмотрена   Превышение ........... 0%',
  'C:\\TOWN>check pipe.dat /all',
  'Давление ............. 0 атм          Пробоин .............. 1',
  'Версий ............... 4              Перечёркнуто ......... 4',
  'Пятая строка ......... пусто          Подпись .............. —',
  'C:\\TOWN>type pit.dat',
  'Отбой.',
  'C:\\TOWN>dir /w \\world\\rings',
  '[AXIAL]      [PORTICO]    [LIGHTGDN]   [2HEARTHS]   [ENLIGHT]    [STEAM]',
  '[CATASTR]    [NEON]       [NOW]        [FIRE]       [EDGE]       [.]',
  '       12 каталог(ов)               0 байт свободно',
];
export const PROMPT = 'C:\\TOWN>';

// блок-схемы: главная ветвь сверху вниз; у решения — боковая ветвь
// (side: узел справа или петля назад к входу решения)
export const CHARTS = [
  { title: 'КОНТРОЛЬ ПРОБЫ', nodes: [
    { k: 'term', s: 'Начало' },
    { k: 'data', s: 'Взять пробу' },
    { k: 'dec', s: 'Превышение?', down: 'нет', side: { k: 'proc', s: 'Пересмотреть\nнорму', on: 'да', back: true } },
    { k: 'proc', s: 'Записать:\n«в норме»' },
    { k: 'term', s: 'Конец' },
  ] },
  { title: 'ПОДЪЁМ', nodes: [
    { k: 'term', s: 'Начало' },
    { k: 'proc', s: 'Отбой' },
    { k: 'dec', s: 'Подъём\nобъявлен?', down: 'да', side: { k: 'loop', on: 'нет' } },
    { k: 'term', s: 'Конец' },
  ] },
];

const p2 = n => String(n).padStart(2, '0');
export function sessionLines(now = new Date()) {
  const D = `${p2(now.getDate())}.${p2(now.getMonth() + 1)}.${String(now.getFullYear()).slice(2)}`;
  const T = `${String(now.getHours()).padStart(2, ' ')}:${p2(now.getMinutes())}`;
  const fill = s => s.replace('{D}', D).replace('{T}', T);
  return [...OLD.map(s => ({ s: fill(s), dim: true })), ...NOW.map(s => ({ s: fill(s), dim: false })), { s: PROMPT, dim: false, prompt: true }];
}

// раскладка в точках экрана: терминал слева (на узком экране — сверху), схемы справа (снизу)
export function backLayout(W, H) {
  const land = W >= H, mx = Math.round(Math.min(W, H) * 0.03);
  const termW = land ? W * 0.66 - mx : W - 2 * mx;
  const fs = Math.max(10, Math.min(40, Math.round(Math.min(H / (land ? 36 : 60), termW / (0.6 * COLS)))));
  const lh = Math.round(fs * 1.25), cw = fs * 0.6;
  const term = { x: mx, y: mx, w: termW, h: land ? H - 2 * mx : H * 0.56 - mx };
  const chart = land ? { x: W * 0.68, y: mx, w: W * 0.32 - mx, h: H - 2 * mx } : { x: mx, y: H * 0.58, w: W - 2 * mx, h: H * 0.42 - mx };
  return { land, mx, fs, lh, cw, term, chart, rows: Math.max(1, Math.floor(term.h / lh)) };
}

// ── фигуры ГОСТ 19.701 ──
function shape(g, k, x, y, w, h) {
  g.beginPath();
  if (k === 'term') {                                   // пуск-останов: скруглённые торцы
    const r = h / 2;
    g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
    g.lineTo(x + r, y + h); g.arc(x + r, y + r, r, Math.PI / 2, Math.PI * 1.5);
  } else if (k === 'data') {                            // данные: параллелограмм
    const d = h * 0.4;
    g.moveTo(x + d, y); g.lineTo(x + w, y); g.lineTo(x + w - d, y + h); g.lineTo(x, y + h); g.closePath();
  } else if (k === 'dec') {                             // решение: ромб
    g.moveTo(x + w / 2, y); g.lineTo(x + w, y + h / 2); g.lineTo(x + w / 2, y + h); g.lineTo(x, y + h / 2); g.closePath();
  } else g.rect(x, y, w, h);                            // процесс
  g.stroke();
}
function label(g, s, cx, cy, fs) {
  const L = s.split('\n');
  L.forEach((t, i) => g.fillText(t, cx, cy + (i - (L.length - 1) / 2) * fs * 1.15));
}
function line(g, pts, arrow, ah) {
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.stroke();
  if (!arrow) return;
  const [x1, y1] = pts[pts.length - 1], [x0, y0] = pts[pts.length - 2], a = Math.atan2(y1 - y0, x1 - x0);
  g.beginPath(); g.moveTo(x1, y1);
  g.lineTo(x1 - ah * Math.cos(a - 0.45), y1 - ah * Math.sin(a - 0.45));
  g.lineTo(x1 - ah * Math.cos(a + 0.45), y1 - ah * Math.sin(a + 0.45));
  g.closePath(); g.fill();
}
// одна схема в рамке R; возвращает рамки узлов (для проверок)
export function chartBoxes(C, R, fs) {
  const n = C.nodes.length, head = fs * 1.8, step = (R.h - head) / n;
  const bw = Math.min(R.w * 0.4, fs * 9.5), bh = Math.min(step * 0.56, fs * 2.6);
  const mx = R.x + R.w * 0.3, sx = R.x + R.w * 0.8;
  return C.nodes.map((N, i) => {
    const cy = R.y + head + step * (i + 0.5), w = N.k === 'dec' ? bw * 1.12 : bw, h = N.k === 'dec' ? bh * 1.3 : bh;
    const box = { x: mx - w / 2, y: cy - h / 2, w, h, cx: mx, cy };
    if (N.side && N.side.k !== 'loop') box.side = { x: sx - bw * 0.42, y: cy - bh / 2, w: bw * 0.84, h: bh, cx: sx, cy };
    return box;
  });
}
function drawChart(g, C, R, fs, lw) {
  const B = chartBoxes(C, R, fs), tf = Math.max(8, Math.round(fs * 0.74)), ah = Math.max(4, fs * 0.36);
  g.lineWidth = lw; g.strokeStyle = LINE; g.fillStyle = DIM;
  g.font = `${tf}px ${MONO}`; g.textAlign = 'left'; g.textBaseline = 'top';
  g.fillText(C.title, R.x, R.y);
  g.fillRect(R.x, R.y + tf * 1.25, Math.min(R.w * 0.7, g.measureText(C.title).width), Math.max(1, lw));
  g.textAlign = 'center'; g.textBaseline = 'middle';
  C.nodes.forEach((N, i) => {
    const b = B[i];
    g.strokeStyle = LINE; shape(g, N.k, b.x, b.y, b.w, b.h);
    g.fillStyle = TXT; label(g, N.s, b.cx, b.cy, tf);
    if (i < B.length - 1) {                                            // поток вниз
      const nb = B[i + 1];
      g.fillStyle = LINE; line(g, [[b.cx, b.y + b.h], [nb.cx, nb.y]], false, ah);
      if (N.down) { g.fillStyle = DIM; g.textAlign = 'left'; g.fillText(N.down, b.cx + tf * 0.4, b.y + b.h + tf * 0.7); g.textAlign = 'center'; }
    }
    if (!N.side) return;
    const rx = b.x + b.w, ry = b.cy, inY = b.y - (b.y - (B[i - 1] ? B[i - 1].y + B[i - 1].h : b.y - fs)) / 2;
    g.fillStyle = DIM; g.textAlign = 'left'; g.fillText(N.side.on, rx + tf * 0.3, ry - tf * 0.8); g.textAlign = 'center';
    g.fillStyle = LINE;
    if (b.side) {                                                      // вправо — в процесс, из него — назад, к входу решения
      const s = b.side;
      shape(g, N.side.k, s.x, s.y, s.w, s.h);
      g.fillStyle = TXT; label(g, N.side.s, s.cx, s.cy, tf); g.fillStyle = LINE;
      line(g, [[rx, ry], [s.x, ry]], false, ah);
      if (N.side.back) line(g, [[s.cx, s.y], [s.cx, inY], [b.cx, inY]], true, ah);
    } else {                                                           // петля: назад, к своему входу
      const lx = rx + fs * 1.6;
      line(g, [[rx, ry], [lx, ry], [lx, inY], [b.cx, inY]], true, ah);
    }
  });
  g.textAlign = 'left'; g.textBaseline = 'top';
}

// ── слой целиком: в точках экрана; большие экраны — мельче, копируется с растяжкой ──
let cache = null;
export function backstage(W, H, now = new Date()) {
  const sc = Math.min(1, Math.sqrt(2.4e6 / Math.max(1, W * H)));
  const bw = Math.max(1, Math.round(W * sc)), bh = Math.max(1, Math.round(H * sc));
  const key = `${bw}x${bh}@${now.getDate()}.${now.getHours()}:${now.getMinutes()}`;
  if (cache && cache.key === key) return cache;
  if (typeof document === 'undefined' || !document.createElement) return null;
  const c = cache && cache.canvas.width === bw && cache.canvas.height === bh ? cache.canvas : document.createElement('canvas');
  if (!c || !c.getContext) return null;
  c.width = bw; c.height = bh;
  const g = c.getContext('2d');
  if (!g) return null;
  const L = backLayout(bw, bh), lw = Math.max(1, Math.round(L.fs / 14));
  g.fillStyle = BG; g.fillRect(0, 0, bw, bh);
  // терминал: последние строки — внизу, как на живом экране; выше — прошлое
  const all = sessionLines(now), shown = all.slice(-L.rows), y0 = L.term.y + L.term.h - shown.length * L.lh;
  g.font = `${L.fs}px ${MONO}`; g.textAlign = 'left'; g.textBaseline = 'top';
  g.shadowColor = GLOW; g.shadowBlur = L.fs * 0.35;
  let cursor = null;
  shown.forEach((ln, i) => {
    g.fillStyle = ln.prompt ? HOT : ln.dim ? DIM : TXT;
    const y = y0 + i * L.lh;
    g.fillText(ln.s, L.term.x, y);
    if (ln.prompt) cursor = { x: L.term.x + g.measureText(ln.s).width, y: y + L.fs * 0.1, w: L.cw, h: L.fs * 0.95 };
  });
  // схемы
  g.shadowBlur = L.fs * 0.25;
  const R = L.chart, two = L.land
    ? [{ x: R.x, y: R.y, w: R.w, h: R.h * 0.56 }, { x: R.x, y: R.y + R.h * 0.6, w: R.w, h: R.h * 0.4 }]
    : [{ x: R.x, y: R.y, w: R.w * 0.5, h: R.h }, { x: R.x + R.w * 0.52, y: R.y, w: R.w * 0.48, h: R.h }];
  CHARTS.forEach((C, i) => drawChart(g, C, two[i], L.fs, lw));
  g.shadowBlur = 0;
  // развёртка: тёмная строка через две
  const step = Math.max(2, Math.round(3 * sc));
  g.fillStyle = 'rgba(0,0,0,0.32)';
  for (let y = 0; y < bh; y += step) g.fillRect(0, y, bw, 1);
  // кинескоп: углы темнее
  const v = g.createRadialGradient(bw / 2, bh / 2, Math.min(bw, bh) * 0.35, bw / 2, bh / 2, Math.hypot(bw, bh) * 0.6);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
  g.fillStyle = v; g.fillRect(0, 0, bw, bh);
  cache = { key, canvas: c, sc, L, cursor };
  return cache;
}

// кусок слоя — в рамку экрана (точки экрана); курсор мигает раз в секунду
export function drawBack(g, B, x, y, w, h, frame = 0) {
  if (!B || w <= 0 || h <= 0) return;
  const s = B.sc;
  g.drawImage(B.canvas, x * s, y * s, w * s, h * s, x, y, w, h);
  const cu = B.cursor;
  if (cu && (frame >> 5) % 2 === 0) {
    const cx = cu.x / s, cy = cu.y / s, cwid = cu.w / s, chei = cu.h / s;
    if (cx < x + w && cx + cwid > x && cy < y + h && cy + chei > y) {
      g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
      g.fillStyle = HOT; g.fillRect(cx, cy, cwid, chei);
      g.restore();
    }
  }
}
export const BACK_COLORS = { BG, TXT, DIM, HOT, LINE };
