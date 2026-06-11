// One-time migration: progress from the single-subject era lived under 'srs:all'.
// It belongs to the JavaScript subject now.
export function migrateStorageKeys() {
  const legacy = localStorage.getItem('srs:all');
  if (!legacy || localStorage.getItem('srs:javascript')) return;
  localStorage.setItem('srs:javascript', legacy);
  localStorage.removeItem('srs:all');
}
