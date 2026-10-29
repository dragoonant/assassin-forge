"""Install chosen audio into the game: copy each pick to src/assets/audio/<kind>/<id>.mp3.

    python scripts/audio/install.py audio/out/music/theme/2.mp3 music/theme [more pairs...]
    python scripts/audio/install.py --picks audio/picks.json   # {"music/theme": "audio/out/music/theme/2.mp3", ...}

With ffmpeg on PATH, files are also loudness-normalised (EBU R128, -16 LUFS for music, -14 for effects)
and re-encoded at a size that suits the web. Without it they are copied as they are.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOUDNESS = {"music": -16, "sfx": -14}
BITRATE = {"music": "128k", "sfx": "96k"}


def install(src: str, dest: str) -> None:
    kind, name = dest.split("/", 1)
    if kind not in LOUDNESS:
        raise SystemExit(f"Unknown audio kind {kind!r}: use music or sfx")
    source = Path(src) if Path(src).is_absolute() else ROOT / src
    out = ROOT / "src" / "assets" / "audio" / kind / f"{name}.mp3"
    out.parent.mkdir(parents=True, exist_ok=True)
    if shutil.which("ffmpeg"):
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(source),
             "-af", f"loudnorm=I={LOUDNESS[kind]}:TP=-1.5:LRA=11", "-ar", "44100", "-b:a", BITRATE[kind], str(out)],
            check=True,
        )
    else:
        shutil.copyfile(source, out)
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
