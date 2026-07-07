// ═══════════════════════════════════════
// INPUT — unified keyboard / mouse / touch
// ═══════════════════════════════════════
import { scaler } from '../render/scaler.js';

// Action map — what keys trigger what
const ACTIONS = {
  up: ['w', 'arrowup'],
  down: ['s', 'arrowdown'],
  left: ['a', 'arrowleft'],
  right: ['d', 'arrowright'],
  sprint: ['shift'],
  interact: [' ', 'enter', 'e'],
  back: ['escape'],
};

// Held-finger walk: a touch counts as a TAP (interaction) only if it
// ends quickly and near where it started; otherwise it's a HOLD and the
// player walks toward the finger for as long as it stays down.
const TAP_MAX_MS = 280;
const TAP_MAX_DRIFT = 14; // px

class Input {
  constructor() {
    this.keys = {};
    this.mouseX = 0;
    this.mouseY = 0;
    this.clickHandlers = [];
    this.touchHandlers = [];
    this.touch = null; // { x, y, startX, startY, startT, moved }
  }

  init(canvas) {
    // Keyboard
    window.addEventListener('keydown', e => {
      this.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', e => {
      this.keys[e.key.toLowerCase()] = false;
      if (e.key === 'Shift') this.keys['shift'] = false;
    });

    // Mouse
    window.addEventListener('mousemove', e => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    canvas.addEventListener('click', e => {
      this._dispatchClick(e.clientX, e.clientY, 'mouse', e);
    });

    // Touch — hold to walk, tap to interact
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length > 1) { e.preventDefault(); return; }
      const t0 = e.touches[0];
      this.touch = {
        x: t0.clientX, y: t0.clientY,
        startX: t0.clientX, startY: t0.clientY,
        startT: Date.now(), moved: false,
      };
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const t0 = e.touches[0];
      this.mouseX = t0.clientX;
      this.mouseY = t0.clientY;
      if (this.touch) {
        this.touch.x = t0.clientX;
        this.touch.y = t0.clientY;
        const dx = t0.clientX - this.touch.startX;
        const dy = t0.clientY - this.touch.startY;
        if (dx * dx + dy * dy > TAP_MAX_DRIFT * TAP_MAX_DRIFT) this.touch.moved = true;
      }
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
      e.preventDefault();
      const t0 = e.changedTouches[0];
      const wasTap = this.touch
        && !this.touch.moved
        && (Date.now() - this.touch.startT) < TAP_MAX_MS;
      this.touch = null;
      if (wasTap) this._dispatchClick(t0.clientX, t0.clientY, 'touch', e);
    });

    canvas.addEventListener('touchcancel', () => { this.touch = null; });
  }

  // Screen point the held finger is at, or null when not held.
  getHeldTouch() {
    return this.touch ? { x: this.touch.x, y: this.touch.y } : null;
  }

  isDown(action) {
    const keys = ACTIONS[action] || [];
    return keys.some(k => this.keys[k]);
  }

  // Movement vector (normalized)
  getMove() {
    let dx = 0, dy = 0;
    if (this.isDown('up')) dy--;
    if (this.isDown('down')) dy++;
    if (this.isDown('left')) dx--;
    if (this.isDown('right')) dx++;
    if (dx || dy) {
      const len = Math.sqrt(dx * dx + dy * dy);
      return { x: dx / len, y: dy / len, active: true };
    }
    return { x: 0, y: 0, active: false };
  }

  onClick(handler) {
    this.clickHandlers.push(handler);
    return () => {
      const i = this.clickHandlers.indexOf(handler);
      if (i > -1) this.clickHandlers.splice(i, 1);
    };
  }

  _dispatchClick(clientX, clientY, type, originalEvent) {
    for (const h of this.clickHandlers) {
      try { h({ clientX, clientY, type, originalEvent }); }
      catch (e) { console.error('[input] click handler error:', e); }
    }
  }

  // Screen coords → game world coords
  screenToWorld(screenX, screenY, camera) {
    return scaler.screenToGame(screenX, screenY, camera.x, camera.y);
  }
}

export const input = new Input();
