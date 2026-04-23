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

function clear() {
  outputEl.innerHTML = '';
}

// Commands
const commands = {
  help() {
    print(`ДОСТУПНЫЕ КОМАНДЫ:
  dir / ls       — список файлов
  read <name>    — читать файл
  whois <name>   — инфо о ком-то
  cat <name>     — вывести содержимое
  map            — карта (в разработке)
  status         — статистика
  fortune        — пророчество
  history        — история команд
  clear          — очистить экран
  exit           — выход из терминала

  ↑/↓            — навигация по истории`);
  },

  dir() {
    print(`СОДЕРЖИМОЕ ДИСКА:
  .ardet         [вечно растёт]
  .moss          [процесс, не файл]
  .fisher        [хонтология]
  .alephs        [6 веток]
  .angel         [Ангел Истории]
  .baseline      [shifting baseline]
  .commons       [огораживание]
  .cycle         [Кали-юга]
  .convivial     [порог инструмента]
  .joy           [радость vs развлечение]
  .observers     [требуется осмотр всех четверых]
  .demiurge      [три гипотезы]
  /secrets       [директория]

[подсказка: whois <имя> — досье; read <файл> — текст]`);
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

  cat(args) { this.read(args); },

  status() {
    print(`СТАТУС СТРАННИКА:
  фрагменты: ${Math.floor(Math.random() * 57)}/57
  время: ${Math.floor(Date.now() / 60000)} мин
  состояние: ${state.current}`);
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
    ];
    print('> ' + fortunes[Math.floor(Math.random() * fortunes.length)], '#d4a017');
  },

  history() {
    if (history.length === 0) { print('> ИСТОРИЯ ПУСТА', '#1a6b1a'); return; }
    print(history.map((h, i) => `  ${i + 1}  ${h}`).join('\n'));
  },

  clear() { clear(); },

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
    // Try as a whois/read fallback
    if (termDb[name]) {
      print(termDb[name].text, termDb[name].color);
    } else {
      print(`> команда не найдена: ${name}\n> введи help`, '#8b0000');
    }
  }
}

export function open() {
  termEl.classList.add('on');
  state.transition('terminal');
  inputEl.focus();
  if (outputEl.children.length === 0) {
    print(`ARDET TERMINAL V2
система: пустошь/∞
пользователь: странник
∙∙∙
введи help`, '#1a8c1a');
  }
}

export function close() {
  termEl.classList.remove('on');
  state.transition('game');
  inputEl.blur();
}

export function init() {
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
}
