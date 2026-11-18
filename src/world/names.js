// ═══════════════════════════════════════
// ИМЕНА ПО ЗНАКОМСТВУ (слово автора 18.11): «убери пока у всех имена, оставь пустые
// строки для первых встреч. После того, как они представятся, можно записывать».
// До знакомства у четверых (Шут, Sol, Старец, Лунный) в заголовке осмотра, в шапке
// протокола беседы и на карте — пустая строка под имя; места, названные по ним (палатка,
// равнина), — без чужого имени. Имя записывается, когда фигура представится сама:
// в разговоре прозвучала её реплика знакомства (INTRO). Кто пока не представляется
// (Sol, Лунный), остаётся пустой строкой. Описания (looks.js) имён не называют вовсе:
// в них — фигура, как её видно.
// ═══════════════════════════════════════
export const PERSONS = new Set(['jester', 'sol', 'elder', 'nocturnal']);
// места с чужим именем: [чьё, как зовётся до знакомства]
export const PLACE_OF = { tent: ['elder', 'Палатка'], nocturnal: ['nocturnal', 'Равнина'] };
// реплика, которой фигура представляется сама (content/dialogues.js)
export const INTRO = { jester: /^W\.(\s|$)/, elder: /^Меня звали по-разному\./ };
// пустая строка под имя — на бумаге (табличка, пробник walk/); в окнах — линия (style.css .blank-name)
export const BLANK = '________';

const named = new Set();
export const isNamed = who => named.has(who);
export const personOf = loc => (loc && PERSONS.has(loc.npc) ? loc.npc : null);
// не записано: фигура, с которой ещё не знакомы, — в окне вместо имени пустая строка
export const blankName = loc => { const p = personOf(loc); return !!p && !named.has(p); };
// как место или фигура записаны сейчас: незнакомая фигура — '' (пустая строка)
export function nameOf(loc) {
  if (!loc) return '';
  const p = personOf(loc);
  if (p) return named.has(p) ? (loc.talkName || loc.name || '') : '';
  const pl = PLACE_OF[loc.id];
  if (pl && !named.has(pl[0])) return pl[1];
  return loc.name || '';
}
// прозвучала реплика: представилась — записать. true — записано только что (сохранить)
export function hearLine(who, text) {
  if (!INTRO[who] || named.has(who) || !INTRO[who].test(String(text || ''))) return false;
  named.add(who);
  return true;
}
// разговор без реплики знакомства (второй, после падения), а знакомы ещё не были —
// реплика знакомства встаёт второй, после приветствия, из первого разговора
export function withIntro(who, lines, first) {
  if (!INTRO[who] || named.has(who) || !Array.isArray(lines) || lines.some(l => INTRO[who].test(String(l)))) return lines;
  const intro = (first || []).find(l => INTRO[who].test(String(l)));
  return intro ? [lines[0], intro, ...lines.slice(1)] : lines;
}
// текст действия, где фигура названа (world/useActions.js): до знакомства — без имени (поле anon)
export const byName = e => (e && e.of && e.anon && !named.has(e.of) ? { ...e, ...e.anon } : e);

export const saveNames = () => [...named];
// list — из сохранения; нет его (сохранения до 18.11) — поговорившие с теми, кто представляется, знакомы
export function loadNames(list, talkedTo) {
  named.clear();
  if (Array.isArray(list)) { for (const w of list) if (PERSONS.has(w)) named.add(w); return; }
  for (const w of talkedTo || []) if (INTRO[w]) named.add(w);
}
export function _resetNames() { named.clear(); }
