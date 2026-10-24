// ═══════════════════════════════════════
// ФОРМА 0 · заявление о начале странствия — главное меню-бланк поверх ночи
// (ART_BIBLE §06). Пункт отмечают углём: галочка дорисовывается — и только
// тогда исполняется. «вспомнить дорогу» — план местности (что уже пройдено);
// «настройки быта» — звук мира, движение, кадр (core/prefs.js); «покинуть
// вечер» — штамп «погашено», бланк гаснет, передумать можно щелчком.
// Печать канцелярии ставит входящий номер: который это вечер у заявителя.
// ═══════════════════════════════════════
import { BYT, getPref, setPref, reducedMotion } from '../core/prefs.js';
import { events } from '../core/events.js';
import { initSignPad, hasSignature } from './signature.js';

const CHECK = '<svg viewBox="0 0 26 26" aria-hidden="true">'
  + '<path class="smudge" d="M4.2 14.4 L10.2 20.2 L23.2 3.4"/>'
  + '<path class="line" d="M3.4 13.1 L10.5 19.7 L22.7 2.3"/></svg>';
const LEAVE = 'Заявление отозвано заявителем. Вечер покинут; огонь оставлен гореть. '
  + 'Вкладку закрывает заявитель лично.<br><small>передумать — щелчком по бланку</small>';
const ROW = { sound: 'звук мира', motion: 'движение', frame: 'кадр' };
const MARK_MS = 340;                     // столько дорисовывается галочка

let entry = null, form = null, byt = null, voidEl = null, busy = false;

// входящий номер: который вечер (каждая загрузка страницы — новый вечер)
let visit = 0;
export function visitNo() {
  if (visit) return visit;
  let n = 0;
  try { n = (parseInt(localStorage.getItem('ardet-visits'), 10) || 0) + 1; localStorage.setItem('ardet-visits', String(n)); } catch (e) { n = 1; }
  return (visit = n);
}

const shown = () => entry && entry.style.display !== 'none';
const later = fn => (reducedMotion() ? fn() : setTimeout(fn, MARK_MS));
function mark(btn, on = true) { if (btn) { btn.classList.toggle('on', on); if (btn.classList.contains('f0-opt')) btn.setAttribute('aria-pressed', String(on)); } }

function buildByt() {
  byt.innerHTML = Object.keys(BYT).map(k =>
    `<div class="f0-row"><h4>${ROW[k]}</h4><div class="f0-opts">`
    + BYT[k].map(v => `<button type="button" class="f0-opt${getPref(k) === v ? ' on' : ''}" aria-pressed="${getPref(k) === v}" data-k="${k}" data-v="${v}"><span class="f0-box">${CHECK}</span><span class="f0-t">${v}</span></button>`).join('')
    + '</div></div>').join('')
    + `<button type="button" class="f0-opt f0-done" data-done="1"><span class="f0-box">${CHECK}</span><span class="f0-t">приложить к заявлению</span></button>`;
  for (const b of byt.querySelectorAll('.f0-opt')) b.addEventListener('click', () => {
    if (b.dataset.done) { mark(b); later(() => closeByt(true)); return; }
    setPref(b.dataset.k, b.dataset.v);
    for (const o of byt.querySelectorAll(`.f0-opt[data-k="${b.dataset.k}"]`)) mark(o, o === b);
  });
}
function openByt(btn) { buildByt(); byt.hidden = false; mark(btn); const f = byt.querySelector('.f0-opt.on') || byt.querySelector('.f0-opt'); if (f) f.focus({ preventScroll: true }); }
function closeByt(refocus) {
  byt.hidden = true; byt.innerHTML = '';
  const b = form.querySelector('.f0-item[data-act="byt"]'); mark(b, false);
  if (refocus && b) b.focus({ preventScroll: true });
}

function leave(btn) {
  mark(btn);
  later(() => {
    entry.classList.add('left'); voidEl.innerHTML = LEAVE;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    setTimeout(() => entry.addEventListener('click', function back() {
      entry.classList.remove('left'); voidEl.innerHTML = ''; mark(btn, false);
      entry.removeEventListener('click', back);
    }), 300);
  });
}

export function initTitleForm({ onGo, onRoad }) {
  entry = document.getElementById('entry'); form = document.getElementById('form0');
  if (!entry || !form) return;
  byt = document.getElementById('f0-byt'); voidEl = document.getElementById('f0-void');
  for (const b of form.querySelectorAll('.f0-item .f0-box')) b.innerHTML = CHECK;
  const seal = document.getElementById('f0-seal-text');
  if (seal) seal.textContent = 'вх. № ' + visitNo();
  // недостающее вписать: подпись заявителя (ui/signature.js)
  const x = document.getElementById('f0-sign-x');
  const showX = () => { if (x) x.hidden = !hasSignature(); };
  const pad = initSignPad(document.getElementById('f0-sign-pad'), showX);
  if (x && pad) x.addEventListener('click', e => { e.stopPropagation(); pad.clear(); });
  showX();

  const act = btn => {
    if (busy || entry.classList.contains('left')) return;
    const a = btn.dataset.act;
    if (a === 'go') { busy = true; mark(btn); later(() => { busy = false; onGo && onGo(); }); }
    else if (a === 'road') {
      mark(btn);
      later(() => { events.once('map.closed', () => { mark(btn, false); btn.focus({ preventScroll: true }); }); if (onRoad) onRoad(); });
    }
    else if (a === 'byt') { if (byt.hidden) openByt(btn); else closeByt(true); }
    else if (a === 'leave') leave(btn);
  };
  for (const btn of form.querySelectorAll('.f0-item')) btn.addEventListener('click', () => act(btn));
  // в некоторых webview тап не рождает click — вход ловим и по pointerdown
  const go = form.querySelector('.f0-item[data-act="go"]');
  if (go) go.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') act(go); });

  // клавиши: вверх-вниз по графам, влево-вправо в строке настроек, Enter / пробел / E — отметить
  document.addEventListener('keydown', e => {
    if (e.defaultPrevented) return;                          // клавишу уже взяла карта (закрылась Enter/пробелом)
    if (!shown() || document.getElementById('map')?.classList.contains('on')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tg = e.target;
    if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable)) return;
    if (document.getElementById('txed')?.classList.contains('on')) return;
    if (entry.classList.contains('left')) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); entry.click(); } return; }
    const k = e.key.toLowerCase();
    const all = [...form.querySelectorAll('.f0-item, .f0-byt:not([hidden]) .f0-opt')];
    const i = all.indexOf(document.activeElement);
    const step = { arrowdown: 1, s: 1, 'ы': 1, arrowup: -1, w: -1, 'ц': -1, arrowright: 1, d: 1, 'в': 1, arrowleft: -1, a: -1, 'ф': -1 }[k];
    if (step) { e.preventDefault(); (all[(i + step + all.length) % all.length] || all[0]).focus({ preventScroll: true }); return; }
    if (k === 'enter' || k === ' ' || k === 'e' || k === 'у') {
      e.preventDefault();
      (i >= 0 ? all[i] : go).click();
    }
    if (k === 'escape' && !byt.hidden) closeByt(true);
  });
  if (go && matchMedia && matchMedia('(pointer: fine)').matches) go.focus({ preventScroll: true });
}
