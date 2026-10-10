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
//                  сам, внизу глухо: воды нет.
// Считаются только видимые (как подвесы); ворот — пока работает.
// ═══════════════════════════════════════
import { wind } from './wind.js';
import { emit } from '../render/particles.js';
import { getCtx } from '../audio/audio.js';

const REG = new Map();
let frame = 0;
const TAU = Math.PI * 2;
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

function reg(key, kind, init) {
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
  s.connect(f); f.connect(g); g.connect(ctx.destination); s.start();
}
function thud() {
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  const o = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime;
  o.type = 'sine'; o.frequency.setValueAtTime(90, t0); o.frequency.exponentialRampToValueAtTime(38, t0 + 0.18);
  g.gain.setValueAtTime(0.14, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
  o.connect(g); g.connect(ctx.destination); o.start(); o.stop(t0 + 0.23);
  tick(500, 'lowpass', 0.08, 0.12);                  // сухо: ни плеска, ни эха
}

// ═══ ФЛЮГЕР ═══
// стрелка — навстречу ветру (откуда дует), хвост — по ветру; сбоку видно
// её длину в проекции: на север и юг она смотрит почти точкой
export function vane(ctx, key, x, y, col, head) {
  const m = reg(key, 'vane', { a: wind.ang + Math.PI, w: 0, x, y });
  m.x = x; m.y = y;
  const c = Math.cos(m.a), L = 3;
  const hx = Math.round(x + c * L), tx = Math.round(x - c * L);
  line(ctx, col, tx, y, hx, y);
  ctx.fillStyle = head; ctx.fillRect(hx, y, 1, 1);           // остриё
  ctx.fillStyle = col; ctx.fillRect(tx, y - 1, 1, 1);        // перо хвоста
  return m;
}
function stepVane(m) {
  const w = wind.at(m.x, m.y + 40);
  const d = wrap(wind.ang + Math.PI - m.a);
  m.w += 0.004 * (0.25 + w.s) * Math.sin(d) - m.w * 0.06 + (Math.random() - 0.5) * 0.006 * w.s;
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
// o: { R, r — радиусы маховика и шкива; puff — где выдыхает цилиндр (мир) }
export function flywheel(key, o) {
  const m = reg(key, 'fly', { th: 0, thp: 0, R: o.R, r: o.r, puff: o.puff });
  m.puff = o.puff;
  return m;
}
function stepFly(m) {
  // два хода поршня на оборот шкива: на каждом — толчок, между — провал
  const om = 0.035 * (1 + 0.12 * Math.sin(2 * m.thp));
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
export function stationClock(ctx, cx, cy, kind, col) {
  const d = new Date();
  let min = d.getHours() * 60 + d.getMinutes();
  if (kind === 'local') min += d.getSeconds() / 60 - LOCAL_LAG;
  const am = (min % 60) / 60 * TAU, ah = ((min / 60) % 12) / 12 * TAU;
  line(ctx, col, cx, cy, cx + Math.sin(am) * 2.4, cy - Math.cos(am) * 2.4);
  line(ctx, col, cx, cy, cx + Math.sin(ah) * 1.5, cy - Math.cos(ah) * 1.5);
}

// ═══ ВОРОТ КОЛОДЦА ═══
// d — глубина ведра: 0 — под самым воротом, 1 — на дне
export function well(key) {
  return reg(key, 'well', { st: 'idle', d: 1, crank: 0, v: 0, top: 0, ph: 0 });
}
export function crankWell(key) {
  const m = well(key);
  if (m.st !== 'idle') return false;
  m.st = 'wind';
  return true;
}
function stepWell(m) {
  if (m.st === 'wind') {                            // крутят: ведро идёт вверх, ворот скрипит
    m.d = Math.max(0, m.d - 0.0075);
    m.crank += 0.16;
    if (Math.floor(m.crank / Math.PI) !== Math.floor((m.crank - 0.16) / Math.PI)) tick(620, 'bandpass', 0.05, 0.06);
    if (m.d <= 0) { m.st = 'top'; m.top = 0; m.kick = true; }
  } else if (m.st === 'top') {                      // наверху: пустое, качается
    if (++m.top > 80) { m.st = 'drop'; m.v = 0; }
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
  for (const [k, m] of REG) {
    const active = m.kind === 'well' && m.st !== 'idle';
    if (!active && frame - m.seen > 30) { if (frame - m.seen > 3600 && m.kind !== 'well') REG.delete(k); continue; }
    if (m.kind === 'vane') stepVane(m);
    else if (m.kind === 'rotor') stepRotor(m);
    else if (m.kind === 'fly') stepFly(m);
    else if (m.kind === 'well') stepWell(m);
  }
}
