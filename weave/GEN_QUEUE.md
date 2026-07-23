# ОЧЕРЕДЬ ГЕНЕРАЦИИ · базовые картинки и начальные сцены
статус: Higgsfield MCP мигает — очередь готова к запуску при первом
подключении; промты совместимы с midjourney/kling/flux.

**ПРИОРИТЕТ: городок первым (G0).** Он — центр диска: из него выходят
все пять радиальных дорог, значит его кадры задают эталон стиля,
масштаба фигуры и профилей кромок для всех дальнейших швов.
Не генерить эпохи, пока не принят G0.1.

## G0.1 · ГОРОДОК — опорный кадр площади (16:9, эталон мира)
```
small timeless town square at long evening, seen slightly from above,
left: two-story chancellery building with gable roof and ONE warm lit
window casting light on cobblestones, center: small bonfire with a
bull skull on a pole and a tiny jester silhouette beside it, right:
low house with a cat on the roof ridge and thin chimney smoke, far
back: open gates overgrown with grass and a dark castle silhouette
like weather on the hill, cobblestone ground with moss patches,
a stone well, a clay pithos lying on its side, dead street lantern,
dark etching-inspired painterly scene, deep flat blacks, bone-white
highlights #D9CFB8, warm light #E28A3A (max three warm spots: window,
bonfire, ember), cinnabar #C23B2B as the only red, heavy film grain,
vast negative space, tiny lone hooded figure for scale --ar 16:9
```
приёмка эталона: масштаб фигуры = канон для всех клеток; три тёплых
пятна ровно; после приёмки — аутпейнт влево/вправо до панорамы
6 экранов.

## G0.2 · ГОРОДОК — врата, южный выход (2:3, шов к осевому·юг)
```
same town, its open gates seen from inside the square: two stone
pillars, sagging lintel, one gate leaf fallen and overgrown with
grass, dirt road passes through the gates and EXITS into depth at
center toward a red-tinted horizon, wheel ruts, footprints, a small
signpost, cobblestone fades to dust beyond the gates, + стиль-блок
(see G0.1 palette lines) --ar 2:3
```
пасхалка в промт: табличка на вратах (И1, мелкая, нечитаемая —
текст ставим оверлеем).

## G0.3 · ГОРОДОК — колодец и дом с котом, северная кромка (2:3)
```
same town, northern edge: stone well with wooden winch roof in
foreground, low house with lit doorway ajar and a cat on the ridge,
road EXITS top edge at center into darker night, laundry line,
moss creeping up the well stones, + стиль-блок --ar 2:3
```

## G1 · ТИТУЛЬНЫЙ ЭКРАН — красная луна над городком (16:9)
```
vast dark night sky dominated by a huge blood-red moon with painterly
brush ring halos, tiny silhouette of a low town on the horizon with
two or three warm lit windows, a thin flock of black birds crossing
the moon, sparse stars, heavy paint texture and film grain, deep flat
blacks, bone-white highlights #D9CFB8, cinnabar red #C23B2B as the
only red, one warm light accent #E28A3A in windows, no neon, no gloss,
melancholic monumental quiet --ar 16:9
```
назначение: задник титула; поверх — процедурные птицы, кольца, мерцание.

## G2 · ДВА ОЧАГА · ЗАПАД (клетка-дыра, 2:3, walkable)
```
17th century dutch-flemish street at evening, tall narrow brick houses,
one house with a warm hearth glow in a leaded window, lens grinder's
workshop sign, wooden shutters, cobblestone road ENTERS bottom edge at
lower third and EXITS into depth at center, canal with still water along
the road (spiral river), gas-less era: only firelight, dark etching-
inspired painterly scene, deep flat blacks, bone-white highlights
#D9CFB8, single warm light #E28A3A, cinnabar #C23B2B as the only red,
heavy film grain, vast negative space, tiny lone hooded figure --ar 2:3
```
пасхалки в промт: письмо-херем, прибитое к двери мастерской линз
(«small paper notice nailed to the workshop door»).

## G3 · МЕЛКИЙ ШРИФТ · ЗАПАД (клетка-дыра, 2:3, walkable)
```
18th century european square at dusk, enlightenment era, a large
stopped clock on a tower, printing shop with tiny dense text posters
covering the wall, double-facade building, road ENTERS bottom-left
at lower third and EXITS right edge at lower third, aqueduct-like
arcade crossing upper third, dark etching-inspired painterly scene,
deep flat blacks, bone-white #D9CFB8, single candle-warm window
#E28A3A, cinnabar #C23B2B only red, heavy grain, tiny hooded figure
--ar 2:3
```
пасхалки в промт: часы без стрелок «ВРЕМЯ — ДЕНЬГИ» (clock face
without hands), могила с оградкой поодаль (Ж1 — могила Канта).

## G4 · НЕОН · ВОРОТА ПАРКА (2:3, walkable)
```
abandoned amusement park entrance at night, tall gate with broken
letter sign, dead neon tubes, queue-line barriers snaking across
empty asphalt to nowhere, one working streetlight far away, humming
power line crossing the frame, dark etching-inspired painterly scene,
deep flat blacks, bone-white #D9CFB8, single warm light #E28A3A,
cinnabar #C23B2B as the only red (one dead neon sign glows faint
red), heavy film grain, tiny lone hooded figure --ar 2:3
```
пасхалки в промт: очередь-змейка (К15), «уши»-тег на стене (two
circles graffiti), подстанция с гудящей линией (вход нити U7).

## G5 · КРИОСКЛЕП «WD» (интерьер, 2:3, тупик U7)
```
underground cryogenic vault, single steel sarcophagus with a small
frosted window, hoarfrost covering cables and walls, thick power
cables converging to the sarcophagus from the ceiling, breath vapor
in cold air, NO warm light at all — only pale bone-cold glow #D9CFB8
and deep blacks, faint cinnabar #C23B2B indicator lamp as the only
color, heavy film grain, etching-inspired, vast dark negative space,
tiny hooded figure at the threshold --ar 2:3
```
правило комнаты: ноль тёплых пятен — единственная генерация канона,
где СВЕЧА запрещена.

## G6 · НОЧНОЙ — оттиск для диалогов (3:4, бумага)
```
ink drawing on aged paper, tall gaunt observer figure in tattered
layered robes, crescent moon cradling his bald head like a collar,
ribcage open showing a small night sky with planets inside, one hand
raised letting thin threads of light fall, the other hand pouring
dark sand, fine etching crosshatch, sepia ink #3A3026 on paper
#E8DCC3, tiny cinnabar #C23B2B seal stamp in corner, no background
scene, museum plate composition --ar 3:4
```
назначение: диалоговый портрет (регистр печати; кладётся на бумагу).

Приёмка всех: артерии на третях, один тёплый источник (кроме G5 — ноль),
красный только киноварь, масштаб фигуры, имя файла weave/E{...}.jpg,
внесение в опись world_weave.js.
