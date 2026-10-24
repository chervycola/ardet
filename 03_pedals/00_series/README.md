# 00 · SYSTEM SUICIDE — общесерийные документы

Здесь лежит всё, что относится к серии SYSTEM SUICIDE целиком, а не к одному модулю: канон-бриф, полная цепочка design decisions, критический аудит весны 2026, правки по итогам аудита и иллюстрированный гид. Материалы отдельных разработок (спеки, схемы, прошивки, панели) лежат в соседних папках `03_pedals/`; ссылки на них есть в таблице модулей ниже.

## Серия в двух словах

SYSTEM SUICIDE — серия из девяти модулей физического синтеза в формате Eurorack. Два финализатора, Last Day и Last Night, дополнительно выпускаются в корпусе big-box pedal. В основе каждого модуля физический материал: свет, кожа, кость, стекло, маятник, силовая электроника, масло, резонирующая пластина. Принцип серии: «электроника обслуживает физику». Названия модулей складываются в одну строку, и порядок слов в ней совпадает с порядком модулей в сигнальной цепи, слева направо:

> *I Show You Light, Body Blood And Salt, All Bones Dust — Be Careful — Fuck Abandoned Sleep Is My Last Day And My Last Night.*

Last Day («день») и Last Night («ночь») образуют пару финализаторов-комбайнов. Остальные семь модулей — сателлиты, их роли со временем пересматриваются так, чтобы дополнять эту пару, а не повторять её.

## Модули серии

Данные взяты из канона [`SYSTEM_SUICIDE.md`](SYSTEM_SUICIDE.md) (v3.1) и decisions 01–15. Phase — по сводке сроков в каноне (раздел «Дорожная карта прототипирования»).

| # | Модуль | Что это | HP | Phase | Статус | Материалы |
|---|--------|---------|----|-------|--------|-----------|
| 1 | **I Show You Light** | Осциллятор: оптическое тон-колесо (вращающийся диск в луче) + контактный пьезо-стилус | 16 (по D14 возможно ≥24) | 3 (M21–33) | Канон v6.5 описывает LED-версию. Re-spec [D14](decisions/14_isyl_respec.md) (лазер + FOC-сервопетля, 4 голоса) — proposed, lock после Stage 0 | [`../05_i_show_you_light/`](../05_i_show_you_light/) |
| 2 | **Body Blood And Salt** | Синт/процессор: touch-pads (v1), жидкости тела (v5) | 20 | 5 (M33+), отложен | Концепт в каноне, §2; отложен по D01 §4 | только канон |
| 3 | **All Bones Dust** | Waveshaper / distortion / VCA: трансформатор + механический раттл | 10 | 1 (M1–9) | Концепт в каноне, §3; самый простой модуль, идёт в Phase 1 вместе с Last Night | только канон |
| 4 | **Be Careful** | Резонансный фильтр: стеклянная пластина + exciter/piezo | 14 | 4 (M27–33) | Концепт в каноне, §4 (D01 §1: стеклянная пластина) | только канон |
| 5 | **Fuck Abandoned Sleep** | LFO / модулятор: физический маятник + оптическое считывание | 14 | 3 (M21–33) | Концепт в каноне, §5 | только канон |
| 6 | **Is My** | MOSFET-shaper (SHAPER / RING / GATE) на каскаде из ESC FPV-дрона + выносной пилотный пульт на доноре DJI C5 | 14 | 2 (M9–21) | **LOCKED** ([D12](decisions/12_is_my_shaper_respec.md)); edition of 13, €2480; схемотехника и прошивки в работе | [`../03_is_my/`](../03_is_my/) |
| 7 | **Last Day** | Финализатор «предапокалипсис»: oil-can delay + solar amp + tongue-резонатор + hot palette FX | 40 + pedal SKU | 2 (M9–21) | Combine-концепт **LOCKED** ([D06](decisions/06_last_day_combine_concept.md) → [D08](decisions/08_consolidated_base.md)); R&D, план из 4 bench rigs | [`../02_last_day/`](../02_last_day/) |
| 8 | **And My** | **TBD** | TBD (резерв 6–14) | вне roadmap до появления концепта | **TBD** ([D13](decisions/13_and_my_tbd.md), LOCKED). В D15 для слота есть proposal: материальный секвенсор (см. ниже) | [`../06_and_my/`](../06_and_my/) |
| 9 | **Last Night** | Финализатор «постапокалипсис»: ревербератор на сменных пластинах (material resonator) + cold palette FX | 40 + pedal SKU | 1 ship (M1–9) | Design lock v6.5 ([D09](decisions/09_hybrid_lock.md) + [D11](decisions/11_cartridge_architecture_lock.md)); перед PCB и закупками обязателен Stage 0 bench gate; headline €3640 | [`../01_last_night/`](../01_last_night/) |

HP-бюджет по канону: **148 HP** без BBAS и And My, то есть два ряда по 84 HP с резервом 6–14 HP под And My. С BBAS — **168 HP**.

Соседние проекты, которые не входят в 9-модульную серию: генеративный секвенсор LITHOSEQ — [`../04_sequencer_lithoseq/`](../04_sequencer_lithoseq/), маркетинг-сайт серии — [`../site/`](../site/).

### And My и LITHOSEQ

- По канону слот 8 пуст. [Decision 13](decisions/13_and_my_tbd.md) (LOCKED, 2026-07) отменил концепт Day↔Night crossfader и вернул And My в TBD. MOSFET-shaper, который одно время стоял на этом слоте ([D05](decisions/05_and_my_respec.md)), переехал на слот 6 под именем Is My.
- [Decision 15](decisions/15_optical_bus_hybrid.md) (коммит `a3455f4`, 2026-07-07) в таблице точек подключения оптической шины предлагает для And My **материальный секвенсор**: 32×32 оптико-импедансная матрица, сменные кристаллические или пористые пластины. Статус — proposal. Иллюстрация алгоритма «пластина = партитура» (ветка `melody-algorithm-illustration`, коммит `95a2fa7`, 2026-07-08, статус draft) лежит в [`../06_and_my/`](../06_and_my/).
- LITHOSEQ (ветка `eurorack-sequencer-design`) — отдельный генеративный секвенсор. Он сканирует сменный физический образец (кристаллический нарост, пористый материал) и строит из него карту 32×32, из которой получаются CV/gate. По принципу и сетке он близок к And My-proposal, но в документах LITHOSEQ And My не упоминается, а на ветке SS он записан как соседний проект вне серии. Решения объединить And My и LITHOSEQ нет: это два родственных концепта, канонический статус And My — TBD.

## Карта папки

| Путь | Что это |
|------|---------|
| [`SYSTEM_SUICIDE.md`](SYSTEM_SUICIDE.md) | Канон-бриф серии v3.1: 9 модулей, сигнальная цепь, HP-бюджет, сценарии, дорожная карта. Source of truth по серии. В §1 есть сноска о re-spec I Show You Light (D14) |
| [`decisions/`](decisions/) | Вся цепочка design decisions 01–15, включая отменённые и относящиеся к одной педали (Last Night, Last Day, Is My, ISYL). Подробный индекс — [`decisions/00_README.md`](decisions/00_README.md), таблица статусов — [`decisions/README.md`](decisions/README.md) |
| [`audit/`](audit/) | Критический аудит серии (апрель 2026): Last Night v2.1, Last Day, остальные модули, риски BOM, питание/тепло/EMI, противоречия, HTML-каркас схемы Last Night v2.0. Документ исторический: баннеры в начале файлов отсылают к более поздним decisions |
| [`fixes/`](fixes/) | Правки по итогам аудита для Last Night v2.1: 15 фиксов схемы, BOM delta, правила разводки PCB, протокол тестирования прототипа |
| [`docs/`](docs/) | Иллюстрированный гид по серии ([`SYSTEM_SUICIDE_GUIDE.md`](docs/SYSTEM_SUICIDE_GUIDE.md)) и скрипт сборки в HTML/DOCX/PDF через pandoc |
| [`history/`](history/) | Альтернативная редакция канон-брифа (v3.0 из ветки HWbFa, 2026-05-12), хранится как исторический документ |

## Порядок чтения

**Чтобы понять серию:**
1. [`SYSTEM_SUICIDE.md`](SYSTEM_SUICIDE.md) — обзор системы, затем разделы модулей §1–§9.
2. [`docs/SYSTEM_SUICIDE_GUIDE.md`](docs/SYSTEM_SUICIDE_GUIDE.md) — концептуальный гид без инженерных деталей.
3. [`decisions/00_README.md`](decisions/00_README.md) — что решено и что отменено (01 → 15).
4. [`audit/01_executive_summary.md`](audit/01_executive_summary.md) и [`audit/02_system_architecture.md`](audit/02_system_architecture.md) — исторический контекст рисков.
5. Дальше — папка нужного модуля (таблица выше).

**Для production и sourcing:**
1. [`decisions/10_premium_components_sourcing.md`](decisions/10_premium_components_sourcing.md) — Elite tier и матрица поставщиков.
2. [`decisions/04_production_strategy.md`](decisions/04_production_strategy.md) — фазы и бизнес-модель.
3. [`decisions/03_cartridge_standards.md`](decisions/03_cartridge_standards.md) и [`decisions/11_cartridge_architecture_lock.md`](decisions/11_cartridge_architecture_lock.md) — формат картриджа.
4. Закупки и инженерия Last Night — [`../01_last_night/`](../01_last_night/).

## Текущий статус

**Design lock v6.5** = Decision 09 (hybrid) + audit pass v6.3 + improvements v6.4 + Decision 11 (картридж — пассивная пластина). Ближайший шаг — Phase 1 ship Last Night. Перед PCB и закупками обязателен Stage 0 bench gate (RISK_ASSESSMENT в `../01_last_night/`). Параллельно идут R&D Last Day (Phase A, bench rigs) и Is My. D14 предлагает ещё один параллельный трек — Stage 0 сервопетли ISYL, он требует sign-off.

### Ключевые решения

- **LOCKED:** 08-consolidated (Day/Night комбайны, dual SKU), 09 (v5 hybrid), 11 (пассивный картридж, трансдьюсеры в модуле), 12 (Is My = MOSFET-shaper + пульт DJI C5), 13 (And My = TBD), 15 (топология оптической шины).
- **Proposed / draft:** 14 (ISYL: лазер + FOC, lock после Stage 0), retina-плата из D15 (draft до KiCad).
- Отменены, но хранятся как звенья цепочки: 01 §2 и §3, 05, 08-refined, частично 02 и 04.

Полная таблица — [`decisions/README.md`](decisions/README.md).

### План фаз для Day/Night (по Decision 08)

| Phase | Окно | Last Night | Last Day |
|-------|------|------------|----------|
| **1 ship** | M1–9 | Ядро v5 hybrid (reverb + base FX + 4 footswitches + always-on phaser + Color slider) | R&D |
| **2 ship** | M9–27 | Cold palette upgrade kit (PULSE/FOG/FROST/CHILL/HUM, PCB v3) | v1 ship (oil-can + solar + tongue + hot palette) |
| **2B** | M27–33 | Оптимизация HUM | Моторизованный tongue-резонатор (v2 premium) |
| **3** | M27+ | Respec сателлитов | Boutique-составы масла + BLDC-мотор |

В сводке канона окна фаз другие (Phase 2 — M9–21, 2B — M21–27). Расхождение унаследовано от исходных веток и при сборке не исправлялось.

### Source of truth (по убыванию)

Ранжирование для Day/Night взято из прежнего README ветки SS:

1. `../01_last_night/LAST_NIGHT_SPEC.md` + `LAST_NIGHT_BUILD.md` — основной технический канон (v5 hybrid).
2. `decisions/08`, `09`, `10` — зафиксированные архитектурные и бизнес-решения.
3. `audit/` — сохранённый исторический анализ, часть выводов устарела после Decision 08.
4. `fixes/` — список правок до Decision 08, большей частью применён или поглощён Decision 08.

Для серии в целом источник — `SYSTEM_SUICIDE.md`. По картриджу — `decisions/11`, по Is My, And My и ISYL — `decisions/12`–`15`.

### Открытые задачи

- [ ] Last Night: проект PCB в KiCad (сейчас есть только ASCII floor plan).
- [ ] Last Day: инженерный документ по oil-can, ёмкостному фронтенду и механизму tongue (Phase A).
- [ ] Respec сателлитов (All Bones Dust / Fuck Abandoned Sleep / Be Careful / I Show You Light) под Day/Night комбайны (Phase 3+).
- [ ] Прослушивание прототипа cold palette FX (антенна HUM, тест шума DC-DC).
- [ ] Мануалы обработки картриджей для дерева, камня, металла и стекла (готовы только кость и нефрит, `../01_last_night/cartridges/`).
- [ ] Sign-off по D14: параллельный Stage 0 трек ISYL, вопрос HP (16 или ≥24).
- [ ] D15: retina-плата в KiCad; proposals по Be Careful, FAS, Last Day, And My.
- [ ] And My — слот 8 ждёт концепта (D13).

### Известные несостыковки (оставлены как есть)

- `SYSTEM_SUICIDE.md` §7 (Last Day) в линии SS остался в редакции до Decision 06: «40 HP Eurorack only», FX-subset v1 HAZE/DRAG, «зеркальность Day↔Night». Обзорная таблица и примечание о форм-факторе в том же файле уже говорят о dual SKU по Decision 08. Актуальная спецификация — `../02_last_day/` (LAST_DAY_SPEC). Редакция §7, где уже учтены D06 и 08-refined, сохранена в [`history/`](history/).
- Баннер в `decisions/02_last_day_scope.md` называет D3 «solar optional» активным, тогда как D06 и 08-consolidated требуют обязательный LED baseline (солнце работает только как модуляция).
- Номер «08» занят дважды: `08_refined_fx_palette.md` (промежуточный) и `08_consolidated_base.md` (финальный).
- Пути к файлам внутри документов записаны как `code`, обычно относительно корня серии (`decisions/…`, `audit/…`). При сборке исправлены только пути, которые сломал переезд (см. ниже).

## Как собрать гид

```bash
cd docs
./build.sh
```

Нужен `pandoc`. HTML и DOCX собираются всегда, PDF — если установлен `xelatex`, `wkhtmltopdf` или `weasyprint`. Готовые файлы перечислены в `docs/.gitignore` и в репозиторий не коммитятся. Проверено при сборке репо: pandoc 3.1.3 собирает HTML и DOCX без ошибок. Подробнее — [`docs/README.md`](docs/README.md).

## Происхождение

Папка собрана из нескольких веток. Для каждого файла взята самая свежая версия. Правки, которые были только в одной ветке, слиты вручную.

| Ветка | Коммит | Дата | Что взято |
|-------|--------|------|-----------|
| `origin/SS` | `6d20ae1` | 2026-07-07 | Основа: весь `00_series/` — `SYSTEM_SUICIDE.md`, `audit/`, `decisions/00–13` (+ .docx), `docs/`, `fixes/`. Сюда уже вошла консолидация `1b5250d`, которая перенесла decisions 05–07, 08-refined и `docs/` из ветки HWbFa |
| `origin/claude/docs-preparation-xuki5v` | `a3455f4` | 2026-07-07 | `decisions/14_isyl_respec.md`, `decisions/15_optical_bus_hybrid.md`; сноска в §1 и строка таблицы модулей в `SYSTEM_SUICIDE.md`; блок «Update 2026-07» в `audit/30_other_modules_gaps.md`; пункты 11–12 индекса decisions (коммиты `1853ba6`, `2be486d`, `a3455f4`) |
| `origin/claude/melody-algorithm-illustration-9brvyf` | `95a2fa7` | 2026-07-08 | Сверено: серийные файлы байт-в-байт совпадают с docs-preparation. Собственный коммит ветки — `and_my_pattern_algorithm.svg`, он уходит в `../06_and_my/` |
| `origin/claude/review-last-day-concept-HWbFa` | `955461a` (серийные файлы — `59fb95e`, 2026-05-12) | 2026-07-18 | Баннеры CONTEXT NOTE / HISTORICAL SNAPSHOT по Decision 06/07 в `audit/02`, `10`, `11`, `12`, `13`, `20`, `21`, `22` и `fixes/01` (в линии SS их не было); `history/SYSTEM_SUICIDE_v3.0_HWbFa.md`. `docs/last_day_tutorial.html` относится только к Last Day и уходит в `../02_last_day/` |
| `origin/claude/add-system-suicide-docs-0in5C` | `54d8669` | 2026-07-07 | Сверено: серийные файлы = `1b5250d`, предок SS. Ничего сверх SS |
| `origin/claude/review-reverberator-data-KKkgX` | `052fe07` | 2026-07-15 | Сверено: серийные файлы = `f407179`, предок SS. `last_night_tutorial.html` уходит в `../01_last_night/` |
| `origin/claude/jolly-gates-KxAP2` | `051f6c7` | 2026-10-19 | Сверено: decisions не меняет, на ветке только `is_my/` (уходит в `../03_is_my/`) |

**Правки при сборке** (все точечные):
- Пути, сломанные переездом в `03_pedals/`: в `decisions/03`, `08`, `11`, `13` `../01_last_night/…` заменено на `../../01_last_night/…`; в `decisions/10` и `11` к путям `cartridges/…`, `PCB_DESIGN_SPEC.md`, `HANDOFF_BRIEF.md` добавлен префикс `../../01_last_night/`; в `decisions/14`, `15`, `audit/30` `../i_show_you_light/` заменено на `../../05_i_show_you_light/`, а `../PCB_DESIGN_SPEC.md` — на `../../01_last_night/PCB_DESIGN_SPEC.md`; в `SYSTEM_SUICIDE.md` поправлены пути к `03_is_my/`, `05_i_show_you_light/` и `cartridges/`; в `docs/SYSTEM_SUICIDE_GUIDE.md` — путь к `03_is_my/`.
- `audit/00_README.md`: абсолютный путь к репозиторию заменён на имя репо.
- `decisions/00_README.md`: пометка о .docx-версии Decision 10 (это Word-файл первой редакции D10, draft v1 от 2026-05-14; актуальна .md v2) и строка про And My-proposal из D15.
- `docs/README.md`: дописан раздел «Статус и происхождение».
- Добавлены новые `README.md` в `decisions/`, `audit/`, `fixes/` и `history/`. Исходные индексы `00_README.md` не тронуты, кроме правок выше.

Пути к соседним папкам (`../01_last_night/`, `../03_is_my/`, `../05_i_show_you_light/`, `../06_and_my/` и т. д.) соответствуют общей раскладке `03_pedals/`. Имена файлов внутри них (например, `ISYL_PROJECT.md`) взяты из исходных веток.
