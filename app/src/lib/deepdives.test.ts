import { loadDeepDives } from './deepdives';

describe('loadDeepDives', () => {
  test('returns the deep-dive map for a known subject', async () => {
    const map = await loadDeepDives('react');
    expect(map['react-comp-001']).toBeDefined();
    expect(map['react-comp-001'].explanation).toEqual(expect.any(String));
    expect(map['react-comp-001'].resources?.length).toBeGreaterThan(0);
  });

  test('returns an empty map for an unknown subject', async () => {
    expect(await loadDeepDives('does-not-exist')).toEqual({});
  });
});
