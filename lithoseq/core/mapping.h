#ifndef LSQ_MAPPING_H
#define LSQ_MAPPING_H

#include "types.h"

/* Пресет — набор коэффициентов, не ветка кода (05 §5) */
typedef struct {
    uint8_t root;         /* MIDI-нота основания диапазона */
    uint8_t octaves;      /* диапазон, октав */
    uint8_t t_hi, t_lo;   /* гистерезис gate по G */
    uint8_t t_accent;     /* порог акцента по S */
    uint8_t rhythm_reg;   /* Compose: gate-on только на чётных тиках */
    int8_t  scale_bias;   /* сдвиг уровня консонантности от R (+1 = мягче) */
    uint8_t pitch_eq;     /* D11: питч из CDF-эквализованной D (Compose) */
} preset_t;

typedef struct {
    uint8_t  gate;
    uint8_t  last_val;
    uint8_t  have_last;
    uint32_t tick;
} map_state_t;

typedef struct {
    uint32_t tick;
    uint8_t  x, y;
    uint8_t  note;     /* MIDI */
    uint8_t  gate;     /* текущее состояние */
    uint8_t  note_on;  /* фронт gate на этом тике */
    uint8_t  accent;
    uint8_t  aux1;     /* S под плейхедом (тембр) */
    uint8_t  aux2;     /* R, 0..255 (характер образца) */
} event_t;

extern const preset_t PRESET_REVEAL;
extern const preset_t PRESET_COMPOSE;

void mapping_reset(map_state_t *st);

/* Один тик клока: позиция плейхеда + метрики -> событие */
void mapping_tick(const features_t *f, const map32_t *m,
                  uint8_t x, uint8_t y,
                  const preset_t *p, map_state_t *st, event_t *ev);

/* Маска шкалы по уровню симметрии (для тестов и отладки) */
uint16_t mapping_scale_mask(uint16_t r_q15, int8_t bias);

#endif
