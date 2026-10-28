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

Pick a starter sequence and a difficulty, then fight the AI. Space pauses the game, and Esc cancels
a selection. The full rules are in [`docs/RULES.md`](docs/RULES.md).

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Starts the dev server |
| `npm run build` | Typechecks and builds a production bundle into `dist/` |
| `npm test` | Runs the engine, deck and AI tests (Vitest) |
| `npm run sim [n]` | Plays `n` AI-vs-AI games per deck matchup and prints win rates, for balance checks |

## Layout

```
docs/RULES.md        rules spec: what follows the original, what's fixed, what we decided
src/engine/          rules engine: no UI code, deterministic for a given seed
  engine.ts          match setup, commands, the tick clock, conflicts, influence, effects
  config.ts          every tunable number (day length, gold, influence cap, limits)
  deck.ts            sequence (deck) validation
src/data/            card definitions and starter decks, written as plain data
src/ai/heuristic.ts  rule-based AI opponent
src/ui/              React UI
scripts/sim.ts       headless balance simulator
```

The engine works on plain data. The UI, the AI and the simulator all drive it the same way:
`apply(state, command)` between ticks and `tick(state)` to advance the clock. Online multiplayer
can later run the same engine on a server. A new card is usually just a new entry in
`src/data/cards.ts`.
