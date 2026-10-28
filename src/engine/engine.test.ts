import { describe, expect, it } from 'vitest';
import { chooseCommand } from '../ai/heuristic';
import { STARTER_DECKS } from '../data/decks';
import { validateDeck } from './deck';
import { apply, createMatch, gainInfluence, loseInfluence, tick } from './engine';
import type { MatchState, PlayerId } from './types';

const filler = Array<string>(30).fill('florentine-merchant');

function newMatch(seed = 1): MatchState {
  return createMatch({ seed, decks: [filler, filler] });
}

function give(s: MatchState, p: PlayerId, cardId: string): number {
  const uid = s.nextUid++;
  s.players[p].hand.push({ uid, cardId });
  s.players[p].gold = 99;
  return uid;
}

function run(s: MatchState, ticks: number): void {
  for (let i = 0; i < ticks; i++) tick(s);
}

function recruit(s: MatchState, p: PlayerId, cardId: string): number {
  const uid = give(s, p, cardId);
  expect(apply(s, { type: 'play', player: p, cardUid: uid })).toBeNull();
  return uid;
}

describe('setup', () => {
  it('deals a ready hand and starting gold', () => {
    const s = newMatch();
    expect(s.players[0].hand).toHaveLength(6);
    expect(s.players[0].deck).toHaveLength(24);
    expect(s.players[0].gold).toBe(4);
  });

  it('allows one reshuffle, only before the first card is played', () => {
    const s = newMatch();
    expect(apply(s, { type: 'reshuffle', player: 0 })).toBeNull();
    expect(apply(s, { type: 'reshuffle', player: 0 })).not.toBeNull();
    expect(s.players[0].hand).toHaveLength(6);
  });
});

describe('agents', () => {
  it('recruits, campaigns uncontested, then rests', () => {
    const s = newMatch();
    const uid = recruit(s, 0, 'mendicant-monk');
    const agent = () => s.agents.find((a) => a.uid === uid)!;
    expect(agent().status).toBe('recruiting');
    run(s, s.config.halfDay);
    expect(agent().status).toBe('ready');

    expect(apply(s, { type: 'send', player: 0, agentUid: uid, region: 1 })).toBeNull();
    run(s, s.config.halfDay);
    expect(s.regions[1].influence[0]).toBe(2);
    expect(agent().status).toBe('resting');
    run(s, s.config.halfDay);
    expect(agent().status).toBe('ready');
  });

  it('contested campaigns clash: strength drops by the other agent’s influence', () => {
    const s = newMatch();
    const guard = recruit(s, 0, 'city-guard'); // 3 str / 1 inf
    const monk = recruit(s, 1, 'mendicant-monk'); // 1 str / 2 inf
    run(s, s.config.halfDay);
    apply(s, { type: 'send', player: 1, agentUid: monk, region: 0 });
    run(s, 5);
    apply(s, { type: 'send', player: 0, agentUid: guard, region: 0 });
    run(s, s.config.halfDay);

    expect(s.agents.find((a) => a.uid === monk)).toBeUndefined();
    expect(s.players[1].archive.map((c) => c.uid)).toContain(monk);
    expect(s.agents.find((a) => a.uid === guard)!.strength).toBe(1);
    expect(s.regions[0].influence).toEqual([0, 0]);
  });

  it('first strike kills before the enemy can hit back', () => {
    const s = newMatch();
    const soldier = recruit(s, 0, 'papal-soldier'); // 2 str / 1 inf, first strike
    const cutpurse = recruit(s, 1, 'cutpurse'); // 1 str / 1 inf
    run(s, s.config.halfDay);
    apply(s, { type: 'send', player: 1, agentUid: cutpurse, region: 2 });
    apply(s, { type: 'send', player: 0, agentUid: soldier, region: 2 });
    run(s, s.config.halfDay);
    expect(s.agents.find((a) => a.uid === soldier)!.strength).toBe(2);
    expect(s.agents.find((a) => a.uid === cutpurse)).toBeUndefined();
  });

  it('stealth agents are never contested', () => {
    const s = newMatch();
    const novice = recruit(s, 0, 'novice-assassin');
    const guard = recruit(s, 1, 'city-guard');
    run(s, s.config.halfDay);
    apply(s, { type: 'send', player: 1, agentUid: guard, region: 0 });
    apply(s, { type: 'send', player: 0, agentUid: novice, region: 0 });
    run(s, s.config.halfDay);
    expect(s.regions[0].influence).toEqual([1, 1]);
  });

  it('limits campaigning agents per region', () => {
    const s = newMatch();
    const ids = ['florentine-merchant', 'florentine-merchant', 'florentine-merchant'].map((c) => recruit(s, 0, c));
    run(s, s.config.halfDay);
    expect(apply(s, { type: 'send', player: 0, agentUid: ids[0], region: 0 })).toBeNull();
    expect(apply(s, { type: 'send', player: 0, agentUid: ids[1], region: 0 })).toBeNull();
    expect(apply(s, { type: 'send', player: 0, agentUid: ids[2], region: 0 })).not.toBeNull();
  });
});

describe('influence and control', () => {
  it('takes control at 10 and erodes the opponent with any excess', () => {
    const s = newMatch();
    gainInfluence(s, 0, 1, 6);
    gainInfluence(s, 0, 0, 9);
    expect(s.regions[0].controller).toBeNull();
    gainInfluence(s, 0, 0, 3);
    expect(s.regions[0].influence).toEqual([10, 4]);
    expect(s.regions[0].controller).toBe(0);
  });

  it('keeps control while both are at 10, and hands it over when eroded', () => {
    const s = newMatch();
    gainInfluence(s, 0, 0, 10);
    gainInfluence(s, 0, 1, 10);
    expect(s.regions[0].controller).toBe(0);
    gainInfluence(s, 0, 1, 1);
    expect(s.regions[0].influence).toEqual([9, 10]);
    expect(s.regions[0].controller).toBe(1);
  });

  it('loses control when drained below 10', () => {
    const s = newMatch();
    gainInfluence(s, 2, 0, 10);
    loseInfluence(s, 2, 0, 2);
    expect(s.regions[2].controller).toBeNull();
  });
});

describe('dusk', () => {
  it('pays income, draws a card, and scores built sites', () => {
    const s = newMatch();
    s.players[0].hand.pop();
    const uid = give(s, 0, 'duomo');
    expect(apply(s, { type: 'play', player: 0, cardUid: uid, target: { kind: 'region', region: 1 } })).toBeNull();
    const gold = s.players[0].gold;
    const hand = s.players[0].hand.length;
    run(s, s.config.ticksPerDay);
    expect(s.regions[1].influence[0]).toBe(2);
    expect(s.players[0].gold).toBe(gold + 1);
    expect(s.players[0].hand.length).toBe(hand + 1);
  });

  it('declares a winner at dusk, not before', () => {
    const s = newMatch();
    gainInfluence(s, 0, 1, 10);
    gainInfluence(s, 2, 1, 10);
    run(s, s.config.ticksPerDay - 1);
    expect(s.winner).toBeNull();
    tick(s);
    expect(s.winner).toBe(1);
  });

  it('breaks a timeout on total influence', () => {
    const s = createMatch({ seed: 1, decks: [filler, filler], config: { maxDays: 1 } });
    gainInfluence(s, 0, 0, 5);
    gainInfluence(s, 1, 1, 4);
    run(s, s.config.ticksPerDay);
    expect(s.winner).toBe(0);
  });
});

describe('actions', () => {
  it('fizzles when the target is gone, without a refund', () => {
    const s = newMatch();
    const monk = recruit(s, 1, 'mendicant-monk');
    run(s, s.config.halfDay);
    const blade = give(s, 0, 'poisoned-blade');
    const ambush = give(s, 0, 'ambush');
    apply(s, { type: 'play', player: 0, cardUid: blade, target: { kind: 'agent', uid: monk } });
    apply(s, { type: 'play', player: 0, cardUid: ambush, target: { kind: 'agent', uid: monk } });
    const gold = s.players[0].gold;
    run(s, s.config.quickDelay);
    expect(s.agents.find((a) => a.uid === monk)).toBeUndefined();
    expect(s.log.some((l) => l.text.includes('Ambush fizzles'))).toBe(true);
    expect(s.players[0].gold).toBe(gold);
  });

  it('bounces an enemy agent back to its owner’s hand', () => {
    const s = newMatch();
    s.players[1].hand.pop();
    const guard = recruit(s, 1, 'city-guard');
    run(s, s.config.halfDay);
    const scandal = give(s, 0, 'scandal');
    apply(s, { type: 'play', player: 0, cardUid: scandal, target: { kind: 'agent', uid: guard } });
    run(s, s.config.quickDelay);
    expect(s.players[1].hand.some((c) => c.uid === guard)).toBe(true);
  });
});

describe('decks', () => {
  it('ships legal starter decks', () => {
    for (const deck of STARTER_DECKS) expect(validateDeck(deck.cards), deck.name).toEqual([]);
  });

  it('rejects illegal sequences', () => {
    const tooMany = [...Array<string>(26).fill('florentine-merchant'), 'ezio-auditore', 'ezio-auditore', 'chapel', 'rumor', 'city-guard'];
    const errors = validateDeck(tooMany);
    expect(errors.some((e) => e.includes('Florentine Merchant'))).toBe(true);
    expect(errors.some((e) => e.includes('Ezio'))).toBe(true);
    expect(errors.some((e) => e.includes('specialties'))).toBe(true);
  });
});

describe('AI vs AI', () => {
  function simulate(seed: number, a: number, b: number): MatchState {
    const s = createMatch({ seed, decks: [STARTER_DECKS[a].cards, STARTER_DECKS[b].cards] });
    while (s.winner === null) {
      if (s.tick % 3 === 0) {
        for (const p of [0, 1] as const) {
          const cmd = chooseCommand(s, p);
          if (cmd) expect(apply(s, cmd)).toBeNull();
        }
      }
      tick(s);
    }
    return s;
  }

  it('is deterministic for a given seed', () => {
    const a = simulate(42, 0, 1);
    const b = simulate(42, 0, 1);
    expect(a.winner).toBe(b.winner);
    expect(a.tick).toBe(b.tick);
    expect(a.log).toEqual(b.log);
  });

  it('plays every deck matchup to completion with only legal commands', () => {
    for (let a = 0; a < STARTER_DECKS.length; a++) {
      for (let b = 0; b < STARTER_DECKS.length; b++) {
        for (let seed = 1; seed <= 5; seed++) {
          const s = simulate(seed, a, b);
          expect(s.tick).toBeLessThanOrEqual(s.config.maxDays * s.config.ticksPerDay);
        }
      }
    }
  });
});
