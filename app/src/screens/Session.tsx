import { useRef, useState } from 'react';
import type { Card, Progress, Rating, SessionStats } from '../types';
import type { StoredProgressMap } from '../lib/srs';
import { getOrCreate, grade, graduate, previewIntervals } from '../lib/srs';
import { advance, isMCQ, isMR } from '../lib/session';
import { RevealCard } from './RevealCard';
import { MCQCard } from './MCQCard';
import { MRCard } from './MRCard';
import { Summary } from './Summary';

interface Props {
  initialQueue: Card[];
  progressMap: StoredProgressMap;
  onProgress: (id: string, progress: Progress) => void;
  onRestart: () => void;
  onExit: () => void;
}

export function Session({ initialQueue, progressMap, onProgress, onRestart, onExit }: Props) {
  const [queue, setQueue] = useState<Card[]>(initialQueue);
  const [stats, setStats] = useState<SessionStats>({ reviewed: 0, correct: 0 });
  // Learning streaks are session-scoped bookkeeping, not rendered — a ref avoids
  // re-render churn and stale-closure issues inside the grade handler.
  const streaks = useRef<Record<string, number>>({});

  if (queue.length === 0) {
    return <Summary stats={stats} onAgain={onRestart} onHome={onExit} />;
  }

  const card = queue[0];
  const state = getOrCreate(card.id, progressMap);
  const cardInfo = { phase: state.phase, streak: streaks.current[card.id] ?? 0, interval: state.interval };
  const previews = previewIntervals(state);

  function handleGrade(rating: Rating) {
    const current = getOrCreate(card.id, progressMap);
    let newState: Progress;
    let cardExits = false;

    if (current.phase === 'learning') {
      if (rating === 'easy') {
        newState = grade(current, 'easy');
        cardExits = true;
      } else if (rating === 'good') {
        const streak = (streaks.current[card.id] ?? 0) + 1;
        streaks.current[card.id] = streak;
        if (streak >= 2) {
          newState = graduate(current, 'good');
          cardExits = true;
          delete streaks.current[card.id];
        } else {
          newState = { ...current, totalSeen: current.totalSeen + 1, lastReviewed: Date.now() };
        }
      } else {
        streaks.current[card.id] = 0;
        newState = { ...current, totalSeen: current.totalSeen + 1, lastReviewed: Date.now() };
      }
    } else {
      newState = grade(current, rating);
      cardExits = true;
    }

    onProgress(card.id, newState);
    setStats(s => ({ reviewed: s.reviewed + 1, correct: s.correct + (rating !== 'hard' ? 1 : 0) }));
    setQueue(q => advance(q, cardExits, rating));
  }

  const common = { remaining: queue.length, cardInfo, previews, onGrade: handleGrade, onExit };

  // The key includes the grade count so internal card state (revealed/picked)
  // resets on every new presentation — including a learning card cycling back
  // to the front of a short queue, where card.id alone would be unchanged.
  const presentationKey = `${card.id}:${stats.reviewed}`;
  if (isMCQ(card)) return <MCQCard key={presentationKey} card={card} {...common} />;
  if (isMR(card)) return <MRCard key={presentationKey} card={card} {...common} />;
  return <RevealCard key={presentationKey} card={card} {...common} />;
}
