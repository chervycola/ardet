# LAST NIGHT — Handoff Brief для R&D и подготовки производства

**Версия канона**: v6.5 (= v6.4 improvements + Decision 11 plate-only cartridge + Block 14 strike-physics rewrite)
**Парный модуль**: Last Day (диптих холода/жары)
**Серия**: System Suicide — 9 модулей физического синтеза
**Целевой ship window**: Phase 1 — months 1-9 от kickoff

**v6.5 changes (vs v6.4)**:
- 🔴 **Decision 11 LOCKED** — картридж = пассивная пластина; трансдьюсеры (exciter/пьезо/соленоид) постоянно в модуле (engine bay, spring contact). Mini-XLR/JST к картриджу устранены.
- 🔴 **Block 14 переписан по verified физике** (adversarial review): TOLL pulse duration ≠ сила удара — это степень демпфирования. Fixed 4.4мс escapement (NE556), RV_TOLL_DUR удалён, SOFT drive 3.8V fixed для всех картриджей (R_SOL 36Ω), Z_SOL fast release, Q_MUTE piezo click mute. **Инженеру: НЕ «удлинять pulse для более сильного удара»** — это перевёрнутая интуиция, которую ревью и похоронило.
- 🔴 **R13** (RISK_ASSESSMENT) — TOLL-удар может срывать пьезо-contact (momentum matching, пьезо-preload 1.5N слабое звено). Stage 0B bench gate обязателен. Диаграмма: `strike_seating_problem.svg`.
- 🔴 Refined per-material plate dims (100×(35-55)×h, см. acoustic_modeling §10); glass = annealed (не tempered — liability); bone = femur cortical (не scapula).

**v6.4 improvements (vs v6.3)** — overlooked items pass:
- 🔴 Bypass trails (buffered bypass option) — reverb-critical UX, true-bypass cuts tail иначе.
- 🔴 Self-oscillation output limiter — safety (FEEDBACK CW может blast).
- 🔴 Power-on/off muting (anti-thump).
- 🔴 CV input protection (BAT85 clamps на 22 jacks) — modular mispatch safety.
- 🟡 Transducer coupling spec (exciter mount + piezo bonding) — часть "звук пластин" риска (acoustic_modeling §7A).
- 🟡 Plate coating tuning + product line (acoustic_modeling §7B) — voicing + revenue.
- 🟡 Calibration procedure (`calibration_procedure.md`) — 12-step trim setup для production.
- 🟡 Cartridge mis-insertion protection (keying + polarized magnets).
- 🔵 Acoustic feedback mitigation documented (acoustic_modeling §7C).
- BOM impact обязательных improvements: ~$5/unit.

**Audit applied changes v6.2 → v6.3**:
- 🔴 Solenoid power split: +12V_RAW pre-DC-DC (исправлен audio rail sag на TOLL pulse).
- 🔴 MCU upgrade: ATtiny85 → ATtiny84A (14-pin DIP) — v6.2 features требуют 9+ GPIO, ATtiny85 имеет только 5.
- 🟡 LM393 reallocation: Block 11 env→trigger reuses Block 18 U_COMP second half.
- 🟡 U4C double-allocation resolved: Block 9 de-emphasis → U2C.
- 🟡 RV_TRIG_THRESH trim (adjustable FG trigger sensitivity).
- 🔵 ~~RV_TOLL_DUR trim (5-22ms TOLL pulse per cartridge tuning).~~ *Superseded в v6.5 — Block 14 rewrite (fixed escapement, трим удалён).*
- Production checklist расширен в §6 (SPICE Nyquist, blind A/B tests, thermal endurance, etc.).

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

**Категория**: **material resonator** (сменные материальные пластины как core medium). НЕ "reverb" — физика 100мм пластины даёт sparse-modal резонатор/chime character, не густой hall. Конкурентов в категории нет. Strymon BigSky класс — competitor только по цене/форм-фактору, не по принципу. Называть "material resonator" честно выставляет expectations (см. risk: sparse modes).

**Этический и эстетический stake**: материалы — wood, stone, metal, glass, bone, nephrite — несут narrative weight серии "System Suicide" (постапокалипсис, ритуальность, физическое распадение). Это **не gimmick** — каждый material cartridge должен звучать радикально различно (свой spectral signature, decay character, mode density). Если все cartridges звучат "одинаково с лёгким тонал-сдвигом" — проект провалился концептуально.

**Производственный sign-off критерий**: после ship Phase 1 любой музыкант-customer должен слышать разницу между oak и nephrite cartridge в blind A/B тесте на >80% trials. Если нет — material cartridge identity false advertising.

---

## 2. Приоритеты, которые НЕЛЬЗЯ компрометировать

В порядке убывающей строгости:

### Tier 1 — sacred (изменение = смерть проекта)

1. **Material plate cartridge** — физическая сменная пластина из реального материала. Не PCB-mounted speaker. Не digital convolution. Plate должна **физически вибрировать** в bending modes под exciter drive. **[Decision 11]**: картридж = **пассивная пластина** (материал + покрытие + рамка + магниты); exciter/пьезо/соленоид — **в модуле** (transducer engine bay), contact coupling. Картридж дёшев ($10-20) → razor-blade модель.
2. **Acoustic-driven envelope** (plate-triggered FG mode) — Block 11 envelope follower → comparator → FG trigger. **Default behaviour без patching**: каждый attack onset на пластине = FG fires одноразовый cycle. Это формирует "instrument отвечает на игру" effect — главная UX feature, отличающая Last Night от любого generic reverb.
3. **Analog Function Generator** (не digital LFO simulation) — TL074 integrator + diode-steered rise/fall RC + 2N3904 matched-pair exp converters. Эмуляция через ATtiny84A DAC недопустима — теряется analog character который пользователь будет слышать в exp curve nonlinearity и в RC charging tail.
4. **LSK489A dual matched JFET** в piezo preamp — не generic 2SK170, не SMD JFET pair. Decision 02 specifically locked LSK489A — это noise floor cornerstone. Substitution = audible SNR degradation.
5. **Cartridge format compatibility** между Last Night и Last Day — same frame 110×65×30mm, same retention magnets + keying. Material plate cartridge (passive, Decision 11) вставляется в обе модели. Если не совместимы — диптих ломается.

### Tier 2 — high importance (compromise требует написанного решения)

6. **4 footswitches mockup canon names**: TAP / GATE-CRUSH / BYPASS / FREEZE — не переименовывать. Если в production embedded mechanic решит переименовать на STOMP1 / STOMP2 — отказать.
7. **Always-on phaser** — нет per-effect bypass, нет ON/OFF toggle. Bypass только через master BYPASS footswitch (true relay bypass всего модуля). Phaser = signature character, дocking его опциональным = нарушение identity.
8. **Solenoid физический контакт с пластиной** — не симуляция через convolution, не digital "bell strike sample". Solenoid физически бьёт по пластине, пластина акустически отвечает, piezo снимает резонанс.
9. **Bank Mode preset slider**: DIRTY / WARM / DARK / VOICE / MIX — 5 позиций, 4P5T topology, hardware-only (no MCU). DIRTY = noise color LPF + moderate reverb saturation. VOICE = vocal-formant mid-emphasis. См. Block 20 R-bank table.
10. **Dual SKU** — 40HP Eurorack + big-box pedal 203×140mm, **идентичная схема**. Cartridge сменяется между SKU. Один customer может купить pedal сейчас, Eurorack позже — sound bit-for-bit identical.

### Tier 3 — strong preference

11. **Phase/Flutter** — single continuous knob (не 3 отдельные phaser controls). Morph между мягкое phasing → resonant → controlled self-oscillation.
12. **FG output exposed via 4 jacks** (EG OUT main + Gate + Sub÷2 + Inv) — FG не private к phaser, может патчиться куда угодно через CV bay. Это распахивает modular usefulness в 10× по сравнению с typical reverb pedal.
13. **Piezo pickup — module-internal contact** (Decision 11), не на картридже. Hi-Z пьезо разведён коротким shielded проводом к JFET preamp на module PCB → не пересекает swappable разъём → ниже noise floor. (Прежний mini-XLR cartridge interface устранён.)

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

0. **`RISK_ASSESSMENT.md`** — ⚠ ПЕРВЫМ. Честный risk-register + bench-prototype protocol. Stage 0 (contact coupling + material A/B) — обязательный gate ПЕРЕД любым PCB/tooling/закупкой. Не тратить деньги пока Stage 0-1 не passed.
1. **`signal_flow_last_night.svg`** (обязательное чтение).
2. **`LAST_NIGHT_BUILD.md`** — детальная build documentation, 25 функциональных блоков с R/C values, BOM, PCB zones, verification.
3. **`PCB_DESIGN_SPEC.md`** — KiCad-ready PCB design spec: 6 PCB inventory (main + adapters + satellites + dock), XY coordinates всех component groups, layer stackup, ground topology, ribbon pinouts, critical traces.
4. **`audit/13_schematic_cross_reference.md`** — сверка с logical schematic ASCII (источник истины по топологии).
5. **`audit/wood_reverb_logical_schematic.html`** — ASCII-art каркас оригинальной v2.0 схемы.

### Для production / sourcing manager

1. **`BOM_SOURCING.md`** — purchasing guide для small-batch (20 units): part numbers, дистрибьюторы, qty+буфер, lead time, risk register. **Топ-приоритет: SL-4P5T sourcing + LSK489A буфер.**
2. **`decisions/10_premium_components_sourcing.md`** — Elite tier components + sourcing matrix (Mouser, Digi-Key, Mundorf, Audio Note UK).
3. **`decisions/04_production_strategy.md`** — phases roadmap.
4. **`decisions/03_cartridge_standards.md`** — cartridge format спецификация.
5. **`cartridges/*.md`** — processing manuals для bone и nephrite (другие материалы TBD).

### Для acoustic / cartridge engineer

1. **`acoustic_modeling.md`** — modal density calculator + acoustic-optimized cartridge dimensions per material (plate theory), two-family classification, multi-plate stack design, **tap-test protocol (обязательный gate перед cartridge tooling)**.
2. **`audit/11_last_night_acoustic.md`** — acoustic reality check (corrected RT60 ranges).

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
| Decision 03 (cartridge standards) | Frame 110×65×30mm, 4 magnets + retention pin. *Connectors superseded by Decision 11 — картридж пассивный, трансдьюсеры в модуле.* |
| Decision 11 (cartridge architecture) | **LOCKED** — passive plate cartridge + in-module transducer engine (contact coupling). |
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

### 6.1 Documentation review (week 1)
- [ ] R&D engineer прочитал signal_flow_last_night.svg + LAST_NIGHT_BUILD.md.
- [ ] BOM verified против sourcing matrix (Decision 10).
- [ ] Footswitches mockup canon names confirmed на silkscreen.
- [ ] Bank Mode slider labels CONFIRMED (DIRTY / WARM / DARK / VOICE / MIX).

### 6.2 Schematic validation (weeks 2-3, pre-PCB)
- [ ] **🔴 SPICE Nyquist analysis** feedback loop с RLC model каждого cartridge material (Q range 50 для oak до 1000 для spring steel). Verify gain margin >6dB, phase margin >45° на feedback knob maximum. Без passes — добавить attenuator в feedback path.
- [ ] **🔴 Power budget verification** — confirm solenoid wired к +12V_RAW, не к +12V_audio. Probe DC-DC output rail during TOLL pulse — должна оставаться flat (<5mV ripple на load step).
- [ ] **🔴 ATtiny84A pin allocation review** — verify firmware fits в 12 GPIO (всё в Block 18 firmware table). Если не fits — добавить shift register или upgrade к ATtiny441.
- [ ] **🟡 LM393 reallocation** confirmed в schematic — Block 11 env→trigger comparator uses U_COMP (Block 18 LM393 second half, originally tagged "tap detection" but unused since TAP routes к MCU PCINT).
- [ ] **🟡 U4C/U2C reallocation** confirmed — Block 9 de-emphasis uses U2C (spare TL074 quarter), Block 7 retains U4C exclusively.

### 6.3 PCB design (weeks 3-5)
- [ ] PCB layout drafted в KiCad (zone diagram → реальная разводка).
- [ ] Power planes split: AGND / DGND / PGND с single-point star tie на J_PWR.
- [ ] JFET preamp Z4 separated >25mm от phaser Z10 (Iabc bus radiation).
- [ ] Solenoid driver Z8 >40mm от piezo input Z4 (EMI).
- [ ] ATtiny84A digital clock (Z13) >30mm от Z4 + GND moat.

### 6.4 Prototype bench tests (weeks 6-8)
- [ ] Solenoid thermal endurance test — STALL CV high 60s, IR thermometer на coil <70°C. Если выше — confirm ATtiny84A PWM throttle к 40% duty.
- [ ] **🔴 JFET preamp SNR measured** — open-input noise floor <-90 dBV referenced к pickup input. Если хуже — investigate bias resistor noise (consider raise to 100MΩ or 1GΩ).
- [ ] FG plate-triggered mode — confirm reliability across input dynamics range (soft pick / hard pluck / sustained tone). RV_TRIG_THRESH default adjustment.
- [ ] Phase/Flutter knob taper feel — log taper, audible phasing at 10% rotation, controlled self-osc at 95%+.
- [ ] FG depth slider mapping — 10% depth = audible но subtle phaser modulation, 100% = full 4-octave sweep.
- [ ] TOLL escapement verification (Block 14 rewrite): coil pulse 4.4мс ±10%, ток спадает <0.6мс после gate-off (Z_SOL), MUTE window закрывает transit-click, нет unseating-артефакта в первые 5мс (R13). Per-material adjustment **упразднён** — fixed pulse для всех.

### 6.5 Material cartridge validation (weeks 6-10, parallel)
- [ ] **🔴 Material plate cartridge prototyped** — все 6 materials (oak / spring steel / marble / glass / bone / nephrite) изготовлены.
- [ ] **🔴 Cartridge differentiation blind A/B test** — 10 listeners blind name material из same input signal. Target accuracy: >80%. **Если меньше — пересмотр design** (thicker materials, larger plates, decoupling mount).
- [ ] FFT spectral signature comparison per material — visibly distinct decay envelopes + mode density.
- [ ] Decay time measurement per material — confirm corrected reality-check claims (oak 0.1-0.3s, marble 0.8-2s, spring steel 2-6s, glass 0.5-1.5s, bone 0.05-0.2s, nephrite 1-3s).
- [ ] Feedback drone musicality per cartridge — все materials produce listenable self-osc tone (not just "noise").

### 6.6 Sound design validation (weeks 8-10)
- [ ] **🔴 Bank Mode preset blind A/B** — 10 listeners blind identify preset (DIRTY/WARM/DARK/VOICE/MIX) из sound character. Target accuracy: >70%. Если меньше — adjust R-bank values (VOICE specifically may need +4dB boost вместо +2dB).
- [ ] Stereo image stability cross-cartridge — same patch settings, swap cartridges, stereo width должен оставаться stable.

### 6.7 Pre-production (weeks 10-12)
- [ ] First 10-unit pre-production batch для closed beta перед public ship.
- [ ] Beta tester feedback collected (>5 testers, 2-week minimum use period).
- [ ] Final BOM lock после bench validation.

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

> **"Last Night" — это не reverb pedal. Это material resonator со сменным physical core, signal-driven envelope generator, и performance gestures grounded в acoustic mechanical truth. Если в production процессе что-то превращается в "просто ещё один reverb" — значит вы потеряли проект.**

> **Это значимое культурное и техническое заявление в категории, где её ещё нет. Делайте medecindo.**

---

**End of handoff brief. См. `signal_flow_last_night.svg` для визуальной архитектуры.**
