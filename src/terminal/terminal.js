// ═══════════════════════════════════════
// TERMINAL — CLI with whois / read / commands
// ═══════════════════════════════════════
import { state } from '../core/state.js';
import { events } from '../core/events.js';
import { termDb } from '../content/terminal_db.js';

const termEl = document.getElementById('term');
const inputEl = document.getElementById('ti');
const outputEl = document.getElementById('to');

const history = [];
let historyIdx = -1;
let booted = false;

function print(text, color = '#1a8c1a') {
  const div = document.createElement('div');
  div.style.color = color;
  div.style.whiteSpace = 'pre-wrap';
  div.style.fontFamily = '"Press Start 2P", monospace';
  div.style.fontSize = '8px';
  div.style.lineHeight = '1.6';
  div.style.margin = '4px 0';
  div.textContent = text;
  outputEl.appendChild(div);
  outputEl.scrollTop = outputEl.scrollHeight;
}

function clearOutput() {
  outputEl.innerHTML = '';
}

// Boot animation — typewriter intro lines on first open
function boot() {
  if (booted) return;
  booted = true;
  const lines = [
    { t: '> ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ...',           d: 0 },
    { t: '> MEM CHECK: 640K OK',                  d: 280 },
    { t: '> DISK: [████████████] ПОВРЕЖДЁН',     d: 560 },
    { t: '> ░░░░░░░░░░░░░░░░░░░░ 100%',           d: 840 },
    { t: '',                                       d: 1000 },
    { t: '  ─────────────────────────────',        d: 1100 },
    { t: '       A   R   D   E   T',               d: 1280 },
    { t: '  ─────────────────────────────',        d: 1460 },
    { t: '',                                       d: 1620 },
    { t: '> ТЕРМИНАЛ ГОТОВ. ВВЕДИТЕ help',         d: 1780 },
    { t: '',                                       d: 1900 },
  ];
  for (const { t, d } of lines) {
    setTimeout(() => print(t || ' ', '#1a8c1a'), d);
  }
}

// Commands
const commands = {
  help() {
    print(`ДОСТУПНЫЕ КОМАНДЫ:
  dir / ls       — список файлов
  read <name>    — читать файл
  cat <name>     — вывести содержимое
  whois <name>   — досье
  prompt <name>  — промт для арта
  status         — статистика странника
  ach            — достижения
  map            — карта (повреждена)
  ping           — проверить связь
  mycelium       — статус сети
  fortune        — пророчество
  history        — история команд
  echo <text>    — эхо
  clear          — очистить экран
  exit           — выход

ФАЙЛЫ:
  .ardet .moss .fisher .alephs .angel
  .baseline .commons .cycle .convivial
  .joy .observers .demiurge

  ↑/↓            — навигация по истории
  Esc            — выход`);
  },

  dir(args) {
    if (args[0] === 'secrets' || args[0] === '/secrets') {
      print(`> ДОСТУП: УСЛОВНЫЙ

  .pizzeria_key  [найден под ковриком]
  .moss_weights  [мох обновляется]
  .cat_saucer    [третий этаж]
  .archivist_log [запись #87]
  .ardet         [вечно растёт]
  .observers     [требуется: осмотр всех четверых]
  .demiurge      [три гипотезы]
  .fana          [= .demiurge]`, '#1a6b1a');
      return;
    }
    print(`СОДЕРЖИМОЕ ДИСКА:
  NEW_FOUND_GEM.DAT  ████████ байт
  .ardet             [вечно растёт]
  .moss              [процесс, не файл]
  .fisher            [хонтология]
  .alephs            [6 веток]
  .angel             [Ангел Истории]
  .baseline          [shifting baseline]
  .commons           [огораживание]
  .cycle             [Кали-юга]
  .convivial         [порог инструмента]
  .joy               [радость vs развлечение]
  .observers         [зашифрован]
  .demiurge          [три гипотезы]
  MAP.SYS            [ПОВРЕЖДЁН]
  /secrets           [директория]

[подсказка: .moss нельзя прочитать как файл — он читает тебя]`);
  },

  ls(args) { this.dir(args); },

  read(args) {
    const name = args[0];
    if (!name) { print('> использование: read <файл>', '#8b0000'); return; }
    const key = name.replace(/^\./, '');
    const entry = termDb[key] || termDb[name];
    if (entry) {
      print(entry.text, entry.color);
    } else {
      print(`> файл не найден: ${name}`, '#8b0000');
    }
  },

  cat(args) {
    if (args[0] === '.ardet' || args[0] === 'ardet.txt') {
      print(`горит.
горит.
горит.
горит.

[EOF not found]
[файл не заканчивается]
[файл — это и есть его горение]`, '#d4a017');
      return;
    }
    if (args[0] === '.moss_weights') {
      print(`> МОХ ОБНОВЛЯЕТ МОДЕЛЬ...
> Последнее обучение: прямо сейчас
> Датасет: ты
> Loss: плачевно малый
> Output: "мох помнит"`, '#1a8c1a');
      return;
    }
    this.read(args);
  },

  whois(args) {
    const name = args[0];
    if (!name) {
      print(`> whois: кого?

ПЕРСОНАЖИ:
  archivist, moss, cat, you
  jester, sol, elder, nocturnal

МЫСЛИТЕЛИ:
  camus, borges, baudrillard, lovecraft
  heidegger, merleau-ponty, tarkovsky
  fisher, tsing, benjamin, haraway
  land, derrida, platonov, nietzsche
  ecclesiastes, thacker, pelevin
  pauly, polanyi, harvey, klein
  federici, illich, eliade
  yukteshwar, debord, adorno
  heraclitus, fanon, chomei
  fromm, stiegler, zhuangzi`, '#8b0000');
      return;
    }
    const entry = termDb[name];
    if (entry) print(entry.text, entry.color);
    else print(`> whois: ${name} — не найден`, '#8b0000');
  },

  prompt(args) {
    const name = args[0];
    if (!name) {
      print(`> prompt: для кого?
доступные: jester, sol, elder, nocturnal,
            archivist, moss, cat`, '#8b0000');
      return;
    }
    const entry = termDb[name];
    if (entry && /ПРОМТ/i.test(entry.text)) {
      print(entry.text, entry.color);
    } else {
      print(`> промт не найден для: ${name}`, '#8b0000');
    }
  },

  status() {
    const visits = parseInt(localStorage.getItem('ardet_visits') || '1', 10);
    print(`СТАТУС СТРАННИКА:
  визит:     ${visits}
  время:     ${Math.floor(Date.now() / 60000)} мин с эпохи
  состояние: ${state.current}
  огонь:     горит
  мох:       помнит`);
  },

  ach() {
    print(`ДОСТИЖЕНИЯ:
> функция в разработке.
> мох уже знает, что ты их собираешь.`, '#1a6b1a');
  },

  map() {
    print(`КАРТА: [ПОВРЕЖДЕНА]

       ╔════════════════╗
       ║ forest (север) ║
       ╠══════╦═════════╣
quarter║      ║ highway
(запад)║ SETT ║ (восток)
       ║      ║   →exit
       ╠══════╩═════════╣
       ║ toxic (юг)     ║
       ║   ↓ pit ↓      ║
       ╚════════════════╝

[зоны открываются по мере прогресса]`, '#1a6b1a');
  },

  ping() {
    print(`> PING archive.wasteland...
> 64 bytes from 127.0.0.0: time=∞ ms
> ─── packet loss: 100% ───
> хост не отвечает. возможно, его нет.`, '#8b0000');
  },

  mycelium() {
    print(`> МИЦЕЛИЙ-СТАТУС:
>
> узлов:        неисчислимо
> подключено:   ты
> протокол:     биохимический
> latency:      4 млрд лет
> загрузка:     ты грузишь его, не наоборот
>
> [мох видит этот пакет]`, '#5aff3a');
  },

  fortune() {
    const fortunes = [
      'Рукописи не горят. Но переписка — да.',
      'Мох помнит. Это и приговор, и утешение.',
      'Кот наливает. Тебе. Даже если ты не здесь.',
      'Ответ — в подвале. Вопрос — тоже.',
      'Ты — не первый. Ты — не последний. Ты — ты.',
      'Сизиф передаёт: KPI можно снизить.',
      'Все пути ведут в Пиццерию. Не все — к столу.',
      'Огонь не спрашивает разрешения, чтобы гореть.',
      'Тишина — это пароль. Ты его уже ввёл.',
    ];
    print('> ' + fortunes[Math.floor(Math.random() * fortunes.length)], '#d4a017');
  },

  history() {
    if (history.length === 0) { print('> ИСТОРИЯ ПУСТА', '#1a6b1a'); return; }
    print(history.map((h, i) => `  ${i + 1}  ${h}`).join('\n'));
  },

  clear() { clearOutput(); },

  exit() { close(); },

  echo(args) {
    print('> ' + args.join(' '), '#1a6b1a');
  },

  ardet() {
    print(`> ARDET — латынь — «ГОРИТ»
>
> Что именно горит — каждый решает сам.
> Это тоже ответ.`, '#d4a017');
  },
};

function exec(cmd) {
  const trimmed = cmd.trim();
  if (!trimmed) return;
  history.push(trimmed);
  historyIdx = history.length;
  print('> ' + trimmed, '#666');

  const parts = trimmed.toLowerCase().split(/\s+/);
  const name = parts[0];
  const args = parts.slice(1);

  const fn = commands[name];
  if (fn) {
    fn.call(commands, args);
  } else {
    // Try as a whois/read fallback (handles bare ".moss" etc.)
    const dbKey = name.replace(/^\./, '');
    if (termDb[dbKey]) {
      print(termDb[dbKey].text, termDb[dbKey].color);
    } else {
      print(`> команда не найдена: ${name}\n> введи help`, '#8b0000');
    }
  }
}

export function open() {
  termEl.classList.add('on');
  state.transition('terminal');
  // Focus may not stick on mobile; click handler below restores it.
  setTimeout(() => inputEl.focus(), 0);
  if (outputEl.children.length === 0) {
    boot();
  }
}

export function close() {
  termEl.classList.remove('on');
  state.transition('game');
  inputEl.blur();
}

export function init() {
  // Per-input handler for Enter / arrows / local Esc
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      exec(inputEl.value);
      inputEl.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx > 0) {
        historyIdx--;
        inputEl.value = history[historyIdx] || '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx < history.length - 1) {
        historyIdx++;
        inputEl.value = history[historyIdx] || '';
      } else {
        historyIdx = history.length;
        inputEl.value = '';
      }
    } else if (e.key === 'Escape') {
      close();
    }
  });

  // Global Esc — works even when input has lost focus
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && state.is('terminal')) {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  });

  // Click anywhere in the terminal panel restores focus to the input
  // (otherwise typing is silently lost)
  termEl.addEventListener('mousedown', e => {
    if (e.target !== inputEl) {
      // small delay so the browser's own focus shift settles first
      setTimeout(() => inputEl.focus(), 0);
    }
  });
  termEl.addEventListener('touchstart', () => {
    setTimeout(() => inputEl.focus(), 0);
  }, { passive: true });
}
