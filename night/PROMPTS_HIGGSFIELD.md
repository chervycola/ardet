# ARDET · ПОДБОР РЕФЕРЕНСОВ + ПРОМТЫ ДЛЯ РУЧНОЙ ГЕНЕРАЦИИ
### к брифу weave/HANDOFF_HIGGSFIELD.md · для Unlimited-режима · вер. 1

Два присланных референса закрывают два регистра игры целиком.
Дальше — куда какой референс прикладывать в Higgsfield (style/image
reference в ручном UI) и какие их особенности переносим в промты.

---

## 1. Присланные референсы

### РЕФ-А · «Ночной» (фигура с месяцем-воротником, космос в рёбрах)
**Это готовый G6.** Совпадение с промтом почти дословное. Предлагаю
принять как эталон регистра «печать/бумага» — не перегенеривать,
а канонизировать его особенности:

- рваная ряса с дырами «как кружево» — края ткани съедены, сквозь
  них видна чернота;
- **космическая полость** в грудной клетке: спиральная галактика +
  планеты, единственное «глубокое» пятно кадра;
- нити света из поднятой ладони — уходят ЗА верхнюю кромку кадра;
- струя тёмного песка из опущенной руки — распадается на точки
  (та же капельная фактура, что у ротапринта);
- фон — чистая бумага, только тонкая линия пустынного горизонта
  с двумя далёкими скалами-останцами;
- холодный серебристо-синий — ТОЛЬКО внутри месяца и космоса
  (цветовое исключение регистра, как бирюза у сократиков).

Отклонения от брифа (правим не перегенерацией, а в игре):
киноварной печати в углу нет — её ставит игра (канон: надписи и
штампы кладём сами); сепия чуть холоднее #3A3026 — при вклейке на
бумагу тонируем CSS-фильтром.

**Куда ещё прикладывать РЕФ-А как style reference:** все будущие
кадры регистра бумаги — портреты для диалогов, шапки дел картотеки,
листы осмотра (вклейки). Слабый вес, если модель даёт крутить.

### РЕФ-Б · «Кровавая луна» (титул: луна с кольцами, капли, птицы)
**Это почти готовый G1.** Особенности сильнее промта из брифа —
канонизируем их:

- **кольца-нимбы**: концентрическая гравюрная штриховка вокруг луны,
  как бороздки пластинки — сквозной знак луны во всех кадрах,
  где она видна;
- **капли**: чёрная тушь стекает с нижней кромки луны — оставляем
  ТОЛЬКО титулу (в мировых кадрах будет перебор);
- одна тонкая горизонтальная лента птиц, пересекающая луну;
- **дуга горизонта** — горизонт заметно выгнут (мир-диск!), городок
  силуэтом на дуге, контровое зарево за ним;
- затёртые процарапанные края кадра, сухая кисть/ксилография;
- небо уходит в глухой чёрный к верхним углам.

Отклонения от брифа (просить в следующем варианте или править
приёмкой): зарево за городком — чистый белый, надо КОСТЬ `#D9CFB8`;
тёплых окон `#E28A3A` в силуэте нет — нужно два крошечных.

**Куда ещё прикладывать РЕФ-Б как style reference:** все «мировые»
ночные кадры с небом — G0.2 (красноватый горизонт за вратами), G4
(неон, если луна в кадре), кадры края диска. Вес слабый-средний,
иначе всё небо станет красным.

---

## 2. Таблица: кадр → референс → что переносим

| Кадр | Image/style ref | Особенности в промт |
|---|---|---|
| G0.1 городок-эталон | **без картинки-рефа** (утечёт красное небо) | только стиль-блок; сухая кисть и затёртые края из РЕФ-Б словами |
| G0.2 врата (юг) | РЕФ-Б, слабый вес | дуга горизонта, красноватое зарево в глубине |
| G0.3 колодец (север) | без рефа | тёмная ночь, фактура из стиль-блока |
| G1 титул | РЕФ-Б, сильный вес | кольца-нимбы, капли, лента птиц, дуга; правки: зарево→КОСТЬ, +2 тёплых окна |
| G2 два очага XVII | без рефа (или «пустая европа» из EPOCH_SCENES) | небо почти закрыто домами |
| G3 мелкий шрифт XVIII | без рефа | часы без стрелок, аркада по верхней трети |
| G4 неон | РЕФ-Б, слабый вес | малая луна с кольцами высоко в кадре — связка эпох |
| G5 криосклеп WD | НИКАКИХ тёплых рефов | ноль тепла, отдельный режим |
| G6 Ночной | **закрыт РЕФ-А** | перегенерация не нужна; варианты — промт ниже |
| бумага: портреты/дела | РЕФ-А, средний вес | кружевная рваность, полость, песок точками |

Порядок из брифа держим: G0.1 первый, дальше не идти до приёмки.

---

## 3. Промты (обновлённые фичами референсов)

Хвост-«стиль-блок» из брифа — без изменений, добавляется к каждому:

```
dark etching-inspired painterly scene, deep flat blacks, bone-white
highlights #D9CFB8, single warm light source #E28A3A, cinnabar red
#C23B2B as the only red, heavy film grain, no neon gloss, no clean
vector lines, vast negative space, tiny lone hooded figure for scale
```

### G0.1 · ГОРОДОК — эталон площади (16:9) — ПЕРВЫЙ
```
small timeless town square at long evening, seen slightly from above,
left: two-story chancellery building with gable roof and ONE warm lit
window casting light on cobblestones, center: small bonfire with a
bull skull on a pole and a tiny jester silhouette beside it, right:
low house with a cat on the roof ridge and thin chimney smoke, far
back: open gates overgrown with grass and a dark castle silhouette
like weather on the hill, cobblestone ground with moss patches,
a stone well, a clay pithos lying on its side, dead street lantern,
dry-brush woodcut texture, scratched worn frame edges,
+ стиль-блок --ar 16:9
```
Приёмка: ровно три тёплых пятна (одно окно + костёр + труба-дым не
считается); фигура < 1/10; врата открыты; текста нет.

### G0.2 · ВРАТА, южный выход (2:3)
```
same town, its open gates seen from inside the square: two stone
pillars, sagging lintel, one gate leaf fallen and overgrown with
grass, dirt road passes through the gates and EXITS into depth at
center toward a faint cinnabar-tinted horizon that curves gently
like the rim of a disc, wheel ruts, footprints, small blank signpost,
cobblestone fades to dust beyond the gates, dry-brush texture,
scratched frame edges, + стиль-блок --ar 2:3
```

### G0.3 · КОЛОДЕЦ, северная кромка (2:3)
```
same town, northern edge at night: stone well with wooden winch roof
in foreground, low house with doorway ajar spilling faint warm light
and a cat on the ridge, road EXITS top edge at center into darker
night, laundry line, moss creeping up the well stones,
+ стиль-блок --ar 2:3
```

### G1 · ТИТУЛ (16:9) · рефом — РЕФ-Б, сильный вес
```
vast dark night sky dominated by a huge blood-red moon #C23B2B,
concentric engraved ring halos circling the moon like grooves of a
record, black ink dripping from the moon's lower rim, one thin
horizontal ribbon of black birds crossing in front of the moon,
below: gently CURVED disc horizon, tiny silhouette of a low town
with one spire backlit by bone-pale glow #D9CFB8 (never pure white),
two tiny warm lit windows #E28A3A in the silhouette, sky fades to
deep flat black #0D0B0A at the top corners, rough woodcut dry-brush
texture, scratched worn frame edges, sparse stars,
+ стиль-блок --ar 16:9
```

### G2 · ДВА ОЧАГА, XVII, запад (2:3)
```
17th century dutch-flemish street at evening, tall narrow brick
houses, one house with warm hearth glow in a leaded window, lens
grinder's workshop with small blank notice nailed to the door,
wooden shutters, cobblestone road ENTERS bottom edge at lower third
and EXITS into depth at center, still canal along the road,
firelight only era, + стиль-блок --ar 2:3
```

### G3 · МЕЛКИЙ ШРИФТ, XVIII, запад (2:3)
```
18th century european square at dusk, large stopped tower clock
(clock face without hands), printing shop wall covered in dense
unreadable tiny posters, double-facade building, small fenced grave
in the middle distance, road ENTERS bottom-left at lower third and
EXITS right edge at lower third, arcade crossing upper third,
+ стиль-блок --ar 2:3
```

### G4 · НЕОН — ворота парка (2:3) · рефом — РЕФ-Б, слабый вес
```
abandoned amusement park entrance at night, tall gate with broken
unreadable letter sign, dead neon tubes, queue-line barriers snaking
across empty asphalt to nowhere, one working streetlight far away,
humming power line crossing the frame, two-circles graffiti tag on
a wall, ONE dead neon sign glowing faint cinnabar red, high in the
sky a small blood-red moon with concentric engraved ring halos,
+ стиль-блок --ar 2:3
```

### G5 · КРИОСКЛЕП «WD» (2:3) · НОЛЬ ТЕПЛА, без тёплых рефов
```
underground cryogenic vault, single steel sarcophagus with a small
frosted window, hoarfrost covering thick power cables converging
from the ceiling, breath vapor in freezing air, NO warm light at all,
only pale bone-cold glow #D9CFB8 and deep blacks #0D0B0A, one faint
cinnabar #C23B2B indicator lamp as the only color, tiny hooded figure
at the threshold, heavy film grain, etching-inspired, vast dark
negative space --ar 2:3
```
(стиль-блок сюда НЕ вставлять — в нём есть warm light source.)

### G6 · НОЧНОЙ — ЗАКРЫТ РЕФ-А. Промт вариантов (если понадобятся):
```
ink drawing on aged paper #E8DCC3, tall gaunt observer figure in
tattered layered robes with lace-like torn holes, crescent moon
cradling his bald head like a collar, open ribcage revealing a small
night sky with a spiral galaxy and planets inside, one raised hand
letting thin filaments of light rise past the top edge, the other
hand pouring a stream of dark sand scattering into dots, faint
desert horizon with two distant rock spires, cold silver-blue tint
ONLY inside the moon and the cosmic cavity, fine etching crosshatch,
sepia ink #3A3026, no background scene, museum plate composition
--ar 3:4
```

---

## 4. Дельты к чек-листу приёмки брифа

1. + Луна везде с кольцами-нимбами; капли — только на титуле.
2. + Горизонт в дальних планах — дуга (мир-диск), не прямая.
3. + Зарево/света — КОСТЬ, чистый белый бракуем (в РЕФ-Б поправить).
4. + Затёртые процарапанные края кадра — норма, не брак.
5. Печати/подписи/номера — не генерим, ставит игра (в т.ч.
   киноварная печать на G6).
6. Холодный серебристо-синий разрешён только в регистре бумаги
   (месяц и космос Ночного) — в мировых кадрах его нет.

---

## 6. Журнал теста сеток · 2026-07-23 (запущено через MCP)

Один промт на локацию, 1k/дешёвые тиры. Лайки в Higgsfield UI =
сигнал «сетка подходит». Сопоставление задание→сетка — по метаданным
в истории генераций.

**Площадь городка G0.1 (16:9), 8 сеток:** Soul Cinema · FLUX.2 max ·
Recraft V4.1 (hex-палитра) · Soul Location · Soul 2.0 · Cinema
Studio 2.5 · Nano Banana Pro · Nano Banana 2.

**Соседние локации:**
- врата G0.2 (2:3): GPT Image 2 · Seedream 4.5
- титул G1 (16:9): Kling O1 · Soul Cinema
- XVII «два очага» G2: FLUX.2 pro (3:4) · Soul Cinema (2:3)
- XVIII «мелкий шрифт» G3 (2:3): Nano Banana Pro
- неон G4 (2:3): Soul Location
- колодец G0.3 (2:3): Soul Cinema
- криосклеп G5 (3:4, ноль тепла): FLUX.2 max

**Вычеркнуты по ходу теста** (отклонены автором): Grok Image,
Nano Banana budget/2 Lite, Seedream 5.0 lite/pro, Cinema Studio на
криосклепе, Recraft на вратах.

**Первое наблюдение**: Soul Cinema на площади дала не ночной офорт,
а дневную линогравюру (чёрное по кости, киноварное окно, костёр,
кот, шут, пифос — состав точный). Тональность инвертирована —
кандидат не в мировой регистр, а в регистр бумаги/вклеек.

## 7. Волна «поиск стиля» · стиль-блок v2 (по лайку автора, 26.07)

Лайк: ночная ксилография площади — рамка-обводка с царапинами,
эффект старой печати, **мультиплановая глубина** («камера Диснея»:
тёмный передний план / освещённый средний / дальний силуэт).
Стиль-блок v2 добавляет к v1: `night woodcut style with layered
multiplane depth: dark foreground silhouette layer, lit middle
ground, far silhouette layer against pale sky` + `aged print effect
with scratched dark frame border and worn edges`. На титуле птицы
вышли кривыми → в ретрае «exactly seven black birds as clean simple
woodcut silhouettes in one thin horizontal line».

Запущено по новым локациям (одна сетка на локацию):
- Рим-колоннада (2:3) — Recraft V4.1 + палитра
- осевое «три огня», дворик с чашей (2:3) — Soul Cinema
- собор на алом небе (3:4) — FLUX.2 max
- XIX газовый переулок (2:3) — Nano Banana Pro
- край: кольцо огня за обрывом (16:9) — Soul Cinema
- XX завод-градирня, ЛЭП (3:4) — FLUX.2 max
- мегаполис «сейчас», красно-чёрный (2:3) — Recraft V4.1 + палитра
- акведук-переход, фигура с фонарём (2:3) — Nano Banana Pro
- титул-ретрай, чистые птицы (16:9) — Nano Banana Pro

Мультиплан — не только стиль: слои кадра разносим в параллакс
в гибридной сцене (задник / средний / передний + векторный слой
жизни + зерно поверх).

## 8. Бейк-офф персонажей · 26.07 (двурукий канон)

Стилевые эталоны фаз и канон фигур — `weave/STYLE_SYSTEM.md`.
Дом-стиль портретов — `src/assets/ART_DIRECTION.md` (ветка
gallant-ride): тушь/вудкат Доре на пергаменте, один акцент-цвет;
поверх — наша двойная красно-охристая рамка.

Матрица: 4 персонажа × 4 сетки (Kling O1 · Recraft V4.1+палитра ·
Seedream 4.5 · FLUX.2 pro), формат 3:4 (Recraft 4:5):
- **Машинист** — сидяч, врос в пульт; акцент: уголь в топке.
- **Старец** — свиток/перо; акцент: индиго-чернила.
- **Лунный** — месяц-воротник, космос в рёбрах; акцент: индиго-серебро.
- **Мусорка-демон** — после поправки концепции перегенерён на всех
  четырёх сетках: горящая свалка внизу, демон образуется из дыма
  (первая волна «собран из мусора» — брак концепции, в архиве).

## 10. Сцена «Поезд издалека» · 26.07

Первая СЦЕНА по канону (в отличие от портретов — путник в кадре есть
и он мал; см. `weave/STYLE_SYSTEM.md`, канон фигур п.2).

Собрана из трёх обязательных для сцен вещей:
- **мультиплан** — тёмный передний план (сухой бурьян и щебень насыпи) /
  освещённый средний (путник на путях) / дальний силуэт (паровоз);
- **иерархический масштаб** — паровоз-громада, путник крошечный;
- **один акцент** — багровое окно кабины и уголёк топки, единственный
  красный в кадре; он же связывает сцену с портретом Машиниста.

Мотивы из канона Машиниста, вшитые в сцену: приоткрытая дверь кабины,
трава не растёт у колёс, пар стоит вертикально (поезд мёртв, но топка
жива). Фаза — вечер (= ночь с бо́льшим костяным светом, без луны).

Промт лежит ниже в этом файле в двух языках; локнутого кадра пока нет —
ждёт прогона.

## 9. Волна с референсами · 26.07 (сведение к рисовке игры)

Диагноз: портреты уезжали от кадров игры, потому что генерились
**без единого референса** — в истории у всех прошлых заданий
`input_images: []`. Лечение и правила выбора рефов — в
`weave/STYLE_SYSTEM.md`, раздел «Метод референсов».

Прогнано на Seedream 4.5 / FLUX.2 pro / Nano Banana (Recraft выбыл —
не принимает референсы):
- **Машинист v2** — снята поза лотоса, рабочая посадка на откидном
  табурете, ноги вниз, ботинки на площадке. Локнут.
- **Мусорка-демон v3** — свалка опущена в нижнюю треть, один дымовой
  столб на две трети кадра, лицо и руки-мудры проступают из дыма,
  добавлен крошечный путник у подножия для иконного масштаба. Локнут.
- **Шут** — восьмирукий полу-Шива по канону `ART_DIRECTION.md`:
  кинжалы в орбите вокруг головы, трёхрогий колпак с бубенцами, ромбы
  на ноге, шипастый кистень с лодыжки, череп с крестовым шрамом,
  кровавая луна-нимб, путник у ног. Локнут.

Правки канона прошлой волны: у всех по две руки (кроме Шута);
надписи в кадре («THE LANDFILL DEMON» у Recraft) — брак, режем
рамкой или перегенерацией; иконный масштаб костра и Шута — правило
для сцен, в портретах не участвует.

---

## Промт сцены «Поезд издалека с путником» (вер. 1, 26.07)

Референсы (если сетка принимает): `weave/STYLE_AQUEDUCT_nano.png` —
рамка/зерно/ночной регистр; `weave/STYLE_MEGACITY_recraft.png` —
бумага/палитра. Формат 3:2 или 16:9 (сцена, не портрет).

### RU
> Широкий пейзажный кадр пустоши на исходе вечера. Вдалеке, на насыпи,
> стоит мёртвый паровоз — огромная чёрная громада, застывшая боком к
> зрителю, дверь кабины приоткрыта. Из трубы стоит вертикальный столб
> пара, неподвижный, будто нарисованный. У колёс не растёт трава:
> вокруг них голая проплешина земли. Ржавые рельсы уходят из нижнего
> края кадра к паровозу и обрываются, не доходя до горизонта.
> На путях, много ближе к зрителю, спиной к нам стоит КРОШЕЧНАЯ
> одинокая фигура путника в капюшоне и смотрит на поезд. Иерархический
> иконный масштаб: паровоз-великан, путник размером с ноготь — он
> должен теряться в кадре. Многоплановая глубина: тёмный передний план
> силуэтом (сухой бурьян, щебень насыпи, шпалы), освещённый средний
> план (путник на путях), дальний силуэт (паровоз и еле различимые
> столовые горы на горизонте). Чёрная тушь, гравюра-вудкат,
> кросс-хэтчинг в духе Гюстава Доре, глубокие плоские чёрные массы и
> костяно-белые вырезанные блики на состаренном пергаменте, плотное
> печатное зерно и царапины, фактура состаренной монотипии, двойная
> рамка по краю кадра тёмного красно-охристого цвета с затёртыми
> поцарапанными краями, много пустого неба, огромное пустое
> пространство. ЕДИНСТВЕННЫЙ акцент: багровое свечение из приоткрытой
> двери кабины и из щели топки — единственный красный в кадре.
> Никаких других цветов, без 3D, без глянца, без текста, без букв,
> без подписей, без сигнатуры

### EN
> Wide landscape shot of a wasteland at late evening. Far away on an
> embankment stands a dead steam locomotive — an enormous black mass
> halted side-on to the viewer, its cab door left ajar. A vertical
> column of steam stands motionless above the funnel, as if drawn in
> place. No grass grows by the wheels: bare scoured earth rings them.
> Rusted rails run from the bottom edge of the frame toward the engine
> and break off before reaching the horizon. On the track, much nearer
> to us, a TINY lone hooded traveller stands with his back turned,
> looking at the train. Hierarchic icon scale: the locomotive is a
> giant, the traveller is a fingernail-sized speck who should almost
> be lost in the frame. Layered multiplane depth: dark foreground
> silhouette layer (dry scrub, embankment gravel, sleepers), lit middle
> ground (the traveller on the rails), far silhouette layer (the engine
> and faint wasteland buttes on the horizon). Black pen-and-ink woodcut
> engraving, Gustave Dore crosshatch, deep flat blacks with bone-white
> carved highlights on aged parchment, heavy print grain and scratches,
> aged monoprint texture, double frame border in dark red-ochre with
> worn scratched edges, vast empty sky, enormous negative space.
> SINGLE accent: crimson glow from the ajar cab door and the firebox
> slit — the only red in the image. No other colors, no 3D, no gloss,
> no text, no letters, no captions, no signature
