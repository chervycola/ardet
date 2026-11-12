/*
 * main.c (module) — скелет прошивки модуля Is My (02_technical.md §C3, It-2/3).
 *
 * Линк с пультом — USB (модуль = host, 05_pult_dji_c5.md §4.1): BSP отдаёт
 * сырые MIDI-байты. Здесь: парсер (running status, 14-bit пары MSB->LSB
 * с таймаутом), калибровка -> DAC8568, FSM mute для MODE и ROUTE, ARM как
 * глобальный gate enable, контроль линка, питание пульта по детекту CC.
 *
 * Safe-state при старте: mute, оси в нейтрали, VBUS выключен.
 */
#include <string.h>
#include "../common/midi_map.h"
#include "bsp.h"
#include "dac8568.h"

/* ---------------- конфигурация ---------------- */
#define CTRL_TICK_MS      1u        /* контрольный цикл ~1 кГц (ramp/таймауты)      */
#define RAMP_MS           30u       /* mute ramp down/up (A7: 20-40 мс)             */
#define SWITCH_SETTLE_MS  10u       /* реле и ключи топологии успокаиваются в тишине */

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
    int32_t code = (int32_t)(((int64_t)v14 * s_cal.ch[ch].scale_q16) / 65536) + s_cal.ch[ch].offset;
    if (code < 0) code = 0;
    if (code > 65535) code = 65535;
    return (uint16_t)code;
}

/* ---------------- 14-bit пары: таблица осей DJI ----------------
 * Стартовые значения = нейтраль каждой оси (решение D1, S9.1):
 *   rate-оси DRIVE/CUTOFF  — 0     -> 0 В  (шкала 0…+5 В)
 *   momentary BIAS/RESO    — центр -> 0 В  (шкала ±5 В)                    */
typedef struct {
    uint8_t  cc_msb, cc_lsb;
    uint8_t  dac_ch;
    uint16_t v14;
} pair_t;

static pair_t s_pairs[4] = {
    { CC_JOY_X_MSB, CC_JOY_X_LSB, DAC_CH_X_BIAS,  AXIS14_CENTER },  /* левый X  BIAS   */
    { CC_JOY_Y_MSB, CC_JOY_Y_LSB, DAC_CH_Y_DRIVE, 0             },  /* левый Y  DRIVE  */
    { CC_RESO_MSB,  CC_RESO_LSB,  DAC_CH_RESO,    AXIS14_CENTER },  /* правый X RESO   */
    { CC_CUT_MSB,   CC_CUT_LSB,   DAC_CH_CUTOFF,  0             },  /* правый Y CUTOFF */
};

static pair_t *pair_by_msb(uint8_t cc)
{
    for (int i = 0; i < 4; i++)
        if (s_pairs[i].cc_msb == cc) return &s_pairs[i];
    return 0;
}

static pair_t *pair_by_lsb(uint8_t cc)
{
    for (int i = 0; i < 4; i++)
        if (s_pairs[i].cc_lsb == cc) return &s_pairs[i];
    return 0;
}

/* ---------------- состояние параметров ---------------- */
typedef struct {
    bool     arm;
    bool     link;                  /* LINK-тумблер пульта (логика связи осей — на пульте) */
    bool     gate;                  /* shutter-кнопка   */
    uint32_t last_rx_ms;            /* последний принятый байт, включая realtime */
    bool     usb_up_prev;
    bool     link_ok;               /* пульт на связи */
    bool     vbus_on;
} params_t;

static params_t s_p;

/* ---------------- FSM mute (MODE + ROUTE, A7) ----------------
 * Запросы только выставляют цели (mode_req/route_req). Автомат сам уходит
 * в цикл «вниз -> переключение -> пауза -> вверх», когда цель расходится
 * с текущим состоянием, и перепроверяет цели, вернувшись в RUN: запрос,
 * пришедший во время рампы, не теряется (E3).                             */
typedef enum { FSM_RUN, FSM_DOWN, FSM_SETTLE, FSM_UP } fsm_state_t;

static struct {
    fsm_state_t st;
    uint32_t    t0;                 /* начало текущей фазы                    */
    uint32_t    t_prev;             /* предыдущий тик (слева ARM по времени)   */
    uint16_t    level_now;          /* текущий код mute-каскада VCA (кан. F)  */
    uint16_t    ramp_from;          /* уровень в начале рампы вниз            */
    uint16_t    ramp_to;            /* цель рампы вверх, защёлкнута на входе  */
    uint8_t     mode_now,  mode_req;
    bool        route_now, route_req;
} s_fsm = { .st = FSM_RUN };

static uint16_t mute_target(void)
{
    /* ARM off -> 0; on -> полный код. Канал F управляет только вторым каскадом
     * выходного VCA (mute). LEVEL — отдельный первый каскад, чисто аналоговый
     * (03_schematics S8). У каскада порог открывания ~0,65 В на управлении:
     * нижние ~16 % кода дают тишину, слышимая часть рампы лежит выше.       */
    return s_p.arm ? 0xFFFFu : 0u;
}

static void mute_write(uint16_t v)
{
    s_fsm.level_now = v;
    dac8568_write(DAC_CH_MUTE, v);
}

/* S-образная рампа без щелчка (A7): smoothstep 3x^2 - 2x^3 в Q15.
 * elapsed в мс; при elapsed >= RAMP_MS возвращает to.                      */
static uint16_t ramp_shape(uint32_t elapsed, uint16_t from, uint16_t to)
{
    if (elapsed >= RAMP_MS) return to;
    uint32_t x = (elapsed << 15) / RAMP_MS;                           /* Q15, 0..32767 */
    /* x*x — Q30, скобка — Q15, произведение — Q45; сдвиг 30 возвращает Q15 */
    uint32_t s = (uint32_t)(((uint64_t)x * x * (3u * 32768u - 2u * x)) >> 30);
    int32_t  d = (int32_t)to - (int32_t)from;
    return (uint16_t)((int32_t)from + (int32_t)(((int64_t)d * (int64_t)s) / 32768));
}

static void fsm_tick(uint32_t now)
{
    switch (s_fsm.st) {
    case FSM_RUN: {
        if (s_fsm.mode_req != s_fsm.mode_now || s_fsm.route_req != s_fsm.route_now) {
            s_fsm.ramp_from = s_fsm.level_now;
            s_fsm.t0 = now;
            s_fsm.st = FSM_DOWN;
            break;
        }
        /* ARM on/off вне смены режима — линейный слев к цели за ~RAMP_MS */
        uint16_t tgt = mute_target();
        if (s_fsm.level_now != tgt) {
            uint32_t dt = now - s_fsm.t_prev;
            if (dt == 0u) dt = 1u;
            if (dt > RAMP_MS) dt = RAMP_MS;
            int32_t step = (int32_t)((0xFFFFu * dt) / RAMP_MS);
            int32_t v = (int32_t)s_fsm.level_now;
            if ((int32_t)tgt > v) { v += step; if (v > (int32_t)tgt) v = (int32_t)tgt; }
            else                  { v -= step; if (v < (int32_t)tgt) v = (int32_t)tgt; }
            mute_write((uint16_t)v);
        }
        break;
    }
    case FSM_DOWN: {
        uint32_t el = now - s_fsm.t0;
        mute_write(ramp_shape(el, s_fsm.ramp_from, 0));
        if (el >= RAMP_MS || s_fsm.ramp_from == 0u) {
            /* тишина: применяем цели, какими они стали к этому моменту */
            mute_write(0);
            bsp_mux_set_mode(s_fsm.mode_req);
            bsp_mux_set_route(s_fsm.route_req);
            s_fsm.mode_now  = s_fsm.mode_req;
            s_fsm.route_now = s_fsm.route_req;
            /* TODO: сброс узлов нового режима (фаза VCO, детектор GATE) */
            s_fsm.t0 = now;
            s_fsm.st = FSM_SETTLE;
        }
        break;
    }
    case FSM_SETTLE:
        if (now - s_fsm.t0 >= SWITCH_SETTLE_MS) {
            s_fsm.ramp_to = mute_target();
            s_fsm.t0 = now;
            s_fsm.st = FSM_UP;
        }
        break;
    case FSM_UP: {
        /* ARM сменился посреди подъёма — не дёргаем цель рампы (щелчок),
         * а отдаём управление слеву в RUN с текущего уровня.               */
        if (mute_target() != s_fsm.ramp_to) { s_fsm.st = FSM_RUN; break; }
        uint32_t el = now - s_fsm.t0;
        mute_write(ramp_shape(el, 0, s_fsm.ramp_to));
        if (el >= RAMP_MS) s_fsm.st = FSM_RUN;    /* RUN перепроверит цели (E3) */
        break;
    }
    }
    s_fsm.t_prev = now;
}

/* ---------------- применение параметров к ЦАП ---------------- */
static void pair_apply(pair_t *p, uint16_t v14)
{
    p->v14 = v14;
    dac8568_write(p->dac_ch, apply_cal(p->dac_ch, v14));
}

static void apply_axes(void)
{
    for (int i = 0; i < 4; i++) pair_apply(&s_pairs[i], s_pairs[i].v14);
}

/* GATE — ступенькой и сразу по событию: фронт формирует RC 1k+100n на выходе
 * канала (S9.1), это ~0,2 мс — и де-клик, и запас до критерия «< 1 мс».    */
static void gate_apply(void)
{
    dac8568_write(DAC_CH_GATE, s_p.gate ? apply_cal(DAC_CH_GATE, AXIS14_MAX) : 0u);
}

/* ---------------- MIDI-парсер (running status + 14-bit) ---------------- */
typedef struct {
    uint8_t status;                 /* текущий running status              */
    uint8_t data[2];
    uint8_t n_data;
    /* 14-bit ожидание LSB */
    pair_t  *wait_pair;             /* NULL = не ждём                      */
    uint8_t  msb_cache;
    uint32_t msb_ms;
} parser_t;

static parser_t s_par;

static void on_cc(uint8_t cc, uint8_t val, uint32_t now);
static void on_note(uint8_t note, bool on);

static void midi_byte(uint8_t b, uint32_t now)
{
    s_p.last_rx_ms = now;                       /* любой байт = линк жив (E4) */

    if (b >= 0xF8u) return;                     /* realtime (в т.ч. 0xFE): статус не трогаем */
    if (b & 0x80u) {                            /* статус-байт */
        s_par.status = (b < 0xF0u) ? b : 0u;    /* system common отменяет running status */
        s_par.n_data = 0;
        return;
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
        bsp_led_activity_pulse();
    }
}

static void on_cc(uint8_t cc, uint8_t val, uint32_t now)
{
    /* --- 14-bit пары (таблица s_pairs): MSB кэшируется, применяется по LSB --- */
    pair_t *pm = pair_by_msb(cc);
    if (pm) {
        /* ждали другой LSB — применить незакрытый MSB грубо */
        if (s_par.wait_pair)
            pair_apply(s_par.wait_pair, (uint16_t)s_par.msb_cache << 7);
        s_par.wait_pair = pm;
        s_par.msb_cache = val;
        s_par.msb_ms    = now;
        return;
    }
    pair_t *pl = pair_by_lsb(cc);
    if (pl) {
        if (s_par.wait_pair == pl) {
            pair_apply(pl, midi14_join(s_par.msb_cache, val));
            s_par.wait_pair = 0;
        }
        /* LSB без MSB — игнор (защита от рассинхрона) */
        return;
    }

    switch (cc) {
    case CC_ARM:
        s_p.arm = (val >= 64u);
        bsp_led_arm(s_p.arm);
        break;
    case CC_MODE:                                  /* цель; FSM сам сравнит с текущим */
        s_fsm.mode_req = (val < 32u) ? 0u : (val < 96u) ? 1u : 2u;
        break;
    case CC_LINK: s_p.link = (val >= 64u); break;  /* линк-логика на пульте */
    case CC_DIAL:                                  /* dial -> нормаль MIX-in */
        dac8568_write(DAC_CH_DIAL, apply_cal(DAC_CH_DIAL, (uint16_t)val << 7));
        break;
    /* CC_LEVEL / CC_TONE — deprecated: ручки модуля, MIDI игнорируется */
    default: break;
    }
}

static void on_note(uint8_t note, bool on)
{
    if (note == NOTE_JOY_PRESS || note == NOTE_FOOT) {
        s_p.gate = on;
        gate_apply();
    }
}

/* ---------------- линк и питание пульта ---------------- */

/* Линк жив, если USB-стек видит устройство И байты (хотя бы Active Sensing)
 * идут чаще MIDI_LINK_TIMEOUT_MS. При потере значения осей держим как есть,
 * но GATE отпускаем — иначе нажатая в момент обрыва кнопка залипнет.       */
static void link_task(uint32_t now)
{
    bool up = bsp_midi_link_up();
    if (up && !s_p.usb_up_prev) s_p.last_rx_ms = now;   /* свежая энумерация */
    s_p.usb_up_prev = up;

    bool ok = up && (now - s_p.last_rx_ms) < MIDI_LINK_TIMEOUT_MS;
    if (ok != s_p.link_ok) {
        s_p.link_ok = ok;
        bsp_led_link(ok);
        if (!ok && s_p.gate) { s_p.gate = false; gate_apply(); }
    }
}

/* VBUS подаём только настоящему устройству: Rd на CC (S11.2, E18). */
static void usb_power_task(void)
{
    bool sink = bsp_usb_sink_attached();
    if (sink != s_p.vbus_on) {
        s_p.vbus_on = sink;
        bsp_vbus_enable(sink);
    }
}

/* ---------------- init / шаг главного цикла ---------------- */
static uint32_t s_t_ctrl;

static void module_init(void)
{
    if (!bsp_flash_load(&s_cal, sizeof s_cal) || s_cal.magic != CAL_MAGIC)
        cal_defaults();

    bsp_vbus_enable(false);                     /* до детекта CC порт обесточен */
    bsp_led_link(false);

    dac8568_init_external_ref();
    dac8568_write(DAC_CH_MUTE, 0);              /* safe-state: mute */
    dac8568_write(DAC_CH_IQREF, s_cal.iq_ref_code);
    dac8568_write(DAC_CH_GATE, 0);
    dac8568_write(DAC_CH_DIAL, apply_cal(DAC_CH_DIAL, (uint16_t)DIAL7_CENTER << 7));
    apply_axes();                               /* оси в нейтрали (D1) */

    /* топология: SHAPER; порядок блоков — как стоит панельный свитч */
    bool rp = bsp_sw_route_pre();
    bsp_mux_set_mode(0);
    bsp_mux_set_route(rp);
    s_fsm.mode_now  = s_fsm.mode_req  = 0;
    s_fsm.route_now = s_fsm.route_req = rp;

    s_t_ctrl = s_fsm.t_prev = bsp_millis();
}

static void module_step(uint32_t now)
{
    /* MIDI: вычерпать кольцевой буфер */
    uint8_t b;
    while (bsp_midi_rx_pop(&b)) midi_byte(b, now);

    /* незакрытый MSB по таймауту применяем грубо (MSB<<7) */
    if (s_par.wait_pair && (now - s_par.msb_ms) >= LSB_WAIT_TIMEOUT_MS) {
        pair_apply(s_par.wait_pair, (uint16_t)s_par.msb_cache << 7);
        s_par.wait_pair = 0;
    }

    if (now - s_t_ctrl >= CTRL_TICK_MS) {
        s_t_ctrl = now;
        s_fsm.route_req = bsp_sw_route_pre();   /* панельный ROUTE -> та же FSM, что и MODE */
        fsm_tick(now);
        link_task(now);
        usb_power_task();
    }
}

int main(void)
{
    /* bsp_init(): clocks, SPI (DAC8568, USB-host), GPIO ключей/реле/LED, ADC линий CC */
    module_init();
    for (;;) module_step(bsp_millis());
}
