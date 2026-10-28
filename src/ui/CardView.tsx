import { SPECIALTY_LABEL } from '../data/cards';
import type { Card } from '../engine/types';
import { cardArt } from './art';

const TYPE_LABEL = { agent: 'Agent', site: 'Site', action: 'Action' } as const;

export function CardView({ card, disabled, selected, onClick }: {
  card: Card;
  disabled?: boolean;
  selected?: boolean;
  onClick?: () => void;
}) {
  const keywords = card.type === 'agent' ? card.keywords ?? [] : [];
  const art = cardArt(card.id);
  return (
    <button
      type="button"
      className={`card spec-${card.specialty}${disabled ? ' is-disabled' : ''}${selected ? ' is-selected' : ''}`}
      onClick={onClick}
    >
      <div className="card-head">
        <span className="card-cost" title="Cost in gold">{card.cost}</span>
        <span className="card-name">{card.name}</span>
      </div>
      {art && <img className="card-art" src={art} alt="" draggable={false} />}
      <div className="card-type">
        {card.unique ? '★ ' : ''}{TYPE_LABEL[card.type]} · {SPECIALTY_LABEL[card.specialty]}
        {card.type === 'action' && card.speed === 'quick' ? ' · Quick' : ''}
      </div>
      {card.type === 'agent' && (
        <div className="card-stats">
          <span title="Strength">♥ {card.strength}</span>
          <span title="Influence">✦ {card.influence}</span>
          {keywords.map((k) => <span key={k} className="kw">{k === 'firstStrike' ? 'First strike' : 'Stealth'}</span>)}
        </div>
      )}
      {card.type === 'site' && card.influence > 0 && (
        <div className="card-stats"><span title="Influence per day">✦ {card.influence}/day</span></div>
      )}
      <div className="card-text">{card.text}</div>
    </button>
  );
}
