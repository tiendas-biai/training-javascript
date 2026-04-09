const { retry } = require('./retry');

describe('retry', () => {
  test('returns the result on first success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await retry(fn, 3);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('retries on failure and returns on eventual success', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('ok');

    const result = await retry(fn, 3);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('throws the last error after all attempts fail', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));

    await expect(retry(fn, 3)).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('only calls fn once if n is 1', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));

    await expect(retry(fn, 1)).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
