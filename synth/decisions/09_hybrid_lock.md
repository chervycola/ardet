# Decision 09 — Hybrid lock: mockup layout + Decision 08 internals

**Дата**: 2026-05
**Статус**: locked (overrides Decision 07 + parts of Decision 08 для panel UX; сохраняет electrical innovations Decision 08)
**Тип**: финальная гибридизация — UX по mockup пользователя, электрическая реализация по Decision 08

---

## Контекст

После lock Decision 08 ("consolidated base") и сравнения с **исходным mockup пользователя** (см. изначальный chat-screen с layout панели LAST NIGHT), выявлены три delta где Decision 08 разошлась с visual mockup:

1. **Footswitches**: mockup = TAP / GATE-CRUSH / BYPASS / FREEZE; Decision 08 = KILL / FREEZE / TOLL / STALL.
2. **NOISE / COLOR(geiger)**: mockup = две отдельные ручки (NOISE level + COLOR-geiger character); Decision 08 = один bipolar center-detent knob.
3. **Phase/Flutter named row**: mockup = большие knobs Phase/Flutter / DEPTH / SPEED + Shape Form slider — always-on equal effect; Decision 08 = опциональный PHASER subsection с ON/OFF toggle.

Пользователь выбрал **гибрид (вариант γ)**: UX следует mockup (visual consistency с замыслом), но **electrical implementation** сохраняет находки Decision 08 (solenoid double-function, shared noise+LFSR generator, cold palette FX layer Phase 2).

## Что фиксируется (финальная база)

### Panel UX = mockup пользователя

Точно соответствует исходному рисунку:

- **Footswitches**: TAP / GATE-CRUSH / BYPASS / FREEZE.
- **Noise секция**: 2 отдельные ручки — NOISE (level) + COLOR (geiger character — крутит от continuous hiss к cluster ticks). Не bipolar knob.
- **Phase/Flutter / DEPTH / SPEED**: большие named knobs в lower row, всегда активные (не опциональный layer). Phaser — равноправный эффект.
- **Shape Form slider** — горизонтальный, с waveform-glyphs для выбора LFO shape.
- **Top row**: INPUT / cartridge slot (с brackets обеих сторон) / CARTRIDGE FEEDBACK / DRY/WET / OUTPUT / SWITCH CLIP.
- **Color preset slider** (vertical, COLOR/WARM/DARK/COLOR/MIX) — сохраняется.
- **Middle row**: DRIVE / ATK / DEC / LowPass+HiPass (stacked) / POSIT / BOOST.
- **Big-box pedal 203×140мм** — необходимо для размещения всего набора контролов + 4 footswitches + 22 CV jacks.

### Electrical implementation = Decision 08 находки сохранены

Что не видно на панели но остаётся внутри:

- **Solenoid double-function** (block 14): DAMP sustained (existing CV) + **TOLL impulse strike** через 555 monostable + OR-gate. **Где UI**: TOLL и STALL — CV-only triggers через mini-jacks (J_TOLL_TRIG, J_STALL_CV), **не footswitches**. Footswitch GATE-CRUSH остаётся generic destruction effect (как в mockup), TOLL/STALL — modular CV territory.
- **Shared noise generator architecture**: NOISE knob (level) controls VCA после zener+amp tract. COLOR(geiger) knob — это **continuous crossfader между двумя noise sources** (zener continuous hiss ↔ ATtiny85 LFSR cluster ticks), а не просто LPF colour. Internally — два source'а + crossfader VCA pair (вместо bipolar split).
- **Cold palette Phase 2 layer** (PULSE / FOG / FROST / CHILL / HUM) — сохраняется как v3 PCB upgrade kit, добавляет 5 knobs + 5 CV jacks. На текущем mockup-layout — место зарезервировано в lower row справа (после SPEED) или в expansion zone.
- **Phaser implementation** = 4-stage OTA all-pass (LM13700 OTA2), Phase/Flutter feedback + DEPTH + SPEED. **Shape Form slider** = waveform selector LFO (triangle / sine / random S&H / vinyl-skip / step pattern).
- **GATE-CRUSH footswitch функция**: возвращается из v3.0 prototype. Latching gate (4066 CMOS switch + threshold comparator) + sample-hold crush (LF398 clocked by ATtiny PWM). Хочешь — постапокалипсис destruction; TOLL bell-strike — комплементарный perform-эффект через CV.

### Cartridge & power = без изменений

- 40HP Eurorack + big-box pedal 203×140мм — оба formfactor canonical.
- 12V DC pedal supply + isolated DC-DC (TRACO TMR 3-1212WI / Recom RKD-1212-D).
- Mini-XLR cartridge connectors, единый cartridge стандарт с Last Day.

## TOLL / STALL через CV — обоснование

В mockup-канон footswitches заняты универсальными pedal-функциями (TAP, BYPASS), которые **обязательны** для standard pedalboard integration:

- **TAP** — sync для SPEED (phaser/vinyl LFO) к input rhythm.
- **GATE-CRUSH** — performative gesture (latching).
- **BYPASS** — relay true bypass.
- **FREEZE** — loop hold.

Не остаётся footswitch-slots для TOLL/STALL. Однако они **остаются как modular-friendly CV-triggers**:

- **J_TOLL_TRIG** (gate input, 5V trigger) — короткий импульс активирует solenoid в TOLL mode (5–10мс strike → пластина звенит как колокол).
- **J_STALL_CV** (sustained CV, +5V hold) — продолжительный high сигнал держит soleнoid в DAMP-mode forced full pressure.

Это совместимо с modular sequencers и pedal-friendly через expression-jack adapter (TRS expression cable → CV converter, например CV-trigger box).

Footswitches mockup доминируют — TOLL/STALL остаются "advanced features" через CV-territory.

## Что становится недействительным из Decision 08

- §1 пункт **"4 footswitches KILL/FREEZE/TOLL/STALL"** — **superseded**. Footswitches возвращаются к TAP/GATE-CRUSH/BYPASS/FREEZE (mockup canon).
- §1 пункт **"bipolar NOISE/GEIGER center-detent knob"** — **superseded**. Возвращается mockup layout: 2 отдельные ручки (NOISE level + COLOR-geiger crossfader).
- §1 пункт **"phaser — опциональный immersion layer"** — **superseded**. Phaser = always-on named effect (mockup canon).

Остаются актуальными из Decision 08:
- ✓ 40HP Eurorack + big-box pedal 203×140мм dual SKU.
- ✓ Solenoid double-function (DAMP + TOLL pulse через 555 + OR-gate) — реализация identical, но trigger через CV.
- ✓ Shared noise generator architecture (zener + ATtiny85 LFSR) — реализация identical, но фронтенд = 2 knobs вместо bipolar.
- ✓ Cold palette FX layer (PULSE/FOG/FROST/CHILL/HUM) как Phase 2 v3 PCB upgrade kit.
- ✓ Cartridge стандарт един с Last Day.
- ✓ 12V DC + isolated DC-DC для pedal.
- ✓ Vinyl BBD wow/flutter удалён из Last Night (переезжает в Last Day).
- ✓ Gate/Crush сохраняется как footswitch destruction effect (revert from Decision 08 — он есть в mockup).

## Final layout (canonical visual mapping)

```
┌────────────────────────────────────────────────────────────────────────┐
│                         LAST  NIGHT                                    │
│                       system suicide                                   │
│                                                                        │
│  INPUT      ┌─[──────CARTRIDGE──────]─┐    DRY/WET   OUTPUT            │
│  (large)    │      slot               │    (large)   (large)           │
│             └─────────────────────────┘                                │
│                       CARTRIDGE FEEDBACK             SWITCH CLIP       │
│                                                                        │
│  ┌COLOR┐                                                               │
│  │WARM │  DRIVE  ATK  DEC     LowPass    POSIT  BOOST                  │
│  │DARK │                      HiPass                                   │
│  │COLOR│                                       ┌─ Shape Form slider ─┐ │
│  │MIX  │                                       │  ~  ~  ▲  ▼          │ │
│  └─────┘                                       └─────────────────────┘ │
│                                                                        │
│  TONE   NOISE   COLOR(geiger)   Phase/Flutter   DEPTH   SPEED          │
│                  (crossfader)    (large)        (large) (large)        │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ CV PATCH BAY:                                                          │
│ Row A: IN DRIVE DECAY NOISE POS DAMP LoPass MIX  EG(att) DRY WET       │
│ Row B: CLK TONE Attack COLOR FeedBack HiPass Boost TOLL STALL  L MAIN R│
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│  ▣ TAP             ▣ GATE-CRUSH                ▣ BYPASS   ▣ FREEZE     │
│  (momentary)       (latching)                  (relay)    (latching)   │
│                                                                        │
│                          12V DC ⊕━○━⊖    EXP ⊙                         │
└────────────────────────────────────────────────────────────────────────┘
```

## Что строим (next steps)

1. **SPEC.md** обновляется под hybrid:
   - Controls table: NOISE и COLOR(geiger) обратно — 2 ручки.
   - Phaser таблица: Phase/Flutter / DEPTH / SPEED как named effects (без PHASER ON/OFF toggle).
   - Footswitches: TAP / GATE-CRUSH / BYPASS / FREEZE.
   - CV inputs: добавить J_TOLL_TRIG и J_STALL_CV (новые modular-territory triggers).
2. **BUILD.md** обновляется:
   - Block 12 (NOISE) — два knobs frontend, internally shared zener+LFSR architecture, COLOR-knob = crossfader VCA.
   - Block 14 (Solenoid) — DAMP + TOLL через 555 + OR-gate (Decision 08 саркесь сохраняется), но trigger sources = CV-only (J_TOLL_TRIG, J_STALL_CV).
   - Block 18 (Gate/Crush) **восстанавливается** — был удалён в Decision 08, теперь возвращается для GATE-CRUSH footswitch.
   - Block 16 (Phaser) — always-on, не optional. PHASER ON/OFF toggle убран из panel.
3. **SVG panel** перерисовывается под mockup layout (TAP/GATE-CRUSH/BYPASS/FREEZE footswitches, NOISE+COLOR(geiger) две ручки, Phase/Flutter/DEPTH/SPEED named row + Shape Form slider).
4. **`.docx`** regenerate via pandoc.

## Принципы hybrid

- **Visual canon = пользовательский mockup**. UX, raskладка, что user видит — приоритет.
- **Electrical innovations Decision 08 сохраняются под капотом** (solenoid double-function, shared noise generator, cold palette роль). Не теряем технические находки.
- **TOLL/STALL — modular advanced features**. Доступны через CV-jacks, не footswitches. Pedal user их не использует, modular user пользуется как unique gestures.
- **Phaser возвращается в центр**. Не optional, а always-on named effect (как Strymon NightSky или OBNE Procession). Bypass только через BYPASS footswitch.
- **GATE-CRUSH сохраняется** как footswitch destruction (revert from Decision 08 §"removed"). Имплементация — 4066 gate + LF398 sample-hold (как в v3.0 prototype).
