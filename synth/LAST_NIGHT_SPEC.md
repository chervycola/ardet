# LAST NIGHT — Спецификация продукта

> *Постапокалиптический ревербератор. Пустота, эхо, треск радиации, жёваная плёнка и старый граммофон.*

**Версия**: v2.2 (revised после audit + decisions pass)
**Часть серии**: SYSTEM SUICIDE, модуль 9 из 9
**Форм-фактор**: Eurorack 20HP (canonical) / опционально pedal 190×122мм
**Цена retail**: $350 budget / $400 premium

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

Last Night — **аналоговый ревербератор на сменных физических пластинах**. Не DSP, не пружинный bath, не digital convolution. Реальная пластина из дерева, камня, металла, стекла или кости вибрирует от audio signal через surface exciter, два пьезо-датчика снимают резонанс с обратной стороны.

Каждый материал — уникальный голос. Дуб = тёплый перкуссивный slap. Мрамор = cathedral. Spring steel = infinite shimmer. Стекло = crystalline chime. Кость = ритуальный сухой stop.

### Что отличает от других reverb

- **Свопаемые материальные картриджи** — никто другой не делает.
- **Physical solenoid damper** — CV-управляемое механическое приглушение пластины.
- **Dual piezo + position crossfade** — два датчика на разных позициях пластины, плавный кроссфейд между bright и warm character.
- **Resonator reverb category** — это не имитация EMT 140 (классический plate reverb 2×1м), а **новая категория** с материал-зависимым character.

### Категория

**Resonator reverb** — не "plate reverb" в классическом смысле. Малоразмерная пластина (100мм) даёт меньше диффузных мод, но больше character per material. Marketing positioning — **"physical resonance, not algorithmic decay"**.

### Reality check (важно для customer expectations)

Заявляемые в первоначальной концепции RT60 ("oak 1.5–4с") — **завышены в 2–20×**. Реальные значения после acoustic measurement:
- Oak без feedback: 0.1–0.3с (короткий перкуссивный slap).
- Marble: 0.8–2с (room ambience).
- Spring steel: 2–6с (long shimmer).
- С feedback knob — RT60 удлиняется в 5–10× (с риском self-oscillation на high settings).

**Это не bug — это physics**. Маркетинг скорректирован к realistic claims.

### Use cases

- **Synth voice tail** в Eurorack rack — финальный модуль signal chain.
- **Guitar pedal** в pedalboard chain — physical reverb с tactile cartridge swap.
- **DJ FX send/return** — RCA option (premium SKU) для console integration.
- **Ambient sound design** — freeze + high feedback + cartridge selection.
- **Noise / experimental performance** — self-oscillating mode, feedback patches с Last Day.

### What's in the box

**Module package**:
- Last Night module (16HP panel + PCB + electronics).
- 1× wood cartridge (Oak raw, reference).
- Eurorack power cable (10-pin to 16-pin адаптер).
- Mini-XLR cartridge cable (внутри корпуса при покупке).
- Quick start card (1 page).
- Warranty card (1 year).
- Online manual link (PDF).

## Архитектура и signal flow

### High-level signal chain

```
   ┌──────────────────────────────────────────────────────────────┐
   │                                                              │
   │  IN ──► Buffer ──► Pre-emph ──► Driver ──► EXCITER ──┐      │
   │                       (3.2кГц       (class AB)        │      │
   │                       shelf)                           ▼      │
   │                                                  [PHYSICAL    │
   │                                                   PLATE]      │
   │                                                       │       │
   │                                                       ▼       │
   │                                              ┌── PIEZO A     │
   │                                              ├── PIEZO B     │
   │                                                       │       │
   │                                              JFET preamp     │
   │                                              (LSK489A ×23)   │
   │                                                       │       │
   │                                              POSITION xfade  │
   │                                                       │       │
   │                                              De-emph ──► Tone│
   │                                                       │       │
   │                                              LED clipper     │
   │                                                       │       │
   │                                              ENV VCA (LM13700)│
   │                                                       │       │
   │  IN ──► dry path ───────────────────────────► MIX ◄──┘       │
   │                                                       │       │
   │  Noise gen (zener) ──► color filter ────────► MIX     │       │
   │                                                       │       │
   │                                                       ▼       │
   │                                                  OUT (L/R)   │
   │                                                              │
   │  Feedback loop: wet → RV_FEEDBACK → SW_FREEZE → driver       │
   │                       (D_LIM soft clip, SPICE-stable)        │
   │                                                              │
   │  Solenoid damper: CV → R_DAM divider → Q5 → solenoid coil    │
   │                                                              │
   └──────────────────────────────────────────────────────────────┘
```

### Что происходит звуку

1. **Input buffer** — high-Z приём (1МΩ для guitar compatibility).
2. **Pre-emphasis** — shelving boost +8dB выше 3.2кГц компенсирует HF потери в материале (особенно дереве).
3. **Class AB driver** — push-pull BD139/BD140 с biasing diodes (no crossover distortion). 4.7Ω current limit, 3Вт peak на exciter.
4. **EXCITER** — Dayton DAEX25FHE-4 (light cartridges) или DAEX32Q-4 (dense) на face A пластины.
5. **Physical plate** — материал резонирует в bending modes, energy distributes across plate surface.
6. **Dual piezo pickup** — Piezo A (ближний к exciter, bright) и Piezo B (дальний, warm) на face B.
7. **JFET preamp** — LSK489A dual matched JFET в SOT-23-6 (заменяет EOL 2N5457). Gain ×23, mini-XLR shielded cables.
8. **Position crossfade** — RV_POSITION dual-gang pot микширует A↔B (тембральный control, не stereo).
9. **De-emphasis** — зеркало pre-emphasis, восстанавливает spectrum после material colour.
10. **Tone filter** — 1-pole LPF, RV_CUTOFF 158Гц–15.9кГц range.
11. **LED clipper** — 3× LED back-to-back (clipping порог ±5.4В = +10.6 dBu, защита downstream).
12. **Envelope follower VCA** — LM13700 OTA. C_ENV 220нФ, RV_ATTACK 220кΩ (1–48мс), RV_DECAY 1МΩ (10мс–1с). Wet signal follows input dynamics.
13. **Mix output** — суммирует dry + wet + noise + CV. Stereo через mini-XLR normalling: A→L, B→R или mono A+B.
14. **Feedback loop** — extends decay artificially, до self-oscillation на max. SPICE-verified stability.
15. **Solenoid damper** — CV-controlled mechanical mute пластины через felt-tipped solenoid 2мм spring-loaded gap.

Дополнительно:
- **Noise generator** — BZX55C9V1 zener (заменяет EOL BC547), color filter, RV_NOISE level → mix.
- **Sidechain input** — external trigger для excitation независимо от main signal.

### Важные параметры

| Параметр | Значение |
|----------|----------|
| **Frequency response** (без material) | 18Гц – 18кГц (-3dB) |
| **Noise floor** (input shorted, budget SKU) | -85 dBV |
| **Noise floor** (premium SKU, 4-layer PCB, mini-XLR) | -95 dBV |
| **THD** (100мВ input, mid drive) | <0.5% |
| **Maximum input** | +20 dBu (line level), +15 dBu typical |
| **Maximum output** | +12 dBu |
| **Power draw** | ±12В, 200мА steady, 450мА peak (с solenoid pulse) |
| **Feedback loop stability** | Verified SPICE для всех cartridges Q ≤ 1000 |
| **Exciter peak power** | 3Вт (sustained), 8Вт (peak transient) |

## Контролы и интерфейс

### Раскладка панели (20HP × 128.5мм)

```
┌──────────────────────────────────────────────┐
│           LAST  NIGHT                        │
│      system suicide / reverberator           │
├──────────────────────────────────────────────┤
│                                              │
│  ◉ DRIVE          ◉ FEEDBACK    ◉ MIX        │
│   (large)          (large)       (large)     │
│                                              │
│  ◉ ATTACK   ◉ DECAY   ◉ POSITION  ◉ TONE    │
│                                              │
│  ◉ BOOST    ◉ NOISE   ◉ COLOR                │
│                                              │
│  ┌──────────────────────────────────┐        │
│  │     [CARTRIDGE SLOT]              │       │
│  │   horizontal magnetic dock        │       │
│  │   90×40мм window                  │       │
│  └──────────────────────────────────┘        │
│                                              │
│  ▢ FREEZE switch    ◉ Damp LED              │
│  ▢ Clip LED L       ▢ Clip LED R            │
│                                              │
├──────────────────────────────────────────────┤
│  ⊙ IN    ⊙ SIDE    ⊙ CV MIX                  │
│  ⊙ CV DECAY    ⊙ CV DAMP                     │
│  ⊙ OUT L    ⊙ OUT R                          │
└──────────────────────────────────────────────┘
```

### Полная таблица контролов

| Контрол | Тип | Функция | Range | CV input |
|---------|-----|---------|-------|----------|
| **DRIVE** | Pot 100кΩ log | Уровень сигнала на exciter, определяет глубину сатурации | 0 → +47× (с overdriving) | — |
| **FEEDBACK** | Pot 100кΩ log | Уровень рециркуляции в loop. На max → self-oscillation | 0 → ~unity (clipped) | — |
| **MIX** | Pot 100кΩ log | Баланс dry/wet | 0 (dry only) → ∞ (wet only) | ✓ via J_CV_MIX |
| **ATTACK** | Pot 220кΩ log | Envelope follower attack time | 1мс → 48мс | — |
| **DECAY** | Pot 1МΩ log | Envelope follower decay time | 10мс → 1с | ✓ via J_CV_DECAY |
| **POSITION** | Pot 100кΩ dual-gang lin | Кроссфейд piezo A/B (тембральный, не stereo) | A only → equal mix → B only | — |
| **TONE** | Pot 100кΩ lin | LPF cutoff на output | 158Гц → 15.9кГц | — |
| **BOOST** | Pot 50кΩ lin | Pre-emphasis amount | 0 (flat) → +8dB shelf @3.2кГц | — |
| **NOISE** | Pot 100кΩ log | Уровень noise generator подмес | 0 → unity | — |
| **COLOR** | Pot 100кΩ lin | LPF на noise (white → brown) | 18кГц → 200Гц | — |
| **FREEZE** | SPDT switch | Loop locks, бесконечный sustain | Normal / Freeze | ✓ external trigger CV via J_CV_DAMP* |
| **DAMP LED** | Indicator | Solenoid activity (CV input) | — | — |
| **CLIP LED L/R** | Indicator | LED clipper visual (output overload) | — | — |

*FREEZE имеет ручной toggle + opcionalно CV trigger через resistor adapter.

### Jacks (3.5мм Thonkiconn для Eurorack)

| Jack | Тип | Функция |
|------|-----|---------|
| **J_IN** | Audio in | Mono input, line level / Hi-Z (1МΩ) |
| **J_SIDE** | Audio in | Sidechain — внешний trigger для excitation |
| **J_CV_MIX** | CV in | Modulate dry/wet mix (-5 to +5В) |
| **J_CV_DECAY** | CV in | Modulate envelope decay time |
| **J_CV_DAMP** | CV in | Trigger solenoid damper (0В = open, 5В = damped) |
| **J_OUT_L** | Audio out | Mono main или stereo L (зависит от J_OUT_R состояния) |
| **J_OUT_R** | Audio out | Stereo R (если plugged) или idle |

### Cartridge connector (внутри slot, не jack)

| Connector | Покрытие | Функция |
|-----------|----------|---------|
| **TA3M (mini-XLR) ×2** | Shielded coax 50мм | Piezo A, Piezo B (low-noise audio) |
| **JST-XH 2-pin ×2** | Twisted pair | Exciter drive, Solenoid coil |

### Pedal version differences (если выбран pedal SKU)

- 6.3мм TRS jacks вместо 3.5мм Thonkiconn для main I/O.
- 3.5мм mini-jack для CV inputs (preserved).
- Stomp footswitches вместо toggle: BYPASS, FREEZE, TAP.
- 12В DC input (TRACO TMA1212D или TMA1215D internal DC-DC).
- Cartridge slot — bayonet mount instead of magnetic.
- Power LED instead of clip LEDs (different visual layout).

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
| **Power supply** | ±12В Eurorack bus (или TRACO TMA1212D / TMA1215D в pedal) |
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
| **Form factor** | Eurorack 3U × 20HP (101.6мм × 128.5мм panel) |
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
- **HP**: 20HP — fits в большинстве setups (84HP, 104HP, 168HP racks).
- **Depth clearance**: 65мм total — fits в стандартные case (Tiptop Mantis 60мм может не fit; Doepfer А-100 шкафы — yes).

### Pedal совместимость (если выбран pedal SKU)

- **Power**: 12В DC center-negative, 2.1мм barrel jack. **NOT compatible с 9В стандарт pedalboard supply** — требуется 12В.
- **Bypass**: relay-bypassed (не buffered) — нет signal coloration when off.
- **TRS jacks**: I/O standard 6.3мм, CV inputs 3.5мм mini-jack.
- **Footswitch**: BYPASS (latching), FREEZE (latching), TAP (momentary).

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
