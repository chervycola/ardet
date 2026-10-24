#ifndef LSQ_PATTERNS_H
#define LSQ_PATTERNS_H

#include <stdint.h>

/* Синтетические кадры 320x240 для тестов и симулятора (T-M1).
 * Детерминированы: случайные точки — xorshift с фиксированным seed. */
void pattern_blank(uint8_t *f, uint8_t level);
void pattern_checker(uint8_t *f, int cell);
void pattern_rings(uint8_t *f, int width);
/* density_pct: процент площади, покрытой точками 3x3 */
void pattern_dots(uint8_t *f, int density_pct, uint32_t seed);

/* PGM P5 320x240 8bit */
int pattern_load_pgm(const char *path, uint8_t *f);
int pattern_save_pgm(const char *path, const uint8_t *f);

#endif
