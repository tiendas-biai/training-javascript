import { diffForUpload } from './mergeProgress';
import type { Progress, ProgressMap } from '../types';

const p = (id: string, over: Partial<Progress> = {}): Progress => ({
  id, phase: 'review', interval: 5, ease: 2.5, nextDue: 0, lastReviewed: 1000, totalSeen: 3, ...over,
});

describe('diffForUpload', () => {
  test('uploads local-only cards', () => {
    expect(diffForUpload({ a: p('a') }, {})).toEqual({ a: p('a') });
  });

  test('skips cards the cloud already has newer', () => {
    const local: ProgressMap = { a: p('a', { lastReviewed: 1000 }) };
    const remote: ProgressMap = { a: p('a', { lastReviewed: 2000 }) };
    expect(diffForUpload(local, remote)).toEqual({});
  });

  test('uploads cards where local was reviewed more recently', () => {
    const local: ProgressMap = { a: p('a', { lastReviewed: 3000 }) };
    const remote: ProgressMap = { a: p('a', { lastReviewed: 2000 }) };
    expect(diffForUpload(local, remote)).toEqual(local);
  });

  test('breaks lastReviewed ties by higher totalSeen', () => {
    const local: ProgressMap = { a: p('a', { lastReviewed: 1000, totalSeen: 5 }) };
    const remote: ProgressMap = { a: p('a', { lastReviewed: 1000, totalSeen: 2 }) };
    expect(diffForUpload(local, remote)).toEqual(local);
  });

  test('a real review beats a never-reviewed cloud record', () => {
    const local: ProgressMap = { a: p('a', { lastReviewed: 1 }) };
    const remote: ProgressMap = { a: p('a', { lastReviewed: null, totalSeen: 0 }) };
    expect(diffForUpload(local, remote)).toEqual(local);
  });

  test('exact tie keeps the cloud record (no upload)', () => {
    const same = { lastReviewed: 1000, totalSeen: 3 };
    expect(diffForUpload({ a: p('a', same) }, { a: p('a', same) })).toEqual({});
  });
});
