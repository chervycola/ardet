// ═══════════════════════════════════════
// PHYSICS — movement, collision, boundaries
// ═══════════════════════════════════════
import { MW, MH } from './terrain.js';
import { clamp } from '../render/draw.js';

const PLAYER_W = 14;
const PLAYER_H = 20;
const PLAYER_MX = 6;  // margin x (for hitbox offset)
const PLAYER_MY = 16;

// Starting area — most of the map is open from the beginning.
// Locked until Jester is spoken to: only the far border territories where
// the two outlier NPCs live (Dumpster Demon at 2720,200 in top-right highway,
// Nocturnal at 1665,1685 on the southern toxic plain) and the pit/brainrot fringe.
const SETTLEMENT = { x1: 40, x2: 2650, y1: 180, y2: 1580 };

export function isInSettlement(x, y) {
  return x >= SETTLEMENT.x1 && x <= SETTLEMENT.x2 &&
         y >= SETTLEMENT.y1 && y <= SETTLEMENT.y2;
}

// How far outside the settlement a point is (0 if inside). Used to let
// a stranded player walk *back toward* the settlement even though every
// intermediate frame is still outside (slides are sub-pixel; the strict
// "must land inside this frame" rule could otherwise lock the player out
// for good after a click-teleport or an old save).
function settlementDist(x, y) {
  let d = 0;
  if (x < SETTLEMENT.x1) d += SETTLEMENT.x1 - x;
  if (x > SETTLEMENT.x2) d += x - SETTLEMENT.x2;
  if (y < SETTLEMENT.y1) d += SETTLEMENT.y1 - y;
  if (y > SETTLEMENT.y2) d += y - SETTLEMENT.y2;
  return d;
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
    // Stranded outside? Allow any move that *reduces* the distance back
    // to the settlement. Covers two cases:
    //   1) the player was click-teleported to a location whose access
    //      point lies just outside the locked zone (e.g. Pizzeria @
    //      2664,1443 vs. x2=2650), and the per-frame step (2.4 px) is
    //      too small for the strict "must land inside" slide test;
    //   2) loaded an old save with a player position outside the new
    //      smaller settlement bounds.
    if (!isInSettlement(player.x, player.y)) {
      const cur = settlementDist(player.x, player.y);
      if (settlementDist(nx, ny) < cur && !isBlocked(nx, ny, locations)) {
        player.x = nx; player.y = ny;
        return true;
      }
      if (settlementDist(nx, player.y) < cur && !isBlocked(nx, player.y, locations)) {
        player.x = nx;
        return true;
      }
      if (settlementDist(player.x, ny) < cur && !isBlocked(player.x, ny, locations)) {
        player.y = ny;
        return true;
      }
      return false;
    }
    // Inside the zone, trying to leave — try the original per-axis slide
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
