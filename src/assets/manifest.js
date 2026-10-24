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

// Full-screen / threshold images.
export const SCENES = {
  entry:  'assets/scenes/entry.webp',  // заглавная: оттиск автора — красная луна, щит-афиша, городок (ui/title.js)
  ending: 'assets/scenes/ending.png',  // drawn during the ending sequence
};

// Flat list of all asset paths (used by the preloader + build copier).
export function allAssetPaths() {
  return [
    ...Object.values(PORTRAITS),
    ...Object.values(SCENES),
  ];
}
