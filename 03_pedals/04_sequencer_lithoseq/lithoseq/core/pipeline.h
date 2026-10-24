#ifndef LSQ_PIPELINE_H
#define LSQ_PIPELINE_H

#include "types.h"

/* Box-даунсемплинг ROI кадра в 32x32 (границы блоков: i*w/32) */
void pipeline_downsample(const uint8_t *frame, int fw, int fh,
                         const roi_t *roi, map32_t *out);

/* Применить flat-field калибровку на месте (D6: без автоусиления) */
void pipeline_calibrate(map32_t *m, const calib_t *c);

/* Единичная калибровка (dark=0, gain=x1) — для симулятора и тестов */
void calib_identity(calib_t *c);

/* Пирамида: 32x32 -> 16x16 -> 8x8 усреднением 2x2 (out16: 256, out8: 64) */
void pipeline_pyramid(const map32_t *m, uint8_t *out16, uint8_t *out8);

#endif
