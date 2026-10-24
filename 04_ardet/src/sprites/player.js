// ═══════════════════════════════════════
// СТРАННИК — по ART_BIBLE §05. «Лица нет — капюшон и тьма; рваная ткань
// слоями, как оперение; огонёк у сердца... следы на пыли — единственная
// биография.» Плащ — три яруса рваной ткани, кончики перьями. Один тёплый
// огонёк у сердца — свеча, без растра; свет вокруг даёт слой света
// (lighting.sources[0]). Подол отстаёт от хода и уходит по ветру; ярусы
// колышутся каждый в свой черёд. Свет слева, кромка пеплом справа.
// Слово автора (23.10): в тьме капюшона — два глаза-уголька, тлеют и изредка
// моргают; идёт вверх — разворачивается спиной, капюшоном к зрителю (огонька
// не видно, только отсвет по краям), идёт на юг — лицом, вбок — в профиль
// (player.face: S · N · E · W, main.js heroStep).
// Рамка рисунка прежняя: x..x+14, y−4..y+23 (тень героя, main.js).
// ═══════════════════════════════════════
import { X } from '../render/context.js';
import { t } from '../core/time.js';
import { wind } from '../world/wind.js';

const NI = '#0D0B0A', AS = '#8A8D8F', SV = '#E28A3A', KV = '#C23B2B', L1 = '#c8b89a';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K4 = '#3a3328', S2 = '#33302e';
const q = Math.round;
const r = (x, y, w = 1, h = 1, c) => { X.fillStyle = c; X.fillRect(q(x), q(y), w, h); };

// ярус плаща: x0..x0+w, от y0 вниз на h; кончики — перьями разной длины; низ сносит на off
const TIP = [0, 2, 1, 3, 0, 1, 2, 0, 3, 1, 2, 0, 1, 3, 0, 2, 1];
function tier(x0, y0, w, h, off, ph) {
  for (let k = 0; k < w; k++) {
    const u = k / (w - 1), len = h + TIP[(k + ph) % TIP.length], xx = x0 + k;
    for (let j = 0; j < len; j++) {
      const v = j / len, sx = q(off * v * (0.5 + u * 0.5));              // низ отстаёт сильнее верха
      const c = j === 0 ? (u < 0.35 ? K4 : u > 0.9 ? AS : K2)            // верхний край ловит свет
        : j === len - 1 ? (k & 1 ? K0 : K2)                              // кончик пера
        : u < 0.15 ? K2 : u > 0.92 ? S2 : v < 0.4 ? K2 : K1;
      r(xx + sx, y0 + j, 1, 1, c);
    }
  }
}
export function drawPlayer(player) {
  const x = Math.floor(player.x), y = Math.floor(player.y);
  const moving = player.moving;
  const bob = q(Math.sin(t * 0.04) * 1.2 + (moving ? Math.abs(Math.sin(t * 0.18)) * 0.6 : 0));
  const sway = q(Math.sin(t * 0.02) * 0.6);
  const w = wind.at(x + 6, y + 12), vx = player.vx || 0;
  const trail = Math.max(-2.5, Math.min(2.5, w.x * 2.4 - vx * 0.7));     // подол отстаёт и уходит по ветру
  const lean = Math.max(-1, Math.min(1, q(vx * 0.45)));
  // огонёк дрожит в порыв; под землёй его прибивает чужой сквозняк (gust), а после вдоха на пороге горит ровнее (steady)
  const flick = (0.15 + w.s * 0.25 + 0.3 * (player.gust || 0)) * (player.steady ? 0.35 : 1) * Math.sin(t * (0.45 + w.s * 0.3 + 0.4 * (player.gust || 0)) + Math.sin(t * 0.1) * 2);
  // сел (за кольцом — смотреть на песчинку): ниже на шесть точек, середина короче, подол лёг на землю шире
  const sit = player.sit || 0, sk = q(3 * sit);
  const cx = x + sway, top = y - q(bob * (1 - 0.5 * sit)) + 2 * sk;
  // следы и тень — у земли
  X.globalAlpha = 0.35; r(x + 1 - sk, y + 23, 12 + 2 * sk, 1, NI); X.globalAlpha = 1;
  // ── ярусы плаща снизу вверх: подол, середина, оплечье ──
  const ph = (t >> 4) & 7;
  tier(cx - 2 - q(2 * sit), top + 15 - sk, 18 + q(4 * sit), 6 - sk, trail, ph);
  r(cx - 1, top + 15 - sk, 16, 1, K0);                                   // тень от среднего яруса
  tier(cx - 1, top + 9, 16, 6 - sk, trail * 0.55 + Math.sin(t * 0.05) * 0.4, ph + 5);
  r(cx, top + 9, 14, 1, K0);                                             // тень от оплечья
  tier(cx + 1, top + 4, 12, 5, trail * 0.25, ph + 9);
  // куда смотрит: ладонь козырьком и сидя — лицом к зрителю
  const face = player.visor || sit > 0.5 ? 'S' : (player.face || 'S');
  const side = face === 'E' ? 1 : face === 'W' ? -1 : 0;
  // ── огонёк у сердца: свеча, сплошной; в порыв дрожит ──
  // в криосклепе тёплого нет (канон U7) — огонёк пеплом; под землёй тускнеет — язычок ниже
  const ice = (player.cold || 0) > 0.5, F = ice ? AS : SV, F0 = ice ? S2 : KV, low = player.ember !== undefined && player.ember < 0.3;
  const fx = cx + 5 + lean + side * 2, fy = top + 9;
  if (face === 'N') {
    // спиной: огонёк впереди, за плащом — только отсвет по краям ярусов
    if (!ice) { X.globalAlpha = 0.32; r(cx - 1, fy + 1, 1, 2, SV); r(cx + 14, fy + 1, 1, 2, SV); X.globalAlpha = 1; }
  } else {
    r(fx, fy + 1, 2, 2, F0);
    r(fx, fy, 2, 2, F);
    // язычок: пламя встало свечкой (flare) — выше; на развилке тянется к выходу (tug)
    const up = Math.round(3 * (player.flare || 0)), tg = player.tug, tx = tg ? (tg.x > 0 ? 2 : tg.x < 0 ? -1 : 0) : 0, ty = tg && tg.y < 0 ? 1 : 0;
    if (!low || up) r(fx + (tg && tg.x ? tx : (flick > 0.1 ? 1 : 0)), fy - 1 - (flick > 0.25 ? 1 : 0) - up - ty, 1, 1 + (flick > 0.25 ? 1 : 0) + up + ty, F);
    if ((flick > 0.3 || (player.pulse || 0) > 0.45) && !ice) r(fx, fy, 1, 1, L1);   // в порыв вспыхивает; в ходе мха — на ударе сердца
    if (!ice && t % 9 === 0 && ((t / 9) % 3 | 0) === 0) {                 // искру сносит ветром; на развилке — тянет к выходу
      X.globalAlpha = 0.6; r(fx + (tg ? tg.x * 4 : q(w.x * 3)), fy - 3 + (tg ? tg.y * 6 : 0), 1, 1, SV); X.globalAlpha = 1;
    }
  }
  // ── капюшон: в тьме — два уголька; спиной — тьмы не видно, шов по капюшону ──
  const hx = cx + 2 + lean, hy = top - 4;
  r(hx + 4 - side, hy - 2, 1, 1, K2); r(hx + 3 - side, hy - 1, 3, 1, K2);  // острие клобука: в профиль отстаёт назад
  r(hx + 1, hy, 7, 1, K2); r(hx, hy + 1, 9, 8, K1);
  r(hx, hy + 1, 1, 7, K4); r(hx + 1, hy, 2, 1, K4); r(hx + 8, hy + 2, 1, 6, AS);   // к свету; кромка пеплом
  if (face === 'N') {
    r(hx + 4, hy + 1, 1, 8, K0); r(hx + 3, hy + 2, 1, 5, K2);              // спина капюшона: шов и складка
  } else {
    // тьма лица: анфас — посередине, в профиль — у переднего края
    const o = side > 0 ? 2 : side < 0 ? -1 : 0, wd = side ? 4 : 5;
    r(hx + 2 + o, hy + 3, wd, 5, NI); r(hx + 3 + o, hy + 2, wd - 2, 1, NI); r(hx + 2 + o, hy + 8, wd, 1, NI);
    // глаза-угольки: тлеют, раз в четыре с лишним секунды моргают; в профиль — один
    if (t % 260 >= 6) {
      const glow = ice ? AS : SV, a = 0.55 + 0.25 * Math.sin(t * 0.12);
      X.globalAlpha = a;
      if (side > 0) r(hx + 6, hy + 5, 1, 1, glow);
      else if (side < 0) r(hx + 1, hy + 5, 1, 1, glow);
      else { r(hx + 3, hy + 5, 1, 1, glow); r(hx + 5, hy + 5, 1, 1, glow); }
      X.globalAlpha = 1;
    }
  }
  for (const k of [0, 2, 5, 7]) r(hx + k, hy + 9, 1, 1 + (k & 1), K1);     // рваный край на оплечье
  // ладонь козырьком (за кольцом — смотреть горизонт): правый рукав вверх, локоть в сторону, ладонь над тьмой
  if (player.visor) {
    r(hx + 10, top + 5, 1, 2, K1); r(hx + 11, top + 3, 1, 2, K2); r(hx + 12, top + 2, 1, 2, AS);   // плечо, локоть — кромкой пеплом
    r(hx + 10, top + 1, 1, 2, K2); r(hx + 9, hy + 3, 1, 2, K2);                               // предплечье к виску
    r(hx + 1, hy + 2, 8, 1, K4); r(hx + 2, hy + 3, 6, 1, K1); r(hx, hy + 2, 1, 1, AS);         // ладонь: сверху свет, снизу тень на лицо
  }
}
