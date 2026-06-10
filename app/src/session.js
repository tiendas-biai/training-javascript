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

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildQueue(allCards, progressMap, filters, mode) {
  let cards = applyFilters(allCards, filters);
  cards = mode === 'srs' ? getDueCards(cards, progressMap) : shuffle(cards);
  return cards.slice(0, 15);
}

export function advance(queue, isCorrect) {
  return isCorrect ? queue.slice(1) : [...queue.slice(1), queue[0]];
}
