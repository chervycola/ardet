#ifndef LSQ_MIDI_H
#define LSQ_MIDI_H

/* MIDI-слой (фаза 2, D10): события ядра -> байты MIDI + запись SMF.
 * Переносимый, тестируется на ПК; на стенде те же байты идут в USB-MIDI. */

#include <stdio.h>
#include "../core/mapping.h"

#define MIDI_CC_TIMBRE 74 /* aux1 = S под плейхедом */
#define MIDI_CC_CHAR   16 /* aux2 = R образца */

typedef struct {
    uint8_t held_note;
    uint8_t have_held;
    uint8_t cc_timbre, cc_char;
    uint8_t started;
} midi_state_t;

void midi_reset(midi_state_t *st);

/* Событие -> до 4 сообщений по 3 байта в out (монофонический голос:
 * note_on гасит предыдущую ноту; gate=0 гасит держащуюся).
 * Возврат: число байт (кратно 3). */
uint32_t midi_from_event(midi_state_t *st, const event_t *ev, uint8_t *out);

/* Финал: погасить держащуюся ноту (конец рендера/остановка) */
uint32_t midi_flush(midi_state_t *st, uint8_t *out);

/* --- SMF (Standard MIDI File, format 0) --- */
#define SMF_PPQ 96          /* ticks per quarter */
#define SMF_TICKS_PER_STEP 24 /* шаг секвенсора = 1/16 */

typedef struct {
    FILE    *f;
    uint8_t *buf;
    uint32_t len, cap;
} smf_t;

int  smf_begin(smf_t *s, FILE *f, uint16_t bpm);
/* msg — одно канальное сообщение из 3 байт */
int  smf_add(smf_t *s, uint32_t delta, const uint8_t *msg);
int  smf_end(smf_t *s);

#endif
