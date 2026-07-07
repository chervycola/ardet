#!/usr/bin/env bash
# Build illustrated guide in DOCX / HTML / PDF formats.
# Source: SYSTEM_SUICIDE_GUIDE.md
# Requires: pandoc; for PDF also a LaTeX engine (xelatex) or wkhtmltopdf.

set -euo pipefail

cd "$(dirname "$0")"

SRC="SYSTEM_SUICIDE_GUIDE.md"
OUT_BASE="SYSTEM_SUICIDE_GUIDE"

command -v pandoc >/dev/null 2>&1 || { echo "pandoc not installed"; exit 1; }

echo "[1/3] Building HTML..."
pandoc "$SRC" \
  --from markdown \
  --to html5 \
  --standalone \
  --toc \
  --toc-depth=2 \
  --css=style.css \
  --metadata pagetitle="SYSTEM SUICIDE" \
  -o "${OUT_BASE}.html"

echo "[2/3] Building DOCX..."
pandoc "$SRC" \
  --from markdown \
  --to docx \
  --toc \
  --toc-depth=2 \
  -o "${OUT_BASE}.docx"

echo "[3/3] Building PDF (best effort)..."
if command -v xelatex >/dev/null 2>&1; then
  pandoc "$SRC" \
    --from markdown \
    --to pdf \
    --pdf-engine=xelatex \
    --toc \
    --toc-depth=2 \
    -o "${OUT_BASE}.pdf"
  echo "  PDF via xelatex: ${OUT_BASE}.pdf"
elif command -v wkhtmltopdf >/dev/null 2>&1; then
  pandoc "$SRC" \
    --from markdown \
    --to html5 \
    --standalone \
    --toc \
    --toc-depth=2 \
    --css=style.css \
    --pdf-engine=wkhtmltopdf \
    -o "${OUT_BASE}.pdf"
  echo "  PDF via wkhtmltopdf: ${OUT_BASE}.pdf"
elif command -v weasyprint >/dev/null 2>&1; then
  pandoc "$SRC" \
    --from markdown \
    --to html5 \
    --standalone \
    --toc \
    --toc-depth=2 \
    --css=style.css \
    --pdf-engine=weasyprint \
    -o "${OUT_BASE}.pdf"
  echo "  PDF via weasyprint: ${OUT_BASE}.pdf"
else
  echo "  PDF skipped: install xelatex (texlive-xetex) or wkhtmltopdf or weasyprint."
fi

echo "Done."
ls -lh "${OUT_BASE}".* 2>/dev/null | awk '{print "  " $9 "  " $5}'
