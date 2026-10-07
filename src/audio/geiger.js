// ═══════════════════════════════════════
// СЧЁТЧИК ГЕЙГЕРА — работает только там, где есть что мерить:
// токсичная окраина городка, ядовитые места, век катастроф, огонь,
// край, брейнрот. В чистых местах прибор молчит (громкость уходит плавно).
// Частота не ровная: идёт за токсичностью с инерцией (нарастает быстрее,
// спадает медленнее) и сама плывёт волнами. Изредка, не чаще раза
// в 120 с, — приступ: щелчки разгоняются и стихают.
// ═══════════════════════════════════════
import { getCtx } from './audio.js';

const VOL = 0.2;                     // общая громкость прибора (было 0.4)
const GAP = 120000;                  // приступ — не чаще раза в 120 с
let out = null, clickBuf = null, on = false;
let rate = 0;                        // текущая частота, щелчков в секунду
let drift = 1, driftV = 0;           // волна: медленно плывущий множитель
let surgeAt = 0, surgeLen = 0, surgePeak = 0, nextSurge = 0;

function setup() {
  const ctx = getCtx();
  if (!ctx) return null;
  if (!out) {
    out = ctx.createGain();
    out.gain.value = 0;
    out.connect(ctx.destination);
    // щелчок: 5 мс шума с резким спадом
    const n = Math.floor(ctx.sampleRate * 0.005);
    clickBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = clickBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
  }
  return ctx;
}

function click(ctx, when) {
  const src = ctx.createBufferSource();
  src.buffer = clickBuf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2400 + Math.random() * 1800;
  bp.Q.value = 0.9;
  const g = ctx.createGain();
  g.gain.value = 0.06 + Math.random() * 0.07;
  src.connect(bp); bp.connect(g); g.connect(out);
  src.start(when);
}

// tox: 0..1 у ног (0 — место чистое, прибор молчит); вызывать раз в кадр (60 к/с)
export function updateGeiger(tox, now = performance.now()) {
  const ctx = setup();
  if (!ctx || ctx.state !== 'running') return;

  // включён ли прибор здесь: плавный заход и уход громкости
  const want = tox > 0.05;
  if (want !== on) {
    on = want;
    out.gain.cancelScheduledValues(ctx.currentTime);
    out.gain.setTargetAtTime(on ? VOL : 0, ctx.currentTime, on ? 0.35 : 0.8);
  }

  // волна: случайное блуждание множителя 0.35..1.5, период — секунды
  driftV += (Math.random() - 0.5) * 0.004 - (drift - 0.9) * 0.0012;
  driftV *= 0.985;
  drift = Math.max(0.35, Math.min(1.5, drift + driftV));

  // приступ: разгон и спад по синусу, только там, где прибор работает
  if (!nextSurge) nextSurge = now + GAP * (1 + Math.random() * 0.5);
  if (on && now > nextSurge) {
    surgeAt = now; surgeLen = 3000 + Math.random() * 4000; surgePeak = 6 + Math.random() * 10;
    nextSurge = now + GAP + Math.random() * GAP;      // раз в 2–4 мин
  }
  let surge = 0;
  if (now - surgeAt < surgeLen) surge = Math.sin(Math.PI * (now - surgeAt) / surgeLen) * surgePeak;

  // цель — от токсичности; к ней с инерцией: вверх ~1,5 с, вниз ~3 с
  const target = on ? (0.3 + Math.pow(tox, 1.5) * 24) * drift + surge : 0;
  rate += (target - rate) * (target > rate ? 0.011 : 0.0055);
  if (rate < 0.02) { rate = 0; return; }

  // пуассон: сколько щелчков в этом кадре, и где внутри него
  const lam = rate / 60;
  let k = 0, p = Math.exp(-lam), s = p, u = Math.random();
  while (u > s && k < 8) { k++; p *= lam / k; s += p; }
  for (let i = 0; i < k; i++) click(ctx, ctx.currentTime + Math.random() / 60);
}
