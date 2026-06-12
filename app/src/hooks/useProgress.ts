import { useCallback, useEffect, useState } from 'react';
import type { Progress, ProgressMap } from '../types';
import type { StoredProgressMap } from '../lib/srs';
import { loadProgress, saveProgress, clearProgress } from '../lib/storage';

export function useProgress(storageKey: string) {
  const [progressMap, setProgressMap] = useState<StoredProgressMap>(() => loadProgress(storageKey));

  useEffect(() => {
    setProgressMap(loadProgress(storageKey));
  }, [storageKey]);

  const update = useCallback((id: string, progress: Progress) => {
    setProgressMap(prev => {
      const next = { ...prev, [id]: progress };
      saveProgress(storageKey, next as ProgressMap);
      return next;
    });
  }, [storageKey]);

  const reset = useCallback(() => {
    clearProgress(storageKey);
    setProgressMap({});
  }, [storageKey]);

  return { progressMap, update, reset };
}
