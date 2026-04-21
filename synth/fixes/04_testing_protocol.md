# Testing protocol — Last Night первый прототип

План валидации rev A прототипа. Каждый тест: **цель / оборудование / процедура / pass criterion / what-if-fail**.

Выполнять в порядке. Не переходить к следующему, пока предыдущий не passed.

---

## Phase 0 — Visual inspection (перед питанием)

### T0.1. Component placement audit

**Цель**: убедиться, что все компоненты установлены правильно, без swapped / missing.
**Оборудование**: multimeter, увеличительное стекло 10×.
**Процедура**:
1. Visually проверить каждый компонент против silkscreen — ref designator совпадает.
2. Проверить orientation diodes (cathode band match silkscreen).
3. Проверить polarity electrolytic caps (длинная leg = +).
4. Проверить transistor pin-out (BD139 vs BD140 pinouts mirror).
5. Проверить IC orientation (pin 1 indentation vs silkscreen dot).
**Pass**: все компоненты match reference.
**Fail**: rework, перепроверить.

### T0.2. Solder joint inspection

**Цель**: нет cold joints, solder bridges, missing connections.
**Оборудование**: 10× loupe, multimeter (continuity).
**Процедура**:
1. Визуально — каждая солдер-joint shiny, не dull.
2. Continuity test: проверить, что все ground pins connected через ERC nets.
3. Проверить: **нет мостов** между adjacent pads (особенно SMD LSK489A).
4. **Power rails**: +12V to GND на IDC pins — no short (Ohms reading infinite).
**Pass**: no shorts, no opens, joints look clean.
**Fail**: re-solder или clean bridges.

---

## Phase 1 — Power rail validation

### T1.1. Unloaded power on

**Цель**: убедиться, что rails работают без перегрузки.
**Оборудование**: DC PSU (±12V, current limit 100мА), multimeter.
**Процедура**:
1. Set current limit PSU на **50мА** на каждую шину.
2. Connect ±12V к IDC connector (Eurorack orientation).
3. Turn on. Watch current draw.
4. Measure voltage на каждой IC VCC pin — должно быть ±12V ±5%.
5. Measure current draw.
**Pass**: Current <50мА idle. All ICs see ±12V.
**Fail (short circuit)**: отключить power, найти short с ohmmeter, fix.
**Fail (missing voltage на IC)**: open trace или cold joint на power rail, reflow.

### T1.2. Decoupling ripple check

**Цель**: убедиться, что decoupling работает — нет switching noise на IC rails.
**Оборудование**: осциллограф (20MHz bandwidth enough).
**Процедура**:
1. Probe ±12V rail возле каждого IC.
2. AC coupling, 10мВ/div.
3. Look for ripple, switching noise.
**Pass**: <10мВ pp ripple on both rails.
**Fail (ripple >50мВ)**: check bulk caps, 100nF decoupling. Добавить 10µФ ceramic у проблемного IC.

---

## Phase 2 — Per-block functional test

Выполнять в порядке signal flow.

### T2.1. Input buffer + pre-emphasis

**Цель**: проверить U1A buffer + U3A pre-emphasis.
**Оборудование**: signal generator (1кГц 100мВ), oscilloscope.
**Процедура**:
1. Set RV_BOOST fully CCW (no boost).
2. Signal 100мВ sine 1кГц to J_IN.
3. Probe BUF_OUT (after U1A) → 100мВ.
4. Probe PE_OUT (after U3A) → 100мВ (no boost, flat).
5. Turn RV_BOOST fully CW.
6. Sweep frequency 100Гц–20кГц на signal gen.
7. Measure PE_OUT amplitude vs frequency.
**Pass**: 
- BUF_OUT == input (unity gain).
- PE_OUT flat below 1кГц, +8dB at 10кГц (shelving).
**Fail (no signal на PE_OUT)**: check U3A power, input connection.
**Fail (strange shelf)**: check C_PE1 value, R_PE1 placement.

### T2.2. Driver amp + exciter drive

**Цель**: проверить push-pull output, crossover distortion.
**Оборудование**: signal generator, oscilloscope, dummy load 4Ω 10W резистор (в place of exciter).
**Процедура**:
1. Set RV_DRIVE fully CW.
2. Signal 100мВ 1кГц sine.
3. Connect dummy load между J_EX terminals (for safe testing).
4. Probe PP_OUT (после C_DC) — watch zero-crossing.
5. Look for crossover notch.
6. Repeat с RV_DRIVE различные positions.
**Pass**: 
- PP_OUT amplitude monotonically scales с RV_DRIVE.
- **No visible crossover notch** на zero crossing (если bias diodes IM1 установлены).
**Fail (crossover visible)**: проверить bias diodes IM1 installed, R_BIAS values.
**Fail (no signal)**: проверить Q1/Q2 transistor Ic flow.

### T2.3. R8 thermal test

**Цель**: убедиться, что R8 не перегревается.
**Оборудование**: IR thermometer, continuous signal source.
**Процедура**:
1. Connect exciter (real DAEX25FHE-4).
2. Signal 1кГц sine 500мВ (typical drive level).
3. RV_DRIVE fully CW.
4. Run continuous **10 minutes**.
5. Measure R8 temperature каждые 2 минуты.
**Pass**: R8 stabilizes <80°C.
**Fail (>100°C)**: R8 underrated (not 5W), или airflow blocked. Replace с higher wattage или reduce drive.

### T2.4. Exciter + pickup (acoustic path)

**Цель**: проверить basic acoustic chain.
**Оборудование**: cartridge (wood plate, DAEX25 installed, 2× piezo installed).
**Процедура**:
1. Install cartridge.
2. Signal 1кГц 100мВ при RV_DRIVE medium.
3. Probe PREAMP_A_OUT (after U3B) — должно быть > 10мВ (reverb sound).
4. Probe PREAMP_B_OUT — aналогично.
5. Tap на пластине рукой — spike в piezo outputs.
**Pass**: signal present на обоих piezo outputs. Tap produces clean spike.
**Fail (no signal)**: проверить exciter connection, piezo position, JFET Q3 bias (measure drain voltage ~6V).

### T2.5. Feedback / freeze

**Цель**: проверить feedback loop + freeze function.
**Оборудование**: signal, ось, listening environment.
**Процедура**:
1. SW_FREEZE NORMAL, RV_FEEDBACK 50%.
2. Short percussive input → listen for reverb tail.
3. Increase RV_FEEDBACK gradually.
4. Toggle SW_FREEZE → feedback locks in.
5. Release → decays naturally.
**Pass**:
- Reverb tail audible at all RV_FEEDBACK positions.
- At max feedback, approaches self-oscillation but stable (лимитеры работают).
- FREEZE sustains signal indefinitely.
**Fail (runaway oscillation)**: critical — **stop**, увеличить клип, или reduce max RV_FEEDBACK. Requires SPICE rework (SH2).

### T2.6. Position crossfade

**Цель**: RV_POSITION смешивает A и B.
**Процедура**:
1. Signal input, steady reverb tail.
2. Rotate RV_POSITION — ухо выявляет тембральное различие.
3. Probe MIX_OUT при CCW → only A content, CW → only B.
**Pass**: audible timbral shift через knob sweep.
**Fail (no change)**: dual-gang pot matching issue or bad wiring.

### T2.7. Tone filter

**Цель**: RV_CUTOFF работает.
**Процедура**:
1. Signal + reverb tail.
2. Probe CLIP_NODE.
3. Rotate RV_CUTOFF — HF content cuts.
**Pass**: 
- CCW: dark (158Гц cutoff).
- CW: bright (~15кГц cutoff).

### T2.8. LED clipper

**Цель**: LEDs visually indicate clipping.
**Процедура**:
1. High signal + high drive.
2. Watch D1/D2 LEDs.
**Pass**: LEDs light up при signal > threshold.
**Fail (always on)**: threshold слишком низкий. Add more LEDs in series (MD3).

### T2.9. Envelope follower + VCA

**Цель**: wet signal follows input dynamics.
**Процедура**:
1. Short percussive input (kick drum sample 808).
2. Listen to wet output.
**Pass**: reverb tail follows dynamics — строны notes → более мощный tail.
**Fail (всегда полный sustain)**: check envelope follower D_EF, RV_ATTACK/DECAY.
**Fail (полный cutoff)**: check OTA Iabc bias.

### T2.10. Noise generator

**Цель**: noise output works.
**Процедура**:
1. RV_NOISE sweeps 0 → CW.
2. Listen.
**Pass**: hiss/noise audible, smoothly varies.
**Fail**: BZX55C9V1 не в breakdown. Measure voltage across zener (должно быть 9.1В при current ~0.3мА).

### T2.11. Mix section

**Цель**: dry + wet + noise summing.
**Процедура**:
1. Dry signal audible always.
2. RV_MIX adjusts wet.
3. RV_NOISE adds noise.
**Pass**: все три paths audible и balanced.

### T2.12. Solenoid damper

**Цель**: CV triggers solenoid.
**Оборудование**: CV source (5В pulse or DC).
**Процедура**:
1. Apply 5В CV to J_CV_DAMP.
2. Solenoid clicks.
3. Reverb tail damps (shorter RT60).
**Pass**: audible damping при CV high.
**Fail (no click)**: check Q5 gate voltage (должно быть 3.4В с R_DAM1=47к при CV=5В), check D_SOL polarity.
**Fail (click but no damping)**: solenoid mount not contacting plate. Adjust 2мм gap.

---

## Phase 3 — Noise floor measurement

### T3.1. Input-shorted noise floor

**Цель**: фундаментальный шум пол.
**Оборудование**: спектроанализатор или RTA + audio interface, 10× preamp (optional).
**Процедура**:
1. Short J_IN (короткий jack или shorted plug).
2. Silence cartridge mechanically (cover с foam).
3. RV_MIX polymer 50%.
4. Measure noise на J_OUT.
5. Look at spectrum 20Гц–20кГц.
**Pass (budget target)**: 
- Noise floor < -85 dBV на 20Hz–20кГц average.
- No dominant tone (hum 50Гц peak < -70 dBV).
**Pass (premium target)**:
- Noise floor < -95 dBV.
- No dominant tones.
**Fail (hum)**: ground loop. Check star-ground connection.
**Fail (high broadband)**: check JFET preamp shielding, может требуется mini-XLR upgrade.

### T3.2. Solenoid-active noise

**Цель**: EMI от solenoid в signal.
**Оборудование**: как T3.1 + CV source pulsing.
**Процедура**:
1. Setup T3.1.
2. Pulse solenoid CV 10Гц (on/off pattern).
3. Measure noise при каждом clic.
**Pass**: click peak <-70 dBV относительно silence.
**Fail**: реализовать mini-XLR shielded cables (SH3) и ferrite shielding.

### T3.3. Total harmonic distortion (THD)

**Цель**: baseline distortion measurement.
**Оборудование**: audio analyzer or FFT software.
**Процедура**:
1. Dry signal 1кГц 100мВ через module.
2. Measure J_OUT THD.
3. Repeat при various drive levels.
**Pass**:
- At 100мВ input: THD < 0.5% (reasonable для plate reverb).
- At clip threshold: THD может быть 5–10% (OK, namerenno distorted).

---

## Phase 4 — Acoustic verification

### T4.1. RT60 measurement

**Цель**: compare measured RT60 with claims.
**Оборудование**: audio analysis software (REW, ARTA), импульс source (короткий burst).
**Процедура**:
1. Install test cartridge (oak plate 100×40×4мм).
2. Drive с short impulse (< 10 мс burst).
3. Record decay в mix output.
4. Calculate RT60 decay time (-60dB from peak).
5. Repeat для different RV_FEEDBACK positions.
**Pass**:
- RT60 без feedback: 0.1–0.3с (realistic для oak).
- RT60 с high feedback: до 3–5с (усиленный).
- **Не 1.5–4с** без feedback, как было заявлено в v2.0 брифе — корректировать маркетинг.

### T4.2. Material character comparison

**Цель**: A/B compare different cartridges.
**Процедура**:
1. Install wood cartridge (oak), record reference signal.
2. Swap в stone cartridge (marble), record same signal.
3. Swap в metal cartridge (spring steel), record same signal.
4. A/B listening comparison.
**Pass**:
- Audible tembral difference между всеми тремя.
- Consistent с claimed character (wood = warm, stone = cathedral, steel = shimmer).

### T4.3. Exciter thermal test

**Цель**: убедиться, что exciter не перегревается при continuous use.
**Оборудование**: IR thermometer.
**Процедура**:
1. Continuous music through module (30 минут).
2. Periodic measure exciter voice coil temperature (probe через pinhole).
**Pass**: exciter <60°C throughout.
**Fail**: limit drive power или upgrade к DAEX32Q-4.

---

## Phase 5 — Integration test

### T5.1. Eurorack rack integration

**Цель**: work в typical Eurorack setup.
**Процедура**:
1. Install в rack с other modules.
2. Patch typical signal chain: VCO → VCF → Last Night → Out.
3. Test CV inputs (mix, decay, damp).
4. Check interaction с neighbor modules (motor/solenoid emission не affects others).
**Pass**: works standalone and together.

### T5.2. Cartridge hot-swap

**Цель**: cartridge exchange не повреждает модуль.
**Процедура**:
1. Power on.
2. Remove cartridge (с attached cable).
3. Install different cartridge.
4. Listen — works.
**Pass**: no pop on swap, works seamlessly.
**Fail (pop)**: add relay mute during cartridge detect.

---

## Phase 6 — Long-term test

### T6.1. 24-hour burn-in

**Цель**: thermal stability, component drift over time.
**Процедура**:
1. Continuous signal 24 часа.
2. Measure key parameters каждые 6 часов:
   - Power rail voltages.
   - Noise floor.
   - THD at 100mV input.
   - RT60 on reference cartridge.
**Pass**: всех parameters stable ±10% на 24h window.
**Fail (drift)**: check capacitor aging, BD139 thermal drift, preamp bias drift.

### T6.2. Temperature cycling

**Цель**: work в разных температурах (transport).
**Процедура**:
1. Test в 15°C, 25°C, 35°C.
**Pass**: parameters stable на each temperature.

---

## Summary — Phase completion checklist

- [ ] Phase 0 (visual): все компоненты placed correctly, no shorts.
- [ ] Phase 1 (power): rails stable, no switching noise.
- [ ] Phase 2 (blocks): все 12 блоков работают individually.
- [ ] Phase 3 (noise): measurable noise floor meets target.
- [ ] Phase 4 (acoustic): RT60 measured, materials characterized.
- [ ] Phase 5 (integration): works в Eurorack context.
- [ ] Phase 6 (longterm): stable over 24 hours.

**Если все phase passed**: готов для small production batch (10–20 units).

**Если phase 3 fail (noise)**: rev B с mini-XLR + 4-layer PCB.

**Если phase 4 fail (acoustic разочаровывает)**: revise cartridge design или exciter selection.
