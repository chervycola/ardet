# branches/gallant-ride/ — портреты в стиле «вудкат + один акцент» (июнь 2026)

Ветка `origin/claude/gallant-ride-bfw7hc` отошла от основной линии 2026-06-24 (`ef8bdb2`)
и сделала 4 коммита: зафиксировала дом-стиль портретов, положила готовые портреты Шута и
Sol и написала портретный бриф Машиниста. В основную линию ничего из этого не попало.

## Содержимое

| Путь | Что это | Почему не на штатном месте |
|---|---|---|
| [`src/assets/ART_DIRECTION.md`](src/assets/ART_DIRECTION.md) | Арт-дирекшн живописного слоя. По сравнению с версией основной линии (`../../src/assets/ART_DIRECTION.md`) добавлены два раздела: «ЗАФИКСИРОВАНО — дом-стиль = вудкат-гибрид» (Шут, финальный промт, `271ea5a`) и «SOL INVICTUS — ЗАФИКСИРОВАНО» (`a6c3ddc`), плюс пайплайн-заметка о кредитах Higgsfield. Остальной текст совпадает | Тот же путь, другое содержание. Версия ветки — надмножество версии основной линии, но описывает портреты в регистре, от которого основная линия ушла (см. ниже) |
| [`src/assets/portraits/jester.png`](src/assets/portraits/jester.png) | Портрет Шута, 1744×2336, 8,6 МБ: многорукий шут, тушь по пергаменту, акцент — кровавая луна (`265f764`). В ветке лежал ещё и копией в `build/assets/portraits/` — тот же файл | Если положить в `../../assets/portraits/`, игра сразу покажет его в диалоге (`src/assets/manifest.js`), а текущее задание `../../weave/PORTRAITS.md` (23.10) требует другой палитры и пишется автором заново |
| [`src/assets/portraits/sol.png`](src/assets/portraits/sol.png) | Портрет Sol, 1792×2400, 8,4 МБ: король-солнце с нимбом, акцент — золото `#b8860b` (`a6c3ddc`) | То же; кроме того, канон основной линии прямо запрещает золото: «Золота нет: позолоту пишут свечой и костью» (`weave/PORTRAITS.md`) |
| [`patches/01-cf51de1-machinist-portrait-brief.patch`](patches/01-cf51de1-machinist-portrait-brief.patch) | Правка `src/content/looks.js`: ключ `machinist` — портретный бриф Машиниста в том же дом-стиле (`cf51de1`) | Код `src/` из боковых веток не сливается. В основной линии Машинист описан иначе: «со спины, не оборачивается, свет пепельный, без тепла» (`weave/PORTRAITS.md`) |

## Как вернуть в игру, если понадобится

Портреты подхватываются без кода: файл с именем из `../../src/assets/manifest.js`
(`PORTRAITS`) кладётся в `../../assets/portraits/`. Перед этим — сверить с каноном
(навык `ardet-canon`, `weave/PORTRAITS.md`).

## Происхождение

| Коммит | Дата | Что |
|---|---|---|
| `271ea5a` | 2026-06-24 | art-direction: lock jester house style (woodcut hybrid) + winning gen |
| `265f764` | 2026-06-24 | portraits: ship locked Jester art to src + build assets |
| `cf51de1` | 2026-06-24 | content: add Machinist portrait brief (house-style iconostasis) |
| `a6c3ddc` | 2026-06-25 | portraits: ship locked Sol art to src + build assets |

Снапшот: `origin/claude/gallant-ride-bfw7hc` @ `a6c3ddc`, 2026-06-25. Файлы перенесены
байт-в-байт. Коммит `271ea5a` есть и в ветке `inspiring-goodall`; её версия
`ART_DIRECTION.md` — это версия отсюда без раздела о Sol, поэтому отдельно не хранится.
