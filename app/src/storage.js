const KEY = 'srs:all';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProgress(map) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function clearProgress() {
  localStorage.removeItem(KEY);
}
