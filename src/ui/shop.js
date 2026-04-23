// ═══════════════════════════════════════
// SHOP — merch overlays
// ═══════════════════════════════════════
import { state } from '../core/state.js';

export function openShop(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('on');
  state.transition('shop');
}

export function closeShop() {
  document.querySelectorAll('.shop-overlay').forEach(e => e.classList.remove('on'));
  state.transition('game');
}

export function initShop() {
  document.querySelectorAll('[data-close-shop]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      closeShop();
    });
  });
}
