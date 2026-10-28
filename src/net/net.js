// ═══════════════════════════════════════
// СЕТЬ СТРАННИКОВ (weave/NET.md) — кто ещё сейчас в мире, что сказали рядом,
// записки на земле. Транспорт: Supabase (config.js), локальный (?net=local —
// вкладки одного браузера) или никакого: тогда мира для одного не касается
// ничего. Здесь — только состояние и правила; рисует render/net.js, вводит
// ui/netui.js.
//  · Шаги — три вести в секунду, встал или пошёл — сразу, стоишь — раз в 2 секунды;
//    между вестями чужой шаг досчитывается; не слышно 10 секунд — ушёл.
//  · Сказанное слышно в 260 точках, только на своём слое (наверху / под землёй);
//    не чаще раза в 2 секунды; нигде не хранится.
//  · Записка — у ног, наверху; не чаще раза в минуту (и 10 в сутки — решает база).
//    Подгружаются в 700 точках вокруг; ушёл дальше — подгрузить заново; оставленная
//    рядом сейчас — видна сразу.
// ═══════════════════════════════════════
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
import { localTransport } from './local.js';
import { supabaseTransport } from './supabase.js';
import { clean, dirty, SAY_MAX, NOTE_MAX } from './filter.js';
import { fromOldGeo, toOldGeo } from '../world/disc.js';
import { cutOf } from '../sprites/player.js';
import { isCut } from '../sprites/wardrobe.js';

const FACES = ['S', 'N', 'E', 'W'];
// крой из чужой вести: только известный, не ключ прототипа
const lookOf = c => (isCut(c) ? c : undefined);

// Кольца стали просторнее (geo 2, world/disc.js): записки новой геометрии лежат в базе
// со сдвигом по x — прежние клиенты их не видят и не путают; прежние записки ищутся
// по своим координатам и переносятся так же, как сохранения (fromOldGeo)
const NOTE_X = 1e6;
function oldBox(b) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const fx of [0, 0.5, 1]) for (const fy of [0, 0.5, 1]) {
    const p = toOldGeo(b.x0 + (b.x1 - b.x0) * fx, b.y0 + (b.y1 - b.y0) * fy);
    x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
  }
  return { x0: x0 - 40, y0: y0 - 40, x1: x1 + 40, y1: y1 + 40 };
}

export const SIGHT = 320;                     // смотреть вдаль вдвоём — не дальше, чем видно друг друга
export const HEAR = 260, LOST = 600, SAY_GAP = 120, NOTE_GAP = 3600, FETCH_R = 700, VOICE_LIFE = 1500;   // голос гасит перо (render/net.js); срок — на случай, если его не рисуют
const SEND_EVERY = 20, IDLE_EVERY = 120, MUTE_KEY = 'ardet-net-muted', GONE_KEY = 'ardet-net-reported';

export const net = {
  on: false, kind: null, tab: null, T: null,
  others: new Map(),      // tab → { x, y, tx, ty, layer, dir, moving, heard }
  notes: new Map(),       // id → { id, x, y, layer, text, certs, created, mine }
  voices: [],             // { who: tab | 'me', text, t0 } — сказанное рядом, пишется пером
  muted: new Set(),
  gone: new Set(),        // записки, на которые пожаловался: у себя их больше не видно
  t: 0, sent: -1e9, sentPos: null, last: null, saidAt: -1e9, notedAt: -1e9, fetched: null, fetching: false,
};

function tabId() {
  try { const k = sessionStorage.getItem('ardet-net-tab'); if (k) return k; } catch (e) {}
  const k = 'w' + Math.random().toString(36).slice(2, 10);
  try { sessionStorage.setItem('ardet-net-tab', k); } catch (e) {}
  return k;
}
export function pickTransport(search, tab) {
  if (/[?&]net=off\b/.test(search)) return null;
  if (/[?&]net=local\b/.test(search)) return localTransport(tab);
  if (SUPABASE_URL && SUPABASE_KEY) return supabaseTransport(SUPABASE_URL, SUPABASE_KEY, tab);
  return null;
}
// T — транспорт (для проверок — свой); без него — по адресу страницы
export async function startNet(T = null) {
  const search = typeof location !== 'undefined' ? location.search : '';
  net.tab = net.tab || tabId();
  net.T = T || pickTransport(search, net.tab);
  if (!net.T) return false;
  try { for (const k of JSON.parse(localStorage.getItem(MUTE_KEY) || '[]')) net.muted.add(k); } catch (e) {}
  try { for (const k of JSON.parse(localStorage.getItem(GONE_KEY) || '[]')) net.gone.add(k); } catch (e) {}
  net.T.on('pos', m => {
    const o = net.others.get(m.id);
    const cut = lookOf(m.cut), face = FACES.includes(m.face) ? m.face : undefined;   // чужой клиент мог прислать что угодно
    if (!o) { net.others.set(m.id, { x: m.x, y: m.y, tx: m.x, ty: m.y, rx: m.x, ry: m.y, vx: 0, vy: 0, layer: m.layer, dir: m.dir || 1, moving: !!m.moving, look: !!m.look, sit: m.sit ? 1 : 0, sitK: m.sit ? 1 : 0, cut, face, heard: net.t }); return; }
    const jump = o.layer !== m.layer || Math.hypot(o.x - m.x, o.y - m.y) > 400, dt = Math.max(1, net.t - o.heard);
    if (jump) { o.x = m.x; o.y = m.y; }                          // спустился, поднялся, переехал — там и стоит
    // идёт — куда и как быстро, по двум последним точкам: между вестями шаг досчитывается
    o.vx = m.moving && !jump ? (m.x - o.rx) / dt : 0; o.vy = m.moving && !jump ? (m.y - o.ry) / dt : 0;
    Object.assign(o, { tx: m.x, ty: m.y, rx: m.x, ry: m.y, layer: m.layer, dir: m.dir || o.dir, moving: !!m.moving, look: !!m.look, sit: m.sit ? 1 : 0, cut, face: face || o.face, heard: net.t });
  });
  net.T.on('say', m => {
    const o = net.others.get(m.id), text = clean(m.text, SAY_MAX);
    if (!o || !text || net.muted.has(m.id) || o.layer === 'house') return;   // в доме каждый у себя: не слышно
    if (net.last && (o.layer !== net.last.layer || Math.hypot(o.x - net.last.x, o.y - net.last.y) > HEAR)) return;   // далеко — не слышно
    voice(m.id, text);
  });
  net.T.on('leave', m => { net.others.delete(m.id); net.voices = net.voices.filter(v => v.who !== m.id); });
  // рядом оставили записку — видна сразу, не дожидаясь подгрузки; правила те же, что у базы:
  // раз в минуту и у ног того, кто оставил (чужой клиент мог бы слать что угодно)
  net.T.on('note', m => {
    const o = net.others.get(m.id), text = clean(m.text, NOTE_MAX);
    if (!o || o.layer !== 'surface' || !text || m.nid == null || net.gone.has(m.nid) || net.notes.has(m.nid)) return;
    if (net.t - (o.notedAt ?? -1e9) < NOTE_GAP || Math.hypot(m.x - o.x, m.y - o.y) > 40) return;
    o.notedAt = net.t;
    net.notes.set(m.nid, { id: m.nid, x: m.x, y: m.y, layer: 'surface', text, certs: 0, created: Date.now(), mine: false });
  });
  const ok = await net.T.start();
  net.on = !!ok; net.kind = ok ? net.T.kind : null;
  if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('pagehide', () => { if (net.on) net.T.stop(); });
  return net.on;
}
function voice(who, text) {
  net.voices = net.voices.filter(v => v.who !== who);           // новое слово стирает прежнее у того же странника
  net.voices.push({ who, text, t0: net.t });
}
// шаг: p — странник {x, y, dir, moving, visor, sit}, layer — 'surface' | 'under'
export function stepNet(p, layer) {
  net.t++;
  if (!net.on) return;
  // ладонь козырьком и «сел смотреть» — тоже видно другим (за кольцом)
  // во что одет и куда смотрит — тоже: чужие видят твой крой и твой оборот (sprites/wardrobe.js)
  const me = { x: Math.round(p.x + 6), y: Math.round(p.y + 23), layer, dir: p.dir || 1, moving: !!p.moving, look: !!p.visor, sit: (p.sit || 0) > 0.5 ? 1 : 0, cut: cutOf(p), face: FACES.includes(p.face) ? p.face : 'S' };
  // весть — когда сдвинулся с посланной точки; встал или пошёл — сразу; стоишь — изредка: «я тут»
  const S = net.sentPos, gap = net.t - net.sent;
  const turned = S && (S.moving !== me.moving || S.look !== me.look || S.sit !== me.sit || S.cut !== me.cut || S.face !== me.face), moved = !S || S.layer !== layer || Math.hypot(me.x - S.x, me.y - S.y) > 1;
  if ((moved && gap >= SEND_EVERY) || (turned && gap >= 4) || gap >= IDLE_EVERY) { net.T.sendPos(me); net.sent = net.t; net.sentPos = me; }
  net.last = me;
  for (const [k, o] of net.others) {
    if (net.t - o.heard > LOST) { net.others.delete(k); continue; }
    if (net.t - o.heard < 2 * SEND_EVERY) { o.tx += o.vx; o.ty += o.vy; }   // досчитать шаг — не дальше двух вестей
    o.x += (o.tx - o.x) * 0.25; o.y += (o.ty - o.y) * 0.25;     // к своей точке — плавно
    o.sitK += ((o.sit || 0) - (o.sitK || 0)) * 0.12;             // садится и встаёт, как свой
  }
  net.voices = net.voices.filter(v => net.t - v.t0 < VOICE_LIFE);
  if (layer === 'surface' && !net.fetching && (!net.fetched || Math.hypot(me.x - net.fetched.x, me.y - net.fetched.y) > FETCH_R / 2 || net.t - net.fetched.t > 3600)) fetchNotes(me);
}
async function fetchNotes(me) {
  net.fetching = true;
  net.fetched = { x: me.x, y: me.y, t: net.t };
  const b = { x0: me.x - FETCH_R, x1: me.x + FETCH_R, y0: me.y - FETCH_R, y1: me.y + FETCH_R };
  const fresh = await net.T.notesIn({ layer: 'surface', ...b, x0: b.x0 + NOTE_X, x1: b.x1 + NOTE_X });
  const old = await net.T.notesIn({ layer: 'surface', ...oldBox(b) });
  const list = [...fresh.map(n => ({ ...n, x: n.x - NOTE_X })),
    ...old.filter(n => n.x < NOTE_X / 2).map(n => ({ ...n, ...fromOldGeo(n.x, n.y) })).filter(n => n.x > b.x0 && n.x < b.x1 && n.y > b.y0 && n.y < b.y1)];
  for (const [id, n] of net.notes) if (Math.abs(n.x - me.x) > 2 * FETCH_R || Math.abs(n.y - me.y) > 2 * FETCH_R) net.notes.delete(id);   // далёкие — забыть: вернёшься — подгрузятся
  for (const n of list) if (!net.gone.has(n.id)) net.notes.set(n.id, { ...net.notes.get(n.id), ...n, text: clean(n.text, NOTE_MAX), mine: n.author === net.T.uid });
  net.fetching = false;
}
// сказать: слышат те, кто рядом; своё — тоже пишется пером над собой
export function netSay(text) {
  if (!net.on) return { error: 'off' };
  const s = clean(text, SAY_MAX);
  if (!s) return { error: 'empty' };
  if (net.t - net.saidAt < SAY_GAP) return { error: 'soon' };
  net.saidAt = net.t;
  net.T.sendSay({ text: s });
  voice('me', s);
  return { text: s };
}
// записка у ног: брань база не примет — не тратить попытку
export async function netLeaveNote(text) {
  if (!net.on || !net.last) return { error: 'off' };
  if (net.last.layer !== 'surface') return { error: net.last.layer === 'house' ? 'house' : 'under' };
  const s = clean(text, NOTE_MAX);
  if (!s) return { error: 'empty' };
  if (dirty(text) || s.includes('█')) return { error: 'dirty' };
  if (net.t - net.notedAt < NOTE_GAP) return { error: 'soon' };
  const at = { x: net.last.x, y: net.last.y + 4 };
  const r0 = await net.T.addNote({ x: at.x + NOTE_X, y: at.y, layer: 'surface', text: s });
  if (r0.error) return r0;
  const r = { ...r0, x: r0.x - NOTE_X };
  net.notedAt = net.t;
  net.notes.set(r.id, { ...r, text: s, mine: true });
  if (net.T.sendNote) net.T.sendNote({ nid: r.id, ...at, text: s });   // тем, кто рядом, — сразу
  return r;
}
// заверить / пожаловаться: по разу на записку; своя — нельзя
export async function netVote(id, kind) {
  const n = net.notes.get(id);
  if (!net.on || !n || n.mine) return { error: 'mine' };
  if (n[kind + 'ed']) return { error: 'twice' };
  const r = await net.T.vote(id, kind);
  if (r.error && r.error !== 'twice') return r;
  n[kind + 'ed'] = true;
  if (kind === 'cert' && !r.error) n.certs = (n.certs || 0) + 1;
  if (kind === 'report') {                                     // пожаловался — у себя больше не видишь
    net.notes.delete(id); net.gone.add(id);
    try { localStorage.setItem(GONE_KEY, JSON.stringify([...net.gone].slice(-500))); } catch (e) {}
  }
  return r;
}
export function mute(tab, on = true) {
  if (on) net.muted.add(tab); else net.muted.delete(tab);
  net.voices = net.voices.filter(v => !net.muted.has(v.who));
  try { localStorage.setItem(MUTE_KEY, JSON.stringify([...net.muted].slice(-200))); } catch (e) {}
}
// смотрит ли кто-то рядом из-под ладони (за кольцом, наверху): черта видна двоим
export function lookingNear(x, y, r = SIGHT) {
  if (!net.on) return false;
  for (const o of net.others.values()) if (o.look && o.layer === 'surface' && Math.hypot(o.x - x, o.y - y) < r) return true;
  return false;
}
// кто стоит в рамке на этом слое
export function othersIn(layer, x0, y0, x1, y1) {
  const out = [];
  for (const [tab, o] of net.others) if (o.layer === layer && o.x > x0 && o.x < x1 && o.y > y0 && o.y < y1) out.push({ tab, ...o });
  return out;
}
export const notesIn = (x0, y0, x1, y1) => [...net.notes.values()].filter(n => n.layer === 'surface' && n.x > x0 && n.x < x1 && n.y > y0 && n.y < y1);
// для проверок
export function _resetNet() {
  if (net.T && net.on) net.T.stop();
  Object.assign(net, { on: false, kind: null, T: null, t: 0, sent: -1e9, sentPos: null, last: null, saidAt: -1e9, notedAt: -1e9, fetched: null, fetching: false, voices: [] });
  net.others.clear(); net.notes.clear(); net.muted.clear(); net.gone.clear();
}
