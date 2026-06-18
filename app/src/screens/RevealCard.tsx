import { useState } from 'react';
import type { DeepDive as DeepDiveData, Rating, RevealCard as RevealCardData } from '../types';
import { RichText } from '../components/RichText';
import { DeepDive } from '../components/DeepDive';
import { CardMeta, type CardInfo } from '../components/badges';
import { GradeButtons } from '../components/GradeButtons';
import { SessionHeader } from '../components/SessionHeader';

interface Props {
  card: RevealCardData;
  remaining: number;
  done?: number;
  cardInfo: CardInfo;
  previews: Record<Rating, string>;
  onGrade: (rating: Rating) => void;
  onExit: () => void;
  flagged?: boolean;
  onToggleFlag?: () => void;
  deepDive?: DeepDiveData;
}

export function RevealCard({ card, remaining, done, cardInfo, previews, onGrade, onExit, flagged, onToggleFlag, deepDive }: Props) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="screen">
      <SessionHeader remaining={remaining} done={done} onExit={onExit} flagged={flagged} onToggleFlag={onToggleFlag} />
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
      {revealed && deepDive && <DeepDive data={deepDive} />}
      {revealed
        ? <GradeButtons previews={previews} onGrade={onGrade} />
        : <button className="btn-show-answer" onClick={() => setRevealed(true)}>Show Answer</button>}
    </div>
  );
}
