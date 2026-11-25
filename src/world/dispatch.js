// ═══════════════════════════════════════
// КАНАЛ «СТРАННИК — ТЕРМИНАЛ» (dispatch) — слово автора 25.11: «погнали» (две принятые истории
// с машинистом, «Ничего» и «Заочно», ждали этой механики с 22.11).
// Терминал говорит не только в своём окне: там, где «берёт», — строкой внизу кадра, зелёным.
// Живые (странник, машинист) — твёрдо, кость; ремарка — курсивом, без метки (ui/dispatchStrip.js).
// Сцена начинается сама, по приходу к своему месту, когда сыграна предыдущая:
//   у поезда (train) — подошёл к составу; первая — когда реплики машиниста выговорены
//     до конца (он просит доложить); «стоп-кран» — после сцены СТОП-КРАН;
//   у вехи (veha) — путевая веха к востоку от поезда, за изгородью: столбик с ящиком связи,
//     «где берёт»; до неё «день пути» — полторы тысячи точек (решение помощника, ждёт слова
//     автора; вопрос 7 панели — «в пустоши, но рядом с путевым знаком — нужна новая вещь»).
//     Лампочка над решёткой ящика мигает, когда у вехи ждёт сцена.
// Между сценами можно ходить куда угодно. Сцена, начатая и брошенная (ушёл в дом, вниз),
// начнётся заново при следующем приходе. Сыгранное помнит сохранение.
// В мире от обеих историй остаётся одна строка — в журнале терминала, после «Заочно».
// ═══════════════════════════════════════
import { SCENES, JOURNAL_ZAOCHNO } from '../content/dispatch_scenes.js';

export const ANCHORS = { train: 'train', veha: 'dispatch_post' };   // id мест
export const NEAR = { train: 46, veha: 70 };                    // «пришёл»: ступни не дальше стольких точек от места
export const LEAVE = 140;                                       // «ушёл»: дальше стольких

export const dispatch = {
  done: new Set(),          // сыгранные сцены
  flags: new Set(),         // talkedOut — машинист выговорен; brake — стоп-кран после заявки; z2a.train — сходил к кабине
  inside: { train: false, veha: false },
  playing: null,            // { scene, i, t, typed }
};
export const sceneById = id => SCENES.find(s => s.id === id) || null;

// ── что слышит мир ──
// беседа с машинистом дочитана до конца
export function noteTalkedOut(npc) { if (npc === 'machinist') dispatch.flags.add('talkedOut'); }
// стоп-кран дёрнули (сцена СТОП-КРАН): считается, когда заявка уже подана
export function noteBrake() { if (dispatch.done.has('z2b')) dispatch.flags.add('brake'); }

// доступна ли сцена (без места): всё нужное сыграно, своё условие есть
function ready(s) {
  if (dispatch.done.has(s.id)) return false;
  if (s.needs && !s.needs.every(id => dispatch.done.has(id))) return false;
  if (s.unless && dispatch.done.has(s.unless)) return false;
  if (s.flag && !dispatch.flags.has(s.flag)) return false;
  if (s.on === 'talkedOut' && !dispatch.flags.has('talkedOut')) return false;
  if (s.on === 'brake' && !dispatch.flags.has('brake')) return false;
  return true;
}
// следующая сцена у места: по порядку списка
export function nextAt(anchor) { return SCENES.find(s => s.at === anchor && ready(s)) || null; }

const distTo = (l, x, y) => Math.hypot(Math.max(l.x - x, 0, x - (l.x + l.w)), Math.max(l.y - y, 0, y - (l.y + l.h)));
let anchorLocs = null;
function anchorOf(key, locations) {
  if (!anchorLocs) anchorLocs = {};
  if (!(key in anchorLocs)) anchorLocs[key] = locations.find(l => l.id === ANCHORS[key]) || null;
  return anchorLocs[key];
}
export function _resetAnchors() { anchorLocs = null; }

// ── темп: реплика держится по длине; терминал печатается, живые — сразу ──
export const TYPE = 2;                                          // кадров на букву у терминала
export function holdOf(line) {
  const [who, text] = line;
  if (text === '...') return 90;
  const n = text.length;
  return Math.max(110, Math.min(480, 70 + n * 3.4)) + (who === 't' ? n * TYPE : 0);
}
// сколько напечатано у текущей реплики
export function typedOf(p) {
  if (!p) return 0;
  const [who, text] = p.scene.lines[p.i];
  return who === 't' ? Math.min(text.length, Math.floor(p.t / TYPE)) : text.length;
}

// шаг: here — ступни (x, y) наверху или null (дом, изнанка, сцена театра); paused — бумага,
// меню, карта: строка стоит. Вернёт событие: { start: scene } | { line: [who, text] } | { end: scene } | null
export function stepDispatch(here, locations, paused = false) {
  const p = dispatch.playing;
  if (p) {
    if (!here) { dispatch.playing = null; return { abort: p.scene }; }   // ушёл в дом или вниз — сцена брошена
    if (paused) return null;
    p.t++;
    if (p.t >= holdOf(p.scene.lines[p.i])) return advance();
    return null;
  }
  if (!here || paused) return null;
  for (const key of ['train', 'veha']) {
    const l = anchorOf(key, locations);
    if (!l) continue;
    const d = distTo(l, here.x, here.y), was = dispatch.inside[key];
    if (d <= NEAR[key]) dispatch.inside[key] = true;
    else if (d > LEAVE) dispatch.inside[key] = false;
    const arrived = !was && dispatch.inside[key];
    if (key === 'train' && arrived && dispatch.done.has('z2a') && !dispatch.done.has('z2b')) dispatch.flags.add('z2a.train');
    const s = nextAt(key);
    if (!s || !dispatch.inside[key]) continue;
    // по приходу; «выговорен» и «стоп-кран» — сразу, пока стоит рядом
    if (arrived || s.on === 'talkedOut' || s.on === 'brake') return start(s);
  }
  return null;
}
function start(scene) {
  dispatch.playing = { scene, i: 0, t: 0 };
  return { start: scene, line: scene.lines[0] };
}
function advance() {
  const p = dispatch.playing;
  p.i++; p.t = 0;
  if (p.i >= p.scene.lines.length) {
    dispatch.playing = null;
    dispatch.done.add(p.scene.id);
    if (p.scene.on === 'brake') dispatch.flags.delete('brake');
    return { end: p.scene };
  }
  return { line: p.scene.lines[p.i] };
}
// щелчок по строке, Enter: допечатать; допечатано — следующая реплика
export function skipLine() {
  const p = dispatch.playing;
  if (!p) return null;
  const [who, text] = p.scene.lines[p.i];
  if (who === 't' && typedOf(p) < text.length) { p.t = text.length * TYPE; return null; }
  return advance();
}
export const isPlaying = () => !!dispatch.playing;

// ── журнал терминала: после «Заочно» — одна строка (terminal/terminal.js) ──
export const journalLines = () => (dispatch.done.has('z6b') ? [JOURNAL_ZAOCHNO] : []);

// ── путевая веха: место — к востоку от поезда, за изгородью, где свободно (до артерий: дороги
//    её обойдут) ──
const POST_LOOK = `Путевая веха: столбик в полоску, номер стёрт. На столбике — ящик связи, дверца на проволоке, за решёткой — динамик.

Лампочка над решёткой то горит, то нет. Здесь берёт.`;
export function buildDispatchPost(locations, fence = null) {
  const tr = locations.find(l => l.id === 'train');
  if (!tr) return [];
  const W = 12, H = 30, busy = (x, y) => locations.some(l => x + W > l.x - 70 && x < l.x + l.w + 70 && y > l.y - 40 && y - H < l.y + l.h + 60);
  const gy0 = tr.y + tr.h;
  let at = null;
  for (let dx = 1500; dx <= 2100 && !at; dx += 20) for (const dy of [0, -20, 20, -40, 40, -60, 60, -90, 90, -120, 120]) {
    const x = Math.round(tr.x + tr.w / 2 + dx), y = Math.round(gy0 + dy);
    if (fence && fence(x, y)) continue;                              // за изгородью
    if (!busy(x, y)) { at = { x, y }; break; }
  }
  if (!at) at = { x: Math.round(tr.x + 1700), y: gy0 };
  return [{ id: 'dispatch_post', name: 'путевая веха', zone: 'street', x: at.x - W / 2, y: at.y - H, w: W, h: H,
    look: POST_LOOK, drawSelf: drawPost }];
}
const Rp = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
function drawPost(ctx, loc, t = 0) {
  const x = loc.x + 4, g = loc.y + loc.h;
  for (let k = 0; k < 22; k++) Rp(ctx, x, g - 1 - k, 3, 1, ((k >> 2) & 1) ? '#2a2622' : '#b0a284');   // столбик в полоску
  Rp(ctx, x, g - 22, 1, 22, '#D9CFB8');                               // кромка к свету
  Rp(ctx, x - 3, g - 30, 9, 8, '#4a3a2a'); Rp(ctx, x - 3, g - 30, 9, 1, '#6b4a2c');   // ящик связи, ржавый
  for (let k = 0; k < 3; k++) Rp(ctx, x - 1, g - 27 + k * 2, 5, 1, '#1a1612');        // решётка динамика
  Rp(ctx, x + 5, g - 29, 1, 6, '#2a1c10');                            // дверца на проволоке
  const wait = !!nextAt('veha');                                      // ждёт сцена — лампочка мигает
  Rp(ctx, x + 1, g - 32, 1, 1, wait && (Math.floor(t / 30) & 1) ? '#3fae3f' : '#24301f');
  ctx.globalAlpha = 0.4; Rp(ctx, x - 2, g, 8, 1, '#0D0B0A'); ctx.globalAlpha = 1;
}

// ── сохранение ──
export const saveDispatch = () => ({ done: [...dispatch.done], flags: [...dispatch.flags].filter(f => f !== 'brake') });
export function loadDispatch(d) {
  if (!d) return;                                                  // сохранения нет — что есть, то и есть (новая игра и так пуста)
  dispatch.done = new Set(Array.isArray(d.done) ? d.done.filter(id => sceneById(id)) : []);
  dispatch.flags = new Set(Array.isArray(d.flags) ? d.flags : []);
  dispatch.playing = null; dispatch.inside = { train: false, veha: false };
}
export function _resetDispatch() { loadDispatch({ done: [], flags: [] }); }
