// ═══════════════════════════════════════
// СЕТЬ НА ЭКРАНЕ — чужие странники, их слова, записки на земле (net/net.js).
// Чужой странник — та же фигура в капюшоне, но тенью: сквозь неё видно землю, и
// огонёк у сердца у него свой. Сказанное пишется пером над головой — тем же, что
// шёпоты мест (world/whisper.js), только у каждого своё и вдвое быстрее: это речь.
// Записка — листок, сложенный вчетверо, на земле; старея за 30 дней, желтеет;
// своя — с загнутым углом; заверенная — с красной точкой печати.
// ═══════════════════════════════════════
import { drawPlayer } from '../sprites/player.js';
import { setCtx } from './context.js';
import { preparePen, penDraw, PEN_HOLD, PEN_FADE } from '../world/whisper.js';
import { net, othersIn, notesIn } from '../net/net.js';

const K0 = '#15100c', L1 = '#c8b89a', L2 = '#b0a284', BO = '#D9CFB8', S2 = '#33302e', KV = '#C23B2B';
const GHOST = 0.55, SPEED = 2, AGE = 30 * 86400e3, READ = 2.2, WRAP = 30, LINE = 8;
let buf = null;
function sheet() {
  if (buf !== null) return buf;
  try { buf = document.createElement('canvas'); buf.width = 40; buf.height = 46; if (!buf.getContext) buf = false; } catch (e) { buf = false; }
  return buf;
}
// чужой странник тенью: рисунок героя — в отдельный лист, лист — с прозрачностью;
// в криосклепе и у него огонёк пеплом (cold)
function ghost(ctx, o, cold) {
  const b = sheet(), fig = { x: 14, y: 16, dir: o.dir, moving: o.moving, vx: o.moving ? (o.dir || 1) * 0.6 : 0, vy: 0, cold };
  if (!b) { setCtx(ctx); drawPlayer({ ...fig, x: o.x - 6, y: o.y - 23 }); return; }
  const g = b.getContext('2d');
  g.clearRect(0, 0, b.width, b.height);
  setCtx(g); drawPlayer(fig); setCtx(ctx);
  ctx.globalAlpha = GHOST;
  ctx.drawImage(b, Math.round(o.x - 6 - 14), Math.round(o.y - 23 - 16));
  ctx.globalAlpha = 1;
}
// чужие — по глубине вместе с миром: { k, draw }; coldAt — холод под землёй (world/underside.js)
export function othersToDraw(ctx, layer, camX, camY, vw, vh, coldAt = null) {
  if (!net.on) return [];
  return othersIn(layer, camX - 20, camY - 10, camX + vw + 20, camY + vh + 40)
    .map(o => ({ k: o.y + 1, draw: () => ghost(ctx, o, coldAt ? coldAt(o.x, o.y) : 0) }));
}
// огонёк у сердца чужого светит, как свой, только слабее; в инее тёплого нет (канон U7)
export function otherLights(layer, camX, camY, vw, vh, coldAt = null) {
  if (!net.on) return [];
  const out = [];
  for (const o of othersIn(layer, camX - 80, camY - 80, camX + vw + 80, camY + vh + 80)) {
    if (coldAt && coldAt(o.x, o.y) > 0.5) continue;
    out.push({ x: o.x, y: o.y - 13, r: layer === 'under' ? 34 : 30, color: [255, 180, 80], flicker: 0.1, intensity: 0.8 });
  }
  return out;
}
// записки на земле
export function drawNotes(ctx, camX, camY, vw, vh) {
  if (!net.on) return;
  const now = Date.now();
  for (const n of notesIn(camX - 8, camY - 8, camX + vw + 8, camY + vh + 8)) {
    const x = Math.round(n.x) - 3, y = Math.round(n.y) - 2, old = Math.min(1, Math.max(0, (now - (n.created || now)) / AGE));
    ctx.globalAlpha = 0.4; ctx.fillStyle = K0; ctx.fillRect(x + 1, y + 4, 6, 1); ctx.globalAlpha = 1;
    ctx.fillStyle = old > 0.5 ? L2 : L1; ctx.fillRect(x, y, 6, 4);
    ctx.fillStyle = old > 0.5 ? S2 : L2; ctx.fillRect(x + 3, y, 1, 4); ctx.fillRect(x, y + 2, 6, 1);   // сгибы
    ctx.fillStyle = BO; ctx.fillRect(x, y, 2, 1);
    if (n.mine) { ctx.fillStyle = S2; ctx.fillRect(x + 5, y, 1, 1); }                                   // свой — загнут угол
    if (n.certs > 0) { ctx.fillStyle = KV; ctx.fillRect(x + 4, y + 3, 1, 1); }                           // заверено
  }
}
// где записка под кликом
export function noteAt(x, y) {
  let best = null, bd = 7;
  for (const n of notesIn(x - 8, y - 8, x + 8, y + 8)) { const d = Math.hypot(n.x - x, n.y - y); if (d < bd) { bd = d; best = n; } }
  return best;
}
// где чужой странник под кликом (фигура — над ногами)
export function otherAt(layer, x, y) {
  let best = null, bd = 13;
  for (const o of othersIn(layer, x - 20, y - 10, x + 20, y + 34)) { const d = Math.hypot(o.x - x, o.y - 11 - y); if (d < bd) { bd = d; best = o; } }
  return best;
}
// строки по словам — не шире WRAP знаков
export function wrap(text, n = WRAP) {
  const out = [];
  let cur = '';
  for (const w of text.split(' ')) {
    const word = Array.from(w).length > n ? Array.from(w).slice(0, n).join('') : w;
    if (cur && Array.from(cur + ' ' + word).length > n) { out.push(cur); cur = word; } else cur = cur ? cur + ' ' + word : word;
  }
  if (cur) out.push(cur);
  return out;
}
// слова — пером над головой, строка за строкой: своё — над собой, чужое — над тем, кто сказал.
// Двое рядом — позднее слово поднимается над ранним (lift) и, поднявшись, уже не опускается
export function drawVoices(ctx, layer, me) {
  if (!net.on) return;
  const boxes = [];
  for (const v of net.voices) {
    const o = v.who === 'me' ? { x: me.x + 6, y: me.y + 23, layer } : net.others.get(v.who);
    if (!o || o.layer !== layer) continue;
    if (!v.preps) v.preps = wrap(v.text).map(l => ({ l, P: preparePen(ctx, l) }));
    const total = v.preps.reduce((s, q) => s + q.P.write, 0), a = (net.t - v.t0) * SPEED;
    if (a >= total + PEN_HOLD + PEN_FADE) { v.done = true; continue; }
    const fade = (a < total + PEN_HOLD ? 1 : 1 - (a - total - PEN_HOLD) / PEN_FADE) * READ;
    const rise = Math.max(0, a - total - PEN_HOLD) * 0.12, h = v.preps.length * LINE, w = Math.max(0, ...v.preps.map(q => q.P.wl));
    let top = o.y - 34 - (v.preps.length - 1) * LINE - rise - (v.lift || 0);
    for (let k = 0; k < boxes.length; k++) {
      const b = boxes[k];
      if (Math.abs(b.cx - o.x) < (b.w + w) / 2 + 4 && top - LINE < b.bot && top - LINE + h > b.top) {
        v.lift = (v.lift || 0) + (top - LINE + h) - b.top + 2; top = b.top - h - 2 + LINE; k = -1;
      }
    }
    boxes.push({ cx: o.x, w, top: top - LINE, bot: top - LINE + h });
    let start = 0;
    v.preps.forEach(({ l, P }, i) => {                  // перо пишет строку за строкой
      const wr = a - start;
      if (wr > 0) penDraw(ctx, P, l, o.x, top + i * LINE, wr, wr, fade, true);
      start += P.write;
    });
  }
  net.voices = net.voices.filter(v => !v.done);
}
