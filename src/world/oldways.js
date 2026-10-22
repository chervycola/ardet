// ═══════════════════════════════════════
// СТАРЫЕ ХОДЫ С КОЛЕЦ ЭПОХ — их концы наверху (канон world_weave.js → UNDERSIDE,
// «волна 4: изнанка»; сцены — world_cells.js). Тоннели изнанки сшивают несмежное:
// вход на одном кольце, выход на другом, сам ход — в отдельной карте под городком
// (world/underside.js). Спуск — пасхалка: первое «использовать» показывает сцену,
// повторное ведёт вниз; подъём — по лестнице хода, к другому его концу или куда
// выведут трубы.
//  · U1 «крипта»: ставкирка света и сада (север) — за алтарём дверца вниз (второе
//    действие постройки: первое у неё — обойти); выход — нилометр осевого юга, «сухая
//    цистерна у бассейна»: колодец со шкалой паводков, винтовая лестница вниз.
//  · U2 «катакомбы»: красная колоннада портиков (юг) — в глубине тёмная дверь; выход —
//    крипта чёрного собора света и сада (запад; второе действие собора): винный погреб,
//    за стеллажом вторая дверь — для вина и для рукописей, которые жгли.
// ═══════════════════════════════════════
import { TOWN, ringAt, trailPoint } from './disc.js';

const NI = '#0D0B0A', AS = '#8A8D8F';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K3 = '#34302a';
const BR2 = '#3a2818', L1 = '#c8b89a', L2 = '#b0a284', S1 = '#5e5e5d', S2 = '#33302e';
const RUST = '#4a3420', RUST_L = '#6b4a2c', KV = '#C23B2B', B3 = '#3a1c14', D4 = '#34302a', D5 = '#3a3328';
const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
const sideOf = (x, y) => {
  const dn = TOWN.y0 - y, ds = y - TOWN.y1, dw = TOWN.x0 - x, de = x - TOWN.x1, m = Math.max(dn, ds, dw, de);
  return m === ds ? 'south' : m === dn ? 'north' : m === dw ? 'west' : 'east';
};

// ── U1: нилометр — «сухая цистерна у бассейна» (канон: колодец со шкалой паводков,
//    винтовая лестница вниз; отметки воды гуще книзу и обрываются) ──
// Рисунок: квадратный колодец в низком парапете песчаника; свет слева, кромка пеплом
// справа. В проёме видна дальняя стенка шахты: желобок шкалы с насечками — гуще книзу,
// мел над верхней; слева по стенке — ступени витком вниз, в темноту
const NW = 34, NH = 26;
function drawNilometer(ctx, loc) {
  const x = loc.x, gy = loc.y + loc.h;
  ctx.globalAlpha = 0.45; R(ctx, x + 4, gy, NW - 2, 1, K0); R(ctx, x + NW - 2, gy - 4, 4, 4, K0); ctx.globalAlpha = 1;   // тень — вправо
  // дальняя стенка шахты в проёме: книзу темнее
  for (let y = gy - 21; y < gy - 11; y++) R(ctx, x + 5, y, NW - 10, 1, y < gy - 19 ? RUST : y < gy - 16 ? BR2 : y < gy - 13 ? K2 : NI);
  const sx = x + 19;                                                     // шкала: желобок, насечки, мел
  R(ctx, sx, gy - 21, 2, 9, K1);
  for (const yy of [gy - 19, gy - 16, gy - 14, gy - 13]) R(ctx, sx - 1, yy, 4, 1, L2);
  R(ctx, sx + 3, gy - 21, 3, 1, L1); R(ctx, sx + 4, gy - 20, 2, 1, L1);
  for (let i = 0; i < 4; i++) { R(ctx, x + 6 + i * 3, gy - 20 + i * 2, 4, 1, L2); R(ctx, x + 6 + i * 3, gy - 19 + i * 2, 4, 1, K2); }   // ступени витком вниз
  // парапет: дальний край, боковины, ближний край — верх к свету
  R(ctx, x + 2, gy - 24, NW - 4, 3, L2); R(ctx, x + 2, gy - 24, NW - 4, 1, L1);
  R(ctx, x + 2, gy - 21, 3, 10, L2); R(ctx, x + 2, gy - 21, 1, 10, L1);
  R(ctx, x + NW - 5, gy - 21, 3, 10, S1); R(ctx, x + NW - 3, gy - 24, 1, 13, AS);
  R(ctx, x + 2, gy - 11, NW - 4, 3, L2); R(ctx, x + 2, gy - 11, NW - 4, 1, L1); R(ctx, x + NW - 3, gy - 11, 1, 3, AS);
  // стенка спереди: блоки песчаника рядами, швы вразбежку; низ — в тень
  for (let y = gy - 8; y < gy; y++) {
    const row = y < gy - 4 ? 0 : 1;
    for (let xx = x + 2; xx < x + NW - 2; xx++) {
      const bx = (xx - x + row * 5) % 10;
      R(ctx, xx, y, 1, 1, xx === x + NW - 3 ? AS : y === gy - 4 || bx === 0 ? K2 : y === gy - 8 || y === gy - 3 ? L2 : y === gy - 1 ? BR2 : RUST_L);
    }
  }
  R(ctx, x + 8, gy - 6, 2, 1, S2); R(ctx, x + 23, gy - 2, 3, 1, S2);  // выщербины
}
const NILO_LOOK = 'Нилометр — сухая цистерна у бассейна. Колодец со шкалой паводков; по стене — винтовая лестница вниз. Река, которую он мерил, больше не поднимается.';

// где встать месту w×h в клетке «кольцо n · сторона»: не на чужом дворе, не у табличек, не на
// радиальной тропе; ближе к anchor (постройке-соседке по смыслу)
function placeIn(locations, n, side, w, h, anchor) {
  const arch = locations.filter(l => l.archDraw), small = locations.filter(l => !l.archDraw);
  const busy = (x0, gy) => {
    const x1 = x0 + w, y0 = gy - h;
    if (arch.some(l => x1 > l.x - 60 && x0 < l.x + l.w + 60 && gy > l.y - 10 && y0 < l.y + l.h + 50)) return true;
    if (small.some(l => x1 > l.x - 36 && x0 < l.x + l.w + 36 && gy > l.y - 30 && y0 < l.y + l.h + 30)) return true;
    const cx = x0 + w / 2;
    for (let d = 0; d <= 1900; d += 10) {                              // радиальная тропа своей стороны
      const p = trailPoint(side === 'plain' ? 'north' : side, d);
      if (Math.abs(p.x - cx) < 60 && Math.abs(p.y - gy) < 40) return true;
    }
    return false;
  };
  const cands = [], R0 = 200 * (n - 1) + 70, R1 = 200 * n - 30;
  const box = side === 'south' ? [TOWN.x0 + 120, TOWN.x1 - 120, TOWN.y1 + R0, TOWN.y1 + R1]
    : side === 'north' ? [TOWN.x0 + 120, TOWN.x1 - 120, TOWN.y0 - R1, TOWN.y0 - R0]
    : side === 'west' ? [TOWN.x0 - R1, TOWN.x0 - R0, TOWN.y0 + 120, TOWN.y1 - 60]
    : [TOWN.x1 + R0, TOWN.x1 + R1, TOWN.y0 + 120, TOWN.y1 - 60];
  for (let x = box[0]; x < box[1]; x += 12) for (let gy = box[2]; gy <= box[3]; gy += 10) {
    if (ringAt(x + w / 2, gy) !== n || sideOf(x + w / 2, gy) !== side || busy(x, gy)) continue;
    cands.push({ x, gy, d: anchor ? Math.hypot(x + w / 2 - anchor.archX, gy - anchor.archGy) : 0 });
  }
  cands.sort((a, b) => a.d - b.d);
  return cands[0] || null;
}
const archOf = (locations, ring, side, name, nearX) => locations.filter(l => l.archDraw && l.archRing === ring && l.archSide === side && l.name === name)
  .sort((a, b) => Math.abs(a.archX - nearX) - Math.abs(b.archX - nearX))[0] || null;

// ── U2: красная колоннада — «дорога вглубь, между колоннами прилавки первой витрины; тень
//    портика расчерчена на платные полосы; в глубине — тёмная дверь» (канон) ──
// Рисунок: шесть киноварных колонн на ступени, архитрав с карнизом; за колоннами — задняя
// стена в тени, в средней ячейке тёмная дверь; в боковых — прилавки; пол в тени портика
// расчерчен полосами с бирками цены. Свет слева, кромка пеплом справа
const CW = 66, CH = 48;
function drawColonnade(ctx, loc) {
  const x = loc.x, gy = loc.y + loc.h;
  ctx.globalAlpha = 0.45; R(ctx, x + 6, gy, CW - 4, 1, K0); ctx.globalAlpha = 1;
  R(ctx, x + 2, gy - 40, CW - 4, 34, K2);                               // задняя стена в тени портика
  for (let y = gy - 40; y < gy - 6; y += 6) R(ctx, x + 2, y, CW - 4, 1, D4);
  R(ctx, x + 29, gy - 26, 9, 20, NI); R(ctx, x + 28, gy - 27, 11, 1, D5); R(ctx, x + 28, gy - 26, 1, 20, D5);   // тёмная дверь в глубине
  for (const bx of [6, 18, 42, 54]) {                                   // прилавки первой витрины
    R(ctx, x + bx, gy - 13, 8, 2, RUST_L); R(ctx, x + bx, gy - 11, 8, 5, RUST); R(ctx, x + bx, gy - 13, 8, 1, L2);
    for (let i = 0; i < 3; i++) R(ctx, x + bx + 1 + i * 3, gy - 15, 2, 2, i === 1 ? L2 : BR2);
  }
  // пол в тени: полосы платные — через шесть точек, у каждой бирка
  R(ctx, x + 1, gy - 6, CW - 2, 4, K1);
  for (let px = x + 4; px < x + CW - 2; px += 6) { R(ctx, px, gy - 6, 1, 4, L2); R(ctx, px + 1, gy - 5, 2, 1, L1); }
  R(ctx, x, gy - 2, CW, 2, L2); R(ctx, x, gy - 2, CW, 1, L1); R(ctx, x + CW - 1, gy - 2, 1, 2, AS);   // ступень
  for (const cx of [4, 16, 28, 38, 50, 62]) {                           // колонны: киноварь, тень справа
    R(ctx, x + cx - 1, gy - 38, 3, 32, KV); R(ctx, x + cx + 1, gy - 38, 1, 32, B3);
    R(ctx, x + cx - 2, gy - 40, 5, 2, L2); R(ctx, x + cx - 2, gy - 40, 5, 1, L1);   // капитель
    R(ctx, x + cx - 2, gy - 7, 5, 1, L2);                               // база
  }
  R(ctx, x, gy - 45, CW, 5, L2); R(ctx, x, gy - 45, CW, 1, L1); R(ctx, x, gy - 42, CW, 1, D4);   // архитрав
  R(ctx, x - 1, gy - 47, CW + 2, 2, L1); R(ctx, x + CW, gy - 47, 1, 7, AS); R(ctx, x + CW - 1, gy - 45, 1, 5, AS);   // карниз; кромка пеплом
  for (let fx = x + 3; fx < x + CW - 3; fx += 4) R(ctx, fx, gy - 44, 2, 1, KV);   // киноварный фриз
}
const COLON_LOOK = 'Красная колоннада: дорога вглубь, между колоннами прилавки первой витрины. Тень портика расчерчена на платные полосы. В глубине — тёмная дверь.';

let nilometer = null, stave = null, colonnade = null, cathedral = null;
export function buildOldways(locations) {
  // U1, вход: ставкирка у северной тропы — за алтарём дверца вниз
  stave = archOf(locations, 3, 'north', 'ставкирка', trailPoint('north', 500).x);
  if (stave) {
    stave.upKey = 'stave';                                               // сюда выводит лестница хода крипты
    stave.altNow = () => ({ key: 'stave_altar', label: '<i>✝</i>ЗА АЛТАРЬ' });
  }
  // U1, выход: нилометр — у пилона с обелиском: египетское у египетского
  const pylon = archOf(locations, 1, 'south', 'пилон с обелиском', TOWN.x0);
  const p = placeIn(locations, 1, 'south', NW, NH, pylon) || { x: TOWN.x0 + 600, gy: TOWN.y1 + 120 };
  nilometer = {
    id: 'nilometer', name: 'Нилометр', zone: 'street',
    x: p.x, y: p.gy - NH, w: NW, h: NH, solidBox: { x: p.x + 2, y: p.gy - 8, w: NW - 4, h: 8 },
    look: NILO_LOOK, drawSelf: drawNilometer,
    useAction: 'nilometer_down', useLabel: '<i>↓</i>ВИНТОВАЯ ЛЕСТНИЦА',
  };
  locations.push(nilometer);
  // U2, вход: красная колоннада — у сада Эпикура: тень бесплатна только за его калиткой
  const garden = archOf(locations, 2, 'south', 'сад Эпикура', TOWN.x1);
  const c = placeIn(locations, 2, 'south', CW, CH, garden) || { x: TOWN.x0 + 1800, gy: TOWN.y1 + 320 };
  colonnade = {
    id: 'colonnade', name: 'Красная колоннада', zone: 'street',
    x: c.x, y: c.gy - CH, w: CW, h: CH, solidBox: { x: c.x, y: c.gy - 7, w: CW, h: 7 },
    look: COLON_LOOK, drawSelf: drawColonnade,
    useAction: 'colonnade_door', useLabel: '<i>→</i>ВГЛУБЬ',
  };
  locations.push(colonnade);
  // U2, выход: крипта чёрного собора — у западной тропы
  cathedral = archOf(locations, 3, 'west', 'чёрный собор', 0);
  if (cathedral) {
    cathedral.upKey = 'cathedral';
    cathedral.altNow = () => ({ key: 'cathedral_crypt', label: '<i>✝</i>В КРИПТУ' });
  }
}
export const oldways = () => ({ nilometer, stave, colonnade, cathedral });
