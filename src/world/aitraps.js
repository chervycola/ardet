// ═══════════════════════════════════════
// ЛОВУШКИ ВЗГЛЯДА — вещи, которые надо пересчитать глазами: десятичные
// часы, рука на копии Рафаэля, лужа у Пантеона, табличка с подсказкой,
// верстовые столбы. Каждая стоит в своей эпохе; осмотр ничего не
// объясняет — считает смотрящий.
// ═══════════════════════════════════════
import { trailPoint, ringAt, RING_W } from './disc.js';

const N = '#0D0B0A', K = '#D9CFB8', P = '#8A8D8F', S = '#E28A3A', V = '#C23B2B', M = '#3D4A3A';
const D1 = '#15100c', D2 = '#241c14', D3 = '#2a2620', D4 = '#34302a', C1 = '#c8b89a';

// пиксельный шрифт 3×5 — только нужные знаки
const GLYPH = {
  'К': ['101', '110', '100', '110', '101'], 'А': ['010', '101', '111', '101', '101'],
  'Р': ['110', '101', '110', '100', '100'], 'У': ['101', '101', '011', '001', '110'],
  'Т': ['111', '010', '010', '010', '010'], 'М': ['101', '111', '111', '101', '101'],
  '1': ['010', '110', '010', '010', '111'], '2': ['110', '001', '010', '100', '111'],
  '=': ['000', '111', '000', '111', '000'], ' ': ['000', '000', '000', '000', '000'],
};
function text(ctx, s, x, y, col) {
  ctx.fillStyle = col;
  [...s].forEach((ch, i) => {
    const g = GLYPH[ch]; if (!g) return;
    g.forEach((row, r) => [...row].forEach((b, c) => { if (b === '1') ctx.fillRect(x + i * 4 + c, y + r, 1, 1); }));
  });
}
const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

// ── рисунки: x — центр, gy — земля ──
function drawDecimalClock(ctx, loc, t) {
  const x = loc.x + loc.w / 2, gy = loc.y + loc.h;
  R(ctx, x - 5, gy, 10, 2, 'rgba(0,0,0,0.35)');
  R(ctx, x - 1, gy - 16, 2, 16, D1); R(ctx, x - 3, gy - 2, 6, 2, D1);
  const cx = x, cy = gy - 23, r = 7;
  for (let dy = -r; dy <= r; dy++) {                       // циферблат
    const hw = Math.round(Math.sqrt(r * r - dy * dy));
    R(ctx, cx - hw, cy + dy, hw * 2 + 1, 1, dy === -r || dy === r ? D1 : C1);
    R(ctx, cx - hw, cy + dy, 1, 1, D1); R(ctx, cx + hw, cy + dy, 1, 1, D1);
  }
  for (let i = 0; i < 10; i++) {                           // десять делений
    const a = i * Math.PI / 5 - Math.PI / 2;
    R(ctx, Math.round(cx + Math.cos(a) * (r - 1.5)), Math.round(cy + Math.sin(a) * (r - 1.5)), 1, 1, N);
  }
  const a = ((t / 60 / 8640) % 10) * Math.PI / 5 - Math.PI / 2;   // одна стрелка: десятичный час
  for (let k = 1; k <= 4; k++) R(ctx, Math.round(cx + Math.cos(a) * k), Math.round(cy + Math.sin(a) * k), 1, 1, N);
  R(ctx, cx, cy, 1, 1, V);
}

function drawRaphael(ctx, loc) {
  const x = loc.x + loc.w / 2, gy = loc.y + loc.h;
  R(ctx, x - 9, gy, 18, 2, 'rgba(0,0,0,0.35)');
  // мольберт
  R(ctx, x - 8, gy - 12, 1, 12, D2); R(ctx, x + 7, gy - 12, 1, 12, D2); R(ctx, x, gy - 34, 1, 34, D2);
  R(ctx, x - 11, gy - 13, 23, 1, D2);
  // холст: занавес, папа в ризе слева, рука вынесена вперёд крупно
  const L = x - 11, T = gy - 36;
  R(ctx, L, T, 23, 23, D1); R(ctx, L + 1, T + 1, 21, 21, '#4a4438');
  R(ctx, L + 1, T + 1, 2, 21, M); R(ctx, L + 20, T + 1, 2, 21, M);
  R(ctx, L + 4, T + 3, 3, 3, C1); R(ctx, L + 4, T + 2, 3, 1, K);          // голова, тиара
  R(ctx, L + 3, T + 6, 5, 15, '#7a5a30');                                  // риза
  R(ctx, L + 8, T + 15, 3, 2, '#7a5a30');                                  // рукав
  R(ctx, L + 11, T + 13, 7, 5, C1);                                        // ладонь
  R(ctx, L + 10, T + 12, 1, 2, C1); R(ctx, L + 9, T + 11, 1, 1, C1);       // большой палец
  for (let i = 0; i < 5; i++) {                                            // и ещё пять
    const h = [3, 5, 6, 5, 4][i];
    R(ctx, L + 11 + i * 2, T + 13 - h, 1, h, C1);
  }
  R(ctx, L + 19, T + 11, 1, 2, C1);                                        // шестой — или край ладони
}

function drawKarakurt(ctx, loc) {
  const x = loc.x + loc.w / 2, gy = loc.y + loc.h;
  R(ctx, x - 8, gy, 16, 2, 'rgba(0,0,0,0.35)');
  R(ctx, x - 1, gy - 10, 2, 10, D3);
  const L = x - 18, T = gy - 26;
  R(ctx, L, T, 36, 16, N); R(ctx, L + 1, T + 1, 34, 14, '#1a1814');
  text(ctx, 'КАРАКУРТ', L + 3, T + 2, K);
  text(ctx, 'К=2', L + 12, T + 9, K);
  R(ctx, L + 29, T + 10, 4, 3, V); R(ctx, L + 30, T + 11, 2, 1, N);      // штамп
}

function drawPuddle(ctx, loc) {
  const x = loc.x + loc.w / 2, y = loc.y;
  const W = loc.w, H = loc.h;
  for (let r = 0; r < H; r++) {                            // лужа — ровная вода
    const inset = Math.round(Math.abs(r - (H - 1) / 2) * 3);
    R(ctx, x - W / 2 + inset, y + r, W - inset * 2, 1, '#1d211f');
  }
  ctx.globalAlpha = 0.55;
  const L = x - 17;                                        // отражение: колонны вниз, фронтон ниже
  for (let i = 0; i < 9; i++) R(ctx, L + i * 4, y + 1, 1, H - 4, P);
  R(ctx, L - 1, y + H - 3, 35, 1, P);
  ctx.globalAlpha = 1;
}

function drawMilestone(ctx, loc) {
  const x = loc.x + loc.w / 2, gy = loc.y + loc.h;
  R(ctx, x - 5, gy, 10, 2, 'rgba(0,0,0,0.35)');
  R(ctx, x - 6, gy - 3, 13, 3, D4);
  R(ctx, x - 5, gy - 16, 11, 13, '#5a564c'); R(ctx, x - 4, gy - 17, 9, 1, '#5a564c');
  R(ctx, x - 5, gy - 16, 1, 13, P);
  text(ctx, '1', x - 1, gy - 15, K);
  text(ctx, 'КМ', x - 4, gy - 9, K);
}

// ── тексты ──
const LOOK = {
  clock: 'Циферблат на десять часов, полдень — на пятёрке. Время отменили декретом, через полтора года отменили декрет. Часы остались.',
  raphael: 'Рука папы протянута к зрителю. Пальцев на ней столько, сколько успеешь насчитать, пока не поймёшь, что это ладонь.',
  karakurt: 'Табличка-подсказка: «В слове КАРАКУРТ — две К». Ниже штамп ОТК.',
  puddle: 'У ступеней лужа, в ней весь портик. В воде колонны стоят теснее, чем на камне.',
  milestone: 'Столб у тропы: «ДО ОГНЯ 1 КМ». Краска свежая.',
};

// ── раскладка: рядом с постройкой своей эпохи, не наезжая ни на что ──
const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export function free(box, locations) {
  const pad = { x: box.x - 4, y: box.y - 4, w: box.w + 8, h: box.h + 8 };
  return !locations.some(l => l !== box && hit(pad, l));
}

export function besideBuilding(locations, ring, side, w, h, extra) {
  const cand = locations.filter(l => l.archDraw && l.archRing === ring && l.archSide === side
    && (!extra.name || l.name === extra.name));
  for (const b of cand) for (const dir of [1, -1]) for (const gap of [10, 24, 40]) {
    const cx = dir > 0 ? b.archX + b.w / 2 + gap + w / 2 : b.archX - b.w / 2 - gap - w / 2;
    const box = { x: Math.round(cx - w / 2), y: b.archGy - h, w, h };
    if (free(box, locations)) return box;
  }
  return null;
}

export function buildAiTraps(locations) {
  const out = [];
  const add = (id, name, box, draw, look) => {
    if (!box) return;
    const l = { id, name, zone: 'street', ...box, look, drawSelf: draw };
    out.push(l); locations.push(l);
  };
  add('trap_clock', 'часы на столбе', besideBuilding(locations, 5, 'west', 16, 32, { name: 'ратуша с часами' }),
    drawDecimalClock, LOOK.clock);
  add('trap_raphael', 'копия Рафаэля', besideBuilding(locations, 4, 'west', 24, 38, {}), drawRaphael, LOOK.raphael);
  add('trap_karakurt', 'табличка-подсказка', besideBuilding(locations, 9, 'west', 36, 28, { name: 'экран-фасад' })
    || besideBuilding(locations, 9, 'south', 36, 28, {}), drawKarakurt, LOOK.karakurt);
  // лужа — перед Пантеоном, у ступеней (первым, где свободно)
  for (const pan of locations.filter(l => l.archDraw && l.archRing === 2 && l.name === 'Пантеон')) {
    const box = { x: pan.archX - 22, y: pan.archGy + 3, w: 44, h: 7 };
    if (!free(box, locations.filter(l => l !== pan))) continue;
    add('trap_puddle', 'лужа у Пантеона', box, drawPuddle, LOOK.puddle);
    break;
  }
  // верстовые столбы — на южной тропе, по одному в каждом кольце
  for (let n = 1; n <= 9; n++) {
    for (const dd of [0.5, 0.35, 0.65, 0.2, 0.8]) {
      const p = trailPoint('south', (n - 1 + dd) * RING_W);
      const box = { x: Math.round(p.x + 10), y: Math.round(p.y) - 18, w: 13, h: 18 };
      if (ringAt(box.x, box.y + box.h) === n && free(box, locations)) {
        add(`trap_mile_${n}`, 'верстовой столб', box, drawMilestone, LOOK.milestone);
        break;
      }
    }
  }
  return out;
}
