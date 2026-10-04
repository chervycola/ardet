// ═══════════════════════════════════════
// НИТИ — вещи в разных местах, которые объясняют друг друга
// (weave/MOTIFS.md). Здесь — то, что требует кода:
// П3 · номерок → письмо: в театре висит пальто с номерком 1889; кто
// видел номерок, может назвать его в окне «до востребования» в газовом
// переулке (кольцо 6, запад), рядом с ящиком, где лежит письмо «отцу».
// Знание — ключ: номерок не берут, его помнят.
// ═══════════════════════════════════════
import { useTexts } from './useActions.js';
import { free } from './aitraps.js';

let sawNomerok = false;

// театр: кто прочёл сцену, видел номерок
if (useTexts.theater_stage) {
  const base = useTexts.theater_stage;
  const text = base.text;
  useTexts.theater_stage = {
    title: base.title,
    get text() { sawNomerok = true; return text; },
  };
}

useTexts.mail_1889 = {
  title: 'ДО ВОСТРЕБОВАНИЯ',
  get text() {
    if (!sawNomerok) {
      return 'Из окна спрашивают номер. Говорящего не видно. Без номерка письма не выдаются, даже тем, кому они адресованы.';
    }
    return 'Ты называешь: тысяча восемьсот восемьдесят девять. Из окна подают конверт. Штемпель — Турин, январь. Внутри одна строка, крупно: «В сущности, каждое имя в истории — это я». Подпись неразборчива.\n\nНа конверте бирка: «Выдано по номерку. Пальто остаётся за зрителем до конца спектакля».';
  },
};

const N = '#0D0B0A', K = '#D9CFB8', P = '#8A8D8F', S = '#E28A3A', D1 = '#15100c', D2 = '#241c14';
const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

function drawMailWindow(ctx, loc) {
  const x = loc.x + loc.w / 2, gy = loc.y + loc.h;
  R(ctx, x - 10, gy, 20, 2, 'rgba(0,0,0,0.35)');
  R(ctx, x - 9, gy - 26, 18, 26, D2); R(ctx, x - 10, gy - 28, 20, 2, D1);      // будка
  R(ctx, x - 6, gy - 20, 12, 8, N); R(ctx, x - 6, gy - 20, 12, 1, P);          // окно выдачи
  R(ctx, x - 5, gy - 14, 10, 1, '#3a3026');                                    // полка
  for (let i = 0; i < 4; i++) R(ctx, x - 5 + i * 3, gy - 17, 2, 3, K);          // конверты по номерам
  R(ctx, x - 7, gy - 25, 14, 3, K); R(ctx, x - 6, gy - 24, 12, 1, P);          // вывеска
  R(ctx, x + 6, gy - 11, 1, 1, S);                                             // лампа в будке
}

export function buildThreads(locations) {
  const box = locations.find(l => l.name === 'ящик в газовом переулке' && l.streetForm);
  if (!box) return;
  const w = 20, h = 30;
  for (const dx of [26, -26, 44, -44, 62]) {
    const b = { x: Math.round(box.x + 7 + dx - w / 2), y: box.y + box.h - h, w, h };
    if (!free(b, locations)) continue;
    locations.push({
      id: 'mail_1889', name: 'окно «до востребования»', zone: 'street', ...b,
      look: 'Окно выдачи «до востребования». Над окном: «Выдача по номеркам». За стеклом никого; письма разложены по номерам.',
      useAction: 'mail_1889',
      get useLabel() { return sawNomerok ? '<i>✉</i>НАЗВАТЬ НОМЕРОК' : '<i>✉</i>СПРОСИТЬ ПИСЬМО'; },
      drawSelf: drawMailWindow,
    });
    return;
  }
}
