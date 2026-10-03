// ═══════════════════════════════════════
// КАПЧА У ВОРОТ — табличка на южной тропе у края городка: квадратик
// «Я не робот» и девять клеток с огнём. Отметить может кто угодно;
// проверка не проводится. Отметка держится до конца сессии.
// ═══════════════════════════════════════
import { useTexts } from './useActions.js';
import { trailPoint } from './disc.js';

let stage = 0;                       // 0 — пусто, 1 — отмечено, 2 — клетки выбраны

useTexts.captcha_check = {
  title: 'Я НЕ РОБОТ',
  get text() {
    if (stage === 0) { stage = 1; return 'Отметка принята. Проверка не проводится.'; }
    stage = 2;
    return 'Выбраны все девять. Проверка пройдена. Повторно не проводится.';
  },
};

const p = trailPoint('south', 10);
const X = Math.round(p.x - 22), GY = Math.round(p.y);

export const captchaLocation = {
  id: 'captcha', name: 'Табличка «Я не робот»', zone: 'street',
  x: X - 12, y: GY - 34, w: 24, h: 34,
  look: 'Табличка: квадратик и строка «Я не робот». Ниже девять клеток и просьба: «Выберите все клетки с огнём». Огонь во всех девяти.',
  useAction: 'captcha_check',
  get useLabel() { return stage === 0 ? '<i>☐</i>ОТМЕТИТЬ' : stage === 1 ? '<i>▦</i>ВЫБРАТЬ КЛЕТКИ' : '<i>☑</i>ОТМЕЧЕНО'; },
  drawSelf: drawCaptcha,
};

const N = '#0D0B0A', K = '#D9CFB8', P = '#8A8D8F', S = '#E28A3A', V = '#C23B2B', D = '#2a2620';

function drawCaptcha(ctx, loc, t) {
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  const x = loc.x + 12, gy = loc.y + loc.h;
  R(x - 6, gy, 12, 2, 'rgba(0,0,0,0.35)');
  R(x - 1, gy - 12, 2, 12, D);                       // столб
  const L = x - 10, T = gy - 34;
  R(L, T, 20, 22, N); R(L + 1, T + 1, 18, 20, K);    // панель
  // квадратик и строка
  R(L + 2, T + 2, 4, 4, P); R(L + 3, T + 3, 2, 2, K);
  if (stage > 0) { R(L + 3, T + 4, 1, 1, N); R(L + 4, T + 5, 1, 1, N); R(L + 5, T + 3, 1, 2, N); R(L + 6, T + 2, 1, 1, N); }
  R(L + 8, T + 3, 9, 1, P); R(L + 8, T + 5, 6, 1, P);
  // девять клеток, в каждой огонь
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const cx = L + 2 + c * 5 + (c > 0 ? 1 : 0), cy = T + 8 + r * 4;
    R(cx, cy, 4, 3, stage === 2 ? P : D);
    const f = ((t >> 3) + r * 3 + c) % 3;
    R(cx + 1 + (f === 1 ? 1 : 0), cy, 1, 1, S);
    R(cx + 1, cy + 1, 2, 2, V); R(cx + 1 + (f & 1), cy + 1, 1, 1, S);
  }
}
