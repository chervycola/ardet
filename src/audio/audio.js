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
