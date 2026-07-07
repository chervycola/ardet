# Ardet Wasteland — игра

Пиксельная игра о горящем городе. Модульная версия: esbuild-сборка из `src/`, тесты, контент-базы (диалоги, лор, терминал, философия P1/P2).

## Сборка и запуск

```bash
npm install
node build.js        # → build/ardet.html + build/index.html
npm test             # smoke + logic + systems + content + effects + ulitsa
```

## Происхождение

Снапшот ветки **`claude/philosophy-architecture-update-oDemg`** (2026-07-05, commit `40ae900` — ux-pass-1). Живая разработка продолжается на ветках:

- `claude/philosophy-architecture-update-oDemg` — архитектура, world map, гейты, ассеты.
- `claude/improve-writing-style-ayW6n` — стилевые проходы по текстам, ОБРАЗ-блоки, achievements.

Перед редактированием здесь — проверь, не уехали ли эти ветки вперёд.

## История

Исходная версия игры — монолитный `ardet_wasteland.html` (~905 KB, апрель 2026) — перенесена в `../archive/ardet_wasteland_monolith.html`. Модульная версия — её рефакторинг с продолженной разработкой (философия-контент, улица, поезд, погода, перф-фиксы).
