# decisions/ — design decisions серии SYSTEM SUICIDE

Здесь хранится вся цепочка архитектурных и бизнес-решений серии: принятые, промежуточные и отменённые. Отменённые решения не удаляются, они остаются звеньями цепочки (например, 01-3 → 05 → 12/13). Решения, касающиеся одной педали, тоже лежат здесь, а README педалей ссылаются на них.

Подробный индекс с содержанием каждого решения и шаблоном ответов пользователя — [`00_README.md`](00_README.md). Ниже — сводка статусов.

## Содержимое и статусы

| Файл | Решение | Дата | Статус | Касается |
|------|---------|------|--------|----------|
| [`00_README.md`](00_README.md) | Индекс decisions, порядок работы и ответов | — | ведётся | — |
| [`01_undefined_modules.md`](01_undefined_modules.md) | Архитектура 4 неопределённых модулей (Be Careful, Is My, And My, BBAS) | 2026-04 | §1 и §4 действуют; §2 → D12, §3 → D13 | серия |
| [`02_last_day_scope.md`](02_last_day_scope.md) | Scope Last Day: 6 решений (форм-фактор, пикап, solar, mid-резонатор, perform FX, R&D) | 2026-04 | частично: D1 и D5 заменены 08-consolidated | Last Day |
| [`03_cartridge_standards.md`](03_cartridge_standards.md) | Стандарты картриджей: 7 решений, каталог Phase 1 | 2026-04 | частично, см. D11 и `acoustic_modeling` | Last Night |
| [`04_production_strategy.md`](04_production_strategy.md) | Production strategy: 5 фаз, масштаб, цены, дистрибуция | 2026-04 | частично: цены и сроки Is My / And My устарели | серия |
| [`05_and_my_respec.md`](05_and_my_respec.md) | And My → MOSFET-shaper + пилотный пульт | 2026-05 | **superseded** D12/D13 | And My → Is My |
| [`06_last_day_combine_concept.md`](06_last_day_combine_concept.md) | Last Day — «комбайн раскалённого полудня» | 2026-05 | **LOCKED** через 08-consolidated (FX-палитра пересмотрена) | Last Day |
| [`07_last_night_combine_concept.md`](07_last_night_combine_concept.md) | Last Night — «комбайн холодной ночи» | 2026-05 | **LOCKED** через 08-consolidated (FX-палитра пересмотрена) | Last Night |
| [`08_refined_fx_palette.md`](08_refined_fx_palette.md) | Refined FX-палитры Day/Night (промежуточный рефайнинг 06/07) | 2026-05 | **superseded** 08-consolidated | Day/Night |
| [`08_consolidated_base.md`](08_consolidated_base.md) | Consolidated base: Day/Night комбайны, diptych-mapping, dual SKU | 2026-05 | **LOCKED** | Day/Night |
| [`09_hybrid_lock.md`](09_hybrid_lock.md) | v5 hybrid: UX мокапа + электрика Decision 08 | 2026-05 | **LOCKED** | Last Night (UX Day/Night) |
| [`10_premium_components_sourcing.md`](10_premium_components_sourcing.md) | Elite tier компонентов и стратегия закупок (v2) | 2026-05 | reference | Last Night, серия |
| [`10_premium_components_sourcing.docx`](10_premium_components_sourcing.docx) | Word-версия D10, **устаревшая**: первая редакция (draft v1, `99b9cf1`, 2026-05-14), без правок v2 под v6.4 и Decision 11 | 2026-05-14 | архив, верна .md | — |
| [`11_cartridge_architecture_lock.md`](11_cartridge_architecture_lock.md) | Картридж = пассивная пластина, трансдьюсеры в модуле | 2026-05 | **LOCKED** | Last Night |
| [`12_is_my_shaper_respec.md`](12_is_my_shaper_respec.md) | Is My: MOSFET-shaper + пульт DJI C5 (swap слотов с And My) | 2026-07 | **LOCKED** | Is My |
| [`13_and_my_tbd.md`](13_and_my_tbd.md) | And My возвращён в TBD | 2026-07 | **LOCKED** | And My |
| [`14_isyl_respec.md`](14_isyl_respec.md) | I Show You Light: лазер + FOC-сервопетля вместо LED + PLL | 2026-07-07 | **proposed**, lock после Stage 0 | I Show You Light |
| [`15_optical_bus_hybrid.md`](15_optical_bus_hybrid.md) | Оптическая шина серии: гибридная топология + retina-плата | 2026-07-07 | топология **LOCKED**; retina — draft до KiCad; точки подключения модулей — proposal | серия (ISYL, Be Careful, FAS, Last Day, And My) |

Номер «08» занят дважды исторически: ветки разошлись. Финальное решение — `08_consolidated_base.md`, а `08_refined_fx_palette.md` — промежуточный шаг, пришедший из ветки HWbFa.

Пути внутри документов записаны как `code`, обычно относительно корня серии (`decisions/…`, `audit/…`, `SYSTEM_SUICIDE.md`). Пути к папкам педалей при сборке репо приведены к виду относительно самого файла (`../../01_last_night/…`, `../../05_i_show_you_light/…`).

## Происхождение

| Файлы | Ветка | Коммит | Дата снапшота |
|-------|-------|--------|---------------|
| `00`–`13`, `10_….docx` | `origin/SS` (`00_series/decisions/`) | `6d20ae1` | 2026-07-07 |
| `05`, `06`, `07`, `08_refined` (в SS попали при консолидации `1b5250d`) | исходно `origin/claude/review-last-day-concept-HWbFa` | `f7f0662`–`59fb95e` | 2026-05-12 |
| `14`, `15`, пункты 11–12 в `00_README.md` | `origin/claude/docs-preparation-xuki5v` (то же — в `melody-algorithm-illustration-9brvyf`) | `1853ba6`, `a3455f4` | 2026-07-07 |

Правки при сборке: исправлены пути к файлам Last Night и ISYL (`03`, `08`, `10`, `11`, `13`, `14`, `15`), в `00_README.md` добавлены пометка о .docx и строка про And My-proposal из D15. Подробнее — в [`../README.md`](../README.md).
