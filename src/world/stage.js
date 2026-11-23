// ═══════════════════════════════════════
// СЦЕНА ТЕАТРА ТЕНЕЙ (weave/SCENE_STAGE_2026-11-22.md «Зал полон»; §1а — «Дыхание» и «Квадрат»).
// Прочитавший «СЦЕНУ» садится (строка меню «СЕСТЬ»): шторка — и он сидит на трещине посреди
// круглой сцены, в своей декорации 232×122 (как комната дома: в масштабе странника), лицом к нам,
// спиной к ярусам. Рисует render/stage.js.
// «Дыхание» — ритм фонаря. На дальнем краю сцены человек с фонарём. 2 с фонарь у ног; вдох — он
// поднимает фонарь, свет идёт вверх по ярусам, и зал встаёт из пыли — полный, головы к сидящему
// (призрачная дрожь); задержка, под конец фонарь выше — всматривается; выдох — опускает, зал оседает.
// Длина — 30 с; каждый следующий приход короче (×0,85), с седьмого — 12 с навсегда; номер растёт
// при посадке, копить нечего. Приход — пока не отошёл от театра дальше 420 точек (как у кота);
// сел снова в тот же приход — зал тёмный, фонарь у ног. После конца — ничего нового (таблица покоя
// §4). За бумагой часы сцены ждут; красный полдень гасит по своей силе.
// «Квадрат» — что играют тени вокруг сидящего: четыре тени труппы (смеётся, горит, сидит, молчит)
// ходят каждая своим маршрутом по квадрату на плитах; подходя к центру, где сидит странник,
// сворачивают. Свой жест — в свой черёд, на ходу; та, что сидит, в свой черёд садится там, где
// застала очередь. С седьмого прихода — второй вариант: вдвое медленнее, огонь не вспыхивает,
// вместо стука — шарканье.
// Встать: ← → (A D), шаг пальцем или щелчок по самому страннику — шторка, и он у порога театра.
// ↑ ↓ (тап над и под фигурой) — повернуться к залу и обратно (шаг 4).
// ═══════════════════════════════════════
import { wasUsed, lookCount } from './relook.js';
import { PLACES } from '../assets/manifest.js';

// ── в городке: середина сцены (место театра в мировых координатах + sprites canon TH cx 40, cy 50)
// и порог, куда приводит подход к театру (там странник встаёт, выйдя из декорации)
export const STAGE_C = { x: 0, y: 0 }, DOOR = { x: 0, y: 0 };
export function placeStage(loc) {
  STAGE_C.x = loc.x + 40; STAGE_C.y = loc.y + 50;
  DOOR.x = loc.x + loc.w / 2 - 6; DOOR.y = loc.y + loc.h + 5;   // позиция странника у порога (как arriveAt)
}
placeStage({ x: 480, y: 200, w: 80, h: 60 });   // до проводки (проверки) — по содержимому городка

// ── декорация: своя карта в масштабе странника
export const DW = 232, DH = 122;
export const CENTER = { x: 116, y: 89 };                 // середина круглой сцены — трещина
export const SEAT_D = { x: 116, y: 92 };                 // ступни сидящего на трещине
export const PLATE = { cx: 116, cy: 89, rx: 62, ry: 16 };            // плиты сцены — эллипс
export const LANTERN = { x: 166, y: 81 };                // ступни человека с фонарём: дальний правый край плит

const AWAY = 420;              // отошёл дальше — приход кончился
const LEAD = 120;              // две секунды фонарь у ног
const SETTLE = 15;             // встал раньше — зал оседает за четверть секунды
// длина прихода в шагах (60 в секунду): 30 с, ×0,85, не короче 12 с
export const lenOf = n => Math.max(720, Math.round(1800 * Math.pow(0.85, Math.max(1, n) - 1)));
export const QUAD2_FROM = 7;   // с какого прихода — второй вариант «Квадрата»

// ev — что сыграет этот приход (шаг 3: шёпоты зала, рамка, мысли, задники; planVisit), adv —
// часы сцены шагнули в этот шаг; wi — место в пуле шёпотов зала; looked — осмотренные места с
// вклейкой, от давнего к недавнему; bd — какие из них уже проехали задником в этом круге
// шаг 4: back — сидящий повернулся к залу (↑, тап выше фигуры), gaze — насколько он смотрит в упор
// (0…1, догоняет поворот), heard — в каком приходе зал уже был слышен за веками, dust — номер суток,
// когда пыль у трещины стёрта (повторный осмотр театра до утра мира)
export const stage = { active: false, seated: false, n: 0, clock: 0, live: false, away: true, near: false, settle: 0, from: 0,
  ev: null, adv: false, wi: 0, looked: [], bd: [], back: false, gaze: 0, heard: -1, dust: -1 };

// сесть у театра (строка меню «СЕСТЬ», ui.js sitNow) — когда «СЦЕНА» прочитана хоть раз
export const stageAlt = () => (wasUsed('theater') ? { key: 'stage_sit', label: '<i>⌂</i>СЕСТЬ' } : null);

// сел: новый приход — сцена с начала; тот же приход — тёмный зал
export function sitStage() {
  if (stage.seated) return stage.live;          // уже сидит — идущий приход не гасить
  stage.seated = true; stage.settle = 0;
  if (stage.away) { stage.away = false; stage.n++; stage.clock = 0; stage.live = true; }
  else stage.live = false;
  return stage.live;
}
// встал: что светилось — оседает быстро
export function standStage() {
  if (!stage.seated) return;
  const l = lightOf();
  stage.seated = false; stage.live = false;
  stage.ev = null;                               // рамку сорвало, мысль погасла недописанной, задник за кулисой
  stage.back = false; stage.gaze = 0;            // встал — снова лицом к нам
  if (l > 0.01) { stage.settle = SETTLE; stage.from = l; }
}
// в декорацию и из неё (main.js: шторкой, как дом)
export function enterStage() { stage.active = true; return sitStage(); }
export function exitStage() { standStage(); stage.active = false; }

// свет фонаря по часам прихода: 0 — у ног, 1 — зал полон («Дыхание»: вдох, задержка, выдох)
function phase() {
  const L = lenOf(stage.n), c = stage.clock, I = Math.round(L * 0.2), E = Math.round(L * 0.2);
  if (c < LEAD) return { light: 0, lift: 0 };
  if (c < LEAD + I) { const k = (c - LEAD) / I; return { light: k * k * (3 - 2 * k), lift: Math.min(1, k * 1.5) }; }
  const exhale = L - LEAD - E;
  if (c < exhale) return { light: 1, lift: c >= exhale - LEAD ? 1.4 : 1 };          // под конец — выше: всматривается
  if (c < L - LEAD) { const k = (c - exhale) / E; return { light: 1 - k * k * (3 - 2 * k), lift: Math.max(0, 1 - k * 1.5) }; }
  return { light: 0, lift: 0 };
}
function lightOf() { return stage.seated && stage.live ? phase().light : stage.settle > 0 ? stage.from * stage.settle / SETTLE : 0; }

// шаг мира; fx, fy — где странник в городке (в декорации — середина сцены); free — на мир смотрят
// (не за бумагой), noon — красный полдень. Возвращает 'inhale' / 'exhale', когда сцена вдыхает и выдыхает,
// и 'peer', когда фонарь подняли выше — всматривается.
// После конца прихода часы идут ещё хвост (TAIL) — дописать начатое пером; нового не начинается
export const TAIL = 600;
export function stepStage(fx, fy, free = true, noon = false) {
  if (stage.settle > 0) stage.settle--;
  stage.adv = false;
  stage.near = Math.hypot(fx - STAGE_C.x, fy - STAGE_C.y) <= AWAY;
  if (!stage.seated) {
    if (!stage.near) stage.away = true;
    return null;
  }
  if ((!stage.live && !stage.ev) || !free || noon) return null;   // за бумагой и в полдень часы ждут
  const L = lenOf(stage.n), E = Math.round(L * 0.2);
  if (!stage.live && stage.clock >= L + TAIL) { stage.ev = null; return null; }   // хвосты дописаны
  stage.clock++; stage.adv = true;
  const c = stage.clock;
  if (stage.live && c >= L) stage.live = false;                 // отыграно: дальше ничего нового
  if (!stage.live) return null;
  if (c === LEAD) return 'inhale';
  if (c === L - 2 * LEAD - E) return 'peer';                       // фонарь выше: всматривается
  if (c === L - LEAD - E) return 'exhale';
  return null;
}
// ремарки для читающего без глаз (main.js — в строку для чтеца, как строку под ногами; §3)
export const REMARKS = { inhale: '(поднимает фонарь)', peer: '(всматривается)', exhale: '(опускает)' };

// повернуться к залу и обратно (только сидящему на сцене); взгляд догоняет поворот
export function faceHall(on) { if (stage.active && stage.seated) stage.back = !!on; }
export function stepGaze(viewBack, reduced = false) {
  const want = stage.seated && stage.back && viewBack ? 1 : 0;
  stage.gaze = reduced ? want : stage.gaze + (want - stage.gaze) * 0.08;
  if (Math.abs(stage.gaze - want) < 0.002) stage.gaze = want;
}
// закрыл глаза на сцене: раз за приход — зал на слух (main.js считает, сколько глаза закрыты)
export function hearHall() {
  if (!stage.seated || stage.heard === stage.n) return false;
  stage.heard = stage.n;
  return true;
}

// ═══ ЧТО ИГРАЕТ ПРИХОД (шаг 3; weave/SCENE_STAGE §2.4–§2.5) ═══
// Первый приход самый плотный: два шёпота зала, две мысли, два задника; дальше — по одному.
// Рамка над живым зрителем — всегда 8 с: встаёт, как только встал зал (на коротком приходе —
// вместе с залом) и рвётся не позже, чем фонарь опущен. Расписание сжимается вместе с длиной.
// «Будет ли» решено при посадке: зал есть всегда, мысли — если что-то услышано, задники — если
// что-то осмотрено. Пулы идут по кругу, без жребия.
export const RAMA = 480;                 // рамка: восемь секунд
export const CAPTION_AT = 180;           // подпись — через три секунды
export const BOARD_RUN = 360;            // задник проходит сцену за шесть секунд
export const THINK_HOLD = 60, THINK_RISE = 240;   // мысль дописана — постоит у капюшона и плывёт к ярусу
export const HALL_HOLD = 60, HALL_FADE = 150;     // шёпот зала дописан — постоит и гаснет на месте
// Перо на сцене пишет в своё окно [at, due]: сколько пишется строка, знает только рисунок (шрифт,
// масштаб — world/whisper.js preparePen), поэтому расписание отводит окна, а рисунок ускоряет перо
// ровно настолько, чтобы успеть (render/stage.js). Окна одного вида не пересекаются.
// шёпоты зала: быт зрителей, сказанный мимо огня (пул по порядку и по кругу)
export const HALL_LINES = [
  '...тише... начинается...',
  '...пальто сдай... потом заберём...',
  '...в прошлый раз было длиннее...',
  '...номерок не потеряй...',
  '...буфет до третьего звонка...',
];
// места, у которых есть вклейка (assets/manifest.js PLACES); театр не в счёт
export const BOARD_IDS = Object.keys(PLACES).filter(id => id !== 'theater');
// осмотрел место: в конец списка (самое недавнее)
export function noteLookedPlace(id) {
  if (!BOARD_IDS.includes(id)) return;
  const i = stage.looked.indexOf(id);
  if (i >= 0) stage.looked.splice(i, 1);
  stage.looked.push(id);
}
// m задников на приход: последние осмотренные, ещё не проехавшие в этом круге; по порядку от
// старшего из выбранных. Круг проехал весь — сначала
export function takeBackdrops(m) {
  if (!stage.looked.length || m <= 0) return [];
  let fresh = stage.looked.filter(id => !stage.bd.includes(id));
  if (!fresh.length) { stage.bd = []; fresh = stage.looked.slice(); }
  const pick = fresh.slice(-m);
  stage.bd.push(...pick);
  return pick;
}
// расписание прихода n (номер уже вырос при посадке). thoughts — [{ text, ring }], boards —
// [{ id, solid }]; лишнее сверх нормы прихода не играется
export function planVisit(n, thoughts = [], boards = []) {
  const L = lenOf(n), I = Math.round(L * 0.2), full = LEAD + I, exhale = L - LEAD - Math.round(L * 0.2), endBy = L - LEAD;
  const first = n <= 1, m = first ? 2 : 1;
  const ev = [];
  ev.push({ kind: 'rama', at: Math.max(LEAD, Math.min(full, L - LEAD - RAMA)), dur: RAMA });
  ev.push({ kind: 'clap', at: full + 30, dur: 90 });
  // окна: [a, b) на k штук подряд, без пересечений
  const wins = (a, b, k) => Array.from({ length: k }, (_, i) => [Math.round(a + (b - a) * i / k), Math.round(a + (b - a) * (i + 1) / k)]);
  // шёпот зала — пока зал стоит: с середины вдоха до середины выдоха (гаснет вместе с ним)
  for (const [a, b] of wins(LEAD + Math.round(I / 2), exhale + Math.round(I / 2), first ? 2 : 1)) {
    const text = HALL_LINES[stage.wi % HALL_LINES.length];
    ev.push({ kind: 'hall', at: a, due: b, text, seat: stage.wi });
    stage.wi = (stage.wi + 1) % HALL_LINES.length;
  }
  // мысли — одна за другой, каждая в своём окне: пишется у капюшона и доплывает до своего ряда к концу
  // окна; последняя — пока фонарь поднят. Первый приход — с шестой секунды, дальше — так, чтобы на
  // мысль было не меньше восьми секунд
  const ths = thoughts.slice(0, m);
  if (ths.length) {
    const a0 = Math.max(LEAD, Math.min(Math.round(L * (first ? 0.2 : 0.42)), endBy - 480 * ths.length));
    wins(a0, endBy, ths.length).forEach(([a, b], i) => ev.push({ kind: 'thought', at: a, due: b, text: ths[i].text, ring: ths[i].ring, side: i % 2 }));
  }
  const bdAt = first ? [0.40, 0.66] : [0.45];
  boards.slice(0, m).forEach((b, i) => ev.push({ kind: 'board', at: Math.min(Math.round(L * bdAt[i]), L - BOARD_RUN - 30), dur: BOARD_RUN, id: b.id, solid: !!b.solid }));
  ev.sort((a, b) => a.at - b.at);
  return ev;
}
// звуковые метки на шаг часов c: рамка щёлкает, встав и порвавшись, между — тик на пороге
// слышимости; шёпот зала — шорох программки с места; задник — скрип блока и каната
export function cuesAt(c, ev = stage.ev) {
  const out = [];
  if (!ev) return out;
  for (const e of ev) {
    const a = c - e.at;
    if (e.kind === 'rama') {
      if (a === 0 || a === e.dur) out.push({ s: 'click' });
      else if (a > 0 && a < e.dur && a % 40 === 0) out.push({ s: 'tick' });
    } else if (e.kind === 'hall' && a === 0) out.push({ s: 'rustle', seat: e.seat, text: e.text });
    else if (e.kind === 'board' && a >= 0 && a < e.dur && a % 90 === 0) out.push({ s: 'creak', pan: 0.9 - 1.8 * a / e.dur });
  }
  return out;
}
// событие прихода, идущее сейчас: возраст по часам сцены (null — не идёт)
export const ageOf = (e, c = stage.clock) => (c >= e.at && (e.dur === undefined || c < e.at + e.dur) ? c - e.at : null);

// что рисовать. noon — сила красного полудня 0..1: фонарь опускают и зал гаснет вместе с ним.
// В городке (sprites canon draw_theater) человек с фонарём стоит у края, пока странник рядом и
// «СЦЕНА» прочитана; в декорации (render/stage.js) — всегда
export function stageView(noon = 0) {
  const k = Math.max(0, Math.min(1, +noon || 0));
  const on = stage.active || stage.seated || stage.settle > 0 || (stage.near && wasUsed('theater'));
  if (!on) return null;
  const p = stage.seated && stage.live ? phase() : { light: 0, lift: 0 };
  return { light: lightOf() * (1 - k), lift: k > 0.5 ? 0 : p.lift, seated: stage.seated, quad2: stage.n >= QUAD2_FROM };
}

// ═══ «КВАДРАТ» ═══
// Квадрат на плитах в «плане»: u, v ∈ [−1, 1]; в декорации x = cx + 40u, y = cy + 10v (сцена
// круглая, вид сверху под углом). Углы A, B, C, D; центр — там, где сидит странник.
// Маршруты — по восемь отрезков: стороны и диагонали; на диагонали тень идёт прямо к центру и в
// последний миг сворачивает влево, обходя его по дуге за спиной (v < 0 — дальше от нас; v на экране
// идёт вниз, к нам, поэтому «влево по ходу» — это рост угла), и выходит на ту же диагональ.
export const QUAD = { cx: CENTER.x, cy: CENTER.y, hx: 40, hy: 10, avoid: 0.45 };
const CORNER = { A: [-1, -1], B: [1, -1], C: [1, 1], D: [-1, 1] };
// один обход на всех (как у Беккета — тени на одной петле, порознь), у каждой своё место на ней
// (OFF). Места не через полпетли: на полпетли тени шли бы всё время в одном столбце, одна за
// другой, и чёрное сливалось бы в одну длинную фигуру. Сходятся только мимоходом, идя навстречу
const LOOP = ['A', 'C', 'B', 'A', 'D', 'B', 'C', 'D', 'A'];
export const KINDS = ['laugh', 'burn', 'sit', 'silent'];          // смеётся, горит, сидит, молчит
export const TURN = 360;      // очередь жеста — шесть секунд; полный круг очередей — 24 с
// ломаная маршрута в плане с обходом центра
function loopPath() {
  const C = LOOP, pts = [CORNER[C[0]]];
  for (let k = 1; k < C.length; k++) {
    const a = CORNER[C[k - 1]], b = CORNER[C[k]];
    if (a[0] !== b[0] && a[1] !== b[1]) {                          // диагональ — через центр: обойти
      const d = [b[0] - a[0], b[1] - a[1]], L = Math.hypot(d[0], d[1]), u = [d[0] / L, d[1] / L], R = QUAD.avoid;
      const a0 = Math.atan2(-u[1], -u[0]);                          // точка входа на окружность: со стороны a
      for (let s = 0; s <= 8; s++) {                                // полкруга влево по ходу: от −u к +u через левый бок, за спиной
        const ang = a0 + Math.PI * s / 8;
        pts.push([R * Math.cos(ang), R * Math.sin(ang)]);
      }
    }
    pts.push(b);
  }
  return pts;
}
const PATH = (() => {
  const p = loopPath(), acc = [0];
  for (let k = 1; k < p.length; k++) acc.push(acc[k - 1] + Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]));
  return { p, acc, len: acc[acc.length - 1] };
})();
// скорость: за три очереди ходьбы — ровно одна петля (сторона — около двух секунд); так все
// живые картины встают в одном и том же месте петли. Места подобраны так, что в картине четыре
// тени стоят в четырёх разных столбцах и ни одна не прячется за спиной сидящего (проверка —
// test/systems.mjs). Второй вариант — то же самое вдвое медленнее целиком: и шаг, и очереди,
// поэтому и картина в нём та же
const SPEED = PATH.len / (3 * TURN);
const PHASE = 17.161;                          // откуда петля начинается (плановых единиц)
const OFF = [0, 4.378, 11.795, 15.969];        // место каждой тени на петле
const toD = ([u, v]) => ({ x: QUAD.cx + QUAD.hx * u, y: QUAD.cy + QUAD.hy * v });
// время ходьбы: в очередь той, что сидит, стоят все — она садится, где застала очередь, остальные
// замирают, где были (живая картина на шесть секунд). Так тени не сдвигаются друг против друга
// по петле и не сходятся на общей четверти обхода (решение помощника 23.11)
const SIT = KINDS.indexOf('sit');
function walkTime(T) {
  const cyc = TURN * 4, whole = Math.floor(T / cyc), r = T - whole * cyc, s0 = TURN * SIT, s1 = TURN * (SIT + 1);
  return whole * (cyc - TURN) + (r < s0 ? r : r < s1 ? s0 : r - TURN);
}
// где тень i в шаг T: точка в декорации, куда смотрит (dx), идёт ли, её ли очередь жеста.
// slow — второй вариант: всё вдвое медленнее, и шаг, и очереди
export function quadAt(i, T, slow = false) {
  const P = PATH, Te = slow ? T / 2 : T, turn = Math.floor((Te % (TURN * 4)) / TURN), mine = turn === i;
  let s = ((walkTime(Te) * SPEED + PHASE + OFF[i]) % P.len + P.len) % P.len;
  let k = 1;
  while (k < P.acc.length - 1 && P.acc[k] < s) k++;
  const a = P.p[k - 1], b = P.p[k], seg = P.acc[k] - P.acc[k - 1] || 1, f = (s - P.acc[k - 1]) / seg;
  const u = a[0] + (b[0] - a[0]) * f, v = a[1] + (b[1] - a[1]) * f;
  const d = toD([u, v]);
  return { x: d.x, y: d.y, u, v, dx: Math.sign(b[0] - a[0]) || 1, walking: turn !== SIT, mine, kind: KINDS[i] };
}
// шаги: у каждой тени — свой стук раз в 45 шагов ходьбы (во втором варианте — шарканье); вернёт
// список [pan, kind] на этот шаг (звук — main.js)
export function quadSteps(T, slow = false) {
  const out = [];
  for (let i = 0; i < 4; i++) {
    const q = quadAt(i, T, slow);
    if (!q.walking) continue;
    if ((T + i * 11) % (slow ? 70 : 45) === 0) out.push([Math.max(-1, Math.min(1, (q.x - CENTER.x) / 70)), slow ? 'shuffle' : 'tap']);
  }
  return out;
}

// сохранение: номер прихода, в котором садились (по нему — длина следующего)
export const saveStage = () => ({ n: stage.n, wi: stage.wi, looked: stage.looked.slice(), bd: stage.bd.slice(), dust: stage.dust });
export function loadStage(d) {
  stage.n = d && Number.isFinite(d.n) ? Math.max(0, d.n | 0) : 0;
  stage.wi = d && Number.isFinite(d.wi) ? Math.max(0, d.wi | 0) % HALL_LINES.length : 0;
  const ids = a => (Array.isArray(a) ? [...new Set(a.filter(id => BOARD_IDS.includes(id)))] : []);
  // сохранение до шага 3 списка не знает: осмотренное помнит world/relook.js (main.js грузит его раньше)
  stage.looked = d && Array.isArray(d.looked) ? ids(d.looked) : BOARD_IDS.filter(id => lookCount(id) > 0);
  stage.bd = ids(d && d.bd).filter(id => stage.looked.includes(id));
  stage.dust = d && Number.isFinite(d.dust) ? d.dust | 0 : -1;
  stage.away = true; stage.seated = false; stage.live = false; stage.active = false; stage.ev = null; stage.adv = false;
  stage.back = false; stage.gaze = 0; stage.heard = -1;
}
export function _resetStage() {
  Object.assign(stage, { active: false, seated: false, n: 0, clock: 0, live: false, away: true, near: false, settle: 0, from: 0,
    ev: null, adv: false, wi: 0, looked: [], bd: [], back: false, gaze: 0, heard: -1, dust: -1 });
}
