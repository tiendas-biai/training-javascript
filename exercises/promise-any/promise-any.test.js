const { promiseAny } = require('./promise-any');

describe('promiseAny', () => {
    test('resolves with the first fulfilled promise', async () => {
        const result = await promiseAny([
            new Promise(resolve => setTimeout(() => resolve('slow'), 100)),
            new Promise(resolve => setTimeout(() => resolve('fast'), 10)),
        ]);
        expect(result).toBe('fast');
    });

    test('ignores rejections if at least one fulfills', async () => {
        const result = await promiseAny([
            Promise.reject(new Error('fail1')),
            Promise.resolve('success'),
            Promise.reject(new Error('fail2')),
        ]);
        expect(result).toBe('success');
    });

    test('rejects with AggregateError if all promises reject', async () => {
        try {
            await promiseAny([
                Promise.reject('err1'),
                Promise.reject('err2'),
                Promise.reject('err3'),
            ]);
            expect(true).toBe(false); // should not reach here
        } catch (err) {
            expect(err).toBeInstanceOf(AggregateError);
            expect(err.errors).toEqual(['err1', 'err2', 'err3']);
        }
    });

    test('AggregateError preserves order of rejections', async () => {
        try {
            await promiseAny([
                new Promise((_, reject) => setTimeout(() => reject('slow'), 100)),
                new Promise((_, reject) => setTimeout(() => reject('fast'), 10)),
            ]);
        } catch (err) {
            expect(err.errors).toEqual(['slow', 'fast']); // input order, not settle order
        }
    });

    test('handles non-promise values', async () => {
        const result = await promiseAny([42, 'hello']);
        expect(result).toBe(42);
    });

    test('rejects with AggregateError for empty array', async () => {
        try {
            await promiseAny([]);
            expect(true).toBe(false);
        } catch (err) {
            expect(err).toBeInstanceOf(AggregateError);
            expect(err.errors).toEqual([]);
        }
    });

    test('resolves even if the first promise rejects and a later one fulfills', async () => {
        const result = await promiseAny([
            new Promise((_, reject) => setTimeout(() => reject('fail'), 10)),
            new Promise(resolve => setTimeout(() => resolve('ok'), 50)),
        ]);
        expect(result).toBe('ok');
    });
});
