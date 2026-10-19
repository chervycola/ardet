// ═══════════════════════════════════════
// ЛУННЫЙ — по осмотру и ART_BIBLE §05. «Невозможно высокий. Вместо головы —
// полумесяц потемневшего серебра, в изгибе — лицо с закрытыми глазами. Одна
// рука поднята: от неё к звёздам идут серебряные нити. Другая опущена — из
// раскрытой ладони сыплется чёрный песок. Ровно. Без остановки.» Плащ —
// звёздное поле. Холодная лунная гамма: ночь, камень, серебро, пепел; ни
// золота, ни неона. Не шевелится: живут только звёзды плаща, блеск нитей и
// песок. Свет слева, кромка пеплом справа. x, y — угол места «Лунный»
// (32×64), ступни — на нижней кромке.
// ═══════════════════════════════════════
import { t } from '../../core/time.js';
import { X } from '../../render/context.js';

const NI = '#0D0B0A', BO = '#D9CFB8', AS = '#8A8D8F';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620';
const S0 = '#474442', S1 = '#5e5e5d', S2 = '#33302e';
const q = Math.round;
const r = (x, y, w = 1, h = 1, c) => { X.fillStyle = c; X.fillRect(q(x), q(y), w, h); };
function hh(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

let npcProximity = 0;
export function setProximity(v) { npcProximity = v; }

const TOP = 13, H = 49;                                                 // плащ: от плеч до земли
const halfW = k => 4 + k * 0.17;                                        // k — ряд от плеч
export function drawNPC_nocturnal(nx, ny) {
  const cx = q(nx) + 16, y0 = q(ny), G = y0 + 62;
  // ── нити: из пальцев поднятой руки — к звёздам; гаснут в высоте ──
  const fingers = [[-12, -6], [-11, -7], [-9, -7], [-8, -6]];
  fingers.forEach(([fx, fy], i) => {
    const sx = cx + fx, sy = y0 + fy, dx = (i - 1.5) * 9, L = 96 + i * 11;
    for (let k = 1; k < L; k++) {
      const u = k / L, xx = sx + dx * u + Math.sin(u * Math.PI) * (i - 1.5) * 1.5;
      X.globalAlpha = 0.5 * (1 - u) * (1 - u);
      r(xx, sy - k, 1, 1, AS);
    }
    const run = (t * 0.25 + i * 37) % L;                                // блеск бежит вверх по нити
    X.globalAlpha = 0.7 * (1 - run / L);
    r(sx + dx * run / L + Math.sin(run / L * Math.PI) * (i - 1.5) * 1.5, sy - run, 1, 1, BO);
  });
  X.globalAlpha = 1;
  // ── плащ — звёздное поле ──
  for (let k = 0; k < H; k++) {
    const y = y0 + TOP + k, w = q(halfW(k)), rag = k > H - 4 ? q(hh(k, 1, 3) * 2) : 0;
    r(cx - w + rag, y, 2 * w - rag, 1, NI);
    r(cx - w + rag, y, 1, 1, k < 3 ? S2 : S1);                          // лунный край к свету
    r(cx + w - 1, y, 1, 1, AS);                                         // кромка пеплом
    for (const f of [-0.5, 0.05, 0.55]) if (k > 4 && hh(k, f * 10 | 0, 19) > 0.2) r(cx + q(f * w), y, 1, 1, S2);   // складки расходятся
  }
  for (let k = 0; k < 6; k++) r(cx - 12 + k * 4 + q(hh(k, 2, 5) * 2), G - 1, 2, 1, K0);   // подол лёг на песок
  // звёзды плаща: стоят на месте, мерцают каждая в свой черёд
  for (let i = 0; i < 34; i++) {
    const k = 4 + q(hh(i, 3, 7) * (H - 7)), w = halfW(k) - 1.5, sx = cx + q((hh(i, 3, 9) * 2 - 1) * w), sy = y0 + TOP + k;
    const bright = hh(i, 3, 11) < 0.22, on = hh(i, Math.floor((t + i * 53) / 140), 13) > 0.18;
    if (on) r(sx, sy, 1, 1, bright ? BO : hh(i, 3, 15) < 0.5 ? AS : S0);
  }
  // созвездие на груди: четыре звезды, связаны еле видно
  const C = [[-3, 18], [0, 21], [3, 19], [2, 25]];
  X.globalAlpha = 0.28;
  for (let i = 0; i < C.length - 1; i++) {
    const [ax, ay] = C[i], [bx, by] = C[i + 1], n = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
    for (let s = 1; s < n; s++) r(cx + ax + (bx - ax) * s / n, y0 + ay + (by - ay) * s / n, 1, 1, AS);
  }
  X.globalAlpha = 1;
  for (const [ax, ay] of C) r(cx + ax, y0 + ay, 1, 1, BO);
  // ── опущенная рука: рукав вдоль бока, ладонь раскрыта — сыплется чёрный песок ──
  for (let k = 0; k < 22; k++) { const xx = cx + 7 + q(k * 0.08); r(xx, y0 + 16 + k, 3, 1, NI); r(xx + 2, y0 + 16 + k, 1, 1, AS); }
  const hx = cx + 9, hy = y0 + 38;
  r(hx - 1, hy, 3, 2, S0); r(hx - 1, hy, 1, 2, S1); r(hx - 1, hy + 2, 1, 2, S0); r(hx + 1, hy + 2, 1, 2, S0);   // пальцы раскрыты
  for (let yy = hy + 3; yy < G - 2; yy++) {                             // струя: ровно, без остановки
    const g = (yy - hy + Math.floor(t / 2)) % 4;
    r(hx + (yy > G - 7 && g === 1 ? 1 : 0), yy, 1, 1, g === 0 ? S0 : g === 2 ? S2 : K0);
  }
  r(hx - 3, G - 2, 7, 1, NI); r(hx - 2, G - 3, 5, 1, NI); r(hx - 1, G - 4, 3, 1, K0);   // горка у ног
  r(hx - 3, G - 2, 1, 1, S2); r(hx - 2, G - 3, 1, 1, S2);
  // ── поднятая рука: рукав вверх, кисть костистая, пальцы врозь ──
  for (let k = 0; k < 18; k++) { const xx = cx - 6 - q(k * 0.22), yy = y0 + 15 - k; r(xx, yy, 3, 1, NI); r(xx, yy, 1, 1, S1); }
  r(cx - 11, y0 - 4, 3, 2, S0); r(cx - 11, y0 - 4, 1, 2, S1);
  for (const [fx, fy] of fingers) r(cx + fx, y0 + fy, 1, 2, S0);
  // ── ворот и голова: полумесяц потемневшего серебра, в изгибе — лицо ──
  r(cx - 5, y0 + TOP - 1, 10, 2, K0); r(cx - 5, y0 + TOP - 1, 1, 2, S2);
  const hcx = cx, hcy = y0 + 6;
  for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
    const out = dx * dx + dy * dy <= 38, cut = (dx - 3) * (dx - 3) + (dy + 1) * (dy + 1) <= 24;
    if (!out || cut) continue;
    const edge = (dx - 3) * (dx - 3) + (dy + 1) * (dy + 1) <= 34;
    const tarnish = hh(dx + 9, dy + 9, 17) < 0.2;
    r(hcx + dx, hcy + dy, 1, 1, edge ? K2 : dx < -3 && dy < 2 ? AS : tarnish ? S0 : S1);
  }
  // лицо в изгибе: глаза закрыты
  r(hcx + 1, hcy - 2, 3, 5, S0); r(hcx + 2, hcy - 3, 2, 1, S0); r(hcx + 1, hcy + 3, 2, 1, S2);
  r(hcx + 1, hcy - 1, 2, 1, K1); r(hcx + 1, hcy + 2, 1, 1, K2);          // веко, рот
  r(hcx, hcy - 2, 1, 4, S2);                                            // щека в тени серпа
}
