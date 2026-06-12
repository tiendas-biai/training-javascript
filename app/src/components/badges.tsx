import type { Card } from '../types';
import { getCardType } from '../lib/session';

export function DiffBadge({ difficulty }: { difficulty: string }) {
  return <span className={`badge badge-${difficulty}`}>{difficulty}</span>;
}

export interface CardInfo {
  phase: 'learning' | 'review';
  streak: number;
  interval: number;
}

export function PhaseBadge({ phase, streak, interval }: CardInfo) {
  if (phase === 'learning') {
    return <span className="badge badge-learning">Learning · {streak}/2</span>;
  }
  return <span className="badge badge-review">Review · {interval}d</span>;
}

export function typeLabel(card: Card): string {
  const type = getCardType(card);
  if (type === 'multiple-choice') return 'MCQ';
  if (type === 'multiple-response') return 'Multi';
  return 'reveal';
}

export function CardMeta({ card, cardInfo }: { card: Card; cardInfo?: CardInfo }) {
  return (
    <div className="card-meta">
      <span className="badge">{card.topic}</span>
      <DiffBadge difficulty={card.difficulty} />
      <span className="badge">{typeLabel(card)}</span>
      {cardInfo && <PhaseBadge {...cardInfo} />}
    </div>
  );
}
