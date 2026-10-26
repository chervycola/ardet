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

## 11. Заставка «форма 0» · 24.10 — три раунда через MCP

Фон первого экрана. Поверх него ложится бумажный бланк «форма 0 ·
заявление о начале странствия» (`#form0`, по центру, ширина
min(420px, 88vw)). Отсюда **правило композиции заставки**:
- середина кадра тёмная и пустая: бумага кладётся на ночь, на светлом
  небе бежевый бланк растворяется;
- сильный верх (луна) и сильный низ (сюжет), между ними пустая полоса;
- всё главное на вертикальной оси, чтобы кадр пережил кроп 9:16.

Проверка — контактный лист: на каждый кадр накладываем силуэт бланка
и рамку кропа 9:16 (ImageMagick по превью `_min.webp`).

**Раунд 1 · 3 подхода × 3 пробы** (оттиск / офорт / Бакши × луна /
городок / ворота; 13.5 кр.). Победил **2а · офорт · луна** (GPT Image 2,
`41536d16`): луна в кольцах с потёками, чёрная середина, выгнутый
горизонт с крошечным городком. Оттиск даёт самую сильную графику, но
тянет к светлому небу: 1б (городок красной плашкой) отложен под постер
или экран загрузки. Бакши сползает в типовое тёмное фэнтези и пускает
лишний цвет (3а — бирюзовое небо целиком).

**Раунд 2 · всё в стиле 2а, `41536d16` референсом** (луна / городок /
дорога × GPT Image 2 / Seedream 5 Pro / FLUX.2; 13.5 кр.). Лучшие:
городок Seedream `a15c6d93`, городок GPT `53af2c5b`, дорога GPT
`98981edc`, дорога Seedream `62498057`. С референсом небо у всех одно,
меняется только низ, поэтому **заставка может идти серией по вечерам**
(бланк и так ставит «вх. № вечера»).

**Раунд 3 · следующие сюжеты и новые сетки** (21 задание, ≈37 кр.).
Место пробуждения теперь **дом в городе** (`weave/HOUSE.md`), костёр
идёт отдельным сюжетом.

| сюжет | GPT Image 2 | Seedream 5 Pro | FLUX.2 |
|---|---|---|---|
| дом пробуждения | ✓ `a574230f` | ★ `0678bf23` | ✗ фонари горят, луна-фото, дом под бланком |
| костёр и Шут | ✓ `0785b7af` | ~ `2877924d`: колпак заходит под бланк | ✗ путник ростом с Шута |
| канцелярия | ✓ `9a3537e6` | ✗ запекла бумажные поля | ✗ дом под бланком, окна горят у соседей |
| диск мира | ~ `54f2191a`: городок в центре под бланком | ★ `ac32ffff`: центр пересвечен почти до белого | ~ годен |

Новые сетки, тот же референс:

| сюжет | сетка | итог |
|---|---|---|
| дом | Nano Banana 2.1 | ★ `98d5ea56` |
| дом | Grok Image 2.0 | ✗ крыша под бланком |
| дом | Recraft V4.1 (референс не принимает) | ✗ ушла в светлую бумагу; это контроль: без референса стиль не держится |
| канцелярия | Kling O1 | ✗ дом в полкадра, под бланком |
| канцелярия | OpenAI Hazel (только 3:2) | ✓ `08d387f5`, для 16:9 нужен аутпейнт |
| канцелярия | Soul 2.0 | ✗ сюжет потерян |
| диск | Soul Cinema | ✗ пашня вместо диска |
| диск | Cinema Studio 2.5 | ★ `53fc0b4a` |
| диск | Soul Cinema Studio | ✗ сюжет потерян |

**Сетки для этого стиля:**
- **оставить**: GPT Image 2 (самая ровная, ближе всех к референсу),
  Seedream 5 Pro (самая подробная, но иногда запекает поля и поднимает
  сюжет), Nano Banana 2.1, Cinema Studio 2.5;
- **вычеркнуть**: FLUX.2 (рамки, горящие фонари, фотолуна; за два
  раунда годен один кадр из семи), семейство Soul (сервер сам
  переписывает промт через `enhance_prompt`, сюжет теряется), Kling O1
  и Grok 2.0 (сюжет лезет под бланк), Recraft (без референсов).

**Грабли:**
- фраза «title screen» провоцирует текст (Seedream вписала готическую
  абракадабру): убрана, в хвосте явный запрет надписей;
- запросы на Nano Banana Pro сервер исполняет как Nano Banana 2;
- `use_unlim` для аккаунта закрыт, безлимит есть только в веб-интерфейсе;
- Ideogram 4.5 и Z Image падают технически, кредиты не списываются.

Рабочий промт — в конце файла, «Промт заставки «форма 0» (вер. 3)».

## 12. Портрет Сола для диалога · 25.10

Задание — `weave/PORTRAITS.md` (ветка philosophy): `sol.png`, вертикаль 4:5,
1024×1280; в игре рамка 168×210, на телефоне 72×90. Канон фигуры —
`weave/FIGURES.md` и ART_BIBLE §05. Сол является в красный полдень, поэтому
фон — ровная киноварь без теней.

Шесть проб (9.75 кр.), промт один на все (ниже), меняются сетка и референс:

| № | сетка | референс | итог |
|---|---|---|---|
| 1 | GPT Image 2 | 2а `41536d16` | солнце-маска, самый офортный и гротескный; лучей около 15 |
| 2 | Seedream 5 Pro | 2а | человек с нимбом: читается как святой, а не как солнце |
| 3 | Nano Banana 2.1 | 2а | то же, зато самое строгое лицо |
| 4 | GPT Image 2 | ДЕНЬ `3637a5f7` | ★ выбор автора, `479004eb`: лицо — сам диск, потёки, рёбра в прорехе, ветка горит; лучей около 20 |
| 5 | Seedream 5 Pro | ДЕНЬ | голова-диск, лучше всех читается в 72×90, `6f08583f` |
| 6 | Recraft V4.1 | без референса, палитра | киноварь ушла в алый, ветка стала факелом |

Для красного полдня референс ДЕНЬ держит концепт лучше: Seedream с ним
рисует солнце-лицо, а с офортом 2а — святого с нимбом.

В игре: `assets/portraits/sol.png` — №4, обрезан до 4:5 сверху и выведен
в 1024×1280. Расхождение с каноном: лучей около двадцати, а по канону 14
(«число несущее»). Если число держим строго — поправить одной правкой поверх.

Промт (голова для референса ДЕНЬ):
> Match the style of the reference image, not its composition: flat
> woodcut-poster layers, solid cinnabar masses, bone highlights, worn print
> texture. Dialogue portrait of Sol, the sun of this world, who appears at
> red noon: an anthropomorphic sun god with two arms. Behind his head a disc
> with exactly fourteen straight rays. Under the disc a stern, grotesque,
> solemn face — heavy eyelids, a straight mouth with the corners turned down,
> frozen drips running down the cheeks like cooled wax. Beneath the disc a
> wilting wreath of wheat ears, some ears drooping. His mantle turns from
> cracked gilding at the shoulders, across a ragged border, into dark wood
> and then into ash and decay at the hem; the gilding is drawn in
> candle-orange #E28A3A and bone #D9CFB8, never metallic. A sunflower clasp
> with a skull at its heart, on a dark backing, holds the mantle; through two
> tears in the cloth his ribs show. In one hand a branch that burns and does
> not burn away, its flame drawn as solid flat tongues. Red noon without
> shadows: behind him a flat, even cinnabar #C23B2B ground, no shading, no
> sky, no landscape. One clear silhouette that still reads when tiny: head
> and rays in the upper three-fifths of the frame. Etched portrait print:
> black and bone ink hatching over the flat cinnabar ground, Gustave Doré
> density, rotaprint impression, heavy paper grain, slightly misregistered
> second ink, solemn, waist-up, the figure fills the frame. No text, no
> letters, no signature, no watermark, no border, no frame. Not glossy, not
> 3D, not vector, not cartoon, no metallic gold, no blue, no purple, no green.

## 13. Портреты в игре и Лунный с цифрой · 25.10

В игре сейчас (`assets/portraits/`, 4:5, 1024×1280):
- `sol.png` — №4 из §12;
- `jester.png` — картина автора по короткому промту ниже: белое лицо,
  красные губы, колпак с тремя рогами, ромбы, горящий нимб, кинжал остриём
  вниз, дымящаяся пика, костёр снизу;
- `nocturnal.png` — картина автора, Лунный «немного кибернетически-цифровой,
  несильно» (слово автора): дорожки платы по ободу серпа, нити уходят
  в пиксели, песок сыплется квадратными зёрнами.

Шут (короткий промт, референс — Сол №4):
> Match the style of the reference image, not its composition or background.
> Etched portrait print of the Jester at the sacrificial bonfire: chalk-white
> face, red #C23B2B lips in a fixed smile, a small cross in his left eye
> socket, three-horned cap with bells, harlequin diamond doublet, a burning
> cinnabar halo with candle-flame tongues. Dagger point-down in his right
> hand, a smoking pike in his left. Amber bonfire glow from below, near-black
> void behind. Waist-up, one clear silhouette, Doré-dense hatching, heavy
> paper grain, solemn. No text, no frame, not glossy, not cartoon.

Лунный с цифрой — семь проб (11 кр.), промт один:
> Match the drawing technique of the reference image, not its composition or
> colors. Etched portrait print of the Nocturnal, the lunar puppeteer, with a
> faint touch of the machine: instead of a head, a crescent of darkened
> silver with a face with closed eyes in its curve, its rim etched with fine
> circuit traces; a starfield cloak, the four-star constellation on the chest
> joined by thin straight lines; silver threads rise from his raised fingers
> and break into tiny square pixels high in the dark; black sand falls from
> his lowered palm as small square grains. Cold moonlight only, no warm
> light, near-black void behind. Waist-up, the figure fills the frame, the
> crescent head in the upper three-fifths, one clear silhouette, Doré-dense
> hatching in bone and ash grey, heavy paper grain, solemn. No text, no
> numbers, no frame, no neon, no blue, no robot armor, not glossy.

| № | сетка | референс | итог |
|---|---|---|---|
| 1 | GPT Image 2 | Сол `479004eb` | ушёл в сепию, дорожки платы не видны |
| 2 | Seedream 5 Pro | Сол | ★ `67203a58`: самый чистый и читаемый в 72×90; но нити идут вниз, как у марионетки, пиксели едва видны |
| 3 | Nano Banana 2.1 | Сол | ★ `c1071e9c`: ближе всех к брифу по цифре (нити в пиксели, песок квадратами), но внизу светлый блок |
| 4 | GPT Image 2 | 2а `41536d16` | плата лабиринтом, но кадр слишком тёмный |
| 5 | Seedream 5 Pro | 2а | `775d85e7`: свечение по серпу, драматично, цифры мало |
| 6 | Nano Banana 2.1 | 2а | запекла бумажную рамку — брак |
| 7 | GPT Image 2 | Сол + зелёный блик | зелёный проигнорирован, сепия |

Выводы: GPT с референсом Сола тянет тёплую сепию — для холодных фигур
бери Seedream или Nano Banana. Картина автора пока сильнее всех по балансу,
поэтому в игре остаётся она.

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

---

## Промт ТИТУЛА/меню «Город под кольцами» (вер. 2, 26.07)

Назначение: заглавный экран и фон меню. Формат 16:9, для меню лучше 21:9.
Референсы: `weave/STYLE_FX_nano_scratches.png` (главный) +
`weave/STYLE_OVERLAY_kling_moon.png` (вторичный — нимб-кольца на полнеба).

**Почему вер. 2.** В вер. 1 луна описывалась через «виниловую пластинку»
(бороздки + шпиндель + этикетка) — сетки принимают это слишком буквально
и рисуют настоящую пластинку с бликом вместо луны. Убрано. Теперь весь
кадр строится на ОДНОЙ абстракции:

> всё в кадре — концентрические окружности, расходящиеся из центра луны.

Из неё выпадают сразу три вещи, и «пластинка» получается сама:
1. кольца на самом диске луны (ближние, плотные);
2. кольца-нимб, расходящиеся по небу (средние, редеющие);
3. **линия горизонта — самое внешнее кольцо этого же семейства**: она
   провисает в центре кадра и круто задирается вверх к луне у левого и
   правого краёв. Это и есть «затягивает» / эффект широкоугольной линзы:
   мир прогнут чашей, края земли тянутся к диску.

Городок — на дне этой чаши, в центре, крошечный. Верхняя треть пустая
под логотип; текст не рисуем, место оставляем.

### RU
> Заглавный кадр: огромное ночное небо и крошечный городок далеко внизу.
> Вся композиция построена на концентрических окружностях, расходящихся
> из одного центра — из середины луны. Луна — большой багровый диск в
> верхней половине кадра, весь прочерченный тонкими концентрическими
> кольцами, идущими от маленькой тёмной точки в самом центре к краю
> диска: ровные гравюрные окружности, вырезанные штихелем. Те же кольца
> продолжаются за пределы диска и расходятся по всему небу огромным
> нимбом, слабея и редея к углам кадра. С нижней кромки луны тяжёлыми
> каплями стекает чёрная тушь; поперёк диска тонкой горизонтальной лентой
> летит стая чёрных птиц силуэтами. Линия горизонта — самое внешнее из
> этих колец: она провисает низко в центре кадра и круто ЗАГИБАЕТСЯ ВВЕРХ
> К ЛУНЕ у левого и правого краёв, так что земля вздёрнута по бокам, как
> в широкоугольной линзе, и словно затягивается к диску. Мир прогнут
> чашей. На дне этой чаши, в самом центре, стоит крошечный чёрный силуэт
> провинциального городка с одной колокольней, два тёплых окна светятся
> в силуэте, за ним по земле разлито бледное костяное зарево (никогда не
> чисто белое). К верхним углам небо уходит в глухой плоский чёрный,
> редкие звёзды. Верхняя треть кадра оставлена пустой. Гравюра-вудкат
> сухой кистью, плоские чёрные массы, костяно-белые вырезанные блики,
> состаренная бумага, плотное печатное зерно и царапины по всему полю,
> затёртая процарапанная рамка по краю кадра, огромное пустое
> пространство. Единственные цвета: чёрный, костяной и багровый —
> багровый только в луне. Без 3D, без глянца, без текста, без букв,
> без подписей, без сигнатуры

### EN
> Title screen: an enormous night sky above a tiny town far below. The
> whole composition is built from concentric circles radiating from a
> single center — the middle of the moon. The moon is a large crimson disc
> in the upper half of the frame, entirely scored with fine concentric
> rings running from a small dark point at its exact center out to the rim:
> even engraved circles cut with a burin. The same rings continue beyond
> the disc and spread across the whole sky as an enormous halo, weakening
> and thinning toward the corners. Heavy drops of black ink drip from the
> moon's lower edge; a thin horizontal ribbon of black birds crosses the
> disc in silhouette. The horizon line is the outermost of these rings: it
> sags low at the center of the frame and sweeps steeply UPWARD TOWARD THE
> MOON at the left and right edges, so the land tilts up at the sides as if
> seen through a wide-angle lens, drawn in toward the disc. The world is
> bowed into a shallow bowl. At the bottom of that bowl, dead center,
> stands the tiny black silhouette of a provincial town with a single
> steeple, two warm lit windows glowing in it, a pale bone-white glow
> (never pure white) spread along the ground behind it. The sky fades to
> deep flat black at the top corners, sparse stars. The top third of the
> frame is left empty. Dry-brush woodcut engraving, flat black masses,
> bone-white carved highlights, aged paper, heavy print grain and scratches
> across the whole field, worn scratched frame border, vast negative space.
> Only colors: black, bone and crimson — crimson only in the moon. No 3D,
> no gloss, no text, no letters, no captions, no signature

---

## Промт заставки «форма 0» (вер. 3, 24.10)

Журнал прогонов — §11. Формат 16:9. Сетки: GPT Image 2 · Seedream 5 Pro ·
Nano Banana 2.1 · Cinema Studio 2.5. Референс — `41536d16` (кадр 2а) по
job-id: роль `image` у GPT Image 2 и Cinema Studio 2.5, роль
`image_references` у Seedream и Nano Banana.

Сборка: **голова + сюжет + хвост**. Голова и хвост не меняются, меняется
только слот сюжета. Небо у всей серии одно, поэтому кадры складываются
в серию сами.

**Голова**
> Match the style of the reference image exactly: very dark vintage
> etching and mezzotint, deep velvety blacks dominating the frame, fine
> crosshatching, burnished bone #D9CFB8 highlights, plate scratches, heavy
> film grain; red #C23B2B only in the moon (rough drips, concentric ring
> strokes) and a thin glow along the horizon.

**Хвост**
> Composition: a huge red moon scored with concentric rings high in the
> upper third, three scattered black birds near it; the middle band left
> calm, nearly black and empty; the subject stays low, below the middle
> band; key elements centered on the vertical axis. The image runs to all
> four edges with no border of any kind: no frame, no paper margin, no
> white edge line, no vignette edge. No text, no letters, no title, no
> signature.

### Слоты сюжета

**Дом пробуждения** (первый вечер; лучшие — Seedream `0678bf23`, Nano
Banana 2.1 `98d5ea56`)
> In the bottom fifth, the house of awakening seen from a distance: the
> only intact house among the ruined old streets of the town — a plain
> stone house, its stone paler than the ground, a roof sloping toward the
> street, a cold chimney with no smoke, dark windows, a door in the
> middle; around it only low foundations, stumps of walls and dead street
> lanterns on empty cobblestones, a church silhouette nearby. No light in
> the windows. A tiny hooded traveller stands at the door with one tiny
> amber #E28A3A ember glowing at his chest — the only warm light.

**Костёр и Шут** (лучший — GPT `0785b7af`)
> In the bottom fifth, the bonfire on the square of a small timeless town
> seen from a distance: exactly one bull skull on a single pole beside the
> fire, and the Jester standing by the flames — a gaunt multi-armed
> harlequin in a three-horned belled cap, his arms juggling three daggers
> in a natural cascade with elbows close to the body; the Jester is
> clearly larger than a tiny hooded traveller approaching from the side,
> hierarchic icon scale. The fire is one solid amber #E28A3A light.

**Канцелярия** (лучший — GPT `9a3537e6`)
> In the bottom fifth, the town chancellery seen from a distance: a narrow
> two-story office building with a steep gable roof and a row of dark
> windows, exactly one of them — the third from the left — lit amber
> #E28A3A, a crooked blank noticeboard by the door, low dark rooftops of
> the town on either side.

**Диск мира** (лучшие — Cinema Studio 2.5 `53fc0b4a`, Seedream `ac32ffff`)
> In the lower third, the whole world seen from high above as a flat disc
> at a low angle, a wide flat ellipse: a tiny town at its center, around
> it concentric rings of land — fields, ruins, roads, each ring a
> different texture — and at the outer rim a thin ring of fire; the rings
> of the land echo the concentric rings of the moon above.

**Городок** и **дорога** — сюжеты раунда 2 (лучшие: городок Seedream
`a15c6d93`, дорога GPT `98981edc`), переложены под хвост вер. 3. В этом
виде ещё не гонялись.
> In the bottom fifth, the small timeless town seen from a distance: dark
> rooftops, a chancellery with one lit amber #E28A3A window, exactly one
> bonfire on the square with exactly one bull skull on a single pole, a
> thin line of smoke rising straight up, exactly one black cat silhouette
> on a roof ridge.

> In the bottom fifth, open stone gates overgrown with grass and a short
> dusty road with wheel ruts leading out through them; a tiny hooded
> traveller just past the gates, back to us, one tiny amber #E28A3A
> lantern in hand.
