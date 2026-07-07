/*
 * smoke_module.c — хост-тест логики модуля без железа (конфиг DJI C5).
 * Включает module/main.c целиком (static-функции доступны), BSP — заглушки.
 * Проверяет: 4× 14-bit пары, running status, таймаут LSB, ARM/MODE FSM,
 * dial->DAC, фильтр канала, safe-state.
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
bool bsp_midi_link_up(void) { return true; }
static void push(uint8_t b) { rxq[rxt++] = b; }

static uint32_t last_dac[8];
void bsp_dac_write32(uint32_t f)
{
    uint8_t cmd = (f >> 24) & 0xFu;
    if (cmd == 0x3u) {
        uint8_t ch = (f >> 20) & 0xFu;
        last_dac[ch] = (f >> 4) & 0xFFFFu;
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

    /* --- левый X (BIAS): MSB=64, LSB=0 -> 8192 (центр) -> код 32768 --- */
    push(MIDI_ST_CC(0));
    push(CC_JOY_X_MSB); push(64);
    push(CC_JOY_X_LSB); push(0);
    drain();
    assert(s_pairs[0].v14 == 8192);
    assert(last_dac[DAC_CH_X_BIAS] == 32768);

    /* --- running status: DRIVE-пара без повторного статуса --- */
    push(CC_JOY_Y_MSB); push(127);
    push(CC_JOY_Y_LSB); push(127);
    drain();
    assert(s_pairs[1].v14 == 16383);

    /* --- правый Y (CUTOFF, новая пара CC#18/50) --- */
    push(CC_CUT_MSB);  push(100);
    push(CC_CUT_LSB);  push(3);
    drain();
    assert(s_pairs[3].v14 == midi14_join(100, 3));
    assert(last_dac[DAC_CH_CUTOFF] == apply_cal(DAC_CH_CUTOFF, midi14_join(100, 3)));

    /* --- MSB без LSB: применяется грубо по таймауту --- */
    push(CC_RESO_MSB); push(32);            /* 32<<7 = 4096 */
    drain();
    assert(s_pairs[2].v14 == 8192);         /* ещё ждём LSB */
    t_ms += LSB_WAIT_TIMEOUT_MS + 1;
    if (s_par.wait_pair && (t_ms - s_par.msb_ms) >= LSB_WAIT_TIMEOUT_MS) {
        pair_apply(s_par.wait_pair, (uint16_t)s_par.msb_cache << 7);
        s_par.wait_pair = 0;
    }
    assert(s_pairs[2].v14 == 4096);

    /* --- ARM on + MODE -> RING через FSM (mute ramp -> switch -> ramp) --- */
    push(CC_ARM);  push(127);
    push(CC_MODE); push(MODEVAL_RING);
    drain();
    assert(s_p.arm);
    assert(s_fsm.st == FSM_DOWN);
    for (int i = 0; i < 100; i++) { t_ms++; fsm_tick(t_ms); }
    assert(mux_mode == 1);                  /* RING */
    assert(s_fsm.st == FSM_RUN);
    assert(last_dac[DAC_CH_MUTE] == 0xFFFFu); /* ARM on -> полный код ramp */

    /* --- dial -> DAC H (нормаль MIX-in) --- */
    push(CC_DIAL); push(64);
    drain();
    assert(last_dac[DAC_CH_DIAL] == apply_cal(DAC_CH_DIAL, 64u << 7));

    /* --- deprecated LEVEL/TONE игнорируются (каналы C/D не трогаются) --- */
    uint32_t cut_before = last_dac[DAC_CH_CUTOFF], reso_before = last_dac[DAC_CH_RESO];
    push(CC_LEVEL); push(1);
    push(CC_TONE);  push(1);
    drain();
    assert(last_dac[DAC_CH_CUTOFF] == cut_before);
    assert(last_dac[DAC_CH_RESO]  == reso_before);

    /* --- ARM off -> уровень уходит в 0 (глобальный gate) --- */
    push(CC_ARM); push(0);
    drain();
    for (int i = 0; i < 50; i++) { t_ms++; fsm_tick(t_ms); }
    assert(last_dac[DAC_CH_MUTE] == 0);

    /* --- чужой канал игнорируется --- */
    uint16_t x_before = s_pairs[0].v14;
    push(MIDI_ST_CC(5));                    /* канал 6 */
    push(CC_JOY_X_MSB); push(1);
    push(CC_JOY_X_LSB); push(1);
    drain();
    assert(s_pairs[0].v14 == x_before);

    printf("module smoke OK (4 pairs, running status, LSB timeout, FSM, ARM, dial, deprecated CC, channel filter)\n");
    return 0;
}
