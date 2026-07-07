# LAST NIGHT — Документация сборки и производства

> Production-ready документация: схемы, BOM, PCB layout, последовательность сборки, тестирование, troubleshooting.

> **Версия**: v6.5 (= v6.4 improvements pass + Decision 11 plate-only cartridge lock).
>
> **v6.5 changes (vs v6.4)**:
> - 🔴 **Decision 11 LOCKED** — картридж = пассивная пластина (материал + покрытие + рамка + retention магниты + keying). Все трансдьюсеры (exciter / 2× пьезо / соленоид) **постоянно в модуле** (transducer engine bay, spring-loaded contact coupling). Cartridge BOM пересчитан как passive (~$17), transducer engine ($32) перенесён в module BOM. Razor-blade модель восстановлена.
> - 🔴 Swappable mini-XLR / JST к картриджу **устранены** — пьезо разведён module-internal коротким shielded проводом к JFET (ниже noise floor).
> - 🔴 Refined per-material plate dims — длина 100мм const, ширина 35–55мм per material, толщина per durability (oak 100×45×1.8, glass 100×40×1.5, bone 100×35×2.5 и т.д., см. `acoustic_modeling.md §3/§10`). Старый константный 100×40×4 / 100×53 superseded.
>
> **v6.4 improvements (vs v6.3)**:
> - Block 13: self-oscillation output limiter (safety) + bypass trails option (reverb UX, default trails mode).
> - Block 1: power-on/off muting (anti-thump, ~200ms).
> - Block 6 area: CV input protection (1k series + BAT85 clamps на 22 CV jacks).
> - Transducer coupling spec + plate coatings → `acoustic_modeling.md` §7A/7B.
> - Cartridge mis-insertion keying → `PCB_DESIGN_SPEC.md` §6.1.
> - Calibration → `calibration_procedure.md` (12-step).
> - BOM impact: ~$5/unit (relay + OTA-limiter passives + mute circuit + 22× CV clamps).
> 
> **v6.3 audit changes (vs v6.2)**:
> - 🔴 Solenoid power split — pulls от +12V_RAW pre-DC-DC (audio rail no longer sags на TOLL pulse).
> - 🔴 MCU upgrade ATtiny85 → **ATtiny84A** (14-pin DIP) — v6.2 features require 9+ GPIO, ATtiny85 only 5.
> - 🟡 LM393 reallocation — Block 11 env→trigger uses Block 18 U_COMP unused second half (originally tagged "tap detection" но TAP routes к MCU PCINT directly).
> - 🟡 U4C double-allocation resolved — Block 9 de-emphasis moved к U2C, Block 7 keeps U4C exclusively.
> - 🟡 RV_TRIG_THRESH 100k trim added — adjustable FG trigger sensitivity (Block 11 → Block 16).
> - 🔵 ~~RV_TOLL_DUR 22-100k trim added — 5-22ms TOLL pulse adjustable per cartridge material (Block 14).~~ **Superseded**: физревью показало, что duration ≠ сила удара (это степень демпфирования; и арифметика была битой — 220нФ давало 36мс, не 5-22). Block 14 переписан: fixed 4.4мс escapement, трим удалён.
> - Production verification protocol expanded — SPICE Nyquist, blind A/B tests, thermal endurance (see `HANDOFF_BRIEF.md` §6).
> 
> **Прежняя версия (v5.0)**: Versus v4: фронтенд возвращается к mockup canon — две ручки NOISE + COLOR(geiger) (вместо одного bipolar knob); footswitches TAP/GATE-CRUSH/BYPASS/FREEZE; phaser always-on; v6 update — discrete Shape Form slider удалён, заменён на analog function generator (3 sliders rise/fall/depth + exp/log + speed/range knobs) с continuous waveform morphing и 4 outputs (EG/Gate/Sub÷2/Inv). Electrical Decision 08 находки сохраняются: shared noise generator (zener + LFSR), solenoid triple-function (DAMP + TOLL + STALL). Gate/Crush блок 18 восстановлен как footswitch destruction effect.

**Версия**: v6.5 (post-audit, post-decisions, Decision 11 plate-only cartridge)
**Source schematic**: `../00_series/audit/wood_reverb_logical_schematic.html` (canonical 14-section reference)
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
- **Блок 16**: always-on phaser (4-stage OTA all-pass) + **analog function generator** (rise/fall/depth + exp/log + speed/range + 4 outputs).
- **Блок 17**: REMOVED (was BBD vinyl wow → переехал в Last Day как OLD VINYL PT2399).
- **Блок 18**: Gate/Crush footswitch (CD4066 + LF398 + LM393, restored per Decision 09 v5 hybrid).
- **Блок 19**: Isolated DC-DC (pedal SKU only — TRACO TMR 3-1222WI / Recom RxxD-1212 (verify dual ±12V P/N)).
- **Блок 20**: Bank Mode preset slider (4P5T detailed schematic).
- **Блоки 21–25**: Phase 2 cold palette upgrade kit (PULSE / FOG / FROST / CHILL / HUM).

Каждый блок документируется в стиле каркаса `../00_series/audit/wood_reverb_logical_schematic.html`.

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

  +5V LDO (для ATtiny84A + LEDs):
  +12V ──► 7805 → +5V (50мА)
```

Power budget Eurorack:
- Audio analog: 150мА steady (TL072×2 + TL074×2 + 2×LM13700 + LSK489A).
- Driver amp: 100мА average.
- Solenoid pulse: 300мА peak (intermittent).
- ATtiny84A + LEDs: 50мА.
- Phaser + vinyl modulation circuits: 50мА.
- **Total**: ~250мА steady, ~500мА peak.

#### Pedal SKU — 12V DC + isolated DC-DC (NEW)

Modern complex-pedal standard: 12V DC supply (Strymon, Eventide, Meris, Chase Bliss). Это **same as Eurorack ±12V** после isolated DC-DC conversion → identical audio headroom между обеими SKU.

```
  12V DC jack (center-negative) ──► D_P1 (1N5817 reverse protection)
                                          │
                                          ▼
                                       +12V_RAW bus ──┬── 7805 LDO ──► +5V (digital + MCU)
                                                      │
                                                      ├── SOLENOID DRIVER (Block 14)
                                                      │    direct supply — high-current pulse path,
                                                      │    bypasses isolated DC-DC barrier
                                                      │
                                                      ▼
                                              TRACO TMR 3-1222WI
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

  ⚠ Power routing rules:
  - +12V_audio = ONLY analog signal-processing ICs (op-amps, OTAs, comparators)
  - +12V_RAW   = solenoid driver (Block 14), LDO для digital +5V
  - GND_audio  = isolated barrier; GND_pedal-board = chassis side
  - Solenoid 290mA switching transients stay outside isolated audio supply
    → audio rail не сагает на TOLL/STALL events

  Decoupling: 100nF per IC + 10µF на LM13700/MCU (same as Eurorack).

  External: 12V DC center-negative, 800мА min, regulated.
  Compatible: Voodoo Lab Pedal Power 4×4 (12V outputs), Cioks DC7/DC10,
              Eventide PowerMax, Strymon Zuma R300, MXR ISO-Brick (18V port).
```

#### Power-on/off muting (anti-thump) **[NEW v6.4]**

При power up/down ±12V rails settle несинхронно → DC step → thump в динамик. Muting circuit держит output muted ~200ms после стабилизации rails.

```
  +5V_digital (LDO output, settles last) ──► R_MUTE 100k ──┬──► C_MUTE 10µF ──► GND
                                                            │
                                                            ▼
                                              Comparator (LM393 spare half)
                                              threshold +3V
                                                            │
                                              Output LOW until C_MUTE charges >3V (~200ms)
                                                            │
                                                            ▼
                                              Q_MUTE 2N7000 — shunts output к GND
                                              while muting active
                                                            │
                                              Output J_OUT held к GND during power transition
  
  Power-up: rails settle → +5V rises → C_MUTE charges 200ms → mute releases → audio passes.
  Power-down: +5V collapses fast → comparator flips → mute engages before rails ring → no thump.
```

**Components**: R_MUTE 100k + C_MUTE 10µF + Q_MUTE 2N7000 + LM393 half (shared). **BOM: $0.30**.

| Part | Output | Current | Cost | Notes |
|------|--------|---------|------|-------|
| **TRACO TMR 3-1222WI** | ±12V | 125mA | $13 | **Recommended budget** — 3W class. |
| **Recom RxxD-1212 (verify dual ±12V P/N)** | ±12V | 250mA | $22 | Premium SKU — больше тока, audio-friendly noise specs. |
| TRACO TMA1212D | ±12V | 83mA | $15 | **Insufficient** для full power budget — не использовать. |
| RECOM RKE-0905D | ±5V | 100mA | $8 | Если accept reduced headroom (+5 dBu max). |

**Recommend**: **TRACO TMR 3-1222WI** budget SKU, **Recom RxxD-1212 (verify dual ±12V P/N)** premium SKU. Both isolated → break ground loops с другими pedals на pedalboard.

**Power budget Pedal** (segregated по supply rail):

| Rail | Source | Steady | Peak | Notes |
|------|--------|--------|------|-------|
| **+12V_audio** (DC-DC output) | TRACO TMR 3-1222WI 125mA / Recom RxxD-1212 (verify dual ±12V P/N) 250mA | 80mA | 120mA | Audio op-amps + OTAs + FG. Comfortable margin на TRACO. |
| **−12V_audio** (DC-DC output) | (same DC-DC) | 50mA | 80mA | OP-amps negative rail. |
| **+5V_digital** (LDO output) | 7805 от +12V_RAW | 40mA | 60mA | ATtiny84A + LEDs + LM393. |
| **+12V_RAW** (input direct, pre-DC-DC) | external PSU | — | **290mA peak (solenoid TOLL pulse)** | Solenoid driver direct. Intermittent. |

- **External PSU requirement**: 12V DC center-negative, **800mA min** (был 500mA — увеличен для solenoid headroom + DC-DC inefficiency).
- **Solenoid isolated from audio supply** — критичный fix vs v6.0 (где TOLL transient просаживал audio rail).

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

### Block 5. Feedback Summing + Freeze (U4A — TL074) **[REVISED v6.1 — FREEZE_CV input]**

```
                                      R_FS3 (47kΩ)
                                ┌──────┤├────────────────────┐
                                │    D_LIM1 (1N4148)          │
                                │   ──►|◄──                   │
                                │    D_LIM2 (1N4148)          │
                                │    D_LIM2 (1N4148)          │
       SW_FREEZE_FS              │   ──◄|►──                   │
     (footswitch state)          │                             │
            │                    │                             │
            ▼                    │    ┌────────────┐  │
   ┌─── OR gate ───┐──────► R_FREEZE_GATE ─► to switch control mux
   │  (diode-OR)    │
   │  via Q_FZ      │
   │  2N3904        │
   └──────▲─────────┘
          │
          │  Schmitt threshold ~1.5V (R_FZ_DIV 22k/22k divider)
          │
   J_FREEZE_CV ──► R_FZ_IN 10k ──► Q_FZ base (+5V threshold)
                                        │
                                        Q_FZ_E → GND
                                        Q_FZ_C → pulled up via R_FZ_PU 10k к +5V
                                                  → HIGH when CV > 0.7V на base
                                                  → wired-OR с footswitch state
   
   Combined gate → controls 4066 CMOS switch in feedback path:
     LOW  = NORMAL (input passes through R_FS1)
     HIGH = FREEZE (input disconnected, feedback only)
   
                                                │
  DRV_SEND ─► R_FS1 (47kΩ) ─► [CMOS switch]    │    ┌────────────┐
                                                ├───►│(-)  U4A    │──── FB_OUT
                                                │    │  TL074     │       │
  WET_FB ── RV_FEEDBACK ── R_FS2 (47kΩ) ───────┘    │(+)         │       │
            (100kΩ log)                              └─────┬──────┘       └──► to Driver Amp
                                                     R_FS4 (47kΩ)            (Block 4 input)
                                                          │
                                                         GND

  FREEZE behaviour (OR-logic):
  - SW_FREEZE_FS HIGH (footswitch latched)    → FREEZE active
  - J_FREEZE_CV HIGH (CV gate > 0.7V на Q_FZ) → FREEZE active
  - Both LOW                                  → NORMAL (signal pass-through)
  
  Use cases:
  - Footswitch only: classic latching freeze gesture (mockup canon).
  - CV-only: sequencer/LFO gates → rhythmic stutter freezes.
  - Combined: footswitch holds base freeze, CV gates retrigger / modulate.
  
  D_LIM1/D_LIM2: clamp feedback to ±0.7V on virtual ground (soft limiter).

  [VERIFICATION REQUIRED]: SPICE Nyquist analysis с RLC modelью пластины
  (R=1Ω, L=10mH, C=1µF для ~1.6кГц resonance) — verify Nyquist gain margin > 6dB,
  phase margin > 45° на feedback maximum. Test для high-Q materials (Q=1000 spring steel).
```

**FREEZE_CV BOM additions** (v6.1):
| Ref | Value | Function |
|-----|-------|----------|
| Q_FZ | 2N3904 NPN BJT TO-92 | CV→gate transistor switch |
| R_FZ_IN | 10kΩ 1% MF | CV input current limit |
| R_FZ_DIV | 22kΩ ×2 1% MF | Schmitt threshold divider к +5V |
| R_FZ_PU | 10kΩ 1% MF | Q_FZ collector pull-up к +5V |
| J_FREEZE_CV | 3.5mm panel jack | CV input |

**BOM Block 5 add**: $0.04 (BJT + resistors) + $0.40 (jack) = **$0.44**.

CMOS switch (4066 element) уже выделен в Block 18 BOM (one of 4 elements used для bypass mux). Reuses 4th remaining 4066 element для FREEZE switching path — no new IC needed.

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

### CV input protection (all CV jacks) **[NEW v6.4 — modular safety]**

Eurorack CV может быть ±12V (или выше с mispatching). Все CV inputs (rise/fall/depth/speed/tone/feedback/position/boost/mix/output/noise/color/attack/decay/gate/IN/clock/TOLL/STALL/SIDE/FREEZE) получают protection network:

```
  J_CV_xxx ──► R_CVP 1kΩ (series current limit) ──┬──► to circuit input
                                                   │
                                          ┌────────┼────────┐
                                          │        │        │
                                    D_CVP_H      (node)   D_CVP_L
                                    BAT85          │       BAT85
                                    к +12V       к input   к -12V
                                    (clamp high)           (clamp low)
  
  Over-voltage > +12V → D_CVP_H conducts → clamped к +12V + 0.3V (Schottky Vf)
  Under-voltage < -12V → D_CVP_L conducts → clamped к -12V − 0.3V
  Normal CV range (±10V Eurorack standard) → diodes off, transparent.
```

**Components per CV jack**: R_CVP 1kΩ + 2× BAT85 Schottky. **22 CV jacks × $0.07 = $1.54 total**. Cheap insurance против modular mispatching damage.

> Schottky (BAT85) выбран вместо 1N4148 — lower Vf (0.3V vs 0.65V) → tighter clamp, faster. Audio CV bandwidth не страдает (1k series + few pF junction cap = corner >1MHz).

### Block 7. Dual Piezo Preamp (Q3 LSK489A + U3B/U4C) **[REVISED]**

```
  Piezo pickup — module-side contact pin (Decision 11, no swappable connector):

  Piezo A (27mm disc, spring contact pin к back пластины) ──► short shielded
              wire (<50mm) ──► AGND shield single-point ──► Module piezo preamp

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
- **Piezo module-side** (Decision 11) — contact pins к пластине, разведены коротким shielded проводом к JFET. **Нет swappable mini-XLR** (hi-Z не пересекает разъём → ниже noise floor).
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

### Block 9. De-Emphasis EQ (U2C — TL074) **[REVISED v6.3 — U4C → U2C re-assignment]**

> **v6.3 op-amp reallocation**: U4C ранее double-allocated (Block 7 piezo preamp + Block 9 de-emphasis). De-emphasis перемещён к U2C (spare U2 TL074 quarter, was unused в v6.2 BOM). Block 7 retains exclusive use of U3B + U4C.

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

#### Envelope→Trigger comparator + external `env` output **[NEW v6.2]**

ENV_CAP voltage (envelope follower DC level) разветвляется:
1. Internal → R_IABC → U5 OTA1 Iabc (VCA control, как раньше).
2. **New external**: ENV_CAP → buffer (TL072 spare half) → J_ENV jack (panel main row 2 pos 10) — envelope follower output для external CV destinations.
3. **New trigger derivation**: ENV_CAP → R_TRIG_DIFF + C_TRIG_DIFF (RC differentiator 10мс) → LM393 second comparator half → trigger pulse on rising edges.

```
   ENV_CAP node ──┬──► R_IABC 10k ──► U5 OTA1 Iabc (internal VCA control)
                  │
                  ├──► U_ENV_BUF (TL072 spare half) ──► R_ENV_OUT 100R ──► J_ENV jack
                  │                                     (envelope follower output,
                  │                                      panel main row 2 pos 10)
                  │
                  ▼
         R_TRIG_DIFF 10k ──► C_TRIG_DIFF 1µF film ──► comparator (+) input
                                                              │
                                                              │   R_TRIG_THRESH 22k → +5V
                                                              │   R_TRIG_GND 22k → GND
                                                              │   (Schmitt threshold +1V)
                                                              ▼
                                                      LM393 second half — outputs:
                                                        HIGH on envelope rising edge
                                                        LOW otherwise
                                                              │
                                                              ▼
                                                      ENV_TRIG signal
                                                              │
                                                  ┌───────────┴──────┐
                                                  ▼                  ▼
                                          Internal normal      External J_TRIG jack
                                          к J_TRIG (Block 16   (switching contact:
                                          FG trigger input)    if external patched →
                                                                breaks internal normal)
```

**RC differentiator** 10k × 1µF = 10мс time constant — captures envelope **rising edges** (audio attack onsets), не sustained level. Sharp attacks trigger FG once per onset; sustained tones не keep re-triggering.

**Components for env→trigger + ext output**:
| Ref | Value | Function |
|-----|-------|----------|
| U_ENV_BUF | TL072 spare half | Envelope buffer |
| R_ENV_OUT | 100Ω 1% | Output protection |
| R_TRIG_DIFF | 10kΩ 1% MF | Differentiator R |
| C_TRIG_DIFF | 1µF MKS2 | Differentiator C |
| **RV_TRIG_THRESH** | 100kΩ trim multi-turn (Bourns 3296W) | **Adjustable Schmitt threshold** (replaces fixed R_TRIG_THRESH/GND divider). Default mid → ~1V threshold. CCW → 0.3V (sensitive, для soft picking / acoustic instruments). CW → 3V (only loud transients trigger). Set-and-forget на сборке per customer preference. |
| LM393 half | **shared с Block 18 U_COMP** (Gate threshold comparator chip — second half originally tagged "tap detection" но TAP уходит к ATtiny84A PCINT directly, поэтому U_COMP OUT2 free). | Edge comparator (env→trigger) |
| J_ENV | 3.5mm panel jack | envelope output |

**BOM add**: $0.30 (passives + jack — LM393 half reused free, TL072 buffer от existing U1/U3 spare half).

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
  ATtiny84A (firmware: LFSR + cluster timing + comparator threshold sweep)
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
- **ATtiny84A-PU**: LFSR + cluster pattern generator (continuous-time output).
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

#### Self-oscillation output limiter **[NEW v6.4 — safety]**

FEEDBACK CW → controlled self-oscillation. Soft-clip D_LIM в feedback loop (Block 5) ограничивает amplitude **внутри петли**, но output может быть очень громким при случайном FEEDBACK CW. Output limiter защищает уши/динамики.

```
  Mix output ──► R_LIM_IN 10k ──┬──► U_LIM (LM13700 OTA spare — U5 OTA2 unused)
                                 │         │
                                 │    VCA gain controlled by:
                                 │         │
                                 │    Envelope detector на output level:
                                 │    D_LIM_DET 1N4148 → C_LIM_DET 4.7µF
                                 │    → threshold comparator (LM393 spare?)
                                 │    → reduces OTA Iabc when output > +6dBu
                                 │         │
                                 ▼         ▼
                          Brick-wall soft limit @ +6dBu (2.5Vrms на ±12V rails)
                                 │
                                 ▼
                          Output buffer → J_OUT
  
  Attack <1ms (fast catch), release ~50ms (musical recovery).
  Below +6dBu: transparent (limiter inactive). Above: gain reduction.
```

**Components**: U_LIM = U5 LM13700 OTA2 (unused в v6.2, reuse). D_LIM_DET 1N4148 + C_LIM_DET 4.7µF + R_LIM passives + threshold от +5V divider. **BOM: $0.30** (OTA free, passives only).

#### Bypass trails (buffered bypass option) **[NEW v6.4 — reverb-critical UX]**

Master BYPASS footswitch имеет **2 режима** (internal jumper J_TRAILS или panel-access toggle):

```
  TRUE BYPASS mode (jumper position 1):
    Relay (Omron G6K-2F) hard-disconnects всю schematic, input→output прямой.
    Хвост обрывается мгновенно. Zero coloration when off. Classic.
  
  TRAILS mode (jumper position 2):
    BYPASS footswitch → mutes DRY path (input dry signal cut) via CD4066,
    но WET path (reverb tail) продолжает decay естественно.
    Input still buffered (no true disconnect).
    Reverb tail доигрывает после bypass press → ambient-friendly.
    
    Implementation:
      Footswitch → CD4066 S_DRY control (mute dry input to mix)
      Wet feedback loop continues until natural decay
      Re-engage: dry path restored, reverb continues building
```

**Why both modes**: reverb pedals universally split on this. True-bypass purists vs ambient players who need trails. Internal jumper (или premium SKU panel toggle) lets user choose. **BOM: $1.50** (relay G6K-2F + CD4066 element shared + jumper).

> **Default ship setting**: TRAILS mode (ambient-friendly). True-bypass via jumper для purists.

### Block 14. Solenoid Driver — Triple-function DAMP + TOLL + STALL **[REWRITTEN — verified strike physics, post adversarial review]**

> **Что изменилось и почему.** Прежняя ревизия трактовала ширину TOLL-импульса как «силу удара» (5–22мс per-material, «нефриту длиннее — более поющий колокол»). Независимое физревью подтвердило: **модель была перевёрнута**. Плунжер пролетает 2мм зазора за ~2–3мс; всё время, которое катушка держится включённой дольше, — это войлок, прижатый к уже звенящей пластине, т.е. **демпфер**, гасящий именно то, что должно петь. Сила удара задаётся **приводом (ток/напряжение) и зазором**, а не шириной импульса. Полный механический разбор: `strike_seating_problem.svg`, `RISK_ASSESSMENT.md` R13 + Stage 0B.
>
> Заодно исправлены три бага прежней ревизии, найденные при переписывании:
> 1. **Арифметика 555 была битой**: «RV 22–100k + C_555 220нФ → 5–22мс» неверно — 1.1 × 150k × 220н = **36мс**, чистое душение даже по старой логике.
> 2. **+12V_RAW → 5V-катушка без ограничения тока**: coil 17Ω на 12V тянул бы ~700мА / 8.5Вт; thermal-таблица при этом считала 5V/290мА — противоречие схемы и расчёта. Добавлен R_SOL (см. 14.2).
> 3. **Диаграмма подписывала соленоид «(cartridge)»** — соленоид постоянно в module engine bay (Decision 11), не в картридже.
>
> Три логических режима без изменений, все **CV-only** (footswitches заняты mockup canon TAP/CRUSH/BYPASS/FREEZE):
> - **DAMP** = sustained pressure modulation (CV envelope → войлок ритмично прижат). Held-режим **штатен** — это и есть демпфер.
> - **TOLL** = bell-strike: короткий escapement-импульс (см. 14.3). Trigger через J_TOLL_TRIG gate (5V).
> - **STALL** = forced full hold (J_STALL_CV +5V sustained → decay stuck at minimum). Held-режим штатен.

#### 14.1 Физика удара (verified)

Ключевое разделение: **роль плунжера выбирается шириной импульса**, сила — приводом.

- **Striker (TOLL)**: импульс ≈ время транзита + ~1мс — плунжер бьёт и немедленно освобождается (escapement, как молоточек пианино / часовой боёк). Пластина звенит свободно.
- **Damper (DAMP/STALL)**: длительное удержание — войлок сидит на пластине. Штатно для DAMP/STALL, фатально для TOLL.

| Параметр | Формула | @ SOFT 3.8V (F≈3N) — v1 default | @ NORMAL 5V (F≈5N) — v2 option |
|----------|---------|--------------------------------|--------------------------------|
| Энергия удара | E = F·d (gap d=2мм) | ~6 мДж | ~10 мДж |
| Скорость плунжера | v = √(2E/m), m≈5г | ~1.55 м/с | ~2.0 м/с |
| Импульс в пластину | I = m·v | ~0.008 Н·с | ~0.010 Н·с |
| Транзит зазора | t = √(2d/(F/m)) | ~2.6 мс | ~2.0 мс |

Caveats (из ревью):
- Сила соленоида **позиционно-зависима** (растёт при закрытии зазора); «константная F» — первый порядок. Порядок величин держится.
- **Масса плунжера m — главный неизвестный рычаг** (v ∝ 1/√m, удар в пластину ∝ m·v; при m=10г вместо 5г unseating-импульс удваивается). **Взвесить на первом образце** — шаг 0 в Stage 0B.
- **Upper bound привода**: войлочный контакт насыщается — выше порога дополнительный привод почти не добавляет громкости колокола, но линейно добавляет unseating-импульс (R13) и износ. Больше ≠ громче.

#### 14.2 Drive design — фиксированный SOFT-привод (v1)

```
  +12V_RAW (pre-DC-DC; +12V Eurorack bus для Eurorack SKU)
    │
    ⚠ Solenoid питается от +12V_RAW, НЕ от +12V audio rail:
      TRACO TMR 3-1222WI даёт 125mA/rail — solenoid load просадил бы audio.
    │
    ├──► R_SOL 36Ω 5W wirewound ──► SOLENOID coil 17Ω (module engine bay)
    │        │                          │ coil видит ~3.8V / ~224mA (SOFT tier)
    │        │                     D_SOL 1N4001 + Z_SOL 12V zener (series) — fast release
    │        │                          │
    │        └── JP_SOL (v2): jumper замыкает часть R_SOL → NORMAL 5V tier
    │                                   │
    │                              Q5 2N7000 drain
    │                              gate ◄── R_GATE 10k ◄── OR-node (diode-OR, 14.4)
    │                              source ── GND (solenoid star ground)
```

**Почему фиксированный SOFT для всех картриджей (v1)** — вердикт физревью, вариант (c):

- Безопасен для fragile-материалов (annealed glass, aluminum) **без механизма определения картриджа** — картридж пассивный (Decision 11), сообщить свой тип он не может.
- Меньше импульс → меньше unseating (R13) — двойная выгода, а не «жертва атаки».
- **Reed-switch auto-keying отклонён**: 4 retention-магнита картриджа рядом с герконом → ложные срабатывания в обе стороны; отказ детекции = полный привод в хрупкую пластину (**fails dangerous**). Механизм, чей fail-mode направлен на разрушение картриджа, не ставим.
- **NORMAL 5V** — v2 опция через JP_SOL (jumper/DIP внутри корпуса), включать только после Stage 0B и только для плит ≥15г (slate, bone, nephrite). Glass/aluminum — never, и в v2.

Бонус R_SOL: τ_LR = L/R_total = 30мГн/53Ω ≈ **0.57мс** (против 1.76мс без R_SOL) — ток и сила устанавливаются быстро внутри окна импульса, удар предсказуемее.

**Solenoid baseline** (Adafruit 412 / JF-0530B class, felt tip, gap 2мм adjustable): coil ~17Ω, L≈30мГн, плунжер ~5г (⚠ взвесить), rated 5V, у нас 3.8V SOFT. Return spring — штатная.

#### 14.3 TOLL — escapement pulse (фиксированный ~4.4мс, trim удалён)

**U_TOLL — NE556** (dual timer; half A = coil pulse, half B = MUTE window, см. 14.5). Оба запускаются одним фронтом J_TOLL_TRIG.

- **Half A (coil)**: monostable R_556A **180kΩ 1%** + C_556A **22нФ C0G** → t = 1.1·R·C ≈ **4.4мс fixed**.
- Правило ширины: pulse ≈ транзит (2.6–3мс @ SOFT) + ~1–1.5мс контакта. **Не** per-material параметр и **не** точка калибровки — RV_TOLL_DUR удалён (см. `calibration_procedure.md` — шаг 7 упразднён).
- Если Stage 0B (взвешенный плунжер, реальная сила) сдвинет транзит — подбирается **один** номинал R_556A на производство (150k→3.6мс … 200k→4.8мс), не трим.

**Per-material поведение — инвертировано против старой таблицы:**

| Материал | Привод v1 | Pulse | Комментарий |
|----------|-----------|-------|-------------|
| **Nephrite** (RT60 ~4с) | SOFT | 4.4мс | **Короткий snappy + мгновенный release.** Старая рекомендация «15–18мс = более поющий» душила бы сильнее всего именно его |
| Spring steel / brass | SOFT | 4.4мс | Sustaining — быстрый release = чистый shimmer |
| Slate / bone | SOFT | 4.4мс | Плотные; кандидаты на NORMAL в v2 (≥15г) |
| Oak / maple | SOFT | 4.4мс | Собственный decay короткий; held pulse ничего не добавлял и раньше |
| Aluminum, annealed glass | SOFT (locked) | 4.4мс | Fragile: NORMAL заблокирован и в v2 (dent / chip) |

**Release speed — flyback против escapement (найдено при переписывании, не было ни в ревью, ни в критике):** обычный flyback 1N4001 замыкает ток катушки на себя → сила спадает с τ = L/R ≈ 1.8мс, т.е. плунжер «доживает» на пластине ещё 2–5мс после gate-off — тихо съедая escapement, ради которого всё затевалось. Фикс: **Z_SOL 12V zener последовательно с D_SOL** — энергия катушки сбрасывается на ~13В, спад тока t ≈ L·I/(V_Z+V_F) ≈ 30м·0.224/13 ≈ **0.5мс**. Q5 drain видит 12V_RAW + 13В ≈ 25В пик — 2N7000 (V_DS max 60В) комфортно.

**Retrigger**: 556 half A неретриггеруемый в течение импульса; spring return плунжера ~10–20мс → музыкальный max rate ~20–30Гц. Выше — удары теряют силу (плунжер не успевает вернуться на полный зазор), это натуральный roll-off, не защита.

#### 14.4 DAMP / STALL + diode-OR (логика без изменений, числа обновлены)

Три пути OR-combined в gate Q5, «highest wins»:

```
  J_CV_DAMP (env CV) ──► R_DAM1 47k ─┬─► D_OR_A ─┐
                          R_DAM3 100k ┴ (pulldown) │
  J_TOLL_TRIG (5V gate) ──► U_556A → 4.4мс ──► D_OR_B ──► OR-node ──► R_GATE 10k ──► Q5 gate
  J_STALL_CV (+5V sust) ─────────────────────► D_OR_C ─┘
```

- **DAMP**: envelope CV → частичное давление войлока → хвост ритмично прижат. Held = intended.
- **STALL**: full hold → decay умирает. STALL+TOLL: TOLL маскируется (войлок уже прижат) — expressive «almost-stuck» при неполном STALL CV. STALL overrides DAMP.

**Thermal @ SOFT 3.8V** (было 5V/290мА — пересчитано):

| Mode | I coil | P_coil | Duty | ΔT steady |
|------|--------|--------|------|-----------|
| DAMP (env, ~60% avg) | ~135мА | ~0.31Вт | 30–50% | +14–23°C — OK |
| TOLL (4.4мс pulse) | 224мА | 0.85Вт peak | <2% | +2°C — negligible |
| STALL continuous | 224мА | 0.85Вт | 100% | **+128°C — FAULT** |

- **STALL по-прежнему thermally unsafe continuous** → PWM-throttle **обязателен** (без изменений): ATtiny84A: 50мс pull-in 100% → hold 40% duty → P_avg ≈ 0.34Вт → coil plateaus ~75°C @ 25°C ambient (граница Class B 80°C — bench verify). NTC 10k thermal cutoff — premium SKU опция (без изменений).
- **R_SOL rating**: @ STALL continuous 1.8Вт, @ PWM-hold ~0.7Вт → 5W wirewound (тот же класс, что R8).
- **Q5**: P = I²·R_DS(on) ≈ 0.224² × 2Ω ≈ 0.1Вт → ΔT ≈ +20°C (TO-92 200°C/W) — комфортно без heatsink.
- **Flyback энергия**: E = ½LI² = ½·30м·0.224² ≈ 0.75мДж — 1N4001 + zener комфортно.
- User doc (SPEC): STALL = «momentary hold, max 5s continuous», дальше hardware throttle (без изменений).

#### 14.5 EMI — click в пьезо на каждый TOLL (capacitive, не индуктивный)

Механизм (по ревью): доминирует **ёмкостная связь drain-узла Q5** (быстрый фронт ~12В→0.5В) в hi-Z пьезо-узел (10МΩ): Q = C_stray·ΔV ≈ (0.5–5пФ)·12В = 6–60пКл на пьезо-ёмкость 10–27нФ → **0.2–6 мВ/фронт** — слышимо на тихом контактном микрофоне. Индуктивный kick гасится flyback+zener; **+12V_RAW split лечит rail sag, но не этот coupling**. RC-snubber полезен вторично (смягчает drain-фронт), основным фиксом быть не может.

**Приоритет фиксов (Phase 1 — все первые три):**

1. **MUTE FET** Q_MUTE 2N7000 — шунт **выхода JFET-преампа** (low-Z точка; hi-Z узел не трогаем — не добавляем ему ёмкости/утечки) через R_MUTE 1k на GND. Окно = **U_556 half B**: R_556B 130k + C_556B 22нФ ≈ **3.1мс от TOLL-триггера**. Логика окна: turn-ON click закрыт в течение **тихого транзита** (плунжер ещё летит, пластина молчит — click был бы голым), unmute ровно к импакту → **акустическая атака колокола сохранена полностью**. Turn-OFF фронт (4.4мс) падает на звенящую во всю пластину — маскируется + смягчён снаббером.
2. **Guard ring / экран** вокруг пьезо-узла и contact-пинов engine bay (класс HIZ_PIEZO в `PCB_DESIGN_SPEC.md` уже требует guard — подтвердить охват пинов bay, не только узла на PCB).
3. **Routing**: solenoid drive — twisted pair, перпендикулярно hi-Z трассам, ≥40мм от Zone 4, ferrite bead на drive у Q5.
4. **R_SNUB 100Ω + C_SNUB 100нФ X7R** поперёк катушки — вторичное смягчение drain-фронта.

DAMP/STALL — медленные CV-события с редкими фронтами; для них достаточно snubber+routing, MUTE не привязывается (иначе рвал бы полезный сигнал при каждом движении envelope).

#### 14.6 Связка с R13 — удар может срывать contact пикапа

Импульс удара 0.008–0.010 Н·с действует на пластину, прижатую к пьезо-пину пружиной всего **~1.5Н** (слабое звено — не 5Н exciter): пик контактной силы 10–20Н превышает preload пина в 7–13×, лёгкие пластины (oak ~6г) получают до ~1.5–2 м/с rigid-body kick (momentum matching с плунжером равной массы). **TOLL может сам провоцировать R1-rattle.** Разбор, диаграмма и bench-протокол: `RISK_ASSESSMENT.md` R13 + Stage 0B, `strike_seating_problem.svg`.

**Block-level требования** (входят в engine bay spec):
- Пьезо-пины крепить к **жёсткому шасси bay**, не к податливой frame-rubber.
- Preload пьезо-пина ревизовать 1.5Н → 3–5Н по результатам Stage 0B (sweep в протоколе).
- SOFT drive default (14.2) — часть той же mitigation.

#### Block 14 BOM (delta от старой ревизии)

| Item | Было | Стало | Δ$ |
|------|------|-------|-----|
| U_TOLL | NE555 | **NE556** (dual: coil pulse + MUTE window) | +$0.20 |
| RV_TOLL_DUR 22–100k trim | был | **удалён** (fixed R_556A 180k 1%) | −$1.50 |
| R_556A 180k / R_556B 130k 1%, C_556A/B 2× 22нФ C0G | C_555 220нФ | заменены | +$0.30 |
| **R_SOL 36Ω 5W wirewound** | — | новый (SOFT tier + защита coil от 12V) | +$0.60 |
| **Z_SOL 12V zener 1.3W** | — | новый (fast release — escapement) | +$0.15 |
| **Q_MUTE 2N7000 + R_MUTE 1k** | — | новый (EMI click mute) | +$0.35 |
| **R_SNUB 100Ω + C_SNUB 100нФ X7R** | — | новый (drain edge) | +$0.20 |
| JP_SOL jumper (v2 NORMAL tier) | — | footprint only | +$0.05 |
| PWM gate path (ATtiny84A + 1N4148), NTC premium | были | без изменений | — |

Net Δ ≈ **+$0.35** и **минус одна точка калибровки** (RV_TOLL_DUR у клиента больше нет — нечего крутить не в ту сторону).

#### Verification (Block 14)

- [ ] **Плунжер взвешен** и записан в паспорт прототипа (m — главный рычаг модели).
- [ ] Coil current scope: TOLL pulse 4.4мс ±10%; **спад тока после gate-off <0.6мс** (Z_SOL release работает; с plain diode было бы 2–5мс).
- [ ] Preamp output scope на одиночный TOLL: нет click до импакта (MUTE window закрывает транзит), нет спайка/дропаута unseating в первые 5мс (R13 / Stage 0B тест 1).
- [ ] **A/B held-vs-escapement**: 4.4мс vs принудительные 20мс на nephrite и steel → короткий pulse даёт **дольше** sustain (слышимое подтверждение инверсии).
- [ ] Subjective loudness @ SOFT 3.8V: bell-strike музыкально достаточен на slate/nephrite (если тихо — сначала gap 2→2.5мм, потом обсуждать NORMAL, не наоборот).
- [ ] STALL 60с: coil <80°C IR (PWM throttle), R_SOL в рамках rating.
- [ ] Retrigger 20Гц: удары равной силы (spring return успевает).
- [ ] DAMP envelope: ритмичное демпфирование без слышимых EMI-фронтов (snubber/routing достаточны без MUTE).

### Block 15. Reserved (was Geiger Pattern, теперь часть Block 12)

> Geiger pattern generator (ATtiny84A LFSR) **полностью описан в Block 12** как часть NOISE+COLOR(geiger) crossfader implementation. Slot 15 зарезервирован для будущих расширений (например, Phase 2 v3 PCB add-ons).

### Block 16. Phaser — 4-stage OTA all-pass (detailed schematic) **[REVISED v5 hybrid]**

> **v6 (post-mockup discussion)**: phaser **always-on named effect** (mockup canon), не optional layer. Bypass через master BYPASS footswitch. Phaser modulation source — **analog function generator** (rise/fall/depth sliders + exp/log + speed/range knobs), waveform output continuously variable от ramps до triangle до saws. FG output также exposed via 4 jacks (EG/Gate/Sub÷2/Inv) для patch-to-anything routing.

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
   LFO output (от analog function generator, см. секцию Analog Function Generator ниже)
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

#### Phase/Flutter knob — continuous feedback intensity morph **[REVISED v6]**

В предыдущей версии RV_PHASE был один параметр среди трёх (PHASE + DEPTH + SPEED + Shape Form slider). В v6 layout — единственный large knob для phaser character.

**Functional behaviour**:
- CCW (0%) — feedback amount = 0 → classic 4-stage all-pass без resonance. Мягкие диффузные notches.
- 50% — moderate feedback (~50%) → distinct resonant peaks на center freq каждой ячейки.
- ~90% — high feedback → liquid character, peaks становятся agressive.
- CW (95%+) — controlled self-oscillation. Pот ограничен 95% максимум через voltage divider, чтобы не уйти в hard runaway.

**Implementation** — single RV_PHASE_FLUTTER 100k log pot **+ CV input (v6.5)**:
```
   Phaser output (sum amp) ──► R_PFB_PRE 10k ──► RV_PHASE_FLUTTER wiper ──┐
                                                                          │
   J_PHFLT_CV ──► R_PFCV 100k ──► summing node ◄────────────────────────┘
   (panel main row 2 pos 11,                  │
    was TRIG — v6.5 swap)                     ▼
                                       R_PFB_LIMIT 5k (in series)
                                              │
                                              ▼
                                      Soft-clip cell: D_PFB1 D_PFB2 1N4148 ×2 anti-parallel
                                      (auto-limits runaway amplitude)
                                              │
                                              ▼
                                      Sum back to cell 1 input bus
   
   Max feedback amount: 95% via R_PFB_LIMIT. CV adds/subtracts feedback intensity
   → envelope/LFO → phaser intensity → evolving resonance, auto-swells к self-osc.
   Auto-limit by anti-parallel diodes (controlled self-oscillation, no hard clip).
```

> **v6.5 panel change**: J_TRIG (external FG trigger) удалён с панели → слот занят **J_PHFLT_CV** (Phase/Flutter CV — закрывает единственный main knob без CV). FG trigger остаётся через **internal normal** от envelope follower (plate-triggered mode) + free-run; external sequencer-trigger жертвуется ради phaser CV (более broadly useful).

#### Analog Function Generator (replaces Shape Form discrete slider) **[NEW v6]**

В v6 layout discrete Shape Form 1P5T slider удалён. Вместо него — **analog function generator с непрерывной формой волны** (Tides-class topology). Sliders rise/fall/depth + knobs exp/log + speed/range = 5 controls для continuous shape morphing.

**Outputs** (см. также CV jack list):
- **EG OUT** (main jack в основном CV bay row 2) — primary waveform, scaled by `depth` slider.
- **Gate_OUT** (extras zone jack) — rise-active gate (HIGH во время rise phase, LOW во время fall).
- **Sub÷2_OUT** (extras zone) — ÷2 rate sub-output (flip-flop divider).
- **Inv_OUT** (extras zone) — inverted main waveform.
- **EOR** (internal) — End-of-Rise trigger, normalled внутри к J_TOLL_TRIG (clever connection: каждый FG peak → solenoid bell strike). Patch any external к J_TOLL_TRIG → breaks internal normal, EOR становится free для других путей через panel-jack tap-off.

**Core topology** — analog integrator с asymmetric rise/fall RC paths:

```
   ┌──── Schmitt comparator (TL074 U_FG_A) ────┐
   │  Output = ±5V square wave                  │
   │  Hysteresis: R_FG_HYS 220k feedback        │
   └────────────┬───────────────────────────────┘
                │
                ▼
   ┌──── Rise/Fall steering ───────────────────────┐
   │                                                 │
   │  Positive square (rise phase):                  │
   │    output → D_FG_R 1N4148 → R_FG_RISE          │
   │      R_FG_RISE = exp converter output (rise    │
   │       time set by `rise` slider via exp conv)   │
   │      → integrator cap C_FG 1µF charges UP      │
   │                                                 │
   │  Negative square (fall phase):                  │
   │    output → D_FG_F 1N4148 (reverse) → R_FG_FALL│
   │      R_FG_FALL = exp converter (fall slider)    │
   │      → C_FG discharges DOWN                     │
   │                                                 │
   │  Curvature shaping (exp/log knob):              │
   │    RV_EXP_LOG modulates current source bias    │
   │    on rise+fall converters simultaneously       │
   │    → linear (mid) / exponential (CW) /          │
   │      logarithmic (CCW) curve shape              │
   └────────────────┬───────────────────────────────┘
                     │
                     ▼
   ┌──── Integrator (TL074 U_FG_B) ──────────────┐
   │  Inverting integrator on C_FG 1µF           │
   │  Output: triangle/saw/exp wave ±5V          │
   │  Range: 0.05 Hz (CCW slow) → 50 Hz (CW fast)│
   │  Range select toggle SW_FG_RANGE swaps C_FG │
   │  for ×10 / ×100 / ×1000 ranges              │
   └─────────────────┬───────────────────────────┘
                      │
                      ▼
   ┌──── Output stage ──────────────────────────┐
   │                                              │
   │  Wave ──► U_FG_C (TL074) buffer             │
   │            │                                 │
   │            ├──► × `depth` slider VCA        │
   │            │     (LM13700 OTA half — shared │
   │            │      with U5 spare half)        │
   │            │     → EG OUT jack               │
   │            │     → also feeds Iabc bus к    │
   │            │       phaser cells (Block 16   │
   │            │       Iabc modulation)          │
   │            │                                 │
   │            ├──► Inverter (U_FG_D TL074)     │
   │            │     → Inv_OUT jack              │
   │            │                                 │
   │            └──► Gate generator (LM393 comp) │
   │                  HIGH during rise phase     │
   │                  → Gate_OUT jack            │
   │                  → flip-flop ÷2 (74HC74)    │
   │                    → Sub÷2_OUT jack         │
   │                                              │
   │  EOR detect (LM393 comp on integrator       │
   │   reaching +threshold): brief pulse        │
   │   → internal normal к J_TOLL_TRIG          │
   │   → breaks when J_TOLL_TRIG patched out    │
   └─────────────────────────────────────────────┘
```

#### Linear → exp current converter (per slider) **[NEW v6]**

Rise/fall sliders feed **analog exp converter** для musical taper:

```
   RV_SLIDER (linear taper) → divides +5V ref to control voltage 0-5V
                                            │
                                            ▼
                                  Q_EXP_PAIR (2× 2N3904 matched pair, common base):
                                    Q1 base = control voltage
                                    Q2 base = ref voltage (1V fixed)
                                    Common emitters → R_EXP 1k → -V
                                    Collector currents = I_REF × exp((V_control - V_ref) / V_T)
                                            │
                                            ▼
                                  Q2 collector = exponentially scaled current
                                            │
                                            ▼
                                  Bias current → R_FG_RISE (or R_FG_FALL)
                                  → integrator slope
```

**Range**: 1ms → 10s rise time = 4 decades, achieved через V_control swing 0-5V → ~1 octave per ~600mV input change.

**Matching**: 2N3904 pair должны быть thermally coupled (heat-shrink или close placement) для temperature stability. Premium SKU: использовать LM394 matched pair ($1.50 vs $0.10) для improved precision.

**BOM per slider**: 2× 2N3904 ($0.04) + R_EXP $0.05 + RV_SLIDER $1.50 = **$1.59 per slider** × 3 sliders = **$4.77** total exp converters.

#### Speed/range knob + clock sync (continuous, no detents) **[NEW v6]**

RV_SPEED — free analog pot. **Free-run mode**:
- ADC mapping (ATtiny84A): RV_SPEED 0-100% → exponential rate 0.05 Hz – 50 Hz (4 decades).
- Range select via secondary effects: SW_FG_RANGE (3-pos slide switch) swaps C_FG 1µF (slow) / 100nF (mid) / 10nF (fast).

**Clock-sync mode** (activates when TAP_IN or CLK_IN gates received within last 5 seconds):
- ATtiny84A measures T (interval between TAPs или CLK gates).
- RV_SPEED ADC reading remaps к continuous multiplier:
  - CCW (0%) = ×8 slower (T × 8)
  - 25% = ×4 slower
  - 50% = ×1 (lock к clock period)
  - 75% = ×4 faster (T / 4)
  - CW (100%) = ×8 faster (T / 8)
- Mapping: exponential continuous (~1 octave per 12.5% rotation).
- ATtiny84A PWM output → LPF → biases integrator current source (parallel к exp converter output).

**No detents** — smooth pot operation, sync is **continuous-multiplier following** rather than quantized division.

#### FG trigger input + auto-mode logic **[NEW v6.2]**

FG имеет **3 operating modes** — auto-switching без panel mode-select switch:

```
   FG operating modes (auto-determined by ATtiny84A):
   
   1. Free-run (LFO) mode:
      - Активен когда нет recent trigger activity (>5 секунд idle).
      - FG continuously cycles на RV_SPEED rate.
      - Classic LFO behaviour.
   
   2. Plate-triggered (signal-driven) mode — **default sweet spot**:
      - Internal normal: ENV_TRIG (Block 11 envelope differentiator → comparator) → FG trigger.
      - Каждый attack onset на пластине → FG fires одноразовый cycle (rise→peak→fall→0).
      - Acoustic-driven envelope — percussive/strummed input → каждый "удар" producer envelope sweep.
      - Instrument input drives FG → FG drives phaser → phaser modulates reverb.
      - **Без patching anything = signal-driven dynamic phaser sweeps.**
   
   Idle detection:
      - ATtiny84A counts time since last trigger event.
      - >5 секунд idle → switches к free-run mode.
      - Trigger received → switches к triggered mode на duration cycle + idle window.

   > **v6.5**: external J_TRIG jack удалён с панели (слот → J_PHFLT_CV phaser CV).
   > FG trigger теперь **internal-only** (envelope-driven). External sequencer-trigger
   > пожертвован — но FG всё равно plate-triggered + free-run. Для строгого external
   > clocking FG rate синкается через TAP/CLK (sets rate), не per-cycle trigger.
```

#### FG trigger (internal — v6.5)

```
   ENV_TRIG (Block 11 envelope differentiator → LM393 comparator rising edge)
        │
        ▼
   Q_TRIG 2N3904 buffer ──► ATtiny84A GPIO (PCINT input)
   
   ATtiny84A firmware on PCINT:
     - Rising edge от envelope onset
     - Reset FG integrator: Q_RESET 2N7000 briefly (1мс) shorts C_FG к GND
     - Begin new rise cycle от 0V
     - Set mode flag = TRIGGERED, reset idle counter
   
   No external trigger jack (v6.5) — trigger derives internally от plate signal.
```

**Phase reset mechanism**: ATtiny84A GPIO drives Q_RESET 2N7000 N-MOSFET — on trigger, MOSFET briefly (1мс) shorts C_FG к GND → discharges integrator → cycle starts fresh.

**Components**:
| Ref | Value | Function |
|-----|-------|----------|
| Q_TRIG | 2N3904 | Envelope-edge buffer transistor (internal) |
| R_TRIG_PU | 10kΩ 1% MF | Collector pull-up к +5V |
| Q_RESET | 2N7000 | Phase reset MOSFET (C_FG shunt) |
| R_RESET_G | 1kΩ 1% MF | Q_RESET gate stop |
| **J_PHFLT_CV** | 3.5mm jack | **Phase/Flutter CV input (v6.5, panel main row 2 pos 11, was TRIG)** |
| R_PFCV | 100kΩ 1% MF | Phase/Flutter CV summing |

**BOM add**: $0.15 (BJT + MOSFET + resistors) + $0.40 (J_PHFLT_CV jack) = **$0.55** (external J_TRIG jack удалён, заменён phaser CV jack — net same).

#### TAP-tempo input

Same as before:
- TAP footswitch on pedal OR external J_CLK CV jack (any CMOS gate edge).
- ATtiny84A measures interval, sets sync multiplier base period.
- Phase reset on tap edge. (TAP sets RATE; внутренний envelope trigger starts CYCLE.)

#### BOM (Block 16 revised v6)

| Ref | Part | Qty | Unit $ | Total |
|-----|------|-----|--------|-------|
| U7 (mandatory) | LM13700N (phaser cells 1+2 OTAs) | 1 | $2.00 | $2.00 |
| **U8 (premium SKU only)** | LM13700N (phaser cells 3+4) | 0–1 | $2.00 | $0–2.00 |
| U_FG | TL074CN (FG core: Schmitt + integrator + buffer + inverter) | 1 | $0.75 | $0.75 |
| U_FG_GATE | LM393 dual comparator (Gate_OUT + EOR detect) | 1 | $0.30 | $0.30 |
| U_FG_SUB | 74HC74 D flip-flop (÷2 sub-output) | 1 | $0.30 | $0.30 |
| Q_EXP_RISE/FALL/DEPTH | 2N3904 matched pairs ×3 sliders (6 transistors) | 6 | $0.02 | $0.12 |
| C_AP1 | 47 nF film (phaser cell 1) | 1 | $0.08 | $0.08 |
| C_AP2 | 15 nF film (phaser cell 2) | 1 | $0.06 | $0.06 |
| C_AP3 (premium) | 6.8 nF C0G (cell 3) | 0–1 | $0.05 | $0–0.05 |
| C_AP4 (premium) | 2.2 nF C0G (cell 4) | 0–1 | $0.04 | $0–0.04 |
| R_in/R1 (per phaser cell) | 47kΩ ×4 (or ×8 premium) | 4–8 | $0.01 | $0.04–0.08 |
| C_FG | 1 µF MKS2 + 100 nF + 10 nF film (range cap bank) | 3 | $0.20 | $0.60 |
| C_HYS | 100 nF film (Schmitt feedback) | 1 | $0.05 | $0.05 |
| RV_PHASE_FLUTTER | Alpha 9mm pot 100kΩ log | 1 | $1.20 | $1.20 |
| RV_EXP_LOG | Alpha 9mm pot 100kΩ lin (center detent) | 1 | $1.50 | $1.50 |
| RV_SPEED | Alpha 9mm pot 100kΩ log | 1 | $1.20 | $1.20 |
| RV_RISE / RV_FALL / RV_DEPTH | Alpha 30mm slider 100kΩ lin (linear taper + exp conv) | 3 | $1.50 | $4.50 |
| SW_FG_RANGE | DPDT 3-pos slide switch (range select) | 1 | $0.80 | $0.80 |
| SW_CLIP | DPDT slide toggle (hard/soft clip select) | 1 | $0.60 | $0.60 |
| D_PFB1, D_PFB2 | 1N4148 (phaser feedback soft-clip) | 2 | $0.01 | $0.02 |
| D_FG_R, D_FG_F | 1N4148 (FG rise/fall steering) | 2 | $0.01 | $0.02 |
| R_PFB_PRE, R_PFB_LIMIT | 10k + 5k 1% MF | 2 | $0.05 | $0.10 |
| R_EXP × 3 | 1kΩ 1% MF (exp converter emitter R) | 3 | $0.05 | $0.15 |
| Misc passives (R-banks, R-IABC, etc.) | — | — | — | $0.50 |
| **Block 16 total (budget 2-stage)** | | | | **$14.83** |
| **Block 16 total (premium 4-stage)** | | | | **$16.92** |

**Removed from v5 BOM** (replaced by analog FG):
- ~~U_VINYL_555 NE555 ($0.25)~~ — vinyl-skip path удалён, форма теперь continuous
- ~~U_TAP_CNT 74HC161 ($0.30)~~ — step DAC удалён
- ~~SW_SHAPE Alpha SL-1P5T slider ($3.00)~~ — Shape Form slider удалён
- ~~Step R-2R ladder 8 resistors ($0.40)~~ — удалён
- **Removed total**: −$3.95

**Added in v6 (FG core + 3 sliders + extras)**:
- TL074 + LM393 + 74HC74 + 6× 2N3904 + 3 sliders + range/clip switches + extras = **+$9.85**

**Net Block 16 cost change**: +$5.90 vs v5.

#### Verification (v6)

- **Phaser sweep test**: input 1 kHz sine, SPEED slow (0.2 Hz, range slow), RISE/FALL equal mid, DEPTH full, Phase/Flutter 50% — output должна показывать обвалы spectrum 200Hz–4kHz range, full sweep cycle ~5 seconds.
- **Phase/Flutter feedback morph**: knob CCW = subtle phasing, CW 90% = aggressive resonant peaks, CW 100% = controlled self-oscillation (no hard clip, diode soft-limit kicks in).
- **FG shape morph**: RISE full CCW + FALL full CW = saw down. RISE full CW + FALL full CCW = saw up. Equal RISE/FALL = triangle. EXP/LOG knob morphs curve shape continuously.
- **Range switch**: SW_FG_RANGE 3 positions → confirms rate range × 10, × 100 multipliers по C_FG swap.
- **TAP clock sync**: tap 2 presses в 0.5 sec → FG period locks к 0.5 sec при RV_SPEED 50%. Cw → FG runs faster (0.25 sec, 0.125 sec). CCW → slower (1 sec, 2 sec).
- **Outputs validation**:
  - EG OUT amplitude follows `depth` slider 0-100%
  - Gate_OUT square wave с duty cycle = rise/(rise+fall) ratio
  - Sub÷2_OUT — half rate of Gate_OUT
  - Inv_OUT — inverted EG (5V−EG_value)
  - EOR internal normal к TOLL: каждый peak FG → solenoid impulse → bell strike

#### Why always-on (not optional)

- Phaser — **signature character** "холодной ночи" combine.
- В mockup есть large Phase/Flutter knob + 3 FG sliders + 2 extra knobs — это occupies significant physical real estate. Bypass через master BYPASS footswitch достаточно — отдельный PHASER ON/OFF toggle избыточен.
- Always-on simplifies wiring (no toggle relay), saves $1 BOM, cleaner UX.
- FG output exposed via 4 jacks (EG/Gate/Sub/Inv) — даже если phaser sound undesired, FG continues работать как general-purpose modulation source patchable во ВСЕ knobs через CV bay.

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
   │                  │      ◄── от ATtiny84A PWM (8kHz–62kHz) │
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
                                       │     ◄── ATtiny84A OC1A PWM output
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

**Sample rate control (ATtiny84A PWM)**:
- ATtiny84A Timer1 PWM output (pin 6, OC1A) generates square wave.
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

#### ATtiny84A firmware allocation (shared chip с Block 12 + Block 14 + Block 16 + Block 18)

ATtiny84A (14-pin DIP, ATMEL family) — 12 GPIO + 8 ADC channels. Allocation:

| Pin (PA/PB) | Function | Direction | Block |
|-------------|----------|-----------|-------|
| pin 1 VCC | +5V supply | — | — |
| pin 2 PB0 (OC0A) | LFSR Geiger clock output | output PWM | 12 |
| pin 3 PB1 (OC0B) | Crush sample PWM | output PWM | 18 |
| pin 4 PB3 (RESET) | Reserved (programming) | — | — |
| pin 5 PB2 (INT0/OC1A) | FG speed bias PWM | output PWM | 16 |
| pin 6 PA7 (OC1B) | STALL PWM throttle output | output PWM | 14 |
| pin 7 PA6 (ICP1) | TAP input (capture) | input | 16 |
| pin 8 PA5 (MISO) | FG TRIG input (PCINT) | input (interrupt) | 16 |
| pin 9 PA4 (SCK/ADC4) | NTC thermistor read (premium SKU) | input ADC | 14 |
| pin 10 PA3 (ADC3) | RV_GEIGER (LFSR rate) | input ADC | 12 |
| pin 11 PA2 (ADC2) | RV_CRUSH (sample rate) | input ADC | 18 |
| pin 12 PA1 (ADC1) | RV_SPEED (FG rate) | input ADC | 16 |
| pin 13 PA0 (ADC0) | reserved (future expansion) | — | — |
| pin 14 GND | ground | — | — |

**Pin distribution rationale**: Timer0 для слабо-критичных PWM (LFSR clock + crush sample). Timer1 для precision PWM (FG speed bias). PCINT для async trigger events. ADC inputs grouped on PA port для shared sample-and-hold circuit efficiency.

**Firmware size estimate**: ~2KB (ATtiny84A has 8KB flash, comfortable headroom для PID loops + LFSR + timing).

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

**ATtiny84A shared** — chip уже включён в Block 12 BOM, дополнительно за Block 18 не считается.

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
                          TRACO TMR 3-1222WI       7805 LDO ──► +5V
                          (or Recom RxxD-1212 (verify dual ±12V P/N)     (для ATtiny84A,
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
| **TRACO TMR 3-1222WI** | ±12V | 125mA | $13 | **Budget** SKU. Sufficient для steady state. |
| **Recom RxxD-1212 (verify dual ±12V P/N)** | ±12V | 250mA | $22 | **Premium** SKU. Headroom для solenoid + FX peaks. Audio-rated noise specs. |

**Why isolated DC-DC** (не charge pump):
- **Higher current capability** (125–250mA vs ~50mA charge pump).
- **Identical headroom к Eurorack** version (±12V rails везде).
- **Ground loop break** — isolated barrier означает Last Night работает clean даже если запитан с других pedals на shared PSU.
- **Lower switching noise** (TRACO/Recom audio-grade specs).

**Why 12V DC pedal supply standard**:
- Modern complex pedals (Strymon, Eventide, Meris, Chase Bliss) **все на 12V**.
- Premium pedalboard PSUs все имеют 12V outputs (Voodoo Lab Pedal Power 4×4, Cioks DC7/DC10, Eventide PowerMax, Strymon Zuma).
- 9V supply **не подходит** для headroom этого класса pedals (включая Last Night).

**Power budget pedal (with TMR 3-1222WI)**:
- Audio analog (±12V via DC-DC): ~125mA на rail steady, peak 250mA.
- Digital +5V (для ATtiny84A + LEDs): ~50mA.
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

### Block 20. Bank Mode Preset Slider — vertical 5-position **[REVISED v6.1 — DIRTY label + dirt semantic]**

5-позиционный slider switch на левой стороне панели. **Hybrid-purpose preset**: позиция 1 (**DIRTY**) engages **noise color filter + moderate reverb saturation** (общая dirt-emphasis mode), позиции 2-4 (WARM/DARK/VOICE) меняют **reverb tone**, позиция 5 (MIX) — combined moderate mode (оба пути активны на средних уровнях).

Категория slider помечена на панели как **"Bank Mode"** (italic header label над позициями).

Используется **4PDT 5-position slider** (Alpha SL-4P5T). Hardware-only — никакого MCU. 4 pole разделяют 4 sub-circuit пути:
- Pole 1: noise color LPF cutoff R (engaged at COLOR + MIX only)
- Pole 2: reverb LF shelf R-bank
- Pole 3: reverb HF shelf R-bank
- Pole 4: reverb saturation R-bank

#### Topology

```
                              4-pole 5-throw vertical slider (Alpha SL-4P5T)
                                          
   Pole 1 — noise color LPF cutoff (DIRTY + MIX active):
        ├─ Pos 1 (DIRTY):  R_NC1 = 10kΩ  → LPF cutoff 2.5kHz (white→brown)
        ├─ Pos 2 (WARM):   R_NC2 = ∞     → LPF bypass (noise default = white hiss)
        ├─ Pos 3 (DARK):   R_NC3 = ∞     → bypass
        ├─ Pos 4 (VOICE):  R_NC4 = ∞     → bypass
        └─ Pos 5 (MIX):    R_NC5 = 22kΩ  → LPF cutoff 1.1kHz (partial filter)
        ▼
   To noise color LPF (uses U_NCLPF — TL072 spare half + C_NC 47nF)
   
   Pole 2 — reverb LF shelf cut/boost R-bank:
        ├─ Pos 1 (DIRTY):  R_LF1 = ∞     → LF flat (DIRTY не трогает LF — bass clean)
        ├─ Pos 2 (WARM):   R_LF2 = 10kΩ  → +6dB shelf @ 150Hz
        ├─ Pos 3 (DARK):   R_LF3 = ∞     → flat (DARK leaves bass alone)
        ├─ Pos 4 (VOICE):  R_LF4 = 33kΩ  → −3dB shelf @ 150Hz (cleaned bass)
        └─ Pos 5 (MIX):    R_LF5 = 22kΩ  → +3dB shelf @ 200Hz
        ▼
   To reverb LF shelf (U2 spare half + C_LF 100nF)
   
   Pole 3 — reverb HF shelf cut/boost R-bank:
        ├─ Pos 1 (DIRTY):  R_HF1 = 22kΩ  → −2dB @ 4kHz (slight roll-off, добавляет dirt character)
        ├─ Pos 2 (WARM):   R_HF2 = 22kΩ  → −3dB @ 4kHz (gentle roll-off)
        ├─ Pos 3 (DARK):   R_HF3 = 8.2kΩ → −8dB @ 4kHz (heavy roll-off)
        ├─ Pos 4 (VOICE):  R_HF4 = 15kΩ  → +2dB @ 2kHz (formant emphasis)
        └─ Pos 5 (MIX):    R_HF5 = 33kΩ  → +1dB @ 6kHz (subtle air)
        ▼
   To reverb HF shelf (U2 spare half + C_HF 1nF)
   
   Pole 4 — reverb saturation diode bias R-bank:
        ├─ Pos 1 (DIRTY):  R_SAT1 = 4.7kΩ→ moderate (1N4148 ×2 anti-||, добавляет harmonic dirt)
        ├─ Pos 2 (WARM):   R_SAT2 = 4.7kΩ→ moderate (tube-like)
        ├─ Pos 3 (DARK):   R_SAT3 = 1.5kΩ→ heavy (broken radio)
        ├─ Pos 4 (VOICE):  R_SAT4 = 22kΩ → very subtle (clean vocal)
        └─ Pos 5 (MIX):    R_SAT5 = 4.7kΩ→ moderate (tube-like)
        ▼
   To saturation cell (1N4148 anti-parallel pair + bias network)
        ▼
   Combined → Common bus → output к Block 13 (Mix)
```

#### Где Block 20 стоит в signal chain

- **Noise color LPF (Pole 1)** — на пути noise signal от Block 12 (zener + Geiger) перед его VCA. Только COLOR (Pos 1) и MIX (Pos 5) кладут фильтр в путь; в остальных позициях noise signal проходит unchanged (white hiss).
- **Reverb tone shelves (Poles 2-4)** — между **Block 9 (de-emphasis)** и **Block 10 (tone filter LPF)**, изменяют tone reverb wet signal согласно VOICE/WARM/DARK preset.

Логика: позиция slider выбирает either "noise color emphasis" (Pos 1), "reverb tone preset" (Pos 2-4), или combined moderate (Pos 5). Позиция 1 не трогает reverb, позиции 2-4 не трогают noise color, позиция 5 — оба пути active на средних уровнях.

#### Per-position function (детально)

**Position 1 — DIRTY (noise color + reverb dirt)**:
- **Noise color LPF**: engaged, cutoff 2.5kHz → zener hiss filtered к brown noise character.
- Reverb LF: flat (bass clean).
- Reverb HF: −2dB @ 4kHz (slight roll-off, добавляет dirt character).
- Reverb saturation: **moderate** (R_SAT1=4.7k через 1N4148 pair — добавляет harmonic dirt в reverb tail).
- **Use case**: общая dirt-emphasis mode — noise filtered + reverb gently dirtied. Подходит для grungy/lo-fi patches без перехода в полный "broken radio" DARK mode.

**Position 2 — WARM (reverb warm)**:
- Noise LPF: bypassed (noise = default white hiss).
- LF reverb: +6dB shelf @ 150Hz.
- HF reverb: −3dB shelf @ 4kHz (gentle roll-off).
- Saturation: moderate (R_SAT2=4.7k через 1N4148 pair).
- **Sound**: tube-like, mid-focused, ламповый reverb.

**Position 3 — DARK (reverb dark)**:
- Noise LPF: bypassed.
- LF reverb: flat (DARK leaves bass alone).
- HF reverb: −8dB shelf @ 4kHz (heavy treble cut).
- Saturation: heavy (R_SAT3=1.5k).
- **Sound**: "мёртвая радиостанция" character — closed, мрачный, broken radio.

**Position 4 — VOICE (reverb vocal/formant emphasis)**:
- Noise LPF: bypassed.
- LF reverb: −3dB shelf @ 150Hz (cleaned bass — vocal-like clarity).
- HF reverb: +2dB shelf @ 2kHz (mid-emphasis, vocal formant boost).
- Saturation: very subtle (R_SAT4=22k, almost clean).
- **Sound**: говорящий reverb с vocal-formant emphasis. Подходит для phrases / spoken word / mid-rich material.

**Position 5 — MIX (combined moderate)**:
- Noise LPF: engaged at cutoff 1.1kHz (partial — moderate brown noise character).
- LF reverb: +3dB shelf @ 200Hz.
- HF reverb: +1dB @ 6kHz (subtle air on top).
- Saturation: moderate (R_SAT5=4.7k, как WARM).
- **Sound**: "everything moderate" — noise color и reverb tone оба active на средних уровнях. Default "balanced" preset.

#### R-bank summary

| Bank Mode | Noise LPF R | Reverb LF | Reverb HF | Reverb SAT |
|:----------|:-----------:|:---------:|:---------:|:----------:|
| 1 **DIRTY** | **10k** (2.5kHz) | open (flat) | **22k** (−2dB) | **4.7k** (moderate) |
| 2 **WARM**  | open | **10k** (+6dB) | **22k** (−3dB) | **4.7k** (moderate) |
| 3 **DARK**  | open | open | **8.2k** (−8dB) | **1.5k** (heavy) |
| 4 **VOICE** | open | **33k** (−3dB) | **15k** (+2dB) | **22k** (subtle) |
| 5 **MIX**   | **22k** (1.1kHz) | **22k** (+3dB) | **33k** (+1dB) | **4.7k** (moderate) |

(Open = no resistor for that pole → sub-circuit inactive в данной позиции.)

**Common components** (вне 4P5T switch):
- C_NC: 47nF film (noise LPF cap).
- C_LF: 100nF film (reverb LF shelf cap).
- C_HF: 1nF C0G ceramic (reverb HF shelf cap).
- D_SAT_A, D_SAT_B: 2× 1N4148 anti-parallel (saturation pair).
- U_NCLPF: half TL072 spare (noise LPF amp).
- U_COLOR_OP: half TL074 spare (shelf feedback amp).

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
- **THD test**: на DARK position при +6dBu input → THD должна быть 5–10% (heavy saturation). На MIX position → 3–5%. На DIRTY position → 3–5%.
- **Click-free switching**: переключение между позициями не должно давать audible pop. Если pop — добавить muting cap (10µF) на slider's common node.
- **🟡 [CRITICAL — Production sign-off]**: **Bank Mode preset blind A/B listener test**. Sample audio: reverb tail на oak cartridge с identical input (pink noise burst + percussive transient). 10 listeners blind, name preset (DIRTY/WARM/DARK/VOICE/MIX) из звука. **Target accuracy: >70%**. Если меньше — adjust R-bank values. VOICE specifically known weak — может потребовать +4dB @ 2kHz boost вместо +2dB.

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
- [ ] No collateral switching noise от собственного TMR 3-1222WI DC-DC (150kHz) reaches HUM output (DC-DC ferrite shield essential).

**Open question**: внутренняя antenna может ловить collateral switching noise от собственного TMR 3-1222WI DC-DC (150kHz). Mitigation: ferrite shielding coil + 50/60Hz tuned filter cuts switching frequency. Если bench prototype не подтверждает clean signal — HUM откладывается в Phase 2B с external antenna jack only.

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
  - Block 19: isolated DC-DC (pedal SKU only — TRACO TMR 3-1222WI / Recom RxxD-1212 (verify dual ±12V P/N)).
  - **Block 20**: Bank Mode preset slider (4P5T, **detailed schematic с 5 R-banks**, see above).
  - Blocks 21–25: cold palette FX layer (Phase 2 v3 PCB upgrade — PULSE/FOG/FROST/CHILL/HUM).
- **9 ICs analog (budget 2-stage phaser)**: 2× TL072 + 2× TL074 + **3× LM13700** (U5=VCA + Block 12 crossfader OTA; U6=spare halves для Block 20 saturation / resonance; U7=Block 16 phaser cells 1+2) + CD4066 (Gate cell) + LF398 (Crush cell).
- **10 ICs analog (premium 4-stage phaser)**: + **U8 LM13700** для phaser cells 3+4.
- **2 dual comparators**: LM393 ×2 — U_COMP (Block 18 Gate threshold + **Block 11 env→trigger reused второй half**) + U_FG_GATE (Block 16 FG Gate_OUT + EOR detect). All 4 halves utilized.
- **1 D flip-flop**: 74HC74 (Block 16 FG Sub÷2 output divider).
- **1 MCU**: ATtiny84A (Geiger LFSR cluster pattern + crush sample clock + FG clock sync continuous multiplier).
- **1 dual timer**: NE556 (Block 14 rewrite: half A = TOLL 4.4мс coil pulse, half B = 3.1мс piezo MUTE window). *vinyl-skip NE555 удалён в v6 — заменён analog FG.*
- **7 transistors discrete**: LSK489A dual JFET + BD139 + BD140 + 2N7000 ×2 (Q5 solenoid driver + Q_MUTE piezo output mute).
- **6× 2N3904** (Block 16 FG exp converters — 3 matched pairs для rise/fall/depth sliders).
- **1 zener**: BZX55C9V1.
- **1 isolated DC-DC** (pedal only): TRACO TMR 3-1222WI (budget) или Recom RxxD-1212 (verify dual ±12V P/N) (premium).
- **Footswitches** (mockup canon): TAP / GATE-CRUSH / BYPASS / FREEZE.
- **CV-only inputs** (modular advanced — extras zone): J_TOLL_TRIG (внутренне normalled от FG EOR) / J_STALL_CV / J_SIDE (sidechain in) / **J_FREEZE_CV** (OR с footswitch state).
- **FG outputs** (extras zone bottom row): J_Gate / J_Sub÷2 / J_Inv. J_EG в main CV bay row 2.
- **Sliders**: SL-4P5T (Block 20 Bank Mode preset) + 3× linear 30mm sliders (Block 16 FG rise/fall/depth).
- **Slide switches**: SW_FG_RANGE (DPDT 3-pos для FG range C_FG swap) + SW_CLIP (DPDT для hard/soft clip select).

**Phase 1 ship BOM** (v6 hybrid, ядро + Gate/Crush + 2-stage phaser + analog FG + Bank Mode preset + base FX): **~$100 budget / $127 premium**.
**Phase 1 premium SKU** (4-stage phaser): +$2 → **~$102 budget / $129 premium**.
**Phase 2 v3 PCB BOM**: +$38 для cold palette daughter-board (incl. PCB + ribbon + 6 knobs + 5 jacks + 2 switches) → **~$138 budget / $165 premium** full feature.

**Retail target**: $499 budget / $649 premium (sustainable margin, premium tier alongside Strymon BigSky / Eventide H9 Max).

## Полный BOM

Таблица закупок Last Night v3.0 — все компоненты для одного модуля. Цены ориентировочные (USD, retail small-quantity, Mouser/Digi-Key 2025).

### Active components (ICs, transistors, diodes)

| Ref | Part Number | Описание | Package | Qty | Unit $ | Total $ | Sourcing |
|-----|-------------|----------|---------|-----|--------|---------|----------|
| U1, U3 | TL072CP | Dual JFET-input op-amp | DIP-8 | 2 | $0.50 | $1.00 | TI / Mouser |
| U2, U4 | TL074CN | Quad JFET-input op-amp | DIP-14 | 2 | $0.75 | $1.50 | TI / Mouser |
| U5, U6 | LM13700N | Dual OTA (U5=VCA + bipolar noise VCAs, U6=phaser stages) | DIP-16 | 2 | $2.00 | $4.00 | TI / Mouser |
| U_556 | NE556N | Dual timer (Block 14 rewrite): half A = TOLL escapement pulse 4.4мс fixed, half B = piezo MUTE window 3.1мс | DIP-14 | 1 | $0.45 | $0.45 | Multi-source |
| R_SOL / Z_SOL / Q_MUTE / R_SNUB+C_SNUB | 36Ω 5W WW / zener 12V 1.3W / 2N7000 / 100Ω+100нФ | Block 14 rewrite: SOFT drive tier + fast escapement release + EMI mute + drain snubber | mixed | 1 set | — | ~$1.30 | Multi-source |
| U_GATE | CD4066BE | Quad CMOS analog switch (Gate cell + bypass relay logic) | DIP-14 | 1 | $0.40 | $0.40 | Multi-source |
| U_SH | LF398N | Sample-and-hold (Crush cell) | DIP-8 | 1 | $1.20 | $1.20 | TI |
| U_COMP | LM393 | Dual comparator (Gate threshold + Tap-tempo detection) | DIP-8 | 1 | $0.30 | $0.30 | TI |
| U_SPLIT | TL072CP (extra half) | Bipolar CV splitter (positive/negative comparator pair) | shared в U1/U3 | — | — | — | included above |
| U_MCU | ATtiny84A-PU | MCU shared — Geiger LFSR (Block 12) + Crush sample clock (Block 18) + FG TAP/clock sync + trigger PCINT + phase reset (Block 16) + STALL PWM throttle (Block 14). **Upgraded v6.3** — ATtiny85 5-GPIO insufficient для v6.2 (FG TRIG input + phase reset + speed bias PWM + TAP would need 9 pins). ATtiny84A 14-pin DIP = 12 GPIO + 8 ADC, same family/toolchain/price. | DIP-14 | 1 | $1.50 | $1.50 | Microchip |
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
- U_555 NE555P ($0.25) — TOLL pulse monostable (J_TOLL_TRIG path). *Block 14 rewrite: → NE556 dual (coil pulse + MUTE window), см. delta-таблицу Block 14.*
- D_OR_A, D_OR_B, D_OR_C 1N4148 ($0.03) — 3-way diode-OR для DAMP+TOLL+STALL paths.
- RV_NOISE Alpha RV09 log ($1.20) — стандартная ручка, не detent.
- RV_COLOR Alpha RV09 lin ($1.20) — стандартная ручка для geiger crossfader.

**Net change v5 vs v3**: -$8 (BBD removed) + $1.93 (gate/crush + 555 + diodes) = **-$6 vs v3 baseline**.

Phase 1 BOM становится **дешевле и фокусированнее** чем v3.0, но **сохраняет** все footswitch effects (Gate/Crush, Bypass, Tap, Freeze) + **добавляет** modular-advanced TOLL/STALL CV triggers.
| **Subtotal active** | | | | | | **$23.95** | |

### FX Engine new components (v3.0)

| Ref | Part Number | Описание | Qty | Unit $ | Total $ |
|-----|-------------|----------|-----|--------|---------|
| RV_PHASE_FLUTTER | Alpha 9mm pot 100kΩ log | Phaser feedback intensity morph (Block 16, v6) | 1 | $1.20 | $1.20 |
| RV_EXP_LOG | Alpha 9mm pot 100kΩ lin center-detent | FG curve shape morph exp↔lin↔log (Block 16, v6) | 1 | $1.50 | $1.50 |
| RV_SPEED | Alpha 9mm pot 100kΩ log | FG rate + clock sync continuous multiplier (Block 16, v6) | 1 | $1.20 | $1.20 |
| RV_RISE / RV_FALL / RV_DEPTH | Alpha SL-30 30mm linear slider 100kΩ lin | FG shape sliders (3× — Block 16, v6, paired с exp converters) | 3 | $1.50 | $4.50 |
| RV_HIPASS | Alpha 9mm pot 100kΩ lin | HiPass filter cutoff | 1 | $1.20 | $1.20 |
| RV_INPUT, RV_OUTPUT | Alpha 9mm pot 100kΩ lin | Input gain, output level | 2 | $1.20 | $2.40 |
| Color slider (4P5T) | Alpha SL-4P5T | 5-position vertical slider для DIRTY/WARM/DARK/VOICE/MIX Bank Mode preset (Block 20 v6) | 1 | $5.00 | $5.00 |
| Bank Mode preset banks | См. Block 20 BOM v6 | 13× R + 47nF + 100nF + 1nF + 2× 1N4148 | 18 | — | $0.40 |
| **U7 (phaser OTAs)** | LM13700N | Block 16 — phaser cells 1+2 (budget 2-stage SKU) или cells 1+2 of 4 (premium) | 1 | $2.00 | $2.00 |
| U8 (phaser OTAs premium only) | LM13700N | Block 16 — phaser cells 3+4 (premium 4-stage SKU only) | 0–1 | $2.00 | $0–2.00 |
| U_FG_GATE | LM393 dual comparator | Block 16 FG — Gate_OUT + EOR detect | 1 | $0.30 | $0.30 |
| U_FG_SUB | 74HC74 D flip-flop | Block 16 FG — Sub÷2 output divider | 1 | $0.30 | $0.30 |
| Q_EXP_PAIRS | 2N3904 ×6 (3 matched pairs) | Block 16 FG — linear→exp converters per slider | 6 | $0.02 | $0.12 |
| SW_FG_RANGE | DPDT 3-pos slide switch | Block 16 FG — C_FG range select (slow/mid/fast) | 1 | $0.80 | $0.80 |
| Block 16 misc (caps, range cap bank, soft-clip diodes, R passives) | См. Block 16 BOM v6 | C_AP1/2 + C_FG bank + C_HYS + R-IABC + R-PFB + R-EXP + diodes | ~20 | — | $1.50 |
| **SWITCH CLIP** | DPDT slide toggle | Hard/soft clip select | 1 | $0.60 | $0.60 |
| Footswitches (3PDT × 4) | DPDT/3PDT mechanical | TAP, GATE/CRUSH, BYPASS, FREEZE | 4 | $3.00 | $12.00 |
| Mini-jacks (extras zone) | 3.5mm panel-mount | TOLL_TRIG + STALL_CV + SIDE + **FREEZE_CV** + Gate_OUT + Sub÷2_OUT + Inv_OUT | 7 | $0.40 | $2.80 |
| FREEZE_CV bridge (Q_FZ 2N3904 + R_FZ_IN/PU/DIV) | Block 5 v6.1 — CV→gate transistor | — | — | — | $0.04 |
| **Subtotal FX engine v6.1 (budget 2-stage phaser)** | | | | | **$37.86** |
| **Subtotal FX engine v6.1 (premium 4-stage phaser, +U8 + cells 3/4)** | | | | | **$39.95** |

**Net BOM change v5 → v6** (FX engine):
- Removed: U_VINYL_555 (−$0.25) + U_TAP_CNT 74HC161 (−$0.30) + Shape Form SL-1P5T slider (−$3.00) + R-2R ladder 8R (−$0.40) + RV_DEPTH knob 100k (−$1.20) = **−$5.15**
- Added: 3× linear sliders (+$4.50) + LM393 ×1 (+$0.30) + 74HC74 (+$0.30) + 6× 2N3904 (+$0.12) + SW_FG_RANGE (+$0.80) + RV_EXP_LOG (+$1.50) + 6× extras zone jacks (+$2.40) + SWITCH CLIP downgrade to slide (−$0.90 vs $1.50 toggle) = **+$9.02 net add**
- **Net v5 → v6**: +$3.87 (FX engine), Phase 1 ship total: ~$96 → **~$100 budget / ~$127 premium**.

### Power supply (per SKU)

**Eurorack SKU**:
- IDC 2×5 connector: $0.50.
- 1N5817 reverse protection: included above.
- LC filter (10µH + 10µF): $1.00.

**Pedal SKU** (additional):
- DC barrel jack 2.1mm center-negative: $1.20.
- **TRACO TMR 3-1222WI** isolated DC-DC (budget SKU): **$13.00**.
- — or **Recom RxxD-1212 (verify dual ±12V P/N)** (premium SKU): **$22.00**.
- LC filter post-DC-DC (×2 rails): $2.00.

### Заmена subtotal

Subtotal active was $11.97 — увеличено с FX engine + DC-DC до:

| Tier | Subtotal active+FX | Power | **Total active+FX+power** |
|------|--------------------|-------|---------------------------|
| Eurorack budget | $54.65 | $1.50 | **$56.15** |
| Eurorack premium (4-layer PCB) | $54.65 | $1.50 | **$56.15** |
| Pedal budget (TMR 3-1222WI) | $54.65 | $16.20 | **$70.85** |
| Pedal premium (RxxD-1212 (verify)) | $54.65 | $25.20 | **$79.85** |

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
| **Transducer engine** (Decision 11 — module-side, internal wiring no swappable connector) | exciter DAEX32 + 2 piezo contact pins + solenoid + spring carriage | 1 set | $32.00 | $32.00 | См. CARTRIDGE_SOURCING §0A |
| J_PWR | IDC 2×5 pin header | 1 | $0.50 | $0.50 | Eurorack power |
| **Connector subtotal** (без transducer engine) | | | | | **$9.50** |

### Cartridge (passive plate — Decision 11)

| Ref | Part | Qty | Unit $ | Total $ |
|-----|------|-----|--------|---------|
| Plate (материал) | per material (см. acoustic_modeling §10) | 1 | $5-15 | $5-15 |
| Frame (PETG proto / anodized alu prod) | — | 1 | $3.00 | $3.00 |
| Retention magnets N42 Ø6×3 (polarized, keying) | neodymium | 4 | $0.30 | $1.20 |
| **Cartridge subtotal** (passive, per cartridge) | | | | **~$10-20** |

> Картридж **не несёт** трансдьюсеров/разъёмов (Decision 11). Дёшев → razor-blade.

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
| Switches & connectors (без engine) | $15.90 | $15.90 |
| **Transducer engine (Decision 11 — module-side)** | $32.00 | $32.00 |
| Mechanical (40HP panel $25) | $32.80 | $32.80 |
| PCB (40HP) | $6.00 | $30.00 |
| **Total module** | **$115.22** | **$144.22** |

### Per cartridge (typical wood, oak) — **passive (Decision 11)**

> Картридж **пассивный**: только пластина + рамка + магниты + keying. Трансдьюсеры (exciter + 2× пьезо + соленоид) — в module engine bay, считаются **один раз per module**, не per cartridge.

| Item | Cost |
|------|------|
| Cartridge frame (3D PETG print) | $5.00 |
| Wood plate (oak 100×45×1.8mm, finished) | $7.00 |
| Magnets (4× neodym N42 5×5×2мм) | $1.00 |
| Retention notch + keying | $0.50 |
| Foam-lined box + material card | $3.50 |
| **Total cartridge BOM (passive)** | **$17.00** |

### Premium cartridge (titanium) — **passive (Decision 11)**

| Item | Cost |
|------|------|
| Aluminum frame (CNC-milled) | $15.00 |
| Titanium plate 100×40×0.4мм | $30.00 |
| Magnets + retention | $1.50 |
| Premium packaging (foam + leather case + serial card) | $8.00 |
| **Total premium cartridge BOM (passive)** | **$54.50** |

### Transducer engine — **per module (Decision 11)**

> Уже включён в module total выше ($32). Здесь — breakdown (см. `CARTRIDGE_SOURCING.md §0A`).

| Item | Cost |
|------|------|
| Exciter DAEX32Q-4 (universal — handle light+dense) | $20.00 |
| 2× piezo contact pickups (module-internal, shielded) | $2.00 |
| Solenoid 5V push + felt tip | $5.00 |
| Spring carriage + bracket + internal shielded wire | $5.00 |
| **Total transducer engine (in module BOM)** | **$32.00** |

### Retail pricing implications (40HP flagship sizing)

| SKU | BOM | Retail | Gross margin |
|-----|-----|--------|--------------|
| Module budget (40HP, incl. $32 transducer engine) | $115 | $450 | 74% |
| Module premium (40HP, 4-layer PCB, incl. engine) | $144 | $550 | 74% |
| Cartridge oak (passive) | $17 | $40 | 58% |
| Cartridge premium titanium (passive) | $55 | $150 | 63% |

> **Decision 11 economics**: трансдьюсеры теперь в module (one-time $32), а не в каждом картридже. Cartridge упал с ~$46 → $17 (passive) → razor-blade модель работает: дешёвый картридж, повторные продажи разных материалов.

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
│  │ Decoupling│  │ (piezo contact)  │  │ D_SOL          │            │
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
Piezo A contact pin ──[short shielded wire 5–10mm, guard ring at PCB entry]── Q3 Gate A pad
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

- **Length <20мм** from piezo contact wire entry к LSK489A gate.
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
| **Zone 10** | Block 16 Phaser + analog Function Generator | U7 LM13700 (cells 1+2), U8 LM13700 premium (cells 3+4), TL074 (FG core: Schmitt + integrator + buffer + inverter), LM393 (FG Gate + EOR), 74HC74 (FG ÷2 sub), 6× 2N3904 (exp converters), C_AP1–4 (47/15/6.8/2.2nF NP0), C_FG range bank (1µF/100nF/10nF) | Place **away from JFET preamp Zone 4** — FG integrator + phaser LFO can radiate sub-audio crosstalk into hi-Z gate. Min 25mm separation. Sliders mounted на panel-edge satellite PCB connecting via 12-pin ribbon к main board. |
| **Zone 11** | Block 18 Gate/Crush | U_GATE CD4066BE, U_SH LF398N, U_COMP LM393, R-2R matched pairs | Place **between Zone 7 (mix output) and panel** — signal flows mix → Gate → Crush → output buffer → jack. R-2R matched resistors require equal-length traces (<5mm difference). |
| **Zone 12** | Block 20 COLOR slider | Slider SL-4P5T mounted **panel-edge** (not on PCB body), R-banks (12 resistors) на panel-adjacent strip | Slider physically on panel left side per mockup. R-banks soldered on small **slider satellite PCB** (40×20mm) which mounts behind slider, ribbon-connects to main PCB via 8-pin header. |
| **Zone 13** | Block 12 noise + Block 16 FG panel sliders + extras CV jack cluster | 3× FG linear sliders (rise/fall/depth) panel-mount, SW_FG_RANGE + SW_CLIP slide switches, ATtiny84A MCU (shared с Block 12, 16, 18 — added FG clock sync logic), 7805 LDO для +5V digital, 6 extras jacks (TOLL/STALL/SIDE/Gate/Sub÷2/Inv) | Slider satellite PCB shared с Block 20 region — FG sliders mounted vertically на panel right edge, ribbon-connect к main PCB exp converters. Extras jacks group right of slider cluster, frame с dashed outline. ATtiny84A в **digital corner** (DGND, Zone 8 adjacent). +5V LDO heat sink not needed. |
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
│  │ SW_FREEZE    │ │ U2A D1-D6      │ │ TL074 FG core (Schmitt│ │ U2C      │ │
│  │              │ │                │ │  +integrator+buffer)  │ │          │ │
│  │              │ │                │ │ LM393 FG Gate/EOR     │ │          │ │
│  │              │ │                │ │ 74HC74 FG ÷2 sub      │ │          │ │
│  │              │ │                │ │ 6× 2N3904 exp conv    │ │          │ │
│  │ D_LIM        │ │ U5 LM13700     │ │ (vinyl 555 removed)  │ │ ATtiny84A │ │
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
| ATtiny84A clock (Z13) ↔ Z4 JFET | 30mm + GND moat | Digital clock 16MHz can crosstalk into hi-Z analog |

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
4. **Transducer engine bay (cartridge dock)** — у opposite edge from J_PWR. Module-internal exciter + 2× piezo contact pins + solenoid; пьезо разведён коротким shielded проводом (Decision 11 — нет swappable разъёма).
5. **JFET preamp (Z4)** — close to piezo contact wire entry (<20мм). **No other circuit within 25mm**.
6. **Solenoid driver (Z8)** — opposite corner from JFET preamp (>40мм physical separation).
7. **Noise generator (Z9)** + ATtiny84A (Z13) — isolated digital corner, GND moat.
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
│  (НЕТ разъёмов — Decision 11)    │  ← картридж пассивный
│                                  │
│  Material label / serial # /     │
│  laser-etched logo               │
└──────────────────────────────────┘

Side view (cross-section) — картридж = пассивная пластина в рамке:
┌──────────────────────────────────┐
│  Plate (variable thickness 0.3–3мм)
│ ──┬───────────────────────────┬── Rubber rail (top, frame damping)
│   │     [PLATE]                │
│ ──┴───────────────────────────┴── Rubber rail (bottom)
│  Frame (PETG / aluminum) + 4 магнита + keying
│  Открытые окна: где module exciter/piezo касаются пластины
└──────────────────────────────────┘
```

### Mounting hardware

- **Plate retention в рамке**: 2× rubber rails (top, bottom) silicone 2мм — компрессия + frame damping (рама не резонирует).
- **Frame mount к module**: 4× neodym N42 (polarized, keying) align с magnets на module engine bay.
- **Retention pin**: spring-loaded plunger в module, входит в groove рамки.

### Cartridge interface — passive (Decision 11)

```
Картридж = пассивная пластина. НЕТ разъёмов, НЕТ wiring.
Рамка имеет открытые окна (cutouts) где module-side трансдьюсеры
касаются пластины при вставке:

  Window 1 (face A, ~1/3 от края): module exciter puck contact (~5N spring)
  Window 2,3 (face B): module piezo contact pins (A near, B far)
  Window 4 (top): module solenoid plunger reaches plate

Все трансдьюсеры — в module engine bay (см. PCB_DESIGN_SPEC §6.1).
Картридж только позиционирует пластину против них (магниты + keying + pin).
```

### Cartridge assembly (passive — простая)

1. Apply 2× rubber rails в slots рамки (frame damping + retention).
2. Insert plate в рамку (slide от open side).
3. Slight compression — plate держится.
4. Install 4× retention magnets (polarized per keying scheme).
5. (Дерево) apply coating — linseed/shellac. (Металл) anodize опц.
6. Laser-etch material label + serial.

**Всё.** Никаких трансдьюсеров, пайки, разъёмов. Картридж — чисто механический пассивный объект.

### Transducer engine (в module, не в картридже)

Exciter + 2 piezo (contact pins) + solenoid — постоянно в module engine bay, spring-loaded contact к вставленной пластине. См. `../00_series/decisions/11_cartridge_architecture_lock.md` + `PCB_DESIGN_SPEC.md §6.1`. Solenoid felt tip + 2мм gap фиксирован в module (не per-cartridge).

### Cartridge-specific specifications

> **Decision 11**: exciter — **универсальный DAEX32Q-4 в module** (spring-loaded contact ко всем пластинам). Ниже — per-material plate specs + contact-point особенности; per-cartridge exciter больше нет.

#### Wood cartridge (oak example)

- Plate: 100×45×1.8мм, oak hardwood (kiln-dried, finished с linseed oil).
- Plate weight: ~6г.
- Contact point: ~33мм from one edge (1/3 length, off-center, avoids mode 1,1 antinode).

#### Stone cartridge (slate example — replaces marble)

- Plate: 100×45×2.0мм, slate (marble репозиционирован percussion novelty).
- Plate weight: ~25г.
- Reinforced rubber rails (heavier plate), firm module contact для dense material.

#### Metal thin cartridge (spring steel example)

- Plate: 100×55×0.3мм, hardened spring steel.
- Plate weight: ~13г.
- **Knife-edge support** instead of rubber rails (preserves Q for thin metal).

#### Glass cartridge (annealed example)

- Plate: 100×40×1.5мм, **annealed** glass (narrow=chime/bar). НЕ tempered: закалённое при повреждении взрывается целиком (запасённое напряжение + NiS-включения → спонтанный разлёт) и не режется после закалки — liability для striking-девайса. Annealed скалывается локально и предсказуемо.
- Plate weight: ~15г.
- **Thicker rubber gasket** at module contact (cushion against glass shock).
- Warning sticker: "FRAGILE — handle с care, не drop. Self-oscillation may shatter".

### Производство картриджа — флow

**Phase 1 prototype**:
1. Frame: 3D-print PETG (Prusa MK3S или equivalent), 0.2мм layer, 30% infill. ~2 hours per unit.
2. Plate: order finished plate from supplier (carpenter for wood, stone shop для marble, etc.).
3. Rubber rails: cut от silicone sheet 2мм thick, 4×100мм strips per cartridge.
4. Magnets: glue с epoxy (5-min cure) into recesses.
5. Exciter: epoxy mount к plate face A (M3 bolt option for recovery).
6. Piezo: cyanoacrylate (super glue) к face B at positions A, B.
7. (Картридж пассивный — пайки нет. Трансдьюсеры в module.)
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
3. **Piezo contact pins** ×2: spring-loaded mounts в engine bay, short shielded wire к JFET.
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
3. (Трансдьюсеры в module — internal wiring, no swappable cables.)
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

(Полная версия — `../00_series/audit/fixes/04_testing_protocol.md`. Здесь — concise summary для production reference.)

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
- Add LC filter post-DC-DC (TMR 3-1222WI / RxxD-1212 (verify) в pedal version) — снимает ~150кГц switching residue.
- Check PCB für AGND/DGND breaks.

### Click / pop при solenoid activation

**Symptom**: every time CV_DAMP активирует solenoid → click в audio output.

**Diagnosis**:
1. Probe piezo preamp output during solenoid pulse.
2. Click present? → EMI coupling.
3. Click absent? → mechanical thump from solenoid hitting plate, normal.

**Common causes (electrical)**:
- Module piezo wire shield not connected (Decision 11 — internal shielded lead).
- Piezo contact lead too long without shielding.
- D_SOL flyback диод incorrect orientation (reversed).

**Fix**:
- Verify piezo shielded wire shield = AGND single-point on module side only.
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
- Module piezo shielded lead break (internal coax break).

**Fix**:
- Test piezo с DMM (should give millivolts when tapped).
- Replace LSK489A.
- Replace module piezo lead.

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
- Module piezo lead shield not connected.
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
| ~~Switchcraft TA3M/TA3F~~ | — | — | — | Устранён (Decision 11 — пьезо module-internal, no swappable connector). |
| **Alpha RV09 9mm** | Thonk, SmallBear, eBay | Bourns 16mm (different footprint) | 2-4 weeks | Eurorack standard. Order in bulk. |
| **TRACO TMR 3-1222WI** | Mouser, Digi-Key | Recom RxxD-1212 (verify dual ±12V P/N), Mornsun 1212S-1WR3 | 2-3 weeks | **Pedal SKU only**. Isolated DC-DC ±12V. |
| **Recom RxxD-1212 (verify dual ±12V P/N)** | Mouser, Digi-Key | TRACO TMR 3-1222WI (lower cost) | 2-3 weeks | **Pedal premium SKU**. Higher current 250mA. |
<!-- BBD V3207/V3102 removed per Decision 08 — vinyl FX moved to Last Day as OLD VINYL PT2399 parallel tract. -->
| **NE556N** ×1 | TI, multi-source | 2× LMC555 (CMOS variant) | 1 week | Dual timer Block 14 rewrite: TOLL escapement pulse + piezo MUTE window. vinyl-skip NE555 удалён в v6 — analog FG заменяет. |
| **ATtiny84A-PU** | Microchip via Mouser/Digi-Key | ATtiny44 (lower memory, same pinout) | 1 week | DIP-14, 12 GPIO + 8 ADC. v6.3 upgrade vs ATtiny85 — added FG TRIG + speed PWM + phase reset features required >5 GPIO. |
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
- **Sample order первым делом**: 10× pieces oak 100×45×1.8мм с linseed oil finish.
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
- Femur/humerus **cortical shaft** (диафиз), dried, polished. НЕ scapula: лопатка в основном губчатая (cancellous), кортикальный слой 1-2мм — цельной acoustic-grade плиты 2.5мм из неё не выйдет.
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
- **DAEX32Q-4**: order 60 (universal exciter — **per module** engine, Decision 11, не per cartridge).
- **BD139, BD140**: 60 each.
- **Piezo contact pickups**: 120 (2 per module + spares; module-internal, Decision 11 — mini-XLR устранён).
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

Last Night v2.2 — production-ready после applying 15 fixes из `../00_series/audit/fixes/01_last_night_fix_list.md`.

Single-unit DIY build: ~6 hours first time, ~2.5 hours experienced.

50-unit batch: ~21 working days с standard small-batch DIY tooling.

Per-unit BOM $83-112 (40HP), retail $450-550, gross margin 80%, net margin 60-65%.

**Roadmap**: Phase 1 ship 50 units → validate market → Phase 2 starts Last Day R&D.

---

*Last Night v2.2 — physical resonance, not algorithmic decay.*

> Production-ready production document.
> Source: `../00_series/audit/wood_reverb_logical_schematic.html` + `../00_series/audit/10_last_night_engineering.md` + `../00_series/fixes/`.
