# Last Night v2.1 — инженерный разбор схемы

По-блочная критика схемотехники ревербератора. Источник — брифы v2.0, v2.1 + **каркас `wood_reverb_logical_schematic.html`** (added post-factum, triggered revision — см. `13_schematic_cross_reference.md`).

Для каждого из 15 блоков: **intent** (зачем нужен), **topology** (как реализовано), **parts** (номиналы/компоненты), **noise/signal** (параметры), **failure modes** (что может пойти не так).

Обозначения серьёзности: **BLOCKER / MAJOR / MINOR / QUESTION** — см. `00_README.md`.

> **Revision status**: severity переоценены после сверки с каркасом. Блок 3 и блок 8 понижены; блок 4, 7 получили corrected analysis.

---

## Сводная таблица блоков (revised)

| # | Блок | Статус | Топ-риск |
|---|------|--------|----------|
| 1 | Power | MINOR | Decoupling может быть недостаточным возле piezo preamp |
| 2 | Input Buffer | MINOR | Zin 100к низковат для высокоимпедансного источника (гитара) |
| 3 | Pre-emphasis EQ | **MINOR** (было MAJOR) | Corner ~3.2кГц корректен для shelving topology, matching C_PE1=C_DE1 критично |
| 4 | Driver Amp + Push-Pull | MAJOR | Push-pull без biasing; **R8 4.7Ω должен быть 5W wirewound**; crossover distortion |
| 5 | Feedback Summing + Freeze | BLOCKER | Stability loop не симулирована (topology теперь ясна) |
| 6 | Sidechain Input | MINOR | 5 компонентов на фичу, которая редко используется |
| 7 | Exciter → Резонатор | MAJOR | C_DC 220µФ corner 83Гц (с R8); power delivery 3Вт peak; dense materials нужен DAEX32 |
| 8 | Solenoid Damper | **MAJOR** (было BLOCKER) | Marginal turn-on при CV 5В (gate 2.5В, Vth spread); EMI в piezo preamp остаётся |
| 9 | Dual Piezo + JFET Preamps | BLOCKER | 2N5457 EOL; gain ×23 сразу после JFET → шумовой бюджет |
| 10 | Position Crossfade | MINOR | Dual-gang pot 100к dependent matching; тембр-эффект слабый при равных датчиках |
| 11 | De-emphasis EQ | **MINOR** (было MAJOR) | Зеркало pre-emph, matching C_PE1/C_DE1 критично (note в каркасе) |
| 12 | Tone LPF + LED Clipper | MINOR | LED ±1.8В клиппинг — низкий потолок |
| 13 | Attack/Decay VCA | MAJOR | τ = 1с максимум — диапазон смещён в "медленно"; OTA2 не используется |
| 14 | Mix + Stereo Output | MINOR | Стерео-тракт мёртвый груз в педали (см. C10) |
| 15 | Noise Generator | MAJOR | BC547 reverse B-E breakdown — параметрический разброс, деградация |

**Severity counts revised**: 2 BLOCKER (было 4), 6 MAJOR (было 7), 7 MINOR (было 4).

---

## Блок 1. Power

**Intent**: обеспечить ±12V для всех ОУ и LM13700 в обеих форм-факторах — Eurorack (прямо от шины) и педаль (через DC-DC).

**Topology**: Eurorack — 2×5 IDC → 1N5817 в серии по каждой шине (reverse protection) → 10×100nF decoupling. Педаль — 12V DC вход → TRACO TMA1212D (изолированный DC-DC, выход ±12V, 83 мА на шину).

**Parts**: 1N5817 (Schottky, Vf ~0.4В, Imax 1А), TMA1212D (1W output), 10×100nF керамика.

**Noise/signal**:
- TMA1212D шумит на ~150кГц (switching freq). Нужен LC фильтр на выходе (10µГ + 10µФ или π-фильтр), иначе switching residue попадёт в аудиотракт через ОУ PSRR.
- 100nF decoupling — стандарт, но для LM13700 с быстрыми переходами OTA нужен дополнительный 10µФ электролит на питании IC.
- Star ground (заявлен) на 2-слойной PCB 101.6×108мм физически невозможен как настоящий star — реализуется как "mostly star" через GND pour + return paths.

**Failure modes**:
- **MAJOR**: TMA1212D 1Вт = 83мА на шину. Бюджет: ~5 ОУ × 3мА + LM13700 × 15мА + exciter peak (BD139 Ib × β учтён в Ic, но base current ~20мА на пике) ≈ 50–70мА. Запаса почти нет. Если добавится LFO (см. C1) — упрёмся в предел.
- **MINOR**: 1N5817 Vf 0.4В при 100мА — бюджет питания ОУ уменьшается с ±12В до ±11.6В. Незаметно, но фиксирует реальный headroom.
- **QUESTION**: для педали с 9В входом (стандарт педалбордов) TMA1212D не подойдёт (нужно 12В минимум). Нужен либо повышающий 9→12В (MAX1771 или просто DC-DC 9→12), либо принятие только 12В DC.

**Рекомендация**:
- LC-фильтр после TMA1212D на каждой шине.
- Электролит 10µФ у LM13700.
- Для педали зафиксировать 12В DC вход (более редкий стандарт) или добавить 9→12 boost стадию.
- Бюджет питания пересчитать после окончательной схемы, добавить 30% запас.

## Блок 2. Input Buffer

**Intent**: высокоимпедансный приёмник входного сигнала, развязка от источника.

**Topology**: U1A TL072 — voltage follower (unity gain). C_IN 1µФ AC-coupling → R1 100к bias к GND → U1A+ → U1A− (follower) → R2 1к serial output.

**Parts**: TL072 (JFET-input ОУ, IB ~3pA), C_IN 1µФ film, R1 100кΩ, R2 1кΩ.

**Noise/signal**:
- Zin = 100кΩ (определяется R1). Это OK для line-level и синтезаторных источников, но **низковато для гитары** (типичный гитарный pickup ~10кΩ, хочет видеть ≥500кΩ для сохранения ВЧ).
- AC-coupling corner: C_IN=1µФ × R1=100к → fc ≈ 1.6Гц. Хорошо, басы не режутся.
- TL072 voltage noise ~18 нВ/√Гц. На Zin 100к — shot noise резистора ~40 нВ/√Гц доминирует. Для line-level это ниже -90dBu — незаметно.

**Failure modes**:
- **MAJOR**: если целевой вход — гитара, 100к недостаточно. Нужен либо 1МΩ bias (и следить за IB buffering), либо переключатель Hi-Z / line через джампер.
- **MINOR**: R2 1к на выходе follower — нормально для защиты от capacitive load, но в педальном корпусе с короткими проводами это лишний шум-добавка.
- **QUESTION**: нет ESD-защиты на входе. Для Eurorack это риск (коммутация патч-кабелей). Рекомендация — 2×1N4148 к ±12В rails на вход буфера (clamp).

**Рекомендация**:
- Поднять R1 до 1МΩ, если целевая аудитория — гитара.
- Добавить ESD clamp диодами.
- Убрать R2 если не нужен для стабильности длинного кабеля (в педали — убрать; в Eurorack — оставить).

## Блок 3. Pre-emphasis EQ — **MINOR** (понижено с MAJOR после revision)

> **Revision note**: первоначальный разбор содержал arithmetic error — я упростил топологию до single RC и посчитал corner 15.9кГц. Каркас (секция 3) показывает **shelving EQ с RV_BOOST в shunt path через C_PE1** (Baxandall-style), для которой заявленная частота ~3.2кГц корректна. См. `13_schematic_cross_reference.md` C2.

**Intent**: усиление ВЧ перед exciter, чтобы компенсировать завал, внесённый материалом пластины. После pickup — зеркальный de-emphasis. Цель — сохранить high-frequency детализацию после прохождения физической цепи.

**Topology (corrected)**:
```
BUF_OUT ──R_PE1 (10k)──┬──C_PE1 (1n)──RV_BOOST (50k)──GND  (shunt path)
                        │
                        ↓
                   U3A non-inv shelf → R_PE3/R_PE4 feedback → PE_OUT
```

**Parts**: R_PE1 10кΩ, C_PE1 1нФ, RV_BOOST 50кΩ, R_PE3/R_PE4 10кΩ (feedback network), U3A — половина TL072.

**Corrected noise/signal analysis**:

Когда RV_BOOST = 0Ω (CCW), C_PE1 к GND через нулевое сопротивление → HPF с corner f = 1/(2π × R_PE1 × C_PE1) = 15.9кГц — signal *не получает boost* ниже этой частоты → overall flat.

Когда RV_BOOST = 50кΩ (CW), shunt impedance = R_PE1 + RV_BOOST в series с C_PE1 → f = 1/(2π × (R_PE1+RV_BOOST) × C_PE1) = 1/(2π × 60k × 1n) = **2.65кГц**. Shelf начинается примерно здесь, +8dB plateau выше — **согласуется с заявленными ~3.2кГц**.

**Verdict**: заявленная corner frequency корректна для данной shelving топологии. Моя предыдущая критика "15.9кГц arithmetic error" была неправильной — результат упрощения до simple RC.

**Failure modes (корректированные)**:

- **MINOR**: C_PE1=C_DE1 matching **критично** (note прямо в каркасе: "C_PE1 MUST match C_DE1 exactly. Both 1nF C0G ceramic from same batch recommended"). Если не matched — pre и de-emph не точно компенсируют, спектр перекошен.
- **QUESTION**: фаза. Shelving EQ в inverting topology → invert signal. Если de-emphasis топология в такой же inverting — две инверсии сократятся. Если одна неinverting — фаза реверба инвертирована относительно dry, в mix возможный comb-notching. Каркас показывает U3A в non-inverting configuration (входной сигнал на +), signal path non-inverting → OK.
- **QUESTION**: материал-зависимость. Дерево заваливает ВЧ сильнее камня; стекло яркое; кость глухая. Фиксированная pre-emphasis curve не универсальна (см. C9 в `50_contradictions_and_todos.md`). Это остаётся MINOR — решается pre-emph банком переключаемых C (3 позиции: 2к/4к/8к), +2 компонента.

**Рекомендация**:
- **Оставить as-is** для v1 — работает для усреднённого материала.
- Для v2 — **switchable pre-emph corner** (3 cap banks), match с de-emph переключателем в парe.
- Use **C0G/NP0 1нФ** ceramic caps для temperature stability (thermal drift ±30ppm/°C vs X7R ±15% over temperature).

## Блок 4. Driver Amp + Push-Pull — **MAJOR**

**Intent**: усилить сигнал до уровня, достаточного для возбуждения surface exciter DAEX25FHE-4 (4Ω, RMS ~5Вт).

**Topology (corrected)**: U1B (TL072) gain 4.7× (47к/10к feedback) → RV_DRIVE 100к log → R5 100Ω base current limit → Q1 BD139 (NPN) + Q2 BD140 (PNP) push-pull emitter follower → R6/R7 10Ω эмиттерные резисторы → C_DC 220µФ DC-блок → **R8 4.7Ω current limit** → J_EX.

> **Revision note**: R8 4.7Ω не был в брифе v2.1, но присутствует в каркасе (секция 4). Это current limiter в exciter path — изменяет power budget и thermal analysis. См. `13_schematic_cross_reference.md` C3.

**Parts**: BD139/140 (TO-126, Ic 1.5А, Pd 12.5Вт), TL072 U1B, RV_DRIVE 100кΩ log, C_DC 220µФ/25В electrolytic, R6/R7 10Ω 0.5Вт, **R8 4.7Ω 2W wirewound (должен быть power resistor)**.

**Noise/signal (corrected)**:
- **Эффективная нагрузка с R8**: 4Ω exciter + 4.7Ω R8 = **8.7Ω** total.
- Gain U1B 4.7× + RV_DRIVE — общий gain на full CW до ~47×. Для line-level (±1В peak) — до ±12В, в ограничении TL072. **OK для намеренного перегруза**.
- Push-pull на эмиттерных follower-ах вносит crossover distortion — нелинейность на переходе через ноль (отсутствие Vbe compensation).
- **Peak power на exciter**: при ±12В rail → Vpp=22В → Vrms=7.8В. P_exciter = Vrms² × R_exciter / Z_load² = 7.8² × 4 / 8.7² = **~3.2Вт peak** (не 15Вт из оригинального расчёта).
- **Power dissipation в R8**: P_R8 = Vrms² × R8 / Z_load² = 7.8² × 4.7 / 8.7² = **~3.8Вт**. Это **значительно** для 1/4W резистора — **R8 должен быть 5W wirewound** (или 2× 10Ω 2W parallel).

**Failure modes**:
- **MAJOR (unchanged)**: **нет bias для Q1/Q2**. Push-pull без bias = class B с crossover distortion. Добавить 2×1N4148 между базами для class AB.
- **MAJOR (corrected)**: C_DC 220µФ на эффективную нагрузку 8.7Ω → fc = 1/(2π × 8.7 × 220µФ) = **83Гц** (не 180Гц как я считал раньше). Басы проходят лучше, но suboctave 20–80Гц всё ещё режется.
- **MAJOR**: R8 **должен быть power resistor**. Если на PCB стоит 1/4W резистор — он сгорит за секунды при full drive. Это BOM specification issue — если не проверено, первый прототип burn out.
- **MAJOR**: тепловая нестабильность BD139/140 — без теплового контакта уходят в thermal runaway при долгом перегрузе. R8 снижает максимальный ток через транзисторы (Imax = 12/8.7 ≈ 1.4А, peak), что помогает, но не устраняет.
- **MINOR (updated)**: BD139/140 теперь более оправданны с R8 — 1.4А peak, Pd около 3Вт на транзистор при sustained drive. Менее мощные (BD135) на грани.
- **QUESTION**: R8 также служит **short-circuit protection**. Если exciter short (провод оторвался), ток ограничен R8: Imax = 12/4.7 = 2.5А — транзисторы выживают.

**Рекомендация**:
- **Specification R8**: 4.7Ω **5W wirewound** (Panasonic ERG-5SJ или аналог) — обязательно. Не 1/4W.
- Добавить bias: 2×1N4148 в serial между базами Q1 и Q2 через R 1к к VCC — потекут ~1мА. Class AB, убирает crossover.
- C_DC 220µФ → 1000µФ для full bass extension (fc становится 18Гц).
- Thermal pad 10×10мм под каждым транзистором, соединить с GND plane.
- Для v2 рассмотреть **IRF510+IRF9510** MOSFET pair — меньше distortion, нет biasing issue.

## Блок 5. Feedback Summing + Freeze — **BLOCKER**

**Intent**: суммировать входной сигнал с сигналом, возвращённым по feedback-петле; переключатель Freeze отключает вход, оставляя 100% feedback — бесконечный резонанс.

**Topology**: U4A TL074 инвертирующий сумматор. Входы: прямой сигнал (от буфера), feedback с выхода wet-tract, sidechain. SW_FREEZE (SPDT) в нормальном положении пропускает вход, в freeze — отключает. RV_FEEDBACK 100к log в feedback-пути. D_LIM1/D_LIM2 1N4148 в feedback loop как лимитеры.

**Parts**: U4A TL074, R_FS1/2/3 47кΩ (summing inputs), RV_FEEDBACK 100кΩ log, D_LIM1/D_LIM2 1N4148, SW_FREEZE SPDT on-on.

**Noise/signal**:
- Summing junction на virtual ground — шумовой пол определяется feedback resistor (47к × 4 входов параллельно ≈ 12к эквивалент).
- TL074 на 12к → voltage noise ~18нВ/√Гц × √(20кГц BW) ≈ 2.5µВ RMS ≈ -110dBV. Прилично.

**Failure modes — критические**:
- **BLOCKER**: топология Freeze↔лимитер не специфицирована (см. C5 в 50_). Если SPDT разрывает сигнальную точку до summing node, а лимитер в feedback loop, то при freeze работает только loop + limiter. 1N4148 Vf ≈ 0.6В — ограничение сигнала на ±0.6В = **-4dBu**. В freeze выход будет тихим и пережатым.
- **BLOCKER**: стабильность loop. В петле последовательно: driver → exciter → **физическая пластина с Q 100–1000** → piezo → preamp ×23 → ... → feedback → обратно. Общий loop gain может легко превысить 1 на резонансной частоте пластины. Лимитер предотвращает рост амплитуды, но не частотную нестабильность — на некоторых материалах получится oscillation на резонансе плюс сатурация, без управляемого decay.
- **MAJOR**: SW_FREEZE как SPDT переключает между "normal + feedback" и "100% feedback". Но если нет buffer между переключателем и summing node, переключение даст механический клик (transient) на выходе.
- **MAJOR**: feedback tap point не указан. Откуда возвращается сигнал — с выхода VCA? с post-tone? с pre-tone? Разные варианты дают разный характер feedback.
- **QUESTION**: 100к log feedback pot — при 90% поворота loop gain растёт резко. Для управляемости лучше reverse-log или линейный с последовательным trimmer.

**Рекомендация**:
- **Порядок Freeze/Limiter**: разместить лимитер в самом feedback loop (после RV_FEEDBACK, перед summing), до SW_FREEZE. Тогда в freeze-режиме циклирует уже limited signal, но не накапливает клиппинг при новом проходе.
- **Стабильность**: добавить HPF 100Гц в feedback path — срезать low-end, где физический резонатор имеет максимальный Q и риск oscillation.
- **Freeze click**: добавить C 100нФ на переключаемый контакт — сгладит переход.
- **Feedback tap**: забирать с pre-tone, перед tone filter — так tone control не влияет на feedback loop, только на output.
- **Лучшая топология лимитера**: заменить hard-clip 1N4148 на back-to-back LED (vf ~1.8В, более мягкий soft-knee) или JFET-ограничитель. Hard clip в feedback звучит неприятно.
- **Симуляция loop stability**: до прошивки PCB прогнать LTSpice модель с подставленным физическим резонатором как RLC (R low, L and C дают резонанс на ~500Гц для деревянной пластины). Проверить Nyquist.

## Блок 6. Sidechain Input

**Intent**: внешний вход для возбуждения резонатора параллельно основному сигналу — для патчей, где reverb возбуждается одним источником (кик), а модулируется другим.

**Topology**: J_SIDE jack → C_SIDE → U4B TL074 gain -1 (инвертор) → R_SIDE_MIX → подмешивается в FB summing node.

**Parts**: J_SIDE 3.5мм, C_SIDE AC-coupling, U4B TL074, R_SIDE_MIX значение не указано.

**Failure modes**:
- **MINOR**: инжекция в FB summing node означает, что sidechain попадает в loop. При высоком RV_FEEDBACK внешний сигнал будет циркулировать и нарастать — поведение непредсказуемое при agressive patch.
- **MINOR**: gain -1 означает, что sidechain подмешивается с обратной фазой относительно главного сигнала. Если sidechain и main — один и тот же источник (тест), получим фазовую отмену.
- **QUESTION**: 5 компонентов (cap, 2×R, ОУ половинка, jack) на редко используемую фичу. Стоит ли этого? Если оставить, добавить attenuator по sidechain.

**Рекомендация**:
- Добавить RV_SIDE level pot (5кΩ линейный) вместо фиксированного R_SIDE_MIX.
- Инжектировать sidechain **перед** main summing node (в отдельный буфер), а не в feedback loop. Это отделит "возбуждение" от "регенерации".
- Если в BOM дефицит — вырезать эту фичу, освободить ~5 компонентов и место на панели.

## Блок 7. Exciter → Резонатор — **MAJOR**

> **Revision note**: power budget был скорректирован после учёта R8 4.7Ω в блоке 4. Exciter получает ~3Вт peak, не 15Вт. См. `13_schematic_cross_reference.md` C4.

**Intent**: передача усиленного аудиосигнала на surface exciter, который механически вибрирует пластину.

**Topology**: C_DC 220µФ → **R8 4.7Ω** → J_EX (JST 2-pin) → кабель картриджа → DAEX25FHE-4 exciter, закреплённый на face A пластины.

**Parts**: Dayton DAEX25FHE-4 (25мм, 4Ω, 40Вт max, 20Вт RMS, Fs ~400Гц, резонанс ~2500Гц), JST-XH 2-pin, кабель 50–80мм.

**Noise/signal (corrected)**:
- **Peak power на exciter** с R8: ~3.2Вт (расчёт в блоке 4). Peak ~8Вт при резонансе exciter'а (где импеданс растёт).
- **Avg power**: ~0.5–1Вт continuous reverb usage.
- **Thermal**: при 1Вт avg DAEX25FHE-4 voice coil нагревается незначительно. **Sustainable** long-term operation. Моё предыдущее замечание "перегреется за минуты при 15Вт RMS" было преувеличением из-за неучёта R8.
- **Bass coupling** с R8: C_DC 220µФ × 8.7Ω = **fc 83Гц** (corrected).

**Failure modes**:
- **MAJOR (unchanged)**: DAEX25FHE-4 имеет собственный резонанс ~2500Гц. На этой частоте импеданс растёт до ~20Ω, передача другая — частотная характеристика не flat. Нужен EQ-correction или принять характеристику как "часть звука".
- **MAJOR (updated)**: с плотными пластинами (мрамор, нефрит, бетон — массы 40–70г) exciter испытывает высокую реактивную нагрузку. С ограниченной мощностью 3Вт peak (due to R8) эффективная передача в плотный материал низкая. Может потребоваться либо **уменьшить R8 до 2.2Ω** для плотных картриджей, либо переход на **DAEX32Q-4** (32мм, 4Ω, 40Вт RMS).
- **MAJOR**: крепление exciter к пластине — самоклеящийся диск. Через 6–12 месяцев клей может ослабнуть. Для сменных картриджей нужно многоразовое крепление (винт через резиновую прокладку, магнит).
- **MAJOR (updated)**: C_DC 220µФ даёт corner **83Гц** с нагрузкой 8.7Ω — низкий bass 20–80Гц режется перед exciter. Для plate reverb дерева/стекла это малозаметно (basic tones выше 200Гц), для мрамора/бетона (fundamental 80–150Гц) это слышится как "нет низа".
- **MINOR**: JST-XH 2-pin — OK для 2А peak. В мобильной среде — риск отсоединения.

**Рекомендация**:
- C_DC 220µФ → **1000µФ** (corner 18Гц) — полное bass extension.
- Для плотных материалов — **R8 2.2Ω** (reduces current limit, increases power to 6Вт peak) или **DAEX32Q-4**.
- Exciter крепить через винт M3 + резиновый uncoupler (виброизоляция от рамки картриджа).
- JST заменить на **mini-XLR 3-pin** или аналогичный аудио-грейд коннектор (signal + ground + shield).

## Блок 8. Solenoid Damper — **MAJOR** (понижено с BLOCKER после revision)

> **Revision note**: мой первоначальный разбор этого блока содержал material error — я интерпретировал делитель как R_DAM1=100к serial + R_DAM2=10к pulldown → ratio 0.09. Каркас `wood_reverb_logical_schematic.html` (секция 14) показывает правильную топологию: R_DAM1 100к serial, R_DAM3 100к pulldown, R_DAM2 10к в серии к gate. См. `13_schematic_cross_reference.md` C1.

**Intent**: CV-управляемое механическое приглушение пластины через соленоид с фетровым наконечником. При активации соленоид прижимает фетр к пластине, убивая резонанс.

**Topology (corrected)**:
```
J_CV_DAMP ── R_DAM1 (100kΩ) ──┬── R_DAM2 (10kΩ) ── Gate Q5
                               │
                          R_DAM3 (100kΩ pulldown)
                               │
                              GND
```

**Parts**: Q5 2N7000 (Vds 60В, Id 200мА, Vth typical 2.1В, range 0.8–3В), соленоид 5В ~300мА, D_SOL 1N4001 flyback, JST 2-pin.

**Divider analysis (corrected)**:
- Voltage at node X (после R_DAM1, перед R_DAM2) = V_CV × R_DAM3 / (R_DAM1 + R_DAM3) = V_CV × 100k/200k = **V_CV × 0.5**.
- Gate voltage ≈ V(X) (R_DAM2 10кΩ current-limiting к gate input impedance ~10^13Ω — pad-дорожки добавляют несколько пФ, но нет DC drop).

| CV input | V_gate | vs Vth(2.1В typ) | Turn-on status |
|----------|--------|-------------------|----------------|
| 5 В (стандарт Eurorack) | 2.5 В | +0.4В margin | **Marginal** — работает для typical 2N7000, на границе для low-Vth exemplars |
| 8 В | 4.0 В | +1.9В margin | OK |
| 10 В | 5.0 В | +2.9В margin | OK, reliable |
| 12 В | 6.0 В | +3.9В margin | OK, но приближается к Vgs max 20V |

**Noise/signal**:
- **Switching transient**: при коммутации 300мА через индуктивность соленоида (~10мГн) dI/dt создаёт ЭДС самоиндукции. Flyback 1N4001 клампит до Vcc+0.7В. Но магнитное поле соленоида излучается наружу.
- **Магнитное поле**: ЭДС наводится на соседний проводник ∝ dI/dt × M. С 10МΩ JFET gate в 50мм через unshielded JST — микровольтовые пики, усиливаемые в преампах ×23.

**Failure modes**:

- **MAJOR**: **marginal turn-on при CV 5В**. Если пользователь подключает LFO Eurorack с peak 5В, Vth spread 2N7000 (0.8–3В в datasheet) означает, что в ~15% экземпляров транзистор не будет надёжно открываться. Производственная lottery.
- **MAJOR (unchanged)**: коммутация 200–500мА через соленоид создаёт **импульсные помехи на пьезо-линиях** из-за EMI связи через unshielded JST. Это сценарий, где "щёлк демпфера" будет громче, чем полезный сигнал реверба. **Первичный noise risk проекта** (см. блок 9 и СП3).
- **MAJOR**: если соленоид управляется PWM (для плавного damping), частота ШИМ (1–20кГц) попадёт прямо в аудиодиапазон.
- **MINOR**: пульдаун R_DAM3 100к на node X — OK, удерживает MOSFET закрытым при floating CV.
- **QUESTION**: физически "2мм зазор до face A" с фетровым наконечником — как обеспечить репитабельное позиционирование при смене картриджа? Если каждая пластина имеет разную толщину (3–5мм), зазор будет плавать. Нужен spring-loaded соленоид или механизм юстировки.

**Рекомендация**:
- **Уменьшить R_DAM1 до 47кΩ** — divider становится 100/147 = 0.68, gate на CV 5В = 3.4В (solid turn-on для всех 2N7000). Одна деталь изменить.
- **Или**: заменить 2N7000 на **logic-level MOSFET** — AO3400 (Vth 0.7–1.3В, SMD), IRLZ34N (Vth 1–2В, TO-220). Тогда даже CV 5В × 0.5 = 2.5В — много выше Vth.
- **EMI (независимо от turn-on issue)**:
  - Экранировать соленоид ферритовой оболочкой или заземлённым медным кожухом.
  - Кабель соленоида — витая пара, прижатая к GND.
  - Физически отделить соленоидный драйвер и его кабель от пьезо-кабелей на PCB (минимум 30мм), провода на кабельном жгуте по разным сторонам.
  - Pulse-mode only — исключить PWM, использовать только полное on/off. Если нужен плавный damping — аналоговый drive (op-amp + transistor как current source).
- **Соленоид с pre-loaded spring**: решить проблему зазора при смене пластин.
- **Альтернатива**: заменить соленоидный демпфер на **электронный mute** (MOSFET в сигнальном пути), если механический damping не критичен. Потеряется perceptual "физический" характер, но устранится большой источник шума.

## Блок 9. Dual Piezo + JFET Preamps — **BLOCKER**

**Intent**: снять резонансный сигнал с пластины двумя пьезо-датчиками (разные позиции → разный тембр), усилить в низкошумных JFET-преампах.

**Topology** (на канал):
J_PA (пьезо A) → C_PA 10нФ (AC couple) → R_PA 10МΩ (bias к GND) → gate Q3A 2N5457 (source follower) → source → R_SA 4.7к → C_CA 1µФ → R_BA 4.7к → U3B (или U4C) неинвертирующий усилитель с gain = 1 + 22к/1к = **+26dB (23×)**.

**Parts**: Q3A/Q3B 2N5457 (TO-92, N-channel JFET, Idss 1–5мА, Vp -0.5 to -6В), R_PA/PB **10МΩ** gate bias, TL074 preamp stages.

**Noise/signal**:
- Источник — пьезо-диск 27мм, Zout ~1–10МΩ на НЧ, ~100кΩ на ВЧ. Сигнал 10–100 мВ peak.
- JFET source follower с Zin 10МΩ → Avd ≈ 0.9. Преамп gain +26dB = 23×. **Суммарный gain блока = 23× = +27dB**.
- Noise floor JFET 2N5457: en ~10 нВ/√Гц. С добавкой R_PA 10МΩ — Johnson noise резистора = √(4kT × R × BW) = для 10МΩ × 20кГц = **1.8 мкВ RMS = -115 dBV**. Это уже в слышимом диапазоне при последующем усилении.
- После gain +27dB: noise floor на выходе преампа = 1.8µВ × 23 = 40µВ = **-88 dBV**. Для line-level (+4dBu = 1.23В) это SNR ≈ 90dB — приемлемо.

**Failure modes — критические**:

- **BLOCKER**: **2N5457 EOL** (End of Life). ON Semi сняли с производства. NOS запасы истощаются. Цена растёт с $0.5 до $2–5 за штуку, ненадёжные поставщики подделывают. Любой серьёзный проект должен быть спроектирован на доступный аналог.

Возможные замены:
| Part | Notes | Idss | Vp | Drop-in |
|------|-------|------|-----|---------|
| J201 (Fairchild) | Discontinued тоже | 0.2–1мА | -0.3 to -1.5 | Нет (разное Idss) |
| MMBFJ201 (SMD) | SMD версия J201, в производстве | 0.2–1мА | -0.3 to -1.5 | Нет (разное Idss) |
| 2SK170 (Toshiba) | EOL, но много NOS | 2.6–20мА | -0.2 to -1.5 | Нет (gm выше, нужен пересчёт) |
| LSK170 (Linear Integrated Systems) | В производстве, ultra-low noise | 2.6–20мА | -0.2 to -1.5 | Drop-in для 2SK170 |
| LSK489 (LIS, dual) | В производстве, dual матched | Зависит от гру | - | Требует редизайн, но лучшее решение |

Рекомендуется **LSK170B** (single) или **LSK489** (dual matched в одном корпусе — идеально для dual-piezo симметричных каналов). LSK489 стоит ~$5–8, но решает проблему подбора и matching.

- **BLOCKER**: 10МΩ gate bias + открытый JST коннектор + соседний соленоид = **антенна для EMI**. Каждый мкВ наведённой помехи усиливается на 27dB. В радиусе 100мм от работающего соленоида получим шум в 20–40dB выше полезного сигнала.

Смягчение:
- Экранированный коннектор (как в блоке 7 — mini-XLR).
- Снижение R_PA до 1МΩ (потеря НЧ extension, но gain/noise приемлемо).
- Guard ring вокруг gate-тракта на PCB (охватывающий gnd pour).
- Все piezo signal paths — под GND shield, не пересекать с solenoid driver.

- **MAJOR**: 2N5457 Idss разбр 1–5мА (5×!). Два JFET в dual-piezo — почти наверняка с разным bias, значит gain у двух каналов будет отличаться. Position crossfade будет давать ещё и изменение уровня, не только тембра.
- **MAJOR**: gain +27dB сразу после JFET — большое усиление в одной стадии. Шум резисторов feedback (22к vs 1к) существенный: 22к даёт ~19 нВ/√Гц, плюс voltage noise TL074 18 нВ/√Гц → доминирующий шум преампа.
- **QUESTION**: C_CA 1µФ на выходе source follower создаёт HPF с R_BA 4.7к → fc = 34Гц. OK, но серийное включение C_PA 10нФ + R_PA 10МΩ → fc = 1.6Гц (OK). Вместе — минимум на 34Гц, что для реверба приемлемо (ниже тёплых басов мрамора).

**Рекомендация**:
- **Перейти на LSK489** (dual JFET, matched). Единственный путь к repeatable production.
- Экранировать piezo кабели.
- Добавить guard ring на PCB вокруг gate trace.
- Уменьшить gain одной стадии до ×5, добавить вторую стадию ×5 с лучшим шумом (OPA1642 на feedback), суммарно ×25. Разнесение gain уменьшит шумовой вклад первой стадии.
- Добавить тест-пин для замера Idss каждого JFET при сборке — подобрать в пары по Idss.

## Блок 10. Position Crossfade

**Intent**: плавный кроссфейд между сигналом с piezo A (ближний, яркий) и piezo B (дальний, диффузный). Создаёт тембральный эффект "где на пластине слушать".

**Topology**: RV_POSITION 100кΩ dual-gang (два потенциометра в одном корпусе, один крутится, оба ползунка движутся синхронно). Piezo A через R_XA (10к) → ножка 1 RV_POSITION; Piezo B через R_XB (10к) → ножка 3; ползунок → U4D суммирующий усилитель.

**Parts**: RV_POSITION dual-gang 100кΩ lin, Alpha 9mm vertical, R_XA/XB 10к, R_XS1 47к feedback, U4D TL074.

**Noise/signal**:
- Dual-gang 100к — standard в синтезаторной индустрии, но **matching между секциями редко лучше 10%**. Это означает crossfade не будет equal-power — в центре будет небольшой dip или boost.
- Тембральное различие A vs B зависит от физики пластины (см. `11_last_night_acoustic.md`). Если оба датчика одинаковые (27мм пьезо) и пластина маленькая (100мм), различие тонкое.

**Failure modes**:
- **MINOR**: dual-gang pot matching. Для crossfade критично, иначе center-position не neutral. Рекомендация — использовать digital pot (TPL0102, ±1% matching) или два отдельных pot с координированными ручками (не идеально).
- **MINOR**: 100к lin для crossfade даёт линейный law; для equal-power crossfade нужен logarithmic. Можно компенсировать tapering resistor (resistor to wiper midpoint).
- **QUESTION**: эффект тонкий при одинаковых датчиках. Рекомендация выше (см. `50_`, C11) — разные датчики на A и B (пьезо 20мм + PVDF, например) дают заметное тембральное различие, оправдывают отдельный pot на панели.

**Рекомендация**:
- Оставить dual-gang 100к для v1 (простота).
- Для v2 — digital pot управляемая CV для автоматизации crossfade во времени.
- Разные датчики — да, обосновывает position control.

## Блок 11. De-emphasis EQ — **MAJOR**

**Intent**: зеркало pre-emphasis (блок 3), компенсация ВЧ boost'а, применённого до exciter.

**Topology**: U4C (или U3B) с shelving cut через R_DE1 (10к), C_DE1 (1нФ), R_DE2 (22к).

**Parts**: R_DE1 10кΩ, **C_DE1 1нФ** (ДОЛЖЕН совпадать с C_PE1), R_DE2 22кΩ.

**Failure modes**:
- **MAJOR**: **та же проблема corner** как в блоке 3. При C=1нФ × R=10к corner = 15.9кГц, не 3.2кГц. Если pre-emphasis даёт boost на 16кГц, de-emphasis режет на 16кГц — симметрия работает, но эффекта в слышимом диапазоне (до 10кГц) нет.
- **MAJOR**: если pre и de использует **одинаковые номиналы** (1нФ + 10к), шумят оба узла одинаково, но шум НЕ коррелирован → складывается на +3dB. Лучше схема, где pre-emphasis и de-emphasis оптимизированы для разных этапов (pre — мощный boost без шума; de — cut с высокой Z после pickup).
- **MINOR**: R_DE2 22кΩ задаёт shelving depth (макс cut). Без RV_CUT (нет pot для de-emphasis) это фиксированный cut — не регулируется под разные пластины.

**Рекомендация**:
- Поменять C_PE1 и C_DE1 на 4.7нФ (corner 3.4кГц, matches заявленное).
- Или R на 47к.
- Добавить trimmer (не pot на панели) для de-emphasis depth — tune на этапе сборки под exciter/piezo pair.
- Если pre-emphasis переключаемый (рекомендовано в блоке 3 для материал-адаптивности), de-emphasis должен следовать — один и тот же переключатель banks capacitors для обеих стадий.

## Блок 12. Tone LPF + LED Clipper

**Intent**: выходной тонконтроль (cutoff на низкочастотный LPF) + мягкий клиппинг на LED для защиты последующих каскадов от пиков.

**Topology**: U2A TL074 с R_TF 1к → RV_CUTOFF 100кΩ → C_TF 10нФ (1-pole LPF). Диапазон cutoff: f = 1 / (2π × R × C), R от 1к до 101к, C=10нФ → **fc от 158Гц до 15.9кГц** (заявлено, подтверждается).

После LPF: R_CL 1к → D1/D2 LED Red back-to-back → CLIP_NODE.

**Parts**: U2A TL074, RV_CUTOFF 100к lin, C_TF 10нФ, D1/D2 LED Red (Vf ~1.8В).

**Noise/signal**:
- 1-pole LPF достаточен для tone control (6dB/oct). Не фильтр для удаления высокочастотных помех.
- LED clipper: Vf LED Red ~1.8В. Signal ограничивается на ±1.8В peak = ~3.6Vpp = **+1.2 dBu**.

**Failure modes**:
- **MAJOR**: **LED clipper порог +1.2dBu слишком низкий** для line-level сигнала (+4 dBu nominal, +20 dBu peak). Это означает, что нормальный сигнал будет клиппиться все время. Или tone filter должен иметь attenuation, или LED нужны с более высоким Vf (3× красных = 5.4В → ограничение ±5.4В = +10.6 dBu, более разумно), или заменить на zener 12В (ограничение ±12.6В = +20 dBu — нормально).
- **MAJOR**: LED как clipper = визуальный индикатор (задумано). Но на столь низком пороге LED будет светиться постоянно — потеряет функцию "clip detection".
- **MINOR**: 10нФ cap — ceramic X7R или film. X7R C0G (NP0) желательно для стабильности.

**Рекомендация**:
- Заменить D1/D2 на серию 3 LED с каждой стороны (±5.4В порог) или использовать back-to-back 1N4148 (ограничение мягче но ниже, ±0.6В — тоже проблема).
- Лучший вариант: **два anti-parallel 1N4007** в цепи feedback ОУ с ограничением на выходе (soft-clip в ОУ с feedback diode pair) — классическая Tube Screamer схема.
- Отдельный индикатор clip — LED + компаратор на пороге +6 dBu.

## Блок 13. Attack/Decay VCA — **MAJOR**

**Intent**: envelope-follower получает амплитуду входного сигнала, задает CV для OTA VCA, таким образом wet-сигнал реверба следует за динамикой input'а — громкие ноты → больше реверба, тихие → меньше.

**Topology**:
- **Envelope follower**: D_EF (rectifier diode) → RV_ATTACK 1МΩ → C_ENV 1µФ → RV_DECAY 1МΩ → signal ground. Напряжение на C_ENV = envelope.
- **VCA**: U5 LM13700 OTA1, control current Iabc задаётся envelope через resistor, wet-сигнал проходит через OTA.
- **CV input**: J_CV_DECAY даёт внешний контроль decay time.
- OTA2 не используется (**входы на GND** — заявлено).

**Parts**: LM13700 DIP-16, D_EF 1N4148, RV_ATTACK/DECAY 1МΩ, C_ENV 1µФ electrolytic.

**Noise/signal — расчёт constant**:
- Attack constant: τ_a = R_A × C = 1МΩ × 1µФ = **1 секунда**.
- Decay constant: τ_d = R_D × C = 1МΩ × 1µФ = **1 секунда**.

Это **максимум** диапазона, при повороте pot в CW. Для CCW (R=0) — мгновенно. Линейный потенциометр даёт линейный R, так что центр ручки — ~500к, τ = 0.5с.

**Failure modes**:
- **MAJOR**: **диапазон 0–1с смещён в медленные времена**. Музыкально полезный attack — 1–50мс, decay — 10мс–10с. Текущая схема:
  - Attack: либо мгновенно (0 сопротивление), либо очень медленно (→1с). Середина plastic — плохо управляемая.
  - Decay: OK, но начало диапазона (0.01с) недостаточно коротко для резкого cutoff.
- **MAJOR**: **одна ёмкость C_ENV для attack и decay**. Это даёт следующее поведение: при быстрой атаке кап заряжается быстро, при медленной — медленно. Classic envelope follower. Но ratio A/D жёстко связан геометрией resistor paths. Настройка независимых A и D требует **двух диодов** (один пропускает зарядный ток через R_A, другой разрядный через R_D) — не упомянуто в схеме.
- **MAJOR**: OTA2 не используется. **Это потерянный ресурс** — вторая OTA могла бы быть VCA для noise generator (плавный mix), или второй VCA в stereo chain, или LFO output. Просто подвесить входы на GND — расход BOM на ничего.
- **MINOR**: LM13700 Iabc через R на +12В задаёт gain range. R не указан в описании. Типично R=30к даёт Iabc 0.5мА → gm ≈ 10мА/В.
- **QUESTION**: линейность OTA-VCA — LM13700 имеет distortion ~0.5% на номинальном signal (~50мВ peak). Для wet-сигнала реверба это приемлемо, но не audiophile.

**Рекомендация**:
- **Добавить диоды в envelope follower**: D_A → R_A → C, и D_D — C → R_D. Независимые A/D. +2 диода, серьёзно улучшит управляемость.
- **Уменьшить C_ENV до 220нФ** и **уменьшить R до 220к**. τ max = 48мс — в диапазоне attack. Для decay — добавить вторую ёмкость 1µФ через switch (short attack + long decay в LFO-стиле envelope).
- **OTA2 использовать** для stereo (VCA на piezo B channel) или для modulation (LFO output к feedback loop).
- **Альтернатива**: заменить LM13700 на **SSM2164** (quad VCA) или **THAT2180** (professional VCA). Оба имеют линейность <0.05%. Но цена ×3 и шум меньше.
- **Gate vs envelope**: envelope follower — правильный выбор для реверба (естественное dynamic sculpting). Альтернатива ADSR с внешним gate — лучше для perc, но хуже для ambient pad.

## Блок 14. Mix + Stereo Output

**Intent**: суммирование dry + wet + noise + CV; переключаемый mono/stereo выход. В mono режиме A+B суммируются, в stereo — A→L, B→R.

**Topology**: U2D инвертирующий сумматор. Входы: R_MD 47к (dry), RV_MIX + R_MW (wet), RV_NOISE + R_MN (noise, 100к), R_MCV (CV). Feedback R_MFB 47к. Output → C_OUT 1µФ → R_OUT 1к → J_OUT_L. Stereo через normalling J_OUT_R.

**Parts**: U2D TL074, R_MD/MW/MFB 47к, R_MN 100к, RV_MIX/NOISE 100к log, C_OUT 1µФ film.

**Noise/signal**:
- Summing junction — virtual ground, шум определяется source resistors. 4 входов по 47–100к → Req ~12к, Johnson noise ~14 нВ/√Гц. С TL074 voltage noise 18 нВ/√Гц → суммарный шум ≈ 23 нВ/√Гц. В 20кГц BW → 3.3 мкВ RMS = -108 dBV.
- Unity gain в номинале (47к/47к), wet может давать boost до 100к/47к = 2×.
- C_OUT 1µФ × R_OUT 1к → fc = 160Гц (HPF ниже output) — удаляет DC offset (нормально).

**Failure modes**:
- **MINOR**: 6 резисторов стерео-тракта (R_SL, R_SR, R_DL, R_DR, R_SLF, R_SRF) мёртвый груз если mono primary (см. C10). Для педальной версии убрать, для Eurorack — оставить.
- **MINOR**: R_OUT 1к — OK для Eurorack, но для драйва длинных педальных кабелей лучше 100Ω (больше current drive, меньше pickup помех на ёмкостную нагрузку).
- **QUESTION**: отсутствует HPF на выходе (как отмечено пользователем в "Things that might be under-engineered"). Большие плиты генерируют sub-40Гц резонансы, которые могут overload downstream amps. Добавить пассивный HPF на выходе (C 0.47µФ + R 10к → fc 34Гц) — 2 компонента, много защиты.

**Рекомендация**:
- Для педальной версии: убрать stereo paths, оставить mono.
- Добавить HPF 34Гц на выходе (2 компонента).
- Output jack через buffer (emitter follower на BC547) — улучшит drive длинных кабелей.
- Indicator LED на выходе сигнала (уровень клиппинга / нормального sigma) — полезный UX.

## Блок 15. Noise Generator — **MAJOR**

**Intent**: источник шума для имитации "счётчика Гейгера" (пост-апокалиптический треск), подмешиваемый в wet-тракт через mix.

**Topology**: Q4 BC547 с **обратно смещённым переходом B-E** → avalanche breakdown → шум → U2C TL074 gain ×100 (1МΩ/10кΩ) → RV_COLOR 100к + C_COL 10нФ (LPF для color) → RV_NOISE 100к для level → mix.

**Parts**: Q4 BC547 NPN, U2C TL074, RV_COLOR/NOISE 100к log, C_COL 10нФ.

**Noise/signal**:
- BC547 reverse B-E breakdown — классический "poor man's zener noise source". Breakdown voltage ~7–9В, шум white-ish с некоторым розовым shape.
- Voltage output BC547 avalanche ~100 мкВ peak. После gain ×100 = 10мВ peak. Приемлемо для mix-in.

**Failure modes**:
- **MAJOR**: **BC547 reverse breakdown не specified в datasheet**. BC547 рассчитан на Vbe forward, не reverse. Разброс breakdown voltage между экземплярами ±20%. Шум меняется от транзистора к транзистору радикально.
- **MAJOR**: **деградация со временем**. Reverse avalanche постепенно разрушает переход. Через 1000+ часов работы шум падает, характер меняется. Это не теоретическая проблема — хорошо известная ограничение зенер-шумогенераторов на BJT.
- **MINOR**: требуется напряжение >9В reverse на B-E. Если питание BC547 ±12В, OK. Но нужен бластер current limiter (100к+) иначе ток avalanche деградирует переход быстро.
- **QUESTION**: 11 компонентов на функцию "Geiger counter noise". Пользователь отметил (в разделе "over-engineered"), что шум-генератор может быть избыточен.

**Рекомендация**:
- **Заменить BC547 avalanche на specified zener noise source**: BZX55C9V1 (9.1В zener) reverse-biased through 100к. Параметры noise specified, стабильность лучше.
- **Или**: MMBZ5231B SMD zener (5.1В) с post-amp gain — компактнее.
- **Ещё лучше**: **LFSR pseudo-random digital noise** через ATtiny85 + DAC — полная управляемость, стабильность, можно добавить паттерны Гейгера (non-uniform, cluster events). Но добавляет цифровой элемент в аналоговую систему.
- **Минимально**: оставить BC547, но добавить trimmer для подстройки reverse voltage → noise level, и принять батч-вариацию как часть характера.

---

**Где "Гейгер" эффект**: чисто аналоговый белый шум не звучит как Гейгер. Для классического геигер-треска нужна **стохастическая последовательность кликов** с плотностью event rate. Это делается:
1. Cvoltageoltage compar of noise source → производит gate при превышении threshold,
2. Gate → short pulse (one-shot) → attenuator → mix.

То есть блок 15 должен быть **noise → comparator → pulse → audio**, а не просто noise. Если цель "Гейгер" — текущая топология даёт **шипение**, не **треск**.

**Рекомендация**:
- Добавить comparator (LM393 или compар в TL074) после noise amp.
- Pulse shaper (one-shot на 555 или RC + Schmitt trigger).
- Rate control через threshold pot — контроль density (редкие одиночные клики vs плотный треск).

Это +3 компонента (compар, two R) и меняет характер значительно. Без этого реальный Гейгер не звучит.

---

## Сквозные проблемы

Проблемы, которые не принадлежат ни одному конкретному блоку, но угрожают всей схеме.

### СП1. Grounding — **MAJOR**

Заявлен **star ground** + GND pour на B.Cu. На 2-слойной PCB 101.6×108мм (20HP × 108мм) это физически **не star**, а скорее "star-like with compromises". Реальные return paths:

- Solenoid driver sink (200–500мА) возвращается через GND pour. Его путь до power ground определяет voltage drop на GND в окрестности piezo preamps.
- Piezo preamps (+26dB gain) чувствительны к GND potential.
- Noise generator high-impedance node может поймать GND bounce.

**Решение**:
- Phys разделить GND на **AGND** (analog) и **DGND** (digital/solenoid switching). Соединить в одной точке у power connector.
- Layout: поместить solenoid driver физически максимально далеко от JFET preamps (противоположные углы PCB).
- GND pour на обеих слоях с via stitching.
- Измерить GND voltage variance в первом прототипе до серийного — критическая верификация.

### СП2. Decoupling — **MINOR**

10×100нФ на 5 IC + LM13700 — OK, но для LM13700 и TL074 рядом с OTA нужен дополнительный **10µФ tantalum или film electrolytic**. 100нФ хорошо на HF помехах, но не на transient current (OTA Iabc switching).

**Решение**: +5× 10µФ electrolytic по питанию IC в паре с существующими 100нФ.

### СП3. Cartridge cable immunity — **BLOCKER**

4 линии от картриджа (EX, PA, PB, SOL) идут по нешилдованному JST-XH в 50–80мм. Piezo lines с Zin 10МΩ + соседняя soleкоид-линия с 200–500мА switching = **худший возможный электромагнитный сценарий**.

**Решение** (критическое):
- Piezo A и Piezo B идут **отдельными экранированными коаксиальными кабелями** (micro-coax, shield к AGND).
- Exciter и solenoid — twisted pair, можно нешилдованный.
- Разделить два жгута физически (10мм+), не в одном пучке.
- Или **заменить JST на аудио-грейд multi-pin** с shield pin и балансированными парами (mini-DIN 8-pin позволяет shield + 4 signal).

### СП4. PCB layout — **MAJOR**

Сигнал течёт "сверху вниз" (Power → Buffer → Driver → FB → Piezo → Tone → VCA → Mix). Это хорошее правило, но с JFET preamp и solenoid в одной зоне — конфликт:

- JFET preamps должны быть в **защищённой зоне** (окружение GND guard, минимум от digital/switching paths).
- Solenoid driver — **отдельная зона** с собственной GND и снятием EMI.
- Driver amp (push-pull) — зона power, с thermal relief.

Эти 3 зоны в 78×110мм (или 101.6×108мм) PCB — тесно. Реалистичное layout требование — **2+ слоя (не 2-слойная FR4, а 4-слойная с dedicated GND plane)**. 4-layer PCB стоит ~2× больше, но решает 80% noise problems.

**Решение**:
- **4-layer PCB** (Signal / GND plane / Power plane / Signal). Удорожание на 30–50% компенсируется надёжностью.
- Размещение: piezo в верхней части (A и B симметрично), exciter driver в нижней (возле power), solenoid в углу (farthest from piezo), noise generator в изолированной зоне.

### СП5. Feedback stability — **BLOCKER**

Feedback loop: driver → exciter → пластина (физический resonator с Q 100–1000) → piezo → preamp ×23 → tone → VCA → [freeze/limiter] → back to summing.

**Проблема**: на резонансной частоте пластины loop gain может быть >1. Лимитер на 1N4148 — мягкий, не обеспечивает истинную стабильность; более чем самовозбуждение контролирует.

**Решение**:
- Сим Nyquist в SPICE с физическим RLC-моделью резонатора.
- Добавить **notch filter** на ожидаемой резонансной частоте в feedback path (tunable, настраивается под каждый картридж).
- Или ограничить max feedback — например, через additional attenuator в loop с максимумом 80%.
- Или добавить clean gain-limiter (VCA с mode "prevent unity gain") — сложно в аналоговой схеме, проще в digital контроллере.

### СП6. Protection — **MINOR**

- Нет input ESD clamp на J_IN.
- Нет fuse по питанию (1N5817 защита только от reverse polarity, не от перегрузки).
- Нет input over-voltage клампа (если случайно попадёт ±15В CV на audio input — TL072 сгорит).

**Решение**:
- 2×1N4148 clamp к rail на каждом input jack.
- Fuseholder на power connector (50мА slow-blow).

### СП7. Serviceability — **MINOR**

- IC в DIP-8 / DIP-14 — **без sockets заявлено**. Если IC сгорит, перепайка прямо на плату. Риск для U5 (LM13700) — чаще всего выгорает из-за неправильного CV. Рекомендация — socket минимум для U5.

---

## Итоги блочного разбора (revised)

**Blockers**: 2 (block 5 stability, block 9 JFET EOL) + 2 cross-cut (СП3 cable shielding, СП5 feedback stability).
**Major issues**: 6 (blocks 4, 7, 8, 13, 15 + СП1 grounding, СП4 layout).
**Minor issues**: 7.

**Рекомендуемый порядок фиксов (revised)**:

1. **Блок 9 JFET replacement** — заменить 2N5457 на LSK489A. Требует пересчёт bias и gain, но избавляет от EOL. Главный блокер проекта.
2. **СП3 cable shielding** — mini-XLR для piezo, JST оставить для exciter/solenoid.
3. **СП5 feedback stability** — SPICE симуляция до прошивки PCB. RLC модель резонатора.
4. **Блок 4 biasing + R8 power rating** — 2×1N4148 bias в push-pull для устранения crossover, R8 обязательно 5W wirewound (не 1/4W).
5. **Блок 8 gate margin** — уменьшить R_DAM1 до 47к для solid turn-on при 5В CV (или logic-level MOSFET).
6. **Блок 7 C_DC** — 220µФ → 1000µФ для low-end extension.
7. **Блок 13 envelope follower** — диоды для independent A/D + уменьшить τ.
8. **Блок 15 noise gen** — замена BC547 на BZX55C9V1 zener для стабильности.

**Важно**: пункты 1, 2, 3 — критические перед первой прошивкой. Без них первый PCB либо не запустится (1), либо выдаст шум громче сигнала (2), либо самовозбудится на резонансе (3).

Пункты 4–8 могут быть отложены на **rev B** после testing rev A.

---

## Revision log

| Дата | Изменение | Причина |
|------|-----------|---------|
| Phase 1 | Initial audit based on v2.0/v2.1 briefs | — |
| Phase 2 (текущий) | Блок 3 MAJOR → MINOR, блок 8 BLOCKER → MAJOR, блок 4/7 corrected power analysis | Появление `wood_reverb_logical_schematic.html` с точной топологией |
