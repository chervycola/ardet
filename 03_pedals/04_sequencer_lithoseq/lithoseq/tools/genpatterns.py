#!/usr/bin/env python3
"""Генератор PGM-паттернов 320x240 для симулятора и печати на плёнке.

  genpatterns.py outdir/   ->  checker.pgm rings.pgm dots{5,15,40}.pgm blank.pgm

Дублирует C-генераторы (app/patterns.c) для случаев, когда паттерн нужен
как файл: печать миры, ручные эксперименты, подмена кадра камеры.
"""
import os
import sys

import numpy as np

W, H = 320, 240


def save_pgm(path, arr):
    with open(path, "wb") as f:
        f.write(b"P5 %d %d 255\n" % (W, H))
        f.write(arr.astype(np.uint8).tobytes())
    print("wrote", path)


def main():
    outdir = sys.argv[1] if len(sys.argv) > 1 else "."
    os.makedirs(outdir, exist_ok=True)
    yy, xx = np.mgrid[0:H, 0:W]

    save_pgm(os.path.join(outdir, "blank.pgm"), np.full((H, W), 128))
    save_pgm(os.path.join(outdir, "checker.pgm"),
             np.where(((xx // 20) + (yy // 20)) % 2, 230, 25))
    r = np.sqrt((xx - W / 2) ** 2 + (yy - H / 2) ** 2)
    save_pgm(os.path.join(outdir, "rings.pgm"),
             np.where((r.astype(int) // 16) % 2, 230, 25))
    rng = np.random.default_rng(0xC0FFEE)
    for dens in (5, 15, 40):
        img = np.full((H, W), 25)
        n = W * H * dens // 100 // 9
        ys = rng.integers(0, H - 2, n)
        xs = rng.integers(0, W - 2, n)
        for dy in range(3):
            for dx in range(3):
                img[ys + dy, xs + dx] = 230
        save_pgm(os.path.join(outdir, f"dots{dens}.pgm"), img)


if __name__ == "__main__":
    main()
