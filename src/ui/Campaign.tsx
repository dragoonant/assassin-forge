import { useState } from 'react';
import { ALL_BATTLES, CAMPAIGN, CAMPAIGN_TITLE, type Battle, type StoryLine } from '../data/campaign';
import type { MatchSetup } from '../engine/engine';
import type { PlayerId } from '../engine/types';
import { portraitArt, sceneArt } from './art';
import { Match } from './Match';

const STORAGE_KEY = 'recollection.campaign.v1';

function loadCompleted(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function saveCompleted(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Progress just won't persist (private window, blocked storage).
  }
}

/** A battle is playable once every battle before it is complete. */
function isUnlocked(battle: Battle, completed: string[]): boolean {
  const i = ALL_BATTLES.indexOf(battle);
  return ALL_BATTLES.slice(0, i).every((b) => completed.includes(b.id));
}

type Screen =
  | { kind: 'map' }
  | { kind: 'briefing'; battle: Battle }
  | { kind: 'battle'; battle: Battle; seed: number }
  | { kind: 'victory'; battle: Battle };

export function Campaign({ onExit }: { onExit: () => void }) {
  const [completed, setCompleted] = useState<string[]>(loadCompleted);
  const [screen, setScreen] = useState<Screen>({ kind: 'map' });

  const startBattle = (battle: Battle) => setScreen({ kind: 'battle', battle, seed: Math.floor(Math.random() * 2 ** 32) });

  if (screen.kind === 'briefing') {
    const b = screen.battle;
    return (
      <StoryScene
        battle={b}
        heading={`${b.place} · ${b.date}`}
        lines={b.briefing}
        footer={<p className="scene-objective"><b>Objective:</b> {b.objective}</p>}
        action="Begin battle"
        onAction={() => startBattle(b)}
        onBack={() => setScreen({ kind: 'map' })}
      />
    );
  }

  if (screen.kind === 'battle') {
    const b = screen.battle;
    const setup: MatchSetup = {
      seed: screen.seed,
      decks: [b.playerDeck, b.opponent.deck],
      names: ['Isotta', b.opponent.name],
      regions: b.regions,
      config: b.config,
      scenario: b.scenario,
    };
    const finish = (winner: PlayerId | 'draw') => {
      if (winner !== 0) return setScreen({ kind: 'map' });
      const next = completed.includes(b.id) ? completed : [...completed, b.id];
      saveCompleted(next);
      setCompleted(next);
      setScreen({ kind: 'victory', battle: b });
    };
    return (
      <Match
        key={screen.seed}
        setup={setup}
        aiThinkEvery={b.opponent.thinkEvery}
        briefing={{ title: b.title, objective: b.objective, tips: b.tips }}
        onExit={() => setScreen({ kind: 'map' })}
        onFinish={finish}
        onRetry={() => startBattle(b)}
      />
    );
  }

  if (screen.kind === 'victory') {
    const b = screen.battle;
    const next = ALL_BATTLES[ALL_BATTLES.indexOf(b) + 1];
    return (
      <StoryScene
        battle={b}
        heading={`Victory · ${b.title}`}
        lines={b.victory}
        action={next ? `Next: ${next.title}` : 'Back to the campaign'}
        onAction={() => setScreen(next ? { kind: 'briefing', battle: next } : { kind: 'map' })}
        onBack={() => setScreen({ kind: 'map' })}
      />
    );
  }

  return (
    <main className="menu campaign">
      <button type="button" className="link" onClick={onExit}>← Menu</button>
      <h1>{CAMPAIGN_TITLE}</h1>
      <p className="tagline">Italy, 1525–1527. A printer&rsquo;s daughter, a Templar treasurer, and the road to the Sack of Rome.</p>
      <p className="muted progress">{completed.length} of {ALL_BATTLES.length} memories recovered</p>
      {CAMPAIGN.map((act) => (
        <section key={act.id} className="act">
          <h2>{act.title} <span>{act.subtitle}</span></h2>
          <div className="battles">
            {act.battles.map((b) => {
              const done = completed.includes(b.id);
              const open = isUnlocked(b, completed);
              return (
                <button
                  key={b.id}
                  type="button"
                  className={`battle${done ? ' is-done' : ''}${open ? '' : ' is-locked'}`}
                  disabled={!open}
                  onClick={() => setScreen({ kind: 'briefing', battle: b })}
                >
                  <span className="battle-place">{b.place} · {b.date}</span>
                  <strong>{open ? b.title : 'Locked memory'}</strong>
                  <span className="battle-state">{done ? '✓ Synchronised' : open ? 'Play' : '—'}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
      {completed.length > 0 && (
        <button
          type="button"
          className="link reset"
          onClick={() => {
            if (window.confirm('Reset campaign progress?')) {
              saveCompleted([]);
              setCompleted([]);
            }
          }}
        >
          Reset progress
        </button>
      )}
    </main>
  );
}

function StoryScene({ battle, heading, lines, footer, action, onAction, onBack }: {
  battle: Battle;
  heading: string;
  lines: StoryLine[];
  footer?: React.ReactNode;
  action: string;
  onAction: () => void;
  onBack: () => void;
}) {
  // Lines appear one at a time; clicking the scene shows the next one.
  const [shown, setShown] = useState(1);
  const all = shown >= lines.length;
  const backdrop = sceneArt(battle.id);
  return (
    <main
      className="scene"
      style={backdrop ? { backgroundImage: `linear-gradient(rgba(10,8,6,.72), rgba(10,8,6,.92)), url(${backdrop})` } : undefined}
      onClick={() => !all && setShown((n) => n + 1)}
    >
      <div className="scene-box">
        <button type="button" className="link" onClick={(e) => { e.stopPropagation(); onBack(); }}>← Campaign</button>
        <p className="scene-heading">{heading}</p>
        <h1>{battle.title}</h1>
        <div className="scene-lines">
          {lines.slice(0, shown).map((l, i) => {
            const portrait = l.speaker && l.speaker !== 'Narrator' ? portraitArt(l.speaker) : undefined;
            return (
              <div key={i} className={`line${!l.speaker || l.speaker === 'Narrator' ? ' narration' : ''}`}>
                {portrait && <img className="portrait" src={portrait} alt="" />}
                <div>
                  {l.speaker && l.speaker !== 'Narrator' && <span className="speaker">{l.speaker}</span>}
                  <p>{l.text}</p>
                </div>
              </div>
            );
          })}
        </div>
        {all ? (
          <>
            {footer}
            <button type="button" className="primary" onClick={(e) => { e.stopPropagation(); onAction(); }}>{action}</button>
          </>
        ) : (
          <p className="muted continue">Click to continue · <button type="button" className="link" onClick={(e) => { e.stopPropagation(); setShown(lines.length); }}>Skip</button></p>
        )}
      </div>
    </main>
  );
}
