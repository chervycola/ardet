// ═══════════════════════════════════════
// ASSET LOADER — lazy PNG loading with cache + graceful fallback.
// The build copies src/assets/* into build/assets/*; this module
// resolves the manifest paths relative to the HTML at runtime.
// Missing images do NOT crash anything — get() resolves to null and
// callers know to render their fallback (the pixel sprite, an empty
// frame, the void).
// ═══════════════════════════════════════
import { PORTRAITS, SCENES, PLACES } from './manifest.js';

const cache = new Map();        // path → Image | null (null = known missing)
const pending = new Map();      // path → Promise<Image|null>

// Где лежат картины: на сайте — assets/ рядом со страницей (как музыка и значки),
// в локальной сборке build/index.html — ../assets/ (корневая папка репозитория).
// window.ARDET_ASSET_BASE — свой адрес, если положили иначе.
function bases() {
  const own = typeof window !== 'undefined' && window.ARDET_ASSET_BASE;
  return [own, '', '../'].filter(b => b !== false && b !== null && b !== undefined);
}

// Probe an image path. Returns the loaded Image on success, or null
// once we've confirmed the file isn't there (under every base).
function probe(path) {
  if (cache.has(path)) return Promise.resolve(cache.get(path));
  if (pending.has(path)) return pending.get(path);
  const p = new Promise((resolve) => {
    if (typeof Image === 'undefined') {        // headless test env
      cache.set(path, null);
      resolve(null);
      return;
    }
    const list = bases();
    const next = i => {
      if (i >= list.length) { cache.set(path, null); resolve(null); return; }
      const img = new Image();
      img.onload = () => { cache.set(path, img); resolve(img); };
      img.onerror = () => next(i + 1);
      img.src = list[i] + path;
    };
    next(0);
  });
  pending.set(path, p);
  return p;
}

// Public: ask for a portrait by NPC id; returns Image|null synchronously
// if already cached, or a Promise if it's the first request. Drawing
// code can call get() and skip drawing when it's null.
export function getPortrait(npcId) {
  const path = PORTRAITS[npcId];
  if (!path) return null;
  if (cache.has(path)) return cache.get(path);
  // Kick off the load; first frame after this will get the image.
  probe(path);
  return null;
}

// любая картинка по пути от корня ассетов (окна диалога — weave/WINDOWS.md)
export const loadAsset = path => probe(path);

// то же, но дождаться: портрет пришёл позже, чем открылся разговор
export function loadPortrait(npcId) {
  const path = PORTRAITS[npcId];
  return path ? probe(path) : Promise.resolve(null);
}

// картина места для вклейки в осмотр: путь по ключу; null — нет такой (или ещё грузится — тогда Promise)
export const placePath = key => (key && PLACES[key]) || null;
export function loadPlace(key) {
  const path = placePath(key);
  return path ? probe(path) : Promise.resolve(null);
}

export function getScene(id) {
  const path = SCENES[id];
  if (!path) return null;
  if (cache.has(path)) return cache.get(path);
  probe(path);
  return null;
}

// Preload everything declared in the manifest. Useful at game boot so
// the first dialogue doesn't open with a blank portrait frame.
export function preloadAll() {
  const paths = [...Object.values(PORTRAITS), ...Object.values(SCENES)];
  return Promise.all(paths.map(probe));
}

// Test handle — let tests inspect the cache without prodding internals
// from the outside.
export const _test = {
  cache,
  clear() { cache.clear(); pending.clear(); },
  seed(path, value) { cache.set(path, value); },
};
