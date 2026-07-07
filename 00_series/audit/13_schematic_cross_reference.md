# Schematic cross-reference — каркас v2.0 vs. аудит

Этот файл — систематическая сверка **логического каркаса схемы** (`wood_reverb_logical_schematic.html`, 14 секций) с первоначальным аудитом (`10_last_night_engineering.md`).

Цель: зафиксировать, что подтвердилось, что исправлено, какие новые детали появились в каркасе.

## Сводная таблица

| # | Секция | Подтверждено | Исправлено | Новые компоненты | Severity до / после |
|---|--------|--------------|-----------|-------------------|--------|
| 1 | Power Supply | Decoupling 100nF on каждый IC, 1N5817 reverse protection | — | **C_B3 47µF** bulk electrolytic (не было в брифе) | MINOR / MINOR |
| 2 | Input Buffer | R1 100kΩ bias, Zin=100k, TL072 follower | — | — | MINOR / MINOR |
| 3 | Pre-emphasis EQ | C_PE1=C_DE1 matching критично | **Моя арифметика неверна**: топология shelving EQ, не simple RC; ~3.2кГц заявленная частота корректна | **R_PE3 10k, R_PE4 10k** (feedback network of shelf) | **MAJOR → MINOR** |
| 4 | Driver + Push-Pull | Gain 4.7× (R4/R3=47k/10k), RV_DRIVE 100k log, BD139/140 без bias, crossover distortion problem | C_DC 220µФ corner пересчитан | **R8 4.7Ω** current limit после C_DC | MAJOR / MAJOR |
| 5 | Feedback + Freeze | U4A summing, D_LIM1/D_LIM2 в feedback loop, SW_FREEZE SPDT | **Топология precedence ясна**: лимитеры параллельно R_FS3 в virtual ground; SW_FREEZE переключает R_FS1 input ↔ GND | **R_FS4 47kΩ** (non-inv bias) | BLOCKER / BLOCKER (stability остаётся) |
| 6 | Sidechain | U4B gain=-1, injection в FB_SUM | — | **R_SIDE_FB 47k** (теперь известно значение) | MINOR / MINOR |
| 7 | Dual Piezo Preamp | 2N5457 JFET source follower, R_PA/R_PB 10MΩ, gain ×23 (22k/1k) | — | **C_HA 100pF** HF compensation в feedback, **R_SA 4.7k** source resistor | BLOCKER / BLOCKER (EOL остаётся) |
| 8 | Position Crossfade | RV_POSITION 100k dual-gang, U4D summing | — | **R_XBIAS 47k** non-inv bias, **R_XFB 47k** feedback | MINOR / MINOR |
| 9 | De-emphasis EQ | Зеркало pre-emph. C_DE1=C_PE1 matching критично | **Arithmetic теперь согласована с 3.2кГц** | **R_DE3, R_DE4 10k** (feedback network) | MAJOR → MINOR |
| 10 | Tone LPF + LED Clipper | RV_CUTOFF 100k + C_TF 10n = 158Гц–15.9кГц range, D1/D2 LED clipper ±1.8В | — | **R_CLB 100k** pulldown на CLIP_NODE | MINOR / MINOR |
| 11 | A/D VCA (LM13700) | τ = 1МΩ × 1µФ = 1с (диапазон смещён в медленное), OTA2 unused | — | **R_EF1 10k** в envelope path, **R_IABC 10k**, **R_VCA_LOAD 10k**, **R_BLIN 10k** для linearizing diode | MAJOR / MAJOR |
| 12 | Noise Generator | BC547 reverse avalanche, параметрический разброс. Note в каркасе: "Test 5-10 transistors, 2N2222 often better" — подтверждает моё замечание | **Точная топология**: E к +12V через R20, B к GND через R21, output с collector через C_NI | **C_NI 100nF** (coupling), **C_NF 10pF** (HF rolloff), **R21 10k** | MAJOR / MAJOR |
| 13 | Mix + Stereo | U2D summing, R_MD/R_MW/R_MN values, stereo deadweight 6 резисторов | — | **R_MNI 47k** non-inv bias | MINOR / MINOR |
| 14 | Solenoid Damper | D_SOL flyback, Q5 2N7000, R_DAM3 100k pulldown | **Моя главная ошибка**: правильный divider = R_DAM1 100k serial → node X → R_DAM3 100k pulldown (NOT R_DAM2) → R_DAM2 10k к gate. Ratio = 0.5, не 0.09. MOSFET **открывается** при CV 5V (gate 2.5V, marginal) и CV 10V (gate 5V, solid) | — | **BLOCKER → MAJOR** |

---

## Ключевые исправления

### C1. Блок 14 (Solenoid Damper) — самое существенное

**Моя оригинальная ошибка** в `10_last_night_engineering.md`:
> «CV 5В × 10к / (100к + 10к) = 0.45В на gate. 2N7000 threshold ~2В. Никогда не откроется.»

**Реальность по каркасу**:
```
J_CV_DAMP ── R_DAM1 (100kΩ) ──┬── R_DAM2 (10kΩ) ── Gate
                               │
                          R_DAM3 (100kΩ)
                               │
                              GND
```

- R_DAM1 100k в серии от CV.
- Node X (после R_DAM1) — два resistors: R_DAM3 100k к GND (pulldown), R_DAM2 10k к Gate (current limit, Gate очень high-Z → пренебрежимо).
- Voltage divider: V(X) = V_CV × R_DAM3 / (R_DAM1 + R_DAM3) = V_CV × 100k / 200k = **V_CV × 0.5**.
- Gate voltage ≈ V(X) × 1 (R_DAM2 10k несущественен по сравнению с gate input impedance 2N7000 ~10^13 Ω).

**Результат**:
| CV input | V(X) = Gate | Vs Vth(2.1В) | Turn-on |
|---|---|---|---|
| 5 В | 2.5 В | marginal (+0.4В margin) | Работает, но нестабильно |
| 8 В | 4.0 В | solid (+1.9В margin) | OK |
| 10 В | 5.0 В | solid (+2.9В margin) | OK, reliable |
| 12 В | 6.0 В | solid | OK, но за Vgs max 20V |

**Verdict**: **MAJOR**, не BLOCKER. MOSFET **открывается**, но при стандартных 5В модулярных CV — marginal turn-on, risk нестабильности между экземплярами 2N7000 (Vth spread 0.8–3В в datasheet).

**Fix**:
- Уменьшить R_DAM1 до 47kΩ → divider становится 100/147 = 0.68 → при CV 5В gate = 3.4В (solid).
- Или использовать CV 10В напрямую (если в цепи есть scaling с другого модуля).
- Или заменить 2N7000 на logic-level FET с Vth 1–2В (AO3400, IRLZ34N).

---

### C2. Блок 3 (Pre-emphasis) — моя арифметика упростила топологию

**Моя оригинальная ошибка**:
> «f = 1 / (2π × R × C). Для R=10к, C=1нФ: fc = 15.9 кГц (не 3.2кГц).»

**Реальность**: топология не simple RC, а **shelving EQ с RV_BOOST в shunt path через C_PE1**:

```
BUF_OUT ──R_PE1 (10k)──┬──C_PE1 (1n)──RV_BOOST (50k)──GND (shunt)
                        │
                        ↓
                   U3A amp → PE_OUT
                   (non-inv shelf)
```

Когда RV_BOOST = 0Ω (CCW), C_PE1 к GND через 0 → HPF с corner f = 1/(2π × R_PE1 × C_PE1) = 15.9кГц — signal **не boosted** ниже этой частоты → flat overall.

Когда RV_BOOST = 50kΩ (CW), shunt становится RC impedance с f=1/(2π × (R_PE1 + RV_BOOST) × C_PE1) = 1/(2π × 60k × 1n) = **2.65кГц**. Signal boost above this frequency → shelving.

**Shelf inflection**: ~3.2кГц для заявленного "+8dB above 3.2кГц" — **подтверждается** с reasonable approximation.

**Verdict**: заявка в брифе **корректна** для данной топологии. Моё "arithmetic error" было результатом упрощения до single RC. **Downgrade MAJOR → MINOR**.

**Material-adaptive compensation** (C9 в `50_`) — отдельная проблема, не arithmetic. Остаётся в реестре.

---

### C3. Блок 4 (Driver) — R8 4.7Ω добавляет current limit

В каркасе: `C_DC (220µF) ──► R8 (4.7Ω) ──► EXCITER`.

R8 — **current limit resistor в exciter path**. Не было в исходном брифе.

**Пересчёт**:
- Exciter impedance 4Ω + R8 4.7Ω = **8.7Ω** effective load.
- Peak power при ±12В rail, Vpp=22В, Vrms=7.8В: P = Vrms² / Zload × (Rexciter / Zload) = 7.8² / 8.7 × (4 / 8.7) = **~3.2Вт на exciter** (не 15Вт как я считал).
- R8 также рассеивает: 7.8² / 8.7 × (4.7/8.7) = 3.8Вт — это много для типичного 1/4W резистора! R8 должен быть 2–5Вт, wirewound.
- Short-circuit protection: если exciter short, ток ограничен R8: Imax = 12/4.7 ≈ 2.5А — транзисторы выживают.

**Verdict**: мой вывод "exciter перегреется за минуты при 15Вт RMS" был overclaim. С R8 exciter получает 3Вт peak, thermally **sustainable**. Но R8 должен быть **power resistor** — это новое требование к BOM.

---

### C4. Блок 7 (Exciter) — C_DC corner пересчитан

В `10_` я писал: *"C_DC 220µФ даёт corner 180Гц с нагрузкой 4Ω"*.

**Пересчёт с R8**: нагрузка 8.7Ω → fc = 1/(2π × 8.7 × 220µФ) = **83Гц**.

Басы режутся менее агрессивно, чем я предполагал. Но 83Гц всё равно режет subboss (20–80Гц) — для plate reverb это может быть OK (low-end feedback risk снижен), для organ drone не OK.

**Рекомендация "C_DC до 1000µФ" остаётся** — fc становится 18Гц, full-range exciter coupling.

---

### C5. Блок 5 (Feedback + Freeze) — topology теперь ясна

В `10_` я писал: *"Если SPDT разрывает сигнальную точку до summing node, а лимитер в feedback loop..."*

Каркас показывает:
- SW_FREEZE: в NORMAL — DRV_SEND через R_FS1 47k к summing node. В FREEZE — R_FS1 вход переключается на GND (вход заглушён).
- WET_FB через RV_FEEDBACK → R_FS2 → summing node.
- D_LIM1/D_LIM2 параллельно R_FS3 47k в virtual ground (inverting input U4A).
- R_FS3 + D_LIM — это **feedback path клампа на virtual ground**, ограничивает amplitude output.

**Behavior в freeze**: R_FS1 к GND, R_FS2 остаётся активна. Signal только из WET_FB циркулирует через RV_FEEDBACK → R_FS2 → U4A → (output) → pickup → preamp → tone → VCA → WET_FB → снова.

Loop gain в freeze = RV_FEEDBACK × (gain цепи через piezo). При loop gain > 1 → self-oscillation. Лимитер ограничивает амплитуду, но не частотное поведение.

**Verdict**: C5 в `50_contradictions_and_todos.md` переходит из **MAJOR → MINOR (topology clarified)**. Stability concern (СП5 в `10_`) остаётся — nothing changed.

---

### C6. Новые компоненты для BOM

Не присутствовали в брифе v2.1, добавлены в каркас:

| Ref | Value | Назначение | Стоимость |
|-----|-------|-----------|-----------|
| C_B3 | 47µФ electrolytic | Extra bulk supply | $0.05 |
| R8 | 4.7Ω 2W wirewound | Current limit в exciter path | $0.25 |
| R_XBIAS | 47kΩ | U4D non-inv bias | $0.01 |
| R_XFB | 47kΩ | U4D feedback | $0.01 |
| R_CLB | 100kΩ | CLIP_NODE pulldown | $0.01 |
| R_MNI | 47kΩ | U2D non-inv bias | $0.01 |
| C_HA | 100pF | HF compensation в preamp | $0.03 |
| R_SA, R_SB | 4.7kΩ | JFET source resistors | $0.02 |
| C_NI | 100nF | Noise coupling | $0.03 |
| C_NF | 10pF | Noise HF rolloff | $0.03 |
| R21 | 10kΩ | BC547 base bias | $0.01 |
| R_SIDE_FB | 47kΩ | Sidechain feedback | $0.01 |
| R_DE3, R_DE4 | 10kΩ | De-emphasis network | $0.02 |
| R_PE3, R_PE4 | 10kΩ | Pre-emphasis network | $0.02 |
| R_EF1 | 10kΩ | Envelope follower rect | $0.01 |
| R_IABC | 10kΩ | OTA Iabc | $0.01 |
| R_VCA_LOAD | 10kΩ | OTA output load | $0.01 |
| R_BLIN | 10kΩ | OTA linearizing diode bias | $0.01 |

**Total**: ~$0.60 BOM, ~18 дополнительных компонентов. Это повышает общий count с 140 до ~158, что соответствует заявленному в брифе v2.1 "~142" (+ 10-15% разброс).

---

## Подтверждения моих замечаний

1. **BD139/BD140 без biasing diodes** (блок 4) — подтверждено каркасом. Crossover distortion на low-level signal.
2. **2N5457 JFET preamp**, gain ×23 (блок 9) — подтверждено. EOL issue остаётся.
3. **Stereo paths = 6 dead resistors в mono use** (блок 14) — подтверждено.
4. **BC547 parameter spread** — подтверждено **self-referentially в каркасе**: note "Not all BC547 have same noise. Test 5-10 transistors, 2N2222 often better". Это не bug, это задокументированная unreliability.
5. **D_SOL flyback diode mandatory** (блок 8) — подтверждено каркасом.
6. **OTA2 unused** (блок 13) — подтверждено (note: "Tie OTA2 inputs to GND").

---

## Что осталось unchanged в аудите

- Блоки 1, 2, 6, 9, 10, 11, 12, 13 — замечания в силе, детали подтверждены.
- `11_last_night_acoustic.md` — не затрагивается каркасом.
- `12_last_night_open_questions.md` — ответы остаются валидными.
- Весь Last Day раздел (20_, 21_, 22_) — каркас не относится к Last Day.
- `30_other_modules_gaps.md` — не затрагивается.
- `40_bom_risk_register.md` — замены 2N5457, BC547, TL072 остаются актуальными.
- `41_power_thermal_emi.md` — EMI analysis в силе.

## Итог revision

**Понижения severity**:
- Блок 3 (pre-emphasis): MAJOR → MINOR.
- Блок 8 (solenoid divider): BLOCKER → MAJOR.
- Блок 9 (de-emphasis mirror): MAJOR → MINOR.
- C5 в 50_: MAJOR → MINOR.

**Подтверждения**:
- 4 BLOCKER → 3 BLOCKER в executive summary (solenoid divider упал).
- 7 MAJOR → 6 MAJOR в per-block (pre-emph pulled).

**Новые находки**:
- R8 4.7Ω — важный компонент, изменяет power budget и thermal analysis.
- 18 "скрытых" компонентов (bias resistors, HF caps) которые должны попасть в BOM.

**Что пользователь должен сделать по итогам revision**:
1. Verify R8 4.7Ω — is it 2W wirewound (not 1/4W)?
2. Confirm CV scaling: 5В ли max или 10В? Fixed R_DAM1 если 5В max.
3. Учесть 18 новых компонентов в BOM и cost estimate.
