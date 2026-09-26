// ═══════════════════════════════════════
// STREET — the ulitsa lifted onto the world surface.
// The street occupies world x ∈ [3200, 6000]: a walkable corridor east
// of the waste. Signs from ulitsa_db become ordinary world locations
// (look = facade; use = "обойти" → backyard). The gates teleport the
// player to the west end; walking back past the west edge returns to
// the gates. Epoch gradient is painted directly into the terrain.
// ═══════════════════════════════════════
import { TOWNLET, SEGMENTS } from '../content/ulitsa_db.js';
import { useTexts } from './useActions.js';

// Virtual street coords (0..3000 in ulitsa_db) → world coords.
// Virtual 200 (townlet end / gates corridor) lands at world 3200.
export const STREET_SHIFT = 3000;
export const STREET_X0 = 3200;            // west edge of the walkable street
export const STREET_END_W = 6000;         // east edge (virtual 3000 + shift)
// Walkable corridor band
export const STREET_Y_MIN = 800;
export const STREET_Y_MAX = 960;
export const STREET_ROAD_Y = 880;         // road centerline

export function isOnStreet(x) { return x > STREET_X0 - 100; }

// Which epoch segment the player is standing in, by WORLD x.
// Returns the segment object from ulitsa_db or null when off-street.
export function worldSegmentAt(x) {
  if (!isOnStreet(x)) return null;
  const vx = x - STREET_SHIFT;
  return SEGMENTS.find(s => vx >= s.range[0] && vx < s.range[1])
    || (vx >= SEGMENTS[SEGMENTS.length - 1].range[1] ? SEGMENTS[SEGMENTS.length - 1] : SEGMENTS[0]);
}

// Where the gates drop you, and where walking west returns you
export const STREET_SPAWN = { x: STREET_X0 + 30, y: STREET_ROAD_Y };
export const GATES_RETURN = { x: 1395, y: 885 };

// One-time gates line (session-scoped)
let gatesLineShown = false;
export function consumeGatesLine() {
  if (gatesLineShown) return false;
  gatesLineShown = true;
  return true;
}

// ── Street locations from sign data ──
// Each sign becomes a small world location standing on the north side
// of the road. look = facade (+live/whisper marks); use flips the plaque.
function buildStreetLocations() {
  const out = [];
  let i = 0;
  for (const seg of SEGMENTS) {
    for (const sign of seg.signs) {
      const id = `st_${i++}`;
      const wx = sign.x + STREET_SHIFT;
      let look = sign.facade;
      if (sign.whisper) look += `\n\n${sign.whisper}`;
      if (sign.live) look += `\n\n[запись продолжается]`;
      if (sign.backyard) look += `\n\n— обойти: «использовать» —`;
      const loc = {
        id, name: sign.name,
        x: wx - 7, y: STREET_ROAD_Y - 58, w: 14, h: 26,
        zone: 'street',
        look,
        streetForm: sign.form || 'plaque',
        streetSprite: sign.sprite || null,
        streetEnter: !!sign.enter,
        streetLive: !!sign.live,
        streetSeg: seg.n,
      };
      if (sign.enter) {
        loc.useAction = sign.enter;             // вход-действие вместо оборота
      } else if (sign.backyard) {
        const flipKey = `${id}_flip`;
        useTexts[flipKey] = {
          title: `${sign.name} — обратная сторона`,
          text: sign.backyard,
        };
        loc.useAction = flipKey;
      }
      out.push(loc);
    }
  }
  return out;
}

export const streetLocations = buildStreetLocations();

// ── Ветка «равнина · предрассветье»: первая поперечина радиальной
// структуры. Параллельна портикам, ниже улицы; пустота между — проходима.
export const BRANCH_PLAIN = { x0: 3560, x1: 3880, roadY: 1260, yMin: 1180, yMax: 1340 };
export const branchLocations = [
  { id: 'br_back', name: 'кольцевая веха', zone: 'street',
    x: BRANCH_PLAIN.x0 + 12, y: BRANCH_PLAIN.roadY - 58, w: 14, h: 26,
    streetForm: 'plaque', streetSprite: 'ring_post', useAction: 'branch_back',
    look: `Веха кольцевой. Обратно — портики: тот же век, другая сторона света. Пешком тоже можно; пустота проходима, но не учтена.` },
  { id: 'br_bell', name: 'столб с колоколом', zone: 'street',
    x: BRANCH_PLAIN.x0 + 120, y: BRANCH_PLAIN.roadY - 58, w: 14, h: 26,
    streetForm: 'plaque', streetSprite: 'bell_mute',
    look: `Столб с колоколом. Языка нет: снят до рассвета, чтобы не будил. Расписание звона висит, пункт один: «по необходимости». Необходимости не зафиксировано.` },
  { id: 'br_grass', name: 'сухая трава', zone: 'street',
    x: BRANCH_PLAIN.x0 + 200, y: BRANCH_PLAIN.roadY - 52, w: 14, h: 22,
    streetForm: 'surface',
    look: `Трава по пояс, сухая, стоит без ветра. Роса выпадает по графику и не достаётся никому. График соблюдается.` },
  { id: 'br_stone', name: 'милевой камень равнины', zone: 'street',
    x: BRANCH_PLAIN.x0 + 276, y: BRANCH_PLAIN.roadY - 52, w: 14, h: 22,
    streetForm: 'plaque', streetSprite: 'mile_stone',
    look: `Милевой камень. Числа нет: до полудня отсюда — не мера длины. Тени тоже нет — солнце ещё не взошло. Камень ждёт. Это его работа.` },
];

// Townlet gate-post sign (the one outside the gradient) keeps living in
// the waste as part of the gates look; not duplicated here.
void TOWNLET;
