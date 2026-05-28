# Cartridge processing manuals

Производственные guides для cartridge plates по типам материалов. Каждый материал имеет свой workflow от raw к готовой пластине.

## Содержание каталога

| File | Status | Material | Complexity |
|------|--------|----------|------------|
| `01_wood_processing.md` | TODO | Oak (100×45×1.8), maple, ebony | Low |
| `02_stone_processing.md` | TODO | Slate (100×45×2.0) — replaces marble | Medium |
| `03_metal_processing.md` | TODO | Spring steel / brass / aluminum (100×55), copper, titanium | Medium |
| `04_glass_processing.md` | TODO | Tempered glass (100×40×1.5) — narrow=chime | High (fragile) |
| **`05_bone_processing.md`** + `_ru.md` + `.docx` | **Готово v2** | **Cattle scapula (100×35×2.5 — narrow=percussion)** | **High (multi-week)** |
| `06_assembly.md` | TODO | Frame + magnets + keying (passive, no electronics) | Low |
| **`07_nephrite_processing.md`** + `_ru.md` + `.docx` | **Готово v2** | **Nephrite (100×45×2.0 — tough)** | **Medium-high (lapidary)** |

## Cartridge specification (универсальная) **[Decision 11 — passive plate]**

> **Decision 11**: картридж = пассивная пластина. Трансдьюсеры (exciter/пьезо/соленоид) — **в модуле** (transducer engine bay), не в картридже. Картридж несёт только материал + покрытие + рамку + retention магниты + keying. **Никаких разъёмов, никакой электроники.** Картридж дешёвый ($10-20), razor-blade модель работает.

Все cartridges share формат:

- **Plate dimensions**: длина 100мм fixed; ширина 35-55мм per material (см. таблицу ниже / `acoustic_modeling.md §3`); толщина 0.3-3мм per material durability.
- **Frame**: 110×65×30мм (PETG print prototype, фрезерованный алюминий production), окна для module transducer contact.
- **Mount**: 4× neodym N42 magnets (polarized для keying) + asymmetric notch (single-orientation insertion).
- **Connectors**: **НЕТ** (Decision 11 — картридж пассивный).
- **Coupling**: spring-contact от module exciter и пьезо (R1 риск, см. RISK_ASSESSMENT).
- **Plate weight target**: 5-50г depending on material density.

### Phase 1 acoustic-optimized размеры (refined v2)

| Material | h (мм) | W (мм) | Family |
|----------|--------|--------|--------|
| Spring steel / brass / aluminum | 0.3 / 0.5 / 0.4 | **55** (wide) | reverb (dense modes) |
| Oak (∥ grain) | 1.8 | 45 | wood (medium) |
| Slate (replaces marble) | 2.0 | 45 | stone (medium) |
| Glass (tempered) | 1.5 | **40** | chime (narrow=bar) |
| Nephrite (tough) | 2.0 | 45 | bell (medium) |
| Bone | 2.5 | **35** | percussion (narrow=bar) |

**De-risk для v1/bench Stage 0**: **W=50мм константа** (упрощает fixed contact-rig); variable W — refinement для v2 после R1 Stage 0 pass.

Подробности: см. `acoustic_modeling.md` §3/§10, `LAST_NIGHT_BUILD.md` "Картридж — механика", `decisions/11_cartridge_architecture_lock.md`.

## Common workflow (всех материалов)

1. **Source** — где взять raw material.
2. **Initial prep** — clean, defleshing, surface conditioning.
3. **Cutting** — к dimensions oversize.
4. **Drying / curing** — material-dependent.
5. **Final dimensioning** — cut к exact per-material h × W (см. таблицу выше).
6. **Sanding / polishing** — surface finish.
7. **Stabilization** — finish coat / coating (для acoustic preservation, не plastic-y).
8. **Acoustic test** — tap test, mass check, RT60 verification против `acoustic_modeling.md` predictions.
9. **Frame assembly** — install plate в раму с rubber damping rails + 4× polarized magnets + keying notch. **БЕЗ** установки exciter/пьезо/соленоида — они в модуле.
10. **QC** — mechanical fit test в module dock (retention, key alignment, contact-point seating).

## Per-material complexity matrix

| Material | Active time | Elapsed | Cost | Risk |
|----------|-------------|---------|------|------|
| Oak 100×45×1.8 (∥ grain) | 1 hour | 2 days | $5 | Low |
| Slate 100×45×2.0 (replaces marble) | 1 hour | 1 day | $15 | Medium (heavy/fragile) |
| Brass 100×55×0.5 | 30 min | 1 day | $25 | Low |
| Aluminum 100×55×0.4 | 30 min | 1 day | $15 | Low |
| Spring steel 100×55×0.3 | 30 min | 1 day | $10 | Low |
| Tempered glass 100×40×1.5 | 1 hour | 3 days | $20 | High (fragile, hazardous edges) |
| **Bone (scapula) 100×35×2.5** | **4 hours** | **5–7 weeks** | **$11** | **High (multi-week, smell, PPE)** |
| **Nephrite (Sayan) 100×45×2.0** | **4.5 hours** | **1–2 weeks** | **$90–110** | **Medium-high (lapidary, silicate dust, diamond tools)** |
| **Nephrite (Hetian premium) 100×45×2.0** | **5–6 hours** | **2–3 weeks** | **$200–300** | **Same + premium sourcing** |
| Copper 100×55×0.5 | 30 min | 1 day | $30 | Low |
| Titanium 100×55×0.4 | 1 hour | 2 days | $50 | Medium |
| Studio stack (steel ×3 detuned) | 1.5 hours | 1 day | $35 | Medium (alignment, mount bar) |

## Sourcing summary

| Material | Source |
|----------|--------|
| Wood | Local carpenter, instrument lumber yard |
| Stone | Stone supplier, kitchen counter shop |
| Metal | Metal supply distributor, online metals (Online Metals, McMaster-Carr) |
| Glass | Laboratory glass supplier (Pyrex / borosilicate) |
| Bone | Butcher (food byproduct) или craft supplier |
| Nephrite (Sayan) | Russian lapidary supplier ($30–80/kg rough slab, Буромское/Кавоктинское/Оспинское месторождения) |
| Nephrite (Hetian premium) | Chinese lapidary supplier ($200–1000/kg, certified provenance) |
| Nephrite (pounamu NZ) | Ngāi Tahu treaty-compliant supplier ($150–500/kg, требует certificate) |
| Titanium | Aerospace metal supplier (premium tier) |

## Status

Phase 1 launch catalog (acoustic-optimized, 6 cartridges):
- Spring steel 100×55×0.3 — `03_metal_processing.md`.
- Brass 100×55×0.5 — `03_`.
- Aluminum 100×55×0.4 — `03_`.
- Oak (∥ grain) 100×45×1.8 — `01_wood_processing.md` priority.
- Slate 100×45×2.0 — `02_stone_processing.md` (replaces marble).
- Glass (tempered) 100×40×1.5 — `04_glass_processing.md`.

Phase 2 additions:
- **Nephrite (Sayan / Hetian / pounamu) 100×45×2.0 — `07_nephrite_processing.md` (готов v2)**.
- **Cattle bone 100×35×2.5 — `05_bone_processing.md` (готов v2)**.
- Copper 100×55×0.5 — extending `03_`.
- Titanium 100×55×0.4 — `03_`.
- Studio stack (steel ×3 detuned) — `03_` flagship.

## Workshop common tools

Across all cartridge types:
- **Calipers** (digital): $20.
- **Granite flat stone / glass plate** для flatness check: $15.
- **Sanding blocks** (3D-printed PETG flat).
- **Sandpaper assortment** 80/120/220/400/600/800/1000/1500-grit.
- **Wet tile saw** (для bone, stone, glass): $80–150.
- **Bandsaw** (для wood, soft metals): $300+.
- **Bench grinder + buffing wheel** (optional polishing): $80.
- **Acoustic test kit**: pencil eraser (tap source), digital scale (weight), стереомикрофон + DAW для RT60 measurement.
- **PPE**: N95 masks, nitrile gloves, eye protection, ear protection.

## Brand consistency

Каждая готовая cartridge получает **laser-etched serial** на frame:
```
SYSTEM SUICIDE
LAST NIGHT
[material]
SN: 0001
```

Documented в registry: source date, processing batch, RT60 measurement, builder initials, retail tier.

> *Plates are stories.* Каждый cartridge — отдельный exemplar материала, чуть отличается от соседа. Customer чувствует это в звуке.