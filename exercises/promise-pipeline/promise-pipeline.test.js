const { pipeline } = require('./promise-pipeline');

describe('pipeline', () => {
    test('chains functions passing output to input', async () => {
        const result = await pipeline([
            (x) => Promise.resolve(x + 1),
            (x) => Promise.resolve(x * 2),
            (x) => Promise.resolve(x + 10),
        ], 5);
        expect(result).toBe(22); // (5+1)*2+10
    });

    test('executes functions in order (sequentially)', async () => {
        const log = [];
        const result = await pipeline([
            (x) => { log.push(`a:${x}`); return Promise.resolve(x + 1); },
            (x) => { log.push(`b:${x}`); return Promise.resolve(x * 3); },
        ], 10);
        expect(result).toBe(33);
        expect(log).toEqual(['a:10', 'b:11']);
    });

    test('returns initialValue for empty functions array', async () => {
        const result = await pipeline([], 42);
        expect(result).toBe(42);
    });

    test('works with a single function', async () => {
        const result = await pipeline([
            (x) => Promise.resolve(x.toUpperCase()),
        ], 'hello');
        expect(result).toBe('HELLO');
    });

    test('rejects if any step fails', async () => {
        await expect(pipeline([
            (x) => Promise.resolve(x + 1),
            (x) => Promise.reject(new Error(`bad value: ${x}`)),
            (x) => Promise.resolve(x * 2),
        ], 5)).rejects.toThrow('bad value: 6');
    });

    test('stops execution after a failure — later functions are not called', async () => {
        const fn3 = jest.fn((x) => Promise.resolve(x));

        await expect(pipeline([
            (x) => Promise.resolve(x),
            (x) => Promise.reject(new Error('stop')),
            fn3,
        ], 1)).rejects.toThrow('stop');

        expect(fn3).not.toHaveBeenCalled();
    });

    test('handles async functions with delays', async () => {
        const result = await pipeline([
            (x) => new Promise(resolve => setTimeout(() => resolve(x * 2), 50)),
            (x) => new Promise(resolve => setTimeout(() => resolve(x + 3), 50)),
        ], 10);
        expect(result).toBe(23); // 10*2+3
    });

    test('works with non-numeric data', async () => {
        const result = await pipeline([
            (arr) => Promise.resolve([...arr, 4]),
            (arr) => Promise.resolve(arr.map(x => x * 2)),
            (arr) => Promise.resolve(arr.filter(x => x > 4)),
        ], [1, 2, 3]);
        expect(result).toEqual([6, 8]); // [1,2,3,4] -> [2,4,6,8] -> [6,8]
    });
});
