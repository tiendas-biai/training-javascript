const { withTimeout } = require('./timeout');

describe('withTimeout', () => {
    test('resolves with the result if fn finishes before timeout', async () => {
        const fn = () => new Promise(resolve => setTimeout(() => resolve('done'), 50));
        const result = await withTimeout(fn, 500);
        expect(result).toBe('done');
    });

    test('rejects with timeout error if fn takes too long', async () => {
        const fn = () => new Promise(resolve => setTimeout(() => resolve('done'), 500));
        await expect(withTimeout(fn, 50)).rejects.toThrow('Operation timed out after 50ms');
    });

    test('passes through fn rejection if it happens before timeout', async () => {
        const fn = () => new Promise((_, reject) =>
            setTimeout(() => reject(new Error('db connection failed')), 50)
        );
        await expect(withTimeout(fn, 500)).rejects.toThrow('db connection failed');
    });

    test('timeout error wins over late fn rejection', async () => {
        const fn = () => new Promise((_, reject) =>
            setTimeout(() => reject(new Error('late error')), 500)
        );
        await expect(withTimeout(fn, 50)).rejects.toThrow('Operation timed out after 50ms');
    });

    test('works with instantly resolving functions', async () => {
        const fn = () => Promise.resolve(42);
        const result = await withTimeout(fn, 100);
        expect(result).toBe(42);
    });

    test('works with instantly rejecting functions', async () => {
        const fn = () => Promise.reject(new Error('instant fail'));
        await expect(withTimeout(fn, 100)).rejects.toThrow('instant fail');
    });

    test('timeout error has the correct message format', async () => {
        const fn = () => new Promise(() => {}); // never resolves
        await expect(withTimeout(fn, 200)).rejects.toThrow('Operation timed out after 200ms');
    });

    test('returns the correct type of result', async () => {
        const fn = () => Promise.resolve({ name: 'Alice', age: 30 });
        const result = await withTimeout(fn, 100);
        expect(result).toEqual({ name: 'Alice', age: 30 });
    });
});
