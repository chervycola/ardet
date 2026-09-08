# STYLE LOCK v1 · «КРАСНАЯ ЛУНА»
### зафиксированный генеративный стиль мира · утверждён пользователем

Референсы стиля: пять кадров городка (площадь с костром и черепом,
врата с крестом и красным горизонтом, два колодца, титульная луна
с потёками) — **пользователь: закинуть их в `weave/style-lock/`**.

## Что делает стиль
- очень тёмная винтажная гравюра/меццо-тинта; состаренная печатная
  пластина: царапины, пятна, неровный прокат краски
- чернота доминирует; света — КОСТЬ, полутон — ПЕПЕЛ
- **красная луна КИНОВАРЬЮ — фирменный знак мира**: с грубыми
  потёками и кольцевыми мазками, как печатный брак; птицы строем
  или стаей возле неё
- 1–2 крошечных янтарных тёплых пятна (окно, дверная щель, костёр)
- кот-силуэт; крошечный странник в капюшоне
- красный горизонт как вариант киновари вместо луны

## Канонный стиль-блок (хвост каждого промта)
```
very dark vintage etching-mezzotint, aged printing plate texture
with scratches and ink stains, deep flat blacks dominating the
frame, bone-white #D9CFB8 highlights, ash grey #8A8D8F halftones,
a blood-red moon #C23B2B with rough drips and ring-shaped brush
marks as the only red, one or two tiny amber #E28A3A warm lights,
black birds near the moon, black cat silhouette somewhere, tiny
lone hooded figure for scale, heavy film grain, muted, NO bright
green, no blue tint, no saturated colors, full-bleed image, no
paper border, no frame, no artist signature, no readable text,
vast negative space
```
Вариант без луны: заменить строку луны на
`a faint blood-red #C23B2B glow on the horizon as the only red`.

## Анти-слоп (утверждено после библиотеки)
Датасетные красивости — брак, даже если «получилось красиво».
Признак: деталь находится на первой странице пинтереста по запросу
dark academia / gothic. Чёрный список: очки на открытой книге;
стая птиц-галочек у луны; свеча в канделябре с живописными потёками;
паутина в углу кадра; скрипка/глобус у окна; идеально уложенные
предметы «на витрину». Замена — авторская деталь из фонда пасхалок:
вещь должна лежать так, будто её забыли, а не выложили.
Птицы у луны: только в экстерьерах, редко — 3–5 разрозненных или
ОДНА сидящая на краю кадра; в интерьерах вместо птиц — крупные
бледные мотыльки в столбе света.

Модель: **seedream v5 pro** (первый выбор), GPT Image 2 — самые
тёмные кадры. Приёмка — по скиллу ardet-scene-accept.

## Регистр «Волшебники-1977» (v2 — задники и движок)

Утверждено пользователем: движок и генерации целятся в стиль
и физику «Wizards» Ральфа Бакши (1977) — это лечит плоскость
и одиночество кадра и достижимо нейрогенерацией:

- **многоплановость**: 3–4 слоя — огромное градиентное небо
  с диском (солнце/красная луна), дальний силуэтный план в дымке,
  средний план с жизнью (караван, руины), полоса действия,
  передний силуэтный план (травы, камни) поверх;
- **кадр Бакши**: небо — верхняя треть-половина, действие —
  сжатая полоса; горизонт с кромкой света (рим-лайт киноварью);
- **жизнь на планах**: далёкие фигуры-силуэты в движении, птицы
  у диска (по анти-слоп правилу: 3–5 разрозненных, не стаи-галочки),
  пыль в воздухе, качающиеся травы;
- **физика анимации**: плавучий шаг, наклон в движение, качание —
  ротоскопная тяжесть вместо аркадной резкости;
- палитра — канон без изменений; психоделика Бакши не берётся,
  берётся его воздух и слоистость.

Стиль-блок генераций в регистре (для задников-панорам):
```
1977 hand-painted fantasy animation still, Ralph Bakshi Wizards
style, gouache multi-plane background: vast gradient sky with a
huge dim disc, layered flat silhouette dunes and ruins fading
into haze, rim-lit horizon, tiny dark cel-silhouette hooded
figure for scale, rough paper texture, heavy film grain, muted:
near-black #0D0B0A, bone #D9CFB8, ash grey #8A8D8F, single amber
light #E28A3A, cinnabar #C23B2B only in sky/disc, no neon,
no clean vector lines, no saturated psychedelic colors,
full-bleed, no frame, no text
```
