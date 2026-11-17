// ═══════════════════════════════════════
// ВОРОНЫ — стаи на земле. Стоят в одних и тех же местах (сетка, по жребию:
// в гари гуще, у костра — никогда), клюют, перепрыгивают, держат дистанцию:
// идёшь на них — отпрыгивают. Бежишь, подошёл вплотную, упал, грянул гром —
// стая поднимается: одна, за ней остальные, по цепочке. У птицы есть
// высота — тень остаётся на земле и отстаёт от неё, чем выше она взлетела;
// ветер сносит стаю; садятся дальше от странника, планируя.
// Изредка (не чаще раза в 120 с) одиночка проходит высоко над головой.
// Звук: хлопанье крыльев на взлёте, карканье — тихо.
// Считаются только стаи рядом со странником; далёкие забываются и потом
// появляются на своих местах снова.
// Тише едешь (weave/DEPTH_GAMES_2026-11-16.md, механика 3): вошёл в круг стаи —
// у неё сторож, ближняя к страннику птица; сторона подхода выбирает его такт
// (сколько клевков в заходе, как долго держит голову). Ставку принимает тот, кто
// встал в круге; идущему мимо — прежние правила (отпрыгивают, взлетают и садятся
// рядом). Встал — клюёт: идёшь, к стае крадучись (клевок тихо слышно); поднял
// голову — стая по цепочке замирает, ближе подходить нельзя. Шаг под взглядом —
// стая уходит из виду и до смены света (день, сумерки, ночь, рассвет) не
// возвращается; свет сменился — прилетает домой по воздуху. Дошедшего (выстоял
// хотя бы один взгляд) перестают считать: у птиц в клювах видны вещи кольца,
// одна строка называет их. Ничего не хранится: умение остаётся в руке. Кот у
// стаи крадётся в тот же такт и всё равно мажет (silentCat.js).
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { hash } from '../render/draw.js';
import { wind } from './wind.js';
import { ringAt, inCore, RINGS } from './disc.js';
import { surfaceAt } from './surface.js';
import { getCtx, getOut } from '../audio/audio.js';
import { phaseAt, skyAt, dayIndex } from './sky.js';

const CELL = 480;
const NEAR = 560;          // ближе — стая живёт
const FORGET = 900;        // дальше от странника и дома — забыта
const LEASH = 700;         // от дома стая не улетает дальше
const BIRD = '#0D0B0A', SHEEN = '#8A8D8F';
const flocks = new Map();
const overs = [];          // пролёт над головой
let nextOver = 7200 + Math.floor(Math.random() * 7200), lastCaw = -99999, lastFlash = 0, grid = true;

// ── Тише едешь ──
const CIRCLE = 150;        // ближе к середине стаи — у неё сторож
const CIRCLE_OUT = 190;    // дальше — сторож снят, приход кончился
const REACH = 22;          // до сторожа ближе этого — дошёл
const GRACE = 15;          // поднял голову — столько кадров встать: на грани реакции, вернее считать клевки
const SNEAK = 0.9;         // в круге шаг к стае — крадучись (шаг 2,4 дошёл бы за один заход клевков)
const gone = new Map();    // стая ушла от шага под взглядом: ключ → свет, при котором ушла
const lightKey = () => dayIndex(t) + ':' + skyAt(phaseAt(t)).name;   // сутки сменяются на рассвете — ключ не рвётся посреди света
// 0 — не уходила; 1 — ушла, свет тот же; 2 — свет сменился: возвращается (по воздуху)
function goneState(key) {
  const g = gone.get(key);
  if (g === undefined) return 0;
  if (g === lightKey()) return 1;
  gone.delete(key);
  return 2;
}
// вернуться домой по воздуху — из-за дома, не из ничего на глазах
function flyHome(f, px, py) {
  const a = Math.atan2(f.hy - py, f.hx - px) + (Math.random() - 0.5) * 0.8;
  for (const b of f.birds) {
    b.x = f.hx + Math.cos(a) * 600 + (Math.random() - 0.5) * 30; b.y = f.hy + Math.sin(a) * 600 + (Math.random() - 0.5) * 20;
    b.st = 'fly'; b.z = 40; b.vx = 0; b.vy = 0; b.vz = 0; b.cruise = 40; b.near = 0; b.delay = -1; b.hop = null;
    b.ox = (Math.random() - 0.5) * 24; b.oy = (Math.random() - 0.5) * 10;
  }
  f.st = 'up'; f.tx = f.hx; f.ty = f.hy;
}
// дошёл — строка в ленту (main.js), одна на приход; голову подняли — автоход встаёт (main.js)
export const ravenNews = { say: null, look: false };
// что у птиц в клювах: вещи кольца, где стая живёт; цвет — пиксель у клюва
const BEAKS = {
  town: [['пуговица от пальто', '#8A8D8F'], ['жетон гардероба № 40', '#E28A3A'], ['ключ без брелока', '#8A8D8F'], ['крышка от кефира', '#b0a284']],
  1: [['черепок с половиной слова', '#3A3026'], ['косточка финика', '#3A3026'], ['бусина из сердолика', '#C23B2B'], ['щепка от весла', '#b0a284']],
  2: [['медная монета со стёртым до затылка профилем', '#E28A3A'], ['фибула без иглы', '#E28A3A'], ['косточка оливки', '#3A3026'], ['камешек от мозаики', '#8A8D8F']],
  3: [['свинцовая пломба паломника', '#8A8D8F'], ['обрезок пергамента с буквицей', '#b0a284'], ['бусина от чёток', '#D9CFB8'], ['гвоздь', '#8A8D8F']],
  4: [['черенок глиняной трубки', '#D9CFB8'], ['пуговица с гербом', '#E28A3A'], ['игральная кость со стёртой точкой', '#D9CFB8'], ['хлебная корка', '#3A3026']],
  5: [['литера «ять» из наборной кассы', '#8A8D8F'], ['сургучная крошка', '#C23B2B'], ['вырезанная ножницами сноска', '#b0a284'], ['пуговица от камзола', '#E28A3A']],
  6: [['заклёпка', '#8A8D8F'], ['ключ от карманных часов', '#E28A3A'], ['билет третьего класса', '#b0a284'], ['стекло от пенсне', '#D9CFB8']],
  7: [['гильза', '#E28A3A'], ['значок отличника', '#C23B2B'], ['жетон с номером', '#8A8D8F'], ['пуговица от шинели', '#8A8D8F']],
  8: [['крышка от «Пепси»', '#C23B2B'], ['жетон метро', '#E28A3A'], ['метр магнитной ленты', '#3A3026'], ['скрепка', '#8A8D8F']],
  9: [['SIM-карта', '#E28A3A'], ['кольцо от банки', '#8A8D8F'], ['один беспроводной наушник', '#D9CFB8'], ['чек на ноль рублей', '#b0a284']],
  fire: [['уголёк', '#E28A3A'], ['оплавленная пуговица', '#8A8D8F'], ['обгорелая спичка', '#3A3026']],
  edge: [['обрывок субтитров', '#b0a284'], ['скрепка', '#8A8D8F'], ['битый пиксель', '#C23B2B']],
};
function beaksOf(x, y) {
  const r = ringAt(x, y);
  return r === 0 ? BEAKS.town : r <= RINGS ? BEAKS[r] : r === RINGS + 1 ? BEAKS.fire : BEAKS.edge;
}

// ── звук ──
function flutter(vol) {                         // хлопанье крыльев: 4–5 коротких выдохов
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running' || vol < 0.002) return;
  const t0 = ctx.currentTime, n = 4 + (Math.random() < 0.5 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const len = Math.floor(ctx.sampleRate * 0.035), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (let j = 0; j < len; j++) d[j] = (Math.random() * 2 - 1) * Math.sin(Math.PI * j / len);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = b; f.type = 'bandpass'; f.frequency.value = 650 + Math.random() * 350; f.Q.value = 0.8;
    g.gain.value = vol * (1 - i * 0.15);
    s.connect(f); f.connect(g); g.connect(getOut()); s.start(t0 + i * 0.07);
  }
}
function caw(vol) {                             // «карр»: хрип, тон вниз; бывает дважды
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running' || vol < 0.002) return;
  const reps = Math.random() < 0.4 ? 2 : 1;
  for (let r = 0; r < reps; r++) {
    const t0 = ctx.currentTime + r * 0.32, f0 = 370 + Math.random() * 70;
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), rasp = ctx.createGain(), g = ctx.createGain();
    const am = ctx.createOscillator(), amg = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f0 * 1.08, t0); o.frequency.exponentialRampToValueAtTime(f0 * 0.84, t0 + 0.24);
    f.type = 'bandpass'; f.frequency.value = 1150; f.Q.value = 2.2;
    rasp.gain.value = 0.6; am.frequency.value = 46; amg.gain.value = 0.4;   // хрип: амплитуда дрожит
    am.connect(amg); amg.connect(rasp.gain);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.025);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.26);
    o.connect(f); f.connect(rasp); rasp.connect(g); g.connect(getOut());
    o.start(t0); o.stop(t0 + 0.28); am.start(t0); am.stop(t0 + 0.28);
  }
}
const near = (d, base) => base * Math.max(0, 1 - d / 380);

// ── места ──
function freeSpot(x, y, locations) {
  if (inCore(x, y)) return false;
  const sf = surfaceAt(x, y, locations);
  if (sf === 'swamp' || sf === 'water') return false;
  return !locations.some(l => x + 14 > l.x && x - 14 < l.x + l.w && y + 10 > l.y && y - 14 < l.y + l.h);
}
function chanceAt(x, y) {
  const r = ringAt(x, y);
  return r === 0 ? 0.2 : r <= RINGS ? 0.3 : r === RINGS + 1 ? 0.45 : 0.12;
}
function makeFlock(key, hx, hy, n, seed) {
  const birds = [];
  for (let k = 0; k < n; k++) {
    const x = hx + (hash(seed, k, 2.2) - 0.5) * 26, y = hy + (hash(seed, k, 3.3) - 0.5) * 12;
    birds.push({
      x, y, z: 0, vx: 0, vy: 0, vz: 0, st: 'ground', dir: hash(seed, k, 4.4) < 0.5 ? -1 : 1,
      next: 20 + Math.floor(hash(seed, k, 5.5) * 120), peck: 0, hop: null, delay: -1,
      flap: hash(seed, k, 6.6) * 6, glide: 0, ox: 0, oy: 0, cruise: 30, last: 1,
      // такт сторожа: клевок 14–22 кадра, в заходе от 2–3 до 3–5 клевков, голову держит 50–99
      per: 14 + Math.floor(hash(seed, k, 7.7) * 9), nLo: 0, nHi: 0, hold: 50 + Math.floor(hash(seed, k, 9.9) * 50),
      alert: false, fz: 0, show: false, item: Math.floor(hash(seed, k, 11.3) * 4),
    });
    const b = birds[k];
    b.nLo = 2 + Math.floor(hash(seed, k, 8.8) * 2); b.nHi = b.nLo + 1 + Math.floor(hash(seed, k, 10.1) * 2);
  }
  return { key, hx, hy, birds, st: 'calm', tx: hx, ty: hy, i: null, j: null,
    sentry: null, phase: 'bout', tm: 0, left: 0, lookT: 0, player: false, armed: false, looked: false, cat: false, tame: false, said: false, leave: null, pd: null, wx: hx, wy: hy };
}
function flockAt(i, j, locations, px, py) {
  const key = i * 100003 + j;
  const gs = goneState(key);
  if (gs === 1) return null;                                    // ушла от шага под взглядом — до смены света
  if (flocks.has(key)) return flocks.get(key);
  let f = { empty: true, i, j };
  const hx = i * CELL + 60 + hash(i, j, 7.1) * (CELL - 120), hy = j * CELL + 60 + hash(i, j, 8.3) * (CELL - 120);
  if (hash(i, j, 9.7) < chanceAt(hx, hy) && freeSpot(hx, hy, locations)) {
    f = makeFlock(key, hx, hy, 3 + Math.floor(hash(i, j, 1.9) * 5), i * 7 + j * 13);
    f.i = i; f.j = j;
    if (gs === 2) flyHome(f, px, py);
  }
  flocks.set(key, f);
  return f.empty ? null : f;
}

// ── взлёт ──
function center(f) {
  let x = 0, y = 0;
  for (const b of f.birds) { x += b.x; y += b.y; }
  return { x: x / f.birds.length, y: y / f.birds.length };
}
// куда сесть: прочь от странника, 200–320 точек, свободное место, на поводке у дома
function pickTarget(f, px, py, locations) {
  const c = center(f), base = Math.atan2(c.y - py, c.x - px);
  for (let k = 0; k < 10; k++) {
    const a = base + (Math.random() - 0.5) * (0.8 + k * 0.25), r = 200 + Math.random() * 120;
    const x = c.x + Math.cos(a) * r, y = c.y + Math.sin(a) * r;
    if (Math.hypot(x - f.hx, y - f.hy) > LEASH) continue;
    if (Math.hypot(x - px, y - py) < 160) continue;
    if (freeSpot(x, y, locations)) return { x, y };
  }
  return { x: f.hx, y: f.hy };                                  // некуда — домой
}
function startle(f, px, py, first, locations, d, far = false) {
  if (f.st !== 'calm') return;
  f.st = 'up'; f.thx = px; f.thy = py;                           // откуда угроза — прочь от неё
  f.sentry = null; f.player = false; f.armed = false; f.looked = false; f.cat = false; f.tame = false;
  for (const b of f.birds) { b.alert = false; b.show = false; }
  if (far || f.leave) {                                           // шаг под взглядом: уходят из виду, до смены света
    const c = center(f), base = Math.atan2(c.y - py, c.x - px);   // ушедшую спугнули снова — опять прочь, не домой
    let x = 0, y = 0;
    for (let k = 0; k < 12; k++) {
      const a = base + (Math.random() - 0.5) * (0.5 + k * 0.25), r = 560 + Math.random() * 160;
      x = c.x + Math.cos(a) * r; y = c.y + Math.sin(a) * r;
      if (freeSpot(x, y, locations)) break;
    }
    f.tx = x; f.ty = y; f.leave = f.leave || lightKey();
  } else {
    const tg = pickTarget(f, px, py, locations);
    f.tx = tg.x; f.ty = tg.y;
  }
  for (const b of f.birds) {
    b.delay = 1 + Math.round(Math.hypot(b.x - first.x, b.y - first.y) * 0.6 + Math.random() * 6);   // по цепочке
    b.ox = (Math.random() - 0.5) * 28; b.oy = (Math.random() - 0.5) * 14;
  }
  flutter(near(d, 0.05));
  if (far || Math.random() < 0.65) setTimeout(() => caw(near(d, 0.035)), 120 + Math.random() * 300);
}

// клевок сторожа — сухой щелчок о землю, у самого порога слуха: такт слышно и с закрытыми глазами
function tap(vol) {
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running' || vol < 0.001) return;
  const len = Math.floor(ctx.sampleRate * 0.012), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
  for (let j = 0; j < len; j++) d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (len * 0.2));
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = b; f.type = 'bandpass'; f.frequency.value = 1800 + Math.random() * 500; f.Q.value = 1.5; g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(getOut()); s.start();
}

// ── сторож ──
const boutOf = s => s.nLo + Math.floor(Math.random() * (s.nHi - s.nLo + 1));
function peckNow(f, s) {
  s.peck = 9;
  if (f.player) tap(near(Math.hypot(s.x - f.wx, s.y - f.wy), 0.014));
}
// ближняя к пришедшему птица — сторож; начинает с захода клевков (вошёл — не значит попался)
function engage(f, x, y) {
  let best = null, bd = 1e9;
  for (const b of f.birds) { if (b.st !== 'ground') continue; const d = Math.hypot(b.x - x, b.y - y); if (d < bd) { bd = d; best = b; } }
  if (!best) return;
  for (const o of f.birds) o.alert = false;                     // прерванный взгляд (кот стерёг) не висит над новым заходом
  f.sentry = best; f.phase = 'bout'; f.left = boutOf(best); f.tm = best.per; f.lookT = 0; f.wx = x; f.wy = y; f.pd = null;
  peckNow(f, best);
}
function disengage(f) {
  f.sentry = null; f.tame = false; f.pd = null;
  for (const b of f.birds) { b.alert = false; b.show = false; }
}
// такт: заход клевков → голову вверх (стая замирает по цепочке) → снова клюёт
function stepWatch(f) {
  const s = f.sentry;
  if (!s || s.st !== 'ground') { disengage(f); return; }
  if (f.tame) return;
  if (f.phase === 'bout') {
    if (--f.tm > 0) return;
    if (--f.left > 0) { f.tm = s.per; peckNow(f, s); return; }
    f.phase = 'look'; f.lookT = 0; f.tm = Math.round(s.hold * (0.8 + Math.random() * 0.4));
    if (f.player && f.armed) ravenNews.look = true;               // автоход встаёт, как у изгороди
    s.peck = 0; s.alert = true;
    for (const b of f.birds) if (b !== s) b.fz = 1 + Math.round(Math.hypot(b.x - s.x, b.y - s.y) * 0.5 + Math.random() * 4);
    return;
  }
  f.lookT++;
  s.dir = f.wx > s.x ? 1 : -1;                                   // смотрит на того, кто подходит
  if (--f.tm > 0) return;
  f.phase = 'bout'; f.left = boutOf(s); f.tm = s.per;
  if (f.player && f.armed) f.looked = true;                      // выстоял взгляд
  for (const b of f.birds) b.alert = false;
  peckNow(f, s);
}
// дошёл: перестали считать — в клювах видно, что несут; одна строка
function tame(f) {
  f.tame = true; f.phase = 'bout';
  const list = beaksOf(f.hx, f.hy), seen = [];
  for (const b of f.birds) {
    b.alert = false; b.show = true;
    const it = list[b.item % list.length];
    b.beak = it[1];
    if (!seen.includes(it[0])) seen.push(it[0]);
  }
  if (!f.said) {
    f.said = true;
    const names = seen.slice(0, 3);
    ravenNews.say = 'В клювах: ' + (names.length > 1 ? names.slice(0, -1).join(', ') + ' и ' + names[names.length - 1] : names[0]) + '.';
  }
}
function takeoff(b, px, py) {
  const a = Math.atan2(b.y - py, b.x - px) + (Math.random() - 0.5) * 1.0, s = 1.8 + Math.random() * 0.8;
  b.st = 'fly'; b.vx = Math.cos(a) * s; b.vy = Math.sin(a) * s * 0.6; b.vz = 1.4 + Math.random() * 0.5;
  b.cruise = 28 + Math.random() * 28; b.hop = null; b.peck = 0; b.near = 0;
}

// ── шаг одной птицы ──
function stepGround(b, f, px, py, ps, pvx, pvy) {
  const dx = b.x - px, dy = b.y - py, d = Math.hypot(dx, dy);
  if (b.delay > 0 && --b.delay === 0) { takeoff(b, f.thx, f.thy); return; }
  if (b.hop) {                                                   // прыжок: дугой, 12 шагов
    const h = b.hop;
    h.k++; b.x += h.dx / h.n; b.y += h.dy / h.n; b.z = 2.5 * Math.sin(Math.PI * h.k / h.n);
    if (h.k >= h.n) { b.hop = null; b.z = 0; }
    return;
  }
  if (b.peck > 0) b.peck--;
  if (f.sentry && !f.tame) {
    if (b === f.sentry) return;                                   // сторож живёт тактом (stepWatch)
    if (f.phase === 'look' && f.lookT >= b.fz) { b.alert = true; b.peck = 0; return; }   // замерла по цепочке
  }
  if (d < 90) b.dir = px > b.x ? 1 : -1;                         // смотрит на странника
  // идёт на птицу — отпрыгивает (держит дистанцию); в круге стаи — нет: там решает сторож
  if (!f.armed && ps > 0.5 && d < 55 && pvx * dx + pvy * dy > 0 && b.delay < 0) {
    const s = 4 + Math.random() * 2;
    b.hop = { k: 0, n: 12, dx: dx / d * s, dy: dy / d * s * 0.6 };
    b.dir = dx > 0 ? 1 : -1;
    return;
  }
  if (--b.next <= 0) {                                           // клюёт, прыгает, поворачивается
    const r = Math.random();
    if (r < 0.55) b.peck = 10;
    else if (r < 0.85) { const a = Math.random() * Math.PI * 2; b.hop = { k: 0, n: 12, dx: Math.cos(a) * 4, dy: Math.sin(a) * 2 }; b.dir = Math.cos(a) > 0 ? 1 : -1; }
    else b.dir = -b.dir;
    b.next = (d < 90 ? 90 : 40) + Math.floor(Math.random() * 140);
  }
}
function stepFly(b, f) {
  const tx = f.tx + b.ox, ty = f.ty + b.oy;
  const ex = tx - b.x, ey = ty - b.y, e = Math.hypot(ex, ey) || 1;
  // высота: набор, потом крейсер; у цели — планирует вниз
  if (e < 40) {
    const want = Math.max(0, (e - 3) * 0.9);
    b.z += (want - b.z) * 0.08; b.vz = 0;
    b.near = (b.near || 0) + 1;
  } else {
    b.z += b.vz;
    b.vz = b.z < b.cruise ? Math.max(0.15, b.vz * 0.97) : b.vz * 0.8;
  }
  // курс: к цели, с инерцией; у цели — сбавляет
  const sp = (2.4 + (b.cruise - 28) * 0.01) * Math.min(1, 0.25 + e / 40);
  b.vx += (ex / e * sp - b.vx) * 0.06;
  b.vy += (ey / e * sp - b.vy) * 0.06;
  const wk = 0.7 * Math.min(1, b.z / 20);                       // у земли ветер слабее: садятся против него
  b.x += b.vx + wind.x * wk;
  b.y += b.vy + wind.y * wk;
  if (Math.abs(b.vx) > 0.2) b.last = b.vx > 0 ? 1 : -1;
  // крылья: на подъёме часто, в крейсере — с планированием
  if (b.glide > 0) b.glide--;
  else {
    b.flap += b.z < b.cruise * 0.8 || e < 40 ? 0.55 : 0.32;
    if (b.z >= b.cruise * 0.8 && e > 60 && Math.random() < 0.012) b.glide = 20 + Math.floor(Math.random() * 30);
  }
  if ((e < 3.5 && b.z < 1.5) || b.near > 300) {                // сел (или наконец сел — после долгого захода)
    b.st = 'ground'; b.z = 0; b.vx = b.vy = 0; b.dir = b.last; b.near = 0; b.delay = -1;
    b.next = 30 + Math.floor(Math.random() * 60);
  }
}

// шум у странника — упал, гром: стаи в радиусе r поднимаются
// (fx, fy) — откуда угроза (прочь от неё и полетят); без них — от странника
const pending = [];
export function startleRavens(x, y, r, fx, fy) { pending.push({ x, y, r, fx, fy }); }

// ближайшая спокойная птица на земле — для кота
export function calmRavenNear(x, y, maxD) {
  let best = null;
  for (const f of flocks.values()) {
    if (f.empty || f.st !== 'calm') continue;
    for (const b of f.birds) {
      if (b.st !== 'ground') continue;
      const d = Math.hypot(b.x - x, b.y - y);
      if (d < maxD && (!best || d < best.d)) best = { b, f, d };
    }
  }
  return best;
}

// тише едешь: в круге стаи шаг к ней — крадучись; мимо, прочь и бегом — как шёл (бег пугает стаю)
export function ravenHush(px, py, dvx, dvy, running = false) {
  const v = Math.hypot(dvx, dvy);
  if (running || v <= SNEAK || v > 3) return 1;
  for (const f of flocks.values()) {
    if (f.empty || !f.armed || !f.sentry || f.tame || f.st !== 'calm') continue;
    const dx = f.sentry.x - px, dy = f.sentry.y - py, d = Math.hypot(dx, dy) || 1;
    if ((dvx * dx + dvy * dy) / (v * d) > 0.5) return SNEAK / v;   // к стае, в пределах 60°
  }
  return 1;
}

// кот у стаи крадётся в такт сторожа (silentCat.js): клюёт — идёт, поднял голову — замер
export function ravenWatch(f, x, y) {
  if (!f || f.empty || f.st !== 'calm' || f.leave) return false;
  if (!f.sentry) engage(f, x, y);
  f.cat = true;
  if (!f.player) { f.wx = x; f.wy = y; }
  return f.phase === 'look' && !f.tame;
}
export function ravenUnwatch(f) {
  if (!f || f.empty) return;
  f.cat = false;
  if (!f.player) disengage(f);
}

// стаи на своих местах всегда: у Гнезда Ворона — его стая
let anchors = null;
function anchorFlocks(locations, px, py) {
  if (!anchors) {
    anchors = [];
    const nest = locations.find(l => l.id === 'raven');
    if (nest) {
      for (const [ox, oy] of [[40, 30], [60, 10], [20, 50], [-40, 40]]) {
        const x = nest.x + nest.w + ox, y = nest.y + nest.h + oy;
        if (freeSpot(x, y, locations)) { anchors.push({ key: 'nest', x, y }); break; }
      }
    }
  }
  for (const a of anchors) {
    if (flocks.has(a.key)) continue;
    const gs = goneState(a.key);
    if (gs === 1 || Math.hypot(a.x - px, a.y - py) >= NEAR) continue;
    const f = makeFlock(a.key, a.x, a.y, 5, 77);
    if (gs === 2) flyHome(f, px, py);
    flocks.set(a.key, f);
  }
}

// шаг мира
export function stepRavens(player, locations, weather) {
  const px = player.x + 6, py = player.y + 22;
  const pvx = player.vx || 0, pvy = player.vy || 0, ps = Math.hypot(pvx, pvy);
  const run = ps > 3 || (player.running && ps > 1.2);           // бег — намерение (Shift), на любой земле
  // гром: вспышка молнии поднимает всех в округе
  const flash = weather && weather.lightning > 34;
  if (flash && !lastFlash) startleRavens(px, py, 420);
  lastFlash = flash ? 1 : 0;
  // стаи вокруг
  const ci = Math.floor(px / CELL), cj = Math.floor(py / CELL);
  if (grid) {
    for (let i = ci - 1; i <= ci + 1; i++) for (let j = cj - 1; j <= cj + 1; j++) flockAt(i, j, locations, px, py);
    anchorFlocks(locations, px, py);
  }
  for (const [key, f] of flocks) {
    if (f.empty) { if (Math.abs(f.i - ci) > 3 || Math.abs(f.j - cj) > 3) flocks.delete(key); continue; }
    const c = center(f), dc = Math.hypot(c.x - px, c.y - py);
    if (dc > FORGET && Math.hypot(f.hx - px, f.hy - py) > FORGET) { if (f.leave) gone.set(key, f.leave); flocks.delete(key); continue; }
    if (f.leave && f.birds.every(b => Math.hypot(b.x - px, b.y - py) > 420)) { gone.set(key, f.leave); flocks.delete(key); continue; }
    // вышел из круга (или перенёсся: ворота, лестница) — сторож снят; до отсечки дальних
    if (f.player && dc > CIRCLE_OUT) {
      f.player = false; f.armed = false; f.looked = false; f.said = false;
      if (f.cat) { f.tame = false; f.pd = null; for (const b of f.birds) b.show = false; } else disengage(f);
    }
    if (dc > NEAR && f.st !== 'up') continue;                    // летящие (и те, что возвращаются домой) — летят и вдали
    // вошёл — сторож: ближняя к нему птица, свой заход клевков (и если стерёг кот)
    if (f.st === 'calm' && !f.leave) {
      if (!f.player && dc < CIRCLE) { f.player = true; f.wx = px; f.wy = py; engage(f, px, py); }
      if (f.player && !f.armed && ps < 0.05) f.armed = true;     // встал в круге — принял ставку
    }
    // тревога: бегущий, шум; не принявшему ставку — ещё вплотную и идущий прямо
    if (f.st === 'calm') {
      for (const b of f.birds) {
        const dx = b.x - px, dy = b.y - py, d = Math.hypot(dx, dy);
        const loud = pending.find(q => Math.hypot(b.x - q.x, b.y - q.y) < q.r);
        if ((!f.armed && (d < 30 || (ps > 1.2 && d < 50 && pvx * dx + pvy * dy > 0))) || (run && d < 95) || loud) {
          const from = loud && loud.fx !== undefined ? loud : null;      // угроза не от странника — кот
          startle(f, from ? from.fx : px, from ? from.fy : py, b, locations, d);
          break;
        }
      }
    }
    // такт сторожа; у странника в круге — шаг под взглядом и «дошёл»
    if (f.st === 'calm' && f.sentry) {
      if (f.player) { f.wx = px; f.wy = py; }
      stepWatch(f);
      if (f.armed && f.sentry && !f.tame) {
        const ds = Math.hypot(f.sentry.x - px, f.sentry.y - py);
        if (ds < REACH && f.looked) tame(f);
        else if (f.phase === 'look' && f.lookT > GRACE && f.pd !== null && f.pd - ds > 0.25 && ps > 0.2 && player.moving !== false) {   // снос лентой — не шаг
          startle(f, px, py, f.sentry, locations, ds, true);        // шаг под взглядом
        }
        f.pd = ds;
      }
    }
    let up = 0;
    for (const b of f.birds) {
      if (b.st === 'ground') stepGround(b, f, px, py, ps, pvx, pvy); else { stepFly(b, f); up++; }
    }
    if (f.st === 'up' && !up && f.birds.every(b => b.delay <= 0)) f.st = 'calm';
    // редкое карканье с земли — не чаще раза в 120 с
    if (f.st === 'calm' && dc < 260 && t - lastCaw > 7200 && Math.random() < 0.0015) { lastCaw = t; caw(near(dc, 0.016)); }
  }
  pending.length = 0;
  // пролёт над головой: одиночка или пара, высоко, по ветру
  if (--nextOver <= 0) {
    nextOver = 7200 + Math.floor(Math.random() * 7200);
    const n = Math.random() < 0.35 ? 2 : 1, a = wind.ang + (Math.random() - 0.5) * 0.8;
    const ux = Math.cos(a), uy = Math.sin(a), sx = px - ux * 380, sy = py - uy * 260;
    for (let k = 0; k < n; k++) {
      overs.push({ x: sx - ux * k * 18 + (Math.random() - 0.5) * 30, y: sy - uy * k * 18 + (Math.random() - 0.5) * 30,
        z: 60 + Math.random() * 25, vx: ux * (1.7 + Math.random() * 0.4), vy: uy * (1.2 + Math.random() * 0.3),
        flap: Math.random() * 6, glide: 0, last: ux >= 0 ? 1 : -1, life: 900, cawAt: Math.random() < 0.5 ? 150 + Math.floor(Math.random() * 200) : -1 });
    }
  }
  for (let i = overs.length - 1; i >= 0; i--) {
    const o = overs[i];
    o.x += o.vx + wind.x * 0.5; o.y += o.vy + wind.y * 0.5;
    if (o.glide > 0) o.glide--; else { o.flap += 0.3; if (Math.random() < 0.01) o.glide = 30 + Math.floor(Math.random() * 40); }
    if (--o.cawAt === 0) caw(near(Math.hypot(o.x - px, o.y - py), 0.02));
    if (--o.life <= 0) overs.splice(i, 1);
  }
}

// ── рисунок ──
// птицы на земле в кадре — для общего порядка рисования (глубина — лапы)
export function ravensOnGround(camX, camY, vw, vh) {
  const out = [];
  for (const f of flocks.values()) {
    if (f.empty) continue;
    for (const b of f.birds) if (b.st === 'ground' && b.x > camX - 8 && b.x < camX + vw + 8 && b.y > camY - 8 && b.y < camY + vh + 8) out.push(b);
  }
  return out;
}
export const ravenDepth = b => b.y + 2;

// на земле — сбоку, клюв по взгляду; клюёт — голова вниз
export function drawRaven(ctx, b) {
  const x = Math.round(b.x), y = Math.round(b.y - b.z), D = b.dir;
  const at = (dx, dy, w = 1) => ctx.fillRect(D > 0 ? x + dx : x - dx - (w - 1), y + dy, w, 1);
  ctx.globalAlpha = 0.3; ctx.fillStyle = BIRD;                   // тень
  ctx.fillRect(Math.round(b.x) - 3, Math.round(b.y) + 2, 6, 1);
  ctx.globalAlpha = 1;
  at(-3, 0, 5);                                                  // тело — от хвоста к груди
  let bx = 4, by = -2;                                           // где кончик клюва (для вещи в нём)
  if (b.peck > 0) { at(-1, -1, 3); at(2, 0); at(3, 1); at(-4, -1); bx = 4; by = 1; }   // клюёт: голова к земле, хвост вверх
  else if (b.alert) { at(-1, -1, 4); at(1, -2); at(1, -3, 2); at(3, -3); at(-3, 1); by = -3; }   // голова поднята, шея вытянута
  else { at(-1, -1, 4); at(1, -2, 2); at(3, -2); at(-3, 1); }    // спина, голова, клюв, хвост вниз
  if (!b.hop) { at(-1, 1); at(1, 1); }                           // лапы
  if (b.show && b.beak) { ctx.fillStyle = b.beak; at(bx, by); ctx.fillStyle = BIRD; }   // дошёл: видно, что в клюве
  ctx.globalAlpha = 0.5; ctx.fillStyle = SHEEN; at(-1, -1, 2);   // отлив пера на спине
  ctx.globalAlpha = 1;
}

// в воздухе — силуэт с крыльями: вверх, ровно, вниз; кончики перьев ловят
// свет (отлив пеплом) — иначе чёрную птицу над тёмной землёй не видно
function drawFlyer(ctx, x, y, flap, gliding) {
  const ph = gliding ? 1 : Math.floor(((flap % 6) + 6) % 6 / 2);   // 0 вверх, 1 ровно, 2 вниз
  const tipY = ph === 0 ? y - 2 : ph === 1 ? y : y + 2;
  ctx.fillStyle = BIRD;
  ctx.fillRect(x - 1, y, 3, 1);                                  // тело
  if (ph === 0) { ctx.fillRect(x - 2, y - 1, 1, 1); ctx.fillRect(x + 2, y - 1, 1, 1); }
  else if (ph === 1) { ctx.fillRect(x - 2, y, 1, 1); ctx.fillRect(x + 2, y, 1, 1); }
  else { ctx.fillRect(x - 2, y + 1, 1, 1); ctx.fillRect(x + 2, y + 1, 1, 1); }
  ctx.globalAlpha = 0.7; ctx.fillStyle = SHEEN;                  // кончики крыльев
  ctx.fillRect(x - 3, tipY, 1, 1); ctx.fillRect(x + 3, tipY, 1, 1);
  ctx.globalAlpha = 1;
}
function eachFlyer(fn) {
  for (const f of flocks.values()) if (!f.empty) for (const b of f.birds) if (b.st === 'fly') fn(b, false);
  for (const o of overs) fn(o, true);
}
// тени летящих — на земле, до построек (постройки их накрывают)
export function drawRavenShadows(ctx, camX, camY, vw, vh) {
  ctx.fillStyle = BIRD;
  eachFlyer(b => {
    if (b.x < camX - 10 || b.x > camX + vw + 10 || b.y < camY - 10 || b.y > camY + vh + 10) return;
    const k = Math.max(0, 1 - b.z / 110);
    ctx.globalAlpha = 0.28 * k;
    const w = b.z > 40 ? 3 : 5;
    ctx.fillRect(Math.round(b.x) - (w >> 1), Math.round(b.y) + 2, w, 1);
  });
  ctx.globalAlpha = 1;
}
// летящие — поверх всего: они в воздухе
export function drawRavensAir(ctx, camX, camY, vw, vh) {
  eachFlyer(b => {
    const x = Math.round(b.x), y = Math.round(b.y - b.z);
    if (x < camX - 10 || x > camX + vw + 10 || y < camY - 10 || y > camY + vh + 10) return;
    drawFlyer(ctx, x, y, b.flap, b.glide > 0);
  });
}

// для тестов
export function _reset(g = true) { flocks.clear(); overs.length = 0; pending.length = 0; grid = g; nextOver = 1e9; lastFlash = 0; anchors = null; gone.clear(); ravenNews.say = null; ravenNews.look = false; }
export const _BEAKS = BEAKS;
export const _gone = () => gone;
export const _T = { CIRCLE, CIRCLE_OUT, REACH, GRACE, SNEAK };
export function _spawn(x, y, n) { const k = -1 - flocks.size, f = makeFlock(k, x, y, n, 1); flocks.set(k, f); return f; }
export const _flocks = () => flocks;
