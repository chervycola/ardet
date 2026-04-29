# LAST NIGHT — Спецификация продукта

> *Постапокалиптический ревербератор-симулятор разрушенного граммофона. Пустота, эхо, треск радиации, фейзер заброшенного эфира, плавящаяся плёнка и проседающий мотор винила.*

**Версия**: v3.0 — dual SKU + vinyl/phaser FX engine
**Часть серии**: SYSTEM SUICIDE, модуль 9 из 9

**Форм-факторы** (две canonical SKU, общая схема + cartridge система):
- **Eurorack 3U × 40HP** (203.2 × 128.5мм panel) — для modular setup.
- **Pedal ~178×119×38мм** (Eventide ModFactor class) или **145×113×60мм** (Hologram Microcosm class) — для pedalboard.

**Цена retail**:
- Eurorack 40HP: $499 budget / $649 premium.
- Pedal: $499 budget / $649 premium (одинаковая, разный enclosure).

---

## Содержание

1. [Обзор](#обзор)
2. [Архитектура и signal flow](#архитектура-и-signal-flow)
3. [Контролы и интерфейс](#контролы-и-интерфейс)
4. [Картриджи — каталог материалов](#картриджи--каталог-материалов)
5. [Тембральный характер](#тембральный-характер)
6. [Сценарии использования](#сценарии-использования)
7. [Технические характеристики](#технические-характеристики)
8. [Совместимость и patching](#совместимость-и-patching)
9. [Уход и обслуживание](#уход-и-обслуживание)

---

## Обзор

### Что это

Last Night — **аналоговая педаль-ревербератор на сменных физических пластинах** с интегрированными постапокалиптическими эффектами: фейзер, симулятор разрушающегося винила (wow/flutter, скрипы, треск), Geiger-counter noise, gate/crush для агрессивного редукции.

Реальная пластина из дерева, камня, металла, стекла или кости вибрирует от audio signal через surface exciter, два пьезо-датчика снимают резонанс. Каждый материал — уникальный голос: oak = тёплый slap, marble = cathedral, spring steel = infinite shimmer, glass = crystalline chime, bone = ritual.

Поверх натурального резонанса наслоены электронные эффекты разложения: фейзер делает ноту "плывущей", vinyl-секция симулирует сломанный мотор граммофона (wow/flutter с modulation), Geiger noise подменяет реальный hiss на cluster-импульсы радиации, gate/crush footswitch обрезает в bit-crushed гранулу.

### Чем отличается от обычных pedal-reverb

- **Сменные материальные картриджи** — никто другой не делает physical-plate reverb pedal.
- **Solenoid damper** — реальное механическое приглушение пластины (CV/expression-controlled).
- **Dual piezo с position crossfade** — два pickup-а на пластине, manual или CV blend.
- **Phaser sub-engine** — analog 4-stage OTA phaser, перед или после reverb (switchable).
- **Vinyl FX engine** — wow/flutter LFO, dust clicks, gate/crush — звук разрушения.
- **Color preset slider** — vertical 5-position selector (COLOR/WARM/DARK/COLOR/MIX) для quick tone preset.
- **Modular-style CV patch bay** — 14+ CV inputs снизу для full automation.
- **Stereo + dry/wet split outputs** — flexible routing в pedalboard.

### Категория

**Resonator reverb pedal с vinyl-decay FX**. Не имитация EMT 140 plate reverb, не digital algorithmic. Новая категория — **physical resonance + analog decay simulation**.

Конкуренты в boutique tier:
- Hologram Microcosm — granular/loop pedal, $399.
- Empress Reverb — algorithmic, $499.
- Strymon NightSky — DSP с CV, $400.
- Chase Bliss Habit — long-loop processor, $399.
- Eventide ModFactor — modulation, $279.
- Old Blood Noise Endeavors Procession — phaser-reverb hybrid, $279.

Last Night sits в **premium boutique tier** ($499–649) с unique physical differentiator (cartridge swap).

### Reality check (для customer expectations)

Заявленные в первоначальной концепции RT60 ("oak 1.5–4с") **завышены в 2–20×**. Реальные значения:
- Oak без feedback: 0.1–0.3с (perкуссивный slap).
- Marble: 0.8–2с (room ambience).
- Spring steel: 2–6с (long shimmer).
- С feedback knob — RT60 удлиняется до self-oscillation drone.
- С phaser/vinyl FX поверх — perceived "size" звука увеличивается ещё в 2–3× за счёт modulation tail.

### Use cases

- **Guitar/bass pedal** в pedalboard chain — после fuzz, перед delay/looper.
- **Synth processor** — pedalboard для desktop synth setup, replaces Eurorack reverb.
- **DJ FX send/return** — line-level routing.
- **Ambient sound design** — freeze + high feedback + phaser depth + slow vinyl wow.
- **Noise / experimental** — gate/crush stomp + self-oscillating cartridge + Geiger.
- **Vocals / drums (studio)** — line-level через Hi-Z input compatible.

### Эффекты "разрушающегося эфира" (postapocalypse FX engine)

Пять характерных модов разложения:

1. **Phaser** (Phase/Flutter / DEPTH / SPEED) — 4-stage OTA-based phaser. От slow swirl до seasick wow.
2. **Vinyl wow/flutter** — LFO модулирует pitch reverb-tail (tape-like instability).
3. **Geiger noise** — cluster-pattern impulse clicks (через ATtiny LFSR), а не continuous hiss.
4. **Gate/Crush** — footswitch активирует gate (cut signal under threshold) → bitcrush (downsample + bit-reduce). Аналоговая imitation digital decay.
5. **Solenoid stutter** — CV/expression на DAMP даёт rhythmic mechanical mute.

### What's in the box

**Eurorack SKU (40HP)**:
- Last Night module (203×128.5мм aluminum panel + 190×108мм PCB).
- 1× wood cartridge (Oak raw, reference).
- 1× shielded cartridge cable (mini-XLR + JST internal).
- Eurorack ribbon power cable (10/16-pin).
- Quick start card + warranty card.

**Pedal SKU (ModFactor-class)**:
- Last Night pedal (anodized aluminum corpus 178×119×38мм, или Microcosm-class 145×113×60мм для compact tier).
- 1× wood cartridge (Oak raw, reference).
- 1× shielded cartridge cable (mini-XLR + JST internal).
- 12V DC center-negative pedal supply (regulated, 500mA min) — **отдельно** или в premium bundle. Compatible: Voodoo Lab Pedal Power 4×4 (12V output), Cioks DC10, Eventide PowerMax.
- Quick start card + warranty card.

Обе SKU делят: identical schematic, identical cartridge spec, identical sound. **Cartridges interchangeable** между Eurorack и pedal версиями.

### Compatibility — Eurorack ↔ Pedal

**Eurorack SKU**:
- **Power**: ±12V bus, 200mA steady / 450mA peak.
- **I/O**: 3.5мм TS Thonkiconn jacks (audio + CV).
- **Mount**: 3U × 40HP standard rack.

**Pedal SKU**:
- **Power**: 12V DC center-negative (современный стандарт для complex pedals — Strymon, Eventide, Meris, Chase Bliss). Internal **isolated DC-DC** (TRACO TMR 3-1212WI или Recom RKD-1212) → bipolar ±12V audio rails. **500mA min supply current**.
- **Identical audio headroom к Eurorack version** (±12V rails везде, same +15 dBu max output).
- **Isolated DC-DC** также ломает ground loops с другими pedals на pedalboard — clean integration в любой rig.
- **I/O**: 6.3мм TS jacks (main audio in/out), 3.5мм mini-jack (CV expansion patch bay).
- **Bypass**: relay-buffered true bypass (no degradation when off).
- **Dimensions**: ModFactor-class (178×119×38мм) или Microcosm-class compact (145×113×60мм).
- **Weight**: ~500г.

### Cross-compatibility — single instrument, two enclosures

- **Identical schematic**: same blocks, same component values, same calibration.
- **Identical cartridges**: купленный к Eurorack картридж работает в pedal (и наоборот).
- **Identical sound**: бит-в-бит идентичный reverb + phaser + vinyl FX character.
- **Identical price**: $499 budget / $649 premium для обеих SKU.
- **Different power, panel, connectors** — только enclosure-level отличия.

Customer может start с pedal (для studio/live performance), позже добавить Eurorack для modular setup без потери tone.

## Архитектура и signal flow

### High-level signal chain (с FX engine)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│   IN ─► Buffer ─► [Pre-FX route] ─► Pre-emph ─► Driver ─► EXCITER ─┐      │
│           │                          (shelf)     (class AB)         ▼      │
│           │                                                  [PHYSICAL     │
│           ├── DRY path ──────────────────────────────┐        PLATE]       │
│           │                                          │           │         │
│           │                                          │           ▼         │
│           │                                          │   ┌── PIEZO A      │
│           │                                          │   ├── PIEZO B      │
│           │                                          │           │         │
│           │                                          │   JFET preamp      │
│           │                                          │   (LSK489A ×23)    │
│           │                                          │           │         │
│           │                                          │   POSITION xfade   │
│           │                                          │           │         │
│           │                                          │   De-emph ─► HiPass│
│           │                                          │           ► LowPass│
│           │                                          │           │         │
│           │                                          │   ┌───────┴────────┐│
│           │                                          │   │  PHASER        ││
│           │                                          │   │  (4-stage OTA, ││
│           │                                          │   │   Phase/Flutter││
│           │                                          │   │   DEPTH/SPEED) ││
│           │                                          │   └───────┬────────┘│
│           │                                          │           │         │
│           │                                          │   ┌───────┴────────┐│
│           │                                          │   │  VINYL FX      ││
│           │                                          │   │  (wow/flutter, ││
│           │                                          │   │   pitch warp,  ││
│           │                                          │   │   shape form)  ││
│           │                                          │   └───────┬────────┘│
│           │                                          │           │         │
│           │                                          │      LED clipper   │
│           │                                          │           │         │
│           │                                          │      ENV VCA       │
│           │                                          │      (LM13700)     │
│           │                                          │           │         │
│           ├──────────────────────────────────────────┴────► MIX ─┤         │
│           │                                                       │         │
│   Noise gen (zener / Geiger LFSR) ─► COLOR ─────────────────► MIX │         │
│                                                                   ▼         │
│                                                            ┌──────────┐    │
│   Color preset slider (vertical 5-pos) ─────────────────►  │ Tone     │    │
│   COLOR / WARM / DARK / COLOR / MIX                       │ Shaping  │    │
│                                                            └────┬─────┘    │
│                                                                 ▼          │
│                                                       OUT L (MAIN)         │
│                                                       OUT R (MAIN)         │
│                                                       DRY (separate)       │
│                                                       WET (separate)       │
│                                                                            │
│   GATE/CRUSH stomp ─► gate threshold + bitcrush sample-hold ─► insert      │
│                       в signal path post-mixer                             │
│                                                                            │
│   Feedback loop: wet → CARTRIDGE FEEDBACK pot → SW_FREEZE → driver         │
│                  (D_LIM soft clip, SPICE-stable)                           │
│                                                                            │
│   Solenoid damper: CV → Q5 → cartridge solenoid coil                       │
│                                                                            │
│   EG OUT: envelope follower output → external CV destination               │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Что происходит звуку (по блокам)

**Stage 1 — input + dry split**:
1. **Input buffer** — high-Z (1МΩ для guitar compatibility), CMOS-switch true bypass relay (pedal version).
2. **Dry path split** — для DRY OUT и dry mix bus.

**Stage 2 — material resonance**:
3. **Pre-emphasis** — shelving +8dB выше 3.2кГц для HF compensation материала.
4. **Class AB driver** — BD139/BD140 push-pull с bias diodes, R8 4.7Ω current limit, 3Вт peak на exciter.
5. **EXCITER** — Dayton DAEX25 (light) или DAEX32 (dense) на face A.
6. **Physical plate** — материал резонирует в bending modes.
7. **Dual piezo pickup** — Piezo A (bright, near exciter) + Piezo B (warm, far end).
8. **JFET preamp LSK489A** — dual matched, +27dB gain через mini-XLR shielded cables.
9. **POSITION crossfade** — A↔B mix (manual или CV).
10. **De-emphasis** — зеркало pre-emph.

**Stage 3 — dual filter**:
11. **HiPass filter** — variable, дает range от full-bass до telephone-band character.
12. **LowPass filter** — variable, controls top-end "veiled" feel.

**Stage 4 — phaser sub-engine**:
13. **Phaser (Phase/Flutter)** — 4-stage OTA-based all-pass network. RV_DEPTH controls phaser modulation depth; RV_SPEED controls LFO rate; SHAPE FORM slider — выбор LFO waveform (triangle / sine / random S&H / vinyl-skip pattern).
14. **Phaser feedback** — внутренний для resonant peaks.

**Stage 5 — vinyl FX**:
15. **Wow/flutter LFO** — slow modulator (0.5–8 Гц) → modulates phaser SPEED + ENV VCA → имитация неровного motor граммофона.
16. **Pitch warp** (внутри vinyl block) — slight pitch instability через time-varying delay (BBD chip — Coolaudio V3207, или PT2399 lo-fi alternative).

**Stage 6 — dynamics**:
17. **LED clipper** — 3× LED in series each polarity, +10.6 dBu threshold.
18. **Envelope follower VCA** — LM13700, 1–48мс attack, 10мс–1с decay. Output = wet signal с dynamic shaping.

**Stage 7 — mix + output**:
19. **Mix bus** — DRY + WET + NOISE + CV mix.
20. **Color preset slider** — 5-position vertical: COLOR / WARM / DARK / COLOR / MIX. Каждая позиция меняет EQ shape + saturation amount + phaser feedback в pre-set комбинациях для quick recall.
21. **Outputs**: 
   - **MAIN L+R** (stereo от dual piezo): A→L, B→R, или summed mono.
   - **DRY** (отдельный jack): чистый сигнал post-buffer, без обработки.
   - **WET** (отдельный jack): только обработанный сигнал, без dry.
   - **EG OUT**: CV из envelope follower для патчинга в external modules.

**Stage 8 — perform-FX (footswitch-driven)**:
22. **GATE/CRUSH stomp**: латчinг footswitch активирует gate (signal под threshold cuts) + bitcrush (sample-hold downsample) post-mixer. Постапокалипсис destruction effect.
23. **FREEZE stomp**: latches loop в self-sustain.
24. **TAP stomp**: tap-tempo для sync VINYL SPEED, phaser SPEED, или delay tail (Vinyl wow-rate sync к input rhythm).
25. **BYPASS stomp**: relay-buffered true bypass.

**Параллельно**:
- **Noise generator** — BZX55C9V1 zener (continuous hiss) или ATtiny LFSR (Geiger cluster pulses, premium).
- **Cartridge feedback** — wet signal → CARTRIDGE FEEDBACK knob → back to driver (pre-cartridge), создаёт self-oscillating drone на резонансе материала.
- **Solenoid damper** — CV/expression → mechanical plate mute.

### Важные параметры

| Параметр | Значение |
|----------|----------|
| **Frequency response** (без material, без FX) | 18Гц – 18кГц (-3dB) |
| **Noise floor** (input shorted, budget SKU) | -85 dBV |
| **Noise floor** (premium SKU, 4-layer PCB) | -95 dBV |
| **THD** (100мВ input, mid drive) | <0.5% |
| **Phaser depth** | 0–100% (4-stage all-pass) |
| **Phaser SPEED range** | 0.05–10 Гц |
| **Vinyl wow/flutter range** | 0.3–8 Гц modulation rate |
| **BBD pitch instability** (vinyl) | ±2% pitch variation max |
| **Maximum input** | +20 dBu (line level), +15 dBu typical |
| **Maximum output** | +12 dBu |
| **Power draw** (Eurorack) | ±12В, 250мА steady, 500мА peak |
| **Power draw** (Pedal) | 12V DC, 350мА typical / 500мА peak (включая phaser + vinyl + DC-DC losses) |
| **Feedback loop stability** | SPICE-verified для cartridges Q ≤ 1000 |
| **Exciter peak power** | 3Вт sustained, 8Вт peak |

## Контролы и интерфейс

Контролы идентичны для обеих SKU (одна схема). Раскладка отличается только enclosure-level — pedal vs Eurorack.

### Раскладка панели — Pedal SKU (~178×119мм, ModFactor-class)

Layout соответствует mockup:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ◯                          LAST  NIGHT                                   ◯  │
│                          system suicide                                      │
│                                                                              │
│  ◉ INPUT     ┌─────────────────────────┐    ◉ DRY/WET   ◉ OUTPUT             │
│              │     CARTRIDGE SLOT      │                                     │
│              │   horizontal slot —     │   ◉ CARTRIDGE FEEDBACK              │
│              │   plate visible         │                                     │
│              └─────────────────────────┘                                     │
│                                                                              │
│  ┌─COLOR─┐                                                                   │
│  │ COLOR │                                                ▢ SWITCH CLIP      │
│  │ WARM  │  ◉ DRIVE   ◉ ATK   ◉ DEC      ◉ POSIT  ◉ BOOST                   │
│  │ DARK  │                                                                   │
│  │ COLOR │                       ◉ LowPass         ┌──── Shape Form ────┐   │
│  │ MIX   │                       ◉ HiPass          │   slider →          │   │
│  └───────┘                                          └─────────────────────┘   │
│                                                                              │
│  ◉ TONE   ◉ NOISE   ◉ COLOR(geiger)   ◉ Phase/Flutter  ◉ DEPTH  ◉ SPEED     │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  CV PATCH BAY (mini-jacks 3.5мм)                                             │
│                                                                              │
│  Row A: ⊙IN ⊙DRIVE ⊙DECAY ⊙NOISE ⊙POS ⊙DAMP ⊙LoPass ⊙MIX  ⊙EG ⊙DRY ⊙WET    │
│  Row B: ⊙CLK ⊙TONE ⊙Attack ⊙COLOR ⊙FeedBack ⊙HiPass ⊙Boost  ⊙L ⊙MAIN ⊙R    │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  ▣ TAP        ▣ GATE/CRUSH                       ▣ BYPASS    ▣ FREEZE        │
│  (footswitch) (footswitch)                       (footswitch)(footswitch)    │
│                                                                              │
│                  12V DC ⊕━○━⊖    EXP IN  ⊙                                   │
│  ◯                                                                       ◯   │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Pedal layout особенности**:
- **4 footswitches** в нижнем ряду: TAP / GATE-CRUSH / BYPASS / FREEZE.
- **2 ряда CV patch bay** (всего ~21 mini-jack) — modular-style integration с external CV.
- **Cartridge slot horizontal** в top section — visible через окно.
- **Color preset slider** vertical (5 positions) — quick tone preset selector.
- **Shape Form slider** horizontal — phaser LFO waveform shape.
- **SWITCH CLIP toggle** — soft/hard clipper mode.
- **12V DC jack** (center-negative, 2.1мм barrel) + **EXP pedal jack** на rear (или нижний край).

### Раскладка панели — Eurorack SKU (40HP × 128.5мм)

Тот же набор контролов, разная компоновка:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            LAST  NIGHT                                   │
│                       system suicide                                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ◉ INPUT  ◉ DRIVE  ◉ ATK  ◉ DEC  ◉ POSIT  ◉ BOOST  ◉ DRY/WET  ◉ OUTPUT  │
│                                                                          │
│  ┌─COLOR─┐  ◉ LowPass    ◉ HiPass         ┌── Shape Form slider ─────┐  │
│  │slider │                                 │                           │  │
│  │ COLOR │  ◉ TONE  ◉ NOISE  ◉ COLOR(geig) │                           │  │
│  │ WARM  │                                 │  ▢ SWITCH CLIP            │  │
│  │ DARK  │  ◉ Phase/Flutter  ◉ DEPTH      └───────────────────────────┘  │
│  │ COLOR │  ◉ SPEED   ◉ CARTRIDGE FB                                     │
│  │ MIX   │                                                               │
│  └───────┘                                                               │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │              [  C A R T R I D G E   S L O T  ]                     │ │
│  │     horizontal dock — magnetic mount + retention pin               │ │
│  │              100×60мм plate window                                 │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ▢ FREEZE toggle    ▢ TAP/SYNC button    ▢ GATE-CRUSH button             │
│  ◉ Activity LED  ◉ Clip L  ◉ Clip R  ◉ Damp LED                          │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  CV inputs (3.5мм Thonkiconn):                                          │
│  ⊙IN ⊙DRIVE ⊙DECAY ⊙NOISE ⊙POS ⊙DAMP ⊙LoPass ⊙HiPass ⊙MIX ⊙CLK         │
│  ⊙Attack ⊙TONE ⊙COLOR ⊙FB ⊙Boost                                        │
│                                                                          │
│  Audio:  ⊙ MAIN L  ⊙ MAIN R   ⊙ DRY OUT  ⊙ WET OUT  ⊙ EG OUT             │
└──────────────────────────────────────────────────────────────────────────┘
```

### Полная таблица контролов

| # | Контрол | Тип | Функция | CV input |
|---|---------|-----|---------|----------|
| 1 | **INPUT** | Pot lin | Input gain (compatible с line level и instrument) | ✓ IN CV (level/trim) |
| 2 | **CARTRIDGE FEEDBACK** | Pot log | Уровень рециркуляции в plate-loop. На max → self-oscillation | ✓ FeedBack CV |
| 3 | **DRY/WET** | Pot log | Mix dry vs обработанного | ✓ MIX CV |
| 4 | **OUTPUT** | Pot lin | Master output level | — |
| 5 | **DRIVE** | Pot log | Уровень сигнала на exciter, глубина сатурации | ✓ DRIVE CV |
| 6 | **ATK (Attack)** | Pot log | Envelope follower attack 1–48мс | ✓ Attack CV |
| 7 | **DEC (Decay)** | Pot log | Envelope follower decay 10мс–1с | ✓ DECAY CV |
| 8 | **POSIT (Position)** | Pot dual-gang | Crossfade piezo A↔B (тембральный) | ✓ POS CV |
| 9 | **BOOST** | Pot lin | Pre-emphasis HF shelf 0 → +8dB | ✓ Boost CV |
| 10 | **LowPass** | Pot lin | LPF cutoff post-pickup | ✓ LoPass CV |
| 11 | **HiPass** | Pot lin | HPF cutoff post-pickup (новый dual-filter design) | ✓ HiPass CV |
| 12 | **TONE** | Pot lin | Master tone tilt EQ | ✓ TONE CV |
| 13 | **NOISE** | Pot log | Noise generator level mix | ✓ NOISE CV |
| 14 | **COLOR (geiger)** | Pot lin | Geiger-noise color: continuous hiss → cluster pulses → discrete clicks | ✓ COLOR CV |
| 15 | **Phase/Flutter** | Pot lin | Phaser feedback / resonance peak | — |
| 16 | **DEPTH** | Pot lin | Phaser modulation depth (0–100%) | — |
| 17 | **SPEED** | Pot log | Phaser + vinyl wow LFO rate (0.05–10 Гц) | ✓ CLK CV (sync to external clock) |
| 18 | **Color slider** | Vertical 5-pos slider | Preset tone selector: COLOR / WARM / DARK / COLOR / MIX | — |
| 19 | **Shape Form slider** | Horizontal slider | Phaser LFO waveform: triangle / sine / random / vinyl-skip / step | — |
| 20 | **SWITCH CLIP** | 2-position toggle | Hard clip (LED) vs soft clip (diode) | — |

### Footswitches (Pedal SKU)

| Switch | Функция |
|--------|---------|
| **TAP** | Tap-tempo для phaser SPEED + vinyl wow rate sync |
| **GATE/CRUSH** | Latching: gate (signal under threshold cuts) + bitcrush sample-hold для destruction effect |
| **BYPASS** | Relay-buffered true bypass (no signal coloration when off) |
| **FREEZE** | Latching: freezes feedback loop, бесконечный sustain |

В Eurorack SKU: TAP/SYNC button, GATE-CRUSH button, FREEZE toggle. BYPASS не нужен (можно просто отключить кабель).

### CV Patch Bay (Pedal: ~21 jacks; Eurorack: ~15 jacks)

Все controls имеют CV destination. Список:

**Audio I/O**:
- IN (audio input, 1× jack)
- MAIN L, MAIN R (stereo output)
- DRY OUT (separate dry signal post-buffer)
- WET OUT (separate wet signal без dry)

**CV inputs**:
- IN CV (input level)
- DRIVE CV
- ATTACK CV
- DECAY CV
- NOISE CV
- POS CV (Position)
- DAMP CV (solenoid damper)
- LoPass CV
- HiPass CV
- MIX CV (dry/wet)
- TONE CV
- COLOR CV (Geiger color)
- FeedBack CV (cartridge feedback)
- Boost CV

**Outputs (CV/audio)**:
- EG OUT (envelope follower output, 0-5V для external CV destinations)
- CLK CV (clock input для sync phaser/vinyl rate)

**Pedal-only**:
- EXP IN (expression pedal jack, normalled к user-assignable target)

### Cartridge connector (внутри slot, идентичен в обеих SKU)

| Connector | Покрытие | Функция |
|-----------|----------|---------|
| **TA3M (mini-XLR) ×2** | Shielded coax 50мм | Piezo A, Piezo B (low-noise audio) |
| **JST-XH 2-pin ×2** | Twisted pair | Exciter drive, Solenoid coil |

## Картриджи — каталог материалов

### Формат картриджа

- **Внешний размер рамки**: 110×65×30мм (PETG 3D-print prototype, фрезерованный алюминий production).
- **Plate dimensions**: длина **100мм fixed**, высота 20–60мм per material, толщина 0.5–6мм per material.
- **Mount**: 4× neodym N42 магниты align + spring-loaded retention pin.
- **Connectors**: 2× mini-XLR (Piezo A, B) + 2× JST-XH (Exciter, Solenoid).
- **Mass**: ~50г frame + plate-зависимая масса.

### Phase 1 catalog — 6 cartridges (initial launch)

| Картридж | Размеры (Д×В×Т, мм) | Масса plate | RT60 (без feedback) | Exciter | Pickup | Retail |
|----------|---------------------|-------------|---------------------|---------|--------|--------|
| **OAK RAW** | 100×40×4 | 12г | 0.1–0.3с | DAEX25FHE-4 | 2× piezo 27мм | $80 |
| **OAK LINSEED** | 100×40×4 | 12г | 0.15–0.35с | DAEX25FHE-4 | 2× piezo 27мм | $90 |
| **MAPLE SHELLAC** | 100×35×4 | 10г | 0.2–0.5с | DAEX25FHE-4 | 2× piezo 27мм | $110 |
| **MARBLE** | 100×50×5 | 68г | 0.8–2с | DAEX32Q-4 | 2× piezo 27мм | $150 |
| **BRASS** | 100×30×3 | 77г | 1–3с | DAEX32Q-4 | 2× piezo 27мм | $160 |
| **SPRING STEEL** | 100×20×0.5 | 8г | 2–6с | DAEX25FHE-4 | 2× piezo 27мм | $130 |

### Phase 2 additions (после ship Phase 1)

| Картридж | Размеры | RT60 | Характер | Retail |
|----------|---------|------|----------|--------|
| **EBONY** | 100×25×3 | 0.3–0.8с | Премиум, длинный sustain, тёмный | $180 |
| **NEPHRITE (Jade)** | 100×40×4 | 0.5–1.5с | Поющий, медитативный, культурный | $250 |
| **COPPER** | 100×40×1.5 | 1–2.5с | Колокольный, patina меняет тембр | $170 |
| **PYREX GLASS** | 100×40×3 | 1–3с | Crystalline chime (compatible с Be Careful) | $140 |
| **BONE (lopatka)** | 100×40×4 | 0.3–0.8с | Мрачный, ритуальный, sourced ethically | $190 |
| **TITANIUM** | 100×30×1.5 | 3–8с | Ultra-premium, max Q, infinite ring | $350 |

### Premium tier cartridges (с PVDF pickup)

Premium SKU использует **PVDF film** на B-канале вместо piezo disk → нейтральная АЧХ, **position crossfade становится тембральным control "coloured ↔ neutral"** (не просто "ближе/дальше").

| Картридж | Tier | Premium up-charge |
|----------|------|-------------------|
| Standard line (oak, marble, brass...) | Budget | — |
| Standard line (premium SKU) | Premium | +$30 (PVDF on B-channel) |

### Sound character (per material, в более detail)

#### Wood — теплота органическая

- **Oak raw**: матовый, mid-focused, как звук удара по dry wood. Короткий decay. Идеален для perкуссии и vocals.
- **Oak linseed**: чуть ярче чем raw (закрытые поры), more sustained. Готов для studio reference.
- **Maple shellac**: скрипичный, музыкальный, harmonic richness. Шеллак — самое музыкальное покрытие. Premium woody.

#### Stone — пространство монументальное

- **Marble**: cathedral. Длинный пространственный tail, dense, тёплый. Для drone и ambient.
- **Slate** (Phase 2): тёмный, comb filter character.

#### Metal — shimmer и резонанс

- **Brass**: bell-like, ситарный buzz, восточный character. Singing bowl в reverb form.
- **Spring steel**: classic plate-like shimmer, infinite ring при high feedback. Самый "обычный reverb" звук.
- **Copper** (Phase 2): mellow, warm metal, patina aging добавляет character.
- **Titanium** (Phase 2): glassy, чистый, max Q. Premium endgame cartridge.

#### Glass — кристаллическая хрупкость

- **Pyrex** (Phase 2): высокий Q narrow band-pass character. Compatible с Be Careful filter module — universal cartridge platform.

#### Bone & exotic

- **Bone scapula** (Phase 2): сухой, ритуальный, matt sustain. Source: cattle (food industry byproduct, ethical).
- **Mammoth ivory** (limited edition): между bone и stone. $400–600 retail. Limited 50 units.

### Cartridge swap procedure

1. Power down module (или mute через FREEZE during swap).
2. Pull spring-loaded retention pin (small lever).
3. Slide cartridge out (magnetic detach).
4. Slide new cartridge in until magnets engage.
5. Push retention pin back.
6. Done. Ready to play.

**Hot-swap при включенном питании** — возможен, но возможен short pop при mating. Recommend mute или freeze before swap.

### Care и maintenance

- **Wood cartridges**: re-oil каждые 6–12 месяцев (1 drop linseed oil, polish с lint-free cloth).
- **Glass cartridges**: handle с care, не drop. Storage в padded foam box.
- **Metal cartridges**: чистить от oxidation если patina нежеланна. Brass tarnishes naturally.
- **Bone cartridges**: keep dry. Не expose к humidity (warping risk).
- **Stone cartridges**: heaviest, careful с rack mounting (don't drop into rack).

## Тембральный характер

### Общий character

Постапокалиптичный. Звук **пустоты**, не зала. Каждый удар оставляет физический отпечаток на материале — слышно, как пластина "помнит" сигнал. На high feedback — drone "коридора, по которому никто не идёт".

### По регистру

- **Низ** (50–200Гц): зависит от материала. Дерево скрашивает, мрамор резонирует, тонкий металл не передаёт.
- **Середина** (200Гц–2кГц): главный sweet spot модуля. Все materials говорят здесь.
- **Верх** (2кГц–10кГц): зависит от exciter и pre-emphasis. Дерево заваливает, стекло подчёркивает.
- **Воздух** (10кГц+): minimal без помощи pre-emphasis.

### По динамике

Envelope follower VCA reagирует на input dynamics:
- **Громкие удары** → wet signal в полную силу → выраженный reverb tail.
- **Тихие ноты** → wet signal ослаблен → почти dry с micro-tail.
- **Sustained tones** → envelope settles → constant wet level.
- **Percussion** → быстрый attack envelope → dynamic shaping.

Это даёт **естественную dynamic compression** — не нужен external sidechain для transparent reverb.

### Saturation behavior

При high DRIVE сигнал перегружает class AB driver → BD139/BD140 saturate → adds even-harmonic distortion. **Не транзисторный clipping** — softer, ламповый character. Combined с material resonance — даёт "warm overdrive с tail".

### Feedback character

- 0–30%: subtle reinforcement, slight tail extension.
- 30–60%: noticeable reverb с cleanly extended decay.
- 60–80%: long evolving tail, slight modulation от feedback dynamics.
- 80–95%: edge of self-oscillation, dramatic sustained drone.
- 95–100%: **self-oscillating** на dominant material resonance. Frequency depends on cartridge material.

D_LIM1/D_LIM2 soft-clip diodes prevent runaway amplitude (verified SPICE), но не frequency stability — self-oscillation на резонансной частоте материала возможна и intended.

### Position crossfade character

- **Full A position**: bright, immediate, "близкий" звук — ear-on-the-plate.
- **Center**: mixed both pickups — fullest sound.
- **Full B position**: warm, diffuse, "далёкий" звук — ear-в-room.

С PVDF B-pickup (premium) — A→B sweep становится "coloured analog → neutral hi-fi" sweep. Tonal control, не spatial.

### Noise generator character

- **White noise** (COLOR full CW): full-spectrum hiss, "tape hiss" feel.
- **Brown noise** (COLOR full CCW): low-frequency rumble, "wind in empty room".
- **Mid color**: pink-ish, broadband but warm.

Phase 2 v2 (optional Geiger pattern firmware): impulsive clicks instead of continuous hiss → "post-apocalyptic radiation count".

## Сценарии использования

### Patch 1 — Vocal reverb (studio)

```
Vocal mic → preamp → Last Night IN
Cartridge: OAK SHELLAC (musical, не overpowering)
DRIVE: 9 o'clock (clean)
FEEDBACK: 11 o'clock (mid tail)
MIX: 1 o'clock (heavy wet)
TONE: 2 o'clock (slight HF roll-off)
POSITION: 12 (center)
ATTACK: 9 (fast)
DECAY: 1 (medium hold)

OUT → DAW interface
```

Result: warm vocal reverb с natural dynamics, не overpowering.

### Patch 2 — Synth lead drone (Eurorack)

```
VCO → VCF → Last Night IN
Cartridge: SPRING STEEL (long shimmer)
DRIVE: 12 (mid drive)
FEEDBACK: 3 o'clock (long tail)
FREEZE: ON (locked drone)
MIX: full wet
ATTACK: full clockwise (slow swell)
DECAY: full clockwise (max sustain)

CV from Fuck Abandoned Sleep pendulum LFO → CV_DAMP
(slow modulation of solenoid damper → breathing drone)

OUT → mixer
```

Result: 30-секундный sustained drone с pendulum breathing.

### Patch 3 — Percussion (live)

```
Drum machine → Last Night IN
Cartridge: BRASS (bell-like)
DRIVE: 3 o'clock (saturated)
FEEDBACK: 9 (short)
MIX: 11 (mostly dry с slight wet)
TONE: 12 (neutral)
POSITION: 9 (bright A)
ATTACK: 9 (immediate)
DECAY: 11 (short)

Performance: kick triggers via SIDE → percussive bell-tail.

OUT → live mixer
```

Result: "brass bell" перkussive accent over drums.

### Patch 4 — Ambient pad (compositional)

```
Pad synth → Last Night IN
Cartridge: MARBLE (cathedral)
DRIVE: 11 (gentle)
FEEDBACK: 1 (long)
MIX: 3 (heavy wet)
TONE: 1 (warm)
POSITION: 2 (warm B)
ATTACK: 12 (medium)
DECAY: 3 (long)

External LFO → CV_MIX (slow swell of wet level over 60 секунд)

OUT → headphones / monitors
```

Result: cathedral ambient pad с slow evolution.

### Patch 5 — Noise / experimental (industrial)

```
Noise source → All Bones Dust → Last Night IN
Cartridge: SPRING STEEL
DRIVE: full CW (over-driven)
FEEDBACK: 4 o'clock (near self-osc)
MIX: full wet
TONE: 3 (bright)
NOISE: 3 (heavy noise mix)
COLOR: 12 (white noise)

External gate → CV_DAMP (rhythmic damping)

OUT (L) → Last Day IN (для feedback bridge)
Last Day OUT → BACK to Last Night IN (через mixer)
= Infinite Day↔Night feedback loop
```

Result: industrial noise wash с rhythmic clamping.

### Patch 6 — Day → Night transition (full system)

```
Synth voice → All Bones Dust → Be Careful → IS MY → Last Day → AND MY → Last Night → OUT

AND MY balance: slowly automated 0 → 100% over 4 minutes
(starts at Last Day mostly, ends at Last Night fully)

= Composition arc от raskалённого полдня в холодную ночь
```

Result: 4-минутная композиция, проходящая через всю серию.

### Patch 7 — Guitar pedal (live)

```
Guitar → Last Night IN (Hi-Z compatible с R1=1МΩ)
Cartridge: MAPLE SHELLAC (musical)
DRIVE: 12 (clean)
FEEDBACK: 11 (short tail)
MIX: 12 (50/50)
TONE: 1 (warm)

Footswitch (FREEZE momentary) — hold for sustain freeze
Expression pedal → MIX (foot-controlled wet/dry)

OUT → guitar amp
```

Result: traditional reverb pedal с swappable acoustic character.

### Patch 8 — DJ FX send/return (live performance)

```
DJ console FX SEND → Last Night IN (RCA если premium SKU)
Cartridge: MARBLE (cathedral)
DRIVE: 1 (heavy)
FEEDBACK: 3 (long)
MIX: full wet (post-FX bus)

Master beat → SIDE input (sidechain pumping)

OUT → console FX RETURN (RCA)
```

Result: rhythmic pumping reverb wash, dub-style.

## Технические характеристики

### Electrical

| Параметр | Значение |
|----------|----------|
| **Power supply** | ±12В Eurorack bus (modular) или 12V DC center-negative + TRACO TMR 3-1212WI / Recom RKD-1212-D isolated DC-DC (pedal) |
| **Power consumption** | 200мА steady, 450мА peak (с solenoid pulse) |
| **Audio input** | 1× 3.5мм TS, Hi-Z (1МΩ), max +20 dBu |
| **Sidechain input** | 1× 3.5мм TS, line level |
| **Audio outputs** | 2× 3.5мм TS (mono mix L, stereo R via normalling) |
| **CV inputs** | 3× 3.5мм TS (mix, decay, damp), 0–10В range |
| **Frequency response** (without cartridge) | 18Гц – 18кГц (-3dB) |
| **Output impedance** | 1кΩ |
| **Maximum output** | +12 dBu before clipping |
| **THD** (100мВ in, mid drive) | <0.5% |
| **SNR** (input shorted) | 85 dB (budget), 95 dB (premium 4-layer PCB) |
| **Crosstalk** L↔R | <-60 dB @ 1кГц |

### Mechanical

| Параметр | Значение |
|----------|----------|
| **Form factor** | Eurorack 3U × 40HP (203.2мм × 128.5мм panel) |
| **PCB** | 2-layer FR4 1.6мм (budget) / 4-layer FR4 1.6мм (premium) |
| **PCB dimensions** | 101.6 × 108мм |
| **Depth** (behind panel) | 35мм (excluding cartridge dock) |
| **Cartridge dock depth** | 30мм additional |
| **Total module depth** | 65мм |
| **Weight** (module без cartridge) | 220г |
| **Weight** (typical cartridge) | 60–130г |
| **Mounting** | M3 screws, 4 corners |

### Connectors

| Connector | Specification |
|-----------|---------------|
| **Audio in/out** | Thonkiconn PJ301M-12 (3.5мм TS, vertical) |
| **CV in** | Thonkiconn PJ301M-12 |
| **Cartridge piezo** | 2× Switchcraft TA3M (mini-XLR, locking, shielded) |
| **Cartridge exciter** | JST-XH 2-pin |
| **Cartridge solenoid** | JST-XH 2-pin |
| **Power** | 2×5 IDC (Eurorack standard) или DC jack 12V (pedal) |

### Cartridge interface

| Параметр | Значение |
|----------|----------|
| **Mount** | 4× neodymium N42 magnets + spring-loaded retention pin |
| **Hold force** | ~5N (resistant к casual rack handling, releases с deliberate pull) |
| **Magnetic field at piezo trace** | <0.1мТ (negligible audio interference) |
| **Insertion cycles** | >1000 specified |
| **Hot-swap** | Possible (с FREEZE engaged), но не recommended (audible pop on mate) |

### Cartridge plate physics (typical wood)

| Параметр | Значение |
|----------|----------|
| **Plate dimensions** | 100мм × 20–60мм × 0.5–6мм (variable) |
| **Mode density** | ~950 modes below 10кГц для oak 100×40×4мм |
| **Fundamental frequency** | 200–400Гц typical for wood |
| **RT60 unforced** | 0.1–0.3с (oak) до 6с (spring steel) |
| **Q factor** | 50 (oak) до 1000+ (titanium) |

### Compliance

| Standard | Status |
|----------|--------|
| **CE marking** | Compliant (low-voltage directive, EMC) — full certification по Phase 2 |
| **RoHS** | Compliant |
| **REACH** | Compliant |
| **FCC** (US) | TBD по Phase 2 (для US market entry) |
| **WEEE** | Compliant (EU recycling) |

### Warranty

| Тип | Срок |
|-----|------|
| **Parts & labor** | 1 год |
| **Cartridges** | 30 дней (defect только, не accidental damage) |
| **Glass cartridges** | Excluded (хрупкость as designed) |
| **Out-of-warranty repair** | Flat fee $50 + parts |
| **Lifetime** | Replacement components доступны 5 лет (2N7000, BD139/140, общедоступные); LSK489A критическая часть, обеспечена через dual-source strategy |

## Совместимость и patching

### Eurorack совместимость

- **Power**: ±12В bus (стандарт), 2×5 IDC. Reverse polarity protection через 1N5817.
- **HP**: 40HP — flagship size. Fits в 84HP, 104HP, 168HP racks (occupies нижнюю половину). Same size as Last Day (зеркальная пара).
- **Depth clearance**: 65мм total — fits в стандартные case (Tiptop Mantis 60мм может не fit; Doepfer А-100 шкафы — yes).

### Pedal совместимость

- **Power**: **12V DC center-negative, 2.1мм barrel jack**, 500mA min, regulated. Это modern standard для complex pedals (Strymon TimeLine $449, Eventide H9 $499, Meris LVX $599, Chase Bliss CXM 1978 — все 12V). 9V supplies **не подходят** — нужны 12V outputs от pedalboard PSU. Compatible: Voodoo Lab Pedal Power 4×4, Cioks DC7/DC10, Eventide PowerMax, Strymon Zuma R300, MXR M238 ISO-Brick (на 18V port — внимание polarity).
- **Bypass**: relay-bypassed buffered. Selectable true bypass через internal jumper.
- **TRS jacks**: main I/O 6.3мм TS, CV inputs 3.5мм mini-jack patch bay.
- **Footswitches**: TAP (momentary), GATE/CRUSH (latching), BYPASS (relay), FREEZE (latching).

### Compatible с другими SYSTEM SUICIDE модулями

- **Fed by**: I Show You Light, Body Blood And Salt, All Bones Dust, Be Careful, Last Day.
- **Modulated by**: Fuck Abandoned Sleep (CV from pendulum LFO), Is My (gates/clocks), And My (balance crossfade с Last Day).
- **Feeds**: And My (input в crossfader), final OUTPUT.

### Compatible с external Eurorack modules

- **VCO**: any standard Eurorack VCO (Make Noise, Mutable, Erica Synths).
- **VCF**: any filter — Last Night sits после filter.
- **Sequencer**: trigger в SIDE input или CV в DAMP for rhythmic effects.
- **LFO**: external LFO в любой CV input для modulation.
- **Mixer**: standard summing mixer для multi-source patches.

### Compatible с external pedal chains

- **Position в chain**: typically last в reverb/delay slot. Fits хорошо после fuzz/distortion, before delay/looper.
- **Send/return loops**: works в FX loops с -10dBV или +4dBu levels.
- **DJ console**: RCA option (premium) for FX send/return integration.

### Patching tips

1. **Avoid overload**: high DRIVE + bright cartridge + high BOOST → может перегрузить downstream. Watch CLIP LEDs.
2. **Self-oscillation**: high FEEDBACK на high-Q cartridges (titanium, spring steel) → controlled drone. Tune frequency через POSITION crossfade.
3. **Side-chain pumping**: kick через SIDE input → pumping reverb wash. Adjust DECAY to taste.
4. **Stereo from mono**: A→L, B→R через position crossfade + stereo OUT — pseudo-stereo effect from single source.
5. **Infinite loop**: с Last Day — connect Last Day FB SEND → Last Night SIDE, Last Night OUT → Last Day FB RETURN. Bidirectional feedback.

## Уход и обслуживание

### Регулярный уход

- **Cartridge swap**: до 1000 cycles specified. После 500+ swaps — visual inspection магнитов на debris.
- **Pots**: используются Alpha RV09 quality. Контактная очистка DeoxIT каждые 2 года при heavy use.
- **Cartridge dock cleanliness**: blow dust от mini-XLR connectors каждые 6 месяцев compressed air.
- **PCB inspection**: при weird noise — open chassis, visually inspect для cold solder joints, capacitor bulging.

### Wood cartridge re-finishing

Через 6–12 месяцев wood cartridges могут потерять surface finish:

1. **Linseed oil cartridges**: drop линс oil на surface, polish с lint-free cloth, 24h cure.
2. **Shellac cartridges**: одно coat shellac alcohol-thinned (1:3), brush, 12h cure, light sanding (#400), polish.
3. **Raw wood cartridges**: just dust off. Optional: light wax for protection.

### Glass cartridge handling

- **NEVER drop** — glass cartridges are fragile.
- Storage: foam-padded box или dedicated cartridge wallet.
- Transport: never в bare rack. Always padded.
- Если cracked — discard, не try to play (oscillation amplification может shatter).

### Metal cartridge maintenance

- **Brass**: tarnishes naturally. Clean с brass polish (Brasso) для shine, или leave для patina character.
- **Spring steel**: rust prevention — light oil coat (3-in-1 oil) каждые 12 месяцев. Wipe excess.
- **Copper**: develops green patina, может change tone subtly. **Feature, not bug**.
- **Titanium**: maintenance-free. Doesn't oxidize.

### Stone cartridge handling

- Heavy. Mount carefully в rack — drop risk.
- Marble может chip if struck — handle с two hands.

### Bone cartridge

- Keep dry — humidity warps.
- Don't expose к direct sunlight (UV damage).

### Module repair

**Common issues**:

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| No sound output | Power issue, blown fuse | Check ±12V на ICs, verify 1N5817 not shorted |
| Hum 50/60Гц | Ground loop | Check star-ground tie at power conn, replace cable |
| Clicks при solenoid activation | EMI coupling в piezo | Verify mini-XLR cables shielded, ferrite bead на solenoid |
| Self-oscillation runaway | Feedback loop instability | Check D_LIM diodes installed correctly, test SPICE if recurring |
| One channel dead | JFET preamp failure | Test LSK489A с DMM, check bias resistors |
| Solenoid не activates | MOSFET gate issue | Verify R_DAM1 = 47кΩ, gate voltage at CV 5В should be ~3.4В |
| Wood cartridge pitch sounding "thin" | Plate cracked or detached от exciter | Replace cartridge |
| Distortion на line level | LED clipper threshold low | Verify D1/D2 = 3× LED in series (not single LED) |
| Hiss above noise floor | Input source / cable / preamp issue | Test с input shorted — should be -85dBV или quieter |

**Repair cost** (out of warranty):
- Component replacement: $30 flat fee + parts cost.
- Major rework (PCB damage): $80 + parts.
- Cartridge replacement: $80–250 depending material.

### Software/firmware updates (если v2 noise generator с MCU)

Если future version имеет ATtiny85 для Geiger-pattern noise:
- USB-DFU update через bootloader (no programmer needed).
- Update file посылается customer email при release.
- Backwards compatible: original analog mode остаётся accessible.

### End of life

При финальном retirement модуля:
- Module: WEEE compliant disposal (Europe), e-waste (US).
- Cartridges: reusable, sell к other Last Night owners.
- Custom cartridges (laser-etched ones): collector items.

---

## Контакты и поддержка

- **Manual download**: ardet.systems/manual/last-night-v2.pdf
- **Cartridge catalog**: ardet.systems/cartridges
- **Email support**: support@ardet.systems
- **GitHub** (open source schematic, closed PCB): github.com/chervycola/ardet/synth

---

*Last Night v2.2 — physical resonance, not algorithmic decay.*

> *"All Bones Dust. Be Careful. Fuck Abandoned Sleep is my Last Day and my Last Night."*
