#ifndef LSQ_OV7670_H
#define LSQ_OV7670_H

#include <stdint.h>

/* Драйвер OV7670 поверх абстрактного SCCB (I2C): функции чтения/записи
 * передаются извне, чтобы модуль не зависел от HAL напрямую. */

typedef int (*sccb_write_fn)(uint8_t reg, uint8_t val);
typedef int (*sccb_read_fn)(uint8_t reg, uint8_t *val);

/* QVGA YUV, авторежимы выключены. Возврат 0 при успехе. */
int ov7670_init(sccb_write_fn wr, sccb_read_fn rd);

/* Ручная экспозиция (AEC[15:0]) и усиление — фиксируются при юстировке
 * (T1.2) и сохраняются в конфиг. */
int ov7670_set_exposure(sccb_write_fn wr, sccb_read_fn rd, uint16_t aec);
int ov7670_set_gain(sccb_write_fn wr, uint8_t gain);

#endif
