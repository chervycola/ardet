// ═══════════════════════════════════════
// ЗАГЛАВНАЯ — оттиск автора во весь экран: красная луна над городком и щит у дороги
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

// оттиск на холсте: поле бумаги срезаем (слово автора: «растяни картинку, не смотря
// на рамку»); по высоте — во весь экран; узкий экран — окно держит щит и луну;
// широкий — края протянуты в стороны и к краю экрана гаснут в ночь
const CROP = { x0: 0.066, x1: 0.934, y0: 0.024, y1: 0.962 };   // доли картины без бумажного поля
const ANCHOR_X = 0.445;                                        // середина окна на узком экране: между щитом и луной
function paint(im) {
  const cv = document.getElementById('entry-canvas'), art = document.getElementById('entry-art');
  if (!cv || !art || !im) return;
  const vw = entry.clientWidth, vh = entry.clientHeight, dpr = Math.min(3, window.devicePixelRatio || 1);
  if (!vw || !vh) return;
  cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.imageSmoothingQuality = 'high';
  const W0 = im.naturalWidth, H0 = im.naturalHeight;
  const sx0 = CROP.x0 * W0, sx1 = CROP.x1 * W0, sy0 = CROP.y0 * H0, sh = (CROP.y1 - CROP.y0) * H0, sw = sx1 - sx0;
  const s = vh / sh, dw = sw * s;
  let dx = (vw - dw) / 2;
  if (dw > vw) dx = Math.min(0, Math.max(vw - dw, vw / 2 - (ANCHOR_X * W0 - sx0) * s));
  g.fillStyle = '#0D0B0A'; g.fillRect(0, 0, vw, vh);
  if (dx > 0) {                                                // бока: край оттиска протянут вдаль
    g.save();
    if ('filter' in g) g.filter = 'blur(3px)';
    const inset = 0.012 * W0;                                  // столбец — чуть внутрь оттиска: мимо царапин кромки
    g.drawImage(im, sx0 + inset, sy0, 2, sh, -4, 0, dx + 8, vh);
    g.drawImage(im, sx1 - inset - 2, sy0, 2, sh, dx + dw - 4, 0, vw - dx - dw + 8, vh);
    g.restore();
    const fade = (x0, x1, a0, a1) => { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, `rgba(13,11,10,${a0})`); gr.addColorStop(1, `rgba(13,11,10,${a1})`); g.fillStyle = gr; g.fillRect(Math.min(x0, x1), 0, Math.abs(x1 - x0), vh); };
    fade(0, dx, 0.8, 0); fade(dx + dw, vw, 0, 0.8);
    for (const [x0, w] of [[0, dx], [dx + dw, vw - dx - dw]]) {   // верх и низ протяжки — в ночь
      const gv = g.createLinearGradient(0, 0, 0, vh);
      gv.addColorStop(0, 'rgba(13,11,10,1)'); gv.addColorStop(0.1, 'rgba(13,11,10,0)'); gv.addColorStop(0.88, 'rgba(13,11,10,0)'); gv.addColorStop(1, 'rgba(13,11,10,1)');
      g.fillStyle = gv; g.fillRect(x0, 0, w, vh);
    }
  }
  g.drawImage(im, sx0, sy0, sw, sh, dx, 0, dw, vh);
  // рамка полной картины — щит и кнопка стоят на своих местах
  Object.assign(art.style, { left: `${dx - sx0 * s}px`, top: `${-sy0 * s}px`, width: `${W0 * s}px`, height: `${H0 * s}px` });
}

export function initTitle({ onGo }) {
  entry = document.getElementById('entry');
  const btn = document.getElementById('entry-btn');
  if (!entry || !btn) return;
  fillAfisha(document.getElementById('entry-afisha'));

  loadAsset(SCENES.entry).then(im => {
    if (!im) { entry.classList.add('noart'); return; }
    entry.classList.add('art');
    paint(im);
    let raf = 0;
    const again = () => { if (raf || !shown()) return; raf = requestAnimationFrame(() => { raf = 0; paint(im); }); };
    window.addEventListener('resize', again);
    window.addEventListener('orientationchange', again);
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
