import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { Progress, Subject } from '../types';
import type { StoredProgressMap } from '../lib/srs';
import { loadProgress } from '../lib/storage';
import { makeApiClient } from '../lib/apiClient';
import { LocalProgressStore } from '../lib/progress/localStore';
import { RemoteProgressStore } from '../lib/progress/remoteStore';
import type { ProgressStore } from '../lib/progress/types';

const MAX_RETRIES = 3;

// Optimistic write with bounded backoff retry, so a dropped request (offline,
// token refresh) doesn't lose a grade. The optimistic local state already holds
// the value; this just keeps the backing store eventually consistent.
function saveWithRetry(store: ProgressStore, id: string, progress: Progress, attempt = 0): void {
  store.save(id, progress).catch(err => {
    if (attempt >= MAX_RETRIES) {
      console.error('progress save failed after retries', err);
      return;
    }
    setTimeout(() => saveWithRetry(store, id, progress, attempt + 1), 500 * 2 ** attempt);
  });
}

export function useProgress(subject: Subject) {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  // Anonymous (and the no-Auth0 default) hydrate synchronously from localStorage
  // exactly as before — no loading flash. Authenticated, or auth still settling,
  // starts empty and loads via the effect below.
  const localReady = !isLoading && !isAuthenticated;
  const [progressMap, setProgressMap] = useState<StoredProgressMap>(
    () => (localReady ? loadProgress(subject.storageKey) : {}),
  );
  const [loading, setLoading] = useState(!localReady);

  const store = useMemo<ProgressStore>(
    () =>
      isAuthenticated
        ? new RemoteProgressStore(subject.id, makeApiClient(getAccessTokenSilently))
        : new LocalProgressStore(subject.storageKey),
    [isAuthenticated, subject.id, subject.storageKey, getAccessTokenSilently],
  );

  useEffect(() => {
    if (isLoading) return; // wait for Auth0 to settle before choosing a store
    let alive = true;
    store
      .load()
      .then(m => { if (alive) { setProgressMap(m); setLoading(false); } })
      .catch(() => { if (alive) { setProgressMap({}); setLoading(false); } });
    return () => { alive = false; };
  }, [store, isLoading]);

  const update = useCallback((id: string, progress: Progress) => {
    setProgressMap(prev => ({ ...prev, [id]: progress })); // optimistic
    saveWithRetry(store, id, progress);                    // background persist
  }, [store]);

  const reset = useCallback(() => {
    setProgressMap({});
    void store.reset().catch(err => console.error('progress reset failed', err));
  }, [store]);

  return { progressMap, update, reset, loading };
}
