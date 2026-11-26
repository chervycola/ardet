// ═══════════════════════════════════════
// ШУТ ПЕРЕД ПАДЕНИЕМ (слово автора 26.11: «без разговора у костра не выйти за пределы основной карты, к
// пустыням брейнрота; а незадолго до падения мы видим шута ещё раз, возможно с парой шуток по существу»).
// За огнём распад дошёл до восьми десятых (падение — у ста, world/brainrot.js): впереди, на пути, проступает
// W — стоит, будто ждал. Короткий разговор: две шутки по существу и прощание (content/dialogues.js
// jester_edge; тексты нов., п). Договорили — отходит в сторону и гаснет. Дальше — как было: вперёд —
// падение и пробуждение дома («С возвращением. Как самочувствие?»), шаг назад — спасение. Раз на спуск:
// отпустило (распад ниже трёх десятых) или проснулся дома — в следующий раз встретит снова.
// ═══════════════════════════════════════
import { getLevel, inLoop } from './brainrot.js';
import { JF } from './jesterFire.js';
import { dialogues } from '../content/dialogues.js';
import { TOWN } from './disc.js';

export const MEET_AT = 80, RESET_AT = 30;
const IN = 45, OUT = 120;                         // проступает три четверти секунды; уходит две
export const EJ = { done: false, at: null, t: 0, phase: null };

export function stepEdgeJester(player) {
  const lvl = getLevel();
  if (lvl < RESET_AT && EJ.done && !EJ.phase) EJ.done = false;               // отпустило — в следующий раз встретит
  if (EJ.phase === 'in') {
    if (++EJ.t >= IN) {
      EJ.phase = 'talk'; EJ.t = 0;
      return { talk: { id: 'jester_edge', name: 'W', npc: 'jester', talkName: 'W', talkLines: dialogues.jester_edge, x: EJ.at.x, y: EJ.at.y, w: 24, h: 46 } };
    }
    return null;
  }
  if (EJ.phase === 'talk') { EJ.phase = 'out'; EJ.t = 0; return null; }     // разговор закрыт — мир снова идёт
  if (EJ.phase === 'out') { if (++EJ.t >= OUT) { EJ.phase = null; EJ.at = null; } return null; }
  if (EJ.done || inLoop() || !JF.outside || lvl < MEET_AT) return null;
  // впереди по пути — прочь от городка (туда, где край)
  const cx = (TOWN.x0 + TOWN.x1) / 2, cy = (TOWN.y0 + TOWN.y1) / 2;
  let ux = player.x - cx, uy = (player.y - cy) * 2;
  const L = Math.hypot(ux, uy) || 1; ux /= L; uy /= L;
  EJ.at = { x: Math.round(player.x + ux * 60), y: Math.round(player.y + uy * 34 - 22), dir: ux >= 0 ? 1 : -1 };
  EJ.done = true; EJ.phase = 'in'; EJ.t = 0;
  return null;
}
export function resetEdgeJester() { EJ.done = false; EJ.phase = null; EJ.at = null; EJ.t = 0; }

// прозрачность фигуры: проступает, стоит, пока говорит, отходит в сторону и гаснет
export function edgeJesterAlpha() {
  if (!EJ.phase) return 0;
  if (EJ.phase === 'in') return EJ.t / IN;
  if (EJ.phase === 'out') return 1 - EJ.t / OUT;
  return 1;
}
export const edgeJesterAt = () => (EJ.at && EJ.phase ? { x: EJ.at.x + (EJ.phase === 'out' ? Math.round(EJ.at.dir * EJ.t * 0.25) : 0), y: EJ.at.y } : null);
