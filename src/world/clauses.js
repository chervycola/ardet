// ═══════════════════════════════════════
// ПОСЛЕДНИЙ ПУНКТ (weave/DEPTH_GAMES_2026-11-16.md, механика 5). Шесть бумаг просят
// отметки или подписи (тексты — content/clauses.js); один из пяти пунктов говорит, что
// изменится, и исполняется буквально. Согласие — второй экземпляр в кармане: пока он
// при тебе, пункт действует. Отзыв — делом, не формой: дойти до костра городка и бросить
// экземпляр в огонь (второе действие костра; из меню, случайно не отзовёшь). От листа
// остаётся угол в пепле — с концом выдающего пункта. Число на бумаге не убывает.
//
// Строка на ходу: подписавшему ворота или баннер земля сообщает правду о мире (когда
// дождь, что выпало на сутки, смена света, очаг) вперемешку со словами ленты — только
// идущему, только наверху; остановился — смолкла, стоянием долга не копится (таблица
// покоя прежняя). «Будет ли строка» задано правилом, случайно только «что».
// Обещание (кольцо 4): подписавшему — дрова; прошёл мимо очага, не подложив, — на полях
// «не исполнено». Санкций нет. Сохраняется: сколько раз подписано, карман, угол в пепле,
// срок очага и пометки. Колода, счёт хода, сказанное — только на заход.
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { PAPERS, PAPER_IDS, HEARTH, BURN, fmt } from '../content/clauses.js';
import { free } from './recount.js';
import { ringAt, trailPoint, ringD } from './disc.js';
import { worldClock, phaseAt, dayIndex, nextLight, DAY_LEN } from './sky.js';
import { rainOutlook } from '../render/weather.js';
import { noonLot, noonFired, WIN0 } from './redNoon.js';
import { LENTA_WORDS, sayUnderfoot, lineBusy } from './idle.js';
import { hasSignature } from '../ui/signature.js';
import { addOffering } from '../core/sessionMemory.js';
import { playTone } from '../audio/audio.js';
import { drawPaper, drawHearth } from '../sprites/papers.js';

const SHORT = { gate: 'условия дороги', hearth: 'обещание', plan: 'подписной лист', pawn: 'квитанция', portik: 'корешок', banner: 'чек' };
const GAP = 1200, GAP_BANNER = 600, MIN_BETWEEN = 180, FRESH = 300;
const NEAR_FIRE = 150, AWAY_FIRE = 420;          // приход к очагу — как приход к коту

// сохраняемое: n — сколько раз подписано, p — карман (по порядку подписи), s — рукой ли
// (иначе крест), a — чей угол в пепле, h — очаг: u — до какого часа мира горит, x — «не исполнено»
const st = { n: {}, p: [], s: {}, a: null, h: { u: 0, x: 0 } };
let hand = null;                                  // экземпляр «в руке» (открыт в описи) — только заход
const visit = { on: false, fed: false };
let deck = [], cnt = 0, lastLine = -1e9, lastNoise = '', said = [], last = null, tick = 0;
let fire = null;                                  // очаг кольца 4 (место)

export const isOn = id => st.p.includes(id);
export const holdsCopies = () => st.p.length > 0;
export const pocket = () => st.p.slice();
export const signedTimes = id => st.n[id] || 0;
const total = () => PAPER_IDS.reduce((s, id) => s + (st.n[id] || 0), 0);
export const hearthLit = () => st.h.u > worldClock(t);
const hearthLeft = () => (st.h.u - worldClock(t)) * DAY_LEN;     // шагов до конца огня
export const ashTail = () => (st.a && PAPERS[st.a] ? PAPERS[st.a].tail : null);
// речь огня на седьмом приношении — только тому, у кого карманы пусты («Карманы давно пусты»)
export const fireSpeaks = (offerings, altar, holds = holdsCopies()) => offerings >= 7 && altar && !holds;

// ── бумага: текст и кнопка ──
function footOf(id) {
  const P = PAPERS[id];
  if (id === 'banner') return `Согласий получено: ${fmt(P.base + P.perDay * Math.max(0, dayIndex(t)) + total())}.`;
  return P.foot(st.n[id] || 0);
}
export function paperText(id) {
  const P = PAPERS[id], n = st.n[id] || 0;
  const body = P.clauses.map((c, i) => `${i + 1}. ${c}`).join('\n');
  const mark = P.mark(n, !!st.s[id]);
  let s = `${P.first}\n\n${body}\n\n${footOf(id)}${mark ? ' ' + mark : ''}`;
  if (id === 'hearth' && st.h.x) s += `\n\n${HEARTH.unkept(st.h.x)}`;
  return s;
}
const labelOf = id => (isOn(id) ? PAPERS[id].label.held : (st.n[id] || 0) > 0 ? PAPERS[id].label.again : PAPERS[id].label.sign);

// ── подпись и полено ──
export function useClause(id) {
  if (id === 'feed') {
    if (!isOn('hearth')) return null;
    const wasLit = hearthLit();
    st.h.u = worldClock(t) + 1;                   // сутки мира от последнего полена; поленья не копятся
    visit.on = true; visit.fed = true;            // подложил — значит, пришёл
    return { title: HEARTH.name, text: wasLit ? HEARTH.feedLit : HEARTH.feedCold };
  }
  const P = PAPERS[id];
  if (!P) return null;
  if (isOn(id)) return { title: P.name, text: P.said.held };
  const withHand = P.kind === 'sign' && hasSignature();
  st.n[id] = (st.n[id] || 0) + 1;
  st.p.push(id);
  if (P.kind === 'sign') st.s[id] = withHand;
  deck = [];                                      // колода — по карману
  if (id === 'gate' || id === 'banner') cnt = Math.max(cnt, gapNow() - FRESH);   // первая строка — через 5 с ходьбы
  if (id === 'hearth') { visit.on = true; visit.fed = true; }   // приход, в который подписал, исполнен
  const text = typeof P.said.sign === 'function' ? P.said.sign(withHand) : P.said.sign;
  return { title: P.name, text };
}

// ── костёр: второй экземпляр в огонь ──
export function burnLabel() {
  if (!st.p.length) return null;
  const one = hand && isOn(hand) ? hand : st.p.length === 1 ? st.p[0] : null;
  return one ? BURN.one(PAPERS[one].acc) : BURN.many;
}
export const burnChoice = () => (hand && isOn(hand) ? hand : st.p.length === 1 ? st.p[0] : null);
export const burnAsk = () => BURN.ask(st.p.map((id, i) => `${i + 1} ${SHORT[id]}`).join(' · '));
export function burnByNumber(v) {
  const i = parseInt(v, 10) - 1;
  return Number.isFinite(i) && st.p[i] ? burnCopy(st.p[i]) : null;
}
export function burnCopy(id) {
  if (!isOn(id)) return null;
  st.p = st.p.filter(x => x !== id);
  if (hand === id) hand = null;
  st.a = id;
  deck = [];
  addOffering();                                  // это тоже приношение — в счёт седьмого
  return { title: BURN.title, text: BURN.text(PAPERS[id].name, PAPERS[id].tail) };
}

// ── опись: вторые экземпляры (ui/inventory.js) ──
export function setHand(id) { if (isOn(id)) hand = id; }
export function copyLines() {
  return st.p.map(id => {
    const P = PAPERS[id];
    let line = P.copy;
    if (id === 'hearth' && st.h.x) line += ` На полях: не исполнено: ${st.h.x}.`;
    if (hand === id) line += ' — в руке';
    let text = paperText(id);
    if (P.back) text += `\n\n${P.back}`;
    return { id, line, title: P.name, text };
  });
}

// ── строка на ходу ──
const gapNow = () => (isOn('banner') ? GAP_BANNER : GAP);
const fit = s => {                                 // 28 знаков на строку (телефон, шрифт 8 px)
  if (s.includes('\n') || s.length <= 28) return s;
  const i = s.indexOf('. ') >= 0 ? s.indexOf('. ') + 1 : s.indexOf(': ') >= 0 ? s.indexOf(': ') + 1 : -1;
  return i > 0 ? s.slice(0, i) + '\n' + s.slice(i + 1) : s;
};
const secDown10 = steps => Math.floor(steps / 600) * 10;      // секунды вниз, до 10
const secUp10 = steps => Math.ceil(steps / 600) * 10;         // …вверх
function truthW() {
  const o = rainOutlook();
  if (o.kind === 'ends') {
    if (o.in <= 0) return null;
    const n = o.in >= 7200 ? `${Math.round(o.in / 3600)} мин` : `${secUp10(o.in)} с`;
    return { key: `W:r:${o.R}:${n}`, text: `дождь. кончится через ${n}` };
  }
  if (o.kind === 'none') {
    if (o.in < 600) return null;
    const n = o.in >= 3600 ? `${Math.floor(o.in / 3600)} мин` : `${secDown10(o.in)} с`;
    return { key: `W:w:${o.R}:${n}`, text: `дождя не будет ещё ${n}` };
  }
  if (o.kind === 'sandThenRain') return { key: `W:s:${o.S}`, text: `песок. дальше дождь\nчерез ${Math.max(1, Math.round(o.in / 60))} с` };
  return { key: `W:g:${o.R}`, text: 'дождь готов.\nв лесу и у озера — наверняка' };
}
function truthD() {
  const day = dayIndex(t), p = phaseAt(t);
  const say = (lot, head) => (lot ? `${head}\nкрасный полдень` : `${head}\nполдень как полдень`);
  if (p < WIN0 && noonLot(day) !== null && !noonFired(day)) return { key: `D:${day}`, text: say(noonLot(day), 'жребий суток:') };
  if (p >= 0.42 && noonLot(day + 1) !== null) return { key: `D:${day + 1}`, text: say(noonLot(day + 1), 'жребий на завтра:') };
  return null;
}
function truthL() {
  const L = nextLight(t);
  if (L.steps > 3600 || L.steps < 600) return null;
  return { key: `L:${dayIndex(t)}:${L.name}`, text: `${L.name} через ${secDown10(L.steps)} с` };
}
function truthDsoon() {
  const day = dayIndex(t), p = phaseAt(t), steps = Math.round((WIN0 - p) * DAY_LEN);
  if (!noonLot(day) || noonFired(day) || p >= WIN0 || steps > 3600 || steps < 600) return null;
  return { key: `Ds:${day}`, text: `красный полдень через ${secDown10(steps)} с` };
}
function truthH() {
  if (!isOn('hearth') || !hearthLit() || hearthLeft() > 7200) return null;
  return { key: `H:${st.h.u}`, text: 'очаг у дороги прогорает' };
}
const TRUTH = { W: truthW, D: truthD };
function buildDeck() {
  const tokens = [];
  if (isOn('gate')) tokens.push('W', 'W', 'D', '-', '-', '-', '-');
  if (isOn('banner')) tokens.push('W', 'D', '-', '-', '-', '-', '-', '-', '-', '-');
  for (let i = tokens.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [tokens[i], tokens[j]] = [tokens[j], tokens[i]]; }
  return tokens;
}
const fresh = tr => tr && !said.includes(tr.key);
function remember(key) { said.push(key); if (said.length > 32) said.shift(); }
function noise() {
  let w;
  do { w = LENTA_WORDS[Math.floor(Math.random() * LENTA_WORDS.length)]; } while (LENTA_WORDS.length > 1 && w === lastNoise);
  lastNoise = w;
  return w;
}
// одна строка слота: срочные правды раньше колоды; жетон без свежей правды уступает следующему
function slotLine() {
  const urgent = [];
  if (isOn('pawn') || isOn('banner')) urgent.push(truthL);
  if (isOn('banner')) urgent.push(truthDsoon, truthH);
  for (const f of urgent) { const tr = f(); if (fresh(tr)) { remember(tr.key); return tr.text; } }
  if (!isOn('gate') && !isOn('banner')) return null;          // у одной квитанции колоды нет
  for (let pass = 0; pass < 2; pass++) {
    if (!deck.length) deck = buildDeck();
    while (deck.length) {
      const tok = deck.shift();
      if (tok === '-') return noise();
      const tr = TRUTH[tok]();
      if (fresh(tr)) { remember(tr.key); return tr.text; }
    }
  }
  return null;
}
// шаг: main.js updateWorldSystems, только наверху (дом и изнанка — свои ветки) и только в игре
// (за бумагой не зовётся — счёт ждёт сам); ok — не красный полдень и не петля ленты
export function stepClauses(player, ok = true) {
  const x = player.x + 6, y = player.y + 22;
  const step = last ? Math.hypot(x - last.x, y - last.y) : 0;
  last = { x, y };
  // очаг: приход ближе 150, конец — дальше 420; ушёл без полена, пока обещал, — пометка
  if (fire && ++tick % 30 === 0) {
    const d = Math.hypot(x - (fire.x + fire.w / 2), y - (fire.y + fire.h));
    if (d < NEAR_FIRE) visit.on = true;
    else if (visit.on && d > AWAY_FIRE) {
      if (isOn('hearth') && !visit.fed) st.h.x++;
      visit.on = false; visit.fed = false;
    }
  }
  if (!ok || (!isOn('gate') && !isOn('banner') && !isOn('pawn'))) return;
  const walking = player.moving && step > 0.05 && step < 40;   // автоход в изгородь, перенос — не ход
  if (!walking) return;                                         // остановка — пауза, не сброс; долга нет
  cnt++;
  if (cnt < gapNow() || lineBusy() || t - lastLine < MIN_BETWEEN) return;
  cnt = 0;
  const line = slotLine();
  if (!line) return;
  sayUnderfoot(fit(line));
  lastLine = t;
  if (isOn('banner')) playTone(1320, 0.06, 'sine', 0.02);       // принявшему все — со звуком
}

// ── места ──
const OFFS = [];
for (const dy of [0, 22, -22, 44]) for (const dx of [26, -26, 44, -44, 62, -62, 84, -84]) OFFS.push([dx, dy]);
function placeNear(locations, anchor, w, h, offs = OFFS) {
  if (!anchor) return null;
  const ring = ringAt(anchor.x + anchor.w / 2, anchor.y + anchor.h);
  for (const [dx, dy] of offs) {
    const b = { x: Math.round(anchor.x + anchor.w / 2 + dx - w / 2), y: Math.round(anchor.y + anchor.h - h + dy), w, h };
    if (ringAt(b.x + w / 2, b.y + h) !== ring || !free(b, locations)) continue;
    return b;
  }
  return null;
}
function paperLoc(id, box) {
  const P = PAPERS[id];
  return {
    id: `lc_${id}`, name: P.name, zone: 'street', ...box, paper: id,
    get look() { return paperText(id); },
    useAction: `lc_${id}`,
    get useLabel() { return labelOf(id); },
    drawSelf: (ctx, loc) => drawPaper(ctx, loc, P.draw, st.n[id] || 0, isOn(id)),
  };
}
const byName = (locations, name, ring) => locations.find(l => l.name === name && (!ring || ringAt(l.x + l.w / 2, l.y + l.h) === ring));
export function buildClauses(locations) {
  const put = (id, box) => { if (box) locations.push(paperLoc(id, box)); };
  // городок, у Врат
  put('gate', placeNear(locations, locations.find(l => l.id === 'gates'), 14, 28));
  // кольцо 4, юг: очаг на тропе у «указателя назад», лист на гвозде рядом с ним
  const sign4 = byName(locations, 'указатель назад', 4);
  const fb = placeNear(locations, sign4, 26, 24);
  if (fb) {
    fire = fb;
    locations.push({
      id: 'lc_fire', name: HEARTH.name, zone: 'street', ...fb,
      get look() { return hearthLit() ? (hearthLeft() <= 7200 ? HEARTH.embers : HEARTH.lit) : HEARTH.cold; },
      useAction: 'lc_feed', useShown: () => isOn('hearth'), useLabel: '<i>≡</i>ПОДЛОЖИТЬ',
      altNow: () => (hearthLit() ? { key: 'lc_sit', label: '<i>⌂</i>СЕСТЬ' } : null),   // греться может всякий
      light: { r: 36, color: [226, 138, 58], flicker: 0.2, dy: 18, when: hearthLit },
      drawSelf: (ctx, loc, tt) => drawHearth(ctx, loc, hearthLit() ? (hearthLeft() <= 7200 ? 'embers' : 'lit') : 'cold', tt),
    });
    put('hearth', placeNear(locations, { x: fb.x, y: fb.y, w: fb.w, h: fb.h }, 10, 26,
      [[-24, 0], [26, 0], [-24, 14], [26, 14], [-40, 0], [42, 0], [0, 30], [0, -30]]));
  }
  put('plan', placeNear(locations, byName(locations, 'договор при печатне', 5), 14, 22));
  put('pawn', placeNear(locations, byName(locations, 'ломбард «МИНЕРВА»', 6), 12, 24));
  put('portik', placeNear(locations, byName(locations, 'киоск «Дейли-Портик»', 8), 12, 24));
  // кольцо 9, юг: растяжка поперёк южной тропы — последняя бумага перед огнём
  for (const d of [60, 80, 100, 40]) {
    const p = trailPoint('south', ringD(9, d)), b = { x: Math.round(p.x - 15), y: Math.round(p.y - 24), w: 30, h: 24 };
    if (ringAt(p.x, p.y) === 9 && free(b, locations)) { put('banner', b); break; }
  }
  // костёр городка: второе действие — экземпляр в огонь; к осмотру — угол в пепле
  const camp = locations.find(l => l.id === 'campfire');
  if (camp) {
    const prevAlt = camp.altNow;
    camp.altNow = () => (st.p.length ? { key: 'lc_burn', label: burnLabel() } : prevAlt ? prevAlt() : null);
    let base = camp.look;
    Object.defineProperty(camp, 'look', {
      get: () => (ashTail() ? `${base}\n\n${BURN.ash(ashTail())}` : base),
      set: v => { base = v; }, enumerable: true, configurable: true,
    });
  }
}
export const firePlace = () => fire;

// ── сохранение ──
export function saveClauses() { return JSON.parse(JSON.stringify(st)); }
export function loadClauses(d) {
  if (!d || typeof d !== 'object') return;
  st.n = {}; st.s = {};
  for (const id of PAPER_IDS) {
    if (d.n && Number.isFinite(d.n[id]) && d.n[id] > 0) st.n[id] = Math.floor(d.n[id]);
    if (d.s && d.s[id] !== undefined) st.s[id] = !!d.s[id];
  }
  st.p = Array.isArray(d.p) ? d.p.filter((id, i, a) => PAPERS[id] && a.indexOf(id) === i && st.n[id] > 0) : [];
  st.a = PAPERS[d.a] ? d.a : null;
  st.h = { u: d.h && Number.isFinite(d.h.u) ? d.h.u : 0, x: d.h && Number.isFinite(d.h.x) ? Math.max(0, Math.floor(d.h.x)) : 0 };
  deck = [];
}

// для тестов
export function _resetClauses() {
  st.n = {}; st.p = []; st.s = {}; st.a = null; st.h = { u: 0, x: 0 };
  hand = null; visit.on = false; visit.fed = false; deck = []; cnt = 0; lastLine = -1e9; lastNoise = ''; said = []; last = null; tick = 0;
}
export const _state = () => st;
export const _visit = () => visit;
export const _deckNow = () => (deck.length ? deck.slice() : buildDeck());
export const _cnt = () => cnt;
