// ═══════════════════════════════════════
// ТЕКСТ-РЕДАКТОР «КАНЦЕЛЯРИЯ · ПРАВКА» — правка всех игровых текстов
// прямо в игре. Включается ?editor / #editor в адресе или клавишей F2.
// Правки живут в localStorage, применяются к миру сразу и выгружаются
// файлом ardet-edits.json — его подхватывает оркестрация и вносит
// в исходники (заодно выучивая авторский стиль).
// ═══════════════════════════════════════
import { locations, attachContent } from '../world/locations.js';
import { looks } from '../content/looks.js';
import { dialogues } from '../content/dialogues.js';
import { loreItems } from '../content/lore.js';
import { SEGMENTS, TOWNLET } from '../content/ulitsa_db.js';
import { termDb } from '../content/terminal_db.js';
import { hiddenInscriptions } from '../world/inscriptions.js';
import { WHISPERS } from '../world/whisper.js';
import { menuInscriptions } from './ui.js';
import { state } from '../core/state.js';

const LS_KEY = 'ardet_text_edits';

// ── Каталог: плоский список редактируемых записей ──
// Каждая: { key, cat, label, get(), set(text) }
function catalog() {
  const items = [];
  const seg = (id) => id === 'townlet' ? TOWNLET : SEGMENTS.find(s => s.id === id);

  for (const id of Object.keys(looks)) {
    items.push({
      key: `look:${id}`, cat: 'осмотры',
      label: (locations.find(l => l.id === id) || {}).name || id,
      get: () => looks[id],
      set: (t) => { looks[id] = t; attachContent(looks, dialogues); },
    });
  }
  for (const [locId, lines] of Object.entries(dialogues)) {
    lines.forEach((_, i) => items.push({
      key: `dlg:${locId}:${i}`, cat: 'диалоги',
      label: `${(locations.find(l => l.id === locId) || {}).name || locId} · реплика ${i + 1}`,
      get: () => dialogues[locId][i],
      set: (t) => { dialogues[locId][i] = t; },
    }));
  }
  for (const sgId of [...SEGMENTS.map(s => s.id), 'townlet']) {
    const s = seg(sgId);
    if (!s) continue;
    for (const sign of s.signs) {
      for (const f of ['facade', 'backyard']) {
        if (sign[f] === undefined) continue;
        items.push({
          key: `sign:${sgId}:${sign.x}:${f}`, cat: 'таблички',
          label: `${s.name || sgId} · ${sign.name} · ${f === 'facade' ? 'фасад' : 'двор'}`,
          get: () => sign[f],
          set: (t) => { sign[f] = t; },
        });
      }
    }
  }
  for (const it of loreItems) {
    items.push({
      key: `lore:${it.id}`, cat: 'записки',
      label: `${it.id} · ${it.text.slice(0, 36)}…`,
      get: () => it.text,
      set: (t) => { it.text = t; },
    });
  }
  for (const [locId, lines] of Object.entries(hiddenInscriptions)) {
    lines.forEach((_, i) => items.push({
      key: `insc:${locId}:${i}`, cat: 'надписи',
      label: `${locId} · строка ${i + 1}`,
      get: () => hiddenInscriptions[locId][i],
      set: (t) => { hiddenInscriptions[locId][i] = t; },
    }));
  }
  for (const locId of Object.keys(WHISPERS)) {
    items.push({
      key: `whisper:${locId}`, cat: 'шёпоты',
      label: locId,
      get: () => WHISPERS[locId],
      set: (t) => { WHISPERS[locId] = t; },
    });
  }
  for (const locId of Object.keys(menuInscriptions)) {
    items.push({
      key: `menu:${locId}`, cat: 'меню',
      label: locId,
      get: () => menuInscriptions[locId],
      set: (t) => { menuInscriptions[locId] = t; },
    });
  }
  for (const k of Object.keys(termDb)) {
    items.push({
      key: `term:${k}`, cat: 'терминал',
      label: k,
      get: () => termDb[k].text,
      set: (t) => { termDb[k].text = t; },
    });
  }
  return items;
}

// ── Правки: хранение и применение ──
let edits = {};
try { edits = JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch (e) {}
function saveEdits() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(edits)); } catch (e) {}
}

let items = null;
function ensureItems() { if (!items) items = catalog(); return items; }

export function applyEdits() {
  const byKey = new Map(ensureItems().map(it => [it.key, it]));
  let applied = 0;
  for (const [key, val] of Object.entries(edits)) {
    const it = byKey.get(key);
    if (it && typeof val === 'object' && typeof val.text === 'string') {
      it.set(val.text); applied++;
    }
  }
  if (applied) console.log(`[правка] применено правок: ${applied}`);
}

// ── UI ──
let root = null, listEl = null, editEl = null, current = null, catFilter = '';

function build() {
  if (root) return;
  root = document.createElement('div');
  root.id = 'txed';
  root.innerHTML = `
    <div id="txed-box">
      <div id="txed-head">
        <b>КАНЦЕЛЯРИЯ · ПРАВКА</b>
        <span id="txed-count"></span>
        <button id="txed-export">выгрузить правки</button>
        <button id="txed-close">✕</button>
      </div>
      <div id="txed-cats"></div>
      <input id="txed-search" placeholder="поиск по текстам и именам…">
      <div id="txed-body">
        <div id="txed-list"></div>
        <div id="txed-edit">
          <div id="txed-label"></div>
          <textarea id="txed-ta" spellcheck="false"></textarea>
          <div id="txed-btns">
            <button id="txed-save">сохранить</button>
            <button id="txed-revert">вернуть исходный</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(root);
  listEl = root.querySelector('#txed-list');
  editEl = root.querySelector('#txed-edit');

  root.querySelector('#txed-close').addEventListener('click', closeEditor);
  root.querySelector('#txed-search').addEventListener('input', renderList);
  root.querySelector('#txed-save').addEventListener('click', () => {
    if (!current) return;
    const t = root.querySelector('#txed-ta').value;
    current.set(t);
    if (!edits[current.key]) edits[current.key] = { orig: current._orig };
    edits[current.key].text = t;
    saveEdits();
    renderList();
  });
  root.querySelector('#txed-revert').addEventListener('click', () => {
    if (!current) return;
    const orig = (edits[current.key] && edits[current.key].orig) !== undefined
      ? edits[current.key].orig : current.get();
    current.set(orig);
    delete edits[current.key];
    saveEdits();
    root.querySelector('#txed-ta').value = orig;
    renderList();
  });
  root.querySelector('#txed-export').addEventListener('click', () => {
    const payload = {
      exported: new Date().toISOString(),
      note: 'правки текстов ardet — вносится в исходники оркестрацией',
      edits,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ardet-edits.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    try { navigator.clipboard.writeText(JSON.stringify(payload)); } catch (e) {}
  });

  // категории
  const cats = ['все', 'осмотры', 'таблички', 'записки', 'диалоги', 'надписи', 'шёпоты', 'меню', 'терминал', '✎ правленое'];
  const catsEl = root.querySelector('#txed-cats');
  for (const c of cats) {
    const b = document.createElement('button');
    b.textContent = c;
    b.addEventListener('click', () => {
      catFilter = c === 'все' ? '' : c;
      [...catsEl.children].forEach(x => x.classList.toggle('on', x === b));
      renderList();
    });
    if (c === 'все') b.classList.add('on');
    catsEl.appendChild(b);
  }
}

function renderList() {
  const q = (root.querySelector('#txed-search').value || '').toLowerCase();
  const all = ensureItems();
  let shown = 0;
  listEl.innerHTML = '';
  for (const it of all) {
    if (catFilter === '✎ правленое') { if (!edits[it.key]) continue; }
    else if (catFilter && it.cat !== catFilter) continue;
    if (q && !(`${it.label} ${it.get()}`.toLowerCase().includes(q))) continue;
    if (++shown > 400) break;
    const row = document.createElement('div');
    row.className = 'txed-row' + (edits[it.key] ? ' edited' : '') + (current === it ? ' cur' : '');
    row.innerHTML = `<i>${it.cat}</i> ${it.label.replace(/</g, '&lt;')}`;
    row.addEventListener('click', () => openItem(it));
    listEl.appendChild(row);
  }
  root.querySelector('#txed-count').textContent =
    `записей: ${shown}${Object.keys(edits).length ? ` · правок: ${Object.keys(edits).length}` : ''}`;
}

function openItem(it) {
  current = it;
  it._orig = (edits[it.key] && edits[it.key].orig !== undefined) ? edits[it.key].orig : it.get();
  root.querySelector('#txed-label').textContent = `${it.cat} · ${it.label}`;
  root.querySelector('#txed-ta').value = it.get();
  editEl.classList.add('on');
  renderList();
}

let open = false;
export function toggleEditor() { open ? closeEditor() : openEditor(); }
export function openEditor() {
  build();
  open = true;
  root.classList.add('on');
  state.transition('menu'); // мир на паузе ввода, esc-логика меню
  renderList();
}
export function closeEditor() {
  if (!root) return;
  open = false;
  root.classList.remove('on');
  if (state.is('menu')) state.transition('game');
}

export function initEditor() {
  applyEdits();
  const enabled = /[?#&]editor/.test(location.search + location.hash);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F2') { e.preventDefault(); toggleEditor(); }
    if (e.key === 'Escape' && open) closeEditor();
  });
  if (enabled) {
    const b = document.createElement('button');
    b.id = 'txed-fab';
    b.textContent = '✎';
    b.title = 'правка текстов';
    b.addEventListener('click', toggleEditor);
    if (document.body) document.body.appendChild(b);
  }
}
