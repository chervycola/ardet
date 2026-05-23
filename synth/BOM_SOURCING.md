# LAST NIGHT — BOM Sourcing & Procurement Guide

**Версия**: v6.4 canon
**Назначение**: practical purchasing guide для small-batch production (target 20 units). Part numbers, дистрибьюторы, qty, преимущества, альтернативы.
**Парный документ**: `decisions/10_premium_components_sourcing.md` (Elite tier deep-dive).

> **Как пользоваться**: каждая строка = manufacturer P/N + дистрибьютор. Заказ — поиск по P/N на сайте дистрибьютора (URL не привожу — P/N стабильнее ссылок, ссылки протухают). Колонка Qty/20 = сколько нужно на партию 20 units. Редкие/sole-source — с буфером (+spare).

## 0. Small-batch стратегия

- **Партия**: 20 units (Phase 1 budget SKU baseline).
- **Редкие компоненты** (sole-source, EOL-risk, long-lead): закупать **буфер +20-30%** сразу (15-20 → 25-30 шт). Дешевле перезаказа + страховка от EOL.
- **Commodity** (multi-source jellybean): заказывать по точному count + 10% spare для брака.
- **Дистрибьюторы**: Mouser / Digi-Key (основные, всё в наличии), Thonk / Love My Switches / Small Bear (Eurorack/pedal-specific), Parts Express / Dayton direct (exciters), Tayda (commodity дёшево).

---

## 1. Tier A — Критичные / редкие (буфер обязателен)

Эти определяют звук или single-source. Закупать с запасом, проверять stock заранее.

| Ref | P/N | Производитель | Дистрибьютор | Qty/20 (+буфер) | Unit $ | Преимущество / особенность | Альтернатива |
|-----|-----|---------------|--------------|------------------|--------|---------------------------|--------------|
| **Q3** | **LSK489A** | Linear Integrated Systems | Mouser, DigiKey, LIS direct | **20 → 30** | $6.00 | Dual matched JFET, ~1.8 nV/√Hz. **Noise cornerstone** — заменяет EOL 2N5457. Sole practical source. | 2SK170BL pair (matched вручную, разный footprint) — но хуже matching |
| **U5/U6/U7** | **LM13700N** | TI | Mouser, DigiKey | 60 → 70 | $2.00 | Dual OTA. VCA + noise xfade + phaser. Industry standard, но проверять stock (периодически backorder). | NE5517 (almost drop-in), LM13600 (NOS) |
| **Exciter** | **DAEX32Q-4** | Dayton Audio | Parts Express, Mouser | **per module ×28** (Decision 11 — в модуле, не в картридже) | $20 | Universal surface exciter 4Ω. В transducer engine bay. Often backorder. | Visaton EX 60 S, DAEX25FHE-4 (lighter) |
| **DC-DC** (pedal) | **TMR 3-1222WI** | TRACO Power | Mouser, DigiKey | 20 → 24 | $13 | Isolated ±12V 125mA, 3W. Audio-grade noise. Pedal SKU only. | Recom RxxD-1212 (verify dual ±12V P/N) (250mA, premium), Mornsun 1212S-1WR3 |
| ~~Mini-XLR TA3F/TA3M~~ | — | — | — | **0 (устранён, Decision 11)** | — | Пьезо теперь module-internal, разведён коротким shielded проводом к JFET. Swappable mini-XLR не нужен. Экономия ~$1920. | — |
| **Piezo pickup** | 27mm disc + spring contact pin | various | Tayda + Mouser (pogo) | **2/module ×28 = 56 (+6 буфер)** | $1 | Module-side contact pickup (Decision 11). A near / B far. | PVDF film premium |
| **MCU** | **ATtiny84A-PU** | Microchip | Mouser, DigiKey | 20 → 25 | $1.50 | 14-pin DIP, 12 GPIO + 8 ADC. v6.4 upgrade. Same toolchain как ATtiny85. | ATtiny44 (less flash, same pinout) |

**Tier A batch cost (20 units, +буфер)**: ~$800 (LSK489A dominant + LM13700 + DC-DC).

---

## 2. Tier B — Специализированные (moderate availability)

| Ref | P/N | Производитель | Дистрибьютор | Qty/20 | Unit $ | Преимущество | Альтернатива |
|-----|-----|---------------|--------------|--------|--------|--------------|--------------|
| RV (×17) | **RV09AF-10** Alpha 9mm | Alpha (Taiwan) | Thonk, Tayda, Mouser | 340 → 360 | $0.80-1.20 | 9mm vertical PCB-mount, Eurorack standard. Various tapers (log/lin). | Bourns PTV09 (similar) |
| Bank Mode slider | **SL-4P5T** (4-pole 5-throw) | — | ⚠ см. note | 20 → 25 | $5 | 5-position preset switch. **Sourcing risk** — 4P5T sliders редки. | **Альтернатива: rotary 4P5T** (Grayhill/Electroswitch) — надёжнее source |
| FG sliders (×3) | **SL-30** linear 30mm | Alpha/Bourns | Thonk, Mouser | 60 → 66 | $1.50 | Linear travel slider для rise/fall/depth. | PEC11R-derived, ALPS RSA0N |
| Footswitch (×4) | **3PDT latching** | various | Love My Switches, Tayda, Small Bear | 80 → 88 | $3 | Heavy-duty stomp, latching. TAP momentary variant. | Alpha 3PDT (cheaper, lower rating) |
| Relay (bypass) | **G6K-2F-Y** | Omron | Mouser, DigiKey | 20 → 24 | $2.50 | Signal relay для true-bypass. Low contact resistance. | Takamisawa, Panasonic TQ2 |
| LF398 | **LF398N** | TI | Mouser, DigiKey | 20 → 24 | $1.20 | Sample-and-hold (Crush cell). | LF398AN (premium grade) |
| Trim (×6) | **3296W** | Bourns | Mouser, DigiKey, Tayda | 120 → 132 | $0.80 | Multi-turn trim. Calibration pots (gate/crush/trig/toll/bias). | 3266W (smaller) |
| Solenoid (cartridge) | **412** push-type | Adafruit / generic 5V | Adafruit, AliExpress bulk | per cartridge | $5 | 5V push solenoid, ~5N. DAMP/TOLL/STALL. | Sparkfun ROB-11015 class |

> **⚠ SL-4P5T sourcing risk**: 4-pole 5-throw **slider** switches практически не существуют off-the-shelf. **Рекомендация**: использовать **rotary 4P5T** (Grayhill 56SD, Electroswitch) с slider-style knob cap для visual соответствия мокапу, ИЛИ кастомный slider от китайского производителя (MOQ ~500). Это **должно решиться до tooling** — flag для R&D.

**Tier B batch cost (20 units)**: ~$450 (pots + footswitches dominant).

---

## 3. Tier C — Commodity (multi-source, jellybean)

Заказывать по count +10% spare. Tayda дёшево для bulk.

| Ref | P/N | Дистрибьютор | Qty/20 | Unit $ | Note |
|-----|-----|--------------|--------|--------|------|
| TL072CP | TL072CP | Tayda, Mouser | 40 | $0.50 | Dual JFET op-amp |
| TL074CN | TL074CN | Tayda, Mouser | 60 | $0.75 | Quad JFET op-amp |
| LM393N | LM393N | Tayda, Mouser | 40 | $0.30 | Dual comparator |
| 74HC74 | SN74HC74N | Mouser, Tayda | 20 | $0.30 | D flip-flop |
| CD4066BE | CD4066BE | Tayda, Mouser | 20 | $0.40 | Quad analog switch |
| NE555P | NE555P | Tayda | 20 | $0.25 | Timer (TOLL) |
| 7805 | L7805CV | Tayda, Mouser | 20 | $0.30 | +5V LDO |
| BD139/BD140 | BD139 / BD140 | Mouser, Tayda | 40 ea | $0.30 | Push-pull pair |
| 2N7000 | 2N7000 | Tayda | 60 | $0.10 | MOSFET (×3/unit: solenoid/reset/mute) |
| 2N3904 | 2N3904 | Tayda | 140 | $0.03 | FG exp converters (×6) + freeze (×1). **Matched pairs** — buy reel, match по hFE |
| BZX55C9V1 | BZX55C9V1 | Mouser, Tayda | 20 | $0.10 | 9.1V zener (noise) |
| BAT85 | BAT85S | Mouser, Tayda | 1000 | $0.05 | Schottky CV-clamp (×~44/unit для 22 jacks ×2) + BLEACH/limiter. Buy 1000-reel. |
| 1N4148 | 1N4148 | Tayda | 400 | $0.01 | General (×~15/unit) |
| 1N5817 | 1N5817 | Tayda | 60 | $0.10 | Schottky reverse-protect |
| 1N4001 | 1N4001 | Tayda | 20 | $0.03 | Solenoid flyback |
| LED 3mm | various red/amber | Tayda | 240 | $0.02 | Indicators (×~12/unit) |

**Tier C batch cost (20 units)**: ~$200.

---

## 4. Passives — caps & resistors

| Тип | Spec | Дистрибьютор | Note |
|-----|------|--------------|------|
| Film caps (timing/audio) | **WIMA MKS2** 1µF/100nF/etc | Mouser, DigiKey | FG integrator, LFO, AC-couple. Low leakage critical для FG/envelope. ~12/unit |
| C0G/NP0 ceramic | matched 1nF (C_PE1=C_DE1!) | Mouser | Pre/de-emphasis MUST match — buy same batch, measure. Phaser C_AP. |
| Electrolytic | 1000µF (C_DC), 47µF, 10µF | Mouser, Tayda | C_DC 1000µF audio-grade (Nichicon FG/Panasonic FC). Bulk supply. |
| Resistors 1/4W MF 1% | E24 values | Tayda (bulk kit), Mouser | ~93/unit. Buy assortment kit + specific values bulk. Vishay MRS25 для precision (R-2R, matched). |

> **Critical matched pairs**:
> - C_PE1 = C_DE1 (pre/de-emphasis 1nF C0G) — из одной партии, измерить LCR.
> - R-2R ladder (Block 18 crush) — 0.1% Vishay MRS25.
> - 2N3904 exp converter pairs — match по hFE из reel (thermally coupled).

**Passives batch cost (20 units)**: ~$300 (caps dominant — WIMA film).

---

## 5. Mechanical & enclosure

| Item | Spec | Дистрибьютор | Note |
|------|------|--------------|------|
| Neodymium magnets | N42 Ø6×3mm | K&J Magnetics, AliExpress | 4/cartridge + 4/dock. Polarized для keying. |
| Piezo disc | 27mm brass | Tayda, Mouser | 2/cartridge. Pickup. |
| Cartridge frame | PETG print (proto) / anodized alu (prod) | local / PCBWay CNC | 110×65×30mm. |
| Panel | 2mm anodized alu | PCBWay, Front Panel Express | Eurorack 40HP / pedal 203×140. |
| Enclosure (pedal) | 203×140×50mm big-box | Tayda, Hammond | Big-box class. |
| Standoffs | M3 12mm / 3mm | Mouser, Tayda | Panel-PCB + dock. |
| VHB tape | 3M VHB acrylic | 3M / Amazon | Piezo bonding (durable vs CA/epoxy). |
| Silicone coupling pad | thin silicone sheet | McMaster | Exciter coupling. |

---

## 6. PCB fabrication

| PCB | Spec | Fab house | Qty/20 | Note |
|-----|------|-----------|--------|------|
| Main PCB | 203×128.5mm 4L FR4 1.6mm | JLCPCB, PCBWay | 20 → 25 | 4-layer mandatory. ENIG finish premium. |
| Adapters + satellites | 2L FR4 various | JLCPCB | 20 each | Panelize multiple satellites на одном panel для экономии. |

> **Panelize tip**: satellites (FG slider, Bank Mode, footswitch, cartridge dock, adapters) — все 2L, panelize на одном fab panel → 1 fab run для всех мелких PCB. Экономит setup cost.

---

## 7. Batch order summary (20 units, budget SKU)

| Tier | Описание | Cost (20 units +буфер) |
|------|----------|------------------------|
| A | Критичные/редкие (LSK489A, LM13700, exciter ×28, piezo ×56, DC-DC, MCU) | ~$1700 (incl. ×28 transducer engine) |
| B | Специализированные (pots, sliders, footswitch, relay, LF398, trim, solenoid) | ~$450 |
| C | Commodity ICs + discrete | ~$200 |
| Passives | Caps + resistors | ~$300 |
| Mechanical | Magnets, piezo, frames, panels, enclosures | ~$600 |
| PCB | Main 4L + satellites | ~$400 |
| **Итого материалы на 20 units** | | **~$2750** |
| **Per unit material cost** | | **~$137** |

> Соответствует BUILD BOM estimate ~$100-127/unit + mechanical/PCB overhead. **Transducer engine** (exciter/piezo/solenoid, Decision 11) — теперь часть module BOM ×28 (~$32/модуль), не per-cartridge. Plate cartridges (пассивные) — отдельно, ~$10-20 каждый (см. CARTRIDGE_SOURCING).

---

## 8. Lead time & risk register

| Компонент | Lead time | Риск | Mitigation |
|-----------|-----------|------|------------|
| **LSK489A** | 2-4 нед | EOL-аналоги вокруг, single practical source | Буфер 30 шт сразу. Мониторить LIS stock. |
| **LM13700N** | 1-4 нед | Периодический backorder | Буфер. NE5517 backup qualified. |
| **SL-4P5T slider** | ⚠ возможно custom MOQ | **Off-the-shelf почти нет** | **Решить до tooling**: rotary 4P5T или custom. |
| DAEX32 exciter | 1-2 нед | Иногда backorder | Буфер ×28→32 (module engine, Decision 11). Visaton backup. |
| TRACO DC-DC | 2-3 нед | OK | Standard. |
| Mini-XLR Switchcraft | 1 нед | OK, mating cycle wear long-term | Spec cycle rating, spare connectors. |
| WIMA film caps | 1-2 нед | OK | Buy matched batch для pre/de-emphasis. |
| 4L PCB | 1-2 нед (JLCPCB) | OK | — |

### Топ-3 sourcing блокера до production:
1. **SL-4P5T** — найти реальный part (rotary alt или custom). **Не существует off-the-shelf slider.**
2. **LSK489A** буфер — закупить 30 шт пока в наличии (EOL risk у JFET категории).
3. **Transducer engine** (exciter+piezo+solenoid) — scaling с **module count** (×28, Decision 11), не cartridge count. Plate cartridges пассивны (только материал+рамка+магниты).

---

## 9. Premium / Elite tier upgrades

Для premium SKU — см. `decisions/10_premium_components_sourcing.md`. Ключевые swaps:
- Op-amps TL07x → **OPA1612 / OPA1641** (audio-grade, Mouser)
- LSK489A → keep (already best)
- Exciter DAEX25 → **DAEX32Q-4** (dense plates)
- DC-DC TRACO → **Recom RxxD-1212 (verify dual ±12V P/N)** (250mA, lower noise)
- Pots Alpha → **Bourns PTV / ALPS RK09** (better feel)
- Film caps WIMA → **Mundorf / Wima FKP** (audiophile)

---

**End of BOM sourcing guide v6.4. Топ-приоритет: решить SL-4P5T + закупить LSK489A буфер.**
