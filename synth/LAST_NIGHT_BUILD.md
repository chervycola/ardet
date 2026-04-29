# LAST NIGHT — Документация сборки и производства

> Production-ready документация: схемы, BOM, PCB layout, последовательность сборки, тестирование, troubleshooting.

**Версия**: v2.2 (post-audit, post-decisions)
**Source schematic**: `audit/wood_reverb_logical_schematic.html` (canonical 14-section reference)
**Companion document**: `LAST_NIGHT_SPEC.md` (продуктовая спецификация для end-user)

---

## Содержание

1. [Логическая схема — 15 блоков](#логическая-схема--15-блоков)
2. [Полный BOM](#полный-bom)
3. [PCB layout — зоны и правила разводки](#pcb-layout--зоны-и-правила-разводки)
4. [Картридж — механика и сборка](#картридж--механика-и-сборка)
5. [Sequence сборки модуля](#sequence-сборки-модуля)
6. [Калибровка](#калибровка)
7. [Тестирование](#тестирование)
8. [Troubleshooting](#troubleshooting)
9. [Sourcing & supply chain](#sourcing--supply-chain)
10. [Производственные batch processes](#производственные-batch-processes)

---

## Логическая схема — 15 блоков

Полная сигнальная цепь Last Night v2.2 разбита на 15 функциональных блоков. Каждый блок документируется в стиле каркаса `audit/wood_reverb_logical_schematic.html`.

Изменения от v2.0 (caркас) → v2.2 (revised) помечены **[REVISED]**.

### Block 1. Power Supply

```
  +12V bus ──►|── D_P1 (1N5817) ──►── +12V rail ──┬── C_B1 (10µF) ──┐
                                                     ├── C_B3 (47µF) ──┤
                                                     │                  GND
  -12V bus ──|◄── D_P2 (1N5817) ──◄── -12V rail ──┬── C_B2 (10µF) ──┐
                                                     │                  GND
  ┌────────┐
  │ J_PWR  │  2×5 IDC header        Decoupling (100nF each, close to IC pins):
  │ 2×5    │  Pin 1 = -12V          C1,C2 → U1    C5,C6 → U3    C9,C10 → U5
  └────────┘  Red stripe = -12V     C3,C4 → U2    C7,C8 → U4

  [REVISED] Add LC filter post-TMA1212D в pedal version: 10µH inductor + 10µF cap on each rail.
```

**Pedal version**:
```
  12V DC jack ──► TRACO TMA1212D ──► ±12V isolated ──► [LC filter] ──► rails
```

### Block 2. Input Buffer (U1A — TL072)

```
              C_IN (1µF)                ┌─────────┐
  J_IN ──●───┤├──────┬──────────────►│(+)  U1A │──┬── R2 (1kΩ) ──── BUF_OUT
              │      │                   │  TL072  │  │                    │
             ┴       R1                  │(-)     ─│──┘                    ├─→ DRY_SEND
            GND    [1MΩ REVISED]         └─────────┘                       │    (to Mix)
                     │                  (voltage follower)                 │
                    ┴                                                      └─→ to Pre-Emphasis
                   GND                                                          (Block 3)
```

**[REVISED]**: R1 100кΩ → **1МΩ** (Hi-Z compatibility для guitar). Optional: добавить 2× 1N4148 ESD clamp к ±12V rails на J_IN node.

### Block 3. Pre-Emphasis EQ (U3A — TL072)

```
                R_PE1 (10kΩ)        C_PE1 (1nF, C0G/NP0)
  BUF_OUT ──────┤├────┬──────────────┤├──────┐
                       │                      │
                       │            RV_BOOST (50kΩ lin)
                       │                │     │
                       │                └─────┘
                  ┌────┴─────────────┐
                  │                  │     R_PE4 (10kΩ)
  PE_OUT ◄────────│  U3A (TL072)     │──────┤├──────┐
                  │  non-inverting   │              │
                  │  shelf boost     │         R_PE3 (10kΩ)
                  └──────────────────┘              │
                                                   GND

  RV_BOOST=0: flat    RV_BOOST=50k: +8dB above ~3.2kHz
```

**[NOTE]**: corner ~3.2кГц **корректен** для shelving topology (calculation 1/(2π × (R_PE1+RV_BOOST) × C_PE1) ≈ 2.65кГц shelf inflection). C_PE1 **MUST match** C_DE1 (Block 9) — both 1nF C0G/NP0 same batch.

### Block 4. Driver Amp (U1B) + Push-Pull (Q1/Q2) **[REVISED]**

```
                                         R4 (47kΩ)
  RV_DRIVE          R3 (10kΩ)    ┌────────┤├────────┐
  (100kΩ log)                     │                  │
  PE_OUT ──►┤ ──────┤├──────┬────►│(-)  U1B (TL072) │──┐
                             │    │                  │  │
                            ┴     │(+)              ─│──┤──►── R5 (100Ω) ──┐
                           GND    └──────────────────┘  │                   │
                                                        │            ┌──────┤
  Gain = R4/R3 = 47k/10k = 4.7×                        │            │      │
                                                                    │      │
  [REVISED] Class AB bias diodes:                                   │      │
                                                                    │      │
   +12V ──► R_BIAS1 (1kΩ) ──┬── D_BIAS1 (1N4148) ──┐            ┌──┴──┐    │
                             │                       │      ┌────│ Q1   │    │
                             │                       │      │BD139│NPN  │    │
                             ▼                       │      └─────┘    │   │
                        Q1 base                      │      E ──► R6 (10Ω)──┐
                                                     │      └────────────┘   │
                                                     ▼                       │
                                                Q2 base                       │
                                                ┌─────┐                      │
                                                │ Q2   │                     │
                                                │BD140│PNP                   │
                                                └────┬┘                      │
                                                E ──► R7 (10Ω) ──────────────┘
                                                                              │
                              D_BIAS2 (1N4148) ──┐                            │
                              R_BIAS2 (1kΩ)       │                           │
   -12V ──────────────────────┴──── Q2 base       │                           │
                                                  │                           │
                                                                  PP_OUT ──► C_DC (1000µF) [REVISED 220µF→1000µF]
                                                                              │
                                                                              ▼
                                                                  R8 (4.7Ω 5W wirewound) [REVISED — power resistor]
                                                                              │
                                                                              ▼
                                                                       J_EX (JST-XH 2-pin) → exciter
```

**[REVISED]**:
- C_DC 220µФ → **1000µФ** (corner 18Hz instead of 83Hz, full bass extension).
- R8 **specified as 5W wirewound** (Panasonic ERG-5SJ4R7) — рассеивает 3.8Вт peak.
- **Bias diodes added**: 2× 1N4148 + 2× 1кΩ для class AB (eliminates crossover distortion).

### Block 5. Feedback Summing + Freeze (U4A — TL074)

```
                                      R_FS3 (47kΩ)
                                ┌──────┤├────────────────────┐
                                │    D_LIM1 (1N4148)          │
                                │   ──►|◄──                   │
                                │    D_LIM2 (1N4148)          │
             SW_FREEZE          │   ──◄|►──                   │
  DRV_SEND ──┤ NORMAL├── R_FS1 (47kΩ) ──┤                    │
              │ FREEZE├── GND            │    ┌────────────┐  │
              └────────┘                 ├───►│(-)  U4A    │──┘── FB_OUT
                                         │    │  TL074     │       │
  WET_FB ── RV_FEEDBACK ── R_FS2 (47kΩ) ─┘    │(+)        │       │
            (100kΩ log)                        └─────┬─────┘       └──► to Driver Amp
                                                R_FS4 (47kΩ)            (Block 4 input)
                                                     │
                                                    GND

  FREEZE: disconnects input, maxes feedback → self-oscillation.
  D_LIM1/D_LIM2: clamp feedback to ±0.7V on virtual ground (soft limiter).

  [VERIFICATION REQUIRED]: SPICE Nyquist analysis с RLC modelью пластины
  (R=1Ω, L=10mH, C=1µF для ~1.6кГц resonance) — verify Nyquist gain margin > 6dB,
  phase margin > 45° на feedback maximum. Test для high-Q materials (Q=1000 spring steel).
```

### Block 6. Sidechain Input (U4B — TL074)

```
                C_SIDE (1µF)    R_SIDE (47kΩ)    R_SIDE_FB (47kΩ)
  J_SIDE ──●──────┤├─────────────┤├──────┬─────────┤├──────┐
                                          │                  │
  (normalled                         ┌────┴──────────────┐   │
   to GND)                           │(-)  U4B (TL074)  │───┘── R_SIDE_MIX (10kΩ)
                                     │                    │            │
                                GND──│(+)                ─│           └──► FB_SUM node
                                     └────────────────────┘             (Block 5)

  Gain = -1. When DRIVE=0, sidechain alone drives exciter.
```

### Block 7. Dual Piezo Preamp (Q3 LSK489A + U3B/U4C) **[REVISED]**

```
  Cartridge piezo connection via mini-XLR shielded cable [REVISED — was JST]:

  J_PA TA3M ──Pin 2 (signal)──► Module piezo preamp:
              Pin 1 (shield)──► AGND (single-point at module side)
              Pin 3 (NC or signal return)

  [REVISED] LSK489A SOT-23-6 dual matched JFET (replaces 2× 2N5457 EOL):

  PIEZO A signal ──► C_PA (10nF) ──► R_PA (10MΩ to GND) ──► LSK489A pin 1 (Gate A)
                                                                │
                                                           Drain A ─► +12V via internal config
                                                                │
                                                           Source A ──► R_SA (4.7kΩ) ──► -12V
                                                                │
                                                                └──► C_CA (1µF) ──► R_BA (4.7kΩ) ──┐
                                                                                                    │
                                                                                       ┌────────────┘
                                                                                       │
                                                                                ┌──────┴──────┐
                                                                                │(+) U3B      │ TL072
                                                                                │             │── PREAMP_A_OUT
                                                                                │(-)         ─│──┐
                                                                                └─────────────┘  │
                                                                          ┌─ R_GA (22kΩ) ──┬────┘
                                                                          │  C_HA (100pF)  │
                                                                          └─ R_RA (1kΩ) ───┘
                                                                                  │
                                                                                 GND

  Gain = 1 + R_GA/R_RA = 1 + 22k/1k = ×23 (+27dB)
  
  PIEZO B (identical chain): LSK489A pins for Gate B, Source B → C_CB → R_BB → U4C → PREAMP_B_OUT
```

**[REVISED CRITICAL]**:
- 2× 2N5457 → **1× LSK489A SOT-23-6 dual matched JFET**. Auto-matched between channels (same die).
- **Mini-XLR connector** (Switchcraft TA3M на module, TA3F на cartridge) replaces JST для piezo.
- **Guard ring** на PCB вокруг JFET gate pads — 0.5мм GND trace, via stitching (см. PCB layout section).

### Block 8. Position Crossfade (U4D — TL074)

```
                    R_XA (10kΩ)
  PREAMP_A_OUT ──────┤├──────┐
                              │     RV_POSITION (100kΩ dual-gang)
                              ├────►┤ wiper ├──── R_XS1 (47kΩ) ──┐
                              │                                    │   R_XFB (47kΩ)
  PREAMP_B_OUT ──────┤├──────┘                               ┌────┴────┤├────┐
                    R_XB (10kΩ)                               │                │
                                                         ┌────┴──────────┐     │
                                                    ┌────│(-)  U4D      │─────┘── XFADE_OUT
                                                    │    │  TL074       │           │
                                              R_XBIAS    │(+)          │           └──► to De-Emphasis
                                              (47kΩ) ────│              │
                                                    │    └─────────────┘
                                                   GND

  Fully CCW: Piezo A only (bright). Fully CW: Piezo B only (warm).
  For stereo: A and B also go directly to L/R outputs BEFORE crossfade.
```

### Block 9. De-Emphasis EQ (U4C — TL074)

```
  Mirror of Pre-Emphasis (Block 3). Same topology, configured for CUT:

                R_DE1 (10kΩ)        C_DE1 (1nF, C0G/NP0 — MUST match C_PE1!)
  XFADE_OUT ─────┤├────┬──────────────┤├──────┐
                        │                      │
                        │            R_DE2 (22kΩ) — fixed cut
                        │                │     │
                        │                └─────┘
                  ┌─────┴────────────┐
  DE_OUT ◄────────│  de-emphasis amp │────── R_DE4 (10kΩ) ──┐
                  └──────────────────┘                       │
                                                        R_DE3 (10kΩ)
                                                             │
                                                            GND
```

**[CRITICAL]**: C_DE1 and C_PE1 from same batch C0G/NP0 ceramics. Mismatch → frequency response error.

### Block 10. Tone LPF + LED Clipper (U2A, D1, D2) **[REVISED]**

```
                R_TF       RV_CUTOFF                    ┌─────────┐
  DE_OUT ────────┤├────┬───►┤ (100kΩ) ├── C_TF ──┤    │(+)  U2A │──── R_CL ──┬── CLIP_NODE
                1kΩ    │                   10nF   │    │  TL074  │    1kΩ     │
                       │                          │    │(-)     ─│──┐         │
                       │                         GND   └─────────┘  │         ├── D1+D2+D3 LED ──► GND
                       │                                 (follower)  │         │   (clip + side, 3 LED in series)
                       └──────────────────────────────────────────────┘         │
                                                                               ├── D4+D5+D6 LED ◄── GND
                                                                               │   (clip - side)
  Cutoff range: 158Hz (RV=100k) → 15.9kHz (RV=0)                             │
  [REVISED] LEDs in series (3 each direction): clip at ±5.4V              R_CLB (100kΩ)
                                                       (was ±1.8V)             │
                                                                              GND
```

**[REVISED]**: Single LED каждой polarity → **3 LED в серии** каждой polarity (Vf 1.8V × 3 = 5.4V). Clip threshold +10.6 dBu вместо +1.2 dBu — line-level safe.

### Block 11. Attack/Decay VCA (U5 — LM13700) **[REVISED]**

```
  ════════════ ENVELOPE FOLLOWER (REVISED — independent A/D paths) ════════════

  BUF_OUT ── R_EF1 (10kΩ) ──┬──►|── D_ATK (1N4148) ──┐
                              │                        │  RV_ATTACK (220kΩ log) [REVISED 1MΩ→220kΩ]
                              │                        │  (charge path)
                              │                        │
                              │                        ▼
                              │                   ENV_CAP (220nF film) [REVISED 1µF→220nF]
                              │                        │
                              │   ◄|── D_DEC (1N4148) ─┤
                              │                        │  RV_DECAY (1MΩ log)
                              │                        │  (discharge path)
                              │                        │
                              │                       J_CV_DECAY
                              │                        │
                             [bias resistor]         GND

  Attack τ_max = 220k × 220n = 48ms ✓ (was 1s, too slow)
  Decay τ_max  = 1M × 220n = 220ms (or use 1µF for 1s — choice)

  ENV_CAP voltage → R_IABC (10kΩ) → U5 pin 1 (I_abc)

  ════════════ VCA (OTA1) ════════════

                   R_VCA_IN (10kΩ)       ┌──────────────┐
  CLIP_NODE ────────┤├──────────────────►│ IN+    U5     │
                                          │ LM13700     │──► VCA_BUF_OUT
                   R_VCA_G (10kΩ)        │ OTA1   BUF  │      │
  GND ──────────────┤├──────────────────►│ IN-          │      └──► to Mix
                                          └──────────────┘          (wet signal)
                   R_BLIN (10kΩ)
  +12V ─────────────┤├──────────►── U5 pin 2 (linearizing diode bias)

  R_VCA_LOAD (10kΩ): OTA output to GND
```

**[REVISED]**:
- C_ENV: 1µФ → **220нФ film** (low-leakage).
- RV_ATTACK: 1МΩ → **220кΩ** (musical attack range 1–48мс).
- **D_ATK + D_DEC** added: independent charge/discharge paths.
- **OTA2 unused** (note in original): tie inputs (pins 13, 14) and I_abc (pin 16) to GND.

### Block 12. Noise Generator (Q4 / D_NOISE, U2C) **[REVISED]**

```
  [REVISED] BC547 reverse-breakdown → BZX55C9V1 zener (stable, specified noise):

  +12V
    │
  R_NOISE (10kΩ) [REVISED 100kΩ→10kΩ for proper zener current]
    │
    ▼
  D_NOISE (BZX55C9V1, 9.1V zener, reverse-biased) ──┬── C_NI (100nF) ── R22 (10kΩ) ──┐
    │                                                 │                                │
    └────────────────────────────────────────────────┴─────────────────────────────► U2C (TL074)
                                                                                      │ inverting amp
                                                                                      │
                                                                                  R23 (1MΩ)
                                                                                      │ (gain)
                                                                                      │
                                                                                C_NF (10pF)
                                                                                      │
                                                                                      ▼
                                                                              C_NO (1µF)
                                                                                      │
                                                                                  RV_COLOR
                                                                                  (100kΩ) ── C_COL (10nF)
                                                                                      │
                                                                                  RV_NOISE
                                                                                  (100kΩ)
                                                                                      │
                                                                                  NOISE_OUT → Mix

  Gain = R23/R22 = 1M/10k = ×100
```

**[REVISED]**: Q4 BC547 in reverse breakdown → **D_NOISE BZX55C9V1** (9.1V zener). Specified noise spec, batch-consistent, no degradation over time.

### Block 13. Mix + Stereo Output (U2D — TL074)

```
  DRY_SEND ──── R_MD (47kΩ) ──────────────┐
                                            │       R_MFB (47kΩ)
  VCA_BUF_OUT ── RV_MIX ── R_MW (47kΩ) ───┤   ┌────┤├────────┐
                 (100kΩ)                    │   │              │
  NOISE_OUT ──── R_MN (100kΩ) ─────────────┤   │ ┌──────────┐ │
                                            ├───┴►│(-)  U2D  │─┘── C_OUT ── R_OUT ── J_OUT_L
  J_CV_MIX ──── R_MCV (100kΩ) ────────────┘     │  TL074   │     (1µF)    (1kΩ)
                                             ┌───│(+)       │
                                             │   └──────────┘
                                        R_MNI (47kΩ)
                                             │
                                            GND

  ═══ STEREO (active when J_OUT_R plugged in) ═══

  PREAMP_A_OUT ── R_SL (47kΩ) ──┐                ┌── R_SLF (47kΩ) ── J_OUT_L
  DRY_SEND ────── R_DL (47kΩ) ──┼── summing amp ─┘
                                  │
  PREAMP_B_OUT ── R_SR (47kΩ) ──┐                ┌── R_SRF (47kΩ) ── J_OUT_R
  DRY_SEND ────── R_DR (47kΩ) ──┼── summing amp ─┘
```

### Block 14. Solenoid Damper (Q5 — 2N7000) **[REVISED]**

```
  +12V                                  Gate drive (REVISED — proper turn-on margin):
    │
    │    ┌────────────┐                 J_CV_DAMP ── R_DAM1 (47kΩ) [REVISED 100k→47k]
    │    │  SOLENOID  │                                │
    │    │  5V push   │                                ├── R_DAM2 (10kΩ) ── Gate Q5
    │    └──────┬─────┘                                │
    │           │                                R_DAM3 (100kΩ)
    │      D_SOL (1N4001)                              │
    │     ──|◄── (flyback)                            GND
    │           │                       
    │      ┌────┴────┐                  Divider ratio: 100k / (47k+100k) = 0.68
    └──────│ Drain    │                  CV 5V → gate 3.4V (solid turn-on, all 2N7000 specimens)
           │ Q5 2N7000│                  
      Gate─│          │                  CV 0V → gate 0V (clean off)
           │ Source   │
           └────┬─────┘
               GND
```

**[REVISED]**: R_DAM1 100кΩ → **47кΩ** для solid MOSFET turn-on at CV 5V. Vorher (100k/100k divider gave 0.5 ratio = marginal 2.5V at gate, on threshold). Теперь 0.68 ratio = 3.4V на gate (reliable).

D_SOL **mandatory** — без flyback diode inductive kickback fries Q5 every off-transition.

### Block 15. Optional v2 — Geiger Pattern Noise (firmware add-on, deferred to Phase 2)

Optional ATtiny85 + 8-bit DAC + LFSR firmware → impulsive cluster events instead of continuous hiss. Replaces D_NOISE с MCU-driven analog DAC. Не Phase 1.

```
  +5V (from local LDO) ──► ATtiny85
                              │
                          PWM out ──► RC filter → audio output
                              │
                          (replaces zener noise path, optional install)
```

### Suммарная сводка

- **15 functional blocks** total.
- **5 ICs**: 2× TL072 (DIP-8) + 2× TL074 (DIP-14) + 1× LM13700 (DIP-16).
- **6 transistors**: 1× LSK489A (SOT-23-6 dual JFET) + 1× BD139 + 1× BD140 + 1× 2N7000 (TO-92).
- **1 zener**: BZX55C9V1 (DO-35).
- **Multiple diodes**: 1× 1N4001 (solenoid flyback), 6× 1N4148 (clamps + bias + envelope), 2× 1N5817 (power reverse).
- **6 LEDs**: 3× pair clipper indicators (2 trios × 3 LED in series).

## Полный BOM

Таблица закупок Last Night v2.2 — все компоненты для одного модуля. Цены ориентировочные (USD, retail small-quantity, Mouser/Digi-Key 2025).

### Active components (ICs, transistors, diodes)

| Ref | Part Number | Описание | Package | Qty | Unit $ | Total $ | Sourcing |
|-----|-------------|----------|---------|-----|--------|---------|----------|
| U1, U3 | TL072CP | Dual JFET-input op-amp | DIP-8 | 2 | $0.50 | $1.00 | TI / Mouser |
| U2, U4 | TL074CN | Quad JFET-input op-amp | DIP-14 | 2 | $0.75 | $1.50 | TI / Mouser |
| U5 | LM13700N | Dual OTA с linearizing diodes | DIP-16 | 1 | $2.00 | $2.00 | TI / Mouser |
| Q3 | LSK489A | Dual matched N-JFET | SOT-23-6 (SMD) | 1 | $6.00 | $6.00 | LIS / Mouser |
| Q1 | BD139 | NPN BJT (50V, 1.5A) | TO-126 | 1 | $0.30 | $0.30 | ON Semi / Mouser |
| Q2 | BD140 | PNP BJT (50V, 1.5A) | TO-126 | 1 | $0.30 | $0.30 | ON Semi / Mouser |
| Q5 | 2N7000 | N-channel logic-level MOSFET | TO-92 | 1 | $0.15 | $0.15 | Multi-source |
| D_NOISE | BZX55C9V1 | 9.1V zener (noise source) | DO-35 | 1 | $0.10 | $0.10 | Multi-source |
| D_BIAS1, D_BIAS2 | 1N4148 | Signal diode (push-pull bias) | DO-35 | 2 | $0.01 | $0.02 | Multi-source |
| D_LIM1, D_LIM2 | 1N4148 | Signal diode (feedback limiter) | DO-35 | 2 | $0.01 | $0.02 | Multi-source |
| D_ATK, D_DEC | 1N4148 | Signal diode (envelope follower) | DO-35 | 2 | $0.01 | $0.02 | Multi-source |
| D_EF | 1N4148 | Envelope rectifier | DO-35 | 1 | $0.01 | $0.01 | Multi-source |
| D_SOL | 1N4001 | Solenoid flyback | DO-41 | 1 | $0.03 | $0.03 | Multi-source |
| D_P1, D_P2 | 1N5817 | Schottky reverse protection | DO-41 | 2 | $0.20 | $0.40 | Multi-source |
| D1–D6 | LED 3мм Red | Clip indicators (3 in series each polarity) | T-1 | 6 | $0.02 | $0.12 | Multi-source |
| **Subtotal** | | | | | | **$11.97** | |

### Resistors (1/4W metal film 1% unless noted)

| Ref | Value | Qty | Unit $ | Total $ | Notes |
|-----|-------|-----|--------|---------|-------|
| R1 | 1MΩ | 1 | $0.02 | $0.02 | Hi-Z input bias [REVISED 100kΩ→1MΩ] |
| R2 | 1kΩ | 1 | $0.01 | $0.01 | Output resistor |
| R3, R_DE1, R_DE3, R_DE4, R_PE1, R_PE3, R_PE4, R_EF1, R_IABC, R_VCA_IN, R_VCA_G, R_VCA_LOAD, R_BLIN, R_SIDE_MIX, R22 | 10kΩ | 15 | $0.01 | $0.15 | Various stages |
| R4 | 47kΩ | 1 | $0.01 | $0.01 | Driver feedback |
| R_FS1, R_FS2, R_FS3, R_FS4, R_DE2 (22к OK), R_SIDE, R_SIDE_FB, R_XS1, R_XFB, R_XBIAS, R_MD, R_MW, R_MFB, R_MNI, R_SL, R_SR, R_DL, R_DR, R_SLF, R_SRF | 47kΩ | 20 | $0.01 | $0.20 | Summing nets |
| R_GA, R_GB, R_DE2 | 22kΩ | 3 | $0.01 | $0.03 | Preamp gain, de-emph cut |
| R_RA, R_RB | 1kΩ | 2 | $0.01 | $0.02 | Preamp gain set |
| R_BA, R_BB, R_SA, R_SB | 4.7kΩ | 4 | $0.01 | $0.04 | JFET source resistors |
| R5 | 100Ω | 1 | $0.01 | $0.01 | Push-pull base current |
| R6, R7 | 10Ω | 2 | $0.01 | $0.02 | Push-pull emitter |
| **R8** | **4.7Ω 5W wirewound** | **1** | **$0.30** | **$0.30** | **[REVISED — power resistor]** |
| R_BIAS1, R_BIAS2 | 1kΩ | 2 | $0.01 | $0.02 | Push-pull bias [NEW] |
| R_TF, R_CL | 1kΩ | 2 | $0.01 | $0.02 | Tone/clip series |
| R_CLB | 100kΩ | 1 | $0.01 | $0.01 | Clip pulldown |
| R_NOISE | 10kΩ | 1 | $0.01 | $0.01 | Zener current set [REVISED] |
| R23 | 1MΩ | 1 | $0.02 | $0.02 | Noise amp gain |
| R_DAM1 | **47kΩ** | 1 | $0.01 | $0.01 | **[REVISED 100k→47k]** Solenoid divider |
| R_DAM2 | 10kΩ | 1 | $0.01 | $0.01 | Gate stop |
| R_DAM3 | 100kΩ | 1 | $0.01 | $0.01 | Gate pulldown |
| R_DCV, R_MN, R_MCV | 100kΩ | 3 | $0.01 | $0.03 | Various |
| R_PA, R_PB | 10MΩ | 2 | $0.05 | $0.10 | JFET gate bias (high impedance — quality matters) |
| **Resistor subtotal** | | ~62 | | **~$1.05** | |

### Capacitors

| Ref | Value | Type | Qty | Unit $ | Total $ | Notes |
|-----|-------|------|-----|--------|---------|-------|
| C_PE1, C_DE1 | 1nF | Ceramic C0G/NP0 ±5% | 2 | $0.05 | $0.10 | **[CRITICAL: same batch для matching]** Murata GRM1885C1H102JA01D |
| C_TF, C_COL | 10nF | Ceramic X7R | 2 | $0.02 | $0.04 | |
| C_PA, C_PB | 10nF | Ceramic X7R | 2 | $0.02 | $0.04 | Piezo AC coupling |
| C_NF | 10pF | Ceramic NP0 | 1 | $0.03 | $0.03 | Noise HF rolloff |
| C_HA, C_HB | 100pF | Ceramic NP0 | 2 | $0.03 | $0.06 | Preamp HF compensation |
| C_NI | 100nF | Ceramic X7R | 1 | $0.03 | $0.03 | Noise coupling |
| C1–C10 | 100nF | Ceramic X7R | 10 | $0.03 | $0.30 | IC decoupling |
| C_IN, C_OUT, C_SIDE, C_CA, C_CB, C_NO | 1µF | Film box | 6 | $0.15 | $0.90 | Audio coupling Wima MKS2 |
| **C_ENV** | **220nF** | **Film** | **1** | **$0.10** | **$0.10** | **[REVISED 1µF→220nF]** Low-leakage |
| **C_DC** | **1000µF 25V** | **Electrolytic** | **1** | **$0.30** | **$0.30** | **[REVISED 220µF→1000µF]** Panasonic EEU-FR |
| C_B1, C_B2 | 10µF | Electrolytic | 2 | $0.10 | $0.20 | Bulk supply |
| C_B3 | 47µF | Electrolytic | 1 | $0.10 | $0.10 | Bulk supply [NEW visible from caркас] |
| **Capacitor subtotal** | | ~30 | | | **~$2.20** | |

### Potentiometers (Alpha RV09 9мм vertical PCB-mount)

| Ref | Value | Taper | Qty | Unit $ | Total $ | Function |
|-----|-------|-------|-----|--------|---------|----------|
| RV_DRIVE | 100kΩ | log | 1 | $1.20 | $1.20 | Drive level |
| RV_FEEDBACK | 100kΩ | log | 1 | $1.20 | $1.20 | Feedback amount |
| RV_MIX | 100kΩ | log | 1 | $1.20 | $1.20 | Wet/dry |
| RV_BOOST | 50kΩ | lin | 1 | $1.20 | $1.20 | Pre-emphasis |
| **RV_ATTACK** | **220kΩ** | **log** | 1 | $1.20 | $1.20 | **[REVISED 1MΩ→220kΩ]** Env attack |
| RV_DECAY | 1MΩ | log | 1 | $1.20 | $1.20 | Env decay |
| RV_POSITION | 100kΩ dual-gang | lin | 1 | $2.50 | $2.50 | Piezo crossfade |
| RV_CUTOFF | 100kΩ | lin | 1 | $1.20 | $1.20 | Tone filter |
| RV_NOISE | 100kΩ | log | 1 | $1.20 | $1.20 | Noise level |
| RV_COLOR | 100kΩ | lin | 1 | $1.20 | $1.20 | Noise color |
| **Pot subtotal** | | | 10 | | | **$13.30** |

### Switches & connectors

| Ref | Part | Qty | Unit $ | Total $ | Notes |
|-----|------|-----|--------|---------|-------|
| SW_FREEZE | SPDT toggle on-on | 1 | $2.00 | $2.00 | C&K 7101 series |
| J_IN, J_SIDE, J_OUT_L, J_OUT_R, J_CV_MIX, J_CV_DECAY, J_CV_DAMP | Thonkiconn PJ301M-12 | 7 | $1.00 | $7.00 | 3.5mm vertical |
| **J_PA, J_PB (на module side)** | **Switchcraft TA3M (mini-XLR)** | **2** | **$3.00** | **$6.00** | **[REVISED — was JST]** Shielded |
| J_EX, J_SOL | JST-XH 2-pin header | 2 | $0.20 | $0.40 | Cartridge connections (low-criticality) |
| J_PWR | IDC 2×5 pin header | 1 | $0.50 | $0.50 | Eurorack power |
| **Connector subtotal** | | | | | **$15.90** |

### Cartridge interface (на cartridge side, included с cartridge)

| Ref | Part | Qty | Unit $ | Total $ |
|-----|------|-----|--------|---------|
| Cartridge mating jacks: TA3F (mini-XLR female) | Switchcraft TA3F | 2 | $3.00 | $6.00 |
| Cartridge mating: JST-XH housing + crimp pins | JST | 2 | $0.20 | $0.40 |
| Coax cable (RG-174 или sub-mini) | Belden или equivalent | 2× 50мм | $0.50 | $1.00 |
| **Cartridge interface subtotal** (per cartridge) | | | | **$7.40** |

### Mechanical & misc (на module)

| Item | Qty | Unit $ | Total $ |
|------|-----|--------|---------|
| Aluminum panel 20HP × 128.5мм (anodized, laser-etched) | 1 | $15.00 | $15.00 |
| M3 hex screws (panel mount) | 4 | $0.10 | $0.40 |
| M3 standoffs (PCB to panel) | 4 | $0.20 | $0.80 |
| Knob caps (RV pots) | 10 | $0.50 | $5.00 |
| Shrouded LED holders | 6 | $0.10 | $0.60 |
| Solder, flux, misc | — | — | $1.00 |
| **Mechanical subtotal** | | | **$22.80** |

### PCB

| Option | Layers | Cost (5-pcs run) | Per unit |
|--------|--------|------------------|----------|
| **Budget** | 2-layer FR4 1.6mm | $15 | $3.00 |
| **Premium** | 4-layer FR4 1.6mm | $75 | $15.00 |

### Total BOM per module

| Category | Budget | Premium |
|----------|--------|---------|
| Active components | $11.97 | $11.97 |
| Resistors | $1.05 | $1.05 |
| Capacitors | $2.20 | $2.20 |
| Pots | $13.30 | $13.30 |
| Switches & connectors | $15.90 | $15.90 |
| Mechanical | $22.80 | $22.80 |
| PCB | $3.00 | $15.00 |
| **Total module** | **$70.22** | **$82.22** |

### Per cartridge (typical wood, oak)

| Item | Cost |
|------|------|
| Cartridge frame (3D PETG print) | $5.00 |
| Wood plate (oak 100×40×4mm, finished) | $8.00 |
| Exciter DAEX25FHE-4 | $20.00 |
| 2× piezo discs 27мм | $1.00 |
| Cartridge interface (TA3F + JST + cable) | $7.40 |
| Magnets (4× neodym N42 5×5×2мм) | $1.00 |
| Retention pin + spring | $0.50 |
| Foam-lined box + material card | $3.50 |
| **Total cartridge BOM** | **$46.40** |

### Premium cartridge (titanium с PVDF)

| Item | Cost |
|------|------|
| Aluminum frame (CNC-milled) | $15.00 |
| Titanium plate 100×30×1.5мм | $30.00 |
| Exciter DAEX32Q-4 | $40.00 |
| 1× piezo 27мм + 1× PVDF film LDT0-028K | $4.00 |
| Cartridge interface | $7.40 |
| Magnets + retention | $1.50 |
| Premium packaging (foam + leather case + serial card) | $8.00 |
| **Total premium cartridge BOM** | **$105.90** |

### Retail pricing implications

| SKU | BOM | Retail | Gross margin |
|-----|-----|--------|--------------|
| Module budget | $70 | $350 | 80% |
| Module premium (4-layer PCB) | $82 | $400 | 79% |
| Cartridge oak | $46 | $80 | 42% |
| Cartridge premium titanium | $106 | $350 | 70% |

**Boutique sustainable** при above margins — covers R&D amortization (+10–15% deduction), distribution cut (если используется), warranty reserve, manufacturing labor (DIY: own time; factory: $20-30/unit assembly).

## PCB layout — зоны и правила разводки

PCB **101.6 × 108мм**, 2-layer FR4 1.6мм (budget) или 4-layer FR4 1.6мм (premium).

### Zone diagram (top view)

```
┌─────────────────────────────────────────────────────────────────────┐
│  PCB 101.6 × 108mm                                                  │
│                                                                     │
│  ┌──────────┐  ┌──────────────────┐  ┌────────────────┐            │
│  │ ZONE 1:  │  │ ZONE 4:          │  │ ZONE 8:        │            │
│  │ POWER    │  │ PIEZO PREAMP     │  │ SOLENOID       │            │
│  │          │  │ (Q3 LSK489A,     │  │ DRIVER         │            │
│  │ J_PWR    │  │  guard ring)     │  │ (Q5)           │            │
│  │ 1N5817×2 │  │                  │  │                │            │
│  │ C_B*     │  │ J_PA, J_PB       │  │ J_SOL          │            │
│  │ Decoupling│  │ (mini-XLR pads)  │  │ D_SOL          │            │
│  └──────────┘  └──────────────────┘  └────────────────┘            │
│                                                                     │
│  ┌──────────┐  ┌──────────────────┐  ┌────────────────┐            │
│  │ ZONE 2:  │  │ ZONE 5:          │  │ ZONE 9:        │            │
│  │ DRIVER   │  │ FEEDBACK + FREEZE│  │ NOISE GEN      │            │
│  │ (Q1, Q2, │  │ (U4A, SW_FREEZE, │  │ (D_NOISE       │            │
│  │  R8 5W)  │  │  D_LIM diodes)   │  │  zener,        │            │
│  │          │  │                  │  │  U2C)          │            │
│  │ Thermal  │  │ J_SIDE           │  │                │            │
│  │ pads to  │  │                  │  │                │            │
│  │ panel    │  │                  │  │                │            │
│  └──────────┘  └──────────────────┘  └────────────────┘            │
│                                                                     │
│  ┌──────────┐  ┌──────────────────┐  ┌────────────────┐            │
│  │ ZONE 3:  │  │ ZONE 6:          │  │ ZONE 7:        │            │
│  │ INPUT/   │  │ TONE / LED CLIP /│  │ MIX / OUTPUT   │            │
│  │ PRE-EMPH │  │ ENV VCA          │  │ (U2D)          │            │
│  │ (U1A,    │  │ (U2A, D1-D6,     │  │                │            │
│  │  U3A)    │  │  U5 LM13700)     │  │ J_OUT_L,       │            │
│  │          │  │                  │  │ J_OUT_R        │            │
│  │ J_IN     │  │ J_CV_DAMP        │  │ J_CV_MIX,      │            │
│  │          │  │ J_CV_DECAY       │  │ J_CV_DECAY     │            │
│  └──────────┘  └──────────────────┘  └────────────────┘            │
│                                                                     │
│  Bottom edge: panel-mount jacks, pots, LEDs                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Strategy: разделение GND зон

**AGND** (analog ground — критическая):
- Zone 3 (input/pre-emphasis).
- Zone 4 (piezo preamp — самая чувствительная).
- Zone 5 (feedback summing).
- Zone 6 (tone/clip/VCA).
- Zone 7 (mix/output).

**DGND** (digital/switching):
- Zone 8 (solenoid driver).
- Zone 9 (noise generator — может coupling).
- LED indicators.

**PGND** (power):
- Zone 1 (power supply).
- Zone 2 (driver amp output stage — high current).

**Star ground tie**: AGND, DGND, PGND соединяются в **одной точке** около J_PWR. Выглядит как 3 отдельных pour zones, ведущих в одну central point.

### Critical routing rules

#### JFET gate trace (Zone 4)

```
J_PA (mini-XLR pin 2) ──[short trace 5–10mm, surrounded by guard ring]── Q3 Gate A pad
                                                                              │
                          R_PA 10MΩ (close к gate, <3mm) ────────────────────┘
                                                                              │
                                                                             AGND
```

Guard ring requirements:
- 0.5мм GND trace вокруг entire trace + Q3 gate pad area.
- Via stitching каждые 2мм along guard.
- **No other signals routed within 5мм** of guard ring.
- 4-layer PCB: GND plane на layer 2 directly under guard area.

#### Solenoid driver loop (Zone 8)

Loop area minimization (reduce EMI radiation):

```
+12V rail ──┬── Solenoid coil (на cartridge) ─── return ──┬── Q5 drain ──┬── Q5 source ── PGND
             │                                              │                │
            D_SOL (flyback, anode to source, cathode +12V)│                │
             │                                              │                │
             └──────────────────────────────────────────────┘                │
                                                                              │
                                                                       (R8 not in this loop;
                                                                        R8 is в exciter path)
```

Loop physical area <100мм² recommended. Compact placement: D_SOL within 5мм от Q5.

#### Piezo input traces (Zone 4)

- **Length <20мм** from mini-XLR pad к LSK489A gate.
- **Width 0.2мм** (minimal — high impedance).
- **GND pour** на both sides of trace + via stitching.
- **No vias** на signal trace itself.
- 4-layer PCB: signal trace on top layer, GND plane (layer 2) directly underneath = de facto coaxial.

#### Push-pull power path (Zone 2)

- Symmetry: Q1 and Q2 trace lengths matched (≤2мм difference).
- Thermal coupling: Q1 и Q2 placed adjacent (<5мм apart) для shared thermal mass.
- R8 isolated: vertically mounted (на edge), thermally isolated от Q1/Q2.
- C_DC (1000µF electrolytic): polarized, marker visible после assembly.

### Decoupling placement

Каждый IC получает **100nF X7R ceramic** на каждом power pin (V+ и V-), расположенный **<5мм от pin**:

| IC | Decoupling |
|----|-----------|
| U1 (TL072) | C1 (V+ pin 8), C2 (V- pin 4) |
| U2 (TL074) | C3 (V+ pin 4), C4 (V- pin 11) |
| U3 (TL072) | C5, C6 |
| U4 (TL074) | C7, C8 |
| U5 (LM13700) | C9 (V+ pin 11), C10 (V- pin 6) |

Дополнительно для LM13700: **10µF tantalum/electrolytic** parallel с 100nF (для switching transients OTA Iabc).

### 4-layer PCB stackup (premium)

```
Layer 1 (Top):     Components + signal traces
Layer 2 (Internal): Solid AGND plane (no breaks)
Layer 3 (Internal): Power planes (split: +12V зона, -12V зона)
Layer 4 (Bottom):   Signal traces + DGND/PGND pours
```

Via stitching:
- AGND vias каждые 5мм along critical traces (piezo, signal).
- Power vias parallel для current carrying.
- GND tie vias: top GND ↔ AGND plane ↔ bottom DGND/PGND через single-point.

### 2-layer PCB (budget) compromise

Без internal planes — split bottom pour для AGND vs DGND/PGND. Critical:
- Star ground point у J_PWR.
- Узкие traces (<0.5мм) соединяющие GND zones — это deliberate "fuse-link" против ground loops.
- Ferrite bead optional на solenoid +12V supply (snubs switching transients на shared supply).

### Component placement priority

1. **J_PWR** — у edge.
2. **Power supply zone (Zone 1)** — adjacent to J_PWR.
3. **Driver Amp (Zone 2)** — adjacent to power, with thermal exit к panel.
4. **Mini-XLR jacks** — у opposite edge from J_PWR (signal entry от cartridge dock).
5. **JFET preamp (Zone 4)** — close to mini-XLR jacks (<20мм trace length).
6. **Solenoid driver (Zone 8)** — opposite corner from JFET preamp (>40мм physical separation).
7. **Noise generator (Zone 9)** — isolated, separate from signal path.
8. **Output (Zone 7)** — у edge near panel jacks.

### Mounting holes

4× M3 holes на corners PCB — secured к panel rails. Не overlapping traces (1мм keepout).

### Silkscreen

- Component reference designators visible.
- Polarity marks для diodes, electrolytic caps, IC orientation (pin 1 dot).
- ICs orientation arrows.
- Critical notes: "DO NOT ROUTE SIGNALS NEAR JFET GATE (guard zone)" и "R8 5W WIREWOUND ONLY".

## Картридж — механика и сборка

### Cartridge frame design

```
Front view (cartridge facing user):
┌──────────────────────────────────┐  ← Frame 110×65×30мм
│  ┌────────────────────────────┐  │
│  │                            │  │
│  │      [ Plate window ]      │  │  ← Plate visible через cutout
│  │      100×40мм (typ.)       │  │     (varies per material)
│  │                            │  │
│  └────────────────────────────┘  │
│  ◯ Magnet 1   Magnet 2 ◯         │  ← 4 magnets, neodym N42
│                                  │
│  ◯ Magnet 3   Magnet 4 ◯         │
│                                  │
│  Side: TA3F mini-XLR ×2          │  ← Audio (piezo)
│  Side: JST-XH ×2                 │  ← Exciter, solenoid
│                                  │
│  Material label / serial # /     │
│  laser-etched logo               │
└──────────────────────────────────┘

Side view (cross-section):
┌──────────────────────────────────┐
│  Plate (variable thickness 0.5–6мм) - exciter mount on top face A
│ ──┬───────────────────────────┬── Rubber rail (top)
│   │     [PLATE]                │
│ ──┴───────────────────────────┴── Rubber rail (bottom)
│  Piezo A (Face B, near exciter)
│  Piezo B (Face B, far end)
│  
│  Frame (PETG / aluminum)
│  Connectors на side wall
└──────────────────────────────────┘
```

### Mounting hardware

- **Plate retention**: 2× rubber rails (top, bottom) — silicone strips, 2мм thick. Compress slightly при insertion plate.
- **Frame mount к module**: 4× neodym N42 magnets 5×5×2мм (recessed в frame), aligned с steel plates на module dock.
- **Retention pin**: spring-loaded plunger (small, like от mini-DIN connector) prevents accidental drop при rack inversion.

### Cartridge interface

```
Cartridge side wall:
┌─────────────────────────────────────┐
│  ┌─────────┐ ┌─────────┐            │
│  │ TA3F    │ │ TA3F    │            │  ← Piezo A, B (mini-XLR shielded)
│  │ Pin1=GND│ │ Pin1=GND│            │
│  │ Pin2=Sig│ │ Pin2=Sig│            │
│  └─────────┘ └─────────┘            │
│                                     │
│  ┌─┐ ┌─┐                            │
│  │ │ │ │                            │  ← Exciter, Solenoid (JST-XH 2-pin)
│  │ │ │ │                            │
│  └─┘ └─┘                            │
└─────────────────────────────────────┘

Internal wiring:
TA3F (A) Pin 2 ─── 50мм coax ─── piezo disc 27мм (face B, near exciter)
TA3F (A) Pin 1 ─── shield to chassis (frame)
TA3F (B) Pin 2 ─── 50мм coax ─── piezo disc 27мм (face B, far end)
TA3F (B) Pin 1 ─── shield to chassis

JST-XH (Exciter) ─── 50мм twisted pair ─── DAEX25 / DAEX32 на face A
JST-XH (Solenoid) ─── 50мм twisted pair ─── (passes through frame to module's solenoid mount)
```

### Mounting plate в frame

1. Apply 2× rubber rails в верхний и нижний slots of frame (peel-and-stick adhesive backing).
2. Insert plate sliding sideways от open side of frame.
3. Slight compression — plate stays put.
4. Secure exciter к face A using **M3 bolt + rubber gasket** (uncoupler) на center axis (~1/3 length от один edge). Avoid mode nodes.
5. Glue piezo discs на face B at positions A (under exciter, near edge) and B (opposite end).
6. Solder coax cable from each piezo к TA3F pins.
7. Wire exciter terminals к JST.
8. Wire solenoid coil (если cartridge содержит solenoid mount) к JST.

### Solenoid mount (опционально, может быть в frame или в module)

**Option A — solenoid в module dock**:
Solenoid attached к module structure, fetr tip extends into cartridge slot. Cartridge просто passes — no solenoid wiring к cartridge.

**Option B — solenoid в cartridge frame** (recommended):
Каждый картридж имеет own solenoid (felt tip optimized для plate thickness). JST connection через interface.

**Recommend Option B**: per-cartridge tuned damping (felt thickness и position varies по plate thickness). Cost: solenoid +$5 per cartridge.

### Cartridge-specific specifications

#### Wood cartridge (oak example)

- Plate: 100×40×4мм, oak hardwood (kiln-dried, finished с linseed oil).
- Plate weight: 12г.
- Exciter: DAEX25FHE-4 (light duty).
- Mounting position: ~33мм from one edge (1/3 length, off-center, avoids mode 1,1 antinode).

#### Stone cartridge (marble example)

- Plate: 100×50×5мм, polished Carrara marble.
- Plate weight: 68г.
- Exciter: DAEX32Q-4 (heavy duty for dense material).
- Reinforced rubber rails (heavier plate).

#### Metal thin cartridge (spring steel example)

- Plate: 100×20×0.5мм, hardened spring steel.
- Plate weight: 8г.
- Exciter: DAEX25FHE-4.
- **Knife-edge support** instead of rubber rails (preserves Q for thin metal).

#### Glass cartridge (Pyrex example)

- Plate: 100×40×3мм, Pyrex laboratory glass.
- Plate weight: 25г.
- Exciter: DAEX25FHE-4 с **thicker rubber gasket** (cushion against glass shock).
- Warning sticker: "FRAGILE — handle с care, не drop. Self-oscillation may shatter".

### Производство картриджа — флow

**Phase 1 prototype**:
1. Frame: 3D-print PETG (Prusa MK3S или equivalent), 0.2мм layer, 30% infill. ~2 hours per unit.
2. Plate: order finished plate from supplier (carpenter for wood, stone shop для marble, etc.).
3. Rubber rails: cut от silicone sheet 2мм thick, 4×100мм strips per cartridge.
4. Magnets: glue с epoxy (5-min cure) into recesses.
5. Exciter: epoxy mount к plate face A (M3 bolt option for recovery).
6. Piezo: cyanoacrylate (super glue) к face B at positions A, B.
7. Solder cables to TA3F + JST.
8. Test: ohmmeter on solenoid coil (~5–10Ω), exciter (~4Ω), piezo (capacitance ~10нФ).
9. Laser-etch material name + serial # on frame.
10. Pack in foam box.

**Phase 2 production scale**:
- Frame: CNC-milled 6061 aluminum (more durable, premium feel). ~10 minutes per unit.
- Bulk-purchase plates с supplier (50–100 units batch, lower per-unit cost).
- Pre-cut rubber rails delivered.
- Assembly line: 6 cartridges per hour solo.

## Sequence сборки модуля

Step-by-step assembly procedure для DIY single-unit или small batch (≤10 units).

### Preparation (1 hour)

1. Verify BOM completeness — все parts arrived согласно BOM table.
2. Check PCB на defects (cracks, copper bridges, unetched copper).
3. Set up workstation: ESD mat, soldering iron 350°C, flux, lead-free solder (или leaded для DIY).
4. Inspect ICs против their packages (avoid SMD vs DIP confusion).
5. Read schematic for placement reference.

### Step 1 — SMD components (если premium SKU с LSK489A)

LSK489A SOT-23-6 — единственный SMD компонент. Требует hot air rework station или fine-tip iron.

1. Apply small dab of flux на pad area.
2. Tweezer place LSK489A — orient pin 1 marker to silkscreen dot.
3. Tack one corner pin first (provides positioning).
4. Solder remaining pins working diagonally.
5. Inspect под loupe (10×) для bridges.
6. Clean flux residue с isopropyl alcohol.

### Step 2 — Resistors (10 minutes)

Bend leads, insert через PCB holes, solder, trim leads. Order:
1. Power section R1, R2.
2. Driver section: R3, R4, R5, R6, R7, R_BIAS1, R_BIAS2.
3. **R8 4.7Ω 5W wirewound** — vertical mount (см. specifications), can space ~3мм above PCB for thermal.
4. Preamp section: R_SA, R_SB, R_BA, R_BB, R_GA, R_GB, R_RA, R_RB.
5. Все остальные пассивы по schematic. Sortировать значения и установить в логическом порядке.

**TIP**: установить tallest components last (electrolytic capacitors), shortest first (resistors).

### Step 3 — Diodes (5 minutes)

1. **Polarity critical**: cathode band match silkscreen mark.
2. 1N4148 × 7 (clipper, bias, env, limiter).
3. 1N4001 × 1 (D_SOL solenoid flyback) — большое body чем 1N4148, не перепутать.
4. 1N5817 × 2 (D_P1, D_P2 power reverse) — Schottky.
5. **BZX55C9V1 zener** — also has cathode band. **Reverse-mounted в circuit** (anode to ground, cathode pulled up через R_NOISE).

### Step 4 — Capacitors (15 minutes)

1. **Ceramic** (X7R, NP0): unpolarized, no orientation. Install C_PE1 + C_DE1 first из same batch (matched).
2. **Film** (Wima MKS2 1µF): unpolarized. C_IN, C_OUT, C_SIDE, C_CA, C_CB, C_NO, **C_ENV (220nF film)**.
3. **Electrolytic**: polarized! Long lead = +. C_DC 1000µF, C_B1 10µF × 2, C_B3 47µF.
   - Orient per silkscreen polarity mark.
   - Double-check before soldering — reversed electrolytic explodes при первом power-on.

### Step 5 — Transistors (10 minutes)

1. **Q1 BD139** (NPN): pin out **B-C-E** (left-to-right facing flat side). Match silkscreen.
2. **Q2 BD140** (PNP): pin out **B-C-E** (same as BD139 — same package, opposite type). **Mark BD140 differently** to avoid mix-up. Sharpie dot on top.
3. **Q5 2N7000** (TO-92, MOSFET): pin out **D-G-S** (left-to-right, flat side facing).

**Thermal pad**:
- Q1, Q2: leave ~2мм lead length above PCB to allow thermal pad tape underneath. Apply thermal compound + heat-shrink between transistor body and PCB copper area (10×10мм thermal pad zone).
- Optional: bend transistors flat against PCB и attach с screw к panel mount tab.

### Step 6 — IC sockets (optional but recommended)

- Sockets U1, U2, U3, U4 (DIP-8/14 standard).
- **Mandatory socket для U5 LM13700** (DIP-16) — most likely IC to fail при miswiring.
- Insert sockets без ICs first, solder в place.

### Step 7 — ICs

1. **Don't insert ICs yet** — finish PCB assembly first.
2. After steps 8–12 below complete, then insert.

### Step 8 — Pots (10 minutes)

10× Alpha RV09 9мм vertical:
1. Solder в place — 3 pins each + 2 mounting tabs.
2. Verify alignment (perpendicular к PCB) before soldering all.
3. **Don't tighten panel-side nuts** until panel mounted.

### Step 9 — Switches & jacks (10 minutes)

1. **SW_FREEZE** (SPDT toggle): solder 3 pins.
2. **Thonkiconn jacks** ×7 (J_IN, J_SIDE, J_OUT_L, J_OUT_R, 3× CV): solder 3 pins each.
3. **Mini-XLR (TA3M)** ×2 для J_PA, J_PB: panel-mount with 4 screws + solder pins.
4. **JST-XH** ×2 (J_EX, J_SOL): solder 2 pins each.
5. **2×5 IDC** (J_PWR): solder 10 pins, **verify polarity match Eurorack standard** (red stripe = -12V).

### Step 10 — LEDs

6× Red LED 3мм (D1–D6, clipper indicators):
1. **Polarity**: long lead = anode (+).
2. Match silkscreen.
3. Install через panel-mount holders if using panel-mount.
4. Test fit с panel before soldering.

### Step 11 — Mechanical preparation

1. Mount panel temporarily — verify all panel-mount components (pots, jacks, switches, LEDs) align с panel cutouts.
2. If misalignments, identify and correct before final assembly.
3. Apply M3 standoffs к PCB corners.

### Step 12 — Pre-power-on inspection

**Before applying power**:

1. **Visual inspection** под loupe — every joint shiny, не dull.
2. **DMM continuity test**:
   - +12V to GND: infinite ohms (no short).
   - -12V to GND: infinite ohms.
   - +12V to -12V: infinite ohms.
   - All ICs power pins connected per schematic.
3. **No solder bridges** between adjacent SMD pads.
4. **All polarized components** correctly oriented (electrolytics, diodes, transistors).

### Step 13 — IC insertion

After successful inspection:

1. Wear ESD strap.
2. Insert ICs into sockets — **pin 1 alignment с socket marking**.
3. **Press carefully** — no bent pins.

### Step 14 — First power-on (smoke test)

**Hardware**:
- Bench PSU (±12V, current limit 100мА per rail).
- Multimeter.

**Procedure**:
1. Connect PSU к J_PWR (verify polarity!).
2. **Set current limit к 100мА** (key safety step).
3. Power on. Watch current draw closely.
4. **Idle current draw should be ~50–80мА per rail**. If higher → short somewhere.
5. Measure ±12V на каждом IC power pin (should read ±11.6V с 1N5817 drop).
6. **No magic smoke**: пройти test 1 minute без issues.
7. **Power off** before next steps.

### Step 15 — Cartridge attachment (test cartridge)

1. Insert test cartridge (oak reference).
2. Verify magnetic mate with retention pin engaged.
3. Connect cables (mini-XLR, JST × 2).
4. Visually verify exciter exciter sits flush к plate.

### Step 16 — Functional test (basic)

Continue к detailed testing per `## Тестирование` section.

### Estimated time

| Step | Time (single unit, experienced) | Time (first time) |
|------|--------------------------------|-------------------|
| Preparation | 1 hour | 2 hours |
| Steps 1-13 | 1 hour | 3 hours |
| Step 14 (power test) | 15 min | 30 min |
| Steps 15-16 (cartridge + basic test) | 15 min | 30 min |
| **Total** | **2.5 hours** | **6 hours** |

Production batch (5–10 units) — multiply by ~0.7× per-unit (assembly line efficiency).

## Калибровка

После assembly пройти калибровочные шаги для optimal performance.

### Calibration 1 — JFET preamp bias

LSK489A Idss varies между chips (matched within die, но different chips ≠ same Idss). Adjust **R_SA** (or equivalent) для setting drain voltage.

**Procedure**:
1. Power up module без cartridge.
2. Probe Q3 Source A pin (or Drain A).
3. Adjust R_SA — target voltage ~-6V (mid-rail of -12V supply).
4. Repeat для channel B (Source B).
5. **If voltage cannot be adjusted к -6V с standard R_SA = 4.7кΩ** → swap LSK489A (Idss too high or too low).

### Calibration 2 — Solenoid gate threshold

R_DAM1 47кΩ нормально, but Q5 Vth varies ±20% per piece.

**Procedure**:
1. Apply 5V CV к J_CV_DAMP.
2. Measure gate voltage on Q5.
3. **Should be ~3.4V** (CV × 100k / 147k).
4. If solenoid не activates но gate >2.1V → check solenoid coil continuity, D_SOL polarity.
5. If gate <2.1V с CV 5V → swap Q5 (low Vth specimen) or reduce R_DAM1 to 33кΩ.

### Calibration 3 — Pre/de-emphasis matching

Pre-emphasis (Block 3) и de-emphasis (Block 9) должны cancel each other when nothing in between.

**Procedure**:
1. Connect signal generator (1кГц 100мВ sine) к BUF_OUT.
2. Probe DE_OUT (after de-emphasis).
3. Sweep frequency 100Hz–20кГц.
4. **Response should be flat ±0.5dB** (RV_BOOST=0).
5. With RV_BOOST full CW → +8dB shelf above 3.2кГц при PE_OUT, **but** flat after DE_OUT.
6. If not flat → C_PE1 ≠ C_DE1. Replace caps from same batch.

### Calibration 4 — Feedback loop stability (SPICE-verified)

Before user accessible — verify loop не self-oscillates без cartridge installed.

**Procedure**:
1. Cartridge: install test cartridge с low Q (oak — Q ~50).
2. Set RV_FEEDBACK to maximum.
3. Listen для self-oscillation.
4. Should NOT self-oscillate с oak. Self-oscillation acceptable с titanium / spring steel cartridges (intended feature).
5. **If oak self-oscillates** → loop gain too high, reduce R_FS3 от 47k к 33k.

### Calibration 5 — VCA bias

LM13700 OTA bias for VCA mode.

**Procedure**:
1. Set RV_DECAY full CW (max sustain).
2. Apply DC voltage to BUF_OUT (1V).
3. Probe VCA_BUF_OUT.
4. Should track input с unity gain after VCA.
5. If output saturates / cuts off → check R_BLIN value (typical 10kΩ for ±12V supply, 30kΩ Iabc resistor).

### Calibration 6 — LED clipper threshold

3-LED stack should clip at +10.6 dBu.

**Procedure**:
1. Apply 1кГц sine to J_IN, sweep amplitude от 0 к +20 dBu.
2. Watch CLIP_NODE on osc.
3. Clipping должна start visible at peak ~5.4V (RMS ~3.8V = +10.6 dBu RMS).
4. If clipping starts earlier → проверить, что 3 LED in series correctly soldered (Vf 5.4V total).
5. If not clipping at all → wiring error, verify cathode-anode polarity each LED.

### Cartridge calibration (per cartridge after manufacturing)

**Each cartridge** receives calibration label с:
- Material name.
- Measured RT60 без feedback (±10%).
- Resonant frequency dominant mode (for SPICE feedback risk assessment).
- Recommended exciter (DAEX25 vs DAEX32).
- Mounting strain compensation (если plate sensitive к torque).

This data packed с cartridge для customer reference.

### Калибровочный паспорт модуля

После assembly + calibration выдаётся **calibration certificate** (printed card) с:

- Serial number.
- Date of manufacture.
- Idle current draw (per rail).
- Noise floor (input-shorted, dBV).
- THD at 100мВ (percent).
- Pre/de-emphasis matching error (dB across spectrum).
- Solenoid CV threshold (CV value where damping engages).
- Feedback stability margin (RV_FEEDBACK position где self-oscillation occurs с reference oak cartridge).
- Build technician signature.

Customer keeps for warranty + future reference.

## Тестирование

_Заполняется следующим коммитом._

## Troubleshooting

_Заполняется следующим коммитом._

## Sourcing & supply chain

_Заполняется следующим коммитом._

## Производственные batch processes

_Заполняется следующим коммитом._
