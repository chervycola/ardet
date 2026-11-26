// ═══════════════════════════════════════
// КОСТЁР ШУТА У КОЛЬЦА ОГНЯ (src/assets/WORLD_WEAVE.md §3½; DRAMATURGY IV: «костёр Шута — сцена, не проверка;
// играть, не просить»; пул FOLK: «Шут — после партии», «Шут — пойманный на честности», «Шут греет колпак»).
// Решения — weave/DECISIONS_2026-11-25.md (п).
//  · Где: южная тропа (по ней ведёт нить «куда дальше»), у внутренней кромки огня, справа от дороги.
//  · Огонь держит край: наружу кольцо не пускает (жар ровный, без щели) — кроме прохода у этого костра,
//    когда он расступился. Обратно — всегда и везде: «пауза или шаг назад — спасение, всегда».
//  · Правильного разговора нет как формулы. Попросить пройти — вежливый отказ на весь вечер (до рассвета).
//    Сыграть — W сдаёт и мухлюет, чтобы проиграть; странник выигрывает, как всегда. Сыграл, не попросив, —
//    огонь за спиной W тихо ложится до утра; W не смотрит вслед.
//  · Поддаться — один раз за путь: «Не смей. Это — моя работа.» Дальше — смотрит, и хватает.
//  · Ночью, редко: стоишь поодаль, не подходя, — W снимает колпак и держит над огнём; один бубенец звенит
//    чисто, не смешно. Шаг ближе — колпак на голове, сцены не было.
// ═══════════════════════════════════════
import { trailPoint, warpedDist, RINGS_D, FIRE_W, TOWN } from './disc.js';
import { dayIndex, phaseAt, skyAt } from './sky.js';
import { useTexts } from './useActions.js';
import { wind } from './wind.js';
import { isNamed } from './names.js';

// до знакомства фигуру не называют (world/names.js): «W» — после, «он» — до
const W = s => s.replace(/\{W\}/g, isNamed('jester') ? 'W' : 'Он').replace(/\{w\}/g, isNamed('jester') ? 'W' : 'он');

export const JF = { refused: -1, parted: -1, games: 0, caught: false, dealt: false, hand: 0, outside: false, cap: null, capNight: -1, press: 0 };
export let FIRE = null;                          // костёр: { x, y } (земля)
const CORR = 34;                                 // полуширина прохода у дороги
const today = t => dayIndex(t);
// вечер — до рассвета: сутки мира считаются с рассвета (sky.js), отказ и проход живут до него
export const openTonight = t => JF.parted === today(t);

// точка южной тропы, где кольцо — на глубине D (кромки кольца рваные: глубина тропы и кольца расходятся)
export function roadAt(D) {
  let lo = D - 400, hi = D + 400;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, p = trailPoint('south', m); if (warpedDist(p.x, p.y) < D) lo = m; else hi = m; }
  return trailPoint('south', (lo + hi) / 2);
}
// ── место ──
export function buildJesterFire(locations) {
  const p = roadAt(RINGS_D + 6);
  FIRE = { x: Math.round(p.x + 34), y: Math.round(p.y) };
  const loc = {
    id: 'jester_fire', name: 'W', zone: 'street', npc: 'jester',
    x: FIRE.x + 16, y: FIRE.y - 46, w: 30, h: 46,
    get look() { return isNamed('jester') ? 'У самой кромки огня — костёр поменьше, свой. У костра W: колода в руке, карты-надгробия в земле. Огонь кольца за его спиной ровный, без щели.' : 'У самой кромки огня — костёр поменьше, свой. У костра — человек в колпаке: колода в руке, карты-надгробия в земле. Огонь кольца за его спиной ровный, без щели.'; },
    get useAction() { return JF.dealt ? 'fire_yield' : 'fire_ask'; },
    get useLabel() { return JF.dealt ? '<i>↓</i>ПОДДАТЬСЯ' : '<i>…</i>ПОПРОСИТЬ ПРОЙТИ'; },
    altNow: () => JF.dealt ? { key: 'fire_move', label: '<i>♠</i>ХОДИТЬ' } : { key: 'fire_play', label: '<i>♠</i>СЫГРАТЬ' },
    drawSelf: (ctx, l, t) => drawCampfire(ctx, t),
  };
  locations.push(loc);
  // тексты действий — бумагой окна осмотра (main.js собирает по ходу партии)
  useTexts.fire_ask = { title: 'У огня', text: 'Просьба — у огня.' };
  useTexts.fire_yield = { title: 'У огня', text: 'Сбрасываешь туза.' };
  return loc;
}

// ── огонь держит край ──
const nearCorridor = (x, y) => {
  const d = y - TOWN.y1;                                               // южная тропа: глубина — по y
  return d > 0 && Math.abs(x - trailPoint('south', d).x) < CORR;
};
// точка в огне, куда наружу не пускают (обратно — всегда: снаружи огонь не держит)
export function fireBlocked(x, y, t) {
  if (JF.outside) return false;
  const d = warpedDist(x, y);
  if (d < RINGS_D + 6 || d > RINGS_D + FIRE_W - 4) return false;
  return !(openTonight(t) && nearCorridor(x, y));
}

// ── партия ──
const HANDS = [
  { mine: 'туз, дама, семёрка', his: 'двойка', cheat: 1 },
  { mine: 'король, десятка, восьмёрка', his: 'шестёрка', cheat: 2 },
  { mine: 'валет, девятка, туз', his: 'тройка', cheat: 3 },
];
// сдать: W мухлюет на виду — его карта торчит из колоды
export function deal(t) {
  JF.dealt = true; JF.hand = JF.games % HANDS.length;
  const H = HANDS[JF.hand];
  return W(`{W} сдаёт по три. Себе — не глядя. У тебя: ${H.mine}. Одна его карта торчит из колоды лицом наружу — ${H.his}.`);
}
// доиграть: странник выигрывает; пауза перед репликой — по размеру мухлежа (пул: «чем крупнее мухлёж, тем дольше тасует»)
function finish(t, lead) {
  const H = HANDS[JF.hand];
  JF.dealt = false; JF.games++;
  const shuffle = ['Тасует.', 'Тасует. Долго тасует.', 'Тасует. Долго тасует. Ещё тасует.'][H.cheat - 1];
  let s = W(`${lead} ${shuffle} «Опять выиграл. Не представляю, как у тебя это получается.»`);
  if (JF.refused !== today(t) && JF.parted !== today(t)) {
    JF.parted = today(t);
    s += W(' Огонь за его спиной ложится ниже, как трава под ветром. {W} не оборачивается.');
  }
  return s;
}
export function move(t) {
  return finish(t, 'Ходишь. {W} отвечает мимо масти — с таким видом, будто так и задумано.');
}
// поддаться: один раз за путь — серьёзно; дальше — взгляд
export function yieldCard(t) {
  if (!JF.caught) {
    JF.caught = true;
    return finish(t, 'Сбрасываешь туза. {W} кладёт колоду. Впервые без улыбки: «Не смей. Это — моя работа.» Партия идёт дальше, как ни в чём не бывало.');
  }
  return finish(t, 'Сбрасываешь туза. {W} смотрит. Хватает.');
}
// попросить пройти: вежливый отказ на весь вечер
export function ask(t) {
  if (openTonight(t)) return W('Огонь уже лёг. {W} смотрит в другую сторону.');
  if (JF.refused === today(t)) return W('{W} тасует. Про это — сказано.');
  JF.refused = today(t);
  return W('{W} кладёт карты. Без бубенцов, серьёзно: «Сегодня — нельзя.» И больше об этом не говорит.');
}

// ── шаг: снаружи ли странник; колпак над огнём ночью ──
export function stepJesterFire(player, t, still) {
  if (!FIRE) return null;
  const fx = player.x + 6, fy = player.y + 23, d = warpedDist(fx, fy);
  if (d > RINGS_D + FIRE_W - 2) JF.outside = true;
  else if (d < RINGS_D - 2) JF.outside = false;
  // жар держит: упёрся в огонь — строка под ногами (раз в две минуты)
  let ev = null;
  if (!JF.outside && d > RINGS_D - 6 && d < RINGS_D + 10 && !(openTonight(t) && nearCorridor(fx, fy))) {
    if (++JF.press === 50) ev = { hint: 'Жар ровный, без щели. Огонь держит край.' };
    if (JF.press > 7200) JF.press = 0;
  } else if (JF.press < 50) JF.press = 0;
  // колпак: ночью, раз за ночь, редко; дальняя треть подхода; стоять и смотреть
  const dist = Math.hypot(fx - (FIRE.x + 30), (fy - FIRE.y) * 2);
  const night = skyAt(phaseAt(t)).name === 'ночь';
  if (JF.cap) {
    if (!night || dist < 90 || dist > 220) { JF.cap = null; return ev; }        // шаг ближе — сцены не было
    JF.cap.t++;
    if (JF.cap.t === 300) return { ...ev, bell: true };                       // прогрелся — один чистый звук
    return ev;
  }
  if (night && still && dist > 110 && dist < 200 && JF.capNight !== today(t) && ((t / 60) | 0) % 7 === 0) {
    JF.capNight = today(t); JF.cap = { t: 0 };
  }
  return ev;
}
export const capOff = () => !!JF.cap;

// ── рисунок: свой костёр у кромки; поперёк дороги — языки кольца, что ложатся, когда огонь расступился ──
const C = '#C23B2B', S = '#E28A3A', N = '#0D0B0A', CHAR = '#1d0d07', BONE = '#D9CFB8';
function tongue(ctx, x, y, H, lean) {
  for (let j = 0; j < H; j++) {
    const k = j / H, w = Math.max(1, Math.round(3 * (1 - k))), sx = Math.round(x + lean * k * k);
    ctx.fillStyle = k < 0.35 ? S : C; ctx.fillRect(sx - (w >> 1), y - j, w, 1);
  }
}
function drawCampfire(ctx, t) {
  if (!FIRE) return;
  const { x, y } = FIRE, lean = Math.max(-2, Math.min(2, wind.at(x, y).x * 0.8));
  ctx.fillStyle = CHAR; ctx.fillRect(x - 8, y - 1, 16, 3); ctx.fillStyle = N; ctx.fillRect(x - 6, y, 12, 1);
  for (let k = 0; k < 3; k++) tongue(ctx, x - 3 + k * 3, y - 1, 7 + ((k === 1) ? 4 : 0) + Math.round(Math.sin(t * 0.21 + k * 2) * 1.5), lean);
  if (JF.cap) {                                                                  // колпак над огнём, бубенцами вниз
    const cx = x + 10, cy = y - 22;
    ctx.fillStyle = C; ctx.fillRect(cx - 3, cy, 3, 4); ctx.fillStyle = N; ctx.fillRect(cx, cy, 3, 4);
    ctx.fillStyle = C; ctx.fillRect(cx - 4, cy + 4, 2, 2); ctx.fillRect(cx + 3, cy + 4, 2, 2);
    ctx.fillStyle = BONE; ctx.fillRect(cx - 4, cy + 6, 1, 1); ctx.fillRect(cx + 4, cy + 6, 1, 1); ctx.fillRect(cx, cy + 5, 1, 1);
    ctx.fillStyle = '#5a4a3a'; for (let k = 0; k < 6; k++) ctx.fillRect(cx + 4 + k, cy - 1 + (k >> 1), 1, 1);   // рука держит
  }
}
// стена огня поперёк дороги на южной тропе: рисует main.js вместе с кольцом (ночью и днём); расступился — угли
export function drawGateFire(ctx, t) {
  if (!FIRE) return;
  const p = roadAt(RINGS_D + FIRE_W * 0.45), open = openTonight(t);
  for (let i = -CORR; i <= CORR; i += 5) {
    const x = Math.round(p.x + i), y = Math.round(p.y + Math.sin(i * 0.3) * 2);
    ctx.fillStyle = CHAR; ctx.fillRect(x - 2, y, 5, 2);
    if (open) { if (((t >> 3) + i) % 7 === 0) { ctx.fillStyle = C; ctx.fillRect(x, y, 1, 1); } continue; }   // лёг: угли
    tongue(ctx, x, y, 9 + Math.round((Math.sin(t * 0.17 + i) + 1) * 4), Math.sin(t * 0.05 + i) * 1.5);
  }
}

export const saveJesterFire = () => ({ refused: JF.refused, parted: JF.parted, games: JF.games, caught: JF.caught, capNight: JF.capNight });
export function loadJesterFire(d) {
  if (!d) return;
  for (const k of ['refused', 'parted', 'games', 'capNight']) if (Number.isFinite(d[k])) JF[k] = d[k];
  JF.caught = !!d.caught; JF.dealt = false; JF.cap = null;
}
export function _resetJesterFire() { Object.assign(JF, { refused: -1, parted: -1, games: 0, caught: false, dealt: false, hand: 0, outside: false, cap: null, capNight: -1, press: 0 }); }
