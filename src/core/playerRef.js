// Shared player reference for modules that can't import main.js directly.
// main.js calls setPlayer(player) once after player object is constructed.

let _player = null;

export function setPlayer(p) { _player = p; }

export function playerNearLoc(loc, r) {
  if (!_player || !loc) return false;
  const cx = loc.x + (loc.w || 0) / 2;
  const cy = loc.y + (loc.h || 0) / 2;
  const dx = _player.x - cx;
  const dy = _player.y - cy;
  return dx * dx + dy * dy < r * r;
}
