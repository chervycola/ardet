# firmware/host_test — сборка на хосте и smoke-тест

| Файл | Что |
|---|---|
| [`build.sh`](build.sh) | Проверяет, что `../pult/main.c` и `../module/main.c` компилируются (`gcc -std=c11 -Wall -Wextra -Werror -O1`), затем собирает и запускает smoke-тест. Объектные файлы пишет во временный каталог системы |
| [`smoke_module.c`](smoke_module.c) | Подключает `../module/main.c` целиком и подменяет BSP заглушками. Проверяет четыре 14-битные пары, running status, таймаут LSB, FSM ARM/MODE, dial → ЦАП, фильтр канала, безопасное состояние при старте |

Запуск (нужны `gcc` и `sh`). Скрипт сам переходит в свой каталог, поэтому из этой папки достаточно `./build.sh`, а из корня `03_is_my/`:

```sh
cd firmware/host_test && ./build.sh
```

Ожидаемый вывод заканчивается строкой `module smoke OK (4 pairs, running status, LSB timeout, FSM, ARM, dial, deprecated CC, channel filter)`. Последняя проверка — 2026-10-24, gcc на Linux, прошла.

Ограничение: тест смотрит только на конечные состояния. Промежуточные значения рампы (E1) и скорость де-клика GATE (E2) он не проверяет. Как расширить тесты, написано в [`../../07_review_and_plan.md`](../../07_review_and_plan.md), Этап 0, п. 5.

Происхождение: `origin/claude/jolly-gates-KxAP2` @ `051f6c7` (2026-10-19). Последние правки: `build.sh` — `d0b6562`, `smoke_module.c` — `41ba4f1`, обе 2026-07-02.
