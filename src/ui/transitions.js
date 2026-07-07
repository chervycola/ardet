// ═══════════════════════════════════════
// UI TRANSITIONS — smooth open/close animations
// ═══════════════════════════════════════

// CSS transition helpers — add/remove classes with JS timing
export function fadeIn(el, duration = 300) {
  el.style.opacity = '0';
  el.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
  el.style.transform = 'translateY(8px)';
  // Force reflow
  el.offsetHeight;
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
}

export function fadeOut(el, duration = 200) {
  return new Promise(resolve => {
    el.style.transition = `opacity ${duration}ms ease-in, transform ${duration}ms ease-in`;
    el.style.opacity = '0';
    el.style.transform = 'translateY(-4px)';
    setTimeout(resolve, duration);
  });
}

export function scaleIn(el, duration = 250) {
  el.style.opacity = '0';
  el.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
  el.style.transform = 'scale(0.92)';
  el.offsetHeight;
  el.style.opacity = '1';
  el.style.transform = 'scale(1)';
}

export function slideUp(el, duration = 300) {
  el.style.opacity = '0';
  el.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
  el.style.transform = 'translateY(20px)';
  el.offsetHeight;
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
}
