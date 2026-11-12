/*
 * dac8568.h — минимальный драйвер DAC8568 (16-bit octal, SPI).
 * Формат кадра (32 бит): [prefix 4][control 4][address 4][data 16][feature 4].
 * Используем команду 0x3 "write & update channel" + начальную настройку
 * внешнего опорного (internal ref OFF — питаемся от REF3040 4.096V).
 */
#ifndef ISMY_DAC8568_H
#define ISMY_DAC8568_H

#include <stdint.h>
#include "bsp.h"

/* Каналы и диапазоны после масштабаторов (03_schematics S9.1, решение D1).
 * LEVEL/TONE/HPF/BASS — аналоговые ручки модуля, каналов ЦАП не занимают.   */
enum {
    DAC_CH_Y_DRIVE = 0,   /* A: 0…+5 В. Нормаль DRIVE-in + CV-out Y (rate-ось)      */
    DAC_CH_X_BIAS  = 1,   /* B: ±5 В, центр = 0. Нормаль BIAS-in + CV-out X          */
    DAC_CH_CUTOFF  = 2,   /* C: 0…+5 В. Нормаль CUTOFF-in (правый Y, rate-ось)       */
    DAC_CH_RESO    = 3,   /* D: ±5 В, центр = 0. Нормаль RESO-in (правый X)          */
    DAC_CH_GATE    = 4,   /* E: 0 / +5 В. CV-out GATE + внутр. gate                   */
    DAC_CH_MUTE    = 5,   /* F: 0…4,096 В напрямую. Ток хвоста 2-го каскада VCA (S8) */
    DAC_CH_IQREF   = 6,   /* G: опора Iq серв ядра (через делитель, S4.3)             */
    DAC_CH_DIAL    = 7,   /* H: ±5 В, центр = 0. Gimbal dial -> нормаль MIX-in        */
};

static inline void dac8568_write(uint8_t ch, uint16_t code)
{
    /* control=0x3: write to input reg and update DAC ch */
    uint32_t f = (0x0u << 28) | (0x3u << 24) | ((uint32_t)(ch & 0xFu) << 20)
               | ((uint32_t)code << 4);
    bsp_dac_write32(f);
}

static inline void dac8568_init_external_ref(void)
{
    /* internal reference OFF (static mode): 0x08000000, флаг в младших битах = 0 */
    bsp_dac_write32(0x08000000u);
}

#endif /* ISMY_DAC8568_H */
