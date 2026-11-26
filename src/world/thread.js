// ═══════════════════════════════════════
// МЯГКАЯ НИТЬ «КУДА ДАЛЬШЕ» (ROADMAP, играбельность п. 7; решения — weave/DECISIONS_2026-11-25.md).
// Три вещи, ни одна не в меню:
//  1) записка из следующего кольца: странник побыл в кольце N (минуту с четвертью, в сумме), а в
//     кольце N + 1 ещё не ступал — оттуда ветром прилетает лист, кувыркаясь, и ложится перед ним;
//     подобрал — входящая без подписи с печатью места (content/thread_notes.js). Одна на кольцо;
//     перечитать — в описи найденного, графа «Входящие». Ушёл, не подобрав, — лежит, где лёг;
//  2) вторая встреча с W — свои реплики и одна загадка-направление (content/dialogues.js
//     jester_second; STYLE §10 п. 10): после того, как первый разговор прочитан до конца;
//  3) акты — у тропы (world/actBoards.js).
// Счёта наружу нет: сколько записок впереди, не сказано нигде.
// ═══════════════════════════════════════
import { THREAD_NOTES } from '../content/thread_notes.js';
import { SEGMENTS } from '../content/ulitsa_db.js';
import { SIDE_RU } from './placeStamp.js';
import { ringAt, TOWN } from './disc.js';
import { wind } from './wind.js';

export const STAY = 60 * 75;                    // сколько побыть в кольце, прежде чем долетит (кадров, в сумме)
export const FLY = 200;                         // полёт листа (кадров)
const PICK = 800;                               // подобрать — как записку городка (world/lore.js)
export const thread = { got: new Set(), stay: {}, read: new Set(), skipped: new Set(), note: null };

export const stampOf = n => {
  const N = THREAD_NOTES[n];
  if (!N) return '';
  if (N.to === 'fire') return 'кольцо огня';
  return `кольцо ${N.to} · ${SIDE_RU[N.side]} · ${SEGMENTS[N.to - 1].name}`;
};
export const noteText = n => `${THREAD_NOTES[n].text}\n\nПечать: ${stampOf(n)}.`;   // печать — в конце, отдельной строкой (лист: перенос — пробелом)

// был ли странник в кольце: пройденные клетки — ключи «эпоха:сторона» (main.js flags.walked)
const walkedRing = (walked, n) => {
  if (n > 9) return false;
  const id = SEGMENTS[n - 1].id + ':';
  for (const k of walked) if (k.startsWith(id)) return true;
  return false;
};

// шаг: копит время в кольце, пускает лист, ведёт полёт; подобрал — { got: n, text }
// quiet — сейчас не до записок (сцена канала, лодка, красный полдень)
export function stepThread(player, walked, quiet = false) {
  const fx = player.x + 6, fy = player.y + 23, ring = ringAt(fx, fy), N = thread.note;
  if (ring >= 1 && ring <= 9) thread.stay[ring] = (thread.stay[ring] || 0) + 1;
  if (N) {
    N.t++;
    if (N.t >= FLY) {
      if (player.moving) N.armed = true;          // лёг — виден; подобрать — подойдя, а не стоя на месте
      const dx = player.x + 6 - N.x, dy = player.y + 10 - N.y;
      if (N.armed && dx * dx + dy * dy < PICK) {
        thread.note = null;
        thread.got.add(N.ring);
        return { got: N.ring, text: noteText(N.ring), x: N.x, y: N.y };
      }
    }
    return null;
  }
  if (quiet || ring < 1 || ring > 9 || thread.got.has(ring) || (thread.stay[ring] || 0) < STAY) return null;
  if (walkedRing(walked, ring + 1)) { thread.got.add(ring); thread.skipped.add(ring); return null; }   // там уже был — записка не нужна
  // лист летит снаружи — со стороны следующего кольца (прочь от городка), ложится перед странником
  const cx = (TOWN.x0 + TOWN.x1) / 2, cy = (TOWN.y0 + TOWN.y1) / 2;
  let ux = fx - cx, uy = (fy - cy) * 2;
  const L = Math.hypot(ux, uy) || 1; ux /= L; uy /= L;
  const x = Math.round(fx + ux * 48), y = Math.round(fy + uy * 44);   // в шаге-двух впереди, не под ногами
  thread.note = { ring, t: 0, x, y, x0: x + ux * 260 - wind.x * 40, y0: y + uy * 120 };
  return null;
}

// где лист сейчас и на какой высоте над землёй
export function notePos(N) {
  const u = Math.min(1, N.t / FLY), e = 1 - (1 - u) * (1 - u);
  const flut = Math.sin(N.t * 0.21) * 9 * (1 - u), sway = Math.sin(N.t * 0.07) * 14 * (1 - u);
  return { x: N.x0 + (N.x - N.x0) * e + sway, y: N.y0 + (N.y - N.y0) * e, h: Math.max(0, 70 * (1 - u) * (1 - u) + flut * 0.4), spin: N.t * 0.17 };
}

// рисунок: лист кувыркается (ширина ходит), под ним тень на земле; лёг — лежит, кромка подрагивает
const PAPER = '#d9cfb8', PAPER2 = '#b0a284', INK = '#3a3026', SHADE = '#0d0b0a';
export function drawThreadNote(ctx, t) {
  const N = thread.note;
  if (!N) return;
  const p = notePos(N), x = Math.round(p.x), y = Math.round(p.y);
  ctx.globalAlpha = 0.35; ctx.fillStyle = SHADE; ctx.fillRect(x - 3, y + 1, 7, 1); ctx.globalAlpha = 1;
  if (N.t < FLY) {
    const w = Math.max(1, Math.round(Math.abs(Math.cos(p.spin)) * 6)), yy = y - Math.round(p.h) - 3;
    ctx.fillStyle = Math.cos(p.spin) > 0 ? PAPER : PAPER2;
    ctx.fillRect(x - (w >> 1), yy, w, 4);
    if (w > 3) { ctx.fillStyle = INK; ctx.fillRect(x - (w >> 1) + 1, yy + 1, w - 2, 1); }
    return;
  }
  ctx.fillStyle = PAPER; ctx.fillRect(x - 3, y - 3, 7, 4);
  ctx.fillStyle = INK; ctx.fillRect(x - 2, y - 2, 5, 1); ctx.fillRect(x - 2, y, 3, 1);
  if (((t >> 4) + N.ring) % 5 === 0) { ctx.fillStyle = PAPER2; ctx.fillRect(x + 3, y - 4, 1, 1); }   // угол приподнимает ветер
}

// прочитан ли разговор с фигурой до конца (ui.js startDialogue: вторая встреча — свои реплики)
export const readThrough = npc => thread.read.has(npc);
export function noteReadThrough(npc) { if (npc) thread.read.add(npc); }

// опись найденного: «Входящие» — по порядку колец
export const incomingNotes = () => [...thread.got].filter(n => THREAD_NOTES[n] && !thread.skipped.has(n)).sort((a, b) => a - b).map(n => ({ n, text: noteText(n) }));

export const saveThread = () => ({ got: [...thread.got], stay: { ...thread.stay }, read: [...thread.read], skip: [...thread.skipped] });
export function loadThread(d) {
  if (!d) return;
  thread.got = new Set((d.got || []).filter(n => THREAD_NOTES[n]));
  thread.stay = {};
  for (const [k, v] of Object.entries(d.stay || {})) if (+k >= 1 && +k <= 9 && Number.isFinite(v)) thread.stay[k] = v;
  thread.read = new Set(d.read || []);
  thread.skipped = new Set(d.skip || []);
  thread.note = null;
}
export function _resetThread() { thread.got = new Set(); thread.stay = {}; thread.read = new Set(); thread.skipped = new Set(); thread.note = null; }
