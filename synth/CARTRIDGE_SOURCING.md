# LAST NIGHT — Transducer (module) & Plate Material (cartridge) Sourcing

**Версия**: v6.5 (Decision 11 — plate-only cartridge architecture)
**Назначение**: procurement двух раздельных населений: (1) **module transducers** ×модули, (2) **plate cartridges** ×картриджи.
**Парные документы**: `decisions/11_cartridge_architecture_lock.md`, `BOM_SOURCING.md` (module electronics), `acoustic_modeling.md` §10 (plate dimensions).

> **⚠ Decision 11 архитектура**: картридж = **пассивная пластина** (материал + покрытие + рамка + магниты). Трансдьюсеры (exciter/пьезо/соленоид) — **в модуле**, ×модули. Это разводит два населения компонентов — раньше (ошибочно) всё считалось ×картриджи.

> **По ссылкам**: домен магазина + точный P/N. Deep-product URL не фабрикую (внутренние store-ID → битые ссылки). Поиск по P/N → продукт надёжно.

---

## 0A. Module transducers (×модули — фиксированы в педали/Eurorack)

Каждый модуль содержит **transducer engine bay** (Decision 11):

| Компонент | Кол-во/модуль | P/N | Магазин | Unit $ |
|-----------|---------------|-----|---------|--------|
| Surface exciter | 1 | **DAEX32Q-4** (universal — handle light+dense) | parts-express.com · daytonaudio.com | $20 |
| Piezo contact pin | 2 | spring-loaded pogo + 27mm piezo OR contact pin | Mouser (pogo) + Tayda (piezo) | $1 ea |
| Solenoid 5V push | 1 | Adafruit 412 / bulk JF-0530B | adafruit.com / aliexpress | $1.5-5 |
| Exciter spring carriage | 1 | compression spring + bracket | mcmaster.com | $1 |
| Internal shielded wire | — | piezo→JFET short run | — | $0.50 |

> **Universal DAEX32Q-4** (Decision 11 open-question resolved option A): один exciter type на все модули, handle и лёгкие и dense пластины. Driver amp (Block 4) спроектирован с запасом. Один module SKU.

### Module transducer batch (×28 модулей: 14 EU + 14 pedal)

| Item | Qty (28 +буфер) | Unit $ | Subtotal |
|------|-----------------|--------|----------|
| DAEX32Q-4 | 28 → 32 | $20 | $640 |
| Piezo + pogo pins | 56 → 64 | $1 | $64 |
| Solenoid | 28 → 32 | $5 | $160 |
| Spring carriage + brackets | 28 → 32 | $1 | $32 |
| **Σ module transducers** | | | **~$900** |

→ Трансдьюсеры теперь **one-time module cost ~$32/модуль**, не per-cartridge $25-30.

---

## 0B. Plate cartridges (×картриджи — пассивные, дёшевы)

Каждый картридж содержит **только**:

| Компонент | Кол-во/cartridge | Назначение |
|-----------|------------------|------------|
| Plate (материал) | 1 | Резонатор 100×53×h |
| Покрытие | — | Дерево: linseed/shellac. Металл: anodize опц. |
| Frame | 1 | PETG (proto) / anodized alu (prod), 110×65×30мм |
| Neodymium magnet N42 Ø6×3 | 4 | Retention + keying (polarized) |
| Keying notch | — | Asymmetric, single-orientation |

**НЕТ**: exciter, пьезо, соленоид, разъёмов, электроники.

**Cartridge cost**: пластина $5-15 + рамка $3 + магниты $1.2 = **~$10-20**. Razor-blade viable.

---

## 1. Plate material stock — supplier per material (cartridge-side)

> Decision 11: exciter в модуле (universal DAEX32, см. §0A) — НЕ per-cartridge. Картридж = пластина + рамка + магниты. Эта секция = plate material + magnets.

### Magnets (cartridge retention + keying)

| P/N | Описание | Магазин | Unit $ | Note |
|-----|----------|---------|--------|------|
| **N42 Ø6×3mm disc** | neodymium disc magnet | kjmagnetics.com (P/N D43) · supermagnete.de · AliExpress bulk | $0.30 | 4/cartridge. **Polarized для keying** (single-orientation). |

### Plate material stock

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
| Felt (solenoid tip) | adhesive felt dot | craft/hardware | Soft strike on plate. Module-side (на solenoid plunger). |
| Frame damping | rubber/foam strip | mcmaster | Между frame и plate edges → frame не резонирует. |

> Coupling pad / VHB / spring carriage — теперь **module-side** (transducer engine bay), см. §0A + `decisions/11`.

---

## 5. Production batch plan — два населения раздельно

### Модули (×28: 14 EU + 14 pedal)

Transducer engine bay per module — см. §0A. **Σ module transducers ~$900** (28 units +буфер).

### Картриджи (× cartridge count — business decision, см. §5.1)

Картридж = пластина + рамка + 4 магнита + покрытие. **~$10-20 каждый**, без трансдьюсеров.

| Cartridge | Plate stock | Магниты | Coating |
|-----------|-------------|---------|---------|
| LN-STEEL | steel sheet нарезка | 4× N42 | raw / lacquer |
| LN-OAK | oak stock | 4× N42 | linseed/shellac |
| LN-BRASS | brass sheet | 4× N42 | raw / patina |
| LN-ALU | alu sheet | 4× N42 | anodize опц. |
| LN-GLASS | tempered cut | 4× N42 | — |
| LN-SLATE | slate offcuts | 4× N42 | — |
| LN-BONE | processed bone | 4× N42 | sealed |
| LN-JADE | nephrite slab | 4× N42 | polished |
| LN-MARBLE | marble offcut | 4× N42 | — |
| LN-STUDIO | steel ×3 stack | 4× N42 | raw |

### §5.1 Cartridge quantity — зависит от business model

| Модель | Картриджей на 28 модулей | Plate+magnet cost |
|--------|--------------------------|-------------------|
| **A. Стартовый 1/модуль + малый сток** | ~58 | ~$700-1100 |
| **B. Bundle "все картриджи"** (€3640 marketing) | 28 × набор (6-10) = 168-280 | $2000-5000 |
| **C. Картриджи отдельная product line** | независимый сток | по плану |

> **Требует решения**: какая модель? Маркетинг-страница (€3640 "все картриджи") = модель B.

---

## 6. Sourcing risks

| Риск | Mitigation |
|------|------------|
| **DAEX32 backorder** | Parts Express периодически out. Буфер заранее (×28 → 32), мониторить. Visaton FRS 5X backup. |
| **Contact coupling acoustic variance** (Decision 11 new risk) | Spring-loaded calibrated force. Tap-test с contact mechanism (не свободной пластиной). Bench A/B contact pressure. |
| **Nephrite quality variance** | Натуральный камень — select-grade slabs, reject cracked. См. processing manual. |
| **Bone processing labor** | DIY-intensive (05_bone_processing). Premium pricing justified. |
| **Tempered glass custom cut** | MOQ у glass cutters. Batch order. |
| **Solenoid felt + plate wear** | Strike point wears felt + plate. Replaceable felt tip (module-side) + maintenance note. |
| **Plate thickness variance** (0.3-3мм) | Spring carriage travel ±2mm компенсирует. Verify contact force across range. |

> **Mini-XLR устранён** (Decision 11 — пьезо в модуле, internal wiring). Экономия $1920 + проще сборка.

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
