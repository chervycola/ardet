# Decision 08 — Consolidated base: Day / Night комбайны (final)

**Дата**: 2026-05
**Статус**: locked
**Тип**: концептуальное объединение Decision 06 (Last Day re-spec), Decision 07 (Last Night re-spec), и v3.0 prototype (phaser + vinyl FX engine из ветки `claude/review-reverberator-data-KKkgX`)

---

## Контекст

В репозитории сосуществовали **две параллельные концепции** Last Night:

1. **Ветка `KKkgX` (v3.0 prototype)** — postapocalypse FX combine с **phaser + vinyl wow/flutter + gate-crush** как FX engine. ModFactor-class pedal. Focus на vinyl-mortality эффектах.

2. **Ветка `HWbFa` (Decision 07)** — symmetric cold combine с **8 named-эффектами cold palette** (PULSE/FOG/FROST/CHILL/GEIGER/HUM/STALL/TOLL), big-box pedal, formal antipode mapping с Last Day hot palette.

Пользователь зафиксировал finalized concept, объединяющий лучшее из обеих:
- Last Night остаётся **постапокалипсис-ревербератор на пластинах** (core identity нерушим — это плата + exciter + dual piezo + soleнoid + envelope VCA + feedback loop, v2.1 schematic с применёнными 15 фиксами).
- Noise generator — **biполярный**: CCW=continuous noise, CW=Geiger pattern ticks. Один knob, две текстуры.
- **Phaser — опционально** (для дополнительного immersion, не центральный эффект).
- Solenoid **double-function**: damper (как сейчас) + striker (для TOLL bell-strike gesture, новое).
- **Cold palette mapping (Decision 07)** сохраняется как **системный язык** для соответствия с Last Day, но реализованы только конкретные элементы (см. ниже).

Last Day канонически остаётся как Decision 06: oil-can delay + solar saturator + resonant EQ + TAR (вязкость) + CICADA (cluster ticks) + старые пластинки (PT2399 lo-fi). Phaser и vinyl wow вынесены **из Last Night** в характер Last Day (это там их физическое место — "tape decay" и "wow/flutter" принадлежат delay-секции).

---

## Финальная база — что фиксируем

### Last Night — постапокалипсис-ревербератор холодной ночи

**Core (нерушимое — v2.1 schematic + 15 fixes)**:
- Surface exciter (DAEX25 / DAEX32) возбуждает сменную физическую пластину в картридже.
- Dual piezo pickup (Piezo A + Piezo B) с position crossfade.
- LSK489A dual JFET preamp ×23 gain.
- Push-pull class AB driver (BD139/140 с bias diodes, R8 4.7Ω 5W).
- Feedback loop с D_LIM soft-clip, SPICE-verified stability.
- Envelope follower VCA (LM13700, 1–48мс attack, 10мс–1с decay).
- Solenoid damper (Q5 2N7000, R_DAM1 47к, D_SOL flyback).
- Pre/de-emphasis EQ, tone filter, LED clipper.

**Cold-palette FX layer (новое, поверх ядра)**:

| Эффект | Контрол | Физика / реализация |
|---|---|---|
| **NOISE / GEIGER** (bipolar) | Один center-detent knob | **CCW → continuous noise** (BZX55C9V1 zener → gain ×100). **CW → Geiger ticks** (ATtiny85 LFSR → comparator → cluster pulse shaper). Center detent = off. |
| **PHASER** (опционально, immersion layer) | RV_PHASE + RV_DEPTH + RV_SPEED | 4-stage OTA all-pass (использует unused OTA2 LM13700). Slow/medium swirl над reverb tail. Switchable bypass. |
| **PULSE** | RV_PULSE + sync | Slow LFO 0.05–2Гц → damper-pressure modulation. Tail "дышит" периодически. Sync к TAP. |
| **FOG** | RV_FOG | Apperiodic drift: 4066 S&H sampled от noise → slow slew → damper micro-modulation. Туман над хвостом. |
| **FROST** | RV_FROST | Voltage-controlled LPF в feedback path — sweep-down ВЧ при усилении. Холод "съедает" воздух. |
| **CHILL** | RV_CHILL | Expander с brittle release: quiet stays quiet, loud decays fast. Anti-TAR. |
| **HUM** | RV_HUM | Ferrite coil 1000 витков + 50/60Гц tuned amp → mix. EM antenna для сетевого hum. Опционально внешний antenna jack. |
| **STALL** | Footswitch (latching) + CV | Forced full damper hold. Decay stuck at minimum. |
| **TOLL** | Footswitch (momentary) + CV | Short solenoid impulse (5–10мс) → bell-strike пластины. Использует тот же solenoid hardware что и DAMP, но pulse-mode. |
| **KILL** | Footswitch (momentary) | Input mute, tail продолжает играть. |
| **FREEZE** | Footswitch (latching) | Feedback loop locks, infinite sustain. |

### Last Day — постапокалипсис-делей раскалённого полудня

**Core**:
- Oil-can delay (vinyl disk + capacitive pickup, Tel-Ray inheritance).
- Solar amp (LED baseline обязателен, solar = light-as-LFO модуляция).
- Inductive shelf EQ + tongue resonator mid.
- Dual capacitive read electrodes → stereo wet taps.
- Manual clamp tongue (v1), motorized (v2 premium).

**Hot-palette FX layer**:

| Эффект | Контрол | Физика / реализация |
|---|---|---|
| **HAZE** | Knob | Periodic LFO wow/flutter (motor speed mod). |
| **MIRAGE** | Knob | Apperiodic pitch drift ±10ц через noise→S&H→slew (антипод FOG). |
| **BLEACH** | Knob | High-band soft saturation 4–12кГц с solar-driven threshold. |
| **TAR** | Knob | Peak-hold compressor с long-attack залипанием. Вязкость. Связан с HEAT. |
| **CICADA** | Knob | Cluster tick generator: noise + envelope follower → comparator → retrigger bursts. Signal-correlated плотность. |
| **HEATWAVE** | Knob | AM-tuner front-end (TA7642) + antenna → детектор → mix. Голос мёртвой ионосферы. |
| **OLD VINYL** | Knob (lo-fi character) | PT2399 в parallel с oil-can magnetic tract — добавляет grunge/bitcrush character к delay tail (старые тлеющие пластинки). |
| **DRAG** | Footswitch (momentary) | Motor brake — pitch уходит вниз. |
| **CRASH** | Footswitch (momentary) | Solenoid удар по масляной ванне → splash в delay через hydrophone. |
| **KILL** | Footswitch (momentary) | Input mute. |
| **FREEZE** | Footswitch (latching) | Loop locks, контент деградирует. |

### Symmetric mapping (диптих холода/жары)

| Cold (Night) | ↔ | Hot (Day) | Семантика |
|---|---|---|---|
| Phaser (опц.) | ↔ | OLD VINYL (PT2399) | Tape / vinyl decay character |
| PULSE | ↔ | HAZE | Periodic modulation |
| FOG | ↔ | MIRAGE | Apperiodic drift |
| FROST | ↔ | BLEACH | HF subtract vs add |
| CHILL | ↔ | TAR | Expander vs compressor |
| GEIGER (CW noise) | ↔ | CICADA | Sparse ticks vs cluster ticks |
| HUM | ↔ | HEATWAVE | Mains 50/60Hz vs AM ионосфера |
| STALL | ↔ | DRAG | Held damper vs motor brake |
| TOLL | ↔ | CRASH | Strike plate vs strike oil |
| KILL | ↔ | KILL | Common gesture |
| FREEZE | ↔ | FREEZE | Common gesture |

### Форм-фактор (consolidated)

- **40HP Eurorack-панель + big-box pedal (~203×140мм)** — одна PCB, два корпуса.
- I/O: TRS stereo + RCA stereo параллельно + 3.5мм mini-jack.
- Уровень: instrument / -10dBV / +4dBu switchable.
- **4 footswitches в pedal-форме**: KILL / FREEZE / TOLL / STALL.
- В Eurorack-форме — большие кнопки + CV/gate inputs для тех же четырёх жестов.
- Power: 12V DC center-negative + isolated DC-DC (TRACO TMR 3-1212WI) → ±12V audio rails. Identical к Eurorack version.
- Stereo committed — больше не "dead weight".

### Cartridge стандарт (общий с Last Day)

Формат картриджа единый между Day и Night:
- Frame 110×65×30мм (PETG print, frезированный алюминий production).
- Mini-XLR ×2 для аудио (piezo / read electrodes), JST-XH ×2 для actuators (exciter / solenoid).
- 4× neodym магниты + retention pin.
- См. `decisions/03_cartridge_standards.md` для деталей (требуется update под consolidated approach в next iteration).

---

## Что становится superseded

### Из ветки KKkgX (v3.0 prototype):
- **BBD V3207 vinyl wow/flutter блок** в Last Night — **переезжает в Last Day** как "OLD VINYL" character (PT2399 lo-fi alternative). Vinyl decay принадлежит delay-секции, не reverb-секции.
- **Gate/Crush footswitch** в Last Night — **заменяется на TOLL/STALL** (cold palette gestures, более тематически точные).
- **Color preset slider 5-pos** в Last Night — **сохраняется** как character preset для tone shaping. Имена позиций уточняются в SPEC.
- **Phaser** в Last Night — **сохраняется как опциональный immersion layer**, но не центральный эффект. Может быть toggled бypass.

### Из ветки HWbFa (Decision 07):
- Большинство сохраняется. Уточнение: **NOISE/GEIGER реализуется как один bipolar knob**, не как два разных эффекта в палитре (это упрощение по user-request).
- PHASER **добавляется к 10 named эффектам палитры** как optional 11-й слой (immersion).

### Из старого Decision 02 (Last Day scope):
- D5 perform FX subset (v1 = KILL+FREEZE+DRAG+HAZE) — **superseded** Decision 06 (CRASH повышен в v1, MIRAGE/BLEACH/TAR/CICADA/HEATWAVE добавлены).

---

## Phase plan (final consolidated roadmap)

| Phase | Window | Last Night | Last Day |
|-------|--------|------------|----------|
| **Phase 1 ship** | Months 1–9 | **v2.1 reverb-ядро** (15 блоков + 15 фиксов) + 40HP panel + 4 footswitches + bipolar NOISE/GEIGER knob | (R&D ongoing, see Phase 2) |
| **Phase 2 ship** | Months 9–27 | **Cold palette upgrade kit** (PULSE/FOG/FROST/CHILL/HUM + optional phaser layer добавляются в v3 PCB) | Full combine v1 ship |
| **Phase 2B** | Months 27–33 | HEATWAVE-class HUM optimization (если bench prototype confirms SNR) | Motorized tongue resonator (v2 premium) |
| **Phase 3** | Months 27+ | Satellites respec (ABD / FAS / Be Careful / I Show You Light переопределены как complement к combines) | — |

**Critical observation**: Phase 1 Last Night ship = **только reverb-ядро с базовыми FX** (noise/geiger bipolar + 4 footswitches). Cold palette FX (PULSE/FOG/FROST/CHILL/HUM) — это Phase 2 upgrade. Это **снижает risk** первого ship — отправляем proven reverb с simple FX, потом добавляем character.

---

## Принципы, которые держим

1. **Material plate cartridge — нерушимое ядро Last Night**. Все FX наслаиваются поверх, не заменяют.
2. **Bipolar NOISE/GEIGER knob** — элегантное объединение двух текстур в одном control. Один центральный noise generator (existing BZX55C9V1 + ATtiny85), split via VCAs по половинкам знака CV.
3. **Phaser — immersion, не identity**. Может быть toggled bypass без потери character модуля.
4. **Solenoid double-function** — один hardware actuator, два логических режима (DAMP sustained / TOLL pulse).
5. **Symmetric diptych с Last Day** — cold palette parallels hot palette. Не идентичные эффекты, а парные антиподы physical phenomena.
6. **40HP Eurorack + big-box pedal** — обе формы equally canonical.
7. **Cartridge стандарт един** между Day и Night.

---

## Что строим дальше

После lock этого decision:

1. **`LAST_NIGHT_SPEC.md`** переписывается полностью под consolidated base.
2. **`LAST_NIGHT_BUILD.md`** обновляется: blocks 16–18 (phaser/vinyl/gate-crush из v3.0) пересматриваются:
   - Phaser → опциональный layer (был block 16, остаётся).
   - Vinyl wow/flutter BBD → **удаляется** (переезжает в Last Day).
   - Gate/Crush → **удаляется** (заменён на TOLL/STALL solenoid double-function).
   - Cold palette FX (PULSE/FOG/FROST/CHILL/HUM) → новые blocks 16–20.
   - Bipolar noise/geiger knob → uplift block 15 (noise generator).
3. **SVG panel** обновляется: footswitches KILL/FREEZE/TOLL/STALL, bipolar NOISE/GEIGER center-detent knob.
4. **`SYSTEM_SUICIDE.md`** §9 синхронизируется с этой базой.
5. **Сателлиты-модули** (ABD, FAS, Be Careful, I Show You Light) пересматриваются отдельным decision document (TBD номер) — после lock этой базы они подтягиваются как complement к Day/Night.
