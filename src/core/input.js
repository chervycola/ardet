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

class Input {
  constructor() {
    this.keys = {};
    this.mouseX = 0;
    this.mouseY = 0;
    this.clickHandlers = [];
    this.touchHandlers = [];
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

    // Touch
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      this._dispatchClick(touch.clientX, touch.clientY, 'touch', e);
    });

    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const touch = e.touches[0];
      this.mouseX = touch.clientX;
      this.mouseY = touch.clientY;
    }, { passive: false });
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
