# Cartridge standards — финальный каталог материалов

Вопросы о стандартизации физических картриджей для Last Night (и Be Careful, если выбран glass-plate вариант).

---

## C1. Размер plate — fixed / variable

### Текущее состояние
В брифе заявлено: 100×H×T мм, где:
- L = 100мм (fixed).
- H = 20–60мм (variable per material).
- T = 3–5мм (variable per material).

### Варианты

**A. Фиксированный формат 100×40×4мм (everything)** — simpler
- Same frame для всех картриджей.
- Unified mount mechanism.
- Material density varies, sound varies, но size consistent.

**B. Variable как заявлено (100×H×T)** — flexible
- Каждый material имеет optimal dimensions.
- Тонкая сталь 0.5мм, толстый мрамор 5мм.
- Frame адаптивный (resilient rails).

**C. Two tier system** — balanced
- **Standard**: 100×40×4мм (base catalogue).
- **Premium**: custom dimensions (metal thin plates, stone thick).

### Рекомендация: **B (Variable)** с constraints

Обоснование:
1. **Physics demands**: тонкая сталь реально звучит лучше на 0.5мм, мрамор на 5мм. Force one size — compromise.
2. **Frame design**: резиновые рельсы могут принимать 0.5–6мм automatically.
3. **Marketing**: variable dimensions = material-specific character (part of sell).

**Constraints**:
- **L fixed = 100мм** (mounting compatibility).
- **H = 20–60мм** (panel slot size accommodates).
- **T = 0.5–6мм** (rubber rail range).

**Требуется от пользователя**: подтвердить variable approach с вышеуказанными constraints.

---

## C2. Final cartridge catalog

### Рекомендуемый initial catalog (Phase 1 launch, 6 cartridges)

Priority: dvijer sound diversity + manufacturing feasibility + cost target.

| Картридж | Размеры | Масса | RT60 realistic | Цена | Source | Phase |
|----------|---------|-------|---------------|------|--------|-------|
| **Oak (raw)** | 100×40×4мм | 12г | 0.1–0.3с | $15 retail | Local carpenter | 1 |
| **Oak (linseed)** | 100×40×4мм | 12г | 0.15–0.35с | $18 | Same + coating | 1 |
| **Maple (shellac)** | 100×35×4мм | 10г | 0.2–0.5с | $22 | Carpenter | 1 |
| **Marble** | 100×50×5мм | 68г | 0.8–2с | $35 | Stone supplier | 1 |
| **Brass** | 100×30×3мм | 77г | 1–3с | $40 | Metal supplier | 1 |
| **Spring steel** | 100×20×0.5мм | 8г | 2–6с | $25 | Spring manufacturer | 1 |

**6 картриджей в Phase 1** — sound diversity covered от short woody до long shimmer.

### Phase 2 additions (after Phase 1 ship)

| Картридж | Note |
|----------|------|
| Ebony (exotic wood) | Premium, long sustain |
| Nephrite (jade) | Cultural variant |
| Copper | Patina character, ages |
| Glass (Pyrex) | If Be Careful variant A approved |
| Bone (animal shoulder) | Dark, ritualistic |
| Titanium | Ultra-premium ($80) |

### Deliberately NOT in catalog (scope limit)

- Ice — melts, perform-only novelty.
- Chocolate — melts from exciter heat.
- Felt — anti-reverb, specialized use.
- Rubber — too damped.
- Bakelite — Asbestos risk.

### Требуется от пользователя

1. Approve initial 6-cartridge catalog.
2. Approve Phase 2 additions priority.
3. Decide на exotic cartridges (ice, chocolate) — offer как limited editions?

---

## C3. Mount / connector strategy

### Текущее состояние
В брифе: JST-XH 4-pin (EX, PA, PB, SOL) + магниты или байонет.

### Варианты

**A. JST + magnets**
- 4× JST-XH 2-pin.
- Magnets align картридж.
- **Риск EMI** (см. audit/10_ блок 9) — JST unshielded для piezo.

**B. Mini-XLR 3-pin per piezo + JST для rest** (рекомендуется)
- PA, PB: Mini-XLR с shield.
- EX, SOL: JST-XH 2-pin.
- Combined: 2× Mini-XLR + 2× JST = 4 connectors on cartridge.
- Better noise immunity.

**C. Multi-pin single connector (e.g., DIN-8)**
- One connector для всех 4 signals + shield.
- $5 connector, but single mating point.
- Shield pin on connector.

**D. Custom edge connector (like PCI)**
- PCB edge в cartridge + matching slot в module.
- Gold-plated contacts, multi-signal.
- Production cost moderate, very reliable.

### Рекомендация: **B (Mini-XLR + JST mixed)**

Обоснование:
1. Audio-grade shielding для piezo (critical).
2. JST для low-criticality signals (cheap).
3. Standard components (off-shelf).
4. Обоснованный trade-off cost vs noise.

### Магнитное align

Для cartridge alignment:
- **4× neodymium N42 5×5×2мм** (cost $1 total).
- Flux orientation orthogonal к audio signal paths.
- Distance >30мм от piezo input traces (чтобы не pickup magnetic flux).

### Требуется от пользователя

Approve B + magnetic alignment.

---

## C4. Pickup standardization

### Текущее состояние
Брифе: два пьезо-диска 27мм на противоположных концах. Optional PVDF для премиум.

### Варианты

**A. Both piezo 27мм (simple)**
- Same pickup, same character, different position.
- Position crossfade тонкий (см. `audit/10_`, Block 10).
- Cheap BOM.

**B. Piezo 20мм + PVDF** (recommended для premium)
- A channel: piezo 20мм (bright with mid-hump).
- B channel: PVDF film (flat, neutral).
- Position crossfade = timbral control (coloured ↔ clean).
- Premium SKU differentiator.

**C. Two different piezo sizes (20мм + 27мм)**
- Different resonance peaks → different character.
- Cheaper than PVDF.
- Middle ground.

### Рекомендация: **A для budget, B для premium**

- Budget catalog (wood, stone standard): **A** (both 27мм piezo).
- Premium catalog (ebony, titanium, nephrite): **B** (piezo + PVDF).

### Требуется от пользователя

Approve tiered pickup strategy, или unified approach.

---

## C5. Exciter standardization

### Текущее состояние
DAEX25FHE-4 (25мм, 4Ω, 40Вт peak) — stock exciter.

### Варианты

**A. Single exciter DAEX25FHE-4 для всех cartridges**
- Simple, cheap.
- Underpowered для dense materials (см. `audit/11_`, D).

**B. Two tiers: DAEX25 (light) + DAEX32 (dense)**
- DAEX25FHE-4 для wood, thin metals, glass (light materials).
- DAEX32Q-4 (40Вт RMS) для marble, concrete, titanium.
- Different cartridge SKUs.

**C. Single DAEX32Q-4 (overpower for all)**
- Universal, no tier complexity.
- Overkill для light materials → can damage thin plates через over-excursion.

### Рекомендация: **B (Two tiers)**

Обоснование:
1. Right exciter для right material = optimal sound.
2. Premium tier pricing justified.
3. Prevents damage (thin material with overkill exciter).

**Implementation**:
- Standard cartridges (wood, glass, thin metal): DAEX25FHE-4.
- Premium cartridges (marble, titanium, concrete): DAEX32Q-4.
- Each cartridge sold с correct exciter pre-installed.

### Требуется от пользователя

Approve two-tier exciter strategy.

---

## C6. Cartridge mount mechanism

### Варианты

**A. Screw-in (rigid)**
- 4× M3 screws secure cartridge к module frame.
- Robust, не shift on play.
- Slow swap (30 seconds).

**B. Magnetic snap (as specified)**
- Magnets hold cartridge.
- 2-second swap.
- Risk: drops if module inverted.

**C. Bayonet (quarter-turn lock)**
- Insert + rotate 90° locks.
- 3-second swap.
- Secure.

**D. Sliding drawer**
- Cartridge slides on rails into dock.
- 5-second swap.
- Professional (like tape cartridge).

### Рекомендация: **B (Magnetic snap) с retention pin**

Обоснование:
1. Fast swap для performance.
2. Retention pin (secondary) prevents accidental drop.
3. Cartridge swap ritual — part of sell.

**Implementation**:
- 4× neodym magnets hold cartridge.
- 1× spring-loaded retention pin (optional, physical latch).
- Guide rails prevent misalignment.
- Visual alignment marks on panel.

### Требуется от пользователя

Approve B, или выбрать alternative.

---

## C7. Packaging / branding

### Cartridge packaging

Каждый cartridge comes в:
- **Foam-lined box** с cardstock card describing material.
- **Material character card**: RT60 estimate, freq response, "feel" description.
- **Mounting instructions**.
- **Cleaning/care notes** (specifically для wood с oil coating).

### Branding

- Each cartridge laser-etched на frame: SYSTEM SUICIDE / [material] / [serial].
- Serial для traceability.
- Limited edition numbers для rare materials (e.g., mammoth bone).

### Packaging cost

- Foam + box: $2.
- Card printing: $0.50.
- Laser etching: $1.
- Total: ~$3.50 per cartridge.
- Retail: packaging absorbed.

### Требуется от пользователя

Approve packaging standard.

---

## Итого — Cartridge standards decisions

| Decision | Рекомендация |
|----------|--------------|
| C1 Plate sizing | Variable (L=100мм fixed, H=20–60, T=0.5–6) |
| C2 Initial catalog | 6 cartridges Phase 1 (oak×2, maple, marble, brass, spring steel) |
| C3 Connectors | Mini-XLR (piezo) + JST (exciter, solenoid), magnetic alignment |
| C4 Pickups | Budget: 2× piezo 27мм. Premium: piezo + PVDF |
| C5 Exciter | Two tiers (DAEX25 light, DAEX32 dense) |
| C6 Mount | Magnetic snap + retention pin |
| C7 Packaging | Foam box + material card + laser etching |

**Cartridge cost per unit**:
- Budget: $15 frame + $1 pickups + $20 exciter + $3.50 packaging + $10 material = **$50 production**, retail $80.
- Premium: $15 frame + $5 PVDF + $40 exciter + $3.50 packaging + $30 material (titanium) = **$95 production**, retail $180.

**Cartridge revenue potential**:
- Initial unit + 3 cartridges = $400 + 3× $80 = **$640 / customer**.
- Premium unit + 3 cartridges = $500 + 3× $180 = **$1040 / customer**.

Это **razor-and-blades** model — hardware unit hooks customer, cartridges drive recurring revenue. Стратегически полезно.

---

## Action items

1. Подтвердить variable plate sizing (C1).
2. Approve 6-cartridge Phase 1 catalog (C2).
3. Order samples materials for prototype (oak уже заказан — маркированно).
4. Specification для carpenter, stone supplier, metal supplier.
5. Decide mount mechanism (C6).
6. Consult packaging designer для branding (C7).
