# Is My — модуль-шейпер + пилотный пульт

Слот 6 линейки SYSTEM SUICIDE. VCA-сатуратор-шейпер на MOSFET-каскаде из ESC FPV-дрона, три режима SHAPER / RING / GATE, выносной пилотный пульт из корпуса DJI C5 (RC-N1/RC231), линк USB-C (USB-MIDI). Edition of 13 с документированным провенансом.

## Импорт из внешней ветки

Полная канoническая техспека модуля разрабатывается на ветке **`origin/claude/jolly-gates-KxAP2`** (`is_my/` в корне репо на той ветке). Файлы в этой папке — **копии** ключевых документов оттуда, синхронизированные вручную:

| Файл | Что | Источник |
|------|-----|----------|
| `01_concept.md` | Концепт и архитектура: сигнальный путь, режимы, пульт, edition | `jolly-gates-KxAP2:is_my/01_concept.md` |
| `04_prototyping.md` | План итераций It-0 … It-N, milestones | `jolly-gates-KxAP2:is_my/04_prototyping.md` |
| `05_pult_dji_c5.md` | Донор пульта DJI C5, digital секция, USB-C линк | `jolly-gates-KxAP2:is_my/05_pult_dji_c5.md` |

**Что не импортировано** (живёт только на `jolly-gates`):
- `02_technical.md` — подробная электрическая спека модуля/пульта (BOM, распиновка, MCU).
- `03_schematics.md` — схемные узлы SHAPER/RING/GATE с номиналами.
- `firmware/` — прошивки для пульта и модуля (STM32G431), `midi_map.h`.
- `panel_module.svg` / `panel_pult.svg` — макеты лицевых панелей.
- `signal_flow.svg` — актуальная блок-схема после S11 (USB-C конфиг).

Для работы над схемотехникой и прошивкой — переключаться на ветку `jolly-gates`. Синхронизация периодическая; последняя — 2026-07 (коммиты `edbe26a` … `0d7b70c`).

## Соотношение с остальным репо

- **Обзор в цепи серии**: `../SYSTEM_SUICIDE.md §6`.
- **Формальное решение о re-spec**: `../decisions/12_is_my_shaper_respec.md`.
- **Slot swap с And My** (And My → TBD): `../decisions/13_and_my_tbd.md`.
- **Историческая архитектура** (vactrol crossfader): `../decisions/01_undefined_modules.md §2` (помечена superseded).
