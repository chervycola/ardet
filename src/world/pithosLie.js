// ═══════════════════════════════════════
// ЛЕЧЬ В ПИФОС — слово автора 23.11: «когда ложишься в бочку от Диогена, всё ещё можно
// ходить, а фигурка должна медленно залезть в бочку и потом уже окно с вариантом
// "заснуть"». Прежде «ЛЕЧЬ» только показывало текст, а странник стоял где стоял.
// Теперь — сцена без слов, ход заперт:
//   шаг     — медленно, вразвалку, к зеву (он справа: sprites/locations/canon.js pithosBody);
//   присесть — колени, потом сидит, лицом к зеву;
//   вползти — лёг головой в зев и уходит внутрь рывками, как ползут; видно только то,
//             что снаружи венчика; внутри остаются торчать подошвы;
//   внутри  — меню пифоса: «УСНУТЬ» (вниз, в ход мха — world/mossway.js) или «ВЫЛЕЗТИ»;
//             отменил меню — лежит дальше, шаг (клавиша, палец) — вылезает;
//   вылезти — то же назад: выползает, садится, встаёт.
// Лёжа фигура повёрнута на четверть оборота и сжата по глубине (вид сверху-сбоку: лежащий
// короче стоящего) — ровно в зев высотой семь точек.
// ═══════════════════════════════════════
export const WALK_V = 0.45;                   // шаг к зеву — медленнее обычного (точек за кадр)
export const CROUCH = 70, CRAWL = 240, RISE = 60;   // кадры: присесть, вползти (и выползти), встать
export const LIE_LEN = 26;                    // длина лежащей фигуры (точки кадра)
const SQUASH = 0.6;                           // по глубине лежащий сжат: 12 → 7 точек, как зев

export const lie = { on: false, phase: '', t: 0, loc: null };

// зев пифоса в точках мира: венчик справа (рисунок со сдвигом −1: горло — x+20..x+22, y+4..y+12)
export function mouthOf(loc) { return { rim: loc.x + 22, cy: loc.y + 8, gy: loc.y + loc.h }; }
// где встать: справа от венчика, ногами перед пифосом (ступни странника — x+6, y+23)
export function standOf(loc) { const m = mouthOf(loc); return { x: m.rim + 3, y: m.gy + 2 - 23 }; }

// ЛЕЧЬ: начать сцену (main.js: действие pithos_lie)
export function startLie(loc) {
  lie.on = true; lie.phase = 'step'; lie.t = 0; lie.loc = loc;
}
// шаг пальцем или клавишей, пока лежит, — вылезает; на ходу внутрь не перебивается
export function wantOut() {
  if (!lie.on || lie.phase !== 'in') return false;
  lie.phase = 'out'; lie.t = 0;
  return true;
}
// подъём из хода мха через пифос (main.js goUp): лежит внутри — и выползает, как ложился
export function startOut(loc) {
  lie.on = true; lie.phase = 'out'; lie.t = 0; lie.loc = loc;
}
export function stopLie() { lie.on = false; lie.phase = ''; lie.t = 0; lie.loc = null; }
// лежит — сколько ушёл внутрь: 0 — голова у венчика, 1 — снаружи одни подошвы
const ease = f => f < 0 ? 0 : f > 1 ? 1 : f * f * (3 - 2 * f);
export function depthIn() {
  if (!lie.on) return 0;
  if (lie.phase === 'crawl') return crawlK(lie.t / CRAWL);
  if (lie.phase === 'in') return 1;
  if (lie.phase === 'out') return crawlK(1 - lie.t / CRAWL);
  return 0;
}
// ползут рывками: подтянулся — замер — подтянулся (пять тяг на весь путь)
function crawlK(f) {
  if (f <= 0) return 0; if (f >= 1) return 1;
  const n = 5, i = Math.floor(f * n), r = f * n - i;
  return (i + ease(Math.min(1, r * 1.6))) / n;
}
export const isLying = () => lie.on && (lie.phase === 'crawl' || lie.phase === 'in' || lie.phase === 'out');
// поза: сидит (0..1) — на присесть и встать
export function sitOf() {
  if (!lie.on) return null;
  if (lie.phase === 'crouch') return ease(lie.t / CROUCH);
  if (lie.phase === 'rise') return 1 - ease(lie.t / RISE);
  return lie.phase === 'step' ? 0 : null;
}

// шаг сцены; player — странник (x, y — угол рамки). Возвращает событие: 'in' — лёг (открыть
// меню), 'done' — встал (сцена кончилась), иначе null
export function stepLie(player) {
  if (!lie.on) return null;
  lie.t++;
  if (lie.phase === 'step') {
    const s = standOf(lie.loc), dx = s.x - player.x, dy = s.y - player.y, d = Math.hypot(dx, dy);
    if (d <= WALK_V) {
      player.x = s.x; player.y = s.y; player.moving = false; player.still = true;
      player.dir = -1; player.face = 'S';
      lie.phase = 'crouch'; lie.t = 0;
    } else {
      player.x += dx / d * WALK_V; player.y += dy / d * WALK_V;
      player.moving = true; player.still = false;
      if (Math.abs(dx) > 0.3) player.dir = dx > 0 ? 1 : -1;
    }
    return null;
  }
  player.moving = false; player.still = true; player.vx = 0; player.vy = 0;
  if (lie.phase === 'crouch' && lie.t >= CROUCH) { lie.phase = 'crawl'; lie.t = 0; }
  else if (lie.phase === 'crawl' && lie.t >= CRAWL) { lie.phase = 'in'; lie.t = 0; return 'in'; }
  else if (lie.phase === 'out' && lie.t >= CRAWL) { lie.phase = 'rise'; lie.t = 0; }
  else if (lie.phase === 'rise' && lie.t >= RISE) { stopLie(); return 'done'; }
  return null;
}

// где на кадре лежащий: середина фигуры и срез у венчика (для рисунка и проверок)
export function lyingFrame() {
  const m = mouthOf(lie.loc), k = depthIn();
  const x0 = m.rim + LIE_LEN / 2 + 1, x1 = m.rim - LIE_LEN / 2 + 4;   // голова у венчика → снаружи одни подошвы
  return { cx: Math.round(x0 + (x1 - x0) * k), cy: m.cy + 1, clipX: m.rim + 1, m };
}
// нарисовать лежащего: draw() рисует стоящего на player.x, y — его поворачиваем на четверть
// (голова — к зеву, влево), сжимаем по глубине и режем по венчику: что внутри, того не видно
export function drawLying(ctx, player, draw) {
  if (!isLying()) return false;
  const f = lyingFrame();
  ctx.save();
  ctx.beginPath(); ctx.rect(f.clipX, f.cy - 14, LIE_LEN + 16, 28); ctx.clip();
  ctx.translate(f.cx, f.cy);
  ctx.scale(1, SQUASH);
  ctx.rotate(-Math.PI / 2);
  ctx.translate(-(Math.floor(player.x) + 6), -(Math.floor(player.y) + 11));
  draw();
  ctx.restore();
  return true;
}
