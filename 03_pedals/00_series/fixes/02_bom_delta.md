# BOM delta — Last Night revised

Дельта BOM между оригинальным v2.1 и revised после fixes. Каждая замена: старая часть → новая, цена, reasoning, статус (BLOCKER/MAJOR/MINOR).

---

## Замены (swap existing parts)

| Ref | Было | Стало | Δ BOM | Причина |
|-----|------|-------|-------|---------|
| **Q3A, Q3B** | 2× 2N5457 TO-92 ($2) | 1× LSK489A SOT-23-6 ($6) | **+$4** | BLOCKER: 2N5457 EOL. LSK489A — dual matched JFET, auto-matching между channels. |
| **R8** | 4.7Ω 1/4W ($0.01) | 4.7Ω **5W wirewound** ($0.30) | **+$0.29** | MAJOR: рассеивает 3.8Вт peak. 1/4W сгорит. Panasonic ERG-5SJ4R7. |
| **R_DAM1** | 100кΩ 1/4W ($0.01) | **47кΩ** 1/4W ($0.01) | $0 | MAJOR: divider ratio меняется с 0.5 на 0.68 → solid MOSFET turn-on при CV 5В. |
| **Q4** | BC547 TO-92 ($0.05) | **BZX55C9V1** zener DO-35 ($0.10) | **+$0.05** | MAJOR: BC547 reverse avalanche parameter spread + degradation. Zener имеет specified noise spec. |
| **R20** | 100кΩ (для BC547) | **10кΩ** (для zener current set) | $0 | Сопровождает Q4 замену. |
| **C_ENV** | 1µФ electrolytic ($0.05) | **220нФ film ($0.15)** | +$0.10 | MAJOR: τ = 48мс instead of 1 секунды. Film low leakage. |
| **RV_ATTACK** | 1МΩ log ($1.5) | **220кΩ log ($1.5)** | $0 | Сопровождает C_ENV. Музыкально полезный attack range. |
| **C_DC** | 220µФ 25В ($0.15) | **1000µФ 25В ($0.30)** | **+$0.15** | MAJOR: corner 18Hz вместо 83Hz. Bass extension. Panasonic EEU-FR. |
| **C_PE1, C_DE1** | 1нФ ceramic ±20% | **1нФ C0G/NP0 ±5%** (matched, same batch) | +$0.02 | MINOR: matching критично для compensation. Murata GRM1885C1H102JA01D. |
| **D1, D2** | 2× Red LED 3мм ($0.05) | **6× Red LED 3мм** (3 серии с каждой стороны) ($0.15) | +$0.10 | MINOR: клип-порог поднимается с +1.2dBu до +10.6dBu (линия-level safe). |

**Замены total**: +$4.71 per module.

---

## Дополнения (new parts)

| Ref | Part | Кол-во | Цена | Причина |
|-----|------|--------|------|---------|
| **D_BIAS1, D_BIAS2** | 1N4148 | 2 | $0.02 | IMMEDIATE: Class AB bias для push-pull. |
| **R_BIAS1, R_BIAS2** | 1кΩ 1/4W | 2 | $0.02 | IMMEDIATE: bias current set для push-pull diodes. |
| **D_ENV_ATK, D_ENV_DEC** | 1N4148 | 2 | $0.02 | MEDIUM: independent A/D paths для envelope follower. |
| **J_PA, J_PB** | Mini-XLR TA3M (на модуле) | 2 | $6 | BLOCKER: shielded connector для piezo vs JST antenna. |
| **TA3F (на картридже)** | Mini-XLR female | 2 | $6 | BLOCKER: пара к TA3M, на cartridge side. |
| **Coax cable (внутри картриджа)** | RG-174 or sub-mini | 2× 50мм | $1 | BLOCKER: shielded signal path piezo → connector. |
| **Notch filter components** (if SPICE shows instability) | 1× inductor 10мГн, 1× cap 1µФ, 1× resistor | 3 | $3 | SHORT: feedback loop stability. Conditional. |
| **Input ESD clamp** | 1N4148 pair + 100Ω | 3 | $0.10 | LONG: ESD protection on input jack. |
| **LFO sub-circuit** (if pedal version keeps knobs) | 3× pot, 2× cap, 2× R, 1× unused ОУ half | 7 | $5 | LONG: для педальной версии, implement panel knobs. |

**Дополнения total**: 
- Без conditional: +$13.14 per module (mostly mini-XLR cost).
- С conditional: +$21 per module.

---

## Новые "невидимые" компоненты (в schematic были, но не в BOM v2.1)

Эти компоненты присутствуют в каркасе `wood_reverb_logical_schematic.html`, но не были явно в brief v2.1. Должны быть в BOM:

| Ref | Value | Кол-во | Назначение | Цена |
|-----|-------|--------|-----------|------|
| **C_B3** | 47µФ electrolytic | 1 | Extra bulk supply | $0.10 |
| **R_XBIAS** | 47кΩ | 1 | U4D non-inv bias | $0.01 |
| **R_XFB** | 47кΩ | 1 | U4D feedback | $0.01 |
| **R_CLB** | 100кΩ | 1 | CLIP_NODE pulldown | $0.01 |
| **R_MNI** | 47кΩ | 1 | U2D non-inv bias | $0.01 |
| **R_MCV** | 100кΩ | 1 | CV MIX input | $0.01 |
| **C_HA, C_HB** | 100pF | 2 | HF compensation в preamp feedback | $0.06 |
| **R_SA, R_SB** | 4.7кΩ | 2 | JFET source resistors | $0.02 |
| **R_BA, R_BB** | 4.7кΩ | 2 | JFET gate bias feed | $0.02 |
| **R_RA, R_RB** | 1кΩ | 2 | Preamp gain set | $0.02 |
| **R_GA, R_GB** | 22кΩ | 2 | Preamp feedback | $0.02 |
| **C_NI** | 100нФ | 1 | Noise signal coupling | $0.03 |
| **C_NF** | 10пФ | 1 | Noise HF rolloff | $0.03 |
| **R21** | 10кΩ | 1 | BC547 base bias (при старой схеме) | $0.01 |
| **R22** | 10кΩ | 1 | Noise amp input | $0.01 |
| **R23** | 1МΩ | 1 | Noise amp feedback | $0.01 |
| **R_SIDE_FB** | 47кΩ | 1 | Sidechain feedback | $0.01 |
| **R_SIDE_MIX** | 10кΩ | 1 | Sidechain output coupling | $0.01 |
| **R_DE3, R_DE4** | 10кΩ | 2 | De-emphasis network | $0.02 |
| **R_PE3, R_PE4** | 10кΩ | 2 | Pre-emphasis network | $0.02 |
| **R_EF1** | 10кΩ | 1 | Envelope rectifier path | $0.01 |
| **R_DCV** | 100кΩ | 1 | CV decay path | $0.01 |
| **R_IABC** | 10кΩ | 1 | OTA Iabc input | $0.01 |
| **R_VCA_G** | 10кΩ | 1 | OTA input neg to GND | $0.01 |
| **R_VCA_LOAD** | 10кΩ | 1 | OTA output load | $0.01 |
| **R_BLIN** | 10кΩ | 1 | OTA linearizing diode bias | $0.01 |
| **R_DAM2** | 10кΩ | 1 | Solenoid gate stop | $0.01 |
| **R_DAM3** | 100кΩ | 1 | Solenoid gate pulldown | $0.01 |
| **R3** | 10кΩ | 1 | Driver amp input | $0.01 |
| **R4** | 47кΩ | 1 | Driver amp feedback | $0.01 |
| **R5** | 100Ω | 1 | Push-pull base current limit | $0.01 |
| **R6, R7** | 10Ω | 2 | Push-pull emitter resistors | $0.02 |
| **R_TF** | 1кΩ | 1 | Tone filter input | $0.01 |
| **R_CL** | 1кΩ | 1 | Clip limit resistor | $0.01 |
| **R_VCA_IN** | 10кΩ | 1 | VCA input buffer | $0.01 |
| **R_MD, R_MW, R_MFB** | 47кΩ | 3 | Mix summing resistors | $0.03 |
| **R_MN** | 100кΩ | 1 | Noise mix resistor | $0.01 |
| **C_CA, C_CB** | 1µФ film | 2 | Preamp AC coupling | $0.30 |
| **C_IN, C_OUT** | 1µФ film | 2 | Input/output AC coupling | $0.30 |
| **C_SIDE** | 1µФ film | 1 | Sidechain input coupling | $0.15 |
| **C_PA, C_PB** | 10нФ ceramic | 2 | Piezo AC coupling | $0.04 |
| **C_TF** | 10нФ ceramic | 1 | Tone filter cap | $0.02 |
| **C_COL** | 10нФ ceramic | 1 | Noise color filter | $0.02 |
| **C_NO** | 1µФ film | 1 | Noise output coupling | $0.15 |

**Total "invisible" compнентов**: ~46 штук, суммарно ~$1.70.

**Если эти компоненты не были в оригинальном BOM v2.1** (нужно проверить `wood_reverb_v2_BOM.csv`), то реальный компонент count 140 → ~186. Это соответствует заявленному в разных частях брифа диапазону "140-158" с учётом всех support elements.

---

## Финальный BOM (revised v2.2)

### Активные компоненты

| Часть | Количество | Unit price | Total |
|-------|-----------|-----------|-------|
| TL072 DIP-8 | 2 | $0.50 | $1.00 |
| TL074 DIP-14 | 2 | $0.75 | $1.50 |
| LM13700 DIP-16 | 1 | $2.00 | $2.00 |
| **LSK489A SOT-23-6** | 1 | $6.00 | $6.00 |
| BD139 TO-126 | 1 | $0.30 | $0.30 |
| BD140 TO-126 | 1 | $0.30 | $0.30 |
| BC547 TO-92 | 0 (removed) | — | — |
| **BZX55C9V1 DO-35** | 1 | $0.10 | $0.10 |
| 2N7000 TO-92 | 1 | $0.15 | $0.15 |
| 1N4148 | 7 (включая bias, env, ESD) | $0.01 | $0.07 |
| 1N4001 | 1 (solenoid flyback) | $0.03 | $0.03 |
| 1N5817 | 2 (power reverse) | $0.20 | $0.40 |
| LED Red 3мм | **6** (clipper + indicator) | $0.02 | $0.12 |
| **Active total** | | | **$11.97** |

### Пассивные компоненты (резисторы + капы)

Усреднённо ~$5 для всех резисторов и конденсаторов (не считая specific выше).

### Mechanics + connectors

| Часть | Количество | Unit price | Total |
|-------|-----------|-----------|-------|
| Alpha RV09 9мм vertical pot | 10 | $1.20 | $12.00 |
| Thonkiconn PJ301M 3.5мм jack | 7 | $1.00 | $7.00 |
| **Mini-XLR TA3M** (module side) | 2 | $3.00 | $6.00 |
| **Mini-XLR TA3F** (cartridge side) | 2 | $3.00 | $6.00 |
| JST-XH 2-pin (exciter, solenoid) | 2 | $0.20 | $0.40 |
| SPDT toggle switch (FREEZE) | 1 | $2.00 | $2.00 |
| IDC 2×5 (Eurorack power) | 1 | $0.50 | $0.50 |
| **Connector total** | | | **$33.90** |

### Peripherals

| Часть | Цена |
|-------|------|
| **DAEX25FHE-4 surface exciter** | $20 (included with cartridge, not module) |
| Piezo 27мм × 2 | $1 (included with cartridge) |
| Solenoid 5В 300мА | $5 |
| **R8 5W wirewound** | $0.30 |
| **Cartridge (average wood plate)** | $15 (frame, plate, mounting, pickups) |

### PCB
- 2-layer FR4 1.6мм 101.6×108мм — $15 (small batch).
- 4-layer FR4 (recommended для noise reduction) — $30.

### Корпус / панель
- Алюминий 40HP × 128.5мм panel — $25 (flagship size, anodized + laser-etched).
- Hardware (screws, nuts, spacers) — $3.

---

## Total BOM — single module estimate

### Budget version (2-layer PCB, minimum fixes)

- Active: $11.97
- Passive: $5.00
- Connectors: $33.90 (уже с mini-XLR)
- Solenoid + R8: $5.30
- PCB: $15
- Panel + hardware: $18
- **Total**: **$89**

### Premium version (4-layer PCB, all fixes)

- Budget base: $89
- 4-layer upgrade: +$15
- Notch filter components: +$3
- ESD + input hardening: +$0.10
- **Total**: **$107**

### Cartridge (separate SKU)

- Frame + plate + pickups + exciter + mount: $15–30 depending на material.
- Packaging + branding: +$5.
- Retail $40–80.

---

## Retail pricing implications

**Boutique price target**:
- Module only (no cartridge): $300–350.
- With 1 wood cartridge (oak, reference): $350–400.
- Premium (3-cartridge bundle, metal+stone+wood): $500–600.

**Margin** (budget BOM $89 → retail $300) = ~70% gross margin. Adequate для boutique (30–50% typical после distribution + R&D amortization).

**Premium BOM $107 → retail $400** = 73% gross margin. Better для sustaining production.

---

## Sourcing notes

- **LSK489A** — Linear Integrated Systems, distributed via Mouser / Digi-Key. Lead time 2–4 недели. Order buffer stock.
- **BD139/BD140** — ON Semi / Fairchild, multi-source. OK.
- **Mini-XLR connectors** — Switchcraft TA3M/F, Rean NYS321/322. Common stock.
- **DAEX25FHE-4** — Dayton Audio, direct or Parts Express. Stock usually good, sometimes backorder.
- **R8 5W wirewound** — Panasonic, Ohmite. Stock OK, multi-source.
- **BZX55C9V1** — Vishay, standard. Multi-source.
- **Alpha RV09 pots** — Alpha Taiwan. 2–6 week lead if small order, Thonk stocks some.

**Supply chain risk**: LSK489A is single-source (LIS). Consider **dual-sourcing strategy** — prepare PCB layout to accept also **2SK209 GR** (Toshiba, similar specs, in production).
