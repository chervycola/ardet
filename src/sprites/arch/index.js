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

export const ARCH_BY_RING = {
  axial, porticoes, lightgarden, twohearths, enlightenment, steamshadows, catastrophes, neon, now,
};
