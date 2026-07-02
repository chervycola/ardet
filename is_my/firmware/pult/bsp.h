/*
 * bsp.h (pult) — тонкий слой железа для скелета пульта.
 *
 * Реализуется под конкретную плату (Nucleo-G431KB для It-1, донорская плата
 * позже). Логика в main.c не знает про HAL/регистры — только эти вызовы.
 * Все функции реализовать в bsp_g431.c (генерится из CubeMX + ручные обвязки).
 */
#ifndef ISMY_PULT_BSP_H
#define ISMY_PULT_BSP_H

#include <stdint.h>
#include <stdbool.h>

/* --- время --- */
uint32_t bsp_millis(void);                 /* монотонные мс со старта */

/* --- оси джойстика ---
 * Возвращают сырой ADC с аппаратным оверсэмплингом x16 -> 16 бит эффективных.
 * (CubeMX: ADC oversampler ratio=16, shift=0). Для AS5600-варианта — чтение
 * по I2C, приведённое к той же 16-битной шкале.                           */
uint16_t bsp_axis_read_x(void);
uint16_t bsp_axis_read_y(void);

/* --- ручки (12 бит достаточно) --- */
uint16_t bsp_knob_read_level(void);
uint16_t bsp_knob_read_tone(void);

/* --- дискретные органы (уже с подтяжками; true = замкнут) --- */
bool bsp_sw_arm(void);
bool bsp_sw_link(void);
uint8_t bsp_sw_mode(void);                 /* 0/1/2 = SHAPER/RING/GATE (3-poz ON-OFF-ON) */
bool bsp_btn_joy_press(void);
bool bsp_btn_foot(void);                   /* foot-jack, полярность нормализована в bsp */

/* --- MIDI out: одинаковый поток в TRS-UART (31250) и USB-MIDI --- */
void bsp_midi_send(const uint8_t *bytes, uint8_t len);

/* --- LED / индикация --- */
void bsp_led_arm(bool on);
void bsp_led_activity_pulse(void);         /* короткий импульс на исходящий трафик */
void bsp_batt_indicator(uint8_t percent);  /* 4 LED или OLED — решает bsp */

/* --- питание --- */
uint8_t bsp_fuel_gauge_percent(void);      /* MAX17048 по I2C */
void bsp_power_off(void);                  /* load-switch off -> standby */

/* --- flash-хранилище калибровки (одна страница) --- */
bool bsp_flash_load(void *dst, uint32_t len);
bool bsp_flash_save(const void *src, uint32_t len);

#endif /* ISMY_PULT_BSP_H */
