# SYSTEM SUICIDE — серия (общие документы)

Общесерийная документация 9-модульной линейки физического синтеза. Документы конкретных разработок — в номерных папках ветки (см. корневой `../README.md`).

## Что здесь

```
00_series/
├── SYSTEM_SUICIDE.md   — канон-бриф серии: 9 модулей, цепь, HP-бюджет, roadmap (source of truth)
├── docs/               — иллюстрированный гид (markdown → PDF/DOCX/HTML через pandoc, ./build.sh)
├── decisions/          — design decisions 00–13, полная цепочка (включая superseded)
├── audit/              — критический аудит серии (весна 2026, HISTORICAL-баннеры)
└── fixes/              — правки post-audit (в основном применены / поглощены Decision 08)
```

## Текущий статус

**Phase**: design lock (v6.5 = Decision 09 hybrid + audit v6.3 + improvements v6.4 + **Decision 11** plate-only cartridge). Готовы к prototyping Phase 1 ship (Last Night) — но **Stage 0 bench gate обязателен** (см. `../01_last_night/RISK_ASSESSMENT.md`) и R&D Phase A (Last Day).

## Читать в порядке

### Для понимания серии
1. `SYSTEM_SUICIDE.md` — канон-бриф.
2. `docs/SYSTEM_SUICIDE_GUIDE.md` — иллюстрированный гид (мягкий вход).
3. `decisions/00_README.md` — список всех decisions.
4. `audit/02_system_architecture.md` — системный обзор (historical).

### Для production / sourcing
1. `decisions/10_premium_components_sourcing.md` — Elite tier + sourcing matrix.
2. `decisions/04_production_strategy.md` — phases roadmap.
3. `decisions/03_cartridge_standards.md` — cartridge format.

Инженерные quick-links по Last Night — `../01_last_night/README.md`.

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
| 12 | **LOCKED** | Is My re-spec: MOSFET-shaper из ESC + пилотный пульт из корпуса DJI C5, edition of 13, €2480. Полная техспека — ветка `origin/claude/jolly-gates-KxAP2`, локальная копия — `../03_is_my/`. |
| 13 | **LOCKED** | And My rolled back to TBD. Слот 8 остаётся placeholder'ом до появления концепта уровня остальных модулей. |

> **Примечание о нумерации**: существуют два файла «Decision 08» — `08_refined_fx_palette.md` (импортирован с ветки HWbFa, промежуточный) и `08_consolidated_base.md` (финальный, консолидирует 06+07+refined+v3-prototype). Нумерация исторически разошлась между ветками; consolidated — актуальный.

## Schematic reference

`audit/wood_reverb_logical_schematic.html` — 14-секционный каркас Last Night v2.0 в ASCII-art (triggered revision pass — reflected в `audit/13_schematic_cross_reference.md`).

## Phase plan summary (per Decision 08)

| Phase | Window | Last Night | Last Day |
|-------|--------|------------|----------|
| **1 ship** | M1–9 | v5 hybrid ядро (reverb + base FX + 4 footswitches + always-on phaser + Color slider) | R&D ongoing |
| **2 ship** | M9–27 | Cold palette upgrade kit (PULSE/FOG/FROST/CHILL/HUM via v3 PCB) | v1 ship (oil-can + solar + tongue + hot palette) |
| **2B** | M27–33 | HUM optimization | Motorized tongue resonator (v2 premium) |
| **3** | M27+ | Satellites respec | Boutique tier oil formulations + BLDC motor |

Очередь разработки → номерные папки ветки: `01_last_night` (Phase 1) → `02_last_day` + `03_is_my` (Phase 2) → satellites (Phase 3+, папки появятся по мере respec).

## Source of truth ranking

1. **`../01_last_night/LAST_NIGHT_SPEC.md` + `../01_last_night/LAST_NIGHT_BUILD.md`** — primary technical canon (v5 hybrid).
2. **`decisions/08`, `09`, `10`** — locked architecture/business decisions.
3. **`audit/`** — preserved historical analysis (some claims now stale after Decision 08).
4. **`fixes/`** — pre-Decision 08 fix list (mostly applied or absorbed into Decision 08).

## Open work track

- [ ] **LAST_NIGHT_BUILD.md**: PCB KiCad design (currently only ASCII floor plan).
- [ ] **LAST_DAY_BUILD.md**: engineering doc для oil-can + capacitive frontend + tongue mechanism (Phase A scope).
- [ ] **Satellites respec** (ABD / FAS / Be Careful / I Show You Light) — complement к Day/Night combines (Phase 3+).
- [ ] **Prototype audition** Phase 2 cold palette FX (HUM antenna + DC-DC noise test).
- [ ] **Cartridge processing manuals** — wood/stone/metal/glass (только bone и nephrite готовы, см. `../01_last_night/cartridges/`).
- [ ] **And My** — слот 8 ждёт концепта (Decision 13).
