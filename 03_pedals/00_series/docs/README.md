# SYSTEM SUICIDE — Illustrated guide

Канонический иллюстрированный гид по серии: 9 модулей, signal chain, edition.

## Файлы

- `SYSTEM_SUICIDE_GUIDE.md` — markdown-источник (canonical).
- `style.css` — CSS для HTML/PDF.
- `build.sh` — сборка в HTML/DOCX/PDF через pandoc.

## Сборка

```bash
./build.sh
```

Создаёт:
- `SYSTEM_SUICIDE_GUIDE.html` — для браузера, всегда.
- `SYSTEM_SUICIDE_GUIDE.docx` — для Word, всегда.
- `SYSTEM_SUICIDE_GUIDE.pdf` — если установлен `xelatex` / `wkhtmltopdf` / `weasyprint`.

## Зависимости

Минимум:
```
apt-get install pandoc
```

Для PDF:
```
apt-get install texlive-xetex texlive-fonts-recommended texlive-lang-cyrillic texlive-latex-recommended lmodern
```

## Соотношение с остальным репо

Этот гид — концептуальный обзор для понимания и показа. Технические детали:

- Канонический бриф — `../SYSTEM_SUICIDE.md`.
- Аудит — `../audit/`.
- Decisions — `../decisions/`.
- Исправления — `../fixes/`.

Гид строится на материале выше, но не дублирует engineering-детали.

## Статус и происхождение

- Статус: концептуальный гид по серии. Учитывает Decisions 12/13: Is My — MOSFET-shaper с пультом DJI C5, And My — TBD. Decisions 14/15 (re-spec ISYL, оптическая шина) в гид пока не внесены, см. `../decisions/`.
- Источник: `origin/SS:00_series/docs/` (`6d20ae1`, 2026-07-07). Гид пришёл из ветки `origin/claude/review-last-day-concept-HWbFa` (`f7f0662`–`59fb95e`, 2026-05-12) с консолидацией `1b5250d` (Is My / And My). Версия гида в HWbFa старше и отличается только описанием Is My/And My до Decisions 12/13, поэтому её не переносили.
- Иллюстрированный туториал Last Day (`last_day_tutorial.html`, на ветке HWbFa лежал в `synth/docs/`) относится к одному модулю и лежит в `../../02_last_day/`.
- При сборке репо исправлен путь к папке Is My в `SYSTEM_SUICIDE_GUIDE.md` (`../../03_is_my/`). `./build.sh` проверен на копии папки: HTML и DOCX собираются (pandoc 3.1.3).
