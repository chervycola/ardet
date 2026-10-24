# Генераторы карточек

Скрипты на Node.js, без внешних зависимостей (только `fs`). Каждый собирает
SVG одной серии и записывает его в `../renders/<серия>/`, перезаписывая
существующие файлы. Тексты, даты и имена правятся прямо в скрипте.

```bash
# из любой папки; путь вывода считается от расположения скрипта
node tools/gen_setka.js
```

Нужен Node.js 18 или новее. PNG скрипты не делают: после генерации SVG
рендерится отдельно (например, headless Chromium — команда в
[`../README.md`](../README.md)). Логотипы и фото подключаются в SVG ссылками
относительно папки серии (`mono/*.png`, `ravzar-photo.png`), поэтому
структуру `renders/` менять нельзя.

| Скрипт | Что пишет | Серия |
|---|---|---|
| [`gen_afisha_tg.js`](gen_afisha_tg.js) | `renders/afisha/afisha-tg-sostav.svg` | ТГ-афиша состава |
| [`gen_programma.js`](gen_programma.js) | `renders/afisha/programma-tg.svg` | Программа одним листом |
| [`gen_setka.js`](gen_setka.js) | `renders/afisha/setka-a3.svg` | Полная сетка форума A3 |
| [`gen_setka_post.js`](gen_setka_post.js) | `renders/setka-post/sp-01…04.svg` | Пост о полной сетке |
| [`gen_insta_sostav.js`](gen_insta_sostav.js) | `renders/insta/ig-01…06.svg`, `ig-story.svg` | Instagram «Состав форума» |
| [`gen_insta_mk.js`](gen_insta_mk.js) | `renders/insta-mk/igmk-01…06.svg`, `igmk-story.svg` | Instagram по мастер-классам |
| [`gen_mk_post.js`](gen_mk_post.js) | `renders/mk-post/mkp-01…04.svg` | Общий пост о мастерских |
| [`gen_prize_cards.js`](gen_prize_cards.js) | `renders/prize/prize-01…04.svg` | Призовая программа |
| [`gen_ravzar_card.js`](gen_ravzar_card.js) | `renders/wave5/ravzar-01.svg` | Анонс Ravzar patch.Init() |
| [`gen_soyuz_card.js`](gen_soyuz_card.js) | `renders/wave5/soyuz-01.svg` | Анонс микрофонов СОЮЗ (общая версия бренда, без фото, с промокодом) |
| [`gen_hour_card.js`](gen_hour_card.js) | `renders/final/hour-01.svg` | «Через час начинаем» |
| [`gen_certificate.js`](gen_certificate.js) | `renders/cert/certificate.svg`, `certificate-vert.svg` | Сертификат A4, горизонтальный и вертикальный |
| [`gen_certificate_variants.js`](gen_certificate_variants.js) | `renders/cert/certificate-b.svg`, `certificate-c.svg` | Сертификат: помпезный и советский варианты |
| [`gen_certificate_d.js`](gen_certificate_d.js) | `renders/cert/certificate-d.svg` | Сертификат-формуляр в стиле техпаспорта |
| [`gen_certificate_e.js`](gen_certificate_e.js) | `renders/cert/certificate-e.svg` | Сертификат «ночной осциллограф» |
| [`gen_photos_post.js`](gen_photos_post.js) | `renders/photos-post/fp-tg-01…03.svg`, `fp-ig-01…03.svg` | Фотоотчёт: заглавные карточки |

Статус: при сборке репозитория все 16 скриптов запущены на копии (Node 22) —
результат байт-в-байт совпал с SVG в `renders/`. Скрипты появились в ветке с
13.09.2026; более ранние серии (волны 1–4, «Живая программа», билеты, МК,
лекторий) делались без сохранённых генераторов.

Происхождение: ветка `origin/claude/discret-visual-branding-kppz1d`, снапшот
`98db116` (2026-09-27).
