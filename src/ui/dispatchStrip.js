// ═══════════════════════════════════════
// СТРОКА КАНАЛА внизу кадра (world/dispatch.js): три последние реплики, старые бледнее.
// Терминал — зелёным, печатается (цифра); странник и машинист — костью, твёрдо (живые держат
// строку сами); ремарка — курсивом, без метки. Щелчок по строке или Enter — допечатать,
// дальше. Читающему без глаз — каждая реплика в зеркало (world/idle.js announce).
// ═══════════════════════════════════════
import { dispatch, typedOf } from '../world/dispatch.js';
import { WHO } from '../content/dispatch_scenes.js';

let el = null, hist = [], tail = 0, lastTyped = -1;
export function initDispatchStrip(onSkip) {
  if (el || typeof document === 'undefined' || !document.body) return;
  el = document.createElement('div');
  el.id = 'dispatch';
  if (el.setAttribute) el.setAttribute('aria-hidden', 'true');   // голос — через зеркало
  if (el.addEventListener) el.addEventListener('pointerdown', e => { if (e.stopPropagation) e.stopPropagation(); onSkip(); });
  document.body.appendChild(el);
}
// событие из stepDispatch / skipLine
export function dispatchEvent(ev, announce) {
  if (!ev) return;
  if (ev.start) { hist = []; tail = 0; }
  if (ev.line) { hist.push(ev.line); if (hist.length > 3) hist.shift(); lastTyped = -1; if (announce) announce((WHO[ev.line[0]] ? WHO[ev.line[0]] + ': ' : '') + ev.line[1].replace(/\n/g, ' ')); }
  if (ev.end) tail = 200;                                        // досказано — строка ещё постоит
  if (ev.abort) { hist = []; tail = 0; }
  render(true);
}
// каждый кадр: допечатывание терминала, хвост после конца сцены
export function stepDispatchStrip() {
  if (!el) return;
  if (!dispatch.playing && tail > 0 && --tail === 0) { hist = []; render(true); return; }
  const n = typedOf(dispatch.playing);
  if (n !== lastTyped) { lastTyped = n; render(false); }
}
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function render() {
  if (!el) return;
  if (!hist.length) { el.className = ''; el.innerHTML = ''; return; }
  const p = dispatch.playing, cur = hist.length - 1;
  el.className = 'on';
  el.innerHTML = hist.map(([who, text], i) => {
    let tx = text;
    const typing = p && i === cur && who === 't' && typedOf(p) < text.length;
    if (p && i === cur && who === 't') tx = text.slice(0, typedOf(p));
    const label = WHO[who] ? `<span class="who">${WHO[who]}</span>` : '<span class="who"></span>';
    return `<div class="ln ${who}${i < cur ? ' old' : ''}">${label}<span class="tx${typing ? ' typing' : ''}">${esc(tx)}</span></div>`;
  }).join('');
}
export const _stripHist = () => hist.slice();
