# Audio

Music and sound effects come from **Audio Studio** in `local-ai-studio` (`audio-studio/`, port 7890), on the studio PC:

| Kind | Model | What |
|---|---|---|
| Music | ACE-Step 1.5 Turbo | Instrumental score in the spirit of the Assassin's Creed II soundtrack: lute, strings, frame drums, choir |
| Sound effects | Stable Audio Open 1.0 | Short effects for game events: clashes, the dusk bell, crowds |

Every cue's prompt is in [`audio/subjects.mjs`](../audio/subjects.mjs).

## Where each cue plays

| Music | Where |
|---|---|
| `theme` | Main menu, campaign map |
| `story` | Briefings and victory scenes |
| `venice`, `florence`, `war`, `rome` | Battles in the Prologue, Act I, Act II, and Acts III–IV; skirmishes pick one |
| `finale` | The last battle, La Calamita |
| `victory`, `defeat` | One-shot sting when a match ends |

Sound effects follow the engine's log events (`LogKind`): `recruit`, `send`, `build` and `play` sound only for your own
moves; `gain`, `clash`, `eliminate`, `resolve`, `fizzle`, `bounce`, `destroy` and `dusk` sound for both sides; `control`
plays when you take a region and `lose-control` when you lose one, or when the enemy takes one.

Music and effects each have a toggle (♫ and 🔊) on the menu, the campaign map and in battle. The choice is saved in the
browser. With no audio installed, the game is simply silent.

## Workflow (on the studio PC)

1. Start Audio Studio: `audio-studio\start.bat` (http://localhost:7890). Download its models first with
   `bash install/fetch-audio.sh` if needed.
2. In this repo: `node scripts/audio/generate.mjs proofs`, then open `audio/out/proofs/index.html` to listen.
3. After the proofs are approved: `node scripts/audio/generate.mjs music` and `node scripts/audio/generate.mjs sfx`.
4. Install your picks: `python scripts/audio/install.py --picks audio/picks.json`. That file maps each destination to
   its source, e.g. `{"music/theme": "audio/out/music/theme/2.mp3"}`. With ffmpeg available, the installer also
   normalises loudness and re-encodes for the web.
