const { CircuitBreaker } = require('./circuit-breaker');

describe('CircuitBreaker', () => {
    test('calls fn normally when circuit is closed', async () => {
        const fn = jest.fn(() => Promise.resolve('ok'));
        const breaker = new CircuitBreaker(fn, { maxFailures: 3, cooldownMs: 1000 });

        const result = await breaker.call();
        expect(result).toBe('ok');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('passes arguments to fn', async () => {
        const fn = jest.fn((a, b) => Promise.resolve(a + b));
        const breaker = new CircuitBreaker(fn, { maxFailures: 3, cooldownMs: 1000 });

        const result = await breaker.call(2, 3);
        expect(result).toBe(5);
        expect(fn).toHaveBeenCalledWith(2, 3);
    });

    test('opens circuit after maxFailures consecutive failures', async () => {
        const fn = jest.fn(() => Promise.reject(new Error('fail')));
        const breaker = new CircuitBreaker(fn, { maxFailures: 3, cooldownMs: 1000 });

        await expect(breaker.call()).rejects.toThrow('fail');
        await expect(breaker.call()).rejects.toThrow('fail');
        await expect(breaker.call()).rejects.toThrow('fail');

        // Circuit is now open — should reject without calling fn
        await expect(breaker.call()).rejects.toThrow('Circuit is open');
        expect(fn).toHaveBeenCalledTimes(3); // 4th call didn't reach fn
    });

    test('a success resets the failure count', async () => {
        let attempt = 0;
        const fn = jest.fn(() => {
            attempt++;
            if (attempt === 2) return Promise.resolve('ok');
            return Promise.reject(new Error('fail'));
        });

        const breaker = new CircuitBreaker(fn, { maxFailures: 3, cooldownMs: 1000 });

        await expect(breaker.call()).rejects.toThrow('fail'); // failure 1
        await breaker.call();                                  // success — resets count
        await expect(breaker.call()).rejects.toThrow('fail'); // failure 1 again
        await expect(breaker.call()).rejects.toThrow('fail'); // failure 2

        // Circuit should still be closed (only 2 consecutive failures)
        expect(fn).toHaveBeenCalledTimes(4);
    });

    test('allows a test call after cooldown (half-open)', async () => {
        const fn = jest.fn()
            .mockRejectedValueOnce(new Error('fail'))
            .mockRejectedValueOnce(new Error('fail'))
            .mockRejectedValueOnce(new Error('fail'))
            .mockResolvedValueOnce('recovered');

        const breaker = new CircuitBreaker(fn, { maxFailures: 3, cooldownMs: 100 });

        await expect(breaker.call()).rejects.toThrow('fail');
        await expect(breaker.call()).rejects.toThrow('fail');
        await expect(breaker.call()).rejects.toThrow('fail');

        // Circuit is open
        await expect(breaker.call()).rejects.toThrow('Circuit is open');

        // Wait for cooldown
        await new Promise(resolve => setTimeout(resolve, 150));

        // Should allow a test call (half-open)
        const result = await breaker.call();
        expect(result).toBe('recovered');
        expect(fn).toHaveBeenCalledTimes(4);
    });

    test('re-opens circuit if test call fails in half-open state', async () => {
        const fn = jest.fn(() => Promise.reject(new Error('fail')));
        const breaker = new CircuitBreaker(fn, { maxFailures: 2, cooldownMs: 100 });

        await expect(breaker.call()).rejects.toThrow('fail');
        await expect(breaker.call()).rejects.toThrow('fail');

        // Circuit open
        await expect(breaker.call()).rejects.toThrow('Circuit is open');

        // Wait for cooldown
        await new Promise(resolve => setTimeout(resolve, 150));

        // Half-open: test call fails → circuit re-opens
        await expect(breaker.call()).rejects.toThrow('fail');

        // Should be open again immediately
        await expect(breaker.call()).rejects.toThrow('Circuit is open');
    });

    test('circuit closes after successful test call', async () => {
        let attempt = 0;
        const fn = jest.fn(() => {
            attempt++;
            if (attempt <= 2) return Promise.reject(new Error('fail'));
            return Promise.resolve('ok');
        });

        const breaker = new CircuitBreaker(fn, { maxFailures: 2, cooldownMs: 100 });

        await expect(breaker.call()).rejects.toThrow('fail');
        await expect(breaker.call()).rejects.toThrow('fail');

        await new Promise(resolve => setTimeout(resolve, 150));

        // Test call succeeds → circuit closes
        await breaker.call();

        // Should work normally now
        const result = await breaker.call();
        expect(result).toBe('ok');
    });
});
