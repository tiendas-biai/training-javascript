import { getDueCards } from './srs.js';

export function getCardType(card) {
  return card.type ?? (card.options ? 'multiple-choice' : 'reveal');
}

export function applyFilters(allCards, filters) {
  return allCards.filter(card => {
    if (filters.topic && card.topic !== filters.topic) return false;
    if (filters.difficulty && card.difficulty !== filters.difficulty) return false;
    if (filters.type && getCardType(card) !== filters.type) return false;
    if (filters.tag && !(card.tags ?? []).includes(filters.tag)) return false;
    return true;
  });
}

export function buildQueue(allCards, progressMap, filters, sessionSize) {
  const filtered = applyFilters(allCards, filters);
  const due = getDueCards(filtered, progressMap);
  return sessionSize === Infinity ? due : due.slice(0, sessionSize);
}

// cardExits=true removes the card; false keeps it cycling.
// When staying, 'hard' re-inserts after 2 positions; 'good' goes to end.
export function advance(queue, cardExits, rating) {
  if (cardExits) return queue.slice(1);
  if (rating === 'hard') {
    const rest = queue.slice(1);
    const at = Math.min(2, rest.length);
    return [...rest.slice(0, at), queue[0], ...rest.slice(at)];
  }
  return [...queue.slice(1), queue[0]];
}