import { syncSubjectToCloud } from './cloudSync';
import type { ProgressStore } from './progress/types';
import type { Progress, ProgressMap } from '../types';
import type { StoredProgressMap } from './srs';

const KEY = 'srs:test';
const p = (id: string, over: Partial<Progress> = {}): Progress => ({
  id, phase: 'review', interval: 5, ease: 2.5, nextDue: 0, lastReviewed: 1000, totalSeen: 3, ...over,
});

// In-memory ProgressStore standing in for the cloud.
function fakeRemote(initial: ProgressMap = {}) {
  const data: ProgressMap = { ...initial };
  const saved: string[] = [];
  const store: ProgressStore = {
    load: async () => data as StoredProgressMap,
    save: async (id, progress) => { data[id] = progress; saved.push(id); },
    reset: async () => { for (const k of Object.keys(data)) delete data[k]; },
  };
  return { store, data, saved };
}

afterEach(() => localStorage.clear());

describe('syncSubjectToCloud', () => {
  test('no-ops when there is no local data', async () => {
    const remote = fakeRemote();
    expect(await syncSubjectToCloud(KEY, remote.store)).toBe(0);
    expect(remote.saved).toEqual([]);
  });

  test('uploads newer local cards, leaves newer cloud cards, then clears local', async () => {
    localStorage.setItem(KEY, JSON.stringify({
      a: p('a', { lastReviewed: 3000 }), // newer than cloud -> upload
      b: p('b', { lastReviewed: 1000 }), // older than cloud -> skip
      c: p('c', { lastReviewed: 1 }),    // local-only -> upload
    }));
    const remote = fakeRemote({
      a: p('a', { lastReviewed: 2000 }),
      b: p('b', { lastReviewed: 5000 }),
    });

    const count = await syncSubjectToCloud(KEY, remote.store);

    expect(count).toBe(2);
    expect(remote.saved.sort()).toEqual(['a', 'c']);
    expect(remote.data.a.lastReviewed).toBe(3000);
    expect(remote.data.b.lastReviewed).toBe(5000); // untouched
    expect(localStorage.getItem(KEY)).toBeNull();   // local cleared after success
  });

  test('migrates legacy local entries before uploading', async () => {
    localStorage.setItem(KEY, JSON.stringify({ a: { id: 'a', box: 3, totalSeen: 4 } }));
    const remote = fakeRemote();

    await syncSubjectToCloud(KEY, remote.store);

    expect(remote.data.a.phase).toBe('review'); // box 3 -> review phase
    expect(remote.data.a.interval).toBe(3);
  });

  test('does not clear local progress if an upload fails', async () => {
    localStorage.setItem(KEY, JSON.stringify({ a: p('a') }));
    const store: ProgressStore = {
      load: async () => ({}),
      save: async () => { throw new Error('network'); },
      reset: async () => {},
    };
    await expect(syncSubjectToCloud(KEY, store)).rejects.toThrow('network');
    expect(localStorage.getItem(KEY)).not.toBeNull();
  });
});
