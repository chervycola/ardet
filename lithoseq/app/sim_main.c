/* ПК-симулятор: синтетический кадр или PGM -> ядро -> CSV + бинарный протокол.
 * Использование:
 *   lithoseq_sim <pattern|file.pgm> [--traj name] [--preset reveal|compose]
 *                [--ticks N] [--csv out.csv] [--bin out.bin]
 * Паттерны: blank checker rings dots5 dots15 dots40
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "../core/pipeline.h"
#include "../core/metrics.h"
#include "../core/playhead.h"
#include "../core/mapping.h"
#include "patterns.h"
#include "proto.h"

static uint8_t frame[FRAME_W * FRAME_H];

static int make_frame(const char *name)
{
    if (!strcmp(name, "blank"))   { pattern_blank(frame, 128); return 0; }
    if (!strcmp(name, "checker")) { pattern_checker(frame, 20); return 0; }
    if (!strcmp(name, "rings"))   { pattern_rings(frame, 16);  return 0; }
    if (!strcmp(name, "dots5"))   { pattern_dots(frame, 5,  0xC0FFEE); return 0; }
    if (!strcmp(name, "dots15"))  { pattern_dots(frame, 15, 0xC0FFEE); return 0; }
    if (!strcmp(name, "dots40"))  { pattern_dots(frame, 40, 0xC0FFEE); return 0; }
    return pattern_load_pgm(name, frame);
}

static traj_t parse_traj(const char *s)
{
    for (int t = 0; t < TRAJ_COUNT; t++)
        if (!strcmp(s, traj_name((traj_t)t))) return (traj_t)t;
    fprintf(stderr, "unknown traj '%s'\n", s);
    exit(2);
}

int main(int argc, char **argv)
{
    if (argc < 2) {
        fprintf(stderr, "usage: %s <pattern|file.pgm> [--traj t] "
                        "[--preset reveal|compose] [--ticks N] "
                        "[--csv f] [--bin f]\n", argv[0]);
        return 2;
    }
    const char *src = argv[1];
    traj_t traj = TRAJ_RASTER;
    const preset_t *preset = &PRESET_REVEAL;
    const char *preset_name = "reveal";
    long ticks = 1024;
    const char *csv_path = NULL, *bin_path = NULL;

    for (int i = 2; i < argc; i++) {
        if (!strcmp(argv[i], "--traj") && i + 1 < argc) traj = parse_traj(argv[++i]);
        else if (!strcmp(argv[i], "--preset") && i + 1 < argc) {
            preset_name = argv[++i];
            if (!strcmp(preset_name, "reveal")) preset = &PRESET_REVEAL;
            else if (!strcmp(preset_name, "compose")) preset = &PRESET_COMPOSE;
            else { fprintf(stderr, "unknown preset\n"); return 2; }
        }
        else if (!strcmp(argv[i], "--ticks") && i + 1 < argc) ticks = atol(argv[++i]);
        else if (!strcmp(argv[i], "--csv") && i + 1 < argc) csv_path = argv[++i];
        else if (!strcmp(argv[i], "--bin") && i + 1 < argc) bin_path = argv[++i];
        else { fprintf(stderr, "bad arg '%s'\n", argv[i]); return 2; }
    }

    if (make_frame(src) != 0) {
        fprintf(stderr, "cannot load pattern/pgm '%s'\n", src);
        return 1;
    }

    /* Тракт как в 02: ROI = центральный квадрат 240x240 */
    roi_t roi = { (FRAME_W - FRAME_H) / 2, 0, FRAME_H, FRAME_H };
    map32_t map;
    calib_t cal;
    calib_identity(&cal);
    pipeline_downsample(frame, FRAME_W, FRAME_H, &roi, &map);
    pipeline_calibrate(&map, &cal);

    features_t feat;
    metrics_compute(&map, &feat);

    playhead_t ph;
    playhead_init(&ph, traj);
    map_state_t st;
    mapping_reset(&st);

    FILE *csv = csv_path ? fopen(csv_path, "w") : stdout;
    FILE *bin = bin_path ? fopen(bin_path, "wb") : NULL;
    if (!csv || (bin_path && !bin)) { fprintf(stderr, "cannot open output\n"); return 1; }

    fprintf(csv, "# src=%s traj=%s preset=%s R=%u/32767 hash=%08x\n",
            src, traj_name(traj), preset_name, feat.r_q15, feat.hash);
    fprintf(csv, "tick,x,y,note,gate,note_on,accent,aux1,aux2\n");
    if (bin) { proto_write_map(bin, &map); proto_write_features(bin, &feat); }

    for (long i = 0; i < ticks; i++) {
        uint8_t x, y;
        playhead_next(&ph, &x, &y);
        event_t ev;
        mapping_tick(&feat, &map, x, y, preset, &st, &ev);
        fprintf(csv, "%u,%u,%u,%u,%u,%u,%u,%u,%u\n",
                ev.tick, ev.x, ev.y, ev.note, ev.gate,
                ev.note_on, ev.accent, ev.aux1, ev.aux2);
        if (bin) proto_write_event(bin, &ev);
    }

    if (csv != stdout) fclose(csv);
    if (bin) fclose(bin);
    fprintf(stderr, "R=%.3f hash=%08x ticks=%ld -> %s%s%s\n",
            feat.r_q15 / 32767.0, feat.hash, ticks,
            csv_path ? csv_path : "stdout",
            bin_path ? " + " : "", bin_path ? bin_path : "");
    return 0;
}
