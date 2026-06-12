import {
  getOrCreate, grade, graduate, previewIntervals,
  getDueCards, computeStats, getNextDueTime,
} from './srs';
import type { LegacyProgress } from './srs';
import type { Card, Progress } from '../types';

const DAY = 86_400_000;
const NOW = 1_750_000_000_000;

const makeCard = (id: string): Card =>
  ({ id, topic: 'T', subtopic: 'S', difficulty: 'easy', question: 'q', answer: 'a', explanation: 'e', tags: [] });

const learning = (over: Partial<Progress> = {}): Progress =>
  ({ id: 'c1', phase: 'learning', interval: 0, ease: 2.5, nextDue: 0, lastReviewed: null, totalSeen: 0, ...over });

const review = (over: Partial<Progress> = {}): Progress =>
  ({ id: 'c1', phase: 'review', interval: 10, ease: 2.5, nextDue: 0, lastReviewed: NOW - DAY, totalSeen: 5, ...over });

beforeEach(() => {
  jest.spyOn(Date, 'now').mockReturnValue(NOW);
});
afterEach(() => jest.restoreAllMocks());

describe('getOrCreate', () => {
  test('returns a fresh learning card for unknown ids', () => {
    expect(getOrCreate('new-id', {})).toEqual({
      id: 'new-id', phase: 'learning', interval: 0, ease: 2.5,
      nextDue: 0, lastReviewed: null, totalSeen: 0,
    });
  });

  test('passes through current-shape progress untouched', () => {
    const state = review({ id: 'x' });
    expect(getOrCreate('x', { x: state })).toEqual(state);
  });

  test('migrates legacy Leitner box 1 to learning phase', () => {
    const legacy: LegacyProgress = { id: 'x', box: 1, nextDue: 123, lastReviewed: 456, totalSeen: 3 };
    expect(getOrCreate('x', { x: legacy })).toEqual({
      id: 'x', phase: 'learning', interval: 0, ease: 2.5,
      nextDue: 123, lastReviewed: 456, totalSeen: 3,
    });
  });

  test('migrates legacy Leitner box 4 to review with mapped interval', () => {
    const legacy: LegacyProgress = { id: 'x', box: 4, nextDue: 99, totalSeen: 8 };
    const result = getOrCreate('x', { x: legacy });
    expect(result.phase).toBe('review');
    expect(result.interval).toBe(7);
    expect(result.ease).toBe(2.5);
  });
});

describe('grade — learning phase', () => {
  test('easy graduates immediately to review with a 3-day interval', () => {
    const next = grade(learning(), 'easy');
    expect(next.phase).toBe('review');
    expect(next.interval).toBe(3);
    expect(next.nextDue).toBe(NOW + 3 * DAY);
    expect(next.totalSeen).toBe(1);
    expect(next.lastReviewed).toBe(NOW);
  });
});

describe('grade — review phase', () => {
  test('hard multiplies interval by 1.2 and decreases ease', () => {
    const next = grade(review({ interval: 10, ease: 2.5 }), 'hard');
    expect(next.interval).toBe(12);
    expect(next.ease).toBe(2.35);
    expect(next.nextDue).toBe(NOW + 12 * DAY);
  });

  test('hard never drops ease below 1.3', () => {
    const next = grade(review({ ease: 1.35 }), 'hard');
    expect(next.ease).toBe(1.3);
  });

  test('hard keeps a minimum interval of 1 day', () => {
    const next = grade(review({ interval: 0 }), 'hard');
    expect(next.interval).toBe(1);
  });

  test('good multiplies interval by ease', () => {
    const next = grade(review({ interval: 10, ease: 2.5 }), 'good');
    expect(next.interval).toBe(25);
    expect(next.ease).toBe(2.5); // unchanged
    expect(next.nextDue).toBe(NOW + 25 * DAY);
  });

  test('good keeps a minimum interval of 2 days', () => {
    const next = grade(review({ interval: 0 }), 'good');
    expect(next.interval).toBe(2);
  });

  test('easy multiplies interval by ease × 1.3 and increases ease', () => {
    const next = grade(review({ interval: 10, ease: 2.5 }), 'easy');
    expect(next.interval).toBe(33); // round(10 * 2.5 * 1.3)
    expect(next.ease).toBe(2.65);
  });

  test('easy never raises ease above 3.0', () => {
    const next = grade(review({ ease: 2.95 }), 'easy');
    expect(next.ease).toBe(3.0);
  });

  test('grading increments totalSeen and stamps lastReviewed', () => {
    const next = grade(review({ totalSeen: 5 }), 'good');
    expect(next.totalSeen).toBe(6);
    expect(next.lastReviewed).toBe(NOW);
  });
});

describe('graduate', () => {
  test('good graduates with a 2-day interval', () => {
    const next = graduate(learning({ totalSeen: 1 }), 'good');
    expect(next.phase).toBe('review');
    expect(next.interval).toBe(2);
    expect(next.nextDue).toBe(NOW + 2 * DAY);
    expect(next.totalSeen).toBe(2);
  });

  test('easy graduates with a 3-day interval, hard with 1', () => {
    expect(graduate(learning(), 'easy').interval).toBe(3);
    expect(graduate(learning(), 'hard').interval).toBe(1);
  });
});

describe('previewIntervals', () => {
  test('learning phase shows fixed labels', () => {
    expect(previewIntervals(learning())).toEqual({ hard: 'again', good: 'later', easy: '3d' });
  });

  test('review phase computes labels matching grade outcomes', () => {
    const state = review({ interval: 10, ease: 2.5 });
    const previews = previewIntervals(state);
    expect(previews).toEqual({ hard: '12d', good: '25d', easy: '33d' });
    expect(previews.hard).toBe(`${grade(state, 'hard').interval}d`);
    expect(previews.good).toBe(`${grade(state, 'good').interval}d`);
    expect(previews.easy).toBe(`${grade(state, 'easy').interval}d`);
  });
});

describe('getDueCards', () => {
  test('includes new cards, due cards, and migrated legacy cards; excludes future ones', () => {
    const cards = ['new', 'due', 'future', 'legacy-due'].map(makeCard);
    const map = {
      due: review({ id: 'due', nextDue: NOW - 1 }),
      future: review({ id: 'future', nextDue: NOW + DAY }),
      'legacy-due': { id: 'legacy-due', box: 3, nextDue: NOW - 5 } as LegacyProgress,
    };
    const due = getDueCards(cards, map).map(c => c.id).sort();
    expect(due).toEqual(['due', 'legacy-due', 'new']);
  });

  test('shuffles deterministically under mocked random', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0); // swap each i with index 0
    const cards = ['a', 'b', 'c'].map(makeCard);
    const due = getDueCards(cards, {}).map(c => c.id);
    expect(due.sort()).toEqual(['a', 'b', 'c']); // same membership regardless of order
  });
});

describe('computeStats', () => {
  test('counts attempted, mastered, dueToday, and inLearning', () => {
    const cards = ['new', 'learn', 'young', 'mastered'].map(makeCard);
    const map = {
      learn: learning({ id: 'learn', totalSeen: 2, lastReviewed: NOW - DAY }),
      young: review({ id: 'young', interval: 3, nextDue: NOW + DAY }),
      mastered: review({ id: 'mastered', interval: 14, nextDue: NOW + 7 * DAY }),
    };
    expect(computeStats(cards, map)).toEqual({
      total: 4,
      attempted: 3,   // all but 'new' have lastReviewed
      mastered: 1,    // review + interval >= 7
      dueToday: 2,    // 'new' (no state) + 'learn' (nextDue 0)
      inLearning: 1,  // learning + totalSeen > 0
    });
  });
});

describe('getNextDueTime', () => {
  test('returns the soonest future due time', () => {
    const map = {
      a: review({ id: 'a', nextDue: NOW + 3 * DAY }),
      b: review({ id: 'b', nextDue: NOW + DAY }),
      c: review({ id: 'c', nextDue: NOW - DAY }), // past — ignored
    };
    expect(getNextDueTime(map)).toBe(NOW + DAY);
  });

  test('returns null when nothing is scheduled in the future', () => {
    expect(getNextDueTime({})).toBeNull();
    expect(getNextDueTime({ a: review({ nextDue: NOW - 1 }) })).toBeNull();
  });
});
