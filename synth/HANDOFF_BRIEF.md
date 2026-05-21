# LAST NIGHT — Handoff Brief для R&D и подготовки производства

**Версия канона**: v6.2 (panel + Function Generator + trigger architecture)
**Парный модуль**: Last Day (диптих холода/жары)
**Серия**: System Suicide — 9 модулей физического синтеза
**Целевой ship window**: Phase 1 — months 1-9 от kickoff

---

## ⚠ Перед началом работы — прочитать это

Этот документ — **executive handoff brief** для R&D и production teams. Содержит:
1. Стратегические приоритеты, **которые нельзя компрометировать**.
2. Список всех источников канона + порядок чтения.
3. Decision boundaries — что зафиксировано vs остаётся открытым.
4. Структурная схема в **`signal_flow_last_night.svg`** — обязательное чтение перед любой работой со схемой.

---

## 1. Значимость проекта

**Last Night — флагман серии System Suicide**. Это не один из 9 модулей среди равных — это **identity-bearing piece**, через которую формируется brand recognition. Все стратегические дизайн-решения по Last Day и сателлитам подчиняются Last Night canon (через диптих + cartridge format совместимость).

**Категория**: постапокалипсис-ревербератор с физическим resonator (сменные материальные пластины как core medium). Конкурентов в категории нет — Last Night создаёт **новую market niche**, не клонирует существующую (Strymon BigSky класс — competitor только по цене и форм-фактору, не по принципу работы).

**Этический и эстетический stake**: материалы — wood, stone, metal, glass, bone, nephrite — несут narrative weight серии "System Suicide" (постапокалипсис, ритуальность, физическое распадение). Это **не gimmick** — каждый material cartridge должен звучать радикально различно (свой spectral signature, decay character, mode density). Если все cartridges звучат "одинаково с лёгким тонал-сдвигом" — проект провалился концептуально.

**Производственный sign-off критерий**: после ship Phase 1 любой музыкант-customer должен слышать разницу между oak и nephrite cartridge в blind A/B тесте на >80% trials. Если нет — material cartridge identity false advertising.

---

## 2. Приоритеты, которые НЕЛЬЗЯ компрометировать

В порядке убывающей строгости:

### Tier 1 — sacred (изменение = смерть проекта)

1. **Material plate cartridge** — физическая сменная пластина из реального материала. Не PCB-mounted speaker. Не digital convolution. Не piezo-only attachment. Plate должна **физически вибрировать** в bending modes под exciter drive.
2. **Acoustic-driven envelope** (plate-triggered FG mode) — Block 11 envelope follower → comparator → FG trigger. **Default behaviour без patching**: каждый attack onset на пластине = FG fires одноразовый cycle. Это формирует "instrument отвечает на игру" effect — главная UX feature, отличающая Last Night от любого generic reverb.
3. **Analog Function Generator** (не digital LFO simulation) — TL074 integrator + diode-steered rise/fall RC + 2N3904 matched-pair exp converters. Эмуляция через ATtiny85 DAC недопустима — теряется analog character который пользователь будет слышать в exp curve nonlinearity и в RC charging tail.
4. **LSK489A dual matched JFET** в piezo preamp — не generic 2SK170, не SMD JFET pair. Decision 02 specifically locked LSK489A — это noise floor cornerstone. Substitution = audible SNR degradation.
5. **Cartridge format compatibility** между Last Night и Last Day — same frame 110×65×30mm, same mini-XLR + JST, same retention. Если material plate cartridge не вставляется в Last Day slot и наоборот — диптих ломается, перекрёстные patches невозможны.

### Tier 2 — high importance (compromise требует написанного решения)

6. **4 footswitches mockup canon names**: TAP / GATE-CRUSH / BYPASS / FREEZE — не переименовывать. Если в production embedded mechanic решит переименовать на STOMP1 / STOMP2 — отказать.
7. **Always-on phaser** — нет per-effect bypass, нет ON/OFF toggle. Bypass только через master BYPASS footswitch (true relay bypass всего модуля). Phaser = signature character, дocking его опциональным = нарушение identity.
8. **Solenoid физический контакт с пластиной** — не симуляция через convolution, не digital "bell strike sample". Solenoid физически бьёт по пластине, пластина акустически отвечает, piezo снимает резонанс.
9. **Bank Mode preset slider**: DIRTY / WARM / DARK / VOICE / MIX — 5 позиций, 4P5T topology, hardware-only (no MCU). DIRTY = noise color LPF + moderate reverb saturation. VOICE = vocal-formant mid-emphasis. См. Block 20 R-bank table.
10. **Dual SKU** — 40HP Eurorack + big-box pedal 203×140mm, **идентичная схема**. Cartridge сменяется между SKU. Один customer может купить pedal сейчас, Eurorack позже — sound bit-for-bit identical.

### Tier 3 — strong preference

11. **Phase/Flutter** — single continuous knob (не 3 отдельные phaser controls). Morph между мягкое phasing → resonant → controlled self-oscillation.
12. **FG output exposed via 4 jacks** (EG OUT main + Gate + Sub÷2 + Inv) — FG не private к phaser, может патчиться куда угодно через CV bay. Это распахивает modular usefulness в 10× по сравнению с typical reverb pedal.
13. **Mini-XLR (Switchcraft TA3F)** для piezo cartridge interface, не TRS, не JST. Shielding критичен для noise floor — TRS jacks дают audible 50Hz hum при движении cable рядом с power.

---

## 3. Структурная схема — обязательное чтение

> 📐 **Открыть `signal_flow_last_night.svg`** перед чтением остальной документации.

Что показано на структурной схеме (10 зон A-J):
- **A. INPUT & DRIVE** — буфер + pre-emphasis + push-pull driver + R8 5W series limit
- **B. CARTRIDGE** — физическая зона: exciter → material plate → dual piezo + solenoid
- **C. PIEZO SENSE** — LSK489A JFET preamp + de-emphasis + position crossfade
- **D. TONE SHAPING** — Bank Mode 4-pole shelves + tone filter + LED clipper + envelope VCA
- **E. FUNCTION GENERATOR** — primary modulation source (Tides-class analog)
- **F. ENVELOPE FOLLOWER → TRIGGER** — signal-derived trigger pulse → внутренний normal к FG
- **G. NOISE GENERATOR** — continuous zener hiss + Geiger LFSR + COLOR crossfader
- **H. SOLENOID DRIVER** — triple-function DAMP/TOLL/STALL via 3-way diode-OR
- **I. MIX + DESTRUCTION + OUTPUT** — mix bus → Gate/Crush footswitch → output buffer + jacks
- **J. PERFORM GESTURES** — 4 footswitches + 4 modular-advanced CV jacks + 4 FG outputs

**Signal flow direction**: audio path читается left→right (input → cartridge → sense → shape → mix → output). Modulation/control paths нарисованы dashed thin arrows.

**Cartridge** выделен amber background — это **sacred zone**. Все остальные блоки — analog signal processing.

---

## 4. Документация — манифест и порядок чтения

### Для customer / product reviewer (1-1.5 часа)

1. **`LAST_NIGHT_SPEC.md`** — продуктовая спецификация. Что это, как звучит, что в коробке, controls.
2. **`LAST_DAY_SPEC.md`** — парный модуль (для понимания диптиха).
3. **`SYSTEM_SUICIDE.md`** §9 — series brief context.

### Для R&D engineer / прототипирование (4-6 часов)

1. **`signal_flow_last_night.svg`** (вы здесь — обязательное чтение).
2. **`LAST_NIGHT_BUILD.md`** — детальная build documentation, 25 функциональных блоков с R/C values, BOM, PCB zones, verification.
3. **`audit/13_schematic_cross_reference.md`** — сверка с logical schematic ASCII (источник истины по топологии).
4. **`audit/wood_reverb_logical_schematic.html`** — ASCII-art каркас оригинальной v2.0 схемы.

### Для production / sourcing manager

1. **`decisions/10_premium_components_sourcing.md`** — Elite tier components + sourcing matrix (Mouser, Digi-Key, Mundorf, Audio Note UK).
2. **`decisions/04_production_strategy.md`** — phases roadmap.
3. **`decisions/03_cartridge_standards.md`** — cartridge format спецификация.
4. **`cartridges/*.md`** — processing manuals для bone и nephrite (другие материалы TBD).

### Для design / panel engineer

1. **`last_night_pedal_panel.svg`** — Inkscape SVG panel, 203×140mm pedal SKU, grid-aligned 5mm.
2. **`LAST_NIGHT_SPEC.md`** §"Раскладка панели" — текстовое описание layout.
3. **Mockup PNG** (из conversation history — front view ground truth, проверять при сомнениях).

### Для architecture / system decisions

1. **`decisions/08_consolidated_base.md`** — locked Day/Night комбайны base + diptych mapping.
2. **`decisions/09_hybrid_lock.md`** — v5 hybrid → v6 evolution.
3. **`decisions/00_README.md`** — index всех locked decisions.

---

## 5. Decision boundaries (что зафиксировано vs гибко)

### Locked (не пересматривается без явного user sign-off)

| Decision | Что закреплено |
|----------|----------------|
| Decision 02 (Last Day scope) | D2 capacitive pickup, D3 solar optional, D4 manual v1 tongue. *D1 form factor и D5 perform FX superseded by Decision 08.* |
| Decision 03 (cartridge standards) | Frame 110×65×30mm, 4 magnets + retention pin, mini-XLR ×2 + JST-XH ×2. |
| Decision 04 (production strategy) | 5 phases sequential, DIY → contract, tiered pricing. |
| Decision 08 (consolidated base) | Day/Night комбайны base, cold↔hot palette diptych mapping. |
| Decision 09 (v5 hybrid lock) | Mockup canon UX + Decision 08 electrical innovations + Gate/Crush restored. |
| Decision 10 (premium sourcing) | Elite tier $1467 BOM, $2499 retail, LE 25 units serialized. |

### Flexible (открыто к итерациям с R&D team feedback)

- PCB exact layout (zone diagram нарисован — фактическая разводка в KiCad ещё не делалась).
- Block 8 motorized tongue resonator implementation (v2 premium SKU).
- Phase 2 cold palette FX (PULSE/FOG/FROST/CHILL/HUM) — рисунки готовы, prototype validation pending.
- Material cartridge catalogue beyond initial 6 (Phase 3 expansion).

### Open R&D items (требуют bench prototyping перед finalization)

См. **`LAST_NIGHT_BUILD.md`** sections "Verification" внутри каждого block.

Top priority bench tests:
1. **JFET preamp noise floor** — confirm <-90 dBV referenced to piezo input.
2. **Feedback loop stability** — SPICE Nyquist analysis перед prototype build.
3. **Solenoid thermal limit** — STALL mode 60s endurance (max 70°C coil temp).
4. **Bank Mode preset A/B** — все 5 позиций должны быть audibly distinct.
5. **FG plate-triggered mode** — envelope→trigger reliability across input dynamics range.

---

## 6. Hand-off checkpoints

Перед началом production:

- [ ] R&D engineer прочитал signal_flow_last_night.svg + LAST_NIGHT_BUILD.md.
- [ ] PCB layout drafted в KiCad (zone diagram → реальная разводка).
- [ ] BOM verified против sourcing matrix (Decision 10).
- [ ] Material plate cartridge prototyped — все 6 materials звучат различно (A/B blind test passed).
- [ ] Solenoid thermal endurance test (Block 14 verification).
- [ ] JFET preamp SNR measured (Block 7 verification).
- [ ] Footswitches mockup canon names confirmed на silkscreen.
- [ ] Bank Mode slider labels CONFIRMED (DIRTY / WARM / DARK / VOICE / MIX).
- [ ] First 10-unit pre-production batch для closed beta перед public ship.

---

## 7. Контактные точки и эскалация

При возникновении конфликта между:
- **Cost-saving suggestion** vs **Tier 1 priority** → consult original designer перед изменением.
- **Generic component substitution** в active path (LSK489A, LM13700, TL074) → required sign-off.
- **Cartridge format change** → required sign-off.
- **Footswitch label rename** или **Bank Mode position rename** → required sign-off.

**Default**: при сомнении задавать вопрос **до** изменения, не после.

---

## 8. Финальное напоминание

> **"Last Night" — это не reverb pedal. Это physical reverberator с swappable material core, signal-driven envelope generator, и performance gestures grounded в acoustic mechanical truth. Если в production процессе что-то превращается в "просто ещё один reverb" — значит вы потеряли проект.**

> **Это значимое культурное и техническое заявление в категории, где её ещё нет. Делайте medecindo.**

---

**End of handoff brief. См. `signal_flow_last_night.svg` для визуальной архитектуры.**
