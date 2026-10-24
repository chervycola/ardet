// ═══════════════════════════════════════
// ЛОКАЛЬНЫЙ МИР (?net=local) — проверка без сервера: вкладки одного браузера —
// разные странники. Шаги, речь и весть о новой записке идут через BroadcastChannel (до своей вкладки не
// доходят), записки и отметки лежат в localStorage, общем для вкладок. Правила те
// же, что у базы (server/supabase.sql): длина, старость, жалобы скрывают.
// ═══════════════════════════════════════
import { NOTE_MAX } from './filter.js';

const KEY = 'ardet-net-notes', AGE = 30 * 86400e3, HIDE = 3, PER_DAY = 10;
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
const write = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} };

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
  };
}
