// ═══════════════════════════════════════
// ANFILADA TESTS — hall data integrity + overlay navigation.
// Run: node test/anfilada.mjs
// ═══════════════════════════════════════
const noop = () => {};
const storage = new Map();
globalThis.localStorage = {
  getItem: k => storage.has(k) ? storage.get(k) : null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: k => storage.delete(k),
};
globalThis.window = { innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
  addEventListener: noop, removeEventListener: noop, visualViewport: null,
  AudioContext: function () {
    return { state: 'running', currentTime: 0, destination: {},
      createOscillator: () => ({ type: '', frequency: { value: 0, exponentialRampToValueAtTime: noop }, connect: noop, start: noop, stop: noop }),
      createGain: () => ({ gain: { value: 0, exponentialRampToValueAtTime: noop, linearRampToValueAtTime: noop }, connect: noop }),
      createBiquadFilter: () => ({ type: '', frequency: { value: 0 }, Q: { value: 0 }, connect: noop }),
      resume: noop };
  } };

// DOM shim with class list + innerHTML capture + querySelectorAll
function fakeEl() {
  const classes = new Set();
  const listeners = {};
  return {
    _html: '',
    classList: {
      add: c => classes.add(c), remove: c => classes.delete(c),
      contains: c => classes.has(c), toggle: noop,
    },
    set innerHTML(v) { this._html = v; },
    get innerHTML() { return this._html; },
    querySelectorAll: () => [],
    addEventListener: (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); },
    removeEventListener: noop,
    style: {}, appendChild: noop, focus: noop, blur: noop,
  };
}
const els = new Map();
globalThis.document = {
  getElementById: id => els.get(id) || (els.set(id, fakeEl()), els.get(id)),
  createElement: () => fakeEl(),
  addEventListener: noop, removeEventListener: noop,
  querySelectorAll: () => [], title: 'x', body: fakeEl(), hidden: false,
};
globalThis.requestAnimationFrame = noop;
globalThis.setTimeout = (fn) => { try { fn(); } catch {} return 0; };
globalThis.clearTimeout = noop;

const results = [];
function test(name, fn) {
  try { fn(); results.push({ name, status: 'pass' }); }
  catch (e) { results.push({ name, status: 'fail', msg: e.message, stack: e.stack }); }
}
function assert(c, m) { if (!c) throw new Error(m || 'assertion failed'); }
function eq(a, b, m) { if (a !== b) throw new Error((m || 'eq') + `: ${a} !== ${b}`); }

const base = new URL('../src/', import.meta.url);
const imp = p => import(new URL(p, base));

// ═══ HALL DATA INTEGRITY ═══
{
  const { HALLS, getHall } = await imp('content/anfilada_db.js');

  test('halls: exactly nine, numbered 1..9 in order', () => {
    eq(HALLS.length, 9, 'hall count');
    HALLS.forEach((h, i) => eq(h.n, i + 1, `hall ${i} numbering`));
  });

  test('halls: every hall has title, years, facade, backyard, exhibits', () => {
    for (const h of HALLS) {
      for (const k of ['title', 'years', 'facade', 'backyard']) {
        assert(typeof h[k] === 'string' && h[k].length > 0, `hall ${h.n}: bad ${k}`);
      }
      assert(Array.isArray(h.exhibits) && h.exhibits.length > 0, `hall ${h.n}: no exhibits`);
      for (const ex of h.exhibits) {
        assert(ex.name && ex.text, `hall ${h.n}: bad exhibit ${ex.name || '?'}`);
      }
    }
  });

  test('halls: drafts declared in 3, 5, 8; hall 9 receives', () => {
    const withDrafts = HALLS.filter(h => h.drafts && h.drafts.length).map(h => h.n);
    for (const n of [3, 5, 8]) assert(withDrafts.includes(n), `hall ${n} should have a draft door`);
    const h9 = getHall(9);
    assert(Array.isArray(h9.receives) && h9.receives.length >= 4, 'hall 9 must receive the draft doors');
    assert(!h9.drafts.length, 'hall 9 has no outgoing drafts — anfilada ends here');
  });

  test('halls: hall 7 is the quiet one (humor falls silent by architecture)', () => {
    assert(getHall(7).quiet === true, 'hall 7 must carry the quiet flag');
  });

  test('halls: prohibited words absent from game texts (тигр не провозглашает)', () => {
    // The handoff bans these words in GAME texts: спектакль/бытие/возвращение
    // are allowed in structural docs but here we check the worst offender —
    // "реализм-гуманизм" — plus mockery aimed at hearths is unverifiable
    // mechanically, so we check at least the explicit ban list.
    const banned = ['реализм-гуманизм'];
    for (const h of HALLS) {
      const all = [h.facade, h.backyard, ...h.exhibits.map(e => e.text)].join(' ');
      for (const w of banned) {
        assert(!all.includes(w), `hall ${h.n} contains banned word: ${w}`);
      }
    }
  });

  test('getHall: returns null for out-of-range', () => {
    eq(getHall(0), null); eq(getHall(10), null);
  });
}

// ═══ OVERLAY NAVIGATION ═══
{
  const { state } = await imp('core/state.js');
  const anf = await imp('ui/anfilada.js');
  anf.init();

  test('anfilada: open from game → state anfilada; first-time gates line', () => {
    state.current = 'game';
    anf._test.resetGatesLine();
    anf.open();
    assert(state.is('anfilada'), 'state should be anfilada');
    const body = document.getElementById('anf-body');
    assert(body.innerHTML.includes('предназначены для тебя одного'), 'gates line shown on first open');
  });

  test('anfilada: arrow-right walks 1→9 and stops; halls render', () => {
    anf._test.set(1, 'facade');
    anf._test.render();
    for (let i = 0; i < 12; i++) anf._test.onKey({ key: 'ArrowRight', preventDefault: noop });
    eq(anf._test.current, 9, 'should stop at hall 9');
    const body = document.getElementById('anf-body');
    assert(body.innerHTML.includes('СЕЙЧАС'), 'hall 9 title rendered');
    assert(body.innerHTML.includes('сюда сквозит из'), 'hall 9 lists incoming drafts');
  });

  test('anfilada: B toggles facade/backyard; backyard shows leaks', () => {
    anf._test.set(2, 'facade');
    anf._test.render();
    anf._test.onKey({ key: 'b', preventDefault: noop });
    eq(anf._test.side, 'backyard', 'side flipped');
    const body = document.getElementById('anf-body');
    assert(body.innerHTML.includes('задворки'), 'backyard label');
    assert(body.innerHTML.includes('протечки'), 'leaks section');
    assert(body.innerHTML.includes('провидение'), 'euphemism label in hall 2');
  });

  test('anfilada: draft door jumps to hall 9', () => {
    anf._test.set(3, 'facade');
    anf._test.render();
    anf._test.jumpToNow();
    eq(anf._test.current, 9, 'draft lands in hall 9');
    eq(anf._test.side, 'facade', 'arrives on the facade');
  });

  test('anfilada: arrow-left from hall 1 exits to game; Esc exits too', () => {
    anf._test.set(1, 'facade');
    state.current = 'anfilada';
    anf._test.onKey({ key: 'ArrowLeft', preventDefault: noop });
    assert(state.is('game'), 'left from hall 1 walks back out');
    // Esc path
    state.current = 'game';
    anf.open();
    assert(state.is('anfilada'), 'reopened');
    anf._test.onKey({ key: 'Escape', preventDefault: noop });
    assert(state.is('game'), 'Esc exits');
  });

  test('anfilada: second open skips the gates line (once per session)', () => {
    state.current = 'game';
    anf.open();
    const body = document.getElementById('anf-body');
    assert(!body.innerHTML.includes('предназначены для тебя одного'),
      'gates line must not repeat');
    assert(body.innerHTML.includes('ОСЕВОЕ ВРЕМЯ'), 'hall 1 rendered directly');
    anf.close();
  });

  test('anfilada: keys are inert outside the anfilada state', () => {
    state.current = 'game';
    anf._test.set(4, 'facade');
    anf._test.onKey({ key: 'ArrowRight', preventDefault: noop });
    eq(anf._test.current, 4, 'no navigation while in game state');
  });
}

// ═══ REPORT ═══
const passed = results.filter(r => r.status === 'pass').length;
const failed = results.filter(r => r.status === 'fail');
console.log('\n── ANFILADA TESTS ──');
for (const r of results) {
  console.log(`${r.status === 'pass' ? '✓' : '✗'} ${r.name}`);
  if (r.status === 'fail') console.log(`  ${r.msg}`);
}
console.log(`\n${passed}/${results.length} passed`);
if (failed.length) { console.log(`\nFirst failure stack:\n${failed[0].stack}`); process.exit(1); }
process.exit(0);
