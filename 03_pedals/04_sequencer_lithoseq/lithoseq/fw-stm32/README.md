# fw-stm32 — прошивка стенда (Nucleo-H743ZI2 + OV7670)

Скелет STM32-части. Собирается **внутри проекта STM32CubeIDE** (см.
чек-лист ниже) с добавлением `../core/` и `../app/proto.c, midi.c` в
сорцы. Ядро уже полностью оттестировано на ПК (`make test` в `lithoseq/`),
здесь — только железная обвязка.

## Файлы

| Файл | Что делает |
|---|---|
| `ov7670.c/h` | Инициализация камеры по SCCB: QVGA YUV, **AEC/AGC/AWB выключены** (D6/D7), ручные экспозиция/усиление |
| `hal_impl.c` | Реализация `../hal/hal.h`: захват DCMI+DMA, группы света, свод REFLECT-4, конфиг во flash |
| `main_app.c` | Цикл приложения: скан → пайплайн → метрики → клок → маппинг → proto/MIDI |

⚠ Значения регистров OV7670 — стандартный набор из открытых драйверов;
на бринг-апе (T1.1–T1.2) сверить по datasheet и зафиксировать здесь.

## Чек-лист CubeMX (Nucleo-H743ZI2)

1. **Clock**: HSE (8 МГц от ST-LINK MCO) → SYSCLK 480 МГц; PLL для USB 48 МГц.
2. **DCMI**: slave 8 bit, HSYNC active low, VSYNC active high, PCLK rising
   (сверить с модулем OV7670!). DMA → memory, circular off, snapshot mode.
3. **I2C1** (SCCB): 100 кГц. Подтяжки 4.7к на модуле обычно есть.
4. **XCLK для камеры**: MCO1 (PA8) = 12–24 МГц, либо TIM PWM.
5. **TIM6**: базовый таймер клока секвенсора (BPM), прерывание.
6. **GPIO выходы**: LIGHT_TRANS, LIGHT_RING, LIGHT_N/E/S/W (6 ног, push-pull).
7. **USB_OTG_FS**: Device. Класс — TinyUSB composite **CDC + MIDI**
   (у CubeMX нет MIDI-класса; TinyUSB подключается как middleware,
   `CFG_TUD_CDC=1, CFG_TUD_MIDI=1`). Альтернатива для первого запуска:
   чистый CDC из CubeMX, MIDI добавить вторым шагом.
8. **Флаги сборки**: `-O2 -std=c11`, инклюд-пути на `lithoseq/`.
9. RAM: кадр Y 76800 Б + 2 аккумулятора REFLECT-4 по 76800 Б → в AXI SRAM
   (512 КБ) помещается с запасом. В .ld/линкере — секция для буферов DMA
   **вне** DTCM (DMA туда не достаёт) и с учётом D-Cache
   (`SCB_CleanInvalidateDCache` вокруг DMA или MPU non-cacheable регион).

## Подключение OV7670 (без FIFO) к морфо-разъёмам

| OV7670 | Nucleo-H743ZI2 | Функция |
|---|---|---|
| D0–D7 | PC6 PC7 PC8 PC9 PC11 PB6 PB8 PB9 | DCMI_D0–D7 |
| PCLK | PA6 | DCMI_PIXCLK |
| HREF | PA4 | DCMI_HSYNC |
| VSYNC | PB7 | DCMI_VSYNC |
| XCLK | PA8 (MCO1) | тактирование камеры |
| SIOC/SIOD | PB10/PB11 (I2C2) или PB8/PB9 → тогда D5/D6 перенести | SCCB |
| 3V3/GND | 3V3/GND | питание |

⚠ Раскладку D5–D7/SCCB финализировать в CubeMX — возможны конфликты ног,
таблица — отправная точка. Жгуты ≤ 10 см.

## Порядок бринг-апа

Строго по 08-TEST-PLAN: T1.1 (кадр в RAM, дамп по CDC тем же протоколом,
что уже понимает `tools/viewer.py`) → T1.2 (авторежимы мертвы) → T1.3
(мира, ROI) → T1.4 (flat-field) → T1.5 (повторяемость вставки).
