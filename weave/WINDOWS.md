# ОКНА ДИАЛОГА · промты
статус: на генерацию автору (23.10) · v1

Канон: «Система — бумага: меню — бланк, инвентарь — опись, диалог — протокол.
Бумага ложится поверх ночи встык, без перехода, как справка на стол» (ART_BIBLE §01);
макет §06 — «Протокол беседы · Шут · вечер третий · у костра», «пометка на полях:
свидетель от подписи уклонился», «выбранная реплика подчёркнута красным карандашом»;
§07 — «рамка важного — черепа по углам», «скруглений нет нигде», «оттиск всегда чуть
криво». Три окна ниже — три прочтения этого канона; у каждого три промта с разными
акцентами. Выберите окно — и из трёх промтов то, что ближе.

## Что сдать и как игра это возьмёт

Окно диалога в игре — полоса внизу экрана: в браузере во всю ширину и ~260 точек
высотой (примерно 5:1), на телефоне — почти квадрат. Одна картинка на все размеры не
ляжет, поэтому окно собирается из двух файлов:

1. **Рамка** — `assets/ui/dlg-<окно>-frame.png`, квадрат 1024×1024. Узор только по
   краям, полоса шириной ~120 точек; середина — ровная, без рисунка (там будет текст).
   Игра режет рамку на девять частей: углы ставит как есть, края тянет, середину
   заливает. Поэтому углы — самое важное место, а края должны тянуться без шва.
2. **Фактура** — `assets/ui/dlg-<окно>-tile.png`, 512×512, бесшовная (повторяется
   плиткой): бумага или ночь, по которой пойдут буквы. Спокойная, без пятен-событий.

`<окно>` — `protocol`, `etching` или `ember`. Можно прислать мне в чат — обрежу,
проверю шов и краски, положу сам.

Правила кадра для всех: краски канона (ночь `#0D0B0A`, кость `#D9CFB8`, пепел
`#8A8D8F`, мгла `#3D4A3A`, свеча `#E28A3A`, киноварь `#C23B2B`; бумага `#E8DCC3`,
сепия `#3A3026`); тёплое — одно пятно, не больше; огонь — сплошной, не растром; букв
нет нигде — надписи ставит игра (вместо слов — неразборчивые росчерки); скруглений нет.

**Чего не надо** (negative): `readable text, letters, words, numbers, signature,
watermark, logo, neon, glossy, 3D render, vector, flat illustration, rounded corners,
pastel, cartoon, anime, metallic gold, blue, purple, saturated green, people, faces`

---

## Окно 1 · «Протокол беседы» (`protocol`)
Бланк канцелярии на старой бумаге: светлое окно поверх ночи, буквы сепией. Самое
близкое к макету §06.

**1а · акцент — канцелярия: графы, номер, печать**
- EN: `frame for a bureaucratic interview protocol form, aged laid paper, sepia ruled
  margins and a double border line, an empty box for a registration number in the top
  corner, a crooked cinnabar rubber stamp half off the edge in one corner, faint punched
  filing holes on the left edge, the center left blank and flat for text, flat scan,
  no perspective, 1:1`
- RU: рамка бланка «протокол беседы» на старой верже: поля разлинованы сепией, двойная
  рамочная линия, в верхнем углу пустая клетка для номера, в одном углу — кривой
  киноварный штамп, наполовину за краем; слева — дырки дырокола; середина пустая и
  ровная, под текст; плоский скан без перспективы

**1б · акцент — время: износ бумаги**
- EN: `frame of an old yellowed official form, laid paper, foxing spots and a faint coffee
  ring near one corner, soft fold creases crossing the margins, one dog-eared corner,
  frayed edges, sepia border line worn through in places, the center blank and even for
  text, flat scan, 1:1`
- RU: рамка старого пожелтевшего казённого бланка: верже, рыжие пятна времени, бледный
  след от стакана у одного угла, мягкие сгибы через поля, один загнутый угол,
  разлохмаченный край, рамочная линия сепией местами протёрта; середина ровная, под текст

**1в · акцент — рука: пометки на полях**
- EN: `frame of a protocol form with handwritten marginalia, illegible pencil scribbles
  and tick marks in the margins, one line underlined with red pencil, a crossed-out
  illegible word, a small crooked cinnabar seal, sepia ink on aged laid paper, no
  readable letters anywhere, the center blank for text, flat scan, 1:1`
- RU: рамка бланка с пометками на полях: неразборчивые карандашные росчерки и галочки,
  одна строка подчёркнута красным карандашом, неразборчивое зачёркнутое слово, маленькая
  кривая киноварная печать; сепия на старой верже; ни одной читаемой буквы; середина
  пустая, под текст

**Фактура 1** — EN: `seamless tileable texture of aged laid paper, warm bone color,
subtle chain lines and fibers, very even, no stains, no text, flat lighting`

---

## Окно 2 · «Ночной офорт» (`etching`)
Окно как гравюра: чёрное поле, рамка штрихом кости в плотности Доре, черепа по углам
(«рамка важного»). Буквы — костью по ночи; ближе всего к нынешнему тёмному окну.

**2а · акцент — орнамент рамки**
- EN: `ornamental frame in night etching style, bone-white ink hatching on near-black,
  Gustave Doré density, small engraved skulls in the four corners, a thorned vine running
  along the edges, square corners, the center flat black and empty for text, rotaprint
  grain, 1:1`
- RU: орнаментальная рамка ночным офортом: штрих костью по почти чёрному, плотность Доре,
  по углам — маленькие гравированные черепа, по краям вьётся терновая лоза, углы прямые;
  середина ровно-чёрная, пустая, под текст; зерно ротапринта

**2б · акцент — свет как вещество**
- EN: `dark etched frame, bone hatching on black, light as a substance: a single candle-warm
  glow seeping in from the lower left corner and fading along the edge, dust in the beam,
  the rest cold and dark, the center flat black for text, Doré density, 1:1`
- RU: тёмная гравированная рамка, штрих костью по чёрному; свет как вещество: одно
  тёплое свечение свечи сочится из нижнего левого угла и гаснет вдоль края, пыль в луче,
  остальное холодное и тёмное; середина ровно-чёрная, под текст

**2в · акцент — оттиск: печатная фактура**
- EN: `frame printed as a worn rotaprint plate, black ink on dark paper, heavy grain,
  fine scratches, chipped and crumbling edges, a slightly misregistered cinnabar second
  ink offset by a few pixels along the border, square corners, the center flat dark for
  text, 1:1`
- RU: рамка как оттиск со стёртой ротапринтной пластины: чёрная краска по тёмной бумаге,
  тяжёлое зерно, тонкие царапины, выщербленные осыпающиеся края, вторая краска киноварью
  сдвинута на несколько точек вдоль рамки (приводка); углы прямые; середина ровно-тёмная

**Фактура 2** — EN: `seamless tileable near-black etching ground, very fine bone-colored
cross-hatching barely visible, rotaprint grain, even, no motifs, no text`

---

## Окно 3 · «Бумажка у огня» (`ember`)
Записка, поднесённая к огню: светлая бумага с подпалённым краем. Родня бумажке внизу
экрана, которая допечатывается и сгорает; канон огня — сплошной, без растра.

**3а · акцент — тлеющий край**
- EN: `frame of a paper note with one charred edge, a thin line of glowing ember along the
  burnt border drawn as solid flat candle-orange, not dithered, the rest of the paper
  bone-colored and intact, square corners where not burnt, the center blank for text,
  night-black background beyond the paper, 1:1`
- RU: рамка записки с одним обугленным краем: по кромке ожога — тонкая полоска тлеющего
  уголька, сплошной свечой, не растром; остальная бумага цвета кости и цела; середина
  пустая, под текст; за бумагой — ночь

**3б · акцент — пепел и сажа**
- EN: `frame of scorched paper, soot shading creeping in from the edges, small burnt holes
  with black curled rims, a few ash flakes lifting off the border, no flame, cold
  aftermath, bone and sepia with black, the center clean for text, 1:1`
- RU: рамка опалённой бумаги: копоть ползёт с краёв, маленькие прожжённые дыры с
  чёрными загнутыми краями, несколько хлопьев пепла отрываются от кромки; пламени нет —
  холодное «после»; кость и сепия с чёрным; середина чистая, под текст

**3в · акцент — канцелярия и огонь**
- EN: `frame of an official form singed at one corner, the cinnabar rubber stamp in that
  corner half burnt away, the burn line glowing faintly as solid candle-orange, sepia
  ruled margins elsewhere untouched, aged laid paper, the center blank for text, 1:1`
- RU: рамка казённого бланка, подпалённого с одного угла: киноварный штамп в этом углу
  наполовину сгорел, линия ожога слабо тлеет сплошной свечой; в остальном поля
  разлинованы сепией и целы; старая верже; середина пустая, под текст

**Фактура 3** — EN: `seamless tileable texture of bone-colored paper with very faint
smoke tint, fine fibers, even, no burns, no stains, no text`

---

## Проверка перед сдачей
1. Середина рамки ровная — на ней будет текст 20-м кеглем; нет ли там рисунка?
2. Края тянутся без шва (у рамки), фактура повторяется без шва (плиткой)?
3. Тёплое — одно пятно, огонь сплошной?
4. Нет букв, цифр, подписи, водяного знака?
