# Cartridge processing manuals

Производственные guides для cartridge plates по типам материалов. Каждый материал имеет свой workflow от raw к готовой пластине.

## Содержание каталога

| File | Status | Material | Complexity |
|------|--------|----------|------------|
| `01_wood_processing.md` | TODO | Oak, maple, ebony, birch | Low |
| `02_stone_processing.md` | TODO | Marble, slate, granite, nephrite | Medium |
| `03_metal_processing.md` | TODO | Brass, copper, spring steel, titanium | Medium |
| `04_glass_processing.md` | TODO | Pyrex borosilicate | High (fragile) |
| **`05_bone_processing.md`** | **Draft v1** | **Cattle scapula** | **High (multi-week)** |
| `06_assembly.md` | TODO | Common cartridge assembly | — |

## Cartridge specification (универсальная)

Все cartridges share формат:

- **Plate dimensions**: длина 100мм fixed; высота 20–60мм per material; толщина 0.5–6мм per material.
- **Frame**: 110×65×30мм (PETG print prototype, фрезерованный алюминий production).
- **Mount**: 4× neodym N42 magnets + spring-loaded retention pin.
- **Connectors**: 2× mini-XLR (Piezo A, B), 2× JST-XH (Exciter, Solenoid).
- **Plate weight target**: 8–80г depending on material density.

Подробности: см. `LAST_NIGHT_BUILD.md` секцию "Картридж — механика и сборка".

## Common workflow (всех материалов)

1. **Source** — где взять raw material.
2. **Initial prep** — clean, defleshing, surface conditioning.
3. **Cutting** — к dimensions oversize.
4. **Drying / curing** — material-dependent.
5. **Final dimensioning** — cut к dimensions exact.
6. **Sanding / polishing** — surface finish.
7. **Stabilization** — finish coat (для acoustic preservation, не plastic-y).
8. **Acoustic test** — tap test, mass check, RT60 verification.
9. **Assembly** — install в frame, mount exciter + piezos + solenoid.
10. **QC** — final functional test before packaging.

## Per-material complexity matrix

| Material | Active time | Elapsed | Cost | Risk |
|----------|-------------|---------|------|------|
| Oak (raw) | 1 hour | 2 days | $5 | Low |
| Oak (linseed) | 1.5 hour | 1 week | $6 | Low |
| Maple (shellac) | 2 hours | 2 weeks | $8 | Low |
| Marble | 1 hour | 1 day | $25 | Medium (heavy/fragile) |
| Brass | 30 min | 1 day | $30 | Low |
| Spring steel | 30 min | 1 day | $20 | Low |
| Pyrex glass | 1 hour | 3 days | $25 | High (fragile, hazardous edges) |
| **Bone (scapula)** | **4 hours** | **5–7 weeks** | **$11** | **High (multi-week, smell, PPE)** |
| Titanium | 1 hour | 2 days | $50 | Medium |

## Sourcing summary

| Material | Source |
|----------|--------|
| Wood | Local carpenter, instrument lumber yard |
| Stone | Stone supplier, kitchen counter shop |
| Metal | Metal supply distributor, online metals (Online Metals, McMaster-Carr) |
| Glass | Laboratory glass supplier (Pyrex / borosilicate) |
| Bone | Butcher (food byproduct) или craft supplier |
| Titanium | Aerospace metal supplier (premium tier) |

## Status

Phase 1 launch catalog (6 cartridges):
- Oak raw — `01_wood_processing.md` priority.
- Oak linseed — `01_`.
- Maple shellac — `01_`.
- Marble — `02_stone_processing.md`.
- Brass — `03_metal_processing.md`.
- Spring steel — `03_`.

Phase 2 additions:
- Ebony, nephrite, copper — extending `01_` and `03_`.
- Pyrex glass — `04_glass_processing.md`.
- **Cattle bone — `05_bone_processing.md` (готов)**.
- Titanium — `03_`.

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