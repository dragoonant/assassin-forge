import { describe, expect, it } from 'vitest';
// @ts-expect-error: plain JS module shared with the Node art scripts
import { CARDS as PROMPTS, PROOFS, SCENES, promptFor } from '../../art/subjects.mjs';
import { ALL_BATTLES } from './campaign';
import { CARDS } from './cards';

describe('art prompts', () => {
  it('covers every card and every battle backdrop, and nothing else', () => {
    expect(Object.keys(PROMPTS).sort()).toEqual(CARDS.map((c) => c.id).sort());
    expect(Object.keys(SCENES).sort()).toEqual(ALL_BATTLES.map((b) => b.id).sort());
  });

  it('builds a complete prompt for every subject and proof', () => {
    const all = [
      ...Object.keys(PROMPTS).map((id) => promptFor('cards', id)),
      ...Object.keys(SCENES).map((id) => promptFor('scenes', id)),
      ...PROOFS.map((p: { kind: string; id: string; style: string; base?: string }) => promptFor(p.kind, p.id, p.style, p.base)),
    ];
    for (const { prompt, aspect } of all) {
      expect(prompt).not.toMatch(/undefined/);
      expect(['4:3', '16:9']).toContain(aspect);
    }
  });
});
