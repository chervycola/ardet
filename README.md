# Ardet Wasteland

Пиксельная игра о горящем городе. Модульная версия: esbuild-сборка из `src/`, тесты, контент-базы (диалоги, лор, терминал, философия P1/P2).

## Сборка и запуск

```bash
npm install
node build.js        # → build/ardet.html + build/index.html
npm test             # smoke + logic + systems + content + effects + ulitsa
```

Готовый играбельный артефакт закоммичен: `build/index.html`.

## Структура

```
├── src/             — исходники: core, render, world, content, ui, audio, assets
├── test/            — 6 тест-сьютов
├── build.js         — esbuild-сборка (src → build/ardet.html)
└── archive/         — монолитный ardet_wasteland.html (апрель 2026) — предшественник модульной версии
```

## Происхождение и живые ветки

Эта ветка собрана из снапшота `claude/philosophy-architecture-update-oDemg` (2026-07-05, commit `40ae900`). Параллельные линии разработки:

- `claude/philosophy-architecture-update-oDemg` — архитектура, world map, гейты, ассеты.
- `claude/improve-writing-style-ayW6n` — стилевые проходы по текстам, ОБРАЗ-блоки, achievements.

Соседние проекты монорепо — на ветках **SS** (синт-серия SYSTEM SUICIDE + сайт + секвенсор) и **Баклажания** (legal).
