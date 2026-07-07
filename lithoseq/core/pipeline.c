#include "pipeline.h"

void pipeline_downsample(const uint8_t *frame, int fw, int fh,
                         const roi_t *roi, map32_t *out)
{
    for (int by = 0; by < MAP_W; by++) {
        int y0 = roi->y0 + (by * roi->h) / MAP_W;
        int y1 = roi->y0 + ((by + 1) * roi->h) / MAP_W;
        if (y1 <= y0) y1 = y0 + 1;
        if (y1 > fh) y1 = fh;
        for (int bx = 0; bx < MAP_W; bx++) {
            int x0 = roi->x0 + (bx * roi->w) / MAP_W;
            int x1 = roi->x0 + ((bx + 1) * roi->w) / MAP_W;
            if (x1 <= x0) x1 = x0 + 1;
            if (x1 > fw) x1 = fw;
            uint32_t acc = 0;
            for (int y = y0; y < y1; y++)
                for (int x = x0; x < x1; x++)
                    acc += frame[y * fw + x];
            uint32_t n = (uint32_t)((y1 - y0) * (x1 - x0));
            out->v[by * MAP_W + bx] = (uint8_t)((acc + n / 2) / n);
        }
    }
}

void pipeline_calibrate(map32_t *m, const calib_t *c)
{
    for (int i = 0; i < MAP_N; i++) {
        int32_t x = (int32_t)m->v[i] - c->dark[i];
        if (x < 0) x = 0;
        m->v[i] = clamp_u8((x * c->gain[i]) >> 8);
    }
}

void calib_identity(calib_t *c)
{
    for (int i = 0; i < MAP_N; i++) {
        c->dark[i] = 0;
        c->gain[i] = 256;
    }
}

void pipeline_pyramid(const map32_t *m, uint8_t *out16, uint8_t *out8)
{
    for (int y = 0; y < 16; y++)
        for (int x = 0; x < 16; x++) {
            uint32_t a = m->v[(2 * y) * MAP_W + 2 * x]
                       + m->v[(2 * y) * MAP_W + 2 * x + 1]
                       + m->v[(2 * y + 1) * MAP_W + 2 * x]
                       + m->v[(2 * y + 1) * MAP_W + 2 * x + 1];
            out16[y * 16 + x] = (uint8_t)((a + 2) / 4);
        }
    for (int y = 0; y < 8; y++)
        for (int x = 0; x < 8; x++) {
            uint32_t a = out16[(2 * y) * 16 + 2 * x]
                       + out16[(2 * y) * 16 + 2 * x + 1]
                       + out16[(2 * y + 1) * 16 + 2 * x]
                       + out16[(2 * y + 1) * 16 + 2 * x + 1];
            out8[y * 8 + x] = (uint8_t)((a + 2) / 4);
        }
}
