# LAST DAY — Спецификация продукта

**Версия**: v1.0 (consolidated base — Decisions 02 + 08)
**Статус**: R&D Phase A (prototyping)
**Window**: Phase 2 ship per Decision 08 roadmap (12–24 месяца после Last Night Phase 1).

> Last Day — постапокалипсис-делей раскалённого полудня. Парный модуль к Last Night (холодная ночь). Oil-can delay + solar saturator + tongue resonator + горячая палитра character FX (HAZE/MIRAGE/BLEACH/TAR/CICADA/HEATWAVE) + perform жесты (DRAG/CRASH/KILL/FREEZE).

---

## Содержание

- [Обзор](#обзор)
- [Архитектура и signal flow](#архитектура-и-signal-flow)
- [Контролы и интерфейс](#контролы-и-интерфейс)
- [Картриджи — общий стандарт с Last Night](#картриджи)
- [Тембральный характер](#тембральный-характер)
- [Связь с Last Night (диптих)](#связь-с-last-night)
- [Phase plan и production roadmap](#phase-plan)
- [Открытые вопросы](#открытые-вопросы)

---

## Обзор

### Что это

Last Day — **electromechanical delay + tone shaping combine** на oil-can технологии (Tel-Ray inheritance, capacitive pickup на conductive oil dielectric). Solar amp как oil-can master saturator (LED baseline + opt. solar cell для outdoor performance). Inductive shelf EQ + physical tongue resonator (manual clamp v1, motorized v2 premium) для midrange character. Поверх — hot palette FX layer (HAZE/MIRAGE/BLEACH/TAR/CICADA/HEATWAVE/OLD VINYL) и 4 perform footswitches (KILL/FREEZE/DRAG/CRASH).

### Чем отличается от обычных pedal-delay

- **Реальный oil-can pickup**: conductive mineral oil как dielectric, capacitive sensing — не PT2399 emulation, не BBD, не digital DSP. Audio-rate analog charge transfer через rotating disk + electrodes.
- **Tongue resonator с физическим caподастром**: пользователь двигает clamp вдоль guide rail → меняет резонансную частоту mid-range. Q control через clamp pressure. Acoustic plate-tongue resonator wrapped в audio feedback loop.
- **Solar saturator**: solar cell + internal LED → starved supply для opening stage. Outdoor performance = sun-driven saturation. Indoor = LED baseline stable.
- **Hot palette FX antiподы Last Night cold palette**: каждый Last Day эффект — semantic mirror Last Night эффекта (HAZE↔PULSE, BLEACH↔FROST, TAR↔CHILL, CICADA↔GEIGER, HEATWAVE↔HUM, DRAG↔STALL, CRASH↔TOLL).
- **Cartridge стандарт един** с Last Night — те же mini-XLR + JST connectors, те же мехи retention. Можно swap-картриджи между модулями (один материал слышен и как plate-reverb, и как oil-can wet-tap delay material).

### Категория

**Постапокалипсис-делей с физическим механическим резонатором**.

Pedal-format конкуренты (closest analogue): Hologram Microcosm, Chase Bliss MOOD MkII, Strymon Volante, Catalinbread Belle Epoch Deluxe.

Но **никто из них не использует физическую oil bath с capacitive sensing + physical tongue resonator + solar saturation**. Last Day — категория из одного.

### Reality check (для customer expectations)

- **Oil-can delay** — не "clean digital delay". Bandwidth 200Hz–4kHz (limited by motor speed jitter + disk surface variation). Sound = hazy, midrange-heavy, gentle pitch wobble (~±10 cents natural wow + motor LFO).
- **Repeat times**: 60ms (motor fast) — 800ms (motor slow). Beyond — feedback regenerates artefacts.
- **Tongue resonator** — добавляет distinct mid bump (Q ≈ 5), sweepable 200Hz–2kHz (full clamp range). Не precision EQ — это physical resonance с harmonic series смешанная с fundamental.
- **Solar amp** — outdoor: ярко, ясно → больше gain, plate saturation. Indoor: LED baseline, default voltage. **Не unstable** — opt circuit ensures graceful fallback.
- **Service life**: oil может потерять conductivity через 12–24 месяца (зависит от additive). Replaceable oil reservoir (sealed cartridge service). Motor brush wear ~5000 hours (premium SKU = brushless motor option).

### Use cases

- **Dub / dub-techno** — oil-can wow/flutter + FREEZE + DRAG для traditional dub gestures, KILL для silence drops.
- **Drone / ambient** — tongue resonator sweepable + TAR compression → infinite molasses sustain. CICADA добавляет insect-cluster texture над drone bed.
- **Post-rock / shoegaze** — HAZE wow + BLEACH high saturation → cassette-tape-like character на guitar. Не digital ambience — physical.
- **Modular weirdo** — patch CV в HAZE rate, BLEACH threshold, motor brake (DRAG CV input) → motor-speed-controlled spectrum manipulation.
- **Performance / live** — CRASH solenoid impact (oil splash → hydrophone) для percussive moment, DRAG для pitch-drop transitions.

---

## Эффекты "горячей палитры" (hot-palette FX layer)

Согласно Decision 08 mapping:

| Эффект | Knob/Switch | Реализация | Антипод (Night) |
|--------|-------------|------------|------------------|
| **HAZE** | Knob (lin) | Periodic LFO 0.05–5 Гц → motor PWM duty → speed mod → wow/flutter. | PULSE |
| **MIRAGE** | Knob (lin) | Aperiodic pitch drift ±10 центов через noise → S&H → slew → motor mod. | FOG |
| **BLEACH** | Knob (log) | HF saturation 4–12 кГц с solar-driven threshold. Soft-clip diodes. | FROST |
| **TAR** | Knob (log) | Peak-hold compressor с long-attack залипанием ~500 мс. Anti-CHILL. | CHILL |
| **CICADA** | Knob (lin) | Cluster tick generator: noise → env follower → comparator → retrigger bursts. Signal-correlated плотность. | GEIGER (cold half) |
| **HEATWAVE** | Knob (log) | AM-tuner front-end (TA7642) + ferrite antenna → detector → mix. Голос мёртвой ионосферы. | HUM |
| **OLD VINYL** | Knob (lo-fi char) | PT2399 в parallel с oil-can magnetic tract — добавляет grunge/bitcrush к delay tail. | Phaser (опционально) |
| **DRAG** | Footswitch (momentary) | MOSFET shorts motor → pitch уходит вниз, decay fades to silence. | STALL |
| **CRASH** | Footswitch (momentary) | Solenoid удар по oil bath → splash в delay через hydrophone. | TOLL |
| **KILL** | Footswitch (momentary) | Input mute. | KILL (общий gesture) |
| **FREEZE** | Footswitch (latching) | Erase head disabled → content loops infinitely, slowly degrades. | FREEZE (общий gesture) |

---

## What's in the box

- Last Day module (Eurorack 40HP или big-box pedal 203×140мм — две SKU).
- 1 starter cartridge: **Disk Capacitive Oil-can** (default v1 cartridge — sealed acrylic disk + 60ml conductive mineral oil + capacitive sensing electrodes).
- 12V DC PSU (pedal SKU): 12V center-negative, 800mA min (regulated).
- USB stick: SPEC.docx, BUILD.docx, oil-refill procedure manual.
- Knurled-knob set (×7 hot palette + ×4 master + ×3 EQ + 4 footswitches).
- Spare disk surface (replacement, для prolonged service).
- 1× oil refill bottle (60ml conductive mineral oil + additive).

### Compatibility — Eurorack ↔ Pedal

Same PCB, two enclosures.

- **Eurorack SKU**: 40HP × 128.5мм, ±12V Eurorack power, large performance buttons вместо footswitches.
- **Pedal SKU**: 203×140мм big-box (matches Strymon BigSky / Eventide H9 Max класс), 12V DC center-negative, isolated DC-DC → ±12V audio rails (same headroom как Eurorack).

I/O identical: TRS stereo + RCA stereo параллельно + 3.5мм mini-jack patch bay для CV (15 jacks Eurorack / 21 jacks pedal).

---

## Архитектура и signal flow

### High-level signal chain

```
   Input (instrument / line / +4dBu)
        │
        ▼
   ┌──── Input buffer (TL072 ×1) ──── Input level knob ────┐
   │                                                        │
   │  Dry split tap ──► to dry mix bus (Block "MIX")        │
   │                                                        │
   └──► Solar amp / starved opening stage ──┐
                                              │
                                              ▼
                                ┌──── Oil-can delay engine ─────┐
                                │                                │
                                │  Capacitive write electrode    │
                                │      ↓                          │
                                │  Rotating oil disk             │
                                │  (motor: 60–800 ms repeat)     │
                                │      ↓                          │
                                │  2× Capacitive read electrodes │
                                │      ↓                          │
                                │  L tap (early) + R tap (late) → stereo wet │
                                └────────────┼───────────────────┘
                                              │
                                              ▼
                                ┌─── Inductive shelf EQ + tongue resonator ───┐
                                │                                              │
                                │  Low shelf inductor (Hammond)               │
                                │  High shelf inductor                        │
                                │  Tongue resonator (physical plate-tongue    │
                                │   с clamp position pot OR encoder v2)        │
                                │                                              │
                                └──────────────┼────────────────────────────────┘
                                                │
                                                ▼
                                ┌─── Hot palette FX layer ───┐
                                │                            │
                                │  HAZE (motor mod)          │
                                │  MIRAGE (noise→S&H mod)    │
                                │  BLEACH (HF sat)           │
                                │  TAR (compressor)          │
                                │  CICADA (cluster ticks)    │
                                │  HEATWAVE (AM-tuner mix)   │
                                │  OLD VINYL (PT2399 parallel)│
                                │                            │
                                └──────────────┼─────────────┘
                                                │
                                                ▼
                                ┌─── Feedback loop ───┐
                                │  RV_FEEDBACK (regen)│
                                │  Soft-clip limiter  │
                                │  (1N4148 diodes)    │
                                └──────────┼──────────┘
                                            │
                                            ▼
                                ┌─── Mix bus (TL074) ──┐
                                │  Dry ←── RV_DRY      │
                                │  Wet ←── RV_WET      │
                                │  CICADA/HEATWAVE/etc. ←── per-FX summing │
                                └──────────┼──────────┘
                                            │
                                            ▼
                                ┌─── Output buffer + perform gates ──┐
                                │  CMOS switch для KILL              │
                                │  Erase disable для FREEZE          │
                                │  Motor MOSFET short для DRAG       │
                                │  CRASH solenoid trigger            │
                                └──────────┼──────────────────────────┘
                                            │
                                            ▼
                                       Output L + R
```

### Что происходит звуку (по блокам)

**Solar amp**:
- Class A discrete BJT amp с starved supply (3–8 В variable).
- Solar cell + photoresistor → control voltage → opt rail.
- Outdoor: bright light → high rail → low compression → clean amp.
- Indoor: LED baseline → fixed ~5V rail → mild compression.
- Saturation = harmonic enrichment + asymmetric distortion (BJT-friendly).

**Oil-can engine**:
- Disk speed controlled by PWM-driven DC motor (BLDC opt premium SKU).
- Motor speed: 200 RPM (slow, 800ms repeat) → 2000 RPM (fast, 60ms repeat).
- Capacitive pickup: write electrode + 2 read electrodes 90°/180° offsets → L/R stereo taps.
- Modulation paths: HAZE adds periodic LFO к motor PWM, MIRAGE adds aperiodic S&H, DRAG (footswitch) shorts motor to GND → coasts to stop.

**Tongue resonator**:
- Physical metal tongue strip 80×8×0.4mm bolted в slot.
- Clamp moves along strip via lead screw → effective tongue length changes → resonant frequency changes.
- Manual v1: panel knob rotates lead screw via PTFE flexible coupling.
- Motorized v2: stepper motor + encoder → CV position recall.
- Q: tongue clamp pressure (knob adjusts spring tension on clamp jaw).
- Sweep range: 200Hz (full extension) — 2kHz (clamp at base).

**Hot palette FX**: каждый эффект — opt layer over delay output. Per-FX VCAs allow mute/blend.

---

## Контролы и интерфейс

### Раскладка панели — Pedal SKU (203×140мм, big-box class)

```
┌───────────────────────────────────────────────────────────────┐
│ LAST DAY — postapocalypse oil-can delay combine              │
│                                                                │
│   ┌──────────┐  ┌──────────────────────────┐  ┌──────────┐   │
│   │ MOTOR    │  │  TIME · FEEDBACK · MIX   │  │ CARTRIDGE│   │
│   │ SPEED    │  │                          │  │  SLOT    │   │
│   │ slider   │  │  (top row: master)       │  │ (oil-can │   │
│   │ 1P5T     │  │                          │  │  disk    │   │
│   │ presets  │  │  ⊙Time  ⊙FB    ⊙Mix     │  │  visible)│   │
│   └──────────┘  └──────────────────────────┘  └──────────┘   │
│                                                                │
│   Row A: ⊙HAZE  ⊙MIRAGE  ⊙BLEACH  ⊙TAR  ⊙CICADA  ⊙HEATWAVE   │
│   Row B: ⊙OLD VINYL  ⊙LO SHELF  ⊙HI SHELF  ⊙TONGUE  ⊙Q  ⊙Solar│
│   Row C CV bay: ⊙Time  ⊙FB  ⊙Speed  ⊙Mix  ⊙Tongue  ⊙TAP_IN   │
│   Row D CV bay: ⊙HAZE  ⊙MIRAGE  ⊙BLEACH  ⊙TAR  ⊙CICADA  ⊙HEAT │
│                                                                │
│   ┌─────────────────────────────────────────┐                  │
│   │  Solar cell window (5×3 см на лицевой)  │                  │
│   │  + internal LED behind diffuser         │                  │
│   └─────────────────────────────────────────┘                  │
│                                                                │
│   Tongue resonator slot (visible tongue strip):                │
│   ┌─────────────────────────────────────────┐                  │
│   │  ╔═══════════════════════════════════╗  │                  │
│   │  ║ Tongue strip + clamp position bar ║  │                  │
│   │  ╚═══════════════════════════════════╝  │                  │
│   └─────────────────────────────────────────┘                  │
│                                                                │
│   Footswitches (bottom row):                                   │
│   [KILL]  [FREEZE]  [DRAG]  [CRASH]                            │
│                                                                │
│   Audio I/O (back panel): IN (TRS/RCA), OUT L+R (TRS/RCA),     │
│   12V DC jack, expression pedal jack                            │
└───────────────────────────────────────────────────────────────┘
```

**MOTOR SPEED slider 1P5T** (5 положений) — preset speed для disk motor:
- Pos 1: **SLOW** (60 RPM → ~800ms repeat)
- Pos 2: **MEDIUM-SLOW** (250 RPM → ~480ms)
- Pos 3: **MEDIUM** (650 RPM → ~250ms)
- Pos 4: **FAST** (1200 RPM → ~140ms)
- Pos 5: **WIRE** (2000 RPM → ~60ms, doubles as "chorus mode")

Continuous control via ⊙Time + CV ⊙Time для fine adjustment.

### Раскладка панели — Eurorack SKU (40HP × 128.5мм)

Та же layout, но:
- Footswitches заменены на **large performance buttons** (push-momentary, 12 мм tall).
- CV bay denser (15 mini-jacks вместо 21 у pedal — pedal duplicates some jacks как RCA/TRS на back).
- Solar cell window обязателен (open panel face for outdoor performance).

### Полная таблица контролов

| Группа | Контрол | Тип | Диапазон / функция |
|--------|---------|-----|---------------------|
| **Master** | ⊙Time | 100kΩ log | Motor speed (60ms–800ms repeat) |
| | ⊙FB | 100kΩ lin | Feedback regen 0–95% |
| | ⊙Mix | 100kΩ lin (center detent) | Dry/wet blend |
| **Motor presets** | SL-1P5T slider | 5-position | SLOW / M-SLOW / M / FAST / WIRE |
| **Hot palette** | ⊙HAZE | 100kΩ lin (center detent) | Periodic motor mod depth |
| | ⊙MIRAGE | 100kΩ lin | Aperiodic pitch drift depth |
| | ⊙BLEACH | 100kΩ log | HF saturation amount |
| | ⊙TAR | 100kΩ log | Compressor sustain |
| | ⊙CICADA | 100kΩ lin | Cluster tick density |
| | ⊙HEATWAVE | 100kΩ log | AM-tuner mix level |
| | ⊙OLD VINYL | 100kΩ lin | PT2399 parallel grunge |
| **EQ + resonator** | ⊙LO SHELF | 50kΩ lin (cut/boost ±12dB @ 150Hz) | Inductor low shelf |
| | ⊙HI SHELF | 50kΩ lin (±12dB @ 4kHz) | Inductor high shelf |
| | ⊙TONGUE | 10kΩ lin (clamp position via lead screw) | 200Hz–2kHz resonant freq |
| | ⊙Q | 100kΩ lin (clamp pressure → spring tension) | Q 1–8 |
| **Saturator** | ⊙Solar | 100kΩ log | Internal LED brightness (+ solar override) |
| **Switches** | SW_INDOOR | SPDT | LED-only / Solar-enabled |
| | SW_REGION | DPDT slide | 50Hz / 60Hz (for HEATWAVE tuning baseline) |
| **Footswitches** | KILL | momentary 3PDT | Input mute |
| | FREEZE | latching 3PDT | Erase head disable → loop |
| | DRAG | momentary 3PDT | Motor brake (pitch fall) |
| | CRASH | momentary 3PDT | Solenoid oil-splash impact |

### CV Patch Bay (Pedal: ~21 jacks; Eurorack: ~15 jacks)

**Audio I/O**:
- IN (mono TRS + dual RCA в parallel)
- OUT L, OUT R (stereo TRS + dual RCA)
- DRY OUT, WET OUT (separate post-buffer taps)

**CV Inputs (Phase 1)**:
- IN level CV
- Time CV (motor speed CV → ±5V → speed mod)
- FB CV
- Speed CV (alias of Time CV для clarity на panel)
- Mix CV
- Tongue position CV (CV → stepper motor v2 premium только)
- TAP_IN gate (TAP sync motor speed к beat)
- HAZE / MIRAGE / BLEACH / TAR / CICADA / HEATWAVE CV (per-FX modulation)
- Solar CV (override solar voltage from external)

**Gate / trigger inputs (modular advanced)**:
- KILL_TRIG
- FREEZE_TRIG
- DRAG_TRIG (gate → motor brake duration)
- CRASH_TRIG

### Cartridge connector (внутри slot, идентичен Last Night)

- 2× mini-XLR (Switchcraft TA3F) — capacitive read electrodes A + B (stereo wet taps).
- 2× JST-XH 2-pin — disk motor power + write electrode HV bias (~30V).
- 4× neodym магниты для retention.
- 1× retention pin (anti-pull, springloaded).

---

## Картриджи — общий стандарт с Last Night

Cartridge frame identical: 110×65×30мм PETG (production: anodized aluminium). Mini-XLR + JST соответствуют Last Night.

Cartridge различия по содержанию:

| Cartridge type | Content | Use в Last Night | Use в Last Day |
|----------------|---------|-------------------|-----------------|
| **Material plate** | Wood/stone/metal/glass plate + exciter + dual piezo | Plate reverb resonator | **Wet tap acoustic body** (signal через physical plate as series resonator перед oil-can) |
| **Oil-can disk** | Sealed acrylic disk + 60ml conductive oil + capacitive electrodes | Wet tap acoustic body (delay sub за reverb tail) | **Primary delay engine** |
| **Premium PVDF plate** | Plate + PVDF pickup | Plate reverb premium | High-precision wet acoustic body |

> **Key insight**: один cartridge стандарт служит обоим модулям. User может вставить material plate в Last Day → получает plate-as-pre-delay-resonator (тот же материал, но как mid-stage filter, не reverb). И наоборот — oil-can disk в Last Night → tap delay sub за reverb tail.

### Картридж swap procedure

Идентична Last Night:
1. Power off module.
2. Push retention pin → cartridge releases.
3. Pull cartridge straight out (mini-XLR + JST auto-disconnect via spring).
4. Insert new cartridge → push в slot → retention pin auto-locks.
5. Power on.

Hot-swap не рекомендуется (потенциальный pop на capacitive write electrode при breaking +30V HV bias path).

---

## Тембральный характер

### Общий character

- **Hazy**: midrange-heavy, slight pitch wobble (~±10 центов natural disk surface variation), bandwidth 200Hz–4kHz typical.
- **Organic**: каждый "repeat" чуть-чуть different — disk surface не идеальна, capacitive sensing meander с small variations.
- **Warm**: solar amp adds harmonic richness (even harmonics dominate), inductor EQ adds gentle phase shift.
- **Alive**: tongue resonator буквально звенит в hands (small Q ≈ 5, but audible в acoustic body of pedal).

### По регистру

- **Bass**: oil-can clips bass naturally (motor speed wow exaggerates на низах, < 100Hz unstable). LO SHELF позволяет boost up to ±12dB @ 150Hz.
- **Mid**: tongue resonator + inductor shelf даёт rich midrange character.
- **Highs**: limited by capacitive pickup bandwidth (~4kHz natural roll-off). BLEACH saturator восстанавливает HF через harmonic generation.

---

## Связь с Last Night (диптих)

Согласно Decision 08 symmetric mapping:

| Cold (Last Night) | ↔ | Hot (Last Day) | Phenomenon |
|-------------------|---|----------------|------------|
| Phaser (immersion) | ↔ | OLD VINYL (PT2399 parallel) | Tape/vinyl decay character |
| PULSE | ↔ | HAZE | Periodic modulation |
| FOG | ↔ | MIRAGE | Aperiodic drift |
| FROST | ↔ | BLEACH | HF subtract ↔ add |
| CHILL | ↔ | TAR | Expander ↔ compressor |
| GEIGER | ↔ | CICADA | Sparse ticks ↔ cluster ticks |
| HUM | ↔ | HEATWAVE | Mains hum ↔ AM tuner ионосфера |
| STALL | ↔ | DRAG | Held damper ↔ motor brake |
| TOLL | ↔ | CRASH | Strike plate ↔ strike oil |
| KILL | ↔ | KILL | Common gesture |
| FREEZE | ↔ | FREEZE | Common gesture |

**Patch-pair use cases**:
- Set Last Night tail → tap of tail into Last Day input → Last Day delays the reverb → output combines into ambient bed.
- Cross-CV: Last Night solenoid TOLL gate → Last Day CRASH trigger → synchronized "bell + splash" gesture.
- Cartridge swap drama: material plate из Night → Day mid-stage (or vice versa) → instrument has TWO acoustic bodies in series.

---

## Phase plan

Per Decision 08 consolidated roadmap (Last Day track):

| Phase | Window | Deliverable |
|-------|--------|-------------|
| **Phase A** (months 1–12) | R&D ongoing | Prototype motor + capacitive pickup + oil bath sealed cartridge + inductive EQ + manual tongue resonator + solar amp с LED baseline. **v1 ship**: KILL + FREEZE + DRAG + HAZE (4 base perform FX) + LO/HI shelf + tongue Q + Time/FB/Mix master + Solar. |
| **Phase B** (months 12–18, ~9 после Last Night ship) | Hot palette v1 | Add MIRAGE / BLEACH / TAR / CICADA / HEATWAVE / OLD VINYL / CRASH. Full hot palette implementation. v1.5 ship. |
| **Phase B2** | months 18–27 | Motorized tongue resonator с encoder + CV-recall preset (v2 premium SKU). |
| **Phase C** (months 27+) | Boutique tier | Premium oil formulations (graphene-doped, ionic liquid alternatives). BLDC motor option (low-jitter). Solid copper corpus. Aligned с Last Night Decision 10 Elite tier. |

**v1 ship timeline**: **~12 месяцев после Last Night Phase 1 ship**. Last Day v1 release window: months 21–27 после project kickoff.

---

## Открытые вопросы

1. **Oil composition** — conductive mineral oil с graphite additive (cheapest) vs ionic liquid alternative ($30/100мл) vs premium graphene-doped ($100/100мл). Decision на BOM cost vs longevity tradeoff.
2. **Motor selection** — brushed DC ($3, 5000h life) vs BLDC ($15, 30000h life). Premium SKU recommendation: BLDC. Budget SKU: brushed.
3. **Solar cell sourcing** — small format (40×30мм) от Mouser ($2–8) vs custom transparent encapsulated ($20+). Decision на aesthetic vs cost.
4. **PT2399 OLD VINYL parallel tract** — wet level dominates how much grunge bleeds в clean delay tap. Default mix level?
5. **HEATWAVE tuning baseline** — region switch 50Hz/60Hz primarily для AM-tuner reference voltage, but tuning capacitor range needs final spec. 535–1605 kHz AM band is target.
6. **CRASH hydrophone** — piezo disk submerged в oil bath. Cable feedthrough requires hermetic sealing (что не trivial при cartridge swap). Alternative: external hydrophone в separate sealed oil pocket?
7. **Tongue resonator Q** — clamp pressure control via knob — needs механический prototype to validate that user-friendly Q range (1–8) achievable без torque-amplifier mechanism.
8. **Production strategy** — Day shares ~60% PCB с Night, ~40% Day-specific (motor driver, capacitive pickup analog frontend, inductor EQ network, solar amp). Single PCB design with depopulated variants vs two PCB designs?

---

## Документация

- `LAST_DAY_BUILD.md` — детальная build documentation (R&D Phase A — TBD после prototype completion).
- `decisions/02_last_day_scope.md` — D1–D6 decisions.
- `decisions/08_consolidated_base.md` — diptych consolidation, hot/cold palette mapping.
- `SYSTEM_SUICIDE.md` §10 — Last Day brief в series context.

---

**Last Day = Last Night's hot twin. Same architecture (cartridge slot + FX engine + perform footswitches), different physical phenomenon (oil-can delay vs plate reverb), different temperature (raskali polden vs holodnaya noch). Together — диптих.**
