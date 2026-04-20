# Power, Thermal, EMI — сквозные физические риски

Сводный анализ по системе: бюджеты питания, тепловой режим, электромагнитная совместимость. Cross-cuts через все модули.

---

## A. Power budgets

### A.1. Last Night (Eurorack 16HP, ±12V)

| Block | Current (mA) | Notes |
|-------|--------------|-------|
| 5× ОУ (TL072/TL074) | ~15 | 3 мА × 5 |
| LM13700 OTA | 15 | Standby + Iabc |
| BD139 push-pull (avg) | 40 | Depends on signal |
| Exciter driver peak | 500 | Peak (rare) |
| Exciter driver avg | 150 | Typical с reverb signal |
| Solenoid pulse | 300 | Only when activated |
| LEDs (2× clip indicator) | 20 | 10mA each |
| **Total steady** | **~200** | Per rail ±12V |
| **Total peak** | **~450** | С solenoid impulse |

**Eurorack standard**: 500 mA/rail typical max per module. **Last Night fits в budget**, но с narrow margin.

**Рекомендация**: PSU с 1А/шину (standard) → 2× margin. Безопасно.

---

### A.2. Last Night (Pedal format, 12V DC → ±12V через TMA1212D)

TMA1212D capability: 1Вт output total → 83 мА на каждую шину (±12V).

**Проблема**: Last Night typical 200 мА steady на шину — **превышает capability TMA1212D**.

**Рекомендация**:
- **TRACO TMA1215D** (±15V) с post-regulator to ±12V — более headroom.
- Или **Recom RKD-1212** (3Вт output) — $22.
- Или **two separate DC-DC** (+12V и -12V отдельные чипы) — more flexibility.

**Critical**: **нельзя питать педальный Last Night от типичного 9V pedalboard supply**. Нужен 12V DC input, что **ограничивает pedalboard compatibility**. Это product decision.

---

### A.3. Last Day (Eurorack 40HP)

| Subsystem | Current (mA) | Notes |
|-----------|--------------|-------|
| Motor DC | 200–300 | Continuous |
| Motor controller | 20 | MCU / analog drive |
| Heater (5Вт @ 12V) | 400 | **When active** — huge |
| Solar amp | 20 | Starved design, low power |
| EQ (2× shelf + mid) | 50 | Including inductor losses |
| FX section | 30 | HAZE LFO, WIRE, DUST, DRAG |
| Perform solenoid CRASH | 300 | Impulse only |
| LEDs + indicators | 30 | |
| **Steady без heater** | **~350** | |
| **Steady с heater** | **~750** | Over 500mA budget typical |

**Problem**: heater на audio rail violates Eurorack convention (500mA max).

**Рекомендация**:
- **Separate +5V rail для heater** через dedicated PSU (локальный buck converter или external supply).
- Без heater — **Last Day едва помещается** в стандартный Eurorack budget.
- Recomend **larger PSU** (Doepfer PSU3 или Intellijel TPS80, 2А/шину).

---

### A.4. Last Day (Pedal) — **не жизнеспособен**

Как посчитано в `22_last_day_open_questions.md`, Q9 — требует >10Вт. Педаль supply 2–5Вт.

**Вердикт**: pedal version Last Day **нежизнеспособна в чистой форме**. Нужен упрощённый feature set (без heater, без motor — самый тяжёлый потребители).

---

## B. Тепловой режим

### B.1. Last Night

**Источники тепла**:
- BD139/BD140 push-pull: при 15W exciter output dissipation ~3W на каждом транзисторе (30% rail voltage drop × 500 мА avg). Без heatsink → перегрев за минуты.
- TMA1212D: встроенная рассеивание ~20% → 0.2Вт. Self-thermostated, OK.
- ОУ и LM13700: <10 мВт каждый. Negligible.

**Критическая точка**: BD139/140. Решения:

1. **Thermal relief 10×10мм** на PCB под каждым TO-126 — снижает junction temp, но не устраняет нагрева.
2. **TO-126 heatsink** (clip-on) — $1 each. Добавляет высоту 15мм над PCB — критично для Eurorack clearance.
3. **Thermal pad to chassis** — крепление к алюминиевой панели Eurorack через thermal paste → panel = heatsink. Элегантно.
4. **Low-drive mode**: ограничить signal peak → driver не потребляет полную мощность. Trade-off с loudness.

**Рекомендация**: **option 3 (thermal pad to panel)**. В Eurorack формате панель 16HP имеет много place для teplootvod.

**Exciter DAEX25FHE-4**:
- Voice coil rated 40Вт peak, 20Вт RMS.
- При continuous drive 10+ Вт coil heats >80°C.
- **Mean time to failure** при continuous high power ~1000 часов.

Решение: software/hardware current limit → max 5Вт continuous (peak 20Вт OK). Это ограничивает loudness, но защищает exciter.

### B.2. Last Day

**Источники тепла**:
- DC motor: ~2–5Вт continuous (dependent on speed, load).
- Heater: 5Вт (когда включен).
- Solar amp starved: <0.5Вт.
- MOSFET motor driver: 0.5–2Вт при PWM drive.
- Inductors для EQ: 0.5–1Вт на high boost (saturation).

**Total**: 3–10Вт тепла в 40HP объёме. Это **значимое** количество, требует cooling (passive convection через slots, или active для closed pedal).

**Рекомендация**:
- Eurorack: 40HP панель — достаточный heat dissipation surface.
- Pedal: **potentially overheating problem**, 190×122×54мм корпус замкнут, цирк конвекции ограничена. Thermal simulation обязательна.

---

## C. EMI / Noise

### C.1. Last Night — 5 главных EMI risks

1. **Solenoid switching → piezo preamp coupling** (см. `10_` Block 8, СП3). **Primary EMI risk проекта**.
2. **Cartridge cable antenna** (JST unshielded, 50–80мм, carries piezo signal × 10МΩ impedance).
3. **TMA1212D switching noise** at 150кГц on supply rails.
4. **Noise generator output** (BC547 avalanche) on shared GND.
5. **LED clipper LED flashing** transient coupled to tone filter path.

### Mitigation map

| Risk | Mitigation | Cost (BOM) | Impact |
|------|-----------|-----------|--------|
| Solenoid→Piezo | Ferrite shield on coil + twisted pair + shield cable | $3 | Huge |
| Cartridge antenna | Mini-XLR + micro-coax | $3 | Huge |
| TMA1212D noise | LC post-filter on each rail | $2 | Medium |
| Noise gen on GND | Separate AGND/DGND + single-point tie | Layout only | Medium |
| LED clipper | Driver buffer + series R | $0.5 | Small |

**Total cost**: ~$10 to resolve all EMI issues. **Critical investment**.

### C.2. Last Day — дополнительные risks

1. **Motor brush commutation noise** — 0.5–5 кГц, broadband. Brushless motor solves (+$10).
2. **Heater resistor on audio rail** — drop across heater creates common-mode noise. Separate rail.
3. **Capacitive pickup (если Tel-Ray style)** — high-impedance, susceptible to EMI.
4. **Ferromagnetic disk rotating near inductive EQ** — distant but possible crosstalk.

### Mitigation

- Brushless motor for production.
- Dedicated heater PSU.
- Capacitive pickup inside Faraday cage.
- Physical separation между disk и inductors (minimum 50мм).

### C.3. Cross-module EMI in Eurorack

When 9 modules в одном rack:
- Shared PSU noise.
- Ground loops между panel mounting (shared metal frame).
- Motor (Last Day, I Show You Light) emitting fields to neighbors.
- Solenoids (Last Night damper, Last Day CRASH) creating pulses on GND.

**Mitigation**:
- Each module with its own local LC filter after power rail tap.
- Ferrite beads on power inputs.
- Star-ground philosophy extended to rack level — модули connect GND to single star point at PSU, not через case metal.
- Documentary: **в руководстве "не ставить Last Day рядом с I Show You Light"** если motor emission problematic.

---

## D. Защита от overload

### Not implemented в current briefs:

- **No input over-voltage clamp** (CV input может получить ±15В и сжечь ОУ).
- **No output short-circuit protection** (если output шортится, push-pull ОУ сгорает).
- **No PSU reverse polarity protection** beyond 1N5817 Schottky.
- **No fuse на power input** (если TMA1212D fails short → current limit на external supply).

### Recommendations

| Protection | Cost | Impact |
|-----------|------|--------|
| 2× 1N4148 clamp per CV input | $0.10/input | Saves $1 IC on damage |
| 100Ω series R on output (series with C_OUT) | $0.05 | Protects from short |
| Polyfuse on power input (100мА slow-blow) | $0.3 | Resets after trip, saves PSU |
| Varistor across power input | $0.2 | ESD protection |

**Total**: ~$2 BOM для полной защиты. Critical для production-quality.

---

## E. Summary

### Power budget verdicts

- **Last Night Eurorack**: **OK**, 200 mA/rail, narrow margin на peak solenoid.
- **Last Night Pedal**: **requires TMA1215D или larger**, не стандартный 9V.
- **Last Day Eurorack**: **tight**, heater separate rail, motor draws continuous.
- **Last Day Pedal**: **not viable** in original spec.

### Thermal verdicts

- **Last Night**: BD139/140 требует теплоотвод (thermal pad to panel recommended).
- **Last Day**: 10Вт в 40HP объёме — OK. В педальном корпусе — thermal concern, simulation required.
- **Exciter continuous power**: limit 5Вт (protection against voice coil burn-out).

### EMI verdicts

- **Critical**: solenoid→piezo coupling в Last Night. Без mitigation — проект не работает.
- **Important**: cartridge cable shielding. Mini-XLR для piezo.
- **Important**: TMA1212D post-filter.
- **Nice-to-have**: PSU noise isolation, cross-module separation.

### Protection gaps

- All modules missing input over-voltage clamp.
- All modules missing output short protection.
- Recomment add $2 BOM для полноценной защиты.

---

## Actionable items — единый список

1. **Heatsink BD139/140** via panel thermal pad в Last Night.
2. **TMA1215D (±15V)** или bigger DC-DC для pedal Last Night.
3. **Separate heater rail** (dedicated 12V supply) в Last Day.
4. **Mini-XLR shielded cables** для all piezo pairs.
5. **LC post-filter** на supply rails после TMA1212D.
6. **Ferrite shield** на solenoids в Last Night.
7. **AGND/DGND separation** + single-point tie on both modules.
8. **Input CV clamp diodes** (2×1N4148 per input) — $0.10 each.
9. **Output series R 100Ω** для short protection.
10. **Power input polyfuse** (100мА) + reverse polarity + varistor.
