#!/bin/sh
# Хост-сборка: компилируемость скелетов + smoke-тесты логики модуля и пульта.
# Второй проход — с санитайзерами: ловит переполнения и неопределённое поведение.
set -e
cd "$(dirname "$0")"
CFLAGS="-std=c11 -Wall -Wextra -Werror -O1"
OUT="${TMPDIR:-/tmp}/ismy_build"
mkdir -p "$OUT"

echo "[1/5] pult/main.c   — компилируемость"
gcc $CFLAGS -c ../pult/main.c -o "$OUT/pult.o"

echo "[2/5] module/main.c — компилируемость"
gcc $CFLAGS -c ../module/main.c -o "$OUT/module.o"

echo "[3/5] smoke-тест модуля"
gcc $CFLAGS smoke_module.c -o "$OUT/smoke_module"
"$OUT/smoke_module"

echo "[4/5] smoke-тест пульта"
gcc $CFLAGS smoke_pult.c -o "$OUT/smoke_pult"
"$OUT/smoke_pult"

echo "[5/5] те же тесты под ASan + UBSan"
SAN="-fsanitize=address,undefined -fno-sanitize-recover=all -g"
if gcc $CFLAGS $SAN smoke_module.c -o "$OUT/smoke_module_san" 2>/dev/null \
   && gcc $CFLAGS $SAN smoke_pult.c -o "$OUT/smoke_pult_san" 2>/dev/null; then
    "$OUT/smoke_module_san" >/dev/null
    "$OUT/smoke_pult_san"   >/dev/null
    echo "sanitizers OK"
else
    echo "санитайзеры недоступны в этом тулчейне — шаг пропущен"
fi
