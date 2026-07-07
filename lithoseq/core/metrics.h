#ifndef LSQ_METRICS_H
#define LSQ_METRICS_H

#include "types.h"

/* D-карта, S-карта, R (Q15), hash — по откалиброванной map32.
 * Формулы: 05-FIRMWARE-SPEC §3. Всё целочисленно и детерминированно. */
void metrics_compute(const map32_t *m, features_t *f);

uint32_t crc32_map(const map32_t *m);

#endif
