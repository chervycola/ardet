// ═══════════════════════════════════════
// META FX — breaking the 4th wall
// Screen moss (idle), cracked glass (triggered), dying pixels (time), desaturation (sessions)
// ═══════════════════════════════════════
import { scaler } from './scaler.js';
import { t } from '../core/time.js';

// ── SCREEN MOSS ──
// Green pixels grow from edges during idle, retreat on movement
export const screenMoss = {
  cells: [],
  idleGrowth: 0,
  maxCells: 800,
  retreatSpeed: 0.015,
  palette: [
    '#0a1a08', '#0d2a0b', '#1a3a12', '#2a5a1a',
    '#1a4a14', '#2a6a20', '#3a7a2a', '#4a8a34',
    '#5aff3a', '#3adf2a', '#6aaa40', '#8ab860',
    '#1a3010', '#0e1a08', '#3a5a20', '#506830',
  ],

  update(isMoving) {
    const vw = scaler.vw, vh = scaler.vh;
    if (isMoving) {
      this.idleGrowth = Math.max(0, this.idleGrowth - this.retreatSpeed);
      if (this.idleGrowth < 0.01 && this.cells.length > 0) {
        for (let i = 0; i < 3; i++) this.cells.pop();
      }
      return;
    }
    this.idleGrowth = Math.min(1, this.idleGrowth + 0.0002);
    if (this.idleGrowth > 0.08 && this.cells.length < this.maxCells && t % 12 === 0) {
      const edge = Math.floor(Math.random() * 4);
      let nx, ny;
      if (edge === 0) { nx = Math.floor(Math.random() * vw); ny = 0; }
      else if (edge === 1) { nx = Math.floor(Math.random() * vw); ny = vh - 1; }
      else if (edge === 2) { nx = 0; ny = Math.floor(Math.random() * vh); }
      else { nx = vw - 1; ny = Math.floor(Math.random() * vh); }
      if (this.cells.length > 0 && Math.random() > 0.3) {
        const parent = this.cells[Math.floor(Math.random() * this.cells.length)];
        nx = parent.x + Math.floor(Math.random() * 5) - 2;
        ny = parent.y + Math.floor(Math.random() * 5) - 2;
      }
      nx = Math.max(0, Math.min(vw - 1, nx));
      ny = Math.max(0, Math.min(vh - 1, ny));
      this.cells.push({
        x: nx, y: ny, age: 0,
        layer: Math.floor(Math.random() * 3),
      });
    }
    for (const c of this.cells) c.age++;
  },

  draw(ctx) {
    if (this.cells.length === 0) return;
    const fade = Math.min(1, this.idleGrowth * 4);
    for (const c of this.cells) {
      const cellFade = Math.min(1, c.age / 60) * fade;
      if (cellFade < 0.05) continue;
      ctx.globalAlpha = cellFade * (0.4 + c.layer * 0.15);
      const ci = ((c.x * 7 + c.y * 13 + c.layer * 3) & 15);
      ctx.fillStyle = this.palette[ci];
      const sz = 1 + c.layer;
      ctx.fillRect(c.x, c.y, sz, sz);
      if (c.layer === 2 && c.age > 30) {
        ctx.globalAlpha = cellFade * 0.3;
        ctx.fillStyle = this.palette[(ci + 4) & 15];
        ctx.fillRect(c.x, c.y - 1, 1, 1);
      }
    }
    ctx.globalAlpha = 1;
  },
};

// ── CRACKED GLASS ──
// Fracture lines from impact points. Persist until session end.
export const crackedGlass = {
  cracks: [],
  maxCracks: 12,

  add(ox, oy) {
    if (this.cracks.length >= this.maxCracks) return;
    const numLines = 3 + Math.floor(Math.random() * 5);
    const lines = [];
    for (let i = 0; i < numLines; i++) {
      const angle = Math.random() * Math.PI * 2;
      const len = 30 + Math.random() * 80;
      const branches = [];
      const nB = Math.floor(Math.random() * 3);
      for (let b = 0; b < nB; b++) {
        branches.push({
          pos: 0.3 + Math.random() * 0.5,
          angle: angle + (Math.random() - 0.5) * 1.2,
          len: len * (0.2 + Math.random() * 0.3),
        });
      }
      lines.push({ angle, len, branches });
    }
    this.cracks.push({ origin: { x: ox, y: oy }, lines, t });
  },

  clear() { this.cracks = []; },

  draw(ctx) {
    if (this.cracks.length === 0) return;
    ctx.save();
    ctx.lineWidth = 1;
    for (const c of this.cracks) {
      const age = Math.min(1, (t - c.t) / 30);
      for (const line of c.lines) {
        const ex = c.origin.x + Math.cos(line.angle) * line.len * age;
        const ey = c.origin.y + Math.sin(line.angle) * line.len * age;
        ctx.globalAlpha = 0.35 + 0.1 * Math.sin(t * 0.003);
        ctx.strokeStyle = 'rgba(200,200,200,0.6)';
        ctx.beginPath();
        ctx.moveTo(c.origin.x, c.origin.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(c.origin.x + 0.5, c.origin.y + 0.5);
        ctx.lineTo(ex + 0.5, ey + 0.5);
        ctx.stroke();
        ctx.lineWidth = 1;
        for (const b of line.branches) {
          const bx = c.origin.x + Math.cos(line.angle) * line.len * b.pos;
          const by = c.origin.y + Math.sin(line.angle) * line.len * b.pos;
          const bex = bx + Math.cos(b.angle) * b.len * age;
          const bey = by + Math.sin(b.angle) * b.len * age;
          ctx.globalAlpha = 0.25;
          ctx.strokeStyle = 'rgba(180,180,180,0.4)';
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bex, bey);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  },
};

// ── DYING PIXELS ──
// One random pixel goes black every N seconds. Shifting baseline.
export const dyingPixels = {
  dead: [],
  lastDeath: 0,
  interval: 3600, // ~60 sec @ 60fps

  update() {
    if (t - this.lastDeath < this.interval) return;
    this.lastDeath = t;
    if (this.dead.length >= 200) return;
    this.dead.push({
      x: Math.floor(Math.random() * scaler.vw),
      y: Math.floor(Math.random() * scaler.vh),
    });
  },

  draw(ctx) {
    if (this.dead.length === 0) return;
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.7;
    for (const p of this.dead) ctx.fillRect(p.x, p.y, 1, 1);
    ctx.globalAlpha = 1;
  },
};

// ── TAB TITLE ──
// Cycle mystical messages when tab hidden
const tabMessages = [
  'мох растёт', 'кот ждёт', 'огонь не гаснет', 'ты ушёл — мир остался',
  'стены читают пустоту', 'колесо крутится', 'кто-то каталогизирует',
  'тишина гуще', 'привратник ждёт', 'пиксели гаснут',
];
let titleInterval = null;
let originalTitle = 'ARDET';

export function initTabTitle() {
  originalTitle = document.title;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      let ti = 0;
      titleInterval = setInterval(() => {
        document.title = tabMessages[ti % tabMessages.length];
        ti++;
      }, 4000);
    } else {
      clearInterval(titleInterval);
      document.title = originalTitle;
    }
  });
}

// ── INIT ──
export function initMetaFx() {
  initTabTitle();
}
