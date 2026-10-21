// ═══════════════════════════════════════
// ИЗНАНКА — отдельная карта под городком (решение автора: «отдельная
// карта»; проект — weave/UNDERGROUND.md). Туннели — по образцу Boring
// Company: прямые круглые выработки, кольца обделки, ровное полотно, по
// которому ездили машины, мёртвые светодиоды по своду. Линия сшивает
// комнаты под спусками городка — от «братишки» под Пропастью до криосклепа
// «WD». Вход — пасхалка, не кнопка: спуск открывается повторным
// «использовать» после сцены места. Подъём — по лестнице своей комнаты,
// обычно далеко от того места, где спустился: тоннели сшивают несмежное.
// Свет — уголёк странника: под землёй он тускнеет (не гаснет), в
// криосклепе — вдвое быстрее и без тепла.
// Здесь — план (трубы, комнаты, вещи), где можно стоять, путь по клику,
// состояние; рисунок — render/underside.js, тексты — content/underside.js.
// ═══════════════════════════════════════
import { UNDER_TEXT } from '../content/underside.js';

export const UW = 2400, UH = 1100;            // карта, точки
// труба Boring: пол с запада на восток высотой FH или с севера на юг шириной
// FW; за полом — дальняя половина трубы (WH), спереди — срез обделки (LIP);
// у трубы с севера на юг — боковые стенки по SW; кольцо обделки — RING точек
export const T = { FH: 30, WH: 26, LIP: 5, FW: 30, SW: 8, RING: 20 };

// ── трубы ──
// концы трубы с севера на юг: corner — поворот (свод линии закрывает верх),
// open — выходит в пол комнаты или линии, portal — входит в стену круглым
// проёмом (стена хозяина — над проёмом), dead — тупик: там стоит щит
export const TUBES = [
  { id: 'line', ew: true, x0: 190, x1: 2080, y0: 450 },
  { id: 'west', ns: true, x0: 190, y0: 450, y1: 830, top: 'corner', bot: 'portal', outer: 'left' },
  { id: 'cryptd', ns: true, x0: 300, y0: 350, y1: 450, top: 'open', bot: 'portal' },
  { id: 'based', ns: true, x0: 1200, y0: 480, y1: 780, top: 'open', bot: 'portal' },
  { id: 'celld', ns: true, x0: 2050, y0: 450, y1: 640, top: 'corner', bot: 'portal', outer: 'right' },
  // забой: проходка встала — туннель кончается машиной (щит «Годо»)
  { id: 'godot', ns: true, x0: 1340, y0: 250, y1: 450, top: 'dead', bot: 'portal' },
  { id: 'onkalod', ns: true, x0: 1600, y0: 480, y1: 700, top: 'open', bot: 'portal' },
  { id: 'kolad', ns: true, x0: 1055, y0: 300, y1: 450, top: 'open', bot: 'portal' },
  { id: 'bunkerd', ns: true, x0: 640, y0: 480, y1: 720, top: 'open', bot: 'portal' },
];

// ── комнаты ── (пол x0..x1 × y0..y1 или многоугольник по часовой; wh — стена)
export const ROOMS = [
  { id: 'crypt', name: 'Крипта, девятый ярус', x0: 180, y0: 250, x1: 440, y1: 350, wh: 46, mat: 'lime', surf: 'ground' },
  { id: 'guard', name: 'Гауптвахта', x0: 140, y0: 830, x1: 330, y1: 900, wh: 38, mat: 'army', surf: 'ground' },
  // углов — пять (канон): пол — пятиугольник, вода по пояс
  { id: 'base', name: 'Затопленный подвал', poly: [[1110, 780], [1300, 780], [1330, 858], [1205, 912], [1080, 858]], wh: 38, mat: 'wet', surf: 'water' },
  { id: 'cellar', name: 'Подвал «Вавилона»', x0: 1960, y0: 640, x1: 2220, y1: 730, wh: 40, mat: 'brick', surf: 'ground' },
  { id: 'wd', name: 'Криосклеп «WD»', x0: 760, y0: 248, x1: 900, y1: 336, wh: 40, mat: 'frost', surf: 'snow' },
  // станция Loop под стоянкой «Вавилона»: зал поверх линии, платформа на одну машину
  { id: 'station', name: 'Станция Loop «Вавилон»', x0: 1760, y0: 400, x1: 1960, y1: 500, wh: 44, mat: 'loop', surf: 'path' },
  // Онкало: зал в граните, посередине — шахта, ход спиралью вниз
  { id: 'onkalo', name: 'Онкало', x0: 1480, y0: 700, x1: 1780, y1: 890, wh: 44, mat: 'granite', surf: 'ground' },
  // Кольская сверхглубокая: буровой цех, устье под стальной крышкой
  { id: 'kola', name: 'Кольская сверхглубокая', x0: 980, y0: 200, x1: 1160, y1: 300, wh: 40, mat: 'drill', surf: 'ground' },
  // бункер на всякий случай: квартира в бывшей ракетной шахте, пятнадцатый этаж вниз
  { id: 'bunker', name: 'Бункер на всякий случай', x0: 520, y0: 720, x1: 820, y1: 850, wh: 44, mat: 'condo', surf: 'ground' },
];
// провалы в полу — встать нельзя (шахта Онкало)
export const HOLES = [{ x: 1630, y: 800, r: 60 }];
for (const R of ROOMS) if (R.poly) {
  R.x0 = Math.min(...R.poly.map(p => p[0])); R.x1 = Math.max(...R.poly.map(p => p[0]));
  R.y0 = Math.min(...R.poly.map(p => p[1])); R.y1 = Math.max(...R.poly.map(p => p[1]));
}
// холодная жила (канон U7: кабельный коллектор) — от крипты к криосклепу
export const VEIN = { id: 'vein', x0: 440, x1: 760, y0: 282, fh: 24, wh: 22 };

// круглые проёмы: низ трубы с севера на юг входит в стену хозяина —
// комнаты или линии (тогда проём — в дальней половине трубы)
export const PORTALS = TUBES.filter(tb => tb.bot === 'portal').map(tb => {
  const host = ROOMS.find(R => tb.y1 === R.y0 && tb.x0 >= R.x0 && tb.x0 + T.FW <= R.x1)
    || TUBES.find(L => L.ew && L.y0 === tb.y1);
  return { tube: tb, host, cx: tb.x0 + T.FW / 2, yb: tb.y1, R: T.FW / 2 + T.SW, H: host.wh || T.WH };
});

// ── вещи ── (рамка x,y,w,h — для клика; at — где встать ногами; wall — на стене)
const TH = [
  // подвал «Вавилона»
  { id: 'u_plaque', room: 'cellar', wall: true, x: 2090, y: 606, w: 16, h: 12, at: [2098, 648] },
  { id: 'u_chalk', room: 'cellar', wall: true, x: 1966, y: 604, w: 70, h: 30, at: [2002, 648] },
  { id: 'u_wallet', room: 'cellar', wall: true, x: 2110, y: 606, w: 44, h: 26, at: [2132, 648] },
  { id: 'u_up_pizzeria', room: 'cellar', wall: true, stair: 'wood', steps: 13, x: 2174, y: 600, w: 32, h: 40, at: [2190, 648], up: 'pizzeria' },
  { id: 'u_planes', room: 'cellar', x: 1966, y: 700, w: 40, h: 26, at: [2018, 722], solid: [1966, 708, 2006, 728] },
  // крипта
  { id: 'u_tiers', room: 'crypt', wall: true, x: 296, y: 216, w: 38, h: 20, at: [315, 256] },
  { id: 'u_up_church', room: 'crypt', wall: true, stair: 'door', steps: 9, x: 196, y: 208, w: 28, h: 42, at: [210, 256], up: 'church' },
  { id: 'u_up_crypt', room: 'crypt', wall: true, stair: 'stone', steps: 9, x: 398, y: 208, w: 28, h: 42, at: [412, 256], up: 'crypt' },
  { id: 'u_chests', room: 'crypt', x: 340, y: 280, w: 56, h: 28, at: [368, 318], solid: [340, 298, 396, 308] },
  // гауптвахта
  { id: 'u_door_cell', room: 'guard', wall: true, x: 240, y: 792, w: 28, h: 38, at: [254, 838] },
  { id: 'u_pot', room: 'guard', x: 266, y: 830, w: 14, h: 12, at: [273, 852] },
  { id: 'u_up_pit', room: 'guard', wall: true, stair: 'rock', steps: 0, x: 294, y: 792, w: 30, h: 38, at: [309, 838], up: 'pit' },
  // затопленный подвал
  { id: 'u_up_basement', room: 'base', wall: true, stair: 'concrete', steps: 0, x: 1122, y: 742, w: 30, h: 38, at: [1137, 790], up: 'basement' },
  { id: 'u_door_wood', room: 'base', wall: true, x: 1262, y: 746, w: 28, h: 34, at: [1276, 790] },
  { id: 'u_graffiti', room: 'base', wall: true, x: 1154, y: 748, w: 38, h: 26, at: [1172, 790] },
  { id: 'u_water', room: 'base', x: 1188, y: 846, w: 34, h: 14, at: [1205, 868] },
  // холодная жила и криосклеп
  { id: 'u_frost', room: 'vein', wall: true, x: 616, y: 262, w: 68, h: 18, at: [650, 294] },
  { id: 'u_frost_line', room: 'wd', wall: true, x: 766, y: 216, w: 38, h: 16, at: [786, 256] },
  { id: 'u_meter', room: 'wd', wall: true, x: 860, y: 212, w: 22, h: 28, at: [870, 256] },
  { id: 'u_capsule', room: 'wd', x: 808, y: 262, w: 52, h: 32, at: [834, 306], solid: [808, 276, 860, 296] },
  // станция Loop: машина на полотне (по глубине — за ней платформа), табло на стене
  { id: 'u_car', room: 'station', x: 1814, y: 424, w: 76, h: 56, at: [1850, 488], solid: [1818, 446, 1884, 471] },
  { id: 'u_board', room: 'station', wall: true, x: 1880, y: 356, w: 60, h: 34, at: [1910, 410] },
  // Онкало: шахта посреди зала (запекается) и плита с надписью на стене
  { id: 'u_spiral', room: 'onkalo', wall: true, x: 1572, y: 742, w: 116, h: 116, at: [1630, 872] },
  { id: 'u_onkalo_sign', room: 'onkalo', wall: true, x: 1658, y: 660, w: 84, h: 40, at: [1700, 712] },
  // Кольская: устье в полу (запекается), магнитофон на табурете — по глубине
  { id: 'u_kola', room: 'kola', wall: true, x: 1058, y: 240, w: 24, h: 24, at: [1070, 274], solid: [1060, 244, 1080, 262] },
  { id: 'u_tape', room: 'kola', x: 1094, y: 234, w: 18, h: 22, at: [1112, 270], solid: [1094, 248, 1110, 256] },
  // бункер: окно-экран и полки с запасами на стене
  { id: 'u_screen', room: 'bunker', wall: true, x: 698, y: 680, w: 84, h: 36, at: [740, 732] },
  { id: 'u_cans', room: 'bunker', wall: true, x: 528, y: 680, w: 76, h: 40, at: [566, 732] },
  // забой: щит стоит в конце штрека, гентри с лентой — на полотне (неподвижен — запекается)
  { id: 'u_godot', room: 'tube', wall: true, x: 1328, y: 156, w: 54, h: 132, at: [1355, 300], solid: [1336, 250, 1374, 288] },
];
// без осмотра, только мешает пройти: вторая группа ларей, диван в бункере
export const SOLIDS = [[236, 298, 292, 308], [716, 780, 774, 792]];

export const THINGS = TH.map(th => {
  const tx = UNDER_TEXT[th.id] || { name: th.id, look: '' };
  const o = { ...th, name: tx.name, look: tx.look, zone: 'under', under: true };
  if (th.up) { o.useAction = 'under_up'; o.useLabel = '<i>↑</i>ПОДНЯТЬСЯ'; }
  if (th.solid) SOLIDS.push(th.solid);
  return o;
});
export const thingById = id => THINGS.find(th => th.id === id);
// где встать у вещи — точка героя (ноги — x+6, y+23)
export function accessOf(th) { return { x: th.at[0] - 6, y: th.at[1] - 23 }; }

// спуски городка: ключ «использовать» → лестница внизу (там и встаёшь)
export const DESCENTS = {
  greenpit: 'u_up_pit',
  basement_door: 'u_up_basement',
  crypt_descend: 'u_up_crypt',
  church_candle: 'u_up_church',
  pizzeria_enter: 'u_up_pizzeria',
};

// ── где можно стоять ── (ноги x, y; запас — на полу плаща у стен)
function inPoly(x, y, P) {
  let inside = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, yi] = P[i], [xj, yj] = P[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function onFloor(x, y) {
  for (const tb of TUBES) {
    if (tb.ew) { if (x >= tb.x0 + 5 && x <= tb.x1 - 5 && y >= tb.y0 + 3 && y <= tb.y0 + T.FH - 2) return true; continue; }
    const top = tb.top === 'corner' || tb.top === 'dead' ? tb.y0 + 3 : tb.y0 - 6, bot = tb.y1 + 6;
    if (x >= tb.x0 + 7 && x <= tb.x0 + T.FW - 7 && y >= top && y <= bot) return true;
  }
  if (x >= VEIN.x0 - 8 && x <= VEIN.x1 + 8 && y >= VEIN.y0 + 3 && y <= VEIN.y0 + VEIN.fh - 2) return true;
  for (const R of ROOMS) {
    if (R.poly) {
      if (inPoly(x - 5, y, R.poly) && inPoly(x + 5, y, R.poly) && inPoly(x, y - 3, R.poly) && inPoly(x, y + 2, R.poly)) return true;
    } else if (x >= R.x0 + 6 && x <= R.x1 - 6 && y >= R.y0 + 3 && y <= R.y1 - 2) return true;
  }
  return false;
}
export function walkable(x, y) {
  if (!onFloor(x, y)) return false;
  for (const h of HOLES) if (Math.hypot(x - h.x, y - h.y) < h.r) return false;
  for (const s of SOLIDS) if (x > s[0] - 5 && x < s[2] + 5 && y > s[1] - 2 && y < s[3] + 2) return false;
  return true;
}

// шаг героя с упором и скольжением вдоль стены (как tryMove наверху)
export function underMove(p, dx, dy) {
  const fx = p.x + 6, fy = p.y + 23;
  if (walkable(fx + dx, fy + dy)) { p.x += dx; p.y += dy; return true; }
  if (Math.abs(dx) > 0.01 && walkable(fx + dx, fy)) { p.x += dx; return true; }
  if (Math.abs(dy) > 0.01 && walkable(fx, fy + dy)) { p.y += dy; return true; }
  return false;
}

// ── где ты: комната, труба, жила; под ногами; холод ──
export function placeAt(x, y) {
  for (const R of ROOMS) {
    if (R.poly ? inPoly(x, y, R.poly) : (x >= R.x0 && x <= R.x1 && y >= R.y0 - 4 && y <= R.y1 + 2)) return R.id;
  }
  if (x >= VEIN.x0 && x <= VEIN.x1 && y >= VEIN.y0 - 4 && y <= VEIN.y0 + VEIN.fh + 2) return 'vein';
  return 'tube';
}
export function surfaceUnder(x, y) {
  const at = placeAt(x, y);
  if (at === 'tube') return 'path';                  // полотно ровное: по нему ездили
  if (at === 'vein') return coldAt(x, y) > 0.5 ? 'snow' : 'ground';
  return ROOMS.find(R => R.id === at).surf;
}
// холод 0..1: жила стынет к криосклепу, в криосклепе — весь
export function coldAt(x, y) {
  const at = placeAt(x, y);
  if (at === 'wd') return 1;
  if (at === 'vein') return Math.max(0, Math.min(0.7, (x - 520) / (VEIN.x1 - 520) * 0.7));
  return 0;
}
export const inWater = (x, y) => placeAt(x, y) === 'base';

// ── путь по клику: сетка по 4 точки, обход в ширину, прямые без лишних углов ──
const C = 4, GW = Math.ceil(UW / C), GH = Math.ceil(UH / C);
let grid = null, prev = null, stamp = null, mark = 0, queue = null;
function buildGrid() {
  grid = new Uint8Array(GW * GH);
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) grid[j * GW + i] = walkable(i * C + 2, j * C + 2) ? 1 : 0;
  prev = new Int32Array(GW * GH); stamp = new Uint32Array(GW * GH); queue = new Int32Array(GW * GH);
}
const cellOf = (x, y) => { const i = Math.floor(x / C), j = Math.floor(y / C); return i < 0 || j < 0 || i >= GW || j >= GH ? -1 : j * GW + i; };
function nearestCell(x, y, rmax = 40) {
  const c = cellOf(x, y);
  if (c >= 0 && grid[c]) return c;
  const i0 = Math.floor(x / C), j0 = Math.floor(y / C);
  for (let r = 1; r <= rmax; r++) {
    let best = -1, bd = 1e9;
    for (let j = j0 - r; j <= j0 + r; j++) for (let i = i0 - r; i <= i0 + r; i++) {
      if (Math.max(Math.abs(i - i0), Math.abs(j - j0)) !== r || i < 0 || j < 0 || i >= GW || j >= GH || !grid[j * GW + i]) continue;
      const d = (i - i0) ** 2 + (j - j0) ** 2;
      if (d < bd) { bd = d; best = j * GW + i; }
    }
    if (best >= 0) return best;
  }
  return -1;
}
function clearLine(ax, ay, bx, by) {
  const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 2);
  for (let k = 1; k < n; k++) if (!walkable(ax + (bx - ax) * k / n, ay + (by - ay) * k / n)) return false;
  return true;
}
// от ног (fx, fy) к точке (gx, gy): точки поворотов для ног; null — не дойти
export function pathTo(fx, fy, gx, gy) {
  if (!grid) buildGrid();
  const s = nearestCell(fx, fy, 4), g = nearestCell(gx, gy);
  if (s < 0 || g < 0) return null;
  mark++;
  let qh = 0, qt = 0;
  queue[qt++] = s; stamp[s] = mark; prev[s] = -1;
  while (qh < qt) {
    const c = queue[qh++];
    if (c === g) break;
    const i = c % GW, j = (c - i) / GW;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue;
      const ni = i + di, nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= GW || nj >= GH) continue;
      const n = nj * GW + ni;
      if (!grid[n] || stamp[n] === mark) continue;
      if (di && dj && (!grid[j * GW + ni] || !grid[nj * GW + i])) continue;   // угол не срезать
      stamp[n] = mark; prev[n] = c; queue[qt++] = n;
    }
  }
  if (stamp[g] !== mark) return null;
  const cells = [];
  for (let c = g; c >= 0; c = prev[c]) cells.push(c);
  cells.reverse();
  const pts = cells.map(c => ({ x: (c % GW) * C + 2, y: Math.floor(c / GW) * C + 2 }));
  const end = walkable(gx, gy) ? { x: gx, y: gy } : pts[pts.length - 1];
  pts[pts.length - 1] = end;
  // прямые: от поворота — к самой дальней видимой точке
  const out = [];
  let a = { x: fx, y: fy }, k = 0;
  while (k < pts.length - 1) {
    let j = k + 1;
    while (j + 1 < pts.length && clearLine(a.x, a.y, pts[j + 1].x, pts[j + 1].y)) j++;
    out.push(pts[j]); a = pts[j]; k = j;
  }
  if (!out.length) out.push(end);
  return out;
}

// ── состояние ──
export const under = {
  active: false,
  ret: null,              // точка наверху, где спустился (на карте мира странник — там)
  seen: new Set(),        // сцены, после которых открылся спуск (ключи «использовать»)
  found: new Set(),       // где побывал внизу
  ember: 1,               // уголёк 0..1: тускнеет под землёй, не гаснет
  cold: 0,                // холод у ног 0..1 (плавно)
  steps: 0,               // шагов под землёй (для огонька и пыли)
  // шаг: уголёк тускнеет за четыре минуты (круг света сжимается на четверть, не гаснет); в криосклепе — вдвое быстрее
  step(fx, fy) {
    this.steps++;
    const c = coldAt(fx, fy);
    this.cold += (c - this.cold) * 0.03;
    this.ember = Math.max(0, this.ember - (1 + (c > 0.9 ? 1 : 0)) / (60 * 240));
    const at = placeAt(fx, fy);
    if (at !== 'tube') this.found.add(at);
  },
  enter(retX, retY) {
    this.active = true; this.ret = { x: retX, y: retY }; this.ember = 1; this.cold = 0; this.steps = 0;
  },
  leave() { this.active = false; this.cold = 0; },
  save() { return { seen: [...this.seen], found: [...this.found] }; },
  load(d) {
    if (!d) return;
    (d.seen || []).forEach(k => this.seen.add(k));
    (d.found || []).forEach(k => this.found.add(k));
  },
};

// свет под землёй: уголёк — единственное тёплое (сердцевина), вокруг — круг,
// в котором видно породу; зелёная лампа гауптвахты стоит ровно и не мигает
// (канон «ПЕРЕДАЧА»); в криосклепе тепла нет: огонёк холодный, круг меньше
const EMBER = [226, 138, 58], COLD = [138, 141, 143], FILL = [232, 220, 198], FILL_C = [176, 180, 182];
const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
export function underLights(px, py) {
  const k = under.cold, e = under.ember;
  return [
    { x: px, y: py, r: (40 + 22 * e) * (1 - 0.35 * k), color: mix(EMBER, COLD, k), flicker: 0.1 * (1 - k), intensity: 1.1 - 0.3 * k },
    { x: px, y: py, r: (118 + 42 * e) * (1 - 0.3 * k), color: mix(FILL, FILL_C, k), flicker: 0, intensity: 2.1 },
    { x: 254, y: 797, r: 50, color: [77, 90, 73], flicker: 0, intensity: 1.6 },
    { x: 740, y: 702, r: 64, color: [118, 140, 108], flicker: 0.04, intensity: 1.3 },   // окно-экран бункера: лес светит
  ];
}
export const UNDER_AMBIENT = 0.16;
