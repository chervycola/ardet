# SYSTEM ☐ — сайт мастерской

Промо- и каталог-сайт для **SYSTEM ☐** — мастерская физического синтеза,
9 модулей Eurorack, ручная сборка, Тбилиси.

Бренд содержит зачёркнутое слово «suicide» — на сайте оно везде заменено
визуальным аналогом (лезвие AmEx в hero, тонкая чёрта `☐`, повторяющиеся
мотивы: верёвка с петлёй, барбэд-вайр, метки tally). Подробнее про
дизайн-токены, секции, компоненты — см. `README.md` (handoff из Claude Design,
на английском).

## Стек

- **Vite 5** + multi-page mode (`index.html` + `module.html`)
- **React 18** + **TypeScript** (strict)
- CSS без препроцессоров (oklch-палитра, токены в `:root`)
- Шрифты: Archivo Black / Archivo Narrow / JetBrains Mono с Google Fonts
- Никаких сторонних UI-библиотек, иконок, аналитики

## Структура

```
system-suicide/
├── index.html              ← главная (один длинный скролл)
├── module.html             ← страница модуля, slug-роутинг ?m=<slug>
├── package.json
├── vite.config.ts
├── tsconfig.json
├── README.md               ← дизайн-handoff (англ., описание дизайн-системы)
├── README.ru.md            ← вы здесь
└── src/
    ├── main.tsx            ← React mount для главной
    ├── module-main.tsx     ← React mount для страницы модуля
    ├── App.tsx             ← корневой компонент главной
    ├── ModuleApp.tsx       ← корневой компонент страницы модуля
    ├── styles.css          ← все стили
    ├── i18n.tsx            ← словарь EN/RU + LangProvider + useT
    ├── data.ts             ← MODULES, CARTRIDGES, PATCHES, PRODUCT_PAGES
    ├── types.ts            ← TS-типы для данных
    ├── sections.tsx        ← секции главной (TopBar, Hero, Catalog, ...)
    ├── module-page.tsx     ← компоненты страницы модуля
    ├── motifs.tsx          ← рейлы, лезвия, метки, SVG-мотивы
    └── anim-metaphors.tsx  ← 10 анимированных SVG-иконок
```

## Запуск

Нужен Node 18+ и npm.

```bash
npm install

npm run dev      # dev-сервер: http://localhost:5173
npm run build    # тип-чек + прод-сборка → dist/
npm run preview  # глянуть прод-сборку локально
```

После `npm run build` в `dist/` лежат `index.html`, `module.html` и `assets/`.
Это статика — можно заливать на любой хостинг как есть.

## Деплой на reg.ru (или любой статик-хостинг)

1. `npm run build`
2. Содержимое `dist/` залить в корень сайта (через FTP/SSH/панель reg.ru)
3. Оба `.html` должны лежать на одном уровне — относительные ссылки между
   ними (`module.html?m=...`) тогда работают
4. Если хостинг не подставляет `index.html` по корню — добавить редирект
   или `.htaccess` (для Apache)

## Что важно знать

### i18n работает не полностью

Переключатель EN/RU в топбаре есть, словарь `TRANSLATIONS` в `i18n.tsx`
содержит оба языка для всех ключей. Но в коде секций (`sections.tsx`)
`useT()` вызван только в `TopBar`, `Hero`, `CounterStrip`, `SignalChain`.

В `Lexicon`, `Catalog`, `LastNight`, `Patches`, `Manifesto`, `Footer`
строки захардкожены на английском, хотя ru-переводы готовы. Так оставлено
после миграции из прототипа Claude Design — то же поведение, что было.

Чтобы дотянуть RU-режим: пройтись по перечисленным секциям и заменить
английские строки на `t('ключ')` (ключи уже есть в `TRANSLATIONS`).

### Placeholder-ссылки

В футере и в нескольких секциях `href="#"` стоит как заглушка. Особенно:

- **Crisis lines · global** — README дизайна явно требует заменить на
  реальную ссылку (`https://findahelpline.com` или аналог) перед публичным
  деплоем. Учитывая тематику бренда — это не опционально.
- Instagram / Bandcamp / Reddit · r/modular — заглушки
- Schematic PDF / Schematics / Service / Studio visits / Live demos / Press
  / Lookbook — заглушки

### Tweaks panel удалён

В исходном экспорте из Claude Design была плавающая панель в правом-нижнем
углу с переключателями (тип hero-иконки, рейлы, цвет акцента). Это dev-helper
самого Claude Design, не для прод. При миграции вырезан, дефолты захардкожены
в `App.tsx` / `ModuleApp.tsx`:

- `<Rails left="system" right="rope-anim" enabled />`
- `<Hero icon="amex" />`
- accent-цвет берётся из CSS (`--accent` в `:root`)

Если когда-нибудь нужно поменять — править эти места + `--accent` в
`styles.css`.

### AmEx и юридика

Hero-лезвие — оммаж карте AmEx Centurion. README дизайна предупреждает:
если будут юридические претензии, спорные элементы (двойная dumbbell-щель,
вёрстка лот-номера, тип-сетап «YOUR CARD») можно изменить, не теряя сам
razor-мотив. Сейчас все строки оригинальные (свой lot-number,
`PHYSICAL · SYNTHESIS` вокруг медальона, `AX` вместо `AMEX`).

### URL-роутинг модулей

`module.html?m=<slug>` — query-параметр, не path. Слаги в `MODULES`:

```
i-show-you-light · body-blood-and-salt · all-bones-dust · be-careful
fuck-abandoned-sleep · is-my · last-day · and-my · last-night
```

Полностью расписаны только `is-my` и `and-my` (`PRODUCT_PAGES`).
Остальные 7 рендерят CLASSIFIED-заглушку с redaction-полосами.

## Что хотелось бы доделать (TODO)

- [ ] Дотянуть i18n до 100% (перенести хардкод в `t()`)
- [ ] Заменить placeholder-ссылки на реальные (особенно crisis-line)
- [ ] OG-картинка и meta-теги (`og:image`, `og:title`, `description`)
- [ ] Favicon
- [ ] sitemap.xml + robots.txt
- [ ] Заполнить детальные страницы для остальных 7 модулей (или оставить
  CLASSIFIED как часть нарратива — это решение бренда, не техники)
- [ ] Cart [0] в топбаре — пока декорация. Если нужна реальная корзина —
  это отдельный кусок работы (Stripe / Tilda / Lava и т.п.)

## Коммит-конвенция

Без жёсткой схемы. Короткое сообщение, что и зачем. Примеры из истории:

```
Add Claude Design handoff for SYSTEM website
Migrate site to Vite + React + TypeScript
```
