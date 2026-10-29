# Recollection Revamp

A browser remake of *Assassin's Creed Recollection* (Ubisoft, iPad, 2011): a real-time card battle
for control of three city regions in Renaissance Italy.

> **Unofficial fan project for private, non-commercial use.** *Assassin's Creed* and its characters
> are trademarks of Ubisoft. This project is not affiliated with or endorsed by Ubisoft. Do not
> distribute it.

## Play

```sh
npm install
npm run dev        # open the printed localhost URL
```

- **Campaign: The Lodestone.** An original story in 16 battles, from a burned print shop in Venice to the
  Sack of Rome in 1527. Progress is saved in the browser. The outline is in [`docs/STORY.md`](docs/STORY.md).
- **Skirmish.** Pick a starter sequence and a difficulty, then fight the AI.

Space pauses the game, and Esc cancels a selection. The full rules are in [`docs/RULES.md`](docs/RULES.md).

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Starts the dev server |
| `npm run build` | Typechecks and builds a production bundle into `dist/` |
| `npm test` | Runs the engine, deck and AI tests (Vitest) |
| `npm run sim [n]` | Plays `n` AI-vs-AI games per deck matchup and prints win rates, for balance checks |
| `npm run sim:campaign [n]` | Plays every campaign battle `n` times with the AI in the player's seat and prints win rates |

## Art

Art follows the MGSD (master grade SD) style described in [`docs/ART-DIRECTION.md`](docs/ART-DIRECTION.md).
Art is generated with Flux Studio from `local-ai-studio`, on the studio PC:

```sh
node scripts/art/generate.mjs proofs     # then open art/out/proofs/index.html
python scripts/art/install.py --picks art/picks.json
```

The game shows whatever art is installed in `src/assets/art/` and runs fine without any.

## Audio

Music and sound effects are generated with Audio Studio from `local-ai-studio`; see [`docs/AUDIO.md`](docs/AUDIO.md).

```sh
node scripts/audio/generate.mjs proofs   # then open audio/out/proofs/index.html
python scripts/audio/install.py --picks audio/picks.json
```

The game plays whatever audio is installed in `src/assets/audio/` and is silent without it.

## Layout

```
docs/RULES.md        rules spec: what follows the original, what's fixed, what we decided
src/engine/          rules engine: no UI code, deterministic for a given seed
  engine.ts          match setup, commands, the tick clock, conflicts, influence, effects
  config.ts          every tunable number (day length, gold, influence cap, limits)
  deck.ts            sequence (deck) validation
src/data/            card definitions, starter decks and the campaign, written as plain data
src/ai/heuristic.ts  rule-based AI opponent
src/ui/              React UI
scripts/             balance simulators; art/ and audio/ hold the studio generators and installers
art/subjects.mjs     every art prompt: 64 cards, 16 story backdrops, and the proof set
audio/subjects.mjs   every music and sound-effect prompt, and the audio proof set
```

The engine works on plain data. The UI, the AI and the simulator all drive it the same way:
`apply(state, command)` between ticks and `tick(state)` to advance the clock. Online multiplayer
can later run the same engine on a server. A new card is usually just a new entry in
`src/data/cards.ts`.
