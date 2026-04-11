const { createAsyncCache } = require('./async-cache');

describe('createAsyncCache', () => {
    test('calls fn on first invocation and returns the result', async () => {
        const fn = jest.fn((key) => Promise.resolve(`data-${key}`));
        const cached = createAsyncCache(fn);

        const result = await cached('alice');
        expect(result).toBe('data-alice');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('returns cached result on second call — does not call fn again', async () => {
        const fn = jest.fn((key) => Promise.resolve(`data-${key}`));
        const cached = createAsyncCache(fn);

        const r1 = await cached('alice');
        const r2 = await cached('alice');
        expect(r1).toBe('data-alice');
        expect(r2).toBe('data-alice');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('deduplicates in-flight calls — returns the same promise', async () => {
        const fn = jest.fn((key) =>
            new Promise(resolve => setTimeout(() => resolve(`data-${key}`), 100))
        );
        const cached = createAsyncCache(fn);

        const p1 = cached('alice');
        const p2 = cached('alice');

        expect(p1).toBe(p2); // same promise object

        const [r1, r2] = await Promise.all([p1, p2]);
        expect(r1).toBe('data-alice');
        expect(r2).toBe('data-alice');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('caches different keys independently', async () => {
        const fn = jest.fn((key) => Promise.resolve(`data-${key}`));
        const cached = createAsyncCache(fn);

        const r1 = await cached('alice');
        const r2 = await cached('bob');
        expect(r1).toBe('data-alice');
        expect(r2).toBe('data-bob');
        expect(fn).toHaveBeenCalledTimes(2);
    });

    test('does not cache rejections — retries on next call', async () => {
        let attempt = 0;
        const fn = jest.fn((key) => {
            attempt++;
            if (attempt === 1) return Promise.reject(new Error('fail'));
            return Promise.resolve(`data-${key}`);
        });
        const cached = createAsyncCache(fn);

        await expect(cached('alice')).rejects.toThrow('fail');
        const result = await cached('alice');
        expect(result).toBe('data-alice');
        expect(fn).toHaveBeenCalledTimes(2);
    });

    test('does not cache rejection — but still deduplicates in-flight failures', async () => {
        const fn = jest.fn((key) =>
            new Promise((_, reject) => setTimeout(() => reject(new Error('fail')), 100))
        );
        const cached = createAsyncCache(fn);

        const p1 = cached('alice');
        const p2 = cached('alice');

        expect(p1).toBe(p2); // same in-flight promise

        await expect(p1).rejects.toThrow('fail');
        await expect(p2).rejects.toThrow('fail');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('after a failure, the next call retries and can succeed', async () => {
        let calls = 0;
        const fn = jest.fn((key) => {
            calls++;
            if (calls <= 1) {
                return new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('fail')), 50)
                );
            }
            return Promise.resolve(`data-${key}`);
        });
        const cached = createAsyncCache(fn);

        await expect(cached('alice')).rejects.toThrow('fail');

        // After failure is resolved, next call should retry
        const result = await cached('alice');
        expect(result).toBe('data-alice');
        expect(fn).toHaveBeenCalledTimes(2);
    });

    test('successful result stays cached even after a long time', async () => {
        const fn = jest.fn((key) => Promise.resolve(`data-${key}`));
        const cached = createAsyncCache(fn);

        await cached('alice');
        await cached('alice');
        await cached('alice');
        await cached('alice');

        expect(fn).toHaveBeenCalledTimes(1);
    });
});
