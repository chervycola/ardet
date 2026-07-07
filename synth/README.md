# SYSTEM SUICIDE — synth documentation

Техническая документация по 9-модульной серии физического синтеза. Находится в thematically-связанном ардет-репозитории (игра о горящем городе) как параллельный проект.

## ⚡ Для R&D dept и production team

**Начать здесь**: **[`HANDOFF_BRIEF.md`](HANDOFF_BRIEF.md)** — executive brief с приоритетами, манифестом документации и hand-off checkpoints.

**Обязательная визуализация**: **[`signal_flow_last_night.svg`](signal_flow_last_night.svg)** — структурная схема Last Night (10 функциональных зон, signal flow, modulation paths, perform gestures).

**⚠ Читать до tooling**: **[`RISK_ASSESSMENT.md`](RISK_ASSESSMENT.md)** — честный risk-register (3 недоказанных физических риска) + bench-prototype protocol (Stage 0 — обязательный gate перед PCB/закупками).

**PCB design**: **[`PCB_DESIGN_SPEC.md`](PCB_DESIGN_SPEC.md)** — KiCad-ready spec для PCB designer (6 PCBs inventory, XY coordinates, layer stackup, ground topology, ribbon pinouts).

**Acoustic / cartridge**: **[`acoustic_modeling.md`](acoustic_modeling.md)** — modal density calculator + acoustic-optimized cartridge dimensions per material + transducer coupling spec + plate coating tuning + acoustic feedback mitigation + tap-test protocol (закрывает главный риск проекта — звук пластин).

**Calibration**: **[`calibration_procedure.md`](calibration_procedure.md)** — пошаговая настройка всех trim pots для production assembly + QC sign-off.

**Procurement**: **[`BOM_SOURCING.md`](BOM_SOURCING.md)** — purchasing guide для small-batch (20 units): part numbers, дистрибьюторы, qty с буфером, преимущества, альтернативы, lead time + risk register.

**Cartridge sourcing**: **[`CARTRIDGE_SOURCING.md`](CARTRIDGE_SOURCING.md)** — split: module transducers (×модули, Decision 11) vs passive plate cartridges (×count), supplier domains + P/N.

**Price table**: **[`PRICE_TABLE.md`](PRICE_TABLE.md)** — консолидированная таблица цен (budget/audiophile) × компонент × магазин. ~$176 budget / ~$361 audiophile per module.

## Текущий статус

**Phase**: design lock (v6.5 = Decision 09 hybrid + audit v6.3 + improvements v6.4 + **Decision 11** plate-only cartridge). Готовы к prototyping Phase 1 ship (Last Night) — но **Stage 0 bench gate обязателен** (R1 contact coupling + R2 material differentiation непроверены) и R&D Phase A (Last Day).

## Структура (по категориям)

**Канон серии:**
```
├── SYSTEM_SUICIDE.md            — общий брифинг по 9-модульной серии (source of truth)
├── docs/                        — иллюстрированный гид (markdown → PDF/DOCX/HTML через pandoc)
└── decisions/                   — design decisions 00–13 (полная цепочка, включая superseded)
```

**Модули — рабочая документация:**
```
├── LAST_NIGHT_SPEC.md / .docx   — продуктовая спецификация Last Night v5 hybrid
├── LAST_NIGHT_BUILD.md / .docx  — детальная build документация (25 блоков, ~2600 строк)
├── LAST_DAY_SPEC.md / .docx     — продуктовая спецификация Last Day v1.0
├── LAST_DAY_BUILD.md / .docx    — build документация Last Day
├── is_my/                       — Is My: концепт, схемотехника, прошивки, панели (sync с jolly-gates)
└── cartridges/                  — manuals по обработке материалов пластин (bone, nephrite)
```

**Инженерия и производство:**
```
├── HANDOFF_BRIEF.md             — executive brief для R&D/production
├── RISK_ASSESSMENT.md           — risk-register + Stage 0 bench gate
├── PCB_DESIGN_SPEC.md           — KiCad-ready spec (6 PCBs)
├── acoustic_modeling.md         — модальный калькулятор + cartridge dimensions
├── calibration_procedure.md     — настройка trim pots + QC
├── BOM_SOURCING.md / CARTRIDGE_SOURCING.md / PRICE_TABLE.md — закупки
├── proto/                       — bench-план прототипирования Last Day (4 rigs)
├── fixes/                       — конкретные правки post-audit (5 файлов)
├── last_night_40hp.epanel/.json — проект панели для EURORACK-PANEL-DESIGNER
├── last_night_pedal_panel.svg   — панель Last Night pedal (203×140мм)
├── signal_flow_last_night.svg   — структурная схема Last Night
├── strike_seating_problem.svg   — диаграмма strike × seating
└── stage0_prototype.html        — bench prototype build sheet
```

**Историческое (с HISTORICAL/SUPERSEDED баннерами):**
```
└── audit/                       — критический аудит серии (14 файлов, весна 2026)
```

Соседние проекты монорепо — см. корневой `../README.md` (игра `game/`, сайт `site/`, секвенсор `sequencer/`).

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
| 01 | Active (§1, §4); §2, §3 superseded | 4 undefined modules → fixed concepts. §2 Is My superseded by 12; §3 And My superseded by 13. |
| 02 | Active (partial) | Last Day scope (D1, D5 superseded by 08-consolidated) |
| 03 | Active (partial, see D11) | Cartridge standards — frame format + 4 magnets (passive plate per Decision 11) |
| 04 | Active (partial, Is My/And My pricing obsolete) | Production strategy (5 phases sequential) |
| 05 | Superseded by 12/13 | And My re-spec → MOSFET-shaper (до slot swap; хранится как звено цепочки 01-3 → 05 → 12/13) |
| 06 | **LOCKED** (via 08-consolidated) | Last Day re-spec — комбайн раскалённого полудня |
| 07 | **LOCKED** (via 08-consolidated) | Last Night re-spec — комбайн холодной ночи |
| 08-refined | Superseded by 08-consolidated | Refined FX palettes (промежуточный рефайнинг 06/07) |
| 08-consolidated | **LOCKED** | Day/Night комбайны consolidated base + diptych mapping |
| 09 | **LOCKED** | v5 hybrid — mockup canon UX + Decision 08 internals |
| 10 | Reference | Elite tier components + sourcing |
| 11 | **LOCKED** | Plate-only passive cartridge + in-module transducers (contact coupling) |
| 12 | **LOCKED** | Is My re-spec: MOSFET-shaper из ESC + пилотный пульт из корпуса DJI C5, edition of 13, €2480. Полная техспека — ветка `origin/claude/jolly-gates-KxAP2`, локальная копия — `synth/is_my/`. |
| 13 | **LOCKED** | And My rolled back to TBD. Слот 8 остаётся placeholder'ом до появления концепта уровня остальных модулей. |

> **Примечание о нумерации**: существуют два файла «Decision 08» — `08_refined_fx_palette.md` (импортирован с ветки HWbFa, промежуточный) и `08_consolidated_base.md` (финальный, консолидирует 06+07+refined+v3-prototype). Нумерация исторически разошлась между ветками; consolidated — актуальный.

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

> **Headline price (current, locked): €3640** (flagship). Tier table выше — prior plan, под reconciliation vs €3640 ("потом разберемся").

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
