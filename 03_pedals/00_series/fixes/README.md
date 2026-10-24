# fixes/ — правки после аудита (Last Night v2.1)

Конкретные действия по ошибкам, которые нашёл [`../audit/`](../audit/): что изменить в схеме, что заменить в BOM, как развести PCB, как тестировать первый прототип. Всё относится к reverb-ядру Last Night v2.1. Исходный индекс с фазами IMMEDIATE / SHORT / MEDIUM / LONG и стоимостью правок — [`00_README.md`](00_README.md).

**Статус:** список составлен до Decision 08 и большей частью уже применён или поглощён Decision 08 (так его оценивал прежний README ветки SS). Для ядра v2.1 правки остаются обязательными. Слой cold palette FX и ревизия PCB v3 потребуют отдельного списка правок (см. баннер в `01_last_night_fix_list.md`).

## Содержимое

| Файл | Что это |
|------|---------|
| [`00_README.md`](00_README.md) | Исходный индекс: порядок применения, фазы, стоимость, зависимости |
| [`01_last_night_fix_list.md`](01_last_night_fix_list.md) | 15 правок схемы по фазам IMMEDIATE → LONG |
| [`02_bom_delta.md`](02_bom_delta.md) | Обновлённый BOM с конкретными part numbers |
| [`03_pcb_layout_guide.md`](03_pcb_layout_guide.md) | Правила разводки PCB для минимизации шума |
| [`04_testing_protocol.md`](04_testing_protocol.md) | Протокол валидации первого прототипа |

Применять в порядке 01 → 04.

## Происхождение

- `origin/SS:00_series/fixes/` (`6d20ae1`, 2026-07-07). Содержимое не менялось с `467a5f3` (2026-05-12).
- `01_last_night_fix_list.md`: CONTEXT NOTE по Decision 07 взят из `origin/claude/review-last-day-concept-HWbFa` (`1dcef2a`, 2026-05-12).
- В той же ветке HWbFa в `02_bom_delta.md` и `03_pcb_layout_guide.md` лежат более ранние варианты под панели 16/18/20 HP. Их заменили версии SS под 40 HP, поэтому они не перенесены.
