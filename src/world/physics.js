// ═══════════════════════════════════════
// PHYSICS — movement, collision, boundaries
// ═══════════════════════════════════════
import { MW, MH } from './terrain.js';
import { clamp } from '../render/draw.js';

const PLAYER_W = 14;
const PLAYER_H = 20;
const PLAYER_MX = 6;  // margin x (for hitbox offset)
const PLAYER_MY = 16;

// Settlement boundary — player locked until talks to Jester
const SETTLEMENT = { x1: 380, x2: 1820, y1: 480, y2: 1320 };

export function isInSettlement(x, y) {
  return x >= SETTLEMENT.x1 && x <= SETTLEMENT.x2 &&
         y >= SETTLEMENT.y1 && y <= SETTLEMENT.y2;
}

// Check collision with solid locations
export function isBlocked(nx, ny, locations) {
  const px1 = nx + PLAYER_MX - PLAYER_W / 2;
  const py1 = ny + PLAYER_MY - PLAYER_H / 2;
  for (const l of locations) {
    if (!l.solid) continue;
    if (px1 < l.x + l.w && px1 + PLAYER_W > l.x &&
        py1 < l.y + l.h && py1 + PLAYER_H > l.y) {
      return true;
    }
  }
  return false;
}

// Try to move player, respecting collisions + boundaries
export function tryMove(player, dx, dy, locations, opts = {}) {
  const { canLeaveSettlement = true } = opts;

  let nx = player.x + dx;
  let ny = player.y + dy;

  // World bounds
  nx = clamp(nx, 10, MW - 22);
  ny = clamp(ny, 170, MH - 30);

  // Settlement lock
  if (!canLeaveSettlement && !isInSettlement(nx, ny)) {
    // Try sliding along each axis
    const slideX = player.x + dx;
    const slideY = player.y + dy;
    if (isInSettlement(slideX, player.y) && !isBlocked(slideX, player.y, locations)) {
      player.x = clamp(slideX, 10, MW - 22);
      return true;
    }
    if (isInSettlement(player.x, slideY) && !isBlocked(player.x, slideY, locations)) {
      player.y = clamp(slideY, 170, MH - 30);
      return true;
    }
    return false;
  }

  // Collision
  if (!isBlocked(nx, ny, locations)) {
    player.x = nx;
    player.y = ny;
    return true;
  }

  // Slide along X
  if (!isBlocked(nx, player.y, locations)) {
    player.x = nx;
    return true;
  }
  // Slide along Y
  if (!isBlocked(player.x, ny, locations)) {
    player.y = ny;
    return true;
  }

  return false;
}

// Find location under a world point (for clicks)
export function findLocationAt(gx, gy, locations, margin = 24) {
  let best = null;
  let bestDist = Infinity;
  for (const l of locations) {
    if (gx >= l.x - margin && gx <= l.x + l.w + margin &&
        gy >= l.y - margin && gy <= l.y + l.h + margin) {
      const cx = l.x + l.w / 2, cy = l.y + l.h / 2;
      const d = (gx - cx) ** 2 + (gy - cy) ** 2;
      if (d < bestDist) { bestDist = d; best = l; }
    }
  }
  return best;
}
