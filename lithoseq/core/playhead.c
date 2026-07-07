#include "playhead.h"

/* Таблица обхода спирали (снаружи внутрь), генерируется один раз.
 * Детерминированно: порядок фиксирован алгоритмом, без состояния извне. */
static uint16_t spiral_tab[MAP_N];
static int spiral_ready = 0;

static void spiral_build(void)
{
    int top = 0, bot = MAP_W - 1, left = 0, right = MAP_W - 1, k = 0;
    while (top <= bot && left <= right) {
        for (int x = left; x <= right; x++) spiral_tab[k++] = (uint16_t)(top * MAP_W + x);
        top++;
        for (int y = top; y <= bot; y++) spiral_tab[k++] = (uint16_t)(y * MAP_W + right);
        right--;
        if (top <= bot) {
            for (int x = right; x >= left; x--) spiral_tab[k++] = (uint16_t)(bot * MAP_W + x);
            bot--;
        }
        if (left <= right) {
            for (int y = bot; y >= top; y--) spiral_tab[k++] = (uint16_t)(y * MAP_W + left);
            left++;
        }
    }
    spiral_ready = 1;
}

/* 8 направлений лучей: E, NE, N, NW, W, SW, S, SE */
static const int8_t SPOKE_DX[8] = { 1,  1,  0, -1, -1, -1, 0, 1 };
static const int8_t SPOKE_DY[8] = { 0, -1, -1, -1,  0,  1, 1, 1 };
#define RADIAL_RMAX 16 /* r = 0..15 */
#define RADIAL_PERIOD (8 * RADIAL_RMAX)

void playhead_init(playhead_t *p, traj_t t)
{
    if (!spiral_ready) spiral_build();
    p->type = t;
    p->step = 0;
}

uint32_t playhead_period(traj_t t)
{
    return (t == TRAJ_RADIAL) ? RADIAL_PERIOD : MAP_N;
}

void playhead_seek(playhead_t *p, uint32_t step)
{
    p->step = step % playhead_period(p->type);
}

void playhead_next(playhead_t *p, uint8_t *x, uint8_t *y)
{
    uint32_t s = p->step % playhead_period(p->type);
    uint16_t idx;

    switch (p->type) {
    case TRAJ_RASTER:
        idx = (uint16_t)s;
        *x = idx % MAP_W; *y = idx / MAP_W;
        break;
    case TRAJ_BOUSTRO: {
        uint8_t row = (uint8_t)(s / MAP_W), col = (uint8_t)(s % MAP_W);
        *x = (row & 1) ? (MAP_W - 1 - col) : col;
        *y = row;
        break;
    }
    case TRAJ_SPIRAL_IN:
        idx = spiral_tab[s];
        *x = idx % MAP_W; *y = idx / MAP_W;
        break;
    case TRAJ_SPIRAL_OUT:
        idx = spiral_tab[MAP_N - 1 - s];
        *x = idx % MAP_W; *y = idx / MAP_W;
        break;
    case TRAJ_RADIAL:
    default: {
        uint32_t spoke = s / RADIAL_RMAX, r = s % RADIAL_RMAX;
        int px = MAP_W / 2 + SPOKE_DX[spoke] * (int)r;
        int py = MAP_W / 2 + SPOKE_DY[spoke] * (int)r;
        if (px < 0) px = 0;
        if (px >= MAP_W) px = MAP_W - 1;
        if (py < 0) py = 0;
        if (py >= MAP_W) py = MAP_W - 1;
        *x = (uint8_t)px; *y = (uint8_t)py;
        break;
    }
    }
    p->step = (s + 1) % playhead_period(p->type);
}

const char *traj_name(traj_t t)
{
    switch (t) {
    case TRAJ_RASTER:     return "raster";
    case TRAJ_BOUSTRO:    return "boustro";
    case TRAJ_SPIRAL_IN:  return "spiral_in";
    case TRAJ_SPIRAL_OUT: return "spiral_out";
    case TRAJ_RADIAL:     return "radial";
    default:              return "?";
    }
}
