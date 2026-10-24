/*
 * bsp.h (pult) — слой железа пульта на доноре DJI C5 (RC-N1/RC231).
 * См. 05_pult_dji_c5.md. Питание от VBUS (батареи нет), связь только USB-MIDI.
 * Реализация: bsp_g431.c (CubeMX: ADC oversample x16, USB FS device, GPIO).
 */
#ifndef ISMY_PULT_BSP_H
#define ISMY_PULT_BSP_H

#include <stdint.h>
#include <stdbool.h>

/* --- время --- */
uint32_t bsp_millis(void);                 /* монотонные мс со старта */

/* --- оси гимбалов DJI: сырой ADC, 16-bit эффективных (oversample x16).
 * Сенсоры донора (Hall/pot — R18) приводятся к этой шкале в bsp.        */
uint16_t bsp_axis_read_lx(void);           /* левый  X -> BIAS   */
uint16_t bsp_axis_read_ly(void);           /* левый  Y -> DRIVE  */
uint16_t bsp_axis_read_rx(void);           /* правый X -> RESO   */
uint16_t bsp_axis_read_ry(void);           /* правый Y -> CUTOFF */

/* --- gimbal dial (колёсико, аналоговое) --- */
uint16_t bsp_dial_read(void);              /* 12-bit достаточно */

/* --- дискретные органы DJI (true = нажат/замкнут) --- */
uint8_t bsp_sw_mode(void);                 /* слайдер 3-поз: 0/1/2 = SHAPER/RING/GATE */
bool bsp_btn_arm(void);                    /* кнопка RTH  (momentary -> toggle в логике) */
bool bsp_btn_link(void);                   /* кнопка Fn   (momentary -> toggle)          */
bool bsp_btn_gate(void);                   /* кнопка Shutter/Record (momentary gate)     */
bool bsp_btn_power(void);                  /* кнопка Power (сервис: калибровка/panic)    */

/* --- USB-MIDI out (device, class-compliant) --- */
void bsp_midi_send(const uint8_t *bytes, uint8_t len);

/* --- индикация: 4 родных LED батареи как статусы --- */
enum { LED_USB = 0, LED_ACT = 1, LED_ARM = 2, LED_AUX = 3 };
void bsp_led(uint8_t idx, bool on);
void bsp_led_activity_pulse(void);         /* короткий импульс LED_ACT */

/* --- flash-хранилище калибровки (одна страница) --- */
bool bsp_flash_load(void *dst, uint32_t len);
bool bsp_flash_save(const void *src, uint32_t len);

#endif /* ISMY_PULT_BSP_H */
