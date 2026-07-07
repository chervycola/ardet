# Last Night — fix list

Конкретные правки к схеме Last Night v2.1, сгруппированные по фазам внедрения. Каждый fix: ссылка на блок в `audit/10_last_night_engineering.md`, точное изменение, причина, BOM impact, severity.

Применять в порядке приоритета: **IMMEDIATE → SHORT → MEDIUM → LONG**.

---

## IMMEDIATE (правки в schematic перед первым PCB order)

Эти правки не требуют redesign — только корректировка номиналов и BOM specification. Можно внести за час работы в KiCad.

### IM1. Push-pull class-AB bias — **MAJOR → fixed**

**Ссылка**: audit/10_last_night_engineering.md, Block 4.
**Проблема**: Q1 BD139 + Q2 BD140 без biasing diodes → class B → crossover distortion на low-level signal.
**Fix**:
- Добавить 2× 1N4148 в серии между базами Q1 и Q2 (anode к базе Q1, cathode к базе Q2).
- Добавить R_BIAS1 + R_BIAS2 (2× 1кΩ) между +12V→коллектор-диод и диод-коллектор→-12V для протекания bias current ~1мА.
- Это переводит каскад в class AB.
**BOM impact**: +2× 1N4148 (+$0.02), +2× 1кΩ (+$0.02).
**Verification**: осциллограф на exciter output, signal 100мВ peak 1кГц sine. Crossover notch at zero-crossing должен исчезнуть.

### IM2. R8 power rating — **MAJOR**

**Ссылка**: audit/10_last_night_engineering.md, Block 4; audit/13_schematic_cross_reference.md, C3.
**Проблема**: R8 4.7Ω в exciter path рассеивает ~3.8Вт peak, ~1Вт avg. Если стоит 1/4W резистор — сгорит за секунды.
**Fix**:
- Specify R8 = **4.7Ω 5W wirewound** (Panasonic ERG-5SJ4R7, Ohmite 45F4R7E, или аналог).
- Либо 2× 10Ω 2W в параллели (даёт 5Ω 4W — близко к 4.7Ω spec).
- Mount: вертикально или с зазором от PCB 3мм для конвекции.
**BOM impact**: замена R 0.1Вт ($0.01) на 5W ($0.30). +$0.29 на модуль.
**Verification**: thermal measurement после 10 мин continuous drive — температура корпуса резистора <80°C.

### IM3. Solenoid gate divider — **MAJOR**

**Ссылка**: audit/10_last_night_engineering.md, Block 8; audit/13_schematic_cross_reference.md, C1.
**Проблема**: current divider даёт gate 2.5В при CV 5В — marginal для Vth 2N7000 (spread 0.8–3В). Часть экземпляров не будет надёжно открываться.
**Fix**:
- Заменить R_DAM1 100кΩ → **R_DAM1 47кΩ**.
- Новый divider: V_gate = V_CV × 100k / (47k + 100k) = V_CV × 0.68.
- При CV 5В gate = 3.4В (solid turn-on для всех 2N7000 даже с Vth=3В).
**BOM impact**: нулевой (замена номинала).
**Verification**: CV 5В → gate 3.4В на осциллографе (ожидаемое); соленоид активируется надёжно.
**Альтернатива**: заменить Q5 на **AO3400** (SMD, Vth 0.7–1.3В) или **IRLZ34N** (TO-220, Vth 1–2В) — logic-level gate, divider 0.5 достаточен.

### IM4. Pre-emphasis / de-emphasis cap matching — **MINOR**

**Ссылка**: audit/10_last_night_engineering.md, Block 3 и 11.
**Проблема**: C_PE1 и C_DE1 **ДОЛЖНЫ** совпадать (тракт compensation симметричен). Note прямо в каркасе.
**Fix**:
- Specify C_PE1 = C_DE1 = **1нФ C0G/NP0 ceramic, ±5%, из одной партии**.
- В BOM: Murata GRM1885C1H102JA01D (1нФ, 50В, C0G, ±5%) — дешёвый и стабильный.
- Mount close в PCB layout для сниженного температурного mismatch.
**BOM impact**: нулевой (уже specified, уточняется tolerance).
**Verification**: frequency sweep 20Гц–20кГц через pre-emph + de-emph bypass — response должен быть flat ±0.5dB.

---

## SHORT (правки требуют minor redesign preamp или ~1 week работы)

### SH1. 2N5457 JFET → LSK489A dual — **BLOCKER**

**Ссылка**: audit/10_last_night_engineering.md, Block 9; audit/40_bom_risk_register.md.
**Проблема**: 2N5457 EOL. NOS стоки истощаются. Новая production невозможна.
**Fix**:
- Q3A + Q3B (два single JFET) → **LSK489A** (один SMD dual matched JFET, SOT-23-6 package).
- Re-route preamp subsection на SMD (остальная схема THT остаётся).
- Пересчитать bias с учётом LSK489A Idss range (2–10мА vs 2N5457 1–5мА).
- Матчинг между каналами A/B автоматический (same die).
**BOM impact**: $5–8 replaces $1–2 (×2 of 2N5457). +$6 на модуль. Но avoids EOL и улучшает matching.
**PCB impact**: один SOT-23-6 footprint вместо двух TO-92. Освобождается ~20мм² PCB.
**Verification**: измерить shot noise каждого канала (короткий сигнал, измерить шум с input shorted). Ожидается LSK489A ~1нВ/√Гц vs 2N5457 ~10нВ/√Гц.

### SH2. SPICE simulation feedback loop — **BLOCKER**

**Ссылка**: audit/10_last_night_engineering.md, СП5.
**Проблема**: loop stability при physical resonator Q=100–1000 не проверена. Risk самовозбуждения.
**Fix** (это не schematic edit, а verification step):
- Построить LTSpice модель loop: driver amp → exciter [как RLC: L=10мГн, C=1µФ, R=1Ω для осям 1.6кГц резонанса] → piezo preamp ×23 → tone filter → VCA → feedback → back to summing.
- Прогнать Nyquist analysis: plot gain/phase vs freq от 10Гц до 20кГц.
- Проверить, что при max RV_FEEDBACK gain margin > 6dB, phase margin > 45° на всех частотах.
- Если не проходит — добавить **notch filter на 1.6кГц** (R+L+C) в feedback path, или уменьшить max gain loop через additional attenuator 0.5× в feedback.
**BOM impact**: может потребовать 1× inductor + 1× cap (notch) = +$3, или 1× pot-trimmer для gain tune = +$1.
**Verification**: повторить LTSpice с разными RLC моделями пластин (дерево Q=50, мрамор Q=300, сталь Q=1000).

### SH3. Piezo cable shielding — **BLOCKER**

**Ссылка**: audit/10_last_night_engineering.md, СП3; audit/41_power_thermal_emi.md.
**Проблема**: JST-XH для piezo linii — антенна 50–80мм рядом с solenoid. EMI > signal.
**Fix**:
- Заменить J_PA, J_PB с JST-XH на **mini-XLR 3-pin** (TA3F на картридже, TA3M на модуле). Pin 1 = shield (GND), Pin 2 = signal, Pin 3 = NC или signal return.
- Кабель от picкапа до mini-XLR — 50мм micro-coax (RG-174 или subminiature).
- Shield соединён с AGND только на стороне модуля (single-point ground).
- J_EX и J_SOL остаются JST-XH (exciter — low-Z, solenoid — tolerant к noise).
**BOM impact**: +2× mini-XLR pair ($6–10 каждый) = +$15–20 на модуль. Существенно для budget SKU, но решает primary noise problem.
**Альтернатива для budget SKU**: micro-coax + JST 2-pin с shield wrapped вокруг connector — hand-made, но $1 per cartridge.
**Verification**: noise floor measurement с solenoid pulsing 10Гц. Без shielding: click audible. С shielding: click под noise floor.

---

## MEDIUM (правки на rev B после первого прототипа)

### MD1. C_DC bass extension — **MAJOR**

**Ссылка**: audit/10_last_night_engineering.md, Block 7.
**Проблема**: C_DC 220µФ + R8 4.7Ω + 4Ω exciter = fc 83Гц. Басы <80Гц режутся.
**Fix**: C_DC 220µФ → **1000µФ** (25В electrolytic).
**BOM impact**: +$0.15 per module.
**Alternative per-cartridge**: если cartridge имеет fundamental <80Гц (мрамор, бетон), использовать low-R8 версию (2.2Ω вместо 4.7Ω) — corner уходит к 40Гц.
**Verification**: frequency sweep 20–200Гц, воспринимаемая мощность на exciter должна быть flat до 30Гц.

### MD2. Envelope follower τ — **MAJOR**

**Ссылка**: audit/10_last_night_engineering.md, Block 13.
**Проблема**: τ = 1МΩ × 1µФ = 1 секунда — смещено в "медленно". Attack 1–50мс недостижим.
**Fix**:
- C_ENV: 1µФ → **220нФ** (film, low-leakage).
- RV_ATTACK: 1МΩ → **220кΩ** (τ_max = 48мс).
- RV_DECAY: 1МΩ → **1МΩ** (остается) с C_ENV 220нФ — τ_max = 220мс.
- **Добавить 2× 1N4148 диода**: один в charge path (anode к signal → cathode к C_ENV), второй в discharge path (anode к C_ENV → cathode к ground). Это разделяет attack и decay paths — независимая настройка.
**BOM impact**: +2× 1N4148 ($0.02), замена C_ENV (±$0.05), same pot values.
**Verification**: input sustained tone → пауза. Измерить time to decrease to 1/e = 37% at various RV_DECAY positions.

### MD3. LED clipper replacement — **MINOR**

**Ссылка**: audit/10_last_night_engineering.md, Block 12.
**Проблема**: LED Vf 1.8В клиппинг = +1.2 dBu — слишком низко для line-level signal.
**Fix**:
- D1/D2 Red LED → **3× LED серии в каждую сторону** (Vf 5.4В, клиппинг +10.6 dBu).
- Либо **1N914 или 1N4148 × 3** (мягче clip) — Vf ~1.8В суммарно.
- Либо **BAT46 Schottky × 2** — Vf ~0.3В (дальше уменьшает threshold, противоречит fix) — **не рекомендуется**.
**BOM impact**: +4× LED ($0.20) — но больше места на панели для визуальной indication.
**Альтернатива**: отдельный clip indicator LED + compар на пороге +6 dBu, внутренний signal clipper на diode bridge — 2-stage solution.
**Verification**: input signal 0dBu до +15dBu sweep, observed clipping threshold должно быть на +10dBu.

### MD4. BC547 → BZX55C9V1 zener — **MAJOR**

**Ссылка**: audit/10_last_night_engineering.md, Block 15; audit/40_bom_risk_register.md.
**Проблема**: BC547 reverse B-E breakdown — параметрический разброс, деградация с temperatуры и времени. Note прямо в каркасе: "Test 5-10 transistors, 2N2222 often better".
**Fix**:
- Q4 BC547 → **D_NOISE BZX55C9V1** (9.1В zener diode, DO-35 package).
- R20 100к → **R_NOISE 10кΩ** (меняется ток через zener до 0.5мА — в breakdown region с stable noise).
- Voltage drop across R_NOISE → 12В - 9.1В = 2.9В → I = 0.29мА → stable avalanche noise.
- Остальная секция (R22, U2C, C_NF, C_NO, RV_COLOR, RV_NOISE) без изменений.
**BOM impact**: BZX55C9V1 $0.10 vs BC547 $0.05 → +$0.05.
**Альтернатива premium**: ATtiny85 + 8-bit DAC → digital LFSR noise с patterned Geiger events (cluster events, variable rate). +$2 per module, но unique sound design.
**Verification**: noise spectrum 20Гц–20кГц — plateau shape consistent между экземплярами (parameter spread <10%).

---

## LONG (отдельный R&D cycle)

### LG1. Material-adaptive pre-emphasis — **MINOR**

**Ссылка**: audit/10_last_night_engineering.md, Block 3.
**Проблема**: фиксированная pre-emphasis не универсальна для всех материалов.
**Fix** (optional для v2):
- Добавить **3-way switch** в pre-emphasis: C_PE1a 1нФ / C_PE1b 2.2нФ / C_PE1c 4.7нФ.
- Соответствующий switch в de-emphasis синхронизирован.
- Labels: "WOOD / STONE / METAL" по material family.
**BOM impact**: 2× 3-way switch ($2 each) + 4× extra caps ($0.05 each) = ~$4.
**Verification**: A/B тест на 3 cartridges, subjective "яркость" после full compensation.

### LG2. LFO circuit (for pedal version) — **BLOCKER (documentation)**

**Ссылка**: audit/50_contradictions_and_todos.md, C1.
**Проблема**: педальная панель показывает SPEED/DEPTH/PHASE ручки, схема их не содержит.
**Fix (если педаль версия будет)**:
- Добавить **triangle/sine LFO** на U2B (unused half of TL074) с R × C oscillator + Schmitt trigger.
- Rate: RV_SPEED 1МΩ log, C_LFO 1µФ film → fc 0.16Гц – 16Гц.
- Depth: RV_DEPTH × attenuator — output attenuated.
- Phase: phase shifter через все-pass filter (RC network) — optional.
- Output: routed to CV destination (RV_FEEDBACK mod, RV_CUTOFF mod).
**BOM impact**: +3× pot, +2× cap, +2× R, 1× unused TL074 half → +$5 на модуль.
**Альтернатива**: удалить ручки с макета педали — если LFO не нужен, спрятать.
**Verification**: output sine 1Гц–10Гц, amplitude варьируется с RV_DEPTH.

### LG3. Input Hi-Z / ESD / clamp — **MINOR**

**Ссылка**: audit/10_last_night_engineering.md, Block 2; audit/41_power_thermal_emi.md.
**Проблема**: Zin 100к низок для гитарного pickup. Нет ESD защиты.
**Fix**:
- R1 100к → **R1 1МΩ** (Hi-Z compatible для guitar).
- Добавить **2× 1N4148 clamp** к rails на input jack.
- Добавить **100Ω series R** после jack для ESD limiting.
**BOM impact**: +3 diodes, 1 resistor = ~$0.10. Trivial.

---

## Суммарный BOM impact всех fixes

| Phase | Delta BOM | Part Changes |
|-------|-----------|--------------|
| IMMEDIATE (IM1–IM4) | +$0.60 | 2× 1N4148, 2× 1кΩ, R8 (5W), C_PE1/DE1 (matched C0G), R_DAM1 (47к) |
| SHORT (SH1–SH3) | +$18 | LSK489A, mini-XLR pair, optional notch components |
| MEDIUM (MD1–MD4) | +$0.70 | 1000µФ C_DC, 220нФ C_ENV, 2× 1N4148 (env), 3× LED, BZX55C9V1 |
| LONG (LG1–LG3) | +$9 | LFO components, switches, Hi-Z input hardening |

**Total for rev A** (IMMEDIATE + SHORT + MEDIUM): **+$19 BOM delta** per module.

**Текущий BOM оценочно** $80–120 → revised $100–140. Retail impact: $30–50 upcharge. Для boutique рынка — absorbable.

---

## Применение в KiCad

Порядок работы в KiCad:

1. Open project `wood_reverb_v2.kicad_pro`.
2. Edit schematic → apply IM1–IM4 changes (номиналы, добавленные компоненты).
3. Re-run ERC (Electrical Rules Check).
4. Update BOM (`wood_reverb_v2_BOM.csv`).
5. Run SPICE simulation для SH2 (use ngspice export from KiCad).
6. If SPICE fails Nyquist — add notch components to schematic.
7. Re-layout PCB для SH1 (LSK489A SMD placement) + СП3/СП4 (zone separation для EMI).
8. Re-generate gerbers для PCB order.

**Estimated effort**:
- IMMEDIATE: 1 day (schematic edits only).
- SHORT: 1 week (SMD redesign + SPICE).
- MEDIUM: дополнительный 1 week на rev B после testing.

## Checklist перед PCB order

- [ ] All IMMEDIATE fixes applied (IM1–IM4).
- [ ] LSK489A replaces 2N5457 в BOM (SH1).
- [ ] SPICE simulation completed, stability confirmed (SH2).
- [ ] Mini-XLR footprints на cartridge side (SH3).
- [ ] BOM updated, verified pricing.
- [ ] ERC passes без errors.
- [ ] Panel mockup synced с schematic (no phantom knobs).
