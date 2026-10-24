// ═══════════════════════════════════════
// ШТАМП МЕСТА — где стоит осмотренная вещь, по-канцелярски одной строкой:
// «кольцо 6 · север · пар и тени»; в городке — «городок · вне времени»;
// дальше — «кольцо огня», «за огнём · край». Ставится в окне осмотра (ui.js).
// ═══════════════════════════════════════
import { ringAt, RINGS } from './disc.js';
import { sideAt } from './relief.js';
import { SEGMENTS } from '../content/ulitsa_db.js';

export const SIDE_RU = { north: 'север', south: 'юг', east: 'восток', west: 'запад', plain: 'равнина' };

// кольцо и сторона точки (постройки знают свои сами)
export function placeOf(loc) {
  if (!loc || loc.under || loc.house) return null;
  if (loc.archRing) return { ring: loc.archRing, side: loc.archSide };
  if (!Number.isFinite(loc.x) || !Number.isFinite(loc.y)) return null;   // не место, а действие («МОНЕТА»)
  const x = loc.x + (loc.w || 0) / 2, y = loc.y + (loc.h || 0);
  const ring = ringAt(x, y);
  return { ring, side: ring >= 1 && ring <= RINGS ? sideAt(x, y) : null };
}

export function placeStamp(loc) {
  if (!loc) return '';
  if (loc.under) return 'изнанка';
  if (loc.house) return 'дом в городке';
  const p = placeOf(loc);
  if (!p) return '';
  if (p.ring === 0) return 'городок · вне времени';
  if (p.ring === RINGS + 1) return 'кольцо огня';
  if (p.ring > RINGS) return 'за огнём · край';
  return `кольцо ${p.ring} · ${SIDE_RU[p.side] || p.side} · ${SEGMENTS[p.ring - 1].name}`;
}
