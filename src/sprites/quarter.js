// ═══════════════════════════════════════
// КВАРТАЛ ГОРОДКА — то, что осталось от старых улиц (world/town.js): мёртвые
// фонари вдоль главных — чугун, стекло тёмное, не горят (как «Погасший
// фонарь» у костра); на фундаментах — огрызки стен с проёмами и клочьями
// штукатурки, печная труба, дверная арка без дома. Ставит render/townProps.js.
// Свет слева, кромка пеплом справа. Контракт: x — середина, gy — линия земли,
// рисунок строго в w×h; v — зерно варианта.
// ═══════════════════════════════════════
const NI = '#0D0B0A', AS = '#8A8D8F';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620';
const BR2 = '#3a2818', L1 = '#c8b89a', L2 = '#b0a284';
const q = Math.round;
const r = (c, col, x, y, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
function hh(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ── фонари ──
// голова фонаря: x — середина, y — нижнее кольцо; glass — стекло цело (тёмное)
function head(c, x, y, glass, v) {
  r(c, K1, x - 2, y, 5, 1);                                            // нижнее кольцо
  if (glass) { r(c, K0, x - 2, y - 4, 5, 4); r(c, AS, x - 2, y - 4, 1, 1); if (v % 2) r(c, K2, x + 1, y - 3, 1, 2); }   // стекло тёмное, блик пеплом
  r(c, K2, x - 3, y - 4, 1, 4); r(c, K2, x + 3, y - 4, 1, 4);         // переплёт
  if (glass || v % 3) r(c, K2, x, y - 4, 1, 4);
  r(c, L2, x - 3, y - 4, 1, 3);                                        // свет слева
  r(c, K2, x - 3, y - 5, 7, 1); r(c, L2, x - 3, y - 5, 3, 1);          // крыша
  r(c, K1, x - 2, y - 6, 5, 1); r(c, K1, x - 1, y - 7, 3, 1); r(c, K1, x, y - 8, 1, 1);   // колпак, шпиль
}
function base(c, x, g) {                                               // тумба
  r(c, K2, x - 2, g - 4, 5, 4); r(c, L2, x - 2, g - 4, 1, 4); r(c, AS, x + 2, g - 3, 1, 2);
  r(c, K1, x - 2, g - 1, 5, 1); r(c, K1, x - 1, g - 6, 3, 2);
}
// столб: от земли до top, со сдвигом верха bend (крен — после удара)
function post(c, x, g, top, bend = 0) {
  const n = g - 6 - top;
  for (let k = 0; k < n; k++) {
    const y = g - 7 - k, s = bend ? q(bend * Math.max(0, k - n * 0.35) / (n * 0.65)) : 0;
    r(c, K1, x + s, y, 2, 1); r(c, L2, x + s, y, 1, 1);
  }
}
function lamp(c, X, G, v) {
  const x = q(X), g = q(G), ring = g - 14 - (v % 3);
  base(c, x, g); post(c, x, g, g - 28);
  r(c, K2, x - 1, ring, 4, 1);                                         // кольцо на столбе
  r(c, K1, x - 3, g - 26, 8, 1); r(c, L2, x - 3, g - 26, 2, 1);        // упор для лестницы фонарщика
  head(c, x + 1, g - 28, true, v);
}
function lampBroken(c, X, G, v) {                                      // стёкла выбиты
  const x = q(X), g = q(G);
  base(c, x, g); post(c, x, g, g - 28);
  r(c, K2, x - 1, g - 15, 4, 1);
  r(c, K1, x - 3, g - 26, 8, 1); r(c, L2, x - 3, g - 26, 2, 1);
  head(c, x + 1, g - 28, false, v);
  r(c, AS, x + 3, g - 1, 1, 1); r(c, K0, x - 4, g - 1, 2, 1);          // осколки у тумбы
}
function lampBent(c, X, G, v) {                                        // столб погнут: верх ушёл вбок
  const x = q(X), g = q(G), s = v % 2 ? 1 : -1, b = s * (4 + (v % 3));
  base(c, x, g); post(c, x, g, g - 27, b);
  r(c, K2, x - 1, g - 14, 4, 1);
  head(c, x + 1 + b, g - 27, v % 3 !== 1, v);
}
function lampStub(c, X, G, v) {                                        // обломан; голова лежит рядом
  const x = q(X), g = q(G), top = g - 11 - (v % 3);
  base(c, x, g); post(c, x, g, top);
  r(c, L2, x + 1, top - 1, 1, 1); r(c, K1, x, top, 1, 1);              // слом — светлая щербина
  const lx = x + 4;                                                    // голова фонаря на боку
  r(c, K1, lx, g - 5, 1, 4); r(c, K0, lx + 1, g - 5, 4, 4); r(c, K2, lx + 1, g - 6, 4, 1); r(c, L2, lx + 1, g - 6, 2, 1);
  r(c, K2, lx + 5, g - 6, 1, 6); r(c, K1, lx + 6, g - 5, 1, 4); r(c, K1, lx + 7, g - 4, 1, 2); r(c, K1, lx + 8, g - 3, 1, 1);
  r(c, K2, lx + 1, g - 2, 4, 1); r(c, AS, lx + 2, g - 4, 1, 1);
}
function lampFallen(c, X, G, v) {                                      // упал вдоль улицы: тумба стоит, столб лёжа
  const x = q(X), g = q(G), s = v % 2 ? 1 : -1, bx = x - 12 * s;      // тумба — у одного края
  r(c, K2, bx - 2, g - 4, 5, 4); r(c, L2, bx - 2, g - 4, 1, 4); r(c, K1, bx - 2, g - 1, 5, 1);
  const len = 18, a = s > 0 ? bx + 3 : bx - 2 - len;                  // столб — по земле от тумбы
  r(c, K1, a, g - 3, len, 2); r(c, L2, a, g - 3, len, 1);
  r(c, K2, s > 0 ? a + 7 : a + len - 8, g - 4, 1, 3);                 // кольцо
  const hx = s > 0 ? a + len : a - 6;                                  // голова — у конца столба, на боку
  r(c, K2, hx, g - 5, 6, 5); r(c, K0, hx + 1, g - 4, 4, 3); r(c, L2, hx, g - 5, 3, 1);
  if (v % 3 === 0) r(c, AS, hx + 1, g - 4, 1, 1);
}

// ── огрызки стен ──
// камень квартала — светлее его земли: пепел с сепией в тень (свет — по ряду)
const S0 = '#474442', S1 = '#5e5e5d', S2 = '#33302e';
// участок задней стены: кладка рядами по 3 точки; с уцелевшего края стена в
// полный рост, дальше обломана ступенями по рядам; проём окна с перемычкой,
// клочья штукатурки; w — ширина
function wall(c, X, G, v, w) {
  const x0 = q(X - w / 2), g = q(G), H = 12 + (v % 4) * 3, dir = v % 2 ? 1 : -1;
  // профиль: целый кусок, потом ступени вниз — по рядам кладки, с щербиной
  const top = new Array(w);
  let i = 0, h = H, run = Math.max(4, q(w * (0.28 + 0.25 * hh(v, 1, 3))));
  while (i < w) {
    for (let k = 0; k < run && i < w; k++, i++) {
      const col = dir > 0 ? i : w - 1 - i;
      top[col] = g - Math.max(2, h - (hh(col, v, 5) < 0.3 ? 1 : 0));
    }
    h -= 3 * (1 + (hh(i, v, 7) < 0.3 ? 1 : 0)); run = 2 + q(hh(i, v, 9) * 5);
    if (h < 3) h = 2 + (hh(i, v, 11) < 0.5 ? 1 : 0);
  }
  for (let x = 0; x < w; x++) {
    const y0 = top[x];
    for (let y = y0; y < g; y++) {
      const row = (g - 1 - y) / 3 | 0, cell = (x + (row & 1) * 2) / 4 | 0, lit = hh(cell, row, v + 13);
      r(c, (g - 1 - y) % 3 === 2 || ((x + (row & 1) * 2) % 4 === 0 && y > y0) ? K1 : lit < 0.25 ? S1 : lit < 0.8 ? S0 : S2, x0 + x, y, 1, 1);
    }
    const up = x > 0 && top[x - 1] > y0, dn = x < w - 1 && top[x + 1] > y0;
    r(c, up || hh(x, v, 15) < 0.45 ? L2 : S1, x0 + x, y0, 1, 1);           // верх слома — к свету
    if (dn && y0 + 1 < g) r(c, AS, x0 + x, y0 + 1, 1, Math.min(2, g - y0 - 1));   // правый край ступени — пеплом
  }
  r(c, L2, x0, top[0] + 1, 1, g - top[0] - 1); r(c, S2, x0 + w - 1, top[w - 1] + 1, 1, g - top[w - 1] - 1);   // торцы: свет слева, тень справа
  r(c, AS, x0 + w - 1, top[w - 1], 1, 1);
  // окно — у уцелевшего края, если стена там выше проёма
  const wx = dir > 0 ? x0 + 3 + (v % 3) : x0 + w - 7 - (v % 3), wy = g - H + 3;
  if (H >= 15 && top[wx - x0 - 1] < wy - 1 && top[wx - x0 + 4] < wy - 1) {
    r(c, NI, wx, wy, 4, 6); r(c, L2, wx - 1, wy - 1, 6, 1); r(c, S2, wx - 1, wy + 6, 6, 1); r(c, L2, wx - 1, wy + 6, 2, 1);
    if (v % 5 === 0) r(c, K1, wx + 1, wy, 1, 6);                        // остаток рамы
  }
  // клочья штукатурки — светлее камня
  c.globalAlpha = 0.3;
  for (let k = 0; k < 3; k++) {
    const x = q(hh(k, v, 17) * (w - 5)) + 2, y = top[x] + 2 + q(hh(k, v, 19) * Math.max(1, g - top[x] - 5));
    if (y < g - 1 && y > top[x + 2]) r(c, L1, x0 + x, y, 2 + (k & 1), 2);
  }
  c.globalAlpha = 1;
}
// печная труба: кирпич, зев в копоти, обломанный край; у основания — остатки стены
function chimney(c, X, G, v) {
  const x = q(X), g = q(G), H = 22 + (v % 3) * 3;
  r(c, BR2, x - 3, g - H, 6, H); r(c, L2, x - 3, g - H, 1, H); r(c, AS, x + 2, g - H + 1, 1, H - 1);
  for (let y = g - H + 2; y < g; y += 3) r(c, K1, x - 2, y, 4, 1);    // швы кирпича
  for (let y = g - H + 3, k = 0; y < g - 1; y += 3, k++) r(c, K1, x - 1 + (k & 1) * 2, y, 1, 2);
  r(c, K0, x - 2, g - H, 4, 2);                                        // зев — копоть
  r(c, BR2, x - 3, g - H - 1, 2, 1); r(c, L2, x - 3, g - H - 1, 1, 1);  // край обломан
  r(c, S0, x - 9, g - 6, 6, 6); r(c, K1, x - 9, g - 3, 6, 1); r(c, L2, x - 9, g - 6, 1, 6); r(c, L1, x - 9, g - 7, 3, 1); r(c, S0, x - 6, g - 7, 3, 1); r(c, L2, x - 6, g - 7, 1, 1);
  r(c, S0, x + 3, g - 4, 4, 4); r(c, AS, x + 6, g - 4, 1, 4); r(c, L1, x + 3, g - 5, 2, 1); r(c, S0, x + 5, g - 5, 1, 1);
  r(c, K1, x - 8, g - 3, 4, 1); r(c, K1, x + 3, g - 2, 3, 1);
}
// дверная арка без дома: два косяка, свод из клиньев с замковым камнем;
// у иной свод обрушен — стоят косяки, один короче
function arch(c, X, G, v) {
  const x = q(X), g = q(G), H = 16 + (v % 2) * 2, fell = v % 3 === 2;
  for (const s of [-1, 1]) {
    const jx = s < 0 ? x - 6 : x + 4, h = fell && s > 0 ? H - 6 - (v % 4) : H;
    r(c, S0, jx, g - h, 3, h);
    for (let y = g - h + 3, k = 0; y < g; y += 4, k++) { r(c, K1, jx, y, 3, 1); if ((k & 1) && y + 3 <= g) r(c, S1, jx + 1, y + 1, 1, 2); }   // камни косяка
    r(c, s < 0 ? L2 : S2, jx, g - h, 1, h); if (s > 0) r(c, AS, jx + 2, g - h, 1, h);
    r(c, L1, jx, g - h, 2, 1);
  }
  if (fell) { r(c, S0, x + 6, g - 2, 3, 2); r(c, L2, x + 6, g - 2, 2, 1); r(c, S0, x - 1, g - 1, 2, 1); r(c, S1, x - 1, g - 1, 1, 1); return; }   // клинья — у ног
  for (let a = 0; a <= 10; a++) {                                      // свод
    const t = Math.PI * a / 10, ax = x - 0.5 - Math.cos(t) * 5.5, ay = g - H - Math.sin(t) * 4;
    r(c, S0, q(ax) - 1, q(ay) - 1, 2, 2);
    r(c, a < 5 ? L2 : S1, q(ax) - 1, q(ay) - 1, 1, 1);
  }
  r(c, L1, x - 1, g - H - 5, 2, 1);                                    // замковый камень
}

// виды: { name, w, h, draw(c, x, gy) } — по зерну варианта
export function quarterLamp(v) {
  const k = v % 20;
  if (k < 9) return { name: 'мёртвый фонарь', w: 9, h: 36, draw: (c, x, g) => lamp(c, x, g, v) };
  if (k < 13) return { name: 'фонарь без стёкол', w: 9, h: 36, draw: (c, x, g) => lampBroken(c, x, g, v) };
  if (k < 16) return { name: 'погнутый фонарь', w: 21, h: 35, draw: (c, x, g) => lampBent(c, x, g, v) };
  if (k < 18) return { name: 'обломок фонаря', w: 26, h: 15, draw: (c, x, g) => lampStub(c, x, g, v) };
  return { name: 'упавший фонарь', w: 34, h: 7, draw: (c, x, g) => lampFallen(c, x, g, v) };
}
export function quarterRuin(kind, v, w = 24) {
  if (kind === 'chimney') return { name: 'печная труба', w: 20, h: 29, draw: (c, x, g) => chimney(c, x, g, v) };
  if (kind === 'arch') return { name: 'дверная арка', w: 16, h: 23, draw: (c, x, g) => arch(c, x, g, v) };
  return { name: 'огрызок стены', w, h: 22, draw: (c, x, g) => wall(c, x, g, v, w) };
}
