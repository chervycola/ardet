// ═══════════════════════════════════════
// ПОДПИСЬ СТРАННИКА — «недостающее вписать»: единственное в мире штампов, что
// сделано твоей рукой. Росчерк пальцем или мышью; хранится в этом браузере и
// никуда не уходит (сеть его не видит). Графа подписи стояла в бланке «форма 0»;
// бланк снят с заглавной (24.10) — поле росчерка (initSignPad) ждёт нового места,
// а уже поставленная подпись по-прежнему ложится на бумаги. Дальше рука
// появляется там, где канцелярия пишет «рука знакомая»: подпись свидетеля
// в протоколе беседы, книга выдачи гардероба, второй почерк в протоколе
// замера, опись найденного, «обмер произвёл» на плане. Не расписался —
// на полях: «свидетель от подписи уклонился» (канон §06).
// Нить П1 (weave/MOTIFS.md): опись мира ведёт сам странник.
// ═══════════════════════════════════════
const KEY = 'ardet-sign';
export const SIGN_W = 240, SIGN_H = 56;        // поле подписи, в его точках хранится росчерк

let strokes = [];                              // [[x, y, x, y, …], …] — точки в поле SIGN_W×SIGN_H
try {
  const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
  const p = raw && JSON.parse(raw);
  if (Array.isArray(p)) strokes = p.filter(s => Array.isArray(s) && s.length >= 4 && s.every(Number.isFinite));
} catch (e) {}

const listeners = [];
export function onSignature(fn) { listeners.push(fn); }
export function hasSignature() { return strokes.length > 0; }
export function getStrokes() { return strokes; }
export function setStrokes(list) {
  strokes = (list || []).filter(s => s.length >= 4).map(s => s.map(v => Math.round(v * 10) / 10));
  try { if (strokes.length) localStorage.setItem(KEY, JSON.stringify(strokes)); else localStorage.removeItem(KEY); } catch (e) {}
  for (const fn of listeners) { try { fn(); } catch (e) {} }
}

// рамка росчерка: чтобы подпись ложилась в любую графу, не таща за собой пустое поле
function bounds(list = strokes) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const s of list) for (let i = 0; i < s.length; i += 2) {
    x0 = Math.min(x0, s[i]); x1 = Math.max(x1, s[i]); y0 = Math.min(y0, s[i + 1]); y1 = Math.max(y1, s[i + 1]);
  }
  return x0 === Infinity ? null : { x0, y0, x1, y1, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
}

// подпись как SVG — для бумаги в разметке (протокол, осмотр, опись);
// плоский росчерк (почти прямая) упирается в maxW, а не растягивается во всю бумагу
export function signatureSVG(h = 26, color = '#241d18', width = 1.6, maxW = 160) {
  const b = bounds();
  if (!b) return '';
  const pad = 3, k = Math.min((h - pad * 2) / b.h, (maxW - pad * 2) / b.w);
  const w = Math.max(h, b.w * k + pad * 2), oy = (h - b.h * k) / 2;
  const d = strokes.map(s => {
    let p = '';
    for (let i = 0; i < s.length; i += 2) p += (i ? 'L' : 'M') + ((s[i] - b.x0) * k + pad).toFixed(1) + ' ' + ((s[i + 1] - b.y0) * k + oy).toFixed(1);
    return p;
  }).join('');
  return `<svg class="sign" viewBox="0 0 ${w.toFixed(1)} ${h}" width="${w.toFixed(0)}" height="${h}" aria-label="подпись странника">`
    + `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round"/></svg>`;
}

// подпись на холсте (план местности): в рамку w×h, по левому краю
export function drawSignature(ctx, x, y, w, h, color = '#241d18', width = 1.2) {
  const b = bounds();
  if (!b) return false;
  const k = Math.min(w / b.w, h / b.h);
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round';
  ctx.beginPath();
  for (const s of strokes) for (let i = 0; i < s.length; i += 2) {
    const px = x + (s[i] - b.x0) * k, py = y + (s[i + 1] - b.y0) * k + (h - b.h * k) / 2;
    if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
  return true;
}

// поле росчерка на бланке: рисуют углём; начал заново — прежняя подпись уступает
// место новой, но только когда новый штрих лёг: тычок, правый клик, сорванный
// жест подпись не трогают. Пишет один палец: кто первым лёг на поле, тот и ведёт
// штрих; второй палец и ладонь посреди штриха — мимо (палец, что держит телефон
// за краем поля, — не помеха).
export function initSignPad(canvas, onChange) {
  if (!canvas || !canvas.getContext) return;
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  canvas.width = SIGN_W * dpr; canvas.height = SIGN_H * dpr;
  const g = canvas.getContext('2d');
  const paint = (list, live) => {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, SIGN_W, SIGN_H);
    g.lineJoin = 'round'; g.lineCap = 'round';
    for (const [col, lw] of [['rgba(36,29,24,0.28)', 3.6], ['#241d18', 1.7]]) {   // уголь: размазанный край и линия
      g.strokeStyle = col; g.lineWidth = lw;
      g.beginPath();
      for (const s of list) for (let i = 0; i < s.length; i += 2) { if (i) g.lineTo(s[i], s[i + 1]); else g.moveTo(s[i], s[i + 1]); }
      if (live && live.length >= 2) for (let i = 0; i < live.length; i += 2) { if (i) g.lineTo(live[i], live[i + 1]); else g.moveTo(live[i], live[i + 1]); }
      g.stroke();
    }
  };
  let cur = null, id = null, list = strokes.slice(), fresh = true;
  const at = e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * SIGN_W / r.width, (e.clientY - r.top) * SIGN_H / r.height]; };
  canvas.addEventListener('pointerdown', e => {
    if (cur || e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    id = e.pointerId;
    canvas.setPointerCapture && canvas.setPointerCapture(id);
    cur = at(e); paint(fresh ? [] : list, cur);
  });
  canvas.addEventListener('pointermove', e => {
    if (!cur || e.pointerId !== id) return;
    const [x, y] = at(e), lx = cur[cur.length - 2], ly = cur[cur.length - 1];
    if (Math.hypot(x - lx, y - ly) < 1.5) return;
    cur.push(x, y); paint(fresh ? [] : list, cur);
  });
  const stop = keep => e => {
    if (!cur || e.pointerId !== id) return;
    const s = cur; cur = null; id = null;
    if (!keep || s.length < 4) { paint(list); return; }      // штриха не было — подпись цела
    if (fresh) { list = []; fresh = false; }
    list.push(s); paint(list);
    setStrokes(list);
    if (onChange) onChange();
  };
  canvas.addEventListener('pointerup', stop(true));
  canvas.addEventListener('pointercancel', stop(false));
  canvas.addEventListener('lostpointercapture', stop(false));
  canvas.addEventListener('click', e => e.stopPropagation());
  // зачеркнуть: подпись снята — снова «уклонился»
  const clear = () => { cur = null; id = null; list = []; fresh = true; paint(list); setStrokes([]); if (onChange) onChange(); };
  paint(list);
  return { clear, repaint: () => { list = strokes.slice(); fresh = true; paint(list); } };
}
