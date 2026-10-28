import type { Card } from '../engine/types';

export const CARDS: Card[] = [
  // ── Gold ────────────────────────────────────────────────────────────────
  { id: 'florentine-merchant', name: 'Florentine Merchant', specialty: 'gold', type: 'agent', cost: 1,
    strength: 2, influence: 1, text: 'A cheap, dependable campaigner.' },
  { id: 'medici-banker', name: 'Medici Banker', specialty: 'gold', type: 'agent', cost: 3,
    strength: 2, influence: 1, onArrive: [{ kind: 'income', amount: 1 }],
    text: 'On arrive: +1 income.' },
  { id: 'claudia-auditore', name: 'Claudia Auditore', specialty: 'gold', type: 'agent', cost: 4, unique: true,
    strength: 3, influence: 2, onArrive: [{ kind: 'income', amount: 1 }, { kind: 'draw', amount: 1 }],
    text: 'On arrive: +1 income, draw 1.' },
  { id: 'mercato-vecchio', name: 'Mercato Vecchio', specialty: 'gold', type: 'site', cost: 2,
    influence: 1, text: 'Dusk: +1 influence here.' },
  { id: 'banco-medici', name: 'Banco Medici', specialty: 'gold', type: 'site', cost: 3,
    influence: 0, daily: [{ kind: 'gainGold', amount: 1 }], text: 'Dusk: gain 1 gold.' },
  { id: 'tax-collection', name: 'Tax Collection', specialty: 'gold', type: 'action', cost: 1,
    target: 'none', speed: 'half', effects: [{ kind: 'gainGold', amount: 3 }], text: 'Gain 3 gold.' },
  { id: 'bribe', name: 'Bribe', specialty: 'gold', type: 'action', cost: 2,
    target: 'enemyAgent', campaigningOnly: true, speed: 'quick', effects: [{ kind: 'recall' }],
    text: 'Quick. A campaigning enemy agent abandons its campaign and goes home to rest.' },

  // ── Crime ───────────────────────────────────────────────────────────────
  { id: 'cutpurse', name: 'Cutpurse', specialty: 'crime', type: 'agent', cost: 1,
    strength: 1, influence: 1, onCampaign: [{ kind: 'stealGold', amount: 1 }],
    text: 'On campaign: steal 1 gold.' },
  { id: 'novice-assassin', name: 'Novice Assassin', specialty: 'crime', type: 'agent', cost: 2,
    strength: 2, influence: 1, keywords: ['stealth'], text: 'Stealth.' },
  { id: 'la-volpe', name: 'La Volpe', specialty: 'crime', type: 'agent', cost: 4, unique: true,
    strength: 3, influence: 2, keywords: ['stealth'], onCampaign: [{ kind: 'stealGold', amount: 2 }],
    text: 'Stealth. On campaign: steal 2 gold.' },
  { id: 'ezio-auditore', name: 'Ezio Auditore', specialty: 'crime', type: 'agent', cost: 5, unique: true,
    strength: 4, influence: 3, keywords: ['firstStrike'], text: 'First strike.' },
  { id: 'thieves-den', name: "Thieves' Den", specialty: 'crime', type: 'site', cost: 2,
    influence: 1, text: 'Dusk: +1 influence here.' },
  { id: 'poisoned-blade', name: 'Poisoned Blade', specialty: 'crime', type: 'action', cost: 2,
    target: 'enemyAgent', speed: 'quick', effects: [{ kind: 'damage', amount: 2 }],
    text: 'Quick. Deal 2 damage to an enemy agent.' },
  { id: 'sabotage', name: 'Sabotage', specialty: 'crime', type: 'action', cost: 2,
    target: 'enemySite', speed: 'half', effects: [{ kind: 'destroySite' }], text: 'Destroy an enemy site.' },

  // ── Faith ───────────────────────────────────────────────────────────────
  { id: 'mendicant-monk', name: 'Mendicant Monk', specialty: 'faith', type: 'agent', cost: 1,
    strength: 1, influence: 2, text: 'Fragile, but spreads the word.' },
  { id: 'preacher', name: 'Preacher', specialty: 'faith', type: 'agent', cost: 2,
    strength: 2, influence: 2, text: 'A sermon in every square.' },
  { id: 'rodrigo-borgia', name: 'Rodrigo Borgia', specialty: 'faith', type: 'agent', cost: 6, unique: true,
    strength: 5, influence: 3, onCampaign: [{ kind: 'drain', amount: 1, region: 'all' }],
    text: 'On campaign: opponent loses 1 influence in every region.' },
  { id: 'chapel', name: 'Chapel', specialty: 'faith', type: 'site', cost: 2,
    influence: 1, text: 'Dusk: +1 influence here.' },
  { id: 'duomo', name: 'Il Duomo', specialty: 'faith', type: 'site', cost: 4,
    influence: 2, text: 'Dusk: +2 influence here.' },
  { id: 'blessing', name: 'Blessing', specialty: 'faith', type: 'action', cost: 1,
    target: 'friendlyAgent', speed: 'quick', effects: [{ kind: 'heal' }, { kind: 'fortify', amount: 1 }],
    text: 'Quick. Fully heal a friendly agent, then give it +1 Strength.' },
  { id: 'indulgence', name: 'Indulgence', specialty: 'faith', type: 'action', cost: 1,
    target: 'region', speed: 'half', effects: [{ kind: 'influence', amount: 2, region: 'target' }],
    text: '+2 influence in a region.' },

  // ── Media ───────────────────────────────────────────────────────────────
  { id: 'town-crier', name: 'Town Crier', specialty: 'media', type: 'agent', cost: 2,
    strength: 2, influence: 1, onArrive: [{ kind: 'draw', amount: 1 }], text: 'On arrive: draw 1.' },
  { id: 'pamphleteer', name: 'Pamphleteer', specialty: 'media', type: 'agent', cost: 3,
    strength: 3, influence: 2, onCampaign: [{ kind: 'drain', amount: 1, region: 'here' }],
    text: 'On campaign: opponent loses 1 influence here.' },
  { id: 'lucrezia-borgia', name: 'Lucrezia Borgia', specialty: 'media', type: 'agent', cost: 4, unique: true,
    strength: 2, influence: 2, onCampaign: [{ kind: 'drain', amount: 2, region: 'here' }],
    text: 'On campaign: opponent loses 2 influence here.' },
  { id: 'printing-press', name: 'Printing Press', specialty: 'media', type: 'site', cost: 3,
    influence: 1, daily: [{ kind: 'drain', amount: 1, region: 'here' }],
    text: 'Dusk: +1 influence here, and opponent loses 1 here.' },
  { id: 'rumor', name: 'Rumor', specialty: 'media', type: 'action', cost: 2,
    target: 'region', speed: 'quick', effects: [{ kind: 'drain', amount: 3, region: 'target' }],
    text: 'Quick. Opponent loses 3 influence in a region.' },
  { id: 'propaganda', name: 'Propaganda', specialty: 'media', type: 'action', cost: 2,
    target: 'region', speed: 'half', effects: [{ kind: 'influence', amount: 3, region: 'target' }],
    text: '+3 influence in a region.' },
  { id: 'scandal', name: 'Scandal', specialty: 'media', type: 'action', cost: 2,
    target: 'enemyAgent', speed: 'quick', effects: [{ kind: 'bounce' }],
    text: "Quick. Return an enemy agent to its owner's hand." },

  // ── Order ───────────────────────────────────────────────────────────────
  { id: 'city-guard', name: 'City Guard', specialty: 'order', type: 'agent', cost: 2,
    strength: 3, influence: 1, text: 'Hard to move, slow to persuade.' },
  { id: 'papal-soldier', name: 'Papal Soldier', specialty: 'order', type: 'agent', cost: 2,
    strength: 2, influence: 1, keywords: ['firstStrike'], text: 'First strike.' },
  { id: 'condottiero', name: 'Condottiero', specialty: 'order', type: 'agent', cost: 3,
    strength: 4, influence: 2, text: 'A captain for hire.' },
  { id: 'bartolomeo', name: "Bartolomeo d'Alviano", specialty: 'order', type: 'agent', cost: 5, unique: true,
    strength: 6, influence: 3, text: 'A mercenary general who rarely loses a fight.' },
  { id: 'cesare-borgia', name: 'Cesare Borgia', specialty: 'order', type: 'agent', cost: 6, unique: true,
    strength: 6, influence: 3, keywords: ['firstStrike'], onArrive: [{ kind: 'drain', amount: 1, region: 'all' }],
    text: 'First strike. On arrive: opponent loses 1 influence in every region.' },
  { id: 'barracks', name: 'Barracks', specialty: 'order', type: 'site', cost: 2,
    influence: 1, text: 'Dusk: +1 influence here.' },
  { id: 'ambush', name: 'Ambush', specialty: 'order', type: 'action', cost: 3,
    target: 'enemyAgent', speed: 'quick', effects: [{ kind: 'damage', amount: 3 }],
    text: 'Quick. Deal 3 damage to an enemy agent.' },

  // ── Scholar ─────────────────────────────────────────────────────────────
  { id: 'apprentice', name: 'Apprentice', specialty: 'scholar', type: 'agent', cost: 1,
    strength: 1, influence: 1, onArrive: [{ kind: 'draw', amount: 1 }], text: 'On arrive: draw 1.' },
  { id: 'leonardo', name: 'Leonardo da Vinci', specialty: 'scholar', type: 'agent', cost: 4, unique: true,
    strength: 2, influence: 2, onArrive: [{ kind: 'draw', amount: 2 }, { kind: 'gainGold', amount: 1 }],
    text: 'On arrive: draw 2, gain 1 gold.' },
  { id: 'library', name: 'Library', specialty: 'scholar', type: 'site', cost: 3,
    influence: 1, daily: [{ kind: 'draw', amount: 1 }], text: 'Dusk: +1 influence here, draw 1.' },
  { id: 'codex-page', name: 'Codex Page', specialty: 'scholar', type: 'action', cost: 1,
    target: 'none', speed: 'quick', effects: [{ kind: 'draw', amount: 2 }], text: 'Quick. Draw 2.' },
  { id: 'flying-machine', name: 'Flying Machine', specialty: 'scholar', type: 'action', cost: 2,
    target: 'friendlyAgent', speed: 'quick', effects: [{ kind: 'fortify', amount: 2 }],
    text: 'Quick. A friendly agent gets +2 Strength.' },
];

export const CARD_INDEX: Record<string, Card> = Object.fromEntries(CARDS.map((c) => [c.id, c]));

export function getCard(id: string): Card {
  const card = CARD_INDEX[id];
  if (!card) throw new Error(`Unknown card: ${id}`);
  return card;
}

export const SPECIALTY_LABEL: Record<Card['specialty'], string> = {
  gold: 'Gold', crime: 'Crime', faith: 'Faith', media: 'Media', order: 'Order', scholar: 'Scholar',
};
