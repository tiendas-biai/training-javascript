import { useMemo, useState } from 'react';
import type { MCQCard as MCQCardData, Rating } from '../types';
import { shuffleCopy } from '../lib/shuffle';
import { RichText } from '../components/RichText';
import { CardMeta, type CardInfo } from '../components/badges';
import { GradeButtons } from '../components/GradeButtons';
import { SessionHeader } from '../components/SessionHeader';

interface Props {
  card: MCQCardData;
  remaining: number;
  done?: number;
  cardInfo: CardInfo;
  previews: Record<Rating, string>;
  onGrade: (rating: Rating) => void;
  onExit: () => void;
  flagged?: boolean;
  onToggleFlag?: () => void;
}

export function MCQCard({ card, remaining, done, cardInfo, previews, onGrade, onExit, flagged, onToggleFlag }: Props) {
  const shuffled = useMemo(() => shuffleCopy(card.options), [card]);
  const [picked, setPicked] = useState<string | null>(null);
  const answered = picked !== null;
  const isCorrect = picked === card.answer;

  return (
    <div className="screen">
      <SessionHeader remaining={remaining} done={done} onExit={onExit} flagged={flagged} onToggleFlag={onToggleFlag} />
      <div className="card">
        <CardMeta card={card} cardInfo={cardInfo} />
        <div className="question-text"><RichText text={card.question} /></div>
        <ul className="options-list">
          {shuffled.map(opt => {
            let cls = 'option-btn';
            if (answered) {
              if (opt === card.answer) cls += ' correct';
              else if (opt === picked) cls += ' wrong';
            }
            return (
              <li key={opt}>
                <button className={cls} disabled={answered} onClick={() => setPicked(opt)}>
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
        {answered && (
          <div className="answer-section">
            <p className="answer-label">{isCorrect ? '✓ Correct' : '✗ Incorrect'}</p>
            <div className="explanation-text"><RichText text={card.explanation} /></div>
          </div>
        )}
      </div>
      {answered && <GradeButtons previews={previews} onGrade={onGrade} />}
    </div>
  );
}
