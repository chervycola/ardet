# app — ПК-симулятор и переносимые слои приложения

Симулятор гоняет ядро [`../core/`](../core/README.md) на синтетическом
кадре или PGM-файле и пишет события в CSV, бинарный протокол отладки и
Standard MIDI File. `proto.c` и `midi.c` переносимы: на стенде те же
байты уходят в USB CDC и USB-MIDI (см. [`../fw-stm32/README.md`](../fw-stm32/README.md)).

| Файл | Что это |
|---|---|
| [`sim_main.c`](sim_main.c) | `lithoseq_sim`: источник (`blank`, `checker`, `rings`, `dots5`, `dots15`, `dots40` или PGM P5 320×240), `--traj`, `--preset reveal\|compose`, `--ticks`, `--bpm`, выходы `--csv`, `--bin`, `--mid` |
| [`patterns.h`](patterns.h) / [`patterns.c`](patterns.c) | Детерминированные синтетические кадры 320×240 для тестов T-M1 и симулятора (точки — xorshift с фиксированным seed); чтение и запись PGM |
| [`proto.h`](proto.h) / [`proto.c`](proto.c) | Бинарный протокол отладки (05 §6): `[0xA5][type][len][payload][crc8]`, пакеты map32, features, event, playhead. Его читает [`../tools/viewer.py`](../tools/viewer.py) |
| [`midi.h`](midi.h) / [`midi.c`](midi.c) | MIDI-слой (фаза 2, D10): события ядра → note on/off и CC (CC74 — S под плейхедом, CC16 — R образца), запись SMF |

Сборка и запуск — `make sim`, примеры команд в [`../README.md`](../README.md).

Статус: работает на ПК, MIDI-слой покрыт тестами [`../tests/test_midi.c`](../tests/test_midi.c).

Происхождение: `origin/claude/eurorack-sequencer-design-3wu8wb`, снапшот `72671ad` (2026-07-18), код последний раз менялся в `c256be3` (2026-07-07). Файлы перенесены байт-в-байт; этот README добавлен при сборке репо.
