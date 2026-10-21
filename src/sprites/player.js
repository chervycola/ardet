// ═══════════════════════════════════════
// СТРАННИК — по ART_BIBLE §05. «Лица нет — капюшон и тьма; рваная ткань
// слоями, как оперение; огонёк у сердца... следы на пыли — единственная
// биография.» Плащ — три яруса рваной ткани, кончики перьями; капюшон — тьма,
// в ней никого. Один тёплый огонёк у сердца — свеча, без растра; свет вокруг
// даёт слой света (lighting.sources[0]). Подол отстаёт от хода и уходит по
// ветру; ярусы колышутся каждый в свой черёд. Свет слева, кромка пеплом справа.
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
  const flick = (0.15 + w.s * 0.25) * Math.sin(t * (0.45 + w.s * 0.3) + Math.sin(t * 0.1) * 2);
  const cx = x + sway, top = y - bob;
  // следы и тень — у земли
  X.globalAlpha = 0.35; r(x + 1, y + 23, 12, 1, NI); X.globalAlpha = 1;
  // ── ярусы плаща снизу вверх: подол, середина, оплечье ──
  const ph = (t >> 4) & 7;
  tier(cx - 2, top + 15, 18, 6, trail, ph);
  r(cx - 1, top + 15, 16, 1, K0);                                        // тень от среднего яруса
  tier(cx - 1, top + 9, 16, 6, trail * 0.55 + Math.sin(t * 0.05) * 0.4, ph + 5);
  r(cx, top + 9, 14, 1, K0);                                             // тень от оплечья
  tier(cx + 1, top + 4, 12, 5, trail * 0.25, ph + 9);
  // ── огонёк у сердца: свеча, сплошной; в порыв дрожит ──
  // в криосклепе тёплого нет (канон U7) — огонёк пеплом; под землёй тускнеет — язычок ниже
  const ice = (player.cold || 0) > 0.5, F = ice ? AS : SV, F0 = ice ? S2 : KV, low = player.ember !== undefined && player.ember < 0.3;
  const fx = cx + 5 + lean, fy = top + 9;
  r(fx, fy + 1, 2, 2, F0);
  r(fx, fy, 2, 2, F);
  if (!low) r(fx + (flick > 0.1 ? 1 : 0), fy - 1 - (flick > 0.25 ? 1 : 0), 1, 1 + (flick > 0.25 ? 1 : 0), F);
  if ((flick > 0.3 || (player.pulse || 0) > 0.45) && !ice) r(fx, fy, 1, 1, L1);   // в порыв вспыхивает; в ходе мха — на ударе сердца
  if (!ice && t % 9 === 0 && ((t / 9) % 3 | 0) === 0) { X.globalAlpha = 0.6; r(fx + q(w.x * 3), fy - 3, 1, 1, SV); X.globalAlpha = 1; }   // искру сносит
  // ── капюшон: лица нет — тьма ──
  const hx = cx + 2 + lean, hy = top - 4;
  r(hx + 4, hy - 2, 1, 1, K2); r(hx + 3, hy - 1, 3, 1, K2);                // острие клобука
  r(hx + 1, hy, 7, 1, K2); r(hx, hy + 1, 9, 8, K1);
  r(hx, hy + 1, 1, 7, K4); r(hx + 1, hy, 2, 1, K4); r(hx + 8, hy + 2, 1, 6, AS);   // к свету; кромка пеплом
  r(hx + 2, hy + 3, 5, 5, NI); r(hx + 3, hy + 2, 3, 1, NI); r(hx + 2, hy + 8, 5, 1, NI);   // тьма — лица нет
  for (const k of [0, 2, 5, 7]) r(hx + k, hy + 9, 1, 1 + (k & 1), K1);     // рваный край на оплечье
}
