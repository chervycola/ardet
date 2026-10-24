# PCB layout guide — Last Night

Правила размещения компонентов и разводки для минимизации шума, crosstalk, thermal issues. Применять в KiCad PCB editor.

---

## A. Стратегия GND — AGND / DGND separation

### Зоны

**Analog Ground (AGND)** — сигнальная цепь:
- Input buffer → preamps → tone filter → VCA → mix output.
- Piezo preamps (критическая зона, lowest noise priority).
- EQ (pre/de-emphasis).
- Mix summing.

**Digital/Switching Ground (DGND)** — шумная цепь:
- Solenoid driver Q5 + flyback D_SOL.
- Noise generator Q4 / zener.
- Switch contacts (SW_FREEZE).
- LED indicators.

**Power Ground (PGND)** — высокотоковая:
- Push-pull Q1/Q2 emitters через R6/R7.
- C_DC discharge path.
- R8 current return.

### Соединение зон

Три зоны соединены в **единой точке** около power connector (IDC 2×5 или jack). Это star-ground.

**Правильно**:
```
Power conn ──┬── AGND pour (top + bottom)
              ├── DGND pour (разделённая zona)
              └── PGND (thick trace обратно к IDC)
```

**Неправильно**:
```
AGND ── shared pour ── DGND ── shared pour ── PGND
        (ground loops, switching noise в аудио)
```

### Рекомендация

**4-layer PCB**:
- Layer 1 (top): components + signal traces.
- Layer 2 (internal): **AGND plane** (solid, не split).
- Layer 3 (internal): **Power plane** (±12V, split для +12/-12).
- Layer 4 (bottom): signal traces + DGND/PGND pours.
- Via stitching: AGND plane к top/bottom GND pours, DGND/PGND изолированы, соединены только через 0Ω jumpers на star point.

**2-layer PCB** (budget):
- Top: components + signal.
- Bottom: **split GND pour** — большая AGND зона, отдельные DGND и PGND зоны. Соединены star через узкие (0.5мм) traces к power connector.
- Риск выше — требует careful routing.

---

## B. Размещение зон

### Зона 1 — Power (right edge, near connector)

- IDC connector (Eurorack) или DC jack (pedal).
- 1N5817 reverse protection.
- Bulk caps (C_B1, C_B2, C_B3) около IC.
- Decoupling 100nF pairs возле каждого IC.
- TRACO TMA1212D (pedal only) — максимально далеко от preamp zone.

### Зона 2 — Driver amp (next to power)

- U1B (half of TL072).
- BD139 / BD140 — с thermal pad 10×10мм caждому, соединён с chassis через screw mount.
- R8 5W wirewound — вертикально mounted или с зазором от PCB для convection cooling.
- C_DC 220µФ/1000µФ electrolytic.
- J_EX exciter jack (JST-XH).

**Thermal**: Q1/Q2/R8 — hottest zone. Разместить у edge PCB для air flow.

### Зона 3 — Signal path (center)

- Input buffer (U1A).
- Pre-emphasis (U3A).
- De-emphasis (U4C).
- Tone filter (U2A).
- Clip LEDs (D1/D2).
- VCA (U5 LM13700).
- Mix (U2D).

**Routing**: signal flows top-to-bottom или left-to-right согласно block diagram. Не делать loopback без intention.

### Зона 4 — Piezo preamp (critical low-noise, isolated)

- **J_PA, J_PB mini-XLR** connectors в edge PCB.
- **Q3A/Q3B LSK489A** SMD сразу за connectors (минимизировать trace length).
- **Guard ring** вокруг JFET gate pads — 0.5мм wide GND trace по контуру, via stitching.
- **R_PA, R_PB 10МΩ** — максимально close к JFET gates. Гигантская impedance = susceptible to EMI.
- U3B, U4C gain stages.
- Position crossfade (RV_POSITION).

**Routing**:
- Piezo signal traces **короткие** (<20мм), прямые.
- **Surround с GND**: top layer signal trace, GND pour с обеих сторон + GND plane снизу → de facto coaxial.
- **Избегать parallel routing** с solenoid или power traces.

### Зона 5 — Feedback/freeze (center-left)

- U4A (feedback summing).
- SW_FREEZE toggle switch.
- D_LIM1/D_LIM2 1N4148.
- RV_FEEDBACK pot.

### Зона 6 — VCA envelope (bottom)

- U5 LM13700 (OTA).
- Envelope follower: D_EF, C_ENV, RV_ATTACK, RV_DECAY.
- R_BLIN, R_IABC, R_VCA_LOAD.

### Зона 7 — Noise generator (isolated from signal)

- BZX55C9V1 zener (or BC547 legacy).
- U2C amp.
- RV_COLOR, RV_NOISE.
- **GND**: local DGND island, single point tie.

### Зона 8 — Solenoid driver (opposite corner от preamps)

- Q5 2N7000 (или AO3400 logic-level).
- D_SOL 1N4001 flyback.
- R_DAM1, R_DAM2, R_DAM3.
- J_SOL JST connector.

**Isolation**: минимум **40мм** между Q5 switching node и Q3A/Q3B JFET gates. Физически на противоположных сторонах PCB если возможно.

### Зона 9 — Output (edge, opposite input)

- U2D mix amp.
- C_OUT, R_OUT.
- J_OUT_L, J_OUT_R.
- J_CV_MIX, J_CV_DECAY, J_CV_DAMP, J_SIDE — CV/audio jacks.

---

## C. Trace routing правила

### Signal traces

- **Minimum width**: 0.2мм (8mil) для audio. 0.3мм рекомендуется.
- **High-impedance nets (>1МΩ)**: R_PA, R_PB gates, piezo lines — trace короткая, с guard ring, без passing через digital zones.
- **Phase critical**: summing nodes — все inputs симметричны по length, ~30мм от source до summing junction.

### Power traces

- **±12V rails**: 0.5мм (20mil) minimum. 1мм для push-pull current path.
- **Decoupling loops**: каждый 100nF decoupling → IC VCC pin → ground должны быть как можно **меньше по площади** (minimize inductance).

### Crosstalk

- **Parallel traces**: keep > 3× trace width apart (например, 0.6мм gap для 0.2мм traces).
- **Over different layers**: routing signals perpendicular на adjacent layers снижает coupling.
- **Avoid stubs**: каждый trace имеет single destination, без T-junctions на audio paths.

### Via placement

- **AGND vias**: stitching каждые 5–10мм вдоль critical traces.
- **Power vias**: parallel для current carrying (если >500мА).
- **Signal vias**: минимизировать, особенно на high-impedance lines.

---

## D. Специфические high-risk zones

### JFET gate trace (критично)

```
J_PA (shielded jack) ──[short 5-10мм trace inside guard ring]── Q3A gate pin
                                                                    |
                                      R_PA 10МΩ (close к gate) ─────┘
                                                                    |
                                                                   GND (AGND)
```

- Trace **окружена GND pour** на top layer.
- **GND plane** прямо под trace на layer 2.
- **Guard ring**: 0.5мм GND trace вокруг gate area, via stitching.
- **No vias** на gate trace.
- **Silkscreen note**: "DO NOT ROUTE OTHER SIGNALS NEAR" на top layer.

### Solenoid driver loop

```
+12V ──── Solenoid ──── D_SOL flyback ──── Q5 drain ──── Q5 source ──── PGND
```

- Loop area **минимальная** — компоненты плотно, loop < 100мм².
- **Снуббер** RC (option): 100Ω + 100нФ across solenoid — smoothes transients.
- Route **perpendicular** к preamp zone.
- Optional: **ferrite bead** на solenoid lines перед J_SOL connector.

### Push-pull output

```
U1B ──── R5 100Ω ──── Q1 base ──── Q1 emitter ──── R6 10Ω ─┐
                      │                                     │
                     -12V                                   ├── PP_OUT ── C_DC ── R8 ── J_EX
                                                            │
         ──── Q2 base ──── Q2 emitter ──── R7 10Ω ──────────┘
                      │
                     +12V
```

- **Symmetry**: Q1 и Q2 paths одинаковой длины (matching).
- **Thermal coupling**: Q1 и Q2 в thermal contact (glued together или pad shared) — уменьшает bias drift.
- **R8 isolated**: separate thermal zone (hottest component).

---

## E. Component spacing

| Component | Mount style | Spacing | Notes |
|-----------|-------------|---------|-------|
| TL072/TL074 DIP | PTH | 0.1" pitch | Socket optional для U5 LM13700 (замена при burn-out). |
| LSK489A SOT-23-6 | SMD | 0.65мм pitch | Hot-air rework capable placement. |
| BD139/BD140 TO-126 | PTH | 5мм lateral | Thermal pad shared или individual 10×10мм каждый. |
| 2N7000 TO-92 | PTH | 2.54мм | Standard. |
| BZX55C9V1 DO-35 | PTH | Axial | 7мм body length. |
| Alpha RV09 pots | PTH, panel-mount | 12мм center-center | До 10 pots в один ряд для 40HP panel (203мм width). |
| Thonkiconn jacks | PTH, panel-mount | 15мм center-center | До 12 jacks в ряд для 40HP. |
| Mini-XLR | Panel mount | 20мм center-center | Edge of PCB. |
| Electrolytic caps | PTH axial or radial | 5мм min от other components | Polarity marking on silkscreen. |

---

## F. Board size recommendations

**40HP Eurorack — CANONICAL** (203×128.5мм panel):
- PCB 190×108мм.
- Generous space для proper zone separation, star-ground integrity.
- 10 pots в один ряд + jacks под ними + cartridge slot — все помещается без compromise.
- Mirrors Last Day 40HP — visually coherent series.
- 4-layer PCB recommended для production (premium SKU); 2-layer acceptable для budget.

**Smaller variants (alternative SKUs)**:

**20HP Eurorack** (101×128.5мм panel):
- PCB 100×108мм — compact mini SKU.
- Drop FB SEND/RETURN, smaller cartridge slot, stacked pots.
- Cost reduction $50, retail target $300.

**16HP Eurorack** (81×128.5мм panel):
- PCB 78×110мм — budget mini SKU.
- 5 pots only (drop sidechain, noise color, position).
- Mono only (no stereo path).
- Cost reduction $80, retail target $250.

**Pedal 125B** (122×66мм):
- PCB ~110×60мм — landscape orientation.
- Очень tight. Consider **Eventide PitchFactor size 190×122мм** (как заявлено) для нормального layout.

---

## G. Checklist перед gerber generation

- [ ] AGND/DGND/PGND зоны визуально separated в PCB viewer.
- [ ] Star-ground connection point identified (single location near power connector).
- [ ] JFET gates surrounded by guard ring on all layers.
- [ ] Piezo signal paths < 20мм длины.
- [ ] Solenoid driver >40мм от JFET preamps.
- [ ] Thermal pads 10×10мм под Q1/Q2 и их connection to chassis.
- [ ] R8 vertically mounted или лишён contact с sensitive traces.
- [ ] Decoupling 100nF within 5мм от каждого IC VCC pin.
- [ ] Bulk electrolytic (C_B3 47µФ) near power input.
- [ ] ERC passes без errors (Electrical Rules Check).
- [ ] DRC passes без errors (Design Rules Check).
- [ ] Silkscreen имеет orientation marks для polarized components.
- [ ] Mounting holes (4× M3) на corners, not overlapping traces.
- [ ] Panel mount jacks align с panel cutout template.

---

## H. Производство

### Prototype (single board)

- **JLCPCB** или **PCBWay**: 5 штук 2-layer FR4 ~$15, lead 1 week.
- **4-layer**: +$30, lead 2 weeks.
- Stencil для SMD (LSK489A): +$15.

### Small batch (50 штук)

- 2-layer $100 total = $2 per board.
- 4-layer $300 = $6 per board.
- Better price per unit, но committing to rev.

### Rec для первой prototype

1. **One 2-layer board** для component placement verification.
2. If passes hand tests → second order: **4-layer 5 штук** для noise measurement.
3. If 4-layer показывает significant improvement (measure noise floor на preamp output), commit 4-layer для production.

---

## I. Troubleshooting common PCB noise issues

**Симптом**: Continuous hum 50/60Гц в выходном сигнале.
- Cause: ground loop через chassis / shared PSU.
- Fix: star-ground connection, проверить single-point tie.

**Симптом**: Click/pop при активации солeноида.
- Cause: EMI connection solenoid → preamp.
- Fix: shield solenoid + twisted pair cable + physical separation.

**Симптом**: Высокий шум floor на preamp output.
- Cause: JFET gate trace antenna effects, или power supply noise.
- Fix: guard ring, PSU LC filter, 4-layer PCB.

**Симптом**: Самовозбуждение на резонансной частоте при high RV_FEEDBACK.
- Cause: loop gain > 1 at resonance.
- Fix: SPICE verification, add notch filter, or reduce max gain.

**Симптом**: Перегрев R8 wirewound.
- Cause: underrated power (если 1/4W вместо 5W установлен).
- Fix: заменить на 5W, vertical mount.
