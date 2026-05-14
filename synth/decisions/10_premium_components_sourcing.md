# Decision 10 — Elite tier components & sourcing strategy

**Дата**: 2026-05
**Статус**: draft v1 (open для refinement after first prototype sourcing)
**Тип**: SKU tier definition + supply chain strategy

---

## Контекст

Last Night имеет три canonical tier:

| Tier | BOM per pedal | Retail | Customer |
|------|---------------|--------|----------|
| **Budget** | ~$94 | $499 | Standard boutique pedal buyer |
| **Premium** | ~$121 | $649 | Audiophile prosumer (Strymon BigSky tier) |
| **Elite** | **$300–600** (TBD this doc) | **$1,499–2,499** | Boutique collector / Eventide H9000 / Strymon big-box audiophile |

Elite SKU — это **art-object SKU**, limited edition с **высоким absolute margin** ($600+ per unit), **наглядной premium ощутимостью** (heavy brass corpus, exotic wood inlays, audiophile-grade signal path), **provenance documentation** для каждого экземпляра.

Этот документ:
1. Каталог premium/elite component options по каждому блоку схемы.
2. Sourcing matrix — где их доставать.
3. Total Elite SKU BOM расчёт + retail tier proposal.
4. Risk register: discontinued / hard-to-find / long lead-time компоненты.

---

## 1. Op-amps (TL072 / TL074 baseline)

Текущие baseline ICs — workhorse TL07x ($0.50–0.75). Не аудиофильский tier.

| Tier | Part | $ | Использовано | Notes |
|------|------|---|--------------|-------|
| **Budget** | TL072CP / TL074CN | $0.50–0.75 | U1, U2, U3, U4, etc. | Standard, JFET input, OK для most stages |
| **Premium** | **OPA1652** / **OPA1654** | $3 / $5 | All audio path stages | TI, ultra-low noise (4.5 nV/√Hz), bipolar input, drop-in TL07x replacement |
| Premium alt | NE5532 (BJT) | $1 | Bus buffers | Classic, slightly more noise чем OPA1652 |
| **Elite** | **OPA627AU** / **OPA1612** | $35 / $8 | Critical preamp / output stages | OPA627: legendary audiophile op-amp. OPA1612: modern equivalent, lower noise |
| **Ultra-elite** | **Sparkos Labs SS3601** (discrete op-amp module) | $75 each | Output stage только | Replacement module, drop-in SOIC-8. 4 нV/√Hz, audiophile prestige |
| **Boutique** | **Burson V6 Vivid** discrete op-amp module | $90 each | Output stage | Premium discrete, audio-jewellery tier |

**Recommendation для Elite SKU**:
- Replace U1 (input buffer) + U2 (mix/output) с OPA1612 (cheaper modern audiophile, ~$8 each) = $32 BOM.
- Output stage exclusive: Sparkos Labs SS3601 ×1 ($75) = signature audiophile sound.
- All filter / EQ stages: OPA1652 ($3 each × 4 = $12).
- **Tier subtotal: ~$130 just для op-amp upgrade**.

---

## 2. JFETs (LSK489A baseline)

Уже выбран premium LSK489A для piezo preamp. Дальнейший upgrade путь:

| Tier | Part | $ | Notes |
|------|------|---|-------|
| **Budget legacy** | 2N5457 (EOL) | $1 | Discontinued, no production option |
| **Premium baseline (current)** | LSK489A | $6 | Linear Integrated Systems, dual matched in SOT-23-6 |
| **Elite** | **LSK489B** / **LSK170A** | $10 | LIS premium grade с tighter Idss matching ±5% vs ±15% |
| **Ultra-elite** | **2SK170 BL grade** (NOS Toshiba) | $30+ | Legendary Japanese JFET, discontinued 2007, NOS only. Pairs hand-matched by ear |
| **Boutique** | **Linear Systems LSK489 selected** | $15 | LIS factory-selected for low noise (<1 nV/√Hz) |

**Recommendation Elite**: LSK489B selected ($10). Noise floor advantage = +3dB SNR над baseline LSK489A. Significant для piezo signal which is наша Achilles heel.

---

## 3. OTAs (LM13700 baseline)

LM13700 — workhorse. Premium ОТА для VCA + phaser:

| Tier | Part | $ | Notes |
|------|------|---|-------|
| **Budget (current)** | LM13700N | $2 | Texas Instruments, classic OTA, character distortion ~0.5% |
| **Premium** | **THAT2180A** | $8 | Professional audio VCA, distortion <0.05%. Used в SSL, API, etc. |
| **Premium quad** | **SSI2164** | $15 (quad) | Sound Semiconductor, modern SSM2164 replacement. 4× VCAs в одном чипе, Eurorack-popular |
| **Elite** | **CEM3387** (NOS) | $80 (rare) | Curtis chip, vintage Prophet-5 character. Discontinued ~1990s |
| **Boutique** | **Sound Semiconductor SSI2161** | $10 | Modern single VCA premium, low noise |

**Recommendation Elite**: 
- U5 (Block 11 envelope VCA) → **THAT2180A** ($8) для tighter VCA control.
- U6, U7, U8 (Block 12 crossfader + Block 16 phaser) — оставить LM13700 (character важна для phaser sweep).
- BOM delta: +$6 над baseline.

---

## 4. Capacitors

Самая аудиофильская категория с самой огромной price spread.

### Signal path coupling caps (C_IN, C_OUT, C_CA, C_CB):

| Tier | Part | $ | Notes |
|------|------|---|-------|
| **Budget** | Generic film box | $0.15 | Function only |
| **Premium baseline** | WIMA MKS2 1µF film | $0.30 | German, audio standard, low ESR |
| **Premium audio** | **WIMA MKP4** polypropylene | $0.80 | Better dielectric, less microphonic |
| **Elite** | **Auricap XO 1µF** | $8 each | Audiophile polypropylene, hand-selected. Used в high-end DAC outputs |
| **Boutique** | **Mundorf Supreme Silver/Gold/Oil 1µF** | $35–60 | Top tier audiophile cap, silver foil + oil-paper |
| **Ultra-boutique** | **Audio Note KAISEI 1µF** | $80+ | Japanese audiophile cult cap, copper foil + paper-in-oil |

### EQ caps (C_PE1, C_DE1 — 1nF C0G):

| Tier | Part | $ | Notes |
|------|------|---|-------|
| **Premium baseline** | Murata GRM1885C1H102JA01D 1nF C0G ±5% | $0.05 | Already specified |
| **Elite** | **Cornell Dubilier silver mica 1nF** | $3 | Vintage radio character, very low loss |
| **Boutique** | **Vishay/Roederstein MKT** 1nF film | $2 | Audiophile film, tight tolerance |

### Bulk electrolytics (C_DC, C_B1, C_B2):

| Tier | Part | $ | Notes |
|------|------|---|-------|
| **Premium baseline** | Panasonic EEU-FR series 1000µF | $0.30 | OK |
| **Premium audio** | **Nichicon Muse FW 1000µF** | $2 | Audio-rated electrolytic, lower ESR |
| **Elite** | **Elna Silmic II 1000µF** | $5 | Japanese audiophile silmic series, silk-fibre electrolyte. Famous "warm" character |
| **Boutique** | **Black Gate** (NOS, hyper-rare) | $50+ | Legendary discontinued Japanese audiophile cap. Cult status |

**Recommendation Elite SKU**:
- C_IN, C_OUT (2× signal path): **Mundorf Supreme 1µF** ($40 × 2 = $80).
- C_PE1, C_DE1 (matched pair EQ): **Cornell Dubilier silver mica** ($3 × 2 = $6).
- C_DC (1000µF bulk): **Elna Silmic II** ($5).
- Decoupling 100nF × 10: WIMA FKP2 film ($0.40 × 10 = $4) instead of ceramic.
- **Subtotal**: ~$95 BOM upgrade only for caps. Significant.

---

## 5. Resistors

Стандартные 1% metal film = OK для audio. Elite tier:

| Tier | Part | $ | Notes |
|------|------|---|-------|
| **Budget** | Generic 1% metal film | $0.01 | Function only |
| **Premium** | **Dale CMF55** | $0.10 | RN-style precision, low TCR, low noise |
| **Premium audio** | **Vishay/Beyschlag MBA0207** | $0.30 | Audio-grade, ultra-low noise |
| **Elite** | **Audio Note tantalum non-magnetic** | $5+ each | Japanese audiophile resistor cult |
| **Boutique** | **Shinkoh tantalum** (discontinued NOS) | $20+ each | Legendary, paper-tape mounting |
| **Engineering elite** | **Vishay VAR / Z-foil** precision | $5–15 | Tightest tolerance ±0.005%, lowest TCR. Used в reference voltage sources |

**Recommendation Elite SKU**:
- Signal path resistors (R_in, R_out, summing, EQ network): **Dale CMF55** ($0.10 × ~30 = $3).
- Critical preamp gain resistors (R_GA, R_RA в Block 9 JFET preamp): **Audio Note tantalum** ($5 × 4 = $20).
- Все остальные: standard 1% metal film.
- **Subtotal**: ~$25 BOM upgrade.

---

## 6. Pots & sliders

| Tier | Part | $ | Notes |
|------|------|---|-------|
| **Budget** | Alpha RV09 9mm | $1.20 | Workhorse, OK |
| **Premium baseline** | Alpha RV09 sealed | $1.80 | Dust-sealed for live use |
| **Premium audio** | **Alps RK09L** | $3.50 | Japanese, smoother feel, longer life |
| **Premium pro** | **Alps RK27 "Blue Velvet"** | $25 | Audiophile cult — used в Marantz, Yamaha hi-fi. 27mm large pot |
| **Elite** | **TKD CP-2500** | $50–80 | Tokyo Ko-On Denpa, Japanese boutique audio pot |
| **Boutique stepped attenuator** | **Khozmo 24-step** | $80+ | Discrete resistor stepped attenuator, precision control |
| **Ultra-boutique** | **Goldpoint precision stepped** | $200+ | American audiophile high-end |

### Sliders (Color preset 4P5T + Shape Form 1P5T):

| Tier | Part | $ | Notes |
|------|------|---|-------|
| **Budget** | Generic 4P5T slide switch | $5 | OK, может ratty контакты |
| **Premium** | **Alpha SL-4P5T** | $8 | Cleaner contacts |
| **Premium pro** | **NKK SS-12 series** | $15 | Japanese pro slide switch |
| **Elite** | **C&K 7000 series** | $25 | Mil-spec gold-plated contacts |

**Recommendation Elite SKU**:
- Большие knob'ы performance gestures (DRIVE, FEEDBACK, MIX, OUTPUT, DEPTH, SPEED): **Alps RK27 Blue Velvet** ($25 × 6 = $150).
- Mid-tier knobs (ATK, DEC, POSIT, BOOST, TONE, NOISE, COLOR-geiger, LowPass, HiPass): **Alps RK09L** ($3.50 × 9 = $32).
- Color preset slider 4P5T: **C&K mil-spec** ($25).
- Shape Form slider 1P5T: **NKK** ($15).
- **Subtotal**: ~$222 BOM upgrade.

---

## 7. Switches & footswitches

| Tier | Part | $ | Notes |
|------|------|---|-------|
| **Budget** | Generic 3PDT footswitch | $3 | Often Chinese clones, contact issues |
| **Premium** | **Cliff Electronics 3PDT** | $7 | UK-made, reliable contacts |
| **Premium pro** | **Carling Technologies 3PDT** | $12 | American mil-spec, gold-plated |
| **Elite** | **Carling 110 series sealed** | $18 | Sealed against dust + moisture |
| **Boutique** | **Otax soft-touch** | $25 | Japanese soft-click silent footswitch |

### SWITCH CLIP toggle:

| Tier | Part | $ | Notes |
|------|------|---|-------|
| **Budget** | C&K 7101 generic | $1.50 | OK |
| **Premium** | **Honeywell 1MD1-T1** | $5 | Mil-spec |
| **Elite** | **Schurter MS-series** | $12 | Swiss premium with embedded LED option |

**Recommendation Elite SKU**:
- 4 footswitches: **Carling 110 sealed** ($18 × 4 = $72).
- SWITCH CLIP: **Schurter MS** ($12).
- **Subtotal**: ~$84 BOM upgrade.

---

## 8. Jacks (audio + CV)

| Tier | Part | $ | Notes |
|------|------|---|-------|
| **Budget 6.3mm** | Generic TRS jack | $1 | Often poor contact |
| **Premium** | **Switchcraft 11/12 series** | $3 | American workhorse, audio standard |
| **Premium audio** | **Neutrik NMJ4HCD-S** | $5 | Gold contacts, robust |
| **Elite** | **Neutrik NJ3FP6C** | $8 | Locking TRS, gold contacts |
| **Boutique** | **WBT-0210 nextgen** | $40 | Silver-plated nextgen, audiophile cult |

### CV mini-jacks:

| Tier | Part | $ | Notes |
|------|------|---|-------|
| **Budget** | Thonkiconn PJ301M-12 | $1 | Eurorack standard |
| **Premium** | **Thonkiconn gold-plated** | $2 | Same form, gold contacts |
| **Elite** | **Switchcraft N141-style** | $4 | American premium 3.5mm |

**Recommendation Elite SKU**:
- 6.3mm main I/O × 4: **Neutrik gold** ($5 × 4 = $20).
- RCA stereo × 2: **Switchcraft RCA gold** ($3 × 2 = $6).
- 22 CV mini-jacks: **Thonkiconn gold** ($2 × 22 = $44).
- DC power jack 2.1mm barrel: **Switchcraft 712A** ($2).
- **Subtotal**: ~$72 BOM upgrade.

---

## 9. Cartridge cable connectors

Уже chose Switchcraft TA3M/TA3F mini-XLR (premium baseline). Elite alternatives:

| Tier | Part | $ | Notes |
|------|------|---|-------|
| **Premium baseline** | Switchcraft TA3M/F mini-XLR | $3 each | Solid baseline |
| **Premium pro** | **Neutrik miniCON** | $5 | European premium, locking |
| **Elite** | **Lemo PIB.0M** (3-pin push-pull) | $25 | Swiss precision, military aerospace grade |
| **Boutique** | **Hirose HR10 series** | $15 | Japanese audiophile/medical grade |

**Recommendation Elite SKU**:
- TA3M/F → **Lemo PIB** ($25 × 2 pairs = $100).
- **Subtotal**: $96 BOM upgrade (replaces baseline $12).

---

## 10. Cables (cartridge internal coax)

Baseline: generic RG-174 50мм за $1.

| Tier | Part | $/m | Notes |
|------|------|-----|-------|
| **Budget** | Generic RG-174 | $1/m | OK function |
| **Premium** | **Belden 8451** (instrument cable) | $2/m | Studio standard |
| **Premium audio** | **Mogami W2549** | $4/m | Japanese audiophile internal cable |
| **Elite** | **Canare L-4E5C** | $6/m | Mogami competitor, star-quad construction |
| **Boutique** | **Furutech FA-220** | $20/m | Furutech audiophile internal |

**Recommendation Elite SKU**:
- 4× cartridge internal coax 50мм: **Mogami W2549** ($4/m × 0.2m × 4 = $3.20).
- **Subtotal**: ~$2 BOM upgrade (cheap relatively to other components).

---

## 11. Exciter

| Tier | Part | $ | Notes |
|------|------|---|-------|
| **Budget (light cartridges)** | Dayton DAEX25FHE-4 | $20 | Workhorse, 4Ω |
| **Premium (dense cartridges)** | Dayton DAEX32Q-4 | $40 | More power handling |
| **Premium German** | **Visaton EX 60 S** | $50 | German engineering, audiophile drivers |
| **Premium driver** | **Tectonic BMR4 (Balanced Mode Radiator)** | $35 | Different excitation modes |
| **Elite** | **Custom-wound voice coil exciter** | $150+ | Commission через Tang Band или specialty exciter shops |
| **Boutique** | **Mass Loaded Vinyl (MLV) hybrid exciter** | $200+ | Audiophile cult — heavier voice coil mass |

**Recommendation Elite SKU**:
- **Visaton EX 60 S** ($50) — proven, German precision, modest upgrade.
- For limited-edition Hetian nephrite cartridges — **custom-wound** premium exciter (commission).
- **Subtotal**: $30 BOM upgrade.

---

## 12. Piezo / pickup

| Tier | Part | $ | Notes |
|------|------|---|-------|
| **Budget** | Generic 27mm piezo disc | $0.50 | OK, mid-resonance peak |
| **Premium** | **Murata 7BB-27-4L0** premium disc | $2 | Better consistency |
| **Premium audio** | **PVDF film LDT0-028K** (Measurement Specialties) | $5 | Flat frequency response, no mid peak |
| **Elite** | **K&K Pure Mini pickup** | $40 | Cult acoustic guitar piezo, bright/clear |
| **Boutique** | **Schertler DYN-V piezo** | $80 | Swiss audiophile transducer |
| **Ultra-boutique** | **Schertler STAT-V condenser piezo** | $250 | Studio-grade |

**Recommendation Elite SKU**:
- Piezo A (bright): **K&K Pure Mini** ($40).
- Piezo B (warm): **PVDF film** ($5) — different timbre per pickup creates dramatic Position crossfade character.
- **Subtotal**: $45 BOM upgrade over $1 baseline.

---

## 13. PCB

| Tier | Specs | $ per pcs (small batch) | Notes |
|------|-------|-------------------------|-------|
| **Budget** | 2-layer FR4 1.6mm HASL | $5–10 (JLCPCB / PCBWay) | Function OK |
| **Premium** | 4-layer FR4 1.6mm ENIG (gold) | $30–60 (JLCPCB) | Impedance controlled, gold plating |
| **Elite** | **6-layer with internal ground/power planes, immersion silver** | $80–150 (JLCPCB premium) | Audio-grade routing, lower noise |
| **Boutique** | **Custom Rogers RO4350 high-frequency substrate** | $200–400 | Reference-grade RF/audio |
| **Ultra-boutique** | **Hand-routed point-to-point на ebonite chassis** | $500+ (artisan) | Cult tube amp builders' approach |

**Recommendation Elite SKU**:
- **6-layer FR4 ENIG** ($100) — best balance audio quality + manufacturability.
- **Subtotal**: $90 BOM upgrade.

---

## 14. Enclosure

| Tier | Material | $ | Notes |
|------|----------|---|-------|
| **Budget** | Stamped aluminum (Hammond-like) | $15 | Functional |
| **Premium** | Anodized milled aluminum 6063-T5 | $40 | Decent feel, common pedalboard |
| **Premium pro** | **CNC-milled 6061-T6 aerospace aluminum** | $80 | Pro feel, premium tooling marks |
| **Elite** | **Solid brass corpus** | $250 | Heavy (~2кг pedal!), beautiful patina развивается |
| **Elite alt** | **Solid copper corpus** | $300 | Will develop green patina — matches "postapocalypse rust" aesthetic perfectly |
| **Boutique** | **Walnut / ebony wood-clad sides + brass top** | $400+ | Artisan craftsmanship, art-object tier |
| **Ultra-boutique** | **Cast bronze sculpture-shaped enclosure** | $1000+ | One-of-one art piece |

**Recommendation Elite SKU**:
- **Copper corpus** ($300) — patinates green с возрастом, matches "system suicide" aesthetic (mёртвая electronics, oxidized metal). Visually unique against most aluminum pedals.
- Alternative: solid brass ($250) — heavier, gold-like patina.
- **Subtotal**: $260 BOM upgrade over $40 premium baseline.

---

## 15. Knobs

| Tier | Part | $ each | Notes |
|------|------|--------|-------|
| **Budget** | Generic Davies clones | $0.50 | OK |
| **Premium baseline** | **Davies 1900H** (Selco authentic) | $3 | Classic synth knob, made в Japan |
| **Premium pro** | **Re'an AS-200/AS-300** | $4 | Boutique aluminum knobs |
| **Premium audiophile** | **Soulution / Vicor brass knobs** | $15 | German audiophile machined brass |
| **Elite** | **Custom-molded Bakelite** | $25 | Period-correct postapocalypse aesthetic, real Bakelite (not plastic clone) |
| **Boutique** | **Antique radio knobs** (NOS 1930-1950s) | $20–80 | Real vintage, varied availability |
| **Ultra-boutique** | **Solid brass machined knobs** custom | $40+ each | Custom commission |

**Recommendation Elite SKU**:
- 20 knobs total на panel (including Phase 2 v3 PCB upgrade).
- Mix: 8 large performance knobs **brass machined** ($40 × 8 = $320), 12 smaller **Bakelite molded** ($25 × 12 = $300).
- Альтернатива: full Bakelite ($25 × 20 = $500) — more cohesive aesthetic.
- **Subtotal**: ~$500 BOM upgrade. **Самая большая отдельная категория**.

---

## 16. DC-DC (pedal SKU power)

| Tier | Part | $ | Notes |
|------|------|---|-------|
| **Budget** | TRACO TMR 3-1212WI | $13 | 3W isolated, current spec |
| **Premium baseline** | Recom RKD-1212-D | $22 | 250mA per rail, audio-rated |
| **Premium audio** | **Recom REC15-1212S with EMI shielding** | $35 | Shielded, lower noise |
| **Premium** | **Mean Well DKE15B-12** | $30 | Premium audio-grade DC-DC |
| **Elite** | **Linear regulated PSU (no switching)** | $50 | Heavier, no switching noise, audiophile cult |
| **Boutique** | **External audiophile linear PSU** (e.g., Cardas / Mojo Audio) | $200+ | External brick supply, completely isolated audio chain |

**Recommendation Elite SKU**:
- **Recom REC15-1212S shielded** ($35) — modest upgrade с заметным noise improvement.
- Optional: external linear PSU as add-on accessory ($150 separate purchase).
- **Subtotal**: $22 BOM upgrade.

---

## Elite SKU total BOM расчёт

| Category | Budget baseline | Elite tier upgrade | Δ BOM |
|----------|-----------------|-------------------|-------|
| Op-amps | TL07x (~$2 total) | OPA1612 + Sparkos SS3601 | +$130 |
| JFETs | LSK489A $6 | LSK489B selected $10 | +$4 |
| OTAs | LM13700 ×2-3 ($4-6) | THAT2180 + LM13700 | +$6 |
| Caps (signal + EQ + bulk + decoupling) | $5 | Mundorf + Cornell + Elna + WIMA FKP | +$95 |
| Resistors | Standard 1% MF (~$3) | Dale CMF + Audio Note tantalum critical | +$25 |
| Pots & sliders | $14 baseline | Alps RK27 + RK09L + premium sliders | +$222 |
| Switches & footswitches | $14 | Carling sealed + Schurter | +$84 |
| Jacks (audio + CV) | $32 baseline | Neutrik gold + Thonkiconn gold + Switchcraft | +$72 |
| Cartridge connectors | $12 | Lemo PIB | +$96 |
| Cables | $1 | Mogami W2549 | +$2 |
| Exciter | $20 (DAEX25) | Visaton EX 60 S | +$30 |
| Piezo | $1 ×2 | K&K Pure + PVDF | +$45 |
| PCB | $6 (2-layer) | 6-layer ENIG immersion silver | +$90 |
| Enclosure | $15 | Solid copper corpus | +$285 |
| Knobs | $10 (20× $0.50) | Brass + Bakelite mixed | +$490 |
| DC-DC | $13 | Recom shielded REC15-1212S | +$22 |
| **Subtotal upgrades** | | | **+$1,698** |

**Elite SKU total BOM**:
- Budget baseline: ~$94.
- **+$1,698 upgrades**.
- = **~$1,792** total BOM per Elite pedal.

**Hold on** — это слишком высокий. Realistic Elite SKU не должен blow всё на каждую категорию. Selective approach:

### Curated Elite SKU (sensible upgrades only)

| Selective upgrades (only where audible / visible) | Δ BOM |
|--------|-------|
| OPA1612 для signal path (skip Sparkos discrete extreme) | +$30 |
| LSK489B selected JFET | +$4 |
| THAT2180 для VCA only | +$6 |
| WIMA MKP signal caps + Nichicon Muse C_DC + matched silver mica EQ | +$30 |
| Critical resistors Dale CMF | +$3 |
| Alps RK27 для 6 big knobs only, RK09L для остальных | +$170 |
| Carling sealed footswitches | +$72 |
| Neutrik gold + Switchcraft gold jacks | +$40 |
| Lemo cartridge connectors | +$96 |
| Visaton EX 60 S exciter | +$30 |
| K&K Pure Mini + PVDF piezo | +$45 |
| 4-layer ENIG PCB (not 6-layer) | +$50 |
| **Copper corpus** | +$285 |
| **Brass + Bakelite knob mix** (top tier visual) | +$490 |
| Recom shielded DC-DC | +$22 |
| **Curated Elite total Δ** | **+$1,373** |

**Curated Elite BOM**: ~$94 + $1,373 = **~$1,467**.

### Suggested Retail

| Tier | BOM | Retail | Gross margin |
|------|-----|--------|--------------|
| Budget | $94 | $499 | 81% |
| Premium | $121 | $649 | 81% |
| **Elite (curated)** | **$1,467** | **$2,499** | **41%** |
| Elite (ultra, всё-всё-всё) | $1,792 | $2,999 | 40% |

Elite tier — lower margin, но **absolute profit higher** ($1,032 vs $405 на Premium). Limited edition strategy: **25 Elite SKU экземпляров in production**, all serialized + provenance certificate.

---

## Sourcing matrix

### По категориям — где доставать

| Category | Primary supplier | Backup | Notes |
|----------|------------------|--------|-------|
| **Op-amps (TI/TI premium)** | Mouser, Digi-Key | Newark, Octopart aggregator | Same-day shipping, paypal/credit |
| **OPA627 vintage** | eBay (verified sellers) | Audio forum classifieds (DIY Audio, Head-Fi) | Counterfeit risk — buy from known sellers only |
| **Sparkos / Burson modules** | **Sparkos Labs direct (sparkoslabs.com)** | Burson Audio direct | Long lead time (2-4 weeks) |
| **JFETs (LSK489)** | **Linear Integrated Systems direct** (linearsystems.com) | Mouser, Digi-Key | Order in batches |
| **2SK170 NOS** | Japanese audio surplus (sayama-jhoji, Yahoo Japan Auctions) | eBay verified | Authentication critical |
| **THAT2180** | Mouser, Digi-Key | THAT Corp direct | Stock usually OK |
| **SSI2164** | Sound Semiconductor direct | Thonk, Modular Addict | Modular synth favorite |
| **WIMA caps (MKS2/MKP)** | Mouser, Digi-Key | RS Components (EU) | German precision, common stock |
| **Mundorf Supreme** | **Mundorf direct (mundorf.com)** | Parts Connexion (Canada), Sonic Craft (US) | Limited stock per batch |
| **Auricap XO** | **Audience direct (audience-av.com)** | Parts Connexion | US-made |
| **Cornell Dubilier silver mica** | Mouser, Allied Electronics | eBay (verified vintage radio sellers) | NOS available |
| **Elna Silmic II / Nichicon Muse** | **Banzai Music (Germany)** | Smallbear Electronics | Audio electrolytic specialists |
| **Black Gate (NOS)** | eBay, Japanese audio forums | Audio Note UK | Very rare, $50+ per cap |
| **Dale resistors (CMF55)** | Mouser, Digi-Key | Newark | Standard stock |
| **Vishay precision (Z-foil)** | Mouser, Digi-Key | Newark | Engineering elite |
| **Audio Note tantalum** | **Audio Note UK direct (audionote.co.uk)** | Parts Connexion | Audio Note dealer network |
| **Alps RK27 "Blue Velvet"** | Mouser, Smallbear, **Thonk (UK)** | Bourns (alternative) | Reliable stock, $25 each |
| **Alps RK09L** | Mouser, Smallbear | Banzai Music | Common stock |
| **TKD CP-2500** | **Park Audio (Japan, parkaudio.jp)** | Specialty Japanese audio | Long lead time, expensive |
| **Khozmo stepped attenuators** | **Khozmo direct (khozmo.com, Poland)** | DIY audio forums | Hand-built, 2-4 week lead |
| **Carling Technologies switches** | Mouser, Digi-Key | **Cliff Electronics direct (cliffuk.co.uk)** | UK distributor |
| **Schurter switches** | Mouser, Digi-Key | Schurter direct | Swiss precision |
| **Otax soft-touch footswitches** | **Free The Tone direct** (Japan) | DIY pedal forums | Niche, premium feel |
| **Neutrik jacks (gold)** | **Neutrik direct** | Thonk, Mouser | Industry standard |
| **Switchcraft jacks** | Mouser, Digi-Key | Smallbear | American standard |
| **Lemo connectors** | **Lemo direct (lemo.com)** | DigiKey | Authorized distributor account preferred |
| **Hirose connectors** | DigiKey, Mouser | Japanese distributors | Excellent stock |
| **Mogami / Canare cables** | **Mogami direct (US importer Audio Cables Inc)**, Canare direct | Sound Pure, Sweetwater Pro | Industry standard |
| **Furutech cables** | **Furutech direct (furutech.com, Taiwan)** | Audiophile dealers (Acoustic Sounds, Parts Connexion) | Japanese audiophile cult |
| **Visaton exciter** | **Visaton direct (Germany)** | Solen, Parts Express | Common in EU |
| **Tang Band custom exciter** | **Tang Band direct (Taiwan)** | Parts Express | Commission for custom voice coils |
| **K&K Pure Mini pickup** | **K&K Sound direct (kksound.com)** | Reverb.com | Niche acoustic pickup market |
| **PVDF film LDT0-028K** | **Measurement Specialties direct** | Mouser | Specialty film piezo |
| **Schertler pickups** | **Schertler direct (Swiss)** | Specialty acoustic luthier shops | Premium acoustic pickup |
| **PCB 4-layer ENIG / 6-layer** | **JLCPCB (China)**, **PCBWay** | OSH Park (US small batch), Aisler (EU) | JLCPCB best price/quality |
| **Rogers substrate PCB** | **Sunstone Circuits (US)** | PCB Universe | RF-grade |
| **Anodized aluminum corpus** | **Front Panel Express (US/EU)** | Schaeffer / German Panel | Custom CNC |
| **CNC 6061-T6 enclosure** | **Protocase (Canada)**, **Sendcutsend (US)** | Local CNC shop | Custom dimensions |
| **Brass / copper enclosure** | **Custom metalshop / commission** (etsy, eBay specialty) | Local copper / brass shops | One-off, expensive |
| **Davies 1900H knobs** | **Selco Davies (US)** | Smallbear, Mouser | Classic synth knob |
| **Re'an knobs** | Mouser, Digi-Key | Smallbear | OK budget premium |
| **Bakelite knobs (custom)** | **Etsy artisans, eBay vintage radio** | Specialty restorers | Lookup specific listings |
| **Antique radio knobs (NOS)** | **eBay vintage radio category** | Antique radio shows | Random availability |
| **Solid brass knobs** | **Etsy custom machinist commissions** | Mod kit suppliers | Custom-order |
| **TRACO / Recom DC-DC** | Mouser, Digi-Key | RS Components | Industry stock |
| **Linear PSU audiophile** | **Mojo Audio, Cardas direct** | Audiogon (used market) | Boutique audio |

---

## Risk register

| Risk | Severity | Mitigation |
|------|----------|------------|
| **OPA627 counterfeits** (eBay) | HIGH | Buy only from Mouser/DigiKey official channels, never bulk eBay |
| **2SK170 NOS depletion** | HIGH | Pre-buy stock, lock 100+ units now; design fallback к LSK170A |
| **Mundorf Supreme out-of-stock** | MEDIUM | Order 6+ months ahead, Mundorf produces in batches |
| **Black Gate caps unavailable** | EXTREME | Already discontinued ~2006. Substitute Elna Silmic II или Nichicon KZ |
| **Lemo connector lead time** | MEDIUM | 4-8 weeks typical, plan ahead |
| **Custom copper corpus failures** | MEDIUM | Identify reliable metal shop, do prototype first |
| **K&K Pure Mini supply** | LOW | K&K Sound stable, sometimes 2-week backorder |
| **TKD pots discontinued** | MEDIUM-HIGH | TKD has reduced product line; Alps RK27 reliable substitute |
| **Audio Note resistors price spike** | LOW | Already premium, price stable |
| **Cartridge materials (Hetian nephrite)** | HIGH | Source verification, ethical sourcing concerns. See `cartridges/07_nephrite_processing.md` |

---

## Recommended Phase 1 strategy

**Не запускать Elite SKU сразу**. Phase 1 ship = Budget + Premium tiers only. Reasons:
1. Elite tier requires established customer base ($2,499 retail won't sell к unknown brand).
2. Premium parts have long lead times — supply chain не tested.
3. Premium audio claims need **measured proof** (THD/SNR) — testing infrastructure required first.

**Elite SKU launch strategy**:
- **Phase 1**: Budget + Premium ship, build brand recognition.
- **Phase 2** (12+ months later): Open **pre-order Elite tier** with limited 25 units, deposit 50%.
- **Phase 2B**: Source components batch, build 25 Elite pedals, ship serialized + provenance certificate.
- **Phase 3**: Optional Elite tier для каждой production cycle (10/year ongoing).

### Provenance certificate (per Elite unit)

Включается с pedal:
- Serial number + production date.
- Component list с part numbers, suppliers, batch IDs.
- Hand-builder signature.
- Burn-in test report (24h continuous operation log).
- Photo of builder's workshop.
- Plate audio test recording (sweep + impulse response) on USB-thumb.

This becomes **owner heirloom**, justifies $2,499 price tier.

---

## Open questions

1. **Final Elite SKU BOM** — нужно prototype + audition при первой сборке. Не все upgrades audible — A/B test required.
2. **Marketing positioning Elite** — "limited edition art-object" vs "ultimate audiophile reverb"? Both possible.
3. **Provenance certificate platform** — paper booklet + USB thumb или digital QR-coded online provenance page?
4. **Used parts policy** — vintage Black Gate caps (NOS rare) — can use в Elite или only new components allowed?
5. **Cartridge tier coupling** — Elite pedal ships с какой cartridge default? Recommend **Hetian nephrite white** или **mammoth ivory limited edition**.
