// ═══════════════════════════════════════
// LORE — collectible fragment management
// ═══════════════════════════════════════
import { loreItems } from '../content/lore.js';
import { events, E } from '../core/events.js';
import { t } from '../core/time.js';
import { X } from '../render/context.js';
import { rect, hash } from '../render/draw.js';

const collected = new Set();

// Track player proximity and pickup
export function checkLorePickup(player) {
  for (const item of loreItems) {
    if (collected.has(item.id)) continue;
    const dx = player.x + 6 - item.x;
    const dy = player.y + 10 - item.y;
    if (dx * dx + dy * dy < 800) {
      collected.add(item.id);
      events.emit(E.LORE_COLLECT, item);
      return item;
    }
  }
  return null;
}

export function getCollectedCount() { return collected.size; }
export function getTotalCount() { return loreItems.length; }
export function isCollected(id) { return collected.has(id); }

export function loadCollected(ids) {
  collected.clear();
  ids.forEach(id => collected.add(id));
}

export function getCollectedIds() { return Array.from(collected); }

// Render uncollected lore items as small glowing specs on the ground
export function drawLoreItems(cam) {
  const ctx = X;
  for (const item of loreItems) {
    if (collected.has(item.id)) continue;
    const sx = item.x - cam.x;
    const sy = item.y - cam.y;

    // Subtle pulse
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.05 + item.x * 0.01);
    ctx.globalAlpha = 0.25 + pulse * 0.3;

    // Small amber glow
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(item.x, item.y, 2, 2);
    ctx.fillRect(item.x - 1, item.y + 1, 1, 1);
    ctx.fillRect(item.x + 2, item.y + 1, 1, 1);
    ctx.fillRect(item.x + 1, item.y - 1, 1, 1);
    ctx.fillRect(item.x + 1, item.y + 2, 1, 1);

    ctx.globalAlpha = 1;
  }
}
