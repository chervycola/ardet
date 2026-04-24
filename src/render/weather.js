// ═══════════════════════════════════════
// WEATHER — radioactive rain, sandstorm, lightning, puddles
// Draws streaks/flashes on fx layer (additive) and dark overlays on ui layer
// ═══════════════════════════════════════
import { scaler } from './scaler.js';
import { t } from '../core/time.js';
import { hash, rect } from './draw.js';

const STATE = { CLEAR: 'clear', TOXIC_RAIN: 'toxicRain', SANDSTORM: 'sandstorm' };

export const weather = {
  state: STATE.CLEAR,
  // Transition: 0..1 fade-in/fade-out envelope for overlays
  intensity: 0,
  targetIntensity: 0,
  // Scheduling
  nextCheck: 600,       // frames until next weather roll
  currentDuration: 0,   // frames remaining of current weather
  zone: 'settlement',

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

// Zone → preferred weather; rolled each cycle
function rollWeather(zone) {
  // Short clear period to breathe
  if (Math.random() < 0.55) return { state: STATE.CLEAR, duration: 400 + Math.floor(Math.random() * 600) };

  if (zone === 'toxic' || zone === 'forest') {
    return { state: STATE.TOXIC_RAIN, duration: 600 + Math.floor(Math.random() * 900) };
  }
  if (zone === 'highway' || zone === 'quarter') {
    return { state: STATE.SANDSTORM, duration: 500 + Math.floor(Math.random() * 800) };
  }
  // Settlement → 50/50 rain or sand drifting in
  if (Math.random() < 0.5) {
    return { state: STATE.TOXIC_RAIN, duration: 400 + Math.floor(Math.random() * 500) };
  }
  return { state: STATE.SANDSTORM, duration: 400 + Math.floor(Math.random() * 500) };
}

export function update(zone) {
  weather.zone = zone || 'settlement';

  // Scheduler
  weather.currentDuration--;
  weather.nextCheck--;
  if (weather.nextCheck <= 0 && weather.currentDuration <= 0) {
    const r = rollWeather(weather.zone);
    weather.state = r.state;
    weather.currentDuration = r.duration;
    weather.nextCheck = r.duration + 200;
  }

  weather.targetIntensity = weather.state === STATE.CLEAR ? 0 : 1;
  // Smooth fade
  if (weather.intensity < weather.targetIntensity) {
    weather.intensity = Math.min(1, weather.intensity + 0.004);
  } else if (weather.intensity > weather.targetIntensity) {
    weather.intensity = Math.max(0, weather.intensity - 0.004);
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
  if (spawning && weather.rainParts.length < MAX_RAIN && t % 2 === 0) {
    const batch = 1 + Math.floor(weather.intensity * 3);
    for (let i = 0; i < batch; i++) {
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
  if (!spawning && weather.rainParts.length > 0) {
    for (let k = 0; k < 3; k++) weather.rainParts.pop();
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
