# SYSTEM SUICIDE — Decisions

Документы с вариантами решений и рекомендациями по вопросам, которые требуют явного выбора со стороны пользователя. В отличие от `audit/` (критика) и `fixes/` (конкретные действия по выявленным ошибкам), этот каталог адресует **открытые архитектурные вопросы**.

## Структура

1. **`01_undefined_modules.md`** — 4 модуля с неопределённой архитектурой:
   - Be Careful (фильтр с 3 conflicting концепциями → glass plate резонатор).
   - Is My (3 conflicting функции → ~~vactrol crossfader~~ **superseded — см. `12_is_my_shaper_respec.md`**).
   - And My (TBD → ~~Day↔Night crossfader~~ **superseded → back to TBD, см. `13_and_my_tbd.md`**).
   - Body Blood And Salt (safety + scope → defer to Phase 5).

2. **`02_last_day_scope.md`** — 6 decisions для Last Day:
   - Форм-фактор (Eurorack vs pedal).
   - Pickup type (magnetic vs capacitive).
   - Solar amp configuration.
   - Mid resonator implementation (manual vs motorized).
   - Performance FX subset.
   - R&D phasing.

3. **`03_cartridge_standards.md`** — 7 decisions для cartridge system:
   - Plate sizing (fixed vs variable).
   - Initial catalog (6 cartridges Phase 1).
   - Connector strategy (Mini-XLR + JST).
   - Pickup tiering (piezo vs PVDF).
   - Exciter tiering (DAEX25 vs DAEX32).
   - Mount mechanism (magnetic vs screw).
   - Packaging standards.

4. **`04_production_strategy.md`** — 8 decisions для business model:
   - Roadmap phasing (5 phases sequential).
   - Manufacturing scale (DIY → contract).
   - Pricing strategy (tiered budget/premium).
   - Distribution (direct → partners).
   - Preorder funding.
   - Brand identity (rebrand strategy).
   - Open source policy.
   - Warranty и support.

5. **`08_consolidated_base.md`** (**LOCKED**) — Day/Night комбайны final base:
   - Объединяет Decision 06 (Last Day re-spec) + Decision 07 (Last Night re-spec) + v3.0 prototype.
   - Cold/hot palette diptych mapping (PULSE↔HAZE, FOG↔MIRAGE, FROST↔BLEACH, CHILL↔TAR, GEIGER↔CICADA, HUM↔HEATWAVE, STALL↔DRAG, TOLL↔CRASH).
   - **Supersedes**: Decision 02 D1 (Last Day form factor — now dual SKU), Decision 02 D5 (v1 perform FX subset — расширен).
   - BBD vinyl wow удалён из Last Night → переехал в Last Day как OLD VINYL PT2399.

6. **`09_hybrid_lock.md`** (**LOCKED**) — v5 hybrid lock:
   - Mockup canon UX (TAP/GATE-CRUSH/BYPASS/FREEZE footswitches) + Decision 08 electrical innovations.
   - Gate/Crush footswitch восстановлен (был removed в Decision 08).
   - TOLL/STALL — CV-only triggers (не footswitches).
   - 2 separate NOISE и COLOR(geiger) knobs (не bipolar single knob).
   - Solenoid triple-function: DAMP/TOLL/STALL via 3-way diode-OR.

7. **`10_premium_components_sourcing.md`** — Elite tier:
   - 16 component categories × 4 tiers (budget/premium/elite/boutique).
   - Curated Elite SKU $1,467 BOM, retail $2,499 (41% margin).
   - Sourcing matrix (Mouser, Digi-Key, Mundorf direct, Audio Note UK, K&K Sound).
   - Risk register: 2SK170 NOS, Black Gate caps, OPA627 counterfeits.

8. **`11_cartridge_architecture_lock.md`** (**LOCKED**) — фундаментальная коррекция:
   - Картридж = **пассивная пластина** (материал + покрытие + рамка + магниты).
   - Трансдьюсеры (exciter/пьезо/соленоид) — **в модуле**, contact coupling.
   - Supersedes "full cartridge" модель во всех ранних docs.
   - Картридж $10-20 (было $40-45) → razor-blade viable. Universal DAEX32 в модуле.

9. **`12_is_my_shaper_respec.md`** (**LOCKED**) — Is My re-spec + slot swap с And My:
   - Is My больше не vactrol crossfader (Decision 01-2 superseded).
   - Новая архитектура: VCA-сатуратор-шейпер на MOSFET-каскаде из ESC FPV-дрона.
   - Три режима SHAPER / RING / GATE, управление внешним пилотным пультом.
   - Донор пульта — DJI C5 (RC-N1/RC231), линк USB-C (USB-MIDI), STM32G431 в обоих устройствах.
   - Полная техспека — ветка `origin/claude/jolly-gates-KxAP2`. Retail €2480. 14 HP, edition of 13.

10. **`13_and_my_tbd.md`** (**LOCKED**) — And My rolled back to TBD:
    - Day↔Night crossfader концепт (Decision 01-3) снят как не соответствующий принципу серии.
    - Optical vactrol crossfader (перенесённый на слот 8 в System-suicide branch commit `71b4aa8`) также снят через commit `b41db61`.
    - Слот 8 остаётся placeholder'ом до появления архитектуры уровня остальных модулей.

## Как использовать

Каждый документ:
1. Описывает **текущее состояние** (что заявлено в брифах).
2. Даёт **варианты** (обычно 2–4) с trade-offs.
3. Содержит **рекомендацию** с обоснованием.
4. В конце — **required user action** — что явно нужно подтвердить.

## Как отвечать

Рекомендация: создать файл `decisions/responses.md` с answers:

```
# Decisions — user responses

## 01_undefined_modules
- Be Careful: A (glass plate)
- Is My: A (vactrol crossfader) — **SUPERSEDED 2026-05/07, см. `12_is_my_shaper_respec.md`** (MOSFET-shaper из ESC + пилотный пульт из DJI C5)
- And My: A (Day↔Night crossfader) — **SUPERSEDED 2026-07, см. `13_and_my_tbd.md`** (rolled back to TBD)
- BBAS: A (defer to Phase 5)

## 02_last_day_scope
- D1 form factor: A (Eurorack only)
- D2 pickup: B (capacitive Tel-Ray)
- D3 solar: B (solar optional)
- D4 mid resonator: A (manual v1)
- D5 perform FX: v1 subset (KILL+FREEZE+DRAG+HAZE)
- D6 roadmap: approved

## 03_cartridge_standards
- C1: variable sizing approved
- C2: 6-cartridge Phase 1 catalog approved
- ...

## 04_production_strategy
- P1: sequential 5 phases approved
- P2: DIY start
- ...
```

Этот файл закоммитить в отдельном commit — зафиксирует все design decisions на одну дату.

## Зависимости

- Source audit: `../audit/` (весь каталог).
- Source schematic: `../audit/wood_reverb_logical_schematic.html`.
- Planned actions: `../fixes/` (применяются после decisions locked).

## Что НЕ входит в decisions/

- **Fix existing issues** — см. `../fixes/`.
- **Critical audit** — см. `../audit/`.
- **Code / schematics** — только design decisions.
