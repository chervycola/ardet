// ═══════════════════════════════════════
// ANFILADA UI — walking the nine halls (phase 2, overlay mode)
// The townlet gates open here. ←/→ move between halls, B flips
// facade/backyard, Esc leaves. Drafts (live doors) jump to hall 9
// with a burst of radio static. Deterministic; nothing is saved
// except the gates' one-time line.
// ═══════════════════════════════════════
import { state } from '../core/state.js';
import { HALLS, getHall } from '../content/anfilada_db.js';
import { playDistantSound, playClick } from '../audio/audio.js';

const el = () => document.getElementById('anf');
const bodyEl = () => document.getElementById('anf-body');

let current = 1;          // hall number 1..9
let side = 'facade';      // 'facade' | 'backyard'
let gatesLineShown = false; // the one-time gates line (session-scoped)
let staticTimer = null;

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function render() {
  const h = getHall(current);
  if (!h || !bodyEl()) return;
  const lines = [];

  // Header
  lines.push(`<div class="anf-num">ЗАЛ ${h.n} / 9</div>`);
  lines.push(`<div class="anf-title">${esc(h.title)}</div>`);
  lines.push(`<div class="anf-years">${esc(h.years)}</div>`);

  // Side switch indicator
  const isBack = side === 'backyard';
  lines.push(`<div class="anf-side">${isBack ? '— задворки (служебная дверь) —' : '— фасад —'}</div>`);

  // Main text
  const text = isBack ? h.backyard : h.facade;
  lines.push(`<div class="anf-text">${esc(text).replace(/\n/g, '<br>')}</div>`);

  if (!isBack) {
    // Exhibits on the facade side
    lines.push(`<div class="anf-h">экспонаты:</div>`);
    for (const ex of h.exhibits) {
      lines.push(`<div class="anf-ex"><span class="anf-exn">${esc(ex.name)}</span> — ${esc(ex.text)}</div>`);
    }
  } else {
    // Leaks live behind the service door
    if (h.leaks && h.leaks.length) {
      lines.push(`<div class="anf-h">протечки:</div>`);
      for (const lk of h.leaks) {
        lines.push(`<div class="anf-leak">${esc(lk)}</div>`);
      }
    }
  }

  // Drafts — doors blown open into hall 9
  if (h.drafts && h.drafts.length) {
    lines.push(`<div class="anf-h">сквозняк:</div>`);
    for (const d of h.drafts) {
      lines.push(`<div class="anf-draft" data-draft="1">▸ ${esc(d.name)} — ${esc(d.note)}. <span class="anf-go">[войти]</span></div>`);
    }
  }
  if (h.n === 9 && h.receives && h.receives.length) {
    lines.push(`<div class="anf-h">сюда сквозит из:</div>`);
    lines.push(`<div class="anf-leak">${esc(h.receives.join(' · '))}</div>`);
  }

  // Footer hints
  lines.push(`<div class="anf-nav">${current > 1 ? '← зал ' + (current - 1) : '← врата'}   |   ${isBack ? '[B] фасад' : '[B] задворки'}   |   ${current < 9 ? 'зал ' + (current + 1) + ' →' : '(анфилада кончается; сквозит)'}   |   [Esc] выйти</div>`);

  bodyEl().innerHTML = lines.join('');

  // Wire draft doors
  bodyEl().querySelectorAll('[data-draft]').forEach(d => {
    d.addEventListener('click', () => jumpToNow());
  });
}

// Radio-static burst then land in hall 9
function jumpToNow() {
  if (current === 9) return;
  playDistantSound();
  const b = bodyEl();
  if (b) {
    b.classList.add('anf-static');
    clearTimeout(staticTimer);
    staticTimer = setTimeout(() => {
      b.classList.remove('anf-static');
    }, 450);
  }
  current = 9;
  side = 'facade';
  render();
}

export function open() {
  if (!el()) return;
  if (!state.transition('anfilada')) return;
  current = 1;
  side = 'facade';
  el().classList.add('on');
  if (!gatesLineShown) {
    gatesLineShown = true;
    // One-time gates line precedes the first hall
    if (bodyEl()) {
      bodyEl().innerHTML =
        `<div class="anf-gates">Эти врата были предназначены для тебя одного. Обычно это узнают позже.</div>` +
        `<div class="anf-nav">[любая клавиша]</div>`;
      const once = () => { render(); };
      setTimeout(() => {
        document.addEventListener('keydown', once, { once: true });
        el().addEventListener('click', once, { once: true });
      }, 0);
      return;
    }
  }
  render();
}

export function close() {
  if (!el()) return;
  el().classList.remove('on');
  state.transition('game');
}

export function isOpen() { return state.is('anfilada'); }

function onKey(e) {
  if (!state.is('anfilada')) return;
  if (e.key === 'Escape') { e.preventDefault(); close(); return; }
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    if (current < 9) { current++; side = 'facade'; playClick(); render(); }
    return;
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (current > 1) { current--; side = 'facade'; playClick(); render(); }
    else { close(); } // walking back out through the gates
    return;
  }
  if (e.key === 'b' || e.key === 'B' || e.key === 'и' || e.key === 'И') {
    e.preventDefault();
    side = (side === 'facade') ? 'backyard' : 'facade';
    playClick();
    render();
  }
}

export function init() {
  document.addEventListener('keydown', onKey);
}

// Test-only handle — drive navigation headlessly.
export const _test = {
  get current() { return current; },
  get side() { return side; },
  set(n, s) { current = n; side = s || 'facade'; },
  render, jumpToNow, onKey,
  resetGatesLine() { gatesLineShown = false; },
};
