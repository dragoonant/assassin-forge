import { getCard } from '../data/cards';
import { DEFAULT_CONFIG, type MatchConfig } from './config';
import { nextRandom } from './rng';
import type {
  ActionCard, Agent, AgentCard, CardInst, Command, Effect, MatchState, PlayerId, PlayerState,
  RegionScope, ScenarioRules, Target,
} from './types';

export interface MatchSetup {
  seed: number;
  decks: [string[], string[]];
  names?: [string, string];
  regions?: string[];
  config?: Partial<MatchConfig>;
  scenario?: ScenarioRules;
}

interface EffectContext {
  owner: PlayerId;
  /** Region the effect happens in (campaign or site region). */
  here?: number;
  target?: Target;
}

export const opponent = (p: PlayerId): PlayerId => (p === 0 ? 1 : 0);

// ── Setup ──────────────────────────────────────────────────────────────────

export function createMatch(setup: MatchSetup): MatchState {
  const config = { ...DEFAULT_CONFIG, ...setup.config };
  const names = setup.names ?? ['Player', 'Opponent'];
  const scenario = setup.scenario ?? {};
  const s: MatchState = {
    tick: 0,
    config,
    scenario,
    rng: setup.seed >>> 0,
    nextUid: 1,
    players: [makePlayer(names[0], config), makePlayer(names[1], config)],
    regions: (setup.regions ?? ['Region I', 'Region II', 'Region III']).map((name) => ({
      name, influence: [0, 0], controller: null,
    })),
    agents: [],
    sites: [],
    pending: [],
    winner: null,
    log: [],
  };
  for (const p of [0, 1] as const) {
    s.players[p].deck = setup.decks[p].map((cardId) => ({ uid: s.nextUid++, cardId }));
    shuffle(s, s.players[p].deck);
    draw(s, p, config.handSize);
    if (scenario.startingGold) s.players[p].gold = scenario.startingGold[p];
    if (scenario.income) s.players[p].income = scenario.income[p];
    scenario.startingInfluence?.[p].forEach((n, region) => {
      if (n > 0 && s.regions[region]) gainInfluence(s, region, p, n);
    });
  }
  for (const x of scenario.startingSites ?? []) {
    s.sites.push({ uid: s.nextUid++, cardId: x.cardId, owner: x.player, region: x.region, built: true, until: 0 });
  }
  for (const x of scenario.startingAgents ?? []) {
    const card = getCard(x.cardId) as AgentCard;
    s.agents.push({
      uid: s.nextUid++, cardId: card.id, owner: x.player, strength: card.strength, maxStrength: card.strength,
      influence: card.influence, status: 'ready', region: null, since: 0, until: 0,
    });
  }
  s.log = [];
  return s;
}

function makePlayer(name: string, config: MatchConfig): PlayerState {
  return { name, gold: config.startingGold, income: config.baseIncome, deck: [], hand: [], archive: [], canReshuffle: true };
}

function shuffle<T>(s: MatchState, arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const [r, next] = nextRandom(s.rng);
    s.rng = next;
    const j = Math.floor(r * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function draw(s: MatchState, p: PlayerId, n: number): number {
  const pl = s.players[p];
  let drawn = 0;
  while (drawn < n && pl.hand.length < s.config.handSize && pl.deck.length > 0) {
    pl.hand.push(pl.deck.pop()!);
    drawn++;
  }
  return drawn;
}

function log(s: MatchState, player: PlayerId | null, text: string): void {
  s.log.push({ tick: s.tick, player, text });
  if (s.log.length > 200) s.log.splice(0, s.log.length - 200);
}

// ── Queries ────────────────────────────────────────────────────────────────

export const dayOf = (s: MatchState): number => Math.floor(s.tick / s.config.ticksPerDay) + 1;
export const dayProgress = (s: MatchState): number => (s.tick % s.config.ticksPerDay) / s.config.ticksPerDay;

export function agentsIn(s: MatchState, region: number, owner?: PlayerId): Agent[] {
  return s.agents.filter((a) => a.status === 'campaigning' && a.region === region && (owner === undefined || a.owner === owner));
}

export function hasKeyword(a: Agent, k: 'stealth' | 'firstStrike'): boolean {
  return (getCard(a.cardId) as AgentCard).keywords?.includes(k) ?? false;
}

/** Every target the card could legally be played on right now (empty = unplayable target-wise). */
export function legalTargets(s: MatchState, p: PlayerId, cardId: string): Target[] {
  const card = getCard(cardId);
  if (card.type === 'agent') return [{ kind: 'none' }];
  if (card.type === 'site') {
    return s.regions
      .map((_, region) => region)
      .filter((region) => s.sites.filter((x) => x.owner === p && x.region === region).length < s.config.maxSitesPerRegion)
      .map((region) => ({ kind: 'region', region }));
  }
  switch (card.target) {
    case 'none':
      return [{ kind: 'none' }];
    case 'region':
      return s.regions.map((_, region) => ({ kind: 'region', region }));
    case 'enemyAgent':
      return s.agents
        .filter((a) => a.owner !== p && a.status !== 'recruiting' && (!card.campaigningOnly || a.status === 'campaigning'))
        .map((a) => ({ kind: 'agent', uid: a.uid }));
    case 'friendlyAgent':
      return s.agents.filter((a) => a.owner === p && a.status !== 'recruiting').map((a) => ({ kind: 'agent', uid: a.uid }));
    case 'enemySite':
      return s.sites.filter((x) => x.owner !== p).map((x) => ({ kind: 'site', uid: x.uid }));
  }
}

const sameTarget = (a: Target, b: Target): boolean => JSON.stringify(a) === JSON.stringify(b);

/** Returns null when the command is legal, otherwise the reason it isn't. */
export function validate(s: MatchState, cmd: Command): string | null {
  if (s.winner !== null) return 'The match is over.';
  const pl = s.players[cmd.player];
  switch (cmd.type) {
    case 'reshuffle':
      return pl.canReshuffle ? null : 'You can only reshuffle once, before playing your first card.';
    case 'send': {
      const a = s.agents.find((x) => x.uid === cmd.agentUid);
      if (!a || a.owner !== cmd.player) return 'No such agent.';
      if (a.status !== 'ready') return 'That agent is not ready.';
      if (!s.regions[cmd.region]) return 'No such region.';
      if (agentsIn(s, cmd.region, cmd.player).length >= s.config.maxAgentsPerRegion) {
        return `At most ${s.config.maxAgentsPerRegion} of your agents can campaign in a region.`;
      }
      return null;
    }
    case 'play': {
      const inst = pl.hand.find((c) => c.uid === cmd.cardUid);
      if (!inst) return 'That card is not in your hand.';
      const card = getCard(inst.cardId);
      if (pl.gold < card.cost) return 'Not enough gold.';
      if (card.type === 'agent') {
        if (s.agents.filter((a) => a.owner === cmd.player).length >= s.config.maxAgentsInPlay) {
          return `You already have ${s.config.maxAgentsInPlay} agents.`;
        }
        if (card.unique && s.agents.some((a) => a.owner === cmd.player && a.cardId === card.id)) {
          return `${card.name} is already in play.`;
        }
        return null;
      }
      const target = cmd.target ?? { kind: 'none' };
      if (!legalTargets(s, cmd.player, card.id).some((t) => sameTarget(t, target))) return 'Invalid target.';
      return null;
    }
  }
}

// ── Commands ───────────────────────────────────────────────────────────────

/** Applies a command if legal. Returns the rejection reason, or null on success. */
export function apply(s: MatchState, cmd: Command): string | null {
  const err = validate(s, cmd);
  if (err) return err;
  const p = cmd.player;
  const pl = s.players[p];
  const { halfDay, quickDelay } = s.config;

  switch (cmd.type) {
    case 'reshuffle':
      pl.deck.push(...pl.hand.splice(0));
      shuffle(s, pl.deck);
      draw(s, p, s.config.handSize);
      pl.canReshuffle = false;
      log(s, p, `${pl.name} reshuffles their hand.`);
      return null;

    case 'send': {
      const a = s.agents.find((x) => x.uid === cmd.agentUid)!;
      a.status = 'campaigning';
      a.region = cmd.region;
      a.since = s.tick;
      a.until = s.tick + halfDay;
      log(s, p, `${getCard(a.cardId).name} campaigns in ${s.regions[cmd.region].name}.`);
      return null;
    }

    case 'play': {
      const idx = pl.hand.findIndex((c) => c.uid === cmd.cardUid);
      const [inst] = pl.hand.splice(idx, 1);
      const card = getCard(inst.cardId);
      pl.gold -= card.cost;
      pl.canReshuffle = false;
      if (card.type === 'agent') {
        s.agents.push({
          uid: inst.uid, cardId: card.id, owner: p, strength: card.strength, maxStrength: card.strength,
          influence: card.influence, status: 'recruiting', region: null, since: s.tick, until: s.tick + halfDay,
        });
        log(s, p, `${pl.name} recruits ${card.name}.`);
      } else if (card.type === 'site') {
        const region = (cmd.target as { region: number }).region;
        s.sites.push({ uid: inst.uid, cardId: card.id, owner: p, region, built: false, until: s.tick + halfDay });
        log(s, p, `${pl.name} begins building ${card.name} in ${s.regions[region].name}.`);
      } else {
        s.pending.push({
          uid: inst.uid, cardId: card.id, owner: p, target: cmd.target ?? { kind: 'none' }, since: s.tick,
          resolveAt: s.tick + (card.speed === 'quick' ? quickDelay : halfDay),
        });
        log(s, p, `${pl.name} plays ${card.name}.`);
      }
      return null;
    }
  }
}

// ── Clock ──────────────────────────────────────────────────────────────────

export function tick(s: MatchState): void {
  if (s.winner !== null) return;
  s.tick++;
  const t = s.tick;

  for (const act of s.pending.filter((x) => x.resolveAt <= t).sort(byUid)) resolveAction(s, act.uid);

  for (const a of s.agents.filter((x) => x.status === 'recruiting' && x.until <= t).sort(byUid)) {
    a.status = 'ready';
    a.since = t;
    log(s, a.owner, `${getCard(a.cardId).name} is ready.`);
    runEffects(s, (getCard(a.cardId) as AgentCard).onArrive, { owner: a.owner });
  }

  const finishing = s.agents
    .filter((x) => x.status === 'campaigning' && x.until <= t)
    .sort((a, b) => a.since - b.since || a.uid - b.uid);
  for (const a of finishing) {
    // An earlier conflict this tick may already have ended this campaign.
    if (a.status === 'campaigning' && s.agents.includes(a)) resolveCampaign(s, a);
  }

  for (const a of s.agents.filter((x) => x.status === 'resting' && x.until <= t)) {
    a.status = 'ready';
    a.since = t;
  }

  for (const site of s.sites.filter((x) => !x.built && x.until <= t).sort(byUid)) {
    site.built = true;
    const card = getCard(site.cardId);
    log(s, site.owner, `${card.name} is built in ${s.regions[site.region].name}.`);
    if (card.type === 'site') runEffects(s, card.onBuild, { owner: site.owner, here: site.region });
  }

  if (t % s.config.ticksPerDay === 0) dusk(s);
}

const byUid = (a: { uid: number }, b: { uid: number }) => a.uid - b.uid;

function dusk(s: MatchState): void {
  const day = s.tick / s.config.ticksPerDay;
  for (const site of [...s.sites].sort(byUid)) {
    if (!site.built || !s.sites.includes(site)) continue;
    const card = getCard(site.cardId);
    if (card.type !== 'site') continue;
    if (card.influence > 0) gainInfluence(s, site.region, site.owner, card.influence);
    runEffects(s, card.daily, { owner: site.owner, here: site.region });
  }
  for (const x of s.scenario.duskEffects ?? []) {
    runEffects(s, x.effects, { owner: x.player });
    log(s, x.player, x.text);
  }

  const controlled = [0, 1].map((p) => s.regions.filter((r) => r.controller === p).length);
  if (controlled[0] >= s.config.regionsToWin || controlled[1] >= s.config.regionsToWin) {
    s.winner = controlled[0] > controlled[1] ? 0 : 1;
  } else if (s.scenario.survive && day >= s.scenario.survive.days) {
    s.winner = s.scenario.survive.player;
  } else if (day >= s.config.maxDays) {
    const total = [0, 1].map((p) => s.regions.reduce((sum, r) => sum + r.influence[p], 0));
    if (controlled[0] !== controlled[1]) s.winner = controlled[0] > controlled[1] ? 0 : 1;
    else if (total[0] !== total[1]) s.winner = total[0] > total[1] ? 0 : 1;
    else s.winner = 'draw';
  }
  if (s.winner !== null) {
    log(s, null, s.winner === 'draw' ? 'The match ends in a draw.' : `${s.players[s.winner].name} wins!`);
    return;
  }

  for (const p of [0, 1] as const) {
    s.players[p].gold += s.players[p].income;
    draw(s, p, 1);
  }
  log(s, null, `Day ${day} ends.`);
}

// ── Agents ─────────────────────────────────────────────────────────────────

function resolveCampaign(s: MatchState, a: Agent): void {
  const region = a.region!;
  const card = getCard(a.cardId) as AgentCard;
  const enemy = hasKeyword(a, 'stealth') || s.scenario.noClashes
    ? undefined
    : agentsIn(s, region, opponent(a.owner))
        .filter((e) => !hasKeyword(e, 'stealth'))
        .sort((x, y) => x.since - y.since || x.uid - y.uid)[0];

  if (enemy) {
    conflict(s, a, enemy);
    return;
  }
  gainInfluence(s, region, a.owner, a.influence);
  log(s, a.owner, `${card.name} gains ${a.influence} influence in ${s.regions[region].name}.`);
  runEffects(s, card.onCampaign, { owner: a.owner, here: region });
  if (s.agents.includes(a)) rest(s, a);
}

function conflict(s: MatchState, a: Agent, b: Agent): void {
  const region = s.regions[a.region!].name;
  log(s, null, `${getCard(a.cardId).name} and ${getCard(b.cardId).name} clash in ${region}.`);
  const aFirst = hasKeyword(a, 'firstStrike');
  const bFirst = hasKeyword(b, 'firstStrike');
  if (aFirst && !bFirst) {
    b.strength -= a.influence;
    if (b.strength > 0) a.strength -= b.influence;
  } else if (bFirst && !aFirst) {
    a.strength -= b.influence;
    if (a.strength > 0) b.strength -= a.influence;
  } else {
    a.strength -= b.influence;
    b.strength -= a.influence;
  }
  for (const x of [a, b]) {
    if (x.strength <= 0) eliminate(s, x);
    else rest(s, x);
  }
}

function rest(s: MatchState, a: Agent): void {
  a.status = 'resting';
  a.region = null;
  a.since = s.tick;
  a.until = s.tick + s.config.halfDay;
}

function eliminate(s: MatchState, a: Agent): void {
  s.agents.splice(s.agents.indexOf(a), 1);
  s.players[a.owner].archive.push({ uid: a.uid, cardId: a.cardId });
  log(s, a.owner, `${getCard(a.cardId).name} is eliminated.`);
}

function damageAgent(s: MatchState, a: Agent, amount: number): void {
  a.strength -= amount;
  if (a.strength <= 0) eliminate(s, a);
}

// ── Influence ──────────────────────────────────────────────────────────────

/** Adds influence; anything above the cap erodes the opponent's influence instead. */
export function gainInfluence(s: MatchState, region: number, p: PlayerId, amount: number): void {
  const r = s.regions[region];
  const cap = s.config.influenceToControl;
  const o = opponent(p);
  let value = r.influence[p] + amount;
  if (value > cap) {
    r.influence[o] = Math.max(0, r.influence[o] - (value - cap));
    value = cap;
  }
  r.influence[p] = value;
  updateControl(s, region, p);
}

export function loseInfluence(s: MatchState, region: number, p: PlayerId, amount: number): void {
  const r = s.regions[region];
  r.influence[p] = Math.max(0, r.influence[p] - amount);
  updateControl(s, region, opponent(p));
}

function updateControl(s: MatchState, region: number, actor: PlayerId): void {
  const r = s.regions[region];
  const cap = s.config.influenceToControl;
  const before = r.controller;
  if (r.controller !== null && r.influence[r.controller] < cap) r.controller = null;
  if (r.controller === null) {
    const at = ([0, 1] as const).filter((p) => r.influence[p] >= cap);
    if (at.length === 1) r.controller = at[0];
    else if (at.length === 2) r.controller = actor;
  }
  if (r.controller !== before) {
    log(s, r.controller, r.controller === null
      ? `${s.players[before!].name} loses control of ${r.name}.`
      : `${s.players[r.controller].name} takes control of ${r.name}.`);
  }
}

// ── Actions & effects ──────────────────────────────────────────────────────

function resolveAction(s: MatchState, uid: number): void {
  const idx = s.pending.findIndex((x) => x.uid === uid);
  const [act] = s.pending.splice(idx, 1);
  const card = getCard(act.cardId) as ActionCard;
  s.players[act.owner].archive.push({ uid: act.uid, cardId: act.cardId });
  if (!legalTargets(s, act.owner, card.id).some((t) => sameTarget(t, act.target))) {
    log(s, act.owner, `${card.name} fizzles: its target is gone.`);
    return;
  }
  log(s, act.owner, `${card.name} resolves.`);
  runEffects(s, card.effects, { owner: act.owner, target: act.target });
}

function scopeRegions(s: MatchState, scope: RegionScope, ctx: EffectContext): number[] {
  if (scope === 'all') return s.regions.map((_, i) => i);
  if (scope === 'here' && ctx.here !== undefined) return [ctx.here];
  if (ctx.target?.kind === 'region') return [ctx.target.region];
  return ctx.here !== undefined ? [ctx.here] : [];
}

function runEffects(s: MatchState, effects: Effect[] | undefined, ctx: EffectContext): void {
  if (!effects) return;
  const me = s.players[ctx.owner];
  const them = s.players[opponent(ctx.owner)];
  const targetAgent = () => (ctx.target?.kind === 'agent' ? s.agents.find((a) => a.uid === (ctx.target as { uid: number }).uid) : undefined);

  for (const e of effects) {
    switch (e.kind) {
      case 'gainGold': me.gold += e.amount; break;
      case 'stealGold': {
        const taken = Math.min(e.amount, them.gold);
        them.gold -= taken;
        me.gold += taken;
        break;
      }
      case 'income': me.income += e.amount; break;
      case 'draw': draw(s, ctx.owner, e.amount); break;
      case 'influence':
        for (const r of scopeRegions(s, e.region, ctx)) gainInfluence(s, r, ctx.owner, e.amount);
        break;
      case 'drain':
        for (const r of scopeRegions(s, e.region, ctx)) loseInfluence(s, r, opponent(ctx.owner), e.amount);
        break;
      case 'damage': {
        const a = targetAgent();
        if (a) damageAgent(s, a, e.amount);
        break;
      }
      case 'heal': {
        const a = targetAgent();
        if (a) a.strength = a.maxStrength;
        break;
      }
      case 'fortify': {
        const a = targetAgent();
        if (a) { a.maxStrength += e.amount; a.strength += e.amount; }
        break;
      }
      case 'recall': {
        const a = targetAgent();
        if (a?.status === 'campaigning') rest(s, a);
        break;
      }
      case 'bounce': {
        const a = targetAgent();
        if (!a) break;
        s.agents.splice(s.agents.indexOf(a), 1);
        const owner = s.players[a.owner];
        const inst: CardInst = { uid: a.uid, cardId: a.cardId };
        if (owner.hand.length < s.config.handSize) owner.hand.push(inst);
        else owner.archive.push(inst);
        log(s, a.owner, `${getCard(a.cardId).name} is sent back to ${owner.name}'s hand.`);
        break;
      }
      case 'destroySite': {
        if (ctx.target?.kind !== 'site') break;
        const uid = ctx.target.uid;
        const site = s.sites.find((x) => x.uid === uid);
        if (!site) break;
        s.sites.splice(s.sites.indexOf(site), 1);
        s.players[site.owner].archive.push({ uid: site.uid, cardId: site.cardId });
        log(s, site.owner, `${getCard(site.cardId).name} is destroyed.`);
        break;
      }
    }
  }
}
