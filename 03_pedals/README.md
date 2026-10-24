# 03 · Педали — серия SYSTEM SUICIDE и соседние разработки

Раздел разработки педалей и Eurorack-модулей. Основное здесь — серия **SYSTEM SUICIDE**: девять модулей физического синтеза, у каждого в основе настоящий физический материал (свет, кожа, кость, стекло, маятник, силовая электроника, масло, резонирующая пластина). Принцип серии — «электроника обслуживает физику». Два финализатора, Last Day и Last Night, выпускаются и в Eurorack 40 HP, и в корпусе big-box pedal. Остальные модули — только Eurorack.

Названия модулей складываются в одну строку, порядок слов совпадает с порядком в сигнальной цепи:

> *I Show You Light, Body Blood And Salt, All Bones Dust — Be Careful — Fuck Abandoned Sleep Is My Last Day And My Last Night.*

Рядом лежат две разработки вне 9-модульной серии: генеративный секвенсор LITHOSEQ и маркетинг-сайт серии.

Номер в имени папки — очередь разработки внутри `03_pedals/`, а не слот модуля в серии. Слот указан в таблице.

## Содержимое

| Папка | Что это | Слот | Статус и фаза | Снапшот |
|---|---|---|---|---|
| [`00_series/`](00_series/README.md) | Общесерийные документы: канон-бриф v3.1, вся цепочка design decisions 01–15, аудит весны 2026, правки по аудиту, иллюстрированный гид с pandoc-сборкой | — | Design lock v6.5. D14 (ISYL) — proposed, D15 (оптическая шина) — топология locked, retina-плата draft | `SS` `6d20ae1` + `docs-preparation` `a3455f4` + `review-last-day-concept` `955461a`, 2026-07-07…18 |
| [`01_last_night/`](01_last_night/README.md) | **Last Night** — флагман, резонатор на сменных пассивных пластинах (material resonator) + холодная FX-палитра; 40 HP + pedal SKU, €3640 | 9 | Phase 1 ship (M1–9). Проект зафиксирован на v6.5, но **Stage 0 bench gate не пройден**; PCB — спека до KiCad; `.docx` отстают от `.md` | `SS` `6d20ae1` + `review-reverberator-data` `052fe07`, 2026-07-15 |
| [`02_last_day/`](02_last_day/README.md) | **Last Day** — oil-can delay + солнечный сатуратор + язычковый резонансный EQ, пара по диптиху к Last Night; 40 HP + pedal SKU | 7 | Phase 2. R&D Phase A до стенда: bench-план из 4 ригов готов, веха M0 не пройдена; SPEC/BUILD v1.0; две редакции FX-палитры не согласованы | `SS` `6d20ae1` + `review-last-day-concept` `955461a`, 2026-07-18 |
| [`03_is_my/`](03_is_my/README.md) | **Is My** — MOSFET-шейпер (SHAPER / RING / GATE) на каскаде из ESC FPV-дрона + выносной пульт на доноре DJI C5, линк USB-C; edition of 13, €2480 | 6 | Phase 2 (M9–21), архитектура LOCKED (D12). Бумага и скелеты прошивок, хост-тест проходит; вычитка 2026-10-19 нашла 21 ошибку, следующий шаг — Этап 0 (согласовать документы и код) | `jolly-gates` `051f6c7`, 2026-10-19 |
| [`04_sequencer_lithoseq/`](04_sequencer_lithoseq/README.md) | **LITHOSEQ** — генеративный секвенсор: камера читает сменную пластину с кристаллом или пористым образцом, карта 32×32 → плейхед → MIDI, затем CV | вне серии | Фаза 1 (стенд захвата) в работе: ядро на C с тестами и ПК-симулятор готовы, железо не закуплено. Кандидат на слот 8, но решения нет | `eurorack-sequencer-design` `72671ad`, 2026-07-18 |
| [`05_i_show_you_light/`](05_i_show_you_light/README.md) | **I Show You Light** — оптический tonewheel-осциллятор; re-spec: лазер + FOC-сервопетля, 4 голоса | 1 | По канону Phase 3 (M21–33). Re-spec (D14) — proposed, lock после Stage 0; прошивка сервопетли v0.1 на железе не проверялась | `docs-preparation` `a3455f4`, 2026-07-07 |
| [`06_and_my/`](06_and_my/README.md) | **And My** — папка слота 8: иллюстрация алгоритма «материального секвенсора» и разбор связи с LITHOSEQ | 8 | **TBD** по канону (D13, LOCKED). Концепт из D15 — proposal, иллюстрация — draft | `melody-algorithm-illustration` `95a2fa7`, 2026-07-08 |
| [`site/`](site/README.md) | Маркетинг-сайт серии (бренд SYSTEM ☐): Vite + React + TypeScript, EN/RU, главная с каталогом и страницы модулей | — | Снапшот без изменений с 2026-07-26. Полная сборка при переносе не проверена (нет доступа к npm). Данные модулей отстают от канона — [`PROVENANCE.md`](site/PROVENANCE.md) | `System-suicide` `bfbfcc7`, 2026-07-26 |

Короткие имена веток в колонке «Снапшот» — это `origin/<имя>` без префикса `claude/` и суффикса; полные имена и судьба каждой ветки — в [`../BRANCHES.md`](../BRANCHES.md).

## Серия по слотам

Данные из канона [`00_series/SYSTEM_SUICIDE.md`](00_series/SYSTEM_SUICIDE.md) (обзорная таблица и «Дорожная карта прототипирования»).

| Слот | Модуль | Функция | HP по канону | Phase по канону | Где материалы |
|---|---|---|---|---|---|
| 1 | I Show You Light | Осциллятор: оптическое тон-колесо | 16 (по D14 возможно ≥ 24) | 3 (M21–33) | [`05_i_show_you_light/`](05_i_show_you_light/) |
| 2 | Body Blood And Salt | Синт / процессор: touch-pads, в v2 — жидкости тела | 20 (в дорожной карте 10 для v1) | 5 (M33+), отложен | **нет папки** — канон §2 |
| 3 | All Bones Dust | Waveshaper / distortion / VCA: трансформатор + механический раттл | 10 | 1 (M1–9) | **нет папки** — канон §3 |
| 4 | Be Careful | Резонансный фильтр на стеклянной пластине | 14 | 4 (M27–33) | **нет папки** — канон §4 |
| 5 | Fuck Abandoned Sleep | LFO / модулятор: физический маятник + оптика | 14 (в дорожной карте 10) | 3 (M21–33) | **нет папки** — канон §5 |
| 6 | Is My | MOSFET-шейпер + пилотный пульт | 14 (рабочие документы — ~20) | 2 (M9–21) | [`03_is_my/`](03_is_my/) |
| 7 | Last Day | Финализатор «раскалённый полдень»: delay / amp / EQ | 40 + pedal SKU | 2 (M9–21) | [`02_last_day/`](02_last_day/) |
| 8 | And My | **TBD** | резерв 6–14 | вне дорожной карты | [`06_and_my/`](06_and_my/) |
| 9 | Last Night | Финализатор «холодная ночь»: резонатор на сменных пластинах | 40 + pedal SKU | 1 (M1–9) | [`01_last_night/`](01_last_night/) |

HP-бюджет по канону: 148 HP без Body Blood And Salt и And My (два ряда по 84 HP с резервом под And My), 168 HP с Body Blood And Salt.

### Модули без собственной папки

Четыре модуля пока существуют только как разделы канона. Отдельных веток, спецификаций, схем и прошивок у них нет ни в одной ветке репозитория (проверено при сборке).

| Модуль | Что о нём есть | Ближайшее по дорожной карте |
|---|---|---|
| **All Bones Dust** | Канон §3; аудит [`00_series/audit/30_other_modules_gaps.md`](00_series/audit/30_other_modules_gaps.md) §3 | Phase 1, параллельно с Last Night: прототип трансформатора и раттла, R&D 2–3 месяца. Единственный модуль Phase 1 без папки — первый кандидат на новую папку |
| **Fuck Abandoned Sleep** | Канон §5; аудит 30 §5; [D15](00_series/decisions/15_optical_bus_hybrid.md) — proposal унифицировать сенсоры маятников с retina-платой | Phase 3, вместе с I Show You Light |
| **Be Careful** | Канон §4; [D01 §1](00_series/decisions/01_undefined_modules.md) — вариант «стеклянная пластина» (действует); аудит 30 §4; D15 — proposal оптического съёма с пластины | Phase 4, переиспользует картриджную инфраструктуру Last Night |
| **Body Blood And Salt** | Канон §2; D01 §4 (действует); аудит 30 §2 | Phase 5, опционально; v1 — только touch-pads |

Когда по модулю начнётся работа, папка заводится по той же схеме: `03_pedals/NN_<модуль>/` со своим README (назначение, таблица файлов, статус, происхождение), а строка добавляется в таблицы выше.

## Очередь разработки

Порядок по канону и по состоянию папок на 2026-10-24:

1. **Last Night** (Phase 1 ship). Ближайший шаг — Stage 0 bench gate: стенд акустического ядра по [`01_last_night/stage0_prototype.html`](01_last_night/stage0_prototype.html) и [`RISK_ASSESSMENT.md`](01_last_night/RISK_ASSESSMENT.md). До его прохождения на PCB, оснастку и закупки не тратимся. Дальше — проект PCB в KiCad.
2. **All Bones Dust** (Phase 1, параллельно). Работа не начата, папки нет.
3. **Last Day** (Phase 2). R&D Phase A: риги #1 и #2 первой волной, затем #3 и #4, веха M0 — вердикт по масляному пикапу и язычку ([`02_last_day/proto/00_bench_plan.md`](02_last_day/proto/00_bench_plan.md)).
4. **Is My** (Phase 2). Этап 0 плана из [`03_is_my/07_review_and_plan.md`](03_is_my/07_review_and_plan.md): принять решения D1–D7 и исправить документы и код, параллельно закупка для It-0. Платы — только после этапов 0–4. Сейчас это самая активная разработка раздела (последние коммиты — 2026-10-19).
5. **I Show You Light** (Phase 3). D14 предлагает вынести Stage 0 сервопетли (~$60–80 железа) в параллельный трек, потому что тот же контур gimbal BLDC + FOC нужен ригу #3 Last Day. Для этого нужен sign-off.
6. **Fuck Abandoned Sleep** (Phase 3), **Be Careful** (Phase 4), **Body Blood And Salt** (Phase 5) — после respec сателлитов под пару Day/Night.
7. **And My** — ждёт концепта и отдельного decisions-документа (D13). Ближайшая готовая база, если respec выберет «материальный секвенсор», — наработки LITHOSEQ.

Вне очереди серии: **LITHOSEQ** (фаза 1 — стенд захвата) и **сайт** (поддерживается по мере изменения канона).

Окна фаз в каноне (Phase 2 — M9–21) и в Decision 08 (Phase 2 — M9–27) не совпадают. Расхождение унаследовано от исходных веток, подробности — в [`00_series/README.md`](00_series/README.md).

## Быстрый старт

**Понять серию за 15 минут.** Открыть в браузере иллюстрированные туториалы: файлы самодостаточные, сеть не нужна.

- [`01_last_night/last_night_tutorial.html`](01_last_night/last_night_tutorial.html) — Last Night, 10 листов;
- [`02_last_day/tutorial/last_day_tutorial.html`](02_last_day/tutorial/last_day_tutorial.html) — Last Day, 11 листов;
- [`03_is_my/06_tutorial_infographic.html`](03_is_my/06_tutorial_infographic.html) — Is My;
- [`04_sequencer_lithoseq/docs/TUTORIAL.html`](04_sequencer_lithoseq/docs/TUTORIAL.html) — LITHOSEQ, от стенда к модулю.

Дальше — канон [`00_series/SYSTEM_SUICIDE.md`](00_series/SYSTEM_SUICIDE.md) и концептуальный гид [`00_series/docs/SYSTEM_SUICIDE_GUIDE.md`](00_series/docs/SYSTEM_SUICIDE_GUIDE.md). Что решено и что отменено — [`00_series/decisions/README.md`](00_series/decisions/README.md).

**По ролям.**

| Задача | С чего начать |
|---|---|
| R&D Last Night | [`01_last_night/README.md`](01_last_night/README.md) → `HANDOFF_BRIEF.md` → `RISK_ASSESSMENT.md` → `stage0_prototype.html` |
| Прототипирование Last Day | [`02_last_day/proto/00_bench_plan.md`](02_last_day/proto/00_bench_plan.md) |
| Схемотехника и прошивки Is My | [`03_is_my/07_review_and_plan.md`](03_is_my/07_review_and_plan.md) → [`03_is_my/README.md`](03_is_my/README.md) |
| Секвенсор LITHOSEQ | [`04_sequencer_lithoseq/docs/DESIGN-OPINION.md`](04_sequencer_lithoseq/docs/DESIGN-OPINION.md) → [`04_sequencer_lithoseq/README.md`](04_sequencer_lithoseq/README.md) |
| I Show You Light | [`00_series/decisions/14_isyl_respec.md`](00_series/decisions/14_isyl_respec.md) → [`05_i_show_you_light/ISYL_PROJECT.md`](05_i_show_you_light/ISYL_PROJECT.md) |
| Производство и закупки | [`00_series/decisions/10_premium_components_sourcing.md`](00_series/decisions/10_premium_components_sourcing.md) → `01_last_night/BOM_SOURCING.md` → `PRICE_TABLE.md` |
| Сайт | [`site/README.md`](site/README.md), расхождения с каноном — [`site/PROVENANCE.md`](site/PROVENANCE.md) |

**Что собирается и запускается.** Все команды — из корня репозитория.

```bash
# Гид по серии → HTML и DOCX (нужен pandoc; PDF — если есть xelatex, wkhtmltopdf или weasyprint)
cd 03_pedals/00_series/docs && ./build.sh

# Is My: хост-тест скелетов прошивок (gcc, C11)
cd 03_pedals/03_is_my/firmware/host_test && ./build.sh

# LITHOSEQ: тесты ядра и ПК-симулятор (make + gcc или clang)
cd 03_pedals/04_sequencer_lithoseq/lithoseq && make test && make sim

# Сайт (Node 18+)
cd 03_pedals/site && npm ci && npm run dev
```

Прошивка I Show You Light собирается в Arduino IDE с ядром arduino-pico (RP2040): шаги — в [`05_i_show_you_light/README.md`](05_i_show_you_light/README.md). Остальные документы — Markdown, HTML и SVG, они открываются без сборки.

При сборке монорепо (2026-10-24) проверено на копиях вне дерева: гид собирается в HTML и DOCX, хост-тест Is My и `make test` LITHOSEQ проходят. `npm ci` для сайта не прошёл, потому что в среде сборки не было доступа к npm-реестру.

## Сквозные расхождения

Эти несостыковки касаются нескольких папок сразу. В исходных документах они не исправлялись: решать их должен автор. Подробности — в README соответствующих папок.

- **Ширина Is My.** 14 HP в D12 и каноне, ~20 HP в рабочих документах Is My, 10/12 HP на сайте ([`03_is_my/README.md`](03_is_my/README.md), [`site/PROVENANCE.md`](site/PROVENANCE.md)).
- **Ссылки на ветку вместо папки.** Канон (примечание в обзоре и дорожная карта Phase 2), D12 и баннер D01 называют местом полной техспеки Is My ветку `origin/claude/jolly-gates-KxAP2`. В едином дереве это [`03_is_my/`](03_is_my/).
- **And My.** По D13 — TBD. D15 предлагает материальный секвенсор (proposal). Туториал Last Day прямо называет слот 8 «кристальным секвенсором (LITHOSEQ)» и считает TBD закрытым. Сайт подписывает слот старым концептом `Crossfader · TBD`. Разбор — [`06_and_my/README.md`](06_and_my/README.md).
- **Last Day в каноне.** Раздел §7 канона написан до Decision 06 («40 HP Eurorack only»), хотя обзорная таблица того же файла уже говорит о dual SKU. Актуальная спецификация — [`02_last_day/LAST_DAY_SPEC.md`](02_last_day/LAST_DAY_SPEC.md).
- **Набор картриджей Phase 1** различается в `LAST_NIGHT_SPEC.md`, каноне §9 и `HANDOFF_BRIEF.md` ([`01_last_night/README.md`](01_last_night/README.md), раздел «Известные расхождения»).
- **Данные сайта** отстают от канона по Is My, And My, Be Careful, Fuck Abandoned Sleep, картриджам Last Night и сумме HP ([`site/PROVENANCE.md`](site/PROVENANCE.md)).

## Происхождение

Раздел собран 2026-10-24 из восьми веток репозитория: у каждой папки в колонке «Снапшот» указаны ветка, коммит и дата, подробное происхождение файлов — в README папок. Если одна и та же папка была в нескольких ветках, взята самая свежая версия, а уникальные правки из других веток слиты точечно.

Этот README написан при сборке монорепо. Он заменяет корневой `README.md` ветки `origin/SS` (`6d20ae1`, 2026-07-07): оттуда перенесены таблица очереди разработки, быстрый старт и правило синхронизации (оно теперь в [корневом README](../README.md)). Там папки шли под другими номерами: `04_sequencer/` стала `04_sequencer_lithoseq/`, `05_site/` — `site/`. Папок I Show You Light и And My в `origin/SS` не было, они добавлены из веток `docs-preparation` и `melody-algorithm-illustration`.
