# Decision 07 — Last Night re-spec: «комбайн холодной ночи»

**Дата**: 2026-05
**Статус**: locked (симметричный pair к Decision 06; реконтекстуализирует Last Night под anchor-комбайн-логику)
**Тип**: концептуальный пересмотр модуля + введение «холодного» словаря эффектов

---

## Контекст

Decision 06 зафиксировал, что Last Day и Last Night — два standalone-комбайна (полные коробки эффектов в одной педали), не пара модулей в линейке. Decision 06 переписал Last Day и оставил Last Night под старой каноникой (v2.1 schematic + plate cartridge + 8 ручек на лицевой панели + один tract шумогенератора).

Это создавало **асимметрию**: hot palette Last Day (HAZE / MIRAGE / BLEACH / TAR / CICADA / HEATWAVE) имел в G-таблице зеркальности парные ячейки на Last Night-стороне, но **половина ячеек оставалась пустой** ("—") — у Last Night не было названных антиподов для apериодической модуляции, для high-band-эффекта, для вязкой динамики, для AM-радио-аналога.

Этот документ закрывает асимметрию: вводит **холодный словарь** эффектов Last Night, симметричный hot palette Last Day.

## Что меняется

### 1. Last Night становится standalone-комбайном по той же модели

- **40HP Eurorack-панель + big-box pedal (~203×140мм) на одной PCB, два корпуса**. Бывший формат "20HP Eurorack canonical" (см. `audit/02_system_architecture.md`) — superseded; новая площадь нужна под расширенный perform-словарь и cold palette FX.
- I/O комбинированное: **TRS stereo + RCA stereo параллельно + 3.5мм mini-jack**. Переключатель уровня instrument / -10dBV / +4dBu. Stereo больше не "dead weight" (см. audit C10) — это часть combine-стандарта.
- В pedal-форме — **4 footswitches** (KILL / FREEZE / TOLL / STALL), симметричные паре KILL / FREEZE / CRASH / DRAG в Last Day.

### 2. Repositioning сохраняется: «resonator reverb», не «plate reverb»

Эта часть из v2.1-канона остаётся актуальной. Last Night не имитирует EMT 140 — это **новая категория** physical-resonator reverb со сменными material plates. Combine-логика этому не противоречит, только расширяет вокруг ядра.

### 3. Solenoid double-function: damper + striker

Существующий соленоид (с фетровым наконечником, 2мм spring-loaded gap к face A пластины) использовался только в одном режиме — **damper** (sustained pressure для глушения хвоста). В combine-канон:

- **DAMP mode (existing)** — sustained pressure → reverb tail shortens. Управляется CV DAMP (existing).
- **STRIKE mode (new)** — short impulse pulse (5–10мс) → пластина звенит **как колокол**, независимо от audio input. Один соленоид, два control-режима через driver-logic.

Это позволяет TOLL (strike) и STALL (hold-damp) использовать одну механику.

### 4. Холодный словарь эффектов — симметричный hot palette Last Day

Восемь named-эффектов, каждый имеет физическое основание и парный антипод в Last Day:

| Cold (Last Night) | Hot antipode (Last Day) | Физика / реализация |
|---|---|---|
| **PULSE** | HAZE | Slow periodic LFO (0.05–2Hz) на damper-pressure → reverb tail "breathes" ритмично. "Сердцебиение ночи" |
| **FOG** | MIRAGE | Apериодический drift: noise → S&H (4066) → slow slew RC → damper pressure micro-modulation. Хвост дышит нерегулярно, "туман над руинами" |
| **FROST** | BLEACH | High-band absorber: cold "съедает" верх вместо того чтобы выжигать. State-variable HP filter + voltage-controlled LPF в feedback path → sweep-down ВЧ при усилении эффекта. **Inverse** к BLEACH — там добавляются гармоники в верх, здесь — поглощается воздух |
| **CHILL** | TAR | Expander с brittle release: signal stays separated, не залипает. Quiet stays quiet (no make-up), loud reaches but decays быстро. Анти-TAR — где TAR залипает, CHILL рассыпается |
| **GEIGER** | CICADA | Sparse single ticks: zener noise (BZX55C9V1, уже в v2.1) → comparator → click shaper. Cluster pattern via ATtiny85 LFSR (v2 v2.1 plan сохраняется). Холодный, разреженный, "радиация после события" |
| **HUM** | HEATWAVE | Mains-hum antenna pickup: маленькая ferrite coil (1000 витков, 100мГн) + 50/60Hz-tuned amp → mix. Ловит сетевой hum, switching residue from мёртвой инфраструктуры, lab-equipment whine. "Голос электрических руин". HUM это **то самое WIRE** из старого Last Day-плана, которое теперь нашло свой дом |
| **STALL** | DRAG | Held damper solenoid = forced short decay. Pedal momentary: hold = decay stuck at minimum, release = decay resumes. Footswitch |
| **TOLL** | CRASH | Short solenoid impulse strike on plate = bell-like ring. Тот же actuator, что и DAMP, но в strike-режиме (5–10мс pulse). Plate резонирует независимо от input. Footswitch (red 25мм button в Eurorack-форме) |
| **KILL** | KILL | Mute input, reverb tail продолжает играть и затухать |
| **FREEZE** | FREEZE | Feedback loop locks, контент бесконечно sustainит и деградирует |

### 5. Concept reuse: DUST / WIRE мигрируют сюда, формализованы как GEIGER / HUM

В Decision 06 §"Что переезжает (не теряем)" был TODO: DUST и WIRE удалены из Last Day, целевой модуль не зафиксирован. Decision 07 закрывает этот TODO:

- **DUST → GEIGER** (Last Night) — DUST концепт (sparse static clicks) уже был стилистически родственником noise-генератора Last Night. Теперь это **тот же эффект, с финальным именем GEIGER**, занимающий своё место в cold palette.
- **WIRE → HUM** (Last Night) — WIRE концепт (EM antenna для сетевого hum) теперь HUM в Last Night, парный антипод HEATWAVE (AM-ионосфера) в Last Day.

Это **не дублирование** — это правильное место для холодного EMI-эффекта в общей системной топологии.

### 6. Sidechain input остаётся, перформативно расширяется

Sidechain input v2.1 канона (внешний trigger для excitation) сохраняется. В combine-логике он становится **симметричным антиподом** EXP-jack Last Day (expression pedal для HAZE/TIME): Last Night sidechain = внешний пульс возбуждает пластину независимо от main signal.

### 7. Cartridge-стандарт унифицируется с Last Day

Картриджная рамка Last Night (110×65×30мм, mini-XLR×2 + JST-XH×2) и масляная ванна / tongue plate Last Day должны следовать **единому cartridge-стандарту**. Это упрощает производство и создаёт системную целостность. Конкретику — см. `decisions/03_cartridge_standards.md` (вносить апдейт отдельно при следующей итерации стандарта).

## Что становится недействительным

- **`SYSTEM_SUICIDE.md` §9** — переписан полностью под новый канон (40HP+pedal, cold palette, 4 footswitches, stereo committed).
- **`audit/02_system_architecture.md`** действие item #1 "update HP spec — Last Night = 20HP" — **superseded**. HP теперь 40 для Last Night тоже. HP-бюджет системы пересмотрен (см. §Impact ниже).
- **`audit/10_last_night_engineering.md`**, **`audit/11_last_night_acoustic.md`**, **`audit/12_last_night_open_questions.md`**, **`audit/13_schematic_cross_reference.md`** — **остаются актуальными как документ v2.1 schematic**. v2.1 — это **подмножество** combine-канона (reverb-ядро + базовые perform). Cold palette FX — это **новый слой v3**, который добавляется поверх. Аудиты получают banner с пометкой «v2.1 — это reverb-ядро combine-канона; cold palette FX (PULSE/FOG/FROST/CHILL/HUM/STALL/TOLL) — отдельный design layer v3, не покрыт этими аудитами».
- **`fixes/01_last_night_fix_list.md`** — все 15 фиксов на v2.1 schematic **остаются обязательными** для reverb-ядра. Banner с уточнением, что fixes apply to v2.1 core; cold palette FX потребуют отдельный fix list при следующей ревизии.

## Impact на систему

### HP-budget

| Модуль | Pre-Decision 07 (HP) | Post-Decision 07 (HP) |
|---|---|---|
| I Show You Light | 16 | 16 |
| Body Blood And Salt | 20 | 20 |
| All Bones Dust | 10 | 10 |
| Be Careful | 14 | 14 |
| Fuck Abandoned Sleep | 10 | 10 |
| Is My | 6 | 6 |
| Last Day | 40 | 40 |
| And My | 8 | 8 |
| Last Night | **20** | **40** |
| **Total** | **144** | **164** |

164HP в стандартном 168HP-кейсе (2 ряда 84HP) = **4HP slack** для utility-модулей. Очень плотно, но fits. Альтернатива — выйти за 168HP в 3-ряд или 84HP×2+extra. **Acceptable trade-off** ради комбайн-логики.

### Roadmap

- **Phase 1 (Months 1–9)**: Last Night v2.1 reverb-ядро (40HP, без cold palette FX) + All Bones Dust + utilities. Core kit ~$700.
- **Phase 2 (Months 9–27)**: Last Day combine full v1 + Last Night cold palette upgrade kit (PULSE/FOG/FROST/CHILL/HUM/STALL/TOLL добавляются в v3 PCB revision) + And My + Is My.
- **Phase 2B (Months 27–33)**: HEATWAVE (Day) / HUM (Night) optimizations, motorized tongue resonator (Day v2).
- **Phase 3+ (Months 27+)**: сателлиты с respec'ом (отдельный декшн).

### Спутники и не-дублирование

Cold palette формализация **не отменяет** anchor/satellite framing (см. `audit/02_system_architecture.md` banner). Сателлиты (ABD / FAS / Be Careful / I Show You Light) пересматриваются отдельным декшном так, чтобы **дополнять**, а не дублировать combine-функции Day/Night.

## Открытые вопросы для следующих итераций

1. **HUM-antenna feasibility** — маленькая ferrite coil в pedal-корпусе ловит ли достаточно 50/60Hz при reasonable shielding системы питания самого Last Night? Risk: собственный switching PSU модуля будет доминировать. Mitigation: HUM-coil экранируется от внутренних шум-источников, внешний антенный jack как fallback (симметрично HEATWAVE).
2. **TOLL ↔ DAMP механический conflict** — один соленоид в двух режимах требует pulse-driver-логики. Нужно решить: gate-фронт от TOLL footswitch автоматически прерывает DAMP-pressure? Или TOLL игнорируется во время DAMP-hold (STALL active)?
3. **PULSE/FOG источник модуляции** — общий LFO/noise с Last Day-аналогами (импорт по CV через cable) или встроенные? Combine-логика говорит "встроенные, чтобы модуль работал соло"; system-логика — "общий с FAS LFO для cohérence". Решение: **встроенные с CV inputs**, чтобы можно было override от внешнего источника.
4. **FROST как inverse-BLEACH** — реализация: один OTA с двумя направлениями (boost vs cut) или две отдельные цепи? Concept clean — две цепи (BLEACH в Day, FROST в Night, не share PCB).
5. **CHILL expander** — реализация: VCA с inverted envelope follower? Или ниже-порога attenuator? Нужен prototype для tonal validation.
6. **Pedal layout для 40HP-комбайна** — 40HP Eurorack = 203мм; pedal box 203×140мм заметно больше Eventide H9 Max (164×125мм). Это **OK** для flagship комбайна (Strymon BigSky, Eventide H9000), но требует осознанного UX-выбора.
7. **CRASH ↔ TOLL design unification** — оба эффекта = "соленоид удар", разница только в среде (масло vs пластина). PCB-блок driver'а **должен быть общим** между двумя модулями ради BOM economy и cohérence.

## Принципы, которые держим при разработке

- **Day и Night — симметричный диптих**, каждый named-эффект имеет антипод. Список парных имён зафиксирован в G-таблице `SYSTEM_SUICIDE.md` §7.
- **Cold ≠ Hot inverted, а Cold = Hot's opposite physical phenomenon**. FROST не "BLEACH с минусом" — это другая физика (поглощение vs гармоническое перенасыщение). MIRAGE — атмосферное дрожание, FOG — поглощение/неопределённость. Это семантически разное, не просто полярно перевёрнутое.
- **Reverb-ядро (v2.1) остаётся source of truth для электрической имплементации**. Cold palette FX — design layer поверх, не переписывает push-pull amp + LSK489A preamp + feedback loop + envelope VCA.
- **Каждый footswitch — это жест, не setting**. KILL / FREEZE / TOLL / STALL — четыре жеста ночи.
- **Solenoid double-function** — TOLL и STALL разделяют железо, но логически независимы.
- **Cartridge-стандарт един** с Last Day (см. `decisions/03_cartridge_standards.md`).
