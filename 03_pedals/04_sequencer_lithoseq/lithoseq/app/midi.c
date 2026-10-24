#include "midi.h"
#include <stdlib.h>
#include <string.h>

#define CH 0
#define VEL_NORMAL 80
#define VEL_ACCENT 112

void midi_reset(midi_state_t *st)
{
    memset(st, 0, sizeof *st);
}

static uint32_t msg3(uint8_t *out, uint8_t status, uint8_t d1, uint8_t d2)
{
    out[0] = status;
    out[1] = (uint8_t)(d1 & 0x7F);
    out[2] = (uint8_t)(d2 & 0x7F);
    return 3;
}

uint32_t midi_from_event(midi_state_t *st, const event_t *ev, uint8_t *out)
{
    uint32_t n = 0;

    /* CC — только при изменении (и один раз в начале) */
    uint8_t t = (uint8_t)(ev->aux1 >> 1), c = (uint8_t)(ev->aux2 >> 1);
    if (!st->started || t != st->cc_timbre) {
        n += msg3(out + n, 0xB0 | CH, MIDI_CC_TIMBRE, t);
        st->cc_timbre = t;
    }
    if (!st->started || c != st->cc_char) {
        n += msg3(out + n, 0xB0 | CH, MIDI_CC_CHAR, c);
        st->cc_char = c;
    }
    st->started = 1;

    if (ev->note_on) {
        if (st->have_held)
            n += msg3(out + n, 0x80 | CH, st->held_note, 0);
        n += msg3(out + n, 0x90 | CH, ev->note,
                  ev->accent ? VEL_ACCENT : VEL_NORMAL);
        st->held_note = ev->note;
        st->have_held = 1;
    } else if (!ev->gate && st->have_held) {
        n += msg3(out + n, 0x80 | CH, st->held_note, 0);
        st->have_held = 0;
    }
    return n;
}

uint32_t midi_flush(midi_state_t *st, uint8_t *out)
{
    if (!st->have_held) return 0;
    st->have_held = 0;
    return msg3(out, 0x80 | CH, st->held_note, 0);
}

/* --- SMF --- */

static int smf_push(smf_t *s, const uint8_t *d, uint32_t n)
{
    if (s->len + n > s->cap) {
        uint32_t cap = s->cap ? s->cap * 2 : 4096;
        while (cap < s->len + n) cap *= 2;
        uint8_t *nb = realloc(s->buf, cap);
        if (!nb) return -1;
        s->buf = nb;
        s->cap = cap;
    }
    memcpy(s->buf + s->len, d, n);
    s->len += n;
    return 0;
}

static int smf_varlen(smf_t *s, uint32_t v)
{
    uint8_t tmp[4];
    int k = 0;
    tmp[k++] = v & 0x7F;
    while ((v >>= 7))
        tmp[k++] = (uint8_t)(0x80 | (v & 0x7F));
    /* байты в обратном порядке */
    uint8_t out[4];
    for (int i = 0; i < k; i++) out[i] = tmp[k - 1 - i];
    return smf_push(s, out, (uint32_t)k);
}

int smf_begin(smf_t *s, FILE *f, uint16_t bpm)
{
    memset(s, 0, sizeof *s);
    s->f = f;
    /* tempo meta: FF 51 03, микросекунд на четверть */
    uint32_t uspq = 60000000u / (bpm ? bpm : 120);
    uint8_t meta[7] = { 0xFF, 0x51, 0x03,
                        (uint8_t)(uspq >> 16), (uint8_t)(uspq >> 8),
                        (uint8_t)uspq, 0 };
    if (smf_varlen(s, 0)) return -1;
    return smf_push(s, meta, 6);
}

int smf_add(smf_t *s, uint32_t delta, const uint8_t *msg)
{
    if (smf_varlen(s, delta)) return -1;
    return smf_push(s, msg, 3);
}

int smf_end(smf_t *s)
{
    static const uint8_t eot[4] = { 0x00, 0xFF, 0x2F, 0x00 };
    if (smf_push(s, eot, 4)) return -1;

    uint8_t hdr[14] = { 'M','T','h','d', 0,0,0,6, 0,0, 0,1,
                        (uint8_t)(SMF_PPQ >> 8), (uint8_t)SMF_PPQ };
    uint8_t thd[8] = { 'M','T','r','k',
                       (uint8_t)(s->len >> 24), (uint8_t)(s->len >> 16),
                       (uint8_t)(s->len >> 8),  (uint8_t)s->len };
    int rc = 0;
    if (fwrite(hdr, 1, 14, s->f) != 14) rc = -1;
    if (!rc && fwrite(thd, 1, 8, s->f) != 8) rc = -1;
    if (!rc && fwrite(s->buf, 1, s->len, s->f) != s->len) rc = -1;
    free(s->buf);
    s->buf = NULL;
    s->len = s->cap = 0;
    return rc;
}
