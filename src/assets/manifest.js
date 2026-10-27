// ═══════════════════════════════════════
// ASSET MANIFEST — declared art slots and where they go.
// Source of truth for paintings/portraits/backgrounds shipped with the
// build. Each entry maps a canonical id to a relative path (resolved
// from build/ at runtime). Missing files degrade gracefully — slots
// just stay blank, no crash.
// ═══════════════════════════════════════

// Portraits drawn into the #dpc canvas next to NPC dialogue. Keyed by
// the NPC id from locations.js (loc.npc). Files go into the repo-root
// assets/portraits/ (next to assets/music, assets/icons); what to paint
// and how — weave/PORTRAITS.md. No file — no frame (ui.js drawPortrait).
export const PORTRAITS = {
  jester:    'assets/portraits/jester.png',
  sol:       'assets/portraits/sol.png',
  elder:     'assets/portraits/elder.png',
  watchman:  'assets/portraits/elder.png',     // труппа: Дежурного криосклепа играет Старец
  nocturnal: 'assets/portraits/nocturnal.png',
  dumpster:  'assets/portraits/dumpster.png',
  machinist: 'assets/portraits/machinist.png',  // машинист ржавого поезда (промт — weave/PORTRAITS.md)
  // The next two are non-NPC archetypes but show up in look panels /
  // terminal entries — kept here so the same loader can serve them.
  archivist: 'assets/portraits/archivist.png',
  cat:       'assets/portraits/cat.png',
  moss:      'assets/portraits/moss.png',
};

// Картины мест — вклейка в окно осмотра (вариант А, слово автора 25.10): оттиск 3:4 стоит над
// справкой, как портрет над протоколом. Ключ — id места (world/locations.js) или ключ постройки
// колец «кольцо:сторона:имя» (как в arch_looks.js). Файла нет — вклейки нет. Грузятся при первом
// осмотре, не на заставке (в preloadAll не входят). Что писать и как — weave/PLACES.md.
export const PLACES = {
  campfire:  'assets/places/campfire.webp',   // жертвенный костёр и Шут у огня
  office:    'assets/places/office.webp',     // канцелярия: глухой фасад, окно №3
  lantern1:  'assets/places/lantern1.webp',   // погасший фонарь
  gates:     'assets/places/gates.webp',      // врата: створки вросли, блюдце на пороге
  theater:   'assets/places/theater.webp',    // театр теней
  library:   'assets/places/library.webp',    // разрушенная библиотека
  church:    'assets/places/church.webp',     // заброшенная церковь
  train:     'assets/places/train.webp',      // ржавый поезд набекрень
  pizzeria:  'assets/places/pizzeria.webp',   // пиццерия «Вавилон»
  lake:      'assets/places/lake.webp',       // токсичное озеро
  crater:    'assets/places/crater.webp',     // кратер
  ruins:     'assets/places/ruins.webp',      // жилой дом №7
};

// Full-screen / threshold images.
export const SCENES = {
  entry:  'assets/scenes/entry-wide.webp',  // заглавная: оттиск автора — красная луна, щит-афиша, городок (ui/title.js)
  ending: 'assets/scenes/ending.png',  // drawn during the ending sequence
};

// Flat list of all asset paths (used by the preloader + build copier).
export function allAssetPaths() {
  return [
    ...Object.values(PORTRAITS),
    ...Object.values(SCENES),
  ];
}
