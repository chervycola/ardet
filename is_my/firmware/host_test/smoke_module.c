/*
 * smoke_module.c — хост-тест логики модуля без железа (конфиг DJI C5, USB).
 * Включает module/main.c целиком (static-функции доступны), BSP — заглушки.
 * Гоняет настоящий шаг главного цикла module_step() с шагом 1 мс.
 *
 * Проверяет: стартовую нейтраль, 4× 14-bit пары, running status, таймаут LSB,
 * форму mute-рампы (E1), FSM MODE/ROUTE без потери запросов (E3), ARM,
 * мгновенный GATE (E2), realtime-байты и контроль линка (E4), VBUS по CC (E18),
 * dial, deprecated CC, фильтр канала.
 */
#include <stdio.h>
#include <stdlib.h>

#define main module_main
#include "../module/main.c"
#undef main

/* assert, который не выключается NDEBUG и говорит, что именно упало */
#define CHECK(cond) do { if (!(cond)) { \
    fprintf(stderr, "FAIL %s:%d: %s\n", __FILE__, __LINE__, #cond); exit(1); } } while (0)

/* ---------------- BSP-заглушки ---------------- */
static uint32_t t_ms;
uint32_t bsp_millis(void) { return t_ms; }

static uint8_t rxq[8192];
static int rxh, rxt;
bool bsp_midi_rx_pop(uint8_t *o) { if (rxh == rxt) return false; *o = rxq[rxh++]; return true; }
static void push(uint8_t b) { rxq[rxt++] = b; }

static bool usb_up = true;
bool bsp_midi_link_up(void) { return usb_up; }

static bool cc_sink, vbus_on;
static int  vbus_calls;
bool bsp_usb_sink_attached(void) { return cc_sink; }
void bsp_vbus_enable(bool on)    { vbus_on = on; vbus_calls++; }

static uint32_t last_dac[8];
static int      dac_writes[8];
void bsp_dac_write32(uint32_t f)
{
    uint8_t cmd = (f >> 24) & 0xFu;
    if (cmd == 0x3u) {
        uint8_t ch = (f >> 20) & 0xFu;
        last_dac[ch] = (f >> 4) & 0xFFFFu;
        dac_writes[ch]++;
    }
}

static uint8_t mux_mode = 99;
static bool mux_pre;
static int  mux_calls;
static uint32_t mute_at_switch = 0xFFFFFFFFu;
void bsp_mux_set_mode(uint8_t m) { mux_mode = m; mux_calls++; mute_at_switch = last_dac[DAC_CH_MUTE]; }
void bsp_mux_set_route(bool p)   { mux_pre = p; }

static bool sw_route;
bool bsp_sw_route_pre(void)      { return sw_route; }
void bsp_led_activity_pulse(void){}
void bsp_led_arm(bool on)        { (void)on; }
static bool led_link;
void bsp_led_link(bool ok)       { led_link = ok; }
bool bsp_flash_load(void *d, uint32_t l)       { (void)d; (void)l; return false; }
bool bsp_flash_save(const void *s, uint32_t l) { (void)s; (void)l; return true;  }

/* ---------------- помощники ---------------- */
static void step(void) { t_ms++; module_step(t_ms); }
static void run(int ms) { for (int i = 0; i < ms; i++) step(); }

/* шаг с heartbeat пульта: линк остаётся живым, как в настоящей работе */
static void run_alive(int ms)
{
    for (int i = 0; i < ms; i++) {
        if ((t_ms % 100u) == 0u) push(MIDI_RT_ACTIVE_SENSE);
        step();
    }
}

/* Прогоняет ms миллисекунд и проверяет, что код mute-канала за один шаг
 * меняется не больше max_step. Возвращает число смен направления.          */
static int run_watch_mute(int ms, uint32_t max_step)
{
    int dir = 0, turns = 0;
    uint32_t prev = last_dac[DAC_CH_MUTE];
    for (int i = 0; i < ms; i++) {
        if ((t_ms % 100u) == 0u) push(MIDI_RT_ACTIVE_SENSE);
        step();
        uint32_t v = last_dac[DAC_CH_MUTE];
        uint32_t d = v > prev ? v - prev : prev - v;
        CHECK(d <= max_step);
        int nd = v > prev ? 1 : v < prev ? -1 : 0;
        if (nd != 0 && dir != 0 && nd != dir) turns++;
        if (nd != 0) dir = nd;
        prev = v;
    }
    return turns;
}

/* самый крутой шаг smoothstep за 1 мс: 1.5/RAMP_MS от полного кода (+запас) */
#define MAX_RAMP_STEP ((uint32_t)(65535u * 3u / (2u * RAMP_MS) + 64u))

int main(void)
{
    /* ============ старт: safe-state и нейтраль осей (D1) ============ */
    sw_route = false;
    module_init();
    CHECK(vbus_on == false && vbus_calls == 1);          /* порт обесточен до детекта CC */
    CHECK(last_dac[DAC_CH_MUTE] == 0);                    /* mute */
    CHECK(last_dac[DAC_CH_GATE] == 0);
    CHECK(last_dac[DAC_CH_Y_DRIVE] == 0);                 /* rate-оси с нуля: 0 В */
    CHECK(last_dac[DAC_CH_CUTOFF]  == 0);
    CHECK(last_dac[DAC_CH_X_BIAS]  == 32768);             /* momentary в центре: 0 В */
    CHECK(last_dac[DAC_CH_RESO]    == 32768);
    CHECK(last_dac[DAC_CH_DIAL]    == 32768);             /* dial в центре: MIX без офсета */
    CHECK(last_dac[DAC_CH_IQREF]   == 720);
    CHECK(mux_mode == 0 && mux_pre == false);

    /* ============ E1: форма рампы ============ */
    {
        uint16_t prev = 65535;
        for (uint32_t ms = 0; ms <= RAMP_MS; ms++) {      /* вниз: монотонно, плавно */
            uint16_t v = ramp_shape(ms, 65535, 0);
            CHECK(v <= prev);
            CHECK((uint32_t)(prev - v) <= MAX_RAMP_STEP);
            prev = v;
        }
        CHECK(ramp_shape(0, 65535, 0) == 65535);
        CHECK(ramp_shape(RAMP_MS, 65535, 0) == 0);
        uint16_t mid = ramp_shape(RAMP_MS / 2, 65535, 0); /* середина = половина */
        CHECK(mid > 32767 - 400 && mid < 32767 + 400);
        CHECK(ramp_shape(1, 65535, 0) > 65535 - 400);     /* старт мягкий, не ступенька */
        CHECK(ramp_shape(RAMP_MS - 1, 65535, 0) < 400);   /* и финиш мягкий */
        prev = 0;
        for (uint32_t ms = 0; ms <= RAMP_MS; ms++) {      /* вверх: зеркально */
            uint16_t v = ramp_shape(ms, 0, 65535);
            CHECK(v >= prev);
            prev = v;
        }
        CHECK(prev == 65535);
    }

    /* ============ 14-bit пары, running status, чужой канал ============ */
    push(MIDI_ST_CC(0));
    push(CC_JOY_X_MSB); push(64);
    push(CC_JOY_X_LSB); push(0);
    step();
    CHECK(s_pairs[0].v14 == 8192);
    CHECK(last_dac[DAC_CH_X_BIAS] == 32768);

    push(CC_JOY_Y_MSB); push(127);                        /* running status */
    push(CC_JOY_Y_LSB); push(127);
    step();
    CHECK(s_pairs[1].v14 == 16383);

    push(CC_CUT_MSB);  push(100);
    push(CC_CUT_LSB);  push(3);
    step();
    CHECK(s_pairs[3].v14 == midi14_join(100, 3));
    CHECK(last_dac[DAC_CH_CUTOFF] == apply_cal(DAC_CH_CUTOFF, midi14_join(100, 3)));

    /* realtime-байт посреди сообщения не ломает running status (E4) */
    push(CC_RESO_MSB); push(MIDI_RT_ACTIVE_SENSE); push(90);
    push(CC_RESO_LSB); push(MIDI_RT_ACTIVE_SENSE); push(7);
    step();
    CHECK(s_pairs[2].v14 == midi14_join(90, 7));

    /* MSB без LSB: применяется грубо по таймауту, через настоящий шаг цикла */
    push(CC_RESO_MSB); push(32);                          /* 32<<7 = 4096 */
    step();
    CHECK(s_pairs[2].v14 == midi14_join(90, 7));          /* ещё ждём LSB */
    run_alive((int)LSB_WAIT_TIMEOUT_MS + 1);
    CHECK(s_pairs[2].v14 == 4096);

    {   /* чужой канал игнорируется */
        uint16_t x_before = s_pairs[0].v14;
        push(MIDI_ST_CC(5));
        push(CC_JOY_X_MSB); push(1);
        push(CC_JOY_X_LSB); push(1);
        step();
        CHECK(s_pairs[0].v14 == x_before);
        push(MIDI_ST_CC(0));                              /* вернуть наш статус */
    }

    /* ============ ARM on: плавный подъём, без ступеньки ============ */
    push(CC_ARM); push(127);
    step();
    CHECK(s_p.arm);
    (void)run_watch_mute(60, 65535u / RAMP_MS + 64u);
    CHECK(last_dac[DAC_CH_MUTE] == 0xFFFFu);

    /* ============ MODE -> RING: вниз, переключение в тишине, вверх ============ */
    mux_calls = 0; mute_at_switch = 0xFFFFFFFFu;
    push(CC_MODE); push(MODEVAL_RING);
    step();
    CHECK(s_fsm.mode_req == 1);
    {
        int turns = run_watch_mute(120, MAX_RAMP_STEP);
        CHECK(turns == 1);                                /* один провал: вниз и обратно */
    }
    CHECK(mux_calls == 1 && mux_mode == 1);
    CHECK(mute_at_switch == 0);                           /* ключи щёлкнули в полной тишине */
    CHECK(s_fsm.st == FSM_RUN && s_fsm.mode_now == 1);
    CHECK(last_dac[DAC_CH_MUTE] == 0xFFFFu);

    /* ============ E3: второй MODE во время подъёма не теряется ============ */
    mux_calls = 0;
    push(CC_MODE); push(MODEVAL_GATE);
    step();
    while (s_fsm.st != FSM_UP) { push(MIDI_RT_ACTIVE_SENSE); step(); }
    run_alive(5);                                         /* посреди FSM_UP */
    CHECK(s_fsm.st == FSM_UP && s_fsm.mode_now == 2);
    push(CC_MODE); push(MODEVAL_SHAPER);                  /* новый запрос на подъёме */
    step();
    (void)run_watch_mute(250, MAX_RAMP_STEP);
    CHECK(s_fsm.st == FSM_RUN);
    CHECK(s_fsm.mode_now == 0 && mux_mode == 0);          /* исполнен последний запрос */
    CHECK(mux_calls == 2);                                /* два честных цикла */
    CHECK(last_dac[DAC_CH_MUTE] == 0xFFFFu);

    /* запрос сменился ещё на спуске: переключаемся один раз, сразу в последний */
    mux_calls = 0;
    push(CC_MODE); push(MODEVAL_RING);
    step();
    run_alive(10);
    CHECK(s_fsm.st == FSM_DOWN);
    push(CC_MODE); push(MODEVAL_GATE);
    step();
    (void)run_watch_mute(200, MAX_RAMP_STEP);
    CHECK(mux_calls == 1 && mux_mode == 2 && s_fsm.mode_now == 2);

    /* ============ ROUTE с панели — та же FSM ============ */
    mux_calls = 0; mute_at_switch = 0xFFFFFFFFu;
    sw_route = true;
    (void)run_watch_mute(150, MAX_RAMP_STEP);
    CHECK(mux_calls == 1 && mux_pre == true && s_fsm.route_now == true);
    CHECK(mute_at_switch == 0);
    CHECK(last_dac[DAC_CH_MUTE] == 0xFFFFu);

    /* ============ ARM off посреди подъёма: без скачка ============ */
    push(CC_MODE); push(MODEVAL_SHAPER);
    step();
    while (s_fsm.st != FSM_UP) { push(MIDI_RT_ACTIVE_SENSE); step(); }
    run_alive(15);                                        /* уровень около середины */
    CHECK(last_dac[DAC_CH_MUTE] > 10000u && last_dac[DAC_CH_MUTE] < 55000u);
    push(CC_ARM); push(0);
    (void)run_watch_mute(80, MAX_RAMP_STEP);              /* шаг не больше обычного */
    CHECK(last_dac[DAC_CH_MUTE] == 0);
    CHECK(s_fsm.st == FSM_RUN && s_fsm.mode_now == 0);

    /* под ARM off режим меняется без ожидания рампы вниз (и так тишина) */
    mux_calls = 0;
    push(CC_MODE); push(MODEVAL_RING);
    step();
    run_alive(3);
    CHECK(mux_calls == 1 && mux_mode == 1);
    run_alive(100);
    CHECK(last_dac[DAC_CH_MUTE] == 0);

    /* ============ E2: GATE — сразу и одной записью ============ */
    {
        int w0 = dac_writes[DAC_CH_GATE];
        push(MIDI_ST_NOTE_ON(0)); push(NOTE_JOY_PRESS); push(NOTE_VELOCITY);
        step();                                           /* тот же шаг цикла */
        CHECK(last_dac[DAC_CH_GATE] == apply_cal(DAC_CH_GATE, AXIS14_MAX));
        CHECK(dac_writes[DAC_CH_GATE] == w0 + 1);
        run_alive(20);
        CHECK(dac_writes[DAC_CH_GATE] == w0 + 1);         /* никакого «доползания» */
        push(MIDI_ST_NOTE_OFF(0)); push(NOTE_JOY_PRESS); push(0);
        step();
        CHECK(last_dac[DAC_CH_GATE] == 0);
        CHECK(dac_writes[DAC_CH_GATE] == w0 + 2);
        push(MIDI_ST_CC(0));
    }

    /* ============ dial и deprecated CC ============ */
    push(CC_DIAL); push(100);
    step();
    CHECK(last_dac[DAC_CH_DIAL] == apply_cal(DAC_CH_DIAL, 100u << 7));
    {
        uint32_t cut_before = last_dac[DAC_CH_CUTOFF], reso_before = last_dac[DAC_CH_RESO];
        push(CC_LEVEL); push(1);
        push(CC_TONE);  push(1);
        step();
        CHECK(last_dac[DAC_CH_CUTOFF] == cut_before);
        CHECK(last_dac[DAC_CH_RESO]  == reso_before);
    }

    /* ============ E4: линк ============ */
    run_alive(50);
    CHECK(s_p.link_ok && led_link);
    /* стики неподвижны, но heartbeat идёт: линк жив сколько угодно */
    run_alive(3000);
    CHECK(s_p.link_ok);
    /* нажали GATE и пульт замолчал: линк потерян, оси держатся, GATE отпущен */
    push(MIDI_ST_NOTE_ON(0)); push(NOTE_JOY_PRESS); push(NOTE_VELOCITY);
    step();
    CHECK(last_dac[DAC_CH_GATE] != 0);
    {
        uint32_t drive_before = last_dac[DAC_CH_Y_DRIVE], cut_before = last_dac[DAC_CH_CUTOFF];
        run((int)MIDI_LINK_TIMEOUT_MS - 10);
        CHECK(s_p.link_ok);                               /* ещё не таймаут */
        run(20);
        CHECK(!s_p.link_ok && !led_link);
        CHECK(last_dac[DAC_CH_GATE] == 0);                /* не залип */
        CHECK(last_dac[DAC_CH_Y_DRIVE] == drive_before);  /* значения держим */
        CHECK(last_dac[DAC_CH_CUTOFF]  == cut_before);
    }
    /* один realtime-байт возвращает линк */
    push(MIDI_RT_ACTIVE_SENSE);
    step();
    CHECK(s_p.link_ok && led_link);
    /* USB-стек сообщил об отключении: линк падает сразу, не дожидаясь таймаута */
    usb_up = false;
    step();
    CHECK(!s_p.link_ok);
    /* переподключение: свежая энумерация даёт таймауту новый отсчёт */
    run(2000);
    usb_up = true;
    step();
    CHECK(s_p.link_ok);

    /* ============ E18: VBUS только по детекту Rd на CC ============ */
    vbus_calls = 0;
    run_alive(100);
    CHECK(vbus_on == false && vbus_calls == 0);           /* устройства нет — 5 В не подаём */
    cc_sink = true;
    step();
    CHECK(vbus_on == true && vbus_calls == 1);
    run_alive(100);
    CHECK(vbus_calls == 1);                               /* без дребезга по EN */
    cc_sink = false;
    step();
    CHECK(vbus_on == false && vbus_calls == 2);

    printf("module smoke OK (neutral start, 4 pairs, running status + realtime, LSB timeout, "
           "ramp shape, FSM MODE/ROUTE incl. mid-ramp requests, ARM, instant GATE, link, VBUS/CC, "
           "dial, deprecated CC, channel filter)\n");
    return 0;
}
