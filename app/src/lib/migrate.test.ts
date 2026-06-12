import { migrateStorageKeys } from './migrate';

const LEGACY = 'srs:all';
const TARGET = 'srs:javascript';
const payload = JSON.stringify({ 'card-1': { id: 'card-1', phase: 'review' } });

afterEach(() => localStorage.clear());

describe('migrateStorageKeys', () => {
  test('moves srs:all to srs:javascript and removes the legacy key', () => {
    localStorage.setItem(LEGACY, payload);
    migrateStorageKeys();
    expect(localStorage.getItem(TARGET)).toBe(payload);
    expect(localStorage.getItem(LEGACY)).toBeNull();
  });

  test('does nothing when there is no legacy data', () => {
    migrateStorageKeys();
    expect(localStorage.getItem(TARGET)).toBeNull();
  });

  test('never overwrites existing srs:javascript progress', () => {
    const existing = JSON.stringify({ 'card-2': { id: 'card-2', phase: 'learning' } });
    localStorage.setItem(TARGET, existing);
    localStorage.setItem(LEGACY, payload);
    migrateStorageKeys();
    expect(localStorage.getItem(TARGET)).toBe(existing); // untouched
    expect(localStorage.getItem(LEGACY)).toBe(payload);  // left in place
  });

  test('is idempotent across repeated boots', () => {
    localStorage.setItem(LEGACY, payload);
    migrateStorageKeys();
    migrateStorageKeys();
    expect(localStorage.getItem(TARGET)).toBe(payload);
  });
});
