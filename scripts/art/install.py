"""Install chosen art into the game: resize, convert to WebP, and save under src/assets/art/.

    python scripts/art/install.py art/out/cards/isotta-ferro/2.png cards/isotta-ferro [more pairs...]
    python scripts/art/install.py --picks art/picks.json   # {"cards/isotta-ferro": "art/out/cards/isotta-ferro/2.png", ...}

Needs Pillow (any Python with `pip install pillow`).
"""
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
WIDTHS = {"cards": 640, "portraits": 320, "scenes": 1600}


def install(src: str, dest: str) -> None:
    kind, name = dest.split("/", 1)
    if kind not in WIDTHS:
        raise SystemExit(f"Unknown art kind {kind!r}: use one of {', '.join(WIDTHS)}")
    img = Image.open(ROOT / src if not Path(src).is_absolute() else src).convert("RGB")
    width = min(WIDTHS[kind], img.width)
    img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    out = ROOT / "src" / "assets" / "art" / kind / f"{name}.webp"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "WEBP", quality=82, method=6)
    print(f"{src} -> {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")


def main(args: list[str]) -> None:
    if args[:1] == ["--picks"]:
        pairs = [(src, dest) for dest, src in json.loads((ROOT / args[1]).read_text()).items()]
    elif args and len(args) % 2 == 0:
        pairs = list(zip(args[::2], args[1::2]))
    else:
        raise SystemExit(__doc__)
    for src, dest in pairs:
        install(src, dest)


if __name__ == "__main__":
    main(sys.argv[1:])
