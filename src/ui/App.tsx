import { useState } from 'react';
import { REGION_SETS, STARTER_DECKS } from '../data/decks';
import type { MatchSetup } from '../engine/engine';
import { Campaign } from './Campaign';
import { Match, SoundToggles } from './Match';
import { useMusic } from './sound';

const SKIRMISH_MUSIC = ['venice', 'florence', 'war', 'rome'];

const DIFFICULTY = [
  { label: 'Easy', thinkEvery: 12 },
  { label: 'Normal', thinkEvery: 6 },
  { label: 'Hard', thinkEvery: 2 },
];

export function App() {
  const [deck, setDeck] = useState(STARTER_DECKS[0].id);
  const [difficulty, setDifficulty] = useState(1);
  const [match, setMatch] = useState<{ setup: MatchSetup; key: number } | null>(null);
  const [inCampaign, setInCampaign] = useState(false);
  useMusic(!inCampaign && !match ? 'theme' : undefined);

  if (inCampaign) return <Campaign onExit={() => setInCampaign(false)} />;

  if (match) {
    return (
      <Match
        key={match.key}
        setup={match.setup}
        aiThinkEvery={DIFFICULTY[difficulty].thinkEvery}
        music={SKIRMISH_MUSIC[match.key % SKIRMISH_MUSIC.length]}
        onExit={() => setMatch(null)}
      />
    );
  }

  const start = () => {
    const seed = Math.floor(Math.random() * 2 ** 32);
    const mine = STARTER_DECKS.find((d) => d.id === deck)!;
    const others = STARTER_DECKS.filter((d) => d.id !== deck);
    const theirs = others[seed % others.length];
    const regions = REGION_SETS[seed % REGION_SETS.length];
    setMatch({
      key: seed,
      setup: { seed, decks: [mine.cards, theirs.cards], names: ['You', theirs.name], regions },
    });
  };

  return (
    <main className="menu">
      <div className="menu-bar"><SoundToggles /></div>
      <h1>Recollection <span>Revamp</span></h1>
      <p className="tagline">A real-time battle for Renaissance Italy. Unofficial fan project, for private use only.</p>

      <button type="button" className="hero" onClick={() => setInCampaign(true)}>
        <span className="hero-kicker">Campaign</span>
        <strong>The Lodestone</strong>
        <span>Italy, 1525–1527. Follow Isotta Ferro from a burned print shop in Venice to the Sack of Rome.</span>
      </button>

      <h2>Skirmish: choose your sequence</h2>
      <div className="decks">
        {STARTER_DECKS.map((d) => (
          <button key={d.id} type="button" className={`deck${deck === d.id ? ' is-on' : ''}`} onClick={() => setDeck(d.id)}>
            <strong>{d.name}</strong>
            <span>{d.description}</span>
          </button>
        ))}
      </div>

      <h2>Opponent</h2>
      <div className="speed" role="group" aria-label="Difficulty">
        {DIFFICULTY.map((d, i) => (
          <button key={d.label} type="button" className={difficulty === i ? 'is-on' : ''} onClick={() => setDifficulty(i)}>
            {d.label}
          </button>
        ))}
      </div>

      <button type="button" className="primary start" onClick={start}>Start battle</button>

      <section className="howto">
        <h2>How to play</h2>
        <ul>
          <li>Reach <b>10 influence</b> in a region to control it. Control <b>two of three</b> at dusk to win.</li>
          <li>Time keeps moving. Most things take <b>half a day</b>. At each dusk you get gold, draw a card, and your sites add influence.</li>
          <li><b>Agents</b> recruit to your HQ. Click a ready agent, then a region, to campaign there. If no enemy is campaigning there, the agent adds its influence ✦.</li>
          <li>If an enemy agent is there, the two clash: each loses strength ♥ equal to the other's influence ✦. Send an agent into a region to block the enemy.</li>
          <li><b>Sites</b> add influence every dusk. <b>Actions</b> are one-shot tricks. Quick actions land almost instantly.</li>
          <li>Any influence over 10 erodes your opponent's influence there. Space pauses, Esc cancels a selection.</li>
        </ul>
      </section>
    </main>
  );
}
