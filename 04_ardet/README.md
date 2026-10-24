# Ardet Wasteland

Браузерная игра о горящем мире, нарисованная как офорт и казённая бумага. Мир — диск:
в центре городок вне времени с костром и Шутом, вокруг девять колец эпох (радиус — время,
сторона света — традиция), за ними кольцо огня и Пустошь брейнрота. Странник ходит,
осматривает вещи и читает: таблички, протоколы, досье терминала, записки. Полос здоровья
и цифр нет: внимание — единственный ресурс, состояние показывает сам рисунок (свет, чернила,
растр). Тон — меланхолия и канцелярская ирония: мир смешон, потому что не знает об этом.

Игра — одна HTML-страница, собранная из ES-модулей `src/`. Сайт: ardet.art.

## Быстрый старт

**Поиграть без сборки.** Открыть [`build/index.html`](build/index.html) (телефон —
`build/mobile.html`). Музыку игра подгружает из `assets/` (запросом `fetch`, с `file://` он не
работает), поэтому надёжнее через локальный сервер из этой папки:

```bash
python3 -m http.server 8000
# http://localhost:8000/build/index.html
```

Управление: WASD или стрелки — идти, Shift — быстрее, клик — подойти и осмотреть, правый
клик — использовать, E / F — осмотреть / использовать рядом, M — карта, I — опись
найденного, Esc — назад. Ключи адреса: `?stream` (режим охоты), `?editor` (редактор
текстов, также F2), `?dev` (отладочные клавиши), `?nohouse` (старт с места сохранения),
`?net=local` / `?net=off` (сеть странников).

**Собрать.** Нужен Node 18+ (проверено на 22). Все команды — из папки `04_ardet/`:

```bash
npm ci               # ставит esbuild 0.28 (единственная зависимость)
node build.js        # src/ → build/index.html, build/mobile.html, build/ardet.html
node build.js --prod # то же, с минификацией (только esbuild)
```

Без esbuild `build.js` сам переключается на запасной путь — `tsc --module system` +
вшитый SystemJS из `src/vendor/` (нужен TypeScript: в `node_modules/` или глобальный —
список мест, где его ищет сборка, в `build.js`, функция `bundleWithTsc`). Результат
работает так же.

**Проверить.**

```bash
npm test             # 8 наборов, ~20 с; ещё 3 отдельно: node test/net.mjs, house.mjs, backstage.mjs
```

Подробно о тестах — [`test/README.md`](test/README.md).

## Карта папки

| Путь | Что это |
|---|---|
| [`src/`](src/) | Исходники игры по подсистемам: `core`, `world` (мир-диск и механики), `render`, `content` (тексты), `sprites`, `ui`, `terminal`, `audio`, `net`, `assets` (канон в документах + манифест картинок), `vendor`. Карта — [`src/README.md`](src/README.md) |
| [`test/`](test/) | 11 наборов тестов на чистом Node |
| [`build/`](build/) | Собранная игра; три HTML закоммичены, чтобы играть без сборки |
| `build.js`, `package.json`, `package-lock.json` | Сборка (esbuild или tsc+SystemJS) и скрипты тестов |
| [`assets/`](assets/) | Медиа рядом со сборкой: значки, эмблема, музыка; сюда же лягут портреты |
| [`weave/`](weave/) | Мастерская мира: задания и расчёты, аудиты текста, промты генерации, эталонные картинки, отчёты охот. Начинать с `weave/HANDOFF.md` |
| [`hunt/`](hunt/) | Охота: устав стрима «модель ищет спрятанное» и харнесс на Playwright |
| [`prototype/`](prototype/) | Пробы рисовки и механик отдельными страницами |
| [`night/`](night/) | Векторный прототип «Ночь и канцелярия» и его документы (из ветки `inspiring-goodall`) |
| [`server/`](server/) | Схема Supabase для сети странников и её проверка на PostgreSQL |
| [`references/`](references/) | Референсы автора по эпохам (24 картинки) |
| [`archive/`](archive/) | Монолитные версии игры (`ardet_wasteland.html`, апрель 2026) |
| [`docs/`](docs/) | Рецензия философского каркаса v2 → v3 и пакет её передачи (апрель 2026) |
| [`branches/`](branches/) | Материалы боковых веток, не влитые в основную линию: файлы и патчи |
| [`BRANCHES.md`](BRANCHES.md) | Какие ветки во что собраны, какие правки кода не влиты (с хешами) |
| `.claude/skills/` | Навыки Claude Code для этой папки: `ardet-canon` (выжимка канона — загружать перед любой работой с визуалом и текстом), `ardet-ref-intake` (приём референса), `ardet-scene-accept` (приёмка кадра) |
| `.gitignore` | `node_modules/`, вывод сборки кроме закоммиченных HTML, `hunt-runs/` |

Документы игры называют «корнем репозитория» эту папку `04_ardet/`: пути вида
`src/content/…`, `weave/…`, `assets/portraits/…` в них — относительно неё.

## С чего читать

1. [`weave/HANDOFF.md`](weave/HANDOFF.md) — передача сессии: устройство мира, сборка,
   деплой, ключевые правила.
2. [`.claude/skills/ardet-canon/SKILL.md`](.claude/skills/ardet-canon/SKILL.md) — канон
   на одной странице: палитра, правила кадра, тексты и печати.
3. [`src/assets/ARDET_PHILOSOPHY_v3.md`](src/assets/ARDET_PHILOSOPHY_v3.md) — философский
   каркас; [`src/assets/ART_BIBLE_v2_night_and_chancellery.md`](src/assets/ART_BIBLE_v2_night_and_chancellery.md) —
   арт-библия.
4. [`weave/ROADMAP.md`](weave/ROADMAP.md) — что делается сейчас.

## Статус

Активная разработка. Последние правки основной линии — 2026-10-23…24: двойники построек
на всех кольцах (23.10); подпись странника, внимание оживляет механизмы, край и брейнрот —
только с пропуском Шута, заставка «форма 0», правки по ревью кода (24.10). В работе — список
улучшений `weave/ROADMAP.md`, портреты для диалогов (`weave/PORTRAITS.md`, пишет автор).

Проверка при сборке монорепо (2026-10-24, Node 22): `node build.js` собирает игру
(запасным путём tsc+SystemJS — реестр npm из окружения сборки был недоступен), результат
совпадает с закоммиченным `build/` до байта, кроме оттиска версии; все 11 наборов тестов
зелёные.

## Происхождение

| Что | Откуда | Снапшот |
|---|---|---|
| Всё дерево, кроме перечисленного ниже | `origin/claude/philosophy-architecture-update-oDemg` | `8b36e63`, 2026-10-24 |
| `night/`; `weave/LUMA_PROJECT.md`, `weave/STYLE_SYSTEM.md`, `weave/STYLE_*.png`, `weave/characters/`; `branches/goodall/` | `origin/claude/inspiring-goodall-uy7y4j` | `4756adb`, 2026-10-24 |
| `branches/gallant-ride/` | `origin/claude/gallant-ride-bfw7hc` | `a6c3ddc`, 2026-06-25 |
| `branches/improve-writing-style/` | `origin/claude/improve-writing-style-ayW6n` | `08a12c2`, 2026-08-07 |
| `docs/review/`, `archive/ardet_wasteland_review-C2pj7.html` | `origin/claude/philosophy-game-review-C2pj7` | `86d12e2`, 2026-04-24 |
| `archive/ardet_wasteland_source-dump.html` | `origin/source-dump` | `510246e`, 2026-04-09 |
| `README.md`, `BRANCHES.md`, README в подпапках | написаны при сборке монорепо | 2026-10-24 |

Прежний README модульной версии (ветки `Ardet` и `main`, июль 2026) описывал снапшот
`40ae900` от 2026-07-05; его содержание учтено здесь. Ветка `fix-chat-bugs` целиком уже в
основной линии. Подробности, невлитые правки кода и список изменённых при сборке файлов —
[`BRANCHES.md`](BRANCHES.md).
