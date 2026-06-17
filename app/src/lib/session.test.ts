import { getCardType, applyFilters, buildQueue, advance } from './session';
import type { Card, MCQCard, MRCard, RevealCard } from '../types';

const reveal = (id: string, over: Partial<RevealCard> = {}): Card =>
  ({ id, topic: 'Arrays', subtopic: 'S', difficulty: 'easy', question: 'q', answer: 'a', explanation: 'e', tags: ['map'], ...over });

const mcq = (id: string): MCQCard =>
  ({ id, type: 'multiple-choice', topic: 'Scope', subtopic: 'S', difficulty: 'medium', question: 'q', options: ['A', 'B'], answer: 'A', explanation: 'e', tags: ['mcq'] });

const mr = (id: string): MRCard =>
  ({ id, type: 'multiple-response', topic: 'Async', subtopic: 'S', difficulty: 'hard', question: 'q', options: ['A', 'B', 'C', 'D', 'E'], answers: ['A', 'B'], explanation: 'e', tags: ['mr'] });

describe('getCardType', () => {
  test('explicit type field wins', () => {
    expect(getCardType(mcq('1'))).toBe('multiple-choice');
    expect(getCardType(mr('1'))).toBe('multiple-response');
    expect(getCardType(reveal('1', { type: 'reveal' }))).toBe('reveal');
  });

  test('infers multiple-response from answers array without explicit type', () => {
    const card = { ...mr('1'), type: undefined } as unknown as Card;
    expect(getCardType(card)).toBe('multiple-response');
  });

  test('infers multiple-choice from options without explicit type', () => {
    const card = { ...mcq('1'), type: undefined } as unknown as Card;
    expect(getCardType(card)).toBe('multiple-choice');
  });

  test('defaults to reveal', () => {
    expect(getCardType(reveal('1'))).toBe('reveal');
  });
});

describe('applyFilters', () => {
  const cards: Card[] = [reveal('r1'), mcq('m1'), mr('x1')];

  test('no filters returns everything', () => {
    expect(applyFilters(cards, {})).toHaveLength(3);
  });

  test('filters by topic', () => {
    expect(applyFilters(cards, { topic: 'Scope' }).map(c => c.id)).toEqual(['m1']);
  });

  test('filters by difficulty', () => {
    expect(applyFilters(cards, { difficulty: 'hard' }).map(c => c.id)).toEqual(['x1']);
  });

  test('filters by card type', () => {
    expect(applyFilters(cards, { type: 'multiple-choice' }).map(c => c.id)).toEqual(['m1']);
  });

  test('filters by tag', () => {
    expect(applyFilters(cards, { tag: 'map' }).map(c => c.id)).toEqual(['r1']);
  });

  test('combines filters with AND semantics', () => {
    expect(applyFilters(cards, { topic: 'Async', difficulty: 'hard' }).map(c => c.id)).toEqual(['x1']);
    expect(applyFilters(cards, { topic: 'Async', difficulty: 'easy' })).toHaveLength(0);
  });
});

describe('buildQueue', () => {
  const cards: Card[] = ['a', 'b', 'c', 'd', 'e'].map(id => reveal(id));

  test('caps the queue at sessionSize', () => {
    expect(buildQueue(cards, {}, {}, 3)).toHaveLength(3);
  });

  test('Infinity returns all due cards', () => {
    expect(buildQueue(cards, {}, {}, Infinity)).toHaveLength(5);
  });

  test('applies filters before slicing', () => {
    const mixed: Card[] = [reveal('r1'), mcq('m1'), reveal('r2')];
    const queue = buildQueue(mixed, {}, { topic: 'Arrays' }, 10);
    expect(queue.map(c => c.id).sort()).toEqual(['r1', 'r2']);
  });

  test('practice mode includes not-due cards that normal mode excludes', () => {
    const future = Date.now() + 86_400_000;
    const progress = Object.fromEntries(
      cards.map(c => [c.id, { id: c.id, phase: 'review', interval: 5, ease: 2.5, nextDue: future, lastReviewed: 1, totalSeen: 1 }]),
    );
    expect(buildQueue(cards, progress, {}, Infinity)).toHaveLength(0);
    expect(buildQueue(cards, progress, {}, Infinity, true)).toHaveLength(5);
  });

  test('practice mode still applies filters and caps at sessionSize', () => {
    const mixed: Card[] = [reveal('r1'), mcq('m1'), reveal('r2')];
    expect(buildQueue(mixed, {}, { topic: 'Arrays' }, 1, true)).toHaveLength(1);
    expect(buildQueue(mixed, {}, { topic: 'Scope' }, 10, true).map(c => c.id)).toEqual(['m1']);
  });
});

describe('advance', () => {
  const queue: Card[] = ['a', 'b', 'c', 'd'].map(id => reveal(id));

  test('removes the head when the card exits', () => {
    expect(advance(queue, true, 'good').map(c => c.id)).toEqual(['b', 'c', 'd']);
  });

  test('hard re-inserts the card after 2 positions', () => {
    expect(advance(queue, false, 'hard').map(c => c.id)).toEqual(['b', 'c', 'a', 'd']);
  });

  test('hard clamps the insert position on short queues', () => {
    const short = queue.slice(0, 2); // [a, b]
    expect(advance(short, false, 'hard').map(c => c.id)).toEqual(['b', 'a']);
    expect(advance([queue[0]], false, 'hard').map(c => c.id)).toEqual(['a']);
  });

  test('good cycles the card to the end of the queue', () => {
    expect(advance(queue, false, 'good').map(c => c.id)).toEqual(['b', 'c', 'd', 'a']);
  });
});
