// ═══════════════════════════════════════
// ЛОКАЛЬНЫЙ МИР (?net=local) — проверка без сервера: вкладки одного браузера —
// разные странники. Шаги, речь и весть о новой записке идут через BroadcastChannel (до своей вкладки не
// доходят), записки и отметки лежат в localStorage, общем для вкладок. Правила те
// же, что у базы (server/supabase.sql): длина, старость, жалобы скрывают.
// ═══════════════════════════════════════
import { NOTE_MAX } from './filter.js';
import { rectDepth, termOf, sideOf, MERGE, CAP, CELL } from '../world/stands.js';

const KEY = 'ardet-net-notes', AGE = 30 * 86400e3, HIDE = 3, PER_DAY = 10, SKEY = 'ardet-net-stands', SACT = 'ardet-net-stand-acts', DAY = 86400e3;
const read = (k = KEY) => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { return []; } };
const write = (list, k = KEY) => { try { localStorage.setItem(k, JSON.stringify(list)); } catch (e) {} };
// стоянка — как в базе (server/stands.sql stand_place_ok): место в поясе, где тянет; след цепочки — за огнём
function standOk(s) {
  const d = rectDepth(s.x, s.y);
  if (s.kind === 'dent') return !s.path && d >= 0.47 && d <= 0.97;
  const P = s.path;
  if (s.kind !== 'chain' || !Array.isArray(P) || P.length < 6 || P.length > 32 || P.length % 2 || d < 0.45 || d > 1.07) return false;
  for (let i = 0, x = s.x, y = s.y; i < P.length; i += 2) { x += P[i]; y += P[i + 1]; if (rectDepth(x, y) < 0.2 || Math.hypot(P[i], P[i + 1]) > 24) return false; }
  return true;
}

export function localTransport(me) {
  const ch = typeof BroadcastChannel === 'function' ? new BroadcastChannel('ardet-net-2') : null;
  const H = { pos: [], say: [], leave: [], note: [] };
  if (ch) ch.onmessage = e => { const m = e.data; if (m && m.id !== me && H[m.t]) for (const f of H[m.t]) f(m); };
  const post = m => { if (ch) ch.postMessage({ ...m, id: me }); };
  return {
    kind: 'local', uid: me,
    async start() { return !!ch; },
    on(ev, f) { H[ev].push(f); },
    sendPos(p) { post({ t: 'pos', ...p }); },
    sendSay(s) { post({ t: 'say', ...s }); },
    sendNote(n) { post({ t: 'note', ...n }); },
    stop() { post({ t: 'leave' }); if (ch) ch.close(); },
    async notesIn(b) {
      const now = Date.now();
      return read().filter(n => !n.hidden && now - n.created < AGE && n.layer === b.layer && n.x >= b.x0 && n.x <= b.x1 && n.y >= b.y0 && n.y <= b.y1)
        .sort((a, c) => c.created - a.created).slice(0, 80);
    },
    async addNote(n) {
      const list = read(), now = Date.now();
      if (!n.text || Array.from(n.text).length > NOTE_MAX) return { error: 'length' };
      if (list.filter(q => q.author === me && now - q.created < 86400e3).length >= PER_DAY) return { error: 'quota' };
      const note = { id: 'L' + now.toString(36) + Math.random().toString(36).slice(2, 6), author: me, x: n.x, y: n.y, layer: n.layer, text: n.text, created: now, certs: 0, reports: 0, voters: [], hidden: false };
      list.push(note); write(list);
      return note;
    },
    async vote(id, kind) {
      const list = read(), n = list.find(q => q.id === id);
      if (!n) return { error: 'gone' };
      const tag = kind + ':' + me;
      if (n.author === me || n.voters.includes(tag)) return { error: 'twice' };
      n.voters.push(tag);
      if (kind === 'cert') n.certs++; else { n.reports++; if (n.reports >= HIDE) n.hidden = true; }
      write(list);
      return { certs: n.certs, hidden: n.hidden };
    },
    // стоянки — те же правила, что у базы: рядом — продлить; на отрезок 3 вмятины и 2 цепочки;
    // действие в минуту, новых 10 в сутки, продлений 20
    async standsIn(b) {
      const now = Date.now();
      return read(SKEY).filter(s => s.exp > now && s.x >= b.x0 && s.x <= b.x1 && s.y >= b.y0 && s.y <= b.y1).slice(0, 120)
        .map(({ id, kind, x, y, path, exp }) => ({ id, kind, x, y, path, exp }));
    },
    async addStand(s0) {
      const s = { kind: s0.kind, x: Math.round(s0.x), y: Math.round(s0.y), path: s0.path || null }, now = Date.now();
      if (!standOk(s)) return { error: 'refused' };
      const list = read(SKEY).filter(q => q.exp > now - DAY), acts = read(SACT).filter(a => now - a.at < DAY), mine = acts.filter(a => a.who === me);
      const hit = list.find(q => q.kind === s.kind && q.exp > now && Math.hypot(q.x - s.x, q.y - s.y) <= MERGE[s.kind]);
      const act = hit ? 'renew' : 'new';
      if (mine.some(a => now - a.at < 60e3) || mine.filter(a => a.act === act).length >= (hit ? 20 : 10)) return { error: 'quota' };
      let out = hit;
      if (hit) { hit.exp = Math.max(hit.exp, now + termOf(hit.x, hit.y)); hit.last = me; }
      else {
        const cell = q => q.kind === s.kind && q.exp > now && Math.floor(q.x / CELL) === Math.floor(s.x / CELL) && Math.floor(q.y / CELL) === Math.floor(s.y / CELL);
        if (list.filter(cell).length >= CAP[s.kind]) return { error: 'full' };
        list.push(out = { id: 'S' + now.toString(36) + Math.random().toString(36).slice(2, 6), ...s, exp: now + termOf(s.x, s.y), by: me, last: me, at: now });
      }
      acts.push({ who: me, act, at: now });
      write(list, SKEY); write(acts, SACT);
      return { id: out.id, kind: out.kind, x: out.x, y: out.y, path: out.path, exp: out.exp, mine: (out.by ?? out.last) === me };
    },
    async standFall(at) {
      const now = Date.now(), side = sideOf(at.x, at.y), list = read(SKEY);
      for (const q of list) if ((q.by ?? q.last) === me && q.last === me && q.exp > now && !(q.kind === 'chain' && now - q.at < 10e3) && sideOf(q.x, q.y) === side) q.exp = now + (q.exp - now) / 2;
      write(list, SKEY);
      return {};
    },
  };
}
