import type { Progress, ProgressMap } from '../../types';
import type { StoredProgressMap } from '../srs';
import { loadProgress, saveProgress, clearProgress } from '../storage';
import type { ProgressStore } from './types';

// Anonymous path — thin async wrapper over localStorage. Behavior identical to
// pre-auth: localStorage stays the source of truth (re-read on each save so
// concurrent tabs don't clobber the whole map).
export class LocalProgressStore implements ProgressStore {
  constructor(private readonly storageKey: string) {}

  async load(): Promise<StoredProgressMap> {
    return loadProgress(this.storageKey);
  }

  async save(id: string, progress: Progress): Promise<void> {
    const next = { ...loadProgress(this.storageKey), [id]: progress };
    saveProgress(this.storageKey, next as ProgressMap);
  }

  async reset(): Promise<void> {
    clearProgress(this.storageKey);
  }
}
