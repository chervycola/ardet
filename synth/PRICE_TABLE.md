# LAST NIGHT — Consolidated Price Table (module electronics)

**Версия**: v6.4 + Decision 11
**Scope**: module electronics + transducer engine. Картриджи закупаются отдельно (вне scope).

> ⚠ **Цены — approximate small-quantity estimates** (USD, 2025-2026). Большинство НЕ live-fetched. Точная цена = поиск по P/N в магазине. Колонки: **Budget** / **Audiophile** (Decision 10 §18).

> ✅ **Spot-checked (web, May 2026)** — отдельные позиции верифицированы:
> - **LSK489A SOT-23-6: $6.58** (DigiKey), SOIC-8: $7.55 — наша оценка $6 близка.
> - **OPA1612AID: ~$6.48** — оценка была $8, скорректировано к $6.50.
> - **DC-DC PART NUMBER ИСПРАВЛЕН** 🔴: было `TMR 3-1212WI` = **single 12V output** (неверно!). Корректный dual ±12V = **`TMR 3-1222WI`** (±12V, 125mA each, 3W, SIP-8). Исправлено во всех docs. ~$13-18.
> - **Recom RKD-1212-D не подтверждён** — P/N сомнителен, помечен "verify" в docs. Корректный Recom dual ±12V regulated 3W нужно уточнить (R2D-1212 = unregulated; RKZE-1212D = только ±84mA).
> - **DAEX32Q-4**: Parts Express блокирует fetch (403), Dayton cert issue. Оценка $20 (clearance ASSY-вариант с кабелем ~$12, но это другой P/N).

---

## 1. Active ICs

| Ref | Budget P/N | $ | Audiophile P/N | $ | Qty/unit | Магазин |
|-----|-----------|---|----------------|---|----------|---------|
| U1, U3 (in/out buf) | TL072CP | 0.50 | OPA1612AID ✅ | 6.50 | 2 | mouser, tayda |
| U2, U4, U_FG (signal/FG) | TL074CN | 0.75 | OPA1644 | 5.00 | 3 | mouser |
| U5,U6,U7 (OTA) | LM13700N | 2.00 | LM13700N (keep) | 2.00 | 3 | mouser |
| U8 (phaser premium) | LM13700N | 2.00 | LM13700N | 2.00 | 0-1 | mouser |
| U_COMP, U_FG_GATE | LM393N | 0.30 | LT1720 | 4.00 | 2 | mouser, tayda |
| U_FG_SUB | 74HC74 | 0.30 | 74HC74 | 0.30 | 1 | tayda |
| U_SH (crush) | LF398N | 1.20 | LF398N | 1.20 | 1 | mouser |
| U_GATE | CD4066BE | 0.40 | CD4066BE | 0.40 | 1 | tayda |
| U_555 (TOLL) | NE555P | 0.25 | NE555P | 0.25 | 1 | tayda |
| U_MCU | ATtiny84A-PU | 1.50 | ATtiny84A-PU | 1.50 | 1 | mouser |
| U_LDO | L7805CV | 0.30 | L7805CV | 0.30 | 1 | tayda |
| Q3 (JFET preamp) | LSK489A ✅ | 6.58 | LSK489B selected | 10.00 | 1 | digikey, linearsystems.com |
| Q_EXP (FG pairs) | 2N3904 ×6 | 0.18 | LM394 ×3 matched | 9.00 | 3-6 | mouser |
| **Σ active (budget / audiophile)** | | **~$15** | | **~$60** | | |

## 2. Discrete (transistors, diodes, zener)

| Ref | P/N | $ ea | Qty/unit | Магазин |
|-----|-----|------|----------|---------|
| Q1 / Q2 push-pull | BD139 / BD140 | 0.30 | 1+1 | mouser, tayda |
| Q5/Q_RESET/Q_MUTE | 2N7000 | 0.10 | 3 | tayda |
| D_NOISE | BZX55C9V1 | 0.10 | 1 | mouser, tayda |
| CV clamps | BAT85 (budget) / BAV199 (audiophile) | 0.05 / 0.10 | ~44 | mouser, tayda |
| General | 1N4148 | 0.01 | ~15 | tayda |
| Reverse protect | 1N5817 | 0.10 | 2 | tayda |
| Solenoid flyback | 1N4001 | 0.03 | 1 | tayda |
| **Σ discrete** | | **~$4** | | |

## 3. Transducer engine (module-side, Decision 11)

| Item | Budget P/N | $ | Audiophile | $ | Qty/unit | Магазин |
|------|-----------|---|-----------|---|----------|---------|
| Exciter | DAEX32Q-4 | 20.00 | DAEX32Q-4 (same) | 20.00 | 1 | parts-express.com, daytonaudio.com |
| Piezo pickup | 27mm disc | 0.30 | PVDF film LDT0 | 5.00 | 2 | tayda / mouser |
| Spring contact pins | pogo pin | 0.50 | gold pogo | 1.00 | 2 | mouser |
| Solenoid | Adafruit 412 | 5.00 | (same) | 5.00 | 1 | adafruit.com |
| Spring carriage + bracket | machined | 1.00 | — | 1.00 | 1 | mcmaster.com |
| **Σ transducer engine** | | **~$32** | | **~$38** | | |

## 4. Pots, sliders, switches

| Item | Budget P/N | $ | Audiophile P/N | $ | Qty | Магазин |
|------|-----------|---|----------------|---|-----|---------|
| Rotary pots | Alpha RV09 9mm | 1.20 | Alps RK09L | 3.00 | 17 | mouser, thonk.co.uk |
| FG sliders | Alpha SL-30 | 1.50 | Bourns PTL | 4.00 | 3 | mouser, thonk |
| Bank Mode 5-pos | Alpha SL-4P5T ⚠ | 5.00 | Grayhill 56SD rotary 4P5T | 12.00 | 1 | mouser (Grayhill reliable) |
| Range/clip slides | DPDT slide | 0.80 | C&K sealed | 2.00 | 3 | mouser, tayda |
| Trim pots | Bourns 3296W | 0.80 | (same) | 0.80 | 6 | mouser, tayda |
| Footswitches | 3PDT latching | 3.00 | Carling sealed | 8.00 | 4 | tayda, lovemyswitches.com |
| Bypass relay | Omron G6K-2F | 2.50 | Omron G6A-274P gold | 4.00 | 1 | mouser, digikey |
| **Σ pots/switches** | | **~$45** | | **~$120** | | |

## 5. Capacitors

| Type | Budget P/N | $ | Audiophile P/N | $ | Qty | Магазин |
|------|-----------|---|----------------|---|-----|---------|
| Signal coupling (1µF) | WIMA MKS2 | 0.30 | WIMA MKP4 polyprop | 0.80 | ~6 | mouser, digikey |
| EQ matched (1nF C0G) | Murata C0G | 0.05 | Cornell Dubilier silver mica | 3.00 | 2 | mouser, alliedelec.com |
| FG integrator (1µF) | WIMA MKS2 | 0.20 | WIMA FKP2 | 0.60 | 1 | mouser |
| Bulk electrolytic (1000µF) | Panasonic FR | 0.30 | Elna Silmic II / Nichicon Muse | 3.00 | 2 | mouser / banzaimusic.com |
| Decoupling (100nF X7R) | generic | 0.02 | (same) | 0.02 | ~15 | tayda |
| **Σ caps** | | **~$5** | | **~$25** | | |

## 6. Resistors

| Type | Budget P/N | $ | Audiophile P/N | $ | Qty | Магазин |
|------|-----------|---|----------------|---|-----|---------|
| General 1/4W MF 1% | YAGEO MFR-25 | 0.01 | Dale CMF55 | 0.08 | ~93 | tayda / mouser |
| Critical gain (R_GA/R_RA) | MF 1% | 0.01 | Susumu RG thin-film | 0.10 | ~6 | mouser |
| R-2R precision (crush) | Vishay MRS25 0.1% | 0.20 | (same) | 0.20 | 4 | mouser |
| **Σ resistors** | | **~$2** | | **~$10** | | |

## 7. Power

| Item | Budget P/N | $ | Audiophile P/N | $ | Qty | Магазин |
|------|-----------|---|----------------|---|-----|---------|
| Isolated DC-DC (pedal) | TRACO TMR 3-1222WI ✅ (dual ±12V, 125mA ea) | 15.00 | Recom (verify dual ±12V regulated P/N) | ~22 | 1 | mouser, digikey |
| Power connectors / bulk | IDC / barrel + caps | 2.00 | (same) | 2.00 | — | mouser, tayda |
| **Σ power (pedal)** | | **~$15** | | **~$24** | | |

## 8. PCB + connectors + mechanical

| Item | Budget | $ | Audiophile | $ | Магазин |
|------|--------|---|-----------|---|---------|
| Main PCB | 4L FR4 | 8.00 | 4L ENIG immersion gold | 12.00 | jlcpcb.com, pcbway.com |
| Satellite PCBs (panelized) | 2L FR4 | 4.00 | (same) | 4.00 | jlcpcb |
| Audio jacks | Thonkiconn / TS | — | Neutrik gold | ~30.00 | thonk, neutrik.com |
| Internal wiring | hookup wire | 1.00 | silver-plated PTFE | 5.00 | mouser |
| Knobs ×17 | Davies 1900H budget | 8.50 | Re'an / brass | 20-490 | smallbear, etsy |
| Panel + standoffs | anodized alu | ~28.00 | (same) | ~28.00 | front panel express, pcbway CNC |
| **Σ PCB/mech** | | **~$58** | | **~$80+** | | |

---

## Сводка по unit (module electronics, картриджи отдельно)

| Категория | Budget | Audiophile |
|-----------|--------|-----------|
| Active ICs | $15 | $60 |
| Discrete | $4 | $4 |
| Transducer engine | $32 | $38 |
| Pots/switches | $45 | $120 |
| Capacitors | $5 | $25 |
| Resistors | $2 | $10 |
| Power (pedal) | $15 | $24 |
| PCB/connectors/mech | $58 | $80 |
| **Σ module per unit** | **~$176** | **~$361** |

> Budget ~$176, audiophile ~$361 (без картриджей, без enclosure premium как copper corpus/brass knobs — те добавляют $300-800 в boutique tier, см. Decision 10).
>
> Прежние "$100-127" оценки в BUILD были **только electronics без transducer engine** ($32) + без mechanical/PCB overhead. Полный module (с engine + PCB + mech) = ~$176 budget.

---

## AliExpress sourcing split (OK / AVOID)

**Правило**: actives + precision caps + DC-DC + matched pairs → **только authorized** (Mouser/DigiKey/LIS, authentic+traceable). Mechanical + commodity → **AliExpress OK** (sample-qualify сначала).

> Counterfeit-риск actives с AliExpress катастрофичен для boutique-продукта ($499-2499): фейк op-amp/JFET = inconsistent звук + убитая репутация. LSK489A (Tier 1 noise cornerstone) с AE = почти наверняка релейбл generic → весь noise floor дизайн мёртв.

| Категория | AliExpress | Обоснование |
|-----------|:----------:|-------------|
| Op-amps (OPA1612/1644, TL07x) | 🔴 AVOID | massiv counterfeit, особенно OPA1612 |
| LSK489A/B JFET | 🔴 AVOID | noise cornerstone, релейбл risk = дизайн мёртв |
| LM13700 / LF398 / ATtiny84A | 🔴 AVOID | relabel / fake die |
| LM394 matched pairs | 🔴 AVOID | matching нельзя доверять |
| Precision/audio caps (WIMA/Mundorf/Elna) | 🔴 AVOID | индустрия фейковых "аудиофильских" cap |
| Isolated DC-DC (TMR 3-1222WI) | 🔴 AVOID | safety + isolation + реальный ток сомнительны |
| BD139/140, 2N7000, diodes, zener | 🟡 OK с осторожностью | commodity, но sample-test (fake возможен) |
| **Pots (Alpha RV09 / Alps RK09L)** | 🔴 **AVOID** | **feel/taper/longevity критичны** — AE Alpha-клоны scratchy, кривой taper. Pot — это **тактильное качество boutique**. Authorized (Thonk/Mouser). |
| **Knob caps (грип)** | 🟡 **OK budget / premium worth real** | косметика+тактиль. AE OK для budget aesthetic, но **premium tier — реальные Davies/Re'an/brass** (вес, grip, indicator важны для feel). |
| Sliders (FG/Bank Mode) | 🟡 OK с qualify | mechanical, sample-test wiper smoothness |
| Footswitches 3PDT | 🟡 OK с qualify | mechanical, но cheap 3PDT часто rattle/fail — sample-test |
| Bypass relay (Omron G6K/G6A) | 🔴 AVOID | signal relay — contact quality критичен, fake possible |
| Enclosure (big-box corpus) | ✅ OK | штамповка, спеков не требует |
| Магниты N42 | ✅ OK | физика стабильна |
| Standoffs / hardware / винты | ✅ OK | commodity |
| Piezo discs 27mm | ✅ OK (sample-qualify звук) | generic, всё равно тест по звуку |
| Generic solenoid 5V | ✅ OK (sample-qualify) | bulk дёшево, тест функции |
| LED / wire / heat shrink | ✅ OK | commodity |
| JST / IDC connectors | ✅ OK | generic |
| Commodity resistors / ceramic caps | ✅ OK (non-critical) | decoupling/general, не signal-critical |

**Экономия на 28 units**: AliExpress mechanical+commodity ~$30-50/unit × 28 = **$840-1400** на партию. Существенно. Активка строго authorized — риск > экономии.

**Правила AE-закупки**: (1) sample first (2-5 шт, тест), (2) mechanical/commodity only, (3) проверенный продавец (rating + store age + order count), (4) piezo/solenoid bench-test перед bulk.

---

## Магазины — сводка (домены)

| Магазин | Домен | Что |
|---------|-------|-----|
| Mouser | mouser.com | Op-amps, LM394, comparators, caps, relays, DC-DC, resistors — основной |
| Digi-Key | digikey.com | То же — backup/parallel |
| Tayda | taydaelectronics.com | Commodity ICs, discrete, resistors, диоды — дёшево bulk |
| Linear Integrated Systems | linearsystems.com | LSK489A/B (direct) |
| Parts Express | parts-express.com | DAEX32 exciter |
| Dayton Audio | daytonaudio.com | Exciter direct |
| Adafruit | adafruit.com | Solenoid (P/N 412) |
| Thonk | thonk.co.uk | Eurorack pots/jacks, Alps, Thonkiconn (UK/EU) |
| Banzai Music | banzaimusic.com | Elna Silmic / Nichicon Muse audio electrolytic (EU) |
| Love My Switches | lovemyswitches.com | Footswitches, pedal parts |
| JLCPCB / PCBWay | jlcpcb.com / pcbway.com | PCB fab + CNC |
| Neutrik | neutrik.com | Gold audio jacks |
| Allied Electronics | alliedelec.com | Cornell Dubilier silver mica |
| McMaster-Carr | mcmaster.com | Spring carriage, mechanical |
| AliExpress | aliexpress.com | **Mechanical/commodity ТОЛЬКО** (enclosure, knob caps, magnets, piezo, generic solenoid, hardware). 🔴 НЕ для actives/precision (counterfeit). Sample-qualify. |

---

> **Для точных цен**: открыть домен → поиск по P/N (колонки выше) → актуальная цена + qty-breaks. Цены здесь — порядок величины для бюджетирования партии, не для финального заказа.

**End of price table v6.4. Цены approximate — verify по P/N перед закупкой.**
