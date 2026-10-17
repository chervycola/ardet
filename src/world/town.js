// ═══════════════════════════════════════
// ГОРОДОК ПО КАНОНУ (ART_BIBLE §04, опись сцены): высохшее русло через
// посёлок и деревянный мост над ним. Русло старое: ручей сходил с горы, шёл
// мимо врат и пропадал в лужице «Высохшего русла»; река Гераклита теперь
// начинается у кромки городка (родник) и в городок не заходит — в одну реку
// дважды не войдёшь. Мост — деревянный, место, где стоят подолгу; с него видно
// и замок (render/castle.js), и врата. Рисунок моста — render/townProps.js.
// Здесь же — прочие линии городка, проложенные руками (weave/TOWN.md): тропа к
// кресту, улицы квартала с фундаментами и фонарями, шоссе с эстакадой и
// машинами, рельсы к поезду.
// ═══════════════════════════════════════
import { addLine, onArtery, shapeLine, lines } from './arteries.js';
import { townZoneOf, townWarp, townEdge } from './relief.js';
import { locations } from './locations.js';
import { TOWN, trailPoint } from './disc.js';
import { TOWN_PATHS } from './townPaths.js';

// русло: от горы под вышкой — мимо врат — под мост — в лужицу у «Высохшего русла»
export const BED = [[4706, 3700], [4618, 3716], [4520, 3756], [4468, 3836], [4446, 3926], [4402, 4002], [4288, 4042], [4168, 4058], [4094, 4056]];
// мост поперёк русла: середина, линия земли у ближнего края, полудлина, глубина настила
export const BRIDGE = { x: 4446, gy: 3946, half: 20, deep: 7 };

// тропа к кресту на холме: от костра — между библиотекой и домом №7 — в Мёртвый лес
export const CROSS_PATH = [[3884, 3806], [3846, 3788], [3804, 3764], [3760, 3722], [3742, 3640], [3748, 3560], [3782, 3478], [3830, 3410], [3862, 3348]];

// ── квартал: старые улицы мощёные, брусчатка в руинах (render/etchPaths.js:
// street — главные, lane — переулки). Главная — от западных ворот, где
// кончается тропа запада, мимо крипты — к посёлку; поперёк — улица у церкви,
// от леса к фонтану; переулки — сеткой. Вдоль улиц — фундаменты домов фасадом
// к улице (render/etchTown.js), на иных — огрызок стены, печная труба,
// дверная арка; вдоль главных — мёртвые фонари (render/townProps.js)
export const STREETS = [
  ['road:q-main', [[3146, 3947], [3178, 3952], [3206, 3970], [3236, 3990], [3290, 3996], [3360, 3994], [3430, 3991], [3490, 3989], [3545, 3986]], 'street'],
  ['road:q-church', [[3416, 3504], [3414, 3600], [3417, 3700], [3415, 3800], [3413, 3900], [3415, 3992], [3417, 4080], [3414, 4166], [3416, 4262]], 'street'],
  ['road:q-upper', [[3218, 3734], [3300, 3736], [3415, 3735], [3532, 3733]], 'lane'],
  ['road:q-lower', [[3214, 4166], [3300, 4165], [3414, 4166], [3506, 4164]], 'lane'],
  ['road:q-west', [[3256, 3994], [3255, 4080], [3257, 4165]], 'lane'],
  ['road:q-north', [[3300, 3735], [3299, 3640], [3301, 3526]], 'lane'],
];
// фундамент: x0..x1 × y0..y1; face — сторона фасада (к улице): n, s, w, e;
// door — середина двери по фасаду; ruin — что стоит: wall (участок стены по
// северной стене: x, w), chimney, arch (в двери фасада) или ничего
export const FOUNDATIONS = [];
export const LAMPS = [];                 // мёртвые фонари: { x, gy, v }

function hq(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vq(x, y, s) {                     // плавный шум пятнами — по хешу
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hq(ix, iy, s), b = hq(ix + 1, iy, s), c = hq(ix, iy + 1, s), d = hq(ix + 1, iy + 1, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
export const inQuarter = (x, y) => { const [wx, wy] = townWarp(x, y); return townZoneOf(x + wx, y + wy) === 2 && townEdge(x, y) < -34; };
function buildQuarter(streets) {
  FOUNDATIONS.length = 0; LAMPS.length = 0;
  const LB = locations.map(l => ({ x0: l.x - 10, y0: l.y - 14, x1: l.x + l.w + 10, y1: l.y + l.h + 10 }));
  const inLoc = (x0, y0, x1, y1) => LB.some(b => x0 < b.x1 && x1 > b.x0 && y0 < b.y1 && y1 > b.y0);
  const clear = (x0, y0, x1, y1) => {
    if (inLoc(x0, y0, x1, y1)) return false;
    for (const f of FOUNDATIONS) if (x0 < f.x1 + 7 && x1 > f.x0 - 7 && y0 < f.y1 + 7 && y1 > f.y0 - 7) return false;
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1], [mx, y0], [mx, y1], [x0, my], [x1, my]]) if (!inQuarter(x, y)) return false;
    for (let y = y0; y <= y1 + 3; y += 4) for (let x = x0; x <= x1 + 3; x += 4) if (onArtery(Math.min(x, x1), Math.min(y, y1), 4)) return false;
    return true;
  };
  // дома — вдоль улиц, фасадом к ней; меж ними пустыри (дом снесён до земли)
  let n = 0;
  for (const L of streets) {
    const P = L.pts;
    for (const k of [-1, 1]) {
      for (let i = 4; i < P.length - 4;) {
        const p = P[i], a = P[i - 3], b = P[i + 3], ew = Math.abs(b.x - a.x) > Math.abs(b.y - a.y), h = hq(i, n, 3 + k);
        const W = 24 + Math.round(hq(i, n, 5) * 22), D = 16 + Math.round(hq(i, n, 7) * 14), gap = 4 + Math.round(hq(i, n, 9) * 5);
        if (h < 0.4) { i += 4; continue; }                                  // пустырь
        const off = p.hw + gap;
        const r = ew ? { x0: Math.round(p.x - W / 2), x1: Math.round(p.x + W / 2), y0: Math.round(k < 0 ? p.y - off - D : p.y + off), y1: Math.round(k < 0 ? p.y - off : p.y + off + D), face: k < 0 ? 's' : 'n' }
          : { y0: Math.round(p.y - W / 2), y1: Math.round(p.y + W / 2), x0: Math.round(k < 0 ? p.x - off - D : p.x + off), x1: Math.round(k < 0 ? p.x - off : p.x + off + D), face: k < 0 ? 'e' : 'w' };
        if (!clear(r.x0, r.y0, r.x1, r.y1)) { i += 2; continue; }
        const seed = 101 + n * 17, along = r.face === 'n' || r.face === 's' ? r.x1 - r.x0 : r.y1 - r.y0;
        r.door = Math.round(along * (0.3 + 0.4 * hq(n, 1, 11)));
        r.seed = seed;
        const q = hq(n, 2, 13), fw = r.x1 - r.x0;
        if (q < 0.42) { const w = Math.max(14, Math.round(fw * (0.45 + 0.35 * hq(n, 3, 15)))), left = hq(n, 4, 17) < 0.5; r.ruin = { kind: 'wall', w, x: left ? r.x0 + 1 + w / 2 : r.x1 - 1 - w / 2, gy: r.y0 + 2 }; }
        else if (q < 0.58) r.ruin = { kind: 'chimney', x: hq(n, 5, 19) < 0.5 ? r.x0 + 9 : r.x1 - 9, gy: r.y0 + 4 };
        else if (q < 0.68 && (r.face === 'n' || r.face === 's')) r.ruin = { kind: 'arch', x: r.x0 + r.door, gy: r.face === 's' ? r.y1 : r.y0 + 2 };
        FOUNDATIONS.push(r); n++;
        i += Math.ceil((W + 8 + hq(i, n, 21) * 10) / 6);
      }
    }
  }
  // мёртвые фонари — вдоль главных, через один по обе руки, у бордюра
  for (const L of streets) {
    if (L.pts[0].st !== 'street') continue;
    let side = 1, j = 0;
    for (let s = 24; s < L.pts[L.pts.length - 1].s - 16; s += 70, side = -side, j++) {
      const i = L.pts.findIndex(p => p.s >= s), p = L.pts[i], a = L.pts[Math.max(0, i - 2)], b = L.pts[Math.min(L.pts.length - 1, i + 2)];
      const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, off = p.hw + 3;
      const x = Math.round(p.x - dy / l * off * side), gy = Math.round(p.y + dx / l * off * side);
      if (!inQuarter(x, gy) || onArtery(x, gy, 2) || inLoc(x - 3, gy - 30, x + 3, gy)) continue;
      if (FOUNDATIONS.some(f => x > f.x0 - 4 && x < f.x1 + 4 && gy > f.y0 - 2 && gy < f.y1 + 6)) continue;
      if (LAMPS.some(m => Math.hypot(m.x - x, m.gy - gy) < 40)) continue;
      LAMPS.push({ x, gy, v: Math.floor(hq(j, L.pts.length, 23) * 20) });
    }
  }
}

// ── шоссе: брошенная трасса от восточных ворот через зону — мимо знака «Выход
// в Пустошь» — к посёлку, где асфальт кончается; разметка стёрта, в трещинах
// трава, ямы (render/etchPaths.js: motorway). Над ней — эстакада: северный её
// конец — «Обрушенный мост» (средний пролёт рухнул, над провалом канат, рисунок
// места), дальше пролёты на опорах идут над рельсами и трассой и обрываются
// арматурой (render/arteryProps.js: flyover). Рельсы — от поезда на восток до
// вала, за поездом — тупик. Вдоль обочин — брошенные машины (render/townProps.js)
export const HIGHWAY = [[6156, 3955], [6060, 3950], [5950, 3938], [5820, 3922], [5700, 3908], [5560, 3898], [5420, 3893], [5300, 3893], [5200, 3897], [5100, 3903], [5000, 3908], [4968, 3909]];
export const RAIL = [[5334, 3715], [5480, 3715], [5640, 3715], [5800, 3716], [5950, 3718], [6082, 3720]];
export const BUFFER = { x: 5338, gy: 3718 };            // тупик за поездом
const FLY = [[5530, 3660], [5612, 3684], [5670, 3740], [5748, 3810], [5830, 3884], [5912, 3958], [5980, 4022]];
export const CARS = [];                                  // { x, gy, v, lot } — lot: брошена на стоянке
// стоянка у «Вавилона»: пустота с причиной — асфальт с выцветшей разметкой мест,
// трещины, масляные пятна; ставить здесь больше некому (render/etchTown.js)
export const LOT = { x0: 5180, y0: 4110, x1: 5700, y1: 4255 };
export let flyover = null;

function buildHighway() {
  const hw = addLine('road', 'road:town-highway', HIGHWAY, 'motorway');
  addLine('arc', 'arc:town-rail', RAIL, 'rail');
  // эстакада: опоры через 38 точек — ни одна не на полотне и не на месте
  const LB = locations.map(l => ({ x0: l.x - 4, y0: l.y - 4, x1: l.x + l.w + 4, y1: l.y + l.h + 6 }));
  // опоры — через 38 точек по длине (render/arteryProps.js): подбираю изгиб у
  // моста (где эстакада переходит рельсы) и длину (где трассу), чтобы обе
  // развязки пришлись на середину пролёта
  const at = (S, s) => { let i = 1; while (i < S.length - 1 && S[i].s < s) i++; const a = S[i - 1], b = S[i], t = b.s > a.s ? (s - a.s) / (b.s - a.s) : 0; return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; };
  const fits = P => {
    const S = shapeLine(P), len = S[S.length - 1].s - S[0].s, n = Math.max(1, Math.round(len / 38));
    for (let j = 1; j <= n; j++) {
      const p = at(S, S[0].s + len * j / n);
      if (onArtery(p.x, p.y, 4) || LB.some(b => p.x > b.x0 && p.x < b.x1 && p.y > b.y0 && p.y < b.y1)) return false;
    }
    return true;
  };
  let best = FLY;                                                      // подобрано заранее; перебор — если рельсы или трасса сдвинутся
  const [ex, ey] = FLY[FLY.length - 1], [px, py] = FLY[FLY.length - 2], el = Math.hypot(ex - px, ey - py);
  if (!fits(FLY)) search: for (let r = 0; r <= 24; r += 2) for (const [bx, by] of [[0, r], [0, -r], [r, 0], [-r, 0]]) for (let d = 0; d <= 60; d += 3) for (const sg of [1, -1]) {
    const P = FLY.map(([x, y], i) => i === 1 ? [x + bx, y + by] : i === FLY.length - 1 ? [x + (ex - px) / el * d * sg, y + (ey - py) / el * d * sg] : [x, y]);
    if (fits(P)) { best = P; break search; }
  }
  flyover = addLine('sky', 'sky:town-flyover', best, 'flyover');
  // обрыв: две последние опоры рухнули — пролёт висит консолью, арматура торчит
  const F = flyover.pts, len = F[F.length - 1].s - F[0].s, n = Math.max(1, Math.round(len / 38)), cut = F[0].s + len * (n - 1) / n - 3;
  for (const p of F) p.ok = p.s < cut;
  // машины: вдоль обочин и в кювете, иные брошены прямо на полосе
  const P = hw.pts;
  let j = 0;
  for (let s = 40; s < P[P.length - 1].s - 30; j++) {
    const i = P.findIndex(p => p.s >= s), p = P[i], a = P[Math.max(0, i - 3)], b = P[Math.min(P.length - 1, i + 3)];
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, side = hq(j, 7, 31) < 0.5 ? -1 : 1;
    const off = (hq(j, 7, 33) < 0.25 ? p.hw * 0.3 : p.hw + 3 + hq(j, 7, 35) * 6) * side;
    const x = Math.round(p.x - dy / l * off), gy = Math.round(p.y + dx / l * off);
    s += 70 + hq(j, 7, 37) * 80;
    if (LB.some(q => x > q.x0 - 22 && x < q.x1 + 22 && gy > q.y0 - 4 && gy < q.y1 + 14)) continue;
    if (CARS.some(c => Math.abs(c.x - x) < 44 && Math.abs(c.gy - gy) < 14)) continue;
    if (onArtery(x, gy, 4, hw)) continue;                                // не на рельсах и не под опорой эстакады
    CARS.push({ x, gy, v: Math.floor(hq(j, 9, 39) * 60) });
  }
  // на стоянке — две-три брошенные, вкривь по проезду, не по разметке
  for (let k = 0; k < 3; k++) {
    const x = Math.round(LOT.x0 + 60 + (LOT.x1 - LOT.x0 - 120) * (k + 0.3 * hq(k, 1, 41)) / 3), gy = Math.round(LOT.y0 + 46 + (k % 2) * 52 + hq(k, 2, 43) * 6);
    if (!onArtery(x, gy, 6) && !CARS.some(c => Math.abs(c.x - x) < 44 && Math.abs(c.gy - gy) < 14)) CARS.push({ x, gy, v: Math.floor(hq(k, 3, 45) * 54), lot: true });
  }
}

// ── тропы: где ходят — там тропа. Линии желания: путь по клеткам 8×8 через
// городок; натоптанное (улицы, трасса, прежние тропы) дешевле — тропы сходятся
// в сеть; кочки, лужи, бурьян пятнами дороже — тропа петляет; места,
// фундаменты и вал — препятствия (вал — только в проходах); русло дорого —
// переходят по мосту, а где обход далёк — прямо по дну; в отраву и в лес идут
// неохотно. Сперва стволы — от ворот, квартала и трассы к костру; потом каждое
// место — к ближней тропе в сторону костра, ближние к костру — раньше.
// Тропы запечены (world/townPaths.js) — на старте их не ищут; если места
// сдвинулись и запечённое легло на них, прокладка идёт заново. Пересобрать
// запечённое: TOWN_PATHS_WRITE=1 node test/systems.mjs
export const PATHS = [];                 // { id, from, st } — проложенные тропы
export const PATH_ID = 'road:town-p-';
const PG = 8, NPC = new Set(['pithos', 'lantern1', 'luna_tag', 'captcha', 'campfire']);
const TRUNK = new Set(['settlement']);   // к местам посёлка — тропа, к прочим — тропинка
export function routePaths(bed) {
  const out = [];
  const X0 = TOWN.x0, Y0 = TOWN.y0, W = Math.ceil((TOWN.x1 - X0) / PG), H = Math.ceil((TOWN.y1 - Y0) / PG), N = W * H;
  const cell = (x, y) => Math.max(0, Math.min(H - 1, Math.floor((y - Y0) / PG))) * W + Math.max(0, Math.min(W - 1, Math.floor((x - X0) / PG)));
  const cx = k => X0 + (k % W + 0.5) * PG, cy = k => Y0 + ((k / W | 0) + 0.5) * PG;
  const gates = [...['north', 'south', 'east', 'west'].map(s => trailPoint(s, 0)), { x: TOWN.x1, y: TOWN.y0 }];
  const cost = new Float32Array(N), ZC = [1.2, 1.8, 1, 1.1, 1];
  for (let j = 0; j < H; j += 3) for (let i = 0; i < W; i += 3) {            // зона — по блокам 24×24; кочки, лужи, бурьян — пятнами дороже
    const x = X0 + (i + 1.5) * PG, y = Y0 + (j + 1.5) * PG, [wx, wy] = townWarp(x, y), c = ZC[townZoneOf(x + wx, y + wy)] * (0.7 + 0.7 * vq(x / 72, y / 72, 61));
    for (let jj = j; jj < Math.min(H, j + 3); jj++) for (let ii = i; ii < Math.min(W, i + 3); ii++) cost[jj * W + ii] = c;
  }
  for (let k = 0; k < N; k++) {                                              // вал — только у кромки, в проходах открыт
    const x = cx(k), y = cy(k);
    if (Math.min(x - TOWN.x0, TOWN.x1 - x, y - TOWN.y0, TOWN.y1 - y) > 70) continue;
    if (townEdge(x, y) > -22 && !gates.some(g => (g.x - x) ** 2 + (g.y - y) ** 2 < 46 * 46)) cost[k] = Infinity;
  }
  const fill = (x0, y0, x1, y1, v, keep = false) => {
    const i0 = Math.max(0, Math.floor((x0 - X0) / PG)), i1 = Math.min(W - 1, Math.floor((x1 - X0) / PG));
    const j0 = Math.max(0, Math.floor((y0 - Y0) / PG)), j1 = Math.min(H - 1, Math.floor((y1 - Y0) / PG));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const k = j * W + i; if (!keep || cost[k] !== Infinity) cost[k] = keep ? Math.min(cost[k], v) : v; }
  };
  // натоптанное — дешевле: улицы, трасса, тропа к кресту; рельсы — чуть дороже (свои тропы — не в счёт)
  for (const L of lines) {
    if (!L.town || L.id.startsWith(PATH_ID) || (L.kind !== 'road' && L.kind !== 'arc')) continue;
    for (const p of L.pts) if (p.st) fill(p.x - p.hw, p.y - p.hw, p.x + p.hw, p.y + p.hw, L.kind === 'arc' ? 0.7 : 0.3, true);
  }
  for (const p of bed.pts) fill(p.x - p.hw - 3, p.y - p.hw - 3, p.x + p.hw + 3, p.y + p.hw + 3, 9, false);   // русло
  fill(BRIDGE.x - BRIDGE.half, BRIDGE.gy - 14, BRIDGE.x + BRIDGE.half, BRIDGE.gy + 4, 0.3);                    // мост
  for (const l of locations) fill(l.x - 4, l.y - 4, l.x + l.w + 4, l.y + l.h + 1, Infinity);
  for (const f of FOUNDATIONS) fill(f.x0 - 3, f.y0 - 3, f.x1 + 3, f.y1 + 3, Infinity);
  // поиск: A* к костру — до него или до первой натоптанной клетки по пути;
  // куча — на типизированных массивах; ходы — 8 соседей и конём (углы по 22,5°)
  const dist = new Float64Array(N), prev = new Int32Array(N), seen = new Int32Array(N);   // seen: поколение поиска (+ — открыт, − — закрыт)
  const HK = new Int32Array(N * 16), HF = new Float64Array(N * 16);
  let hn = 0, gen = 0;
  const push = (k, f) => { let i = hn++; while (i > 0) { const p = (i - 1) >> 1; if (HF[p] <= f) break; HK[i] = HK[p]; HF[i] = HF[p]; i = p; } HK[i] = k; HF[i] = f; };
  const pop = () => {
    const k = HK[0], lk = HK[--hn], lf = HF[hn];
    let i = 0;
    for (;;) { let c = 2 * i + 1; if (c >= hn) break; if (c + 1 < hn && HF[c + 1] < HF[c]) c++; if (HF[c] >= lf) break; HK[i] = HK[c]; HF[i] = HF[c]; i = c; }
    HK[i] = lk; HF[i] = lf;
    return k;
  };
  const DI = [1, -1, 0, 0, 1, 1, -1, -1, 2, 2, -2, -2, 1, -1, 1, -1], DJ = [0, 0, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 2, 2, -2, -2];
  const DM = DI.map((di, d) => Math.hypot(di, DJ[d]));
  const search = (s, goal, tx, ty) => {
    gen++; hn = 0;
    const ti = (tx - X0) / PG - 0.5, tj = (ty - Y0) / PG - 0.5;
    const h = k => { const di = k % W - ti, dj = (k / W | 0) - tj; return 0.55 * Math.sqrt(di * di + dj * dj); };   // подсказка с запасом: тропа тянется к натоптанному
    dist[s] = 0; prev[s] = -1; seen[s] = gen; push(s, h(s));
    while (hn > 0) {
      const k = pop();
      if (seen[k] === -gen) continue;
      seen[k] = -gen;
      if (k !== s && goal(k)) { const path = []; for (let q = k; q !== -1; q = prev[q]) path.push(q); return path.reverse(); }
      const i = k % W, j = k / W | 0, ck = cost[k], dk = dist[k];
      for (let d = 0; d < 16; d++) {
        const ii = i + DI[d], jj = j + DJ[d];
        if (ii < 0 || jj < 0 || ii >= W || jj >= H) continue;
        const n = jj * W + ii;
        if (seen[n] === -gen) continue;
        let step = DM[d] * (ck + cost[n]) / 2;
        if (d >= 8) {                                                       // конём — через обе клетки по пути
          const a = Math.abs(DI[d]) === 2 ? j * W + i + Math.sign(DI[d]) : (j + Math.sign(DJ[d])) * W + i;
          const b = Math.abs(DI[d]) === 2 ? jj * W + i + Math.sign(DI[d]) : (j + Math.sign(DJ[d])) * W + ii;
          step = DM[d] * (ck + cost[n] + cost[a] + cost[b]) / 4;
        }
        if (step === Infinity) continue;
        const nd = dk + step;
        if (seen[n] !== gen || nd < dist[n]) { seen[n] = gen; dist[n] = nd; prev[n] = k; push(n, nd + h(n)); }
      }
    }
    return null;
  };
  // тропа: клетки → точки (через одну); клетки — натоптаны для следующих
  const free = (x, y) => { for (let r = 0; r < 4; r++) for (const [dx, dy] of [[0, 0], [0, 1], [1, 0], [-1, 0], [0, -1]]) { const k = cell(x + dx * r * PG, y + dy * r * PG); if (cost[k] !== Infinity) return k; } return -1; };
  const keep = (id, path, st) => {
    if (!path || path.length < 3) return;
    for (const k of path) cost[k] = Math.min(cost[k], 0.3);
    out.push([id, st, path.filter((k, i) => i === 0 || i === path.length - 1 || i % 2 === 0).map(k => [cx(k), cy(k)])]);
  };
  const hubL = locations.find(l => l.id === 'campfire'), hub = free(hubL.x + hubL.w / 2, hubL.y + hubL.h + 10);
  const onNet = k => cost[k] <= 0.31 || k === hub;
  // стволы: ворота севера и юга, угол равнины — до сети; конец главной квартала и запад трассы — к костру
  const end = P => ({ x: P[P.length - 1][0], y: P[P.length - 1][1] });
  const trunk = [['north', gates[0], onNet], ['south', gates[1], onNet], ['plain', { x: gates[4].x - 30, y: gates[4].y + 30 }, onNet],
    ['quarter', end(STREETS[0][1]), k => k === hub], ['highway', end(HIGHWAY), k => k === hub]];
  for (const [id, g, goal] of trunk) {
    const s = free(g.x, g.y);
    if (s >= 0) keep(id, search(s, goal, cx(hub), cy(hub)), 'trail');
  }
  // места: дверь — под местом, иначе сбоку, иначе над ним (у вала снизу не подойти)
  const door = l => {
    for (const [x, y] of [[l.x + l.w / 2, l.y + l.h + 10], [l.x - 10, l.y + l.h - 4], [l.x + l.w + 10, l.y + l.h - 4], [l.x + l.w / 2, l.y - 10]]) {
      if (x <= TOWN.x0 || x >= TOWN.x1 || y <= TOWN.y0 || y >= TOWN.y1) continue;
      const k = cell(x, y);
      if (cost[k] !== Infinity) return k;
    }
    return free(l.x + l.w / 2, l.y + l.h + 10);
  };
  const dests = locations.filter(l => !NPC.has(l.id) && !l.id.endsWith('_home') && l.x > TOWN.x0 && l.x + l.w < TOWN.x1 && l.y > TOWN.y0 && l.y + l.h < TOWN.y1)
    .map(l => ({ l, d: Math.hypot(l.x + l.w / 2 - cx(hub), l.y + l.h - cy(hub)) })).sort((a, b) => a.d - b.d);
  for (const { l } of dests) {
    const s = door(l);
    if (s >= 0 && !onNet(s)) keep(l.id, search(s, onNet, cx(hub), cy(hub)), TRUNK.has(l.zone) ? 'trail' : 'path');
  }
  return out;
}
// ── отрава: от «Ржавого трубопровода» к озеру — трубы потоньше, ржавые, на
// бетонных опорах: задвижка, пролом, колено вниз, течь, сток в озеро (рисунок —
// sprites/toxic.js); под течью, проломом и стоком — лужи с плёнкой, ещё —
// в низинах отравы (render/etchTown.js); по берегу озера и у луж — мёртвый
// камыш (world/flora.js)
export const PIPES = [];                 // { x, gy, kind, L } — кусок; { x, gy, kind: 'elbow', H } — колено
export const PUDDLES = [];               // { x, y, r, seed } — лужа: середина, полуось
export const inToxic = (x, y) => { const [wx, wy] = townWarp(x, y); return townZoneOf(x + wx, y + wy) === 1 && townEdge(x, y) < -40; };
function buildToxic() {
  PIPES.length = 0; PUDDLES.length = 0;
  const big = locations.find(l => l.id === 'pipeline'), lake = locations.find(l => l.id === 'lake');
  if (!big || !lake) return;
  const xa = big.x + big.w + 1, g1 = big.y + 18, xs = lake.x - 6, g2 = lake.y + 20, xe = Math.round((xa + xs) / 2 + 30);
  const n1 = Math.max(1, Math.round((xe - 2 - xa) / 34)), L1 = (xe - 2 - xa) / n1;
  ['pipe', 'valve', 'broken', 'pipe', 'pipe'].slice(0, n1).forEach((kind, i) => PIPES.push({ x: Math.round(xa + L1 * (i + 0.5)), gy: g1, kind, L: Math.round(L1) - 1 }));
  PIPES.push({ x: xe, gy: g2, kind: 'elbow', H: g2 - g1 });
  const n2 = Math.max(1, Math.round((xs - xe - 3) / 36)), L2 = (xs - xe - 3) / n2;
  for (let i = 0; i < n2; i++) PIPES.push({ x: Math.round(xe + 3 + L2 * (i + 0.5)), gy: g2, kind: i === n2 - 1 ? 'outlet' : 'leak', L: Math.round(L2) - 1 });
  // лужи: под течью, под проломом, у стока; потом — в низинах, не на тропах и не у мест
  for (const p of PIPES) {
    if (p.kind === 'leak') PUDDLES.push({ x: p.x + Math.round(p.L * 0.05), y: p.gy + 5, r: 10, seed: 3 });
    if (p.kind === 'broken') PUDDLES.push({ x: p.x, y: p.gy + 4, r: 7, seed: 5 });
    if (p.kind === 'outlet') PUDDLES.push({ x: p.x + Math.round(p.L / 2) + 4, y: p.gy + 4, r: 8, seed: 7 });
  }
  const LB = locations.map(l => ({ x0: l.x - 16, y0: l.y - 12, x1: l.x + l.w + 16, y1: l.y + l.h + 16 }));
  const cands = [];
  for (let y = TOWN.y0 + 1160; y < TOWN.y1 - 40; y += 36) for (let x = TOWN.x0 + 60; x < TOWN.x1 - 60; x += 36) {
    const px = x + (hq(x, y, 71) - 0.5) * 30, py = y + (hq(x, y, 73) - 0.5) * 24;
    cands.push({ x: Math.round(px), y: Math.round(py), v: vq(px / 170, py / 90, 75) });
  }
  cands.sort((a, b) => b.v - a.v);
  for (const c of cands) {
    if (PUDDLES.length >= 18) break;
    const r = 9 + Math.round(hq(c.x, c.y, 77) * 11);
    if (!inToxic(c.x - r, c.y) || !inToxic(c.x + r, c.y) || onArtery(c.x, c.y, r + 6)) continue;
    if (LB.some(b => c.x + r > b.x0 && c.x - r < b.x1 && c.y + r * 0.5 > b.y0 && c.y - r * 0.5 < b.y1)) continue;
    if (PUDDLES.some(p => Math.hypot(p.x - c.x, (p.y - c.y) * 1.6) < 150)) continue;
    PUDDLES.push({ x: c.x, y: c.y, r, seed: PUDDLES.length * 13 + 1 });
  }
}

// запечённое годно, пока ни одна точка не легла на место и не ушла за кромку
function pathsFit(list) {
  const B = locations.filter(l => l.x < TOWN.x1 && l.x + l.w > TOWN.x0 && l.y < TOWN.y1 && l.y + l.h > TOWN.y0);
  for (const [, , pts] of list) for (const [x, y] of pts) {
    if (x < TOWN.x0 || x > TOWN.x1 || y < TOWN.y0 || y > TOWN.y1) return false;
    for (const l of B) if (x > l.x && x < l.x + l.w && y > l.y && y < l.y + l.h) return false;
  }
  return list.length > 0;
}
function layPaths(list) {
  PATHS.length = 0;
  for (const [id, st, pts] of list) { addLine('road', PATH_ID + id, pts, st); PATHS.push({ id: PATH_ID + id, from: id, st }); }
}

export function buildTown() {
  addLine('road', 'road:town-cross', CROSS_PATH, 'trail');
  buildQuarter(STREETS.map(([id, pts, st]) => addLine('road', id, pts, st)));
  buildHighway();
  const L = addLine('river', 'river:town', BED, 'bed');
  // мост — ровно поперёк русла: середина — где русло пересекает настил
  let best = null;
  for (const p of L.pts) if (!best || Math.abs(p.y - (BRIDGE.gy - 3)) < Math.abs(best.y - (BRIDGE.gy - 3))) best = p;
  BRIDGE.x = Math.round(best.x);
  layPaths(pathsFit(TOWN_PATHS) ? TOWN_PATHS : routePaths(L));   // тропы: запечённые, а если места сдвинулись — заново
  buildToxic();
  return L;
}
// стоит ли на мосту: ноги (x, y) — на настиле
export function onBridge(x, y) {
  const B = BRIDGE;
  return Math.abs(x - B.x) <= B.half - 2 && y >= B.gy - B.deep && y <= B.gy;
}
