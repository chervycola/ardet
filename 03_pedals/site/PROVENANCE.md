# Происхождение

Снапшот ветки **`origin/System-suicide`**, коммит **`bfbfcc7`** (2026-07-26, «Copy pass: drop declarations and pathos; wire catalogue + footer to i18n»). В ветке папка называлась `system-suicide/`, здесь это `03_pedals/site/`. Код взят без изменений. При сборке монорепо добавлены только `README.md` и этот файл, исходный английский `README.md` переименован в `DESIGN_HANDOFF.md`, в `README.ru.md` дописана шапка о том, что в нём устарело.

Сайт — Vite + React + TypeScript, два языка (EN/RU), статический пререндер через `prerender.mjs`. Как запустить — в [`README.md`](README.md).

## Какие копии сайта были в репозитории

| Где | Коммит | Дата | Что внутри |
|---|---|---|---|
| `origin/System-suicide:system-suicide/` | `bfbfcc7` | 2026-07-26 | **Взято.** Ветка, где сайт разрабатывали: 32 коммита в `system-suicide/` с 2026-05-21 по 2026-07-26 |
| `origin/SS:05_site/` | `6d20ae1` | 2026-07-07 | Снапшот `683d732` (2026-06-04) и этот файл в первой редакции |
| `origin/claude/add-system-suicide-docs-0in5C:site/` | `54d8669` (папка из `1b5250d`) | 2026-07-07 | Побайтно то же, что `origin/SS:05_site/` |

Чем `bfbfcc7` отличается от `683d732`: изменены только `src/i18n.tsx` и `src/sections.tsx`. Переписаны тексты hero, Solve / Coagula и манифеста (редакция 4), каталог и футер переведены на `t()`. Данные модулей (`src/data.ts`) после `683d732` не менялись, а сам `683d732` только удалил из `data.ts` атлас патчей `PATCHES`. Последняя правка таблицы `MODULES` — `fa65239` (2026-05-23, у Last Night в `fn` вернули «function generator»). Последняя правка страниц модулей (`PRODUCT_PAGES`, `PRODUCT_PAGES_RU`) — `318587d` (2026-05-26, цена Is My €2480).

## Сверка данных сайта с каноном серии

Сверка с [`../00_series/SYSTEM_SUICIDE.md`](../00_series/SYSTEM_SUICIDE.md) (v3.1, таблица «Обзор системы» и «Дорожная карта»), decisions и папками педалей, по состоянию на сборку монорепо (2026-10). Поля `fn` и `hp` видны в карточках каталога всегда. Поле `core` у модулей с `redacted: true` на сайте закрыто плашкой CLASSIFIED.

| Что | На сайте | Канон | Статус |
|---|---|---|---|
| Is My, ширина | 10 HP в каталоге (`data.ts`, `MODULES`); «12 HP + remote» на странице модуля (`PRODUCT_PAGES['is-my'].stats`) | 14 HP в таблице канона и в [Decision 12](../00_series/decisions/12_is_my_shaper_respec.md). В рабочих документах уже ~20 HP: [`../03_is_my/02_technical.md`](../03_is_my/02_technical.md) §A9 и R15, `panel_module.svg` | ✗ Не исправлено. На сайте даже внутри одной страницы две разные цифры |
| Is My, пульт и линк | Пульт на 1S LiPo с зарядкой по USB-C; линк TRS / MIDI Type A; один джойстик, ножной переключатель, CV-выходы X / Y / GATE на пульте; VIDEO IN (audifier); корпус — CNC или «оригинальная рация» | Линк USB-C: модуль работает USB-host на MAX3421E и питает пульт по VBUS, батареи нет. Пульт собран в корпусе-доноре DJI C5, работают два стика, CV-выходов на пульте нет (D12, [`../03_is_my/README.md`](../03_is_my/README.md), `05_pult_dji_c5.md`) | ✗ Страница Is My описывает ранний вариант прибора, тот же, что в `01_concept.md` |
| Is My, цена, тираж, фаза | €2480, 13 экземпляров, Phase 2 | €2480, 13 экземпляров, Phase 2 | ✓ |
| Is My, срок | «Phase 2 · ships Q4 2026» | Срок не определён. Железа ещё нет, итерации It-0 … It-8 не начаты ([`../03_is_my/README.md`](../03_is_my/README.md), «Статус») | ✗ Срок на сайте ничем не подтверждён |
| And My | `hp: 'TBD'`, `redacted: true`, Phase 2; `fn: 'Crossfader · TBD'`; скрытый `core`: «Stereo bridge between Last Day and Last Night» | [Decision 13](../00_series/decisions/13_and_my_tbd.md): функция и материал не заданы, вариант с кроссфейдером Day↔Night отвергнут. [Decision 15](../00_series/decisions/15_optical_bus_hybrid.md) предлагает материальный секвенсор (статус proposal), см. [`../06_and_my/README.md`](../06_and_my/README.md) | ≈ Ширина и закрытость совпадают с D13. Видимая подпись «Crossfader» противоречит D13. Её вернул коммит `414b706` (v3 design pass) после отката в `b41db61` |
| Last Night: цена, формат, питание, эксайтер, фаза | €3640 со всеми картриджами; 40 HP / педаль; ±12 В · 200 мА (пик 450); DAEX32Q-4; SHIP — Phase 1 | То же ([`../01_last_night/LAST_NIGHT_SPEC.md`](../01_last_night/LAST_NIGHT_SPEC.md)) | ✓ |
| Last Night: состав и размеры картриджей | Phase 1: raw oak, linseed oak, shellac maple, **marble**, brass, spring steel. Размеры по старой редакции (например, oak 100×40×4 мм). Кость — **scapula** | Канон §9: **slate вместо marble**, oak 100×45×1,8 мм, кость — femur cortical (scapula отклонена). В `LAST_NIGHT_SPEC.md` (Phase 1 catalog) набор другой: steel, brass, aluminum, oak, slate, glass | ✗ Данные сайта устарели. Внутри канона набор Phase 1 тоже не согласован, поэтому сайт пока не с чем выровнять однозначно |
| Last Night: сроки | «Next batch · December 2026», «3–4 months · made to order» | Stage 0 bench gate не пройден, разводки PCB нет ([`../01_last_night/README.md`](../01_last_night/README.md), «Статус») | ✗ Маркетинговые сроки ничем не подтверждены |
| Be Careful | `hp: 'TBD'`, PHASE 3 | 14 HP, Phase 4 (Filter Expansion) | ✗ |
| Fuck Abandoned Sleep | 8 HP, PHASE 3 | 14 HP в таблице канона (в дорожной карте того же файла — 10 HP), Phase 3 | ✗ Ширина. В самом каноне две разные цифры |
| I Show You Light | 16 HP, PHASE 3; скрытый `core`: BLDC-тонколесо, LED → фотодиод | 16 HP, Phase 3. [Decision 14](../00_series/decisions/14_isyl_respec.md) (статус proposed) меняет LED на лазер и вводит FOC-сервопетлю, ширина обсуждается: 16 против ≥ 24 HP ([`../05_i_show_you_light/README.md`](../05_i_show_you_light/README.md)) | ≈ Видимые поля совпадают, скрытый `core` написан до D14 |
| Body Blood And Salt | 20 HP, PHASE 5; скрытый `core` упоминает «liquid well with swappable electrodes» | 20 HP в таблице канона (в дорожной карте того же файла, Phase 5, — 10 HP touch-only v1), Phase 5, первая версия только с touch-pads, без жидкостей | ≈ Видимые поля совпадают с таблицей канона, скрытый `core` устарел. В самом каноне две разные цифры ширины |
| All Bones Dust | 10 HP, SHIP — PHASE 1 | 10 HP, Phase 1 | ✓ |
| Last Day | 40 HP, PHASE 2 | 40 HP (+ pedal SKU) в таблице канона, Phase 2. В разделе Last Day и в дорожной карте того же файла — «40 HP Eurorack only», педальная версия отложена | ✓ Видимые поля совпадают. Наличие pedal SKU в самом каноне не согласовано |
| Сумма HP в шапке каталога | «9 modules · ~144 HP» (`cat_meta_1`) | 148 HP без BBAS, плюс резерв под And My | ✗ |

## Что изменилось относительно первой редакции этого файла

Первая редакция (`origin/SS:05_site/PROVENANCE.md`, коммит `6d20ae1`) описывала снапшот `683d732` и содержала три пункта:

- «Is My на сайте: MOSFET shaper, 10 HP — в каноне уточнено до 14 HP (jolly-gates panel)». В `bfbfcc7` это **не исправлено**. Панель из ветки `origin/claude/jolly-gates-KxAP2` (теперь [`../03_is_my/`](../03_is_my/)) с тех пор выросла до ~20 HP, см. таблицу выше.
- «And My на сайте: TBD/CLASSIFIED — соответствует Decision 13 ✓». Пункт уточнён: видимая подпись `fn` по-прежнему говорит «Crossfader».
- «Last Night €3640, Is My €2480 — соответствуют канону ✓». Это по-прежнему так.

Ссылка на канон `../synth/` из первой редакции заменена на пути новой раскладки: `../00_series/`, `../01_last_night/`, `../03_is_my/` и т. д.

## Что поправить при следующей синхронизации сайта

1. Is My: одна цифра ширины в `MODULES` и на странице модуля (сейчас ~20 HP по R15, финал после разводки). Блок пульта переписать под DJI C5 и USB-C: батареи и CV-выходов нет, два стика.
2. And My: `fn` → `'TBD'`, как в `b41db61` и D13.
3. Be Careful → 14 HP, Phase 4. Fuck Abandoned Sleep → ширина по канону, после того как канон определится между 14 и 10 HP.
4. Last Night: состав и размеры картриджей — после того как `SYSTEM_SUICIDE.md` §9 и `LAST_NIGHT_SPEC.md` договорятся о наборе Phase 1.
5. Сумма HP в `cat_meta_1` (EN и RU).
6. Сроки отгрузки (`counter_ships`, «ships Q4 2026») — сверить с реальным статусом Stage 0 и итераций Is My.
7. Не данные, а вёрстка: пункт меню «Patches» (`index.html#patches`) ведёт на секцию, которой с `683d732` нет (теперь `#solve-coagula`); ссылки футера `#catalog`, `#last-night`, `#manifesto` на `module.html` не работают без префикса `index.html`. Подробнее — в [`README.md`](README.md), «Статус».
