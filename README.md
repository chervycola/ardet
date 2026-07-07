# SS — SYSTEM SUICIDE

Серия модулей физического синтеза **SYSTEM SUICIDE** и её спутники. Каждая разработка — в своей папке, номера отражают очередь разработки.

## Очередь разработки

| # | Папка | Разработка | Phase / статус | Живая ветка |
|---|-------|-----------|----------------|-------------|
| 00 | **`00_series/`** | Общесерийное: канон-бриф, decisions 00–13, аудит, fixes, иллюстрированный гид | design lock v6.5 | эта ветка |
| 01 | **`01_last_night/`** | Last Night — reverb-финализатор на сменных пластинах, flagship, €3640 | **Phase 1 ship** (M1–9), Stage 0 bench gate обязателен | эта ветка |
| 02 | **`02_last_day/`** | Last Day — oil-can delay + solar amp + tongue EQ, diptych-пара | Phase 2 (M9–27), R&D + 4 bench rigs | эта ветка |
| 03 | **`03_is_my/`** | Is My — MOSFET-shaper из ESC + пилотный пульт DJI C5, edition of 13, €2480 | Phase 2, схемотехника + прошивки в работе | `claude/jolly-gates-KxAP2` |
| 04 | **`04_sequencer/`** | Генеративный секвенсор (сканирование физического образца → CV/gate) — соседний проект, не входит в 9-модульную серию | design docs готовы | `claude/eurorack-sequencer-design-3wu8wb` |
| 05 | **`05_site/`** | Маркетинг-сайт (Vite + React + TS, bilingual) | live dev | `System-suicide` |

Дальше по очереди (папки появятся по мере respec, Phase 3+): All Bones Dust, Fuck Abandoned Sleep, I Show You Light, Be Careful, Body Blood And Salt, And My (слот ждёт концепта — Decision 13).

## Быстрый старт

- **Понять серию**: `00_series/SYSTEM_SUICIDE.md` (канон) или `00_series/docs/` (иллюстрированный гид, PDF/DOCX через pandoc).
- **R&D Last Night**: `01_last_night/README.md` → HANDOFF_BRIEF → RISK_ASSESSMENT.
- **Прототипирование Last Day**: `02_last_day/proto/00_bench_plan.md`.
- **Is My схемотехника/прошивки**: `03_is_my/README.md`.
- **Сайт**: `cd 05_site && npm install && npm run dev`. Расхождения данных с каноном — `05_site/PROVENANCE.md`.

## Синхронизация

Папки с «живой веткой» — снапшоты: активная разработка продолжается там, сюда периодически подтягивается состояние. Прежде чем редактировать `03_is_my/`, `04_sequencer/`, `05_site/` здесь — проверь, не уехала ли живая ветка вперёд.

Соседние проекты монорепо — на ветках **Ardet** (игра) и **Баклажания** (legal).
