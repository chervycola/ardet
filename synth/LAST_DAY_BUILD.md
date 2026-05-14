# LAST DAY — Build documentation

**Версия**: v1.0 (Phase A R&D scope)
**Базовый decision**: Decisions 02 + 08 (consolidated base).
**Парный документ**: `LAST_DAY_SPEC.md` (продуктовая спецификация).
**Совместимость**: одна PCB для двух SKU (Eurorack 40HP + big-box pedal 203×140мм). Identical schematic.

> Это **engineering canon** для Last Day v1.0 — oil-can capacitive delay + solar saturator + tongue resonator + hot palette FX. Документ структурирован как `LAST_NIGHT_BUILD.md` для consistency: блоки 1–N с topology / R-values / BOM / verification.

---

## Содержание

- [Логическая схема — 20 блоков](#логическая-схема--20-блоков)
- [Блок 1. Power supply (dual SKU)](#блок-1-power-supply)
- [Блок 2. Input buffer + dry split](#блок-2-input-buffer--dry-split)
- [Блок 3. Solar amp (starved saturator)](#блок-3-solar-amp)
- [Блок 4. Oil-can engine — motor driver + speed control](#блок-4-oil-can-engine)
- [Блок 5. Capacitive write electrode + HV bias](#блок-5-capacitive-write-electrode)
- [Блок 6. Capacitive read frontend — dual electrode](#блок-6-capacitive-read-frontend)
- [Блок 7. Inductive shelf EQ (LO/HI)](#блок-7-inductive-shelf-eq)
- [Блок 8. Tongue resonator (manual clamp v1)](#блок-8-tongue-resonator)
- [Блок 9. Feedback loop + soft-clip limiter](#блок-9-feedback-loop)
- [Блок 10. HAZE — periodic motor mod LFO](#блок-10-haze)
- [Блок 11. MIRAGE — aperiodic noise→S&H pitch drift](#блок-11-mirage)
- [Блок 12. BLEACH — HF saturation w/ solar threshold](#блок-12-bleach)
- [Блок 13. TAR — peak-hold compressor](#блок-13-tar)
- [Блок 14. CICADA — cluster tick generator](#блок-14-cicada)
- [Блок 15. HEATWAVE — AM-tuner front-end](#блок-15-heatwave)
- [Блок 16. OLD VINYL — PT2399 parallel tract](#блок-16-old-vinyl)
- [Блок 17. Perform footswitches (KILL/FREEZE/DRAG/CRASH)](#блок-17-perform-footswitches)
- [Блок 18. CRASH solenoid driver + hydrophone return](#блок-18-crash-solenoid)
- [Блок 19. Mix bus + output buffer](#блок-19-mix-bus)
- [Блок 20. Isolated DC-DC (pedal SKU only)](#блок-20-isolated-dc-dc)
- [Полный BOM](#полный-bom)
- [PCB layout — зоны](#pcb-layout)
- [Cartridge mechanics (disk oil-can)](#cartridge-mechanics)
- [Open R&D questions](#open-rd-questions)

---

## Логическая схема — 20 блоков

```
J_IN → Input buffer (Block 2) ──┬── DRY OUT
                                 │
                                 ▼
                          Solar amp (Block 3) → saturated
                                 │
                                 ▼
                          Oil-can engine (Block 4-6):
                            Motor driver → disk speed
                            HV bias → write electrode
                            Capacitive read L + R electrodes
                                 │
                                 ▼
                          Inductive shelf EQ (Block 7)
                                 │
                                 ▼
                          Tongue resonator (Block 8)
                                 │
                                 ▼
                  ┌── Feedback loop (Block 9) ─┐
                  │  RV_FEEDBACK + soft-clip   │
                  │  back to write electrode    │
                  └───────────┬────────────────┘
                              │
                              ▼
                  ┌── Hot palette FX layer ─┐
                  │  Block 10: HAZE         │
                  │  Block 11: MIRAGE       │
                  │  Block 12: BLEACH       │
                  │  Block 13: TAR          │
                  │  Block 14: CICADA       │
                  │  Block 15: HEATWAVE     │
                  │  Block 16: OLD VINYL    │
                  └────────────┬────────────┘
                                │
                                ▼
                  Perform footswitches (Block 17):
                    KILL / FREEZE / DRAG / CRASH (Block 18)
                                │
                                ▼
                  Mix bus + output buffer (Block 19)
                                │
                                ▼
                          OUT L + OUT R
```

**Phase plan**:
- **Phase A ship v1**: blocks 1-8 + 10 (HAZE) + 17 (4 footswitches) + 19 + 20. Core delay-EQ-tongue + base perform. **Months 1–12 R&D**.
- **Phase B v1.5**: + blocks 11-16, 18. Full hot palette + CRASH. **Months 12–18**.
- **Phase B2 v2 premium**: motorized tongue resonator (Block 8 motorized variant), BLDC motor option (Block 4 premium). **Months 18–27**.

---

## Блок 1. Power supply (dual SKU)

### Eurorack SKU — ±12V from rack bus

Identical к Last Night Block 1. Eurorack 16-pin Doepfer connector → ±12V analog rails + +5V LDO для digital (MCU + LED).

```
Eurorack 16-pin → D_P1 (1N5817) → +12V audio
                → D_P2 (1N5817) → -12V audio
                → 7805 LDO → +5V digital

  Decoupling per IC: 100nF X7R + 10µF tantalum.
  Bulk: 47µF electrolytic на ±12V rails.
  Solenoid path: ferrite bead на +12V supply line к Block 18 (CRASH).
```

### Pedal SKU — 12V DC + isolated DC-DC (см. Block 20)

12V DC center-negative jack → isolated DC-DC ±12V → identical к Eurorack rails. Detailed в Block 20.

**Power budget Last Day v1**:
- Audio analog (±12V): ~120 mA на rail steady-state.
- Solar amp opt circuit (variable rail 3–8V): 40 mA peak.
- Motor (12V DC, PWM duty 50%): **350 mA avg, 700 mA peak**.
- Digital (+5V LDO): 40 mA (MCU + LEDs + small logic).
- Solenoid CRASH pulse (intermittent): 290 mA peak, 5% duty avg.
- **Total**: ~430 mA steady, ~1000 mA peak (motor + CRASH simultaneous).

**External supply requirement (pedal SKU)**: **12V DC center-negative, 1000 mA min, regulated**. Higher than Last Night (which needed 500mA) — motor is dominant draw.

---

## Блок 2. Input buffer + dry split

```
J_IN ──► C_IN 1µF film ──► R_IN 1MΩ (Hi-Z bias)
                                 │
                                 ▼
                          U1A (TL072 half) — unity buffer
                                 │
                       ┌─────────┴─────────┐
                       ▼                   ▼
                  Dry split tap         To solar amp (Block 3)
                  ──► R_DRY 10k          
                  ──► dry mix bus       
                  ──► DRY OUT jack
                  via R_DRY_OUT 100R
```

| Ref | Value | Function |
|-----|-------|----------|
| C_IN | 1µF MKS2 film | DC block |
| R_IN | 1MΩ 1% MF | Hi-Z bias |
| U1A | TL072 half | Buffer |
| R_DRY | 10kΩ 1% MF | Dry mix bus feed |
| R_DRY_OUT | 100Ω 1% MF | DRY OUT jack isolator |

**Why TL072 (not premium OPA)**: Block 2 sees instrument-level signals (~0 dBV typical). TL072 noise floor (-100 dBV) sufficient. Premium SKU may upgrade к OPA1641 (FET input, lower distortion) — see Decision 10 elite tier.

**BOM**: $0.50 active + $0.30 passives = **$0.80**.

---

## Блок 3. Solar amp (starved saturator)

**Topology**: Class A common-emitter BJT amplifier с **variable rail voltage** controlled by ambient light. Solar cell + internal LED → photoresistor → voltage divider → opt rail.

```
   Audio in (от Block 2) ──► C_AC 470nF (DC block)
                                  │
                                  ▼
                            R_B1 100k base bias (to opt rail/2)
                                  │
                                  ▼
                           ┌─── Q_SAT 2N5089 ───┐
                           │  (low-noise NPN,    │
                           │   hi-β)             │
                           │                     │
                           │   Collector ──► R_C 4.7k ──► opt rail (3-8V)
                           │   Emitter ──► R_E 470Ω ──► GND
                           │                     │
                           └─────────────────────┘
                                  │
                                  ▼
                            C_OUT_SAT 4.7µF film
                                  │
                                  ▼
                            R_SAT_OUT 10k ──► to oil-can write
                                            electrode (Block 5)

   ┌──── Opt rail control ────┐
   │                            │
   │  Solar cell (40×30mm)     │
   │  V_sc = 0–6V outdoor       │
   │       ◊──┐                 │
   │          │                  │
   │  Internal LED (×3 Cree XP-G2 на panel under diffuser)
   │  Driven by RV_SOLAR pot:    │
   │   RV_SOLAR ──► R_LED 10Ω ──► LEDs ──► GND
   │   → LED brightness 0–100%   │
   │   → light reaches photoresistor│
   │                              │
   │  Photoresistor R_LDR (GL5528):│
   │   Resistance 5MΩ (dark) → 1kΩ (bright)
   │                              │
   │   R_LDR + R_FIX 10k divider │
   │   to +12V → opt rail node    │
   │   variable 3V (dark/LED min)│
   │           to 8V (bright/LED full or solar) │
   │                              │
   │  SW_SOURCE SPDT toggle:      │
   │    INTERNAL: only LED drives R_LDR
   │    SOLAR+LED: solar cell + LED parallel → higher peak rail   │
   └──────────────────────────────┘
```

### Component values

| Ref | Value | Function |
|-----|-------|----------|
| C_AC | 470nF film | Audio AC couple |
| R_B1 | 100kΩ 1% MF | Base bias |
| Q_SAT | **2N5089** (lo-noise high-β NPN) | Saturator gain stage |
| R_C | 4.7kΩ 1% MF | Collector load |
| R_E | 470Ω 1% MF | Emitter degeneration |
| C_OUT_SAT | 4.7µF MKS2 | Output AC couple |
| R_SAT_OUT | 10kΩ 1% MF | Source impedance |
| Solar cell | 40×30mm crystalline Si, 6V/100mA peak | Light-driven supply |
| LEDs | 3× Cree XP-G2 Neutral White | Internal baseline |
| R_LED | 10Ω 1W | LED current limit (12V → 3× LED ~9V → 100mA через 10Ω) |
| R_LDR | GL5528 photoresistor | Light → resistance transducer |
| R_FIX | 10kΩ 1% MF | LDR divider companion |
| RV_SOLAR | 100kΩ log Alpha RV09 | LED brightness control |
| SW_SOURCE | SPDT mini-toggle | INTERNAL / SOLAR+LED select |

### Operation

- **Indoor, RV_SOLAR low**: dim LED → high R_LDR → low opt rail (~3V) → starved supply → BJT heavily clips at small signals → heavy saturation.
- **Indoor, RV_SOLAR high**: bright LED → low R_LDR → high opt rail (~7V) → clean amp, headroom restored.
- **Outdoor, SOLAR+LED**: ambient sun adds к LED light → R_LDR drops further → opt rail to ~8V → clean. Ambient light **modulates saturation depth in real-time**.

### Saturation character

- Q_SAT 2N5089 — single BJT, **asymmetric clipping** (positive half compresses earlier than negative). Adds 2nd harmonic.
- При low opt rail (3V): clipping kicks in @ ~0.5V peak → audible на любых signal levels.
- При high opt rail (8V): clipping @ ~3V peak → only loud signals clip.
- Frequency response: flat 40Hz–20kHz внутри rail headroom.

**BOM**: Q_SAT $0.20 + LEDs $1.50 (×3 Cree XP-G2) + solar cell $4 + LDR $0.80 + caps + resistors $1.00 + RV_SOLAR $1.50 + SW_SOURCE $0.50 = **~$9.50**.

**Premium SKU upgrade**: replace 2N5089 c **2SK170 BL** (JFET — softer asymmetric clipping, less harsh) +$3. Or **2SC2240** (Toshiba lo-noise NPN, $1.50 each).

---

## Блок 4. Oil-can engine — motor driver + speed control

**Function**: control rotation speed of acrylic disk (carries oil layer + dielectric film) inside cartridge. PWM-driven DC motor (brushed budget / BLDC premium). Speed range 200–2000 RPM mapped к 800ms–60ms delay time.

### Brushed DC motor driver (budget)

```
   PWM input from speed control logic ──► R_GATE_MOT 1k
                                                  │
                                                  ▼
                                          Q_MOT IRLZ44N (logic-level N-MOSFET)
                                                  │
                                                  ├──► Drain to motor (+)
                                                  ▼
                                                Source to GND
                                                  
   Motor (+) ──► +12V via D_MOT (MUR420 flyback)
   Motor (–) ──► Q_MOT drain (low-side switch)
   
   Brushed DC motor: 12V, 1000 RPM/V Kv, R_arm ~5Ω
   At PWM duty 50%: avg V = 6V → speed ~600 RPM
   At PWM duty 100%: avg V = 12V → speed ~1200 RPM (max for surface speed limits)
   
   D_MOT (MUR420): fast recovery flyback diode
                   Stores L*I energy при PWM off-period → returns к rail
   
   Snubber: R_SNUB 22Ω + C_SNUB 100nF X7R на motor (+)/(-) — kills brush noise
```

### Speed control PWM source

```
   ATtiny85 (shared MCU, dedicated chip — отдельно от Last Night's если не shared bank)
        │
        ├── Timer1 fast PWM (62.5 kHz, 8-bit duty) → motor gate
        │
        ├── ADC inputs:
        │    ├── ADC1: RV_TIME wiper → desired speed
        │    ├── ADC2: J_TIME_CV jack (CV-modulate)
        │    └── ADC3: encoder optical sensor on motor shaft (premium speed feedback)
        │
        └── Firmware:
             - PID loop (motor speed feedback) — premium SKU
             - Open-loop PWM duty mapping (budget SKU)
             - HAZE LFO sum (Block 10) — modulates duty
             - MIRAGE noise→S&H sum (Block 11) — modulates duty
             - DRAG footswitch input: pulls duty к 0 → motor stops
```

### Motor selection

| Tier | Part | Cost | Pros | Cons |
|------|------|------|------|------|
| **Budget** | Mabuchi RS-385 (12V, 6500 RPM unloaded) | $3 | Cheap, available | Brush noise, 5000h life, speed jitter ±5% |
| **Premium** | Maxon DCX 22S (12V, 3000 RPM, gear-reduced) | $80 | <0.5% jitter, 30000h, low brush noise | Expensive, 4 weeks lead |
| **Elite** | Faulhaber 2237 BLDC + DEC 24/3 driver | $250 | No brushes, ~zero jitter | Requires Hall sensor decoding в driver IC |

**Recommended for v1 ship**: budget Mabuchi RS-385 + gear reduction 10:1 (planetary gearhead $5) → speed range 200–1200 RPM. Brush noise filtered by snubber + ferrite bead.

### Speed → delay time mapping

For 60mm diameter disk with 2 electrodes 180° opposite (write + read):
- Path length per revolution: π × 60mm = 188.5mm.
- At 200 RPM = 3.33 rev/s → 1 rev = 300ms → 180° = 150ms BUT...
- **Capacitive sensing pickup is continuous along electrode path**, not point-like.
- Effective delay = time from write electrode to read electrode along disk surface.
- With write @ 0°, read L @ 90°, read R @ 180°: 
  - L tap at 200 RPM: 0.25 rev / 3.33 rev/s = **75ms**.
  - R tap at 200 RPM: 0.50 rev / 3.33 rev/s = **150ms**.
- At 1200 RPM: L tap = 12.5ms, R tap = 25ms.

**Adjustment**: чтобы достичь target range 60ms–800ms, нужно либо:
- (a) Use slower minimum speed (33 RPM → R tap 900ms) — потребует gear reduction.
- (b) Multi-loop sampling: read electrodes sense charge wrapped multiple times around disk → effective delay = several rotations.

**Decision (Phase A)**: budget motor с 10:1 gear → range 20–120 RPM motor shaft = 200–1200 RPM disk via friction wheel. L tap: 75ms–800ms. R tap: 150ms–1500ms (longer wraps if friction wheel slips slightly).

### Component values

| Ref | Value | Function |
|-----|-------|----------|
| Q_MOT | IRLZ44N N-MOSFET TO-220 | Motor switch |
| D_MOT | MUR420 fast diode | Flyback |
| R_GATE_MOT | 1kΩ 1% | Gate drive |
| R_GATE_PULLDOWN | 100kΩ 1% | Gate pulldown (safe-off) |
| R_SNUB | 22Ω 1W | Snubber R |
| C_SNUB | 100nF X7R | Snubber C |
| Ferrite bead | FB1 1kΩ@100MHz | EMI suppression on +12V supply to motor |
| Motor | Mabuchi RS-385 12V (budget) | Brushed DC |
| Gearhead | 10:1 planetary | Speed reduction |
| RV_TIME | 100kΩ log Alpha RV09 | Speed knob |
| Optical encoder (premium) | Honeywell 1OPB370W55 + slotted disk | Speed feedback |

**BOM (budget)**: Motor $3 + gearhead $5 + Q_MOT $1 + D_MOT $0.40 + RV_TIME $1.50 + snubber/ferrite $1 + ATtiny share $0.50 = **~$12.40**.

**BOM (premium with PID encoder)**: + Maxon motor $77 + encoder $20 = **+$97 = ~$109.40**.

---

## Блок 5. Capacitive write electrode + HV bias

Write electrode = stationary metal plate (~10mm × 5mm Cu) positioned 0.5mm от disk surface. Disk surface coated с conductive oil layer (Tel-Ray principle).

**HV bias** (~+30V DC) на write electrode creates electrical field through oil dielectric → audio signal modulates charge stored at electrode-disk gap → moves with disk rotation к read electrodes.

```
   Audio in (от solar amp Block 3 + feedback Block 9 sum) ──► R_W_IN 100k
                                                                  │
                                                                  ▼
                                                          C_AC_W 1µF
                                                                  │
                                                                  ▼
                                                  Sum node ──► R_W_SERIES 10k
                                                                  │
                                                                  ▼
                                                  ┌─── +30V HV bias node ─┐
                                                  │   R_HV_BIAS 10MΩ      │
                                                  │   (sets DC bias       │
                                                  │    while passing      │
                                                  │    audio AC)          │
                                                  │                       │
                                                  ▼                       │
                                          C_HV_DECOUP 100nF X7R 50V       │
                                          (HV bias decoupling)            │
                                                  │                       │
                                                  ▼                       │
                                          Write electrode ──── oil disk ──┘
                                          (Cu pad 10×5mm)         │
                                          ~0.5mm gap              │
                                                                  ▼
                                                          Read electrodes (Block 6)

   HV bias generation:
   +12V ──► boost converter (LT1373 или TPS61040, ×3 step-up) ──► +30V
        ├── R_HV_LIMIT 10Ω (current limiter, max 5mA → P = 0.025W)
        ├── C_HV_BIG 10µF 50V electrolytic (bulk)
        ├── C_HV_FAST 100nF X7R 50V (HF decouple)
        └── D_HV_PROT 1N4148 (over-voltage clamp к +12V if HV fault)
```

### Why +30V (not higher)

- Higher bias → larger signal → better SNR.
- But: oil breakdown voltage typically 40–60V для conductive mineral oil + additive (depends на composition).
- 30V leaves safety margin.
- 30V available cheaply (small boost converter, ~$3 BOM).
- Higher voltages (100V+) need step-up transformer → BOM $10+ + more switching noise.

### Component values

| Ref | Value | Function |
|-----|-------|----------|
| R_W_IN | 100kΩ 1% MF | Input feed |
| C_AC_W | 1µF MKS2 | AC couple |
| R_W_SERIES | 10kΩ 1% MF | Source isolation |
| R_HV_BIAS | 10MΩ 1% MF | HV bias resistor (passes AC, holds DC) |
| C_HV_DECOUP | 100nF X7R 50V | HV decouple |
| Boost converter | TPS61040 SOT-23-5 | +12V → +30V step-up |
| Inductor L_BOOST | 22µH SMD | Boost inductor |
| D_BOOST | MBR0530 Schottky | Boost rectifier |
| C_HV_BIG | 10µF 50V electrolytic | Bulk |
| C_HV_FAST | 100nF X7R 50V | HF decouple |
| R_HV_LIMIT | 10Ω 1W | Current limit |
| D_HV_PROT | 1N4148 | Overvoltage clamp |
| Write electrode | Cu pad 10×5mm on cartridge PCB | Field plate |

**Safety**: HV bias only +30V (low voltage classification, no special handling required). Boost converter integrated на main PCB (не в cartridge). Cartridge wiring: simple solder pad + 50V-rated wire.

**BOM**: Boost converter + L + D + caps = $1.50 + Cu electrode (PCB-fab cost negligible) + bias resistor $0.10 + decoupling $0.20 = **~$1.80** (excluding cartridge PCB amortized).

---

## Блок 6. Capacitive read frontend — dual electrode

Two read electrodes, 90° + 180° от write electrode (along disk circumference). Each electrode senses field stored in oil layer as disk rotation carries signal past.

**Critical**: capacitive read = **extremely high impedance** (~10–100GΩ effective). Needs JFET frontend на cartridge side OR very-short trace to JFET on main PCB.

### Topology — JFET source-follower on cartridge

```
   Read electrode L (Cu pad на cartridge PCB)
        │
        │  (~5pF capacitive coupling, ~0.5mm gap to disk)
        ▼
   J_RL_GATE (LSK489A or LSK170A half — gate input)
        │  (gate impedance 10^12 Ω)
        │
   R_RL_LEAK 1GΩ (bias resistor; only needs to fight subthreshold leakage)
        │
        ▼
   GND (gate held at GND via R_RL_LEAK; signal floats around this on AC)
        │
   Source (LSK489A output)
        │
        ├──► R_RL_SRC 4.7k ──► -12V (constant-current biased)
        │
        ▼
   Source follower output (low impedance ~few kΩ)
        │
        ▼
   J_PA mini-XLR (Switchcraft TA3M, shielded)
        │
   (cable to main PCB — Belden 1693A double-shielded ~30cm)
        │
        ▼
   Main PCB: 100k-input non-inverting buffer (TL072)
        │
        ▼
   Low-impedance audio bus → Block 7 (inductive EQ)
   
   Same chain for read electrode R → second JFET half → J_PB mini-XLR
```

### Why JFET-on-cartridge

- Capacitive electrode = nanofarads or less of gate capacitance. Direct cable → huge Miller effect + microphonic pickup + radiated noise.
- Source-follower buffer на cartridge: presents low impedance к cable → cable becomes noise-immune.
- LSK489A dual matched JFET = same chip used в Last Night's piezo preamp → **identical sourcing strategy, identical handling**.

### Component values (per electrode)

| Ref | Value | Function |
|-----|-------|----------|
| LSK489A | dual matched N-JFET SOT-23-6 | Source-follower (one half per L/R electrode) |
| R_RL_LEAK | 1GΩ 1% MF (high-impedance, ferrite-bead protected) | Bias |
| R_RL_SRC | 4.7kΩ 1% MF | Source resistor |
| J_PA / J_PB | Switchcraft TA3M (mini-XLR) on cartridge side | Shielded audio out |
| C_AC_RL | 470nF film | AC couple to main PCB buffer |
| R_MAIN_BIAS | 100kΩ 1% MF | Main PCB bias for buffer input |

**Note**: Shared **same LSK489A** with Last Night dual JFET piezo preamp — both modules use same part, simplifies sourcing.

### Main PCB buffer

```
   J_PA (mini-XLR) ──► C_AC_RL 470nF ──► R_MAIN_BIAS 100k → GND
                                            │
                                            ▼
                              U_BUF (TL072 half) — non-inverting buffer
                                            │
                                            ▼
                              Audio bus L → Block 7
   
   J_PB ──► identical chain → Audio bus R
```

**Why dual electrode (L+R stereo wet)**:
- Two electrodes at 90° + 180° gives **different delay times для L and R** — stereo spread emerges naturally.
- L tap shorter (90° offset) = early reflection.
- R tap longer (180° offset) = late reflection.
- Result: stereo widening without any digital processing.

### Verification

- [ ] Bench: scope read electrode signal with motor at 600 RPM, audio test signal 1kHz → confirm capacitive coupling delivers ~50mVrms (typical, depends on bias and oil composition).
- [ ] Noise floor measurement: open-input → < -85 dBV referenced к main PCB output.
- [ ] Stereo separation L/R: > 12 dB (electrode offset gives natural separation).

**BOM (per cartridge instance)**: LSK489A $6 + cartridge mini-XLR ×2 $2.40 + R_RL_LEAK ×2 + R_RL_SRC ×2 $0.40 + cartridge PCB FR4 ($1) + on-main buffer side $0.80 = **~$10.60** per cartridge.

---

## Блок 7. Inductive shelf EQ (LO/HI)

**Topology**: passive inductor-based shelving EQ, ±12dB low shelf @ 150Hz + ±12dB high shelf @ 4kHz. **Classic guitar-amp tone-stack topology** modified для shelf instead of bandpass.

### Schematic

```
   Audio in (от Block 6 buffer) ──► C_EQ_IN 1µF
                                          │
                                          ▼
                                  ┌─── Low shelf cell ───┐
                                  │  L_LO 100mH Hammond  │
                                  │  + RV_LO_SHELF 50k   │
                                  │  (cut/boost control) │
                                  │  + C_LO 1µF          │
                                  │                       │
                                  │  Boost mode: L_LO     │
                                  │   shunts HF к GND     │
                                  │   → effective LF boost│
                                  │                       │
                                  │  Cut mode: bypass L_LO│
                                  │   → flat HF, attenuated LF│
                                  └──────────┬────────────┘
                                              │
                                              ▼
                                  ┌─── High shelf cell ──┐
                                  │  L_HI 10mH Hammond   │
                                  │  + RV_HI_SHELF 50k   │
                                  │  + C_HI 100nF        │
                                  │                       │
                                  │  Boost: L_HI series   │
                                  │   blocks LF, passes HF│
                                  │                       │
                                  │  Cut: bypass shelf    │
                                  └──────────┬────────────┘
                                              │
                                              ▼
                                  Audio out → Block 8 tongue resonator
```

### Inductor values

- L_LO 100mH (Hammond 158T or 159T): cuts off below 150Hz when in shunt path → effective low-shelf corner.
- L_HI 10mH (Hammond 159L): blocks low frequencies, lets high pass.

**Why inductors (not Sallen-Key op-amp EQ)**:
- Physical "iron" sound — inductor saturation adds harmonic content at high signal levels.
- Phase response distinct from op-amp filters (gentler curve, more "vintage").
- Hammond inductors $8-15 each — affordable for hi-fi grade.
- BUT: bulky (24×24×16mm typical), heavy (40g each), microphonic if not mounted carefully.

**Alternative (Phase 2 cost reduction)**: Sallen-Key shelf EQ with TL072 — cheaper, smaller, но "cleaner" sound. Decision based on prototype A/B test.

### Component values

| Ref | Value | Function |
|-----|-------|----------|
| C_EQ_IN | 1µF MKS2 | Input AC |
| L_LO | Hammond 159T 100mH | Low shelf inductor |
| C_LO | 1µF MKS2 | Low shelf cap |
| RV_LO_SHELF | 50kΩ lin (center detent) | Low cut/boost |
| L_HI | Hammond 159L 10mH | High shelf inductor |
| C_HI | 100nF C0G | High shelf cap |
| RV_HI_SHELF | 50kΩ lin (center detent) | High cut/boost |

**BOM**: L_LO $12 + L_HI $9 + caps $1.50 + pots $3.00 = **~$25.50**. Dominant cost in Last Day BOM.

---

## Блок 8. Tongue resonator (manual clamp v1)

**Physical implementation**: thin metal strip clamped at one end (fixed at chassis), with movable clamp jaw that slides along strip → changes effective vibrating length → changes resonant frequency.

### Mechanical layout

```
   ┌────────────────────────────────────────┐
   │                                          │
   │  ┌──────────────────────────┐            │ ← clamp jaw mounted к
   │  │                          │            │   lead screw nut
   │  │       Tongue strip       │            │
   │  │  (Stainless 304, 80×8×0.4mm)│         │  ┌─ Knob ⊙TONGUE
   │  │                          │            │  │  (panel-mounted, drives
   │  └──────────────────────────┘            │  │   lead screw through
   │   ▲                         ▲            │  │   flexible PTFE coupler)
   │   │                         │            │  └────────────────────┘
   │  Fixed clamp           Movable clamp     │
   │  (chassis mount)       (slides on rail)  │
   │                         + lead screw M3  │
   │                                          │
   │  Piezo pickup at fixed-clamp end:        │
   │   27mm piezo disk bonded к chassis       │
   │   under tongue contact point             │
   │                                          │
   │  Driver: exciter Dayton DAEX25FHE-4      │
   │   mounted на opposite face of fixed clamp│
   │   excites tongue в bending mode          │
   │                                          │
   └──────────────────────────────────────────┘
```

### Electrical signal flow

```
   Audio (from Block 7 EQ output) ──► tongue exciter (DAEX25FHE-4)
                                              │
                                              ▼
                                  Tongue strip vibrates в bending mode
                                  Resonant freq: f = (1.875)² × √(EI/ρA) / (2π × L²)
                                  Where L = effective length (set by clamp position)
                                  Stainless 304 strip 80×8×0.4mm:
                                    L = 80mm → f ≈ 200 Hz (max length)
                                    L = 20mm → f ≈ 2 kHz (min length, clamp near piezo)
                                  
                                              │
                                              ▼
                                  Piezo pickup (27mm disk @ fixed clamp)
                                              │
                                              ▼
                                  Piezo buffer (LSK489A spare half OR TL072 hi-Z):
                                  R_P_LEAK 10MΩ + source-follower
                                              │
                                              ▼
                                  Sum back into mix bus (Block 19)
                                  via RV_RES_SEND (tongue resonance amount)
```

### Tongue parameters

| Parameter | Value | Note |
|-----------|-------|------|
| Strip material | Stainless 304 (or spring steel 1095 premium) | 80×8×0.4mm |
| Strip mass | ~5g | Spring steel slightly denser |
| Young's modulus E | 200 GPa (304) | Standard |
| Density ρ | 8000 kg/m³ | Standard |
| Resonance Q (free) | ~80 | Air damping minimal |
| Resonance Q (with clamp pressure adjustment) | 1-15 | Higher pressure = lower Q (damped) |
| Effective length range | 20mm (clamp near piezo) — 80mm (clamp at far end) | |
| Resonant freq range | 2 kHz (short L) — 200 Hz (long L) | Bending mode fundamental |

### Clamp pressure → Q control

```
   ⊙Q knob (RV_TONGUE_Q 100k lin)
        │
        ▼
   Rotation → mechanical lever amplifies к compression spring
        │
        ▼
   Spring pushes movable clamp jaw против strip
        │
        ▼
   Higher pressure → more damping → lower Q
   Lower pressure → less damping → higher Q (near 15 max)
```

**Why mechanical Q control (not electrical)**:
- Q comes from physical damping — pressure on tongue is direct physical analog.
- Electrical Q control would require resonator excited by feedback loop с adjustable feedback gain → more complex, less authentic.

### Component values

| Ref | Value | Function |
|-----|-------|----------|
| Tongue strip | Stainless 304 80×8×0.4mm | Resonator body |
| Fixed clamp | M3 screw + brass jaw | Anchor |
| Movable clamp | brass jaw + M3 lead screw + compression spring | Movable anchor |
| Lead screw | M3×0.5mm pitch, 80mm long | Position control |
| RV_TONGUE_POS (panel knob) | mechanical (rotates lead screw via flexible coupler) | Position |
| RV_TONGUE_Q | 100kΩ lin (sends pot value to spring force solenoid OR mechanical lever) | Q control |
| Exciter | Dayton DAEX25FHE-4 (shared with Last Night BOM) | Drive |
| Piezo pickup | 27mm disk standard | Sense |

### Manual vs motorized (v1 vs v2)

**v1 manual**:
- ⊙TONGUE knob directly drives lead screw via flexible PTFE coupling.
- Travel: 60mm lead screw range → 60mm clamp position → 200Hz–2kHz sweep.
- User feel: smooth knob rotation, ~0.5 rev per Hz at low end.
- Cost: $5 mechanical bits + flexible coupler $2 = **$7 total mechanical**.

**v2 motorized**:
- Replace flexible coupler с **stepper motor 28BYJ-48** + driver IC ULN2003.
- ATtiny85 PWM step pulses to driver → motor turns lead screw → encoder reads position.
- CV input from J_TONGUE_CV (0-5V → full 60mm range).
- Preset recall: save position to EEPROM, recall via footswitch combo.
- Cost: +$8 stepper + $1 driver + $5 encoder + firmware = **+$14 vs v1**.

### Verification

- [ ] Sweep ⊙TONGUE pot full range → frequency sweep 200Hz–2kHz (±10%) measured via FFT.
- [ ] Q range with ⊙Q pot: 1 → 15 measured at fixed position (test frequencies should give 200 Hz with Q=15 narrow peak, Q=1 broad bump).
- [ ] No mechanical buzz between strip and chassis (small rubber damping pad на chassis under strip if needed).

**BOM (manual v1)**: tongue strip $1 + clamps $3 + lead screw + spring $2 + flexible coupler $2 + Q spring mech $3 + DAEX25 (shared) $11 + piezo 27mm $0.50 + LSK489A spare half (shared) — = **~$22.50** (significant cost driven by exciter).

---

## Блок 9. Feedback loop + soft-clip limiter

```
   From Block 8 tongue resonator OR direct from Block 7 EQ (selectable)
        │
        ▼
   RV_FEEDBACK 100k lin
        │
        ▼
   ┌─── Soft-clip limiter ──┐
   │  R_FBL_IN 10k          │
   │  ┌── D_FBL1 1N4148 ──┐ │ (parallel back-to-back diodes
   │  │                    │ │  + R series 10k → soft clip)
   │  └── D_FBL2 1N4148 ──┘ │
   │      anti-parallel       │
   │  R_FBL_OUT 10k           │
   │  → sum to oil-can write  │
   │    electrode (Block 5)   │
   └──────────────────────────┘
   
   SW_FREEZE (footswitch latching):
     UNPRESSED: feedback path connected (normal regen)
     PRESSED:   feedback path closed-loop, erase disabled
                → content stuck circulating через oil disk
                Slowly degrades (motor jitter + capacitive leakage)
                → "freeze" = decaying repeated loop
```

### Component values

| Ref | Value | Function |
|-----|-------|----------|
| RV_FEEDBACK | 100kΩ lin | Regen amount 0-95% |
| R_FBL_IN | 10kΩ 1% | Limiter input |
| R_FBL_OUT | 10kΩ 1% | Limiter output |
| D_FBL1, D_FBL2 | 1N4148 ×2 anti-parallel | Soft-clip diodes |
| SW_FREEZE | 3PDT latching footswitch | Loop lock |

**Why diode soft-clip (not op-amp limiter)**:
- 1N4148 soft-clip kicks in around ±0.65V → audible clipping when feedback approaches infinite gain → user hears "regen approaching" before runaway.
- Self-limiting feedback: oscillation amplitude stable around ±0.65V → no runaway.
- Cheap, proven topology.

**BOM**: RV_FEEDBACK $1.50 + diodes $0.02 + resistors $0.10 + SW_FREEZE $3.00 = **~$4.62**.

---

## Блок 10. HAZE — periodic motor mod LFO

**Function**: slow sinusoidal LFO 0.05–5 Hz adds к motor PWM duty → wow/flutter character.

### Topology

```
   ┌── LFO core (TL074 half) ─────┐
   │  Wien bridge or RC integrator-│
   │  comparator triangle generator│
   │  RV_HAZE_RATE 1MΩ log         │
   │  C_HAZE 1µF MKS2              │
   │  → Triangle ±5V               │
   └────────────┬──────────────────┘
                │
                ▼
   RV_HAZE 100k lin (center-detent — depth attenuverter)
                │
                + J_HAZE_CV summed via R_HAZE_CV 100k
                │
                ▼
   Buffered → digital level shift к 0-3.3V для ATtiny85 ADC
                │
                ▼
   ATtiny85 firmware: sum incoming LFO к base motor PWM duty
                     → motor speed modulates with LFO amplitude
                     → wow/flutter ±5% speed deviation typical
```

### Component values

| Ref | Value | Function |
|-----|-------|----------|
| LFO IC | TL074 quad half | LFO oscillator |
| RV_HAZE_RATE | 1MΩ log Alpha RV09 | Rate 0.05-5 Hz |
| C_HAZE | 1µF MKS2 | LFO timing cap |
| RV_HAZE | 100kΩ lin center-detent | Depth attenuverter |
| R_HAZE_CV | 100kΩ 1% | CV input mix |

**BOM**: TL074 share + RV_HAZE_RATE $1.50 + C_HAZE $0.80 + RV_HAZE $1.50 + R/jacks $0.50 = **~$4.30**.

---

## Блок 11. MIRAGE — aperiodic noise→S&H pitch drift

**Function**: random sample-and-hold gives motor random small speed offsets → unpredictable pitch drift ±10 cents.

### Topology

```
   D_NOISE_LD (BZX55C9V1 zener — separate from any digital noise) ──► hiss
        │
        ▼
   R_MIR_SRC 10k ──► CD4066 S1 (sample input)
                          │
                          │  S1 control ◄── slow ~1 Hz oscillator (RC Schmitt)
                          ▼
                  C_HOLD_MIR 100nF ──► S&H output
                          │
                          ▼
                  R_SLEW_MIR 47k + C_SLEW_MIR 1µF → slew 47ms
                          │
                          ▼
                  TL074 buffer
                          │
                          ▼
                  RV_MIRAGE 100k lin (depth)
                          │
                          + J_MIRAGE_CV summed via R_MIR_CV 100k
                          │
                          ▼
                  Buffered → level shift к ATtiny85 ADC
                          → sums to motor PWM duty
                          → ±10 cents pitch drift typical
```

### Component values

| Ref | Value | Function |
|-----|-------|----------|
| D_NOISE_LD | BZX55C9V1 | Noise zener |
| C_HOLD_MIR | 100nF NP0 | S&H hold cap |
| R_SLEW_MIR | 47kΩ 1% | Slew R |
| C_SLEW_MIR | 1µF MKS2 | Slew C |
| Oscillator R/C | 470k / 1µF | ~0.5 Hz S&H tick rate |
| RV_MIRAGE | 100kΩ lin | Depth |
| R_MIR_CV | 100kΩ 1% | CV input mix |
| 4066 S1 | shared CD4066BE | S&H switch |

**BOM**: zener $0.10 + share 4066 + R/C $0.80 + RV $1.50 + jacks $0.20 = **~$2.60**.

---

## Блок 12. BLEACH — HF saturation w/ solar threshold

**Function**: clipper в HF path (4–12 kHz band) с threshold modulated by solar amp opt rail (Block 3). Bright outdoor light → lower threshold → more saturation.

### Topology

```
   Audio bus ──► R_BL_IN 10k
                      │
                      ▼
              ┌─── HF emphasis pre-filter ─┐
              │  R_BL_HF 4.7k + C_BL_HF 22nF │ ← shelf @ ~1.5 kHz boost
              │  → +6 dB above 4 kHz          │
              └──────────────┬────────────────┘
                              │
                              ▼
              ┌─── Saturation cell ──┐
              │  Anti-parallel diodes │
              │  D_BL1, D_BL2 BAT85   │ ← Schottky soft-clip
              │  (lower Vf ~0.3V — gentler than 1N4148)
              │  Threshold = ±0.3V    │
              │                       │
              │  In series:           │
              │  RV_BLEACH 100k log   │ ← drives diodes harder = more sat
              └──────────────┬────────┘
                              │
                              ▼
              ┌─── HF de-emphasis post-filter ─┐
              │  Restore flat response          │
              │  -6dB above 4 kHz               │
              └──────────────┬─────────────────┘
                              │
                              ▼
              Mix into wet bus
   
   Solar threshold modulation:
       Solar opt rail (from Block 3, 3-8V range) ──► R_BL_THRESH 47k
              + +5V offset → 5-9V control voltage
              → modulates RV_BLEACH effective resistance
              → bright = more saturation, dim = less
              (implemented via OTA gain or 4066 in-series resistor swap)
```

### Component values

| Ref | Value | Function |
|-----|-------|----------|
| R_BL_IN | 10kΩ 1% MF | Input |
| R_BL_HF | 4.7kΩ 1% MF | HF emphasis |
| C_BL_HF | 22nF film | HF emphasis cap |
| D_BL1, D_BL2 | BAT85 Schottky | Soft clip |
| RV_BLEACH | 100kΩ log Alpha RV09 | Amount |
| R_BL_THRESH | 47kΩ 1% MF | Solar threshold mod |

**BOM**: passive + 2× BAT85 ($0.30) + RV_BLEACH $1.50 = **~$2.50**.

---

## Блок 13. TAR — peak-hold compressor (vise comp)

**Function**: anti-CHILL. Long-attack compressor: peaks slowly trigger compression, sustain stays compressed (hold), release slow → "viscous" effect.

### Topology

```
   Audio in ──► R_TAR_IN 10k ──► TL074 half (input buffer)
                                          │
                                          ├──► Sidechain rectifier:
                                          │     R_TAR_FW 10k → D_TAR 1N4148 → C_TAR_ENV 4.7µF
                                          │     Attack: R_TAR_ATT 22k × C = 100ms (slow attack)
                                          │     Hold: R_TAR_HOLD 1MΩ → very slow decay
                                          │     Release: R_TAR_REL 470k × C = 2 seconds
                                          │              "long molasses sustain"
                                          │
                                          ▼
                                  Envelope buffer (TL074)
                                          │
                                          ▼
                                  Inverted → drives U_TAR_VCA (LM13700 OTA) Iabc
                                  Higher envelope = less gain = compression
                                          │
                                          ▼
                                  Main audio path ──► U_TAR_VCA input
                                          │
                                          ▼
                                  Compressed audio ──► Mix bus
   
   RV_TAR (knob) — sets gain ratio (1:1 to 1:10)
   RV_TAR_THRESH (internal trim) — sidechain threshold
```

### Why slow attack + long release

- Slow attack 100ms: peaks pass through before compression activates → first transient untouched ("punch survives").
- Long release 2s: после compression activates, gain stays low for 2s → sustain compressed.
- Combined effect: drum transient passes, then sustain "tar-thick".

### Component values

| Ref | Value | Function |
|-----|-------|----------|
| R_TAR_IN | 10kΩ 1% | Input |
| R_TAR_FW | 10kΩ 1% | Half-wave rectifier |
| D_TAR | 1N4148 | HW rectifier |
| C_TAR_ENV | 4.7µF MKS2 | Envelope cap |
| R_TAR_ATT | 22kΩ 1% | Attack time |
| R_TAR_HOLD | 1MΩ 1% | Hold time |
| R_TAR_REL | 470kΩ 1% | Release time |
| U_TAR_VCA | LM13700 half | VCA |
| RV_TAR | 100kΩ log | Compression ratio |
| RV_TAR_THRESH | 50kΩ trim | Internal threshold |

**BOM**: LM13700 share + caps + resistors + pots = **~$3.20**.

---

## Блок 14. CICADA — cluster tick generator

**Function**: signal-correlated cluster ticks. Loud signals → more ticks. Quiet → few ticks. Cicada-like swarm texture.

### Topology

```
   Audio bus ──► envelope follower (similar к Block 13 sidechain)
                                          │
                                          ▼
                              Envelope → ADC1 ATtiny85
                                          │
                                          │  Firmware:
                                          │    tick_rate = envelope × scaling
                                          │    LFSR random clock
                                          │    Output pulses Ramp:
                                          │      tick rate 1-50 Hz signal-correlated
                                          │      tick width 5ms uniform
                                          │
                                          ▼
                              ATtiny85 OC0B PWM ─► R_C_LIM 4.7k
                                                     │
                                                     ▼
                                          Comparator threshold → CD4066 S2 audio gate
                                                     │
                                          Audio bus ──► CD4066 S2 ──► RV_CICADA 100k lin (amount)
                                                                       │
                                                                       ▼
                                                                  Mix bus
```

**Note**: ATtiny85 firmware shared с motor PWM duty (Block 4). Need careful scheduling — Timer0 для CICADA, Timer1 для motor PWM.

### Component values

| Ref | Value | Function |
|-----|-------|----------|
| Envelope follower | shared TL074 half (Block 13 reuse) | Sidechain |
| R_C_LIM | 4.7kΩ 1% | PWM filter |
| CD4066 S2 | shared CD4066BE | Audio gate |
| RV_CICADA | 100kΩ lin | Amount |

**BOM**: $1.80 (mostly RV).

---

## Блок 15. HEATWAVE — AM-tuner front-end

**Function**: receive AM broadcast band (530–1610 kHz) signals via ferrite-coil antenna → detect → mix as ghostly background.

### Topology

```
   Ferrite-coil antenna L_AM (200uH + tuning cap 365pF variable) → resonant @ tuned freq
        │
        ▼
   TA7642 (or MK484) AM detector IC
        │  Single-chip AM tuner:
        │   - Internal LO + mixer + detector
        │   - 1.5V single-supply
        │   - Audio out 100mV typical
        │
        ▼
   R_AM_OUT 10k ──► RV_HEATWAVE 100k log (level)
        │
        ▼
   Mix bus
   
   RV_AM_TUNE (panel) — variable cap rotated by user to tune stations
   SW_REGION (DPDT slide) — switches L_AM value для 50Hz/60Hz mains hum baseline reference
                                  (AM band identical worldwide; switch is для HUM antipode tracking)
```

### Note about reception variability

- AM reception depends на geography, time of day, building EMI environment.
- Indoor performance often catches only nearest strong stations + atmospheric noise.
- Outdoor antenna extension (J_HEAT_ANT external jack) helps значительно — added в design as optional.

### Component values

| Ref | Value | Function |
|-----|-------|----------|
| L_AM | Ferrite rod 100mm с antenna coil 200µH | Antenna |
| C_AM_TUNE | 365pF variable air cap | Tuning |
| TA7642 | AM detector IC (single-supply) | Tuner |
| RV_HEATWAVE | 100kΩ log | Level |
| J_HEAT_ANT | 3.5mm jack (optional external antenna) | External pickup |
| SW_REGION | DPDT slide | 50Hz/60Hz region |

**BOM**: L_AM ferrite + coil $3 + tuning cap $4 + TA7642 $1.50 + RV $1.50 + jack $0.50 = **~$10.50**.

---

## Блок 16. OLD VINYL — PT2399 parallel tract

**Function**: vinyl/tape decay character — PT2399 digital echo IC в **parallel** с main oil-can engine. Adds short delay (40-200ms) с lo-fi grunge.

### Topology

```
   Main audio path ─┬──► Oil-can engine (Block 4-6) main delay tract
                    │
                    └──► PT2399 parallel tract:
                          Audio in → R_PT_IN 10k → PT2399 pin 16 (audio in)
                                          │
                                  PT2399 (DIP-16):
                                   - Delay time 30-500ms via R_PT_TIME 50k pot
                                   - LPF roll-off ~4 kHz natural (deliberate lo-fi)
                                   - Output pin 14 → R_PT_OUT 10k
                                          │
                                          ▼
                                  RV_OLDVIN 100k lin (blend level)
                                          │
                                          ▼
                                  Mix bus (parallel to main wet path)
   
   RV_PT_TIME (panel, hidden behind set screw, "lo-fi delay time") — fixed during normal operation
                                  Default: 80ms (vinyl groove width feeling)
```

**Why parallel (not series)**:
- PT2399 in series would add 40-200ms на everything → unmuses oil-can character.
- Parallel: oil-can stays primary delay engine, PT2399 adds short grunge layer on top.

### Component values

| Ref | Value | Function |
|-----|-------|----------|
| U_PT | PT2399 DIP-16 | Lo-fi delay IC |
| R_PT_IN | 10kΩ 1% MF | Input |
| R_PT_OUT | 10kΩ 1% MF | Output |
| R_PT_TIME | 50kΩ multi-turn trim | Delay time set |
| RV_OLDVIN | 100kΩ lin | Blend level |
| Decoupling | 100nF X7R + 47µF tantalum | PT2399 supply |

**BOM**: PT2399 $1.50 + RV $1.50 + R/C $0.30 + trim $0.80 = **~$4.10**.

---

## Блок 17. Perform footswitches (KILL / FREEZE / DRAG / CRASH)

```
   Footswitch bay (4× 3PDT latching/momentary):
   
   KILL (momentary 3PDT):
     Press → ground audio bus through CD4066 ground switch (audio cut).
     Release → audio resumes.
     LED indicator: red on, off when bypass.
     
   FREEZE (latching 3PDT):
     Toggle → disconnect erase head (write electrode AC bias).
     Content loops infinitely, degrades slowly.
     Implementation: SW_FREEZE input к Block 9 → blocks erase/write feedback path.
     
   DRAG (momentary 3PDT):
     Press → ATtiny85 input pulled high → firmware sets motor PWM duty = 0.
     Motor coasts to stop. Pitch fades down to silence (capacitive readout stops).
     Release → motor resumes at last duty cycle.
     
   CRASH (momentary 3PDT):
     Press → triggers Block 18 (solenoid driver impulse).
     Pulse 10ms → splash в oil bath → hydrophone returns sound к input.
```

### Component values

| Ref | Value | Function |
|-----|-------|----------|
| KILL | 3PDT momentary | Audio cut |
| FREEZE | 3PDT latching | Erase disable |
| DRAG | 3PDT momentary | Motor brake trigger |
| CRASH | 3PDT momentary | Solenoid trigger |
| 4× LED indicators | 3mm Red Kingbright L-7104ID | Status |
| 4× R_LED | 1kΩ 1/4W | LED current limit |

**BOM**: 4× 3PDT $12 + LEDs + R = **~$13.00**.

---

## Блок 18. CRASH solenoid driver + hydrophone return

```
   CRASH footswitch press ──► +5V gate input
                                    │
                                    ▼
                            NE555 monostable
                            R_C_555 22k + C_C_555 470nF = ~11ms pulse
                                    │
                                    ▼
                            R_C_GATE 1k → Q_CRASH IRLZ44N MOSFET
                                    │
                                    ▼
                            Solenoid (12V push-type, 5N force, 5ms response)
                                    │  D_C_FB MUR420 flyback
                                    │
                                    ▼
                            Strikes oil bath wall → splash in oil →
                              hydrophone (piezo disk submerged в oil pocket
                              isolated от main cartridge для seal preservation)
                                    │
                                    ▼
                            Hydrophone signal → R_HYDR_IN 100k ──► TL072 hi-Z buffer
                                    │
                                    ▼
                            Sum back into Block 5 write electrode → audio chain
```

### Hydrophone implementation

Подводный piezo pickup — piezo disk (27mm Kingbright) bonded к brass housing, brass submerged в **separate sealed oil pocket** (не main oil bath — to avoid cartridge resealing complexity).

Oil pocket: 5ml mineral oil в acrylic ball (~30mm diameter) bonded к chassis. Solenoid plunger strikes ball wall → vibration transmits to oil → hydrophone picks up.

### Component values

| Ref | Value | Function |
|-----|-------|----------|
| NE555 | DIP-8 | Monostable |
| R_C_555 | 22kΩ 1% | 555 timing R |
| C_C_555 | 470nF film | 555 timing C |
| R_C_GATE | 1kΩ 1% | Gate drive |
| Q_CRASH | IRLZ44N | Solenoid driver |
| D_C_FB | MUR420 | Flyback |
| Solenoid | Adafruit 412 (12V push, 5N) | Striker |
| Hydrophone | 27mm piezo + acrylic ball + 5ml oil | Pickup |
| R_HYDR_IN | 100kΩ 1% MF | Hi-Z input |

**BOM**: 555 $0.25 + Q + D $1 + solenoid $5 + hydrophone (custom) $4 + R/C $0.50 + RV — = **~$10.75**.

---

## Блок 19. Mix bus + output buffer

```
   Inputs (summed via R_SUM 22k each):
     ├── Dry tap (Block 2, post-buffer)
     ├── Wet L (from EQ → tongue resonance chain, Block 7-8)
     ├── Wet R (similar, second electrode path)
     ├── BLEACH wet (Block 12)
     ├── CICADA ticks (Block 14)
     ├── HEATWAVE AM (Block 15)
     ├── OLD VINYL PT2399 (Block 16)
     └── Hydrophone CRASH (Block 18 return)
   
   ⊙Mix (RV_MIX 100k center-detent) crossfade dry/wet:
     CCW: dry only.
     CW: wet only.
     Center: 50/50 mix.
   
   Output:
     U_OUT_L (TL074 half): non-inverting summing → +output L
     U_OUT_R (TL074 half): non-inverting summing → +output R
     R_OUT_PROTECT 100Ω + C_OUT_PROTECT 10µF на каждом канале
     J_OUT_L (TRS + RCA parallel) / J_OUT_R
   
   DRY OUT, WET OUT separate jacks (post-buffer taps).
```

### Component values

| Ref | Value | Function |
|-----|-------|----------|
| R_SUM | 22kΩ 1% MF ×8 | Summing |
| U_OUT_L / U_OUT_R | TL074 halves | Output buffers |
| RV_MIX | 100kΩ lin (center-detent) | Dry/wet balance |
| R_OUT_PROTECT | 100Ω 1% | Short protection |
| C_OUT_PROTECT | 10µF MKS2 | DC block |
| J_OUT_L / J_OUT_R | TRS + RCA parallel | Outputs |
| J_DRY_OUT, J_WET_OUT | TRS | Auxiliary outputs |

**BOM**: TL074 share + R_SUM + RV_MIX $1.50 + caps + jacks = **~$3.80**.

---

## Блок 20. Isolated DC-DC (pedal SKU only)

Identical к Last Night Block 19 (also called Block 19 there). Same TRACO TMR 3-1212WI (budget) / Recom RKD-1212-D (premium) selection.

**Key difference vs Last Night**:
- Last Day has motor + solenoid → **needs RKD-1212-D 250mA** для both SKUs (TRACO 125mA insufficient when motor + CRASH simultaneous).
- Budget Last Day pedal: RKD-1212-D = +$22 BOM (vs $13 для TRACO у Last Night budget).

**External supply requirement**: **12V DC center-negative, 1000 mA min** (higher than Last Night's 500mA due to motor load).

---

## Полный BOM

### Active components

| Ref | Part | Qty | Unit $ | Total $ |
|-----|------|-----|--------|---------|
| U1, U2 | TL072 | 2 | $0.50 | $1.00 |
| U3, U4 | TL074 | 2 | $0.75 | $1.50 |
| U_VCA | LM13700 (TAR VCA) | 1 | $2.00 | $2.00 |
| Q_SAT | 2N5089 | 1 | $0.20 | $0.20 |
| Q_MOT | IRLZ44N | 1 | $1.00 | $1.00 |
| Q_CRASH | IRLZ44N | 1 | $1.00 | $1.00 |
| TPS61040 | Boost +30V | 1 | $1.20 | $1.20 |
| TA7642 | AM detector | 1 | $1.50 | $1.50 |
| PT2399 | Lo-fi delay | 1 | $1.50 | $1.50 |
| NE555 | CRASH monostable | 1 | $0.25 | $0.25 |
| ATtiny85 | MCU (motor PWM + CICADA + DRAG logic) | 1 | $1.50 | $1.50 |
| CD4066BE | Quad analog switch (S&H + audio gate) | 1 | $0.40 | $0.40 |
| LSK489A | Dual JFET (capacitive read + tongue piezo) | 1 | $6.00 | $6.00 |
| 7805 LDO | +5V | 1 | $0.30 | $0.30 |
| **Subtotal active** | | | | **$19.35** |

### Passive components

| Group | Count | Approx total |
|-------|-------|---------------|
| Resistors 1/4W MF 1% | ~50 | $2.50 |
| Capacitors (film + ceramic + electrolytic) | ~30 | $8.00 |
| Pots Alpha RV09 (Time, FB, Mix, Solar, Q, Tongue, HAZE rate, HAZE, MIRAGE, BLEACH, TAR, CICADA, HEATWAVE, OLDVIN, LO shelf, HI shelf, Tone) | 17 | $25.50 |
| Trim pots (multi-turn) | 4 | $3.20 |
| Switches (slide 1P5T, SPDT mini, DPDT region) | 3 | $3.00 |
| Diodes (1N4148, BAT85, MUR420, 1N5817) | ~12 | $1.20 |
| Inductors (Hammond shelf EQ ×2, ferrite bead, boost L) | 4 | $25.00 |
| Solar cell | 1 | $4.00 |
| LEDs (3× Cree XP-G2 panel + 4× footswitch indicators) | 7 | $2.00 |
| LDR (GL5528) | 1 | $0.80 |
| **Subtotal passives** | | **$75.20** |

### Mechanical

| Item | Cost |
|------|------|
| Motor + 10:1 gearhead (budget) | $8 |
| Oil-can disk + acrylic enclosure | $5 |
| Conductive mineral oil 60ml | $3 |
| Tongue strip + clamps + lead screw + flexible coupling | $8 |
| Solenoid (Adafruit 412) | $5 |
| Hydrophone (piezo + acrylic ball + oil pocket) | $4 |
| Cartridge interface (4× JST-XH + 2× mini-XLR + magnets) | $6 |
| Footswitches 3PDT ×4 | $12 |
| Knobs (Davies 1900H budget) ×17 | $8.50 |
| Mini-XLR jacks (panel-mount) ×2 | $2.40 |
| TRS + RCA jacks panel (×4 audio I/O) | $4 |
| 3.5mm CV jacks ×15 | $7.50 |
| 12V DC jack (pedal SKU) | $1 |
| Eurorack power connector OR DC barrel | $1 |
| **Subtotal mechanical** | **~$75.40** |

### Power

| Item | Cost |
|------|------|
| Pedal isolated DC-DC: RKD-1212-D | $22 |
| Decoupling caps | $2 |
| **Subtotal power (pedal SKU)** | **$24** |

### PCB

| SKU | Cost |
|-----|------|
| Eurorack 40HP (2-layer FR4 1.6mm) | $6 |
| Pedal big-box (2-layer FR4 1.6mm 203×140mm) | $9 |

### Subtotals

| Category | Subtotal |
|----------|----------|
| Active | $19.35 |
| Passives | $75.20 |
| Mechanical | $75.40 |
| Power (pedal) | $24.00 |
| PCB | $7.50 (avg) |
| **Last Day budget BOM** | **~$201.45** |
| Premium SKU upgrade (Maxon motor + Cree LEDs + 2SK170 + OPA1641 op-amps) | +$120 |
| **Last Day premium BOM** | **~$321.45** |

**Retail target**: $799 budget / $999 premium (margin 4× — higher than Last Night because of motor + oil mechanics complexity).

---

## PCB layout — зоны

### Zone diagram (Eurorack 40HP, top view)

```
┌─────────────────────────────────────────────────────────────────────┐
│  PCB 190 × 108mm (40HP format)                                       │
│                                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────┐            │
│  │ Z1       │ │ Z2       │ │ Z3           │ │ Z4       │            │
│  │ POWER    │ │ INPUT    │ │ SOLAR AMP    │ │ AM TUNER │            │
│  │ + DC-DC  │ │ BUFFER   │ │ + LDR        │ │ HEATWAVE │            │
│  │ + +30V   │ │          │ │ + LEDs       │ │ TA7642   │            │
│  │ BOOST    │ │ J_IN     │ │ + solar cell │ │ + L_AM   │            │
│  │          │ │          │ │ window cutout│ │ + tuning │            │
│  │ J_PWR    │ │          │ │ on panel     │ │ cap      │            │
│  └──────────┘ └──────────┘ └──────────────┘ └──────────┘            │
│                                                                       │
│  ┌────────────────────┐ ┌──────────────────────────────┐            │
│  │ Z5                 │ │ Z6                           │            │
│  │ OIL-CAN ENGINE     │ │ CAPACITIVE READ FRONTEND     │            │
│  │ - Motor driver Q_MOT│ │ - LSK489A (or на cartridge) │            │
│  │ - Speed PWM (ATtiny)│ │ - Main PCB buffers TL072    │            │
│  │ - Write electrode  │ │ - mini-XLR jacks J_PA, J_PB  │            │
│  │   HV bias network  │ │                              │            │
│  │ - Cartridge JST    │ │                              │            │
│  └────────────────────┘ └──────────────────────────────┘            │
│                                                                       │
│  ┌──────────────┐ ┌──────────────────────┐ ┌──────────┐            │
│  │ Z7           │ │ Z8                   │ │ Z9       │            │
│  │ INDUCTIVE EQ │ │ TONGUE RESONATOR     │ │ SOLENOID │            │
│  │ L_LO, L_HI   │ │ - exciter mount      │ │ CRASH    │            │
│  │ Hammond      │ │ - piezo pickup buffer│ │ - 555    │            │
│  │ 159T, 159L   │ │ - mechanical lead    │ │ - Q_CRASH│            │
│  │              │ │   screw mount        │ │ - hydroph│            │
│  │              │ │                      │ │  preamp  │            │
│  └──────────────┘ └──────────────────────┘ └──────────┘            │
│                                                                       │
│  ┌──────────────────────────────────────────────────────┐            │
│  │ Z10                                                   │            │
│  │ FX layer (HAZE / MIRAGE / BLEACH / TAR / CICADA / OLD VINYL)      │
│  │ - LFO TL074 (HAZE)                                                 │
│  │ - Noise + 4066 S&H (MIRAGE, CICADA)                                │
│  │ - Schottky soft-clip (BLEACH)                                      │
│  │ - LM13700 VCA (TAR)                                                │
│  │ - PT2399 (OLD VINYL)                                               │
│  │ - ATtiny85 PWM allocation (CICADA timer)                           │
│  └──────────────────────────────────────────────────────┘            │
│                                                                       │
│  ┌──────────┐ ┌──────────────────────────────┐ ┌──────────┐         │
│  │ Z11      │ │ Z12                          │ │ Z13      │         │
│  │ MIX BUS  │ │ Feedback loop + FREEZE switch│ │ Footsw.  │         │
│  │ Output   │ │                              │ │ wires    │         │
│  │ buffers  │ │                              │ │ to panel │         │
│  │ J_OUT L/R│ │                              │ │ (4× 3PDT)│         │
│  └──────────┘ └──────────────────────────────┘ └──────────┘         │
│                                                                       │
│  Bottom edge: panel-mount jacks, pots, LEDs                          │
└─────────────────────────────────────────────────────────────────────┘
```

### Critical separations

| Pair | Min distance | Why |
|------|--------------|-----|
| Z5 (motor PWM 62.5kHz) ↔ Z6 (capacitive read hi-Z) | 30mm + ground moat | PWM EMI directly couples into nF-level capacitive sensing |
| Z9 (solenoid 290mA pulse) ↔ Z6 read frontend | 40mm | Magnetic field от CRASH solenoid |
| Z4 (AM tuner antenna L_AM) ↔ Z5 motor + Z1 DC-DC | 35mm | AM band 530kHz–1.6MHz susceptible к 62.5kHz PWM harmonics + DC-DC switching |
| Z3 (solar amp opt rail) ↔ Z10 BLEACH threshold | direct connection OK, ferrite bead | Solar opt rail is intended modulation source |
| Z8 (tongue exciter, ~1W) ↔ all audio signal paths | 25mm + shielded cable | Tongue exciter swings ±10V drive into 4Ω load — radiates |

### PCB stack-up

- **Budget**: 2-layer FR4 1.6mm. Star ground tie at J_PWR. Ground moat between motor PWM zone и capacitive read zone.
- **Premium**: 4-layer FR4 1.6mm. Internal GND plane (layer 2) solid под Z6 capacitive read для shielding.

---

## Cartridge mechanics

### Disk oil-can cartridge

```
                Cartridge frame (110×65×30mm, identical Last Night formfactor)
   ┌───────────────────────────────────────────┐
   │                                             │
   │   ┌─────────────────────────────────────┐  │
   │   │  Acrylic disk enclosure (sealed):   │  │ ← Front face
   │   │   - PMMA disk Ø60mm × 4mm thick     │  │   visible через window
   │   │   - Surface coated with conductive  │  │
   │   │     mineral oil layer (~50µm thick) │  │
   │   │   - Sealed top window (PMMA 2mm)    │  │
   │   │   - 60ml total oil volume inside    │  │
   │   │     reservoir at bottom              │  │
   │   └─────────────────────────────────────┘  │
   │                                             │
   │  ┌────────────────────────────────────┐    │
   │  │ Motor shaft (axial through center): │    │ ← Bottom face
   │  │ Mabuchi motor с gear coupling       │    │   on cartridge
   │  │ to disk axle. Shaft seal: ferro-    │    │   PCB
   │  │ fluidic OR rubber lip seal к oil    │    │
   │  │ reservoir (zero-leak design).       │    │
   │  └────────────────────────────────────┘    │
   │                                             │
   │  Cartridge PCB (back face):                 │
   │   - Write electrode Cu pad (Z stop 0.5mm)   │
   │   - Read electrode L Cu pad (90° from write)│
   │   - Read electrode R Cu pad (180° from write)│
   │   - LSK489A SMD (read frontend buffer)      │
   │   - 2× mini-XLR (TA3F) для read L+R audio   │
   │   - 2× JST-XH (motor power + HV bias)       │
   │   - Service indicator: oil level transparency│
   │     visible через window                     │
   │                                             │
   │  ◯ Magnet 1  Magnet 2 ◯                     │
   │  ◯ Magnet 3  Magnet 4 ◯                     │
   │                                             │
   │  Side: J_AUDIO_L (mini-XLR)                 │
   │  Side: J_AUDIO_R (mini-XLR)                 │
   │  Side: J_MOTOR (JST-XH 2-pin)               │
   │  Side: J_HV (JST-XH 2-pin)                  │
   │                                             │
   │  Material label / serial #                  │
   └─────────────────────────────────────────────┘
```

### Service intervals

- **Oil refill / replacement**: every 12–24 months (depends on usage hours). Conductivity degrades through additive depletion.
- **Disk surface inspection**: every 6 months. Surface scratches degrade signal quality.
- **Motor brush replacement** (budget motor only): every 12 months at heavy use. Premium BLDC motor: brushless, no replacement.
- **Cartridge sealed swap**: user-replaceable. PIN-locked retention. No oil exposure during normal swap (disk is sealed inside acrylic enclosure).

### Alternative cartridge types

Same cartridge format may be filled with:
- **Material plate** (Last Night standard) — for hybrid use cases где Day acts as plate-resonator-pre-delay-engine.
- **Larger disk** (premium, 80mm dia, smoother flutter) — for refined oil-can character.
- **Magnetic disk** (alternate pickup, Decision 02 D2 path A) — if user wants classic magnetic tape feel.

---

## Open R&D questions

1. **Oil composition stability** — does graphite-doped mineral oil maintain conductivity for 24 months? Need accelerated aging test (3 month bench cycle at +50°C → equiv. 12 month room temp).
2. **Motor speed jitter (budget motor)** — Mabuchi RS-385 без encoder: speed varies ±5% per revolution due to commutation. Audible as wow/flutter beyond intended. Test: scope motor encoder output, FFT for jitter spectrum. **If unacceptable** → upgrade to Maxon motor + PID controller in Phase A budget recalculation.
3. **HV bias EMI** — 30V boost converter (TPS61040 switching at ~1MHz) operates close к capacitive read frontend. Test: scope read signal with bias enabled vs off. **If switching noise audible** → ferrite shield boost section, или move bias generation off-main-PCB.
4. **Capacitive read SNR** — 5pF coupling at 10GΩ impedance gives -85 dBV theoretical floor. Measured может быть worse due to cable пикап. **Verification**: bench prototype required.
5. **Tongue resonator audibility** — Q range 1-15 controlled by clamp pressure: validate that mechanical force amplification на ⊙Q knob feels natural. **If mechanical Q control feels artificial** → fallback на electrical Q via feedback resonance loop.
6. **AM tuner indoor SNR** — TA7642 single-chip detector: needs minimum 50µV RF for usable audio. Indoor antennas often deliver <10µV. **Mitigation**: external antenna jack (J_HEAT_ANT) as fallback. **If indoor performance unusable** → HEATWAVE релoзed only with external antenna documentation.
7. **PT2399 noise** — OLD VINYL parallel tract adds quantization noise from 8-bit BBD-like quantization in PT2399. Goal: lo-fi character, не excessive hash. Test: subjective A/B mix level recommendations.
8. **CRASH hydrophone sealing** — separate 5ml oil pocket sealed in acrylic ball: long-term seal integrity under repeated solenoid impacts. **Verification**: cycle test 10,000 strikes, check for cracks/leaks.
9. **Cartridge format compatibility** — Last Night material plate cartridge in Last Day слот: write electrode HV +30V meets piezo pickup → potential damage. **Decision required**: physical detection (cartridge ID pin) prevents accidental HV-to-piezo connection.
10. **Phase B vs Phase A split** — review which hot palette FX блоки Phase B can be added without v2 PCB redesign. **Initial estimate**: Blocks 11-16, 18 fit on Phase A PCB. Block 8 motorized variant = v2.

---

## Verification protocol (Phase A v1 ship)

### Bench tests (each unit before shipment)

1. **Power-up test**: 12V DC applied → ±12V rails within ±5% (verified via DMM). Idle current 250-450 mA.
2. **Motor speed sweep**: ⊙Time CCW to CW → motor 200-1200 RPM (encoder reads, or stroboscope timing for budget SKU).
3. **Solar amp test**: cover solar cell, RV_SOLAR mid → opt rail ~5V. Bright light shine → opt rail rises к ~8V. Saturation character changes audibly.
4. **Capacitive delay test**: audio test tone 1kHz, ⊙Time mid → measure delay time from input scope to output scope. Confirm 200ms ±20%.
5. **Stereo separation L/R**: signal input → L output должен differ from R output (different delay times). Confirm > 10dB stereo separation.
6. **Tongue resonator sweep**: ⊙Tongue CCW (long L) → resonant peak ~200Hz. CW (short L) → peak ~2kHz. Q ~5 nominal.
7. **EQ shelf check**: ⊙LO Shelf and ⊙HI Shelf each provide ±12dB swing measured at 100Hz and 8kHz respectively.
8. **FX layer**: each of 7 hot palette knobs audibly affects sound в expected way.
9. **Footswitches**: KILL mutes, FREEZE locks loop, DRAG fades pitch, CRASH triggers splash.
10. **Noise floor**: input grounded, mix CW (wet only), output measured: < -75 dBV.

### Acceptance criteria

- All 10 bench tests pass.
- Visual: oil bath visible через cartridge window, no leak.
- No mechanical buzz from tongue strip during sweeps.
- Solar cell visible through panel cutout, LED diffuser even.

---

**End of Last Day BUILD v1.0. Phase A R&D scope: months 1-12. Phase B v1.5 expansion: months 12-18. Companion document `LAST_DAY_SPEC.md` for customer-facing specification.**
