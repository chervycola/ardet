// ═══════════════════════════════════════
// ZONE AMBIENT — procedural soundscapes per zone
// ═══════════════════════════════════════
import { getCtx } from './audio.js';

let currentZone = 'settlement';
let nodes = null;

const ZONE_CONFIGS = {
  settlement: { freq: 55, type: 'sine', filterFreq: 150, gain: 0.012 },
  forest:     { freq: 42, type: 'sawtooth', filterFreq: 100, gain: 0.008 },
  toxic:      { freq: 65, type: 'square', filterFreq: 200, gain: 0.010 },
  highway:    { freq: 48, type: 'triangle', filterFreq: 120, gain: 0.009 },
  quarter:    { freq: 38, type: 'sine', filterFreq: 80, gain: 0.007 },
};

function createZoneSound(cfg) {
  const ctx = getCtx();
  if (!ctx) return null;

  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = cfg.type;
  osc.frequency.value = cfg.freq;
  osc2.type = 'sine';
  osc2.frequency.value = cfg.freq * 1.01; // slight detune for texture

  filter.type = 'lowpass';
  filter.frequency.value = cfg.filterFreq;
  filter.Q.value = 0.5;

  gain.gain.value = 0;
  // Fade in
  gain.gain.linearRampToValueAtTime(cfg.gain, ctx.currentTime + 2);

  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc2.start();

  return { osc, osc2, gain, filter };
}

function stopNodes() {
  if (!nodes) return;
  const ctx = getCtx();
  if (ctx) {
    nodes.gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
  }
  const n = nodes;
  setTimeout(() => {
    try { n.osc.stop(); n.osc2.stop(); } catch (e) {}
  }, 2000);
  nodes = null;
}

export function updateZone(zone) {
  if (zone === currentZone && nodes) return;
  currentZone = zone;
  stopNodes();
  const cfg = ZONE_CONFIGS[zone] || ZONE_CONFIGS.settlement;
  nodes = createZoneSound(cfg);
}

export function getZone(x, y) {
  if (y < 500) return 'forest';
  if (y > 1300) return 'toxic';
  if (x < 400) return 'quarter';
  if (x > 1800) return 'highway';
  return 'settlement';
}
