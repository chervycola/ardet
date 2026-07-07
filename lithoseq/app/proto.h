#ifndef LSQ_PROTO_H
#define LSQ_PROTO_H

/* Бинарный протокол отладки (05 §6):
 * [0xA5][type u8][len u16 LE][payload][crc8]
 * crc8: poly 0x07, init 0x00, по type+len+payload.
 * 0x01 map32: 1024 байта
 * 0x02 features: r_q15 u16 LE, hash u32 LE
 * 0x03 event: tick u32 LE, x,y,note,gate,note_on,accent,aux1,aux2
 * 0x04 playhead: traj u8, step u32 LE
 */

#include <stdio.h>
#include "../core/types.h"
#include "../core/mapping.h"
#include "../core/playhead.h"

#define PROTO_SYNC 0xA5
#define PT_MAP32    0x01
#define PT_FEATURES 0x02
#define PT_EVENT    0x03
#define PT_PLAYHEAD 0x04

uint8_t proto_crc8(const uint8_t *d, uint32_t n);

void proto_write_map(FILE *out, const map32_t *m);
void proto_write_features(FILE *out, const features_t *f);
void proto_write_event(FILE *out, const event_t *ev);
void proto_write_playhead(FILE *out, const playhead_t *p);

#endif
