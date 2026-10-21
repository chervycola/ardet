// ═══════════════════════════════════════
// ХОД МХА НАВЕРХУ — двери изнанки U6 (канон: content/world_weave.js UNDERSIDE —
// «пифос (лечь и уснуть)» → «нора у подножия огня»; CONTENT_POOL «Шёпот мха в
// пифосе»). Вход — пасхалка, не кнопка: ночью, если задержаться у пифоса дольше,
// чем нужно, чтобы просто пройти мимо, он шепчет «...я мягче, чем числюсь...» —
// раз за ночь; кто понял — ложится, кто не понял — узнает в другую ночь. После
// шёпота у пифоса проявляется «ЛЕЧЬ», потом «УСНУТЬ» — вниз, в ход мха. Выход —
// нора у подножия огня: кольцо «сейчас», юг, в шаге от кромки огня; она же спуск
// (сцена, потом вниз). Сам ход и шаг по стуку сердца — world/underside.js.
// ═══════════════════════════════════════
import { under } from './underside.js';
import { sayAt, hush } from './whisper.js';
import { TOWN, RINGS, ringAt } from './disc.js';

const NI = '#0D0B0A', AS = '#8A8D8F', MG = '#3D4A3A';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K3 = '#34302a', K4 = '#3a3328';
const BR2 = '#3a2818', L2 = '#b0a284';
const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
function hh(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export const MOSS_WHISPER = '...я мягче, чем числюсь...';
const LOOK = 'Нора у подножия огня. Мох по краю сухой и тёплый.';

// ── нора: тёмный зев в валике рыхлой земли, по краю сухой мох, корни в зеве ──
function drawBurrow(ctx, loc) {
  const x = loc.x + loc.w / 2, gy = loc.y + loc.h;
  ctx.globalAlpha = 0.4; R(ctx, x - 12, gy, 25, 1, K0); ctx.globalAlpha = 1;
  for (let dy = -8; dy <= 0; dy++) for (let dx = -12; dx <= 12; dx++) {
    if ((dx / 12.5) ** 2 + ((dy + 4) / 4.6) ** 2 > 1) continue;            // валик
    let c;
    if ((dx / 8) ** 2 + ((dy + 4.2) / 2.8) ** 2 <= 1) c = dy < -6 ? K2 : dy < -5 ? K1 : NI;   // зев: дальняя стенка чуть видна
    else if (dy === 0) c = K3;
    else {
      const n = hh(dx, dy, 141);                                           // сухой мох по краю; к свету — слева
      c = dx < -4 ? (n < 0.45 ? L2 : K4) : dx > 5 ? (n < 0.22 ? L2 : K3) : (n < 0.35 ? L2 : n < 0.5 ? MG : K4);
    }
    R(ctx, x + dx, gy + dy, 1, 1, c);
  }
  R(ctx, x - 4, gy - 5, 1, 2, BR2); R(ctx, x + 3, gy - 6, 1, 2, BR2);   // корни свисают в зев
  for (const [dx, h] of [[-8, 2], [-3, 1], [4, 2], [9, 1]]) R(ctx, x + dx, gy - 8 - h, 1, h, L2);   // сухие травинки на дальнем краю
  R(ctx, x + 12, gy - 5, 1, 3, AS);                                     // кромка пеплом справа
}

// место норы: кольцо «сейчас», юг; до кромки огня — меньше 70 точек, но выход — ещё не в огне
function burrowPlace(locations) {
  const busy = (x, y) => locations.some(l => x > l.x - 60 && x < l.x + l.w + 60 && y > l.y - 80 && y < l.y + l.h + 60);
  for (const along of [0.46, 0.5, 0.42, 0.54, 0.38, 0.62, 0.3, 0.7]) {
    const x = Math.round(TOWN.x0 + along * (TOWN.x1 - TOWN.x0));
    for (let d = 1700; d <= 1800; d += 4) {
      const y = TOWN.y1 + d;
      if (ringAt(x, y) !== RINGS || ringAt(x, y + 30) !== RINGS || ringAt(x, y + 70) !== RINGS + 1) continue;
      if (!busy(x, y)) return { x, y };
      break;
    }
  }
  return { x: Math.round(TOWN.x0 + 0.46 * (TOWN.x1 - TOWN.x0)), y: TOWN.y1 + 1760 };
}

let pithos = null, burrow = null;
export function buildMossway(locations) {
  pithos = locations.find(l => l.id === 'pithos') || null;
  if (pithos) {                                                         // у пифоса действие проявляется после шёпота
    pithos.useAction = 'pithos_lie';
    pithos.useShown = () => under.seen.has('pithos_whisper');
    Object.defineProperty(pithos, 'useLabel', { get: () => (under.seen.has('pithos_lie') ? '<i>☾</i>УСНУТЬ' : '<i>☾</i>ЛЕЧЬ'), configurable: true, enumerable: true });
  }
  const b = burrowPlace(locations);
  burrow = { id: 'burrow', name: 'Нора у подножия огня', zone: 'street', x: b.x - 13, y: b.y - 11, w: 26, h: 11, look: LOOK, drawSelf: drawBurrow, useAction: 'burrow_down' };
  locations.push(burrow);
}
export const burrowLoc = () => burrow;

// ночью у пифоса: задержался дольше, чем нужно, чтобы просто пройти мимо, — шёпот;
// раз за ночь (day — номер суток); днём у пифоса прежний шёпот
let linger = 0, night = -1;
export function stepMossway(p, isNight, day) {
  if (!pithos) return;
  if (isNight) hush.add('pithos'); else hush.delete('pithos');
  const d = Math.hypot(p.x + 6 - (pithos.x + pithos.w / 2), p.y + 23 - (pithos.y + pithos.h));
  linger = isNight && !p.moving && d < 40 ? linger + 1 : 0;
  if (linger > 240 && night !== day && sayAt(MOSS_WHISPER, pithos.x + pithos.w / 2, pithos.y - 10)) {
    night = day;
    under.seen.add('pithos_whisper');
  }
}
export function _resetMossway() { linger = 0; night = -1; }
