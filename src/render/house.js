// ═══════════════════════════════════════
// ДОМ ПРОБУЖДЕНИЯ — КАДР (world/house.js). Вид как у изнанки: стены лицом,
// пол сверху, передняя стена — полосой. Комната: обои выцвели, от снятой рамы —
// светлый прямоугольник; пол дощатый, в пыли; две кровати у стены — своя смята,
// вторая застелена туго; между ними табурет с журналом (закладка — единственный
// красный); в углу изразцовая печь, холодная. Сени: два пустых крючка, ботинки у
// порога, дверь на улицу — в передней стене, днём из-под неё серая полоса.
// Окно: ночью — темень и луна, на полу квадрат лунного света; днём — пыльный серый.
// Тёплое — только огонёк у сердца. Свет слева, кромка пеплом справа.
// ═══════════════════════════════════════
import { HW, HH, WH, ROOM, PART, SENI, FRONT, DOOR, BED, BED2, STOOL, STOVE, WINDOW, BOOTS, house } from '../world/house.js';

const NI = '#0D0B0A', AS = '#8A8D8F', BO = '#D9CFB8', KV = '#C23B2B';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K4 = '#3a3328';
const BR1 = '#2e2014', BR2 = '#3a2818', BR3 = '#46301c';
const L1 = '#c8b89a', L2 = '#b0a284', L3 = '#968a72';
const S0 = '#5a564e', S1 = '#4a463f', S2 = '#33302e';
const q = Math.round;
let G = null;
const r = (x, y, w, h, c) => { G.fillStyle = c; G.fillRect(x, y, w, h); };
function hh(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ── стена лицом: обои выцвели (редкий узор), панель снизу темнее, плинтус ──
function wallFace(x0, x1, y0, y1) {
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const d = y1 - y, k = x - x0;
    let c = d <= 2 ? K1 : d <= 9 ? (k % 9 === 0 ? K2 : S2) : (hh(x, y, 7) < 0.07 ? L3 : (x + y * 3) % 11 === 0 && (y & 1) ? L3 : S0);
    if (y === y0) c = K2;                                               // верх стены — в тень потолка
    if (d === 10) c = K2;                                               // край панели
    r(x, y, 1, 1, c);
  }
  r(x0, y0, 1, y1 - y0, S1);                                            // угол к свету
}
// пол: доски поперёк, стыки вразбежку; пыль; к стенам темнее
function floor(R) {
  for (let y = R.y0; y < R.y1; y++) {
    const row = Math.floor((y - R.y0) / 5), seam = (y - R.y0) % 5 === 4;
    for (let x = R.x0; x < R.x1; x++) {
      const joint = (x + row * 23) % 41 === 0;
      let c = seam || joint ? K1 : hh(row, Math.floor((x + row * 23) / 41), 3) < 0.4 ? BR2 : BR1;
      if (!seam && !joint && hh(x, y, 11) < 0.04) c = BR3;              // сучок, пыль
      if (y - R.y0 < 2) c = K0;                                         // у стены — тень
      r(x, y, 1, 1, c);
    }
  }
}
// ── статичное: стены, пол, перегородка, передняя стена; печётся раз ──
let base = null;
function bake() {
  if (base !== null) return base;
  let c = null;
  try { c = typeof document !== 'undefined' && document.createElement ? document.createElement('canvas') : null; } catch (e) { c = null; }
  if (!c || !c.getContext) { base = false; return base; }
  c.width = HW; c.height = HH;
  const prev = G;
  G = c.getContext('2d');
  try { drawStatic(); } finally { G = prev; }
  base = c;
  return base;
}
function drawStatic() {
  r(0, 0, HW, HH, NI);
  floor(ROOM); floor(SENI);
  floor({ x0: PART.x0, x1: PART.x1, y0: PART.g0, y1: PART.g1 });       // порожек проёма
  wallFace(ROOM.x0, ROOM.x1, ROOM.y0 - WH, ROOM.y0);
  wallFace(SENI.x0, SENI.x1, SENI.y0 - WH, SENI.y0);
  // от снятой рамы — прямоугольник светлее обоев
  for (let y = ROOM.y0 - 22; y < ROOM.y0 - 12; y++) for (let x = 104; x < 116; x++) r(x, y, 1, 1, (x === 104 || y === ROOM.y0 - 22) ? L3 : hh(x, y, 5) < 0.1 ? L3 : L2);
  r(109, ROOM.y0 - 24, 1, 2, K1);                                       // гвоздь остался
  // сени: два пустых крючка
  for (const hx of [170, 178]) { r(hx, SENI.y0 - 18, 1, 3, K1); r(hx + 1, SENI.y0 - 16, 1, 1, K1); r(hx + 1, SENI.y0 - 15, 1, 1, S1); }
  // окно: проём, рама, подоконник; стекло — в кадре (по времени суток)
  r(WINDOW.x0 - 1, WINDOW.y0 - 1, WINDOW.x1 - WINDOW.x0 + 2, WINDOW.y1 - WINDOW.y0 + 2, K1);
  r(WINDOW.x0, WINDOW.y0, WINDOW.x1 - WINDOW.x0, 1, L2); r(WINDOW.x0, WINDOW.y0, 1, WINDOW.y1 - WINDOW.y0, L2);
  r(WINDOW.x0 - 2, WINDOW.y1, WINDOW.x1 - WINDOW.x0 + 4, 2, L1); r(WINDOW.x0 - 2, WINDOW.y1 + 1, WINDOW.x1 - WINDOW.x0 + 4, 1, L3);
  // перегородка сверху: полоса от стены до передней стены, проём в ней
  for (const [y0, y1] of [[SENI.y0 - WH, PART.g0], [PART.g1, FRONT.y0]]) {
    r(PART.x0, y0, PART.x1 - PART.x0, y1 - y0, K2); r(PART.x0, y0, 1, y1 - y0, S2); r(PART.x1 - 1, y0, 1, y1 - y0, K0);
  }
  r(PART.x0, PART.g0 - 1, PART.x1 - PART.x0, 1, S1); r(PART.x0, PART.g1, PART.x1 - PART.x0, 1, K0);
  // наружные стены сверху: слева, справа, над сенями — темень; передняя — полосой
  r(0, ROOM.y0 - WH, ROOM.x0, FRONT.y1 - ROOM.y0 + WH, K2); r(0, ROOM.y0 - WH, 1, FRONT.y1 - ROOM.y0 + WH, S2);
  r(SENI.x1, SENI.y0 - WH, HW - SENI.x1, FRONT.y1 - SENI.y0 + WH, K2); r(HW - 1, SENI.y0 - WH, 1, FRONT.y1 - SENI.y0 + WH, AS);
  r(0, FRONT.y0, HW, FRONT.y1 - FRONT.y0, K2); r(0, FRONT.y0, HW, 1, S2); r(0, FRONT.y1 - 1, HW, 1, K0);
  // дверь в передней стене: проём, порог-доска, полотно прикрыто
  r(DOOR.x0, FRONT.y0, DOOR.x1 - DOOR.x0, FRONT.y1 - FRONT.y0, NI);
  r(DOOR.x0, FRONT.y0, DOOR.x1 - DOOR.x0, 1, L3);                       // порог
  r(DOOR.x0 + 1, FRONT.y0 + 1, DOOR.x1 - DOOR.x0 - 2, 2, BR2); r(DOOR.x0 + 1, FRONT.y0 + 1, 1, 2, BR3);   // полотно — ребром
  r(DOOR.x1 - 4, FRONT.y0 + 1, 1, 1, AS);                               // ручка
}

// ── кровать: изголовье у стены, матрас, одеяло; made — застелена туго ──
function bed(B, made) {
  const x0 = B.x0, x1 = B.x1, w = x1 - x0, y0 = B.y0, y1 = B.y1;
  r(x0, y0 - 6, w, 7, BR1); r(x0, y0 - 6, w, 1, BR3); r(x0, y0 - 6, 1, 7, BR3); r(x1 - 1, y0 - 6, 1, 7, K0);   // изголовье
  for (const k of [4, 9, 13, 18]) if (k < w - 1) r(x0 + k, y0 - 5, 1, 5, K1);   // прутья
  r(x0, y0 + 1, w, y1 - y0 - 1, K1);                                    // рама
  r(x0 + 1, y0 + 1, w - 2, y1 - y0 - 3, L3);                           // простыня
  r(x0 + 2, y0 + 2, w - 4, 5, made ? L1 : L2);                          // подушка
  if (!made) { r(x0 + 5, y0 + 4, 6, 1, L3); r(x0 + 4, y0 + 3, 1, 2, L3); }   // вмятина — помнит голову
  const by = y0 + 9;                                                    // одеяло
  if (made) {
    r(x0 + 1, by - 1, w - 2, 2, L1);                                    // отворот простыни — ровной полосой
    r(x0 + 1, by + 1, w - 2, y1 - by - 3, S2); r(x0 + 1, by + 1, 1, y1 - by - 3, S1); r(x1 - 2, by + 1, 1, y1 - by - 3, K2);
    r(x0 + 1, y1 - 3, w - 2, 1, S1);                                    // подоткнуто
  } else {
    for (let y = by; y < y1 - 2; y++) for (let x = x0 + 1; x < x1 - 1; x++) {
      const f = Math.sin((x - x0) * 0.9 + (y - by) * 0.45) + Math.sin((y - by) * 1.3 - (x - x0) * 0.3);
      if (y === by && x > x0 + w * 0.6) continue;                       // откинуто — видна простыня
      r(x, y, 1, 1, f > 1.1 ? S1 : f < -0.9 ? K2 : S2);
    }
    r(x1 - 3, y1 - 3, 3, 3, S2); r(x1 - 1, y1 - 1, 2, 2, K2);          // свесилось с края
  }
  r(x0, y1 - 2, w, 2, BR2); r(x0, y1 - 2, w, 1, BR3);                   // изножье
  r(x0, y1, 1, 2, K0); r(x1 - 1, y1, 1, 2, K0);                         // ножки
}
// табурет и журнал на нём: тёмная обложка, закладка киноварью
function stool() {
  const x = STOOL.x0, y = STOOL.y0, w = STOOL.x1 - STOOL.x0;
  r(x, y + 2, 1, 6, BR1); r(x + w - 1, y + 2, 1, 6, K1); r(x + 2, y + 5, w - 4, 1, BR1);   // ножки, перекладина
  r(x - 1, y - 1, w + 2, 3, BR2); r(x - 1, y - 1, w + 2, 1, BR3);       // сиденье
  r(x + 1, y - 5, w - 2, 4, K1); r(x + 1, y - 5, w - 2, 1, K4); r(x + 1, y - 5, 1, 4, K4);   // журнал закрыт
  r(x + w - 4, y - 1, 1, 2, KV);                                        // закладка
  r(x + 2, y - 3, 4, 1, K2);                                            // этикетка — пустая
}
// изразцовая печь: верх, лицо в плитке, чугунная дверца; холодная, зола у дверцы
function stove() {
  const x0 = STOVE.x0, x1 = STOVE.x1, w = x1 - x0, H = 30, top = STOVE.y0 - H, fy = STOVE.y1 - H;
  r(x0, top, w, fy - top, S1);                                          // верх
  for (let y = top; y < fy; y += 3) r(x0, y, w, 1, S2);
  r(x0, top, w, 1, L3);
  for (let y = fy; y < STOVE.y1; y++) for (let x = x0; x < x1; x++) {   // лицо: плитка, свет слева
    const tx = (x - x0) % 6, ty = (y - fy) % 6, edge = tx === 5 || ty === 5;
    r(x, y, 1, 1, edge ? S2 : x - x0 < 2 ? L2 : tx < 2 && ty < 2 ? L2 : L3);   // изразец в темноте — бледный, не светит
  }
  r(x1 - 1, fy, 1, H, AS);                                              // кромка пеплом
  r(x0, fy, w, 1, L2);                                                   // карниз
  const dx = x0 + 8;
  r(dx, STOVE.y1 - 11, 9, 7, K1); r(dx + 1, STOVE.y1 - 10, 7, 5, K0);   // дверца, темно
  for (const k of [2, 4, 6]) r(dx + k, STOVE.y1 - 9, 1, 3, K2);         // решётка
  r(dx + 8, STOVE.y1 - 8, 1, 1, AS);                                    // засов
  r(x0, STOVE.y1 - 1, w, 1, K0);
  for (let k = 0; k < 7; k++) r(dx - 1 + Math.floor(hh(k, 2, 9) * 11), STOVE.y1 + Math.floor(hh(k, 3, 9) * 3), 1, 1, AS);   // зола у дверцы
}
// ботинки у порога: стоптаны; один завалился
function boots() {
  const x = BOOTS.x, gy = BOOTS.gy;
  r(x - 6, gy - 4, 4, 4, K1); r(x - 7, gy - 1, 6, 1, K2); r(x - 6, gy - 4, 1, 3, K4); r(x - 7, gy, 6, 1, AS);   // стоит
  r(x - 5, gy - 5, 2, 1, BR2);                                          // шнурок
  r(x, gy - 2, 6, 3, K1); r(x, gy - 2, 6, 1, K4); r(x + 5, gy - 3, 2, 2, K2); r(x, gy + 1, 6, 1, AS);   // лежит на боку
  r(x + 2, gy - 1, 1, 1, S1);
}
// окно сейчас: ночь — темень и луна; день — пыльный серый
function windowGlass(sky) {
  const night = !sky || !sky.sun, x0 = WINDOW.x0 + 1, y0 = WINDOW.y0 + 1, w = WINDOW.x1 - WINDOW.x0 - 1, h = WINDOW.y1 - WINDOW.y0 - 1;
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
    let c = night ? (hh(x, y, 13) < 0.05 ? S2 : NI) : (hh(x, y, 13) < 0.25 ? L3 : AS);
    r(x, y, 1, 1, c);
  }
  if (night && sky && sky.moon > 0.3) { r(x0 + w - 6, y0 + 2, 3, 3, L2); r(x0 + w - 5, y0 + 1, 1, 1, L3); r(x0 + w - 7, y0 + 3, 1, 1, L3); }   // луна стоит низко
  const mx = x0 + Math.floor(w / 2);                                    // переплёт крестом
  r(mx, y0, 1, h, K1); r(x0, y0 + Math.floor(h / 2), w, 1, K1);
}
// квадрат света от окна на полу: косо, к нам шире; ночью — луна, днём — серый
function lightPatch(sky) {
  const night = !sky || !sky.sun, k = night ? (sky ? sky.moon || 0 : 0) * 0.14 : 0.1;
  if (k <= 0.01) return;
  G.globalAlpha = k; G.fillStyle = night ? BO : L1;
  for (let j = 0; j < 22; j++) {
    const y = ROOM.y0 + 2 + j, xl = WINDOW.x0 + 2 + q(j * 0.45), xr = WINDOW.x1 - 2 + q(j * 0.9);
    if (y > STOOL.y0 - 1 && y < STOOL.y1 + 1) { G.fillRect(xl, y, STOOL.x0 - 1 - xl, 1); G.fillRect(STOOL.x1 + 1, y, xr - STOOL.x1 - 1, 1); continue; }
    G.fillRect(xl, y, xr - xl, 1);
  }
  const cx = q((WINDOW.x0 + WINDOW.x1) / 2 + 6);                       // тень переплёта
  G.globalAlpha = k * 0.8; G.fillStyle = NI;
  for (let j = 2; j < 22; j++) G.fillRect(cx + q(j * 0.68), ROOM.y0 + 2 + j, 1, 1);
  G.fillRect(WINDOW.x0 + 6, ROOM.y0 + 13, WINDOW.x1 - WINDOW.x0 + 4, 1);
  G.globalAlpha = 1;
}
// из-под двери днём — серая полоса на пол сеней
function doorSpill(sky) {
  if (!sky || !sky.sun) return;
  G.globalAlpha = 0.18; G.fillStyle = L1;
  for (let j = 0; j < 5; j++) G.fillRect(DOOR.x0 + 2 - j, FRONT.y0 - 1 - j, DOOR.x1 - DOOR.x0 - 4 + 2 * j, 1);
  G.globalAlpha = 1;
}

// ═══ КАДР ДОМА ═══
// g — холст мира (уже сдвинут на камеру); p — странник; drawHero рисует его; sky — небо суток
export function drawHouseWorld(g, p, drawHero, sky) {
  G = g;
  const b = bake();
  if (b) g.drawImage(b, 0, 0); else drawStatic();
  G = g;
  windowGlass(sky);
  lightPatch(sky);
  doorSpill(sky);
  // вещи и странник — по глубине (по основанию)
  const list = [
    { k: BED.y1, f: () => bed(BED, false) }, { k: BED2.y1, f: () => bed(BED2, true) },
    { k: STOOL.y1, f: stool }, { k: STOVE.y1, f: stove },
    { k: p.y + 23, hero: true },
  ];
  if (house.boots) list.push({ k: BOOTS.gy, f: boots });
  list.sort((a, c) => a.k - c.k);
  for (const it of list) {
    if (it.hero) { drawHero(); G = g; continue; }
    G = g; it.f();
  }
}
export const _bakeReset = () => { base = null; };
