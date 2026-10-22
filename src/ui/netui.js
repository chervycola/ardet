// ═══════════════════════════════════════
// СЕТЬ — ВВОД (net/net.js). Под радио две кнопки — «записка» и «сказать», —
// и бумажная полоса для текста. Пока пишешь, мир ждёт (состояние typing): шаги
// не идут, клавиши — в строку. Enter — оставить / сказать, Esc — передумать.
// Кнопки видны, только когда сеть есть. Ответ мира — бумажкой (paper).
// ═══════════════════════════════════════
import { state } from '../core/state.js';
import { net, netSay, netLeaveNote } from '../net/net.js';
import { SAY_MAX, NOTE_MAX } from '../net/filter.js';

let wrap = null, box = null, field = null, title = null, count = null, okBtn = null, mode = null, paper = () => {};
const NOTE_ERR = {
  soon: 'Записку — не чаще раза в минуту.',
  quota: 'На сегодня записок довольно: канцелярия примет завтра.',
  dirty: 'Канцелярия такое не принимает.',
  refused: 'Канцелярия не приняла записку.',
  net: 'Записка не дошла: нет связи.',
  under: 'Под землёй записки не держатся: оставь наверху.',
};
const SAY_ERR = { soon: 'Прежние слова ещё пишутся.' };

function build() {
  if (wrap || typeof document === 'undefined' || !document.body) return;
  const css = document.createElement('style');
  css.textContent = `
  #ardetNetWrap{position:fixed;top:48px;right:12px;z-index:30;display:none;gap:6px}
  #ardetNetWrap button,#ardetNetBox button{background:rgba(238,227,203,0.55);color:#3A3026;border:none;
    padding:7px 11px 8px;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.3);
    backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);
    font:500 9px Montserrat,sans-serif;letter-spacing:3px;text-transform:uppercase}
  #ardetNetWrap button:active,#ardetNetBox button:active{background:rgba(238,227,203,0.78)}
  #ardetNetWrap b{color:#C23B2B;font-weight:500}
  #ardetNetBox{position:fixed;left:50%;bottom:16%;transform:translateX(-50%);z-index:40;display:none;
    width:min(520px,90vw);background:rgba(238,227,203,0.92);color:#3A3026;padding:12px 14px 10px;
    box-shadow:0 8px 26px rgba(0,0,0,.45)}
  #ardetNetBox h4{margin:0 0 8px;font:500 8px Montserrat,sans-serif;letter-spacing:3px;color:#C23B2B;text-transform:uppercase}
  #ardetNetBox textarea{width:100%;box-sizing:border-box;resize:none;border:none;border-bottom:1px solid rgba(58,48,38,.3);
    background:transparent;color:#2a2620;font:20px VT323,monospace;line-height:1.1;outline:none}
  #ardetNetBox .row{display:flex;gap:6px;justify-content:flex-end;align-items:center;margin-top:8px}
  #ardetNetBox .n{margin-right:auto;font:12px VT323,monospace;opacity:.6}
  #ardetNetBox button{box-shadow:none;background:rgba(58,48,38,.12)}
  .m #ardetNetWrap{top:calc(62px + env(safe-area-inset-top))}
  .m #ardetNetBox{bottom:auto;top:9%}`;   /* телефон: ниже кнопки карты; строка — над клавиатурой */
  document.head.appendChild(css);
  wrap = document.createElement('div'); wrap.id = 'ardetNetWrap';
  const noteBtn = document.createElement('button'); noteBtn.id = 'ardetNoteBtn'; noteBtn.innerHTML = '<b>✎</b> записка';
  const sayBtn = document.createElement('button'); sayBtn.id = 'ardetSayBtn'; sayBtn.innerHTML = '<b>❝</b> сказать'; sayBtn.title = 'Enter';
  noteBtn.addEventListener('click', e => { e.stopPropagation(); open('note'); });
  sayBtn.addEventListener('click', e => { e.stopPropagation(); open('say'); });
  wrap.appendChild(noteBtn); wrap.appendChild(sayBtn);
  box = document.createElement('div'); box.id = 'ardetNetBox';
  box.innerHTML = '<h4></h4><textarea rows="2" spellcheck="false" autocomplete="off"></textarea><div class="row"><span class="n"></span><button data-a="cancel">отмена</button><button data-a="ok"></button></div>';
  title = box.querySelector('h4'); field = box.querySelector('textarea'); count = box.querySelector('.n'); okBtn = box.querySelector('[data-a="ok"]');
  box.addEventListener('click', e => e.stopPropagation());
  box.querySelector('[data-a="cancel"]').addEventListener('click', close);
  okBtn.addEventListener('click', submit);
  field.addEventListener('input', () => { count.textContent = `${Array.from(field.value).length} / ${mode === 'note' ? NOTE_MAX : SAY_MAX}`; });
  field.addEventListener('keydown', e => {
    e.stopPropagation();                            // клавиши — в строку, не в мир
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  });
  document.body.appendChild(wrap); document.body.appendChild(box);
}
export function initNetUI(onPaper) {
  if (onPaper) paper = onPaper;
  if (typeof document === 'undefined') return;
  if (document.readyState !== 'loading') build(); else document.addEventListener('DOMContentLoaded', build);
}
// кнопки — когда сеть есть
export function refreshNetUI() { if (wrap) wrap.style.display = net.on ? 'flex' : 'none'; }
export const isTyping = () => !!mode;
export function open(m) {
  if (!net.on || !box || mode || !state.is('game')) return false;
  if (!state.transition('typing')) return false;
  mode = m;
  title.textContent = m === 'note' ? 'записка — останется здесь, её найдут' : 'сказать — услышат те, кто рядом';
  okBtn.textContent = m === 'note' ? 'оставить' : 'сказать';
  field.value = ''; field.maxLength = m === 'note' ? NOTE_MAX : SAY_MAX;
  count.textContent = `0 / ${field.maxLength}`;
  box.style.display = 'block';
  setTimeout(() => field.focus(), 0);
  return true;
}
export function close() {
  if (!mode) return;
  mode = null; box.style.display = 'none'; field.blur();
  state.transition('game');
}
// записка и встречный — в меню, как места (ui/ui.js); действия разбирает main.js
const DAY = 86400e3;
export function noteMenu(n) {
  const d = Math.floor((Date.now() - (n.created || Date.now())) / DAY);
  const paperAge = d < 1 ? 'Бумага свежая.' : d < 10 ? 'Бумага чуть пожелтела.' : 'Бумага жёлтая, сгибы в пыли.';
  return {
    id: n.mine ? 'net_note_mine' : 'net_note', net: n.id, name: 'Записка',
    x: n.x - 3, y: n.y - 2, w: 6, h: 4,
    look: `Записка, сложенная вчетверо. ${paperAge} Почерк ${n.mine ? 'свой' : 'чужой'}:\n\n«${n.text}»`
      + (n.certs > 0 ? `\n\nЗаверено: ${n.certs}.` : ''),
    useAction: 'net_cert', useLabel: '<i>✓</i>ЗАВЕРИТЬ',
    useShown: () => !n.mine && !n.certed,
    altNow: () => (n.mine || n.reported ? null : { key: 'net_report', label: '<i>✕</i>ПОЖАЛОВАТЬСЯ' }),
  };
}
export function otherMenu(o) {
  return {
    id: 'net_other', net: o.tab, name: 'Странник',
    x: o.x - 6, y: o.y - 23, w: 12, h: 23,
    look: 'Другой странник. Капюшон и тьма, как у тебя; огонёк у сердца — свой. Что скажет — слышно, только если стоять рядом.',
    useAction: 'net_mute', useLabel: net.muted.has(o.tab) ? '<i>◉</i>СЛУШАТЬ' : '<i>◌</i>НЕ СЛУШАТЬ',
  };
}
export const VOTE_ERR = {
  mine: 'Своё не заверяют.',
  twice: 'Эта записка тобой уже заверена.',
  gone: 'Записки уже нет.',
  refused: 'Канцелярия не приняла.',
  net: 'Не дошло: нет связи.',
};

async function submit() {
  const m = mode, text = field.value;
  if (!m) return;
  close();
  if (!text.trim()) return;
  if (m === 'say') { const r = netSay(text); if (r.error && SAY_ERR[r.error]) paper(SAY_ERR[r.error]); return; }
  const r = await netLeaveNote(text);
  paper(r.error ? NOTE_ERR[r.error] || NOTE_ERR.refused : 'Записка оставлена здесь. Её найдут.');
}
