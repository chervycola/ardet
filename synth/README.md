# SYSTEM SUICIDE — synth documentation

Техническая документация по 9-модульной серии физического синтеза. Находится в thematically-связанном ардет-репозитории (игра о горящем городе) как параллельный проект.

## Текущий статус

**Phase**: design lock (Decision 09 v5 hybrid). Готовы к prototyping Phase 1 ship (Last Night) и R&D Phase A (Last Day).

## Структура

```
synth/
├── LAST_NIGHT_SPEC.md / .docx   — продуктовая спецификация Last Night v5 hybrid
├── LAST_NIGHT_BUILD.md / .docx  — детальная build документация (25 блоков, ~2600 строк)
├── LAST_DAY_SPEC.md / .docx     — продуктовая спецификация Last Day v1.0
├── SYSTEM_SUICIDE.md            — общий брифинг по 9-модульной серии
├── last_night_pedal_panel.svg   — Inkscape SVG панели Last Night pedal (203×140мм)
├── audit/                       — критический аудит (14 файлов)
├── decisions/                   — locked design decisions (00, 01–04, 08, 09, 10)
├── cartridges/                  — manuals по обработке материалов (bone, nephrite)
└── fixes/                       — конкретные правки post-audit (5 файлов)
```

## Читать в порядке

### Для customer / product reviewer

1. `LAST_NIGHT_SPEC.md` — что это, как звучит, что в коробке.
2. `LAST_DAY_SPEC.md` — парный модуль.
3. `SYSTEM_SUICIDE.md` — series brief.

### Для prototyping engineer

1. `LAST_NIGHT_BUILD.md` — 25 блоков с R/C values, BOM, PCB zones.
2. `decisions/08_consolidated_base.md` — что зафиксировано как ядро.
3. `decisions/09_hybrid_lock.md` — v5 hybrid final decisions.
4. `audit/13_schematic_cross_reference.md` — сверка с logical schematic ASCII.

### Для understanding architecture

1. `decisions/00_README.md` — список всех locked decisions.
2. `audit/02_system_architecture.md` — системный обзор.
3. `decisions/02_last_day_scope.md` (с надзором, частично superseded Decision 08).

### Для production / sourcing

1. `decisions/10_premium_components_sourcing.md` — Elite tier + sourcing matrix.
2. `decisions/04_production_strategy.md` — phases roadmap.
3. `decisions/03_cartridge_standards.md` — cartridge format.

## Locked decisions

| Decision | Status | Описание |
|----------|--------|----------|
| 01 | Active | 4 undefined modules → fixed concepts |
| 02 | Active (partial) | Last Day scope (D1, D5 superseded by 08) |
| 03 | Active | Cartridge standards (mini-XLR + JST + 4 magnets) |
| 04 | Active | Production strategy (5 phases sequential) |
| 08 | **LOCKED** | Day/Night комбайны consolidated base + diptych mapping |
| 09 | **LOCKED** | v5 hybrid — mockup canon UX + Decision 08 internals |
| 10 | Reference | Elite tier components + sourcing |

## Schematic reference

`audit/wood_reverb_logical_schematic.html` — 14-секционный каркас Last Night v2.0 в ASCII-art (pushed пользователем отдельно, triggered revision pass — reflected в `audit/13_schematic_cross_reference.md`).

## Phase plan summary (per Decision 08)

| Phase | Window | Last Night | Last Day |
|-------|--------|------------|----------|
| **1 ship** | M1–9 | v5 hybrid ядро (reverb + base FX + 4 footswitches + always-on phaser + Color slider) | R&D ongoing |
| **2 ship** | M9–27 | Cold palette upgrade kit (PULSE/FOG/FROST/CHILL/HUM via v3 PCB) | v1 ship (oil-can + solar + tongue + hot palette) |
| **2B** | M27–33 | HUM optimization | Motorized tongue resonator (v2 premium) |
| **3** | M27+ | Satellites respec | Boutique tier oil formulations + BLDC motor |

## Retail tier pricing (Decision 10 reference)

| Tier | Last Night BOM | Retail | Margin |
|------|---------------|--------|--------|
| Budget | ~$96 | $499 | ~80% |
| Premium | ~$123 | $649 | ~81% |
| Elite (LE 25) | ~$1,467 | $2,499 | 41% |

## Source of truth ranking

1. **`LAST_NIGHT_SPEC.md` + `LAST_NIGHT_BUILD.md`** — primary technical canon (v5 hybrid).
2. **`decisions/08`, `09`, `10`** — locked architecture/business decisions.
3. **`audit/`** — preserved historical analysis (some claims now stale after Decision 08).
4. **`fixes/`** — pre-Decision 08 fix list (mostly applied or absorbed into Decision 08).

## Open work track

- [ ] **LAST_NIGHT_BUILD.md**: PCB KiCad design (currently only ASCII floor plan).
- [ ] **LAST_DAY_BUILD.md**: engineering doc для oil-can + capacitive frontend + tongue mechanism (Phase A scope).
- [ ] **Satellites respec** (ABD / FAS / Be Careful / I Show You Light) — complement к Day/Night combines (Phase 3+).
- [ ] **Prototype audition** Phase 2 cold palette FX (HUM antenna + DC-DC noise test).
- [ ] **Cartridge processing manuals** — wood/stone/metal/glass (только bone и nephrite готовы).
