# core — переносимое ядро LITHOSEQ

Ядро тракта «кадр → карта 32×32 → метрики → плейхед → события». Чистый C11,
только целочисленная арифметика, без HAL, RNG и времени (D6, D7). Одни и те
же исходники собираются на ПК (`make test`, `make sim`) и войдут в
прошивку стенда ([`../fw-stm32/`](../fw-stm32/README.md)). Формулы — в
[`05-FIRMWARE-SPEC.md`](../../docs/05-FIRMWARE-SPEC.md).

| Файл | Что это |
|---|---|
| [`types.h`](types.h) | Общие типы: карта `map32_t`, ROI, калибровка `calib_t` (dark + gain Q8), `features_t` (D-, S-карты, R в Q15, CRC32, кривая эквализации D11); размеры кадра QVGA 320×240 |
| [`pipeline.h`](pipeline.h) / [`pipeline.c`](pipeline.c) | Box-даунсемплинг ROI кадра в 32×32 и flat-field калибровка без автоусиления (D6) |
| [`metrics.h`](metrics.h) / [`metrics.c`](metrics.c) | Метрики карты: D (среднее 5×5), S (средний \|лапласиан\| 5×5), R (поворотная/зеркальная симметрия), CDF-эквализация D (D11), CRC32 карты |
| [`playhead.h`](playhead.h) / [`playhead.c`](playhead.c) | Виртуальный плейхед: траектории raster, boustro, spiral_in, spiral_out, radial; `playhead_seek` — задел под X/Y CV |
| [`mapping.h`](mapping.h) / [`mapping.c`](mapping.c) | Маппинг в события: gate с гистерезисом по G, акцент по S, квантайзер по шкале, выбранной по R (D8), пресеты `PRESET_REVEAL` и `PRESET_COMPOSE` |

Статус: реализовано и покрыто тестами, см.
[`../tests/README.md`](../tests/README.md). На железе не проверялось.

Происхождение: `origin/claude/eurorack-sequencer-design-3wu8wb`, снапшот `72671ad` (2026-07-18), код последний раз менялся в `c256be3` (2026-07-07). Файлы перенесены байт-в-байт; этот README добавлен при сборке репо.
