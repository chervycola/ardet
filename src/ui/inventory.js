// ═══════════════════════════════════════
// ОПИСЬ НАЙДЕННОГО (weave/ROADMAP И2). Канон (ART_BIBLE §01, §06): «инвентарь —
// опись», «пустые графы не скрываются», «итого нужных: неизвестно», «смысл —
// утерян, не возвращать»; бумага ложится поверх ночи встык, печать — криво.
// Бланк по клавише I (Ш) и кнопкой «§» на телефоне: записки — по номерам, в
// порядке находки, каждую можно перечитать; ходы изнанки; где был внизу;
// обряды. Процентов и шкал нет — только «итого», как у канцелярии.
// Данные даёт main.js (initInventory(getData)).
// ═══════════════════════════════════════
import { state } from '../core/state.js';
import { playClick } from '../audio/audio.js';
import { redNoon, smear } from '../world/redNoon.js';

const num = n => '№ ' + String(n).padStart(3, '0');
// первые слова записки: обрыв по слову, без знака перед многоточием
const firstWords = (s, max = 64) => {
  const one = String(s).replace(/\s+/g, ' ').trim();
  if (one.length <= max) return one;
  const cut = one.lastIndexOf(' ', max);
  return one.slice(0, cut > max * 0.6 ? cut : max).replace(/[\s.,:;!?—–-]+$/, '') + '…';
};

// строки бланка: заголовки граф и записи; пустые графы — одной строкой с номерами
export function inventoryLines(d) {
  const L = [{ h: 'Записки' }];
  d.notes.forEach(n => L.push({ n: num(n.n), text: firstWords(n.text), note: n }));
  const k = d.notes.length;
  if (k < d.total) L.push({ n: k + 1 === d.total ? num(d.total) : `${num(k + 1)}–${String(d.total).padStart(3, '0')}`, text: k + 1 === d.total ? 'графа не заполнена' : 'графы не заполнены', empty: true });
  L.push({ h: 'Ходы изнанки' });
  if (d.ways.length) d.ways.forEach(w => L.push({ text: w }));
  else L.push({ text: 'графа не заполнена', empty: true });
  L.push({ h: 'Где был внизу' });
  if (d.rooms.length) L.push({ text: d.rooms.join(' · ') });
  else L.push({ text: 'графа не заполнена', empty: true });
  L.push({ h: 'Обряды' });
  if (d.rites.length) d.rites.forEach(r => L.push({ text: r }));
  else L.push({ text: 'графа не заполнена', empty: true });
  return L;
}

// листы: заголовок графы не остаётся последней строкой листа
export function inventoryPages(lines, per) {
  const pages = [];
  let cur = [];
  for (const l of lines) {
    if (cur.length >= per || (l.h && cur.length >= per - 1)) { pages.push(cur); cur = []; }
    cur.push(l);
  }
  if (cur.length) pages.push(cur);
  return pages;
}

let el = null, provider = null, canOpen = () => true, data = null, pages = [], page = 0, detail = null;

// getData() → { notes: [{ n, id, text }], total, ways: [строки], rooms: [имена], rites: [строки] };
// can() — можно ли открыть сейчас (не поверх карты и бумажки)
export function initInventory(getData, can = () => true) {
  provider = getData; canOpen = can;
  if (typeof document === 'undefined') return;
  el = document.getElementById('inv');
  if (!el) return;
  el.addEventListener('click', e => {
    e.stopPropagation();
    const a = e.target.closest('[data-inv]');
    if (!a) return;
    const what = a.dataset.inv;
    if (what === 'close') closeInventory();
    else if (what === 'next') turn(1);
    else if (what === 'prev') turn(-1);
    else if (what === 'back') { detail = null; render(); }
    else if (what.startsWith('note:')) {
      const n = data && data.notes.find(x => String(x.n) === what.slice(5));
      if (n) { playClick(); detail = n; render(); }
    }
  });
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (state.is('game') && e.code === 'KeyI' && !e.repeat) { e.preventDefault(); openInventory(); return; }
    if (!state.is('paper')) return;
    if (e.key === 'Escape' || e.code === 'KeyI') { e.preventDefault(); if (detail && e.key === 'Escape') { detail = null; render(); } else closeInventory(); }
    else if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); if (!detail) turn(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'Backspace') { e.preventDefault(); if (detail) { detail = null; render(); } else turn(-1); }
  });
  const btn = document.getElementById('inv-btn');
  if (btn) btn.addEventListener('click', e => { e.stopPropagation(); if (state.is('paper')) closeInventory(); else openInventory(); });
}

export const isInventoryOpen = () => state.is('paper');

export function openInventory() {
  if (!el || !provider || !state.is('game') || !canOpen()) return;
  data = provider();
  // строк на лист — по высоте окна; на узком экране строка записки — в две строки
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280, vh = typeof window !== 'undefined' ? window.innerHeight : 720;
  const narrow = vw <= 768;
  // телефон: бланк от 112 точек сверху до низа, шапка и подвал ~200, строка ~52
  const per = narrow ? Math.max(5, Math.min(12, Math.floor((vh - 128 - 200) / 52)))
    : Math.max(6, Math.min(16, Math.floor((vh * 0.84 - 230) / 36)));
  pages = inventoryPages(inventoryLines(data), per);
  page = Math.min(page, pages.length - 1);
  detail = null;
  state.transition('paper');
  playClick();
  el.classList.add('on');
  render();
}

export function closeInventory() {
  if (!el) return;
  el.classList.remove('on');
  detail = null;
  if (state.is('paper')) state.transition('game');
}

function turn(d) {
  const p = Math.max(0, Math.min(pages.length - 1, page + d));
  if (p === page) return;
  page = p; playClick(); render();
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const touch = () => typeof window !== 'undefined' && !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

function render() {
  if (!el || !data) return;
  const close = touch() ? 'закрыть' : 'esc — закрыть';
  // красный полдень: мир без текста — бланк тоже точками
  const blind = redNoon.k > 0.5 ? smear : (x => x);
  const T = s => esc(blind(s));
  if (detail) {
    el.innerHTML = `<div class="inv-head"><span class="inv-title">${T('Записка ' + num(detail.n))}</span></div>`
      + `<div class="inv-note">${T(detail.text)}</div>`
      + `<div class="inv-nav"><span data-inv="back">← к описи</span><span data-inv="close">${close}</span></div>`;
    return;
  }
  const rows = (pages[page] || []).map(l => l.h
    ? `<div class="inv-h">${T(l.h)}</div>`
    : l.note
      ? `<div class="inv-row" data-inv="note:${l.note.n}"><span class="inv-n">${T(l.n)}</span><span class="inv-t">${T(l.text)}</span></div>`
      : `<div class="inv-row${l.empty ? ' inv-empty' : ''}">${l.n ? `<span class="inv-n">${T(l.n)}</span>` : ''}<span class="inv-t">${T(l.text)}</span></div>`).join('');
  const many = pages.length > 1;
  el.innerHTML = `<div class="inv-head"><span class="inv-title">${T('Опись найденного')}</span><span class="inv-sheet">${T(`лист ${page + 1} из ${pages.length}`)}</span></div>`
    + `<div class="inv-body">${rows}</div>`
    + `<div class="inv-foot">${T(`итого записок: ${data.notes.length} · итого нужных: неизвестно`)}<br>${T('смысл — утерян, не возвращать')}</div>`
    + `<div class="inv-stamp">${T('ПРОВЕРЕНО · СМЫСЛА НЕТ')}</div>`
    + `<div class="inv-nav">${many ? `<span data-inv="prev"${page ? '' : ' class="off"'}>← лист</span><span data-inv="next"${page < pages.length - 1 ? '' : ' class="off"'}>лист →</span>` : ''}<span data-inv="close">${close}</span></div>`;
}
