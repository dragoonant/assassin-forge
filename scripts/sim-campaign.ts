// Campaign balance check: `npm run sim:campaign [games] [playerThinkEvery]`.
// The player seat is played by the same heuristic AI, thinking every N ticks (default 4).
import { chooseCommand } from '../src/ai/heuristic';
import { ALL_BATTLES, type Battle } from '../src/data/campaign';
import { apply, createMatch, tick } from '../src/engine/engine';

const games = Number(process.argv[2] ?? 100);
const playerThink = Number(process.argv[3] ?? 4);

export function playBattle(b: Battle, seed: number, think: [number, number]) {
  const s = createMatch({
    seed, decks: [b.playerDeck, b.opponent.deck], names: ['Isotta', b.opponent.name],
    regions: b.regions, config: b.config, scenario: b.scenario,
  });
  while (s.winner === null) {
    for (const p of [0, 1] as const) {
      if (s.tick % think[p] === 0) {
        const cmd = chooseCommand(s, p);
        if (cmd) apply(s, cmd);
      }
    }
    tick(s);
  }
  return s;
}

console.log(`${games} games per battle, player thinks every ${playerThink} ticks\n`);
for (const b of ALL_BATTLES) {
  let wins = 0;
  let days = 0;
  for (let g = 0; g < games; g++) {
    const s = playBattle(b, g + 1, [playerThink, b.opponent.thinkEvery]);
    if (s.winner === 0) wins++;
    days += s.tick / s.config.ticksPerDay;
  }
  console.log(`${b.title.padEnd(22)} player wins ${String(Math.round((wins / games) * 100)).padStart(3)}%  avg ${(days / games).toFixed(1)} days`);
}
