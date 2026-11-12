/*
 * smoke_pult.c — хост-тест логики пульта без железа (донор DJI C5).
 * Включает pult/main.c целиком, BSP — заглушки; гоняет настоящий шаг
 * главного цикла pult_step().
 *
 * Проверяет: стартовый снапшот, rate-ось считает время, а не вызовы (E5),
 * потолок dt после провала цикла, deadzone, momentary-ось и возврат в центр,
 * защиту от битой калибровки и саму калибровку (усреднение центра, отказ),
 * Active Sensing (E4), порядок MSB -> LSB.
 */
#include <stdio.h>
#include <stdlib.h>

#define main pult_main
#include "../pult/main.c"
#undef main

#define CHECK(cond) do { if (!(cond)) { \
    fprintf(stderr, "FAIL %s:%d: %s\n", __FILE__, __LINE__, #cond); exit(1); } } while (0)

/* ---------------- BSP-заглушки ---------------- */
static uint32_t t_ms;
uint32_t bsp_millis(void) { return t_ms; }

/* оси: в обычной работе — заданное значение; в калибровке — сценарий */
static uint16_t raw_ax[4] = { 32500, 32500, 32500, 32500 };   /* lx, ly, rx, ry */
static int  cal_phase;        /* 0 = обычная работа, 1 = прогон по краям, 2 = стики в центре */
static bool cal_no_travel;    /* сценарий «оси не трогали» */
static uint32_t cal_reads[4]; /* счётчик чтений на каждую ось */

static uint16_t axis_read(int i)
{
    if (cal_phase == 1) {
        if (cal_no_travel) return 32500;
        return (cal_reads[i]++ & 1u) ? 3000 : 62000;          /* качаем от края до края */
    }
    if (cal_phase == 2)
        return (uint16_t)(32500 + ((cal_reads[i]++ & 1u) ? 40 : -40) + i * 100);  /* шумящий центр */
    return raw_ax[i];
}
uint16_t bsp_axis_read_lx(void) { return axis_read(0); }
uint16_t bsp_axis_read_ly(void) { return axis_read(1); }
uint16_t bsp_axis_read_rx(void) { return axis_read(2); }
uint16_t bsp_axis_read_ry(void) { return axis_read(3); }

static uint16_t dial_raw = 2048;
uint16_t bsp_dial_read(void) { return dial_raw; }
uint8_t  bsp_sw_mode(void)   { return 0; }
bool bsp_btn_arm(void)  { return false; }
bool bsp_btn_link(void) { return false; }
bool bsp_btn_gate(void) { return false; }

/* Power: сценарий калибровки по счётчику вызовов */
static int power_script;      /* 0 = не нажата; >0 = идёт сценарий */
static int power_calls;
bool bsp_btn_power(void)
{
    if (!power_script) return false;
    power_calls++;
    if (power_calls <= 3)   return true;                      /* удержание при включении */
    if (power_calls <= 203) { cal_phase = 1; return false; }  /* отпущена: гоняем оси */
    cal_phase = 2;                                            /* нажата снова: стики в центре */
    return true;
}

/* MIDI-выход: разбираем, что ушло */
static int      as_count, msg_count;
static uint16_t sent14[4];                 /* по индексу (cc_msb - 16) */
static int      sent14_n[4];
static uint8_t  pend_msb_cc = 0xFF, pend_msb_val;
static bool     order_ok = true;
static uint8_t  last_cc[128];
static bool     seen_cc[128];

void bsp_midi_send(const uint8_t *b, uint8_t len)
{
    if (len == 1) { if (b[0] == MIDI_RT_ACTIVE_SENSE) as_count++; return; }
    msg_count++;
    if (len != 3 || (b[0] & 0xF0u) != 0xB0u) { if (pend_msb_cc != 0xFF) order_ok = false; return; }
    uint8_t cc = b[1], val = b[2];
    seen_cc[cc] = true; last_cc[cc] = val;
    if (cc >= 16 && cc <= 19) {                               /* MSB оси */
        if (pend_msb_cc != 0xFF) order_ok = false;            /* предыдущая пара не закрыта */
        pend_msb_cc = cc; pend_msb_val = val;
    } else if (cc >= 48 && cc <= 51) {                        /* LSB оси */
        if (pend_msb_cc != cc - 32) order_ok = false;         /* LSB строго за своим MSB */
        else { sent14[cc - 48] = midi14_join(pend_msb_val, val); sent14_n[cc - 48]++; }
        pend_msb_cc = 0xFF;
    } else if (pend_msb_cc != 0xFF) {
        order_ok = false;                                     /* между MSB и LSB влезло чужое */
    }
}

void bsp_led(uint8_t idx, bool on) { (void)idx; (void)on; }
void bsp_led_activity_pulse(void)  {}
static int flash_saves;
bool bsp_flash_load(void *d, uint32_t l)       { (void)d; (void)l; return false; }
bool bsp_flash_save(const void *s, uint32_t l) { (void)s; (void)l; flash_saves++; return true; }

/* ---------------- помощники ---------------- */
enum { LX = 0, LY = 1, RX = 2, RY = 3 };   /* индексы s_ax: [0] lx BIAS, [1] ly DRIVE, [2] rx RESO, [3] ry CUTOFF */
#define IDX_BIAS  0
#define IDX_DRIVE 1

static void run(uint32_t ms, uint32_t step_ms)
{
    for (uint32_t el = 0; el < ms; el += step_ms) { t_ms += step_ms; pult_step(t_ms); }
}

/* поставить ось в известное состояние: фильтр уже сошёлся, интегратор в нуле */
static void settle_axis(int i, uint16_t raw)
{
    raw_ax[i] = raw;
    s_ax[i].filt = raw;
    s_ax[i].pos_q16 = 0;
}

int main(void)
{
    /* ============ старт и снапшот ============ */
    pult_init();
    CHECK(axis_cal_valid(&s_cal.lx) && axis_cal_valid(&s_cal.ry));   /* дефолты годны */
    CHECK(seen_cc[CC_ARM] && last_cc[CC_ARM] == 0);
    CHECK(seen_cc[CC_LINK] && seen_cc[CC_MODE] && seen_cc[CC_DIAL]);
    /* sent14[] идёт по номерам CC: 16 BIAS, 17 DRIVE, 18 CUTOFF, 19 RESO */
    CHECK(sent14_n[0] == 1 && sent14[0] == AXIS14_CENTER);    /* BIAS в центре   */
    CHECK(sent14_n[1] == 1 && sent14[1] == 0);                /* DRIVE с нуля    */
    CHECK(sent14_n[2] == 1 && sent14[2] == 0);                /* CUTOFF с нуля   */
    CHECK(sent14_n[3] == 1 && sent14[3] == AXIS14_CENTER);    /* RESO в центре   */

    for (int i = 0; i < 4; i++) settle_axis(i, 32500);
    run(50, 1);

    /* ============ E5: rate-ось считает время, а не вызовы ============ */
    /* полное отклонение 600 мс = половина шкалы (полный ход за RATE_FULL_MS) */
    settle_axis(LY, 63000);
    run(600, 1);                                              /* 600 вызовов по 1 мс */
    uint16_t a = (uint16_t)(s_ax[IDX_DRIVE].pos_q16 >> 16);
    CHECK(a > 8191 - 150 && a < 8191 + 150);

    settle_axis(LY, 63000);
    run(600, 10);                                             /* 60 вызовов по 10 мс */
    uint16_t b = (uint16_t)(s_ax[IDX_DRIVE].pos_q16 >> 16);
    CHECK(b > 8191 - 150 && b < 8191 + 150);
    CHECK((a > b ? a - b : b - a) <= 16);                     /* та же скорость */

    settle_axis(LY, 63000);
    run(600, 7);                                              /* неровный шаг */
    uint16_t c = (uint16_t)(s_ax[IDX_DRIVE].pos_q16 >> 16);
    CHECK((a > c ? a - c : c - a) <= 150);

    /* провал цикла на 5 с: dt обрезается, ось не улетает в потолок */
    settle_axis(LY, 63000);
    run(5000, 5000);
    CHECK((uint16_t)(s_ax[IDX_DRIVE].pos_q16 >> 16) < 1000);

    /* отпустили стик: значение стоит (deadzone), ничего не ползёт */
    settle_axis(LY, 63000);
    run(300, 1);
    int32_t held = s_ax[IDX_DRIVE].pos_q16;
    raw_ax[LY] = 32500; s_ax[IDX_DRIVE].filt = 32500;
    run(1000, 1);
    CHECK(s_ax[IDX_DRIVE].pos_q16 == held);
    CHECK(sent14[1] == (uint16_t)(held >> 16));               /* последнее отправленное = накопленное */

    /* вниз до упора: клип в ноль, без переполнения */
    raw_ax[LY] = 2000; s_ax[IDX_DRIVE].filt = 2000;
    run(2000, 1);
    CHECK(s_ax[IDX_DRIVE].pos_q16 == 0 && sent14[1] == 0);
    raw_ax[LY] = 32500; s_ax[IDX_DRIVE].filt = 32500;

    /* ============ momentary-ось: позиция, deadzone, честный центр ============ */
    raw_ax[LX] = 2000;                                        /* влево до упора */
    run(200, 1);
    CHECK(sent14[0] == 0);
    raw_ax[LX] = 32500 + 150;                                 /* почти центр: внутри deadzone */
    run(300, 1);
    CHECK(sent14[0] == AXIS14_CENTER);                        /* пружина = ровно 8192 */
    raw_ax[LX] = 64000;                                       /* за калибровочный максимум: упор */
    run(200, 1);
    CHECK(sent14[0] == AXIS14_MAX);
    raw_ax[LX] = 32500;
    run(300, 1);
    CHECK(sent14[0] == AXIS14_CENTER);

    CHECK(order_ok);                                          /* MSB -> LSB нигде не разорваны */

    /* ============ битая калибровка не роняет пересчёт ============ */
    CHECK(!axis_cal_valid(&(axis_cal_t){ 1000, 1000, 1000 }));          /* нет хода */
    CHECK(!axis_cal_valid(&(axis_cal_t){ 1000, 60000, 1000 }));         /* центр = min: было деление на 0 */
    CHECK(!axis_cal_valid(&(axis_cal_t){ 1000, 60000, 60000 }));        /* центр = max */
    CHECK(!axis_cal_valid(&(axis_cal_t){ 1000, 60000, 2000 }));         /* центр прижат к краю */
    CHECK(!axis_cal_valid(&(axis_cal_t){ 30000, 31000, 30500 }));       /* ход слишком мал */
    CHECK( axis_cal_valid(&(axis_cal_t){ 2000, 63000, 32500 }));
    {
        axis_cal_t good = s_cal.lx;
        s_cal.lx = (axis_cal_t){ 1000, 60000, 1000 };
        raw_ax[LX] = 500;  run(50, 1);  CHECK(sent14[0] == AXIS14_CENTER);   /* ось в нейтрали */
        raw_ax[LX] = 61000; run(50, 1); CHECK(sent14[0] == AXIS14_CENTER);
        s_cal.lx = good;
        raw_ax[LX] = 32500; s_ax[IDX_BIAS].filt = 32500; run(50, 1);
    }

    /* ============ калибровка: центр усредняется, результат проверяется ============ */
    {
        cal_t before = s_cal;
        flash_saves = 0; power_script = 1; power_calls = 0; memset(cal_reads, 0, sizeof cal_reads); cal_no_travel = false;
        CHECK(calibration_service());
        CHECK(flash_saves == 1);
        CHECK(s_cal.lx.min == 3000 && s_cal.lx.max == 62000);
        /* центр — среднее по шумящим отсчётам (±40), а не один отсчёт */
        CHECK(s_cal.lx.center == 32500);
        CHECK(s_cal.ly.center == 32600 && s_cal.rx.center == 32700 && s_cal.ry.center == 32800);

        /* оси не трогали: калибровка отвергнута, старая не тронута, во flash не пишем */
        cal_t good = s_cal;
        flash_saves = 0; power_calls = 0; memset(cal_reads, 0, sizeof cal_reads); cal_phase = 0; cal_no_travel = true;
        CHECK(!calibration_service());
        CHECK(flash_saves == 0);
        CHECK(memcmp(&s_cal, &good, sizeof s_cal) == 0);

        power_script = 0; cal_phase = 0; cal_no_travel = false;
        s_cal = before;
    }

    /* ============ E4: Active Sensing каждые 250 мс, даже в полной тишине ============ */
    for (int i = 0; i < 4; i++) { raw_ax[i] = 32500; s_ax[i].filt = 32500; }
    run(300, 1);
    as_count = 0; msg_count = 0;
    s_t_sense = t_ms;
    run(1000, 1);
    CHECK(as_count == 4);
    CHECK(msg_count == 0);                                    /* стики неподвижны: кроме heartbeat — тишина */

    printf("pult smoke OK (snapshot, time-based rate axis, dt clamp, hold, momentary + deadzone, "
           "calibration guards and averaging, active sensing, MSB->LSB order)\n");
    return 0;
}
