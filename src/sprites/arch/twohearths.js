// ═══ АРХИТЕКТУРА · два очага (XVII век) ═══
// Один век — пять очагов, не знающих друг о друге. Всё — набором (kit.js): тело неподвижно и
// запекается; лампа, жаровня, свеча, вывеска на цепях, армилла — слоем поверх.
// юг     — Исфахан: мечеть шаха — портал на площадь с двумя минаретами-карандашами, айван в
//          четыре центра (не стрельчатый), за ним, правее, — зал под луковичным куполом на
//          барабане, повёрнутый к Мекке; изразец хафт-ранги квадратами — швы видны (#2 — мечеть
//          шейха Лотфоллы: без минаретов и двора, портал сбоку от оси купола, купол набран
//          мозаикой и за день меняет свет). Кофейня в Йезде: сырцовый дом, бадгир со щелями,
//          куполок, аркада, на скамье брошенные нарды (#2 — стамбульская: эркер, решётки,
//          на скамье чашки вверх дном на блюдцах; #3 — сказитель с палкой у расписного занавеса).
// восток — Эдо: хижина Басё — сырцовые стены, соломенная иримоя, у порога банан с рваными
//          листьями, шляпа у стены. Застава сэкисё: ворота под черепицей, шлагбаум, частокол,
//          караульня с решёткой, доска указов под кровелькой за оградой, фонарь-андон.
//          Доминанта — Тадж-Махал: цоколь из мрамора на красном песчанике, четыре минарета
//          чуть врозь, айван с лампой, луковица на барабане с лотосом и полумесяцем (не крест),
//          беседки-чхатри; впереди пруд — в нём, сжатый, отражается сам мавзолей.
// запад  — Голландия: узкий дом со ступенчатым щипцом, балка с крюком, печная труба.
//          Мастерская линз под шейным щипцом с волютами, ставни наверху закрыты, витрина внизу
//          открыта, на кронштейне очки на цепях (#2 — Дельфт, лавка суконщика: штуки сукна,
//          в окне человек подносит к глазу крошечную линзу).
// север  — Ураниборг под снегом: кирпич, круглые башни с коническими кровлями, у левой щит
//          снят — в щели армилла; стена раскрыта — стенной квадрант, в дуге написан хозяин с
//          собакой (#2 — Стьернеборг: купола крипт вровень с сугробом, в одном щель с квадрантом,
//          лестница вниз, низкое окно — обед, под столом шут). Замок Тре Крунур: донжон со
//          шпилем и тремя коронами (костью: золота канон не даёт), крылья, угловые башенки,
//          снег и сосульки (#2 — пожар 1697-го: с чердака дым, в слуховом окне огонь, под
//          раскрытым окном в снегу огромная книга с чёртом во всю страницу, ящики трофеев).
// равнина — раскол: шатровая церковь — подклет, четверик, восьмерик, шатёр тёсом, главка
//          лемехом, крест восьмиконечный, крыльцо. Острог: тын, ворота под кровелькой, рубленая
//          башня; в разрезе берега — земляная тюрьма: решётка вровень с травой, на дне свеча,
//          узник и стопка исписанных листов.
// Фасады табличек: сырцовый дом с куполком, чайный домик, голландский щипец, сруб под дёрном.
// Утварь дворов (props): кальян, ковёр, тюки; каго, сакэ, три орудия заставы; тюльпан, кнехт,
// зрительная труба; пушка на полозьях, книги в дорогу, вешки зимней дороги; коновязь, пни
// вырубки, возок.

import { hang, tipOf, drawRope } from '../../world/hang.js';
import { plan, paint, MAT, FORM, tone, split } from './kit.js';
import { phaseAt, skyAt } from '../../world/sky.js';
const N = '#0D0B0A', BONE = '#D9CFB8', ASH = '#8A8D8F', MIST = '#3D4A3A',
  CANDLE = '#E28A3A', CINN = '#C23B2B', SEP = '#3A3026';
const D1 = '#15100c', D2 = '#241c14', WOOD = '#3a2418', PLANK = '#3a2818', BRICK = '#3a1c14',
  PAPER = '#c8b89a', PAPER2 = '#b0a284';
const B = BONE, A = ASH, M = MIST, C = CANDLE, K = CINN, S = SEP;

// ── набор (kit.js): прямоугольник краской, шум, пологая линия, смесь красок канона ──
function R(c, col, x, y, w, h) { c.fillStyle = col; c.fillRect(x, y, w, h); }
function noise(i, j, s) {
  let h = (i * 374761393 + j * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function hline(c, col, x0, y0, x1, y1) {
  c.fillStyle = col;
  const n = Math.abs(y1 - y0) + 1, sy = Math.sign(y1 - y0);
  for (let i = 0; i < n; i++) {
    const xa = Math.round(x0 + (x1 - x0) * i / n), xb = Math.round(x0 + (x1 - x0) * (i + 1) / n);
    c.fillRect(Math.min(xa, xb), y0 + sy * i, Math.max(1, Math.abs(xb - xa)), 1);
  }
}
function mix9(a, b, k) {
  const p = v => [1, 3, 5].map(i => parseInt(v.slice(i, i + 2), 16)), X = p(a), Y = p(b);
  return '#' + X.map((v, i) => Math.round(v + (Y[i] - v) * k).toString(16).padStart(2, '0')).join('');
}
// план строится раз — по первому зову
function lazyPlan(w, h, build) { let P = null; return () => P || (P = (() => { const Q = plan(w, h); build(Q); return Q; })()); }
// вид набором: план строится раз, рисуется в рамку w×h (x — середина, gy — земля); over — поверх
function kit(w, h, build, opt, over) {
  const get = lazyPlan(w, h, build);
  const d = (c, x, gy) => {
    const P = get(), X0 = Math.round(x) - (w >> 1), Y0 = Math.round(gy) - h;
    paint(c, X0, Y0, P, opt);
    if (over) over(c, X0, Y0, P);
  };
  d.static = true; d.plan = get;
  return d;
}
// фасад таблички набором: 18×30, px(цвет, dx, dy, w, h) — поверх
function signKit(build, opt, over) {
  const get = lazyPlan(18, 30, build);
  const d = (c, X, G) => {
    const X0 = Math.round(X) - 9, Y0 = Math.round(G) - 30;
    paint(c, X0, Y0, get(), opt);
    if (over) over((col, dx, dy, w = 1, h = 1) => R(c, col, X0 + dx, Y0 + dy, w, h));
  };
  d.static = true;
  return d;
}
const night = t => skyAt(phaseAt(t || 0)).name !== 'день';
// арка в четыре центра (персидская, могольская): прямые бока, плечи, острый верх — не готика
function arch4(P, x, yb, w, h, mat = MAT.DARK) {
  const a = Math.max(2, Math.round(w * 0.6)), top = yb - h;
  P.poly([[x, yb], [x, top + a], [x + w * 0.1, top + a * 0.5], [x + w * 0.28, top + a * 0.16], [x + w / 2, top],
    [x + w * 0.72, top + a * 0.16], [x + w * 0.9, top + a * 0.5], [x + w, top + a], [x + w, yb]], mat);
}
// купол: от шейки wb раздувается до wm на высоте ym, сходится к острию (point > 1 — луковица с
// вогнутым острием, < 1 — скруглённый верх); knee — где кончается шар и начинается остриё
function domePts(cx, yb, yt, wb, wm, ym, point = 1.4, knee = 0.6) {
  const half = y => {
    if (y >= ym) return wb / 2 + (wm - wb) / 2 * Math.sin((yb - y) / Math.max(1, yb - ym) * Math.PI / 2);
    const t = (ym - y) / Math.max(1, ym - yt);
    if (t <= knee) return wm / 2 * Math.sqrt(1 - t * t);
    return wm / 2 * Math.sqrt(1 - knee * knee) * Math.pow((1 - t) / (1 - knee), point);
  };
  const L = [], Rt = [];
  for (let y = yb; y >= yt; y--) { const h = half(y); L.push([cx - h, y]); Rt.unshift([cx + h, y]); }
  return [...L, ...Rt];
}
// полоса надписи: штрихи костью по строке — читается как письмо, не читается как текст
function script(c, x, y, w, seed, col = B) {
  for (let i = 0; i < w; i++) {
    const v = noise(i, seed, 17);                                   // от зерна, не от места: тело запекается
    if (v < 0.62) R(c, col, x + i, y, 1, 1);
    if (v > 0.9) R(c, col, x + i, y - 1, 1, 1);
  }
}

// ───────────────────────── ДОМИНАНТА · восток ─────────────────────────
// Тадж-Махал (набором). Мрамор на цоколе из мрамора, под ним терраса красного песчаника.
// Корпус со скошенными углами, портал-пиштак выше парапета, айван в четыре центра — в нём на
// цепи одна лампа; по бокам ниши в два яруса. Барабан, на нём луковица шире барабана (шейка уже),
// на верху лотос и навершие-калаш с полумесяцем рогами вверх — не крест. По углам беседки-чхатри.
// Четыре минарета по углам цоколя, задние — глубже и тусклее; все четыре чуть наклонены наружу
// (строили врозь: упадут — не на гробницу). Впереди пруд: каменная кромка, вода ночью, в воде —
// сам мавзолей, сжатый по высоте, рябью; «в пруду отражается этот».
const TAJ_KERB = 150, TAJ_WATER = 152, TAJ_NEAR = 187;
function minaret(P, xl, yTop, yBot, w, lean, belts, cap, dim) {
  P.trap(xl, xl + w - 1, xl + lean, xl + w - 1 + lean, yTop, yBot, MAT.MARBLE, FORM.CYL);
  if (dim) P.shade(dim);
  for (const y of belts) {
    const o = Math.round(lean * (yBot - y) / (yBot - yTop));
    P.box(xl - 1 + o, y, w + 2, 2, MAT.MARBLE); if (dim) P.shade(dim);
  }
  const cx = xl + lean + w / 2;
  P.box(Math.round(cx - w / 2 - 1), yTop - 2, w + 2, 2, MAT.MARBLE); if (dim) P.shade(dim);   // площадка
  P.box(Math.round(cx - w / 2), yTop - 6, w, 4, MAT.MARBLE); if (dim) P.shade(dim);            // беседка
  P.cut(Math.round(cx - 1), yTop - 5, 2, 3);
  P.round(cx, yTop - 6 - cap, yTop - 6, w + 1, MAT.MARBLE); if (dim) P.shade(dim);              // куполок
}
const tajBody = kit(120, 190, P => {
  minaret(P, 22, 80, 128, 5, -1, [112, 96], 4, 1);                  // задние
  minaret(P, 93, 80, 128, 5, 1, [112, 96], 4, 1);
  P.box(0, 142, 120, 8, MAT.REDSAND);                               // терраса красного песчаника
  P.box(6, 128, 108, 14, MAT.MARBLE);                               // цоколь
  for (let x = 11; x < 108; x += 8) arch4(P, x, 140, 4, 8);
  P.box(30, 78, 60, 50, MAT.MARBLE);                                // корпус
  P.box(30, 78, 6, 50, MAT.MARBLE).shade(1);                        // скошенные углы
  P.box(84, 78, 6, 50, MAT.MARBLE).shade(1);
  for (const x of [31, 85]) { arch4(P, x, 100, 4, 14); arch4(P, x, 124, 4, 18); }
  for (const x of [38, 76]) { arch4(P, x, 100, 6, 16); arch4(P, x, 124, 6, 20); }
  P.box(46, 68, 28, 60, MAT.MARBLE);                                // пиштак
  arch4(P, 52, 128, 16, 44);                                        // айван
  for (const cx of [40, 80]) {                                      // чхатри
    P.box(cx - 5, 74, 10, 4, MAT.MARBLE);
    P.box(cx - 4, 66, 8, 8, MAT.MARBLE);
    P.cut(cx - 2, 68, 4, 6);
    P.round(cx, 58, 66, 9, MAT.MARBLE, FORM.CYL);
  }
  P.box(44, 54, 32, 24, MAT.MARBLE, FORM.CYL);                      // барабан
  P.poly(domePts(60, 54, 11, 30, 44, 37, 1.6, 0.6), MAT.MARBLE, FORM.CYL);   // луковица
  minaret(P, 8, 66, 142, 6, -1, [122, 100, 80], 5, 0);              // передние
  minaret(P, 106, 66, 142, 6, 1, [122, 100, 80], 5, 0);
  P.box(0, TAJ_KERB, 120, 2, MAT.MARBLE);                           // дальняя кромка пруда
  P.box(0, TAJ_NEAR, 120, 3, MAT.REDSAND);                          // ближняя
}, { seed: 41, chip: 0.02, ao: 0 }, (c, X0, Y0, P) => {
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  // навершие: калаш из трёх шаров на стержне, полумесяц рогами вверх
  px(tone(MAT.MARBLE, 4), 60, 3, 1, 9);
  px(tone(MAT.MARBLE, 3), 59, 8, 3, 2); px(tone(MAT.MARBLE, 3), 59, 5, 3, 1);
  px(B, 58, 0, 1, 2); px(B, 62, 0, 1, 2); px(B, 59, 2, 3, 1);
  for (let x = 54; x <= 66; x += 2) px(tone(MAT.MARBLE, 4), x, 13 + (x === 54 || x === 66 ? 1 : 0), 1, 2);   // лотос
  for (const cx of [40, 80]) px(tone(MAT.MARBLE, 4), cx, 55, 1, 3);                                       // шпили чхатри
  // пиштак: рама, надпись по раме айвана, инкрустация в пазухах
  px(tone(MAT.MARBLE, 4), 47, 70, 26, 1); px(tone(MAT.MARBLE, 4), 47, 70, 1, 58); px(tone(MAT.MARBLE, 2), 72, 70, 1, 58);
  for (let y = 74; y < 126; y += 2) { px(tone(MAT.MARBLE, 1), 49, y, 1, 1); px(tone(MAT.MARBLE, 1), 70, y, 1, 1); }
  script(c, X0 + 50, Y0 + 72, 20, 7, tone(MAT.MARBLE, 1));
  for (const [x, y] of [[51, 88], [68, 88], [50, 92], [69, 92]]) px(mix9(K, S, 0.4), x, y);
  px(tone(MAT.MARBLE, 4), 30, 78, 60, 1);                                                               // парапет
  // в глубине айвана — дверь и решётка над ней
  px(N, 56, 112, 8, 16); px(N, 57, 110, 6, 2); px(N, 58, 108, 4, 2);
  for (let x = 57; x < 63; x += 2) px(tone(MAT.DARK, 3), x, 114, 1, 6);
  // пруд: вода ночью; в ней — мавзолей, сжатый по высоте, рябью; блики луны
  const WATER = mix9(N, M, 0.3), cache = new Map();
  const refl = m => { if (!cache.has(m)) cache.set(m, m === MAT.DARK ? mix9(N, WATER, 0.3) : mix9(tone(m, 2), WATER, 0.38)); return cache.get(m); };
  px(WATER, 0, TAJ_WATER, 120, TAJ_NEAR - TAJ_WATER);
  const rows = TAJ_NEAR - TAJ_WATER;
  for (let y = TAJ_WATER; y < TAJ_NEAR; y++) {
    const k = y - TAJ_WATER, ys = TAJ_KERB - 1 - Math.round(k * (TAJ_KERB - 2) / rows);
    if (k % 6 === 5) continue;                                                                          // строка ряби — пусто
    const rip = (k * 7) % 5 === 0 ? 1 : (k * 3) % 7 === 0 ? -1 : 0;
    let run = -1, col = null;
    for (let x = 0; x <= 120; x++) {
      const m = x < 120 ? P.at(x - rip, ys) : 0, cc = m && m !== MAT.REDSAND ? refl(m) : null;
      if (cc !== col) { if (col) px(col, run, y, x - run, 1); col = cc; run = x; }
    }
  }
  for (const [x, y, w] of [[22, 158, 5], [84, 166, 7], [44, 175, 4], [70, 181, 6], [12, 184, 3]]) px(tone(MAT.MARBLE, 2), x, y, w, 1);
  px(tone(MAT.MARBLE, 5), 58, 162, 4, 1);
});
// лампа в айване: одна, на цепи; дрожит
function tajLive(c, x, gy, t) {
  const X0 = Math.round(x) - 60, Y0 = Math.round(gy) - 190;
  R(c, A, X0 + 60, Y0 + 92, 1, 14);
  R(c, C, X0 + 59, Y0 + 106, 3, 3);
  if (((t || 0) / 9 | 0) % 3 === 0) R(c, S, X0 + 59, Y0 + 106, 1, 1);
}
const tajMahal = split(tajBody, tajLive);

// ───────────────────────── ЮГ ─────────────────────────
// мечеть Исфахана (набором): мечеть шаха. Портал-пиштак смотрит на площадь: высокая рама в
// изразце, айван в четыре центра (персидская арка, не готическая), в своде — соты-мукарнасы,
// внизу дверь; на портале два минарета-карандаша с балконом и шапкой. Зал за порталом правее и
// глубже — повёрнут к Мекке, поворот спрятан в проходе; барабан с окнами, луковица выше
// портала, острие с навершием (не крест). Перед залом двор — аркада в два яруса. Всё в изразце
// хафт-ранги: торопились — квадраты плитки, швы видны вблизи.
const mosque = kit(88, 92, P => {
  P.box(40, 58, 46, 34, MAT.KASHI).shade(1);                        // зал — глубже
  P.box(46, 44, 32, 14, MAT.KASHI, FORM.CYL);                       // барабан
  for (const wx of [50, 58, 66]) arch4(P, wx, 56, 4, 9);
  P.poly(domePts(62, 44, 6, 34, 40, 30, 1.3, 0.62), MAT.KASHI, FORM.CYL);
  P.box(38, 70, 50, 22, MAT.KASHI);                                 // двор: аркада в два яруса
  for (const ax of [42, 52, 62, 72]) { arch4(P, ax, 92, 7, 13); arch4(P, ax + 1, 77, 5, 5); }
  P.box(4, 28, 36, 64, MAT.KASHI);                                  // портал
  arch4(P, 10, 92, 24, 52);                                         // айван
  for (const mx of [5, 35]) {                                       // минареты на портале
    P.box(mx, 8, 4, 20, MAT.KASHI, FORM.CYL);
    P.box(mx - 1, 10, 6, 2, MAT.KASHI);
    P.box(mx, 5, 4, 3, MAT.KASHI, FORM.CYL);
    P.wedge(mx + 2, 1, 5, 1, 4, MAT.KASHI);
  }
}, { seed: 43, chip: 0.03 }, (c, X0, Y0, P) => {
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  // рама портала — жгут костью, надпись дугой над айваном
  px(tone(MAT.KASHI, 5), 5, 29, 34, 1); px(tone(MAT.KASHI, 5), 5, 29, 1, 63); px(tone(MAT.KASHI, 4), 38, 29, 1, 63);
  px(tone(MAT.KASHI, 5), 8, 32, 1, 60); px(tone(MAT.KASHI, 4), 35, 32, 1, 60); px(tone(MAT.KASHI, 5), 8, 32, 28, 1);
  script(c, X0 + 11, Y0 + 35, 22, 3);
  // мукарнасы: соты в своде айвана, ниже — дверь в глубине
  for (let r = 0; r < 4; r++) for (let i = 0; i < 6 - r; i++) px(tone(MAT.KASHI, 1), 13 + r * 2 + i * 3, 48 + r * 3, 2, 2);
  px(N, 18, 74, 8, 18); px(N, 19, 72, 6, 2); px(tone(MAT.KASHI, 2), 17, 73, 1, 19); px(tone(MAT.KASHI, 2), 26, 73, 1, 19);
  // купол: пояс надписи по барабану, навершие — стержень и шар
  script(c, X0 + 47, Y0 + 45, 30, 9, tone(MAT.KASHI, 5));
  px(tone(MAT.KASHI, 4), 61, 4, 3, 2); px(tone(MAT.KASHI, 5), 62, 1, 1, 3);   // навершие: шар на острие и игла — не крест
  // плитка двора: пояс по верху аркады
  for (let x = 39; x < 87; x += 2) px(tone(MAT.KASHI, 4), x, 71, 1, 1);
});
// мечеть #2 (набором): мечеть шейха Лотфоллы. Без минаретов и без двора: строили не для площади,
// а для своих. Портал — сбоку, купол не на его оси (поворот к Мекке спрятан в проходе). Барабан с
// окнами-решётками, купол низкий, без шейки, набран мозаикой — осколок к осколку, швов нет.
// Свет на куполе — слоем поверх: с утра бледнее, к закату розовее, днём по изразцу бегут блики.
const lotfPlan = lazyPlan(88, 92, P => {
  P.box(26, 66, 60, 26, MAT.MOSAIC);
  P.box(32, 46, 48, 20, MAT.MOSAIC, FORM.CYL);
  for (let i = 0; i < 5; i++) arch4(P, 35 + i * 9, 62, 5, 11);
  P.poly(domePts(56, 46, 12, 46, 48, 38, 1.15, 0.7), MAT.MOSAIC, FORM.CYL);
  P.box(2, 40, 28, 52, MAT.MOSAIC);
  arch4(P, 8, 92, 16, 40);
});
const LOTF_DOME = [56, 30];
function lotfBody(c, x, gy) {
  const P = lotfPlan(), X0 = Math.round(x) - 44, Y0 = Math.round(gy) - 92;
  paint(c, X0, Y0, P, { seed: 47, chip: 0.02 });
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  px(tone(MAT.MOSAIC, 5), 3, 41, 26, 1); px(tone(MAT.MOSAIC, 5), 3, 41, 1, 51); px(tone(MAT.MOSAIC, 4), 28, 41, 1, 51);
  script(c, X0 + 6, Y0 + 44, 20, 5);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) px(tone(MAT.MOSAIC, 1), 11 + r * 2 + i * 3, 60 + r * 3, 2, 2);
  px(N, 12, 76, 8, 16); px(N, 13, 74, 6, 2);
  for (let i = 0; i < 5; i++) for (let y = 53; y < 62; y += 2) px(tone(MAT.MOSAIC, 3), 35 + i * 9, y, 5, 1);   // решётки окон
  script(c, X0 + 33, Y0 + 47, 46, 13, tone(MAT.MOSAIC, 5));
  px(tone(MAT.MOSAIC, 4), 55, 10, 3, 2); px(tone(MAT.MOSAIC, 5), 56, 7, 1, 3);
}
lotfBody.static = true;
let lotfSpans = null;
function lotfLive(c, x, gy, t) {
  const P = lotfPlan(), X0 = Math.round(x) - 44, Y0 = Math.round(gy) - 92;
  if (!lotfSpans) {                                                  // строки купола — раз
    const id = P.partAt(LOTF_DOME[0], LOTF_DOME[1]);
    lotfSpans = [];
    for (let y = 0; y < 92; y++) { let a = -1; for (let i = 0; i <= 88; i++) { const on = i < 88 && P.partAt(i, y) === id; if (on && a < 0) a = i; if (!on && a >= 0) { lotfSpans.push([a, y, i - a]); a = -1; } } }
  }
  const ph = skyAt(phaseAt(t || 0)).name;
  const tint = ph === 'рассвет' ? [B, 0.16] : ph === 'сумерки' ? [mix9(B, K, 0.5), 0.22] : null;
  if (tint) { c.globalAlpha = tint[1]; for (const [a, y, w] of lotfSpans) R(c, tint[0], X0 + a, Y0 + y, w, 1); c.globalAlpha = 1; }
  if (ph === 'ночь') return;
  const k = ((t || 0) / 30) | 0;                                     // блики бегут по изразцу
  for (let i = 0; i < 5; i++) {
    const s = lotfSpans[Math.floor(noise(k, i, 3) * lotfSpans.length)];
    R(c, tone(MAT.MOSAIC, 5), X0 + s[0] + Math.floor(noise(k, i, 4) * s[2]), Y0 + s[1], 1, 1);
  }
}
const mosque2 = split(lotfBody, lotfLive);

// кофейня с бадгиром (набором): Йезд. Сырцовый дом с плоской кровлей, над ним бадгир — башня
// ловит ветер щелями и спускает к скамьям; гребёнка рёбер по верху. На кровле куполок, у края
// печная труба (дым — из неё, бадгир не дымит). Аркада в четыре центра: в левой арке скамья-тахт
// с нардами — брошены посреди партии, кости как упали; в средней жаровня. На стене указ с печатью.
const coffeeBody = kit(64, 66, P => {
  P.box(2, 34, 60, 32, MAT.MUD);
  P.box(2, 32, 60, 2, MAT.MUD);
  P.box(6, 6, 14, 28, MAT.MUD);                                     // бадгир
  for (const sx of [8, 12, 16]) P.cut(sx, 9, 2, 15);
  for (let cx = 6; cx < 20; cx += 3) P.box(cx, 3, 2, 3, MAT.MUD);
  P.round(42, 20, 32, 20, MAT.BAKED);                               // куполок
  P.box(56, 25, 4, 7, MAT.MUD);                                     // печная труба
  for (const ax of [12, 26, 40]) arch4(P, ax, 66, 10, 22);
  P.cut(55, 50, 6, 16);
}, { seed: 51, chip: 0.04, cracks: 3 }, (c, X0, Y0) => {
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  px(tone(MAT.TIMBER, 3), 13, 59, 8, 2); px(tone(MAT.TIMBER, 1), 13, 61, 1, 5); px(tone(MAT.TIMBER, 1), 20, 61, 1, 5);   // тахт
  px(PAPER2, 14, 58, 4, 1); px(B, 19, 58, 1, 1); px(B, 21, 57, 1, 1);                                                  // нарды, кости
  px(A, 28, 63, 6, 3);                                                                                                  // жаровня
  px(PAPER, 50, 40, 4, 6); px(K, 51, 43, 2, 2);                                                                         // указ, печать
  px(tone(MAT.MUD, 4), 2, 33, 60, 1);
});
function coffeeLive(c, x, gy, t) {
  const X0 = Math.round(x) - 32, Y0 = Math.round(gy) - 66;
  R(c, C, X0 + 29, Y0 + 61, 4, 2);
  if (((t || 0) / 7 | 0) % 4 === 1) R(c, S, X0 + 30 + (((t || 0) / 28 | 0) % 2), Y0 + 61, 1, 1);
}
const coffeeHouse = split(coffeeBody, coffeeLive);
// кофейня #2 (набором): стамбульская. Каменный низ, лавка открыта тремя проёмами; деревянный верх
// нависает, посредине эркер, окна в решётках-кафес; черепица на вальме, труба. На лавке-пейке
// вдоль фасада — блюдца, на каждом чашка вверх дном: ждут, пока гуща стечёт и подсохнет.
const coffee2 = kit(64, 66, P => {
  P.box(4, 44, 56, 22, MAT.ASHLAR);
  for (const [x, w] of [[8, 14], [26, 14], [44, 12]]) P.cut(x, 50, w, 16);
  P.box(1, 24, 62, 20, MAT.CLAPBOARD);
  P.box(22, 25, 20, 18, MAT.CLAPBOARD);                             // эркер
  for (const [x, w] of [[5, 10], [25, 14], [49, 10]]) P.cut(x, 28, w, 10);
  P.trap(0, 63, 9, 54, 12, 24, MAT.TILE);
  P.box(46, 5, 4, 8, MAT.ASHLAR);
}, { seed: 53, chip: 0.03 }, (c, X0, Y0) => {
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  for (const [x, w] of [[5, 10], [25, 14], [49, 10]]) for (let i = 0; i < w; i += 2) for (let j = 0; j < 10; j += 2) px(tone(MAT.TIMBER, 2), x + i + (j & 2 ? 1 : 0), 28 + j, 1, 1);   // кафес
  for (const bx of [3, 20, 43, 60]) hline(c, tone(MAT.TIMBER, 2), X0 + bx, Y0 + 44, X0 + bx + (bx < 32 ? 2 : -2), Y0 + 47);   // кронштейны
  px(tone(MAT.CLAPBOARD, 5), 22, 25, 20, 1);
  px(tone(MAT.TIMBER, 3), 5, 60, 54, 2); for (const lx of [6, 31, 57]) px(tone(MAT.TIMBER, 1), lx, 62, 1, 4);           // пейке
  for (let i = 0; i < 5; i++) { px(PAPER, 9 + i * 10, 59, 3, 1); px(B, 10 + i * 10, 57, 2, 2); }                        // блюдца, чашки вверх дном
  px(PAPER2, 49, 58, 4, 2);                                                                                              // поднос
});
// кофейня #3 (набором): вечер со сказителем. Сырцовый фасад, большой айван раскрыт внутрь: на
// задней стене расписной занавес — Рустам и юноша бьются; сказитель стоит сбоку и показывает
// палкой; на полу ряд голов слушателей. Под сводом лампа — слоем поверх.
const coffee3Body = kit(64, 66, P => {
  P.box(0, 12, 64, 54, MAT.MUD);
  P.box(0, 10, 64, 2, MAT.MUD);
  arch4(P, 8, 66, 48, 52);
  P.cut(2, 30, 4, 8); P.cut(58, 30, 4, 8);
}, { seed: 57, chip: 0.04, cracks: 2 }, (c, X0, Y0) => {
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  const CL = mix9(PAPER2, N, 0.25);
  px(A, 15, 27, 32, 1); px(CL, 16, 28, 30, 18); px(A, 15, 46, 32, 1);                     // занавес
  px(mix9(K, S, 0.3), 19, 37, 7, 3); px(mix9(K, S, 0.3), 20, 40, 1, 3); px(mix9(K, S, 0.3), 25, 40, 1, 3);   // конь Рустама
  px(S, 22, 33, 2, 4); px(S, 22, 31, 2, 2); hline(c, A, X0 + 24, Y0 + 32, X0 + 29, Y0 + 30);                  // Рустам, меч
  px(mix9(M, S, 0.4), 36, 37, 7, 3); px(mix9(M, S, 0.4), 37, 40, 1, 3); px(mix9(M, S, 0.4), 42, 40, 1, 3);   // конь юноши
  px(S, 38, 33, 2, 4); px(S, 38, 31, 2, 2); hline(c, A, X0 + 37, Y0 + 32, X0 + 32, Y0 + 30);
  px(mix9(S, N, 0.3), 16, 44, 30, 2);                                                                         // земля на холсте
  px(tone(MAT.FELT, 2), 48, 49, 3, 13); px(tone(MAT.FELT, 3), 48, 49, 1, 13); px(S, 48, 46, 3, 3);           // сказитель
  hline(c, B, X0 + 48, Y0 + 51, X0 + 41, Y0 + 39);                                                            // палка
  for (let i = 0; i < 9; i++) { px(mix9(S, N, 0.4), 12 + i * 4, 60, 3, 2); px(mix9(S, N, 0.2), 12 + i * 4, 62, 3, 4); }   // слушатели
  px(tone(MAT.MUD, 4), 0, 11, 64, 1);
});
function coffee3Live(c, x, gy, t) {
  const X0 = Math.round(x) - 32, Y0 = Math.round(gy) - 66;
  R(c, A, X0 + 32, Y0 + 15, 1, 8);
  R(c, C, X0 + 31, Y0 + 23, 3, 2);
  if (noise((t || 0) / 11 | 0, 1, 5) < 0.4) R(c, S, X0 + 33, Y0 + 23, 1, 1);
}
const coffee3 = split(coffee3Body, coffee3Live);

// ───────────────────────── ВОСТОК ─────────────────────────
// хижина Басё (набором): сырцовые стены в столбах, соломенная иримоя — вальма внизу, щипец вверху,
// конёк в бамбуковой обвязке; под стрехой узкая веранда, раздвинутая дверь в темноту, окно в
// решётке. У порога банан-басё: ствол и широкие листья, ветер изорвал их в лапшу — по нему
// и названа хижина, по хижине — хозяин. На стене шляпа-каса на гвозде: хозяин снова ушёл.
const bashoHut = kit(66, 46, P => {
  P.box(18, 28, 32, 18, MAT.MUD);
  for (const x of [18, 33, 48]) P.box(x, 28, 2, 18, MAT.TIMBER);
  P.cut(36, 30, 10, 12);
  P.cut(22, 32, 8, 6);
  P.box(15, 41, 38, 2, MAT.TIMBER);
  P.trap(9, 57, 18, 48, 15, 28, MAT.THATCH);                        // вальма
  P.wedge(33, 6, 16, 2, 22, MAT.THATCH);                            // щипец
  P.box(25, 6, 17, 2, MAT.TIMBER);                                  // конёк в обвязке
  // банан у порога: ствол и рваные листья
  P.box(6, 22, 3, 24, MAT.MOSS);
  for (const pts of [[[7, 25], [0, 22], [0, 15], [2, 13], [8, 20]], [[6, 23], [0, 11], [1, 6], [4, 5], [9, 19]],
    [[8, 20], [9, 6], [12, 3], [16, 5], [11, 22]], [[9, 23], [13, 14], [17, 12], [18, 17], [11, 26]]]) P.poly(pts, MAT.MOSS);
  for (const [x, y, n, dx] of [[0, 17, 4, 1], [1, 9, 4, 1], [2, 13, 3, 1], [14, 6, 4, -1], [15, 10, 3, -1], [17, 14, 3, -1]])
    for (let i = 0; i < n; i++) P.clear(x + i * dx, y + i, 1, 1);
}, { seed: 61, moss: 0.1 }, (c, X0, Y0) => {
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  for (let x = 23; x < 30; x += 2) px(tone(MAT.TIMBER, 2), x, 32, 1, 6);                                 // решётка окна
  px(PAPER2, 36, 30, 3, 12); for (let y = 32; y < 42; y += 3) px(tone(MAT.TIMBER, 2), 36, y, 3, 1);     // сёдзи сдвинуты
  px(A, 22, 29, 1, 1); px(tone(MAT.THATCH, 4), 21, 30, 3, 1); px(tone(MAT.THATCH, 3), 20, 31, 5, 1);      // шляпа-каса на гвозде
  px(tone(MAT.THATCH, 1), 19, 32, 7, 1);
  px(tone(MAT.ROCK, 3), 38, 44, 4, 2); px(tone(MAT.ROCK, 2), 44, 45, 3, 1);                              // камни у порога
  for (let x = 26; x < 42; x += 3) px(tone(MAT.TIMBER, 1), x, 7, 1, 1);                                   // обвязка конька
});
// застава сэкисё (набором): ворота на столбах под черепицей, створки распахнуты, поперёк проезда —
// шлагбаум. По сторонам частокол досками. За оградой справа — караульня, решётка в окне; слева над
// оградой — доска указов на двух столбах под своей кровелькой. У ворот фонарь-андон на столбе.
const sekisho = kit(80, 50, P => {
  P.box(58, 20, 20, 14, MAT.SHIKKUI);                               // караульня
  P.trap(55, 79, 59, 75, 13, 20, MAT.KAWARA);
  P.cut(62, 24, 8, 6);
  P.box(6, 18, 2, 14, MAT.TIMBER); P.box(18, 18, 2, 14, MAT.TIMBER); // доска указов
  P.box(4, 15, 18, 9, MAT.BOARD);
  P.wedge(13, 9, 14, 4, 22, MAT.KAWARA);
  P.box(0, 30, 24, 20, MAT.BOARD); P.box(0, 29, 24, 2, MAT.TIMBER);  // частокол
  P.box(56, 34, 24, 16, MAT.BOARD); P.box(56, 33, 24, 2, MAT.TIMBER);
  P.box(26, 16, 3, 34, MAT.TIMBER); P.box(51, 16, 3, 34, MAT.TIMBER); // ворота
  P.box(24, 16, 32, 3, MAT.TIMBER);
  P.trap(19, 60, 25, 54, 6, 16, MAT.KAWARA);
  P.box(25, 4, 30, 2, MAT.KAWARA);
  P.box(29, 22, 3, 28, MAT.BOARD); P.box(48, 22, 3, 28, MAT.BOARD); // створки
  P.box(58, 40, 2, 10, MAT.TIMBER); P.box(56, 33, 6, 7, MAT.SHIKKUI); // андон
}, { seed: 63, chip: 0.02 }, (c, X0, Y0) => {
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  px(tone(MAT.BOARD, 5), 5, 16, 16, 7); for (let y = 17; y < 23; y += 2) script(c, X0 + 6, Y0 + y, 12, y, tone(MAT.BOARD, 1));   // указы
  for (let x = 63; x < 70; x += 2) px(tone(MAT.TIMBER, 2), x, 24, 1, 6);                                 // решётка караульни
  px(tone(MAT.TIMBER, 4), 31, 37, 18, 1); px(tone(MAT.TIMBER, 2), 31, 38, 18, 1); px(tone(MAT.TIMBER, 1), 33, 38, 1, 12);   // шлагбаум
  px(tone(MAT.SHIKKUI, 2), 56, 35, 6, 1); px(tone(MAT.TIMBER, 1), 58, 34, 2, 6);                        // андон: рамка
  for (let x = 2; x < 24; x += 3) px(tone(MAT.BOARD, 1), x, 31, 1, 19);
  for (let x = 58; x < 80; x += 3) px(tone(MAT.BOARD, 1), x, 35, 1, 15);
});

// ───────────────────────── ЗАПАД ─────────────────────────
// дом с печью (набором): узкий амстердамский дом, кирпич, ступенчатый щипец с песчаниковыми
// ступенями, в щипце дверца чердака и над ней балка с крюком — мебель поднимают в окно. Окна
// высокие в белых рамах, ставни, анкеры по этажам. Сбоку печная труба — топится исправно.
const stoveHouse = kit(32, 88, P => {
  P.box(24, 1, 4, 14, MAT.BRICK);                                   // печная труба
  P.box(2, 22, 28, 66, MAT.BRICK);
  P.box(4, 16, 24, 6, MAT.BRICK); P.box(7, 10, 18, 6, MAT.BRICK); P.box(10, 5, 12, 5, MAT.BRICK); P.box(13, 2, 6, 3, MAT.BRICK);
  P.cut(13, 9, 6, 7);
  P.box(15, 5, 2, 3, MAT.TIMBER);                                   // балка
  for (const y of [26, 42, 58]) { P.cut(6, y, 8, 11, MAT.GLASS); P.cut(18, y, 8, 11, MAT.GLASS); }
  P.cut(6, 74, 8, 10, MAT.GLASS); P.cut(18, 72, 8, 16);
  P.box(16, 86, 12, 2, MAT.ASHLAR);
}, { seed: 67, chip: 0.03, soot: [[24, 2, 4, 3]] }, (c, X0, Y0) => {
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  const SD = tone(MAT.MARBLE, 4);
  for (const [x, y, w] of [[2, 21, 3], [27, 21, 3], [4, 15, 4], [24, 15, 4], [7, 9, 4], [21, 9, 4], [10, 4, 4], [18, 4, 4], [13, 1, 6]]) px(SD, x, y, w, 1);   // песчаник ступеней
  px(A, 16, 8, 1, 4); px(A, 15, 11, 1, 1);                                                                // крюк
  for (const y of [26, 42, 58, 74]) for (const x of [6, 18]) {
    if (y === 74 && x === 18) continue;
    px(B, x - 1, y - 1, 10, 1); px(B, x - 1, y, 1, 11); px(B, x + 8, y, 1, 11); px(B, x + 3, y, 2, 11); px(B, x - 1, y + 5, 10, 1);
    px(tone(MAT.BRICK, 4), x - 1, y + 11, 10, 1);
  }
  for (const y of [40, 56, 72]) { px(A, 3, y, 2, 1); px(A, 27, y, 2, 1); }                                // анкеры
  px(B, 17, 71, 10, 1); px(tone(MAT.TIMBER, 2), 19, 74, 6, 14);                                           // дверь
});
// мастерская линз (набором): шейный щипец — узкая шея над широким домом, на плечах волюты
// песчаником, сверху фронтон. Наверху ставни закрыты, внизу витрина открыта, нижний ставень
// откинут прилавком, на нём линзы. С левого угла на кронштейне — вывеска-очки на цепях (поверх).
const lensBody = kit(50, 64, P => {
  P.box(6, 22, 38, 42, MAT.BRICK);
  P.box(16, 8, 18, 14, MAT.BRICK);
  P.poly([[6, 22], [6, 19], [9, 16], [13, 14], [16, 14], [16, 22]], MAT.MARBLE);
  P.poly([[44, 22], [44, 19], [41, 16], [37, 14], [34, 14], [34, 22]], MAT.MARBLE);
  P.clear(10, 18, 2, 2); P.clear(38, 18, 2, 2);
  P.wedge(25, 2, 8, 2, 22, MAT.MARBLE);
  P.cut(22, 11, 6, 8);
  for (const wx of [10, 22, 34]) P.box(wx, 26, 7, 12, MAT.BOARD);  // ставни закрыты
  P.cut(10, 44, 22, 13, MAT.GLASS);
  P.cut(36, 44, 6, 20);
  P.box(10, 57, 22, 2, MAT.TIMBER);
}, { seed: 71, chip: 0.03 }, (c, X0, Y0) => {
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  for (const wx of [10, 22, 34]) { px(tone(MAT.BOARD, 1), wx + 3, 26, 1, 12); hline(c, tone(MAT.BOARD, 1), X0 + wx, Y0 + 37, X0 + wx + 6, Y0 + 27); }
  px(B, 9, 43, 24, 1); px(B, 9, 43, 1, 14); px(B, 32, 43, 1, 14); px(B, 20, 43, 1, 14);
  for (const [x, y] of [[12, 51], [15, 49], [18, 52], [24, 50], [27, 52], [13, 56], [22, 56], [28, 56]]) { px(tone(MAT.GLASS, 5), x, y, 2, 1); px(tone(MAT.GLASS, 3), x, y + 1, 2, 1); }   // линзы
  px(tone(MAT.TIMBER, 1), 11, 59, 1, 5); px(tone(MAT.TIMBER, 1), 30, 59, 1, 5);
  px(tone(MAT.MARBLE, 2), 10, 18, 1, 1); px(tone(MAT.MARBLE, 2), 39, 18, 1, 1);                         // завиток волют
  px(tone(MAT.IRON, 3), 1, 32, 6, 1); px(tone(MAT.IRON, 3), 6, 31, 1, 3);                               // кронштейн
  px(tone(MAT.TIMBER, 2), 37, 46, 4, 18);
});
function lensLive(c, x, gy) {
  const L0 = Math.round(x) - 25, G0 = Math.round(gy);
  const sg = hang(`lens:${L0}:${G0}`, L0 + 3.5, G0 - 32, 3, { sail: 0.05, damp: 0.994, gy: G0, r: 4 });
  const tp = tipOf(sg), ox = Math.round(tp.x - (L0 + 3.5)), oy = Math.round(tp.y - (G0 - 29));
  drawRope(c, [{ x: L0 + 2, y: G0 - 32 }, { x: L0 + 1 + ox, y: G0 - 30 + oy }], A);
  drawRope(c, [{ x: L0 + 5, y: G0 - 32 }, { x: L0 + 6 + ox, y: G0 - 30 + oy }], A);
  const I = tone(MAT.IRON, 3), G = tone(MAT.GLASS, 4);
  for (const dx of [0, 4]) { R(c, I, L0 + dx + ox, G0 - 30 + oy, 3, 3); R(c, G, L0 + dx + 1 + ox, G0 - 29 + oy, 1, 1); }
  R(c, I, L0 + 3 + ox, G0 - 30 + oy, 1, 1);
}
const lensShop = split(lensBody, lensLive);
// мастерская линз #2 (набором): Дельфт, лавка суконщика. Колокольный щипец, внизу лавка открыта —
// штуки сукна в стопках, две вынесены на скамью; наверху в окне хозяин подносит к глазу крошечную
// линзу — блик с булавочную головку: считает нитки, а смотрит в каплю.
const lens2 = kit(50, 64, P => {
  P.box(6, 20, 38, 44, MAT.BRICK);
  P.poly([[8, 20], [8, 16], [12, 12], [14, 8], [18, 5], [25, 3], [32, 5], [36, 8], [38, 12], [42, 16], [42, 20]], MAT.BRICK);
  P.cut(22, 9, 6, 6);
  P.cut(12, 24, 8, 10, MAT.GLASS); P.cut(30, 24, 8, 10);
  P.cut(8, 42, 26, 16);
  P.cut(37, 42, 5, 22);
  P.box(7, 40, 28, 2, MAT.TIMBER);
}, { seed: 73, chip: 0.03 }, (c, X0, Y0) => {
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  const ED = tone(MAT.MARBLE, 4);
  for (const [x, y] of [[8, 16], [12, 12], [14, 8], [18, 5], [25, 3], [32, 5], [36, 8], [38, 12], [42, 16]]) px(ED, x - 1, y - 1, 2, 1);   // кромка щипца
  px(B, 11, 23, 10, 1); px(B, 29, 23, 10, 1); px(B, 15, 24, 1, 10); px(B, 33, 24, 1, 10);
  px(S, 32, 27, 3, 3); px(S, 31, 30, 5, 4); px(tone(MAT.FELT, 2), 34, 28, 2, 1); px(B, 35, 27, 1, 1);    // хозяин с линзой у глаза
  const BOLT = [mix9(K, S, 0.45), mix9(M, S, 0.2), PAPER2, A, mix9(S, B, 0.3)];
  for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { px(BOLT[(r + i) % 5], 10 + i * 6, 45 + r * 4, 5, 3); px(tone(MAT.DARK, 3), 10 + i * 6, 47 + r * 4, 5, 1); }   // штуки сукна
  px(tone(MAT.TIMBER, 3), 9, 60, 26, 2); px(tone(MAT.TIMBER, 1), 10, 62, 1, 2); px(tone(MAT.TIMBER, 1), 33, 62, 1, 2);
  px(BOLT[0], 12, 57, 6, 3); px(BOLT[1], 20, 57, 6, 3);
  px(tone(MAT.TIMBER, 2), 38, 44, 3, 20);
});

// ───────────────────────── СЕВЕР ─────────────────────────
// островная обсерватория (набором): Ураниборг на Вене под снегом. Кирпич с песчаником; середина —
// корпус под вальмой, из неё башенка с куполком и шпилем; по бокам две круглые башни-наблюдательни
// под конусами. У левой щит кровли снят — в щели армилла (кольца поворачиваются — поверх). Стена
// корпуса раскрыта: стенной квадрант в полстены — дуга с делениями, внутри дуги написан красками
// сам хозяин за столом и собака у ног. Наблюдает исправно, в том числе в пасмурную погоду.
const uraniBody = kit(80, 70, P => {
  P.trap(20, 59, 26, 53, 22, 32, MAT.ROOFIRON);
  P.box(22, 32, 36, 38, MAT.BRICK);
  P.box(35, 10, 10, 14, MAT.BRICK, FORM.CYL);
  P.poly(domePts(40, 10, 2, 10, 12, 7, 1.2, 0.6), MAT.ROOFIRON, FORM.CYL);
  for (const x of [4, 58]) { P.box(x, 36, 18, 34, MAT.BRICK, FORM.CYL); P.wedge(x + 9, 16, 36, 1, 21, MAT.ROOFIRON); }
  P.cut(10, 20, 5, 16);                                             // снятый щит кровли
  for (const [x, y] of [[9, 44], [15, 56], [63, 44], [69, 56]]) P.cut(x, y, 3, 5);
  P.cut(27, 38, 27, 28);                                            // раскрытая стена: квадрант
  P.box(22, 66, 36, 4, MAT.ASHLAR);
}, { seed: 79, snow: 0.55, chip: 0.02 }, (c, X0, Y0) => {
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  px(tone(MAT.ROOFIRON, 4), 40, 0, 1, 3);                                                                 // шпиль
  // квадрант: центр вверху справа, дуга вниз-влево, деления внутрь
  const cx = 52, cy = 40, r = 24;
  for (let a = 0; a <= 90; a += 1.5) {
    const rad = a * Math.PI / 180, x = Math.round(cx - r * Math.sin(rad)), y = Math.round(cy + r * Math.cos(rad));
    if (x >= 27 && y < 66) { px(B, x, y); if (a % 9 < 1.5) px(A, Math.round(cx - (r - 2) * Math.sin(rad)), Math.round(cy + (r - 2) * Math.cos(rad))); }
  }
  hline(c, A, X0 + cx, Y0 + cy, X0 + 33, Y0 + 57);                                                        // алидада
  px(mix9(K, S, 0.5), 43, 55, 4, 6); px(S, 43, 52, 3, 3); px(B, 44, 53, 1, 1);                             // хозяин написан красками
  px(tone(MAT.TIMBER, 2), 47, 57, 6, 1); px(tone(MAT.TIMBER, 1), 48, 58, 1, 3); px(PAPER2, 48, 56, 3, 1);  // стол, лист
  px(tone(MAT.FELT, 3), 38, 61, 4, 2); px(tone(MAT.FELT, 3), 37, 60, 2, 1);                               // собака
  px(tone(MAT.BRICK, 4), 22, 33, 36, 1);
});
function uraniLive(c, x, gy, t) {
  const X0 = Math.round(x) - 40, Y0 = Math.round(gy) - 70, cx = X0 + 12.5, cy = Y0 + 21;
  const a = ((t || 0) / 60) % (Math.PI * 2);
  for (let k = 0; k < 24; k++) {                                     // экватор — неподвижен, меридиан — поворачивается
    const th = k / 24 * Math.PI * 2;
    R(c, tone(MAT.ROOFIRON, 4), Math.round(cx + 4.5 * Math.cos(th)), Math.round(cy + 1.4 * Math.sin(th)), 1, 1);
    R(c, B, Math.round(cx + 4.5 * Math.cos(th) * Math.cos(a)), Math.round(cy + 4.5 * Math.sin(th)), 1, 1);
  }
  R(c, A, Math.round(cx), cy - 6, 1, 13);
}
const uraniborg = split(uraniBody, uraniLive);
// островная обсерватория #2 (набором): Стьернеборг — «второй замок, в земле». Сугроб над криптами,
// из него купола: два больших, один малый; в левом щель, в щели — дуга квадранта. Посредине портал
// и лестница вниз. Низкое окно у земли — обед: стол, под столом карлик-шут (свет — поверх).
const stjerneBody = kit(80, 70, P => {
  P.poly([[0, 70], [0, 56], [12, 52], [40, 50], [68, 52], [80, 56], [80, 70]], MAT.SNOW);
  P.round(15, 36, 55, 22, MAT.ROOFIRON);
  P.round(68, 38, 55, 20, MAT.ROOFIRON);
  P.round(51, 45, 55, 12, MAT.ROOFIRON);
  P.cut(14, 37, 3, 18);
  P.box(30, 46, 12, 24, MAT.ASHLAR);
  P.wedge(36, 41, 46, 2, 14, MAT.ASHLAR);
  P.cut(33, 52, 6, 18);
  P.cut(56, 60, 10, 6);
}, { seed: 83, snow: 0.6 }, (c, X0, Y0) => {
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  for (let y = 41; y < 55; y++) { const dx = Math.round(Math.sqrt(Math.max(0, 196 - (y - 55) ** 2)) * 0.1); px(tone(MAT.ROOFIRON, 4), 15 + (y % 2 ? 0 : dx > 0 ? 1 : 0), y); }   // дуга квадранта в щели
  for (let y = 54; y < 70; y += 3) px(tone(MAT.ASHLAR, 3), 33, y, 6, 1);                                  // ступени вниз
  px(tone(MAT.ASHLAR, 5), 30, 46, 12, 1);
  for (const cx of [15, 68, 51]) px(tone(MAT.ROOFIRON, 4), cx, cx === 51 ? 43 : cx === 15 ? 34 : 36, 1, 2);
});
function stjerneLive(c, x, gy, t) {
  const X0 = Math.round(x) - 40, Y0 = Math.round(gy) - 70;
  const f = ((t || 0) / 13 | 0) % 5 === 0;
  R(c, f ? mix9(C, S, 0.25) : C, X0 + 56, Y0 + 60, 10, 6);
  R(c, S, X0 + 57, Y0 + 62, 8, 1); R(c, S, X0 + 58, Y0 + 63, 1, 3); R(c, S, X0 + 63, Y0 + 63, 1, 3);   // стол
  R(c, N, X0 + 60, Y0 + 64, 2, 2); R(c, N, X0 + 60, Y0 + 63, 1, 1);                                      // шут под столом
}
const stjerneborg = split(stjerneBody, stjerneLive);
// замок-библиотека (набором): Тре Крунур — посредине донжон, на нём галерея и высокий шпиль; на
// острие три короны (костью: золота канон не даёт). Два крыла под крутыми кровлями, по углам
// круглые башенки с конусами; окна рядами, дверь в арке. Снег на кровлях, сосульки.
const treKronor = kit(84, 96, P => {
  P.box(2, 40, 32, 56, MAT.PLASTER); P.box(50, 40, 32, 56, MAT.PLASTER);
  P.trap(0, 35, 5, 31, 28, 40, MAT.SLATE); P.trap(49, 83, 53, 78, 28, 40, MAT.SLATE);
  P.box(0, 34, 6, 62, MAT.PLASTER, FORM.CYL); P.wedge(3, 22, 34, 1, 7, MAT.SLATE);
  P.box(78, 34, 6, 62, MAT.PLASTER, FORM.CYL); P.wedge(81, 22, 34, 1, 7, MAT.SLATE);
  P.box(34, 26, 16, 70, MAT.ASHLAR);
  P.box(32, 24, 20, 3, MAT.ASHLAR);
  P.box(37, 18, 10, 6, MAT.ROOFIRON);
  P.wedge(42, 7, 18, 1, 12, MAT.ROOFIRON);
  for (const y of [46, 60, 74]) for (let i = 0; i < 4; i++) { P.cut(8 + i * 7, y, 3, 6, MAT.GLASS); P.cut(55 + i * 7, y, 3, 6, MAT.GLASS); }
  for (const y of [32, 50, 66]) P.cut(40, y, 4, 7, MAT.GLASS);
  arch4(P, 38, 96, 8, 14);
}, { seed: 89, snow: 0.6, chip: 0.02 }, (c, X0, Y0) => {
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  const CR = B;
  for (const [x, y] of [[40, 0], [37, 3], [43, 3]]) { px(CR, x, y + 1, 5, 1); px(CR, x, y, 1, 1); px(CR, x + 2, y, 1, 1); px(CR, x + 4, y, 1, 1); px(A, x + 1, y + 2, 3, 1); }   // три короны
  px(tone(MAT.ROOFIRON, 4), 42, 6, 1, 2);
  for (const [x, y] of [[4, 40], [9, 40], [15, 41], [22, 40], [30, 40], [52, 40], [60, 41], [68, 40], [75, 40], [35, 27], [48, 27]]) px(tone(MAT.ICE, 4), x, y, 1, 2 + (x % 3));   // сосульки
  px(tone(MAT.ASHLAR, 5), 32, 24, 20, 1);
});
// замок-библиотека #2 (набором): тот же замок в ночь пожара 1697-го. Крыло ближе: с чердака дым,
// в слуховом окне огонь (поверх). Окно второго этажа раскрыто — под ним в снегу огромная книга,
// раскрытая на чёрте во всю страницу: её спасли, выбросив в окно. У стены на санях ящики с
// бирками прежних хозяев — трофейная библиотека.
const kronor2Body = kit(84, 96, P => {
  P.box(70, 12, 14, 84, MAT.ASHLAR); P.wedge(77, 3, 12, 1, 14, MAT.ROOFIRON);
  P.box(0, 34, 70, 62, MAT.PLASTER);
  P.trap(0, 71, 5, 66, 16, 34, MAT.SLATE);
  P.box(30, 20, 10, 10, MAT.PLASTER); P.wedge(35, 14, 20, 1, 12, MAT.SLATE);
  P.cut(33, 23, 4, 5);
  for (const y of [42, 58, 74]) for (let i = 0; i < 5; i++) if (!(y === 58 && i === 4)) P.cut(6 + i * 12, y, 5, 8, MAT.GLASS);
  P.cut(54, 58, 5, 8);                                              // раскрытое окно
  P.box(4, 86, 8, 6, MAT.BOARD); P.box(13, 86, 8, 6, MAT.BOARD); P.box(8, 81, 8, 5, MAT.BOARD);
  for (const y of [32, 52, 72]) P.cut(75, y, 4, 7, MAT.GLASS);
}, { seed: 97, snow: 0.6, soot: [[33, 22, 4, 8], [10, 16, 20, 6]] }, (c, X0, Y0) => {
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  px(tone(MAT.TIMBER, 2), 59, 58, 2, 8);                                                                  // ставень распахнут
  px(tone(MAT.TIMBER, 1), 3, 92, 19, 1); px(tone(MAT.TIMBER, 1), 2, 93, 2, 1); px(tone(MAT.TIMBER, 1), 21, 93, 2, 1);   // сани
  for (const [x, y] of [[6, 88], [15, 88], [10, 83]]) px(PAPER, x, y, 3, 2);                               // бирки
  px(PAPER, 50, 90, 7, 4); px(PAPER, 58, 90, 7, 4); px(S, 57, 90, 1, 4);                                  // книга раскрыта
  px(N, 60, 90, 3, 3); px(K, 60, 90, 1, 1); px(K, 62, 90, 1, 1); px(N, 59, 93, 1, 1); px(N, 63, 93, 1, 1); // чёрт во всю страницу
  for (let y = 91; y < 94; y++) px(A, 51, y, 5, 1);
});
function kronor2Live(c, x, gy, t) {
  const X0 = Math.round(x) - 42, Y0 = Math.round(gy) - 96, k = ((t || 0) / 5 | 0) % 4;
  R(c, C, X0 + 33, Y0 + 24 + (k === 2 ? 1 : 0), 4, 4 - (k === 2 ? 1 : 0));
  R(c, k % 2 ? K : C, X0 + 34 + (k === 3 ? 1 : 0), Y0 + 23, 2, 1);
}
const kronor2 = split(kronor2Body, kronor2Live);

// ───────────────────────── РАВНИНА ─────────────────────────
// шатровая церковь (набором): деревянная, рубленая. Подклет с волоковыми оконцами, на нём
// четверик, выше восьмерик, полица, шатёр тёсом, барабанчик и главка лемехом, крест
// восьмиконечный. Сбоку крыльцо под своей кровлей. Шатёр срублен до запрета — стоит в промежутке.
const tentChurch = kit(38, 94, P => {
  P.box(6, 80, 26, 14, MAT.LOGS);
  P.box(6, 58, 26, 22, MAT.LOGS);
  P.box(9, 46, 20, 12, MAT.LOGS, FORM.CYL);
  P.box(7, 44, 24, 2, MAT.BOARD);
  P.wedge(19, 17, 44, 2, 18, MAT.BOARD);
  P.box(17, 14, 4, 4, MAT.LOGS);
  P.poly(domePts(19, 15, 7, 4, 8, 11, 1.6, 0.55), MAT.LEMEKH);
  P.box(0, 74, 6, 20, MAT.LOGS); P.wedge(3, 68, 74, 1, 8, MAT.BOARD);   // крыльцо
  for (const [x, y] of [[12, 64], [23, 64], [17, 50], [11, 86], [25, 86]]) P.cut(x, y, 3, x === 17 ? 5 : 3);
  P.cut(1, 82, 4, 12);
}, { seed: 101, moss: 0.06, chip: 0.02 }, (c, X0, Y0) => {
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  px(B, 19, 0, 1, 7); px(B, 18, 1, 3, 1); px(B, 16, 3, 7, 1);                                              // крест восьмиконечный
  px(B, 17, 5, 1, 1); px(B, 18, 5, 1, 1); px(B, 20, 6, 1, 1); px(B, 21, 6, 1, 1);
  for (const [x, y] of [[12, 64], [23, 64], [17, 50]]) { px(tone(MAT.BOARD, 4), x - 1, y - 1, 5, 1); px(tone(MAT.BOARD, 4), x - 1, y + (y === 50 ? 5 : 3), 5, 1); }   // наличники
  for (let y = 86; y < 94; y += 2) px(tone(MAT.BOARD, 3), 0, y, 6, 1);                                    // ступени крыльца
});
// острог с ямой (набором): тын из заострённых брёвен выше человека, ворота под кровелькой, за тыном
// рубленая башня с шатром и бойницами. Перед тыном берег в разрезе: решётка вровень с травой, под
// ней земляная тюрьма — на дне свеча (поверх), узник сидит, у свечи стопка исписанных листов.
const ostrogBody = kit(92, 80, P => {
  P.box(74, 10, 16, 52, MAT.LOGS);
  P.box(72, 8, 20, 4, MAT.LOGS);
  P.wedge(82, 0, 8, 1, 22, MAT.BOARD);
  P.cut(80, 20, 3, 2); P.cut(80, 34, 3, 2);
  for (let x = 36; x < 92; x += 3) {
    if (x > 51 && x < 68) continue;
    P.box(x, 34, 3, 28, MAT.TIMBER); P.wedge(x + 1, 31, 34, 1, 3, MAT.TIMBER);
  }
  P.box(53, 32, 3, 30, MAT.TIMBER); P.box(66, 32, 3, 30, MAT.TIMBER);
  P.wedge(61, 25, 32, 2, 20, MAT.BOARD);
  P.box(56, 40, 10, 22, MAT.BOARD);
  P.box(0, 62, 92, 18, MAT.RAMMED);
  P.box(0, 61, 92, 2, MAT.MOSS);
  P.clear(8, 61, 24, 2);
  P.cut(8, 63, 24, 15);
}, { seed: 103, moss: 0.05 }, (c, X0, Y0) => {
  const px = (col, x, y, w = 1, h = 1) => R(c, col, X0 + x, Y0 + y, w, h);
  for (let x = 8; x < 32; x += 3) px(tone(MAT.IRON, 3), x, 61, 1, 2);                                    // решётка вровень с травой
  px(tone(MAT.IRON, 2), 8, 62, 24, 1);
  px(S, 12, 70, 3, 8); px(S, 12, 68, 3, 2); px(mix9(S, B, 0.2), 12, 70, 1, 8);                            // узник
  px(PAPER2, 22, 75, 5, 3); for (let y = 75; y < 78; y++) px(tone(MAT.FELT, 2), 22, y, 4, 1);            // листы стопкой
  px(B, 23, 74, 3, 1); px(PAPER, 19, 76, 1, 2);                                                           // свеча
  for (const x of [57, 61]) px(tone(MAT.BOARD, 1), x, 40, 1, 22);
  px(tone(MAT.IRON, 3), 60, 50, 2, 1);
});
function ostrogLive(c, x, gy, t) {
  const X0 = Math.round(x) - 46, Y0 = Math.round(gy) - 80;
  R(c, C, X0 + 19, Y0 + 74 - (((t || 0) / 8 | 0) % 3 === 0 ? 1 : 0), 1, 2);
}
const ostrog = split(ostrogBody, ostrogLive);

// ───────────────────────── ФАСАДЫ ТАБЛИЧЕК ─────────────────────────
// юг: сырцовый дом с куполком, дверь в четыре центра, решётчатые оконца
const signSouth = signKit(P => {
  P.box(0, 10, 18, 20, MAT.MUD);
  P.round(9, 3, 11, 10, MAT.BAKED);
  arch4(P, 6, 30, 6, 12);
  P.cut(1, 14, 3, 4); P.cut(14, 14, 3, 4);
}, { seed: 107, chip: 0.03 }, px => {
  px(tone(MAT.MUD, 4), 5, 17, 1, 13); px(tone(MAT.MUD, 4), 12, 17, 1, 13);
  for (const x of [1, 14]) { px(tone(MAT.TIMBER, 2), x + 1, 14, 1, 4); px(tone(MAT.TIMBER, 2), x, 16, 3, 1); }
  px(tone(MAT.BAKED, 4), 9, 2, 1, 1);
});
// восток: чайный домик — соломенная кровля, глиняные стены в стойках, круглое окно, лаз
const signEast = signKit(P => {
  P.box(1, 14, 16, 16, MAT.MUD);
  for (const x of [1, 8, 16]) P.box(x, 14, 1, 16, MAT.TIMBER);
  P.trap(0, 17, 3, 14, 5, 14, MAT.THATCH);
  P.box(4, 4, 10, 2, MAT.TIMBER);
  P.cut(3, 17, 4, 4); P.cut(11, 24, 4, 4);
}, { seed: 109, moss: 0.08 }, px => {
  px(tone(MAT.TIMBER, 2), 4, 17, 1, 4); px(tone(MAT.TIMBER, 2), 6, 17, 1, 4);
  px(tone(MAT.ROCK, 3), 11, 29, 4, 1);
});
// запад: голландский ступенчатый щипец, окна в белых рамах, дверь
const signWest = signKit(P => {
  P.box(1, 10, 16, 20, MAT.BRICK);
  P.box(3, 6, 12, 4, MAT.BRICK); P.box(5, 2, 8, 4, MAT.BRICK); P.box(7, 0, 4, 2, MAT.BRICK);
  P.cut(3, 13, 4, 6, MAT.GLASS); P.cut(11, 13, 4, 6, MAT.GLASS);
  P.cut(7, 22, 4, 8);
}, { seed: 113, chip: 0.03 }, px => {
  for (const [x, y, w] of [[1, 9, 2], [15, 9, 2], [3, 5, 2], [13, 5, 2], [5, 1, 2], [11, 1, 2], [7, 0, 4]]) px(tone(MAT.MARBLE, 4), x, y, w, 1);
  for (const x of [3, 11]) { px(B, x - 1, 12, 6, 1); px(B, x - 1, 12, 1, 7); px(B, x + 4, 12, 1, 7); px(B, x + 1, 13, 1, 6); }
  px(B, 6, 21, 6, 1);
});
// север: сруб под дёрном и снегом, окно в раме, дверь
const signNorth = signKit(P => {
  P.box(1, 12, 16, 18, MAT.LOGS);
  P.trap(0, 17, 3, 14, 6, 12, MAT.MOSS);
  P.cut(10, 16, 5, 5, MAT.GLASS);
  P.cut(3, 18, 4, 12);
}, { seed: 127, snow: 0.7 }, px => {
  px(B, 9, 15, 7, 1); px(B, 9, 21, 7, 1); px(B, 9, 15, 1, 7); px(B, 15, 15, 1, 7); px(B, 12, 16, 1, 5);
  px(tone(MAT.LOGS, 4), 2, 17, 6, 1);
});

export const ARCH = {
  // ── ДОМИНАНТА · восток: мавзолей над прудом, лампа в айване ──
  landmark: {
    name: 'Тадж-Махал', side: 'east', w: 120, h: 190,
    light: { dx: 0, dy: -82, r: 80 },
    life: { birds: [[-46, -42, -61]] },
    draw: tajMahal,
  },
  // ── ЮГ · Исфахан, Йезд, Стамбул ──
  south: [
    { name: 'мечеть Исфахана', w: 88, h: 92, life: { birds: [[-30, -22, -63]] }, draw: mosque, draw2: mosque2, life2: { birds: [[-38, -28, -51]] } },
    {
      name: 'кофейня с бадгиром', w: 64, h: 66,
      life: { smoke: [[26, -41]], birds: [[-12, -4, -33]] },
      draw: coffeeHouse, draw2: coffee2, life2: { smoke: [[16, -61]], birds: [[-20, -10, -53]] },
      draw3: coffee3, life3: { birds: [[-30, -20, -55]] },
    },
  ],
  // ── ВОСТОК · Эдо: хижина Басё, застава сэкисё ──
  east: [
    { name: 'хижина Басё', w: 66, h: 46, life: { smoke: [[0, -38]], birds: [[-8, 2, -39]] }, draw: bashoHut },
    { name: 'застава сэкисё', w: 80, h: 50, life: { birds: [[-14, -4, -45]] }, draw: sekisho },
  ],
  // ── ЗАПАД · Голландия: печь и линза ──
  west: [
    { name: 'дом с печью', w: 32, h: 88, life: { smoke: [[10, -87]] }, draw: stoveHouse },
    { name: 'мастерская линз', w: 50, h: 64, draw: lensShop, draw2: lens2 },
  ],
  // ── СЕВЕР · Вен и Стокгольм под снегом ──
  north: [
    { name: 'островная обсерватория', w: 80, h: 70, life: { birds: [[-14, -7, -47]] }, draw: uraniborg, draw2: stjerneborg, life2: {} },
    { name: 'замок-библиотека', w: 84, h: 96, life: { birds: [[-37, -14, -67]] }, draw: treKronor, draw2: kronor2, life2: { smoke: [[-7, -82], [-22, -80]], birds: [[0, 20, -79]] } },
  ],
  // ── РАВНИНА · раскол: сруб и яма ──
  plain: [
    { name: 'шатровая церковь', w: 38, h: 94, draw: tentChurch },
    { name: 'острог с ямой', w: 92, h: 80, life: { birds: [[-46, -40, -18]] }, draw: ostrog },
  ],
  // ── фасады табличек «дом» ──
  sign: { south: signSouth, east: signEast, west: signWest, north: signNorth },

  // ── утварь дворов: вещи века у порога, без табличек и без людей ──
  props: {
    south: [
      {
        name: 'кальян', w: 10, h: 18,
        draw(c, x, gy) {
          const X = Math.round(x), G = Math.round(gy);
          // колба: груша на ножке, блик костью
          R(c, D2, X - 3, G - 8, 6, 7); R(c, D2, X - 4, G - 7, 8, 5);
          R(c, ASH, X - 4, G - 7, 1, 5); R(c, BONE, X - 2, G - 6, 1, 2);
          R(c, D1, X - 2, G - 1, 4, 1);
          // шток, поддон, чашечка с углём
          R(c, D1, X - 1, G - 13, 2, 5);
          R(c, ASH, X - 3, G - 13, 6, 1);
          R(c, D1, X - 1, G - 15, 2, 2);
          R(c, D2, X - 2, G - 17, 4, 2); R(c, ASH, X - 2, G - 17, 1, 2);
          R(c, CANDLE, X - 1, G - 18, 2, 1);
          // шланг петлёй до земли, мундштук костью
          R(c, ASH, X + 1, G - 11, 2, 1); R(c, ASH, X + 3, G - 10, 1, 4);
          R(c, ASH, X + 4, G - 6, 1, 4); R(c, BONE, X + 4, G - 2, 1, 1);
        },
      },
      {
        name: 'ковёр на жерди', w: 24, h: 18,
        draw(c, x, gy) {
          const X = Math.round(x), G = Math.round(gy);
          // жердь на двух рогатинах
          R(c, D1, X - 12, G - 17, 2, 17); R(c, D1, X + 10, G - 17, 2, 17);
          R(c, ASH, X - 12, G - 18, 24, 1);
          // ковёр: кайма, поле, медальон; бахрома пеплом
          R(c, PAPER2, X - 9, G - 17, 18, 13);
          R(c, BRICK, X - 8, G - 16, 16, 11);
          R(c, SEP, X - 7, G - 15, 14, 1); R(c, SEP, X - 7, G - 7, 14, 1);
          R(c, PAPER2, X - 2, G - 13, 4, 5); R(c, PAPER2, X - 3, G - 12, 6, 3);
          R(c, CINN, X - 1, G - 12, 2, 3);
          R(c, PAPER2, X - 7, G - 13, 2, 1); R(c, PAPER2, X + 5, G - 13, 2, 1);
          R(c, PAPER2, X - 7, G - 9, 2, 1); R(c, PAPER2, X + 5, G - 9, 2, 1);
          c.fillStyle = ASH;
          for (let i = 0; i < 9; i++) c.fillRect(X - 9 + i * 2, G - 4, 1, 2);
        },
      },
      {
        name: 'тюки шёлка', w: 18, h: 12,
        draw(c, x, gy) {
          const X = Math.round(x), G = Math.round(gy);
          // два тюка внизу, третий сверху; рогожа, верёвка крест-накрест
          for (const [bx, by] of [[X - 9, G - 6], [X, G - 6], [X - 5, G - 12]]) {
            R(c, SEP, bx + 1, by, 7, 6); R(c, SEP, bx, by + 1, 9, 4);
            R(c, PAPER2, bx + 1, by, 7, 1);
            R(c, D1, bx + 4, by, 1, 6); R(c, D1, bx, by + 3, 9, 1);
          }
          R(c, ASH, X - 9, G - 5, 1, 4);
          // торговая пломба на нижнем тюке
          R(c, BONE, X + 6, G - 4, 1, 1);
        },
      },
    ],
    east: [
      {
        name: 'каго у заставы', w: 28, h: 16,
        draw(c, x, gy) {
          const X = Math.round(x), G = Math.round(gy);
          // шест носильщиков во всю длину — далеко за короб
          R(c, D1, X - 14, G - 15, 28, 2); R(c, ASH, X - 14, G - 15, 28, 1);
          // крышка с загнутыми краями, подвесы к шесту
          R(c, D1, X - 8, G - 12, 16, 2); R(c, ASH, X - 8, G - 12, 16, 1);
          R(c, D1, X - 10, G - 13, 2, 2); R(c, D1, X + 8, G - 13, 2, 2);
          R(c, ASH, X - 10, G - 13, 1, 1); R(c, ASH, X + 9, G - 13, 1, 1);
          R(c, D1, X - 1, G - 13, 2, 1);
          // плетёный бамбуковый короб, окошко с подвёрнутой шторкой
          R(c, D2, X - 7, G - 10, 14, 8);
          c.fillStyle = SEP;
          for (let i = 0; i < 5; i++) c.fillRect(X - 6 + i * 3, G - 10, 1, 8);
          R(c, ASH, X - 7, G - 10, 1, 8);
          R(c, N, X - 3, G - 9, 6, 5);
          R(c, PAPER2, X - 3, G - 9, 6, 2);
          R(c, D1, X - 8, G - 2, 16, 2);
          // дзори у короба — пассажир вышел на досмотр
          R(c, PAPER2, X + 9, G - 1, 3, 1);
        },
      },
      {
        name: 'бочонки сакэ', w: 20, h: 15,
        draw(c, x, gy) {
          const X = Math.round(x), G = Math.round(gy);
          // бочонки в соломенных рогожах, верёвки, клеймо пивоварни
          for (const [bx, by] of [[X - 10, G - 7], [X, G - 7], [X - 5, G - 15]]) {
            R(c, PAPER2, bx + 1, by, 8, 7); R(c, PAPER2, bx, by + 1, 10, 5);
            R(c, D2, bx, by + 1, 10, 1); R(c, D2, bx, by + 5, 10, 1);
            R(c, N, bx + 3, by + 2, 4, 3);
          }
          R(c, CINN, X - 1, G - 12, 2, 1);
        },
      },
      {
        name: 'три орудия заставы', w: 16, h: 30,
        draw(c, x, gy) {
          const X = Math.round(x), G = Math.round(gy);
          // стойка: две ноги, перекладина
          R(c, D1, X - 7, G - 14, 1, 14); R(c, D1, X + 6, G - 14, 1, 14);
          R(c, D1, X - 8, G - 15, 16, 2); R(c, ASH, X - 8, G - 15, 16, 1);
          // три древка
          R(c, D2, X - 4, G - 27, 1, 27); R(c, D2, X, G - 26, 1, 26); R(c, D2, X + 4, G - 27, 1, 27);
          // цукубо — грабли-«Т»
          R(c, ASH, X - 7, G - 29, 7, 2); R(c, ASH, X - 7, G - 27, 1, 1); R(c, ASH, X - 4, G - 27, 1, 1); R(c, ASH, X - 1, G - 27, 1, 1);
          // сасумата — рогач
          R(c, ASH, X - 1, G - 27, 3, 1); R(c, ASH, X - 2, G - 30, 1, 3); R(c, ASH, X + 2, G - 30, 1, 3);
          // содэгарами — шипы
          R(c, ASH, X + 4, G - 30, 1, 3); R(c, ASH, X + 3, G - 29, 3, 1); R(c, ASH, X + 2, G - 28, 5, 1);
          R(c, BONE, X - 8, G - 1, 16, 1);
        },
      },
    ],
    west: [
      {
        name: 'тюльпан в горшке', w: 10, h: 15, unique: true,
        draw(c, x, gy) {
          const X = Math.round(x), G = Math.round(gy);
          // ящик-подставка, горшок, один пёстрый цветок
          R(c, PLANK, X - 5, G - 4, 10, 4); R(c, ASH, X - 5, G - 4, 10, 1);
          R(c, D1, X - 5, G - 1, 1, 1); R(c, D1, X + 4, G - 1, 1, 1);
          R(c, BRICK, X - 3, G - 8, 6, 4); R(c, ASH, X - 4, G - 9, 8, 1);
          R(c, MIST, X, G - 12, 1, 3);
          R(c, MIST, X - 2, G - 11, 2, 1); R(c, MIST, X + 1, G - 10, 2, 1);
          R(c, BONE, X - 1, G - 15, 3, 3); R(c, BONE, X - 2, G - 14, 1, 1); R(c, BONE, X + 2, G - 14, 1, 1);
          R(c, CINN, X, G - 15, 1, 2);
        },
      },
      {
        name: 'кнехт с канатом', w: 12, h: 10,
        draw(c, x, gy) {
          const X = Math.round(x), G = Math.round(gy);
          // дубовая тумба, оголовок, бухта каната у подножия
          R(c, D2, X - 2, G - 9, 4, 9); R(c, ASH, X - 2, G - 9, 1, 9);
          R(c, D1, X - 3, G - 10, 6, 2); R(c, ASH, X - 3, G - 10, 6, 1);
          R(c, PAPER2, X - 2, G - 6, 4, 1); R(c, PAPER2, X + 2, G - 5, 2, 1);
          R(c, PAPER2, X - 6, G - 3, 12, 1); R(c, PAPER2, X - 5, G - 1, 10, 1);
          R(c, SEP, X - 6, G - 2, 12, 1);
        },
      },
      {
        name: 'зрительная труба', w: 16, h: 22,
        draw(c, x, gy) {
          const X = Math.round(x), G = Math.round(gy);
          // тренога
          R(c, D1, X - 1, G - 14, 3, 2);
          R(c, D1, X - 1, G - 12, 1, 4); R(c, D1, X - 2, G - 8, 1, 4); R(c, D1, X - 3, G - 4, 1, 4);
          R(c, D1, X + 1, G - 12, 1, 4); R(c, D1, X + 2, G - 8, 1, 4); R(c, D1, X + 3, G - 4, 1, 4);
          R(c, D1, X, G - 12, 1, 12);
          // труба вверх-вправо ровной лесенкой, у глаза окуляр, на конце — блик линзы
          for (let i = 0; i < 7; i++) {
            R(c, D2, X - 7 + 2 * i, G - 13 - i, 2, 2);
            R(c, ASH, X - 7 + 2 * i, G - 13 - i, 2, 1);
          }
          R(c, D1, X - 8, G - 13, 1, 3);
          R(c, BONE, X + 7, G - 21, 1, 2);
        },
      },
    ],
    north: [
      {
        name: 'пушка на полозьях', w: 24, h: 10,
        draw(c, x, gy) {
          const X = Math.round(x), G = Math.round(gy);
          // полозья с загнутым носом
          R(c, ASH, X - 11, G - 1, 21, 1); R(c, ASH, X + 10, G - 3, 1, 2); R(c, ASH, X + 11, G - 4, 1, 1);
          R(c, D1, X - 9, G - 3, 1, 2); R(c, D1, X + 5, G - 3, 1, 2);
          // лафет-колода, ствол на нём, снег на казённой части
          R(c, D2, X - 9, G - 6, 16, 3); R(c, ASH, X - 9, G - 6, 1, 3);
          R(c, D1, X - 10, G - 9, 18, 3); R(c, D1, X + 8, G - 10, 2, 5);
          R(c, ASH, X - 9, G - 9, 17, 1); R(c, ASH, X - 4, G - 10, 1, 1);
          R(c, D1, X - 12, G - 8, 2, 1);
          R(c, BONE, X - 10, G - 10, 5, 1); R(c, BONE, X - 9, G - 7, 4, 1);
        },
      },
      {
        name: 'ящики книг в дорогу', w: 20, h: 14,
        draw(c, x, gy) {
          const X = Math.round(x), G = Math.round(gy);
          // нижний ящик заколочен, верхний открыт: корешки в ряд
          R(c, PLANK, X - 10, G - 7, 20, 7); R(c, ASH, X - 10, G - 7, 20, 1);
          R(c, ASH, X - 10, G - 7, 1, 7); R(c, D1, X - 1, G - 7, 1, 7);
          R(c, D1, X - 10, G - 4, 20, 1);
          R(c, PLANK, X - 7, G - 13, 14, 6); R(c, ASH, X - 7, G - 13, 1, 6);
          R(c, PAPER2, X - 6, G - 14, 1, 4); R(c, BRICK, X - 5, G - 14, 1, 4); R(c, PAPER, X - 4, G - 13, 1, 3);
          R(c, ASH, X - 3, G - 14, 1, 4); R(c, PAPER2, X - 2, G - 14, 2, 4); R(c, BRICK, X, G - 13, 1, 3);
          R(c, PAPER, X + 1, G - 14, 1, 4); R(c, ASH, X + 2, G - 14, 1, 4); R(c, PAPER2, X + 3, G - 13, 2, 3);
          R(c, PLANK, X - 7, G - 10, 14, 3); R(c, D1, X - 7, G - 10, 14, 1);
          // снег на крышке нижнего
          R(c, BONE, X + 7, G - 8, 3, 1); R(c, BONE, X - 10, G - 8, 3, 1);
        },
      },
      {
        name: 'вешки зимней дороги', w: 14, h: 24,
        draw(c, x, gy) {
          const X = Math.round(x), G = Math.round(gy);
          // две вешки с еловым лапником; у ног намело
          for (const [vx, top] of [[X - 4, G - 24], [X + 3, G - 18]]) {
            R(c, D1, vx, top, 1, G - top);
            R(c, MIST, vx - 1, top + 1, 3, 2); R(c, MIST, vx - 2, top + 3, 5, 2); R(c, MIST, vx - 3, top + 5, 7, 2);
            R(c, BONE, vx - 1, top + 1, 1, 1); R(c, BONE, vx - 3, top + 5, 2, 1);
          }
          R(c, BONE, X - 7, G - 2, 6, 2); R(c, BONE, X + 2, G - 1, 5, 1);
        },
      },
    ],
    plain: [
      {
        name: 'коновязь', w: 24, h: 13,
        draw(c, x, gy) {
          const X = Math.round(x), G = Math.round(gy);
          // два столба, жердь с кольцами, клок сена и бадья
          R(c, D2, X - 11, G - 12, 2, 12); R(c, D2, X + 9, G - 12, 2, 12);
          R(c, ASH, X - 11, G - 12, 1, 12);
          R(c, BONE, X - 11, G - 13, 2, 1); R(c, BONE, X + 9, G - 13, 2, 1);
          R(c, D1, X - 12, G - 10, 24, 2); R(c, ASH, X - 12, G - 10, 24, 1);
          R(c, ASH, X - 5, G - 8, 1, 2); R(c, ASH, X + 3, G - 8, 1, 2);
          R(c, PAPER2, X - 7, G - 3, 8, 3); R(c, PAPER2, X - 5, G - 4, 4, 1);
          R(c, SEP, X - 6, G - 2, 1, 2); R(c, SEP, X - 3, G - 1, 1, 1);
          R(c, WOOD, X + 3, G - 5, 5, 5); R(c, D1, X + 3, G - 3, 5, 1); R(c, ASH, X + 3, G - 5, 5, 1);
        },
      },
      {
        name: 'пни вырубки', w: 22, h: 12,
        draw(c, x, gy) {
          const X = Math.round(x), G = Math.round(gy);
          // три пня, спилы светлые; в среднем засел топор
          R(c, D2, X - 11, G - 4, 6, 4); R(c, PAPER2, X - 11, G - 5, 6, 1);
          R(c, D2, X - 3, G - 6, 7, 6); R(c, PAPER2, X - 3, G - 7, 7, 1); R(c, SEP, X - 1, G - 7, 2, 1);
          R(c, D2, X + 6, G - 3, 5, 3); R(c, PAPER2, X + 6, G - 4, 5, 1);
          R(c, D1, X - 2, G - 4, 1, 4); R(c, D1, X + 3, G - 3, 1, 3);
          // топор: обух в пне, лезвие костью, топорище вверх-вправо
          R(c, ASH, X - 2, G - 9, 4, 2); R(c, BONE, X - 2, G - 9, 1, 2);
          R(c, PAPER2, X + 2, G - 9, 1, 1); R(c, PAPER2, X + 3, G - 10, 1, 1);
          R(c, PAPER2, X + 4, G - 11, 1, 1); R(c, PAPER2, X + 5, G - 12, 1, 1);
          // щепа
          R(c, PAPER2, X - 6, G - 1, 2, 1); R(c, PAPER2, X + 4, G - 1, 1, 1);
        },
      },
      {
        name: 'возок', w: 26, h: 18,
        draw(c, x, gy) {
          const X = Math.round(x), G = Math.round(gy);
          // полозья, нос загнут вверх
          R(c, ASH, X - 12, G - 1, 22, 1); R(c, ASH, X + 10, G - 3, 1, 2); R(c, ASH, X + 11, G - 5, 1, 2);
          R(c, D1, X - 9, G - 3, 1, 2); R(c, D1, X + 6, G - 3, 1, 2);
          // кузов-короб, крыша бочкой под снегом, слюдяное оконце
          R(c, D2, X - 11, G - 13, 20, 10);
          R(c, ASH, X - 11, G - 13, 1, 10);
          R(c, D1, X - 12, G - 15, 22, 2); R(c, D1, X - 10, G - 17, 18, 2);
          R(c, BONE, X - 10, G - 18, 18, 1); R(c, BONE, X - 12, G - 15, 3, 1);
          R(c, N, X + 2, G - 11, 4, 4); R(c, ASH, X + 2, G - 11, 4, 1);
          R(c, N, X - 7, G - 11, 1, 7); R(c, D1, X - 11, G - 5, 20, 1);
          // дышло вперёд
          R(c, D1, X + 9, G - 6, 3, 1);
        },
      },
    ],
  },
};
