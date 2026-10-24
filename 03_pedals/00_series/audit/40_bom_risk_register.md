# BOM Risk Register — ключевые компоненты с рисками

Сводный реестр компонентов, где есть sourcing/обсолетность/quality риски, с конкретными предлагаемыми заменами. Для каждого — part number, статус, цена, вердикт.

---

## Критические (BLOCKER)

### 2N5457 JFET (Q3A, Q3B в Last Night)

**Статус**: **End of Life**. ON Semi (бывший Fairchild) снял с производства. Текущий стоковый запас в distribution → дней/месяцев.

**Цена**: $0.5–1 (официально), $2–5 (NOS поставщики, варьирующееся качество).

**Проблема при замене**: разный Idss и Vp → перерасчёт gain и bias каждой стадии. В схеме с 10МΩ gate bias — работает, но source follower output voltage range сдвинется.

**Рекомендуемая замена**:

| Часть | Пакет | Idss | Vp | Цена | Drop-in? | Замечания |
|-------|-------|------|-----|------|----------|-----------|
| **LSK170B** | TO-92 | 6–12 мА | -0.8 to -1.5 | $3 | Нет (higher Idss) | Ultra-low noise, в производстве |
| **LSK489A** | SOT-23 (dual) | matched | matched | $5–8 | Нет (SMD + dual) | **Идеально** для dual-piezo matching, но требует PCB redesign |
| J201 | TO-92 | 0.2–1 мА | -0.3 to -1.5 | $1 | Нет (lower Idss) | Также discontinued, но NOS доступнее |
| MMBFJ201 (SMD) | SOT-23 | 0.2–1 мА | -0.3 to -1.5 | $0.3 | Нет (low Idss + SMD) | В производстве |
| 2SK170BL | TO-92 | 6–12 мА | -0.2 to -1.5 | $8 (NOS) | ≈ Drop-in | Toshiba, EOL, NOS есть |
| BF245C | TO-92 | 15–30 мА | -3 to -6 | $0.3 | Нет | European standard, в производстве, noise чуть хуже |

**Вердикт**: **LSK489A (dual)** — лучшее решение для production. Matches обе piezo channels автоматически. Требует PCB redesign на SMD (не все-THT), но решает matching и noise проблему одним махом.

**Альтернатива для all-THT**: **BF245C** как drop-in concept, с перерасчётом gain.

---

### BC547 в reverse breakdown noise source (Q4)

**Статус**: BC547 в производстве, но **использование в reverse breakdown mode — за datasheet**. Parameter spread enormous.

**Проблема**: каждый BC547 имеет свой Vbr (5–10В) и noise spectrum. Batch-to-batch variation → inconsistent noise character. Degradation со временем.

**Рекомендуемая замена**:

| Часть | Описание | Цена | Замечания |
|-------|----------|------|-----------|
| **BZX55C9V1** | 9.1V zener diode | $0.1 | Specified noise, stable |
| MMBZ5231B | 5.1V zener SMD | $0.05 | Compact |
| NOISE-DIODE-KIT | Commercial noise source | $15 | Pre-packaged quality |
| **ATtiny85 + DAC** | Digital noise LFSR | $2 | Programmable pattern, pseudo Geiger cluster events |

**Вердикт**: **BZX55C9V1 zener** для stable analog noise. **ATtiny85 LFSR** для Geiger-specific clicks (threshold + cluster).

---

## Major (MAJOR)

### DAEX25FHE-4 surface exciter

**Статус**: Dayton Audio, in production, доступен. $15–25 retail.

**Проблема**: недостаточен для плотных материалов >30г (см. `11_last_night_acoustic.md`, D).

**Альтернатива**:

| Часть | Размер | Power | Цена | Для | 
|-------|--------|-------|------|-----|
| DAEX25FHE-4 | 25мм | 40Вт peak, 20Вт RMS | $20 | Дерево, тонкие металлы |
| **DAEX32Q-4** | 32мм | 40Вт RMS | $40 | Мрамор, бетон, плотные |
| DAEX13CT-8 | 13мм | 5Вт | $15 | Тонкие легкие plates (fragile) |
| TT25-8 | 25мм | 20Вт | $25 | Alternative to DAEX25 |

**Вердикт**: **DAEX32Q-4** для "premium" картриджей (мрамор, бетон). DAEX25FHE-4 для базовых. Разделить catalog на два exciter классов.

---

### TL072 в piezo preamp (U3B, U4C)

**Статус**: TI, в производстве. Cheap, OK для general purpose.

**Проблема**: шум 18 нВ/√Гц — with high impedance piezo source, TL072 не domini the noise floor (resistor Johnson noise dominates), но всё же ≥-90 dBV output noise after gain ×23.

**Рекомендуемая замена** для pre-amp positions:

| IC | Шум | Цена | Пакет | Вердикт |
|----|-----|------|-------|---------|
| TL072 | 18 нВ/√Гц | $0.2 | DIP-8 | OK для lo-fi aesthetic |
| **NE5532** | 4 нВ/√Гц | $1 | DIP-8 | **Рекомендовано для piezo preamp stages** |
| OPA1642 | 1 нВ/√Гц | $3 | SOIC-8 | Audiophile, SMD |
| LM4562 | 2.7 нВ/√Гц | $2 | DIP-8 | OK, avail in THT |

**Вердикт**: **NE5532** для piezo preamp stages (U3B, U4C). TL072 оставить для non-critical (input buffer, mix). $1.6 BOM upgrade, slidely better SNR.

---

### LM13700 OTA (U5)

**Статус**: TI, в производстве, standard.

**Проблема**: distortion 0.5% — lo-fi character. Хорошо, если часть эстетики. Плохо, если нужен clean VCA.

**Рекомендуемая замена** (для premium):

| IC | Шум | Distortion | Цена | Вердикт |
|----|-----|-----------|------|---------|
| LM13700 | 30 нВ/√Гц | 0.5% | $2 | Baseline, OK character |
| **THAT2180** | 5 нВ/√Гц | 0.003% | $8 | Professional VCA, SSM replacement |
| SSM2164 | 8 нВ/√Гц | 0.03% | $12 (NOS) | Quad, EOL |
| SSI2164 | 8 нВ/√Гц | 0.03% | $15 | In production, modern replacement |

**Вердикт**: **LM13700 для v1** (character, cheap). **THAT2180 для premium SKU**.

---

### BD139/BD140 push-pull output (Q1/Q2)

**Статус**: Standard, в производстве. $0.3 each.

**Проблема**: thermal runaway без bias, see blockengineering.md Block 4.

**Рекомендуемая замена**:

| Часть | Ic max | Pd | Цена | Вердикт |
|-------|--------|-----|------|---------|
| BD139/140 | 1.5А | 12.5Вт | $0.6 pair | OK с bias и heat spread |
| BD135/136 | 1.0А | 12.5Вт | $0.5 pair | Cheaper, enough for exciter |
| **IRF510/IRF9510** | 5A, 4A | 60Вт, 60Вт | $1 pair | MOSFET, no thermal runaway |
| TIP31/TIP32 | 3A | 40Вт | $0.8 pair | Higher power, overkill |

**Вердикт**: **IRF510/IRF9510** — MOSFET avoid biasing issue, thermal stable. Slightly different drive circuit.

---

### 2N7000 MOSFET для solenoid driver (Q5)

**Статус**: Standard, в производстве. $0.15.

**Проблема**: блок 8 в `10_` — сломанный gate divider делает 2N7000 невозможным к открытию.

**Альтернатива** (вопрос не в части, а в R distribution):

После исправления R_DAM divider, **2N7000** остаётся хорошим choice:
- Vds 60V, Id 200мА — достаточно для соленоида 300мА impulse.
- Logic-level gate (Vth 2V).
- Cheap, fast.

**Если нужен больше current** (соленоид 500мА+):

| MOSFET | Id | Vgs(th) | Цена |
|--------|-----|---------|------|
| 2N7000 | 200 мА | 2.1В | $0.15 |
| **FQP30N06L** | 30А | 2–4В | $1 | Overkill, но безопасно |
| IRLZ34N | 30А | 1–2В | $1.5 | Logic-level gate |

**Вердикт**: **2N7000** после исправления gate circuit. Если solenoid upgrade >500мА, переход на **IRLZ34N**.

---

## Minor

### Alpha 9mm vertical pots (10 шт. в Last Night)

**Статус**: Alpha Taiwan, в производстве, standard Eurorack format. $1–2 each.

**Альтернатива** (не critical):

| Pot | Description | Цена | Применение |
|-----|-------------|------|-----------|
| **Alpha RV09** | 9mm vertical | $1.5 | Standard Eurorack |
| Bourns 3296W | Multi-turn trimmer | $3 | Если нужна precision |
| Alpha RV16 | 16mm for pedal | $2 | Педальная версия |

**Вердикт**: RV09 стандарт. Для педали — RV16.

---

### TMA1212D DC-DC (for pedal)

**Статус**: TRACO, в производстве. $15–20. Изолированный.

**Проблема**: switching noise 150кГц.

**Альтернатива**:

| Модель | Output | Isolation | Цена | Замечания |
|--------|--------|-----------|------|-----------|
| TMA1212D | ±12V, 1Вт | 1kV | $15 | Стандарт |
| RPP10-1212 | ±12V, 10Вт | 3kV | $30 | Больше power |
| **LT3471** (DIY boost) | ±12V adjustable | none | $5 | Custom, inductor extra |

**Вердикт**: TMA1212D OK. LC post-filter обязателен.

---

### JST-XH connectors (4 per cartridge)

**Статус**: в производстве. $0.1–0.5 per housing.

**Проблема**: не экранированный, уязвим к EMI для piezo lines.

**Альтернатива** (для piezo specifically):

| Connector | Экран | Цена | Замечания |
|-----------|-------|------|-----------|
| JST-XH | Нет | $0.2 | OK for exciter/solenoid |
| **Mini-XLR 3-pin** | Да | $3 pair | **Recommended for piezo** |
| TA3M/TA3F | Да | $4 pair | Lemo-style, robust |
| Micro-coax + solder | Да (integrated) | $1 | Hand-made, reliable |

**Вердикт**: **Mini-XLR для piezo** (каждый канал отдельно), **JST для exciter и solenoid**. Mixed strategy.

---

## Summary — BOM Risk Register

### Critical upgrades (strongly recommended для v1):

1. **LSK489A** вместо 2N5457 (JFET preamps).
2. **BZX55C9V1** вместо BC547 (noise source).
3. **NE5532** вместо TL072 (piezo preamp stages).
4. **Mini-XLR** вместо JST для piezo lines.
5. **IRF510/9510** вместо BD139/140 (output driver, no thermal runaway).

**BOM cost impact**: +$10–15 per module. Solves noise, EOL, thermal issues.

### Acceptable for v1 (cost-down possible):

- TL072 for non-critical stages.
- DAEX25FHE-4 для light cartridges.
- LM13700 for VCA.
- 2N7000 for solenoid (after gate fix).

### Upgrades для premium SKU (v2):

- DAEX32Q-4 для dense materials.
- THAT2180 для linear VCA.
- OPA1642 для audiophile stages.
- PVDF pickup on B-channel.
- 4-layer PCB.

### Deprecated / avoid:

- 2N5457 (EOL).
- BC547 reverse breakdown (unreliable).
- JST-XH for piezo signals (unshielded).
- Matched dual JFETs manually binned (auto-matching через LSK489 решает это).
