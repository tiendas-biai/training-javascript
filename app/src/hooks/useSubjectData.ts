import { useEffect, useState } from 'react';
import type { Card, Subject } from '../types';

const cache = new Map<string, Card[]>();

/** Loads a subject's card bank (dynamic import, cached). Returns null while loading. */
export function useSubjectData(subject: Subject | null): Card[] | null {
  const [cards, setCards] = useState<Card[] | null>(
    subject ? cache.get(subject.id) ?? null : null,
  );

  useEffect(() => {
    if (!subject) return;
    const cached = cache.get(subject.id);
    if (cached) {
      setCards(cached);
      return;
    }
    let alive = true;
    subject.loadData().then(mod => {
      cache.set(subject.id, mod.default);
      if (alive) setCards(mod.default);
    });
    return () => { alive = false; };
  }, [subject]);

  return cards;
}
