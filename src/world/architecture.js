// ═══════════════════════════════════════
// АРХИТЕКТУРА ЭПОХ — постройки колец вместо титров: эпоху и часть света
// читают по силуэтам (решение автора). Модули колец — src/sprites/arch/;
// здесь — детерминированная раскладка по кольцам и сторонам света.
// Юг/север — по пять построек, восток/запад — по три, равнина (СНГ) —
// северо-восточный угол кольца. Постройки — фон: не твёрдые, без осмотра;
// держатся поодаль от табличек и друг от друга.
// ═══════════════════════════════════════
import { ARCH_BY_RING } from '../sprites/arch/index.js';
import { SEGMENTS } from '../content/ulitsa_db.js';
import { TOWN, RING_W, RINGS } from './disc.js';
import { ARCH_LOOKS } from '../content/arch_looks.js';

function h01(n) { const v = Math.sin(n * 127.13 + 7.7) * 43758.5453; return v - Math.floor(v); }

const PER_SIDE = { south: 5, north: 5, west: 3, east: 3 };
const SIGN_CLEAR = 46;      // поодаль от табличек — их должно быть видно
const GAP = 14;             // между постройками

// точка постройки: along 0..1 вдоль стороны, depth — в полосе кольца
function sidePos(side, n, along, depth) {
  const b0 = (n - 1) * RING_W;
  if (side === 'south') return { x: TOWN.x0 + 300 + along * 2400, gy: TOWN.y1 + b0 + depth };
  if (side === 'north') return { x: TOWN.x0 + 300 + along * 2400, gy: TOWN.y0 - b0 - depth };
  if (side === 'west') return { x: TOWN.x0 - b0 - depth, gy: TOWN.y0 + 140 + along * 1360 };
  if (side === 'east') return { x: TOWN.x1 + b0 + depth, gy: TOWN.y0 + 140 + along * 1360 };
  // равнина — северо-восточный угол: дуга вокруг угла городка
  const r = b0 + depth, a = (0.22 + along * 0.56) * Math.PI / 2;
  return { x: TOWN.x1 + r * Math.cos(a), gy: TOWN.y0 - r * Math.sin(a) };
}

function overlaps(a, b) {
  return a.x - a.w / 2 - GAP < b.x + b.w / 2 && b.x - b.w / 2 - GAP < a.x + a.w / 2
    && a.gy - a.h - GAP < b.gy && b.gy - b.h - GAP < a.gy;
}

// signs — табличные локации мира (для отступа): [{x, y, w, h}]
export function buildArchitecture(signs = []) {
  const out = [];
  const signBoxes = signs.map(s => ({ x: s.x + s.w / 2, gy: s.y + s.h, w: s.w + SIGN_CLEAR * 2, h: s.h + SIGN_CLEAR }));
  for (let n = 1; n <= RINGS; n++) {
    const seg = SEGMENTS[n - 1];
    const arch = ARCH_BY_RING[seg.id];
    if (!arch) continue;
    for (const side of ['south', 'north', 'west', 'east', 'plain']) {
      const kinds = arch[side] || [];
      if (!kinds.length) continue;
      const count = side === 'plain' ? 2 + (h01(n * 5) > 0.5 ? 1 : 0) : PER_SIDE[side];
      for (let i = 0; i < count; i++) {
        const kind = kinds[(i + n) % kinds.length];
        // несколько попыток найти место, не задевающее таблички и соседей
        for (let k = 0; k < 6; k++) {
          const seed = n * 1000 + i * 37 + k * 11 + side.length * 3;
          const along = (i + 0.5) / count + (h01(seed) - 0.5) * (0.8 / count);
          const depth = 70 + h01(seed + 5) * 70;
          const p = sidePos(side, n, Math.max(0.03, Math.min(0.97, along)), depth);
          const b = { x: p.x, gy: p.gy, w: kind.w, h: kind.h };
          if (signBoxes.some(s => overlaps(b, s)) || out.some(o => overlaps(b, o))) continue;
          out.push({ ...b, draw: kind.draw, name: kind.name, ring: n, side,
            look: ARCH_LOOKS[`${seg.id}:${side}:${kind.name}`] || null });
          break;
        }
      }
    }
  }
  return out;
}

// фасад табличек формы «дом» — по кольцу и стороне
export function signFacade(ringN, side) {
  const seg = SEGMENTS[ringN - 1];
  const arch = seg && ARCH_BY_RING[seg.id];
  return (arch && arch.sign && arch.sign[side]) || null;
}

// Постройки как локации мира: подходишь — осмотр; твёрдое только
// основание (низ силуэта), чтобы высокое можно было обойти сзади.
export function archLocations(decor) {
  return decor.map((d, i) => {
    const fh = Math.max(6, Math.min(14, Math.round(d.h * 0.3)));
    const fw = Math.round(d.w * 0.84);
    return {
      id: `ar_${i}`, name: d.name, zone: 'street',
      x: Math.round(d.x - d.w / 2), y: Math.round(d.gy - d.h), w: d.w, h: d.h,
      look: d.look || d.name,
      archDraw: d.draw, archX: Math.round(d.x), archGy: Math.round(d.gy),
      archRing: d.ring, archSide: d.side,
      solidBox: { x: Math.round(d.x - fw / 2), y: Math.round(d.gy - fh), w: fw, h: fh },
    };
  });
}
