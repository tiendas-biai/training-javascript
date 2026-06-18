import { useEffect, useState } from 'react';
import type { DeepDiveMap, Subject } from '../types';
import { loadDeepDives } from '../lib/deepdives';

const cache = new Map<string, DeepDiveMap>();

/** Loads a subject's deep-dive map (dynamic import, cached). Returns null while loading. */
export function useDeepDives(subject: Subject | null): DeepDiveMap | null {
  const [map, setMap] = useState<DeepDiveMap | null>(
    subject ? cache.get(subject.id) ?? null : null,
  );

  useEffect(() => {
    if (!subject) return;
    const cached = cache.get(subject.id);
    if (cached) {
      setMap(cached);
      return;
    }
    let alive = true;
    loadDeepDives(subject.id).then(dd => {
      cache.set(subject.id, dd);
      if (alive) setMap(dd);
    });
    return () => { alive = false; };
  }, [subject]);

  return map;
}
