import type { ProgressMap } from '../types';
import type { StoredProgressMap } from './srs';

export function loadProgress(storageKey: string): StoredProgressMap {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as StoredProgressMap) : {};
  } catch {
    return {};
  }
}

export function saveProgress(storageKey: string, map: ProgressMap): void {
  localStorage.setItem(storageKey, JSON.stringify(map));
}

export function clearProgress(storageKey: string): void {
  localStorage.removeItem(storageKey);
}
