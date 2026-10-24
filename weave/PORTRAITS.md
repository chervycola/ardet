# ПОРТРЕТЫ ДЛЯ ДИАЛОГОВ · задание
статус: картины пишет автор (23.10); игра готова их принять · v1

Канон: «крупные лица запрещены — кроме оттисков-портретов на бумаге» (ART_BIBLE,
правила кадра), «диалог — протокол» (§01). Портрет — оттиск рядом с протоколом беседы.
Описания фигур — ART_BIBLE §05 и weave/FIGURES.md; новое помечено «нов.».

## Что нужно — шесть картин

| файл | кто | где говорит |
|---|---|---|
| `jester.png` | Шут | у жертвенного костра |
| `sol.png` | Sol, Летний | его место в городке |
| `nocturnal.png` | Лунный | на мосту, в час луны |
| `elder.png` | Старец — и Дежурный криосклепа | палатка; каптёрка в изнанке |
| `machinist.png` | машинист | кабина ржавого поезда |
| `dumpster.png` | мусорка — её огонь | у трассы |

Старец и Дежурный — одна фигура в труппе (DRAMATURGY, «Труппа»), портрет у них общий.
Кот, мох и Архивариус в описи картин есть, но в разговорах не участвуют — не нужны.

## Как сдать

- **Куда:** `assets/portraits/<файл>` в корне репозитория (рядом с `assets/music`).
  Можно просто прислать картинки мне в чат — назову, обрежу, проверю по канону и
  положу сам.
- **Формат:** вертикаль 4:5, лучше 1024×1280 (не меньше 640×800); PNG, JPG или WebP —
  в игру ляжет PNG.
- **Как видно в игре:** рамка 168×210 точек в браузере, 72×90 на телефоне. Фигура
  должна читаться крошечной: один ясный силуэт, голова и плечи в верхних трёх пятых,
  фон пустой и тёмный. Мелкие подробности пропадут — главное держит силуэт.
- Картина появляется сама, как только файл лежит на месте. Пока его нет, рамки нет
  совсем (прежде висел пустой тёмный прямоугольник).

## Правила кадра (из канона)

- Краски: ночь `#0D0B0A`, кость `#D9CFB8`, пепел `#8A8D8F`, мгла `#3D4A3A`, свеча
  `#E28A3A`, киноварь `#C23B2B`. Золота нет: позолоту пишут свечой и костью.
- Тёплых пятен — не больше трёх, обычно одно-два; у Лунного — ни одного.
- Огонь — сплошными языками, не растром («тепло не растрируется»).
- Нельзя: неон и глянец, чистый вектор, скругления, пастель, карикатура; читаемые
  буквы, подписи, логотипы — надписи ставит игра.
- Картинка серьёзна. Смешное в ardet — от соседства, не от рисунка.

**Общий хвост промта** (EN): `etched portrait print, night etching, bone-white ink
hatching on near-black ground, Gustave Doré density, rotaprint impression, heavy paper
grain, slightly misregistered cinnabar second ink, solemn, waist-up, the figure fills
the frame, empty dark background, vertical 4:5`

**Чего не надо** (negative): `text, letters, words, signature, watermark, logo, neon,
glossy, 3D render, vector, flat illustration, cartoon, caricature, anime, pastel,
metallic gold, blue, purple, saturated green`

## Промты по фигурам

**Шут** (`jester.png`) — ART_BIBLE §05, FIGURES. Тепло: нимб и отсвет костра.
- EN: battle jester beside a sacrificial bonfire, white face, red lips fixed in a smile
  as a form, a small cross set in the left eye socket, three-horned cap with bells,
  harlequin diamond doublet, burning halo — a ring of cinnabar with candle-flame
  tongues, a dagger held point-down, bonfire glow from below, crimson on void
- RU: боевой шут у жертвенного костра; лицо белое, губы красные — улыбка как форма; в
  левой глазнице крест; колпак с тремя рогами и бубенцами, камзол ромбами арлекина;
  горящий нимб — кольцо киновари с язычками свечой; кинжал остриём вниз; снизу —
  отсвет костра; багрянец на чёрном

**Sol** (`sol.png`) — ART_BIBLE §05, FIGURES. Является в красный полдень: фон — ровная
киноварь без теней.
- EN: anthropomorphic sun god, a disc with fourteen rays behind a stern grotesque
  solemn face — heavy eyelids, straight mouth with the corners down, frozen drips; a
  wilting wreath of wheat ears; a mantle turning from cracked gilding to dark wood to
  ash at the hem, the gilding painted in candle-orange and bone, not metallic; a
  sunflower clasp with a skull at its heart; ribs through two tears; red noon without
  shadows, flat cinnabar ground
- RU: антропоморфное солнце: диск с четырнадцатью лучами за строгим гротескным лицом —
  тяжёлые веки, прямой рот уголками вниз, застывшие потёки; увядающий венок колосьев;
  мантия — золото через дерево к тлену (позолота свечой и костью, не металлом);
  застёжка-подсолнух с черепом в сердцевине; в двух прорехах рёбра; красный полдень
  без теней, фон — ровная киноварь

**Лунный** (`nocturnal.png`) — ART_BIBLE §05, FIGURES. Тепла нет вовсе.
- EN: lunar puppeteer, a crescent of darkened silver instead of a head with a face with
  closed eyes in its curve, a cloak like a starfield with a four-star constellation on
  the chest, silver threads rising from the raised fingers into the dark, black sand
  pouring from the open lowered palm, cold moonlight, no warm light at all
- RU: лунный кукловод: вместо головы серп потемневшего серебра, в изгибе — лицо с
  закрытыми глазами; плащ — звёздное поле, на груди созвездие из четырёх; из пальцев
  поднятой руки — серебряные нити вверх, в темноту; из раскрытой опущенной ладони
  сыплется чёрный песок; холодный лунный свет, тёплого нет

**Старец и Дежурный** (`elder.png`) — FIGURES, weave/UNDERGROUND.md. Тепло: свеча снизу.
Одна картина на двоих: подходит и к палатке, и к каптёрке у криосклепа.
- EN: old hooded scribe, the hood hides the face completely — only darkness inside with
  the faintest suggestion of eyes; writing in a heavy ledger on his knees, the line
  still growing; stacks of books of different ages beside him — stone, clay, scroll,
  leather, paper; a single candle-warm light from below
- RU: старый писарь в капюшоне: лицо закрыто целиком, под капюшоном тьма, в ней едва
  будто глаза; пишет в тяжёлой книге на коленях — строка растёт; рядом стопки книг
  разного века — камень, глина, свиток, кожа, бумага; один тёплый свет снизу, от свечи

**Дежурный криосклепа — роль Старца** (`watchman.png`, по желанию; нов. 24.10). Тот же
актёр, та же тьма под капюшоном — другой реквизит: каптёрка вместо палатки. Пока
файла нет, Дежурный говорит с портретом Старца (`assets/manifest.js`); примем
отдельный — переключу одной строкой. Тепло: печка снизу, вне кадра.
- EN: the watchman of a frozen vault: a tall hooded figure in a long dark robe, the hood
  hides the face completely, only darkness inside with the faintest suggestion of eyes;
  he holds a faceted glass of hot water in both hands, a thin thread of steam rising from
  it; warm light from below, from the open door of a small pot-belly stove out of frame;
  behind him only the dark wall of a cable tunnel with a few cables on brackets and a
  quilted work jacket hanging on a nail at the edge; a few frost crystals at the far edge
  of the frame, the cold he guards; patient, without surprise, as if he expected you
  exactly now
- RU: дежурный криосклепа: высокая фигура в капюшоне и длинной тёмной ризе, лицо закрыто
  целиком, во тьме едва будто глаза; в обеих руках гранёный стакан с кипятком, над ним
  нитка пара; тёплый свет снизу — от открытой дверцы буржуйки вне кадра; за спиной
  только тёмная стена коллектора, кабели на кронштейнах, у края — ватник на гвозде; у
  дальнего края — несколько игл инея: холод, который он сторожит; ждёт без удивления,
  будто по графику ждал именно сейчас

**Машинист** (`machinist.png`) — осмотр поезда, разговор, записка l78. Со спины — по
строке разговора «Он не оборачивается» (поза — нов.). Свет пепельный, без тепла.
- EN: an old locomotive engineer seen from behind in the cab of a rusted steam
  locomotive lying askew, he does not turn around; a worn engineer's cap, shoulders,
  one hand on the brake lever; grass outside the tilted cab window; a thin thread of
  steam; dim ash-grey light, no warm light
- RU: старый машинист со спины, в кабине ржавого паровоза набекрень; не оборачивается;
  потёртая фуражка, плечи, рука на тормозном рычаге; в косом окне кабины — трава;
  тонкая струйка пара; тусклый пепельный свет, без тепла

**Мусорка** (`dumpster.png`) — FIGURES, третий десяток: демон — не фигура над баком,
а сам огонь; говорит мусорка. Трафарет SYSTEM SUICIDE ставит игра — букв не надо.
- EN: a burning dumpster with its lid thrown open and the rim glowing, flames as solid
  flat tongues, never dithered, and in the fire the hint of eye sockets and a slit of a
  mouth — the fire itself is the demon; dark ground, smoke
- RU: горящая мусорка с откинутой крышкой, раскалённый край; огонь сплошными языками,
  не растром; в пламени проступают глазницы и щель рта — демон и есть огонь; тёмная
  земля, дым

## Проверка перед сдачей

1. Уменьшить до 168×210: читается ли фигура?
2. Тёплых пятен — не больше трёх (у Лунного — ноль)?
3. Нет ли букв, подписи, водяного знака?
4. Краски — из шести канона; нет ли неона, глянца, металла?
