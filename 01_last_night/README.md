# 01 · Last Night — reverb-финализатор (Phase 1, flagship)

Аналоговый ревербератор на сменных физических пластинах + cold palette FX. Первая разработка очереди: ship Phase 1 (Months 1–9). Формат: 40HP Eurorack + big-box pedal (одна PCB). Headline price: **€3640** (все картриджи включены).

## ⚡ Для R&D dept и production team

**Начать здесь**: [`HANDOFF_BRIEF.md`](HANDOFF_BRIEF.md) — executive brief с приоритетами, манифестом документации и hand-off checkpoints.

**Обязательная визуализация**: [`signal_flow_last_night.svg`](signal_flow_last_night.svg) — структурная схема (10 функциональных зон, signal flow, modulation paths, perform gestures).

**⚠ Читать до tooling**: [`RISK_ASSESSMENT.md`](RISK_ASSESSMENT.md) — честный risk-register (3 недоказанных физических риска) + bench-prototype protocol (Stage 0 — обязательный gate перед PCB/закупками).

## Файлы

**Продукт и инженерия:**
```
├── LAST_NIGHT_SPEC.md / .docx   — продуктовая спецификация (v5 hybrid)
├── LAST_NIGHT_BUILD.md / .docx  — build документация (25 блоков, ~2600 строк)
├── PCB_DESIGN_SPEC.md           — KiCad-ready spec (6 PCBs, stackup, ground topology)
├── acoustic_modeling.md         — модальный калькулятор + cartridge dimensions per material
├── calibration_procedure.md     — настройка trim pots + QC sign-off
└── stage0_prototype.html        — bench prototype build sheet (acoustic core only)
```

**Закупки:**
```
├── BOM_SOURCING.md              — purchasing guide small-batch 20 units
├── CARTRIDGE_SOURCING.md        — transducers (в модуле) vs passive plates (картриджи)
└── PRICE_TABLE.md               — цены (budget/audiophile) × компонент × магазин
```

**Картриджи и панели:**
```
├── cartridges/                  — manuals обработки материалов пластин (bone, nephrite)
├── last_night_40hp.epanel/.json — проект панели для EURORACK-PANEL-DESIGNER
├── last_night_pedal_panel.svg   — панель pedal-SKU (203×140мм)
└── strike_seating_problem.svg   — диаграмма strike × seating × frame-compliance
```

## Связи

- Канон серии и decisions: `../00_series/` (особенно decisions 07, 08-consolidated, 09, 11).
- Аудит ядра v2.1: `../00_series/audit/10–13` + `../00_series/fixes/01`.
- Diptych-пара: `../02_last_day/`.
