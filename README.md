# ardet

Монорепозиторий `chervycola/ardet`. Здесь четыре самостоятельных проекта, которые до 2026-10-24 жили в двадцати двух расходящихся ветках. При сборке каждый проект получил свою папку, а внутри папки — README с назначением, таблицей содержимого, статусом и происхождением (ветка, коммит, дата снапшота).

## Карта

```
ardet/
├── 01_baklazhania/              Баклажания — интернет-магазин, партнёр форума «Дискрет»
│   ├── legal/                   шаблоны по 152-ФЗ: политика обработки ПДн и согласие
│   └── brand/                   логотип (SVG, WebP)
│
├── 02_discret/                  ДИСКРЕТ — форум творческого приборостроения (19.09.2026, МИЭТ)
│   └── branding/                визуальная система, карточки и афиши, Mini App и сайт,
│                                бот, тексты для прессы, генераторы карточек
│
├── 03_pedals/                   педали и Eurorack-модули серии SYSTEM SUICIDE
│   ├── 00_series/               общесерийное: канон-бриф, decisions 01–15, аудит, гид
│   ├── 01_last_night/           Last Night — резонатор на сменных пластинах, флагман серии
│   ├── 02_last_day/             Last Day — масляный делэй, солнечный сатуратор, язычковый EQ
│   ├── 03_is_my/                Is My — MOSFET-шейпер и пилотный пульт DJI C5
│   ├── 04_sequencer_lithoseq/   LITHOSEQ — генеративный секвенсор по физическому образцу
│   ├── 05_i_show_you_light/     I Show You Light — оптический tonewheel-осциллятор
│   ├── 06_and_my/               And My — слот 8 серии, концепт не выбран
│   └── site/                    маркетинг-сайт серии (Vite + React + TS)
│
├── 04_ardet/                    Ardet Wasteland — браузерная игра
│
├── README.md                    этот файл
└── BRANCHES.md                  карта всех веток: что откуда взято и куда легло
```

| Раздел | Что это | Состояние на 2026-10-24 | Объём |
|---|---|---|---|
| [**01 · Баклажания**](01_baklazhania/README.md) | Материалы интернет-магазина «Баклажания», стратегического партнёра форума «Дискрет»: юридические шаблоны для сайта и логотип | Шаблоны — черновики: реквизиты оператора не заполнены, юрист не проверял. Публиковать в текущем виде нельзя | ~0,4 МБ |
| [**02 · Дискрет**](02_discret/README.md) | Всё, что сделано для форума ДИСКРЕТ ([diskret.space](http://diskret.space/), дискрет.рф): визуальная система, готовые карточки и афиши для Telegram, Instagram и печати, мини-приложение Telegram (оно же сайт) с онлайн-формой, бот, пресс-тексты | Форум прошёл, работа завершена фотоотчётом 27.09.2026 | ~70 МБ |
| [**03 · Педали**](03_pedals/README.md) | Серия SYSTEM SUICIDE — 9 модулей физического синтеза; папки по разработкам, общесерийные документы, соседний секвенсор LITHOSEQ и сайт серии | Активная разработка: Last Night перед стендом Stage 0, Last Day в R&D, Is My — в прошивках и вычитке | ~5 МБ |
| [**04 · Ardet Wasteland**](04_ardet/README.md) | Браузерная игра о горящем мире, нарисованная как офорт и казённая бумага: модульные исходники, сборка, тесты, мастерская мира, архив монолитных версий | Активная разработка, последние правки основной линии — 2026-10-24 | ~138 МБ |

Педали серии по папкам:

| Папка | Модуль | Слот в серии | Фаза |
|---|---|---|---|
| [`03_pedals/01_last_night/`](03_pedals/01_last_night/README.md) | Last Night — флагман, €3640 | 9 | Phase 1 ship |
| [`03_pedals/02_last_day/`](03_pedals/02_last_day/README.md) | Last Day — пара по диптиху к Last Night | 7 | Phase 2 |
| [`03_pedals/03_is_my/`](03_pedals/03_is_my/README.md) | Is My — edition of 13, €2480 | 6 | Phase 2 |
| [`03_pedals/05_i_show_you_light/`](03_pedals/05_i_show_you_light/README.md) | I Show You Light | 1 | Phase 3, re-spec proposed |
| [`03_pedals/06_and_my/`](03_pedals/06_and_my/README.md) | And My | 8 | TBD |
| [`03_pedals/04_sequencer_lithoseq/`](03_pedals/04_sequencer_lithoseq/README.md) | LITHOSEQ | вне серии | фаза 1, стенд |

У модулей All Bones Dust, Be Careful, Fuck Abandoned Sleep и Body Blood And Salt папок пока нет: они описаны только в каноне серии ([`03_pedals/00_series/SYSTEM_SUICIDE.md`](03_pedals/00_series/SYSTEM_SUICIDE.md)).

## Быстрый старт

Все команды — из корня репозитория.

### 01 · Баклажания

Сборка не нужна. Документы открываются в браузере: [`01_baklazhania/legal/privacy-policy.html`](01_baklazhania/legal/privacy-policy.html) и [`01_baklazhania/legal/consent.html`](01_baklazhania/legal/consent.html). Плейсхолдеры подсвечены оранжевым, их полный список и порядок подготовки к публикации — в [`01_baklazhania/legal/README.md`](01_baklazhania/legal/README.md).

### 02 · Дискрет

- Посмотреть визуальную систему: открыть [`02_discret/branding/preview.html`](02_discret/branding/preview.html) в браузере, правила — [`02_discret/branding/README.md`](02_discret/branding/README.md).
- Найти готовую карточку или афишу: каталог серий — [`02_discret/branding/renders/README.md`](02_discret/branding/renders/README.md).
- Пересобрать серию карточек (Node.js 18+, пакеты не нужны):

  ```bash
  node 02_discret/branding/tools/gen_setka.js   # перезаписывает SVG в branding/renders/afisha/
  ```

  PNG генераторы не делают, их рендерят отдельно. Таблица «скрипт → файлы» — [`02_discret/branding/tools/README.md`](02_discret/branding/tools/README.md).
- Развернуть сайт и мини-приложение: содержимое `02_discret/branding/app/` заливается в корень хостинга (Apache + PHP), подробности — [`02_discret/branding/app/README.md`](02_discret/branding/app/README.md).

### 03 · Педали

Быстрее всего понять серию по иллюстрированным туториалам — это самодостаточные HTML, их достаточно открыть в браузере: [Last Night](03_pedals/01_last_night/last_night_tutorial.html), [Last Day](03_pedals/02_last_day/tutorial/last_day_tutorial.html), [Is My](03_pedals/03_is_my/06_tutorial_infographic.html), [LITHOSEQ](03_pedals/04_sequencer_lithoseq/docs/TUTORIAL.html). Канон серии — [`03_pedals/00_series/SYSTEM_SUICIDE.md`](03_pedals/00_series/SYSTEM_SUICIDE.md).

```bash
cd 03_pedals/00_series/docs && ./build.sh                     # гид по серии → HTML и DOCX (pandoc)
cd 03_pedals/03_is_my/firmware/host_test && ./build.sh        # хост-тест прошивок Is My (gcc)
cd 03_pedals/04_sequencer_lithoseq/lithoseq && make test      # тесты ядра LITHOSEQ (make, gcc или clang)
cd 03_pedals/site && npm ci && npm run dev                    # сайт серии (Node 18+)
```

Маршруты чтения по ролям и очередь разработки — в [`03_pedals/README.md`](03_pedals/README.md).

### 04 · Ardet Wasteland

```bash
cd 04_ardet
python3 -m http.server 8000   # поиграть без сборки: http://localhost:8000/build/index.html
npm ci                        # esbuild — единственная зависимость (Node 18+)
node build.js                 # src/ → build/index.html, build/mobile.html, build/ardet.html
npm test                      # 8 наборов тестов; ещё 3 — отдельно, см. test/README.md
```

Без esbuild `build.js` сам переходит на запасной путь через TypeScript. С чего читать документы игры — в [`04_ardet/README.md`](04_ardet/README.md).

## Ветки

Разработка шла в 22 ветках `origin/*`. Между собой они почти не сливались: единственное слияние — `Ardet` в `main` (коммит `d496f20`). [`BRANCHES.md`](BRANCHES.md) — полная карта: для каждой ветки последний коммит, тема, куда легло её содержимое в этом дереве, статус (живая, поглощена снапшотом, устаревшая, не влита) и рекомендация, можно ли удалять её после слияния в `main`. Подробности по веткам игры, включая невлитые правки кода с патчами, — [`04_ardet/BRANCHES.md`](04_ardet/BRANCHES.md).

## Синхронизация с ветками

Папки этого дерева — **снапшоты веток на дату сборки**. В некоторых ветках работа продолжается, поэтому снапшот может устареть.

| Папка | Ветка-источник (`origin/…`) | Снапшот | Состояние ветки |
|---|---|---|---|
| `01_baklazhania/legal/` | `Баклажания` | `886f087`, 2026-07-07 | не меняется |
| `02_discret/`, `01_baklazhania/brand/` | `claude/discret-visual-branding-kppz1d` | `98db116`, 2026-09-27 | работа завершена |
| `03_pedals/00_series/`, `03_pedals/01_last_night/`, `03_pedals/02_last_day/` | `SS` | `6d20ae1`, 2026-07-07 | не меняется |
| `03_pedals/01_last_night/last_night_tutorial.html` | `claude/review-reverberator-data-KKkgX` | `052fe07`, 2026-07-15 | не меняется |
| `03_pedals/02_last_day/tutorial/`, `03_pedals/00_series/history/`, баннеры в `03_pedals/00_series/audit/` | `claude/review-last-day-concept-HWbFa` | `955461a`, 2026-07-18 | не меняется |
| `03_pedals/03_is_my/` | `claude/jolly-gates-KxAP2` | `051f6c7`, 2026-10-19 | **живая** |
| `03_pedals/04_sequencer_lithoseq/` | `claude/eurorack-sequencer-design-3wu8wb` | `72671ad`, 2026-07-18 | не меняется |
| `03_pedals/05_i_show_you_light/`, decisions 14–15 | `claude/docs-preparation-xuki5v` | `a3455f4`, 2026-07-07 | не меняется |
| `03_pedals/06_and_my/` | `claude/melody-algorithm-illustration-9brvyf` | `95a2fa7`, 2026-07-08 | не меняется |
| `03_pedals/site/` | `System-suicide` | `bfbfcc7`, 2026-07-26 | не меняется |
| `04_ardet/` | `claude/philosophy-architecture-update-oDemg` | `8b36e63`, 2026-10-24 | **живая** |
| `04_ardet/night/`, часть `04_ardet/weave/` | `claude/inspiring-goodall-uy7y4j` | `4756adb`, 2026-10-24 | **живая** |
| `04_ardet/branches/`, `docs/review/`, `archive/` | боковые ветки игры: `gallant-ride`, `improve-writing-style`, `philosophy-game-review`, `source-dump` | см. [`04_ardet/BRANCHES.md`](04_ardet/BRANCHES.md) | не меняются |

Снапшоты сняты с последних коммитов веток. «Живая» — в ветке шли коммиты в октябре 2026 и работа продолжается; «не меняется» — последний коммит в августе 2026 или раньше, продолжения не видно. Точный список файлов, взятых из каждой ветки, — в README папок, в разделе «Происхождение».

**Правило.** Перед правкой папки проверьте, не ушла ли её ветка вперёд:

```bash
git fetch origin
git log --oneline 051f6c7..origin/claude/jolly-gates-KxAP2      # пример для 03_pedals/03_is_my/
```

- Вывод пустой — снапшот актуален, папку можно править.
- В выводе есть коммиты — сначала перенесите их в папку (какой путь ветки куда лёг, написано в README папки), обновите хеш и дату в разделе «Происхождение» и в таблице выше, и только потом правьте.
- Одну и ту же работу не ведите в двух местах. Когда разработка папки переезжает в монорепо, её ветку замораживают и больше в неё не коммитят. Удалять ветки — по рекомендациям из [`BRANCHES.md`](BRANCHES.md).

## Соглашения

- Язык документации — русский. У каждого раздела и у основных подпапок есть `README.md`: назначение, таблица содержимого, статус, происхождение и, где нужно, как открыть или собрать.
- Ссылки между файлами — только относительные.
- Артефакты сборки в git не кладутся. Там, где что-то собирается, их закрывает свой `.gitignore`: `04_ardet/`, `03_pedals/site/`, `03_pedals/04_sequencer_lithoseq/lithoseq/`, `03_pedals/00_series/docs/`. Исключение — три играбельных HTML в `04_ardet/build/`, они закоммичены сознательно.
- Тяжёлые файлы лежат в `04_ardet/` (музыка `assets/music/title.mp3` ~24 МБ, эталонные PNG в `weave/` по 6–8 МБ) и в `02_discret/branding/renders/`. Всё дерево весит около 214 МБ.
