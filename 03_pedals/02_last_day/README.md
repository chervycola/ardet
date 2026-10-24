# 02 · Last Day — масляный делэй, солнечный сатуратор, язычковый EQ

**Last Day** — модуль 7 из 9 серии SYSTEM SUICIDE и вторая разработка в очереди. В документах это «комбайн раскалённого полудня» и пара по диптиху к [Last Night](../01_last_night/) («холодная ночь»). Устройство самодостаточно: в одной коробке три физические подсистемы и набор character-эффектов.

- **Oil-can delay.** Электростатический делэй по наследию Tel-Ray: масляная плёнка на вращающемся диске переносит поляризацию от электрода записи к двум электродам чтения. Это не BBD и не DSP. Два read-тапа дают стерео, мокрый тракт внутри моно.
- **Solar amp.** Транзисторный каскад на «голодном» питании. Гарантированный пол освещённости даёт встроенный LED, солнечная ячейка на панели модулирует поверх, и рука над окном становится жестом.
- **Resonant EQ.** Индукторные полки (Pultec-style) и физический металлический язычок с подвижным каподастром. Каподастр задаёт частоту резонанса, прижим задаёт Q, самовозбуждение задокументировано как функция.
- **Perform.** Четыре футсвича: KILL (мьют входа), FREEZE (петля деградирует), DRAG (тормоз мотора, питч падает), CRASH (соленоид бьёт по масляной ванне). В Eurorack-версии вместо них кнопки и gate-входы.

| Параметр | Значение |
|---|---|
| Категория | электромеханический делэй + тон-шейпинг, «постапокалипсис-делей с физическим резонатором» |
| Форм-факторы | Eurorack 40HP и big-box педаль ~203×140 мм: одна PCB, два корпуса ([Decision 06](../00_series/decisions/06_last_day_combine_concept.md), [08 consolidated](../00_series/decisions/08_consolidated_base.md)) |
| I/O | TRS stereo + RCA stereo параллельно + 3,5 мм для CV; переключатель уровня instrument / −10 dBV / +4 dBu |
| Картридж | общая с Last Night рамка 110×65×30 мм на магнитах. Два типа: пассивная material-пластина ([Decision 11](../00_series/decisions/11_cartridge_architecture_lock.md)) и активный oil-can диск с электродами (только для Last Day) |
| Фаза | Phase 2 (месяцы 9–27 от старта серии). Окно релиза v1 — месяцы 21–27, примерно через 12 месяцев после Last Night Phase 1 (SPEC, «Phase plan») |
| Версия документов | SPEC / BUILD **v1.0** (2026-05-14, правки 2026-05-23); bench-план 2026-07-02; туториал 2026-07-18 |
| Себестоимость и цена | BOM ~$201 budget / ~$321 premium, retail target $799 / $999 (`LAST_DAY_BUILD.md`, «Полный BOM»). В туториале ориентир розницы v1 — $700–900 |
| Место в цепи серии | после Is My (слот 6), перед And My (слот 8) и Last Night (слот 9) |

## Статус

- **R&D Phase A, этап до стенда.** Bench-план из четырёх ригов готов ([proto/](proto/)), но журналы измерений во всех файлах пустые, а аудиозаписей (`proto/audio/`) нет ни в одной ветке. Веха **M0** (вердикт по физике масляного пикапа и язычка) не пройдена, так что концепт масляного делэя пока не подтверждён.
- **Схемотехника есть только на бумаге.** `LAST_DAY_BUILD.md` описывает 20 блоков с номиналами, полный BOM, зоны PCB, механику картриджа и протокол проверки. KiCad-схемы нет. По bench-плану её рисуют только после M2 (rev A по измеренным номиналам).
- **Панели нет.** Раскладка существует только как ASCII в SPEC и как схема ручек в туториале (лист 07). Файлов `.svg` / `.epanel` для Last Day нет.
- **В документах две редакции FX-палитры**, они не согласованы между собой. Подробности — в разделе «Известные расхождения».
- **.docx отстают от .md.** Канон — `.md`, подробности ниже.

## Начать здесь

| Кто | Порядок чтения |
|---|---|
| Все, первое знакомство (15 мин) | [tutorial/last_day_tutorial.html](tutorial/last_day_tutorial.html) → [LAST_DAY_SPEC.md](LAST_DAY_SPEC.md) |
| R&D, прототипирование | [proto/00_bench_plan.md](proto/00_bench_plan.md) → [Rig #1](proto/01_rig_oil_pickup.md) и [Rig #2](proto/02_rig_tongue.md) (первая волна, параллельно) → [Rig #3](proto/03_rig_motor_pll.md) → [Rig #4](proto/04_rig_solar_amp.md) → аудит [20](../00_series/audit/20_last_day_engineering.md), [21](../00_series/audit/21_last_day_acoustic.md), [22](../00_series/audit/22_last_day_open_questions.md) |
| Схемотехника, PCB | [LAST_DAY_BUILD.md](LAST_DAY_BUILD.md) → [аудит 20: инженерия](../00_series/audit/20_last_day_engineering.md) → [аудит 41: питание, тепло, EMI](../00_series/audit/41_power_thermal_emi.md) → [fixes/03: гайд по разводке](../00_series/fixes/03_pcb_layout_guide.md) |
| Архитектура и решения | [Decision 02](../00_series/decisions/02_last_day_scope.md) → [06](../00_series/decisions/06_last_day_combine_concept.md) → [08 refined](../00_series/decisions/08_refined_fx_palette.md) → [08 consolidated](../00_series/decisions/08_consolidated_base.md) → [15: оптическая шина](../00_series/decisions/15_optical_bus_hybrid.md) → [индекс decisions](../00_series/decisions/README.md) |

## Содержимое папки

В колонке «Версия / правка» указан последний коммит, менявший содержимое файла, и его дата. Перенос в `02_last_day/` (коммит `6d20ae1`, 2026-07-07) не учитывается, если при нём менялись только пути.

| Файл / папка | Что это | Версия / правка |
|---|---|---|
| [LAST_DAY_SPEC.md](LAST_DAY_SPEC.md) | Продуктовая спецификация: обзор и reality check, hot-palette FX, комплектация, signal flow, раскладка панелей обеих SKU, таблица контролов, CV-бей, картриджи, тембр, диптих с Last Night, phase plan, 8 открытых вопросов | v1.0 · `3643474` 2026-05-23 |
| [LAST_DAY_SPEC.docx](LAST_DAY_SPEC.docx) | Word-версия спецификации. **Устарела** | v1.0 · `8fcb1bf` 2026-05-14 |
| [LAST_DAY_BUILD.md](LAST_DAY_BUILD.md) | Build-документация Phase A: 20 функциональных блоков (питание, solar amp, мотор, HV-смещение, емкостное чтение, EQ, язычок, FX, перформ, DC-DC), полный BOM, зоны PCB, механика oil-can картриджа, открытые R&D-вопросы, протокол проверки (~1500 строк) | v1.0 · `d9ca300` 2026-05-23 |
| [LAST_DAY_BUILD.docx](LAST_DAY_BUILD.docx) | Word-версия build-документации. **Устарела** | v1.0 · `c163fea` 2026-05-14 |
| [proto/](proto/) | Bench-план прототипирования: принцип «сначала то, что может убить концепт», 4 рига, критерии go / no-go, вехи M0–M3. Подробнее — в [proto/README.md](proto/README.md) | `d9dac6a` 2026-07-02 |
| [tutorial/](tutorial/) | Иллюстрированный туториал на 11 листах, от макета до финальной педали. Подробнее — в [tutorial/README.md](tutorial/README.md) | `955461a` 2026-07-18 |
| README.md | Этот файл | — |

## Как открыть

- **.md** открывается любым просмотрщиком Markdown (GitHub, VS Code, Obsidian).
- **tutorial/last_day_tutorial.html** открывается в браузере. Файл самодостаточный: CSS и SVG встроены, скриптов и внешних зависимостей нет. Светлая и тёмная тема переключаются по системной настройке.
- **.docx** открываются в Word или LibreOffice, но см. следующий раздел.
- Собирать в этой папке нечего. Стенды собираются по методикам из [proto/](proto/).

### Производные .docx

`.docx` сгенерированы из `.md` через pandoc в день создания документов (2026-05-14). После этого `.md` правились, `.docx` — нет:

| .docx | Чего в нём нет |
|---|---|
| `LAST_DAY_SPEC.docx` | Правки от 2026-05-23 (`3643474`, Decision 11): в разделе «Чем отличается» нет абзаца о двух типах картриджей, пассивной material-пластине и активном oil-can диске |
| `LAST_DAY_BUILD.docx` | Правки от 2026-05-23 (`d9ca300`): изолированный DC-DC указан с **ошибочным P/N `TMR 3-1212WI`** (single 12 V). Правильный — `TMR 3-1222WI` (dual ±12 V), как в `.md`. Кроме того, для DC-DC на 250 мА, который нужен Last Day из-за мотора и соленоида, `.docx` называет `Recom RKD-1212-D` как готовый P/N. В `.md` он заменён на `RxxD-1212 (verify dual ±12V P/N)`, потому что веб-проверка его не подтвердила. По `.docx` закупаться нельзя |

Перед отправкой наружу `.docx` нужно пересобрать, например так: `pandoc LAST_DAY_SPEC.md -o LAST_DAY_SPEC.docx`. При сборке монорепо их сознательно не трогали.

## Известные расхождения

Документы писались в разное время по разным редакциям решений. В исходниках эти места не правились, при чтении их нужно учитывать.

**1. Две FX-палитры.** SPEC и BUILD v1.0 (2026-05-14) построены на [08 consolidated](../00_series/decisions/08_consolidated_base.md). Bench-план и туториал (2026-07) — на Decision 06 и [08 refined](../00_series/decisions/08_refined_fx_palette.md).

| | SPEC / BUILD v1.0 | proto/ и туториал |
|---|---|---|
| Named FX | 7 ручек: HAZE, MIRAGE, BLEACH, TAR, CICADA, HEATWAVE, OLD VINYL (PT2399) | 3 голоса: TAR, CICADA, EMBER (тлеющий винил) |
| HAZE | отдельный эффект | ручка delay-секции (wow мотора) |
| BLEACH / MIRAGE / HEATWAVE | есть (блоки 11, 12, 15 в BUILD) | BLEACH → режим BRIGHT у solar amp, MIRAGE поглощён EMBER, HEATWAVE выведен из v1 |
| Прочее | — | ручка HEAT (нагрев масла); MELT/BBD-смазыватель «обсуждается, не канон» |

Индекс решений ([00_README](../00_series/decisions/00_README.md)) считает 08 refined отменённым в пользу 08 consolidated. В то же время context note в начале Decision 06 называет refined-палитру текущим каноном, а прежний README этой папки описывал палитру как TAR / CICADA / EMBER. Какая палитра действует, автор пока не решил.

**2. Мотор и время задержки.**
- SPEC: 200–2000 RPM, повтор 60–800 мс, щёточный DC в budget-версии, BLDC в premium. Внутри самой SPEC есть несостыковка: в таблице положений слайдера MOTOR SPEED нижнее положение SLOW — 60 RPM, а не 200.
- BUILD, блок 4: Mabuchi RS-385 с редуктором 10:1, 200–1200 RPM, L-тап 75–800 мс, R-тап 150–1500 мс.
- Rig #3 и туториал: BLDC gimbal 2208 + SimpleFOC + энкодер AS5600, 0,5–30 об/с. В туториале READ A 8–250 мс, READ B 17–500 мс, хвост до ~2 с за счёт того, что масло держит поляризацию несколько оборотов.

**3. Язычок.** SPEC: 200 Гц – 2 кГц, Q 1–8. BUILD (Open R&D questions, п. 5): Q 1–15. Туториал: «4 октавы» на ручке Mid Freq при критерии go от 3 октав.

**4. Панель.** В SPEC стоят MOTOR SPEED slider 1P5T, Time / FB / Mix и 7 FX-ручек. В туториале панель разбита на секции Solar Amp (Sun / Solar / Drive / Bright), Resonant EQ (Low / Mid Freq / Mid Gain / Clamp / High), Oil Can Delay (Time / Feedback / Tap Spread / Haze / Heat) и Character (Tar / Cicada / Ember).

**5. Бриф серии.** В действующем [SYSTEM_SUICIDE.md](../00_series/SYSTEM_SUICIDE.md) раздел §7 Last Day написан ещё до Decision 06. Редакция §7 по Decision 06 / 08 refined сохранилась только в архивной версии брифа: [../00_series/history/SYSTEM_SUICIDE_v3.0_HWbFa.md](../00_series/history/SYSTEM_SUICIDE_v3.0_HWbFa.md).

**6. Соседи по цепи в туториале.** Лист 09 описывает And My (слот 8) как кристальный секвенсор LITHOSEQ. В decisions это не зафиксировано: по [Decision 13](../00_series/decisions/13_and_my_tbd.md) слот And My остаётся TBD. Связь разобрана в [../06_and_my/](../06_and_my/) и [../04_sequencer_lithoseq/](../04_sequencer_lithoseq/).

**7. Отсутствующий файл.** В комментарии `../01_last_night/signal_flow_last_night.svg` написано «Diptych pair: see signal_flow_last_day.svg». Файла `signal_flow_last_day.svg` нет ни в одной ветке репозитория.

**8. Аудит 20–22** написан до пересмотра 2026-05 и помечен как HISTORICAL SNAPSHOT. Физика подсистем в нём актуальна, разделы про FX (HAZE / WIRE / DUST) устарели.

## Связи с другими папками

- **Канон серии:** [../00_series/SYSTEM_SUICIDE.md](../00_series/SYSTEM_SUICIDE.md) §7.
- **Decisions** (все лежат в `../00_series/decisions/`):
  - [02 — scope Last Day](../00_series/decisions/02_last_day_scope.md): D1 и D5 заменены 08 consolidated, D2 (емкостный пикап), D4 и D6 действуют. D3 («solar optional») баннер называет активным, но по D06 LED baseline обязателен, а солнце только модулирует;
  - [06 — «комбайн раскалённого полудня»](../00_series/decisions/06_last_day_combine_concept.md);
  - [08 refined](../00_series/decisions/08_refined_fx_palette.md) и [08 consolidated](../00_series/decisions/08_consolidated_base.md) — две редакции палитры, см. выше;
  - [11 — пассивный картридж](../00_series/decisions/11_cartridge_architecture_lock.md);
  - [15 — оптическая шина](../00_series/decisions/15_optical_bus_hybrid.md): точка подключения Last Day — фотоэлемент solar amp (статус proposal).
- **Аудит (исторический):** [20 — инженерия](../00_series/audit/20_last_day_engineering.md), [21 — акустика](../00_series/audit/21_last_day_acoustic.md), [22 — открытые вопросы](../00_series/audit/22_last_day_open_questions.md); сквозные риски — [41 — питание, тепло, EMI](../00_series/audit/41_power_thermal_emi.md), [50 — противоречия и TODO](../00_series/audit/50_contradictions_and_todos.md).
- **Last Night** — пара по диптиху: общий стандарт картриджа, петля FB SEND → Last Night → FB RETURN, каскад CRASH → TOLL. [../01_last_night/](../01_last_night/).
- **Is My** стоит в цепи перед Last Day. По туториалу (лист 09) его пульт может вести TIME / FEEDBACK: [../03_is_my/](../03_is_my/).
- **Маркетинг-сайт.** Там Last Day показан как Phase 2, 40HP, со скрытыми деталями: [../site/](../site/).

## Происхождение

| Источник | Коммит | Дата | Что взято |
|---|---|---|---|
| `origin/SS:02_last_day/` | `6d20ae1` | 2026-07-07 | SPEC и BUILD (`.md` + `.docx`), `proto/` (5 файлов). Основа сборки. До `6d20ae1` файлы лежали в плоской `synth/`, этим коммитом переехали в `02_last_day/`, и в `LAST_DAY_SPEC.md` ссылки на decisions переписаны на `../00_series/…`. `proto/` попал в `synth/` раньше, сводным коммитом `1b5250d` (импорт из HWbFa) |
| `origin/claude/review-last-day-concept-HWbFa:synth/docs/last_day_tutorial.html` | `955461a` | 2026-07-18 | `tutorial/last_day_tutorial.html`. Есть только в этой ветке |

**Проверено и не взято, потому что копии идентичны или старше:**

- `synth/LAST_DAY_*` и `synth/proto/` в `origin/claude/add-system-suicide-docs-0in5C` (`54d8669`), `origin/claude/docs-preparation-xuki5v` (`a3455f4`), `origin/claude/melody-algorithm-illustration-9brvyf` (`95a2fa7`) и `origin/claude/review-reverberator-data-KKkgX` (`052fe07`). `LAST_DAY_BUILD.md`, оба `.docx` и все файлы `proto/` побайтно совпадают с `origin/SS`. `LAST_DAY_SPEC.md` отличается только двумя путями к decisions, которые в SS уже исправлены. В трёх последних ветках `proto/` нет вообще.
- `synth/proto/` в `origin/claude/review-last-day-concept-HWbFa` (`d9dac6a`, 2026-07-02) — исходный коммит bench-плана, побайтно равен `origin/SS`. Файлов `LAST_DAY_SPEC` / `LAST_DAY_BUILD` в этой ветке нет. Её линия `synth/` шла параллельно (Decision 06 и 08 refined, коммиты `222e217`–`59fb95e`, 2026-05-12), а SPEC и BUILD v1.0 появились 2026-05-14 в другой линии и сюда не попали.
- Остальное из `synth/docs/` этой ветки (серийный гид `SYSTEM_SUICIDE_GUIDE`, `build.sh`, `style.css`) — общесерийное, оно лежит в [../00_series/docs/](../00_series/docs/).

**Правки при сборке монорепо** — точечные, только указатели на файлы:

- `LAST_DAY_SPEC.md`, раздел «Документация»: `` `SYSTEM_SUICIDE.md` §10 `` → `` `../00_series/SYSTEM_SUICIDE.md` §7 ``. Путь пересчитан от новой папки. Номер раздела исправлен, потому что Last Day во всех редакциях брифа — §7, а §10 там нет.
- `LAST_DAY_BUILD.md`, строка 8: `` `LAST_NIGHT_BUILD.md` `` → `` `../01_last_night/LAST_NIGHT_BUILD.md` ``.
- `README.md` написан заново. Всё содержание прежнего README из `origin/SS` (описание, состав файлов, принцип прототипирования, связи) перенесено сюда.
- `proto/README.md` и `tutorial/README.md` добавлены как оглавления подпапок.

Остальные файлы перенесены байт-в-байт.
