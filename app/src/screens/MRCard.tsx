import { useMemo, useState } from 'react';
import type { DeepDive as DeepDiveData, MRCard as MRCardData, Rating } from '../types';
import { shuffleCopy } from '../lib/shuffle';
import { RichText } from '../components/RichText';
import { DeepDive } from '../components/DeepDive';
import { CardMeta, type CardInfo } from '../components/badges';
import { GradeButtons } from '../components/GradeButtons';
import { SessionHeader } from '../components/SessionHeader';

interface Props {
  card: MRCardData;
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

export function MRCard({ card, remaining, done, cardInfo, previews, onGrade, onExit, flagged, onToggleFlag, deepDive }: Props) {
  const shuffled = useMemo(() => shuffleCopy(card.options), [card]);
  const required = card.answers.length;
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const answerSet = useMemo(() => new Set(card.answers), [card]);
  const isCorrect = submitted && picked.size === required && [...picked].every(o => answerSet.has(o));

  function toggle(opt: string) {
    setPicked(prev => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      return next;
    });
  }

  return (
    <div className="screen">
      <SessionHeader remaining={remaining} done={done} onExit={onExit} flagged={flagged} onToggleFlag={onToggleFlag} />
      <div className="card">
        <CardMeta card={card} cardInfo={cardInfo} />
        <div className="question-text"><RichText text={card.question} /></div>
        <p className="mr-hint">Select {required}</p>
        <ul className="options-list">
          {shuffled.map(opt => {
            let cls = 'option-btn';
            if (submitted) {
              if (answerSet.has(opt)) cls += ' correct';
              else if (picked.has(opt)) cls += ' wrong';
            } else if (picked.has(opt)) {
              cls += ' selected';
            }
            return (
              <li key={opt}>
                <button className={cls} disabled={submitted} onClick={() => toggle(opt)}>
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
        {!submitted && (
          <button
            id="mr-submit"
            className="btn-show-answer"
            disabled={picked.size !== required}
            onClick={() => setSubmitted(true)}
          >
            Submit
          </button>
        )}
        {submitted && (
          <div className="answer-section">
            <p className="answer-label">{isCorrect ? '✓ Correct' : '✗ Incorrect'}</p>
            <div className="explanation-text"><RichText text={card.explanation} /></div>
          </div>
        )}
      </div>
      {submitted && deepDive && <DeepDive data={deepDive} />}
      {submitted && <GradeButtons previews={previews} onGrade={onGrade} />}
    </div>
  );
}
