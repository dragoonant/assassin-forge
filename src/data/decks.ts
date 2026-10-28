export interface StarterDeck {
  id: string;
  name: string;
  description: string;
  cards: string[];
}

function expand(counts: Record<string, number>): string[] {
  return Object.entries(counts).flatMap(([id, n]) => Array<string>(n).fill(id));
}

export const STARTER_DECKS: StarterDeck[] = [
  {
    id: 'brotherhood',
    name: 'The Brotherhood',
    description: 'Gold · Crime · Scholar. Stealthy agents, card draw, and picking off enemy agents.',
    cards: expand({
      'florentine-merchant': 3, 'medici-banker': 2, 'claudia-auditore': 1, 'mercato-vecchio': 2, 'tax-collection': 1,
      'cutpurse': 3, 'novice-assassin': 3, 'la-volpe': 1, 'ezio-auditore': 1, 'thieves-den': 2,
      'poisoned-blade': 2, 'sabotage': 1,
      'apprentice': 3, 'leonardo': 1, 'library': 1, 'codex-page': 2, 'flying-machine': 1,
    }),
  },
  {
    id: 'borgia',
    name: 'House Borgia',
    description: 'Gold · Order · Faith. Tough soldiers and high-influence clergy.',
    cards: expand({
      'florentine-merchant': 2, 'medici-banker': 2, 'mercato-vecchio': 2, 'banco-medici': 1, 'bribe': 1,
      'city-guard': 3, 'papal-soldier': 3, 'condottiero': 2, 'bartolomeo': 1, 'cesare-borgia': 1,
      'barracks': 1, 'ambush': 1,
      'mendicant-monk': 3, 'preacher': 3, 'rodrigo-borgia': 1, 'chapel': 1, 'duomo': 1, 'blessing': 1,
    }),
  },
  {
    id: 'heralds',
    name: 'The Heralds',
    description: 'Gold · Media · Faith. Wins by draining the opponent and flooding regions with influence.',
    cards: expand({
      'florentine-merchant': 3, 'medici-banker': 2, 'mercato-vecchio': 2,
      'town-crier': 3, 'pamphleteer': 3, 'lucrezia-borgia': 1, 'printing-press': 2, 'rumor': 2, 'propaganda': 1, 'scandal': 1,
      'mendicant-monk': 3, 'preacher': 3, 'rodrigo-borgia': 1, 'chapel': 2, 'indulgence': 1,
    }),
  },
];

export const REGION_SETS: string[][] = [
  ['Santa Croce', 'San Giovanni', 'Oltrarno'],
  ['San Marco', 'Rialto', 'Arsenale'],
  ['Vaticano', 'Trastevere', 'Campo de’ Fiori'],
];
