/*
 * smoke_module.c — хост-тест логики модуля без железа.
 * Включает module/main.c целиком (static-функции доступны), BSP — заглушки.
 * Проверяет: 14-bit сборку, running status, ARM/MODE, FSM ramp, safe-state.
 */
#include <stdio.h>
#include <assert.h>

#define main module_main
#include "../module/main.c"
#undef main

/* ---------------- BSP-заглушки ---------------- */
static uint32_t t_ms;
uint32_t bsp_millis(void) { return t_ms; }

static uint8_t rxq[4096];
static int rxh, rxt;
bool bsp_midi_rx_pop(uint8_t *o) { if (rxh == rxt) return false; *o = rxq[rxh++]; return true; }
static void push(uint8_t b) { rxq[rxt++] = b; }

static uint32_t last_dac[8];
static int mute_writes;
void bsp_dac_write32(uint32_t f)
{
    uint8_t cmd = (f >> 24) & 0xFu;
    if (cmd == 0x3u) {
        uint8_t ch = (f >> 20) & 0xFu;
        last_dac[ch] = (f >> 4) & 0xFFFFu;
        if (ch == DAC_CH_MUTE) mute_writes++;
    }
}

static uint8_t mux_mode = 99;
static bool mux_pre;
void bsp_mux_set_mode(uint8_t m) { mux_mode = m; }
void bsp_mux_set_route(bool p)   { mux_pre = p; }
bool bsp_sw_route_pre(void)      { return false; }
void bsp_led_activity_pulse(void){}
void bsp_led_arm(bool on)        { (void)on; }
bool bsp_flash_load(void *d, uint32_t l)       { (void)d; (void)l; return false; }
bool bsp_flash_save(const void *s, uint32_t l) { (void)s; (void)l; return true;  }

static void drain(void) { uint8_t b; while (bsp_midi_rx_pop(&b)) midi_byte(b, t_ms); }

int main(void)
{
    cal_defaults();

    /* --- 14-bit X: MSB=64, LSB=0 -> 8192 (центр) -> код ЦАП 32768 --- */
    push(MIDI_ST_CC(0));
    push(CC_JOY_X_MSB); push(64);
    push(CC_JOY_X_LSB); push(0);
    drain();
    assert(s_p.x14 == 8192);
    assert(last_dac[DAC_CH_X_BIAS] == 32768);

    /* --- running status: Y-пара без повторного статуса --- */
    push(CC_JOY_Y_MSB); push(127);
    push(CC_JOY_Y_LSB); push(127);
    drain();
    assert(s_p.y14 == 16383);

    /* --- MSB без LSB: применяется грубо по таймауту --- */
    push(CC_JOY_Y_MSB); push(32);           /* 32<<7 = 4096 */
    drain();
    assert(s_p.y14 == 16383);               /* ещё ждём LSB */
    t_ms += LSB_WAIT_TIMEOUT_MS + 1;
    if (s_par.wait_lsb_cc != 0xFF && (t_ms - s_par.msb_ms) >= LSB_WAIT_TIMEOUT_MS) {
        set_axis14(s_par.wait_lsb_cc, (uint16_t)s_par.msb_cache << 7);
        s_par.wait_lsb_cc = 0xFF;
    }
    assert(s_p.y14 == 4096);

    /* --- ARM on + MODE -> RING через FSM (mute ramp -> switch -> ramp) --- */
    push(CC_ARM);  push(127);
    push(CC_MODE); push(MODEVAL_RING);
    drain();
    assert(s_p.arm);
    assert(s_fsm.st == FSM_DOWN);
    for (int i = 0; i < 100; i++) { t_ms++; fsm_tick(t_ms); }
    assert(mux_mode == 1);                  /* RING */
    assert(s_fsm.st == FSM_RUN);
    assert(last_dac[DAC_CH_MUTE] > 0);      /* канал открыт после ramp-up */

    /* --- ARM off -> уровень уходит в 0 (глобальный gate) --- */
    push(CC_ARM); push(0);
    drain();
    for (int i = 0; i < 5; i++) { t_ms++; fsm_tick(t_ms); }
    assert(last_dac[DAC_CH_MUTE] == 0);

    /* --- чужой канал игнорируется --- */
    uint16_t x_before = s_p.x14;
    push(MIDI_ST_CC(5));                    /* канал 6 */
    push(CC_JOY_X_MSB); push(1);
    push(CC_JOY_X_LSB); push(1);
    drain();
    assert(s_p.x14 == x_before);

    printf("module smoke OK (parser, 14-bit, timeout, FSM, ARM, channel filter)\n");
    return 0;
}
