# LAST NIGHT — Acoustic Modeling & Cartridge Dimensioning

**Версия**: v1.0
**Назначение**: расчётная де-рискизация главного риска проекта — "звук пластин может быть не очень". Закрывает acoustic concern на бумаге до cartridge tooling.
**Парные документы**: `decisions/03_cartridge_standards.md`, `audit/11_last_night_acoustic.md`, `HANDOFF_BRIEF.md` (Tier 1 sacred #1).

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

Ранние оценки в `audit/11` использовали `n(f) ≈ S/(1.8·c_L·h)` — **константа неверна**. Корректный вывод из Cremer & Heckl "Structure-Borne Sound":

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
| Last Night steel | 100×53×0.3мм | ~56 | resonator reverb |
| Last Night marble | 100×53×3мм | ~3 | bell/clack |

Разница EMT/LN steel ~230×. **Last Night = resonator-class**, density добирается feedback + modulation + (premium) multi-plate stack.

---

## 2. Материальные константы

| Материал | E (ГПа) | ρ (кг/м³) | c_L (м/с) | η (tan δ) | Хрупкость → min h |
|----------|---------|-----------|-----------|-----------|-------------------|
| Spring steel | 200 | 7850 | 5050 | 0.0002 | ductile → 0.3мм |
| Aluminum | 69 | 2700 | 5055 | 0.0001 | ductile → 0.4мм |
| Brass | 100 | 8500 | 3430 | 0.001 | ductile → 0.5мм |
| Glass (tempered) | 70 | 2500 | 5290 | 0.001 | brittle → 1.5мм |
| Marble | 50 | 2700 | 4300 | 0.003 | brittle → 3мм |
| Oak (∥ волокна) | 12 | 700 | 4140 | 0.008 | → 2мм |
| Bone | 18 | 1900 | 3080 | 0.02 | → 2.5мм |
| Nephrite (jade) | 75 | 3000 | 5000 | 0.0005 | brittle → 2.5мм |

> Loss factor спред **100×** (steel 0.0002 → bone 0.02) — главный источник differentiation между материалами. Wave speed спред только ~1.6×.

---

## 3. Оптимизированные размеры — per material

Все пластины: **L×W = 100×53мм** (max площадь в cartridge 110×65мм с mounting margin, non-integer ratio 1.887:1 → избегает degenerate modes). Толщина — по durability материала. Fundamental — SS-оценка (реальный free-free ~0.6× ниже).

| # | Материал | h (мм) | f₁₁ (SS est) | f₁₁ (free-free ~est) | Мод <10кГц | RT60 практич. | Семейство |
|---|----------|--------|-------------|---------------------|-----------|---------------|-----------|
| 1 | **Spring steel** | 0.3 | 330 Гц | ~200 Гц | **56** | 3–8 с | dense reverb |
| 2 | **Brass** | 0.5 | 370 Гц | ~220 Гц | **49** | 2.2 с | dense metallic |
| 3 | **Aluminum** | 0.4 | 440 Гц | ~260 Гц | **41** | 4–10 с | dense bright |
| 4 | **Bone** | 2.5 | 1670 Гц | ~1000 Гц | 10 | 0.11 с | dry knock |
| 5 | **Glass** | 1.5 | 1720 Гц | ~1030 Гц | 9 | 2.2 с | crystalline chime |
| 6 | **Oak** | 2.0 | 1800 Гц | ~1080 Гц | 9 (×1.5 анизотропия ≈ 14) | 0.28 с | warm slap |
| 7 | **Nephrite** | 2.5 | 2710 Гц | ~1630 Гц | 5 | 4.4 с | singing bell |
| 8 | **Marble** | 3.0 | 3700 Гц | ~2220 Гц | 3 | 0.73 с | stone clack (проблемный) |

### 3.1 Расчёт примеры (для воспроизводимости)

**Spring steel 100×53×0.3мм**:
```
D = 200e9 × (0.3e-3)³/10.92 = 0.495 Н·м
ρh = 7850 × 0.3e-3 = 2.355 кг/м²
f₁₁ = 1.571 × √(0.495/2.355) × [(1/0.1)²+(1/0.053)²]
    = 1.571 × 0.458 × 456 = 328 Гц
n(f) = 0.0053/(0.606×5050×0.3e-3) = 0.00578 мод/Гц
N(<10кГц) = 0.00578 × (10000−328) = 56 мод
```

**Marble 100×53×3мм**:
```
D = 50e9 × (3e-3)³/10.92 = 123.6 Н·м
ρh = 2700 × 3e-3 = 8.1 кг/м²
f₁₁ = 1.571 × √(123.6/8.1) × 456 = 1.571 × 3.906 × 456 = 2798 Гц (3мм)
n(f) = 0.0053/(0.606×4300×3e-3) = 0.000678 мод/Гц
N(<10кГц) = 0.000678 × 7202 = 4.9 → округл. сообразно BC ~3 мод
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

**Рекомендация**: **B (slate) для core stone cartridge** + опционально A (marble как percussion novelty). Slate 100×53×2мм:
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
        ├── Plate 1: 100×53мм   (baseline)
        ├── Plate 2: 97×51мм    (−3% → detune вверх ~3%)
        └── Plate 3: 103×55мм   (+3% → detune вниз ~3%)
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

## 7A. Transducer coupling — exciter + piezo (критично к звуку)

> **Главный пробел до v6.4**: размеры пластин оптимизированы, но **способ крепления трансдьюсеров не специфицирован**. Два идентичных steel plate с разным coupling/bonding звучат по-разному. Это часть "звук пластин" риска.

### 7A.1 Exciter coupling

| Параметр | Опции | Влияние | Рекомендация |
|----------|-------|---------|--------------|
| **Mount type** | rigid (жёсткий винт) vs compliant (rubber uncoupler) | rigid → больше energy transfer + plate-frame coupling (рама звенит); compliant → чище plate modes | **Compliant** (rubber grommet) — изолирует plate от frame resonances |
| **Contact point** | center / 1/3 length / edge | center драйвит symmetric modes, давит antisymmetric; 1/3 point драйвит широкий mode set | **~1/3 от края** (драйвит и symmetric и antisymmetric моды) |
| **Pre-load force** | light / medium / heavy | слишком light → buzz/rattle; heavy → damping, давит моды | medium, **calibrated torque** (spring washer на M3) |
| **Coupling compound** | dry contact / silicone grease / epoxy bond | dry → micro-rattle; grease → clean transfer; epoxy → permanent но cracks | **Thin silicone coupling pad** (replaceable, clean transfer) |

**Drive point оптимизация per FEM**: после FEM modal analysis (§8.2) — разместить exciter на **пучности** низких мод (max displacement), избегать узлов. Для 100×53 пластины ~1/3 от короткого края обычно good compromise.

### 7A.2 Piezo bonding

| Метод | Pros | Cons | Рекомендация |
|-------|------|------|--------------|
| **Cyanoacrylate (CA)** | thin bond line, good HF transfer | brittle, cracks под vibration over time | прототип only |
| **Epoxy (slow-cure)** | strong, durable | thicker bond → HF rolloff, cracks eventually | acceptable |
| **Mechanical clamp + couplant** | replaceable, no crack | bulkier, pressure-dependent | durability builds |
| **Double-sided acrylic tape (VHB)** | compliant, durable, easy | softer HF coupling | **рекомендуется** — VHB durable под vibration, slight compliance OK |

**Piezo placement**: dual piezo (A near exciter = bright/early, B far = diffuse/late) per FEM mode shapes. **Избегать узлов** доминирующих мод — иначе piezo не слышит эти моды. FEM mode shape map → optimal piezo coordinates.

### 7A.3 Bench validation (обязательно)

Tap-test (§8.4) + exciter bench (§8.5) должны A/B сравнить:
- 3 exciter mount types (rigid / compliant / pad)
- 3 piezo bonding methods (CA / epoxy / VHB)
- → выбрать комбинацию по: clean mode transfer + durability (10000 strike cycles) + consistent unit-to-unit.

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

Свод для cartridge engineering — готово к `decisions/03_cartridge_standards.md` update:

| Cartridge | Материал | h (мм) | L×W (мм) | Tier | Character |
|-----------|----------|--------|----------|------|-----------|
| LN-STEEL | Spring steel | 0.3 | 100×53 | core | reverb, long shimmer |
| LN-BRASS | Brass | 0.5 | 100×53 | core | metallic reverb |
| LN-ALU | Aluminum | 0.4 | 100×53 | core | bright sustain |
| LN-OAK | Oak (∥ grain) | 2.0 | 100×53 | core | warm slap |
| LN-GLASS | Tempered glass | 1.5 | 100×53 | core | crystalline chime |
| LN-BONE | Beef bone | 2.5 | 100×53 | premium | dry ritual knock |
| LN-JADE | Nephrite | 2.5 | 100×53 | premium | singing bell |
| LN-SLATE | Slate | 2.0 | 100×53 | core | stone (replaces marble) |
| LN-MARBLE | Marble | 3.0 | 100×53 | novelty | percussion clack |
| LN-STUDIO | Steel ×3 stack | 0.3 ea | 97/100/103 × 51/53/55 | flagship | dense reverb |

**Все non-integer aspect ratio** (1.887:1 для 100×53) → избегают degenerate modes. Толщины — durability-optimized per material.

---

**End of acoustic modeling v1.0. Tap-test (§8.4) — обязательный gate перед cartridge tooling.**
