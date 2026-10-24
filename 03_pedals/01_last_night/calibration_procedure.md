# LAST NIGHT — Calibration Procedure

**Версия**: v1.1 (для production assembly + service; Block 14 rewrite — RV_TOLL_DUR удалён, Шаг 7 стал verification вместо adjustment)
**Применимо**: v6.5 canon
**Требуется**: каждый собранный unit проходит калибровку перед QC sign-off.

> Last Night имеет несколько internal trim pots, требующих настройки на сборке. Этот документ — пошаговая процедура. Без калибровки unit может вести себя непредсказуемо (gate threshold, trigger sensitivity, push-pull bias, etc.).

---

## Оборудование

- Bench oscilloscope (2-channel, ≥20MHz)
- Signal generator (sine + pulse, 20Hz-20kHz)
- DMM (4.5 digit)
- Audio analyzer или REW + audio interface (для THD/noise)
- IR thermometer (для solenoid thermal check)
- Reference cartridge (LN-STEEL, known-good)
- Small flat-blade trim screwdriver (ceramic preferred — non-magnetic)

---

## Trim pot inventory

| Trim | Block | Default | Функция |
|------|-------|---------|---------|
| RV_BIAS (×2: Q1, Q2) | 4 | по процедуре | Push-pull standing current |
| RV_GTH | 18 | mid | Gate threshold (Gate/Crush) |
| RV_CRUSH | 18 | mid | Crush sample rate |
| RV_TRIG_THRESH | 11/16 | mid (~1V) | FG trigger sensitivity |
| ~~RV_TOLL_DUR~~ | 14 | — | **Удалён (Block 14 rewrite)**: pulse duration ≠ сила удара (это степень демпфирования). Fixed 4.4мс escapement (R_556A 180k 1%). Шаг 7 = verification |
| RV_CHILL_THRESH | 24 (Phase 2) | mid | Expander threshold |

---

## Процедура (порядок важен)

### Шаг 1 — Power rails verification

1. Подать питание (12V DC pedal / Eurorack bus).
2. DMM: измерить +12V_audio, -12V_audio на test points.
   - **Pass**: ±12V ±5% (11.4–12.6V).
   - **Fail**: проверить DC-DC module, LDO, reverse protection diodes.
3. Измерить +5V_digital.
   - **Pass**: 4.9–5.1V.
4. Pedal SKU: probe +12V_audio rail во время TOLL trigger (см. Шаг 7) — **rail не должна просесть >50mV** (verifies solenoid power isolation).

### Шаг 2 — Power-on mute check

1. Scope на J_OUT_L.
2. Power cycle (off → on).
3. **Pass**: output muted ~200ms после power-up, затем audio passes. No thump/click >10mV на выходе при power transition.
4. **Fail**: проверить Q_MUTE, C_MUTE, mute comparator.

### Шаг 3 — Push-pull bias (RV_BIAS)

Критично для устранения crossover distortion в driver amp (Block 4).

1. Insert reference cartridge (или dummy load 4Ω + 4.7Ω на exciter output).
2. Подать 1kHz sine, DRIVE на mid, INPUT на 50%.
3. Scope на exciter drive point (после R8).
4. Вращать RV_BIAS (оба Q1, Q2 одновременно или по очереди per schematic):
   - Начать с минимума (no bias) → видна crossover notch на zero-crossing.
   - Увеличивать bias до **исчезновения notch** + standing current ~5-10mA per transistor.
   - **НЕ перебивать** — слишком высокий bias → thermal runaway risk.
5. Измерить standing current: voltage drop на R_E_BIAS (emitter resistor) → I = V/R.
   - **Target**: 5-10mA per transistor.
6. **Pass**: clean sine на exciter output, no crossover notch, standing current в range.

### Шаг 4 — Gate threshold (RV_GTH)

1. Engage GATE-CRUSH footswitch.
2. Подать decaying signal (pluck reference cartridge или fade test tone).
3. Вращать RV_GTH:
   - CCW → gate cuts на higher level (more aggressive gating).
   - CW → gate cuts на lower level (subtle).
4. **Default setting**: gate cuts на ~-42 dBV (noise floor level — cuts only tail residue).
5. Verify hysteresis: signal near threshold не должен chatter (no rapid on/off).
6. **Pass**: clean gate action, no chatter.

### Шаг 5 — Crush sample rate (RV_CRUSH)

1. GATE-CRUSH engaged.
2. Подать 1kHz sine.
3. Scope на LF398 output (Crush S&H).
4. Вращать RV_CRUSH:
   - Видны quantization steps на scope.
   - CCW → coarse (8kHz sample → heavy aliasing).
   - CW → fine (62kHz → transparent).
5. **Default**: 16kHz (telephone-quality crush).
6. **Pass**: visible sample steps, rate adjustable across range.

### Шаг 6 — FG trigger sensitivity (RV_TRIG_THRESH)

1. No external patch на J_TRIG (uses internal normal от envelope follower).
2. Подать percussive signal через reference cartridge (tap/pluck).
3. Scope на FG output (EG OUT jack).
4. Вращать RV_TRIG_THRESH:
   - CCW (0.3V) → triggers на soft attacks (sensitive).
   - CW (3V) → triggers только на loud transients.
5. **Default**: ~1V (mid) — triggers на normal playing dynamics.
6. Для acoustic guitar / soft picking: установить CCW (~0.5V).
7. **Pass**: FG fires reliably на intended attack level, no false triggers на sustain.

### Шаг 7 — TOLL escapement pulse (verification, не adjustment)

> **Block 14 rewrite**: pulse fixed 4.4мс (NE556 half A, R_556A 180k 1% + C 22нФ). Per-material подстройки НЕТ — длинный pulse не «усиливал» удар, а демпфировал звенящую пластину (физревью; нефрит страдал сильнее всех). Крутить нечего — проверяем, что константы верны.

1. Подать gate (+5V) на J_TOLL_TRIG (или trigger via internal EOR normal).
2. Scope на coil current (shunt/current probe) — **pulse width 4.4мс ±10%**.
3. Спад тока после gate-off **<0.6мс** (Z_SOL fast release; если 2-5мс — zener не работает/закорочен, плунжер «доживает» на пластине).
4. Scope на выход JFET preamp: MUTE window закрывает turn-ON click (тихий транзит), unmute к импакту — атака колокола сохранена.
5. Reference cartridge (slate/nephrite): audible clean bell, без rattle/двойного удара в первые 5мс (unseating — R13).
6. **Pass**: все четыре пункта. Fail по п.5 → Stage 0B mitigation review (pin preload / шасси), не трогая pulse.

### Шаг 8 — Solenoid thermal check

1. Apply J_STALL_CV high (+5V sustained) для 60 секунд.
2. IR thermometer на solenoid coil (через cartridge access).
3. **Pass**: coil temp <70°C после 60s (verifies ATtiny84A PWM throttle к 40% duty working).
4. **Fail**: проверить firmware PWM throttle, либо solenoid duty cycle logic.

### Шаг 9 — Self-oscillation limiter

1. FEEDBACK knob → CW (max), без cartridge input.
2. Module должен self-oscillate (controlled).
3. Scope на J_OUT_L.
4. **Pass**: output amplitude limited к ~+6dBu (2.5Vrms), не растёт неограниченно. Soft limit, no hard clip.
5. **Fail**: проверить output limiter (U_LIM OTA, D_LIM_DET, threshold).

### Шаг 10 — Noise floor + THD

1. Input grounded, MIX → CW (wet only), FEEDBACK → 0.
2. Audio analyzer на J_OUT_L.
3. **Noise floor**: <-75 dBV (A-weighted). Premium target <-85 dBV.
4. **THD** (1kHz, 0dBV): <1% clean path, Bank Mode DIRTY position 3-5%.
5. **Pass**: noise + THD в spec.

### Шаг 11 — Bypass modes

1. **Trails mode** (default): engage BYPASS — reverb tail должен continue decay.
2. **True bypass** (jumper): engage BYPASS — signal прямой input→output, no coloration, tail cuts.
3. **Pass**: оба режима работают per jumper position. No pop >10mV на switching.

### Шаг 12 — Final functional sweep

1. Все knobs через полный range — audible/measurable response каждого.
2. Все 4 footswitches — correct function.
3. Bank Mode slider — 5 позиций audibly distinct.
4. FG sliders (rise/fall/depth) — waveform morphing на EG OUT.
5. CV jacks — patch test voltage, verify modulation.
6. Stereo L/R — verify separation (dual piezo).

---

## QC sign-off

Unit passes если все 12 шагов **Pass**. Записать в QC log:
- Serial number
- Calibration date + technician
- Push-pull standing current (mA)
- Noise floor (dBV)
- THD @ 1kHz (%)
- Any deviations / notes

---

## Trim accessibility

- Pedal SKU: trim pots доступны через **bottom panel access holes** (3mm) без полной разборки. Label на bottom panel: trim map.
- Eurorack SKU: trims на PCB, доступны при removal из rack (back accessible).
- RV_TRIG_THRESH: customer-tunable (case access) — per-playing-style adjustment. Остальные — factory-set. *(RV_TOLL_DUR удалён — Block 14 rewrite: клиенту больше нечего крутить не в ту сторону; сила удара — не ширина импульса.)*

---

**End of calibration procedure v1.0.**
