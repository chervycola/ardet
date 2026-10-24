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
import { TOWN, TS } from './disc.js';
export const SETTLEMENT = { x1: TOWN.x0 + 40, x2: TOWN.x0 + 2650 * TS, y1: TOWN.y0 + 20, y2: TOWN.y0 + 1420 * TS };

export function isInSettlement(x, y) {
  return x >= SETTLEMENT.x1 && x <= SETTLEMENT.x2 &&
         y >= SETTLEMENT.y1 && y <= SETTLEMENT.y2;
}

// Stranded outside (old save, test URL): let the player walk *back toward* the
// settlement even though every intermediate frame is still outside — slides are
// sub-pixel and a strict "must land inside this frame" rule would lock them out.
// шаг застрявшего снаружи — только к городку и по каждой оси: по сумме осей диагональ
// уводила вдоль края всё дальше (сверка обходов замка, 24.10)
const outX = x => Math.max(0, SETTLEMENT.x1 - x, x - SETTLEMENT.x2);
const outY = y => Math.max(0, SETTLEMENT.y1 - y, y - SETTLEMENT.y2);
function closer(px, py, nx, ny) {
  const ox = outX(nx), oy = outY(ny), cx = outX(px), cy = outY(py);
  return ox <= cx && oy <= cy && ox + oy < cx + cy;
}

// Check collision with solid locations
// solidBox — твёрдое основание (постройки эпох); из того, внутри чего
// уже стоишь (телепорт, старый сейв), выйти можно всегда.
function hits(x, y, b) {
  const px1 = x + PLAYER_MX - PLAYER_W / 2;
  const py1 = y + PLAYER_MY - PLAYER_H / 2;
  return px1 < b.x + b.w && px1 + PLAYER_W > b.x && py1 < b.y + b.h && py1 + PLAYER_H > b.y;
}
export function isBlocked(nx, ny, locations, cur = null) {
  for (const l of locations) {
    if (!l.solid && !l.solidBox) continue;
    const b = l.solidBox || l;
    if (!hits(nx, ny, b)) continue;
    if (l.solidBox && cur && hits(cur.x, cur.y, b)) continue;
    return true;
  }
  return false;
}

// Street corridor — east of the waste the world narrows to one road.
// Kept in sync with world/street.js constants.
const STREET_EDGE_X = 3100;
const STREET_BAND = { y1: 800, y2: 960 };
export function isOnStreet(x) { return x > STREET_EDGE_X; }

// Try to move player, respecting collisions + boundaries
export function tryMove(player, dx, dy, locations, opts = {}) {
  const { canLeaveSettlement = true, onLock = null } = opts;

  let nx = player.x + dx;
  let ny = player.y + dy;

  // World bounds: мир открыт до самых стихий
  nx = clamp(nx, 6, MW - 22);
  ny = clamp(ny, 6, MH - 30);

  // Замок городка: без пропуска Шута за изгородь не выйти — ни к кольцам, ни дальше
  // (слово автора, 24.10). Кто всё же оказался снаружи (старое сохранение, тестовый
  // адрес), тому можно только назад, к городку.
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
      const px = player.x, py = player.y;
      if (closer(px, py, nx, ny) && !isBlocked(nx, ny, locations, player)) {
        player.x = nx; player.y = ny;
        return true;
      }
      if (closer(px, py, nx, py) && !isBlocked(nx, py, locations, player)) {
        player.x = nx;
        return true;
      }
      if (closer(px, py, px, ny) && !isBlocked(px, ny, locations, player)) {
        player.y = ny;
        return true;
      }
      return false;
    }
    // Inside the zone, trying to leave — замок молча не держит: говорит
    if (onLock) onLock();
    // try the original per-axis slide
    const slideX = player.x + dx;
    const slideY = player.y + dy;
    if (isInSettlement(slideX, player.y) && !isBlocked(slideX, player.y, locations, player)) {
      player.x = clamp(slideX, 10, MW - 22);
      return true;
    }
    if (isInSettlement(player.x, slideY) && !isBlocked(player.x, slideY, locations, player)) {
      player.y = clamp(slideY, 170, MH - 30);
      return true;
    }
    return false;
  }

  // Collision
  if (!isBlocked(nx, ny, locations, player)) {
    player.x = nx;
    player.y = ny;
    return true;
  }

  // Slide along X
  if (!isBlocked(nx, player.y, locations, player)) {
    player.x = nx;
    return true;
  }
  // Slide along Y
  if (!isBlocked(player.x, ny, locations, player)) {
    player.y = ny;
    return true;
  }

  return false;
}

// Find location under a world point (for clicks)
export function findLocationAt(gx, gy, locations, margin = 24) {
  // точное попадание — в самую маленькую вещь: табличка перед домом
  // важнее дома за ней
  let hit = null, hitArea = Infinity;
  for (const l of locations) {
    if (gx >= l.x && gx <= l.x + l.w && gy >= l.y && gy <= l.y + l.h && l.w * l.h < hitArea) {
      hitArea = l.w * l.h; hit = l;
    }
  }
  if (hit) return hit;
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
