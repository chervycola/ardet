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
  eyes: ['c', 'с'],            // закрыть глаза — пока держишь (world/eyes.js)
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
    this.lastTouchT = 0;
    this.lastMouseT = 0;                 // когда в последний раз двигалась живая мышь (угольки сидящего — за курсором)
    this.twoFingers = false;   // два пальца на экране — закрыть глаза (world/eyes.js)
  }

  init(canvas) {
    // Keyboard
    window.addEventListener('keydown', e => this.press(e, true));
    window.addEventListener('keyup', e => {
      this.press(e, false);
      if (e.key === 'Shift') this.keys['shift'] = false;
      if (e.key === 'Meta') this.keys = {};                        // отпустил Cmd — всё, что держал при нём, отпущено
      if (e.code === 'KeyC') { this.keys['c'] = false; this.keys['с'] = false; }   // раскладку сменили, держа C
    });
    // ушёл из окна с зажатой клавишей — keyup не придёт: всё отпущено (веки не остаются сомкнутыми)
    window.addEventListener('blur', () => { this.keys = {}; this.twoFingers = false; });

    // Mouse
    window.addEventListener('mousemove', e => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      // живая мышь, а не отзвук касания (браузер шлёт мышиное событие после тапа)
      if (Date.now() - this.lastTouchT > 800) this.lastMouseT = Date.now();
    });

    canvas.addEventListener('click', e => {
      this._dispatchClick(e.clientX, e.clientY, 'mouse', e);
    });
    // правая кнопка — «использовать» (weave/ROADMAP И3); долгий тап телефона тоже
    // рождает contextmenu — палец держат, чтобы идти, не чтобы использовать
    canvas.addEventListener('contextmenu', e => {
      e.preventDefault();
      if (this.touch || Date.now() - this.lastTouchT < 1000) return;
      this._dispatchClick(e.clientX, e.clientY, 'mouse', e, 'use');
    });

    // Touch — hold to walk, tap to interact
    canvas.addEventListener('touchstart', e => {
      this.lastTouchT = Date.now();
      // второй палец: не идти, а закрыть глаза — пока оба на экране (прежде второй палец гасился)
      if (e.touches.length > 1) { e.preventDefault(); this.twoFingers = true; this.touch = null; return; }
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
      this.lastTouchT = Date.now();
      if (e.touches.length < 2) this.twoFingers = false;
      const t0 = e.changedTouches[0];
      const wasTap = this.touch
        && !this.touch.moved
        && (Date.now() - this.touch.startT) < TAP_MAX_MS;
      this.touch = null;
      if (wasTap) this._dispatchClick(t0.clientX, t0.clientY, 'touch', e);
    });

    canvas.addEventListener('touchcancel', () => { this.touch = null; this.twoFingers = false; });
  }

  // Screen point the held finger is at, or null when not held.
  // Первые 100 мс неподвижный палец не ведёт: два пальца ложатся не разом, и шаг
  // первого будил бы спящего кота (world/silentCat.js). Повёл пальцем — идёт сразу.
  getHeldTouch() {
    const t = this.touch;
    if (!t || (!t.moved && Date.now() - t.startT < 100)) return null;
    return { x: t.x, y: t.y };
  }

  // клавиша: по букве и по месту (слово автора 25.11: WASD в русской раскладке — ц ы ф в — тоже ход).
  // Буквенные клавиши пишутся и латинской буквой своего места (e.code KeyW → 'w'): шаг, веки (C) и
  // «осмотреть» (E) работают в любой раскладке
  press(e, down) {
    // Cmd/Ctrl + буква — команда (копировать в терминале), не шаг и не веки; на маке keyup
    // буквы при зажатом Cmd не приходит — клавиша залипла бы
    if (down && (e.metaKey || e.ctrlKey) && e.key && e.key.length === 1) return;
    if (e.key) this.keys[e.key.toLowerCase()] = down;
    const m = /^Key([A-Z])$/.exec(e.code || '');
    if (m) this.keys[m[1].toLowerCase()] = down;
  }

  isDown(action) {
    const keys = ACTIONS[action] || [];
    return keys.some(k => this.keys[k]);
  }

  // закрыть глаза: клавиша C (С) или два пальца
  eyesWanted() {
    const a = typeof document !== 'undefined' && document.activeElement;
    if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable)) return false;   // пишут — не жмурятся
    return this.isDown('eyes') || this.twoFingers;
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

  // intent — что сделать с вещью, когда дойдёшь: null — как обычно, 'use' — правая кнопка
  _dispatchClick(clientX, clientY, type, originalEvent, intent = null) {
    for (const h of this.clickHandlers) {
      try { h({ clientX, clientY, type, originalEvent, intent }); }
      catch (e) { console.error('[input] click handler error:', e); }
    }
  }

  // Screen coords → game world coords
  screenToWorld(screenX, screenY, camera) {
    return scaler.screenToGame(screenX, screenY, camera.x, camera.y);
  }
}

export const input = new Input();
