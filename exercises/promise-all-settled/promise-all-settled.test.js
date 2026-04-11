const { promiseAllSettled } = require('./promise-all-settled');

describe('promiseAllSettled', () => {
    test('returns fulfilled results for all resolved promises', async () => {
        const results = await promiseAllSettled([
            Promise.resolve(1),
            Promise.resolve(2),
            Promise.resolve(3),
        ]);
        expect(results).toEqual([
            { status: 'fulfilled', value: 1 },
            { status: 'fulfilled', value: 2 },
            { status: 'fulfilled', value: 3 },
        ]);
    });

    test('returns rejected results for all rejected promises', async () => {
        const err1 = new Error('a');
        const err2 = new Error('b');
        const results = await promiseAllSettled([
            Promise.reject(err1),
            Promise.reject(err2),
        ]);
        expect(results).toEqual([
            { status: 'rejected', reason: err1 },
            { status: 'rejected', reason: err2 },
        ]);
    });

    test('handles mix of resolved and rejected promises', async () => {
        const err = new Error('oops');
        const results = await promiseAllSettled([
            Promise.resolve('ok'),
            Promise.reject(err),
            Promise.resolve(42),
        ]);
        expect(results).toEqual([
            { status: 'fulfilled', value: 'ok' },
            { status: 'rejected', reason: err },
            { status: 'fulfilled', value: 42 },
        ]);
    });

    test('never rejects — even if all promises reject', async () => {
        const results = await promiseAllSettled([
            Promise.reject(new Error('a')),
            Promise.reject(new Error('b')),
        ]);
        expect(results).toHaveLength(2);
        expect(results[0].status).toBe('rejected');
        expect(results[1].status).toBe('rejected');
    });

    test('preserves order regardless of resolve times', async () => {
        const results = await promiseAllSettled([
            new Promise(resolve => setTimeout(() => resolve('slow'), 100)),
            new Promise(resolve => setTimeout(() => resolve('fast'), 10)),
            new Promise((_, reject) => setTimeout(() => reject(new Error('mid')), 50)),
        ]);
        expect(results[0]).toEqual({ status: 'fulfilled', value: 'slow' });
        expect(results[1]).toEqual({ status: 'fulfilled', value: 'fast' });
        expect(results[2]).toEqual({ status: 'rejected', reason: new Error('mid') });
    });

    test('handles non-promise values', async () => {
        const results = await promiseAllSettled([1, 'hello', true]);
        expect(results).toEqual([
            { status: 'fulfilled', value: 1 },
            { status: 'fulfilled', value: 'hello' },
            { status: 'fulfilled', value: true },
        ]);
    });

    test('handles empty array', async () => {
        const results = await promiseAllSettled([]);
        expect(results).toEqual([]);
    });

    test('rejected reason can be any type', async () => {
        const results = await promiseAllSettled([
            Promise.reject('string error'),
            Promise.reject(404),
            Promise.reject(null),
        ]);
        expect(results).toEqual([
            { status: 'rejected', reason: 'string error' },
            { status: 'rejected', reason: 404 },
            { status: 'rejected', reason: null },
        ]);
    });
});
