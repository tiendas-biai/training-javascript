import { useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { listSubjects } from '../lib/subjects';
import { loadProgress } from '../lib/storage';
import { makeApiClient } from '../lib/apiClient';
import { RemoteProgressStore } from '../lib/progress/remoteStore';
import { syncSubjectToCloud } from '../lib/cloudSync';

// One-time, on first authenticated load: if this device has local progress,
// offer to merge it into the account (later-wins per card), then clear it. If
// the user declines, remember that per account so we don't nag on every reload.
export function useCloudSync(): void {
  const { isAuthenticated, isLoading, user, getAccessTokenSilently } = useAuth0();
  const ran = useRef(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || ran.current) return;
    ran.current = true;

    const dismissKey = `srs:cloud-sync-dismissed:${user?.sub ?? ''}`;
    if (localStorage.getItem(dismissKey)) return;

    const pending = listSubjects().filter(
      s => Object.keys(loadProgress(s.storageKey)).length > 0,
    );
    if (pending.length === 0) return;

    if (!window.confirm('Found study progress saved on this device. Sync it to your account?')) {
      localStorage.setItem(dismissKey, '1');
      return;
    }

    const api = makeApiClient(getAccessTokenSilently);
    void (async () => {
      let synced = 0;
      for (const subject of pending) {
        try {
          synced += await syncSubjectToCloud(subject.storageKey, new RemoteProgressStore(subject.id, api));
        } catch (err) {
          console.error('cloud sync failed for', subject.id, err); // keep local data for retry
        }
      }
      // Refresh any mounted useProgress so the merged cloud data shows immediately.
      if (synced > 0) window.location.reload();
    })();
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently]);
}
