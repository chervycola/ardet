// ═══════════════════════════════════════
// ОСТУПИЛСЯ — иногда на ходу (не чаще раза в 120 с):
//   камень — полой цепляешь камень: клевок вперёд, камешек катится;
//   яма    — нога уходит в яму: проседаешь, дольше выбираешься;
//   какаха — наступаешь на окаменелую какаху: хруст, нога едет назад.
// Через миг в кармане вибрирует телефон (на телефоне — по-настоящему).
// Кто звонит — не сказано.
// ═══════════════════════════════════════
import { getCtx } from '../audio/audio.js';
import { inCore } from './disc.js';

const KINDS = { stone: { dur: 26, name: 'камень' }, pit: { dur: 50, name: 'яма' }, fossil: { dur: 32, name: 'окаменелая какаха' } };
const GAP = 7200;                    // не чаще раза в 120 с (кадров при 60 к/с)
let walked = 0, lastX = null, lastY = null, since = 0;
let need = 2000 + Math.random() * 4000;
let anim = 0, dur = 26, kind = 'stone', dir = 1, shake = 0, buzzAt = 0, cyc = -1;
const stones = [];                   // следы: камешки, ямы, окаменелости

function thud() {
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(110, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(48, ctx.currentTime + 0.12);
  g.gain.setValueAtTime(0.16, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
  o.connect(g); g.connect(ctx.destination);
  o.start(); o.stop(ctx.currentTime + 0.17);
  // камешек: сухой щелчок по земле
  const n = Math.floor(ctx.sampleRate * 0.03), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 6) * (i % 400 < 60 ? 1 : 0.3);
  const s = ctx.createBufferSource(), sg = ctx.createGain(); s.buffer = b; sg.gain.value = 0.12;
  s.connect(sg); sg.connect(ctx.destination); s.start(ctx.currentTime + 0.18);
}

function noise(ctx, sec, shape, type, freq, vol, at) {
  const n = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * shape(i / n, i);
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = b; f.type = type; f.frequency.value = freq; g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(ctx.destination); s.start(ctx.currentTime + (at || 0));
}
function pitSound() {
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(80, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(34, ctx.currentTime + 0.22);
  g.gain.setValueAtTime(0.2, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.26);
  o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.27);
  // земля осыпается следом
  noise(ctx, 0.5, k => Math.pow(1 - k, 2) * (0.4 + Math.random() * 0.6), 'lowpass', 700, 0.1, 0.12);
}
function fossilSound() {
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  // сухой хруст: несколько трещин подряд
  noise(ctx, 0.22, (k, i) => Math.pow(1 - k, 3) * ((i % 900) < 120 ? 1 : 0.15), 'highpass', 1800, 0.14);
  noise(ctx, 0.12, k => Math.pow(1 - k, 4), 'bandpass', 900, 0.08, 0.09);
}

function buzz() {
  try { if (navigator.vibrate) navigator.vibrate([40, 60, 40, 60, 90]); } catch (e) {}
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  // вибромотор в кармане: глухое жужжание двумя-тремя толчками
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260;
  const g = ctx.createGain(); g.gain.value = 0; lp.connect(g); g.connect(ctx.destination);
  const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 155; o.connect(lp);
  const t0 = ctx.currentTime;
  [[0, 0.16], [0.26, 0.16], [0.52, 0.28]].forEach(([a, l]) => {
    g.gain.setValueAtTime(0.0001, t0 + a); g.gain.linearRampToValueAtTime(0.09, t0 + a + 0.02);
    g.gain.setValueAtTime(0.09, t0 + a + l - 0.02); g.gain.linearRampToValueAtTime(0.0001, t0 + a + l);
  });
  o.start(t0); o.stop(t0 + 0.85);
}

export const stumble = {
  // вызывать раз в кадр до движения; true — пока спотыкаешься (ход заблокирован)
  update(player) {
    const px = player.x, py = player.y;
    since++;
    if (lastX !== null && player.moving && !inCore(px + 6, py + 24)) walked += Math.hypot(px - lastX, py - lastY);
    lastX = px; lastY = py;
    if (buzzAt && --buzzAt === 0) { buzz(); shake = 22; }
    if (shake > 0) shake--;
    for (let i = stones.length - 1; i >= 0; i--) {
      const s = stones[i];
      if (s.roll > 0) { s.x += s.vx; s.roll--; s.vx *= 0.9; }
      if (--s.life <= 0) stones.splice(i, 1);
    }
    if (anim > 0) { anim--; return true; }
    if (walked > need && since >= GAP && player.moving) { this.trigger(player); return true; }
    return false;
  },
  // k — вид (для проверки руками); без него — по жребию: камень чаще
  trigger(player, k) {
    walked = 0; since = 0; need = 2000 + Math.random() * 4000;
    const r = Math.random();
    kind = k || (r < 0.5 ? 'stone' : r < 0.75 ? 'pit' : 'fossil');
    dur = KINDS[kind].dur; anim = dur; dir = player.dir || 1;
    const fx = player.x + 6, fy = player.y + 23;
    if (kind === 'stone') { stones.push({ kind, x: fx + dir * 5, y: fy, vx: dir * 1.6, roll: 14, life: 900 }); thud(); }
    if (kind === 'pit') { stones.push({ kind, x: fx, y: fy + 1, vx: 0, roll: 0, life: 900 }); pitSound(); }
    if (kind === 'fossil') { stones.push({ kind, x: fx + dir * 8, y: fy + 1, vx: 0, roll: 0, life: 900 }); fossilSound(); }
    buzzAt = (kind === 'pit' ? 60 : 40) + (Math.random() * 30 | 0);
    return KINDS[kind].name;
  },
  // по очереди — для проверки руками
  cycle(player) { cyc = (cyc + 1) % 3; return this.trigger(player, ['stone', 'pit', 'fossil'][cyc]); },
  // смещение фигуры: камень — клевок вперёд; яма — просесть и выбраться; какаха — нога едет назад
  offset() {
    if (anim <= 0) return { x: 0, y: 0 };
    const k = 1 - anim / dur;
    if (kind === 'pit') {
      const p = k < 0.15 ? k / 0.15 : k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
      return { x: Math.round(dir * p), y: Math.round(5 * p) };
    }
    const p = k < 0.25 ? k / 0.25 : 1 - (k - 0.25) / 0.75;
    if (kind === 'fossil') return { x: Math.round(-dir * 3 * p), y: Math.round(p) };
    return { x: Math.round(dir * 3 * p), y: Math.round(2 * p) };
  },
  // дрожь кадра, пока жужжит телефон
  shake() { return shake > 0 ? { x: (shake % 4 < 2 ? 1 : -1), y: 0 } : { x: 0, y: 0 }; },
  // пока проседаешь в яму — её край рисуется поверх фигуры: ноги в яме
  drawFront(ctx) {
    if (anim <= 0 || kind !== 'pit') return;
    const s = stones[stones.length - 1];
    if (!s || s.kind !== 'pit') return;
    const x = Math.round(s.x), y = Math.round(s.y);
    ctx.fillStyle = '#0D0B0A'; ctx.fillRect(x - 6, y - 1, 13, 4);
    ctx.fillStyle = '#4A3426'; ctx.fillRect(x - 6, y + 3, 13, 1); ctx.fillRect(x - 7, y, 1, 2); ctx.fillRect(x + 7, y, 1, 2);
  },
  drawStones(ctx) {
    for (const s of stones) {
      const a = Math.min(1, s.life / 60), x = Math.round(s.x), y = Math.round(s.y);
      ctx.globalAlpha = a;
      if (s.kind === 'pit') {                       // яма: тёмный овал с кромкой
        ctx.fillStyle = '#0D0B0A'; ctx.fillRect(x - 5, y - 1, 11, 3); ctx.fillRect(x - 4, y - 2, 9, 5);
        ctx.fillStyle = '#4A3426'; ctx.fillRect(x - 5, y - 2, 1, 1); ctx.fillRect(x + 5, y - 2, 1, 1); ctx.fillRect(x - 3, y + 3, 7, 1);
      } else if (s.kind === 'fossil') {             // окаменелость: витой конус, умбра с костяным бликом
        ctx.fillStyle = '#0D0B0A'; ctx.fillRect(x - 3, y + 1, 7, 1);
        ctx.fillStyle = '#4A3426'; ctx.fillRect(x - 3, y - 1, 7, 2); ctx.fillRect(x - 2, y - 3, 5, 2); ctx.fillRect(x - 1, y - 5, 3, 2); ctx.fillRect(x, y - 6, 1, 1);
        ctx.fillStyle = '#8A8D8F'; ctx.fillRect(x - 2, y - 1, 5, 1); ctx.fillRect(x - 1, y - 3, 3, 1);
        ctx.fillStyle = '#D9CFB8'; ctx.fillRect(x - 1, y - 5, 1, 1);
        if (s.life > 840) { ctx.fillStyle = '#D9CFB8'; ctx.fillRect(x + 3, y - 2, 1, 1); ctx.fillRect(x - 4, y - 3, 1, 1); }   // крошки хруста
      } else {
        ctx.fillStyle = '#0D0B0A'; ctx.fillRect(x - 1, y + 1, 4, 1);
        ctx.fillStyle = '#8A8D8F'; ctx.fillRect(x - 1, y - 1, 3, 2);
        ctx.fillStyle = '#D9CFB8'; ctx.fillRect(x - 1, y - 1, 1, 1);
      }
    }
    ctx.globalAlpha = 1;
  },
};
