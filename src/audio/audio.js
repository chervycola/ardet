// ═══════════════════════════════════════
// AUDIO — Web Audio API wrapper
// ═══════════════════════════════════════

let ctx = null;
let masterGain = null;
let sfxOut = null;      // шина звуков мира мимо мастера (ветер, гул зон, вороны, колокола…) — тоже под «звуком мира»

export function initAudio() {
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5 * volMul;
    masterGain.connect(ctx.destination);
    sfxOut = ctx.createGain();
    sfxOut.gain.value = volMul;
    sfxOut.connect(ctx.destination);
  } catch (e) {
    console.warn('[audio] not supported');
  }
}

export function getCtx() { return ctx; }

// звук мира из настроек быта (core/prefs.js): 1 — как задумано, 0.4 — тихо, 0 — без звука
let volMul = 1;
export function setVolume(f) {
  volMul = Math.max(0, Math.min(1, +f || 0));
  if (masterGain) masterGain.gain.value = 0.5 * volMul;
  if (sfxOut) sfxOut.gain.value = volMul;
}
// куда подключать звуки мира, что идут мимо мастера: громкость — как задана, без деления на мастер
export const getOut = () => sfxOut || (ctx && ctx.destination);

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

// Вдох на пороге: подул на уголёк — короткий мягкий выдох
export function playBlow() {
  if (!ctx) return;
  noiseBreath(0.42, 0.05, 0.25, 900, 700, 0.045);
}
// ...и из глубины отвечает долгий втягивающий вдох: шум нарастает и светлеет, обрывается
export function playInhale() {
  if (!ctx) return;
  noiseBreath(2.3, 1.9, 0.12, 260, 1500, 0.07);
}
// дыхание: шум сквозь фильтр — нарастает за rise, стихает за fall; фильтр едет f0 → f1
function noiseBreath(dur, rise, fall, f0, f1, vol) {
  const n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t0 = ctx.currentTime;
  s.buffer = b; f.type = 'lowpass'; f.Q.value = 0.7;
  f.frequency.setValueAtTime(f0, t0); f.frequency.linearRampToValueAtTime(f1, t0 + rise);
  g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + rise); g.gain.linearRampToValueAtTime(0.0001, t0 + Math.min(dur, rise + fall));
  s.connect(f); f.connect(g); g.connect(masterGain); s.start(t0); s.stop(t0 + dur);
}

// За кольцом: позёмка растра бормочет — не слова, а обломки слов: слог шума сквозь два
// форманта, на границе слуха (v 0..1)
export function playMurmur(v) {
  if (!ctx || v <= 0.02) return;
  const dur = 0.06 + Math.random() * 0.08, n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n);
  const s = ctx.createBufferSource(), f1 = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = b;
  f1.type = 'bandpass'; f1.frequency.value = 300 + Math.random() * 500; f1.Q.value = 5;
  f2.type = 'bandpass'; f2.frequency.value = 900 + Math.random() * 1300; f2.Q.value = 6;
  g.gain.value = 0.022 * v;
  s.connect(f1); s.connect(f2); f1.connect(g); f2.connect(g); g.connect(masterGain); s.start();
}
// ...недосмотренный кадр рассыпается со вздохом
export function playSigh() {
  if (!ctx) return;
  const dur = 1.2, n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t0 = ctx.currentTime;
  s.buffer = b; f.type = 'lowpass'; f.Q.value = 0.8;
  f.frequency.setValueAtTime(950, t0); f.frequency.exponentialRampToValueAtTime(230, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.06, t0 + 0.16); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f); f.connect(g); g.connect(masterGain); s.start(t0); s.stop(t0 + dur);
}

// Каптёрка Дежурного: печка трещит — щелчок полена, глухой, рядом громче (v 0..1)
export function playCrackle(v) {
  if (!ctx || v <= 0.02) return;
  const n = Math.floor(ctx.sampleRate * 0.03), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (n * 0.12));
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = b; f.type = 'bandpass'; f.frequency.value = 900 + Math.random() * 900; f.Q.value = 1.2; g.gain.value = 0.05 * v;
  s.connect(f); f.connect(g); g.connect(masterGain); s.start();
}
// ...и кипяток льётся в гранёный стакан: струйка, тон поднимается — стакан наполняется
export function playPour() {
  if (!ctx) return;
  const dur = 0.55, n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t0 = ctx.currentTime;
  s.buffer = b; f.type = 'bandpass'; f.Q.value = 6;
  f.frequency.setValueAtTime(700, t0); f.frequency.linearRampToValueAtTime(1600, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.035, t0 + 0.06); g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f); f.connect(g); g.connect(masterGain); s.start(t0); s.stop(t0 + dur);
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

// стерео: откуда звук — слева или справа от странника (pan -1..1)
function toOut(node, pan) {
  if (ctx.createStereoPanner && pan) { const p = ctx.createStereoPanner(); p.pan.value = pan; node.connect(p); p.connect(masterGain); }
  else node.connect(masterGain);
}
// Тихая табличка в тени: жесть шуршит под ветром — три-пять сухих зёрен шума (v 0..1)
export function playRustle(v, pan = 0) {
  if (!ctx || v <= 0.02) return;
  const t0 = ctx.currentTime, grains = 3 + Math.floor(Math.random() * 3);
  for (let k = 0; k < grains; k++) {
    const dur = 0.03 + Math.random() * 0.05, n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), at = t0 + k * (0.07 + Math.random() * 0.09);
    s.buffer = b; f.type = 'bandpass'; f.frequency.value = 2200 + Math.random() * 2200; f.Q.value = 2.5;
    g.gain.value = 0.03 * v;
    s.connect(f); f.connect(g); toOut(g, pan); s.start(at); s.stop(at + dur);
  }
}
// Тихая постройка в тени: петля или ставня скрипит — тон ползёт вниз, с дрожью (v 0..1)
export function playCreak(v, pan = 0, pitch = 1) {
  if (!ctx || v <= 0.02) return;
  const t0 = ctx.currentTime, dur = 0.45 + Math.random() * 0.3;
  const o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(230 * pitch, t0); o.frequency.exponentialRampToValueAtTime(140 * pitch, t0 + dur);
  lfo.frequency.value = 22 + Math.random() * 10; lg.gain.value = 9 * pitch;   // дрожь трения
  lfo.connect(lg); lg.connect(o.frequency);
  f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 3;
  g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.018 * v, t0 + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(f); f.connect(g); toOut(g, pan);
  o.start(t0); lfo.start(t0); o.stop(t0 + dur); lfo.stop(t0 + dur);
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
