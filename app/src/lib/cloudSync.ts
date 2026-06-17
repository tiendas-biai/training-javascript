import type { ProgressMap } from '../types';
import type { ProgressStore } from './progress/types';
import { loadProgress, clearProgress } from './storage';
import { getOrCreate, type StoredProgressMap } from './srs';
import { diffForUpload } from './mergeProgress';

// Normalize a raw stored map (which may hold legacy Leitner entries) into clean
// Progress records, reusing the same migration the app uses everywhere else.
function normalize(raw: StoredProgressMap): ProgressMap {
  const out: ProgressMap = {};
  for (const id of Object.keys(raw)) out[id] = getOrCreate(id, raw);
  return out;
}

// Merge one subject's localStorage progress into the cloud, then clear the local
// copy. Only clears AFTER every upload succeeds, so a failed request keeps the
// local data intact for a retry on the next login (no progress lost).
export async function syncSubjectToCloud(storageKey: string, remote: ProgressStore): Promise<number> {
  const local = normalize(loadProgress(storageKey));
  if (Object.keys(local).length === 0) return 0;

  const remoteMap = normalize(await remote.load());
  const toUpload = diffForUpload(local, remoteMap);

  await Promise.all(
    Object.entries(toUpload).map(([id, progress]) => remote.save(id, progress)),
  );

  clearProgress(storageKey); // local is now fully represented in the cloud
  return Object.keys(toUpload).length;
}
