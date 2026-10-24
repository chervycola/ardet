/* Цикл приложения стенда (вызывается из main.c CubeMX после инициализации
 * периферии). Ядро (core/) не знает про железо — вся склейка здесь.
 *
 * Кадровый поток (5-15 Гц) и клок секвенсора (TIM, BPM) асинхронны;
 * карта подменяется атомарно между тиками (02 §«Разделение частот»). */
#ifdef STM32H743xx

#include "stm32h7xx_hal.h"
#include "../hal/hal.h"
#include "../core/pipeline.h"
#include "../core/metrics.h"
#include "../core/playhead.h"
#include "../core/mapping.h"

extern int camera_init(void);

typedef struct {
    uint32_t magic;            /* 0x4C495448 "LITH" */
    roi_t    roi;
    calib_t  cal[3];           /* по режимам: TRANS, REFLECT_D, REFLECT_4 */
    uint16_t exposure;
    uint8_t  gain;
    uint8_t  mode;             /* scan_mode_t */
    uint8_t  traj;
    uint8_t  preset;           /* 0=reveal 1=compose */
    uint16_t bpm;
} config_t;

static config_t cfg;
static uint8_t frame[FRAME_W * FRAME_H] __attribute__((section(".dma_buf")));

/* Двойной буфер: кадровый цикл пишет в back, клок читает front */
static map32_t map_a, map_b;
static features_t feat_a, feat_b;
static map32_t *volatile map_front = &map_a;
static features_t *volatile feat_front = &feat_a;

static playhead_t ph;
static map_state_t mst;
static volatile uint32_t clock_ticks;

/* Из ISR таймера клока (TIM6) — только счётчик, работа в основном цикле */
void app_clock_isr(void) { clock_ticks++; }

static void config_defaults(void)
{
    cfg.magic = 0x4C495448u;
    cfg.roi = (roi_t){ (FRAME_W - FRAME_H) / 2, 0, FRAME_H, FRAME_H };
    for (int i = 0; i < 3; i++) calib_identity(&cfg.cal[i]);
    cfg.exposure = 0x0200;
    cfg.gain = 0x20;
    cfg.mode = MODE_TRANS;
    cfg.traj = TRAJ_BOUSTRO;
    cfg.preset = 0;
    cfg.bpm = 120;
}

void app_init(void)
{
    hal_config_load(&cfg, sizeof cfg);
    if (cfg.magic != 0x4C495448u)
        config_defaults();
    camera_init();
    playhead_init(&ph, (traj_t)cfg.traj);
    mapping_reset(&mst);
}

void app_loop(void)
{
    uint32_t done_ticks = 0;

    for (;;) {
        /* --- кадровый цикл --- */
        if (hal_scan((scan_mode_t)cfg.mode, frame) == 0) {
            map32_t *back = (map_front == &map_a) ? &map_b : &map_a;
            features_t *fback = (feat_front == &feat_a) ? &feat_b : &feat_a;
            pipeline_downsample(frame, FRAME_W, FRAME_H, &cfg.roi, back);
            pipeline_calibrate(back, &cfg.cal[cfg.mode]);
            metrics_compute(back, fback);
            /* атомарная подмена (указатели волатильные, 32-бит запись) */
            map_front = back;
            feat_front = fback;
            /* TODO: proto_write_map/features -> USB CDC (tud_cdc_write) */
        }

        /* --- тики клока, накопившиеся за время кадра --- */
        while (done_ticks != clock_ticks) {
            done_ticks++;
            uint8_t x, y;
            event_t ev;
            playhead_next(&ph, &x, &y);
            const preset_t *pr = cfg.preset ? &PRESET_COMPOSE : &PRESET_REVEAL;
            mapping_tick(feat_front, map_front, x, y, pr, &mst, &ev);
            if (ev.note_on)
                hal_midi_note(ev.note, ev.accent ? 112 : 80, 1);
            else if (!ev.gate && mst.gate == 0)
                ; /* note_off шлёт midi-слой app/midi.c — подключить как на ПК */
            hal_midi_cc(74, ev.aux1 >> 1);
            /* TODO: proto_write_event -> CDC; фаза 3: DAC вместо/вместе MIDI */
        }

        /* TODO: CLI по CDC: cal/mode/roi/traj/preset/bpm/save (05 §6) */
    }
}

#endif /* STM32H743xx */
