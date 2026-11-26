// ═══════════════════════════════════════
// АКТЫ — У ТРОПЫ (ROADMAP, играбельность п. 7: «акты драматургии — в мире, не в меню»).
// Аннексия по кольцам (src/assets/DRAMATURGY.md §3): кольцо 6 — акт I, 7 — акт II, 8 — акт II→III,
// 9 — акт III–IV. Тексты — те, что лежали в описи улицы без места (content/ulitsa_db.js actSign).
// Где: на южной тропе, у входа в кольцо — по другую сторону от верстового столба, театральной
// афишей на двух стойках (п). Набором колец: стойки — брус, щит — доска; «АКТ» и номер —
// буквами (без них афиши не узнать), строка аннексии — в осмотре. Антракта не было ни разу.
// ═══════════════════════════════════════
import { trailPoint, ringAt, ringD } from './disc.js';
import { SEGMENTS } from '../content/ulitsa_db.js';
import { free } from './recount.js';
import { kitKind, MAT, tone } from '../sprites/arch/kit.js';

const W = 22, H = 30;
const stand = kitKind(W, H, (P, M) => {
  P.box(3, 10, 2, 20, M.TIMBER).shade(1); P.box(17, 10, 2, 20, M.TIMBER).shade(1);   // стойки
  P.box(0, 2, 22, 13, M.BOARD);                                                        // щит
  P.box(0, 1, 22, 1, M.TIMBER);                                                        // козырёк
}, { seed: 211, chip: 0.04, ao: 1, drips: [[4, 3, 5], [15, 3, 7]] });
const G = {   // 3×5, римские цифры — палками
  А: ['.#.', '#.#', '###', '#.#', '#.#'], К: ['#.#', '##.', '#..', '##.', '#.#'], Т: ['###', '.#.', '.#.', '.#.', '.#.'],
  I: ['#', '#', '#', '#', '#'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'], '.': ['.', '.', '.', '.', '#'],
};
const word = (ctx, s, x, y, c) => { ctx.fillStyle = c; for (const ch of s) { const g = G[ch]; if (!g) { x += 2; continue; } for (let j = 0; j < 5; j++) for (let i = 0; i < g[j].length; i++) if (g[j][i] === '#') ctx.fillRect(x + i, y + j, 1, 1); x += g[0].length + 1; } };
const wordW = s => [...s].reduce((a, ch) => a + (G[ch] ? G[ch][0].length + 1 : 2), 0) - 1;

export function buildActBoards(locations) {
  const out = [];
  SEGMENTS.forEach((seg, i) => {
    if (!seg.actSign) return;
    const n = i + 1, roman = seg.actSign.split('\n')[0].replace(/^АКТ\s*/, '').replace(/\.$/, '');
    for (const dd of [0.12, 0.2, 0.06, 0.3]) {
      const p = trailPoint('south', ringD(n, dd * 200));
      const box = { x: Math.round(p.x - 12 - W), y: Math.round(p.y) - H, w: W, h: H };
      if (ringAt(box.x + W / 2, box.y + H) !== n || !free(box, locations)) continue;
      const l = {
        id: `act_${n}`, name: `афиша · акт ${roman}`, zone: 'street', ...box,
        look: `Афиша у тропы, на двух стойках. Крупно: ${seg.actSign.replace(/\n/g, ' ')} Ниже — пусто: антракта не объявляли.`,
        drawSelf(ctx, L) {
          const gy = L.y + L.h, cx = L.x + (L.w >> 1);
          stand(ctx, cx, gy);
          const x0 = L.x + 2, y0 = L.y + 4, ink = tone(MAT.BOARD, 0), paper = tone(MAT.PLASTER, 4);
          ctx.fillStyle = paper; ctx.fillRect(x0, y0, W - 4, 9);                    // лист афиши
          ctx.fillStyle = tone(MAT.PLASTER, 2); ctx.fillRect(x0 + W - 5, y0 + 1, 1, 8);   // край листа отстал
          const s = 'АКТ ' + roman + '.';
          word(ctx, s, cx - (wordW(s) >> 1), y0 + 2, ink);
        },
      };
      out.push(l); locations.push(l);
      break;
    }
  });
  return out;
}
