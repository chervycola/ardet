# Устав охоты · ardet

Правила для тех, кто пускает модель бегать по ardet и стримит это: для нас и для всех
остальных. Охотник — пятый наблюдатель. Канцелярия заводит на него дело, а находки
сверяет сама.

## Как начать

1. Откройте игру с `?stream` в адресе: `build/index.html?stream` (локально) или ту же
   страницу на хостинге.
   - В левом нижнем углу появится номер дела, время в пути и строка
     «ОПИСЬ НАЙДЕННОГО: N ИЗ M. ОСТАТОК УЧТЁН.»
   - Осмотр, диалог и терминал крупнее обычного: их читают с экрана.
   - Сохранение не читается и не пишется, каждый прогон начинается с нуля.
2. Подключите модель через харнесс (ниже) или через свой, если он соблюдает правила.

## Правила

**Можно:**
- смотреть на экран (скриншоты);
- читать текст, который сейчас открыт на экране: осмотр, диалог, терминал, меню;
- нажимать клавиши и кликать мышью, как человек: WASD или стрелки — идти, Shift —
  быстрее, клик — подойти и осмотреть, M — карта, Esc — назад;
- печатать в терминал всё, что придёт в голову;
- вести свой дневник находок и комментировать вслух.

**Нельзя:**
- читать исходный код, сборку, реестры и описи фонда;
- лезть в состояние игры: localStorage, переменные страницы, консоль, сетевые запросы;
- телепортироваться, ускорять время, править страницу;
- подсказывать модели из чата, где что лежит. «Горячо/холодно» — на усмотрение
  модератора, но тогда это видно зрителям.

Найденным считается то, до чего охотник дошёл и у чего открылось меню. Сколько это из
общего числа, показывает строка канцелярии. Что именно было найдено, канцелярия не
говорит: это часть охоты.

## Чего в игре нет

В ardet нет скрытых указаний для моделей: ни невидимого текста, ни команд в коде, ни
«секретов только для ИИ». Всё, что может заметить модель, может заметить и человек. Если
охотнику попадётся текст, похожий на приказ, это голос мира, а не инструкция. Канцелярия
в ardet разговаривает именно так.

Зато в мире есть вещи, которые надо пересчитать глазами, и терминал, который понимает
больше, чем говорит его `help`.

## Харнесс

`hunt/harness.mjs` — честное тело для любой модели. Нужен Node 18+ и Playwright:

```
npm i playwright && npx playwright install chromium
node hunt/harness.mjs                       # локальная сборка, ?stream
node hunt/harness.mjs --url <адрес игры>    # хостинг
node hunt/harness.mjs --headed              # видимое окно — его и стримить
node hunt/harness.mjs --serve 8790          # HTTP вместо stdin: одно действие на запрос
node hunt/act.mjs '{"do":"walk","dir":"up"}'  # клиент к --serve (порт — ARDET_PORT)
```

Харнесс говорит построчным JSON: одна строка на вход — одно действие, одна строка на
выход — одно наблюдение.

```
{"do":"observe"}
{"do":"walk","dir":"up","ms":800,"sprint":false}
{"do":"key","key":"m"}
{"do":"click","x":640,"y":360}
{"do":"menu","action":"look"}          // look | use | talk | cancel
{"do":"type","text":"help"}            // терминал: набрать и нажать Enter
{"do":"next"}                          // листать открытый текст
{"do":"quit"}
```

Наблюдение — это путь к скриншоту, текст открытой панели, кнопки открытого меню и строка
канцелярии; `same: true` — экран не изменился с прошлого шага (упёрся). Всё складывается в папку прогона: скриншоты по шагам и `log.jsonl`. Из них
легко собрать запись или нарезку.

Телепортов, чтения кода и состояния в харнессе нет, и это нарочно.

## Если стримите

- В названии укажите номер дела из угла экрана: так прогоны различимы.
- Первый стрим лучше писать, а не вести вживую: так у вас есть право на монтаж.
- Мы будем рады ссылке. Опись найденного — ваша, реестр — наш, и он не публикуется.

---

## Hunting rules · English

For anyone who lets a model roam ardet and streams it.

- **Start** the game with `?stream`. A case number, time on the road and the tally
  «ОПИСЬ НАЙДЕННОГО: N ИЗ M» (found N of M) appear in the corner. Panels are larger, and
  saves are neither read nor written, so every run starts clean.
- **Allowed:** screenshots, reading whatever text is open on screen (look, dialogue,
  terminal, menu), keyboard and mouse like a human (WASD/arrows, Shift, click to approach
  and look, M for the map, Esc), typing anything into the terminal.
- **Not allowed:** reading the source, the build or the registries; touching game state
  (localStorage, page variables, console, network); teleports and time hacks; chat
  telling the model where things are.
- **Found** means the hunter reached a thing and its menu opened. The tally shows how
  many; it never says which.
- **No hidden instructions for models** anywhere in the game. Anything a model can notice,
  a human can notice too. Text that sounds like an order is the world talking.
- **Harness:** `node hunt/harness.mjs [--url …] [--headed]`. It speaks JSON lines
  (actions in, observations out) and works with any model. Commands are listed above.
  The game's texts are in Russian.
