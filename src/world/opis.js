// ═══════════════════════════════════════
// В ОПИСИ НЕ ЗНАЧИТСЯ (weave/DEPTH_GAMES_2026-11-16.md, механика 4, с правкой суда).
// В описи канцелярии на кольцо одна строка от руки: кольца 1–9 и городок, десять строк.
// Вписать можно только осмотренное — «хранить» (строка под штампом в окне осмотра, ui.js).
// Вписанное держит чернила; остальное в кольце от захода к заходу уходит к земле кольца
// (заход — сессия, в которой странник пробыл в кольце PRESENT тиков; отсутствие не платное,
// решение 16.11). Передумал — прежняя строка зачёркнута и читается, новая — со следующих
// суток мира (world/sky.js dayIndex; сутки хранятся в сохранении числом).
// Что настоящее, мир не помечает: строка одна и та же; вписанная подделка редеет к
// подпоркам и без взгляда (world/potemkin.js setRevealFloor), бережение держится.
// ═══════════════════════════════════════
import { nameOf } from './names.js';
import { placeOf } from './placeStamp.js';
import { RINGS } from './disc.js';
import { lookCount } from './relook.js';
import { seamOf, isTender } from './potemkin.js';
import { SEGMENTS } from '../content/ulitsa_db.js';

export const FADE = [0, 0.3, 0.45, 0.55];      // заходов в кольцо до этой сессии → доля к земле: второй — видно, третий — явно, с четвёртого — предел
export const THIN = [0, 0.35, 0.6, 0.8, 0.9];   // вписанная подделка: заходов после записи → проявленность без взгляда
export const PRESENT = 20;                     // тиков по 30 кадров в кольце (~10 с) — заход засчитан, раз за сессию
const PERSONS = new Set(['jester', 'sol', 'elder', 'nocturnal']);   // люди не вещи: в опись не вписываются
const WARM = new Set(['campfire', 'sol_home', 'lc_fire', 'gas_grate']);   // огонь не выцветает
// огонь — по тому же признаку, что у пера (main.js warmIn): тёплый свет вещи; «фонарь, горящий днём» — без света, но горит
const warmLit = loc => !!(loc.light && loc.light.color && loc.light.color[0] >= loc.light.color[1] + 30);
const burns = loc => WARM.has(loc.id) || loc.streetForm === 'fire' || loc.streetSprite === 'day_lantern' || warmLit(loc);
const TOWN_GROUND = '#2b231c';                                       // земля посёлка (render/etch.js, зона 4)
const N = RINGS + 1;

// r[кольцо] = { id, k — ключ места, name, d — сутки записи, v — заходов до записи, x: [{ id, name }] — зачёркнутое }
// v[кольцо] — засчитанные заходы
const st = { r: Array(N).fill(null), v: Array(N).fill(0) };
let prev = st.v.slice();                   // заходы до этой сессии: по ним бледность; в сессии она не меняется
let veils = [];
const here = Array(N).fill(0);
const ringMemo = new WeakMap();
const keyOf = loc => loc.streetKey || loc.id;   // st_N — номер по порядку табличек; ключ места надёжнее
// городок «вне времени» (placeStamp, канон): строка от руки у него есть, выцветания нет —
// бледнеет «в кольце» (слово механики); снять запрет — условие ниже
export const TOWN_FADES = false;
function rebuild() {
  veils = st.r.map((_, ring) => {
    if (ring === 0 && !TOWN_FADES) return null;
    const a = FADE[Math.min(prev[ring], FADE.length - 1)];
    const col = ring ? SEGMENTS[ring - 1].palette.ground : TOWN_GROUND;
    return a ? { a, col, rgb: [1, 3, 5].map(i => parseInt(col.slice(i, i + 2), 16)) } : null;
  });
}
rebuild();

// кольцо строки: 0 — городок, 1…9; -1 — вне описи (дом, изнанка, огонь, край, люди, записки сети)
export function opisRing(loc) {
  if (!loc || !loc.id || loc.net || PERSONS.has(loc.npc)) return -1;
  let r = ringMemo.get(loc);
  if (r === undefined) { const p = placeOf(loc); r = p && p.ring >= 0 && p.ring <= RINGS ? p.ring : -1; ringMemo.set(loc, r); }
  return r;
}
export function opisState(loc, today) {
  const ring = opisRing(loc);
  if (ring < 0) return null;
  const cur = st.r[ring];
  if (cur && today < cur.d) cur.d = today;   // ?phase= откатил часы: ждать от нынешнего утра, а не вечно
  return { ring, cur, mine: !!cur && cur.id === loc.id, open: !cur || today > cur.d };
}
export function inscribe(loc, today) {
  const s = opisState(loc, today);
  if (!s || s.mine || !s.open || lookCount(loc.id) < 1) return false;
  const x = s.cur ? [...s.cur.x, { id: s.cur.id, name: s.cur.name }] : [];
  st.r[s.ring] = { id: loc.id, k: keyOf(loc), name: String(nameOf(loc) || loc.name || ''), d: today, v: prev[s.ring], x };   // как записано сейчас (world/names.js)
  return true;
}
const kept = (loc, ring) => { const c = st.r[ring]; return !!c && c.id === loc.id; };
// вуаль к земле кольца на этот кадр (render/quiet.js drawQuiet); null — в чернилах
export function fadeOf(loc) {
  const ring = opisRing(loc);
  if (ring < 0 || burns(loc) || kept(loc, ring)) return null;
  return veils[ring];
}
// вписанная подделка редеет без взгляда — по заходам после записи; бережение и настоящее держатся
// по строке, а не по месту: рисунки городка спрашивают заглушкой { id } (sprites/locations/canon.js);
// городок «вне времени» — вписанная там подделка не редеет (как и не бледнеет ничто)
export function thinOf(loc) {
  if (!loc || !loc.id || !seamOf(loc) || isTender(loc)) return 0;
  const ring = st.r.findIndex(c => c && c.id === loc.id);
  if (ring < 0 || (ring === 0 && !TOWN_FADES)) return 0;
  return THIN[Math.max(0, Math.min(prev[ring] - st.r[ring].v, THIN.length - 1))];
}
// раз в 30 кадров — кольцо под ногами; true — заход засчитан
export function stepOpis(ring) {
  if (!(ring >= 0 && ring <= RINGS) || here[ring] < 0) return false;
  if (++here[ring] < PRESENT) return false;
  here[ring] = -1; st.v[ring]++;
  return true;
}

// строка под штампом: одна на окно, не пункт меню
const short = s => (s.length > 26 ? s.slice(0, 25).replace(/[\s.,:;—–-]+$/, '') + '…' : s);
export function opisLine(s, arm = false) {
  if (!s) return null;
  if (s.mine) return { text: 'в описи от руки: «хранить»', mine: true, act: false, cls: 'ink' };
  const X = s.cur ? `«${short(s.cur.name)}»` : '';
  if (!s.cur) return { text: arm ? `вписать? ${s.ring ? 'на кольцо' : 'на городок'} одна строка · ещё раз` : 'в описи не значится · вписать от руки: «хранить»', act: true, cls: 'act' };
  if (!s.open) return { text: `в описи от руки — ${X} · новая строка — с утра`, act: false, cls: 'off' };
  return { text: arm ? `зачеркнуть ${X}, вписать это? · ещё раз` : `в описи от руки — ${X} · вписать это вместо`, act: true, cls: 'act' };
}
// для описи (ui/inventory.js): 0 — городок, 1…9
export const opisLines = () => st.r.map((c, ring) => ({ ring, cur: c ? c.name : null, struck: c ? c.x.map(x => x.name) : [] }));

// мир собран: номер таблички мог переехать — строка идёт за ключом места
export function opisResolve(locations) {
  const byId = new Map(), byKey = new Map();
  for (const l of locations) if (l && l.id) { byId.set(l.id, l); byKey.set(keyOf(l), l); }
  for (const c of st.r) if (c) {
    const l = byId.get(c.id);
    if (!l || keyOf(l) !== c.k) { const m = byKey.get(c.k); c.id = m ? m.id : '?' + c.k; }
  }
}
export const saveOpis = () => JSON.parse(JSON.stringify(st));
// переписать имена в строках от руки: fn(id, имя) → имя. Сохранения до имён по знакомству (18.11)
// вписывали «Палатка Старца», «Равнина Лунного» — до знакомства там то, что видно сейчас
export function opisRename(fn) {
  for (const c of st.r) if (c) { c.name = fn(c.id, c.name); for (const e of c.x) e.name = fn(e.id, e.name); }
}
const int = (v, lo = 0) => (Number.isFinite(v) ? Math.max(lo, Math.floor(v)) : lo);
const str = v => (typeof v === 'string' ? v.slice(0, 120) : '');
export function loadOpis(d) {
  if (!d || typeof d !== 'object') return;
  for (let i = 0; i < N; i++) {
    st.v[i] = int(d.v && d.v[i]);
    const c = d.r && d.r[i];
    st.r[i] = c && str(c.id) ? { id: str(c.id), k: str(c.k) || str(c.id), name: str(c.name), d: int(c.d, -1e9), v: int(c.v),
      x: Array.isArray(c.x) ? c.x.slice(-30).filter(e => e && str(e.name)).map(e => ({ id: str(e.id), name: str(e.name) })) : [] } : null;
  }
  prev = st.v.slice(); here.fill(0); rebuild();   // загрузка — начало сессии
}
export function _resetOpis() { st.r.fill(null); st.v.fill(0); prev = st.v.slice(); here.fill(0); rebuild(); }
