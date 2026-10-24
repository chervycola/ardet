# audit/ — критический аудит серии SYSTEM SUICIDE

Инженерный и архитектурный аудит 9-модульной серии, написанный в апреле 2026, до закупок и первой PCB. Основное внимание — ревербератору Last Night v2.1 и его паре Last Day. Задача аудита — найти блокирующие противоречия, необоснованные допущения и скрытые риски.

**Статус: исторический документ.** Содержимое не переписывается. Баннеры в начале файлов указывают, что устарело после более поздних решений: Is My/And My — Decisions 12/13, Day/Night комбайны — Decisions 06/07/08, ISYL — Decision 14. Исходная карта, легенда серьёзности (BLOCKER / MAJOR / MINOR / QUESTION) и порядок чтения — в [`00_README.md`](00_README.md).

## Содержимое

| Файл | Тема |
|------|------|
| [`00_README.md`](00_README.md) | Исходная карта аудита, легенда серьёзности, порядок чтения |
| [`01_executive_summary.md`](01_executive_summary.md) | Вердикт и топ-10 kill-рисков по модулям |
| [`02_system_architecture.md`](02_system_architecture.md) | Системная согласованность: роли, цепь, HP-бюджет, сценарии |
| [`10_last_night_engineering.md`](10_last_night_engineering.md) | Last Night v2.1: разбор схемы по 15 блокам |
| [`11_last_night_acoustic.md`](11_last_night_acoustic.md) | Last Night: акустика пластины, RT60, датчики |
| [`12_last_night_open_questions.md`](12_last_night_open_questions.md) | Last Night: ответы на открытые вопросы брифов v2.0/v2.1 |
| [`13_schematic_cross_reference.md`](13_schematic_cross_reference.md) | Сверка аудита с логическим каркасом схемы v2.0 |
| [`20_last_day_engineering.md`](20_last_day_engineering.md) | Last Day: solar amp, oil-can delay, resonant EQ |
| [`21_last_day_acoustic.md`](21_last_day_acoustic.md) | Last Day: акустика (гидрофон в масле, Q, HEAT) |
| [`22_last_day_open_questions.md`](22_last_day_open_questions.md) | Last Day: ответы на открытые вопросы |
| [`30_other_modules_gaps.md`](30_other_modules_gaps.md) | Остальные 7 модулей: что заявлено и чего нет (с Update 2026-07 по ISYL) |
| [`40_bom_risk_register.md`](40_bom_risk_register.md) | Риски компонентов BOM и замены |
| [`41_power_thermal_emi.md`](41_power_thermal_emi.md) | Питание, тепло, EMI |
| [`50_contradictions_and_todos.md`](50_contradictions_and_todos.md) | Сводка противоречий в документации |
| [`wood_reverb_logical_schematic.html`](wood_reverb_logical_schematic.html) | Логический каркас схемы Last Night v2.0 (14 секций, ASCII), открывается в браузере |

Конкретные правки по итогам аудита — в [`../fixes/`](../fixes/).

## Происхождение

- Основа — `origin/SS:00_series/audit/` (`6d20ae1`, 2026-07-07). Последние содержательные изменения: `e0c6385` (2026-07-07, баннеры Is My/And My в `00`, `01`, `02`, `12`, `30`, `50`); остальные файлы — снапшот `467a5f3` (2026-05-12).
- `30_other_modules_gaps.md`: блок «Update 2026-07» о зрелости ISYL взят из `origin/claude/docs-preparation-xuki5v` (`2be486d`, 2026-07-07).
- Баннеры CONTEXT NOTE / HISTORICAL SNAPSHOT по Decision 06/07 в `02`, `10`, `11`, `12`, `13`, `20`, `21`, `22` взяты из `origin/claude/review-last-day-concept-HWbFa` (`222e217`, `1dcef2a`, 2026-05-12). В линии SS их не было. Внутри баннеров пути записаны относительно корня серии (`decisions/…`, `SYSTEM_SUICIDE.md`).
- Баннеры той же ветки о And My как MOSFET-shaper (Decision 05) не перенесены: их заменили баннеры SS, отсылающие к Decisions 12/13.
- При сборке исправлены путь `../i_show_you_light/` в `30` (теперь `../../05_i_show_you_light/`) и абсолютный путь к репозиторию в `00_README.md`.
