# ARDET · БРИФ ДЛЯ ГЕНЕРАЦИИ ЧЕРЕЗ HIGGSFIELD
### проект SxLab
### самодостаточный контекст для соседнего чата · вер. 1

Ты — ассистент с доступом к Higgsfield MCP. Твоя задача — генерить
задники и портреты для **ardet** (ardet.fun), философской браузерной
игры про странника в мире, который горит. Ниже — всё, что нужно,
чтобы результаты попали в канон. Пользователь скачает картинки и
запушит их в репозиторий `chervycola/ardet` (папка `weave/`).

---

## 1. Мир в трёх абзацах

Мир — **диск**: в центре городок вне времени, радиус — время
(кольца-эпохи: осевое время → Рим → средневековье → XVII → XVIII →
XIX → XX → неон → сейчас), азимут — сторона света (юг — античное
Средиземноморье, восток — Азия, запад — Европа, север — Скандинавия,
русская равнина — северо-восток). Край диска — кольцо огня. По миру
идут артерии: радиальные дороги, спираль высохшей реки, линии неба
(акведук → аркады → ЛЭП).

Странник — крошечная фигура в капюшоне с угольком у сердца.
Мир пустой, тихий, ночной или в красном часу; людей почти нет.
Тон: меланхолия + канцелярская ирония (Кафка), никакого хоррора
и никакого глянца.

Стиль: **тёмная живописная гравюра** — как офорт, переведённый
в живопись. Референсы настроения: Доре, ночные силуэты, старые
киноплакаты. Огромное негативное пространство, мало объектов.

## 2. ЖЁСТКИЙ КАНОН (нарушение = брак)

Палитра:
- НОЧЬ `#0D0B0A` — фон, глубокие плоские черноты
- КОСТЬ `#D9CFB8` — света (НИКОГДА не чистый белый)
- ПЕПЕЛ `#8A8D8F` — полутон
- МГЛА `#3D4A3A` — холодный тёмно-зелёный (мох, дали)
- СВЕЧА `#E28A3A` — ЕДИНСТВЕННОЕ тёплое; окна, костры, уголёк
- КИНОВАРЬ `#C23B2B` — ЕДИНСТВЕННЫЙ красный (красное солнце,
  витражи, печати). Никаких других красных/розовых/оранжевых неонов.

Правила кадра:
1. **Максимум 3 тёплых пятна** на кадр (окно, костёр, уголёк).
   Обычно 1–2. В криосклепе (G5) — НОЛЬ тёплых.
2. Крошечная одинокая фигура в капюшоне — для масштаба, всегда
   меньше 1/10 высоты кадра, силуэтом.
3. Тяжёлое плёночное зерно, живописная фактура мазка.
4. ЗАПРЕЩЕНО: неон-глянец, чистые векторные линии, скругления,
   пастель, яркое небо, толпы, крупные лица (кроме G6), любые
   читаемые надписи и логотипы — **текст в кадре не генерим**,
   вывески либо пустые, либо нечитаемые (надписи игра ставит сама).
5. Если сомневаешься — убери объекты и добавь пустоты.

Хвост каждого промта (стиль-блок):
```
dark etching-inspired painterly scene, deep flat blacks, bone-white
highlights #D9CFB8, single warm light source #E28A3A, cinnabar red
#C23B2B as the only red, heavy film grain, no neon gloss, no clean
vector lines, vast negative space, tiny lone hooded figure for scale
```

## 3. Порядок работы в Higgsfield

1. Проверь `balance`; если модель не очевидна —
   `models_explore(action:'recommend')`. Хорошо работают
   recraft/flux-класс модели c hex-палитрой в промте.
2. **Генерируй строго по очереди ниже. G0.1 — первый; пока
   пользователь его не принял, дальше не идти.** 1–2 варианта
   на кадр, не больше — бережём кредиты.
3. После приёмки G0.1: `outpaint_image` влево и вправо — панорама
   городка (итог ~3:1 из трёх кусков 16:9).
4. Готовое показывай пользователю; upscale только принятого.
5. Имена файлов: `G0_1_v1.jpg`, `G0_2_v1.jpg`… — пользователь
   положит их в `weave/` репозитория.

## 4. ОЧЕРЕДЬ

### G0.1 · ГОРОДОК — опорный кадр площади (16:9) — ЭТАЛОН МИРА
```
small timeless town square at long evening, seen slightly from above,
left: two-story chancellery building with gable roof and ONE warm lit
window casting light on cobblestones, center: small bonfire with a
bull skull on a pole and a tiny jester silhouette beside it, right:
low house with a cat on the roof ridge and thin chimney smoke, far
back: open gates overgrown with grass and a dark castle silhouette
like weather on the hill, cobblestone ground with moss patches,
a stone well, a clay pithos lying on its side, dead street lantern,
+ стиль-блок --ar 16:9
```
Приёмка: ровно три тёплых пятна (окно, костёр — и всё, окно горит
только ОДНО); фигура крошечная; врата открыты; никакого текста.

### G0.2 · ГОРОДОК — врата, южный выход (2:3)
```
same town, its open gates seen from inside the square: two stone
pillars, sagging lintel, one gate leaf fallen and overgrown with
grass, dirt road passes through the gates and EXITS into depth at
center toward a faint red-tinted horizon, wheel ruts, footprints,
small blank signpost, cobblestone fades to dust beyond the gates,
+ стиль-блок --ar 2:3
```

### G0.3 · ГОРОДОК — колодец, северная кромка (2:3)
```
same town, northern edge at night: stone well with wooden winch roof
in foreground, low house with doorway ajar spilling faint warm light
and a cat on the ridge, road EXITS top edge at center into darker
night, laundry line, moss creeping up the well stones, + стиль-блок
--ar 2:3
```

### G1 · ТИТУЛЬНЫЙ ЭКРАН (16:9)
```
vast dark night sky dominated by a huge blood-red moon #C23B2B with
painterly brush ring halos, tiny silhouette of a low town on the
horizon with two warm lit windows #E28A3A, thin flock of black birds
crossing the moon, sparse stars, heavy paint texture, + стиль-блок
--ar 16:9
```

### G2 · ЭПОХА «ДВА ОЧАГА», XVII век, запад (2:3)
```
17th century dutch-flemish street at evening, tall narrow brick
houses, one house with warm hearth glow in a leaded window, lens
grinder's workshop with small blank notice nailed to the door,
wooden shutters, cobblestone road ENTERS bottom edge at lower third
and EXITS into depth at center, still canal along the road,
firelight only era, + стиль-блок --ar 2:3
```

### G3 · ЭПОХА «МЕЛКИЙ ШРИФТ», XVIII век, запад (2:3)
```
18th century european square at dusk, large stopped tower clock
(clock face without hands), printing shop wall covered in dense
unreadable tiny posters, double-facade building, small fenced grave
in the middle distance, road ENTERS bottom-left at lower third and
EXITS right edge at lower third, arcade crossing upper third,
+ стиль-блок --ar 2:3
```

### G4 · НЕОН — ворота мёртвого парка (2:3)
```
abandoned amusement park entrance at night, tall gate with broken
unreadable letter sign, dead neon tubes, queue-line barriers snaking
across empty asphalt to nowhere, one working streetlight far away,
humming power line crossing the frame, two-circles graffiti tag on
a wall, ONE dead neon sign glowing faint cinnabar red, + стиль-блок
--ar 2:3
```

### G5 · КРИОСКЛЕП «WD» — интерьер (2:3) · ОСОБЫЙ РЕЖИМ: НОЛЬ ТЕПЛА
```
underground cryogenic vault, single steel sarcophagus with a small
frosted window, hoarfrost covering thick power cables converging
from the ceiling, breath vapor in freezing air, NO warm light at all,
only pale bone-cold glow #D9CFB8 and deep blacks #0D0B0A, one faint
cinnabar #C23B2B indicator lamp as the only color, tiny hooded figure
at the threshold, + стиль-блок БЕЗ слов про warm light --ar 2:3
```

### G6 · НОЧНОЙ — портрет для диалогов (3:4, регистр печати)
```
ink drawing on aged paper, tall gaunt observer figure in tattered
layered robes, crescent moon cradling his bald head like a collar,
open ribcage showing a small night sky with planets inside, one hand
raised letting thin threads of light fall, the other pouring dark
sand, fine etching crosshatch, sepia ink #3A3026 on aged paper
#E8DCC3, tiny cinnabar seal in corner, no background scene, museum
plate composition --ar 3:4
```
(Это ЕДИНСТВЕННЫЙ кадр на бумаге и с крупной фигурой — регистр
«печати»: чернильный оттиск, не сцена.)

## 5. Чек-лист приёмки любого кадра
1. Палитра: тёплое только СВЕЧА, красное только КИНОВАРЬ, белого нет.
2. Тёплых пятен ≤3 (G5 — ноль).
3. Фигура крошечная, силуэтом (кроме G6).
4. Дороги/артерии входят и выходят там, где сказано в промте
   (нижняя треть кромок) — это швы будущей сшивки мира.
5. Никакого читаемого текста и логотипов.
6. Пустоты много, объектов мало.
7. Показал пользователю → принято → upscale → следующий кадр.
