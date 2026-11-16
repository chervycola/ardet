// ═══════════════════════════════════════
// СТРОКА ОТВЕТА — когда вещь спрашивает, странник отвечает сам (слой «поступить»,
// weave/DEPTH_GAMES_2026-11-16.md: «До востребования»). Бумажная полоса, как у записки
// сети (ui/netui.js), но без сети: пока пишешь, мир ждёт (состояние typing). Enter — назвать,
// Esc — передумать. Просят число — на телефоне цифровая клавиатура, в строку идут только цифры.
// ═══════════════════════════════════════
import { state } from '../core/state.js';

let box = null, field = null, title = null, okBtn = null, done = null, digits = false;

function build() {
  if (box || typeof document === 'undefined' || !document.body) return;
  const css = document.createElement('style');
  css.textContent = `
  #ardetAskBox{position:fixed;left:50%;bottom:16%;transform:translateX(-50%);z-index:40;display:none;
    width:min(420px,88vw);background:rgba(238,227,203,0.92);color:#3A3026;padding:12px 14px 10px;
    box-shadow:0 8px 26px rgba(0,0,0,.45)}
  #ardetAskBox h4{margin:0 0 8px;font:500 8px Montserrat,sans-serif;letter-spacing:3px;color:#C23B2B;text-transform:uppercase}
  #ardetAskBox input{width:100%;box-sizing:border-box;border:none;border-bottom:1px solid rgba(58,48,38,.3);
    background:transparent;color:#2a2620;font:24px VT323,monospace;letter-spacing:6px;outline:none}
  #ardetAskBox .row{display:flex;gap:6px;justify-content:flex-end;margin-top:8px}
  #ardetAskBox button{background:rgba(58,48,38,.12);color:#3A3026;border:none;padding:7px 11px 8px;cursor:pointer;
    font:500 9px Montserrat,sans-serif;letter-spacing:3px;text-transform:uppercase}
  .m #ardetAskBox{bottom:auto;top:9%}`;
  document.head.appendChild(css);
  box = document.createElement('div'); box.id = 'ardetAskBox';
  box.innerHTML = '<h4></h4><input type="text" spellcheck="false" autocomplete="off"><div class="row"><button data-a="cancel">передумать</button><button data-a="ok"></button></div>';
  title = box.querySelector('h4'); field = box.querySelector('input'); okBtn = box.querySelector('[data-a="ok"]');
  box.addEventListener('click', e => e.stopPropagation());
  box.querySelector('[data-a="cancel"]').addEventListener('click', () => finish(null));
  okBtn.addEventListener('click', () => finish(field.value));
  field.addEventListener('input', () => { if (digits) field.value = field.value.replace(/\D/g, ''); });
  field.addEventListener('keydown', e => {
    e.stopPropagation();                            // клавиши — в строку, не в мир
    if (e.key === 'Escape') { e.preventDefault(); finish(null); }
    else if (e.key === 'Enter') { e.preventDefault(); finish(field.value); }
  });
  document.body.appendChild(box);
}

function finish(v) {
  const r = done; done = null;
  if (!box) { if (r) r(null); return; }
  box.style.display = 'none'; field.blur();
  state.transition('game');
  if (r) r(v == null ? null : String(v).trim());
}

// спросить: вернёт строку ответа или null (передумал, или спросить сейчас нельзя)
export function ask({ prompt, ok = 'назвать', max = 4, numeric = true } = {}) {
  return new Promise(res => {
    build();
    if (!box || done || !state.is('game') || !state.transition('typing')) { res(null); return; }
    done = res; digits = numeric;
    title.textContent = prompt || ''; okBtn.textContent = ok;
    field.value = ''; field.maxLength = max; field.inputMode = numeric ? 'numeric' : 'text';
    box.style.display = 'block';
    setTimeout(() => field.focus(), 0);
  });
}
export const isAsking = () => !!done;
