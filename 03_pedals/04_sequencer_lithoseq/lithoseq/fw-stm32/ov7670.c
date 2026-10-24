#include "ov7670.h"
#include <stddef.h>

/* Регистры (подмножество) */
#define REG_GAIN   0x00
#define REG_BLUE   0x01
#define REG_RED    0x02
#define REG_COM1   0x04 /* AEC[1:0] в битах 1:0 */
#define REG_AECHH  0x07 /* AEC[15:10] */
#define REG_COM3   0x0C
#define REG_COM7   0x12 /* сброс, формат, QVGA */
#define REG_COM8   0x13 /* AGC/AWB/AEC enable */
#define REG_CLKRC  0x11
#define REG_AECH   0x10 /* AEC[9:2] */
#define REG_COM14  0x3E
#define REG_SCALING_XSC        0x70
#define REG_SCALING_YSC        0x71
#define REG_SCALING_DCWCTR     0x72
#define REG_SCALING_PCLK_DIV   0x73
#define REG_SCALING_PCLK_DELAY 0xA2

#define COM7_RESET 0x80

typedef struct { uint8_t reg, val; } regval_t;

/* QVGA YUV через DCW-скейлер. Значения — стандартный открытый набор;
 * сверить на бринг-апе (T1.1) и зафиксировать в README. */
static const regval_t INIT_QVGA_YUV[] = {
    { REG_COM7,  0x00 },  /* YUV */
    { REG_CLKRC, 0x01 },  /* internal clock prescale */
    { REG_COM3,  0x04 },  /* DCW enable */
    { REG_COM14, 0x19 },  /* manual scaling, PCLK /2 */
    { REG_SCALING_XSC,        0x3A },
    { REG_SCALING_YSC,        0x35 },
    { REG_SCALING_DCWCTR,     0x11 }, /* /2 по H и V -> QVGA */
    { REG_SCALING_PCLK_DIV,   0xF1 },
    { REG_SCALING_PCLK_DELAY, 0x02 },
    /* --- детерминизм (D6/D7): все авторежимы ВЫКЛ --- */
    { REG_COM8,  0x80 },  /* AGC off, AWB off, AEC off */
    { REG_GAIN,  0x20 },  /* стартовое ручное усиление */
    { REG_BLUE,  0x80 },  /* фиксированный WB (на Y почти не влияет) */
    { REG_RED,   0x80 },
    { 0xFF, 0xFF },       /* конец таблицы */
};

int ov7670_init(sccb_write_fn wr, sccb_read_fn rd)
{
    (void)rd;
    if (wr(REG_COM7, COM7_RESET)) return -1;
    /* после сброса нужно >1 мс; задержку обеспечивает вызывающий код
     * (hal_impl), у драйвера нет своего таймера */
    for (const regval_t *p = INIT_QVGA_YUV; p->reg != 0xFF; p++)
        if (wr(p->reg, p->val)) return -1;
    return 0;
}

int ov7670_set_exposure(sccb_write_fn wr, sccb_read_fn rd, uint16_t aec)
{
    uint8_t com1;
    if (rd(REG_COM1, &com1)) return -1;
    if (wr(REG_COM1, (uint8_t)((com1 & ~0x03) | (aec & 0x03)))) return -1;
    if (wr(REG_AECH, (uint8_t)((aec >> 2) & 0xFF))) return -1;
    return wr(REG_AECHH, (uint8_t)((aec >> 10) & 0x3F));
}

int ov7670_set_gain(sccb_write_fn wr, uint8_t gain)
{
    return wr(REG_GAIN, gain);
}
