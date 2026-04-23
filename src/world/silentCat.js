// ═══════════════════════════════════════
// SILENT CAT — 5th Watcher
// Appears at 5 key locations, noticed when player approaches
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { X } from '../render/context.js';
import { events, E } from '../core/events.js';

const sightings = new Set();
let fifthUnlocked = false;

// Locations where cat appears, with offset from location origin
const spots = [
  { loc: 'campfire', ox: -8, oy: 28 },
  { loc: 'terminal', ox: 44, oy: 0 },
  { loc: 'tent', ox: 52, oy: 40 },
  { loc: 'nocturnal', ox: 48, oy: 85 },
  { loc: 'raven', ox: 8, oy: 18 },
];

export function draw(player, camera, locations) {
  const ctx = X;
  const P = { cat: '#050404', amber: '#daa520' };

  for (const spot of spots) {
    const l = locations.find(ll => ll.id === spot.loc);
    if (!l) continue;
    const wx = l.x + spot.ox;
    const wy = l.y + spot.oy;
    const sx = Math.floor(wx - camera.x);
    const sy = Math.floor(wy - camera.y);

    // Body
    ctx.fillStyle = P.cat;
    ctx.fillRect(sx, sy + 1, 5, 3);
    ctx.fillRect(sx + 4, sy, 2, 1);
    ctx.fillRect(sx + 5, sy + 1, 1, 1);
    ctx.fillRect(sx + 1, sy, 3, 1);
    ctx.fillRect(sx + 1, sy - 1, 1, 1);
    ctx.fillRect(sx + 3, sy - 1, 1, 1);

    // Eye
    const blink = Math.sin(t * 0.002) > 0.98 ? 0 : 1;
    if (blink) {
      ctx.fillStyle = P.amber;
      ctx.fillRect(sx + 1, sy, 1, 1);
      ctx.fillRect(sx + 3, sy, 1, 1);
    }

    // Proximity check → record sighting
    if (sightings.has(spot.loc)) continue;
    const dx = player.x - wx;
    const dy = player.y - wy;
    if (dx * dx + dy * dy < 1600) {  // 40²
      sightings.add(spot.loc);
      events.emit('cat.sighted', spot.loc, sightings.size);
      if (sightings.size === 4 && !fifthUnlocked) {
        fifthUnlocked = true;
        events.emit('cat.unlocked');
      }
    }
  }
}

export function getSightings() { return Array.from(sightings); }
export function loadSightings(arr) {
  sightings.clear();
  if (arr) arr.forEach(s => sightings.add(s));
}
export function isUnlocked() { return fifthUnlocked; }
export function setUnlocked(v) { fifthUnlocked = v; }
