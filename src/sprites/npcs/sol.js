// ═══════════════════════════════════════
// SOL INVICTUS — the still flame.
// A robed standing figure made mostly of layered fire, with a bronze
// solar disc for a head. He doesn't move much; he burns, calmly. Heat
// shimmers around him; embers fall instead of petals.
// ═══════════════════════════════════════
import { rect, px } from '../../render/draw.js';
import { t } from '../../core/time.js';
import { X } from '../../render/context.js';

const P = {
  void: '#050408',
  shadow: '#0a0a0a',
  bronze: '#7a4a14',
  bronzeMid: '#a06820',
  gold: '#b8860b',
  goldHi: '#daa520',
  sunflower: '#f4d03f',
  bone: '#e8dcc8',
  dbone: '#c8b8a8',
  // Fire palette (cold dim → hot core)
  fireDeep: '#3a0808',
  fireDim:  '#7a1410',
  fireMid:  '#c83018',
  fireHot:  '#ff7820',
  fireBright: '#ffb040',
  fireCore: '#fff4c8',
};

let npcProximity = 0;
export function setProximity(v) { npcProximity = v; }

export function drawNPC_sol(sx, sy) {
  // Anchor: ~28px wide, ~52px tall.
  const breath = Math.sin(t * 0.008) * 0.5;
  const sway = Math.sin(t * 0.003) * 0.4;
  const flameClock1 = t * 0.06;
  const flameClock2 = t * 0.09;
  const haloPulse = 0.78 + 0.22 * Math.sin(t * 0.005);
  const by = sy;
  const bx = sx + sway;
  const cx = bx + 14;

  // ═══ HEAT-WARMED GROUND ═══
  X.globalAlpha = 0.18 + 0.08 * Math.sin(t * 0.04);
  const ground = X.createRadialGradient(cx, by + 50, 4, cx, by + 50, 28);
  ground.addColorStop(0, P.fireBright);
  ground.addColorStop(0.5, 'rgba(200,48,24,0.4)');
  ground.addColorStop(1, 'rgba(0,0,0,0)');
  X.fillStyle = ground;
  X.fillRect(cx - 30, by + 36, 60, 22);
  X.globalAlpha = 1;

  // ═══ SHADOW ═══
  X.globalAlpha = 0.32;
  X.fillStyle = '#000';
  X.beginPath();
  X.ellipse(cx, by + 50, 12, 2.6, 0, 0, Math.PI * 2);
  X.fill();
  X.globalAlpha = 1;

  // ═══ BODY = COLUMN OF FIRE ═══
  // Drawn in vertical bands. Each band has its own clock so the flame
  // never settles into a clean shape. The outline is roughly:
  //   shoulders narrow → torso wider → tapers to a candle base.
  // Width profile per row (top-to-bottom). Index 0 = below the head.
  const rows = 28;
  const baseY = by + 14;
  // For each row, pick a half-width that breathes
  for (let i = 0; i < rows; i++) {
    const y_ = baseY + i;
    // Body taper: shoulders 5, mid 7, hem 4
    const taper = i < 4 ? 5
                : i < 12 ? 5 + (i - 4) * 0.25
                : i < 20 ? 7 - (i - 12) * 0.05
                : 7 - (i - 20) * 0.5;
    const wob = Math.sin(flameClock1 + i * 0.5) * 0.6 + Math.cos(flameClock2 + i * 0.3) * 0.4;
    const halfW = Math.max(2, Math.floor(taper + wob + breath * 0.3));

    // Outermost band — dim red
    rect(X, cx - halfW, y_, halfW * 2, 1, P.fireDim);
    // Mid band
    if (halfW >= 3) rect(X, cx - halfW + 1, y_, halfW * 2 - 2, 1, P.fireMid);
    // Hot band
    if (halfW >= 4) rect(X, cx - halfW + 2, y_, halfW * 2 - 4, 1, P.fireHot);
    // Bright core (only in the upper torso, like a candle wick area)
    if (halfW >= 5 && i > 1 && i < 16) {
      rect(X, cx - 1, y_, 2, 1, P.fireBright);
    }
    // Occasional very bright pixel — flame leap
    if (i > 0 && i < 14 && Math.random() > 0.93) {
      px(X, cx + (Math.random() < 0.5 ? -1 : 1), y_, P.fireCore);
    }
  }

  // ═══ INNER SKELETAL OUTLINE — visible faintly through the flame ═══
  // Static silhouette that suggests a robed body inside the burn.
  X.globalAlpha = 0.32;
  // Spine
  rect(X, cx, by + 16, 1, 22, P.bone);
  // Ribs
  for (let i = 0; i < 5; i++) {
    const ribY = by + 18 + i * 3;
    const ribW = 6 - Math.abs(i - 2) * 0.5;
    rect(X, cx - ribW, ribY, ribW * 2, 1, P.dbone);
  }
  // Pelvis hint
  rect(X, cx - 3, by + 35, 7, 1, P.dbone);
  X.globalAlpha = 1;

  // ═══ CANDLE-BASE PUDDLE — wax/melted bronze at his feet ═══
  const baseW = 12;
  rect(X, cx - baseW / 2, by + 42, baseW, 4, P.fireDeep);
  rect(X, cx - baseW / 2 + 1, by + 42, baseW - 2, 1, P.fireDim);
  // Highlights — molten ridges
  for (let i = 0; i < 3; i++) {
    const px_ = cx - 4 + i * 4 + Math.sin(t * 0.04 + i) * 0.5;
    px(X, px_, by + 43, P.fireMid);
  }

  // ═══ HEAT SHIMMER — wavy displacement above shoulders ═══
  X.globalAlpha = 0.22;
  for (let i = 0; i < 6; i++) {
    const sy_ = by + 8 - i;
    const off = Math.sin(t * 0.07 + i * 0.8) * 4;
    rect(X, cx + off - 5, sy_, 10, 1, P.fireHot);
  }
  X.globalAlpha = 1;

  // ═══ SOLAR DISC HEAD ═══
  const headTilt = Math.sin(t * 0.004) * 0.6;
  const hcx = cx + headTilt;
  const hcy = by + 6;

  // Outer halo glow
  X.globalAlpha = haloPulse * 0.35;
  const halo = X.createRadialGradient(hcx, hcy, 4, hcx, hcy, 18);
  halo.addColorStop(0, P.sunflower);
  halo.addColorStop(0.5, 'rgba(218,165,32,0.5)');
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  X.fillStyle = halo;
  X.fillRect(hcx - 18, hcy - 18, 36, 36);
  X.globalAlpha = 1;

  // ── 12 sun rays, slow rotation, no tapering — clean, austere ──
  const rayRot = t * 0.0008;
  X.globalAlpha = haloPulse;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + rayRot;
    const inner = 8;
    const outer = inner + 4 + Math.sin(angle * 2 + t * 0.02) * 0.8;
    for (let r = inner; r <= outer; r++) {
      const rx = Math.round(hcx + Math.cos(angle) * r);
      const ry = Math.round(hcy + Math.sin(angle) * r);
      px(X, rx, ry, r < inner + 2 ? P.gold : P.sunflower);
    }
  }
  X.globalAlpha = 1;

  // Disc body — bronze with darker rim
  X.fillStyle = P.bronze;
  X.beginPath(); X.arc(hcx, hcy, 8, 0, Math.PI * 2); X.fill();
  X.fillStyle = P.bronzeMid;
  X.beginPath(); X.arc(hcx, hcy, 6.5, 0, Math.PI * 2); X.fill();
  X.fillStyle = P.gold;
  X.beginPath(); X.arc(hcx, hcy, 4.5, 0, Math.PI * 2); X.fill();

  // ── FACE — closed eyes, small mouth, tear-streak of light ──
  // Closed eye arcs (just three pixels each)
  px(X, hcx - 3, hcy - 1, P.bronze);
  px(X, hcx - 2, hcy - 2, P.bronze);
  px(X, hcx - 1, hcy - 1, P.bronze);
  px(X, hcx + 1, hcy - 1, P.bronze);
  px(X, hcx + 2, hcy - 2, P.bronze);
  px(X, hcx + 3, hcy - 1, P.bronze);
  // Calm mouth
  px(X, hcx - 1, hcy + 2, P.bronze);
  px(X, hcx, hcy + 2, P.bronze);
  px(X, hcx + 1, hcy + 2, P.bronze);
  // Bright tear-streaks running down the face — light as wound
  X.globalAlpha = 0.7;
  rect(X, hcx - 3, hcy + 1, 1, 4, P.fireBright);
  rect(X, hcx + 3, hcy + 1, 1, 4, P.fireBright);
  px(X, hcx - 3, hcy + 5, P.fireCore);
  px(X, hcx + 3, hcy + 5, P.fireCore);
  X.globalAlpha = 1;

  // ═══ FALLING EMBERS — replace the old falling-petals ═══
  const emberCount = 5 + Math.floor(npcProximity * 4);
  for (let i = 0; i < emberCount; i++) {
    const ph = ((t * 0.0035 * (1 + npcProximity * 0.3)) + i * 0.21) % 1;
    if (ph < 0.93) {
      const ex = cx - 6 + i * 2 + Math.sin(ph * 10 + i * 1.2) * 4;
      const ey = by + 6 + ph * 50;
      X.globalAlpha = 0.6 * (1 - ph * 0.9);
      const ec = i % 3 === 0 ? P.fireCore : (i % 2 ? P.fireBright : P.fireHot);
      px(X, ex, ey, ec);
      // Trailing dim ember
      X.globalAlpha *= 0.4;
      px(X, ex, ey - 1, P.fireDim);
      X.globalAlpha = 1;
    }
  }

  // ═══ RISING SMOKE/HEAT WISPS from shoulders ═══
  for (let i = 0; i < 4; i++) {
    const wph = ((t * 0.012 + i * 0.27) % 1);
    const wx = cx - 5 + i * 3 + Math.sin(t * 0.01 + i * 1.3) * 2;
    const wy = by + 14 - wph * 22;
    X.globalAlpha = (1 - wph) * 0.18;
    rect(X, wx, wy, 2, 2, '#3a2a18');
    X.globalAlpha = 1;
  }

  // ═══ PROXIMITY: gentle warning — burn stronger when watched ═══
  if (npcProximity > 0.2) {
    X.globalAlpha = npcProximity * 0.18 + 0.05 * Math.sin(t * 0.04);
    const watcher = X.createRadialGradient(cx, by + 22, 6, cx, by + 22, 30 + npcProximity * 8);
    watcher.addColorStop(0, P.fireHot);
    watcher.addColorStop(1, 'rgba(0,0,0,0)');
    X.fillStyle = watcher;
    X.fillRect(cx - 35, by - 10, 70, 60);
    X.globalAlpha = 1;
  }
}
