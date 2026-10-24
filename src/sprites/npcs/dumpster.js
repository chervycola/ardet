// ═══════════════════════════════════════
// ДЕМОН МУСОРКИ — по осмотру, диалогу и референсу автора (24.10: горящая куча,
// над ней дым встаёт рогатым тощим демоном, руки подняты, пальцы в мудре).
// Демон — не отдельная фигура над баком: это дым самой мусорки (dialogues: «мусор
// внутри меня кончился на девятый день. Теперь горю я сама»). Дым идёт всегда;
// подойдёшь — он собирается в демона: клубы по скелету (торс, плечи, локти,
// кисти), чётко — только рога, лицо и пальцы; глаза тлеют киноварью. Отошёл —
// расходится обратно в дым. Издали — изредка проступает сам, ненадолго.
// Медленно: собирается за три секунды, тает за четыре — без вспышек.
// x, y — угол места «Горящая мусорка»; бак и огонь — sprites/locations/canon.js.
// ═══════════════════════════════════════
import { t } from '../../core/time.js';
import { X } from '../../render/context.js';
import { getPlayer } from '../../core/playerRef.js';
import { wind } from '../../world/wind.js';

const NI = '#0D0B0A', KV = '#C23B2B', SMOKE_L = '#8A8D8F', SMOKE = '#5e5e5d', SMOKE_D = '#33302e';
const q = Math.round;
const r = (x, y, w = 1, h = 1, c) => { X.fillStyle = c; X.fillRect(q(x), q(y), w, h); };
const hh = (a, b, s) => { const v = Math.sin(a * 127.1 + b * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };

let npcProximity = 0;
export function setProximity(v) { npcProximity = v; }

let pres = 0, lastT = -1;                       // насколько дым собран в демона: 0 — дым, 1 — демон
export const _demon = { set(v) { pres = v; lastT = t; }, get: () => pres };   // проверка руками и тесты
const NEAR = 150;                               // подошёл ближе — собирается

// клуб дыма: светлый верх, тень снизу справа
function puff(x, y, rad, a) {
  if (a <= 0.02) return;
  X.globalAlpha = a;
  const R = Math.max(1, q(rad));
  for (let dy = -R; dy <= R; dy++) {
    const w = q(Math.sqrt(Math.max(0, R * R - dy * dy)));
    r(x - w, y + dy, 2 * w + 1, 1, dy < -R * 0.35 ? SMOKE_L : dy === R && R >= 3 ? SMOKE_D : SMOKE);
  }
}
const lerp = (a, b, u) => a + (b - a) * u;

export function drawDumpsterDemon(dx, dy) {
  const cx = q(dx) + 24, cy = q(dy) + 8;          // над серединой бака
  // собран ли: рядом — да; издали — раз в полминуты на несколько секунд
  if (t !== lastT) {
    const P = getPlayer(), d = P ? Math.hypot(P.x + 6 - cx, P.y + 20 - (cy + 30)) : 1e9;
    const glimpse = (t % 1800) < 360;
    const want = d < NEAR ? 1 : glimpse ? 0.55 : 0;
    const steps = lastT < 0 ? 1 : Math.min(8, Math.max(0, t - lastT));
    for (let s = 0; s < steps; s++) pres += (want - pres) * (want > pres ? 1 / 180 : 1 / 240);
    lastT = t;
  }
  const k = pres * pres * (3 - 2 * pres);       // плавно
  const sway = Math.sin(t * 0.012) * 1.5 + wind.x * 3;

  // столб дыма от бака — всегда; выше — тоньше и шире разносится ветром
  for (let i = 0; i < 14; i++) {
    const age = (t * 0.35 + i * 13) % 90, u = age / 90;
    const x = cx + Math.sin(age * 0.09 + i) * (2 + u * 5) + u * u * wind.x * 26, y = cy - 4 - age * (k > 0.3 ? 0.36 : 0.5);
    puff(x, y, 2 + u * 3.5, (1 - u) * (0.32 - k * 0.12));
  }
  if (k < 0.03) { X.globalAlpha = 1; return; }

  // скелет демона (от бака вверх): талия, грудь, плечи, локти, кисти, голова
  const top = cy - 30, ox = cx + sway, j = (a, s) => Math.sin(t * 0.02 + a * 1.7 + s) * (1 - k) * 6;   // разбредание, пока не собран
  const S = {
    waist: [ox, top], chest: [ox, top - 14],
    shL: [ox - 10, top - 18], shR: [ox + 10, top - 18],
    elL: [ox - 19, top - 11], elR: [ox + 19, top - 11],
    wrL: [ox - 20, top - 30], wrR: [ox + 20, top - 30],
    head: [ox, top - 29],
  };
  // торс: от пояса к груди клубы шире кверху (тощий: рёбра — тенью)
  for (let i = 0; i <= 7; i++) {                                 // к поясу тает в дым: клочья, не бочка
    const u = i / 7, y = lerp(S.waist[1], S.chest[1], u) + Math.sin(t * 0.03 + i) * 0.6, w = lerp(2, 6, u);
    for (const s of [-1, 1]) puff(ox + s * w * (0.5 + 0.3 * hh(i, s, 3)) + j(i, s), y, lerp(1.8, 3.2, u), k * lerp(0.18, 0.6, u) * (0.75 + 0.25 * hh(i, s, 5)));
    if (i > 2) puff(ox + j(i, 0), y, lerp(1.5, 2.6, u), k * lerp(0.2, 0.55, u));
  }
  X.globalAlpha = k * 0.35;                                      // рёбра — тощий
  for (let i = 0; i < 2; i++) { r(ox - 4, S.chest[1] + 3 + i * 3, 3, 1, SMOKE_D); r(ox + 2, S.chest[1] + 3 + i * 3, 3, 1, SMOKE_D); }
  // руки: плечо → локоть (в стороны, вниз) → кисть (вверх); клубы по костям
  // рука — цельная кость дыма (2 точки: светлая к небу, тёмная к земле) и дымка вокруг
  const limb = (a, b, n, rad, side) => {
    for (let i = 0; i <= n; i++) { const u = i / n; if (i % 3 === 1) puff(lerp(a[0], b[0], u) + j(i, side) * 1.4, lerp(a[1], b[1], u), rad + 0.6, k * 0.32); }
    X.globalAlpha = Math.min(1, k * 1.05);
    const m = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
    for (let i = 0; i <= m; i++) { const u = i / m, x = lerp(a[0], b[0], u) + j(i, side) * 0.3, y = lerp(a[1], b[1], u); r(x, y, 1, 1, SMOKE_L); r(x + (Math.abs(b[1] - a[1]) > Math.abs(b[0] - a[0]) ? 1 : 0), y + (Math.abs(b[1] - a[1]) > Math.abs(b[0] - a[0]) ? 0 : 1), 1, 1, SMOKE); }
  };
  limb(S.shL, S.elL, 6, 1.8, -1); limb(S.elL, S.wrL, 9, 1.4, -2);
  limb(S.shR, S.elR, 6, 1.8, 1); limb(S.elR, S.wrR, 9, 1.4, 2);
  puff(S.chest[0], S.chest[1] - 3, 4, k * 0.8);                  // плечевой пояс
  // кисти: ладонь, три пальца вверх, кольцо большого и указательного — мудра
  X.globalAlpha = Math.min(1, k * 1.1);
  for (const [wx, wy, s] of [[S.wrL[0], S.wrL[1], -1], [S.wrR[0], S.wrR[1], 1]]) {
    const hx = q(wx), hy = q(wy);
    r(hx - 1, hy - 2, 3, 4, SMOKE); r(hx - 1, hy - 2, 3, 1, SMOKE_L);       // ладонь узкая
    for (let f = 0; f < 3; f++) r(hx + s * f * 2 - (s > 0 ? 1 : -1), hy - 7 + (f === 1 ? -1 : 0), 1, 5 + (f === 1 ? 1 : 0), SMOKE_L);   // пальцы вверх, врозь
    const rx = hx - s * 3;                                       // кольцо мудры — большой и указательный, внутрь
    r(rx - 1, hy - 4, 3, 1, SMOKE_L); r(rx - 1, hy - 2, 3, 1, SMOKE_L); r(rx - 1, hy - 3, 1, 1, SMOKE_L); r(rx + 1, hy - 3, 1, 1, SMOKE_L); r(rx, hy - 3, 1, 1, NI);
  }
  // голова: тощее лицо, рога лирой, уши острые; глаза тлеют
  const [hxf, hyf] = S.head, hx = q(hxf), hy = q(hyf);
  X.globalAlpha = Math.min(1, k * 1.15);
  for (let yy = -7; yy <= 6; yy++) {                              // лицо — к подбородку клином
    const w = yy < 2 ? q(Math.sqrt(Math.max(0, 30 - yy * yy * 0.55))) : q(lerp(4, 1, (yy - 2) / 4));
    r(hx - w, hy + yy, 2 * w + 1, 1, yy < -3 ? SMOKE_L : SMOKE);
    r(hx + w, hy + yy, 1, 1, SMOKE_D);                            // тень справа
  }
  for (const s of [-1, 1]) {
    for (let i = 0; i < 11; i++) { const u = i / 10; r(hx + s * (3 + u * 5 - u * u * 4) - (s > 0 && i < 4 ? 1 : 0), hy - 6 - u * 9, i < 4 ? 2 : 1, 1, i > 8 ? NI : i < 2 ? SMOKE : SMOKE_D); }   // рог серпом: вверх-наружу, кончик внутрь
    r(hx + s * 6, hy - 1, 1, 1, SMOKE_L); r(hx + s * 7, hy - 2, 1, 1, SMOKE_L); r(hx + s * 8, hy - 3, 1, 1, SMOKE);   // ухо острое
    r(hx + s * 2 - (s > 0 ? 1 : 0), hy - 3, 2, 1, SMOKE_D);              // бровь — к переносице
  }
  r(hx - 3, hy - 2, 2, 1, KV); r(hx + 2, hy - 2, 2, 1, KV);              // глаза тлеют
  r(hx, hy - 6, 1, 2, SMOKE_D); r(hx - 1, hy - 5, 3, 1, SMOKE_D);       // знак во лбу
  r(hx, hy, 1, 2, SMOKE_D);                                        // нос
  r(hx - 2, hy + 3, 5, 1, SMOKE_D);                                // рот — ровной чертой
  r(hx - 4, hy + 1, 1, 2, SMOKE_D); r(hx + 4, hy + 1, 1, 2, SMOKE_D);   // скулы впали
  X.globalAlpha = 1;
}
