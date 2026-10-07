# ARDET · ОСНОВНОЙ ПРОМТ ПРОЕКТА (Reve)
### база для сборки всей иллюстрации: заглавный · персонаж · город · пасхалки

Источник канона — ветка `claude/philosophy-architecture-update-oDemg`:
`weave/STYLE_LOCK.md` (стиль + анти-слоп + регистр Бакши),
`src/assets/NEUROSTYLE_ROTAPRINT.md` (растровый регистр печати),
`weave/SYMBOL_SHEET.md` и `weave/MOTIFS.md` (фонд пасхалок и мотивов).

Промт ниже — ДНК проекта: кладётся один раз в описание проекта, дальше
к нему дописывается только сюжет кадра (хуки — в конце файла).

## Основной промт — RU

> ARDET — один иллюстрированный мир. Каждое изображение здесь — страница
> одного и того же разорённого архива.
>
> МАТЕРИАЛ: очень тёмная винтажная гравюра-меццотинта, оттиск со
> состаренной печатной пластины — видимые царапины, пятна краски,
> неровный прокат, плотное зерно плёнки. Никакого цифрового глянца, 3D
> и чистых векторных линий.
>
> ТОН: глубокая плоская чернота держит кадр. Свет — КОСТЬ #D9CFB8,
> никогда не чисто белый. Полутон — ПЕПЕЛ #8A8D8F. Огромное пустое
> пространство: кадр больше дышит, чем показывает.
>
> ЦВЕТ: мир монохромный, кроме огня и луны. КИНОВАРЬ #C23B2B — кровавая
> луна с грубыми потёками и кольцевыми мазками, как печатный брак; это
> печать мира. БАГРОВЫЙ #6b0f1a — для тяжёлого красного. От одного до
> трёх крошечных ЯНТАРНЫХ #E28A3A тёплых пятен на кадр (окно, щель
> двери, уголёк) — больше ничто не тёплое. Ни яркого зелёного, ни синего
> оттенка, ни насыщенных цветов.
>
> ГЛУБИНА (во всех экстерьерах): 3–4 плана в духе рисованных задников
> 1977 года — огромное градиентное небо с тусклым диском в верхней трети
> или половине кадра, дальний силуэтный план, тающий в дымке, средний
> план, где что-то живёт (караван, руины, дым), тёмный передний
> силуэтный план поверх низа (травы, камни). По горизонту — тонкая
> киноварная кромка света. Действие сжато в узкую полосу, небо владеет
> кадром.
>
> ОБИТАТЕЛИ: крошечный одинокий путник в капюшоне для масштаба, всегда
> маленький. Силуэт чёрного кота где-нибудь, часто там, где его не ждут.
> Птицы — только на улице и только 3–5 вразнобой либо одна, сидящая на
> краю кадра; никаких стай-галочек. В интерьерах вместо птиц — крупные
> бледные мотыльки в столбе света.
>
> ВЕЩИ: всё лежит так, будто забыто, а не выложено на витрину. Вещь
> здесь становится документом: бирки, штампы, ведомости, номерные
> ярлыки, краска поверх старой краски, табличка поверх таблички.
>
> ФОРМАТ: во весь кадр, без рамки, без бумажных полей, без подписи
> художника, без читаемого текста и букв.

## Основной промт — EN (то, что идёт в Reve)

> ARDET — a single illustrated world. Every image is one page of the same
> ruined archive.
>
> MEDIUM: very dark vintage etching and mezzotint pulled from an aged
> printing plate — visible scratches, ink stains, uneven inking, heavy
> film grain. Never digital gloss, never 3D, never clean vector lines.
>
> VALUE: deep flat blacks dominate the frame. Light is BONE #D9CFB8,
> never pure white. Halftones are ASH GREY #8A8D8F. Vast negative space;
> the image breathes more than it shows.
>
> COLOR: the world is monochrome except for fire and the moon. CINNABAR
> #C23B2B — a blood-red moon with rough drips and ring-shaped brush marks
> like a printing fault; it is the seal of this world. DEEP CRIMSON
> #6b0f1a for heavier reds. One to three tiny AMBER #E28A3A warm lights
> per frame (a window, a door crack, an ember) — nothing else is warm.
> No bright green, no blue tint, no saturated colors.
>
> DEPTH (all exteriors): 3–4 layers in the manner of 1977 hand-painted
> animation backgrounds — a vast gradient sky holding a dim disc in the
> upper third to half, a far silhouette layer fading into haze, a middle
> layer where something lives (a caravan, ruins, smoke), a dark foreground
> silhouette layer over the bottom (grasses, stones). A thin cinnabar
> rim-light along the horizon. Action is compressed into a narrow band;
> the sky owns the frame.
>
> INHABITANTS: a tiny lone hooded traveller for scale, always small. A
> black cat silhouette somewhere, often where it does not belong. Birds
> outdoors only, and only 3–5 scattered or a single one sitting on the
> edge of the frame — never a flock of checkmarks. Indoors, large pale
> moths in a shaft of light instead of birds.
>
> OBJECTS: everything lies as if forgotten, never arranged for display.
> A thing becomes a document here: tags, stamps, ledgers, numbered
> labels, paint over older paint, a sign nailed over a sign.
>
> FORMAT: full-bleed, no frame, no paper border, no artist signature,
> no readable text or letters anywhere.

## Анти-слоп (негатив проекта)

Датасетные красивости — брак, даже если «получилось красиво». Признак:
деталь лежит на первой странице пинтереста по запросу dark academia /
gothic.

> no glasses resting on an open book, no flock of checkmark-birds by the
> moon, no candelabra with painterly wax drips, no cobweb in the corner,
> no violin, no globe by the window, nothing arranged neatly for display,
> no bright green, no blue tint, no saturated colors, no neon, no lens
> flare, no text, no letters, no signature, no frame, no border

## Хуки по разделам (дописываются к ДНК)

**ЗАГЛАВНЫЙ.** `+ Title composition: the whole frame built from concentric
circles radiating from the center of the moon — dense rings on the disc
itself, a vast halo of rings spreading across the sky, and the horizon as
the outermost ring of the same family, sagging at the center and sweeping
up toward the moon at both edges like a wide-angle lens. A tiny town
silhouette with one steeple at the bottom. Top third left empty.`

**ПЕРСОНАЖ.** `+ Single figure, full height, almost empty background with
only a thin wasteland horizon. The figure holds the frame. Two arms only
— multiple arms belong to the Jester alone. Hierarchic icon scale applies
in scenes, not here: no second figure in a portrait.`

**ГОРОД.** `+ Exterior of a small timeless town at long evening, the full
3–4 layer depth, roads entering and exiting the frame, open gates
overgrown with grass, a bonfire with a bull skull on a pole, a stone
well, a dead street lantern, moss between cobblestones. Exactly three
warm spots in the frame, no more.`

**ПАСХАЛКИ.** Предмет-метонимия: несёт мем без подписи, одна
деталь-удар, лежит как забытый. `+ Close study of a single object in the
same world, shot like evidence attached to a case file: the object
slightly off-center on a worn surface, one amber light raking across it,
everything else near-black. No hands, no people.`
Фонд — `weave/SYMBOL_SHEET.md`: кофейник за решёткой с замком; нора, из
неё угол белой перчатки; чаша подо льдом с начищенным именем; пустой
постамент и волны воздуха; пюпитр с одной свечой и снегом; тетрадь с
воткнутым гусиным пером; табличка поверх таблички с отогнутым краем;
циферблат без стрелок; кусок янтаря и живая мошка над ним; окошко кассы
с бесконечной лентой билетов; ящик с углом конверта в щели.

## Расхождение, требующее решения автора

`STYLE_LOCK v1` запрещает рамку (`full-bleed, no frame, no paper
border`). Локнутые 26.07 портреты в `weave/characters/` (Машинист,
Мусорка-демон, Шут) сделаны С двойной красно-охристой рамкой и по новому
канону вне стиля. Либо перегенерить их без рамки, либо сознательно
развести два регистра: мир — full-bleed, «приложенные к делу» оттиски —
в рамке (это согласуется с растровым регистром из
`NEUROSTYLE_ROTAPRINT.md`). Решение за автором.
