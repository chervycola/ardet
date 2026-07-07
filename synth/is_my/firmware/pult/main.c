/*
 * main.c (pult) — прошивка пульта Is My на доноре DJI C5 (05_pult_dji_c5.md).
 *
 * Оси (все гимбалы DJI пружинят в центр):
 *   левый  Y -> DRIVE  : RATE  (отклонение = скорость, значение держится)
 *   левый  X -> BIAS   : MOMENTARY (± вокруг центра, пружина = возврат)
 *   правый Y -> CUTOFF : RATE
 *   правый X -> RESO   : MOMENTARY
 * Кнопки: RTH=ARM(toggle), Fn=LINK(toggle), Shutter=GATE(momentary),
 * слайдер 3-поз = MODE, dial = CC#20, Power при включении = калибровка.
 * Питания/батареи нет — VBUS. LEVEL/TONE — ручки модуля, пульт их не шлёт.
 */
#include <string.h>
#include "../common/midi_map.h"
#include "bsp.h"

/* ---------------- конфигурация ---------------- */
#define AXIS_TICK_MS        1u      /* оси 1 кГц                             */
#define SLOW_TICK_MS        10u     /* кнопки/слайдер/dial ~100 Гц           */
#define AXIS_EMA_SHIFT      3u
#define AXIS_CHANGE_MIN     4u      /* порог отправки, 14-bit                */
#define KNOB_HYST           2u      /* dial, 7-bit                           */
#define DEADZONE_14         96u     /* momentary-оси: мёртвая зона у центра  */
#define DEBOUNCE_MS         20u

/* rate-режим (вертикали): полный ход шкалы за RATE_FULL_MS при полном
 * отклонении; deadzone по отклонению; мягкое экспо. Тюнинг на It-1 (R4). */
#define RATE_FULL_MS        1200u
#define RATE_DEADZONE       410     /* ~5% от 8192                           */
#define RATE_EXPO           1       /* 0 = линейно, 1 = (d+d|d|/8192)/2      */
/* приращение Q16 за тик: defl(-8192..8191) * RATE_K; full defl -> full scale
 * за RATE_FULL_MS тиков: RATE_K = (16383<<16)/(8192*RATE_FULL_MS) ~= 109   */
#define RATE_K              ((int32_t)(((int64_t)16383 << 16) / (8192 * (int64_t)RATE_FULL_MS)))

/* ---------------- калибровка (flash) ---------------- */
#define CAL_MAGIC 0x49534D33u /* "ISM3" — v3: 4 оси DJI */
typedef struct { uint16_t min, max, center; } axis_cal_t;
typedef struct {
    uint32_t   magic;
    axis_cal_t lx, ly, rx, ry;
    uint8_t    midi_ch;
} cal_t;

static cal_t s_cal;

static void cal_defaults(void)
{
    memset(&s_cal, 0, sizeof s_cal);
    s_cal.magic = CAL_MAGIC;
    axis_cal_t d = { .min = 2000, .max = 63000, .center = 32500 };
    s_cal.lx = s_cal.ly = s_cal.rx = s_cal.ry = d;
    s_cal.midi_ch = MIDIMAP_CH_DEFAULT;
}

/* ---------------- MIDI ---------------- */
static void midi_cc(uint8_t cc, uint8_t val)
{
    uint8_t m[3] = { MIDI_ST_CC(s_cal.midi_ch), cc, (uint8_t)(val & 0x7Fu) };
    bsp_midi_send(m, 3);
    bsp_led_activity_pulse();
}

static void midi_cc14(uint8_t cc_msb, uint8_t cc_lsb, uint16_t v14)
{
    midi_cc(cc_msb, midi14_msb(v14));      /* строго MSB, затем LSB */
    midi_cc(cc_lsb, midi14_lsb(v14));
}

static void midi_note(uint8_t note, bool on)
{
    uint8_t m[3] = {
        on ? MIDI_ST_NOTE_ON(s_cal.midi_ch) : MIDI_ST_NOTE_OFF(s_cal.midi_ch),
        (uint8_t)(note & 0x7Fu),
        on ? NOTE_VELOCITY : 0u
    };
    bsp_midi_send(m, 3);
    bsp_led_activity_pulse();
}

/* ---------------- оси ---------------- */
typedef uint16_t (*axis_read_fn)(void);

typedef struct {
    axis_read_fn read;
    const axis_cal_t *cal;
    uint32_t filt;                  /* EMA (16-bit шкала)                    */
    bool     rate;                  /* true = rate-интегратор (вертикали)    */
    int32_t  pos_q16;               /* rate: накопленное значение, 14-bit<<16 */
    uint16_t last_sent14;
    uint32_t last_sent_ms;
    uint8_t  cc_msb, cc_lsb;
} axis_t;

static axis_t s_ax[4];

static void axes_init(void)
{
    /* [0] левый X BIAS (momentary), [1] левый Y DRIVE (rate),
     * [2] правый X RESO (momentary), [3] правый Y CUTOFF (rate) */
    s_ax[0] = (axis_t){ .read = bsp_axis_read_lx, .cal = &s_cal.lx, .rate = false,
                        .cc_msb = CC_JOY_X_MSB, .cc_lsb = CC_JOY_X_LSB,
                        .last_sent14 = 8192 };
    s_ax[1] = (axis_t){ .read = bsp_axis_read_ly, .cal = &s_cal.ly, .rate = true,
                        .cc_msb = CC_JOY_Y_MSB, .cc_lsb = CC_JOY_Y_LSB };
    s_ax[2] = (axis_t){ .read = bsp_axis_read_rx, .cal = &s_cal.rx, .rate = false,
                        .cc_msb = CC_RESO_MSB, .cc_lsb = CC_RESO_LSB,
                        .last_sent14 = 8192 };
    s_ax[3] = (axis_t){ .read = bsp_axis_read_ry, .cal = &s_cal.ry, .rate = true,
                        .cc_msb = CC_CUT_MSB, .cc_lsb = CC_CUT_LSB };
}

/* сырой ADC -> центрированное 14-bit (центр = 8192) */
static uint16_t axis_centered14(axis_t *a, uint16_t raw)
{
    a->filt += ((int32_t)raw - (int32_t)a->filt) >> AXIS_EMA_SHIFT;
    uint16_t v = (uint16_t)a->filt;
    const axis_cal_t *c = a->cal;

    if (v <= c->min) return 0;
    if (v >= c->max) return 16383;
    if (v >= c->center)
        return 8192u + (uint16_t)((uint32_t)(v - c->center) * 8191u / (c->max - c->center));
    return (uint16_t)((uint32_t)(v - c->min) * 8192u / (c->center - c->min));
}

/* значение оси для отправки (momentary: позиция; rate: интегратор) */
static uint16_t axis_value14(axis_t *a)
{
    uint16_t cen = axis_centered14(a, a->read());

    if (!a->rate) {
        /* momentary: deadzone у центра, пружина возвращает в честные 8192 */
        if (cen > 8192u - DEADZONE_14 && cen < 8192u + DEADZONE_14) cen = 8192u;
        return cen;
    }

    /* rate: отклонение = скорость изменения накопленного значения */
    int32_t d = (int32_t)cen - 8192;
    if (d > -RATE_DEADZONE && d < RATE_DEADZONE) d = 0;
#if RATE_EXPO
    d = (d + (int32_t)(((int64_t)d * (d < 0 ? -d : d)) / 8192)) / 2;
#endif
    a->pos_q16 += d * RATE_K;
    if (a->pos_q16 < 0)                    a->pos_q16 = 0;
    if (a->pos_q16 > ((int32_t)16383 << 16)) a->pos_q16 = (int32_t)16383 << 16;
    return (uint16_t)(a->pos_q16 >> 16);
}

static uint32_t s_last_activity_ms;        /* для LED_AUX-индикации простоя */
static void touch_activity(uint32_t now) { s_last_activity_ms = now; }

static void axis_task(uint32_t now)
{
    for (int i = 0; i < 4; i++) {
        axis_t *a = &s_ax[i];
        uint16_t v = axis_value14(a);
        uint16_t d = (v > a->last_sent14) ? (v - a->last_sent14) : (a->last_sent14 - v);
        bool edge = (v == 0u || v == 16383u || v == 8192u) && v != a->last_sent14;
        if ((d >= AXIS_CHANGE_MIN || edge)
            && (now - a->last_sent_ms) >= AXIS_RATE_LIMIT_MS) {
            midi_cc14(a->cc_msb, a->cc_lsb, v);
            a->last_sent14  = v;
            a->last_sent_ms = now;
            touch_activity(now);
        }
    }
}

/* ---------------- кнопки / слайдер / dial ---------------- */
typedef struct { bool state; bool raw; uint32_t t_edge; } deb_t;

static bool debounce(deb_t *d, bool raw, uint32_t now)
{
    if (raw != d->raw) { d->raw = raw; d->t_edge = now; }
    if (raw != d->state && (now - d->t_edge) >= DEBOUNCE_MS) {
        d->state = raw;
        return true;
    }
    return false;
}

static bool s_arm, s_link;

static void slow_task(uint32_t now)
{
    static deb_t d_arm, d_link, d_gate;
    static uint8_t mode_prev = 0xFF, dial7 = 0xFF;

    /* momentary-кнопки DJI -> toggle-состояния */
    if (debounce(&d_arm, bsp_btn_arm(), now) && d_arm.state) {
        s_arm = !s_arm;
        midi_cc(CC_ARM, s_arm ? 127u : 0u);
        bsp_led(LED_ARM, s_arm);
        touch_activity(now);
    }
    if (debounce(&d_link, bsp_btn_link(), now) && d_link.state) {
        s_link = !s_link;
        midi_cc(CC_LINK, s_link ? 127u : 0u);
        touch_activity(now);
    }
    /* shutter -> GATE momentary */
    if (debounce(&d_gate, bsp_btn_gate(), now)) {
        midi_note(NOTE_JOY_PRESS, d_gate.state);
        touch_activity(now);
    }

    /* слайдер MODE (3-поз, дебаунс уровня в bsp) */
    uint8_t mode = bsp_sw_mode();
    if (mode != mode_prev) {
        mode_prev = mode;
        static const uint8_t mv[3] = { MODEVAL_SHAPER, MODEVAL_RING, MODEVAL_GATE };
        midi_cc(CC_MODE, mv[mode % 3u]);
        touch_activity(now);
    }

    /* gimbal dial -> CC#20 (7-bit, гистерезис) */
    uint8_t dv = (uint8_t)(bsp_dial_read() >> 5);
    if (dial7 == 0xFF || (uint8_t)(dv > dial7 ? dv - dial7 : dial7 - dv) >= KNOB_HYST) {
        dial7 = dv;
        midi_cc(CC_DIAL, dv);
        touch_activity(now);
    }

    /* LED_AUX: мигает при простое > 5 мин (пульт жив, но забыт) */
    bsp_led(LED_AUX, ((now - s_last_activity_ms) > 300000u) && ((now >> 9) & 1u));
}

/* ---------------- сервисная калибровка ----------------
 * Вход: удержание Power при подаче питания (подключении кабеля).
 * Прогнать все 4 оси по крайним, отпустить стики, нажать Power.        */
static void calibration_service(void)
{
    axis_cal_t n[4];
    for (int i = 0; i < 4; i++) n[i] = (axis_cal_t){ 0xFFFF, 0, 0 };
    axis_read_fn rd[4] = { bsp_axis_read_lx, bsp_axis_read_ly,
                           bsp_axis_read_rx, bsp_axis_read_ry };

    bsp_led(LED_AUX, true);
    while (bsp_btn_power()) { }             /* отпустить после входа */

    while (!bsp_btn_power()) {
        for (int i = 0; i < 4; i++) {
            uint16_t v = rd[i]();
            if (v < n[i].min) n[i].min = v;
            if (v > n[i].max) n[i].max = v;
        }
    }
    for (int i = 0; i < 4; i++)             /* стики отпущены пружинами в центр */
        n[i].center = rd[i]();

    s_cal.lx = n[0]; s_cal.ly = n[1]; s_cal.rx = n[2]; s_cal.ry = n[3];
    bsp_flash_save(&s_cal, sizeof s_cal);
    bsp_led(LED_AUX, false);
}

/* ---------------- main ---------------- */
int main(void)
{
    /* bsp_init() (CubeMX): clocks, ADC oversample x16, USB-MIDI device, GPIO */

    if (!bsp_flash_load(&s_cal, sizeof s_cal) || s_cal.magic != CAL_MAGIC)
        cal_defaults();
    axes_init();

    if (bsp_btn_power())                    /* сервисный жест */
        calibration_service();

    bsp_led(LED_USB, true);                 /* питание есть = USB есть */

    /* стартовый снапшот состояния — синхронизировать модуль после энумерации */
    midi_cc(CC_ARM,  s_arm  ? 127u : 0u);
    midi_cc(CC_LINK, s_link ? 127u : 0u);
    slow_task(bsp_millis());
    for (int i = 0; i < 4; i++)
        midi_cc14(s_ax[i].cc_msb, s_ax[i].cc_lsb, s_ax[i].last_sent14);

    uint32_t t_axis = 0, t_slow = 0;
    for (;;) {
        uint32_t now = bsp_millis();
        if (now - t_axis >= AXIS_TICK_MS) { t_axis = now; axis_task(now); }
        if (now - t_slow >= SLOW_TICK_MS) { t_slow = now; slow_task(now); }
        /* TODO: WFI между тиками; двойной Power = MIDI panic (all notes off) */
    }
}
