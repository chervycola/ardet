// ═══════════════════════════════════════
// НАБОР МАТЕРИАЛОВ ПОСТРОЕК КОЛЕЦ (weave/ARCH_PLAN.md, этап 3) — тело постройки
// рисуется картой: прямоугольники, клинья кровель и проёмы ложатся в буфер
// материалов, потом один проход красит каждую точку — фактура материала
// (кладка рядами, кирпич с перевязкой, штукатурка зерном, брёвна, черепица,
// бетон с опалубкой, стекло с полосой неба, гофра с ржой), свет слева и сверху
// по соседям, кромка пеплом справа, тень у земли. Поверх — износ: копоть
// языками над проёмами, подтёки, мох и снег по верхам, трещины, сколы кромки.
// Краски — производные канона (смешение шести и бумаги), своих нет. Рисуется
// строками одного цвета (fillRect) — годится и для холста, и для записи в
// тестах; неподвижное потом запекается (render/archbake.js).
// ═══════════════════════════════════════
const NI = '#0D0B0A', BO = '#D9CFB8', AS = '#8A8D8F', MG = '#3D4A3A', KV = '#C23B2B', SEP = '#3A3026';
const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const css = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, k) => css(hex(a).map((v, i) => v + (hex(b)[i] - v) * k));

// лестница тона: глубь, тень, тело, к свету, верх, блик
const ramp = (B, L = BO) => [mix(B, NI, 0.55), mix(B, NI, 0.27), B, mix(B, L, 0.3), mix(B, L, 0.52), mix(B, L, 0.72)];
const S0 = mix(NI, AS, 0.47), RUST = mix(SEP, KV, 0.1);

export const MAT = {
  VOID: 0,
  ASHLAR: 1,      // тёсаный камень рядами
  RUBBLE: 2,      // бут: камни разной величины на растворе
  BRICK: 3,       // кирпич с перевязкой
  PLASTER: 4,     // штукатурка
  LOGS: 5,        // брёвна, брус
  BOARD: 6,       // доски стоймя
  THATCH: 7,      // солома, камыш
  TILE: 8,        // черепица
  CONCRETE: 9,    // бетон с опалубкой и порами
  GLASS: 10,      // стекло: темно, полоса неба
  IRON: 11,       // гофра, листовое железо
  DARK: 12,       // проём: глубина, у притолоки темнее
  MUD: 13,        // сырец, саман
  SNOW: 14,
  MOSS: 15,
  BASALT: 16,     // тёмный камень
  TIMBER: 17,     // балки и стойки (фахверк, стропила)
  MARBLE: 18,     // мрамор и известняк под штуком: светлый, гладкий
  GRANITE: 19,    // гранит: монолит в крапину (обелиск, валуны)
  SANDSTONE: 20,  // песчаник: тёплый, рядами (Египет, пустыни)
  RAMMED: 21,     // трамбованная земля: слои без швов, ряды дыр от опалубки (Хань, пахса)
  WATTLE: 22,     // плетень: колья и прутья вперевивку
  FELT: 23,       // войлок: шерсть свалянная, без швов, ворс пятнами
  SAND: 24,       // песок: барханы, рябь ветра наискось
  BAKED: 25,      // обожжённый кирпич светлый (Вавилон): облицовка по сырцу
  DRYSTONE: 26,   // плитняк сухой кладки: камни в точку высотой и 3–7 длиной, швы вразбежку (брохи)
  CURTAIN: 27,    // навесная стена: серебристое стекло в импостах, пояса перекрытий светлее (небоскрёбы)
  TINT: 28,       // стекло в цвет мглы, пояса этажей (Тайбэй)
  PANEL: 29,      // сборная железобетонная панель: гладкая, вертикальные стыки (панельный дом)
  STEEL: 30,      // крашеная сталь, светлая и гладкая (решётка башни, диагональная сетка)
  DIAGRID: 31,    // стекло в диагональной сетке светлой стали («огурец»)
  ROCK: 32,       // скала: глыбы косыми пластами, трещины — без кладки (горы)
};
// форма части: плоская стена, цилиндр (свет по ширине — колонна, башня), с каннелюрами
export const FORM = { FLAT: 0, CYL: 1, FLUTE: 2 };
const RAMP = [];
RAMP[MAT.ASHLAR] = ramp(mix(S0, BO, 0.2));
RAMP[MAT.RUBBLE] = ramp(mix(mix(S0, SEP, 0.4), NI, 0.1));
RAMP[MAT.BRICK] = ramp(mix(SEP, KV, 0.28), mix(BO, KV, 0.15));
RAMP[MAT.PLASTER] = ramp(mix(S0, BO, 0.34));
RAMP[MAT.LOGS] = ramp(mix(mix(SEP, KV, 0.08), NI, 0.05), mix(BO, SEP, 0.2));
RAMP[MAT.BOARD] = ramp(mix(SEP, NI, 0.2), mix(BO, SEP, 0.25));
RAMP[MAT.THATCH] = ramp(mix(SEP, BO, 0.3), mix(BO, SEP, 0.1));
RAMP[MAT.TILE] = ramp(mix(KV, SEP, 0.62), mix(BO, KV, 0.2));
RAMP[MAT.CONCRETE] = ramp(mix(AS, NI, 0.42));
RAMP[MAT.GLASS] = ramp(mix(NI, AS, 0.12), AS);
RAMP[MAT.IRON] = ramp(mix(AS, NI, 0.48));
RAMP[MAT.DARK] = [NI, NI, mix(NI, SEP, 0.35), mix(NI, SEP, 0.55), mix(NI, SEP, 0.7), mix(NI, SEP, 0.8)];
RAMP[MAT.MUD] = ramp(mix(mix(SEP, BO, 0.2), KV, 0.06), mix(BO, SEP, 0.15));   // сырец: к охре, светлее обожжённого
RAMP[MAT.SNOW] = ramp(mix(BO, AS, 0.25));
RAMP[MAT.MOSS] = ramp(MG, mix(MG, BO, 0.4));
RAMP[MAT.BASALT] = ramp(mix(NI, S0, 0.55));
RAMP[MAT.TIMBER] = ramp(mix(SEP, NI, 0.35), mix(BO, SEP, 0.3));
RAMP[MAT.MARBLE] = ramp(mix(BO, S0, 0.42));
RAMP[MAT.GRANITE] = ramp(mix(mix(AS, KV, 0.16), NI, 0.3));
RAMP[MAT.SANDSTONE] = ramp(mix(mix(SEP, BO, 0.42), KV, 0.05));
RAMP[MAT.RAMMED] = ramp(mix(mix(SEP, BO, 0.3), S0, 0.25));
RAMP[MAT.WATTLE] = ramp(mix(SEP, NI, 0.1), mix(BO, SEP, 0.2));
RAMP[MAT.DRYSTONE] = ramp(mix(mix(S0, BO, 0.24), MG, 0.14));
RAMP[MAT.BAKED] = ramp(mix(mix(SEP, BO, 0.38), KV, 0.08), mix(BO, KV, 0.08));
RAMP[MAT.SAND] = ramp(mix(mix(SEP, BO, 0.45), KV, 0.04));
RAMP[MAT.FELT] = ramp(mix(mix(SEP, AS, 0.35), BO, 0.12), mix(BO, SEP, 0.15));
RAMP[MAT.CURTAIN] = ramp(mix(AS, NI, 0.34), mix(BO, AS, 0.2));
RAMP[MAT.TINT] = ramp(mix(MG, NI, 0.22), mix(MG, BO, 0.6));
RAMP[MAT.PANEL] = ramp(mix(mix(AS, NI, 0.36), BO, 0.06));
RAMP[MAT.STEEL] = ramp(mix(BO, AS, 0.55));
RAMP[MAT.DIAGRID] = ramp(mix(AS, NI, 0.5), mix(BO, AS, 0.3));
RAMP[MAT.ROCK] = ramp(mix(mix(NI, S0, 0.62), SEP, 0.12));
const RIM = AS;                                   // кромка справа — пеплом (канон)

function hh(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// фактура: сдвиг ступени тона в точке (x, y) материала; s — зерно постройки
function tex(mat, x, y, s) {
  switch (mat) {
    case MAT.RAMMED: {
      if (y % 3 === 2) return -1;                                       // шов слоя
      if (y % 12 === 7 && x % 9 === 4) return -2;                      // дыра от бруса опалубки
      return hh(x >> 2, Math.floor(y / 3), s + 25) < 0.15 ? -1 : 0;
    }
    case MAT.WATTLE: {                                                  // прут идёт перед колом, потом за ним
      const row = Math.floor(y / 3), o = (row & 1) * 3;
      if (x % 6 === 0) return -2;                                       // кол
      if (y % 3 === 2) return -1;
      return (x + o) % 6 < 3 ? 1 : -1;
    }
    case MAT.DRYSTONE: {                                                // ряд — плита в точку, длина 3–7, шов вразбежку
      const k = Math.floor((x + Math.floor(hh(y, 0, s) * 7)) / 5);
      if (y % 2 === 1) return hh(x >> 1, y, s + 33) < 0.5 ? -2 : -1;
      if (hh(k, y, s + 35) < 0.18 && (x + Math.floor(hh(y, 0, s) * 7)) % 5 === 0) return -2;
      const v = hh(k, y, s + 37);
      return v < 0.25 ? -1 : v > 0.85 ? 1 : 0;
    }
    case MAT.SAND: return (x + 2 * y) % 9 === 0 ? -1 : (hh(x, y, s + 29) < 0.04 ? -1 : 0);
    case MAT.FELT: { const v = hh(x >> 1, y >> 1, s + 27); return v < 0.12 ? -1 : v > 0.94 ? 1 : 0; }
    case MAT.SANDSTONE:
    case MAT.ASHLAR: {
      const c = Math.floor(y / 5), o = (c & 1) * 4, b = Math.floor((x + o) / 9);
      if (y % 5 === 4) return -1;
      if ((x + o) % 9 === 8) return hh(b, c, s + 2) < 0.6 ? -1 : 0;
      const v = hh(b, c, s);
      return v < 0.18 ? -1 : v > 0.9 ? 1 : (hh(x, y, s + 3) < 0.05 ? -1 : 0);
    }
    case MAT.RUBBLE: {
      const row = Math.floor(y / 4), o = (row & 1) * 2 + Math.floor(hh(row, 0, s) * 3), cell = Math.floor((x + o) / 5);
      if (y % 4 === 0 || (x + o) % 5 === 0) return hh(x, y, s) < 0.5 ? -2 : -1;
      const v = hh(cell, row, s + 1);
      return v < 0.3 ? -1 : v > 0.75 ? 1 : 0;
    }
    case MAT.BAKED:
    case MAT.BRICK: {
      const c = Math.floor(y / 3), o = (c & 1) * 3;
      if (y % 3 === 2 || (x + o) % 6 === 5) return 1;                 // раствор светлее кирпича
      const v = hh(Math.floor((x + o) / 6), c, s);
      return v < 0.2 ? -1 : 0;
    }
    case MAT.PLASTER: { const v = hh(x, y, s + 5); return v < 0.06 ? -1 : v > 0.97 ? 1 : 0; }
    case MAT.LOGS: return y % 3 === 2 ? -2 : y % 3 === 0 ? 1 : 0;
    case MAT.BOARD: return x % 3 === 2 ? -1 : (hh(x, Math.floor(y / 4), s) < 0.1 ? -1 : 0);
    case MAT.THATCH: { const v = hh(x, Math.floor(y / 2), s + 7); return v < 0.25 ? -1 : v > 0.85 ? 1 : 0; }
    case MAT.TILE: return y % 3 === 2 ? -2 : (x + Math.floor(y / 3) * 2) % 4 === 0 ? 1 : 0;
    case MAT.CONCRETE: {
      if (x % 8 === 3 && y % 8 === 3) return -2;                       // стяжные отверстия опалубки
      if (y % 4 === 0) return -1;
      return hh(x, y, s + 9) < 0.05 ? -1 : 0;
    }
    case MAT.GLASS: return ((x + Math.floor(y * 0.6)) % 23 + 23) % 23 < 2 ? 3 : 0;   // полоса неба наискось
    case MAT.IRON: return x % 2 ? 1 : -1;
    case MAT.CURTAIN: {
      if (x % 3 === 2) return 1;                                        // стальное ребро ловит свет
      if (((x + Math.floor(y * 0.6)) % 23 + 23) % 23 === 0) return 1;  // полоса неба наискось
      return y % 8 === 7 && hh(x >> 2, y >> 3, s + 39) < 0.5 ? -1 : 0;  // пояс техэтажа местами
    }
    case MAT.TINT: {
      if (y % 4 === 3) return -1;                                       // пояс этажа
      if (((x + Math.floor(y * 0.6)) % 19 + 19) % 19 === 0) return 1;  // полоса неба наискось
      return x % 4 === 0 ? 1 : 0;                                       // стойки витража
    }
    case MAT.PANEL: {
      if (x % 8 === 7) return -1;                                       // вертикальный стык панелей
      const v = hh(x >> 3, y, s + 41);
      return v < 0.05 ? -1 : 0;
    }
    case MAT.STEEL: return hh(x, y, s + 43) < 0.03 ? -1 : 0;
    case MAT.ROCK: {                                                    // глыба — косой параллелограмм, ряды вразбежку
      const r = Math.floor(y / 3), u = x + (y >> 1) + Math.floor(hh(r, 0, s + 45) * 5), k = Math.floor(u / 5);
      if (u % 5 === 0 && hh(k, r, s + 47) < 0.45) return -2;          // трещина
      if (y % 3 === 0 && hh(k, r, s + 49) < 0.3) return 1;            // кромка пласта к свету
      const v = hh(k, r, s + 51);
      return v < 0.28 ? -1 : v > 0.86 ? 1 : 0;
    }
    case MAT.DIAGRID: {
      if ((x + y) % 6 === 0 || ((x - y) % 6 + 6) % 6 === 0) return 2;  // сетка стали
      return ((x + Math.floor(y * 0.6)) % 23 + 23) % 23 < 2 ? 1 : 0;
    }
    case MAT.DARK: return 0;
    case MAT.MUD: {
      const c = Math.floor(y / 4), o = (c & 1) * 4;
      if (y % 4 === 3 || (x + o) % 8 === 7) return -1;
      return hh(Math.floor((x + o) / 8), c, s) < 0.25 ? -1 : 0;
    }
    case MAT.SNOW: return hh(x, y, s) < 0.08 ? -1 : 0;
    case MAT.MOSS: { const v = hh(x, y, s + 11); return v < 0.3 ? -1 : v > 0.8 ? 1 : 0; }
    case MAT.BASALT: return hh(Math.floor(x / 3), Math.floor(y / 3), s) < 0.25 ? -1 : 0;
    case MAT.TIMBER: return hh(x, y, s + 13) < 0.04 ? -1 : 0;
    case MAT.GRANITE: { const v = hh(x, y, s + 19); return v < 0.14 ? -1 : v > 0.93 ? 1 : 0; }
    case MAT.MARBLE: return y % 9 === 8 && hh(Math.floor(x / 7), y, s) < 0.5 ? -1 : (hh(x + y, y, s + 17) < 0.03 ? -1 : 0);
    default: return 0;
  }
}

// ── план постройки: w×h, (0,0) — левый верх рамки, низ — земля ──
export function plan(w, h) {
  const m = new Uint8Array(w * h), part = new Uint16Array(w * h), info = [null];
  let pid = 0;
  const put = (x, y, mat, p) => { if (x >= 0 && y >= 0 && x < w && y < h) { m[y * w + x] = mat; part[y * w + x] = p; } };
  const P = {
    w, h, m, part, info,
    at: (x, y) => (x >= 0 && y >= 0 && x < w && y < h) ? m[y * w + x] : 0,
    partAt: (x, y) => (x >= 0 && y >= 0 && x < w && y < h) ? part[y * w + x] : 0,
    // прямоугольник материала — новая часть (своя кромка света и тени)
    box(x, y, ww, hh2, mat, form = 0) { const p = ++pid; info[p] = { x0: x, x1: x + ww - 1, form }; for (let j = 0; j < hh2; j++) for (let i = 0; i < ww; i++) put(x + i, y + j, mat, p); return P; },
    // клин: строки от yTop до yBot, ширина растёт от wTop до wBot; кровля, щипец, пирамида
    wedge(cx, yTop, yBot, wTop, wBot, mat) {
      const p = ++pid, n = Math.max(1, yBot - yTop);
      info[p] = { x0: Math.round(cx - Math.max(wTop, wBot) / 2), x1: Math.round(cx + Math.max(wTop, wBot) / 2), form: 0 };
      for (let y = yTop; y <= yBot; y++) {
        const ww = Math.round(wTop + (wBot - wTop) * (y - yTop) / n), x0 = Math.round(cx - ww / 2);
        for (let i = 0; i < ww; i++) put(x0 + i, y, mat, p);
      }
      return P;
    },
    // трапеция: левый и правый край строки идут от (xl0, xr0) внизу к (xl1, xr1) вверху — башня с откосом
    trap(xl0, xr0, xl1, xr1, yTop, yBot, mat, form = 0) {
      const p = ++pid, n = Math.max(1, yBot - yTop);
      info[p] = { x0: Math.min(xl0, xl1), x1: Math.max(xr0, xr1), form };
      for (let y = yTop; y <= yBot; y++) {
        const k = (yBot - y) / n, xl = Math.round(xl0 + (xl1 - xl0) * k), xr = Math.round(xr0 + (xr1 - xr0) * k);
        for (let x = xl; x <= xr; x++) put(x, y, mat, p);
      }
      return P;
    },
    // валун: скруглённый верх, плоский низ (камень стоит в земле)
    round(cx, yTop, yBot, ww, mat) {
      const p = ++pid, hgt = Math.max(1, yBot - yTop + 1);
      info[p] = { x0: Math.round(cx - ww / 2), x1: Math.round(cx + ww / 2), form: 1 };
      for (let y = yTop; y <= yBot; y++) {
        const k = Math.min(1, (y - yTop + 0.5) / Math.max(1, Math.min(hgt, ww) * 0.6)), half = ww / 2 * Math.sqrt(1 - (1 - k) * (1 - k));
        for (let x = Math.round(cx - half); x < Math.round(cx + half); x++) put(x, y, mat, p);
      }
      return P;
    },
    // проём: та же часть, что и стена (кромки — внутри проёма), низ — подоконник светлее
    cut(x, y, ww, hh2, mat = MAT.DARK) { const p = ++pid; info[p] = { x0: x, x1: x + ww - 1, form: 0 }; for (let j = 0; j < hh2; j++) for (let i = 0; i < ww; i++) put(x + i, y + j, mat, p); return P; },
    // многоугольник [[x, y], …] одной частью: скала, конус кровли, курган, купол
    poly(pts, mat, form = 0) {
      const p = ++pid, xs = pts.map(v => v[0]), ys = pts.map(v => v[1]);
      info[p] = { x0: Math.round(Math.min(...xs)), x1: Math.round(Math.max(...xs)), form };
      for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
        const yc = y + 0.5, cr = [];
        for (let i = 0; i < pts.length; i++) {
          const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
          if ((ay <= yc) !== (by <= yc)) cr.push(ax + (yc - ay) / (by - ay) * (bx - ax));
        }
        cr.sort((u, v) => u - v);
        for (let k = 0; k + 1 < cr.length; k += 2) for (let x = Math.round(cr[k]); x < Math.round(cr[k + 1]); x++) put(x, y, mat, p);
      }
      return P;
    },
    clear(x, y, ww, hh2) { for (let j = 0; j < hh2; j++) for (let i = 0; i < ww; i++) put(x + i, y + j, 0, 0); return P; },
    // последняя часть — грань в тени (боковая сторона объёма, повёрнутая от света): тон ниже на k
    shade(k = 1) { if (info[pid]) info[pid].dim = k; return P; },
  };
  return P;
}

// ── краска: свет по соседям, фактура, износ ──
// o: { seed, snow: 0..1, moss: 0..1, soot: [[x,y,w,h]], drips: [[x,y,len]], cracks: n, chip: 0..1, ao: 2 }
export function paint(ctx, X0, Y0, P, o = {}) {
  const { w, h, m } = P, s = o.seed || 0;
  const adj = new Int8Array(w * h), over = new Uint8Array(w * h);
  const top = (x, y) => P.at(x, y - 1) === 0;
  // износ: копоть языками вверх от проёма
  for (const [sx, sy, sw, sl] of o.soot || []) for (let i = 0; i < sw; i++) {
    const len = Math.round(sl * (0.5 + 0.5 * Math.sin((i + 0.5) / sw * Math.PI)) * (0.7 + 0.3 * hh(i, sx, s)));
    for (let k = 0; k < len; k++) { const x = sx + i, y = sy - k; if (x >= 0 && y >= 0 && x < w && y < h && m[y * w + x] && m[y * w + x] !== MAT.DARK) adj[y * w + x] -= k < len * 0.5 ? 2 : 1; }
  }
  for (const [dx, dy, dl] of o.drips || []) for (let k = 0; k < dl; k++) if (dy + k < h && m[(dy + k) * w + dx]) adj[(dy + k) * w + dx] -= 1;
  for (let n = 0; n < (o.cracks || 0); n++) {                      // трещина — от верхней кромки вниз, вбок по шву
    let x = Math.floor(hh(n, 1, s) * w), y = 0;
    while (y < h && !m[y * w + x]) y++;
    for (let k = 0, L = 6 + Math.floor(hh(n, 2, s) * 12); k < L && y < h; k++, y++) {
      if (m[y * w + x] && m[y * w + x] !== MAT.DARK) adj[y * w + x] -= 2;
      x += hh(n, k, s + 1) < 0.3 ? -1 : hh(n, k, s + 2) < 0.3 ? 1 : 0;
      if (x < 0 || x >= w) break;
    }
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, mat = m[i];
    if (!mat || mat === MAT.DARK || mat === MAT.GLASS) continue;
    if (o.snow && top(x, y) && hh(x, y, s + 21) < o.snow) { over[i] = MAT.SNOW; if (y + 1 < h && m[i + w] && hh(x, y, s + 22) < o.snow * 0.6) over[i + w] = MAT.SNOW; }
    else if (o.moss && (top(x, y) || y >= h - 3) && hh(x, y, s + 23) < o.moss) over[i] = MAT.MOSS;
  }
  const chip = (x, y) => o.chip && hh(x, y, s + 31) < o.chip && (top(x, y) || P.at(x + 1, y) === 0 || P.at(x - 1, y) === 0);
  const ao = o.ao ?? 2;
  for (let y = 0; y < h; y++) {
    let runC = null, runX = 0;
    for (let x = 0; x <= w; x++) {
      let col = null;
      if (x < w) {
        const i = y * w + x, mat0 = m[i];
        if (mat0 && !chip(x, y)) {
          const mat = over[i] || mat0, pid = P.part[i];
          let st = 2 + tex(mat, x, y, s) + adj[i];
          const L = P.at(x - 1, y), R = P.at(x + 1, y), U = P.at(x, y - 1);
          if (mat0 === MAT.DARK) st = (U !== MAT.DARK ? 0 : 1) + (P.at(x, y + 1) !== MAT.DARK ? 2 : 0);   // у притолоки темнее, низ — отсвет порога
          else if (!U || (P.partAt(x, y - 1) !== pid && U !== MAT.DARK)) st += 2;            // верх — к свету
          else if (!L || P.partAt(x - 1, y) !== pid) st += 1;                               // слева — к свету
          else if (P.partAt(x + 1, y) !== pid && R) st -= 1;                                // шов справа — в тень
          const f = P.info[pid];
          if (f && f.dim) st -= f.dim;
          if (f && f.form && mat0 !== MAT.DARK) {                                            // цилиндр: свет по ширине
            const k = (x - f.x0) / Math.max(1, f.x1 - f.x0);
            st += k < 0.3 ? 1 : k > 0.72 ? -1 : 0;
            if (f.form === FORM.FLUTE && k > 0.15 && k < 0.85 && (x - f.x0) % 2 === 1) st -= 1;   // каннелюры
          }
          if (y >= h - ao && mat0 !== MAT.DARK) st -= 1;                                    // у земли — темнее
          col = !R && mat0 !== MAT.DARK && mat0 !== MAT.GLASS ? RIM : RAMP[mat][Math.max(0, Math.min(5, st))];
        }
      }
      if (col !== runC) {
        if (runC) { ctx.fillStyle = runC; ctx.fillRect(X0 + runX, Y0 + y, x - runX, 1); }
        runC = col; runX = x;
      }
    }
  }
}

// ── один вид на набор: план строится раз, рисуется в рамку вида (x — середина, gy — земля) ──
export function kitKind(w, h, build, opt = {}) {
  let P = null;
  const draw = (ctx, x, gy) => {
    if (!P) { P = plan(w, h); build(P, MAT); }
    paint(ctx, Math.round(x) - (w >> 1), Math.round(gy) - h, P, opt);
  };
  draw.static = true;                            // неподвижен: запекание не пробует (render/archbake.js)
  return draw;
}

// тело — набором и неподвижно (запекается); живое — огонь, пар, подвес — поверх каждый кадр
// (render/archbake.js: draw.body запекается, draw.live рисуется сам)
export function split(body, live) {
  const d = (c, X, G, t) => { body(c, X, G); live(c, X, G, t); };
  body.static = true; d.body = body; d.live = live;
  return d;
}
// силуэт резьбой: точки «.» строки вынимаются из плана (слон в капители, завиток, колесо)
export function carve(P, x0, y0, rows) {
  rows.forEach((s, j) => { for (let i = 0; i < s.length; i++) if (s[i] === '.') P.clear(x0 + i, y0 + j, 1, 1); });
}

// ступень тона материала (0 — глубь … 5 — блик): для рисунка поверх набора теми же красками
export const tone = (mat, st) => RAMP[mat][st];
export const _RAMP = RAMP;
