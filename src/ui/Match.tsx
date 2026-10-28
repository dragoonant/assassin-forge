import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { chooseCommand } from '../ai/heuristic';
import { getCard } from '../data/cards';
import { TICKS_PER_SECOND } from '../engine/config';
import { agentsIn, apply, createMatch, dayOf, dayProgress, hasKeyword, legalTargets, type MatchSetup, tick } from '../engine/engine';
import type { Agent, Command, MatchState, PendingAction, PlayerId, Site, Target } from '../engine/types';
import { CardView } from './CardView';

const HUMAN: PlayerId = 0;
const AI: PlayerId = 1;

type Selection = { kind: 'card'; uid: number } | { kind: 'agent'; uid: number } | null;

export function Match({ setup, aiThinkEvery, onExit }: {
  setup: MatchSetup;
  /** Ticks between AI decisions: lower is a faster, harder opponent. */
  aiThinkEvery: number;
  onExit: () => void;
}) {
  const stateRef = useRef<MatchState | null>(null);
  if (!stateRef.current) stateRef.current = createMatch(setup);
  const s = stateRef.current;
  const [, rerender] = useReducer((x: number) => x + 1, 0);
  const [speed, setSpeed] = useState(1);
  const [selected, setSelected] = useState<Selection>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (speed === 0) return;
    const id = setInterval(() => {
      const st = stateRef.current!;
      if (st.winner !== null) return;
      if (st.tick % aiThinkEvery === 0) {
        const cmd = chooseCommand(st, AI);
        if (cmd) apply(st, cmd);
      }
      tick(st);
      rerender();
    }, 1000 / (TICKS_PER_SECOND * speed));
    return () => clearInterval(id);
  }, [speed, aiThinkEvery]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
      if (e.key === ' ') {
        e.preventDefault();
        setSpeed((v) => (v === 0 ? 1 : 0));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const issue = useCallback((cmd: Command) => {
    const err = apply(stateRef.current!, cmd);
    if (err) setToast(err);
    setSelected(null);
    rerender();
  }, []);

  const me = s.players[HUMAN];
  const selCardInst = selected?.kind === 'card' ? me.hand.find((c) => c.uid === selected.uid) : undefined;
  const selCard = selCardInst && getCard(selCardInst.cardId);
  const selAgent = selected?.kind === 'agent'
    ? s.agents.find((a) => a.uid === selected.uid && a.status === 'ready')
    : undefined;
  const targets: Target[] = selCard ? legalTargets(s, HUMAN, selCard.id) : [];
  const isTarget = (t: Target) => targets.some((x) => JSON.stringify(x) === JSON.stringify(t));

  const onHandCard = (uid: number) => {
    if (s.winner !== null) return;
    if (selected?.kind === 'card' && selected.uid === uid) return setSelected(null);
    const card = getCard(me.hand.find((c) => c.uid === uid)!.cardId);
    if (card.cost > me.gold) return setToast(`${card.name} costs ${card.cost} gold.`);
    if (card.type === 'agent' || (card.type === 'action' && card.target === 'none')) {
      return issue({ type: 'play', player: HUMAN, cardUid: uid });
    }
    if (legalTargets(s, HUMAN, card.id).length === 0) return setToast(`${card.name} has no valid target right now.`);
    setSelected({ kind: 'card', uid });
  };

  const onRegion = (region: number) => {
    if (selAgent) return issue({ type: 'send', player: HUMAN, agentUid: selAgent.uid, region });
    if (selCardInst && isTarget({ kind: 'region', region })) {
      return issue({ type: 'play', player: HUMAN, cardUid: selCardInst.uid, target: { kind: 'region', region } });
    }
  };

  const onAgent = (a: Agent) => {
    if (selCardInst && isTarget({ kind: 'agent', uid: a.uid })) {
      return issue({ type: 'play', player: HUMAN, cardUid: selCardInst.uid, target: { kind: 'agent', uid: a.uid } });
    }
    if (a.owner === HUMAN && a.status === 'ready') {
      setSelected(selAgent?.uid === a.uid ? null : { kind: 'agent', uid: a.uid });
    }
  };

  const onSite = (site: Site) => {
    if (selCardInst && isTarget({ kind: 'site', uid: site.uid })) {
      issue({ type: 'play', player: HUMAN, cardUid: selCardInst.uid, target: { kind: 'site', uid: site.uid } });
    }
  };

  const hint = selAgent
    ? `Choose a region for ${getCard(selAgent.cardId).name} to campaign in.`
    : selCard
      ? `Choose a target for ${selCard.name}. (Esc to cancel)`
      : 'Play cards from your hand. Click a ready agent, then a region, to campaign.';

  const tokenProps = { s, isTarget, selectedUid: selAgent?.uid, onAgent, onSite };

  return (
    <div className="match">
      <header className="topbar">
        <button type="button" className="link" onClick={onExit}>← Menu</button>
        <Timeline s={s} />
        <div className="speed" role="group" aria-label="Speed">
          {[0, 1, 2, 4].map((v) => (
            <button key={v} type="button" className={speed === v ? 'is-on' : ''} onClick={() => setSpeed(v)}>
              {v === 0 ? '❚❚' : `${v}×`}
            </button>
          ))}
        </div>
      </header>

      <PlayerStrip {...tokenProps} p={AI} />

      <section className="regions">
        {s.regions.map((r, i) => {
          const regionTarget = (selAgent && agentsIn(s, i, HUMAN).length < s.config.maxAgentsPerRegion)
            || (selCard && isTarget({ kind: 'region', region: i }));
          return (
            <div
              key={r.name}
              className={`region${regionTarget ? ' is-target' : ''}${r.controller === HUMAN ? ' ctrl-me' : r.controller === AI ? ' ctrl-them' : ''}`}
              onClick={() => onRegion(i)}
            >
              <div className="region-name">
                {r.name}
                {r.controller !== null && <span className="badge">{r.controller === HUMAN ? 'Yours' : 'Theirs'}</span>}
              </div>
              <Lane {...tokenProps} p={AI} region={i} />
              <InfluenceMeter value={r.influence[AI]} cap={s.config.influenceToControl} side="them" />
              <InfluenceMeter value={r.influence[HUMAN]} cap={s.config.influenceToControl} side="me" />
              <Lane {...tokenProps} p={HUMAN} region={i} />
              <PendingList s={s} items={s.pending.filter((x) => x.target.kind === 'region' && x.target.region === i)} />
            </div>
          );
        })}
      </section>

      <PlayerStrip {...tokenProps} p={HUMAN} onReshuffle={() => issue({ type: 'reshuffle', player: HUMAN })} />

      <div className="hint">{toast ? <span className="toast">{toast}</span> : hint}</div>

      <section className="hand">
        {me.hand.map((inst) => {
          const card = getCard(inst.cardId);
          return (
            <CardView
              key={inst.uid}
              card={card}
              disabled={card.cost > me.gold}
              selected={selCardInst?.uid === inst.uid}
              onClick={() => onHandCard(inst.uid)}
            />
          );
        })}
        {me.hand.length === 0 && <div className="empty">Your hand is empty. You draw a card each dusk.</div>}
      </section>

      <LogPanel s={s} />

      {s.winner !== null && (
        <div className="overlay">
          <div className="overlay-box">
            <h2>{s.winner === 'draw' ? 'Draw' : s.winner === HUMAN ? 'Victory' : 'Defeat'}</h2>
            <p>
              {s.winner === 'draw'
                ? 'Neither side could seize the city.'
                : `${s.players[s.winner].name} controls the city after ${dayOf(s) - 1} days.`}
            </p>
            <button type="button" className="primary" onClick={onExit}>Back to menu</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pieces ─────────────────────────────────────────────────────────────────

interface TokenProps {
  s: MatchState;
  isTarget: (t: Target) => boolean;
  selectedUid?: number;
  onAgent: (a: Agent) => void;
  onSite: (site: Site) => void;
}

function Timeline({ s }: { s: MatchState }) {
  const progress = dayProgress(s);
  return (
    <div className="timeline" title="Most things take half a day. Dusk pays income, scores sites and checks for a winner.">
      <span className="day">Day {Math.min(dayOf(s), s.config.maxDays)}<small>/{s.config.maxDays}</small></span>
      <div className="track">
        <div className="half sun">☀</div>
        <div className="half moon">☾</div>
        <div className="cursor" style={{ left: `${progress * 100}%` }} />
      </div>
    </div>
  );
}

function PlayerStrip({ p, onReshuffle, ...tokenProps }: TokenProps & { p: PlayerId; onReshuffle?: () => void }) {
  const { s } = tokenProps;
  const pl = s.players[p];
  const hq = s.agents.filter((a) => a.owner === p && a.status !== 'campaigning');
  const pending = s.pending.filter((x) => x.owner === p && x.target.kind !== 'region');
  return (
    <section className={`strip ${p === HUMAN ? 'me' : 'them'}`}>
      <div className="stats">
        <strong>{pl.name}</strong>
        <span title="Gold (income per day)">● {pl.gold} <small>+{pl.income}/day</small></span>
        <span title="Cards in deck">▤ {pl.deck.length}</span>
        {p === AI && <span title="Cards in hand">✋ {pl.hand.length}</span>}
        {onReshuffle && pl.canReshuffle && (
          <button type="button" className="small" onClick={onReshuffle} title="Once, before your first play">Reshuffle hand</button>
        )}
      </div>
      <div className="hq">
        <span className="label">HQ</span>
        {hq.length === 0 && <span className="muted">no agents</span>}
        {hq.map((a) => <AgentToken key={a.uid} a={a} {...tokenProps} />)}
        <PendingList s={s} items={pending} />
      </div>
    </section>
  );
}

function Lane({ p, region, ...tokenProps }: TokenProps & { p: PlayerId; region: number }) {
  const { s, isTarget, onSite } = tokenProps;
  const sites = s.sites.filter((x) => x.owner === p && x.region === region);
  const agents = agentsIn(s, region, p);
  return (
    <div className={`lane ${p === HUMAN ? 'me' : 'them'}`}>
      <div className="lane-agents">{agents.map((a) => <AgentToken key={a.uid} a={a} {...tokenProps} />)}</div>
      <div className="lane-sites">
        {sites.map((site) => {
          const card = getCard(site.cardId);
          const target = isTarget({ kind: 'site', uid: site.uid });
          return (
            <button
              key={site.uid}
              type="button"
              className={`site spec-${card.specialty}${site.built ? '' : ' building'}${target ? ' is-target' : ''}`}
              title={card.text}
              onClick={(e) => { e.stopPropagation(); onSite(site); }}
            >
              ⌂ {card.name}{site.built ? '' : ' (building)'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AgentToken({ a, s, isTarget, selectedUid, onAgent }: TokenProps & { a: Agent }) {
  const card = getCard(a.cardId);
  const span = Math.max(1, a.until - a.since);
  const progress = a.status === 'ready' ? 1 : Math.min(1, (s.tick - a.since) / span);
  const target = isTarget({ kind: 'agent', uid: a.uid });
  const label = { recruiting: 'recruiting', ready: 'ready', campaigning: 'campaigning', resting: 'resting' }[a.status];
  return (
    <button
      type="button"
      className={`agent ${a.owner === HUMAN ? 'me' : 'them'} st-${a.status} spec-${card.specialty}${target ? ' is-target' : ''}${selectedUid === a.uid ? ' is-selected' : ''}`}
      title={`${card.name}: ${card.text}`}
      onClick={(e) => { e.stopPropagation(); onAgent(a); }}
    >
      <span className="agent-name">{card.name}</span>
      <span className="agent-stats">
        ♥ {a.strength}{a.strength < a.maxStrength ? `/${a.maxStrength}` : ''} ✦ {a.influence}
        {hasKeyword(a, 'stealth') && ' ◌'}{hasKeyword(a, 'firstStrike') && ' ⚔'}
      </span>
      <span className="agent-status">{label}</span>
      {a.status !== 'ready' && <span className="bar"><span style={{ width: `${progress * 100}%` }} /></span>}
    </button>
  );
}

function PendingList({ s, items }: { s: MatchState; items: PendingAction[] }) {
  if (items.length === 0) return null;
  return (
    <div className="pending">
      {items.map((x) => {
        const progress = (s.tick - x.since) / Math.max(1, x.resolveAt - x.since);
        return (
          <span key={x.uid} className={`chip ${x.owner === HUMAN ? 'me' : 'them'}`}>
            ⏳ {getCard(x.cardId).name}
            <span className="bar"><span style={{ width: `${progress * 100}%` }} /></span>
          </span>
        );
      })}
    </div>
  );
}

function InfluenceMeter({ value, cap, side }: { value: number; cap: number; side: 'me' | 'them' }) {
  return (
    <div className={`meter ${side}`} title={`${side === 'me' ? 'Your' : 'Their'} influence: ${value}/${cap}`}>
      {Array.from({ length: cap }, (_, i) => <span key={i} className={i < value ? 'on' : ''} />)}
      <b>{value}</b>
    </div>
  );
}

function LogPanel({ s }: { s: MatchState }) {
  const entries = s.log.slice(-6).reverse();
  return (
    <section className="log" aria-live="polite">
      {entries.map((l, i) => (
        <div key={`${l.tick}-${i}`} className={l.player === HUMAN ? 'me' : l.player === AI ? 'them' : ''}>{l.text}</div>
      ))}
    </section>
  );
}
