/* Реализация hal.h для STM32H743 (Nucleo-H743ZI2).
 * Компилируется только внутри CubeIDE-проекта (нужны хендлы из main.c,
 * сгенерированного CubeMX): hdcmi, hdma_dcmi, hi2c_sccb, htim_clk.
 * Здесь — референсная логика; пины/хендлы поправить под свой .ioc. */
#ifdef STM32H743xx

#include "stm32h7xx_hal.h"
#include "../hal/hal.h"
#include "ov7670.h"
#include <string.h>

extern DCMI_HandleTypeDef hdcmi;
extern I2C_HandleTypeDef  hi2c_sccb;

#define OV7670_ADDR (0x21 << 1)

/* Буферы DMA — в AXI SRAM, вне DTCM (см. README: линкер + D-Cache) */
static uint8_t frame_yuv[FRAME_W * FRAME_H * 2] __attribute__((section(".dma_buf")));
static uint8_t acc_min[FRAME_W * FRAME_H] __attribute__((section(".dma_buf")));
static uint8_t acc_max[FRAME_W * FRAME_H] __attribute__((section(".dma_buf")));

static volatile int frame_done;

void HAL_DCMI_FrameEventCallback(DCMI_HandleTypeDef *h)
{
    (void)h;
    frame_done = 1;
}

/* --- SCCB через I2C --- */
static int sccb_wr(uint8_t reg, uint8_t val)
{
    return HAL_I2C_Mem_Write(&hi2c_sccb, OV7670_ADDR, reg, 1, &val, 1, 100)
           == HAL_OK ? 0 : -1;
}
static int sccb_rd(uint8_t reg, uint8_t *val)
{
    /* SCCB требует STOP между фазами — обычный Mem_Read у OV7670 работает
     * не на всех ревизиях; при проблемах разбить на Transmit+Receive */
    return HAL_I2C_Mem_Read(&hi2c_sccb, OV7670_ADDR, reg, 1, val, 1, 100)
           == HAL_OK ? 0 : -1;
}

int camera_init(void)
{
    HAL_Delay(10);
    int rc = ov7670_init(sccb_wr, sccb_rd);
    HAL_Delay(2);
    return rc;
}

/* --- свет --- */
typedef struct { GPIO_TypeDef *port; uint16_t pin; } pin_t;
static const pin_t LIGHT_PINS[] = {
    [LIGHT_TRANS]  = { GPIOD, GPIO_PIN_0 },  /* поправить под разводку */
    [LIGHT_RING]   = { GPIOD, GPIO_PIN_1 },
    [LIGHT_RAKE_N] = { GPIOD, GPIO_PIN_2 },
    [LIGHT_RAKE_E] = { GPIOD, GPIO_PIN_3 },
    [LIGHT_RAKE_S] = { GPIOD, GPIO_PIN_4 },
    [LIGHT_RAKE_W] = { GPIOD, GPIO_PIN_5 },
};

void hal_light_set(light_t l, int on)
{
    if (l == LIGHT_OFF) {
        for (unsigned i = 1; i < sizeof LIGHT_PINS / sizeof LIGHT_PINS[0]; i++)
            HAL_GPIO_WritePin(LIGHT_PINS[i].port, LIGHT_PINS[i].pin, GPIO_PIN_RESET);
        return;
    }
    HAL_GPIO_WritePin(LIGHT_PINS[l].port, LIGHT_PINS[l].pin,
                      on ? GPIO_PIN_SET : GPIO_PIN_RESET);
}

/* --- захват: YUV422, берём каждый чётный байт (Y) --- */
int hal_camera_capture(uint8_t *out)
{
    frame_done = 0;
    SCB_CleanInvalidateDCache_by_Addr((uint32_t *)frame_yuv, sizeof frame_yuv);
    if (HAL_DCMI_Start_DMA(&hdcmi, DCMI_MODE_SNAPSHOT,
                           (uint32_t)frame_yuv, sizeof frame_yuv / 4) != HAL_OK)
        return -1;
    uint32_t t0 = HAL_GetTick();
    while (!frame_done)
        if (HAL_GetTick() - t0 > 500) { HAL_DCMI_Stop(&hdcmi); return -2; }
    SCB_InvalidateDCache_by_Addr((uint32_t *)frame_yuv, sizeof frame_yuv);
    for (uint32_t i = 0; i < FRAME_W * FRAME_H; i++)
        out[i] = frame_yuv[i * 2];
    return 0;
}

/* --- скан по режиму освещения (03 §3a) --- */
static const light_t RAKE_ORDER[4] = { LIGHT_RAKE_N, LIGHT_RAKE_E,
                                       LIGHT_RAKE_S, LIGHT_RAKE_W };
#define LIGHT_SETTLE_MS 30

int hal_scan(scan_mode_t mode, uint8_t *frame)
{
    int rc = 0;
    hal_light_set(LIGHT_OFF, 0);
    switch (mode) {
    case MODE_TRANS:
        hal_light_set(LIGHT_TRANS, 1);
        HAL_Delay(LIGHT_SETTLE_MS);
        rc = hal_camera_capture(frame);
        break;
    case MODE_REFLECT_D:
        hal_light_set(LIGHT_RING, 1);
        for (int i = 0; i < 4; i++) hal_light_set(RAKE_ORDER[i], 1);
        HAL_Delay(LIGHT_SETTLE_MS);
        rc = hal_camera_capture(frame);
        break;
    case MODE_REFLECT_4:
        memset(acc_min, 0xFF, sizeof acc_min);
        memset(acc_max, 0x00, sizeof acc_max);
        for (int g = 0; g < 4 && rc == 0; g++) {
            hal_light_set(LIGHT_OFF, 0);
            hal_light_set(RAKE_ORDER[g], 1);
            HAL_Delay(LIGHT_SETTLE_MS);
            rc = hal_camera_capture(frame);
            for (uint32_t i = 0; i < FRAME_W * FRAME_H && rc == 0; i++) {
                if (frame[i] < acc_min[i]) acc_min[i] = frame[i];
                if (frame[i] > acc_max[i]) acc_max[i] = frame[i];
            }
        }
        /* relief = max - min (нейтрально к направлению теней) */
        for (uint32_t i = 0; i < FRAME_W * FRAME_H; i++)
            frame[i] = (uint8_t)(acc_max[i] - acc_min[i]);
        break;
    }
    hal_light_set(LIGHT_OFF, 0);
    return rc;
}

/* --- конфиг: последний сектор flash банка 2 --- */
#define CFG_ADDR 0x081E0000u /* сектор 7 банка 2, H743: 128К сектора */

int hal_config_load(void *buf, uint32_t len)
{
    memcpy(buf, (const void *)CFG_ADDR, len);
    return 0;
}

int hal_config_save(const void *buf, uint32_t len)
{
    HAL_FLASH_Unlock();
    FLASH_EraseInitTypeDef er = {
        .TypeErase = FLASH_TYPEERASE_SECTORS,
        .Banks = FLASH_BANK_2,
        .Sector = FLASH_SECTOR_7,
        .NbSectors = 1,
        .VoltageRange = FLASH_VOLTAGE_RANGE_3,
    };
    uint32_t err;
    if (HAL_FLASHEx_Erase(&er, &err) != HAL_OK) { HAL_FLASH_Lock(); return -1; }
    /* H7 пишет флешбордами по 32 байта */
    const uint8_t *src = buf;
    for (uint32_t off = 0; off < len; off += 32) {
        uint8_t word[32] = { 0 };
        uint32_t n = len - off < 32 ? len - off : 32;
        memcpy(word, src + off, n);
        if (HAL_FLASH_Program(FLASH_TYPEPROGRAM_FLASHWORD,
                              CFG_ADDR + off, (uint32_t)word) != HAL_OK) {
            HAL_FLASH_Lock();
            return -1;
        }
    }
    HAL_FLASH_Lock();
    return 0;
}

/* --- MIDI: через TinyUSB (CFG_TUD_MIDI=1); без него — заглушки --- */
#ifdef CFG_TUD_MIDI
#include "tusb.h"
void hal_midi_note(uint8_t note, uint8_t vel, int on)
{
    uint8_t msg[3] = { (uint8_t)(on ? 0x90 : 0x80), note, vel };
    tud_midi_stream_write(0, msg, 3);
}
void hal_midi_cc(uint8_t cc, uint8_t val)
{
    uint8_t msg[3] = { 0xB0, cc, val };
    tud_midi_stream_write(0, msg, 3);
}
#else
void hal_midi_note(uint8_t note, uint8_t vel, int on) { (void)note; (void)vel; (void)on; }
void hal_midi_cc(uint8_t cc, uint8_t val) { (void)cc; (void)val; }
#endif

#endif /* STM32H743xx */
