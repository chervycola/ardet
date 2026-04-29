# Last Day — ответы на открытые вопросы

Вопросы из раздела "Open Questions / Things to Challenge" в брифе Last Day, плюс неявные вопросы архитектуры.

---

## Q1. TL072/TL074 правильный выбор vs NE5532/OPA2134/LM4562?

**Для Last Day — нет, не везде**. См. `21_last_day_acoustic.md`, A.

- **Hydrophone preamp**: **OPA1642** (ultra-low-noise JFET input, 1 нВ/√Гц). Noise budget requires it.
- **Solar amp starved stage**: TL072 OK (саморежим — character).
- **Mid резонатор pickup**: OPA1642 также preferred (piezo high-Z).
- **EQ shelf amplifiers**: TL072 OK.
- **Output buffer**: NE5532 (drive long cables better).

**Recomend**: mixed strategy — critical low-noise stages on OPA1642, non-critical on TL072. +$5 BOM, significant quality gain.

---

## Q2. LM13700 VCA — правильно?

**Для Last Day нет отдельных VCA кроме envelope effects**. Compressor в solar amp path — LDR/vactrol, не OTA. Так что LM13700 не требуется.

Если нужен VCA (для envelope-driven effects на hydrophone track) — тогда **THAT2180** (+$4) for linearity. **LM13700 OK for lo-fi character**.

---

## Q3. BD139/BD140 достаточны для exciter?

**Для Last Day — не exciter issue** (Last Day не имеет exciter в смысле Last Night). Есть:
- Motor driver (нужен MOSFET ≥2А current, BD139 справится, но IRF540 лучше).
- Solenoid CRASH driver (2N7000 OK для 300мА impulse).
- Underwater piezo emitter (low current, любой ОУ output drive).

**Recomend**: IRF540 для motor, 2N7000 для solenoid, ОУ output для piezo.

---

## Q4. Почему pre-emphasis вообще? Single 1n cap достаточно?

Last Day не имеет pre-emphasis в том же смысле, что Last Night. Но:
- **Oil path** заваливает HF (см. `21_`, B). Если oil блендится с mag path, нужна HF compensation после oil.
- **Magnetic disk** имеет natural HF roll-off при high tape speed — head gap equalization typical.

**Рекомендация**: EQ секция достаточна для post-correction. Отдельной pre-emphasis не нужно.

---

## Q5. JFET gate impedance (10МΩ + 2N5457) — главный noise риск

**Для Last Day — менее критичен** чем для Last Night (нет JFET preamps на пьезо с таким Z в основной цепи). Но:
- Если hydrophone preamp использует JFET front-end (OPA1642 — BJT input, не JFET), risk smaller.
- Mid резонатор pickup — возможно JFET. То же предостережение, что для Last Night.

**Recomend**: в mid резонатор pickup — OPA1642 (no JFET). EMI concerns снижены vs Last Night.

---

## Q6. Solenoid switching transients

Single solenoid для CRASH — относительно редкое событие (button press). EMI risk exists но managable.

**Рекомендация**:
- Soft-pulse CRASH: current ramp 5–10 мс вместо step. Reduces EMI.
- Snubber RC на соленоиде.
- Physically separate от sensitive paths.

---

## Q7. Star ground designed but not verified

**Для Last Day — тот же риск**, что для Last Night. Более сложная схема (motor driver, heater, solar, multiple audio paths) → больше paths для ground loop.

**Recomend**: **4-layer PCB** с dedicated GND plane для Last Day — обязательно (40HP × 110мм имеет много места). Это $20–30 удорожание, но единственный способ contain noise в такой complex schematic.

---

## Q8. Cartridge cable length 50-80мм — issue

**Для Last Day** — cartridge (oil) не передаёт audio через кабель. Только heat (питание heater) и solenoid for CRASH. Audio (hydrophone, если он в cartridge) — через shielded cable.

**Рекомендация**: hydrophone preamp **внутри cartridge** (small PCB mounted на ванну). Output cartridge — line-level буферизованный, нечувствителен к длине кабеля. Добавляет $3 BOM в cartridge, но решает noise permanently.

---

## Q9. Pedal power budget

См. `41_power_thermal_emi.md`. Для Last Day педаль версия:
- Motor ~2–5Вт.
- Heater ~5Вт (если включен).
- Solar amp starved ~0.5Вт.
- EQ + support ~2Вт.
- **Total >10Вт**.

Типичная педаль 9V power supply delivers 2–5Вт (200–500мА @ 9V). **Last Day НЕ помещается в pedal power envelope**.

**Рекомендация** (повторение):
- Last Day = **Eurorack only**.
- Педаль версия с упрощённым feature set (без heater, без motor, только oil path из sample + solar + EQ) — separate R&D.

---

## Q10. 20 jacks patch bay в педальном варианте overkill?

См. Q10 in `12_last_night_open_questions.md`. Сам ответ применим и к Last Day:
- 5–6 CV inputs достаточно (TIME, FEEDBACK, HAZE, CRASH TRIGGER, KILL).
- 20 jacks — overkill, мёртвый BOM.

---

## Q11. FREEZE footswitch тип

**Для Last Day** — latching (toggle state между "recording / not recording"). Loop freeze — это state, не momentary gesture. OK для latching.

---

## Q12. Expression pedal

**Для Last Day** — EXP jack подключается к HAZE depth or TIME — performance enhancement. Добавить.

---

## Q13. 2N5457 discontinued — для Last Day тоже?

**Если Last Day использует JFET preamps** (mid резонатор pickup, hydrophone) — тот же EOL issue.

**Recomend**: с OPA1642 вместо JFET preamps — no need for 2N5457. LSK489 остаётся backup option.

---

## Q14. Alpha RD901F pots для педальной версии

Pedal форма требует 16mm pots or encoders. Alpha RD901F (9mm vertical) — для Eurorack. Different footprint, different PCB.

**Recomend**: commit к Eurorack form — pedal version отдельный project.

---

## Q15. Noise generator overkill?

В Last Day нет explicit noise generator (есть DUST — impulse клики). DUST — 5–8 components — ОК. Не over-engineered.

---

## Q16. Stereo output dead weight?

Last Day описан mono. Stereo paths не обсуждаются в концепте. **Не проблема для Last Day**.

---

## Q17. Sidechain input

Last Day не имеет explicit sidechain. Но можно добавить:
- **SIDECHAIN in** → compressor envelope (modulate solar amp sensitivity) → external source drives compression. Useful для ducking.

**Recomend**: optional feature. +3 components. Moderate value.

---

## Q18. Position crossfade (если применимо)

Last Day не имеет dual-pickup позиционирования (один emitter, один hydrophone). Crossfade в Last Day не applicable.

---

## Summary — Open Questions verdict

Все open questions имеют **actionable answer**. Ключевое:

1. **OPA1642 заменяет TL072** в критических (low-noise) stages.
2. **Последовательный R&D**: motor → disk → oil → solar → EQ → FX. Prototype independently.
3. **Eurorack only** — commit в одной форме.
4. **4-layer PCB** обязательно для complexity.
5. **Hydrophone preamp в cartridge** — решает cable noise.
6. **Capacitive pickup вместо magnetic** (Tel-Ray style) — упрощает production.
7. **Manual clamp v1, motorized v2** для mid resonator.
8. **Сервисуемые modular subsystems** — brand positioning boutique.
