// ═══════════════════════════════════════
// CUSTOM CURSOR — pixel-art crosshair
// ═══════════════════════════════════════

const curEl = document.getElementById('cur');
const curCtx = curEl.getContext('2d');
curCtx.imageSmoothingEnabled = false;

let visible = true;

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

export function init() {
  // Hide until game starts
  curEl.style.display = 'none';

  drawCursor();

  document.addEventListener('mousemove', e => {
    if (!visible) return;
    curEl.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
  });

  // Hide on touch device
  window.addEventListener('touchstart', () => {
    curEl.style.display = 'none';
    document.body.style.cursor = 'auto';
    visible = false;
  }, { once: true });
}

// Show cursor (call when game starts)
export function show() {
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
