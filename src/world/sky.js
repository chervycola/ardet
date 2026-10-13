// ═══════════════════════════════════════
// СУТКИ — одни на весь диск (канон v3.3, content/world_cells.js · daycycle):
// час не зависит ни от стороны, ни от радиуса. Пропорции фаз — канон:
// ДЕНЬ 42% → СУМЕРКИ 13% → НОЧЬ 37% → РАССВЕТ 8%; ночь длинная не случайно:
// мир — ночной офорт, день здесь гость. Игра начинается на 0.30 — «день
// клонится к вечеру». Длительность настраиваемая (здесь 12 минут).
//   свет   — сколько его в кадре (0.40 ночь … 0.82 полдень);
//   солнце — днём с востока через юг на запад; высота 0…1…0;
//   луна   — ночью вместо солнца; висит в правой верхней трети неба.
// Тени (render/shadows.js) берут отсюда, куда и какой длины им падать.
// ?phase=0.38 — начать с этой фазы (проверка руками).
// ═══════════════════════════════════════
export const DAY_LEN = 43200;                  // шагов на сутки (60 в секунду — 12 минут)
const DAY = 0.42, DUSK = 0.55, NIGHT = 0.92;   // где кончаются день, сумерки, ночь
let START = 0.30;
try {
  const q = new URLSearchParams(location.search).get('phase');
  if (q !== null && !isNaN(+q)) START = ((+q % 1) + 1) % 1;
} catch (e) {}

const smooth = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };

export const phaseAt = step => ((step / DAY_LEN) + START) % 1;
export const dayIndex = step => Math.floor(step / DAY_LEN + START);   // номер суток (жребий событий — раз в сутки)

// что в небе на фазе p
export function skyAt(p) {
  if (p < DAY) {                               // день: солнце по дуге
    const u = p / DAY, e = Math.sin(Math.PI * u);
    return { name: 'день', light: 0.66 + 0.16 * e, sun: { az: Math.PI * u, elev: e }, moon: 0 };
  }
  if (p < DUSK) {                              // сумерки: солнце ушло, луна встаёт
    const k = smooth((p - DAY) / (DUSK - DAY));
    return { name: 'сумерки', light: 0.66 - 0.26 * k, sun: null, moon: k };
  }
  if (p < NIGHT) return { name: 'ночь', light: 0.40, sun: null, moon: 1 };
  const k = smooth((p - NIGHT) / (1 - NIGHT));  // рассвет: луна бледнеет, светлеет
  return { name: 'рассвет', light: 0.40 + 0.26 * k, sun: null, moon: 1 - k };
}

// тень на земле: куда (dx, dy — точек на точку высоты) и насколько темна (a);
// свет на земле (wash, washCol) — им лист перекрашен, тени из него вырезаны:
// на тёмной земле тень читается только рядом со светом
//   солнце: падает прочь от него; низкое — длинная и густая, у горизонта
//   гаснет; в полдень короткая, назад (на север); экран сжат по глубине вдвое;
//   свет — костяной («вечер — костяной штрих»)
//   луна: слабая, прочь от луны (она на северо-востоке) — вниз-влево;
//   свет — болотная мгла («луна вместо солнца»)
export function shadowAt(p) {
  const s = skyAt(p);
  if (s.sun) {
    const e = s.sun.elev, az = s.sun.az;
    const L = Math.min(2.4, 0.3 / Math.max(0.12, e));
    const k = smooth(e / 0.12) * (p > DAY / 2 ? 1 : 0.85);           // вечер — лучшее время: тени гуще
    return { dx: -Math.cos(az) * L, dy: -Math.max(0.32, Math.sin(az) * 0.5) * L, a: 0.6 * k,
      wash: 0.14 * k, washCol: '#D9CFB8', from: 'солнце' };
  }
  return { dx: -0.35, dy: 0.22, a: 0.28 * s.moon, wash: 0.1 * s.moon, washCol: '#3D4A3A', from: 'луна' };
}
