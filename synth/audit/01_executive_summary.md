# SYSTEM SUICIDE — Executive Summary

**TL;DR**: Проект амбициозный и содержит **три-четыре истинно уникальных концепции** (physical plate reverb, oil can delay с solar amp, physical tongue EQ, optical tonewheel VCO). Последует **продать в boutique Eurorack нишу**. Но **первая прошивка PCB Last Night v2.1 не будет работать** без ~8 исправлений схемы — критические блокеры в solenoid driver, JFET EOL, pre-emphasis arithmetic, feedback stability. **Не закупать компоненты до исправления топ-6 рисков ниже**.

---

## Топ-10 kill-рисков

Ранжировано по **вероятности × влиянию на проект**.

### #1 — Solenoid driver gate divider inverted — **BLOCKER**

Блок 8 в `10_`. Делитель 100к/10к даёт 0.45В на gate 2N7000 — **MOSFET не откроется** никогда. При CV 5В не work. **Soleнoid damper не работает as designed**.

**Fix**: поменять R_DAM1 и R_DAM2 местами (10к serial + 100к pulldown). 5 минут работы.

**Cost of inaction**: demper не работает, большая заявленная feature dead.

---

### #2 — 2N5457 JFET EOL — **BLOCKER**

Блок 9. Critical preamp component снят с производства. NOS стоки истощаются. Любой production run хрупок к поставщику.

**Fix**: перейти на **LSK489A** (dual matched JFET) — $5–8 per module. Требует redesign preamp на SMD.

**Cost of inaction**: проект лимитирован старыми запасами JFET, scalability невозможна.

---

### #3 — Solenoid EMI в piezo preamp — **BLOCKER**

Блок 8 + СП3. Коммутация 200–500мА через solenoid в 50мм от 10МΩ JFET gate = шум громче сигнала. Cartridge JST cable без shielding = antenna.

**Fix**: 
- Экранированный соленоид (ferrite housing).
- Mini-XLR для piezo cables (shielded).
- Guard ring на PCB вокруг JFET gate.
- Physical separation zones на PCB (solenoid driver vs preamps).
- Only on/off, not PWM.

**Cost of inaction**: прототип выдаст щёлкающий noise при каждой активации damper. Unusable для performance.

---

### #4 — Feedback loop stability unverified — **BLOCKER**

СП5. Физический резонатор с Q 100–1000 в electronic feedback loop → risk самовозбуждения на резонансной частоте. Лимитер 1N4148 — мягкий, не гарантирует stability.

**Fix**: 
- SPICE симуляция loop с RLC модельей пластины.
- Добавить notch filter на expected резонансе.
- Ограничить max feedback через additional attenuator.

**Cost of inaction**: на некоторых картриджах (высокий Q: titanium, spring steel) — самовозбуждение вне control. Module превращается в bug-report machine.

---

### #5 — LFO отсутствует в схеме, но на панели педали — **BLOCKER (documentation)**

C1 в `50_`. Пользователь сам это зафиксировал. Три ручки (SPEED/DEPTH/PHASE) на педальном макете не имеют схемной реализации.

**Fix**: либо удалить из макета, либо добавить LFO узел (+8–12 компонентов, 1 ОУ + 1 CV-summ).

**Cost of inaction**: макет мёртв — если пошли в производство, ручки на panel ничего не делают.

---

### #6 — RT60 заявлены 10–20× завышенно — **MAJOR (marketing/brand)**

См. `11_last_night_acoustic.md`, C. Oak 1.5–4с заявлено, реально 0.1–0.3с. Marble 2–6с, реально 0.8–2с.

**Fix**: корректировать catalog. Позиционировать Last Night как **"resonator reverb"**, не "plate reverb". Реалистичные RT60 в docs.

**Cost of inaction**: первый buyer подаст return с "reverb не работает как заявлено". Брендовый риск.

---

### #7 — Pre-emphasis EQ corner мiscalculated — **MAJOR**

Блок 3. Заявлено 3.2кГц, с текущими номиналами (R=10к, C=1нФ) реально **15.9кГц** — effectively outside hearing range.

**Fix**: C_PE1 и C_DE1 → 4.7нФ (corner 3.4кГц). Или R → 47к. Trivial.

**Cost of inaction**: pre/de-emph не работают, просто добавляют noise без спектральной компенсации.

---

### #8 — Push-pull driver без bias — **MAJOR**

Блок 4. BD139/140 без biasing diodes → class B → crossover distortion на низких signal levels.

**Fix**: добавить 2×1N4148 между базами. 2 компонента.

**Cost of inaction**: grungy low-level sound, "broken" ощущение на тихих signals.

---

### #9 — Last Day форм-фактор не решён — **BLOCKER (product)**

C2. Заявлено Eurorack AND pedal — но solar amp, motor, RCA jacks conflict с pedal корпусом.

**Fix**: commit **Eurorack only** для v1. Pedal version — отдельный R&D проект later.

**Cost of inaction**: двойной R&D бюджет (PCB, mechanical, BOM двух вариантов) без clear customer case для второго.

---

### #10 — Three modules under-specified (Be Careful, Is My, And My) — **MAJOR (roadmap)**

См. `30_`, `50_`. Три модуля из девяти имеют либо конфликтующие, либо отсутствующие определения.

**Fix**: 
- Be Careful: выбрать одну архитектуру (recommended exciter+piezo glass plate).
- Is My: выбрать одну функцию (recommended vactrol crossfade).
- And My: определить (recommended Last Day↔Last Night crossfader) или удалить.

**Cost of inaction**: нельзя продавать 9-module serie как coherent product. Marketing и roadmap confused.

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

## Triage order (practical R&D priority)

1. **IMMEDIATE** (1 day): Fix solenoid gate divider (**#1**), biasing diodes (**#8**), pre-emphasis caps (**#7**). Trivial edits to schematic.
2. **SHORT** (1 week): Replace 2N5457 with LSK489A (**#2**), SPICE simulation of feedback loop (**#4**). Redraw preamp subsection.
3. **MEDIUM** (1 month): Add EMI mitigation (**#3**), fix LFO schematic (**#5**). Redesign cartridge cable interface.
4. **ONGOING** (3 months): Build prototype, measure real RT60 (**#6** correction), validate acoustic claims.
5. **PARALLEL**: Decide Last Day form-factor (**#9**), define 3 under-specified modules (**#10**).

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

**Текущая документация**: **содержит системные ошибки**, которые сделают первую прошивку Last Night v2.1 нерабочей.

**Не закупать компоненты** до исправления топ-6 блокеров.

**Order of operations**:
1. Fix Last Night v2.1 schematic (1 week).
2. Build first prototype, measure noise floor.
3. Validate acoustic claims против realistic RT60 (update marketing).
4. Ship Last Night + All Bones Dust (Phase 1).
5. Parallel R&D на Last Day и pendulum LFO.

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
- Pre-emphasis corner arithmetic error (блок 3).
- Push-pull bias missing (блок 4).
- C_DC 220µФ режет басы перед exciter (блок 7).
- Envelope follower time constants off by order of magnitude (блок 13).
- RT60 claims exaggerated 2-20× (acoustic).
- Gate divider in solenoid driver inverted (блок 8) — это serious oversight.
- Tel-Ray inheritance для oil can (capacitive, not magnetic).

**Это значит**: external review добавляет value. Главные additions — arithmetic errors (pre-emph, gate divider, env follower) и acoustic reality check.

---

## Next steps для пользователя

1. **Прочитать `10_last_night_engineering.md`** блок за блоком, применить 8 fixes к KiCad schematic.
2. **Запустить SPICE simulation** feedback loop со physical resonator модельей.
3. **Измерить реальный RT60** на прототипе oak plate 100×40×4мм с текущими exciter/piezo.
4. **Решить** Last Day form-factor, 3 TBD modules.
5. **Прототипировать All Bones Dust** — simple module, good first ship.
6. После этого — полная серия по roadmap.

Проект **жизнеспособен**. Но нужна **дисциплина в R&D order** и **корректировка schematic** перед любой закупкой компонентов.
