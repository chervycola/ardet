# Last Day — scope и subsystem decisions

Last Day — самый сложный модуль серии, 3 независимые подсистемы (oil can delay, solar amp, resonant EQ) + 4 performance effects (HAZE/WIRE/DUST/DRAG) + 3 perform buttons (KILL/CRASH/FREEZE). Реалистичный R&D — 18–30 месяцев. Требуются решения о scope.

---

## D1. Form factor — Eurorack only / Pedal / Both

### Текущее состояние
В брифе заявлен "Eurorack 40HP + pedal с RCA jacks". Но:
- Solar cell нуждается в открытой панели → в закрытой педали не работает.
- DC motor стабильнее на столе (Eurorack), чем на полу (pedal vibration).
- RCA jacks подразумевают DJ console, не pedalboard.
- Power budget педали (~10Вт) недостаточен (см. `audit/41_power_thermal_emi.md`).

### Варианты

**A. Eurorack only (рекомендуется)**
- One PCB, one panel.
- Solar cell на open panel visible.
- 40HP Eurorack standard.
- Concentrate R&D.

**B. Pedal only (без Eurorack)**
- Убрать Eurorack target, focus pedal с 9V power supply.
- Но: heater и motor overhead слишком большие для pedal power.
- Требует redesign upfront.

**C. Both (full product line)**
- Two SKUs, два R&D tracks.
- 2× BOM, 2× certification.
- Only feasible if cashflow supports.

### Рекомендация: **A (Eurorack only)**

Обоснование:
1. Single product focus снижает R&D risk.
2. Boutique Eurorack audience overlaps с target audience для Last Day.
3. Solar cell, motor, heater functions все work optimally в Eurorack form.
4. Pedal version может быть later (Phase 5+) с simplified feature set.

**Требуется от пользователя**: подтвердить **A**, или обосновать B/C.

---

## D2. Oil can pickup type — Magnetic / Capacitive / Both

### Текущее состояние
Брифе описан magnetic: "металлический диск с магнитным покрытием, write head + 2× read heads".

### Варианты

**A. Magnetic (как заявлено)**
- Stock tape heads (reel-to-reel heads от refurbished consumer equipment).
- Requires custom magnetic coating диска (~$10 CapCut service).
- Production scaling: head availability?
- Classic tape delay sound.

**B. Capacitive (Tel-Ray inheritance) — рекомендуется**
- Conductive oil (mineral oil + additive) as dielectric.
- Electrode on top, moving disk on bottom = variable capacitor.
- Signal written by charge → diff between electrodes.
- **Original Tel-Ray Adineko** approach (1960s).
- No magnetic coating needed.
- Cheaper, simpler manufacturing.

**C. Both (dual pickup)**
- Magnetic tract (dry, rhythmic).
- Capacitive tract через oil bath (wet, ghostly).
- Blend contol между tracts.
- Более feature-rich, but 2× mechanics complexity.

### Рекомендация: **B (Capacitive Tel-Ray style)**

Обоснование:
1. **Simpler manufacturing** — no magnetic coating, no custom heads.
2. **Tel-Ray inheritance** — proven 50+ лет history.
3. **Cheaper BOM** ($3 vs $20 for heads).
4. Still authentic "oil can delay" sound.
5. Oil bath уже центральный в дизайне → capacitive использует oil как dielectric естественно.

### Compromise approach

Если user хочет retain magnetic feel: **capacitive main + tiny magnetic rotor** (small magnet на диске, fixed Hall sensor) — magnetic only для speed stability reference (clock / tachometer для PLL), не для audio. Best of both.

**Требуется от пользователя**: выбрать **A / B / C**.

---

## D3. Solar amp — mandatory / optional / replace

### Текущее состояние
Solar cell запитка starved amp stage. Unique concept, но:
- Reliability ambient light dependent.
- Performance outdoor vs indoor радикально different.
- Close-box indoor = зависит только от internal LED.

### Варианты

**A. Solar mandatory (как заявлено)**
- Solar cell + internal LED (SUN baseline).
- Outdoor performance = instrument сам по себе.
- Indoor (basement studio) = только internal LED работает.

**B. Solar optional (module feature, not center)**
- Internal LED-only baseline (stable).
- Solar cell — add-on для outdoor perform.
- User can cover solar with black tape = disable outdoor dependency.

**C. Replace solar with tunable starved supply**
- No solar at all.
- "SUN" knob directly controls voltage of starved stage (adjustable DC).
- Loses "solar" narrative, но reliable indoor.

### Рекомендация: **B (Solar optional)**

Обоснование:
1. Solar concept retained (good marketing narrative).
2. Indoor reliability через internal LED baseline.
3. User choice — use solar for perform, disable для studio.

**Implementation**: solar cell + voltage compar → если voltage > threshold (light detected), enable solar mode. Else fall back на internal LED. Add switch "SOLAR/INTERNAL" на панели.

**Требуется от пользователя**: выбрать **A / B / C**.

---

## D4. Resonant mid EQ — manual / motorized / skip

### Текущее состояние
Физическая пластинка (tongue) с подвижным зажимом (каподастр). Unique innovation, но complex.

### Варианты

**A. Manual clamp (simpler start)**
- Пользователь вручную перемещает clamp по guide rail.
- Pot на панели (ручка через cable/rod) или прямо physical lever.
- Q control через pressure (knob adjusts clamp screw tension).
- Proof of concept, less precision.
- **HP budget**: ~8HP для tongue + clamp + pots.

**B. Motorized clamp с encoder**
- Stepper motor moves clamp по lead screw.
- CV-controlled position (CV 0-5V → full range).
- Encoder reads position → digital readout.
- **Preset recall** possible (save clamp position).
- **HP budget**: ~10HP (extra electronics).

**C. Skip resonant mid (MVP)**
- Last Day v1 без mid resonator — only standard inductor EQ (low/high shelves).
- Add mid resonator в rev B / v2.

### Рекомендация: **A (Manual) для v1**, **B в v2**

Обоснование:
1. Manual — **fastest to market** (mechanical только, без motor).
2. Proof of concept — validate Q vs clamp pressure relationship в реальности before committing motor.
3. v2 motorized — **premium SKU** с recall.
4. Skip (C) загубит unique feature proposition. Не рекомендуется.

**Требуется от пользователя**: выбрать **A / B / C** для первой версии.

---

## D5. Perform effects — все / subset / cut

### Текущее состояние
HAZE (motor speed mod), WIRE (EM antenna), DUST (statik clicks), DRAG (motor brake), CRASH (solenoid impact), KILL (mute), FREEZE (loop).

### Приоритизация по эффекту перформанса / сложности:

| Эффект | Исполнение | Сложность | Impact | Приоритет |
|--------|-----------|-----------|--------|-----------|
| KILL (mute) | CMOS switch | low | high (dub-essential) | **v1** |
| FREEZE (loop) | write/erase disable | low | high (standard) | **v1** |
| DRAG (motor brake) | MOSFET short | low | medium | **v1** |
| HAZE (speed mod) | LFO on motor | medium | medium | **v1** |
| CRASH (solenoid) | solenoid + driver | medium | medium (novelty) | **v2** |
| DUST (static clicks) | threshold noise | low | low | **v2** |
| WIRE (EM antenna) | pickup coil | medium | low (uncontrollable) | **v2 / optional** |

### Рекомендация: **v1 = KILL + FREEZE + DRAG + HAZE. v2 = CRASH + DUST + WIRE**.

Обоснование:
- v1 имеет core performance effects (KILL, FREEZE essential для dub), DRAG и HAZE для character.
- v2 добавляет novelty (CRASH) и tone (DUST, WIRE) без блокировки первой версии.

**Требуется от пользователя**: подтвердить subset v1, или argue для включения всех 7 в v1.

---

## D6. Master R&D roadmap

### Рекомендация sequential:

**Phase A (Eurorack v1, 12 мес)**:
1. Prototype motor + diск + capacitive pickup (base oil-can delay).
2. Oil bath mechanics (sealed cartridge, замена oil).
3. Integrate with inductive shelf EQ.
4. Manual mid resonator (clamp position via pot).
5. Solar amp с optional internal LED.
6. Perform: KILL + FREEZE + DRAG + HAZE.

**Phase B (Eurorack v1.5, 6 мес after A)**:
7. Add CRASH solenoid.
8. Add DUST click generator.
9. WIRE pickup (optional).

**Phase C (v2 premium, 12 мес after B)**:
10. Motorized mid resonator (encoder, CV).
11. 4-layer PCB.
12. Premium cartridge options (premium oils).

**Phase D (optional pedal version)**: separate R&D, simplified feature set, 12 мес.

### Требуется от пользователя

Подтвердить Phase A → B → C progression, или restructure.

---

## Итого — Last Day decisions summary

| Decision | Варианты | Рекомендация |
|----------|----------|--------------|
| D1 Form factor | Eurorack/Pedal/Both | **Eurorack only** |
| D2 Pickup | Magnetic/Capacitive/Both | **Capacitive** |
| D3 Solar | Mandatory/Optional/Replace | **Optional с internal LED baseline** |
| D4 Mid resonator | Manual/Motorized/Skip | **Manual v1, Motorized v2** |
| D5 Perform FX | All 7 / Subset / Cut | **v1: KILL+FREEZE+DRAG+HAZE** |
| D6 Roadmap | Phase A-D | **Sequential по Phase** |

**HP budget**: ~40HP (Eurorack).
**Complexity**: max из всей серии.
**R&D effort**: 18 месяцев Phase A + 6 месяцев Phase B = 24 месяца total for full v1.5.
**Retail**: $700–900 для v1.
