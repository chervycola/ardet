# Is My — прошивки (скелеты, It-1…3)

```
firmware/
  common/midi_map.h    — ЕДИНСТВЕННЫЙ источник MIDI-маппинга (§C1)
  pult/                — пульт: оси→14-bit CC, органы, питание (§C2)
    main.c, bsp.h
  module/              — модуль: MIDI→CV, FSM mute, DAC8568 (§C3)
    main.c, bsp.h, dac8568.h
```

## Принцип

Логика написана в чистом C поверх тонкого **BSP-интерфейса** (`bsp.h`).
HAL/CubeMX-код в репо не живёт: под Nucleo-G431 создаётся обычный
CubeIDE-проект, из него реализуется `bsp_g431.c` (список функций — в
`bsp.h` каждой стороны), а `main.c` и `midi_map.h` подключаются как есть.

## Настройка CubeMX (Nucleo-G431KB)

**Пульт:**
- ADC1: каналы осей + ручек; oversampling ratio ×16, right shift 0 → 16-bit
- USART: 31250 8N1 (TX → буфер → TRS Type A: Tip=data, Ring=+3.3 через 220Ω)
- USB Device FS: класс Audio/MIDI (или tinyusb-MIDI)
- I2C: MAX17048 (fuel gauge); GPIO: тумблеры (pull-up), LED, load-switch
- Flash: последняя страница под `cal_t`

**Модуль:**
- USART RX: 31250, RX-interrupt → кольцевой буфер (`bsp_midi_rx_pop`)
- SPI: DAC8568 (mode 1, 32-bit кадр = 4 байта, SYNC=NSS вручную)
- GPIO: DG419-мультиплексоры (MODE ×2, ROUTE ×2), ROUTE-свитч, LED

## Что уже в логике

- 14-bit оси: EMA + deadzone(X-центр) + порог + rate-limit 200 Гц; края/центр шлются всегда
- Y=throttle (весь ход, без центра), X=центрируемая (deadzone у 8192) — B2.1
- Калибровка min/max/center во flash, сервисный жест: press при включении
- LINK: две семантики компайл-флагом (`LINK_MODE`) — вердикт на It-1 (R4)
- Парсер: running status, MSB→LSB c таймаутом 20 мс (fallback MSB<<7), чужой канал игнор
- FSM mute: raised-cosine ramp 30 мс → переключение DG419 → ramp up (MODE и ROUTE)
- ARM = глобальный gate через тот же мьют-канал; safe-state mute при старте
- GATE-фронты со slew (де-клик); потеря линка → hold последних значений
- Канал G ЦАП = Iq_ref серв (опора тока покоя, S4.3)

## TODO (по итерациям)

- [ ] `bsp_g431.c` обеих сторон (It-1/It-2)
- [ ] USB-MIDI дескрипторы (tinyusb) — пульт
- [ ] Сон между тиками (WFI) и standby по автоотключению — пульт
- [ ] Индикация link-lost — модуль
- [ ] Сброс узлов режима в FSM_SWITCH (фаза VCO, детектор) — модуль, It-5
- [ ] Полноценный LUT вместо scale/offset при сборке экземпляров (§12)

## Хост-тест

`host_test/` — заглушки BSP; собирается обычным gcc, гоняет логику
(парсер, маппинг осей, FSM) без железа. Запуск: `cd host_test && ./build.sh`.
