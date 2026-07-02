/*
 * main.c (module) — скелет прошивки модуля Is My (02_technical.md §C3, It-2/3).
 *
 * MIDI-парсер (running status, 14-bit пары MSB->LSB с таймаутом),
 * калибровочные LUT -> DAC8568, FSM mute/crossfade для MODE и ROUTE,
 * ARM как глобальный gate enable, hold при потере линка.
 *
 * Safe-state при старте: mute до прихода MIDI.
 */
#include <string.h>
#include "../common/midi_map.h"
#include "bsp.h"
#include "dac8568.h"

/* ---------------- конфигурация ---------------- */
#define CTRL_TICK_MS      1u        /* контрольный цикл ~1 кГц (ramp/таймауты) */
#define RAMP_MS           30u       /* mute ramp down/up (A7: 20-40 мс)        */
#define GATE_RAMP_STEPS   8u        /* де-клик фронта GATE, ~мс                */

/* ---------------- калибровка каналов (flash) ----------------
 * На It-3 достаточно scale/offset на канал; полноценный LUT — при сборке
 * экземпляров (подгонка под конкретный донорский MOSFET, §12).           */
#define CAL_MAGIC 0x49534D32u /* "ISM2" */
typedef struct { int32_t scale_q16; int32_t offset; } chan_cal_t; /* code = v*scale>>16 + offset */
typedef struct {
    uint32_t   magic;
    chan_cal_t ch[8];
    uint8_t    midi_ch;
    uint16_t   iq_ref_code;         /* опора серв, канал G */
} cal_t;

static cal_t s_cal;

static void cal_defaults(void)
{
    memset(&s_cal, 0, sizeof s_cal);
    s_cal.magic = CAL_MAGIC;
    s_cal.midi_ch = MIDIMAP_CH_DEFAULT;
    /* 14-bit (0..16383) -> полный код ЦАП (0..65535): scale = 4.0 */
    for (int i = 0; i < 8; i++)
        s_cal.ch[i] = (chan_cal_t){ .scale_q16 = 4 << 16, .offset = 0 };
    s_cal.iq_ref_code = 720u;       /* ~45 мВ при Vref 4.096 (S4.3), уточняется */
}

static uint16_t apply_cal(uint8_t ch, uint16_t v14)
{
    int32_t code = ((int64_t)v14 * s_cal.ch[ch].scale_q16 >> 16) + s_cal.ch[ch].offset;
    if (code < 0) code = 0;
    if (code > 65535) code = 65535;
    return (uint16_t)code;
}

/* ---------------- состояние параметров ---------------- */
typedef struct {
    uint16_t x14, y14;              /* BIAS, DRIVE      */
    uint8_t  level7, tone7;
    bool     arm;
    uint8_t  mode;                  /* 0/1/2            */
    bool     link;
    bool     gate;                  /* joy press | foot */
    uint32_t last_midi_ms;
    bool     link_lost;
} params_t;

static params_t s_p = { .x14 = 8192, .y14 = 0, .level7 = 100, .tone7 = 64 };

/* ---------------- FSM mute/crossfade (MODE + ROUTE, A7) ---------------- */
typedef enum { FSM_RUN, FSM_DOWN, FSM_SWITCH, FSM_UP } fsm_state_t;

static struct {
    fsm_state_t st;
    uint32_t    t0;
    uint16_t    level_now;          /* текущий код мьют-VCA (кан. F)       */
    uint8_t     pend_mode;
    bool        pend_route_pre;
    bool        route_now;
} s_fsm = { .st = FSM_RUN };

static uint16_t mute_target(void)
{
    /* ARM off -> 0; иначе уровень от LEVEL knob */
    if (!s_p.arm) return 0;
    return apply_cal(DAC_CH_LEVEL, (uint16_t)s_p.level7 << 7);
}

static void fsm_request(uint8_t mode, bool route_pre)
{
    s_fsm.pend_mode      = mode;
    s_fsm.pend_route_pre = route_pre;
    if (s_fsm.st == FSM_RUN) { s_fsm.st = FSM_DOWN; s_fsm.t0 = bsp_millis(); }
}

/* raised-cosine ramp: без щелчка (A7) */
static uint16_t ramp_shape(uint32_t elapsed, uint16_t from, uint16_t to)
{
    if (elapsed >= RAMP_MS) return to;
    /* грубая S-кривая на целых: x^2*(3-2x) в Q15 */
    uint32_t x = (elapsed << 15) / RAMP_MS;                 /* 0..32768 */
    uint32_t s = (uint64_t)x * x * (3u * 32768u - 2u * x) >> 45;
    return (uint16_t)(from + (((int32_t)to - from) * (int32_t)s >> 15));
}

static void fsm_tick(uint32_t now)
{
    switch (s_fsm.st) {
    case FSM_RUN:
        /* уровень следует LEVEL/ARM напрямую (медленное слежение без FSM) */
        s_fsm.level_now = mute_target();
        dac8568_write(DAC_CH_MUTE, s_fsm.level_now);
        break;
    case FSM_DOWN: {
        uint16_t v = ramp_shape(now - s_fsm.t0, s_fsm.level_now, 0);
        dac8568_write(DAC_CH_MUTE, v);
        if (v == 0) { s_fsm.st = FSM_SWITCH; }
        break;
    }
    case FSM_SWITCH:
        bsp_mux_set_mode(s_fsm.pend_mode);
        bsp_mux_set_route(s_fsm.pend_route_pre);
        s_p.mode        = s_fsm.pend_mode;
        s_fsm.route_now = s_fsm.pend_route_pre;
        /* TODO: сброс узлов нового режима (фаза VCO, детектор GATE) */
        s_fsm.st = FSM_UP; s_fsm.t0 = now;
        break;
    case FSM_UP: {
        uint16_t tgt = mute_target();
        uint16_t v = ramp_shape(now - s_fsm.t0, 0, tgt);
        dac8568_write(DAC_CH_MUTE, v);
        if (v == tgt) { s_fsm.level_now = tgt; s_fsm.st = FSM_RUN; }
        break;
    }
    }
}

/* ---------------- применение параметров к ЦАП ---------------- */
static void apply_axes(void)
{
    dac8568_write(DAC_CH_Y_DRIVE, apply_cal(DAC_CH_Y_DRIVE, s_p.y14));
    dac8568_write(DAC_CH_X_BIAS,  apply_cal(DAC_CH_X_BIAS,  s_p.x14));
}

static void apply_gate(uint32_t now)
{
    (void)now;
    /* де-клик: короткий slew вместо ступеньки */
    static uint16_t g_now;
    uint16_t tgt = s_p.gate ? apply_cal(DAC_CH_GATE, 16383u) : 0u;
    if (g_now != tgt) {
        int32_t step = ((int32_t)tgt - g_now) / (int32_t)GATE_RAMP_STEPS;
        if (step == 0) step = (tgt > g_now) ? 1 : -1;
        g_now = (uint16_t)(g_now + step);
        dac8568_write(DAC_CH_GATE, g_now);
    }
}

/* ---------------- MIDI-парсер (running status + 14-bit) ---------------- */
typedef struct {
    uint8_t status;                 /* текущий running status              */
    uint8_t data[2];
    uint8_t n_data;
    /* 14-bit ожидание LSB */
    uint8_t  wait_lsb_cc;           /* 0xFF = не ждём                      */
    uint8_t  msb_cache;
    uint32_t msb_ms;
} parser_t;

static parser_t s_par = { .wait_lsb_cc = 0xFF };

static void on_cc(uint8_t cc, uint8_t val, uint32_t now);
static void on_note(uint8_t note, bool on);

static void midi_byte(uint8_t b, uint32_t now)
{
    if (b & 0x80u) {                            /* статус-байт */
        if (b < 0xF8u) { s_par.status = b; s_par.n_data = 0; }
        return;                                 /* realtime игнорируем */
    }
    if (!s_par.status) return;

    uint8_t ch = s_par.status & 0x0Fu;
    if (ch != s_cal.midi_ch) return;            /* не наш канал */

    s_par.data[s_par.n_data++] = b;
    uint8_t type = s_par.status & 0xF0u;

    if (s_par.n_data == 2) {
        s_par.n_data = 0;                       /* running status остаётся */
        switch (type) {
        case 0xB0: on_cc(s_par.data[0], s_par.data[1], now); break;
        case 0x90: on_note(s_par.data[0], s_par.data[1] != 0); break;
        case 0x80: on_note(s_par.data[0], false); break;
        default: break;
        }
        s_p.last_midi_ms = now;
        s_p.link_lost = false;
        bsp_led_activity_pulse();
    }
}

static void set_axis14(uint8_t cc_msb, uint16_t v14)
{
    if (cc_msb == CC_JOY_X_MSB) s_p.x14 = v14; else s_p.y14 = v14;
    apply_axes();
}

static void on_cc(uint8_t cc, uint8_t val, uint32_t now)
{
    /* --- 14-bit пары: MSB кэшируется, применяется по LSB --- */
    if (cc == CC_JOY_X_MSB || cc == CC_JOY_Y_MSB) {
        /* если ждали другой LSB — применить незакрытый MSB грубо */
        if (s_par.wait_lsb_cc != 0xFF)
            set_axis14(s_par.wait_lsb_cc, (uint16_t)s_par.msb_cache << 7);
        s_par.wait_lsb_cc = cc;
        s_par.msb_cache   = val;
        s_par.msb_ms      = now;
        return;
    }
    if (cc == CC_JOY_X_LSB || cc == CC_JOY_Y_LSB) {
        uint8_t want_msb = (cc == CC_JOY_X_LSB) ? CC_JOY_X_MSB : CC_JOY_Y_MSB;
        if (s_par.wait_lsb_cc == want_msb) {
            set_axis14(want_msb, midi14_join(s_par.msb_cache, val));
            s_par.wait_lsb_cc = 0xFF;
        }
        /* LSB без MSB — игнор (защита от рассинхрона) */
        return;
    }

    switch (cc) {
    case CC_LEVEL: s_p.level7 = val; break;    /* уровень подтянет fsm_tick */
    case CC_TONE:
        s_p.tone7 = val;
        dac8568_write(DAC_CH_TONE, apply_cal(DAC_CH_TONE, (uint16_t)val << 7));
        break;
    case CC_ARM:
        s_p.arm = (val >= 64u);
        bsp_led_arm(s_p.arm);
        break;
    case CC_MODE: {
        uint8_t m = (val < 32u) ? 0u : (val < 96u) ? 1u : 2u;
        if (m != s_p.mode) fsm_request(m, s_fsm.route_now);
        break;
    }
    case CC_LINK: s_p.link = (val >= 64u); break;  /* линк-логика на пульте */
    default: break;
    }
}

static void on_note(uint8_t note, bool on)
{
    if (note == NOTE_JOY_PRESS || note == NOTE_FOOT)
        s_p.gate = on;
}

/* ---------------- main ---------------- */
int main(void)
{
    /* bsp_init(): clocks, UART RX 31250 + ISR->ring, SPI DAC, GPIO mux */

    if (!bsp_flash_load(&s_cal, sizeof s_cal) || s_cal.magic != CAL_MAGIC)
        cal_defaults();

    dac8568_init_external_ref();
    dac8568_write(DAC_CH_MUTE, 0);              /* safe-state: mute */
    dac8568_write(DAC_CH_IQREF, s_cal.iq_ref_code);
    bsp_mux_set_mode(0);
    bsp_mux_set_route(false);
    apply_axes();

    uint32_t t_ctrl = 0;
    for (;;) {
        uint32_t now = bsp_millis();

        /* MIDI: вычерпать кольцевой буфер */
        uint8_t b;
        while (bsp_midi_rx_pop(&b)) midi_byte(b, now);

        /* незакрытый MSB по таймауту применяем грубо (MSB<<7) */
        if (s_par.wait_lsb_cc != 0xFF && (now - s_par.msb_ms) >= LSB_WAIT_TIMEOUT_MS) {
            set_axis14(s_par.wait_lsb_cc, (uint16_t)s_par.msb_cache << 7);
            s_par.wait_lsb_cc = 0xFF;
        }

        if (now - t_ctrl >= CTRL_TICK_MS) {
            t_ctrl = now;
            fsm_tick(now);
            apply_gate(now);

            /* панельный ROUTE-свитч -> та же FSM, что и MODE */
            bool rp = bsp_sw_route_pre();
            if (rp != s_fsm.route_now && s_fsm.st == FSM_RUN)
                fsm_request(s_p.mode, rp);

            /* потеря линка: держим последние значения, только флаг */
            if (!s_p.link_lost && s_p.last_midi_ms != 0u
                && (now - s_p.last_midi_ms) >= MIDI_LINK_TIMEOUT_MS) {
                s_p.link_lost = true;          /* TODO: индикация на LED */
            }
        }
    }
}
