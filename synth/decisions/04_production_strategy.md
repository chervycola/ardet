# Production strategy — запуск серии

Сквозные вопросы по организации выпуска: roadmap sequencing, batch sizes, pricing, distribution. Требуется решений со стороны пользователя для согласования R&D с business model.

---

## P1. Roadmap phasing

### Текущее состояние
Брифе предложены 4 фазы ("Quick Wins / Mechanical Core / Hard Ones / System Integration"). Разные модули разной готовности.

### Рекомендованный roadmap (revised после аудита):

**Phase 1 — Flagship + Simple** (6 мес)
- **Last Night** (16HP Eurorack, после fixes).
- **All Bones Dust** (10HP, simple — transformer sat + rattle).
- **Utility bundle**: mult, attenuator-mixer (standardized).

Goal: establish brand, validate cartridge concept, generate cashflow.
Retail: Last Night $350 + All Bones Dust $200 + utility $80.
Target sales: 100 Last Night + 50 All Bones Dust = ~$55k revenue.

**Phase 2 — Pair + Crossfade** (12 мес после P1)
- **Last Day** (40HP, долгий R&D — параллельный start с P1).
- **And My** (Last Day↔Last Night crossfader, 8HP).
- **Is My** (vactrol crossfader, 6HP).

Goal: complete "Day/Night" diptych, performance-oriented bundle.
Retail: Last Day $700 + And My $150 + Is My $120.

**Phase 3 — Source + Modulator** (18 мес после P1)
- **I Show You Light** (optical tonewheel VCO, 16HP).
- **Fuck Abandoned Sleep** (pendulum LFO, 10HP).

Goal: complete sound source layer, add physical modulation.
Retail: $300 + $200.

**Phase 4 — Filter** (24 мес после P1)
- **Be Careful** (glass plate resonator, 14HP).

Goal: filter/resonator layer completes signal chain.

**Phase 5 (optional) — Experimental** (30+ мес)
- **Body Blood And Salt** (simplified touch-only, 10HP).

Goal: add outlier если business stable.

### Рекомендация

**Sequential Phase 1 → 2 → 3 → 4, parallel R&D на Phase 2 starts during Phase 1 ship**.

Benefits:
1. Revenue from Phase 1 funds Phase 2.
2. Learning from Phase 1 (production issues, customer feedback) informs Phase 2 design.
3. Manageable cognitive load (не 9 concurrent projects).

### Требуется от пользователя

1. Approve 5-phase sequential roadmap.
2. Confirm timeline (6 мес phases, или shorter/longer?).
3. Commit Phase 1 scope (Last Night + All Bones Dust).

---

## P2. Manufacturing scale

### Варианты

**A. Fully in-house DIY**
- Pack modules yourself в home workshop.
- Hand-soldering для small batches.
- Limit: 5–10 units/week.
- Max scale: 200–500 units/year (fulltime person).

**B. Contract PCB assembly + manual final assembly**
- PCB assembled by JLCPCB/PCBWay (SMD mount).
- THT components hand-soldered by you или contractor.
- Limit: 20–50 units/week.
- Max scale: 1000–2000 units/year.

**C. Contract manufacturing (CM) — turnkey**
- CM handles PCB + assembly + testing + packaging.
- You provide design, marketing, sales.
- Limit: CM capacity (high).
- Min batch: 100+ units per run.

### Рекомендация: **A для Phase 1, B для Phase 2+, C для Phase 3+**

Обоснование:
1. Phase 1 — prove concept, small batches manageable solo.
2. Phase 2 — scaling up, contract PCB assembly saves labor.
3. Phase 3+ — business has momentum, contract mfg frees you для R&D.

### Требуется от пользователя

Decide starting scale — A / B / C.

---

## P3. Pricing strategy

### Текущие цены (проекция, после BOM recalc)

| Module | BOM (budget) | BOM (premium) | Retail budget | Retail premium |
|--------|--------------|---------------|---------------|----------------|
| Last Night | $89 | $107 | $350 | $400 |
| All Bones Dust | $40 | $55 | $180 | $220 |
| Last Day | $250 | $350 | $750 | $900 |
| And My | $50 | $65 | $150 | $200 |
| Is My | $40 | $55 | $120 | $150 |
| I Show You Light | $120 | $160 | $300 | $400 |
| Fuck Abandoned Sleep | $80 | $110 | $200 | $280 |
| Be Careful | $100 | $140 | $280 | $350 |
| Cartridge (typical) | $35 | $80 | $80 | $180 |

### Gross margin anlysis

Budget SKUs: 70–75% margin (типичный для boutique после distribution 30–40% cut).
Premium SKUs: 75–80% margin.

### Pricing strategy options

**A. Budget aggressive** (цена = BOM × 3)
- Снижает цены, увеличивает volume.
- Smaller margin, более competitors.
- Target: volume play.

**B. Premium boutique** (цена = BOM × 4)
- Higher margin, fewer units.
- Brand premium positioning.
- Target: boutique Eurorack market (Schneidersladen, Control, Noise Engineering).

**C. Tiered** (budget + premium SKUs)
- Budget SKU: entry-level.
- Premium SKU: same module с upgraded components.
- Both sold same product page.
- Customer choice.

### Рекомендация: **C (Tiered)**

Обоснование:
1. Fits boutique market (premium) AND entry price point (budget).
2. 2× SKU complexity но significant market coverage.
3. Premium SKU margin supports R&D reinvestment.

### Требуется от пользователя

Approve tiered pricing, commit на retail targets.

---

## P4. Distribution

### Channels

**A. Direct only (own webshop)**
- Full margin (no distribution cut).
- Direct customer relationship.
- You handle: marketing, customer service, shipping, returns.
- Limit: your time + shipping logistics.

**B. Distribution partners**
- Schneidersladen (Berlin) — boutique Eurorack hub.
- Control (NYC) — US boutique hub.
- Perfect Circuit (LA) — US mass-market.
- They take 30–40% cut.
- Handle marketing, shipping.

**C. Hybrid**
- Direct для first buyers, early adopters (free shipping, preorders).
- Distribution для scale (Schneiders etc.) after Phase 1 ship.

### Рекомендация: **C (Hybrid)**

Phase 1 и 2 — direct only (build audience, cashflow).
Phase 3+ — distribution partners (expand reach).

### Требуется от пользователя

Approve distribution timeline.

---

## P5. Pre-order / crowdfunding

### Варианты

**A. Kickstarter campaign**
- Phase 1 preorder funding (раскрут brand + initial capital).
- Risk: delivery delays hurt reputation.
- Kickstarter overhead 5%.
- Bias к digital audience — может не overlap с Eurorack community.

**B. Self-hosted preorders (own site)**
- No overhead.
- Smaller audience reach.
- More control over delivery timeline.

**C. No preorder — build on demand**
- Money upfront required (from savings or loans).
- Less risk to reputation.
- Slower initial growth.

### Рекомендация: **B (Self-hosted preorders)**

Обоснование:
1. Keep margin.
2. Control timeline.
3. Eurorack community knows то, что preorders — common boutique practice (Make Noise, Mutable Instruments).

### Требуется от пользователя

Decide funding strategy для Phase 1.

---

## P6. Brand identity

### Current branding elements

- Name: **SYSTEM SUICIDE**.
- Thematic lyric: "I Show You Light, Body Blood And Salt, All Bones Dust. Be Careful, Fuck Abandoned Sleep. Is My Last Day And My Last Night".
- Aesthetic: post-apocalyptic, physical materials, ritual.
- Unit naming: "Last Night", "Last Day" etc.

### Considerations

**Pros**:
- Distinctive, memorable.
- Strong thematic coherence.
- Targets specific demographic (noise/experimental).

**Risks**:
- "Suicide" в названии triggers content policy on some platforms (Instagram ads, etc.).
- Potentially offensive к sensitive customers.
- Distributors may hesitate due к branding liability.

### Варианты

**A. Keep as-is**
- Authentic, bold.
- Niche audience loves it.
- Some channels closed.

**B. Rebrand main brand, keep module names**
- Main brand = neutral (e.g., "Ardet Electronics" matching repo name).
- Module names stay (thematic song line).
- Broader distribution options.

**C. Full rebrand**
- New name, new aesthetic.
- Losses thematic coherence.
- Not recommended.

### Рекомендация: **B (hybrid rebrand)**

Обоснование:
1. Main brand neutral for distribution + marketing accessibility.
2. Module names retain artistic identity.
3. Easy для customer: "Ardet's System Suicide series: Last Night, Last Day..."

### Требуется от пользователя

Decide branding approach — keep / rebrand / hybrid.

---

## P7. Documentation standards

### Каждый ship'ed module должен иметь:

1. **Quick start card** — 1-page, pictures. Install + first patch.
2. **Full manual** — PDF download. Signal flow, all controls, patch examples.
3. **Cartridge care notes** — cleaning, storage (для wood/stone cartridges).
4. **Schematic** — open source на GitHub (see branch strategy below).
5. **Warranty** — 1 year parts/labor (standard).

### Open source policy

**Варианты**:

**A. Fully open source**
- Schematic, PCB, panel design на GitHub.
- MIT или CC-BY-SA license.
- Community mods encouraged.

**B. Schematic only (PCB closed)**
- Schematic public (DIY can rebuild).
- PCB layout proprietary (prevents direct cloning).
- Common в Eurorack (e.g., Mutable Instruments).

**C. Closed source**
- Traditional manufacturing.
- No community mods.

### Рекомендация: **B (Schematic open, PCB closed)**

Обоснование:
1. DIY community can learn + build.
2. Direct cloning harder (PCB closed).
3. Current repo setup `synth/` matches this approach.

### Требуется от пользователя

Approve open source policy.

---

## P8. Warranty и customer support

### Минимальные требirements

- 1 year warranty (standard в Eurorack).
- Email support.
- Cartridge replacement if defective (within 30 дней).
- Repair program для out-of-warranty (flat fee).

### Cost estimate

- Warranty reserve: 5% of sales (cover returns, repairs).
- Support time: 2–3 часа/week (email answers).
- Repair labor: $30/hour equivalent (self or contractor).

### Требуется от пользователя

Approve warranty terms.

---

## Итого — Production strategy decisions

| Decision | Вариант | Рекомендация |
|----------|---------|--------------|
| P1 Roadmap | 5 phases sequential | **Sequential, 6-12 мес между phases** |
| P2 Manufacturing | A / B / C | **A → B → C progression по phases** |
| P3 Pricing | Budget / Premium / Tiered | **Tiered (budget + premium SKUs)** |
| P4 Distribution | Direct / Distributor / Hybrid | **Hybrid: direct → distributor after P1** |
| P5 Preorder | Kickstarter / Self / None | **Self-hosted preorders** |
| P6 Brand | Keep / Hybrid rebrand / Full | **Hybrid rebrand** |
| P7 Open source | Full / Schematic / Closed | **Schematic open** |
| P8 Warranty | Standard 1yr | **Standard** |

---

## Action items — пользователь

1. **Confirm Phase 1 scope**: Last Night + All Bones Dust + utilities.
2. **Commit manufacturing start**: DIY small batch Phase 1.
3. **Set pricing**: tiered ($350 budget / $400 premium for Last Night).
4. **Launch direct sales** webshop.
5. **Prepare self-hosted preorder campaign** для Phase 1.
6. **Decide branding**: hybrid rebrand "Ardet" parent brand + "System Suicide" series?
7. **Set up GitHub** для open schematic releases.
8. **Warranty policy** published.

### Estimated solo cashflow Phase 1

- R&D cost (Phase 1, 6 мес): ~$3–5k (prototypes, tools, samples).
- Preorder goal: 50 units × $350 = $17,500 gross.
- Manufacturing cost (50 units × $89): $4,450.
- Shipping + packaging: $1,000.
- **Net margin Phase 1**: ~$12,000.
- **Sustainable if solo project**: yes, после Phase 1 covers Phase 2 R&D.

### Estimated 2-year revenue (если roadmap holds)

- Phase 1 (Last Night + ABD): $40–60k.
- Phase 2 (Last Day + And My + Is My): $60–100k.
- Cartridge recurring revenue: $20–30k/year after catalog established.
- **Total 2 years**: $120–200k gross. Margin ~60%.

**Это viable как part-time-to-full-time business**.
