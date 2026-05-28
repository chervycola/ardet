# Decision 11 — Cartridge Architecture Lock: passive plate + in-module transducers

**Дата**: 2026-05
**Статус**: **LOCKED**
**Тип**: фундаментальная архитектурная коррекция. Supersedes "full cartridge" модель во всех ранних docs (BUILD/SPEC/PCB/sourcing v6.4 и ранее).

---

## Решение

**Картридж = пассивная пластина.** Несёт только:
- Материал-резонатор (длина 100мм const × ширина 35-55мм per material × h, см. `acoustic_modeling.md §10`)
- Покрытие (для дерева: linseed/shellac; для металлов: anodize/lacquer опц.)
- Рамку-держатель (PETG proto / anodized alu prod)
- 4× retention магнита + keying notch

**Картридж НЕ несёт**: exciter, пьезо, соленоид, разъёмы, электронику. Всё это **постоянно в модуле**.

**Модуль (педаль/Eurorack) содержит** «transducer engine bay»:
- 1× exciter (spring-loaded contact к фронту пластины)
- 2× пьезо (spring-loaded contact pins к back пластины — pickup A near / B far)
- 1× соленоид (фиксирован, бьёт по пластине)
- Все разведены коротким internal wiring прямо на module PCB

Вставка картриджа = механическое coupling: пластина прижимается к exciter puck, пьезо-пины касаются back, соленоид позиционирован сверху.

---

## Почему (rationale)

### Экономика (главное)

Старая "full cartridge" модель клала трансдьюсеры в каждый картридж:
- exciter $14 + 2 пьезо + соленоид + mini-XLR ≈ **$25-30 трансдьюсеров/картридж**
- + пластина $5-15 → картридж **$40-45**

Это **убивает razor-blade модель** — никто не купит 10 материалов по $45. Картриджи должны быть дёшевы, чтобы коллекционировать материалы.

Новая модель:
- Картридж = пластина $5-15 + рамка $3 + магниты $1.2 = **$10-20**
- Трансдьюсеры — one-time module cost (×28 модулей, не ×N картриджей)

### Электрика (бонус)

Пьезо теперь **в модуле**, разведён коротким экранированным проводом прямо к JFET preamp (Block 7) на PCB. Hi-Z сигнал **не пересекает swappable разъём** → меньше шума/hum. Mini-XLR swappable connector **устранён** (был source концерна).

### Простота

Картридж — чисто механический объект. Нет разъёмов (точек отказа), нет хрупкой электроники в swappable части. Durability swap выше.

---

## Engineering — contact coupling mechanism

Trade-off vs bonded: контактный coupling зависит от contact pressure, может rattle при weak contact. Решается spring-loaded механизмом.

```
   CARTRIDGE (вставлен сверху в slot):
   ┌─────────────────────────┐
   │   Frame (PETG/alu)       │
   │  ┌───────────────────┐   │
   │  │  PLATE (material)  │   │ ← 100×(35-55)×h per material, пассивная
   │  └───────────────────┘   │
   │  ◯magnet ◯ ◯ ◯magnet    │
   └────────┬────────┬────────┘
            │        │  (insertion downward)
            ▼        ▼
   ═══════ MODULE TRANSDUCER ENGINE BAY ═══════
   
   Solenoid (fixed bracket, plunger strikes plate face):
        ║ felt tip
        ▼
   ──── PLATE FRONT ────  ← exciter puck presses here
        ▲
        │ ~5N spring force
   ┌────┴────┐
   │ EXCITER │ on spring-loaded carriage
   │ DAEX25  │ (compensates plate thickness 0.3-3mm)
   └─────────┘
   
   PLATE BACK ──── piezo contact pins (2×):
        ▲  ▲
        │  │ spring-loaded gold-tip pins
     Piezo Piezo
       A     B   (near-exciter / far)
        │  │
        ▼  ▼
     to JFET preamp (Block 7, module PCB)
```

### Mechanism spec

- **Exciter carriage**: spring-loaded (compression spring ~5N), puck faces up. Travel ±2mm compensates plate thickness variance.
- **Piezo contact pins**: spring-loaded pogo-style, gold-plated tips, ~1-2N each. Contact plate back at FEM-derived antinode points.
- **Solenoid**: fixed bracket, felt-tip plunger, 2mm gap к plate (adjustable).
- **Plate seating**: cartridge frame locks via magnets + retention pin; plate held against transducer array с repeatable force.
- **Frame damping**: rubber/foam между frame и plate edges → frame не резонирует (только plate).

---

## Implications — что меняется в docs

| Документ | Изменение |
|----------|-----------|
| `LAST_NIGHT_SPEC.md` | "что в картридже" = только пластина; transducers описаны как module-internal |
| `LAST_NIGHT_BUILD.md` | Cartridge interface block переписан; Block 7 piezo = internal contact; exciter/solenoid module-internal |
| `acoustic_modeling.md §7A` | Coupling = contact mechanism (spring-loaded), не bonding |
| `CARTRIDGE_SOURCING.md` | Split: module transducers (×28) vs plate cartridges (cheap, × count) |
| `PCB_DESIGN_SPEC.md §6.1` | Cartridge dock = transducer engine bay + spring mechanism, не connector PCB |
| `decisions/03_cartridge_standards.md` | Cartridge = plate + frame + magnets only |
| `HANDOFF_BRIEF.md` | Tier 1 sacred #1 уточнён: passive plate cartridge |

---

## BOM impact

```
Module BOM (×28 модулей):
  + 1× exciter (DAEX25/DAEX32 per... — теперь module fixed, нужен universal
    или 2 module variants? см. open question ниже)
  + 2× пьезо contact pins
  + 1× соленоид
  + spring-loaded contact mechanism (carriage + pins + brackets)
  + internal shielded wiring

Cartridge BOM (× cartridge count, дёшево):
  пластина (материал) + рамка + 4 магнита + keying + покрытие
  ~$10-20. НЕТ трансдьюсеров, НЕТ разъёмов.
```

Per-unit cartridge cost падает с ~$40 до ~$15. Razor-blade модель viable.

---

## Open question — exciter selection с фиксированным module

**Проблема**: раньше exciter выбирался per material (DAEX25 light / DAEX32 dense). Теперь exciter **в модуле фиксирован** — один на все картриджи.

**Варианты**:
- **A. Universal DAEX32Q-4** в каждом модуле — handle и light и dense plates. Чуть overkill для лёгких, но один SKU. **Рекомендуется.**
- **B. Два module SKU** — "light engine" (DAEX25) + "heavy engine" (DAEX32). Усложняет — пользователь должен matched module к cartridge weight class. Плохой UX.

**Рекомендация: A — universal DAEX32Q-4** в каждом модуле. Driver amp (Block 4) уже спроектирован с запасом. Лёгкие пластины просто получают чуть больше headroom. Один module SKU, любой картридж работает.

→ Это меняет module BOM: DAEX32Q-4 ×28 (не mix DAEX25/32).

---

## Risk

Контактный coupling acoustic variance — главный новый риск. Mitigation:
- Spring-loaded calibrated contact force (repeatable).
- Tap-test (`acoustic_modeling §8.4`) теперь **обязательно с contact mechanism**, не свободной пластиной — измерить реальный coupled response.
- Bench A/B contact pressure tuning.

Если contact coupling даёт неприемлемые losses/rattle → fallback: exciter bonded к thin "driver plate" в модуле, материал-cartridge прижимается к driver plate (двухслойный coupling). Но сначала bench-test прямой контакт.

---

**Lock confirmed**: plate-only passive cartridge + universal in-module transducer engine. Все docs приводятся к этой архитектуре.
