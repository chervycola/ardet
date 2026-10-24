# LITHOSEQ — генеративный секвенсор (сканирование физического образца)

LITHOSEQ (рабочее кодовое имя) — генеративный секвенсор для Eurorack,
который читает музыку из физического образца. В слот вставляется сменная
пластина с образцом — кристаллом, выращенным на стекле (соль, медный
купорос), тонким срезом, пористым камнем. Камера снимает окно 25×25 мм,
кадр сводится к калиброванной карте 32×32. Из карты детерминированно
считаются метрики (локальная плотность D, резкость S, поворотная
симметрия R, градиент вдоль траектории G), по карте
ходит виртуальный плейхед (растр, бустрофедон, спирали, лучи), а слой
маппинга превращает это в ноты, gate и модуляцию: USB-MIDI на этапе стенда,
затем CV 1V/oct + gate + 2 aux.

Главный тезис проекта: геометрия образца слышимо и повторяемо определяет
паттерн. В тракте нет RNG и автоусиления: та же пластина при тех же
настройках всегда даёт тот же поток событий. Пластина работает как
пластинка — её вставляют, вынимают, подписывают и коллекционируют.

## Связь с And My и серией SYSTEM SUICIDE

LITHOSEQ начинался как самостоятельный проект («арт-серия
DIY-инструментов», 00-ROADMAP). В снапшоте `origin/SS` (2026-07-07) он
описан как соседний проект, не входящий в 9-модульную серию. Позже его
стали читать как кандидата на слот 8 серии — **And My**:

- [Decision 13](../00_series/decisions/13_and_my_tbd.md) вернул And My в TBD
  и назвал кристаллы одним из направлений поиска материала.
- [Decision 15](../00_series/decisions/15_optical_bus_hybrid.md) (оптическая
  шина) в строке слота 8 записывает And My как «материальный секвенсор»:
  матрица 32×32, сменные кристаллические и пористые пластины. Статус
  строки — proposal.
- Иллюстрация алгоритма And My
  ([`../06_and_my/and_my_pattern_algorithm.svg`](../06_and_my/and_my_pattern_algorithm.svg),
  2026-07-08) — эскиз той же идеи на уровне серии.
- Туториал Last Day
  ([`../02_last_day/tutorial/last_day_tutorial.html`](../02_last_day/tutorial/last_day_tutorial.html),
  2026-07-18) прямо называет And My «кристальным секвенсором (LITHOSEQ)»
  в слоте 8 и считает TBD из Decision 13 закрытым.
- Маркетинг-сайт серии ([`../site/`](../site/), снапшот `origin/System-suicide`
  `bfbfcc7`, 2026-07-26 — позже туториала) по-прежнему показывает слот 08
  как `And My — Crossfader · TBD` (`src/data.ts`), страница модуля скрыта.

Отдельного серийного decision-документа «And My = LITHOSEQ» ни в одной
ветке нет. Сами документы LITHOSEQ (`docs/`) про And My и SYSTEM SUICIDE
не упоминают. Есть и расхождения: эскиз And My предполагает два канала
чтения (оптический + импедансный) и пошаговый скан столбцов, а LITHOSEQ v1
— один оптический канал (импедансный/ёмкостный отложен в фазу 5, D2/D3) и
виртуальный плейхед с метриками. Поэтому материалы разложены по двум
папкам: здесь проект и код секвенсора, в [`../06_and_my/`](../06_and_my/) —
серийные материалы слота And My.

## Статус (на 2026-07-18)

| Фаза (00-ROADMAP) | Состояние |
|---|---|
| 0 — документы | готово: пакет 00–08, DESIGN-OPINION, DECISIONS D1–D11 |
| 1 — стенд захвата | в работе. Софт готов: ядро (пайплайн, метрики, плейхед, маппинг) с тестами, ПК-симулятор, бинарный протокол, просмотрщик. Есть скелет прошивки STM32 и модель рамки пластины. Железо не закуплено, CubeIDE-проект не собран, бринг-ап T1.1–T1.5 не пройден, регистры OV7670 не сверены |
| 2 — метрики и музыка | частично досрочно: MIDI-слой, экспорт Standard MIDI File, решение D11 по данным симуляции. Аудиция на реальных образцах — после фазы 1 |
| 3 — CV-выходы | не начата (спека 06-CV-IO готова) |
| 4 — модуль Eurorack | не начата, нужен отдельный пакет документов |
| 5 — второй канал (ёмкостный / пьезо) | не начата |

Решения D4 (платформа STM32) и D5 (стенд, модуль в фазе 4) в журнале пока
помечены как предположения.

## Содержимое

| Путь | Что это |
|---|---|
| [docs/](docs/README.md) | Проектная документация: оценка концепции, 00–08, журнал решений, иллюстрированный туториал |
| [docs/TUTORIAL.html](docs/TUTORIAL.html) | Полевое руководство «от настольного стенда к модулю Eurorack», открывается в браузере |
| [lithoseq/](lithoseq/README.md) | Код: переносимое ядро на C, HAL, ПК-симулятор, тесты, инструменты, прошивка стенда, механика |
| [lithoseq/core/](lithoseq/core/README.md) | Ядро: чистый C11, целочисленная арифметика, без HAL, RNG и времени — пайплайн кадра, метрики, плейхед, маппинг |
| [lithoseq/hal/](lithoseq/hal/README.md) | Интерфейс железа (`hal.h`); реализация для STM32 — в `fw-stm32/hal_impl.c` |
| [lithoseq/app/](lithoseq/app/README.md) | ПК-симулятор (`sim_main.c`), синтетические паттерны, бинарный протокол, MIDI-слой и экспорт SMF |
| [lithoseq/tests/](lithoseq/tests/README.md) | Тесты ядра (метрология метрик T-M1, детерминизм, траектории) и MIDI-слоя |
| [lithoseq/tools/](lithoseq/tools/README.md) | `viewer.py` — просмотр лога или живого стенда, `genpatterns.py` — PGM-паттерны 320×240 |
| [lithoseq/fw-stm32/](lithoseq/fw-stm32/README.md) | Скелет прошивки стенда (Nucleo-H743ZI2 + OV7670): чек-лист CubeMX, распиновка, порядок бринг-апа |
| [lithoseq/mech/](lithoseq/mech/README.md) | `plate.scad` — параметрическая модель рамки пластины и слота (OpenSCAD) |
| [lithoseq/Makefile](lithoseq/Makefile) | Сборка тестов и симулятора на ПК |

Пути вида `lithoseq/…` и `docs/…` внутри документов отсчитываются от этой
папки.

## Порядок чтения

1. [docs/DESIGN-OPINION.md](docs/DESIGN-OPINION.md) — оценка концепции и развилки.
2. [docs/00-ROADMAP.md](docs/00-ROADMAP.md) → [docs/01-REQUIREMENTS.md](docs/01-REQUIREMENTS.md) → [docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md).
3. Профильные спеки: [03-SENSOR-OPTICS](docs/03-SENSOR-OPTICS.md), [04-PLATE-SPEC](docs/04-PLATE-SPEC.md), [05-FIRMWARE-SPEC](docs/05-FIRMWARE-SPEC.md), [06-CV-IO](docs/06-CV-IO.md).
4. Прототип: [07-BOM-PROTO](docs/07-BOM-PROTO.md), [08-TEST-PLAN](docs/08-TEST-PLAN.md).
5. [docs/DECISIONS.md](docs/DECISIONS.md) — принятые решения D1–D11.
6. [docs/TUTORIAL.html](docs/TUTORIAL.html) — весь маршрут сборки в картинках.
7. [lithoseq/README.md](lithoseq/README.md) — код и инструменты.

## Как собрать и запустить

Нужны `make` и компилятор C11 (gcc или clang). Python 3 нужен только для
инструментов в `tools/`.

```sh
cd lithoseq
make test        # собрать и прогнать тесты ядра и MIDI-слоя
make sim         # собрать ПК-симулятор build/lithoseq_sim

# синтетический образец → CSV событий + бинарный лог протокола + MIDI-файл
./build/lithoseq_sim rings --traj spiral_in --preset reveal \
    --ticks 512 --csv out.csv --bin out.bin --mid out.mid --bpm 120

python3 tools/viewer.py out.bin --out out.png   # карта + путь плейхеда + ноты
python3 tools/genpatterns.py pgm/               # PGM-паттерны для симулятора
./build/lithoseq_sim pgm/rings.pgm --traj boustro --preset compose --csv rings.csv

make clean       # удалить build/
```

Параметры симулятора:

- источник — `blank`, `checker`, `rings`, `dots5`, `dots15`, `dots40` или
  путь к PGM (P5, 320×240);
- `--traj` — `raster`, `boustro`, `spiral_in`, `spiral_out`, `radial`;
- `--preset` — `reveal` или `compose`;
- `--ticks N`, `--bpm N`;
- выходы `--csv`, `--bin`, `--mid`; без `--csv` события идут в stdout.

`viewer.py` работает на стандартной библиотеке. Если установлен matplotlib,
картинка рисуется им. Живой режим `--live` со стендом требует pyserial.
`genpatterns.py` требует numpy. Сгенерированные `build/`, `*.bin`, `*.csv`,
`*.png`, `*.pgm`, `*.mid`, `*.stl` в git не попадают (`lithoseq/.gitignore`).

Прошивка стенда собирается не через Makefile, а в STM32CubeIDE — см.
[lithoseq/fw-stm32/README.md](lithoseq/fw-stm32/README.md). STL рамки
рендерится OpenSCAD — см. [lithoseq/mech/README.md](lithoseq/mech/README.md).

Проверка при сборке этого дерева (копия папки вне репозитория, gcc 13.3 и
clang 18, также с `-fsanitize=address,undefined`): `make test` проходит
(«all tests passed», «all midi tests passed»),
симулятор собирается и пишет CSV, бинарный лог и MIDI-файл, `viewer.py`
рендерит PNG.

## Происхождение

| Источник | Коммит | Дата | Что взято |
|---|---|---|---|
| `origin/claude/eurorack-sequencer-design-3wu8wb`, `docs/eurorack-sequencer/` | `72671ad` | 2026-07-18 | Все 12 документов → `docs/` (живая ветка, самые свежие версии) |
| `origin/claude/eurorack-sequencer-design-3wu8wb`, `lithoseq/` | `72671ad` (код последний раз менялся в `c256be3`, 2026-07-07) | 2026-07-18 | Весь код → `lithoseq/` |
| `origin/SS`, `04_sequencer/` | `6d20ae1` | 2026-07-07 | Ничего напрямую: снапшот документов на коммите `a365ef3` живой ветки (без D3a, D11, TUTORIAL и актуального статуса фаз), устарел; `06-CV-IO.md` и `DESIGN-OPINION.md` совпадают с живой веткой побайтно. Его README использован как основа порядка чтения и формулировки «соседний проект» |
| `origin/claude/add-system-suicide-docs-0in5C`, `sequencer/` | `54d8669` (папка последний раз менялась в `1b5250d`) | 2026-07-07 | Ничего: побайтно та же копия, что `origin/SS:04_sequencer/` |

Правки при переносе (сознательные, точечные):

- `lithoseq/README.md`: ссылка на документацию `../docs/eurorack-sequencer/`
  заменена ссылками на `../docs/` и `../README.md`; в блок структуры
  добавлены `fw-stm32/`, `mech/`, MIDI/SMF в `app/` и тесты MIDI; строка про
  `hal/` («реализация STM32 появится…») исправлена на `fw-stm32/hal_impl.c`;
  в пример добавлен `--mid`; в конце — раздел «Статус и происхождение».
- `lithoseq/.gitignore`: добавлены `*.mid` и `*.stl` — их создают команды
  из README (симулятор `--mid`, рендер OpenSCAD).
- `lithoseq/core/`, `hal/`, `app/`, `tests/`, `tools/`: добавлены короткие
  `README.md` (назначение, таблица файлов, статус, происхождение).
- `docs/08-TEST-PLAN.md`: путь журнала испытаний `docs/eurorack-sequencer/lab/` → `docs/lab/`.
- `docs/TUTORIAL.html`: два текстовых упоминания `docs/eurorack-sequencer/`
  → `docs/`. В исходнике это HTML-фрагмент (начинается с `<title>`, рассчитан
  на хост, который сам добавляет каркас страницы). В начало добавлены четыре
  строки: `<!doctype html>`, `<html lang="ru">`, `<meta charset="utf-8">`,
  `<meta name="viewport">`. Без них локальный файл открывается в quirks mode,
  кодировку браузер угадывает, на телефоне нет масштабирования. Остальное
  содержимое не тронуто.

Остальные файлы из источника перенесены байт-в-байт (сверено по blob-хешам).
