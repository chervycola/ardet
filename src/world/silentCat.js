// ═══════════════════════════════════════
// МОЛЧАЛИВЫЙ КОТ — пятый наблюдатель. Сидит в пяти местах; кто подошёл
// ближе сорока точек — заметил (заметил четырежды — открыт пятый).
// Отвечает страннику, как кот:
//   бегущий или идущий прямо на него — отскок прочь; посидит, глядя
//   с обидой (хвост дёргается), и вернётся на место;
//   стоящий тихо дольше двух с половиной секунд — подойдёт и сядет у ног,
//   рядом с огнём в груди: кот идёт к настоящему теплу; тому, кому
//   доверяет, медленно моргает; странник ушёл — посидит и вернётся.
//   Голову держит к страннику, хвост гуляет по ветру. Молчит.
//   Глаза отражают огонь странника: ближе он — ярче (как у настоящих
//   котов: светится не глаз, а то, что в нём отражается).
// Считаются только коты рядом со странником; рисуются по глубине, в мире.
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { events } from '../core/events.js';
import { wind } from './wind.js';

const sightings = new Set();
let fifthUnlocked = false;

// где сидит кот: смещение от угла локации
const spots = [
  { loc: 'campfire', ox: -18, oy: 30 },        // слева от костра, рядом с костями, не на них
  { loc: 'terminal', ox: 44, oy: 0 },
  { loc: 'tent', ox: 52, oy: 40 },
  { loc: 'nocturnal', ox: 48, oy: 85 },
  { loc: 'raven', ox: 8, oy: 18 },
];

const CAT = '#050404', RIM = '#3a2a1f', EYE = '#E28A3A';
const NEAR = 420;          // дальше от странника кот не считается — сидит дома
const STILL = 150;         // столько шагов тишины — и кот идёт греться (2,5 с)
const LEASH = 90;          // дальше этого от дома не уходит
const SIGHT = 40;          // ближе — заметил
let cats = null, still = 0, solids = [], fire = null;

function init(locations) {
  cats = [];
  for (const s of spots) {
    const l = locations.find(ll => ll.id === s.loc);
    if (!l) continue;
    const hx = l.x + s.ox, hy = l.y + s.oy;
    cats.push({
      id: s.loc, hx, hy, x: hx, y: hy, st: 'sit', tm: 0, dir: 1, fx: 0, fy: 0, run: 0, walk: 0,
      ph: Math.random() * 100, blink: 120 + Math.floor(Math.random() * 300), shut: 0, slow: false,
      perch: { x: l.x, y: l.y, w: l.w, h: l.h, k: l.y + l.h + 0.5 },   // сидит на вещи — рисуется поверх неё
      eyes: [], eyesT: -1,
    });
  }
  solids = locations.filter(l => l.solid || l.solidBox).map(l => l.solidBox || l);
  const f = locations.find(l => l.id === 'campfire');
  fire = f ? { x: f.x + 18, y: f.y + 20, r: 16 } : null;      // в огонь кот не ходит
}

// лапы кота — (x+2, y+3); из того, внутри чего уже сидит, выйти можно
const inBox = (b, px, py) => px >= b.x && px < b.x + b.w && py >= b.y && py < b.y + b.h;
function blockedFrom(c, x, y) {
  const px = x + 2, py = y + 3, cx = c.x + 2, cy = c.y + 3;
  for (const b of solids) if (inBox(b, px, py) && !inBox(b, cx, cy)) return true;
  if (fire && Math.hypot(px - fire.x, py - fire.y) < fire.r) return true;
  return Math.hypot(x - c.hx, y - c.hy) > LEASH;
}

// отскок: прочь от странника, а если там стена — вбок
function flee(c, dx, dy, d) {
  const base = d > 0.01 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
  for (const off of [0, 0.6, -0.6, 1.2, -1.2, 1.8, -1.8]) {
    const a = base + off, ux = Math.cos(a), uy = Math.sin(a);
    if (blockedFrom(c, c.x + ux * 10, c.y + uy * 10) || blockedFrom(c, c.x + ux * 20, c.y + uy * 20)) continue;
    c.st = 'flee'; c.fx = ux; c.fy = uy; c.run = 18 + Math.random() * 8; c.dir = ux >= 0 ? 1 : -1;
    return;
  }
  c.st = 'wait'; c.tm = 240;                                     // бежать некуда — сжался и смотрит
}

// место у огня: сбоку от странника, у его ног
function warmSpot(c, player) {
  const fx = player.x + 6, side = c.x + 2 >= fx ? 1 : -1;
  return { x: fx + side * 10 - 2, y: player.y + 19 };
}

function walkTo(c, tx, ty, sp, check) {
  const ex = tx - c.x, ey = ty - c.y, e = Math.hypot(ex, ey);
  if (e < 0.5) { c.x = tx; c.y = ty; return 'there'; }
  const s = Math.min(e, sp), nx = c.x + ex / e * s, ny = c.y + ey / e * s;
  if (check && blockedFrom(c, nx, ny)) return 'blocked';
  c.x = nx; c.y = ny; c.walk += s;
  if (Math.abs(ex) > 0.3) c.dir = ex > 0 ? 1 : -1;
  return 'going';
}

// шаг: 60 раз в секунду (stepFx)
export function stepCats(player, locations) {
  if (!cats) init(locations);
  const pvx = player.vx || 0, pvy = player.vy || 0, ps = Math.hypot(pvx, pvy);
  still = ps < 0.05 ? still + 1 : 0;
  const px = player.x + 6, py = player.y + 22;                  // где странник у земли
  for (const c of cats) {
    const dx = c.x + 2 - px, dy = c.y + 3 - py, d = Math.hypot(dx, dy);
    if (d > NEAR && Math.hypot(c.hx - px, c.hy - py) > NEAR) {  // далеко: дома, не считается
      c.x = c.hx; c.y = c.hy; c.st = 'sit';
      continue;
    }
    if (d < SIGHT && !sightings.has(c.id)) {
      sightings.add(c.id);
      events.emit('cat.sighted', c.id, sightings.size);
      if (sightings.size === 4 && !fifthUnlocked) { fifthUnlocked = true; events.emit('cat.unlocked'); }
    }
    // моргает; у тепла — медленно (тому, кому доверяет)
    if (c.shut > 0) c.shut--;
    else if (--c.blink <= 0) {
      c.slow = c.st === 'warm';
      c.shut = c.slow ? 40 : 7;
      c.blink = c.slow ? 260 + Math.floor(Math.random() * 200) : 200 + Math.floor(Math.random() * 360);
    }
    const toward = pvx * dx + pvy * dy > 0;                      // идёт на кота
    const threat = (ps > 3 && d < 40) || (ps > 0.8 && d < 13 && toward) || (ps > 0.2 && d < 6);
    if (threat && c.st !== 'flee') flee(c, dx, dy, d);
    const ws = warmSpot(c, player);
    const wantsWarm = still > STILL && d < 60 && d > 12 && Math.hypot(ws.x - c.hx, ws.y - c.hy) <= LEASH;
    switch (c.st) {
      case 'flee': {
        const nx = c.x + c.fx * 2.6, ny = c.y + c.fy * 2.6;
        if (blockedFrom(c, nx, ny)) { c.st = 'wait'; c.tm = 240; break; }
        c.x = nx; c.y = ny; c.walk += 2.6; c.run -= 2.6;
        if (c.run <= 0) { c.st = 'wait'; c.tm = 240; }
        break;
      }
      case 'wait':
        if (--c.tm <= 0) c.st = wantsWarm ? 'come' : 'back';
        break;
      case 'sit':
        if (wantsWarm) c.st = 'come';
        break;
      case 'back':
        if (wantsWarm) { c.st = 'come'; break; }
        if (walkTo(c, c.hx, c.hy, 0.45, false) === 'there') c.st = 'sit';   // дорога назад — та же, что сюда
        break;
      case 'come': {
        if (ps > 0.3) { c.st = 'wait'; c.tm = 90; break; }       // пошёл — кот сел и смотрит
        if (Math.hypot(ws.x - c.hx, ws.y - c.hy) > LEASH) { c.st = 'back'; break; }
        const r = walkTo(c, ws.x, ws.y, 0.4, true);
        if (r === 'there') { c.st = 'warm'; c.blink = 90; }
        else if (r === 'blocked') { c.st = 'wait'; c.tm = 120; }
        break;
      }
      case 'warm':
        if (d > 30) { c.st = 'wait'; c.tm = 120; }               // ушёл — посидит и домой
        break;
    }
  }
}

// коты в кадре — для общего порядка рисования
export function catsInView(camX, camY, vw, vh) {
  if (!cats) return [];
  return cats.filter(c => c.x + 9 > camX && c.x - 4 < camX + vw && c.y + 6 > camY && c.y - 4 < camY + vh);
}
// глубина: лапы; кто сидит на своей вещи (терминал, палатка) — поверх неё
export const catDepth = c => inBox(c.perch, c.x + 2, c.y + 3) ? Math.max(c.perch.k, c.y + 4) : c.y + 4;

export function drawCat(ctx, c, player) {
  const x = Math.round(c.x), y = Math.round(c.y);
  const w = wind.at(c.x, c.y);
  ctx.fillStyle = CAT;
  if (c.st === 'flee' || c.st === 'back' || c.st === 'come') {
    // на ходу — сбоку: нос по ходу, хвост трубой назад
    const D = c.dir;
    const at = (dx, dy, wd = 1) => ctx.fillRect(D > 0 ? x - 1 + dx : x + 5 - dx - (wd - 1), y + dy, wd, 1);
    at(0, 1, 6); at(1, 2, 4);                                    // спина, брюхо
    at(4, 0, 3); at(5, -1);                                      // голова, ухо
    if (Math.floor(c.walk / 2.5) % 2) { at(1, 3); at(4, 3); } else { at(2, 3); at(3, 3); }
    const sw = Math.round(Math.sin(t * 0.2 + c.ph) * 0.6 - w.x * D * 0.9);
    at(-1, 0); at(-2 + Math.min(0, sw), -1 + Math.max(0, sw));
    ctx.fillStyle = RIM; at(1, 1, 3); at(4, 0);                  // спина в отсвете
    ctx.fillStyle = EYE; at(5, 0);
    c.eyes = [[D > 0 ? x + 4 : x, y]]; c.eyesT = t;
    return;
  }
  // сидит: голова к страннику — левее, прямо, правее; хвост — с другой стороны
  const pdx = player.x + 6 - (c.x + 2);
  const hx = pdx < -6 ? 0 : pdx > 6 ? 2 : 1, side = pdx >= 0 ? 1 : -1;
  ctx.fillRect(x, y + 1, 5, 3);
  ctx.fillRect(x + hx, y, 3, 1);
  ctx.fillRect(x + hx, y - 1, 1, 1); ctx.fillRect(x + hx + 2, y - 1, 1, 1);
  // хвост: у тепла лежит вокруг лап, в обиде — торчит и дёргается, так — гуляет по ветру
  let a;
  if (c.st === 'warm') a = Math.sin(t * 0.03 + c.ph) > 0.85 ? 0.5 : 0;
  else if (c.st === 'wait') a = 1.1 + 0.35 * Math.sin(t * 0.35 + c.ph);
  else a = 0.35 + 0.25 * Math.sin(t * 0.025 + c.ph) + w.x * side * 0.8;
  a = Math.max(0, Math.min(1.5, a));
  const tb = side > 0 ? x - 1 : x + 5;
  for (let k = 0; k < 4; k++) ctx.fillRect(tb - side * Math.round(Math.cos(a) * k), y + 3 - Math.round(Math.sin(a) * k), 1, 1);
  // отсвет: бок и ухо к страннику — тёплым
  ctx.fillStyle = RIM;
  ctx.fillRect(side > 0 ? x + 4 : x, y + 1, 1, 3);
  ctx.fillRect(side > 0 ? x + hx + 2 : x + hx, y - 1, 1, 1);    // ухо к огню
  // глаза: моргнул — нет; медленно моргает — прикрыты
  c.eyesT = t; c.eyes = [];
  if (c.shut > 0 && !c.slow) return;
  ctx.fillStyle = EYE;
  if (c.shut > 0) ctx.globalAlpha = 0.3;
  ctx.fillRect(x + hx, y, 1, 1); ctx.fillRect(x + hx + 2, y, 1, 1);
  ctx.globalAlpha = 1;
  if (!(c.shut > 0)) c.eyes = [[x + hx, y], [x + hx + 2, y]];
}

// отблеск глаз — на слое света (складывается): глаз отражает огонь странника,
// ближе он — ярче; видно и в темноте, и издалека — как настоящих котов ночью
export function drawCatEyes(fx, camX, camY, player) {
  if (!cats) return;
  const fx0 = player.x + 6, fy0 = player.y + 10;
  for (const c of cats) {
    if (c.eyesT !== t || !c.eyes.length) continue;
    for (const [ex, ey] of c.eyes) {
      const d = Math.hypot(ex - fx0, ey - fy0);
      const g = 0.12 + 0.5 * Math.max(0, Math.min(1, 1 - (d - 30) / 110));
      fx.globalAlpha = g;
      fx.fillStyle = EYE;
      fx.fillRect(ex - camX, ey - camY, 1, 1);
      fx.globalAlpha = g * 0.25;
      fx.fillRect(ex - camX - 1, ey - camY, 3, 1);
    }
  }
  fx.globalAlpha = 1;
}

export function getSightings() { return Array.from(sightings); }
export function loadSightings(arr) {
  sightings.clear();
  if (arr) arr.forEach(s => sightings.add(s));
}
export function isUnlocked() { return fifthUnlocked; }
export function setUnlocked(v) { fifthUnlocked = v; }

// для тестов
export const _cats = () => cats;
export function _reset() { cats = null; still = 0; sightings.clear(); fifthUnlocked = false; }
