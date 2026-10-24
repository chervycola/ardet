#include "patterns.h"
#include "../core/types.h"
#include <stdio.h>
#include <string.h>

void pattern_blank(uint8_t *f, uint8_t level)
{
    memset(f, level, FRAME_W * FRAME_H);
}

void pattern_checker(uint8_t *f, int cell)
{
    for (int y = 0; y < FRAME_H; y++)
        for (int x = 0; x < FRAME_W; x++)
            f[y * FRAME_W + x] = (((x / cell) + (y / cell)) & 1) ? 230 : 25;
}

static uint32_t isqrt32(uint32_t x)
{
    uint32_t r = 0, bit = 1u << 30;
    while (bit > x) bit >>= 2;
    while (bit) {
        if (x >= r + bit) { x -= r + bit; r = (r >> 1) + bit; }
        else r >>= 1;
        bit >>= 2;
    }
    return r;
}

void pattern_rings(uint8_t *f, int width)
{
    int cx = FRAME_W / 2, cy = FRAME_H / 2;
    for (int y = 0; y < FRAME_H; y++)
        for (int x = 0; x < FRAME_W; x++) {
            int dx = x - cx, dy = y - cy;
            uint32_t r = isqrt32((uint32_t)(dx * dx + dy * dy));
            f[y * FRAME_W + x] = ((r / (uint32_t)width) & 1) ? 230 : 25;
        }
}

static uint32_t xs32(uint32_t *s)
{
    uint32_t x = *s;
    x ^= x << 13; x ^= x >> 17; x ^= x << 5;
    return *s = x;
}

void pattern_dots(uint8_t *f, int density_pct, uint32_t seed)
{
    pattern_blank(f, 25);
    uint32_t s = seed ? seed : 1;
    /* точка 3x3 = 9 px; количество из плотности */
    long ndots = (long)FRAME_W * FRAME_H * density_pct / 100 / 9;
    for (long i = 0; i < ndots; i++) {
        int x = (int)(xs32(&s) % (FRAME_W - 2));
        int y = (int)(xs32(&s) % (FRAME_H - 2));
        for (int dy = 0; dy < 3; dy++)
            for (int dx = 0; dx < 3; dx++)
                f[(y + dy) * FRAME_W + (x + dx)] = 230;
    }
}

int pattern_load_pgm(const char *path, uint8_t *f)
{
    FILE *fp = fopen(path, "rb");
    if (!fp) return -1;
    int w = 0, h = 0, maxv = 0;
    if (fscanf(fp, "P5 %d %d %d", &w, &h, &maxv) != 3 ||
        w != FRAME_W || h != FRAME_H || maxv != 255) {
        fclose(fp);
        return -2;
    }
    fgetc(fp); /* один whitespace после заголовка */
    size_t n = fread(f, 1, (size_t)FRAME_W * FRAME_H, fp);
    fclose(fp);
    return n == (size_t)FRAME_W * FRAME_H ? 0 : -3;
}

int pattern_save_pgm(const char *path, const uint8_t *f)
{
    FILE *fp = fopen(path, "wb");
    if (!fp) return -1;
    fprintf(fp, "P5 %d %d 255\n", FRAME_W, FRAME_H);
    fwrite(f, 1, (size_t)FRAME_W * FRAME_H, fp);
    fclose(fp);
    return 0;
}
