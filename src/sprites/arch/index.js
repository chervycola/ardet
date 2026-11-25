// ═══════════════════════════════════════
// АРХИТЕКТУРА КОЛЕЦ — реестр модулей: кольцо → { south, east, west,
// north, plain: [{ name, w, h, draw(ctx, x, gy, t) }], sign: { сторона: fn },
// props: { сторона: утварь } }. У утвари unique — примета эпохи (одна на
// сторону кольца), live — рисунок живёт (огонь, лампа, вода, подвес): такую
// вещь не запекают (render/things.js) и брошенной в поле не кладут.
// Раскладка по миру — src/world/architecture.js.
// ═══════════════════════════════════════
import { ARCH as axial } from './axial.js';
import { ARCH as porticoes } from './porticoes.js';
import { ARCH as lightgarden } from './lightgarden.js';
import { ARCH as twohearths } from './twohearths.js';
import { ARCH as enlightenment } from './enlightenment.js';
import { ARCH as steamshadows } from './steamshadows.js';
import { ARCH as catastrophes } from './catastrophes.js';
import { ARCH as neon } from './neon.js';
import { ARCH as now } from './now.js';
import { grandKind } from './kit.js';

export const ARCH_BY_RING = {
  axial, porticoes, lightgarden, twohearths, enlightenment, steamshadows, catastrophes, neon, now,
};

// доминанты — крупнее (слово автора 25.11: «сделай объекты больше — пирамиды и т. д.»): до трёхсот
// точек ростом, но не больше чем вдвое; план набора строится заново крупнее (kit.js grandKind)
export const GRAND_H = 300;
export const grandOf = h => Math.min(2, Math.round(GRAND_H / h * 20) / 20);
for (const A of Object.values(ARCH_BY_RING)) {
  if (Array.isArray(A.landmark)) A.landmark = A.landmark.map(L => grandKind(L, grandOf(L.h)));
  else if (A.landmark) A.landmark = grandKind(A.landmark, grandOf(A.landmark.h));
}
