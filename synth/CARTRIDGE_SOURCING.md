# LAST NIGHT — Cartridge Transducer & Material Sourcing

**Версия**: v6.4 canon
**Назначение**: procurement transducers + plate materials для cartridge production. Scaling по **cartridge count** (не unit count) — каждый картридж содержит свой набор.
**Парные документы**: `BOM_SOURCING.md` (module electronics), `acoustic_modeling.md` §10 (cartridge dimensions), `cartridges/*.md` (material processing).

> **По ссылкам**: даю **домен магазина + точный P/N**. Deep-product URL не привожу — они содержат внутренние store-IDs (например `mouser.com/ProductDetail/...?qs=РАНДОМ`), которые невозможно достоверно сгенерировать; guessed-ссылки = битые. Поиск по P/N на сайте магазина → продукт за 5 секунд, надёжно.

---

## 0. Что в каждом картридже

Все cartridges (110×65×30мм frame) содержат:

| Компонент | Кол-во/cartridge | Назначение |
|-----------|------------------|------------|
| Plate (материал) | 1 | Резонатор (100×53мм, толщина per material) |
| Surface exciter | 1 | DAEX25 (light) или DAEX32 (dense) |
| Piezo disc 27mm | 2 | Pickup A + B |
| Solenoid 5V push | 1 | DAMP/TOLL/STALL |
| Neodymium magnet N42 Ø6×3 | 4 | Retention + keying (polarized) |
| Mini-XLR TA3F | 2 | Piezo A/B audio out |
| JST-XH 2-pin | 2 | Exciter + solenoid wiring |
| Cartridge frame | 1 | PETG (proto) / anodized alu (prod) |
| Coupling pad (silicone) | 1 | Exciter mount |
| VHB tape | — | Piezo bonding |

---

## 1. Exciter selection per material (по массе plate)

Масса plate определяет exciter: DAEX25 для <30г, DAEX32 для >30г (mass loading).

| Cartridge | Материал | h (мм) | Объём (мм³) | Масса (г) | Exciter |
|-----------|----------|--------|-------------|-----------|---------|
| LN-STEEL | spring steel | 0.3 | 1590 | 12.5 | **DAEX25FHE-4** |
| LN-ALU | aluminum | 0.4 | 2120 | 5.7 | **DAEX25FHE-4** |
| LN-OAK | oak | 2.0 | 10600 | 7.4 | **DAEX25FHE-4** |
| LN-GLASS | tempered glass | 1.5 | 7950 | 19.9 | **DAEX25FHE-4** |
| LN-BRASS | brass | 0.5 | 2650 | 22.5 | **DAEX25FHE-4** |
| LN-BONE | beef bone | 2.5 | 13250 | 25.2 | **DAEX25FHE-4** |
| LN-SLATE | slate | 2.0 | 10600 | 29.2 | **DAEX25FHE-4** (borderline) |
| LN-JADE | nephrite | 2.5 | 13250 | 39.8 | **DAEX32Q-4** |
| LN-MARBLE | marble | 3.0 | 15900 | 42.9 | **DAEX32Q-4** |
| LN-STUDIO | steel ×3 stack | 0.3×3 | — | ~37.5 + bar | **DAEX32Q-4** |

→ **DAEX25** для 7 cartridge types, **DAEX32** для 3 (jade/marble/studio stack).

---

## 2. Transducers — supplier + P/N

### Exciters

| P/N | Описание | Магазин (домен) | Unit $ | Note |
|-----|----------|------------------|--------|------|
| **DAEX25FHE-4** | Dayton 25mm exciter, 4Ω, low-mass | parts-express.com (Dayton direct: daytonaudio.com) · также Mouser | $14 | Core. Light/medium plates. |
| **DAEX32Q-4** | Dayton 32mm exciter, 4Ω, higher power | parts-express.com · daytonaudio.com | $20 | Dense plates (jade/marble/stack). |

> Parts Express (parts-express.com) — primary Dayton stock. Dayton Audio direct (daytonaudio.com) тоже. Mouser carries DAEX25 (search "DAEX25FHE-4"). Часто backorder — заказывать заранее с буфером.

### Piezo pickups

| P/N | Описание | Магазин | Unit $ | Note |
|-----|----------|---------|--------|------|
| **27mm brass piezo disc** | bare piezo element 27mm | taydaelectronics.com (search "27mm piezo") · Mouser · AliExpress bulk | $0.30 | 2/cartridge. Cheap. Premium: PVDF film. |
| **PVDF film** (premium) | piezoelectric film sensor | Mouser (search "Measurement Specialties LDT0") · TE Connectivity | $5 | Premium cartridge — wider freq, less resonant peak. |

### Solenoid

| P/N | Описание | Магазин | Unit $ | Note |
|-----|----------|---------|--------|------|
| **Adafruit 412** | 5V push-pull solenoid ~5N | adafruit.com (P/N 412) | $5 | DAMP/TOLL/STALL. Felt tip добавить. |
| **ROB-11015** | Sparkfun mini push solenoid | sparkfun.com | $5 | Alternative. |
| generic 5V JF-0530B | bulk push solenoid | aliexpress.com (bulk MOQ) | $1.5 | Production bulk — qualify sample first. |

### Magnets

| P/N | Описание | Магазин | Unit $ | Note |
|-----|----------|---------|--------|------|
| **N42 Ø6×3mm disc** | neodymium disc magnet | kjmagnetics.com (P/N D43 ≈ Ø1/4×3/16) · supermagnete.de · AliExpress bulk | $0.30 | 4/cartridge + 4/dock. **Polarized для keying** (см. PCB §6.1). |

### Connectors (cartridge side)

| P/N | Описание | Магазин | Unit $ | Note |
|-----|----------|---------|--------|------|
| **Switchcraft TA3FX** | mini-XLR 3-pin female | Mouser · DigiKey (search "TA3FX") | $6 | 2/cartridge. Piezo audio. |
| **JST B2B-XH-A** | XH 2-pin header | Mouser · DigiKey · Tayda | $0.15 | 2/cartridge. Exciter + solenoid. |

---

## 3. Plate material stock — supplier per material

| Материал | Spec | Магазин (домен) | Note |
|----------|------|------------------|------|
| **Spring steel 0.3мм** | shim/spring steel sheet 1095 | mcmaster.com (search "1095 spring steel shim 0.012in") · onlinemetals.com | Cut to 100×53. Cheap. Buffer stock. |
| **Brass 0.5мм** | brass sheet C260 | mcmaster.com · onlinemetals.com (search "brass sheet 0.020in") | Cut to size. |
| **Aluminum 0.4мм** | aluminum sheet 5052 | mcmaster.com · onlinemetals.com | Cut. Anodize optional (coating tuning). |
| **Oak 2мм** | quartersawn oak veneer/thin stock | luthier suppliers (lmii.com, stewmac.com) · local carpenter | Along-grain orientation. Linseed/shellac finish options. |
| **Tempered glass 1.5мм** | custom-cut tempered glass | local glass cutter · cutmyglass.com class | Tempered для durability. Custom cut 100×53. |
| **Slate 2мм** | roofing/craft slate | stone/tile supplier · local roofer offcuts · etsy lapidary | Splits thin naturally. Replaces marble. |
| **Beef bone 2.5мм** | processed bovine bone | DIY — см. `cartridges/05_bone_processing.md` | Butcher source + processing protocol. |
| **Nephrite 2.5мм** | jade slab/tile | lapidary suppliers · etsy (search "nephrite slab") · jade供应 AliExpress | См. `cartridges/07_nephrite_processing.md`. Premium. |
| **Marble 3мм** | marble tile offcut | stone/tile supplier · local countertop fabricator scrap | Novelty tier. |

> Metal stock (steel/brass/alu): **McMaster-Carr (mcmaster.com)** или **OnlineMetals (onlinemetals.com)** — sheet stock cut-to-size. Buy один большой лист → нарезать много пластин (1 лист 300×300мм → ~30 пластин 100×53).

---

## 4. Cartridge frame + mechanical

| Item | Spec | Магазин | Note |
|------|------|---------|------|
| Frame (prototype) | PETG 3D-print | local / printables design | 110×65×30mm. Iterate cheaply. |
| Frame (production) | anodized aluminum CNC | pcbway.com (CNC service) · jlccnc.com | Production qty. Asymmetric keying notch. |
| Coupling pad | silicone sheet 2мм | mcmaster.com (search "silicone rubber sheet 40A") | Exciter mount cut to ~25mm disc. |
| VHB tape | 3M VHB 5952 | Mouser · 3M · amazon | Piezo bonding (durable). |
| Retention pin | spring-loaded Ø3 plunger | mcmaster.com (search "spring plunger") | Cartridge lock. |
| Felt (solenoid tip) | adhesive felt dot | craft/hardware | Soft strike on plate. |

---

## 5. Production batch plan (sample — Phase 1)

Допустим Phase 1: **20 modules + cartridge stock**. Cartridge mix (не все типы равны — steel/oak популярнее):

| Cartridge | Batch qty | Exciter | Plate stock | Buffer |
|-----------|-----------|---------|-------------|--------|
| LN-STEEL | 30 | DAEX25 ×30 | 1× steel sheet 300×300 | +5 |
| LN-OAK | 25 | DAEX25 ×25 | oak stock | +5 |
| LN-BRASS | 15 | DAEX25 ×15 | brass sheet | +3 |
| LN-ALU | 15 | DAEX25 ×15 | alu sheet | +3 |
| LN-GLASS | 15 | DAEX25 ×15 | tempered cut ×18 | +3 |
| LN-SLATE | 15 | DAEX25 ×15 | slate offcuts | +3 |
| LN-BONE | 10 | DAEX25 ×10 | processed bone | +2 |
| LN-JADE | 10 | DAEX32 ×10 | nephrite slab | +2 |
| LN-MARBLE | 8 | DAEX32 ×8 | marble offcut | +2 |
| LN-STUDIO | 8 | DAEX32 ×8 | steel ×3 ea | +2 |
| **Σ cartridges** | **151** | DAEX25 ×120 / DAEX32 ×26 | — | — |

### Transducer batch totals

| Item | Qty (151 cartridges + буфер) | Unit $ | Subtotal |
|------|------------------------------|--------|----------|
| DAEX25FHE-4 | 120 → 130 | $14 | $1820 |
| DAEX32Q-4 | 26 → 30 | $20 | $600 |
| Piezo 27mm | 302 → 330 | $0.30 | $99 |
| Solenoid (Adafruit 412 / bulk) | 151 → 165 | $1.5-5 | $250-825 |
| Magnets N42 (4/cartridge + 4/dock×20) | 684 → 750 | $0.30 | $225 |
| Mini-XLR TA3FX | 302 → 320 | $6 | $1920 |
| JST-XH | 302 → 320 | $0.15 | $48 |
| **Σ transducers** | | | **~$5000-5600** |

> **Mini-XLR доминирует** ($1920) — рассмотреть Rean NYS321 ($2-3) для budget cartridges, Switchcraft только premium.

---

## 6. Sourcing risks (cartridge-specific)

| Риск | Mitigation |
|------|------------|
| **DAEX25/32 backorder** | Parts Express периодически out. Заказывать буфер заранее, мониторить stock. Visaton FRS 5X backup. |
| **Nephrite quality variance** | Натуральный камень — variance в density/inclusions. Select-grade slabs, reject cracked. См. processing manual. |
| **Bone processing labor** | DIY-intensive (см. 05_bone_processing). Premium pricing justified. |
| **Tempered glass custom cut** | MOQ у glass cutters. Batch order. |
| **Mini-XLR cost** | $6×302 = $1920. Rean alternative для budget cartridges. |
| **Solenoid felt wear** | Strike point wears felt + plate. Replaceable felt tip + maintenance note. |

---

## 7. Supplier domain reference (для поиска по P/N)

| Категория | Магазины (домены) |
|-----------|-------------------|
| Electronics broad | mouser.com · digikey.com |
| Commodity cheap | taydaelectronics.com · aliexpress.com (bulk) |
| Exciters | parts-express.com · daytonaudio.com |
| Solenoid | adafruit.com · sparkfun.com |
| Magnets | kjmagnetics.com · supermagnete.de |
| Metal stock | mcmaster.com · onlinemetals.com |
| Luthier wood | lmii.com · stewmac.com |
| Lapidary (jade/slate) | etsy.com · lapidary suppliers |
| Eurorack pots/jacks | thonk.co.uk · lovemyswitches.com · smallbear-electronics.com |
| PCB + CNC | jlcpcb.com · pcbway.com |

> Заказ: открыть домен → поиск по P/N из таблиц §2-4 → продукт. P/N надёжнее deep-link (не протухает).

---

**End of cartridge sourcing v6.4. Топ-приоритет: DAEX25/32 буфер (backorder risk) + mini-XLR cost decision (Switchcraft vs Rean per tier).**
