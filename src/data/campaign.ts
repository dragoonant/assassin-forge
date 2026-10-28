import type { MatchConfig } from '../engine/config';
import type { ScenarioRules } from '../engine/types';

export interface StoryLine {
  speaker?: string;
  text: string;
}

export interface Battle {
  id: string;
  title: string;
  place: string;
  date: string;
  regions: [string, string, string];
  briefing: StoryLine[];
  /** One-line goal shown on the briefing screen and the battle hint bar. */
  objective: string;
  tips?: string[];
  victory: StoryLine[];
  defeat: string;
  playerDeck: string[];
  opponent: { name: string; deck: string[]; thinkEvery: number };
  scenario?: ScenarioRules;
  config?: Partial<MatchConfig>;
}

export interface Act {
  id: string;
  title: string;
  subtitle: string;
  battles: Battle[];
}

function expand(counts: Record<string, number>): string[] {
  return Object.entries(counts).flatMap(([id, n]) => Array<string>(n).fill(id));
}

const N = 'Narrator';
const ISOTTA = 'Isotta';
const NICCOLO = 'Machiavelli';
const GIOVANNI = 'Giovanni';
const CELLINI = 'Cellini';

// ── Player sequences ───────────────────────────────────────────────────────

const PRINTER = expand({
  'florentine-merchant': 3, 'medici-banker': 2, 'mercato-vecchio': 2,
  'isotta-ferro': 1, 'cutpurse': 3, 'novice-assassin': 3, 'thieves-den': 2, 'poisoned-blade': 2,
  'town-crier': 3, 'pamphleteer': 3, 'printing-press': 2, 'rumor': 2, 'forbidden-pamphlet': 2,
});

const BROTHERHOOD = expand({
  'florentine-merchant': 3, 'medici-banker': 1, 'mercato-vecchio': 2,
  'isotta-ferro': 1, 'cutpurse': 3, 'novice-assassin': 3, 'hidden-blade': 1, 'leap-of-faith': 1, 'sabotage': 1, 'poisoned-blade': 1,
  'machiavelli': 1, 'town-crier': 3, 'pamphleteer': 3, 'aldine-press': 1, 'printing-press': 1, 'rumor': 2, 'forbidden-pamphlet': 2,
});

const BLACK_BANDS = expand({
  'florentine-merchant': 3, 'medici-banker': 1, 'mercato-vecchio': 2,
  'isotta-ferro': 1, 'novice-assassin': 3, 'cutpurse': 2, 'hidden-blade': 1, 'leap-of-faith': 1, 'sabotage': 2, 'poisoned-blade': 1,
  'giovanni-bande-nere': 1, 'black-band-veteran': 3, 'condottiero': 2, 'city-guard': 3, 'papal-soldier': 2, 'barracks': 1, 'ambush': 1,
});

/** After Governolo: Giovanni is gone, his veterans fight on. */
const BLACK_BANDS_MOURNING = BLACK_BANDS.map((c) => (c === 'giovanni-bande-nere' ? 'condottiero' : c));

const ROME = expand({
  'florentine-merchant': 3, 'benvenuto-cellini': 1, 'medici-banker': 1, 'mercato-vecchio': 2,
  'isotta-ferro': 1, 'pietro-il-gatto': 1, 'novice-assassin': 3, 'cutpurse': 2, 'hidden-blade': 2, 'leap-of-faith': 1, 'sabotage': 2, 'thieves-den': 1,
  'black-band-veteran': 3, 'condottiero': 2, 'city-guard': 3, 'barracks': 1, 'ambush': 1,
});

// ── Opponent sequences ─────────────────────────────────────────────────────

const GREY_CLOAKS = expand({
  'florentine-merchant': 3, 'mercato-vecchio': 3, 'tax-collection': 2,
  'templar-informer': 3, 'cutpurse': 3, 'novice-assassin': 2, 'thieves-den': 3, 'poisoned-blade': 3,
  'city-guard': 2, 'papal-soldier': 1, 'barracks': 3, 'condottiero': 2,
});

const VESCARI_AGENTS = expand({
  'florentine-merchant': 3, 'medici-banker': 1, 'banco-vescari': 1, 'bribe': 2, 'mercato-vecchio': 2,
  'templar-informer': 3, 'templar-enforcer': 2, 'novice-assassin': 3, 'sabotage': 1, 'poisoned-blade': 2,
  'town-crier': 3, 'rumor': 2, 'printing-press': 2, 'propaganda': 3,
});

const SILK_SPIDER = expand({
  'florentine-merchant': 3, 'mercato-vecchio': 2, 'bribe': 1,
  'templar-informer': 3, 'novice-assassin': 3, 'templar-enforcer': 2,
  'fiammetta-orsetti': 1, 'town-crier': 3, 'pamphleteer': 3, 'rumor': 3, 'scandal': 2, 'printing-press': 2, 'propaganda': 2,
});

const LANDSKNECHTE = expand({
  'florentine-merchant': 3, 'mercato-vecchio': 2,
  'georg-frundsberg': 1, 'landsknecht': 3, 'landsknecht-pikeman': 3, 'arquebusier': 3, 'city-guard': 3,
  'barracks': 2, 'falconet-shot': 2, 'pay-or-plunder': 2,
  'brother-anselm': 1, 'preacher': 3, 'chapel': 2,
});

/** After Frundsberg's stroke, Bourbon leads the army south. */
const IMPERIAL_ARMY = LANDSKNECHTE.map((c) => (c === 'georg-frundsberg' ? 'charles-bourbon' : c));

const TREASURER = expand({
  'ermanno-vescari': 1, 'banco-vescari': 2, 'medici-banker': 2, 'florentine-merchant': 2,
  'landsknecht': 3, 'landsknecht-pikeman': 3, 'arquebusier': 3, 'condottiero': 2, 'falconet-shot': 1, 'pay-or-plunder': 1,
  'fiammetta-orsetti': 1, 'pamphleteer': 3, 'rumor': 2, 'scandal': 2, 'printing-press': 2,
});

// ── The Lodestone ──────────────────────────────────────────────────────────

const VENICE: [string, string, string] = ['San Marco', 'Rialto', 'Arsenale'];
const FLORENCE: [string, string, string] = ['Santa Croce', 'San Giovanni', 'Oltrarno'];

export const CAMPAIGN_TITLE = 'The Lodestone';

export const CAMPAIGN: Act[] = [
  {
    id: 'prologue',
    title: 'Prologue',
    subtitle: 'The Printer’s Daughter',
    battles: [
      {
        id: 'ink-and-ash',
        title: 'Ink and Ash',
        place: 'Venice',
        date: 'Autumn 1525',
        regions: VENICE,
        briefing: [
          { speaker: N, text: 'Venice, autumn 1525. The presses of the Calle della Stamperia print Greek, Latin and, lately, things the Council would rather not read.' },
          { speaker: ISOTTA, text: 'Father says ink is the only weapon that wins twice: once when it’s printed, and once when it’s believed.' },
          { speaker: N, text: 'Last night, men in grey cloaks came asking for a pamphlet her father swore did not exist. By morning the workshop was ash, and Aldo Ferro was dead in it.' },
          { speaker: ISOTTA, text: 'They want the city to forget him. I’ll make every square remember.' },
        ],
        objective: 'Reach 10 influence in two of the three districts.',
        tips: [
          'Click a card to play it. Agents spend half a day recruiting, then wait at your HQ.',
          'Click a ready agent, then a district, to campaign there. Uncontested agents add their influence ✦.',
          'You control a district at 10 influence. Hold two at dusk to win.',
        ],
        victory: [
          { speaker: '???', text: 'You campaign like someone who has read too much and slept too little. Good.' },
          { speaker: N, text: 'A tall Florentine in a scholar’s cap steps out of the crowd at the Rialto. He knows her father’s name. He knows about the pamphlet.' },
        ],
        defeat: 'The grey cloaks bury the story with the printer. Try again: keep your agents campaigning.',
        playerDeck: PRINTER,
        opponent: { name: 'The Grey Cloaks', deck: GREY_CLOAKS, thinkEvery: 30 },
        config: { startingGold: 5 },
      },
      {
        id: 'the-florentine',
        title: 'The Florentine',
        place: 'Venice',
        date: 'Autumn 1525',
        regions: VENICE,
        briefing: [
          { speaker: NICCOLO, text: 'Niccolò Machiavelli. Once Secretary of Florence, now a man with too many enemies and too few friends. Your father printed something for me.' },
          { speaker: ISOTTA, text: 'The pamphlet. What was in it?' },
          { speaker: NICCOLO, text: 'A list of names. Bankers, cardinals, captains: men who wear a red cross under their silk. Templars.' },
          { speaker: NICCOLO, text: 'The men who burned your shop are still in the city, hunting for the last copy. Meet them in the streets. Don’t let them gather.' },
        ],
        objective: 'Reach 10 influence in two districts. Block the grey cloaks’ campaigns.',
        tips: [
          'If an enemy agent is campaigning in a district, send one of yours there. When its campaign ends, the two clash.',
          'In a clash, each agent loses strength ♥ equal to the other’s influence ✦. Survivors add nothing.',
          'Stealth agents never clash. First strike agents hit first.',
        ],
        victory: [
          { speaker: NICCOLO, text: 'You fight the way your father argued: badly, but without stopping. We can fix the first part.' },
          { speaker: N, text: 'In the ashes of the press, Isotta finds the last copy, sewn into the binding of a Book of Hours.' },
        ],
        defeat: 'The grey cloaks own the streets tonight. Block their campaigns by sending your agents into the same districts.',
        playerDeck: PRINTER,
        opponent: { name: 'The Grey Cloaks', deck: GREY_CLOAKS, thinkEvery: 24 },
      },
      {
        id: 'the-last-copy',
        title: 'The Last Copy',
        place: 'Venice',
        date: 'Winter 1525',
        regions: VENICE,
        briefing: [
          { speaker: NICCOLO, text: 'The list names one man above all the others: Count Ermanno Vescari, Treasurer of the Apostolic Camera. He holds the Pope’s purse, and the Pope’s debts.' },
          { speaker: ISOTTA, text: 'Then why would he burn a printer in Venice?' },
          { speaker: NICCOLO, text: 'Because a list can be copied. Get the book out of Venice. Tonight the Arsenale guards answer to Vescari’s money.' },
        ],
        objective: 'Win two districts. Vescari’s men already hold sway over the Arsenale.',
        tips: [
          'Sites add their influence at every dusk. Build them early.',
          'Actions are one-time tricks. Quick actions land almost at once.',
        ],
        victory: [
          { speaker: N, text: 'A gondola slips past the Arsenale chain at dawn. In the bow, Isotta reads the list again and again, until the names stop being names.' },
          { speaker: NICCOLO, text: 'Welcome to the Brotherhood, Isotta Ferro. Our creed has three tenets. You can learn them on the road to Florence.' },
        ],
        defeat: 'The book stays in Venice. Build sites early, and use your actions to break the bank’s hold.',
        playerDeck: BROTHERHOOD,
        opponent: { name: 'Vescari’s Agents', deck: VESCARI_AGENTS, thinkEvery: 14 },
        scenario: { startingInfluence: [[0, 0, 0], [0, 0, 3]] },
      },
    ],
  },
  {
    id: 'act-1',
    title: 'Act I',
    subtitle: 'A City of Ledgers',
    battles: [
      {
        id: 'city-of-ledgers',
        title: 'A City of Ledgers',
        place: 'Florence',
        date: 'Spring 1526',
        regions: FLORENCE,
        briefing: [
          { speaker: N, text: 'Florence, spring 1526. The Medici are back, ruling through a cardinal and a ledger.' },
          { speaker: NICCOLO, text: 'Vescari has lent Florence money it cannot repay. Every florin is a leash.' },
          { speaker: ISOTTA, text: 'Then we cut leashes.' },
          { speaker: NICCOLO, text: 'Gently. A frightened city runs to whoever holds the purse. Win the guilds before he buys them.' },
        ],
        objective: 'Win two districts. Florence runs on florins: both sides earn 2 gold a day.',
        victory: [
          { speaker: N, text: 'The wool guild refuses the Treasurer’s next loan. In Rome, a ledger closes with a sharp click.' },
        ],
        defeat: 'The guilds take Vescari’s money. Strike before his gold piles up.',
        playerDeck: BROTHERHOOD,
        opponent: { name: 'Vescari’s Bankers', deck: VESCARI_AGENTS, thinkEvery: 12 },
        scenario: { income: [2, 2] },
      },
      {
        id: 'silk-spider',
        title: 'The Silk Spider',
        place: 'Florence',
        date: 'Summer 1526',
        regions: FLORENCE,
        briefing: [
          { speaker: NICCOLO, text: 'Vescari’s eyes in Florence belong to Fiammetta Orsetti. Poet, hostess, and the finest liar I have ever admired.' },
          { speaker: ISOTTA, text: 'What does she want?' },
          { speaker: NICCOLO, text: 'Me. The rumors have already started: that I sold the Republic, that I sold the Medici, that I sold my own mother. Most of them are not true.' },
          { speaker: N, text: 'Every salon in the city repeats a story about the old Secretary. Isotta has a press, a pamphlet, and very little time.' },
        ],
        objective: 'Win two districts. The rumors give Fiammetta 3 influence everywhere.',
        victory: [
          { speaker: 'Fiammetta', text: 'Clever girl. You’ve printed the truth. Do you know how little that is worth?' },
          { speaker: N, text: 'Fiammetta leaves for Rome that night. She leaves Isotta a black ribbon and a note: “Ask Giovanni de’ Medici where the guns come from.”' },
        ],
        defeat: 'The rumors win. Fiammetta’s agents are stealthy: answer with your own influence, not with clashes.',
        playerDeck: BROTHERHOOD,
        opponent: { name: 'Fiammetta Orsetti', deck: SILK_SPIDER, thinkEvery: 8 },
        scenario: { startingInfluence: [[0, 0, 0], [3, 3, 3]] },
      },
      {
        id: 'black-bands',
        title: 'The Black Bands',
        place: 'Lombardy',
        date: 'Autumn 1526',
        regions: ['Lodi', 'Cremona', 'Piacenza'],
        briefing: [
          { speaker: N, text: 'Lombardy, autumn 1526. The Emperor’s Landsknechte come down from the Alps, fourteen thousand strong, unpaid and hungry.' },
          { speaker: GIOVANNI, text: 'Giovanni de’ Medici. They call me dalle Bande Nere, for the black I wear for a dead pope. Machiavelli says you’re useful.' },
          { speaker: ISOTTA, text: 'Machiavelli says that about everyone he plans to get killed.' },
          { speaker: GIOVANNI, text: 'Ha! Then ride with my Black Bands and prove him wrong. We bleed the Germans at every ford.' },
        ],
        objective: 'Win two towns against the Landsknecht vanguard.',
        tips: ['Your sequence now carries the Black Bands: Order soldiers with first strike. Use them to win clashes.'],
        victory: [
          { speaker: GIOVANNI, text: 'You stab like a Venetian and run like a Florentine. I like you.' },
          { speaker: N, text: 'Scouts report the Landsknechte are short of cannon. Then, overnight, they aren’t.' },
        ],
        defeat: 'The vanguard pushes through. Let the Black Bands meet the pikemen head on.',
        playerDeck: BLACK_BANDS,
        opponent: { name: 'Landsknecht Vanguard', deck: LANDSKNECHTE, thinkEvery: 10 },
      },
    ],
  },
  {
    id: 'act-2',
    title: 'Act II',
    subtitle: 'The River Po',
    battles: [
      {
        id: 'governolo',
        title: 'Governolo',
        place: 'The River Po',
        date: '25 November 1526',
        regions: ['North Bank', 'The Ford', 'South Bank'],
        briefing: [
          { speaker: GIOVANNI, text: 'Frundsberg is crossing the Po at Governolo. If his army gets over, nothing stands between him and the south.' },
          { speaker: ISOTTA, text: 'Where did he get the guns?' },
          { speaker: GIOVANNI, text: 'Ferrara. Duke Alfonso sells to anyone who pays, and this time someone paid in advance.' },
          { speaker: N, text: 'The Black Bands dig in at the river. They must hold until the Duke of Urbino’s army arrives. It never does.' },
        ],
        objective: 'Hold the crossing: survive until dusk of day 6.',
        tips: ['You win if Frundsberg hasn’t taken two regions by dusk of day 6.'],
        victory: [
          { speaker: N, text: 'At dusk a falconet ball shatters Giovanni’s leg. The Black Bands hold the crossing and carry their captain to Mantua.' },
          { speaker: GIOVANNI, text: 'Find who paid for that gun, little printer. Then give him my regards.' },
        ],
        defeat: 'Frundsberg crosses the Po. Block his campaigns and make every day count.',
        playerDeck: BLACK_BANDS,
        opponent: { name: 'Georg von Frundsberg', deck: LANDSKNECHTE, thinkEvery: 6 },
        scenario: {
          survive: { player: 0, days: 6 },
          startingAgents: [{ player: 1, cardId: 'landsknecht-pikeman' }, { player: 1, cardId: 'landsknecht' }],
        },
      },
      {
        id: 'dukes-foundry',
        title: 'The Duke’s Foundry',
        place: 'Ferrara',
        date: 'December 1526',
        regions: ['Castello Estense', 'The Foundry', 'Po Docks'],
        briefing: [
          { speaker: N, text: 'Mantua. Giovanni dalle Bande Nere dies on the last night of November. He was twenty-eight.' },
          { speaker: NICCOLO, text: 'The guns were paid for with letters of credit from the Apostolic Camera, under Vescari’s own seal.' },
          { speaker: ISOTTA, text: 'He’s arming the Emperor’s army, with the Pope’s money, against the Pope.' },
          { speaker: NICCOLO, text: 'Now you understand the Templars. Burn his foundry, and bring me the ledger.' },
        ],
        objective: 'Win two regions. The Duke’s barracks already stand at the Foundry: Sabotage them.',
        victory: [
          { speaker: N, text: 'The foundry burns for two days. The ledger survives; Isotta makes sure of that.' },
          { speaker: NICCOLO, text: 'Payments to the Landsknechte, but only half of what they’re owed. He wants them unpaid. Unpaid soldiers don’t stop at walls.' },
        ],
        defeat: 'The foundry keeps casting. Use Sabotage on the sites feeding the enemy.',
        playerDeck: BLACK_BANDS_MOURNING,
        opponent: { name: 'The Duke’s Garrison', deck: LANDSKNECHTE, thinkEvery: 9 },
        scenario: {
          startingSites: [
            { player: 1, cardId: 'barracks', region: 1 },
            { player: 1, cardId: 'barracks', region: 1 },
          ],
        },
      },
      {
        id: 'pay-or-plunder',
        title: 'Pay or Plunder',
        place: 'Outside Bologna',
        date: 'March 1527',
        regions: ['The Camp', 'Supply Wagons', 'Chapel Tent'],
        briefing: [
          { speaker: N, text: 'March 1527. The Imperial army camps outside Bologna. It hasn’t been paid in months.' },
          { speaker: ISOTTA, text: 'Every night a priest called Brother Anselm preaches in the camp, and every night the cry grows louder: “Pay or plunder!”' },
          { speaker: NICCOLO, text: 'Anselm is Vescari’s voice. If the mutiny takes hold, they’ll march on Rome to pay themselves. Turn the camp, or at least slow it.' },
        ],
        objective: 'Win two regions, fast. The mutiny spreads: the camp gains 1 influence everywhere each dusk.',
        victory: [
          { speaker: N, text: 'Old Frundsberg climbs onto a drum to calm his men. Mid-speech, he collapses with a stroke. He will never command again.' },
          { speaker: N, text: 'The camp is quiet for a week. Then the Duke of Bourbon takes command, and promises them Rome.' },
        ],
        defeat: 'The mutiny boils over. Move fast: every dusk the camp grows angrier.',
        playerDeck: BLACK_BANDS_MOURNING,
        opponent: { name: 'Brother Anselm', deck: LANDSKNECHTE, thinkEvery: 9 },
        scenario: {
          startingGold: [7, 4],
          duskEffects: [{ player: 1, effects: [{ kind: 'influence', amount: 1, region: 'all' }], text: '“Pay or plunder!” The mutiny spreads.' }],
        },
      },
    ],
  },
  {
    id: 'act-3',
    title: 'Act III',
    subtitle: 'The Road to Rome',
    battles: [
      {
        id: 'florence-spared',
        title: 'Florence Spared',
        place: 'Florence',
        date: 'April 1527',
        regions: FLORENCE,
        briefing: [
          { speaker: N, text: 'April 1527. The Imperial army reaches the hills above Florence. The city panics, and the Medici prepare to run.' },
          { speaker: NICCOLO, text: 'They won’t take Florence. Not if the city looks too strong to bother with. Make it look strong, Isotta.' },
        ],
        objective: 'Win two districts before Bourbon’s army decides Florence is worth the trouble.',
        victory: [
          { speaker: N, text: 'Bourbon’s scouts report a city bristling with militia. The army turns south, toward a richer and weaker prize.' },
          { speaker: NICCOLO, text: 'We saved Florence by sending them to Rome. History won’t thank us for it.' },
        ],
        defeat: 'Florence wavers. Lean on your printing presses and keep the districts loud.',
        playerDeck: BROTHERHOOD,
        opponent: { name: 'Charles de Bourbon', deck: IMPERIAL_ARMY, thinkEvery: 6 },
      },
      {
        id: 'war-council',
        title: 'The War Council',
        place: 'Viterbo',
        date: 'April 1527',
        regions: ['Command Tent', 'Quartermaster', 'Picket Line'],
        briefing: [
          { speaker: ISOTTA, text: 'Bourbon dines with a guest every night: a woman in silk who writes everything down.' },
          { speaker: NICCOLO, text: 'Fiammetta. Get close enough to read her letters.' },
          { speaker: N, text: 'The camp at Viterbo is a city of tents. In the largest, an exiled French duke plans the fall of Rome.' },
        ],
        objective: 'Win two parts of the camp. You arrive with only 3 gold.',
        victory: [
          { speaker: N, text: 'Fiammetta’s letter is short. “When the walls fall, the Treasurer goes to the vault under the Belvedere. Not for gold. For the stone.”' },
          { speaker: NICCOLO, text: 'La Calamita. The Lodestone: a Piece of Eden that draws men’s wills the way iron draws iron. The Brotherhood sealed it in Rome long ago.' },
        ],
        defeat: 'You’re spotted in the camp. Stealth agents can campaign where the pickets can’t touch them.',
        playerDeck: BROTHERHOOD,
        opponent: { name: 'Fiammetta Orsetti', deck: SILK_SPIDER, thinkEvery: 5 },
        scenario: { startingGold: [3, 5] },
      },
      {
        id: 'fog',
        title: 'Fog on the Walls',
        place: 'Rome',
        date: '6 May 1527',
        regions: ['Borgo Walls', 'Santo Spirito Gate', 'Janiculum'],
        briefing: [
          { speaker: N, text: 'Rome, 6 May 1527. Dawn brings a thick fog off the Tiber. Bourbon’s army comes out of it, ladders first.' },
          { speaker: CELLINI, text: 'Benvenuto Cellini: goldsmith, and the best shot on these walls. Who are you?' },
          { speaker: ISOTTA, text: 'Someone who needs one man in a white cloak to stop climbing.' },
        ],
        objective: 'Win two sections of the wall. In the fog, agents never clash.',
        tips: ['Fog: no campaign can be contested. Win on influence, sites and actions.'],
        victory: [
          { speaker: CELLINI, text: 'There! The one in white, down! I swear on my mother, that was my shot.' },
          { speaker: N, text: 'The Duke of Bourbon falls from a ladder with an arquebus ball in him. His leaderless army pours over the walls anyway.' },
        ],
        defeat: 'The ladders reach the top. In the fog it’s a race: campaign everywhere, every half day.',
        playerDeck: ROME,
        opponent: { name: 'Charles de Bourbon', deck: IMPERIAL_ARMY, thinkEvery: 8 },
        scenario: { noClashes: true, startingInfluence: [[0, 0, 0], [1, 1, 1]] },
      },
      {
        id: 'castel-sant-angelo',
        title: 'Castel Sant’Angelo',
        place: 'Rome',
        date: '6 May 1527',
        regions: ['St. Peter’s Steps', 'The Passetto', 'Castle Gate'],
        briefing: [
          { speaker: N, text: 'The Swiss Guard dies on the steps of St. Peter’s: 147 of 189 men.' },
          { speaker: ISOTTA, text: 'The Pope is running for Castel Sant’Angelo through the Passetto. If they catch him in the corridor, Rome has no one left to bargain with.' },
          { speaker: CELLINI, text: 'I’ll be on the castle walls with my guns. You keep the corridor open.' },
        ],
        objective: 'Keep the corridor open: survive until dusk of day 7.',
        victory: [
          { speaker: N, text: 'Clement VII reaches the castle with his robes hitched up to his knees. The gates close behind him.' },
          { speaker: ISOTTA, text: 'Vescari wasn’t with him. The Treasurer stayed behind in the Vatican.' },
        ],
        defeat: 'The Passetto falls. Stall them: block, bribe, and never let two regions slip at once.',
        playerDeck: ROME,
        opponent: { name: 'The Imperial Army', deck: IMPERIAL_ARMY, thinkEvery: 4 },
        scenario: {
          survive: { player: 0, days: 7 },
          startingInfluence: [[0, 0, 0], [3, 1, 1]],
        },
      },
    ],
  },
  {
    id: 'act-4',
    title: 'Act IV',
    subtitle: 'The Sack',
    battles: [
      {
        id: 'trastevere',
        title: 'Trastevere Burns',
        place: 'Rome',
        date: 'May 1527',
        regions: ['Santa Maria', 'The Rooftops', 'Ripa Grande'],
        briefing: [
          { speaker: N, text: 'The city burns for days. Landsknechte ransack churches, palaces and hospitals.' },
          { speaker: ISOTTA, text: 'We can’t stop an army. But we can get people out.' },
          { speaker: 'Pietro', text: 'Pietro Lanza. They call me il Gatto. I know every roof in Trastevere, and every family under them.' },
        ],
        objective: 'Win two quarters. Days pass faster here: the city is burning.',
        victory: [
          { speaker: N, text: 'Hundreds slip out of Trastevere through cellars and over rooftops. Il Gatto counts every one.' },
          { speaker: 'Pietro', text: 'The Treasurer’s men are digging under the Belvedere. They’ve been at it since the walls fell.' },
        ],
        defeat: 'Trastevere is lost. Time runs fast here: keep every agent moving.',
        playerDeck: ROME,
        opponent: { name: 'Looters', deck: IMPERIAL_ARMY, thinkEvery: 6 },
        config: { ticksPerDay: 44, halfDay: 22, quickDelay: 4 },
      },
      {
        id: 'the-vault',
        title: 'The Vault',
        place: 'The Vatican',
        date: 'May 1527',
        regions: ['Belvedere', 'Sistine Chapel', 'Apostolic Library'],
        briefing: [
          { speaker: NICCOLO, text: '(a letter) Isotta: I am too ill to come. If Vescari takes the Lodestone he won’t need an army. Armies will come to him. N.' },
          { speaker: ISOTTA, text: 'Then he doesn’t get to take it.' },
          { speaker: N, text: 'Under the Belvedere, Vescari’s men have broken into a vault sealed with the mark of the Brotherhood.' },
        ],
        objective: 'Win two halls of the Vatican against the Treasurer’s guard.',
        victory: [
          { speaker: N, text: 'Isotta reaches the vault as the last seal breaks. Vescari already holds a stone of black iron that hums in his hand.' },
          { speaker: 'Vescari', text: 'Miss Ferro. Your father printed my name. I’ll have yours carved somewhere nicer.' },
        ],
        defeat: 'The Treasurer’s guard holds. Break up his bank, and strike his agents while they rest.',
        playerDeck: ROME,
        opponent: { name: 'Ermanno Vescari', deck: TREASURER, thinkEvery: 4 },
      },
      {
        id: 'la-calamita',
        title: 'La Calamita',
        place: 'St. Peter’s Square',
        date: 'May 1527',
        regions: ['The Obelisk', 'Borgo', 'Ponte Sant’Angelo'],
        briefing: [
          { speaker: N, text: 'St. Peter’s Square. A crowd of looters, pilgrims and soldiers stands in silence, watching one man.' },
          { speaker: 'Vescari', text: 'Look at them. An hour ago they were burning Rome. Now they’d die for me. This is how the world should be ruled, Miss Ferro: quietly.' },
          { speaker: ISOTTA, text: 'Nothing is true. Everything is permitted. Even this.' },
        ],
        objective: 'Win two regions. La Calamita pulls the crowd toward Vescari every dusk. Sabotage it.',
        tips: ['La Calamita is a site at the Obelisk. Destroy it with Sabotage to break its pull.'],
        victory: [
          { speaker: N, text: 'The Lodestone cracks. The crowd wakes all at once, like sleepers, and turns on the man who held them.' },
          { speaker: 'Vescari', text: 'You don’t understand what you’ve done. Without order they’ll—' },
          { speaker: ISOTTA, text: 'Requiescat in pace, Treasurer.' },
          { speaker: N, text: 'Florence, 21 June 1527. Niccolò Machiavelli dies in his bed with a pamphlet in his hand.' },
          { speaker: N, text: 'Isotta Ferro buries him, then opens a new press on the street where her father’s burned.' },
          { speaker: ISOTTA, text: 'Ink wins twice. Once when it’s printed, once when it’s believed. Let’s get to work.' },
        ],
        defeat: 'Rome kneels to the Lodestone. Get Sabotage into play and aim it at La Calamita.',
        playerDeck: ROME,
        opponent: { name: 'Ermanno Vescari', deck: TREASURER, thinkEvery: 7 },
        scenario: {
          startingGold: [6, 4],
          startingSites: [{ player: 1, cardId: 'la-calamita', region: 0 }],
        },
      },
    ],
  },
];

export const CAMPAIGN_DECKS = { PRINTER, BROTHERHOOD, BLACK_BANDS, BLACK_BANDS_MOURNING, ROME, GREY_CLOAKS, VESCARI_AGENTS, SILK_SPIDER, LANDSKNECHTE, IMPERIAL_ARMY, TREASURER };

export const ALL_BATTLES: Battle[] = CAMPAIGN.flatMap((a) => a.battles);
