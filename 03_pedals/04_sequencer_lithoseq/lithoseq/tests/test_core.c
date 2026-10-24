/* Тесты ядра: метрология метрик (по мотивам T-M1), покрытие траекторий,
 * квантайзер, детерминизм (D7). Запуск: make test */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "../core/pipeline.h"
#include "../core/metrics.h"
#include "../core/playhead.h"
#include "../core/mapping.h"
#include "../app/patterns.h"

static int failures = 0;
#define CHECK(cond, ...) do { \
    if (!(cond)) { failures++; printf("FAIL %s:%d  ", __FILE__, __LINE__); \
                   printf(__VA_ARGS__); printf("\n"); } \
} while (0)

static uint8_t frame[FRAME_W * FRAME_H];

static void frame_to_map(map32_t *m)
{
    roi_t roi = { (FRAME_W - FRAME_H) / 2, 0, FRAME_H, FRAME_H };
    calib_t cal;
    calib_identity(&cal);
    pipeline_downsample(frame, FRAME_W, FRAME_H, &roi, m);
    pipeline_calibrate(m, &cal);
}

static uint32_t map_mean(const map32_t *m)
{
    uint32_t s = 0;
    for (int i = 0; i < MAP_N; i++) s += m->v[i];
    return s / MAP_N;
}

static void rot90_map(const map32_t *in, map32_t *out)
{
    for (int y = 0; y < MAP_W; y++)
        for (int x = 0; x < MAP_W; x++)
            out->v[y * MAP_W + x] = in->v[(MAP_W - 1 - x) * MAP_W + y];
}

/* --- T-M1: монотонность D по плотности точек --- */
static void test_density_monotonic(void)
{
    uint32_t means[3];
    const int dens[3] = { 5, 15, 40 };
    for (int i = 0; i < 3; i++) {
        map32_t m; features_t f;
        pattern_dots(frame, dens[i], 0xC0FFEE);
        frame_to_map(&m);
        metrics_compute(&m, &f);
        means[i] = map_mean(&f.d);
    }
    CHECK(means[0] < means[1] && means[1] < means[2],
          "D not monotonic: %u %u %u", means[0], means[1], means[2]);
}

/* --- T-M1: S на шахматке >> S на BLANK --- */
static void test_sharpness(void)
{
    map32_t m; features_t f;

    pattern_blank(frame, 128);
    frame_to_map(&m);
    metrics_compute(&m, &f);
    uint32_t s_blank = map_mean(&f.s);
    CHECK(s_blank <= 2, "S(blank)=%u expected ~0", s_blank);

    pattern_checker(frame, 20);
    frame_to_map(&m);
    metrics_compute(&m, &f);
    uint32_t s_check = map_mean(&f.s);
    CHECK(s_check > 20, "S(checker)=%u expected >20", s_check);
}

/* --- T-M1: R высокий у колец, низкий у случайных точек --- */
static void test_symmetry(void)
{
    map32_t m; features_t f;

    pattern_rings(frame, 16);
    frame_to_map(&m);
    metrics_compute(&m, &f);
    uint16_t r_rings = f.r_q15;
    CHECK(r_rings > (uint16_t)(0.85 * 32767), "R(rings)=%u", r_rings);

    pattern_checker(frame, 20);
    frame_to_map(&m);
    metrics_compute(&m, &f);
    CHECK(f.r_q15 > (uint16_t)(0.6 * 32767), "R(checker)=%u", f.r_q15);

    pattern_dots(frame, 15, 0xC0FFEE);
    frame_to_map(&m);
    metrics_compute(&m, &f);
    CHECK(f.r_q15 < (uint16_t)(0.35 * 32767), "R(dots)=%u", f.r_q15);
}

/* --- T1.4b-подобный: R инвариантен к повороту карты на 90°, допуск 0.05 --- */
static void test_symmetry_rotation_invariant(void)
{
    const char *pats[2] = { "rings", "dots" };
    for (int i = 0; i < 2; i++) {
        if (i == 0) pattern_rings(frame, 16);
        else pattern_dots(frame, 15, 0xC0FFEE);
        map32_t m, mr; features_t f, fr;
        frame_to_map(&m);
        rot90_map(&m, &mr);
        metrics_compute(&m, &f);
        metrics_compute(&mr, &fr);
        int d = (int)f.r_q15 - (int)fr.r_q15;
        if (d < 0) d = -d;
        CHECK(d <= (int)(0.05 * 32767), "R rot-variance %s: %d", pats[i], d);
    }
}

/* --- траектории: полные циклы посещают каждую клетку ровно один раз --- */
static void test_trajectory_coverage(void)
{
    traj_t full[4] = { TRAJ_RASTER, TRAJ_BOUSTRO, TRAJ_SPIRAL_IN, TRAJ_SPIRAL_OUT };
    for (int t = 0; t < 4; t++) {
        uint8_t seen[MAP_N];
        memset(seen, 0, sizeof seen);
        playhead_t p;
        playhead_init(&p, full[t]);
        for (int i = 0; i < MAP_N; i++) {
            uint8_t x, y;
            playhead_next(&p, &x, &y);
            seen[y * MAP_W + x]++;
        }
        for (int i = 0; i < MAP_N; i++)
            if (seen[i] != 1) {
                CHECK(0, "traj %s cell %d visited %d times",
                      traj_name(full[t]), i, seen[i]);
                break;
            }
    }
    /* radial: все позиции в пределах карты, период 128 */
    playhead_t p;
    playhead_init(&p, TRAJ_RADIAL);
    for (int i = 0; i < 300; i++) {
        uint8_t x, y;
        playhead_next(&p, &x, &y);
        CHECK(x < MAP_W && y < MAP_W, "radial out of bounds %u %u", x, y);
    }
}

/* --- квантайзер: ноты в диапазоне и в маске шкалы --- */
static void test_quantizer_in_scale(void)
{
    pattern_rings(frame, 16); /* высокая R -> консонантная маска */
    map32_t m; features_t f;
    frame_to_map(&m);
    metrics_compute(&m, &f);
    uint16_t mask = mapping_scale_mask(f.r_q15, 0);

    playhead_t ph; playhead_init(&ph, TRAJ_BOUSTRO);
    map_state_t st; mapping_reset(&st);
    for (int i = 0; i < MAP_N; i++) {
        uint8_t x, y; event_t ev;
        playhead_next(&ph, &x, &y);
        mapping_tick(&f, &m, x, y, &PRESET_REVEAL, &st, &ev);
        int rel = ev.note - PRESET_REVEAL.root;
        CHECK(rel >= 0 && rel < PRESET_REVEAL.octaves * 12,
              "note %u out of range", ev.note);
        CHECK((mask >> (rel % 12)) & 1, "note %u not in scale mask %03x",
              ev.note, mask);
    }
}

/* --- gate: на BLANK нет ни одного включения --- */
static void test_no_gates_on_blank(void)
{
    pattern_blank(frame, 128);
    map32_t m; features_t f;
    frame_to_map(&m);
    metrics_compute(&m, &f);
    playhead_t ph; playhead_init(&ph, TRAJ_RASTER);
    map_state_t st; mapping_reset(&st);
    int ons = 0;
    for (int i = 0; i < MAP_N; i++) {
        uint8_t x, y; event_t ev;
        playhead_next(&ph, &x, &y);
        mapping_tick(&f, &m, x, y, &PRESET_REVEAL, &st, &ev);
        ons += ev.note_on;
    }
    CHECK(ons == 0, "blank produced %d gate-ons", ons);
}

/* --- пресеты слышимо различны: потоки событий не совпадают --- */
static void run_events(const preset_t *p, event_t *out, int n,
                       const map32_t *m, const features_t *f)
{
    playhead_t ph; playhead_init(&ph, TRAJ_BOUSTRO);
    map_state_t st; mapping_reset(&st);
    for (int i = 0; i < n; i++) {
        uint8_t x, y;
        playhead_next(&ph, &x, &y);
        mapping_tick(f, m, x, y, p, &st, &out[i]);
    }
}

static void test_presets_differ_and_deterministic(void)
{
    pattern_checker(frame, 20);
    map32_t m; features_t f;
    frame_to_map(&m);
    metrics_compute(&m, &f);

    static event_t a[MAP_N], b[MAP_N], a2[MAP_N];
    run_events(&PRESET_REVEAL, a, MAP_N, &m, &f);
    run_events(&PRESET_COMPOSE, b, MAP_N, &m, &f);
    run_events(&PRESET_REVEAL, a2, MAP_N, &m, &f);

    CHECK(memcmp(a, a2, sizeof a) == 0, "determinism broken (D7)");
    CHECK(memcmp(a, b, sizeof a) != 0, "presets identical (F11)");

    int ons_a = 0, ons_b = 0;
    for (int i = 0; i < MAP_N; i++) { ons_a += a[i].note_on; ons_b += b[i].note_on; }
    CHECK(ons_a > 0, "reveal produced no notes on checker");
    CHECK(ons_b > 0, "compose produced no notes on checker");
}

/* --- D11: эквализация питча разворачивает узкое распределение D --- */
static void test_pitch_equalization(void)
{
    pattern_dots(frame, 15, 0xC0FFEE);
    map32_t m; features_t f;
    frame_to_map(&m);
    metrics_compute(&m, &f);

    uint8_t seen_plain[128] = { 0 }, seen_eq[128] = { 0 };
    preset_t plain = PRESET_REVEAL;              /* pitch_eq = 0 */
    preset_t eq = PRESET_REVEAL;
    eq.pitch_eq = 1;                             /* изолируем эффект D11 */

    playhead_t ph; map_state_t st;
    playhead_init(&ph, TRAJ_BOUSTRO); mapping_reset(&st);
    for (int i = 0; i < MAP_N; i++) {
        uint8_t x, y; event_t ev;
        playhead_next(&ph, &x, &y);
        mapping_tick(&f, &m, x, y, &plain, &st, &ev);
        seen_plain[ev.note & 127] = 1;
    }
    playhead_init(&ph, TRAJ_BOUSTRO); mapping_reset(&st);
    for (int i = 0; i < MAP_N; i++) {
        uint8_t x, y; event_t ev;
        playhead_next(&ph, &x, &y);
        mapping_tick(&f, &m, x, y, &eq, &st, &ev);
        seen_eq[ev.note & 127] = 1;
    }
    int n_plain = 0, n_eq = 0;
    for (int i = 0; i < 128; i++) { n_plain += seen_plain[i]; n_eq += seen_eq[i]; }
    CHECK(n_eq > 2 * n_plain, "pitch_eq no effect: %d vs %d", n_eq, n_plain);
    CHECK(n_eq >= 12, "equalized range too narrow: %d notes", n_eq);
}

/* --- полный тракт дважды: кадр->карта->метрики идентичны (D7) --- */
static void test_full_determinism(void)
{
    map32_t m1, m2; features_t f1, f2;
    pattern_dots(frame, 15, 0xC0FFEE);
    frame_to_map(&m1);
    metrics_compute(&m1, &f1);
    pattern_dots(frame, 15, 0xC0FFEE);
    frame_to_map(&m2);
    metrics_compute(&m2, &f2);
    CHECK(memcmp(&m1, &m2, sizeof m1) == 0, "map determinism");
    CHECK(f1.r_q15 == f2.r_q15 && f1.hash == f2.hash, "features determinism");
}

int main(void)
{
    test_density_monotonic();
    test_sharpness();
    test_symmetry();
    test_symmetry_rotation_invariant();
    test_trajectory_coverage();
    test_quantizer_in_scale();
    test_no_gates_on_blank();
    test_presets_differ_and_deterministic();
    test_pitch_equalization();
    test_full_determinism();

    if (failures) {
        printf("%d FAILURE(S)\n", failures);
        return 1;
    }
    printf("all tests passed\n");
    return 0;
}
