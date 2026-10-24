// ═══════════════════════════════════════
// ЗАГЛАВНАЯ — оттиск автора на ночи: красная луна над городком и щит у дороги
// (assets/scenes/entry.webp, слот SCENES.entry); на щите — афиша выступлений
// (content/afisha.js), пока пусто — «COMING SOON»; кнопка «FALL IN» среди птиц.
// Бланк «форма 0» снят
// (слово автора 24.10): настройки быта, «вспомнить дорогу», «покинуть вечер» и
// графа подписи пока лишние — их код остался (core/prefs.js, ui/signature.js,
// ui/worldmap.js), вернуть легко. Картину находит загрузчик (на сайте — рядом со
// страницей, в локальной сборке — в корне репозитория). Кнопка — как была до
// бланка: рамка, пиксельный шрифт, FALL IN. Вход: щелчок, тап, Enter / пробел / E.
// ═══════════════════════════════════════
import { loadAsset } from '../assets/loader.js';
import { SCENES } from '../assets/manifest.js';
import { SHOWS } from '../content/afisha.js';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// щит: даты выступлений; нет их — «скоро»
function fillAfisha(el) {
  if (!el) return;
  const shows = (SHOWS || []).filter(s => s && (s.date || s.place));
  el.classList.toggle('list', shows.length > 0);
  el.innerHTML = shows.length
    ? shows.map(s => `<div>${esc(s.date || '')}${s.date && s.place ? ' · ' : ''}${esc(s.place || '')}</div>`).join('')
    : '<span class="af-soon">COMING SOON</span>';
}

let entry = null, busy = false;
const shown = () => entry && entry.style.display !== 'none';

export function initTitle({ onGo }) {
  entry = document.getElementById('entry');
  const btn = document.getElementById('entry-btn'), img = document.getElementById('entry-img');
  if (!entry || !btn) return;
  fillAfisha(document.getElementById('entry-afisha'));

  loadAsset(SCENES.entry).then(im => {
    if (!im) { entry.classList.add('noart'); return; }
    if (img) img.src = im.src;
    entry.classList.add('art');
  });

  const go = () => {
    if (busy || !shown()) return;
    busy = true;
    if (onGo) onGo();
  };
  btn.addEventListener('click', go);
  // в некоторых webview тап не рождает click — вход ловим и по pointerup, но только тапом:
  // палец почти не сдвинулся и поднят над кнопкой; соскользнувший палец в дорогу не уводит
  let down = null;
  btn.addEventListener('pointerdown', e => { down = e.pointerType !== 'mouse' ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null; });
  btn.addEventListener('pointercancel', () => { down = null; });
  btn.addEventListener('pointerup', e => {
    const d = down; down = null;
    if (!d || e.pointerId !== d.id || Math.hypot(e.clientX - d.x, e.clientY - d.y) >= 10) return;
    const r = btn.getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) go();
  });

  // клавиши: Enter / пробел / E — войти (зажатая — один раз)
  document.addEventListener('keydown', e => {
    if (e.defaultPrevented || !shown()) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tg = e.target;
    if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable)) return;
    const k = e.key.toLowerCase();
    if (k !== 'enter' && k !== ' ' && k !== 'e' && k !== 'у') return;
    e.preventDefault();
    if (!e.repeat) go();
  });
}
