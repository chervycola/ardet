/*
 * midi_map.h — Is My (System Suicide #8)
 *
 * ЕДИНСТВЕННЫЙ источник истины по MIDI-маппингу (02_technical.md §C1).
 * Подключается обеими прошивками (pult/, module/). Менять здесь — и только здесь.
 */
#ifndef ISMY_MIDI_MAP_H
#define ISMY_MIDI_MAP_H

#include <stdint.h>

/* ---- Канал -------------------------------------------------------------
 * Пользовательский канал 1..16; в проводе 0..15. По умолчанию канал 1.
 * Переключение канала хранится во flash (cal-структуры прошивок).      */
#define MIDIMAP_CH_DEFAULT      0u          /* wire-формат: 0 == канал 1 */

/* ---- 14-bit оси джойстика ----------------------------------------------
 * Порядок на проводе: ВСЕГДА MSB, затем LSB (CC#N, затем CC#N+32).
 * Приёмник применяет значение по приходу LSB; если вместо LSB пришло
 * что-то другое — fallback: применить MSB<<7 (см. module/main.c).      */
#define CC_JOY_X_MSB            16u         /* BIAS,  X-ось */
#define CC_JOY_X_LSB            48u
#define CC_JOY_Y_MSB            17u         /* DRIVE, Y-ось */
#define CC_JOY_Y_LSB            49u

/* ---- 7-bit ручки -------------------------------------------------------*/
#define CC_LEVEL                7u
#define CC_TONE                 74u

/* ---- Тумблеры ----------------------------------------------------------*/
#define CC_ARM                  64u         /* 0 / 127          */
#define CC_MODE                 80u         /* 0 / 64 / 127     */
#define CC_LINK                 81u         /* 0 / 127          */

/* Значения CC_MODE */
#define MODEVAL_SHAPER          0u
#define MODEVAL_RING            64u
#define MODEVAL_GATE            127u

/* ---- Ноты (gate-события) ----------------------------------------------*/
#define NOTE_JOY_PRESS          36u         /* C2  */
#define NOTE_FOOT               37u         /* C#2 */
#define NOTE_VELOCITY           100u

/* ---- Статус-байты ------------------------------------------------------*/
#define MIDI_ST_CC(ch)          (uint8_t)(0xB0u | ((ch) & 0x0Fu))
#define MIDI_ST_NOTE_ON(ch)     (uint8_t)(0x90u | ((ch) & 0x0Fu))
#define MIDI_ST_NOTE_OFF(ch)    (uint8_t)(0x80u | ((ch) & 0x0Fu))

/* ---- 14-bit упаковка ---------------------------------------------------*/
static inline uint8_t midi14_msb(uint16_t v14) { return (uint8_t)((v14 >> 7) & 0x7Fu); }
static inline uint8_t midi14_lsb(uint16_t v14) { return (uint8_t)(v14 & 0x7Fu); }
static inline uint16_t midi14_join(uint8_t msb, uint8_t lsb)
{
    return (uint16_t)(((uint16_t)(msb & 0x7Fu) << 7) | (lsb & 0x7Fu));
}

/* ---- Тайминги протокола (обе стороны должны совпадать) -----------------*/
#define MIDI_BAUD               31250u
#define AXIS_RATE_LIMIT_MS      5u          /* >= 5 мс между парами CC одной оси (~200 Гц) */
#define MIDI_LINK_TIMEOUT_MS    500u        /* нет байтов дольше -> hold last values        */
#define LSB_WAIT_TIMEOUT_MS     20u         /* MSB пришёл, LSB нет -> применить MSB<<7      */

#endif /* ISMY_MIDI_MAP_H */
