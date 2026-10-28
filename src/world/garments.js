// ═══════════════════════════════════════
// ГАРДЕРОБ В МИРЕ — где висят крои и как переодеться (слово автора 28.10: «базовый
// пыльник, а при посещении некоторых локаций будет появляться возможность переодеться»).
// Пыльник — свой, всегда при себе; прочие крои (sprites/wardrobe.js) висят каждый в своём
// месте мира. Дошёл до места — в его меню второе действие: «НАДЕТЬ …»; надетое там же
// снимается — «СНОВА В ПЫЛЬНИК»; снятое остаётся висеть, где висело. Ничего не теряется.
// Найденное (место, где висит) — в описи, графа «Одежда» (ui/inventory.js).
// Место — по id (городок) или по кольцу, стороне и имени постройки (ids построек — по
// порядку раскладки, сдвигаются). Второе действие у места одно: если оно уже занято
// (спуск, ведро) — прежнее главнее, крой там не висит.
// ═══════════════════════════════════════
import { CUTS } from '../sprites/wardrobe.js';

export const BASE = 'duster';
// cut → где висит; wear — подпись действия; name — в описи; on — строка, когда надел
export const GARMENTS = {
  pilgrim: { where: { id: 'church' }, place: 'Заброшенная церковь', name: 'Ряса паломника, верёвка, котомка, посох',
    wear: '<i>❦</i>НАДЕТЬ РЯСУ', on: 'Ряса впору. В котомке — пусто; посох стёрт под ладонью до гладкого.' },
  cape: { where: { id: 'theater' }, place: 'Театр Теней', name: 'Пелерина',
    wear: '<i>❦</i>НАДЕТЬ ПЕЛЕРИНУ', on: 'Пелерина по плечам. Край обтрёпан, будто в ней долго кланялись.' },
  nomad: { where: { id: 'exit' }, place: 'Выход в Пустошь', name: 'Обмотка и платок',
    wear: '<i>❦</i>ОБМОТАТЬ ГОЛОВУ', on: 'Обмотка легла виток к витку. Платок пахнет пылью дальней дороги.' },
  tiers: { where: { id: 'raven' }, place: 'Гнездо Ворона', name: 'Накидка в два яруса',
    wear: '<i>❦</i>НАКИНУТЬ ЯРУСЫ', on: 'Накидка легла ярусами, перо к перу. Ворон смотрит, не моргая.' },
};
const OFF_LINE = 'Снова в своём пыльнике. Снятое осталось висеть, где висело.';

export const wardrobe = { worn: BASE, found: new Set() };
const known = id => typeof id === 'string' && (id === BASE || (Object.hasOwn(GARMENTS, id) && Object.hasOwn(CUTS, id)));

// второе действие места, где висит крой
export function garmentAlt(loc) {
  const g = loc && loc.garment;
  if (!g || !GARMENTS[g]) return null;
  return wardrobe.worn === g ? { key: 'wear_' + BASE, label: '<i>↺</i>СНОВА В ПЫЛЬНИК' } : { key: 'wear_' + g, label: GARMENTS[g].wear };
}
// развесить по местам (world/locations.js, после всех построек и ходов)
export function hangGarments(locations) {
  const out = {};
  for (const [g, G] of Object.entries(GARMENTS)) {
    const W = G.where;
    const loc = W.id ? locations.find(l => l.id === W.id)
      : locations.filter(l => l.archDraw && l.archRing === W.ring && l.archSide === W.side && l.name === W.name)[0];
    if (!loc || loc.altNow) continue;                             // второе действие занято — не здесь
    loc.garment = g;
    loc.altNow = () => garmentAlt(loc);
    out[g] = loc;
  }
  return out;
}
// дошёл до места — крой найден (в опись)
export function noteGarment(loc) { if (loc && loc.garment && GARMENTS[loc.garment]) wardrobe.found.add(loc.garment); }
// надеть: из найденного или свой пыльник → строка для бумаги внизу, или null
export function wear(id) {
  if (!known(id) || id === wardrobe.worn) return null;
  if (id !== BASE) { if (!wardrobe.found.has(id)) wardrobe.found.add(id); wardrobe.worn = id; return GARMENTS[id].on; }
  wardrobe.worn = BASE;
  return OFF_LINE;
}
// опись: что на плечах, что где висит
export function wardrobeLines() {
  const L = [`Пыльник${wardrobe.worn === BASE ? ' — на плечах' : ' — при себе'}.`];
  for (const g of Object.keys(GARMENTS)) if (wardrobe.found.has(g)) L.push(`${GARMENTS[g].name} — ${wardrobe.worn === g ? 'на плечах' : 'висит: ' + GARMENTS[g].place}.`);
  return L;
}
export const saveWardrobe = () => ({ w: wardrobe.worn, f: [...wardrobe.found] });
export function loadWardrobe(d) {
  if (!d || typeof d !== 'object') return;
  if (Array.isArray(d.f)) for (const k of d.f) if (known(k) && k !== BASE) wardrobe.found.add(k);
  if (known(d.w) && (d.w === BASE || wardrobe.found.has(d.w))) wardrobe.worn = d.w;
}
export function _resetWardrobe() { wardrobe.worn = BASE; wardrobe.found.clear(); }
