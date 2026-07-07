#include "proto.h"
#include <string.h>

uint8_t proto_crc8(const uint8_t *d, uint32_t n)
{
    uint8_t crc = 0;
    for (uint32_t i = 0; i < n; i++) {
        crc ^= d[i];
        for (int b = 0; b < 8; b++)
            crc = (uint8_t)((crc & 0x80) ? (crc << 1) ^ 0x07 : (crc << 1));
    }
    return crc;
}

static void put_u16(uint8_t *p, uint16_t v) { p[0] = v & 0xFF; p[1] = v >> 8; }
static void put_u32(uint8_t *p, uint32_t v)
{
    p[0] = v & 0xFF; p[1] = (v >> 8) & 0xFF;
    p[2] = (v >> 16) & 0xFF; p[3] = (v >> 24) & 0xFF;
}

static void write_pkt(FILE *out, uint8_t type, const uint8_t *payload, uint16_t len)
{
    uint8_t hdr[4] = { PROTO_SYNC, type, 0, 0 };
    put_u16(hdr + 2, len);
    fwrite(hdr, 1, 4, out);
    fwrite(payload, 1, len, out);
    /* crc по type+len+payload */
    uint8_t crc = proto_crc8(hdr + 1, 3);
    for (uint16_t i = 0; i < len; i++) {
        crc ^= payload[i];
        for (int b = 0; b < 8; b++)
            crc = (uint8_t)((crc & 0x80) ? (crc << 1) ^ 0x07 : (crc << 1));
    }
    fwrite(&crc, 1, 1, out);
}

void proto_write_map(FILE *out, const map32_t *m)
{
    write_pkt(out, PT_MAP32, m->v, MAP_N);
}

void proto_write_features(FILE *out, const features_t *f)
{
    uint8_t p[6];
    put_u16(p, f->r_q15);
    put_u32(p + 2, f->hash);
    write_pkt(out, PT_FEATURES, p, sizeof p);
}

void proto_write_event(FILE *out, const event_t *ev)
{
    uint8_t p[12];
    put_u32(p, ev->tick);
    p[4] = ev->x;     p[5] = ev->y;
    p[6] = ev->note;  p[7] = ev->gate;
    p[8] = ev->note_on; p[9] = ev->accent;
    p[10] = ev->aux1; p[11] = ev->aux2;
    write_pkt(out, PT_EVENT, p, sizeof p);
}

void proto_write_playhead(FILE *out, const playhead_t *ph)
{
    uint8_t p[5];
    p[0] = (uint8_t)ph->type;
    put_u32(p + 1, ph->step);
    write_pkt(out, PT_PLAYHEAD, p, sizeof p);
}
