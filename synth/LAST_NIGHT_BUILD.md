# LAST NIGHT — Документация сборки и производства

> Production-ready документация: схемы, BOM, PCB layout, последовательность сборки, тестирование, troubleshooting.

> **Версия**: v5.0 (hybrid lock, Decision 09).
> Versus v4: фронтенд возвращается к mockup canon — две ручки NOISE + COLOR(geiger) (вместо одного bipolar knob); footswitches TAP/GATE-CRUSH/BYPASS/FREEZE (вместо KILL/FREEZE/TOLL/STALL); phaser always-on (без ON/OFF toggle); Shape Form slider возвращается. Electrical Decision 08 находки сохраняются: shared noise generator (zener + LFSR), solenoid double-function (DAMP + TOLL), но TOLL/STALL — **CV-only triggers** (J_TOLL_TRIG, J_STALL_CV) не footswitches. Gate/Crush блок 18 **восстановлен** как footswitch destruction effect.

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

## Логическая схема — 25 блоков (v5 hybrid)

Полная сигнальная цепь Last Night v5 hybrid разбита на **25 функциональных блоков**:
- **Блоки 1–15**: ядро (reverb engine — exciter / piezo preamp / feedback / VCA / solenoid / noise / mix).
- **Блок 16**: always-on phaser (4-stage OTA all-pass + Shape Form slider).
- **Блок 17**: REMOVED (was BBD vinyl wow → переехал в Last Day как OLD VINYL PT2399).
- **Блок 18**: Gate/Crush footswitch (CD4066 + LF398 + LM393, restored per Decision 09 v5 hybrid).
- **Блок 19**: Isolated DC-DC (pedal SKU only — TRACO TMR 3-1212WI / Recom RKD-1212-D).
- **Блок 20**: COLOR preset slider (4P5T detailed schematic).
- **Блоки 21–25**: Phase 2 cold palette upgrade kit (PULSE / FOG / FROST / CHILL / HUM).

Каждый блок документируется в стиле каркаса `audit/wood_reverb_logical_schematic.html`.

Изменения от v2.0 (каркас) → v5 hybrid (current) помечены **[REVISED]**, **[NEW]**, или **[REMOVED]**.

### Block 1. Power Supply (dual SKU)

#### Eurorack SKU — ±12V from rack bus

```
  +12V bus ──►|── D_P1 (1N5817) ──►── +12V rail ──┬── C_B1 (10µF) ──┐
                                                     ├── C_B3 (47µF) ──┤
                                                     │                  GND
  -12V bus ──|◄── D_P2 (1N5817) ──◄── -12V rail ──┬── C_B2 (10µF) ──┐
                                                     │                  GND
  ┌────────┐
  │ J_PWR  │  2×5 IDC header        Decoupling (100nF each, close to IC pins):
  │ 2×5    │  Pin 1 = -12V          C1,C2 → U1    C5,C6 → U3    C9,C10 → U5
  └────────┘  Red stripe = -12V     C3,C4 → U2    C7,C8 → U4    C11,C12 → U6 (phaser)

  +5V LDO (для ATtiny85 + LEDs):
  +12V ──► 7805 → +5V (50мА)
```

Power budget Eurorack:
- Audio analog: 150мА steady (TL072×2 + TL074×2 + 2×LM13700 + LSK489A).
- Driver amp: 100мА average.
- Solenoid pulse: 300мА peak (intermittent).
- ATtiny85 + LEDs: 50мА.
- Phaser + vinyl modulation circuits: 50мА.
- **Total**: ~250мА steady, ~500мА peak.

#### Pedal SKU — 12V DC + isolated DC-DC (NEW)

Modern complex-pedal standard: 12V DC supply (Strymon, Eventide, Meris, Chase Bliss). Это **same as Eurorack ±12V** после isolated DC-DC conversion → identical audio headroom между обеими SKU.

```
  12V DC jack (center-negative) ──► D_P1 (1N5817 reverse protection)
                                          │
                                          ▼
                                       +12V rail ──┬── 7805 LDO ──► +5V (digital +МCU)
                                                   │
                                                   ▼
                                           TRACO TMR 3-1212WI
                                           (isolated DC-DC, 3W,
                                            ±12V output, 125мА на rail)
                                                   │
                                                   ▼
                                          ╔═══════ ISOLATION BARRIER ═══════╗
                                          ║                                  ║
                                          ▼                                  ║
                                  ┌───────┴───────┐                          ║
                                  ▼               ▼                          ║
                              +12V audio     -12V audio                      ║
                              (clean,        (clean,                          ║
                               isolated      isolated                         ║
                               от pedal-     от pedal-                        ║
                               board GND)    board GND)                       ║
                                  │               │                          ║
                              C_B1 10µF        C_B2 10µF                      ║
                              C_B3 47µF        C_B4 47µF                      ║
                                  │               │                          ║
                              [LC filter]     [LC filter]                     ║
                              10µH + 10µF     10µH + 10µF                     ║
                                                                              ║
                              ╚═══════════════════════════════════════════════╝

  Decoupling: 100nF per IC + 10µF на LM13700/MCU (same as Eurorack).

  External: 12V DC center-negative, 500мА min, regulated.
  Compatible: Voodoo Lab Pedal Power 4×4 (12V outputs), Cioks DC7/DC10,
              Eventide PowerMax, Strymon Zuma R300, MXR ISO-Brick (18V port).
```

**DC-DC selection options**:

| Part | Output | Current | Cost | Notes |
|------|--------|---------|------|-------|
| **TRACO TMR 3-1212WI** | ±12V | 125mA | $13 | **Recommended budget** — 3W class. |
| **Recom RKD-1212-D** | ±12V | 250mA | $22 | Premium SKU — больше тока, audio-friendly noise specs. |
| TRACO TMA1212D | ±12V | 83mA | $15 | **Insufficient** для full power budget — не использовать. |
| RECOM RKE-0905D | ±5V | 100mA | $8 | Если accept reduced headroom (+5 dBu max). |

**Recommend**: **TRACO TMR 3-1212WI** budget SKU, **Recom RKD-1212-D** premium SKU. Both isolated → break ground loops с другими pedals на pedalboard.

**Power budget Pedal**:
- Audio analog (±12V): 150мА steady, 250мА peak.
- Digital +5V: 50мА.
- Solenoid pulse: 300мА peak (от +12V rail, low-side switched, intermittent).
- LEDs + footswitch indicators: 30мА.
- **Total**: ~250мА steady, **~500мА peak с solenoid + max FX**.

> **Headroom benefit**: ±12V audio rails (через isolated DC-DC) дают **identical performance к Eurorack version** — same TL072/TL074/LM13700 spec'd at ±12V get full +15 dBu max output. Audio path **бит-в-бит идентичен** между обеими SKU.

> **Isolation benefit**: isolated DC-DC ломает ground loops если customer запитан Last Night от той же PSU что и другие pedals. Standard Strymon/Empress/Eventide approach.

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

### Block 12. NOISE Generator + COLOR (Geiger) Crossfader **[REVISED v5 — hybrid layout]**

> **v5 hybrid (Decision 09)**: mockup canon возвращает 2 отдельные ручки фронтенда (NOISE level + COLOR geiger crossfader). Internally — shared zener + LFSR architecture из Decision 08 сохраняется, но **knob mapping упрощён**: NOISE = output level (после crossfader), COLOR(geiger) = position of crossfader между continuous hiss и cluster ticks. CCW COLOR → full hiss, CW COLOR → full ticks, middle = mix.

```
  ============= NOISE SOURCE A — Continuous zener =============

  +12V
    │
  R_NOISE (10kΩ)
    │
    ▼
  D_NOISE (BZX55C9V1, 9.1V zener, reverse-biased) ── C_NI (100nF) ── R22 (10kΩ) ──┐
                                                                                    │
                                                                                    ▼
                                                                            U2C TL074 (×100)
                                                                                    │
                                                                              [hiss output A]

  ============= NOISE SOURCE B — Geiger cluster ticks =============

  +5V (LDO from +12V via 7805)
    │
    ▼
  ATtiny85 (firmware: LFSR + cluster timing + comparator threshold sweep)
    │
    ├─ PWM_OUT ──► R_LPF (10kΩ) ── C_LPF (10nF) ──► [tick output B]
    │
    └─ ADC pin ◄── COLOR knob position (для tick rate adaptation)

  ============= CROSSFADER (driven by RV_COLOR / geiger knob) =============

  RV_COLOR (100kΩ lin, no detent — full sweep 0...100%):
    Wiper voltage 0..5V → control voltage для crossfader.

  Crossfader implementation (LM13700 OTA pair):
    Position 0% (CCW):  hiss output A → 100%, tick output B → 0%.
    Position 50%: A → 50%, B → 50% (mixed mid).
    Position 100% (CW): A → 0%, B → 100%.

    hiss_out_A ──► OTA1 (Iabc = 1 - RV_COLOR) ──┐
                                                  ├──► sum → NOISE_BUS
    tick_out_B ──► OTA2 (Iabc = RV_COLOR)       ──┘

  ============= LEVEL (NOISE knob) =============

  NOISE_BUS ──► RV_NOISE (100kΩ log) ──► to MIX (Block 13)

  Output level set by NOISE knob (separately from COLOR character).
```

**Components (v5 hybrid)**:
- **RV_NOISE**: Alpha RV09 9mm 100kΩ log, standard pot (no detent).
- **RV_COLOR (geiger)**: Alpha RV09 9mm 100kΩ lin, standard pot (no detent — full sweep).
- **OTA crossfader**: использует обе половины LM13700 (U6 spare OTA pair) с complementary Iabc currents.
- **D_NOISE BZX55C9V1**: zener (continuous hiss noise source).
- **ATtiny85-20PU**: LFSR + cluster pattern generator (continuous-time output).
- **U2C TL074**: noise amp ×100 для zener.
- **R_LPF, C_LPF**: smoothing для ATtiny PWM output.

**[REVISED v5 hybrid]**:
- Frontend mapped к mockup canon: 2 separate knobs.
- Internal architecture сохраняется: zener + LFSR shared infrastructure (Decision 08 находка).
- Crossfader instead of bipolar split: COLOR knob position линейно интерполирует между hiss и ticks.
- Center position (~50%) = равный mix двух текстур (для "radioactive ambient" character).

**Why crossfader (а не bipolar)**:
- Совместимо с mockup layout: 2 знака как в исходном рисунке пользователя.
- Continuous transitions hiss → mix → ticks без discrete jump.
- NOISE knob управляет level независимо от character (COLOR).
- BOM: то же что Decision 08 (zener + ATtiny + OTA pair), просто фронтенд проще.

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

### Block 14. Solenoid Driver — Triple-function DAMP + TOLL + STALL **[REVISED v5 hybrid]**

> **v5 hybrid (Decision 09)**: один соленоид, три логических режима, все через **CV-only triggers** (не footswitches — те заняты mockup canon TAP/CRUSH/BYPASS/FREEZE).
>
> - **DAMP** = sustained pressure modulation (CV envelope-controlled, как в v2.1).
> - **TOLL** = short impulse pulse (5–10мс) для bell-strike пластины. Trigger через J_TOLL_TRIG gate (5V).
> - **STALL** = forced full-pressure hold. Trigger через J_STALL_CV (+5V sustained → solenoid stays fully engaged → decay stuck at minimum).
>
> All three пути OR-combined в gate Q5 MOSFET. Whichever signal highest wins.

```
  +12V (audio rail)
    │
    │    ┌────────────┐
    │    │  SOLENOID  │   Three CV inputs feed driver via OR-gate (diode-OR):
    │    │  5V push   │
    │    │  (cartridge)│   J_CV_DAMP (modulating CV, env-shaped) ──► R_DAM1 (47kΩ)
    │    └──────┬─────┘                                                  │
    │           │                                                       D_OR_A (1N4148)
    │      D_SOL (1N4001)                                                 │
    │     ──|◄── (flyback)   J_TOLL_TRIG (5V gate trigger) ──► U_555      │
    │           │                                                  │     │
    │      ┌────┴────┐       NE555 monostable: 5-10мс pulse        │     │
    └──────│ Drain   │       (R_555=47k, C_555=220n → ~11мс)        │     │
           │ Q5 2N7000│                                              ▼     │
      Gate◄│         │◄──────── R_GATE (10kΩ) ── OR-node ◄──── D_OR_B ────┘
           │ Source  │                              ▲              (1N4148)
           └────┬────┘                              │
               GND                       J_STALL_CV (+5V sustained) ──► D_OR_C
                                                                          (1N4148)

  Three paths combined через diode-OR:
  - DAMP path: R_DAM1/R_DAM3 (47k/100k divider) → D_OR_A → OR-node.
  - TOLL path: J_TOLL_TRIG (5V) → 555 monostable → 10мс pulse → D_OR_B → OR-node.
  - STALL path: J_STALL_CV (+5V) → D_OR_C → OR-node (direct).

  R_DAM3 (100kΩ pulldown) holds OR-node low когда нет CV signals.
  R_GATE (10kΩ gate-stop) защищает Q5.

  ============= Operation modes =============

  DAMP mode (sustained envelope):
    J_CV_DAMP receives envelope CV → solenoid pressure modulated continuously.
    Use case: CV envelope from external sequencer / LFO → tail rhythmically pumped.

  TOLL mode (impulse strike):
    J_TOLL_TRIG receives gate → 555 fires 10мс pulse → solenoid strikes plate.
    Use case: trigger from sequencer rhythm → bell-tone strikes плоскости.

  STALL mode (forced full hold):
    J_STALL_CV sustained high (+5V) → solenoid full pressure → reverb tail dies hard.
    Use case: hold STALL CV high during chorus break → suddenly mute reverb tail.

  Combined behaviour:
  - TOLL + DAMP: strike layered поверх env modulation.
  - STALL + TOLL: STALL holds solenoid → TOLL impulse masked (already pressed).
                  Можно использовать как expressive "almost-but-not-quite-stuck" mode
                  если STALL CV не полностью на +5V.
  - DAMP + STALL: STALL overrides DAMP (always stronger pressure).
```

**Components (v5 hybrid)**:
- **U_TOLL_555**: NE555 monostable timer для 5–10мс pulse generation на J_TOLL_TRIG.
- **R_555**: 47kΩ + **C_555**: 220nF → pulse width = 1.1 × RC = ~11ms.
- **D_OR_A, D_OR_B, D_OR_C**: 3× 1N4148 diodes для diode-OR (трёхвходовой) combining DAMP / TOLL / STALL paths.
- **R_GATE**: 10kΩ gate-stop на Q5 (защита от ringing).

**[REVISED v5 hybrid]**:
- DAMP path сохраняется из v4 (R_DAM1 47kΩ + R_DAM3 100kΩ pulldown).
- TOLL path: J_TOLL_TRIG jack + 555 monostable → diode-OR в общий gate node. **CV-only**, не footswitch.
- **NEW**: STALL path — J_STALL_CV jack → direct diode-OR. CV high (+5V) → forced solenoid hold.
- Diode-OR (3× 1N4148) выполняет логическое "highest wins" между всеми тремя путями.
- Footswitches **не trigger TOLL/STALL** — это modular advanced features через CV territory.

**Why CV-only TOLL/STALL**:
- Footswitches заняты mockup canon: TAP / GATE-CRUSH / BYPASS / FREEZE.
- TOLL/STALL — modular-style advanced gestures.
- Pedalboard users access через expression-jack CV adapter или modular sequencer.
- Sustains "комбайн комбайн" UX clarity: для pedal player — standard 4 stomps, для modular — bonus expressive features.

#### Thermal budget — Q5 MOSFET + solenoid coil

**Solenoid baseline (cartridge-side push-type 5V/300mA нo-mock)**:

| Parameter | Value | Source |
|-----------|-------|--------|
| Rated voltage | 5V DC | Adafruit 412 / Sparkfun ROB-11015 class |
| Coil resistance (R_coil) | ~17 Ω | Measured / spec |
| Pull current (cold) | 290 mA @ 5V | I = V/R |
| Pull current (hot, +30°C ΔT) | 250 mA | R rises ~12%/30°C для медной обмотки |
| Pull force | ~150 g·f @ 5mm stroke | Datasheet |
| Coil thermal mass | ~2 g copper + bobbin | Estimated |
| Coil θ_JA | ~150 °C/W (free air, small bobbin) | Empirical |
| Max coil temp | 80 °C (insulation Class B) | Wire enamel limit |

**Per-mode duty cycle и power dissipation**:

| Mode | Drive voltage on coil | I (cold) | P_coil (steady) | Duty cycle | P_avg | Thermal rise (steady-state) |
|------|----------------------|----------|-----------------|------------|-------|-------------------------------|
| **DAMP** (CV-modulated, music tempo) | ~3V avg (envelope shape) | 175 mA | 0.53 W | 30–50% | 0.16–0.26 W | +24–39 °C ΔT |
| **TOLL** (10ms pulse) | 5V peak | 290 mA | 1.45 W peak | 10ms / 200ms = 5% | 0.073 W | +11 °C ΔT |
| **STALL** (forced hold) | 5V continuous | 290 mA | 1.45 W | 100% | 1.45 W | **+217 °C ΔT (FAULT)** |
| DAMP + STALL combined | 5V (STALL wins) | 290 mA | 1.45 W | 100% | 1.45 W | **+217 °C ΔT (FAULT)** |

**Critical finding — STALL mode is thermally unsafe для sustained operation**:

- Continuous 5V applied → 1.45W dissipated в coil → ΔT(steady) ≈ 1.45 × 150 = 217 °C.
- Ambient 25 °C → coil temp 242 °C → **insulation melts, smoke, solenoid burns out** в ~30 секунд.
- **Datasheet ON-duty rating** для этого class solenoid: **25% max @ 5V**, OR continuous @ ~2.5V (lower force).
- STALL mode cannot run continuously без protection.

**Mitigation (mandatory, добавить в v5.1 schematic)**:

1. **PWM dimming для STALL mode** — после initial 50ms "pull-in" pulse @ 100% duty, drop к **40% duty cycle** для "hold". Hold force достаточен (~100 g·f), power drops к **0.58W → ΔT +87 °C** (safe).
   - Implementation: ATtiny85 detects STALL CV high → generates PWM на secondary gate path → ORed после diode network.
   - Or: simpler RC slow-charge на gate node → MOSFET self-throttles после ~50ms.
2. **Thermal sense** (optional, premium SKU): 10kΩ NTC thermistor glued к solenoid bobbin → ADC monitored by ATtiny85 → если T > 70°C, force STALL=OFF независимо от CV input.
3. **User documentation**: STALL specified как **"momentary hold, max 5 seconds continuous"**. Beyond that — hardware throttle kicks in.

**Q5 MOSFET (2N7000) thermal budget**:

| Parameter | Value | Source |
|-----------|-------|--------|
| V_DS @ I=290mA, V_GS=5V | ~0.6V (on-resistance R_DS_on ~2Ω × 290mA) | Datasheet |
| P_Q5 (worst case STALL) | 0.6 × 0.29 = **0.17 W** | I × V_DS_on |
| θ_JA (TO-92, free air) | 200 °C/W | Datasheet |
| ΔT(Q5 steady STALL) | 0.17 × 200 = **+34 °C** | OK, well within 150°C T_J max |
| Peak transient (TOLL, 10ms) | 0.17 W × 5% = **0.008 W avg** | Negligible |

**Q5 is comfortable** даже без heatsink при continuous STALL (если coil выдержит — что она не выдержит без PWM throttle).

**Flyback diode (D_SOL = 1N4001)**:
- При gate-off, coil L ≈ 30mH stores energy E = ½LI² = ½ × 30e-3 × 0.29² = 1.26 mJ.
- 1N4001 dissipates this в ~5ms через V_F × I = 1V × 290mA = 290mW peak, 5ms = 1.45mJ total — matches.
- 1N4001 rated 1A continuous, 30A peak — 290mA pulse через 5ms комфортно.

**PCB thermal layout requirements**:
- Q5 placed в Zone 8 (digital/solenoid corner) подальше от audio Zone 4 (piezo preamp).
- Coil cable (JST 2.0mm pitch shielded twisted pair) — **shielded**, не parallel к piezo input cable.
- Star-ground для solenoid loop отдельно от audio ground (см. PCB Zone 8 правила).

**Updated Block 14 BOM (thermal mitigation)**:

| Item | Δ from baseline | Cost |
|------|-----------------|------|
| **PWM gate path** (ATtiny85 firmware + 1× extra 1N4148 diode in OR network) | New OR input | $0.01 (diode) |
| **NTC 10kΩ thermistor** (premium SKU only) | Optional | $0.50 |
| **Heatsink на Q5** (paranoid, не нужен по расчёту) | Optional | $0.30 |
| **User-facing warning** в SPEC.md: "STALL = momentary, max 5s" | Documentation | — |

**Recommendation**:
- **Phase 1 ship**: PWM throttle для STALL в ATtiny85 firmware. Mandatory. Adds 1 diode (~$0.01) + ~50 bytes firmware.
- **Phase 2 premium**: Add NTC thermistor + ADC monitoring для belt-and-suspenders safety. +$0.50.

#### Verification (thermal)

- [ ] Bench: STALL CV high для 60 секунд → measure solenoid temp via IR thermometer. **Must stay <70°C**.
- [ ] Если firmware PWM throttle работает → coil temp plateaus <60 °C @ 25 °C ambient.
- [ ] Q5 heatsink IR temp <40 °C ambient + 34 °C rise = <74 °C под STALL — OK без heatsink.
- [ ] User documentation в SPEC explicitly states STALL behavior + max duration.

### Block 15. Reserved (was Geiger Pattern, теперь часть Block 12)

> Geiger pattern generator (ATtiny85 LFSR) **полностью описан в Block 12** как часть NOISE+COLOR(geiger) crossfader implementation. Slot 15 зарезервирован для будущих расширений (например, Phase 2 v3 PCB add-ons).

### Block 16. Phaser — 4-stage OTA all-pass (detailed schematic) **[REVISED v5 hybrid]**

> **v5 hybrid (Decision 09)**: phaser **always-on named effect** (mockup canon), не optional layer. Bypass через master BYPASS footswitch. Shape Form slider — separate 1P5T select для LFO waveform (5 позиций вместо прежних 4).

Classic 4-stage OTA-based all-pass phaser, **post-pickup, pre-VCA**. Adds swirling motion к reverb tail. Использует второй LM13700 (U6) для OTA cells.

#### Signal flow

```
   From Block 9 de-emphasis → Block 10 tone filter → Phaser input bus
                                                              │
                                                              ▼
   ┌─ All-pass cell 1 ─► All-pass cell 2 ─► All-pass cell 3 ─► All-pass cell 4 ─┐
   │   (LM13700 U6      (LM13700 U6        (LM13700 U6        (LM13700 U6      │
   │    OTA1 + cap)      OTA1 + cap)        OTA2 + cap)        OTA2 + cap)     │
   │   tuned ~200Hz     tuned ~600Hz        tuned ~1.5kHz      tuned ~4kHz     │
   │                                                                            │
   │  All four cells receive same Iabc modulation от LFO → synchronized sweep │
   │                                                                            │
   └─────────────────────────► dry pickup signal                                │
                                       │                                        │
                                       ▼                                        │
                                Sум amp (TL074 U_PHSUM half)                   │
                                       │                                        │
                                       ▲                                        │
                                       │     RV_PHASE/FLUTTER (100k log) ──────┘
                                       │     внутренний feedback amount
                                       │     (peak depth / resonance)
                                       ▼
                                  Phaser output → Block 11 LED clipper → Block 13 VCA
```

**Note about 4 stages spread**: 4 cells deliberately tuned к different center frequencies (200Hz / 600Hz / 1.5kHz / 4kHz) для spread sweep across spectrum. Каждый OTA half работает на своём cap value (см. ниже). Это уходит от "classic Phase 90" уравнивающего all cells — даёт более диффузный, less metallic sweep.

#### All-pass cell topology (single cell)

```
                        R1 (47k feedback resistor)
                        ┌────┤├────┐
                        │          │
  Input ──► R_in (47k) ─┼──► (-)   │
                        │          │ LM13700 OTA section
                        │     OUT ─┴──► к next cell или sum amp
                        │          │
                        │     (+) ◄── tied to R_BIAS bias network
                        ▼          │
                     C_APn (per cell)
                        │          │
                       GND      I_abc ◄── from LFO modulation current
                                modulation current sets effective gm
                                → controls all-pass corner frequency

  Cell transfer function: H(s) = (R*gm - sR*gm*C) / (R*gm + sR*gm*C)
                                = (1 - sτ) / (1 + sτ)
                                where τ = 1 / (gm * Iabc-derived value)
```

#### Per-cell tuning

**4 cells spread across spectrum** для diffuse sweep:

| Cell | Center freq (mid Iabc) | C_AP value | R_in / R1 | OTA |
|------|------------------------|-----------|-----------|-----|
| 1 | 200 Hz | C_AP1 = **47 nF** | R_in1 = 47k / R1 = 47k | LM13700 U6 OTA1 |
| 2 | 600 Hz | C_AP2 = **15 nF** | R_in2 = 47k / R2 = 47k | LM13700 U6 OTA1 (shared via mux?) |
| 3 | 1.5 kHz | C_AP3 = **6.8 nF** | R_in3 = 47k / R3 = 47k | LM13700 U6 OTA2 |
| 4 | 4 kHz | C_AP4 = **2.2 nF** | R_in4 = 47k / R4 = 47k | LM13700 U6 OTA2 |

> **Issue**: 4 cells требуют 4 OTAs, но LM13700 содержит **только 2 OTAs**. **Решение**: cell 1+2 share U6 OTA1 (different cap settings via Pole — нет, OTA это не switching cell), или **добавить U7 = второй LM13700**.

**Recommend**: добавить **U7 LM13700** в BOM specifically для phaser. 4 cells × dedicated OTA = clean design, no shared resources, predictable behaviour. BOM impact: +$2 для одного LM13700.

Обновлённая cell distribution:
- Cells 1+2: **U7** LM13700 (new для phaser)
- Cells 3+4: **U6** LM13700 (existing, was VCA + noise crossfader)
  - U6 OTA1 = noise crossfader (Block 12).
  - U6 OTA2 = unused в v4. Reused here для phaser cells 3+4.

#### Iabc modulation network

```
   LFO output (от Shape Form selector, see below)
        │
        ▼
   RV_DEPTH (100kΩ lin) — modulation depth attenuverter
        │
        ▼
   R_DEPTH_BUF (10kΩ) → TL074 buffer (U_DEPTH half)
        │
        ▼
   Common bus to all 4 OTA Iabc pins (pins 1 + 16 на каждом LM13700):
        ├──► U7 pin 1 (OTA1 Iabc) — cell 1
        ├──► U7 pin 16 (OTA2 Iabc) — cell 2
        ├──► U6 pin 1 (OTA1 Iabc) — cell 3 — но это уже crossfader path!
        └──► U6 pin 16 (OTA2 Iabc) — cell 4
```

**Conflict**: U6 OTA1 уже используется для noise crossfader VCA в Block 12 — нельзя его modulate phaser'ом одновременно. **Решение**: **полностью dedicated U7 для cells 1+2, добавить U7' (или U8) LM13700 для cells 3+4**. Или **уменьшить phaser до 2 stages** (cells 1+2) с tradeoff в depth.

**Final decision (v5 hybrid)**: 
- **Standard SKU**: **2-stage phaser** (cells tuned 400Hz + 1.5kHz), uses U7 (new LM13700). Sufficient sweep для most use cases.
- **Premium SKU**: **4-stage phaser** (full spread), uses U7 + U8 (two new LM13700s). +$2 BOM.

Это снижает phaser complexity для budget tier, premium tier gets full classic 4-stage Phase 90-class character.

#### LFO core + Shape Form routing

```
   LFO core: TL074 (U_LFO) integrator-comparator triangle generator
   ────────────────────────────────────────────────────────────
   
   R_TIM (RV_SPEED 1MΩ log) → C_LFO (1µF film) → triangle wave amplitude ±5V
                                                              │
                                                              ▼
        Shape Form 1P5T slider routes triangle к один of 5 processing paths:
        
   Path 1 (TRIANGLE direct): output ─► LFO_OUT
   
   Path 2 (SINE): triangle → 2-stage RC integrator (low-pass with high Q
                  → approximates sine) → LFO_OUT
   
   Path 3 (RANDOM S&H): triangle clock → 4066 sample-hold с noise (Block 12
                        zener D_NOISE feeds S&H input) → LFO_OUT
   
   Path 4 (VINYL-SKIP): triangle → comparator с random threshold (от noise
                        источника) → short-pulse one-shot (NE555 #2) → 
                        random skip jumps → LFO_OUT
   
   Path 5 (STEP): TAP gate (от TAP footswitch) → counter (74HC161) → 
                  R-2R ladder DAC → quantized step values → LFO_OUT
```

> **Shape Form slider** = SP5T (single pole 5-throw) — это **simpler чем 4P5T для Color preset**. Просто routes one of 5 LFO output streams к common bus. Alpha SL-1P5T slider или toggle rotary switch. **$3.00** (cheaper than 4P5T).

#### TAP-tempo input

J_TAP (from TAP footswitch на pedal, или J_CLK CV jack):
- Gate trigger (+5V edge) → resets LFO phase to start of cycle.
- Если TAP pressed дважды в течение 5 секунд → captures interval → sets RV_SPEED via voltage feedback к LFO timing network.
- Implementation: ATtiny85 measures interval, выдаёт PWM → LPF → analog voltage → adds к RV_SPEED voltage divider.

#### BOM (Block 16)

| Ref | Part | Qty | Unit $ | Total |
|-----|------|-----|--------|-------|
| U7 (mandatory) | LM13700N (phaser cells 1+2 OTAs) | 1 | $2.00 | $2.00 |
| **U8 (premium SKU only)** | LM13700N (phaser cells 3+4) | 0–1 | $2.00 | $0–2.00 |
| U_LFO | TL074CN (LFO triangle generator + sine shaper, shares U2 spare halves) | 0 | — | — (shared) |
| U_DEPTH | TL074 buffer (shares U2 spare halves) | 0 | — | — (shared) |
| U_SH | CD4066BE (sample-hold cell) | 0 | — | — (shared с Block 18 Gate cell) |
| U_VINYL_555 | NE555 (vinyl-skip one-shot) | 1 | $0.25 | $0.25 |
| U_TAP_CNT | 74HC161 (TAP step counter for Path 5) | 1 | $0.30 | $0.30 |
| C_AP1 | 47 nF film | 1 | $0.08 | $0.08 |
| C_AP2 | 15 nF film | 1 | $0.06 | $0.06 |
| C_AP3 (premium) | 6.8 nF C0G | 0–1 | $0.05 | $0–0.05 |
| C_AP4 (premium) | 2.2 nF C0G | 0–1 | $0.04 | $0–0.04 |
| R_in/R1 (per cell) | 47kΩ ×4 (or ×8 для 4-stage) | 4–8 | $0.01 | $0.04–0.08 |
| C_LFO | 1 µF film (LFO timing) | 1 | $0.15 | $0.15 |
| C_SINE | 100 nF film ×2 (sine shaper) | 2 | $0.05 | $0.10 |
| RV_PHASE | Alpha 9mm pot 100kΩ log | 1 | $1.20 | $1.20 |
| RV_DEPTH | Alpha 9mm pot 100kΩ lin | 1 | $1.20 | $1.20 |
| RV_SPEED | Alpha 9mm pot 1MΩ log | 1 | $1.20 | $1.20 |
| SW_SHAPE | Alpha SL-1P5T slider (Shape Form) | 1 | $3.00 | $3.00 |
| Step DAC (R-2R ladder) | 8 resistors precision | 8 | $0.05 | $0.40 |
| Misc (additional R, sat diodes feedback) | — | — | — | $0.40 |
| **Block 16 total (budget 2-stage)** | | | | **$8.93** |
| **Block 16 total (premium 4-stage)** | | | | **$11.02** |

#### Verification

- **Sweep test**: input 1 kHz sine, SPEED slow (0.2 Hz), DEPTH full, PHASE 50% — output должна показывать обвалы spectrum 200Hz–4kHz range, full sweep cycle ~5 seconds.
- **Feedback peak**: PHASE knob до 90% → distinct resonant peak в audio output на center frequency. Maximum 95% — controlled self-oscillation possible.
- **Shape Form switching**: переключение между 5 позициями slider должно быть click-free (signal continuous). RC smoothing на switch output cap may be needed.
- **TAP sync**: tap two presses в 0.5 sec interval → LFO period = 0.5 sec exactly. Tap drift accuracy ±5%.

#### Why always-on (not optional)

- Phaser — **signature character** "холодной ночи" combine.
- В mockup есть 3 dedicated knobs + Shape Form slider — это occupies physical real estate. Bypass через master BYPASS footswitch достаточно — отдельный PHASER ON/OFF toggle избыточен.
- Always-on simplifies wiring (no toggle relay), saves $1 BOM, cleaner UX.

### Block 17. Removed in v4 (was Vinyl FX BBD)

> **v4 consolidation (Decision 08)**: BBD vinyl wow/flutter блок **удалён из Last Night**. Vinyl/tape decay character принадлежит delay-секции — мигрирует в **Last Day** как "OLD VINYL" feature (PT2399 lo-fi alternative в parallel с oil-can magnetic tract). См. Decision 06 + Decision 08.
>
> Если pitch-warp эффект всё-таки нужен в Last Night — реализуется через **phaser feedback** (block 16) на extreme settings, или **PULSE/FOG damper modulation** (block 21+, Phase 2 v3 PCB).

### Block 18. Gate / Crush — Destruction footswitch (detailed schematic) **[RESTORED v5 hybrid]**

> **v5 hybrid (Decision 09)**: восстановлен из v3.0 prototype. Mockup canon включает GATE-CRUSH footswitch как named destruction effect. Не конфликтует с solenoid double-function (Block 14 TOLL/STALL — CV-only, complementary).

GATE-CRUSH latching footswitch активирует **two-stage destruction chain** на выходе mixer'а (Block 13). Stage 1 — noise gate с hard threshold (cuts low-amplitude tail). Stage 2 — bitcrush sample-hold (downsamples + quantizes). Footswitch toggle bypasses обе ступени параллельно через 4066 cells.

#### Signal flow

```
   From Block 13 Mix output (post-stereo sum, pre-output buffer)
                      │
                      ▼
   ┌─────────── BYPASS multiplexer (CD4066 S1/S2) ───────────┐
   │                                                          │
   ▼                                                          ▼
  Dry path                                              Destruction path
   │                                                          │
   │                  ┌─── Stage 1: Gate ───┐                │
   │                  ▼                      │                │
   │           R_GIN (47k) ──► U_COMP A (LM393)               │
   │                  │              │                        │
   │                  ▼              │ → comparator output    │
   │           R_GREF (10k)     to gate switch (CD4066 S3)    │
   │           reference от RV_GTH (50k trim) → +Vth          │
   │                  │              │                        │
   │                  │              ▼                        │
   │                  │      CD4066 S3 (gate VCA)             │
   │                  │      Audio in ──► Audio out           │
   │                  │      Control: comparator output       │
   │                  │      (HIGH = pass, LOW = cut)         │
   │                  │              │                        │
   │                  │              ▼                        │
   │                  │      Hysteresis: R_HYS (1M) feedback  │
   │                  │      от comparator output на (+) in   │
   │                  │      → Schmitt trigger behaviour      │
   │                  │              │                        │
   │                  └──────────────┤                        │
   │                                 ▼                        │
   │                  ┌─── Stage 2: Crush ──┐                │
   │                  ▼                      │                │
   │              R_CIN (10k) ──► U_SH LF398N (S&H)           │
   │                  │              │                        │
   │                  │     C_HOLD (1nF NP0) на pin 6         │
   │                  │              │                        │
   │                  │              ▼                        │
   │                  │      Sample clock pin 8               │
   │                  │      ◄── от ATtiny85 PWM (8kHz–62kHz) │
   │                  │              │                        │
   │                  │              ▼                        │
   │                  │      LF398 output ──► R_R2R network   │
   │                  │              │                        │
   │                  │              ▼                        │
   │                  │      4-bit R-2R divider               │
   │                  │      (R_R0 10k / R_R1 20k / R_R2 10k  │
   │                  │       / R_R3 20k stuck-at-0 LSB)      │
   │                  │              │                        │
   │                  │              ▼                        │
   │                  │      Quantized output                 │
   │                  │              │                        │
   │                  └──────────────┘                        │
   │                                 │                        │
   ▼                                 ▼                        │
   └────────── BYPASS multiplexer (S2 selects dry или wet) ──┘
                                     │
                                     ▼
                  Output buffer (U_OUTBUF — TL072 half)
                                     │
                                     ▼
                              Output jack
```

#### Gate cell (Stage 1) topology

```
  Audio in ──► R_GIN (47k) ──┬──► (+) U_COMP A (LM393)
                              │
                              │             (−) ◄── RV_GTH wiper (50k trim,
                              │                     panel-internal)
                              │                     R_GREF (10k) ──► +5V ref
                              │                     R_GRGND (10k) ──► GND
                              │                     Threshold range: 0–2.5V
                              │
                              │     U_COMP A output (open-collector)
                              │             │
                              │     R_PULL (10k pullup to +5V)
                              │             │
                              │             ▼
                              │     CD4066BE pin 13 (S3 control)
                              │     S3: pin 1 ──► pin 2
                              │
                              ▼
              Audio in (same node) ──► CD4066 pin 1
                                            │
                                            ▼
                                       CD4066 pin 2 ──► Stage 2 input
                                       (when control HIGH = pass)
                                       (when control LOW = audio cut to GND
                                        via residual on-resistance ~80Ω)

  Hysteresis: R_HYS (1MΩ) от U_COMP A output к (+) input
  → adds ~50mV hysteresis above threshold → no chatter
```

**Threshold behaviour**:
- RV_GTH set по умолчанию ~−42 dBV (≈8mVrms на audio bus) — cuts только noise floor.
- Pre-amp gain через Blocks 7→9 normalizes signal levels к ~0 dBV peak.
- При peak −18 dBV (≈125mVrms), comparator HIGH → audio passes.
- Между notes / fade tail: amplitude < threshold → comparator LOW → audio cut.
- Effect: **abrupt tail cut**, mockup canon "GATE chops the reverb tail to silence between hits".

**Why LM393 (not TL072 comparator)**:
- LM393 — true comparator с open-collector output, single +5V supply OK.
- Output rail-to-rail GND/+5V, drives 4066 control pin без level translation.
- Propagation delay 1.3µs — fast enough для audio gating (no zipper noise).
- BOM: $0.30.

#### Crush cell (Stage 2) topology

```
  Gated audio ──► R_CIN (10k) ──► LF398N pin 3 (analog in)
                                       │
                                       │  C_HOLD 1nF NP0 на pin 6 (hold cap)
                                       │
                                       │  pin 8 LOGIC (sample command)
                                       │     │
                                       │     ◄── ATtiny85 OC1A PWM output
                                       │         (square wave, var. freq)
                                       │
                                       ▼
                            LF398N pin 5 (analog out)
                                       │
                                       ▼
                            R-2R ladder для bit reduction:
                                       │
                            ┌──────────┼──────────┐
                            │          │          │
                          R_R0 10k  R_R1 20k   R_R2 10k
                            │          │          │
                            ▼          ▼          ▼
                          (output)    │          │
                                      │          ▼
                                      │      Audio out node
                                      │          │
                                      ▼          │
                                  R_R3 20k       │
                                      │          │
                                      ▼          │
                                     GND ◄── "stuck-at-0 LSB"
                                  (Forces LSB to 0 → 1-bit quantization
                                   loss → audible bitcrush artefact)
```

**Sample rate control (ATtiny85 PWM)**:
- ATtiny85 Timer1 PWM output (pin 6, OC1A) generates square wave.
- ATtiny shared с Block 12 LFSR (Geiger pattern) и Block 16 TAP-tempo divider.
- Firmware allocation:
  - Timer0: LFSR clock (4MHz internal / 256 → 15.6kHz)
  - Timer1: Crush sample clock (variable, set via internal trimmer RV_CRUSH 100k → ADC1)
- **Sample rate range**: 8kHz (deep crush, Nyquist = 4kHz, audio severely aliased) → 62kHz (mild, transparent).
- **Default**: 16kHz → telephone-like quality.

**Bit reduction (R-2R stuck-at-0)**:
- LF398 output is **already** 1-sample-per-clock quantized (sample-and-hold step). Aliasing handled.
- R-2R network is **not** acting as DAC here — it's a passive resistive divider that loses the LSB by tying lowest weighted resistor (R_R3) to GND.
- Effective bit depth reduction: ~2 bits lost (input 16-bit equivalent → 14-bit), audible as soft quantization noise floor + warble.
- Mild but distinctive bitcrush character — лучше **классический LSB truncation** не emulating, без MCU ADC/DAC roundtrip.

**Why LF398 (not 4066 sample-hold)**:
- LF398 has **dedicated 0.5µs acquisition time**, JFET-input hold amplifier (10pA leakage).
- C_HOLD 1nF holds value для 1 sample period (62µs @ 16kHz) с <0.5% droop.
- 4066 как sample-hold gives ~10x leakage → audible 60Hz hum modulation.
- BOM: $1.20 — оправдано для clean sample step.

#### Bypass multiplexer

```
  Footswitch (3PDT latching): 3 sections
   Section A: GND ↔ +5V LED control (LED on when active)
   Section B: CD4066BE control pin 5 (S1: dry path) — HIGH when bypass
   Section C: CD4066BE control pin 6 (S2: wet path) — HIGH when active
   
   Latching mechanism:
   - SW unpressed: LED off, S1 closed (dry pass-through), S2 open (destruction muted)
   - SW pressed: LED on, S1 open, S2 closed (destruction active)
   
   No clicks/pops: 4066 switches both паths at одинаковое время (<300ns delay),
   imperceptible. Tail-fade artifact protected by series 10µF C_OUT cap on output
   buffer (HPF at <1Hz, slow DC step rejection).
```

**Why CD4066 (not relay)**:
- CD4066BE quad analog switch: 80Ω on-resistance, <300ns switch time, $0.40.
- Two switches needed (dry + wet path) — uses 2 of 4 elements.
- Remaining 2 switches: S3 (gate VCA) + spare для future expansion.
- Relay would add $5+ cost и electromechanical click.

#### ATtiny85 firmware allocation (shared chip с Block 12 + Block 16)

| Timer / pin | Function | Block |
|-------------|----------|-------|
| Timer0 / pin 5 OC0A | LFSR Geiger clock | 12 |
| Timer1 / pin 6 OC1A | Crush sample PWM | 18 |
| ADC1 / pin 7 | RV_CRUSH (sample rate set) | 18 |
| ADC2 / pin 3 | TAP-tempo input (Schmitt) | 16 |
| ADC3 / pin 2 | RV_GEIGER (LFSR rate) | 12 |
| pin 1 (RESET) | Reserved | — |

**Firmware size**: ~512 bytes (ATtiny85 has 8KB flash, ample headroom).

#### Components per stage

**Gate cell**:
| Ref | Value | Part | Cost |
|-----|-------|------|------|
| U_COMP | dual comparator | **LM393N** DIP-8 | $0.30 |
| U_GATE A | quad analog switch | **CD4066BE** DIP-14 (shared с bypass mux) | $0.40 |
| R_GIN | 47kΩ 1% MF | YAGEO MFR-25 | $0.05 |
| R_GREF / R_GRGND | 10kΩ 1% MF | YAGEO MFR-25 (×2) | $0.10 |
| R_HYS | 1MΩ 1% MF | YAGEO MFR-25 | $0.05 |
| R_PULL | 10kΩ 1% MF | YAGEO MFR-25 | $0.05 |
| RV_GTH | 50kΩ trim, multi-turn | Bourns 3296W | $0.80 |

**Crush cell**:
| Ref | Value | Part | Cost |
|-----|-------|------|------|
| U_SH | sample-and-hold | **LF398N** DIP-8 | $1.20 |
| R_CIN | 10kΩ 1% MF | YAGEO MFR-25 | $0.05 |
| C_HOLD | 1nF NP0 | KEMET C0G | $0.20 |
| R_R0 / R_R2 | 10kΩ 0.1% MF | Vishay MRS25 (matched pair) | $0.40 |
| R_R1 / R_R3 | 20kΩ 0.1% MF | Vishay MRS25 (matched pair) | $0.40 |
| RV_CRUSH | 100kΩ trim | Bourns 3296W | $0.80 |

**Bypass mux + footswitch**:
| Ref | Value | Part | Cost |
|-----|-------|------|------|
| U_GATE B/C | quad analog switch | **(shared CD4066BE)** | — |
| SW_DEST | 3PDT latching footswitch | DPDT латчинг + SPDT LED section | $3.00 |
| LED_DEST | 3mm red | Kingbright L-7104ID | $0.10 |
| R_LED | 1kΩ | YAGEO MFR-25 | $0.05 |

**ATtiny85 shared** — chip уже включён в Block 12 BOM, дополнительно за Block 18 не считается.

#### BOM (Block 18, новые компоненты)

| Item | Cost |
|------|------|
| LM393N | $0.30 |
| CD4066BE | $0.40 |
| LF398N | $1.20 |
| Resistors (8 шт включая R-2R precision) | $1.10 |
| C_HOLD 1nF NP0 | $0.20 |
| Trimmers (2 шт Bourns 3296W) | $1.60 |
| 3PDT latching footswitch | $3.00 |
| LED + R_LED | $0.15 |
| **Total** | **$7.95** |

**Cost vs character**: $7.95 для **two named destruction footswitches' worth of FX** (GATE + CRUSH), versus aftermarket pedal alternative ($150+ для standalone bitcrusher + $80+ для noise gate). Mockup canon preserved at <0.6% of unit BOM.

#### Verification

- [ ] Gate threshold: set RV_GTH к ~50% rotation, проверить cut-off на signals <−40 dBV.
- [ ] Hysteresis: confirm no chatter на signals close to threshold (audible test).
- [ ] Crush sample rate: scope LF398 pin 5, confirm visible quantization steps.
- [ ] R-2R matching: измерить R_R0/R_R1 pairs к ±0.1%, иначе LSB-stuck не консистентен.
- [ ] Bypass click: A/B test footswitch toggle на audio output (oscilloscope), <1mV step.
- [ ] LED brightness ~= Block 12 NOISE LED для visual consistency.

#### Why GATE-CRUSH сохраняется

- Mockup canon включает его как named footswitch effect.
- Generic "destruction" gesture с different character чем solenoid TOLL/STALL (которые physical bell/damp gestures).
- 4066 + LF398 + LM393 — proven components, $7.95 total.
- TOLL/STALL — bell + damper (mechanical reverb manipulation).
- GATE-CRUSH — gate + bitcrush (digital-style destruction effect).
- Complementary, not duplicative.

### Block 19. Isolated DC-DC (Pedal SKU only — NEW)

Pedal version converts 12V DC single-rail input в bipolar ±12V audio rails через **isolated DC-DC module**. Это modern complex-pedal стандарт (Strymon TimeLine $449, Eventide H9, Meris LVX, Chase Bliss CXM 1978 — все на 12V).

```
  12V DC jack (center-negative) ──► D_P1 (1N5817 reverse protection)
                                          │
                                          ▼
                                    +12V rail (для DC-DC + 5V LDO)
                                          │
                                  ┌───────┼──────────┐
                                  │       │          │
                                  ▼       ▼          ▼
                          TRACO TMR 3-1212WI       7805 LDO ──► +5V
                          (or Recom RKD-1212-D     (для ATtiny85,
                           для premium)             logic)
                                  │
                          ╔═══════ ISOLATION ═══════╗
                          ║                          ║
                          ▼                          ║
                  ┌───────┴───────┐                  ║
                  ▼               ▼                  ║
              +12V audio     -12V audio              ║
              (isolated      (isolated               ║
               от pedal-      от pedal-              ║
               board GND)     board GND)             ║
                  │               │                  ║
              C_B1, C_B3      C_B2, C_B4             ║
              (10µF + 47µF)   (10µF + 47µF)          ║
                  │               │                  ║
              [LC filter]     [LC filter]            ║
              10µH + 10µF     10µH + 10µF            ║
              (DC-DC switching ripple removal)        ║
                                                     ║
              ╚══════════════════════════════════════╝
```

**DC-DC selection (specified в BOM)**:

| Part | Output | Current | Cost | SKU tier |
|------|--------|---------|------|----------|
| **TRACO TMR 3-1212WI** | ±12V | 125mA | $13 | **Budget** SKU. Sufficient для steady state. |
| **Recom RKD-1212-D** | ±12V | 250mA | $22 | **Premium** SKU. Headroom для solenoid + FX peaks. Audio-rated noise specs. |

**Why isolated DC-DC** (не charge pump):
- **Higher current capability** (125–250mA vs ~50mA charge pump).
- **Identical headroom к Eurorack** version (±12V rails везде).
- **Ground loop break** — isolated barrier означает Last Night работает clean даже если запитан с других pedals на shared PSU.
- **Lower switching noise** (TRACO/Recom audio-grade specs).

**Why 12V DC pedal supply standard**:
- Modern complex pedals (Strymon, Eventide, Meris, Chase Bliss) **все на 12V**.
- Premium pedalboard PSUs все имеют 12V outputs (Voodoo Lab Pedal Power 4×4, Cioks DC7/DC10, Eventide PowerMax, Strymon Zuma).
- 9V supply **не подходит** для headroom этого класса pedals (включая Last Night).

**Power budget pedal (with TMR 3-1212WI)**:
- Audio analog (±12V via DC-DC): ~125mA на rail steady, peak 250mA.
- Digital +5V (для ATtiny85 + LEDs): ~50mA.
- Solenoid pulse: 300mA peak (от +12V rail, low-side switched, intermittent).
- LEDs + footswitch indicators: 30mA.
- **Total**: ~250mA steady, ~500mA peak (с solenoid).

**Required external supply**: **12V DC center-negative, 500mA min, regulated**. Cannot use 9V supplies. Recommended: dedicated 12V output на multi-pedal PSU.

**Compatible PSUs (verified examples)**:
- Voodoo Lab Pedal Power 4×4 (4× 12V outputs).
- Cioks DC7 / DC10 (configurable 12V).
- Eventide PowerMax (high current 12V).
- Strymon Zuma R300 (12V outputs).
- Truetone CS12 (12V).

### Block 20. COLOR Preset Slider — vertical 5-position (detailed schematic)

5-позиционный slider switch на левой стороне панели выбирает preset combination tone parameters. Hardware-only — никакого MCU. Slider физически переключает 4 параллельных сигнальных пути (EQ + saturation), используя SP5T switch (single-pole, 5-throw) ×4 ganged как "4PDT 5-position".

#### Topology

```
                              4-pole 5-throw rotary/slider switch
                              (Alpha SL-4P5T или эквивалент)
                                          
   Audio bus from Block 9 (de-emphasis output)
        │
        ├──────────────────────────────────────────────────────────────┐
        │                                                              │
        ▼                                                              │
   Pole 1 (LF shelf control resistor):                                 │
        ├─ Pos 1 (COLOR raw):  R_LF1 = ∞ (open)  → no LF mod          │
        ├─ Pos 2 (WARM):       R_LF2 = 10kΩ      → +6dB @ 150Hz       │
        ├─ Pos 3 (DARK):       R_LF3 = ∞ (open)  → flat               │
        ├─ Pos 4 (COLOR mid):  R_LF4 = 22kΩ      → +2dB @ 250Hz       │
        └─ Pos 5 (MIX):        R_LF5 = 6.8kΩ     → +8dB @ 120Hz       │
        ▼                                                              │
   To LF shelf network (uses U2A spare half + C_LF 100nF)             │
                                                                       │
   Pole 2 (HF shelf control resistor):                                 │
        ├─ Pos 1: R_HF1 = ∞      → flat                                │
        ├─ Pos 2: R_HF2 = 22kΩ   → -3dB @ 5kHz                        │
        ├─ Pos 3: R_HF3 = 8.2kΩ  → -8dB @ 3kHz                        │
        ├─ Pos 4: R_HF4 = 47kΩ   → -1dB @ 8kHz (subtle)               │
        └─ Pos 5: R_HF5 = 15kΩ   → -5dB @ 4kHz                        │
        ▼                                                              │
   To HF shelf network (uses U2B spare half + C_HF 1nF)               │
                                                                       │
   Pole 3 (saturation diode bias resistor):                            │
        ├─ Pos 1: R_SAT1 = ∞     → no saturation (clean)               │
        ├─ Pos 2: R_SAT2 = 4.7kΩ → soft saturation (1N4148 ×2 anti-||)│
        ├─ Pos 3: R_SAT3 = 1.5kΩ → heavy saturation                    │
        ├─ Pos 4: R_SAT4 = 10kΩ  → very subtle saturation              │
        └─ Pos 5: R_SAT5 = 2.2kΩ → medium-heavy saturation             │
        ▼                                                              │
   To saturation cell (1N4148 anti-parallel pair + bias network)      │
                                                                       │
   Pole 4 (mid feedback resonance peak):                               │
        ├─ Pos 1: R_FB1 = ∞      → no resonance                        │
        ├─ Pos 2: R_FB2 = ∞      → no resonance                        │
        ├─ Pos 3: R_FB3 = ∞      → no resonance                        │
        ├─ Pos 4: R_FB4 = 47kΩ   → +4dB Q-peak @ 1kHz (vintage mid)   │
        └─ Pos 5: R_FB5 = 33kΩ   → +6dB Q-peak @ 800Hz (warm mid)     │
        ▼                                                              │
   To mid resonance network (twin-T или state-variable BPF cell)      │
                                                                       │
        ▼  (combined output)
   Common bus → output to Block 13 (Mix)
```

#### Где Block 20 stoit в signal chain

После **Block 9 (de-emphasis)** и перед **Block 10 (tone filter LPF)**. Логика:
- **De-emphasis** уже скорректировал spectrum после physical material.
- **COLOR preset** добавляет character preset поверх raw cartridge tone.
- **Tone filter** (Block 10) — мaster brightness control (top of stack).

#### Per-position function (детально)

**Position 1 — COLOR (raw)**:
- Все 4 pole в "open" / "flat" положении.
- Bypass всей color-shaping секции.
- Сигнал проходит unchanged → cartridge character максимально чист.
- Use case: studio recording когда хочется только material color.

**Position 2 — WARM**:
- LF +6dB shelf @ 150Hz (R_LF2=10k + C_LF=100nF в feedback).
- HF -3dB shelf @ 5kHz (R_HF2=22k + C_HF=1nF).
- Soft saturation через 1N4148 pair с R_SAT2=4.7k bias.
- Tube-like character. Mid-focused, ламповый звук.

**Position 3 — DARK**:
- LF flat.
- HF -8dB shelf @ 3kHz (heavy treble cut).
- Heavy saturation R_SAT3=1.5k (более aggressive bias через diodes).
- Postapocalypse "мёртвая радиостанция" character — closed, мрачный.

**Position 4 — COLOR mid**:
- LF subtle +2dB @ 250Hz.
- HF subtle -1dB @ 8kHz (almost flat but slightly warm top).
- Very subtle saturation.
- **Mid resonance peak** +4dB Q @ 1kHz через twin-T или SVF cell.
- Vintage "coloured" character — mid-rich, slight bell-like.

**Position 5 — MIX**:
- LF +8dB @ 120Hz (heaviest bass boost).
- HF -5dB @ 4kHz (rolled-off top).
- Medium-heavy saturation.
- **Mid resonance peak** +6dB Q @ 800Hz (warm mid).
- "Everything on" — maximum coloured character. Phaser presets remain at user knob settings.

#### Components per bank

Поскольку 4 pole × 5 positions = 20 потенциальных резисторов, плюс 2 EQ caps + 2 saturation diodes + 1 resonance cell = **~25 компонентов**.

Bank | LF res | HF res | SAT bias | FB res
:----|:-----:|:-----:|:-------:|:-----:
1 (COLOR raw) | open | open | open | open
2 (WARM) | **10k** | **22k** | **4.7k** | open
3 (DARK) | open | **8.2k** | **1.5k** | open
4 (COLOR mid) | **22k** | **47k** | **10k** | **47k**
5 (MIX) | **6.8k** | **15k** | **2.2k** | **33k**

(Open positions = no resistor on that pole, циркуит inactive для данной позиции).

**Common components** (вне 4P5T switch):
- C_LF: 100nF film (LF shelf cap).
- C_HF: 1nF C0G ceramic (HF shelf cap).
- D_SAT_A, D_SAT_B: 2× 1N4148 anti-parallel (saturation pair).
- U_COLOR_OP: half of TL072 (или TL074 spare half) для shelf feedback amp.
- Resonance cell (Pole 4): twin-T network (3R + 3C) или state-variable BPF (2× OTA из spare LM13700 OTA halves).

#### BOM

| Ref | Part | Qty | Unit $ | Total |
|-----|------|-----|--------|-------|
| SW_COLOR | Alpha SL-4P5T (4-pole 5-throw vertical slider) | 1 | $5.00 | $5.00 |
| R_LF2..R_FB5 | Resistor banks (12 active resistors) | 12 | $0.01 | $0.12 |
| C_LF | 100nF film cap | 1 | $0.10 | $0.10 |
| C_HF | 1nF C0G ceramic | 1 | $0.05 | $0.05 |
| D_SAT_A, D_SAT_B | 1N4148 saturation pair | 2 | $0.01 | $0.02 |
| Twin-T network (Pole 4 resonance) | 3R + 3C | 6 | $0.02 | $0.12 |
| **Block 20 total** | | | | **$5.41** |

Резисторы: используются **существующие slot'ы U2 (TL074)** и **spare LM13700 OTA half** (Block 11 envelope follower OTA2 unused → reuse here для saturation buffer / resonance amp). Без необходимости новых ICs.

#### Verification

- **A/B switch test**: passing 1kHz sine через каждую позицию, измерить EQ response с audio analyzer. Должно match таблицу выше ±1dB.
- **THD test**: на DARK position при +6dBu input → THD должна быть 5–10% (heavy saturation). На MIX position → 3–5%. На COLOR raw → <0.5%.
- **Click-free switching**: переключение между позициями не должно давать audible pop. Если pop — добавить muting cap (10µF) на slider's common node.

#### Why slider, не rotary switch

- **Visual**: vertical slider визуально transparent — пользователь сразу видит current preset position по labeled markings.
- **Tactile**: slider thumb easy to slide one position за one finger movement.
- **Performance**: для live use slider faster чем rotary 5-pos switch (no need crутить through multiple positions).

---

## Phase 2 Cold Palette FX Layer — v3 PCB revision (blocks 21–25)

> Эти 5 блоков добавляются в v3 PCB revision как **upgrade kit** к Phase 1 ship. Pin-header экспансия PCB (10-pin) позволяет cold palette daughter-board подключаться без замены main board. Можно также включить в main board сразу — для full-feature SKU.

**Phase 2 IC allocation** (новые ICs только на daughter board):

| Ref | Part | Function |
|-----|------|----------|
| U9 | LM13700 | OTA1 = PULSE depth VCA, OTA2 = FOG random VCA |
| U10 | LM13700 | OTA1 = FROST VCF gm, OTA2 = CHILL expander VCA |
| U11 | TL074 | Quad op-amp: PULSE LFO core, FOG slew, CHILL env follower, HUM input buffer |
| U12 | TL072 | Dual op-amp: FROST SVF integrators, HUM Twin-T amplifier |
| U_CMOS | CD4066BE | (additional) FOG S&H switch + CHILL/FROST bypass mux |

**Phase 2 daughter board total IC cost**: 2× LM13700 ($4) + TL074 ($0.75) + TL072 ($0.50) + 4066 ($0.40) = **$5.65 active**.

### Block 21. PULSE — Slow LFO на damper-pressure (detailed schematic)

Slow periodic LFO (0.05–2 Гц) → модулирует damper-pressure → reverb tail "дышит" ритмично. Антипод HAZE в Last Day.

#### Signal flow

```
   ┌──────────── Triangle LFO core (TL074 U11 OTA-free design) ────────────┐
   │                                                                        │
   │   ┌──── Integrator ──── Comparator ──── Inverter ───┐                  │
   │   │     (U11 A)         (U11 B)        (U11 C)      │                  │
   │   │                                                  │                  │
   │   └────────── Feedback loop ──────────────────────►──┘                  │
   │                                                                        │
   │   Triangle out (±5V) ──► RV_PULSE_RATE 1MΩ log (sets integrator slope) │
   │                          + C_PULSE 1µF integrator cap                  │
   │                                                                        │
   │   Rate range: 0.05 Hz (CCW, max R) ... 2 Hz (CW, min R)                │
   │                                                                        │
   └────────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
                  RV_PULSE 100k lin (depth attenuverter, center-detent for bipolar)
                          │
                          ▼
                  R_PULSE_BUF 10k ──► U11 D (buffer)
                          │
                          ▼
                  ┌──── J_PULSE_CV (external modulation of rate) summed via R_PULSE_CV 100k
                  │
                  ▼
            U9 OTA1 (LM13700) — depth VCA
                          │
                          │ Iabc controlled by RV_PULSE depth knob
                          ▼
                  Modulated triangle ──► Sum bus → DAMP_CV (Block 14)
                          │
            Sync option: J_TAP_IN gate → resets LFO phase (via CD4066 reset to integrator GND)
```

#### Component values

| Ref | Value | Function |
|-----|-------|----------|
| RV_PULSE_RATE | 1MΩ log Alpha RV09 | Integrator slope (rate) |
| C_PULSE | 1µF film (WIMA MKS2) | Integrator cap (low leakage critical) |
| R_INT | 47kΩ 1% MF | Integrator input |
| R_COMP_THRESH | 100kΩ 1% MF (×2 divider) | ±5V Schmitt thresholds |
| R_FB | 220kΩ 1% MF | Comparator hysteresis |
| RV_PULSE | 100kΩ lin Alpha RV09 (center-detent) | Depth attenuverter |
| R_PULSE_BUF | 10kΩ 1% MF | Buffer input |
| R_PULSE_CV | 100kΩ 1% MF | CV input mix |
| R_IABC | 22kΩ 1% MF + 1k series | Depth → Iabc for U9 OTA1 |

**Frequency formula**: f_LFO = 1 / (4 × RV × C_PULSE). At RV=1MΩ, C=1µF → f = 0.25 Hz. At RV=100kΩ → f = 2.5 Hz. Knob log law gives near-musical taper.

**BOM (Block 21)**: 5 resistors ($0.25) + RV_PULSE_RATE ($1.50) + C_PULSE WIMA ($0.80) + RV_PULSE ($1.50) + 2× JST connectors to daughter board = **~$4.35** (excluding shared TL074 + LM13700 amortized in daughter board).

#### Verification (Block 21)

- [ ] Rate sweep 0.05–2 Hz measured via scope on integrator output.
- [ ] Triangle symmetry within 5% (asymmetry indicates comparator threshold mismatch).
- [ ] Depth knob CCW = no modulation reaches damper CV (verified via DC voltmeter on DAMP_CV bus).
- [ ] TAP sync: gate input → LFO phase resets within 1 ms.

---

### Block 22. FOG — Apperiodic damper drift (detailed schematic)

Aperiodic / random damper modulation для "туман над хвостом" character. Антипод MIRAGE в Last Day.

#### Signal flow

```
   D_NOISE (BZX55C9V1 zener, existing from Block 12)
        │
        │  AC-coupled noise → +9.1V bias hiss source
        ▼
   R_FOG_SRC 10k ──► CD4066 pin 1 (S1 input)
                          │
                          │  S1 control ◄── Slow RC oscillator gate (random S&H trigger)
                          ▼
                  CD4066 pin 2 (S1 output) ──► sampled value held
                          │
                          ▼
                  C_HOLD_FOG 100nF (hold cap)
                          │
                          ▼
                  R_SLEW 100kΩ + C_SLEW 4.7µF → slew limiter
                  Slew rate: τ = 100k × 4.7µF = 0.47s
                          │
                          ▼
                  U11 D buffer (TL074) ──► unity gain output
                          │
                          ▼
                  RV_FOG 100kΩ lin (depth knob)
                          │
                          ▼
                  J_FOG_CV summed via R_FOG_CV 100k
                          │
                          ▼
                  U9 OTA2 (LM13700) — VCA
                          │
                          ▼
                  Sum bus → DAMP_CV (parallel to PULSE)

   ┌──── Slow RC oscillator (TL072 spare half U12 A) ────┐
   │  R_OSC 470k + C_OSC 1µF → Schmitt oscillator       │
   │  Frequency: ~0.5 Hz (random tick rate)              │
   │  Output → CD4066 S1 control (sample command)        │
   └──────────────────────────────────────────────────────┘
```

#### Component values

| Ref | Value | Function |
|-----|-------|----------|
| R_FOG_SRC | 10kΩ 1% MF | Noise source isolation |
| C_HOLD_FOG | 100nF NP0 ceramic | S&H hold cap |
| R_SLEW | 100kΩ 1% MF | Slew time constant |
| C_SLEW | 4.7µF MKS2 film | Slew cap (low leakage) |
| R_OSC | 470kΩ 1% MF | Schmitt oscillator R |
| C_OSC | 1µF MKS2 film | Schmitt oscillator C |
| RV_FOG | 100kΩ lin | Depth knob |
| R_FOG_CV | 100kΩ 1% MF | CV input mix |

**Slew τ = 0.47s** — moves slowly, dreamy character (not rhythmic ticking like noise burst).
**Sample rate ~0.5 Hz** — random new value every ~2s on average.

**BOM (Block 22)**: 4 resistors ($0.20) + C_HOLD ($0.20) + C_SLEW + C_OSC WIMA film ($1.60) + RV_FOG ($1.50) + R_OSC ($0.05) = **~$3.55**.

#### Verification (Block 22)

- [ ] CD4066 control pulse rate ~0.5 Hz (scope).
- [ ] S&H output steps visible на DC voltmeter — random new value each ~2s.
- [ ] Slew limit: step → 0.47s settle to new value (RC time constant).
- [ ] No audible clicks when sample switches (slew + buffer prevent click).

---

### Block 23. FROST — HF absorber state-variable VCF (detailed schematic)

Voltage-controlled LPF в feedback loop reverb — при увеличении FROST sweep-down ВЧ → tail постепенно теряет air. Антипод BLEACH (HF saturation) в Last Day.

**Topology**: 2-pole state-variable filter (SVF) с two OTA-driven integrators. Cutoff range 20 kHz → 800 Hz controlled by RV_FROST + J_FROST_CV.

#### Signal flow

```
   Feedback wet signal (tap from U4A output, post-summing)
        │
        ▼
   R_FROST_IN 22k ──► (-) U12 A (TL072 first integrator summing node)
                          │
                          │  Feedback from output: R_DAMPING 100k (sets Q)
                          ▼
                  U10 OTA1 (LM13700) configured as integrator gm
                          │
                          │  C_FROST_1 1nF NP0 on integrator output
                          ▼
                  LPF output (1st pole) ──┬──► U12 B (TL072 second integrator)
                                          │           │
                                          │   U10 OTA2 configured as gm
                                          │           │
                                          │   C_FROST_2 1nF NP0
                                          ▼           │
                                  LPF output (2nd pole, -12 dB/oct) ──► Back to U4A feedback summing
                                                      │
                                  ┌───────────────────┘
                                  ▼
                          Q damping feedback ──► R_DAMPING ──► sum node
                          (HP output from U12 A summing node)

   Cutoff control:
        RV_FROST 100kΩ lin → +5V ref bias → R_CUT_BUF 10k → U11 buffer
              │
              + J_FROST_CV summed via R_FROST_CV 100k
              │
              ▼
        Control voltage 0–5V → R_IABC 22k → OTA Iabc pins (both U10 halves)
              │
              ▼
        Iabc range: 1µA (cutoff 800 Hz) → 50µA (cutoff 20 kHz)
        Both OTAs share same Iabc → matched cutoff for both poles
```

#### Cutoff formula

For OTA integrator: f_c = gm / (2π × C × R_in_eff). With OTA gm = 19.2 × Iabc (LM13700 datasheet @ room temp):
- Iabc = 1 µA → gm = 19.2 µS → f_c = 19.2e-6 / (2π × 1e-9 × 1) ≈ 3 kHz (with R_in scaling to 800 Hz via R_FROST_IN 22k tuning)
- Iabc = 50 µA → gm = 960 µS → f_c ≈ 152 kHz / 22 = 6.9 kHz (limited by op-amp bandwidth at ~20 kHz audio range)

**Tuning**: trim R_FROST_IN value during prototype to land 20 kHz top end + 800 Hz bottom end. Empirical: R_FROST_IN 22k often gives correct range; if not, swap to 33k or 15k.

#### Component values

| Ref | Value | Function |
|-----|-------|----------|
| R_FROST_IN | 22kΩ 1% MF | Filter input scaling |
| R_DAMPING | 100kΩ 1% MF | Q feedback (sets Q ≈ 0.7, low ripple) |
| C_FROST_1, C_FROST_2 | 1nF NP0 (matched pair, ±2%) | Integrator caps |
| RV_FROST | 100kΩ lin (center-detent OK) | Cutoff knob |
| R_CUT_BUF | 10kΩ 1% MF | Buffer input |
| R_FROST_CV | 100kΩ 1% MF | CV input mix |
| R_IABC | 22kΩ 1% MF | Iabc current setting |

**Why state-variable (not single-pole)**:
- 2-pole gives audible -12 dB/oct slope vs single-pole -6 dB/oct.
- SVF stable across full sweep range (no gain spike at corner).
- Provides both LPF + HP simultaneously — HP unused here but available for future Phase 3 expansion (frost+hum filtering).

**Cutoff range**: 20кГц (frost = 0, transparent) → 800Гц (frost = max, only midrange survives).

**BOM (Block 23)**: 4 resistors ($0.20) + 2× C_FROST NP0 matched ($0.40) + RV_FROST ($1.50) = **~$2.10**.

#### Verification (Block 23)

- [ ] Cutoff sweep: white noise input → spectrum analyzer should show -3 dB point sweeping from 20 kHz to 800 Hz.
- [ ] Q stable across range — no oscillation at any cutoff value.
- [ ] Matched C_FROST caps within ±2% — measure with LCR meter before solder.

---

### Block 24. CHILL — Expander с brittle release (detailed schematic)

Anti-compression: quiet stays quiet, loud reaches peak but decays fast. Антипод TAR (vise compressor) в Last Day.

**Operating principle**: Detect envelope of audio → gain control inverted (more signal → MORE gain → expander above threshold, gain compression below threshold) → fast release punishes sustained signals.

#### Signal flow

```
   Mix output (from Block 13) ──► R_CHILL_IN 10k
        │
        ▼
   ┌──── Sidechain path ────┐         ┌──── Audio path (delayed via R_DELAY/C_DELAY) ────┐
   │                        │         │                                                  │
   │  R_FW 10k ──► D1 1N4148 │         │  Audio bus ──► U10 OTA2 (LM13700) — expander VCA │
   │     │  (HW rectifier)   │         │                       │                          │
   │     ▼                   │         │                       ▼                          │
   │  C_ENV 1µF + R_ATT 1k   │         │              CHILL output → output buffer        │
   │     │  (attack ~1ms)    │         │                                                  │
   │     │                   │         └──────────────────────────────────────────────────┘
   │     ▼                                          ▲
   │  R_REL 100k ──► to GND                         │
   │  (release ~100ms, brittle fast)                │
   │     │                                          │
   │     ▼                                          │
   │  U11 C (env follower buffer)                   │
   │     │                                          │
   │     ▼                                          │
   │  Envelope DC voltage 0–5V                      │
   │     │                                          │
   │     ▼                                          │
   │  (-) U11 D comparator                          │
   │     vs RV_CHILL_THRESH (50k trim) ──► ratio    │
   │     │                                          │
   │     ▼                                          │
   │  Above threshold: comparator HIGH              │
   │     → CV_CHILL_HIGH (max gain)                 │
   │  Below threshold: comparator LOW               │
   │     → CV_CHILL_LOW (reduced gain)              │
   │     │                                          │
   │     ▼                                          │
   │  CV scaled by RV_CHILL 100k (amount) ──────────┘
   └────────────────────────────────────────────────►
```

#### Component values

| Ref | Value | Function |
|-----|-------|----------|
| R_CHILL_IN | 10kΩ 1% MF | Audio input |
| R_FW | 10kΩ 1% MF | Half-wave rectifier R |
| D1 | 1N4148 | HW rectifier diode |
| C_ENV | 1µF MKS2 | Envelope cap |
| R_ATT | 1kΩ 1% MF | Attack RC (1 ms) |
| R_REL | 100kΩ 1% MF | Release RC (100 ms — "brittle" character) |
| RV_CHILL_THRESH | 50kΩ trim multi-turn (Bourns 3296W) | Internal threshold trim |
| RV_CHILL | 100kΩ lin | Amount knob |
| R_CV_LOW, R_CV_HIGH | 22kΩ 1% MF each | CV scaling resistors |
| R_IABC_CHILL | 22kΩ 1% MF | Iabc for U10 OTA2 |

**Release time 100 ms** = "brittle". Compare к typical compressor release 200–500 ms. Short release punishes sustain (key character of anti-compression).

**Attack 1 ms** = fast envelope follow. No "pump-up" delay.

**BOM (Block 24)**: 8 resistors ($0.40) + D1 ($0.01) + C_ENV ($0.30) + RV_CHILL_THRESH ($0.80) + RV_CHILL ($1.50) = **~$3.00**.

#### Verification (Block 24)

- [ ] Input sine wave 1 kHz at -10 dBV → envelope follower DC ~3V (sanity check).
- [ ] Burst input: rise to peak < 5 ms (attack OK), decay to 10% in ~250 ms (5τ release = brittle).
- [ ] Threshold trim: set to mid → comparator switches at -20 dBV input level.
- [ ] Amount CW: above-threshold signals louder than dry (expander above), below-threshold quieter (compressor below). Inverse compression confirmed.

---

### Block 25. HUM — Mains-hum antenna pickup (detailed schematic)

Ferrite-coil antenna ловит сетевой 50/60Hz hum + EM-наводки → tuned amp → mix. Антипод HEATWAVE (AM-tuner ионосфера) в Last Day.

#### Signal flow

```
   ┌──── Antenna source (selectable) ────┐
   │                                      │
   │  Internal: L_FERRITE (ferrite-rod    │
   │   coil 1000т, ~100mH, ferrite rod   │
   │   50mm × 8mm)                       │
   │                                      │
   │  External (premium): J_HUM_ANT       │
   │   (3.5mm jack, coax to remote        │
   │    antenna or pickup coil)           │
   │                                      │
   │  SW_HUM_SRC SPDT switch selects      │
   │  internal vs external                │
   └──────────────────────────────────────┘
                          │
                          ▼
                  C_HUM_IN 1µF (DC block)
                          │
                          ▼
                  R_HUM_IN 1MΩ (high-Z bias to GND, sets input impedance)
                          │
                          ▼
                  U11 B (TL074 input buffer, gain ×1)
                          │
                          ▼
                  ┌──── Twin-T tuned filter (50/60 Hz) ────┐
                  │                                         │
                  │  R_T1, R_T2 + C_T1, C_T2 (top arm)    │
                  │  R_T3 + C_T3 (bottom arm)              │
                  │                                         │
                  │  Notch at f_notch — INVERTED для bandpass: │
                  │  Twin-T usually rejects at 50/60Hz —   │
                  │  here we wrap в op-amp feedback        │
                  │  → BANDPASS at 50/60Hz Q≈5             │
                  └─────────────────────────────────────────┘
                          │
                          ▼
                  U12 B (TL072 bandpass amp, ×5 gain)
                          │
                          ▼
                  U10 OTA — variable gain (×1 to ×100)
                  Iabc controlled by RV_HUM 100k log
                          │
                          ▼
                  RV_HUM_LEVEL output buffer ──► Sum to Block 13 mix
                          │
                          ▼
                  J_HUM_CV summed in via R_HUM_CV 100k

   ┌──── SW_FREQ (50Hz / 60Hz selector switch) ────┐
   │                                                 │
   │  Changes C_T1, C_T2, C_T3 values via SPDT      │
   │  50Hz path: C_T1=C_T2=68nF, C_T3=130nF         │
   │  60Hz path: C_T1=C_T2=56nF, C_T3=110nF         │
   │                                                 │
   │  Twin-T tuning formula:                         │
   │  f = 1/(2π × R × C), with R_T1=R_T2=R, R_T3=R/2 │
   │  + C_T3=2×C_T1  → notch at f                    │
   └─────────────────────────────────────────────────┘
```

#### Twin-T values (50/60Hz selectable)

| Component | 50Hz position | 60Hz position |
|-----------|---------------|---------------|
| R_T1, R_T2 | 47kΩ 1% MF (×2, matched) | (same) |
| R_T3 | 23.5kΩ (use 22k + 1.5k series) | (same) |
| C_T1, C_T2 | 68nF film polypropylene | 56nF film |
| C_T3 | 130nF film (use 100nF + 30nF) | 110nF film |

**Matching critical**: 5% Twin-T mismatch → Q drops to ~2, notch shallow. Use matched pairs from same batch, measure with LCR.

#### Component values

| Ref | Value | Function |
|-----|-------|----------|
| L_FERRITE | 100mH ~1000т ferrite rod 50×8mm | Internal antenna |
| C_HUM_IN | 1µF MKS2 | DC block |
| R_HUM_IN | 1MΩ 1% MF | Bias |
| Twin-T components | per table above | 50/60Hz tuned |
| SW_FREQ | DPDT slide switch | 50/60Hz select |
| SW_HUM_SRC | SPDT mini-toggle | Internal/external antenna |
| RV_HUM | 100kΩ log Alpha RV09 | Level knob |
| R_HUM_CV | 100kΩ 1% MF | CV input |
| R_IABC_HUM | 22kΩ 1% MF | Iabc for U10 OTA |

**BOM (Block 25)**: L_FERRITE custom-wound ($2.00) + matched film caps ($1.50) + matched MF resistors ($0.40) + 2× switches ($1.00) + RV_HUM ($1.50) + J_HUM_ANT 3.5mm jack ($0.40) = **~$6.80**.

#### Verification (Block 25)

- [ ] Internal ferrite antenna picks up nearby mains transformer audibly при `RV_HUM` full CW (place near AC adapter — confirm hum amplification).
- [ ] Twin-T tuning: sweep external signal generator 30–80 Hz, identify peak gain frequency. Should be 50 Hz (or 60 Hz per switch position) ±2 Hz.
- [ ] Q ~5 (bandwidth ~10 Hz at -3 dB).
- [ ] No collateral switching noise от собственного TMR 3-1212WI DC-DC (150kHz) reaches HUM output (DC-DC ferrite shield essential).

**Open question**: внутренняя antenna может ловить collateral switching noise от собственного TMR 3-1212WI DC-DC (150kHz). Mitigation: ferrite shielding coil + 50/60Hz tuned filter cuts switching frequency. Если bench prototype не подтверждает clean signal — HUM откладывается в Phase 2B с external antenna jack only.

---

### Phase 2 daughter board BOM summary

| Block | Function | Sub-BOM |
|-------|----------|---------|
| Active ICs (shared) | 2× LM13700 + TL074 + TL072 + 4066 + extra TL072 | $5.65 |
| Block 21 PULSE | LFO + depth VCA | $4.35 |
| Block 22 FOG | Random S&H + slew | $3.55 |
| Block 23 FROST | SVF VCF | $2.10 |
| Block 24 CHILL | Expander + env follower | $3.00 |
| Block 25 HUM | Ferrite antenna + Twin-T amp | $6.80 |
| Daughter board PCB (4-layer 100×60mm) | | $4.00 |
| 10-pin header + ribbon to main board | | $1.50 |
| 5× knobs (RV_PULSE/RATE/FOG/FROST/CHILL/HUM = 6 actually) | Davies 1900H budget | $3.00 |
| 5× CV jacks + SW_FREQ + SW_HUM_SRC | | $4.00 |
| **Phase 2 daughter board total** | | **~$37.95** |

**Phase 2 retail upgrade kit price**: $89 (margin 2.3× for low-volume kit production, plus install labor).

**Bench validation status**: All 5 blocks designed на paper, **not prototyped**. Phase 2 launch contingent on prototype validation of: (1) HUM bandpass clean от DC-DC noise; (2) FROST cutoff range achievable with chosen R/C; (3) Daughter board fits mechanically под main board PCB на M3 standoffs.

---

## Сводная сводка (v5 hybrid — Decision 09)

- **25 functional blocks** total (15 ядро + 6 base FX/utility/perform + 5 cold palette Phase 2):
  - Blocks 1–15: core v2.1 schematic. Block 12 объединяет noise+geiger через 2 knob frontend + crossfader OTA. Block 15 reserved.
  - Block 16: **always-on phaser** (named effect, не optional layer).
  - Block 17: **REMOVED** (BBD vinyl wow → переехал в Last Day).
  - Block 18: **Gate/Crush footswitch** (CD4066 + LF398 + LM393, restored from v4 removal).
  - Block 19: isolated DC-DC (pedal SKU only — TRACO TMR 3-1212WI / Recom RKD-1212-D).
  - **Block 20**: COLOR preset slider (4P5T, **detailed schematic с 5 R-banks**, see above).
  - Blocks 21–25: cold palette FX layer (Phase 2 v3 PCB upgrade — PULSE/FOG/FROST/CHILL/HUM).
- **9 ICs analog (budget 2-stage phaser)**: 2× TL072 + 2× TL074 + **3× LM13700** (U5=VCA + Block 12 crossfader OTA; U6=spare halves для Block 20 saturation / resonance; U7=Block 16 phaser cells 1+2) + CD4066 (Gate cell shared с Shape Form S&H) + LF398 (Crush cell).
- **10 ICs analog (premium 4-stage phaser)**: + **U8 LM13700** для phaser cells 3+4.
- **1 dual comparator**: LM393 (Gate threshold + tap-tempo).
- **1 MCU**: ATtiny85 (Geiger LFSR cluster pattern + crush sample clock + tap-tempo divider).
- **2 timers**: NE555 ×2 (U_555 TOLL pulse monostable + U_VINYL_555 vinyl-skip one-shot для Shape Form path 4).
- **1 counter**: 74HC161 (Block 16 Shape Form step DAC counter).
- **6 transistors**: LSK489A dual JFET + BD139 + BD140 + 2N7000 (solenoid driver — shared DAMP+TOLL+STALL via 3-way diode-OR).
- **1 zener**: BZX55C9V1.
- **1 isolated DC-DC** (pedal only): TRACO TMR 3-1212WI (budget) или Recom RKD-1212-D (premium).
- **Footswitches** (mockup canon): TAP / GATE-CRUSH / BYPASS / FREEZE.
- **CV-only triggers** (modular advanced): J_TOLL_TRIG, J_STALL_CV.
- **Sliders**: SL-4P5T (Block 20 Color preset) + SL-1P5T (Block 16 Shape Form).

**Phase 1 ship BOM** (v5 hybrid, ядро + Gate/Crush + 2-stage phaser + Color preset + base FX): **~$94 budget / $121 premium**.
**Phase 1 premium SKU** (4-stage phaser): +$2 → **~$96 budget / $123 premium**.
**Phase 2 v3 PCB BOM**: +$38 для cold palette daughter-board (incl. PCB + ribbon + 6 knobs + 5 jacks + 2 switches) → **~$132 budget / $159 premium** full feature.

**Retail target**: $499 budget / $649 premium (sustainable margin, premium tier alongside Strymon BigSky / Eventide H9 Max).

## Полный BOM

Таблица закупок Last Night v3.0 — все компоненты для одного модуля. Цены ориентировочные (USD, retail small-quantity, Mouser/Digi-Key 2025).

### Active components (ICs, transistors, diodes)

| Ref | Part Number | Описание | Package | Qty | Unit $ | Total $ | Sourcing |
|-----|-------------|----------|---------|-----|--------|---------|----------|
| U1, U3 | TL072CP | Dual JFET-input op-amp | DIP-8 | 2 | $0.50 | $1.00 | TI / Mouser |
| U2, U4 | TL074CN | Quad JFET-input op-amp | DIP-14 | 2 | $0.75 | $1.50 | TI / Mouser |
| U5, U6 | LM13700N | Dual OTA (U5=VCA + bipolar noise VCAs, U6=phaser stages) | DIP-16 | 2 | $2.00 | $4.00 | TI / Mouser |
| U_555 | NE555P | Monostable 555 timer для TOLL pulse generator (5–10мс) | DIP-8 | 1 | $0.25 | $0.25 | Multi-source |
| U_GATE | CD4066BE | Quad CMOS analog switch (Gate cell + bypass relay logic) | DIP-14 | 1 | $0.40 | $0.40 | Multi-source |
| U_SH | LF398N | Sample-and-hold (Crush cell) | DIP-8 | 1 | $1.20 | $1.20 | TI |
| U_COMP | LM393 | Dual comparator (Gate threshold + Tap-tempo detection) | DIP-8 | 1 | $0.30 | $0.30 | TI |
| U_SPLIT | TL072CP (extra half) | Bipolar CV splitter (positive/negative comparator pair) | shared в U1/U3 | — | — | — | included above |
| U_MCU | ATtiny85-20PU | MCU (Geiger LFSR cluster pattern + bipolar split logic helper) | DIP-8 | 1 | $1.50 | $1.50 | Microchip |
| U_LDO | 7805 (or LM78L05) | +5V LDO для MCU | TO-220 (or TO-92) | 1 | $0.30 | $0.30 | Multi-source |
| Q3 | LSK489A | Dual matched N-JFET | SOT-23-6 (SMD) | 1 | $6.00 | $6.00 | LIS / Mouser |
| Q1 | BD139 | NPN BJT (push-pull NPN) | TO-126 | 1 | $0.30 | $0.30 | ON Semi |
| Q2 | BD140 | PNP BJT (push-pull PNP) | TO-126 | 1 | $0.30 | $0.30 | ON Semi |
| Q5 | 2N7000 | N-channel logic-level MOSFET (solenoid driver — shared DAMP+TOLL) | TO-92 | 1 | $0.15 | $0.15 | Multi-source |
| D_NOISE | BZX55C9V1 | 9.1V zener (continuous hiss noise — CCW noise half) | DO-35 | 1 | $0.10 | $0.10 | Multi-source |
| D_OR_A, D_OR_B, D_OR_C | 1N4148 | 3-way OR-gate diodes для DAMP + TOLL + STALL combined gate path | DO-35 | 3 | $0.01 | $0.03 | Multi-source |
| D_BIAS1, D_BIAS2 | 1N4148 | Push-pull bias diodes | DO-35 | 2 | $0.01 | $0.02 | Multi-source |
| D_LIM1, D_LIM2 | 1N4148 | Feedback loop limiter | DO-35 | 2 | $0.01 | $0.02 | Multi-source |
| D_ATK, D_DEC | 1N4148 | Envelope follower diodes | DO-35 | 2 | $0.01 | $0.02 | Multi-source |
| D_EF | 1N4148 | Envelope rectifier | DO-35 | 1 | $0.01 | $0.01 | Multi-source |
| D_SOL | 1N4001 | Solenoid flyback | DO-41 | 1 | $0.03 | $0.03 | Multi-source |
| D_P1, D_P2 | 1N5817 | Schottky reverse polarity protection | DO-41 | 2 | $0.20 | $0.40 | Multi-source |
| D1–D6 | LED 3мм Red | Clip indicators (3 in series each polarity) | T-1 | 6 | $0.02 | $0.12 | Multi-source |
| D_LED_FX | LED 3мм Red | Footswitch indicators (TAP/GATE-CRUSH/BYPASS/FREEZE) | T-1 | 4 | $0.02 | $0.08 | Multi-source |

**Удалено из BOM v5 vs v3** (через consolidation Decision 08 + hybrid 09):
- U_BBD V3207D ($5) — vinyl BBD больше не в Last Night (мигрирует в Last Day).
- U_BBDCLK V3102D ($3) — clock generator для BBD.

**Net removal**: -$8.

**Возвращено в v5 hybrid (было removed в v4 Decision 08, но восстановлено в Decision 09)**:
- U_GATE CD4066BE ($0.40) — Gate cell для GATE-CRUSH footswitch.
- U_SH LF398N ($1.20) — Crush sample-hold cell.
- U_COMP LM393 ($0.30) — Gate threshold comparator + tap-tempo detection.

**Добавлено в v5 hybrid**:
- U_555 NE555P ($0.25) — TOLL pulse monostable (J_TOLL_TRIG path).
- D_OR_A, D_OR_B, D_OR_C 1N4148 ($0.03) — 3-way diode-OR для DAMP+TOLL+STALL paths.
- RV_NOISE Alpha RV09 log ($1.20) — стандартная ручка, не detent.
- RV_COLOR Alpha RV09 lin ($1.20) — стандартная ручка для geiger crossfader.

**Net change v5 vs v3**: -$8 (BBD removed) + $1.93 (gate/crush + 555 + diodes) = **-$6 vs v3 baseline**.

Phase 1 BOM становится **дешевле и фокусированнее** чем v3.0, но **сохраняет** все footswitch effects (Gate/Crush, Bypass, Tap, Freeze) + **добавляет** modular-advanced TOLL/STALL CV triggers.
| **Subtotal active** | | | | | | **$23.95** | |

### FX Engine new components (v3.0)

| Ref | Part Number | Описание | Qty | Unit $ | Total $ |
|-----|-------------|----------|-----|--------|---------|
| RV_PHASE | Alpha 9mm pot 100kΩ log | Phaser feedback / resonance (Block 16) | 1 | $1.20 | $1.20 |
| RV_DEPTH | Alpha 9mm pot 100kΩ lin | Phaser modulation depth (Block 16) | 1 | $1.20 | $1.20 |
| RV_SPEED | Alpha 9mm pot 1MΩ log | Phaser LFO rate (Block 16) | 1 | $1.20 | $1.20 |
| RV_HIPASS | Alpha 9mm pot 100kΩ lin | HiPass filter cutoff | 1 | $1.20 | $1.20 |
| RV_INPUT, RV_OUTPUT | Alpha 9mm pot 100kΩ lin | Input gain, output level | 2 | $1.20 | $2.40 |
| Color slider (4P5T) | Alpha SL-4P5T | 5-position vertical slider для tone preset (Block 20 — see detailed schematic) | 1 | $5.00 | $5.00 |
| Color preset banks | См. Block 20 BOM | 12× R + 1× 100nF + 1× 1nF + 2× 1N4148 + 6× twin-T | 22 | — | $0.41 |
| Shape Form slider (1P5T) | Alpha SL-1P5T | **5-position** horizontal slider для LFO waveform (Block 16 routing: triangle/sine/random S&H/vinyl-skip/step) | 1 | $3.00 | $3.00 |
| **U7 (phaser OTAs)** | LM13700N | Block 16 — phaser cells 1+2 (budget 2-stage SKU) или cells 1+2 of 4 (premium) | 1 | $2.00 | $2.00 |
| U8 (phaser OTAs premium only) | LM13700N | Block 16 — phaser cells 3+4 (premium 4-stage SKU only) | 0–1 | $2.00 | $0–2.00 |
| U_VINYL_555 | NE555P | Block 16 — vinyl-skip one-shot для Shape Form path 4 | 1 | $0.25 | $0.25 |
| U_TAP_CNT | 74HC161 | Block 16 — TAP-incremented step counter для Shape Form path 5 (step DAC) | 1 | $0.30 | $0.30 |
| Block 16 misc (caps, R-2R ladder, sat diodes) | См. Block 16 BOM | C_AP1/2 + C_LFO + C_SINE + R-2R ladder + cell R's | ~18 | — | $1.10 |
| **SWITCH CLIP** | SPDT toggle | Clip mode select | 1 | $1.50 | $1.50 |
| Footswitches (3PDT × 4) | DPDT/3PDT mechanical | TAP, GATE/CRUSH, BYPASS, FREEZE | 4 | $3.00 | $12.00 |
| **Subtotal FX engine (budget 2-stage phaser)** | | | | | **$32.76** |
| **Subtotal FX engine (premium 4-stage phaser, +U8 + cells 3/4)** | | | | | **$34.85** |

### Power supply (per SKU)

**Eurorack SKU**:
- IDC 2×5 connector: $0.50.
- 1N5817 reverse protection: included above.
- LC filter (10µH + 10µF): $1.00.

**Pedal SKU** (additional):
- DC barrel jack 2.1mm center-negative: $1.20.
- **TRACO TMR 3-1212WI** isolated DC-DC (budget SKU): **$13.00**.
- — or **Recom RKD-1212-D** (premium SKU): **$22.00**.
- LC filter post-DC-DC (×2 rails): $2.00.

### Заmена subtotal

Subtotal active was $11.97 — увеличено с FX engine + DC-DC до:

| Tier | Subtotal active+FX | Power | **Total active+FX+power** |
|------|--------------------|-------|---------------------------|
| Eurorack budget | $54.65 | $1.50 | **$56.15** |
| Eurorack premium (4-layer PCB) | $54.65 | $1.50 | **$56.15** |
| Pedal budget (TMR 3-1212WI) | $54.65 | $16.20 | **$70.85** |
| Pedal premium (RKD-1212-D) | $54.65 | $25.20 | **$79.85** |

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
| Aluminum panel 40HP × 128.5мм (anodized, laser-etched) | 1 | $25.00 | $25.00 |
| M3 hex screws (panel mount) | 4 | $0.10 | $0.40 |
| M3 standoffs (PCB to panel) | 4 | $0.20 | $0.80 |
| Knob caps (RV pots) | 10 | $0.50 | $5.00 |
| Shrouded LED holders | 6 | $0.10 | $0.60 |
| Solder, flux, misc | — | — | $1.00 |
| **Mechanical subtotal** | | | **$22.80** |

### PCB (190×108мм для 40HP формата)

| Option | Layers | Cost (5-pcs run) | Per unit |
|--------|--------|------------------|----------|
| **Budget** | 2-layer FR4 1.6mm | $30 | $6.00 |
| **Premium** | 4-layer FR4 1.6mm | $150 | $30.00 |

(40HP PCB — больше площадь, чем 20HP, поэтому цена ~2× выше.)

### Total BOM per module (40HP)

| Category | Budget | Premium |
|----------|--------|---------|
| Active components | $11.97 | $11.97 |
| Resistors | $1.05 | $1.05 |
| Capacitors | $2.20 | $2.20 |
| Pots | $13.30 | $13.30 |
| Switches & connectors | $15.90 | $15.90 |
| Mechanical (40HP panel $25) | $32.80 | $32.80 |
| PCB (40HP) | $6.00 | $30.00 |
| **Total module** | **$83.22** | **$112.22** |

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

### Retail pricing implications (40HP flagship sizing)

| SKU | BOM | Retail | Gross margin |
|-----|-----|--------|--------------|
| Module budget (40HP) | $83 | $450 | 81% |
| Module premium (40HP, 4-layer PCB) | $112 | $550 | 80% |
| Cartridge oak | $46 | $80 | 42% |
| Cartridge premium titanium | $106 | $350 | 70% |

**Boutique sustainable** при above margins — covers R&D amortization (+10–15% deduction), distribution cut (если используется), warranty reserve, manufacturing labor (DIY: own time; factory: $20-30/unit assembly).

**40HP flagship pricing**: $450-550 retail aligns с premium boutique tier (Make Noise Strega ~$650, Mutable Instruments Beads ~$390, Erica Synths Plates ~$750). Last Night sits в premium half с unique physical differentiation.

## PCB layout — зоны и правила разводки

PCB **190 × 108мм** (для 40HP формата), 2-layer FR4 1.6мм (budget) или 4-layer FR4 1.6мм (premium).

### Zone diagram (top view)

```
┌─────────────────────────────────────────────────────────────────────┐
│  PCB 190 × 108mm (40HP format — wider, more breathing room)         │
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

### Silkscreen

- Component reference designators visible.
- Polarity marks для diodes, electrolytic caps, IC orientation (pin 1 dot).
- ICs orientation arrows.
- Critical notes: "DO NOT ROUTE SIGNALS NEAR JFET GATE (guard zone)" и "R8 5W WIREWOUND ONLY".

### v5 hybrid PCB review — extended zones

The v4-era zone diagram (1–9) covers только core blocks. v5 hybrid adds significant new circuitry that needs explicit floor-plan slots:

**New zones (10–14)**:

| Zone | Block(s) | ICs / parts | Physical considerations |
|------|----------|-------------|--------------------------|
| **Zone 10** | Block 16 Phaser | U7 LM13700 (cells 1+2), U8 LM13700 premium (cells 3+4), TL074 spare для phaser sum amp, **74HC161** (Shape Form step DAC), **NE555 #2** (vinyl-skip one-shot), C_AP1–4 (47nF / 15nF / 6.8nF / 2.2nF NP0) | Place **away from JFET preamp Zone 4** — phaser LFO can radiate sub-audio crosstalk into hi-Z gate. Min 25mm separation. LFO triangle slow enough that ferrite bead OK. |
| **Zone 11** | Block 18 Gate/Crush | U_GATE CD4066BE, U_SH LF398N, U_COMP LM393, R-2R matched pairs | Place **between Zone 7 (mix output) and panel** — signal flows mix → Gate → Crush → output buffer → jack. R-2R matched resistors require equal-length traces (<5mm difference). |
| **Zone 12** | Block 20 COLOR slider | Slider SL-4P5T mounted **panel-edge** (not on PCB body), R-banks (12 resistors) на panel-adjacent strip | Slider physically on panel left side per mockup. R-banks soldered on small **slider satellite PCB** (40×20mm) which mounts behind slider, ribbon-connects to main PCB via 8-pin header. |
| **Zone 13** | Block 12 noise + Block 16 Shape Form panel slider | SL-1P5T Shape Form slider panel-mount, ATtiny85 MCU (shared с Block 12, 16, 18), 7805 LDO для +5V digital | Slider satellite PCB shared с Block 20 region. ATtiny85 в **digital corner** (DGND, Zone 8 adjacent). +5V LDO heat sink not needed (50mA draw, 0.35W on 7V drop = OK без). |
| **Zone 14** | Phase 2 daughter board connection | 10-pin header (2×5 IDC ribbon) | Header placed на main PCB **bottom edge** (opposite panel side). Phase 2 daughter board mounts on M3 standoffs 12mm tall, sits underneath main PCB. Ribbon carries: ±12V, GND, audio bus tap (Block 13 output), DAMP_CV input, 4× Phase 2 CV jack connections, +5V digital. |

#### Revised floor plan (40HP module, panel-up view)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PCB 190 × 108mm (40HP format)                                              │
│                                                                             │
│  ──── Top row (panel-mount edge) ────                                       │
│                                                                             │
│  ┌──────┐ ┌─────────┐ ┌────────────────────────┐ ┌──────────┐ ┌─────────┐  │
│  │ Z1   │ │ Z2      │ │ Z3                     │ │ Z4       │ │ Z8      │  │
│  │ POWER│ │ DRIVER  │ │ INPUT+PRE-EMPH+TONE    │ │ PIEZO    │ │ SOLEN.  │  │
│  │ +    │ │ PUSH-   │ │ U1A U3A U2A            │ │ PRE      │ │ DRIVER  │  │
│  │ DC-DC│ │ PULL    │ │                        │ │ Q3       │ │ Q5      │  │
│  │ Z19  │ │ Q1 Q2   │ │ J_IN                   │ │ J_PA J_PB│ │ J_SOL   │  │
│  │      │ │ R8      │ │                        │ │ guard    │ │ D_SOL   │  │
│  │ J_PWR│ │         │ │                        │ │ ring     │ │         │  │
│  └──────┘ └─────────┘ └────────────────────────┘ └──────────┘ └─────────┘  │
│                                                                             │
│  ──── Middle row (FX core) ────                                             │
│                                                                             │
│  ┌──────────────┐ ┌────────────────┐ ┌──────────────────────┐ ┌──────────┐ │
│  │ Z5           │ │ Z6             │ │ Z10 PHASER (NEW)     │ │ Z9       │ │
│  │ FEEDBACK +   │ │ TONE LPF +     │ │ U7 LM13700 cells 1+2 │ │ NOISE +  │ │
│  │ FREEZE       │ │ LED CLIP +     │ │ U8 LM13700 cells 3+4 │ │ GEIGER   │ │
│  │ U4A          │ │ ENV VCA        │ │ TL074 phaser sum amp │ │ D_NOISE  │ │
│  │ SW_FREEZE    │ │ U2A D1-D6      │ │ 74HC161 Shape DAC    │ │ U2C      │ │
│  │ D_LIM        │ │ U5 LM13700     │ │ NE555 vinyl one-shot │ │ ATtiny85 │ │
│  │              │ │                │ │ C_AP1-4 NP0          │ │ Z13      │ │
│  │ J_SIDE       │ │ J_CV_DAMP      │ │                      │ │ +5V LDO  │ │
│  │              │ │ J_CV_DECAY     │ │ (away from Z4!)      │ │          │ │
│  └──────────────┘ └────────────────┘ └──────────────────────┘ └──────────┘ │
│                                                                             │
│  ──── Bottom row (output + perform) ────                                    │
│                                                                             │
│  ┌──────────────┐ ┌──────────────────┐ ┌───────────────────┐ ┌──────────┐  │
│  │ Z7 MIX OUT   │ │ Z11 GATE/CRUSH   │ │ Z12 COLOR slider  │ │ Z14      │  │
│  │ U2D          │ │ (NEW)            │ │ satellite PCB     │ │ 10-pin   │  │
│  │              │ │ U_GATE 4066      │ │ (panel-edge mount)│ │ HEADER   │  │
│  │ J_OUT_L      │ │ U_SH LF398N      │ │ SL-4P5T + 12 R    │ │ to Phase │  │
│  │ J_OUT_R      │ │ U_COMP LM393     │ │ ribbon to main    │ │ 2 board  │  │
│  │ J_CV_MIX     │ │ R-2R matched     │ │                   │ │          │  │
│  │              │ │ Footswitch       │ │ Shape Form        │ │          │  │
│  │              │ │ wires to panel   │ │ SL-1P5T satellite │ │          │  │
│  └──────────────┘ └──────────────────┘ └───────────────────┘ └──────────┘  │
│                                                                             │
│  Bottom edge: panel-mount jacks, pots, LEDs                                 │
│  Daughter PCB (Phase 2): mounts underneath main PCB on 12mm standoffs       │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Critical separations (v5 hybrid)

| Pair | Min distance | Why |
|------|--------------|-----|
| Z4 (JFET preamp) ↔ Z10 (Phaser LFO) | 25mm | Phaser triangle wave sub-audio coupling into hi-Z gate |
| Z4 (JFET preamp) ↔ Z8 (Solenoid) | 40mm | EMI from solenoid switching transient |
| Z4 (JFET preamp) ↔ Z9 (Noise gen) | 30mm | Zener noise radiates 50kHz–MHz hash |
| Z1 DC-DC (Z19, pedal SKU) ↔ Z11 (Crush S&H) | 20mm + ferrite bead on supply | DC-DC 150kHz switching can couple into S&H hold cap |
| Z8 (Solenoid +12V loop) ↔ all audio zones | shielded twisted pair cable to cartridge | Magnetic field from 290mA pulse current |
| ATtiny85 clock (Z13) ↔ Z4 JFET | 30mm + GND moat | Digital clock 16MHz can crosstalk into hi-Z analog |

#### Power distribution review

**Star ground tie point** на J_PWR (Eurorack 16-pin Doepfer power connector) или near 12V jack (pedal SKU). 

Three pour zones meet at single point:
- AGND: Zones 3, 4, 5, 6, 7, 10, 11 (all audio + phaser)
- DGND: Zones 8, 9, 13, 14 (solenoid, noise, MCU, daughter board digital portion)
- PGND: Zones 1, 2 (power supply + push-pull output stage)

**Phase 2 daughter board grounding**: ribbon header carries **separate AGND** and **DGND** wires. Daughter board has own local 0.5mm star tie back via ribbon to main PCB star point.

#### PCB stack-up recommendation (v5 hybrid)

- **Budget SKU**: 2-layer FR4 1.6mm — workable, but Z10 phaser likely needs ferrite bead on +12V supply, и Z11 Crush S&H benefits from extra decoupling.
- **Premium SKU**: 4-layer FR4 1.6mm strongly recommended. Internal GND plane (layer 2) provides:
  - Effective shielding для Z4 JFET trace.
  - Solid ground reference для phaser OTA + LFO.
  - Better DC-DC switching noise containment.
- **Audiophile (Elite tier per Decision 10)**: 4-layer + matte black solder mask + ENIG finish + 2oz copper для power planes. +$15-20 PCB cost vs budget.

**Recommendation Phase 1 ship SKU**: **4-layer mandatory** for premium, **2-layer with ferrite + extra decoupling** acceptable for budget. Cost delta: ~$8 per PCB (4-layer vs 2-layer at qty 100).

#### Component placement priority (updated v5 hybrid)

Revised order from v4:

1. **J_PWR** — у edge.
2. **Power supply zone (Z1) + DC-DC (Z19 pedal)** — adjacent to J_PWR.
3. **Driver Amp (Z2)** — adjacent to power, with thermal exit к panel.
4. **Mini-XLR jacks (cartridge)** — у opposite edge from J_PWR (signal entry).
5. **JFET preamp (Z4)** — close to mini-XLR jacks (<20мм trace length). **No other circuit within 25mm**.
6. **Solenoid driver (Z8)** — opposite corner from JFET preamp (>40мм physical separation).
7. **Noise generator (Z9)** + ATtiny85 (Z13) — isolated digital corner, GND moat.
8. **Output (Z7)** — у edge near panel jacks.
9. **Phaser (Z10)** — middle row, **between Z6 VCA and Z7 output** (signal flow correct). 25mm clear from Z4.
10. **Gate/Crush (Z11)** — adjacent to Z7 (post-mix), short trace to output buffer.
11. **Slider satellites (Z12)** — panel-mounted, ribbon back to main.
12. **Phase 2 header (Z14)** — bottom edge of main PCB.

### Mounting holes

4× M3 holes на corners PCB — secured к panel rails. Не overlapping traces (1мм keepout).

Phase 2 daughter board: additional 4× M3 standoffs на bottom side of main PCB, 12mm tall.

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

Phased validation protocol для прототипа. Не переходить к следующей phase, пока предыдущая не passed.

(Полная версия — `audit/fixes/04_testing_protocol.md`. Здесь — concise summary для production reference.)

### Phase 0 — Visual + DMM continuity

- Visual inspection components (10× loupe).
- DMM short-circuit test: no shorts на ±12V rails.
- Polarized components verified.

**Pass**: no shorts, joints clean.

### Phase 1 — Power validation

- Idle current per rail: <100мА.
- ±12V на каждом IC pin (with 1N5817 drop ~0.4V → ±11.6V actual).
- Decoupling ripple <10мВ pp.

**Pass**: rails stable, IC powered.

### Phase 2 — Per-block functional test

Test each block sequentially (T2.1 — T2.12 in `04_testing_protocol.md`):

| Test | Result |
|------|--------|
| T2.1 Input buffer + pre-emph | BUF_OUT == input, shelf @3.2кГц working |
| T2.2 Driver + push-pull | No crossover notch (with bias diodes) |
| T2.3 R8 thermal (10 min @ full drive) | <80°C surface |
| T2.4 Exciter + pickup | Signal на piezo outputs at expected level |
| T2.5 Feedback / freeze | No runaway oscillation на oak cartridge |
| T2.6 Position crossfade | Audible timbral shift через knob |
| T2.7 Tone filter | LPF cutoff sweep |
| T2.8 LED clipper | Clip threshold +10.6 dBu |
| T2.9 Envelope follower VCA | Dynamic response к input |
| T2.10 Noise generator | Hiss audible, color sweep |
| T2.11 Mix section | Dry + wet + noise summing |
| T2.12 Solenoid damper | Activates на CV 5V, audible damping |

**Pass**: all blocks functional individually.

### Phase 3 — Noise floor measurement

Equipment: spectrum analyzer or RTA software (REW free).

**T3.1 Input-shorted noise floor**:
- Short J_IN.
- Mute cartridge mechanically.
- Spectrum 20Hz–20кГц.
- **Target**: budget <-85 dBV, premium <-95 dBV.

**T3.2 Solenoid-active noise**:
- Pulse CV_DAMP @ 10Hz.
- Click peak should be <-70 dBV.

**T3.3 THD**:
- 1кГц sine 100мВ input.
- THD measurement.
- **Target**: <0.5% at moderate drive.

**Pass**: noise floor and THD within targets.

### Phase 4 — Acoustic verification

**T4.1 RT60 measurement**:
- Reference oak cartridge installed.
- Impulse burst input.
- Record decay.
- **Target**: 0.1–0.3с (without feedback).

**T4.2 Material A/B comparison**:
- Test 3+ cartridges (oak, marble, spring steel).
- A/B comparison via swap.
- **Pass**: clearly audible different character.

**T4.3 Exciter thermal**:
- 30 min continuous use.
- Voice coil <60°C.

**Pass**: realistic acoustic claims, no overheating.

### Phase 5 — Integration (Eurorack)

- Install в rack с other modules.
- Standard signal chain: VCO → VCF → Last Night → Out.
- CV inputs work с external CV sources.
- No interference с neighbors (motor, solenoid emission).

**Pass**: works в context.

### Phase 6 — 24-hour burn-in

- Continuous signal 24 hours.
- Measure key parameters every 6 hours: rail voltages, noise, THD, RT60.
- **Pass**: all parameters stable ±10% over 24h.

### Production QC (per unit)

Each unit gets:
1. Phase 0 (visual + DMM): mandatory.
2. Phase 1 (power): mandatory.
3. Phase 2 brief (subset T2.1, T2.2, T2.4, T2.12): mandatory.
4. Phase 3 brief (T3.1 noise floor): mandatory.
5. Calibration certificate generated.
6. Burn-in 4 hours minimum (subset of Phase 6).

**Time budget per unit** (production line): ~2 hours QC + 4 hours burn-in (parallel).

## Troubleshooting

Common issues и their resolutions, organized by symptom.

### No power on (idle current zero or extremely high)

**Symptom**: at power-on, no LED activity, ICs не powered.

**Diagnosis**:
1. Check J_PWR connection — Eurorack ribbon orientation correct?
2. Measure ±12V at IDC connector — present?
3. Check 1N5817 reverse protection — possibly shorted (failed mode).

**Common causes**:
- Reversed power cable (red stripe wrong side).
- Shorted decoupling capacitor (X7R failure rare but possible).
- Reversed electrolytic explodes — visual inspection.

**Fix**: replace shorted component, verify polarity, retry.

### Idle current draw >150mA

**Symptom**: power on but high current draw.

**Diagnosis**:
1. Measure current per rail (insert ammeter).
2. Check IC temperatures с finger touch — hot IC = problem.
3. DMM шорт-test specific zones.

**Common causes**:
- IC inserted backwards (pin 1 reversed).
- Solder bridge between IC pins.
- LM13700 incorrectly biased (Iabc shorted).

**Fix**: fix wiring, replace IC if damaged.

### No audio output

**Symptom**: power OK, but silence на J_OUT_L.

**Diagnosis**:
1. Probe BUF_OUT (after U1A) — input present?
2. If yes, probe through chain: PE_OUT → CLIP_NODE → VCA_BUF_OUT → MIX → J_OUT.
3. Find где signal disappears.

**Common causes**:
- Bad solder joint в signal path.
- IC failure (replace if BUF_OUT silent при present input).
- DRY_SEND pot issue (wiper dirty).

**Fix**: trace signal, identify bad junction.

### Hum 50/60Hz

**Symptom**: audible mains hum в output.

**Diagnosis**:
1. Listen с input shorted vs не shorted — is hum dependent on input?
2. Probe AGND vs DGND difference voltage.
3. Inspect physical layout для ground loops.

**Common causes**:
- Ground loop через chassis / shared PSU.
- Star-ground point not properly tied.
- Power supply ripple bleed-through.

**Fix**:
- Verify single-point ground at J_PWR.
- Add LC filter post-DC-DC (TMR 3-1212WI / RKD-1212-D в pedal version) — снимает ~150кГц switching residue.
- Check PCB für AGND/DGND breaks.

### Click / pop при solenoid activation

**Symptom**: every time CV_DAMP активирует solenoid → click в audio output.

**Diagnosis**:
1. Probe piezo preamp output during solenoid pulse.
2. Click present? → EMI coupling.
3. Click absent? → mechanical thump from solenoid hitting plate, normal.

**Common causes (electrical)**:
- Mini-XLR not properly shielded (shield not connected).
- Cartridge cable too long without shielding.
- D_SOL flyback диод incorrect orientation (reversed).

**Fix**:
- Verify mini-XLR pin 1 = shield, connected to AGND on module side only.
- Add ferrite bead на solenoid +12V supply line.
- Replace D_SOL if reversed.

### Self-oscillation runaway

**Symptom**: high RV_FEEDBACK → uncontrollable oscillation, no decay.

**Diagnosis**:
1. Cartridge material? High Q (titanium, spring steel) → expected.
2. Oak / wood cartridge → unexpected, check loop.

**Common causes**:
- Loop gain too high (R_FS3 47k normal — change to 33k if oscillation).
- D_LIM diodes missing or reversed.
- SPICE simulation never done — true root cause unknown.

**Fix**:
- Verify D_LIM1, D_LIM2 в parallel и opposite polarity.
- Add notch filter in feedback path (если specific freq oscillates).
- Reduce R_FS3 от 47k к 33k.

### Solenoid не activates

**Symptom**: CV applied, no click from solenoid.

**Diagnosis**:
1. Measure gate voltage on Q5 при CV 5V — should be ~3.4V.
2. Measure solenoid coil resistance (should be ~10–30Ω).
3. Verify D_SOL flyback installed correctly.

**Common causes**:
- R_DAM1 still 100kΩ (not 47kΩ as revised). Gate voltage too low.
- 2N7000 has high Vth specimen (>3V).
- Solenoid coil burned out.
- Cartridge не connected (no solenoid coil presence).

**Fix**:
- Replace R_DAM1 → 47kΩ.
- Replace Q5 если Vth too high (test specimen).
- Verify cartridge connection.

### One channel dead (стерео)

**Symptom**: J_OUT_L работает, J_OUT_R silent (или vice versa).

**Diagnosis**:
1. Probe PREAMP_A_OUT и PREAMP_B_OUT — both signals present?
2. If one silent → JFET preamp failure.

**Common causes**:
- LSK489A damaged (one channel of dual JFET).
- Bad piezo соединение (solder cold joint).
- Mini-XLR cable break (shielded coax internal break).

**Fix**:
- Test piezo с DMM (should give millivolts when tapped).
- Replace LSK489A.
- Replace cartridge cable.

### Distortion на line-level signal

**Symptom**: clean input → distorted output.

**Diagnosis**:
1. Watch CLIP LEDs (D1-D6) — lit?
2. If yes, signal exceeds clip threshold.
3. Check input level meter — too hot?

**Common causes**:
- Single LED installed instead of 3-in-series (clip threshold too low).
- Push-pull biasing diodes missing → crossover distortion.
- BD139/BD140 thermal runaway.

**Fix**:
- Replace D1-D6 с 3 LEDs in series each direction.
- Install bias diodes в push-pull.
- Add thermal pads to BD transistors.

### Hiss above noise floor target

**Symptom**: noise floor higher than -85 dBV (budget) or -95 dBV (premium).

**Diagnosis**:
1. Spectrum analysis — broadband or specific tones?
2. Test с input shorted vs floating.
3. Inspect JFET preamp area для guard ring integrity.

**Common causes**:
- Mini-XLR shield not connected.
- JFET LSK489A defective или wrong replacement (not LSK489 specifically).
- Power supply noise bleeding through.

**Fix**:
- Verify cable shielding integrity.
- Test LSK489A с continuity meter.
- Add additional 10µF ceramic decoupling near LM13700.

### Wood cartridge sounds "thin"

**Symptom**: oak cartridge sounds tinny, no body.

**Diagnosis**:
1. Visual: plate intact, exciter mounted properly?
2. Tap test on plate — does plate ring with full body sound?

**Common causes**:
- Exciter detached от plate (epoxy failed) — only thin sound from imperfect coupling.
- Plate cracked.
- Exciter shorted (full power not transferring).

**Fix**:
- Re-mount exciter with M3 bolt + rubber gasket.
- Replace plate если cracked.
- Test exciter resistance (~4Ω) с DMM.

## Sourcing & supply chain

### Critical components (sole или dual source)

| Part | Primary source | Backup | Lead time | Notes |
|------|---------------|--------|-----------|-------|
| **LSK489A** | Linear Integrated Systems (LIS) via Mouser | 2SK209 GR (Toshiba) — different footprint | 2-4 weeks | Core noise component. Order buffer stock 50+. |
| **DAEX25FHE-4** | Dayton Audio (Parts Express) | Visaton FRS 5X (alt geometry) | 1-2 weeks | Often in stock, sometimes backorder. |
| **DAEX32Q-4** | Dayton Audio | Visaton EX 60 S | 1-2 weeks | Premium-tier exciter. |
| **Switchcraft TA3M / TA3F** | Mouser, Digi-Key | Rean NYS321/322 (lower cost) | 1 week | Standard mini-XLR. |
| **Alpha RV09 9mm** | Thonk, SmallBear, eBay | Bourns 16mm (different footprint) | 2-4 weeks | Eurorack standard. Order in bulk. |
| **TRACO TMR 3-1212WI** | Mouser, Digi-Key | Recom RKD-1212-D, Mornsun 1212S-1WR3 | 2-3 weeks | **Pedal SKU only**. Isolated DC-DC ±12V. |
| **Recom RKD-1212-D** | Mouser, Digi-Key | TRACO TMR 3-1212WI (lower cost) | 2-3 weeks | **Pedal premium SKU**. Higher current 250mA. |
<!-- BBD V3207/V3102 removed per Decision 08 — vinyl FX moved to Last Day as OLD VINYL PT2399 parallel tract. -->
| **NE555P** ×2 | TI, multi-source | LMC555 (CMOS variant) | 1 week | TOLL pulse monostable (Block 14) + vinyl-skip one-shot (Block 16 Shape Form path 4). |
| **ATtiny85-20PU** | Microchip via Mouser/Digi-Key | ATtiny45 (lower memory) | 1 week | Geiger LFSR + crush clock + tap-tempo. |
| **CD4066BE** | TI, NXP. Multi-source. | DG412 (premium audio switch) | 1 week | Gate cell + bypass switching. |
| **LF398N** | TI. Multi-source. | LF198 (industrial grade) | 1 week | Crush sample-hold cell. |
| **3PDT footswitch** | Tayda, SmallBear, Mouser | DPDT (downgrade — no LED indicator) | 1-2 weeks | 4× per pedal SKU. |

### Standard components (multi-source)

| Part | Sources |
|------|---------|
| TL072CP, TL074CN | TI, ON Semi, JRC. Mouser, Digi-Key, LCSC. |
| LM13700N | TI direct. Mouser, Digi-Key. |
| BD139 / BD140 | ON Semi, ST Micro. Multi-source. |
| 2N7000 | Multiple, $0.10–0.25 каждый. |
| BZX55C9V1 | Vishay, ON Semi. Multi-source. |
| 1N4148, 1N4001, 1N5817 | Universal, $0.01–0.05 каждый. |
| Ceramic / film capacitors | Murata, TDK, Wima — все доступны. |
| Resistors | Yageo, Vishay — universal. |
| LED Red 3мм | Multi-source. Verify Vf 1.8V (typical, sometimes variants 2.0V). |

### Cartridge materials sourcing

#### Wood (oak, maple, ebony)

- Local carpenter or instrument-making lumber yard.
- **Sample order первым делом**: 10× pieces oak 100×40×4мм с linseed oil finish.
- Dimensional tolerance: ±0.5мм acceptable.
- Lead time: 2-4 weeks for first batch.
- Cost: $5-8 per piece для oak, $15-20 для ebony.

#### Stone (marble, slate, granite)

- Stone supplier (local kitchen counter shop).
- Cut + polish 100×50×5мм marble: $25-35 per piece.
- Order 10+ для batch discount.
- Heavy shipping cost — local sourcing preferred.

#### Metal (brass, spring steel, copper, titanium)

- **Brass / copper**: metal supply distributor. Sheet stock cut к size.
- **Spring steel**: spring manufacturer (Lee Spring, Smalley) — pre-cut blanks.
- **Titanium**: aerospace-grade supplier (Online Metals). Premium price ($30-50/piece).

#### Glass (Pyrex)

- Laboratory glass supplier (specifies Pyrex / borosilicate).
- Cut to 100×40×3мм specification.
- Edge polishing recommended (prevents micro-cracks).
- Lead time 4-6 weeks (custom cut).

#### Bone

- Cattle bone suppliers (food industry byproduct, ethical).
- Scapula or rib bone, dried, polished.
- Specialty supplier — sometimes from artisan craft markets.

### PCB sourcing

| Vendor | 2-layer 5pcs | 4-layer 5pcs | Lead time |
|--------|--------------|--------------|-----------|
| **JLCPCB** (China) | $5-15 | $30-50 | 1-2 weeks (incl. shipping) |
| **PCBWay** (China) | $10-20 | $40-60 | 1-2 weeks |
| **OSH Park** (US) | $25-40 | $80-120 | 2-3 weeks |
| **Aisler** (EU) | €20-30 | €60-90 | 1 week (EU) |

**Recommendation**: JLCPCB для prototype, PCBWay для production batch (better quality control).

### Stencil (для SMD)

LSK489A SMD requires solder paste application:
- Stencil $15-25 from JLCPCB (with PCB order).
- Manual application с syringe possible но slower.

### Bulk pricing tiers

При production scaling:

| Quantity | Discount estimate |
|----------|-------------------|
| 1-10 (DIY) | Retail price |
| 10-50 | -10-15% (small batch order) |
| 50-100 | -20-25% (medium batch) |
| 100+ | -30-40% (volume pricing, requires distributor account) |

### Inventory recommendations

For 50-unit Phase 1 production:
- **LSK489A**: order 60 pieces (10% spare).
- **DAEX25FHE-4**: order 60 (per cartridge — separate inventory).
- **BD139, BD140**: 60 each.
- **Mini-XLR pairs**: 60 (1 pair per module + spares).
- **Pots**: 60×10 = 600 pots.
- **Other passives**: 100-200% buffer (resistors, caps cheap).

**Total inventory cost для 50-unit run**: ~$5,000-7,000.

### Cartridge production batch

For 50 cartridges (mixed catalog):
- 12× oak (24%): $180 (carpenter).
- 12× maple (24%): $200 (specialty wood).
- 8× marble (16%): $280 (stone shop).
- 10× brass (20%): $350 (metal supplier).
- 5× spring steel (10%): $80 (spring manuf.).
- 3× titanium (6%): $120 (premium).

Total raw materials: ~$1,200 для 50 cartridges (~$24/unit average).
Plus exciters, piezos, frames, packaging: +$30/unit.
**Total per cartridge BOM**: ~$54-95 depending material.

## Производственные batch processes

Optimized workflow для small batch (10-50 units) Phase 1 production.

### Pre-production checklist

1. **Schematic locked**: все revisions applied (см. fix list).
2. **PCB design final**: ERC + DRC pass, gerbers ready.
3. **BOM verified**: pricing checked, lead times confirmed.
4. **Cartridge designs ready**: at least 6 first-batch cartridges specified.
5. **Test fixtures built**: power tester, audio test rig, calibration jig.
6. **Documentation ready**: assembly guide, calibration procedure, QC sheet template.

### 50-unit batch workflow

#### Day 1-3: Component intake

- Receive PCB shipment (5pc × 10 batches = 50 units).
- Receive component shipment (incl. LSK489A buffer stock).
- Inspect parcels для damage.
- Inventory count vs BOM.
- Sort into per-unit kits (small bags or trays).

#### Day 4-10: PCB assembly (5 PCBs / day, 10 days)

- **Day 4**: SMD work (LSK489A solder paste + stencil + reflow). 5 PCBs.
- **Day 5-9**: THT components — 5 PCBs/day, ~2.5 hours per PCB.
- **Day 10**: Catch-up day for any rework needed.

**Tools**:
- Reflow oven (T-962A or upgrade) — $200-400.
- Hot air rework station — $100-200.
- Soldering iron 350°C, fume extractor.
- Component dispensers (resistor / cap reels).

#### Day 11-12: Power test + calibration

- Per-unit power-on test (Phase 1 in testing protocol).
- Per-unit calibration (R_SA bias, etc.).
- 5 units per hour достижимо after first 10 как routine.
- Generate calibration certificates.

#### Day 13-15: Burn-in + QC

- 24-hour burn-in test для каждого unit (parallel — multiple units in parallel).
- Phase 2-3 testing per unit.
- Identify any units failing → rework queue.

#### Day 16-18: Cartridge production (parallel с burn-in)

- 50 cartridges (mixed: 15 oak, 10 maple, 8 marble, 10 brass, 5 spring steel, 2 special).
- Frame 3D printing: 50 frames × 2 hours each = 100 hours, 5 print farm может finish in 20 hours.
- Plate finishing (sand, oil/shellac).
- Exciter / piezo bonding.
- Cable wiring + connector soldering.
- Packaging.

#### Day 19-20: Final assembly + packaging

- Insert cartridges (one default oak per module).
- Final inspection.
- Pack: foam, manual card, calibration cert, warranty card, branded box.
- Label с serial #.

#### Day 21+: Shipping

- Domestic: 3-5 days.
- International: 1-3 weeks.

### Total timeline для 50-unit batch

**~21 working days** (4 weeks) от parts arrival к first ship.

Solo / part-time effort: 8-12 weeks (working part-time).

### Quality control gates

- **PCB Gate**: visual + DMM short-test → reject если short found.
- **Power Gate**: idle current >100mA → reject, debug.
- **Calibration Gate**: cannot calibrate JFET bias → swap LSK489A.
- **Audio Gate**: noise floor >-80 dBV → debug routing.
- **Burn-in Gate**: drift >10% over 24h → reject, investigate.
- **Final Gate**: cosmetic check, packaging integrity.

**Acceptable failure rate**: <5% (should be <1% после first batch experience).

### Production tools investment

For 50-unit batch:
- Reflow oven: $400.
- Hot air station: $150.
- Bench PSU ±12V: $200.
- Multimeter (precision): $150.
- Oscilloscope (basic 100MHz): $400.
- Audio interface для testing: $200.
- ESD mat + strap: $50.
- Component storage cabinet: $150.

**Total tools**: ~$1,700 one-time investment. Reuses across all future batches.

### Profitability snapshot (50-unit Phase 1, 40HP flagship pricing)

**Revenue**:
- 50 modules × $550 retail (premium SKU) = $27,500.
- Or 50 × $450 budget = $22,500.
- + 50 default cartridges (oak) × $80 = $4,000.
- **Gross**: $26,500–31,500.

**Costs**:
- BOM (50 units × $95 average для 40HP): $4,750.
- Cartridges (50 × $50): $2,500.
- PCBs (50 × $6 budget или $30 premium): $300–1,500.
- Labor (assembly): $0 (DIY) или $1,500 (contractor).
- Shipping + packaging: $1,000.
- **Total**: $8,550-11,250.

**Net margin**: $17,000-20,000 (60-65% net).

**Per-unit profit**: $340-400.

Sufficient для Phase 2 R&D funding и cushion.

### Scaling beyond 50 units

При 100+ unit batches:
- Consider contract assembly house (CM) for PCB pick-and-place.
- Bulk order discounts kick in (-20-25%).
- Marketing scale: hire VA для customer support.
- Distribution: approach Schneidersladen, Control, Perfect Circuit.

### Lessons learned (template for batch retrospectives)

После каждого batch fill in:

| Question | Answer |
|----------|--------|
| Failure rate | x% |
| Most common defect | (e.g., cold solder joint X) |
| Time over budget | x hours |
| Process improvement next batch | (e.g., add stencil for THT) |
| Customer feedback | (e.g., "need more cartridges") |

---

## Conclusion

Last Night v2.2 — production-ready после applying 15 fixes из `audit/fixes/01_last_night_fix_list.md`.

Single-unit DIY build: ~6 hours first time, ~2.5 hours experienced.

50-unit batch: ~21 working days с standard small-batch DIY tooling.

Per-unit BOM $83-112 (40HP), retail $450-550, gross margin 80%, net margin 60-65%.

**Roadmap**: Phase 1 ship 50 units → validate market → Phase 2 starts Last Day R&D.

---

*Last Night v2.2 — physical resonance, not algorithmic decay.*

> Production-ready production document.
> Source: `audit/wood_reverb_logical_schematic.html` + `audit/10_last_night_engineering.md` + `fixes/`.
