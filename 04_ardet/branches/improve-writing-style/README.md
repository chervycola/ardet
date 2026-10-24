# branches/improve-writing-style/ — стилевые проходы и ачивки (апрель–август 2026)

Ветка `origin/claude/improve-writing-style-ayW6n` отошла от основной линии 2026-04-24
(`41f52ef`) и сделала 9 коммитов. Все они правят код и тексты в `src/` и сборку `build/`.
В основную линию ни один не попал: основная линия за это время переписала те же тексты
своими проходами (аудит v1, «ножницы», переплавка, сверка фактов) и удалила систему ачивок.
Поэтому правки сохранены патчами, а не влиты.

## Содержимое

| Патч | Коммит | Дата | Файлы | Что делает | Состояние в основной линии |
|---|---|---|---|---|---|
| [`01-487c2a2-tighten-prose.patch`](patches/01-487c2a2-tighten-prose.patch) | `487c2a2` | 2026-04-24 | `looks.js`, `lore.js`, `dialogues.js`, `useActions.js` | Стилевой проход по Норе Галь и Ильяхову: канцелярит, повторы, причастные цепочки | Тексты переписаны иначе; из 46 изменённых строк в основной линии найдено 2 |
| [`02-8b1765c-revert-two-edits.patch`](patches/02-8b1765c-revert-two-edits.patch) | `8b1765c` | 2026-04-24 | `dialogues.js`, `looks.js` | Откат двух правок из 01 по желанию автора | Применять только вместе с 01 |
| [`03-29a8eba-rewrite-graffiti-tag.patch`](patches/03-29a8eba-rewrite-graffiti-tag.patch) | `29a8eba` | 2026-04-24 | `useActions.js` | Новый текст граффити-тега | Не влито |
| — | `6acc094` | 2026-04-24 | только `build/ardet.html` | Пересборка после правок | Патча нет: сборка генерируется |
| [`05-56b3e4e-graffiti-tag-drop-banksy.patch`](patches/05-56b3e4e-graffiti-tag-drop-banksy.patch) | `56b3e4e` | 2026-04-24 | `useActions.js` | Тег без Бэнкси, с игрой слов | Не влито |
| [`06-37dc9c0-achievements-rebind.patch`](patches/06-37dc9c0-achievements-rebind.patch) | `37dc9c0` | 2026-05-10 | `core/achievements.js`, `main.js`, `terminal/terminal.js` | Ачивки привязаны к философии, три новые, мёртвые разблокировки подключены, команда `ach` | Устарело: основная линия убрала ачивки целиком (`d3d2b6b`, 2026-09-17, «глубина не геймифицируется»), файла `achievements.js` больше нет |
| [`07-7e35cad-infrastructure-terminal-file.patch`](patches/07-7e35cad-infrastructure-terminal-file.patch) | `7e35cad` | 2026-05-10 | `terminal_db.js`, `achievements.js`, `template.html`, `terminal.js` | Файл терминала `.infrastructure` (LLM как рабочая часть огня: дата-центры, турбины, PFAS), ачивка ИНФРАСТРУКТУРА, три пасхалки в `<head>` (#9–#11) | Не влито; текст `.infrastructure` и пасхалки — уникальны |
| [`08-4cbd940-obraz-blocks.patch`](patches/08-4cbd940-obraz-blocks.patch) | `4cbd940` | 2026-07-05 | `terminal_db.js`, `looks.js` | Блоки «ОБРАЗ» — философские портреты шести главных персонажей в досье `whois` (~580 строк) | Не влито; самый крупный уникальный текст ветки |
| [`09-08a12c2-fix-factual-errors.patch`](patches/09-08a12c2-fix-factual-errors.patch) | `08a12c2` | 2026-08-07 | `looks.js`, `lore.js`, `terminal_db.js`, `useActions.js` | Исправления фактов в мемориале (Утёйя, зарин в Токио, «Сталкер», дамба Фукусимы) и три ошибки, обыгранные шуткой | Частично сделано в основной линии независимо (мемориал `d4c4c93`, сверка фактов `cd5350c`; l70 про потерянные биткоины переписан по-своему); обыгранные ошибки не влиты |

Номера патчей идут по порядку коммитов; пропуск `04` — коммит `6acc094` без изменений в `src/`.

## Происхождение

Снапшот: `origin/claude/improve-writing-style-ayW6n` @ `08a12c2`, 2026-08-07. Патчи сняты
`git show --format=email` с путями `src/ test/ build.js package*.json`; применять из корня
монорепо с `git apply --directory=04_ardet` (чисто не прикладываются — см.
[`../README.md`](../README.md)).
