// ═══════════════════════════════════════
// РЕЖИМ СТРИМА — ?stream в адресе. Ничего не подсказывает: в углу счёт
// канцелярии (сколько вещей мира осмотрено из скольких), номер дела и
// время в пути; панели осмотра, диалога и терминала крупнее — их читают
// с экрана. Забег чистый: сохранение не читается и не пишется.
// ═══════════════════════════════════════
export const STREAM = typeof location !== 'undefined' && /[?&]stream\b/.test(location.search);

// что идёт в опись: всё, к чему можно подойти и что-то увидеть
export function countable(locations) {
  return locations.filter(l => l.look || l.useAction || l.npc || l.archDraw || l.streetForm);
}

// номер дела: пятый наблюдатель, дата и минута начала прогона
export function caseNumber(d = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `5/${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

export function tallyLine(found, total) {
  return `ОПИСЬ НАЙДЕННОГО: ${found} ИЗ ${total}. ОСТАТОК УЧТЁН.`;
}

export function initStream({ locations, getVisited, getFrames }) {
  if (!STREAM || typeof document === 'undefined') return;
  document.body.classList.add('stream');
  const css = document.createElement('style');
  css.textContent = `
    body.stream #look, body.stream #dlg { zoom: 1.3; }
    body.stream #to div { font-size: 11px !important; }
    #stream-tally { position: fixed; left: 12px; bottom: 12px; z-index: 50; pointer-events: none;
      font-family: "Press Start 2P", monospace; font-size: 10px; line-height: 1.8;
      color: #D9CFB8; background: rgba(13, 11, 10, 0.78); padding: 8px 10px; border-left: 2px solid #8A8D8F; }
    #stream-tally .k { color: #8A8D8F; }`;
  document.head.appendChild(css);
  const el = document.createElement('div');
  el.id = 'stream-tally';
  document.body.appendChild(el);
  const all = countable(locations);
  const ids = new Set(all.map(l => l.id));
  const no = caseNumber();
  const tick = () => {
    const found = [...getVisited()].filter(id => ids.has(id)).length;
    const s = Math.floor(getFrames() / 60), mm = Math.floor(s / 60), ss = String(s % 60).padStart(2, '0');
    el.innerHTML = `<span class="k">ДЕЛО № ${no} · В ПУТИ ${mm}:${ss}</span><br>${tallyLine(found, all.length)}`;
  };
  tick();
  setInterval(tick, 1000);
}
