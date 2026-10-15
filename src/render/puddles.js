// ═══════════════════════════════════════
// ЛУЖИ — после дождя земля держит воду. Влажность мира растёт под дождём
// и сохнет за три с половиной минуты; лужи стоят в одних и тех же местах
// (сетка, детерминированно): глубокие наполняются первыми и сохнут
// последними, мелкие — наоборот. Только на земле, тропе и в грязи; не под
// постройками.
//   ступил в лужу — брызги, круги и тихий плеск; следующие восемь шагов
//   мокрые, тёмные;
//   под дождём по лужам идут круги от капель;
//   в болоте за краем круги расходятся от каждого шага;
//   в воде у ног отражается огонь из груди (ниже ног на высоту огня).
// ?wet — лужи сразу полные (проверка руками).
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { hash } from './draw.js';
import { emit } from './particles.js';
import { surfaceAt } from '../world/surface.js';
import { getCtx } from '../audio/audio.js';

const CELL = 90;
const WET_UP = 1 / 900;          // под полным дождём — 15 с до полных луж
const WET_DOWN = 1 / 12600;      // сохнет за 3,5 мин
const STRIDE = 9;                // шаг — как у следов
const WATER = '#3D4A3A', EDGE = '#0D0B0A', SKY = '#8A8D8F', GLINT = '#E28A3A';   // мгла в воде, ночь по кромке
const cells = new Map();
const ripples = [];
let wet = 0, wetSteps = 0, walked = 0, lastPlip = -99;
try { if (/[?&]wet\b/.test(location.search)) wet = 1; } catch (e) {}

// лужа клетки (или null): место, размер, порог наполнения
function cellAt(i, j, locations) {
  const key = i * 100003 + j;
  if (cells.has(key)) return cells.get(key);
  let p = null;
  const cx = i * CELL + 15 + Math.floor(hash(i, j, 3.1) * 60);
  const cy = j * CELL + 15 + Math.floor(hash(i, j, 5.7) * 60);
  const surf = surfaceAt(cx, cy, locations);
  const chance = surf === 'mud' ? 0.6 : (surf === 'ground' || surf === 'path') ? 0.22 : 0;
  if (hash(i, j, 1.3) < chance) {
    const rx = 4 + Math.floor(hash(i, j, 7.9) * 7);
    const under = locations.some(l => cx + rx + 3 > l.x && cx - rx - 3 < l.x + l.w && cy + 6 > l.y && cy - 6 < l.y + l.h);
    if (!under) p = { x: cx, y: cy, rx, ry: Math.max(2, Math.round(rx * 0.4)), th: 0.1 + hash(i, j, 9.4) * 0.5 };
  }
  cells.set(key, p);
  return p;
}

// сколько воды в луже сейчас: null — сухо
function sizeOf(p) {
  const f = Math.max(0, Math.min(1, (wet - p.th) / 0.3));
  if (f <= 0) return null;
  const k = 0.45 + 0.55 * f;
  return { rx: Math.max(2, Math.round(p.rx * k)), ry: Math.max(1, Math.round(p.ry * k)), f };
}
const inside = (p, s, x, y) => ((x - p.x) / s.rx) ** 2 + ((y - p.y) / (s.ry + 0.5)) ** 2 <= 1;

function forVisible(cx, cy, vw, vh, locations, fn) {
  const i0 = Math.floor((cx - 20) / CELL), i1 = Math.floor((cx + vw + 20) / CELL);
  const j0 = Math.floor((cy - 20) / CELL), j1 = Math.floor((cy + vh + 20) / CELL);
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
    const p = cellAt(i, j, locations);
    if (!p) continue;
    const s = sizeOf(p);
    if (s) fn(p, s);
  }
}

const ring = (x, y, r1, life) => { if (ripples.length < 60) ripples.push({ x, y, r1, life, age: 0 }); };

// плеск: короткий «плюх» вниз по тону и шорох воды; тихо
function plip(sp) {
  if (t - lastPlip < 10) return;
  lastPlip = t;
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  const t0 = ctx.currentTime, vol = 0.025 + Math.min(0.02, sp * 0.005);
  const o = ctx.createOscillator(), g = ctx.createGain(), f0 = 700 + Math.random() * 300;
  o.type = 'sine';
  o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f0 * 0.45, t0 + 0.07);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
  o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0 + 0.1);
  const n = Math.floor(ctx.sampleRate * 0.06), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g2 = ctx.createGain();
  src.buffer = b; f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.9; g2.gain.value = vol * 0.8;
  src.connect(f); f.connect(g2); g2.connect(ctx.destination); src.start(t0);
}

// шаг мира: влажность, круги, шаги странника по воде
// cam: { x, y, vw, vh } — капли бьют только по лужам в кадре
export function stepPuddles(player, surfName, weather, cam, locations) {
  const raining = weather.state === 'toxicRain';
  if (raining) wet = Math.min(1, wet + WET_UP * weather.intensity);
  else wet = Math.max(0, wet - WET_DOWN);
  for (let i = ripples.length - 1; i >= 0; i--) if (++ripples[i].age > ripples[i].life) ripples.splice(i, 1);
  if (raining && weather.intensity > 0.1) {
    forVisible(cam.x, cam.y, cam.vw, cam.vh, locations, (p, s) => {
      if (Math.random() >= weather.intensity * 0.035) return;
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
      ring(p.x + Math.cos(a) * r * (s.rx - 1), p.y + Math.sin(a) * r * Math.max(0, s.ry - 0.5), 2.5, 26);
    });
  }
  // шаги — по пройденному пути
  const sp = Math.hypot(player.vx || 0, player.vy || 0);
  if (sp < 0.05) return;
  walked += sp;
  if (walked < STRIDE) return;
  walked = 0;
  const fx = player.x + 6, fy = player.y + 23;
  if (surfName === 'swamp') { ring(fx, fy, 5, 40); return; }
  if (surfName === 'water') { ring(fx, fy, 6, 38); wetSteps = 10; plip(sp); return; }   // вброд: круги, плеск, потом мокрые следы
  if (wet <= 0) return;
  const p = cellAt(Math.floor(fx / CELL), Math.floor(fy / CELL), locations);
  const s = p && sizeOf(p);
  if (!s || !inside(p, s, fx, fy)) return;
  emit(fx, fy - 1, 3 + Math.round(sp), { color: SKY, speed: 0.5 + sp * 0.15, life: 16, spread: 1.6, angle: -Math.PI / 2, gravity: 0.06, windK: 0.2 });
  ring(fx, fy, 4 + Math.min(3, sp), 34);
  wetSteps = 8;
  plip(sp);
}

// следы: пока ноги мокрые — мокрый (там, где поверхность след держит)
export const wetKind = kind => (wetSteps > 0 && kind) ? 'wet' : kind;
export function usedWet() { if (wetSteps > 0) wetSteps--; }

export function drawPuddles(ctx, camX, camY, vw, vh, locations, player) {
  if (wet > 0) {
    const gx = Math.round(player.x + 6), gy = Math.round(player.y + 36);   // огонь груди, отражённый под ногами
    forVisible(camX, camY, vw, vh, locations, (p, s) => {
      // гладь: вода светлее земли — в ней мгла неба; эллипс построчно, пикселями
      let hwLast = 0;
      ctx.globalAlpha = 0.3 + 0.4 * s.f;
      ctx.fillStyle = WATER;
      for (let dy = -s.ry; dy <= s.ry; dy++) {
        const hw = Math.round(s.rx * Math.sqrt(Math.max(0, 1 - (dy / (s.ry + 0.5)) ** 2)));
        if (hw > 0) { ctx.fillRect(p.x - hw, p.y + dy, hw * 2 + 1, 1); hwLast = hw; }
      }
      ctx.globalAlpha = 0.45 * s.f;                             // ближняя кромка — мокрая земля
      ctx.fillStyle = EDGE;
      ctx.fillRect(p.x - hwLast + 1, p.y + s.ry + 1, hwLast * 2 - 1, 1);
      ctx.globalAlpha = 0.35 * s.f;                             // небо в воде — у дальнего края
      ctx.fillStyle = SKY;
      const hw0 = Math.max(1, Math.round(s.rx * 0.6));
      ctx.fillRect(p.x - hw0, p.y - s.ry + 1, hw0 * 2, 1);
      if (inside(p, s, gx, gy)) {
        ctx.globalAlpha = (0.35 + 0.2 * Math.sin(t * 0.3)) * s.f;
        ctx.fillStyle = GLINT;
        ctx.fillRect(gx, gy, 1, 2);
      }
    });
  }
  ctx.fillStyle = SKY;
  for (const r of ripples) {
    if (r.x < camX - 10 || r.x > camX + vw + 10 || r.y < camY - 10 || r.y > camY + vh + 10) continue;
    const k = r.age / r.life, rr = 0.8 + (r.r1 - 0.8) * k, ry = rr * 0.45;
    ctx.globalAlpha = (1 - k) * 0.4;
    const n = Math.max(6, Math.round(rr * 4));
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      ctx.fillRect(Math.round(r.x + Math.cos(a) * rr), Math.round(r.y + Math.sin(a) * ry), 1, 1);
    }
  }
  ctx.globalAlpha = 1;
}

// для тестов
export const _state = () => ({ wet, wetSteps, ripples: ripples.length });
export function _set(w) { wet = w; wetSteps = 0; walked = 0; ripples.length = 0; }
export const _cellAt = cellAt;
export const _sizeOf = sizeOf;
