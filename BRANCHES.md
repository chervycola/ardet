# Ветки репозитория и куда легло их содержимое

До сборки монорепо (2026-10-24) разработка репозитория `chervycola/ardet` шла в 22 ветках `origin/*`. Здесь для каждой ветки указаны последний коммит, тема, куда легло её содержимое в этом дереве, статус и рекомендация, можно ли удалять ветку теперь, когда дерево влито в `main` (как именно — в разделе «Как ветки связаны с `main`»). Ничего из перечисленного при сборке не удалялось, все ветки на месте.

Хеши короткие, refs — как `origin/<имя>` на момент сборки. Подробности по каждой папке — в разделе «Происхождение» её README, по веткам игры — в [`04_ardet/BRANCHES.md`](04_ardet/BRANCHES.md).

## Статусы

| Статус | Что значит |
|---|---|
| **живая** | В ветке идёт работа: коммиты в октябре 2026. Снапшот в этом дереве может устареть, перед правкой папки сверяйтесь с веткой (правило — в [`README.md`](README.md#синхронизация-с-ветками)) |
| **поглощена снапшотом** | Всё содержимое ветки, нужное проекту, уже лежит в дереве (байт-в-байт или более новой версией). Работа в ветке остановлена или завершена: последние коммиты — сентябрь 2026 или раньше |
| **устаревшая** | Ветка целиком содержится в другой ветке (`git merge-base --is-ancestor` = да) или её вклад уже есть в другой ветке в более новом виде |
| **не влита** | Часть правок ветки сознательно не перенесена в основное дерево. Они сохранены рядом (патчи и файлы в `04_ardet/branches/`) и ждут решения автора |

## Карта веток

| Ветка `origin/…` | Последний коммит | Тема | Куда легло в этом дереве | Статус | Удалять после слияния в `main`? |
|---|---|---|---|---|---|
| `main` | `d496f20` · 2026-07-07 | Игра Ardet Wasteland, модульная версия: снапшот основной линии игры на `40ae900` (2026-07-05), влит merge-коммитом из `Ardet`; монолит в `archive/` | Модульная игра перешла в [`04_ardet/`](04_ardet/README.md) — взята более новая версия основной линии (`8b36e63`, 2026-10-24). Монолит `archive/ardet_wasteland_monolith.html` (`cb30eee`) целиком входит в [`04_ardet/archive/ardet_wasteland_review-C2pj7.html`](04_ardet/archive/). README заменён [`04_ardet/README.md`](04_ardet/README.md) | устаревшая по содержимому: всё есть в `04_ardet/` в более новом виде. Сама `main` — предок `discret-visual-branding` | **Нет.** Это целевая ветка: в неё вливается дерево монорепо |
| `Ardet` | `c270d36` · 2026-07-07 | Игра как корневой проект (то же дерево, что у `main`) | Как у `main`: игра → [`04_ardet/`](04_ardet/), монолит → покрыт архивом `04_ardet/archive/` | устаревшая: предок `main` и `discret-visual-branding` | Да |
| `claude/add-system-suicide-docs-0in5C` | `54d8669` · 2026-07-07 | Первая консолидация монорепо (коммит `1b5250d`): `game/`, `synth/`, `site/`, `sequencer/`, `legal/`, `archive/` | `game/` → [`04_ardet/`](04_ardet/) (более новая версия); `synth/` → [`03_pedals/00_series/`](03_pedals/00_series/), [`01_last_night/`](03_pedals/01_last_night/), [`02_last_day/`](03_pedals/02_last_day/), [`03_is_my/`](03_pedals/03_is_my/); `site/` → [`03_pedals/site/`](03_pedals/site/) (новее); `sequencer/` → [`03_pedals/04_sequencer_lithoseq/`](03_pedals/04_sequencer_lithoseq/) (новее); `legal/` → [`01_baklazhania/legal/`](01_baklazhania/legal/) (побайтно); `README.md` заменён корневым [`README.md`](README.md) | устаревшая: каждая папка есть в дереве в той же или более новой версии; от `1b5250d` ветка отличается только корневым README | Да |
| `Баклажания` | `886f087` · 2026-07-07 | Баклажания: юридические шаблоны по 152-ФЗ | `consent.html`, `privacy-policy.html` → [`01_baklazhania/legal/`](01_baklazhania/legal/README.md) побайтно; README заменён [`01_baklazhania/README.md`](01_baklazhania/README.md) и `legal/README.md` | поглощена снапшотом | Да |
| `claude/baklazania-content-review-TZbAM` | `63dd1a0` · 2026-06-11 | Баклажания: первая версия тех же шаблонов | `legal/` → [`01_baklazhania/legal/`](01_baklazhania/legal/) (те же blob, что в `Баклажания`) | поглощена снапшотом | Да |
| `claude/discret-visual-branding-kppz1d` | `98db116` · 2026-09-27 | Форум ДИСКРЕТ: визуальная система, карточки, Mini App и сайт, бот, пресса | `branding/` (527 файлов) → [`02_discret/branding/`](02_discret/README.md); логотип Баклажании ещё и в [`01_baklazhania/brand/`](01_baklazhania/brand/) | поглощена снапшотом: форум прошёл 19.09.2026, работа закончилась фотоотчётом | Да |
| `SS` | `6d20ae1` · 2026-07-07 | SYSTEM SUICIDE: разработки по номерным папкам `00_series` … `05_site` | `00_series/` → [`03_pedals/00_series/`](03_pedals/00_series/README.md); `01_last_night/` → [`03_pedals/01_last_night/`](03_pedals/01_last_night/README.md); `02_last_day/` → [`03_pedals/02_last_day/`](03_pedals/02_last_day/README.md); `03_is_my/`, `04_sequencer/`, `05_site/` заменены более новыми версиями из `jolly-gates`, `eurorack-sequencer-design` и `System-suicide`; `05_site/PROVENANCE.md` переписан в [`03_pedals/site/PROVENANCE.md`](03_pedals/site/PROVENANCE.md); README → [`03_pedals/README.md`](03_pedals/README.md) | поглощена снапшотом | Да |
| `claude/review-reverberator-data-KKkgX` | `052fe07` · 2026-07-15 | Last Night: иллюстрированный туториал | `synth/last_night_tutorial.html` → [`03_pedals/01_last_night/`](03_pedals/01_last_night/); остальные файлы — версии `f407179`, старше `SS` | поглощена снапшотом | Да |
| `claude/review-last-day-concept-HWbFa` | `955461a` · 2026-07-18 | SYSTEM SUICIDE, ранняя линия `synth/` (аудит, decisions 05–08 refined); bench-план и туториал Last Day | `synth/docs/last_day_tutorial.html` → [`03_pedals/02_last_day/tutorial/`](03_pedals/02_last_day/tutorial/); `synth/proto/` = [`03_pedals/02_last_day/proto/`](03_pedals/02_last_day/proto/) побайтно; баннеры D06/D07 → `03_pedals/00_series/audit/`, `fixes/01`; `synth/SYSTEM_SUICIDE.md` → [`03_pedals/00_series/history/`](03_pedals/00_series/history/); остальное — старые версии, заменённые линией `SS` | поглощена снапшотом | Да |
| `claude/jolly-gates-KxAP2` | `051f6c7` · 2026-10-19 | Is My: MOSFET-шейпер и пульт DJI C5 | `is_my/` → [`03_pedals/03_is_my/`](03_pedals/03_is_my/README.md) байт-в-байт | **живая** | Нет, пока работа над Is My идёт в ветке. После переезда разработки в монорепо — да |
| `claude/eurorack-sequencer-design-3wu8wb` | `72671ad` · 2026-07-18 | LITHOSEQ: генеративный секвенсор | `docs/eurorack-sequencer/` → [`03_pedals/04_sequencer_lithoseq/docs/`](03_pedals/04_sequencer_lithoseq/docs/); `lithoseq/` → [`03_pedals/04_sequencer_lithoseq/lithoseq/`](03_pedals/04_sequencer_lithoseq/lithoseq/) | поглощена снапшотом | Да |
| `claude/docs-preparation-xuki5v` | `a3455f4` · 2026-07-07 | SYSTEM SUICIDE: re-spec I Show You Light (D14), оптическая шина (D15), проект ISYL | `decisions/14`, `15` и сноски в каноне → [`03_pedals/00_series/`](03_pedals/00_series/); `synth/i_show_you_light/` → [`03_pedals/05_i_show_you_light/`](03_pedals/05_i_show_you_light/README.md) | устаревшая: предок `melody-algorithm-illustration` | Да |
| `claude/melody-algorithm-illustration-9brvyf` | `95a2fa7` · 2026-07-08 | And My: иллюстрация алгоритма материального секвенсора | `synth/and_my_pattern_algorithm.svg` → [`03_pedals/06_and_my/`](03_pedals/06_and_my/README.md); остальное совпадает с `docs-preparation` | поглощена снапшотом | Да |
| `System-suicide` | `bfbfcc7` · 2026-07-26 | Маркетинг-сайт серии SYSTEM SUICIDE | `system-suicide/` → [`03_pedals/site/`](03_pedals/site/README.md) (исходный README сохранён как `DESIGN_HANDOFF.md`) | поглощена снапшотом | Да. Прототип на `*.jsx` (коммит `8212903`) остался только в истории ветки, см. раздел «Перед удалением» |
| `claude/philosophy-architecture-update-oDemg` | `8b36e63` · 2026-10-24 | Игра: основная линия разработки | Всё дерево → [`04_ardet/`](04_ardet/README.md); 24 референса из корня → `04_ardet/references/`; монолит → `04_ardet/archive/ardet_wasteland.html` | **живая** | Нет, пока работа над игрой идёт в ветке |
| `claude/inspiring-goodall-uy7y4j` | `4756adb` · 2026-10-24 | Игра: векторный прототип «Ночь и канцелярия», стиль-система | `night/` → [`04_ardet/night/`](04_ardet/night/); `weave/LUMA_PROJECT.md`, `STYLE_SYSTEM.md`, `STYLE_*.png`, `characters/` → `04_ardet/weave/`; `.claude/settings.json` → `04_ardet/branches/goodall/claude-settings.json` (неактивно) | **живая** | Нет, пока идёт работа |
| `claude/gallant-ride-bfw7hc` | `a6c3ddc` · 2026-06-25 | Игра: портреты Шута и Sol, ART_DIRECTION | [`04_ardet/branches/gallant-ride/`](04_ardet/branches/gallant-ride/): `ART_DIRECTION.md`, два портрета, патч `cf51de1` | **не влита**: портреты расходятся с текущим каноном портретов (`weave/PORTRAITS.md`) | После решения автора по портретам и патчу. Всё нужное уже сохранено файлами |
| `claude/improve-writing-style-ayW6n` | `08a12c2` · 2026-08-07 | Игра: стилевые проходы по текстам, блоки «ОБРАЗ», ачивки | 8 патчей → [`04_ardet/branches/improve-writing-style/patches/`](04_ardet/branches/improve-writing-style/) | **не влита**: ни один патч не прикладывается к текущему `src/` чисто | После разбора патчей (крупнейший уникальный текст — `4cbd940`, блоки «ОБРАЗ») |
| `claude/fix-chat-bugs-Drg9d` | `cdf76ea` · 2026-04-24 | Игра: погода и атмосферные эффекты | Ничего: единственный коммит уже есть в основной линии как `6877d7f` | устаревшая | Да |
| `claude/philosophy-game-review-C2pj7` | `86d12e2` · 2026-04-24 | Игра: рецензия философского каркаса и пакет передачи | `ARDET_REVIEW.md`, `HANDOFF_TO_ARCHITECTURE.md` → [`04_ardet/docs/review/`](04_ardet/docs/review/); монолит ветки → `04_ardet/archive/ardet_wasteland_review-C2pj7.html` | поглощена снапшотом (тексты пакета уже влиты в основную линию) | Да |
| `claude/add-locations-physics-BpCy3` | `ef7ea1a` · 2026-04-15 | Игра: монолит `ardet_wasteland.html` | Монолит (`cb30eee`) целиком входит в `04_ardet/archive/ardet_wasteland_review-C2pj7.html` | устаревшая: предок основной линии игры и ещё 12 веток | Да |
| `source-dump` | `510246e` · 2026-04-09 | Игра: самый ранний каркас монолита | → [`04_ardet/archive/ardet_wasteland_source-dump.html`](04_ardet/archive/) | поглощена снапшотом | Да |

`origin/HEAD` — не ветка, а указатель удалённого репозитория, в карту не входит.

## Связи между ветками

Проверено `git merge-base --is-ancestor` для всех пар веток. Ветка слева целиком содержится в ветках справа:

| Ветка | Содержится в |
|---|---|
| `Ardet` | `main`, `discret-visual-branding` |
| `main` | `discret-visual-branding` (ветка Дискрета отошла от `main` и затем удалила файлы игры, коммит `52820b3`) |
| `docs-preparation` | `melody-algorithm-illustration` |
| `add-locations-physics` | `main`, `System-suicide`, `baklazania-content-review`, `discret-visual-branding`, `eurorack-sequencer-design`, `fix-chat-bugs`, `gallant-ride`, `improve-writing-style`, `inspiring-goodall`, `jolly-gates`, `philosophy-architecture-update`, `philosophy-game-review`, `review-last-day-concept` |

Остальные ветки ни в одной другой целиком не содержатся.

Откуда ответвлялись ветки:

- **Линия игры.** Монолит `ef7ea1a` (2026-04-15, = `add-locations-physics`) — общая точка для веток игры и для веток, которые несли монолит в корне. Основная линия `philosophy-architecture-update` ушла от неё на 412 коммитов. `fix-chat-bugs` отошла 2026-04-23, `improve-writing-style` — 2026-04-24, `gallant-ride` и `inspiring-goodall` — 2026-06-24 (`ef8bdb2`).
- **Линия синта.** `review-reverberator-data` отошла от `f407179` (2026-07-02), `docs-preparation` — от `e0c6385` (2026-07-07). Коммит консолидации `1b5250d` (2026-07-07) — общий предок `SS`, `Ardet`, `Баклажания` и `add-system-suicide-docs`.
- `review-last-day-concept` вела свою линию `synth/` с апреля 2026 параллельно линии `SS`.

Клон репозитория неполный (shallow): история обрезана на коммитах `d3a9821` (2026-04-10) и `467a5f3` (2026-05-12). Поэтому общий предок линии синта и линии игры не вычисляется, а связь `SS` и `review-last-day-concept` установлена сравнением содержимого, а не по истории.

## Общие файлы веток

| Файл | Где был | Куда лёг |
|---|---|---|
| `ardet_wasteland.html` — старый монолит игры | В корне 16 веток и в `archive/` трёх (`Ardet`, `main`, `add-system-suicide-docs`). Различающихся версий четыре | Только в [`04_ardet/archive/`](04_ardet/archive/): `da05a38` → `ardet_wasteland.html`, `ca826c9` → `ardet_wasteland_review-C2pj7.html`, `8385818` → `ardet_wasteland_source-dump.html`. Версия `cb30eee` (в 12 местах) целиком входит в `ca826c9`. Остальные разделы монолит не несут |
| `.gitattributes` (`eb3a77b`) | 9 веток: `main`, `discret-visual-branding` и 7 веток линии синта (`SS`, `Ardet`, `Баклажания`, `add-system-suicide-docs`, `docs-preparation`, `melody-algorithm-illustration`, `review-reverberator-data`) | Корневой [`.gitattributes`](.gitattributes) монорепо: тот же набор правил плюс `binary` для `*.webp`, `*.gif`, `*.mp3`, `*.wav`, `*.ogg` |
| `.gitignore` (`b38db2f`: `node_modules/`, `build/`) | `main`, `Ardet`, `discret-visual-branding`, боковые ветки игры (`fix-chat-bugs`, `gallant-ride`, `improve-writing-style`, `inspiring-goodall`), `game/` в `add-system-suicide-docs` | Заменён правилами в папках: [`04_ardet/.gitignore`](04_ardet/.gitignore), `03_pedals/site/.gitignore`, `03_pedals/04_sequencer_lithoseq/lithoseq/.gitignore`, `03_pedals/00_series/docs/.gitignore` |
| Корневые `README.md` веток | `main`, `Ardet`, `SS`, `Баклажания`, `add-system-suicide-docs` | Заменены README разделов и корневым [`README.md`](README.md); полезное перенесено |

## Как ветки связаны с `main`

Раскладка влита в `main` четырьмя коммитами, по одному на раздел. Каждый из них — merge-коммит: первый родитель — предыдущее состояние `main`, остальные — последние коммиты веток-источников раздела. Поэтому история всех 22 веток достижима из `main`: `git log` по любому коммиту ветки работает и после удаления ветки, а `git branch -r --merged main` показывает ветки, которые можно удалять без потери истории.

| Коммит | Раздел | Ветки-родители |
|---|---|---|
| `b2c9f3f` | `01_baklazhania/` | `Баклажания`, `claude/baklazania-content-review-TZbAM` |
| `5baf0a8` | `02_discret/` | `claude/discret-visual-branding-kppz1d` |
| `cb793a0` | `03_pedals/` | `SS`, `System-suicide`, `claude/add-system-suicide-docs-0in5C`, `claude/melody-algorithm-illustration-9brvyf` (содержит `docs-preparation`), `claude/eurorack-sequencer-design-3wu8wb`, `claude/jolly-gates-KxAP2`, `claude/review-last-day-concept-HWbFa`, `claude/review-reverberator-data-KKkgX` |
| `7727b81` | `04_ardet/` | `claude/philosophy-architecture-update-oDemg`, `claude/inspiring-goodall-uy7y4j`, `claude/gallant-ride-bfw7hc`, `claude/improve-writing-style-ayW6n`, `claude/fix-chat-bugs-Drg9d`, `claude/philosophy-game-review-C2pj7`, `source-dump` |

`Ardet` и `add-locations-physics` и так были предками `main`, отдельным родителем они не добавлялись.

Живые ветки (`philosophy-architecture-update`, `inspiring-goodall`, `jolly-gates`) влиты на коммите снапшота. Новые коммиты из них переносятся в папку вручную, по правилу из [`README.md`](README.md#синхронизация-с-ветками).

## Перед удалением веток

1. Дерево уже влито в `main`. Перед удалением живой ветки убедиться, что она (`philosophy-architecture-update`, `inspiring-goodall`, `jolly-gates`) не ушла вперёд после снапшота.
2. README папок ссылаются на коммиты из истории веток: удалённые по ходу работы файлы Дискрета, прототип сайта на `*.jsx`, систему ачивок игры (удалена в основной линии коммитом `d3d2b6b`), хеши в таблицах происхождения. Эти коммиты достижимы из `main` через merge-коммиты раскладки (см. выше), поэтому архивные теги не обязательны. Если нужно удобное имя для старой ветки, его можно поставить тегом `archive/<имя-ветки>`.
3. `gallant-ride` и `improve-writing-style` удалять после того, как автор решит судьбу патчей и портретов из `04_ardet/branches/`.

## Как проверено покрытие

При сборке для каждой из 22 веток пройдены все файлы последнего коммита (`git ls-tree -r`), всего 2053 записи. Для каждой записи искался тот же blob среди файлов этого дерева (`git hash-object`):

| Результат | Записей | Что значит |
|---|---|---|
| Тот же файл есть в дереве | 1370 | blob совпадает байт-в-байт |
| Есть более новая версия | 466 | По истории git этот blob позже изменён, и итоговая версия лежит в дереве (сюда же — монолит `cb30eee`) |
| Есть отредактированная версия | 144 | Тот же файл с точечными правками при сборке (относительные пути, дописанные разделы, баннеры из параллельной ветки); не меньше 80% строк совпадает, расхождения проверены по diff |
| Нет ни в каком виде | 73 | Все объяснены, см. ниже |

Записи, которых нет в дереве ни в каком виде:

- **30** — старые README, индексы и `PROVENANCE.md` веток (`SS`, `main`/`Ardet`, `Баклажания`, `add-system-suicide-docs`, `synth/README.md` линий синта, `is_my/`, `i_show_you_light/`, `branding/renders/`, `lithoseq/`). Их содержание перенесено в новые README папок.
- **9** — `.gitattributes` (теперь один корневой, расширенный), **9** — `.gitignore` (см. «Общие файлы веток»).
- **14** — система ачивок игры (`src/core/achievements.js`, `src/ui/achPopup.js`) в `main`, `Ardet`, `gallant-ride`, `inspiring-goodall`, `improve-writing-style`, `fix-chat-bugs` и в `game/` ветки `add-system-suicide-docs`. В основной линии она удалена (`d3d2b6b`, 2026-09-17), то есть более новое состояние — отсутствие файлов. Правки `improve-writing-style` к ачивкам сохранены патчем 06.
- **8** — код боковых веток игры, который не влит: `improve-writing-style` (`looks.js`, `lore.js`, `terminal_db.js`, `useActions.js`, `main.js`, `template.html`) и `gallant-ride` (`looks.js`) — все их коммиты сохранены патчами в `04_ardet/branches/*/patches/`; `main.js` из `fix-chat-bugs` — тот же коммит уже есть в основной линии.
- **2** — `build/ardet.html` из `fix-chat-bugs` и `improve-writing-style`: артефакты старых сборок.
- **1** — пустой файл `picture` (1 байт) в основной линии игры.

Файлов, которые потерялись бы без объяснения, не найдено.
