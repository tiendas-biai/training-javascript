const { batchExecute } = require('./batch-executor');

describe('batchExecute', () => {
    test('runs all tasks and returns results in order', async () => {
        const tasks = [
            () => Promise.resolve(1),
            () => Promise.resolve(2),
            () => Promise.resolve(3),
        ];
        const results = await batchExecute(tasks, 2);
        expect(results).toEqual([1, 2, 3]);
    });

    test('respects batch size — waits for entire batch before starting next', async () => {
        const log = [];

        const makeTask = (id, delay) => () =>
            new Promise(resolve => {
                log.push(`start:${id}`);
                setTimeout(() => {
                    log.push(`end:${id}`);
                    resolve(id);
                }, delay);
            });

        const tasks = [
            makeTask('a', 50),
            makeTask('b', 100),
            makeTask('c', 50),
            makeTask('d', 50),
        ];

        await batchExecute(tasks, 2);

        // Batch 1: a and b start together
        expect(log.indexOf('start:a')).toBeLessThan(log.indexOf('end:a'));
        expect(log.indexOf('start:b')).toBeLessThan(log.indexOf('end:b'));

        // Batch 2 starts AFTER batch 1 finishes (b is the slowest in batch 1)
        expect(log.indexOf('end:b')).toBeLessThan(log.indexOf('start:c'));
        expect(log.indexOf('end:b')).toBeLessThan(log.indexOf('start:d'));
    });

    test('handles batch size larger than tasks array', async () => {
        const tasks = [
            () => Promise.resolve('only'),
            () => Promise.resolve('two'),
        ];
        const results = await batchExecute(tasks, 10);
        expect(results).toEqual(['only', 'two']);
    });

    test('handles batch size of 1 (sequential execution)', async () => {
        const log = [];

        const makeTask = (id) => () =>
            new Promise(resolve => {
                log.push(`start:${id}`);
                setTimeout(() => {
                    log.push(`end:${id}`);
                    resolve(id);
                }, 10);
            });

        const tasks = [makeTask('a'), makeTask('b'), makeTask('c')];
        const results = await batchExecute(tasks, 1);

        expect(results).toEqual(['a', 'b', 'c']);
        // Each task must finish before the next starts
        expect(log).toEqual(['start:a', 'end:a', 'start:b', 'end:b', 'start:c', 'end:c']);
    });

    test('returns empty array for empty tasks', async () => {
        const results = await batchExecute([], 3);
        expect(results).toEqual([]);
    });

    test('rejects immediately if any task fails', async () => {
        const tasks = [
            () => Promise.resolve(1),
            () => Promise.reject(new Error('boom')),
            () => Promise.resolve(3),
        ];

        await expect(batchExecute(tasks, 3)).rejects.toThrow('boom');
    });

    test('preserves result order even with different resolve times', async () => {
        const tasks = [
            () => new Promise(resolve => setTimeout(() => resolve('slow'), 100)),
            () => new Promise(resolve => setTimeout(() => resolve('fast'), 10)),
            () => new Promise(resolve => setTimeout(() => resolve('medium'), 50)),
        ];

        const results = await batchExecute(tasks, 3);
        expect(results).toEqual(['slow', 'fast', 'medium']);
    });

    test('does not start tasks from the next batch early', async () => {
        let running = 0;
        let maxRunning = 0;

        const makeTask = (delay) => () =>
            new Promise(resolve => {
                running++;
                maxRunning = Math.max(maxRunning, running);
                setTimeout(() => {
                    running--;
                    resolve();
                }, delay);
            });

        const tasks = [
            makeTask(50), makeTask(50),
            makeTask(50), makeTask(50),
            makeTask(50),
        ];

        await batchExecute(tasks, 2);
        expect(maxRunning).toBe(2);
    });
});
