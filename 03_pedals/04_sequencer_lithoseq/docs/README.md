# LITHOSEQ — проектная документация

Пакет дизайн-документов генеративного секвенсора LITHOSEQ: от исходной
оценки концепции до плана бринг-апа стенда. Обзор проекта, статус и сборка
кода — в [`../README.md`](../README.md); код — в [`../lithoseq/`](../lithoseq/README.md).

## Порядок чтения

1. [DESIGN-OPINION.md](DESIGN-OPINION.md) — зачем всё это: оценка концепции,
   историческая линия (АНС, Oramics и др.), развилки архитектуры.
2. [00-ROADMAP.md](00-ROADMAP.md) → [01-REQUIREMENTS.md](01-REQUIREMENTS.md) →
   [02-ARCHITECTURE.md](02-ARCHITECTURE.md) — фазы, требования к стенду v1,
   тракт данных.
3. Профильные спеки: [03-SENSOR-OPTICS.md](03-SENSOR-OPTICS.md),
   [04-PLATE-SPEC.md](04-PLATE-SPEC.md), [05-FIRMWARE-SPEC.md](05-FIRMWARE-SPEC.md),
   [06-CV-IO.md](06-CV-IO.md).
4. Прототип: [07-BOM-PROTO.md](07-BOM-PROTO.md), [08-TEST-PLAN.md](08-TEST-PLAN.md).
5. [DECISIONS.md](DECISIONS.md) — журнал решений D1–D11 (ADR проекта).
6. [TUTORIAL.html](TUTORIAL.html) — иллюстрированное полевое руководство
   «от настольного стенда к модулю Eurorack»; сводит пакет в один маршрут.

## Содержимое

| Файл | Что это | Статус (по 00-ROADMAP) |
|---|---|---|
| [DESIGN-OPINION.md](DESIGN-OPINION.md) | Исходная оценка концепции и развилок (развёртка vs статическая матрица, один или два сенсорных канала, метрики и маппинг, механика) | готов |
| [00-ROADMAP.md](00-ROADMAP.md) | Состав документации и фазы 0–5 с текущим статусом | ведётся |
| [01-REQUIREMENTS.md](01-REQUIREMENTS.md) | Требования к стенду v1 (F1–F15, N1–N4), вне scope, корпус образцов | готов, ревью |
| [02-ARCHITECTURE.md](02-ARCHITECTURE.md) | Блок-схема, тракт данных, частоты обновления, выбор MCU | готов, ревью |
| [03-SENSOR-OPTICS.md](03-SENSOR-OPTICS.md) | Оптический канал: камера, подсветка TRANS / REFLECT-D / REFLECT-4, калибровка, ROI | готов, ревью |
| [04-PLATE-SPEC.md](04-PLATE-SPEC.md) | Пластина образца: сэндвич из стёкол, кинематическая регистрация, dual-ready, эталонные пластины | готов, ревью |
| [05-FIRMWARE-SPEC.md](05-FIRMWARE-SPEC.md) | Прошивка: слои, пайплайн кадра, метрики, плейхед, маппинг и пресеты, протокол USB CDC | готов, ревью |
| [06-CV-IO.md](06-CV-IO.md) | CV/gate выходы стенда (фаза 3), калибровка 1V/oct | готов, ревью |
| [07-BOM-PROTO.md](07-BOM-PROTO.md) | Закупка для стенда фаз 1–3 (~$120–140 электроника+оптика) | готов, ревью |
| [08-TEST-PLAN.md](08-TEST-PLAN.md) | Контрольные точки фаз 1–3 и регрессия, включая музыкальную оценку | готов, ревью |
| [DECISIONS.md](DECISIONS.md) | Журнал решений проекта D1–D11 (D4, D5 — ещё предположения) | ведётся |
| [TUTORIAL.html](TUTORIAL.html) | Иллюстрированный туториал сборки (HTML, открывается в браузере, без внешних зависимостей) | 2026-07-18 |

`DECISIONS.md` здесь — внутренний журнал проекта LITHOSEQ (D1–D11). Он не
совпадает с серийной цепочкой решений SYSTEM SUICIDE
([`../../00_series/decisions/`](../../00_series/decisions/)).

Пути вида `lithoseq/…` и `docs/…` внутри документов отсчитываются от папки
педали [`04_sequencer_lithoseq/`](../README.md). Папка `docs/lab/` для
журнала испытаний (08-TEST-PLAN) пока не создана — испытаний на железе ещё
не было.

## Происхождение

Ветка `origin/claude/eurorack-sequencer-design-3wu8wb`, путь
`docs/eurorack-sequencer/`, снапшот `72671ad` (2026-07-18). Подробности и
сравнение с более ранними копиями — в [`../README.md`](../README.md#происхождение).
