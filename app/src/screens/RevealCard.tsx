import { useState } from 'react';
import type { Rating, RevealCard as RevealCardData } from '../types';
import { RichText } from '../components/RichText';
import { CardMeta, type CardInfo } from '../components/badges';
import { GradeButtons } from '../components/GradeButtons';
import { SessionHeader } from '../components/SessionHeader';

interface Props {
  card: RevealCardData;
  remaining: number;
  cardInfo: CardInfo;
  previews: Record<Rating, string>;
  onGrade: (rating: Rating) => void;
  onExit: () => void;
}

export function RevealCard({ card, remaining, cardInfo, previews, onGrade, onExit }: Props) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="screen">
      <SessionHeader remaining={remaining} onExit={onExit} />
      <div className="card">
        <CardMeta card={card} cardInfo={cardInfo} />
        <div className="question-text"><RichText text={card.question} /></div>
        {revealed && (
          <div className="answer-section">
            <p className="answer-label">Answer</p>
            <div className="answer-text"><RichText text={card.answer} /></div>
            <div className="explanation-text"><RichText text={card.explanation} /></div>
          </div>
        )}
      </div>
      {revealed
        ? <GradeButtons previews={previews} onGrade={onGrade} />
        : <button className="btn-show-answer" onClick={() => setRevealed(true)}>Show Answer</button>}
    </div>
  );
}
