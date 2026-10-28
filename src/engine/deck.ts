import { CARD_INDEX } from '../data/cards';
import { DECK_RULES } from './config';
import type { Specialty } from './types';

/** Returns every rule the sequence breaks; an empty list means it's legal. */
export function validateDeck(cardIds: string[]): string[] {
  const errors: string[] = [];
  if (cardIds.length < DECK_RULES.minSize || cardIds.length > DECK_RULES.maxSize) {
    errors.push(`A sequence needs ${DECK_RULES.minSize}–${DECK_RULES.maxSize} cards (has ${cardIds.length}).`);
  }
  const counts = new Map<string, number>();
  for (const id of cardIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  const specialties = new Set<Specialty>();
  for (const [id, n] of counts) {
    const card = CARD_INDEX[id];
    if (!card) {
      errors.push(`Unknown card: ${id}.`);
      continue;
    }
    const limit = card.unique ? 1 : DECK_RULES.maxCopies;
    if (n > limit) errors.push(`${card.name}: at most ${limit} ${limit === 1 ? 'copy' : 'copies'} (has ${n}).`);
    if (card.specialty !== 'gold') specialties.add(card.specialty);
  }
  if (specialties.size > DECK_RULES.maxSpecialties) {
    errors.push(`Gold plus at most ${DECK_RULES.maxSpecialties} other specialties (has ${[...specialties].join(', ')}).`);
  }
  return errors;
}
