import type { Progress, ProgressMap } from '../types';

// Which of two records for the same card is "newer". Later lastReviewed wins;
// a higher totalSeen breaks ties. A never-reviewed card (lastReviewed null) is
// treated as the oldest, so any real review beats it.
function localIsNewer(local: Progress, remote: Progress): boolean {
  const l = local.lastReviewed ?? -Infinity;
  const r = remote.lastReviewed ?? -Infinity;
  if (l !== r) return l > r;
  return local.totalSeen > remote.totalSeen;
}

// Compares a subject's local progress against what's already in the cloud and
// returns only the cards that should be pushed up: local-only cards, plus
// shared cards where the local record is newer. Cards the cloud already has
// newer (or equal) are left alone, so a sync never regresses cloud data.
export function diffForUpload(local: ProgressMap, remote: ProgressMap): ProgressMap {
  const toUpload: ProgressMap = {};
  for (const [id, localRecord] of Object.entries(local)) {
    const remoteRecord = remote[id];
    if (!remoteRecord || localIsNewer(localRecord, remoteRecord)) {
      toUpload[id] = localRecord;
    }
  }
  return toUpload;
}
