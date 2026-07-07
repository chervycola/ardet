# Decision 13 — And My rolled back to TBD (was Day↔Night crossfader)

**Дата**: 2026-07 (sync с device-ветками)
**Статус**: locked (заменяет Decision 01-3 «And My → Day↔Night crossfader»)
**Тип**: возврат модуля в TBD-состояние
**Связанные документы**: `12_is_my_shaper_respec.md`, `../SYSTEM_SUICIDE.md §8`, `origin/System-suicide` commit `b41db61`

---

## Контекст

`decisions/01_undefined_modules.md §3` фиксировал And My как **Day↔Night crossfader** (Variant A): стерео VCA на LM13700 или SSI2164, 8HP, «connective tissue» между Last Day и Last Night, R&D 2–3 месяца.

В маркетинговом канале (`origin/System-suicide`) сначала произошёл swap: MOSFET-shaper переехал в слот 6 под именем Is My, а optical vactrol crossfader переехал в слот 8 под именем And My (commit `71b4aa8`, 2026-05-22). Затем через ~15 минут commit `b41db61` откатил And My в **TBD/CLASSIFIED**: `fn: 'TBD'`, `hp: 'TBD'`, `redacted: true`, `core: 'TBD.'`. Product-страница And My удалена из sitemap.

Причина отката, как читается из последовательности коммитов и текущего состояния canon-документов: концепт для слота 8 «connective utility между двумя финализаторами» больше не удовлетворяет уровню серии. Optical crossfader — универсальная утилита, которую можно купить у Mutable / Joranalogue / Happy Nerding; она не несёт материального слоя, характерного для остальных модулей линейки.

## Что фиксируется

**Слот 08 · And My = TBD**. Концепт откладывается до появления архитектуры, отвечающей принципу серии «электроника обслуживает физику». Модуль остаётся в линейке (позиция в стихе неотчуждаема), но функция и материал не заданы.

Из явных отказов:
- **Not**: Day↔Night crossfader на стерео VCA (Decision 01-3 A) — универсальная утилита без материала.
- **Not**: optical vactrol crossfader на VTL5C3 (перенесённый в этот слот commit `71b4aa8`) — та же проблема + дубликат бывшей Is My.
- **Not**: joystick controller / attenuverter / mult — стандартные утилиты, есть у Make Noise / Doepfer / Instruo.

Пространство поиска (не решение, а направления):
- Физическая связка между Day и Night, где материал определяет характер перехода (не VCA-mix).
- Модуль, тематически привязанный к «моей» — субъективность исполнителя в системе. Пилотный пульт этот слот уже занял через Is My, дублировать нельзя.
- Материал, ещё не задействованный: кристаллы, вода, соль, растительная ткань, воздух в резонаторе, магнитная лента (не в делее, а как медиум для чего-то другого).

## Что становится недействительным

- **Decision 01-3** «And My → Day↔Night crossfader (Variant A)» — superseded. Файл `decisions/01_undefined_modules.md §3` оставлен как исторический документ с banner'ом supersession в шапке.
- **`SYSTEM_SUICIDE.md §8`** старой редакции (stereo VCA crossfader на LM13700/SSI2164) — заменён на TBD-раздел с ссылкой на этот документ и историческим текстом ниже baner'а.
- Все downstream-ссылки на «And My as crossfader / Day↔Night mix / balance point» в `SYSTEM_SUICIDE.md` (сценарии, signal-flow, journey), `LAST_NIGHT_SPEC.md` и др. — устарели, помечены inline.

## Что остаётся открытым

Всё. Функция, материал, ширина HP, retail, R&D-окно, phase — не заданы. Модуль в roadmap Phase 2 остаётся placeholder'ом, cumulative retail Phase 2+ помечен TBD.

## Воздействие на общую систему

- **HP-бюджет**: −8 HP (было And My = 8 HP по Decision 01-3). Total system budget без And My: 156 − 8 = **148 HP** (с новой Is My = 14 HP). С BBAS: 168 HP. С учётом резерва под And My (например 6–14 HP) — total диапазон 154–162 HP; по-прежнему укладывается в два ряда 84HP (168 HP) без BBAS.
- **Signal chain**: слот 8 в цепи Last Day → [8] → Last Night стал пустым. В сценариях `SYSTEM_SUICIDE.md §*` использования, где And My был crossfader между Day и Night, теперь либо direct patch Day → Night, либо промежуточный сторонний VCA/crossfader (нейтральная утилита от других производителей).
- **Roadmap Phase 2**: включает Last Day + Is My; And My отложен до появления концепта. Не блокирует ship.

## Подтверждение

Этот документ фиксирует принятое решение от 2026-07. Возврат к любому старому варианту (crossfader / VCA / joystick) требует нового decisions-документа с обоснованием, почему материальный принцип серии для этого модуля можно ослабить.
