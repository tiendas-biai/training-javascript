const { promiseAll } = require('./promise-all');

describe('promiseAll', () => {
  test('resolves with all results in order', async () => {
    const result = await promiseAll([
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3),
    ]);
    expect(result).toEqual([1, 2, 3]);
  });

  test('maintains order even if promises resolve out of order', async () => {
    const result = await promiseAll([
      new Promise(resolve => setTimeout(() => resolve('slow'), 30)),
      Promise.resolve('fast'),
      new Promise(resolve => setTimeout(() => resolve('medium'), 10)),
    ]);
    expect(result).toEqual(['slow', 'fast', 'medium']);
  });

  test('rejects immediately with the first error', async () => {
    await expect(
      promiseAll([
        Promise.resolve(1),
        Promise.reject(new Error('fail')),
        Promise.resolve(3),
      ])
    ).rejects.toThrow('fail');
  });

  test('resolves with an empty array for empty input', async () => {
    const result = await promiseAll([]);
    expect(result).toEqual([]);
  });

  test('handles non-promise values', async () => {
    const result = await promiseAll([1, 'hello', true]);
    expect(result).toEqual([1, 'hello', true]);
  });

  test('rejects with the first rejection when multiple reject', async () => {
    await expect(
      promiseAll([
        Promise.reject(new Error('first')),
        Promise.reject(new Error('second')),
      ])
    ).rejects.toThrow('first');
  });
});
