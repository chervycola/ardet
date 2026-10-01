// ═══════════════════════════════════════
// BRAINROT — cognitive decay in the wasteland
// Растёт с глубиной в пустыню за огнём; падение — у дальнего края.
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { X } from '../render/context.js';
import { scaler } from '../render/scaler.js';
import { MW, MH } from './terrain.js';
import { events } from '../core/events.js';
import { crackedGlass } from '../render/metaFx.js';
import { edgeDepth, edgeState } from './edges.js';
import { TOWN } from './disc.js';
import { layers } from '../render/layers.js';

export const FALL_AT = 0.97;   // падение — только у дальнего края пустыни

let brainrot = 0;
let brainrotFreeze = false;
let brainrotFreezeTimer = 0;
let fallKind = 'void';        // какое падение: sand · ice · lake · junk · void
const FALL_LEN = 300;

// ── Петля «СКРОЛЛ»: добровольное падение. Лента крутит, растр растёт;
// выход не подписан — остановиться. Падения милосердны.
let loopMode = false;
let stillFrames = 0;
let loopExitCb = null;
export function enterLoop(exitCb) {
  loopMode = true; stillFrames = 0; loopExitCb = exitCb || null;
  brainrot = Math.max(brainrot, 20);
  events.emit('brainrot.hook');
}
export function inLoop() { return loopMode; }
export function _dbg() { return { loopMode, stillFrames, brainrot: brainrot | 0 }; }

function getDistFromMap(player) {
  let d = 0;
  if (player.x < 0) d += Math.abs(player.x);
  if (player.x > MW) d += (player.x - MW);
  if (player.y < 160) d += Math.abs(player.y - 160);
  if (player.y > MH) d += (player.y - MH);
  return d;
}

export function update(player) {
  if (loopMode) {
    brainrot = Math.min(96, brainrot + 0.16);   // растёт, но фриза нет
    if (player.moving) stillFrames = 0; else stillFrames++;
    if (stillFrames > 240) {                    // 4 секунды покоя — отпустило
      loopMode = false; stillFrames = 0;
      brainrot = Math.min(brainrot, 55);
      const cb = loopExitCb; loopExitCb = null;
      events.emit('brainrot.unhook');
      if (cb) cb();
    }
    return;
  }
  if (brainrotFreeze) {
    brainrotFreezeTimer++;
    // Recovery after 5 seconds (300 frames)
    if (brainrotFreezeTimer > FALL_LEN) {
      brainrotFreeze = false;
      brainrotFreezeTimer = 0;
      brainrot = 50;
      // Respawn at campfire
      player.x = TOWN.x0 + 800;
      player.y = TOWN.y0 + 740;
      events.emit('brainrot.recover');
    }
    return;
  }

  // Пустыня брейнрота: распад идёт за глубиной, а не копится —
  // шаг назад ослабляет его сразу. Выйти можно до последнего: падение
  // только у дальнего края пояса.
  const dist = getDistFromMap(player);
  const edge = edgeDepth();
  let target = 0;
  if (edge > 0.04) target = Math.pow((edge - 0.04) / 0.93, 1.15) * 100;
  else if (dist > 600) target = Math.min(100, (dist - 600) / 30);
  brainrot += (Math.min(100, target) - brainrot) * (target > brainrot ? 0.05 : 0.08);
  if (brainrot < 0.2) brainrot = 0;

  if ((edge >= FALL_AT || (edge > 0.85 && brainrot >= 99) || (dist > 600 && brainrot >= 99.5)) && !brainrotFreeze) {
    const st = edgeState();
    fallKind = st ? ({ quicksand: 'sand', ice: 'ice', lake: 'lake', junk: 'junk' }[st.elem] || 'void') : 'void';
    brainrotFreeze = true;
    brainrotFreezeTimer = 0;
    brainrot = 100;
    if (fallKind !== 'sand' && fallKind !== 'lake') crackedGlass.add(scaler.vw / 2 | 0, scaler.vh / 2 | 0);   // экран бьётся при падении
    if (fallKind === 'ice') for (let i = 0; i < 4; i++) crackedGlass.add(Math.random() * scaler.vw | 0, Math.random() * scaler.vh | 0);
    events.emit('brainrot.freeze');
  }
}

// ── Распад картинки (обычный слой поверх мира) ──
// 0.15+ растр (брейнрот = растр), 0.35+ строки рвутся и съезжают,
// 0.6+ мир крошится макроблоками, 0.8+ провалы кадра.
const NIGHT = '#0D0B0A';
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const patterns = new Map();
function rasterPattern(ctx, level) {
  if (patterns.has(level)) return patterns.get(level);
  if (typeof document === 'undefined' || !document.createElement) return null;
  const c = document.createElement('canvas');
  if (!c.getContext) return null;
  c.width = 4; c.height = 4;
  const g = c.getContext('2d');
  g.fillStyle = NIGHT;
  for (let i = 0; i < 16; i++) if (BAYER[i] < level) g.fillRect(i % 4, i >> 2, 1, 1);
  const p = ctx.createPattern(c, 'repeat');
  patterns.set(level, p);
  return p;
}
function rnd(n) { const v = Math.sin(n * 91.7 + 13.1) * 43758.5453; return v - Math.floor(v); }
function copyStrip(ctx, src, sy, h, dx) {
  if (!src || !src.width) return;
  const sc = scaler.scale || 1;
  ctx.drawImage(src, 0, sy * sc, src.width, h * sc, dx, sy, scaler.vw, h);
}

export function draw(ctx) {
  if (brainrot <= 0 && !brainrotFreeze) return;
  const vw = scaler.vw, vh = scaler.vh;

  if (brainrotFreeze) { drawFall(ctx, fallKind, brainrotFreezeTimer / FALL_LEN); return; }

  const k = brainrot / 100;
  const bg = layers.canvas('bg'), world = layers.canvas('world');
  const tick = t >> 2;                       // распад дёргается рывками, не плывёт

  // строки рвутся и съезжают
  if (k > 0.35) {
    const n = Math.floor((k - 0.35) * 22);
    for (let i = 0; i < n; i++) {
      const y = rnd(tick * 7 + i) * vh | 0;
      const h = 1 + (rnd(tick * 3 + i * 5) * (2 + k * 9) | 0);
      const dx = ((rnd(tick + i * 11) - 0.5) * k * 46) | 0;
      copyStrip(ctx, bg, y, h, dx);
      copyStrip(ctx, world, y, h, dx);
    }
  }
  // мир крошится макроблоками
  if (k > 0.6 && bg && bg.width) {
    const n = Math.floor((k - 0.6) * 70);
    const sc = scaler.scale || 1;
    for (let i = 0; i < n; i++) {
      const sx = rnd(tick * 13 + i) * vw | 0, sy = rnd(tick * 17 + i) * vh | 0;
      const b = 4 + (rnd(i * 3 + tick) * 10 | 0);
      ctx.drawImage(bg, sx * sc, sy * sc, sc, sc, (sx - b / 2) | 0, (sy - b / 2) | 0, b, b);
    }
  }
  // растр: брейнрот = растр
  if (k > 0.15) {
    const level = Math.min(14, Math.round((k - 0.15) / 0.85 * 14));
    const p = level > 0 && rasterPattern(ctx, level);
    if (p) { ctx.globalAlpha = 0.7; ctx.fillStyle = p; ctx.fillRect(0, 0, vw, vh); }
  }
  // цвет уходит в пепел
  ctx.globalAlpha = k * 0.22;
  ctx.fillStyle = '#8A8D8F';
  ctx.fillRect(0, 0, vw, vh);
  // провалы кадра
  if (k > 0.8) {
    const n = Math.floor((k - 0.8) * 25);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = NIGHT;
    for (let i = 0; i < n; i++) {
      ctx.fillRect(0, rnd(tick * 29 + i) * vh | 0, vw, 1 + (rnd(i + tick) * 6 | 0));
    }
  }
  // по краям — киноварь
  if (k > 0.3) {
    ctx.globalAlpha = (k - 0.3) * 0.45;
    const grd = ctx.createRadialGradient(vw / 2, vh / 2, vw * 0.2, vw / 2, vh / 2, vw * 0.7);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, '#C23B2B');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, vw, vh);
  }
  ctx.globalAlpha = 1;
}

// ── Падения: у каждой стихии своё. f — 0..1 за время падения;
// к концу у всех одна подпись.
const POPUPS = ['ВЫ ВЫИГРАЛИ', 'ОБНОВИТЬ', 'ЕЩЁ 1 ВИДЕО', 'НЕ ПРОПУСТИ', 'ОСТАЛОСЬ 2 ШТ', 'ВАС ЖДУТ', 'ПРИНЯТЬ ВСЁ', '99+'];
function drawFall(ctx, kind, f) {
  const vw = scaler.vw, vh = scaler.vh;
  const a = Math.min(1, f / 0.62);                 // анимация; потом — подпись
  if (kind === 'sand') {
    // песок поднимается растром и засыпает кадр; сверху — последняя песчинка
    const h = vh * Math.min(1, a * 1.08);
    for (let i = 0; i < 900; i++) {
      const x = rnd(i * 3.1) * vw | 0;
      const y = vh - rnd(i * 7.7 + (t >> 3)) * h | 0;
      ctx.fillStyle = i % 3 ? '#D9CFB8' : '#3A3026';
      ctx.globalAlpha = 0.5 + 0.5 * rnd(i);
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = Math.min(1, a * 1.2) * 0.9;
    ctx.fillStyle = '#7a6034';
    ctx.fillRect(0, vh - h * 0.85, vw, h * 0.85);
    if (f > 0.5) {                                  // одна песчинка
      ctx.globalAlpha = 1; ctx.fillStyle = '#D9CFB8';
      ctx.fillRect(vw / 2 | 0, ((f - 0.5) * 2.2 * vh) % vh | 0, 1, 1);
    }
  } else if (kind === 'ice') {
    // телефон садится: экран гаснет, в чёрном стекле — ты сам
    ctx.globalAlpha = Math.min(1, a * 1.4);
    ctx.fillStyle = NIGHT; ctx.fillRect(0, 0, vw, vh);
    const pct = Math.max(0, Math.round(5 - a * 6));
    ctx.globalAlpha = 1;
    ctx.fillStyle = pct > 0 ? '#C23B2B' : '#3A3026';
    ctx.font = '6px "Press Start 2P","VT323",monospace';
    ctx.textAlign = 'center';
    ctx.fillText(pct + '%', vw / 2, 22);
    if (a > 0.7) {                                  // отражение странника
      ctx.globalAlpha = (a - 0.7) * 1.2;
      ctx.fillStyle = '#2a2622';
      const cx = vw / 2 | 0, cy = vh / 2 + 10 | 0;
      ctx.fillRect(cx - 3, cy - 14, 6, 6);          // голова
      ctx.fillRect(cx - 5, cy - 8, 10, 14);         // плечи
      ctx.fillRect(cx - 4, cy + 6, 3, 8); ctx.fillRect(cx + 1, cy + 6, 3, 8);
    }
    ctx.textAlign = 'left';
  } else if (kind === 'lake') {
    // жижа поднимается, мир плывёт волнами и тонет
    const world = layers.canvas('world'), bg = layers.canvas('bg');
    const sc = scaler.scale || 1;
    for (let y = 0; y < vh; y += 3) {
      const dx = Math.sin(y * 0.09 + t * 0.12) * (2 + a * 10);
      if (bg && bg.width) ctx.drawImage(bg, 0, y * sc, bg.width, 3 * sc, dx, y, vw, 3);
      if (world && world.width) ctx.drawImage(world, 0, y * sc, world.width, 3 * sc, dx, y, vw, 3);
    }
    ctx.globalAlpha = 0.25 + a * 0.6;
    ctx.fillStyle = '#1e5a14';
    const h = vh * Math.min(1, a * 1.1);
    ctx.fillRect(0, vh - h, vw, h);
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 30; i++) {
      const ph = (t * 0.015 + rnd(i)) % 1;
      ctx.fillStyle = '#5aa83a';
      ctx.fillRect(rnd(i * 5) * vw | 0, vh - ph * h | 0, 2, 2);
    }
  } else if (kind === 'junk') {
    // цифровой хлам: окна сыплются, пока не завалят кадр
    const n = Math.floor(a * 70);
    ctx.font = '6px "Press Start 2P","VT323",monospace';
    for (let i = 0; i < n; i++) {
      const w = 46 + (rnd(i * 2) * 50 | 0), h = 22 + (rnd(i * 3) * 24 | 0);
      const x = (rnd(i * 5) * (vw + 20) - 20) | 0, y = (rnd(i * 7) * (vh + 10) - 10) | 0;
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#E8DCC3'; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = i % 4 ? '#3A3026' : '#C23B2B'; ctx.fillRect(x, y, w, 6);
      ctx.fillStyle = '#E8DCC3'; ctx.fillText('✕', x + w - 7, y + 5);
      ctx.fillStyle = '#3A3026'; ctx.fillText(POPUPS[i % POPUPS.length], x + 3, y + 14);
    }
  } else {
    ctx.globalAlpha = 0.88; ctx.fillStyle = NIGHT; ctx.fillRect(0, 0, vw, vh);
    for (let i = 0; i < 260; i++) {
      const g = Math.random() * 90 | 0;
      ctx.fillStyle = `rgb(${g},${g},${g})`;
      ctx.fillRect(Math.random() * vw | 0, Math.random() * vh | 0, 2, 2);
    }
  }
  // подпись — одна на все падения
  if (f > 0.55) {
    ctx.globalAlpha = Math.min(0.92, (f - 0.55) * 3);
    ctx.fillStyle = NIGHT; ctx.fillRect(0, vh / 2 - 14, vw, 22);
    ctx.globalAlpha = Math.min(1, (f - 0.55) * 3) * (0.75 + 0.25 * Math.sin(t * 0.05));
    ctx.fillStyle = '#C23B2B';
    ctx.font = '10px "Press Start 2P","VT323",monospace';
    ctx.textAlign = 'center';
    ctx.fillText('вы упали в брейнрот', vw / 2, vh / 2);
    ctx.textAlign = 'left';
  }
  ctx.globalAlpha = 1;
}

export function fallKindOf() { return fallKind; }
export function isFrozen() { return brainrotFreeze; }
export function getLevel() { return brainrot; }
