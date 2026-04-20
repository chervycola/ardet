# Last Day — инженерный разбор

Критика трёх подсистем: Solar Amplifier, Oil Can Delay, Resonant EQ. Last Day — концепт, не имеет детальной схемы как Last Night, поэтому критика на уровне блочной архитектуры.

---

## Сводная таблица подсистем

| # | Подсистема | Основной риск | Статус |
|---|------------|---------------|--------|
| A | Solar Amplifier | **BLOCKER** в закрытом педальном корпусе (нет света) |
| B | Oil Can Delay | **BLOCKER** сервис герметичной масляной ванны |
| C | Resonant EQ | **MAJOR** mid-резонатор требует прецизионной механики |
| D | FX (HAZE/WIRE/DUST/DRAG) | **MAJOR** DRAG DC-motor brake нестабилен |
| E | Performative (KILL/CRASH/FREEZE) | **MINOR** CRASH solenoid interaction с масляной ванной |
| F | Общая интеграция | **BLOCKER** форм-фактор не решён |

---

## A. Solar Amplifier

**Концепт**: кремниевая солнечная ячейка ~50×50мм на лицевой панели → charge pump (×2/×3) → starved supply для усилительного каскада. Внутренний LED как "SUN" baseline. Фотоэлемент также управляет compressor через LDR sidechain.

### A.1. Charge pump starved supply — **MAJOR**

**Physics**:
- Solar cell 50×50мм в комнате (office lighting ~300 люкс) генерирует ~5–15 мВт. Open-circuit voltage ~0.5В, short-circuit current ~30 мА в солнце, ~3 мА в комнате.
- Charge pump ×3 от 0.5В → 1.5В. С MAX1044 / ICL7660 — не работает, эти чипы требуют минимум 2.5В на вход.
- Нужен **boost converter low-voltage** (например, TPS61240 от TI) — работает от 0.7В, поднимает до 5В. Но requires inductor, ~$3 + 4 компонента.

**Проблема**: "starved supply" на уровне ~3–6В означает ОУ работает в half-voltage mode, headroom маленький, signal clippiтся быстро. Это **желаемый эффект** (overdrive), но:
- При сильном свете каскад становится "чистым" (больше headroom).
- В темноте — полностью "голодает", может вообще не работать.
- **Нет управления baseline state**. Внутренний "SUN" LED добавляет baseline, но ручкой SUN на 0 → полностью зависим от внешнего света → полный rollercoaster звука.

### A.2. Bias от фотоэлемента — **MAJOR**

**Концепт**: делитель от solar cell задаёт смещение каскада.

**Проблема**: solar cell — неидеальный источник bias voltage. Зависит от:
- Освещённости (очевидно).
- Температуры (–0.3% на °C).
- Угла падения света.
- Частичного затенения.

**Последствие**: bias дрейфует непредсказуемо → signal offset, asymmetric clipping, в худшем случае выключение каскада. Часть дизайна, но труднопредсказуемо.

**Рекомендация**: добавить **stable bias anchor** — сравнительный резистор к VCC, чтобы при максимальном свете bias был в оптимальной точке, при полной темноте — в пороге cutoff, но не полностью закрыт.

### A.3. Starved MOSFET или лампа 12AU7 — **QUESTION**

**Концепт упоминает**: *"MOSFET или лампа 12AU7 на сверхнизком анодном"*.

**Лампа 12AU7 на ~6В anode** — работает, но требует подогреватель (~600 мА на 6В). Это **главный потребитель питания** в модуле. Для Eurorack ±12V это >10% шины. Для педали — battery drain catastrophic.

**Рекомендация**: MOSFET drive (BS170 или 2N7000), не лампа. Лампу оставить для premium SKU.

### A.4. Солнечная компрессия через LDR — **MINOR**

**Концепт**: параллельно solar cell управляет LED+LDR (вактрол) в sidechain.

**Проблема**: LDR-compressor имеет нелинейную kneecorner, зависит от LDR exemplar (разброс 20% обычный). Для "солнечной" компрессии — ОК, это характер, не precision.

**Рекомендация**: использовать готовый вактрол VTL5C3 или VTL5C4 (с specified parameters), не самодельный LED+LDR. Добавка $3, но repeatability.

### A.5. Закрытый корпус vs. solar — **BLOCKER**

См. C2 в `50_contradictions_and_todos.md`. Solar cell **не работает в закрытой педали**. Если Last Day = педаль → solar cell переносится на верхнюю панель или откидной флажок, что добавляет механической сложности.

**Единственное рабочее решение**: Last Day = **Eurorack only**, педальная версия — без solar (или с имитированным SUN через MCU random walk).

---

## B. Oil Can Delay

**Концепт**: металлический диск (∅80–100мм) с магнитным покрытием на оси DC-мотора, нижняя часть в ванне с маслом. Две параллельные системы задержки:
- **Магнитный tract**: write head → disk surface → 2× read heads → erase head. Скорость вращения = время задержки.
- **Масляный tract (ghost)**: подводный пьезо excitation → ванна масла → hydrophone.

### B.1. Магнитный диск — inheritance Fender Tel-Ray — **MAJOR**

**Исторический предшественник**: Fender/Gibson Tel-Ray Adineko (1960-е). Работал по **электростатическому** принципу (capacitive), не магнитному.

**Магнитный vs. электростатический**:
- Магнитный (как заявлено) требует ferromagnetic layer на диске — сложно в production (coating process для 100мм диска).
- Tel-Ray работал на нечистоте (oil as capacitor dielectric) — conductive masla + steel disk + stationary electrode. Гораздо проще.

**Рекомендация**: следовать оригинальному Tel-Ray — capacitive pickup, не magnetic. Дешевле, репродьюсибельнее. Результат похож (delay + dirty saturation).

### B.2. Magnetic heads — **BLOCKER для сменной ванны**

**Проблема**: magnetic heads (write, read A, read B, erase) находятся над масляной частью диска. Если масло меняется (сменный картридж), head position может сдвинуться → delay time, calibration off.

**Хуже**: heads — deliverable part. Retrieval для service требует **разборки герметичной ванны**. Это делает картридж **одноразовым** или требует production-grade reassembly.

**Рекомендация**: heads **не в картридже**, а в основном шасси модуля. Картридж — только масло и диск. Диск standardized size, heads fit universally.

### B.3. DC-motor для ротации — **MAJOR**

**Физика**:
- DC-motor требует CV → speed conversion. Не linear (wind cogging, nonlinear BEMF).
- Speed ripple прямо модулирует delay time → wow/flutter. **Заявлено как feature** ("HAZE"), но нужно **контролируемое** wow, не хаотическое.

**Рекомендация**: закрытый loop — **optical encoder на оси** → PLL для точной скорости. Добавляет MCU (ATtiny или STM32) + encoder ($8–15). Без этого delay time не стабилен.

**Альтернатива**: stepper motor + driver. Более стабильно, но потеряется "живость" DC-motor.

### B.4. Подводный пьезо + гидрофон — **MAJOR**

**Физика**:
- Пьезо diver в масле возбуждает жидкость → акустическая волна → гидрофон снимает.
- Скорость звука в масле ~1500 м/с.
- Для ванны 60мм × 15мм путь масла ~30мм → задержка ~20 мкс. Это **не delay** в музыкальном смысле (22kHz SR означает разрешение 45мкс), а micro-latency. Эффект — акустическая окраска (filter-like), не эхо.

**Сценарий тогда**: "ghost echo" — это **не эхо**, а фильтрация через масло. Более честно назвать "oil filter" или "wet path".

**Hydrophone SNR**: в 60 мл масла, сигнал от пьезо ~100 мВ → hydrophone output ~1 мВ после потерь в масле. SNR ограничен шумом preamp → **catastrophically low без специализированного low-noise preamp**. Нужен OPA1642 или подобный.

### B.5. Нагреватель (HEAT) — **MINOR**

**Концепт**: резистивный нагреватель управляет вязкостью масла.

**Физика**:
- Вязкость масла зависит от T: cold (5°C) silicone oil ~500 cP, hot (60°C) ~100 cP. Разница 5×, заметно влияет на acoustics.
- Однако нагреватель в 60мл масла — ~20W нагрузка для ощутимого изменения T в минутах. Это ~1.7А на 12В — много для audio device.

**Рекомендация**: маркетинговая фича, не core. Оставить как optional, питать от dedicated supply (не от audio rails). Или маленький нагреватель 5W — заметный эффект через 15 минут. Реалистично.

### B.6. Сменные масляные ванны — **MAJOR**

Каталог масел (минеральное, силиконовое, касторовое, глицерин, трансформаторное) — **хорошая концепция**, но:

- **Герметизация**: масло не должно вытекать при перевозке, переворачивании. Требует прокладок (Viton) — $2 каждая.
- **Безопасность**: касторовое масло — пищевое, OK. Трансформаторное — может содержать PCB (старые) — токсично. Силикон — OK. Нужен **список approved oils** с safety disclaimer.
- **Чистота**: замена масла → попадание частиц → artifacts в сигнале. Требует filter при заливке.

**Рекомендация**: caps ограничены **3 маслами** (silicone light/heavy, mineral) — достаточно для тембрального разнообразия, management обозримый.

---

## C. Resonant EQ — индуктивный EQ + физический mid-резонатор

### C.1. Low/High shelves на индукторах (Pultec-like)

**Концепт**:
- LOW — катушка индуктивности на ферритовом тороиде, LC-cell в feedback ОУ.
- HIGH — аналогичный LC-узел на железном сердечнике.

**Физика**:
- Pultec EQP-1A (1950s) использовал transformers + inductors для shelving EQ. Легенда отрасли.
- На sufficient drive, ферритовый сердечник saturates → добавление гармоник. **Приятный** эффект.

**Проблемы**:
- **Ручная намотка индукторов** — non-scalable. Лучше коммерческие indоктоrs (Wurth, Bourns).
- **Railway** для LC resonance: L=10 мГн × C=1 µФ → fc ≈ 1.6кГц. Для 200Гц LOW нужен L=62 мГн + C=10 µФ. Большие компоненты.
- **Cost**: хорошие audio inductors $5–15 each → 2 shelves = $30 BOM. Значимо.

### C.2. Mid резонатор — physical tongue + clamp — **MAJOR, но уникально**

**Концепт**: металлическая пластинка (~60–80 × 8–12 × 0.3–0.8 мм) защемлена одним концом, под пьезо exciter, над пьезо sensor. Подвижный зажим (каподастр) скользит вдоль пластинки → изменяет эффективную длину → изменяет resonant frequency.

**Физика**:
- Кантилеверная балка с закреплённым концом резонирует на f = (1.875² / 2π) × √(EI / (ρ × A × L⁴)).
- Для стальной пластинки 40×10×0.5мм: E=200ГПа, ρ=7800 kg/m³, I=5.2×10⁻¹⁴ m⁴, A=5×10⁻⁶ m² → f ≈ 1.3 кГц.
- Укоротить L в 2× → f × 4 (квадратично с длиной). Range 200Гц-3кГц (заявлено 4 октавы) требует длина 20-80мм → реально.

**Проблемы**:
- **Повторяемость**: зажим (каподастр) с винтом ручной настройки — каждая сборка даёт разную calibration. Нужен автокалибровочный mechanism (stepper + homing).
- **Q от clamp pressure** — интересный concept, но control имеет мало repeatability. Pressure variation ±20% дает Q change 2×. Для performance OK, но для preset recall — нет.
- **Motorized lead screw для CV**: добавляет motor + driver + encoder = ~$15 BOM. Механика сложная.
- **Пьезо для excitation + pickup** на одной пластинке — потенциальная acoustic feedback (self-oscillation). Может быть фичей (**self-oscillation** упомянуто), но control marginal.

**Уникальность**: такой resonant EQ **не существует в industry**. Это центральная innovation Last Day. Если это работает — это отдельный продукт для audio boutique.

**Рекомендация**:
- v1 — **manual clamp** (ручка на тросике). Proof of concept, простая механика.
- v2 — **motorized** с MCU + encoder.
- Self-oscillation — documented feature, не bug.

### C.3. Сменные пластинки материалов (mid voice) — **MINOR**

Каталог (сталь, латунь, бронза, титан, медь, кость) — хорошая идея, аналогично основному каталогу Last Night. Стандартизировать mount (quick-change mechanism).

**Проблема**: каждая замена требует recalibration (Q, gain, centering). Если нет autocal mechanism — user flow frustrating.

**Рекомендация**: физическая сменная пластина + detent positions для typical clamp offsets. Не полностью analog, но usable.

---

## D. Perform FX (HAZE / WIRE / DUST / DRAG)

### D.1. HAZE — тепловое марево — **MINOR**

**Концепт**: модуляция скорости motor oil-can → wow/flutter → pitch instability повторов.

**Реализация**: LFO → CV → motor speed input. Triangle/sine LFO 0.1–5Гц, modulation depth 0.5–5% speed. Typical синт implementation.

**Риск**: если motor speed control уже nonlinear (из пункта B.3), HAZE modulation выйдет непредсказуемо (LFO × motor response curve = weird).

**Рекомендация**: HAZE — после solid motor control (PLL-locked). Иначе это не "marево", а "random speed scribble".

### D.2. WIRE — ЭМ-антенна — **QUESTION**

**Концепт**: маленькая катушка-антенна ловит hum сети (50/60Гц), наводки.

**Реализация**:
- Pickup coil 1000 витков на ferrite core → preamp ×100 → level pot → mix.
- **Входное сопротивление** важно: catch в audio mix только если impedance matched. Typical pickup coil ~1кΩ DCR, ~100мГн inductance.

**Проблема**: это **чистая EMI antenna**. Катушка будет ловить:
- Собственную PSU модуля (150кГц switching TMA1212D).
- Коммутацию других модулей в rack.
- Цифровые помехи любого соседа.

В практическом environment WIRE = "подмешай noise of ambient electronics". Это может быть feature (character), но **не controllable** — зависит от чужой шум-обстановки.

**Рекомендация**: WIRE — отдельный jack для **external** magnetic pickup (как bass pickup, attachable к чему угодно — радио, трансформатор, телефон). Как guitar pickup interface в модуле. Это convertible feature.

### D.3. DUST — импульсный шум — **MINOR**

**Концепт**: шумящий транзистор → comparator → редкие клики.

**Реализация**: то же самое, что **правильный Geiger simulator** для Last Night (см. блок 15 в `10_`). Последовательно: noise source → threshold compар → pulse shaper → mix.

**OK** — стандартная lo-fi pulsing schema. Недорого, работает.

### D.4. DRAG — торможение motor — **MAJOR**

**Концепт**: электрический тормоз (back-EMF brake) или physical колодка → мотор замедляется → pitch падает → эхо тонет.

**Реализация — electric brake**:
- Замкнуть motor terminals через резистор → motor действует как generator, резистор рассеивает энергию → торможение.
- Нужен MOSFET switch для коротыш-замыкания. Педаль = momentary stomp.

**Реализация — physical brake**:
- Соленоидная колодка прижимается к диску. Механически сложно, износ.

**Проблема**: DRAG reactivates unevenly. Motor brake — nonlinear (зависит от скорости), replay предсказуемости no. Musical usage — experimental.

**Рекомендация**:
- **Electric brake** (проще), +1 MOSFET + 1 резистор.
- Педаль DRAG — momentary. Release → motor restart с ramp-up.
- **Важно**: read head должна продолжать читать даже при 0 RPM (иначе полный silence). Значит recording не останавливается, только replay speed меняется.

---

## E. Performative controls (KILL / CRASH / FREEZE)

### E.1. KILL — мьют входа — **MINOR**

**Концепт**: мгновенный mute входа, delay tail продолжает играть.

**Реализация**: FET switch (4066 analog switch или dedicated MOSFET) на input path.

**OK**, стандарт. Латчинг или momentary — обе OK, но **click-free mute** требует ramping (1–5 мс fade). Без этого будет щелчок.

**Рекомендация**: CMOS switch 4066 + RC soft ramp (10кΩ + 100нФ → time constant 1мс). $0.5 BOM.

### E.2. CRASH — соленоид по маслу — **MINOR, но уникально**

**Концепт**: соленоид физически ударяет по ванне → всплеск в гидрофоне → "взрыв" в delay.

**Физика**:
- Mass solenoid plunger ~5г, impact velocity ~1 м/с → impulse ~5 × 10⁻³ Н·с.
- В ванне масла это вызовет acoustic impulse ~100 мс.
- Гидрофон cranks до peak → пропускается через feedback delay → создаёт burst.

**Риск**: соленоид интенсивного импакта может:
- Деформировать ванну со временем.
- Произвести механический шум (slap) через корпус → дольше, чем acoustic sample.

**Рекомендация**:
- Ограничить CRASH impact: короткий pulse (5–10 мс), не полный stroke.
- Физически shock-isolate ванну от корпуса (rubber bushings).
- Rate limit — не больше 1 CRASH в секунду (защита от button mashing overheating).

### E.3. FREEZE — looping — **MINOR**

**Концепт**: запись отключается, текущий контент loop'ится и деградирует.

**Реализация**:
- Отключить write head → существующий контент продолжает циркулировать.
- Erase head тоже отключить → контент не стирается.
- После одного полного оборота диска → same сигнал играется снова.

**Проблема deгradación**: каждый pass через read head adds noise (head noise + media noise). Через ~30 секунд контент significantly degradirovan.

**Хорошо** — это part of эстетика "умирающий loop". Documenting as feature.

**Рекомендация**: FREEZE button latching. LED indicator показывает state.

---

## F. Общая интеграция и питание — **BLOCKER**

### F.1. Форм-фактор не решён

См. C2 в `50_`. Заявлено "Eurorack 40HP / педаль, RCA inputs". Три реальные проблемы:
- **Solar cell** нуждается в открытой панели → Eurorack face (OK), педаль top (OK если smart geometry).
- **Magnetic disk motor** в педальном корпусе — floor vibration + motor stability → motor won't run smoothly на floor.
- **RCA jacks** — DJ format (console/table), не pedalboard.

**Вердикт**: Last Day = **Eurorack-only** в первой реализации. Педальная версия — отдельный R&D проект, другая PCB.

### F.2. Power budget

Для Eurorack 40HP модуля:
- Motor DC + controller: ~200 мА на 12В (peak), 50 мА steady.
- Solar amp starved caskад: ~20 мА (low power by design).
- EQ + LFOs + support ICs: ~100 мА на шину.
- Solenoid for CRASH: 300 мА impulse (но редко).
- Heater: **3–5 Вт if used** = ~400 мА — critical! Must not be on audio rails.

**Total**: ~400 мА steady + peaks. Для Eurorack стандарт ±12V шина — **близко к пределу** типичной PSU (обычно 500 мА на шину). Нужен dedicated +5V rail для motor через local regulator.

**Рекомендация**: Last Day имеет собственный 5V regulator (LM7805 or better LDO) для motor/heater. Audio rails ±12V только для audio path.

### F.3. Сервис и reliability

Полноценный Last Day содержит:
- Motor (вращает диск) — 500–5000 ч lifetime. MTBF ограничен.
- Magnetic heads — износ.
- Oil (меняется картриджем, но internal system может loading).
- Mid резонатор с clamp — mechanical wear.
- Solenoid CRASH — impact wear.

**Вердикт**: Last Day — **maintenance-heavy**. Нужна сервисная документация, доступ к heads, motor replacement path, guidelines по замене масла.

**Рекомендация**: модульная конструкция — каждая подсистема removable/replaceable. Документировать MTBF для каждой.

### F.4. Сравнение со сложностью Last Night

| Аспект | Last Night | Last Day |
|--------|-----------|----------|
| Компонент count | 142 | ~200+ (предположительно) |
| Mechanical parts | 2 (exciter, solenoid damper) | 7+ (motor, heads, pump, solenoids, clamp, heater) |
| Acoustic cartridge | 1 тип | 2 (plate + oil) |
| R&D time estimate | 6–12 месяцев | 18–30 месяцев |
| Retail target | $300–400 | $700–1000 (плотность функций) |

**Last Day в 2–3 раза сложнее Last Night**. Ставить его как параллельный R&D — не рекомендуется. Сначала Last Night ship, потом Last Day.

---

## Итоги разбора Last Day

**Blockers**: 3 (solar cell в педали, oil heads servicing, форм-фактор не решён).
**Major issues**: 6 (DC-motor speed control, hydrophone SNR, mid clamp repeatability, inductor BOM, WIRE uncontrollability, DRAG behaviour).
**Minor issues**: 6.

**Рекомендуемый приоритет R&D**:

1. Зафиксировать **Eurorack-only** (убрать pedal version из scope v1).
2. Прототипировать motor + disk + heads на breadboard (без oil, без mid резонатора, без solar). Базовый delay.
3. Заменить **magnetic heads на capacitive** (Tel-Ray inheritance) — проще, дешевле.
4. Добавить oil + hydrophone (tract B).
5. Добавить Solar Amp (ёмкость работы с солнечным cell в open panel).
6. Добавить Resonant EQ с ручным clamp.
7. Только потом FX (HAZE/WIRE/DUST/DRAG) и perform (CRASH/KILL/FREEZE).

Каждый этап = standalone subsystem, testable independently. Итоговый Last Day = sum of working subsystems, не monolith с тремя unknowns.

