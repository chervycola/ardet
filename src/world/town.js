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
import { addLine, onArtery, shapeLine } from './arteries.js';
import { townZoneOf, townWarp, townEdge } from './relief.js';
import { locations } from './locations.js';

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
export const CARS = [];                                  // { x, gy, v }
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
  return L;
}
// стоит ли на мосту: ноги (x, y) — на настиле
export function onBridge(x, y) {
  const B = BRIDGE;
  return Math.abs(x - B.x) <= B.half - 2 && y >= B.gy - B.deep && y <= B.gy;
}
