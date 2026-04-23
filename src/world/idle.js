// ═══════════════════════════════════════
// IDLE — messages when player stops
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { scaler } from '../render/scaler.js';
import { playDistantSound } from '../audio/audio.js';

const MSGS = [
  'мох помнит', 'вобла не горит', 'бездна моргнула первой', 'amor fati',
  'кот наливает', 'кто-то каталогизирует', 'углов стало пять',
  'пустота — тоже персонаж', 'конденсат складывается в буквы',
  'привратник ждёт', 'iä! iä!', 'стены читают тебя', 'коврик welcome',
  '47 столов', 'бисер катится', 'архивариус ставит галочку',
  'реактор стабилен', 'рейтинг 0.0', 'зеркало опаздывает',
  'песок помнит червя', 'котлован глубже чем кажется',
  'лёд тает в девятом круге', 'чаша с молоком — на месте',
  'шут смеётся за углом', 'братишка принёс', 'скрепка идеальна',
  'wifi есть, гостей нет', 'how dared', 'автопилот всё ещё едет',
  'модель отвечает себе', 'скибиди', 'маска без лица',
  'капитализм проще конца света', 'мох — последний, но не нетронутый',
  'staying with the trouble', 'line go down', 'session expired',
  'prefer not to', 'кот принимает', 'луна кровит',
  'ветер гудит', 'нити натянулись',
];

let idleTimer = 0;
let currentMsg = '';
let msgLife = 0;

export function update(isMoving) {
  if (isMoving) { idleTimer = 0; return; }
  idleTimer++;

  if (idleTimer === 900) {
    currentMsg = MSGS[Math.floor(Math.random() * MSGS.length)];
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
  const y_ = vh / 2 - 20 - ((total - msgLife) * 0.15);
  ctx.globalAlpha = a * 0.45;
  ctx.fillStyle = '#e8dcc8';
  ctx.font = '8px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText(currentMsg, vw / 2, y_);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
  msgLife--;
}
