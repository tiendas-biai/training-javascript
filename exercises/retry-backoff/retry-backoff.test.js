const { retryWithBackoff } = require('./retry-backoff');

describe('retryWithBackoff', () => {
    test('resolves on first attempt if fn succeeds', async () => {
        const fn = jest.fn(() => Promise.resolve('ok'));
        const result = await retryWithBackoff(fn, {
            maxAttempts: 3, initialDelay: 100, factor: 2,
        });
        expect(result).toBe('ok');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('retries and resolves when fn succeeds on a later attempt', async () => {
        let attempt = 0;
        const fn = jest.fn(() => {
            attempt++;
            if (attempt < 3) return Promise.reject(new Error(`fail ${attempt}`));
            return Promise.resolve('success');
        });

        const result = await retryWithBackoff(fn, {
            maxAttempts: 5, initialDelay: 50, factor: 2,
        });
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(3);
    });

    test('rejects with last error if all attempts fail', async () => {
        const fn = jest.fn(() => Promise.reject(new Error('always fails')));

        await expect(retryWithBackoff(fn, {
            maxAttempts: 3, initialDelay: 50, factor: 2,
        })).rejects.toThrow('always fails');
        expect(fn).toHaveBeenCalledTimes(3);
    });

    test('no delay before first attempt', async () => {
        const start = Date.now();
        const fn = jest.fn(() => Promise.resolve('fast'));

        await retryWithBackoff(fn, {
            maxAttempts: 3, initialDelay: 1000, factor: 2,
        });
        expect(Date.now() - start).toBeLessThan(50);
    });

    test('delays increase exponentially between retries', async () => {
        const timestamps = [];
        let attempt = 0;
        const fn = jest.fn(() => {
            timestamps.push(Date.now());
            attempt++;
            if (attempt < 4) return Promise.reject(new Error('fail'));
            return Promise.resolve('ok');
        });

        await retryWithBackoff(fn, {
            maxAttempts: 4, initialDelay: 100, factor: 2,
        });

        // Delays should be roughly: 0, 100, 200, 400
        const delays = timestamps.map((t, i) =>
            i === 0 ? 0 : t - timestamps[i - 1]
        );

        expect(delays[0]).toBe(0);
        expect(delays[1]).toBeGreaterThanOrEqual(80);  // ~100ms
        expect(delays[1]).toBeLessThan(150);
        expect(delays[2]).toBeGreaterThanOrEqual(170);  // ~200ms
        expect(delays[2]).toBeLessThan(280);
        expect(delays[3]).toBeGreaterThanOrEqual(350);  // ~400ms
        expect(delays[3]).toBeLessThan(500);
    });

    test('works with maxAttempts of 1 (no retries)', async () => {
        const fn = jest.fn(() => Promise.reject(new Error('fail')));

        await expect(retryWithBackoff(fn, {
            maxAttempts: 1, initialDelay: 100, factor: 2,
        })).rejects.toThrow('fail');
        expect(fn).toHaveBeenCalledTimes(1);
    });
});
