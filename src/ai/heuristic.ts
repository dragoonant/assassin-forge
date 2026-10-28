import { getCard } from '../data/cards';
import { agentsIn, hasKeyword, legalTargets, opponent, validate } from '../engine/engine';
import type { Agent, Card, Command, MatchState, PlayerId, Target } from '../engine/types';

/**
 * A greedy, rule-based opponent. It looks at the board, scores every option it has
 * (send an agent, play a card), and returns the single best command, or null to wait.
 * The match loop decides how often it gets to think, which sets how fast it reacts.
 */
export function chooseCommand(s: MatchState, p: PlayerId): Command | null {
  if (s.winner !== null) return null;
  const pl = s.players[p];

  if (pl.canReshuffle && pl.hand.every((c) => getCard(c.cardId).cost > 2)) {
    return { type: 'reshuffle', player: p };
  }

  const send = bestSend(s, p);
  if (send && send.score > 0.5) return send.cmd;

  const play = bestPlay(s, p);
  if (play && play.score > 1) return play.cmd;
  return null;
}

interface Scored {
  cmd: Command;
  score: number;
}

/** How much this player wants influence in a region right now. */
function regionValue(s: MatchState, p: PlayerId, region: number): number {
  const r = s.regions[region];
  const cap = s.config.influenceToControl;
  const mine = r.influence[p];
  const theirs = r.influence[opponent(p)];
  if (r.controller === p) return theirs >= cap - 3 ? 3 : -2;
  if (r.controller === opponent(p)) return 2 + mine * 0.3;
  return 5 + mine * 0.6 - theirs * 0.2;
}

function bestRegion(s: MatchState, p: PlayerId, regions: number[]): number | undefined {
  return [...regions].sort((a, b) => regionValue(s, p, b) - regionValue(s, p, a))[0];
}

/** Predicts a clash between our agent `a` and enemy `b`, mirroring the engine's conflict rules. */
function clash(a: Agent, b: Agent): { kills: boolean; survives: boolean } {
  const aFirst = hasKeyword(a, 'firstStrike') && !hasKeyword(b, 'firstStrike');
  const bFirst = hasKeyword(b, 'firstStrike') && !hasKeyword(a, 'firstStrike');
  let aStr = a.strength;
  let bStr = b.strength;
  if (aFirst) {
    bStr -= a.influence;
    if (bStr > 0) aStr -= b.influence;
  } else if (bFirst) {
    aStr -= b.influence;
    if (aStr > 0) bStr -= a.influence;
  } else {
    aStr -= b.influence;
    bStr -= a.influence;
  }
  return { kills: bStr <= 0, survives: aStr > 0 };
}

function bestSend(s: MatchState, p: PlayerId): Scored | null {
  let best: Scored | null = null;
  for (const a of s.agents.filter((x) => x.owner === p && x.status === 'ready')) {
    for (let region = 0; region < s.regions.length; region++) {
      const cmd: Command = { type: 'send', player: p, agentUid: a.uid, region };
      if (validate(s, cmd)) continue;
      const enemies = hasKeyword(a, 'stealth')
        ? []
        : agentsIn(s, region, opponent(p)).filter((e) => !hasKeyword(e, 'stealth'));
      let score: number;
      if (enemies.length > 0) {
        // The enemy's campaign finishes first and will clash with ours: we block it.
        const e = [...enemies].sort((x, y) => x.since - y.since)[0];
        const { kills, survives } = clash(a, e);
        score = e.influence * 1.5 + (kills ? 3 + getCard(e.cardId).cost : 0) - (survives ? 0 : 3 + getCard(a.cardId).cost);
      } else {
        score = regionValue(s, p, region) * (a.influence / 2);
      }
      if (!best || score > best.score) best = { cmd, score };
    }
  }
  return best;
}

function bestPlay(s: MatchState, p: PlayerId): Scored | null {
  const pl = s.players[p];
  let best: Scored | null = null;
  for (const inst of pl.hand) {
    const card = getCard(inst.cardId);
    if (card.cost > pl.gold) continue;
    const option = scoreCard(s, p, card);
    if (!option) continue;
    const cmd: Command = { type: 'play', player: p, cardUid: inst.uid, target: option.target };
    if (validate(s, cmd)) continue;
    if (!best || option.score > best.score) best = { cmd, score: option.score };
  }
  return best;
}

function scoreCard(s: MatchState, p: PlayerId, card: Card): { target: Target; score: number } | null {
  const o = opponent(p);
  const daysLeft = s.config.maxDays - s.tick / s.config.ticksPerDay;
  const myAgents = s.agents.filter((a) => a.owner === p);
  const targets = legalTargets(s, p, card.id);
  if (targets.length === 0) return null;

  if (card.type === 'agent') {
    if (myAgents.length >= s.config.maxAgentsInPlay - 1) return null;
    const idle = myAgents.filter((a) => a.status === 'ready').length;
    return { target: { kind: 'none' }, score: 3 + card.influence + card.strength * 0.3 - idle };
  }

  if (card.type === 'site') {
    const regions = targets.flatMap((t) => (t.kind === 'region' ? [t.region] : []));
    const region = bestRegion(s, p, regions);
    if (region === undefined) return null;
    const value = regionValue(s, p, region);
    const score = 1 + Math.min(daysLeft, 8) * 0.25 * (card.influence + (card.daily ? 1 : 0)) + (value > 0 ? 1 : -2);
    return { target: { kind: 'region', region }, score };
  }

  let best: { target: Target; score: number } | null = null;
  for (const target of targets) {
    let score = 0;
    for (const e of card.effects) {
      switch (e.kind) {
        case 'gainGold': score += s.players[p].gold < 3 ? 2.5 : 1.5; break;
        case 'draw': score += s.players[p].hand.length <= 3 ? 2.5 : 0.5; break;
        case 'influence':
          if (target.kind === 'region') score += Math.max(0, regionValue(s, p, target.region)) * e.amount * 0.3;
          break;
        case 'drain':
          if (target.kind === 'region') {
            const r = s.regions[target.region];
            score += Math.min(e.amount, r.influence[o]) * 0.8 + (r.controller === o ? 3 : 0);
          }
          break;
        case 'damage':
        case 'bounce':
        case 'recall': {
          const a = target.kind === 'agent' ? s.agents.find((x) => x.uid === target.uid) : undefined;
          if (!a) break;
          const cost = getCard(a.cardId).cost;
          if (e.kind === 'damage') score += a.strength <= e.amount ? 2 + cost : 0.3;
          else if (e.kind === 'bounce') score += cost * 0.9;
          else score += a.influence * 1.2;
          break;
        }
        case 'heal':
        case 'fortify': {
          const a = target.kind === 'agent' ? s.agents.find((x) => x.uid === target.uid) : undefined;
          if (a) score += a.status === 'campaigning' ? 1.5 : 0.5 + (a.maxStrength - a.strength) * 0.5;
          break;
        }
        case 'destroySite': {
          const site = target.kind === 'site' ? s.sites.find((x) => x.uid === target.uid) : undefined;
          const sc = site && getCard(site.cardId);
          if (sc?.type === 'site') score += 1 + sc.influence * 2 + (sc.daily ? 1 : 0);
          break;
        }
        default: break;
      }
    }
    if (!best || score > best.score) best = { target, score };
  }
  return best;
}
