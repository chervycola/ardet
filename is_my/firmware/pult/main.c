/*
 * main.c (pult) — скелет прошивки пульта Is My (02_technical.md §C2, It-1).
 *
 * Оси: EMA-сглаживание + deadzone + порог изменения + rate-limit -> 14-bit CC.
 * Y (DRIVE, throttle, без пружины): весь механический ход -> 0..16383.
 * X (BIAS, пружина в центр):        центр -> 8192, ход в обе стороны.
 * Ручки: 7-bit с гистерезисом. Тумблеры/кнопки: дебаунс -> CC/Note.
 * Питание: таймер активности -> автоотключение.
 *
 * LINK (R4, вердикт It-1): семантика выбирается компайл-флагом ниже,
 * финальная фиксируется после живого теста и уходит в 02_technical.
 */
#include <string.h>
#include "../common/midi_map.h"
#include "bsp.h"

/* ---------------- конфигурация ---------------- */
#define AXIS_TICK_MS        1u      /* опрос осей 1 кГц                    */
#define SLOW_TICK_MS        10u     /* ручки/тумблеры/питание ~100 Гц      */
#define AXIS_EMA_SHIFT      3u      /* filt += (raw-filt)>>3               */
#define AXIS_CHANGE_MIN     4u      /* порог отправки, единиц 14-bit       */
#define KNOB_HYST           2u      /* гистерезис ручек, единиц 7-bit      */
#define DEADZONE_14         96u     /* мёртвая зона вокруг центра X        */
#define DEBOUNCE_MS         20u
#define IDLE_OFF_MS         (30u * 60u * 1000u)   /* 30 мин */

/* LINK: варианты семантики (R4) — выбрать на It-1 */
#define LINK_MODE_Y_DRIVES_BOTH   1   /* Y ведёт обе оси                   */
#define LINK_MODE_MIRROR          2   /* X зеркалится из Y                 */
#define LINK_MODE                 LINK_MODE_Y_DRIVES_BOTH

/* ---------------- калибровка (flash) ---------------- */
#define CAL_MAGIC 0x49534D31u /* "ISM1" */
typedef struct {
    uint16_t min, max, center;      /* сырые 16-bit ADC-координаты */
} axis_cal_t;

typedef struct {
    uint32_t   magic;
    axis_cal_t x, y;
    uint8_t    midi_ch;             /* 0..15 */
} cal_t;

static cal_t s_cal;

static void cal_defaults(void)
{
    s_cal.magic   = CAL_MAGIC;
    s_cal.x = (axis_cal_t){ .min = 2000, .max = 63000, .center = 32500 };
    s_cal.y = (axis_cal_t){ .min = 2000, .max = 63000, .center = 32500 };
    s_cal.midi_ch = MIDIMAP_CH_DEFAULT;
}

/* ---------------- MIDI-отправка ---------------- */
static void midi_cc(uint8_t cc, uint8_t val)
{
    uint8_t m[3] = { MIDI_ST_CC(s_cal.midi_ch), cc, (uint8_t)(val & 0x7Fu) };
    bsp_midi_send(m, 3);
    bsp_led_activity_pulse();
}

static void midi_cc14(uint8_t cc_msb, uint8_t cc_lsb, uint16_t v14)
{
    /* Протокол: строго MSB, затем LSB (midi_map.h) */
    midi_cc(cc_msb, midi14_msb(v14));
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

/* ---------------- активность (автоотключение) ---------------- */
static uint32_t s_last_activity_ms;
static void touch_activity(uint32_t now) { s_last_activity_ms = now; }

/* ---------------- обработка осей ---------------- */
typedef struct {
    uint32_t filt;                  /* EMA-состояние (16-bit шкала)        */
    uint16_t last_sent14;
    uint32_t last_sent_ms;
    bool     centered;              /* X: true (deadzone у центра), Y: false */
    const axis_cal_t *cal;
} axis_t;

static axis_t s_ax_x = { .centered = true  };
static axis_t s_ax_y = { .centered = false };

static uint16_t axis_to_14bit(axis_t *a, uint16_t raw)
{
    /* EMA против шума ADC */
    a->filt += ((int32_t)raw - (int32_t)a->filt) >> AXIS_EMA_SHIFT;
    uint16_t v = (uint16_t)a->filt;

    const axis_cal_t *c = a->cal;
    if (v <= c->min) return 0;
    if (v >= c->max) return 16383;

    uint16_t out;
    if (a->centered) {
        /* X: калиброванный центр -> ровно 8192, плечи маппятся независимо */
        if (v >= c->center) {
            out = 8192u + (uint16_t)((uint32_t)(v - c->center) * 8191u / (c->max - c->center));
        } else {
            out = (uint16_t)((uint32_t)(v - c->min) * 8192u / (c->center - c->min));
        }
        /* deadzone вокруг центра — пружина возвращает в честный 0 */
        if (out > 8192u - DEADZONE_14 && out < 8192u + DEADZONE_14) out = 8192u;
    } else {
        /* Y (throttle): весь ход в 0..16383, центра нет */
        out = (uint16_t)((uint32_t)(v - c->min) * 16383u / (c->max - c->min));
    }
    return out;
}

static void axis_task(uint32_t now)
{
    uint16_t x14 = axis_to_14bit(&s_ax_x, bsp_axis_read_x());
    uint16_t y14 = axis_to_14bit(&s_ax_y, bsp_axis_read_y());

#if LINK_MODE == LINK_MODE_Y_DRIVES_BOTH
    extern bool g_link_on;
    if (g_link_on) x14 = y14;
#elif LINK_MODE == LINK_MODE_MIRROR
    extern bool g_link_on;
    if (g_link_on) x14 = 16383u - y14;
#endif

    /* отправка: порог изменения + rate-limit на ось */
    struct { axis_t *a; uint16_t v; uint8_t msb, lsb; } ch[2] = {
        { &s_ax_x, x14, CC_JOY_X_MSB, CC_JOY_X_LSB },
        { &s_ax_y, y14, CC_JOY_Y_MSB, CC_JOY_Y_LSB },
    };
    for (int i = 0; i < 2; i++) {
        uint16_t d = (ch[i].v > ch[i].a->last_sent14)
                   ? (ch[i].v - ch[i].a->last_sent14)
                   : (ch[i].a->last_sent14 - ch[i].v);
        bool edge = (ch[i].v == 0u || ch[i].v == 16383u || ch[i].v == 8192u)
                    && ch[i].v != ch[i].a->last_sent14;   /* края/центр шлём всегда */
        if ((d >= AXIS_CHANGE_MIN || edge)
            && (now - ch[i].a->last_sent_ms) >= AXIS_RATE_LIMIT_MS) {
            midi_cc14(ch[i].msb, ch[i].lsb, ch[i].v);
            ch[i].a->last_sent14  = ch[i].v;
            ch[i].a->last_sent_ms = now;
            touch_activity(now);            /* жест = активность (не только ручки) */
        }
    }
}

/* ---------------- ручки / тумблеры / кнопки ---------------- */
bool g_link_on = false;

typedef struct { bool state; bool raw; uint32_t t_edge; } deb_t;

static bool debounce(deb_t *d, bool raw, uint32_t now)
{
    if (raw != d->raw) { d->raw = raw; d->t_edge = now; }
    if (raw != d->state && (now - d->t_edge) >= DEBOUNCE_MS) {
        d->state = raw;
        return true;                        /* состоялся переход */
    }
    return false;
}

static void slow_task(uint32_t now)
{
    static uint8_t level7 = 0xFF, tone7 = 0xFF;
    static deb_t d_arm, d_link, d_press, d_foot;
    static uint8_t mode_prev = 0xFF;

    /* ручки: 7-bit + гистерезис */
    uint8_t l = (uint8_t)(bsp_knob_read_level() >> 5);   /* 12b -> 7b */
    uint8_t t = (uint8_t)(bsp_knob_read_tone()  >> 5);
    if (level7 == 0xFF || (uint8_t)(l > level7 ? l - level7 : level7 - l) >= KNOB_HYST) {
        level7 = l; midi_cc(CC_LEVEL, l); touch_activity(now);
    }
    if (tone7 == 0xFF || (uint8_t)(t > tone7 ? t - tone7 : tone7 - t) >= KNOB_HYST) {
        tone7 = t; midi_cc(CC_TONE, t); touch_activity(now);
    }

    /* тумблеры */
    if (debounce(&d_arm, bsp_sw_arm(), now)) {
        midi_cc(CC_ARM, d_arm.state ? 127u : 0u);
        bsp_led_arm(d_arm.state);
        touch_activity(now);
    }
    if (debounce(&d_link, bsp_sw_link(), now)) {
        g_link_on = d_link.state;
        midi_cc(CC_LINK, g_link_on ? 127u : 0u);
        touch_activity(now);
    }
    uint8_t mode = bsp_sw_mode();
    if (mode != mode_prev) {                /* 3-poz: дебаунс в bsp-чтении */
        mode_prev = mode;
        static const uint8_t mv[3] = { MODEVAL_SHAPER, MODEVAL_RING, MODEVAL_GATE };
        midi_cc(CC_MODE, mv[mode % 3u]);
        touch_activity(now);
    }

    /* gate-кнопки */
    if (debounce(&d_press, bsp_btn_joy_press(), now)) {
        midi_note(NOTE_JOY_PRESS, d_press.state); touch_activity(now);
    }
    if (debounce(&d_foot, bsp_btn_foot(), now)) {
        midi_note(NOTE_FOOT, d_foot.state); touch_activity(now);
    }

    /* питание */
    bsp_batt_indicator(bsp_fuel_gauge_percent());
    if ((now - s_last_activity_ms) >= IDLE_OFF_MS) bsp_power_off();
}

/* ---------------- сервисная калибровка ----------------
 * Вход: удержание joystick-press при включении.
 * Процедура: прогнать оси по всем крайним, отпустить X в центр, нажать press.
 */
static void calibration_service(void)
{
    axis_cal_t nx = { 0xFFFF, 0, 0 }, ny = { 0xFFFF, 0, 0 };
    while (bsp_btn_joy_press()) { /* ждём отпускания после входа */ }

    while (!bsp_btn_joy_press()) {
        uint16_t x = bsp_axis_read_x(), y = bsp_axis_read_y();
        if (x < nx.min) nx.min = x;
        if (x > nx.max) nx.max = x;
        if (y < ny.min) ny.min = y;
        if (y > ny.max) ny.max = y;
    }
    nx.center = bsp_axis_read_x();          /* X отпущен пружиной в центр */
    ny.center = (uint16_t)(((uint32_t)ny.min + ny.max) / 2u);

    s_cal.x = nx; s_cal.y = ny;
    bsp_flash_save(&s_cal, sizeof s_cal);
}

/* ---------------- main ---------------- */
int main(void)
{
    /* bsp_init() генерится CubeMX (clocks, ADC+oversample, UART 31250,
     * USB-MIDI class, I2C fuel gauge, GPIO) — вызывается до main логики */

    if (!bsp_flash_load(&s_cal, sizeof s_cal) || s_cal.magic != CAL_MAGIC)
        cal_defaults();
    s_ax_x.cal = &s_cal.x;
    s_ax_y.cal = &s_cal.y;

    if (bsp_btn_joy_press())                /* сервисный жест */
        calibration_service();

    /* стартовое состояние — синхронизировать модуль */
    slow_task(bsp_millis());

    uint32_t t_axis = 0, t_slow = 0;
    for (;;) {
        uint32_t now = bsp_millis();
        if (now - t_axis >= AXIS_TICK_MS) { t_axis = now; axis_task(now); }
        if (now - t_slow >= SLOW_TICK_MS) { t_slow = now; slow_task(now); }
        /* TODO: WFI/sleep между тиками для энергосбережения */
    }
}
