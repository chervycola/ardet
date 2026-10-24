# Ветки игры: что откуда взято и что не влито

Игра Ardet Wasteland разрабатывалась в нескольких ветках репозитория `chervycola/ardet`,
которые разошлись и не сливались. При сборке монорепо (2026-10-24) папка `04_ardet/`
собрана так:

1. **Основа** — полное дерево основной линии `claude/philosophy-architecture-update-oDemg`.
2. **Не-кодовые материалы боковых веток**, которых нет в основной линии, положены на свои
   пути (`night/`, новые файлы `weave/`), а при конфликте путей или канона — в
   [`branches/`](branches/).
3. **Код `src/` из боковых веток не сливался.** Невлитые правки перечислены ниже с хешами
   коммитов и сохранены патчами в `branches/<ветка>/patches/`.
4. **Монолиты** `ardet_wasteland.html` — в [`archive/`](archive/), по одному на различающуюся версию.

Хеши — короткие, ветки — как `origin/<имя>` на момент сборки. История репозитория
неполная (shallow-клон): у основной линии доступно 461 коммит начиная с 2026-04-10.

## Сводка по веткам

| Ветка | Снапшот | Отношение к основной линии | Что взято в `04_ardet/` | Что не взято |
|---|---|---|---|---|
| `claude/philosophy-architecture-update-oDemg` | `8b36e63`, 2026-10-24 | **Основная линия** | Всё дерево. Референсы из корня → `references/`, монолит из корня → `archive/ardet_wasteland.html` | Пустой файл `picture` (1 байт) |
| `claude/inspiring-goodall-uy7y4j` | `4756adb`, 2026-10-24 | Отошла 2026-06-24 (`ef8bdb2`), 31 свой коммит | `night/` целиком; `weave/LUMA_PROJECT.md`, `weave/STYLE_SYSTEM.md`, `weave/STYLE_*.png` (6), `weave/characters/` (3); `.claude/settings.json` → `branches/goodall/claude-settings.json` (неактивно) | Своя версия `src/assets/ART_DIRECTION.md` — она целиком входит в версию из `gallant-ride` |
| `claude/gallant-ride-bfw7hc` | `a6c3ddc`, 2026-06-25 | Отошла 2026-06-24 (`ef8bdb2`), 4 своих коммита | `branches/gallant-ride/`: `ART_DIRECTION.md`, портреты Шута и Sol, патч `cf51de1` | Копия `build/assets/portraits/jester.png` (тот же файл, что в `src/assets/portraits/`) |
| `claude/improve-writing-style-ayW6n` | `08a12c2`, 2026-08-07 | Отошла 2026-04-24 (`41f52ef`), 9 своих коммитов | `branches/improve-writing-style/patches/` — 8 патчей | Изменения `build/ardet.html` (генерируются сборкой) |
| `claude/fix-chat-bugs-Drg9d` | `cdf76ea`, 2026-04-24 | Отошла 2026-04-23 (`f94e47f`), 1 свой коммит | Ничего: коммит уже в основной линии | — |
| `claude/philosophy-game-review-C2pj7` | `86d12e2`, 2026-04-24 | Монолитная ветка от 2026-04-15 (`ef7ea1a`), 5 своих коммитов | `docs/review/ARDET_REVIEW.md`, `docs/review/HANDOFF_TO_ARCHITECTURE.md`; монолит → `archive/ardet_wasteland_review-C2pj7.html` | — |
| `Ardet` (= дерево `main`) | `c270d36`, 2026-07-07 (`main`: `d496f20`) | Снапшот основной линии на `40ae900` (2026-07-05) + `README.md` + `archive/` | Ничего нового: `src/`, `test/`, `build/` совпадают с `40ae900`; полезное из README перенесено в новый `README.md` | `archive/ardet_wasteland_monolith.html` (blob `cb30eee`) — см. `archive/README.md` |
| `claude/add-system-suicide-docs-0in5C` | `54d8669`, 2026-07-07 | Консолидация монорепо: `game/` = тот же снапшот `40ae900` | Ничего нового | `game/`, `archive/ardet_wasteland_monolith.html` — дубли |
| `source-dump` | `510246e`, 2026-04-09 | Один коммит — ранний каркас монолита | `archive/ardet_wasteland_source-dump.html` | — |
| `claude/add-locations-physics-BpCy3` | `ef7ea1a`, 2026-04-15 | Предок основной линии, своих коммитов нет | Ничего | Монолит `cb30eee` — входит в версию review |

В корне остальных веток (`System-suicide`, `baklazania-content-review`, `docs-preparation`,
`eurorack-sequencer-design`, `jolly-gates`, `melody-algorithm-illustration`,
`review-last-day-concept`, `review-reverberator-data`) лежит тот же монолит `cb30eee`;
другой игровой информации в них нет.

## Невлитые правки кода

Ни одна из этих правок не прикладывается к текущему `src/` чисто (проверено
`git apply --check`). Применять из корня монорепо:
`git apply --directory=04_ardet <патч>`, конфликты разрешать вручную.

### `claude/improve-writing-style-ayW6n`

| Коммит | Дата | Что | Файлы | Состояние | Патч |
|---|---|---|---|---|---|
| `487c2a2` | 2026-04-24 | Стилевой проход: канцелярит, повторы, причастные цепочки | `src/content/looks.js`, `lore.js`, `dialogues.js`, `src/world/useActions.js` | Тексты в основной линии переписаны иначе | `01-487c2a2-tighten-prose.patch` |
| `8b1765c` | 2026-04-24 | Откат двух правок из `487c2a2` | `dialogues.js`, `looks.js` | Только вместе с `487c2a2` | `02-8b1765c-revert-two-edits.patch` |
| `29a8eba` | 2026-04-24 | Граффити-тег: ирония вместо пафоса | `src/world/useActions.js` | Не влито | `03-29a8eba-rewrite-graffiti-tag.patch` |
| `6acc094` | 2026-04-24 | Пересборка `build/ardet.html` | `build/` | Не нужно | — |
| `56b3e4e` | 2026-04-24 | Граффити-тег без Бэнкси | `src/world/useActions.js` | Не влито | `05-56b3e4e-graffiti-tag-drop-banksy.patch` |
| `37dc9c0` | 2026-05-10 | Ачивки: философские подписи, три новые, команда `ach` | `src/core/achievements.js`, `src/main.js`, `src/terminal/terminal.js` | **Устарело**: ачивки удалены в основной линии (`d3d2b6b`, 2026-09-17) | `06-37dc9c0-achievements-rebind.patch` |
| `7e35cad` | 2026-05-10 | Файл терминала `.infrastructure`, ачивка, пасхалки #9–#11 в `<head>` | `src/content/terminal_db.js`, `src/template.html`, `src/terminal/terminal.js`, `achievements.js` | Не влито; тексты уникальны (часть про ачивку устарела) | `07-7e35cad-infrastructure-terminal-file.patch` |
| `4cbd940` | 2026-07-05 | Блоки «ОБРАЗ»: философские портреты шести персонажей в `whois` | `src/content/terminal_db.js`, `looks.js` | Не влито; крупнейший уникальный текст ветки | `08-4cbd940-obraz-blocks.patch` |
| `08a12c2` | 2026-08-07 | Сверка фактов мемориала; три ошибки обыграны шуткой | `looks.js`, `lore.js`, `terminal_db.js`, `useActions.js` | Частично сделано независимо (`d4c4c93`, `cd5350c`) | `09-08a12c2-fix-factual-errors.patch` |

Подробнее — [`branches/improve-writing-style/README.md`](branches/improve-writing-style/README.md).

### `claude/gallant-ride-bfw7hc`

| Коммит | Дата | Что | Файлы | Состояние | Патч |
|---|---|---|---|---|---|
| `cf51de1` | 2026-06-24 | Портретный бриф Машиниста (ключ `machinist`) | `src/content/looks.js` | Не влито; в основной линии свой бриф (`weave/PORTRAITS.md`) | `branches/gallant-ride/patches/01-cf51de1-machinist-portrait-brief.patch` |

Не-кодовые коммиты ветки (`271ea5a`, `265f764`, `a6c3ddc`) сохранены файлами в
[`branches/gallant-ride/`](branches/gallant-ride/).

### Уже в основной линии

| Ветка | Коммит | Двойник в основной линии | Как проверено |
|---|---|---|---|
| `claude/fix-chat-bugs-Drg9d` | `cdf76ea` «Revive atmospheric effects: weather system…» | `6877d7f` (то же сообщение, 2026-04-24) | Тот же набор файлов и та же статистика; `src/render/weather.js`, `atmosphere.js`, `metaFx.js` побайтно совпадают, в `src/main.js` патчи расходятся только словами «long sessions» в одном комментарии (в основной линии их нет); затем развивался дальше (`3f0112f`, `5c1da3a`, `6bcee0e`, `15cb226`) |
| `claude/philosophy-game-review-C2pj7` | `a2a082b`…`86d12e2` (лор, шёпоты, комментарии для LLM) | `7d16654` «Phase 2+3: 22 idleMsg + 5 LLM address comments» и перенос лора в `src/content/lore.js` | Тексты пакета найдены в `lore.js` и `template.html` (часть позже переписана аудитом) |

## Куда легли коммиты `inspiring-goodall`

| Коммиты | Период | Куда |
|---|---|---|
| `643092e`, `b621f83`, `e2be986`, `7c61c17`, `622ac27`, `1715e09`, `d4db84d`, `dd2491b`, `6a90a72`, `0717bb1`, `2dbc877`, `e590d50`, `0c2a098` | 2026-07-07 — 07-23 | [`night/`](night/): прототип `index.html` + `scene_gen.js`, `GENPLAN.md`, `TOM_II.md`, `MOVEMENT.md`, `README.md` |
| `23c82b4`, `0629c04`, `60e6adc`, `64488f5`, `789d414`, `5adf294`, `e40abfd`, `4756adb` | 2026-07-23 — 10-24 | [`night/PROMPTS_HIGGSFIELD.md`](night/PROMPTS_HIGGSFIELD.md) |
| `7345f4e`, `5fdbc8a`, `c883b58`, `3a17bee`, `c00e4b2` | 2026-07-26 | [`weave/STYLE_SYSTEM.md`](weave/STYLE_SYSTEM.md), `weave/STYLE_*.png`, `weave/characters/` |
| `8169450`, `34980b6`, `385506e` | 2026-10-07 | [`weave/LUMA_PROJECT.md`](weave/LUMA_PROJECT.md) (бывший `REVE_PROJECT.md`; вер. 3 содержит вер. 2 целиком) |
| `92e237b` | 2026-10-24 | [`branches/goodall/claude-settings.json`](branches/goodall/claude-settings.json) |
| `271ea5a` | 2026-06-24 | Общий с `gallant-ride`; итоговая версия — `branches/gallant-ride/src/assets/ART_DIRECTION.md` |

## Правки, сделанные при сборке

| Файл | Правка |
|---|---|
| `.gitignore` | `build/` → `build/*` с исключениями для `index.html`, `ardet.html`, `mobile.html`, `README.md`: закоммиченная сборка остаётся в репозитории, прочий вывод сборки игнорируется |
| `prototype/epoch-walk.html`, `prototype/hybrid-scene.html` | Путь к референсам `../` → `../references/` |
| `src/content/world_weave.js` | Только комментарий у `KNOWN`: где лежат референсы |
| `.claude/skills/*/SKILL.md` | Строка о том, что пути — относительно `04_ardet/`; в `ardet-ref-intake` — где лежат референсы |
| `weave/INK.md` | Ссылка `weave/REVE_PROJECT.md` дополнена указанием на `LUMA_PROJECT.md` |
| `night/PROMPTS_HIGGSFIELD.md` | Ссылка на `ART_DIRECTION.md` ветки `gallant-ride` → путь в `branches/` |
| `night/README.md` | Дописан раздел о файлах папки и происхождении |
| `hunt/README.md` | Дописан раздел о файлах папки и происхождении |
| `weave/HANDOFF.md` | Строка о локальном сервере: абсолютный путь к корню прежнего репозитория заменён на «в папке игры (в монорепо — `04_ardet/`)» |

Остальные файлы перенесены байт-в-байт.
