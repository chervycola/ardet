#ifndef LSQ_HAL_H
#define LSQ_HAL_H

/* Интерфейс железа. core эти функции НЕ вызывает — только app.
 * Реализации: hal/stm32/ (фаза 1-железо), симулятор в app/ подменяет
 * захват чтением PGM/синтетикой. */

#include <stdint.h>
#include "../core/types.h"

typedef enum {
    LIGHT_OFF = 0,
    LIGHT_TRANS,     /* просветная панель */
    LIGHT_RING,      /* диффузное кольцо (REFLECT-D вместе с группами) */
    LIGHT_RAKE_N, LIGHT_RAKE_E, LIGHT_RAKE_S, LIGHT_RAKE_W,
} light_t;

typedef enum { MODE_TRANS = 0, MODE_REFLECT_D, MODE_REFLECT_4 } scan_mode_t;

void hal_light_set(light_t l, int on);

/* Блокирующий захват Y-кадра QVGA (DCMI+DMA внутри) */
int  hal_camera_capture(uint8_t *frame /* FRAME_W*FRAME_H */);

/* Полный захват «сырого» кадра по режиму: REFLECT_4 сам делает 4 кадра
 * и сводит max-min (03 §3a). Возвращает 0 при успехе. */
int  hal_scan(scan_mode_t mode, uint8_t *frame);

/* Выходы (фаза 2: USB-MIDI; фаза 3: DAC) */
void hal_midi_note(uint8_t note, uint8_t vel, int on);
void hal_midi_cc(uint8_t cc, uint8_t val);

/* Конфиг во flash */
int  hal_config_load(void *buf, uint32_t len);
int  hal_config_save(const void *buf, uint32_t len);

#endif
