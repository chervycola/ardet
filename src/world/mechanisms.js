// ═══════════════════════════════════════
// МЕХАНИЗМЫ — связи вместо анимаций: у каждого есть привод, звенья идут
// за ним по передаточному числу, а не по своим часам.
//   флюгер       — ветер: стрелка разворачивается навстречу ветру, с инерцией
//                  и перелётом, в порыв дёргается;
//   ветряк       — ветер: тяжёлый ротор разгоняется и выбегает не сразу,
//                  гондола медленно поворачивается к ветру; сбоку лопасти
//                  видно ребром, в лоб — кругом;
//   маховик      — пар: цилиндр крутит малый шкив, ремень — маховик; шкив
//                  быстрее во столько раз, во сколько он меньше (R/r); на
//                  каждый ход поршня — выдох пара из цилиндра;
//   часы вокзала — время: «железнодорожные» прыгают минутной стрелкой раз в
//                  минуту, «местные» идут плавно и отстают на свою долготу;
//   ворот        — странник: крутишь — ведро поднимается (пустое, лёгкое),
//                  наверху качается, потом падает назад — ворот раскручивается
//                  сам, внизу глухо: воды нет. У колодца у площади ведро
//                  тяжёлое, а ворот сам поскрипывает на пол-оборота, когда
//                  проходишь мимо (world/townWell.js).
// Считаются только видимые (как подвесы); ворот — пока работает.
// Внимание оживляет (world/attention.js): к знакомому страннику флюгер
// поворачивается сам, маховик прибавляет ход и выдыхает навстречу, вокзальные
// часы ждут — минутная не прыгает, пока он рядом; ворот кивает. Ветряк
// кольца «сейчас» отвечает только ветру — новое внимания не знает.
// ═══════════════════════════════════════
import { wind } from './wind.js';
import { emit } from '../render/particles.js';
import { getCtx, getOut } from '../audio/audio.js';
import { respond } from './attention.js';
import { getPlayer } from '../core/playerRef.js';

const REG = new Map();
let frame = 0;
const TAU = Math.PI * 2;
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

// касания: запекание построек (render/archbake.js) узнаёт по ним живое — механизм не запекают
let TOUCH = 0;
export const mechTouches = () => TOUCH;
function reg(key, kind, init) {
  TOUCH++;
  let m = REG.get(key);
  if (!m) { m = { kind, seen: frame, ...init }; REG.set(key, m); }
  m.seen = frame;
  return m;
}

// пиксельная линия
function line(ctx, col, x0, y0, x1, y1) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
  ctx.fillStyle = col;
  for (let i = 0; i <= n; i++) ctx.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1);
}

// ── звуки механизмов: тихо ──
function tick(freq, type, vol, len) {
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  const n = Math.floor(ctx.sampleRate * len), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 4);
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = b; f.type = type; f.frequency.value = freq; f.Q.value = 1.2; g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(getOut()); s.start();
}
function thud() {
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  const o = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime;
  o.type = 'sine'; o.frequency.setValueAtTime(90, t0); o.frequency.exponentialRampToValueAtTime(38, t0 + 0.18);
  g.gain.setValueAtTime(0.14, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
  o.connect(g); g.connect(getOut()); o.start(); o.stop(t0 + 0.23);
  tick(500, 'lowpass', 0.08, 0.12);                  // сухо: ни плеска, ни эха
}

// ═══ ФЛЮГЕР ═══
// стрелка — навстречу ветру (откуда дует), хвост — по ветру; сбоку видно
// её длину в проекции: на север и юг она смотрит почти точкой.
// gy — земля под флюгером: на странника он смотрит оттуда (высота шпиля на
// экране — не глубина мира, иначе стрелка ищет его в небе)
export function vane(ctx, key, x, y, col, head, gy = y) {
  const m = reg(key, 'vane', { a: wind.ang + Math.PI, w: 0, x, y, gy });
  m.x = x; m.y = y; m.gy = gy;
  const c = Math.cos(m.a), L = 3;
  const hx = Math.round(x + c * L), tx = Math.round(x - c * L);
  line(ctx, col, tx, y, hx, y);
  ctx.fillStyle = head; ctx.fillRect(hx, y, 1, 1);           // остриё
  ctx.fillStyle = col; ctx.fillRect(tx, y - 1, 1, 1);        // перо хвоста
  return m;
}
function stepVane(m) {
  const w = wind.at(m.x, m.y + 40);
  const r = respond(m.x, m.gy, getPlayer());
  const kw = r ? (r.lv === 2 ? 0.25 : 0.6) : 1;          // знакомый странник рядом — ветер ему уступает
  const d = wrap(wind.ang + Math.PI - m.a);
  m.w += kw * 0.004 * (0.25 + w.s) * Math.sin(d) - m.w * 0.06 + (Math.random() - 0.5) * 0.006 * w.s * kw;
  if (r) m.w += (r.lv === 2 ? 0.009 : 0.004) * Math.sin(wrap(Math.atan2(r.dy, r.dx) - m.a));   // остриём — на него
  m.a += m.w;
}

// ═══ ВЕТРЯК ═══
// ось ротора смотрит туда, откуда дует; лопасть в плоскости ротора видна
// на экране с долей −sin(yaw) по горизонтали: ветер вдоль экрана — ребром
export function rotor(ctx, key, hx, hy, R, col) {
  const m = reg(key, 'rotor', { th: Math.random() * TAU, om: 0, yaw: wind.ang + Math.PI, x: hx, y: hy });
  m.x = hx; m.y = hy;
  const ax = Math.cos(m.yaw), ux = -Math.sin(m.yaw);
  // гондола — позади ротора по оси
  const nl = 2 + Math.round(4 * Math.abs(ax));
  const nx = ax >= 0 ? hx - nl : hx;
  ctx.fillStyle = col.nac; ctx.fillRect(nx, hy - 1, nl + 1, 3);
  m.bx = ax >= 0 ? hx - nl + 1 : hx + nl - 1;                 // где на гондоле мигает огонь
  for (let k = 0; k < 3; k++) {
    const p = m.th + k * TAU / 3;
    line(ctx, col.blade, hx, hy, hx + R * Math.cos(p) * ux, hy - R * Math.sin(p));
  }
  ctx.fillStyle = col.hub; ctx.fillRect(hx - 1, hy - 1, 2, 2);
  return m;
}
// ветряк кольца «сейчас» — новое: отвечает ветру и графику, внимание его не касается
function stepRotor(m) {
  const w = wind.at(m.x, m.y + 70);
  const target = wind.ang + Math.PI;
  m.yaw += Math.max(-0.004, Math.min(0.004, wrap(target - m.yaw) * 0.01));
  const face = Math.max(0, Math.cos(wrap(target - m.yaw)));
  const want = 0.11 * Math.min(1.3, Math.max(0, w.s - 0.05)) * face;
  m.om += (want - m.om) * (want > m.om ? 0.006 : 0.0035);   // тяжёлый: разгон ~3 с, выбег ~5 с
  m.th += m.om;
}

// ═══ МАХОВИК СО ШКИВОМ ═══
// o: { R, r — радиусы маховика и шкива; puff — где выдыхает цилиндр (мир); gy — земля под ним }
export function flywheel(key, o) {
  const m = reg(key, 'fly', { th: 0, thp: 0, R: o.R, r: o.r, puff: o.puff });
  m.puff = o.puff; m.gy = o.gy !== undefined ? o.gy : o.puff && o.puff.y;
  return m;
}
function stepFly(m) {
  // знакомый странник подошёл — маховик выдыхает навстречу и прибавляет ход;
  // выдох — раз на подход: снова — только когда отошёл подальше (как подвесы, world/hang.js)
  const P = getPlayer();
  const r = m.puff ? respond(m.puff.x, m.gy, P) : null;
  if (r && !m.near) emit(m.puff.x, m.puff.y, 3 + r.lv * 2, { color: '#8A8D8F', speed: 0.3, life: 70, spread: 0.9, angle: -Math.PI / 2, windK: 0.9 });
  if (r) m.near = true;                             // отпускает stepMechs — и когда маховик за кадром
  // два хода поршня на оборот шкива: на каждом — толчок, между — провал
  const om = 0.035 * (1 + 0.12 * Math.sin(2 * m.thp)) * (r ? 1 + 0.3 * r.lv : 1);
  const prev = m.thp;
  m.th += om;
  m.thp += om * m.R / m.r;                          // ремень не проскальзывает: ωr = ωR·R/r
  if (Math.floor(m.thp / Math.PI) !== Math.floor(prev / Math.PI) && m.puff) {
    emit(m.puff.x, m.puff.y, 2, { color: '#8A8D8F', speed: 0.22, life: 55, spread: 0.7, angle: -Math.PI / 2, windK: 0.9 });
  }
}

// ═══ ЧАСЫ ВОКЗАЛА ═══
// время — настоящее, часов игрока; «железнодорожные» прыгают раз в минуту,
// «местные» идут плавно и отстают: солнце здесь встаёт по-своему
const LOCAL_LAG = 23;                                // минут
// знакомому страннику вокзальные часы слышны (на смене минуты — щелчок), а узнавшие
// его совсем — ждут: минутная не прыгает, пока он рядом; ушёл — догоняет разом
// часы помнят только пока на виду: не рисовались полсекунды (ушёл за кадр, сменил место) —
// вернувшегося встречают нынешней минутой, а не той, при которой он ушёл
const HOLD = new Map(), LASTMIN = new Map(), DRAWN = new Map();
export function stationClock(ctx, cx, cy, kind, col, gy = cy) {
  TOUCH++;                                       // стрелки идут — часы не запекают
  const d = new Date();
  let min = d.getHours() * 60 + d.getMinutes();
  if (kind === 'local') min += d.getSeconds() / 60 - LOCAL_LAG;
  else {
    const key = cx + ':' + cy, r = respond(cx, gy, getPlayer());     // рядом ли — по земле под часами, как флюгер
    const now = d.getTime();
    if (now - (DRAWN.get(key) || 0) > 500) { HOLD.delete(key); LASTMIN.delete(key); }
    DRAWN.set(key, now);
    if (r && LASTMIN.has(key) && LASTMIN.get(key) !== min && !HOLD.has(key)) tick(1800, 'bandpass', 0.03, 0.04);
    LASTMIN.set(key, min);
    if (r && r.lv === 2) { if (!HOLD.has(key)) HOLD.set(key, min); min = HOLD.get(key); }
    else HOLD.delete(key);
  }
  const am = (min % 60) / 60 * TAU, ah = ((min / 60) % 12) / 12 * TAU;
  line(ctx, col, cx, cy, cx + Math.sin(am) * 2.4, cy - Math.cos(am) * 2.4);
  line(ctx, col, cx, cy, cx + Math.sin(ah) * 1.5, cy - Math.cos(ah) * 1.5);
}

// ═══ ВОРОТ КОЛОДЦА ═══
// d — глубина ведра: 0 — под самым воротом, 1 — на дне. heavy — ведро тяжёлое
// (колодец у площади): идёт вверх вдвое медленнее, ворот скрипит ниже, наверху
// ведро висит дольше. onTop — что сделать, когда ведро пришло наверх
export function well(key, heavy = false) {
  const m = reg(key, 'well', { st: 'idle', d: 1, crank: 0, v: 0, top: 0, ph: 0, nod: 0, c0: 0 });
  if (heavy) m.heavy = true;
  return m;
}
export function crankWell(key, onTop = null) {
  const m = well(key);
  if (m.st === 'nod') { m.crank = m.c0; m.d = 1; m.st = 'idle'; }
  if (m.st !== 'idle') return false;
  m.st = 'wind'; m.onTop = onTop;
  return true;
}
// отпустить ворот: ведро наверху уходит вниз
export function dropWell(key) {
  const m = well(key);
  if (m.st !== 'top') return false;
  m.st = 'drop'; m.v = 0; m.hold = false;
  return true;
}
// сам поскрипывает на пол-оборота и обратно — как собака, поднявшая голову
export function nodWell(key) {
  const m = well(key);
  if (m.st !== 'idle') return false;
  m.st = 'nod'; m.nod = 0; m.c0 = m.crank;
  return true;
}
function stepWell(m) {
  if (m.st === 'wind') {                            // крутят: ведро идёт вверх, ворот скрипит
    const v = m.heavy ? 0.0038 : 0.0075, w = m.heavy ? 0.1 : 0.16;
    m.d = Math.max(0, m.d - v);
    m.crank += w;
    if (Math.floor(m.crank / Math.PI) !== Math.floor((m.crank - w) / Math.PI)) tick(m.heavy ? 390 : 620, 'bandpass', 0.05, m.heavy ? 0.1 : 0.06);
    if (m.d <= 0) {
      m.st = 'top'; m.top = 0; m.kick = true;
      if (m.onTop) { const f = m.onTop; m.onTop = null; f(); }
    }
  } else if (m.st === 'top') {                      // наверху: качается; ждёт, пока держат (hold)
    if (m.hold) m.top = 0;
    if (++m.top > (m.heavy ? 240 : 80)) { m.st = 'drop'; m.v = 0; }
  } else if (m.st === 'nod') {                      // пол-оборота вперёд, постоял, назад
    const k = ++m.nod / 70;
    const s = k < 0.4 ? Math.sin(k / 0.4 * Math.PI / 2) : k < 0.6 ? 1 : Math.cos((k - 0.6) / 0.4 * Math.PI / 2);
    m.crank = m.c0 + Math.PI * s;
    if (m.nod === 1) tick(330, 'bandpass', 0.045, 0.14);
    if (m.nod === 43) tick(290, 'bandpass', 0.03, 0.1);
    if (m.nod >= 70) { m.crank = m.c0; m.st = 'idle'; }
  } else if (m.st === 'drop') {                     // отпустили: падает, ворот раскручивается сам
    m.v = Math.min(0.03, m.v + 0.0009);
    m.d += m.v;
    m.crank -= m.v * 22;
    m.ph += m.v * 40;
    if (m.ph > 1) { m.ph = 0; tick(2600, 'highpass', 0.025, 0.03); }   // цепь гремит
    if (m.d >= 1) { m.d = 1; m.st = 'idle'; thud(); }
  }
}

export function stepMechs() {
  frame++;
  const P = getPlayer();
  for (const [k, m] of REG) {
    // простой колодец (не тот, что у площади: тот кивает всем) кивает знакомому страннику —
    // раз на подход: снова — только когда отошёл дальше 90
    if (m.kind === 'well' && !m.heavy && m.x !== undefined) {
      const r = respond(m.x, m.y, P, 60);
      if (r && !m.near && m.st === 'idle') { m.st = 'nod'; m.nod = 0; m.c0 = m.crank; }
      m.near = !!r || (m.near && !!P && Math.hypot(P.x + 6 - m.x, P.y + 20 - m.y) < 90);
    }
    // маховик отпускает «уже поздоровался», как только странник отошёл дальше 225, — и за кадром:
    // иначе ушедший из виду ближе этого остаётся «рядом» и на возвращение выдоха нет
    if (m.kind === 'fly' && m.near && m.puff && (!P || Math.hypot(P.x + 6 - m.puff.x, P.y + 20 - m.gy) >= 225)) m.near = false;
    const active = m.kind === 'well' && m.st !== 'idle';
    if (!active && frame - m.seen > 30) { if (frame - m.seen > 3600 && m.kind !== 'well') REG.delete(k); continue; }
    if (m.kind === 'vane') stepVane(m);
    else if (m.kind === 'rotor') stepRotor(m);
    else if (m.kind === 'fly') stepFly(m);
    else if (m.kind === 'well') stepWell(m);
  }
}
