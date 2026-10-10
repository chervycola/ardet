// ═══════════════════════════════════════
// ЗВУК ВЕТРА — шум сквозь полосовой фильтр. Громкость и высота идут за
// силой ветра у странника: в штиль еле слышно, порыв поднимает и тон,
// и громкость, в бурю гудит. Тихо — как зоны (ZONE_CONFIGS: ~0.01).
// ═══════════════════════════════════════
import { getCtx } from './audio.js';

let src = null, bp = null, g = null, n = 0;

function setup(ctx) {
  const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  // розоватый шум: белый, слегка сглаженный
  let last = 0;
  for (let i = 0; i < len; i++) { last = last * 0.86 + (Math.random() * 2 - 1) * 0.14; d[i] = last * 2.4; }
  src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 300; bp.Q.value = 0.8;
  g = ctx.createGain(); g.gain.value = 0;
  src.connect(bp); bp.connect(g); g.connect(ctx.destination);
  src.start();
}

// s — сила ветра у странника (0 … ~1.6 с порывом); раз в шаг
export function updateWindSound(s) {
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  if (!src) setup(ctx);
  if (++n % 6) return;                       // автоматизация — 10 раз в секунду, не чаще
  const k = Math.max(0, Math.min(1.6, s));
  g.gain.setTargetAtTime(0.0015 + Math.pow(k, 1.6) * 0.014, ctx.currentTime, 0.4);
  bp.frequency.setTargetAtTime(220 + k * 520, ctx.currentTime, 0.5);
}
