const { poll } = require('./poll');

describe('poll', () => {
  test('resolves immediately if condition is met on first call', async () => {
    const fn = jest.fn().mockResolvedValue({ status: 'ready' });
    const condition = (r) => r.status === 'ready';

    const result = await poll(fn, condition, { interval: 10, maxAttempts: 3 });
    expect(result).toEqual({ status: 'ready' });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('polls until condition is met', async () => {
    let count = 0;
    const fn = jest.fn(async () => {
      count++;
      return { status: count >= 3 ? 'ready' : 'pending' };
    });
    const condition = (r) => r.status === 'ready';

    const result = await poll(fn, condition, { interval: 10, maxAttempts: 5 });
    expect(result).toEqual({ status: 'ready' });
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('rejects after maxAttempts if condition is never met', async () => {
    const fn = jest.fn().mockResolvedValue({ status: 'pending' });
    const condition = (r) => r.status === 'ready';

    await expect(
      poll(fn, condition, { interval: 10, maxAttempts: 3 })
    ).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('rejects if fn throws on every attempt', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('network error'));
    const condition = () => true;

    await expect(
      poll(fn, condition, { interval: 10, maxAttempts: 2 })
    ).rejects.toThrow('network error');
  });
});
