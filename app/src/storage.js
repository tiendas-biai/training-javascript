export function loadProgress(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProgress(storageKey, map) {
  localStorage.setItem(storageKey, JSON.stringify(map));
}

export function clearProgress(storageKey) {
  localStorage.removeItem(storageKey);
}
