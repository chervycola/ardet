// ═══════════════════════════════════════
// AUDIO — Web Audio API wrapper
// ═══════════════════════════════════════

let ctx = null;
let masterGain = null;

export function initAudio() {
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);
  } catch (e) {
    console.warn('[audio] not supported');
  }
}

export function getCtx() { return ctx; }

// Resume on user gesture (autoplay policies)
export function resumeAudio() {
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

// Simple tone
export function playTone(freq, duration = 0.2, type = 'sine', volume = 0.03) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

// Pickup sound
export function playPickup() {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 800;
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
  const gain = ctx.createGain();
  gain.gain.value = 0.04;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

// Ход мха: стук сердца — глухое «тук-тук», раз в секунду
export function playHeart() {
  if (!ctx) return;
  const t0 = ctx.currentTime;
  for (const [dt, f, v] of [[0, 64, 0.05], [0.16, 54, 0.032]]) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f, t0 + dt);
    o.frequency.exponentialRampToValueAtTime(f * 0.62, t0 + dt + 0.13);
    g.gain.setValueAtTime(0.0001, t0 + dt);
    g.gain.exponentialRampToValueAtTime(v, t0 + dt + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + 0.17);
    o.connect(g); g.connect(masterGain);
    o.start(t0 + dt); o.stop(t0 + dt + 0.2);
  }
}

// Ход мха: мох растёт — будто очень медленно рвут очень мягкую бумагу:
// волокна лопаются по одному, тихо, нарастает и стихает
export function playMossGrow() {
  if (!ctx) return;
  const n = Math.floor(ctx.sampleRate * 0.5), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  let v = 0;
  for (let i = 0; i < n; i++) {
    const env = Math.sin(Math.PI * i / n);
    if (Math.random() < 0.0016 * env) v = Math.random() * 2 - 1;
    v *= 0.93;
    d[i] = v * env;
  }
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = b; f.type = 'bandpass'; f.frequency.value = 2600 + Math.random() * 1400; f.Q.value = 0.8; g.gain.value = 0.06;
  s.connect(f); f.connect(g); g.connect(masterGain); s.start();
}

// Криосклеп: уголёк тикает у сердца — тихо, как часы под подушкой; v — громкость 0..1
let tock = false;
export function playTick(v) {
  if (!ctx || v <= 0.01) return;
  const n = Math.floor(ctx.sampleRate * 0.012), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (n * 0.18));
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  tock = !tock;
  s.buffer = b; f.type = 'lowpass'; f.frequency.value = tock ? 1500 : 1900; f.Q.value = 2; g.gain.value = 0.05 * v;
  s.connect(f); f.connect(g); g.connect(masterGain); s.start();
}

// Menu click
export function playClick() {
  if (!ctx) return;
  playTone(440, 0.08, 'square', 0.02);
}

// Ambient drone (background)
let ambientNode = null;
export function startAmbient() {
  if (!ctx || ambientNode) return;
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.value = 50;
  osc2.type = 'sine';
  osc2.frequency.value = 55;

  filter.type = 'lowpass';
  filter.frequency.value = 120;
  filter.Q.value = 1;

  gain.gain.value = 0.015;

  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  osc.start();
  osc2.start();

  ambientNode = { osc, osc2, gain };
}

export function stopAmbient() {
  if (!ambientNode) return;
  ambientNode.gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);
  setTimeout(() => {
    if (ambientNode) {
      ambientNode.osc.stop();
      ambientNode.osc2.stop();
      ambientNode = null;
    }
  }, 1100);
}

// Idle distant sound
export function playDistantSound() {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = 60 + Math.random() * 40;
  const gain = ctx.createGain();
  gain.gain.value = 0.008;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 200;
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(ctx.currentTime + 3);
}
