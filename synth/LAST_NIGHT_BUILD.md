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

_Заполняется следующим коммитом._

## Картридж — механика и сборка

_Заполняется следующим коммитом._

## Sequence сборки модуля

_Заполняется следующим коммитом._

## Калибровка

_Заполняется следующим коммитом._

## Тестирование

_Заполняется следующим коммитом._

## Troubleshooting

_Заполняется следующим коммитом._

## Sourcing & supply chain

_Заполняется следующим коммитом._

## Производственные batch processes

_Заполняется следующим коммитом._
