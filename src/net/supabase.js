// ═══════════════════════════════════════
// SUPABASE — без библиотек. Вход анонимный (GoTrue: /auth/v1/signup без почты,
// сессия продлевается refresh-токеном); записки и отметки — PostgREST
// (/rest/v1/notes, /rest/v1/note_votes; правила — server/supabase.sql); шаги и
// речь — Realtime, канал Phoenix: broadcast — шаги, слова и весть о новой записке,
// presence — кто ушёл.
// Сеть легла — переподключение с нарастающей паузой; мир от этого не зависит.
// ═══════════════════════════════════════
const TOPIC = 'realtime:ardet-world', SKEY = 'ardet-net-session';

export function supabaseTransport(url, key, tab) {
  const base = url.replace(/\/+$/, ''), wsUrl = base.replace(/^http/, 'ws') + '/realtime/v1/websocket?apikey=' + encodeURIComponent(key) + '&vsn=1.0.0';
  const H = { pos: [], say: [], leave: [], note: [] };
  let session = null, ws = null, ref = 0, jr = null, joined = false, hb = null, refreshT = null, retry = 0, stopped = false;
  // до входа — только apikey: новый publishable-ключ не JWT, в Authorization ему не место
  const hdr = () => (session ? { apikey: key, Authorization: 'Bearer ' + session.access_token, 'Content-Type': 'application/json' } : { apikey: key, 'Content-Type': 'application/json' });
  const call = (path, opt = {}) => fetch(base + path, opt).catch(() => null);
  function keep(s) {
    session = s;
    try { localStorage.setItem(SKEY, JSON.stringify({ refresh_token: s.refresh_token })); } catch (e) {}
    clearTimeout(refreshT);                         // токен — продлить за две минуты до конца; каналу сказать новый
    refreshT = setTimeout(async () => { if (await refresh()) send('access_token', { access_token: session.access_token }); }, Math.max(30, (s.expires_in || 3600) - 120) * 1000);
  }
  async function refresh() {
    let rt = session && session.refresh_token;
    if (!rt) { try { rt = (JSON.parse(localStorage.getItem(SKEY) || 'null') || {}).refresh_token; } catch (e) {} }
    if (!rt) return false;
    const r = await call('/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: rt }) });
    if (!r || !r.ok) return false;
    keep(await r.json());
    return true;
  }
  async function signIn() {
    if (await refresh()) return true;
    const r = await call('/auth/v1/signup', { method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' }, body: JSON.stringify({ data: {} }) });
    if (!r || !r.ok) return false;
    keep(await r.json());
    return true;
  }
  function send(event, payload) {
    if (!ws || ws.readyState !== 1 || !joined) return;
    ws.send(JSON.stringify({ topic: TOPIC, event, payload, ref: String(++ref), join_ref: jr }));
  }
  function connect() {
    if (stopped) return;
    ws = new WebSocket(wsUrl); joined = false;
    ws.onopen = () => {
      if (stopped) { ws.close(); return; }          // ушёл, пока стучался
      retry = 0; jr = String(++ref);
      ws.send(JSON.stringify({ topic: TOPIC, event: 'phx_join', ref: jr, join_ref: jr, payload: {
        config: { broadcast: { self: false, ack: false }, presence: { key: tab, enabled: true }, postgres_changes: [], private: false },
        access_token: session.access_token } }));
      clearInterval(hb);
      hb = setInterval(() => { if (ws && ws.readyState === 1) ws.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(++ref) })); }, 25000);
    };
    ws.onmessage = e => {
      let m = null;
      try { m = JSON.parse(e.data); } catch (er) { return; }
      if (!m || m.topic !== TOPIC) return;
      if (m.event === 'phx_reply' && !joined && m.ref === jr) {
        if (m.payload && m.payload.status === 'ok') { joined = true; send('presence', { type: 'presence', event: 'track', payload: { tab } }); }
        return;
      }
      if (m.event === 'broadcast' && m.payload) {
        const p = m.payload.payload || {}, hs = H[m.payload.event];
        if (hs && p.id && p.id !== tab) for (const h of hs) h(p);
        return;
      }
      if (m.event === 'presence_diff' && m.payload && m.payload.leaves) for (const k of Object.keys(m.payload.leaves)) if (k !== tab) for (const h of H.leave) h({ id: k });
    };
    ws.onclose = () => { joined = false; clearInterval(hb); if (!stopped) setTimeout(connect, Math.min(30000, 1000 * 2 ** retry++)); };
    ws.onerror = () => {};
  }
  const bc = (event, payload) => send('broadcast', { type: 'broadcast', event, payload: { ...payload, id: tab } });
  const stamp = n => ({ ...n, created: Date.parse(n.created_at) });
  return {
    kind: 'supabase',
    get uid() { return session && session.user ? session.user.id : null; },
    async start() { if (!(await signIn())) return false; connect(); return true; },
    on(ev, f) { H[ev].push(f); },
    sendPos(p) { bc('pos', p); },
    sendSay(s) { bc('say', s); },
    sendNote(n) { bc('note', n); },
    stop() { bc('leave', {}); stopped = true; clearInterval(hb); clearTimeout(refreshT); if (ws) ws.close(); },
    async notesIn(b) {
      const q = `select=id,x,y,layer,text,certs,created_at,author&layer=eq.${b.layer}&x=gte.${b.x0 | 0}&x=lte.${b.x1 | 0}&y=gte.${b.y0 | 0}&y=lte.${b.y1 | 0}&order=created_at.desc&limit=80`;
      const r = await call('/rest/v1/notes?' + q, { headers: hdr() });
      return r && r.ok ? (await r.json()).map(stamp) : [];
    },
    async addNote(n) {
      const r = await call('/rest/v1/notes', { method: 'POST', headers: { ...hdr(), Prefer: 'return=representation' }, body: JSON.stringify({ x: Math.round(n.x), y: Math.round(n.y), layer: n.layer, text: n.text }) });
      if (!r) return { error: 'net' };
      if (!r.ok) return { error: r.status === 401 || r.status === 403 ? 'quota' : 'refused' };   // лимит — правило доступа; брань, длина — проверка базы
      const rows = await r.json();
      return stamp(rows[0]);
    },
    async vote(id, kind) {
      const r = await call('/rest/v1/note_votes', { method: 'POST', headers: { ...hdr(), Prefer: 'return=minimal' }, body: JSON.stringify({ note_id: id, kind }) });
      if (!r) return { error: 'net' };
      if (r.status === 409) return { error: 'twice' };
      return r.ok ? {} : { error: 'refused' };
    },
  };
}
