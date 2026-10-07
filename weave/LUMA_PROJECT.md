# ARDET · ОСНОВНОЙ ПРОМТ ПРОЕКТА (Luma Dream Machine) · вер. 3
### база для сборки всей иллюстрации: заглавный · персонаж · город · пасхалки

Канон — ветка `claude/philosophy-architecture-update-oDemg`:
`weave/STYLE_LOCK.md`, `src/assets/NEUROSTYLE_ROTAPRINT.md`,
`weave/SYMBOL_SHEET.md`, `weave/MOTIFS.md`.

Вер. 2 — после сверки по 10 референсам автора (07.10). Три решения
автора, которые переписали норму:
1. запрет насыщенности снят, но заливка — не везде, а в острых моментах;
2. синий, токсично-зелёный и шоколадный допущены малыми дозами;
3. зерно — по эпохам, его накладывает игра; генерация даёт чистую
   пластину. Вторые печатные краски и прочие эффекты продумываем позже.

---

## Главный принцип, снявший противоречие

**Красный — не акцент и не среда, а вторая печатная краска.** Во всех
референсах он кладётся плашкой отдельным прогоном; разная только площадь.
Поэтому вместо запрета — регулятор:

| покрытие | что красит | когда |
|---|---|---|
| 1–3 % | две точки-индикатора | холодные, мёртвые сцены |
| 5–10 % | диск луны/солнца с потёками, полоса неба | норма мира |
| 20–30 % | одна группа объектов целиком | акцентная сцена |
| 60–90 % | весь воздух кадра залит | **только острые моменты** |

Заливка 60–90 % — расходный приём. Если она в каждом кадре, она не
значит ничего.

---

## Основной промт — RU

> ARDET — один иллюстрированный мир. Каждое изображение здесь — страница
> одного и того же разорённого архива.
>
> МАТЕРИАЛ: это оттиск, а не живопись. Очень тёмная винтажная гравюра,
> линогравюра и меццотинта со состаренной пластины — видимые царапины
> пластины, пятна краски, неровный прокат, просвечивающая бумага. Для
> самых тёмных интерьеров допустим угольный рисунок. Никакого цифрового
> глянца, 3D, чистых векторных линий и фотореализма.
>
> ТОН: глубокая плоская чернота держит конструкцию кадра. Свет — КОСТЬ
> #D9CFB8, никогда не чисто белый. Полутон — ПЕПЕЛ #8A8D8F. Огромное
> пустое пространство.
>
> КРАСКА ПЕРВАЯ, ЧЁРНАЯ: весь рисунок, штриховка и силуэты.
>
> КРАСКА ВТОРАЯ, КРАСНАЯ: ложится плашкой отдельным прогоном, а не
> подкраской. КИНОВАРЬ #C23B2B — на освещённых поверхностях и дисках;
> БАГРОВЫЙ #6b0f1a — воздух и дальние планы. Площадь задаёт сцена: от
> двух точек-индикаторов через диск луны с потёками и одну группу
> объектов, напечатанную целиком красным, до полной заливки воздуха
> кадра. Полная заливка — только для острых моментов.
>
> КРАСКА ТРЕТЬЯ, РЕДКАЯ: не больше одной на кадр и не больше нескольких
> процентов площади. ИНДИГО #1b1464 — вода, лёд, экраны. ТОКСИЧНЫЙ
> ЗЕЛЁНЫЙ #8CC63F — только как свечение: химия, свалка, аварийные лампы.
> ШОКОЛАДНАЯ УМБРА #4A3426 — дерево, кожа, сепия ранних эпох.
> Приглушённый оливково-шалфейный #5A5F4A — трава и мох.
>
> ТЁПЛОЕ: от одного до трёх крошечных ЯНТАРНЫХ #E28A3A огней на кадр —
> окно, щель двери, уголёк. Тепло не растрируется и не растекается.
>
> ГЛУБИНА (во всех экстерьерах): 3–4 плана в духе рисованных задников
> 1977 года — огромное градиентное небо с тусклым диском в верхней трети
> или половине, дальний силуэтный план в дымке, средний план, где
> что-то живёт, тёмный передний силуэтный план поверх низа. По горизонту
> тонкая киноварная кромка света. Действие сжато в узкую полосу.
>
> ОБИТАТЕЛИ: крошечный одинокий путник в капюшоне для масштаба, всегда
> маленький. Силуэт чёрного кота где-нибудь, часто там, где его не ждут.
> Птицы только на улице и только 3–5 вразнобой либо одна на краю кадра;
> никаких стай-галочек. В интерьерах вместо птиц — крупные бледные
> мотыльки в столбе света.
>
> ВЕЩИ: всё лежит так, будто забыто, а не выложено на витрину. Вещь
> становится документом: бирки, штампы, ведомости, номерные ярлыки,
> краска поверх старой краски, табличка поверх таблички.
>
> ЗЕРНО: ровное и умеренное — собственная фактура пластины. Не запекать
> тяжёлый растр, дизеринг и слой царапин: их накладывает игра по эпохе.
>
> ФОРМАТ: мир — во весь кадр, без полей. Процарапанная рамка и бумажные
> поля — только у изображений-документов. Без подписи художника, без
> читаемого текста и букв.

## Полная спецификация — EN (справочник, из которого тянем куски)

> ARDET — a single illustrated world. Every image is one page of the same
> ruined archive.
>
> MEDIUM: a print, not a painting. Very dark vintage etching, linocut and
> mezzotint pulled from an aged plate — visible plate scratches, ink
> stains, uneven inking, the paper showing through. Charcoal drawing is
> allowed for the darkest interiors. Never digital gloss, never 3D, never
> clean vector lines, never photographic rendering.
>
> VALUE: deep flat blacks carry the structure of the frame. Light is BONE
> #D9CFB8, never pure white. Halftones are ASH GREY #8A8D8F. Vast
> negative space.
>
> FIRST INK, BLACK: all drawing, hatching and silhouettes.
>
> SECOND INK, RED: laid down as a flat plate in its own pass, never as a
> tint. CINNABAR #C23B2B on lit surfaces and discs; DEEP CRIMSON #6b0f1a
> for air and far planes. Its coverage is set by the scene: from two
> indicator dots, through a moon disc with drips, through one group of
> objects printed entirely red, to the whole air of the frame flooded.
> Full flooding is reserved for charged moments.
>
> THIRD INK, RARE: at most one per frame and never more than a few
> percent of the area. INDIGO #1b1464 for water, ice and screens. TOXIC
> GREEN #8CC63F only as a glow — chemistry, landfill, emergency lamps.
> CHOCOLATE UMBER #4A3426 for wood, leather and the sepia of early
> epochs. Muted sage #5A5F4A for grass and moss.
>
> WARM: one to three tiny AMBER #E28A3A lights per frame — a window, a
> door crack, an ember. Warmth never dithers and never spreads.
>
> DEPTH (all exteriors): 3–4 layers in the manner of 1977 hand-painted
> animation backgrounds — a vast gradient sky holding a dim disc in the
> upper third to half, a far silhouette layer fading into haze, a middle
> layer where something lives, a dark foreground silhouette layer over
> the bottom. A thin cinnabar rim-light along the horizon. Action is
> compressed into a narrow band; the sky owns the frame.
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
> GRAIN: even and moderate — the plate's own texture only. Do not bake in
> heavy raster, dithering or scratch overlays; those are applied later
> per epoch.
>
> FORMAT: full-bleed for the world. A scratched border with paper margins
> only for images that are documents. No artist signature, no readable
> text or letters anywhere.

---

## Рамка — по регистрам (решение 07.10)

`STYLE_LOCK` требовал full-bleed, но три из пяти лайкнутых автором
кадров — с процарапанной рамкой и полями, и рамка там несущая. Поэтому
не отменяем, а разводим по смыслу:

- **мир** (городок, пустошь, интерьеры, задники) — full-bleed, без
  полей: зритель внутри;
- **оттиск, приложенный к делу** (портреты персонажей, осмотры
  предметов, пасхалки) — процарапанная рамка и бумажные поля: зритель
  смотрит на документ.

Следствие: локнутые 26.07 портреты в `weave/characters/` (Машинист,
Мусорка-демон, Шут) сделаны с рамкой и попадают во второй регистр
законно. Перегенерация не нужна.

## Анти-слоп (негатив проекта)

> no glasses resting on an open book, no flock of checkmark-birds by the
> moon, no candelabra with painterly wax drips, no cobweb in the corner,
> no violin, no globe by the window, nothing arranged neatly for display,
> no neon glow, no lens flare, no text, no letters, no signature

Запрет на насыщенность и на синий/зелёный СНЯТ (07.10) — заменён
дозировкой выше. Признак слопа прежний: деталь с первой страницы
пинтереста по запросу dark academia / gothic.

---

## Что добавляет игра, а не генерация

Фиксируем сейчас, чтобы не запекать это в картинки:

| эффект | кто кладёт | примечание |
|---|---|---|
| зерно по эпохе | движок | ранние эпохи грубее, поздние чище; шкалу продумываем отдельно |
| растр Байера 8×8, 4 краски | движок | регистр печати, `NEUROSTYLE_ROTAPRINT.md` |
| царапины и осыпающиеся края | движок | слой треска, включать вспышками |
| рамка документа | движок или генерация | в документах можно и запечь |
| киноварная печать-штамп в углу | только игра | канон: надписи и штампы ставим сами |
| вторые печатные краски по эпохам | **TODO** | продумываем позже |

Генерация отдаёт чистую пластину: ровное умеренное зерно и всё. Если
запечь тяжёлый растр, эпохальный слой ляжет поверх и кадр замылится.

---

## Хуки по разделам (дописываются к ДНК)

**ЗАГЛАВНЫЙ.** `+ Title composition: the whole frame built from concentric
circles radiating from the center of the moon — dense rings on the disc
itself, a vast halo of rings spreading across the sky, and the horizon as
the outermost ring of the same family, sagging at the center and sweeping
up toward the moon at both edges like a wide-angle lens. A tiny town
silhouette with one steeple at the bottom. Top third left empty. Red
coverage: 10%.`

**ПЕРСОНАЖ.** `+ Single figure, full height, almost empty background with
only a thin wasteland horizon. The figure holds the frame. Two arms only
— multiple arms belong to the Jester alone. No second figure in a
portrait. Document register: scratched border and paper margins.`

**ГОРОД.** `+ Exterior of a small timeless town at long evening, full 3–4
layer depth, roads entering and exiting the frame, open gates overgrown
with grass, a bonfire with a bull skull on a pole, a stone well, a dead
street lantern, moss between cobblestones. Exactly three warm spots.
Red coverage: 5–10%, moon and a band of sky.`

**ПАСХАЛКИ.** `+ Close study of a single object, shot like evidence
attached to a case file: the object slightly off-center on a worn
surface, one amber light raking across it, everything else near-black.
No hands, no people. Document register: scratched border. Red coverage:
1–3%.`
Фонд — `weave/SYMBOL_SHEET.md`: кофейник за решёткой с замком; нора, из
неё угол белой перчатки; чаша подо льдом с начищенным именем; пустой
постамент и волны воздуха; пюпитр с одной свечой и снегом; тетрадь с
воткнутым гусиным пером; табличка поверх таблички с отогнутым краем;
циферблат без стрелок; кусок янтаря и живая мошка над ним; окошко кассы
с бесконечной лентой билетов; ящик с углом конверта в щели.

---

# Адаптация под Luma Dream Machine (вер. 3, 07.10)

Платформа — не Reve. Меняется не канон, а метод работы: Luma (Photon для
картинок, Ray для видео) хуже держит длинную спецификацию в тексте, зато
умеет то, чего у Reve нет, — **style reference, character reference,
кейфреймы и нативный Loop**.

Отсюда главное правило работы: **стиль переносим картинкой, а не текстом.**
Длинная ДНК выше нужна один раз — чтобы выпечь эталонные пластины. Дальше
они кладутся в style reference, а текстовый промт остаётся коротким.

## Порядок сборки

1. **Выпечь 2–3 эталона** полной спецификацией (она выше): один
   экстерьер мира full-bleed, один документ в рамке, один тёмный
   интерьер углём. Отобрать лучшие вручную.
2. **Завести доски** (Boards) по разделам: `заглавный`, `персонажи`,
   `город`, `пасхалки`. Доска = раздел, не свалка.
3. На каждой доске держать **эталон раздела как style reference**;
   персонажей вести через **character reference** — одна картинка
   даёт сквозную узнаваемость.
4. В текст писать **только сюжет и отклонения** от эталона.

## Короткое ядро промта (для Photon, ~60 слов)

Это то, что реально набирается руками в каждом кадре поверх референса:

> Dark vintage print, etching and linocut pulled from an aged plate,
> paper showing through. Deep flat blacks, bone #D9CFB8 light, ash grey
> halftones, vast negative space. Red is a second ink laid as a flat
> plate — cinnabar #C23B2B. One or two tiny amber #E28A3A lights.
> Moderate even grain. No text, no letters, no signature.

Дальше дописывается сюжет и покрытие красным: `red coverage: 10%`.

**Важно:** Photon силён вставкой текста в изображение — для нас это риск,
а не плюс. `no text, no letters` держать в каждом промте, не надеясь на
настройки проекта.

## Видео: что это даёт пляске смерти

У Luma есть **нативный Loop** — шов закрывает платформа, а не монтаж. Это
снимает оговорку из прошлой волны («ни одна сетка не гарантирует шов»).
Плюс **кейфреймы**: можно задать первый и последний кадр.

Рабочая схема для 12-секундного хоровода:
- выпечь в Photon один кадр-пластину с замершей змейкой — он станет
  и первым, и последним кадром;
- поставить его в оба кейфрейма, включить Loop;
- движение (ход змейки, барабан 123 BPM, секира, прыжок) описать
  текстом между кейфреймами;
- если потолок длительности ниже 12 с — собрать через extend, стык
  ставить на 6.0 с, когда голова уже села на шею и все идут ровно.

Арифметика долей остаётся в силе: при 123 BPM в 12 с помещается 24.6
удара. Для честного лупа — 11.71 с (24 удара), 12.20 с (25) либо 120 BPM
ровно на 24.

## Что НЕ переносится из плана под Reve

- Негатив-промт отдельным полем — у Luma его нет как отдельного входа;
  запреты уходят в тело промта («no …»), и работают слабее. Поэтому
  анти-слоп держим в первую очередь **отбором**, а не запретом.
- Длинный список хуков в описании проекта. Хуки остаются в этом файле
  как шпаргалка оператора, а в интерфейс идёт короткое ядро.
