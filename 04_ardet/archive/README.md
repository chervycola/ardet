# archive/ — монолитные версии игры

Ardet Wasteland начинался как один HTML-файл `ardet_wasteland.html`: вся игра, стили и
тексты в одном документе. В апреле 2026 игру разобрали на модули (`../src/` + `../build.js`),
а монолит продолжал лежать в корне почти каждой ветки репозитория. Здесь собраны
различающиеся версии монолита, по одной на линию разработки. Новых правок в них нет и не
будет: это история.

## Содержимое

| Файл | Blob | Откуда (ветка, коммит последней правки файла) | Дата | Размер | Что это |
|---|---|---|---|---|---|
| [`ardet_wasteland.html`](ardet_wasteland.html) | `da05a38` | `origin/claude/philosophy-architecture-update-oDemg`, `3aa5641` | 2026-04-23 | 992 859 Б | Последняя версия монолита на основной линии. Тот же файл лежит в корне веток `inspiring-goodall`, `gallant-ride`, `improve-writing-style`, `fix-chat-bugs`. Содержит мобильную адаптацию, переписанные спрайты Шута и Лунного, разделённых Наблюдателей. |
| [`ardet_wasteland_review-C2pj7.html`](ardet_wasteland_review-C2pj7.html) | `ca826c9` | `origin/claude/philosophy-game-review-C2pj7`, `765bc78` | 2026-04-24 | 935 694 Б | Параллельная ветка рецензии: версия от 2026-04-15 плюс 31 фрагмент лора (l50–l80), расширенный список шёпотов и пять HTML-комментариев для LLM. На неё ссылаются по номерам строк документы `../docs/review/`. Большая часть добавленных текстов потом перенесена в `../src/content/lore.js`, часть позднее срезана аудитом (`../weave/audit-scissors.json`). |
| [`ardet_wasteland_source-dump.html`](ardet_wasteland_source-dump.html) | `8385818` | `origin/source-dump`, `510246e` | 2026-04-09 | 40 506 Б | Самый ранний снимок: незаконченный каркас (head, стили, начало скрипта), файл обрывается на объявлении состояния. Сохранён как начальная точка: в нём есть строки (meta-описание, первая запись Архивариуса), которых нет в поздних версиях. |

### Какая версия не сохранена

| Blob | Где лежит | Дата | Размер | Почему не сохранён |
|---|---|---|---|---|
| `cb30eee` | Корень `origin/claude/add-locations-physics-BpCy3` и ещё восьми веток (`System-suicide`, `baklazania-content-review`, `docs-preparation`, `eurorack-sequencer-design`, `jolly-gates`, `melody-algorithm-illustration`, `review-last-day-concept`, `review-reverberator-data`); `archive/ardet_wasteland_monolith.html` в `origin/Ardet`, `origin/main`, `origin/claude/add-system-suicide-docs-0in5C` | 2026-04-15 (`ef7ea1a`) | 905 163 Б | Целиком входит в `ardet_wasteland_review-C2pj7.html`: рецензия добавила к нему 122 строки, а единственную изменённую строку (список шёпотов `idleMsgs`) только дописала. Отдельная копия ничего не добавляет. |

Промежуточные версии внутри основной линии (73 правки монолита с 2026-04-10 по 2026-04-23)
сохранены только в истории git ветки `philosophy-architecture-update-oDemg`.

## Как открыть

Любой файл открывается напрямую в браузере, сборка не нужна. Актуальная игра — не здесь:
`../build/index.html` (см. [`../README.md`](../README.md)).
