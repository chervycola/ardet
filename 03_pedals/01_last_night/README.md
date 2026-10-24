# 01 · Last Night — резонатор на сменных пластинах

**Last Night** — флагманский модуль серии SYSTEM SUICIDE (модуль 9 из 9, «комбайн холодной ночи»). Звук проходит через настоящую физическую пластину: эксайтер раскачивает сменную пластину из дерева, камня, металла, стекла, кости или нефрита, два пьезо снимают её колебания. Вокруг этого акустического ядра — аналоговый функциональный генератор, фазер на OTA, шумовой генератор с «гейгером», соленоид, который бьёт по пластине, и четыре футсвича. В документах устройство называется *material resonator*: на 100-мм пластине получается разреженный модальный резонатор, а не плотный «холл», и честное название задаёт правильные ожидания.

| Параметр | Значение |
|---|---|
| Категория | material resonator (ревербератор / резонатор на сменных пластинах) |
| Форм-факторы | Eurorack 3U × 40HP и big-box педаль ~203×140 мм — одна схема, одна основная PCB |
| Картридж | пассивная пластина в рамке 110×65×30 мм на 4 магнитах, все трансдьюсеры стоят в модуле (Decision 11) |
| Цена | headline **€3640** (зафиксирована); согласование с тирами Decision 10 не завершено. Сайт подаёт её как «все картриджи включены», но в каноне это одна из моделей (bundle B в [CARTRIDGE_SOURCING.md](CARTRIDGE_SOURCING.md)), решение не принято |
| Фаза | Phase 1 ship (месяцы 1–9 от старта) — первая разработка в очереди серии |
| Версия канона | **v6.5** = Decision 09 hybrid + аудит v6.3 + доработки v6.4 + Decision 11 + переписанный Block 14 |
| Пара по диптиху | [Last Day](../02_last_day/) («раскалённый полдень»), общий формат картриджа |

## Статус

- **Проектирование зафиксировано на v6.5** (design lock): спецификация, build-документация, PCB-спека, закупки и калибровка доведены до одной версии.
- **Stage 0 bench gate не пройден.** Результатов стендовых испытаний в репозитории нет. Три физических риска остаются открытыми: R1 — контактная связь эксайтер→пластина, R2 — различимость материалов на слух, R13 — удар TOLL может сбивать пьезо с посадки. До прохождения Stage 0/0B на PCB, оснастку и закупки не тратимся ([RISK_ASSESSMENT.md](RISK_ASSESSMENT.md) §5).
- **PCB:** есть спека, готовая к переносу в KiCad (pre-KiCad), а также зонная схема в BUILD. Разводки ещё нет.
- **Картриджи:** готовы техкарты обработки только двух материалов — кость и нефрит. Карты для дерева, камня, металла, стекла и сборки рамки помечены TODO ([cartridges/](cartridges/)).
- **.docx отстают от .md** — см. раздел «Производные .docx» ниже.
- Цифры RT60 и цены пока расчётные, на стенде не подтверждены.

## Начать здесь

| Кто | Порядок чтения |
|---|---|
| Все, первое знакомство (15 мин) | [last_night_tutorial.html](last_night_tutorial.html) → [LAST_NIGHT_SPEC.md](LAST_NIGHT_SPEC.md) |
| R&D, прототипирование | [HANDOFF_BRIEF.md](HANDOFF_BRIEF.md) → [RISK_ASSESSMENT.md](RISK_ASSESSMENT.md) (**первым по существу**) → [stage0_prototype.html](stage0_prototype.html) → [signal_flow_last_night.svg](signal_flow_last_night.svg) → [LAST_NIGHT_BUILD.md](LAST_NIGHT_BUILD.md) → [PCB_DESIGN_SPEC.md](PCB_DESIGN_SPEC.md) → [аудит 13: сверка со схемой](../00_series/audit/13_schematic_cross_reference.md) |
| Производство, закупки | [HANDOFF_BRIEF.md](HANDOFF_BRIEF.md) → [BOM_SOURCING.md](BOM_SOURCING.md) → [PRICE_TABLE.md](PRICE_TABLE.md) → [CARTRIDGE_SOURCING.md](CARTRIDGE_SOURCING.md) → [calibration_procedure.md](calibration_procedure.md) → [Decision 10](../00_series/decisions/10_premium_components_sourcing.md), [Decision 04](../00_series/decisions/04_production_strategy.md) |
| Акустика, картриджи | [acoustic_modeling.md](acoustic_modeling.md) → [cartridges/](cartridges/) → [strike_seating_problem.svg](strike_seating_problem.svg) → [аудит 11](../00_series/audit/11_last_night_acoustic.md) |
| Панель, дизайн | [last_night_pedal_panel.svg](last_night_pedal_panel.svg), [last_night_40hp.epanel](last_night_40hp.epanel), [LAST_NIGHT_SPEC.md](LAST_NIGHT_SPEC.md) §«Раскладка панели» (pedal и Eurorack) |
| Архитектура серии | [Decision 08 consolidated](../00_series/decisions/08_consolidated_base.md) → [Decision 09](../00_series/decisions/09_hybrid_lock.md) → [Decision 11](../00_series/decisions/11_cartridge_architecture_lock.md) → [индекс decisions](../00_series/decisions/00_README.md) |

## Содержимое папки

Дата в третьей колонке — последнее изменение содержимого в истории git: короткий хеш и дата коммита. Перенос в `01_last_night/` (коммит `6d20ae1`, 2026-07-07) не учитывается, если при нём менялись только ссылки.

### Продукт и инженерия

| Файл | Что это | Версия / правка |
|---|---|---|
| [LAST_NIGHT_SPEC.md](LAST_NIGHT_SPEC.md) | Продуктовая спецификация: концепция, signal flow, контролы, раскладка панелей обеих SKU, каталог материалов, тембры, сценарии, ТТХ, совместимость, уход | v6.5 · `e0c6385` 2026-07-07 |
| [LAST_NIGHT_SPEC.docx](LAST_NIGHT_SPEC.docx) | Word-версия спецификации. **Устарела** | состояние v6.1 (в шапке v5.0) · `36cebfb` 2026-05-19 |
| [LAST_NIGHT_BUILD.md](LAST_NIGHT_BUILD.md) | Build- и производственная документация: 25 функциональных блоков с номиналами, полный BOM, зоны PCB, механика картриджа, сборка, тестирование, troubleshooting (~3800 строк) | v6.5 · `f407179` 2026-07-02 |
| [LAST_NIGHT_BUILD.docx](LAST_NIGHT_BUILD.docx) | Word-версия build-документации. **Устарела** | состояние v6.1 (в шапке v5.0 / v2.2) · `36cebfb` 2026-05-19 |
| [HANDOFF_BRIEF.md](HANDOFF_BRIEF.md) | Бриф для передачи в R&D и производство: неприкосновенные приоритеты (Tier 1–3), манифест документов по ролям, границы решений, чекпойнты недель 1–12 | v6.5 · `7281205` 2026-07-02 |
| [RISK_ASSESSMENT.md](RISK_ASSESSMENT.md) | Реестр рисков R1–R13 с fallback-лестницей для R1 и стендовый протокол Stage 0 → 4. Gate перед любыми затратами | v6.5 · `a26e8f1` 2026-07-02 |
| [PCB_DESIGN_SPEC.md](PCB_DESIGN_SPEC.md) | Спека PCB для KiCad: 6 плат (main + адаптеры + сателлиты + dock), XY-координаты групп, 4-слойный стек, топология земель, критические трассы, чек-лист перед заказом | v1.0 · `7281205` 2026-07-02 |
| [acoustic_modeling.md](acoustic_modeling.md) | Расчёт модальной плотности и размеров пластин по материалам, два акустических семейства, проблема мрамора (→ сланец), multi-plate stack, contact coupling, покрытия, политика точки удара, критерии приёмки | v1.0 (канон v6.5) · `f407179` 2026-07-02 |
| [calibration_procedure.md](calibration_procedure.md) | Калибровка подстроечников на сборке (12 шагов) и QC sign-off | v1.1 · `7281205` 2026-07-02 |
| [stage0_prototype.html](stage0_prototype.html) | Сборочный лист стендового прототипа Stage 0: только акустическое ядро (усилитель → пластина → пьезо-преамп), BOM ~$60–80, contact rig, протокол из 6 тестов с критериями pass/fail. Удобно печатать | `f407179` 2026-07-02 |
| [last_night_tutorial.html](last_night_tutorial.html) | Иллюстрированный туториал в 10 листах: концепция, история ревизий, тракт, палитра материалов с RT60, физика удара соленоида, управление, патчи и CV, гейты проверки, roadmap | канон v6.5 · `052fe07` 2026-07-15 |

### Закупки

| Файл | Что это | Версия / правка |
|---|---|---|
| [BOM_SOURCING.md](BOM_SOURCING.md) | Руководство по закупке малой партии (20 шт.): P/N, дистрибьюторы, количество с запасом, lead time, реестр рисков снабжения. Приоритет — SL-4P5T и LSK489A | v6.5 · `7281205` 2026-07-02 |
| [CARTRIDGE_SOURCING.md](CARTRIDGE_SOURCING.md) | Закупка двух независимых групп: трансдьюсеры (по числу модулей) и пассивные пластины (по числу картриджей); поставщики материалов, рамки, план партии | v6.5 · `f407179` 2026-07-02 |
| [PRICE_TABLE.md](PRICE_TABLE.md) | Сводная таблица цен по компонентам и магазинам в двух колонках, Budget и Audiophile. Итог по модулю без картриджей — ~$176 / ~$361. Есть раздел о том, что можно и что нельзя брать на AliExpress | v6.5 · `7281205` 2026-07-02 |

### Картриджи

| Папка | Что это |
|---|---|
| [cartridges/](cartridges/) | Каталог картриджей ([00_README.md](cartridges/00_README.md)) и техкарты обработки кости и нефрита (EN/RU, часть с .docx). Подробнее — в [cartridges/README.md](cartridges/README.md) |

### Панели и схемы

| Файл | Что это | Версия / правка |
|---|---|---|
| [signal_flow_last_night.svg](signal_flow_last_night.svg) | Структурная схема A3: 10 функциональных зон A–J, аудиотракт, пути модуляции, жесты исполнения. Обязательна к прочтению перед работой со схемой | v6.5 · `25c32ba` 2026-05-28 |
| [last_night_pedal_panel.svg](last_night_pedal_panel.svg) | Панель педальной SKU 203×140 мм (Inkscape SVG, сетка 5 мм) | v6.5 · `74fd155` 2026-05-26 |
| [last_night_40hp.epanel](last_night_40hp.epanel) | Проект панели Eurorack 40HP для веб-редактора EURORACK-PANEL-DESIGNER (62 компонента, черновая раскладка) | `3005a06` 2026-05-26 |
| [last_night_40hp.json](last_night_40hp.json) | Байт-в-байт копия `.epanel` с расширением `.json` — на случай, если диалог выбора файла фильтрует по расширению | `39734aa` 2026-05-26 |
| [strike_seating_problem.svg](strike_seating_problem.svg) | Схема в разрезе: удар соленоида, посадка пластины, податливость рамки. Почему TOLL может сам вызвать дребезг R1 (риск R13) | `a54b929` 2026-06-04 |
| README.md | Этот файл | — |

## Как открыть

- **.md** — любой просмотрщик Markdown (GitHub, VS Code, Obsidian).
- **.html** (`stage0_prototype.html`, `last_night_tutorial.html`) — открыть в браузере. Файлы самодостаточные: стили и SVG встроены, сеть не нужна, скриптов нет.
- **.svg** — браузер или Inkscape. `last_night_pedal_panel.svg` редактируется в Inkscape.
- **.epanel / .json** — веб-приложение EURORACK-PANEL-DESIGNER (`vaniastarginsky-commits.github.io/EURORACK-PANEL-DESIGNER`): *Import Project / Open* → выбрать `.epanel` (или `.json`). Формат — projectVersion 4, 1HP = 5,08 мм. Координаты черновые и правятся перетаскиванием. Слайдеры и слот картриджа сделаны заглушками `customrect`, потому что фейдера в библиотеке приложения нет. Раскладка только Eurorack: педальная панель — это SVG выше.
- **.docx** — Word/LibreOffice, но см. следующий раздел.

### Производные .docx

`.docx` генерировались из `.md` через pandoc (с коммита `ff256ff`, 2026-05-12). Последний раз SPEC и BUILD перегенерированы в `36cebfb` (v6.1, 2026-05-19), техкарты — в мае. После этого `.md` правились, а `.docx` нет. **Канон — `.md`**, `.docx` показывают состояние на май 2026:

| .docx | Содержимое .docx | Актуальный .md |
|---|---|---|
| `LAST_NIGHT_SPEC.docx` | v6.1 (Bank Mode, DIRTY, FREEZE_CV), в шапке осталось «v5.0»; без Decision 11; 2026-05-19 | v6.5, 2026-07-07 |
| `LAST_NIGHT_BUILD.docx` | v6.1, в шапке «v5.0 / v2.2»; без Decision 11 и переписанного Block 14; 2026-05-19 | v6.5, 2026-07-02 |
| `cartridges/05_bone_processing_ru.docx` | 2026-05-12: сырьё — лопатка (scapula), 100×40×4 мм | 2026-07-02: баннер о смене сырья на кортикальный слой бедренной кости, 100×35×2,5 мм (основной текст ещё про лопатку) |
| `cartridges/07_nephrite_processing.docx` | 2026-05-12: пластина 100×40×4 мм | 2026-05-28: 100×45×2,0 мм |
| `cartridges/07_nephrite_processing_ru.docx` | 2026-05-12: пластина 100×40×4 мм | 2026-05-28: 100×45×2,0 мм |

Перед отправкой наружу `.docx` нужно пересобрать, например так: `pandoc LAST_NIGHT_SPEC.md -o LAST_NIGHT_SPEC.docx`. При сборке монорепо их сознательно не трогали.

## Известные расхождения внутри документов

Эти места в исходниках не правились — их нужно учитывать при чтении:

- **Себестоимость.** В конце `LAST_NIGHT_BUILD.md` («Conclusion») осталась оценка эпохи v2.2: BOM $83–112 и retail $450–550. Актуальна оценка из [PRICE_TABLE.md](PRICE_TABLE.md): ~$176 budget / ~$361 audiophile за модуль без картриджей.
- **Цена.** В `LAST_NIGHT_SPEC.md` headline €3640 стоит рядом с прежними тирами Decision 10 ($499 / $649 / $2499 LE). Согласование помечено как TBD.
- **Мрамор.** `HANDOFF_BRIEF.md` §6.5 перечисляет мрамор среди 6 материалов прототипа. По `acoustic_modeling.md` §5 и каталогу картриджей основным камнем стал сланец (slate), а мрамор оставлен как перкуссионная новинка. В таблице premium-картриджей `LAST_NIGHT_SPEC.md` тоже осталось «Standard line (oak, marble, brass...)».
- **Набор картриджей Phase 1 не согласован.** `LAST_NIGHT_SPEC.md` §4: spring steel, brass, aluminum, oak, slate, glass. [`../00_series/SYSTEM_SUICIDE.md`](../00_series/SYSTEM_SUICIDE.md) §9: oak raw, oak linseed, maple shellac, slate, brass, spring steel. `HANDOFF_BRIEF.md` §6.5 (прототип): oak, spring steel, marble, glass, bone, nephrite. Какой набор канонический, в документах не решено.
- **Кость: лопатка или бедро.** Сырьё для кости сменили на кортикальный слой бедренной кости (HANDOFF, SPEC §4 «Bone & exotic», BUILD, баннеры в техкартах). Но в Phase 2-таблице SPEC строка называется «BONE (lopatka)», а основной текст `cartridges/05_bone_processing*.md` всё ещё описывает лопатку; баннер в начале просит читать «лопатку» как «диафиз» до переписывания.
- **Отсутствующие материалы.** `HANDOFF_BRIEF.md` ссылается на «Mockup PNG из conversation history», а комментарий в `signal_flow_last_night.svg` — на `signal_flow_last_day.svg`. Ни того, ни другого нет ни в одной ветке репозитория.

## Связи с другими папками

- **Канон серии:** [../00_series/SYSTEM_SUICIDE.md](../00_series/SYSTEM_SUICIDE.md).
- **Decisions** (все лежат в `../00_series/decisions/`):
  - [03 — стандарт картриджа](../00_series/decisions/03_cartridge_standards.md);
  - [07 — концепт «комбайна холодной ночи»](../00_series/decisions/07_last_night_combine_concept.md);
  - [08 consolidated](../00_series/decisions/08_consolidated_base.md);
  - [09 — hybrid lock](../00_series/decisions/09_hybrid_lock.md);
  - [10 — премиум-компоненты](../00_series/decisions/10_premium_components_sourcing.md);
  - [11 — пассивный картридж](../00_series/decisions/11_cartridge_architecture_lock.md);
  - [13 — And My снят со слота кроссфейдера](../00_series/decisions/13_and_my_tbd.md). На него ссылается раздел «Совместимость» в SPEC;
  - [08 refined FX palette](../00_series/decisions/08_refined_fx_palette.md) — промежуточный пересмотр холодной палитры D07, отменён 08 consolidated (для истории);
  - [12 — Is My как MOSFET-шейпер](../00_series/decisions/12_is_my_shaper_respec.md) — CV-выходы пульта Is My патчатся, в том числе, в decay Last Night;
  - [15 — оптическая шина серии](../00_series/decisions/15_optical_bus_hybrid.md) — Last Night в таблице модулей шины нет; `PCB_DESIGN_SPEC.md` упомянут как место, куда может войти retina-плата (в самой PCB-спеке её пока нет). Там же And My предложен как материальный секвенсор (proposal), см. [../06_and_my/](../06_and_my/).
- **Аудит ядра v2.x (исторический):**
  - [10 — инженерия](../00_series/audit/10_last_night_engineering.md);
  - [11 — акустика](../00_series/audit/11_last_night_acoustic.md);
  - [12 — открытые вопросы](../00_series/audit/12_last_night_open_questions.md);
  - [13 — сверка со схемой](../00_series/audit/13_schematic_cross_reference.md);
  - [исходная логическая схема v2.0](../00_series/audit/wood_reverb_logical_schematic.html);
  - fixes: [01 — список правок Last Night](../00_series/fixes/01_last_night_fix_list.md), [04 — протокол тестирования](../00_series/fixes/04_testing_protocol.md).
- **Last Day** — пара по диптиху с совместимым картриджем: [../02_last_day/](../02_last_day/).
- **Is My** — по актуальной SPEC стоит в цепи перед Last Night как MOSFET-шейпер, а CV-выходы пульта модулируют decay/tone/freeze: [../03_is_my/](../03_is_my/).
- **Маркетинг-сайт** — Last Night и цена €3640: [../site/](../site/). Данные сайта о картриджах (мрамор, размеры 100×40×4, лопатка) и сроки поставки устарели или не подтверждены — сверка в [../site/PROVENANCE.md](../site/PROVENANCE.md).

## Происхождение

| Источник | Коммит | Дата | Что взято |
|---|---|---|---|
| `origin/SS:01_last_night/` | `6d20ae1` | 2026-07-07 | Вся папка (27 файлов). Это бывшая `synth/` из сводного коммита `1b5250d`, в которой при переносе ссылки на серийные документы переписаны на `../00_series/…`. Основа сборки |
| `origin/claude/review-reverberator-data-KKkgX:synth/last_night_tutorial.html` | `052fe07` | 2026-07-15 | `last_night_tutorial.html` — есть только в этой ветке |

**Проверено и не взято, потому что копии идентичны или старше:**

- `synth/` в `1b5250d`, `origin/claude/add-system-suicide-docs-0in5C` (`54d8669`), `origin/claude/docs-preparation-xuki5v` (`a3455f4`), `origin/claude/melody-algorithm-illustration-9brvyf` (`95a2fa7`). Файлы Last Night побайтно совпадают с `origin/SS`, кроме пяти документов (BOM_SOURCING, CARTRIDGE_SOURCING, HANDOFF_BRIEF, LAST_NIGHT_BUILD.md, acoustic_modeling), где в SS только переписаны ссылки.
- В `origin/claude/review-reverberator-data-KKkgX` все остальные файлы Last Night — версии от 2026-07-02 (`f407179`). Её `LAST_NIGHT_SPEC.md` старше версии в SS: в SS (`e0c6385`) обновлён раздел «Совместимость» (Is My в цепи, And My снят по Decision 13).

**Правки при сборке монорепо** — точечные, только относительные ссылки:

- `LAST_NIGHT_BUILD.md`: `../00_series/audit/fixes/…` → `../00_series/fixes/…`, 2 места (01_last_night_fix_list, 04_testing_protocol); голое имя `04_testing_protocol.md` в «Phase 2 — Per-block functional test» → `../00_series/fixes/04_testing_protocol.md`.
- `HANDOFF_BRIEF.md` §4: `LAST_DAY_SPEC.md` → `../02_last_day/LAST_DAY_SPEC.md`, `SYSTEM_SUICIDE.md` → `../00_series/SYSTEM_SUICIDE.md`.
- `cartridges/00_README.md`: ссылки на `acoustic_modeling.md`, `LAST_NIGHT_BUILD.md` и `decisions/11_…` пересчитаны от папки `cartridges/`.
- `README.md` написан заново по мотивам README из `origin/SS`. Его содержание (точка входа, состав файлов, связи) перенесено сюда полностью.
- `cartridges/README.md` добавлен как оглавление папки.

Остальные файлы перенесены байт-в-байт.
