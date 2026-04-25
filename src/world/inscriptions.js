// ═══════════════════════════════════════
// WALL INSCRIPTIONS — hidden texts revealed by proximity
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { X } from '../render/context.js';
import { scaler } from '../render/scaler.js';

const P = {
  bone: '#e8dcc8',
  crimson: '#6b0f1a',
  damber: '#a07818',
  toxic: '#3aff1a',
};

const hiddenInscriptions = {
  graffiti: ['мох помнит', 'поколения сходятся', 'стены читают тебя', 'ты уже субстрат', 'архивариус это ты', '.dna → мох'],
  church: ['LASCIATE OGNI SPERANZA', 'вобла не горит (проверено)', 'бога нет. мха — да', 'iä не пишется через у', 'запись #99 в каталоге'],
  crypt: ['девять ярусов. ниже нет.', 'лёд тает', 'предатели всплывают', 'первый круг — ты', 'второй круг — тоже ты'],
  library: ['полка 3.14', 'книга другого цвета', 'библиотека содержит эту', 'ты уже здесь', 'мох читает с тобой'],
  ruins: ['жильцы съехали раньше пожара', 'счётчик остановился в среду', 'ключ под ковриком ждёт', 'окна помнят свет внутри', 'дом горит изнутри тише'],
  fountain: ['ПОМНИ', 'рьё ушёл первым', 'крысы умнее', 'ангел без головы', 'голова в чаше'],
  altar: ['мох помнит', 'мох всегда помнил', 'ты помнишь с ним', 'подпись оформлена', 'до твоего рождения', 'продолжай'],
};

const wallProx = {};

export function updateProximity(player, locations) {
  for (const locId of Object.keys(hiddenInscriptions)) {
    const l = locations.find(ll => ll.id === locId);
    if (!l) continue;
    const dx = player.x - (l.x + l.w / 2);
    const dy = player.y - (l.y + l.h / 2);
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 60 && !player.moving) {
      wallProx[locId] = (wallProx[locId] || 0) + 1;
    }
  }
}

export function draw(camera, locations) {
  const ctx = X;
  for (const locId of Object.keys(hiddenInscriptions)) {
    const prox = wallProx[locId] || 0;
    if (prox < 60) continue;
    const l = locations.find(ll => ll.id === locId);
    if (!l) continue;
    const sx = l.x - camera.x;
    const sy = l.y - camera.y;
    if (sx < -100 || sx > scaler.vw + 100 || sy < -60 || sy > scaler.vh + 60) continue;

    const lines = hiddenInscriptions[locId];
    const revealed = Math.min(lines.length, Math.floor((prox - 60) / 180) + 1);

    ctx.font = '5px "Press Start 2P","VT323",monospace';
    for (let i = 0; i < revealed; i++) {
      const lineAge = prox - 60 - i * 180;
      const alpha = Math.min(0.5, lineAge / 120) * 0.9;
      const flick = 0.85 + 0.15 * Math.sin(t * 0.01 + i * 2);
      ctx.globalAlpha = alpha * flick;
      ctx.fillStyle = locId === 'altar' ? P.toxic :
                      (locId === 'graffiti' ? P.crimson :
                       (locId === 'church' ? P.damber : P.bone));
      const lx = l.x + 4 + (i % 2) * (l.w - 50);
      const ly = l.y - 8 + Math.floor(i / 2) * 7;
      ctx.fillText(lines[i], lx, ly);
      ctx.globalAlpha = 1;
    }
  }
}
