# LAST NIGHT — Acoustic Modeling & Cartridge Dimensioning

**Версия**: v1.0
**Назначение**: расчётная де-рискизация главного риска проекта — "звук пластин может быть не очень". Закрывает acoustic concern на бумаге до cartridge tooling.
**Парные документы**: `../00_series/decisions/03_cartridge_standards.md`, `../00_series/audit/11_last_night_acoustic.md`, `HANDOFF_BRIEF.md` (Tier 1 sacred #1).

> **Главный вывод**: при 100мм пластинах материалы делятся на два акустических семейства — **dense-modal** (тонкие ковкие металлы → reverb-character) и **sparse-modal** (толстые жёсткие → резонатор/chime). Это не дефект, а палитра. Каждый материал имеет оптимальную толщину/размер, рассчитанные ниже.

---

## 1. Физика — что определяет звук пластины

Изгибно-колеблющаяся (bending mode) пластина характеризуется тремя величинами:

| Параметр | Формула | Что определяет |
|----------|---------|----------------|
| **Modal density** | `n(f) = S/(0.606·c_L·h)` [мод/Гц] | густоту (reverb ↔ chime) |
| **Fundamental** | `f₁₁ = (π/2)·√(D/ρh)·[(1/a)²+(1/b)²]` | где начинается спектр |
| **Decay (RT60)** | `RT60 ≈ 2.2/(f·η)` | длину хвоста |

где:
- `D = E·h³/(12(1−ν²))` — flexural rigidity [Н·м]
- `ρh` — масса на единицу площади [кг/м²]
- `c_L = √(E/ρ)` — longitudinal wave speed [м/с]
- `S = a·b` — площадь, `a,b` — размеры, `h` — толщина
- `η = tan δ` — loss factor материала
- `ν ≈ 0.3` для большинства (1−ν² = 0.91)

### 1.1 Поправка к константе modal density

Ранние оценки в `../00_series/audit/11` использовали `n(f) ≈ S/(1.8·c_L·h)` — **константа неверна**. Корректный вывод из Cremer & Heckl "Structure-Borne Sound":

```
n(f) = (S/2)·√(ρh/D)
     = (S/2)·√(12(1−ν²)·ρ/(E·h²))
     = (S/2)·(√(12·0.91)/h)·√(ρ/E)
     = (S/2)·(3.30/h)·(1/c_L)
     = S/(0.606·c_L·h)            ✅ корректная форма
```

Это даёт **в ~3× больше мод**, чем пессимистичная оценка аудита. Reverb-character достижим тоньшими металлами.

### 1.2 Reference scale — почему 100мм это "resonator", а не "dense plate"

| Система | Размер | Мод <10кГц | Character |
|---------|--------|-----------|-----------|
| EMT 140 (классика) | 2000×1000×0.5мм steel | ~13 000 | dense reverb |
| Last Night steel | 100×55×0.3мм | ~56 | resonator reverb |
| Last Night slate | 100×45×2.0мм | ~5 | stone bell/clack |

Разница EMT/LN steel ~230×. **Last Night = resonator-class**, density добирается feedback + modulation + (premium) multi-plate stack.

---

## 2. Материальные константы

| Материал | E (ГПа) | ρ (кг/м³) | c_L (м/с) | η (tan δ) | Хрупкость → min h |
|----------|---------|-----------|-----------|-----------|-------------------|
| Spring steel | 200 | 7850 | 5050 | 0.0002 | ductile → 0.3мм |
| Aluminum | 69 | 2700 | 5055 | 0.0001 | ductile → 0.4мм |
| Brass | 100 | 8500 | 3430 | 0.001 | ductile → 0.5мм |
| Glass (annealed) | 70 | 2500 | 5290 | 0.001 | brittle → 1.5мм; **annealed, НЕ tempered**: tempered при повреждении взрывается целиком (запасённое поверхностное напряжение + NiS-включения → спонтанный разлёт) и не режется после закалки. Annealed скалывается локально и предсказуемо — правильный выбор для striking-девайса |
| Marble | 50 | 2700 | 4300 | 0.003 | brittle → 3мм |
| Oak (∥ волокна) | 12 | 700 | 4140 | 0.008 | → 2мм |
| Bone | 18 | 1900 | 3080 | 0.02 | → 2.5мм |
| Nephrite (jade) | 75 | 3000 | 5000 | 0.0005 | brittle → 2.5мм |

> Loss factor спред **100×** (steel 0.0002 → bone 0.02) — главный источник differentiation между материалами. Wave speed спред только ~1.6×.

---

## 3. Оптимизированные размеры — per material (refined h + W)

L = **100мм константа**. **Ширина W варьируется per material как character-рычаг** (не только density):
- **Широкая (W→55мм)** — 2D plate-моды, плотные/диффузные → **reverb-like**
- **Узкая (W→35мм)** — 1D bar-моды, разреженные/чистые pitched тоны → **chime/колокол/lithophone**

Толщина — durability + fundamental tradeoff. Fundamental SS / free-free ~0.6× ниже.

| # | Материал | h (мм) | **W (мм)** | f₁₁ SS / ff | Мод <10кГц | RT60 | Семейство |
|---|----------|--------|------------|-------------|-----------|------|-----------|
| 1 | **Spring steel** | 0.3 | **55** | 310/190 | **~58** | 3–8 с | reverb (wide, dense shimmer) |
| 2 | **Brass** | 0.5 | **55** | 351/210 | **~51** | 2.2 с | reverb (wide, metallic) |
| 3 | **Aluminum** | 0.4 | **55** | 414/250 | **~43** | 4–10 с | reverb (wide, bright) |
| 4 | **Oak** (∥ волокна) | 1.8 | 45 | 1900/1150 | ~12 (анизотропия) | 0.28 с | wood (medium, warm slap) |
| 5 | **Slate** (заменяет marble) | 2.0 | 45 | 2637/1580 | ~6 | 0.44 с | stone (medium) |
| 6 | **Glass** (annealed) | 1.5 | **40** | 2735/1640 | ~6 | 2.2 с | chime (narrow, crystalline) |
| 7 | **Nephrite** (jade) | 2.0 | 45 | 2824/1700 | ~5 | 4.4 с | bell (medium, поющий) |
| 8 | **Bone** | 2.5 | **35** | 3352/2010 | ~5 | 0.11 с | percussion (narrow, dry knock) |
| ~~9~~ | ~~Marble~~ | ~~3.0~~ | ~~45~~ | ~~3700/2220~~ | ~~3~~ | 0.73 с | superseded by slate (см. §5) |

### Логика выбора per family

**Метал-reverb (steel/brass/alu)** → тончайшие durable + **широкие (55мм)** → max модов + низкий fundamental + 2D density.

**Chime/bell (glass/nephrite/bone)** → min durable толщина + **узкие (35-45мм)** → чистые bar-тоны (lithophone-традиция). Nephrite жёстче типичного камня (tough — историч. орудия) → можно 2мм вместо 2.5.

**Wood/stone (oak/slate)** → medium W=45 — баланс плотности и pitched character.

### ⚠ Конструктивное ограничение для contact engine

Variable W (35-55мм) усложняет fixed module-contact mechanism. Module contact-points (exciter + 2 пьезо) должны попадать на **самую узкую** пластину (bone W=35) → располагаются в центральной зоне 100×35мм.

**De-risk вариант для v1 / bench Stage 0**: **W = 50мм константа** для всех — упрощает фиксированный contact-rig, character дифференциация идёт через материал + толщину. Variable W (таблица выше) — refinement для v2 после того как contact coupling доказан (см. RISK_ASSESSMENT R1 + Stage 0).

### 3.1 Расчёт примеры (для воспроизводимости)

**Spring steel 100×55×0.3мм**:
```
D = 200e9 × (0.3e-3)³/10.92 = 0.4945
ρh = 7850 × 0.3e-3 = 2.355
[(1/0.1)² + (1/0.055)²] = 100 + 330.6 = 430.6
f₁₁ = 1.571 × √(0.4945/2.355) × 430.6 = 1.571 × 0.458 × 430.6 = 310 Гц
n(f) = 0.0055/(0.606×5050×0.3e-3) = 0.00599
N(<10кГц) = 0.00599 × (10000−310) = 58 мод
```

**Bone 100×35×2.5мм** (узкая = bar-like percussion):
```
D = 18e9 × (2.5e-3)³/10.92 = 25.76
ρh = 1900 × 2.5e-3 = 4.75
[(1/0.1)² + (1/0.035)²] = 100 + 816.3 = 916.3
f₁₁ = 1.571 × √(25.76/4.75) × 916.3 = 1.571 × 2.329 × 916.3 = 3352 Гц
n(f) = 0.0035/(0.606×3078×2.5e-3) = 0.000751
N(<10кГц) = 0.000751 × 6648 = ~5 мод
RT60 = 2.2/(1000 × 0.02) = 0.11 с
```

---

## 4. Два акустических семейства

### 4.1 Dense-modal (reverb-like) — тонкие ковкие металлы

**Steel / brass / aluminum** при 0.3-0.5мм → 41-56 мод, fundamental 330-440Гц (SS) / ~200-260Гц (free-free).

- Тонкость = главный рычаг: `n ∝ 1/h`, fundamental `∝ h`. Тоньше → больше мод + ниже бас.
- Ductile металлы выдерживают тонкость без раскола.
- **Эти — flagship "reverb" cartridges.**

### 4.2 Sparse-modal (резонатор/chime) — толстые жёсткие/хрупкие

**Glass / nephrite / marble / oak / bone** → 3-10 мод, высокий fundamental.

- Хрупкость требует толщины → высокий fundamental → разреженно. Физический предел при 100мм размере.
- **Это идентичность, не дефект**:
  - Nephrite — поющий колокол (китайский lithophone bianqing 编磬, маорийский pounamu): немного чистых тонов + длинный sustain (4.4с).
  - Bone — сухой ритуальный стук (0.11с).
  - Glass — crystalline chime.
  - Oak — тёплый woody slap (0.28с).
  - Marble — каменный clack.

---

## 5. Проблемный материал — Marble

**Marble на 100мм размере плохо работает как reverb**: хрупкость → 3мм толщина → fundamental ~2.2кГц (free-free), всего ~3 моды. Звучит как высокий "клац", не музыкально.

### Варианты решения

| Опция | Подход | Trade-off |
|-------|--------|-----------|
| **A. Репозиция** | "Percussion stone" cartridge — short high clack для ритм-ударов, не reverb | Честно к физике, но не "reverb" |
| **B. Slate (сланец)** | Расслаивается тонко → 2мм возможно → ниже fundamental, больше мод | Менее премиум-вид чем marble |
| **C. Soapstone (стеатит)** | Мягче (E~20ГПа, ниже c_L) → ниже fundamental | Мягкий, износ от exciter |
| **D. Убрать из reverb-каталога** | Marble = novelty/collector, не core | Теряем "monumental stone" narrative |

**Рекомендация**: **B (slate) для core stone cartridge** + опционально A (marble как percussion novelty). Slate 100×45×2.0мм:
```
E~60ГПа, ρ~2750, c_L~4670, η~0.005
f₁₁(2мм) ≈ 1.571 × √(60e9×8e-9/10.92 / (2750×2e-3)) × 456 ≈ 1850 Гц (SS) → ~1100 Гц free-free
N ≈ 8 мод, RT60 ≈ 0.44с
```
Лучше marble (8 мод vs 3, ниже fundamental). Сохраняет "stone" identity.

---

## 6. Density boost — multi-plate stack (premium cartridge)

Для reverb-density на sparse материалах (или dense на металлах):

### 6.1 Принцип

2-3 пластины в одном cartridge, **слегка расстроенные** (detuned ±3-5% размером), под одним exciter (coupled mechanically via shared mount bar) или независимо. Каждая добавляет свой mode set; detuning заполняет gaps.

Аналог: **реальные spring reverb** используют 2-3 пружины разной длины параллельно ради echo density.

### 6.2 Density gain

```
3 пластины × N мод каждая, detuned → ~3N эффективных мод без overlap
Steel stack: 3 × 56 = ~168 мод <10кГц → small-room reverb territory
Nephrite stack: 3 × 5 = ~15 мод → fuller bell choir
```

### 6.3 Конструкция premium stack cartridge

```
   Exciter (DAEX32Q-4, больше для mass loading)
        │
        ▼
   Mount bar (алюминий, передаёт vibration к 3 пластинам)
        ├── Plate 1: 100×55мм   (baseline)
        ├── Plate 2: 97×55мм    (−3% length → detune вверх ~3%)
        └── Plate 3: 103×55мм   (+3% length → detune вниз ~3%)
        │
        ▼
   Dual piezo снимает combined response (по одному на крайние пластины)
```

**Trade-off**: mass loading на exciter (нужен DAEX32 premium), mechanical complexity, дороже (3× plate cost + mount bar). Логично как **"Studio Plate" premium cartridge tier** — маркетинговый differentiator: настоящая reverb-плотность.

---

## 7. Рычаги density — сводка приоритетов

| Рычаг | Density gain | Cost | Phase |
|-------|--------------|------|-------|
| Тоньше пластина (металлы 0.3-0.5мм) | ×2-3 | $0 (спецификация) | 1 |
| Высота 40→53мм + non-integer ratio | ×1.4 + анти-degeneracy | $0 (геометрия) | 1 |
| Feedback loop (electronic) | perceptual ×много | $0 (есть) | 1 |
| Phaser + FG modulation | perceptual smearing | $0 (есть) | 1 |
| Multi-plate stack | ×2-3 | +plate cost +mount bar | 2 premium |
| Plate+spring hybrid (dispersive) | echo density | exotic | 2+ flagship |

**Phase 1 стратегия**: тонкие металлы + high/non-integer geometry + feedback/modulation. Комбо даёт musically dense для большинства игры.

---

## 7A. Transducer coupling — CONTACT mechanism (Decision 11)

> **Decision 11 архитектура**: трансдьюсеры (exciter/пьезо/соленоид) — **в модуле**, не в картридже. Картридж = пассивная пластина. Coupling = **контактный** (spring-loaded), не bonded. Два идентичных steel plate дадут одинаковый звук если contact force repeatable. Это часть "звук пластин" риска — contact mechanism критичен.

### 7A.0 Contact coupling vs bonded — tradeoff

| | Bonded (старая ошибочная модель) | Contact (Decision 11) |
|--|----------------------------------|----------------------|
| Картридж cost | $40-45 (трансдьюсеры внутри) | $10-20 (только пластина) |
| Coupling efficiency | высокая, consistent | зависит от spring force |
| Rattle risk | нет | есть если контакт слаб → нужен ≥5N |
| Razor-blade model | не работает | работает |

Контактный coupling — правильный выбор (cost), но требует **spring-loaded механизм с calibrated force** чтобы coupling был repeatable и без rattle.

### 7A.1 Exciter coupling

| Параметр | Опции | Влияние | Рекомендация |
|----------|-------|---------|--------------|
| **Contact force** | light / medium (≥5N) / heavy | слишком light → buzz/rattle при high drive; heavy → damping модов | **medium ~5N** spring-loaded carriage (calibrated, repeatable) |
| **Contact point** | center / 1/3 length / edge | center драйвит symmetric, давит antisymmetric; 1/3 драйвит широкий set | **~1/3 от края** (и symmetric и antisymmetric моды) |
| **Puck face** | flat metal / silicone pad tip | flat → жёсткий contact + buzz risk; silicone → clean transfer + compliance | **thin silicone pad на puck face** — чистый transfer + компенсирует surface irregularity |
| **Carriage travel** | fixed / spring ±2mm | fixed не handle разную толщину; spring компенсирует | **spring ±2mm** — handle plates 0.3-3мм одним механизмом |

**Drive point per FEM**: разместить exciter contact на **пучности** низких мод (§8.2 mode shapes), избегать узлов. ~1/3 от короткого края — good compromise.

### 7A.2 Piezo contact pickup (Decision 11 — spring pins, не bonded)

Пьезо **в модуле**, контактные spring-loaded pins касаются back пластины. Не bonded к пластине (картридж сменный).

| Параметр | Опции | Рекомендация |
|----------|-------|--------------|
| **Contact type** | pogo pin / spring-loaded piezo disc / contact stylus | **spring-loaded piezo disc** (27mm) на flexible mount, прижат к back |
| **Contact force** | 1-2N per pickup | **~1.5N** — достаточно для sense, не давит моды |
| **Tip material** | bare brass / gold-plated / rubber-tipped | gold-plated contact point (corrosion-free, consistent) |
| **Placement** | A near exciter / B far | per FEM mode shapes — **избегать узлов** доминирующих мод |

> Contact pickup (прижатый пьезо) работает как contact-mic — sense через точку касания. Acoustically чуть отличается от bonded (slightly less HF), но картридж сменный → contact обязателен.

### 7A.3 Bench validation (обязательно)

Tap-test (§8.4) + exciter bench (§8.5) с **contact mechanism** (не свободной пластиной):
- Contact force sweep (3-8N exciter, 1-2N piezo) → найти clean transfer без rattle.
- Plate thickness range (0.3-3мм) → verify spring carriage handle все.
- Insertion repeatability — вставить/вынуть 20× → consistent coupling?
- → выбрать contact force + puck/pin design по: clean transfer + no rattle + repeatable insertion + durability (10000 cycles).

---

## 7B. Plate coating — tuning lever + product line

Одна и та же пластина с разным покрытием = **разный RT60 + character**. Двойная выгода: voicing без новых материалов + product line expansion (один заготовка → несколько SKU).

| Coating | Эффект на η (damping) | Character shift | Применение |
|---------|----------------------|-----------------|------------|
| **Raw (uncoated)** | baseline | максимальный sustain, brightest | metals, default |
| **Lacquer (nitro/acrylic)** | +η ~0.001-0.003 | чуть короче, smoother top | wood, brass |
| **Linseed/tung oil** | +η ~0.002 | warmer, damped HF | wood (oak) |
| **Anodizing (aluminum)** | +η ~0.0005 + surface hardness | чуть brighter attack, durability | aluminum |
| **Powder coat** | +η ~0.005-0.01 | значительно damped, matte tone | "dead" novelty variants |
| **Patina (brass/copper)** | minimal η, surface texture | micro-texture scatter HF | aged aesthetic |

### 7B.1 Product line implication

Из **одной steel заготовки** → 3 SKU:
- LN-STEEL (raw) — bright reverb
- LN-STEEL-LAQ (lacquered) — smoother
- LN-STEEL-PWR (powder coat) — damped/dark

Razor-and-blades: cartridges = recurring revenue. Coating differentiation = low marginal cost (same plate stock + finishing step).

> **Tap-test protocol** должен включать coated samples — измерить RT60 delta per coating для каждого материала.

---

## 7C. Acoustic feedback risk (live use) — mitigation

> Модуль = exciter→plate→**piezo** chain. На громкой сцене plate резонирует от мониторов через воздух → **acoustic self-oscillation** (не электрическое). Piezo на резонирующей пластине = по сути контактный микрофон.

### Mitigation (Phase 1)

1. **Cartridge slot acoustic gasket** — foam/rubber seal вокруг slot opening снижает airborne coupling к plate.
2. **Piezo HPF** — Block 7 input HPF режет sub-resonances где acoustic coupling сильнее.
3. **Enclosure damping** — внутренняя поверхность корпуса с acoustic foam.
4. **Documentation** — SPEC + manual: "place away from stage monitors / high-SPL sources". Standard для contact-mic instruments.

### Mitigation (Phase 2 если bench подтверждает проблему)

5. **Notch filter** на dominant feedback frequency (tunable).
6. **Plate damping switch** — добавляет mechanical damping (felt против plate) для high-SPL environments.

> **Bench test**: при prototype — measure SPL threshold где acoustic feedback начинается. Если <100 dB SPL (typical stage) → mitigation mandatory. Если >110 dB → acceptable, document only.

---

## 7D. Solenoid strike position — одна фиксированная точка (policy)

> Соленоид зафиксирован в модуле и бьёт в **одну физическую точку**. Ширина пластин варьирует 35–55мм, модальная картина у каждого материала своя. Единой точки, оптимальной для всех восьми материалов, **не существует** — это надо признать и выбрать компромисс явно, а не обещать «оптимум каждому».

### Почему это важно именно для escapement-удара

Snappy-удар (Block 14 rewrite: ~4.4мс, мгновенный release) — **широкополосный импульс**. Его сила в том, что он возбуждает весь модальный спектр разом — но только если попадает в **пучность** (antinode). Точка на узле моды эту моду просто не возбудит: колокольный характер обеднеет ровно на те моды, на чьи узлы легла фиксированная точка данной пластины.

### Policy (v1)

1. **Точка: ~1/3 длины от короткого края (≈33мм), по центру ширины самой узкой пластины** (bone W=35 → центральная зона, то же ограничение что у exciter/пьезо, §3 «Конструктивное ограничение»). 1/3 длины возбуждает и symmetric, и antisymmetric продольные моды (§7A.1 таблица contact point) и избегает узла fundamental.
2. **Одна точка для всех картриджей.** Никакого per-material позиционирования: соленоид не двигается, jitter-актюатор (2-й привод ±0.5мм) отклонён как scope creep на недоказанном ядре.
3. **Стекло НЕ special-case**: требование «бить строго в центр стекла» несовместимо с фиксированным бойком и снято. Защита стекла — annealed вместо tempered (§2) + SOFT drive 3.8V (Block 14.2) + мягкий войлок, а не позиция.

### Что жертвуем (названо явно)

- **Center-symmetric моды широких пластин** (steel/brass W=55): точка в центральной зоне узкой пластины лежит ближе к краю широкой → часть поперечных мод широких пластин недовозбуждена. Для reverb-металлов это приемлемо: их плотный модальный набор (~50+ мод) прощает потерю нескольких.
- **Sparse-материалы (nephrite, slate, glass, bone, ~5-6 мод)** страдали бы сильнее от промаха — поэтому центральная зона выбрана под **их** ширины (35-45мм): у sparse-палитры точка близка к оптимуму, у dense — компромисс. Это осознанный приоритет: колокольные голоса важнее для TOLL, чем reverb-голоса (по ним бить и не главный сценарий).
- **Bench check (Stage 0B)**: tap-test в выбранной точке vs скан по длине на nephrite/glass — подтвердить, что фиксированная точка не сидит на узле доминантной моды. Если сидит — сдвинуть точку на этапе engine bay tooling (до этого она бумажная).

> Связанные документы: Block 14 (`LAST_NIGHT_BUILD.md`) — физика удара; R13 + Stage 0B (`RISK_ASSESSMENT.md`) — unseating; §3 — contact zone constraint.

---

## 8. Расчётная методика (для cartridge engineer)

### 8.1 Уровень 1 — аналитический spreadsheet (1 день, $0)

Excel/LibreOffice с формулами §1. Для каждой комбинации material × h × (a,b):
- Колонки: D, ρh, c_L, f₁₁, n(f), N(<10кГц), RT60
- Готовые значения в §3 таблице — расширить под новые размеры

### 8.2 Уровень 2 — FEM modal analysis (3 дня, $0)

**CalculiX / Elmer / FreeCAD FEM** (бесплатные):
1. Geometry: пластина + точки mounting (magnets/clamp positions).
2. Material: E, ρ, ν per §2.
3. Mesh: shell elements (S4/S8), ~2мм element size.
4. Solve: modal (eigenfrequency) analysis, first 30 modes.
5. Extract: **mode shapes** → определить узлы/пучности → optimal exciter + piezo placement.
6. Damped transient (опционально): Rayleigh damping α,β из η → RT60 prediction.

**Критично**: mode shapes показывают где разместить exciter (на пучности low modes) и piezo (избегать узлов). Это решает "pickup пропускает моды" проблему.

### 8.3 Уровень 3 — электромех LTspice (2 дня, $0)

Механо-электрическая аналогия (масса→L, упругость→C, потери→R). Exciter (lumped TS-like) + plate modes (parallel RLC per mode) + piezo (charge source). Предсказывает frequency response exciter→piezo. Выявляет peaks/nulls/bass rolloff.

### 8.4 Уровень 4 — физический tap-test (1 неделя, ~$50) ⭐ ОБЯЗАТЕЛЬНО

**До любой cartridge tooling**:
1. Заказать сырые пластины каждого материала в размерах §3.
2. Подвесить на нитях (имитация free-free) или на cartridge mount.
3. Tap-test: contact mic (пьезо 27мм) на пластине, удар lightweight молоточком.
4. Запись → FFT в **REW / Audacity** (бесплатно).
5. Измерить: реальные mode frequencies, mode count, decay (T60).
6. Сравнить с §3 предсказаниями. Калибровать модель.
7. **Listen** — звучит ли как reverb (металлы) / bell (nephrite) / knock (bone)?

**Это валидирует всю концепцию за $50 и неделю** до вложений в tooling.

### 8.5 Уровень 5 — exciter+pickup bench (2 недели, после tap-test pass)

Test jig: одна пластина + exciter + dual piezo. Drive sine sweep → measure piezo FFT (реальная transfer function). A/B материалы. Tune drive/pickup points per FEM mode shapes.

---

## 9. Acceptance criteria (production sign-off)

Per `HANDOFF_BRIEF.md` §6.5:
- [ ] Tap-test passed — measured modes within ±20% от §3 predictions.
- [ ] **Cartridge differentiation blind A/B >80%** — listeners отличают материалы.
- [ ] Dense materials (steel/brass/al): подтверждено >40 мод, reverb-character.
- [ ] Sparse materials (nephrite/glass/bone): подтверждён характерный chime/knock + правильный RT60.
- [ ] Marble resolution: slate alternative validated OR marble repositioned percussion.
- [ ] Multi-plate stack (premium): density gain ×2-3 confirmed.

---

## 10. Финальные cartridge размеры (для tooling)

Свод для cartridge engineering — готово к `../00_series/decisions/03_cartridge_standards.md` update:

**v2 (refined per-material h+W)** — bar-vs-plate width logic + nephrite 2мм tough:

| Cartridge | Материал | h (мм) | L×W (мм) | Tier | Character |
|-----------|----------|--------|----------|------|-----------|
| LN-STEEL | Spring steel | 0.3 | **100×55** | core | reverb, long shimmer (wide=dense) |
| LN-BRASS | Brass | 0.5 | **100×55** | core | metallic reverb (wide) |
| LN-ALU | Aluminum | 0.4 | **100×55** | core | bright sustain (wide) |
| LN-OAK | Oak (∥ grain) | 1.8 | **100×45** | core | warm slap (medium) |
| LN-SLATE | Slate | 2.0 | **100×45** | core | stone (replaces marble) |
| LN-GLASS | Annealed glass (не tempered — см. §2 note) | 1.5 | **100×40** | core | crystalline chime (narrow=bar) |
| LN-JADE | Nephrite (tough) | **2.0** | **100×45** | premium | singing bell |
| LN-BONE | Beef bone | 2.5 | **100×35** | premium | dry knock (narrow=percussion) |
| LN-STUDIO | Steel ×3 stack | 0.3 ea | 97/100/103 × 51/53/55 detuned | flagship | dense reverb |
| ~~LN-MARBLE~~ | ~~Marble~~ | ~~3.0~~ | ~~100×45~~ | novelty | superseded by slate (см. §5) |

**Все non-integer aspect ratio** → избегают degenerate modes. Толщины + ширины — character-optimized per material и family (см. §3 логика).

### ⚠ De-risk для v1 / Stage 0 bench

**Рекомендация: на bench и v1 — W=50мм константа для всех** (упрощает фиксированный contact-rig, см. RISK_ASSESSMENT R1). Variable W (таблица выше) — refinement для v2 после того как contact coupling доказан на Stage 0.

---

**End of acoustic modeling v1.0. Tap-test (§8.4) — обязательный gate перед cartridge tooling.**
