# SYSTEM SUICIDE — Fixes

Рабочие документы с конкретными инструкциями по исправлению ошибок, выявленных в аудите. В отличие от `audit/` (критика), этот каталог даёт **конкретные действия**: что изменить в schematic, что добавить в BOM, как развести PCB, как протестировать прототип.

## Порядок применения

1. **`01_last_night_fix_list.md`** — 15 правок schematic (IMMEDIATE / SHORT / MEDIUM / LONG).
2. **`02_bom_delta.md`** — обновлённый BOM с конкретными part numbers.
3. **`03_pcb_layout_guide.md`** — правила разводки для минимизации шума.
4. **`04_testing_protocol.md`** — валидационные тесты для первого прототипа.

## Как использовать

- Читать в порядке 01 → 04.
- Применять правки в KiCad project.
- Заказать обновлённый BOM по `02_bom_delta.md`.
- Развести PCB по rules в `03_pcb_layout_guide.md`.
- После ассемблировки — прогнать тесты `04_testing_protocol.md`.

## Severity phases

| Phase | Timeline | Содержание | Cost delta |
|-------|----------|-----------|-----------|
| IMMEDIATE | 1 day | bias diodes, R8 spec, R_DAM1 fix | +$0.60 |
| SHORT | 1 week | LSK489A swap, SPICE, mini-XLR | +$18 |
| MEDIUM | 1 month | C_DC extension, env follower τ, LED clipper, zener | +$0.70 |
| LONG | 3+ months | LFO, material-adaptive pre-emph, input hardening | +$9 |

**Total rev A** (IMMEDIATE + SHORT + MEDIUM): +$19 BOM per module.

## Зависимости

- Source audit: `../audit/10_last_night_engineering.md`, `../audit/13_schematic_cross_reference.md`.
- Source schematic: `../audit/wood_reverb_logical_schematic.html`.

## Что не входит в fixes/

- **Проектирование новых модулей** — см. `../decisions/01_undefined_modules.md`.
- **Acoustic catalog** — см. `../decisions/03_cartridge_standards.md`.
- **Production strategy** — см. `../decisions/04_production_strategy.md`.

Fixes — только **electrical/PCB/BOM/test** для уже разрабатываемого Last Night.
