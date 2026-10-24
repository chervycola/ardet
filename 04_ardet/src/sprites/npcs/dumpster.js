// ═══════════════════════════════════════
// ДЕМОН МУСОРКИ — по осмотру и диалогу. Демон — не крылатая фигура над баком:
// это сама мусорка, её огонь (dialogues: «мусор внутри меня кончился на девятый
// день. Теперь горю я сама»; «*треск*»). Изредка в пламени проступает лицо:
// две тёмные глазницы и щель рта, огонь на это время выше — и снова только огонь.
// Раз в двенадцать секунд, на две с половиной — не случайно. Бак и сам огонь —
// sprites/locations/canon.js (draw_dumpster). x, y — угол места «Мусорка».
// ═══════════════════════════════════════
import { t } from '../../core/time.js';
import { X } from '../../render/context.js';

const NI = '#0D0B0A', SV = '#E28A3A', KV = '#C23B2B', K0 = '#15100c';
const q = Math.round;
const r = (x, y, w = 1, h = 1, c) => { X.fillStyle = c; X.fillRect(q(x), q(y), w, h); };

let npcProximity = 0;
export function setProximity(v) { npcProximity = v; }

export function drawDumpsterDemon(dx, dy) {
  const p = t % 720;
  if (p >= 150) return;
  const k = Math.sin(p / 150 * Math.PI), x = q(dx), y = q(dy);
  // огонь поднимается — в нём лицо
  X.globalAlpha = k;
  for (let i = 0; i < 5; i++) { const h = q(8 + 6 * k + Math.sin(t * 0.2 + i) * 2); r(x + 14 + i * 4, y + 9 - h, 3, h, i & 1 ? SV : KV); }
  r(x + 16, y - 3, 4, 3, NI); r(x + 28, y - 3, 4, 3, NI);                // глазницы
  r(x + 17, y - 2, 1, 1, KV); r(x + 29, y - 2, 1, 1, KV);
  for (let i = 0; i < 12; i++) r(x + 18 + i, y + 3 + ((i & 1) ? 1 : 0), 1, 2, K0);   // щель рта — зубцами
  X.globalAlpha = 1;
}
