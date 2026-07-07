#include "mapping.h"

/* Шкалы по уровню консонантности: D8 — «регулярное -> консонантное».
 * Битовая маска: бит i = полутон i разрешён.
 * L0 хроматика, L1 октатоника, L2 гарм. минор, L3 мажор, L4 мажорная
 * пентатоника. Микрокластеры (<полутона) — фаза 3, прямым CV. */
static const uint16_t SCALES[5] = {
    0x0FFF, /* {0..11} */
    0x06DB, /* {0,1,3,4,6,7,9,10} */
    0x09AD, /* {0,2,3,5,7,8,11} */
    0x0AB5, /* {0,2,4,5,7,9,11} */
    0x0295, /* {0,2,4,7,9} */
};

const preset_t PRESET_REVEAL = {
    .root = 36, .octaves = 3,
    .t_hi = 24, .t_lo = 8,
    .t_accent = 96,
    .rhythm_reg = 0,
    .scale_bias = 0,
};

const preset_t PRESET_COMPOSE = {
    .root = 36, .octaves = 3,
    .t_hi = 20, .t_lo = 6,
    .t_accent = 72,
    .rhythm_reg = 1,
    .scale_bias = 1,
};

static int r_level(uint16_t r_q15)
{
    if (r_q15 > 26214) return 4; /* > 0.8 */
    if (r_q15 > 19660) return 3; /* > 0.6 */
    if (r_q15 > 13107) return 2; /* > 0.4 */
    if (r_q15 > 6553)  return 1; /* > 0.2 */
    return 0;
}

uint16_t mapping_scale_mask(uint16_t r_q15, int8_t bias)
{
    int lvl = r_level(r_q15) + bias;
    if (lvl < 0) lvl = 0;
    if (lvl > 4) lvl = 4;
    return SCALES[lvl];
}

/* Ближайший разрешённый полутон; при равном расстоянии — вниз (детерминизм) */
static uint8_t quantize(uint8_t d, uint16_t mask, uint8_t root, uint8_t octaves)
{
    int range = octaves * 12;
    int t = (d * (range - 1)) >> 8;
    for (int k = 0; k < 12; k++) {
        int lo = t - k, hi = t + k;
        if (lo >= 0 && ((mask >> (lo % 12)) & 1)) { t = lo; break; }
        if (hi < range && ((mask >> (hi % 12)) & 1)) { t = hi; break; }
    }
    return (uint8_t)(root + t);
}

void mapping_reset(map_state_t *st)
{
    st->gate = 0;
    st->last_val = 0;
    st->have_last = 0;
    st->tick = 0;
}

void mapping_tick(const features_t *f, const map32_t *m,
                  uint8_t x, uint8_t y,
                  const preset_t *p, map_state_t *st, event_t *ev)
{
    int idx = y * MAP_W + x;
    uint8_t raw = m->v[idx];
    uint8_t d = f->d.v[idx];
    uint8_t s = f->s.v[idx];

    /* G — градиент вдоль траектории (F8) */
    uint8_t g = 0;
    if (st->have_last) {
        int dg = (int)raw - (int)st->last_val;
        g = (uint8_t)(dg < 0 ? -dg : dg);
    }
    st->last_val = raw;
    st->have_last = 1;

    /* gate: гистерезис; Compose дополнительно прижимает включения к сетке */
    uint8_t prev_gate = st->gate;
    if (!st->gate && g > p->t_hi) {
        if (!p->rhythm_reg || (st->tick & 1u) == 0)
            st->gate = 1;
    } else if (st->gate && g < p->t_lo) {
        st->gate = 0;
    }

    uint16_t mask = mapping_scale_mask(f->r_q15, p->scale_bias);

    ev->tick    = st->tick;
    ev->x = x;  ev->y = y;
    ev->note    = quantize(d, mask, p->root, p->octaves);
    ev->gate    = st->gate;
    ev->note_on = (uint8_t)(st->gate && !prev_gate);
    ev->accent  = (uint8_t)(s > p->t_accent);
    ev->aux1    = s;
    ev->aux2    = (uint8_t)(f->r_q15 >> 7);

    st->tick++;
}
