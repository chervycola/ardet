# tools — ПК-инструменты на Python

| Файл | Что это | Зависимости |
|---|---|---|
| [`viewer.py`](viewer.py) | Просмотрщик бинарного лога протокола (05 §6) или живого стенда по serial: карта 32×32, путь плейхеда, ноты, пианоролл, акценты, значение R. `viewer.py out.bin --out out.png` — рендер лога в PNG; `viewer.py /dev/ttyACM0 --live` — живой режим (фаза 1) | стандартная библиотека; matplotlib — если установлен (качественнее); pyserial — для `--live` |
| [`genpatterns.py`](genpatterns.py) | Пишет PGM-паттерны 320×240 (`checker`, `rings`, `dots5/15/40`, `blank`) — те же, что генерирует [`../app/patterns.c`](../app/patterns.c). Нужны, когда паттерн требуется файлом: печать миры на плёнке, ручные эксперименты, подмена кадра камеры | numpy |

Пример (из папки [`lithoseq/`](../README.md)):

```sh
python3 tools/viewer.py out.bin --out out.png
python3 tools/genpatterns.py pgm/
```

Статус: оба скрипта работают (`viewer.py` проверен на встроенном
PNG-рендере, без matplotlib); живой режим не проверялся, потому что стенда нет.

Происхождение: `origin/claude/eurorack-sequencer-design-3wu8wb`, снапшот `72671ad` (2026-07-18), код последний раз менялся в `c256be3` (2026-07-07). Файлы перенесены байт-в-байт; этот README добавлен при сборке репо.
