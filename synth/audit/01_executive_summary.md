# SYSTEM SUICIDE — Executive Summary (revised)

> **Revision**: этот документ был переоценён после появления `wood_reverb_logical_schematic.html` — каркаса с точной топологией Last Night v2.0. Один из моих топ-BLOCKER был снят (детали в `13_schematic_cross_reference.md`). Топ-10 ниже пересортирован.

**TL;DR**: Проект амбициозный и содержит **три-четыре истинно уникальных концепции** (physical plate reverb, oil can delay с solar amp, physical tongue EQ, optical tonewheel VCO). Полностью **продаваем в boutique Eurorack нишу**. Но **первая прошивка PCB Last Night v2.1 требует 3 критических фикса** (JFET EOL, EMI shielding, feedback stability simulation) перед компонентами. Ещё ~5 improvement-уровня правок можно делать на rev B.

---

## Топ-10 kill-рисков (revised)

Ранжировано по **вероятности × влиянию на проект**.

### #1 — 2N5457 JFET EOL — **BLOCKER**

Блок 9. Critical preamp component снят с производства. NOS стоки истощаются. Любой production run хрупок к поставщику.

**Fix**: перейти на **LSK489A** (dual matched JFET) — $5–8 per module. Требует redesign preamp на SMD (один sub-secton).

**Cost of inaction**: проект лимитирован старыми запасами JFET, scalability невозможна.

---

### #2 — Solenoid EMI в piezo preamp — **BLOCKER**

Блок 8 + СП3. Коммутация 200–500мА через solenoid в 50мм от 10МΩ JFET gate = шум громче сигнала. Cartridge JST cable без shielding = antenna.

**Fix**: 
- Экранированный соленоид (ferrite housing).
- Mini-XLR для piezo cables (shielded).
- Guard ring на PCB вокруг JFET gate.
- Physical separation zones на PCB (solenoid driver vs preamps).
- Only on/off, not PWM.

**Cost of inaction**: прототип выдаст щёлкающий noise при каждой активации damper. Unusable для performance.

---

### #3 — Feedback loop stability unverified — **BLOCKER**

СП5. Физический резонатор с Q 100–1000 в electronic feedback loop → risk самовозбуждения на резонансной частоте. Лимитер 1N4148 — мягкий, не гарантирует stability.

**Fix**: 
- SPICE симуляция loop с RLC модельей пластины.
- Добавить notch filter на expected резонансе.
- Ограничить max feedback через additional attenuator.

**Cost of inaction**: на некоторых картриджах (высокий Q: titanium, spring steel) — самовозбуждение вне control. Module превращается в bug-report machine.

---

### #4 — LFO отсутствует в схеме, но на панели педали — **BLOCKER (documentation)**

C1 в `50_`. Пользователь сам это зафиксировал. Три ручки (SPEED/DEPTH/PHASE) на педальном макете не имеют схемной реализации.

**Fix**: либо удалить из макета, либо добавить LFO узел (+8–12 компонентов, 1 ОУ + 1 CV-summ).

**Cost of inaction**: макет мёртв — если пошли в производство, ручки на panel ничего не делают.

---

### #5 — Last Day форм-фактор не решён — **BLOCKER (product)**

C2. Заявлено Eurorack AND pedal — но solar amp, motor, RCA jacks conflict с pedal корпусом.

**Fix**: commit **Eurorack only** для v1. Pedal version — отдельный R&D проект later.

**Cost of inaction**: двойной R&D бюджет (PCB, mechanical, BOM двух вариантов) без clear customer case для второго.

---

### #6 — Solenoid gate divider marginal turn-on — **MAJOR** (ранее было #1 BLOCKER — demoted)

Блок 8. Правильная топология делителя (R_DAM1 100k серии, R_DAM3 100k pulldown, R_DAM2 10k к gate) даёт ratio 0.5, не 0.09 как я считал изначально. При CV 5В gate = 2.5В — marginal для Vth 2N7000 (spread 0.8–3В). Работает для typical экземпляров, unreliable для low-Vth.

**Fix**: уменьшить R_DAM1 до 47кΩ → divider 0.68 → CV 5В = 3.4В на gate (solid). Альтернатива: logic-level MOSFET (AO3400, IRLZ34N).

**Cost of inaction**: ~15% экземпляров будут работать нестабильно — мелкая production issue, не катастрофа.

---

### #7 — RT60 заявлены 10–20× завышенно — **MAJOR (marketing/brand)**

См. `11_last_night_acoustic.md`, C. Oak 1.5–4с заявлено, реально 0.1–0.3с. Marble 2–6с, реально 0.8–2с.

**Fix**: корректировать catalog. Позиционировать Last Night как **"resonator reverb"**, не "plate reverb". Реалистичные RT60 в docs.

**Cost of inaction**: первый buyer подаст return с "reverb не работает как заявлено". Брендовый риск.

---

### #8 — Push-pull driver без bias + R8 power rating — **MAJOR**

Блок 4. BD139/140 без biasing diodes → class B → crossover distortion. Кроме того, **R8 4.7Ω должен быть 5W wirewound** (рассеивает ~3.8Вт), не 1/4W. Не ясно из каркаса спецификация — может сгореть если ошибка в BOM.

**Fix**: 
- 2×1N4148 между базами Q1/Q2 для class AB.
- R8 — wirewound 5W (Panasonic ERG-5SJ или аналог).

**Cost of inaction**: grungy low-level sound (bias issue) + потенциальное burn-out R8 (power rating issue).

---

### #9 — Three modules under-specified (Be Careful, Is My, And My) — **MAJOR (roadmap)**

См. `30_`, `50_`. Три модуля из девяти имеют либо конфликтующие, либо отсутствующие определения.

**Fix**: 
- Be Careful: выбрать одну архитектуру (recommended exciter+piezo glass plate).
- Is My: выбрать одну функцию (recommended vactrol crossfade).
- And My: определить (recommended Last Day↔Last Night crossfader) или удалить.

**Cost of inaction**: нельзя продавать 9-module serie как coherent product. Marketing и roadmap confused.

---

### #10 — Envelope follower time constants off — **MAJOR**

Блок 13. τ = 1МΩ × 1µФ = 1 секунда (maximum). Музыкально полезный attack — 1–50 мс. Текущая схема: либо мгновенно (R=0), либо слишком медленно (→1с). Середина плохо управляется.

**Fix**: 
- Уменьшить C_ENV до 220нФ.
- Уменьшить R_ATTACK до 220к (τ_max = 48мс — привычный диапазон attack).
- Добавить 2 диода для independent A/D charge/discharge paths.

**Cost of inaction**: envelope response unusable для musical dynamics — либо gate on/off, либо infinite sustain.

---

## Verdict по модулям — "Ship / Redesign / Cut"

| Модуль | Status | Verdict | Action |
|--------|--------|---------|--------|
| **Last Night v2.1** | Ready to test | **Redesign** (fix 8 schematic issues + EMI) | Phase 1 first |
| **Last Day** | Concept | **Redesign** (Eurorack only, subsystem R&D в серии) | Phase 2 |
| **All Bones Dust** | Concept high-maturity | **Ship** (simple, fast) | **Phase 1 alongside Last Night** |
| **Fuck Abandoned Sleep** | Concept mid-maturity | **Ship after prototyping** | Phase 2 |
| **I Show You Light** | Concept, mechanical-heavy | **Redesign** (CV→speed, disk manufacturing) | Phase 3 |
| **Be Careful** | Triple-concept | **Define then ship** | Phase 3 (after decision) |
| **Body Blood And Salt** | Creative concept, safety-heavy | **Redesign** (medical-grade isolation) | Phase 4-5 |
| **Is My** | Triple-defined в 6HP | **Redesign** (one function) | Phase 4 or **cut** |
| **And My** | TBD | **Define** (recommended crossfader) или **Cut** | Phase 4 |

---

## Triage order (revised practical R&D priority)

1. **IMMEDIATE** (1 day): Biasing diodes 2×1N4148 в push-pull (**#8**), R8 spec → 5W wirewound (**#8**), reduce R_DAM1 to 47k для solenoid solid turn-on (**#6**). Trivial schematic edits + BOM correction.
2. **SHORT** (1 week): Replace 2N5457 with LSK489A (**#1**), SPICE simulation of feedback loop (**#3**). Redraw preamp subsection.
3. **MEDIUM** (1 month): Add EMI mitigation (**#2**), fix LFO schematic (**#4**). Redesign cartridge cable interface — mini-XLR.
4. **ONGOING** (3 months): Build prototype, measure real RT60 (**#7** correction), validate acoustic claims, envelope τ fix (**#10**).
5. **PARALLEL**: Decide Last Day form-factor (**#5**), define 3 under-specified modules (**#9**).

## Recommended first production run

**Phase 1 kit**: Last Night v2.1 (with all fixes) + All Bones Dust + essential utilities (attenuator, mults). **~3-module kit** for ~$700–900 retail.

- Validates physical cartridge concept.
- Proves brand identity (post-apocalyptic theme).
- Generates cashflow for Last Day R&D.
- Minimum commit risk.

**Do NOT launch 9 modules simultaneously**. That requires $500K+ R&D + inventory + marketing budget — unrealistic for boutique startup.

---

## Финальный вердикт

**Концепция**: **сильная, уникальная, продаваемая** в boutique Eurorack нишу.

**Текущая документация (после revision)**: содержит **5 BLOCKER** и **5 MAJOR** пунктов, из которых **3 BLOCKER критичны перед первой прошивкой** (JFET EOL, EMI shielding, feedback SPICE). Остальные можно адресовать на rev B.

**Не закупать компоненты** до исправления топ-3 BLOCKER (#1–#3).

**Order of operations**:
1. Fix Last Night v2.1 schematic — specifically: swap 2N5457 → LSK489A, add mini-XLR cable shielding, SPICE feedback loop (1–2 недели).
2. Build first prototype rev A, measure noise floor.
3. Validate acoustic claims против realistic RT60 (update marketing).
4. Iterate to rev B с MAJOR fixes (bias diodes, R8 power rating, gate margin, envelope τ, LFO add).
5. Ship Last Night + All Bones Dust (Phase 1).
6. Parallel R&D на Last Day и pendulum LFO.

**Estimated time to first ship**: 6–9 месяцев при full-time R&D на двух человек.

**Estimated BOM per module** (Last Night): $80–120 после risk-upgrades (LSK489, NE5532, shielded cables). Retail $300–400. **Margin OK для boutique**.

---

## Что сам пользователь правильно идентифицировал

Пользователь в брифах уже отметил:
- 2N5457 EOL (подтверждено как #2).
- Solenoid EMI risk в JFET gate (подтверждено как #3).
- LFO missing from schematic (подтверждено как #5).
- Pedal power budget для Last Day (подтверждено как #9).
- Position crossfade при одинаковых датчиках — subtle (подтверждено).
- 20 jacks patch bay overkill (подтверждено).
- Stereo dead weight в mono usage (подтверждено).

**Это значит**: пользователь правильно видит риски. Ауд — валидация и приоритизация, не surprise discovery.

**Что пользователь НЕ идентифицировал** (новые находки в этом аудите):
- ~~Pre-emphasis corner arithmetic error (блок 3)~~ — **это моя ошибка, не пользователя. Корректно в каркасе (shelving topology, не simple RC).**
- Push-pull bias missing (блок 4) — подтверждено каркасом.
- R8 4.7Ω power rating — появилось только в каркасе, spec не указана.
- C_DC 220µФ режет басы перед exciter на 83Гц (с учётом R8) — corrected from 180Гц.
- Envelope follower time constants off by order of magnitude (блок 13).
- RT60 claims exaggerated 2-20× (acoustic).
- ~~Gate divider in solenoid driver inverted (блок 8)~~ — **это была моя ошибка (неверная интерпретация топологии). Реально — marginal turn-on, не nothing.**
- Tel-Ray inheritance для oil can (capacitive, not magnetic).

**Это значит**: external review добавляет value, **но требует верификации с реальной схемой**. Два моих оригинальных замечания были некорректны из-за отсутствия точной топологии на момент первого прохода. Каркас `wood_reverb_logical_schematic.html` зафиксировал это — и запустил revision pass.

**Material errors caught in revision**:
1. Блок 3 (pre-emphasis): corner 3.2кГц корректен для shelving topology, не 15.9кГц как я считал.
2. Блок 8 (solenoid): divider ratio 0.5, не 0.09. MOSFET **открывается**, хотя marginal при 5В CV.

**Confirmed findings** (все ещё актуальные):
- Push-pull crossover distortion без bias.
- 2N5457 EOL (критический).
- Solenoid EMI в piezo preamp (критический).
- BC547 reverse breakdown unreliability (подтверждено note в каркасе!).
- Envelope τ mismatch.
- Feedback loop stability не проверена.
- Acoustic RT60 exaggeration.

---

## Next steps для пользователя

1. **Прочитать `10_last_night_engineering.md`** блок за блоком, применить 8 fixes к KiCad schematic.
2. **Запустить SPICE simulation** feedback loop со physical resonator модельей.
3. **Измерить реальный RT60** на прототипе oak plate 100×40×4мм с текущими exciter/piezo.
4. **Решить** Last Day form-factor, 3 TBD modules.
5. **Прототипировать All Bones Dust** — simple module, good first ship.
6. После этого — полная серия по roadmap.

Проект **жизнеспособен**. Но нужна **дисциплина в R&D order** и **корректировка schematic** перед любой закупкой компонентов.
