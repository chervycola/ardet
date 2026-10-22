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
// ═══════════════════════════════════════
import { TOWN, ringAt, trailPoint } from './disc.js';

const NI = '#0D0B0A', AS = '#8A8D8F';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K3 = '#34302a';
const BR2 = '#3a2818', L1 = '#c8b89a', L2 = '#b0a284', S1 = '#5e5e5d', S2 = '#33302e';
const RUST = '#4a3420', RUST_L = '#6b4a2c';
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

// где встать нилометру: первое кольцо, юг; не на чужом дворе, не у табличек, не на дороге;
// ближе к пилону с обелиском — египетское у египетского
function niloPlace(locations) {
  const arch = locations.filter(l => l.archDraw), small = locations.filter(l => !l.archDraw);
  const pylon = arch.find(l => l.archRing === 1 && l.archSide === 'south' && l.name === 'пилон с обелиском' && l.archX < (TOWN.x0 + TOWN.x1) / 2);
  const busy = (x0, gy) => {
    const x1 = x0 + NW, y0 = gy - NH;
    if (arch.some(l => x1 > l.x - 60 && x0 < l.x + l.w + 60 && gy > l.y - 10 && y0 < l.y + l.h + 50)) return true;
    if (small.some(l => x1 > l.x - 36 && x0 < l.x + l.w + 36 && gy > l.y - 30 && y0 < l.y + l.h + 30)) return true;
    for (let d = 0; d <= 200; d += 10) if (Math.abs(trailPoint('south', d).x - (x0 + NW / 2)) < 60 && Math.abs(TOWN.y1 + d - gy) < 30) return true;
    return false;
  };
  const cands = [];
  for (let x = TOWN.x0 + 120; x < TOWN.x1 - 120; x += 12) for (let gy = TOWN.y1 + 70; gy <= TOWN.y1 + 170; gy += 10) {
    if (ringAt(x + NW / 2, gy) !== 1 || sideOf(x + NW / 2, gy) !== 'south' || busy(x, gy)) continue;
    cands.push({ x, gy, d: pylon ? Math.hypot(x + NW / 2 - pylon.archX, gy - pylon.archGy) : 0 });
  }
  cands.sort((a, b) => a.d - b.d);
  return cands[0] || { x: TOWN.x0 + 600, gy: TOWN.y1 + 120 };
}

let nilometer = null, stave = null;
export function buildOldways(locations) {
  // U1, вход: ставкирка у северной тропы — за алтарём дверца вниз
  const tr = trailPoint('north', 500).x;
  stave = locations.filter(l => l.archDraw && l.archRing === 3 && l.archSide === 'north' && l.name === 'ставкирка')
    .sort((a, b) => Math.abs(a.archX - tr) - Math.abs(b.archX - tr))[0] || null;
  if (stave) {
    stave.upKey = 'stave';                                               // сюда выводит лестница хода крипты
    stave.altNow = () => ({ key: 'stave_altar', label: '<i>✝</i>ЗА АЛТАРЬ' });
  }
  // U1, выход: нилометр
  const p = niloPlace(locations);
  nilometer = {
    id: 'nilometer', name: 'Нилометр', zone: 'street',
    x: p.x, y: p.gy - NH, w: NW, h: NH, solidBox: { x: p.x + 2, y: p.gy - 8, w: NW - 4, h: 8 },
    look: NILO_LOOK, drawSelf: drawNilometer,
    useAction: 'nilometer_down', useLabel: '<i>↓</i>ВИНТОВАЯ ЛЕСТНИЦА',
  };
  locations.push(nilometer);
}
export const oldways = () => ({ nilometer, stave });
