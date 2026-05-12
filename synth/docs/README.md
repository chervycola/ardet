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
