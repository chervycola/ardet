# SYSTEM SUICIDE — Decisions

Документы с вариантами решений и рекомендациями по вопросам, которые требуют явного выбора со стороны пользователя. В отличие от `audit/` (критика) и `fixes/` (конкретные действия по выявленным ошибкам), этот каталог адресует **открытые архитектурные вопросы**.

## Структура

1. **`01_undefined_modules.md`** — 4 модуля с неопределённой архитектурой:
   - Be Careful (фильтр с 3 conflicting концепциями → glass plate резонатор).
   - Is My (3 conflicting функции → vactrol crossfader).
   - And My (TBD → Day↔Night crossfader).
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
- Is My: A (vactrol crossfader)
- And My: A (Day↔Night crossfader)
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
