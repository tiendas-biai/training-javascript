import type { Progress } from '../../types';
import type { StoredProgressMap } from '../srs';

// The storage seam: every screen reaches progress through useProgress, which
// talks to one of these. LocalProgressStore (anonymous) and RemoteProgressStore
// (authenticated) are interchangeable behind this interface.
export interface ProgressStore {
  load(): Promise<StoredProgressMap>;          // all progress for this subject
  save(id: string, progress: Progress): Promise<void>;  // upsert one card
  reset(): Promise<void>;                        // clear this subject
}
