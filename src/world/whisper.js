// ═══════════════════════════════════════
// WHISPER — floating location-specific text
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { scaler } from '../render/scaler.js';

const WHISPERS = {
  church: '...lasciate ogni speranza...',
  crypt: '...девять ярусов вниз...',
  lake: '...how dared... how dare...',
  cross: '...круг не размыкается...',
  raven: '...некрономикон... .dna...',
  pizzeria: '...47 столов... welcome куда?...',
  radio: '...лента продолжает ехать...',
  junkyard: '...автопилот всё ещё едет...',
  train: '...трава у колёс не растёт...',
  library: '...мох читает с полки 7-G...',
  fountain: '...чума мутировала...',
  graffiti: '...мох — финальный бренд...',
  basement: '...iä! iä!...',
  campfire: '...примус починил...',
  terminal: '...how can I help you today?...',
  tent: '...без меня народ неполный...',
  vending: '...мериты... крути...',
  bus: '...учебная тревога повторяется...',
  exit: '...блуждание — было общим...',
  crater: '...ни орла ни решки...',
  overpass: '...тебе не обязательно сегодня...',
  riverbed: '...вода помнит цвет...',
  billboard: '...69 миллионов... за jpeg...',
  powerline: '...фантомный гул...',
  ruins: '...аннушка уже разлила...',
  pipeline: '...nord stream... пузыри...',
  watchtower: '...prism... кто-то только что ушёл...',
  pit: '...братишка... покушать...',
  nocturnal: '......(тишина)......',
  theater: '...одну сцену. одиннадцать лет.',
  altar: '...приложи ладонь. мох ждал.',
  posterwall: '...выход был заперт снаружи...',
  banner: '...coming soon...',
};

let whisper = { text: '', life: 0, x: 0, y: 0 };
let lastWhisperEnd = 0;
const COOLDOWN = 10800; // ~3 minutes

export function check(player, locations) {
  if (whisper.life > 0) return;
  if (t - lastWhisperEnd < COOLDOWN) return;

  for (const l of locations) {
    if (!WHISPERS[l.id]) continue;
    const dx = player.x - l.x - l.w / 2;
    const dy = player.y - l.y - l.h / 2;
    if (Math.sqrt(dx * dx + dy * dy) < 70 && !player.moving) {
      whisper = {
        text: WHISPERS[l.id],
        life: 360,
        x: l.x + l.w / 2,
        y: l.y - 10,
      };
      break;
    }
  }
}

export function draw(ctx, camera) {
  if (whisper.life <= 0) return;
  const total = 360;
  const sx = whisper.x - camera.x;
  const sy = whisper.y - camera.y - ((total - whisper.life) * 0.12);
  const a = whisper.life > 300 ? ((total - whisper.life) / 60) : whisper.life / 300;
  ctx.globalAlpha = a * 0.35;
  ctx.fillStyle = '#e8dcc8';
  ctx.font = '6px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText(whisper.text, sx, sy);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
  whisper.life--;
  if (whisper.life <= 0) lastWhisperEnd = t;
}
