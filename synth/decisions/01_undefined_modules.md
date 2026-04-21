# Решения по TBD модулям

Четыре модуля серии имеют либо undefined, либо conflicting спецификации. Для каждого — текущее состояние, 2–3 варианта архитектуры с trade-offs, рекомендация. **Пользователь должен выбрать** один вариант (или явно cut модуль из серии).

Scope fence напоминание: этот документ **не проектирует** модули полностью — только даёт архитектурные варианты с ключевыми trade-offs. После выбора — отдельный R&D проект.

---

## 1. Be Careful — фильтр на стекле

### Текущее состояние
В брифе три conflicting концепции в одном описании:
- Стеклянные трубки как формантный фильтр (passive resonators).
- Стеклянные пластины с exciter+piezo (как Last Night, но стекло).
- Стеклянный вактрол (optical VCA с glass light path).

Это **три разных модуля**. Нужно выбрать один.

### Вариант A — Glass plate resonator (рекомендуется)

**Архитектура**: аналог Last Night, но:
- Сменный картридж со **стеклянной пластиной** (Pyrex, 100×40×3мм).
- Exciter + 2 piezo (same topology как Last Night).
- **Высокий Q** стекла (Q=500–1000) → при feedback → **self-oscillating resonant filter**.
- Input: audio → exciter через gain stage.
- Output: piezo mix → filter cutoff ручка управляет **feedback gain** (чем больше, тем уже peak).

**Функция**: дорогостоящий parallel-EQ или self-oscillating filter с glass character.

**Плюсы**:
- Reuses проект Last Night (cartridge format, exciter, pickup). 80% R&D overlap.
- Уникально — никто не делает glass-plate filter.
- Thematically coherent с серией (physical resonator).

**Минусы**:
- Стекло **хрупкое** — картриджи могут разбиться. Риск transport.
- Self-oscillation при high feedback — может требовать limiter (как Last Night).
- Filtering характер **материал-зависимый** — каждая пластина дает разный "color", не classical filter.

**HP оценка**: 14HP (feedback + tune + resonance + input/output + CV).

**R&D эффорт**: средний, т.к. reuses Last Night base.

**Retail**: $250–300.

### Вариант B — Formant glass tubes filter

**Архитектура**: passive акустический фильтр:
- 3–5 стеклянных tubes разной длины (формант peaks на 500Гц, 1кГц, 2кГц, 3.5кГц, 6кГц — vowel-like).
- Exciter blows air через speaker в tubes.
- Микрофон (condenser) снимает resultant sound.
- Tube selection: по нажатию knob (motorized valve) или sliding manifold.
- Output: mic → preamp → out.

**Функция**: vowel-like formant filter. Уникальное звучание, похожее на voice synthesis.

**Плюсы**:
- **Unique sound** — нет analogue (ни digital, ни analog).
- **Performance visual** — видно, как tubes light up или vibrate.

**Минусы**:
- **Очень сложная** механика — motorized valves, tube mounts, mic isolation.
- Large panel size (10+ tubes, 24HP+).
- **Хрупкость** tubes — break risk.
- R&D эффорт **очень высокий** (new architecture, no reuse).

**HP**: 24HP+.

**R&D**: 2+ года.

**Retail**: $600+.

### Вариант C — Glass vactrol VCA

**Архитектура**: amplitude modulator:
- **LED + LDR** (photoresistor) с glass lens между ними → encoded in glass.
- CV controls LED brightness → LDR resistance → VCA.
- Stain glass, acid-etched — "glass character" через optical distortion.

**Функция**: VCA / amplitude shaper с optical character.

**Плюсы**:
- **Простая** electrically.
- **Small HP** (6–8HP).
- Dual-channel optional.

**Минусы**:
- **НЕ фильтр** (как заявлено) — это VCA.
- Не резонирует (нет mechanical resonator).
- Glass является aesthetic element, not acoustic.
- Уже существует похожее (Folktek, commercial vactrols).

**HP**: 6–8HP.

**R&D**: низкий.

**Retail**: $150.

### Рекомендация

**Вариант A (Glass plate resonator)** — **рекомендуется**.

Обоснование:
1. Reuses Last Night infrastructure (cartridge concept, exciter, preamp).
2. Thematically coherent (physical resonator series).
3. Unique voice в marketplace.
4. Moderate R&D effort.
5. Manageable HP (14HP).

**Условие**: Last Night должен ship первым (Phase 1), чтобы cartridge infrastructure была готова, и Be Careful можно сделать как variant (Phase 3+).

### Требуется от пользователя

Выбрать: **A / B / C / cut модуль**.

Если A — приступить после Last Night ship. Cartridge: glass Pyrex 3мм.
Если B — начать отдельный R&D track. 2 года timeline.
Если C — быстрый ship (Phase 2), но потеряется "filter" positioning.
Если cut — 3 TBD модуля становятся 2 (Is My, And My).

---

## 2. Is My — live switcher / clock router / octaver

### Текущее состояние
Три conflicting функции в описании:
- Vactrol crossfade (audio mix).
- Clock divider / router (digital gates).
- Octave-down pitch shifter (audio DSP / analog flip-flop).

Три разных модуля. Нужен **один**.

### Вариант A — Vactrol crossfader (рекомендуется)

**Архитектура**: opto-coupled audio crossfader:
- 2 audio inputs (A, B).
- CV-controlled vactrol: CV=0 → output=A, CV=5V → output=B.
- Optional: CV=2.5V → equal mix (но non-linear в vactrol).
- LED indicators для current mix.

**Функция**: smooth CV-controllable crossfade между двумя signals. Полезно для live performance (между two synth voices).

**Плюсы**:
- Простая схема (2× vactrol + summing + CV conditioning).
- **Small HP** (6HP).
- Unique opto-character (не точно equal-power, slightly lagging from optical inertia).

**Минусы**:
- Vactrol non-linear — требует calibration per LDR.
- Matched pair vactrols expensive ($10 пара VTL5C3).

**HP**: 6HP.

**R&D**: низкий.

**Retail**: $120.

### Вариант B — Clock divider / router

**Архитектура**: digital clock utility:
- 1 clock input.
- 4 outputs: /1, /2, /4, /8 (binary division).
- Optional: selectable divisions (2-bit switch) на каждом output.
- Implementation: CD4040 binary counter.

**Функция**: clock sub-divisions, useful для rhythmic modulation.

**Плюсы**:
- Ubiquitous utility — используется во всех patches.
- Простая цифровая implementation.

**Минусы**:
- **Не уникально** — существует miриады clock dividers.
- Не связано тематически с "System Suicide" (digital utility, not physical).
- 6HP чувствуется overpriced для common utility.

**HP**: 6HP.

**R&D**: низкий.

**Retail**: $80–100 (compete с existing dividers).

### Вариант C — Analog octave down

**Архитектура**: frequency divider для audio:
- 4013 flip-flop триггер от input zero-crossings.
- Output square wave на 1/2 input frequency.
- Optional: filter/envelope follower для gate-detect.

**Функция**: octave-down effect (как guitar octaver pedal).

**Плюсы**:
- Уникальная функция в Eurorack (обычно digital).
- Classic effect — polarizing, но признаваемый sound.

**Минусы**:
- Работает только для monophonic harmonic signals (не chords).
- Tracking issues при чистоты input (noise, harmonics trigger errors).
- 6HP tight для octaver + optional filter.

**HP**: 6–8HP.

**R&D**: средний (tracking оптимизация).

**Retail**: $150.

### Рекомендация

**Вариант A (Vactrol crossfader)** — рекомендуется.

Обоснование:
1. Простая implementation → fast to market.
2. Unique opto-character отличает от digital crossfaders.
3. Thematically сойтmовaet (opto/physical element).
4. Name "Is My" семантически fits (is-my-A or is-my-B moment).

### Требуется от пользователя

Выбрать: **A / B / C / cut**.

---

## 3. And My — TBD

### Текущее состояние
Полностью undefined. Описано как "утилитарный модуль с джостиком". Phantom модуль в системе.

### Вариант A — Last Day ↔ Last Night crossfader (рекомендуется)

**Архитектура**: dedicated crossfade между двумя финализаторами:
- Input: **Last Day output** (tract A).
- Input: **Last Night output** (tract B).
- CV and manual crossfade.
- Output: mixed.
- Optional: dual mono outputs (separate routing).

**Функция**: smooth transition между "day" и "night" аspects серии.

**Плюсы**:
- **Thematically perfect** — "Last Day and my Last Night" literal interpretation.
- Performance-oriented — live crossfade между two reverbs.
- **Small HP** (8HP).
- Simple implementation.

**Минусы**:
- Функция **ограничена** — только имеет смысл в сочетании с Last Day + Last Night.
- Standalone value низкий.

**HP**: 8HP.

**R&D**: низкий.

**Retail**: $120–150.

### Вариант B — Joystick utility (как заявлено)

**Архитектура**: X/Y joystick CV controller:
- 2-axis joystick (Make Noise Pressure Points style).
- 2 CV outputs (X, Y).
- Optional: 2 additional gates (push button).

**Функция**: tactile modulation, performance controller.

**Плюсы**:
- Standalone valuable utility.
- Visual — joystick на панели приятный UX.

**Минусы**:
- **Уже существует** (Pressure Points, Tetrapad, Planar).
- **Не уникально** для "System Suicide" series.
- Тематически weak связь с остальными модулями.

**HP**: 8HP.

**R&D**: низкий.

**Retail**: $150.

### Вариант C — Cut module

Remove "And My" из серии. Итого 8 модулей.

**Плюсы**:
- Simplifies roadmap.
- Освобождает 8HP в rack.
- Concentrate R&D на remaining 8.

**Минусы**:
- Теряется thematic title line ("Last Day and **my** Last Night" → "Last Day My Last Night" — не grammatical).
- Fewer modules = less "full synth" impression.

### Рекомендация

**Вариант A (Last Day ↔ Last Night crossfader)** — рекомендуется.

Обоснование:
1. Thematically perfect (literal title interpretation).
2. Performance value высокий (live crossfade = musically expressive).
3. Small HP (8HP) и low R&D.
4. Sells только в контексте Last Day + Last Night — creates bundle logic.

### Требуется от пользователя

Выбрать: **A / B / cut**.

---

## 4. Body Blood And Salt — safety и scope decision

### Текущее состояние
Concept готов на уровне creative — liquid synth с biological fluids в audio path. Но:
- **Medical safety** не решена (current through body).
- **Biological hazard** в performance (кровь, пот).
- **Regulatory** questions (EU directive EMC, safety, medical device status?).

### Вариант A — Defer в Phase 5 (рекомендуется)

Отложить на конец roadmap. Не включать в early-stage boutique production.

**Обоснование**:
- Требует medical device expertise (isolation, fault analysis).
- Market niche — performance artists, небольшая аудитория.
- R&D effort непропорционален sales.
- Brand risk при safety incident.

**Action**: Remove из current roadmap. Include в "Future Modules" list as aspirational.

### Вариант B — Simplify (touch-only, no fluid)

Переделать концепт без fluids — только touch pads:
- 4× contact pads на панели.
- Skin resistance modulates filter cutoff, drive, feedback.
- **No audio through body** — safety не requires medical-grade.
- **No fluids** — no biological hazard.

**Плюсы**:
- Safety manageable.
- Performance visible (касание руками).
- Reuses concept creatively.

**Минусы**:
- Loses "blood and salt" literal — just another touch controller.
- Less shock value (part of "System Suicide" aesthetic).

**HP**: 10HP.

**R&D**: medium.

**Retail**: $250.

### Вариант C — Medical-grade implementation

Полная safety engineering:
- Isolation DC-DC (galvanic isolation from power).
- Current limiting <50 мкА через body (medical device level).
- **CE marking** и safety certification.
- Documentation medical device grade.
- **Deliberately sealed fluid electrodes** (no direct body exposure).

**Плюсы**:
- Original concept realized safely.
- Market differentiation.

**Минусы**:
- **Regulatory cost ~$20–50k** для CE certification.
- Insurance costs.
- Price point $800+ для recoup certification.
- **Legal risk** остается (несчастный случай на concert).

**HP**: 20HP.

**R&D**: 2+ года.

**Retail**: $800–1000.

### Рекомендация

**Вариант A (Defer)** — рекомендуется для early-stage проекта.

Если пользователь совсем привязан к концепту — **Вариант B (touch only)** в Phase 4, после остальных модулей.

**Вариант C** — только если пользователь имеет: medical device consulting budget, legal insurance, time 2+ года, high-end market access. **Не рекомендуется для first-time synth builder**.

### Требуется от пользователя

Выбрать: **A / B / C** и подтвердить timeline.

---

## Итого — action items

| Модуль | Требуется решение | Рекомендация |
|--------|-------------------|--------------|
| Be Careful | Glass plate / tubes / vactrol | **Glass plate (A)** |
| Is My | Crossfader / divider / octaver | **Vactrol crossfader (A)** |
| And My | DayNight xfade / joystick / cut | **Day↔Night crossfader (A)** |
| Body Blood And Salt | Defer / simplify / medical | **Defer (A)** |

Если пользователь выберет всё "A" — получается **logically coherent 8-module series** (without BBAS, but with clear roles для оставшихся).

Если пользователь настаивает на 9 модулях — Phase 4-5 возвращается к BBAS Variant B (touch only).

### HP budget recalc при рекомендованных выборах

| # | Модуль | HP |
|---|--------|-----|
| 1 | I Show You Light | 16 |
| 2 | Body Blood And Salt | (deferred, не в initial 8) |
| 3 | All Bones Dust | 10 |
| 4 | **Be Careful (glass plate)** | **14** |
| 5 | Fuck Abandoned Sleep | 10 |
| 6 | **Is My (crossfader)** | **6** |
| 7 | Last Day | 40 |
| 8 | **And My (Day↔Night xfade)** | **8** |
| 9 | Last Night | 20 |
| **Total** | | **124HP** |

Fits **один ряд 126HP** (6U rack) or **two rows 84HP** (168HP total) с большим запасом для utilities (mults, attenuators).

124HP sum — **меньше** заявленного "~142HP" из-за: BBAS deferred (20HP removed), Last Night 20HP not 40HP (corrected).

### Timeline implication

- Phase 1 (6 мес): Last Night + All Bones Dust.
- Phase 2 (12 мес): Last Day + Is My (simple crossfader) + And My (crossfader).
- Phase 3 (18 мес): I Show You Light + Fuck Abandoned Sleep + Be Careful.
- Phase 4+ (optional): BBAS (если still wanted).

**Total**: 8 coherent modules ships в ~18 месяцев с realistic R&D pacing.
