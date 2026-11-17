// ═══════════════════════════════════════
// БУМАГИ «ПОСЛЕДНЕГО ПУНКТА» и очаг у дороги (world/clauses.js). Рисуются в координатах
// мира (loc.drawSelf). Лист — КОСТЬ, пять серых строк одним кеглем; после отметки или
// подписи — чернила. Очаг: три закопчённых камня, перекладина без котла, поленница под
// рогожей; горит — язык СВЕЧА с кромкой КИНОВАРИ, сплошной, дым по общему ветру.
// ═══════════════════════════════════════
import { wind } from '../world/wind.js';

const NI = '#0D0B0A', BO = '#D9CFB8', AS = '#8A8D8F', SV = '#E28A3A', KV = '#C23B2B';
const K1 = '#241c14', K3 = '#34302a', BR2 = '#3a2818', L1 = '#c8b89a', L2 = '#b0a284', SEP = '#3A3026';
const S0 = '#474442', S2 = '#33302e';
const q = Math.round;

function sheet(R, x, y, w, h, lines) {
  R(x, y, w, h, BO); R(x, y + h, w, 1, L2);                     // лист и его нижняя кромка
  for (let i = 0; i < lines; i++) R(x + 1, y + 2 + i * 2, w - 2, 1, AS);   // пять строк одним кеглем
}

// kind: post — лист на столбе; nail — на гвозде; board — на доске; frame — в чугунной рамке;
// stand — стойка с купонами; banner — растяжка на двух столбах. n — сколько раз подписано,
// held — экземпляр при страннике
export function drawPaper(ctx, loc, kind, n = 0, held = false) {
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(q(x), q(y), w, h); };
  const cx = q(loc.x + loc.w / 2), gy = loc.y + loc.h;
  ctx.globalAlpha = 0.35; R(cx - 5, gy, 10, 1, NI); ctx.globalAlpha = 1;   // тень у земли
  if (kind === 'post' || kind === 'nail') {
    R(cx, gy - loc.h + 2, 2, loc.h - 2, BR2); R(cx + 1, gy - loc.h + 2, 1, loc.h - 2, K1);   // столб
    const x = cx - 4, y = gy - loc.h + 4;
    sheet(R, x, y, 10, 13, 5);
    if (kind === 'post') {                                       // квадратик внизу; галочки — одна поверх другой
      R(x + 1, y + 11, 3, 1, SEP); R(x + 1, y + 13, 3, 1, SEP); R(x + 1, y + 11, 1, 3, SEP); R(x + 3, y + 11, 1, 3, SEP);
      for (let i = 0; i < Math.min(n, 3); i++) { R(x + 2 + i, y + 12, 1, 1, NI); R(x + 3 + i, y + 11 - i, 1, 1, NI); }
    } else {
      R(cx + 1, y - 1, 1, 1, AS);                                // гвоздь
      for (let i = 0; i < 3; i++) R(x + 1 + i * 3, y + 11, 2, 1, i < 2 || n ? SEP : L1);   // подписи разными руками
    }
    return;
  }
  if (kind === 'board') {
    R(cx - 7, gy - 8, 1, 8, BR2); R(cx + 6, gy - 8, 1, 8, BR2);   // ножки
    R(cx - 7, gy - loc.h, 14, loc.h - 8, K3);                     // доска
    sheet(R, cx - 5, gy - loc.h + 2, 10, 11, 5);
    if (n) { R(cx - 3, gy - loc.h + 12, 5, 1, NI); R(cx + 2, gy - loc.h + 11, 1, 1, NI); }   // графа подписи
    return;
  }
  if (kind === 'frame') {
    R(cx - 1, gy - 8, 2, 8, NI);                                  // стойка
    R(cx - 6, gy - loc.h, 12, 16, NI); R(cx - 5, gy - loc.h + 1, 10, 14, AS);   // чугунная рамка
    sheet(R, cx - 4, gy - loc.h + 2, 8, 11, 4);
    if (n) R(cx - 2, gy - loc.h + 12, 4, 1, SEP);
    return;
  }
  if (kind === 'stand') {
    R(cx - 1, gy - loc.h + 6, 2, loc.h - 6, AS);                  // стойка
    R(cx - 5, gy - loc.h + 2, 10, 4, S2);                          // карман с купонами
    for (let i = 0; i < 3; i++) R(cx - 4 + i, gy - loc.h - 4 + i, 7, 7, i === 2 ? BO : L1);   // купоны веером
    const tx = cx - 2, ty = gy - loc.h + 2;
    if (n) for (let i = 0; i < 7; i += 2) R(tx + i, ty, 1, 1, SEP);   // корешок оторван: перфорация
    else R(tx, ty, 7, 1, L2);
    return;
  }
  if (kind === 'banner') {
    const x0 = loc.x, x1 = loc.x + loc.w - 2, top = gy - loc.h;
    R(x0, top, 2, loc.h, BR2); R(x1, top, 2, loc.h, BR2);         // два столба
    R(x0 + 2, top + 1, loc.w - 4, 9, BO);                           // полотно
    R(x0 + 4, top + 3, 8, 3, KV);                                   // «ПРИНЯТЬ ВСЕ» — единственный красный
    R(x0 + 14, top + 4, 5, 2, AS);                                  // «НАСТРОЙКИ» — мельче
    for (let i = 0; i < 6; i++) R(x0 + 4 + i * 4, top + 8, 3, 1, i % 2 ? L2 : SEP);   // число цифрами
    R(x0 + 22, top + 3, 3, 3, SEP); R(x0 + 23, top + 4, 1, 1, n ? NI : BO);   // квадратик
    return;
  }
}

// state: cold — зола; lit — горит; embers — угли последних минут
export function drawHearth(ctx, loc, state, t) {
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(q(x), q(y), w, h); };
  const x = q(loc.x), gy = q(loc.y + loc.h), cx = x + 10;
  ctx.globalAlpha = 0.35; R(x, gy, 26, 1, NI); ctx.globalAlpha = 1;
  // перекладина без котла
  R(cx - 8, gy - 16, 1, 16, BR2); R(cx + 8, gy - 16, 1, 16, BR2); R(cx - 8, gy - 16, 17, 1, K1);
  // поленница под рогожей — сбоку
  R(x + 20, gy - 6, 6, 6, L2); R(x + 20, gy - 6, 6, 1, L1); R(x + 21, gy - 2, 4, 1, SEP);
  // зола и три закопчённых камня
  R(cx - 5, gy - 2, 11, 2, state === 'cold' ? AS : K3);
  for (const [dx, w] of [[-6, 3], [-1, 3], [4, 3]]) { R(cx + dx, gy - 3, w, 3, S0); R(cx + dx, gy - 3, w, 1, S2); }
  if (state === 'embers') { R(cx - 2, gy - 2, 1, 1, SV); R(cx + 2, gy - 2, 1, 1, SV); return; }
  if (state !== 'lit') return;
  // язык огня сплошной: СВЕЧА у корня, КИНОВАРЬ по кромке; дышит
  const f = Math.sin(t * 0.21) > 0 ? 1 : 0, h = 7 + f;
  R(cx - 2, gy - 3 - h + 3, 5, h - 2, KV); R(cx - 1, gy - 3 - h + 2, 3, h - 1, SV); R(cx, gy - 3 - h, 1, 2, KV);
  // дым по общему ветру
  const wx = wind.x || 0;
  for (let i = 0; i < 4; i++) {
    const k = (t * 0.3 + i * 7) % 28;
    ctx.globalAlpha = 0.3 * (1 - k / 28);
    R(cx + wx * k * 0.6 + Math.sin(k * 0.4 + i) * 1.2, gy - 12 - k, 1, 1, AS);
  }
  ctx.globalAlpha = 1;
}
