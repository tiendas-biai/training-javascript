import type { Card, CardType, MCQCard, MRCard, Rating, SessionFilters } from '../types';
import type { StoredProgressMap } from './srs';
import { getDueCards } from './srs';

export function getCardType(card: Card): CardType {
  if (card.type) return card.type;
  if ('answers' in card && card.answers) return 'multiple-response';
  return 'options' in card && card.options ? 'multiple-choice' : 'reveal';
}

export function isMCQ(card: Card): card is MCQCard {
  return getCardType(card) === 'multiple-choice';
}

export function isMR(card: Card): card is MRCard {
  return getCardType(card) === 'multiple-response';
}

export function applyFilters(allCards: Card[], filters: SessionFilters): Card[] {
  return allCards.filter(card => {
    if (filters.topic && card.topic !== filters.topic) return false;
    if (filters.difficulty && card.difficulty !== filters.difficulty) return false;
    if (filters.type && getCardType(card) !== filters.type) return false;
    if (filters.tag && !(card.tags ?? []).includes(filters.tag)) return false;
    return true;
  });
}

export function buildQueue(
  allCards: Card[],
  progressMap: StoredProgressMap,
  filters: SessionFilters,
  sessionSize: number,
): Card[] {
  const filtered = applyFilters(allCards, filters);
  const due = getDueCards(filtered, progressMap);
  return sessionSize === Infinity ? due : due.slice(0, sessionSize);
}

// cardExits=true removes the card; false keeps it cycling.
// When staying, 'hard' re-inserts after 2 positions; 'good' goes to end.
export function advance(queue: Card[], cardExits: boolean, rating: Rating): Card[] {
  if (cardExits) return queue.slice(1);
  if (rating === 'hard') {
    const rest = queue.slice(1);
    const at = Math.min(2, rest.length);
    return [...rest.slice(0, at), queue[0], ...rest.slice(at)];
  }
  return [...queue.slice(1), queue[0]];
}
