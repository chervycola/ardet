/*
 * bsp.h (module) — тонкий слой железа для скелета модуля.
 * Реализация под Nucleo-G431 (It-2/3), потом под серийную плату.
 */
#ifndef ISMY_MODULE_BSP_H
#define ISMY_MODULE_BSP_H

#include <stdint.h>
#include <stdbool.h>

/* --- время --- */
uint32_t bsp_millis(void);

/* --- MIDI in: UART RX 31250 через опто, ISR складывает в кольцевой буфер.
 * bsp_midi_rx_pop() возвращает true и байт, если есть данные.            */
bool bsp_midi_rx_pop(uint8_t *out);

/* --- DAC8568: одна 32-битная SPI-транзакция (SYNC вручную в bsp) --- */
void bsp_dac_write32(uint32_t frame);

/* --- аналоговые ключи топологии (DG419) --- */
void bsp_mux_set_mode(uint8_t mode);       /* 0/1/2 = SHAPER/RING/GATE */
void bsp_mux_set_route(bool filter_pre);   /* true = VCF до ядра        */

/* --- панельные входы модуля --- */
bool bsp_sw_route_pre(void);               /* панельный свитч ROUTE     */

/* --- индикация --- */
void bsp_led_activity_pulse(void);
void bsp_led_arm(bool on);

/* --- flash-хранилище калибровочных LUT --- */
bool bsp_flash_load(void *dst, uint32_t len);
bool bsp_flash_save(const void *src, uint32_t len);

#endif /* ISMY_MODULE_BSP_H */
