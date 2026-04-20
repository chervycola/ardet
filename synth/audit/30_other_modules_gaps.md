# Остальные 7 модулей — пробелы и риски

Для каждого из 7 модулей вне Last Night/Last Day: заявленная функция, зрелость концепта, что критически отсутствует, вердикт load-bearing / filler.

**Scope fence (повторение)**: этот раздел **флагирует пробелы**, а не проектирует модули. Конкретная электроника и схемы не предлагаются.

---

## 1. I SHOW YOU LIGHT — Оптический тон-колесо осциллятор

### Заявленная функция
Осциллятор на вращающемся диске с вырезами. LED + фотодиод + CV-управляемый DC motor. Pitch через speed. Сменные диски.

### Зрелость концепта
**Средняя**. Концепция понятна, исторический прецедент есть (Hammond tonewheel), но в Eurorack формате не реализована.

### Что критически отсутствует

- **Экспоненциальный CV→speed converter**. Для V/Oct tracking DC motor требует expo conversion с высокой precision. Motor speed ≠ linear с voltage — требует closed-loop control (tachometer/encoder).
- **Лазерная резка дисков** — производственная цепочка не определена. Кто делает диски? Batch consistency?
- **Материал диска** — алюминий или акрил?. Прочность при 10000 RPM (для pitch в audio range).
- **Crosstalk между дорожками** — если диск имеет несколько дорожек (harmonic содержание), LED и фотодиод узко направленные? Аддитивный синтез или artifacts?
- **Pitch stability** при CV swap — момент inertia motor → settle time до new speed. Типично 50–200 мс. Для musical pitch это latency.

### Вердикт
**Load-bearing** в системе — первый модуль в цепи, генератор. Без него нет source.

**R&D сложность**: высокая. Механика, оптика, CV-conversion, production disks.

**Recomend**: прототип на breadboard — один диск, один LED, одна pitch CV. После proof of concept — engineer pitch stability и multi-disk swap mechanism.

---

## 2. BODY BLOOD AND SALT — Жидкостный синт

### Заявленная функция
Touch pads (4 пары) + WELL ванночка с жидкостями → аудио проходит через биологические жидкости. Сменные электроды. Gate/filter/bend/chaos через touch. Гальванический шум.

### Зрелость концепта
**Средняя-высокая для творческой концепции, низкая для инженерной**. Биомедицинский risk, safety questions unresolved.

### Что критически отсутствует

- **Safety certification**: ток через тело должен быть <100 мкА (медицинский стандарт). Аудио ±1V через кожу 1кΩ → 1мА. **Выше безопасного**. Нужен current limiter (series resistor 100кΩ+) → audio signal не проходит.
- **Гальваническая изоляция**: DC-DC isolator добавлен в концепт — $10+ BOM.
- **Списание approved electrodes list**: Fe/Cu/Zn корродируют → попадают в body fluid. Длительная экспозиция?
- **Loop stability**: fluids с variable conductivity в feedback loop → unpredictable self-oscillation.
- **Дренаж и cleanup**: ванна с кровью на концерте = biological hazard, нужны wipes, gloves, disposal protocol.
- **WELL material**: stainless steel OK. Керамика OK. Но герметизация от electrolytic corrosion on electrodes.

### Вердикт
**High concept, high risk**. Market niche (perform artists, shock performance). Engineering требует medical device expertise (isolation, safety).

**Recomend**: **отложить в фазу 4 или 5**. Не для early-stage boutique startup. Большой R&D, small market.

---

## 3. ALL BONES DUST — Transformer saturator + rattle

### Заявленная функция
Audio transformer (Lundahl или cheap) + mechanical rattle (piezo-driven plate hitting limiter) → dual distortion.

### Зрелость концепта
**Высокая**. Простая, DIY-friendly, историческая.

### Что критически отсутствует

- **Rattle механика**: точная настройка зазора (автоматически или ручно?). Solenoid actuated или fixed?
- **Transformer selection**: dB saturation curve зависит от чипа. Каталог 3-4 trans options?
- **Rattle материалы**: латунь/сталь/кость/дерево — swappable module? Custom mounts.
- **Piezo sensor feedback**: снимает вибрацию rattle plate для pickup?

### Вердикт
**Load-bearing лёгкий**. Distortion/sat — обычная функция в цепи. Не критичная для system.

**R&D сложность**: низкая. DIY-scale.

**Recomend**: **Phase 1 — простейший прототип**. Отработка manufacturing процесса (panel, PCB, cartridge-like rattle plate swap). Хороший candidate для первого shipped module (fast feedback, cashflow).

---

## 4. BE CAREFUL — Фильтр на стеклянных резонаторах

### Заявленная функция
"Фильтр". Стеклянные трубки-резонаторы или пластины или стеклянный вактрол. **Несколько разных концепций в одном описании**.

### Зрелость концепта
**Низкая**. Три взаимоисключающие идеи. No single architecture committed.

### Что критически отсутствует

См. C7 в `50_contradictions_and_todos.md`. В итоге — **всё**:
- Архитектура: filter, resonator, или VCA? Выбрать одно.
- Frequency control: passive tubes (фиксированная частота) или modulated length?
- Глубина резонанса (Q control)?
- Входной/выходной интерфейс.
- Что физически стеклянного — pre-cut glass tubes? Plates? Rods? Flask-shaped?

### Вердикт
**Слишком мало информации для suitability assessment**. Модуль в системной цепи на позиции "фильтр" — load-bearing, нужен (без него звук из BBAS идёт в ADB без spectral shaping). Но архитектура полностью open.

**Recomend**: **отдельная brainstorming session** для Be Careful. Зафиксировать **одну** концепцию (рекомендуется — exciter+piezo plate, аналог Last Night architecture, но с высоким Q стеклянной пластины → resonant filter with self-oscillation). Потом проектировать.

---

## 5. FUCK ABANDONED SLEEP — Маятниковый LFO

### Заявленная функция
Физический маятник + оптический sensor → LFO. Электромагнит для sustain. Chaos mode через двойной маятник.

### Зрелость концепта
**Средняя-высокая**. Концепция ясная, прототипируется.

### Что критически отсутствует

- **Маятник precision**: стандартизация length для CV-predictable rate. Производство.
- **Electromagnetic drive timing**: feedback loop (sensor → pulse timing → magnet) нужен closed-loop controller (OPAMP или MCU).
- **Chaos mode механика**: coupling double pendulum — как соединяется? Spring? Rigid? Release mechanism?
- **Vibration isolation**: если Eurorack трясётся (performance), маятник будет resonate с external vibration, portating LFO. Mount requires damping.
- **Visibility**: "виден через окошко" — cool UX, но мешает закрытому shielding. Conflict.

### Вердикт
**Load-bearing средний**. Modulator — полезный, но заменим (обычный electronic LFO). Unique selling point — physical nature, perform visual.

**R&D сложность**: средняя. Механика + electromagnet control.

**Recomend**: **Phase 2-3**. Прототип на breadboard — single pendulum с manual sensor → CV output. Proof of concept за неделю.

---

## 6. IS MY — Live-свитчер / клок-роутер

### Заявленная функция
**Тройная**: vactrol crossfade, clock divider/router, octave-down pitch shifter.

### Зрелость концепта
**Очень низкая**. Три функции в 6HP не могут coexist. См. C6 в `50_`.

### Что критически отсутствует

- **Одна, не три функции**. Выбрать.
- **Если vactrol crossfade** — электроника понятна (2× vactrol + control circuit).
- **Если clock divider** — цифровая логика (CD4040 или подобное), 2-bit binary divisions, 8HP.
- **Если octave down** — аналоговый flip-flop на 4013 (standard guitar octaver), не в 6HP с другими функциями.

### Вердикт
**Требует переопределения**. Current "Is My" — filler, не load-bearing в cpечи. Система работает без него.

**Recomend**: **decision required**. Либо один из трёх сценариев, либо убрать из списка (142HP уменьшится до 136HP).

---

## 7. AND MY — TBD

### Заявленная функция
**"Утилитарный/функциональный модуль с джостиком. Роль в системе уточняется."**

### Зрелость концепта
**Нулевая**. TBD.

### Что критически отсутствует
Всё.

### Вердикт
**Phantom модуль**. Занимает место в системе (142HP sum), но не имеет definition.

**Рекомендации**:
1. **Удалить** из системной цепи до определения функции.
2. Или **определить**: предложение — **X/Y joystick → dual CV output** для performance, как Make Noise Pressure Points. Utility module. 8HP, simple electronics.
3. Или **crossfader** между Last Day и Last Night (semantically fits: "Last Day and my last night") — дает musical control для перехода между дневным и ночным пространством.

---

## Summary — остальные модули

| Модуль | Статус концепта | Load-bearing? | R&D effort | Рекомендация |
|--------|----------------|---------------|------------|--------------|
| I Show You Light | Средний | Да | Высокий | Phase 3-4 |
| Body Blood And Salt | Средний (творческий) | Нет (заменим) | Очень высокий (safety) | Phase 4-5 |
| All Bones Dust | Высокий | Лёгкий | Низкий | **Phase 1 (first ship)** |
| Be Careful | Низкий (три концепции) | Да | Средний (после decision) | Phase 3 (после def) |
| Fuck Abandoned Sleep | Средний | Нет (заменим) | Средний | Phase 2-3 |
| Is My | Очень низкий (три функции) | Нет | Низкий | **Reconsider** |
| And My | TBD | TBD | TBD | **Define or remove** |

**Ключевые actionable items**:

1. **Be Careful** — зафиксировать архитектуру (glass exciter+piezo plate recommended).
2. **Is My** — выбрать одну функцию (или cut).
3. **And My** — определить (рекомендуется crossfader между Last Day/Night) или удалить.
4. **All Bones Dust** — фаза 1 R&D, быстрый ship для cashflow.
5. **BBAS** — отложить в фазу 4+, слишком рисковый для early-stage проекта.
