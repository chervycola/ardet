# Системная архитектура SYSTEM SUICIDE — 9-модульная цепь

Анализ согласованности системы: роли модулей, сигнальная цепь, HP-бюджет, сценарии использования, перформанс ergonomика.

---

## A. Матрица ролей

| # | Модуль | Роль в цепи | Alternative? | Уникальность |
|---|--------|-------------|---------------|--------------|
| 1 | I Show You Light | Sound source (VCO) | Любой OSC | Оптический tonewheel, unique |
| 2 | Body Blood And Salt | Wet processor / synth | Filter + VCA | Liquid audio path, unique |
| 3 | All Bones Dust | Distortion / sat | Any sat pedal | Physical rattle + transformer, unique |
| 4 | Be Careful | Filter | Any filter | Glass material — if delivered, unique |
| 5 | Fuck Abandoned Sleep | LFO / modulator | Any LFO | Physical pendulum, unique visual |
| 6 | Is My | Clock router / switch | Plug-and-play | Undefined (see C6 в `50_`) |
| 7 | Last Day | Delay + sat finalizer | Any delay+amp | Oil can + solar + resonant EQ, unique |
| 8 | And My | TBD | Unknown | **Undefined (see C8)** |
| 9 | Last Night | Reverb finalizer | Any reverb | Physical plate cartridges, unique |

**Сильные стороны**:
- 7 из 9 модулей имеют **уникальную физическую концепцию**. Это **differentiator** от mainstream Eurorack.
- Clear progression: source → processing → space.
- Thematic coherence (post-apocalyptic naming + materials).

**Слабости**:
- **2 модуля undefined** (Be Careful architecture wavering, And My полностью TBD).
- **1 модуль triple-defined** (Is My).
- **Roles redundantly covered** in some places — например, distortion происходит в BBAS (electrochemical) и ABD (transformer+rattle). Overlap.

---

## B. HP-бюджет — фактический vs. заявленный

### Заявлено: ~142HP (исходная таблица системы)

### Final canonical sizing (v3 после user decisions):

| Модуль | HP final | Notes |
|--------|----------|-------|
| I Show You Light | 16 | Optical tonewheel VCO |
| Body Blood And Salt | 20 | Touch v1 / liquid v5 |
| All Bones Dust | 10 | Transformer + rattle |
| Be Careful | 14 | Glass plate resonator |
| Fuck Abandoned Sleep | 14 | Pendulum LFO с visible window |
| Is My | 8 | Vactrol crossfade + clock switcher |
| Last Day | 40 | Oil can + Solar + Resonant EQ |
| And My | 8 | Day↔Night crossfader |
| **Last Night** | **40** | **Reverb с swappable cartridges (flagship size, зеркальная пара к Last Day)** |
| **Sum (без BBAS, Phase 1–4)** | **150 HP** | Phase 5 BBAS добавит +20 |
| **Sum (с BBAS)** | **170 HP** | |

**Fits**:
- **150 HP без BBAS** — два ряда 84HP (168 total) с запасом 18HP для utilities (mults, attenuverters).
- **170 HP с BBAS** — нужен 3-row setup (3×84 = 252HP) или skiff с extra.

**Vedict**: HP budget **healthy** при canonical 40HP Last Night. Аligns с original system table claim ~142HP (small variance due к decisions: BBAS deferred, Be Careful filled 14HP, FAS bumped to 14HP, Is My to 8HP).

**Decision**: Last Night = **40HP flagship** (зеркальный пара к Last Day 40HP, аналогично symmetric Day/Night design).

---

## C. Сигнальная цепь

### Заявленная:

```
I Show You Light → BBAS → ABD → Be Careful → Is My → Last Day → Last Night → OUT
                                                      ↑
                              (Fuck Abandoned Sleep — CV sideband)
                              (And My — TBD)
```

### Критика:

- **Is My** между Be Careful и Last Day — если это switch, может прервать flow. Нужно документировать normal bypass.
- **And My** между Last Day и Last Night — если crossfader (как recommended в `30_`, C8), это meaningful. Если undefined — разрыв цепи.
- **Fuck Abandoned Sleep** off-chain (CV only) — OK, как и любая LFO.

### Проблема: недостаточно patch-points

Серия из 9 модулей с **единственной linear chain** — жёсткая. Нет:
- Feedback returns.
- Parallel buses.
- Auxiliary sends.
- External effects loops.

**Ожидание пользователя** Eurorack: **modular flexibility** — любой модуль может отдать сигнал в любой следующий. Current chain описана как "основной путь", но альтернативные patches (шесть примеров в брифе) показывают, что система flexible. Это **хорошо**.

**Recommend**: добавить в системную документацию explicit **patching guide** с примерами. Это повышает perceived value (пользователь видит возможности, не ограничения).

---

## D. Перекрытие ролей (redundancy analysis)

### Distortion / saturation происходит в:

1. **ABD** — transformer saturation + mechanical rattle (physical).
2. **Last Day** — solar amp starved (crunchy), oil can (warm deg).
3. **BBAS** — electrochemical nonlinearity (wet dist).
4. **Last Night** — LED clipper (clean safety).

**Four locations doing distortion**. Это **feature**, не bug — each colored differently. Но пользователь может перегрузить, если plays все четыре одновременно.

### Modulation происходит в:

1. **Fuck Abandoned Sleep** — pendulum LFO (natural).
2. **Last Day HAZE** — motor speed mod (физический wow).
3. **I Show You Light** — light modulation (inherent в tonewheel).

**Three modulators**. Less overlap — each is different в rate и character.

### Filtering:

1. **Be Careful** — main filter (если delivered).
2. **Last Day EQ** — 3-band EQ (low/mid/high).
3. **Last Night** — tone filter + pre/de-emphasis.

**Three filters**. Last Night tone — tiny 1-pole, не full filter. Last Day EQ — 3-band, semi-full. Be Careful — main (unknown architecture).

**Vedict**: redundancies **intentional** для depth of tone-shaping.

---

## E. Use case scenarios

### Scenario 1: "Drone Cathedral" — ambient

```
I Show You Light (low speed drone, 40Гц)
  → BBAS (жидкость даёт формантность)
    → Be Careful (glass resonance, high Q, self-osc edge)
      → Fuck Abandoned Sleep CV → slow swell (rate mod)
        → Last Night (stone plate, long decay, FREEZE)
          → OUT
```

**Работает?** Да. Все модули в chain имеют clear role. Fuck Abandoned Sleep как side-modulation — correct patch.

**Ergonomика**: пользователь настраивает 7 модулей. Каждый ~5 ручек. ~35 decision points per patch. **Tight learning curve, но rewarding**.

### Scenario 2: "Red Mirage" — dub

```
External audio (DJ deck)
  → Last Day (SUN low = crunchy, касторовое oil, high FB)
    → KILL → DRAG → повторы тонут
      → Last Night (wood plate, long decay)
        → OUT
```

**Работает?** Да. Только 2 модуля из 9 — **overkill для dub**. Пользователь dub не нужен все 9 модулей. Вопрос: **окупается ли 9-модульная система для dub usage?**

Вывод: **Last Day + Last Night как pair** — coherent standalone product. Остальные 7 — expansion для synth/noise/ambient usage. Для dub market — двухмодульный SKU.

### Scenario 3: "Full chain" — используем всё

9 модулей — 50+ decision points, 30+ patch cables. **Complex**. Только для dedicated studio user.

**Vedict**: система **scalable** — можно купить part, позже expand. Это хорошо для sales.

---

## F. Performance ergonomика

### Панель-layout проблемы:

- **10 pots в Last Night 40HP** — 12мм center-to-center × 10 = 120мм ширина. Панель 40HP = 203мм. **Помещается в один горизонтальный ряд** с большим запасом (40HP flagship resolves layout constraint).
- **Last Day 40HP** — 40 pots × 6 subsystems. Layout challenging. Необходим grouping + labeling.
- **Маятник Fuck Abandoned Sleep 8HP** — visible window + 3 pots + 2 jacks + gate output. Tight but doable.

### Hand reach:

- В 168HP (two rows) modular system, reaching between rows requires 2 hands or careful routing.
- **Performance KILL button** на Last Day должен быть в easy reach — bottom row, prominent.
- **FREEZE на Last Night** — similar.
- **CRASH на Last Day** — должен быть RED BIG button, visually obvious.

**Recommend**: **perform-zone** на Last Day и Last Night — large dedicated buttons (30×30мм minimum) для gigging.

### Visibility:

- **Маятник Fuck Abandoned Sleep** через окошко — **visual feature**. Don't hide.
- **Solar cell Last Day** — **visible interaction** (hand shadow).
- **Pendulum oscillation** rate — visible, slow enough для eye.

**Score ergonomics**: system designed для performance with physical interaction. Unique selling point против digital modules.

---

## G. Modularity и expansion

### Current system = 9 fixed modules.

**Question**: если один модуль fails / sells worse / technology evolves, что дальше?

**Recommend**: design system as **kit + expansion**:
- **Core kit** = Last Night + Last Day + utility (3-4 modules).
- **Expansion 1** = I Show You Light + Fuck Abandoned Sleep (source + mod).
- **Expansion 2** = ABD + Be Careful (color).
- **Wild card** = BBAS, Is My, And My (experimental, late).

Это позволяет:
1. Продавать part, expand later.
2. Gradual R&D (core first, expansion parallel).
3. Customer journey (start small, build up).

---

## H. Brand identity и positioning

### Strength:
- **Post-apocalyptic theme** consistent через all modules.
- **Physical synthesis** as differentiator.
- **Thematic bitter names** — memorable, taste-specific.
- **Title / song quote** ("I show you light, body blood and salt... last night") — поэтическая целостность.

### Risk:
- **Niche** — not every musician wants "Body Blood And Salt" module. Brand appeals to specific demographic.
- **Names are aggressive** — некоторые rack builders (brand-new, consumer) might bounce off.

### Positioning:
- Target: **noise / experimental / boutique Eurorack** community.
- Retailers: **Schneiders (Berlin), Control (NYC), Perfect Circuit** — not Sweetwater.
- Pricing: **premium** ($300–700 per module) — niche price tolerance higher.

---

## I. Overall system verdict

### Strength
- 7 of 9 modules have unique physical concepts.
- Thematic coherence strong.
- Scalable (buy piece by piece).
- Performance-oriented (physical interaction).

### Weakness
- 3 modules under-specified (Be Careful, Is My, And My).
- HP-budget inconsistency (Last Night 20 vs 40 discrepancy).
- Oneformula signal chain could be more flexible (patching guide helps).
- Ambitious R&D scope (9 modules с physical elements).

### Reaalistic shipping roadmap:

| Phase | Duration | Content |
|-------|----------|---------|
| 1 | 6–12 mo | Last Night + All Bones Dust (flagship + cheap first) |
| 2 | 12–18 mo | Last Day + Fuck Abandoned Sleep |
| 3 | 18–24 mo | I Show You Light + Be Careful (after decision) |
| 4 | 24–36 mo | Is My + And My (after definition) + BBAS (if safety solved) |

**Phase 1 is critical** — если Last Night + ABD не продаются, остальное не имеет смысла. Test market first.

---

## J. Action items

1. **Update HP spec** — Last Night = **40HP flagship** in system table (matches original brief claim, mirrors Last Day 40HP).
2. **Define Be Careful architecture** — single concept.
3. **Define Is My** — single function.
4. **Define And My** — recommended: Last Day↔Last Night crossfader.
5. **Document patching guide** in product manual — шесть alternative patches.
6. **Perform-zones** on Last Day и Last Night — large dedicated buttons.
7. **Roadmap with phases** — communicate to customers roadmap (maintain anticipation).
8. **Core + Expansion strategy** — start with Last Night + ABD, expand later.
