import { describe, expect, it } from 'vitest';
import { chooseCommand } from '../ai/heuristic';
import { apply, createMatch, tick } from '../engine/engine';
import { validateDeck } from '../engine/deck';
import { ALL_BATTLES, CAMPAIGN } from './campaign';
import { CARD_INDEX } from './cards';

describe('campaign data', () => {
  it('has unique battle ids', () => {
    const ids = ALL_BATTLES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses only legal sequences and known cards', () => {
    for (const b of ALL_BATTLES) {
      expect(validateDeck(b.playerDeck), `${b.id} player`).toEqual([]);
      expect(validateDeck(b.opponent.deck), `${b.id} opponent`).toEqual([]);
      for (const x of b.scenario?.startingSites ?? []) expect(CARD_INDEX[x.cardId]?.type, b.id).toBe('site');
      for (const x of b.scenario?.startingAgents ?? []) expect(CARD_INDEX[x.cardId]?.type, b.id).toBe('agent');
    }
  });

  it('gives every battle a briefing, a victory scene and an objective', () => {
    for (const act of CAMPAIGN) {
      for (const b of act.battles) {
        expect(b.briefing.length, b.id).toBeGreaterThan(0);
        expect(b.victory.length, b.id).toBeGreaterThan(0);
        expect(b.objective, b.id).not.toBe('');
      }
    }
  });

  it('plays every battle to completion with only legal commands', () => {
    for (const b of ALL_BATTLES) {
      for (let seed = 1; seed <= 3; seed++) {
        const s = createMatch({
          seed, decks: [b.playerDeck, b.opponent.deck], regions: b.regions, config: b.config, scenario: b.scenario,
        });
        while (s.winner === null) {
          if (s.tick % 4 === 0) {
            for (const p of [0, 1] as const) {
              const cmd = chooseCommand(s, p);
              if (cmd) expect(apply(s, cmd), b.id).toBeNull();
            }
          }
          tick(s);
        }
      }
    }
  });
});
