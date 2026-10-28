# The Lodestone: campaign story

An original story set in the real history of 1525–1527, ending with the Sack of Rome. The full scripts
(briefings, victory scenes, objectives, decks and handicaps) are in [`src/data/campaign.ts`](../src/data/campaign.ts).

## The premise

Isotta Ferro is a Venetian printer's daughter. Templars burn her father's workshop and kill him while hunting
for a pamphlet: a list of Templars hidden in Italy's banks, churches and armies. Niccolò Machiavelli, Mentor of
the Italian Brotherhood, recruits her. The list leads to **Count Ermanno Vescari**, Treasurer of the Apostolic
Camera, who quietly funds the Emperor's unpaid army. He wants Rome to fall, so that in the chaos he can open a
vault the Brotherhood sealed long ago. Inside is **La Calamita** (the Lodestone), a Piece of Eden that draws
people's wills the way iron draws iron.

The story's theme: *ink wins twice: once when it's printed, and once when it's believed.* Influence, the
game's core resource, is the story's subject too.

## Cast

| Character | Side | Card | Notes |
|---|---|---|---|
| Isotta Ferro | Assassin | Crime agent, stealth, draws cards | Original protagonist |
| Niccolò Machiavelli | Assassin Mentor | Media agent | Historical; dies 21 June 1527 |
| Giovanni dalle Bande Nere | Ally | Order agent, first strike | Historical condottiero; mortally wounded at Governolo, Nov 1526 |
| Benvenuto Cellini | Ally | Gold agent, first strike | Historical goldsmith; claimed he shot Bourbon |
| Pietro "il Gatto" | Ally | Crime agent, stealth | Original Roman rooftop thief |
| Ermanno Vescari | Templar | Gold agent, +2 income | Original antagonist |
| Fiammetta Orsetti | Templar | Media agent, stealth | Original spymistress |
| Brother Anselm Kessler | Templar | Faith agent | Original army chaplain who stirs the mutiny |
| Georg von Frundsberg | Imperial | Order agent | Historical; stroke during the March 1527 mutiny |
| Charles de Bourbon | Imperial | Order agent | Historical; killed on the walls of Rome, 6 May 1527 |

## Battles

| # | Battle | Place, date | What happens | Special rules |
|---|---|---|---|---|
| P1 | Ink and Ash | Venice, 1525 | The print shop burns. Isotta turns the city against the grey cloaks | Tutorial: campaigning |
| P2 | The Florentine | Venice | Machiavelli recruits her and reveals the Templar list | Tutorial: clashes |
| P3 | The Last Copy | Venice | Smuggling the list past the Arsenale | Tutorial: sites and actions; enemy starts with 3 influence in the Arsenale |
| I-1 | A City of Ledgers | Florence, 1526 | Vescari's loans leash Florence | Both sides earn 2 gold a day |
| I-2 | The Silk Spider | Florence | Fiammetta's rumors against Machiavelli | Enemy starts with 3 influence everywhere |
| I-3 | The Black Bands | Lombardy | Riding with Giovanni against the Landsknechte | Black Bands join the deck |
| II-1 | Governolo | River Po, 25 Nov 1526 | Hold the crossing; Giovanni is hit by a falconet | Survive until dusk of day 6 |
| II-2 | The Duke's Foundry | Ferrara | Burning the foundry that cast the guns; Vescari's seal on the payments | Enemy barracks start built |
| II-3 | Pay or Plunder | Outside Bologna, Mar 1527 | Anselm's mutiny; Frundsberg's stroke | Enemy gains 1 influence everywhere each dusk |
| III-1 | Florence Spared | Florence, Apr 1527 | Making Florence look too strong to attack | |
| III-2 | The War Council | Viterbo | Reading Fiammetta's letters: the Lodestone is revealed | You start with 3 gold |
| III-3 | Fog on the Walls | Rome, 6 May 1527 | The assault in the fog; Cellini's shot kills Bourbon | Fog: agents never clash |
| III-4 | Castel Sant'Angelo | Rome, 6 May 1527 | Keeping the Passetto open for the Pope | Survive until dusk of day 7 |
| IV-1 | Trastevere Burns | Rome, May 1527 | Getting families out with il Gatto | Days pass faster |
| IV-2 | The Vault | The Vatican | Racing Vescari to the sealed vault | Fastest-thinking enemy |
| IV-3 | La Calamita | St. Peter's Square | Breaking the Lodestone's hold on the crowd | La Calamita starts built; Sabotage it |

The epilogue plays after the final victory: Machiavelli's death, and Isotta opening a new press.

## Difficulty

`npm run sim:campaign` plays every battle with the heuristic AI in the player's seat. With 150 games per battle,
the player AI wins about 95% of P1, 55–75% through Act I, 40–55% through Acts II–III, and about 30% of the
finale. A human should do better than the heuristic, so treat these numbers as a floor.
