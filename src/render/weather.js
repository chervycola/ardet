// ═══════════════════════════════════════
// WEATHER — radioactive rain, sandstorm, lightning, puddles
// Draws streaks/flashes on fx layer (additive) and dark overlays on ui layer
// ═══════════════════════════════════════
import { scaler } from './scaler.js';
import { t } from '../core/time.js';
import { hash, rect } from './draw.js';

const STATE = { CLEAR: 'clear', TOXIC_RAIN: 'toxicRain', SANDSTORM: 'sandstorm' };

// Per-type cooldown between event STARTS (@60fps).
// Rain is a rare, quiet event (~9 min); sandstorm is more frequent (~3 min).
const COOLDOWN = {
  [STATE.TOXIC_RAIN]: 32400,  // 9 min
  [STATE.SANDSTORM]: 10800,   // 3 min
};

// Intensity ramp speed per state (fraction added/subtracted per frame).
// Rain creeps in drop-by-drop; sandstorm rolls in faster.
const RAMP = {
  [STATE.TOXIC_RAIN]: 0.0012,   // ~14s to reach full
  [STATE.SANDSTORM]: 0.004,     // ~4s to reach full
};

export const weather = {
  state: STATE.CLEAR,
  // Transition: 0..1 fade-in/fade-out envelope for overlays
  intensity: 0,
  targetIntensity: 0,
  // Scheduling
  nextCheck: 1800,      // first possible weather after 30s
  currentDuration: 0,   // frames remaining of current weather
  zone: 'settlement',
  // Last-start timestamps — used for per-type cooldowns.
  // Negative initial values let the first event fire after `nextCheck`.
  lastStartAt: {
    [STATE.TOXIC_RAIN]: -999999,
    [STATE.SANDSTORM]: -999999,
  },

  // Particle pools
  rainParts: [],
  sandParts: [],
  puddles: [],

  // Lightning
  lightning: 0,     // 0 = inactive, otherwise countdown
  nextStrike: 600,
  boltX: 0,

  // Wind — shared between rain + sand
  windX: 0.4,
};

const MAX_RAIN = 90;
const MAX_SAND = 140;
const MAX_PUDDLES = 30;

// Zone → preferred weather. Rain gets longer durations (2-4 min) so it can
// ease in drop-by-drop and taper out. Sandstorm is punchier (25s-60s).
// Returns null if the chosen type is still on cooldown.
function rollWeather(zone) {
  const onCooldown = (st) => (t - weather.lastStartAt[st]) < COOLDOWN[st];

  const wantRain = zone === 'toxic' || zone === 'forest';
  const wantSand = zone === 'highway' || zone === 'quarter';

  if (wantRain && !onCooldown(STATE.TOXIC_RAIN)) {
    return { state: STATE.TOXIC_RAIN, duration: 7200 + Math.floor(Math.random() * 7200) };
  }
  if (wantSand && !onCooldown(STATE.SANDSTORM)) {
    return { state: STATE.SANDSTORM, duration: 1500 + Math.floor(Math.random() * 2100) };
  }
  // Settlement / fallback: pick whichever is off cooldown
  const rainReady = !onCooldown(STATE.TOXIC_RAIN);
  const sandReady = !onCooldown(STATE.SANDSTORM);
  if (rainReady && sandReady) {
    return Math.random() < 0.4
      ? { state: STATE.TOXIC_RAIN, duration: 6000 + Math.floor(Math.random() * 6000) }
      : { state: STATE.SANDSTORM, duration: 1200 + Math.floor(Math.random() * 1800) };
  }
  if (rainReady) return { state: STATE.TOXIC_RAIN, duration: 6000 + Math.floor(Math.random() * 6000) };
  if (sandReady) return { state: STATE.SANDSTORM, duration: 1200 + Math.floor(Math.random() * 1800) };
  return null; // both on cooldown → sky stays clear
}

export function update(zone) {
  weather.zone = zone || 'settlement';

  // Scheduler — each weather type has its own cooldown (rain 9 min, sand 3 min).
  // If both are on cooldown the roll returns null and the sky stays clear.
  weather.currentDuration--;
  weather.nextCheck--;
  if (weather.currentDuration <= 0 && weather.state !== STATE.CLEAR) {
    weather.state = STATE.CLEAR;
  }
  if (weather.nextCheck <= 0) {
    const r = rollWeather(weather.zone);
    if (r) {
      weather.state = r.state;
      weather.currentDuration = r.duration;
      weather.lastStartAt[r.state] = t;
    }
    // Poll again in 30s regardless (cheap) — cooldowns handle the real gating
    weather.nextCheck = 1800;
  }

  // Intensity envelope — bell-shaped so rain creeps in and trails out.
  // fadeFrames = 20% of total duration, capped at 40s.
  const fadeFrames = Math.min(2400, Math.floor((weather.currentDuration > 0 ? weather.currentDuration : 1) * 0.2));
  let target = 0;
  if (weather.state !== STATE.CLEAR && weather.currentDuration > 0) {
    // Use currentDuration and the event's starting duration to find phase.
    // We don't store the original duration, so approximate: taper near the end.
    target = weather.currentDuration < fadeFrames
      ? weather.currentDuration / fadeFrames
      : 1;
  }
  weather.targetIntensity = target;

  const ramp = RAMP[weather.state] || 0.003;
  if (weather.intensity < weather.targetIntensity) {
    weather.intensity = Math.min(weather.targetIntensity, weather.intensity + ramp);
  } else if (weather.intensity > weather.targetIntensity) {
    weather.intensity = Math.max(weather.targetIntensity, weather.intensity - ramp * 0.7);
  }

  // Update wind with lazy drift
  weather.windX = 0.3 + 0.9 * Math.sin(t * 0.0013);

  // Update particles based on state + intensity
  if (weather.state === STATE.TOXIC_RAIN || weather.intensity > 0) updateRain();
  if (weather.state === STATE.SANDSTORM || weather.intensity > 0) updateSand();

  // Lightning only during toxic rain when heavy
  if (weather.state === STATE.TOXIC_RAIN && weather.intensity > 0.6) {
    if (weather.lightning > 0) weather.lightning--;
    if (weather.lightning <= 0 && --weather.nextStrike <= 0) {
      weather.lightning = 40;
      weather.nextStrike = 900 + Math.floor(Math.random() * 1800);
      weather.boltX = Math.floor(Math.random() * scaler.vw);
    }
  } else {
    weather.lightning = Math.max(0, weather.lightning - 1);
  }

  // Puddles lifetime
  for (let i = weather.puddles.length - 1; i >= 0; i--) {
    const p = weather.puddles[i];
    p.life--;
    if (p.r < p.maxR) p.r += 0.03;
    if (p.life <= 0) weather.puddles.splice(i, 1);
  }
}

function updateRain() {
  const vw = scaler.vw, vh = scaler.vh;
  const spawning = weather.state === STATE.TOXIC_RAIN;

  // Drop-by-drop intro: spawn rate ~ intensity² so the first drops are
  // several seconds apart, thickening only as the rain takes hold.
  if (spawning && weather.rainParts.length < MAX_RAIN) {
    const I = weather.intensity;
    // Expected drops-per-frame: tiny at low I, saturates near full I.
    // At I=0.05 → ~0.0125/frame (≈1 drop every 1.3s).
    // At I=1.0 → ~5/frame (heavy).
    const expected = I * I * 5;
    const whole = Math.floor(expected);
    const frac = expected - whole;
    const count = whole + (Math.random() < frac ? 1 : 0);
    for (let i = 0; i < count; i++) {
      if (weather.rainParts.length >= MAX_RAIN) break;
      weather.rainParts.push({
        x: -20 + Math.random() * (vw + 40),
        y: -8 - Math.random() * 20,
        vy: 4 + Math.random() * 3,
        life: vh + 40,
        len: 3 + Math.floor(Math.random() * 3),
      });
    }
  }
  for (let i = weather.rainParts.length - 1; i >= 0; i--) {
    const p = weather.rainParts[i];
    p.y += p.vy;
    p.x += weather.windX * 1.6;
    p.life -= p.vy;
    if (p.y > vh + 20 || p.life <= 0) {
      // Occasional puddle
      if (weather.puddles.length < MAX_PUDDLES && Math.random() > 0.82 && p.y < vh + 5) {
        weather.puddles.push({
          x: p.x, y: Math.min(p.y, vh - 6),
          life: 420, r: 0.5,
          maxR: 1.4 + Math.random() * 2,
        });
      }
      weather.rainParts.splice(i, 1);
    }
  }
}

function updateSand() {
  const vw = scaler.vw, vh = scaler.vh;
  const spawning = weather.state === STATE.SANDSTORM;
  if (spawning && weather.sandParts.length < MAX_SAND && t % 2 === 0) {
    const batch = 2 + Math.floor(weather.intensity * 3);
    for (let i = 0; i < batch; i++) {
      weather.sandParts.push({
        x: -20 + Math.random() * (vw + 40),
        y: Math.random() * vh,
        vx: 1.4 + Math.random() * 2.2,
        vy: -0.3 + Math.random() * 0.6,
        life: 220 + Math.floor(Math.random() * 120),
        size: 1 + Math.floor(Math.random() * 2),
        tone: Math.random() > 0.5 ? 0 : 1,
      });
    }
  }
  for (let i = weather.sandParts.length - 1; i >= 0; i--) {
    const p = weather.sandParts[i];
    p.x += p.vx + weather.windX * 0.9;
    p.y += p.vy + Math.sin(t * 0.02 + p.life * 0.1) * 0.3;
    p.life--;
    if (p.x > vw + 30 || p.life <= 0) weather.sandParts.splice(i, 1);
  }
  if (!spawning && weather.sandParts.length > 0) {
    for (let k = 0; k < 4; k++) weather.sandParts.pop();
  }
}

// ── DRAW ──
// Additive elements (rain streaks, lightning, geiger sparks) go on fx (lighter).
// Dark overlays (sand haze, green tint) go on ui before HUD (source-over).

export function drawAdditive(ctx) {
  // Rain streaks — radioactive green glow
  if (weather.rainParts.length > 0) {
    ctx.globalAlpha = 0.7 * Math.max(0.3, weather.intensity);
    ctx.strokeStyle = '#5aff2a';
    ctx.lineWidth = 1;
    for (const p of weather.rainParts) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - weather.windX * 1.4, p.y - p.len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Glowing droplet heads
    ctx.fillStyle = '#aaff6a';
    ctx.globalAlpha = 0.9 * weather.intensity;
    for (const p of weather.rainParts) ctx.fillRect(p.x | 0, p.y | 0, 1, 1);
    ctx.globalAlpha = 1;
    // Geiger static sparks
    if (t % 6 < 2 && weather.intensity > 0.5) {
      ctx.fillStyle = '#9aff5a';
      for (let i = 0; i < 4; i++) {
        ctx.globalAlpha = 0.2;
        const sx_ = (hash(i, t, 11) * scaler.vw) | 0;
        const sy_ = (hash(i, t, 22) * scaler.vh) | 0;
        ctx.fillRect(sx_, sy_, 1, 1);
      }
      ctx.globalAlpha = 1;
    }
  }

  // Lightning bolt + flash
  if (weather.lightning > 0) {
    const l = weather.lightning;
    if (l > 37) {
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, scaler.vw, scaler.vh);
    } else if (l > 30) {
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#ccccff';
      ctx.fillRect(0, 0, scaler.vw, scaler.vh);
    }
    ctx.globalAlpha = (l / 40) * 0.45;
    ctx.fillStyle = '#ccaaff';
    ctx.fillRect(0, 0, scaler.vw, scaler.vh);
    ctx.globalAlpha = 1;
    if (l > 20 && l < 36) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.globalAlpha = (l - 20) / 16;
      ctx.beginPath();
      let bx = weather.boltX, by = 0;
      ctx.moveTo(bx, by);
      for (let i = 0; i < 10; i++) {
        bx += hash(i, l, 11) * 22 - 11;
        by += 14 + hash(i, l, 22) * 8;
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(weather.boltX + i * 5 - 5, 20 + i * 18);
        ctx.lineTo(weather.boltX + i * 5 - 5 + hash(i, 0, 33) * 30 - 15, 34 + i * 18);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }
}

export function drawOverlay(ctx) {
  if (weather.intensity < 0.02) return;
  const vw = scaler.vw, vh = scaler.vh;

  // RAIN — green tint overhead + puddle marks
  if (weather.state === STATE.TOXIC_RAIN || (weather.intensity > 0 && weather.rainParts.length > 0)) {
    // Faint poisonous green tint
    ctx.globalAlpha = (0.08 + 0.025 * Math.sin(t * 0.02)) * weather.intensity;
    ctx.fillStyle = '#1a3a08';
    ctx.fillRect(0, 0, vw, vh);

    // Puddles (screen-space, simple)
    for (const p of weather.puddles) {
      const fadeIn = Math.min(1, (420 - p.life) / 50);
      const fadeOut = Math.min(1, p.life / 100);
      ctx.globalAlpha = Math.min(fadeIn, fadeOut) * 0.5;
      ctx.fillStyle = '#0a2a08';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r * 2.5, p.r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha *= 0.7;
      ctx.fillStyle = '#2a5a1a';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r * 1.8, p.r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // SANDSTORM — red dust haze, obscures visibility
  if (weather.state === STATE.SANDSTORM || weather.sandParts.length > 0) {
    // Base reddish darkening
    ctx.globalAlpha = (0.16 + 0.04 * Math.sin(t * 0.01)) * weather.intensity;
    ctx.fillStyle = '#3a0a08';
    ctx.fillRect(0, 0, vw, vh);

    // Radial fog — closes in at the edges
    const fog = ctx.createRadialGradient(vw / 2, vh / 2, vw * 0.15, vw / 2, vh / 2, vw * 0.6);
    fog.addColorStop(0, 'rgba(90,30,20,0)');
    fog.addColorStop(0.6, 'rgba(120,40,20,0.35)');
    fog.addColorStop(1, 'rgba(60,20,10,0.8)');
    ctx.globalAlpha = 0.6 * weather.intensity;
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, vw, vh);
    ctx.globalAlpha = 1;

    // Sand particles (dark, source-over for visibility)
    for (const p of weather.sandParts) {
      const a = Math.min(0.4, p.life / 400) * weather.intensity;
      if (a < 0.05) continue;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.tone ? '#3a2012' : '#6b3a1a';
      ctx.fillRect(p.x | 0, p.y | 0, p.size + 1, 1);
    }
    ctx.globalAlpha = 1;

    // Moving dust streaks across
    const streakCount = 6;
    for (let i = 0; i < streakCount; i++) {
      ctx.globalAlpha = 0.1 * weather.intensity;
      const dy = (hash(i, t * 0.03, 33) * vh) | 0;
      const dw = 20 + ((hash(i, 0, 44) * 40) | 0);
      const dx = ((t * 0.6 + i * 80) % (vw + dw)) - dw;
      ctx.fillStyle = '#8b4a1a';
      ctx.fillRect(dx, dy, dw, 1);
    }
    ctx.globalAlpha = 1;
  }
}

// Returns true if the current weather meaningfully obscures vision
export function isHeavy() {
  return weather.intensity > 0.6 && weather.state !== STATE.CLEAR;
}

export { STATE as WEATHER_STATE };
