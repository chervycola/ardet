// ═══════════════════════════════════════
// ЦИФРОВАЯ ДРОЖЬ ТЕКСТА (слово автора 22.11: «надо разделить, в каких случаях использовать
// цифровое дрожание, в каких призрачное»). Призрачное (render/ghost.js) — то, что было
// и осталось: память, прошлое, чужое присутствие; дрожит мягко, с двойником.
// Цифровое — то, что передаётся и сбоит: лента, экран, машина, брейнрот. Почти всегда
// стоит ровно; раз в несколько секунд — сбой на долю секунды: строку рвёт по горизонтали,
// она прыгает вбок без двойника, знак подменяется на кадр, строка пропадает на кадр.
// Бумага не дрожит вовсе. «Меньше движения» — без сбоев.
// ═══════════════════════════════════════
import { t } from '../core/time.js';
import { reducedMotion } from '../core/prefs.js';

const hash = n => {
  n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n ^= n >>> 4;
  n = Math.imul(n, 0x27d4eb2d); n ^= n >>> 15;
  return (n >>> 0) / 4294967296;
};
const SUBST = '01#_/';
const WINDOW = 40;          // окно в 40 шагов (две трети секунды); сбоит примерно каждое четвёртое
const BURST = 10;           // сбой — первые 10 шагов окна
const STEP = 2;             // внутри сбоя — новое положение раз в два шага

// что со строкой сейчас: { kind: 'still'|'jump'|'tear'|'swap'|'drop', dx, at }
export function digitalState(seed = 0, len = 1) {
  if (reducedMotion()) return { kind: 'still', dx: 0, at: -1 };
  const w = (t / WINDOW) | 0, inW = t - w * WINDOW;
  if (inW >= BURST || hash(w * 733 + seed * 17) >= 0.27) return { kind: 'still', dx: 0, at: -1 };
  const k = (t / STEP) | 0, r = hash(k * 911 + seed * 53 + 3), s = hash(k * 157 + seed * 29) < 0.5 ? -1 : 1;
  const dx = s * (2 + ((hash(k * 61 + seed) * 2.99) | 0));          // 2–4 точки
  if (r < 0.36) return { kind: 'jump', dx, at: -1 };
  if (r < 0.68) return { kind: 'tear', dx, at: -1 };
  if (r < 0.9) return { kind: 'swap', dx: 0, at: (hash(k * 467 + seed) * Math.max(1, len)) | 0 };
  return { kind: 'drop', dx: 0, at: -1 };
}

// строка с цифровой дрожью; h — высота шрифта в точках (для разрыва)
export function digitalText(ctx, text, x, y, seed = 0, h = 8) {
  const chars = Array.from(text);
  const st = digitalState(seed, chars.length);
  if (st.kind === 'still') { ctx.fillText(text, x, y); return; }
  if (st.kind === 'drop') return;
  if (st.kind === 'jump') { ctx.fillText(text, x + st.dx, y); return; }
  if (st.kind === 'swap') {
    const i = st.at, c = chars[i];
    if (c && c !== ' ') chars[i] = SUBST[(i + seed) % SUBST.length];
    ctx.fillText(chars.join(''), x, y);
    return;
  }
  // разрыв: верхняя половина на месте, нижняя уехала вбок
  if (!ctx.save || !ctx.clip || !ctx.rect) { ctx.fillText(text, x + st.dx, y); return; }
  const cut = y - Math.round(h * 0.45);
  ctx.save(); ctx.beginPath(); ctx.rect(-1e5, y - h - 2, 2e5, cut - (y - h - 2)); ctx.clip();
  ctx.fillText(text, x, y); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(-1e5, cut, 2e5, h); ctx.clip();
  ctx.fillText(text, x + st.dx, y); ctx.restore();
}
