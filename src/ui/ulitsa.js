// ═══════════════════════════════════════
// ULITSA UI — side-scrolling pixel street, not a text museum.
// One canvas: sky+ground gradient blended between segment palettes,
// landmark sprites placed at sign.x, the player walking left/right.
// A subtitle panel below shows the text of the nearest sign — facade
// or backyard depending on the side the player approached from.
// ═══════════════════════════════════════
import { state } from '../core/state.js';
import { TOWNLET, SEGMENTS, segmentAt, STREET_END } from '../content/ulitsa_db.js';
import { playDistantSound, playClick } from '../audio/audio.js';

const VIEW_W = 720;          // logical pixels in the strip view
const VIEW_H = 180;
const GROUND_Y = 130;        // top of ground band in the strip
const PLAYER_W = 6;
const PLAYER_H = 16;

let canvas, sbCtx;
let bodyEl, subEl, hudEl;

const player = { x: 220, dir: 1, walkPhase: 0 };
let camX = 0;
let rafId = 0;
let lastSign = null;
let nearestSign = null;
let approachSide = 'facade';   // 'facade' | 'backyard'
let firstEntry = true;
let staticPulse = 0;           // radio-static burst counter
let actSignShown = new Set();  // segment ids whose act banner was rendered

// Approach side rule:
//   - facade is read when you walked into the sign from the LEFT (going east)
//   - backyard is read when you walked in from the RIGHT (going west, "around")
// Mechanically this is just the sign of (lastApproachDir).
// `lastApproachDir` is the player.dir at the moment the player crosses into
// the sign's interaction range (within 12 px).

const INTERACT_R = 14;

function pickNearest() {
  const seg = segmentAt(player.x);
  let best = null, bestD = INTERACT_R + 1;
  const lookup = [TOWNLET, ...SEGMENTS];
  for (const s of lookup) {
    if (!overlaps(s.range, player.x - INTERACT_R, player.x + INTERACT_R)) continue;
    for (const sign of s.signs) {
      const d = Math.abs(sign.x - player.x);
      if (d < bestD) { bestD = d; best = sign; }
    }
  }
  return best;
}
function overlaps(range, lo, hi) { return range[1] >= lo && range[0] <= hi; }

// ── Subtitle ───────────────────────────────────────────────
function renderSubtitle() {
  if (!subEl) return;
  const s = nearestSign;
  if (!s) {
    const seg = segmentAt(player.x);
    subEl.innerHTML =
      `<div class="ul-era">${seg.era || ''}</div>` +
      `<div class="ul-segname">${seg.name || ''}</div>` +
      `<div class="ul-hint">— иди дальше: что-то да будет —</div>`;
    return;
  }
  const useBack = approachSide === 'backyard' && s.backyard;
  const text = useBack ? s.backyard : s.facade;
  const sideLabel = useBack ? 'обратная сторона' : 'лицевая';
  const lineTags = [];
  if (s.live) lineTags.push('<span class="ul-live">[запись продолжается]</span>');
  if (s.whisper) lineTags.push(`<span class="ul-whisper">${esc(s.whisper)}</span>`);
  subEl.innerHTML =
    `<div class="ul-signname">${esc(s.name)} <span class="ul-side">— ${sideLabel}</span></div>` +
    `<div class="ul-text">${esc(text).replace(/\n/g, '<br>')}</div>` +
    (lineTags.length ? `<div class="ul-tags">${lineTags.join(' ')}</div>` : '') +
    (s.backyard ? `<div class="ul-flip">[Z] обойти знак</div>` : '');
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── HUD (segment / position) ──────────────────────────────
function renderHUD() {
  if (!hudEl) return;
  const seg = segmentAt(player.x);
  const prog = Math.min(1, player.x / STREET_END);
  hudEl.innerHTML =
    `<div class="ul-hud-seg">§${seg.n || 0} ${seg.name}</div>` +
    `<div class="ul-hud-bar"><div class="ul-hud-fill" style="width:${(prog * 100).toFixed(1)}%"></div></div>` +
    `<div class="ul-hud-nav">← →  идти   |   [Z] обойти   |   [Esc] городок</div>`;
}

// ── Palette blending across segments ──────────────────────
function hexToRGB(h) {
  const v = parseInt(h.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
function rgbStr([r, g, b]) { return `rgb(${r|0},${g|0},${b|0})`; }
function blend(a, b, t) { return [a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t, a[2] + (b[2]-a[2])*t]; }

function paletteAt(x) {
  // Walk the segments left-to-right; blend across the boundary band (40 px).
  const all = [TOWNLET, ...SEGMENTS];
  // Find current and next
  let curIdx = 0;
  for (let i = 0; i < all.length; i++) {
    if (x >= all[i].range[0]) curIdx = i;
  }
  const cur = all[curIdx];
  const next = all[Math.min(all.length - 1, curIdx + 1)];
  if (cur === next) return cur.palette;
  // Blend in the last 60px of the current segment
  const boundary = cur.range[1];
  const bandHalf = 80;
  let t = 0;
  if (x > boundary - bandHalf) t = Math.min(1, (x - (boundary - bandHalf)) / bandHalf);
  if (x > boundary) t = 1;
  return {
    sky:    rgbStr(blend(hexToRGB(cur.palette.sky),    hexToRGB(next.palette.sky), t)),
    ground: rgbStr(blend(hexToRGB(cur.palette.ground), hexToRGB(next.palette.ground), t)),
    dust:   rgbStr(blend(hexToRGB(cur.palette.dust),   hexToRGB(next.palette.dust), t)),
    lamp:   t > 0.5 ? next.palette.lamp : cur.palette.lamp,
  };
}

// ── Frame ─────────────────────────────────────────────────
function draw() {
  if (!sbCtx) return;
  const ctx = sbCtx;
  ctx.imageSmoothingEnabled = false;
  // Camera follows player
  camX = Math.max(0, Math.min(STREET_END - VIEW_W, player.x - VIEW_W / 2));

  // ── Sky gradient at current local palette ──
  const palCenter = paletteAt(player.x);
  ctx.fillStyle = palCenter.sky;
  ctx.fillRect(0, 0, VIEW_W, GROUND_Y);
  // Distant horizon — slight darker band where ground meets sky
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, GROUND_Y - 8, VIEW_W, 8);

  // ── Ground ──
  ctx.fillStyle = palCenter.ground;
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  // Ground dither — small dots, sparse, denser nearer
  ctx.fillStyle = palCenter.dust;
  for (let i = 0; i < 70; i++) {
    const px = (i * 53 + ((camX >> 1) & 511)) % VIEW_W;
    const py = GROUND_Y + 6 + ((i * 17) % (VIEW_H - GROUND_Y - 8));
    ctx.fillRect(px, py, 1, 1);
  }

  // ── Segment background features (lamp posts at intervals) ──
  drawLampPosts(ctx, palCenter);

  // ── Act sign (floor banner at entry of segments 6..9) ──
  drawActSigns(ctx);

  // ── Landmarks ──
  const all = [TOWNLET, ...SEGMENTS];
  for (const seg of all) {
    if (seg.range[1] < camX - 30 || seg.range[0] > camX + VIEW_W + 30) continue;
    for (const sign of seg.signs) drawLandmark(ctx, sign);
  }

  // ── Live sections: scaffolding overlay ──
  drawScaffolding(ctx);

  // ── Player silhouette ──
  drawPlayer(ctx);

  // ── Radio-static burst (live door triggered) ──
  if (staticPulse > 0) {
    ctx.globalAlpha = staticPulse / 18;
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = i & 1 ? '#ffffff' : '#000000';
      ctx.fillRect(Math.random() * VIEW_W | 0, Math.random() * VIEW_H | 0, 2, 1);
    }
    ctx.globalAlpha = 1;
    staticPulse--;
  }

  // ── Edge fade — feels like more world beyond ──
  const fade = ctx.createLinearGradient(0, 0, VIEW_W, 0);
  fade.addColorStop(0, 'rgba(0,0,0,0.6)');
  fade.addColorStop(0.08, 'rgba(0,0,0,0)');
  fade.addColorStop(0.92, 'rgba(0,0,0,0)');
  fade.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function drawLampPosts(ctx, pal) {
  // Lamp every 50 px; type from palette
  const start = (Math.floor(camX / 50) - 1) * 50;
  for (let wx = start; wx < camX + VIEW_W + 50; wx += 50) {
    const sx = wx - camX;
    if (sx < -8 || sx > VIEW_W + 8) continue;
    const lampType = paletteAt(wx).lamp;
    if (lampType === 'none') continue;
    // Post
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(sx, GROUND_Y - 24, 2, 24);
    // Crossarm
    ctx.fillRect(sx - 1, GROUND_Y - 26, 4, 2);
    // Lamp head + glow
    let col = '#3a2a18', glow = null, r = 0;
    if (lampType === 'oil')     { col = '#aa6618'; glow = 'rgba(180,120,40,'; r = 10; }
    if (lampType === 'lantern') { col = '#c8881a'; glow = 'rgba(200,140,40,'; r = 12; }
    if (lampType === 'candle')  { col = '#daa520'; glow = 'rgba(218,165,32,'; r = 9; }
    if (lampType === 'gas')     { col = '#f4d03f'; glow = 'rgba(244,208,63,'; r = 14; }
    if (lampType === 'tungsten'){ col = '#ffb060'; glow = 'rgba(255,176,96,'; r = 16; }
    if (lampType === 'neon')    { col = '#ff4aff'; glow = 'rgba(255,74,255,'; r = 18; }
    if (lampType === 'screen')  { col = '#7adfff'; glow = 'rgba(122,223,255,'; r = 20; }
    if (lampType === 'ember')   { col = '#ff7020'; glow = 'rgba(255,112,32,'; r = 11; }
    if (glow) {
      const g = ctx.createRadialGradient(sx + 1, GROUND_Y - 27, 0, sx + 1, GROUND_Y - 27, r);
      g.addColorStop(0, glow + '0.65)');
      g.addColorStop(1, glow + '0)');
      ctx.fillStyle = g;
      ctx.fillRect(sx + 1 - r, GROUND_Y - 27 - r, r * 2, r * 2);
    }
    ctx.fillStyle = col;
    ctx.fillRect(sx, GROUND_Y - 28, 3, 2);
  }
}

function drawActSigns(ctx) {
  for (const seg of SEGMENTS) {
    if (!seg.actSign) continue;
    const wx = seg.range[0] + 6;
    const sx = wx - camX;
    if (sx < -40 || sx > VIEW_W + 40) continue;
    // Floor banner: dark plaque with two-line text
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(sx, GROUND_Y - 4, 38, 4);
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(sx, GROUND_Y - 5, 38, 1);
    // Title (top-left of segment)
    ctx.font = '6px "Press Start 2P","VT323",monospace';
    ctx.fillStyle = '#b8860b';
    const lines = seg.actSign.split('\n');
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], sx, 16 + i * 9);
    }
  }
}

function drawLandmark(ctx, sign) {
  const sx = sign.x - camX;
  if (sx < -16 || sx > VIEW_W + 16) return;
  const form = sign.form || 'plaque';
  const gy = GROUND_Y;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(sx - 4, gy, 8, 1);

  if (form === 'building') {
    // Tall box with door
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(sx - 7, gy - 22, 14, 22);
    ctx.fillStyle = '#2a2018';
    ctx.fillRect(sx - 6, gy - 21, 12, 20);
    ctx.fillStyle = '#0a0808';
    ctx.fillRect(sx - 2, gy - 12, 4, 12);   // door
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(sx + 1, gy - 8, 1, 1);     // handle
    // Window
    ctx.fillStyle = sign.live ? '#daa520' : '#3a3022';
    ctx.fillRect(sx - 4, gy - 18, 3, 3);
    ctx.fillRect(sx + 1, gy - 18, 3, 3);
  } else if (form === 'kiosk') {
    // Small awning + ledge
    ctx.fillStyle = '#3a2418';
    ctx.fillRect(sx - 5, gy - 10, 10, 10);
    ctx.fillStyle = '#6b0f1a';
    ctx.fillRect(sx - 6, gy - 12, 12, 2);
    ctx.fillStyle = '#daa520';
    ctx.fillRect(sx - 4, gy - 7, 1, 1);
  } else if (form === 'stand') {
    // Two-leg easel
    ctx.fillStyle = '#3a2818';
    ctx.fillRect(sx - 4, gy - 12, 8, 10);
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(sx - 3, gy, 2, 4);
    ctx.fillRect(sx + 1, gy, 2, 4);
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(sx - 3, gy - 11, 6, 1);
  } else if (form === 'surface') {
    // Wall fragment
    ctx.fillStyle = '#3a3328';
    ctx.fillRect(sx - 6, gy - 14, 12, 14);
    ctx.fillStyle = '#1a1a16';
    ctx.fillRect(sx - 5, gy - 13, 10, 2);   // shadow band
    // Plato shadow if the sign mentions тень
    if (/тень/.test(sign.name)) {
      ctx.fillStyle = '#0a0a0e';
      ctx.fillRect(sx - 3, gy - 10, 6, 8);
    }
  } else {
    // Default: post with placard
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(sx, gy - 12, 1, 12);
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(sx - 4, gy - 14, 9, 4);
    ctx.fillStyle = '#3a2818';
    ctx.fillRect(sx - 3, gy - 13, 7, 2);
  }
  // Highlight when in interaction range
  if (Math.abs(sign.x - player.x) < INTERACT_R) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx - 1, gy - 26, 2, 1);
  }
}

function drawScaffolding(ctx) {
  // Wrap landmarks of live signs in animated scaffolding bars
  const allSegs = [TOWNLET, ...SEGMENTS];
  for (const seg of allSegs) {
    for (const sign of seg.signs) {
      if (!sign.live) continue;
      const sx = sign.x - camX;
      if (sx < -16 || sx > VIEW_W + 16) continue;
      ctx.strokeStyle = '#aa7818';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.85;
      const w = 18, h = 28;
      ctx.strokeRect(sx - w/2, GROUND_Y - h, w, h);
      // Diagonal brace, flickering
      const flick = (Math.sin(Date.now() * 0.005 + sx) * 0.5 + 0.5);
      ctx.globalAlpha = 0.4 + flick * 0.5;
      ctx.beginPath();
      ctx.moveTo(sx - w/2, GROUND_Y - h);
      ctx.lineTo(sx + w/2, GROUND_Y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}

function drawPlayer(ctx) {
  const sx = Math.floor(player.x - camX);
  const baseY = GROUND_Y - PLAYER_H;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(sx - 3, GROUND_Y, 7, 1);
  // Cloaked silhouette
  ctx.fillStyle = '#0a0810';
  // Body
  ctx.fillRect(sx - 2, baseY + 4, 5, 10);
  // Hood
  ctx.fillRect(sx - 2, baseY, 5, 5);
  ctx.fillStyle = '#1a1420';
  ctx.fillRect(sx - 1, baseY + 1, 3, 3);
  // Chest fire pinprick — keeps the player legible at any palette
  ctx.fillStyle = '#ffb040';
  ctx.fillRect(sx, baseY + 7, 1, 1);
  ctx.fillStyle = '#ff7020';
  ctx.fillRect(sx, baseY + 8, 1, 1);
  // Foot dust when walking
  if (Math.abs(player.dir) > 0 && (Math.floor(Date.now() / 80) & 3) === 0) {
    ctx.fillStyle = '#5a4632';
    ctx.fillRect(sx + (player.dir > 0 ? -3 : 3), GROUND_Y - 1, 1, 1);
  }
}

// ── Tick loop ────────────────────────────────────────────
let lastDir = 1;
function tick() {
  if (!state.is('ulitsa')) return;
  // Read held keys
  const kx = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0);
  if (kx !== 0) {
    player.dir = kx;
    player.x = Math.max(0, Math.min(STREET_END - 1, player.x + kx * 1.4));
    player.walkPhase = (player.walkPhase + 1) % 60;
  }
  // Approach side: which way the player was MOVING when they last entered range
  const near = pickNearest();
  if (near && near !== lastSign) {
    // Player just stepped into a new sign — capture the approach direction
    approachSide = (player.dir >= 0) ? 'facade' : 'backyard';
    lastSign = near;
    if (near.live && Math.random() < 0.25) { staticPulse = 14; playDistantSound(); }
  }
  if (!near) lastSign = null;
  nearestSign = near;
  draw();
  renderSubtitle();
  renderHUD();
  rafId = requestAnimationFrame(tick);
}

// Held-key state
const keys = { ArrowLeft: false, ArrowRight: false };

function onKeyDown(e) {
  if (!state.is('ulitsa')) return;
  if (e.key === 'Escape') { e.preventDefault(); close(); return; }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    keys[e.key] = true;
  }
  if (e.key === 'z' || e.key === 'Z' || e.key === 'я' || e.key === 'Я') {
    e.preventDefault();
    if (nearestSign && nearestSign.backyard) {
      approachSide = approachSide === 'facade' ? 'backyard' : 'facade';
      playClick();
    }
  }
}
function onKeyUp(e) {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') keys[e.key] = false;
}

// ── Public API ───────────────────────────────────────────
export function open() {
  const el = document.getElementById('ulitsa');
  if (!el) return;
  if (!state.transition('ulitsa')) return;
  el.classList.add('on');
  // Start the player at the gate side of the axial-age segment
  player.x = 220;
  player.dir = 1;
  lastSign = null;
  nearestSign = null;
  approachSide = 'facade';
  staticPulse = 0;
  if (firstEntry && bodyEl) {
    firstEntry = false;
    // Brief gate intro before the strip animates in
    bodyEl.classList.add('ul-prelude');
    if (subEl) subEl.innerHTML =
      `<div class="ul-gates">Эти врата были предназначены для тебя одного. Обычно это узнают позже.</div>`;
    setTimeout(() => { bodyEl && bodyEl.classList.remove('ul-prelude'); }, 1700);
  }
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
}

export function close() {
  const el = document.getElementById('ulitsa');
  if (!el) return;
  el.classList.remove('on');
  cancelAnimationFrame(rafId);
  keys.ArrowLeft = keys.ArrowRight = false;
  state.transition('game');
}

export function init() {
  canvas = document.getElementById('ulitsa-strip');
  bodyEl = document.getElementById('ulitsa-body');
  subEl = document.getElementById('ulitsa-sub');
  hudEl = document.getElementById('ulitsa-hud');
  if (canvas) {
    canvas.width = VIEW_W;
    canvas.height = VIEW_H;
    sbCtx = canvas.getContext('2d');
  }
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
}

// Test-only handle
export const _test = {
  get player() { return player; },
  get nearestSign() { return nearestSign; },
  get approachSide() { return approachSide; },
  get keys() { return keys; },
  setPlayerX(x, dir = 1) { player.x = x; player.dir = dir; },
  setApproachSide(s) { approachSide = s; },
  pickNearest, paletteAt, segmentAt, draw,
  step() { tick(); },
  forceTickStep() { const kx = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0); if (kx) { player.dir = kx; player.x = Math.max(0, Math.min(STREET_END - 1, player.x + kx * 1.4)); } },
  resetFirstEntry() { firstEntry = true; },
};
