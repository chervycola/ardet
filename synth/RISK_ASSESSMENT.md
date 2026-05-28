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
Бьёт по spring-held пластине, thermal limits, felt wear. Novelty с вопросами надёжности.

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
- 3-4 сырые пластины: spring steel 0.3мм, oak 2мм, brass 0.5мм, (nephrite/glass если есть) — cut ~100×53 (McMaster / local)
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
- [ ] **Stage 1 passed** — feedback стабилен (SPICE + bench) на всех материалах
- [ ] **Stage 2 passed** — JFET noise floor OK, core chain musical
- [ ] Решение scope: v1 урезан или полный (с осознанием риска)
- [ ] Решение MCU: ATtiny84A firmware feasible (или upgrade)
- [ ] €3640 pricing обоснован или пересмотрен
- [ ] ТОЛЬКО потом: PCB-fab + panel-CNC + component-bulk

> **Не тратить деньги на железо, пока Stage 0-1 не passed.** Это единственный честный способ не потерять $3000+ на непроверенном фундаменте.

---

**End of risk assessment v6.5. Stage 0 — обязательный gate. Bench перед bucks.**
