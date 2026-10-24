# site · маркетинг-сайт SYSTEM SUICIDE

Промо- и каталог-сайт серии модулей SYSTEM SUICIDE. На сайте бренд пишется как **SYSTEM ☐**: слово «suicide» везде заменено визуальным знаком (лезвие в hero, перечёркнутый квадрат, верёвка, колючая проволока). Сайт состоит из двух страниц:

- **главная** (`index.html`) — один длинный скролл: hero, счётчик, сигнальная цепь, каталог 9 модулей, блок флагмана Last Night, Solve / Coagula, манифест, футер;
- **страница модуля** (`module.html?m=<slug>`) — одна страница для всех модулей. Полностью расписаны Is My и Last Night, остальные семь показаны как CLASSIFIED: имя размыто, тело страницы закрыто плашками.

Стек: Vite 5 (multi-page), React 18, TypeScript (strict), чистый CSS. Языки EN и RU, переключатель в топбаре. По умолчанию открывается RU, выбор запоминается в `localStorage` (ключ `ss_lang`). Аналитики, трекеров и сторонних UI-библиотек нет. Шрифты грузятся с Google Fonts.

## Статус

Снапшот: `origin/System-suicide`, коммит `bfbfcc7` от 2026-07-26 (copy pass). После этого коммитов в ветке нет.

- **Полная сборка не проверена.** При сборке монорепо (2026-10-24) `npm ci` не прошёл: в среде нет доступа к npm-реестру. Проверено офлайн: все 11 файлов `src/*.ts(x)` транспилируются TypeScript без синтаксических ошибок; `package.json`, `package-lock.json` и `tsconfig.json` валидны; зависимости в lockfile совпадают с `package.json` (vite 5.4.21, react 18.3.1, typescript 5.9.3); все ключи `t('…')` из кода есть в словарях EN и RU. При ревизии папки код прогнан через `tsc --noEmit` с настройками `tsconfig.json` (strict, `noUnusedLocals`), но с самодельными заглушками вместо `@types/react` и `react-dom`: ошибок в коде проекта нет, единственное замечание вызвано самой заглушкой. Это частичная проверка. Настоящий тип-чек с `@types/react` и `vite build` не запускались.
- **Данные модулей отстают от канона.** Is My (ширина, пульт, линк), подпись And My, Be Careful, Fuck Abandoned Sleep, набор картриджей Last Night, сумма HP, сроки отгрузки. Полная таблица и список правок — в [`PROVENANCE.md`](PROVENANCE.md).
- **Заглушки.** Почти все ссылки футера ведут на `href="#"`: соцсети, Schematics, Service, Press и другие. Так же устроена кнопка «Schematic PDF» в блоке Last Night на главной. В том числе **«Crisis lines · global»**: по [`DESIGN_HANDOFF.md`](DESIGN_HANDOFF.md) (п. 10 «Notes for the developer») перед публичным деплоем она обязана вести на реальный ресурс, например findahelpline.com. Корзина `[0]` в топбаре — декорация. OG-тегов, `sitemap.xml` и `robots.txt` нет.
- **Битые якоря.** Пункт меню «Patches / Патчи» в топбаре ведёт на `index.html#patches`, а такой секции с `683d732` нет: её место заняла Solve / Coagula с `id="solve-coagula"` (`src/sections.tsx`, `TopBar`). Футер общий для обеих страниц, и его ссылки `#catalog`, `#last-night`, `#manifesto` написаны без `index.html`. На `module.html` они никуда не ведут.
- **Переводы.** Главная переведена почти полностью. Исключения: подписи «Physical core» / «Physical core · CLASSIFIED» в карточках каталога захардкожены, хотя ключи `cat_phys_core` и `cat_classified` в словаре есть. Нижняя строка футера тоже захардкожена: `© 2026–203∞ SYSTEM`, `РОССИЯ. ОРЁЛ-МОСКВА-ЗЕЛЕНОГРАД` и `END PAGE001-000-001` не проходят через `t()`, поэтому «РОССИЯ…» и в EN-режиме выводится по-русски. Поля модулей `fn` и `core` из `data.ts` есть только на английском. Страница Is My есть на двух языках. У Last Night русской версии нет, в RU-режиме она показывается на английском (в `PRODUCT_PAGES_RU` только `is-my`).
- **Мёртвый код.** `src/anim-metaphors.tsx` (10 анимированных иконок секции Lexicon) нигде не импортируется: секцию убрали с главной в `de0d30f`. Файл попадает под тип-чек, но в бандл не входит. В `i18n.tsx` остались ключи удалённых секций (`lex_*`, `pat_*`). Ещё 6 ключей в коде не используются: `cat_phys_core`, `cat_classified`, `foot_copyright`, `foot_modules`, `foot_motto`, `foot_version`. Всего в коде вызывается 118 ключей из 130.
- **Деплой.** Конфигурации деплоя и CI в репозитории нет. Где сайт опубликован и опубликован ли вообще, в репозитории не указано.

## Содержимое папки

| Файл / папка | Что это |
|---|---|
| [`index.html`](index.html) | Точка входа главной: шрифты, `<div id="root">`, `src/main.tsx` |
| [`module.html`](module.html) | Точка входа страницы модуля, slug берётся из `?m=` (`src/module-main.tsx`) |
| [`src/App.tsx`](src/App.tsx), [`src/main.tsx`](src/main.tsx) | Корневой компонент и монтирование главной |
| [`src/ModuleApp.tsx`](src/ModuleApp.tsx), [`src/module-main.tsx`](src/module-main.tsx) | Корневой компонент и монтирование страницы модуля |
| [`src/sections.tsx`](src/sections.tsx) | Секции главной: TopBar, Hero, CounterStrip, SignalChain, Catalog, LastNight, SolveCoagula, Manifesto, Footer |
| [`src/module-page.tsx`](src/module-page.tsx) | Страница модуля: шапка, раскрытое тело (характеристики, контролы, сигнальная цепь), CLASSIFIED-тело, навигация «пред./след.» |
| [`src/data.ts`](src/data.ts) | **Данные серии:** `MODULES` (9 модулей: HP, фаза, функция, ядро), `CARTRIDGES`, `PRODUCT_PAGES` (EN), `PRODUCT_PAGES_RU`, `REVEALED_NAMES` |
| [`src/i18n.tsx`](src/i18n.tsx) | Словарь EN/RU (130 ключей), `LangProvider`, `useT`, переключатель языка |
| [`src/types.ts`](src/types.ts) | TS-типы данных |
| [`src/motifs.tsx`](src/motifs.tsx) | SVG-мотивы: рейлы, лезвие, колючая проволока, метки, иллюстрации Solve / Coagula |
| [`src/anim-metaphors.tsx`](src/anim-metaphors.tsx) | 10 анимированных SVG-иконок; сейчас не используется |
| [`src/styles.css`](src/styles.css) | Все стили, токены в `:root` (oklch) |
| [`public/`](public/) | `favicon.svg` (знак-лезвие); `amex-blade.webp` (36 КБ) и запасной `amex-blade.png` (700 КБ), оба 1200 px — фото лезвия в hero |
| [`prerender.mjs`](prerender.mjs) | Статический пререндер в редактируемые HTML-снапшоты `system_suicide_*.html` (в `.gitignore`) |
| [`package.json`](package.json), [`package-lock.json`](package-lock.json) | Зависимости и скрипты `dev` / `build` / `preview` |
| [`vite.config.ts`](vite.config.ts), [`tsconfig.json`](tsconfig.json) | Конфиг Vite (два входа: `index`, `module`) и TypeScript |
| [`.gitignore`](.gitignore) | `node_modules`, `dist`, снапшоты пререндера |
| [`PROVENANCE.md`](PROVENANCE.md) | Откуда снапшот и где данные сайта расходятся с каноном |
| [`README.ru.md`](README.ru.md) | Исходные заметки разработчика (2026-05-21): стек, деплой на reg.ru, заглушки, юридика AmEx, TODO. Частично устарели, что именно — в шапке файла |
| [`DESIGN_HANDOFF.md`](DESIGN_HANDOFF.md) | Handoff из Claude Design (англ.): дизайн-токены, типографика, секции, компоненты, анимации. Это бывший `README.md` сайта. Описывает исходный прототип на `*.jsx`, который при миграции переписан в `src/*.tsx` |

## Как запустить

Нужен Node 18+ и npm.

```bash
cd 03_pedals/site
npm ci             # зависимости строго по package-lock.json
npm run dev        # dev-сервер, http://localhost:5173
npm run build      # tsc --noEmit + vite build → dist/
npm run preview    # посмотреть прод-сборку локально
```

Страница модуля в dev-режиме открывается так: `http://localhost:5173/module.html?m=last-night`. Список slug — в таблице ниже и в `src/data.ts`.

Статические снапшоты для правки вёрстки руками:

```bash
node prerender.mjs ru   # или en
```

Скрипт поднимает Vite в SSR-режиме и пишет в эту же папку `system_suicide_index.html`, `system_suicide_last-night.html`, `system_suicide_is-my-ru.html` и `system_suicide_is-my-en.html`. Все стили вшиты внутрь. Файлы игнорируются git. Запускать нужно из этой папки: корень Vite и место записи снапшотов берутся из текущего каталога. Скриптов в снапшотах нет. Фото лезвия подключено по абсолютному пути `/amex-blade.*`, поэтому при открытии снапшота с диска (`file://`) оно не загрузится.

## Деплой

После `npm run build` в `dist/` лежат `index.html`, `module.html`, `assets/` и содержимое `public/`. Это статика, её можно залить на любой хостинг как есть. Пошагово для reg.ru — в [`README.ru.md`](README.ru.md), раздел «Деплой».

- Сайт рассчитан на **корень домена**. Пути `/favicon.svg`, `/amex-blade.webp` и `/amex-blade.png` абсолютные, `base` в Vite по умолчанию `/`. Чтобы выложить сайт в подпапку, нужно задать `base` в `vite.config.ts` и убрать абсолютные пути к картинке лезвия в `src/sections.tsx`: Vite переписывает пути в HTML, но не строковые литералы в JSX.
- Оба `.html` должны лежать на одном уровне: ссылки вида `module.html?m=…` относительные.

## Связь с каноном серии

Сайт — витрина. Данные в нём перенесены из канона руками, сам сайт источником истины не является. Правки делаются в таком порядке: сначала канон, потом `src/data.ts` и `src/i18n.tsx`, потом [`PROVENANCE.md`](PROVENANCE.md).

- Канон-бриф серии: [`../00_series/SYSTEM_SUICIDE.md`](../00_series/SYSTEM_SUICIDE.md). Решения, на которые опирается сайт: [Decision 11](../00_series/decisions/11_cartridge_architecture_lock.md) (картридж Last Night пассивный), [Decision 12](../00_series/decisions/12_is_my_shaper_respec.md) (Is My — MOSFET-шейпер с пультом), [Decision 13](../00_series/decisions/13_and_my_tbd.md) (And My — TBD). Индекс всех решений: [`../00_series/decisions/`](../00_series/decisions/).
- Имена открыты только у Is My и Last Night (`REVEALED_NAMES`, коммит `fdbd7e6`). Остальные модули на сайте размыты и закрыты. Это решение бренда, а не пробел в данных.

| # | Модуль | slug | На сайте | Материалы в репо |
|---|---|---|---|---|
| 01 | I Show You Light | `i-show-you-light` | скрыт, 16 HP, Phase 3 | [`../05_i_show_you_light/`](../05_i_show_you_light/) |
| 02 | Body Blood And Salt | `body-blood-and-salt` | скрыт, 20 HP, Phase 5 | только канон, §2 |
| 03 | All Bones Dust | `all-bones-dust` | скрыт, 10 HP, Phase 1 | только канон, §3 |
| 04 | Be Careful | `be-careful` | скрыт, TBD, Phase 3 | только канон, §4 |
| 05 | Fuck Abandoned Sleep | `fuck-abandoned-sleep` | скрыт, 8 HP, Phase 3 | только канон, §5 |
| 06 | Is My | `is-my` | открыт, страница EN и RU, €2480 | [`../03_is_my/`](../03_is_my/) |
| 07 | Last Day | `last-day` | скрыт, 40 HP, Phase 2 | [`../02_last_day/`](../02_last_day/) |
| 08 | And My | `and-my` | скрыт, TBD, Phase 2 | [`../06_and_my/`](../06_and_my/) |
| 09 | Last Night | `last-night` | открыт, флагман, страница EN, €3640 | [`../01_last_night/`](../01_last_night/) |

Генеративного секвенсора LITHOSEQ ([`../04_sequencer_lithoseq/`](../04_sequencer_lithoseq/)) на сайте нет. Слот 08 на сайте подписан по старому концепту кроссфейдера. Предложение [Decision 15](../00_series/decisions/15_optical_bus_hybrid.md) (материальный секвенсор, статус proposal) и трактовку туториала Last Day, где слот 8 назван LITHOSEQ, сайт не отражает. Разбор связи And My с LITHOSEQ — в [`../06_and_my/README.md`](../06_and_my/README.md).

## Происхождение

| Ветка | Коммит | Дата | Что взято |
|---|---|---|---|
| `origin/System-suicide` | `bfbfcc7` | 2026-07-26 | Вся папка `system-suicide/` побайтно, кроме переименования `README.md` → `DESIGN_HANDOFF.md` |
| `origin/SS` | `6d20ae1` | 2026-07-07 | `05_site/PROVENANCE.md`, переписан под `bfbfcc7` и новую раскладку. Остальное в `05_site/` — более старый снапшот `683d732`, заменён |
| `origin/claude/add-system-suicide-docs-0in5C` | `54d8669` | 2026-07-07 | Ничего: `site/` побайтно совпадает с `origin/SS:05_site/` |

Изменения при сборке монорепо:
- `README.md` (этот файл) написан заново;
- исходный английский `README.md` (handoff, коммит `8212903`) сохранён без изменений под именем `DESIGN_HANDOFF.md`;
- в `README.ru.md` добавлена шапка о том, что устарело, ссылка на handoff переведена на `DESIGN_HANDOFF.md`, дерево файлов поправлено под `site/`;
- `PROVENANCE.md` обновлён: снапшот `bfbfcc7`, полная сверка с каноном, пути к канону в новой раскладке.

Исходный прототип Claude Design (`*.jsx`, `tweaks-panel.jsx`, коммит `8212903`) в папку не перенесён: в `c69722e` он переписан на TypeScript и удалён. Его можно достать из истории ветки `origin/System-suicide`.
