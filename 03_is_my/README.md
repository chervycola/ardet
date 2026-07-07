# 03 · Is My — MOSFET-shaper + пилотный пульт (Phase 2, edition of 13)

Слот 6 линейки SYSTEM SUICIDE. VCA-сатуратор-шейпер на MOSFET-каскаде из ESC FPV-дрона, три режима SHAPER / RING / GATE, выносной пилотный пульт из корпуса DJI C5 (RC-N1/RC231), линк USB-C (USB-MIDI). Edition of 13 с документированным провенансом.

## Импорт из внешней ветки

Полная канoническая техспека модуля разрабатывается на ветке **`origin/claude/jolly-gates-KxAP2`** (`is_my/` в корне репо на той ветке). Эта папка — **полное зеркало** её состояния на 2026-07 (коммиты `edbe26a` … `0d7b70c`):

| Файл | Что |
|------|-----|
| `01_concept.md` | Концепт и архитектура: сигнальный путь, режимы, пульт, edition |
| `02_technical.md` | Электрическая спека модуля/пульта: BOM, распиновка, MCU, части A/B |
| `03_schematics.md` | Схемные узлы (SHAPER/RING/GATE с номиналами, S0–S11, USB-host секция) |
| `04_prototyping.md` | План итераций It-0 … It-N, milestones |
| `05_pult_dji_c5.md` | Донор пульта DJI C5, цифровая обвязка, USB-C линк |
| `firmware/` | Скелеты прошивок пульта и модуля (STM32G431) + общий `midi_map.h` + host-test |
| `panel_module.svg/.png` | Макет лицевой панели модуля (14HP) |
| `panel_pult.svg/.png` | Макет фронта пульта (донор-аппаратура) |
| `signal_flow.svg/.png` | Блок-схема (USB-C конфиг после S11) |

Живая разработка — на `jolly-gates`; перед правками здесь проверь, не уехала ли ветка вперёд.

## Соотношение с остальным репо

- **Обзор в цепи серии**: `../00_series/SYSTEM_SUICIDE.md §6`.
- **Формальное решение о re-spec**: `../00_series/decisions/12_is_my_shaper_respec.md`.
- **Slot swap с And My** (And My → TBD): `../00_series/decisions/13_and_my_tbd.md`.
- **Историческая архитектура** (vactrol crossfader): `../00_series/decisions/01_undefined_modules.md §2` (помечена superseded).
