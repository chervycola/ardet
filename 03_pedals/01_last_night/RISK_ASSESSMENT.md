# LAST NIGHT — Risk Assessment & Bench-Prototype Protocol

**Версия**: v6.5
**Назначение**: честный инженерный risk-register перед production + минимальный bench-протокол для проверки фундамента ДО любого PCB/tooling.
**Аудитория**: R&D engineer, decision-maker. Читать вместе с `HANDOFF_BRIEF.md`.

> **Главный месседж**: документация отличная, но проект несёт **3 недоказанных физических риска**, которые бумага не закрывает. Прежде чем тратиться на PCB-fab, panel-CNC, component-bulk — собрать **grubый bench-прототип ядра** (Stage 0 ниже). $50-80 и выходные. Если Stage 0 не проходит — концепцию чинить здесь, а не после $3000 партии.

---

## 1. Honest verdict (TL;DR)

| | |
|--|--|
| **Концепция** | оригинальна, defensible, новая категория (material resonator) |
| **Документация** | production-grade, полный след |
| **Фундамент** | **НЕ доказан на столе** — 3 физических риска открыты |
| **Scope** | слишком большой для первого выпуска (v3 амбиции как v1) |
| **Рекомендация** | bench-prove ядро → радикально урезать v1 → наращивать |

---

## 2. Сильные стороны (реальные)

1. **Категория уникальна** — material resonator, прямых конкурентов нет. Honest naming выставляет правильные expectations.
2. **Plate-only архитектура (Decision 11)** экономически верна — дешёвый картридж, razor-blade, транздьюсеры амортизированы в модуле.
3. **Acoustic modeling по-взрослому** — modal density physics, two-family classification, реалистичный RT60. Редкость для boutique.
4. **EOL/sourcing realism** — LSK489A вместо мёртвого 2N5457, counterfeit-awareness, buffer stock, authorized/AE split. Spot-check поймал TRACO single→dual part bug.
5. **Power architecture корректна** — solenoid на +12V_RAW, isolated DC-DC.
6. **Документация** — handoff/signal-flow/PCB/calibration/sourcing полные.

---

## 3. Слабые стороны / риски (ранжировано)

### 🔴 R1 — Contact coupling exciter→пластина НЕ доказан (риск #1)
Весь инструмент висит на spring-contact между module exciter и пассивной пластиной. Реальные exciter'ы **bond'ят** (приклеивают/прикручивают) для передачи силы. Контактный прижим:
- теряет energy transfer (puck отскакивает),
- rattle/buzz на high drive,
- coupling зависит от давления/insertion → inconsistent,
- может звучать **слабо и глухо**.

Plate-only (дёшево) конфликтует с good coupling (нужен bond). **Не решается документацией — только bench.** Может не заработать.
→ **Gate: Stage 0 ниже.**

#### R1 — Fallback ladder (план Б если Stage 0 fail)

Зависит от failure-mode:

| Симптом | Корень |
|---------|--------|
| Уровень слабый, но чисто | недостаточный/неравномерный contact transfer |
| Rattle/buzz на drive | контакт отрывается на пиках |
| Глухо/безжизненно | потеря energy transfer на интерфейсе |
| Inconsistent unit-to-unit | force varies при вставке |

**Ladder фиксов (cheapest-first, сохраняем passive cartridge):**

1. **Ступень 1 — Force + геометрия + gain** (почти бесплатно, пробовать первым):
   - Spring force 5N → 10-15N (жёстче пружина)
   - Flat-lap puck face + плоская пластина → max contact area
   - +6-10dB gain в preamp если уровень слабый но чисто
   - Tradeoff: слишком большой force демпфирует тонкие пластины
   - Чинит: «слабый уровень», частично «rattle»

2. **Ступень 2 — Driver-bridge two-layer** ⭐ лучший структурный фикс:
   - Exciter **bonded к жёсткой driver-bridge** (alu/brass), которая постоянно в модуле
   - Cartridge plate прижимается к bridge **большой плоскостью face-to-face** ~5-10N
   - Exciter coupling = solid bond; cartridge interface = large-area face contact (намного лучше puck-point)
   - Cartridge остаётся пассивным + дёшевым
   - Con: bridge добавляет свои резонансы (должна быть жёсткой + задемпфированной)
   - Это как работают коммерческие tactile transducer мосты. **Top-pick если ступень 1 не хватило.**

3. **Ступень 3 — Coupling pad** на интерфейсе:
   - Тонкий high-durometer silicone / acoustic gel между bridge и пластиной
   - Улучшает контактную площадь и transfer
   - Дёшево, заменяемо. Полу-фикс.

4. **Ступень 4 — Screw-down cartridge** (вместо magnetic drop-in):
   - Картридж фиксируется четверть-оборотом/винтом, прикладывая высокий repeatable force
   - Pro: высокий стабильный force → хорошее coupling
   - Con: медленнее swap, механический износ

5. **Ступень 5 — Exciter в картридже (hybrid)** — гарантия ценой экономики:
   - Перенести **только exciter** в картридж (bonded), пьезо остаётся contact в модуле
   - Cartridge cost +$14-20 (exciter + JST connector) → razor-blade частично теряется
   - **Last resort** если ступени 1-4 не дали

6. **Ниша — Magnetic drive** (steel-only линейка):
   - Электромагнит драйвит ферромагнитную пластину без контакта
   - Хорошо только для steel; non-ferrous нужен bonded магнит
   - Отдельная "steel resonator" линейка

**Рекомендация**: на Stage 0 сразу заложить тест **и puck-contact, и driver-bridge** (ступени 1 + 2) — за один заход узнаешь, нужна ли ступень 2. Большинство «contact fail» решаются ступенями 1-2 при сохранении пассивного картриджа. Ступень 5 — гарантированный откат, но жертвует razor-blade.

> ⚠ **Ladder качает EXCITER force. Пьезо-pin preload (~1.5N) — отдельный параметр** и главное слабое звено под TOLL-ударом (см. R13). Force-ступени exciter не поднимают прижим пьезо. Пин надо усиливать независимо + крепить к жёсткому шасси, не к податливой рамке.

### 🔴 R2 — Material differentiation НЕ доказана
Вся идентичность — материалы звучат различно (target >80% blind A/B). Если oak и nephrite через один module engine + одинаковый processing звучат похоже → концепция провалена. Пока не проверено.
→ **Gate: Stage 0.**

### 🟡 R3 — Sparse modes могут не звучать как "reverb"
Acoustic modeling честно: 5-56 мод vs EMT 13000. Это резонатор/колокол. Mitigated naming-ом ("material resonator", не reverb), но рынок может не принять. Частично снято honest positioning.

### 🟡 R4 — Feedback stability с high-Q пластиной НЕ доказана
SPICE Nyquist TODO. Петля вокруг Q=1000 spring steel трудно стабилизируется. Может визжать.
→ **Gate: Stage 1.**

### 🟡 R5 — Scope слишком большой для v1
ATtiny84A на 5+ задачах, аналоговый Tides-class FG, phaser, LFSR noise, solenoid triple-function, Gate/Crush, limiter, mute, CV protection, dual SKU, 25 блоков. Огромная debug-площадь. Риск "много, ничего не отполировано".

### 🟡 R6 — ATtiny84A перегружен (firmware risk)
LFSR + crush PWM (audio-rate) + TAP/sync + FG phase reset + envelope trigger + STALL throttle. Timer/interrupt contention. Может потребовать RP2040/STM32.

### 🟡 R7 — Solenoid на сменной пластине через contact — wear/reliability
Бьёт по spring-held пластине, thermal limits, felt wear. Novelty с вопросами надёжности. Felt wear → рано или поздно металл-по-металлу: нужен captive-felt с visual wear indicator ИЛИ recessed plunger, физически не достающий до пластины при стёртом войлоке. **Fatigue** зависит от материала (mammoth bone хрупче cattle — ресурс неизвестен). **Динамика удара (unseating) вынесена в R13** — это отдельный, более серьёзный конфликт, чем износ.

### 🟡 R8 — Dual SKU удваивает всё
Eurorack + pedal = ×2 testing/cert/mechanical. Первый продукт = отгрузить ОДНУ форму хорошо.

### 🔵 R9 — Позиционный конфликт audiophile vs lo-fi character
OPA1612/Mundorf на sparse резонаторе с solenoid-лязгом + bitcrush — противоречие. Audiophile и noise/character — разные покупатели.

### 🔵 R10 — Boutique-экономика
20-28 units: NRE/cert/support на крошечный тираж. Hobby объём, product затраты.

### 🔵 R11 — Калибровка 12 шагов/unit
Bench-время на hand-built = cost + consistency risk.

### 🔵 R12 — EMC/CE не адресован
Solenoid + DC-DC + MCU = EMI. Для коммерческой продажи нужен pre-compliance.

### 🔴 R13 — TOLL-удар может сам сорвать contact (strike × seating × frame-compliance)
**Найдено adversarial-физревью (Claim 11), диаграмма: `strike_seating_problem.svg`.** Это не «wear» (R7), а фундаментальный механический конфликт: соленоид бьёт по пластине, которая в тот же момент spring-прижата к пьезо-пикапу и exciter-пятаку (Decision 11 contact coupling). Считаем связанно, а не по частям:

- **Momentum matching.** Плунжер ~5г несёт I=√(2·F·d·m)=**0.010 Н·с** при v=2 м/с. Тонкая пластина (oak ~5-6г) — **равная масса** → передача импульса ≈100% → пластина получает те же **~2 м/с** как rigid body. Brass 13г → 0.77 м/с, slate/bone 17-25г → 0.4-0.6 м/с. **Хуже всего на лёгком краю палитры.**
- **Preload marginal по ВРЕМЕНИ, не величине.** 5N seating арестует 0.01 Н·с за t=I/F≈**2 мс** — тот же порядок, что сам удар (транзит ~2мс). Пик Hertzian-контакта **10-20N** (не квазистатика 5N — см. Claim 9) кратковременно превышает preload в разы.
- **🔴 Слабое звено — пьезо, не exciter.** Пьезо-пин прижат отдельной пружиной **~1.5N** (не 5N exciter, не net-магниты). Пик 10-20N превышает 1.5N в **7-13×** → **первым отскакивает именно сигнальный пикап** → rattle/dropout **прямо в звуковом тракте**, слышен напрямую, а не как побочка. Диаграмма недооценивала это (рисовала 5N на pin).
- **Frame rubber = ловушка.** Резина, добавленная чтобы рамка не звенела, даёт плите-на-mount резонанс **70-160 Гц (период 6-14мс) > 2мс удара** → на timescale strike резина НЕ держит, разрешает плите подпрыгнуть.

**TOLL может провоцировать ровно тот R1-rattle, против которого существует R1.** На 5-13г пластинах «bell strike» и «clean pickup» в прямом конфликте.

**Mitigations (нет ни в одном текущем доке):**
1. **Pin preload поднять отдельно** от exciter force (R1-ladder качает exciter, пьезо оставался 1.5N).
2. **Пьезо-пины крепить к жёсткому шасси модуля**, не к податливой frame-rubber.
3. **Cap TOLL energy на light-tier** пластинах (SOFT drive 3.8V по умолчанию — уменьшает импульс и заодно fatigue).
4. **Gate-synchronous MUTE FET** шунтирует пьезо на время CONTACT-фазы (Phase 1, не Phase 2 — см. EMI Block 14).
5. **Escapement pulse** ~3.5мс — плунжер уходит сразу после транзита, не сидит на звенящей плите.

→ **Gate: Stage 0B (ниже).** Требует замера **массы плунжера** (главный неизвестный рычаг: v∝1/√m, plate-kick ∝ m).

---

## 4. Нюансы, которые укусят

- **R1+R3 взаимодействуют**: contact-потери на и-без-того-sparse модах → почти нет сигнала.
- **Acoustic feedback**: модуль = контактный микрофон на резонансной пластине → на сцене заведётся от мониторов.
- **Thermal в закрытой педали**: R8 5W + push-pull + solenoid + DC-DC + MCU + LDO.
- **Контактный механизм servisability**: spring pins изнашиваются, alignment drift.
- **Plate thickness variance 0.3-3мм** — spring carriage должен компенсировать без потери contact force.

---

## 5. Bench-prototype protocol (cheapest-first gates)

> Каждый Stage — **gate**. Не переходить дальше / не тратить на PCB-tooling, пока предыдущий не passed. Stage 0 — экзистенциальный.

### Stage 0 — Существенный acoustic test ⭐ (выходные, ~$50-80)

**Вопрос**: звучит ли contact-coupled пластина хорошо, и различаются ли материалы?

**Закупка (AliExpress/Tayda OK для прото)**:
- 1× DAEX32Q-4 exciter (~$20, Parts Express)
- 3-4 сырые пластины: spring steel 0.3мм, oak 1.8мм, brass 0.5мм, (nephrite/glass если есть) — cut ~100×50 (W=50 bench de-risk const; McMaster / local)
- 2× piezo disc 27мм ($1)
- TL072 ×2, LM386 (или любой chipamp), breadboard, резисторы/конденсаторы (jellybean)
- Пружина сжатия + струбцина/jig для contact rig
- Audio interface + REW/Audacity (бесплатно)

**Схема (breadboard)**:
```
Audio source → TL072 buffer → LM386 amp → exciter (contact-pressed к пластине)
Пластина резонирует
Piezo (contact-pressed к back) → TL072 hi-Z preamp (×23, R_PA 10M) → audio interface
```

**Тесты**:
1. **Bonded vs contact baseline**: сначала приклей exciter к пластине (epoxy) — measure piezo output level + character. Потом spring-contact — measure delta. **Pass: contact в пределах ~6dB от bonded, без rattle.**
2. **Drive sweep**: sine sweep 50Hz-10kHz + pink noise + перкуссивный удар. Записать piezo FFT. Увидеть моды.
3. **Material A/B**: тот же сигнал через каждую пластину. FFT spectral signature + decay. **Pass: материалы visibly + audibly различны.**
4. **Contact force sweep**: 3-8N. Найти sweet spot. **Pass: есть зона без rattle с хорошим transfer.**
5. **Subjective listen**: звучит ли музыкально (резонатор/колокол), не глухо/слабо?

**Gate Stage 0**:
- ✅ Pass → contact coupling работает, материалы различны → **фундамент жив**, продолжать.
- ❌ Fail (contact слаб / rattle / материалы одинаковы) → **остановиться**. Решения: (a) exciter bonded к driver-plate в модуле, картридж прижимается к ней (двухслойный coupling); (b) более крупные/тонкие пластины; (c) пересмотр концепции. **НЕ заказывать PCB/tooling до решения.**

### Stage 0B — Strike-unseating gate ⭐ (тот же rig + соленоид, ~$10, полдня)

**Вопрос**: не срывает ли TOLL-удар contact пьезо/exciter (R13)? Дешевле выяснить сейчас, чем после feedback/signal-chain работы.

**Добавить к Stage 0 rig**: 1× push-solenoid 5V (Adafruit 412 / bulk, ~$5) на bracket над пластиной, felt-tip, gap 2мм. Драйв от gate-генератора (или кнопка + 555). **Сначала взвесить плунжер** (главный неизвестный, v∝1/√m).

**Тесты**:
1. **Unseating scope**: пьезо-выход на осциллограф, дать одиночный TOLL. **Fail-признак**: спайк/дропаут/двойной-удар в сигнале в первые ~5мс (пластина отскочила от пина). **Pass**: чистый bell-attack без rattle-артефакта.
2. **Масса пластины sweep**: oak ~6г (worst) → brass ~13г → slate ~25г. **Pass**: лёгкая пластина не хуже тяжёлой; если oak rattl'ит а slate нет — подтверждён momentum-matching.
3. **Pin preload sweep**: пьезо-пружина 1.5N → 3N → 5N. **Pass**: есть preload, убирающий unseating без демпфирования тембра.
4. **Pulse width**: 3.5мс escapement vs 15мс held. **Pass**: короткий pulse = длиннее sustain (подтверждает инверсию duration=damping).
5. **EMI click**: тот же удар, но пьезо **не касается** пластины (только электрика рядом). Слышен click? → capacitive coupling с drain-узла (R13/Block 14), нужен MUTE FET.

**Gate**: ❌ Fail (лёгкие пластины rattl'ят, click слышен) → применить R13 mitigations (pin preload↑, пины на жёсткое шасси, SOFT drive, MUTE FET) **до** любого PCB. Если не лечится — TOLL только для тяжёлых пластин (≥15г), либо отдельный «struck» под-каталог.

### Stage 1 — Feedback loop stability (после Stage 0 pass, ~неделя)

**Вопрос**: стабилизируется ли feedback вокруг high-Q пластины?

1. **SPICE Nyquist сначала**: model пластина как RLC (R=1Ω, L=10mH, C=1µF → ~1.6kHz; вариировать Q). Проверить gain/phase margin на feedback max. Для каждого material Q.
2. **Bench**: добавить feedback path (piezo preamp → gain → exciter driver) + soft-clip limiter (1N4148 anti-||).
3. Sweep FEEDBACK knob на каждой пластине. **Pass: controlled feedback до self-osc, стабильно, no runaway squeal.** Особенно high-Q steel.

**Gate**: ❌ Fail → добавить attenuator/damping в петлю или ограничить self-osc только dense материалами.

### Stage 2 — Core signal chain (после Stage 1)

- Pre/de-emphasis + tone filter + envelope VCA на breadboard.
- **JFET preamp noise floor**: open-input < -85 dBV (premium target -90). Если хуже — bias resistor optimization (R_PA 10M→100M).
- Solenoid contact strike на пластину — bell-tone? thermal 60s STALL test.

### Stage 3 — FX subsystems (инкрементально, ТОЛЬКО после ядра)

Каждый отдельно на breadboard, по одному:
- Phaser (4-stage OTA) + проверка Iabc modulation
- **Analog FG** (Tides-class) — самый сложный, отдельный прото. Проверить rise/fall/exp converters, clock sync на ATtiny84A.
- Noise gen (zener + LFSR)
- Gate/Crush — voiced sweet spot + post-crush LPF (музыкальность)

### Stage 4 — Integration → first PCB

Только после Stages 0-3 → проектировать PCB (PCB_DESIGN_SPEC). **first PCB = rev A прототип, не production.**

---

## 6. Рекомендация по scope

Текущий дизайн = **v3 амбиции, выпускаемые как v1**. Для снижения риска:

**Урезанный v1 (proposal)**:
- ОДНА форма (pedal ИЛИ Eurorack, не оба)
- Ядро: material resonator + feedback + envelope VCA + tone
- 1-2 эффекта max (phaser ИЛИ noise — не всё)
- **Без analog Tides-FG** (это отдельный модуль амбиций; начать с простого LFO)
- Простой MCU или вообще без него в v1
- Gate/Crush опционально

Доказать акустику + base musicality → продать → v2 наращивать FG/cold-palette/dual-SKU.

**Полный текущий дизайн = v2/v3 roadmap, не v1.**

---

## 7. Pre-tooling checklist (gate перед любыми затратами)

- [ ] **Stage 0 passed** — contact coupling работает, материалы различны (blind A/B >80%)
- [ ] **Stage 0B passed** — TOLL-удар не срывает пьезо/exciter contact (R13); плунжер взвешен
- [ ] **Stage 1 passed** — feedback стабилен (SPICE + bench) на всех материалах
- [ ] **Stage 2 passed** — JFET noise floor OK, core chain musical
- [ ] Решение scope: v1 урезан или полный (с осознанием риска)
- [ ] Решение MCU: ATtiny84A firmware feasible (или upgrade)
- [ ] €3640 pricing обоснован или пересмотрен
- [ ] ТОЛЬКО потом: PCB-fab + panel-CNC + component-bulk

> **Не тратить деньги на железо, пока Stage 0-1 не passed.** Это единственный честный способ не потерять $3000+ на непроверенном фундаменте.

---

**End of risk assessment v6.5. Stage 0 — обязательный gate. Bench перед bucks.**
