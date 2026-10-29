import { describe, expect, it } from 'vitest';
// @ts-expect-error: plain JS module shared with the Node audio scripts
import { MUSIC, PROOFS, SFX, requestFor } from '../../audio/subjects.mjs';
import type { LogKind } from '../engine/types';
import { sfxFor } from '../ui/Match';
import { ALL_BATTLES, battleMusic } from './campaign';

const KINDS: LogKind[] = ['reshuffle', 'recruit', 'ready', 'send', 'gain', 'clash', 'eliminate', 'build', 'built', 'play',
  'resolve', 'fizzle', 'bounce', 'destroy', 'control', 'lose-control', 'dusk', 'scenario', 'end'];

describe('audio cues', () => {
  it('has a music prompt for every track the game plays', () => {
    const used = new Set(['theme', 'story', 'victory', 'defeat', 'venice', 'florence', 'war', 'rome', ...ALL_BATTLES.map(battleMusic)]);
    for (const id of used) expect(MUSIC, id).toHaveProperty(id);
  });

  it('has a sound effect prompt for every effect the game plays, and no unused ones', () => {
    const used = new Set(KINDS.flatMap((k) => [sfxFor(k, 0), sfxFor(k, 1)]).filter(Boolean));
    expect([...used].sort()).toEqual(Object.keys(SFX).sort());
  });

  it('builds valid Audio Studio requests', () => {
    const all = [
      ...Object.keys(MUSIC).map((id) => requestFor('music', id)),
      ...Object.keys(SFX).map((id) => requestFor('sfx', id)),
      ...PROOFS.map((p: { kind: string; id: string }) => requestFor(p.kind, p.id)),
    ];
    for (const r of all) {
      expect(r.prompt).toBeTruthy();
      expect(r.seconds).toBeGreaterThanOrEqual(1);
      expect(r.seconds).toBeLessThanOrEqual(r.model === 'music' ? 240 : 47);
    }
  });
});
