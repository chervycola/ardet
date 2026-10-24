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
//  · U3 «канализация»: газовый переулок пара и теней (запад) — один горящий фонарь, рельсы
//    вагона 89 6 поперёк мостовой, решётка у фонаря; выход — люк на территории завода
//    века катастроф (равнина: дуга у северо-восточного угла городка), у градирни.
//  · U4 «бомбоубежище»: спуск в подвал завода (век катастроф, равнина) — бетонный приямок,
//    на стене плакат с улыбкой; в подвале банка «1961. НЕ ОТКРЫВАТЬ», за ней дверь вниз.
//    Выход — задняя дверь вагона 89 6, вкопанного тупиком во дворе-колодце города-сот
//    (неон, восток); снаружи она заперта, пока убежище не признало странника проверяющим.
//  · U5 «метро»: заклеенный вход метро в фасаде-панели проспекта-экрана (сейчас, восток):
//    ленты крест-накрест, над входом полустёрто LASCIATE, рядом мелом белый кролик. Внизу —
//    вестибюль и платформа; выход — колодец городка, поездом (ритуал «Поезд за спиной»).
//  · U7 «холодная жила», вход: подсобка парка закрытого праздника (неон, запад) — морозилка
//    «ЖДЁТ ЛУЧШИХ ВРЕМЁН», пустая, иней на задней стенке стрелкой вниз; рядом гудит подстанция
//    «ПРОЧЕЕ — 100%». От дна морозилки лаз спускается в жилу, к криосклепу «WD».
// ═══════════════════════════════════════
import { TOWN, RINGS_D, OLD_OFF, ringAt, ringD, fromOldGeo, trailPoint } from './disc.js';
// запасное место (если всё занято) — в прежней раскладке: от углов прежнего городка, на чтении — по долям колец
const was = (dx, dy, ox = 0, oy = 0) => { const p = fromOldGeo(OLD_OFF + ox * 3000 + dx, OLD_OFF + oy * 1640 + dy); return { x: Math.round(p.x), gy: Math.round(p.y) }; };

const NI = '#0D0B0A', AS = '#8A8D8F';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K3 = '#34302a';
const BR2 = '#3a2818', L1 = '#c8b89a', L2 = '#b0a284', S1 = '#5e5e5d', S2 = '#33302e';
const RUST = '#4a3420', RUST_L = '#6b4a2c', KV = '#C23B2B', B3 = '#3a1c14', D4 = '#34302a', D5 = '#3a3328';
const SV = '#E28A3A', MG_D = '#2f372c', MG = '#3D4A3A', BO = '#D9CFB8', S0 = '#474442';
const q = Math.round;
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
  const cands = [], R0 = ringD(n, 70), R1 = ringD(n, 170);
  const box = side === 'south' ? [TOWN.x0 + 120, TOWN.x1 - 120, TOWN.y1 + R0, TOWN.y1 + R1]
    : side === 'north' ? [TOWN.x0 + 120, TOWN.x1 - 120, TOWN.y0 - R1, TOWN.y0 - R0]
    : side === 'west' ? [TOWN.x0 - R1, TOWN.x0 - R0, TOWN.y0 + 120, TOWN.y1 - 60]
    : side === 'plain' ? [TOWN.x1, TOWN.x1 + R1, TOWN.y0 - R1, TOWN.y0]
    : [TOWN.x1 + R0, TOWN.x1 + R1, TOWN.y0 + 120, TOWN.y1 - 60];
  // соседи — только те, что могут задеть рамку поиска (кольца просторны: мест много, рамка большая)
  const near = locations.filter(l => l.x < box[1] + w + 80 && l.x + l.w > box[0] - 80 && l.y < box[3] + 80 && l.y + l.h > box[2] - h - 80);
  const arch = near.filter(l => l.archDraw), small = near.filter(l => !l.archDraw);
  // радиальная тропа своей стороны: точки через 10, рядом с местом — по её же расстоянию от городка
  const ts = side === 'plain' ? 'north' : side, TP = [];
  for (let d = 0; d <= RINGS_D + 100; d += 10) TP.push(trailPoint(ts, d));
  const onTrail = (cx, gy) => {
    const d = ts === 'south' ? gy - TOWN.y1 : ts === 'north' ? TOWN.y0 - gy : ts === 'east' ? cx - TOWN.x1 : TOWN.x0 - cx, r = ts === 'south' || ts === 'north' ? 40 : 60;
    for (let i = Math.max(0, Math.floor((d - r) / 10)); i <= Math.min(TP.length - 1, Math.ceil((d + r) / 10)); i++) {
      const p = TP[i];
      if (Math.abs(p.x - cx) < 60 && Math.abs(p.y - gy) < 40) return true;
    }
    return false;
  };
  const busy = (x0, gy) => {
    const x1 = x0 + w, y0 = gy - h;
    if (arch.some(l => x1 > l.x - 60 && x0 < l.x + l.w + 60 && gy > l.y - 10 && y0 < l.y + l.h + 50)) return true;
    if (small.some(l => x1 > l.x - 36 && x0 < l.x + l.w + 36 && gy > l.y - 30 && y0 < l.y + l.h + 30)) return true;
    return onTrail(x0 + w / 2, gy);
  };
  // равнина — дуга у северо-восточного угла: середина дуги, не к её краям
  const inSide = (x, y) => side !== 'plain' ? sideOf(x, y) === side
    : x > TOWN.x1 && y < TOWN.y0 && Math.atan2(TOWN.y0 - y, x - TOWN.x1) > 0.15 * Math.PI && Math.atan2(TOWN.y0 - y, x - TOWN.x1) < 0.35 * Math.PI;
  const ax = anchor ? anchor.archX ?? anchor.x + anchor.w / 2 : 0, ay = anchor ? anchor.archGy ?? anchor.y + anchor.h : 0;
  for (let x = box[0]; x < box[1]; x += 12) for (let gy = box[2]; gy <= box[3]; gy += 10) {
    if (ringAt(x + w / 2, gy) !== n || !inSide(x + w / 2, gy) || busy(x, gy)) continue;
    cands.push({ x, gy, d: anchor ? Math.hypot(x + w / 2 - ax, gy - ay) : 0 });
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

// ── U3: газовый переулок — «один горящий фонарь, рельсы вагона 89 6 поперёк мостовой,
//    решётка канализации у фонаря» (канон) ──
// Рисунок: чугунный столб с фонарём (стёкла горят — тепло не растрируется, сплошное),
// перекладина для лестницы фонарщика; у подножия — решётка в мостовой; поперёк — рельсы
const GW_ = 34, GH_ = 54;
function drawGasLamp(ctx, loc) {
  const x = loc.x, gy = loc.y + loc.h;
  for (let xx = x; xx < x + GW_; xx += 4) for (let yy = gy - 6; yy < gy; yy += 3) {   // мостовая
    const sx = xx + ((yy >> 1) & 2);
    R(ctx, sx, yy, Math.min(3, x + GW_ - sx), 2, (xx + yy) % 3 ? S2 : K3);
  }
  for (const [ax, bx] of [[x + 1, x + 9], [x + 7, x + 15]]) for (let k = 0; k < 7; k++) R(ctx, ax + q((bx - ax) * k / 7), gy - 1 - k, 2, 1, k & 1 ? AS : S1);   // рельсы поперёк мостовой
  R(ctx, x + 15, gy - 6, 16, 5, S1); R(ctx, x + 16, gy - 5, 14, 3, K1);  // решётка у фонаря
  for (let k = 0; k < 7; k++) R(ctx, x + 17 + k * 2, gy - 5, 1, 3, K3);
  const px = x + 9;                                                      // столб: литое основание, ствол, перекладина
  R(ctx, px - 2, gy - 9, 6, 3, K2); R(ctx, px - 1, gy - 11, 4, 2, K3);
  R(ctx, px, gy - 44, 2, 33, K2); R(ctx, px, gy - 44, 1, 33, K3);
  R(ctx, px - 4, gy - 38, 10, 1, K2);
  R(ctx, px - 3, gy - 46, 8, 2, K2); R(ctx, px - 2, gy - 52, 6, 6, SV); R(ctx, px - 1, gy - 51, 4, 4, L1);   // фонарь горит: один
  R(ctx, px - 3, gy - 53, 8, 1, K2); R(ctx, px - 1, gy - 54, 4, 1, K2); R(ctx, px + 1, gy - 52, 1, 6, K3);
  ctx.globalAlpha = 0.45; R(ctx, px + 3, gy, 12, 1, K0); ctx.globalAlpha = 1;
}
const GAS_LOOK = 'Газовый переулок: один горящий фонарь. Поперёк мостовой — рельсы, на рельсе клеймо «89 6»; вагона нет. У фонаря — решётка канализации, снизу тянет паром.';

// ── U3, выход: люк на территории завода — чугунная крышка у градирни ──
const HW_ = 24, HH_ = 15;
function drawHatch(ctx, loc) {
  const cx = loc.x + HW_ / 2, cy = loc.y + 7;
  for (let k = -11; k <= 11; k++) {                                      // обойма: край к свету сверху, снизу тень
    const hw = q(Math.sqrt(121 - k * k) * 0.5), x = q(cx + k);
    R(ctx, x, cy - hw, 1, 2 * hw + 1, K2);
    R(ctx, x, cy - hw, 1, 1, k < 4 ? S1 : S2); R(ctx, x, cy + hw, 1, 1, K0);
  }
  for (let k = -8; k <= 8; k++) {                                        // крышка: литые рёбра решёткой, в пазах грязь
    const hw = q(Math.sqrt(64 - k * k) * 0.5), x = q(cx + k);
    for (let yy = cy - hw; yy <= cy + hw; yy++) R(ctx, x, yy, 1, 1, (k + 8) % 3 === 0 || (yy - cy + 9) % 3 === 0 ? K1 : k < 0 && yy < cy ? S2 : K3);
  }
  R(ctx, q(cx - 5), cy - 3, 2, 1, AS); R(ctx, q(cx - 2), cy - 3, 1, 1, S1);   // блик: буквы по кругу стёрты до гладкого
  ctx.globalAlpha = 0.5; R(ctx, q(cx - 10), cy + 7, 20, 1, MG_D); ctx.globalAlpha = 1;   // сырость у края
}
const HATCH_LOOK = 'Люк на территории завода. Чугунная крышка; литые буквы по кругу стёрты подошвами до гладкого. Из-под крышки тянет водой.';

// ── U4, вход: спуск в подвал завода — бетонный приямок, ступени вниз, внизу стальная дверь,
//    крашенная зелёным; на стенке приямка — плакат с улыбкой, отслаивается (канон клетки:
//    Гагарин — «плакат с улыбкой, отслаивающийся со стены; в погребе банка «1961. НЕ ОТКРЫВАТЬ»») ──
const BW_ = 30, BH_ = 26;
function drawCellar(ctx, loc) {
  const x = loc.x, gy = loc.y + loc.h;
  ctx.globalAlpha = 0.45; R(ctx, x + 3, gy, BW_ - 3, 1, K0); ctx.globalAlpha = 1;
  R(ctx, x, gy - 26, BW_, 3, K3); R(ctx, x, gy - 26, BW_, 1, S1);       // козырёк над приямком
  R(ctx, x + 3, gy - 23, BW_ - 6, 10, S2);                               // дальняя стенка приямка
  R(ctx, x + 12, gy - 22, 9, 9, MG_D); R(ctx, x + 13, gy - 21, 7, 8, MG); R(ctx, x + 13, gy - 21, 7, 1, S0);   // дверь внизу: сталь, зелёная
  R(ctx, x + 18, gy - 17, 1, 1, AS);
  R(ctx, x + 4, gy - 22, 6, 8, L2); R(ctx, x + 4, gy - 22, 1, 8, L1);  // плакат с улыбкой
  R(ctx, x + 5, gy - 21, 4, 3, S1); R(ctx, x + 6, gy - 20, 2, 2, L1); R(ctx, x + 6, gy - 17, 3, 1, BR2);
  R(ctx, x + 8, gy - 22, 2, 1, S2); R(ctx, x + 9, gy - 21, 1, 1, S2); R(ctx, x + 8, gy - 21, 1, 1, L1);   // угол отслоился, загнулся
  for (let i = 0; i < 4; i++) {                                          // ступени вниз: к двери уже и темнее
    const sy = gy - 13 + i * 3, ins = 3 - i;
    R(ctx, x + 4 + ins, sy, BW_ - 8 - 2 * ins, 2, i < 1 ? K3 : i < 2 ? S2 : S0); R(ctx, x + 4 + ins, sy + 2, BW_ - 8 - 2 * ins, 1, K1);
    R(ctx, x + 4, sy, ins, 3, K2); R(ctx, x + BW_ - 4 - ins, sy, ins, 3, K1);   // внутренние стенки приямка — в тени
  }
  for (const wx of [x + 1, x + BW_ - 4]) { R(ctx, wx, gy - 23, 3, 22, S0); R(ctx, wx, gy - 23, 3, 1, S1); }   // боковины приямка
  R(ctx, x + 1, gy - 23, 1, 22, S1); R(ctx, x + BW_ - 2, gy - 23, 1, 22, K2);
  R(ctx, x, gy - 1, BW_, 1, K2);
}
const CELLAR_LOOK = 'Спуск в подвал завода: бетонный приямок, ступени вниз, внизу стальная дверь. На стенке приямка — плакат с улыбкой; отслаивается, угол загнулся.';

// ── U4, выход: вагон 89 6 — «внизу тупиком вкопан» во дворе-колодце города-сот (канон кадра);
//    рельсы подходят к нему и кончаются (Г4: рельсы — в трёх эпохах, вагон — только в неоне);
//    на боку меловые знаки, поверх выцарапано «ЗДЕСЬ БЫЛ ВАСЯ» (А10); сверху капают кондиционеры ──
const VW_ = 62, VH_ = 42;
const DIG = { 8: ['XXX', 'X.X', 'XXX', 'X.X', 'XXX'], 9: ['XXX', 'X.X', 'XXX', '..X', 'XXX'], 6: ['XXX', 'X..', 'XXX', 'X.X', 'XXX'],
  В: ['XX.', 'X.X', 'XX.', 'X.X', 'XX.'], А: ['.X.', 'X.X', 'XXX', 'X.X', 'X.X'], С: ['.XX', 'X..', 'X..', 'X..', '.XX'], Я: ['.XX', 'X.X', '.XX', '.XX', 'X.X'],
  L: ['X..', 'X..', 'X..', 'X..', 'XXX'], A: ['.X.', 'X.X', 'XXX', 'X.X', 'X.X'], S: ['.XX', 'X..', '.X.', '..X', 'XX.'], C: ['.XX', 'X..', 'X..', 'X..', '.XX'],
  I: ['XXX', '.X.', '.X.', '.X.', 'XXX'], T: ['XXX', '.X.', '.X.', '.X.', '.X.'], E: ['XXX', 'X..', 'XX.', 'X..', 'XXX'] };
// wear — доля стёртых точек (надпись полустёрта): какие стёрлись — по месту, не по кадру
const worn = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function letters(ctx, word, x, y, c, wear = 0) {
  for (const ch of word) { const g = DIG[ch]; if (g) g.forEach((row, j) => { for (let i = 0; i < 3; i++) if (row[i] === 'X' && worn(x + i, y + j) >= wear) R(ctx, x + i, y + j, 1, 1, c); }); x += 4; }
}
function drawCarriage(ctx, loc, t) {
  const x = loc.x, gy = loc.y + loc.h, bx = x + 10, bw = VW_ - 12, top = gy - 30;
  ctx.globalAlpha = 0.45; R(ctx, bx + 2, gy, bw, 1, K0); ctx.globalAlpha = 1;
  for (const ry of [gy - 4, gy - 1]) R(ctx, x, ry, 12, 1, S1);           // рельсы подходят — и кончаются
  for (let k = 0; k < 3; k++) R(ctx, x + 1 + k * 4, gy - 5, 1, 5, K2);
  R(ctx, bx + 1, top, bw - 2, 2, S2); R(ctx, bx + 1, top, bw - 2, 1, S1);   // крыша; дуга токоприёмника опущена
  R(ctx, bx + 14, top - 3, 18, 1, S1); R(ctx, bx + 14, top - 2, 1, 2, S2); R(ctx, bx + 31, top - 2, 1, 2, S2);
  R(ctx, bx, top + 2, bw, 22, RUST_L); R(ctx, bx, top + 2, 1, 22, L2); R(ctx, bx + bw - 2, top + 2, 2, 22, RUST);   // кузов: краска выцвела
  for (let k = 0; k < 6; k++) { const wx = bx + 3 + k * 7; R(ctx, wx, top + 4, 5, 6, K1); R(ctx, wx, top + 4, 5, 1, S2); }   // окна
  R(ctx, bx + bw - 8, top + 4, 6, 18, K2); R(ctx, bx + bw - 7, top + 5, 4, 7, K1); R(ctx, bx + bw - 5, top + 5, 1, 16, K2);   // задняя дверь: складная, закрыта
  R(ctx, bx, top + 11, bw - 9, 1, L2);                                    // кремовый пояс
  letters(ctx, '89 6', bx + 3, top + 14, L2);                            // номер на борту
  for (const [cx, cy] of [[bx + 25, top + 16], [bx + 35, top + 19]]) {   // меловые знаки: круг с лучами
    for (const [dx, dy] of [[0, -2], [1, -2], [2, -1], [2, 0], [1, 1], [0, 1], [-1, 0], [-1, -1]]) R(ctx, cx + dx, cy + dy, 1, 1, L1);
    R(ctx, cx - 3, cy - 1, 1, 1, L2); R(ctx, cx + 4, cy, 1, 1, L2); R(ctx, cx + 1, cy + 3, 1, 1, L2);
  }
  letters(ctx, 'ВАСЯ', bx + 23, top + 15, BO);                            // поверх — выцарапано
  R(ctx, bx - 1, gy - 7, bw + 2, 7, K3); R(ctx, bx - 1, gy - 7, bw + 2, 1, S2);   // вкопан: низ кузова в насыпи
  for (let k = 0; k < 9; k++) R(ctx, bx + q(k * bw / 9) + 2, gy - 5 + (k & 1), 2, 1, BR2);
  for (let k = 0; k < 3; k++) {                                          // сверху капают кондиционеры
    const ph = ((t || 0) * 0.9 + k * 23) % 60, dx = bx + 8 + k * 15;
    if (ph < 12) R(ctx, dx, loc.y + q(ph * (top - loc.y - 2) / 12), 1, 2, AS);
    else if (ph < 16) R(ctx, dx - 1, top - 1, 3, 1, S1);
  }
}
const CARRIAGE_LOOK = 'Двор-колодец: внизу тупиком вкопан вагон 89 6. Рельсы подходят к нему и кончаются. На боку — меловые знаки, поверх выцарапано «ЗДЕСЬ БЫЛ ВАСЯ». Сверху капают кондиционеры.';

// ── U5, вход: заклеенный вход метро в фасаде-панели проспекта-экрана (канон кадра «плоский
//    новый мир»): проём крест-накрест в бумажных лентах, над входом полустёрто LASCIATE OGNI
//    SPERANZA (А12), справа мелом белый кролик (Б1); красная «М» над входом погашена ──
const MW_ = 50, MH_ = 36;
function drawMetro(ctx, loc) {
  const x = loc.x, gy = loc.y + loc.h;
  ctx.globalAlpha = 0.45; R(ctx, x + 3, gy, MW_ - 2, 1, K0); ctx.globalAlpha = 1;
  R(ctx, x, gy - 36, MW_, 36, S0); R(ctx, x, gy - 36, MW_, 1, S1); R(ctx, x, gy - 36, 1, 36, S1); R(ctx, x + MW_ - 1, gy - 36, 1, 36, K2);   // фасад-панель
  for (const sx of [x + 12, x + 25, x + 38]) R(ctx, sx, gy - 35, 1, 11, K2);   // швы панелей
  R(ctx, x + 1, gy - 24, MW_ - 2, 1, K2);
  for (const [dx, dy] of [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 1], [2, 2], [3, 1], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4]]) R(ctx, x + 3 + dx, gy - 34 + dy, 1, 1, KV);   // «М»
  letters(ctx, 'LASCIATE', x + 10, gy - 33, L2, 0.35);                  // полустёрто
  R(ctx, x + 9, gy - 23, 30, 1, S1); R(ctx, x + 9, gy - 22, 1, 22, S1); R(ctx, x + 38, gy - 22, 1, 22, K2);   // рама проёма
  R(ctx, x + 10, gy - 22, 28, 22, NI);
  for (let i = 0; i < 5; i++) { const sy = gy - 3 - i * 4, ins = i * 2; R(ctx, x + 11 + ins, sy, 26 - 2 * ins, 2, i < 1 ? S1 : i < 2 ? S2 : i < 3 ? K3 : K2); }   // ступени вниз, в темноту
  for (let k = 0; k <= 26; k++) {                                        // ленты крест-накрест; верхний край второй отклеился
    R(ctx, x + 11 + k, gy - 21 + q(k * 19 / 26), 1, 2, L1);
    if (k < 20) R(ctx, x + 11 + k, gy - 3 - q(k * 19 / 26), 1, 2, L2);
  }
  R(ctx, x + 31, gy - 17, 2, 5, L2); R(ctx, x + 32, gy - 12, 1, 2, L1); // отклеившийся край висит
  RABBIT.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === 'X') R(ctx, x + 41 + i, gy - 19 + j, 1, 1, BO); });   // белый кролик мелом
}
const RABBIT = ['.X.X....', '.X.X....', '.XXX....', 'X...X...', '.XXX.XX.', '.X.....X', 'X......X', '.XXXXXX.'];
const METRO_LOOK = 'Заклеенный вход метро: проём крест-накрест в бумажных лентах. Над входом полустёрто: LASCIATE OGNI SPERANZA. Рядом мелом — белый кролик.';

// ── U7, вход: подсобка парка — морозилка «ЖДЁТ ЛУЧШИХ ВРЕМЁН» (пуста, иней на задней стенке
//    стрелкой вниз; на крышке круглые следы от бутылок); рядом гудит подстанция «ПАРК — 0% ·
//    ОСВЕЩЕНИЕ — 0% · ПРОЧЕЕ — 100%», «прочее» подчёркнуто, стрелка счётчика крутится (канон
//    клетки, К19, К19а). Иней на крыше подсобки — нов.: единственная холодная крыша квартала ──
const PW_ = 48, PH_ = 34;
function drawFreezerShed(ctx, loc, t) {
  const x = loc.x, gy = loc.y + loc.h;
  ctx.globalAlpha = 0.45; R(ctx, x + 3, gy, PW_ - 2, 1, K0); ctx.globalAlpha = 1;
  R(ctx, x, gy - 30, 30, 4, K3); R(ctx, x, gy - 30, 30, 1, S1);          // крыша-плита
  for (let k = 0; k < 14; k++) R(ctx, x + 1 + q(worn(k, 1) * 28), gy - 30 + q(worn(k, 2) * 3), 1, 1, k & 1 ? BO : AS);   // иней на крыше
  R(ctx, x + 1, gy - 26, 28, 26, BR2);                                   // задняя стена: доски
  for (let bx = x + 5; bx < x + 28; bx += 5) R(ctx, bx, gy - 26, 1, 26, K1);
  R(ctx, x, gy - 26, 2, 26, RUST); R(ctx, x + 28, gy - 26, 2, 26, K2);   // стойки
  const fx = x + 5, fy = gy - 12;                                        // морозилка-ларь: эмаль, крышка сверху
  R(ctx, fx, fy, 20, 11, L2); R(ctx, fx, fy, 1, 11, L1); R(ctx, fx + 19, fy, 1, 11, S1);
  R(ctx, fx - 1, fy - 4, 22, 4, L1); R(ctx, fx - 1, fy - 1, 22, 1, S1); R(ctx, fx - 1, fy - 4, 22, 1, BO);
  for (const ox of [fx + 4, fx + 12]) { R(ctx, ox, fy - 3, 3, 1, S1); R(ctx, ox, fy - 2, 1, 1, S1); R(ctx, ox + 2, fy - 2, 1, 1, S1); }   // круглые следы от бутылок
  R(ctx, fx + 7, fy + 3, 6, 3, BO); R(ctx, fx + 8, fy + 4, 4, 1, K3);    // бирка «ЖДЁТ ЛУЧШИХ ВРЕМЁН»
  R(ctx, fx, gy - 1, 20, 1, K2);
  R(ctx, fx + 20, fy + 7, 11, 1, K1);                                    // кабель к подстанции
  const sx = x + 31, sh = 22;                                            // подстанция: шкаф, табличка нагрузки, счётчик
  R(ctx, sx, gy - sh, 16, sh, S0); R(ctx, sx, gy - sh, 16, 1, AS); R(ctx, sx, gy - sh, 1, sh, S1); R(ctx, sx + 15, gy - sh, 1, sh, K2);
  R(ctx, sx + 2, gy - sh + 3, 12, 6, L2);
  for (const ly of [gy - sh + 4, gy - sh + 6]) for (let k = 0; k < 10; k += 2) R(ctx, sx + 3 + k, ly, 1, 1, K3);
  R(ctx, sx + 3, gy - sh + 8, 6, 1, K1);                                 // «прочее» подчёркнуто
  for (const [dx, dy] of [[2, 0], [1, 1], [0, 2], [1, 2], [2, 2], [1, 3], [0, 4]]) R(ctx, sx + 11 + dx, gy - sh + 10 + dy, 1, 1, KV);   // молния «не влезай»
  const mx = sx + 6, my = gy - 7, a = (t || 0) * 0.12;                   // счётчик: стрелка крутится
  R(ctx, mx - 3, my - 3, 7, 7, S2); R(ctx, mx - 2, my - 2, 5, 5, L1);
  R(ctx, mx + q(Math.cos(a) * 2), my + q(Math.sin(a) * 2), 1, 1, K1); R(ctx, mx, my, 1, 1, K1);
}
const FREEZER_LOOK = 'Подсобка парка: морозилка «ЖДЁТ ЛУЧШИХ ВРЕМЁН», пустая; на крышке круглые следы от бутылок. Рядом гудит подстанция: «ПАРК — 0% · ОСВЕЩЕНИЕ — 0% · ПРОЧЕЕ — 100%», «прочее» кем-то подчёркнуто; стрелка счётчика крутится. На крыше подсобки — иней.';

let nilometer = null, stave = null, colonnade = null, cathedral = null, gaslamp = null, hatch = null, cellar = null, carriage = null, metro = null, freezer = null;
export function buildOldways(locations) {
  // U1, вход: ставкирка у северной тропы — за алтарём дверца вниз
  stave = archOf(locations, 3, 'north', 'ставкирка', trailPoint('north', ringD(3, 100)).x);
  if (stave) {
    stave.upKey = 'stave';                                               // сюда выводит лестница хода крипты
    stave.altNow = () => ({ key: 'stave_altar', label: '<i>✝</i>ЗА АЛТАРЬ' });
  }
  // U1, выход: нилометр — у пилона с обелиском: египетское у египетского
  const pylon = archOf(locations, 1, 'south', 'пилон с обелиском', TOWN.x0);
  const p = placeIn(locations, 1, 'south', NW, NH, pylon) || was(600, 120, 0, 1);
  nilometer = {
    id: 'nilometer', name: 'Нилометр', zone: 'street',
    x: p.x, y: p.gy - NH, w: NW, h: NH, solidBox: { x: p.x + 2, y: p.gy - 8, w: NW - 4, h: 8 },
    look: NILO_LOOK, drawSelf: drawNilometer,
    useAction: 'nilometer_down', useLabel: '<i>↓</i>ВИНТОВАЯ ЛЕСТНИЦА',
  };
  locations.push(nilometer);
  // U2, вход: красная колоннада — у сада Эпикура: тень бесплатна только за его калиткой
  const garden = archOf(locations, 2, 'south', 'сад Эпикура', TOWN.x1);
  const c = placeIn(locations, 2, 'south', CW, CH, garden) || was(1800, 320, 0, 1);
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
  // U3, вход: газовый фонарь — у таблички «ящик в газовом переулке»
  const box = locations.find(l => l.name === 'ящик в газовом переулке') || null;
  const g = placeIn(locations, 6, 'west', GW_, GH_, box) || was(-1100, 600);
  gaslamp = {
    id: 'gas_grate', name: 'Газовый фонарь', zone: 'street',
    x: g.x, y: g.gy - GH_, w: GW_, h: GH_, solidBox: { x: g.x + 6, y: g.gy - 9, w: 8, h: 4 },
    look: GAS_LOOK, drawSelf: drawGasLamp,
    useAction: 'gas_grate_down', useLabel: '<i>↓</i>РЕШЁТКА',
    light: { r: 44, color: [226, 150, 80], flicker: 0.06, dx: 10, dy: 5 },   // один горящий фонарь
  };
  locations.push(gaslamp);
  // U3, выход: люк — у градирни и цеха
  const works = archOf(locations, 7, 'plain', 'градирня и цех', TOWN.x1);
  const hp = placeIn(locations, 7, 'plain', HW_, HH_, works) || was(1000, -900, 1, 0);
  hatch = {
    id: 'factory_hatch', name: 'Люк на территории завода', zone: 'street',
    x: hp.x, y: hp.gy - HH_, w: HW_, h: HH_,
    look: HATCH_LOOK, drawSelf: drawHatch,
    useAction: 'factory_hatch_down', useLabel: '<i>↓</i>ЛЮК',
  };
  locations.push(hatch);
  // U4, вход: спуск в подвал — тоже у градирни и цеха, в стороне от люка
  const cp = placeIn(locations, 7, 'plain', BW_, BH_, works) || was(1060, -960, 1, 0);
  cellar = {
    id: 'factory_cellar', name: 'Спуск в подвал завода', zone: 'street',
    x: cp.x, y: cp.gy - BH_, w: BW_, h: BH_,
    look: CELLAR_LOOK, drawSelf: drawCellar,
    useAction: 'cellar_door', useLabel: '<i>↓</i>В ПОДВАЛ',
  };
  locations.push(cellar);
  // U4, выход: вагон 89 6 — во дворе-колодце, у его громкоговорителя
  const yard = locations.find(l => l.name === 'громкоговоритель двора-колодца')
    || archOf(locations, 8, 'east', 'город-соты', TOWN.x1);
  const vp = placeIn(locations, 8, 'east', VW_, VH_, yard) || was(1500, 900, 1, 0);
  carriage = {
    id: 'carriage_89', name: 'Вагон 89 6', zone: 'street',
    x: vp.x, y: vp.gy - VH_, w: VW_, h: VH_, solidBox: { x: vp.x + 10, y: vp.gy - 8, w: VW_ - 12, h: 6 },
    look: CARRIAGE_LOOK, drawSelf: drawCarriage,
    useAction: 'carriage_back', useLabel: '<i>↓</i>ЗАДНЯЯ ДВЕРЬ',
  };
  locations.push(carriage);
  // U5, вход: заклеенный вход метро — у экрана-фасада проспекта
  const screen = archOf(locations, 9, 'east', 'экран-фасад', TOWN.x1);
  const mp = placeIn(locations, 9, 'east', MW_, MH_, screen) || was(1700, 900, 1, 0);
  metro = {
    id: 'metro_sealed', name: 'Заклеенный вход метро', zone: 'street',
    x: mp.x, y: mp.gy - MH_, w: MW_, h: MH_, solidBox: { x: mp.x, y: mp.gy - 6, w: MW_, h: 5 },
    look: METRO_LOOK, drawSelf: drawMetro,
    useAction: 'metro_sealed', useLabel: '<i>↓</i>ПОД ЛЕНТУ',
  };
  locations.push(metro);
  // U7, вход: подсобка с морозилкой — у таблички «морозилка «ЖДЁТ ЛУЧШИХ ВРЕМЁН»» парка
  const plate = locations.find(l => l.name === 'морозилка «ЖДЁТ ЛУЧШИХ ВРЕМЁН»') || archOf(locations, 8, 'west', 'колесо обозрения', TOWN.x0);
  const fp = placeIn(locations, 8, 'west', PW_, PH_, plate) || was(-1560, 900);
  freezer = {
    id: 'park_freezer', name: 'Подсобка парка', zone: 'street',
    x: fp.x, y: fp.gy - PH_, w: PW_, h: PH_, solidBox: { x: fp.x, y: fp.gy - 6, w: PW_, h: 5 },
    look: FREEZER_LOOK, drawSelf: drawFreezerShed,
    useAction: 'freezer_down', useLabel: '<i>❄</i>МОРОЗИЛКА',
  };
  locations.push(freezer);
}
export const oldways = () => ({ nilometer, stave, colonnade, cathedral, gaslamp, hatch, cellar, carriage, metro, freezer });
