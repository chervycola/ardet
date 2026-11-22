// ═══════════════════════════════════════
// IDLE — messages when player stops
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { scaler } from '../render/scaler.js';
import { playDistantSound } from '../audio/audio.js';
import { isNamed } from './names.js';
import { tremble, ghostShift, flicker, ghostSeed, GHOST_A } from '../render/ghost.js';
import { digitalText } from '../render/digital.js';

const MSGS = [
  'вобла не горит', 'бездна моргнула первой', 'amor fati',
  'кот наливает', 'ведётся наблюдение', 'углов стало пять',
  'пустота — тоже персонаж', 'конденсат складывается в буквы',
  'привратник ждёт', 'iä! iä!', 'стены читают тебя', 'коврик welcome',
  '47 столов', 'бисер катится', 'архивариус ставит галочку',
  'реактор стабилен', 'рейтинг 0.0', 'зеркало опаздывает',
  'песок помнит червя', 'котлован глубже, чем кажется',
  'лёд тает в девятом круге', 'чаша с молоком — на месте',
  'за углом смеются', 'братишка принёс', 'скрепка идеальна',
  'wifi есть, гостей нет', 'how dared', 'автопилот всё ещё едет',
  'модель отвечает себе', 'скибиди', 'маска без лица',
  'капитализм проще конца света', 'мох — последний, но не нетронутый',
  'staying with the trouble', 'line go down', 'session expired',
  'prefer not to', 'кот принимает', 'луна кровит',
  'ветер гудит', 'нити натянулись',
  '47 без существительного', 'тишина держит фон',   // прежде — с именем фигуры: имена по знакомству (world/names.js)
  'кот расставляет блюдца', 'трава боится',
  'цикл не спрашивает', 'архивариус не звал',
  'литургия без пророка', 'ключи утеряны',
  'две мусорки', 'дед видел документ',
  'ссылка ведёт никуда', '1% выжил, 99% нет',
  'шесть семь', 'mid съел норму', 'я cooked',
  'aura 0', 'chronically Ardet',
  '💀 ушёл на пенсию', 'rizz закончился',
  'sigma сам себя слышит', 'жиза, но тихо',
  'по фактам — нет фактов',
  // ── PHILOSOPHY PHASE 1 / PACKAGE G ──
  'врата открыты', 'зритель моргнул', 'опись. сундук. осёл.',
  'четвёртое поколение не поняло вопроса', 'тигр не провозглашает',
  'запись продолжается', 'три грамма меди', 'свет без лампы',
  'у стихии нет меморандумов',
];
// имена по знакомству (world/names.js, слово автора 18.11): строка, что называет фигуру,
// до знакомства идёт без имени — [чьё имя, как сказано до знакомства]
const ANON = {
  'архивариус ставит галочку': ['elder', 'кто-то ставит галочку'],
  'архивариус не звал': ['elder', 'никто не звал'],
};
export const _underfootLine = m => (Object.prototype.hasOwnProperty.call(ANON, m) && !isNamed(ANON[m][0]) ? ANON[m][1] : m);

// словарь ленты: под ногами — только там, где лента есть (кольцо «сейчас», огонь и пустошь
// за ним); в городке, древних кольцах, доме и изнанке его нет — тихое место молчит своим
const LENTA = new Set(['скибиди', 'шесть семь', 'mid съел норму', 'я cooked', 'aura 0',
  'chronically Ardet', '💀 ушёл на пенсию', 'rizz закончился', 'sigma сам себя слышит',
  'жиза, но тихо', 'по фактам — нет фактов']);
const QUIET_MSGS = MSGS.filter(m => !LENTA.has(m));
export const LENTA_WORDS = [...LENTA];
// строка ленты: в ней есть слово ленты (строка покоя у края или шум в строке на ходу) — дрожит цифрой
export const isLentaLine = text => [...LENTA].some(w => String(text || '').includes(w));                 // для строки на ходу у подписавшего (world/clauses.js)
export const _quietHasNoLenta = () => QUIET_MSGS.length > 0 && QUIET_MSGS.every(m => !LENTA.has(m)) && QUIET_MSGS.length < MSGS.length;

let idleTimer = 0;
let currentMsg = '';
let msgLife = 0;
let lastSaid = '', toggle = false;

// видна ли сейчас строка под ногами (покоя или хода): новая ждёт её конца
export const lineBusy = () => msgLife > 0;
// строка на ходу (world/clauses.js «Последний пункт»): рисуется как строка покоя — «вперемешку»
// буквально; две строки — через '\n'. Читающему без глаз — своё зеркало (общий у ленты
// lorepopup каждый шаг пишет туда '' и стёр бы строку); повтор того же слова объявляется
export function sayUnderfoot(text) {
  currentMsg = text; msgLife = 240; lastSaid = text;
  mirror(text);
}
let mirrorEl = null;
function mirror(text) {
  if (typeof document === 'undefined' || !document.body) return;
  if (!mirrorEl) {
    mirrorEl = document.createElement('div');
    mirrorEl.id = 'underfoot-live';
    if (mirrorEl.setAttribute) { mirrorEl.setAttribute('aria-live', 'polite'); mirrorEl.setAttribute('role', 'status'); }
    if (mirrorEl.style) mirrorEl.style.cssText = 'position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden';
    document.body.appendChild(mirrorEl);
  }
  toggle = !toggle;
  mirrorEl.textContent = text.replace(/\n/g, ' ') + (toggle ? '\u200b' : '');
}
export const _lastUnderfoot = () => lastSaid;
export function _resetUnderfoot() { lastSaid = ''; msgLife = 0; currentMsg = ''; idleTimer = 0; }

// lentaNear: странник там, где лента (main.js: кольцо ≥ RINGS); по умолчанию — тихое место
export function update(isMoving, lentaNear = false) {
  if (isMoving) { idleTimer = 0; return; }
  idleTimer++;

  if (idleTimer === 900) {
    const pool = lentaNear ? MSGS : QUIET_MSGS;
    currentMsg = _underfootLine(pool[Math.floor(Math.random() * pool.length)]);
    msgLife = 240;
  }

  if (idleTimer === 1800) {
    playDistantSound();
  }
}

export function draw(ctx) {
  if (msgLife <= 0) return;
  const vw = scaler.vw, vh = scaler.vh;
  const total = 240;
  const a = msgLife > 200 ? ((total - msgLife) / 40) : msgLife / 200;
  // под ногами странника, а не на крыше за ним
  const y_ = vh / 2 + 40 + ((total - msgLife) * 0.06);
  ctx.fillStyle = '#e8dcc8';
  ctx.font = '8px "Press Start 2P","VT323",monospace';
  ctx.textAlign = 'center';
  const lines = currentMsg.split('\n');
  const sd = ghostSeed(currentMsg);
  // слово ленты — цифровая дрожь (render/digital.js): ровно, а раз в несколько секунд сбой
  if (isLentaLine(currentMsg)) {
    ctx.globalAlpha = a * 0.45;
    for (let i = 0; i < lines.length; i++) digitalText(ctx, lines[i], vw / 2, y_ + i * 10, sd + i, 8);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1; msgLife--;
    return;
  }
  // тихая строка — призрачная (render/ghost.js): бледный двойник позади, сама подрагивает
  const [gx, gy] = ghostShift(sd), [jx, jy] = tremble(sd);
  ctx.globalAlpha = a * 0.45 * GHOST_A;
  for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], vw / 2 + gx, y_ + i * 10 + gy);
  ctx.globalAlpha = a * 0.45 * flicker(sd);
  for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], vw / 2 + jx, y_ + i * 10 + jy);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
  msgLife--;
}
