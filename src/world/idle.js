// ═══════════════════════════════════════
// IDLE — messages when player stops
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { scaler } from '../render/scaler.js';
import { playDistantSound } from '../audio/audio.js';

const MSGS = [
  'вобла не горит', 'бездна моргнула первой', 'amor fati',
  'кот наливает', 'ведётся наблюдение', 'углов стало пять',
  'пустота — тоже персонаж', 'конденсат складывается в буквы',
  'привратник ждёт', 'iä! iä!', 'стены читают тебя', 'коврик welcome',
  '47 столов', 'бисер катится', 'архивариус ставит галочку',
  'реактор стабилен', 'рейтинг 0.0', 'зеркало опаздывает',
  'песок помнит червя', 'котлован глубже чем кажется',
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

// словарь ленты: под ногами — только там, где лента есть (кольцо «сейчас», огонь и пустошь
// за ним); в городке, древних кольцах, доме и изнанке его нет — тихое место молчит своим
const LENTA = new Set(['скибиди', 'шесть семь', 'mid съел норму', 'я cooked', 'aura 0',
  'chronically Ardet', '💀 ушёл на пенсию', 'rizz закончился', 'sigma сам себя слышит',
  'жиза, но тихо', 'по фактам — нет фактов']);
const QUIET_MSGS = MSGS.filter(m => !LENTA.has(m));
export const LENTA_WORDS = [...LENTA];                 // для строки на ходу у подписавшего (world/clauses.js)
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
    currentMsg = pool[Math.floor(Math.random() * pool.length)];
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
  ctx.globalAlpha = a * 0.45;
  ctx.fillStyle = '#e8dcc8';
  ctx.font = '8px "Press Start 2P","VT323",monospace';
  ctx.textAlign = 'center';
  const lines = currentMsg.split('\n');
  for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], vw / 2, y_ + i * 10);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
  msgLife--;
}
