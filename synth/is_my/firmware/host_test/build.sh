#!/bin/sh
# Хост-сборка: компилируемость скелетов + smoke-тест логики модуля.
set -e
cd "$(dirname "$0")"
CFLAGS="-std=c11 -Wall -Wextra -Werror -O1"

echo "[1/3] pult/main.c   — компилируемость"
gcc $CFLAGS -c ../pult/main.c -o /tmp/ismy_pult.o

echo "[2/3] module/main.c — компилируемость"
gcc $CFLAGS -c ../module/main.c -o /tmp/ismy_module.o

echo "[3/3] smoke-тест модуля"
gcc $CFLAGS smoke_module.c -o /tmp/ismy_smoke
/tmp/ismy_smoke
