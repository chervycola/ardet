// ═══════════════════════════════════════
// НИТИ — вещи в разных местах, которые объясняют друг друга
// (weave/MOTIFS.md). Здесь — то, что требует кода:
// П3 · номерок → письмо: в театре висит пальто с номерком 1889; номер можно
// назвать в окне «до востребования» в газовом переулке (кольцо 6, запад),
// рядом с ящиком, где лежит письмо «отцу». Знание — ключ: номерок не берут,
// его помнят. С 16.11 помнит сам странник (weave/DEPTH_GAMES_2026-11-16.md,
// «До востребования»): номер набирают в строке у окна (ui/askbox.js); игра
// за него больше не называет. Неверный номер ложится в книгу запросов
// знакомой рукой, и створка опущена, пока странник не уйдёт из кольца.
// Штемпель на верхнем конверте виден и без театра: год можно знать и так.
// ═══════════════════════════════════════
import { useTexts } from './useActions.js';
import { free } from './recount.js';
import { ringAt } from './disc.js';

const NUMBER = '1889';
const TITLE = 'ДО ВОСТРЕБОВАНИЯ';
export const MAIL_ASK = 'из окна спрашивают номер';
const LETTER = 'Ты называешь: тысяча восемьсот восемьдесят девять. Из окна подают конверт. Штемпель — Турин, январь. Внутри одна строка, крупно: «В сущности, каждое имя в истории — это я». Подпись неразборчива.\n\nНа конверте бирка: «Выдано по номерку. Пальто остаётся за зрителем до конца спектакля».';
const GOT = 'Окно пустое. По номерку 1889 выдано; другого письма здесь нет.';
const SHUT = 'Створка опущена. На створке мелом: «Перерыв». Книга запросов лежит снаружи, раскрыта на последней строке.';

const mail = { got: false, asked: [], shut: false, ring: 0 };

// окно молчит без вопроса: письмо уже выдано или створка опущена; иначе — null, спросить номер
export function mailNow() {
  if (mail.got) return { title: TITLE, text: GOT };
  if (mail.shut) return { title: TITLE, text: SHUT };
  return null;
}
// ответ странника: верный номер — письмо; неверный — строка в книге запросов и опущенная створка
export function answerMail(raw) {
  const n = String(raw == null ? '' : raw).replace(/\D/g, '').slice(0, 4);
  if (!n) return null;
  if (n === NUMBER) { mail.got = true; mail.shut = false; return { title: TITLE, text: LETTER }; }
  mail.asked.push(n); if (mail.asked.length > 12) mail.asked.shift();
  mail.shut = true;
  return { title: TITLE, text: `Ты называешь: ${n}. За стеклом шуршат, долго. Створка опускается.\n\nВ книге запросов у окна появляется строка: «Спрашивали № ${n}. Не значится». Рука знакомая.` };
}
// створка поднимается, когда странник ушёл из кольца окна
export function stepMail(px, py) { if (mail.shut && mail.ring && ringAt(px, py) !== mail.ring) mail.shut = false; }
export function saveMail() { return { got: mail.got, asked: mail.asked.slice() }; }
export function loadMail(d) {
  if (!d || typeof d !== 'object') return;
  mail.got = !!d.got;
  mail.asked = Array.isArray(d.asked) ? d.asked.map(String).filter(x => /^\d{1,4}$/.test(x)).slice(-12) : [];
}
export function _resetMail() { mail.got = false; mail.asked = []; mail.shut = false; }

// без строки ответа (читающий без глаз, проверки): окно спрашивает и ждёт
useTexts.mail_1889 = {
  title: TITLE,
  text: 'Из окна спрашивают номер. Говорящего не видно. Без номерка письма не выдаются, даже тем, кому они адресованы.',
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
  // рядом с ящиком: сбоку, чуть впереди или позади — где свободно (у места сцены тесно)
  const spots = [];
  for (const dy of [0, 22, -22, 44]) for (const dx of [26, -26, 44, -44, 62, -62, 84, -84]) spots.push([dx, dy]);
  for (const [dx, dy] of spots) {
    const b = { x: Math.round(box.x + 7 + dx - w / 2), y: box.y + box.h - h + dy, w, h };
    if (ringAt(b.x + w / 2, b.y + h) !== ringAt(box.x + box.w / 2, box.y + box.h) || !free(b, locations)) continue;   // в том же кольце, что ящик
    mail.ring = ringAt(b.x + w / 2, b.y + h);
    locations.push({
      id: 'mail_1889', name: 'окно «до востребования»', zone: 'street', ...b,
      get look() {
        let s = 'Окно выдачи «до востребования». Над окном: «Выдача по номеркам». За стеклом никого; письма разложены по номерам. На верхнем конверте виден штемпель: Турин, январь.';
        if (mail.asked.length) s += `\n\nНа прилавке — книга запросов. Последние строки знакомой рукой:\n${mail.asked.slice(-3).map(n => `«Спрашивали № ${n}. Не значится».`).join('\n')}`;
        if (mail.got) s += '\n\nВ книге выдачи: «№ 1889 — выдано».';
        return s;
      },
      useAction: 'mail_1889',
      useLabel: '<i>✉</i>НАЗВАТЬ НОМЕРОК',
      drawSelf: drawMailWindow,
    });
    return;
  }
}
