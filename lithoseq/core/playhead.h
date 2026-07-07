#ifndef LSQ_PLAYHEAD_H
#define LSQ_PLAYHEAD_H

#include "types.h"

typedef enum {
    TRAJ_RASTER = 0,   /* строки слева направо */
    TRAJ_BOUSTRO,      /* змейка */
    TRAJ_SPIRAL_IN,    /* с внешнего кольца к центру */
    TRAJ_SPIRAL_OUT,   /* от центра наружу */
    TRAJ_RADIAL,       /* 8 лучей из центра, r=0..15 */
    TRAJ_COUNT
} traj_t;

typedef struct {
    traj_t   type;
    uint32_t step;
} playhead_t;

void playhead_init(playhead_t *p, traj_t t);
/* Позиция на текущем шаге; шаг инкрементируется. Путь циклический. */
void playhead_next(playhead_t *p, uint8_t *x, uint8_t *y);
/* Длина цикла траектории (растр/змейка/спирали: 1024; radial: 128) */
uint32_t playhead_period(traj_t t);
/* Задел под X/Y CV-адресацию (фаза 4): прямой сдвиг на шаг пути */
void playhead_seek(playhead_t *p, uint32_t step);

const char *traj_name(traj_t t);

#endif
