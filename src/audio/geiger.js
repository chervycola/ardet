// ═══════════════════════════════════════
// СЧЁТЧИК ГЕЙГЕРА — щелчки, частота растёт с токсичностью места.
// Иногда трещит и там, где чисто: прибор старый, фон — везде.
// ═══════════════════════════════════════
import { getCtx } from './audio.js';

let out = null, clickBuf = null;
let episodeUntil = 0, episodeRate = 0, nextEpisode = 0;

function setup() {
  const ctx = getCtx();
  if (!ctx) return null;
  if (!out) {
    out = ctx.createGain();
    out.gain.value = 0.4;
    out.connect(ctx.destination);
    // щелчок: 5 мс шума с резким спадом
    const n = Math.floor(ctx.sampleRate * 0.005);
    clickBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = clickBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
  }
  return ctx;
}

function click(when) {
  const ctx = setup();
  if (!ctx || ctx.state !== 'running') return;
  const src = ctx.createBufferSource();
  src.buffer = clickBuf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2400 + Math.random() * 1800;
  bp.Q.value = 0.9;
  const g = ctx.createGain();
  g.gain.value = 0.07 + Math.random() * 0.09;
  src.connect(bp); bp.connect(g); g.connect(out);
  src.start(when);
}

// tox: 0..1 у ног; вызывать раз в кадр (60 к/с)
export function updateGeiger(tox, now = performance.now()) {
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  // фоновые приступы: раз в полторы-четыре минуты, пару секунд
  if (!nextEpisode) nextEpisode = now + 40000 + Math.random() * 60000;
  if (now > nextEpisode) {
    episodeUntil = now + 1500 + Math.random() * 2500;
    episodeRate = 2 + Math.random() * 6;
    nextEpisode = now + 90000 + Math.random() * 150000;
  }
  let rate = tox > 0.04 ? 0.4 + Math.pow(tox, 1.5) * 28 : 0;      // щелчков в секунду
  if (now < episodeUntil) rate = Math.max(rate, episodeRate);
  if (rate <= 0) return;
  // пуассон: сколько щелчков в этом кадре, и где внутри него
  const lam = rate / 60;
  let k = 0, p = Math.exp(-lam), s = p, u = Math.random();
  while (u > s && k < 8) { k++; p *= lam / k; s += p; }
  for (let i = 0; i < k; i++) click(ctx.currentTime + Math.random() / 60);
}
