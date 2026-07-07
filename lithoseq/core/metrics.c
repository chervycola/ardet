#include "metrics.h"

/* --- CRC32 (0xEDB88320), без таблицы: скорость не критична --- */
uint32_t crc32_map(const map32_t *m)
{
    uint32_t crc = 0xFFFFFFFFu;
    for (int i = 0; i < MAP_N; i++) {
        crc ^= m->v[i];
        for (int b = 0; b < 8; b++)
            crc = (crc >> 1) ^ (0xEDB88320u & (0u - (crc & 1u)));
    }
    return ~crc;
}

/* --- целочисленный sqrt для int64 --- */
static uint32_t isqrt64(uint64_t x)
{
    uint64_t r = 0, bit = 1ull << 62;
    while (bit > x) bit >>= 2;
    while (bit) {
        if (x >= r + bit) { x -= r + bit; r = (r >> 1) + bit; }
        else r >>= 1;
        bit >>= 2;
    }
    return (uint32_t)r;
}

static inline uint8_t at(const map32_t *m, int x, int y)
{
    if (x < 0) x = 0;
    if (x >= MAP_W) x = MAP_W - 1;
    if (y < 0) y = 0;
    if (y >= MAP_W) y = MAP_W - 1;
    return m->v[y * MAP_W + x];
}

/* Среднее окна 5x5 с клампингом краёв */
static void box5(const map32_t *in, map32_t *out)
{
    for (int y = 0; y < MAP_W; y++)
        for (int x = 0; x < MAP_W; x++) {
            uint32_t acc = 0;
            for (int dy = -2; dy <= 2; dy++)
                for (int dx = -2; dx <= 2; dx++)
                    acc += at(in, x + dx, y + dy);
            out->v[y * MAP_W + x] = (uint8_t)((acc + 12) / 25);
        }
}

/* |лапласиан|/4 попиксельно (0..255) */
static void lap4(const map32_t *in, map32_t *out)
{
    for (int y = 0; y < MAP_W; y++)
        for (int x = 0; x < MAP_W; x++) {
            int32_t c = at(in, x, y);
            int32_t l = 4 * c - at(in, x - 1, y) - at(in, x + 1, y)
                              - at(in, x, y - 1) - at(in, x, y + 1);
            if (l < 0) l = -l;
            out->v[y * MAP_W + x] = clamp_u8(l / 4);
        }
}

/* Нормированная кросс-корреляция map32 с трансформом её самой.
 * xform: 0=rot90, 1=rot180, 2=зеркало по X. Возврат Q15, клампится в [0..32767]. */
static uint16_t ncc_self(const map32_t *m, int xform)
{
    int64_t sa = 0;
    for (int i = 0; i < MAP_N; i++) sa += m->v[i];
    /* среднее в Q8, чтобы не терять точность на целочисленном делении */
    int64_t mean_q8 = (sa * 256) / MAP_N;

    int64_t cov = 0, va = 0, vb = 0;
    for (int y = 0; y < MAP_W; y++)
        for (int x = 0; x < MAP_W; x++) {
            int bx, by;
            switch (xform) {
            case 0:  bx = y;             by = MAP_W - 1 - x; break; /* rot90 */
            case 1:  bx = MAP_W - 1 - x; by = MAP_W - 1 - y; break; /* rot180 */
            default: bx = MAP_W - 1 - x; by = y;             break; /* mirror */
            }
            int64_t a = (int64_t)m->v[y * MAP_W + x] * 256 - mean_q8;
            int64_t b = (int64_t)m->v[by * MAP_W + bx] * 256 - mean_q8;
            cov += a * b;
            va  += a * a;
            vb  += b * b;
        }
    if (va == 0 || vb == 0) return 32767; /* константная карта симметрична */
    if (cov <= 0) return 0;
    uint64_t denom = (uint64_t)isqrt64((uint64_t)va) * isqrt64((uint64_t)vb);
    if (denom == 0) return 32767;
    uint64_t r = ((uint64_t)cov << 15) / denom;
    return (uint16_t)(r > 32767 ? 32767 : r);
}

void metrics_compute(const map32_t *m, features_t *f)
{
    box5(m, &f->d);

    map32_t l;
    lap4(m, &l);
    box5(&l, &f->s);

    uint16_t r90  = ncc_self(m, 0);
    uint16_t r180 = ncc_self(m, 1);
    uint16_t rmir = ncc_self(m, 2);
    uint16_t r = r90;
    if (r180 > r) r = r180;
    if (rmir > r) r = rmir;
    f->r_q15 = r;

    f->hash = crc32_map(m);
}
