// Headless AI-vs-AI balance check: `npm run sim [gamesPerMatchup]`.
import { chooseCommand } from '../src/ai/heuristic';
import { STARTER_DECKS } from '../src/data/decks';
import { apply, createMatch, tick } from '../src/engine/engine';

const games = Number(process.argv[2] ?? 100);
console.log(`${games} games per matchup (deck vs deck, both seats)\n`);
for (let a = 0; a < STARTER_DECKS.length; a++) {
  for (let b = a + 1; b < STARTER_DECKS.length; b++) {
    const wins = [0, 0, 0];
    let days = 0;
    let timeouts = 0;
    for (let g = 0; g < games; g++) {
      const swap = g % 2 === 1;
      const decks: [string[], string[]] = swap
        ? [STARTER_DECKS[b].cards, STARTER_DECKS[a].cards]
        : [STARTER_DECKS[a].cards, STARTER_DECKS[b].cards];
      const s = createMatch({ seed: g + 1, decks });
      while (s.winner === null) {
        if (s.tick % 3 === 0) {
          for (const p of [0, 1] as const) {
            const cmd = chooseCommand(s, p);
            if (cmd) apply(s, cmd);
          }
        }
        tick(s);
      }
      const day = s.tick / s.config.ticksPerDay;
      days += day;
      if (day >= s.config.maxDays) timeouts++;
      if (s.winner === 'draw') wins[2]++;
      else wins[(s.winner === 0) !== swap ? 0 : 1]++;
    }
    console.log(
      `${STARTER_DECKS[a].name.padEnd(16)} ${wins[0]} – ${wins[1]} ${STARTER_DECKS[b].name.padEnd(16)}` +
        ` draws ${wins[2]}, avg ${(days / games).toFixed(1)} days, ${timeouts} hit the day cap`,
    );
  }
}
