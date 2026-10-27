// ═══════════════════════════════════════
// ЗАГЛАВНАЯ — картина автора во весь экран (16:9, оттиск расширен по бокам): красная луна
// над городком, щит у дороги, слева дымит трубами завод (assets/scenes/entry-wide.webp, слот
// SCENES.entry; трубы видны только на широком экране); на щите —
// афиша выступлений (content/afisha.js), пока пусто — «COMING SOON»; кнопка «FALL IN»
// среди птиц; по бокам картина сыплется цифрой (ui/titleglitch.js).
// Бланк «форма 0» снят
// (слово автора 24.10): настройки быта, «вспомнить дорогу», «покинуть вечер» и
// графа подписи пока лишние — их код остался (core/prefs.js, ui/signature.js,
// ui/worldmap.js), вернуть легко. Картину находит загрузчик (на сайте — рядом со
// страницей, в локальной сборке — в корне репозитория). Кнопка — как была до
// бланка: рамка, пиксельный шрифт, FALL IN. Вход: щелчок, тап, Enter / пробел / E.
// ═══════════════════════════════════════
import { loadAsset, whyMissing } from '../assets/loader.js';
import { SCENES } from '../assets/manifest.js';
import { SHOWS } from '../content/afisha.js';
import { bake, run } from './titleglitch.js';

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

// оттиск на холсте: картина 16:9 без поля (расширена по бокам с прежнего оттиска автора);
// по высоте — во весь экран; уже экрана — середина по картине, но полоса от щита до
// луны (KEY) всегда целиком; узкий экран — полоса KEY во всю ширину, картина ниже
// экрана, сверху и снизу ночь; шире картины — края протянуты в стороны и гаснут в ночь.
// По бокам — сбой цифрой (ui/titleglitch.js); щит и кнопка чисты
const KEY = [0.322, 0.628];                                    // от левой кромки щита до правой кромки луны
function paint(im) {
  const cv = document.getElementById('entry-canvas'), art = document.getElementById('entry-art');
  if (!cv || !art || !im) return;
  const vw = entry.clientWidth, vh = entry.clientHeight, dpr = Math.min(3, window.devicePixelRatio || 1);
  if (!vw || !vh) return;
  cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.imageSmoothingQuality = 'high';
  const W0 = im.naturalWidth, H0 = im.naturalHeight, kw = (KEY[1] - KEY[0]) * W0;
  let s = vh / H0;
  if (kw * s > vw * 0.96) s = vw * 0.96 / kw;                  // узкий: щит и луна во всю ширину
  const dw = W0 * s, dh = H0 * s, dy = Math.max(0, (vh - dh) / 2);
  let dx = (vw - dw) / 2;
  if (dw > vw) dx = Math.min(0, vw - KEY[1] * dw, Math.max(vw - dw, -KEY[0] * dw, vw / 2 - dw / 2));
  g.fillStyle = '#0D0B0A'; g.fillRect(0, 0, vw, vh);
  const fade = (x0, y0, x1, y1, w, h, a0, a1) => { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, `rgba(13,11,10,${a0})`); gr.addColorStop(1, `rgba(13,11,10,${a1})`); g.fillStyle = gr; g.fillRect(Math.min(x0, x1), Math.min(y0, y1), w, h); };
  if (dx > 0) {                                                // бока: край оттиска протянут вдаль
    g.save();
    if ('filter' in g) g.filter = 'blur(3px)';
    const inset = 0.012 * W0;                                  // столбец — чуть внутрь оттиска: мимо царапин кромки
    g.drawImage(im, inset, 0, 2, H0, -4, dy, dx + 8, dh);
    g.drawImage(im, W0 - inset - 2, 0, 2, H0, dx + dw - 4, dy, vw - dx - dw + 8, dh);
    g.restore();
    fade(0, 0, dx, 0, dx, vh, 0.8, 0); fade(dx + dw, 0, vw, 0, vw - dx - dw, vh, 0, 0.8);
  }
  if (dy > 0) {                                                // сверху и снизу: небо и земля протянуты и гаснут в ночь
    g.save();
    if ('filter' in g) g.filter = 'blur(3px)';
    const inset = 0.012 * H0;
    g.drawImage(im, 0, inset, W0, 2, dx, -4, dw, dy + 8);
    g.drawImage(im, 0, H0 - inset - 2, W0, 2, dx, dy + dh - 4, dw, vh - dy - dh + 8);
    g.restore();
    fade(0, 0, 0, dy, vw, dy, 1, 0); fade(0, dy + dh, 0, vh, vw, vh - dy - dh, 0, 1);
  }
  g.drawImage(im, 0, 0, W0, H0, dx, dy, dw, dh);
  // рамка картины — щит и кнопка стоят на своих местах
  Object.assign(art.style, { left: `${dx}px`, top: `${dy}px`, width: `${dw}px`, height: `${dh}px` });
  // сбой по бокам: щит-афиша и кнопка — неприкосновенны
  const keep = ['entry-afisha', 'entry-btn'].map(id => document.getElementById(id)).filter(Boolean).map(el => {
    const r = el.getBoundingClientRect(), p = 6;
    return { x0: r.left - p, y0: r.top - p, x1: r.right + p, y1: r.bottom + p };
  }).filter(r => r.x1 - r.x0 > 2 * 6);
  const L = { vw, vh, dpr, dx, dy, dw, dh, keep, seed: 7 };
  bake(g, cv, L);
  const over = document.getElementById('entry-glitch');
  if (over) run(cv, over, L, shown);
}

export function initTitle({ onGo }) {
  entry = document.getElementById('entry');
  const btn = document.getElementById('entry-btn');
  if (!entry || !btn) return;
  fillAfisha(document.getElementById('entry-afisha'));

  loadAsset(SCENES.entry).then(im => {
    if (!im) {
      entry.classList.add('noart');
      // картины нет: в угол к оттиску — какой адрес спрошен и что ответил сервер
      whyMissing(SCENES.entry).then(list => {
        const say = list.map(o => `${o.url} → ${o.status}${o.type ? ' ' + o.type : ''}`);
        console.warn('[картины] заглавная не загрузилась:', SCENES.entry, '\n' + say.join('\n'));
        const bs = document.getElementById('build-stamp'), first = list[0];
        if (bs && first) bs.textContent += ` · нет картины: ${SCENES.entry} → ${first.status}${first.type ? ' ' + first.type.split(';')[0] : ''}`;
      }).catch(() => {});
      return;
    }
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
