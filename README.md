# ardet

Монорепозиторий трёх связанных проектов: игра **Ardet Wasteland**, серия модулей физического синтеза **SYSTEM SUICIDE**, и их спутники. Эта ветка — консолидированное дерево: актуальные версии каждого проекта собраны из рабочих веток в одну структуру.

## Проектные ветки

Каждый проект выделен в собственную ветку (содержимое распределено из этого дерева):

| Ветка | Содержимое |
|-------|-----------|
| **`Ardet`** | Игра в корне ветки (`src/` + `build.js` + тесты) + `archive/` с монолитом |
| **`SS`** | SYSTEM SUICIDE: `synth/` + `site/` + `sequencer/` |
| **`Баклажания`** | Legal-документы в корне ветки (privacy policy, consent) |

## Карта репозитория

| Директория | Что | Живая ветка разработки |
|------------|-----|------------------------|
| **`game/`** | Игра Ardet Wasteland — модульная версия (esbuild, `src/`, тесты). Сборка: `node build.js` → `build/ardet.html` | `claude/philosophy-architecture-update-oDemg`, `claude/improve-writing-style-ayW6n` |
| **`synth/`** | SYSTEM SUICIDE — 9-модульная серия физического синтеза: канон-бриф, спеки Last Night/Last Day, decisions, аудит, прототипирование | эта ветка (canonical) |
| **`synth/is_my/`** | Модуль Is My: MOSFET-shaper + пилотный пульт DJI C5 — концепт, схемотехника, прошивки, панели | `claude/jolly-gates-KxAP2` |
| **`site/`** | Маркетинг-сайт system-suicide (Vite + React + TS, bilingual) | `System-suicide` |
| **`sequencer/`** | Генеративный Eurorack-секвенсор (сканирование физического образца — кристалл/пористый материал → CV/gate). Отдельный проект, не входит в 9-модульную серию | `claude/eurorack-sequencer-design-3wu8wb` |
| **`legal/`** | Юридические документы проекта «Баклажания» (privacy policy, consent) | `claude/baklazania-content-review-TZbAM` |
| **`archive/`** | Файлы, которые проект перерос. Хранятся для истории | — |

## Синхронизация с ветками

Директории, помеченные «живой веткой», — это **снапшоты**: активная разработка продолжается на своих ветках, сюда периодически подтягивается актуальное состояние. Дата последней синхронизации и происхождение — в README соответствующей директории.

Прежде чем редактировать `game/`, `site/`, `synth/is_my/`, `sequencer/` здесь — проверь, не уехала ли вперёд живая ветка.

## Быстрый старт по проектам

**Игра**: `cd game && npm install && node build.js` → открыть `build/index.html`. Тесты: `npm test`.

**Сайт**: `cd site && npm install && npm run dev`.

**Synth-доки**: начать с `synth/README.md` (карта документации) и `synth/SYSTEM_SUICIDE.md` (канон-бриф серии). Иллюстрированный гид: `synth/docs/` (сборка PDF/DOCX через pandoc — `./build.sh`).

**Секвенсор**: `sequencer/DESIGN-OPINION.md` → `00-ROADMAP.md`.
