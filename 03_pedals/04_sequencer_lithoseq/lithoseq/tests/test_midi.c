/* Тесты MIDI-слоя: валидность сообщений, парность on/off, SMF-структура,
 * детерминизм. Запуск: make test */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "../core/pipeline.h"
#include "../core/metrics.h"
#include "../core/playhead.h"
#include "../core/mapping.h"
#include "../app/patterns.h"
#include "../app/midi.h"

static int failures = 0;
#define CHECK(cond, ...) do { \
    if (!(cond)) { failures++; printf("FAIL %s:%d  ", __FILE__, __LINE__); \
                   printf(__VA_ARGS__); printf("\n"); } \
} while (0)

static uint8_t frame[FRAME_W * FRAME_H];

static void setup(map32_t *m, features_t *f)
{
    pattern_checker(frame, 20);
    roi_t roi = { (FRAME_W - FRAME_H) / 2, 0, FRAME_H, FRAME_H };
    calib_t cal;
    calib_identity(&cal);
    pipeline_downsample(frame, FRAME_W, FRAME_H, &roi, m);
    pipeline_calibrate(m, &cal);
    metrics_compute(m, f);
}

/* Прогон: собрать все MIDI-байты за n тиков */
static uint32_t run_midi(uint8_t *out, uint32_t cap, int n,
                         const map32_t *m, const features_t *f)
{
    playhead_t ph; playhead_init(&ph, TRAJ_BOUSTRO);
    map_state_t st; mapping_reset(&st);
    midi_state_t ms; midi_reset(&ms);
    uint32_t len = 0;
    for (int i = 0; i < n; i++) {
        uint8_t x, y; event_t ev;
        playhead_next(&ph, &x, &y);
        mapping_tick(f, m, x, y, &PRESET_REVEAL, &st, &ev);
        uint8_t msgs[12];
        uint32_t k = midi_from_event(&ms, &ev, msgs);
        CHECK(len + k <= cap, "midi buffer overflow");
        memcpy(out + len, msgs, k);
        len += k;
    }
    uint8_t fin[3];
    uint32_t k = midi_flush(&ms, fin);
    memcpy(out + len, fin, k);
    len += k;
    return len;
}

static void test_midi_stream_valid_and_balanced(void)
{
    map32_t m; features_t f;
    setup(&m, &f);

    static uint8_t buf[64 * 1024];
    uint32_t len = run_midi(buf, sizeof buf, MAP_N, &m, &f);
    CHECK(len % 3 == 0, "stream not 3-byte aligned: %u", len);

    int depth = 0, ons = 0;
    for (uint32_t i = 0; i < len; i += 3) {
        uint8_t s = buf[i] & 0xF0;
        CHECK(s == 0x90 || s == 0x80 || s == 0xB0, "bad status %02x", buf[i]);
        CHECK(buf[i + 1] < 128 && buf[i + 2] < 128, "data byte >127");
        if (s == 0x90) { depth++; ons++; CHECK(depth <= 1, "polyphony leak"); }
        if (s == 0x80) { depth--; CHECK(depth >= 0, "off without on"); }
    }
    CHECK(depth == 0, "unbalanced notes: depth=%d", depth);
    CHECK(ons > 10, "too few notes: %d", ons);
}

static void test_midi_deterministic(void)
{
    map32_t m; features_t f;
    setup(&m, &f);
    static uint8_t a[64 * 1024], b[64 * 1024];
    uint32_t la = run_midi(a, sizeof a, MAP_N, &m, &f);
    uint32_t lb = run_midi(b, sizeof b, MAP_N, &m, &f);
    CHECK(la == lb && memcmp(a, b, la) == 0, "midi stream not deterministic");
}

static void test_smf_structure(void)
{
    const char *path = "build/test_out.mid";
    FILE *fp = fopen(path, "wb");
    CHECK(fp != NULL, "cannot open %s", path);
    if (!fp) return;

    smf_t s;
    CHECK(smf_begin(&s, fp, 120) == 0, "smf_begin");
    uint8_t on[3] = { 0x90, 60, 80 }, off[3] = { 0x80, 60, 0 };
    smf_add(&s, 0, on);
    smf_add(&s, 96, off);
    /* varlen > 127: дельта 200 */
    smf_add(&s, 200, on);
    smf_add(&s, 24, off);
    CHECK(smf_end(&s) == 0, "smf_end");
    fclose(fp);

    fp = fopen(path, "rb");
    uint8_t h[22];
    size_t n = fread(h, 1, sizeof h, fp);
    fclose(fp);
    CHECK(n == sizeof h, "smf too short");
    CHECK(memcmp(h, "MThd", 4) == 0, "no MThd");
    CHECK(h[8] == 0 && h[9] == 0, "format != 0");
    CHECK(h[10] == 0 && h[11] == 1, "ntrks != 1");
    CHECK((h[12] << 8 | h[13]) == SMF_PPQ, "ppq mismatch");
    CHECK(memcmp(h + 14, "MTrk", 4) == 0, "no MTrk");
    uint32_t tlen = (uint32_t)h[18] << 24 | h[19] << 16 | h[20] << 8 | h[21];
    /* tempo(7) + события: дельты 0,96,24 = 1 байт varlen (4),
     * дельта 200 = 2 байта (5); + EOT(4) */
    CHECK(tlen == 7 + 4 + 4 + 5 + 4 + 4, "track len %u", tlen);
}

int main(void)
{
    test_midi_stream_valid_and_balanced();
    test_midi_deterministic();
    test_smf_structure();
    if (failures) {
        printf("%d FAILURE(S)\n", failures);
        return 1;
    }
    printf("all midi tests passed\n");
    return 0;
}
