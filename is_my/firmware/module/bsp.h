/*
 * bsp.h (module) — тонкий слой железа для скелета модуля.
 * Реализация под макет It-2/3 (Nucleo-G431 + MAX3421E либо Pico + TinyUSB,
 * решение D6 — по итогам It-2), потом под серийную плату.
 */
#ifndef ISMY_MODULE_BSP_H
#define ISMY_MODULE_BSP_H

#include <stdint.h>
#include <stdbool.h>

/* --- время --- */
uint32_t bsp_millis(void);

/* --- MIDI in: USB-host (05 §4.1) — стек энумерирует пульт как USB-MIDI
 * device, разворачивает 4-байтовые USB-MIDI пакеты в сырые MIDI-байты
 * (включая однобайтовые realtime, CIN 0xF) и складывает в кольцевой буфер.
 * Парсеру всё равно, откуда байты.
 * bsp_midi_rx_pop() возвращает true и байт, если есть данные.
 * bsp_midi_link_up(): пульт энумерирован (detach = потеря линка).         */
bool bsp_midi_rx_pop(uint8_t *out);
bool bsp_midi_link_up(void);

/* --- USB-C порт пульта: питание только настоящему устройству (S11.2) ---
 * bsp_usb_sink_attached(): ровно на одной линии CC виден Rd устройства
 * (0,2…1,6 В при Rp 36k к +3,3 В), антидребезг >= 100 мс — в bsp.
 * VBUS включаем только при true: в чужой host/хаб 5 В не подаём.          */
bool bsp_usb_sink_attached(void);
void bsp_vbus_enable(bool on);             /* EN ключа TPS2553 */

/* --- DAC8568: одна 32-битная SPI-транзакция (SYNC вручную в bsp) --- */
void bsp_dac_write32(uint32_t frame);

/* --- топология ядра и порядок блоков (S4.4, S6): реле K1/K2 + аналоговые
 * ключи. bsp раскладывает mode в три линии:
 *   SW1 = (mode != SHAPER), SW2 = (mode == RING), SW3 = (mode == GATE).
 * Вызывается только под mute, после вызова FSM ждёт SWITCH_SETTLE_MS.     */
void bsp_mux_set_mode(uint8_t mode);       /* 0/1/2 = SHAPER/RING/GATE */
void bsp_mux_set_route(bool filter_pre);   /* true = VCF до ядра        */

/* --- панельные входы модуля --- */
bool bsp_sw_route_pre(void);               /* панельный свитч ROUTE, антидребезг в bsp */

/* --- индикация --- */
void bsp_led_activity_pulse(void);
void bsp_led_arm(bool on);
void bsp_led_link(bool ok);                /* false -> ACT мигает «нет пульта» (вид — в bsp) */

/* --- flash-хранилище калибровочных LUT --- */
bool bsp_flash_load(void *dst, uint32_t len);
bool bsp_flash_save(const void *src, uint32_t len);

#endif /* ISMY_MODULE_BSP_H */
