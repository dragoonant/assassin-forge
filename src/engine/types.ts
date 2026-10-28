import type { MatchConfig } from './config';

export type PlayerId = 0 | 1;
export type Specialty = 'gold' | 'crime' | 'faith' | 'media' | 'order' | 'scholar';
export type Keyword = 'stealth' | 'firstStrike';
export type TargetKind = 'none' | 'region' | 'enemyAgent' | 'friendlyAgent' | 'enemySite';

/**
 * Region scope for influence effects: "here" is the region the effect happens in
 * (a campaign's or a site's region), "target" is an action's chosen region.
 */
export type RegionScope = 'here' | 'target' | 'all';

export type Effect =
  | { kind: 'gainGold'; amount: number }
  | { kind: 'stealGold'; amount: number }
  | { kind: 'income'; amount: number }
  | { kind: 'draw'; amount: number }
  | { kind: 'influence'; amount: number; region: RegionScope }
  | { kind: 'drain'; amount: number; region: RegionScope }
  | { kind: 'damage'; amount: number }
  | { kind: 'heal' }
  | { kind: 'fortify'; amount: number }
  | { kind: 'bounce' }
  | { kind: 'recall' }
  | { kind: 'destroySite' };

interface CardBase {
  id: string;
  name: string;
  specialty: Specialty;
  cost: number;
  text: string;
  unique?: boolean;
}

export interface AgentCard extends CardBase {
  type: 'agent';
  strength: number;
  influence: number;
  keywords?: Keyword[];
  onArrive?: Effect[];
  onCampaign?: Effect[];
}

export interface SiteCard extends CardBase {
  type: 'site';
  influence: number;
  onBuild?: Effect[];
  daily?: Effect[];
}

export interface ActionCard extends CardBase {
  type: 'action';
  target: TargetKind;
  /** Only campaigning agents are valid targets. */
  campaigningOnly?: boolean;
  speed: 'quick' | 'half';
  effects: Effect[];
}

export type Card = AgentCard | SiteCard | ActionCard;

export interface CardInst {
  uid: number;
  cardId: string;
}

export type AgentStatus = 'recruiting' | 'ready' | 'campaigning' | 'resting';

export interface Agent {
  /** Same uid as the card instance, so a bounced agent returns as the same card. */
  uid: number;
  cardId: string;
  owner: PlayerId;
  strength: number;
  maxStrength: number;
  influence: number;
  status: AgentStatus;
  region: number | null;
  /** Tick the current status started. */
  since: number;
  /** Tick the current status ends (unused while ready). */
  until: number;
}

export interface Site {
  uid: number;
  cardId: string;
  owner: PlayerId;
  region: number;
  built: boolean;
  until: number;
}

export type Target =
  | { kind: 'none' }
  | { kind: 'region'; region: number }
  | { kind: 'agent'; uid: number }
  | { kind: 'site'; uid: number };

export interface PendingAction {
  uid: number;
  cardId: string;
  owner: PlayerId;
  target: Target;
  since: number;
  resolveAt: number;
}

export interface PlayerState {
  name: string;
  gold: number;
  income: number;
  deck: CardInst[];
  hand: CardInst[];
  archive: CardInst[];
  canReshuffle: boolean;
}

export interface RegionState {
  name: string;
  influence: [number, number];
  controller: PlayerId | null;
}

export interface LogEntry {
  tick: number;
  player: PlayerId | null;
  text: string;
}

/** Per-battle rule changes used by campaign battles. Everything is optional. */
export interface ScenarioRules {
  /** Influence each player starts with, per region. */
  startingInfluence?: [number[], number[]];
  startingGold?: [number, number];
  income?: [number, number];
  /** Sites already built when the battle starts. */
  startingSites?: { player: PlayerId; cardId: string; region: number }[];
  /** Agents already waiting, ready, at HQ when the battle starts. */
  startingAgents?: { player: PlayerId; cardId: string }[];
  /** Extra effects that run for a player at every dusk, before the win check. */
  duskEffects?: { player: PlayerId; effects: Effect[]; text: string }[];
  /** No campaign can be contested (fog, chaos): agents never clash. */
  noClashes?: boolean;
  /** This player wins if the opponent hasn't won by the dusk of this day. */
  survive?: { player: PlayerId; days: number };
}

export interface MatchState {
  tick: number;
  config: MatchConfig;
  scenario: ScenarioRules;
  rng: number;
  nextUid: number;
  players: [PlayerState, PlayerState];
  regions: RegionState[];
  agents: Agent[];
  sites: Site[];
  pending: PendingAction[];
  winner: PlayerId | 'draw' | null;
  log: LogEntry[];
}

export type Command =
  | { type: 'play'; player: PlayerId; cardUid: number; target?: Target }
  | { type: 'send'; player: PlayerId; agentUid: number; region: number }
  | { type: 'reshuffle'; player: PlayerId };
