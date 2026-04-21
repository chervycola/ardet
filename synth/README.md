# SYSTEM SUICIDE — synth documentation

Техническая документация по 9-модульной серии физического синтеза. Находится в thematically-связанном ардет-репозитории (игра о горящем городе) как параллельный проект.

## Структура

```
synth/
├── audit/          — критический аудит существующей документации (14 files)
├── fixes/          — конкретные правки по выявленным ошибкам (5 files)
└── decisions/      — варианты решений по открытым вопросам (5 files)
```

## Читать в порядке

### 1. Для первого знакомства с проектом

- `audit/00_README.md` — карта аудита.
- `audit/01_executive_summary.md` — вердикт и топ-10 рисков.
- `audit/02_system_architecture.md` — системный обзор.

### 2. Если задача — исправить существующую схему

- `fixes/00_README.md`
- `fixes/01_last_night_fix_list.md` — 15 правок schematic.
- `fixes/02_bom_delta.md` — обновлённый BOM.
- `fixes/03_pcb_layout_guide.md` — правила разводки.
- `fixes/04_testing_protocol.md` — тесты прототипа.

### 3. Если задача — принять архитектурные решения

- `decisions/00_README.md`
- `decisions/01_undefined_modules.md` — 4 модуля под определением.
- `decisions/02_last_day_scope.md` — 6 decisions Last Day.
- `decisions/03_cartridge_standards.md` — 7 decisions cartridge.
- `decisions/04_production_strategy.md` — 8 decisions business.

### 4. Для deep dive по конкретному модулю

- Last Night electrical: `audit/10_last_night_engineering.md`.
- Last Night acoustic: `audit/11_last_night_acoustic.md`.
- Last Night Q&A: `audit/12_last_night_open_questions.md`.
- Schematic cross-reference: `audit/13_schematic_cross_reference.md`.
- Last Day: `audit/20_`, `21_`, `22_`.
- Other 7 modules: `audit/30_other_modules_gaps.md`.

## Current status

**Phase**: pre-production design review.

**Blockers resolved**: 1 of 5 (solenoid divider error corrected after schematic ground-truth).

**Blockers remaining**:
1. 2N5457 EOL — need LSK489A replacement.
2. Solenoid EMI → piezo preamp — need cable shielding.
3. Feedback loop stability — need SPICE verification.
4. LFO missing from schematic but present on panel — need resolution.
5. Last Day form factor — need Eurorack/pedal commitment.

**Major decisions pending**: 25 items across 4 decision documents.

## Schematic reference

`audit/wood_reverb_logical_schematic.html` — 14-секционный каркас Last Night v2.0 в ASCII-art (pushed пользователем отдельно, triggered revision pass).

## Source of truth

- `audit/` — описание **того, что есть** (brief documents + schematic HTML).
- `fixes/` — описание **того, что нужно изменить** (concrete actions).
- `decisions/` — описание **того, что нужно решить** (user choices).

## Timeline summary

- **Week 1-2**: apply IMMEDIATE fixes to schematic.
- **Week 3-4**: apply SHORT fixes (LSK489, SPICE, mini-XLR).
- **Month 2**: build first prototype rev A.
- **Month 3**: test per `fixes/04_testing_protocol.md`.
- **Month 4-6**: iterate to rev B based on test results, ship Phase 1.

## Next steps для пользователя

1. Прочитать `audit/01_executive_summary.md` (самое короткое первое чтение).
2. Принять decisions в `decisions/` — зафиксировать выборы.
3. Применить `fixes/` в KiCad project.
4. Build prototype.
5. Test per protocol.
6. Ship Phase 1.
