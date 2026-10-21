// Shared player reference for modules that can't import main.js directly.
// main.js calls setPlayer(player) once after player object is constructed.

let _player = null;

export function setPlayer(p) { _player = p; }

export function getPlayer() { return _player; }
// изнанка (world/underside.js): на карте мира странник там, где спустился
let _posOverride = null;
export function setPosOverride(fn) { _posOverride = fn; }
export function getPlayerPos() {
  const o = _posOverride && _posOverride();
  if (o) return { x: o.x, y: o.y };
  return _player ? { x: _player.x, y: _player.y } : null;
}

export function playerNearLoc(loc, r) {
  if (!_player || !loc) return false;
  const cx = loc.x + (loc.w || 0) / 2;
  const cy = loc.y + (loc.h || 0) / 2;
  const dx = _player.x - cx;
  const dy = _player.y - cy;
  return dx * dx + dy * dy < r * r;
}
