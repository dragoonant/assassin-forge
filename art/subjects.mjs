// Art prompts for Flux Studio. The style blocks follow the "master grade SD" recipe used for
// mallet-42k (art/unit-concepts/PROMPTS.md there), adapted to Renaissance Italy.
// Card art is saved as <kind>/<id>. Story portraits reuse the speaker's card art (see src/ui/art.ts).

const SD = 'in master grade SD (super deformed) style proportions like a Gundam SD model kit, not chibi: about 3 heads tall, '
  + 'noticeably oversized head (about a third of total height), short compact torso, short sturdy legs, oversized hands and weapons, '
  + 'crisp hard-surface model-kit detail with fine panel lines and sculpted fabric folds, painted like a finished premium collectible figure';

export const STYLES = {
  // House style: matches the mallet-42k figures. Easy to cut out and frame on a card.
  figure: (subject) => `A collectible figure of ${subject}, ${SD}. Renaissance Italy, 1520s, in the visual world of Assassin's Creed. `
    + 'Full body, front three-quarter view, standing on a plain round black base. Plain white background, even soft studio lighting, no shadows, no text.',
  // Option B for proofs: the same figure on a small sculpted diorama base, still on white.
  diorama: (subject, base) => `A collectible figure of ${subject}, ${SD}. Renaissance Italy, 1520s, in the visual world of Assassin's Creed. `
    + `Full body, front three-quarter view, standing on a small square diorama base sculpted as ${base}. `
    + 'Plain white background, even soft studio lighting, product photo, no text.',
  // Sites: a miniature building kit.
  site: (subject) => `A miniature model-kit diorama of ${subject}, built like a master grade SD Gundam kit accessory: chunky stylised proportions, `
    + 'crisp hard-surface detail, painted and weathered like a finished premium collectible. Renaissance Italy, 1520s, in the visual world of Assassin\'s Creed. '
    + 'Front three-quarter view, on a plain round black base. Plain white background, even soft studio lighting, no shadows, no text.',
  // Actions: an SD figure caught mid-action, or a hero prop.
  action: (subject) => `A dynamic collectible figure diorama: ${subject}, ${SD}. Renaissance Italy, 1520s, in the visual world of Assassin's Creed. `
    + 'Dramatic action pose on a plain round black base. Plain white background, even soft studio lighting, no text.',
  // Battle backdrops behind the story scenes.
  scene: (subject) => `A large detailed tabletop diorama of ${subject}, built in master grade SD model-kit style: miniature buildings with crisp hard-surface detail, `
    + 'tiny SD-proportioned figures, painted and weathered like a premium collectible display. Renaissance Italy in the visual world of Assassin\'s Creed. '
    + 'Wide cinematic shot, dramatic warm lighting, shallow depth of field, no text.',
};

const ASSASSIN = 'white and red hooded Assassin robes with a beaked hood, leather bracers and a red sash';
const TEMPLAR = 'a grey cloak over dark clothes, a small red Templar cross pinned at the collar';
const LANDSKNECHT = 'a German Landsknecht mercenary in a slashed and puffed striped doublet, huge feathered beret, codpiece and breastplate';
const BLACK_BAND = 'black-lacquered half plate armour with a black sash of mourning';

/** kind → id → [style, subject, (diorama base)] */
export const CARDS = {
  // Gold
  'florentine-merchant': ['figure', 'a plump Florentine cloth merchant in a fur-trimmed robe and red cap, holding a bolt of blue wool and a purse'],
  'medici-banker': ['figure', 'a Medici banker in sober blue and gold, holding a ledger and an abacus, the Medici balls emblem on his chest'],
  'claudia-auditore': ['figure', 'Claudia Auditore, a confident noblewoman in a rich burgundy gown, holding an account book and a dagger'],
  'mercato-vecchio': ['site', 'the Mercato Vecchio of Florence: market stalls with striped awnings, crates of fruit and a well'],
  'banco-medici': ['site', 'a Renaissance Medici bank: a stone counting house with a gilded sign of six red balls and stacked coin chests'],
  'tax-collection': ['action', 'a smug tax collector shaking coins out of a heavy sack into an iron strongbox'],
  'bribe': ['action', 'a gloved hand sliding a fat purse of gold across a table to a guard who looks away'],
  // Crime
  'cutpurse': ['figure', 'a scrawny street thief in a patched brown hood, holding a small knife and a stolen purse'],
  'novice-assassin': ['figure', `a young novice Assassin in plain ${ASSASSIN}, crouched ready to spring`],
  'la-volpe': ['figure', 'La Volpe, the master thief of Florence: a lean man in a dark hooded cloak with a fox-like grin and a short sword'],
  'ezio-auditore': ['figure', 'Ezio Auditore, the master Assassin, in his iconic white, red and black Renaissance Assassin robes with a sword and hidden blade'],
  'thieves-den': ['site', 'a thieves’ den in a tavern cellar: barrels, a hidden trapdoor, loot sacks and a fox sign over the door'],
  'poisoned-blade': ['action', 'a hooded Assassin coating a slim dagger with green glowing poison from a small vial'],
  'sabotage': ['action', 'a hooded saboteur lighting a powder keg fuse next to a wooden scaffold'],
  // Faith
  'mendicant-monk': ['figure', 'a barefoot Franciscan friar in a brown habit with a rope belt, holding a begging bowl and a cross'],
  'preacher': ['figure', 'a fiery Dominican preacher in black and white robes, one arm raised, holding a Bible'],
  'rodrigo-borgia': ['figure', 'Rodrigo Borgia as Pope Alexander VI, in white and gold papal vestments with a tall papal staff and a scheming look'],
  'chapel': ['site', 'a small Renaissance chapel with a terracotta roof, a bell gable and candles at the door'],
  'duomo': ['site', 'the Duomo of Florence: Brunelleschi’s red-tiled dome with white and green marble walls'],
  'blessing': ['action', 'a kneeling soldier being blessed by a priest, golden light around his raised hand'],
  'indulgence': ['action', 'a cardinal handing a sealed papal indulgence scroll to a grateful nobleman'],
  // Media
  'town-crier': ['figure', 'a loud town crier in a red and yellow tabard ringing a big handbell, holding a proclamation scroll'],
  'pamphleteer': ['figure', 'an ink-stained pamphleteer in a leather apron, arms full of printed pamphlets, a quill behind his ear'],
  'lucrezia-borgia': ['figure', 'Lucrezia Borgia, a beautiful and dangerous noblewoman in a jewelled crimson gown, holding a poison ring and a fan'],
  'printing-press': ['site', 'a Renaissance printing workshop with a big wooden screw press, type cases and drying pages on lines'],
  'rumor': ['action', 'two gossiping noblewomen whispering behind their fans while a third listens around a column'],
  'propaganda': ['action', 'a crowd reaching for pamphlets thrown from a balcony, pages fluttering in the air'],
  'scandal': ['action', 'a disgraced nobleman covering his face as a crowd points and shouts, a torn letter at his feet'],
  // Order
  'city-guard': ['figure', 'a Florentine city guard in a morion helmet and red and white livery, holding a halberd'],
  'papal-soldier': ['figure', 'a papal soldier in red and gold armour with a crossed-keys tabard, holding a spear and buckler'],
  'condottiero': ['figure', 'a mercenary condottiero captain in ornate steel plate with a plumed helmet and a longsword'],
  'bartolomeo': ['figure', "Bartolomeo d'Alviano, a huge bearded mercenary general in heavy steel plate wielding an enormous greatsword"],
  'cesare-borgia': ['figure', 'Cesare Borgia, a cold and handsome warlord in black and gold plate armour with a sword and a red cape'],
  'barracks': ['site', 'a stone soldiers’ barracks with a gatehouse, weapon racks and a banner of crossed keys'],
  'ambush': ['action', 'two soldiers leaping out from behind a market stall with spears to attack'],
  // Scholar
  'apprentice': ['figure', 'a young workshop apprentice in a smock carrying a stack of books, rolled drawings and a set square'],
  'leonardo': ['figure', 'Leonardo da Vinci, an older genius with a long grey beard in a russet robe, holding a notebook and a brass compass'],
  'library': ['site', 'a Renaissance library: tall wooden shelves of leather books, a reading lectern and a globe'],
  'codex-page': ['action', 'a glowing parchment codex page covered in Leonardo’s mirror-writing and diagrams, floating above an open book'],
  'flying-machine': ['action', 'Leonardo’s flying machine, a bat-winged wooden glider with canvas wings, carrying a hooded Assassin'],
  // Story: The Lodestone
  'isotta-ferro': ['figure', `Isotta Ferro, a young Venetian woman Assassin in ${ASSASSIN} with ink-stained fingers, dark braided hair under the hood, a hidden blade on her wrist and a printed pamphlet tucked in her belt`],
  'pietro-il-gatto': ['figure', 'Pietro "il Gatto", a wiry Roman rooftop thief in a dark grey hood and soft boots, perched like a cat, holding a grappling hook'],
  'hidden-blade': ['action', `a hooded Assassin in ${ASSASSIN} striking with the hidden blade extended from the wrist bracer`],
  'leap-of-faith': ['action', `a hooded Assassin in ${ASSASSIN} diving off a rooftop beam with arms spread, toward a cart of hay`],
  'templar-informer': ['figure', `a shifty Templar informer in ${TEMPLAR}, peeking from behind a notebook`],
  'templar-enforcer': ['figure', `a burly Templar enforcer in ${TEMPLAR} and a steel breastplate, holding a heavy mace`],
  'machiavelli': ['figure', 'Niccolò Machiavelli, a thin sharp-faced Florentine statesman with short dark hair, in a black scholar’s robe and cap, holding a book and a short sword'],
  'fiammetta-orsetti': ['figure', `Fiammetta Orsetti, an elegant Templar spymistress in a dark green silk gown with a lace collar, a quill and a sealed letter, ${TEMPLAR.replace('a grey cloak over dark clothes, ', '')}`],
  'aldine-press': ['site', 'the Aldine Press printing house in Venice: a narrow canal-side workshop with a dolphin-and-anchor sign and a printing press inside'],
  'forbidden-pamphlet': ['action', 'a hooded figure nailing a forbidden printed pamphlet to a church door at night'],
  'giovanni-bande-nere': ['figure', `Giovanni dalle Bande Nere, a fierce young condottiero in ${BLACK_BAND}, black-plumed helmet under his arm and a sword`],
  'black-band-veteran': ['figure', `a scarred Black Band veteran soldier in ${BLACK_BAND}, holding a pike`],
  'landsknecht': ['figure', `${LANDSKNECHT}, holding a short Katzbalger sword`],
  'landsknecht-pikeman': ['figure', `${LANDSKNECHT}, holding a very long pike upright`],
  'arquebusier': ['figure', 'a Spanish arquebusier in a morion helmet and leather jerkin, aiming a long matchlock arquebus with a smoking match cord'],
  'georg-frundsberg': ['figure', 'Georg von Frundsberg, a stout old German commander with a grey beard in black and gold plate armour and a red feathered beret'],
  'charles-bourbon': ['figure', 'Charles, Duke of Bourbon, a proud French noble commander in a white cloak over ornate silver plate, holding a sword aloft'],
  'falconet-shot': ['action', 'a small bronze falconet cannon on a wheeled carriage firing with a burst of smoke and flame'],
  'pay-or-plunder': ['action', `an angry mutinous ${LANDSKNECHT.replace('a German ', '')} shouting and shaking his fist, with an empty pay chest at his feet`],
  'brother-anselm': ['figure', 'Brother Anselm Kessler, a gaunt fanatical German army chaplain in a black cassock with a red cross stole, preaching with a raised crucifix'],
  'benvenuto-cellini': ['figure', 'Benvenuto Cellini, a cocky young goldsmith with a pointed beard, in a leather apron over a fine doublet, holding a smoking arquebus'],
  'ermanno-vescari': ['figure', 'Count Ermanno Vescari, a cold silver-haired papal treasurer in rich black and crimson robes with a gold chain of office and a Templar ring, holding a ledger'],
  'banco-vescari': ['site', 'a grand Roman counting house with marble columns, iron-bound coin chests and a red cross hidden in the crest above the door'],
  'la-calamita': ['site', 'La Calamita, a Piece of Eden: a jagged lodestone of black iron covered in glowing golden circuitry lines, floating above a carved stone plinth'],
};

/** Battle id → scene subject (16:9 backdrops behind the story). */
export const SCENES = {
  'ink-and-ash': 'a Venetian printing workshop on a narrow canal at night, burning, with smoke rising and gondolas below',
  'the-florentine': 'the Rialto bridge in Venice at dusk, crowded with merchants, a tall scholar in black in the crowd',
  'the-last-copy': 'the Venice Arsenale gate at dawn with its stone lions, a gondola slipping past a great iron chain',
  'city-of-ledgers': 'Florence at sunrise seen from across the Arno: the Duomo, the Palazzo Vecchio tower and the Ponte Vecchio',
  'silk-spider': 'a candlelit Florentine salon with silk curtains, poets and nobles whispering around a lady in green',
  'black-bands': 'a misty Lombardy river ford in autumn, black-armoured cavalry splashing across against German pikemen',
  'governolo': 'the River Po at Governolo in winter dusk, a falconet cannon firing across the water at a defended crossing',
  'dukes-foundry': 'a cannon foundry in Ferrara at night, glowing furnaces, bronze cannon barrels and a castle with a moat behind',
  'pay-or-plunder': 'a muddy Landsknecht army camp outside Bologna at night, campfires, banners and an angry crowd around a drum',
  'florence-spared': 'Florence’s city walls and gates bristling with militia, an army camped on the hills beyond',
  'war-council': 'a huge striped command tent in a military camp at Viterbo at night, maps on a table, lanterns',
  'fog': 'the walls of Rome at dawn in thick white fog, siege ladders against the walls near St. Peter’s',
  'castel-sant-angelo': 'Castel Sant’Angelo in Rome and the raised Passetto corridor running to it, smoke over the city',
  'trastevere': 'Trastevere in Rome burning at night, terracotta rooftops, people escaping over the roofs',
  'the-vault': 'a secret stone vault under the Vatican Belvedere, a broken seal with the Assassin insignia and torchlight',
  'la-calamita': 'St. Peter’s Square in 1527 with a silent crowd around a glowing black lodestone on a plinth by the obelisk',
};

/**
 * The proof set: a few representative subjects, each in the styles and models we want to compare.
 * Review these before generating everything.
 */
export const PROOFS = [
  { id: 'isotta-ferro', kind: 'cards', style: 'figure', model: 'klein' },
  { id: 'isotta-ferro', kind: 'cards', style: 'figure', model: 'dev' },
  { id: 'isotta-ferro', kind: 'cards', style: 'diorama', model: 'klein', base: 'a cobbled Venetian street corner with a mooring post' },
  { id: 'machiavelli', kind: 'cards', style: 'figure', model: 'klein' },
  { id: 'ermanno-vescari', kind: 'cards', style: 'figure', model: 'klein' },
  { id: 'landsknecht-pikeman', kind: 'cards', style: 'figure', model: 'klein' },
  { id: 'aldine-press', kind: 'cards', style: 'site', model: 'klein' },
  { id: 'hidden-blade', kind: 'cards', style: 'action', model: 'klein' },
  { id: 'ink-and-ash', kind: 'scenes', style: 'scene', model: 'klein' },
];

export function promptFor(kind, id, styleOverride, base) {
  if (kind === 'scenes') return { prompt: STYLES.scene(SCENES[id]), aspect: '16:9' };
  const [style, subject] = CARDS[id];
  const s = styleOverride ?? style;
  return { prompt: s === 'diorama' ? STYLES.diorama(subject, base) : STYLES[s](subject), aspect: '4:3' };
}
