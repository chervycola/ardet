# LAST NIGHT — PCB Design Specification

**Версия**: v1.0 (для R&D PCB designer)
**Парный документ**: `LAST_NIGHT_BUILD.md` §"PCB layout — зоны и правила"
**Status**: pre-KiCad — все XY координаты и dimensions готовы к import в KiCad как board outline + reference markers.

---

## 0. Стратегия — single main PCB + form-factor adapters

Per Decision PCB-1 (v6.3): **C — common main PCB + form-factor adapter sub-PCB**. Это позволяет:
- Один main PCB design + fab run для обоих SKU (Eurorack + pedal)
- Form-factor specifics (power input, audio connectors) на отдельный adapter
- Adapter sub-PCB cheap to design and swap per SKU

---

## 1. PCB Inventory (6 boards)

| # | Board | Dimensions | Layers | Quantity per unit | Notes |
|---|-------|------------|--------|-------------------|-------|
| 1 | **Main PCB** | 203 × 128.5 mm | 4L FR4 1.6mm | 1 | Common to both SKUs |
| 2 | **Form-factor adapter (Eurorack)** | 100 × 30 mm | 2L FR4 1.6mm | 1 per Eurorack unit | 16-pin Doepfer IDC + bus caps |
| 2b | **Form-factor adapter (Pedal)** | 200 × 50 mm | 2L FR4 1.6mm | 1 per pedal unit | DC jack + DC-DC + LDO + audio jacks (TRS + RCA) |
| 3 | **FG slider satellite** | 60 × 30 mm | 2L FR4 1.6mm | 1 | 3× sliders + exp converters |
| 4 | **Bank Mode slider satellite** | 25 × 40 mm | 2L FR4 1.6mm | 1 | SL-4P5T + R-banks |
| 5 | **Footswitch satellite** | 100 × 40 mm | 2L FR4 1.6mm | 1 | 4× 3PDT + LED indicators |
| 6 | **Cartridge dock = transducer engine bay** | mechanical assembly | — | 1 | exciter (spring carriage) + 2 piezo contact pins + solenoid + magnets (Decision 11) |

Всего на unit: 4 PCBs (main + form-factor + 2-3 satellites — sliders consolidated в Eurorack version possibly).

---

## 2. Main PCB layout (203 × 128.5 mm)

Coordinates origin: **top-left corner (0,0)**. X increases right, Y increases down. Units: mm.

### 2.1 Mechanical landmarks

| Element | X center | Y center | Size | Notes |
|---------|----------|----------|------|-------|
| Mounting hole TL | 5.0 | 5.0 | Ø3.2mm + Ø6mm keepout | M3 screw |
| Mounting hole TR | 198.0 | 5.0 | Ø3.2mm | M3 |
| Mounting hole BL | 5.0 | 123.5 | Ø3.2mm | M3 |
| Mounting hole BR | 198.0 | 123.5 | Ø3.2mm | M3 |
| Cartridge slot opening | 101.5 | 35.0 | 110 × 12 mm rectangular cut-out | Slot for cartridge vertical insertion |
| Eurorack adapter header | 195.0 | 65.0 | 2×8 IDC (16-pin Doepfer) | Right edge, vertical |
| Pedal adapter ribbon (alt) | 101.5 | 120.0 | 2×8 IDC (16-pin) | Bottom edge |

### 2.2 Zone coordinates (component group centers)

Major component groups placed по зонам A-J (from signal_flow SVG):

| Zone | Group | Center X | Center Y | Approx area | Components |
|------|-------|----------|----------|-------------|------------|
| **A1** | INPUT buffer + DRY split | 22 | 50 | 18×14 | U1A TL072 + R1 1MΩ + C_IN 1µF + R_DRY 10k + R_DRY_OUT 100R |
| **A2** | Pre-emphasis EQ | 22 | 65 | 18×14 | U3A TL072 + RV_BOOST + R_PE1 10k + C_PE1 1nF C0G |
| **A3** | Driver Amp + Push-pull | 22 | 82 | 22×16 | U1B TL072 + Q1 BD139 + Q2 BD140 + D_BIAS ×2 + R8 4.7Ω 5W wirewound (vertical mount, heatsink-ready) |
| **A4** | C_DC output cap | 22 | 100 | 12×12 | C_DC 1000µF electrolytic + R8 5W series chain |
| **B** | **CARTRIDGE DOCK area** | 101.5 | 35 | 120×30 | Sub-PCB underneath panel cartridge slot; main PCB receives ribbon від dock |
| **C1** | JFET preamp Q3 | 45 | 25 | 18×14 | Q3 LSK489A (SOT-23-6) + R_PA 10MΩ + R_PB 10MΩ + guard ring + bias caps |
| **C2** | De-emphasis EQ (U2C TL074 quarter) | 70 | 25 | 14×10 | C_DE1 1nF C0G (matched к C_PE1) + R_DE1/2/3/4 |
| **C3** | Position crossfade (U4D TL074 quarter) | 90 | 25 | 14×10 | RV_POSITION 100k lin + summing R's |
| **D1** | Bank Mode shelf op-amps (U2A/B TL074 halves) | 125 | 25 | 16×14 | LF shelf + HF shelf + sat cell |
| **D2** | Bank Mode slider satellite header | 110 | 50 | 6×16 (2×5 IDC) | 10-pin ribbon to Bank Mode satellite PCB |
| **D3** | Tone LPF + LED clipper (U2D TL074) | 145 | 50 | 16×14 | RV_TONE + RV_HIPASS + D1-D6 LEDs (panel-side) |
| **D4** | Envelope VCA U5 LM13700 | 165 | 50 | 14×16 | LM13700 + env follower D_EF + ENV_CAP 220nF + RV_ATTACK + RV_DECAY |
| **D5** | Env→trigger comparator | 165 | 70 | 12×8 | LM393 second half (U_COMP shared from Block 18) + RV_TRIG_THRESH trim + RC differentiator |
| **E** | **PHASER cells (U7+U8 LM13700)** | 80 | 80 | 24×18 | 4× all-pass cells + Iabc bus + C_AP1-4 NP0 |
| **F** | **Function Generator core** | 50 | 95 | 30×20 | U_FG TL074 (Schmitt + integrator + buffer + inverter) + Q_EXP_PAIRS 6× 2N3904 + C_FG range bank + RV_EXP_LOG + 74HC74 + Q_RESET 2N7000 |
| **F2** | FG slider satellite header | 75 | 110 | 6×16 (2×6 IDC) | 12-pin ribbon to FG slider satellite PCB |
| **G** | Noise + Geiger gen | 25 | 90 | 22×16 | BZX55C9V1 zener + U2 noise amp + U6 LM13700 OTA1 crossfader |
| **H** | **Solenoid driver (Block 14)** | 168 | 92 | 22×18 | Q5 2N7000 + R_GATE 10k + D_OR ×3 + D_SOL 1N4001 + U_TOLL_555 + RV_TOLL_DUR trim + R_DAM1/3 + cartridge JST ribbon |
| **I1** | Mix bus (U2D TL074) | 110 | 92 | 14×10 | Summing amp + RV_MIX + balance |
| **I2** | Gate/Crush Block 18 | 130 | 92 | 24×16 | U_GATE CD4066 + U_SH LF398 + U_COMP LM393 + R-2R + RV_GTH + RV_CRUSH trims |
| **I3** | Output buffer | 158 | 75 | 16×10 | TL072 ×2 (L+R + DRY+WET) + output protection R_OUT 100Ω + C_OUT 10µF |
| **J1** | Footswitch satellite header | 50 | 120 | 6×16 (2×5 IDC) | 10-pin ribbon to footswitch satellite PCB |
| **J2** | Power adapter header | 175 | 120 | 6×16 (2×4 IDC) | 8-pin ribbon to form-factor adapter (Eurorack OR pedal variant) |
| **J3** | MCU + 5V LDO | 130 | 115 | 20×10 | ATtiny84A DIP-14 + 7805 + decoupling |

### 2.3 Panel-mount knob positions (PCB-mount к panel-side)

Pots Alpha RV09 9mm имеют 5mm shaft, soldered к main PCB via 3-pin layout. Panel cutouts coincide с knob positions per `last_night_pedal_panel.svg` (panel coordinates origin top-left, identical).

| Knob | Panel X | Panel Y | Main PCB X | Main PCB Y |
|------|---------|---------|------------|------------|
| INPUT | 22 | 25 | 22 | 25 |
| DRY/WET | 172 | 25 | 172 | 25 |
| OUTPUT | 190 | 25 | 190 | 25 |
| DRIVE | 35 | 65 | 35 | 65 |
| ATK | 55 | 65 | 55 | 65 |
| DEC | 75 | 65 | 75 | 65 |
| TONE | 35 | 92 | 35 | 92 |
| NOISE | 55 | 92 | 55 | 92 |
| color/geiger | 75 | 92 | 75 | 92 |
| FEEDBACK | 110 | 62 | 110 | 62 |
| LowPass | 110 | 84 | 110 | 84 |
| HiPass | 110 | 97 | 110 | 97 |
| position | 140 | 62 | 140 | 62 |
| boost | 160 | 62 | 160 | 62 |
| Phase/Flutter | 140 | 92 | 140 | 92 |
| exp/log | 175 | 100 | 175 | 100 |
| speed/range | 190 | 100 | 190 | 100 |

> Panel X/Y = Main PCB X/Y by design (panel sits directly atop main PCB через 12mm standoffs).

---

## 3. Layer stackup (4-layer FR4 1.6mm)

```
Layer 1 (top, 1oz Cu):     Component pads + signal traces
                            Audio signal flow (зоны A→I)
                            Critical: JFET gate trace (Z4), piezo input
                            
Layer 2 (internal, 0.5oz):  ┌─ GND_audio plane (solid pour)       ─┐
                            │                                       │
                            │  Split via 0.5mm clearance moat:      │
                            │                                       │
                            └─ GND_digital island (zone J3 MCU)    ─┘
                            
                            Single 0Ω jumper bridge at star tie point
                            (near J1 input or J_OUT — TBD by sim)

Layer 3 (internal, 0.5oz):  ┌─ +12V_audio plane (zone D-I)         ─┐
                            │  −12V_audio plane (zone D-I)          │
                            │                                       │
                            │  +12V_RAW trace (zone H solenoid)     │
                            │   — NO plane, narrow trace 1mm       │
                            │   isolated from +12V_audio plane     │
                            │                                       │
                            │  +5V_digital plane (zone J3)          │
                            └───────────────────────────────────────┘

Layer 4 (bottom, 1oz Cu):   Component pads (bottom-side passives)
                            Routing для cross-zone signal jumps
                            CV bay traces back from panel pots
```

### 3.1 Power plane split rules (Layer 3)

```
   +12V_audio (zone D, E, F, G, I, fed by DC-DC):
     Solid pour 80×60mm centered (110, 70)
     Decoupling vias каждые 10mm
   
   -12V_audio (zone D, E, F, G, I):
     Solid pour 80×60mm centered (110, 70) — directly under +12V_audio
     Sandwich with C_DECOUP_RAIL 100nF X7R + 10µF tantalum
   
   +12V_RAW (zone H solenoid, A power input):
     1mm wide trace, NOT plane.
     Routed along panel edge (Y=100-120) от power adapter (J2)
     к solenoid driver (H zone)
     Ferrite bead на pedal adapter exit before solenoid path
     Connects only к Q5 drain через D_SOL
   
   +5V_digital (zone J3 MCU only):
     Small pour 16×8mm centered (130, 115)
     Tied к GND_digital island в Layer 2
     LDO from +12V_RAW via 100Ω series + 100µF bulk
```

---

## 4. Ground topology (post v6.3 isolation split)

```
GND DOMAINS:

  GND_chassis ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  (pedal-board ground, DC jack negative,
   1/4" jack sleeves, RCA shells, chassis foot)
  │
  │   ↕ Single-point connection (star tie)
  │     via 0Ω jumper or 2.5mm thick wire @ output jacks
  │
  ▼
  GND_audio_isolated ━━━━━━━━━━━━━━━━━━━━━━━━━━
  (Layer 2 main plane, isolated through DC-DC)
  │
  │   All op-amp -V returns
  │   All OTA references
  │   Piezo signal returns (via cartridge dock satellite)
  │   Output buffer signal returns
  │
  ▼
  GND_digital ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  (Layer 2 island, single jumper to GND_audio)
  │
  │   ATtiny84A
  │   LDO 7805 ground
  │   LED return currents (через 1kΩ R_LED current limit)
  │
  ▼ (tied к GND_chassis through isolated DC-DC return)

GND_solenoid (Pedal only, +12V_RAW circuit):
  Q5 source → directly к D-jack ground
  NEVER routed across audio or digital ground areas

STAR TIE POINT recommendation:
  - Pedal SKU: 0Ω jumper between GND_audio and GND_chassis 
    near 1/4" output jack (lowest impedance loop for audio).
  - Eurorack SKU: GND_audio = GND_chassis (no isolation barrier).
    Star tie at 16-pin Doepfer IDC connector.
```

### 4.1 Critical: solenoid current return path

```
   12V DC jack (+) ─────► +12V_RAW trace (Layer 3) ──┐
                                                       │
                                                       ▼
                                                Q5 drain (zone H)
                                                       │
                                                       Solenoid coil
                                                       (cartridge via JST)
                                                       │
                                                       ▼
                                                Q5 source ─────┐
                                                                │
                                                                ▼
                                                GND_solenoid trace
                                                (1mm wide, Layer 4)
                                                                │
                                                                ▼
                                                12V DC jack (−)
   
   Loop area target: <500 mm² (minimize EMI radiation)
   Trace clearance from GND_audio plane: >5mm
```

---

## 5. Critical traces

### 5.1 JFET gate trace (zone C1, Q3 LSK489A)

```
   Cartridge dock J_PA pin ──► Cartridge dock satellite ribbon ──►
                                                                     │
                                                                     ▼
                                                       Main PCB ribbon header
                                                                     │
                                                                     ▼
                                                          [shortest possible path]
                                                                     │
                                                          R_PA 10MΩ (placed <3mm from Q3 gate)
                                                                     │
                                                                     ▼
                                                          Q3 Gate A pad
   
   Guard ring requirements:
   - 0.5mm GND_audio guard trace surrounding entire input trace + Q3 gate area
   - Via stitching every 2mm along guard
   - GND_audio plane directly under guard (Layer 2)
   - NO other signals routed within 5mm of guard ring
   - Trace width 0.25mm minimum (high impedance, low capacitance)
   - Trace length <20mm from ribbon header to Q3 gate
```

### 5.2 Piezo signal traces (Layer 1)

```
   From cartridge dock satellite ribbon:
     - PIEZO A audio signal
     - PIEZO A shield (GND_audio)
     - PIEZO B audio signal
     - PIEZO B shield (GND_audio)
   
   Routed as differential pair-like (signal + shield adjacent):
     - Width 0.3mm
     - Spacing 0.5mm between adjacent signal traces
     - GND_audio plane on Layer 2 directly underneath
     - Via stitching of shield trace every 5mm к Layer 2
```

### 5.3 OTA Iabc bus (zone E phaser)

```
   Function Generator output (zone F) → buffer → R_IABC 22k →
                                                              │
                                                  Iabc bus (Layer 1)
                                                              │
                                                              ▼
                                                  Distributed to 4 OTA Iabc pins:
                                                    U7 OTA1 (cell 1)
                                                    U7 OTA2 (cell 2)
                                                    U8 OTA1 (cell 3) [premium]
                                                    U8 OTA2 (cell 4) [premium]
   
   Iabc bus considerations:
   - Single bus trace, daisy-chain through 4 OTA Iabc pins
   - 0.5mm trace width (current modulation 1-50µA range)
   - <50mm total length keeps modulation pulse rise time <10µs
```

### 5.4 Push-pull power return (zone A3)

```
   Q1 BD139 emitter + Q2 BD140 emitter → R_E_BIAS network
                                          │
                                          ▼
                                  R8 4.7Ω 5W (high-current return)
                                          │
                                          ▼
                                  C_DC 1000µF output cap
                                          │
                                          ▼ (audio signal к exciter)
                                  Cartridge dock satellite header
                                          │
                                          └─► +exciter (JST pin 1)
                                          
                                  Return current path:
                                  Exciter (-) → JST pin 2 → cartridge dock satellite →
                                  → ribbon back to main PCB →
                                  → GND_audio plane @ R8 return
   
   Loop area target: <800 mm² (push-pull radiates audio EMI otherwise)
```

---

## 6. Sub-PCB definitions

### 6.1 Cartridge dock = Transducer Engine Bay (Decision 11)

> **Decision 11**: dock больше не connector PCB — это **transducer engine bay**. Содержит exciter + 2 пьезо + solenoid (постоянно в модуле) + spring-loaded contact mechanism. Картридж (пассивная пластина) вставляется и контактирует с трансдьюсерами. **Нет mini-XLR, нет JST к картриджу** — трансдьюсеры разведены прямо к main PCB internal wiring.

Mounts directly underneath panel cartridge slot opening. Mechanical assembly (не просто PCB).

```
   Components (module-side, fixed):
   - 1× Surface exciter DAEX32Q-4 на spring-loaded carriage (±2mm travel)
     → puck faces UP, contact к front пластины ~5N
   - 2× piezo pickup (27mm) на spring contact mounts (~1.5N each)
     → contact к back пластины (A near-exciter, B far) per FEM mode shapes
   - 1× solenoid (5V push) на fixed bracket, felt-tip plunger
     → strikes plate face, 2mm gap adjustable
   - 4× neodymium N42 magnets (Ø6×3mm, polarized) — cartridge retention + keying
   - 1× spring-loaded retention pin (Ø3×8mm) — cartridge lock
   - 1× orientation key post (asymmetric) — single-orientation insertion
   - Frame damping foam (cartridge frame seats против this)

   ⚠ MIS-INSERTION PROTECTION:
   - Cartridge frame asymmetric notch (corner cut 8×8mm один угол) → single orientation.
   - Magnets polarized (N up ×2, S up ×2) — wrong orientation отталкивается.
   - Поскольку картридж пассивный (нет электрических контактов) — нет risk
     electrical damage от mis-insertion. Keying только для acoustic alignment
     (exciter/piezo contact points должны попасть на правильные plate zones).

   Wiring to main PCB (internal, NOT swappable — трансдьюсеры fixed в модуле):
   - EXCITER (+/−): short twisted pair → driver amp output (Block 4)
   - PIEZO_A signal + shield: short shielded wire → JFET preamp (Block 7)
   - PIEZO_B signal + shield: short shielded wire → JFET preamp (Block 7)
   - SOLENOID (+/−): twisted pair → solenoid driver Q5 (Block 14)
   
   Пьезо hi-Z провод КОРОТКИЙ (<50mm) и НЕ пересекает swappable разъём
   → меньше noise floor чем старая mini-XLR cartridge scheme.
   Cartridge сам — чисто механический объект (пластина + рамка + магниты).
```

### 6.2 FG slider satellite (60 × 30 mm)

Mounts behind FG sliders area (panel right edge, ~Y=72 center).

```
   Components:
   - 3× linear sliders 30mm travel (Alpha SL-30 or PEC11R equivalent)
     - rise / fall / depth
   - 3× 2N3904 matched pair exp converters (6 BJTs total)
   - 6× resistors (R_EXP 1k emitter, R_DIV 22k base divider per pair)
   - 1× DPDT 3-pos slide switch (SW_FG_RANGE)
   - 3× capacitors for C_FG range bank (1µF MKS2 / 100nF film / 10nF NP0)
   
   Layout:
     [3 sliders vertical, 8mm pitch]
     [3 exp converters below, one per slider]
     [Range switch + cap bank в углу]
   
   Connector to main PCB (12-pin IDC ribbon):
     Pin 1: +12V_audio
     Pin 2: GND_audio
     Pin 3: -12V_audio (для exp converter bias)
     Pin 4: GND_audio
     Pin 5: rise output (current from Q_RISE collector)
     Pin 6: fall output (current from Q_FALL collector)
     Pin 7: depth output (current from Q_DEPTH collector)
     Pin 8: range switch C_FG slow common
     Pin 9: range switch C_FG mid common
     Pin 10: range switch C_FG fast common
     Pin 11: spare (future CV input)
     Pin 12: GND_audio
```

### 6.3 Bank Mode slider satellite (25 × 40 mm)

Mounts behind Bank Mode slider (panel left edge, ~Y=72 center).

```
   Components:
   - 1× Alpha SL-4P5T slider (4-pole 5-throw, 35mm travel)
   - 13× SMD 0805 resistors (R-banks per Block 20 table):
     - Pole 1 (noise LPF): R_NC1 10k, R_NC5 22k
     - Pole 2 (reverb LF): R_LF2 10k, R_LF4 33k, R_LF5 22k
     - Pole 3 (reverb HF): R_HF1 22k, R_HF2 22k, R_HF3 8.2k, R_HF4 15k, R_HF5 33k
     - Pole 4 (reverb SAT): R_SAT1 4.7k, R_SAT2 4.7k, R_SAT3 1.5k, R_SAT4 22k, R_SAT5 4.7k
   
   Connector to main PCB (10-pin IDC ribbon):
     Pin 1: GND_audio
     Pin 2: Pole 1 output (noise LPF R)
     Pin 3: Pole 2 output (reverb LF shelf R)
     Pin 4: Pole 3 output (reverb HF shelf R)
     Pin 5: Pole 4 output (reverb SAT bias R)
     Pin 6: Pole 1 input (audio bus from noise generator)
     Pin 7: Pole 2 input (audio bus → LF shelf op-amp)
     Pin 8: Pole 3 input (audio bus → HF shelf op-amp)
     Pin 9: Pole 4 input (audio bus → SAT cell)
     Pin 10: GND_audio
```

### 6.4 Footswitch satellite (100 × 40 mm)

Mounts behind footswitch row на panel bottom-edge.

```
   Components:
   - 4× 3PDT footswitch (latching + momentary mix per мockup canon):
     - TAP (momentary)
     - GATE-CRUSH (latching)
     - BYPASS (latching, 3PDT mechanical relay-equivalent)
     - FREEZE (latching)
   - 4× LED indicators (3mm Kingbright L-7104ID, panel-mount)
   - 4× R_LED 1kΩ current limit
   - 4× ESD protection diodes 1N4148
   - Solder pads for footswitch wire harness contacts
   
   Connector to main PCB (10-pin IDC ribbon):
     Pin 1: +5V_digital (LED supply)
     Pin 2: GND_digital
     Pin 3: TAP momentary output → MCU PA6 (capture)
     Pin 4: GATE-CRUSH latch state → MCU PCINT input
     Pin 5: BYPASS relay coil drive → analog relay (Block 19 output)
     Pin 6: FREEZE latch state → Block 5 feedback path control
     Pin 7: TAP LED control
     Pin 8: GATE-CRUSH LED control
     Pin 9: BYPASS LED control
     Pin 10: FREEZE LED control
```

### 6.5 Form-factor adapters

#### 6.5a Eurorack adapter (100 × 30 mm)

```
   Components:
   - 1× 16-pin Doepfer IDC connector (2×8, 2.54mm pitch)
   - 2× 1N5817 Schottky reverse polarity protection diodes
   - 4× decoupling caps (100nF X7R + 10µF tantalum для ±12V rails)
   - 1× ferrite bead 1kΩ@100MHz on +12V_in
   - 1× LED + R_LED for power indication
   
   Connector to main PCB (8-pin IDC ribbon, shared with pedal adapter):
     Pin 1: +12V_audio (from bus)
     Pin 2: +12V_audio
     Pin 3: GND_audio
     Pin 4: GND_audio
     Pin 5: -12V_audio
     Pin 6: -12V_audio
     Pin 7: +12V_RAW (for Eurorack, tied к +12V_audio через 1Ω current sense)
     Pin 8: +5V_digital (separate Eurorack rail если есть, или LDO от +12V)
   
   Note: Eurorack has unified ±12V supply; +12V_RAW = +12V_audio = +12V bus.
         Solenoid current still pulled directly но через separate trace.
```

#### 6.5b Pedal adapter (200 × 50 mm — back panel rail)

```
   Components:
   - 1× DC barrel jack 5.5×2.1mm centre-negative
   - 1× 1N5817 Schottky reverse polarity protection
   - 1× TRACO TMR 3-1222WI (budget) или Recom RxxD-1212 (verify dual ±12V P/N) (premium)
     isolated DC-DC ±12V output
   - 1× 7805 LDO TO-220 (+5V_digital from +12V_RAW)
   - Bulk caps: C_IN_RAW 220µF, C_OUT_AUDIO ±12V 47µF each, C_5V 22µF
   - LC filter on DC-DC output: 10µH + 10µF (×2 for ±12V)
   - Ferrite bead on solenoid +12V_RAW path
   - LED power indicator
   
   Audio I/O connectors (back panel, soldered to adapter PCB):
     - J_IN (1/4" TRS) + J_IN_RCA (RCA "тюльпан") parallel-wired
     - J_DRY (1/4" TRS) + J_DRY_RCA parallel-wired
     - J_WET (1/4" TRS) + J_WET_RCA parallel-wired
     - J_MAIN_L (1/4" TRS) + J_MAIN_L_RCA parallel-wired
     - J_MAIN_R (1/4" TRS) + J_MAIN_R_RCA parallel-wired
   = 5 audio signals × 2 connector types = 10 audio jacks total
   
   Layout (back-panel strip 200mm wide, 50mm tall):
   ┌──────────────────────────────────────────────────────────────────────────────┐
   │                                                                              │
   │  [DC]  [IN TRS][IN RCA]  [DRY TRS][DRY RCA]  [WET TRS][WET RCA]              │
   │  jack                                                                        │
   │        [L TRS][L RCA]    [R TRS][R RCA]                                      │
   │                                                                              │
   │   [TRACO DC-DC]   [7805 LDO]   [bulk caps]   [ferrite + filters]             │
   │                                                                              │
   └──────────────────────────────────────────────────────────────────────────────┘
   
   Connector to main PCB (8-pin IDC ribbon, same pinout as Eurorack adapter):
     Pin 1: +12V_audio (from DC-DC output, filtered)
     Pin 2: +12V_audio
     Pin 3: GND_audio (isolated)
     Pin 4: GND_audio
     Pin 5: -12V_audio (from DC-DC output, filtered)
     Pin 6: -12V_audio
     Pin 7: +12V_RAW (pre-DC-DC, for solenoid driver direct)
     Pin 8: +5V_digital (from LDO)
   
   Note: 1/4" TRS + RCA are parallel-wired for each audio signal.
         User patches whichever fits their setup. Both impedance-buffered
         by main PCB output buffer (same source impedance Both connectors).
```

---

## 7. Critical separation enforcement

PCB designer must enforce per Block 14 thermal budget + EMI rules:

| Pair | Min distance | Layer rule |
|------|--------------|------------|
| Z4 (JFET, X=45 Y=25) ↔ Z8 (solenoid, X=168 Y=92) | **>120mm** (achieved by physical layout) | Solenoid current loop on Layer 3 +12V_RAW trace, NOT plane |
| Z4 JFET ↔ Z9 noise gen + ATtiny84A (X=130 Y=115) | **>50mm** (vertical separation Y=25 → Y=115 = 90mm OK) | GND moat between Z4 and Z9 на Layer 2 |
| Z4 JFET ↔ Z10 phaser cells (X=80 Y=80) | **>40mm** (X=45 → X=80, Y=25 → Y=80 = ~65mm OK) | Iabc bus contained inside Z10 area |
| Z1 DC-DC (pedal adapter, off-board ribbon) ↔ Z4 | **>50mm** (DC-DC off main PCB) + ferrite bead on +12V audio rail entry | Filter LC + ferrite + bulk cap before audio plane |
| Z14 form-factor ribbon (X=175 Y=120) ↔ Z4 JFET (X=45 Y=25) | **>100mm** | OK by layout |
| Cartridge dock satellite ribbon (Z2 area, X=101.5 Y=35) ↔ Z4 JFET | **>50mm** (X=45-101 separation) | Piezo trace на Layer 1 with Layer 2 GND_audio shield |

---

## 8. Mechanical & assembly

### 8.1 Pedal SKU stack-up (vertical layers)

```
   Panel (aluminium 2mm, anodized matte black)
     │
     │  Knobs + sliders + footswitches + cartridge slot opening
     │
     ▼  12mm spacing (standoffs)
   Main PCB (4L FR4 1.6mm, 203 × 128.5mm)
     │
     │  Components mounted on top side (under panel)
     │  Cartridge dock satellite mounted top side (under cartridge slot)
     │  Slider satellites mounted top side, edge-aligned
     │  Footswitch satellite mounted top side, bottom-edge-aligned
     │
     ▼  3mm spacing
   Chassis floor (steel 1.5mm or aluminium 2mm)
     │
     │  Pedal adapter mounted on bottom side of chassis, rear edge
     │  DC jack + audio jacks pierce back panel
   
   Chassis box: 203 × 140 × 50mm (big-box class)
   Total height: 50mm panel-to-floor
```

### 8.2 Eurorack SKU stack-up

```
   Panel (aluminium 2mm, anodized matte black or pattern engraved)
     │
     │  Same panel layout as pedal (knobs/sliders/jacks)
     │  EXCEPT: no footswitches (replaced с large push buttons)
     │          no 1/4" or RCA jacks on back (back panel = open Eurorack rail)
     │          Audio I/O on front panel via 3.5mm Thonkiconn jacks
     │
     ▼  10mm spacing
   Main PCB (same 4L FR4, 203 × 128.5mm — common board)
     │
     │  Eurorack adapter mounted vertically on right edge с 16-pin Doepfer
     │
     ▼  No chassis floor — Eurorack rail mounting via M3 thread inserts
   
   Eurorack 40HP = 203mm × 128.5mm panel size standard.
   Depth behind panel: 35mm (sufficient for tall caps, DC-DC, knob shafts).
```

### 8.3 Cartridge slot mechanical

```
   Panel cartridge slot opening: 110 × 12mm rectangular cut-out
   Centered: X=101.5, Y=35 (in panel coordinates)
   
   Cartridge dimensions: 110 × 65 × 30mm
   Insertion: vertical (cartridge slid into pedal body from above through panel slot)
   Travel: 30mm down into pedal body, 0mm overhang above panel
   
   Transducer engine bay (Decision 11 — mechanical, not connector PCB):
     - Mounted ~20mm below panel внутри pedal body
     - Exciter DAEX32 on spring carriage, puck faces UP (contact к plate front ~5N)
     - 2× piezo contact pins (spring-loaded) touch plate back facing UP
     - Solenoid bracket above, plunger strikes plate
     - 4× neodymium magnets align с 4× magnets on cartridge (retention + keying)
     - Spring-loaded retention pin engages cartridge groove при insertion
     - Transducers wired internally к main PCB (no swappable connectors)
   
   Cartridge ejection: press retention pin (panel access hole 3mm) → cartridge releases → lift out vertically
```

---

## 9. KiCad implementation notes

### 9.1 Hierarchical schematic structure

Organize KiCad project as hierarchical sheets:

```
   Last_Night_main.kicad_sch (top sheet)
     ├── Block_1_Power.kicad_sch
     ├── Block_2_4_InputDrive.kicad_sch
     ├── Block_7_8_PiezoSense.kicad_sch
     ├── Block_9_10_11_DynamicsEQ.kicad_sch
     ├── Block_12_NoiseGen.kicad_sch
     ├── Block_14_SolenoidDriver.kicad_sch
     ├── Block_16_PhaserFG.kicad_sch
     ├── Block_18_GateCrush.kicad_sch
     ├── Block_19_MixOutput.kicad_sch
     ├── Block_20_BankMode.kicad_sch
     └── MCU_ATtiny84A.kicad_sch
   
   Satellites_main.kicad_sch (footprint-only project, separate fab)
     ├── Cartridge_Dock.kicad_sch
     ├── FG_Slider_Satellite.kicad_sch
     ├── Bank_Mode_Satellite.kicad_sch
     ├── Footswitch_Satellite.kicad_sch
     └── Adapter_Eurorack.kicad_sch + Adapter_Pedal.kicad_sch
```

### 9.2 Layer assignment в KiCad

```
   F.Cu (Front Copper / Layer 1)
   In1.Cu (Internal 1 / Layer 2 — GND planes)
   In2.Cu (Internal 2 / Layer 3 — Power planes)
   B.Cu (Back Copper / Layer 4)
   
   F.Mask + B.Mask (solder mask)
   F.Silkscreen + B.Silkscreen
   Edge.Cuts (board outline + cartridge slot cutout)
   F.Fab + B.Fab (assembly drawings)
   User.1 (cartridge slot reference)
   User.2 (zone boundary annotations)
```

### 9.3 Critical net classes

| Net class | Trace width | Clearance | Notes |
|-----------|-------------|-----------|-------|
| AUDIO_SIG | 0.3mm | 0.3mm | Signal traces, Layer 1 default |
| HIZ_PIEZO | 0.25mm | 0.5mm | Piezo input traces (zone C1, guard ring required) |
| POWER_AUDIO | 0.8mm | 0.5mm | ±12V_audio (Layer 3 plane) |
| POWER_RAW | 1mm | 0.8mm | +12V_RAW (Layer 3 trace, NOT plane) |
| POWER_DIG | 0.5mm | 0.5mm | +5V_digital |
| SOLENOID | 1.5mm | 1mm | Q5 drain to solenoid coil JST (high-current pulse) |
| GND | 0.5mm (vias) | 0.3mm | Multiple via stitching at zone boundaries |

### 9.4 DRC rules (Design Rule Check)

- Minimum trace width: 0.2mm (manufacturer 4L FR4 standard)
- Minimum clearance: 0.2mm
- Minimum via diameter: 0.4mm (drill 0.2mm)
- Annular ring: 0.1mm minimum
- Edge clearance: 0.5mm from board edge for traces
- HV clearance not applicable (max 12V on PCB)

### 9.5 BOM export format

KiCad → BOM CSV with columns:
- Reference designator
- Value
- Footprint
- Manufacturer P/N
- Manufacturer
- Distributor (Mouser/Digi-Key/etc per Decision 10)
- Distributor P/N
- Quantity
- Cost per unit

---

## 10. Pre-fabrication checklist

Before sending to PCB fab house:

- [ ] All net classes defined per §9.3
- [ ] DRC passes 100%
- [ ] ERC (electrical rules check) passes 100%
- [ ] Footprint association complete for all components
- [ ] All TH (through-hole) component drill sizes match footprint
- [ ] Panel cut-outs (cartridge slot) defined on Edge.Cuts layer
- [ ] Mounting holes have proper clearance
- [ ] Silkscreen reference designators visible for all components
- [ ] Polarity marks for diodes, electrolytic caps, MCU pin 1
- [ ] Critical notes on silkscreen: "JFET guard ring — keep clear", "5W wirewound vertical mount"
- [ ] Gerber export verified в external viewer (e.g., gerbv)
- [ ] BOM verified against sourcing matrix (Decision 10)
- [ ] Pick-and-place file generated (.pos)
- [ ] Stencil order placed (для SMD components)

---

**End of PCB Design Specification v1.0. Ready for KiCad import.**
