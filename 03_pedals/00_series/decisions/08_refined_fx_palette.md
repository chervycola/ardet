# Decision 08 — Refined FX palettes: возвращение к корням + комбайн-архитектура

**Дата**: 2026-05
**Статус**: locked (рефайнинг Decision 06 и 07; combine-архитектура сохраняется, FX-палитры сокращаются)
**Тип**: пересмотр объёма named-эффектов в обоих anchor-модулях

---

## Контекст

Decision 06 ввёл hot palette Last Day (HAZE / MIRAGE / BLEACH / TAR / CICADA / HEATWAVE) + 4 perform-жеста. Decision 07 ввёл симметричный cold palette Last Night (PULSE / FOG / FROST / CHILL / GEIGER / HUM / STALL / TOLL) + KILL/FREEZE. Получился **жёстко симметричный диптих с 8+8 named-эффектами**.

Пользовательский feedback (2026-05): это **избыточно**. Каждый из двух модулей должен:
- **Возвращаться к корням** изначальной задумки (Last Night = postapoc-reverb с noise/Geiger; Last Day = vinyl-delay с сатурацией и тлеющей характеристикой).
- **Сохранять combine-архитектуру** из D06/D07 (40HP+pedal share PCB, stereo I/O, 4 footswitches, solenoid double-function, LED baseline + solar modulation, dual capacitive read electrodes, tongue в сигнальном пути).
- **Не зеркалить друг друга point-by-point**, а **дополнять как две разные атмосферы**.

Это решение — рефайнинг палитр под эту установку.

## Принципиальное переосмысление: «диптих двух атмосфер», не «зеркало»

В D06/D07 диптих был построен как **симметричное зеркало**: каждый эффект Last Day имел парный антипод в Last Night по тому же физическому/тембральному месту. Это было концептуально красиво, но **сужало индивидуальность каждого модуля** под требование симметрии.

Новая рамка: два модуля = **две разные постапокалиптические атмосферы**, у которых **частично пересекаются** некоторые перформативные жесты (KILL, FREEZE) и общий cartridge-стандарт, но **named-эффекты у каждого свои собственные**, не обязательно парные.

- **Last Night** = плита, резонанс твёрдого тела, остывание, радиация, шум разрушенной инфраструктуры. **Атмосфера ночного руина**.
- **Last Day** = жидкий delay, солнечный сатуратор, тлеющий vinyl, цикады, вязкость. **Атмосфера выжженного полудня**.

Где они пересекаются: оба = standalone-комбайн, оба = 40HP+pedal share PCB, оба = stereo committed, оба = 4 footswitches, оба используют сменные cartridges. Где они **разные**: палитра тембральных эффектов отражает разную «погоду» — нет принуждения парности.

## Что меняется в Last Day (рефайнинг D06)

### FX-палитра сокращена

| Эффект | Был в D06 | В D08 |
|---|---|---|
| **HAZE** | Named FX (periodic motor wow) | **Demoted to delay-section knob** — depth wow/flutter на oil-can motor. Не отдельный named FX, часть delay-character |
| **MIRAGE** | Named FX (стохастический pitch drift) | **Removed** — концепт частично абсорбируется в EMBER (worn-vinyl pitch wobble) |
| **BLEACH** | Named FX (high-band sat, solar-mod) | **Removed** — high-band характер абсорбируется в solar amp section (BRIGHT-режим starva-каскада: больше DRIVE при достаточной освещённости → верха насыщаются ярче) |
| **TAR** | Named FX (вязкая динамика) | **Сохраняется** — вязкость это core-вкус «жары» |
| **CICADA** | Named FX (кластерный треск, насекомые ↔ песок) | **Сохраняется** — фирменный сухой текстурный треск |
| **EMBER** | — | **NEW** — «старые тлеющие пластинки»: surface crackle floor + sparse pops + worn-groove pitch wobble. Захватывает все три аспекта изношенного vinyl в одной ручке |
| **HEATWAVE** | Named FX (AM tuner, ионосфера) | **Removed** — выходит из scope v1. Оставлен как **долгосрочный experimental add-on** (возможно отдельный сателлит-модуль в будущем) |
| **DRAG** | Perform / motor brake | **Сохраняется** |
| **CRASH** | Perform / solenoid impact в масло | **Сохраняется** |
| **KILL / FREEZE** | Perform | **Сохраняется** |

### Итоговый Last Day character набор (v1)

**Core subsystems** (как и в D06):
- Oil can delay (BLDC motor + диск + 2 capacitive read-электрода для stereo taps).
- Solar amp (LED baseline + solar modulation overlay).
- Resonant EQ (3-полосный, tongue-резонатор всегда в сигнальном пути).

**Named character FX** (3, не 6):
- **TAR** — вязкая компрессия с залипанием, HEAT-linked.
- **CICADA** — кластерный сухой треск (насекомые ↔ песок).
- **EMBER** — тлеющий vinyl (crackle floor + pops + worn-groove wobble).

**Knobs внутри подсистем** (не отдельные named FX, но управляемые):
- HAZE — wow depth на motor (внутри delay-секции).
- BRIGHT — high-band sat character в solar amp (вместо named BLEACH).

**Perform** (4 footswitches): KILL / FREEZE / CRASH / DRAG.

### EMBER — детализация

«Старые тлеющие пластинки» — это не один звук, а три связанных характеристики изношенного vinyl, обычно слышимых вместе:

1. **Surface crackle floor** — постоянный gentle "фзз" фон, спектрально розовый-коричневый, signal-correlated (немного громче в паузах, тише в loud passages — vinyl noise floor работает наоборот, чем шум полупроводников).
2. **Sparse louder pops** — apериодические транзиентные клики гораздо громче crackle floor, по 1 раз в 2–10 секунд. Эмоция «пыль на игле».
3. **Worn-groove pitch wobble** — медленный стохастический pitch drift ±5 центов, период 1–5с. То, что было MIRAGE в D06, теперь живёт здесь в другой метафоре.

**Реализация**:
- Noise source (zener или transistor) → 2-band shaper (LF для crackle, HF для pops via comparator) → mix.
- S&H stochastic generator (отдельный от CICADA, чтобы тембры не сливались) → slew → motor CV (additive с HAZE knob).
- Inverse-envelope follower: signal RMS → invert → modulate crackle level (тише когда signal громкий, реалистично для vinyl).
- Single EMBER knob управляет depth всех трёх компонент пропорционально.

**BOM**: ~6 components (one noise transistor, two filter caps, comparator, S&H 4066, slew RC) ≈ $1.

### EMBER ↔ CICADA — различие

| | CICADA | EMBER |
|---|---|---|
| Текстура | Кластерный треск (5–30 кликов burst) | Crackle floor (continuous) + sparse pops |
| Триггер | Signal envelope correlated (burst при amplitude peaks) | Inverse signal correlated (фон тише при громком signal) |
| Метафора | Цикады в траве / тёплый пустынный песок | Изношенный vinyl на патефоне |
| Pitch | Без pitch-эффекта | Сопровождается worn-groove wobble |

Оба эффекта **сосуществуют** в Last Day без конкуренции — разные текстуры, разные триггеры, разные метафоры жары.

## Что меняется в Last Night (рефайнинг D07)

### FX-палитра сокращена

| Эффект | Был в D07 | В D08 |
|---|---|---|
| **PULSE** | Named FX (periodic damper LFO) | **Removed** — periodic damper modulation остаётся возможной через external CV DAMP, не как named FX |
| **FOG** | Named FX (apериод. damper drift) | **Removed** — аналогично, через CV |
| **FROST** | Named FX (high-band absorber) | **Removed** — high-band roll-off остаётся через TONE knob (existing v2.1) |
| **CHILL** | Named FX (expander, brittle) | **Removed** — динамическая обработка остаётся через ATTACK/DECAY envelope follower (existing v2.1) |
| **GEIGER** | Named FX (sparse tick noise) | **Сохраняется** — но как **половина bipolar NOISE/GEIGER knob** (см. ниже) |
| **HUM** | Named FX (mains-hum antenna) | **Removed из v1** — оставлен как долгосрочный experimental add-on. WIRE-концепт из D06 остаётся «в архиве», но не реализуется в combine v1 |
| **NOISE** | — | **NEW** — bipolar parametrically opposite GEIGER. Континуальный шум разной окраски (white / pink / brown) |
| **PHASER** | — | **NEW (optional)** — простой 4-stage analog OTA phaser, accent immersion. Optional в смысле «v1.5 add-on или premium SKU», базовый v1 может ship без него |
| **STALL** | Perform | **Сохраняется** |
| **TOLL** | Perform | **Сохраняется** |
| **KILL / FREEZE** | Perform | **Сохраняется** |

### Bipolar NOISE/GEIGER knob — центральный character control

Одна ручка, **центр = OFF**, **против часовой → NOISE**, **по часовой → GEIGER**. Это переинтерпретирует существующий BZX55C9V1 zener noise generator из v2.1 schematic как **двунаправленный character control**:

- **CCW (NOISE)** — continuous wash шума. Глубина пропорциональна повороту. NOISE COLOR sub-knob (если место позволит на панели — 3-position switch white/pink/brown).
- **Center (OFF)** — no noise activity. Чистый reverb.
- **CW (GEIGER)** — sparse discrete ticks. Density пропорциональна повороту. ATtiny85 LFSR cluster pattern (как было в D07 GEIGER реализации).

**Имплементация**: один zener источник → две параллельные обработки (continuous filter для NOISE, comparator + cluster shaper для GEIGER) → cross-fade VCA пара, контролируемая bipolar knob position. CCW position → NOISE VCA open, GEIGER VCA closed; CW наоборот.

**Зачем это переинтерпретировать как bipolar**: семантически это **один post-apocalyptic шумовой материал**, проявляющийся либо как **wash** (тонущее пространство, дождь радиации), либо как **discrete clicks** (счётчик Гейгера). Два режима одного материала. Bipolar knob физически выражает эту дуальность.

### PHASER — optional immersion accent

4-stage analog OTA phaser (стандартная топология, как MXR Phase 90 / Mu-Tron Bi-Phase). Position **after** reverb wet path (не на input), создаёт «погружение» хвоста в движущуюся среду.

**Контролы**:
- **PHASER** depth knob (0 = bypass).
- **RATE** — LFO speed (0.05–5Hz).
- **DEPTH** — sweep range.
- (опционально) sync to CLOCK IN.

**Зачем именно phaser, а не chorus/flanger**: phaser даёт **разрежающее** ощущение пространства, не плотность. Chorus добавляет плотность (тёплость, что неправильно для холодного характера Night). Flanger даёт jet-эффект (агрессивный, тоже не Night). **Phaser = swirling cold air**, точное попадание.

**Status**: optional в v1 (если PCB layout позволяет — добавить; если впритык — перенести в v1.5 / premium SKU). Не блокирует ship Phase 1 reverb-ядра.

### Итоговый Last Night character набор (v1)

**Core subsystems** (без изменений, как и в v2.1 schematic):
- Plate-resonator reverb (exciter + сменная пластина + dual piezo + position crossfade).
- Solenoid с двойной функцией (DAMP + STRIKE).

**Named character FX** (1 + optional):
- **NOISE/GEIGER bipolar knob** (один character control, два режима, OFF center).
- **PHASER** (optional immersion).

**Perform** (4 footswitches): KILL / FREEZE / TOLL / STALL.

## Reframed zerkalnost — «two atmospheres»

Старая рамка (D06/D07) — point-by-point зеркало 8 эффектов. Новая рамка — **две разные погоды постапокалипсиса**, у которых есть **общие архитектурные принципы**, но **разные тембральные палитры**.

### Общее (architectural)

- 40HP Eurorack + big-box pedal на одной PCB, share BOM.
- Stereo committed (TRS + RCA + mini-jack).
- 4 footswitches в pedal-форме (perform-словарь).
- Один сменный physical cartridge (plate / oil+tongue).
- KILL и FREEZE одинаковы по семантике в обоих модулях.
- FB Send/Return позволяет замкнуть Day↔Night.
- Solenoid double-function в Night (DAMP+STRIKE), solenoid в Day одиночной функции (CRASH-impact).

### Разное (атмосферное)

| | Last Night (cold ruins) | Last Day (hot wastes) |
|---|---|---|
| **Базовое пространство** | Plate reverb на резонансе твёрдого тела | Oil-can delay на жидкости + диске |
| **Сатурация** | LED clipper (low headroom dark) | Solar amp starve (light-modulated) |
| **Тембральная вариация** | Cartridge material (oak/marble/brass/steel/bone/glass) | Cartridge oil (минеральное/силиконовое/касторовое/глицерин) + tongue plate (steel/brass/bronze) |
| **Шум-character** | NOISE/GEIGER bipolar (wash ↔ tick) | TAR (вязкая динамика) + CICADA (кластерный треск) + EMBER (тлеющий vinyl) |
| **Immersion-accent** | PHASER optional (swirling cold air) | HAZE (motor wow) + BRIGHT (solar high-band sat) внутри подсистем |
| **Perform momentary** | TOLL (strike), STALL (damper hold) | CRASH (impact), DRAG (motor brake) |
| **Perform shared** | KILL, FREEZE | KILL, FREEZE |
| **Метафоры character** | Радиация, мёртвая электросеть, пустота, остывание | Жара, песок, тление vinyl, плавление |

Заметно: каждый модуль имеет **свой объём** named-эффектов (Night = 1+1 optional, Day = 3). Это **нормально** — у них разные атмосферы, разная плотность характера. Симметрия — не цель.

## Что становится недействительным

- **Decision 06 палитра эффектов** — секция D «Эффекты раскалённого полудня» с MIRAGE / BLEACH / HEATWAVE — superseded D08. Combine-архитектура (форм-фактор, stereo, perform, solar+LED baseline, dual pickup, tongue в пути) — **остаётся актуальной**.
- **Decision 07 палитра эффектов** — cold palette PULSE/FOG/FROST/CHILL/HUM — superseded D08. Combine-архитектура (40HP+pedal, stereo, perform, solenoid double-function, формат) — **остаётся актуальной**. GEIGER переинтерпретирован как половина bipolar NOISE/GEIGER knob.
- **`SYSTEM_SUICIDE.md` §7 и §9** — секции D (Hot/Cold palette) и F (контролы) обновляются. Общая combine-структура остаётся.
- **`SYSTEM_SUICIDE.md` §7 G-таблица «зеркальность»** — переписывается как «two atmospheres», не зеркало.

D06 и D07 получают **CONTEXT NOTE** в шапке: combine-архитектура locked, FX-палитра refined в D08.

## Открытые вопросы для следующих итераций

1. **NOISE COLOR контрол** — 3-position switch на лицевой панели Last Night или sub-knob? Зависит от panel real estate.
2. **PHASER position** — после reverb wet или в feedback loop? Wet-only = только хвост в swirl, в feedback = self-modulating decay. Концептуально интереснее в feedback, но менее controllable.
3. **EMBER vs CICADA источники шума** — отдельные транзисторы (избегаем correlation между двумя эффектами) или один транзистор с двумя ветвями? Тонкое решение для prototype.
4. **HEATWAVE и HUM в долгосрочном scope** — выйдут ли в Phase 2/3 как сателлиты-модули («AM Radio» и «Mains Hum» как отдельные 8HP utility-модули)? Концепт сохраняется в архиве, не теряется.
5. **BRIGHT-режим solar amp** — отдельная ручка или существующий DRIVE покрывает достаточно? Возможно DRIVE + DRIVE COLOR mini-toggle (warm/bright).
6. **Cartridge стандарт apдейт** — теперь у Last Day два сменных слота (oil + tongue), у Last Night — один (plate). Унификация формата (mini-XLR + JST connectors) сохраняется, но physical mounting может различаться. Decision 03 нуждается в апдейте.

## Принципы, которые держим при разработке

- **Два модуля = две атмосферы, не зеркало**. Симметрия может быть architectural (форм-фактор, perform-pattern) или metaphorical (день/ночь), но **не обязательна на уровне точечных эффектов**.
- **Возвращение к корням важнее красивой симметрии**. Изначальная задумка Last Night = плита + noise/Geiger. Last Day = vinyl-delay + sat + tongue. Эти DNA сохраняются.
- **Каждый эффект должен зарабатывать своё место** — knob/footswitch на лицевой панели. Если эффект не имеет distinct character + distinct gesture для пользователя — он демотируется в sub-knob внутри подсистемы (как HAZE → wow-knob, BLEACH → BRIGHT inside solar).
- **Сохранять concept-архив**: HEATWAVE, HUM, MIRAGE, FROST etc. — остаются в документации как **possible future modules / sub-features**, не выбрасываются полностью.
- **Combine-архитектура (D06+D07) — locked**. Refinement D08 — только tembral palette, не architecture.
