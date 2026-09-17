// ═══════════════════════════════════════
// CUSTOM CURSOR — pixel-art crosshair
// ═══════════════════════════════════════

const curEl = document.getElementById('cur');
const curCtx = curEl.getContext('2d');
curCtx.imageSmoothingEnabled = false;

let visible = true;

// On touch devices the crosshair must never appear at all. The old
// hide-on-first-touch approach raced with show() at game start: touch
// hid it, then startGame() re-showed it and it sat dead in a corner.
const IS_TOUCH = typeof window !== 'undefined' &&
  ('ontouchstart' in window || (navigator && navigator.maxTouchPoints > 0));

// Draw pixel-art cursor once
function drawCursor() {
  curCtx.clearRect(0, 0, 20, 20);
  const cx = 10, cy = 10;

  // Crosshair lines
  curCtx.fillStyle = '#b8860b';
  curCtx.fillRect(cx - 4, cy, 3, 1);
  curCtx.fillRect(cx + 2, cy, 3, 1);
  curCtx.fillRect(cx, cy - 4, 1, 3);
  curCtx.fillRect(cx, cy + 2, 1, 3);

  // Center dot
  curCtx.fillStyle = '#e8dcc8';
  curCtx.fillRect(cx, cy, 1, 1);
}

let started = false;
let lastTouch = 0;

export function init() {
  // Hide until game starts
  curEl.style.display = 'none';

  drawCursor();

  document.addEventListener('mousemove', e => {
    if (!started) return;
    if (Date.now() - lastTouch < 800) return; // синтетика после тапа
    if (!visible) show(); // мышь вернулась — прицел вернулся (гибриды)
    curEl.style.left = (e.clientX - 10) + 'px';
    curEl.style.top = (e.clientY - 10) + 'px';
  });

  // Тач прячет прицел, но не навсегда — гибридные устройства
  // переключаются между пальцем и мышью.
  window.addEventListener('touchstart', () => {
    lastTouch = Date.now();
    hide();
  });
}

// Show cursor (call when game starts)
export function show() {
  started = true;
  // чисто сенсорное устройство — прицела нет вовсе
  if (IS_TOUCH && !window.matchMedia('(pointer: fine)').matches) return;
  curEl.style.display = 'block';
  visible = true;
  document.body.style.cursor = 'none';
}

// Hide cursor
export function hide() {
  curEl.style.display = 'none';
  visible = false;
  document.body.style.cursor = 'auto';
}

// Change cursor appearance
export function setMode(mode) {
  curCtx.clearRect(0, 0, 20, 20);
  const cx = 10, cy = 10;

  if (mode === 'interact') {
    // Hand pointer
    curCtx.fillStyle = '#b8860b';
    curCtx.fillRect(cx - 1, cy - 3, 3, 2);
    curCtx.fillRect(cx - 2, cy - 1, 5, 3);
    curCtx.fillRect(cx - 1, cy + 2, 3, 2);
  } else if (mode === 'danger') {
    // Red cross
    curCtx.fillStyle = '#6b0f1a';
    curCtx.fillRect(cx - 3, cy, 7, 1);
    curCtx.fillRect(cx, cy - 3, 1, 7);
  } else {
    drawCursor(); // default
  }
}
