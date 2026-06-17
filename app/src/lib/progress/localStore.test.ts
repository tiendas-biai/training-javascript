import { LocalProgressStore } from './localStore';
import type { Progress } from '../../types';

const KEY = 'srs:test';
const p = (id: string, over: Partial<Progress> = {}): Progress => ({
  id, phase: 'review', interval: 5, ease: 2.5, nextDue: 0, lastReviewed: null, totalSeen: 1, ...over,
});

afterEach(() => localStorage.clear());

describe('LocalProgressStore', () => {
  test('load returns {} when nothing stored', async () => {
    expect(await new LocalProgressStore(KEY).load()).toEqual({});
  });

  test('save upserts one card and load reads it back', async () => {
    const store = new LocalProgressStore(KEY);
    await store.save('c1', p('c1'));
    await store.save('c2', p('c2', { interval: 9 }));
    expect(await store.load()).toEqual({ c1: p('c1'), c2: p('c2', { interval: 9 }) });
  });

  test('save merges against the latest persisted map (no clobber across instances)', async () => {
    await new LocalProgressStore(KEY).save('c1', p('c1'));
    // A separate instance (e.g. another tab) must not wipe c1 when writing c2.
    await new LocalProgressStore(KEY).save('c2', p('c2'));
    expect(Object.keys(await new LocalProgressStore(KEY).load())).toEqual(['c1', 'c2']);
  });

  test('reset clears the subject', async () => {
    const store = new LocalProgressStore(KEY);
    await store.save('c1', p('c1'));
    await store.reset();
    expect(await store.load()).toEqual({});
  });
});
