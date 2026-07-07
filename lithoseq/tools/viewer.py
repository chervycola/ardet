#!/usr/bin/env python3
"""Просмотрщик LITHOSEQ: бинарный лог протокола (05 §6) или serial-порт.

  viewer.py out.bin --out picture.png     # рендер лога в PNG
  viewer.py /dev/ttyACM0 --live           # живой просмотр со стенда (фаза 1)

Рисует: карту 32x32, путь плейхеда, ноты (цвет = высота), пианоролл,
акценты, значение R. Зависимости: только stdlib; если установлен
matplotlib — используется он (качественнее), иначе встроенный PNG-рендер.
Для --live нужен pyserial.
"""
import argparse
import struct
import sys
import zlib

SYNC = 0xA5
PT_MAP32, PT_FEATURES, PT_EVENT, PT_PLAYHEAD = 1, 2, 3, 4
MAP_W = 32


def crc8(data: bytes) -> int:
    crc = 0
    for byte in data:
        crc ^= byte
        for _ in range(8):
            crc = ((crc << 1) ^ 0x07) & 0xFF if crc & 0x80 else (crc << 1) & 0xFF
    return crc


def parse_stream(buf: bytes):
    """-> (maps, features, events); мусор между пакетами пропускается.
    map: bytes 1024; feature: dict; event: (tick,x,y,note,gate,on,acc,a1,a2)."""
    maps, feats, events = [], [], []
    i = 0
    while i + 5 <= len(buf):
        if buf[i] != SYNC:
            i += 1
            continue
        ptype = buf[i + 1]
        plen = struct.unpack_from("<H", buf, i + 2)[0]
        end = i + 4 + plen + 1
        if end > len(buf):
            break
        payload = buf[i + 4:i + 4 + plen]
        if crc8(buf[i + 1:i + 4] + payload) != buf[end - 1]:
            i += 1
            continue
        if ptype == PT_MAP32 and plen == MAP_W * MAP_W:
            maps.append(payload)
        elif ptype == PT_FEATURES and plen == 6:
            r_q15, h = struct.unpack("<HI", payload)
            feats.append({"r": r_q15 / 32767.0, "hash": h})
        elif ptype == PT_EVENT and plen == 12:
            events.append(struct.unpack("<IBBBBBBBB", payload))
        i = end
    return maps, feats, events


# ---------- запасной рендер: чистый stdlib ----------

class Canvas:
    def __init__(self, w, h, bg=(18, 18, 22)):
        self.w, self.h = w, h
        self.px = bytearray(w * h * 3)
        for i in range(0, len(self.px), 3):
            self.px[i:i + 3] = bytes(bg)

    def dot(self, x, y, rgb, size=1):
        for dy in range(-(size // 2), size - size // 2):
            for dx in range(-(size // 2), size - size // 2):
                xx, yy = x + dx, y + dy
                if 0 <= xx < self.w and 0 <= yy < self.h:
                    o = (yy * self.w + xx) * 3
                    self.px[o:o + 3] = bytes(rgb)

    def save_png(self, path):
        raw = b"".join(
            b"\x00" + bytes(self.px[y * self.w * 3:(y + 1) * self.w * 3])
            for y in range(self.h))

        def chunk(tag, data):
            return (struct.pack(">I", len(data)) + tag + data +
                    struct.pack(">I", zlib.crc32(tag + data)))

        png = (b"\x89PNG\r\n\x1a\n" +
               chunk(b"IHDR", struct.pack(">IIBBBBB", self.w, self.h,
                                          8, 2, 0, 0, 0)) +
               chunk(b"IDAT", zlib.compress(raw, 9)) +
               chunk(b"IEND", b""))
        with open(path, "wb") as f:
            f.write(png)


def note_color(note, lo=36, hi=72):
    """Высота ноты -> цвет (тёмно-фиолетовый -> жёлтый, грубая plasma)."""
    t = max(0.0, min(1.0, (note - lo) / float(hi - lo)))
    r = int(40 + 215 * t)
    g = int(15 + 160 * t * t)
    b = int(120 + 60 * (1 - t) - 60 * t)
    return (r, g, max(0, b))


def render_fallback(maps, feats, events, out_path):
    scale = 8
    map_px = MAP_W * scale                     # 256
    pad = 16
    roll_w = 480
    W = pad + map_px + pad + roll_w + pad
    H = pad + map_px + pad + 14
    c = Canvas(W, H)

    # карта
    if maps:
        m = maps[-1]
        for y in range(MAP_W):
            for x in range(MAP_W):
                v = m[y * MAP_W + x]
                for dy in range(scale):
                    o = ((pad + y * scale + dy) * W + pad + x * scale) * 3
                    c.px[o:o + 3 * scale] = bytes((v, v, v)) * scale

    # путь плейхеда + ноты на карте
    ons = [e for e in events if e[5] == 1]
    for e in events:
        c.dot(pad + e[1] * scale + scale // 2,
              pad + e[2] * scale + scale // 2, (0, 90, 110), 2)
    for e in ons:
        c.dot(pad + e[1] * scale + scale // 2,
              pad + e[2] * scale + scale // 2, note_color(e[3]), 5)

    # пианоролл: x=tick, y=note
    if events:
        x0 = pad + map_px + pad
        tmax = max(e[0] for e in events) or 1
        notes = [e[3] for e in events]
        nlo, nhi = min(notes) - 2, max(notes) + 2
        for e in events:
            px = x0 + int(e[0] * (roll_w - 1) / tmax)
            py = pad + map_px - 1 - int((e[3] - nlo) * (map_px - 1) / (nhi - nlo))
            if e[4]:                               # gate держится
                c.dot(px, py, (70, 70, 78), 2)
        for e in ons:
            px = x0 + int(e[0] * (roll_w - 1) / tmax)
            py = pad + map_px - 1 - int((e[3] - nlo) * (map_px - 1) / (nhi - nlo))
            c.dot(px, py, note_color(e[3]), 4)
            if e[6]:                               # акцент — белая рамка
                c.dot(px, py - 4, (255, 255, 255), 2)

    # полоска-индикатор R внизу
    if feats:
        r = feats[-1]["r"]
        for x in range(int((W - 2 * pad) * r)):
            c.dot(pad + x, H - 8, (90, 200, 90), 2)

    c.save_png(out_path)
    print(f"saved {out_path} (fallback renderer)")


# ---------- matplotlib-рендер (если доступен) ----------

def render_matplotlib(maps, feats, events, out_path, title=""):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, (ax_map, ax_roll) = plt.subplots(
        1, 2, figsize=(13, 6), gridspec_kw={"width_ratios": [1, 1.4]})

    if maps:
        grid = [[maps[-1][y * MAP_W + x] for x in range(MAP_W)]
                for y in range(MAP_W)]
        ax_map.imshow(grid, cmap="gray", vmin=0, vmax=255,
                      interpolation="nearest")
    if events:
        ax_map.plot([e[1] for e in events], [e[2] for e in events],
                    color="tab:cyan", lw=0.4, alpha=0.5)
        ons = [e for e in events if e[5] == 1]
        if ons:
            sc = ax_map.scatter([e[1] for e in ons], [e[2] for e in ons],
                                c=[e[3] for e in ons], cmap="plasma", s=18)
            fig.colorbar(sc, ax=ax_map, label="note (MIDI)", shrink=0.8)
        gates = [e for e in events if e[4] == 1]
        ax_roll.scatter([e[0] for e in gates], [e[3] for e in gates],
                        s=4, c="lightgray", label="gate held")
        if ons:
            ax_roll.scatter([e[0] for e in ons], [e[3] for e in ons],
                            s=14, c="tab:blue", label="note on")
            acc = [e for e in ons if e[6]]
            if acc:
                ax_roll.scatter([e[0] for e in acc], [e[3] for e in acc],
                                s=26, facecolors="none", edgecolors="tab:red",
                                label="accent")
        ax_roll.set_xlabel("tick")
        ax_roll.set_ylabel("MIDI note")
        ax_roll.legend(loc="upper right", fontsize=8)

    r_txt = f"R={feats[-1]['r']:.3f}" if feats else "R=?"
    ax_map.set_title(f"map 32×32 + playhead   {r_txt}")
    n_on = sum(1 for e in events if e[5] == 1)
    ax_roll.set_title(f"events: {n_on} notes / {len(events)} ticks")
    if title:
        fig.suptitle(title)
    fig.tight_layout()
    fig.savefig(out_path, dpi=110)
    print(f"saved {out_path}")


def live(port):
    import serial  # pyserial
    ser = serial.Serial(port, 115200, timeout=0.1)
    buf = b""
    while True:
        buf += ser.read(4096)
        maps, feats, _ = parse_stream(buf)
        if maps:
            r = f"R={feats[-1]['r']:.3f}" if feats else ""
            sys.stdout.write(f"\rframes={len(maps)} {r}   ")
            sys.stdout.flush()
            buf = buf[-8192:]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("source", help="файл .bin или serial-порт")
    ap.add_argument("--out", default="lithoseq_view.png")
    ap.add_argument("--title", default="")
    ap.add_argument("--live", action="store_true")
    args = ap.parse_args()

    if args.live:
        live(args.source)
        return
    with open(args.source, "rb") as f:
        buf = f.read()
    maps, feats, events = parse_stream(buf)
    if not maps and not events:
        sys.exit("no valid packets found")
    n_on = sum(1 for e in events if e[5] == 1)
    print(f"{len(maps)} map(s), {len(feats)} features, "
          f"{len(events)} events ({n_on} note-ons)")
    try:
        render_matplotlib(maps, feats, events, args.out, args.title)
    except ImportError:
        render_fallback(maps, feats, events, args.out)


if __name__ == "__main__":
    main()
