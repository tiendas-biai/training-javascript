import { loadProgress, saveProgress, clearProgress } from './storage';
import type { ProgressMap } from '../types';

const KEY = 'srs:test';

const sample: ProgressMap = {
  'card-1': { id: 'card-1', phase: 'review', interval: 5, ease: 2.5, nextDue: 123, lastReviewed: 100, totalSeen: 4 },
};

afterEach(() => localStorage.clear());

describe('storage', () => {
  test('save and load round-trip', () => {
    saveProgress(KEY, sample);
    expect(loadProgress(KEY)).toEqual(sample);
  });

  test('returns empty map for a missing key', () => {
    expect(loadProgress('srs:nothing-here')).toEqual({});
  });

  test('returns empty map for corrupt JSON instead of throwing', () => {
    localStorage.setItem(KEY, '{not json!!');
    expect(loadProgress(KEY)).toEqual({});
  });

  test('clearProgress removes only the given key', () => {
    saveProgress(KEY, sample);
    saveProgress('srs:other', sample);
    clearProgress(KEY);
    expect(loadProgress(KEY)).toEqual({});
    expect(loadProgress('srs:other')).toEqual(sample);
  });
});
