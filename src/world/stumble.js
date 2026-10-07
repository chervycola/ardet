// ═══════════════════════════════════════
// ОСТУПИЛСЯ — иногда на ходу полой цепляешь камень: рывок вперёд,
// пауза, камешек катится дальше и остаётся лежать. Через миг
// в кармане вибрирует телефон (на телефоне — по-настоящему).
// Кто звонит — не сказано.
// ═══════════════════════════════════════
import { getCtx } from '../audio/audio.js';
import { inCore } from './disc.js';

const DUR = 26;                      // кадров на рывок и выпрямление
let walked = 0, lastX = null, lastY = null;
let need = 3000 + Math.random() * 5000;
let anim = 0, dir = 1, shake = 0, buzzAt = 0;
const stones = [];

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
    if (walked > need && player.moving) { this.trigger(player); return true; }
    return false;
  },
  trigger(player) {
    walked = 0; need = 3000 + Math.random() * 5000;
    anim = DUR; dir = player.dir || 1;
    stones.push({ x: player.x + 6 + dir * 5, y: player.y + 23, vx: dir * 1.6, roll: 14, life: 900 });
    thud();
    buzzAt = 40 + (Math.random() * 30 | 0);
  },
  // смещение фигуры: клевок вперёд и вниз, потом выпрямиться
  offset() {
    if (anim <= 0) return { x: 0, y: 0 };
    const k = 1 - anim / DUR;
    const p = k < 0.25 ? k / 0.25 : 1 - (k - 0.25) / 0.75;
    return { x: Math.round(dir * 3 * p), y: Math.round(2 * p) };
  },
  // дрожь кадра, пока жужжит телефон
  shake() { return shake > 0 ? { x: (shake % 4 < 2 ? 1 : -1), y: 0 } : { x: 0, y: 0 }; },
  drawStones(ctx) {
    for (const s of stones) {
      const a = Math.min(1, s.life / 60);
      ctx.globalAlpha = a;
      ctx.fillStyle = '#0D0B0A'; ctx.fillRect(Math.round(s.x) - 1, Math.round(s.y) + 1, 4, 1);
      ctx.fillStyle = '#8A8D8F'; ctx.fillRect(Math.round(s.x) - 1, Math.round(s.y) - 1, 3, 2);
      ctx.fillStyle = '#D9CFB8'; ctx.fillRect(Math.round(s.x) - 1, Math.round(s.y) - 1, 1, 1);
    }
    ctx.globalAlpha = 1;
  },
};
