# Last Day — акустика

Реалистичность физических утверждений в трёх подсистемах: гидрофон в 60мл масла, Q управление clamp pressure, oil can servicing, heat влияние.

---

## A. Гидрофон в 60мл масла — SNR бюджет

### Сигнал

- Пьезо emitter ~27мм × 100мВ → акустический output в масле ~1–5 Pa SPL на 1см (оценочно).
- Масло в ванне 60мм × 15мм × 5–10мм глубины = ~60мл.
- Акустическая дистанция emitter → hydrophone = 50мм.
- Масло attenuates HF сильно (viscous loss): −3dB/см на 10кГц, −10dB/см на 20кГц.
- 50мм = 5см → attenuation на 10кГц = -15dB. На 1кГц — negligible.

### Гидрофон output

- Piezo hydrophone 20мм sensitivity ~100 мкВ/Pa.
- Signal at hydrophone: ~0.5 Pa × 100 мкВ = **50 мкВ RMS**. Peak ~150 мкВ.

### Шум floor

- TL072 input voltage noise: 18 нВ/√Гц × √20кГц = **2.5 мкВ RMS**.
- Source resistance piezo ~1МΩ → Johnson noise ~18 нВ/√Гц → 2.5 мкВ RMS.
- Suммарный шум: ~5 мкВ RMS.

### SNR

**SNR = 50 / 5 = 10** = **20dB**. Это плохо — usable, но шумно. Noise floor слышен заметно.

**Для улучшения**:
- Заменить TL072 на **OPA1642** (1 нВ/√Гц) → noise ~1 мкВ → SNR 30 → 30dB. Уже приемлемо.
- Увеличить gain emitter до 500мВ — поднимает signal в 5× → SNR 50 → 34dB.
- Уменьшить AMP bandwidth до 10кГц через LPF → noise ×0.7 → slight improvement.

**Вердикт**: гидрофонный tract работает, но **требует low-noise preamp** (OPA1642 или подобный), не TL072. Это **BOM upgrade** в masse hydrophone path.

---

## B. Масляная задержка — реальная timing

**Физика**:
- Скорость звука в минеральном масле: ~1440 м/с при 25°C.
- Путь в ванне 50мм → задержка ~35 мкс.
- 35 мкс = это ~15° фазы на 1кГц, ~30° на 2кГц.

**Это не delay** в музыкальном смысле. Это **filter** — задержка слишком короткая для воспроизведения "эха". Называть это "ghost delay" — честнее.

**Влияние на тембр**:
- Масло attenuates HF → LPF effect.
- Резонансы в ванне (стенки, форма) добавляют комб-фильтр notches.
- Температура масла (HEAT) → скорость звука меняется ±5% за 30°C → фазовый drift.

**Рекомендация**: перепозиционировать "oil path" как **filter/saturation**, не delay. Main delay — магнитный tract. Oil — colour.

---

## C. Температура масла vs. вязкость

**Заявлено**: "холодное масло = густые, тёмные, медленные повторы. Горячее = быстрые, яркие, подвижные".

**Физика**:
- Вязкость меняется 5× на 25→60°C (для минерального масла).
- Но **скорость звука** в масле меняется **только** ~5% на 25°C (мала температурная зависимость скорости в жидкостях).
- Вязкость влияет на **demp** акустических волн — horизонтальный резонатор ванны более demped при высокой viscosity.

**Вердикт**: HEAT эффект **реальный** (влияет на damping), но **не "медленные повторы"**. Описание ошибочно — повторы не замедляются. Звук становится более closed/muffled при холоде, более open при тепле. Это нюанс.

**Маркетинг-корректировка**: "cold = dark and closed, warm = open and lively".

---

## D. Magnetic disk — head-to-tape gap и response

**Физика**:
- Reading head считывает магнитное поле domain на диске. Gap head ~10 мкм typical.
- Disk linear velocity ~0.5 м/с при 10 RPS (типично) → bit rate ~500 bits/мм = 500 кГц capacity (overkill для audio).
- **Head-to-disk gap** определяет HF response. 10 мкм gap → -3dB на ~40 кГц. OK для audio.

**Проблема**: disk не должен **касаться head** (износ) и не должен быть **слишком далеко** (сигнал падает). Typical gap 20–50 мкм, maintained через spring-loaded head assembly.

**Рекомендация**: head mount с spring-loaded pre-tension. Mechanical design детально (out of scope аудита).

### Wow & flutter реально

- Wow (slow speed variation): motor brush commutation, disk imbalance. Typical 0.2–1% без PLL-lock. Musical wow.
- Flutter (fast variation): bearing noise, belt slippage. Typical 0.05–0.2%. Adds texture.

Заявлено как "character" (HAZE) — достижимо натурально, не требует дополнительной модуляции. PLL-lock уберёт natural wow/flutter — возможно, не хотим его убирать полностью.

---

## E. Mid резонатор — clamp pressure vs. Q

### Физика

Кантилевер с защемлённым концом имеет Q, которое зависит от:
1. **Internal loss** материала (loss tangent η).
2. **Clamp rigidity**: при increasing clamp pressure, вибрация не передаётся в раму → Q растёт.
3. **Load от пьезо** (excitation/pickup): добавляет demp.

**Clamp pressure → Q**: эмпирически, pressure 1→100N даёт Q range 20→200 (10× range). Это **большой dynamic range** for control knob.

### Проблема repeatability

- Механический винт clamp не имеет pressure feedback. 5 кряк поворота = ~5 Н pressure, но зависит от coefficient friction (меняется со временем при износе).
- **Preset recall невозможен** без encoder или force sensor.

**Рекомендация**:
- v1 — manual clamp, label positions qualitatively ("low / mid / high Q").
- v2 — motorized clamp + force sensor (FSR или load cell) → digital Q control.

### Frequency stability

- Длина пластинки → frequency. Clamp position — encoder readable. Repeatable.
- Temperature expansion: метал ~10⁻⁵ /°C → negligible для audio.
- Материал пластинки standardized — каждая пластина pre-calibrated.

**Вердикт**: resonant mid EQ **physically feasible**, но repeatability ограничена механикой. Для professional use — нужен motorized + encoder version.

---

## F. Oil can serviceability

### Что может сломаться

- **Motor**: MTBF ~5000 ч для cheap DC motor. Замена — разборка модуля, пайка.
- **Heads**: износ после ~2000 ч continuous use. Замена — access к head-блоку.
- **Disk magnetic coating**: scratches от ежедневной работы. Замена диска — полная разборка.
- **Oil** (сменная ванна): пользователь менits sам.
- **Bearings**: износ 500–5000 ч в зависимости от качества.

### Servicing strategy

**Option 1 — user-serviceable** (модульно):
- Motor + disk assembly removable (как tape head на cassette recorder).
- Oil cartridge swappable.
- Heads accessible via panel screws.
- **Требует**: specification document, replacement parts catalog, 5-step YouTube tutorial.

**Option 2 — factory-only**:
- Модуль приходит sealed.
- Unit failure → send back to maker.
- **Проще по production**, но бренд-риск (unit dying in the middle of a gig).

**Рекомендация**: **Option 1 (user-serviceable)**. Boutique synth audience expects this. Unit which you can repair = investment, not disposable gadget.

---

## G. Summary — acoustic verdicts

1. **Hydrophone SNR 20dB** — requires low-noise preamp, не TL072.
2. **Oil path = filter**, не delay. Переименовать.
3. **HEAT = damping control**, не speed. Корректировать маркетинг.
4. **Wow/flutter** natural без PLL — possible feature, not bug.
5. **Mid clamp repeatability** ограничена — motorized version for pro use.
6. **Sericiceability** — должна быть user-serviceable для boutique market.

## Priority acoustic action items

1. Заменить TL072 на OPA1642 в гидрофонном tract.
2. Переименовать "oil delay" в "oil filter" для честности.
3. Прототип mid-резонатора с manual clamp, измерить Q range.
4. Документировать serviceability procedure.
5. Спецификация approved oils (safety + consistency).
