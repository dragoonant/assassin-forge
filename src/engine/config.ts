export interface MatchConfig {
  ticksPerDay: number;
  /** Duration of most things: recruiting, campaigning, resting, building, slow actions. */
  halfDay: number;
  /** Delay for actions with speed "quick". */
  quickDelay: number;
  startingGold: number;
  baseIncome: number;
  handSize: number;
  influenceToControl: number;
  regionsToWin: number;
  maxAgentsPerRegion: number;
  maxSitesPerRegion: number;
  maxAgentsInPlay: number;
  maxDays: number;
}

export const DEFAULT_CONFIG: MatchConfig = {
  ticksPerDay: 60,
  halfDay: 30,
  quickDelay: 6,
  startingGold: 4,
  baseIncome: 1,
  handSize: 6,
  influenceToControl: 10,
  regionsToWin: 2,
  maxAgentsPerRegion: 2,
  maxSitesPerRegion: 2,
  maxAgentsInPlay: 6,
  maxDays: 20,
};

/** Real-time pacing at 1x speed. */
export const TICKS_PER_SECOND = 6;

export const DECK_RULES = {
  minSize: 30,
  maxSize: 60,
  maxCopies: 3,
  maxSpecialties: 2,
};
