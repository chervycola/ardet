#ifndef LSQ_TYPES_H
#define LSQ_TYPES_H

#include <stdint.h>

#define MAP_W 32
#define MAP_N (MAP_W * MAP_W)

/* Кадр камеры: QVGA, Y-канал */
#define FRAME_W 320
#define FRAME_H 240

typedef struct {
    uint8_t v[MAP_N]; /* row-major, v[y*MAP_W + x] */
} map32_t;

typedef struct {
    uint16_t x0, y0, w, h; /* ROI в координатах кадра */
} roi_t;

/* Калибровка: map = clamp(((raw - dark) * gain) >> 8), gain Q8 (256 = x1) */
typedef struct {
    uint8_t  dark[MAP_N];
    uint16_t gain[MAP_N];
} calib_t;

typedef struct {
    map32_t  d;      /* локальная плотность: среднее 5x5 */
    map32_t  s;      /* локальная резкость: средний |лапласиан|/4 в 5x5 */
    uint16_t r_q15;  /* поворотная симметрия, Q15: 0..32767 */
    uint32_t hash;   /* CRC32 карты — детерминированный seed (D7) */
} features_t;

static inline uint8_t clamp_u8(int32_t x)
{
    return (uint8_t)(x < 0 ? 0 : (x > 255 ? 255 : x));
}

#endif
